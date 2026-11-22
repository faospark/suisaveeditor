use iced::widget::{button, column, container, image, pick_list, row, scrollable, text, text_input, Space};
use iced::{Alignment, Element, Length};

use crate::data::{find_option, resolve_inventory_item, NamedOption};
use crate::gamedata::PortraitCache;
use crate::save_file::SaveDocument;
use crate::theme;
use crate::views::item_modal::ModalTarget;
use crate::Message;

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    header_portrait_id: Option<i64>,
    section: &'static str,
    key: &'static str,
    title: &'a str,
    subtitle: &'a str,
    search: &'a str,
    copied_item: Option<(i64, i64)>,
    key_item_options: Option<&'a [NamedOption]>,
    show_room_items: bool,
) -> Element<'a, Message> {
    let items = doc.get_inventory_items(section, key);
    let total = items.len();
    let occupied = items.iter().filter(|(_, item_no, _)| *item_no > 0).count();
    let first_empty = items.iter().find(|(_, item_no, _)| *item_no == 0).map(|(s, _, _)| *s);
    let q = search.trim().to_lowercase();

    let mut add_first_btn = button(text("+ Add Item to Empty Slot").size(12))
        .padding([7, 14])
        .style(theme::primary_button_style);
    if let Some(empty_slot) = first_empty {
        add_first_btn = add_first_btn.on_press(Message::OpenItemModal(
            ModalTarget::Inventory {
                section,
                key,
                slot: empty_slot,
            },
            format!("{} — Add Item", title),
            None,
        ));
    }

    let mut toolbar_row = row![
        container(
            text(format!("Occupied: {} / {} slots", occupied, total))
                .size(13)
                .color(theme::ACCENT_GOLD),
        )
        .padding([6, 12])
        .style(theme::badge_style(theme::ACCENT_GOLD)),
        text_input("Filter slots by item name or slot #...", search)
            .on_input(Message::SetInventorySearch)
            .padding(7)
            .size(12)
            .width(Length::Fixed(240.0))
            .style(theme::input_style),
        Space::with_width(Length::Fill),
    ]
    .spacing(10)
    .align_y(Alignment::Center);

    if let Some((cid, ccnt)) = copied_item {
        let (_, cname) = resolve_inventory_item(cid, ccnt);
        toolbar_row = toolbar_row.push(
            container(
                text(format!("Clipboard: {} (use: {})", cname, ccnt))
                    .size(12)
                    .color(theme::ACCENT_CYAN),
            )
            .padding([6, 10])
            .style(theme::badge_style(theme::ACCENT_CYAN)),
        );
        let mut paste_empty_btn = button(text("+ Paste to Empty").size(12))
            .padding([7, 12])
            .style(theme::secondary_button_style);
        if let Some(empty_slot) = first_empty {
            paste_empty_btn =
                paste_empty_btn.on_press(Message::PasteInventorySlot(section, key, empty_slot));
        }
        toolbar_row = toolbar_row.push(paste_empty_btn);
    }

    toolbar_row = toolbar_row.push(add_first_btn);

    let toolbar = container(toolbar_row)
        .padding(14)
        .width(Length::Fill)
        .style(theme::card_style);

    let mut rows = column![
        row![
            text("Slot")
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fixed(54.0)),
            text("Item")
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fill),
            text("ID")
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fixed(52.0)),
            text("Qty / Type")
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fixed(74.0)),
            text("Actions")
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fixed(288.0)),
        ]
        .spacing(10)
        .padding([0, 12]),
    ]
    .spacing(6);

    for (slot, item_no, use_cnt) in items {
        let is_empty = item_no == 0;
        let (cat, name) = resolve_inventory_item(item_no, use_cnt);

        if !q.is_empty()
            && !name.to_lowercase().contains(&q)
            && !(slot + 1).to_string().contains(&q)
            && !item_no.to_string().contains(&q)
        {
            continue;
        }

        let cat_color = match cat {
            "Item" => theme::ACCENT_GREEN,
            "Equip" => theme::ACCENT_CYAN,
            "Rune" => theme::ACCENT_GOLD,
            "Farm" => theme::ACCENT_GREEN,
            "Trade" => theme::ACCENT_GOLD,
            "Base" => theme::ACCENT_CYAN,
            "Food" => theme::ACCENT_GOLD,
            _ => theme::TEXT_MUTED,
        };

        let modal_title = format!("{} — Slot #{}", title, slot + 1);
        let select_btn = button(
            text(if is_empty { "+ Add Item" } else { "Change..." }).size(12),
        )
        .padding([5, 10])
        .width(Length::Fixed(96.0))
        .style(if is_empty {
            theme::primary_button_style
        } else {
            theme::secondary_button_style
        })
        .on_press(Message::OpenItemModal(
            ModalTarget::Inventory { section, key, slot },
            modal_title,
            None,
        ));

        let mut copy_btn = button(text("Copy").size(11))
            .padding([5, 8])
            .width(Length::Fixed(54.0))
            .style(theme::secondary_button_style);
        if !is_empty {
            copy_btn = copy_btn.on_press(Message::CopyInventoryItem(item_no, use_cnt));
        }

        let mut paste_btn = button(text("Paste").size(11))
            .padding([5, 8])
            .width(Length::Fixed(58.0))
            .style(theme::secondary_button_style);
        if copied_item.is_some() {
            paste_btn = paste_btn.on_press(Message::PasteInventorySlot(section, key, slot));
        }

        let mut clear_btn = button(text("Clear").size(11))
            .padding([5, 8])
            .width(Length::Fixed(56.0))
            .style(theme::secondary_button_style);
        if !is_empty {
            clear_btn = clear_btn.on_press(Message::ClearInventorySlot(section, key, slot));
        }

        let item_display = row![
            container(text(cat).size(10).color(cat_color))
                .padding([2, 7])
                .style(theme::badge_style(cat_color)),
            text(if is_empty { "Empty Slot".to_string() } else { name })
                .size(13)
                .color(if is_empty {
                    theme::TEXT_MUTED
                } else {
                    theme::TEXT_PRIMARY
                }),
        ]
        .spacing(8)
        .align_y(Alignment::Center)
        .width(Length::Fill);

        let slot_row = container(
            row![
                text(format!("#{:03}", slot + 1))
                    .size(13)
                    .color(if is_empty {
                        theme::TEXT_MUTED
                    } else {
                        theme::ACCENT_GOLD
                    })
                    .width(Length::Fixed(54.0)),
                item_display,
                text(if is_empty { "—".to_string() } else { item_no.to_string() })
                    .size(12)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(52.0)),
                text_input("0", &use_cnt.to_string())
                    .on_input(move |v| Message::SetInventoryField(section, key, slot, "use_cnt", v))
                    .padding(5)
                    .size(12)
                    .width(Length::Fixed(74.0))
                    .style(theme::input_style),
                row![select_btn, copy_btn, paste_btn, clear_btn]
                    .spacing(6)
                    .width(Length::Fixed(288.0)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        )
        .padding([7, 12])
        .width(Length::Fill)
        .style(if is_empty {
            theme::empty_slot_card_style
        } else {
            theme::card_style
        });

        rows = rows.push(slot_row);
    }

    let mut title_row = row![].spacing(12).align_y(Alignment::Center);
    if let Some(pid) = header_portrait_id {
        if let Some(handle) = portraits.get(pid) {
            title_row = title_row.push(image(handle).width(50).height(50));
        }
    }
    title_row = title_row.push(
        column![
            text(title).size(22).color(theme::TEXT_PRIMARY),
            text(subtitle).size(13).color(theme::TEXT_MUTED),
        ]
        .spacing(4),
    );

    let mut content = column![title_row]
        .spacing(14)
        .padding(24);

    if let Some(opts) = key_item_options {
        let mut key_grid = column![
            text("Key Items (party_data.event_item[0..5])")
                .size(15)
                .color(theme::ACCENT_GOLD),
        ]
        .spacing(8);

        for row_idx in 0..3 {
            let mut r = row![].spacing(12);
            for col_idx in 0..2 {
                let slot = row_idx * 2 + col_idx;
                let cur_id = doc.get_array_i64(Some("party_data"), "event_item", slot);
                let selected = find_option(opts, cur_id);
                r = r.push(
                    row![
                        text(format!("Key Slot {}", slot + 1))
                            .size(12)
                            .color(theme::TEXT_MUTED)
                            .width(Length::Fixed(72.0)),
                        pick_list(opts, Some(selected), move |opt| {
                            Message::SetArrayIntField(
                                Some("party_data"),
                                "event_item",
                                slot,
                                opt.id.to_string(),
                            )
                        })
                        .text_size(12)
                        .padding([5, 8])
                        .width(Length::Fill)
                        .style(theme::pick_list_style)
                        .menu_style(theme::pick_list_menu_style),
                    ]
                    .spacing(8)
                    .align_y(Alignment::Center)
                    .width(Length::FillPortion(1)),
                );
            }
            key_grid = key_grid.push(r);
        }

        content = content.push(
            container(key_grid)
                .padding(16)
                .width(Length::Fill)
                .style(theme::card_style),
        );
    }

    content = content.push(toolbar).push(rows);

    if show_room_items {
        let room_items = doc.get_inventory_items("game_data", "room_item");
        let mut room_col = column![
            row![
                text(format!("Room Items (game_data.room_item — {} slots)", room_items.len()))
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                container(text("Experimental / Unused in-game").size(11).color(theme::ACCENT_RED))
                    .padding([3, 8])
                    .style(theme::badge_style(theme::ACCENT_RED)),
            ]
            .align_y(Alignment::Center),
        ]
        .spacing(6);

        for (slot, item_no, use_cnt) in room_items {
            let is_empty = item_no == 0;
            let (_, name) = resolve_inventory_item(item_no, use_cnt);
            let target = ModalTarget::Inventory {
                section: "game_data",
                key: "room_item",
                slot,
            };
            room_col = room_col.push(
                row![
                    text(format!("Room #{:02}", slot + 1))
                        .size(12)
                        .color(theme::TEXT_MUTED)
                        .width(Length::Fixed(72.0)),
                    text(if is_empty { "Empty Slot".to_string() } else { name })
                        .size(13)
                        .color(if is_empty { theme::TEXT_MUTED } else { theme::TEXT_PRIMARY })
                        .width(Length::Fill),
                    button(text(if is_empty { "+ Add Item" } else { "Change..." }).size(11))
                        .padding([4, 10])
                        .style(if is_empty {
                            theme::primary_button_style
                        } else {
                            theme::secondary_button_style
                        })
                        .on_press(Message::OpenItemModal(
                            target,
                            format!("Room Items — Slot #{}", slot + 1),
                            None,
                        )),
                    button(text("Clear").size(11))
                        .padding([4, 8])
                        .style(theme::secondary_button_style)
                        .on_press(Message::ClearInventorySlot("game_data", "room_item", slot)),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
            );
        }

        content = content.push(
            container(room_col)
                .padding(16)
                .width(Length::Fill)
                .style(theme::card_style),
        );
    }

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}
