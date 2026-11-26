use iced::widget::{
    button, column, container, horizontal_rule, mouse_area, row, text, Space,
};
use iced::{Alignment, Element, Length};

use crate::theme;
use crate::Message;

#[derive(Debug, Clone)]
pub struct NotificationModalState {
    pub badge: String,
    pub title: String,
    pub message: String,
    pub detail: Option<String>,
    pub is_error: bool,
}

impl NotificationModalState {
    pub fn success(
        badge: impl Into<String>,
        title: impl Into<String>,
        message: impl Into<String>,
        detail: Option<String>,
    ) -> Self {
        Self {
            badge: badge.into(),
            title: title.into(),
            message: message.into(),
            detail,
            is_error: false,
        }
    }

    pub fn error(
        badge: impl Into<String>,
        title: impl Into<String>,
        message: impl Into<String>,
    ) -> Self {
        Self {
            badge: badge.into(),
            title: title.into(),
            message: message.into(),
            detail: None,
            is_error: true,
        }
    }
}

pub fn view<'a>(modal: &'a NotificationModalState) -> Element<'a, Message> {
    let badge_color = if modal.is_error {
        theme::ACCENT_RED
    } else {
        theme::ACCENT_GREEN
    };

    let mut body = column![
        row![
            container(text(&modal.badge).size(11).color(badge_color))
                .padding([3, 8])
                .style(theme::badge_style(badge_color)),
            text(&modal.title).size(18).color(theme::TEXT_PRIMARY),
            Space::with_width(Length::Fill),
            button(text(crate::i18n::tr("close")).size(12))
                .padding([6, 12])
                .style(theme::secondary_button_style)
                .on_press(Message::CloseNotificationModal),
        ]
        .spacing(10)
        .align_y(Alignment::Center),
        horizontal_rule(1),
        text(&modal.message).size(13).color(theme::TEXT_MUTED),
    ]
    .spacing(14);

    if let Some(detail) = &modal.detail {
        body = body.push(
            container(text(detail).size(12).color(theme::TEXT_PRIMARY))
                .padding(12)
                .width(Length::Fill)
                .style(theme::empty_slot_card_style),
        );
    }

    let card = container(body)
        .padding(24)
        .max_width(540)
        .style(theme::modal_card_style);

    let modal_layer = container(mouse_area(card).on_press(Message::NoOp))
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .style(theme::modal_backdrop_style);

    mouse_area(modal_layer)
        .on_press(Message::CloseNotificationModal)
        .into()
}
