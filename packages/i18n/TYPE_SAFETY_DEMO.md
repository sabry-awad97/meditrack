# useTranslation Type Safety Demo

The `useTranslation` hook now supports optional namespace parameter with full type safety.

## Usage Examples

### With Namespace (Type-Safe)

```tsx
import { useTranslation } from "@meditrack/i18n";

function OrdersPage() {
  // TypeScript knows this is the "orders" namespace
  const { t } = useTranslation("orders");

  // ✅ Valid: "page.title" exists in orders.json
  return <h1>{t("page.title")}</h1>;

  // ❌ TypeScript error: "invalidKey" doesn't exist in orders.json
  // return <h1>{t("invalidKey")}</h1>;
}
```

### Without Namespace (Defaults to "common")

```tsx
import { useTranslation } from "@meditrack/i18n";

function Header() {
  // Defaults to "common" namespace
  const { t } = useTranslation();

  // ✅ Valid: "appName" exists in common.json
  return <h1>{t("appName")}</h1>;

  // ❌ TypeScript error: "page.title" doesn't exist in common.json
  // return <h1>{t("page.title")}</h1>;
}
```

### Multiple Namespaces

```tsx
import { useTranslation } from "@meditrack/i18n";

function MyComponent() {
  const { t: tCommon } = useTranslation("common");
  const { t: tOrders } = useTranslation("orders");

  return (
    <div>
      <h1>{tCommon("appName")}</h1>
      <h2>{tOrders("page.title")}</h2>
    </div>
  );
}
```

## Available Namespaces

- `common` - Common translations (navigation, actions, messages, etc.)
- `home` - Home page translations
- `orders` - Orders/special-orders page translations
- `suppliers` - Suppliers page translations
- `reports` - Reports page translations
- `settings` - Settings page translations
- `validation` - Validation error messages

## Type Safety Features

1. **Namespace Validation**: TypeScript ensures you only use valid namespace names
2. **Key Validation**: TypeScript ensures translation keys exist in the specified namespace
3. **Nested Key Support**: Full support for nested keys like `"page.title"` or `"stats.total"`
4. **Interpolation Support**: Type-safe interpolation with `t("key", { variable: value })`
5. **Default Namespace**: When no namespace is provided, defaults to `"common"`

## Return Type

The hook returns an object with:

- `t`: Translation function (type-safe based on namespace)
- `i18n`: i18next instance
- `ready`: Boolean indicating if translations are loaded
