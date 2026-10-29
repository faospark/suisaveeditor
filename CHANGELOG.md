# Changelog

All notable changes to the Suikoden II HD Remaster Save Editor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.7] - 2026-10-29

### Added

- **Modern File Action Toolbar & Drag-and-Drop (`index.html`, `style.css`, `helpers.js`, `main.js`)**:
  - Replaced the unstyled native file input and 2-column grid with a modern flex action bar (`.file-action-bar`).
  - Added custom-styled file upload button (`.file-upload-btn`) with vector upload icon, automatically toggling between "Choose File" and "Change File".
  - Integrated dynamic file status badge (`.file-status-badge`) showing a green checkmark, monospace file name, and detected save slot tag (`Slot #88`).
  - Added drag-and-drop support across the file action bar with visual glow indicators when hovering with `.json` save files.
  - Aligned the Save / Download button with a matching vector disk icon and smooth hover elevation.

- **Item & Accessory Picker Dialog Modal Controls (`tableEditor.js`, `battleCharacters.js`)**:
  - Added a dedicated top-right modal close button (`✕` / `.close`) to both the Item Picker and Accessory Picker dialog headers.
  - Added backdrop click-outside dismissal (`dialog.addEventListener('click')`) to immediately close and clean up dialogs.
  - Added missing ESC key listener (`cancel` event) to the Accessory Picker dialog for seamless keyboard dismissal.

- **Recruitment Portrait Cards Grid Overhaul (`recruitment.js`, `style.css`)**:
  - Replaced the legacy single-column HTML `<table>` layout with responsive portrait cards (`.recruitment-cards-grid`).
  - **Visual Portrait Cards (`.recruitment-card`)**:
    - Displays 52×52px character portraits (`./image/portraits/fp_###.png`) with automatic fallback handling.
    - Card header shows character ID and name (`#ID: Name`) alongside color-coded dynamic recruitment status badges (`✓ Recruited`, `✓ Recruited Via SFix`, `✓ Recruited Via Kraken`, `💬 Spoke To`, `📋 On Leave`, `☠ Deceased`, `🔒 Event Locked`, `✗ Not Recruited`).
    - Replaced raw numeric text input with a stylized `<select class="recruitment-select">` dropdown supporting standard flags (`0`, `1`, `70`, `71`, `86`, `212`, `213`) while preserving custom hex/decimal values.
    - Active recruited cards highlight with green borders (`.is-recruited`), contacted characters highlight with blue borders (`.is-spoke-to`), while non-recruited cards remain subtly dimmed.
  - **Live Filter & Search Toolbar (`.recruitment-toolbar`)**:
    - Real-time search filter matching character name or numeric ID with instant responsiveness.
    - Quick status filter dropdown (`All Characters`, `✓ Recruited Only`, `💬 Spoke To Only`, `✗ Not Recruited Only`).
    - Live star counter badge (`⭐ Recruited: X / Total`) that dynamically recalculates on every change.
    - Excluded unused placeholder slots #126 and #127 ("NA-") from the recruitment card list and total counts.

- **Playable Character Portraits (`battleCharacters.js`, `style.css`)**:
  - Integrated local 400x400 HD character portraits (`./image/portraits/fp_###.png`) into Column 1 (General) of each character's editor card.
  - Positioned the portrait side-by-side with Level and Experience inputs in a dedicated top flex row, perfectly balancing the vertical space.
  - Styled with rounded corners, subtle dark drop shadows, and hover transitions. Gracefully hides without disrupting layout if an image fails to load.

- **Clive Quest Milestones & Completion Flag Tracking (`main.js`, `constants.js`)**:
  - Upgraded the **Play Time & Clive Quest Tracker** to evaluate both in-game playtime hours and event completion flags (`event_flag[94]`).
  - **8 Full Story Milestones Tracked**:
    - `0x01` (Bit 0): Muse City Entrance (<3h)
    - `0x02` (Bit 1): South Window Recruitment (Clive joins)
    - `0x04` (Bit 2): Lakewest Town (<11h)
    - `0x08` (Bit 3): Forest Village (<13h)
    - `0x10` (Bit 4): Rockaxe Information
    - `0x20` (Bit 5): Radat Town (<14h)
    - `0x40` (Bit 6): Muse Hill (<15h)
    - `0x80` (Bit 7): Sajah Finale (<20h)
  - **Dynamic State Evaluation**:
    - **Done**: Shows green `✓ [Milestone] [Done]` if already completed in the save, preventing late-game saves from mistakenly displaying earlier completed cutoffs as expired.
    - **Open**: Shows blue `⏳ [Milestone] [Open]` if pending and current play time is still under the cutoff.
    - **Expired**: Shows red `✗ [Milestone] [Expired]` if pending and current play time has exceeded the cutoff.
  - **Interactive Toggles & Quick Actions**:
    - Clicking any milestone badge directly toggles its completion bit in `event_flag[94]`.
    - Added "Toggle All Done (Flag 94)" quick-action button in the card header alongside "Set Hours = 1".

- **Guardian Deity Statue & Blueprints Editor (`parts_no`) under Castle Tab**:
  - Implemented `createGuardianDeityEditor` in `src/editors/guardianDeity.js` and registered in `schema.js`, `main.js`, and `src/editors/index.js`.
  - **Blueprints Delivered to Jude (`parts_no[0]` & `parts_no[1]`)**:
    - 16 interactive toggle checkboxes for all Dragon, Unicorn, Rabbit, and Turtle plans with drop/acquisition locations and anatomical segment info.
    - Quick actions: "Deliver All 16 Plans" (`[255, 255]`) and "Clear Plans" (`[0, 0]`).
  - **Modular Statue Customizer (`parts_no[2]`)**:
    - 4 Anatomical selectors for Head, Body, Legs, and Tail (Dragon, Unicorn, Rabbit, Turtle).
    - Bitwise 8-bit combination calculation: `(Tail << 6) | (Legs << 4) | (Body << 2) | Head`.
    - Live reward evaluation dynamically previewing Jude's exact blessing across all 256 combinations (Pure relics, permanent stat stones, supreme runes, cash, or dud warning).
    - Quick presets dropdown for iconic Pure statues, all 7 permanent stat stones (+3 ATK, DEF, MAG, MDEF, SKL, SPD, LUK), and top rewards.
  - **Shrine Statue Active & Reward Claim State (`parts_no[3]`)**:
    - Toggle for whether the statue has been inspected and Jude's blessing collected at the Castle Shrine (`vk33`).

### Changed

- **Integrated Bath House into Castle Tab (`schema.js`, `bathItems.js`, `style.css`)**:
  - Integrated Dunan Castle Bath House items (`furo_item[0..7]`) into the **Castle** tab alongside the Guardian Deity, Library Books, Farm, and Fishing facilities.
  - Eliminated the redundant standalone "Bath" tab from the main navigation bar.
  - Redesigned `createBathItemsEditor` to match the Castle tab card design:
    - **Paintings** (Slots 2 & 5): Symmetrically arranged in a 2-column grid (`.bath-paintings-grid`).
    - **Ornaments** (Girl's Side: Slots 0, 1, 3; Boy's Side: Slots 4, 6, 7): Arranged side-by-side in a responsive 2-column card grid (`.bath-ornaments-grid`).
    - Added change callback triggers to ensure instant save state indicator updates on edits.

- **Recruitment Flag 2-Column Info & Warning Grid (`recruitment.js`, `style.css`)**:
  - Replaced the stacked description with a 2-column layout (`.recruitment-info-grid`):
    - **Status Values Column (240px)**: Compact list of recruitment status codes (`1`, `70`, `71`, `86`, `212`, `213`) with representative icons and descriptions.
    - **Warning Column (1fr)**: Amber-accented callout box detailing the SuikodenFix & Kraken Patch guidance for multi-beast and dual-ninja recruitments.
    - Includes responsive breakpoint collapsing to a single column on screens under 768px.

- **Recruited Characters Mod Settings Card Styling (`recruitment.js`)**:
  - Unified the "Recruitment Mods that you have on" card in the Recruited Characters tab to identically match the design in the Battle Characters tab.
  - Applied `.recruitment-mods-section` styling with dark semi-transparent card background, border, header note, and compact label layout.
  - Added bidirectional event synchronization via `recruitment-mods-changed` so toggling Better Leona or Kraken options instantly updates both tabs without a reload.

- **Strict Grid Alignment for Magic MP Levels (`battleCharacters.js`, `style.css`)**:
  - Replaced the flexbox layout in `Magic (MP Levels)` with a dedicated 5-column CSS grid (`.mp-level-row` with `56px 48px 12px 48px auto`).
  - Locks all 4 MP level rows into straight vertical columns:
    - Level label column (`56px`)
    - Current MP input column (`48px`)
    - Centered slash separator column (`12px`)
    - Max MP capacity input column (`48px`)
    - Clickable MP squares (`0` button + 9 fixed-width square indicators)
  - Prevents input stretching and horizontal drift caused by differing square glyph widths across rows.

- **3-Column Vertical-Count Inventory & Warehouse Grid (`tableEditor.js`, `style.css`)**:
  - Replaced the single-column HTML `<table>` layout for Party Bag (`party_item`, 30 slots), Warehouse (`base_item`, 60 slots), and Room Items (`room_item`, 8 slots) with a responsive 3-column chip grid (`.items-3col-grid`).
  - Implemented **vertical (column-first) slot counting**:
    - **Party Bag (30 slots)**: Column 1 = Slots 1–10, Column 2 = Slots 11–20, Column 3 = Slots 21–30.
    - **Warehouse (60 slots)**: Column 1 = Slots 1–20, Column 2 = Slots 21–40, Column 3 = Slots 41–60.
    - **Room Items (8 slots)**: Column 1 = Slots 1–3, Column 2 = Slots 4–6, Column 3 = Slots 7–8.
  - Each column features a distinct column header indicating the slot range (e.g. `📦 Slots 1–10 (10 slots)`).
  - **Slimmed-down Slot Chips (`.item-slot-chip`)**:
    - Removed bulky standalone numeric inputs for `item_no` and `use_cnt`.
    - Compact representation showing Slot badge (`#01`), `[🔍 Pick]` button, `[✕]` clear button, bold item name, and inline metadata (`#ID · use: X · Type`). Empty slots display dimmed `Empty Slot` with clear button hidden.
  - **Enhanced Item Picker Modal (`createItemPickerDialog`)**:
    - Auto-detects and pre-selects the item category based on the current slot's `use_cnt`.
    - Added instant real-time search filter by item name or ID.
    - Added an `✕ Clear Slot` button in the dialog footer alongside `Cancel`.
  - Converted the static item type explanation into a compact collapsible `<details>` guide.

- **Streamlined Battle Characters Accessories UI (`battleCharacters.js`)**:
  - Replaced the standalone numeric `<input>` fields (`item_no` and `use_cnt`) with compact inline text displaying item name, ID, and usage count (e.g. `Power Ring (#82 · use_cnt: 16)` or `None (Empty)`).
  - Added an inline `[✕]` unequip button to each equipped accessory slot for instant clearing.
  - Added an `✕ Unequip / Clear Slot` button to the accessory picker dialog footer.
  - Eliminates horizontal stretching and overflow in Column 3 (Equipment & Gear) of the character cards.

- **Castle Library Old Books Grid Layout (`unlocksAndQuests.js`, `style.css`)**:
  - Replaced the auto-fill wrapping layout with a dedicated 6-column grid (`.library-books-grid`), neatly organizing all 12 volumes into two symmetrical rows of 6 (Vol. 1-6 and Vol. 7-12) with responsive breakpoints for narrower screens.

- **Guardian Deity Blueprints Layout (`guardianDeity.js`, `style.css`)**:
  - Reorganized the 16 blueprint checkboxes into 4 dedicated columns (1 column per guardian deity: Dragon, Unicorn, Rabbit, Turtle) with anatomical parts (#1 Head, #2 Body, #3 Legs, #4 Tail) aligned symmetrically across rows.

- **Battle Characters Editor 3-Column Card Architecture (`battleCharacters.js`, `style.css`)**:
  - Maximized horizontal space and established full visual consistency with the 3 archetype cards by structuring character controls into 3 styled dark cards (`.battle-character-col`):
    - **Column 1 (General & Stats)**: General info and Core Stats arranged in a compact 2-column grid matching the elemental affinities format.
    - **Column 2 (Magic & Runes)**: Magic MP charges (Levels 1-4 with interactive visual pips, header `⚡ Max All` button), Runes, and Rune Slot Unlock Levels.
    - **Column 3 (Weapon & Equipment)**: Weapon stats (Level & Rune), Armor (Helmet, Armor, Shield), and equipped Accessories.
    - Standardized headers (`strong` 0.82rem), dashed sub-section dividers, and responsive breakpoints (2 columns on tablets <= 1200px, 1 column on mobile <= 768px).

## [1.4.6] - 2026-10-26

### Changed

- **Disabled Collapsible Groups in Cooking Tab (`unlocksAndQuests.js`, `main.js`)**:
  - Converted **Known Cooking Recipes (Hai Yo)** (`food_resipi`) from a `<details>` collapsible into a permanent, non-collapsible card with header and recipe count badge.
  - Converted **Hai Yo's Kitchen Ingredient Stock** (`food_num[0..11]`) and **Seasonings** (`taste_flag`) into permanently open, non-collapsible cards.
  - Converted **Cook-Off Battles Won** (`cook_off_progress`) into a styled non-collapsible card matching the rest of the tab.
  - All sections on the **Cooking** tab now remain permanently visible and accessible without collapsing or accordion state.

## [1.4.5] - 2026-10-26

### Fixed

- **Fixed Syntax Error in General Tab (`src/main.js`)**:
  - Corrected `extraOpt.textContent` string assignment for custom Listening Crystal Beast fallback options to eliminate `SyntaxError: Unexpected token '{'`.
  - Synced `src/main.min.js`.

## [1.4.4] - 2026-10-26

### Changed & Fixed

- **Standardized Yam Koo's Fishing Minigame Table (`unlocksAndQuests.js`)**:
  - Restyled the table to match standard application tables using Pico CSS `class="striped"`.
  - Removed custom red, yellow, and green header inline color styles and removed the enclosing boxed background container, bringing the table into full visual harmony with the rest of the application.
- **Relocated All 50 Castle Flag Bytes to Experimental Tab (`unlocksAndQuests.js`, `schema.js`, `main.js`)**:
  - Moved **🏰 All 50 Castle Flag Bytes (`hon_flag[0–49] — Granular Bit & Byte Editor`)** back to the **Experimental** tab.
  - Converted the 50-byte editor into a permanently open, **non-collapsible** card (`collapsible: false`) with header, count badge, search filter, and bulk Unlock/Reset buttons.
  - The **Castle** tab now cleanly focuses on **🌱 Castle Farm Plots & Livestock (`hon_flag[30–32]`)**, Library Old Books, and Fishing Records.

## [1.4.3] - 2026-10-26

### Added & Fixed

- **Recruitment Mods Honored in Battle Characters Tab (`battleCharacters.js`, `recruitment.js`)**:
  - **Embedded Recruitment Mods Section**: Placed the "Recruitment Mods that you have on" box with "Better Leona Option" (Valeria & Kasumi) and "Kraken Patch" (Chuchara recruits Abizboah & Rulodia) directly at the top of the **Battle Characters** tab.
  - **Two-Way Cross-Tab State Synchronization**: Toggling recruitment mods in either the Battle Characters tab or Recruited Characters tab automatically synchronizes checkboxes, updates `localStorage`, and instantly dispatches live refresh events.
  - **Dynamic Recruitment Status & Filter Integration**:
    - Character recruitment badges (`✓ Recruited Via SFix`, `✓ Recruited Via Kraken`) and `dataset.isRecruited` dynamically re-evaluate on the fly without page reloads.
    - Selecting the "✓ Recruited Only" filter in Battle Characters now properly includes characters unlocked via Better Leona Option and Kraken Patch.
  - **In-Place Recruitment Status Editor in Battle Characters**:
    - Added an editable **Recruitment Status (`chara_flag`)** dropdown inside each character card's General section (allowing direct recruitment, revive from deceased, event-lock, or on-leave status editing right alongside character combat stats).
- **Listening Crystal Beasts Selectors Fixed (`src/main.js`)**:
  - Corrected monster IDs (49: Abizboah, 50: Feather, 72: Siegfried, 74: Rulodia, 79: Chuchara) with strict value-type matching and fallback option generation to prevent blank select controls.

## [1.4.0] - 2026-10-26

### Added

- **Advanced Character Archetype Editor (`c_kotei_dat`) in Battle Characters**
  - **Rune Slot Unlock Levels (`mon_kosu_type[0..2]`)**: Granular level inputs (`1–99` or `100` for never) for Head, Right Hand, and Left Hand rune slots, plus one-click "Unlock All 3 Slots at Lv 1" and "Restore Game Defaults" buttons.
  - **Rune Elemental Affinities (`mon_zoku_aisyo[0..3]`)**: Granular dropdowns (`Rank A (+40%)` through `Rank E (-20% & Backfire)`) for all 8 elements (Fire, Water, Wind, Earth, Lightning, Resurrection, Darkness, Special), plus a "Set All to Rank A" button.
  - **Slot Change Locks (`soubi_henkou`)**: 8 individual checkboxes for locking/unlocking Helmet, Armor, Shield, Head Rune, Right Hand Rune, Left Hand Rune, Accessories, and Weapon Rune slots.
  - **Equippable Gear Classes (`soubi_kanou`)**: 6 individual checkboxes for Heavy Helmet, Cap/Hat, Heavy Armor, Light Armor, Robe, and Shield permissions.
  - **Per-Character "Allow Locked / Any Rune" Toggle**: Bypass exclusive rune restrictions to equip any rune on any character slot.
  - **Friendship / Affection (`suki_value`)**: Direct editor for each character's hidden affection stat in the General section.
  - **Search Bar & Bulk Actions Toolbar**: Filter characters by name/ID or recruited status, and run bulk actions (Heal All HP & MP, Max All Weapons Lv 16, Unlock All 3 Rune Slots Lv 1, All Elemental Affinities Rank A).

- **Investigation-Themed Redesign for General Tab (`src/main.js`)**
  - Restructured the entire **General** tab to match the sleek card & chip visual aesthetic from the Investigations tab.
  - Divided all general fields into 7 cohesive, permanent cards with dark translucent backdrops (`rgba(0,0,0,0.12)`), subtle borders, emoji titles, and header divider bars:
    - **⚔️ Active Party Members & Convoy (`party_cha_no`)**: Responsive 8-slot card layout with distinct battle combatant (1–83) and convoy (1–124) roster dropdowns and slot badge.
    - **🗺️ World & Map Location (`location`)**: Compact 5-field grid for Area, Town, Map, and X/Y coordinates.
    - **⏱️ Play Time & Clive Quest Tracker (`play_time`, `date_time_now`)**: Hours/Minutes/Seconds inputs, in-game last saved timestamp, quick "Set Hours = 1" button, and live Clive Quest cutoffs checklist.
    - **👤 Hero & Legacy Identifiers (`bozu_name`, `bozu_name2`, `macd_name`, `m_base_name`)**: Dedicated card for S2 Hero, Real Name, and S1 transferred Hero and HQ names.
    - **🏰 Castle Headquarters, Army & Facilities (`base_name`, `team_name`, `base_lv`, `gold`, `ninki`, etc.)**: Integrated card with "Max Potch (999,999)" quick action, castle level, popularity, blacksmith level, bath level, and S1 stars.
    - **🎓 Greenhill Mission Aliases (`kari_name`)**: Thematic cover names card for Hero, Nanami, and Flik.
    - **🎖️ Side-Quests, Beasts & Battle Counters (`side_quests`)**: Grid of styled chips for Gordon's trading progress with 50k badge, Listening Crystal beasts selectors, escaped battles, and Luca Blight ambush HP with 0 HP kill button.

- **Dedicated Castle Tab (`main.js`, `schema.js`, `unlocksAndQuests.js`)**
  - Added dedicated **Castle** tab situated immediately before **Experimental**.
  - Moved **Castle Library Old Books (Vol. 1–12)** (`lib_flag`), **Castle Farm Plots & Livestock** (`hon_flag[30–32]`), and **Yam Koo's Fishing Minigame Records** (`tsuri_data`) into the Castle tab.
  - Converted these sections into non-collapsible, permanently open card groups for faster editing.

- **Dedicated Cooking Tab (`main.js`, `schema.js`, `unlocksAndQuests.js`)**
  - **Cook-Off Battles Won (`cook_off_progress`)**: Progress counter for Hai Yo's 16 culinary battles.
  - **Hai Yo's Kitchen Stock & Seasonings (`food_num[0..11]`, `taste_flag`)**: Granular stock quantities for all 12 ingredients with one-click "Fill Max (3 Each)" button, plus granular seasoning unlocks (Mayonnaise, Red Pepper, Sugar, Soy Sauce, White Sauce).
  - **Castle Restaurant Menu (`food_menu[0..6]`)**: Full interactive course slot dropdowns for all 7 restaurant menu items using the 240-dish recipe database, complete with a "Clear Menu" button.
  - **Known Cooking Recipes (`food_resipi[0..4]`)**: 40 individual recipe checkboxes with dish names, search filtering, and "Unlock All 40" / "Clear All" buttons.

- **Granular Unlocks, Collections & Side Quest Editors (`unlocksAndQuests.js`)**
  - **Castle Library Old Books (`lib_flag`)**: 12 individual checkboxes for Old Book Vol. 1–12 with "Unlock All 12" / "Clear All" buttons.
  - **Side Quests & Special Counters**:
    - **Clive's Quest Time-Trial Tracker (`play_time`)**: Live milestone eligibility badges (`Elza at Lakewest < 11h` through `Sajah Village Finale < 20h`) and a one-click "Reset Timer for Clive's Quest" button.
    - **Gordon's Trading Quest (`trade_transaction_total`)**: Edit cumulative trading profit with live `>= 50,000 Potch` recruitment badge and one-click "Set 50,000 Potch" button.
    - **Listening Crystal Beasts (`l_mon_no[0..1]`)**: Dropdown selectors for the two Listening Crystal recruitment slots (Abizboah, Feather, Sieg, Rulodia, Chuchara).
    - **Escaped Battles (`nige_cnt`) & Luca Blight Ambush HP (`luka_hp`)**: Direct editors in the General tab.
  - **Castle Farm, Ranch & Facility Flags (`hon_flag[0..49]`)**: Granular bit checkboxes and preset buttons for Vegetable Seedlings Group A (`hon_flag[30]`), Group B (`hon_flag[31]`), and Yuzu's Ranch Livestock (`hon_flag[32]`), plus an expandable 50-byte bit/byte editor.
  - **Richmond's Detective Investigations (`tantei_cano`, `tantei_ca_lv`, `tantei_lv[0..64]`)**: Active investigation target and stage selectors, plus a granular 65-byte clue bit/byte editor with bulk unlock/clear controls.
  - **World Map Treasure Chests (`t_box_flag[0..31]`)**: 256 individual chest checkboxes across 32 byte groups with "Open All 256 Chests" and "Reset All" buttons.
  - **Major War Battle Units (`war_data`)**: Granular dropdowns for all 14 Unit Commanders (`leader_no`), 28 Sub-Officers (`sub_no`), and unit assignments (`sub_to_leader`).

### Fixed

- **Packed-Nibble Magic Points (MP) Editor (`chara_data.c_varia_dat.mp[0..3]`)**:
  - Properly decodes and encodes the high nibble (`Current MP`, `0–9`) and low nibble (`Max MP`, `0–9`) per spell level (`(cur << 4) | max`), with individual `Cur` / `Max` inputs, interactive `■/□` squares, and a "Max All (9/9)" button.
- **Character Database (`src/gamedata.js`)**:
  - Added missing entry `103: Taki` (fixing duplicate key `105` that overwrote Tetsu) and fixed duplicate key `127` (`126: NA-`).
- **Auto-Save Recovery Dialog (`src/main.js`)**:
  - Fixed inverted button action logic so clicking "Restore" restores the auto-save and clicking "Discard" discards it.

### Removed

- Removed legacy standalone `.exe` and `suisaveeditor-winui3/` desktop wrapper in favor of the unified web/PWA editor.

## [1.3.2] - 2025-12-12

### Fixed - IMPORTANT
  - Fixed Party Slot Identifier 
  - Better keyboard support in editing value manually  

## [1.3.1] - 2025-12-08

### Fixed - IMPORTANT
- **Save File Format Compatibility** - Critical fix for game save file format
  - UTF-8 BOM (Byte Order Mark) now properly added to saved files
  - Unicode characters properly escaped with uppercase hexadecimal (e.g., `\u30B7`)
  - CRLF line endings correctly applied (Windows format)
  - Fixed file encoding to match game's expected format exactly
  - **Previous saves from v1.3.0 may not work with the game - please re-save your files**

### Summary
This is a critical hotfix that ensures saved files match the exact format expected by Suikoden II HD Remaster. All users should update immediately and re-save any edited files.

## [1.3.0] - 2025-12-08

### Added

- **Smart Item Picker** for Party Bag, Warehouse, Battle Character Accessories, and Room Items
  - Modal dialog with item type filtering (Regular Items, Equipment, Runes, Farming, Trade, Base/Warehouse, Food)
  - Checkbox-based type selector with side-by-side layout (200px sidebar | item list)
  - Automatically updates both item_no and use_cnt fields
- **Smart HTML Alerts**
  - All alerts now use modern day html 5 dialogue element giving you a much more consisten experience
- **Recruitment Tab Enhancements**

  - Hero Name (Suikoden 1) detection: Auto-adjusts McDohl/Gremio recruitment status if macd_name is set
  - "Better Leona Option" checkbox: Reads Valeria/Kasumi data recruitment of the chacters when Suikoden fix is used
  - "Kraken Patch" checkbox: Reads Character Data of Abizboah and Rulodia Correctly when Kraken Patch is Used
  - Checkbox states persist via localStorage across sessions
  - Conditional recruitment status logic applied to both Recruitment and Battle Characters tabs

- **Constants Centralization** (constants.js)

  - CHAR_INDEX: Special character indices (McDohl: 82, Gremio: 125, Valeria: 12, Kasumi: 73, etc.)
  - RECRUIT_STATUS: Status values (0, 1, 70, 71, 86, 212, 213)
  - EVENT_FLAG_INDEX: Cook-off byte indices (152, 153)
  - COOK_OFF_STAGES: Array of 13 tournament stages with byte values

- **Room Items** now use unified table renderer with smart picker (previously custom editor)

- **Warning Message** for Room Items: "⚠️ Experimental feature - Room items are unused in the game. Purpose unknown. Edit at your own risk."

### Changed

- **Table Editor Layout** for Party Bag/Warehouse/Room Items:

  - Column order: Slot # | Actions | Item Name | Item Type | item_no | use_cnt
  - Item names now display without ID prefix (cleaner presentation)
  - Slot numbers added as first column for easier reference
  - Actions (Pick button) moved before item name

- **Auto-Save Dialog** button order: "Discard" now left, "Restore" now right (more intuitive)

- **GameData.js Updates**:

  - ITEMS converted to object format: `{ "name": "...", "attrs": [...] }`
  - FOOD items updated with proper use_cnt values (101-106) in attrs
  - Fixed item name resolution in Key Items editor, Battle Characters accessories, and all table editors

- **Equipment Description**: Clarified that all equipment types use value 16 (not separate values per type)

### Fixed

- Key Items editor now correctly displays item names (was showing "[object Object]")
- Battle Characters accessories now show proper item names (was showing "[object Object]")
- Equipment picker no longer shows duplicate "None" entries (deduplicated across HELMET, ARMOR, SHIELD, OTHER_EQUIP_GEAR)
- Item name extraction now handles both string format and object format with `.name` property
- Fixed Character List: Hoi

### Technical

- Split room_items from custom renderer to standard table renderer for consistency
- Removed createRoomItemsEditor from imports and factory registrations
- Updated all item lookup functions to support object format: `typeof item === 'string' ? item : item.name`
- Data attribute system for input field identification: `input.dataset.column`

### Summary

Version 1.3.0 focuses on enhancing item management with smart pickers, improving recruitment workflow with mod compatibility options, and centralizing constants for maintainability. Major UI improvements include reorganized table layouts and curated item selection dialogs.

## [1.2.0] - 2025-12-06

### Added

- **Experimental Tab** - Advanced features for power users

  - Richmond's Detective Clues (tantei_lv) - 64-byte array for tracking detective case progress
  - Castle Flags (hon_flag) - 50-byte array including vegetable garden and farm animal flags
    - Indices 30-31: Vegetable plots (255 = all vegetables unlocked)
    - Index 32: Farm animals
  - Treasure Chests (t_box_flag) - 32-byte array tracking all 256 treasure chests (bit flags)

- **Suikoden 1 Recruited Stars** (nakam_1_num) - Read-only display showing total recruited characters from Suikoden 1 import data

  - Positioned in General tab after HQ Name field

- **Cook-Off Battle Progress Editor** (event_flag[152-153]) - Track cooking competition victories
  - Dropdown selector showing all 12 opponents in tournament order
  - Match progression: Ky Yun → Goetsu → Shinki → Ryuki → Bashok → Ryuko → Antoio → Gyokuran → Retso → Lester → Retso → Jinkai
  - Auto-detects current tournament stage from save data
  - Positioned in General tab after Gold field

### Changed

- Fixed Character List: Added Boris
- Array editors now use responsive two-column CSS layout instead of single vertical column
- Improved spacing and readability for large data arrays (50+ items)
- Field ordering in General tab: Hero Name (S1) → HQ Name (S1) → Recruited Stars (S1) → Hero Name (S2) → Team Name → Gold → Cook-Off Progress → Map Location
- Enhanced markdown rendering with proper indentation preservation and heading cleanup
- Moved embedded README styles from JavaScript to CSS file for better maintainability

### Summary

- Internal refactor: the codebase was split into smaller ES6 modules for better performance, reliability, and faster updates.
- No changes to save file format or workflows — all editor features behave the same.

## [1.2.0] - 2025-12-03

### Added

- Active Party Members Editor (exit_member)
  - 6 battle slots with character selection (0-83, playable characters only)
  - 2 convoy slots with extended selection (0-124, includes NPCs)
  - Dropdown menus with character names from GameData
  - Positioned at top of General tab for easy party management
- Key Items Editor (event_item)
  - 6 item slots for story-critical items
  - Specific item IDs: 29, 35-46, 51-55, 72-74
  - 2-column grid layout
  - Separated from regular Party Bag inventory
  - "Party Items" title added above Key Items section
- Save File Indicator badge
  - Displays save file number extracted from filename
  - Supports patterns: Data##, Save ##, Slot ##, File ##
  - Located in editor tabs header for visibility
- Magic Points (MP) Editor for Battle Characters
  - 4 MP levels (Level 1-4) with 0-153 range
  - Visual progress bars using filled (■) and empty (□) squares
  - 1 square fills per 17 MP points (9 total squares per level)
  - Positioned between General and Stats sections
- Castle Editors Combined layout
  - Greenhill Aliases and Food Menu editors side-by-side
  - 2-column grid on desktop, stacks on mobile
  - Saves horizontal space and improves visual organization
- Debug Mode state persistence
  - Debug mode state saved to localStorage
  - Automatically restores debug mode on page reload
  - Persists across browser sessions
- Auto-exit Debug Mode on file load
  - Clicking "Load JSON File" button exits debug mode
  - Shows alert and refreshes page before file selection
  - Prevents mixing debug and user save files
- Enhanced tab navigation system
  - Tabs persist in dedicated `#editor-tabs` container
  - Header buttons (Data Values, About, Changelog) stay visible
  - Active tab highlighting works correctly across all views
  - Switching between tabs properly updates content without removing navigation

### Fixed

- Battle Characters Weapon section positioning moved above Runes
- Active tab CSS styling now applies to Data Values, About, and Changelog buttons
- Tab navigation no longer removes tabs when switching to header button views
- Content properly replaces when switching between regular tabs and header views
- Fixed duplicate weapon rune code causing syntax errors
- Version display restored in header (v1.2.0)

### Changed

- Battle Characters layout: Weapon section moved to right column above Runes
- Tab system refactored to use persistent container instead of dynamic creation
- All content now renders into same container for consistent behavior
- General tab field order reorganized:
  - Active Party Members → Map Location → Play Time → Date/Time → Save details → Castle info
  - Logical grouping: party composition first, then session info, then game state
- System tab hidden (commented out) - no editable fields yet

## [Previous Updates]

### Added

- Service Worker for complete offline functionality
  - Cache-first strategy for instant loading
  - Works completely offline after first visit
  - Automatic cache updates on version changes
  - Debug save file cached for offline testing
- Debug Mode keyboard shortcut (Ctrl+D)
  - Toggle debug mode on/off with Ctrl+D
  - Automatically loads `./debug/save.json` when enabled
  - Page reload on disable for clean state reset
  - All debug code organized in dedicated section at top of main.js
- Battle Characters "General" section
  - Groups Level, Experience, Max HP, Current HP, and Killed Enemies
  - Positioned at top of left column for easy access
- Battle Characters "Weapon" section
  - Groups Weapon Level and Weapon Rune together
  - Positioned in right column above Runes section
  - Weapon Rune uses dropdown with all weapon orb options
  - Properly handles beast/monster characters (disables weapon rune selection)

### Changed

- Battle Characters editor layout reorganization
  - Left column: General → MP → Stats
  - Right column: Weapon → Runes → Equipment → Accessories
  - Improved logical grouping of related fields
- Debug mode now reloads page when disabled for complete state reset
- Service worker registration added to index.html for PWA support

### Technical

- Service Worker implementation in `src/sw.js`
- Progressive Web App (PWA) capabilities
- Offline-first architecture with cache management
- Debug mode code consolidated and properly organized

## [1.1.0] - 2025-12-02

### Added

- Item Type Classification guide displayed at the top of Inventory, Party Bag, and Warehouse sections
- Comprehensive documentation for item type categorization by use_cnt values
- Version number display in About section (APP_VERSION constant in main.js)
- Header buttons for Data Values and About tabs for easier navigation
- Data Values and About tabs now accessible before loading a save file

### Fixed

- Rune data now displays correctly in party items when cycling through item types (use_cnt 32)
- Item names now properly show for both string and object formats (runes, equipment, etc.)
- Equipment items now display with item ID for consistency
- Tab navigation now works correctly when switching between all views
- Fixed undefined variable error when clicking regular tabs after using header buttons

### Changed

- Moved Data Values and About buttons to header for better accessibility
- Updated footer links to point to full Nexus Mods URLs instead of relative paths
- Improved tab switching behavior to preserve navigation state

## [1.0.0] - 2025-11-28

### Added

- Initial release of Suikoden II HD Remaster Save Editor
- Web-based save file editor built with Vite and Pico CSS
- Support for editing multiple save file sections:
  - General tab (hero names, castle name, gold, play time, etc.)
  - Battle Characters editor with full character data
  - Party Bag with Key Items and Inventory
  - Warehouse with base items and room items
  - Bath items editor with paintings and ornaments
  - Recruited Characters tracker
  - System settings
- Castle Cuisine Recipes editor with unlockable food items
- Greenhill Mission Aliases editor (Hero, Nanami, Flik)
- Key Items editor with 2-column grid layout (6 slots)
- Map Location editor grouping area, town, map coordinates
- Data Values viewer for raw save file inspection
- About tab with project information and PayPal donation button

### Features

- Real-time JSON save file editing
- Item name lookup from comprehensive game data
- Item type classification (Regular Items, Equipment, Runes, Farming, Trade, Base Items, Food)
- Automatic use_cnt handling for different item categories
- Responsive layout with side-by-side sections on large screens
- Play time editor with Hours, Minutes, Seconds fields
- Character recruitment status tracking
- Battle character stats and equipment management

### Technical

- Built with vanilla JavaScript (no framework dependencies)
- Styled with Pico CSS for clean, modern UI
- Modular code structure with separate game data file
- Support for both development and production builds
- Local file handling with FileReader API
