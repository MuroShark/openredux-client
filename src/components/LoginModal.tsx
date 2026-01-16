import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { useAuthStore } from "../store/useAuthStore";
import { open } from '@tauri-apps/plugin-shell';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: 'discord' | 'telegram', data?: any) => Promise<void>;
  loadingProvider: 'discord' | 'telegram' | null;
}

// Компонент для отрисовки официального виджета Telegram
const TelegramWidget = ({ onAuth }: { onAuth: (user: any) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLocalhost = window.location.hostname === "localhost";
  // Проверяем, совпадает ли порт с ожидаемым (80 или 443, для которых port === "")
  const isPortMismatch = window.location.port !== "" && window.location.port !== "80";

  useEffect(() => {
    if (!containerRef.current) return;
    if (isLocalhost) return; // Не загружаем виджет на localhost, он все равно выдаст ошибку
    if (isPortMismatch) return; // Не загружаем при несовпадении порта

    // Избегаем дублирования скрипта
    if (containerRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    
    // Получаем имя и логируем его для проверки
    // Очищаем имя от кавычек, пробелов и @, если они случайно попали в .env
    const rawBotName = import.meta.env.VITE_TELEGRAM_BOT_NAME || "";
    const botName = rawBotName.replace(/["'\s@]/g, ""); 

    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "false");
    script.async = true;

    // Создаем глобальную функцию для callback'а
    const callbackName = `onTelegramAuth_${Math.floor(Math.random() * 1000000)}`;
    script.setAttribute("data-onauth", `${callbackName}(user)`);

    (window as any)[callbackName] = (user: any) => {
      onAuth(user);
    };

    containerRef.current.appendChild(script);

    return () => {
      delete (window as any)[callbackName];
    };
  }, [onAuth, isLocalhost]);

  // Обработка ошибки порта (CSP frame-ancestors)
  if (isPortMismatch) {
    return (
      <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50">
        <p className="text-xs text-amber-800 dark:text-amber-200 font-bold mb-1">
          Ошибка порта для Telegram Login
        </p>
        <p className="text-[10px] text-amber-700 dark:text-amber-300 mb-2 leading-tight">
          Telegram требует порт 80. Ваш порт: {window.location.port}.<br/>
          Запустите сервер через <code>sudo npm run tauri dev</code>
        </p>
        <button 
          onClick={() => {
            // Dev Bypass: Эмулируем вход без реального виджета
            useAuthStore.setState({ 
              user: { id: 'dev', username: 'Dev User', avatarUrl: '', role: 'admin' }, 
              isAuthenticated: true 
            });
          }}
          className="text-xs bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded hover:brightness-95 transition-all font-bold text-amber-900 dark:text-amber-100"
        >
          ⚡️ Dev Login (Bypass)
        </button>
      </div>
    );
  }

  if (isLocalhost) {
    const correctUrl = `http://127.0.0.1:${window.location.port}`;
    return (
      <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50">
        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-1">
          Telegram Login не работает на localhost
        </p>
        <a href={correctUrl} className="text-xs font-bold text-[#229ED9] hover:underline break-all">
          Перейдите на {correctUrl}
        </a>
      </div>
    );
  }

  // Если имя бота не задано в .env, показываем ошибку в интерфейсе
  if (!import.meta.env.VITE_TELEGRAM_BOT_NAME) {
    return (
      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/50">
        <p className="text-xs text-red-800 dark:text-red-200 font-bold">VITE_TELEGRAM_BOT_NAME не найден!</p>
        <p className="text-[10px] text-red-600 dark:text-red-300">Проверьте файл .env и перезапустите сервер</p>
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center w-full py-1 min-h-[40px]" />;
};

export default function LoginModal({ isOpen, onClose, onLogin, loadingProvider }: LoginModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLoading = loadingProvider !== null;

  const handleDiscordClick = async () => {
    const rawClientId = import.meta.env.VITE_DISCORD_CLIENT_ID || "";
    const clientId = rawClientId.replace(/["'\s]/g, ""); // Удаляем пробелы и кавычки

    if (!clientId) return alert("VITE_DISCORD_CLIENT_ID not set!");
    
    // Используем HTTP URL нашего бэкенда
    const redirectUri = encodeURIComponent("http://localhost:8080/api/auth/discord/callback");
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;

    try {
      await open(authUrl);
    } catch (e) {
      console.error("Failed to open browser:", e);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-app-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden transform transition-all animate-slide-up">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-app-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-app-accent">
            <i className="ph-duotone ph-user-circle text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('loginModal.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('loginModal.subtitle')}
          </p>
        </div>

        <div className="p-8 pt-0 space-y-3">
          <button 
            onClick={handleDiscordClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all shadow-md hover:shadow-[#5865F2]/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:transition-none group"
          >
            {loadingProvider === 'discord' ? (
              <i className="ph-bold ph-spinner animate-spin text-xl"></i>
            ) : (
              <i className="ph-bold ph-discord-logo text-xl group-hover:scale-110 transition-transform"></i>
            )}
            {t('sidebar.loginDiscord')}
          </button>

          {/* Telegram Widget заменяет кастомную кнопку, так как нужен официальный скрипт для генерации хеша */}
          {loadingProvider === 'telegram' ? (
             <div className="w-full flex justify-center py-3"><i className="ph-bold ph-spinner animate-spin text-2xl text-[#229ED9]"></i></div>
          ) : (
            <TelegramWidget onAuth={(user) => onLogin('telegram', user)} />
          )}

          {/* Dev Mode Stubs - видны только в режиме разработки */}
          {import.meta.env.DEV && (
            <div className="pt-2 animate-fade-in">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
                <span className="flex-shrink-0 mx-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Dev Mode Bypass</span>
                <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    useAuthStore.setState({
                      user: {
                        id: 'dev-discord',
                        username: 'Dev Discord',
                        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Discord',
                        role: 'admin',
                        premiumUntil: new Date(Date.now() + 86400000 * 30).toISOString()
                      },
                      isAuthenticated: true,
                      accessToken: 'mock_token'
                    });
                    onClose();
                  }}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700/50 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors"
                >
                  Mock Discord (Admin)
                </button>
                <button
                  onClick={() => {
                    useAuthStore.setState({
                      user: {
                        id: 'dev-telegram',
                        username: 'Dev Telegram',
                        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Telegram',
                        role: 'user'
                      },
                      isAuthenticated: true,
                      accessToken: 'mock_token'
                    });
                    onClose();
                  }}
                  className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-700/50 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-300 transition-colors"
                >
                  Mock Telegram (User)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-white/5 text-center border-t border-gray-200 dark:border-white/5">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            {t('loginModal.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}