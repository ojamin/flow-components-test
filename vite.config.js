import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

import { createComponentPackageAliases } from "./tooling/vite-package-aliases.js";

const libraryEntries = {
  index: "src/index.ts",
  "generated/catalog": "src/generated/catalog.ts",
  "generated/source-manifest": "src/generated/source-manifest.ts",
  "generated/source-files": "src/generated/source-files.ts",
  manifest: "src/manifest.ts",
  "sdk/public-sdk": "src/sdk/public-sdk.ts",
  "sdk/helpers/browser/index": "src/sdk/helpers/browser/index.ts",
  "sdk/helpers/rendering/index": "src/sdk/helpers/rendering/index.ts",
  "sdk/helpers/capabilities/index": "src/sdk/helpers/capabilities/index.ts",
  "sdk/helpers/three-d/index": "src/sdk/helpers/three-d/index.ts",
  "sdk/helpers/interactions/index": "src/sdk/helpers/interactions/index.ts",
  "sdk/helpers/data/index": "src/sdk/helpers/data/index.ts",
  "sdk/helpers/config/index": "src/sdk/helpers/config/index.ts",
  "sdk/theme": "src/sdk/theme.ts",
  "sdk/helpers/sanitization/index": "src/sdk/helpers/sanitization/index.ts",
  "sdk/helpers/markdown/index": "src/sdk/helpers/markdown/index.ts",
  "sdk/component-ui": "src/sdk/component-ui.ts",
  "testing/index": "src/testing/index.ts",
  "sdk/runtime-services/index": "src/sdk/runtime-services/index.ts",
  "shared/view-container/index": "src/shared/view-container/index.ts",
  "shared/nav/index": "src/shared/nav/index.ts",
};

const packageExternalPattern = /^(?!@flow-builder\/components(?:\/|$))(?:@[^/]+\/[^/]+|[^./][^/]*)/;

export default defineConfig({
  logLevel: "silent",
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: createComponentPackageAliases(),
    dedupe: ["vue"],
  },
  build: {
    outDir: process.env.COMPONENT_PACKAGE_OUT_DIR ?? "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: libraryEntries,
      formats: ["es"],
    },
    rollupOptions: {
      external: (id) => packageExternalPattern.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
