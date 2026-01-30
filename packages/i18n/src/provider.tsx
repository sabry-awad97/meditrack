import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import type { Locale } from "./types";
import { initializeI18n, i18n, setStoredLocale } from "./config/i18n-config";
import { getDirection } from "./config/locales";

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
  initialLocale?: Locale;
  fallbackLocale?: Locale;
  availableLocales?: Locale[];
  debug?: boolean;
}

interface ErrorBoundaryProps {
  error: Error;
  onRetry: () => void;
}

function ErrorBoundary({ error, onRetry }: ErrorBoundaryProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Failed to load translations
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        {error.message || "An error occurred while loading the application"}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "3rem",
          height: "3rem",
          border: "4px solid #e5e7eb",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function updateDocumentAttributes(locale: Locale) {
  const direction = getDirection(locale);
  document.documentElement.dir = direction;
  document.documentElement.lang = locale;
}

export function I18nProvider({
  children,
  defaultLocale,
  initialLocale,
}: I18nProviderProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeI18n(initialLocale || defaultLocale)
      .then(() => {
        updateDocumentAttributes(i18n.language as Locale);
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Failed to initialize i18n:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, [defaultLocale, initialLocale]);

  // Listen for language changes and update document attributes
  useEffect(() => {
    if (!isReady) return;

    const handleLanguageChange = (lng: string) => {
      const locale = lng as Locale;
      updateDocumentAttributes(locale);
      setStoredLocale(locale);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [isReady]);

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={() => {
          setError(null);
          setIsReady(false);
          window.location.reload();
        }}
      />
    );
  }

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
