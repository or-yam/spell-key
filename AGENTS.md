# Project Guidelines

Spell Key is a keyboard-first Raycast spell-checking extension backed by a native macOS helper.

## Structure

- `src/useFixSpelling.tsx` — selected-text capture and command state.
- `src/fix-spelling.tsx` — suggestions UI and replacement action.
- `src/spell-check.ts` — native helper invocation and output parsing.
- `src/replace-text.ts` — replacement through Raycast.
- `native/spellcheck.swift` — `NSSpellChecker` integration.
- `native/build.sh` — builds the packaged helper.
- `assets/spellcheck-native` — packaged runtime helper.

## Constraints

- Target macOS on Apple Silicon (`arm64`) only.
- Rebuild `assets/spellcheck-native` after changing its Swift source.
- Treat selection capture and replacement as separate failure boundaries.
- Keep the product focused on spelling correction — no grammar checking or AI rewriting.

## Known Raycast Limitation

`getSelectedText()` has returned stale text during real use across multiple Raycast and macOS versions. Raycast exposes no freshness metadata, so the extension cannot reliably detect this condition.

- If `Suggestions for:` is wrong, investigate selection capture.
- If the title is correct but replacement is wrong, investigate the paste path.
- Never hide uncertainty with cached selections, selection history, retries, or clipboard heuristics.
- Fail closed on observable capture errors or empty input. Do not claim stale selection is solved without real cross-application verification.

## Implementation Rules

- Capture selected text once per command launch.
- Do not call `Clipboard.copy()` before `Clipboard.paste()` unless explicitly required.
- Invoke native binaries with argument arrays, never shell interpolation.
- Resolve the helper through `environment.assetsPath`.
- Validate native input and report failures through stderr and non-zero exit codes.
- Use UTF-16 lengths when constructing `NSRange` values for Cocoa APIs.
- Keep dependency upgrades separate unless they are explicitly in scope.

## Diagnostics

- Verify the actual Raycast log sink; do not assume command logs appear in npm stdout.
- Use `environment.supportPath` for temporary extension diagnostics.
- Never persist selected-text previews in production diagnostics.
- Never commit hard-coded local paths, `.debug/`, exploratory logs, or local helper binaries outside `assets/`.
- Treat `Missing executable` as a build or packaging failure before investigating text capture.

## Validation

Before committing, run:

```bash
native/build.sh
assets/spellcheck-native recieve
npm run lint
npm run build
git diff --check
```

Also verify the real workflow in at least two applications:

1. Select a misspelled word.
2. Trigger the command with its Raycast hotkey.
3. Confirm the title contains the current selection.
4. Choose a suggestion and confirm the exact selection is replaced.
5. Immediately repeat with a different word to check for stale capture.

Lint and build do not verify selection freshness.

## Git Hygiene

- Inspect `git status` before staging and before finishing.
- Keep `PRD.md` uncommitted unless explicitly requested otherwise.
- Keep pull requests focused and disclose that Raycast selection staleness remains unresolved when applicable.
