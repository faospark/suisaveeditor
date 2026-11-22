use std::path::{Path, PathBuf};

use crate::theme::AccentTheme;

const GAME_FOLDER_NAME: &str = "Suikoden I and II HD Remaster";

#[derive(Debug, Clone)]
pub struct AppSettings {
    pub accent: AccentTheme,
    pub custom_game_dir: Option<PathBuf>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            accent: AccentTheme::Yellow,
            custom_game_dir: None,
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
        Self {
            accent,
            custom_game_dir,
        }
    }

    pub fn save(&self) {
        let path = Self::config_path();
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let mut obj = serde_json::Map::new();
        obj.insert(
            "accent".to_string(),
            serde_json::Value::String(self.accent.key().to_string()),
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
}

impl GameEnvStatus {
    pub fn suikodenfix_installed(&self) -> bool {
        self.suikodenfix_path.is_some()
    }

    pub fn is_ready(&self) -> bool {
        self.bepinex_installed && self.suikodenfix_installed()
    }
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
        };
    };

    let bepinex_core = dir.join("BepInEx").join("core");
    let bepinex_installed = bepinex_core.is_dir();
    let bepinex_doorstop = dir.join("winhttp.dll").is_file()
        || dir.join("doorstop_config.ini").is_file();

    let plugins_dir = dir.join("BepInEx").join("plugins");
    let suikodenfix_path = if plugins_dir.is_dir() {
        find_suikodenfix_dll(&plugins_dir, 0)
    } else {
        None
    };

    GameEnvStatus {
        game_dir: Some(dir),
        is_custom_dir,
        bepinex_installed,
        bepinex_doorstop,
        suikodenfix_path,
    }
}

fn auto_detect_game_dir() -> Option<PathBuf> {
    let mut steam_roots: Vec<PathBuf> = Vec::new();

    // Common Steam root locations across drives A..Z (focused on typical drives)
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

    // Parse any libraryfolders.vdf files to discover custom Steam library drives/folders
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

    // Direct drive-level fallback (e.g. D:\Games\Suikoden I and II HD Remaster)
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
        // Matches lines like: "path"		"D:\\SteamLibrary"
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

fn find_suikodenfix_dll(dir: &Path, depth: usize) -> Option<PathBuf> {
    if depth > 5 {
        return None;
    }
    let entries = std::fs::read_dir(dir).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        // Follow symlinks/junctions via `std::fs::metadata` (works with Vortex & manual symlinks)
        let meta = std::fs::metadata(&path).ok();
        let is_file = meta.as_ref().map(|m| m.is_file()).unwrap_or(false);
        let is_dir = meta.as_ref().map(|m| m.is_dir()).unwrap_or(false);

        if is_file {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                let lower = name.to_ascii_lowercase();
                let normalized: String = lower
                    .chars()
                    .filter(|c| *c != '_' && *c != '-' && *c != ' ')
                    .collect();
                if normalized.contains("suikodenfix") && lower.ends_with(".dll") {
                    return Some(path);
                }
            }
        } else if is_dir {
            if let Some(found) = find_suikodenfix_dll(&path, depth + 1) {
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
