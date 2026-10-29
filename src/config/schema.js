// Schema Definitions
// Unified configuration for all save file fields

/**
 * Unified field configuration
 * Each key represents a field in the save file with complete metadata
 * @type {Object<string, {label: string, group: string, renderer?: string, columns?: Array, path?: string}>}
 */
export const FIELD_CONFIG = {
  // General Tab
  'party_cha_no': {
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
    label: 'Play Time & Clive Quest Timer',
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
    group: 'Cooking',
    renderer: 'cook_off_progress'
  },
  'food_num': {
    label: "🍲 Hai Yo's Kitchen Ingredient Stock (food_num[0..11] — Max 3 per Ingredient)",
    group: 'Cooking',
    renderer: 'kitchen_stock'
  },
  'tsuri_data': {
    label: "Yam Koo's Fishing Records",
    group: 'Castle',
    renderer: 'fishing_records'
  },
  'side_quests': {
    label: 'Side-Quests, Beasts & Battle Counters',
    group: 'General',
    renderer: 'side_quests'
  },
  'kari_name': {
    label: 'Greenhill Mission Aliases',
    group: 'General',
    renderer: 'castle_editors_combined'
  },
  'food_menu': {
    label: 'Castle Restaurant Menu',
    group: 'Cooking',
    renderer: 'food_menu'
  },
  'food_resipi': {
    label: 'Known Cooking Recipes (40 Recipes — Hai Yo)',
    group: 'Cooking',
    renderer: 'known_recipes'
  },

  // Investigations Tab
  'tantei_lv': {
    label: "Richmond's Detective Investigations (tantei_lv)",
    group: 'Investigations',
    renderer: 'richmond_detective'
  },

  // Castle Tab
  'parts_no': {
    label: "Jude's Guardian Deity Statue & Blueprints",
    group: 'Castle',
    renderer: 'guardian_deity',
    path: 'game_data'
  },
  'lib_flag': {
    label: 'Castle Library Old Books (Vol. 1–12)',
    group: 'Castle',
    renderer: 'library_books'
  },
  'hon_flag': {
    label: 'Castle Farm Plots & Livestock (hon_flag[30–32])',
    group: 'Castle',
    renderer: 'castle_flags'
  },

  // Experimental / Unlocks & Quests Tab
  'hon_flag_raw': {
    label: 'All 50 Castle Flag Bytes (hon_flag[0–49])',
    group: 'Experimental',
    renderer: 'castle_flags_raw'
  },
  't_box_flag': {
    label: 'World Map Treasure Chests (256 Chests)',
    group: 'Experimental',
    renderer: 'treasure_chests'
  },
  'war_data': {
    label: 'Major War Battle Units (war_data)',
    group: 'Experimental',
    renderer: 'war_room'
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

  // Castle Facility: Bath House Items
  'furo_item': {
    label: 'Castle Bath House Items',
    group: 'Castle',
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
  'General': ['party_cha_no', 'location', 'play_time', 'date_time_now', 'bozu_name', 'bozu_name2', 'macd_name', 'm_base_name', 'nakam_1_num', 'base_name', 'team_name', 'base_lv', 'furo_info', 'kaji_lv', 'ninki', 'gold', 'side_quests', 'kari_name'],
  'Battle Characters': ['c_varia_dat'],
  'Recruited Characters': ['chara_flag'],
  'Party Bag': ['event_item', 'party_item'],
  'Warehouse': ['base_item', 'room_item'],
  'Cooking': ['cook_off_progress', 'food_num', 'food_menu', 'food_resipi'],
  'Investigations': ['tantei_lv'],
  'Castle': ['parts_no', 'furo_item', 'lib_flag', 'hon_flag', 'tsuri_data'],
  'Experimental': ['hon_flag_raw', 't_box_flag', 'war_data']
};

/**
 * Group data paths - where to find data for each group
 * @type {Object<string, string|null>}
 */
export const GROUP_PATHS = {
  'General': null,
  'Warehouse': 'game_data',
  'Party Bag': 'party_data',
  'Recruited Characters': null,
  'Battle Characters': 'chara_data',
  'System': 'game_data',
  'Cooking': null,
  'Investigations': null,
  'Castle': null,
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
