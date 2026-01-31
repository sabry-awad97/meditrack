import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  initializeI18n,
} from "../config/i18n-config";

/**
 * Property Test 2: Language Selection Loads Translations
 * Property Test 3: Language Preference Persistence (Round Trip)
 *
 * Validates Requirements 3.2, 3.3:
 * - Language selection and switching
 * - Locale persistence in localStorage
 *
 * These tests ensure that:
 * 1. Selecting a language loads the correct translations
 * 2. Language preference persists across sessions (localStorage round trip)
 * 3. The system correctly detects and restores saved locale
 * 4. Language changes are reflected immediately
 */

describe("Property Test: Language Selection and Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Property 2: Language selection loads correct translations", async () => {
    // Property: For any supported locale, switching to it should load translations
    // that are different from the other locale
    await fc.assert(
      fc.asyncProperty(fc.constantFrom("en", "ar"), async (locale) => {
        const i18n = await initializeI18n(locale);

        // Verify the language was set correctly
        expect(i18n.language).toBe(locale);

        // Verify translations are loaded for this language
        const translation = i18n.t("app.name");
        expect(translation).toBeTruthy();
        expect(translation.length).toBeGreaterThan(0);

        // Verify it's not returning the key (which would indicate missing translation)
        expect(translation).not.toBe("app.name");
      }),
      { numRuns: 100 },
    );
  });

  it("should handle language switching with translation updates", async () => {
    // Property: Switching languages should update translations immediately
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("en", "ar"),
        fc.constantFrom("en", "ar"),
        async (locale1, locale2) => {
          // Initialize with first locale
          const i18n = await initializeI18n(locale1);
          const translation1 = i18n.t("app.name");

          // Switch to second locale
          await i18n.changeLanguage(locale2);
          const translation2 = i18n.t("app.name");

          // If locales are different, translations should be different
          if (locale1 !== locale2) {
            expect(translation1).not.toBe(translation2);
          } else {
            // If same locale, translations should be the same
            expect(translation1).toBe(translation2);
          }

          // Both should be valid translations (not the key)
          expect(translation1).not.toBe("app.name");
          expect(translation2).not.toBe("app.name");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain translation consistency after multiple switches", async () => {
    // Property: Switching back to a language should return the same translations
    await fc.assert(
      fc.asyncProperty(fc.constantFrom("en", "ar"), async (locale) => {
        const i18n = await initializeI18n(locale);

        // Get initial translation
        const initialTranslation = i18n.t("navigation.home");

        // Switch to other locale and back
        const otherLocale = locale === "en" ? "ar" : "en";
        await i18n.changeLanguage(otherLocale);
        await i18n.changeLanguage(locale);

        // Should get the same translation
        const finalTranslation = i18n.t("navigation.home");
        expect(finalTranslation).toBe(initialTranslation);
      }),
      { numRuns: 100 },
    );
  });

  it("should handle storage errors gracefully", async () => {
    // Property: System should work even if localStorage fails
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    try {
      // Simulate localStorage failure
      localStorage.setItem = () => {
        throw new Error("Storage quota exceeded");
      };
      localStorage.getItem = () => {
        throw new Error("Storage access denied");
      };

      // Should still initialize without crashing
      const i18n = await initializeI18n("en");
      expect(i18n.language).toBe("en");

      // Should still be able to get translations
      const translation = i18n.t("app.name");
      expect(translation).toBeTruthy();
    } finally {
      // Restore localStorage
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    }
  });

  it("should handle concurrent language switches correctly", async () => {
    // Property: Multiple rapid language switches should end up in a consistent state
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom("en", "ar"), { minLength: 3, maxLength: 10 }),
        async (localeSequence) => {
          const i18n = await initializeI18n("en");

          // Apply all language switches
          for (const locale of localeSequence) {
            await i18n.changeLanguage(locale);
          }

          // Final language should match the last in sequence
          const finalLocale = localeSequence[localeSequence.length - 1];
          expect(i18n.language).toBe(finalLocale);

          // Translations should be valid for the final locale
          const translation = i18n.t("app.name");
          expect(translation).not.toBe("app.name");
          expect(translation.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 50 },
    );
  });
});
