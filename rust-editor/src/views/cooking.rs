use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::data::catalog::{INGREDIENTS, RECIPE_DISH_NAMES, RECIPE_LOCATIONS};
use crate::data::{find_option, NamedOption};
use crate::gamedata::PortraitCache;
use crate::save_file::SaveDocument;
use crate::theme;
use crate::Message;

const COOK_OFF_STAGES: [(usize, &str, u8, u8); 13] = [
    (0, "0 - No matches won", 0, 32),
    (1, "1 - Ky Yun", 1, 32),
    (2, "2 - Goetsu", 3, 32),
    (3, "3 - Shinki", 7, 32),
    (4, "4 - Ryuki", 15, 32),
    (5, "5 - Bashok", 31, 32),
    (6, "6 - Ryuko", 63, 32),
    (7, "7 - Antonio", 127, 32),
    (8, "8 - Gyokuran", 255, 32),
    (9, "9 - Retso (Round 1)", 255, 33),
    (10, "10 - Lester", 255, 35),
    (11, "11 - Retso (Round 2)", 255, 39),
    (12, "12 - Jinkai (Complete)", 255, 47),
];

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    food_options: &'a [NamedOption],
) -> Element<'a, Message> {
    let cook_off_card = view_cook_off(doc);
    let ingredients_card = view_ingredients(doc);
    let menu_card = view_restaurant_menu(doc, food_options);
    let recipes_card = view_recipes(doc);

    let mut header_row = row![].spacing(12).align_y(Alignment::Center);
    if let Some(handle) = portraits.get(66) {
        header_row = header_row.push(image(handle).width(52).height(52));
    }
    header_row = header_row.push(
        column![
            text("Cooking & Hai Yo's Restaurant")
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text("Cook-Off progress, Hai Yo's 12 kitchen ingredients, restaurant menu, and 40 named recipes.")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
    );

    let content = column![
        header_row,
        cook_off_card,
        row![
            container(ingredients_card).width(Length::FillPortion(1)),
            container(menu_card).width(Length::FillPortion(1)),
        ]
        .spacing(16),
        recipes_card,
    ]
    .spacing(16)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn view_cook_off<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let b1 = doc.get_event_flag(152);
    let b2 = doc.get_event_flag(153);

    // Mask out non-battle bits in event_flag[153] (bits 0..3 are battles 9..12; bit 5 is system active)
    let b2_battles = b2 & 0x0F;
    let won_count = (b1.count_ones() + b2_battles.count_ones()) as usize;

    // Determine highest contiguous stage reached (0..=12)
    let current_stage = COOK_OFF_STAGES
        .iter()
        .rev()
        .find(|&&(_, _, f1, f2)| (b1 & f1) == f1 && (b2_battles & (f2 & 0x0F)) == (f2 & 0x0F))
        .map(|&(s, _, _, _)| s)
        .unwrap_or(0);

    let is_complete = won_count >= 12;
    let progress_color = if is_complete {
        theme::ACCENT_GREEN
    } else if won_count > 0 {
        theme::ACCENT_GOLD
    } else {
        theme::TEXT_MUTED
    };

    let progress_text = if is_complete {
        "12 / 12 Battles Won (Complete)".to_string()
    } else if let Some(&(_, next_label, _, _)) = COOK_OFF_STAGES.get(current_stage + 1) {
        format!("{} / 12 Won  •  Next: {}", won_count, next_label)
    } else {
        format!("{} / 12 Won", won_count)
    };

    let mut stage_rows = column![].spacing(6);
    for chunk in COOK_OFF_STAGES.chunks(4) {
        let mut r = row![].spacing(8);
        for &(stage, label, f1, f2) in chunk {
            let is_current = stage == current_stage;
            let is_defeated = stage > 0 && stage <= current_stage;
            let prefix = if stage == 0 {
                if current_stage == 0 { "[*]" } else { "   " }
            } else if is_defeated {
                "[v]"
            } else {
                "[ ]"
            };
            let btn_label = format!("{} {}", prefix, label);
            let btn_style: fn(&iced::Theme, button::Status) -> button::Style = if is_current {
                theme::primary_button_style
            } else {
                theme::secondary_button_style
            };

            let content: Element<'a, Message> = if is_current {
                text(btn_label).size(12).into()
            } else if is_defeated {
                text(btn_label).size(12).color(theme::ACCENT_GREEN).into()
            } else {
                text(btn_label).size(12).color(theme::TEXT_MUTED).into()
            };

            r = r.push(
                button(content)
                    .padding([7, 10])
                    .width(Length::FillPortion(1))
                    .style(btn_style)
                    .on_press(Message::SetCookOffStage(f1, (b2 & 0xF0) | (f2 & 0x0F))),
            );
        }
        for _ in chunk.len()..4 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        stage_rows = stage_rows.push(r);
    }

    container(
        column![
            row![
                text("Cook-Off Battles Won").size(15).color(theme::ACCENT_GOLD),
                container(text(progress_text).size(11).color(progress_color))
                    .padding([3, 9])
                    .style(theme::badge_style(progress_color)),
                Space::with_width(Length::Fill),
                text(format!("event_flag[152] = {}, event_flag[153] = {}", b1, b2))
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            stage_rows,
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_ingredients<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let mut grid = column![].spacing(8);
    for chunk in (0..12).collect::<Vec<_>>().chunks(2) {
        let mut r = row![].spacing(10);
        for &idx in chunk {
            let val = doc.get_array_i64(Some("game_data"), "food_num", idx);
            r = r.push(
                row![
                    text(INGREDIENTS[idx])
                        .size(13)
                        .color(theme::TEXT_PRIMARY)
                        .width(Length::Fill),
                    text_input("0", &val.to_string())
                        .on_input(move |v| Message::SetArrayIntField(
                            Some("game_data"),
                            "food_num",
                            idx,
                            v
                        ))
                        .padding(5)
                        .size(13)
                        .width(Length::Fixed(58.0))
                        .style(theme::input_style),
                ]
                .spacing(8)
                .align_y(Alignment::Center)
                .width(Length::FillPortion(1)),
            );
        }
        grid = grid.push(r);
    }

    container(
        column![
            row![
                text("Hai Yo's Ingredient Stock (Max 3)")
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                button(text("Max All (3/3)").size(11))
                    .padding([5, 10])
                    .style(theme::primary_button_style)
                    .on_press(Message::MaxAllIngredients),
            ]
            .align_y(Alignment::Center),
            grid,
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_restaurant_menu<'a>(
    doc: &'a SaveDocument,
    food_options: &'a [NamedOption],
) -> Element<'a, Message> {
    let mut col = column![
        text("Castle Restaurant Menu (food_menu[0..6])")
            .size(15)
            .color(theme::ACCENT_GOLD),
        text("Dishes served in Hai Yo's restaurant (0 = empty slot).")
            .size(12)
            .color(theme::TEXT_MUTED),
    ]
    .spacing(8);

    for slot in 0..7 {
        let val = doc.get_array_i64(Some("game_data"), "food_menu", slot);
        let selected = find_option(food_options, val);
        col = col.push(
            row![
                text(format!("Menu Slot {}", slot + 1))
                    .size(13)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(92.0)),
                pick_list(food_options, Some(selected), move |opt| {
                    Message::SetArrayIntField(
                        Some("game_data"),
                        "food_menu",
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
            .spacing(10)
            .align_y(Alignment::Center),
        );
    }

    container(col)
        .padding(16)
        .width(Length::Fill)
        .style(theme::card_style)
        .into()
}

fn view_recipes<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let mut known_count = 0usize;
    for recipe_idx in 0..40 {
        let byte_idx = recipe_idx / 8;
        let mask = 1u8 << (recipe_idx % 8);
        let byte_val = doc.get_array_i64(Some("game_data"), "food_resipi", byte_idx) as u8;
        if (byte_val & mask) != 0 {
            known_count += 1;
        }
    }

    let mut grid = column![].spacing(8);
    let indices: Vec<usize> = (0..40).collect();
    for chunk in indices.chunks(3) {
        let mut r = row![].spacing(10);
        for &recipe_idx in chunk {
            let byte_idx = recipe_idx / 8;
            let mask = 1u8 << (recipe_idx % 8);
            let byte_val = doc.get_array_i64(Some("game_data"), "food_resipi", byte_idx) as u8;
            let checked = (byte_val & mask) != 0;
            let label = format!("#{:02} {}", recipe_idx + 1, RECIPE_DISH_NAMES[recipe_idx]);

            r = r.push(
                container(
                    column![
                        checkbox(label, checked)
                            .on_toggle(move |val| {
                                Message::ToggleArrayFlagBit(
                                    Some("game_data"),
                                    "food_resipi",
                                    byte_idx,
                                    mask,
                                    val,
                                )
                            })
                            .text_size(12),
                        text(RECIPE_LOCATIONS[recipe_idx])
                            .size(10)
                            .color(theme::TEXT_MUTED),
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
        column![
            row![
                text(format!("Known Cooking Recipes ({} / 40)", known_count))
                    .size(15)
                    .color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                button(text("Unlock All 40").size(11))
                    .padding([5, 10])
                    .style(theme::primary_button_style)
                    .on_press(Message::UnlockAllRecipes),
            ]
            .align_y(Alignment::Center),
            grid,
        ]
        .spacing(12),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}
