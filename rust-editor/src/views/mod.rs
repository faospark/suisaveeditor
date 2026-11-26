pub mod battle_characters;
pub mod castle;
pub mod cooking;
pub mod data_values;
pub mod experimental;
pub mod general;
pub mod inventory;
pub mod investigations;
pub mod item_modal;
pub mod notification_modal;
pub mod recruitment;
pub mod restore_modal;
pub mod saves;
pub mod settings;
pub mod stub;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EditorTab {
    Saves,
    General,
    BattleCharacters,
    RecruitedCharacters,
    PartyBag,
    Warehouse,
    Cooking,
    Investigations,
    Castle,
    Experimental,
    DataValues,
    Settings,
    Changelog,
    About,
}

impl EditorTab {
    pub const EDITOR_TABS: &'static [EditorTab] = &[
        EditorTab::Saves,
        EditorTab::General,
        EditorTab::BattleCharacters,
        EditorTab::RecruitedCharacters,
        EditorTab::PartyBag,
        EditorTab::Warehouse,
        EditorTab::Cooking,
        EditorTab::Investigations,
        EditorTab::Castle,
        EditorTab::Experimental,
    ];

    pub const UTILITY_TABS: &'static [EditorTab] = &[
        EditorTab::DataValues,
        EditorTab::Settings,
        EditorTab::Changelog,
        EditorTab::About,
    ];

    pub fn label(self) -> &'static str {
        let key = match self {
            EditorTab::Saves => "tab_saves",
            EditorTab::General => "tab_general",
            EditorTab::BattleCharacters => "tab_battle_chars",
            EditorTab::RecruitedCharacters => "tab_recruited",
            EditorTab::PartyBag => "tab_party_bag",
            EditorTab::Warehouse => "tab_warehouse",
            EditorTab::Cooking => "tab_cooking",
            EditorTab::Investigations => "tab_investigations",
            EditorTab::Castle => "tab_castle",
            EditorTab::Experimental => "tab_experimental",
            EditorTab::DataValues => "tab_data_values",
            EditorTab::Settings => "tab_settings",
            EditorTab::Changelog => "tab_changelog",
            EditorTab::About => "tab_about",
        };
        crate::i18n::tr(key)
    }

    pub fn icon(self) -> char {
        use crate::theme::icons;
        match self {
            EditorTab::Saves => icons::FOLDER_OPEN,
            EditorTab::General => icons::PERSON,
            EditorTab::BattleCharacters => icons::SWORDS,
            EditorTab::RecruitedCharacters => icons::GROUPS,
            EditorTab::PartyBag => icons::BACKPACK,
            EditorTab::Warehouse => icons::INVENTORY_2,
            EditorTab::Cooking => icons::RESTAURANT,
            EditorTab::Investigations => icons::SEARCH,
            EditorTab::Castle => icons::CASTLE,
            EditorTab::Experimental => icons::SCIENCE,
            EditorTab::DataValues => icons::TABLE_CHART,
            EditorTab::Settings => icons::SETTINGS,
            EditorTab::Changelog => icons::HISTORY,
            EditorTab::About => icons::INFO,
        }
    }

    pub fn description(self) -> &'static str {
        match self {
            EditorTab::Saves => "Browse and open decrypted Suikoden II saves directly from SuikodenFix\\Decrypted\\gsd2.",
            EditorTab::General => "Active party, hero & castle names, potch, play time, and map coordinates.",
            EditorTab::BattleCharacters => "Character stats, levels, HP/MP, weapon levels, runes, and equipped gear.",
            EditorTab::RecruitedCharacters => "108 Stars of Destiny recruitment flags and character portrait grid.",
            EditorTab::PartyBag => "Key items (event_item) and active party inventory slots (party_item).",
            EditorTab::Warehouse => "Castle warehouse storage (base_item) and room items (room_item).",
            EditorTab::Cooking => "Hai Yo's cook-off progress, ingredient stock, restaurant menu, and 40 recipes.",
            EditorTab::Investigations => "Richmond's detective investigations (tantei_lv).",
            EditorTab::Castle => "Guardian Deity statue, bath items, library books, farm/ranch, window/sound sets, fishing, suggestion box.",
            EditorTab::Experimental => "Story & event flags (256 bytes), raw castle flags, 256 treasure chests, and war units.",
            EditorTab::DataValues => "Reference tables for all characters, items, equipment, and runes.",
            EditorTab::Settings => "Theme accent colors and automatic game, BepInEx, and SuikodenFix detection.",
            EditorTab::Changelog => "Version history from CHANGELOG.md.",
            EditorTab::About => "Sui2SaveEditor Rust (iced) native desktop edition.",
        }
    }
}
