import type { Locale, LocaleConfig } from "../types";

export const DEFAULT_LOCALE: Locale = "en";
export const FALLBACK_LOCALE: Locale = "en";

export const LOCALES: Record<Locale, LocaleConfig> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    flag: "🇬🇧",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    flag: "🇸🇦",
  },
};

export const AVAILABLE_LOCALES: Locale[] = Object.keys(LOCALES) as Locale[];

export function isValidLocale(locale: string): locale is Locale {
  return AVAILABLE_LOCALES.includes(locale as Locale);
}

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return LOCALES[locale];
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return LOCALES[locale].direction;
}
