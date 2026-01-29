import { useTranslation as useI18nextTranslation } from "react-i18next";
import type { Namespace } from "i18next";

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
 *   return <h1>{t("page.title")}</h1>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function AnotherComponent() {
 *   // Uses "common" namespace by default
 *   const { t } = useTranslation();
 *   return <h1>{t("appName")}</h1>;
 * }
 * ```
 */
export function useTranslation<N extends Namespace = "common">(namespace?: N) {
  return useI18nextTranslation(namespace);
}
