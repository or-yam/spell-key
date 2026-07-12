import { Clipboard, closeMainWindow, showHUD } from "@raycast/api";

export async function replaceText(text: string) {
  await closeMainWindow();
  await Clipboard.paste(text);
}

export async function copySuggestion(text: string) {
  await Clipboard.copy(text);
  await showHUD(`Copied “${text}”`);
}
