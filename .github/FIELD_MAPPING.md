# Save File Field Mapping Reference

## Purpose
This document maps JSON save file structure to editor field names to prevent confusion during development.

---

## Root Level Fields (NOT in game_data)
These fields exist at the top level of the JSON, alongside `game_data`, `war_data`, etc.

| JSON Field | Location | Editor Field Name | Description |
|------------|----------|-------------------|-------------|
| `version` | Root | N/A | Save file version (100) |
| `chara_flag` | Root | `chara_flag` | Recruitment flags (128 bytes) |
| `town_flag` | Root | `town_flag` | Town visit flags (71 bytes) |
| `event_flag` | Root | `event_flag` | Story event flags (256 bytes) - **Indices 152-153: Cook-Off Battle progress** |
| `scpoi_flag` | Root | `scpoi_flag` | Scenic point flags (8 bytes) |
| **`t_box_flag`** | **Root** | **`t_box_flag`** | **Treasure chest flags (32 bytes, 256 chests)** |
| `back_log_list` | Root | N/A | Message history |
| `px`, `py` | Root | N/A | Position data |
| `date_time_now` | Root | N/A | Save timestamp |

---

## game_data Fields
These fields are inside `game_data` object.

### General Tab Fields
| JSON Field | Editor Field Name | Description |
|------------|-------------------|-------------|
| `bozu_name` | `bozu_name` | Hero Name (Suikoden 2) |
| `bozu_name2` | `bozu_name2` | Hero Name (Real) |
| `macd_name` | `macd_name` | Hero Name (Suikoden 1) |
| `m_base_name` | `m_base_name` | Suikoden 1 HQ Name |
| **`nakam_1_num`** | **`nakam_1_num`** | **S1 Recruited ⭐ (108 = Gremio alive) - READ ONLY** |
| `base_name` | `base_name` | Castle Name |
| `team_name` | `team_name` | Army Name |
| `base_lv` | `base_lv` | Castle Level |
| `kaji_lv` | `kaji_lv` | Blacksmith Level |
| `furo_info[0]` | `furo_info` | Bath Level |
| `play_time` | `play_time` | Play Time (array: [hours, minutes, seconds]) |

### Experimental Tab Fields
| JSON Field | Location | Description | Notes |
|------------|----------|-------------|-------|
| **`hon_flag`** | `game_data.hon_flag` | Castle flags (50 bytes) | Indices 30-31: Vegetables (0xFF=full), Index 32: Farm animals |
| **`tantei_lv`** | `game_data.tantei_lv` | Richmond's Detective Clues (64 bytes) | Bit flags for detective minigame progress |
| **`t_box_flag`** | **ROOT LEVEL** | Treasure chest flags (32 bytes) | 256 treasure chests (32 bytes × 8 bits) |

### Other game_data Fields
- `party_item` → Party Bag (30 items)
- `event_item` → Key Items (10 items)
- `base_item` → Warehouse (60 items)
- `member_no` → Party Members (6 battle + 2 convoy)
- `c_varia_dat` → Battle Character Stats
- `chara_data` → Party Member Details
- `food_menu` → Cooking Contest Winners
- `food_resipi` → Known Recipes
- `furo_item` → Bath Decorations (8 items)
- `room_item` → Room Decorations (8 items)

---

## party_data Fields
- `party_item` → Party inventory items
- `event_item` → Key items
- `gold` → Money

---

## Data Path Resolution Rules

1. **Root-level fields**: Direct access
   - Example: `data.t_box_flag`

2. **game_data fields**: Access via `game_data`
   - Example: `data.game_data.hon_flag`

3. **party_data fields**: Access via `party_data`
   - Example: `data.party_data.gold`

---

## Schema Configuration Notes

### FIELD_CONFIG Structure
```javascript
FIELD_CONFIG['field_name'] = {
  label: 'Display Label',
  group: 'Tab Name',
  renderer: 'renderer_name', // optional
  readonly: true | false,
  min: 0, // For numbers
  max: 255 // For numbers
}
```

### EDITOR_GROUPS Structure
```javascript
EDITOR_GROUPS = {
  'Tab Name': ['field1', 'field2', 'field3']
}
```
**CRITICAL:** Fields listed here MUST exist in FIELD_CONFIG!

---

## Known Issues & Common Mistakes

### ❌ What I Keep Missing:
1. Adding fields to `FIELD_CONFIG` but forgetting to add them to `EDITOR_GROUPS`
2. Assuming all fields are in `game_data` (some are at root level like `t_box_flag`)
3. Not updating rendering logic in `main.js` to handle new field types
4. Declaring fields but never rendering them in UI
5. Forgetting to update GROUP_PATHS for tabs that use different data locations

### ✅ Correct Implementation Checklist:
- [ ] Add field to `FIELD_CONFIG` in `src/config/schema.js` with proper configuration
- [ ] Add field to appropriate `EDITOR_GROUPS` array in `src/config/schema.js`
- [ ] Verify data path (root vs game_data vs party_data)
- [ ] Update `GROUP_PATHS` if field is not in standard location
- [ ] Update rendering logic in `main.js` if custom renderer needed
- [ ] Test in browser to confirm field appears
- [ ] Update `sw.js` cache version if config changed

---

## Experimental Tab Implementation

### Fields Required:
1. `tantei_lv` (game_data) - Richmond's Detective Clues
2. `hon_flag` (game_data) - Castle Flags (vegetables + animals)
3. `t_box_flag` (ROOT LEVEL) - Treasure Chests

### Special Handling Needed:
- `t_box_flag` is at root level, so must be accessed as `data.t_box_flag`
- All three should render as collapsible `<details>` elements
- Use 8-column grid layout for array editing
- Each array element needs number input (0-255 range)

---

## Farming System Documentation

### Vegetable Plots (`hon_flag[30-31]`)
- **Location**: `game_data.hon_flag[30]` and `game_data.hon_flag[31]`
- **Format**: Bit flags (each bit = one plot state)
- **Values**:
  - `0xFF` (255) = All vegetables full/grown
  - `0xF0` (240) = Plots empty
  - `0xDF` (223) = Partial growth (e.g., only cabbage plot full)

### Farm Animals (`hon_flag[32]`)
- **Location**: `game_data.hon_flag[32]`
- **Format**: Bit flags or counter
- **Values**: TBD (testing needed)

### Farming Items (GameData.FARMING)
Seeds and animals that can be planted/raised:
- 1: Cabbage Seed
- 2: Potato Seed
- 3: Spinach Seed
- 4: Tomato Seed
- 5: Chick
- 6: Piglet
- 7: Lamb
- 8: Calf

---

## Future Improvements

### Potential New Tabs:
- [ ] Event Flags tab (256 bytes, story progress)
- [ ] Town Flags tab (71 bytes, town unlocks)
- [ ] Clive's Quest progress (detailed tracking)
- [ ] Rare Find tracking
- [ ] Cooking Recipe unlocks

### Rendering Enhancements:
- [ ] Binary viewer for bit flags (show 8 bits per byte)
- [ ] Hex editor mode for advanced users
- [ ] Search/filter for large arrays
- [ ] Bulk edit operations (set all to 0, set all to 255)
- [ ] Undo/redo functionality

---

## Version History

- **2025-12-05**: Initial documentation created
  - Documented root vs game_data field locations
  - Added farming system details (hon_flag[30-32])
  - Created implementation checklist to prevent future mistakes
