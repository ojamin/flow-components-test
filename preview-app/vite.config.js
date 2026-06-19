import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

import { createComponentPackageAliases } from "../tooling/vite-package-aliases.js";

// Resolve an absolute path from a path relative to this config file.
const resolvePath = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url));
const cloudflareTunnelHmrHost = normalizeCloudflareTunnelHost(process.env.CLOUDFLARE_TUNNEL_HOST);
const cloudflareTunnelHmrEnabled = process.env.CLOUDFLARE_TUNNEL_HMR === "1";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    // Allow Cloudflare Quick Tunnels so the preview app can be inspected via tunnel.
    allowedHosts: [".trycloudflare.com"],
    ...(cloudflareTunnelHmrHost
      ? {
          hmr: cloudflareTunnelHmrEnabled
            ? {
                protocol: "wss",
                host: cloudflareTunnelHmrHost,
                clientPort: 443,
              }
            : false,
        }
      : {}),
  },
  resolve: {
    alias: [...createComponentPackageAliases()],
    dedupe: ["vue"],
  },
  build: {
    // Keep preview-app production output outside package `dist/` so npm pack
    // and protected-Git rehearsal artifacts stay limited to library runtime files.
    outDir: resolvePath("../.tmp/preview-app-dist"),
    emptyOutDir: true,
    // Vite+ currently surfaces Rolldown warning diagnostics from third-party
    // dependencies (for example @vueuse PURE annotations) through a binding path
    // that can fail preview production builds. Suppress warning-only dependency
    // annotation logs for this package preview build; actual build failures still
    // surface through thrown errors and non-zero exits.
    rolldownOptions: {
      logLevel: "silent",
    },
  },
});

function normalizeCloudflareTunnelHost(value) {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return (
      value
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .trim() || null
    );
  }
}
