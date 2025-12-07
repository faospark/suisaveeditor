// Application Constants

export const APP_VERSION = '1.3.0';
export const DEBUG_FILE_PATH = './debug/save.json';

// Character Limits
export const MAX_PLAYABLE_CHARACTERS = 84;
export const MAX_CHARACTERS_WITH_NPC = 125;

// MP System
export const MAX_MP_VALUE = 153;
export const MP_PER_SQUARE = 17;
export const MP_LEVELS = 4;
export const MP_SQUARES_PER_LEVEL = 9;

// Rendering
export const MAX_RENDERED_ITEMS = 200;

// Save File Patterns
export const SAVE_FILE_PATTERNS = [
  /Data(\d+)/i,           // _decrypted_gsd2_Data1.json
  /save[_\s]*(\d+)/i,     // save_3.json or save 3.json
  /slot[_\s]*(\d+)/i,     // slot_2.json
  /file[_\s]*(\d+)/i      // file_1.json
];

// Party Slots
export const BATTLE_PARTY_SLOTS = 6;
export const CONVOY_SLOTS = 2;
export const TOTAL_PARTY_SLOTS = BATTLE_PARTY_SLOTS + CONVOY_SLOTS;

// Character Indices (Special Characters)
export const CHAR_INDEX = {
  MCDOHL: 82,
  GREMIO: 125,
  VALERIA: 12,
  KASUMI: 73,
  CHUCHARA: 79,
  ABIZBOAH: 49,
  RULODIA: 74
};

// Recruitment Status Values
export const RECRUIT_STATUS = {
  NOT_RECRUITED: 0,
  SPOKE_TO: 1,
  AUTO_JOIN: 70,
  MANUAL_RECRUIT: 71,
  EVENT_LOCKED: 86,
  DECEASED: 212,
  ON_LEAVE: 213
};

// Event Flag Indices
export const EVENT_FLAG_INDEX = {
  COOK_OFF_BYTE1: 152,
  COOK_OFF_BYTE2: 153
};

// Cook-Off Progress Values
export const COOK_OFF_STAGES = [
  [0, 0, 32],     // No matches
  [1, 1, 32],     // Ky Yun
  [2, 3, 32],     // Goetsu
  [3, 7, 32],     // Shinki
  [4, 15, 32],    // Ryuki
  [5, 31, 32],    // Bashok
  [6, 63, 32],    // Ryuko
  [7, 127, 32],   // Antoio
  [8, 255, 32],   // Gyokuran
  [9, 255, 33],   // Retso
  [10, 255, 35],  // Lester
  [11, 255, 39],  // Retso
  [12, 255, 47]   // Jinkai (Complete)
];
