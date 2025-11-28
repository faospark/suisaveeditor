# Rune Attributes System

## Overview
Each rune in the RUNES gamedata object now includes an `attrs` array that defines equipment restrictions and behavior.

## Attribute Definitions

### Equipment Scope Attributes
- **`N`** - Normal/Universal: Can be equipped by everyone
- **`Wep`** - Weapon Rune: Can be equipped to weapons
- **`ExR`** - Exclusive to Weapons: Should NOT appear in dropdown for battle character equipped runes (weapon-only)

### Character-Specific Attributes
- **Number (e.g., `"1"`, `"82"`)** - Character Index: Rune should only appear if the character index matches this number

### Slot-Specific Attributes
- **`RH`** - Right Hand: Exclusive to right hand slot
- **`LH`** - Left Hand: Exclusive to left hand slot
- **`HR`** - Head Rune: Exclusive to head slot

### Special Behavior
- **`X`** - Locked: If a character equips this rune, it should be locked in place and cannot be edited

## Implementation Notes

### Battle Character Runes Dropdown
When populating rune dropdowns for battle characters:
1. Filter out runes with `ExR` attribute (weapon-exclusive runes)
2. Filter by character index - only show runes that:
   - Have `N` attribute (universal), OR
   - Have the current character's index in their attrs array
3. Filter by slot type:
   - For head slot: only show runes with `HR` or `N` attributes
   - For right hand: show runes with `RH` or `N` attributes (exclude `LH`)
   - For left hand: show runes with `LH` or `N` attributes (exclude `RH`)
4. If a rune has `X` attribute and is already equipped, disable editing for that slot

### Example Runes

```javascript
11: { "name": "Soul Eater", "attrs": ["82", "RH", "X"] }
// - Only for character index 82
// - Right hand only
// - Locked when equipped

94: { "name": "Hunter Orb", "attrs": ["Wep", "ExR"] }
// - Weapon rune
// - Exclusive to weapons (won't show in character rune dropdowns)

19: { "name": "Titan Orb", "attrs": ["3", "10", "11", "13", "16", "32", "34"] }
// - Only available for characters with indices 3, 10, 11, 13, 16, 32, or 34
```
