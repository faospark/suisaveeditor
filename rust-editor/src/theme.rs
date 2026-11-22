use iced::overlay::menu;
use iced::widget::{button, container, pick_list, scrollable, text_input};
use iced::{Background, Border, Color, Shadow, Theme, Vector};

/// Suikoden II HD Remaster inspired dark palette
pub const BG_BASE: Color = Color::from_rgb(0.055, 0.067, 0.090);       // #0E1117
pub const BG_SIDEBAR: Color = Color::from_rgb(0.075, 0.090, 0.125);    // #131720
pub const BG_SURFACE: Color = Color::from_rgb(0.094, 0.114, 0.157);    // #181D28
pub const BG_ELEVATED: Color = Color::from_rgb(0.125, 0.153, 0.208);   // #202735
pub const BORDER_SUBTLE: Color = Color::from_rgb(0.173, 0.208, 0.282); // #2C3548
pub const BORDER_GOLD: Color = Color::from_rgb(0.720, 0.560, 0.160);   // #B88F29

pub const TEXT_PRIMARY: Color = Color::from_rgb(0.945, 0.961, 0.976);  // #F1F5F9
pub const TEXT_MUTED: Color = Color::from_rgb(0.580, 0.639, 0.722);    // #94A3B8

pub const ACCENT_GOLD: Color = Color::from_rgb(0.941, 0.725, 0.043);   // #F0B90B
pub const ACCENT_CYAN: Color = Color::from_rgb(0.220, 0.741, 0.973);   // #38BDF8
pub const ACCENT_GREEN: Color = Color::from_rgb(0.133, 0.773, 0.369);  // #22C55E
pub const ACCENT_RED: Color = Color::from_rgb(0.937, 0.267, 0.267);    // #EF4444

pub fn app_theme() -> Theme {
    Theme::custom(
        "Suikoden Dark".to_string(),
        iced::theme::Palette {
            background: BG_BASE,
            text: TEXT_PRIMARY,
            primary: ACCENT_GOLD,
            success: ACCENT_GREEN,
            danger: ACCENT_RED,
        },
    )
}

pub fn top_bar_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(BG_SIDEBAR)),
        border: Border {
            color: BORDER_SUBTLE,
            width: 1.0,
            radius: 0.0.into(),
        },
        ..Default::default()
    }
}

pub fn sidebar_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(BG_SIDEBAR)),
        border: Border {
            color: BORDER_SUBTLE,
            width: 1.0,
            radius: 0.0.into(),
        },
        ..Default::default()
    }
}

pub fn card_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(BG_SURFACE)),
        border: Border {
            color: BORDER_SUBTLE,
            width: 1.0,
            radius: 10.0.into(),
        },
        shadow: Shadow {
            color: Color::from_rgba(0.0, 0.0, 0.0, 0.35),
            offset: Vector::new(0.0, 4.0),
            blur_radius: 12.0,
        },
        ..Default::default()
    }
}

pub fn portrait_card_style(is_convoy: bool) -> impl Fn(&Theme) -> container::Style {
    move |_theme| container::Style {
        background: Some(Background::Color(BG_ELEVATED)),
        border: Border {
            color: if is_convoy { BORDER_SUBTLE } else { BORDER_GOLD },
            width: 1.0,
            radius: 8.0.into(),
        },
        ..Default::default()
    }
}

pub fn badge_style(color: Color) -> impl Fn(&Theme) -> container::Style {
    move |_theme| container::Style {
        background: Some(Background::Color(Color { a: 0.16, ..color })),
        border: Border {
            color: Color { a: 0.45, ..color },
            width: 1.0,
            radius: 6.0.into(),
        },
        ..Default::default()
    }
}

pub fn nav_button_style(active: bool) -> impl Fn(&Theme, button::Status) -> button::Style {
    move |_theme, status| {
        let bg = if active {
            Color { a: 0.18, ..ACCENT_GOLD }
        } else {
            match status {
                button::Status::Hovered => BG_ELEVATED,
                button::Status::Pressed => Color { a: 0.10, ..ACCENT_GOLD },
                _ => Color::TRANSPARENT,
            }
        };

        button::Style {
            background: Some(Background::Color(bg)),
            text_color: if active { ACCENT_GOLD } else { TEXT_PRIMARY },
            border: Border {
                color: if active { BORDER_GOLD } else { Color::TRANSPARENT },
                width: if active { 1.0 } else { 0.0 },
                radius: 7.0.into(),
            },
            ..Default::default()
        }
    }
}

pub fn primary_button_style(_theme: &Theme, status: button::Status) -> button::Style {
    let bg = match status {
        button::Status::Disabled => Color::from_rgb(0.22, 0.25, 0.30),
        button::Status::Hovered => Color::from_rgb(0.98, 0.80, 0.18),
        button::Status::Pressed => Color::from_rgb(0.80, 0.60, 0.03),
        button::Status::Active => ACCENT_GOLD,
    };

    button::Style {
        background: Some(Background::Color(bg)),
        text_color: if matches!(status, button::Status::Disabled) {
            TEXT_MUTED
        } else {
            Color::from_rgb(0.06, 0.07, 0.10)
        },
        border: Border {
            color: Color::TRANSPARENT,
            width: 0.0,
            radius: 7.0.into(),
        },
        ..Default::default()
    }
}

pub fn secondary_button_style(_theme: &Theme, status: button::Status) -> button::Style {
    let bg = match status {
        button::Status::Disabled => Color::from_rgb(0.11, 0.13, 0.18),
        button::Status::Hovered => Color::from_rgb(0.18, 0.22, 0.30),
        button::Status::Pressed => Color::from_rgb(0.14, 0.17, 0.24),
        button::Status::Active => BG_ELEVATED,
    };

    button::Style {
        background: Some(Background::Color(bg)),
        text_color: if matches!(status, button::Status::Disabled) {
            TEXT_MUTED
        } else {
            TEXT_PRIMARY
        },
        border: Border {
            color: BORDER_SUBTLE,
            width: 1.0,
            radius: 7.0.into(),
        },
        ..Default::default()
    }
}

pub fn input_style(_theme: &Theme, status: text_input::Status) -> text_input::Style {
    let border_color = match status {
        text_input::Status::Focused => ACCENT_GOLD,
        text_input::Status::Hovered => Color::from_rgb(0.30, 0.36, 0.48),
        _ => BORDER_SUBTLE,
    };

    text_input::Style {
        background: Background::Color(BG_BASE),
        border: Border {
            color: border_color,
            width: 1.0,
            radius: 6.0.into(),
        },
        icon: TEXT_MUTED,
        placeholder: TEXT_MUTED,
        value: TEXT_PRIMARY,
        selection: Color { a: 0.35, ..ACCENT_GOLD },
    }
}

pub fn pick_list_style(_theme: &Theme, status: pick_list::Status) -> pick_list::Style {
    let border_color = match status {
        pick_list::Status::Opened => ACCENT_GOLD,
        pick_list::Status::Hovered => Color::from_rgb(0.30, 0.36, 0.48),
        pick_list::Status::Active => BORDER_SUBTLE,
    };

    pick_list::Style {
        text_color: TEXT_PRIMARY,
        placeholder_color: TEXT_MUTED,
        handle_color: ACCENT_GOLD,
        background: Background::Color(BG_BASE),
        border: Border {
            color: border_color,
            width: 1.0,
            radius: 6.0.into(),
        },
    }
}

pub fn pick_list_menu_style(_theme: &Theme) -> menu::Style {
    menu::Style {
        background: Background::Color(BG_SURFACE),
        border: Border {
            color: BORDER_GOLD,
            width: 1.0,
            radius: 6.0.into(),
        },
        text_color: TEXT_PRIMARY,
        selected_text_color: Color::from_rgb(0.06, 0.07, 0.10),
        selected_background: Background::Color(ACCENT_GOLD),
    }
}

pub fn modal_backdrop_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(Color::from_rgba(0.02, 0.03, 0.05, 0.78))),
        ..Default::default()
    }
}

pub fn modal_card_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(BG_SURFACE)),
        border: Border {
            color: BORDER_GOLD,
            width: 1.5,
            radius: 12.0.into(),
        },
        shadow: Shadow {
            color: Color::from_rgba(0.0, 0.0, 0.0, 0.65),
            offset: Vector::new(0.0, 10.0),
            blur_radius: 28.0,
        },
        ..Default::default()
    }
}

pub fn empty_slot_card_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(Color::from_rgba(0.094, 0.114, 0.157, 0.45))),
        border: Border {
            color: BORDER_SUBTLE,
            width: 1.0,
            radius: 8.0.into(),
        },
        ..Default::default()
    }
}

pub fn scrollable_style(_theme: &Theme, status: scrollable::Status) -> scrollable::Style {
    let make_rail = |hovered: bool, dragged: bool| scrollable::Rail {
        background: Some(Background::Color(Color::from_rgba(0.055, 0.067, 0.090, 0.65))),
        border: Border {
            color: Color::TRANSPARENT,
            width: 0.0,
            radius: 4.0.into(),
        },
        scroller: scrollable::Scroller {
            color: if dragged {
                ACCENT_GOLD
            } else if hovered {
                BORDER_GOLD
            } else {
                BORDER_SUBTLE
            },
            border: Border {
                color: Color::TRANSPARENT,
                width: 0.0,
                radius: 4.0.into(),
            },
        },
    };

    let (v_rail, h_rail) = match status {
        scrollable::Status::Active => (make_rail(false, false), make_rail(false, false)),
        scrollable::Status::Hovered {
            is_horizontal_scrollbar_hovered,
            is_vertical_scrollbar_hovered,
        } => (
            make_rail(is_vertical_scrollbar_hovered, false),
            make_rail(is_horizontal_scrollbar_hovered, false),
        ),
        scrollable::Status::Dragged {
            is_horizontal_scrollbar_dragged,
            is_vertical_scrollbar_dragged,
        } => (
            make_rail(false, is_vertical_scrollbar_dragged),
            make_rail(false, is_horizontal_scrollbar_dragged),
        ),
    };

    scrollable::Style {
        container: container::Style::default(),
        vertical_rail: v_rail,
        horizontal_rail: h_rail,
        gap: Some(Background::Color(BG_BASE)),
    }
}
