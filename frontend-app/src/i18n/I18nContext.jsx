import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from './i18n';

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [language, setLangState] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setLangState(newLang);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const setLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
    setLangState(newLang);
  };

  const t = (key, defaultValue) => i18n.t(key, defaultValue);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, i18n }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context) return context;

  return {
    language: i18n.language,
    setLanguage: (lang) => i18n.changeLanguage(lang),
    t: (key, defaultValue) => i18n.t(key, defaultValue),
    i18n
  };
};
