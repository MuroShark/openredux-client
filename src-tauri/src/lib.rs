// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use regex::Regex;
use std::path::Path;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, report_game_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
