use std::sync::atomic::{AtomicU8, Ordering};

use iced::overlay::menu;
use iced::widget::{button, container, pick_list, scrollable, text, text_input};
use iced::{Background, Border, Color, Font, Shadow, Theme, Vector};

/// Bundled Google Fonts icon font (`Material Symbols Rounded`, Apache 2.0).
pub const ICON_FONT: Font = Font::with_name("Material Symbols Rounded");

pub mod icons {
    pub const FOLDER_OPEN: char = '\u{e2c8}';
    pub const SAVE: char = '\u{e161}';
    pub const SAVE_AS: char = '\u{eb60}';
    pub const RESTORE: char = '\u{e8b3}';
    pub const HISTORY: char = '\u{e8b3}';
    pub const ARCHIVE: char = '\u{e149}';
    pub const REFRESH: char = '\u{e5d5}';
    pub const PERSON: char = '\u{f0d3}';
    pub const SWORDS: char = '\u{f889}';
    pub const GROUPS: char = '\u{f233}';
    pub const BACKPACK: char = '\u{f19c}';
    pub const INVENTORY_2: char = '\u{e1a1}';
    pub const RESTAURANT: char = '\u{e56c}';
    pub const SEARCH: char = '\u{ef7a}';
    pub const CASTLE: char = '\u{eab1}';
    pub const SCIENCE: char = '\u{ea4b}';
    pub const TABLE_CHART: char = '\u{e265}';
    pub const SETTINGS: char = '\u{e8b8}';
    pub const INFO: char = '\u{e88e}';
}

pub fn icon<'a>(codepoint: char, size: f32) -> text::Text<'a> {
    text(codepoint.to_string()).font(ICON_FONT).size(size)
}

/// User-selectable primary accent palette
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AccentTheme {
    Yellow,
    Orange,
    Red,
    Green,
    Blue,
    Magenta,
}

impl AccentTheme {
    pub const ALL: &'static [AccentTheme] = &[
        AccentTheme::Yellow,
        AccentTheme::Orange,
        AccentTheme::Red,
        AccentTheme::Green,
        AccentTheme::Blue,
        AccentTheme::Magenta,
    ];

    pub fn label(self) -> &'static str {
        match self {
            AccentTheme::Yellow => "Gold",
            AccentTheme::Orange => "Amber Copper",
            AccentTheme::Red => "Royal Crimson",
            AccentTheme::Green => "Jade Emerald",
            AccentTheme::Blue => "Sapphire",
            AccentTheme::Magenta => "Orchid",
        }
    }

    pub fn key(self) -> &'static str {
        match self {
            AccentTheme::Yellow => "yellow",
            AccentTheme::Orange => "orange",
            AccentTheme::Red => "red",
            AccentTheme::Green => "green",
            AccentTheme::Blue => "blue",
            AccentTheme::Magenta => "magenta",
        }
    }

    pub fn from_key(s: &str) -> Self {
        match s.trim().to_ascii_lowercase().as_str() {
            "orange" => AccentTheme::Orange,
            "red" => AccentTheme::Red,
            "green" => AccentTheme::Green,
            "blue" => AccentTheme::Blue,
            "magenta" => AccentTheme::Magenta,
            _ => AccentTheme::Yellow,
        }
    }

    fn to_u8(self) -> u8 {
        match self {
            AccentTheme::Yellow => 0,
            AccentTheme::Orange => 1,
            AccentTheme::Red => 2,
            AccentTheme::Green => 3,
            AccentTheme::Blue => 4,
            AccentTheme::Magenta => 5,
        }
    }

    fn from_u8(v: u8) -> Self {
        match v {
            1 => AccentTheme::Orange,
            2 => AccentTheme::Red,
            3 => AccentTheme::Green,
            4 => AccentTheme::Blue,
            5 => AccentTheme::Magenta,
            _ => AccentTheme::Yellow,
        }
    }

    pub fn accent_color(self) -> Color {
        match self {
            AccentTheme::Yellow => Color::from_rgb(0.941, 0.725, 0.043),  // #F0B90B (Gold)
            AccentTheme::Orange => Color::from_rgb(0.878, 0.478, 0.220),  // #E07A38 (Amber Copper)
            AccentTheme::Red => Color::from_rgb(0.851, 0.306, 0.353),     // #D94E5A (Royal Crimson)
            AccentTheme::Green => Color::from_rgb(0.231, 0.698, 0.451),   // #3BB273 (Jade Emerald)
            AccentTheme::Blue => Color::from_rgb(0.294, 0.549, 0.910),    // #4B8CE8 (Sapphire Blue)
            AccentTheme::Magenta => Color::from_rgb(0.769, 0.357, 0.722), // #C45BB8 (Orchid Magenta)
        }
    }

    pub fn border_color(self) -> Color {
        match self {
            AccentTheme::Yellow => Color::from_rgb(0.720, 0.560, 0.160),  // #B88F29
            AccentTheme::Orange => Color::from_rgb(0.643, 0.325, 0.133),  // #A45322
            AccentTheme::Red => Color::from_rgb(0.620, 0.200, 0.243),     // #9E333E
            AccentTheme::Green => Color::from_rgb(0.153, 0.490, 0.314),   // #277D50
            AccentTheme::Blue => Color::from_rgb(0.192, 0.388, 0.671),    // #3163AB
            AccentTheme::Magenta => Color::from_rgb(0.557, 0.231, 0.522), // #8E3B85
        }
    }

    pub fn hover_color(self) -> Color {
        match self {
            AccentTheme::Yellow => Color::from_rgb(0.980, 0.800, 0.180),
            AccentTheme::Orange => Color::from_rgb(0.918, 0.565, 0.329),
            AccentTheme::Red => Color::from_rgb(0.894, 0.420, 0.463),
            AccentTheme::Green => Color::from_rgb(0.329, 0.776, 0.541),
            AccentTheme::Blue => Color::from_rgb(0.420, 0.635, 0.933),
            AccentTheme::Magenta => Color::from_rgb(0.831, 0.463, 0.792),
        }
    }

    pub fn pressed_color(self) -> Color {
        match self {
            AccentTheme::Yellow => Color::from_rgb(0.800, 0.600, 0.030),
            AccentTheme::Orange => Color::from_rgb(0.761, 0.384, 0.153),
            AccentTheme::Red => Color::from_rgb(0.722, 0.231, 0.278),
            AccentTheme::Green => Color::from_rgb(0.180, 0.580, 0.369),
            AccentTheme::Blue => Color::from_rgb(0.220, 0.447, 0.780),
            AccentTheme::Magenta => Color::from_rgb(0.651, 0.267, 0.608),
        }
    }

    pub fn button_text_color(self) -> Color {
        match self {
            AccentTheme::Yellow | AccentTheme::Orange | AccentTheme::Green => {
                Color::from_rgb(0.06, 0.07, 0.10)
            }
            AccentTheme::Red | AccentTheme::Blue | AccentTheme::Magenta => TEXT_PRIMARY,
        }
    }
}

/// User-selectable base background palette
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BaseTheme {
    DarkNavy,
    PitchBlack,
    DarkGray,
    DarkGreen,
    DarkPurple,
}

impl BaseTheme {
    pub const ALL: &'static [BaseTheme] = &[
        BaseTheme::DarkNavy,
        BaseTheme::PitchBlack,
        BaseTheme::DarkGray,
        BaseTheme::DarkGreen,
        BaseTheme::DarkPurple,
    ];

    pub fn label(self) -> &'static str {
        match self {
            BaseTheme::DarkNavy => "Dark Navy",
            BaseTheme::PitchBlack => "High Contrast Black",
            BaseTheme::DarkGray => "Dark Gray",
            BaseTheme::DarkGreen => "Dark Green",
            BaseTheme::DarkPurple => "Dark Purple",
        }
    }

    pub fn subtitle(self) -> &'static str {
        match self {
            BaseTheme::DarkNavy => "Default slate-navy surface",
            BaseTheme::PitchBlack => "Pure black high-contrast surface",
            BaseTheme::DarkGray => "Neutral charcoal-gray surface",
            BaseTheme::DarkGreen => "Deep forest-emerald surface",
            BaseTheme::DarkPurple => "Deep obsidian-violet surface",
        }
    }

    pub fn key(self) -> &'static str {
        match self {
            BaseTheme::DarkNavy => "navy",
            BaseTheme::PitchBlack => "black",
            BaseTheme::DarkGray => "gray",
            BaseTheme::DarkGreen => "green",
            BaseTheme::DarkPurple => "purple",
        }
    }

    pub fn from_key(s: &str) -> Self {
        match s.trim().to_ascii_lowercase().as_str() {
            "black" | "pitch_black" | "high_contrast_black" => BaseTheme::PitchBlack,
            "gray" | "grey" | "dark_gray" | "dark_grey" => BaseTheme::DarkGray,
            "green" | "dark_green" => BaseTheme::DarkGreen,
            "purple" | "dark_purple" => BaseTheme::DarkPurple,
            _ => BaseTheme::DarkNavy,
        }
    }

    fn to_u8(self) -> u8 {
        match self {
            BaseTheme::DarkNavy => 0,
            BaseTheme::PitchBlack => 1,
            BaseTheme::DarkGray => 2,
            BaseTheme::DarkGreen => 3,
            BaseTheme::DarkPurple => 4,
        }
    }

    fn from_u8(v: u8) -> Self {
        match v {
            1 => BaseTheme::PitchBlack,
            2 => BaseTheme::DarkGray,
            3 => BaseTheme::DarkGreen,
            4 => BaseTheme::DarkPurple,
            _ => BaseTheme::DarkNavy,
        }
    }

    pub fn swatch_color(self) -> Color {
        match self {
            BaseTheme::PitchBlack => Color::from_rgb(0.0, 0.0, 0.0),
            _ => self.bg_elevated(),
        }
    }

    pub fn bg_base(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.055, 0.067, 0.090),   // #0E1117
            BaseTheme::PitchBlack => Color::from_rgb(0.000, 0.000, 0.000), // #000000
            BaseTheme::DarkGray => Color::from_rgb(0.071, 0.075, 0.086),   // #121316
            BaseTheme::DarkGreen => Color::from_rgb(0.035, 0.071, 0.055),  // #09120E
            BaseTheme::DarkPurple => Color::from_rgb(0.063, 0.043, 0.090), // #100B17
        }
    }

    pub fn bg_sidebar(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.075, 0.090, 0.125),   // #131720
            BaseTheme::PitchBlack => Color::from_rgb(0.027, 0.027, 0.035), // #070709
            BaseTheme::DarkGray => Color::from_rgb(0.094, 0.102, 0.118),   // #181A1E
            BaseTheme::DarkGreen => Color::from_rgb(0.051, 0.098, 0.078),  // #0D1914
            BaseTheme::DarkPurple => Color::from_rgb(0.086, 0.063, 0.125), // #161020
        }
    }

    pub fn bg_surface(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.094, 0.114, 0.157),   // #181D28
            BaseTheme::PitchBlack => Color::from_rgb(0.051, 0.051, 0.063), // #0D0D10
            BaseTheme::DarkGray => Color::from_rgb(0.118, 0.125, 0.145),   // #1E2025
            BaseTheme::DarkGreen => Color::from_rgb(0.067, 0.133, 0.106),  // #11221B
            BaseTheme::DarkPurple => Color::from_rgb(0.114, 0.082, 0.169), // #1D152B
        }
    }

    pub fn bg_elevated(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.125, 0.153, 0.208),   // #202735
            BaseTheme::PitchBlack => Color::from_rgb(0.086, 0.086, 0.106), // #16161B
            BaseTheme::DarkGray => Color::from_rgb(0.149, 0.161, 0.188),   // #262930
            BaseTheme::DarkGreen => Color::from_rgb(0.090, 0.180, 0.145),  // #172E25
            BaseTheme::DarkPurple => Color::from_rgb(0.153, 0.114, 0.227), // #271D3A
        }
    }

    pub fn border_subtle(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.173, 0.208, 0.282),   // #2C3548
            BaseTheme::PitchBlack => Color::from_rgb(0.180, 0.180, 0.212), // #2E2E36
            BaseTheme::DarkGray => Color::from_rgb(0.212, 0.227, 0.263),   // #363A43
            BaseTheme::DarkGreen => Color::from_rgb(0.137, 0.259, 0.212),  // #234236
            BaseTheme::DarkPurple => Color::from_rgb(0.227, 0.173, 0.329), // #3A2C54
        }
    }

    pub fn empty_slot_bg(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgba(0.094, 0.114, 0.157, 0.45),
            BaseTheme::PitchBlack => Color::from_rgba(0.075, 0.075, 0.090, 0.65),
            BaseTheme::DarkGray => Color::from_rgba(0.118, 0.125, 0.145, 0.50),
            BaseTheme::DarkGreen => Color::from_rgba(0.067, 0.133, 0.106, 0.50),
            BaseTheme::DarkPurple => Color::from_rgba(0.114, 0.082, 0.169, 0.50),
        }
    }

    pub fn secondary_hover(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.18, 0.22, 0.30),
            BaseTheme::PitchBlack => Color::from_rgb(0.15, 0.15, 0.19),
            BaseTheme::DarkGray => Color::from_rgb(0.21, 0.22, 0.26),
            BaseTheme::DarkGreen => Color::from_rgb(0.13, 0.24, 0.19),
            BaseTheme::DarkPurple => Color::from_rgb(0.21, 0.16, 0.31),
        }
    }

    pub fn secondary_pressed(self) -> Color {
        match self {
            BaseTheme::DarkNavy => Color::from_rgb(0.14, 0.17, 0.24),
            BaseTheme::PitchBlack => Color::from_rgb(0.11, 0.11, 0.14),
            BaseTheme::DarkGray => Color::from_rgb(0.16, 0.17, 0.20),
            BaseTheme::DarkGreen => Color::from_rgb(0.10, 0.19, 0.15),
            BaseTheme::DarkPurple => Color::from_rgb(0.17, 0.13, 0.25),
        }
    }
}

static CURRENT_BASE: AtomicU8 = AtomicU8::new(0);
static CURRENT_ACCENT: AtomicU8 = AtomicU8::new(0);

pub fn set_base_theme(base: BaseTheme) {
    CURRENT_BASE.store(base.to_u8(), Ordering::Relaxed);
}

pub fn current_base_theme() -> BaseTheme {
    BaseTheme::from_u8(CURRENT_BASE.load(Ordering::Relaxed))
}

pub fn bg_base() -> Color {
    current_base_theme().bg_base()
}

pub fn bg_sidebar() -> Color {
    current_base_theme().bg_sidebar()
}

pub fn bg_surface() -> Color {
    current_base_theme().bg_surface()
}

pub fn bg_elevated() -> Color {
    current_base_theme().bg_elevated()
}

pub fn border_subtle() -> Color {
    current_base_theme().border_subtle()
}

pub fn set_accent(theme: AccentTheme) {
    CURRENT_ACCENT.store(theme.to_u8(), Ordering::Relaxed);
}

pub fn current_accent() -> AccentTheme {
    AccentTheme::from_u8(CURRENT_ACCENT.load(Ordering::Relaxed))
}

pub fn accent() -> Color {
    current_accent().accent_color()
}

pub fn border_accent() -> Color {
    current_accent().border_color()
}

/// Default dark palette constants (kept for direct color references)
pub const BORDER_SUBTLE: Color = Color::from_rgb(0.173, 0.208, 0.282); // #2C3548

pub const TEXT_PRIMARY: Color = Color::from_rgb(0.945, 0.961, 0.976);  // #F1F5F9
pub const TEXT_MUTED: Color = Color::from_rgb(0.580, 0.639, 0.722);    // #94A3B8

pub const ACCENT_GOLD: Color = Color::from_rgb(0.941, 0.725, 0.043);   // #F0B90B
pub const ACCENT_CYAN: Color = Color::from_rgb(0.220, 0.741, 0.973);   // #38BDF8
pub const ACCENT_GREEN: Color = Color::from_rgb(0.133, 0.773, 0.369);  // #22C55E
pub const ACCENT_RED: Color = Color::from_rgb(0.937, 0.267, 0.267);    // #EF4444

pub fn app_theme() -> Theme {
    Theme::custom(
        format!(
            "Suikoden {} ({})",
            current_base_theme().label(),
            current_accent().label()
        ),
        iced::theme::Palette {
            background: bg_base(),
            text: TEXT_PRIMARY,
            primary: accent(),
            success: ACCENT_GREEN,
            danger: ACCENT_RED,
        },
    )
}

pub fn top_bar_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(bg_sidebar())),
        border: Border {
            color: border_subtle(),
            width: 1.0,
            radius: 0.0.into(),
        },
        ..Default::default()
    }
}

pub fn sidebar_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(bg_sidebar())),
        border: Border {
            color: border_subtle(),
            width: 1.0,
            radius: 0.0.into(),
        },
        ..Default::default()
    }
}

pub fn card_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(bg_surface())),
        border: Border {
            color: border_subtle(),
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
        background: Some(Background::Color(bg_elevated())),
        border: Border {
            color: if is_convoy { border_subtle() } else { border_accent() },
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

pub fn swatch_style(color: Color) -> impl Fn(&Theme) -> container::Style {
    move |_theme| container::Style {
        background: Some(Background::Color(color)),
        border: Border {
            color: Color { a: 0.65, ..TEXT_PRIMARY },
            width: 1.0,
            radius: 4.0.into(),
        },
        ..Default::default()
    }
}

pub fn accent_choice_button_style(
    selected: bool,
    color: Color,
) -> impl Fn(&Theme, button::Status) -> button::Style {
    move |_theme, status| {
        let base = current_base_theme();
        let bg = if selected {
            Color { a: 0.16, ..color }
        } else {
            match status {
                button::Status::Hovered => base.bg_elevated(),
                button::Status::Pressed => Color { a: 0.10, ..color },
                _ => base.empty_slot_bg(),
            }
        };

        button::Style {
            background: Some(Background::Color(bg)),
            text_color: TEXT_PRIMARY,
            border: Border {
                color: if selected { color } else { base.border_subtle() },
                width: if selected { 1.5 } else { 1.0 },
                radius: 8.0.into(),
            },
            ..Default::default()
        }
    }
}

pub fn footer_bar_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(bg_sidebar())),
        border: Border {
            color: border_subtle(),
            width: 1.0,
            radius: 0.0.into(),
        },
        ..Default::default()
    }
}

pub fn nav_button_style(active: bool) -> impl Fn(&Theme, button::Status) -> button::Style {
    move |_theme, status| {
        let cur = accent();
        let disabled = matches!(status, button::Status::Disabled);
        let bg = if disabled {
            Color::TRANSPARENT
        } else if active {
            Color { a: 0.18, ..cur }
        } else {
            match status {
                button::Status::Hovered => bg_elevated(),
                button::Status::Pressed => Color { a: 0.10, ..cur },
                _ => Color::TRANSPARENT,
            }
        };

        let text_color = if disabled {
            Color { a: 0.42, ..TEXT_MUTED }
        } else if active {
            cur
        } else {
            TEXT_PRIMARY
        };

        button::Style {
            background: Some(Background::Color(bg)),
            text_color,
            border: Border {
                color: if active && !disabled { border_accent() } else { Color::TRANSPARENT },
                width: if active && !disabled { 1.0 } else { 0.0 },
                radius: 7.0.into(),
            },
            ..Default::default()
        }
    }
}

pub fn primary_button_style(_theme: &Theme, status: button::Status) -> button::Style {
    let cur = current_accent();
    let bg = match status {
        button::Status::Disabled => Color::from_rgb(0.22, 0.25, 0.30),
        button::Status::Hovered => cur.hover_color(),
        button::Status::Pressed => cur.pressed_color(),
        button::Status::Active => cur.accent_color(),
    };

    button::Style {
        background: Some(Background::Color(bg)),
        text_color: if matches!(status, button::Status::Disabled) {
            TEXT_MUTED
        } else {
            cur.button_text_color()
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
    let base = current_base_theme();
    let bg = match status {
        button::Status::Disabled => base.bg_sidebar(),
        button::Status::Hovered => base.secondary_hover(),
        button::Status::Pressed => base.secondary_pressed(),
        button::Status::Active => base.bg_elevated(),
    };

    button::Style {
        background: Some(Background::Color(bg)),
        text_color: if matches!(status, button::Status::Disabled) {
            TEXT_MUTED
        } else {
            TEXT_PRIMARY
        },
        border: Border {
            color: base.border_subtle(),
            width: 1.0,
            radius: 7.0.into(),
        },
        ..Default::default()
    }
}

pub fn input_style(_theme: &Theme, status: text_input::Status) -> text_input::Style {
    let cur = accent();
    let border_color = match status {
        text_input::Status::Focused => cur,
        text_input::Status::Hovered => Color::from_rgb(0.30, 0.36, 0.48),
        _ => border_subtle(),
    };

    text_input::Style {
        background: Background::Color(bg_base()),
        border: Border {
            color: border_color,
            width: 1.0,
            radius: 6.0.into(),
        },
        icon: TEXT_MUTED,
        placeholder: TEXT_MUTED,
        value: TEXT_PRIMARY,
        selection: Color { a: 0.35, ..cur },
    }
}

pub fn pick_list_style(_theme: &Theme, status: pick_list::Status) -> pick_list::Style {
    let cur = accent();
    let border_color = match status {
        pick_list::Status::Opened => cur,
        pick_list::Status::Hovered => Color::from_rgb(0.30, 0.36, 0.48),
        pick_list::Status::Active => border_subtle(),
    };

    pick_list::Style {
        text_color: TEXT_PRIMARY,
        placeholder_color: TEXT_MUTED,
        handle_color: cur,
        background: Background::Color(bg_base()),
        border: Border {
            color: border_color,
            width: 1.0,
            radius: 6.0.into(),
        },
    }
}

pub fn pick_list_menu_style(_theme: &Theme) -> menu::Style {
    let cur = current_accent();
    menu::Style {
        background: Background::Color(bg_surface()),
        border: Border {
            color: cur.border_color(),
            width: 1.0,
            radius: 6.0.into(),
        },
        text_color: TEXT_PRIMARY,
        selected_text_color: cur.button_text_color(),
        selected_background: Background::Color(cur.accent_color()),
    }
}

pub fn modal_backdrop_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(Color::from_rgba(0.0, 0.0, 0.0, 0.80))),
        ..Default::default()
    }
}

pub fn modal_card_style(_theme: &Theme) -> container::Style {
    container::Style {
        background: Some(Background::Color(bg_surface())),
        border: Border {
            color: border_accent(),
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
    let base = current_base_theme();
    container::Style {
        background: Some(Background::Color(base.empty_slot_bg())),
        border: Border {
            color: base.border_subtle(),
            width: 1.0,
            radius: 8.0.into(),
        },
        ..Default::default()
    }
}

pub fn scrollable_style(_theme: &Theme, status: scrollable::Status) -> scrollable::Style {
    let cur = accent();
    let cur_border = border_accent();
    let base = current_base_theme();
    let rail_bg = Color { a: 0.65, ..base.bg_base() };
    let make_rail = |hovered: bool, dragged: bool| scrollable::Rail {
        background: Some(Background::Color(rail_bg)),
        border: Border {
            color: Color::TRANSPARENT,
            width: 0.0,
            radius: 4.0.into(),
        },
        scroller: scrollable::Scroller {
            color: if dragged {
                cur
            } else if hovered {
                cur_border
            } else {
                base.border_subtle()
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
        gap: Some(Background::Color(base.bg_base())),
    }
}
