import { useTranslation } from "react-i18next";

export const Installed = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center pt-20 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 dark:bg-white/5 mb-4">
        <i className="ph ph-hard-drives text-3xl text-gray-400"></i>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.libraryGrowing')}</h2>
      <p className="text-gray-500 mt-2">{t('app.modsInstallHint')}</p>
    </div>
  );
};

export const Settings = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center pt-20 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 dark:bg-white/5 mb-4">
        <i className="ph ph-gear text-3xl text-gray-400"></i>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.appSettings')}</h2>
      <p className="text-gray-500 mt-2">{t('app.settingsHint')}</p>
    </div>
  );
};