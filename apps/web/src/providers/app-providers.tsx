import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useDirection, useLocale } from "@meditrack/i18n";
import { QueryProvider } from "./query-provider";
import { ZodProvider } from "./zod-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { useEffect } from "react";
import type { Locale } from "@meditrack/i18n";
import { useNotifications, useAutoArchive, useSettingValue } from "@/hooks";
import { useTheme } from "@/components/theme-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

function AppContent({ children }: { children: React.ReactNode }) {
  const direction = useDirection();
  const { setLocale } = useLocale();
  const { setTheme } = useTheme();

  // Load settings from PostgreSQL
  const defaultLanguage = useSettingValue<Locale>("defaultLanguage", "en");
  const defaultTheme = useSettingValue<"light" | "dark" | "system">(
    "defaultTheme",
    "system",
  );

  // Initialize notification system
  useNotifications();

  // Initialize auto-archive system
  useAutoArchive();

  // Sync language from database
  useEffect(() => {
    if (
      defaultLanguage &&
      (defaultLanguage === "en" || defaultLanguage === "ar")
    ) {
      console.log("✅ Syncing language from database:", defaultLanguage);
      setLocale(defaultLanguage);
    }
  }, [defaultLanguage, setLocale]);

  // Sync theme from database
  useEffect(() => {
    if (
      defaultTheme &&
      (defaultTheme === "light" ||
        defaultTheme === "dark" ||
        defaultTheme === "system")
    ) {
      console.log("✅ Syncing theme from database:", defaultTheme);
      setTheme(defaultTheme);
    }
  }, [defaultTheme, setTheme]);

  return (
    <>
      {children}
      <Toaster
        richColors
        position="top-center"
        dir={direction.isRTL ? "rtl" : "ltr"}
      />
    </>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nProvider initialLocale="en">
      <ZodProvider>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
          >
            <AuthProvider>
              <AppContent>{children}</AppContent>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </ZodProvider>
    </I18nProvider>
  );
}
