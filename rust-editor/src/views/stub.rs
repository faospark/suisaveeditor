use iced::widget::{column, container, row, scrollable, text};
use iced::{Element, Length};

use crate::save_file::SaveDocument;
use crate::theme;
use crate::views::EditorTab;
use crate::Message;

const CHANGELOG_MD: &str = include_str!("../../../CHANGELOG.md");

pub fn view_stub<'a>(tab: EditorTab, doc: Option<&'a SaveDocument>) -> Element<'a, Message> {
    match tab {
        EditorTab::Changelog => view_changelog(),
        EditorTab::About => view_about(),
        _ => view_editor_placeholder(tab, doc),
    }
}

fn view_changelog<'a>() -> Element<'a, Message> {
    let content = column![
        text("Changelog").size(22).color(theme::ACCENT_GOLD),
        container(text(CHANGELOG_MD).size(12).color(theme::TEXT_PRIMARY))
            .padding(18)
            .width(Length::Fill)
            .style(theme::card_style),
    ]
    .spacing(12)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn view_editor_placeholder<'a>(tab: EditorTab, doc: Option<&'a SaveDocument>) -> Element<'a, Message> {
    let live_metric = match (tab, doc) {
        (EditorTab::BattleCharacters, Some(d)) => {
            format!("Loaded save contains {} battle character entries (chara_data.c_varia_dat).", d.battle_character_count())
        }
        (EditorTab::RecruitedCharacters, Some(d)) => {
            format!("Loaded save has {} recruited stars detected in chara_flag[0..124].", d.recruited_count())
        }
        (EditorTab::PartyBag, Some(d)) => {
            format!("Loaded save has {} occupied slots in party_data.party_item.", d.party_item_count())
        }
        (EditorTab::Warehouse, Some(d)) => {
            format!("Loaded save has {} occupied slots in game_data.base_item.", d.warehouse_item_count())
        }
        (_, Some(_)) => "Save file is loaded in memory — ready to wire this editor tab next.".to_string(),
        (_, None) => "Open a Suikoden II JSON save file (or press Ctrl+D to load debug/save.json) to inspect live data.".to_string(),
    };

    let card = container(
        column![
            row![
                container(text("SCAFFOLDED").size(11).color(theme::ACCENT_CYAN))
                    .padding([4, 8])
                    .style(theme::badge_style(theme::ACCENT_CYAN)),
                text(tab.label()).size(20).color(theme::TEXT_PRIMARY),
            ]
            .spacing(10),
            text(tab.description()).size(14).color(theme::TEXT_MUTED),
            container(text(live_metric).size(13).color(theme::ACCENT_GOLD))
                .padding(12)
                .width(Length::Fill)
                .style(theme::badge_style(theme::ACCENT_GOLD)),
        ]
        .spacing(14),
    )
    .padding(24)
    .width(Length::Fill)
    .style(theme::card_style);

    container(card).padding(24).into()
}

fn view_about<'a>() -> Element<'a, Message> {
    let card = container(
        column![
            text(format!("SuiSaveEditor v{} — Native Desktop Edition", env!("CARGO_PKG_VERSION")))
                .size(22)
                .color(theme::ACCENT_GOLD),
            text("Native Rust desktop save editor for Suikoden II HD Remaster.")
                .size(14)
                .color(theme::TEXT_PRIMARY),
            text("• Lossless JSON round-trip using serde_json (preserve_order, UTF-8 BOM, \\uXXXX, CRLF)\n• Silent .bak backup creation in the exact source directory on open\n• Save As opens directly in the loaded save's folder\n• Shortcuts: Ctrl+O (Open), Ctrl+S (Save), Esc (Close Modal), Ctrl+D (Load debug/save.json)\n• Drag and drop any .json save file onto the window to open it\n• Open-source GUI framework: iced (MIT License) — https://github.com/iced-rs/iced")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(12),
    )
    .padding(24)
    .width(Length::Fill)
    .style(theme::card_style);

    container(card).padding(24).into()
}
