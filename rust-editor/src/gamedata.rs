use iced::widget::image;
use std::collections::HashMap;
use std::fmt;
use std::path::PathBuf;

pub use crate::data::character_name;

pub const STAT_LABELS: [&str; 7] = [
    "Strength",
    "Magic",
    "Protection",
    "Magic Defence",
    "Dexterity",
    "Speed",
    "Luck",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecruitStatus {
    NotRecruited,
    SpokeTo,
    AutoJoin,
    ManualRecruit,
    EventLocked,
    Deceased,
    OnLeave,
    Custom(i64),
}

impl RecruitStatus {
    pub const ALL: &'static [RecruitStatus] = &[
        RecruitStatus::NotRecruited,
        RecruitStatus::SpokeTo,
        RecruitStatus::AutoJoin,
        RecruitStatus::ManualRecruit,
        RecruitStatus::EventLocked,
        RecruitStatus::Deceased,
        RecruitStatus::OnLeave,
    ];

    pub fn from_flag(val: i64) -> Self {
        match val {
            0 => RecruitStatus::NotRecruited,
            1 => RecruitStatus::SpokeTo,
            70 => RecruitStatus::AutoJoin,
            71 => RecruitStatus::ManualRecruit,
            86 => RecruitStatus::EventLocked,
            212 => RecruitStatus::Deceased,
            213 => RecruitStatus::OnLeave,
            other => RecruitStatus::Custom(other),
        }
    }

    pub fn to_flag(self) -> i64 {
        match self {
            RecruitStatus::NotRecruited => 0,
            RecruitStatus::SpokeTo => 1,
            RecruitStatus::AutoJoin => 70,
            RecruitStatus::ManualRecruit => 71,
            RecruitStatus::EventLocked => 86,
            RecruitStatus::Deceased => 212,
            RecruitStatus::OnLeave => 213,
            RecruitStatus::Custom(v) => v,
        }
    }

    pub fn is_recruited(self) -> bool {
        matches!(
            self,
            RecruitStatus::AutoJoin | RecruitStatus::ManualRecruit | RecruitStatus::EventLocked
        )
    }
}

impl fmt::Display for RecruitStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            RecruitStatus::NotRecruited => write!(f, "0 - Not Recruited"),
            RecruitStatus::SpokeTo => write!(f, "1 - Spoke To"),
            RecruitStatus::AutoJoin => write!(f, "70 - Auto Join"),
            RecruitStatus::ManualRecruit => write!(f, "71 - Recruited"),
            RecruitStatus::EventLocked => write!(f, "86 - Event Locked"),
            RecruitStatus::Deceased => write!(f, "212 - Deceased"),
            RecruitStatus::OnLeave => write!(f, "213 - On Leave"),
            RecruitStatus::Custom(v) => write!(f, "{} - Custom", v),
        }
    }
}

/// Cached portrait handles resolved reliably regardless of working directory.
pub struct PortraitCache {
    handles: HashMap<i64, image::Handle>,
}

impl Default for PortraitCache {
    fn default() -> Self {
        Self::load()
    }
}

impl PortraitCache {
    pub fn load() -> Self {
        let mut handles = HashMap::new();

        if let Some(dir) = find_portraits_dir() {
            const THUMB_SIZE: u32 = 96;
            let entries: Vec<(i64, PathBuf)> = (1..=125)
                .map(|id| (id, dir.join(format!("fp_{:03}.png", id))))
                .filter(|(_, p)| p.exists())
                .collect();

            let workers = std::thread::available_parallelism()
                .map(|n| n.get().min(8))
                .unwrap_or(4);
            let chunk_size = (entries.len() + workers - 1) / workers.max(1);

            let decoded: Vec<(i64, image::Handle)> = std::thread::scope(|s| {
                let mut joins = Vec::new();
                for chunk in entries.chunks(chunk_size.max(1)) {
                    joins.push(s.spawn(move || {
                        let mut out = Vec::with_capacity(chunk.len());
                        for (id, path) in chunk {
                            if let Ok(img) = ::image::open(path) {
                                let thumb = img.resize_exact(
                                    THUMB_SIZE,
                                    THUMB_SIZE,
                                    ::image::imageops::FilterType::Triangle,
                                );
                                let rgba = thumb.to_rgba8();
                                out.push((
                                    *id,
                                    image::Handle::from_rgba(THUMB_SIZE, THUMB_SIZE, rgba.into_raw()),
                                ));
                            }
                        }
                        out
                    }));
                }
                joins
                    .into_iter()
                    .flat_map(|j| j.join().unwrap_or_default())
                    .collect()
            });

            for (id, handle) in decoded {
                handles.insert(id, handle);
            }
        }

        Self { handles }
    }

    pub fn get(&self, char_id: i64) -> Option<image::Handle> {
        self.handles.get(&char_id).cloned()
    }

    pub fn count(&self) -> usize {
        self.handles.len()
    }
}

fn find_portraits_dir() -> Option<PathBuf> {
    if let Ok(exe) = std::env::current_exe() {
        for ancestor in exe.ancestors().skip(1).take(6) {
            let direct = ancestor.join("portraits");
            if direct.is_dir() {
                return Some(direct);
            }
            let nested = ancestor.join("image").join("portraits");
            if nested.is_dir() {
                return Some(nested);
            }
        }
    }

    for rel in ["portraits", "image/portraits", "../image/portraits"] {
        let p = PathBuf::from(rel);
        if p.is_dir() {
            return Some(p);
        }
    }

    let manifest_fallback = PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/../image/portraits"));
    if manifest_fallback.is_dir() {
        return Some(manifest_fallback);
    }

    None
}

/// Locate the workspace debug save file (`debug/save.json`) regardless of launch directory.
pub fn debug_save_path() -> Option<PathBuf> {
    if let Ok(exe) = std::env::current_exe() {
        for ancestor in exe.ancestors().skip(1).take(6) {
            let candidate = ancestor.join("debug").join("save.json");
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }

    for rel in ["debug/save.json", "../debug/save.json"] {
        let p = PathBuf::from(rel);
        if p.exists() {
            return Some(p);
        }
    }

    let manifest_fallback = PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/../debug/save.json"));
    if manifest_fallback.exists() {
        return Some(manifest_fallback);
    }

    None
}
