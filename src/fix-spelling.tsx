import { ActionPanel, Action, Icon, Keyboard, List } from "@raycast/api";
import { copySuggestion, replaceText } from "./replace-text";
import { useFixSpelling } from "./useFixSpelling";

export default function Command() {
  const { list, word, error, status, refresh } = useFixSpelling();

  const refreshAction = (
    <Action
      title="Refresh Selection"
      icon={Icon.RotateAntiClockwise}
      shortcut={Keyboard.Shortcut.Common.Refresh}
      onAction={refresh}
    />
  );

  if (status === "error") {
    return (
      <List>
        <List.EmptyView
          title="Couldn’t check spelling"
          description={error ?? "Unknown error occurred"}
          actions={<ActionPanel>{refreshAction}</ActionPanel>}
        />
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
          description="Select a word or phrase, then refresh the selection."
          actions={<ActionPanel>{refreshAction}</ActionPanel>}
        />
      ) : status === "no-suggestions" ? (
        <List.EmptyView
          icon={Icon.CheckCircle}
          title="No spelling corrections found"
          description={word ? `“${word}” has no suggestions.` : undefined}
          actions={<ActionPanel>{refreshAction}</ActionPanel>}
        />
      ) : (
        list.map((item) => (
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
                  onAction={async () => {
                    await replaceText(typeof item.title === "string" ? item.title : item.title.value);
                  }}
                />
                <Action
                  title="Copy Suggestion"
                  icon={Icon.Clipboard}
                  shortcut={Keyboard.Shortcut.Common.Copy}
                  onAction={async () => {
                    await copySuggestion(typeof item.title === "string" ? item.title : item.title.value);
                  }}
                />
                {refreshAction}
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
