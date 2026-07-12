import { Clipboard, closeMainWindow } from "@raycast/api";

export async function replaceText(text: string) {
  await closeMainWindow();
  await Clipboard.paste(text);
}
