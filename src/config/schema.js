// Schema Definitions
// Unified configuration for all save file fields

/**
 * Unified field configuration
 * Each key represents a field in the save file with complete metadata
 * @type {Object<string, {label: string, group: string, renderer?: string, columns?: Array, path?: string}>}
 */
export const FIELD_CONFIG = {
  // General Tab
  'exit_member': {
    label: 'Active Party Members',
    group: 'General',
    renderer: 'party_members'
  },
  'location': {
    label: 'Location',
    group: 'General',
    renderer: 'location'
  },
  'play_time': {
    label: 'Play Time',
    group: 'General',
    renderer: 'play_time'
  },
  'date_time_now': {
    label: 'Last Modified (In-Game)',
    group: 'General'
  },
  'bozu_name': {
    label: 'Hero Name (Suikoden 2)',
    group: 'General'
  },
  'bozu_name2': {
    label: 'Hero Name (Real)',
    group: 'General'
  },
  'macd_name': {
    label: 'Hero Name (Suikoden 1)',
    group: 'General'
  },
  'm_base_name': {
    label: 'Suikoden 1 HQ Name',
    group: 'General'
  },
  'nakam_1_num': {
    label: 'S1 Recruited ⭐',
    group: 'General',
    readonly: true
  },
  'base_name': {
    label: 'Castle Name',
    group: 'General'
  },
  'team_name': {
    label: 'Army Name',
    group: 'General'
  },
  'base_lv': {
    label: 'Castle Level',
    group: 'General'
  },
  'furo_info': {
    label: 'Bath House Level',
    group: 'General',
    renderer: 'bath_level'
  },
  'kaji_lv': {
    label: 'Blacksmith Level',
    group: 'General'
  },
  'ninki': {
    label: 'Popularity',
    group: 'General'
  },
  'gold': {
    label: 'Potch',
    group: 'General'
  },
  'cook_off_progress': {
    label: 'Cook-Off Battles Won',
    group: 'General',
    renderer: 'cook_off_progress'
  },
  'tantei_lv': {
    label: "Richmond's Detective Clues (64 bytes, bit flags)",
    group: 'Experimental'
  },
  'hon_flag': {
    label: 'Castle Flags ([30-31]=Veggies 255=full, [32]=Animals)',
    group: 'Experimental'
  },
  't_box_flag': {
    label: 'Treasure Chests (32 bytes, 256 chests total)',
    group: 'Experimental'
  },
  'kari_name': {
    label: 'Greenhill Mission Aliases',
    group: 'General',
    renderer: 'castle_editors_combined'
  },
  'food_menu': {
    label: 'Castle Menu Orders',
    group: 'General',
    renderer: 'skip'
  },

  // Battle Characters Tab
  'c_varia_dat': {
    label: 'Battle Character Data',
    group: 'Battle Characters',
    renderer: 'battle_characters',
    path: 'chara_data'
  },

  // Party Bag Tab
  'event_item': {
    label: 'Key Items',
    group: 'Party Bag',
    renderer: 'key_items',
    path: 'party_data'
  },
  'party_item': {
    label: 'Inventory',
    group: 'Party Bag',
    renderer: 'table',
    columns: ['item_no', 'use_cnt'],
    path: 'party_data'
  },

  // Warehouse Tab
  'base_item': {
    label: 'Warehouse Items',
    group: 'Warehouse',
    renderer: 'table',
    columns: ['item_no', 'use_cnt'],
    path: 'game_data'
  },
  'room_item': {
    label: 'Room Items',
    group: 'Warehouse',
    renderer: 'table',
    columns: ['item_no', 'use_cnt'],
    path: 'game_data',
    warning: '⚠️ Experimental feature - Room items are unused in the game. Purpose unknown. Edit at your own risk.'
  },

  // Bath Tab
  'furo_item': {
    label: 'Bath Items',
    group: 'Bath',
    renderer: 'bath_items',
    path: 'game_data'
  },

  // Recruited Characters Tab
  'chara_flag': {
    label: 'Recruited Characters',
    group: 'Recruited Characters',
    renderer: 'recruitment'
  },

  // Location fields (used by location renderer)
  'area_no': {
    label: 'Area Location',
    group: 'General'
  },
  'town_no': {
    label: 'Town No',
    group: 'General'
  },
  'map_no': {
    label: 'Map No',
    group: 'General'
  },
  'px': {
    label: 'Player X Coordinate',
    group: 'General'
  },
  'py': {
    label: 'Player Y Coordinate',
    group: 'General'
  },

  // Character-level fields (used in battle characters)
  'para': {
    label: 'Stats'
  },
  'mon_eqp': {
    label: 'Runes'
  },
  'item_eqp': {
    label: 'Accessories'
  },
  'bogu_eqp': {
    label: 'Equipment'
  },
  'level': {
    label: 'Level'
  },
  'exp': {
    label: 'Experience'
  },
  'now_hp': {
    label: 'Current HP'
  },
  'max_hp': {
    label: 'Max HP'
  },
  'now_mp': {
    label: 'Current MP'
  },
  'max_mp': {
    label: 'Max MP'
  },
  'buki_lv': {
    label: 'Weapon Level'
  },
  'buki_mon': {
    label: 'Weapon Rune'
  },
  'todome': {
    label: 'Killed Enemies'
  },
  'mp': {
    label: 'MP'
  },

  // Item fields
  'item_no': {
    label: 'Item ID'
  },
  'use_cnt': {
    label: 'Count'
  },

  // Other fields
  'version': {
    label: 'Save Version'
  },
  'chara_data': {
    label: 'Character Data'
  },
  'war_data': {
    label: 'War Battle Data'
  },
  'nige_cnt': {
    label: 'Escaped Battles'
  },
  'ckd_info': {
    label: 'Character Status List'
  },
  'leader_no': {
    label: 'War Leader IDs'
  },
  'sub_no': {
    label: 'War Sub-Unit IDs'
  },
  'sub_to_leader': {
    label: 'Sub-Unit Assignment'
  },
  'money': {
    label: 'Potch'
  }
};

/**
 * Group definitions - defines tab structure
 * @type {Object<string, Array<string>>}
 */
export const EDITOR_GROUPS = {
  'General': ['exit_member', 'location', 'play_time', 'date_time_now', 'bozu_name', 'bozu_name2', 'macd_name', 'm_base_name', 'nakam_1_num', 'base_name', 'team_name', 'base_lv', 'furo_info', 'kaji_lv', 'ninki', 'gold', 'cook_off_progress', 'kari_name', 'food_menu'],
  'Battle Characters': ['c_varia_dat'],
  'Recruited Characters': ['chara_flag'],
  'Party Bag': ['event_item', 'party_item'],
  'Warehouse': ['base_item', 'room_item'],
  'Bath': ['furo_item'],
  'Experimental': ['tantei_lv', 'hon_flag', 't_box_flag']
};

/**
 * Group data paths - where to find data for each group
 * @type {Object<string, string|null>}
 */
export const GROUP_PATHS = {
  'General': null,
  'Warehouse': 'game_data',
  'Bath': 'game_data',
  'Party Bag': 'party_data',
  'Recruited Characters': null,
  'Battle Characters': 'chara_data',
  'System': 'game_data',
  'Experimental': null
};

// Legacy exports for backward compatibility (to be deprecated)
export const EDITOR_LABELS = Object.fromEntries(
  Object.entries(FIELD_CONFIG).map(([key, config]) => [key, config.label])
);

export const RENDERER_TYPES = Object.fromEntries(
  Object.entries(FIELD_CONFIG)
    .filter(([_, config]) => config.renderer)
    .map(([key, config]) => [key, config.renderer])
);

export const TABLE_COLUMNS = Object.fromEntries(
  Object.entries(FIELD_CONFIG)
    .filter(([_, config]) => config.columns)
    .map(([key, config]) => [key, config.columns])
);
