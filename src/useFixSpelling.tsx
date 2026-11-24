import { getSelectedText } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { checkSpelling } from "./spell-check";

type State =
  | { status: "loading" | "capture-error" | "no-selection" | "invalid-selection" }
  | { status: "correct" | "no-suggestions"; word: string }
  | { status: "ready"; word: string; suggestions: string[] }
  | { status: "error"; message: string };

export function useFixSpelling() {
  const [state, setState] = useState<State>({ status: "loading" });

  const captureStarted = useRef(false);

  useEffect(() => {
    // React can replay the mount effect on the same view in development.
    if (captureStarted.current) return;
    captureStarted.current = true;

    async function checkSelection() {
      let selection: string;
      try {
        selection = await getSelectedText();
      } catch {
        setState({ status: "capture-error" });
        return;
      }

      const word = selection.trim();
      if (!word) {
        setState({ status: "no-selection" });
        return;
      }

      try {
        const result = await checkSpelling(selection);
        if (result.status === "misspelled") {
          setState(
            result.suggestions.length
              ? { status: "ready", word, suggestions: result.suggestions }
              : { status: "no-suggestions", word },
          );
        } else if (result.status === "correct") {
          setState({ status: "correct", word });
        } else {
          setState({ status: "invalid-selection" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        console.error(message);
        setState({ status: "error", message });
      }
    }

    void checkSelection();
  }, []);

  return state;
}
