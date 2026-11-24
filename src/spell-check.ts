import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { environment } from "@raycast/api";

const runHelper = promisify(execFile);
const MAX_SELECTION_LENGTH = 1024;

type SpellCheckResult = { status: "correct" | "invalid-selection" } | { status: "misspelled"; suggestions: string[] };

export async function checkSpelling(selection: string): Promise<SpellCheckResult> {
  if (selection.length > MAX_SELECTION_LENGTH || selection.includes("\0")) {
    return { status: "invalid-selection" };
  }

  let stdout: string;
  try {
    ({ stdout } = await runHelper(join(environment.assetsPath, "spellcheck-native"), [selection], {
      encoding: "utf8",
    }));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error("Missing executable. Rebuild the native spell-check helper.");
    }
    throw new Error("Could not run the native spell-check helper.");
  }

  let result: unknown;
  try {
    result = JSON.parse(stdout);
  } catch {
    throw new Error("The native spell-check helper returned an invalid result.");
  }
  if (result && typeof result === "object" && "status" in result) {
    if (result.status === "correct" || result.status === "invalid-selection") {
      return { status: result.status };
    }

    if (
      result.status === "misspelled" &&
      "suggestions" in result &&
      Array.isArray(result.suggestions) &&
      result.suggestions.every((suggestion: unknown) => typeof suggestion === "string" && suggestion.trim())
    ) {
      return { status: "misspelled", suggestions: result.suggestions };
    }
  }

  throw new Error("The native spell-check helper returned an invalid result.");
}
