# Save Editor Agent Instructions

## Critical Directives

### 1. Zero Unsolicited Popups & Silent Backups
- `.bak` backup creation must happen **100% SILENTLY**.
- **NEVER** trigger browser file download dialogs (`a.click()`), prompt inputs, or alert popups when opening a file.
- In Desktop Tauri, `.bak` files are copied silently to disk using native Rust filesystem calls (`std::fs::copy`) in the exact folder where the save file lives.
- In Web browser mode, `.bak` backups are cached silently in `localStorage` without triggering browser download prompts.

### 2. Location Memory for "Save As"
- When saving, the Save As dialog must always open **directly in the exact same folder** where the file was loaded from (`startIn: lastFileHandle` in Web, `dialog.set_directory(parent)` in Tauri).
- Never prompt with JavaScript `prompt()`.

### 3. Changelog Discipline (`CHANGELOG.md` — Native Rust Edition)
- Always log new features, UI improvements, and fixes for the Native Rust Desktop edition in `CHANGELOG.md`.
- **NEVER** add "Keep a Changelog" or "Semantic Versioning" boilerplate text.
- **NEVER** include HTML, CSS, JavaScript, or web-dev implementation jargon in `CHANGELOG.md`.
- Keep bullet nesting strictly **≤ 2 levels deep** (never 3+ levels).
- Format release dates with abbreviated month names (e.g. `Nov 22, 2026`), not numeric `YYYY-MM-DD`.
