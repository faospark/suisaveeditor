use iced::widget::{button, column, container, row, scrollable, text, text_input, Space};
use iced::{Alignment, Element, Length};

use crate::data::rules::{armor_attrs, character_attrs, helmet_attrs, rune_attrs};
use crate::data::{
    base_item_name, character_name, equipment_name, farming_item_name, food_item_name,
    regular_item_name, rune_name, trade_item_name, ACCESSORIES, ARMORS, HELMETS, RUNES, SHIELDS,
};
use crate::theme;
use crate::Message;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum DataValuesCategory {
    #[default]
    Characters,
    Items,
    Farming,
    Trade,
    BaseItems,
    Food,
    Runes,
    Helmets,
    Armors,
    Shields,
    Accessories,
}

impl DataValuesCategory {
    pub const ALL: &'static [DataValuesCategory] = &[
        DataValuesCategory::Characters,
        DataValuesCategory::Items,
        DataValuesCategory::Farming,
        DataValuesCategory::Trade,
        DataValuesCategory::BaseItems,
        DataValuesCategory::Food,
        DataValuesCategory::Runes,
        DataValuesCategory::Helmets,
        DataValuesCategory::Armors,
        DataValuesCategory::Shields,
        DataValuesCategory::Accessories,
    ];

    pub fn label(self) -> &'static str {
        match self {
            DataValuesCategory::Characters => "CHARACTERS",
            DataValuesCategory::Items => "ITEMS",
            DataValuesCategory::Farming => "FARMING",
            DataValuesCategory::Trade => "TRADE",
            DataValuesCategory::BaseItems => "BASE_ITEM",
            DataValuesCategory::Food => "FOOD",
            DataValuesCategory::Runes => "RUNES",
            DataValuesCategory::Helmets => "HELMET",
            DataValuesCategory::Armors => "ARMOR",
            DataValuesCategory::Shields => "SHIELD",
            DataValuesCategory::Accessories => "OTHER_EQUIP_GEAR",
        }
    }

    pub fn info(self) -> &'static str {
        match self {
            DataValuesCategory::Characters => "Character names & equipment attributes by index (1–169)",
            DataValuesCategory::Items => "Regular & consumable items (use_cnt: 0–9)",
            DataValuesCategory::Farming => "Farm seeds & livestock (use_cnt: 48)",
            DataValuesCategory::Trade => "Trade goods & bath antiques (use_cnt: 64)",
            DataValuesCategory::BaseItems => "Warehouse / castle base items (use_cnt: 80)",
            DataValuesCategory::Food => "Cooked dishes & Hai Yo restaurant menu items (use_cnt: 96+)",
            DataValuesCategory::Runes => "Rune orbs & slot/character attributes (use_cnt: 32)",
            DataValuesCategory::Helmets => "Helmets & caps (use_cnt: 16)",
            DataValuesCategory::Armors => "Armors, robes & vests (use_cnt: 16)",
            DataValuesCategory::Shields => "Shields (use_cnt: 16)",
            DataValuesCategory::Accessories => "Accessories & footwear (use_cnt: 16)",
        }
    }
}

pub fn view<'a>(category: DataValuesCategory, search: &'a str) -> Element<'a, Message> {
    let q = search.trim().to_lowercase();

    // Two clean rows of category buttons (6 per row)
    let mut cat_grid = column![].spacing(6);
    for chunk in DataValuesCategory::ALL.chunks(6) {
        let mut r = row![].spacing(6);
        for &cat in chunk {
            r = r.push(
                button(text(cat.label()).size(11))
                    .padding([6, 10])
                    .width(Length::FillPortion(1))
                    .style(theme::nav_button_style(cat == category))
                    .on_press(Message::SelectDataValuesCategory(cat)),
            );
        }
        for _ in chunk.len()..6 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        cat_grid = cat_grid.push(r);
    }

    let entries: Vec<(i64, String, String)> = match category {
        DataValuesCategory::Characters => (1..=169)
            .map(|id| {
                let attrs = character_attrs(id);
                let attr_str = if attrs.is_empty() {
                    String::new()
                } else {
                    format!("[{}]", attrs.join(", "))
                };
                (id, character_name(id).to_string(), attr_str)
            })
            .collect(),
        DataValuesCategory::Items => (0..=85)
            .map(|id| (id, regular_item_name(id).to_string(), String::new()))
            .collect(),
        DataValuesCategory::Farming => (0..=8)
            .map(|id| (id, farming_item_name(id).to_string(), String::new()))
            .collect(),
        DataValuesCategory::Trade => (0..=50)
            .map(|id| (id, trade_item_name(id).to_string(), String::new()))
            .collect(),
        DataValuesCategory::BaseItems => (0..=66)
            .map(|id| (id, base_item_name(id).to_string(), String::new()))
            .collect(),
        DataValuesCategory::Food => (0..=240)
            .map(|id| (id, food_item_name(id).to_string(), String::new()))
            .collect(),
        DataValuesCategory::Runes => RUNES
            .iter()
            .map(|o| {
                let attrs = rune_attrs(o.id);
                let attr_str = if attrs.is_empty() {
                    String::new()
                } else {
                    format!("[{}]", attrs.join(", "))
                };
                (o.id, rune_name(o.id).to_string(), attr_str)
            })
            .collect(),
        DataValuesCategory::Helmets => HELMETS
            .iter()
            .map(|o| {
                let attrs = helmet_attrs(o.id);
                let attr_str = if attrs.is_empty() {
                    String::new()
                } else {
                    format!("[{}]", attrs.join(", "))
                };
                (o.id, equipment_name(o.id).to_string(), attr_str)
            })
            .collect(),
        DataValuesCategory::Armors => ARMORS
            .iter()
            .map(|o| {
                let attrs = armor_attrs(o.id);
                let attr_str = if attrs.is_empty() {
                    String::new()
                } else {
                    format!("[{}]", attrs.join(", "))
                };
                (o.id, equipment_name(o.id).to_string(), attr_str)
            })
            .collect(),
        DataValuesCategory::Shields => SHIELDS
            .iter()
            .map(|o| (o.id, equipment_name(o.id).to_string(), String::new()))
            .collect(),
        DataValuesCategory::Accessories => ACCESSORIES
            .iter()
            .map(|o| (o.id, equipment_name(o.id).to_string(), String::new()))
            .collect(),
    };

    let filtered: Vec<_> = entries
        .into_iter()
        .filter(|(id, name, attrs)| {
            q.is_empty()
                || id.to_string().contains(&q)
                || name.to_lowercase().contains(&q)
                || attrs.to_lowercase().contains(&q)
        })
        .collect();

    let toolbar = container(
        column![
            cat_grid,
            row![
                text_input("Search reference data by ID, name, or attribute...", search)
                    .on_input(Message::SetDataValuesSearch)
                    .padding(7)
                    .size(12)
                    .width(Length::Fixed(340.0))
                    .style(theme::input_style),
                Space::with_width(Length::Fill),
                container(
                    text(format!("{} — {} entries", category.info(), filtered.len()))
                        .size(12)
                        .color(theme::ACCENT_CYAN),
                )
                .padding([5, 10])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
            ]
            .spacing(12)
            .align_y(Alignment::Center),
        ]
        .spacing(10),
    )
    .padding(14)
    .width(Length::Fill)
    .style(theme::card_style);

    let mut grid = column![].spacing(6);
    for chunk in filtered.chunks(3) {
        let mut r = row![].spacing(8);
        for (id, name, attrs) in chunk {
            let mut item_row = row![
                text(format!("{}:", id))
                    .size(12)
                    .color(theme::ACCENT_GOLD)
                    .width(Length::Fixed(38.0)),
                text(name.clone())
                    .size(13)
                    .color(theme::TEXT_PRIMARY)
                    .width(Length::Fill),
            ]
            .spacing(6)
            .align_y(Alignment::Center);

            if !attrs.is_empty() {
                item_row = item_row.push(text(attrs.clone()).size(11).color(theme::TEXT_MUTED));
            }

            r = r.push(
                container(item_row)
                    .padding([7, 10])
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
            text("Reference Data Values").size(22).color(theme::TEXT_PRIMARY),
            text("Item IDs, character names, equipment attributes, and use_cnt classifications (always available without loading a save).")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        toolbar,
        grid,
    ]
    .spacing(14)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}
