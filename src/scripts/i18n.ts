/**
 * Ration Saathi - i18n Internationalization Runtime Module
 * Supports English, Marathi (मराठी), and Hindi (हिन्दी)
 * Switches language instantly without page reload.
 */

import en from '../i18n/en.json';
import mr from '../i18n/mr.json';
import hi from '../i18n/hi.json';

export type SupportedLang = 'en' | 'mr' | 'hi';

const dictionaries: Record<SupportedLang, Record<string, string>> = {
  en,
  mr,
  hi
};

class I18nManager {
  private currentLang: SupportedLang = 'en';

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rs_lang') as SupportedLang;
      if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
        this.currentLang = saved;
      }
    }
  }

  public getLang(): SupportedLang {
    return this.currentLang;
  }

  public t(key: string, fallback?: string): string {
    const dict = dictionaries[this.currentLang] || dictionaries.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English
    if (dictionaries.en && dictionaries.en[key] !== undefined) {
      return dictionaries.en[key];
    }
    return fallback || key;
  }

  public setLang(lang: SupportedLang) {
    if (lang !== 'en' && lang !== 'mr' && lang !== 'hi') return;
    this.currentLang = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rs_lang', lang);
      document.documentElement.lang = lang;
      this.translateDOM();
      window.dispatchEvent(new CustomEvent('rs:langchange', { detail: { lang } }));
    }
  }

  public translateDOM() {
    if (typeof document === 'undefined') return;

    // 1. Elements with data-i18n attribute (textContent)
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const text = this.t(key);
        el.textContent = text;
      }
    });

    // 2. Elements with data-i18n-attr attribute, e.g. "placeholder:signin_username_placeholder"
    document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach(el => {
      const raw = el.getAttribute('data-i18n-attr');
      if (raw) {
        const pairs = raw.split(';');
        pairs.forEach(pair => {
          const [attr, key] = pair.split(':').map(s => s.trim());
          if (attr && key) {
            el.setAttribute(attr, this.t(key));
          }
        });
      }
    });

    // 3. Elements with data-i18n-aria, e.g. "signin_password_show"
    document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) {
        el.setAttribute('aria-label', this.t(key));
      }
    });
  }
}

export const i18n = new I18nManager();
