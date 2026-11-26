use iced::widget::{button, column, container, horizontal_rule, row, scrollable, text, Space};
use iced::{Alignment, Element, Length};

use crate::env_detect::{AppSettings, GameEnvStatus};
use crate::i18n::{self, AppLanguage};
use crate::theme::{self, AccentTheme, BaseTheme};
use crate::Message;

pub fn view<'a>(
    settings: &'a AppSettings,
    env: &'a GameEnvStatus,
) -> Element<'a, Message> {
    let lang_card = view_language_card(settings.language);
    let base_card = view_base_theme_card(settings.base_theme);
    let theme_card = view_theme_card(settings.accent);
    let env_card = view_game_env_card(env);
    let info_card = view_app_info_card();

    let content = column![
        column![
            text(i18n::tr("tab_settings"))
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text(i18n::tr("settings_desc"))
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        lang_card,
        base_card,
        theme_card,
        env_card,
        info_card,
    ]
    .spacing(16)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn view_language_card<'a>(current: AppLanguage) -> Element<'a, Message> {
    let mut grid = column![].spacing(10);
    let active_accent = theme::accent();

    for chunk in AppLanguage::ALL.chunks(3) {
        let mut r = row![].spacing(10);
        for &lang in chunk {
            let is_selected = lang == current;
            let btn = button(
                column![
                    text(lang.native_name())
                        .size(13)
                        .color(if is_selected { active_accent } else { theme::TEXT_PRIMARY }),
                    text(lang.english_name())
                        .size(10)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(2),
            )
            .padding([10, 14])
            .width(Length::FillPortion(1))
            .style(theme::accent_choice_button_style(is_selected, active_accent))
            .on_press(Message::SetLanguage(lang));

            r = r.push(btn);
        }
        grid = grid.push(r);
    }

    container(
        column![
            text(i18n::tr("language_title"))
                .size(15)
                .color(theme::accent()),
            text(i18n::tr("language_desc"))
                .size(12)
                .color(theme::TEXT_MUTED),
            grid,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_base_theme_card<'a>(current: BaseTheme) -> Element<'a, Message> {
    let mut grid = column![].spacing(10);
    let active_accent = theme::accent();

    for chunk in BaseTheme::ALL.chunks(3) {
        let mut r = row![].spacing(10);
        for &variant in chunk {
            let is_selected = variant == current;
            let btn = button(
                row![
                    container(Space::with_width(Length::Fixed(18.0)))
                        .height(Length::Fixed(18.0))
                        .style(theme::swatch_style(variant.swatch_color())),
                    column![
                        text(variant.label())
                            .size(13)
                            .color(if is_selected { active_accent } else { theme::TEXT_PRIMARY }),
                        text(variant.subtitle())
                            .size(10)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(1),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
            )
            .padding([10, 14])
            .width(Length::FillPortion(1))
            .style(theme::accent_choice_button_style(is_selected, active_accent))
            .on_press(Message::SetBaseTheme(variant));

            r = r.push(btn);
        }
        for _ in chunk.len()..3 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        grid = grid.push(r);
    }

    container(
        column![
            text(i18n::tr("base_bg_title"))
                .size(15)
                .color(theme::accent()),
            text(i18n::tr("base_bg_desc"))
                .size(12)
                .color(theme::TEXT_MUTED),
            grid,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_theme_card<'a>(current: AccentTheme) -> Element<'a, Message> {
    let mut grid = column![].spacing(10);

    for chunk in AccentTheme::ALL.chunks(3) {
        let mut r = row![].spacing(10);
        for &variant in chunk {
            let is_selected = variant == current;
            let swatch_color = variant.accent_color();
            let status_lbl = if is_selected { i18n::tr("active") } else { i18n::tr("select") };

            let card_btn = button(
                row![
                    container(Space::with_width(Length::Fixed(16.0)))
                        .height(Length::Fixed(16.0))
                        .style(theme::swatch_style(swatch_color)),
                    column![
                        text(variant.label())
                            .size(13)
                            .color(if is_selected { swatch_color } else { theme::TEXT_PRIMARY }),
                        text(status_lbl)
                            .size(10)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(1),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
            )
            .padding([10, 14])
            .width(Length::FillPortion(1))
            .style(theme::accent_choice_button_style(is_selected, swatch_color))
            .on_press(Message::SetAccentTheme(variant));

            r = r.push(card_btn);
        }
        grid = grid.push(r);
    }

    container(
        column![
            text(i18n::tr("accent_title"))
                .size(15)
                .color(theme::accent()),
            text(i18n::tr("accent_desc"))
                .size(12)
                .color(theme::TEXT_MUTED),
            grid,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_game_env_card<'a>(env: &'a GameEnvStatus) -> Element<'a, Message> {
    let path_text = match &env.game_dir {
        Some(p) => p.to_string_lossy().to_string(),
        None => "Not detected automatically — use Browse... to select your game folder.".to_string(),
    };

    let source_badge_text = if env.game_dir.is_none() {
        "Not Found"
    } else if env.is_custom_dir {
        "Manual Path"
    } else {
        "Auto-Detected"
    };
    let source_badge_color = if env.game_dir.is_none() {
        theme::ACCENT_RED
    } else if env.is_custom_dir {
        theme::ACCENT_CYAN
    } else {
        theme::ACCENT_GREEN
    };

    let (bep_label, bep_color, bep_detail) = if env.bepinex_installed {
        let extra = if env.bepinex_doorstop {
            "BepInEx\\core and doorstop loader detected."
        } else {
            "BepInEx\\core detected (doorstop files not found in root)."
        };
        ("Installed", theme::ACCENT_GREEN, extra.to_string())
    } else {
        (
            "Not Installed",
            theme::ACCENT_RED,
            "BepInEx\\core folder was not found in the game directory.".to_string(),
        )
    };

    let (fix_label, fix_color, fix_detail) = match &env.suikodenfix_path {
        Some(p) => (
            "Installed",
            theme::ACCENT_GREEN,
            p.to_string_lossy().to_string(),
        ),
        None => (
            "Not Installed",
            theme::ACCENT_RED,
            "SuikodenFix.dll was not found inside BepInEx\\plugins.".to_string(),
        ),
    };

    let (saves_dir_label, saves_dir_color, saves_dir_detail) = match &env.decrypted_saves_dir {
        Some(p) if env.decrypted_saves_exists => (
            "Found",
            theme::ACCENT_GREEN,
            p.to_string_lossy().to_string(),
        ),
        Some(p) => (
            "Not Created Yet",
            theme::ACCENT_GOLD,
            format!("{} (save in-game with EditSave = true)", p.to_string_lossy()),
        ),
        None => (
            "Unavailable",
            theme::ACCENT_RED,
            "Game folder must be detected first.".to_string(),
        ),
    };

    let (editsave_label, editsave_color, editsave_detail) = match env.edit_save_enabled {
        Some(true) => (
            "Enabled",
            theme::ACCENT_GREEN,
            "EditSave = true in d3xMachina.suikoden_fix.cfg".to_string(),
        ),
        Some(false) => (
            "Disabled",
            theme::ACCENT_GOLD,
            "EditSave = false in d3xMachina.suikoden_fix.cfg (enable to export/import JSON saves)".to_string(),
        ),
        None => (
            "Not Found",
            theme::TEXT_MUTED,
            "BepInEx\\config\\d3xMachina.suikoden_fix.cfg not found yet (launch game once).".to_string(),
        ),
    };

    let mut actions = row![
        button(text(i18n::tr("redetect")).size(12))
            .padding([6, 12])
            .style(theme::secondary_button_style)
            .on_press(Message::RedetectGameEnv),
        button(text(i18n::tr("browse_game_folder")).size(12))
            .padding([6, 12])
            .style(theme::primary_button_style)
            .on_press(Message::BrowseGameDir),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    if env.is_custom_dir {
        actions = actions.push(
            button(text(i18n::tr("reset_auto_detect")).size(12))
                .padding([6, 12])
                .style(theme::secondary_button_style)
                .on_press(Message::ResetGameDir),
        );
    }

    container(
        column![
            row![
                text(i18n::tr("game_env_title"))
                    .size(15)
                    .color(theme::accent()),
                Space::with_width(Length::Fill),
                actions,
            ]
            .align_y(Alignment::Center),
            container(
                column![
                    row![
                        text(i18n::tr("game_location"))
                            .size(12)
                            .color(theme::TEXT_MUTED),
                        Space::with_width(Length::Fill),
                        container(text(source_badge_text).size(11).color(source_badge_color))
                            .padding([2, 8])
                            .style(theme::badge_style(source_badge_color)),
                    ]
                    .align_y(Alignment::Center),
                    text(path_text)
                        .size(13)
                        .color(if env.game_dir.is_some() {
                            theme::TEXT_PRIMARY
                        } else {
                            theme::ACCENT_RED
                        }),
                ]
                .spacing(4),
            )
            .padding(12)
            .width(Length::Fill)
            .style(theme::empty_slot_card_style),
            row![
                container(
                    column![
                        row![
                            text("BepInEx")
                                .size(13)
                                .color(theme::TEXT_PRIMARY),
                            Space::with_width(Length::Fill),
                            container(text(bep_label).size(11).color(bep_color))
                                .padding([2, 8])
                                .style(theme::badge_style(bep_color)),
                        ]
                        .align_y(Alignment::Center),
                        text(bep_detail)
                            .size(11)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(6),
                )
                .padding(12)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
                container(
                    column![
                        row![
                            text("SuikodenFix")
                                .size(13)
                                .color(theme::TEXT_PRIMARY),
                            Space::with_width(Length::Fill),
                            container(text(fix_label).size(11).color(fix_color))
                                .padding([2, 8])
                                .style(theme::badge_style(fix_color)),
                        ]
                        .align_y(Alignment::Center),
                        text(fix_detail)
                            .size(11)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(6),
                )
                .padding(12)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
            ]
            .spacing(12),
            row![
                container(
                    column![
                        row![
                            text("Decrypted Saves Folder (gsd2)")
                                .size(13)
                                .color(theme::TEXT_PRIMARY),
                            Space::with_width(Length::Fill),
                            container(text(saves_dir_label).size(11).color(saves_dir_color))
                                .padding([2, 8])
                                .style(theme::badge_style(saves_dir_color)),
                        ]
                        .align_y(Alignment::Center),
                        text(saves_dir_detail)
                            .size(11)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(6),
                )
                .padding(12)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
                container(
                    column![
                        row![
                            text("SuikodenFix EditSave Config")
                                .size(13)
                                .color(theme::TEXT_PRIMARY),
                            Space::with_width(Length::Fill),
                            container(text(editsave_label).size(11).color(editsave_color))
                                .padding([2, 8])
                                .style(theme::badge_style(editsave_color)),
                        ]
                        .align_y(Alignment::Center),
                        text(editsave_detail)
                            .size(11)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(6),
                )
                .padding(12)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
            ]
            .spacing(12),
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_app_info_card<'a>() -> Element<'a, Message> {
    let config_path = AppSettings::config_path().to_string_lossy().to_string();

    container(
        column![
            text(i18n::tr("app_info_title"))
                .size(15)
                .color(theme::accent()),
            row![
                text(i18n::tr("version_label")).size(12).color(theme::TEXT_MUTED).width(Length::Fixed(110.0)),
                text(concat!("v", env!("CARGO_PKG_VERSION")))
                    .size(12)
                    .color(theme::TEXT_PRIMARY),
            ],
            row![
                text(i18n::tr("settings_file_label")).size(12).color(theme::TEXT_MUTED).width(Length::Fixed(110.0)),
                text(config_path)
                    .size(12)
                    .color(theme::TEXT_MUTED),
            ],
        ]
        .spacing(6),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

/// Full-window blocking overlay displayed when BepInEx or SuikodenFix is missing.
pub fn view_env_blocking_overlay<'a>(env: &'a GameEnvStatus) -> Element<'a, Message> {
    let game_str = match &env.game_dir {
        Some(p) => p.to_string_lossy().to_string(),
        None => "Not detected".to_string(),
    };
    let game_color = if env.game_dir.is_some() {
        theme::ACCENT_GREEN
    } else {
        theme::ACCENT_RED
    };

    let (bep_lbl, bep_color) = if env.bepinex_installed {
        ("Installed", theme::ACCENT_GREEN)
    } else {
        ("Missing", theme::ACCENT_RED)
    };

    let (fix_lbl, fix_color) = if env.suikodenfix_installed() {
        ("Installed", theme::ACCENT_GREEN)
    } else {
        ("Missing", theme::ACCENT_RED)
    };

    let card = container(
        column![
            row![
                container(text("REQUIRED").size(11).color(theme::ACCENT_RED))
                    .padding([3, 8])
                    .style(theme::badge_style(theme::ACCENT_RED)),
                text("BepInEx & SuikodenFix Required")
                    .size(18)
                    .color(theme::TEXT_PRIMARY),
                Space::with_width(Length::Fill),
                button(text(crate::i18n::tr("close")).size(12))
                    .padding([6, 12])
                    .style(theme::secondary_button_style)
                    .on_press(Message::DismissEnvWarning),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            text("Sui2SaveEditor requires BepInEx and SuikodenFix installed in your Suikoden I and II HD Remaster directory to load and save decrypted JSON saves. Please install them or select your game folder below to continue.")
                .size(13)
                .color(theme::TEXT_MUTED),
            horizontal_rule(1),
            container(
                column![
                    row![
                        text("Game Folder:").size(12).color(theme::TEXT_MUTED).width(Length::Fixed(105.0)),
                        text(game_str).size(12).color(game_color),
                    ]
                    .align_y(Alignment::Center),
                    row![
                        text("BepInEx:").size(12).color(theme::TEXT_MUTED).width(Length::Fixed(105.0)),
                        container(text(bep_lbl).size(11).color(bep_color))
                            .padding([2, 8])
                            .style(theme::badge_style(bep_color)),
                    ]
                    .align_y(Alignment::Center),
                    row![
                        text("SuikodenFix:").size(12).color(theme::TEXT_MUTED).width(Length::Fixed(105.0)),
                        container(text(fix_lbl).size(11).color(fix_color))
                            .padding([2, 8])
                            .style(theme::badge_style(fix_color)),
                    ]
                    .align_y(Alignment::Center),
                ]
                .spacing(8),
            )
            .padding(12)
            .width(Length::Fill)
            .style(theme::empty_slot_card_style),
            row![
                Space::with_width(Length::Fill),
                button(text("Re-check").size(13))
                    .padding([8, 16])
                    .style(theme::secondary_button_style)
                    .on_press(Message::RedetectGameEnv),
                button(text("Browse Game Folder...").size(13))
                    .padding([8, 16])
                    .style(theme::primary_button_style)
                    .on_press(Message::BrowseGameDir),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        ]
        .spacing(14),
    )
    .padding(24)
    .max_width(580)
    .style(theme::modal_card_style);

    container(card)
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .style(theme::modal_backdrop_style)
        .into()
}
