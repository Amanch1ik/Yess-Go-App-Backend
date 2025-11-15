import { useState, useEffect } from 'react';
import i18n, { t } from '@/i18n';

/**
 * Хук для использования переводов в компонентах
 * Автоматически обновляет компонент при изменении языка
 */
export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.getLanguage());

  useEffect(() => {
    // Подписываемся на изменения языка
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

