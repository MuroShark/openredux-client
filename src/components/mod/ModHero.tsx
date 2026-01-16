import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mod, getLocalized, formatDownloads, formatSize } from '../../data/mods';

interface ModHeroProps {
  mod: Mod;
}

export const ModHero = forwardRef<HTMLElement, ModHeroProps>(({ mod }, ref) => {
  const { t, i18n } = useTranslation();

  return (
    <section ref={ref} className="relative h-[600px] w-full overflow-hidden group">
      {/* Background Image */}
      <img src={mod.mainImage} 
           className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110" 
           alt="Background" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-app-light via-white/20 to-transparent dark:from-[#121212] dark:via-[#121212]/60"></div>

      {/* Floating Action Box */}
      <div className="absolute bottom-0 left-0 w-full px-8 pb-12 pt-24 bg-gradient-to-t from-app-light to-transparent dark:from-[#121212]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8 animate-slide-up">
          
          {/* Title & Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-app-accent text-black text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">{getLocalized(mod.category, i18n.language)}</span>
              {mod.status === 'working' && (
                <span className="bg-green-500/20 backdrop-blur text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><i className="ph-fill ph-check-circle"></i> {t('modDetails.working')}</span>
              )}
              {mod.status === 'outdated' && (
                <span className="bg-yellow-500/20 backdrop-blur text-yellow-400 border border-yellow-500/30 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><i className="ph-fill ph-warning"></i> {t('modDetails.outdated')}</span>
              )}
              {mod.status === 'broken' && (
                <span className="bg-red-500/20 backdrop-blur text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><i className="ph-fill ph-x-circle"></i> {t('modDetails.broken')}</span>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight drop-shadow-lg">{getLocalized(mod.title, i18n.language)}</h1>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <img src={mod.authorAvatar} className="w-8 h-8 rounded-full border border-gray-400 dark:border-gray-500" alt="Author" />
                <span className="text-gray-600 dark:text-gray-300">By <span className="text-gray-900 dark:text-white font-semibold hover:underline cursor-pointer">{mod.author}</span></span>
              </div>
              <div className="h-4 w-px bg-gray-400 dark:bg-white/20"></div>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><i className="ph-fill ph-download-simple text-app-accent"></i> {formatDownloads(mod.downloads)} {t('modDetails.downloads')}</span>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><i className="ph-fill ph-star text-yellow-500"></i> {mod.rating} {t('modDetails.rating')}</span>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><i className="ph-bold ph-hard-drives"></i> {formatSize(mod.size)}</span>
            </div>
          </div>

          {/* Main Actions */}
          <div className="flex gap-4 items-center">
            <button className="bg-transparent border border-gray-400 dark:border-gray-500 hover:border-black dark:hover:border-white text-gray-900 dark:text-white p-4 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-white/5" title="Add to Favorites">
              <i className="ph ph-heart text-2xl"></i>
            </button>
            <button className="bg-app-accent hover:bg-app-accentHover text-black px-10 py-4 rounded-xl font-bold text-lg shadow-neon transform hover:scale-105 transition-all flex items-center gap-3">
              <i className="ph-bold ph-download-simple"></i>
              {t('modDetails.installNow').toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});