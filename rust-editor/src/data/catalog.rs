use crate::data::{opt, regular_item_name, NamedOption};

// ============================================================================
// Cooking: 12 Ingredients & 40 Recipes (base dish = FOOD[(n-1)*6 + 1])
// ============================================================================

pub const INGREDIENTS: [&str; 12] = [
    "Cabbage",
    "Potato",
    "Spinach",
    "Tomato",
    "Egg",
    "Pork",
    "Beef",
    "Mutton",
    "Whitefish",
    "Shellfish",
    "Shrimp",
    "Salmon",
];

pub const RECIPE_DISH_NAMES: [&str; 40] = [
    "Tamago-Yaki",
    "Tomato Soup",
    "Ohitashi",
    "Salad",
    "Gyoza",
    "Chowder",
    "BBQ Meat Bun",
    "Buttered Clams",
    "Fish Fry",
    "Ice Cream",
    "Quiche",
    "Sandwich",
    "Meat Pie",
    "Simmered Fish",
    "Fried Fish Balls",
    "Sunomono",
    "Cake",
    "Croquettes",
    "Pasta",
    "Tempura",
    "Grilled Fish",
    "Gratin",
    "Rice Omelet",
    "Fried Rice",
    "Pizza",
    "Teriyaki",
    "Tonkatsu",
    "Curry Rice",
    "Grilled Beef",
    "Ramen",
    "Hamburger",
    "Obento",
    "Sushi",
    "Japanese Stew",
    "Full Course",
    "Genghis Khan",
    "Steak",
    "Sashimi Combo",
    "Special Stew",
    "Kaiseki Dinner",
];

pub const RECIPE_LOCATIONS: [&str; 40] = [
    "Hai Yo starting recipe",
    "Cook-Off #1 (Ky Yun)",
    "Muse — Dr. Huan (after recruiting Tuta)",
    "Hai Yo starting recipe",
    "Coronet — Inn 2F (Man)",
    "Hai Yo starting recipe",
    "Hai Yo starting recipe",
    "Cook-Off #2 (Goetsu)",
    "South Window — House (vd01)",
    "Hai Yo starting recipe",
    "Kuskus — Item Shop (Rare Find)",
    "Kobold Forest — EagleMan drop",
    "Kobold Village — Elder's House",
    "Radat — Tavern Chef (vd19)",
    "Hai Yo starting recipe",
    "Lakewest — Taki's House shelf (vh02)",
    "Cook-Off #3 (Shinki)",
    "Radat — Item Shop (Rare Find)",
    "Cook-Off #4 (Ryuki)",
    "Greenhill — Inn (ve10)",
    "Two River Sewers — Land Shark drop",
    "Cook-Off #6 (Ryuko)",
    "Two River (Human) — Item Shop (Rare Find)",
    "Cook-Off #5 (Bashok)",
    "Greenhill — Item Shop (Rare Find)",
    "Forest Village — Item Shop (Rare Find)",
    "Cook-Off #8 (Gyokuran)",
    "Gregminster — Item Shop (Rare Find)",
    "Matilda Forest Path — Zombie Slug drop",
    "Cook-Off #7 (Antonio)",
    "Kobold Village — Item Shop (Rare Find)",
    "Highway Village — Kent's Mother",
    "Cook-Off #10 (Lester)",
    "Greenhill Forest — Yellow DoReMi Elf drop",
    "Muse — Item Shop (Rare Find, late game)",
    "Rockaxe — Highland Soldier drop",
    "Rockaxe Castle — Gorudo's Room",
    "Cook-Off #9 / #11 (Retso)",
    "Gregminster — Gremio (S1 108-Star import)",
    "Cook-Off #12 (Jinkai)",
];

// ============================================================================
// Key Items (party_data.event_item[0..5])
// ============================================================================

pub fn key_item_options() -> Vec<NamedOption> {
    let ids = [
        0, 29, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 72, 73, 74,
    ];
    ids.into_iter().map(|id| opt(id, regular_item_name(id))).collect()
}

// ============================================================================
// Guardian Deity Blueprints & Beasts (game_data.parts_no)
// ============================================================================

pub const GUARDIAN_BEASTS: &[NamedOption] = &[
    opt(0, "Dragon"),
    opt(1, "Unicorn"),
    opt(2, "Rabbit"),
    opt(3, "Turtle"),
];

pub struct BlueprintDef {
    pub byte_idx: usize,
    pub bit_idx: u8,
    pub base_item_id: i64,
    pub name: &'static str,
    pub segment: &'static str,
    pub loc: &'static str,
}

pub const GUARDIAN_BLUEPRINTS: &[BlueprintDef] = &[
    BlueprintDef { byte_idx: 0, bit_idx: 0, base_item_id: 27, name: "Dragon Plans #1", segment: "Head", loc: "Ryube Outskirts (Wild Pig drop)" },
    BlueprintDef { byte_idx: 0, bit_idx: 1, base_item_id: 28, name: "Dragon Plans #2", segment: "Body", loc: "Mt. Senhu Trail Chest" },
    BlueprintDef { byte_idx: 0, bit_idx: 2, base_item_id: 29, name: "Dragon Plans #3", segment: "Legs", loc: "Tinto Mines (Lizard drop)" },
    BlueprintDef { byte_idx: 0, bit_idx: 3, base_item_id: 30, name: "Dragon Plans #4", segment: "Tail", loc: "Crom Village (Boy behind Elder)" },
    BlueprintDef { byte_idx: 0, bit_idx: 4, base_item_id: 31, name: "Unicorn Plans #1", segment: "Head", loc: "Radat Town (White Wolf drop)" },
    BlueprintDef { byte_idx: 0, bit_idx: 5, base_item_id: 32, name: "Unicorn Plans #2", segment: "Body", loc: "Two River Winger Quarter Sewer" },
    BlueprintDef { byte_idx: 0, bit_idx: 6, base_item_id: 33, name: "Unicorn Plans #3", segment: "Legs", loc: "Mt. Rakutei Summit Chest" },
    BlueprintDef { byte_idx: 0, bit_idx: 7, base_item_id: 34, name: "Unicorn Plans #4", segment: "Tail", loc: "Coronet Wharf Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 0, base_item_id: 35, name: "Rabbit Plans #1", segment: "Head", loc: "South Window City Hall Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 1, base_item_id: 36, name: "Rabbit Plans #2", segment: "Body", loc: "Banner Village (Samurai drop)" },
    BlueprintDef { byte_idx: 1, bit_idx: 2, base_item_id: 37, name: "Rabbit Plans #3", segment: "Legs", loc: "Forest Path to Matilda Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 3, base_item_id: 38, name: "Rabbit Plans #4", segment: "Tail", loc: "Greenhill Forest Path Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 4, base_item_id: 39, name: "Turtle Plans #1", segment: "Head", loc: "Two River Kobold District Well" },
    BlueprintDef { byte_idx: 1, bit_idx: 5, base_item_id: 40, name: "Turtle Plans #2", segment: "Body", loc: "Radat Rope Minigame Prize" },
    BlueprintDef { byte_idx: 1, bit_idx: 6, base_item_id: 41, name: "Turtle Plans #3", segment: "Legs", loc: "Mt. Tigerwolf Path Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 7, base_item_id: 42, name: "Turtle Plans #4", segment: "Tail", loc: "Kuskus Town (Appraiser Woman)" },
];

// ============================================================================
// Tessai's Blacksmith Hammers (event_flag[143] / 0x8F Bits 3–6)
// ============================================================================

pub struct HammerDef {
    pub mask: u8,
    pub name: &'static str,
    pub max_lv: u8,
    pub loc: &'static str,
}

pub const HAMMER_DEFS: &[HammerDef] = &[
    HammerDef {
        mask: 0x08,
        name: "Iron Hammer",
        max_lv: 9,
        loc: "Forest Village — Item Shop / Man (ve02)",
    },
    HammerDef {
        mask: 0x10,
        name: "Copper Hammer",
        max_lv: 12,
        loc: "Gregminster — Trade / Mose's Craft",
    },
    HammerDef {
        mask: 0x20,
        name: "Silver Hammer",
        max_lv: 15,
        loc: "Greenhill — New Leaf Academy (ve07)",
    },
    HammerDef {
        mask: 0x40,
        name: "Golden Hammer",
        max_lv: 16,
        loc: "Sajah Village — Highland Frontier (vj17)",
    },
];

// ============================================================================
// Window Sets & Sound Sets (event_flag[77] & event_flag[78])
// ============================================================================

pub struct SetDef {
    pub mask: u8,
    pub name: &'static str,
    pub desc: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LabeledOption {
    pub id: i64,
    pub label: &'static str,
}

impl std::fmt::Display for LabeledOption {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.label)
    }
}

pub fn find_labeled_option(list: &[LabeledOption], id: i64) -> Option<LabeledOption> {
    list.iter().copied().find(|o| o.id == id)
}

pub const WINDOW_STYLE_OPTIONS: &[LabeledOption] = &[
    LabeledOption { id: 0, label: "0: Default Classic Style" },
    LabeledOption { id: 1, label: "1: Window Set 1" },
    LabeledOption { id: 2, label: "2: Window Set 2" },
    LabeledOption { id: 3, label: "3: Window Set 3" },
    LabeledOption { id: 4, label: "4: Window Set 4" },
    LabeledOption { id: 5, label: "5: Window Set 5" },
    LabeledOption { id: 6, label: "6: Window Set 6" },
    LabeledOption { id: 7, label: "7: Window Set 7" },
];

pub const WINDOW_COLOR_OPTIONS: &[LabeledOption] = &[
    LabeledOption { id: 0, label: "0: Default Theme Color" },
    LabeledOption { id: 1, label: "Color Scheme #1" },
    LabeledOption { id: 2, label: "Color Scheme #2" },
    LabeledOption { id: 3, label: "Color Scheme #3" },
    LabeledOption { id: 4, label: "Color Scheme #4" },
    LabeledOption { id: 5, label: "Color Scheme #5" },
    LabeledOption { id: 6, label: "Color Scheme #6" },
    LabeledOption { id: 7, label: "Color Scheme #7" },
];

pub const WINDOW_OPACITY_OPTIONS: &[LabeledOption] = &[
    LabeledOption { id: 0, label: "0: Fully Opaque (Solid 100%)" },
    LabeledOption { id: 1, label: "1: Light Transparency (~75%)" },
    LabeledOption { id: 2, label: "2: Medium Transparency (~50%)" },
    LabeledOption { id: 3, label: "3: High Transparency (~25%)" },
];

pub const SOUND_SET_OPTIONS: &[LabeledOption] = &[
    LabeledOption { id: 0, label: "0: Default Sound Set" },
    LabeledOption { id: 1, label: "1: Sound Set 1 (Whistles & Bells)" },
    LabeledOption { id: 2, label: "2: Sound Set 2 (Electronic Synth)" },
    LabeledOption { id: 3, label: "3: Sound Set 3 (Soft Acoustic)" },
    LabeledOption { id: 4, label: "4: Sound Set 4 (Mechanical Clicks)" },
    LabeledOption { id: 5, label: "5: Sound Set 5 (Fantasy Chimes)" },
    LabeledOption { id: 6, label: "6: Sound Set 6 (Retro 8-Bit Arcade)" },
    LabeledOption { id: 7, label: "7: Sound Set 7 (Classical Orchestral)" },
];

pub const BATH_PAINTING_OPTIONS: &[LabeledOption] = &[
    LabeledOption { id: 0, label: "0: None" },
    LabeledOption { id: 18, label: "18: Graffiti" },
    LabeledOption { id: 19, label: "19: Flower Painting" },
    LabeledOption { id: 20, label: "20: Lover's Garden" },
    LabeledOption { id: 21, label: "21: Landscape Scroll" },
    LabeledOption { id: 22, label: "22: Beauties of Nature" },
    LabeledOption { id: 42, label: "42: Karen Painting A" },
    LabeledOption { id: 43, label: "43: Karen Painting B" },
    LabeledOption { id: 44, label: "44: Trio Painting" },
];

pub const BATH_ORNAMENT_OPTIONS: &[LabeledOption] = &[
    LabeledOption { id: 0, label: "0: None" },
    LabeledOption { id: 1, label: "1: Defective Urn" },
    LabeledOption { id: 2, label: "2: Octopus Pot" },
    LabeledOption { id: 3, label: "3: Flower Vase" },
    LabeledOption { id: 4, label: "4: Wide Urn" },
    LabeledOption { id: 5, label: "5: Blue Dragon Urn" },
    LabeledOption { id: 6, label: "6: Celadon Urn" },
    LabeledOption { id: 7, label: "7: Black Urn" },
    LabeledOption { id: 8, label: "8: Fine China" },
    LabeledOption { id: 9, label: "9: Persian Lamp" },
    LabeledOption { id: 10, label: "10: Hex Doll" },
    LabeledOption { id: 11, label: "11: Japanese Dish" },
    LabeledOption { id: 12, label: "12: Chinese Dish" },
    LabeledOption { id: 13, label: "13: Peeing Boy" },
    LabeledOption { id: 14, label: "14: Bonsai Tree" },
    LabeledOption { id: 15, label: "15: Knight Statue" },
    LabeledOption { id: 16, label: "16: Goddess Statue" },
    LabeledOption { id: 17, label: "17: Coral" },
    LabeledOption { id: 45, label: "45: Karen Statue A" },
    LabeledOption { id: 46, label: "46: Karen Statue B" },
    LabeledOption { id: 47, label: "47: Karen Statue C" },
    LabeledOption { id: 48, label: "48: Nanami's Vase" },
    LabeledOption { id: 49, label: "49: Large Vase" },
    LabeledOption { id: 50, label: "50: Genkaku's Vase" },
];

pub const WINDOW_SET_DEFS: &[SetDef] = &[
    SetDef { mask: 0x01, name: "Window Set 1", desc: "Simple Clean Border (Ryube / Castle Item Shop)" },
    SetDef { mask: 0x02, name: "Window Set 2", desc: "Wood Carved Frame (Greenhill Item Shop)" },
    SetDef { mask: 0x04, name: "Window Set 3", desc: "Stone Engraved Border (Cave of the Wind Chest)" },
    SetDef { mask: 0x08, name: "Window Set 4", desc: "Jeweled Floral Ornament (Radat Town Appraisal)" },
    SetDef { mask: 0x10, name: "Window Set 5", desc: "Gothic Iron Lattice (Tinto Mines Chest)" },
    SetDef { mask: 0x20, name: "Window Set 6", desc: "Eastern Dragon Border (Rokkaku Hamlet Chest)" },
    SetDef { mask: 0x40, name: "Window Set 7", desc: "Classic Minimal Frame (Gregminster Item Shop)" },
];

pub const SOUND_SET_DEFS: &[SetDef] = &[
    SetDef { mask: 0x01, name: "Sound Set 1", desc: "Whistle & Melodic Bells (Radat Town Appraisal)" },
    SetDef { mask: 0x02, name: "Sound Set 2", desc: "Electronic Beeps & Synth (Forest Village Chief)" },
    SetDef { mask: 0x04, name: "Sound Set 3", desc: "Soft Acoustic Notes (Kobold Village drop)" },
    SetDef { mask: 0x08, name: "Sound Set 4", desc: "Mechanical Clicks & Tones (Two River / Radat)" },
    SetDef { mask: 0x10, name: "Sound Set 5", desc: "Fantasy Chimes & Magic (Matilda Forest Path drop)" },
    SetDef { mask: 0x20, name: "Sound Set 6", desc: "Retro 8-Bit Arcade (Rokkaku Hamlet Item Shop)" },
    SetDef { mask: 0x40, name: "Sound Set 7", desc: "Classical Orchestral Accents (Gregminster Chest)" },
];

// ============================================================================
// Emilia's Castle Library Old Books (game_data.lib_flag bits 0..11)
// ============================================================================

pub struct LibraryBookDef {
    pub bit: u8,
    pub vol: u8,
    pub desc: &'static str,
}

pub const LIBRARY_BOOK_DEFS: &[LibraryBookDef] = &[
    LibraryBookDef { bit: 0,  vol: 1,  desc: "Kyaro Town — Hero's Home (Desk next to bed)" },
    LibraryBookDef { bit: 1,  vol: 2,  desc: "Ancient Sindar Ruins — Cavern Chest (vc12)" },
    LibraryBookDef { bit: 2,  vol: 3,  desc: "South Window — Item Shop (Rare Finds)" },
    LibraryBookDef { bit: 3,  vol: 4,  desc: "Muse City — City Hall Bookshelf (? Book)" },
    LibraryBookDef { bit: 4,  vol: 5,  desc: "Greenhill — New Leaf Academy (ve07)" },
    LibraryBookDef { bit: 5,  vol: 6,  desc: "Forest Village — Settlement Chest (ve02)" },
    LibraryBookDef { bit: 6,  vol: 7,  desc: "Gregminster — Palace Bookshelf (Shrine Room)" },
    LibraryBookDef { bit: 7,  vol: 8,  desc: "Tinto Mines — Underground Chest (vg07)" },
    LibraryBookDef { bit: 8,  vol: 9,  desc: "Tiger Cave / Tigermouth Path — Chest (vg15)" },
    LibraryBookDef { bit: 9,  vol: 10, desc: "Greenhill — New Leaf Academy (ve07, post-liberation)" },
    LibraryBookDef { bit: 10, vol: 11, desc: "Rockaxe — Shop Basement Shelf (post-liberation)" },
    LibraryBookDef { bit: 11, vol: 12, desc: "Muse City — Inn Patron (post-liberation)" },
];

// ============================================================================
// Yam Koo's Fishing Record Board (exact in-game order)
// ============================================================================

pub struct FishDef {
    pub name: &'static str,
    pub caught_idx: usize,
    pub weight_idx: usize,
    pub trophy_raw: i64,
}

pub const FISH_BOARD: &[FishDef] = &[
    FishDef { name: "Salmon",    caught_idx: 0,  weight_idx: 1,  trophy_raw: 164 },
    FishDef { name: "Shrimp",    caught_idx: 14, weight_idx: 15, trophy_raw: 44  },
    FishDef { name: "Shellfish", caught_idx: 8,  weight_idx: 9,  trophy_raw: 65  },
    FishDef { name: "Whitefish", caught_idx: 2,  weight_idx: 3,  trophy_raw: 30  },
    FishDef { name: "Blowfish",  caught_idx: 10, weight_idx: 11, trophy_raw: 85  },
    FishDef { name: "Stonefish", caught_idx: 6,  weight_idx: 7,  trophy_raw: 73  },
    FishDef { name: "Squid",     caught_idx: 4,  weight_idx: 5,  trophy_raw: 42  },
    FishDef { name: "Boot",      caught_idx: 12, weight_idx: 13, trophy_raw: 19  },
];

// ============================================================================
// Treasure Chests Catalog (converted from src/config/chests.js)
// ============================================================================

pub struct ChestInfo {
    pub id: usize,
    pub byte: usize,
    pub mask: u8,
    pub area: &'static str,
    pub map: &'static str,
    pub item: &'static str,
}

pub fn chest_info(chest_id: usize) -> ChestInfo {
    let byte = chest_id / 8;
    let mask = 1u8 << (chest_id % 8);
    let (area, map, item) = match chest_id + 1 {
        1 => ("Ancient Sindar Ruins Caverns", "vc12", "Mega Medicine"),
        2 => ("Ancient Sindar Ruins Caverns", "vc12", "Stone of Magic"),
        3 => ("Ancient Sindar Ruins Caverns", "vc12", "Angry Blow"),
        4 => ("Ancient Sindar Ruins Caverns", "vc12", "Gauntlet"),
        5 => ("Ancient Sindar Ruins Caverns", "vc12", "Water Orb"),
        6 => ("Ancient Sindar Ruins Caverns", "vc12", "Shoulder Pads"),
        7 => ("Ancient Sindar Ruins Caverns", "vc12", "Chain Mail"),
        8 => ("Ancient Sindar Ruins Caverns", "vc12", "Fire Lizard Orb"),
        9 => ("Ancient Sindar Ruins Caverns", "vc12", "Magic Drain Orb"),
        10 => ("Ancient Sindar Ruins Caverns", "vc12", "Old book vol 2"),
        14 => ("Highland Military Recon Encampment", "vc30", "Fire Sealing Orb"),
        15 => ("Ancient Sindar Ruins Caverns", "vc07", "Belt of Strength"),
        16 => ("Ancient Sindar Ruins Caverns", "vc07", "Circlet"),
        17 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Fur Cape"),
        18 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Thunder Runner"),
        19 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Thunder Amulet"),
        20 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Stone of Power"),
        21 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Unicorn Plans 2"),
        22 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Event / Quest Item"),
        23 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Dragon Plans 2"),
        24 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Medicine Orb"),
        25 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi13", "Skill Ring"),
        33 => ("Rockaxe Castle Citadel & Ramparts", "vi06", "Stone of Speed"),
        34 => ("Rockaxe Castle Citadel & Ramparts", "vi06", "Escape Talisman"),
        35 => ("Rockaxe Castle Citadel & Ramparts", "vi06", "Crimson Cape"),
        36 => ("Rockaxe Castle Citadel & Ramparts", "vi06", "Stone of Defense"),
        37 => ("Rockaxe Castle Citadel & Ramparts", "vi06", "Earth Shield"),
        38 => ("Rockaxe Castle Citadel & Ramparts", "vi06", "Power Gloves"),
        39 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi08", "Mega Medicine"),
        40 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi08", "Gold Collar"),
        41 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi08", "Dragon Plans 4"),
        42 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi08", "Unicorn Plans 4"),
        43 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi08", "Earth Armor"),
        44 => ("Mt. Rakutei Dragon Cliffs & Peak", "vi08", "Flame Helmet"),
        49 => ("Kobold Forest", "vh10", "Collar (Path 1)"),
        50 => ("Kobold Forest", "vh10", "Collar (Path 2)"),
        51 => ("Kobold Forest", "vh10", "Collar (Path 3)"),
        52 => ("Kobold Forest", "vh10", "Collar (Path 4)"),
        53 => ("Kobold Forest", "vh10", "Main-Gauche"),
        54 => ("Kobold Forest", "vh10", "Guard Ring"),
        55 => ("Kobold Forest", "vh10", "Lamb (Yuzu Farm)"),
        57 => ("Banner Village & Fast Pier", "vf06", "Mega Medicine"),
        58 => ("Banner Village & Fast Pier", "vf06", "Full Helmet"),
        59 => ("Banner Village & Fast Pier", "vf06", "Stone of Luck"),
        60 => ("Banner Village & Fast Pier", "vf06", "Magic Ring"),
        61 => ("Banner Village & Fast Pier", "vf06", "Poison Orb"),
        62 => ("Banner Village & Fast Pier", "vf06", "Wing Ornament"),
        63 => ("Banner Village & Fast Pier", "vf07", "Silver Shield"),
        64 => ("Banner Village & Fast Pier", "vf07", "Silverlet"),
        65 => ("L'Renouille Imperial Capital Citadel", "vj02", "Robe of Mist"),
        66 => ("L'Renouille Imperial Capital Citadel", "vj02", "Bolt of Wrath"),
        67 => ("L'Renouille Imperial Capital Citadel", "vj02", "Fury Orb"),
        68 => ("L'Renouille Imperial Capital Citadel", "vj03", "Champion's Orb"),
        69 => ("L'Renouille Imperial Capital Citadel", "vj03", "Wind Amulet"),
        70 => ("L'Renouille Imperial Capital Citadel", "vj05", "Stone of Power"),
        71 => ("L'Renouille Imperial Capital Citadel", "vj05", "Stone of Defense"),
        72 => ("L'Renouille Imperial Capital Citadel", "vj05", "Escape Talisman"),
        73 => ("L'Renouille Imperial Capital Citadel", "vj04", "Goldlet"),
        74 => ("L'Renouille Imperial Capital Citadel", "vj05", "Window Set 7"),
        75 => ("L'Renouille Imperial Capital Citadel", "vj02", "Medicine"),
        76 => ("L'Renouille Imperial Capital Citadel", "vj02", "Medicine"),
        77 => ("L'Renouille Imperial Capital Citadel", "vj02", "Mega Medicine"),
        81 => ("Cave of the Wind Caverns", "vd13", "Darkness Orb"),
        82 => ("Cave of the Wind Caverns", "vd13", "Blue Ribbon"),
        83 => ("Cave of the Wind Caverns", "vd13", "Chain Mail"),
        84 => ("Cave of the Wind Caverns", "vd13", "Collar"),
        85 => ("South Window Capital City", "vd10", "Fire Orb"),
        86 => ("South Window Capital City", "vd11", "Stone of Magic-Defense"),
        87 => ("South Window Capital City", "vd01", "Recipe #9"),
        88 => ("South Window Capital City", "vd19", "Recipe #14"),
        97 => ("Cave of the Wind Caverns", "vd06", "Sun Badge"),
        98 => ("Cave of the Wind Caverns", "vd06", "Fish Badge"),
        99 => ("Cave of the Wind Caverns", "vd06", "Fire Wall"),
        100 => ("Cave of the Wind Caverns", "vd06", "Blue Gate Orb"),
        101 => ("Cave of the Wind Caverns", "vd06", "Medicine"),
        102 => ("Cave of the Wind Caverns", "vd06", "Event / Quest Item"),
        103 => ("Cave of the Wind Caverns", "vd06", "Stone of Defense"),
        104 => ("Cave of the Wind Caverns", "vd06", "Half Helmet"),
        129 => ("Ryube Forest & Tsai's Hermit Hut", "-", "Chest / Loot Object"),
        131 => ("Forest Village Settlement", "ve02", "Sound Set 7"),
        133 => ("Forest Village Settlement", "ve02", "Lamb"),
        134 => ("Forest Village Settlement", "ve02", "Iron Hammer"),
        135 => ("Forest Village Settlement", "ve02", "Old book vol 6"),
        136 => ("South Window Capital City", "vd03", "Friendship Orb"),
        137 => ("Swallow Pass & Highland Border Gate", "vb08", "Escape Talisman"),
        138 => ("Swallow Pass & Highland Border Gate", "vb08", "Brass Armor"),
        139 => ("Swallow Pass & Highland Border Gate", "vb08", "Wind Feather Ornament"),
        140 => ("Swallow Pass & Highland Border Gate", "vb08", "Fire Wall"),
        141 => ("Ryube Forest & Tsai's Hermit Hut", "vb07", "Gauntlet"),
        142 => ("Ryube Forest & Tsai's Hermit Hut", "vb07", "Leather Cape"),
        143 => ("Ryube Forest & Tsai's Hermit Hut", "vb21", "Guard Robe"),
        144 => ("Ryube Forest & Tsai's Hermit Hut", "vb21", "Gauntlet"),
        145 => ("Two River Subterranean Sewers", "vh04", "Fire Emblem"),
        146 => ("Two River Subterranean Sewers", "vh04", "Stone of Defense"),
        147 => ("Two River Subterranean Sewers", "vh04", "Healing Wind"),
        148 => ("Tinto Mines & Underground Caverns", "vg11", "Cape of Darkness"),
        149 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Wind Hat"),
        150 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Double-Edged Orb"),
        151 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Star Earrings"),
        152 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Mega Medicine"),
        153 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Silver Collar"),
        154 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Master Garb"),
        155 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Old book vol 9"),
        156 => ("Tiger Cave & Mt. Senai Shrines", "vg15", "Window Set 5"),
        157 => ("Tinto Mining City & Mayor Hall", "vg02", "Stone of Magic-Defense"),
        158 => ("Tinto Mining City & Mayor Hall", "vg02", "Full Helmet"),
        159 => ("Tinto Mining City & Mayor Hall", "vg02", "Dancing Flames"),
        160 => ("New Leaf Academy (Campus, Dorms & Cellar)", "ve03", "Protect Mist"),
        161 => ("Greenhill Principality (City & Outskirts)", "ve08", "Silver Hat"),
        162 => ("Greenhill Principality (City & Outskirts)", "ve08", "Toe Shoes"),
        163 => ("Greenhill Principality (City & Outskirts)", "ve08", "Chimera Orb"),
        164 => ("Greenhill-Matilda Forest Trail & Checkpoint", "ve04", "Guard Ring"),
        165 => ("Greenhill-Matilda Forest Trail & Checkpoint", "ve04", "Mega Medicine"),
        166 => ("Greenhill-Matilda Forest Trail & Checkpoint", "ve04", "Dragon Armor"),
        167 => ("Tigermouth Mountain Settlement", "vg04", "Master Robe"),
        169 => ("Greenhill Principality (City & Outskirts)", "ve08", "Dream Robe"),
        170 => ("Greenhill Principality (City & Outskirts)", "ve08", "Stone of Dexterity"),
        171 => ("Greenhill Principality (City & Outskirts)", "ve08", "Winged Boots"),
        177 => ("Two River City (Human, Wingly & Kobold)", "vh05", "Spinach Seed"),
        178 => ("Lakewest Town & Docks", "vh02", "Kindness Orb"),
        179 => ("Lakewest Town & Docks", "vh02", "Recipe #16"),
        181 => ("Lakewest Town & Docks", "vh02", "Cabbage Seed"),
        182 => ("New Leaf Academy (Campus, Dorms & Cellar)", "ve07", "Old book vol 5"),
        186 => ("Forest Village Settlement", "ve10", "Recipe #20"),
        188 => ("Crom Village & Outskirts Path", "vg08", "Mother Earth Orb"),
        189 => ("Crom Village & Outskirts Path", "vg08", "Dragon Plans 3"),
        190 => ("Crom Village & Outskirts Path", "vg08", "Unicorn Plans 3"),
        191 => ("Tinto Mining City & Mayor Hall", "vg01", "Power Ring"),
        192 => ("Crom Village & Outskirts Path", "vg13", "Sunbeam Orb"),
        194 => ("Tigermouth Mountain Settlement", "vg06", "Cabbage Seed"),
        195 => ("Tinto Mines & Underground Caverns", "vg07", "Old book vol 8"),
        197 => ("Tinto Mines & Underground Caverns", "vg07", "Tomato Seed"),
        198 => ("New Leaf Academy (Campus, Dorms & Cellar)", "ve07", "Rage Orb"),
        199 => ("New Leaf Academy (Campus, Dorms & Cellar)", "ve07", "Old book vol 10"),
        200 => ("New Leaf Academy (Campus, Dorms & Cellar)", "ve07", "Silver Hammer"),
        209 => ("South Window Capital City", "vd19", "Mega Medicine"),
        210 => ("South Window Capital City", "vd19", "Dragon Armor"),
        211 => ("South Window Capital City", "vd19", "Mole Suit"),
        212 => ("South Window Capital City", "vd19", "Gold Emblem"),
        213 => ("South Window Capital City", "vd19", "Blue Gate Orb"),
        _ => ("Unused / Unassigned", "-", "Unused Chest Slot"),
    };
    ChestInfo {
        id: chest_id + 1,
        byte,
        mask,
        area,
        map,
        item,
    }
}
