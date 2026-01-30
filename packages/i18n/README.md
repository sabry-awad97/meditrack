# @meditrack/i18n

Type-safe internationalization (i18n) package for React applications with full TypeScript support, RTL/LTR layouts, and seamless integration with Zod validation and TanStack Router.

## Features

- ✅ **Type-Safe**: Full TypeScript autocomplete for translation keys
- 🌍 **Multi-Language**: Support for Arabic (RTL) and English (LTR)
- 📦 **Namespace Organization**: Organize translations by feature domain
- ⚡ **Performance**: Lazy loading and caching of translations
- 🎨 **React Integration**: Simple hooks and components
- ✔️ **Zod Integration**: Localized validation error messages
- 🔄 **Router Integration**: Locale-aware routing utilities
- 🎯 **Developer Experience**: CLI tools and development warnings

## Installation

```bash
bun add @meditrack/i18n
```

## Quick Start

### 1. Wrap your app with I18nProvider

```tsx
import { I18nProvider } from "@meditrack/i18n";

function App() {
  return (
    <I18nProvider defaultLocale="en">
      <YourApp />
    </I18nProvider>
  );
}
```

### 2. Use translations in components

```tsx
import { useTranslation } from "@meditrack/i18n";

function MyComponent() {
  const { t } = useTranslation("common");

  return (
    <div>
      <h1>{t("app.name")}</h1>
      <p>{t("app.tagline")}</p>
    </div>
  );
}
```

### 3. Switch languages

```tsx
import { LanguageSwitcher } from "@meditrack/i18n";

function Header() {
  return (
    <header>
      <LanguageSwitcher variant="dropdown" showFlags showNativeNames />
    </header>
  );
}
```

## API Reference

### Hooks

#### `useTranslation(namespace?)`

Access translations in components.

```tsx
const { t, i18n, ready } = useTranslation("orders");

// Use translations
<h1>{t("title")}</h1>
<p>{t("fields.customerName")}</p>

// With interpolation
<p>{t("messages.orderCreated", { id: "123" })}</p>
```

#### `useLocale()`

Manage the current locale.

```tsx
const { locale, setLocale, availableLocales } = useLocale();

// Change language
await setLocale("ar");

// Get current locale
console.log(locale); // "en" or "ar"
```

#### `useDirection()`

Access text direction for conditional styling.

```tsx
const { direction, isRTL, isLTR } = useDirection();

<div style={{ textAlign: isRTL ? "right" : "left" }}>Content</div>;
```

### Components

#### `<Trans />`

Complex translations with JSX elements.

```tsx
<Trans
  i18nKey="welcome"
  values={{ name: "John" }}
  components={{ bold: <strong /> }}
/>
```

#### `<LanguageSwitcher />`

UI component for switching languages.

```tsx
<LanguageSwitcher
  variant="dropdown" // or "buttons"
  showFlags={true}
  showNativeNames={true}
  className="my-custom-class"
/>
```

### Utilities

#### Formatting

```tsx
import { formatDate, formatNumber, formatCurrency } from "@meditrack/i18n";

// Format date
formatDate(new Date(), "ar"); // "١٥ يناير ٢٠٢٦"

// Format number
formatNumber(1234.56, "en"); // "1,234.56"

// Format currency
formatCurrency(99.99, "en", "USD"); // "$99.99"
```

#### Zod Integration

```tsx
import { useTranslation } from "@meditrack/i18n";
import { createZodErrorMap } from "@meditrack/i18n";
import { z } from "zod";

function MyForm() {
  const { t } = useTranslation("validation");

  // Set global error map
  z.setErrorMap(createZodErrorMap(t));

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  // Validation errors will now be localized
}
```

#### Router Integration

```tsx
import { getLocaleFromPath, localizedPath } from "@meditrack/i18n";

// Extract locale from URL
const locale = getLocaleFromPath("/en/dashboard"); // "en"

// Generate localized path
const path = localizedPath("/dashboard", "ar"); // "/ar/dashboard"
```

## Translation Files

Translations are organized by namespace:

```
locales/
├── en/
│   ├── common.json
│   ├── orders.json
│   ├── suppliers.json
│   ├── settings.json
│   └── validation.json
└── ar/
    ├── common.json
    ├── orders.json
    ├── suppliers.json
    ├── settings.json
    └── validation.json
```

### Example Translation File

```json
{
  "app": {
    "name": "MediTrack",
    "tagline": "Comprehensive Pharmacy Management"
  },
  "navigation": {
    "home": "Home",
    "orders": "Orders",
    "suppliers": "Suppliers"
  }
}
```

## Adding New Translations

1. Add keys to English translation files (`locales/en/*.json`)
2. Add corresponding Arabic translations (`locales/ar/*.json`)
3. Run type generation: `bun run generate-types`
4. TypeScript will now provide autocomplete for new keys

## Development Tools

### Generate Types

```bash
bun run generate-types
```

Generates TypeScript definitions from translation files for autocomplete support.

### Missing Translation Warnings

In development mode, missing translations are logged to the console and collected in a registry.

```tsx
import { missingTranslations } from "@meditrack/i18n";

// View missing translations
console.log(Array.from(missingTranslations));
```

## Migration Guide

### Migrating Hardcoded Strings

1. **Identify hardcoded strings** in your components
2. **Add translation keys** to appropriate namespace files
3. **Replace strings** with `t()` function calls
4. **Test** in both languages

Example:

```tsx
// Before
<h1>Orders</h1>;

// After
const { t } = useTranslation("orders");
<h1>{t("title")}</h1>;
```

### Migrating Zod Schemas

```tsx
// Before
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

// After
import { createZodErrorMap } from "@meditrack/i18n";

const { t } = useTranslation("validation");
z.setErrorMap(createZodErrorMap(t));

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
```

## Best Practices

1. **Use namespaces** to organize translations by feature
2. **Keep keys descriptive** and hierarchical (e.g., `orders.fields.customerName`)
3. **Set error map once** at the app root for Zod integration
4. **Test RTL layout** when adding new UI components
5. **Run type generation** after adding new translation keys

## License

MIT
