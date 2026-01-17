import { useTranslation } from 'react-i18next';
import { Mod, getLocalized, formatDate } from '../../data/mods';

interface ModSidebarProps {
  mod: Mod;
}

export const ModSidebar = ({ mod }: ModSidebarProps) => {
  const { t, i18n } = useTranslation();

  return (
    <aside className="lg:col-span-4 relative">
      <div className="sticky top-24 space-y-6">
        {/* Info Card */}
        <div className="bg-white dark:bg-app-surface rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-card">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{t('modDetails.details')}</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><i className="ph ph-git-commit"></i> Version</span><span className="text-gray-900 dark:text-white font-medium">{mod.version}</span></li>
            <li className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><i className="ph ph-calendar-blank"></i> {t('modDetails.lastUpdated')}</span><span className="text-gray-900 dark:text-white font-medium">{formatDate(mod.updated)}</span></li>
            <li className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><i className="ph ph-tag"></i> {t('modDetails.category')}</span><span className="text-gray-900 dark:text-white font-medium">{getLocalized(mod.category, i18n.resolvedLanguage)}</span></li>
            <li className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><i className="ph ph-game-controller"></i> {t('modDetails.compatibility')}</span><span className="text-gray-900 dark:text-white font-medium">RAGE MP, FiveM</span></li>
            {mod.compatibleVersions && (
              <li className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><i className="ph ph-check"></i> {t('modDetails.gameBuild')}</span><span className="text-gray-900 dark:text-white font-medium">{mod.compatibleVersions.join(', ')}</span></li>
            )}
            {mod.supportedEditions && (
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><i className="ph ph-desktop"></i> {t('modDetails.gameEdition')}</span>
                <div className="flex gap-1">
                  {mod.supportedEditions.map(ed => (
                    <span key={ed} className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-white/5">{t(`modDetails.editions.${ed}`)}</span>
                  ))}
                </div>
              </li>
            )}
            <li className="flex items-center justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><i className="ph ph-file-archive"></i> {t('modDetails.format')}</span><span className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-mono">.rpf package</span></li>
          </ul>
          <div className="w-full h-px bg-gray-200 dark:bg-white/5 my-6"></div>
          <div className="flex flex-wrap gap-2">
            {getLocalized(mod.tags, i18n.resolvedLanguage).map((tag: string) => (
              <span key={tag} className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full hover:border-app-accent cursor-default transition-colors">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};