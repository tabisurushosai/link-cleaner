import { cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "vite";

const extensionStaticAssets = ["manifest.json", "icons", "_locales"];

const copyExtensionStaticAssets = () => ({
  name: "copy-extension-static-assets",
  closeBundle() {
    const distDir = resolve(__dirname, "dist");

    mkdirSync(distDir, { recursive: true });

    for (const asset of extensionStaticAssets) {
      cpSync(resolve(__dirname, asset), resolve(distDir, asset), {
        recursive: true,
      });
    }
  },
});

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: { popup: resolve(__dirname, "popup.html") },
      output: { entryFileNames: "[name].js" },
    },
  },
  plugins: [copyExtensionStaticAssets()],
});
