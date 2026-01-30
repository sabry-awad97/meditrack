import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import { initializeI18n } from "../config/i18n-config";

/**
 * Property Test 5: Namespace Isolation
 *
 * Validates Requirement 5.5: Namespace organization
 *
 * This test ensures that:
 * 1. Translations in different namespaces are isolated from each other
 * 2. Keys with the same name in different namespaces don't conflict
 * 3. Namespace specification correctly routes to the right translation
 * 4. Default namespace fallback works correctly
 */

describe("Property Test: Namespace Isolation", () => {
  beforeAll(async () => {
    await initializeI18n("en");
  });

  it("should isolate translations between namespaces", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Define keys that exist in multiple namespaces with different values
    const namespacedKeys = [
      { ns: "orders", key: "title", expected: "Orders" },
      { ns: "suppliers", key: "title", expected: "Suppliers" },
      { ns: "settings", key: "title", expected: "Settings" },
    ];

    // Property: Same key in different namespaces should return different values
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...namespacedKeys),
        async ({ ns, key, expected }) => {
          const result = (i18n.t as any)(key, { ns });
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should not leak translations across namespaces", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Keys that exist only in specific namespaces
    const exclusiveKeys = [
      { ns: "orders", key: "status.pending" },
      { ns: "orders", key: "status.delivered" },
      { ns: "suppliers", key: "card.whatsapp" },
      { ns: "settings", key: "categories.general" },
    ];

    // Property: Namespace-specific keys should not be accessible from wrong namespace
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...exclusiveKeys),
        async ({ ns, key }) => {
          // Should work with correct namespace
          const correctResult = (i18n.t as any)(key, { ns });
          expect(correctResult).not.toBe(key); // Should not return the key itself

          // Should not work with wrong namespace (should return key or fallback)
          const wrongNs = ns === "orders" ? "suppliers" : "orders";
          const wrongResult = (i18n.t as any)(key, { ns: wrongNs });

          // When using wrong namespace, should either return the key or use fallback
          // but should NOT return the correct translation from the other namespace
          expect(wrongResult).not.toBe(correctResult);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle explicit namespace prefix correctly", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Test namespace prefix syntax (namespace:key)
    const prefixedKeys = [
      { prefixed: "common:app.name", ns: "common", key: "app.name" },
      { prefixed: "orders:title", ns: "orders", key: "title" },
      { prefixed: "suppliers:title", ns: "suppliers", key: "title" },
      { prefixed: "settings:title", ns: "settings", key: "title" },
    ];

    // Property: Prefixed keys should resolve to same value as explicit namespace parameter
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...prefixedKeys),
        async ({ prefixed, ns, key }) => {
          const prefixedResult = (i18n.t as any)(prefixed);
          const explicitResult = (i18n.t as any)(key, { ns });

          // Both methods should return the same translation
          expect(prefixedResult).toBe(explicitResult);
          // Should not return the key itself
          expect(prefixedResult).not.toBe(key);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should use default namespace when none specified", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Keys that exist in the default namespace (common)
    const defaultNamespaceKeys = [
      "app.name",
      "navigation.home",
      "actions.save",
      "messages.loading",
    ];

    // Property: Keys without namespace should use default namespace
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...defaultNamespaceKeys),
        async (key) => {
          const withoutNs = (i18n.t as any)(key);
          const withExplicitNs = (i18n.t as any)(key, { ns: "common" });

          // Should return the same value
          expect(withoutNs).toBe(withExplicitNs);
          // Should not return the key itself
          expect(withoutNs).not.toBe(key);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle namespace fallback correctly", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Keys that exist in common namespace (fallback)
    const fallbackKeys = [
      { key: "actions.save", ns: "orders" },
      { key: "actions.cancel", ns: "suppliers" },
      { key: "actions.delete", ns: "settings" },
    ];

    // Property: If key doesn't exist in specified namespace, should fall back to common
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...fallbackKeys),
        async ({ key, ns }) => {
          const result = (i18n.t as any)(key, { ns });

          // Should return a valid translation (not the key)
          expect(result).not.toBe(key);
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain namespace isolation across language switches", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Property: Namespace isolation should work in both languages
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("en", "ar"),
        fc.constantFrom("orders", "suppliers", "settings"),
        async (locale, namespace) => {
          await i18n.changeLanguage(locale);

          // Get a translation from the specified namespace
          const result = (i18n.t as any)("title", { ns: namespace });

          // Should return a valid translation
          expect(result).not.toBe("title");
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle nested keys with namespace isolation", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Ensure we're in English
    await i18n.changeLanguage("en");

    // Nested keys in different namespaces
    const nestedKeys = [
      { ns: "common", key: "app.name", expected: "MediTrack" },
      {
        ns: "common",
        key: "app.tagline",
        expected: "Comprehensive Pharmacy Management",
      },
      { ns: "suppliers", key: "form.addTitle", expected: "Add New Supplier" },
      { ns: "settings", key: "categories.general", expected: "General" },
    ];

    // Property: Nested keys should respect namespace boundaries
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...nestedKeys),
        async ({ ns, key, expected }) => {
          const result = (i18n.t as any)(key, { ns });
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle multiple namespace specifications consistently", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Property: Multiple calls with same namespace should return same result
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("common", "orders", "suppliers", "settings"),
        fc.constantFrom("title", "description"),
        async (namespace, key) => {
          const result1 = (i18n.t as any)(key, { ns: namespace });
          const result2 = (i18n.t as any)(key, { ns: namespace });
          const result3 = (i18n.t as any)(key, { ns: namespace });

          // All calls should return the same value
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle invalid namespace gracefully", async () => {
    const i18n = (await import("../config/i18n-config")).i18n;

    // Generate arbitrary invalid namespace names
    const invalidNamespaceArbitrary = fc
      .string({ minLength: 5, maxLength: 15 })
      .filter(
        (s) =>
          ![
            "common",
            "orders",
            "suppliers",
            "settings",
            "reports",
            "validation",
            "home",
          ].includes(s),
      );

    // Property: Invalid namespaces should fall back gracefully
    await fc.assert(
      fc.asyncProperty(invalidNamespaceArbitrary, async (invalidNs) => {
        // Should not crash
        const result = (i18n.t as any)("app.name", { ns: invalidNs });

        // Should either return the key or fall back to common namespace
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }),
      { numRuns: 50 },
    );
  });
});
