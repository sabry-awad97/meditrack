import { createZodErrorMap } from "@meditrack/i18n";
import { useTranslation } from "@meditrack/i18n";
import { useEffect } from "react";
import { z } from "zod/v3";

interface ZodProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that sets up global Zod error map with i18n translations
 * Updates the error map whenever the language changes
 */
export function ZodProvider({ children }: ZodProviderProps) {
  const { t, i18n } = useTranslation("validation");

  useEffect(() => {
    // Set global Zod error map
    const errorMap = createZodErrorMap(t);
    z.setErrorMap(errorMap);
  }, [t, i18n.language]); // Re-run when language changes

  return <>{children}</>;
}
