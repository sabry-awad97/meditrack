import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { I18nProvider, useTranslation } from "@medi-order/i18n";
import { ZodProvider } from "@/providers/zod-provider";
import { z } from "zod";
import { useState } from "react";
import {
  OrderFormDataSchema,
  MedicineSchema,
  SupplierFormDataSchema,
} from "@/lib/types";

// Simple test component that validates on button click
function ValidationDemoComponent() {
  const [errors, setErrors] = useState<string[]>([]);
  const { i18n } = useTranslation();

  const validateOrder = () => {
    const invalidData = {
      customerName: "",
      phoneNumber: "",
      medicines: [],
      notes: "",
    };

    const result = OrderFormDataSchema.safeParse(invalidData);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
    }
  };

  const validateMedicine = () => {
    const invalidMedicine = {
      id: "test-id",
      name: "",
      concentration: "500mg",
      form: "أقراص",
      quantity: 1,
    };

    const result = MedicineSchema.safeParse(invalidMedicine);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
    }
  };

  const validateSupplier = () => {
    const invalidSupplier = {
      name: "Supplier",
      phone: "0501234567",
      email: "invalid-email",
      commonMedicines: [],
      notes: "",
    };

    const result = SupplierFormDataSchema.safeParse(invalidSupplier);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
    }
  };

  const switchLanguage = async (lang: "ar" | "en") => {
    await i18n.changeLanguage(lang);
    setErrors([]); // Clear errors when switching language
  };

  return (
    <div>
      <div data-testid="locale">{i18n.language}</div>
      <button onClick={validateOrder} data-testid="validate-order">
        Validate Order
      </button>
      <button onClick={validateMedicine} data-testid="validate-medicine">
        Validate Medicine
      </button>
      <button onClick={validateSupplier} data-testid="validate-supplier">
        Validate Supplier
      </button>
      <button onClick={() => switchLanguage("ar")} data-testid="switch-ar">
        Switch to Arabic
      </button>
      <button onClick={() => switchLanguage("en")} data-testid="switch-en">
        Switch to English
      </button>
      {errors.length > 0 && (
        <ul data-testid="errors">
          {errors.map((error, index) => (
            <li key={index} data-testid={`error-${index}`}>
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Wrapper with providers
function TestWrapper({
  children,
  locale = "ar",
}: {
  children: React.ReactNode;
  locale?: "ar" | "en";
}) {
  return (
    <I18nProvider defaultLocale={locale}>
      <ZodProvider>{children}</ZodProvider>
    </I18nProvider>
  );
}

describe("Zod i18n Integration - Simple Tests", () => {
  it("should display validation errors in Arabic by default", async () => {
    render(
      <TestWrapper locale="ar">
        <ValidationDemoComponent />
      </TestWrapper>,
    );

    // Wait for i18n to initialize
    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    });

    // Trigger validation
    act(() => {
      screen.getByTestId("validate-order").click();
    });

    // Check for errors
    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      expect(errors).toBeInTheDocument();
    });

    // Get error messages
    const errorElements = screen.getAllByTestId(/^error-/);
    expect(errorElements.length).toBeGreaterThan(0);

    // Log errors for debugging
    const errorTexts = errorElements.map((el) => el.textContent);
    console.log("Arabic errors:", errorTexts);

    // At least one error should contain Arabic text
    const hasArabicText = errorTexts.some((text) =>
      /[\u0600-\u06FF]/.test(text || ""),
    );
    expect(hasArabicText).toBe(true);
  });

  it("should display validation errors in English", async () => {
    render(
      <TestWrapper locale="en">
        <ValidationDemoComponent />
      </TestWrapper>,
    );

    // Wait for i18n to initialize
    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
    });

    // Trigger validation
    act(() => {
      screen.getByTestId("validate-order").click();
    });

    // Check for errors
    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      expect(errors).toBeInTheDocument();
    });

    // Get error messages
    const errorElements = screen.getAllByTestId(/^error-/);
    expect(errorElements.length).toBeGreaterThan(0);

    // Log errors for debugging
    const errorTexts = errorElements.map((el) => el.textContent);
    console.log("English errors:", errorTexts);

    // Errors should be in English (no Arabic characters)
    const hasArabicText = errorTexts.some((text) =>
      /[\u0600-\u06FF]/.test(text || ""),
    );
    expect(hasArabicText).toBe(false);
  });

  it("should update error messages when language changes", async () => {
    render(
      <TestWrapper locale="ar">
        <ValidationDemoComponent />
      </TestWrapper>,
    );

    // Wait for i18n to initialize
    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    });

    // Validate in Arabic
    act(() => {
      screen.getByTestId("validate-order").click();
    });

    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      expect(errors).toBeInTheDocument();
    });

    let errorTexts = screen
      .getAllByTestId(/^error-/)
      .map((el) => el.textContent);
    console.log("Arabic errors:", errorTexts);

    // Should have Arabic text
    let hasArabicText = errorTexts.some((text) =>
      /[\u0600-\u06FF]/.test(text || ""),
    );
    expect(hasArabicText).toBe(true);

    // Switch to English
    await act(async () => {
      screen.getByTestId("switch-en").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
    });

    // Validate again in English
    act(() => {
      screen.getByTestId("validate-order").click();
    });

    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      expect(errors).toBeInTheDocument();
    });

    errorTexts = screen.getAllByTestId(/^error-/).map((el) => el.textContent);
    console.log("English errors after switch:", errorTexts);

    // Should NOT have Arabic text
    hasArabicText = errorTexts.some((text) =>
      /[\u0600-\u06FF]/.test(text || ""),
    );
    expect(hasArabicText).toBe(false);
  });

  it("should validate medicine schema with localized errors", async () => {
    render(
      <TestWrapper locale="ar">
        <ValidationDemoComponent />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("ar");
    });

    act(() => {
      screen.getByTestId("validate-medicine").click();
    });

    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      expect(errors).toBeInTheDocument();
    });

    const errorElements = screen.getAllByTestId(/^error-/);
    expect(errorElements.length).toBeGreaterThan(0);

    const errorTexts = errorElements.map((el) => el.textContent);
    console.log("Medicine validation errors:", errorTexts);

    // Should have Arabic text
    const hasArabicText = errorTexts.some((text) =>
      /[\u0600-\u06FF]/.test(text || ""),
    );
    expect(hasArabicText).toBe(true);
  });

  it("should validate supplier schema with localized errors", async () => {
    render(
      <TestWrapper locale="en">
        <ValidationDemoComponent />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
    });

    act(() => {
      screen.getByTestId("validate-supplier").click();
    });

    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      expect(errors).toBeInTheDocument();
    });

    const errorElements = screen.getAllByTestId(/^error-/);
    expect(errorElements.length).toBeGreaterThan(0);

    const errorTexts = errorElements.map((el) => el.textContent);
    console.log("Supplier validation errors:", errorTexts);

    // Should NOT have Arabic text (English locale)
    const hasArabicText = errorTexts.some((text) =>
      /[\u0600-\u06FF]/.test(text || ""),
    );
    expect(hasArabicText).toBe(false);
  });
});
