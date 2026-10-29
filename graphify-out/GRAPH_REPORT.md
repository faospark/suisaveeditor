# Graph Report - suisaveeditor  (2026-10-29)

## Corpus Check
- 38 files · ~69,966 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .backup 1)

## Summary
- 320 nodes · 536 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c2b6147`
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

## God Nodes (most connected - your core abstractions)
1. `main()` - 15 edges
2. `Changelog` - 15 edges
3. `GameData` - 14 edges
4. `Save File Field Mapping Reference` - 12 edges
5. `main()` - 11 edges
6. `renderTabContent()` - 8 edges
7. `renderTabContent()` - 8 edges
8. `createTableEditor()` - 7 edges
9. `checkForAutoSave()` - 7 edges
10. `checkForAutoSave()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Added` --references--> `createGuardianDeityEditor()`  [INFERRED]
  CHANGELOG.md → src/editors/guardianDeity.js
- `What is indexed` --references--> `refs()`  [INFERRED]
  .agents/rules/sym.md → tools/symbol_indexer/sym.py
- `renderTabContent()` --calls--> `createSideQuestsAndCountersEditor()`  [EXTRACTED]
  src/main.js → src/editors/unlocksAndQuests.js
- `checkForAutoSave()` --calls--> `updateSaveFileIndicator()`  [EXTRACTED]
  src/main.js → src/utils/helpers.js
- `renderEditor()` --calls--> `extractSaveNumber()`  [EXTRACTED]
  src/main.js → src/utils/helpers.js

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.08
Nodes (38): EDITOR_GROUPS, FIELD_CONFIG, GROUP_PATHS, RENDERER_TYPES, TABLE_COLUMNS, createCastleFlagsEditor(), createCastleFlagsRawEditor(), createFishingRecordsEditor() (+30 more)

### Community 1 - "Changelog"
Cohesion: 0.04
Nodes (44): [1.0.0] - 2025-11-28, [1.1.0] - 2025-12-02, [1.2.0] - 2025-12-03, [1.2.0] - 2025-12-06, [1.3.0] - 2025-12-08, [1.3.1] - 2025-12-08, [1.3.2] - 2025-12-12, [1.4.0] - 2026-10-26 (+36 more)

### Community 2 - "main.min.js"
Cohesion: 0.08
Nodes (37): DEBUG_FILE_PATH, SAVE_FILE_PATTERNS, createSideQuestsAndCountersEditor(), createAboutViewer(), createChangelogViewer(), autoSaveToLocalStorage(), checkForAutoSave(), clearAutoSave() (+29 more)

### Community 3 - "Save File Field Mapping Reference"
Cohesion: 0.07
Nodes (26): ✅ Correct Implementation Checklist:, Data Path Resolution Rules, EDITOR_GROUPS Structure, Experimental Tab Fields, Experimental Tab Implementation, Farm Animals (`hon_flag[32]`), Farming Items (GameData.FARMING), Farming System Documentation (+18 more)

### Community 4 - "constants.js"
Cohesion: 0.12
Nodes (22): APP_VERSION, BATTLE_PARTY_SLOTS, CHAR_INDEX, CONVOY_SLOTS, COOK_OFF_STAGES, EVENT_FLAG_INDEX, MAX_CHARACTERS_WITH_NPC, MAX_MP_VALUE (+14 more)

### Community 5 - "sym.py"
Cohesion: 0.09
Nodes (31): Symbol Indexer (`tools\sym.bat`) — use BEFORE grep, Usage, What is indexed, Workflow, create_indexes(), create_schema(), find_block_end(), index_js() (+23 more)

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
Cohesion: 0.15
Nodes (8): EDITOR_LABELS, createBathItemsEditor(), createKeyItemsEditor(), createPartyMembersEditor(), createItemPickerDialog(), createTableEditor(), GameData, createDataValuesViewer()

### Community 14 - "guardianDeity.js"
Cohesion: 0.18
Nodes (8): [1.4.7] - 2026-10-29, Added, Changed, BEAST_NAMES, createGuardianDeityEditor(), GUARDIAN_BLUEPRINTS, GUARDIAN_STATUE_REWARDS, PRESET_STATUES

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createGuardianDeityEditor()` connect `guardianDeity.js` to `main.js`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Why does `Changelog` connect `Changelog` to `guardianDeity.js`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `main.min.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07729468599033816 - nodes in this community are weakly interconnected._
- **Should `Save File Field Mapping Reference` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `constants.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._