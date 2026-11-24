import { ActionPanel, Action, Icon, Keyboard, List } from "@raycast/api";
import { useRef } from "react";
import { copySuggestion, replaceText } from "./replace-text";
import { useFixSpelling } from "./useFixSpelling";

export default function Command() {
  const state = useFixSpelling();
  const replacing = useRef(false);

  async function replaceOnce(text: string) {
    if (replacing.current) return;
    replacing.current = true;
    await replaceText(text);
  }

  switch (state.status) {
    case "loading":
      return (
        <List isLoading>
          <List.EmptyView title="Checking spelling…" />
        </List>
      );
    case "capture-error":
      return (
        <List>
          <List.EmptyView
            title="Couldn’t read the selection"
            description="Reselect the word in your app, then reopen Fix Spelling."
          />
        </List>
      );
    case "no-selection":
      return (
        <List>
          <List.EmptyView
            icon={Icon.TextCursor}
            title="No text selected"
            description="Select a word in your app, then reopen Fix Spelling."
          />
        </List>
      );
    case "invalid-selection":
      return (
        <List>
          <List.EmptyView
            icon={Icon.TextCursor}
            title="Select one word"
            description="Select a single English word, then reopen Fix Spelling."
          />
        </List>
      );
    case "correct":
      return (
        <List>
          <List.EmptyView icon={Icon.CheckCircle} title={`“${state.word}” is spelled correctly`} />
        </List>
      );
    case "no-suggestions":
      return (
        <List>
          <List.EmptyView title={`No suggestions for “${state.word}”`} />
        </List>
      );
    case "error":
      return (
        <List>
          <List.EmptyView title="Couldn’t check spelling" description={state.message} />
        </List>
      );
    case "ready":
      return (
        <List searchBarPlaceholder="Filter suggestions…">
          <List.EmptyView title="No matching suggestions" />
          <List.Section
            title={`Suggestions for “${state.word}”`}
            subtitle="Wrong word? Reselect it in your app and reopen Fix Spelling."
          >
            {state.suggestions.map((suggestion) => (
              <List.Item
                key={suggestion}
                title={suggestion.trim()}
                actions={
                  <ActionPanel>
                    <Action
                      title="Replace Selected Text"
                      icon={Icon.TextCursor}
                      onAction={() => replaceOnce(suggestion)}
                    />
                    <Action
                      title="Copy Suggestion"
                      icon={Icon.Clipboard}
                      shortcut={Keyboard.Shortcut.Common.Copy}
                      onAction={() => copySuggestion(suggestion)}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        </List>
      );
  }
}
