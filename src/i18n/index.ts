import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sr from './sr.json';
import en from './en.json';
import de from './de.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sr: { translation: sr },
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'sr',
    supportedLngs: ['sr', 'en', 'de'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Novi posjetioci uvijek dobijaju srpski (fallbackLng). Geo-detekcija (geoDetect.ts)
// je privremeno isključena na zahtjev klijenta.

export default i18n;
