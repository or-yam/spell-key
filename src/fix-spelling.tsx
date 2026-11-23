import { ActionPanel, Action, Icon, Keyboard, List } from "@raycast/api";
import { useRef } from "react";
import { copySuggestion, replaceText } from "./replace-text";
import { useFixSpelling } from "./useFixSpelling";

export default function Command() {
  const { list, word, error, status } = useFixSpelling();
  const replacing = useRef(false);

  async function replaceOnce(text: string) {
    if (replacing.current) return;
    replacing.current = true;
    await replaceText(text);
  }

  if (status === "error") {
    return (
      <List>
        <List.EmptyView title="Couldn’t check spelling" description={error ?? "Unknown error occurred"} />
      </List>
    );
  }

  return (
    <List
      isLoading={status === "loading"}
      searchBarPlaceholder={word ? `Suggestions for: “${word}”` : "Spelling suggestions"}
    >
      {status === "no-selection" ? (
        <List.EmptyView
          icon={Icon.TextCursor}
          title="No text selected"
          description="Select a word in your app, then relaunch Fix Spelling."
        />
      ) : status === "loading" ? (
        <List.EmptyView title="Checking spelling…" />
      ) : status === "no-suggestions" ? (
        <List.EmptyView
          icon={Icon.CheckCircle}
          title="No spelling corrections found"
          description={word ? `“${word}” has no suggestions.` : undefined}
        />
      ) : (
        <List.Section
          title={`Suggestions for “${word}”`}
          subtitle="Wrong word? Reselect it in your app and relaunch Fix Spelling."
        >
          {list.map((item) => (
            <List.Item
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              actions={
                <ActionPanel>
                  <Action
                    title="Replace Selected Text"
                    icon={Icon.TextCursor}
                    onAction={() => replaceOnce(typeof item.title === "string" ? item.title : item.title.value)}
                  />
                  <Action
                    title="Copy Suggestion"
                    icon={Icon.Clipboard}
                    shortcut={Keyboard.Shortcut.Common.Copy}
                    onAction={() => {
                      copySuggestion(typeof item.title === "string" ? item.title : item.title.value);
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
