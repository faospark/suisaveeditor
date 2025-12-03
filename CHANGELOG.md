# Changelog

All notable changes to the Suikoden II HD Remaster Save Editor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
