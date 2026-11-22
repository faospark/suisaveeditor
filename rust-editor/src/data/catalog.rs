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
    pub name: &'static str,
    pub segment: &'static str,
    pub loc: &'static str,
}

pub const GUARDIAN_BLUEPRINTS: &[BlueprintDef] = &[
    BlueprintDef { byte_idx: 0, bit_idx: 0, name: "Dragon Plans #1", segment: "Head", loc: "Ryube Outskirts (Wild Pig drop)" },
    BlueprintDef { byte_idx: 0, bit_idx: 1, name: "Dragon Plans #2", segment: "Body", loc: "Mt. Senhu Trail Chest" },
    BlueprintDef { byte_idx: 0, bit_idx: 2, name: "Dragon Plans #3", segment: "Legs", loc: "Tinto Mines (Lizard drop)" },
    BlueprintDef { byte_idx: 0, bit_idx: 3, name: "Dragon Plans #4", segment: "Tail", loc: "Crom Village (Boy behind Elder)" },
    BlueprintDef { byte_idx: 0, bit_idx: 4, name: "Unicorn Plans #1", segment: "Head", loc: "Radat Town (White Wolf drop)" },
    BlueprintDef { byte_idx: 0, bit_idx: 5, name: "Unicorn Plans #2", segment: "Body", loc: "Two River Winger Quarter Sewer" },
    BlueprintDef { byte_idx: 0, bit_idx: 6, name: "Unicorn Plans #3", segment: "Legs", loc: "Mt. Rakutei Summit Chest" },
    BlueprintDef { byte_idx: 0, bit_idx: 7, name: "Unicorn Plans #4", segment: "Tail", loc: "Coronet Wharf Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 0, name: "Rabbit Plans #1", segment: "Head", loc: "South Window City Hall Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 1, name: "Rabbit Plans #2", segment: "Body", loc: "Banner Village (Samurai drop)" },
    BlueprintDef { byte_idx: 1, bit_idx: 2, name: "Rabbit Plans #3", segment: "Legs", loc: "Forest Path to Matilda Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 3, name: "Rabbit Plans #4", segment: "Tail", loc: "Greenhill Forest Path Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 4, name: "Turtle Plans #1", segment: "Head", loc: "Two River Kobold District Well" },
    BlueprintDef { byte_idx: 1, bit_idx: 5, name: "Turtle Plans #2", segment: "Body", loc: "Radat Rope Minigame Prize" },
    BlueprintDef { byte_idx: 1, bit_idx: 6, name: "Turtle Plans #3", segment: "Legs", loc: "Mt. Tigerwolf Path Chest" },
    BlueprintDef { byte_idx: 1, bit_idx: 7, name: "Turtle Plans #4", segment: "Tail", loc: "Kuskus Town (Appraiser Woman)" },
];

// ============================================================================
// Window Sets & Sound Sets (event_flag[77] & event_flag[78])
// ============================================================================

pub struct SetDef {
    pub mask: u8,
    pub name: &'static str,
    pub desc: &'static str,
}

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
