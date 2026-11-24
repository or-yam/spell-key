import { Clipboard, closeMainWindow, confirmAlert, popToRoot, PopToRootType, showHUD } from "@raycast/api";

export async function replaceText(text: string) {
  try {
    await closeMainWindow({ popToRootType: PopToRootType.Suspended });
    await Clipboard.paste(text, { closeMainWindow: false });
  } catch {
    const shouldCopy = await confirmAlert({
      title: "Couldn’t replace selection",
      message: "You can copy the correction and paste it in your app.",
      primaryAction: { title: "Copy Correction" },
      dismissAction: { title: "Dismiss" },
    });
    if (shouldCopy) await copySuggestion(text);
  } finally {
    await popToRoot();
  }
}

export async function copySuggestion(text: string) {
  await Clipboard.copy(text);
  await showHUD(`Copied “${text}”`);
}
