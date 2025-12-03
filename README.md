# Suikoden II HD Remaster Save Editor

A minimal, static web-based GUI for editing Suikoden II HD Remaster JSON save files decrypted by SuikodenFix.

**🌐 Live Demo:** [https://faospark.github.io/suisaveeditor/](https://faospark.github.io/suisaveeditor/)  
**📦 Repository:** [https://github.com/faospark/suisaveeditor](https://github.com/faospark/suisaveeditor)

## Features

- **Active Party Members Editor** - Manage your 6-character battle party and 2 convoy slots with character selection dropdowns
- **Key Items Editor** - Dedicated section for story-critical items (event_item array) with 2-column grid layout
- **Battle Characters Editor** - Organized sections for General stats, Magic (MP), Weapon, Runes, Equipment, and Accessories
- **Magic Points (MP) System** - Visual representation with filled/empty squares (■/□) showing MP progress per level
- **Smart Rune Filtering** - Slot-specific and character-specific rune restrictions with locked rune support
- **Castle Editors** - Combined Greenhill Aliases and Food Menu editors in a single view
- **Save File Indicator** - Badge showing which save file number you're currently editing
- **Debug Mode** - Toggle with Ctrl+D to auto-load test save files (state persists across sessions)
- **Offline Support** - Full PWA with service worker for offline editing after first visit
- **Status Bar** - Visual indicators for Debug Mode (green), Offline Mode (orange), and combined states (purple)
- **Tab Navigation** - Data Values, About, and Changelog accessible without loading save files
- Edit character stats, equipment, runes, and recruitment flags
- Manage item inventories (warehouse, party bag, bath items)
- User-friendly interface with organized tabs
- Automatic item name lookup from game data

## Instructions

### Before You Start

> [!IMPORTANT] It is highly recommended that you turn off cloud saving for the game before editing save files and create your own back up

### Step-by-Step Guide

1. **Decrypt your save file** using [SuikodenFix](https://github.com/d3xMachina/Suikoden-Fix)

- Look for files named `_decrypted_gsd2_Data*.json`
  - **Always backup your original save files first!**

2. **Upload your decrypted save**

- Click the upload button and select your `_decrypted_gsd2_Data*.json` file

3. **Edit your save data**

- Navigate through the tabs (General, Battle Characters, Warehouse, etc.)
- Modify values as needed
- Use the Data Values tab as a reference for item IDs and names

4. **Save your changes**

- Click the Save button to download the modified JSON file

5. **Load in game**

- Place/overwrite the save file in the game directory
- Load the game
- **Note**: Sometimes you need to overwrite the save file twice, especially when modifying the most recent save

## Reference

Many thanks to the following contributors for their work on Suikoden II reference data:

- **d3xMachina** - [SuikodenFix](https://github.com/d3xMachina/Suikoden-Fix)
- **Asilverthorn** - [Suikoden Reference Tables](https://github.com/asilverthorn/suikoden_ref/)
- **Suikosource** - [Item Digits Guide](https://suikosource.com/games/gs2/guides/itemdigits.php)
- **makotech222** - [Suikoden II data research](https://github.com/makotech222/suiko2edit)

Find me at my natural habitat and more mods at [Moogles and Mods](https://discord.gg/bSnpVBV)

## Disclaimer

This is a fan-made tool for personal use with Suikoden II HD Remaster save files. Use at your own risk.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
