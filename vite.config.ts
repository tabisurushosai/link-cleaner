import { resolve } from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
  publicDir: resolve(__dirname, "public"),
  build: {
    copyPublicDir: true,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: { popup: resolve(__dirname, "popup.html") },
      output: { entryFileNames: "[name].js" },
    },
  },
});
