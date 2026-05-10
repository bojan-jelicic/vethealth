import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sr from './sr.json';
import en from './en.json';
import de from './de.json';
import { detectLanguageFromGeo } from './geoDetect';

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
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Geo-bazirana auto-detekcija jezika — izvršava se samo jednom,
// i samo ako korisnik nikad ranije nije ručno izabrao jezik.
if (typeof window !== 'undefined') {
  const hasManualChoice = !!window.localStorage.getItem('i18nextLng');
  const geoResolved = window.localStorage.getItem('i18n_geo_resolved') === '1';
  if (!hasManualChoice && !geoResolved) {
    detectLanguageFromGeo()
      .then((lang) => {
        window.localStorage.setItem('i18n_geo_resolved', '1');
        if (lang && lang !== i18n.language) {
          i18n.changeLanguage(lang);
        }
      })
      .catch(() => {
        window.localStorage.setItem('i18n_geo_resolved', '1');
      });
  }
}

export default i18n;
