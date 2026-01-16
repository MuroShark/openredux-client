import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useSettingsStore } from "../store/useSettingsStore";

export default function Settings() {
  const { t } = useTranslation();
  const { gamePath, setGamePath } = useSettingsStore();
  
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    setError(null);
    setSuccessMsg(null);

    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t('settings.selectFolderTitle') || "Select GTA V Root Folder",
      });

      if (selected && typeof selected === 'string') {
        validateAndSetPath(selected);
      }
    } catch (err) {
      console.error("Dialog error:", err);
      setError(t('settings.errors.dialogFailed'));
    }
  };

  const validateAndSetPath = async (path: string) => {
    setIsValidating(true);
    try {
      // 1. Validate & Report Analytics via Rust
      // The Rust command checks for GTA5.exe and sends anonymized path to server
      await invoke('report_game_path', { 
        path, 
        apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8080" 
      });

      // 2. If successful, update store
      setGamePath(path);
      setSuccessMsg(t('settings.success.pathValid'));
    } catch (err) {
      console.error("Validation error:", err);
      // Rust returns a string error if GTA5.exe is missing
      setError(t('settings.errors.invalidPath'));
      setGamePath(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('sidebar.settings')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('app.settingsHint')}
        </p>
      </div>

      {/* Game Location Card */}
      <div className="bg-white dark:bg-app-surface rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="ph-duotone ph-folder-open text-app-accent text-xl"></i>
              {t('settings.gameLocation')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('settings.gameLocationDesc')}
            </p>
          </div>
          {gamePath && (
            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800 flex items-center gap-1">
              <i className="ph-bold ph-check"></i>
              {t('settings.verified')}
            </span>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1 ml-1">
              {t('settings.currentPath')}
            </div>
            <div className={`font-mono text-sm truncate px-3 py-2 rounded-lg border ${
              error 
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
            }`}>
              {gamePath || t('settings.notSet')}
            </div>
            {error && <p className="text-xs text-red-500 mt-2 ml-1 animate-fade-in">{error}</p>}
            {successMsg && <p className="text-xs text-green-500 mt-2 ml-1 animate-fade-in">{successMsg}</p>}
          </div>

          <button
            onClick={handleSelectFolder}
            disabled={isValidating}
            className="w-full sm:w-auto px-6 py-3 bg-app-accent text-black font-bold rounded-xl hover:brightness-110 transition-all shadow-neon-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isValidating ? (
              <i className="ph-bold ph-spinner animate-spin text-lg"></i>
            ) : (
              <i className="ph-bold ph-folder-notch-open text-lg"></i>
            )}
            {t('settings.changePath')}
          </button>
        </div>
      </div>
    </div>
  );
}