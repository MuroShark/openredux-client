import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import logo from "../assets/OpenRedux.png";

export default function WindowTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    // Проверяем начальное состояние
    appWindow.isMaximized().then(setIsMaximized);

    // Подписываемся на изменение размера, чтобы менять иконку
    const unlisten = appWindow.onResized(async () => {
      setIsMaximized(await appWindow.isMaximized());
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const minimize = () => {
    console.log("Minimize clicked");
    appWindow.minimize().catch((e) => console.error("Minimize error:", e));
  };
  const toggleMaximize = async () => {
    try {
      const isMax = await appWindow.isMaximized();
      if (isMax) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
      // Состояние обновится через слушатель onResized, но можно и принудительно
      setIsMaximized(!isMax);
    } catch (e) {
      console.error("Maximize error:", e);
    }
  };
  const close = () => {
    appWindow.close().catch((e) => console.error("Close error:", e));
  };

  return (
    <div 
      className="h-[var(--titlebar-height)] bg-app-lightSurf dark:bg-app-surface flex select-none fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/5 transition-colors duration-300"
    >
      {/* Drag Region: data-tauri-drag-region для перетаскивания + onDoubleClick для UX */}
      <div 
        data-tauri-drag-region 
        className="flex-1 flex items-center gap-3 px-4 h-full"
        onDoubleClick={toggleMaximize}
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <img src={logo} alt="Logo" className="w-4 h-4 opacity-80" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 font-sans">
            OpenRedux
          </span>
        </div>
      </div>

      {/* Window Controls: Находятся в отдельном блоке справа, без drag-region */}
      {/* Добавляем relative, чтобы z-50 сработал и поднял кнопки над слоем перетаскивания */}
      <div className="flex h-full flex-shrink-0 z-50 relative">
        {/* Minimize */}
        <button
          onClick={minimize}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/10 transition-colors focus:outline-none"
          title="Minimize"
        >
          <i className="ph ph-minus text-sm"></i>
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={toggleMaximize}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/10 transition-colors focus:outline-none"
          title={isMaximized ? "Restore Down" : "Maximize"}
        >
          {isMaximized ? (
            <i className="ph ph-browsers text-sm"></i> // Иконка Restore
          ) : (
            <i className="ph ph-square text-sm"></i>
          )}
        </button>

        {/* Close */}
        <button
          onClick={close}
          className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-[#E81123] hover:text-white dark:text-gray-400 dark:hover:bg-[#E81123] dark:hover:text-white transition-colors focus:outline-none"
          title="Close"
        >
          <i className="ph ph-x text-lg"></i>
        </button>
      </div>
    </div>
  );
}