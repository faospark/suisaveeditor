# Graph Report - suisaveeditor  (2026-10-29)

## Corpus Check
- 38 files · ~79,612 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .backup 1)

## Summary
- 324 nodes · 555 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12d60f0d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.js
- Changelog
- main.min.js
- Save File Field Mapping Reference
- constants.js
- sym.py
- unlocksAndQuests.min.js
- constants.min.js
- Suikoden II HD Remaster Save Editor
- schema.min.js
- gamedata.schema.js
- gamedata.js
- guardianDeity.js
- gamedata.min.js
- Symbol Indexer (`tools\sym.bat`) — use BEFORE grep

## God Nodes (most connected - your core abstractions)
1. `main()` - 15 edges
2. `Changelog` - 15 edges
3. `GameData` - 14 edges
4. `Save File Field Mapping Reference` - 12 edges
5. `main()` - 11 edges
6. `renderTabContent()` - 8 edges
7. `renderTabContent()` - 8 edges
8. `checkForAutoSave()` - 7 edges
9. `checkForAutoSave()` - 7 edges
10. `updateSaveFileIndicator()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Added` --references--> `createGuardianDeityEditor()`  [INFERRED]
  CHANGELOG.md → src/editors/guardianDeity.js
- `What is indexed` --references--> `refs()`  [INFERRED]
  .agents/rules/sym.md → tools/symbol_indexer/sym.py
- `Changed` --references--> `createBathItemsEditor()`  [INFERRED]
  CHANGELOG.md → src/editors/bathItems.js
- `Changed` --references--> `createItemPickerDialog()`  [INFERRED]
  CHANGELOG.md → src/editors/tableEditor.js
- `renderTabContent()` --calls--> `createSideQuestsAndCountersEditor()`  [EXTRACTED]
  src/main.js → src/editors/unlocksAndQuests.js

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.07
Nodes (41): EDITOR_GROUPS, EDITOR_LABELS, FIELD_CONFIG, GROUP_PATHS, RENDERER_TYPES, TABLE_COLUMNS, createCastleFlagsEditor(), createCastleFlagsRawEditor() (+33 more)

### Community 1 - "Changelog"
Cohesion: 0.04
Nodes (44): [1.0.0] - 2025-11-28, [1.1.0] - 2025-12-02, [1.2.0] - 2025-12-03, [1.2.0] - 2025-12-06, [1.3.0] - 2025-12-08, [1.3.1] - 2025-12-08, [1.3.2] - 2025-12-12, [1.4.0] - 2026-10-26 (+36 more)

### Community 2 - "main.min.js"
Cohesion: 0.08
Nodes (36): DEBUG_FILE_PATH, createSideQuestsAndCountersEditor(), createAboutViewer(), createChangelogViewer(), autoSaveToLocalStorage(), checkForAutoSave(), clearAutoSave(), createAboutViewer() (+28 more)

### Community 3 - "Save File Field Mapping Reference"
Cohesion: 0.07
Nodes (26): ✅ Correct Implementation Checklist:, Data Path Resolution Rules, EDITOR_GROUPS Structure, Experimental Tab Fields, Experimental Tab Implementation, Farm Animals (`hon_flag[32]`), Farming Items (GameData.FARMING), Farming System Documentation (+18 more)

### Community 4 - "constants.js"
Cohesion: 0.11
Nodes (24): APP_VERSION, BATTLE_PARTY_SLOTS, CHAR_INDEX, CLIVE_MILESTONES, CONVOY_SLOTS, COOK_OFF_STAGES, EVENT_FLAG_INDEX, MAX_CHARACTERS_WITH_NPC (+16 more)

### Community 5 - "sym.py"
Cohesion: 0.11
Nodes (27): create_indexes(), create_schema(), find_block_end(), index_js(), js_files(), main(), node_dump(), rel() (+19 more)

### Community 6 - "unlocksAndQuests.min.js"
Cohesion: 0.23
Nodes (8): createCastleFlagsEditor(), createGranularBitArrayEditor(), createKnownRecipesEditor(), createLibraryBooksEditor(), createRichmondDetectiveEditor(), createTreasureChestsEditor(), getRecipeDishName(), labelOrDefault()

### Community 7 - "constants.min.js"
Cohesion: 0.11
Nodes (17): APP_VERSION, BATTLE_PARTY_SLOTS, CHAR_INDEX, CONVOY_SLOTS, COOK_OFF_STAGES, DEBUG_FILE_PATH, EVENT_FLAG_INDEX, MAX_CHARACTERS_WITH_NPC (+9 more)

### Community 8 - "Suikoden II HD Remaster Save Editor"
Cohesion: 0.22
Nodes (8): Before You Start, Disclaimer, Features, Instructions, License, Reference, Step-by-Step Guide, Suikoden II HD Remaster Save Editor

### Community 9 - "schema.min.js"
Cohesion: 0.29
Nodes (6): EDITOR_GROUPS, EDITOR_LABELS, FIELD_CONFIG, GROUP_PATHS, RENDERER_TYPES, TABLE_COLUMNS

### Community 13 - "gamedata.js"
Cohesion: 0.16
Nodes (12): Changed, createBathItemsEditor(), createKeyItemsEditor(), createPartyMembersEditor(), createItemPickerDialog(), createTableEditor(), getEquipmentName(), getItemLookup() (+4 more)

### Community 14 - "guardianDeity.js"
Cohesion: 0.20
Nodes (7): [1.4.7] - 2026-10-29, Added, BEAST_NAMES, createGuardianDeityEditor(), GUARDIAN_BLUEPRINTS, GUARDIAN_STATUE_REWARDS, PRESET_STATUES

### Community 16 - "Symbol Indexer (`tools\sym.bat`) — use BEFORE grep"
Cohesion: 0.40
Nodes (4): Symbol Indexer (`tools\sym.bat`) — use BEFORE grep, Usage, What is indexed, Workflow

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Changelog` connect `Changelog` to `guardianDeity.js`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07446808510638298 - nodes in this community are weakly interconnected._
- **Why does `[1.4.7] - 2026-10-29` connect `guardianDeity.js` to `Changelog`, `gamedata.js`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `createGuardianDeityEditor()` connect `guardianDeity.js` to `main.js`, `main.min.js`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `main.min.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08080808080808081 - nodes in this community are weakly interconnected._
- **Should `Save File Field Mapping Reference` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._