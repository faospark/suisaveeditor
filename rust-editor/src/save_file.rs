use serde_json::Value;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct SaveDocument {
    pub path: PathBuf,
    pub file_name: String,
    pub backup_path: Option<PathBuf>,
    pub data: Value,
    pub dirty: bool,
}

impl SaveDocument {
    /// Open a JSON save file and silently create a `.bak` copy in the exact same directory.
    pub fn open_and_backup(path: PathBuf) -> Result<Self, String> {
        let raw_content = std::fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read '{}': {}", path.display(), e))?;

        // Strip UTF-8 BOM (0xEF 0xBB 0xBF) produced by SuikodenFix / SuikodenSaveDecrypter
        let clean_content = raw_content.trim_start_matches('\u{FEFF}');

        let data: Value = serde_json::from_str(clean_content)
            .map_err(|e| format!("Invalid JSON save file: {}", e))?;

        let file_name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        // Silent .bak backup in the exact same directory (no dialogs/popups)
        let bak_path = PathBuf::from(format!("{}.bak", path.to_string_lossy()));
        let backup_path = match std::fs::copy(&path, &bak_path) {
            Ok(_) => Some(bak_path),
            Err(_) => None,
        };

        Ok(Self {
            path,
            file_name,
            backup_path,
            data,
            dirty: false,
        })
    }

    /// Save directly to a target path using SuikodenFix-compatible JSON (UTF-8 BOM, \uXXXX escapes, CRLF).
    pub fn save_to(&mut self, target: &Path) -> Result<(), String> {
        let serialized = serde_json::to_string_pretty(&self.data)
            .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

        // Escape non-ASCII characters as \uXXXX (matching SuikodenFix / JS editor format)
        let mut escaped = String::with_capacity(serialized.len());
        for ch in serialized.chars() {
            if (ch as u32) >= 0x80 {
                let mut buf = [0u16; 2];
                for unit in ch.encode_utf16(&mut buf) {
                    escaped.push_str(&format!("\\u{:04X}", unit));
                }
            } else {
                escaped.push(ch);
            }
        }

        let crlf = escaped.replace("\r\n", "\n").replace('\n', "\r\n");

        let mut bytes = Vec::with_capacity(3 + crlf.len());
        bytes.extend_from_slice(&[0xEF, 0xBB, 0xBF]);
        bytes.extend_from_slice(crlf.as_bytes());

        std::fs::write(target, bytes)
            .map_err(|e| format!("Failed to write '{}': {}", target.display(), e))?;

        self.path = target.to_path_buf();
        self.file_name = target
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        self.dirty = false;
        Ok(())
    }

    // ---- Typed accessors for General fields ----

    pub fn get_str(&self, section: Option<&str>, key: &str) -> String {
        let obj = match section {
            Some(s) => self.data.get(s),
            None => Some(&self.data),
        };
        obj.and_then(|v| v.get(key))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    }

    pub fn set_str(&mut self, section: Option<&str>, key: &str, value: String) {
        let target = match section {
            Some(s) => self.data.get_mut(s),
            None => Some(&mut self.data),
        };
        if let Some(Value::Object(map)) = target {
            map.insert(key.to_string(), Value::String(value));
            self.dirty = true;
        }
    }

    pub fn get_i64(&self, section: Option<&str>, key: &str) -> i64 {
        let obj = match section {
            Some(s) => self.data.get(s),
            None => Some(&self.data),
        };
        obj.and_then(|v| v.get(key))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_i64(&mut self, section: Option<&str>, key: &str, value: i64) {
        let target = match section {
            Some(s) => self.data.get_mut(s),
            None => Some(&mut self.data),
        };
        if let Some(Value::Object(map)) = target {
            map.insert(key.to_string(), Value::Number(value.into()));
            self.dirty = true;
        }
    }

    pub fn get_array_i64(&self, section: Option<&str>, key: &str, index: usize) -> i64 {
        let obj = match section {
            Some(s) => self.data.get(s),
            None => Some(&self.data),
        };
        obj.and_then(|v| v.get(key))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(index))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_array_i64(&mut self, section: Option<&str>, key: &str, index: usize, value: i64) {
        let target = match section {
            Some(s) => self.data.get_mut(s),
            None => Some(&mut self.data),
        };
        if let Some(Value::Array(arr)) = target.and_then(|v| v.get_mut(key)) {
            if let Some(slot) = arr.get_mut(index) {
                *slot = Value::Number(value.into());
                self.dirty = true;
            }
        }
    }

    pub fn active_party(&self) -> Vec<i64> {
        self.data
            .get("party_data")
            .and_then(|p| p.get("party_cha_no"))
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().map(|v| v.as_i64().unwrap_or(0)).collect())
            .unwrap_or_default()
    }

    // ---- Recruitment (chara_flag) ----

    pub fn get_chara_flag(&self, index: usize) -> i64 {
        self.data
            .get("chara_flag")
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(index))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_chara_flag(&mut self, index: usize, status: i64) {
        if let Some(Value::Array(arr)) = self.data.get_mut("chara_flag") {
            if let Some(slot) = arr.get_mut(index) {
                *slot = Value::Number(status.into());
                self.dirty = true;
            }
        }
        // Auto-clear associated story flags when un-recruiting (matching RECRUITMENT_STORY_FLAGS)
        if status == 0 {
            let clears: &[(usize, u8)] = match index {
                51 => &[(211, 0x06), (230, 0x02)],  // Badeaux
                97 => &[(211, 0x18)],               // Tenkou
                65 => &[(29, 0x08)],                // Simone
                64 => &[(29, 0xE0)],                // Vincent
                112 => &[(92, 0x01), (112, 0x30)],  // Annallee
                114 => &[(212, 0x03), (114, 0x30)], // Alberto
                108 => &[(216, 0x03)],              // Connell
                104 => &[(216, 0x30)],              // Tony
                102 => &[(68, 0xF0), (70, 0x01)],   // Yuzu
                68 => &[(216, 0x80)],               // Wakaba
                110 => &[(110, 0x02)],              // Tessai
                17 => &[(171, 0x40), (20, 0x80)],   // Tomo
                50 => &[(230, 0x03), (215, 0x14)],  // Feather
                43 => &[(230, 0x03), (215, 0x40)],  // Ayda
                _ => &[],
            };
            for &(byte_idx, mask) in clears {
                self.toggle_event_flag_bit(byte_idx, mask, false);
            }
        }
    }

    // ---- Battle Characters (chara_data.c_varia_dat[id]) ----

    pub fn get_battle_char_i64(&self, id: usize, field: &str) -> i64 {
        self.data
            .get("chara_data")
            .and_then(|c| c.get("c_varia_dat"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(id))
            .and_then(|ch| ch.get(field))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_battle_char_i64(&mut self, id: usize, field: &str, value: i64) {
        if let Some(Value::Object(ch)) = self
            .data
            .get_mut("chara_data")
            .and_then(|c| c.get_mut("c_varia_dat"))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(id))
        {
            ch.insert(field.to_string(), Value::Number(value.into()));
            self.dirty = true;
        }
    }

    pub fn get_battle_char_array_i64(&self, id: usize, field: &str, slot: usize) -> i64 {
        self.data
            .get("chara_data")
            .and_then(|c| c.get("c_varia_dat"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(id))
            .and_then(|ch| ch.get(field))
            .and_then(|v| v.as_array())
            .and_then(|a| a.get(slot))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_battle_char_array_i64(&mut self, id: usize, field: &str, slot: usize, value: i64) {
        if let Some(Value::Array(arr)) = self
            .data
            .get_mut("chara_data")
            .and_then(|c| c.get_mut("c_varia_dat"))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(id))
            .and_then(|ch| ch.get_mut(field))
        {
            if let Some(item) = arr.get_mut(slot) {
                *item = Value::Number(value.into());
                self.dirty = true;
            }
        }
    }

    pub fn get_battle_char_accessory(&self, id: usize, slot: usize) -> (i64, i64) {
        self.data
            .get("chara_data")
            .and_then(|c| c.get("c_varia_dat"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(id))
            .and_then(|ch| ch.get("item_eqp"))
            .and_then(|v| v.as_array())
            .and_then(|a| a.get(slot))
            .map(|obj| {
                let item_no = obj.get("item_no").and_then(|v| v.as_i64()).unwrap_or(0);
                let use_cnt = obj.get("use_cnt").and_then(|v| v.as_i64()).unwrap_or(0);
                (item_no, use_cnt)
            })
            .unwrap_or((0, 0))
    }

    pub fn set_battle_char_item_eqp(
        &mut self,
        id: usize,
        slot: usize,
        item_no: i64,
        use_cnt: i64,
    ) {
        if let Some(Value::Object(obj)) = self
            .data
            .get_mut("chara_data")
            .and_then(|c| c.get_mut("c_varia_dat"))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(id))
            .and_then(|ch| ch.get_mut("item_eqp"))
            .and_then(|v| v.as_array_mut())
            .and_then(|a| a.get_mut(slot))
        {
            obj.insert("item_no".to_string(), Value::Number(item_no.into()));
            obj.insert("use_cnt".to_string(), Value::Number(use_cnt.into()));
            self.dirty = true;
        }
    }

    pub fn set_battle_char_item_use_cnt(&mut self, id: usize, slot: usize, use_cnt: i64) {
        if let Some(Value::Object(obj)) = self
            .data
            .get_mut("chara_data")
            .and_then(|c| c.get_mut("c_varia_dat"))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(id))
            .and_then(|ch| ch.get_mut("item_eqp"))
            .and_then(|v| v.as_array_mut())
            .and_then(|a| a.get_mut(slot))
        {
            obj.insert("use_cnt".to_string(), Value::Number(use_cnt.into()));
            self.dirty = true;
        }
    }

    // ---- Advanced Archetype (chara_data.c_kotei_dat[id]) ----

    pub fn get_kotei_i64(&self, id: usize, field: &str) -> i64 {
        self.data
            .get("chara_data")
            .and_then(|c| c.get("c_kotei_dat"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(id))
            .and_then(|ch| ch.get(field))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_kotei_i64(&mut self, id: usize, field: &str, value: i64) {
        if let Some(Value::Object(ch)) = self
            .data
            .get_mut("chara_data")
            .and_then(|c| c.get_mut("c_kotei_dat"))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(id))
        {
            ch.insert(field.to_string(), Value::Number(value.into()));
            self.dirty = true;
        }
    }

    pub fn toggle_kotei_bit(&mut self, id: usize, field: &str, mask: u8, enabled: bool) {
        let cur = self.get_kotei_i64(id, field) as u8;
        let next = if enabled { cur | mask } else { cur & !mask };
        self.set_kotei_i64(id, field, next as i64);
    }

    pub fn get_kotei_array_i64(&self, id: usize, field: &str, slot: usize) -> i64 {
        self.data
            .get("chara_data")
            .and_then(|c| c.get("c_kotei_dat"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(id))
            .and_then(|ch| ch.get(field))
            .and_then(|v| v.as_array())
            .and_then(|a| a.get(slot))
            .and_then(|v| v.as_i64())
            .unwrap_or(0)
    }

    pub fn set_kotei_array_i64(&mut self, id: usize, field: &str, slot: usize, value: i64) {
        if let Some(Value::Array(arr)) = self
            .data
            .get_mut("chara_data")
            .and_then(|c| c.get_mut("c_kotei_dat"))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(id))
            .and_then(|ch| ch.get_mut(field))
        {
            if let Some(item) = arr.get_mut(slot) {
                *item = Value::Number(value.into());
                self.dirty = true;
            }
        }
    }

    pub fn get_affinity_rank(&self, id: usize, elem_idx: usize) -> i64 {
        let byte = self.get_kotei_array_i64(id, "mon_zoku_aisyo", elem_idx / 2) as u8;
        if elem_idx % 2 == 1 {
            ((byte >> 4) & 0x0F) as i64
        } else {
            (byte & 0x0F) as i64
        }
    }

    pub fn set_affinity_rank(&mut self, id: usize, elem_idx: usize, rank: i64) {
        let byte_idx = elem_idx / 2;
        let cur = self.get_kotei_array_i64(id, "mon_zoku_aisyo", byte_idx) as u8;
        let r = (rank.clamp(0, 15)) as u8;
        let next = if elem_idx % 2 == 1 {
            (cur & 0x0F) | (r << 4)
        } else {
            (cur & 0xF0) | r
        };
        self.set_kotei_array_i64(id, "mon_zoku_aisyo", byte_idx, next as i64);
    }

    pub fn set_all_affinities_rank_a(&mut self, id: usize) {
        for b in 0..4 {
            self.set_kotei_array_i64(id, "mon_zoku_aisyo", b, 0x11);
        }
    }

    // ---- Event Flags & String Arrays (Clive Quest, Greenhill Aliases) ----

    pub fn get_event_flag(&self, index: usize) -> u8 {
        self.data
            .get("event_flag")
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(index))
            .and_then(|v| v.as_u64())
            .unwrap_or(0) as u8
    }

    pub fn toggle_event_flag_bit(&mut self, index: usize, mask: u8, enabled: bool) {
        self.toggle_array_flag_bit(None, "event_flag", index, mask, enabled);
    }

    pub fn get_array_len(&self, section: Option<&str>, key: &str) -> usize {
        let obj = match section {
            Some(s) => self.data.get(s),
            None => Some(&self.data),
        };
        obj.and_then(|v| v.get(key))
            .and_then(|v| v.as_array())
            .map(|a| a.len())
            .unwrap_or(0)
    }

    pub fn toggle_array_flag_bit(
        &mut self,
        section: Option<&str>,
        key: &str,
        index: usize,
        mask: u8,
        enabled: bool,
    ) {
        let target = match section {
            Some(s) => self.data.get_mut(s),
            None => Some(&mut self.data),
        };
        if let Some(Value::Array(arr)) = target.and_then(|v| v.get_mut(key)) {
            if let Some(slot) = arr.get_mut(index) {
                let cur = slot.as_u64().unwrap_or(0) as u8;
                let next = if enabled { cur | mask } else { cur & !mask };
                *slot = Value::Number((next as i64).into());
                self.dirty = true;
            }
        }
    }

    pub fn get_array_str(&self, section: Option<&str>, key: &str, index: usize) -> String {
        let obj = match section {
            Some(s) => self.data.get(s),
            None => Some(&self.data),
        };
        obj.and_then(|v| v.get(key))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(index))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    }

    pub fn set_array_str(&mut self, section: Option<&str>, key: &str, index: usize, value: String) {
        let target = match section {
            Some(s) => self.data.get_mut(s),
            None => Some(&mut self.data),
        };
        if let Some(Value::Array(arr)) = target.and_then(|v| v.get_mut(key)) {
            if let Some(slot) = arr.get_mut(index) {
                *slot = Value::String(value);
                self.dirty = true;
            }
        }
    }

    // ---- Suggestion Box (game_data.meyasu_data[0..31], 2 bits per character) ----

    pub fn get_meyasu_char_level(&self, char_id: usize) -> u8 {
        let byte_idx = char_id / 4;
        let shift = (char_id % 4) * 2;
        let byte = self.get_array_i64(Some("game_data"), "meyasu_data", byte_idx) as u8;
        (byte >> shift) & 0x03
    }

    pub fn set_meyasu_char_level(&mut self, char_id: usize, level: u8) {
        let byte_idx = char_id / 4;
        let shift = (char_id % 4) * 2;
        let cur = self.get_array_i64(Some("game_data"), "meyasu_data", byte_idx) as u8;
        let mask = !(0x03u8 << shift);
        let next = (cur & mask) | ((level.min(3)) << shift);
        self.set_array_i64(Some("game_data"), "meyasu_data", byte_idx, next as i64);
    }

    pub fn get_unread_letter(&self, slot: usize) -> (i64, i64, i64) {
        self.data
            .get("game_data")
            .and_then(|g| g.get("unread_letter"))
            .and_then(|v| v.as_array())
            .and_then(|arr| arr.get(slot))
            .map(|l| {
                let chara_id = l.get("chara_id").and_then(|v| v.as_i64()).unwrap_or(0);
                let title = l.get("title").and_then(|v| v.as_i64()).unwrap_or(0);
                let msg = l.get("msg").and_then(|v| v.as_i64()).unwrap_or(0);
                (chara_id, title, msg)
            })
            .unwrap_or((0, 0, 0))
    }

    pub fn clear_unread_inbox(&mut self) {
        if let Some(Value::Array(arr)) = self
            .data
            .get_mut("game_data")
            .and_then(|g| g.get_mut("unread_letter"))
        {
            for slot in arr.iter_mut() {
                if let Value::Object(obj) = slot {
                    obj.insert("chara_id".to_string(), Value::Number(0.into()));
                    obj.insert("title".to_string(), Value::Number(0.into()));
                    obj.insert("msg".to_string(), Value::Number(0.into()));
                }
            }
            self.dirty = true;
        }
        self.set_i64(Some("game_data"), "b_meyasu", 0);
    }

    pub fn set_all_meyasu_levels(&mut self, level: u8) {
        let level = level.min(3);
        let packed = level | (level << 2) | (level << 4) | (level << 6);
        for i in 0..32 {
            self.set_array_i64(Some("game_data"), "meyasu_data", i, packed as i64);
        }
    }

    pub fn count_meyasu_read_letters(&self) -> usize {
        (1..=125)
            .map(|id| self.get_meyasu_char_level(id) as usize)
            .sum()
    }

    pub fn set_yuzu_livestock(&mut self, food_index: usize, count: i64) {
        let max_val = if food_index == 6 { 4 } else { 3 };
        let clamped = count.clamp(0, max_val);
        self.set_array_i64(Some("game_data"), "food_num", food_index, clamped);
        self.sync_yuzu_pasture_flags();
    }

    pub fn max_yuzu_pasture(&mut self) {
        self.set_array_i64(Some("game_data"), "food_num", 4, 3);
        self.set_array_i64(Some("game_data"), "food_num", 5, 3);
        self.set_array_i64(Some("game_data"), "food_num", 6, 4);
        self.set_array_i64(Some("game_data"), "food_num", 7, 3);
        self.sync_yuzu_pasture_flags();
    }

    fn sync_yuzu_pasture_flags(&mut self) {
        let chicks = self.get_array_i64(Some("game_data"), "food_num", 4).clamp(0, 3);
        let pigs = self.get_array_i64(Some("game_data"), "food_num", 5).clamp(0, 3);
        let sheep = self.get_array_i64(Some("game_data"), "food_num", 6).clamp(0, 4);
        let cattle = self.get_array_i64(Some("game_data"), "food_num", 7).clamp(0, 3);

        // hon_flag[31]: preserve bits 0..3, update bits 4..7 (Chick 1..3, Pig 1)
        let mut f31 = (self.get_array_i64(Some("game_data"), "hon_flag", 31) as u8) & 0x0F;
        if chicks >= 1 { f31 |= 0x10; }
        if chicks >= 2 { f31 |= 0x20; }
        if chicks >= 3 { f31 |= 0x40; }
        if pigs >= 1 { f31 |= 0x80; }
        self.set_array_i64(Some("game_data"), "hon_flag", 31, f31 as i64);

        // hon_flag[32]: Pig 2..3, Sheep 1..4, Cattle 1..2
        let mut f32 = 0u8;
        if pigs >= 2 { f32 |= 0x01; }
        if pigs >= 3 { f32 |= 0x02; }
        if sheep >= 1 { f32 |= 0x04; }
        if sheep >= 2 { f32 |= 0x08; }
        if sheep >= 3 { f32 |= 0x10; }
        if sheep >= 4 { f32 |= 0x20; }
        if cattle >= 1 { f32 |= 0x40; }
        if cattle >= 2 { f32 |= 0x80; }
        self.set_array_i64(Some("game_data"), "hon_flag", 32, f32 as i64);

        // hon_flag[33]: preserve bits 1..7, update bit 0 (Cattle 3)
        let mut f33 = (self.get_array_i64(Some("game_data"), "hon_flag", 33) as u8) & !0x01;
        if cattle >= 3 { f33 |= 0x01; }
        self.set_array_i64(Some("game_data"), "hon_flag", 33, f33 as i64);
    }

    pub fn count_unread_inbox(&self) -> usize {
        self.data
            .get("game_data")
            .and_then(|g| g.get("unread_letter"))
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter(|l| {
                        l.get("chara_id").and_then(|v| v.as_i64()).unwrap_or(0) > 0
                            || l.get("title").and_then(|v| v.as_i64()).unwrap_or(0) > 0
                            || l.get("msg").and_then(|v| v.as_i64()).unwrap_or(0) > 0
                    })
                    .count()
            })
            .unwrap_or(0)
    }

    // ---- Inventory (party_data.party_item / game_data.base_item) ----

    pub fn get_inventory_items(&self, section: &str, key: &str) -> Vec<(usize, i64, i64)> {
        self.data
            .get(section)
            .and_then(|s| s.get(key))
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .enumerate()
                    .map(|(idx, entry)| {
                        let item_no = entry.get("item_no").and_then(|v| v.as_i64()).unwrap_or(0);
                        let use_cnt = entry.get("use_cnt").and_then(|v| v.as_i64()).unwrap_or(0);
                        (idx, item_no, use_cnt)
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn set_inventory_field(
        &mut self,
        section: &str,
        key: &str,
        slot: usize,
        field: &str,
        value: i64,
    ) {
        if let Some(Value::Object(entry)) = self
            .data
            .get_mut(section)
            .and_then(|s| s.get_mut(key))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(slot))
        {
            entry.insert(field.to_string(), Value::Number(value.into()));
            self.dirty = true;
        }
    }

    pub fn clear_inventory_slot(&mut self, section: &str, key: &str, slot: usize) {
        if let Some(Value::Object(entry)) = self
            .data
            .get_mut(section)
            .and_then(|s| s.get_mut(key))
            .and_then(|v| v.as_array_mut())
            .and_then(|arr| arr.get_mut(slot))
        {
            entry.insert("item_no".to_string(), Value::Number(0.into()));
            entry.insert("use_cnt".to_string(), Value::Number(0.into()));
            self.dirty = true;
        }
    }

    // ---- Quick summary metrics for sidebar & stub previews ----

    pub fn recruited_count(&self) -> usize {
        self.data
            .get("chara_flag")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .take(125)
                    .filter(|v| matches!(v.as_i64().unwrap_or(0), 70 | 71 | 86))
                    .count()
            })
            .unwrap_or(0)
    }

    pub fn battle_character_count(&self) -> usize {
        self.data
            .get("chara_data")
            .and_then(|c| c.get("c_varia_dat"))
            .and_then(|v| v.as_array())
            .map(|arr| arr.len())
            .unwrap_or(0)
    }

    pub fn party_item_count(&self) -> usize {
        self.data
            .get("party_data")
            .and_then(|p| p.get("party_item"))
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter(|item| item.get("item_no").and_then(|v| v.as_i64()).unwrap_or(0) > 0)
                    .count()
            })
            .unwrap_or(0)
    }

    pub fn warehouse_item_count(&self) -> usize {
        self.data
            .get("game_data")
            .and_then(|g| g.get("base_item"))
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter(|item| item.get("item_no").and_then(|v| v.as_i64()).unwrap_or(0) > 0)
                    .count()
            })
            .unwrap_or(0)
    }
}

/// Non-blocking native Open File dialog starting in the previous directory (if any).
pub async fn pick_open_file_async(last_dir: Option<PathBuf>) -> Option<PathBuf> {
    let mut dialog = rfd::AsyncFileDialog::new()
        .add_filter("Suikoden II Save File (*.json)", &["json"])
        .add_filter("All Files (*.*)", &["*"]);

    if let Some(dir) = last_dir {
        if dir.exists() {
            dialog = dialog.set_directory(dir);
        }
    }

    dialog.pick_file().await.map(|h| h.path().to_path_buf())
}

/// Non-blocking native Save As dialog opening directly in the exact source directory.
pub async fn pick_save_as_file_async(suggested_name: String, source_path: PathBuf) -> Option<PathBuf> {
    let mut dialog = rfd::AsyncFileDialog::new()
        .set_file_name(suggested_name)
        .add_filter("Suikoden II Save File (*.json)", &["json"])
        .add_filter("All Files (*.*)", &["*"]);

    if let Some(parent) = source_path.parent() {
        if parent.exists() {
            dialog = dialog.set_directory(parent);
        }
    }

    dialog.save_file().await.map(|h| h.path().to_path_buf())
}
