import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@medi-order/i18n";
import { QueryProvider } from "./query-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nProvider defaultLocale="ar">
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          storageKey="pharmacy-theme"
        >
          {children}
          <Toaster richColors position="top-center" dir="rtl" />
        </ThemeProvider>
      </QueryProvider>
    </I18nProvider>
  );
}
