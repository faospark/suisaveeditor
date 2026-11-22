Bright Shield Save Editor — Native Rust Desktop Edition
========================================================
Save editor for Suikoden II HD Remaster (Suikoden I & II HD Remaster).

QUICK START
-----------
1. Extract the entire contents of this ZIP archive to a folder of your choice
   (keep `BrightShield.exe` and the `portraits\` folder together).
2. Ensure BepInEx and SuikodenFix (`EditSave = true` in
   `BepInEx\config\d3xMachina.suikoden_fix.cfg`) are installed for your game.
3. Launch `BrightShield.exe`. The editor automatically detects your decrypted
   saves in `<GAME_PATH>\SuikodenFix\Decrypted\gsd2\`.
4. Before any edit, `.bak` backups are silently saved inside `backups\` and can
   be compared and restored at any time from the Saves tab.

SHORTCUTS
---------
- Ctrl+O : Open a standalone .json save file
- Ctrl+S : Save current changes
- Esc    : Close open modal dialogs

THIRD-PARTY LICENSES & ACKNOWLEDGMENTS
--------------------------------------

1. Noto Sans & Noto Sans CJK (Embedded UI Fonts)
   - Fonts: Noto Sans (Variable Regular–Bold) and Noto Sans CJK JP Regular
     (covering Latin/European scripts, Japanese, Simplified Chinese, and
     Traditional Chinese)
   - Sources:
       https://github.com/notofonts/latin-greek-cyrillic
       https://github.com/notofonts/noto-cjk
   - Copyright:
       Copyright 2014-2023 Adobe (http://www.adobe.com/), with Reserved Font
       Name 'Source'.
       Copyright 2014-2023 Google LLC. All Rights Reserved.
   - License: SIL Open Font License, Version 1.1 (OFL-1.1)
   - The full text of the SIL Open Font License 1.1 is included in this archive
     as `OFL.txt` and is also available at https://scripts.sil.org/OFL.
   - Note: These fonts are bundled unmodified for UI text rendering and are not
     sold by themselves.

2. Material Symbols Rounded (Embedded Icon Font)
   - Font: Material Symbols Rounded (Google Fonts)
   - Source: https://github.com/google/material-design-icons
   - Copyright: Copyright Google LLC.
   - License: Apache License, Version 2.0
   - The full text of the Apache License 2.0 is included in this archive as
     `LICENSE-APACHE.txt` and is also available at
     https://www.apache.org/licenses/LICENSE-2.0.

3. iced (GUI Framework)
   - Source: https://github.com/iced-rs/iced
   - License: MIT License
