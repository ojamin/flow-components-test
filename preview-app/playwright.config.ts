import { existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import { defineConfig, devices } from "@playwright/test";

// Module intent: package-local Playwright config for the preview-app
// visual/state regression lane (`npm run test:visual-state`).
//
// Browser policy:
//   - The lane MUST reuse the system Chrome/Chromium provided by AIC or by a
//     standalone CI runner. It does not run `playwright install` and does not
//     download browser binaries into the repository or into the package.
//   - `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` overrides the path explicitly.
//     Otherwise we fall back to the AIC default at `/opt/google/chrome/chrome`
//     when present. If no system Chrome is available, Playwright will refuse
//     to launch; that surfaces the missing-browser case loudly instead of
//     silently triggering a download.
//
// Web-server policy:
//   - The lane serves the already-built preview app (`vp preview`) instead of
//     the dev server, so screenshots reflect the production bundle and the
//     server starts in <1s after the precondition build.
//   - The npm script (`npm run test:visual-state`) runs `npm run preview:build`
//     before invoking Playwright. We intentionally do not chain the build
//     inside `webServer.command` so the test runner does not block on slow
//     production rebuilds when re-running locally.
//
// Snapshot policy:
//   - Per the Task 4.4 plan, this first lane prefers explicit DOM/state
//     assertions over pixel snapshots. Screenshots are still captured into
//     `playwright-report/` and `test-results/` (both gitignored at the repo
//     root) so contributors can eyeball each cell during review without
//     committing megabytes of PNG churn. A hosted visual-diff service is
//     deferred until contributor volume justifies it.

function readPreviewPort(): number {
  const rawPort = process.env.PLAYWRIGHT_PREVIEW_APP_PORT ?? "4185";

  if (!/^\d{1,5}$/.test(rawPort)) {
    throw new Error("PLAYWRIGHT_PREVIEW_APP_PORT must be a numeric TCP port.");
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PLAYWRIGHT_PREVIEW_APP_PORT must be between 1 and 65535.");
  }

  return port;
}

function readPreviewHost(): string {
  const host = process.env.PLAYWRIGHT_PREVIEW_APP_HOST ?? "127.0.0.1";
  const allowedLoopbackHosts = new Set(["127.0.0.1", "localhost"]);

  if (!allowedLoopbackHosts.has(host)) {
    throw new Error("PLAYWRIGHT_PREVIEW_APP_HOST must be a loopback host: 127.0.0.1 or localhost.");
  }

  return host;
}

const PREVIEW_PORT = readPreviewPort();
const PREVIEW_HOST = readPreviewHost();
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

const systemChromeExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  (existsSync("/opt/google/chrome/chrome") ? "/opt/google/chrome/chrome" : undefined);

const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== "1";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  testDir: "./playwright",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: true,
  // Cap workers to avoid the AIC Playwright runtime-enforcer race observed
  // when all 7 specs spin up `BrowserType.launch` simultaneously. A small
  // worker pool is plenty for this lane (≤10 specs) and keeps cold-start
  // memory under control on lighter CI runners.
  workers: process.env.CI ? 2 : 3,
  failOnFlakyTests: !!process.env.CI,
  // Do not retry this closeout lane: failures should stay visible until there
  // is a durable evidence artifact proving a non-app flake.
  retries: 0,
  reporter: "list",
  // Keep all generated artifacts inside the package so a root `git status` is
  // not polluted. The folder is gitignored at the package level (see
  // `packages/components/.gitignore`).
  outputDir: "./playwright/.artifacts",
  use: {
    baseURL,
    trace: "off",
    // Video capture is intentionally disabled: it requires the Playwright
    // ffmpeg binary, which violates the no-download policy when missing.
    // Screenshots-on-failure plus per-test attached PNGs (see the spec) are
    // sufficient evidence for this lane.
    video: "off",
    screenshot: "only-on-failure",
    // The preview app SPA renders deterministic, animation-light surfaces.
    // Reduced motion keeps any future motion stable for screenshots.
    colorScheme: "light",
    launchOptions: {
      ...(systemChromeExecutable ? { executablePath: systemChromeExecutable } : {}),
      // Defensive: enforce reduced motion at the OS-prefs level so theme
      // transitions never bleed into state screenshots.
      args: ["--force-prefers-reduced-motion"],
    },
  },
  ...(shouldStartWebServer
    ? {
        webServer: {
          command: `npm exec -- vp preview ./preview-app --config ./preview-app/vite.config.js --host ${PREVIEW_HOST} --port ${PREVIEW_PORT} --strictPort`,
          // Resolve from the package root so this config works both when
          // invoked through the monorepo workspace and in a future standalone
          // package checkout with no parent npm workspace.
          cwd: packageRoot,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          stdout: "ignore",
          stderr: "pipe",
          timeout: 60_000,
        },
      }
    : {}),
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
});
