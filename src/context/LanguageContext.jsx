import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/translations';

const STORAGE_KEY_LANGUAGE = 'krishimitra_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Kannada ('kn') is the default language as requested!
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    return 'kn'; // Default to Kannada
  });

  const changeLanguage = (newLangCode) => {
    if (TRANSLATIONS[newLangCode]) {
      setLanguage(newLangCode);
      try {
        localStorage.setItem(STORAGE_KEY_LANGUAGE, newLangCode);
      } catch (e) {
        console.error('Failed to save language in localStorage', e);
      }
    }
  };

  // Translation helper function
  const t = (key) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.kn;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English, then Kannada
    return TRANSLATIONS.en?.[key] || TRANSLATIONS.kn?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
