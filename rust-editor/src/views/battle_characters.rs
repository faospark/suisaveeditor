use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::data::rules::{
    can_equip_shield, filter_armors_for_character, filter_helmets_for_character,
    filter_runes_for_character, is_beast, ItemCategory, WEAPON_RUNES,
};
use crate::data::{find_option, opt, resolve_inventory_item, NamedOption, SHIELDS};
use crate::gamedata::{character_name, PortraitCache, RecruitStatus, STAT_LABELS};
use crate::save_file::SaveDocument;
use crate::theme;
use crate::views::item_modal::ModalTarget;
use crate::Message;

const AFFINITY_RANKS: &[NamedOption] = &[
    opt(0, "Unrated (Default)"),
    opt(1, "Rank A (+40% Dmg & Bonus)"),
    opt(2, "Rank B (+20% Dmg)"),
    opt(3, "Rank C (100% Normal)"),
    opt(4, "Rank D (-20% Dmg)"),
    opt(5, "Rank E (-40% Dmg)"),
];

const AFFINITY_ELEMENTS: [&str; 8] = [
    "Fire",
    "Water",
    "Wind",
    "Earth",
    "Lightning",
    "Resurrection",
    "Darkness",
    "Special",
];

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    selected_id: usize,
    search: &'a str,
    recruited_only: bool,
    bypass_rune_restrictions: bool,
    bypass_equip_restrictions: bool,
) -> Element<'a, Message> {
    let left_list = view_character_list(doc, portraits, selected_id, search, recruited_only);
    let right_editor = view_character_detail(
        doc,
        portraits,
        selected_id,
        bypass_rune_restrictions,
        bypass_equip_restrictions,
    );

    row![left_list, right_editor]
        .spacing(16)
        .padding(20)
        .height(Length::Fill)
        .into()
}

fn view_character_list<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    selected_id: usize,
    search: &'a str,
    recruited_only: bool,
) -> Element<'a, Message> {
    let q = search.trim().to_lowercase();
    let max_chars = doc.battle_character_count().saturating_sub(1).min(83);

    let mut list = column![].spacing(4);
    for id in 1..=max_chars {
        let name = character_name(id as i64);
        if !q.is_empty() && !name.to_lowercase().contains(&q) && !id.to_string().contains(&q) {
            continue;
        }
        let status = RecruitStatus::from_flag(doc.get_chara_flag(id));
        if recruited_only && !status.is_recruited() {
            continue;
        }

        let lv = doc.get_battle_char_i64(id, "level");
        let is_selected = id == selected_id;

        let thumb: Element<'a, Message> = if let Some(handle) = portraits.get(id as i64) {
            image(handle).width(32).height(32).into()
        } else {
            container(text("?").size(12).color(theme::TEXT_MUTED))
                .width(32)
                .height(32)
                .center_x(Length::Fixed(32.0))
                .center_y(Length::Fixed(32.0))
                .into()
        };

        let item = button(
            row![
                thumb,
                column![
                    text(name).size(13).color(if is_selected {
                        theme::ACCENT_GOLD
                    } else {
                        theme::TEXT_PRIMARY
                    }),
                    text(format!("#{} • Lv. {}", id, lv))
                        .size(11)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(1),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        )
        .width(Length::Fill)
        .padding([6, 8])
        .style(theme::nav_button_style(is_selected))
        .on_press(Message::SelectBattleChar(id));

        list = list.push(item);
    }

    container(
        column![
            text("Battle Roster (1–83)").size(14).color(theme::ACCENT_GOLD),
            text_input("Filter character...", search)
                .on_input(Message::SetBattleSearch)
                .padding(7)
                .size(12)
                .style(theme::input_style),
            checkbox("Recruited Only", recruited_only)
                .on_toggle(Message::SetBattleRecruitedOnly)
                .text_size(12),
            scrollable(list)
                .height(Length::Fill)
                .style(theme::scrollable_style),
        ]
        .spacing(8),
    )
    .padding(12)
    .width(Length::Fixed(245.0))
    .height(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_character_detail<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    id: usize,
    bypass_runes: bool,
    bypass_equip: bool,
) -> Element<'a, Message> {
    let char_id = id as i64;
    let name = character_name(char_id);
    let beast = is_beast(char_id);
    let shield_ok = bypass_equip || can_equip_shield(char_id);

    let portrait: Element<'a, Message> = if let Some(handle) = portraits.get(char_id) {
        image(handle).width(88).height(88).into()
    } else {
        container(text("?").size(28).color(theme::TEXT_MUTED))
            .width(88)
            .height(88)
            .center_x(Length::Fixed(88.0))
            .center_y(Length::Fixed(88.0))
            .into()
    };

    let mut title_row = row![text(name).size(22).color(theme::ACCENT_GOLD)]
        .spacing(10)
        .align_y(Alignment::Center);
    if beast {
        title_row = title_row.push(
            container(text("Beast / Monster").size(11).color(theme::ACCENT_CYAN))
                .padding([3, 8])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
        );
    }

    let header_card = container(
        row![
            portrait,
            column![
                title_row,
                text(format!("Battle Character ID #{} (chara_data.c_varia_dat[{}])", id, id))
                    .size(12)
                    .color(theme::TEXT_MUTED),
                row![
                    button(text("Restore HP & Max MP").size(12))
                        .padding([6, 12])
                        .style(theme::secondary_button_style)
                        .on_press(Message::RestoreBattleCharVitals(id)),
                    button(text("Set Lv 99 & Max Weapon (16)").size(12))
                        .padding([6, 12])
                        .style(theme::primary_button_style)
                        .on_press(Message::MaxBattleCharLevel(id)),
                ]
                .spacing(8),
                row![
                    checkbox("Bypass Rune Restrictions", bypass_runes)
                        .on_toggle(Message::SetBypassRuneRestrictions)
                        .text_size(12),
                    checkbox("Bypass Equipment Restrictions", bypass_equip)
                        .on_toggle(Message::SetBypassEquipRestrictions)
                        .text_size(12),
                ]
                .spacing(16),
            ]
            .spacing(8),
        ]
        .spacing(16)
        .align_y(Alignment::Center),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style);

    let weapon_rune_id = doc.get_battle_char_i64(id, "buki_mon");
    let weapon_rune_widget: Element<'a, Message> = if beast && !bypass_equip {
        disabled_slot_badge("0 - None (Beast — Cannot equip)")
    } else {
        let selected = find_option(WEAPON_RUNES, weapon_rune_id);
        pick_list(WEAPON_RUNES, Some(selected), move |opt| {
            Message::SetBattleCharInt(id, "buki_mon", opt.id.to_string())
        })
        .text_size(12)
        .padding([6, 8])
        .width(Length::Fill)
        .style(theme::pick_list_style)
        .menu_style(theme::pick_list_menu_style)
        .into()
    };

    let core_card = container(
        column![
            text("Level, HP & Weapon").size(15).color(theme::ACCENT_GOLD),
            stat_input_row("Level", doc.get_battle_char_i64(id, "level"), move |v| {
                Message::SetBattleCharInt(id, "level", v)
            }),
            stat_input_row("Experience", doc.get_battle_char_i64(id, "exp"), move |v| {
                Message::SetBattleCharInt(id, "exp", v)
            }),
            stat_input_row("Current HP", doc.get_battle_char_i64(id, "now_hp"), move |v| {
                Message::SetBattleCharInt(id, "now_hp", v)
            }),
            stat_input_row("Max HP", doc.get_battle_char_i64(id, "max_hp"), move |v| {
                Message::SetBattleCharInt(id, "max_hp", v)
            }),
            stat_input_row("Weapon Level", doc.get_battle_char_i64(id, "buki_lv"), move |v| {
                Message::SetBattleCharInt(id, "buki_lv", v)
            }),
            row![
                text("Weapon Rune")
                    .size(13)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(130.0)),
                weapon_rune_widget,
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            stat_input_row("Enemies Defeated", doc.get_battle_char_i64(id, "todome"), move |v| {
                Message::SetBattleCharInt(id, "todome", v)
            }),
            stat_input_row(
                "Friendship (suki_value)",
                doc.get_array_i64(Some("chara_data"), "suki_value", id),
                move |v| Message::SetArrayIntField(Some("chara_data"), "suki_value", id, v),
            ),
        ]
        .spacing(8),
    )
    .padding(16)
    .width(Length::FillPortion(1))
    .style(theme::card_style);

    let mut para_col = column![text("Base Stats (para)").size(15).color(theme::ACCENT_GOLD)].spacing(8);
    for (slot, label) in STAT_LABELS.iter().enumerate() {
        let val = doc.get_battle_char_array_i64(id, "para", slot);
        para_col = para_col.push(stat_input_row(label, val, move |v| {
            Message::SetBattleCharArrayInt(id, "para", slot, v)
        }));
    }
    let para_card = container(para_col)
        .padding(16)
        .width(Length::FillPortion(1))
        .style(theme::card_style);

    // Visual 9-Pip MP Bars with - / + cast steppers (17 pts per cast, max 153)
    let mut mp_row = row![].spacing(12);
    for slot in 0..4 {
        let val = doc.get_battle_char_array_i64(id, "mp", slot).clamp(0, 153);
        let casts = (val / 17).clamp(0, 9);
        let filled = "●".repeat(casts as usize);
        let empty = "○".repeat((9 - casts) as usize);

        let dec_val = (casts - 1).max(0) * 17;
        let inc_val = (casts + 1).min(9) * 17;

        mp_row = mp_row.push(
            container(
                column![
                    row![
                        text(format!("Lv.{} MP", slot + 1))
                            .size(12)
                            .color(theme::ACCENT_GOLD),
                        Space::with_width(Length::Fill),
                        text(format!("{}/9", casts))
                            .size(12)
                            .color(theme::ACCENT_CYAN),
                    ],
                    row![
                        text(filled).size(12).color(theme::ACCENT_CYAN),
                        text(empty).size(12).color(theme::BORDER_SUBTLE),
                    ],
                    row![
                        button(text("-").size(12))
                            .padding([3, 10])
                            .style(theme::secondary_button_style)
                            .on_press(Message::SetBattleCharArrayInt(
                                id,
                                "mp",
                                slot,
                                dec_val.to_string()
                            )),
                        text_input("0", &val.to_string())
                            .on_input(move |v| Message::SetBattleCharArrayInt(id, "mp", slot, v))
                            .padding(4)
                            .size(12)
                            .style(theme::input_style),
                        button(text("+").size(12))
                            .padding([3, 10])
                            .style(theme::secondary_button_style)
                            .on_press(Message::SetBattleCharArrayInt(
                                id,
                                "mp",
                                slot,
                                inc_val.to_string()
                            )),
                    ]
                    .spacing(6)
                    .align_y(Alignment::Center),
                ]
                .spacing(6),
            )
            .padding(10)
            .width(Length::FillPortion(1))
            .style(theme::empty_slot_card_style),
        );
    }

    let mp_card = container(
        column![
            row![
                text("Rune Magic Points (mp[0..3])").size(15).color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                text("17 pts = 1 cast • Max 153 (9 casts)").size(11).color(theme::TEXT_MUTED),
            ],
            mp_row,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style);

    // Runes
    let rune_labels = ["Head / Forehead", "Right Hand", "Left Hand"];
    let mut rune_row = row![].spacing(12);
    for (slot, lbl) in rune_labels.iter().enumerate() {
        let val = doc.get_battle_char_array_i64(id, "mon_eqp", slot);
        let allowed = filter_runes_for_character(char_id, slot, bypass_runes);
        let selected = find_option(&allowed, val);
        rune_row = rune_row.push(
            column![
                text(*lbl).size(12).color(theme::TEXT_MUTED),
                pick_list(allowed, Some(selected), move |opt| {
                    Message::SetBattleCharArrayInt(id, "mon_eqp", slot, opt.id.to_string())
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

    // Armor
    let helmet_widget: Element<'a, Message> = if beast && !bypass_equip {
        disabled_slot_badge("Beast — Cannot equip")
    } else {
        let allowed = filter_helmets_for_character(char_id, bypass_equip);
        let selected = find_option(&allowed, doc.get_battle_char_array_i64(id, "bogu_eqp", 0));
        pick_list(allowed, Some(selected), move |opt| {
            Message::SetBattleCharArrayInt(id, "bogu_eqp", 0, opt.id.to_string())
        })
        .text_size(12)
        .padding([6, 8])
        .width(Length::Fill)
        .style(theme::pick_list_style)
        .menu_style(theme::pick_list_menu_style)
        .into()
    };

    let armor_widget: Element<'a, Message> = if beast && !bypass_equip {
        disabled_slot_badge("Beast — Cannot equip")
    } else {
        let allowed = filter_armors_for_character(char_id, bypass_equip);
        let selected = find_option(&allowed, doc.get_battle_char_array_i64(id, "bogu_eqp", 1));
        pick_list(allowed, Some(selected), move |opt| {
            Message::SetBattleCharArrayInt(id, "bogu_eqp", 1, opt.id.to_string())
        })
        .text_size(12)
        .padding([6, 8])
        .width(Length::Fill)
        .style(theme::pick_list_style)
        .menu_style(theme::pick_list_menu_style)
        .into()
    };

    let shield_widget: Element<'a, Message> = if beast && !bypass_equip {
        disabled_slot_badge("Beast — Cannot equip")
    } else if !shield_ok {
        disabled_slot_badge("Cannot equip shields")
    } else {
        let selected = find_option(SHIELDS, doc.get_battle_char_array_i64(id, "bogu_eqp", 2));
        pick_list(SHIELDS, Some(selected), move |opt| {
            Message::SetBattleCharArrayInt(id, "bogu_eqp", 2, opt.id.to_string())
        })
        .text_size(12)
        .padding([6, 8])
        .width(Length::Fill)
        .style(theme::pick_list_style)
        .menu_style(theme::pick_list_menu_style)
        .into()
    };

    let gear_row = row![
        column![text("Helmet / Head").size(12).color(theme::TEXT_MUTED), helmet_widget]
            .spacing(4)
            .width(Length::FillPortion(1)),
        column![text("Armor / Body").size(12).color(theme::TEXT_MUTED), armor_widget]
            .spacing(4)
            .width(Length::FillPortion(1)),
        column![text("Shield").size(12).color(theme::TEXT_MUTED), shield_widget]
            .spacing(4)
            .width(Length::FillPortion(1)),
    ]
    .spacing(12);

    // Accessories & Equipped Items (item_eqp[0..2]) — wired to Item Selector Modal!
    let acc_section: Element<'a, Message> = if id == 84 && !bypass_equip {
        disabled_slot_badge("Bonaparte (Non-playable NPC) — Cannot equip accessories")
    } else {
        let mut acc_col = column![].spacing(8);
        for slot in 0..3 {
            let (item_no, use_cnt) = doc.get_battle_char_accessory(id, slot);
            let is_empty = item_no == 0;
            let (cat, item_name) = resolve_inventory_item(item_no, use_cnt);
            let cat_color = match cat {
                "Equip" => theme::ACCENT_CYAN,
                "Item" => theme::ACCENT_GREEN,
                "Rune" => theme::ACCENT_GOLD,
                _ => theme::TEXT_MUTED,
            };

            let target = ModalTarget::BattleCharItem { char_id: id, slot };
            let modal_title = format!("{} — Accessory / Item Slot {}", name, slot + 1);

            acc_col = acc_col.push(
                container(
                    row![
                        text(format!("Slot {}", slot + 1))
                            .size(12)
                            .color(theme::TEXT_MUTED)
                            .width(Length::Fixed(48.0)),
                        container(text(cat).size(10).color(cat_color))
                            .padding([2, 7])
                            .style(theme::badge_style(cat_color)),
                        text(if is_empty {
                            "Empty Slot".to_string()
                        } else {
                            item_name
                        })
                        .size(13)
                        .color(if is_empty {
                            theme::TEXT_MUTED
                        } else {
                            theme::TEXT_PRIMARY
                        })
                        .width(Length::Fill),
                        text("Qty/Type:").size(11).color(theme::TEXT_MUTED),
                        text_input("0", &use_cnt.to_string())
                            .on_input(move |v| Message::SetBattleCharItemUseCnt(id, slot, v))
                            .padding(4)
                            .size(12)
                            .width(Length::Fixed(58.0))
                            .style(theme::input_style),
                        button(text(if is_empty { "+ Select Item" } else { "Change..." }).size(11))
                            .padding([5, 10])
                            .style(if is_empty {
                                theme::primary_button_style
                            } else {
                                theme::secondary_button_style
                            })
                            .on_press(Message::OpenItemModal(
                                target,
                                modal_title,
                                Some(ItemCategory::Equip),
                            )),
                        button(text("Clear").size(11))
                            .padding([5, 10])
                            .style(theme::secondary_button_style)
                            .on_press(Message::ApplyModalItem(target, 0, 0)),
                    ]
                    .spacing(8)
                    .align_y(Alignment::Center),
                )
                .padding([7, 10])
                .width(Length::Fill)
                .style(if is_empty {
                    theme::empty_slot_card_style
                } else {
                    theme::card_style
                }),
            );
        }
        acc_col.into()
    };

    // Rune Slot Unlock Levels (c_kotei_dat.mon_kosu_type[0..2])
    let unlock_labels = ["Head Rune Unlock Lv", "Right Hand Unlock Lv", "Left Hand Unlock Lv"];
    let mut unlock_row = row![].spacing(12);
    for (slot, lbl) in unlock_labels.iter().enumerate() {
        let lv = doc.get_kotei_array_i64(id, "mon_kosu_type", slot);
        unlock_row = unlock_row.push(
            row![
                text(*lbl).size(12).color(theme::TEXT_MUTED),
                text_input("0", &lv.to_string())
                    .on_input(move |v| Message::SetKoteiArrayInt(id, "mon_kosu_type", slot, v))
                    .padding(5)
                    .size(12)
                    .width(Length::Fixed(58.0))
                    .style(theme::input_style),
            ]
            .spacing(8)
            .align_y(Alignment::Center)
            .width(Length::FillPortion(1)),
        );
    }

    let equip_card = container(
        column![
            text("Equipped Runes (mon_eqp)").size(15).color(theme::ACCENT_GOLD),
            rune_row,
            unlock_row,
            Space::with_height(Length::Fixed(6.0)),
            text("Equipped Armor (bogu_eqp)").size(15).color(theme::ACCENT_GOLD),
            gear_row,
            Space::with_height(Length::Fixed(6.0)),
            row![
                text("Accessories & Battle Items (item_eqp[0..2])")
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                text("Supports Accessories (16) & Consumables (1–9)")
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ],
            acc_section,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style);

    let archetype_card = view_advanced_archetype(doc, id);

    let detail = column![
        header_card,
        row![core_card, para_card].spacing(16),
        mp_card,
        equip_card,
        archetype_card,
    ]
    .spacing(16);

    scrollable(detail)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn view_advanced_archetype<'a>(doc: &'a SaveDocument, id: usize) -> Element<'a, Message> {
    // 1. Elemental Rune Affinities (mon_zoku_aisyo[0..3] — 8 packed nibbles)
    let mut affinity_grid = column![].spacing(8);
    for pair in 0..4 {
        let mut r = row![].spacing(10);
        for offset in 0..2 {
            let elem_idx = pair * 2 + offset;
            let cur_rank = doc.get_affinity_rank(id, elem_idx);
            let selected = find_option(AFFINITY_RANKS, cur_rank);
            r = r.push(
                column![
                    text(AFFINITY_ELEMENTS[elem_idx])
                        .size(11)
                        .color(theme::TEXT_MUTED),
                    pick_list(AFFINITY_RANKS, Some(selected), move |opt| {
                        Message::SetKoteiAffinity(id, elem_idx, opt.id)
                    })
                    .text_size(11)
                    .padding([5, 7])
                    .width(Length::Fill)
                    .style(theme::pick_list_style)
                    .menu_style(theme::pick_list_menu_style),
                ]
                .spacing(3)
                .width(Length::FillPortion(1)),
            );
        }
        affinity_grid = affinity_grid.push(r);
    }

    let affinities_box = container(
        column![
            row![
                text("Elemental Rune Affinities (mon_zoku_aisyo)")
                    .size(13)
                    .color(theme::ACCENT_CYAN),
                Space::with_width(Length::Fill),
                button(text("All Rank A").size(11))
                    .padding([4, 9])
                    .style(theme::primary_button_style)
                    .on_press(Message::SetKoteiAllAffinitiesRankA(id)),
            ]
            .align_y(Alignment::Center),
            affinity_grid,
        ]
        .spacing(10),
    )
    .padding(12)
    .width(Length::FillPortion(2))
    .style(theme::empty_slot_card_style);

    // 2. Slot Locks in Menu (soubi_henkou)
    let lock_byte = doc.get_kotei_i64(id, "soubi_henkou") as u8;
    let lock_defs: [(u8, &str); 8] = [
        (0, "Lock Helmet (Bit 0)"),
        (1, "Lock Armor (Bit 1)"),
        (2, "Lock Shield (Bit 2)"),
        (3, "Lock Head Rune (Bit 3)"),
        (4, "Lock Right Hand Rune (Bit 4)"),
        (5, "Lock Left Hand Rune (Bit 5)"),
        (6, "Lock Accessories (Bit 6)"),
        (7, "Lock Weapon Rune (Bit 7)"),
    ];
    let mut lock_col = column![
        row![
            text("Slot Locks (soubi_henkou)")
                .size(13)
                .color(theme::ACCENT_CYAN),
            Space::with_width(Length::Fill),
            button(text("Unlock All (0)").size(11))
                .padding([4, 9])
                .style(theme::secondary_button_style)
                .on_press(Message::SetKoteiInt(id, "soubi_henkou", 0)),
        ]
        .align_y(Alignment::Center),
    ]
    .spacing(6);

    for &(bit, label) in &lock_defs {
        let mask = 1u8 << bit;
        lock_col = lock_col.push(
            checkbox(label, (lock_byte & mask) != 0)
                .on_toggle(move |on| Message::ToggleKoteiBit(id, "soubi_henkou", mask, on))
                .text_size(11),
        );
    }

    let locks_box = container(lock_col)
        .padding(12)
        .width(Length::FillPortion(1))
        .style(theme::empty_slot_card_style);

    // 3. Equippable Gear Classes (soubi_kanou)
    let gear_byte = doc.get_kotei_i64(id, "soubi_kanou") as u8;
    let gear_defs: [(u8, &str); 6] = [
        (0, "Heavy Helmet [E] (Bit 0)"),
        (1, "Cap / Hat [C] (Bit 1)"),
        (2, "Heavy Armor [H] (Bit 2)"),
        (3, "Light Armor [L] (Bit 3)"),
        (4, "Robe [R] (Bit 4)"),
        (5, "Shield [S] (Bit 5)"),
    ];
    let mut gear_col = column![
        row![
            text("Gear Classes (soubi_kanou)")
                .size(13)
                .color(theme::ACCENT_CYAN),
            Space::with_width(Length::Fill),
            button(text("Allow All (63)").size(11))
                .padding([4, 9])
                .style(theme::primary_button_style)
                .on_press(Message::SetKoteiInt(id, "soubi_kanou", 63)),
        ]
        .align_y(Alignment::Center),
    ]
    .spacing(6);

    for &(bit, label) in &gear_defs {
        let mask = 1u8 << bit;
        gear_col = gear_col.push(
            checkbox(label, (gear_byte & mask) != 0)
                .on_toggle(move |on| Message::ToggleKoteiBit(id, "soubi_kanou", mask, on))
                .text_size(11),
        );
    }

    let gear_box = container(gear_col)
        .padding(12)
        .width(Length::FillPortion(1))
        .style(theme::empty_slot_card_style);

    container(
        column![
            text("Advanced Archetype: Slot Locks, Gear Permissions & Elemental Affinities (c_kotei_dat)")
                .size(15)
                .color(theme::ACCENT_GOLD),
            row![affinities_box, locks_box, gear_box].spacing(12),
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn disabled_slot_badge<'a>(msg: &'a str) -> Element<'a, Message> {
    container(text(msg).size(12).color(theme::TEXT_MUTED))
        .padding([7, 10])
        .width(Length::Fill)
        .style(theme::badge_style(theme::TEXT_MUTED))
        .into()
}

fn stat_input_row<'a>(
    label: &'a str,
    value: i64,
    on_change: impl Fn(String) -> Message + 'a,
) -> Element<'a, Message> {
    row![
        text(label)
            .size(13)
            .color(theme::TEXT_MUTED)
            .width(Length::Fixed(130.0)),
        text_input("0", &value.to_string())
            .on_input(on_change)
            .padding(6)
            .size(13)
            .style(theme::input_style),
    ]
    .spacing(10)
    .align_y(Alignment::Center)
    .into()
}
