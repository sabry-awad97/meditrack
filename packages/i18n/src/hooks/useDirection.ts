import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Locale, TextDirection } from "../types";
import { getDirection } from "../config/locales";

export interface UseDirectionReturn {
  direction: TextDirection;
  isRTL: boolean;
  isLTR: boolean;
}

/**
 * Hook for accessing the current text direction
 *
 * @returns Current direction, isRTL flag, and isLTR flag
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { direction, isRTL } = useDirection();
 *
 *   return (
 *     <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useDirection(): UseDirectionReturn {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const direction = useMemo(() => getDirection(locale), [locale]);

  return {
    direction,
    isRTL: direction === "rtl",
    isLTR: direction === "ltr",
  };
}
