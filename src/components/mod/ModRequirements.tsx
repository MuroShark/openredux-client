import { useTranslation } from 'react-i18next';
import { Mod } from '../../data/mods';

interface ModRequirementsProps {
  requirements: Mod['requirements'];
}

export const ModRequirements = ({ requirements }: ModRequirementsProps) => {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('modDetails.requirements')}</h2>
      {requirements ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimum */}
          <div className="bg-white dark:bg-app-surface p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-card">
            <h4 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-4">{t('modDetails.min')}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2"><span className="text-gray-500">GPU</span><span className="text-gray-900 dark:text-white">{requirements.minimum.gpu}</span></div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2"><span className="text-gray-500">RAM</span><span className="text-gray-900 dark:text-white">{requirements.minimum.ram}</span></div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2"><span className="text-gray-500">CPU</span><span className="text-gray-900 dark:text-white">{requirements.minimum.cpu}</span></div>
            </div>
          </div>
          {/* Recommended */}
          <div className="bg-white dark:bg-app-surface p-6 rounded-xl border border-gray-200 dark:border-app-accent/20 relative overflow-hidden shadow-card">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gray-100 dark:bg-app-accent/10 rounded-bl-full -mr-8 -mt-8"></div>
            <h4 className="text-gray-900 dark:text-app-accent text-sm font-bold uppercase mb-4">{t('modDetails.rec')}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2"><span className="text-gray-500">GPU</span><span className="text-gray-900 dark:text-white">{requirements.recommended.gpu}</span></div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2"><span className="text-gray-500">RAM</span><span className="text-gray-900 dark:text-white">{requirements.recommended.ram}</span></div>
              <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2"><span className="text-gray-500">CPU</span><span className="text-gray-900 dark:text-white">{requirements.recommended.cpu}</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-8 text-center border border-gray-200 dark:border-white/10">
          <i className="ph ph-flask text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">{t('modDetails.requirementsPending')}</p>
        </div>
      )}
    </section>
  );
};