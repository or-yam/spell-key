import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { environment } from "@raycast/api";

const MAX_WORD_LENGTH = "pneumonoultramicroscopicsilicovolcanoconiosis".length;

export class BinaryNotFoundError extends Error {
  constructor(binaryPath: string) {
    super(`Native spell check binary not found at: ${binaryPath}`);
    this.name = "BinaryNotFoundError";
  }
}

export class SpellCheckError extends Error {
  constructor(
    message: string,
    public readonly exitCode?: number | null,
  ) {
    super(`Spell check failed: ${message}`);
    this.name = "SpellCheckError";
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(`Invalid input: ${message}`);
    this.name = "InvalidInputError";
  }
}

function spawnAsync(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = "";
    let stderr = "";

    process.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new SpellCheckError(stderr || `Process exited with code ${code}`, code));
      }
    });

    process.on("error", (error) => {
      reject(new SpellCheckError(`Failed to spawn process: ${error.message}`));
    });
  });
}

export async function getSpellingSuggestions(word: string): Promise<string[]> {
  const trimmedWord = word.trim();

  if (!trimmedWord || trimmedWord.length === 0) {
    throw new InvalidInputError("Word cannot be empty");
  }

  if (trimmedWord.length > MAX_WORD_LENGTH) {
    throw new InvalidInputError("Word is too long");
  }

  const binaryPath = join(environment.assetsPath, "spellcheck-native");

  try {
    try {
      await access(binaryPath);
    } catch {
      throw new BinaryNotFoundError(binaryPath);
    }

    const { stdout } = await spawnAsync(binaryPath, [trimmedWord]);

    if (!stdout) {
      return [];
    }

    const suggestions = stdout.split(/,\s*/).filter(Boolean);
    return suggestions;
  } catch (error) {
    if (
      error instanceof InvalidInputError ||
      error instanceof BinaryNotFoundError ||
      error instanceof SpellCheckError
    ) {
      throw error;
    }

    throw new SpellCheckError(error instanceof Error ? error.message : "Unknown error occurred");
  }
}
