use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::i18n::AppLanguage;
use crate::theme::{AccentTheme, BaseTheme};

const GAME_FOLDER_NAME: &str = "Suikoden I and II HD Remaster";

#[derive(Debug, Clone)]
pub struct AppSettings {
    pub language: AppLanguage,
    pub base_theme: BaseTheme,
    pub accent: AccentTheme,
    pub custom_game_dir: Option<PathBuf>,
    pub first_run_completed: bool,
    pub first_run_snapshot_created: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: AppLanguage::En,
            base_theme: BaseTheme::DarkNavy,
            accent: AccentTheme::Yellow,
            custom_game_dir: None,
            first_run_completed: false,
            first_run_snapshot_created: false,
        }
    }
}

impl AppSettings {
    pub fn config_path() -> PathBuf {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let dir = PathBuf::from(appdata).join("SuiSaveEditor");
            return dir.join("settings.json");
        }
        PathBuf::from("suisaveeditor_settings.json")
    }

    pub fn load() -> Self {
        let path = Self::config_path();
        let Ok(raw) = std::fs::read_to_string(&path) else {
            return Self::default();
        };
        let Ok(val) = serde_json::from_str::<serde_json::Value>(&raw) else {
            return Self::default();
        };
        let language = val
            .get("language")
            .and_then(|v| v.as_str())
            .map(AppLanguage::from_key)
            .unwrap_or(AppLanguage::En);
        let base_theme = val
            .get("base_theme")
            .and_then(|v| v.as_str())
            .map(BaseTheme::from_key)
            .unwrap_or(BaseTheme::DarkNavy);
        let accent = val
            .get("accent")
            .and_then(|v| v.as_str())
            .map(AccentTheme::from_key)
            .unwrap_or(AccentTheme::Yellow);
        let custom_game_dir = val
            .get("custom_game_dir")
            .and_then(|v| v.as_str())
            .filter(|s| !s.trim().is_empty())
            .map(PathBuf::from);
        let first_run_completed = val
            .get("first_run_completed")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        let first_run_snapshot_created = val
            .get("first_run_snapshot_created")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        Self {
            language,
            base_theme,
            accent,
            custom_game_dir,
            first_run_completed,
            first_run_snapshot_created,
        }
    }

    pub fn save(&self) {
        let path = Self::config_path();
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let mut obj = serde_json::Map::new();
        obj.insert(
            "language".to_string(),
            serde_json::Value::String(self.language.key().to_string()),
        );
        obj.insert(
            "base_theme".to_string(),
            serde_json::Value::String(self.base_theme.key().to_string()),
        );
        obj.insert(
            "accent".to_string(),
            serde_json::Value::String(self.accent.key().to_string()),
        );
        obj.insert(
            "first_run_completed".to_string(),
            serde_json::Value::Bool(self.first_run_completed),
        );
        obj.insert(
            "first_run_snapshot_created".to_string(),
            serde_json::Value::Bool(self.first_run_snapshot_created),
        );
        if let Some(dir) = &self.custom_game_dir {
            obj.insert(
                "custom_game_dir".to_string(),
                serde_json::Value::String(dir.to_string_lossy().to_string()),
            );
        }
        if let Ok(json) = serde_json::to_string_pretty(&serde_json::Value::Object(obj)) {
            let _ = std::fs::write(path, json);
        }
    }
}

#[derive(Debug, Clone)]
pub struct GameEnvStatus {
    pub game_dir: Option<PathBuf>,
    pub is_custom_dir: bool,
    pub bepinex_installed: bool,
    pub bepinex_doorstop: bool,
    pub suikodenfix_path: Option<PathBuf>,
    pub decrypted_saves_dir: Option<PathBuf>,
    pub decrypted_saves_exists: bool,
    pub edit_save_enabled: Option<bool>,
    pub better_leona_enabled: Option<bool>,
    pub kraken_patch_enabled: bool,
}

impl GameEnvStatus {
    pub fn suikodenfix_installed(&self) -> bool {
        self.suikodenfix_path.is_some()
    }

    pub fn is_ready(&self) -> bool {
        self.bepinex_installed && self.suikodenfix_installed()
    }

    pub fn better_leona_active(&self) -> bool {
        self.better_leona_enabled == Some(true)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SavesSortMode {
    MostRecent,
    SlotNumber,
}

#[derive(Debug, Clone)]
pub struct SaveSlotSummary {
    pub path: PathBuf,
    pub file_name: String,
    pub slot_num: Option<u32>,
    pub hero_name: String,
    pub castle_name: String,
    pub potch: i64,
    pub play_time: String,
    pub recruited_stars: usize,
    pub date_saved: String,
    pub modified_secs: u64,
    pub party_members: [i64; 8],
    pub has_backup: bool,
    pub backup_differs: bool,
}

#[derive(Debug, Clone)]
pub struct SnapshotInfo {
    pub path: PathBuf,
    pub file_name: String,
    pub date_label: String,
    pub file_count: usize,
    pub modified_secs: u64,
}

pub fn detect_game_env(custom_dir: Option<&Path>) -> GameEnvStatus {
    let (game_dir, is_custom_dir) = if let Some(dir) = custom_dir {
        if dir.is_dir() {
            (Some(dir.to_path_buf()), true)
        } else {
            (auto_detect_game_dir(), false)
        }
    } else {
        (auto_detect_game_dir(), false)
    };

    let Some(dir) = game_dir else {
        return GameEnvStatus {
            game_dir: None,
            is_custom_dir: false,
            bepinex_installed: false,
            bepinex_doorstop: false,
            suikodenfix_path: None,
            decrypted_saves_dir: None,
            decrypted_saves_exists: false,
            edit_save_enabled: None,
            better_leona_enabled: None,
            kraken_patch_enabled: false,
        };
    };

    let bepinex_core = dir.join("BepInEx").join("core");
    let bepinex_installed = bepinex_core.is_dir();
    let bepinex_doorstop = dir.join("winhttp.dll").is_file()
        || dir.join("doorstop_config.ini").is_file();

    let plugins_dir = dir.join("BepInEx").join("plugins");
    let suikodenfix_path = if plugins_dir.is_dir() {
        find_plugin_dll(&plugins_dir, "suikodenfix", 0)
    } else {
        None
    };

    let kraken_dll_present = if plugins_dir.is_dir() {
        find_plugin_dll(&plugins_dir, "squidfam", 0).is_some()
            || find_plugin_dll(&plugins_dir, "krakenpatch", 0).is_some()
    } else {
        false
    };

    let decrypted_dir = dir.join("SuikodenFix").join("Decrypted").join("gsd2");
    let decrypted_saves_exists = decrypted_dir.is_dir();

    let config_dir = dir.join("BepInEx").join("config");
    let cfg_path = config_dir.join("d3xMachina.suikoden_fix.cfg");
    let edit_save_enabled = parse_cfg_bool(&cfg_path, "EditSave");
    let better_leona_enabled = parse_cfg_bool(&cfg_path, "BetterLeona");

    let squid_cfg_path = config_dir.join("faospark.SquidFam.cfg");
    let kraken_patch_enabled =
        kraken_dll_present && parse_cfg_bool(&squid_cfg_path, "SquidFam").unwrap_or(true);

    GameEnvStatus {
        game_dir: Some(dir),
        is_custom_dir,
        bepinex_installed,
        bepinex_doorstop,
        suikodenfix_path,
        decrypted_saves_dir: Some(decrypted_dir),
        decrypted_saves_exists,
        edit_save_enabled,
        better_leona_enabled,
        kraken_patch_enabled,
    }
}

fn parse_cfg_bool(cfg_path: &Path, key: &str) -> Option<bool> {
    let content = std::fs::read_to_string(cfg_path).ok()?;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('#') || trimmed.is_empty() {
            continue;
        }
        if let Some((k, v)) = trimmed.split_once('=') {
            if k.trim().eq_ignore_ascii_case(key) {
                return Some(v.trim().eq_ignore_ascii_case("true"));
            }
        }
    }
    None
}

pub fn scan_decrypted_saves(dir: &Path) -> Vec<SaveSlotSummary> {
    let _ = crate::save_file::migrate_loose_bak_files(dir);
    let Ok(entries) = std::fs::read_dir(dir) else {
        return Vec::new();
    };

    let mut saves = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
            continue;
        };
        if !ext.eq_ignore_ascii_case("json") {
            continue;
        }
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("save.json")
            .to_string();

        let modified_secs = entry
            .metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let slot_num = extract_slot_number(&file_name);

        let (hero_name, castle_name, potch, play_time, recruited_stars, date_saved, party_members) =
            parse_save_summary(&path);
        let bak_path = crate::save_file::backup_path_for_save(&path);
        let has_backup = bak_path.is_file();
        let backup_differs = if has_backup {
            files_differ(&path, &bak_path)
        } else {
            false
        };

        saves.push(SaveSlotSummary {
            path,
            file_name,
            slot_num,
            hero_name,
            castle_name,
            potch,
            play_time,
            recruited_stars,
            date_saved,
            modified_secs,
            party_members,
            has_backup,
            backup_differs,
        });
    }

    saves
}

/// Fast byte-level check to determine whether two files differ.
pub fn files_differ(a: &Path, b: &Path) -> bool {
    let Ok(ma) = std::fs::metadata(a) else { return true };
    let Ok(mb) = std::fs::metadata(b) else { return true };
    if ma.len() != mb.len() {
        return true;
    }
    match (std::fs::read(a), std::fs::read(b)) {
        (Ok(ba), Ok(bb)) => ba != bb,
        _ => true,
    }
}

fn extract_slot_number(file_name: &str) -> Option<u32> {
    let stem = file_name.strip_suffix(".json").or_else(|| file_name.strip_suffix(".JSON")).unwrap_or(file_name);
    let digits: String = stem.chars().filter(|c| c.is_ascii_digit()).collect();
    if digits.is_empty() {
        None
    } else {
        digits.parse::<u32>().ok()
    }
}

fn parse_save_summary(path: &Path) -> (String, String, i64, String, usize, String, [i64; 8]) {
    let Ok(raw) = std::fs::read_to_string(path) else {
        return ("—".into(), "—".into(), 0, "00:00:00".into(), 0, "—".into(), [0; 8]);
    };
    let clean = raw.trim_start_matches('\u{FEFF}');
    let Ok(val) = serde_json::from_str::<serde_json::Value>(clean) else {
        return ("Invalid JSON".into(), "—".into(), 0, "—".into(), 0, "—".into(), [0; 8]);
    };

    let gd = val.get("game_data");
    let pd = val.get("party_data");
    let hero_name = gd
        .and_then(|g| g.get("bozu_name"))
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .unwrap_or("Hero")
        .to_string();
    let castle_name = gd
        .and_then(|g| g.get("base_name"))
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .unwrap_or("—")
        .to_string();
    let potch = pd
        .and_then(|p| p.get("gold"))
        .and_then(|v| v.as_i64())
        .or_else(|| gd.and_then(|g| g.get("gold")).and_then(|v| v.as_i64()))
        .unwrap_or(0);

    let mut party_members = [0i64; 8];
    if let Some(arr) = pd
        .and_then(|p| p.get("party_cha_no"))
        .and_then(|v| v.as_array())
    {
        for (i, slot) in party_members.iter_mut().enumerate() {
            *slot = arr.get(i).and_then(|v| v.as_i64()).unwrap_or(0);
        }
    }

    let play_time = gd
        .and_then(|g| g.get("play_time"))
        .and_then(|v| v.as_array())
        .map(|a| {
            let h = a.first().and_then(|v| v.as_i64()).unwrap_or(0);
            let m = a.get(1).and_then(|v| v.as_i64()).unwrap_or(0);
            let s = a.get(2).and_then(|v| v.as_i64()).unwrap_or(0);
            format!("{:02}:{:02}:{:02}", h, m, s)
        })
        .unwrap_or_else(|| "00:00:00".to_string());

    let recruited_stars = val
        .get("chara_flag")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .take(125)
                .filter(|v| matches!(v.as_i64().unwrap_or(0), 70 | 71 | 86))
                .count()
        })
        .unwrap_or(0);

    let date_saved = val
        .get("date_time_now")
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .unwrap_or("—")
        .to_string();

    (
        hero_name,
        castle_name,
        potch,
        play_time,
        recruited_stars,
        date_saved,
        party_members,
    )
}

pub fn is_file_in_dir(file: &Path, dir: &Path) -> bool {
    let Some(parent) = file.parent() else {
        return false;
    };
    match (std::fs::canonicalize(parent), std::fs::canonicalize(dir)) {
        (Ok(a), Ok(b)) => a == b,
        _ => parent == dir,
    }
}

fn auto_detect_game_dir() -> Option<PathBuf> {
    let mut steam_roots: Vec<PathBuf> = Vec::new();

    let drives = ["C", "D", "E", "F", "G", "H"];
    let subpaths = [
        r"Program Files (x86)\Steam",
        r"Program Files\Steam",
        "Steam",
        "SteamLibrary",
        r"Games\Steam",
        r"Games\SteamLibrary",
    ];

    for drive in drives {
        for sub in subpaths {
            let candidate = PathBuf::from(format!(r"{}:\{}", drive, sub));
            if candidate.is_dir() {
                steam_roots.push(candidate);
            }
        }
    }

    let mut library_roots: Vec<PathBuf> = steam_roots.clone();
    for root in &steam_roots {
        let vdf = root.join("steamapps").join("libraryfolders.vdf");
        if let Ok(content) = std::fs::read_to_string(&vdf) {
            for lib_path in parse_vdf_library_paths(&content) {
                if !library_roots.contains(&lib_path) {
                    library_roots.push(lib_path);
                }
            }
        }
    }

    for lib in &library_roots {
        let candidate = lib
            .join("steamapps")
            .join("common")
            .join(GAME_FOLDER_NAME);
        if candidate.is_dir() {
            return Some(candidate);
        }
    }

    for drive in drives {
        for sub in [
            GAME_FOLDER_NAME.to_string(),
            format!(r"Games\{}", GAME_FOLDER_NAME),
        ] {
            let candidate = PathBuf::from(format!(r"{}:\{}", drive, sub));
            if candidate.is_dir() {
                return Some(candidate);
            }
        }
    }

    None
}

fn parse_vdf_library_paths(vdf: &str) -> Vec<PathBuf> {
    let mut paths = Vec::new();
    for line in vdf.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("\"path\"") {
            let rest = rest.trim();
            if let Some(stripped) = rest.strip_prefix('"').and_then(|s| s.strip_suffix('"')) {
                let unescaped = stripped.replace("\\\\", "\\");
                if !unescaped.is_empty() {
                    paths.push(PathBuf::from(unescaped));
                }
            }
        }
    }
    paths
}

fn find_plugin_dll(dir: &Path, needle: &str, depth: usize) -> Option<PathBuf> {
    if depth > 5 {
        return None;
    }
    let entries = std::fs::read_dir(dir).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                let lower = name.to_ascii_lowercase();
                let normalized = lower.replace(['_', '-', ' '], "");
                if normalized.contains(needle) && lower.ends_with(".dll") {
                    return Some(path);
                }
            }
        } else if path.is_dir() {
            if let Some(found) = find_plugin_dll(&path, needle, depth + 1) {
                return Some(found);
            }
        }
    }
    None
}

pub async fn pick_game_dir_async(initial: Option<PathBuf>) -> Option<PathBuf> {
    let mut dialog = rfd::AsyncFileDialog::new()
        .set_title("Select Suikoden I and II HD Remaster Game Folder");
    if let Some(dir) = initial {
        if dir.exists() {
            dialog = dialog.set_directory(dir);
        }
    }
    dialog.pick_folder().await.map(|h| h.path().to_path_buf())
}

// ============================================================================
// Backup Restore & Full ZIP Snapshots (stored inside `<saves_dir>/backups/`)
// ============================================================================

#[cfg(windows)]
fn local_timestamp_parts() -> (u16, u16, u16, u16, u16, u16) {
    #[repr(C)]
    struct SystemTimeWin {
        year: u16,
        month: u16,
        day_of_week: u16,
        day: u16,
        hour: u16,
        minute: u16,
        second: u16,
        milliseconds: u16,
    }
    #[link(name = "kernel32")]
    extern "system" {
        fn GetLocalTime(lpSystemTime: *mut SystemTimeWin);
    }
    let mut st = SystemTimeWin {
        year: 2026,
        month: 1,
        day_of_week: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        milliseconds: 0,
    };
    unsafe {
        GetLocalTime(&mut st);
    }
    (st.year, st.month, st.day, st.hour, st.minute, st.second)
}

#[cfg(not(windows))]
fn local_timestamp_parts() -> (u16, u16, u16, u16, u16, u16) {
    let secs = std::time::SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let s = (secs % 60) as u16;
    let m = ((secs / 60) % 60) as u16;
    let h = ((secs / 3600) % 24) as u16;
    (2026, 1, 1, h, m, s)
}

/// Restores `<parent>/backups/<file>.bak` over `<save_path>`.
pub fn restore_single_bak(save_path: &Path) -> Result<(), String> {
    let bak = crate::save_file::backup_path_for_save(save_path);
    if !bak.is_file() {
        return Err(format!("No backup found at '{}'", bak.display()));
    }
    std::fs::copy(&bak, save_path)
        .map_err(|e| format!("Failed to restore backup: {}", e))?;
    Ok(())
}

/// Packages all `.json` saves in `saves_dir` into `saves_dir/backups/snapshot_YYYY-MM-DD_HH-MM-SS.zip`.
pub fn create_saves_snapshot(saves_dir: &Path) -> Result<SnapshotInfo, String> {
    use std::io::Write;

    if !saves_dir.is_dir() {
        return Err("Decrypted saves folder does not exist.".to_string());
    }
    let _ = crate::save_file::migrate_loose_bak_files(saves_dir);
    let backups_dir = crate::save_file::backup_dir_for(saves_dir);
    std::fs::create_dir_all(&backups_dir)
        .map_err(|e| format!("Failed to create backups folder: {}", e))?;

    let mut json_files: Vec<(String, PathBuf)> = Vec::new();
    let entries = std::fs::read_dir(saves_dir)
        .map_err(|e| format!("Failed to read saves folder: {}", e))?;
    for entry in entries.flatten() {
        let p = entry.path();
        if !p.is_file() {
            continue;
        }
        let is_json = p
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.eq_ignore_ascii_case("json"))
            .unwrap_or(false);
        if is_json {
            if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                json_files.push((name.to_string(), p));
            }
        }
    }
    if json_files.is_empty() {
        return Err("No .json save files found to snapshot.".to_string());
    }
    json_files.sort_by(|a, b| a.0.cmp(&b.0));

    let (y, mo, d, h, mi, s) = local_timestamp_parts();
    let file_name = format!(
        "snapshot_{:04}-{:02}-{:02}_{:02}-{:02}-{:02}.zip",
        y, mo, d, h, mi, s
    );
    let date_label = format!(
        "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
        y, mo, d, h, mi, s
    );
    let zip_path = backups_dir.join(&file_name);

    let file = std::fs::File::create(&zip_path)
        .map_err(|e| format!("Failed to create snapshot zip: {}", e))?;
    let mut zip_writer = zip::ZipWriter::new(file);
    let options = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    let mut count = 0usize;
    for (name, path) in &json_files {
        let bytes = std::fs::read(path)
            .map_err(|e| format!("Failed to read '{}': {}", name, e))?;
        zip_writer
            .start_file(name, options)
            .map_err(|e| format!("Failed to add '{}' to zip: {}", name, e))?;
        zip_writer
            .write_all(&bytes)
            .map_err(|e| format!("Failed to write '{}' to zip: {}", name, e))?;
        count += 1;
    }
    zip_writer
        .finish()
        .map_err(|e| format!("Failed to finalize snapshot zip: {}", e))?;

    let modified_secs = std::fs::metadata(&zip_path)
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|dur| dur.as_secs())
        .unwrap_or(0);

    Ok(SnapshotInfo {
        path: zip_path,
        file_name,
        date_label,
        file_count: count,
        modified_secs,
    })
}

/// Scans `saves_dir/backups/*.zip` and returns all snapshots sorted newest-first.
pub fn scan_snapshots(saves_dir: &Path) -> Vec<SnapshotInfo> {
    let backups_dir = crate::save_file::backup_dir_for(saves_dir);
    let Ok(entries) = std::fs::read_dir(&backups_dir) else {
        return Vec::new();
    };

    let mut out = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let is_zip = path
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.eq_ignore_ascii_case("zip"))
            .unwrap_or(false);
        if !is_zip {
            continue;
        }
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("snapshot.zip")
            .to_string();
        let modified_secs = entry
            .metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let file_count = std::fs::File::open(&path)
            .ok()
            .and_then(|f| zip::ZipArchive::new(f).ok())
            .map(|a| a.len())
            .unwrap_or(0);

        let date_label = parse_snapshot_date_label(&file_name);

        out.push(SnapshotInfo {
            path,
            file_name,
            date_label,
            file_count,
            modified_secs,
        });
    }

    out.sort_by(|a, b| {
        b.modified_secs
            .cmp(&a.modified_secs)
            .then_with(|| b.file_name.cmp(&a.file_name))
    });
    out
}

fn parse_snapshot_date_label(file_name: &str) -> String {
    let stem = file_name
        .strip_prefix("snapshot_")
        .unwrap_or(file_name);
    let stem = stem
        .strip_suffix(".zip")
        .or_else(|| stem.strip_suffix(".ZIP"))
        .unwrap_or(stem);
    if let Some((date_part, time_part)) = stem.split_once('_') {
        format!("{} {}", date_part, time_part.replace('-', ":"))
    } else {
        stem.to_string()
    }
}

/// Restores every `.json` save file from a snapshot `.zip` back into `saves_dir`.
pub fn restore_saves_snapshot(snapshot_path: &Path, saves_dir: &Path) -> Result<usize, String> {
    use std::io::Read;

    if !saves_dir.is_dir() {
        return Err("Decrypted saves folder does not exist.".to_string());
    }
    let file = std::fs::File::open(snapshot_path)
        .map_err(|e| format!("Failed to open snapshot: {}", e))?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("Invalid snapshot zip: {}", e))?;

    let mut restored = 0usize;
    for i in 0..archive.len() {
        let mut entry = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {}", e))?;
        if entry.is_dir() {
            continue;
        }
        let Some(safe_name) = Path::new(entry.name())
            .file_name()
            .and_then(|n| n.to_str())
            .map(str::to_string)
        else {
            continue;
        };
        if !safe_name.to_ascii_lowercase().ends_with(".json") {
            continue;
        }
        let mut buf = Vec::new();
        entry
            .read_to_end(&mut buf)
            .map_err(|e| format!("Failed to extract '{}': {}", safe_name, e))?;
        let dest = saves_dir.join(&safe_name);
        std::fs::write(&dest, &buf)
            .map_err(|e| format!("Failed to restore '{}': {}", safe_name, e))?;
        restored += 1;
    }

    Ok(restored)
}

/// Permanently deletes a single snapshot `.zip` archive from `backups/`.
pub fn delete_saves_snapshot(snapshot_path: &Path) -> Result<(), String> {
    let is_zip = snapshot_path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.eq_ignore_ascii_case("zip"))
        .unwrap_or(false);
    if !is_zip || !snapshot_path.is_file() {
        return Err("Snapshot file not found.".to_string());
    }
    std::fs::remove_file(snapshot_path)
        .map_err(|e| format!("Failed to delete snapshot: {}", e))
}
