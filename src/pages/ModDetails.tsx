import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../data/mods';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useMod } from '../hooks/useMods';
import { useTheme } from '../context/ThemeContext';
import { useStickyHeader } from '../hooks/useStickyHeader';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { ModHero } from '../components/mod/ModHero';
import { ModGallery } from '../components/mod/ModGallery';
import { ModRequirements } from '../components/mod/ModRequirements';
import { ModSidebar } from '../components/mod/ModSidebar';
import { ModChangelogModal } from '../components/mod/ModChangelogModal';
import AdvancedLightbox from '../components/AdvancedLightbox';

export default function ModDetails() {
  const { t, i18n } = useTranslation();
  const { modId } = useParams({ from: '/mod/$modId' });
  const navigate = useNavigate();
  const { mod, isLoading, error } = useMod(modId);
  const { isDark, setIsDark } = useTheme();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const showStickyBar = useStickyHeader(heroRef, mainRef);

  // Lock body scroll when lightbox or changelog is open using custom hook
  useLockBodyScroll(lightboxIndex !== null || showChangelog);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app-light dark:bg-app-bg">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <i className="ph-bold ph-spinner animate-spin text-4xl text-app-accent"></i>
          <p className="font-medium text-sm text-gray-500 dark:text-gray-400">{t('app.connecting')}</p>
        </div>
      </div>
    );
  }

  if (error || !mod) return <div className="flex h-screen items-center justify-center text-gray-500 dark:text-gray-400">Mod not found or error loading data.</div>;

  return (
    <div className="bg-app-light dark:bg-app-bg text-gray-800 dark:text-gray-200 font-sans h-full flex flex-col relative selection:bg-app-accent selection:text-black overflow-hidden">
      
      {/* STICKY TOP NAV */}
      <nav className="h-16 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#121212] flex items-center justify-between px-6 shrink-0 z-50 transition-colors relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: '/' })} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
            <i className="ph-bold ph-arrow-left text-xl"></i>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-black dark:hover:text-white cursor-pointer">{t('sidebar.library')}</Link>
            <i className="ph ph-caret-right"></i>
            <span className="hover:text-black dark:hover:text-white cursor-pointer">{getLocalized(mod.category, i18n.resolvedLanguage)}</span>
            <i className="ph ph-caret-right"></i>
            <span className="text-gray-900 dark:text-white font-medium">{getLocalized(mod.title, i18n.resolvedLanguage)}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-300 transition-colors"
        >
          <i className={`ph ${isDark ? 'ph-moon' : 'ph-sun'} text-xl`}></i>
        </button>
      </nav>

      {/* COMPACT STICKY INSTALL BAR */}
      <div className={`absolute top-[63px] left-0 w-full bg-white dark:bg-app-surface border-b border-gray-200 dark:border-app-accent/20 z-30 transform transition-transform duration-300 shadow-md dark:shadow-neon flex items-center justify-between px-6 py-3 ${showStickyBar ? 'translate-y-0' : '-translate-y-[150%]'}`}>
        <div className="flex items-center gap-3">
          <img src={mod.mainImage} className="w-10 h-10 rounded object-cover" alt="Thumbnail" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{getLocalized(mod.title, i18n.resolvedLanguage)}</h3>
            <span className="text-xs text-gray-500 dark:text-app-accent">V {mod.version}</span>
          </div>
        </div>
        <button className="bg-app-accent hover:bg-app-accentHover text-black px-6 py-2 rounded font-bold text-sm shadow-neon transition-all hover:scale-105 flex items-center gap-2">
          <i className="ph-bold ph-download-simple"></i> {t('modDetails.installNow')}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto animate-fade-in" ref={mainRef}>
        
        {/* 1. HERO SECTION */}
        <ModHero ref={heroRef} mod={mod} />

        {/* 2. CONTENT LAYOUT */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN (Main Content) - Spans 8 cols */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Video Embed */}
              {mod.videoThumbnail && (
                <div className="bg-black rounded-xl overflow-hidden shadow-card border border-gray-200 dark:border-white/5 aspect-video relative group cursor-pointer">
                  <img src={mod.videoThumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Video thumbnail" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-app-accent/90 flex items-center justify-center pl-1 shadow-neon transform group-hover:scale-110 transition-transform">
                      <i className="ph-fill ph-play text-black text-3xl"></i>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-sm font-medium text-white/80 bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
                    {t('modDetails.about')}
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              <ModGallery screenshots={mod.screenshots} onImageClick={setLightboxIndex} />

              {/* Description */}
              <section className="markdown-content max-w-3xl">
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">{t('modDetails.about')}</h2>
                   <button onClick={() => setShowChangelog(true)} className="text-sm text-gray-900 dark:text-app-accent hover:text-black dark:hover:text-white hover:underline flex items-center gap-1 transition-colors">
                      <i className="ph-bold ph-list-dashes"></i> {t('modDetails.changelog')}
                   </button>
                </div>
               
                <div className="space-y-4">
                  <ReactMarkdown>{getLocalized(mod.description, i18n.resolvedLanguage)}</ReactMarkdown>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t('modDetails.features')}:</h3>
                <ul>
                  {getLocalized(mod.features, i18n.resolvedLanguage).map((feature: string, idx: number) => (
                    <li key={idx}>
                      <ReactMarkdown components={{ p: "span" }}>{feature}</ReactMarkdown>
                    </li>
                  ))}
                </ul>

                <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 mt-8 flex gap-4 items-start shadow-sm dark:shadow-none">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-white dark:bg-app-accent/10 flex items-center justify-center text-gray-900 dark:text-app-accent shadow-sm dark:shadow-none border border-gray-100 dark:border-transparent">
                    <i className="ph-fill ph-magic-wand text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      {t('modDetails.installMethodTitle')}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('modDetails.installMethodDesc')}
                    </div>
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-8"></div>

              {/* Requirements Section */}
              <ModRequirements requirements={mod.requirements} />
            </div>

            {/* RIGHT SIDEBAR (Sticky) */}
            <ModSidebar mod={mod} />
          </div>
        </div>
      </main>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && <AdvancedLightbox images={mod.screenshots} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}

      {/* CHANGELOG MODAL */}
      {showChangelog && <ModChangelogModal changelog={mod.changelog} onClose={() => setShowChangelog(false)} />}
    </div>
  );
}