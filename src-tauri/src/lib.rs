// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use regex::Regex;
use std::path::{Path, PathBuf};
use std::env;
use std::fs;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Структура для отправки данных на сервер
#[derive(serde::Serialize)]
struct AnalyticsPayload {
    path: String,
    platform: String,
}

#[derive(serde::Deserialize)]
struct PathStat {
    path: String,
    #[allow(dead_code)]
    count: i64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[allow(non_snake_case)]
struct GpuInfo {
    Name: String,
    AdapterRAM: Option<u64>, // Может быть null для некоторых виртуальных адаптеров
}

#[tauri::command]
async fn report_game_path(path: String, api_url: String) -> Result<bool, String> {
    // 1. Валидация: Проверяем физическое наличие exe файла
    // Это работает быстрее и надежнее, чем проверки из JS
    let path_buf = Path::new(&path);
    let exe_path = path_buf.join("GTA5.exe");
    
    if !exe_path.exists() {
        return Err("GTA5.exe not found in the specified directory".to_string());
    }

    // 2. Анонимизация (Sanitization): Удаляем PII (Personal Identifiable Information)
    // Windows: C:\Users\Admin\Games -> C:\Users\<USER>\Games
    // Unix/Mac: /Users/Georgij/Games -> /Users/<USER>/Games
    let re_win = Regex::new(r"(?i)([a-z]:[\\/]Users[\\/])[^\\/]+").map_err(|e| e.to_string())?;
    let re_unix = Regex::new(r"(?i)(/home/|/Users/)[^/]+").map_err(|e| e.to_string())?;
    
    let clean_win = re_win.replace(&path, "${1}<USER>");
    let clean_path = re_unix.replace(&clean_win, "${1}<USER>").to_string();

    // 3. Определение платформы (Эвристика)
    let lower_path = path.to_lowercase();
    let platform = if lower_path.contains("steam") {
        "steam"
    } else if lower_path.contains("epic") {
        "epic"
    } else if lower_path.contains("rockstar") {
        "rockstar"
    } else {
        "other"
    };

    // 4. Отправка данных
    // Используем reqwest внутри Rust, чтобы избежать CORS и блокировщиков рекламы
    let client = reqwest::Client::new();
    let payload = AnalyticsPayload {
        path: clean_path,
        platform: platform.to_string(),
    };

    // Fire-and-forget: мы не ждем ответа, чтобы не блокировать UI, но логируем ошибку если есть
    let _ = client.post(format!("{}/api/analytics/path", api_url))
        .json(&payload)
        .send()
        .await;

    Ok(true)
}

#[tauri::command]
async fn auto_detect_game_path(api_url: String) -> Result<String, String> {
    // 1. Получаем имя текущего пользователя для подстановки
    let username = env::var("USERNAME").unwrap_or_else(|_| "User".to_string());
    
    // 2. Запрашиваем топ популярных путей с сервера
    // Это Data-Driven подход: мы используем коллективный опыт пользователей
    let client = reqwest::Client::new();
    let response = client.get(format!("{}/api/analytics/popular", api_url))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let stats: Vec<PathStat> = response.json().await.map_err(|e| e.to_string())?;

        for stat in stats {
            // 3. Восстанавливаем реальный путь из шаблона
            // Заменяем <USER> на реальное имя пользователя системы
            let real_path_str = stat.path.replace("<USER>", &username);
            let path_buf = PathBuf::from(&real_path_str);
            let exe_path = path_buf.join("GTA5.exe");

            // 4. Проверяем физическое наличие
            if exe_path.exists() {
                return Ok(real_path_str);
            }
        }
    }

    // 5. Fallback: Если аналитика не помогла, проверяем стандартные пути (Hardcoded)
    let common_paths = vec![
        r"C:\Program Files\Rockstar Games\Grand Theft Auto V",
        r"C:\Program Files (x86)\Rockstar Games\Grand Theft Auto V",
        r"C:\Program Files (x86)\Steam\steamapps\common\Grand Theft Auto V",
        r"D:\SteamLibrary\steamapps\common\Grand Theft Auto V",
        r"E:\SteamLibrary\steamapps\common\Grand Theft Auto V",
        r"C:\Program Files\Epic Games\GTAV",
    ];

    for path in common_paths {
        let path_buf = PathBuf::from(path);
        if path_buf.join("GTA5.exe").exists() {
            return Ok(path.to_string());
        }
    }

    // TODO: Можно добавить чтение из Windows Registry (Software\WOW6432Node\Rockstar Games\Grand Theft Auto V)
    // Но для MVP аналитики и хардкода обычно достаточно.

    Err("Could not auto-detect game path".to_string())
}

#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file_content(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_gta_settings_path() -> Result<String, String> {
    let user_profile = env::var("USERPROFILE").map_err(|_| "USERPROFILE not set".to_string())?;
    let path = PathBuf::from(user_profile)
        .join("Documents")
        .join("Rockstar Games")
        .join("GTA V")
        .join("settings.xml");
    
    // Возвращаем путь, даже если файл не существует (обработаем ошибку на клиенте)
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
async fn get_screen_resolution(window: tauri::Window) -> Result<String, String> {
    let monitor = window.current_monitor().map_err(|e| e.to_string())?
        .ok_or("Monitor not found")?;
    let size = monitor.size();
    Ok(format!("{}x{}", size.width, size.height))
}

#[tauri::command]
async fn get_gpu_info() -> Result<serde_json::Value, String> {
    // Используем PowerShell для получения инфо о GPU через CIM (современный аналог WMI)
    // WMI (Win32_VideoController) имеет ограничение в 4GB для AdapterRAM (UInt32).
    // Поэтому мы пытаемся достать реальное значение из реестра через PNPDeviceID.
    let ps_script = r#"
$gpus = Get-CimInstance Win32_VideoController
$results = @()

foreach ($gpu in $gpus) {
    $vram = $gpu.AdapterRAM
    
    try {
        $pnpId = $gpu.PNPDeviceID
        $driverKey = (Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Enum\$pnpId" -ErrorAction SilentlyContinue).Driver
        
        if ($driverKey) {
            $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\$driverKey"
            $props = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
            
            if ($props."HardwareInformation.qwMemorySize") {
                $vram = $props."HardwareInformation.qwMemorySize"
            }
        }
    } catch {}

    $results += [PSCustomObject]@{
        Name = $gpu.Name
        AdapterRAM = $vram
    }
}

$results | ConvertTo-Json
"#;

    let mut command = std::process::Command::new("powershell");
    command.args(&["-NoProfile", "-Command", ps_script]);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    let output = command.output().map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Failed to execute GPU detection command".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // PowerShell может вернуть один объект или массив. Парсим в Value.
    let json: serde_json::Value = serde_json::from_str(&stdout).map_err(|e| e.to_string())?;
    
    // Логика выбора "лучшей" карты (если их несколько, например Intel + NVIDIA)
    // Обычно дискретная карта имеет больше памяти.
    let best_gpu = if let Some(array) = json.as_array() {
        array.iter().max_by_key(|g| g["AdapterRAM"].as_u64().unwrap_or(0)).unwrap_or(&json).clone()
    } else {
        json
    };

    // Возвращаем JSON напрямую на фронтенд, там удобнее работать
    Ok(best_gpu)
}

#[tauri::command]
async fn run_patcher_install(app: tauri::AppHandle, mod_id: String, game_path: String) -> Result<String, String> {
    // Запускаем sidecar "patcher"
    // Tauri автоматически найдет правильный бинарник для текущей архитектуры
    let sidecar_command = app.shell().sidecar("patcher")
        .map_err(|e| e.to_string())?
        .args(["install", "--mod-id", &mod_id, "--path", &game_path]);

    let (mut rx, _child) = sidecar_command
        .spawn()
        .map_err(|e| e.to_string())?;

    let mut output = String::new();

    // Читаем вывод в реальном времени (можно отправлять ивенты на фронт)
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            let line_str = String::from_utf8_lossy(&line);
            output.push_str(&line_str);
        }
    }

    Ok(output)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            report_game_path, 
            auto_detect_game_path,
            read_file_content,
            write_file_content,
            get_gta_settings_path,
            get_screen_resolution,
            get_gpu_info,
            run_patcher_install
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
