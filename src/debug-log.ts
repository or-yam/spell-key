import { environment } from "@raycast/api";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const MAX_PREVIEW_LENGTH = 160;
const debugLogPaths = [
  join(environment.supportPath, "debug.log"),
  "/Users/oryam/Developer/spell-key/.debug/raycast-debug.log",
];

export function describeText(text: string | undefined | null) {
  if (text == null) {
    return {
      state: "missing",
      length: 0,
      trimmedLength: 0,
      preview: "",
    };
  }

  return {
    state: "present",
    length: text.length,
    trimmedLength: text.trim().length,
    preview: text.slice(0, MAX_PREVIEW_LENGTH),
  };
}

export function logDebug(event: string, payload?: Record<string, unknown>) {
  const entry = {
    at: new Date().toISOString(),
    event,
    environment: {
      raycastVersion: environment.raycastVersion,
      extensionName: environment.extensionName,
      commandName: environment.commandName,
      commandMode: environment.commandMode,
      isDevelopment: environment.isDevelopment,
      launchType: environment.launchType,
      supportPath: environment.supportPath,
    },
    ...payload,
  };

  console.log(`[spell-key-debug] ${event}`, entry);
  appendDebugEntry(entry);
}

function appendDebugEntry(entry: Record<string, unknown>) {
  const line = `${JSON.stringify(entry)}\n`;

  for (const debugLogPath of debugLogPaths) {
    try {
      mkdirSync(dirname(debugLogPath), { recursive: true });
      appendFileSync(debugLogPath, line, "utf8");
    } catch (error) {
      console.error("[spell-key-debug] failed to write debug log", { debugLogPath, error });
    }
  }
}
