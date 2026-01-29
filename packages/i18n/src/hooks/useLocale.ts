import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "../types";
import { AVAILABLE_LOCALES, isValidLocale } from "../config/locales";

export interface UseLocaleReturn {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  availableLocales: Locale[];
}

/**
 * Hook for managing the current locale
 *
 * @returns Current locale, setter function, and available locales
 *
 * @example
 * ```tsx
 * function LanguageSelector() {
 *   const { locale, setLocale, availableLocales } = useLocale();
 *
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
 *       {availableLocales.map(loc => (
 *         <option key={loc} value={loc}>{loc}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useLocale(): UseLocaleReturn {
  const { i18n } = useTranslation();

  const setLocale = useCallback(
    async (locale: Locale) => {
      if (!isValidLocale(locale)) {
        throw new Error(`Invalid locale: ${locale}`);
      }

      await i18n.changeLanguage(locale);
    },
    [i18n],
  );

  return {
    locale: i18n.language as Locale,
    setLocale,
    availableLocales: AVAILABLE_LOCALES,
  };
}
