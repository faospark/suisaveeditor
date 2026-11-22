use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::data::catalog::{
    find_labeled_option, BATH_ORNAMENT_OPTIONS, BATH_PAINTING_OPTIONS, FISH_BOARD,
    GUARDIAN_BEASTS, GUARDIAN_BLUEPRINTS, HAMMER_DEFS, LIBRARY_BOOK_DEFS, LabeledOption,
    SOUND_SET_DEFS, SOUND_SET_OPTIONS, WINDOW_COLOR_OPTIONS, WINDOW_OPACITY_OPTIONS,
    WINDOW_SET_DEFS, WINDOW_STYLE_OPTIONS,
};
use crate::data::find_option;
use crate::gamedata::{character_name, PortraitCache};
use crate::save_file::SaveDocument;
use crate::theme;
use crate::Message;

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    suggestion_search: &'a str,
) -> Element<'a, Message> {
    let tessai_card = view_tessai_hammers(doc, portraits);
    let guardian_card = view_guardian_deity(doc, portraits);
    let farm_card = view_farm_ranch(doc, portraits);
    let yuzu_card = view_yuzu_pasture(doc, portraits);
    let window_card = view_window_sets(doc, portraits);
    let sound_card = view_sound_sets(doc, portraits);
    let library_card = view_library_books(doc, portraits);
    let bath_card = view_bath_items(doc, portraits);
    let fishing_card = view_fishing_records(doc, portraits);
    let suggestion_card = view_suggestion_box(doc, portraits, suggestion_search);

    let content = column![
        column![
            text("Castle Facilities & Upgrades")
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text("Tessai's Blacksmith Hammers, Guardian Deity, Tony's Farm, Yuzu's Pasture, Tenkou's Window Sets, Connell's Sound Sets, Library Books, Bath Items, Fishing Board, and Suggestion Box.")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        tessai_card,
        guardian_card,
        farm_card,
        yuzu_card,
        window_card,
        sound_card,
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

fn view_tessai_hammers<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let flag = doc.get_event_flag(143);
    let kaji_lv = doc.get_i64(Some("game_data"), "kaji_lv");
    let delivered = HAMMER_DEFS
        .iter()
        .filter(|h| (flag & h.mask) != 0)
        .count();

    let active_cap: u8 = if (flag & 0x40) != 0 {
        16
    } else if (flag & 0x20) != 0 {
        15
    } else if (flag & 0x10) != 0 {
        12
    } else if (flag & 0x08) != 0 {
        9
    } else {
        6
    };

    let badge_color = if delivered == 4 {
        theme::ACCENT_GREEN
    } else if delivered > 0 {
        theme::ACCENT_CYAN
    } else {
        theme::TEXT_MUTED
    };

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 110) {
        header = header.push(p);
    }
    header = header
        .push(
            column![
                text("Tessai's Blacksmith Hammers (event_flag[143] Bits 3–6)")
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                text(format!(
                    "Highest delivered hammer sets Tessai's forge cap (Base Lv 6) • Global kaji_lv: Lv {} • Raw byte: 0x{:02X}",
                    kaji_lv, flag
                ))
                .size(11)
                .color(theme::TEXT_MUTED),
            ]
            .spacing(1),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            container(
                text(format!("{} / 4 Delivered • Cap Lv {}", delivered, active_cap))
                    .size(11)
                    .color(badge_color),
            )
            .padding([3, 8])
            .style(theme::badge_style(badge_color)),
        );

    let toolbar = row![
        text("Toggle hammers delivered to Tessai in Castle HQ (unrelated bits in event_flag[143] are preserved).")
            .size(11)
            .color(theme::TEXT_MUTED),
        Space::with_width(Length::Fill),
        button(text("Deliver All 4 Hammers").size(11))
            .padding([5, 10])
            .style(theme::primary_button_style)
            .on_press(Message::SetArrayIntField(
                None,
                "event_flag",
                143,
                ((flag | 0x78) as i64).to_string(),
            )),
        button(text("Clear All").size(11))
            .padding([5, 10])
            .style(theme::secondary_button_style)
            .on_press(Message::SetArrayIntField(
                None,
                "event_flag",
                143,
                ((flag & !0x78) as i64).to_string(),
            )),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    let mut hammer_row = row![].spacing(10);
    for h in HAMMER_DEFS {
        let mask = h.mask;
        let bit = mask.trailing_zeros();
        let checked = (flag & mask) != 0;
        let cap_color = if checked {
            theme::ACCENT_GREEN
        } else {
            theme::TEXT_MUTED
        };

        hammer_row = hammer_row.push(
            container(
                column![
                    row![
                        checkbox(format!("{} (Bit {})", h.name, bit), checked)
                            .on_toggle(move |on| Message::ToggleEventFlagBit(143, mask, on))
                            .text_size(12),
                        Space::with_width(Length::Fill),
                        container(
                            text(format!("Lv {}", h.max_lv))
                                .size(10)
                                .color(cap_color),
                        )
                        .padding([2, 6])
                        .style(theme::badge_style(cap_color)),
                    ]
                    .align_y(Alignment::Center),
                    text(h.loc).size(10).color(theme::TEXT_MUTED),
                ]
                .spacing(4),
            )
            .padding(10)
            .width(Length::FillPortion(1))
            .style(theme::empty_slot_card_style),
        );
    }

    container(column![header, toolbar, hammer_row].spacing(12))
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_yuzu_pasture<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let species: [(usize, &str, &str, &[&str]); 4] = [
        (
            4,
            "Chickens",
            "hon_flag[31] Bits 4, 5, 6",
            &[
                "Chick #1 — Yuzu Default",
                "Chick #2 — Lakewest (Docks)",
                "Chick #3 — Tigermouth (Well)",
            ],
        ),
        (
            5,
            "Pigs",
            "hon_flag[31] B7, [32] B0–1",
            &[
                "Piglet #1 — Radat (Shu's House)",
                "Piglet #2 — Rokkaku (Trading Post)",
                "Piglet #3 — Greenhill (Academy)",
            ],
        ),
        (
            6,
            "Sheep",
            "hon_flag[32] Bits 2, 3, 4, 5",
            &[
                "Sheep #1 — Taro (Yuzu Default)",
                "Sheep #2 — Kobold Forest",
                "Sheep #3 — Forest Village",
                "Sheep #4 — Sajah (Rare Find)",
            ],
        ),
        (
            7,
            "Cattle / Calves",
            "hon_flag[32] B6–7, [33] B0",
            &[
                "Calf #1 — Highway Village",
                "Calf #2 — Drakemouth Village",
                "Calf #3 — Highway (Post-Rockaxe)",
            ],
        ),
    ];

    let mut cards = row![].spacing(10);
    for (food_idx, name, flag_note, animals) in species {
        let max_val = animals.len() as i64;
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

        let mut col = column![
            row![
                text(name).size(13).color(theme::ACCENT_CYAN),
                Space::with_width(Length::Fill),
                container(text(format!("{}/{}", count, max_val)).size(11).color(badge_color))
                    .padding([2, 7])
                    .style(theme::badge_style(badge_color)),
            ]
            .align_y(Alignment::Center),
        ]
        .spacing(6);

        for (i, &animal_label) in animals.iter().enumerate() {
            let slot_num = (i + 1) as i64;
            let checked = count >= slot_num;
            col = col.push(
                checkbox(animal_label, checked)
                    .on_toggle(move |on| {
                        let next = if on { slot_num } else { slot_num - 1 };
                        Message::SetYuzuLivestock(food_idx, next)
                    })
                    .text_size(11),
            );
        }

        col = col.push(text(flag_note).size(10).color(theme::TEXT_MUTED));

        cards = cards.push(
            container(col)
                .padding(12)
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
                text("Check animals delivered to Yuzu (food_num[4..7]); pasture spawn flags across hon_flag[31..33] sync automatically.")
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

    // Scan Party Bag (party_data.party_item) and Warehouse (game_data.base_item)
    // for Base-category Guardian Deity Plans (item_no 27..=42, use_cnt 80..=95).
    let mut party_counts = [0usize; 16];
    for (_, item_no, use_cnt) in doc.get_inventory_items("party_data", "party_item") {
        if (80..=95).contains(&use_cnt) && (27..=42).contains(&item_no) {
            party_counts[(item_no - 27) as usize] += 1;
        }
    }
    let mut warehouse_counts = [0usize; 16];
    for (_, item_no, use_cnt) in doc.get_inventory_items("game_data", "base_item") {
        if (80..=95).contains(&use_cnt) && (27..=42).contains(&item_no) {
            warehouse_counts[(item_no - 27) as usize] += 1;
        }
    }

    let mut held_undelivered = 0usize;

    // 4-column Blueprint grid (Dragon, Unicorn, Rabbit, Turtle)
    let mut bp_cols = row![].spacing(10);
    for deity_idx in 0..4 {
        let mut col = column![].spacing(6).width(Length::FillPortion(1));
        for bp in &GUARDIAN_BLUEPRINTS[deity_idx * 4..deity_idx * 4 + 4] {
            let cur_byte = if bp.byte_idx == 0 { bp0 } else { bp1 };
            let mask = 1u8 << bp.bit_idx;
            let checked = (cur_byte & mask) != 0;
            let byte_idx = bp.byte_idx;

            let plan_idx = (bp.base_item_id - 27) as usize;
            let in_party = party_counts[plan_idx];
            let in_warehouse = warehouse_counts[plan_idx];

            let mut card_col = column![
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
            .spacing(2);

            if !checked && (in_party > 0 || in_warehouse > 0) {
                held_undelivered += 1;
                let mut badges = row![].spacing(5).align_y(Alignment::Center);
                if in_party > 0 {
                    let lbl = if in_party > 1 {
                        format!("In Party ×{}", in_party)
                    } else {
                        "In Party".to_string()
                    };
                    badges = badges.push(
                        container(text(lbl).size(10).color(theme::ACCENT_CYAN))
                            .padding([1, 6])
                            .style(theme::badge_style(theme::ACCENT_CYAN)),
                    );
                }
                if in_warehouse > 0 {
                    let lbl = if in_warehouse > 1 {
                        format!("In Warehouse ×{}", in_warehouse)
                    } else {
                        "In Warehouse".to_string()
                    };
                    badges = badges.push(
                        container(text(lbl).size(10).color(theme::ACCENT_GOLD))
                            .padding([1, 6])
                            .style(theme::badge_style(theme::ACCENT_GOLD)),
                    );
                }
                if in_party == 0 || in_warehouse == 0 {
                    badges = badges.push(
                        text("Not yet given to Jude")
                            .size(10)
                            .color(theme::TEXT_MUTED),
                    );
                }
                card_col = card_col.push(badges);
            }

            col = col.push(
                container(card_col)
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
    header = header.push(
        text(format!(
            "Jude's Guardian Deity Blueprints ({} / 16) & Statue",
            delivered
        ))
        .size(15)
        .color(theme::ACCENT_GOLD),
    );
    if held_undelivered > 0 {
        let held_lbl = if held_undelivered == 1 {
            "1 held (not yet given to Jude)".to_string()
        } else {
            format!("{} held (not yet given to Jude)", held_undelivered)
        };
        header = header.push(
            container(text(held_lbl).size(11).color(theme::ACCENT_CYAN))
                .padding([2, 8])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
        );
    }
    header = header
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
    let crops: [(usize, &str, &str, &[&str]); 4] = [
        (
            0,
            "Cabbage",
            "hon_flag[30] Bits 0, 1, 2",
            &[
                "Cabbage #1 — Tony Default",
                "Cabbage #2 — Lakewest (Rare Find)",
                "Cabbage #3 — Drakemouth Village",
            ],
        ),
        (
            1,
            "Potato",
            "hon_flag[30] Bits 3, 4, 5",
            &[
                "Potato #1 — Tony Default",
                "Potato #2 — Matilda Forest",
                "Potato #3 — Banner Village",
            ],
        ),
        (
            2,
            "Spinach",
            "hon_flag[30] B6–7, [31] B0",
            &[
                "Spinach #1 — Two River",
                "Spinach #2 — Forest Village (Chief)",
                "Spinach #3 — Greenhill Area (Drop)",
            ],
        ),
        (
            3,
            "Tomato",
            "hon_flag[31] Bits 1, 2, 3",
            &[
                "Tomato #1 — Banner Village (Shop)",
                "Tomato #2 — Gregminster (Mr. Yasu)",
                "Tomato #3 — Tigermouth Village",
            ],
        ),
    ];

    let mut crop_row = row![].spacing(10);
    for (food_idx, crop_name, flag_note, seeds) in crops {
        let max_val = seeds.len() as i64;
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

        let mut col = column![
            row![
                text(crop_name).size(13).color(theme::ACCENT_CYAN),
                Space::with_width(Length::Fill),
                container(text(format!("{}/{}", count, max_val)).size(11).color(badge_color))
                    .padding([2, 7])
                    .style(theme::badge_style(badge_color)),
            ]
            .align_y(Alignment::Center),
        ]
        .spacing(6);

        for (i, &seed_label) in seeds.iter().enumerate() {
            let slot_num = (i + 1) as i64;
            let checked = count >= slot_num;
            col = col.push(
                checkbox(seed_label, checked)
                    .on_toggle(move |on| {
                        let next = if on { slot_num } else { slot_num - 1 };
                        Message::SetTonyCrop(food_idx, next)
                    })
                    .text_size(11),
            );
        }

        col = col.push(text(flag_note).size(10).color(theme::TEXT_MUTED));

        crop_row = crop_row.push(
            container(col)
                .padding(12)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
        );
    }

    let mut header = row![].spacing(8).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 104) {
        header = header.push(p);
    }
    header = header
        .push(
            column![
                text("Tony's Vegetable Farm (food_num[0..3])")
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                text("Check seedlings delivered to Tony (food_num[0..3]); farm plot flags across hon_flag[30..31] sync automatically.")
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ]
            .spacing(1),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            button(text("Max All (12)").size(11))
                .padding([5, 10])
                .style(theme::primary_button_style)
                .on_press(Message::MaxVegetableFarm),
        )
        .push(
            button(text("Default Recruited (2)").size(11))
                .padding([5, 10])
                .style(theme::secondary_button_style)
                .on_press(Message::DefaultVegetableFarm),
        )
        .push(
            button(text("Clear All (0)").size(11))
                .padding([5, 10])
                .style(theme::secondary_button_style)
                .on_press(Message::ClearVegetableFarm),
        );

    container(
        column![header, crop_row].spacing(12),
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

    let win_typ = doc.get_array_i64(Some("game_data"), "win_typ", 0).clamp(0, 7);
    let win_col = doc.get_i64(Some("game_data"), "win_col").clamp(0, 7);
    let win_suke = doc.get_i64(Some("game_data"), "win_suke").clamp(0, 3);

    let selected_style = find_labeled_option(WINDOW_STYLE_OPTIONS, win_typ);
    let selected_color = find_labeled_option(WINDOW_COLOR_OPTIONS, win_col);
    let selected_opacity = find_labeled_option(WINDOW_OPACITY_OPTIONS, win_suke);

    let badge_color = if unlocked == 7 {
        theme::ACCENT_GREEN
    } else if unlocked > 0 {
        theme::ACCENT_CYAN
    } else {
        theme::TEXT_MUTED
    };

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 97) {
        header = header.push(p);
    }
    header = header
        .push(
            text("Tenkou's Window Sets & Frame Customization")
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            container(
                text(format!("{} / 7 Delivered to Tenkou", unlocked))
                    .size(11)
                    .color(badge_color),
            )
            .padding([3, 8])
            .style(theme::badge_style(badge_color)),
        );

    let settings_box = container(
        row![
            column![
                text("Active Window Style (win_typ[0]):")
                    .size(11)
                    .color(theme::TEXT_PRIMARY),
                pick_list(WINDOW_STYLE_OPTIONS, selected_style, |opt| {
                    Message::SetArrayIntField(
                        Some("game_data"),
                        "win_typ",
                        0,
                        opt.id.to_string(),
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
            column![
                text("Frame Color (win_col):")
                    .size(11)
                    .color(theme::TEXT_PRIMARY),
                pick_list(WINDOW_COLOR_OPTIONS, selected_color, |opt| {
                    Message::SetIntField(Some("game_data"), "win_col", opt.id.to_string())
                })
                .text_size(12)
                .padding([6, 8])
                .width(Length::Fill)
                .style(theme::pick_list_style)
                .menu_style(theme::pick_list_menu_style),
            ]
            .spacing(4)
            .width(Length::FillPortion(1)),
            column![
                text("Opacity / Transparency (win_suke):")
                    .size(11)
                    .color(theme::TEXT_PRIMARY),
                pick_list(WINDOW_OPACITY_OPTIONS, selected_opacity, |opt| {
                    Message::SetIntField(Some("game_data"), "win_suke", opt.id.to_string())
                })
                .text_size(12)
                .padding([6, 8])
                .width(Length::Fill)
                .style(theme::pick_list_style)
                .menu_style(theme::pick_list_menu_style),
            ]
            .spacing(4)
            .width(Length::FillPortion(1)),
        ]
        .spacing(12),
    )
    .padding(12)
    .width(Length::Fill)
    .style(theme::empty_slot_card_style);

    let delivery_toolbar = row![
        text("Sets marked as delivered will be available in Tenkou's Window Selection menu in Castle HQ.")
            .size(11)
            .color(theme::TEXT_MUTED),
        Space::with_width(Length::Fill),
        button(text("Deliver All 7 Sets").size(11))
            .padding([5, 10])
            .style(theme::primary_button_style)
            .on_press(Message::SetArrayIntField(
                None,
                "event_flag",
                77,
                ((flag | 0x7F) as i64).to_string(),
            )),
        button(text("Clear All").size(11))
            .padding([5, 10])
            .style(theme::secondary_button_style)
            .on_press(Message::SetArrayIntField(
                None,
                "event_flag",
                77,
                ((flag & !0x7F) as i64).to_string(),
            )),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    let mut grid = column![].spacing(8);
    for chunk in WINDOW_SET_DEFS.chunks(3) {
        let mut r = row![].spacing(10);
        for w in chunk {
            let mask = w.mask;
            let bit = mask.trailing_zeros();
            r = r.push(
                container(
                    column![
                        checkbox(format!("{} (Bit {})", w.name, bit), (flag & mask) != 0)
                            .on_toggle(move |on| Message::ToggleEventFlagBit(77, mask, on))
                            .text_size(12),
                        text(w.desc).size(10).color(theme::TEXT_MUTED),
                    ]
                    .spacing(3),
                )
                .padding(10)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
            );
        }
        for _ in chunk.len()..3 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        grid = grid.push(r);
    }

    container(
        column![header, settings_box, delivery_toolbar, grid].spacing(12),
    )
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
    let se_set = doc.get_i64(Some("game_data"), "se_set").clamp(0, 7);
    let selected_se = find_labeled_option(SOUND_SET_OPTIONS, se_set);

    let badge_color = if unlocked == 7 {
        theme::ACCENT_GREEN
    } else if unlocked > 0 {
        theme::ACCENT_CYAN
    } else {
        theme::TEXT_MUTED
    };

    let mut header = row![].spacing(10).align_y(Alignment::Center);
    if let Some(p) = portrait_thumb(portraits, 108) {
        header = header.push(p);
    }
    header = header
        .push(
            text("Connell's Sound Sets & Audio Customization")
                .size(15)
                .color(theme::ACCENT_GOLD),
        )
        .push(Space::with_width(Length::Fill))
        .push(
            container(
                text(format!("{} / 7 Delivered to Connell", unlocked))
                    .size(11)
                    .color(badge_color),
            )
            .padding([3, 8])
            .style(theme::badge_style(badge_color)),
        );

    let settings_box = container(
        column![
            text("Active Sound Effect Set (game_data.se_set):")
                .size(11)
                .color(theme::TEXT_PRIMARY),
            pick_list(SOUND_SET_OPTIONS, selected_se, |opt| {
                Message::SetIntField(Some("game_data"), "se_set", opt.id.to_string())
            })
            .text_size(12)
            .padding([6, 8])
            .width(Length::Fixed(380.0))
            .style(theme::pick_list_style)
            .menu_style(theme::pick_list_menu_style),
        ]
        .spacing(4),
    )
    .padding(12)
    .width(Length::Fill)
    .style(theme::empty_slot_card_style);

    let delivery_toolbar = row![
        text("Sets marked as delivered will be available in Connell's Sound Change studio in Castle HQ.")
            .size(11)
            .color(theme::TEXT_MUTED),
        Space::with_width(Length::Fill),
        button(text("Deliver All 7 Sets").size(11))
            .padding([5, 10])
            .style(theme::primary_button_style)
            .on_press(Message::SetArrayIntField(
                None,
                "event_flag",
                78,
                ((flag | 0x7F) as i64).to_string(),
            )),
        button(text("Clear All").size(11))
            .padding([5, 10])
            .style(theme::secondary_button_style)
            .on_press(Message::SetArrayIntField(
                None,
                "event_flag",
                78,
                ((flag & !0x7F) as i64).to_string(),
            )),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    let mut grid = column![].spacing(8);
    for chunk in SOUND_SET_DEFS.chunks(3) {
        let mut r = row![].spacing(10);
        for s in chunk {
            let mask = s.mask;
            let bit = mask.trailing_zeros();
            r = r.push(
                container(
                    column![
                        checkbox(format!("{} (Bit {})", s.name, bit), (flag & mask) != 0)
                            .on_toggle(move |on| Message::ToggleEventFlagBit(78, mask, on))
                            .text_size(12),
                        text(s.desc).size(10).color(theme::TEXT_MUTED),
                    ]
                    .spacing(3),
                )
                .padding(10)
                .width(Length::FillPortion(1))
                .style(theme::empty_slot_card_style),
            );
        }
        for _ in chunk.len()..3 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        grid = grid.push(r);
    }

    container(
        column![header, settings_box, delivery_toolbar, grid].spacing(12),
    )
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
    let count = LIBRARY_BOOK_DEFS
        .iter()
        .filter(|b| (mask_val & (1 << b.bit)) != 0)
        .count();

    let mut grid = column![].spacing(8);
    for chunk in LIBRARY_BOOK_DEFS.chunks(3) {
        let mut r = row![].spacing(10);
        for book in chunk {
            let bit = book.bit as u32;
            let checked = (mask_val & (1 << bit)) != 0;
            r = r.push(
                container(
                    column![
                        checkbox(format!("Vol. {} (Bit {})", book.vol, bit), checked)
                            .on_toggle(move |val| Message::ToggleLibFlagBit(bit, val))
                            .text_size(12),
                        text(book.desc).size(10).color(theme::TEXT_MUTED),
                    ]
                    .spacing(3),
                )
                .padding(10)
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
                    ((mask_val | 0x0FFF) as i64).to_string(),
                )),
        )
        .push(
            button(text("Clear All").size(11))
                .padding([5, 10])
                .style(theme::secondary_button_style)
                .on_press(Message::SetIntField(
                    Some("game_data"),
                    "lib_flag",
                    ((mask_val & !0x0FFF) as i64).to_string(),
                )),
        );

    container(
        column![
            header,
            grid,
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn bath_slot_row<'a>(
    items: &[(usize, i64, i64)],
    slot_idx: usize,
    options: &'static [LabeledOption],
) -> Element<'a, Message> {
    let item_no = items
        .iter()
        .find(|(s, _, _)| *s == slot_idx)
        .map(|(_, id, _)| *id)
        .unwrap_or(0);
    let selected = find_labeled_option(options, item_no);

    row![
        text(format!("Slot {}:", slot_idx))
            .size(12)
            .color(theme::TEXT_PRIMARY)
            .width(Length::Fixed(56.0)),
        pick_list(options, selected, move |opt| {
            Message::SetBathItem(slot_idx, opt.id)
        })
        .text_size(12)
        .padding([6, 8])
        .width(Length::Fill)
        .style(theme::pick_list_style)
        .menu_style(theme::pick_list_menu_style),
    ]
    .spacing(8)
    .align_y(Alignment::Center)
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
        column![
            text(format!(
                "Tetsu's Castle Bath House Items ({} slots)",
                items.len()
            ))
            .size(15)
            .color(theme::ACCENT_GOLD),
            text("Configure artwork and decorative items displayed in the Dunan Castle Bath House. Paintings occupy Slots 2 & 5; antique ornaments decorate the Girl's and Boy's sides (automatically assigned Trade item category use_cnt: 64).")
                .size(11)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(2),
    );

    let paintings_box = container(
        column![
            row![
                text("Paintings").size(13).color(theme::ACCENT_CYAN),
                text("(Slots 2 & 5)").size(11).color(theme::TEXT_MUTED),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
            row![
                container(bath_slot_row(&items, 2, BATH_PAINTING_OPTIONS))
                    .width(Length::FillPortion(1)),
                container(bath_slot_row(&items, 5, BATH_PAINTING_OPTIONS))
                    .width(Length::FillPortion(1)),
            ]
            .spacing(12),
        ]
        .spacing(8),
    )
    .padding(12)
    .width(Length::Fill)
    .style(theme::empty_slot_card_style);

    let girls_side = container(
        column![
            text("Girl's Side (Left Ornaments)")
                .size(13)
                .color(theme::ACCENT_CYAN),
            bath_slot_row(&items, 0, BATH_ORNAMENT_OPTIONS),
            bath_slot_row(&items, 1, BATH_ORNAMENT_OPTIONS),
            bath_slot_row(&items, 3, BATH_ORNAMENT_OPTIONS),
        ]
        .spacing(8),
    )
    .padding(12)
    .width(Length::FillPortion(1))
    .style(theme::empty_slot_card_style);

    let boys_side = container(
        column![
            text("Boy's Side (Right Ornaments)")
                .size(13)
                .color(theme::ACCENT_CYAN),
            bath_slot_row(&items, 4, BATH_ORNAMENT_OPTIONS),
            bath_slot_row(&items, 6, BATH_ORNAMENT_OPTIONS),
            bath_slot_row(&items, 7, BATH_ORNAMENT_OPTIONS),
        ]
        .spacing(8),
    )
    .padding(12)
    .width(Length::FillPortion(1))
    .style(theme::empty_slot_card_style);

    let ornaments_row = row![girls_side, boys_side].spacing(12);

    container(column![header, paintings_box, ornaments_row].spacing(12))
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
