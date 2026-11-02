use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug)]
pub struct OpenFileResult {
    pub path: String,
    pub name: String,
    pub content: String,
    pub backup_path: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SavedFileResult {
    pub path: String,
    pub name: String,
}

#[tauri::command]
fn open_file_dialog_and_backup(default_path: Option<String>) -> Result<Option<OpenFileResult>, String> {
    let mut dialog = rfd::FileDialog::new()
        .add_filter("Suikoden II Save File (*.json)", &["json"])
        .add_filter("All Files (*.*)", &["*"]);

    if let Some(ref dp) = default_path {
        let p = PathBuf::from(dp);
        if let Some(parent) = p.parent() {
            if parent.exists() {
                dialog = dialog.set_directory(parent);
            }
        } else if p.is_dir() && p.exists() {
            dialog = dialog.set_directory(&p);
        }
    }

    if let Some(path) = dialog.pick_file() {
        let file_path = path.to_string_lossy().to_string();
        let file_name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let content = std::fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read file: {}", e))?;

        // Silently create .bak backup immediately in the exact same directory
        let bak_path = format!("{}.bak", file_path);
        let backup_path = match std::fs::copy(&path, &bak_path) {
            Ok(_) => Some(bak_path),
            Err(e) => {
                log::warn!("Could not create backup at {}: {}", bak_path, e);
                None
            }
        };

        Ok(Some(OpenFileResult {
            path: file_path,
            name: file_name,
            content,
            backup_path,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn create_backup_from_path(file_path: String) -> Result<String, String> {
    let path = PathBuf::from(&file_path);
    if !path.exists() {
        return Err("Source file does not exist".to_string());
    }
    let bak_path = format!("{}.bak", file_path);
    std::fs::copy(&path, &bak_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;
    Ok(bak_path)
}

#[tauri::command]
fn load_file_from_path_and_backup(file_path: String) -> Result<OpenFileResult, String> {
    let path = PathBuf::from(&file_path);
    if !path.exists() {
        return Err("Source file does not exist".to_string());
    }
    let file_name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let bak_path = format!("{}.bak", file_path);
    let backup_path = match std::fs::copy(&path, &bak_path) {
        Ok(_) => Some(bak_path),
        Err(e) => {
            log::warn!("Could not create backup at {}: {}", bak_path, e);
            None
        }
    };

    Ok(OpenFileResult {
        path: file_path,
        name: file_name,
        content,
        backup_path,
    })
}

#[tauri::command]
fn save_file_as_dialog(
    suggested_name: String,
    content: String,
    default_path: Option<String>,
) -> Result<Option<SavedFileResult>, String> {
    let mut dialog = rfd::FileDialog::new()
        .add_filter("Suikoden II Save File (*.json)", &["json"])
        .add_filter("All Files (*.*)", &["*"]);

    // Always default the Save As dialog to the same directory where the file was opened
    if let Some(ref dp) = default_path {
        let p = PathBuf::from(dp);
        if let Some(parent) = p.parent() {
            if parent.exists() {
                dialog = dialog.set_directory(parent);
            }
        } else if p.is_dir() && p.exists() {
            dialog = dialog.set_directory(&p);
        }
    }

    if !suggested_name.is_empty() {
        dialog = dialog.set_file_name(&suggested_name);
    }

    if let Some(path) = dialog.save_file() {
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }

        // Prepend UTF-8 BOM to match remaster engine format
        let mut bytes = vec![0xEF, 0xBB, 0xBF];
        bytes.extend_from_slice(content.as_bytes());

        std::fs::write(&path, bytes)
            .map_err(|e| format!("Failed to write file: {}", e))?;

        let saved_path = path.to_string_lossy().to_string();
        let saved_name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        Ok(Some(SavedFileResult {
            path: saved_path,
            name: saved_name,
        }))
    } else {
        Ok(None)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            open_file_dialog_and_backup,
            create_backup_from_path,
            load_file_from_path_and_backup,
            save_file_as_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
