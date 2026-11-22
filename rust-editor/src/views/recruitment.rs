use iced::widget::{
    button, checkbox, column, container, image, pick_list, row, scrollable, text, text_input, Space,
};
use iced::{Alignment, Element, Length};

use crate::gamedata::{character_name, PortraitCache, RecruitStatus};
use crate::save_file::SaveDocument;
use crate::theme;
use crate::Message;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum RecruitFilter {
    #[default]
    All,
    Recruited,
    SpokeTo,
    NotRecruited,
    Other,
}

impl RecruitFilter {
    pub const ALL: &'static [RecruitFilter] = &[
        RecruitFilter::All,
        RecruitFilter::Recruited,
        RecruitFilter::SpokeTo,
        RecruitFilter::NotRecruited,
        RecruitFilter::Other,
    ];

    pub fn label(self) -> &'static str {
        match self {
            RecruitFilter::All => "All",
            RecruitFilter::Recruited => "Recruited",
            RecruitFilter::SpokeTo => "Spoke To",
            RecruitFilter::NotRecruited => "Not Recruited",
            RecruitFilter::Other => "Deceased / Leave",
        }
    }
}

pub fn view<'a>(
    doc: &'a SaveDocument,
    portraits: &'a PortraitCache,
    search: &'a str,
    filter: RecruitFilter,
    better_leona: bool,
    kraken_patch: bool,
) -> Element<'a, Message> {
    let q = search.trim().to_lowercase();
    let has_s1_transfer = !doc.get_str(Some("game_data"), "macd_name").trim().is_empty();

    let valeria_rec = RecruitStatus::from_flag(doc.get_chara_flag(12)).is_recruited();
    let kasumi_rec = RecruitStatus::from_flag(doc.get_chara_flag(73)).is_recruited();
    let chuchara_rec = RecruitStatus::from_flag(doc.get_chara_flag(79)).is_recruited();

    let mut recruited_total = 0usize;
    let mut matching: Vec<(usize, i64, Option<&'static str>)> = Vec::new();

    for idx in 1..=125 {
        if idx == 84 {
            continue;
        }
        let flag = doc.get_chara_flag(idx);
        let status = RecruitStatus::from_flag(flag);

        let mod_override: Option<&'static str> = if !status.is_recruited() {
            if has_s1_transfer && (idx == 82 || idx == 125) {
                Some("Recruited (S1)")
            } else if better_leona && ((idx == 12 && kasumi_rec) || (idx == 73 && valeria_rec)) {
                Some("Recruited (SFix)")
            } else if kraken_patch && (idx == 49 || idx == 74) && chuchara_rec {
                Some("Recruited (Kraken)")
            } else {
                None
            }
        } else {
            None
        };

        let effective_recruited = status.is_recruited() || mod_override.is_some();
        if effective_recruited {
            recruited_total += 1;
        }

        let name = character_name(idx as i64);
        let matches_query = q.is_empty()
            || name.to_lowercase().contains(&q)
            || idx.to_string().contains(&q);

        let matches_filter = match filter {
            RecruitFilter::All => true,
            RecruitFilter::Recruited => effective_recruited,
            RecruitFilter::SpokeTo => !effective_recruited && matches!(status, RecruitStatus::SpokeTo),
            RecruitFilter::NotRecruited => {
                !effective_recruited && matches!(status, RecruitStatus::NotRecruited)
            }
            RecruitFilter::Other => matches!(
                status,
                RecruitStatus::Deceased | RecruitStatus::OnLeave | RecruitStatus::Custom(_)
            ),
        };

        if matches_query && matches_filter {
            matching.push((idx, flag, mod_override));
        }
    }

    let mods_card = container(
        row![
            text("Recruitment Mods:")
                .size(12)
                .color(theme::ACCENT_GOLD),
            checkbox("Better Leona Option (Valeria + Kasumi)", better_leona)
                .on_toggle(Message::SetBetterLeonaMod)
                .text_size(12),
            checkbox("Kraken Patch (Chuchara → Abizboah & Rulodia)", kraken_patch)
                .on_toggle(Message::SetKrakenPatchMod)
                .text_size(12),
            Space::with_width(Length::Fill),
            text("Un-recruiting auto-clears story flags")
                .size(11)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(16)
        .align_y(Alignment::Center),
    )
    .padding([10, 14])
    .width(Length::Fill)
    .style(theme::card_style);

    let mut filter_row = row![].spacing(6).align_y(Alignment::Center);
    for &f in RecruitFilter::ALL {
        let active = f == filter;
        filter_row = filter_row.push(
            button(text(f.label()).size(12))
                .padding([6, 12])
                .style(theme::nav_button_style(active))
                .on_press(Message::SetRecruitFilter(f)),
        );
    }

    let toolbar = container(
        row![
            text_input("Search character by name or ID...", search)
                .on_input(Message::SetRecruitSearch)
                .padding(8)
                .size(13)
                .width(Length::Fixed(280.0))
                .style(theme::input_style),
            filter_row,
            Space::with_width(Length::Fill),
            container(
                text(format!("Recruited: {} / 124", recruited_total))
                    .size(13)
                    .color(theme::ACCENT_GOLD),
            )
            .padding([6, 12])
            .style(theme::badge_style(theme::ACCENT_GOLD)),
        ]
        .spacing(12)
        .align_y(Alignment::Center),
    )
    .padding(14)
    .width(Length::Fill)
    .style(theme::card_style);

    let mut grid = column![].spacing(12);
    for chunk in matching.chunks(4) {
        let mut r = row![].spacing(12);
        for &(idx, flag, mod_override) in chunk {
            r = r.push(character_card(idx, flag, mod_override, portraits));
        }
        for _ in chunk.len()..4 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        grid = grid.push(r);
    }

    let content = column![
        column![
            text("Recruited Characters (108 Stars & Extras)")
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text(format!(
                "Showing {} of 124 characters",
                matching.len(),
            ))
            .size(13)
            .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        mods_card,
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

fn character_card<'a>(
    idx: usize,
    flag: i64,
    mod_override: Option<&'static str>,
    portraits: &'a PortraitCache,
) -> Element<'a, Message> {
    let status = RecruitStatus::from_flag(flag);
    let name = character_name(idx as i64);

    let (badge_text, badge_color) = if let Some(override_lbl) = mod_override {
        (override_lbl, theme::ACCENT_GREEN)
    } else {
        match status {
            RecruitStatus::AutoJoin | RecruitStatus::ManualRecruit => ("Recruited", theme::ACCENT_GREEN),
            RecruitStatus::EventLocked => ("Event Locked", theme::ACCENT_GOLD),
            RecruitStatus::SpokeTo => ("Spoke To", theme::ACCENT_CYAN),
            RecruitStatus::Deceased => ("Deceased", theme::ACCENT_RED),
            RecruitStatus::OnLeave => ("On Leave", theme::ACCENT_GOLD),
            RecruitStatus::NotRecruited => ("Not Recruited", theme::TEXT_MUTED),
            RecruitStatus::Custom(_) => ("Custom", theme::ACCENT_CYAN),
        }
    };

    let portrait: Element<'a, Message> = if let Some(handle) = portraits.get(idx as i64) {
        image(handle).width(58).height(58).into()
    } else {
        container(text("?").size(18).color(theme::TEXT_MUTED))
            .width(58)
            .height(58)
            .center_x(Length::Fixed(58.0))
            .center_y(Length::Fixed(58.0))
            .into()
    };

    let picker = pick_list(RecruitStatus::ALL, Some(status), move |new_status| {
        Message::SetCharaFlag(idx, new_status.to_flag())
    })
    .text_size(12)
    .padding([5, 8])
    .width(Length::Fill)
    .style(theme::pick_list_style)
    .menu_style(theme::pick_list_menu_style);

    let header = row![
        portrait,
        column![
            text(name).size(14).color(theme::TEXT_PRIMARY),
            text(format!("ID #{}", idx)).size(11).color(theme::TEXT_MUTED),
            container(text(badge_text).size(10).color(badge_color))
                .padding([2, 7])
                .style(theme::badge_style(badge_color)),
        ]
        .spacing(4),
    ]
    .spacing(10)
    .align_y(Alignment::Center);

    container(column![header, picker].spacing(10))
        .padding(12)
        .width(Length::FillPortion(1))
        .style(theme::card_style)
        .into()
}
