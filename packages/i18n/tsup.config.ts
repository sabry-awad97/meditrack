import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  external: ["react", "react-dom", "zod"],
  loader: {
    ".json": "copy",
  },
  onSuccess: async () => {
    // Copy locale files to dist
    const { copyFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");

    const locales = ["en", "ar"];
    const namespaces = [
      "common",
      "orders",
      "suppliers",
      "settings",
      "validation",
    ];

    for (const locale of locales) {
      await mkdir(join("dist", "locales", locale), { recursive: true });
      for (const namespace of namespaces) {
        try {
          await copyFile(
            join("src", "locales", locale, `${namespace}.json`),
            join("dist", "locales", locale, `${namespace}.json`),
          );
        } catch (error) {
          console.warn(`Warning: Could not copy ${locale}/${namespace}.json`);
        }
      }
    }
  },
});
