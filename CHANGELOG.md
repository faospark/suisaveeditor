# Changelog

All notable changes to the Suikoden II HD Remaster Save Editor.

## [1.4.16] - 2026-11-22 (Native Desktop)

### Added

- **Native Windows Desktop Edition (`v1.4.16`)**:
  - Full save-editing parity across all 9 editor tabs and 4 utility tabs (`Data Values`, `Settings`, `Changelog`, `About`).
  - **Settings Tab & Theme Switcher**: Dedicated `Settings` tab under `TOOLS` with 6 persisted accent themes (**Gold**, **Amber Copper**, **Royal Crimson**, **Jade Emerald**, **Sapphire**, **Orchid**).
  - **Automatic Game, BepInEx & SuikodenFix Detection**: Auto-detects the Steam install of *Suikoden I and II HD Remaster*, checks `BepInEx` and `SuikodenFix.dll` status (with manual folder browse/reset), and shows a blocking overlay if either prerequisite is missing.
  - **Inventory Copy & Paste**: Copy/Paste individual slots or rapidly fill empty slots across Party Bag and Warehouse.
  - **240 Food Dishes**: Named food lookup, `Food (96+)` picker category, named Restaurant Menu dropdowns, and `FOOD` Data Values tab.
  - **Side-Quests & Story Flags**: Listening Crystal Beasts, Luca Ambush HP, Chaco's Pickpocketed Potch, and 36 annotated story flags with bit labels and search.
  - **Native Desktop QoL**: Fast portrait loading, non-blocking file dialogs, silent `.bak` backups, Save As folder memory, bottom-right version footer, `DEBUG SAVE` top-bar indicator, shortcuts (`Ctrl+O`, `Ctrl+S`, `Ctrl+D`, `Esc`), and Drag-and-Drop `.json` loading.

### Improved & Fixed

- **Castle Facility Views**: Upgraded **Tenkou's Window Sets**, **Connell's Sound Sets**, and **Tetsu's Castle Bath House** (Paintings / Girl's Side / Boy's Side) to full dropdown and grid layouts.
- **Cook-Off Progress**: Live `X / 12 Won` badge and accurate defeated/current/upcoming states regardless of extra flag bits.
- **Tony's Vegetable Farm**: Simplified to 4 crop columns with a single unified planted toggle per plot.
- **Yuzu's Castle Pasture**: Added per-animal notes, 4-sheep HD Remaster cap, and `Max All (13)` / `Default Recruited (2)` / `Clear All (0)` presets.
- **Item Modal & File Dialogs**: Fixed scroll-to-top reset when opening/closing the modal, sorted `Equip (16)` by ID (`#001`–`#087`), fixed the Close button, and prevented `Ctrl+D` debug save loading from overwriting the `Open Save...` folder.

### Credits

- Native desktop GUI built with [iced](https://github.com/iced-rs/iced) (MIT License).

## [1.4.15] - 2026-11-03

### Added & Grounded

- **Pico Recruitment Flag (`event_flag[210]` Bit 5 / `0x20`)**:
  - Live-captured and diff-verified Pico's recruitment inside Greenhill Inn (`ve10_00`).
  - Linked Pico (Character 113) with flag byte 210 mask `0x20` (`Pico Recruited in Greenhill Inn`).
- **Greenhill Reconnaissance, Checkpoint & Nina Town Square Flags (`event_flag[172..174]`, `event_flag[238..239]`)**:
  - Grounded Greenhill City entrance (`ve01_00`) and Town Square (`ve01_01`) progression across bytes `172`, `173`, `174`, `238`, and `239` (Fitcher briefing, student disguise aliases, Academy registration, Emilia, Nina's Town Square & 2F Dormitory night encounters, and Greenhill Inn cutscene).
  - Grounded **Emilia** (`Character 96`, bytes `209`–`210`) and **Jeane** Academy Rune classroom (`byte 213` Bit 5) flags in `ve07_00`.

## [1.4.14] - 2026-11-03

### Fixed & Grounded

- **Kobold Forest Treasure Chests & Stray Lamb Correction (`t_box_flag[6]` / Group 7)**:
  - Corrected Group 7 (`t_box_flag` Byte 6) area designation from Lakewest Town to **Kobold Forest** (`vh10`).
  - Labeled path chests `#49`–`#52` as `Collar (Path 1)` through `Collar (Path 4)`, retained `#53: Main-Gauche` and `#54: Guard Ring`, and grounded Chest `#55` (Bit 6) as **Lamb (Yuzu Farm)**.

## [1.4.13] - 2026-11-03

### Added & Grounded

- **Jeane Recruitment Flag (`event_flag[213]` Bit 7 / `0x80`)**:
  - Live-captured Jeane's recruitment in Two River City Rune Shop (`vh11`) and linked Character 116 to byte 213 bit 7.
- **Yuzu Recruitment & Sheep Minigame Story Flags (`event_flag[68]` & `event_flag[70]`)**:
  - Linked Yuzu (Character 102) to byte 68 mask `0xF0` (dialogue & sheep 1–3 minigame triggers) and byte 70 mask `0x01` (HQ recruitment status).
- **World Map Treasure Chests Labels & Locations (`t_box_flag[0..31]`)**:
  - Grounded all 256 chest flags with exact item rewards, geographical area group headers, internal map IDs, and live search filtering by chest number, item name, location, or byte index.

## [1.4.12] - 2026-11-03

### Fixed & Grounded

- **Yuzu's Castle Pasture Livestock Synchronization (`food_num[4..7]` & `hon_flag[31..33]`)**:
  - Corrected delivered animal counts to `game_data.food_num[4..7]` (Chicks: 0–3, Pigs: 0–3, Sheep: 0–4, Cattle: 0–3; 13 total animals).
  - Auto-syncs all 13 threshold bits across `hon_flag[31]` (bits 4–7), `hon_flag[32]` (bits 0–7), and `hon_flag[33]` (bit 0) without corrupting adjacent vegetable plot flags.

## [1.4.11] - 2026-11-03

### Fixed & Changed

- **Hai Yo's Kitchen Seasonings (`taste_flag`)**:
  - Corrected Row 0 to "No Seasoning", fixed Bit 5 mapping to "Salt (Bit 5 / +32)", and updated the reset button to "Reset (No Seasonings)".
- **Yuzu's Livestock Ranch (`hon_flag[32]`)**:
  - Added acquisition location context for each animal and a "Default Recruited" preset reflecting Yuzu's starting stock.

## [1.4.10] - 2026-11-02

### Added

- **Tenkou's Window Sets & Frame Customization**:
  - Delivery toggles for Window Sets 1–7 (`event_flag[77]`, bits 0–6) with "Deliver All" / "Clear All" actions, plus Active Window Style (`win_typ[0]`), Frame Color (`win_col`), and Opacity (`win_suke`).
- **Connell's Sound Sets & Audio Customization**:
  - Delivery toggles for Sound Sets 1–7 (`event_flag[78]`, bits 0–6) with "Deliver All" / "Clear All" actions, plus Active Sound Effect Set (`se_set`).

## [1.4.9] - 2026-11-01

### Added

- **Automatic Silent `.bak` Backup on File Open**: Automatically copies opened `.json` save files to `<filename>.bak` in the same folder before edits.
- **Native "Save As..." Workflow**: Opens the native Save As dialog in the same folder as the loaded save, writing UTF-8 BOM JSON directly to disk.
- **Castle Suggestion Box (`meyasu_data`) Editor**: Full control over 32-byte letter progression levels (0–3) for 125+ allies, unread indicator (`b_meyasu`), 4 pending inbox slots (`unread_letter`), searchable roster, and Reset/Mark All Read actions.
- **Hai Yo Cook-Off Battles Checklist**: Linear checklist for all 12 culinary matches (Ky Yun through Jinkai) with Reset to Start and Complete All buttons.
- **Story Flags Editor (`event_flag[0..255]`)**: Searchable 256-byte ledger with annotated story checkpoints and recruitment flags, 8-bit checkboxes, and synced decimal/hex inputs.
- **Smart Recruitment & Story Flags Reset**: One-click reset on multi-step recruits (including Sculptor Jude and Badeaux) clearing linked `event_flag` bits and associated quest items across Key Items, Party Bag, and Warehouse.

## [1.4.8] - 2026-10-31

### Added

- **Standalone Desktop Application**: Introduced an offline Windows desktop executable (`v1.4.8` Tauri edition) with bundled portraits and zero internet dependency.

## [1.4.7] - 2026-10-29

### Added & Changed

- **Drag-and-Drop Save Loading**: Drag `.json` save files directly onto the app to load them.
- **Recruitment Portrait Cards Grid**: Character portrait cards with color-coded recruitment status badges, dropdown status selector, live search, status filter, and star counter.
- **Playable Character Portraits**: Integrated HD character portraits into each character's editor card in Battle Characters.
- **Clive Quest Milestones & Completion Flag Tracking (`event_flag[94]`)**: Evaluates all 8 Clive Quest milestones against playtime and completion flags (Done / Open / Expired) with direct bit toggles and quick actions.
- **Guardian Deity Statue & Blueprints Editor (`parts_no`)**: 16 blueprint delivery toggles across 4 deity columns, modular Head/Body/Legs/Tail statue customizer with live reward preview, presets, and shrine claim toggle.
- **Castle Bath House Integrated into Castle Tab**: Paintings (Slots 2 & 5) and Girl's/Boy's Side Ornaments (Slots 0, 1, 3, 4, 6, 7) with automatic `use_cnt = 64`.
- **3-Column Inventory & Warehouse Grids**: Compact slot layout for Party Bag (30 slots), Warehouse (60 slots), and Room Items (8 slots) with searchable Item Picker modal.
- **Battle Characters 3-Column Layout**: Organized into General & Stats, Magic & Runes, and Weapon & Equipment with inline accessory unequip buttons.

## [1.4.6] - 2026-10-26

### Changed

- **Cooking Tab**: Made Known Recipes, Kitchen Ingredient Stock, Seasonings, and Cook-Off Battles permanently open cards.

## [1.4.5] - 2026-10-26

### Fixed

- Fixed custom Listening Crystal Beast option handling in the General tab.

## [1.4.4] - 2026-10-26

### Changed

- **Castle Flags (`hon_flag[0–49]`)**: Relocated the raw 50-byte castle flag editor to the **Experimental** tab so the **Castle** tab stays focused on farm plots, livestock, library books, and fishing records.

## [1.4.3] - 2026-10-26

### Added & Fixed

- **Recruitment Mods Honored in Battle Characters**: Synced "Better Leona Option" (Valeria & Kasumi) and "Kraken Patch" (Abizboah & Rulodia) across both Recruited Characters and Battle Characters tabs, plus in-place recruitment status editing.
- **Listening Crystal Beasts**: Corrected monster IDs (`49`: Abizboah, `50`: Feather, `72`: Siegfried, `74`: Rulodia, `79`: Chuchara).

## [1.4.0] - 2026-10-26

### Added

- **Advanced Character Archetype Editor (`c_kotei_dat`)**: Rune slot unlock levels, elemental affinities (Ranks A–E), slot change locks, equippable gear classes, "Allow Locked / Any Rune" bypass, friendship (`suki_value`), and bulk heal/max actions.
- **Dedicated Castle & Cooking Tabs**: Organized Castle Library Books (`lib_flag`), Farm/Ranch (`hon_flag`), Fishing Records (`tsuri_data`), Cook-Off Progress, Kitchen Stock, Restaurant Menu (`food_menu`), and 40 Cooking Recipes (`food_resipi`).
- **Side Quests & Collections**: Clive Quest timer tracker, Gordon's Trading Quest (`trade_transaction_total`), Listening Crystal Beasts, Escaped Battles, Luca Blight Ambush HP, Richmond's Detective Investigations (`tantei_lv`), 256 Treasure Chests (`t_box_flag`), and Major War Battle Units (`war_data`).

### Fixed

- **Packed-Nibble Magic Points (MP)**: Properly decodes/encodes Current MP (high nibble) and Max MP (low nibble) per spell level.
- **Character Database**: Added missing entry `103: Taki` and fixed duplicate slot `127`.

## [1.3.2] - 2025-12-12

### Fixed

- Fixed Party Slot Identifier and improved keyboard input when editing values manually.

## [1.3.1] - 2025-12-08

### Fixed

- **Save File Format Compatibility**: Added UTF-8 BOM, uppercase `\uXXXX` Unicode escapes, and Windows CRLF line endings to match the exact format expected by *Suikoden II HD Remaster*.

## [1.3.0] - 2025-12-08

### Added & Fixed

- **Smart Item Picker**: Category-filtered item selection dialog automatically updating both `item_no` and `use_cnt` for Party Bag, Warehouse, Room Items, and Battle Character Accessories.
- **Recruitment Mod Toggles**: Added Suikoden 1 Hero (`macd_name`) detection for McDohl/Gremio, "Better Leona Option", and "Kraken Patch" support.
- Fixed item name display across Key Items, Equipment, and Accessories, and fixed Hoi in the character list.

## [1.2.0] - 2025-12-06

### Added & Fixed

- Added **Experimental Tab** (`tantei_lv`, `hon_flag`, `t_box_flag`), Suikoden 1 Recruited Stars (`nakam_1_num`), Cook-Off Battle Progress, Active Party Members (`exit_member`), Key Items (`event_item`), Magic Points (MP) editor, and `Ctrl+D` Debug Save shortcut.
- Added Boris to the character list and reorganized Battle Characters sections.

## [1.1.0] - 2025-12-02

### Added & Fixed

- Added Item Type classification guide (`use_cnt` categories) and Data Values / About tabs accessible before loading a save.
- Fixed rune and equipment name resolution in Party Bag and Warehouse.

## [1.0.0] - 2025-11-28

### Added

- Initial release of the Suikoden II HD Remaster Save Editor with General, Battle Characters, Party Bag, Warehouse, Bath Items, Recruited Characters, Cooking Recipes, Greenhill Aliases, Map Location, and Data Values support.
