use iced::font::{self, Font};
use iced::widget::{
    column, container, horizontal_rule, rich_text, row, scrollable, span, text, Space,
};
use iced::{Alignment, Color, Element, Length};

use crate::i18n;
use crate::save_file::SaveDocument;
use crate::theme;
use crate::views::EditorTab;
use crate::Message;

const CHANGELOG_MD: &str = include_str!("../../../CHANGELOG.md");

const FONT_BOLD: Font = Font {
    weight: font::Weight::Bold,
    ..Font::with_name("Noto Sans")
};

const FONT_ITALIC: Font = Font {
    style: font::Style::Italic,
    ..Font::with_name("Noto Sans")
};

const TEXT_BODY: Color = Color::from_rgb(0.84, 0.88, 0.93);

struct ChangelogRelease<'a> {
    version: &'a str,
    date: &'a str,
    tag: Option<&'a str>,
    sections: Vec<ChangelogSection<'a>>,
}

struct ChangelogSection<'a> {
    title: &'a str,
    items: Vec<ChangelogItem<'a>>,
}

struct ChangelogItem<'a> {
    depth: u8,
    text: &'a str,
}

fn parse_changelog(md: &str) -> (Option<&str>, Vec<ChangelogRelease<'_>>) {
    let mut subtitle: Option<&str> = None;
    let mut releases: Vec<ChangelogRelease<'_>> = Vec::new();

    for raw_line in md.lines() {
        let trimmed = raw_line.trim();
        if trimmed.is_empty() || trimmed.starts_with("# ") {
            continue;
        }

        if let Some(rest) = trimmed.strip_prefix("## ") {
            let (version, date, tag) = parse_release_header(rest);
            releases.push(ChangelogRelease {
                version,
                date,
                tag,
                sections: Vec::new(),
            });
            continue;
        }

        if let Some(rest) = trimmed.strip_prefix("### ") {
            if let Some(rel) = releases.last_mut() {
                rel.sections.push(ChangelogSection {
                    title: rest.trim(),
                    items: Vec::new(),
                });
            }
            continue;
        }

        if releases.is_empty() {
            if subtitle.is_none() {
                subtitle = Some(trimmed);
            }
            continue;
        }

        // Bullet items: top-level `- ` vs nested `  - `
        let indent = raw_line.len() - raw_line.trim_start_matches([' ', '\t']).len();
        if let Some(item_text) = trimmed.strip_prefix("- ").or_else(|| trimmed.strip_prefix("* ")) {
            if let Some(rel) = releases.last_mut() {
                if rel.sections.is_empty() {
                    rel.sections.push(ChangelogSection {
                        title: "Changes",
                        items: Vec::new(),
                    });
                }
                if let Some(sec) = rel.sections.last_mut() {
                    let depth = if indent >= 2 { 1 } else { 0 };
                    sec.items.push(ChangelogItem {
                        depth,
                        text: item_text.trim(),
                    });
                }
            }
        }
    }

    (subtitle, releases)
}

fn parse_release_header(header: &str) -> (&str, &str, Option<&str>) {
    let header = header.trim();
    let (ver_part, after_ver) = if let Some(rest) = header.strip_prefix('[') {
        if let Some(end) = rest.find(']') {
            (&rest[..end], rest[end + 1..].trim())
        } else {
            (header, "")
        }
    } else if let Some((v, r)) = header.split_once(" - ") {
        (v.trim(), r.trim())
    } else {
        (header, "")
    };

    let after_dash = after_ver
        .strip_prefix('-')
        .map(str::trim)
        .unwrap_or(after_ver);

    if let Some(open) = after_dash.rfind('(') {
        if let Some(close) = after_dash[open..].find(')') {
            let date = after_dash[..open].trim();
            let tag = after_dash[open + 1..open + close].trim();
            return (ver_part, date, if tag.is_empty() { None } else { Some(tag) });
        }
    }

    (ver_part, after_dash, None)
}

fn section_color(title: &str) -> Color {
    let lower = title.to_ascii_lowercase();
    if lower.contains("added") {
        theme::ACCENT_GREEN
    } else if lower.contains("fixed") && !lower.contains("improved") && !lower.contains("changed") {
        theme::ACCENT_CYAN
    } else if lower.contains("credits") {
        theme::TEXT_MUTED
    } else {
        theme::accent()
    }
}

fn parse_inline_spans<'a>(input: &'a str, base_color: Color) -> Vec<text::Span<'a, Message>> {
    let mut spans: Vec<text::Span<'a, Message>> = Vec::new();
    let bytes = input.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut plain_start = 0;

    let flush_plain = |spans: &mut Vec<text::Span<'a, Message>>, start: usize, end: usize| {
        if start < end {
            spans.push(span(&input[start..end]).color(base_color));
        }
    };

    while i < len {
        // Bold: **...**
        if i + 1 < len && bytes[i] == b'*' && bytes[i + 1] == b'*' {
            if let Some(rel_end) = input[i + 2..].find("**") {
                flush_plain(&mut spans, plain_start, i);
                let inner = &input[i + 2..i + 2 + rel_end];
                if !inner.is_empty() {
                    // Handle inline `code` inside **bold** cleanly
                    if inner.contains('`') {
                        for part in split_code_in_bold(inner) {
                            spans.push(part);
                        }
                    } else {
                        spans.push(
                            span(inner)
                                .font(FONT_BOLD)
                                .color(theme::TEXT_PRIMARY),
                        );
                    }
                }
                i = i + 2 + rel_end + 2;
                plain_start = i;
                continue;
            }
        }

        // Inline code: `...`
        if bytes[i] == b'`' {
            if let Some(rel_end) = input[i + 1..].find('`') {
                flush_plain(&mut spans, plain_start, i);
                let code = &input[i + 1..i + 1 + rel_end];
                if !code.is_empty() {
                    spans.push(
                        span(code)
                            .font(Font::MONOSPACE)
                            .color(theme::ACCENT_CYAN),
                    );
                }
                i = i + 1 + rel_end + 1;
                plain_start = i;
                continue;
            }
        }

        // Markdown link: [label](url)
        if bytes[i] == b'[' {
            if let Some(close_bracket) = input[i + 1..].find("](") {
                let url_start = i + 1 + close_bracket + 2;
                if let Some(close_paren) = input[url_start..].find(')') {
                    flush_plain(&mut spans, plain_start, i);
                    let label = &input[i + 1..i + 1 + close_bracket];
                    let url = &input[url_start..url_start + close_paren];
                    if !label.is_empty() {
                        spans.push(span(label).font(FONT_BOLD).color(theme::ACCENT_CYAN));
                    }
                    if !url.is_empty() {
                        spans.push(span(" (").color(theme::TEXT_MUTED));
                        spans.push(span(url).color(theme::TEXT_MUTED));
                        spans.push(span(")").color(theme::TEXT_MUTED));
                    }
                    i = url_start + close_paren + 1;
                    plain_start = i;
                    continue;
                }
            }
        }

        // Italic: *...*
        if bytes[i] == b'*' {
            if let Some(rel_end) = input[i + 1..].find('*') {
                if rel_end > 0 {
                    flush_plain(&mut spans, plain_start, i);
                    let inner = &input[i + 1..i + 1 + rel_end];
                    spans.push(span(inner).font(FONT_ITALIC).color(theme::TEXT_PRIMARY));
                    i = i + 1 + rel_end + 1;
                    plain_start = i;
                    continue;
                }
            }
        }

        // Advance to next UTF-8 character boundary
        i += input[i..].chars().next().map_or(1, char::len_utf8);
    }

    flush_plain(&mut spans, plain_start, len);
    spans
}

fn split_code_in_bold<'a>(inner: &'a str) -> Vec<text::Span<'a, Message>> {
    let mut out = Vec::new();
    let mut rest = inner;
    while let Some(start) = rest.find('`') {
        if start > 0 {
            out.push(
                span(&rest[..start])
                    .font(FONT_BOLD)
                    .color(theme::TEXT_PRIMARY),
            );
        }
        let after_open = &rest[start + 1..];
        if let Some(end) = after_open.find('`') {
            out.push(
                span(&after_open[..end])
                    .font(Font::MONOSPACE)
                    .color(theme::ACCENT_CYAN),
            );
            rest = &after_open[end + 1..];
        } else {
            out.push(
                span(&rest[start..])
                    .font(FONT_BOLD)
                    .color(theme::TEXT_PRIMARY),
            );
            return out;
        }
    }
    if !rest.is_empty() {
        out.push(span(rest).font(FONT_BOLD).color(theme::TEXT_PRIMARY));
    }
    out
}

pub fn view_stub<'a>(tab: EditorTab, doc: Option<&'a SaveDocument>) -> Element<'a, Message> {
    match tab {
        EditorTab::Changelog => view_changelog(),
        EditorTab::About => view_about(),
        _ => view_editor_placeholder(tab, doc),
    }
}

fn view_changelog<'a>() -> Element<'a, Message> {
    let (subtitle, releases) = parse_changelog(CHANGELOG_MD);
    let active_accent = theme::accent();

    let header = row![
        column![
            text(i18n::tr("tab_changelog"))
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text(subtitle.unwrap_or("Version history for Suikoden II HD Remaster Save Editor."))
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        Space::with_width(Length::Fill),
        container(
            text(format!("{} Releases", releases.len()))
                .size(11)
                .font(FONT_BOLD)
                .color(active_accent),
        )
        .padding([5, 10])
        .style(theme::badge_style(active_accent)),
    ]
    .align_y(Alignment::Center);

    let mut content = column![header].spacing(16).padding(24);

    for (idx, release) in releases.into_iter().enumerate() {
        let is_latest = idx == 0;

        let mut title_row = row![
            container(
                text(format!("v{}", release.version))
                    .size(13)
                    .font(FONT_BOLD)
                    .color(active_accent),
            )
            .padding([4, 10])
            .style(theme::badge_style(active_accent)),
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        if is_latest {
            title_row = title_row.push(
                container(
                    text("LATEST")
                        .size(10)
                        .font(FONT_BOLD)
                        .color(theme::ACCENT_GREEN),
                )
                .padding([3, 8])
                .style(theme::badge_style(theme::ACCENT_GREEN)),
            );
        }

        if let Some(tag) = release.tag {
            title_row = title_row.push(
                container(
                    text(tag)
                        .size(11)
                        .color(theme::ACCENT_CYAN),
                )
                .padding([3, 8])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
            );
        }

        title_row = title_row.push(Space::with_width(Length::Fill));

        if !release.date.is_empty() {
            title_row = title_row.push(
                text(release.date)
                    .size(12)
                    .color(theme::TEXT_MUTED),
            );
        }

        let mut card_body = column![title_row, horizontal_rule(1)].spacing(12);

        for section in release.sections {
            let cat_color = section_color(section.title);
            let mut sec_col = column![
                container(
                    text(section.title.to_uppercase())
                        .size(10)
                        .font(FONT_BOLD)
                        .color(cat_color),
                )
                .padding([3, 8])
                .style(theme::badge_style(cat_color)),
            ]
            .spacing(8);

            for item in section.items {
                let is_sub = item.depth > 0;
                let (bullet_char, bullet_color, text_size, base_color, left_pad) = if is_sub {
                    ("◦", theme::TEXT_MUTED, 12.5, theme::TEXT_MUTED, 22.0)
                } else {
                    ("•", cat_color, 13.0, TEXT_BODY, 4.0)
                };

                let spans = parse_inline_spans(item.text, base_color);
                let line = row![
                    text(bullet_char).size(text_size).color(bullet_color),
                    rich_text(spans).size(text_size).width(Length::Fill),
                ]
                .spacing(8)
                .align_y(Alignment::Start);

                sec_col = sec_col.push(container(line).padding(iced::padding::left(left_pad)));
            }

            card_body = card_body.push(sec_col);
        }

        let card = container(card_body)
            .padding(18)
            .width(Length::Fill)
            .style(theme::card_style);

        content = content.push(card);
    }

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn view_editor_placeholder<'a>(tab: EditorTab, doc: Option<&'a SaveDocument>) -> Element<'a, Message> {
    let live_metric = match (tab, doc) {
        (EditorTab::BattleCharacters, Some(d)) => {
            format!("Loaded save contains {} battle character entries (chara_data.c_varia_dat).", d.battle_character_count())
        }
        (EditorTab::RecruitedCharacters, Some(d)) => {
            format!("Loaded save has {} recruited stars detected in chara_flag[0..124].", d.recruited_count())
        }
        (EditorTab::PartyBag, Some(d)) => {
            format!("Loaded save has {} occupied slots in party_data.party_item.", d.party_item_count())
        }
        (EditorTab::Warehouse, Some(d)) => {
            format!("Loaded save has {} occupied slots in game_data.base_item.", d.warehouse_item_count())
        }
        (_, Some(_)) => "Save file is loaded in memory — ready to wire this editor tab next.".to_string(),
        (_, None) => "Open a Suikoden II JSON save file (or press Ctrl+D to load debug/save.json) to inspect live data.".to_string(),
    };

    let card = container(
        column![
            row![
                container(text("SCAFFOLDED").size(11).color(theme::ACCENT_CYAN))
                    .padding([4, 8])
                    .style(theme::badge_style(theme::ACCENT_CYAN)),
                text(tab.label()).size(20).color(theme::TEXT_PRIMARY),
            ]
            .spacing(10),
            text(tab.description()).size(14).color(theme::TEXT_MUTED),
            container(text(live_metric).size(13).color(theme::ACCENT_GOLD))
                .padding(12)
                .width(Length::Fill)
                .style(theme::badge_style(theme::ACCENT_GOLD)),
        ]
        .spacing(14),
    )
    .padding(24)
    .width(Length::Fill)
    .style(theme::card_style);

    container(card).padding(24).into()
}

fn view_about<'a>() -> Element<'a, Message> {
    let card = container(
        column![
            text(format!("Sui2SaveEditor v{} — Native Desktop Edition", env!("CARGO_PKG_VERSION")))
                .size(22)
                .color(theme::ACCENT_GOLD),
            text("Native Rust desktop save editor for Suikoden II HD Remaster.")
                .size(14)
                .color(theme::TEXT_PRIMARY),
            text("• Lossless JSON round-trip using serde_json (preserve_order, UTF-8 BOM, \\uXXXX, CRLF)\n• Silent .bak backup creation inside backups\\ with side-by-side Restore Diff preview\n• Save As opens directly in the loaded save's folder\n• Shortcuts: Ctrl+O (Open), Ctrl+S (Save), Esc (Close Modal), Ctrl+D (Load debug/save.json)\n• Drag and drop any .json save file onto the window to open it\n• Open-source GUI framework: iced (MIT License) — https://github.com/iced-rs/iced\n• Bundled UI Fonts: Noto Sans & Noto Sans CJK JP (SIL Open Font License 1.1, Copyright Adobe & Google LLC) — https://github.com/notofonts\n• Bundled Icon Font: Material Symbols Rounded (Apache License 2.0, Copyright Google LLC) — https://github.com/google/material-design-icons")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(12),
    )
    .padding(24)
    .width(Length::Fill)
    .style(theme::card_style);

    container(card).padding(24).into()
}
