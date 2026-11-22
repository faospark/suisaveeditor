#![cfg_attr(windows, windows_subsystem = "windows")]

mod data;
mod gamedata;
mod save_file;
mod theme;
mod views;

use iced::keyboard;
use iced::widget::{button, column, container, horizontal_rule, row, scrollable, stack, text, Space};
use iced::window;
use iced::{Alignment, Element, Length, Size, Subscription, Task, Theme};
use std::path::PathBuf;

use data::catalog::{key_item_options, FISH_BOARD};
use data::rules::ItemCategory;
use data::{food_item_name, opt, party_character_options, NamedOption};
use gamedata::PortraitCache;
use save_file::SaveDocument;
use views::data_values::DataValuesCategory;
use views::experimental::ExperimentalSection;
use views::item_modal::{ItemModalState, ModalTarget};
use views::recruitment::RecruitFilter;
use views::EditorTab;

const APP_ICON_PNG: &[u8] = include_bytes!("../../src-tauri/icons/icon.png");

pub fn main() -> iced::Result {
    let icon = window::icon::from_file_data(APP_ICON_PNG, None).ok();
    iced::application("SuiSaveEditor", App::update, App::view)
        .theme(App::theme)
        .subscription(App::subscription)
        .window(window::Settings {
            size: Size::new(1280.0, 820.0),
            icon,
            ..Default::default()
        })
        .run()
}

struct App {
    active_tab: EditorTab,
    doc: Option<SaveDocument>,
    is_debug_save: bool,
    portraits: PortraitCache,
    party_options: Vec<NamedOption>,
    key_item_options: Vec<NamedOption>,
    food_options: Vec<NamedOption>,
    last_dir: Option<PathBuf>,
    status_message: Option<(String, bool)>,
    // Recruited Characters UI state
    recruit_search: String,
    recruit_filter: RecruitFilter,
    better_leona_mod: bool,
    kraken_patch_mod: bool,
    // Battle Characters UI state
    selected_battle_char: usize,
    battle_search: String,
    battle_recruited_only: bool,
    bypass_rune_restrictions: bool,
    bypass_equip_restrictions: bool,
    // Inventory UI state
    inventory_search: String,
    copied_item: Option<(i64, i64)>,
    item_modal: Option<ItemModalState>,
    // Investigations UI state
    investigation_search: String,
    // Castle Suggestion Box UI state
    suggestion_search: String,
    // Experimental UI state
    experimental_section: ExperimentalSection,
    experimental_filter: String,
    // Data Values UI state
    data_values_category: DataValuesCategory,
    data_values_search: String,
}

impl Default for App {
    fn default() -> Self {
        Self {
            active_tab: EditorTab::General,
            doc: None,
            is_debug_save: false,
            portraits: PortraitCache::load(),
            party_options: party_character_options(),
            key_item_options: key_item_options(),
            food_options: (0..=240).map(|id| opt(id, food_item_name(id))).collect(),
            last_dir: None,
            status_message: None,
            recruit_search: String::new(),
            recruit_filter: RecruitFilter::All,
            better_leona_mod: false,
            kraken_patch_mod: false,
            selected_battle_char: 1,
            battle_search: String::new(),
            battle_recruited_only: false,
            bypass_rune_restrictions: false,
            bypass_equip_restrictions: false,
            inventory_search: String::new(),
            copied_item: None,
            item_modal: None,
            investigation_search: String::new(),
            suggestion_search: String::new(),
            experimental_section: ExperimentalSection::TreasureChests,
            experimental_filter: String::new(),
            data_values_category: DataValuesCategory::Characters,
            data_values_search: String::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub enum Message {
    NoOp,
    WindowOpened(window::Id),
    SelectTab(EditorTab),
    OpenFile,
    FileOpened(Option<PathBuf>),
    LoadDebugSave,
    SaveFile,
    SaveFileAs,
    SaveAsPicked(Option<PathBuf>),
    // General
    SetStringField(Option<&'static str>, &'static str, String),
    SetArrayStringField(Option<&'static str>, &'static str, usize, String),
    SetIntField(Option<&'static str>, &'static str, String),
    SetArrayIntField(Option<&'static str>, &'static str, usize, String),
    ToggleEventFlagBit(usize, u8, bool),
    ToggleArrayFlagBit(Option<&'static str>, &'static str, usize, u8, bool),
    // Recruitment
    SetRecruitSearch(String),
    SetRecruitFilter(RecruitFilter),
    SetBetterLeonaMod(bool),
    SetKrakenPatchMod(bool),
    SetCharaFlag(usize, i64),
    // Battle Characters
    SelectBattleChar(usize),
    SetBattleSearch(String),
    SetBattleRecruitedOnly(bool),
    SetBypassRuneRestrictions(bool),
    SetBypassEquipRestrictions(bool),
    SetBattleCharInt(usize, &'static str, String),
    SetBattleCharArrayInt(usize, &'static str, usize, String),
    SetBattleCharItemUseCnt(usize, usize, String),
    SetKoteiInt(usize, &'static str, i64),
    ToggleKoteiBit(usize, &'static str, u8, bool),
    SetKoteiArrayInt(usize, &'static str, usize, String),
    SetKoteiAffinity(usize, usize, i64),
    SetKoteiAllAffinitiesRankA(usize),
    RestoreBattleCharVitals(usize),
    MaxBattleCharLevel(usize),
    // Inventory & Item Selector Modal
    SetInventorySearch(String),
    SetInventoryField(&'static str, &'static str, usize, &'static str, String),
    ClearInventorySlot(&'static str, &'static str, usize),
    CopyInventoryItem(i64, i64),
    PasteInventorySlot(&'static str, &'static str, usize),
    OpenItemModal(ModalTarget, String, Option<ItemCategory>),
    CloseItemModal,
    SetModalSearch(String),
    SetModalCategory(Option<ItemCategory>),
    ApplyModalItem(ModalTarget, i64, i64),
    // Cooking / Investigations / Castle / Experimental
    SetCookOffStage(u8, u8),
    MaxAllIngredients,
    UnlockAllRecipes,
    SetInvestigationSearch(String),
    SetAllInvestigations(i64),
    DeliverAllGuardianPlans,
    MaxVegetableFarm,
    SetBathItem(usize, i64),
    SetYuzuLivestock(usize, i64),
    MaxYuzuPasture,
    DefaultYuzuPasture,
    ClearYuzuPasture,
    SetTrophyFishingRecords,
    SetSuggestionSearch(String),
    SetSuggestionCharLevel(usize, u8),
    ClearSuggestionInbox,
    SetAllSuggestionLetters(u8),
    ToggleLibFlagBit(u32, bool),
    SelectExperimentalSection(ExperimentalSection),
    SetExperimentalFilter(String),
    SelectDataValuesCategory(DataValuesCategory),
    SetDataValuesSearch(String),
}

impl App {
    fn theme(&self) -> Theme {
        theme::app_theme()
    }

    fn update(&mut self, message: Message) -> Task<Message> {
        match message {
            Message::NoOp => {}
            Message::WindowOpened(_) => {
                #[cfg(windows)]
                apply_windows_taskbar_icon();
            }
            Message::SelectTab(tab) => {
                self.active_tab = tab;
            }
            Message::OpenFile => {
                return Task::perform(
                    save_file::pick_open_file_async(self.last_dir.clone()),
                    Message::FileOpened,
                );
            }
            Message::FileOpened(Some(path)) => {
                self.load_path(path);
            }
            Message::FileOpened(None) => {}
            Message::LoadDebugSave => {
                if let Some(path) = gamedata::debug_save_path() {
                    self.load_path(path);
                } else {
                    self.status_message = Some(("Could not locate debug/save.json".to_string(), true));
                }
            }
            Message::SaveFile => {
                if let Some(doc) = self.doc.as_mut() {
                    let target = doc.path.clone();
                    match doc.save_to(&target) {
                        Ok(()) => {
                            self.is_debug_save = is_debug_save_path(&target);
                            self.status_message = Some((format!("Saved {}", doc.file_name), false));
                        }
                        Err(e) => {
                            self.status_message = Some((e, true));
                        }
                    }
                }
            }
            Message::SaveFileAs => {
                if let Some(doc) = self.doc.as_ref() {
                    return Task::perform(
                        save_file::pick_save_as_file_async(doc.file_name.clone(), doc.path.clone()),
                        Message::SaveAsPicked,
                    );
                }
            }
            Message::SaveAsPicked(Some(target)) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parent) = target.parent() {
                        self.last_dir = Some(parent.to_path_buf());
                    }
                    match doc.save_to(&target) {
                        Ok(()) => {
                            self.status_message =
                                Some((format!("Saved as {}", doc.file_name), false));
                        }
                        Err(e) => {
                            self.status_message = Some((e, true));
                        }
                    }
                }
            }
            Message::SaveAsPicked(None) => {}
            Message::SetStringField(section, key, value) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_str(section, key, value);
                }
            }
            Message::SetArrayStringField(section, key, index, value) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_array_str(section, key, index, value);
                }
            }
            Message::SetIntField(section, key, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_i64(section, key, parsed);
                    }
                }
            }
            Message::SetArrayIntField(section, key, index, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_array_i64(section, key, index, parsed);
                    }
                }
            }
            Message::ToggleEventFlagBit(flag_index, mask, enabled) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.toggle_event_flag_bit(flag_index, mask, enabled);
                }
            }
            Message::ToggleArrayFlagBit(section, key, index, mask, enabled) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.toggle_array_flag_bit(section, key, index, mask, enabled);
                }
            }
            // Recruitment
            Message::SetRecruitSearch(q) => {
                self.recruit_search = q;
            }
            Message::SetRecruitFilter(f) => {
                self.recruit_filter = f;
            }
            Message::SetBetterLeonaMod(v) => {
                self.better_leona_mod = v;
            }
            Message::SetKrakenPatchMod(v) => {
                self.kraken_patch_mod = v;
            }
            Message::SetCharaFlag(idx, flag) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_chara_flag(idx, flag);
                }
            }
            // Battle Characters
            Message::SelectBattleChar(id) => {
                self.selected_battle_char = id;
            }
            Message::SetBattleSearch(q) => {
                self.battle_search = q;
            }
            Message::SetBattleRecruitedOnly(v) => {
                self.battle_recruited_only = v;
            }
            Message::SetBypassRuneRestrictions(v) => {
                self.bypass_rune_restrictions = v;
            }
            Message::SetBypassEquipRestrictions(v) => {
                self.bypass_equip_restrictions = v;
            }
            Message::SetBattleCharInt(id, field, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_battle_char_i64(id, field, parsed);
                    }
                }
            }
            Message::SetBattleCharArrayInt(id, field, slot, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_battle_char_array_i64(id, field, slot, parsed);
                    }
                }
            }
            Message::SetBattleCharItemUseCnt(id, slot, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_battle_char_item_use_cnt(id, slot, parsed);
                    }
                }
            }
            Message::SetKoteiInt(id, field, val) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_kotei_i64(id, field, val);
                }
            }
            Message::ToggleKoteiBit(id, field, mask, on) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.toggle_kotei_bit(id, field, mask, on);
                }
            }
            Message::SetKoteiArrayInt(id, field, slot, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_kotei_array_i64(id, field, slot, parsed);
                    }
                }
            }
            Message::SetKoteiAffinity(id, elem_idx, rank) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_affinity_rank(id, elem_idx, rank);
                }
            }
            Message::SetKoteiAllAffinitiesRankA(id) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_all_affinities_rank_a(id);
                }
            }
            Message::RestoreBattleCharVitals(id) => {
                if let Some(doc) = self.doc.as_mut() {
                    let max_hp = doc.get_battle_char_i64(id, "max_hp");
                    doc.set_battle_char_i64(id, "now_hp", max_hp);
                    for slot in 0..4 {
                        doc.set_battle_char_array_i64(id, "mp", slot, 153);
                    }
                }
            }
            Message::MaxBattleCharLevel(id) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_battle_char_i64(id, "level", 99);
                    doc.set_battle_char_i64(id, "buki_lv", 16);
                }
            }
            // Inventory & Item Selector Modal
            Message::SetInventorySearch(q) => {
                self.inventory_search = q;
            }
            Message::SetInventoryField(section, key, slot, field, raw) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parsed) = parse_int_or_empty(&raw) {
                        doc.set_inventory_field(section, key, slot, field, parsed);
                    }
                }
            }
            Message::ClearInventorySlot(section, key, slot) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.clear_inventory_slot(section, key, slot);
                }
            }
            Message::SetBathItem(slot, item_no) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_inventory_field("game_data", "furo_item", slot, "item_no", item_no);
                    doc.set_inventory_field("game_data", "furo_item", slot, "use_cnt", 64);
                }
            }
            Message::CopyInventoryItem(item_no, use_cnt) => {
                self.copied_item = Some((item_no, use_cnt));
            }
            Message::PasteInventorySlot(section, key, slot) => {
                if let (Some(doc), Some((item_no, use_cnt))) = (self.doc.as_mut(), self.copied_item) {
                    doc.set_inventory_field(section, key, slot, "item_no", item_no);
                    doc.set_inventory_field(section, key, slot, "use_cnt", use_cnt);
                }
            }
            Message::OpenItemModal(target, title, default_cat) => {
                self.item_modal = Some(ItemModalState {
                    target,
                    title,
                    category: default_cat,
                    search: String::new(),
                });
            }
            Message::CloseItemModal => {
                self.item_modal = None;
            }
            Message::SetModalSearch(q) => {
                if let Some(modal) = self.item_modal.as_mut() {
                    modal.search = q;
                }
            }
            Message::SetModalCategory(cat) => {
                if let Some(modal) = self.item_modal.as_mut() {
                    modal.category = cat;
                }
            }
            Message::ApplyModalItem(target, item_no, use_cnt) => {
                if let Some(doc) = self.doc.as_mut() {
                    match target {
                        ModalTarget::Inventory { section, key, slot } => {
                            doc.set_inventory_field(section, key, slot, "item_no", item_no);
                            doc.set_inventory_field(section, key, slot, "use_cnt", use_cnt);
                        }
                        ModalTarget::BattleCharItem { char_id, slot } => {
                            doc.set_battle_char_item_eqp(char_id, slot, item_no, use_cnt);
                        }
                    }
                }
                self.item_modal = None;
            }
            // Cooking / Investigations / Castle / Experimental
            Message::SetCookOffStage(b1, b2) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_array_i64(None, "event_flag", 152, b1 as i64);
                    doc.set_array_i64(None, "event_flag", 153, b2 as i64);
                }
            }
            Message::MaxAllIngredients => {
                if let Some(doc) = self.doc.as_mut() {
                    for i in 0..12 {
                        doc.set_array_i64(Some("game_data"), "food_num", i, 3);
                    }
                }
            }
            Message::UnlockAllRecipes => {
                if let Some(doc) = self.doc.as_mut() {
                    for i in 0..5 {
                        doc.set_array_i64(Some("game_data"), "food_resipi", i, 255);
                    }
                }
            }
            Message::SetInvestigationSearch(q) => {
                self.investigation_search = q;
            }
            Message::SetAllInvestigations(level) => {
                if let Some(doc) = self.doc.as_mut() {
                    let count = doc.get_array_len(Some("game_data"), "tantei_lv");
                    for i in 0..count {
                        doc.set_array_i64(Some("game_data"), "tantei_lv", i, level);
                    }
                }
            }
            Message::DeliverAllGuardianPlans => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_array_i64(Some("game_data"), "parts_no", 0, 255);
                    doc.set_array_i64(Some("game_data"), "parts_no", 1, 255);
                }
            }
            Message::MaxVegetableFarm => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_array_i64(Some("game_data"), "hon_flag", 30, 255);
                    doc.set_array_i64(Some("game_data"), "hon_flag", 31, 255);
                }
            }
            Message::SetYuzuLivestock(food_index, count) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_yuzu_livestock(food_index, count);
                }
            }
            Message::MaxYuzuPasture => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.max_yuzu_pasture();
                }
            }
            Message::DefaultYuzuPasture => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_yuzu_livestock(4, 1);
                    doc.set_yuzu_livestock(5, 0);
                    doc.set_yuzu_livestock(6, 1);
                    doc.set_yuzu_livestock(7, 0);
                }
            }
            Message::ClearYuzuPasture => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_yuzu_livestock(4, 0);
                    doc.set_yuzu_livestock(5, 0);
                    doc.set_yuzu_livestock(6, 0);
                    doc.set_yuzu_livestock(7, 0);
                }
            }
            Message::SetTrophyFishingRecords => {
                if let Some(doc) = self.doc.as_mut() {
                    for fish in FISH_BOARD {
                        let cur_caught =
                            doc.get_array_i64(Some("game_data"), "tsuri_data", fish.caught_idx);
                        if cur_caught == 0 {
                            doc.set_array_i64(Some("game_data"), "tsuri_data", fish.caught_idx, 1);
                        }
                        doc.set_array_i64(
                            Some("game_data"),
                            "tsuri_data",
                            fish.weight_idx,
                            fish.trophy_raw,
                        );
                    }
                }
            }
            Message::SetSuggestionSearch(q) => {
                self.suggestion_search = q;
            }
            Message::SetSuggestionCharLevel(cid, lv) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_meyasu_char_level(cid, lv);
                }
            }
            Message::ClearSuggestionInbox => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.clear_unread_inbox();
                }
            }
            Message::SetAllSuggestionLetters(level) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_all_meyasu_levels(level);
                }
            }
            Message::ToggleLibFlagBit(bit, enabled) => {
                if let Some(doc) = self.doc.as_mut() {
                    let cur = doc.get_i64(Some("game_data"), "lib_flag") as u32;
                    let mask = 1u32 << bit;
                    let next = if enabled { cur | mask } else { cur & !mask };
                    doc.set_i64(Some("game_data"), "lib_flag", next as i64);
                }
            }
            Message::SelectExperimentalSection(sec) => {
                self.experimental_section = sec;
            }
            Message::SetExperimentalFilter(f) => {
                self.experimental_filter = f;
            }
            Message::SelectDataValuesCategory(cat) => {
                self.data_values_category = cat;
            }
            Message::SetDataValuesSearch(q) => {
                self.data_values_search = q;
            }
        }
        Task::none()
    }

    fn load_path(&mut self, path: PathBuf) {
        if let Some(parent) = path.parent() {
            self.last_dir = Some(parent.to_path_buf());
        }
        match SaveDocument::open_and_backup(path) {
            Ok(doc) => {
                let is_debug = is_debug_save_path(&doc.path);
                let bak_note = if doc.backup_path.is_some() {
                    " (.bak created silently)"
                } else {
                    ""
                };
                self.status_message = Some((format!("Loaded {}{}", doc.file_name, bak_note), false));
                self.is_debug_save = is_debug;
                self.doc = Some(doc);
            }
            Err(e) => {
                self.status_message = Some((e, true));
            }
        }
    }

    fn view(&self) -> Element<'_, Message> {
        let top_bar = self.view_top_bar();
        let sidebar = self.view_sidebar();
        let main_panel = self.view_main_panel();

        let base = column![top_bar, row![sidebar, main_panel].height(Length::Fill)]
            .height(Length::Fill);

        // Always keep `base` as child 0 of a `stack!` so opening/closing the modal
        // never changes the root widget type and resets scrollable positions.
        let mut root = stack![base];
        if let Some(modal) = &self.item_modal {
            root = root.push(views::item_modal::view(modal));
        }
        root.into()
    }

    fn view_top_bar(&self) -> Element<'_, Message> {
        let title_group = text("SuiSaveEditor").size(18).color(theme::ACCENT_GOLD);

        let status_badge: Element<'_, Message> = if let Some(doc) = &self.doc {
            let label = if doc.dirty {
                format!("{} • Unsaved changes", doc.file_name)
            } else {
                doc.file_name.clone()
            };
            let color = if doc.dirty {
                theme::ACCENT_GOLD
            } else {
                theme::ACCENT_GREEN
            };
            container(text(label).size(12).color(color))
                .padding([5, 10])
                .style(theme::badge_style(color))
                .into()
        } else {
            container(text("No file loaded").size(12).color(theme::TEXT_MUTED))
                .padding([5, 10])
                .style(theme::badge_style(theme::TEXT_MUTED))
                .into()
        };

        let open_btn = button(text("Open Save...").size(13))
            .on_press(Message::OpenFile)
            .padding([7, 14])
            .style(theme::primary_button_style);

        let mut save_btn = button(text("Save").size(13))
            .padding([7, 14])
            .style(theme::secondary_button_style);
        let mut save_as_btn = button(text("Save As...").size(13))
            .padding([7, 14])
            .style(theme::secondary_button_style);

        if self.doc.is_some() {
            save_btn = save_btn.on_press(Message::SaveFile);
            save_as_btn = save_as_btn.on_press(Message::SaveFileAs);
        }

        let mut bar_row = row![
            title_group,
            Space::with_width(Length::Fixed(16.0)),
            status_badge,
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        if self.doc.is_some() && self.is_debug_save {
            bar_row = bar_row.push(
                container(text("DEBUG SAVE").size(11).color(theme::ACCENT_CYAN))
                    .padding([5, 9])
                    .style(theme::badge_style(theme::ACCENT_CYAN)),
            );
        }

        bar_row = bar_row.push(Space::with_width(Length::Fill));

        if let Some((msg, is_err)) = &self.status_message {
            let color = if *is_err {
                theme::ACCENT_RED
            } else {
                theme::TEXT_MUTED
            };
            bar_row = bar_row.push(text(msg).size(12).color(color));
            bar_row = bar_row.push(Space::with_width(Length::Fixed(8.0)));
        }

        bar_row = bar_row
            .push(open_btn)
            .push(save_btn)
            .push(save_as_btn);

        container(bar_row)
            .padding([10, 18])
            .width(Length::Fill)
            .style(theme::top_bar_style)
            .into()
    }

    fn view_sidebar(&self) -> Element<'_, Message> {
        let active = self.active_tab;

        let mut nav = column![text("EDITORS").size(11).color(theme::TEXT_MUTED)].spacing(4);

        for &tab in EditorTab::EDITOR_TABS {
            let is_active = tab == active;
            let suffix = match (tab, &self.doc) {
                (EditorTab::RecruitedCharacters, Some(d)) => format!(" ({})", d.recruited_count()),
                (EditorTab::PartyBag, Some(d)) => format!(" ({})", d.party_item_count()),
                (EditorTab::Warehouse, Some(d)) => format!(" ({})", d.warehouse_item_count()),
                _ => String::new(),
            };
            let dot_color = if tab.is_implemented() {
                theme::ACCENT_GREEN
            } else {
                theme::BORDER_SUBTLE
            };
            let dot_char = if tab.is_implemented() { "●" } else { "○" };

            let btn = button(
                row![
                    text(format!("{}{}", tab.label(), suffix)).size(13),
                    Space::with_width(Length::Fill),
                    text(dot_char).size(10).color(dot_color),
                ]
                .align_y(Alignment::Center),
            )
            .width(Length::Fill)
            .padding([9, 12])
            .style(theme::nav_button_style(is_active))
            .on_press(Message::SelectTab(tab));

            nav = nav.push(btn);
        }

        nav = nav
            .push(Space::with_height(Length::Fixed(10.0)))
            .push(horizontal_rule(1))
            .push(Space::with_height(Length::Fixed(10.0)))
            .push(text("TOOLS").size(11).color(theme::TEXT_MUTED));

        for &tab in EditorTab::UTILITY_TABS {
            let is_active = tab == active;
            let btn = button(text(tab.label()).size(13))
                .width(Length::Fill)
                .padding([9, 12])
                .style(theme::nav_button_style(is_active))
                .on_press(Message::SelectTab(tab));
            nav = nav.push(btn);
        }

        container(scrollable(nav.padding(12)).style(theme::scrollable_style))
            .width(Length::Fixed(235.0))
            .height(Length::Fill)
            .style(theme::sidebar_style)
            .into()
    }

    fn view_main_panel(&self) -> Element<'_, Message> {
        let body: Element<'_, Message> = match (self.active_tab, &self.doc) {
            (EditorTab::General, Some(doc)) => {
                views::general::view(doc, &self.portraits, &self.party_options)
            }
            (EditorTab::RecruitedCharacters, Some(doc)) => views::recruitment::view(
                doc,
                &self.portraits,
                &self.recruit_search,
                self.recruit_filter,
                self.better_leona_mod,
                self.kraken_patch_mod,
            ),
            (EditorTab::BattleCharacters, Some(doc)) => views::battle_characters::view(
                doc,
                &self.portraits,
                self.selected_battle_char,
                &self.battle_search,
                self.battle_recruited_only,
                self.bypass_rune_restrictions,
                self.bypass_equip_restrictions,
            ),
            (EditorTab::PartyBag, Some(doc)) => views::inventory::view(
                doc,
                &self.portraits,
                None,
                "party_data",
                "party_item",
                "Party Bag Inventory",
                "Key items & active party inventory slots (party_data.event_item & party_data.party_item).",
                &self.inventory_search,
                self.copied_item,
                Some(&self.key_item_options),
                false,
            ),
            (EditorTab::Warehouse, Some(doc)) => views::inventory::view(
                doc,
                &self.portraits,
                Some(98), // Barbara
                "game_data",
                "base_item",
                "Barbara's Castle Warehouse Storage",
                "Warehouse item storage (game_data.base_item) & Room Items (game_data.room_item).",
                &self.inventory_search,
                self.copied_item,
                None,
                true,
            ),
            (EditorTab::Cooking, Some(doc)) => {
                views::cooking::view(doc, &self.portraits, &self.food_options)
            }
            (EditorTab::Investigations, Some(doc)) => views::investigations::view(
                doc,
                &self.portraits,
                &self.party_options,
                &self.investigation_search,
            ),
            (EditorTab::Castle, Some(doc)) => {
                views::castle::view(doc, &self.portraits, &self.suggestion_search)
            }
            (EditorTab::Experimental, Some(doc)) => views::experimental::view(
                doc,
                self.experimental_section,
                &self.experimental_filter,
            ),
            (EditorTab::DataValues, _) => {
                views::data_values::view(self.data_values_category, &self.data_values_search)
            }
            (EditorTab::General, None) => self.view_empty_state(),
            (tab, doc_opt) => views::stub::view_stub(tab, doc_opt.as_ref()),
        };

        container(body)
            .width(Length::Fill)
            .height(Length::Fill)
            .into()
    }

    fn view_empty_state(&self) -> Element<'_, Message> {
        let card = container(
            column![
                text("Welcome to SuiSaveEditor")
                    .size(24)
                    .color(theme::ACCENT_GOLD),
                text("Load a Suikoden II HD Remaster JSON save file to begin editing.\nA silent .bak backup will be created automatically in the same folder.")
                    .size(14)
                    .color(theme::TEXT_MUTED),
                button(text("Open Save File...").size(14))
                    .on_press(Message::OpenFile)
                    .padding([10, 18])
                    .style(theme::primary_button_style),
            ]
            .spacing(16)
            .align_x(Alignment::Center),
        )
        .padding(36)
        .max_width(560)
        .style(theme::card_style);

        container(card)
            .width(Length::Fill)
            .height(Length::Fill)
            .center_x(Length::Fill)
            .center_y(Length::Fill)
            .into()
    }

    fn subscription(&self) -> Subscription<Message> {
        let events = iced::event::listen_with(|event, _status, _id| match event {
            iced::Event::Keyboard(keyboard::Event::KeyPressed {
                key,
                physical_key,
                modifiers,
                ..
            }) => {
                if matches!(key.as_ref(), keyboard::Key::Named(keyboard::key::Named::Escape)) {
                    return Some(Message::CloseItemModal);
                }
                if modifiers.control() || modifiers.command() {
                    match physical_key {
                        keyboard::key::Physical::Code(keyboard::key::Code::KeyD) => {
                            return Some(Message::LoadDebugSave);
                        }
                        keyboard::key::Physical::Code(keyboard::key::Code::KeyO) => {
                            return Some(Message::OpenFile);
                        }
                        keyboard::key::Physical::Code(keyboard::key::Code::KeyS) => {
                            return Some(Message::SaveFile);
                        }
                        _ => {}
                    }
                    if let keyboard::Key::Character(c) = key.as_ref() {
                        if c.eq_ignore_ascii_case("d") || c == "\u{0004}" {
                            return Some(Message::LoadDebugSave);
                        }
                        if c.eq_ignore_ascii_case("o") || c == "\u{000F}" {
                            return Some(Message::OpenFile);
                        }
                        if c.eq_ignore_ascii_case("s") || c == "\u{0013}" {
                            return Some(Message::SaveFile);
                        }
                    }
                }
                None
            }
            iced::Event::Window(window::Event::FileDropped(path)) => {
                Some(Message::FileOpened(Some(path)))
            }
            _ => None,
        });
        let opened = window::open_events().map(Message::WindowOpened);
        Subscription::batch([events, opened])
    }
}

/// `iced_winit 0.13` sets `ICON_SMALL` (titlebar) via `with_window_icon`, but does not set
/// `ICON_BIG` (Windows taskbar). Post `WM_SETICON(ICON_BIG)` using the `1 ICON` resource
/// embedded by `build.rs` so the taskbar shows the app icon instead of the generic exe icon.
#[cfg(windows)]
fn apply_windows_taskbar_icon() {
    use std::ffi::c_void;

    const WM_SETICON: u32 = 0x0080;
    const ICON_BIG: usize = 1;
    const IMAGE_ICON: u32 = 1;
    const LR_DEFAULTSIZE: u32 = 0x0040;

    #[link(name = "kernel32")]
    extern "system" {
        fn GetModuleHandleW(lpModuleName: *const u16) -> *mut c_void;
        fn GetCurrentThreadId() -> u32;
    }

    #[link(name = "user32")]
    extern "system" {
        fn LoadImageW(
            hInst: *mut c_void,
            name: *const u16,
            r#type: u32,
            cx: i32,
            cy: i32,
            fuLoad: u32,
        ) -> *mut c_void;
        fn EnumThreadWindows(
            dwThreadId: u32,
            lpfn: extern "system" fn(*mut c_void, isize) -> i32,
            lParam: isize,
        ) -> i32;
        fn IsWindowVisible(hWnd: *mut c_void) -> i32;
        fn PostMessageW(hWnd: *mut c_void, msg: u32, wParam: usize, lParam: isize) -> i32;
    }

    extern "system" fn enum_proc(hwnd: *mut c_void, lparam: isize) -> i32 {
        unsafe {
            if IsWindowVisible(hwnd) != 0 {
                PostMessageW(hwnd, WM_SETICON, ICON_BIG, lparam);
            }
        }
        1
    }

    unsafe {
        let hinst = GetModuleHandleW(std::ptr::null());
        // Resource ID 1 matches `1 ICON "../src-tauri/icons/icon.ico"` generated by winresource
        let hicon = LoadImageW(hinst, 1usize as *const u16, IMAGE_ICON, 0, 0, LR_DEFAULTSIZE);
        if !hicon.is_null() {
            EnumThreadWindows(GetCurrentThreadId(), enum_proc, hicon as isize);
        }
    }
}

fn is_debug_save_path(path: &std::path::Path) -> bool {
    let Some(debug_path) = gamedata::debug_save_path() else {
        return false;
    };
    match (std::fs::canonicalize(path), std::fs::canonicalize(&debug_path)) {
        (Ok(a), Ok(b)) => a == b,
        _ => path == debug_path,
    }
}

fn parse_int_or_empty(raw: &str) -> Option<i64> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        Some(0)
    } else {
        trimmed.parse::<i64>().ok()
    }
}
