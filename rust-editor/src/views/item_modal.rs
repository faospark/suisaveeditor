use iced::widget::{
    button, column, container, horizontal_rule, mouse_area, row, scrollable, text, text_input,
    Space,
};
use iced::{Alignment, Element, Length};

use crate::data::rules::ItemCategory;
use crate::theme;
use crate::Message;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModalTarget {
    Inventory {
        section: &'static str,
        key: &'static str,
        slot: usize,
    },
    BattleCharItem {
        char_id: usize,
        slot: usize,
    },
}

#[derive(Debug, Clone)]
pub struct ItemModalState {
    pub target: ModalTarget,
    pub title: String,
    pub category: Option<ItemCategory>, // None = All
    pub search: String,
}

pub fn view<'a>(modal: &'a ItemModalState) -> Element<'a, Message> {
    let q = modal.search.trim().to_lowercase();

    let mut cat_tabs = row![
        button(text("All").size(12))
            .padding([6, 10])
            .style(theme::nav_button_style(modal.category.is_none()))
            .on_press(Message::SetModalCategory(None)),
    ]
    .spacing(5);

    for &cat in ItemCategory::ALL {
        let active = modal.category == Some(cat);
        cat_tabs = cat_tabs.push(
            button(text(cat.to_string()).size(12))
                .padding([6, 8])
                .style(theme::nav_button_style(active))
                .on_press(Message::SetModalCategory(Some(cat))),
        );
    }

    let categories_to_scan: Vec<ItemCategory> = match modal.category {
        Some(c) => vec![c],
        None => ItemCategory::ALL.to_vec(),
    };

    let mut matches: Vec<(ItemCategory, i64, &'static str, i64)> = Vec::new();
    for cat in categories_to_scan {
        let default_cnt = cat.default_use_cnt();
        for opt in cat.options() {
            if opt.id == 0 {
                continue;
            }
            if !q.is_empty()
                && !opt.name.to_lowercase().contains(&q)
                && !opt.id.to_string().contains(&q)
            {
                continue;
            }
            matches.push((cat, opt.id, opt.name, default_cnt));
        }
    }

    let target = modal.target;
    let slot_num = match target {
        ModalTarget::Inventory { slot, .. } => slot + 1,
        ModalTarget::BattleCharItem { slot, .. } => slot + 1,
    };

    let mut list = column![].spacing(6);
    for (cat, item_id, name, use_cnt) in matches.iter().copied() {
        let cat_color = match cat {
            ItemCategory::Item => theme::ACCENT_GREEN,
            ItemCategory::Equip => theme::ACCENT_CYAN,
            ItemCategory::Rune => theme::ACCENT_GOLD,
            ItemCategory::Farm => theme::ACCENT_GREEN,
            ItemCategory::Trade => theme::ACCENT_GOLD,
            ItemCategory::Base => theme::ACCENT_CYAN,
            ItemCategory::Food => theme::ACCENT_GOLD,
        };

        let item_btn = button(
            row![
                text(format!("#{:03}", item_id))
                    .size(12)
                    .color(theme::ACCENT_GOLD)
                    .width(Length::Fixed(48.0)),
                text(name)
                    .size(13)
                    .color(theme::TEXT_PRIMARY)
                    .width(Length::Fill),
                container(text(cat.to_string()).size(10).color(cat_color))
                    .padding([2, 8])
                    .style(theme::badge_style(cat_color)),
                text(format!("use_cnt: {}", use_cnt))
                    .size(11)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(78.0)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        )
        .width(Length::Fill)
        .padding([8, 12])
        .style(theme::secondary_button_style)
        .on_press(Message::ApplyModalItem(target, item_id, use_cnt));

        list = list.push(item_btn);
    }

    if matches.is_empty() {
        list = list.push(
            container(
                text("No items match your search.")
                    .size(13)
                    .color(theme::TEXT_MUTED),
            )
            .padding(24)
            .center_x(Length::Fill),
        );
    }

    let dialog = container(
        column![
            row![
                column![
                    text(&modal.title).size(18).color(theme::ACCENT_GOLD),
                    text(format!(
                        "Select an item for Slot #{} • {} items available",
                        slot_num,
                        matches.len()
                    ))
                    .size(12)
                    .color(theme::TEXT_MUTED),
                ]
                .spacing(2),
                Space::with_width(Length::Fill),
                button(text("Close").size(12))
                    .padding([6, 12])
                    .style(theme::secondary_button_style)
                    .on_press(Message::CloseItemModal),
            ]
            .align_y(Alignment::Center),
            horizontal_rule(1),
            text_input(
                "Search item by name or ID (e.g. Medicine, Winged Boots, Power Gloves)...",
                &modal.search
            )
            .on_input(Message::SetModalSearch)
            .padding(9)
            .size(13)
            .style(theme::input_style),
            cat_tabs,
            scrollable(list)
                .height(Length::Fixed(380.0))
                .style(theme::scrollable_style),
            horizontal_rule(1),
            row![
                button(text("Clear Slot (Set Empty)").size(12))
                    .padding([7, 14])
                    .style(theme::secondary_button_style)
                    .on_press(Message::ApplyModalItem(target, 0, 0)),
                Space::with_width(Length::Fill),
                button(text("Cancel").size(12))
                    .padding([7, 14])
                    .style(theme::secondary_button_style)
                    .on_press(Message::CloseItemModal),
            ]
            .align_y(Alignment::Center),
        ]
        .spacing(12),
    )
    .padding(20)
    .width(Length::Fixed(760.0))
    .style(theme::modal_card_style);

    let modal_layer = container(mouse_area(dialog).on_press(Message::NoOp))
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .style(theme::modal_backdrop_style);

    mouse_area(modal_layer)
        .on_press(Message::CloseItemModal)
        .into()
}
