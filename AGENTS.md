# Project: Super Simple Software Factory (merged)

Merge of exactly two repos. See README.md for the split.

## Sources (read-only references)

- `D:\dev\Antigravity Software Factory` — engine + robustness
- `D:\dev\Software Factory Suite` — UX + flow + docs

## When the merge is built

- State the verify command in this file and keep it green
- Both manuals (`/user-manual`, `/learners-manual`) are part of done
- No hard-coded API keys anywhere; keys live in `.env` (gitignored) or the OS credential store

## Open decisions (as of 2026-10-08)

- UI stack: Dave's default is Flutter (CodeMagic deploys to app store/play store/Windows); Rust+Tauri for secured workstation apps; Node/Electron was forced by a platform with no Flutter SDK. The merged product's stack is Dave's call.
- Whether to keep Antigravity's Python engine as-is or port it.
