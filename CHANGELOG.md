# Changelog

All notable changes to the Suikoden II HD Remaster Save Editor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
