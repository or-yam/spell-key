import { Clipboard, closeMainWindow, popToRoot, PopToRootType, showHUD } from "@raycast/api";

export async function replaceText(text: string) {
  await closeMainWindow({ popToRootType: PopToRootType.Suspended });
  try {
    await Clipboard.paste(text, { closeMainWindow: false });
  } finally {
    await popToRoot();
  }
}

export async function copySuggestion(text: string) {
  await Clipboard.copy(text);
  await showHUD(`Copied “${text}”`);
}
