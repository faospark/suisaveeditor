use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::data::{find_option, NamedOption};
use crate::gamedata::{character_name, PortraitCache};
use crate::save_file::SaveDocument;
use crate::theme;
use crate::Message;

const EXCLUDED_INVESTIGATION_IDS: &[i64] = &[84, 123, 124, 125];

pub fn is_investigable(char_id: i64) -> bool {
    (1..=122).contains(&char_id) && !EXCLUDED_INVESTIGATION_IDS.contains(&char_id)
}

/// Exact per-character secret count from `t_phase.CheckSecretOpenLv3` / `CheckSecretOpenLv4`.
pub fn max_secrets(char_id: i64) -> usize {
    match char_id {
        75..=79 | 99 => 2,
        15 | 17 | 22 | 25 | 27 | 30 | 44 | 50 | 51 | 58 | 62 | 65 | 70 | 74 | 91 | 92 | 97 | 98
        | 100 | 103 | 104 | 105 | 107 | 111 | 113 | 114 | 117 | 119 | 120 | 121 => 3,
        _ => 4,
    }
}

/// Reads the 4-bit investigation level (`0..=4`) from `tantei_lv[char_id / 2]`.
/// Odd IDs use the low nibble (`& 0x0F`); even IDs use the high nibble (`>> 4`).
pub fn get_character_level(doc: &SaveDocument, char_id: usize) -> u8 {
    let byte_idx = char_id / 2;
    let byte_val = doc.get_array_i64(Some("game_data"), "tantei_lv", byte_idx) as u8;
    if char_id % 2 == 1 {
        byte_val & 0x0F
    } else {
        byte_val >> 4
    }
}

/// Writes a character's 4-bit investigation level (`0..=4`) into `tantei_lv[char_id / 2]`.
pub fn set_character_level(doc: &mut SaveDocument, char_id: usize, level: u8) {
    let byte_idx = char_id / 2;
    let cur = doc.get_array_i64(Some("game_data"), "tantei_lv", byte_idx) as u8;
    let lv = level.min(4);
    let next = if char_id % 2 == 1 {
        (cur & 0xF0) | lv
    } else {
        (cur & 0x0F) | (lv << 4)
    };
    doc.set_array_i64(Some("game_data"), "tantei_lv", byte_idx, next as i64);
}

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    party_options: &'a [NamedOption],
    search: &'a str,
) -> Element<'a, Message> {
    let q = search.trim().to_lowercase();

    // Active Richmond Investigation Card (tantei_cano & tantei_ca_lv)
    let active_char_id = doc.get_i64(Some("game_data"), "tantei_cano");
    let active_stage = doc.get_i64(Some("game_data"), "tantei_ca_lv");
    let investigation_options: Vec<NamedOption> = party_options
        .iter()
        .filter(|opt| opt.id == 0 || is_investigable(opt.id))
        .cloned()
        .collect();
    let selected_target = find_option(&investigation_options, active_char_id);

    let mut active_header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(handle) = portraits.get(99) {
        active_header = active_header.push(image(handle).width(44).height(44));
    }
    active_header = active_header.push(
        text("Active Richmond Investigation (tantei_cano & tantei_ca_lv)")
            .size(15)
            .color(theme::ACCENT_GOLD),
    );

    let tantei_h = doc.get_array_i64(Some("game_data"), "tantei_time", 0);
    let tantei_m = doc.get_array_i64(Some("game_data"), "tantei_time", 1);

    let active_card = container(
        column![
            active_header,
            row![
                text("Target Character:")
                    .size(13)
                    .color(theme::TEXT_MUTED),
                pick_list(investigation_options, Some(selected_target), |opt| {
                    Message::SetIntField(Some("game_data"), "tantei_cano", opt.id.to_string())
                })
                .text_size(12)
                .padding([6, 10])
                .width(Length::Fixed(220.0))
                .style(theme::pick_list_style)
                .menu_style(theme::pick_list_menu_style),
                Space::with_width(Length::Fixed(16.0)),
                text("Current Stage (0–10):")
                    .size(13)
                    .color(theme::TEXT_MUTED),
                text_input("0", &active_stage.to_string())
                    .on_input(|v| Message::SetIntField(Some("game_data"), "tantei_ca_lv", v))
                    .padding(6)
                    .size(13)
                    .width(Length::Fixed(72.0))
                    .style(theme::input_style),
                Space::with_width(Length::Fill),
                text(format!("Timer (tantei_time): {:02}:{:02}", tantei_h, tantei_m))
                    .size(11)
                    .color(theme::TEXT_MUTED),
                button(text("Reset Timer (00:00)").size(11))
                    .padding([5, 10])
                    .style(theme::secondary_button_style)
                    .on_press(Message::ResetGameTimer("tantei_time")),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style);

    // Count total unlocked clues across investigable characters (1..=122, excluding 84)
    let mut unlocked_clues = 0usize;
    let mut total_clues = 0usize;
    for char_id in 1..=125usize {
        if !is_investigable(char_id as i64) {
            continue;
        }
        let max = max_secrets(char_id as i64);
        total_clues += max;
        unlocked_clues += (get_character_level(doc, char_id) as usize).min(max);
    }

    let toolbar = container(
        row![
            text_input("Filter character by name or ID...", search)
                .on_input(Message::SetInvestigationSearch)
                .padding(7)
                .size(12)
                .width(Length::Fixed(260.0))
                .style(theme::input_style),
            container(
                text(format!("Clues Unlocked: {} / {}", unlocked_clues, total_clues))
                    .size(12)
                    .color(theme::ACCENT_GOLD),
            )
            .padding([6, 12])
            .style(theme::badge_style(theme::ACCENT_GOLD)),
            Space::with_width(Length::Fill),
            button(text("Unlock All Clues").size(12))
                .padding([6, 12])
                .style(theme::primary_button_style)
                .on_press(Message::SetAllInvestigations(true)),
            button(text("Reset All (0)").size(12))
                .padding([6, 12])
                .style(theme::secondary_button_style)
                .on_press(Message::SetAllInvestigations(false)),
        ]
        .spacing(10)
        .align_y(Alignment::Center),
    )
    .padding(14)
    .width(Length::Fill)
    .style(theme::card_style);

    // Character cards (each character has 2-4 clues stored as a 4-bit level in tantei_lv[char_id / 2])
    let matching: Vec<usize> = (1..=125)
        .filter(|&id| {
            if !is_investigable(id as i64) {
                return false;
            }
            let name = character_name(id as i64);
            q.is_empty() || name.to_lowercase().contains(&q) || id.to_string().contains(&q)
        })
        .collect();

    let mut grid = column![].spacing(10);
    for chunk in matching.chunks(3) {
        let mut r = row![].spacing(10);
        for &char_id in chunk {
            let max = max_secrets(char_id as i64);
            let current_level = get_character_level(doc, char_id);
            let name = character_name(char_id as i64);

            let thumb: Element<'a, Message> = if let Some(handle) = portraits.get(char_id as i64) {
                image(handle).width(44).height(44).into()
            } else {
                container(text("?").size(14).color(theme::TEXT_MUTED))
                    .width(44)
                    .height(44)
                    .center_x(Length::Fixed(44.0))
                    .center_y(Length::Fixed(44.0))
                    .into()
            };

            let mut clue_row = row![].spacing(8);
            for clue in 0..max {
                let level = (clue + 1) as u8;
                let checked = current_level >= level;
                clue_row = clue_row.push(
                    checkbox(format!("C{}", clue + 1), checked)
                        .on_toggle(move |on| {
                            Message::SetInvestigationLevel(char_id, if on { level } else { level - 1 })
                        })
                        .text_size(11),
                );
            }

            r = r.push(
                container(
                    row![
                        thumb,
                        column![
                            text(format!("{} (#{})", name, char_id))
                                .size(13)
                                .color(theme::TEXT_PRIMARY),
                            clue_row,
                        ]
                        .spacing(6),
                    ]
                    .spacing(10)
                    .align_y(Alignment::Center),
                )
                .padding(10)
                .width(Length::FillPortion(1))
                .style(theme::card_style),
            );
        }
        for _ in chunk.len()..3 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        grid = grid.push(r);
    }

    let content = column![
        column![
            text("Richmond's Detective Investigations")
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text("Each character has 2–4 secret clues stored as 4-bit levels in game_data.tantei_lv[0..64].")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        active_card,
        toolbar,
        grid,
    ]
    .spacing(16)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}
