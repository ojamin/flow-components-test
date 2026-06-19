import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

import { createComponentPackageAliases } from "./tooling/vite-package-aliases.js";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: createComponentPackageAliases(),
    dedupe: ["vue"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.{test,spec}.ts", "preview-app/src/**/*.{test,spec}.ts"],
    exclude: ["dist/**", "node_modules/**"],
  },
});
