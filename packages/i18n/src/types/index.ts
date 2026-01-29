export type Locale = "en" | "ar";

export type TextDirection = "ltr" | "rtl";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: TextDirection;
  flag: string;
}

export type TranslationNamespace =
  | "common"
  | "orders"
  | "suppliers"
  | "settings"
  | "validation";
