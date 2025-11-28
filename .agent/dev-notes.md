# Development Notes

## Browser Caching Issue
When making changes to JavaScript files (especially `gamedata.js`), the browser and XAMPP will cache the old version.

**Solution**: Always perform a hard refresh after making changes:
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## GameData Structure
The `gamedata.js` file uses `use_cnt` values to categorize items:
- `0-9`: ITEMS (consumables)
- `16`: Equipment (HELMET, ARMOR, SHIELD, OTHER_EQUIP)
- `32`: RUNES
- `48`: FARMING items
- `64`: TRADE items
- `80`: BASE_ITEM (warehouse)
- `99+`: FOOD recipes

## Adding New Items
1. Edit `src/gamedata.js` and add the item to the appropriate category
2. Save the file
3. Hard refresh the browser (Ctrl + Shift + R)
4. Test with a save file to verify the item appears correctly
