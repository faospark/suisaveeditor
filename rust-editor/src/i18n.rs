use std::collections::HashMap;
use std::sync::atomic::{AtomicU8, Ordering};
use std::sync::OnceLock;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum AppLanguage {
    En,
    Ja,
    De,
    Es,
    Fr,
    It,
    ZhHans,
    ZhHant,
    Id,
}

impl AppLanguage {
    pub const ALL: &'static [AppLanguage] = &[
        AppLanguage::En,
        AppLanguage::Ja,
        AppLanguage::De,
        AppLanguage::Es,
        AppLanguage::Fr,
        AppLanguage::It,
        AppLanguage::ZhHans,
        AppLanguage::ZhHant,
        AppLanguage::Id,
    ];

    pub fn key(self) -> &'static str {
        match self {
            AppLanguage::En => "en",
            AppLanguage::Ja => "ja",
            AppLanguage::De => "de",
            AppLanguage::Es => "es",
            AppLanguage::Fr => "fr",
            AppLanguage::It => "it",
            AppLanguage::ZhHans => "zh-hans",
            AppLanguage::ZhHant => "zh-hant",
            AppLanguage::Id => "id",
        }
    }

    pub fn from_key(s: &str) -> Self {
        match s.trim().to_ascii_lowercase().as_str() {
            "ja" | "jp" => AppLanguage::Ja,
            "de" => AppLanguage::De,
            "es" => AppLanguage::Es,
            "fr" => AppLanguage::Fr,
            "it" => AppLanguage::It,
            "zh-hans" | "zh_cn" | "zh-cn" => AppLanguage::ZhHans,
            "zh-hant" | "zh_tw" | "zh-tw" => AppLanguage::ZhHant,
            "id" | "id-id" | "id_id" | "in" | "bahasa" => AppLanguage::Id,
            _ => AppLanguage::En,
        }
    }

    pub fn native_name(self) -> &'static str {
        match self {
            AppLanguage::En => "English",
            AppLanguage::Ja => "日本語",
            AppLanguage::De => "Deutsch",
            AppLanguage::Es => "Español",
            AppLanguage::Fr => "Français",
            AppLanguage::It => "Italiano",
            AppLanguage::ZhHans => "简体中文",
            AppLanguage::ZhHant => "繁體中文",
            AppLanguage::Id => "Bahasa Indonesia",
        }
    }

    pub fn english_name(self) -> &'static str {
        match self {
            AppLanguage::En => "English",
            AppLanguage::Ja => "Japanese",
            AppLanguage::De => "German",
            AppLanguage::Es => "Spanish",
            AppLanguage::Fr => "French",
            AppLanguage::It => "Italian",
            AppLanguage::ZhHans => "Chinese (Simplified)",
            AppLanguage::ZhHant => "Chinese (Traditional)",
            AppLanguage::Id => "Indonesian",
        }
    }

    pub fn to_u8(self) -> u8 {
        match self {
            AppLanguage::En => 0,
            AppLanguage::Ja => 1,
            AppLanguage::De => 2,
            AppLanguage::Es => 3,
            AppLanguage::Fr => 4,
            AppLanguage::It => 5,
            AppLanguage::ZhHans => 6,
            AppLanguage::ZhHant => 7,
            AppLanguage::Id => 8,
        }
    }

    pub fn from_u8(v: u8) -> Self {
        match v {
            1 => AppLanguage::Ja,
            2 => AppLanguage::De,
            3 => AppLanguage::Es,
            4 => AppLanguage::Fr,
            5 => AppLanguage::It,
            6 => AppLanguage::ZhHans,
            7 => AppLanguage::ZhHant,
            8 => AppLanguage::Id,
            _ => AppLanguage::En,
        }
    }
}

static CURRENT_LANG: AtomicU8 = AtomicU8::new(0);

pub fn set_language(lang: AppLanguage) {
    CURRENT_LANG.store(lang.to_u8(), Ordering::Relaxed);
}

pub fn current_language() -> AppLanguage {
    AppLanguage::from_u8(CURRENT_LANG.load(Ordering::Relaxed))
}

// ============================================================================
// Official HD Remaster Game Data Localization (embedded JSON, parsed once)
// ============================================================================

const I18N_GAMEDATA_JSON: &str = include_str!("data/i18n_gamedata.json");

#[derive(Default)]
struct LocaleGameData {
    chars: HashMap<i64, String>,
    items: HashMap<i64, String>,
    farm: HashMap<i64, String>,
    trade: HashMap<i64, String>,
    base: HashMap<i64, String>,
    gear: HashMap<i64, String>,
    runes: HashMap<i64, String>,
    food: HashMap<i64, String>,
}

fn parse_id_map(lang_obj: &serde_json::Value, key: &str) -> HashMap<i64, String> {
    let mut out = HashMap::new();
    if let Some(map) = lang_obj.get(key).and_then(|v| v.as_object()) {
        for (k, v) in map {
            if let (Ok(id), Some(s)) = (k.parse::<i64>(), v.as_str()) {
                out.insert(id, s.to_string());
            }
        }
    }
    out
}

fn parse_locale(root: &serde_json::Value, lang_key: &str) -> LocaleGameData {
    let Some(obj) = root.get(lang_key) else {
        return LocaleGameData::default();
    };
    LocaleGameData {
        chars: parse_id_map(obj, "chars"),
        items: parse_id_map(obj, "items"),
        farm: parse_id_map(obj, "farm"),
        trade: parse_id_map(obj, "trade"),
        base: parse_id_map(obj, "base"),
        gear: parse_id_map(obj, "gear"),
        runes: parse_id_map(obj, "runes"),
        food: parse_id_map(obj, "food"),
    }
}

struct ParsedGameDataLocales {
    ja: LocaleGameData,
    de: LocaleGameData,
    es: LocaleGameData,
    fr: LocaleGameData,
    it: LocaleGameData,
    zh_hans: LocaleGameData,
    zh_hant: LocaleGameData,
    id: LocaleGameData,
}

static GAMEDATA_LOCALES: OnceLock<ParsedGameDataLocales> = OnceLock::new();

fn locales() -> &'static ParsedGameDataLocales {
    GAMEDATA_LOCALES.get_or_init(|| {
        let root: serde_json::Value =
            serde_json::from_str(I18N_GAMEDATA_JSON).unwrap_or(serde_json::Value::Null);
        ParsedGameDataLocales {
            ja: parse_locale(&root, "ja"),
            de: parse_locale(&root, "de"),
            es: parse_locale(&root, "es"),
            fr: parse_locale(&root, "fr"),
            it: parse_locale(&root, "it"),
            zh_hans: parse_locale(&root, "zh-hans"),
            zh_hant: parse_locale(&root, "zh-hant"),
            id: parse_locale(&root, "id"),
        }
    })
}

fn current_locale_gamedata() -> Option<&'static LocaleGameData> {
    let l = locales();
    match current_language() {
        AppLanguage::En => None,
        AppLanguage::Ja => Some(&l.ja),
        AppLanguage::De => Some(&l.de),
        AppLanguage::Es => Some(&l.es),
        AppLanguage::Fr => Some(&l.fr),
        AppLanguage::It => Some(&l.it),
        AppLanguage::ZhHans => Some(&l.zh_hans),
        AppLanguage::ZhHant => Some(&l.zh_hant),
        AppLanguage::Id => Some(&l.id),
    }
}

pub fn localized_char(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.chars.get(&id).map(String::as_str)
}

pub fn localized_item(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.items.get(&id).map(String::as_str)
}

pub fn localized_farm(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.farm.get(&id).map(String::as_str)
}

pub fn localized_trade(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.trade.get(&id).map(String::as_str)
}

pub fn localized_base(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.base.get(&id).map(String::as_str)
}

pub fn localized_gear(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.gear.get(&id).map(String::as_str)
}

pub fn localized_rune(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.runes.get(&id).map(String::as_str)
}

pub fn localized_food(id: i64) -> Option<&'static str> {
    current_locale_gamedata()?.food.get(&id).map(String::as_str)
}

// ============================================================================
// App UI Translations (all 9 languages)
// ============================================================================

/// Pick a string for the active language: `[en, ja, de, es, fr, it, zh-hans, zh-hant, id]`.
#[inline]
pub fn pick(vals: [&'static str; 9]) -> &'static str {
    vals[current_language().to_u8() as usize]
}

pub fn tr(key: &str) -> &'static str {
    match key {
        // Sidebar & Tabs
        "editors" => pick(["EDITORS", "エディタ", "EDITOREN", "EDITORES", "ÉDITEURS", "EDITOR", "编辑器", "編輯器", "EDITOR"]),
        "tools" => pick(["TOOLS", "ツール", "WERKZEUGE", "HERRAMIENTAS", "OUTILS", "STRUMENTI", "工具", "工具", "ALAT"]),
        "tab_saves" => pick(["Saves", "セーブ一覧", "Spielstände", "Partidas", "Sauvegardes", "Salvataggi", "存档列表", "存檔列表", "Simpanan"]),
        "tab_general" => pick(["General", "全般", "Allgemein", "General", "Général", "Generale", "常规", "一般", "Umum"]),
        "tab_battle_chars" => pick(["Combatants", "戦闘メンバー", "Kämpfer", "Combatientes", "Combattants", "Combattenti", "战斗角色", "戰鬥角色", "Petarung"]),
        "tab_recruited" => pick(["Recruits", "仲間", "Rekruten", "Reclutados", "Recrues", "Reclute", "已招募", "已招募", "Rekrutan"]),
        "tab_party_bag" => pick(["Party Bag", "持ち物", "Inventar", "Mochila", "Sac d'équipe", "Borsa gruppo", "队伍背包", "隊伍背包", "Tas Party"]),
        "tab_warehouse" => pick(["Warehouse", "倉庫", "Lagerhaus", "Almacén", "Entrepôt", "Magazzino", "仓库", "倉庫", "Gudang"]),
        "tab_cooking" => pick(["Cooking", "料理", "Kochen", "Cocina", "Cuisine", "Cucina", "料理", "料理", "Memasak"]),
        "tab_investigations" => pick(["Investigations", "探偵調査", "Ermittlungen", "Investigaciones", "Enquêtes", "Indagini", "侦探调查", "偵探調查", "Investigasi"]),
        "tab_castle" => pick(["Castle", "本拠地", "Burg", "Castillo", "Château", "Castello", "本据地", "本據地", "Kastil"]),
        "tab_experimental" => pick(["Experimental", "実験的", "Experimentell", "Experimental", "Expérimental", "Sperimentale", "实验功能", "實驗功能", "Eksperimental"]),
        "tab_data_values" => pick(["Data Values", "データ一覧", "Datenwerte", "Valores de datos", "Données", "Valori dati", "数据表", "資料表", "Nilai Data"]),
        "tab_settings" => pick(["Settings", "設定", "Einstellungen", "Ajustes", "Paramètres", "Impostazioni", "设置", "設定", "Pengaturan"]),
        "tab_changelog" => pick(["Changelog", "更新履歴", "Änderungsprotokoll", "Historial", "Journal", "Cronologia", "更新日志", "更新日誌", "Catatan Perubahan"]),
        "tab_about" => pick(["About", "このアプリについて", "Über", "Acerca de", "À propos", "Info", "关于", "關於", "Tentang"]),

        // Top bar & file actions
        "no_file_loaded" => pick(["No file loaded", "ファイル未読み込み", "Keine Datei geladen", "Sin archivo cargado", "Aucun fichier chargé", "Nessun file caricato", "未加载文件", "未載入檔案", "Belum ada file dimuat"]),
        "unsaved_changes" => pick(["Unsaved changes", "未保存の変更", "Ungespeicherte Änderungen", "Cambios sin guardar", "Modifications non enregistrées", "Modifiche non salvate", "未保存的更改", "未儲存的變更", "Perubahan belum disimpan"]),
        "open_save" => pick(["Open Save...", "セーブを開く...", "Spielstand öffnen...", "Abrir partida...", "Ouvrir...", "Apri salvataggio...", "打开存档...", "開啟存檔...", "Buka Simpanan..."]),
        "save" => pick(["Save", "保存", "Speichern", "Guardar", "Enregistrer", "Salva", "保存", "儲存", "Simpan"]),
        "save_as" => pick(["Save As...", "名前を付けて保存...", "Speichern unter...", "Guardar como...", "Enregistrer sous...", "Salva con nome...", "另存为...", "另存新檔...", "Simpan Sebagai..."]),
        "debug_save" => pick(["DEBUG SAVE", "デバッグセーブ", "DEBUG-SPIELSTAND", "GUARDADO DEBUG", "SAUVEGARDE DEBUG", "SALVATAGGIO DEBUG", "调试存档", "除錯存檔", "SIMPANAN DEBUG"]),
        "single_file_mode" => pick(["SINGLE FILE MODE", "単一ファイルモード", "EINZELDATEI-MODUS", "MODO ARCHIVO ÚNICO", "MODE FICHIER UNIQUE", "MODALITÀ FILE SINGOLO", "单文件模式", "單一檔案模式", "MODE FILE TUNGGAL"]),

        // Empty state
        "welcome_title" => pick([
            "Welcome to Bright Shield Save Editor",
            "Bright Shield Save Editor へようこそ",
            "Willkommen bei Bright Shield Save Editor",
            "Bienvenido a Bright Shield Save Editor",
            "Bienvenue dans Bright Shield Save Editor",
            "Benvenuto in Bright Shield Save Editor",
            "欢迎使用 Bright Shield Save Editor",
            "歡迎使用 Bright Shield Save Editor",
            "Selamat Datang di Bright Shield Save Editor",
        ]),
        "welcome_desc" => pick([
            "Load a Suikoden II HD Remaster JSON save file to begin editing.\nA silent .bak backup will be created automatically in the same folder.",
            "幻想水滸伝II HDリマスターのJSONセーブファイルを読み込んで編集を開始します。\n同じフォルダに .bak バックアップが自動的に作成されます。",
            "Lade eine Suikoden II HD Remaster JSON-Spielstanddatei zum Bearbeiten.\nEine .bak-Sicherung wird automatisch im selben Ordner erstellt.",
            "Carga un archivo JSON de Suikoden II HD Remaster para empezar a editar.\nSe creará automáticamente una copia .bak en la misma carpeta.",
            "Chargez une sauvegarde JSON de Suikoden II HD Remaster pour commencer.\nUne sauvegarde .bak sera créée automatiquement dans le même dossier.",
            "Carica un file di salvataggio JSON di Suikoden II HD Remaster per iniziare.\nVerrà creato automaticamente un backup .bak nella stessa cartella.",
            "加载《幻想水浒传II HD复刻版》JSON 存档文件以开始编辑。\n系统将在同一文件夹中自动静默创建 .bak 备份。",
            "載入《幻想水滸傳II HD復刻版》JSON 存檔檔案以開始編輯。\n系統將在同一資料夾中自動靜默建立 .bak 備份。",
            "Muat file simpanan JSON Suikoden II HD Remaster untuk mulai mengedit.\nCadangan .bak akan dibuat otomatis secara diam-diam di folder yang sama.",
        ]),
        "open_save_file" => pick(["Open Save File...", "セーブファイルを開く...", "Spielstanddatei öffnen...", "Abrir archivo...", "Ouvrir un fichier...", "Apri file di salvataggio...", "打开存档文件...", "開啟存檔檔案...", "Buka File Simpanan..."]),

        // Settings
        "settings_desc" => pick([
            "Customize language, base surface, accent theme colors, and inspect game, BepInEx, and SuikodenFix detection.",
            "言語・ベース背景・アクセントカラーの設定と、ゲーム・BepInEx・SuikodenFixの検出状況を確認できます。",
            "Sprache, Hintergrund, Akzentfarben anpassen sowie Spiel-, BepInEx- und SuikodenFix-Erkennung prüfen.",
            "Personaliza el idioma, el fondo, los colores de acento y comprueba la detección del juego, BepInEx y SuikodenFix.",
            "Personnalisez la langue, l'arrière-plan, les couleurs d'accentuation et vérifiez la détection du jeu, BepInEx et SuikodenFix.",
            "Personalizza lingua, sfondo, colori d'accento e verifica il rilevamento di gioco, BepInEx e SuikodenFix.",
            "自定义语言、背景主题、强调色，并检查游戏、BepInEx 和 SuikodenFix 检测状态。",
            "自訂語言、背景主題、強調色，並檢查遊戲、BepInEx 與 SuikodenFix 偵測狀態。",
            "Sesuaikan bahasa, latar belakang, warna aksen tema, serta periksa deteksi game, BepInEx, dan SuikodenFix.",
        ]),
        "language_title" => pick(["Language", "言語", "Sprache", "Idioma", "Langue", "Lingua", "语言", "語言", "Bahasa"]),
        "language_desc" => pick([
            "Choose the display language for the interface and official Suikoden II HD Remaster character, item, gear, rune, and dish names.",
            "インターフェースおよび幻想水滸伝II HDリマスター公式のキャラクター・アイテム・装備・紋章・料理名の表示言語を選択します。",
            "Wähle die Anzeigesprache für die Oberfläche sowie offizielle Namen von Charakteren, Gegenständen, Ausrüstung, Runen und Gerichten.",
            "Elige el idioma de la interfaz y los nombres oficiales de personajes, objetos, equipo, runas y platos de Suikoden II HD Remaster.",
            "Choisissez la langue de l'interface et des noms officiels des personnages, objets, équipements, runes et plats.",
            "Scegli la lingua dell'interfaccia e dei nomi ufficiali di personaggi, oggetti, equipaggiamento, rune e piatti.",
            "选择界面显示语言以及《幻想水浒传II HD复刻版》官方角色、道具、装备、纹章与料理名称。",
            "選擇介面顯示語言以及《幻想水滸傳II HD復刻版》官方角色、道具、裝備、紋章與料理名稱。",
            "Pilih bahasa tampilan untuk antarmuka serta nama karakter, item, perlengkapan, rune, dan hidangan resmi Suikoden II HD Remaster.",
        ]),
        "base_bg_title" => pick(["Base Background", "ベース背景", "Hintergrund", "Fondo base", "Arrière-plan", "Sfondo base", "基础背景", "基礎背景", "Latar Belakang Dasar"]),
        "base_bg_desc" => pick([
            "Choose the base surface palette (Dark Navy, High Contrast Black, Dark Gray, Dark Green, Dark Purple, or Dark Red).",
            "ベースとなる背景パレットを選択します（ダークネイビー、ハイコントラストブラック、ダークグレー、ダークグリーン、ダークパープル）。",
            "Wähle die Hintergrundpalette (Dunkelblau, Kontrastreiches Schwarz, Dunkelgrau, Dunkelgrün oder Dunkellila).",
            "Elige la paleta de fondo (Azul oscuro, Negro alto contraste, Gris oscuro, Verde oscuro o Morado oscuro).",
            "Choisissez la palette d'arrière-plan (Bleu marine, Noir contraste élevé, Gris foncé, Vert foncé ou Violet foncé).",
            "Scegli la tavolozza di sfondo (Blu scuro, Nero alto contrasto, Grigio scuro, Verde scuro o Viola scuro).",
            "选择基础背景色板（深海蓝、高对比度纯黑、深灰、深绿或深紫）。",
            "選擇基礎背景色板（深海藍、高對比度純黑、深灰、深綠或深紫）。",
            "Pilih palet permukaan dasar (Biru Tua, Hitam Kontras Tinggi, Abu-abu Gelap, Hijau Gelap, Ungu Gelap, atau Merah Gelap).",
        ]),
        "accent_title" => pick(["Theme Accent Color", "アクセントカラー", "Akzentfarbe", "Color de acento", "Couleur d'accentuation", "Colore d'accento", "主题强调色", "主題強調色", "Warna Aksen Tema"]),
        "accent_desc" => pick([
            "Choose the primary highlight color used for buttons, active tabs, borders, and focus indicators.",
            "ボタン、選択中タブ、枠線、フォーカス表示に使われるメインカラーを選択します。",
            "Wähle die Hauptakzentfarbe für Schaltflächen, aktive Tabs, Rahmen und Fokusmarkierungen.",
            "Elige el color principal para botones, pestañas activas, bordes e indicadores de enfoque.",
            "Choisissez la couleur principale pour les boutons, onglets actifs, bordures et indicateurs.",
            "Scegli il colore principale per pulsanti, schede attive, bordi e indicatori di focus.",
            "选择按钮、当前标签页、边框和焦点指示器的主要强调色。",
            "選擇按鈕、目前分頁、邊框與焦點指示器的主要強調色。",
            "Pilih warna sorotan utama untuk tombol, tab aktif, bingkai, dan indikator fokus.",
        ]),
        "game_env_title" => pick(["Game & Mod Environment", "ゲーム・Mod 環境", "Spiel- & Mod-Umgebung", "Entorno del juego y mods", "Environnement jeu & mods", "Ambiente gioco e mod", "游戏与 Mod 环境", "遊戲與 Mod 環境", "Lingkungan Game & Mod"]),
        "game_location" => pick(["Game Location", "ゲームフォルダ", "Spielverzeichnis", "Ubicación del juego", "Dossier du jeu", "Percorso del gioco", "游戏目录", "遊戲目錄", "Lokasi Game"]),
        "redetect" => pick(["Re-detect", "再検出", "Neu erkennen", "Redetectar", "Redétecter", "Rileva di nuovo", "重新检测", "重新偵測", "Deteksi Ulang"]),
        "browse_game_folder" => pick(["Browse Game Folder...", "ゲームフォルダを参照...", "Spielordner wählen...", "Buscar carpeta...", "Parcourir...", "Sfoglia cartella...", "浏览游戏目录...", "瀏覽遊戲目錄...", "Pilih Folder Game..."]),
        "reset_auto_detect" => pick(["Reset to Auto-Detect", "自動検出に戻す", "Auf Automatik zurücksetzen", "Restablecer autodetección", "Réinitialiser auto-détection", "Ripristina rilevamento auto", "重置为自动检测", "重設為自動偵測", "Reset ke Deteksi Otomatis"]),
        "app_info_title" => pick(["Application Info", "アプリ情報", "Anwendungsinfo", "Información de la aplicación", "Informations", "Informazioni app", "应用信息", "應用資訊", "Info Aplikasi"]),
        "version_label" => pick(["Version:", "バージョン:", "Version:", "Versión:", "Version :", "Versione:", "版本:", "版本:", "Versi:"]),
        "settings_file_label" => pick(["Settings File:", "設定ファイル:", "Einstellungsdatei:", "Archivo de ajustes:", "Fichier de config :", "File impostazioni:", "配置文件:", "設定檔:", "File Pengaturan:"]),
        "active" => pick(["Active", "適用中", "Aktiv", "Activo", "Actif", "Attivo", "当前使用", "目前使用", "Aktif"]),
        "select" => pick(["Select", "選択", "Auswählen", "Seleccionar", "Sélectionner", "Seleziona", "选择", "選擇", "Pilih"]),
        "installed" => pick(["Installed", "導入済み", "Installiert", "Instalado", "Installé", "Installato", "已安装", "已安裝", "Terpasang"]),
        "not_installed" => pick(["Not Installed", "未導入", "Nicht installiert", "No instalado", "Non installé", "Non installato", "未安装", "未安裝", "Belum Terpasang"]),
        "missing" => pick(["Missing", "未検出", "Fehlt", "Falta", "Manquant", "Mancante", "缺失", "缺失", "Hilang"]),
        "found" => pick(["Found", "検出済み", "Gefunden", "Encontrado", "Trouvé", "Trovato", "已找到", "已找到", "Ditemukan"]),
        "not_found" => pick(["Not Found", "未検出", "Nicht gefunden", "No encontrado", "Introuvable", "Non trovato", "未找到", "未找到", "Tidak Ditemukan"]),
        "enabled" => pick(["Enabled", "有効", "Aktiviert", "Activado", "Activé", "Abilitato", "已启用", "已啟用", "Aktif"]),
        "disabled" => pick(["Disabled", "無効", "Deaktiviert", "Desactivado", "Désactivé", "Disabilitato", "已禁用", "已停用", "Nonaktif"]),
        "manual_path" => pick(["Manual Path", "手動指定", "Manueller Pfad", "Ruta manual", "Chemin manuel", "Percorso manuale", "手动路径", "手動路徑", "Jalur Manual"]),
        "auto_detected" => pick(["Auto-Detected", "自動検出", "Automatisch erkannt", "Autodetectado", "Auto-détecté", "Rilevato auto", "自动检测", "自動偵測", "Deteksi Otomatis"]),
        "required" => pick(["REQUIRED", "必須", "ERFORDERLICH", "REQUERIDO", "REQUIS", "RICHIESTO", "必需", "必需", "WAJIB"]),
        "env_req_title" => pick(["BepInEx & SuikodenFix Required", "BepInEx と SuikodenFix が必要です", "BepInEx & SuikodenFix erforderlich", "Se requiere BepInEx y SuikodenFix", "BepInEx et SuikodenFix requis", "BepInEx e SuikodenFix richiesti", "需要 BepInEx 与 SuikodenFix", "需要 BepInEx 與 SuikodenFix", "BepInEx & SuikodenFix Diperlukan"]),
        "game_folder" => pick(["Game Folder:", "ゲームフォルダ:", "Spielordner:", "Carpeta del juego:", "Dossier du jeu :", "Cartella gioco:", "游戏目录:", "遊戲目錄:", "Folder Game:"]),
        "recheck" => pick(["Re-check", "再確認", "Neu prüfen", "Comprobar", "Revérifier", "Ricontrolla", "重新检查", "重新檢查", "Periksa Ulang"]),

        // Saves browser
        "saves_title" => pick(["Suikoden II Decrypted Saves", "幻想水滸伝II 復号セーブ一覧", "Suikoden II Entschlüsselte Spielstände", "Partidas descifradas de Suikoden II", "Sauvegardes déchiffrées Suikoden II", "Salvataggi decifrati Suikoden II", "幻想水浒传II 解密存档", "幻想水滸傳II 解密存檔", "Simpanan Terdekripsi Suikoden II"]),
        "found_suffix" => pick(["Found", "件", "Gefunden", "Encontradas", "Trouvées", "Trovati", "个存档", "個存檔", "Ditemukan"]),
        "refresh" => pick(["Refresh", "更新", "Aktualisieren", "Actualizar", "Actualiser", "Aggiorna", "刷新", "重新整理", "Segarkan"]),
        "open_single_file" => pick(["Open Single File...", "単一ファイルを開く...", "Einzeldatei öffnen...", "Abrir archivo...", "Ouvrir un fichier...", "Apri file singolo...", "打开单个文件...", "開啟單一檔案...", "Buka File Tunggal..."]),
        "search_saves_placeholder" => pick(["Search by filename, slot #, hero, or castle...", "ファイル名・スロット番号・主人公・本拠地名で検索...", "Nach Dateiname, Slot #, Held oder Burg suchen...", "Buscar por archivo, ranura, héroe o castillo...", "Rechercher par fichier, slot, héros ou château...", "Cerca per file, slot, eroe o castello...", "按文件名、槽位号、主角或城名搜索...", "按檔名、槽位號、主角或城名搜尋...", "Cari berdasarkan nama file, # slot, pahlawan, atau kastil..."]),
        "sort" => pick(["Sort:", "並び替え:", "Sortieren:", "Ordenar:", "Trier :", "Ordina:", "排序:", "排序:", "Urutkan:"]),
        "most_recent" => pick(["Most Recent", "更新日時順", "Neueste", "Más reciente", "Plus récent", "Più recenti", "最近修改", "最近修改", "Terbaru"]),
        "slot_num" => pick(["Slot #", "スロット順", "Slot #", "Ranura #", "Slot #", "Slot #", "槽位号", "槽位號", "Slot #"]),
        "loaded_badge" => pick(["LOADED", "読込中", "GELADEN", "CARGADO", "CHARGÉ", "CARICATO", "已加载", "已載入", "DIMUAT"]),
        "time_label" => pick(["Time", "プレイ時間", "Zeit", "Tiempo", "Temps", "Tempo", "时间", "時間", "Waktu"]),
        "potch_label" => pick(["Potch", "ポッチ", "Potch", "Potch", "Potch", "Potch", "波奇", "波奇", "Potch"]),
        "stars_label" => pick(["Stars", "宿星", "Sterne", "Estrellas", "Étoiles", "Stelle", "宿星", "宿星", "Bintang"]),
        "create_snapshot" => pick(["Full Snapshot (.zip)", "全セーブZIPバックアップ", "Voll-Snapshot (.zip)", "Copia completa (.zip)", "Snapshot complet (.zip)", "Snapshot completo (.zip)", "全存档快照 (.zip)", "全存檔快照 (.zip)", "Snapshot Penuh (.zip)"]),
        "snapshots_title" => pick(["Full Backup Snapshots (.zip)", "全セーブ スナップショット (.zip)", "Vollständige Snapshots (.zip)", "Copias completas (.zip)", "Snapshots complets (.zip)", "Snapshot completi (.zip)", "完整备份快照 (.zip)", "完整備份快照 (.zip)", "Snapshot Cadangan Penuh (.zip)"]),
        "restore_bak" => pick(["Restore .bak", ".bakを復元", ".bak wiederherstellen", "Restaurar .bak", "Restaurer .bak", "Ripristina .bak", "恢复 .bak", "還原 .bak", "Pulihkan .bak"]),
        "restore_all" => pick(["Restore All", "すべて復元", "Alle wiederherstellen", "Restaurar todo", "Tout restaurer", "Ripristina tutto", "全部恢复", "全部還原", "Pulihkan Semua"]),
        "dismiss" => pick(["Dismiss", "閉じる", "Schließen", "Ocultar", "Fermer", "Chiudi", "知道了", "知道了", "Tutup"]),

        // Inventory & Modal
        "all" => pick(["All", "すべて", "Alle", "Todo", "Tout", "Tutti", "全部", "全部", "Semua"]),
        "close" => pick(["Close", "閉じる", "Schließen", "Cerrar", "Fermer", "Chiudi", "关闭", "關閉", "Tutup"]),
        "cancel" => pick(["Cancel", "キャンセル", "Abbrechen", "Cancelar", "Annuler", "Annulla", "取消", "取消", "Batal"]),
        "clear_slot_empty" => pick(["Clear Slot (Set Empty)", "スロットを空にする", "Slot leeren", "Vaciar ranura", "Vider l'emplacement", "Svuota slot", "清空槽位", "清空槽位", "Kosongkan Slot"]),
        "no_items_match" => pick(["No items match your search.", "一致するアイテムがありません。", "Keine passenden Gegenstände gefunden.", "No hay objetos que coincidan.", "Aucun objet correspondant.", "Nessun oggetto trovato.", "没有匹配的道具。", "沒有符合的道具。", "Tidak ada item yang cocok dengan pencarian Anda."]),
        "search_items_placeholder" => pick(["Search item by name or ID...", "アイテム名またはIDで検索...", "Gegenstand nach Name oder ID suchen...", "Buscar objeto por nombre o ID...", "Rechercher par nom ou ID...", "Cerca oggetto per nome o ID...", "按名称或 ID 搜索道具...", "按名稱或 ID 搜尋道具...", "Cari item berdasarkan nama atau ID..."]),
        "add_item_empty" => pick(["+ Add Item to Empty Slot", "+ 空きスロットに追加", "+ In leeren Slot einfügen", "+ Añadir a ranura vacía", "+ Ajouter à un slot vide", "+ Aggiungi a slot vuoto", "+ 添加到空槽位", "+ 新增至空槽位", "+ Tambah Item ke Slot Kosong"]),
        "add_item" => pick(["+ Add Item", "+ 追加", "+ Hinzufügen", "+ Añadir", "+ Ajouter", "+ Aggiungi", "+ 添加", "+ 新增", "+ Tambah Item"]),
        "change" => pick(["Change...", "変更...", "Ändern...", "Cambiar...", "Changer...", "Cambia...", "更改...", "變更...", "Ubah..."]),
        "copy" => pick(["Copy", "コピー", "Kopieren", "Copiar", "Copier", "Copia", "复制", "複製", "Salin"]),
        "paste" => pick(["Paste", "貼付", "Einfügen", "Pegar", "Coller", "Incolla", "粘贴", "貼上", "Tempel"]),
        "paste_to_empty" => pick(["+ Paste to Empty", "+ 空きに貼付", "+ In leeren Slot", "+ Pegar en vacío", "+ Coller (vide)", "+ Incolla (vuoto)", "+ 粘贴到空位", "+ 貼上至空位", "+ Tempel ke Kosong"]),
        "clear" => pick(["Clear", "消去", "Leeren", "Limpiar", "Vider", "Svuota", "清空", "清空", "Hapus"]),
        "empty_slot" => pick(["Empty Slot", "空きスロット", "Leerer Slot", "Ranura vacía", "Emplacement vide", "Slot vuoto", "空槽位", "空槽位", "Slot Kosong"]),
        "slot" => pick(["Slot", "枠", "Slot", "Ranura", "Slot", "Slot", "槽位", "槽位", "Slot"]),
        "item" => pick(["Item", "アイテム", "Gegenstand", "Objeto", "Objet", "Oggetto", "道具", "道具", "Item"]),
        "qty_type" => pick(["Qty / Type", "個数 / 種別", "Menge / Typ", "Cant. / Tipo", "Qté / Type", "Qtà / Tipo", "数量 / 类型", "數量 / 類型", "Jml / Tipe"]),
        "actions" => pick(["Actions", "操作", "Aktionen", "Acciones", "Actions", "Azioni", "操作", "操作", "Aksi"]),
        "occupied" => pick(["Occupied", "使用中", "Belegt", "Ocupados", "Occupés", "Occupati", "已占用", "已佔用", "Terisi"]),
        "slots" => pick(["slots", "枠", "Slots", "ranuras", "emplacements", "slot", "槽位", "槽位", "slot"]),
        "filter_slots_placeholder" => pick(["Filter slots by item name or slot #...", "アイテム名や枠番号で絞り込み...", "Slots nach Name oder # filtern...", "Filtrar ranuras por nombre o #...", "Filtrer par nom ou n° de slot...", "Filtra slot per nome o #...", "按名称或槽位号筛选...", "按名稱或槽位號篩選...", "Filter slot berdasarkan nama item atau # slot..."]),

        // Item Categories
        "cat_item" => pick(["Item (1–9)", "道具 (1–9)", "Gegenstand (1–9)", "Objeto (1–9)", "Objet (1–9)", "Oggetto (1–9)", "道具 (1–9)", "道具 (1–9)", "Item (1–9)"]),
        "cat_gear" => pick(["Gear (16)", "装備 (16)", "Ausrüstung (16)", "Equipo (16)", "Équipement (16)", "Equip. (16)", "装备 (16)", "裝備 (16)", "Perlengkapan (16)"]),
        "cat_rune" => pick(["Rune (32)", "紋章 (32)", "Rune (32)", "Runa (32)", "Rune (32)", "Runa (32)", "纹章 (32)", "紋章 (32)", "Rune (32)"]),
        "cat_farm" => pick(["Farm (48)", "農園 (48)", "Farm (48)", "Granja (48)", "Ferme (48)", "Fattoria (48)", "农场 (48)", "農場 (48)", "Kebun (48)"]),
        "cat_trade" => pick(["Trade (64)", "交易 (64)", "Handel (64)", "Comercio (64)", "Commerce (64)", "Commercio (64)", "交易 (64)", "交易 (64)", "Dagang (64)"]),
        "cat_base" => pick(["Base (80)", "本拠地 (80)", "Burg (80)", "Base (80)", "Base (80)", "Base (80)", "本据地 (80)", "本據地 (80)", "Markas (80)"]),
        "cat_food" => pick(["Food (96+)", "料理 (96+)", "Essen (96+)", "Comida (96+)", "Cuisine (96+)", "Cibo (96+)", "料理 (96+)", "料理 (96+)", "Makanan (96+)"]),

        // Short category badges
        "badge_empty" => pick(["Empty", "空", "Leer", "Vacío", "Vide", "Vuoto", "空", "空", "Kosong"]),
        "badge_item" => pick(["Item", "道具", "Item", "Objeto", "Objet", "Ogg.", "道具", "道具", "Item"]),
        "badge_gear" => pick(["Gear", "装備", "Ausr.", "Equipo", "Équip.", "Equip.", "装备", "裝備", "Gear"]),
        "badge_rune" => pick(["Rune", "紋章", "Rune", "Runa", "Rune", "Runa", "纹章", "紋章", "Rune"]),
        "badge_farm" => pick(["Farm", "農園", "Farm", "Granja", "Ferme", "Fatt.", "农场", "農場", "Kebun"]),
        "badge_trade" => pick(["Trade", "交易", "Handel", "Com.", "Comm.", "Comm.", "交易", "交易", "Dagang"]),
        "badge_base" => pick(["Base", "本拠", "Burg", "Base", "Base", "Base", "本据", "本據", "Markas"]),
        "badge_food" => pick(["Food", "料理", "Essen", "Comida", "Plat", "Cibo", "料理", "料理", "Makanan"]),
        "badge_other" => pick(["Other", "その他", "Sonst.", "Otro", "Autre", "Altro", "其他", "其他", "Lainnya"]),

        // Inventory headers
        "party_bag_title" => pick(["Party Bag Inventory", "パーティ持ち物", "Gruppen-Inventar", "Inventario del grupo", "Inventaire d'équipe", "Inventario gruppo", "队伍背包物品", "隊伍背包物品", "Inventaris Tas Party"]),
        "warehouse_title" => pick(["Barbara's Castle Warehouse Storage", "バーバラの倉庫", "Barbaras Burglager", "Almacén de Barbara", "Entrepôt de Barbara", "Magazzino di Barbara", "芭芭拉的本据地仓库", "芭芭拉的本據地倉庫", "Gudang Kastil Barbara"]),

        // General view
        "general_title" => pick(["General Save Overview", "セーブ全般", "Allgemeine Übersicht", "Resumen general", "Aperçu général", "Panoramica generale", "常规存档概览", "一般存檔概覽", "Ringkasan Simpanan Umum"]),
        "active_party" => pick(["Active Party & Convoy", "パーティメンバー＆同行者", "Aktive Gruppe & Begleiter", "Grupo activo y escolta", "Équipe active et convoi", "Gruppo attivo e scorta", "当前队伍与随行人员", "目前隊伍與隨行人員", "Party Aktif & Pengawal"]),
        "identity_names" => pick(["Identity & Names", "名前・基本情報", "Identität & Namen", "Identidad y nombres", "Identité et noms", "Identità e nomi", "名称与身份", "名稱與身分", "Identitas & Nama"]),
        "resources_castle" => pick(["Resources & Castle Status", "所持金・本拠地ステータス", "Ressourcen & Burgstatus", "Recursos y estado del castillo", "Ressources et château", "Risorse e stato castello", "资源与本据地状态", "資源與本據地狀態", "Sumber Daya & Status Kastil"]),
        "hero_name_s2" => pick(["Hero Name (S2)", "主人公名 (S2)", "Heldenname (S2)", "Nombre del héroe (S2)", "Nom du héros (S2)", "Nome eroe (S2)", "主角名称 (S2)", "主角名稱 (S2)", "Nama Pahlawan (S2)"]),
        "hero_name_real" => pick(["Hero Name (Real)", "主人公名 (本名)", "Heldenname (Echt)", "Nombre real", "Vrai nom du héros", "Nome reale eroe", "主角真名", "主角真名", "Nama Pahlawan (Asli)"]),
        "castle_name" => pick(["Castle Name", "本拠地名", "Burgname", "Nombre del castillo", "Nom du château", "Nome castello", "本据地名称", "本據地名稱", "Nama Kastil"]),
        "army_name" => pick(["Army Name", "解放軍名", "Armeename", "Nombre del ejército", "Nom de l'armée", "Nome esercito", "军队名称", "軍隊名稱", "Nama Pasukan"]),
        "potch_gold" => pick(["Potch (Gold)", "ポッチ (所持金)", "Potch (Gold)", "Potch (Oro)", "Potch (Or)", "Potch (Oro)", "波奇 (金钱)", "波奇 (金錢)", "Potch (Uang)"]),
        "escaped_battles" => pick(["Escaped Battles", "逃走回数", "Geflohene Kämpfe", "Batallas escapadas", "Combats fuis", "Battaglie fuggite", "逃跑次数", "逃跑次數", "Pertarungan Kabur"]),
        "castle_level" => pick(["Castle Level", "本拠地レベル", "Burgstufe", "Nivel del castillo", "Niveau du château", "Livello castello", "本据地等级", "本據地等級", "Level Kastil"]),
        "blacksmith_level" => pick(["Blacksmith Level", "鍛冶屋レベル", "Schmiedestufe", "Nivel de herrería", "Niveau de forge", "Livello fabbro", "铁匠铺等级", "鐵匠鋪等級", "Level Pandai Besi"]),
        "popularity" => pick(["Popularity", "人気度", "Beliebtheit", "Popularidad", "Popularité", "Popolarità", "人气度", "人氣度", "Popularitas"]),
        "bath_house_level" => pick(["Bath House Level", "風呂レベル", "Badehausstufe", "Nivel de baños", "Niveau des bains", "Livello terme", "澡堂等级", "澡堂等級", "Level Pemandian"]),

        // Generic values
        "none" => pick(["None", "なし", "Keine", "Ninguno", "Aucun", "Nessuno", "无", "無", "Tidak Ada"]),
        "empty" => pick(["(Empty)", "(空き)", "(Leer)", "(Vacío)", "(Vide)", "(Vuoto)", "(空)", "(空)", "(Kosong)"]),
        "unknown" => pick(["Unknown", "不明", "Unbekannt", "Desconocido", "Inconnu", "Sconosciuto", "未知", "未知", "Tidak Diketahui"]),

        _ => "",
    }
}
