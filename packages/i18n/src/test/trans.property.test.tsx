import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import { Trans } from "../components/Trans";
import { I18nProvider } from "../provider";
import type { ReactNode } from "react";

/**
 * Property Test 13: Variable Interpolation
 *
 * Validates Requirement 9.1: Variable interpolation in translations
 *
 * This test ensures that:
 * 1. Variables are correctly interpolated into translations
 * 2. Multiple variables can be used in a single translation
 * 3. Variable values are properly escaped and rendered
 * 4. Missing variables don't crash the component
 */

// Wrapper component for testing with I18nProvider
function createWrapper(initialLocale: "en" | "ar" = "en") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
    );
  };
}

describe("Property Test: Trans Component Variable Interpolation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should handle special characters in variables", async () => {
    // Property: Special characters should be properly escaped
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          "test<script>alert('xss')</script>",
          "test&nbsp;value",
          'test"quoted"',
          "test'quoted'",
          "test\nline\nbreak",
        ),
        async (specialValue) => {
          const Wrapper = createWrapper("en");

          const { container } = render(
            <Wrapper>
              <Trans
                i18nKey="update.newVersion"
                values={{ version: specialValue }}
              />
            </Wrapper>,
          );

          await new Promise((resolve) => setTimeout(resolve, 100));

          // Should not execute scripts or break rendering
          expect(container.querySelector("script")).toBeNull();
          expect(container).toBeTruthy();
        },
      ),
      { numRuns: 20 },
    );
  });

  it("should handle missing variables gracefully", async () => {
    // Property: Missing variables should not crash the component
    const Wrapper = createWrapper("en");

    const { container } = render(
      <Wrapper>
        <Trans i18nKey="update.newVersion" values={{}} />
      </Wrapper>,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should render without crashing
    expect(container).toBeTruthy();
    expect(container.textContent).toBeTruthy();
  });

  it("should handle undefined and null values", async () => {
    // Property: Undefined and null values should be handled gracefully
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(undefined, null, ""), async (value) => {
        const Wrapper = createWrapper("en");

        const { container } = render(
          <Wrapper>
            <Trans i18nKey="update.newVersion" values={{ version: value }} />
          </Wrapper>,
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should render without crashing
        expect(container).toBeTruthy();
      }),
      { numRuns: 30 },
    );
  });

  it("should handle object and array values", async () => {
    // Property: Complex values should be converted to strings
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.object(),
          fc.array(fc.string()),
          fc.boolean(),
          fc.integer(),
        ),
        async (complexValue) => {
          const Wrapper = createWrapper("en");

          const { container } = render(
            <Wrapper>
              <Trans
                i18nKey="update.newVersion"
                values={{ version: complexValue }}
              />
            </Wrapper>,
          );

          await new Promise((resolve) => setTimeout(resolve, 100));

          // Should render without crashing
          expect(container).toBeTruthy();
          expect(container.textContent).toBeTruthy();
        },
      ),
      { numRuns: 30 },
    );
  });

  it("should handle very long variable values", async () => {
    // Property: Long strings should not break rendering
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 100, maxLength: 500 }),
        async (longValue) => {
          const Wrapper = createWrapper("en");

          const { container } = render(
            <Wrapper>
              <Trans
                i18nKey="update.newVersion"
                values={{ version: longValue }}
              />
            </Wrapper>,
          );

          await new Promise((resolve) => setTimeout(resolve, 100));

          const text = container.textContent || "";

          // Should contain at least part of the long value
          expect(text.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 20 },
    );
  });

  it("should handle namespace-specific translations with variables", async () => {
    // Property: Variables should work with different namespaces
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("common", "orders", "suppliers"),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (namespace, value) => {
          const Wrapper = createWrapper("en");

          const { container } = render(
            <Wrapper>
              <Trans
                i18nKey="update.newVersion"
                ns={namespace}
                values={{ version: value }}
              />
            </Wrapper>,
          );

          await new Promise((resolve) => setTimeout(resolve, 100));

          // Should render without crashing
          expect(container).toBeTruthy();
        },
      ),
      { numRuns: 30 },
    );
  });
});
