import type { Locale } from "../types";

/**
 * Format a date according to the current locale
 *
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format a number according to the current locale
 *
 * @param value - The number to format
 * @param locale - The locale to use for formatting
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return value.toString();
  }
}

/**
 * Format a currency value according to the current locale
 *
 * @param value - The currency value to format
 * @param locale - The locale to use for formatting
 * @param currency - The currency code (e.g., "USD", "EUR", "SAR")
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: Locale,
  currency: string = "USD",
  options?: Intl.NumberFormatOptions,
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    ...options,
  };

  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currency} ${value}`;
  }
}
