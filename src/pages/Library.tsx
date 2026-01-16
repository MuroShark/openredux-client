import { useTranslation } from 'react-i18next';
import { formatDownloads, getLocalized } from '../data/mods';
import { useMods } from '../hooks/useMods';
import { Link } from '@tanstack/react-router';

export default function Library() {
  const { t, i18n } = useTranslation();
  const { mods, isLoading, error } = useMods();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <i className="ph-bold ph-spinner animate-spin text-4xl text-app-accent"></i>
          <p className="font-medium text-sm text-gray-500">{t('app.connecting')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        <div className="text-center">
          <i className="ph-fill ph-warning-circle text-5xl mb-4"></i>
          <h2 className="text-xl font-bold">{t('app.connectionFailed')}</h2>
          <p className="mt-2 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 group h-80 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2665&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="eager" // Hero изображение грузим сразу (LCP)
          decoding="async"
          alt="GTA V Redux" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-app-accent text-black text-xs font-bold rounded-full mb-3 uppercase tracking-wider">{t('library.featured')}</span>
          <h2 className="text-4xl font-bold text-white mb-2">NaturalVision Evolved</h2>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">Experience Grand Theft Auto V like never before with completely overhauled lighting, reflections, and weather effects.</p>
          <div className="flex gap-4">
            <button className="btn-accent bg-app-accent text-black px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transform transition-transform active:scale-95">
              <i className="ph-bold ph-download-simple"></i>
              {t('library.installMod')}
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors border border-white/10">
              {t('library.viewDetails')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button className="px-4 py-1.5 rounded-full bg-app-accent text-black text-sm font-semibold whitespace-nowrap">{t('library.filters.all')}</button>
        <button className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-app-surface border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-app-accent transition-colors whitespace-nowrap">{t('library.filters.graphics')}</button>
        <button className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-app-surface border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-app-accent transition-colors whitespace-nowrap">{t('library.filters.vehicles')}</button>
        <button className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-app-surface border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-app-accent transition-colors whitespace-nowrap">{t('library.filters.fps')}</button>
        <button className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-app-surface border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-app-accent transition-colors whitespace-nowrap">{t('library.filters.scripts')}</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mods.map((mod, index) => (
          <Link 
            key={mod.id}
            to="/mod/$modId"
            params={{ modId: mod.id }}
            className="bg-white dark:bg-app-surface rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 hover:-translate-y-1 hover:border-app-accent/50 transition-all duration-300 group shadow-lg dark:shadow-none cursor-pointer transform-gpu"
          >
            <div className="h-40 overflow-hidden relative">
              <img 
                src={mod.mainImage} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={getLocalized(mod.title, i18n.language)} 
                loading={index < 4 ? "eager" : "lazy"} // Первые 4 грузим сразу, остальные лениво
              />
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-app-accent text-xs font-bold px-2 py-1 rounded">V {mod.version}</div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{getLocalized(mod.title, i18n.language)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">by {mod.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1"><i className="ph-fill ph-star text-yellow-500"></i> {mod.rating}</span>
                <span className="flex items-center gap-1"><i className="ph-fill ph-download-simple"></i> {formatDownloads(mod.downloads)}</span>
              </div>
              <button className="w-full py-2 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-semibold text-sm hover:border-app-accent hover:text-app-accent hover:bg-app-accent/5 transition-all">{t('library.install')}</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
