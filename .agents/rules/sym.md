# Symbol Indexer (`tools\sym.bat`) — use BEFORE grep

This project has a SQLite index (`tools/symbol_indexer/symbols.db`) of all JS symbols, the save-file schema, the sample save structure and GameData. It answers in ~100 ms and **rebuilds itself automatically** when any `src/**/*.js`, `sw.js` or `debug/save.json` is newer than the DB. Prefer it over grep / reading large files (`main.js`, `gamedata.js`, `battleCharacters.js`, `unlocksAndQuests.js`).

## What is indexed
| Source | Table | Contents |
|---|---|---|
| `src/**/*.js` (no `.min.js`) | `symbols`, `imports`, `refs` | functions, classes, consts, methods with `file:start-end` + signature; imports resolved to files; where-used lines |
| `src/gamedata.js` | `gamedata` | every `CHARACTERS`, `ITEMS`, `RUNES`, `FOOD`, `ARMOR`, `HELMET`, `SHIELD`, `TRADE`, `FARMING`, `BASE_ITEM`, `OTHER_EQUIP_GEAR`, `BEASTS` entry (id, name, attrs) |
| `src/config/schema.js` | `fields` | `FIELD_CONFIG` key, label, group, renderer, readonly |
| `debug/save.json` | `save_paths` | every save field path (e.g. `party_data.party_cha_no`), type, array length, sample value |

## Usage
```powershell
tools\sym.bat renderTabContent          # find a function/const -> file:lines, signature, callers
tools\sym.bat party_cha_no              # schema field + save path + every line that uses it
tools\sym.bat "Fire Orb"                # GameData by name (any category)
tools\sym.bat 18                        # id 18 in every GameData category (Nanami, Angry Blow, ...)
tools\sym.bat RUNES.fire                # GameData scoped to a category (by name or id: CHARACTERS.18)
tools\sym.bat SHIELD                    # list a whole category
tools\sym.bat --refs hasUnsavedChanges  # where-used (all lines)
tools\sym.bat --file recruitment        # outline of a file with line ranges (add --all for local fns)
tools\sym.bat --imports GameData        # who imports a symbol / what a file imports
tools\sym.bat --stats                   # DB summary
```
Scope filters: `--code`, `--fields`, `--save`, `--data`. Output: `--json`, `--limit N`, `--all`. Exit code 4 = no match.

## Workflow
1. **Exact lookups** (where is X, what is id N, which field/path, who uses Y) → `tools\sym.bat`.
2. **Architecture / relationships** (how do modules connect, what does a subsystem do) → `graphify query|path|explain` (see `graphify.md`).
3. Then read only the line range `sym` reported (`read_file` with `StartLine`/`EndLine`) instead of whole files.
4. Indexer source: `tools/symbol_indexer/indexer.py` (force rebuild: `tools\sym.bat --rebuild`). Requires Python 3 and Node (Node evaluates `gamedata.js` / `schema.js`).
