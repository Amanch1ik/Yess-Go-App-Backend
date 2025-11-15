import { useState, useEffect } from 'react';
import i18n from '@/i18n';

export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.getLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      setLanguage(i18n.getLanguage());
    });

    return unsubscribe;
  }, []);

  const translate = (key: string, defaultValue?: string, params?: Record<string, string | number>) => {
    return i18n.t(key, defaultValue, params);
  };

  return {
    t: translate,
    language,
    setLanguage: (lang: 'ru' | 'en' | 'kg') => {
      i18n.setLanguage(lang);
      setLanguage(lang);
    },
  };
};

