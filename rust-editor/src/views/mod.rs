pub mod battle_characters;
pub mod castle;
pub mod cooking;
pub mod data_values;
pub mod experimental;
pub mod general;
pub mod inventory;
pub mod investigations;
pub mod item_modal;
pub mod recruitment;
pub mod settings;
pub mod stub;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EditorTab {
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

    pub fn is_implemented(self) -> bool {
        let _ = self;
        true
    }

    pub fn label(self) -> &'static str {
        match self {
            EditorTab::General => "General",
            EditorTab::BattleCharacters => "Battle Characters",
            EditorTab::RecruitedCharacters => "Recruited Characters",
            EditorTab::PartyBag => "Party Bag",
            EditorTab::Warehouse => "Warehouse",
            EditorTab::Cooking => "Cooking",
            EditorTab::Investigations => "Investigations",
            EditorTab::Castle => "Castle",
            EditorTab::Experimental => "Experimental",
            EditorTab::DataValues => "Data Values",
            EditorTab::Settings => "Settings",
            EditorTab::Changelog => "Changelog",
            EditorTab::About => "About",
        }
    }

    pub fn description(self) -> &'static str {
        match self {
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
            EditorTab::About => "SuiSaveEditor Rust (iced) native desktop edition.",
        }
    }
}
