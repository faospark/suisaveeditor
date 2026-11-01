# Suikoden II HD Remaster Save Editor

A minimal, fast, and feature-rich GUI editor for Suikoden II HD Remaster JSON save files decrypted via SuikodenFix or SuikodenSaveDecrypter.

**🌐 Web App:** [https://faospark.github.io/suisaveeditor/](https://faospark.github.io/suisaveeditor/)  
**💻 Offline Desktop App:** Standalone Windows executable powered by Tauri v2 (100% offline, zero installation)  
**📦 Repository:** [https://github.com/faospark/suisaveeditor](https://github.com/faospark/suisaveeditor)  
**💬 Community & Mods:** [Moogles and Mods Discord](https://discord.gg/bSnpVBV)

---

## Key Features

### 🎮 Party & Character Editors
- **Active Party Members**: Configure all 6 combat battle party slots and 2 convoy slots with live portrait previews and slot dropdowns.
- **Battle Characters Editor**: Comprehensive character cards featuring local HD portraits (`fp_###.png`), General stats, Friendship rating (`suki_value`), Level, and EXP.
- **Interactive Item & Accessory Pickers**: Searchable modal dialogs with keyboard ESC and backdrop dismissal for seamless equipment selection.
- **Magic Points (MP) Grid**: Visual representation with filled/empty squares (■/□) tracking MP level progressions.
- **Smart Rune Management**: Slot-specific and character-specific rune restrictions with support for locked runes.

### 🛡️ Advanced Character Archetypes (`c_kotei_dat`)
- **Rune Slot Unlock Levels**: Granular control over Head, Right Hand, and Left Hand rune slot level requirements (`mon_kosu_type`).
- **Elemental Affinities**: Customize all 8 elemental resistances and damage multipliers (`mon_zoku_aisyo`).
- **Equipment & Rune Locks**: Toggle unequip locks across 8 gear and rune slots (`soubi_henkou`).
- **Equippable Gear Classes**: Expand equippable armor and accessory types (`soubi_kanou`) per character, with bulk unlock/lock actions.

### 👥 Recruitment Cards Grid
- **Portrait Card Matrix**: Responsive visual cards featuring character portraits, star numbers, and dynamic recruitment status badges (`Recruited`, `Recruited via SFix`, `Recruited via Kraken`, `Spoke To`, `Deceased`, `Event Locked`).
- **Live Search & Filter Toolbar**: Instant real-time filtering by character name, numeric ID, or recruitment status.
- **Live Star Counter**: Real-time counter badge tracking recruited stars of destiny.
- **Recruitment Mod Compatibility**: Built-in support for "Better Leona Option" (Valeria & Kasumi) and "Kraken Patch" (Chuchara, Abizboah, Rulodia).
- **Smart Story Flags & Item Reset**: Interactive `🔄 Reset` button for characters with complex multi-step story flags (Badeaux, Tenkou, Simone, Vincent, Annallee, Alberto, Connell, Tony, Wakaba, Tessai, Tomo, Feather, Ayda). Setting status to `0: Not Recruited` automatically clears their linked `event_flag` bits and removes granted items (e.g. 2× Listening Crystals) to allow clean re-recruitment in-game.

### 🚩 Story & Event Flags (`event_flag[0..255]`)
- **Full 256-Byte Array Exposed**: Complete access to all 256 event flag bytes ($2,048$ digital switches) driving story progression, cutscenes, and NPC spawns.
- **Annotated Knowledge Base**: Pre-labeled known story flags (Badeaux, Tenkou, Simone & Vincent, Annallee, Alberto, Connell, Tony, Wakaba, Tessai, Tomo, Feather & Ayda, Clive Milestones, Hai Yo Cook-Offs).
- **Interactive 8-Bit Checkbox Matrix**: Granular bit toggles (`b0` to `b7`) with bitmask labels alongside synchronized Decimal (`0..255`) and Hexadecimal inputs.
- **Live Search & Filter**: Filter by flag index (`#211`, `#230`), character name, area, or active status (`> 0`).

### 🏆 Side-Quests & Collection Unlocks
- **Clive Quest Time-Trial Tracker**: Evaluates in-game play time against all 8 story milestones and completion flags (`event_flag[94]`).
- **Cooking Recipes**: Individual checkboxes and bulk unlock/clear controls for all 40 Hai Yo recipes (`food_resipi`).
- **Library Old Books**: Full collection tracking for all 12 Old Books (`lib_flag`).
- **Castle Farm & Livestock**: Toggle all pigs, sheep, and chickens (`hon_flag`).
- **Treasure Chest Matrix**: Bulk check or uncheck all 256 world treasure chests (`t_box_flag`).
- **Richmond Investigations**: Set investigation completion levels (`tantei_lv`) for all 108 stars.
- **War Battle Units**: Manage unlocked major war combat units (`war_data`).
- **Gordon's Trading Quest**: Edit total trade transaction profits (`trade_transaction_total`).

### 🎒 Inventories & Castle Customization
- **Key Items Editor**: Dedicated 2-column grid for story-critical key items (`event_item`).
- **Warehouse & Party Bag**: Full item inventory tables with item ID auto-lookup.
- **Castle Facilities**: Bath Items, Room Decor, Greenhill Castle Aliases, Food Menus, and Guardian Deity customizer.

### ⚡ Platforms & Offline Utility
- **Desktop Executable (Tauri v2)**: Standalone Windows `.exe` (`suisaveeditor.exe`) with all assets baked in for 100% full offline capability.
- **Clean Web Version**: Fast static web app with zero service worker cache interference—fresh code loads immediately upon refresh.

---

## Instructions

### Before You Start

> [!IMPORTANT]
> **Always backup your original save files first!**  
> It is also highly recommended to temporarily disable Steam Cloud saving for Suikoden I & II HD Remaster while editing save files to prevent Steam from overwriting your edits.

### Step-by-Step Guide

1. **Decrypt your save file**:
   - Use [SuikodenFix](https://github.com/d3xMachina/Suikoden-Fix) (enable save editing in its config). Decrypted JSON save files will appear as `_decrypted_gsd2_Data*.json` in your game root or `SuikodenFix\Backup\gsd2\`.
   - Alternatively, decrypt your raw save file using [SuikodenSaveDecrypter](https://github.com/d3xMachina/SuikodenSaveDecrypter).
2. **Load your decrypted save**:
   - Click **Choose File** (or drag and drop your `.json` file anywhere onto the action bar).
   - The status badge will confirm the file name and detected save slot number.
3. **Edit your save data**:
   - Navigate through the editor tabs (Party, Battle Characters, Recruitment, Inventories, Unlocks & Quests).
   - Use the **Data Values** tab in the top header as a reference for item IDs, runes, and character slot values.
4. **Save and download**:
   - Click **Save / Download JSON** to export your updated save file.
5. **Load in game**:
   - Replace the decrypted JSON file in your game directory (or re-encrypt if required by your setup) and launch the game.

---

## References & Credits

Special thanks to the following contributors and projects for their research and tools:

- **d3xMachina** - [SuikodenFix](https://github.com/d3xMachina/Suikoden-Fix) & [SuikodenSaveDecrypter](https://github.com/d3xMachina/SuikodenSaveDecrypter)
- **Asilverthorn** - [Suikoden Reference Tables](https://github.com/asilverthorn/suikoden_ref/)
- **Suikosource** - [Suikosource Guides & Item Digits](https://suikosource.com/games/gs2/guides/itemdigits.php)
- **makotech222** - [Suikoden II Data Research](https://github.com/makotech222/suiko2edit)

---

## Disclaimer

This is an unofficial, open-source fan-made utility for Suikoden II HD Remaster. Use at your own risk and always keep backups of your save files.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
