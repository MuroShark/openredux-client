import { useTranslation } from "react-i18next";
import { useAppUpdater } from "../hooks/useAppUpdater";

interface TopBarProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export default function TopBar({ isDark, setIsDark }: TopBarProps) {
  const { t, i18n } = useTranslation();
  const { updateAvailable, installUpdate, status, downloadProgress, error, checkUpdate } = useAppUpdater();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.resolvedLanguage === 'ru' ? 'en' : 'ru');
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 bg-app-light/80 dark:bg-app-bg/80 backdrop-blur-md sticky top-0 z-10">
      <div className="relative w-96 group">
        <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-app-accent transition-colors"></i>
        <input 
          type="text" 
          placeholder={t('topbar.searchPlaceholder')}
          className="w-full bg-gray-200 dark:bg-app-surface border border-transparent dark:border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all placeholder-gray-500"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* DEBUG: Кнопка ручной проверки (видна, если нет обновления) */}
        {!updateAvailable && status === 'idle' && (
          <button 
            onClick={checkUpdate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-app-accent hover:text-black transition-all"
            title="Check for updates manually"
          >
            <i className="ph-bold ph-arrows-clockwise"></i>
            <span>CHECK</span>
          </button>
        )}

        {/* DEBUG: Показываем ошибку текстом, чтобы вы её увидели */}
        {status === 'error' && (
          <button 
            onClick={checkUpdate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors max-w-[200px]"
            title={error || "Update Error"}
          >
            <i className="ph-bold ph-warning-circle text-lg"></i>
            <span className="truncate">{error || "Error"}</span>
          </button>
        )}

        {updateAvailable && status === 'idle' && (
          <button 
            onClick={installUpdate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-app-accent text-black hover:brightness-110 transition-all animate-fade-in"
          >
            <i className="ph-bold ph-download-simple"></i>
            <span>UPDATE</span>
          </button>
        )}

        {status === 'downloading' && (
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-200 dark:bg-white/10 rounded-full animate-fade-in">
            <div className="w-20 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-app-accent transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tabular-nums">
              {downloadProgress}%
            </span>
          </div>
        )}

        <button 
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-app-accent hover:text-black transition-colors uppercase"
        >
          {i18n.resolvedLanguage === 'ru' ? 'RU' : 'EN'}
        </button>

        <button 
          onClick={() => setIsDark(!isDark)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 dark:text-gray-300 transition-colors"
        >
          <i className={`ph ${isDark ? 'ph-moon' : 'ph-sun'} text-xl`}></i>
        </button>
      </div>
    </header>
  );
}
