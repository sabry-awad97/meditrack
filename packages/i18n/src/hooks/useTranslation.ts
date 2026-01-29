import { useTranslation as useI18nextTranslation } from "react-i18next";
import type { TFunction } from "i18next";

export interface UseTranslationReturn {
  t: TFunction;
  i18n: ReturnType<typeof useI18nextTranslation>["i18n"];
  ready: boolean;
}

/**
 * Hook for accessing translations in components
 *
 * @param namespace - The translation namespace to use (default: "common")
 * @returns Translation function and i18n instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t } = useTranslation("orders");
 *   return <h1>{t("title")}</h1>;
 * }
 * ```
 */
export function useTranslation(namespace?: string): UseTranslationReturn {
  const { t, i18n, ready } = useI18nextTranslation(namespace as any);

  return {
    t,
    i18n,
    ready,
  };
}
