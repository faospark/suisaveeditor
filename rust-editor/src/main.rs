#![cfg_attr(windows, windows_subsystem = "windows")]

mod data;
mod env_detect;
mod gamedata;
mod i18n;
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
use env_detect::{AppSettings, GameEnvStatus, SaveSlotSummary, SavesSortMode, SnapshotInfo};
use gamedata::PortraitCache;
use i18n::AppLanguage;
use save_file::SaveDocument;
use theme::{AccentTheme, BaseTheme};
use views::data_values::DataValuesCategory;
use views::experimental::ExperimentalSection;
use views::item_modal::{ItemModalState, ModalTarget};
use views::notification_modal::NotificationModalState;
use views::recruitment::RecruitFilter;
use views::restore_modal::RestoreModalState;
use views::EditorTab;

const APP_ICON_PNG: &[u8] = include_bytes!("../../src-tauri/icons/icon.png");
const NOTO_SANS_TTF: &[u8] = include_bytes!("../assets/fonts/NotoSans-Variable.ttf");
const NOTO_SANS_CJK_OTF: &[u8] = include_bytes!("../assets/fonts/NotoSansCJKjp-Regular.otf");
const MATERIAL_SYMBOLS_TTF: &[u8] = include_bytes!("../assets/fonts/MaterialSymbolsRounded.ttf");

pub fn main() -> iced::Result {
    #[cfg(windows)]
    let _single_instance = match acquire_single_instance() {
        Some(guard) => guard,
        None => return Ok(()),
    };

    let icon = window::icon::from_file_data(APP_ICON_PNG, None).ok();
    iced::application("Bright Shield Save Editor", App::update, App::view)
        .font(NOTO_SANS_CJK_OTF)
        .font(NOTO_SANS_TTF)
        .font(MATERIAL_SYMBOLS_TTF)
        .default_font(iced::Font::with_name("Noto Sans CJK JP"))
        .theme(App::theme)
        .subscription(App::subscription)
        .window(window::Settings {
            size: Size::new(1280.0, 820.0),
            min_size: Some(Size::new(1160.0, 680.0)),
            position: window::Position::Centered,
            icon,
            ..Default::default()
        })
        .run()
}

struct App {
    active_tab: EditorTab,
    doc: Option<SaveDocument>,
    is_debug_save: bool,
    is_single_file_mode: bool,
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
    restore_modal: Option<RestoreModalState>,
    notification_modal: Option<NotificationModalState>,
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
    // Settings & Environment detection
    settings: AppSettings,
    game_env: GameEnvStatus,
    env_warning_dismissed: bool,
    // Managed Saves browser state
    managed_saves: Vec<SaveSlotSummary>,
    snapshots: Vec<SnapshotInfo>,
    auto_snapshot_banner: Option<String>,
    saves_search: String,
    saves_sort: SavesSortMode,
    saves_scroll_y: f32,
    saves_scrolling_to_top: bool,
}

impl Default for App {
    fn default() -> Self {
        let mut settings = AppSettings::load();
        i18n::set_language(settings.language);
        theme::set_base_theme(settings.base_theme);
        theme::set_accent(settings.accent);
        let game_env = env_detect::detect_game_env(settings.custom_game_dir.as_deref());
        let managed_saves = game_env
            .decrypted_saves_dir
            .as_deref()
            .map(env_detect::scan_decrypted_saves)
            .unwrap_or_default();

        // First-run automatic full snapshot backup (silent, with inline interface notice)
        let mut auto_snapshot_banner = None;
        if !settings.first_run_snapshot_created && !managed_saves.is_empty() {
            if let Some(dir) = game_env.decrypted_saves_dir.as_deref() {
                if let Ok(snap) = env_detect::create_saves_snapshot(dir) {
                    settings.first_run_snapshot_created = true;
                    auto_snapshot_banner = Some(snap.file_name);
                }
            }
        }
        let snapshots = game_env
            .decrypted_saves_dir
            .as_deref()
            .map(env_detect::scan_snapshots)
            .unwrap_or_default();

        if !settings.first_run_completed || auto_snapshot_banner.is_some() {
            settings.first_run_completed = true;
            settings.save();
        }
        Self {
            active_tab: EditorTab::Saves,
            doc: None,
            is_debug_save: false,
            is_single_file_mode: false,
            portraits: PortraitCache::load(),
            party_options: party_character_options(),
            key_item_options: key_item_options(),
            food_options: (0..=240).map(|id| opt(id, food_item_name(id))).collect(),
            last_dir: None,
            status_message: None,
            recruit_search: String::new(),
            recruit_filter: RecruitFilter::All,
            better_leona_mod: game_env.better_leona_active(),
            kraken_patch_mod: game_env.kraken_patch_enabled,
            selected_battle_char: 1,
            battle_search: String::new(),
            battle_recruited_only: false,
            bypass_rune_restrictions: false,
            bypass_equip_restrictions: false,
            inventory_search: String::new(),
            copied_item: None,
            item_modal: None,
            restore_modal: None,
            notification_modal: None,
            investigation_search: String::new(),
            suggestion_search: String::new(),
            experimental_section: ExperimentalSection::TreasureChests,
            experimental_filter: String::new(),
            data_values_category: DataValuesCategory::Characters,
            data_values_search: String::new(),
            settings,
            game_env,
            env_warning_dismissed: false,
            managed_saves,
            snapshots,
            auto_snapshot_banner,
            saves_search: String::new(),
            saves_sort: SavesSortMode::MostRecent,
            saves_scroll_y: 0.0,
            saves_scrolling_to_top: false,
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
    ResetRecruitFull(usize),
    // Battle Characters
    SelectBattleChar(usize),
    JumpToCombatant(usize),
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
    SetInvestigationLevel(usize, u8),
    SetAllInvestigations(bool),
    DeliverAllGuardianPlans,
    SetTonyCrop(usize, i64),
    MaxVegetableFarm,
    DefaultVegetableFarm,
    ClearVegetableFarm,
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
    ResetGameTimer(&'static str),
    TogglePartyToasty(usize, bool),
    SetShopStim(&'static str, usize, String),
    SetShopZai(&'static str, usize, usize, String),
    ResetAllShopTimers(&'static str),
    SelectExperimentalSection(ExperimentalSection),
    SetExperimentalFilter(String),
    SelectDataValuesCategory(DataValuesCategory),
    SetDataValuesSearch(String),
    // Settings & Environment detection
    SetLanguage(AppLanguage),
    SetBaseTheme(BaseTheme),
    SetAccentTheme(AccentTheme),
    RedetectGameEnv,
    BrowseGameDir,
    GameDirPicked(Option<PathBuf>),
    ResetGameDir,
    // Managed Saves browser & Backups
    RefreshSaves,
    SelectManagedSave(PathBuf),
    SetSavesSearch(String),
    SetSavesSort(SavesSortMode),
    OpenRestoreModal(PathBuf),
    CloseRestoreModal,
    SetRestoreModalSearch(String),
    ConfirmRestoreSaveBackup(PathBuf),
    CreateFullSnapshot,
    RestoreFullSnapshot(PathBuf),
    DeleteFullSnapshot(PathBuf),
    DismissAutoSnapshotBanner,
    CloseNotificationModal,
    DismissEnvWarning,
    SavesScrolled(f32),
    ScrollSavesToTop,
    ScrollSavesStep,
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
                if self.load_path(path) && self.active_tab == EditorTab::Saves {
                    self.active_tab = EditorTab::General;
                }
            }
            Message::FileOpened(None) => {}
            Message::LoadDebugSave => {
                if let Some(path) = gamedata::debug_save_path() {
                    if self.load_path(path) && self.active_tab == EditorTab::Saves {
                        self.active_tab = EditorTab::General;
                    }
                } else {
                    self.status_message = Some(("Could not locate debug/save.json".to_string(), true));
                }
            }
            Message::SaveFile => {
                let mut saved_ok = false;
                if let Some(doc) = self.doc.as_mut() {
                    let target = doc.path.clone();
                    match doc.save_to(&target) {
                        Ok(()) => {
                            self.is_debug_save = is_debug_save_path(&target);
                            self.status_message = Some((format!("Saved {}", doc.file_name), false));
                            self.notification_modal = Some(NotificationModalState::success(
                                "SAVED",
                                "Save File Updated",
                                format!("Successfully saved changes to {}.", doc.file_name),
                                Some(target.display().to_string()),
                            ));
                            saved_ok = true;
                        }
                        Err(e) => {
                            self.status_message = Some((e.clone(), true));
                            self.notification_modal = Some(NotificationModalState::error(
                                "ERROR",
                                "Save Failed",
                                e,
                            ));
                        }
                    }
                }
                if saved_ok {
                    self.refresh_managed_saves();
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
                let mut saved_ok = false;
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(parent) = target.parent() {
                        self.last_dir = Some(parent.to_path_buf());
                    }
                    match doc.save_to(&target) {
                        Ok(()) => {
                            let is_debug = is_debug_save_path(&target);
                            let in_managed = self
                                .game_env
                                .decrypted_saves_dir
                                .as_deref()
                                .map(|d| env_detect::is_file_in_dir(&target, d))
                                .unwrap_or(false);
                            self.is_debug_save = is_debug;
                            self.is_single_file_mode = !is_debug && !in_managed;
                            self.status_message =
                                Some((format!("Saved as {}", doc.file_name), false));
                            self.notification_modal = Some(NotificationModalState::success(
                                "SAVED",
                                "Save File Created",
                                format!("Successfully saved as {}.", doc.file_name),
                                Some(target.display().to_string()),
                            ));
                            saved_ok = true;
                        }
                        Err(e) => {
                            self.status_message = Some((e.clone(), true));
                            self.notification_modal = Some(NotificationModalState::error(
                                "ERROR",
                                "Save As Failed",
                                e,
                            ));
                        }
                    }
                }
                if saved_ok {
                    self.refresh_managed_saves();
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
            Message::ResetRecruitFull(idx) => {
                if let Some(doc) = self.doc.as_mut() {
                    if let Some(msg) = doc.reset_recruit_full(idx) {
                        self.status_message = Some((msg, false));
                    }
                }
            }
            // Battle Characters
            Message::SelectBattleChar(id) => {
                self.selected_battle_char = id;
            }
            Message::JumpToCombatant(id) => {
                self.selected_battle_char = id;
                self.active_tab = EditorTab::BattleCharacters;
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
                self.restore_modal = None;
                self.notification_modal = None;
                if !self.game_env.is_ready() {
                    self.env_warning_dismissed = true;
                }
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
            Message::SetInvestigationLevel(char_id, level) => {
                if let Some(doc) = self.doc.as_mut() {
                    views::investigations::set_character_level(doc, char_id, level);
                }
            }
            Message::SetAllInvestigations(unlock) => {
                if let Some(doc) = self.doc.as_mut() {
                    let count = doc.get_array_len(Some("game_data"), "tantei_lv");
                    for i in 0..count {
                        doc.set_array_i64(Some("game_data"), "tantei_lv", i, 0);
                    }
                    if unlock {
                        for char_id in 1..=122usize {
                            if views::investigations::is_investigable(char_id as i64) {
                                let max = views::investigations::max_secrets(char_id as i64) as u8;
                                views::investigations::set_character_level(doc, char_id, max);
                            }
                        }
                    }
                }
            }
            Message::DeliverAllGuardianPlans => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_array_i64(Some("game_data"), "parts_no", 0, 255);
                    doc.set_array_i64(Some("game_data"), "parts_no", 1, 255);
                }
            }
            Message::SetTonyCrop(food_index, count) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_tony_crop(food_index, count);
                }
            }
            Message::MaxVegetableFarm => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.max_tony_farm();
                }
            }
            Message::DefaultVegetableFarm => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_tony_crop(0, 1);
                    doc.set_tony_crop(1, 1);
                    doc.set_tony_crop(2, 0);
                    doc.set_tony_crop(3, 0);
                }
            }
            Message::ClearVegetableFarm => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.set_tony_crop(0, 0);
                    doc.set_tony_crop(1, 0);
                    doc.set_tony_crop(2, 0);
                    doc.set_tony_crop(3, 0);
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
            Message::ResetGameTimer(key) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.reset_game_timer(key);
                    self.status_message = Some((format!("Reset {} cooldown timer to 00:00", key), false));
                }
            }
            Message::TogglePartyToasty(slot, on) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.toggle_party_toasty(slot, on);
                }
            }
            Message::SetShopStim(cat, idx, val) => {
                if let Some(doc) = self.doc.as_mut() {
                    let parsed = val.trim().parse::<i64>().unwrap_or(0);
                    doc.set_shop_stim(cat, idx, parsed);
                }
            }
            Message::SetShopZai(cat, idx, slot, val) => {
                if let Some(doc) = self.doc.as_mut() {
                    let parsed = val.trim().parse::<i64>().unwrap_or(0);
                    doc.set_shop_zai(cat, idx, slot, parsed);
                }
            }
            Message::ResetAllShopTimers(cat) => {
                if let Some(doc) = self.doc.as_mut() {
                    doc.reset_all_shop_timers(cat);
                    self.status_message = Some((format!("Reset all {} restock timers to 0", cat), false));
                }
            }
            Message::SelectDataValuesCategory(cat) => {
                self.data_values_category = cat;
            }
            Message::SetDataValuesSearch(q) => {
                self.data_values_search = q;
            }
            Message::SetLanguage(lang) => {
                self.settings.language = lang;
                i18n::set_language(lang);
                self.party_options = party_character_options();
                self.key_item_options = key_item_options();
                self.food_options = (0..=240).map(|id| opt(id, food_item_name(id))).collect();
                self.settings.save();
            }
            Message::SetBaseTheme(base) => {
                self.settings.base_theme = base;
                theme::set_base_theme(base);
                self.settings.save();
            }
            Message::SetAccentTheme(accent) => {
                self.settings.accent = accent;
                theme::set_accent(accent);
                self.settings.save();
            }
            Message::RedetectGameEnv => {
                self.game_env =
                    env_detect::detect_game_env(self.settings.custom_game_dir.as_deref());
                self.better_leona_mod = self.game_env.better_leona_active();
                self.kraken_patch_mod = self.game_env.kraken_patch_enabled;
                self.refresh_managed_saves();
            }
            Message::BrowseGameDir => {
                let initial = self.game_env.game_dir.clone();
                return Task::perform(
                    env_detect::pick_game_dir_async(initial),
                    Message::GameDirPicked,
                );
            }
            Message::GameDirPicked(Some(dir)) => {
                self.settings.custom_game_dir = Some(dir);
                self.settings.save();
                self.game_env =
                    env_detect::detect_game_env(self.settings.custom_game_dir.as_deref());
                self.better_leona_mod = self.game_env.better_leona_active();
                self.kraken_patch_mod = self.game_env.kraken_patch_enabled;
                self.refresh_managed_saves();
            }
            Message::GameDirPicked(None) => {}
            Message::ResetGameDir => {
                self.settings.custom_game_dir = None;
                self.settings.save();
                self.game_env = env_detect::detect_game_env(None);
                self.better_leona_mod = self.game_env.better_leona_active();
                self.kraken_patch_mod = self.game_env.kraken_patch_enabled;
                self.refresh_managed_saves();
            }
            Message::RefreshSaves => {
                self.refresh_managed_saves();
            }
            Message::SelectManagedSave(path) => {
                if self.load_path(path) {
                    self.active_tab = EditorTab::General;
                }
            }
            Message::SetSavesSearch(q) => {
                self.saves_search = q;
            }
            Message::SetSavesSort(mode) => {
                self.saves_sort = mode;
            }
            Message::OpenRestoreModal(path) => match RestoreModalState::load(path) {
                Ok(state) => {
                    self.restore_modal = Some(state);
                }
                Err(e) => {
                    self.status_message = Some((e, true));
                }
            },
            Message::CloseRestoreModal => {
                self.restore_modal = None;
            }
            Message::SetRestoreModalSearch(q) => {
                if let Some(modal) = self.restore_modal.as_mut() {
                    modal.search = q;
                }
            }
            Message::ConfirmRestoreSaveBackup(path) => {
                self.restore_modal = None;
                let fname = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("save")
                    .to_string();
                match env_detect::restore_single_bak(&path) {
                    Ok(()) => {
                        let is_open = self
                            .doc
                            .as_ref()
                            .map(|d| d.path == path)
                            .unwrap_or(false);
                        if is_open {
                            let _ = self.load_path(path);
                        }
                        self.refresh_managed_saves();
                        self.status_message =
                            Some((format!("Restored {} from backups\\{}.bak", fname, fname), false));
                    }
                    Err(e) => {
                        self.status_message = Some((e, true));
                    }
                }
            }
            Message::CreateFullSnapshot => {
                if let Some(dir) = self.game_env.decrypted_saves_dir.as_deref() {
                    match env_detect::create_saves_snapshot(dir) {
                        Ok(snap) => {
                            self.refresh_managed_saves();
                            self.status_message = Some((
                                format!(
                                    "Snapshot created: {} ({} saves)",
                                    snap.file_name, snap.file_count
                                ),
                                false,
                            ));
                            self.notification_modal = Some(NotificationModalState::success(
                                "SNAPSHOT",
                                "Snapshot Backup Created",
                                format!(
                                    "Archived {} save(s) into {}.",
                                    snap.file_count, snap.file_name
                                ),
                                Some(snap.path.display().to_string()),
                            ));
                        }
                        Err(e) => {
                            self.status_message = Some((e.clone(), true));
                            self.notification_modal = Some(NotificationModalState::error(
                                "ERROR",
                                "Snapshot Backup Failed",
                                e,
                            ));
                        }
                    }
                }
            }
            Message::RestoreFullSnapshot(zip_path) => {
                let zname = zip_path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("snapshot.zip")
                    .to_string();
                if let Some(dir) = self.game_env.decrypted_saves_dir.clone() {
                    match env_detect::restore_saves_snapshot(&zip_path, &dir) {
                        Ok(count) => {
                            if let Some(open_path) = self.doc.as_ref().map(|d| d.path.clone()) {
                                if env_detect::is_file_in_dir(&open_path, &dir) {
                                    let _ = self.load_path(open_path);
                                }
                            }
                            self.refresh_managed_saves();
                            self.status_message = Some((
                                format!("Restored {} saves from {}", count, zname),
                                false,
                            ));
                        }
                        Err(e) => {
                            self.status_message = Some((e, true));
                        }
                    }
                }
            }
            Message::DeleteFullSnapshot(zip_path) => {
                let zname = zip_path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("snapshot.zip")
                    .to_string();
                match env_detect::delete_saves_snapshot(&zip_path) {
                    Ok(()) => {
                        self.refresh_managed_saves();
                        self.status_message =
                            Some((format!("Deleted snapshot: {}", zname), false));
                    }
                    Err(e) => {
                        self.status_message = Some((e, true));
                    }
                }
            }
            Message::DismissAutoSnapshotBanner => {
                self.auto_snapshot_banner = None;
            }
            Message::CloseNotificationModal => {
                self.notification_modal = None;
            }
            Message::DismissEnvWarning => {
                self.env_warning_dismissed = true;
            }
            Message::SavesScrolled(y) => {
                // If user manually scrolls downward during animated scroll-to-top, stop animating
                if self.saves_scrolling_to_top && y > self.saves_scroll_y + 2.0 {
                    self.saves_scrolling_to_top = false;
                }
                self.saves_scroll_y = y;
            }
            Message::ScrollSavesToTop => {
                if self.saves_scroll_y > 0.5 {
                    self.saves_scrolling_to_top = true;
                }
            }
            Message::ScrollSavesStep => {
                if !self.saves_scrolling_to_top {
                    return Task::none();
                }
                let next_y = (self.saves_scroll_y * 0.78 - 10.0).max(0.0);
                self.saves_scroll_y = next_y;
                if next_y <= 0.5 {
                    self.saves_scroll_y = 0.0;
                    self.saves_scrolling_to_top = false;
                    return scrollable::scroll_to(
                        views::saves::scroll_id(),
                        scrollable::AbsoluteOffset { x: 0.0, y: 0.0 },
                    );
                }
                return scrollable::scroll_to(
                    views::saves::scroll_id(),
                    scrollable::AbsoluteOffset { x: 0.0, y: next_y },
                );
            }
        }
        Task::none()
    }

    fn refresh_managed_saves(&mut self) {
        self.managed_saves = self
            .game_env
            .decrypted_saves_dir
            .as_deref()
            .map(env_detect::scan_decrypted_saves)
            .unwrap_or_default();
        if !self.settings.first_run_snapshot_created && !self.managed_saves.is_empty() {
            if let Some(dir) = self.game_env.decrypted_saves_dir.as_deref() {
                if let Ok(snap) = env_detect::create_saves_snapshot(dir) {
                    self.settings.first_run_snapshot_created = true;
                    self.settings.save();
                    self.auto_snapshot_banner = Some(snap.file_name);
                }
            }
        }
        self.snapshots = self
            .game_env
            .decrypted_saves_dir
            .as_deref()
            .map(env_detect::scan_snapshots)
            .unwrap_or_default();
    }

    fn load_path(&mut self, path: PathBuf) -> bool {
        let is_debug = is_debug_save_path(&path);
        let in_managed = self
            .game_env
            .decrypted_saves_dir
            .as_deref()
            .map(|d| env_detect::is_file_in_dir(&path, d))
            .unwrap_or(false);
        if !is_debug {
            if let Some(parent) = path.parent() {
                self.last_dir = Some(parent.to_path_buf());
            }
        }
        match SaveDocument::open_and_backup(path) {
            Ok(doc) => {
                let bak_note = if doc.backup_path.is_some() {
                    " (.bak created silently)"
                } else {
                    ""
                };
                self.status_message = Some((format!("Loaded {}{}", doc.file_name, bak_note), false));
                self.is_debug_save = is_debug;
                self.is_single_file_mode = !is_debug && !in_managed;
                self.doc = Some(doc);
                true
            }
            Err(e) => {
                self.status_message = Some((e, true));
                false
            }
        }
    }

    fn view(&self) -> Element<'_, Message> {
        let top_bar = self.view_top_bar();
        let sidebar = self.view_sidebar();
        let main_panel = self.view_main_panel();
        let footer = self.view_footer_bar();

        let base = column![
            top_bar,
            row![sidebar, main_panel].height(Length::Fill),
            footer,
        ]
        .height(Length::Fill);

        // Always keep `base` as child 0 of a `stack!` so opening/closing modals
        // never changes the root widget type and resets scrollable positions.
        let mut root = stack![base];
        if let Some(modal) = &self.item_modal {
            root = root.push(views::item_modal::view(modal));
        }
        if let Some(modal) = &self.restore_modal {
            root = root.push(views::restore_modal::view(modal));
        }
        if let Some(modal) = &self.notification_modal {
            root = root.push(views::notification_modal::view(modal));
        }
        if !self.game_env.is_ready() && !self.env_warning_dismissed {
            root = root.push(views::settings::view_env_blocking_overlay(&self.game_env));
        }
        root.into()
    }

    fn view_footer_bar(&self) -> Element<'_, Message> {
        container(
            row![
                Space::with_width(Length::Fill),
                text(concat!("Bright Shield Save Editor v", env!("CARGO_PKG_VERSION")))
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ]
            .align_y(Alignment::Center),
        )
        .padding([4, 14])
        .width(Length::Fill)
        .style(theme::footer_bar_style)
        .into()
    }

    fn view_top_bar(&self) -> Element<'_, Message> {
        let title_group = text("Bright Shield Save Editor").size(18).color(theme::accent());

        let status_badge: Element<'_, Message> = if let Some(doc) = &self.doc {
            let label = if doc.dirty {
                format!("{} • {}", doc.file_name, i18n::tr("unsaved_changes"))
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
            container(text(i18n::tr("no_file_loaded")).size(12).color(theme::TEXT_MUTED))
                .padding([5, 10])
                .style(theme::badge_style(theme::TEXT_MUTED))
                .into()
        };

        let open_btn = button(
            row![
                theme::icon(theme::icons::FOLDER_OPEN, 15.0),
                text(i18n::tr("open_save")).size(13),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
        .on_press(Message::OpenFile)
        .padding([7, 14])
        .style(theme::secondary_button_style);

        let mut save_btn = button(
            row![
                theme::icon(theme::icons::SAVE, 15.0),
                text(i18n::tr("save")).size(13),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
        .padding([7, 14])
        .style(if self.doc.is_some() {
            theme::primary_button_style
        } else {
            theme::secondary_button_style
        });
        let mut save_as_btn = button(
            row![
                theme::icon(theme::icons::SAVE_AS, 15.0),
                text(i18n::tr("save_as")).size(13),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
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
                container(text(i18n::tr("debug_save")).size(11).color(theme::ACCENT_CYAN))
                    .padding([5, 9])
                    .style(theme::badge_style(theme::ACCENT_CYAN)),
            );
        } else if self.doc.is_some() && self.is_single_file_mode {
            bar_row = bar_row.push(
                container(text(i18n::tr("single_file_mode")).size(11).color(theme::ACCENT_GOLD))
                    .padding([5, 9])
                    .style(theme::badge_style(theme::ACCENT_GOLD)),
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

        if self.active_tab != EditorTab::Saves {
            bar_row = bar_row
                .push(open_btn)
                .push(save_btn)
                .push(save_as_btn);
        }

        container(bar_row)
            .padding([10, 18])
            .width(Length::Fill)
            .style(theme::top_bar_style)
            .into()
    }

    fn view_sidebar(&self) -> Element<'_, Message> {
        let active = self.active_tab;

        let mut nav = column![text(i18n::tr("editors")).size(11).color(theme::TEXT_MUTED)].spacing(4);

        for &tab in EditorTab::EDITOR_TABS {
            let is_active = tab == active;
            let enabled = tab == EditorTab::Saves || self.doc.is_some();

            let mut btn = button(
                row![
                    theme::icon(tab.icon(), 16.0),
                    theme::active_text(tab.label(), 13.0, is_active),
                ]
                .spacing(8)
                .align_y(Alignment::Center),
            )
            .width(Length::Fill)
            .padding([9, 12])
            .style(theme::nav_button_style(is_active));

            if enabled {
                btn = btn.on_press(Message::SelectTab(tab));
            }

            nav = nav.push(btn);
        }

        nav = nav
            .push(Space::with_height(Length::Fixed(10.0)))
            .push(horizontal_rule(1))
            .push(Space::with_height(Length::Fixed(10.0)))
            .push(text(i18n::tr("tools")).size(11).color(theme::TEXT_MUTED));

        for &tab in EditorTab::UTILITY_TABS {
            let is_active = tab == active;
            let btn = button(
                row![
                    theme::icon(tab.icon(), 16.0),
                    theme::active_text(tab.label(), 13.0, is_active),
                ]
                .spacing(8)
                .align_y(Alignment::Center),
            )
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
            (EditorTab::Saves, doc_opt) => views::saves::view(
                &self.game_env,
                &self.managed_saves,
                &self.snapshots,
                self.auto_snapshot_banner.as_deref(),
                &self.portraits,
                doc_opt.as_ref().map(|d| d.path.as_path()),
                &self.saves_search,
                self.saves_sort,
                self.saves_scroll_y > 180.0,
            ),
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
                i18n::tr("party_bag_title"),
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
                i18n::tr("warehouse_title"),
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
            (EditorTab::Settings, _) => views::settings::view(&self.settings, &self.game_env),
            (tab @ (EditorTab::Changelog | EditorTab::About), doc_opt) => {
                views::stub::view_stub(tab, doc_opt.as_ref())
            }
            (_, None) => self.view_empty_state(),
        };

        container(body)
            .width(Length::Fill)
            .height(Length::Fill)
            .into()
    }

    fn view_empty_state(&self) -> Element<'_, Message> {
        let card = container(
            column![
                text(i18n::tr("welcome_title"))
                    .size(24)
                    .color(theme::accent()),
                text(i18n::tr("welcome_desc"))
                    .size(14)
                    .color(theme::TEXT_MUTED),
                button(text(i18n::tr("open_save_file")).size(14))
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
        if self.saves_scrolling_to_top {
            let frames = window::frames().map(|_| Message::ScrollSavesStep);
            Subscription::batch([events, opened, frames])
        } else {
            Subscription::batch([events, opened])
        }
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

#[cfg(windows)]
struct SingleInstanceGuard(*mut std::ffi::c_void);

#[cfg(windows)]
impl Drop for SingleInstanceGuard {
    fn drop(&mut self) {
        #[link(name = "kernel32")]
        extern "system" {
            fn CloseHandle(hObject: *mut std::ffi::c_void) -> i32;
        }
        if !self.0.is_null() {
            unsafe {
                CloseHandle(self.0);
            }
        }
    }
}

/// Ensures only one instance of SuiSaveEditor can run at a time on Windows.
/// If another instance is already open, restores and focuses its window and returns `None`.
#[cfg(windows)]
fn acquire_single_instance() -> Option<SingleInstanceGuard> {
    use std::ffi::c_void;

    const ERROR_ALREADY_EXISTS: u32 = 183;
    const SW_RESTORE: i32 = 9;

    #[link(name = "kernel32")]
    extern "system" {
        fn CreateMutexW(
            lpMutexAttributes: *mut c_void,
            bInitialOwner: i32,
            lpName: *const u16,
        ) -> *mut c_void;
        fn GetLastError() -> u32;
        fn CloseHandle(hObject: *mut c_void) -> i32;
    }

    #[link(name = "user32")]
    extern "system" {
        fn FindWindowW(lpClassName: *const u16, lpWindowName: *const u16) -> *mut c_void;
        fn IsIconic(hWnd: *mut c_void) -> i32;
        fn ShowWindow(hWnd: *mut c_void, nCmdShow: i32) -> i32;
        fn SetForegroundWindow(hWnd: *mut c_void) -> i32;
    }

    let mutex_name: Vec<u16> = "Local\\BrightShield_SingleInstance_Mutex\0"
        .encode_utf16()
        .collect();
    let title_w: Vec<u16> = "Bright Shield Save Editor\0".encode_utf16().collect();

    unsafe {
        let handle = CreateMutexW(std::ptr::null_mut(), 0, mutex_name.as_ptr());
        if handle.is_null() {
            return Some(SingleInstanceGuard(std::ptr::null_mut()));
        }
        if GetLastError() == ERROR_ALREADY_EXISTS {
            CloseHandle(handle);
            let hwnd = FindWindowW(std::ptr::null(), title_w.as_ptr());
            if !hwnd.is_null() {
                if IsIconic(hwnd) != 0 {
                    ShowWindow(hwnd, SW_RESTORE);
                }
                SetForegroundWindow(hwnd);
            }
            return None;
        }
        Some(SingleInstanceGuard(handle))
    }
}
