import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

// Preview-app-local CSS entry. Owns the Tailwind v4 engine setup
// (`@import "tailwindcss"`), the shadcn-compatible semantic token aliases,
// the `@source` glob for preview-app shell files, and the light/dark
// palette values. Must load BEFORE the package runtime CSS so the engine
// is initialized when the package `@source`/`@theme` rules are processed.
import "./styles/preview-app.css";
// Package-owned runtime CSS surface. Includes Tailwind `@source` globs for
// package renderers/config panels/SDK, the `--ct-*` component-theme alias
// slots, MapLibre base structure, and the `data-vmap1-map-canvas` overlay
// hardening. Intentionally palette-agnostic; preview-app local CSS above
// supplies engine setup and shell palette.
import "@flow-builder/components/styles/component-runtime.css";
import App from "./App.vue";
import { routes } from "./routes/index";

// Use hash history so the built app works when opened directly from the filesystem.
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
