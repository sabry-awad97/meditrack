import React from "react";
import { Trans as I18nextTrans } from "react-i18next";

export interface TransProps {
  i18nKey: string;
  values?: Record<string, any>;
  components?: Record<string, React.ReactElement> | React.ReactElement[];
  ns?: string;
  children?: React.ReactNode;
}

/**
 * Component for complex translations with JSX elements
 *
 * @example
 * ```tsx
 * <Trans
 *   i18nKey="welcome"
 *   values={{ name: "John" }}
 *   components={{ bold: <strong /> }}
 * />
 * ```
 */
export function Trans({
  i18nKey,
  values,
  components,
  ns,
  children,
  ...props
}: TransProps) {
  return (
    <I18nextTrans
      i18nKey={i18nKey}
      values={values}
      components={components as any}
      ns={ns as any}
      {...props}
    >
      {children}
    </I18nextTrans>
  );
}
