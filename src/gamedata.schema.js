/**
 * GameData Schema Reference
 * 
 * This file documents the structure of gamedata.js for AI context optimization.
 * It contains only sample entries to show the data structure.
 * 
 * DO NOT import this file in production code.
 * This exists solely to help AI understand GameData structure without
 * processing 3000+ lines of actual data.
 * 
 * For actual data, always import from './gamedata.js'
 * 
 * Character attributes: C=Cap, E=Helmet, L=Light Armor, H=Heavy Armor, V=Vest, R=Robe,
 * S=Shield, M=Male, F=Female, K=Kobold, W=Winger, N=Nobility, Y=Youth, Z=Monster/Beast
 * 
 * Rune slot types: HR=Head Rune, RH=Right Hand, LH=Left Hand, WR=Weapon Rune, ExR=Exclusive Rune
 * 
 * Item use_cnt values:
 * - 0-9: Regular consumable items
 * - 16: Equipment (helmet, armor, shield, accessories)
 * - 48: Farming items
 * - 64: Trade items / Bath decorations
 * - 80: Base/Warehouse items (recipes, blueprints)
 * - 99+: Food recipes (specific values per recipe)
 */

export const GameDataSchema = {
  /**
   * Character definitions
   * Map<number, {name: string, attrs: string[]}>
   * 
   * Total: 124 characters
   * 
   * Character attributes:
   * - Equipment: C (Cap), E (Helmet), L (Light Armor), H (Heavy Armor), 
   *             V (Vest), R (Robe), S (Shield)
   * - Demographics: M (Male), F (Female), K (Kobold), W (Winger), 
   *                N (Nobility), Y (Youth)
   * - Special: Z (Monster/Beast - cannot equip armor/accessories)
   */
  CHARACTERS: {
    1: { name: "Riou", attrs: ["C", "L", "M", "Y"] },
    2: { name: "Flik", attrs: ["C", "L", "S", "M"] },
    26: { name: "Shiro", attrs: ["Z"] },
    // ... 121 more characters
  },

  /**
   * Rune definitions
   * Map<number, {name: string, attrs: string[]}>
   * 
   * Total: ~103 runes
   * 
   * Rune attributes:
   * - N: Normal (equipable by all characters)
   * - Wep: Weapon slot only
   * - Character ID: Exclusive to that character
   * - ExR: Exclusive runes (cannot be manually equipped)
   */
  RUNES: {
    0: { name: "None", attrs: [] },
    1: { name: "Fire Orb", attrs: ["N", "Wep"] },
    2: { name: "Rage Orb", attrs: ["N", "Wep"] },
    13: { name: "Bright Shield Orb", attrs: ["1", "RH", "X"] },
    // ... ~99 more runes
  },

  /**
   * Regular consumable items (use_cnt: 0-9)
   * Map<number, string>
   * Total: ~85 items
   */
  ITEMS: {
    0: "None",
    1: "Medicine",
    2: "Mega Medicine",
    // ... ~82 more items
  },

  /**
   * Farming items - seeds and animals (use_cnt: 48)
   * Map<number, string>
   * Total: ~8 items
   */
  FARMING: {
    0: "None",
    1: "Cabbage Seed",
    2: "Potato Seed",
    // ... ~5 more items
  },

  /**
   * Trade goods and bath decorations (use_cnt: 64)
   * Map<number, string>
   * Total: ~50 items
   * 
   * Notable ranges:
   * - 1-17: Ornaments and vases
   * - 18-22: Original paintings
   * - 42-44: Karen paintings
   * - 45-50: Statues and decorative items
   */
  TRADE: {
    0: "None",
    1: "Defective Urn",
    18: "Graffiti",
    19: "Flower Painting",
    42: "Pumpkin Painting",
    45: "Dragon Statue",
    // ... ~44 more items
  },

  /**
   * Base/warehouse items - recipes and blueprints (use_cnt: 80)
   * Map<number, string>
   * Total: ~66 items
   */
  BASE_ITEM: {
    0: "None",
    1: "Old book vol 1",
    27: "Dragon Plans 1",
    43: "Recipe#1",
    // ... ~62 more items
  },

  /**
   * Food recipes (use_cnt: 99+, specific values per recipe)
   * Map<number, string>
   * Total: ~240 recipes
   */
  FOOD: {
    0: "None",
    1: "Tamago-Yaki",
    2: "Sweet Omelet",
    // ... ~237 more recipes
  },

  /**
   * Helmets and headgear (use_cnt: 16)
   * Map<number, {name: string, attrs: string[]}>
   * Total: ~13 helmets
   * 
   * Attrs indicate compatible head types: C=Cap, E=Helmet
   */
  HELMET: {
    0: "None",
    1: { name: "Bandanna", attrs: ["C"] },
    2: { name: "Leather Hat", attrs: ["C", "E"] },
    // ... ~10 more helmets
  },

  /**
   * Body armor (use_cnt: 16)
   * Map<number, {name: string, attrs: string[]}>
   * Total: ~24 armor pieces
   * 
   * Attrs: L=Light Armor, H=Heavy Armor, V=Vest, R=Robe
   */
  ARMOR: {
    0: "None",
    13: { name: "Robe", attrs: ["L", "V", "R"] },
    14: { name: "Tunic", attrs: ["L", "V"] },
    // ... ~21 more armor pieces
  },

  /**
   * Shields (use_cnt: 16)
   * Map<number, string>
   * Total: ~7 shields
   */
  SHIELD: {
    0: "None",
    38: "Wooden Shield",
    39: "Iron Shield",
    // ... ~4 more shields
  },

  /**
   * Accessories - boots, gloves, rings, amulets (use_cnt: 16)
   * Map<number, string>
   * Total: ~40 accessories
   */
  OTHER_EQUIP_GEAR: {
    0: "None",
    45: "Wooden Shoes",
    50: "Gloves",
    80: "Magic Ring",
    // ... ~36 more accessories
  },

  /**
   * Beast/monster character IDs that cannot equip armor or accessories
   * Array<number>
   */
  BEASTS: [26, 42, 48, 49, 50, 72, 74, 75, 76, 77, 78, 79],

  /**
   * Equipment type categories
   */
  EQUIPMENT_TYPES: {
    HELMET: "Helmet",
    ARMOR: "Armor",
    SHIELD: "Shield",
    ACCESSORY: "Accessory"
  },

  /**
   * Item category mapping by use_cnt value
   */
  ITEM_TYPES: {
    0: "items",      // Regular items (0-9)
    1: "medicine",   // Medicine items
    16: "equipment", // Armor/accessories
    48: "farming",   // Seeds/animals
    64: "trade",     // Trade goods
    80: "base",      // Warehouse items
    99: "food"       // Recipes (99+)
  }
};

/**
 * Usage Notes:
 * 
 * 1. Character Equipment:
 *    - Characters with 'Z' attribute cannot equip armor/accessories
 *    - Shield requires 'S' attribute
 *    - Armor types: L (Light), H (Heavy), V (Vest), R (Robe)
 *    - Head types: C (Cap), E (Helmet)
 * 
 * 2. Weapons:
 *    - Weapons are NOT separate items
 *    - Each character has their own weapon that levels up via blacksmith
 *    - Weapon levels range from 1-16
 * 
 * 3. Runes:
 *    - Most runes can go in HR/RH/LH slots
 *    - Weapon runes (Wep attribute) are separate
 *    - ExR runes are character-exclusive
 * 
 * 4. Items:
 *    - use_cnt field determines category
 *    - Bath/Room items typically use use_cnt=64 (trade goods)
 *    - Party bag items use various use_cnt values
 * 
 * 5. Data Size:
 *    - Total entries: ~800+ items across all categories
 *    - gamedata.js: ~430 lines, ~35KB
 *    - This schema: ~200 lines, ~8KB
 *    - Token savings: ~80% for AI context
 */
