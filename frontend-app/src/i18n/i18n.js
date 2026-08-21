/**
 * Dedicated i18n Translation Engine for Aurelia Resort Application
 * Supports English ('en') and Hindi ('hi') with fallback, key resolution, and event listeners.
 */
import { translations } from './translations';

class I18nLibrary {
  constructor() {
    this.language = localStorage.getItem('hotel_language') || 'en';
    this.fallbackLng = 'en';
    this.resources = translations;
    this.listeners = new Set();
  }

  changeLanguage(lng) {
    if (this.resources[lng]) {
      this.language = lng;
      localStorage.setItem('hotel_language', lng);
      this.listeners.forEach((listener) => listener(lng));
    }
  }

  t(key, defaultValue = '') {
    const langDict = this.resources[this.language] || this.resources[this.fallbackLng];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const fallbackDict = this.resources[this.fallbackLng];
    if (fallbackDict && fallbackDict[key] !== undefined) {
      return fallbackDict[key];
    }
    return defaultValue || key;
  }

  on(event, callback) {
    if (event === 'languageChanged') {
      this.listeners.add(callback);
    }
  }

  off(event, callback) {
    if (event === 'languageChanged') {
      this.listeners.delete(callback);
    }
  }
}

export const i18n = new I18nLibrary();
export default i18n;
