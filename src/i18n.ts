import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru }
    },
    supportedLngs: ['en', 'ru'], // Явно указываем поддерживаемые языки
    fallbackLng: 'en',
    load: 'languageOnly', // Превращает 'ru-RU' в 'ru', 'en-US' в 'en'
    detection: {
      // Порядок определения:
      // 1. localStorage (сохраненный выбор пользователя)
      // 2. navigator (язык системы Windows)
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Кэшируем выбор, если пользователь переключит язык вручную
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;