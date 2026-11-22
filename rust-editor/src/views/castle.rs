use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::data::catalog::{
    FISH_BOARD, GUARDIAN_BEASTS, GUARDIAN_BLUEPRINTS, SOUND_SET_DEFS, WINDOW_SET_DEFS,
};
use crate::data::{find_option, resolve_inventory_item};
use crate::gamedata::{character_name, PortraitCache};
use crate::save_file::SaveDocument;
use crate::theme;
use crate::views::item_modal::ModalTarget;
use crate::Message;

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    suggestion_search: &'a str,
) -> Element<'a, Message> {
    let guardian_card = view_guardian_deity(doc, portraits);
    let farm_card = view_farm_ranch(doc, portraits);
    let yuzu_card = view_yuzu_pasture(doc, portraits);
    let window_sound_row = row![
        container(view_window_sets(doc, portraits)).width(Length::FillPortion(1)),
        container(view_sound_sets(doc, portraits)).width(Length::FillPortion(1)),
    ]
    .spacing(16);
    let library_card = view_library_books(doc, portraits);
    let bath_card = view_bath_items(doc, portraits);
    let fishing_card = view_fishing_records(doc, portraits);
    let suggestion_card = view_suggestion_box(doc, portraits, suggestion_search);

    let content = column![
        column![
            text("Castle Facilities & Upgrades")
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text("Guardian Deity, Tony's Farm, Yuzu's Pasture, Tenkou's Window Sets, Connell's Sound Sets, Library Books, Bath Items, Fishing Board, and Suggestion Box.")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        guardian_card,
        farm_card,
        yuzu_card,
        window_sound_row,
        library_card,
        bath_card,
        fishing_card,
        suggestion_card,
    ]
    .spacing(16)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn portrait_thumb<'a>(portraits: &'a PortraitCache, char_id: i64) -> Option<Element<'a, Message>> {
    portraits
        .get(char_id)
        .map(|h| image(h).width(40).height(40).into())
}

fn view_yuzu_pasture<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let species = [
        (
            4usize,
            "Chickens",
            "Chick (Item #5)",
            "Starts with 1 upon recruitment",
            "hon_flag[31] Bits 4, 5, 6",
            3i64,
        ),
        (
            5usize,
            "Pigs",
            "Piglet (Item #6)",
            "0 by default (bring Piglets)",
            "hon_flag[31] Bit 7, [32] Bits 0, 1",
            3i64,
        ),
        (
            6usize,
            "Sheep",
            "Lamb (Item #7)",
            "Starts with 1 (Taro) — 4 max in Remaster",
            "hon_flag[32] Bits 2, 3, 4, 5",
            4i64,
        ),
        (
            7usize,
            "Cattle / Calves",
            "Calf (Item #8)",
            "0 by default (bring Calves)",
            "hon_flag[32] Bits 6, 7, [33] Bit 0",
            3i64,
        ),
    ];

    let mut cards = row![].spacing(10);
    for (food_idx, name, item_lbl, default_note, flag_note, max_val) in species {
        let count = doc
            .get_array_i64(Some("game_data"), "food_num", food_idx)
            .clamp(0, max_val);
        let badge_color = if count == max_val {
            theme::ACCENT_GREEN
        } else if count > 0 {
            theme::ACCENT_CYAN
        } else {
            theme::TEXT_MUTED
        };

        cards = cards.push(
            container(
                column![
                    row![
                        text(name).size(13).color(theme::TEXT_PRIMARY),
                        Space::with_width(Length::Fill),
                        container(text(format!("{}/{}", count, max_val)).size(11).color(badge_color))
                            .padding([2, 7])
                            .style(theme::badge_style(badge_color)),
                    ]
                    .align_y(Alignment::Center),
                    text(item_lbl).size(10).color(theme::TEXT_MUTED),
                    row![
                        button(text("-").size(12))
                            .padding([4, 12])
                            .style(theme::secondary_button_style)
                            .on_press(Message::SetYuzuLivestock(food_idx, (count - 1).max(0))),
                        Space::with_width(Length::Fill),
                        text(count.to_string()).size(14).color(theme::ACCENT_GOLD),
                        Space::with_width(Length::Fill),
                        button(text("+").size(12))
                            .padding([4, 12])
                            .style(theme::secondary_button_style)
                            .on_press(Message::SetYuzuLivestock(food_idx, (count + 1).min(max_val))),
                    ]
                    .align_y(Alignment::Center),
                    text(default_note).size(10).color(theme::TEXT_MUTED),
                    text(flag_note).size(10).color(theme::ACCENT_CYAN),
                ]
                .spacing(5),
            )
            .padding(10)
            .width(Length::FillPortion(1))
            .style(theme::empty_slot_card_style),
        );
    }

    let mut header = row![].spacing(8).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 102) {
        header = header.push(p);
    }
    header = header
        .push(
            column![
                text("Livestock Delivered to Castle Pasture (Yuzu)")
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                text("Controls delivered animals (food_num[4..7]) and auto-syncs pasture spawn flags across hon_flag[31..33].")
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ]
            .spacing(1),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Max All (13)").size(11))
                .padding([5, 10])
                .style(theme::primary_button_style)
                .on_press(Message::MaxYuzuPasture),
        )
        .push(
            button(text("Default Recruited (2)").size(11))
                .padding([5, 10])
                .style(theme::secondary_button_style)
                .on_press(Message::DefaultYuzuPasture),
        )
        .push(
            button(text("Clear All (0)").size(11))
                .padding([5, 10])
                .style(theme::secondary_button_style)
                .on_press(Message::ClearYuzuPasture),
        );

    container(column![header, cards].spacing(12))
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_guardian_deity<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let bp0 = doc.get_array_i64(Some("game_data"), "parts_no", 0) as u8;
    let bp1 = doc.get_array_i64(Some("game_data"), "parts_no", 1) as u8;
    let statue_byte = doc.get_array_i64(Some("game_data"), "parts_no", 2) as u8;
    let delivered = bp0.count_ones() + bp1.count_ones();

    // 4-column Blueprint grid (Dragon, Unicorn, Rabbit, Turtle)
    let mut bp_cols = row![].spacing(10);
    for deity_idx in 0..4 {
        let mut col = column![].spacing(6).width(Length::FillPortion(1));
        for bp in &GUARDIAN_BLUEPRINTS[deity_idx * 4..deity_idx * 4 + 4] {
            let cur_byte = if bp.byte_idx == 0 { bp0 } else { bp1 };
            let mask = 1u8 << bp.bit_idx;
            let checked = (cur_byte & mask) != 0;
            let byte_idx = bp.byte_idx;

            col = col.push(
                container(
                    column![
                        checkbox(format!("{} ({})", bp.name, bp.segment), checked)
                            .on_toggle(move |on| {
                                Message::ToggleArrayFlagBit(
                                    Some("game_data"),
                                    "parts_no",
                                    byte_idx,
                                    mask,
                                    on,
                                )
                            })
                            .text_size(12),
                        text(bp.loc).size(10).color(theme::TEXT_MUTED),
                    ]
                    .spacing(2),
                )
                .padding(8)
                .width(Length::Fill)
                .style(theme::empty_slot_card_style),
            );
        }
        bp_cols = bp_cols.push(col);
    }

    // Assembled Statue Part Selectors (2 bits each inside parts_no[2])
    let head = (statue_byte & 0x03) as i64;
    let body = ((statue_byte >> 2) & 0x03) as i64;
    let legs = ((statue_byte >> 4) & 0x03) as i64;
    let tail = ((statue_byte >> 6) & 0x03) as i64;

    let parts = [
        ("Head", 0u8, head),
        ("Body", 2u8, body),
        ("Legs", 4u8, legs),
        ("Tail", 6u8, tail),
    ];

    let mut statue_row = row![].spacing(12);
    for (lbl, shift, val) in parts {
        let selected = find_option(GUARDIAN_BEASTS, val);
        statue_row = statue_row.push(
            column![
                text(lbl).size(12).color(theme::TEXT_MUTED),
                pick_list(GUARDIAN_BEASTS, Some(selected), move |opt| {
                    let cleared = statue_byte & !(0x03 << shift);
                    let next = cleared | (((opt.id as u8) & 0x03) << shift);
                    Message::SetArrayIntField(
                        Some("game_data"),
                        "parts_no",
                        2,
                        (next as i64).to_string(),
                    )
                })
                .text_size(12)
                .padding([6, 8])
                .width(Length::Fill)
                .style(theme::pick_list_style)
                .menu_style(theme::pick_list_menu_style),
            ]
            .spacing(4)
            .width(Length::FillPortion(1)),
        );
    }

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 115) {
        header = header.push(p);
    }
    header = header
        .push(
            text(format!(
                "Jude's Guardian Deity Blueprints ({} / 16) & Statue",
                delivered
            ))
            .size(15)
            .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Deliver All 16 Plans").size(11))
                .padding([5, 10])
                .style(theme::primary_button_style)
                .on_press(Message::DeliverAllGuardianPlans),
        );

    container(
        column![
            header,
            bp_cols,
            row![
                text("Assembled Statue Parts").size(13).color(theme::ACCENT_CYAN),
                Space::with_width(Length::Fill),
                text(format!("parts_no[2] = 0x{:02X}", statue_byte))
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ],
            statue_row,
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_farm_ranch<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let f30 = doc.get_array_i64(Some("game_data"), "hon_flag", 30) as u8;
    let f31 = doc.get_array_i64(Some("game_data"), "hon_flag", 31) as u8;

    // Each vegetable has 2 plots; giving Tony seedlings sets both the planted (high nibble)
    // and visible/grown (low nibble) bits together.
    let crops: [(&str, usize, u8, u8, u8); 4] = [
        ("Cabbage", 30, f30, (1 << 4) | (1 << 0), (1 << 5) | (1 << 1)),
        ("Potato", 30, f30, (1 << 6) | (1 << 2), (1 << 7) | (1 << 3)),
        ("Spinach", 31, f31, (1 << 4) | (1 << 0), (1 << 5) | (1 << 1)),
        ("Tomato", 31, f31, (1 << 6) | (1 << 2), (1 << 7) | (1 << 3)),
    ];

    let mut crop_row = row![].spacing(10);
    for (crop_name, byte_idx, cur, mask1, mask2) in crops {
        let p1 = (cur & mask1) == mask1;
        let p2 = (cur & mask2) == mask2;
        crop_row = crop_row.push(
            container(
                column![
                    text(crop_name).size(13).color(theme::ACCENT_CYAN),
                    checkbox("Plot 1 (Planted)", p1)
                        .on_toggle(move |on| {
                            Message::ToggleArrayFlagBit(
                                Some("game_data"),
                                "hon_flag",
                                byte_idx,
                                mask1,
                                on,
                            )
                        })
                        .text_size(12),
                    checkbox("Plot 2 (Planted)", p2)
                        .on_toggle(move |on| {
                            Message::ToggleArrayFlagBit(
                                Some("game_data"),
                                "hon_flag",
                                byte_idx,
                                mask2,
                                on,
                            )
                        })
                        .text_size(12),
                ]
                .spacing(8),
            )
            .padding(12)
            .width(Length::FillPortion(1))
            .style(theme::empty_slot_card_style),
        );
    }

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 104) {
        header = header.push(p);
    }
    header = header
        .push(
            text("Tony's Vegetable Farm (hon_flag[30–31])")
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(
            text(format!("0x{:02X} / 0x{:02X}", f30, f31))
                .size(11)
                .color(theme::TEXT_MUTED),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Plant All Plots").size(11))
                .padding([5, 10])
                .style(theme::primary_button_style)
                .on_press(Message::MaxVegetableFarm),
        );

    container(
        column![header, crop_row].spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_window_sets<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let flag = doc.get_event_flag(77);
    let unlocked = WINDOW_SET_DEFS
        .iter()
        .filter(|w| (flag & w.mask) != 0)
        .count();

    let win_typ = doc.get_array_i64(Some("game_data"), "win_typ", 0);
    let win_col = doc.get_i64(Some("game_data"), "win_col");
    let win_suke = doc.get_i64(Some("game_data"), "win_suke");

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 97) {
        header = header.push(p);
    }
    header = header
        .push(
            text(format!("Tenkou's Window Sets ({} / 7)", unlocked))
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Unlock All 7").size(11))
                .padding([4, 9])
                .style(theme::primary_button_style)
                .on_press(Message::SetArrayIntField(None, "event_flag", 77, "127".to_string())),
        );

    let mut col = column![
        header,
        row![
            text("Style (0–7):").size(11).color(theme::TEXT_MUTED),
            text_input("0", &win_typ.to_string())
                .on_input(|v| Message::SetArrayIntField(Some("game_data"), "win_typ", 0, v))
                .padding(4)
                .size(12)
                .width(Length::Fixed(46.0))
                .style(theme::input_style),
            text("Color (0–7):").size(11).color(theme::TEXT_MUTED),
            text_input("0", &win_col.to_string())
                .on_input(|v| Message::SetIntField(Some("game_data"), "win_col", v))
                .padding(4)
                .size(12)
                .width(Length::Fixed(46.0))
                .style(theme::input_style),
            text("Alpha (0–3):").size(11).color(theme::TEXT_MUTED),
            text_input("0", &win_suke.to_string())
                .on_input(|v| Message::SetIntField(Some("game_data"), "win_suke", v))
                .padding(4)
                .size(12)
                .width(Length::Fixed(46.0))
                .style(theme::input_style),
        ]
        .spacing(6)
        .align_y(Alignment::Center),
    ]
    .spacing(6);

    for w in WINDOW_SET_DEFS {
        let mask = w.mask;
        col = col.push(
            column![
                checkbox(w.name, (flag & mask) != 0)
                    .on_toggle(move |on| Message::ToggleEventFlagBit(77, mask, on))
                    .text_size(12),
                text(w.desc).size(10).color(theme::TEXT_MUTED),
            ]
            .spacing(1),
        );
    }

    container(col)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_sound_sets<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let flag = doc.get_event_flag(78);
    let unlocked = SOUND_SET_DEFS
        .iter()
        .filter(|s| (flag & s.mask) != 0)
        .count();
    let se_set = doc.get_i64(Some("game_data"), "se_set");

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 108) {
        header = header.push(p);
    }
    header = header
        .push(
            text(format!("Connell's Sound Sets ({} / 7)", unlocked))
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Unlock All 7").size(11))
                .padding([4, 9])
                .style(theme::primary_button_style)
                .on_press(Message::SetArrayIntField(None, "event_flag", 78, "127".to_string())),
        );

    let mut col = column![
        header,
        row![
            text("Active Sound Set (se_set 0–7):").size(11).color(theme::TEXT_MUTED),
            text_input("0", &se_set.to_string())
                .on_input(|v| Message::SetIntField(Some("game_data"), "se_set", v))
                .padding(4)
                .size(12)
                .width(Length::Fixed(52.0))
                .style(theme::input_style),
        ]
        .spacing(8)
        .align_y(Alignment::Center),
    ]
    .spacing(6);

    for s in SOUND_SET_DEFS {
        let mask = s.mask;
        col = col.push(
            column![
                checkbox(s.name, (flag & mask) != 0)
                    .on_toggle(move |on| Message::ToggleEventFlagBit(78, mask, on))
                    .text_size(12),
                text(s.desc).size(10).color(theme::TEXT_MUTED),
            ]
            .spacing(1),
        );
    }

    container(col)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_library_books<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let mask_val = doc.get_i64(Some("game_data"), "lib_flag") as u32;
    let count = (0..12).filter(|b| (mask_val & (1 << b)) != 0).count();

    let mut grid = column![].spacing(8);
    for row_idx in 0..2 {
        let mut r = row![].spacing(10);
        for col_idx in 0..6 {
            let bit = row_idx * 6 + col_idx;
            let checked = (mask_val & (1 << bit)) != 0;
            r = r.push(
                container(
                    checkbox(format!("Vol. {}", bit + 1), checked)
                        .on_toggle(move |val| Message::ToggleLibFlagBit(bit, val))
                        .text_size(12),
                )
                .padding([5, 8])
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
            );
        }
        grid = grid.push(r);
    }

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 96) {
        header = header.push(p);
    }
    header = header
        .push(
            text(format!("Emilia's Castle Library Old Books ({} / 12)", count))
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Unlock All 12").size(11))
                .padding([5, 10])
                .style(theme::primary_button_style)
                .on_press(Message::SetIntField(
                    Some("game_data"),
                    "lib_flag",
                    "4095".to_string(),
                )),
        );

    container(
        column![
            header,
            grid,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_bath_items<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let items = doc.get_inventory_items("game_data", "furo_item");
    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 90) {
        header = header.push(p);
    }
    header = header.push(
        text("Tetsu's Castle Bath House Items (game_data.furo_item)")
            .size(15)
            .color(theme::ACCENT_GOLD),
    );

    let mut rows = column![header].spacing(6);

    for (slot, item_no, use_cnt) in items {
        let (_, name) = resolve_inventory_item(item_no, use_cnt);
        rows = rows.push(
            row![
                text(format!("Slot {}", slot + 1))
                    .size(12)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(56.0)),
                text(if item_no == 0 {
                    "Empty Slot".to_string()
                } else {
                    name
                })
                .size(13)
                .color(if item_no == 0 {
                    theme::TEXT_MUTED
                } else {
                    theme::TEXT_PRIMARY
                })
                .width(Length::Fill),
                button(text(if item_no == 0 { "+ Add Item" } else { "Change..." }).size(11))
                    .padding([5, 10])
                    .style(if item_no == 0 {
                        theme::primary_button_style
                    } else {
                        theme::secondary_button_style
                    })
                    .on_press(Message::OpenItemModal(
                        ModalTarget::Inventory {
                            section: "game_data",
                            key: "furo_item",
                            slot,
                        },
                        format!("Bath House — Slot #{}", slot + 1),
                        None,
                    )),
                button(text("Clear").size(11))
                    .padding([5, 10])
                    .style(theme::secondary_button_style)
                    .on_press(Message::ClearInventorySlot("game_data", "furo_item", slot)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        );
    }

    container(rows)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_fishing_records<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 100) {
        header = header.push(p);
    }
    header = header
        .push(
            text("Yam Koo's Fishing Record Board (tsuri_data)")
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Set Trophy Records").size(11))
                .padding([5, 10])
                .style(theme::primary_button_style)
                .on_press(Message::SetTrophyFishingRecords),
        );

    let mut rows = column![header].spacing(8);

    for fish in FISH_BOARD {
        let caught = doc.get_array_i64(Some("game_data"), "tsuri_data", fish.caught_idx);
        let weight_raw = doc.get_array_i64(Some("game_data"), "tsuri_data", fish.weight_idx);
        let weight_lbs = (weight_raw as f64) * 0.05;
        let caught_idx = fish.caught_idx;
        let weight_idx = fish.weight_idx;

        rows = rows.push(
            row![
                text(fish.name)
                    .size(13)
                    .color(theme::TEXT_PRIMARY)
                    .width(Length::Fixed(105.0)),
                text("Caught:").size(12).color(theme::TEXT_MUTED),
                text_input("0", &caught.to_string())
                    .on_input(move |v| Message::SetArrayIntField(
                        Some("game_data"),
                        "tsuri_data",
                        caught_idx,
                        v
                    ))
                    .padding(5)
                    .size(12)
                    .width(Length::Fixed(70.0))
                    .style(theme::input_style),
                text("Raw Weight:").size(12).color(theme::TEXT_MUTED),
                text_input("0", &weight_raw.to_string())
                    .on_input(move |v| Message::SetArrayIntField(
                        Some("game_data"),
                        "tsuri_data",
                        weight_idx,
                        v
                    ))
                    .padding(5)
                    .size(12)
                    .width(Length::Fixed(70.0))
                    .style(theme::input_style),
                container(
                    text(format!("{:.2} lbs", weight_lbs))
                        .size(12)
                        .color(theme::ACCENT_CYAN),
                )
                .padding([4, 8])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        );
    }

    container(rows)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_suggestion_box<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    search: &'a str,
) -> Element<'a, Message> {
    let b_meyasu = doc.get_i64(Some("game_data"), "b_meyasu") > 0;
    let inbox_count = doc.count_unread_inbox();
    let read_total = doc.count_meyasu_read_letters();
    let q = search.trim().to_lowercase();

    // 4 Unread Inbox Slots
    let mut inbox_row = row![].spacing(8);
    for slot in 0..4 {
        let (cid, title_id, msg_id) = doc.get_unread_letter(slot);
        let active = cid > 0 || title_id > 0 || msg_id > 0;
        let sender = if cid > 0 {
            format!("{} (#{})", character_name(cid), cid)
        } else {
            "Empty Slot".to_string()
        };
        inbox_row = inbox_row.push(
            container(
                column![
                    text(format!("Inbox #{}", slot + 1))
                        .size(10)
                        .color(if active { theme::ACCENT_GOLD } else { theme::TEXT_MUTED }),
                    text(sender).size(12).color(if active {
                        theme::TEXT_PRIMARY
                    } else {
                        theme::TEXT_MUTED
                    }),
                    text(format!("Title: {} • Msg: {}", title_id, msg_id))
                        .size(10)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(2),
            )
            .padding(8)
            .width(Length::FillPortion(1))
            .style(theme::empty_slot_card_style),
        );
    }

    // Per-character letter read progress grid (1..=125)
    let matching: Vec<usize> = (1..=125)
        .filter(|&id| {
            if id == 84 {
                return false;
            }
            let name = character_name(id as i64);
            q.is_empty() || name.to_lowercase().contains(&q) || id.to_string().contains(&q)
        })
        .collect();

    let mut char_grid = column![].spacing(6);
    for chunk in matching.chunks(3) {
        let mut r = row![].spacing(8);
        for &cid in chunk {
            let lv = doc.get_meyasu_char_level(cid);
            let name = character_name(cid as i64);

            let mut lv_btns = row![].spacing(4);
            for target_lv in 0u8..=3 {
                let active = lv == target_lv;
                lv_btns = lv_btns.push(
                    button(text(target_lv.to_string()).size(11))
                        .padding([3, 8])
                        .style(theme::nav_button_style(active))
                        .on_press(Message::SetSuggestionCharLevel(cid, target_lv)),
                );
            }

            let mut card_row = row![].spacing(8).align_y(Alignment::Center);
            if let Some(handle) = portraits.get(cid as i64) {
                card_row = card_row.push(image(handle).width(34).height(34));
            }
            card_row = card_row
                .push(
                    column![
                        text(name).size(12).color(theme::TEXT_PRIMARY),
                        text(format!("#{} • Lv {}/3", cid, lv))
                            .size(10)
                            .color(if lv == 3 {
                                theme::ACCENT_GREEN
                            } else if lv > 0 {
                                theme::ACCENT_CYAN
                            } else {
                                theme::TEXT_MUTED
                            }),
                    ]
                    .width(Length::Fill),
                )
                .push(lv_btns);

            r = r.push(
                container(card_row)
                    .padding([6, 8])
                    .width(Length::FillPortion(1))
                    .style(theme::empty_slot_card_style),
            );
        }
        for _ in chunk.len()..3 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        char_grid = char_grid.push(r);
    }

    container(
        column![
            row![
                text("Castle Suggestion Box (Meyasubako / meyasu_data)")
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                container(
                    text(if b_meyasu { "New Mail Waiting" } else { "Box Idle" })
                        .size(11)
                        .color(if b_meyasu {
                            theme::ACCENT_CYAN
                        } else {
                            theme::TEXT_MUTED
                        }),
                )
                .padding([3, 8])
                .style(theme::badge_style(if b_meyasu {
                    theme::ACCENT_CYAN
                } else {
                    theme::TEXT_MUTED
                })),
                container(
                    text(format!("Inbox: {}/4", inbox_count))
                        .size(11)
                        .color(theme::ACCENT_GOLD)
                )
                .padding([3, 8])
                .style(theme::badge_style(theme::ACCENT_GOLD)),
                container(
                    text(format!("Read Progress: {} Letters", read_total))
                        .size(11)
                        .color(theme::ACCENT_GREEN),
                )
                .padding([3, 8])
                .style(theme::badge_style(theme::ACCENT_GREEN)),
            ]
            .spacing(8)
            .align_y(Alignment::Center),
            row![
                checkbox("New Mail Notification Flag (b_meyasu)", b_meyasu)
                    .on_toggle(|on| {
                        Message::SetIntField(
                            Some("game_data"),
                            "b_meyasu",
                            if on { "1" } else { "0" }.to_string(),
                        )
                    })
                    .text_size(12),
                Space::with_width(Length::Fill),
                button(text("Clear Inbox (4 Slots)").size(11))
                    .padding([5, 10])
                    .style(theme::secondary_button_style)
                    .on_press(Message::ClearSuggestionInbox),
                button(text("Mark All Read (3/3)").size(11))
                    .padding([5, 10])
                    .style(theme::primary_button_style)
                    .on_press(Message::SetAllSuggestionLetters(3)),
                button(text("Reset All (0)").size(11))
                    .padding([5, 10])
                    .style(theme::secondary_button_style)
                    .on_press(Message::SetAllSuggestionLetters(0)),
            ]
            .spacing(8)
            .align_y(Alignment::Center),
            inbox_row,
            row![
                text(format!(
                    "Character Letter Read Progress ({} shown)",
                    matching.len()
                ))
                .size(13)
                .color(theme::ACCENT_CYAN),
                Space::with_width(Length::Fill),
                text_input("Filter character by name or ID...", search)
                    .on_input(Message::SetSuggestionSearch)
                    .padding(6)
                    .size(12)
                    .width(Length::Fixed(240.0))
                    .style(theme::input_style),
            ]
            .align_y(Alignment::Center),
            scrollable(char_grid)
                .height(Length::Fixed(320.0))
                .style(theme::scrollable_style),
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}
