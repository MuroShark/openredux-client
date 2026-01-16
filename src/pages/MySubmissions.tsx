import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { useUserMods } from '../hooks/useMods';
import { getLocalized, formatDate } from '../data/mods';

export default function MySubmissions() {
  const { t, i18n } = useTranslation();
  const { mods, isLoading } = useUserMods();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <i className="ph-bold ph-spinner animate-spin text-4xl text-app-accent"></i>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('mySubmissions.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('mySubmissions.subtitle')}</p>
        </div>
        <Link 
          to="/submit" 
          className="bg-app-accent hover:bg-app-accentHover text-black px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-neon-sm"
        >
          <i className="ph-bold ph-plus"></i>
          {t('mySubmissions.createNew')}
        </Link>
      </div>

      {mods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-app-surface rounded-2xl border border-gray-200 dark:border-white/5 border-dashed">
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <i className="ph-duotone ph-files text-3xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('mySubmissions.emptyTitle')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md text-center">{t('mySubmissions.emptyDesc')}</p>
          <Link to="/submit" className="text-app-accent hover:underline font-bold text-sm">
            {t('mySubmissions.createNew')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mods.map((mod) => (
            <div 
              key={mod.id} 
              className="bg-white dark:bg-app-surface rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-colors group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-48 h-32 md:h-auto relative flex-shrink-0 bg-gray-100 dark:bg-black/20">
                  {mod.mainImage ? (
                    <img src={mod.mainImage} className="w-full h-full object-cover" alt="Mod cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <i className="ph-duotone ph-image text-3xl"></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {getLocalized(mod.title, i18n.language)}
                        </h3>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500">
                          v{mod.version}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        ID: <span className="font-mono select-all">{mod.id}</span>
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <StatusBadge status={mod.moderationStatus || 'pending'} />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="text-xs text-gray-400">
                      {t('mySubmissions.submittedOn')} {formatDate(mod.updated || new Date().toISOString())}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-3">
                      {mod.moderationStatus === 'approved' && (
                        <Link to="/mod/$modId" params={{ modId: mod.id }} className="text-xs font-bold text-gray-500 hover:text-app-accent transition-colors flex items-center gap-1">
                          <i className="ph-bold ph-eye"></i> {t('library.viewDetails')}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Reason Banner */}
              {mod.moderationStatus === 'rejected' && mod.rejectReason && (
                <div className="bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-500/20 px-5 py-3 flex items-start gap-3">
                  <i className="ph-fill ph-warning-circle text-red-500 mt-0.5"></i>
                  <div>
                    <p className="text-xs font-bold text-red-800 dark:text-red-200 uppercase mb-0.5">{t('mySubmissions.rejectionReason')}</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{mod.rejectReason}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-500/30",
    approved: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200 border-green-200 dark:border-green-500/30",
    rejected: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200 border-red-200 dark:border-red-500/30",
  };

  const style = styles[status as keyof typeof styles] || styles.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${style} flex items-center gap-1.5`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {t(`mySubmissions.status.${status}`)}
    </span>
  );
}