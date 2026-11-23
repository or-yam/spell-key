import { getSelectedText, Icon, List } from "@raycast/api";
import { ComponentProps, useEffect, useState } from "react";
import { getSpellingSuggestions } from "./spell-check";

type ItemProps = ComponentProps<typeof List.Item>;
type Status = "loading" | "ready" | "no-selection" | "no-suggestions" | "error";

export const useFixSpelling = () => {
  const [list, setList] = useState<ItemProps[]>([]);
  const [word, setWord] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function checkSelection() {
      try {
        const text = await getSelectedText();
        if (!text.trim()) {
          setStatus("no-selection");
          return;
        }

        setWord(text);
        const items = await getSpellingSuggestions(text);
        const suggestions: ItemProps[] = items.map((suggestion, index) => ({
          id: `${suggestion}-${index}`,
          icon: Icon.Text,
          title: suggestion,
          subtitle: "Suggested correction",
        }));
        setList(suggestions);
        setStatus(suggestions.length > 0 ? "ready" : "no-suggestions");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error(errorMessage);
        setError(errorMessage);
        setStatus("error");
      }
    }

    void checkSelection();
  }, []);

  return { list, word, error, status };
};
