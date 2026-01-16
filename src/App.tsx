import { Outlet } from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import { useTheme } from "./context/ThemeContext";

function App() {
  // Получаем управление темой из контекста роутера
  const { isDark, setIsDark } = useTheme();

  return (
    <div className="flex h-screen bg-app-light text-gray-800 dark:bg-app-bg dark:text-gray-200 font-sans overflow-hidden selection:bg-app-accent selection:text-black">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar isDark={isDark} setIsDark={setIsDark} />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
