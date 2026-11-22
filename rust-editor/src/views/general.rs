use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::data::{find_option, opt, NamedOption, CLIVE_MILESTONES};
use crate::gamedata::{character_name, PortraitCache};
use crate::i18n;
use crate::save_file::SaveDocument;
use crate::theme;
use crate::Message;

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    party_options: &'a [NamedOption],
) -> Element<'a, Message> {
    let party_section = view_active_party(doc, portraits, party_options);
    let identity_card = view_identity_card(doc);
    let resources_card = view_resources_card(doc);
    let s1_import_card = view_suikoden1_import_card(doc, portraits);
    let time_location_card = view_time_and_location_card(doc);
    let clive_card = view_clive_quest_card(doc, portraits);
    let aliases_card = view_greenhill_aliases_card(doc);
    let side_quests_card = view_side_quests_card(doc, portraits);

    let two_col = row![
        container(identity_card).width(Length::FillPortion(1)),
        container(resources_card).width(Length::FillPortion(1)),
    ]
    .spacing(16);

    let bottom_col = row![
        container(clive_card).width(Length::FillPortion(1)),
        container(aliases_card).width(Length::FillPortion(1)),
    ]
    .spacing(16);

    let content = column![
        section_header(
            i18n::tr("general_title"),
            "Live-bound to game_data, party_data, event_flag[94], and root save fields."
        ),
        party_section,
        two_col,
        s1_import_card,
        time_location_card,
        side_quests_card,
        bottom_col,
    ]
    .spacing(16)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn section_header<'a>(title: &'a str, subtitle: &'a str) -> Element<'a, Message> {
    column![
        text(title).size(22).color(theme::TEXT_PRIMARY),
        text(subtitle).size(13).color(theme::TEXT_MUTED),
    ]
    .spacing(4)
    .into()
}

fn view_active_party<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    party_options: &'a [NamedOption],
) -> Element<'a, Message> {
    let party = doc.active_party();
    let mut row1 = row![].spacing(10);
    let mut row2 = row![].spacing(10);

    for slot_idx in 0..8 {
        let char_id = *party.get(slot_idx).unwrap_or(&0);
        let is_convoy = slot_idx >= 6;
        let slot_label = if is_convoy {
            format!("Convoy {}", slot_idx - 5)
        } else {
            format!("Battle Slot {}", slot_idx + 1)
        };
        let name = character_name(char_id);
        let selected = find_option(party_options, char_id);

        let portrait: Element<'a, Message> = if let Some(handle) = portraits.get(char_id) {
            image(handle).width(56).height(56).into()
        } else {
            container(
                text(if char_id == 0 { "—" } else { "?" })
                    .size(18)
                    .color(theme::TEXT_MUTED),
            )
            .width(56)
            .height(56)
            .center_x(Length::Fixed(56.0))
            .center_y(Length::Fixed(56.0))
            .into()
        };

        let picker = pick_list(party_options, Some(selected), move |opt| {
            Message::SetArrayIntField(Some("party_data"), "party_cha_no", slot_idx, opt.id.to_string())
        })
        .text_size(11)
        .padding([4, 6])
        .width(Length::Fill)
        .style(theme::pick_list_style)
        .menu_style(theme::pick_list_menu_style);

        let card = container(
            column![
                row![
                    portrait,
                    column![
                        text(slot_label).size(10).color(if is_convoy {
                            theme::ACCENT_CYAN
                        } else {
                            theme::ACCENT_GOLD
                        }),
                        text(name).size(13).color(theme::TEXT_PRIMARY),
                        text(format!("ID #{}", char_id))
                            .size(10)
                            .color(theme::TEXT_MUTED),
                    ]
                    .spacing(2),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
                picker,
            ]
            .spacing(8),
        )
        .padding(10)
        .width(Length::FillPortion(1))
        .style(theme::portrait_card_style(is_convoy));

        if slot_idx < 4 {
            row1 = row1.push(card);
        } else {
            row2 = row2.push(card);
        }
    }

    container(
        column![
            row![
                text(i18n::tr("active_party")).size(15).color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                text("party_data.party_cha_no[0..7]").size(11).color(theme::TEXT_MUTED),
            ]
            .align_y(Alignment::Center),
            row1,
            row2,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_identity_card<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let fields = column![
        text(i18n::tr("identity_names")).size(15).color(theme::ACCENT_GOLD),
        text_field_row(
            i18n::tr("hero_name_s2"),
            doc.get_str(Some("game_data"), "bozu_name"),
            |v| Message::SetStringField(Some("game_data"), "bozu_name", v),
        ),
        text_field_row(
            i18n::tr("hero_name_real"),
            doc.get_str(Some("game_data"), "bozu_name2"),
            |v| Message::SetStringField(Some("game_data"), "bozu_name2", v),
        ),
        text_field_row(
            i18n::tr("castle_name"),
            doc.get_str(Some("game_data"), "base_name"),
            |v| Message::SetStringField(Some("game_data"), "base_name", v),
        ),
        text_field_row(
            i18n::tr("army_name"),
            doc.get_str(Some("game_data"), "team_name"),
            |v| Message::SetStringField(Some("game_data"), "team_name", v),
        ),
    ]
    .spacing(10);

    container(fields)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn readonly_stat_row<'a>(label: &'a str, value: String) -> Element<'a, Message> {
    row![
        text(label)
            .size(13)
            .color(theme::TEXT_MUTED)
            .width(Length::Fixed(145.0)),
        container(text(value).size(12).color(theme::ACCENT_CYAN))
            .padding([5, 10])
            .style(theme::badge_style(theme::ACCENT_CYAN)),
    ]
    .spacing(10)
    .align_y(Alignment::Center)
    .into()
}

fn view_resources_card<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let popularity = doc.get_i64(Some("party_data"), "ninki");
    let castle_lv = doc.get_i64(Some("game_data"), "base_lv");
    let kaji_lv = doc.get_i64(Some("game_data"), "kaji_lv");
    let bath_lv = doc.get_array_i64(Some("game_data"), "furo_info", 0);

    let fields = column![
        text(i18n::tr("resources_castle")).size(15).color(theme::ACCENT_GOLD),
        int_field_row(
            i18n::tr("potch_gold"),
            doc.get_i64(Some("party_data"), "gold"),
            |v| Message::SetIntField(Some("party_data"), "gold", v),
        ),
        int_field_row(
            i18n::tr("escaped_battles"),
            doc.get_i64(Some("game_data"), "nige_cnt"),
            |v| Message::SetIntField(Some("game_data"), "nige_cnt", v),
        ),
        readonly_stat_row(i18n::tr("castle_level"), format!("Lv {} (read-only)", castle_lv)),
        readonly_stat_row(i18n::tr("blacksmith_level"), format!("Lv {} (read-only)", kaji_lv)),
        readonly_stat_row(i18n::tr("popularity"), format!("{} (read-only)", popularity)),
        readonly_stat_row(i18n::tr("bath_house_level"), format!("Lv {} (read-only)", bath_lv)),
    ]
    .spacing(10);

    container(fields)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_suikoden1_import_card<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let s1_hero = doc.get_str(Some("game_data"), "macd_name");
    let s1_hq = doc.get_str(Some("game_data"), "m_base_name");
    let s1_stars = doc.get_i64(Some("game_data"), "nakam_1_num");
    let has_s1_data = !s1_hero.trim().is_empty() || s1_stars > 0;
    let gremio_saved = s1_stars >= 108;

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(handle) = portraits.get(82) {
        header = header.push(image(handle).width(40).height(40));
    }
    header = header.push(
        column![
            text("Suikoden I Save Transfer Data")
                .size(15)
                .color(theme::ACCENT_GOLD),
            text("Imported Suikoden I clear-save fields (macd_name, m_base_name, nakam_1_num).")
                .size(11)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(1),
    );
    header = header.push(Space::with_width(Length::Fill));

    let import_badge_color = if has_s1_data {
        theme::ACCENT_GREEN
    } else {
        theme::TEXT_MUTED
    };
    header = header.push(
        container(
            text(if has_s1_data {
                "S1 Clear Data Loaded"
            } else {
                "No S1 Data Loaded"
            })
            .size(11)
            .color(import_badge_color),
        )
        .padding([4, 9])
        .style(theme::badge_style(import_badge_color)),
    );

    let gremio_color = if !has_s1_data {
        theme::TEXT_MUTED
    } else if gremio_saved {
        theme::ACCENT_GREEN
    } else {
        theme::ACCENT_GOLD
    };
    let gremio_text = if !has_s1_data {
        "N/A (No S1 import)"
    } else if gremio_saved {
        "Gremio Saved (108 Stars)"
    } else {
        "Gremio Not Revived (< 108 Stars)"
    };

    let body_row = row![
        column![
            text_field_row("Hero Name (S1)", s1_hero, |v| {
                Message::SetStringField(Some("game_data"), "macd_name", v)
            }),
            text_field_row("S1 HQ Name", s1_hq, |v| {
                Message::SetStringField(Some("game_data"), "m_base_name", v)
            }),
        ]
        .spacing(10)
        .width(Length::FillPortion(1)),
        column![
            row![
                text("S1 Recruited Stars")
                    .size(13)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(145.0)),
                container(
                    text(format!("{} / 108 (read-only)", s1_stars))
                        .size(12)
                        .color(theme::ACCENT_CYAN)
                )
                .padding([5, 10])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            row![
                text("Gremio Status")
                    .size(13)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(145.0)),
                container(text(gremio_text).size(12).color(gremio_color))
                    .padding([5, 10])
                    .style(theme::badge_style(gremio_color)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        ]
        .spacing(10)
        .width(Length::FillPortion(1)),
    ]
    .spacing(16);

    container(column![header, body_row].spacing(12))
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_time_and_location_card<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let hours = doc.get_array_i64(Some("game_data"), "play_time", 0);
    let mins = doc.get_array_i64(Some("game_data"), "play_time", 1);
    let secs = doc.get_array_i64(Some("game_data"), "play_time", 2);
    let last_mod = doc.get_str(None, "date_time_now");

    let play_time_row = row![
        text("Play Time (H : M : S)")
            .size(13)
            .color(theme::TEXT_MUTED)
            .width(Length::Fixed(145.0)),
        compact_int_input("H", hours, |v| Message::SetArrayIntField(
            Some("game_data"),
            "play_time",
            0,
            v
        )),
        text(":").size(14).color(theme::TEXT_MUTED),
        compact_int_input("M", mins, |v| Message::SetArrayIntField(
            Some("game_data"),
            "play_time",
            1,
            v
        )),
        text(":").size(14).color(theme::TEXT_MUTED),
        compact_int_input("S", secs, |v| Message::SetArrayIntField(
            Some("game_data"),
            "play_time",
            2,
            v
        )),
        Space::with_width(Length::Fixed(20.0)),
        text("Last Saved:").size(13).color(theme::TEXT_MUTED),
        text(if last_mod.is_empty() {
            "—".to_string()
        } else {
            last_mod
        })
        .size(13)
        .color(theme::TEXT_PRIMARY),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    let location_row = row![
        text("Location & Coords")
            .size(13)
            .color(theme::TEXT_MUTED)
            .width(Length::Fixed(145.0)),
        text("Area").size(12).color(theme::TEXT_MUTED),
        compact_int_input("Area", doc.get_i64(Some("game_data"), "area_no"), |v| {
            Message::SetIntField(Some("game_data"), "area_no", v)
        }),
        text("Town").size(12).color(theme::TEXT_MUTED),
        compact_int_input("Town", doc.get_i64(Some("game_data"), "town_no"), |v| {
            Message::SetIntField(Some("game_data"), "town_no", v)
        }),
        text("Map").size(12).color(theme::TEXT_MUTED),
        compact_int_input("Map", doc.get_i64(Some("game_data"), "map_no"), |v| {
            Message::SetIntField(Some("game_data"), "map_no", v)
        }),
        text("X").size(12).color(theme::TEXT_MUTED),
        compact_int_input("X", doc.get_i64(None, "px"), |v| {
            Message::SetIntField(None, "px", v)
        }),
        text("Y").size(12).color(theme::TEXT_MUTED),
        compact_int_input("Y", doc.get_i64(None, "py"), |v| {
            Message::SetIntField(None, "py", v)
        }),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    container(
        column![
            text("Play Time & Map Location")
                .size(15)
                .color(theme::ACCENT_GOLD),
            play_time_row,
            location_row,
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

const LISTENING_CRYSTAL_BEASTS: &[NamedOption] = &[
    opt(0, "None"),
    opt(49, "Abizboah"),
    opt(50, "Feather"),
    opt(72, "Siegfried"),
    opt(74, "Rulodia"),
    opt(79, "Chuchara"),
];

fn view_side_quests_card<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let trade_vol = doc.get_i64(Some("game_data"), "trade_transaction_total");
    let suri_potch = doc.get_i64(Some("game_data"), "suri_potch");
    let luka_hp = doc.get_i64(Some("game_data"), "luka_hp");
    let eligible = trade_vol >= 50_000;

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(handle) = portraits.get(106) {
        header = header.push(image(handle).width(40).height(40));
    }
    if let Some(handle) = portraits.get(54) {
        header = header.push(image(handle).width(40).height(40));
    }
    header = header.push(
        text("Side-Quests, Beasts & Trade Counters (Gordon / Chaco)")
            .size(15)
            .color(theme::ACCENT_GOLD),
    );

    let mut beast_rows = column![].spacing(8);
    for slot in 0..2 {
        let cur_id = doc.get_array_i64(Some("game_data"), "l_mon_no", slot);
        let selected = find_option(LISTENING_CRYSTAL_BEASTS, cur_id);
        beast_rows = beast_rows.push(
            row![
                text(format!("Listening Crystal #{}", slot + 1))
                    .size(13)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(165.0)),
                pick_list(LISTENING_CRYSTAL_BEASTS, Some(selected), move |opt| {
                    Message::SetArrayIntField(
                        Some("game_data"),
                        "l_mon_no",
                        slot,
                        opt.id.to_string(),
                    )
                })
                .text_size(12)
                .padding([5, 8])
                .width(Length::Fixed(220.0))
                .style(theme::pick_list_style)
                .menu_style(theme::pick_list_menu_style),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        );
    }

    container(
        column![
            header,
            row![
                text("Gordon's Trade Volume")
                    .size(13)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(165.0)),
                text_input("0", &trade_vol.to_string())
                    .on_input(|v| {
                        Message::SetIntField(Some("game_data"), "trade_transaction_total", v)
                    })
                    .padding(6)
                    .size(13)
                    .width(Length::Fixed(140.0))
                    .style(theme::input_style),
                button(text("Set 50,000").size(11))
                    .padding([6, 10])
                    .style(theme::primary_button_style)
                    .on_press(Message::SetIntField(
                        Some("game_data"),
                        "trade_transaction_total",
                        "50000".to_string(),
                    )),
                container(
                    text(if eligible {
                        "Eligible (>= 50k)"
                    } else {
                        "Below 50k"
                    })
                    .size(11)
                    .color(if eligible {
                        theme::ACCENT_GREEN
                    } else {
                        theme::ACCENT_GOLD
                    }),
                )
                .padding([4, 8])
                .style(theme::badge_style(if eligible {
                    theme::ACCENT_GREEN
                } else {
                    theme::ACCENT_GOLD
                })),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            int_field_row("Chaco's Pickpocketed Potch", suri_potch, |v| {
                Message::SetIntField(Some("game_data"), "suri_potch", v)
            }),
            int_field_row("Luca Ambush HP (luka_hp)", luka_hp, |v| {
                Message::SetIntField(Some("game_data"), "luka_hp", v)
            }),
            beast_rows,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_clive_quest_card<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let flag_byte = doc.get_event_flag(94);
    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(handle) = portraits.get(6) {
        header = header.push(image(handle).width(40).height(40));
    }
    header = header
        .push(text("Clive Quest Milestones").size(15).color(theme::ACCENT_GOLD))
        .push(Space::with_width(Length::Fill))
        .push(
            text(format!("event_flag[94] = 0x{:02X}", flag_byte))
                .size(11)
                .color(theme::TEXT_MUTED),
        );

    let mut col = column![header].spacing(8);

    for m in CLIVE_MILESTONES {
        let checked = (flag_byte & m.bit) != 0;
        let mask = m.bit;
        col = col.push(
            column![
                checkbox(m.label, checked)
                    .on_toggle(move |val| Message::ToggleEventFlagBit(94, mask, val))
                    .text_size(13),
                text(m.desc).size(11).color(theme::TEXT_MUTED),
            ]
            .spacing(2),
        );
    }

    container(col)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_greenhill_aliases_card<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let labels = [
        "Hero Alias (kari_name[0])",
        "Nanami Alias (kari_name[1])",
        "Flik Alias (kari_name[2])",
        "Alias Slot 4 (kari_name[3])",
        "Alias Slot 5 (kari_name[4])",
        "Alias Slot 6 (kari_name[5])",
    ];

    let mut col = column![
        text("Greenhill Mission Aliases")
            .size(15)
            .color(theme::ACCENT_GOLD),
    ]
    .spacing(10);

    for (idx, lbl) in labels.iter().enumerate() {
        let val = doc.get_array_str(Some("game_data"), "kari_name", idx);
        col = col.push(text_field_row(lbl, val, move |v| {
            Message::SetArrayStringField(Some("game_data"), "kari_name", idx, v)
        }));
    }

    container(col)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn text_field_row<'a>(
    label: &'a str,
    value: String,
    on_change: impl Fn(String) -> Message + 'a,
) -> Element<'a, Message> {
    row![
        text(label)
            .size(13)
            .color(theme::TEXT_MUTED)
            .width(Length::Fixed(165.0)),
        text_input("", &value)
            .on_input(on_change)
            .padding(7)
            .size(13)
            .style(theme::input_style),
    ]
    .spacing(10)
    .align_y(Alignment::Center)
    .into()
}

fn int_field_row<'a>(
    label: &'a str,
    value: i64,
    on_change: impl Fn(String) -> Message + 'a,
) -> Element<'a, Message> {
    row![
        text(label)
            .size(13)
            .color(theme::TEXT_MUTED)
            .width(Length::Fixed(145.0)),
        text_input("0", &value.to_string())
            .on_input(on_change)
            .padding(7)
            .size(13)
            .style(theme::input_style),
    ]
    .spacing(10)
    .align_y(Alignment::Center)
    .into()
}

fn compact_int_input<'a>(
    placeholder: &'a str,
    value: i64,
    on_change: impl Fn(String) -> Message + 'a,
) -> Element<'a, Message> {
    text_input(placeholder, &value.to_string())
        .on_input(on_change)
        .padding(6)
        .size(13)
        .width(Length::Fixed(64.0))
        .style(theme::input_style)
        .into()
}
