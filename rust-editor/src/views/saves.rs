use std::path::Path;

use iced::widget::{button, column, container, image, row, scrollable, stack, text, text_input, Space};
use iced::{Alignment, Element, Length};

use crate::env_detect::{GameEnvStatus, SaveSlotSummary, SavesSortMode, SnapshotInfo};
use crate::gamedata::PortraitCache;
use crate::i18n;
use crate::theme;
use crate::Message;

pub fn scroll_id() -> scrollable::Id {
    scrollable::Id::new("saves_scroll")
}

pub fn view<'a>(
    env: &'a GameEnvStatus,
    saves: &'a [SaveSlotSummary],
    snapshots: &'a [SnapshotInfo],
    auto_snapshot_banner: Option<&'a str>,
    portraits: &'a PortraitCache,
    active_path: Option<&'a Path>,
    search: &'a str,
    sort_mode: SavesSortMode,
    show_back_to_top: bool,
) -> Element<'a, Message> {
    let dir_label = env
        .decrypted_saves_dir
        .as_ref()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| "Decrypted save folder not detected".to_string());

    let header = row![
        column![
            row![
                text(i18n::tr("saves_title"))
                    .size(22)
                    .color(theme::TEXT_PRIMARY),
                container(
                    text(format!("{} {}", saves.len(), i18n::tr("found_suffix")))
                        .size(11)
                        .color(if saves.is_empty() {
                            theme::TEXT_MUTED
                        } else {
                            theme::ACCENT_CYAN
                        }),
                )
                .padding([3, 8])
                .style(theme::badge_style(if saves.is_empty() {
                    theme::TEXT_MUTED
                } else {
                    theme::ACCENT_CYAN
                })),
            ]
            .spacing(10)
            .align_y(Alignment::Center),
            text(dir_label).size(11).color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        Space::with_width(Length::Fill),
        button(
            row![
                theme::icon(theme::icons::ARCHIVE, 14.0),
                text(i18n::tr("create_snapshot")).size(12),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
        .padding([7, 14])
        .style(theme::secondary_button_style)
        .on_press(Message::CreateFullSnapshot),
        button(
            row![
                theme::icon(theme::icons::REFRESH, 14.0),
                text(i18n::tr("refresh")).size(12),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
        .padding([7, 14])
        .style(theme::primary_button_style)
        .on_press(Message::RefreshSaves),
        button(
            row![
                theme::icon(theme::icons::FOLDER_OPEN, 14.0),
                text(i18n::tr("open_single_file")).size(12),
            ]
            .spacing(6)
            .align_y(Alignment::Center),
        )
        .padding([7, 14])
        .style(theme::secondary_button_style)
        .on_press(Message::OpenFile),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    let mut content = column![header].spacing(14).padding(24);

    if let Some(snap_name) = auto_snapshot_banner {
        content = content.push(
            container(
                row![
                    container(text("FIRST-RUN BACKUP").size(10).color(theme::ACCENT_GREEN))
                        .padding([3, 8])
                        .style(theme::badge_style(theme::ACCENT_GREEN)),
                    column![
                        text("Automatic initial backup snapshot created!")
                            .size(13)
                            .color(theme::ACCENT_GREEN),
                        text(format!(
                            "All {} saves were safely archived to backups\\{} before any edits. You can restore anytime below.",
                            saves.len(),
                            snap_name
                        ))
                        .size(11)
                        .color(theme::TEXT_PRIMARY),
                    ]
                    .spacing(2)
                    .width(Length::Fill),
                    button(text(i18n::tr("dismiss")).size(11))
                        .padding([5, 10])
                        .style(theme::secondary_button_style)
                        .on_press(Message::DismissAutoSnapshotBanner),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
            )
            .padding(12)
            .width(Length::Fill)
            .style(theme::badge_style(theme::ACCENT_GREEN)),
        );
    }

    if env.edit_save_enabled == Some(false) {
        content = content.push(
            container(
                row![
                    container(text("CONFIG").size(10).color(theme::ACCENT_GOLD))
                        .padding([2, 7])
                        .style(theme::badge_style(theme::ACCENT_GOLD)),
                    text("EditSave is currently set to false in BepInEx\\config\\d3xMachina.suikoden_fix.cfg. Enable EditSave = true and save in-game to generate decrypted JSON saves.")
                        .size(12)
                        .color(theme::ACCENT_GOLD),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
            )
            .padding(12)
            .width(Length::Fill)
            .style(theme::badge_style(theme::ACCENT_GOLD)),
        );
    }

    // Full ZIP Backup Snapshots card (placed above the save files list)
    let mut snap_col = column![
        row![
            column![
                text(i18n::tr("snapshots_title"))
                    .size(15)
                    .color(theme::accent()),
                text("Dated ZIP archives of all decrypted saves stored inside backups\\.")
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ]
            .spacing(2),
            Space::with_width(Length::Fill),
            button(
                row![
                    theme::icon(theme::icons::ARCHIVE, 14.0),
                    text(i18n::tr("create_snapshot")).size(12),
                ]
                .spacing(6)
                .align_y(Alignment::Center),
            )
            .padding([6, 12])
            .style(theme::primary_button_style)
            .on_press(Message::CreateFullSnapshot),
        ]
        .align_y(Alignment::Center),
    ]
    .spacing(10);

    if snapshots.is_empty() {
        snap_col = snap_col.push(
            text("No full ZIP snapshots yet. Click \"Full Snapshot (.zip)\" to archive all saves.")
                .size(12)
                .color(theme::TEXT_MUTED),
        );
    } else {
        let mut snap_list = column![].spacing(6);
        for snap in snapshots {
            let zip_path = snap.path.clone();
            let delete_path = snap.path.clone();
            snap_list = snap_list.push(
                container(
                    row![
                        container(text("ZIP").size(10).color(theme::ACCENT_CYAN))
                            .padding([2, 7])
                            .style(theme::badge_style(theme::ACCENT_CYAN)),
                        column![
                            text(&snap.date_label)
                                .size(13)
                                .color(theme::TEXT_PRIMARY),
                            text(format!("{}  •  {} saves", snap.file_name, snap.file_count))
                                .size(11)
                                .color(theme::TEXT_MUTED),
                        ]
                        .spacing(2)
                        .width(Length::Fill),
                        button(
                            row![
                                theme::icon(theme::icons::RESTORE, 13.0),
                                text(i18n::tr("restore_all")).size(11),
                            ]
                            .spacing(5)
                            .align_y(Alignment::Center),
                        )
                        .padding([5, 12])
                        .style(theme::secondary_button_style)
                        .on_press(Message::RestoreFullSnapshot(zip_path)),
                        button(
                            row![
                                theme::icon(theme::icons::DELETE, 13.0),
                                text("Delete").size(11),
                            ]
                            .spacing(5)
                            .align_y(Alignment::Center),
                        )
                        .padding([5, 10])
                        .style(theme::danger_button_style)
                        .on_press(Message::DeleteFullSnapshot(delete_path)),
                    ]
                    .spacing(10)
                    .align_y(Alignment::Center),
                )
                .padding([8, 12])
                .width(Length::Fill)
                .style(theme::empty_slot_card_style),
            );
        }
        snap_col = snap_col.push(snap_list);
    }

    content = content.push(
        container(snap_col)
            .padding(16)
            .width(Length::Fill)
            .style(theme::card_style),
    );

    // Filter & sort toolbar
    let toolbar = row![
        text_input(i18n::tr("search_saves_placeholder"), search)
            .on_input(Message::SetSavesSearch)
            .padding(7)
            .size(12)
            .width(Length::Fixed(340.0))
            .style(theme::input_style),
        Space::with_width(Length::Fill),
        text(i18n::tr("sort")).size(12).color(theme::TEXT_MUTED),
        button(text(i18n::tr("most_recent")).size(12))
            .padding([6, 12])
            .style(if sort_mode == SavesSortMode::MostRecent {
                theme::primary_button_style
            } else {
                theme::secondary_button_style
            })
            .on_press(Message::SetSavesSort(SavesSortMode::MostRecent)),
        button(text(i18n::tr("slot_num")).size(12))
            .padding([6, 12])
            .style(if sort_mode == SavesSortMode::SlotNumber {
                theme::primary_button_style
            } else {
                theme::secondary_button_style
            })
            .on_press(Message::SetSavesSort(SavesSortMode::SlotNumber)),
    ]
    .spacing(8)
    .align_y(Alignment::Center);

    content = content.push(toolbar);

    let q = search.trim().to_ascii_lowercase();
    let mut filtered: Vec<&SaveSlotSummary> = saves
        .iter()
        .filter(|s| {
            if q.is_empty() {
                return true;
            }
            s.file_name.to_ascii_lowercase().contains(&q)
                || s.hero_name.to_ascii_lowercase().contains(&q)
                || s.castle_name.to_ascii_lowercase().contains(&q)
                || s.slot_num
                    .map(|n| n.to_string().contains(&q))
                    .unwrap_or(false)
        })
        .collect();

    match sort_mode {
        SavesSortMode::MostRecent => {
            filtered.sort_by(|a, b| {
                b.modified_secs
                    .cmp(&a.modified_secs)
                    .then_with(|| a.slot_num.cmp(&b.slot_num))
            });
        }
        SavesSortMode::SlotNumber => {
            filtered.sort_by(|a, b| {
                a.slot_num
                    .unwrap_or(u32::MAX)
                    .cmp(&b.slot_num.unwrap_or(u32::MAX))
                    .then_with(|| a.file_name.cmp(&b.file_name))
            });
        }
    }

    if filtered.is_empty() {
        let empty_msg = if saves.is_empty() {
            "No decrypted .json saves were found in SuikodenFix\\Decrypted\\gsd2.\nMake sure EditSave = true in SuikodenFix config and save your game once, or click \"Open Single File...\" to open a standalone JSON save."
        } else {
            "No save files match your current search filter."
        };
        content = content.push(
            container(
                column![
                    text(if saves.is_empty() {
                        "No Decrypted Saves Found"
                    } else {
                        "No Matching Saves"
                    })
                    .size(16)
                    .color(theme::accent()),
                    text(empty_msg).size(12).color(theme::TEXT_MUTED),
                ]
                .spacing(8),
            )
            .padding(24)
            .width(Length::Fill)
            .style(theme::card_style),
        );
    } else {
        let accent = theme::accent();
        let mut grid = column![].spacing(10);
        for chunk in filtered.chunks(2) {
            let mut r = row![].spacing(12);
            for save in chunk {
                let is_active = active_path
                    .map(|ap| ap == save.path.as_path())
                    .unwrap_or(false);

                let slot_badge_txt = match save.slot_num {
                    Some(n) => format!("Slot #{}", n),
                    None => "Save".to_string(),
                };

                let mut title_row = row![
                    text(&save.file_name)
                        .size(14)
                        .color(if is_active { accent } else { theme::TEXT_PRIMARY }),
                    container(text(slot_badge_txt).size(10).color(theme::ACCENT_CYAN))
                        .padding([2, 7])
                        .style(theme::badge_style(theme::ACCENT_CYAN)),
                ]
                .spacing(8)
                .align_y(Alignment::Center);

                if is_active {
                    title_row = title_row.push(
                        container(text(i18n::tr("loaded_badge")).size(10).color(theme::ACCENT_GREEN))
                            .padding([2, 7])
                            .style(theme::badge_style(theme::ACCENT_GREEN)),
                    );
                }

                let subtitle = if save.castle_name != "—" {
                    format!("{}  •  {} HQ", save.hero_name, save.castle_name)
                } else {
                    save.hero_name.clone()
                };

                let stats_row = row![
                    text(format!("{}: {}", i18n::tr("time_label"), save.play_time))
                        .size(11)
                        .color(theme::TEXT_MUTED),
                    text(format!("{}: {}", i18n::tr("potch_label"), format_with_commas(save.potch)))
                        .size(11)
                        .color(theme::TEXT_MUTED),
                    text(format!("{}: {}", i18n::tr("stars_label"), save.recruited_stars))
                        .size(11)
                        .color(theme::TEXT_MUTED),
                    Space::with_width(Length::Fill),
                    text(&save.date_saved)
                        .size(10)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(12)
                .align_y(Alignment::Center);

                let mut party_strip = row![].spacing(4).align_y(Alignment::Center);
                let mut has_any_portrait = false;
                for &cid in &save.party_members[0..6] {
                    if cid > 0 {
                        if let Some(handle) = portraits.get(cid) {
                            has_any_portrait = true;
                            party_strip = party_strip.push(
                                container(image(handle).width(30).height(30))
                                    .padding(2)
                                    .style(theme::portrait_card_style(false)),
                            );
                        }
                    }
                }
                let has_convoy = save.party_members[6..8]
                    .iter()
                    .any(|&cid| cid > 0 && portraits.get(cid).is_some());
                if has_convoy {
                    if has_any_portrait {
                        party_strip = party_strip.push(
                            text("•").size(12).color(theme::TEXT_MUTED),
                        );
                    }
                    for &cid in &save.party_members[6..8] {
                        if cid > 0 {
                            if let Some(handle) = portraits.get(cid) {
                                has_any_portrait = true;
                                party_strip = party_strip.push(
                                    container(image(handle).width(30).height(30))
                                        .padding(2)
                                        .style(theme::portrait_card_style(true)),
                                );
                            }
                        }
                    }
                }

                let left_info = column![
                    title_row,
                    text(subtitle).size(12).color(theme::TEXT_PRIMARY),
                ]
                .spacing(4);

                let mut top_section = row![
                    left_info,
                    Space::with_width(Length::Fill),
                ]
                .spacing(8)
                .align_y(Alignment::Center);

                if has_any_portrait {
                    top_section = top_section.push(party_strip);
                }

                let card_col = column![top_section, stats_row].spacing(8);

                let path_clone = save.path.clone();
                let open_card = button(card_col)
                    .padding([10, 14])
                    .width(Length::Fill)
                    .style(theme::accent_choice_button_style(is_active, accent))
                    .on_press(Message::SelectManagedSave(path_clone));

                let slot_widget: Element<'a, Message> = if save.has_backup {
                    let restore_path = save.path.clone();
                    let note_text = if save.backup_differs {
                        "Backup differs from current save"
                    } else {
                        "Backup matches current save (identical)"
                    };
                    let note_color = if save.backup_differs {
                        theme::ACCENT_GOLD
                    } else {
                        theme::TEXT_MUTED
                    };
                    column![
                        open_card,
                        row![
                            text(note_text)
                                .size(10)
                                .color(note_color),
                            Space::with_width(Length::Fill),
                            button(
                                row![
                                    theme::icon(theme::icons::RESTORE, 13.0),
                                    text(i18n::tr("restore_bak")).size(11),
                                ]
                                .spacing(4)
                                .align_y(Alignment::Center),
                            )
                            .padding([3, 10])
                            .style(if save.backup_differs {
                                theme::primary_button_style
                            } else {
                                theme::secondary_button_style
                            })
                            .on_press(Message::OpenRestoreModal(restore_path)),
                        ]
                        .align_y(Alignment::Center)
                        .padding([2, 6]),
                    ]
                    .spacing(4)
                    .width(Length::FillPortion(1))
                    .into()
                } else {
                    container(open_card)
                        .width(Length::FillPortion(1))
                        .into()
                };

                r = r.push(slot_widget);
            }
            if chunk.len() == 1 {
                r = r.push(Space::with_width(Length::FillPortion(1)));
            }
            grid = grid.push(r);
        }
        content = content.push(grid);
    }

    let scroll_view = scrollable(content)
        .id(scroll_id())
        .on_scroll(|vp| Message::SavesScrolled(vp.absolute_offset().y))
        .height(Length::Fill)
        .style(theme::scrollable_style);

    let mut root = stack![scroll_view];

    if show_back_to_top {
        let top_btn = button(
            row![
                theme::icon(theme::icons::ARROW_UPWARD, 15.0),
                text("Top").size(12),
            ]
            .spacing(5)
            .align_y(Alignment::Center),
        )
        .padding([8, 14])
        .style(theme::primary_button_style)
        .on_press(Message::ScrollSavesToTop);

        let overlay = container(top_btn)
            .width(Length::Fill)
            .height(Length::Fill)
            .align_x(iced::alignment::Horizontal::Right)
            .align_y(iced::alignment::Vertical::Bottom)
            .padding(24);

        root = root.push(overlay);
    }

    root.into()
}

fn format_with_commas(n: i64) -> String {
    let neg = n < 0;
    let s = n.abs().to_string();
    let mut out = String::with_capacity(s.len() + s.len() / 3);
    for (i, ch) in s.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            out.push(',');
        }
        out.push(ch);
    }
    if neg {
        out.push('-');
    }
    out.chars().rev().collect()
}
