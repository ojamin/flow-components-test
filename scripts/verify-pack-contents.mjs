#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(packageDir, "package.json"), "utf8"));
const dryRun = process.argv.includes("--dry-run");

function runNpmPack() {
  const result = spawnSync("npm", ["pack", "--json", ...(dryRun ? ["--dry-run"] : [])], {
    cwd: packageDir,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stdout.write(result.stdout);
    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

function parsePackJson(output) {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`npm pack did not produce JSON output. Output: ${output}`);
  }
  return JSON.parse(output.slice(start, end + 1));
}

const pack = parsePackJson(runNpmPack())[0];
const filePaths = pack.files.map((file) => file.path.replace(/\\/g, "/"));
const fileSet = new Set(filePaths);
const issues = [];

function requireFile(path, reason) {
  if (!fileSet.has(path)) issues.push(`Missing ${reason}: ${path}`);
}

function requireExportTarget(exportKey, target) {
  const path = target.replace(/^\.\//, "");
  requireFile(path, `export target for ${exportKey}`);
  if (path.endsWith(".js"))
    requireFile(`${path.slice(0, -3)}.d.ts`, `declaration for ${exportKey}`);
}

requireFile("package.json", "package metadata");
requireFile("README.md", "readme");
requireFile("CHANGELOG.md", "package changelog");
requireFile("dist/styles/component-runtime.css", "runtime CSS");
requireFile("dist/generated/catalog.js", "generated catalog JS");
requireFile("dist/generated/catalog.d.ts", "generated catalog declaration");
requireFile("dist/generated/source-manifest.js", "generated source manifest JS");
requireFile("dist/generated/source-manifest.d.ts", "generated source manifest declaration");
requireFile("dist/generated/source-files.js", "generated source files JS");
requireFile("dist/generated/source-files.d.ts", "generated source files declaration");

for (const [exportKey, target] of Object.entries(packageJson.exports ?? {})) {
  if (typeof target !== "string") {
    issues.push(`Export ${exportKey} must use a direct string target for pack verification.`);
    continue;
  }
  requireExportTarget(exportKey, target);
}

const hasRenderer = filePaths.some((path) => /^dist\/groups\/.+\/Renderer\.js$/.test(path));
const hasConfigPanel = filePaths.some((path) => /^dist\/groups\/.+\/ConfigPanel\.js$/.test(path));
const hasFixture = filePaths.some((path) => /^dist\/groups\/.+\/fixtures\/.+\.js$/.test(path));

if (!hasRenderer)
  issues.push(
    "Pack output must include built lazy renderer modules under dist/groups/**/Renderer.js.",
  );
if (!hasConfigPanel)
  issues.push(
    "Pack output must include built lazy config-panel modules under dist/groups/**/ConfigPanel.js.",
  );
if (!hasFixture)
  issues.push(
    "Pack output must include built lazy fixture modules under dist/groups/**/fixtures/*.js.",
  );

const disallowedPatterns = [
  [/^src\//, "raw source under src/"],
  [/^preview-app\//, "preview app source/build artifacts"],
  [/^dist\/preview-app\//, "preview app build artifacts"],
  [/^scripts\//, "package-local scripts"],
  [/^tooling\//, "package-local tooling"],
  [/^test(s)?\//, "test directories"],
  [/(^|\/)__tests__(\/|$)/, "__tests__ directories"],
  [/(^|\/)(?:tests)(\/|$)/, "tests directories"],
  [/\.(?:test|spec)\.(?:js|mjs|ts|tsx|vue)$/, "test/spec files"],
  [/\.map$/, "source maps"],
  [/\.tsbuildinfo$/, "TypeScript build metadata"],
  [/(^|\/)\.env(?:\.|$)/, "environment files"],
  [/(^|\/)(?:credentials?|secrets?)\.(?:json|ya?ml|env|txt)$/i, "credential/secret files"],
  [/(^|\/)\.npmrc$/, "npm credentials/config"],
  [/(^|\/)node_modules\//, "node_modules"],
];

for (const path of filePaths) {
  for (const [pattern, label] of disallowedPatterns) {
    if (pattern.test(path)) issues.push(`Unexpected ${label} in pack output: ${path}`);
  }
}

if (issues.length > 0) {
  console.error(issues.map((issue) => `- ${issue}`).join("\n"));
  process.exit(1);
}

console.log(
  `Verified ${filePaths.length} packed files for ${packageJson.name}; payload is dist/docs/metadata only.`,
);
