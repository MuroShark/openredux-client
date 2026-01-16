import logo from "../assets/OpenRedux.png";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { isPremium } from "../data/user";
import ProfileModal from "./ProfileModal";

export default function Sidebar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<'discord' | 'telegram' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { to: "/", icon: "ph-storefront", label: t('sidebar.library') },
    { to: "/installed", icon: "ph-hard-drives", label: t('sidebar.installed') },
    { to: "/configurator", icon: "ph-sliders-horizontal", label: t('sidebar.configurator') },
    { to: "/settings", icon: "ph-gear", label: t('sidebar.settings') },
  ];

  const handleLogin = async (provider: 'discord' | 'telegram', data?: any) => {
    setLoadingProvider(provider);
    await login(provider, data);
    setLoadingProvider(null);
    setIsModalOpen(false);
  };

  return (
    <aside className="w-64 bg-app-lightSurf dark:bg-app-surface border-r border-gray-200 dark:border-white/5 flex flex-col justify-between flex-shrink-0 z-20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded bg-app-accent flex items-center justify-center shadow-neon-sm overflow-hidden">
            <img src={logo} alt="OpenRedux" className="w-full h-full object-cover translate-y-[2px]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">OpenRedux</h1>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white`}
              activeProps={{
                className: "!bg-gray-200 !text-gray-900 dark:!bg-white/10 dark:!text-app-accent"
              }}
            >
              <i className={`ph ${item.icon} text-lg`}></i>
              {item.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className="my-3 mx-2 border-t border-gray-200 dark:border-white/5"></div>
              <Link
                to="/my-submissions"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                activeProps={{ className: "!bg-gray-200 !text-gray-900 dark:!bg-white/10 dark:!text-app-accent" }}
              >
                <i className="ph-bold ph-files text-lg"></i>
                {t('sidebar.mySubmissions')}
              </Link>
              <Link
                to="/submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all text-gray-600 hover:bg-gray-100 hover:text-black dark:text-app-accent dark:hover:bg-app-accent/10"
                activeProps={{ className: "!bg-app-accent !text-black" }}
              >
                <i className="ph-bold ph-upload-simple text-lg"></i>
                {t('sidebar.submitRedux')}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* User */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5">
        {isAuthenticated && user ? (
          <div className="group relative">
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-gray-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.username}</p>
                <p className={`text-xs truncate ${isPremium(user) ? 'text-app-accent' : 'text-gray-500'}`}>
                  {isPremium(user) ? t('sidebar.premium') : 'User'}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); logout(); }} 
                className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                title={t('sidebar.logout')}
              >
                <i className="ph-bold ph-sign-out"></i>
              </button>
            </div>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>
        ) : (
          <>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-app-accent group-hover:scale-110 transition-all">
                <i className="ph-bold ph-user"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t('sidebar.guest')}</p>
                <p className="text-xs text-gray-500 group-hover:text-app-accent transition-colors truncate">
                  {t('sidebar.loginToSync')}
                </p>
              </div>
              <i className="ph-bold ph-sign-in text-gray-400 group-hover:text-app-accent transition-colors"></i>
            </button>
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLogin={handleLogin} loadingProvider={loadingProvider} />
          </>
        )}
      </div>
    </aside>
  );
}
