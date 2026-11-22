use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use iced::widget::{
    button, column, container, horizontal_rule, mouse_area, row, scrollable, text, text_input,
    Space,
};
use iced::{Alignment, Element, Length};
use serde_json::Value;

use crate::data::resolve_inventory_item;
use crate::gamedata::character_name;
use crate::save_file::backup_path_for_save;
use crate::theme;
use crate::Message;

#[derive(Debug, Clone)]
pub struct SaveOverview {
    pub hero_name: String,
    pub castle_name: String,
    pub potch: i64,
    pub play_time: String,
    pub recruited_stars: usize,
    pub file_size: u64,
    pub modified_label: String,
}

#[derive(Debug, Clone)]
pub struct DiffEntry {
    pub category: &'static str,
    pub label: String,
    pub path: String,
    pub current_val: String,
    pub backup_val: String,
    pub detail: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RestoreModalState {
    pub save_path: PathBuf,
    pub file_name: String,
    pub current_overview: SaveOverview,
    pub backup_overview: SaveOverview,
    pub diffs: Vec<DiffEntry>,
    pub search: String,
}

impl RestoreModalState {
    pub fn load(save_path: PathBuf) -> Result<Self, String> {
        let backup_path = backup_path_for_save(&save_path);
        if !backup_path.is_file() {
            return Err(format!(
                "No backup file found at '{}'",
                backup_path.display()
            ));
        }

        let current_val = read_save_json(&save_path)?;
        let backup_val = read_save_json(&backup_path)?;

        let file_name = save_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("save.json")
            .to_string();

        let current_overview = extract_overview(&save_path, &current_val);
        let backup_overview = extract_overview(&backup_path, &backup_val);

        let mut diffs = Vec::new();
        collect_diffs("", &current_val, &backup_val, &mut diffs);

        Ok(Self {
            save_path,
            file_name,
            current_overview,
            backup_overview,
            diffs,
            search: String::new(),
        })
    }
}

fn read_save_json(path: &Path) -> Result<Value, String> {
    let raw = std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read '{}': {}", path.display(), e))?;
    let clean = raw.trim_start_matches('\u{FEFF}');
    serde_json::from_str(clean)
        .map_err(|e| format!("Invalid JSON in '{}': {}", path.display(), e))
}

fn extract_overview(path: &Path, data: &Value) -> SaveOverview {
    let hero_name = data
        .get("game_data")
        .and_then(|g| g.get("bozu_name"))
        .and_then(|v| v.as_str())
        .filter(|s| !s.trim().is_empty())
        .unwrap_or("—")
        .to_string();

    let castle_name = data
        .get("game_data")
        .and_then(|g| g.get("base_name"))
        .and_then(|v| v.as_str())
        .filter(|s| !s.trim().is_empty())
        .unwrap_or("—")
        .to_string();

    let potch = data
        .get("party_data")
        .and_then(|p| p.get("gold"))
        .and_then(|v| v.as_i64())
        .unwrap_or(0);

    let play_time = data
        .get("game_data")
        .and_then(|g| g.get("play_time"))
        .and_then(|v| v.as_array())
        .map(|a| {
            let h = a.first().and_then(|v| v.as_i64()).unwrap_or(0);
            let m = a.get(1).and_then(|v| v.as_i64()).unwrap_or(0);
            let s = a.get(2).and_then(|v| v.as_i64()).unwrap_or(0);
            format!("{:02}:{:02}:{:02}", h, m, s)
        })
        .unwrap_or_else(|| "00:00:00".to_string());

    let recruited_stars = data
        .get("chara_flag")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .enumerate()
                .skip(1)
                .take(108)
                .filter(|(_, v)| v.as_i64().unwrap_or(0) > 0)
                .count()
        })
        .unwrap_or(0);

    let meta = std::fs::metadata(path).ok();
    let file_size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
    let modified_label = meta
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| format_unix_timestamp(d.as_secs()))
        .unwrap_or_else(|| "Unknown".to_string());

    SaveOverview {
        hero_name,
        castle_name,
        potch,
        play_time,
        recruited_stars,
        file_size,
        modified_label,
    }
}

fn format_unix_timestamp(secs: u64) -> String {
    // Simple UTC-free calendar conversion (matches readable YYYY-MM-DD HH:MM)
    let days = (secs / 86400) as i64;
    let rem = secs % 86400;
    let hh = rem / 3600;
    let mm = (rem % 3600) / 60;
    let ss = rem % 60;

    // Civil from days (Howard Hinnant algorithm)
    let z = days + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = (yoe as i64) + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = if m <= 2 { y + 1 } else { y };

    format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", year, m, d, hh, mm, ss)
}

fn format_commas(n: i64) -> String {
    let neg = n < 0;
    let s = n.unsigned_abs().to_string();
    let mut out = String::with_capacity(s.len() + s.len() / 3 + 1);
    if neg {
        out.push('-');
    }
    for (i, ch) in s.chars().enumerate() {
        if i > 0 && (s.len() - i) % 3 == 0 {
            out.push(',');
        }
        out.push(ch);
    }
    out
}

fn collect_diffs(prefix: &str, cur: &Value, bak: &Value, out: &mut Vec<DiffEntry>) {
    if cur == bak {
        return;
    }

    // Special-case inventory slot objects `{ item_no, use_cnt }` so both fields show as one readable entry
    if let (Value::Object(cm), Value::Object(bm)) = (cur, bak) {
        if cm.contains_key("item_no") && cm.contains_key("use_cnt") && cm.len() <= 3 {
            let c_id = cm.get("item_no").and_then(|v| v.as_i64()).unwrap_or(0);
            let c_cnt = cm.get("use_cnt").and_then(|v| v.as_i64()).unwrap_or(0);
            let b_id = bm.get("item_no").and_then(|v| v.as_i64()).unwrap_or(0);
            let b_cnt = bm.get("use_cnt").and_then(|v| v.as_i64()).unwrap_or(0);
            let (cat, lbl) = friendly_label(prefix);
            out.push(DiffEntry {
                category: cat,
                label: lbl,
                path: prefix.to_string(),
                current_val: format_item_slot(c_id, c_cnt),
                backup_val: format_item_slot(b_id, b_cnt),
                detail: None,
            });
            return;
        }

        // Collect union of keys in deterministic order (current keys first, then any backup-only keys)
        let mut keys: Vec<&String> = cm.keys().collect();
        for k in bm.keys() {
            if !cm.contains_key(k) {
                keys.push(k);
            }
        }
        for k in keys {
            let child_path = if prefix.is_empty() {
                k.clone()
            } else {
                format!("{}.{}", prefix, k)
            };
            match (cm.get(k), bm.get(k)) {
                (Some(cv), Some(bv)) => collect_diffs(&child_path, cv, bv, out),
                (Some(cv), None) => {
                    let (cat, lbl) = friendly_label(&child_path);
                    out.push(DiffEntry {
                        category: cat,
                        label: lbl,
                        path: child_path,
                        current_val: format_scalar(cv),
                        backup_val: "(absent)".to_string(),
                        detail: None,
                    });
                }
                (None, Some(bv)) => {
                    let (cat, lbl) = friendly_label(&child_path);
                    out.push(DiffEntry {
                        category: cat,
                        label: lbl,
                        path: child_path,
                        current_val: "(absent)".to_string(),
                        backup_val: format_scalar(bv),
                        detail: None,
                    });
                }
                (None, None) => {}
            }
        }
        return;
    }

    if let (Value::Array(ca), Value::Array(ba)) = (cur, bak) {
        let max_len = ca.len().max(ba.len());
        for i in 0..max_len {
            let child_path = format!("{}[{}]", prefix, i);
            match (ca.get(i), ba.get(i)) {
                (Some(cv), Some(bv)) => collect_diffs(&child_path, cv, bv, out),
                (Some(cv), None) => {
                    let (cat, lbl) = friendly_label(&child_path);
                    out.push(DiffEntry {
                        category: cat,
                        label: lbl,
                        path: child_path,
                        current_val: format_scalar(cv),
                        backup_val: "(absent)".to_string(),
                        detail: None,
                    });
                }
                (None, Some(bv)) => {
                    let (cat, lbl) = friendly_label(&child_path);
                    out.push(DiffEntry {
                        category: cat,
                        label: lbl,
                        path: child_path,
                        current_val: "(absent)".to_string(),
                        backup_val: format_scalar(bv),
                        detail: None,
                    });
                }
                (None, None) => {}
            }
        }
        return;
    }

    // Leaf scalar difference
    let (cat, lbl) = friendly_label(prefix);
    let (cur_str, bak_str, detail) = format_leaf_diff(prefix, cur, bak);
    out.push(DiffEntry {
        category: cat,
        label: lbl,
        path: prefix.to_string(),
        current_val: cur_str,
        backup_val: bak_str,
        detail,
    });
}

fn format_item_slot(item_no: i64, use_cnt: i64) -> String {
    if item_no == 0 && use_cnt == 0 {
        "Empty".to_string()
    } else {
        let (cat, name) = resolve_inventory_item(item_no, use_cnt);
        format!("[{}] {} (#{}, cnt:{})", cat, name, item_no, use_cnt)
    }
}

fn format_scalar(v: &Value) -> String {
    match v {
        Value::Null => "null".to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Number(n) => n.to_string(),
        Value::String(s) => format!("\"{}\"", s),
        Value::Array(a) => format!("[{} items]", a.len()),
        Value::Object(m) => format!("{{{} keys}}", m.len()),
    }
}

fn format_leaf_diff(path: &str, cur: &Value, bak: &Value) -> (String, String, Option<String>) {
    if path == "party_data.gold" {
        if let (Some(c), Some(b)) = (cur.as_i64(), bak.as_i64()) {
            return (
                format!("{} Potch", format_commas(c)),
                format!("{} Potch", format_commas(b)),
                None,
            );
        }
    }

    // Bitfield byte arrays: show decimal + hex + exact bit changes
    let is_bitfield = path.starts_with("event_flag[")
        || path.starts_with("game_data.hon_flag[")
        || path.starts_with("t_box_flag[")
        || path == "game_data.lib_flag";
    if is_bitfield {
        if let (Some(c), Some(b)) = (cur.as_i64(), bak.as_i64()) {
            let cu = c as u32;
            let bu = b as u32;
            let xor = cu ^ bu;
            let mut bits = Vec::new();
            for bit in 0..16 {
                let mask = 1u32 << bit;
                if (xor & mask) != 0 {
                    if (bu & mask) != 0 {
                        bits.push(format!("+Bit {} (0x{:02X})", bit, mask));
                    } else {
                        bits.push(format!("-Bit {} (0x{:02X})", bit, mask));
                    }
                }
            }
            let detail = if bits.is_empty() {
                None
            } else {
                Some(format!("Restoring changes bits: {}", bits.join(", ")))
            };
            if path == "game_data.lib_flag" {
                return (
                    format!("{} (0x{:04X})", c, cu),
                    format!("{} (0x{:04X})", b, bu),
                    detail,
                );
            }
            return (
                format!("{} (0x{:02X})", c, cu & 0xFF),
                format!("{} (0x{:02X})", b, bu & 0xFF),
                detail,
            );
        }
    }

    if path.starts_with("party_data.party_cha_no[") {
        if let (Some(c), Some(b)) = (cur.as_i64(), bak.as_i64()) {
            let cn = if c > 0 {
                format!("{} (#{})", character_name(c), c)
            } else {
                "Empty (0)".to_string()
            };
            let bn = if b > 0 {
                format!("{} (#{})", character_name(b), b)
            } else {
                "Empty (0)".to_string()
            };
            return (cn, bn, None);
        }
    }

    (format_scalar(cur), format_scalar(bak), None)
}

fn parse_bracket_index(s: &str) -> Option<usize> {
    let start = s.find('[')? + 1;
    let end = s[start..].find(']')? + start;
    s[start..end].parse::<usize>().ok()
}

fn friendly_label(path: &str) -> (&'static str, String) {
    match path {
        "party_data.gold" => ("General", "Potch (Gold)".to_string()),
        "game_data.bozu_name" => ("General", "Hero Name".to_string()),
        "game_data.base_name" => ("General", "Castle HQ Name".to_string()),
        "game_data.play_time" => ("General", "Play Time".to_string()),
        "game_data.nige_cnt" => ("General", "Escaped Battles".to_string()),
        "game_data.base_lv" => ("Castle", "Castle Level".to_string()),
        "game_data.kaji_lv" => ("Castle", "Blacksmith Level".to_string()),
        "game_data.lib_flag" => ("Castle", "Library Old Books Bitmask".to_string()),
        "game_data.se_set" => ("Castle", "Active Sound Set".to_string()),
        "game_data.win_col" => ("Castle", "Window Frame Color".to_string()),
        "game_data.win_suke" => ("Castle", "Window Opacity".to_string()),
        _ if path.starts_with("chara_flag[") => {
            if let Some(idx) = parse_bracket_index(path) {
                let name = character_name(idx as i64);
                ("Recruitment", format!("{} (Star #{})", name, idx))
            } else {
                ("Recruitment", path.to_string())
            }
        }
        _ if path.starts_with("chara_data[") => {
            if let Some(idx) = parse_bracket_index(path) {
                let name = character_name(idx as i64);
                let field = path.split("].").nth(1).unwrap_or("");
                ("Character", format!("{} — {}", name, field))
            } else {
                ("Character", path.to_string())
            }
        }
        _ if path.starts_with("party_data.party_cha_no[") => {
            if let Some(idx) = parse_bracket_index(path) {
                let slot = if idx < 6 {
                    format!("Party Slot #{}", idx + 1)
                } else {
                    format!("Convoy Slot #{}", idx - 5)
                };
                ("Party", slot)
            } else {
                ("Party", path.to_string())
            }
        }
        _ if path.starts_with("party_data.party_item[") => {
            if let Some(idx) = parse_bracket_index(path) {
                ("Inventory", format!("Party Bag Slot #{}", idx + 1))
            } else {
                ("Inventory", path.to_string())
            }
        }
        _ if path.starts_with("game_data.base_item[") => {
            if let Some(idx) = parse_bracket_index(path) {
                ("Inventory", format!("Warehouse Slot #{}", idx + 1))
            } else {
                ("Inventory", path.to_string())
            }
        }
        _ if path.starts_with("game_data.room_item[") => {
            if let Some(idx) = parse_bracket_index(path) {
                ("Inventory", format!("Room Item Slot #{}", idx + 1))
            } else {
                ("Inventory", path.to_string())
            }
        }
        _ if path.starts_with("event_flag[") => {
            if let Some(idx) = parse_bracket_index(path) {
                let note = match idx {
                    77 => " (Tenkou Window Sets)",
                    78 => " (Connell Sound Sets)",
                    143 => " (Tessai Blacksmith Hammers)",
                    _ => "",
                };
                ("Event Flag", format!("event_flag[{}]{}", idx, note))
            } else {
                ("Event Flag", path.to_string())
            }
        }
        _ if path.starts_with("game_data.hon_flag[") => {
            if let Some(idx) = parse_bracket_index(path) {
                ("Castle", format!("Castle Flag hon_flag[{}]", idx))
            } else {
                ("Castle", path.to_string())
            }
        }
        _ if path.starts_with("game_data.parts_no[") => {
            if let Some(idx) = parse_bracket_index(path) {
                ("Castle", format!("Guardian Deity parts_no[{}]", idx))
            } else {
                ("Castle", path.to_string())
            }
        }
        _ if path.starts_with("game_data.food_") => ("Cooking", path.replace("game_data.", "")),
        _ if path.starts_with("t_box_flag[") => {
            if let Some(idx) = parse_bracket_index(path) {
                ("Treasure", format!("Treasure Chest Byte [{}]", idx))
            } else {
                ("Treasure", path.to_string())
            }
        }
        _ if path.starts_with("game_data.") => ("General", path.replace("game_data.", "")),
        _ if path.starts_with("party_data.") => ("Party", path.replace("party_data.", "")),
        _ => ("Other", path.to_string()),
    }
}

fn category_color(cat: &str) -> iced::Color {
    match cat {
        "General" | "Party" => theme::ACCENT_CYAN,
        "Character" | "Recruitment" => theme::ACCENT_GOLD,
        "Inventory" | "Castle" | "Cooking" => theme::ACCENT_GREEN,
        "Event Flag" | "Treasure" => theme::accent(),
        _ => theme::TEXT_MUTED,
    }
}

pub fn view<'a>(modal: &'a RestoreModalState) -> Element<'a, Message> {
    let q = modal.search.trim().to_ascii_lowercase();
    let filtered: Vec<&DiffEntry> = modal
        .diffs
        .iter()
        .filter(|d| {
            if q.is_empty() {
                return true;
            }
            d.label.to_ascii_lowercase().contains(&q)
                || d.path.to_ascii_lowercase().contains(&q)
                || d.category.to_ascii_lowercase().contains(&q)
                || d.current_val.to_ascii_lowercase().contains(&q)
                || d.backup_val.to_ascii_lowercase().contains(&q)
                || d.detail
                    .as_ref()
                    .map(|s| s.to_ascii_lowercase().contains(&q))
                    .unwrap_or(false)
        })
        .collect();

    let diff_count = modal.diffs.len();
    let diff_badge_color = if diff_count == 0 {
        theme::ACCENT_GREEN
    } else {
        theme::ACCENT_GOLD
    };
    let diff_badge_text = if diff_count == 0 {
        "Identical (0 Changes)".to_string()
    } else if diff_count == 1 {
        "1 Field Changed".to_string()
    } else {
        format!("{} Fields Changed", diff_count)
    };

    let header = row![
        column![
            row![
                text(format!("Restore Backup — {}", modal.file_name))
                    .size(18)
                    .color(theme::ACCENT_GOLD),
                container(text(diff_badge_text).size(11).color(diff_badge_color))
                    .padding([2, 8])
                    .style(theme::badge_style(diff_badge_color)),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            text(format!(
                "Comparing current save against backups\\{}.bak before restoring.",
                modal.file_name
            ))
            .size(11)
            .color(theme::TEXT_MUTED),
        ]
        .spacing(2),
        Space::with_width(Length::Fill),
        button(text(crate::i18n::tr("close")).size(12))
            .padding([6, 12])
            .style(theme::secondary_button_style)
            .on_press(Message::CloseRestoreModal),
    ]
    .align_y(Alignment::Center);

    let cur = &modal.current_overview;
    let bak = &modal.backup_overview;

    let hero_diff = cur.hero_name != bak.hero_name || cur.castle_name != bak.castle_name;
    let time_diff = cur.play_time != bak.play_time;
    let potch_diff = cur.potch != bak.potch;
    let stars_diff = cur.recruited_stars != bak.recruited_stars;

    let overview_row = row![
        overview_card(
            "CURRENT SAVE (WILL BE REPLACED)",
            theme::ACCENT_RED,
            cur,
            hero_diff,
            time_diff,
            potch_diff,
            stars_diff,
        ),
        overview_card(
            "BACKUP (.BAK — WILL BE RESTORED)",
            theme::ACCENT_GREEN,
            bak,
            hero_diff,
            time_diff,
            potch_diff,
            stars_diff,
        ),
    ]
    .spacing(12);

    let mut list = column![].spacing(6);
    if modal.diffs.is_empty() {
        list = list.push(
            container(
                column![
                    text("No Differences Detected")
                        .size(14)
                        .color(theme::ACCENT_GREEN),
                    text("The current save file and its .bak backup contain identical JSON data.")
                        .size(12)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(4)
                .align_x(Alignment::Center),
            )
            .padding(28)
            .center_x(Length::Fill)
            .style(theme::empty_slot_card_style),
        );
    } else if filtered.is_empty() {
        list = list.push(
            container(
                text("No changed fields match your search filter.")
                    .size(13)
                    .color(theme::TEXT_MUTED),
            )
            .padding(24)
            .center_x(Length::Fill),
        );
    } else {
        const MAX_ROWS: usize = 250;
        for entry in filtered.iter().take(MAX_ROWS) {
            let cat_col = category_color(entry.category);
            let mut row_col = column![
                row![
                    container(text(entry.category).size(10).color(cat_col))
                        .padding([2, 7])
                        .style(theme::badge_style(cat_col)),
                    text(&entry.label)
                        .size(12)
                        .color(theme::TEXT_PRIMARY),
                    Space::with_width(Length::Fill),
                    text(&entry.path).size(10).color(theme::TEXT_MUTED),
                ]
                .spacing(8)
                .align_y(Alignment::Center),
                row![
                    container(
                        text(format!("Current: {}", entry.current_val))
                            .size(11)
                            .color(theme::ACCENT_RED),
                    )
                    .padding([3, 8])
                    .style(theme::badge_style(theme::ACCENT_RED)),
                    text("→").size(12).color(theme::TEXT_MUTED),
                    container(
                        text(format!("Backup: {}", entry.backup_val))
                            .size(11)
                            .color(theme::ACCENT_GREEN),
                    )
                    .padding([3, 8])
                    .style(theme::badge_style(theme::ACCENT_GREEN)),
                ]
                .spacing(8)
                .align_y(Alignment::Center),
            ]
            .spacing(5);

            if let Some(detail) = &entry.detail {
                row_col = row_col.push(text(detail).size(10).color(theme::ACCENT_GOLD));
            }

            list = list.push(
                container(row_col)
                    .padding([8, 12])
                    .width(Length::Fill)
                    .style(theme::empty_slot_card_style),
            );
        }

        if filtered.len() > MAX_ROWS {
            list = list.push(
                container(
                    text(format!(
                        "Showing first {} of {} matching changes — use the search box to narrow results.",
                        MAX_ROWS,
                        filtered.len()
                    ))
                    .size(11)
                    .color(theme::TEXT_MUTED),
                )
                .padding(10)
                .center_x(Length::Fill),
            );
        }
    }

    let restore_path = modal.save_path.clone();
    let footer = row![
        text(format!(
            "Overwrites {} with backups\\{}.bak",
            modal.file_name, modal.file_name
        ))
        .size(11)
        .color(theme::TEXT_MUTED),
        Space::with_width(Length::Fill),
        button(text(crate::i18n::tr("cancel")).size(12))
            .padding([7, 14])
            .style(theme::secondary_button_style)
            .on_press(Message::CloseRestoreModal),
        button(
            row![
                theme::icon(theme::icons::RESTORE, 14.0),
                text("Confirm & Restore Backup").size(12),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
        .padding([7, 16])
        .style(theme::primary_button_style)
        .on_press(Message::ConfirmRestoreSaveBackup(restore_path)),
    ]
    .spacing(10)
    .align_y(Alignment::Center);

    let dialog = container(
        column![
            header,
            horizontal_rule(1),
            overview_row,
            text_input(
                "Filter changes by field, character, item, flag, or value...",
                &modal.search
            )
            .on_input(Message::SetRestoreModalSearch)
            .padding(8)
            .size(12)
            .style(theme::input_style),
            scrollable(list)
                .height(Length::Fixed(320.0))
                .style(theme::scrollable_style),
            horizontal_rule(1),
            footer,
        ]
        .spacing(12),
    )
    .padding(20)
    .width(Length::Fixed(860.0))
    .style(theme::modal_card_style);

    let modal_layer = container(mouse_area(dialog).on_press(Message::NoOp))
        .width(Length::Fill)
        .height(Length::Fill)
        .center_x(Length::Fill)
        .center_y(Length::Fill)
        .style(theme::modal_backdrop_style);

    mouse_area(modal_layer)
        .on_press(Message::CloseRestoreModal)
        .into()
}

fn overview_card<'a>(
    title: &'static str,
    accent: iced::Color,
    info: &'a SaveOverview,
    hero_diff: bool,
    time_diff: bool,
    potch_diff: bool,
    stars_diff: bool,
) -> Element<'a, Message> {
    let val_color = |changed: bool| {
        if changed {
            accent
        } else {
            theme::TEXT_PRIMARY
        }
    };

    container(
        column![
            container(text(title).size(10).color(accent))
                .padding([2, 7])
                .style(theme::badge_style(accent)),
            row![
                text(format!("{} • {} HQ", info.hero_name, info.castle_name))
                    .size(12)
                    .color(val_color(hero_diff)),
                Space::with_width(Length::Fill),
                text(format!("{:.1} KB", info.file_size as f64 / 1024.0))
                    .size(10)
                    .color(theme::TEXT_MUTED),
            ]
            .align_y(Alignment::Center),
            row![
                text(format!("Time: {}", info.play_time))
                    .size(11)
                    .color(val_color(time_diff)),
                text(format!("Potch: {}", format_commas(info.potch)))
                    .size(11)
                    .color(val_color(potch_diff)),
                text(format!("Stars: {}", info.recruited_stars))
                    .size(11)
                    .color(val_color(stars_diff)),
            ]
            .spacing(12),
            text(format!("Modified: {}", info.modified_label))
                .size(10)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(5),
    )
    .padding(10)
    .width(Length::FillPortion(1))
    .style(theme::empty_slot_card_style)
    .into()
}
