use std::fmt;

use crate::data::{
    base_item_name, equipment_name, farming_item_name, food_item_name, opt, regular_item_name,
    rune_name, trade_item_name, ACCESSORIES, ARMORS, HELMETS, NamedOption, RUNES, SHIELDS,
};

pub const BEASTS: &[i64] = &[26, 42, 48, 49, 50, 72, 74, 75, 76, 77, 78, 79, 84];
pub const SHIELD_USERS: &[i64] = &[2, 5, 7, 9, 12, 13, 23, 28, 33, 35, 39, 64];

pub fn is_beast(char_id: i64) -> bool {
    BEASTS.contains(&char_id)
}

pub fn can_equip_shield(char_id: i64) -> bool {
    SHIELD_USERS.contains(&char_id)
}

pub fn character_attrs(id: i64) -> &'static [&'static str] {
    match id {
        1 => &["C", "L", "M", "Y"],
        2 => &["C", "L", "S", "M"],
        3 => &["C", "L", "M"],
        4 => &["C", "R", "F"],
        5 => &["C", "L", "S", "M"],
        6 => &["C", "L", "M"],
        7 => &["C", "L", "S", "M"],
        8 => &["C", "R", "F"],
        9 => &["E", "L", "S", "M", "Y"],
        10 => &["E", "H", "M"],
        11 => &["C", "L", "M"],
        12 => &["C", "L", "S", "F"],
        13 => &["E", "H", "S", "M"],
        14 => &["E", "L", "F"],
        15 => &["C", "L", "M"],
        16 => &["E", "L", "M"],
        17 => &["C", "V", "F", "Y"],
        18 => &["C", "V", "F"],
        19 => &["C", "V", "F", "Y"],
        20 => &["C", "V", "F"],
        21 => &["E", "L", "M", "Y"],
        22 => &["C", "R", "M", "Y"],
        23 => &["E", "L", "S", "F"],
        24 => &["C", "V", "F", "Y"],
        25 => &["C", "V", "F"],
        26 => &["Z"],
        27 => &["C", "R", "M"],
        28 => &["E", "L", "S", "K", "Y"],
        29 => &["C", "L", "K", "Y"],
        30 => &["C", "L", "M"],
        31 => &["C", "V", "M"],
        32 => &["E", "H", "M"],
        33 => &["E", "L", "S", "M"],
        34 => &["E", "L", "M"],
        35 => &["E", "L", "S", "M"],
        36 => &["E", "L", "M"],
        37 => &["C", "V", "M"],
        38 => &["C", "V", "M"],
        39 => &["C", "L", "S", "F"],
        40 => &["C", "V", "M"],
        41 => &["C", "V", "F", "Y"],
        42 => &["Z"],
        43 => &["C", "V", "F", "Y"],
        44 => &["C", "L", "M"],
        45 => &["C", "V", "F"],
        46 => &["E", "L", "F"],
        47 => &["C", "V", "M"],
        48 => &["Z", "M"],
        49 => &["Z", "M"],
        50 => &["Z", "M"],
        51 => &["E", "H", "M"],
        52 => &["C", "V", "M"],
        53 => &["C", "R", "M", "Y"],
        54 => &["C", "V", "W"],
        55 => &["C", "V", "F", "Y"],
        56 => &["C", "V", "W"],
        57 => &["C", "V", "F"],
        58 => &["E", "H", "M"],
        59 => &["C", "L", "M", "Y"],
        60 => &["E", "L", "F"],
        61 => &["C", "R", "M"],
        62 => &["C", "V", "M", "Y"],
        63 => &["C", "V", "M"],
        64 => &["C", "L", "S", "N"],
        65 => &["C", "L", "N"],
        66 => &["C", "L", "M"],
        67 => &["C", "L", "M"],
        68 => &["C", "V", "F"],
        69 => &["C", "V", "M"],
        70 => &["C", "V", "M"],
        71 => &["C", "L", "M"],
        72 => &["Z", "N"],
        73 => &["C", "V", "F"],
        74 => &["Z", "F"],
        75 => &["Z", "M"],
        76 => &["Z", "F"],
        77 => &["Z", "M"],
        78 => &["Z", "M"],
        79 => &["Z", "M"],
        80 => &["C", "L", "M"],
        81 => &["C", "L", "M"],
        82 => &["C", "L", "M"],
        83 => &["C", "V", "F", "Y"],
        84 => &["Z"],
        _ => &["NP"],
    }
}

pub const WEAPON_RUNES: &[NamedOption] = &[
    opt(0, "None"),
    opt(1, "Fire Orb"),
    opt(2, "Rage Orb"),
    opt(3, "Water Orb"),
    opt(4, "Flowing Orb"),
    opt(5, "Wind Orb"),
    opt(6, "Cyclone Orb"),
    opt(7, "Earth Orb"),
    opt(8, "Mother Earth Orb"),
    opt(9, "Lightning Orb"),
    opt(10, "Thunder Orb"),
    opt(92, "Fire Lizard Orb"),
    opt(93, "Magic Drain Orb"),
    opt(94, "Hunter Orb"),
    opt(95, "Technique Orb"),
    opt(96, "Silence Orb"),
    opt(97, "Poison Orb"),
    opt(98, "Knockdown Orb"),
    opt(99, "Sleep Orb"),
    opt(100, "Friendship Orb"),
    opt(101, "Solitude Orb"),
    opt(102, "Kindness Orb"),
    opt(103, "Exertion Orb"),
];

pub fn rune_attrs(id: i64) -> &'static [&'static str] {
    match id {
        1..=10 => &["N", "Wep"],
        11 => &["82", "RH", "X"],
        12 | 15 | 16 | 27..=31 | 62..=88 => &["N"],
        13 => &["1", "RH", "X"],
        14 => &["80", "81", "RH", "X"],
        17 => &["N", "HR"],
        18 => &["72", "LH", "X"],
        19 => &["3", "10", "11", "13", "16", "32", "34"],
        20 => &["2", "5", "7", "23", "25", "33", "35", "64"],
        21 => &["30", "43", "67"],
        22 => &["45", "46", "68", "69"],
        23 => &["6", "8", "19", "20", "24", "29", "31", "41", "60", "62", "65"],
        24 => &["9", "17", "37", "38", "52", "54", "56", "57"],
        25 => &["14", "58", "59"],
        26 => &["4", "53", "70", "71"],
        39 => &["41", "RH", "X"],
        40 => &["73", "HR", "X"],
        41 => &["12", "39", "RH", "X"],
        42 => &["63", "HR", "X"],
        43 => &["47", "RH", "X"],
        44 => &["21", "RH", "X"],
        45 => &["24", "LH", "X"],
        46 => &["27", "RH", "X"],
        47 => &["50", "HR", "X"],
        48 => &["49", "74", "HR", "X"],
        49 => &["68", "RH"],
        50 => &["51", "LH", "X"],
        51 => &["15", "RH"],
        52 => &["46", "LH", "X"],
        53 => &["25", "RH", "X"],
        54 => &["40", "HR", "X"],
        89 => &["67", "HR", "X"],
        92..=103 => &["Wep", "ExR"],
        _ => &[],
    }
}

pub fn helmet_attrs(id: i64) -> &'static [&'static str] {
    match id {
        1 | 3 | 4 | 7 | 8 | 10 => &["C"],
        2 | 5 | 6 | 85 => &["C", "E"],
        9 | 11 | 12 => &["E"],
        _ => &[],
    }
}

pub fn armor_attrs(id: i64) -> &'static [&'static str] {
    match id {
        13 | 17 | 23 => &["L", "V", "R"],
        14 | 18 | 21 => &["L", "V"],
        15 => &["L", "H", "V"],
        16 | 19 | 26 | 30 | 32 | 36 => &["L", "H"],
        20 | 25 | 34 => &["L"],
        22 | 28 | 35 | 37 => &["H"],
        24 | 29 | 33 => &["V"],
        27 | 31 => &["V", "R"],
        86 => &["L", "H", "V", "R"],
        _ => &[],
    }
}

/// Exact port of `filterRunesForCharacter` from `src/editors/battleCharacters.js`.
pub fn filter_runes_for_character(
    char_id: i64,
    slot_index: usize,
    bypass_restrictions: bool,
) -> Vec<NamedOption> {
    let mut allowed = Vec::new();
    for &r in RUNES {
        let loc_r = opt(r.id, rune_name(r.id));
        if r.id == 0 {
            allowed.push(loc_r);
            continue;
        }
        let attrs = rune_attrs(r.id);
        if attrs.contains(&"ExR") {
            continue;
        }
        if bypass_restrictions {
            allowed.push(loc_r);
            continue;
        }

        let has_slot_attr = attrs.contains(&"HR") || attrs.contains(&"RH") || attrs.contains(&"LH");
        let passes_slot = match slot_index {
            0 => !has_slot_attr || attrs.contains(&"HR"),
            1 => !has_slot_attr || ((attrs.contains(&"RH") || attrs.contains(&"Wep")) && !attrs.contains(&"LH")),
            2 => !has_slot_attr || ((attrs.contains(&"LH") || attrs.contains(&"Wep")) && !attrs.contains(&"RH")),
            _ => true,
        };
        if !passes_slot {
            continue;
        }

        let has_char_specific = attrs.iter().any(|a| a.parse::<i64>().is_ok());
        let matches_char = attrs.contains(&"N")
            || attrs.iter().any(|a| a.parse::<i64>().ok() == Some(char_id));
        if has_char_specific && !matches_char {
            continue;
        }

        allowed.push(loc_r);
    }
    allowed
}

/// Filter helmets by character `C` / `E` attributes (unless bypassed).
pub fn filter_helmets_for_character(char_id: i64, bypass: bool) -> Vec<NamedOption> {
    if bypass {
        return HELMETS.iter().map(|h| opt(h.id, equipment_name(h.id))).collect();
    }
    let c_attrs = character_attrs(char_id);
    HELMETS
        .iter()
        .copied()
        .filter(|h| {
            h.id == 0 || helmet_attrs(h.id).iter().any(|a| c_attrs.contains(a))
        })
        .map(|h| opt(h.id, equipment_name(h.id)))
        .collect()
}

/// Filter armors by character `L` / `H` / `V` / `R` attributes (unless bypassed).
pub fn filter_armors_for_character(char_id: i64, bypass: bool) -> Vec<NamedOption> {
    if bypass {
        return ARMORS.iter().map(|a| opt(a.id, equipment_name(a.id))).collect();
    }
    let c_attrs = character_attrs(char_id);
    ARMORS
        .iter()
        .copied()
        .filter(|a| {
            a.id == 0 || armor_attrs(a.id).iter().any(|attr| c_attrs.contains(attr))
        })
        .map(|a| opt(a.id, equipment_name(a.id)))
        .collect()
}

// ============================================================================
// Inventory Category & Named Item Picker
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ItemCategory {
    Item,
    Equip,
    Rune,
    Farm,
    Trade,
    Base,
    Food,
}

impl ItemCategory {
    pub const ALL: &'static [ItemCategory] = &[
        ItemCategory::Item,
        ItemCategory::Equip,
        ItemCategory::Rune,
        ItemCategory::Farm,
        ItemCategory::Trade,
        ItemCategory::Base,
        ItemCategory::Food,
    ];

    pub fn from_use_cnt(use_cnt: i64) -> Self {
        match use_cnt {
            16 => ItemCategory::Equip,
            32 => ItemCategory::Rune,
            48 => ItemCategory::Farm,
            64 => ItemCategory::Trade,
            80 => ItemCategory::Base,
            c if c >= 96 => ItemCategory::Food,
            _ => ItemCategory::Item,
        }
    }

    pub fn default_use_cnt(self) -> i64 {
        match self {
            ItemCategory::Item => 1,
            ItemCategory::Equip => 16,
            ItemCategory::Rune => 32,
            ItemCategory::Farm => 48,
            ItemCategory::Trade => 64,
            ItemCategory::Base => 80,
            ItemCategory::Food => 97,
        }
    }

    pub fn color(self) -> iced::Color {
        let key = match self {
            ItemCategory::Item => "Item",
            ItemCategory::Equip => "Gear",
            ItemCategory::Rune => "Rune",
            ItemCategory::Farm => "Farm",
            ItemCategory::Trade => "Trade",
            ItemCategory::Base => "Base",
            ItemCategory::Food => "Food",
        };
        crate::theme::item_category_color(key)
    }

    pub fn options(self) -> Vec<NamedOption> {
        match self {
            ItemCategory::Item => (0..=85).map(|id| opt(id, regular_item_name(id))).collect(),
            ItemCategory::Equip => {
                let mut v = vec![opt(0, crate::i18n::tr("none"))];
                for list in [HELMETS, ARMORS, SHIELDS, ACCESSORIES] {
                    v.extend(
                        list.iter()
                            .copied()
                            .filter(|o| o.id != 0)
                            .map(|o| opt(o.id, equipment_name(o.id))),
                    );
                }
                v.sort_by_key(|o| o.id);
                v
            }
            ItemCategory::Rune => RUNES.iter().map(|r| opt(r.id, rune_name(r.id))).collect(),
            ItemCategory::Farm => (0..=8).map(|id| opt(id, farming_item_name(id))).collect(),
            ItemCategory::Trade => (0..=50).map(|id| opt(id, trade_item_name(id))).collect(),
            ItemCategory::Base => (0..=66).map(|id| opt(id, base_item_name(id))).collect(),
            ItemCategory::Food => (0..=240).map(|id| opt(id, food_item_name(id))).collect(),
        }
    }
}

impl fmt::Display for ItemCategory {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let key = match self {
            ItemCategory::Item => "cat_item",
            ItemCategory::Equip => "cat_gear",
            ItemCategory::Rune => "cat_rune",
            ItemCategory::Farm => "cat_farm",
            ItemCategory::Trade => "cat_trade",
            ItemCategory::Base => "cat_base",
            ItemCategory::Food => "cat_food",
        };
        f.write_str(crate::i18n::tr(key))
    }
}
