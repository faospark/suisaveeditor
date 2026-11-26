use iced::widget::{button, checkbox, column, container, row, scrollable, text, text_input, Space};
use iced::{Alignment, Element, Length};

use crate::data::catalog::chest_info;
use crate::gamedata::character_name;
use crate::save_file::SaveDocument;
use crate::theme;
use crate::Message;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ExperimentalSection {
    #[default]
    TreasureChests,
    EventFlags,
    TownFlags,
    Shops,
    CastleFlags,
    WarRoom,
}

impl ExperimentalSection {
    pub const ALL: &'static [ExperimentalSection] = &[
        ExperimentalSection::TreasureChests,
        ExperimentalSection::EventFlags,
        ExperimentalSection::TownFlags,
        ExperimentalSection::Shops,
        ExperimentalSection::CastleFlags,
        ExperimentalSection::WarRoom,
    ];

    pub fn label(self) -> &'static str {
        match self {
            ExperimentalSection::TreasureChests => "Chests (256)",
            ExperimentalSection::EventFlags => "Story Flags (256)",
            ExperimentalSection::TownFlags => "Towns / Viki (71)",
            ExperimentalSection::Shops => "Shops & Rare Finds",
            ExperimentalSection::CastleFlags => "Castle Flags (50)",
            ExperimentalSection::WarRoom => "War Room",
        }
    }
}

pub fn view<'a>(
    doc: &'a SaveDocument,
    section: ExperimentalSection,
    filter: &'a str,
) -> Element<'a, Message> {
    let mut sub_nav = row![].spacing(8);
    for &s in ExperimentalSection::ALL {
        let active = s == section;
        sub_nav = sub_nav.push(
            button(theme::active_text(s.label(), 12.0, active))
                .padding([7, 14])
                .style(theme::nav_button_style(active))
                .on_press(Message::SelectExperimentalSection(s)),
        );
    }

    let placeholder = match section {
        ExperimentalSection::TreasureChests => "Search chest by area, map (vc12), or item...",
        _ => "Filter byte index (e.g. 94)...",
    };

    let toolbar = container(
        row![
            sub_nav,
            Space::with_width(Length::Fill),
            text_input(placeholder, filter)
                .on_input(Message::SetExperimentalFilter)
                .padding(7)
                .size(12)
                .width(Length::Fixed(270.0))
                .style(theme::input_style),
        ]
        .spacing(12)
        .align_y(Alignment::Center),
    )
    .padding(14)
    .width(Length::Fill)
    .style(theme::card_style);

    let body = match section {
        ExperimentalSection::TreasureChests => view_treasure_chests(doc, filter),
        ExperimentalSection::EventFlags => view_byte_flags(doc, None, "event_flag", 256, filter),
        ExperimentalSection::TownFlags => view_town_flags(doc, filter),
        ExperimentalSection::Shops => view_shops(doc),
        ExperimentalSection::CastleFlags => column![
            container(
                column![
                    text("About Castle HQ Flags (hon_flag[0..49])")
                        .size(13)
                        .color(theme::ACCENT_GOLD),
                    text("• [0..28] Randomized Castle HQ NPC hangout positions & room mini-events (re-rolled when entering Dunan Castle).")
                        .size(11)
                        .color(theme::TEXT_MUTED),
                    text("• [30..32] Permanent Tony's Vegetable Farm & Yuzu's Castle Pasture flags — use the Castle tab for safe editing.")
                        .size(11)
                        .color(theme::TEXT_MUTED),
                    text("• [29] and [34..49] Unused padding (always 0 in saves).")
                        .size(11)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(3),
            )
            .padding(12)
            .width(Length::Fill)
            .style(theme::card_style),
            view_byte_flags(doc, Some("game_data"), "hon_flag", 50, filter),
        ]
        .spacing(12)
        .into(),
        ExperimentalSection::WarRoom => view_war_room(doc),
    };

    let content = column![
        column![
            text("Experimental: World Chests, Story Flags & Castle Flags")
                .size(22)
                .color(theme::TEXT_PRIMARY),
            text("Ground-truth 256 treasure chest catalog (t_box_flag) plus bit-level editors for event_flag and hon_flag.")
                .size(13)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(4),
        toolbar,
        body,
    ]
    .spacing(16)
    .padding(24);

    scrollable(content)
        .height(Length::Fill)
        .style(theme::scrollable_style)
        .into()
}

fn view_treasure_chests<'a>(doc: &'a SaveDocument, filter: &'a str) -> Element<'a, Message> {
    let q = filter.trim().to_lowercase();
    let mut opened_assigned = 0usize;
    let mut total_assigned = 0usize;

    let mut matching = Vec::new();
    for idx in 0..256 {
        let info = chest_info(idx);
        let is_assigned = info.map != "-";
        let val = doc.get_array_i64(None, "t_box_flag", info.byte) as u8;
        let checked = (val & info.mask) != 0;

        if is_assigned {
            total_assigned += 1;
            if checked {
                opened_assigned += 1;
            }
        }

        // Only show assigned chests by default unless explicitly searching "unused"
        if !is_assigned && !q.contains("unused") {
            continue;
        }

        if !q.is_empty()
            && !info.area.to_lowercase().contains(&q)
            && !info.item.to_lowercase().contains(&q)
            && !info.map.to_lowercase().contains(&q)
            && !info.id.to_string().contains(&q)
        {
            continue;
        }
        matching.push((info, checked));
    }

    let mut list = column![
        row![
            container(
                text(format!(
                    "Assigned Chests Opened: {} / {} (Showing {})",
                    opened_assigned,
                    total_assigned,
                    matching.len()
                ))
                .size(13)
                .color(theme::ACCENT_GOLD),
            )
            .padding([6, 12])
            .style(theme::badge_style(theme::ACCENT_GOLD)),
            Space::with_width(Length::Fill),
            text("Checked = Opened • Uncheck to respawn chest in-game")
                .size(12)
                .color(theme::TEXT_MUTED),
        ]
        .align_y(Alignment::Center),
    ]
    .spacing(8);

    for chunk in matching.chunks(2) {
        let mut r = row![].spacing(10);
        for &(ref info, checked) in chunk {
            let byte = info.byte;
            let mask = info.mask;
            r = r.push(
                container(
                    row![
                        checkbox(format!("#{:03} {}", info.id, info.item), checked)
                            .on_toggle(move |on| {
                                Message::ToggleArrayFlagBit(None, "t_box_flag", byte, mask, on)
                            })
                            .text_size(13),
                        Space::with_width(Length::Fill),
                        column![
                            text(info.area).size(11).color(theme::TEXT_MUTED),
                            text(format!("Map: {} • Byte {} Bit 0x{:02X}", info.map, info.byte, info.mask))
                                .size(10)
                                .color(theme::ACCENT_CYAN),
                        ]
                        .align_x(Alignment::End),
                    ]
                    .spacing(10)
                    .align_y(Alignment::Center),
                )
                .padding([8, 12])
                .width(Length::FillPortion(1))
                .style(theme::card_style),
            );
        }
        for _ in chunk.len()..2 {
            r = r.push(Space::with_width(Length::FillPortion(1)));
        }
        list = list.push(r);
    }

    list.into()
}

struct StoryFlagInfo {
    name: &'static str,
    area: &'static str,
    desc: &'static str,
    bits: &'static [(u8, &'static str)],
}

fn known_event_flag_info(idx: usize) -> Option<StoryFlagInfo> {
    Some(match idx {
        0 => StoryFlagInfo {
            name: "Prologue - Highland Youth Brigade Camp",
            area: "va01",
            desc: "Opening camp sequence, night exploration, and sparring scene",
            bits: &[
                (0, "Spoke to Jowy in tent ('Let's go outside')"),
                (3, "Spoke to Captain Rowd / Night ambush begins"),
                (4, "Viewed 3 Youth Brigade soldiers sparring outside"),
                (5, "Returned to tent after warning / suspecting ambush"),
                (6, "Witnessed Luca Blight & Rowd in east clearing"),
                (7, "Riou & Jowy pack up / agree to flee burning camp"),
            ],
        },
        1 => StoryFlagInfo {
            name: "Prologue - Youth Brigade Ambush & Escape",
            area: "va01",
            desc: "Escaping the burning camp, forest encounter, and flight to the cliff",
            bits: &[
                (0, "Escaped tent into burning camp exterior"),
                (3, "Confronted by Highland soldiers on camp path"),
                (4, "Responded to Jowy warning / turned back"),
                (5, "Reached east forest clearing"),
                (6, "Confronted Captain Rowd; cutscene & battle"),
                (7, "Fleeing north towards waterfall cliff"),
            ],
        },
        2 => StoryFlagInfo {
            name: "Prologue - Tenzan Pass Cliff Escape",
            area: "va09",
            desc: "Cliff edge decision, refusal waves, and waterfall jump",
            bits: &[
                (0, "Reached Tenzan Pass cliff approach"),
                (1, "First battle at cliff edge initiated"),
                (2, "First cliff battle won"),
                (3, "Reached cliff edge; jump decision dialogue"),
                (4, "Agreed to jump; carved 'X' mark on rock with Jowy"),
                (5, "Plunged off waterfall cliff into river"),
                (6, "Refused jump; triggers next soldier wave"),
            ],
        },
        3 => StoryFlagInfo {
            name: "Prologue - Foggy River Rescue & Dream",
            area: "va04 / va13",
            desc: "Fished out of foggy riverbank by Viktor & Flik; dream cutscene",
            bits: &[
                (0, "Fished out of river by Viktor & Flik"),
                (1, "Foggy river dream / flashback cutscene completed"),
            ],
        },
        5 => StoryFlagInfo {
            name: "Prologue - Chapter Milestone",
            area: "va09 / vb01",
            desc: "Prologue master progression and transition to Mercenary Fortress",
            bits: &[(7, "Prologue Completed / Mercenary Fort unlocked")],
        },
        20 => StoryFlagInfo {
            name: "Gregminster Alliance",
            area: "vf01",
            desc: "Toran Republic alliance decision",
            bits: &[(0, "Toran Alliance Completed")],
        },
        23 => StoryFlagInfo {
            name: "South Window Region / Genshu Recruitment",
            area: "vc18",
            desc: "Kuskus port interactions and Genshu weapon level inspection",
            bits: &[(3, "Genshu Recruited at Kuskus Port")],
        },
        29 => StoryFlagInfo {
            name: "Radat Wharf (Simone & Vincent)",
            area: "vd02",
            desc: "Simone recruitment and Vincent reunion sequence",
            bits: &[
                (3, "Simone Recruited"),
                (5, "Vincent Spoken First Time"),
                (6, "Vincent Reunion Cutscene Active"),
                (7, "Vincent Recruited"),
            ],
        },
        50 => StoryFlagInfo {
            name: "Kobold Village Hidden Pickups",
            area: "vh03",
            desc: "One-time hidden item pickups in Kobold Village (not stored in t_box_flag)",
            bits: &[
                (2, "Exertion Orb collected (Submap 0 Outdoors, behind house)"),
                (3, "Recipe #13 collected (Submap 1, Elder's House)"),
            ],
        },
        65 => StoryFlagInfo {
            name: "Two River Sewers (Sid Recruitment)",
            area: "vf04",
            desc: "Two River sewers exploration and Sid recruitment status",
            bits: &[(1, "Sid Recruited into Army")],
        },
        68 => StoryFlagInfo {
            name: "Two River Kobold District & Yuzu Sheep Chase",
            area: "vf02 / vh03 / vh10",
            desc: "Hans armory recruitment & Yuzu Kobold Village sheep quest",
            bits: &[
                (0, "Hans Recruited / Armory Opened"),
                (4, "Yuzu Quest Accepted / Minigame Started"),
                (5, "Yuzu Sheep 1 Captured"),
                (6, "Yuzu Sheep 2 Captured"),
                (7, "Yuzu Sheep 3 Captured"),
            ],
        },
        70 => StoryFlagInfo {
            name: "Yuzu Recruitment",
            area: "vh03",
            desc: "Kobold Village Yuzu recruitment completion status",
            bits: &[(0, "Yuzu Recruited into Castle HQ")],
        },
        77 => StoryFlagInfo {
            name: "Tenkou's Delivered Window Sets",
            area: "Castle HQ",
            desc: "Delivered Window Sets #1–#7 (Bits 0..6)",
            bits: &[],
        },
        78 => StoryFlagInfo {
            name: "Connell's Delivered Sound Sets",
            area: "Castle HQ",
            desc: "Delivered Sound Sets #1–#7 (Bits 0..6)",
            bits: &[],
        },
        92 => StoryFlagInfo {
            name: "South Window (Annallee Unpaid Meal)",
            area: "vd17 / vd03",
            desc: "Inn unpaid meal cutscene; moves Annallee to the street",
            bits: &[(0, "Unpaid Meal Triggered (Spawns on street vd03)")],
        },
        94 => StoryFlagInfo {
            name: "Clive Quest Milestones & Cutoffs",
            area: "World",
            desc: "Elza pursuit milestones and time-sensitive triggers",
            bits: &[
                (0, "Muse Encounter (<3h)"),
                (1, "South Window (Clive Joins)"),
                (2, "Lakewest Letter (<11h)"),
                (3, "Forest Village Lookalike (<13h)"),
                (4, "Rockaxe Guild Intelligence"),
                (5, "Radat Hostage Duel (<14h)"),
                (6, "Muse Hill Confrontation (<15h)"),
                (7, "Sajah Finale Conclusion (<20h)"),
            ],
        },
        110 => StoryFlagInfo {
            name: "Tessai Recruitment",
            area: "vd01",
            desc: "Kuskus blacksmith Tessai recruitment status",
            bits: &[(1, "Tessai Recruited into Army")],
        },
        112 => StoryFlagInfo {
            name: "Annallee Recruitment",
            area: "vd03",
            desc: "South Window park song quest completion",
            bits: &[(4, "Annallee Recruited (Bit 4)"), (5, "Annallee Recruited (Bit 5)")],
        },
        114 => StoryFlagInfo {
            name: "Alberto Recruitment",
            area: "vg08",
            desc: "Tinto armory Alberto recruitment status",
            bits: &[(4, "Alberto Recruited (Bit 4)"), (5, "Alberto Recruited (Bit 5)")],
        },
        118 => StoryFlagInfo {
            name: "Greenhill / Matilda Liberation Story Gate",
            area: "World",
            desc: "Late-game story campaign progression for musician spawning",
            bits: &[(3, "Post-Greenhill Liberation Gate (Musicians Active)")],
        },
        123 => StoryFlagInfo {
            name: "Kuskus Blacksmith Counters",
            area: "vd01",
            desc: "Enables blacksmith shop services and apprentice NPC",
            bits: &[(0, "Blacksmith Service Counters Active")],
        },
        128 => StoryFlagInfo {
            name: "Kuskus Tessai Spawn",
            area: "vd01",
            desc: "Spawns Tessai inside Kuskus blacksmith shop",
            bits: &[(0, "Tessai Spawn Active in Kuskus")],
        },
        151 => StoryFlagInfo {
            name: "Tinto Progression & Late-Game Lockouts",
            area: "vg08 / vb09",
            desc: "Tinto area story progression, Alberto armory despawn, and vanilla Tomo late-game lockout",
            bits: &[(6, "Alberto Despawns / Vanilla Tomo Late-Game Lockout")],
        },
        152 => StoryFlagInfo {
            name: "Hai Yo Cook-Off Battles (Part 1)",
            area: "Castle HQ",
            desc: "First half of Hai Yo cook-off opponents defeated",
            bits: &[
                (0, "Ky Yun"),
                (1, "Goetsu"),
                (2, "Shinki"),
                (3, "Ryuki"),
                (4, "Bashok"),
                (5, "Ryuko"),
                (6, "Antonio"),
                (7, "Gyokuran"),
            ],
        },
        153 => StoryFlagInfo {
            name: "Hai Yo Cook-Off Battles (Part 2)",
            area: "Castle HQ",
            desc: "Second half of Hai Yo cook-off opponents and system flag",
            bits: &[
                (0, "Retso (1st)"),
                (1, "Lester"),
                (2, "Retso (2nd)"),
                (3, "Jinkai (Finale)"),
                (5, "Cook-Off System Active"),
            ],
        },
        160 => StoryFlagInfo {
            name: "Mercenary Fortress - Arrival & Custody",
            area: "vb01 / vb11",
            desc: "Arrival at Mercenary Fort, sentencing by Viktor & Flik, and cell assignment",
            bits: &[
                (0, "Brought to Mercenary Fortress"),
                (6, "Sentenced to cellar cell by Viktor & Flik"),
                (7, "Placed in Pohl custody in cellar"),
            ],
        },
        161 => StoryFlagInfo {
            name: "Mercenary Fortress - Pohl's Chores & Escape Tools",
            area: "vb11",
            desc: "Pohl chore progression and escape equipment collection in cellar",
            bits: &[
                (0, "Chore #1 Assigned: Organize Storeroom Boxes"),
                (1, "Chore #1 Completed: All Boxes Organized"),
                (2, "Escape Tool #1: Rope Acquired"),
                (3, "Day 1 Finished: Meal with Pohl / Locked in cell"),
                (4, "Chore #2: Acquired Flint Stones from Blacksmith"),
                (5, "Chore #2: Out of Flour / Directed to Ryube"),
                (6, "Chore #2 Assigned: Boots, Flint Stones & Flour"),
                (7, "Chore #2: Reported lack of flour / Sent to Leona"),
            ],
        },
        162 => StoryFlagInfo {
            name: "Mercenary Fortress - Ryube Flour Quest & Floor Cleaning",
            area: "vb11 / vb05",
            desc: "Escort to Ryube Village with Gengen & Tuta for Flour, and chores",
            bits: &[
                (0, "Spoke to Leona; Gengen & Tuta join party"),
                (1, "Ryube Village: Flour Acquired"),
                (2, "Return to Mercenary Fort with Flour"),
                (3, "Chore #2 Completed: Delivered Flour to Pohl"),
                (4, "Chore #3: Cleaning Fortress Floors Assigned"),
                (5, "Night Escape Attempt Committed"),
            ],
        },
        164 => StoryFlagInfo {
            name: "Ryube Forest (Kinnison & Shiro)",
            area: "vb05",
            desc: "Fallen bird nest event and Kinnison/Shiro recruitment status",
            bits: &[
                (1, "Bird Nest Returned to Tree"),
                (2, "Kinnison & Shiro Recruited"),
            ],
        },
        166 => StoryFlagInfo {
            name: "Early Game Recruits (Anita, Zamza, Templeton)",
            area: "va06 / vb03 / vb04",
            desc: "Anita Muse tavern, Zamza Toto Inn, and Templeton Mercenary Fort ruins",
            bits: &[
                (0, "Anita Recruited in Muse Tavern"),
                (2, "Zamza Recruited at Toto Inn"),
                (4, "Templeton Encountered at Burned Fort"),
                (5, "Templeton Recruited with Suiko Map"),
            ],
        },
        172 => StoryFlagInfo {
            name: "Greenhill Checkpoint & Town Square (Fitcher & Nina)",
            area: "ve01",
            desc: "Greenhill entrance checkpoint inspection and Town Square choices",
            bits: &[
                (0, "Town Square: Picked Riou & Nanami to Help Nina"),
                (1, "Outside Inn: Intervene vs Keep Heads Down"),
                (6, "Fitcher Checkpoint Inspection Passed"),
                (7, "Stepped Past Checkpoint into City"),
            ],
        },
        173 => StoryFlagInfo {
            name: "Greenhill Town Square & Academy Registration",
            area: "ve01",
            desc: "Greenhill Town Square arrival and New Leaf Academy registration",
            bits: &[
                (0, "Town Square Initial Arrival Cutscene"),
                (1, "Encountered Nina on Town Square"),
                (2, "New Leaf Academy: Entered Reception / Met Emilia"),
                (3, "Student Registration Completed with Emilia"),
                (4, "Academy Courtyard: Nina Obsessing Over Flik"),
                (5, "Academy Dormitory: Checked In with Matron"),
                (6, "Academy Dormitory: Walk Around Upstairs"),
            ],
        },
        174 => StoryFlagInfo {
            name: "Academy Dormitory Night & Investigation (Nina & Shin)",
            area: "ve07 / ve06 / ve01",
            desc: "Dormitory evening/night sequence, Nina hallway, and campus investigation",
            bits: &[
                (0, "Dormitory Night: Supper / Spawns Nina in 2F Hallway"),
                (1, "Completed Nina 2F Hallway Encounter"),
                (2, "Exited Dormitory Next Morning"),
                (3, "Met Flik Outside ('Meet up with Fitcher')"),
                (4, "Outside Inn: Witnessed Shin, Rowd & Fitcher"),
            ],
        },
        206 => StoryFlagInfo {
            name: "White Deer Inn & Sindar Ruins (Alex & Hilda)",
            area: "vb02 / vb11 / vb18",
            desc: "Sindar Ruins expedition, mist monster boss, and Alex/Hilda recruitment",
            bits: &[
                (0, "Sindar Ruins Entrance Unlocked"),
                (1, "Mist Monster Defeated"),
                (2, "Alex & Hilda Recruited"),
            ],
        },
        208 => StoryFlagInfo {
            name: "Ryube Forest — Tsai's Cottage (Tsai & Tomo)",
            area: "vb04 / vb09",
            desc: "Tsai's fire spear errand and Tomo recruitment sequence at Tsai's cottage",
            bits: &[
                (0, "Tsai Tools Errand Active"),
                (1, "Spears Completed / Tsai Joins"),
                (4, "Tomo Recruitment Sequence Initiated (vb09_00)"),
                (5, "Tomo Cottage Approach Scene Completed (vb09_00)"),
                (6, "Tomo Recruited into Army (vb09_01)"),
            ],
        },
        209 => StoryFlagInfo {
            name: "Greenhill & Forest Village (Jude's Clay Quest)",
            area: "ve07 / ve02",
            desc: "Jude clay quest and Emilia recon dialogue flags",
            bits: &[
                (2, "Jude Needs Clay / Quest Started"),
                (3, "Forest Village Clay Obtained"),
                (4, "Jude Join Offer Declined Re-prompt"),
                (5, "Jude Recruited / Academy Despawn"),
                (6, "Emilia: Revealed True Identity"),
                (7, "Emilia: Used Flattery Dialogue Option"),
            ],
        },
        210 => StoryFlagInfo {
            name: "Forest Path & Matilda Region (Emilia, Pico, Viki)",
            area: "ve04 / ve01 / ve07",
            desc: "Emilia, Pico, Rockaxe town steps, and Viki teleportation",
            bits: &[
                (0, "Emilia Recruited at New Leaf Academy"),
                (1, "Emilia Join Offer Declined Re-prompt"),
                (3, "Rockaxe Town Event Step 1"),
                (4, "Rockaxe Town Event Step 2"),
                (5, "Pico Recruited in Greenhill Inn"),
                (6, "Viki Encountered on Forest Path"),
                (7, "Viki Recruited / Teleports to Castle"),
            ],
        },
        211 => StoryFlagInfo {
            name: "Badeaux & Tenkou Recruitment",
            area: "ve04 / vk14",
            desc: "Forest Path beastmaster and Castle terrace windowmaker",
            bits: &[
                (1, "Badeaux Spoke Once / Declined"),
                (2, "Badeaux Recruited"),
                (3, "Tenkou Recruited"),
                (4, "Tenkou Spoken on Terrace"),
            ],
        },
        212 => StoryFlagInfo {
            name: "Tinto Armory (Alberto Progression)",
            area: "vg08",
            desc: "Alberto dialogue progression and HQ check",
            bits: &[
                (0, "Spoke to Alberto in Tinto"),
                (1, "Heard Annallee & Pico in Castle HQ"),
            ],
        },
        213 => StoryFlagInfo {
            name: "Two River Rune Shop (Jeane Recruitment)",
            area: "vh11",
            desc: "Two River rune sage Jeane recruitment status",
            bits: &[
                (5, "Spoke to Jeane in Academy Classroom"),
                (7, "Jeane Recruited into Castle HQ"),
            ],
        },
        215 => StoryFlagInfo {
            name: "Forest Village (Feather & Ayda Encounter)",
            area: "ve02",
            desc: "Forest Village griffin ambush and recruitment scene",
            bits: &[
                (2, "Feather Ambush Triggered"),
                (4, "Feather Recruited"),
                (6, "Ayda Recruited"),
            ],
        },
        216 => StoryFlagInfo {
            name: "Forest Village (Connell, Tony, Meg, Wakaba)",
            area: "ve02",
            desc: "Forest Village recruitments and introductory dialogues",
            bits: &[
                (0, "Connell Spoke First Time"),
                (1, "Connell Recruited with Sound Set"),
                (4, "Tony Spoke First Time"),
                (5, "Tony Recruited to Castle Farm"),
                (6, "Meg & Gadget Recruited at Greenhill Border"),
                (7, "Wakaba Initial Talk"),
            ],
        },
        222 => StoryFlagInfo {
            name: "Coronet Wharf Party Members",
            area: "vj01",
            desc: "Coronet dock companion interactions and event states (Bits 0–7)",
            bits: &[],
        },
        230 => StoryFlagInfo {
            name: "Listening Crystals & Beastmaster Quests",
            area: "World",
            desc: "Listening Crystal grant state and beast encounters",
            bits: &[
                (0, "Listening Crystals Granted by Badeaux"),
                (1, "Feather / Ayda Quest Active"),
                (2, "Abizboah Recruited with Crystal"),
                (3, "Rulodia Recruited with Crystal"),
            ],
        },
        236 => StoryFlagInfo {
            name: "Mercenary Fortress - Storeroom Pushable Boxes",
            area: "vb11",
            desc: "State tracking for the 5 pushable cargo boxes in storeroom",
            bits: &[
                (0, "Box Pushing Chore Initialized"),
                (1, "Storage Box #1 Placed"),
                (2, "Storage Box #2 Placed"),
                (3, "Storage Box #3 Placed"),
                (4, "Storage Box #4 Placed"),
                (5, "Storage Box #5 Placed (All Done)"),
            ],
        },
        238 => StoryFlagInfo {
            name: "Greenhill City Gate State",
            area: "ve01",
            desc: "Pre-infiltration peacetime checkpoint guard state",
            bits: &[(0, "Peacetime Gate State Active")],
        },
        239 => StoryFlagInfo {
            name: "Greenhill Reconnaissance & Academy Infiltration",
            area: "ve01 / ve07 / ve14",
            desc: "Master state machine for Greenhill student disguise & infiltration",
            bits: &[
                (0, "Phase 1: Arrived at Greenhill Gate & Met Fitcher"),
                (1, "Phase 2: Entry Briefing Active"),
                (2, "Phase 3: Named Student Aliases / Disguises Active"),
                (3, "Phase 4: Registered at New Leaf Academy"),
            ],
        },
        _ => return None,
    })
}

fn known_hon_flag_info(idx: usize) -> Option<StoryFlagInfo> {
    Some(match idx {
        11 => StoryFlagInfo {
            name: "Castle HQ Dialogue Variant",
            area: "vk* (Castle HQ)",
            desc: "Randomized per-visit Castle HQ NPC dialogue/placement bit",
            bits: &[(0, "Entrance / tavern dialogue variant")],
        },
        14 => StoryFlagInfo {
            name: "Castle HQ Tavern / Inn State",
            area: "vk* (Castle HQ)",
            desc: "Per-visit Castle HQ tavern & inn NPC placement",
            bits: &[(1, "Hilda / Alex tavern & inn active")],
        },
        16 => StoryFlagInfo {
            name: "Castle HQ Entrance & Taki Placement",
            area: "vk* (Castle HQ)",
            desc: "Randomized per-visit NPC placement in Castle HQ",
            bits: &[
                (3, "Entrance hall room trigger"),
                (6, "Taki entrance hall placement (Lv.1+)"),
            ],
        },
        17 => StoryFlagInfo {
            name: "Castle HQ Vault / Barbara State",
            area: "vk* (Castle HQ)",
            desc: "Randomized per-visit NPC placement (paired with hon_flag[18])",
            bits: &[(5, "Barbara vault / entrance scene active")],
        },
        19 => StoryFlagInfo {
            name: "Castle HQ Entrance Walk-In Triggers",
            area: "vk* (Castle HQ)",
            desc: "Per-visit entrance hall proximity triggers",
            bits: &[
                (3, "Upper entrance trigger cleared"),
                (4, "Lower entrance trigger cleared"),
            ],
        },
        30 => StoryFlagInfo {
            name: "Tony's Vegetable Farm (Plots 1–8)",
            area: "Castle Tab",
            desc: "Permanent crop flags — edit safely in the Castle tab",
            bits: &[
                (0, "Cabbage Plot #1"),
                (1, "Cabbage Plot #2"),
                (2, "Cabbage Plot #3"),
                (3, "Potato Plot #1"),
                (4, "Potato Plot #2"),
                (5, "Potato Plot #3"),
                (6, "Spinach Plot #1"),
                (7, "Spinach Plot #2"),
            ],
        },
        31 => StoryFlagInfo {
            name: "Tony's Farm (Plots 9–12) & Yuzu's Pasture (Pigs/Sheep)",
            area: "Castle Tab",
            desc: "Permanent farm & pasture flags — edit safely in the Castle tab",
            bits: &[
                (0, "Spinach Plot #3"),
                (1, "Tomato Plot #1"),
                (2, "Tomato Plot #2"),
                (3, "Tomato Plot #3"),
                (4, "Piglet #1"),
                (5, "Piglet #2"),
                (6, "Piglet #3"),
                (7, "Lamb #1"),
            ],
        },
        32 => StoryFlagInfo {
            name: "Yuzu's Castle Pasture (Sheep, Chickens & Calves)",
            area: "Castle Tab",
            desc: "Permanent livestock flags — edit safely in the Castle tab",
            bits: &[
                (0, "Lamb #2"),
                (1, "Lamb #3"),
                (2, "Lamb #4"),
                (3, "Chick #1"),
                (4, "Chick #2"),
                (5, "Chick #3"),
                (6, "Calf #1"),
                (7, "Calf #2"),
            ],
        },
        _ => return None,
    })
}

fn town_flag_name(idx: usize) -> &'static str {
    match idx {
        0 => "Army Garrison / Prologue Camp",
        1 => "Kyaro Town",
        3 => "Mercenary Fortress",
        4 => "Toto Village",
        5 => "Ryube Village",
        6 => "Ryube Forest",
        7 => "Coronet Town",
        8 => "Muse City",
        9 => "Sindar Ruins",
        10 => "White Deer Inn",
        11 => "Muse-Highland Checkpoint",
        12 => "Kuskus Town",
        13 => "South Window City",
        14 => "North Window",
        15 => "Dunan Castle HQ",
        16 => "Tenzan Pass",
        17 => "Cave of the Wind",
        18 => "Radat Town",
        19 => "Path to Matilda",
        20 => "Muse-Greenhill Checkpoint",
        21 => "Banner Village",
        22 => "Rokkaku Hamlet",
        23 => "Banner Pass",
        24 => "Gregminster",
        25 => "Tinto City",
        26 => "Tinto Mines",
        27 => "Crom Village",
        28 => "North Swallow Pass",
        29 => "Greenhill City",
        30 => "Forest Village",
        31 => "Two River City",
        32 => "Lakewest Town",
        33 => "Kobold Village",
        34 => "Highway Village",
        35 => "Muse-Matilda Checkpoint",
        36 => "Rockaxe Castle",
        37 => "Drakemouth Village",
        38 => "L'Renouille",
        39 => "Sajah Village",
        40 => "Tigermouth Village",
        41 => "Mt. Rakutei",
        42 => "Highland Camp",
        43 => "Kobold Forest",
        44 => "Muse Border / Mercenary Area",
        45 => "Tinto Border / Mine Area",
        46 => "Forest Path (Greenhill-Matilda)",
        47 => "Greenhill Forest",
        _ => "Unused / Reserved",
    }
}

fn view_town_flags<'a>(doc: &'a SaveDocument, filter: &'a str) -> Element<'a, Message> {
    let q = filter.trim().to_lowercase();
    let len = doc.get_array_len(None, "town_flag");
    let mut visited_cnt = 0usize;
    let mut teleport_cnt = 0usize;

    let mut rows = column![].spacing(6);
    for idx in 0..len {
        let val = doc.get_array_i64(None, "town_flag", idx) as u8;
        let bit7 = (val & 0x80) != 0;
        let bit6 = (val & 0x40) != 0;
        if bit7 {
            visited_cnt += 1;
        }
        if bit6 {
            teleport_cnt += 1;
        }
        let name = town_flag_name(idx);
        if !q.is_empty()
            && !idx.to_string().contains(&q)
            && !name.to_lowercase().contains(&q)
        {
            continue;
        }
        rows = rows.push(
            container(
                row![
                    text(format!("[{:02}]", idx))
                        .size(12)
                        .color(if val > 0 {
                            theme::ACCENT_GOLD
                        } else {
                            theme::TEXT_MUTED
                        })
                        .width(Length::Fixed(36.0)),
                    text(name)
                        .size(12)
                        .color(if val > 0 {
                            theme::TEXT_PRIMARY
                        } else {
                            theme::TEXT_MUTED
                        })
                        .width(Length::Fixed(230.0)),
                    text(format!("0x{:02X}", val))
                        .size(12)
                        .color(theme::ACCENT_CYAN)
                        .width(Length::Fixed(48.0)),
                    checkbox("Visited (b7 / 0x80)", bit7)
                        .on_toggle(move |on| {
                            Message::ToggleArrayFlagBit(None, "town_flag", idx, 0x80, on)
                        })
                        .text_size(12),
                    Space::with_width(Length::Fixed(16.0)),
                    checkbox("Viki Teleport / Active (b6 / 0x40)", bit6)
                        .on_toggle(move |on| {
                            Message::ToggleArrayFlagBit(None, "town_flag", idx, 0x40, on)
                        })
                        .text_size(12),
                ]
                .spacing(10)
                .align_y(Alignment::Center),
            )
            .padding([6, 12])
            .width(Length::Fill)
            .style(theme::card_style),
        );
    }

    column![
        container(
            row![
                column![
                    text("Visited Towns & Viki Teleport Flags (town_flag[0..70])")
                        .size(14)
                        .color(theme::ACCENT_GOLD),
                    text("Each town entry uses Bit 7 (0x80) and Bit 6 (0x40) to track visited and teleportable status.")
                        .size(11)
                        .color(theme::TEXT_MUTED),
                ]
                .spacing(2),
                Space::with_width(Length::Fill),
                container(
                    text(format!("b7: {}/{}  •  b6: {}/{}", visited_cnt, len, teleport_cnt, len))
                        .size(11)
                        .color(theme::ACCENT_CYAN)
                )
                .padding([4, 10])
                .style(theme::badge_style(theme::ACCENT_CYAN)),
            ]
            .align_y(Alignment::Center),
        )
        .padding(12)
        .width(Length::Fill)
        .style(theme::card_style),
        rows,
    ]
    .spacing(10)
    .into()
}

fn view_shop_category<'a>(
    doc: &'a SaveDocument,
    title: &'static str,
    category: &'static str,
    zai_slots: usize,
) -> Element<'a, Message> {
    let count = doc.get_shop_len(category);
    let mut list = column![].spacing(6);

    for idx in 0..count {
        let stim = doc.get_shop_stim(category, idx);
        let mut r = row![
            text(format!("Shop #{:02}", idx + 1))
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fixed(68.0)),
            text("Timer:")
                .size(11)
                .color(theme::TEXT_MUTED),
            text_input("0", &stim.to_string())
                .on_input(move |v| Message::SetShopStim(category, idx, v))
                .padding(4)
                .size(11)
                .width(Length::Fixed(58.0))
                .style(theme::input_style),
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        if zai_slots > 0 {
            r = r.push(text("Rare Stock (zai):").size(11).color(theme::TEXT_MUTED));
            for slot in 0..zai_slots {
                let z = doc.get_shop_zai(category, idx, slot);
                r = r.push(
                    text_input("0", &z.to_string())
                        .on_input(move |v| Message::SetShopZai(category, idx, slot, v))
                        .padding(4)
                        .size(11)
                        .width(Length::Fixed(40.0))
                        .style(theme::input_style),
                );
            }
        }

        list = list.push(r);
    }

    container(
        column![
            row![
                text(format!("{} ({} entries)", title, count))
                    .size(14)
                    .color(theme::ACCENT_GOLD),
                Space::with_width(Length::Fill),
                button(text("Reset All Timers (0)").size(11))
                    .padding([4, 10])
                    .style(theme::primary_button_style)
                    .on_press(Message::ResetAllShopTimers(category)),
            ]
            .align_y(Alignment::Center),
            list,
        ]
        .spacing(8),
    )
    .padding(14)
    .width(Length::Fill)
    .style(theme::card_style)
    .into()
}

fn view_shops<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    column![
        container(
            column![
                text("Shop Rare Finds & Restock Timers (shop_data)")
                    .size(14)
                    .color(theme::ACCENT_GOLD),
                text("Resetting a shop category's restock timer (stim = 0) forces those shops to re-roll their Rare Finds and restock on your next visit.")
                    .size(11)
                    .color(theme::TEXT_MUTED),
            ]
            .spacing(3),
        )
        .padding(12)
        .width(Length::Fill)
        .style(theme::card_style),
        view_shop_category(doc, "Item Shops (dougu_data)", "dougu_data", 4),
        view_shop_category(doc, "Armor Shops (bougu_data)", "bougu_data", 4),
        view_shop_category(doc, "Rune Shops (monsyo_data)", "monsyo_data", 4),
        view_shop_category(doc, "Trading Posts (koueki_data)", "koueki_data", 0),
    ]
    .spacing(12)
    .into()
}

fn view_war_room<'a>(doc: &'a SaveDocument) -> Element<'a, Message> {
    let leaders = doc.get_array_len(Some("war_data"), "leader_no");
    let subs = doc.get_array_len(Some("war_data"), "sub_no");
    let assignments = doc.get_array_len(Some("war_data"), "sub_to_leader");

    let info_banner = container(
        column![
            text("About Major War Data (war_data) — Informational Only")
                .size(13)
                .color(theme::ACCENT_GOLD),
            text("Note: This section is kept for completeness and is generally not useful for save editing — you can already reorganize Major War sub-commanders by talking to Apple before any Major Battle.")
                .size(11)
                .color(theme::ACCENT_CYAN),
            text("• sub_to_leader[0..27] is the live Apple War Room ('Form Units') sub-commander assignment table persisted across Major Battles (-1 = Locked, -2 = Unassigned Pool, 0..15 = Assigned Leader Slot).")
                .size(11)
                .color(theme::TEXT_MUTED),
            text("• leader_no[0..13] and sub_no[0..27] are runtime-only scratch buffers (always 0 in saved files).")
                .size(11)
                .color(theme::TEXT_MUTED),
        ]
        .spacing(3),
    )
    .padding(12)
    .width(Length::Fill)
    .style(theme::card_style);

    let mut assign_left = column![].spacing(6).width(Length::FillPortion(1));
    let mut assign_right = column![].spacing(6).width(Length::FillPortion(1));
    let half = (assignments + 1) / 2;

    for idx in 0..assignments {
        let val = doc.get_array_i64(Some("war_data"), "sub_to_leader", idx);
        let (status_label, status_color) = match val {
            -1 => ("Locked (-1)".to_string(), theme::TEXT_MUTED),
            -2 => ("Unassigned Pool (-2)".to_string(), theme::ACCENT_CYAN),
            v if v >= 0 => (format!("Leader Slot #{}", v), theme::ACCENT_GREEN),
            v => (format!("Value {}", v), theme::TEXT_MUTED),
        };
        let r = row![
            text(format!("Sub #{:02}", idx + 1))
                .size(12)
                .color(theme::TEXT_MUTED)
                .width(Length::Fixed(64.0)),
            text(status_label)
                .size(12)
                .color(status_color)
                .width(Length::Fill),
            text_input("-1", &val.to_string())
                .on_input(move |v| Message::SetArrayIntField(
                    Some("war_data"),
                    "sub_to_leader",
                    idx,
                    v
                ))
                .padding(4)
                .size(12)
                .width(Length::Fixed(56.0))
                .style(theme::input_style),
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        if idx < half {
            assign_left = assign_left.push(r);
        } else {
            assign_right = assign_right.push(r);
        }
    }

    let assign_card = container(
        column![
            text(format!(
                "War Sub-Commander Assignments (war_data.sub_to_leader — {} slots)",
                assignments
            ))
            .size(15)
            .color(theme::ACCENT_GOLD),
            row![assign_left, assign_right].spacing(20),
        ]
        .spacing(10),
    )
    .padding(16)
    .width(Length::Fill)
    .style(theme::card_style);

    let mut leader_col = column![
        text(format!(
            "War Unit Leaders (war_data.leader_no — {} slots, runtime-only / 0 in saves)",
            leaders
        ))
        .size(13)
        .color(theme::TEXT_MUTED),
    ]
    .spacing(6);

    for idx in 0..leaders {
        let char_id = doc.get_array_i64(Some("war_data"), "leader_no", idx);
        leader_col = leader_col.push(
            row![
                text(format!("Unit #{:02}", idx + 1))
                    .size(12)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(64.0)),
                text(character_name(char_id))
                    .size(13)
                    .color(if char_id > 0 {
                        theme::TEXT_PRIMARY
                    } else {
                        theme::TEXT_MUTED
                    })
                    .width(Length::Fill),
                text_input("0", &char_id.to_string())
                    .on_input(move |v| Message::SetArrayIntField(
                        Some("war_data"),
                        "leader_no",
                        idx,
                        v
                    ))
                    .padding(4)
                    .size(12)
                    .width(Length::Fixed(60.0))
                    .style(theme::input_style),
            ]
            .spacing(8)
            .align_y(Alignment::Center),
        );
    }

    let mut sub_col = column![
        text(format!(
            "War Sub-Units (war_data.sub_no — {} slots, runtime-only / 0 in saves)",
            subs
        ))
        .size(13)
        .color(theme::TEXT_MUTED),
    ]
    .spacing(6);

    for idx in 0..subs {
        let char_id = doc.get_array_i64(Some("war_data"), "sub_no", idx);
        sub_col = sub_col.push(
            row![
                text(format!("Sub #{:02}", idx + 1))
                    .size(12)
                    .color(theme::TEXT_MUTED)
                    .width(Length::Fixed(64.0)),
                text(character_name(char_id))
                    .size(13)
                    .color(if char_id > 0 {
                        theme::TEXT_PRIMARY
                    } else {
                        theme::TEXT_MUTED
                    })
                    .width(Length::Fill),
                text_input("0", &char_id.to_string())
                    .on_input(move |v| Message::SetArrayIntField(
                        Some("war_data"),
                        "sub_no",
                        idx,
                        v
                    ))
                    .padding(4)
                    .size(12)
                    .width(Length::Fixed(60.0))
                    .style(theme::input_style),
            ]
            .spacing(8)
            .align_y(Alignment::Center),
        );
    }

    column![
        info_banner,
        assign_card,
        row![
            container(leader_col)
                .padding(16)
                .width(Length::FillPortion(1))
                .style(theme::card_style),
            container(sub_col)
                .padding(16)
                .width(Length::FillPortion(1))
                .style(theme::card_style),
        ]
        .spacing(16),
    ]
    .spacing(14)
    .into()
}

fn view_byte_flags<'a>(
    doc: &'a SaveDocument,
    section: Option<&'static str>,
    key: &'static str,
    len: usize,
    filter: &'a str,
) -> Element<'a, Message> {
    let q = filter.trim().to_lowercase();
    let mut list = column![].spacing(6);

    for idx in 0..len {
        let info = if key == "event_flag" {
            known_event_flag_info(idx)
        } else if key == "hon_flag" {
            known_hon_flag_info(idx)
        } else {
            None
        };

        if !q.is_empty() {
            let matches_idx = idx.to_string().contains(&q);
            let matches_info = info
                .as_ref()
                .map(|i| {
                    i.name.to_lowercase().contains(&q)
                        || i.area.to_lowercase().contains(&q)
                        || i.desc.to_lowercase().contains(&q)
                        || i.bits.iter().any(|(_, bl)| bl.to_lowercase().contains(&q))
                })
                .unwrap_or(false);
            if !matches_idx && !matches_info {
                continue;
            }
        }
        let val = doc.get_array_i64(section, key, idx) as u8;

        let mut bits = row![].spacing(6).align_y(Alignment::Center);
        for bit in 0..8 {
            let mask = 1u8 << bit;
            let checked = (val & mask) != 0;
            bits = bits.push(
                checkbox(format!("b{}", bit), checked)
                    .on_toggle(move |on| Message::ToggleArrayFlagBit(section, key, idx, mask, on))
                    .text_size(11),
            );
        }

        let mut row_col = column![
            row![
                text(format!("{}[{:03}]", key, idx))
                    .size(12)
                    .color(if val > 0 {
                        theme::ACCENT_GOLD
                    } else {
                        theme::TEXT_MUTED
                    })
                    .width(Length::Fixed(120.0)),
                text_input("0", &val.to_string())
                    .on_input(move |v| Message::SetArrayIntField(section, key, idx, v))
                    .padding(4)
                    .size(12)
                    .width(Length::Fixed(58.0))
                    .style(theme::input_style),
                text(format!("0x{:02X}", val))
                    .size(12)
                    .color(theme::ACCENT_CYAN)
                    .width(Length::Fixed(46.0)),
                bits,
            ]
            .spacing(10)
            .align_y(Alignment::Center),
        ]
        .spacing(4);

        if let Some(info) = info {
            row_col = row_col.push(
                text(format!("{} [{}] — {}", info.name, info.area, info.desc))
                    .size(11)
                    .color(theme::ACCENT_CYAN),
            );
            if !info.bits.is_empty() {
                let mut bit_notes = Vec::with_capacity(info.bits.len());
                for &(b, bl) in info.bits {
                    let is_on = (val & (1u8 << b)) != 0;
                    bit_notes.push(format!(
                        "b{}{}: {}",
                        b,
                        if is_on { " [ON]" } else { "" },
                        bl
                    ));
                }
                row_col = row_col.push(
                    text(bit_notes.join("  •  "))
                        .size(10)
                        .color(theme::TEXT_MUTED),
                );
            }
        }

        list = list.push(
            container(row_col)
                .padding([6, 12])
                .width(Length::Fill)
                .style(theme::card_style),
        );
    }

    list.into()
}
