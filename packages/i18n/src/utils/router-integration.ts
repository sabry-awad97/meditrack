import type { Locale } from "../types";
import { isValidLocale } from "../config/locales";

/**
 * Extract locale from URL path
 *
 * Supports patterns like:
 * - /en/dashboard
 * - /ar/settings
 * - /?locale=en
 *
 * @param pathname - The URL pathname
 * @returns The extracted locale or null if not found
 *
 * @example
 * ```tsx
 * const locale = getLocaleFromPath("/en/dashboard"); // "en"
 * const locale = getLocaleFromPath("/dashboard"); // null
 * ```
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  // Try to extract from path: /en/... or /ar/...
  const pathMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (pathMatch) {
    const locale = pathMatch[1];
    if (locale && isValidLocale(locale)) {
      return locale;
    }
  }

  // Try to extract from query parameter: ?locale=en
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const localeParam = params.get("locale");
    if (localeParam && isValidLocale(localeParam)) {
      return localeParam as Locale;
    }
  }

  return null;
}

/**
 * Generate a localized path by prepending the locale
 *
 * @param path - The path to localize
 * @param locale - The locale to prepend
 * @returns The localized path
 *
 * @example
 * ```tsx
 * const path = localizedPath("/dashboard", "ar"); // "/ar/dashboard"
 * const path = localizedPath("/settings", "en"); // "/en/settings"
 * ```
 */
export function localizedPath(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Remove existing locale prefix if present
  const withoutLocale = cleanPath.replace(/^(en|ar)\//, "");

  // Add new locale prefix
  return `/${locale}/${withoutLocale}`;
}

/**
 * Remove locale prefix from path
 *
 * @param path - The path to clean
 * @returns The path without locale prefix
 *
 * @example
 * ```tsx
 * const path = removeLocaleFromPath("/en/dashboard"); // "/dashboard"
 * const path = removeLocaleFromPath("/dashboard"); // "/dashboard"
 * ```
 */
export function removeLocaleFromPath(path: string): string {
  return path.replace(/^\/(en|ar)(\/|$)/, "/");
}
