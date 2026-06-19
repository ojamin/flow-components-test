#!/usr/bin/env node

import { access, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(packageDir, "dist");
const stagingDistDir = resolve(packageDir, ".tmp/dist-build");
const backupDistDir = resolve(packageDir, ".tmp/dist-backup");

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: packageDir,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function copyRuntimeCss() {
  const cssTarget = resolve(stagingDistDir, "styles/component-runtime.css");
  await mkdir(dirname(cssTarget), { recursive: true });
  const cssSource = await readFile(resolve(packageDir, "src/styles/component-runtime.css"), "utf8");
  const builtCss = toBuiltRuntimeCss(cssSource);
  validateBuiltRuntimeCss(builtCss);
  await writeFile(cssTarget, builtCss);
}

function toBuiltRuntimeCss(source) {
  const builtCss = source
    .replace('@source "../groups/*/*/*.vue";', '@source "../groups/*/*/*.js";')
    .replace(/@source "\.\.\/\.\.\/dist\/(.+?)";/g, '@source "../$1";')
    .replace(/@source "\.\.\/groups\/(.+?)\.ts";/g, '@source "../groups/$1.js";')
    .replace('@source "../sdk/*.vue";', '@source "../sdk/*.js";')
    .replace('@source "../sdk/*.ts";', '@source "../sdk/*.js";')
    .replace(
      '@source "../sdk/component-ui/**/*.{ts,vue}";',
      '@source "../sdk/component-ui/**/*.js";',
    )
    .replace('@source "../sdk/runtime-services/*.ts";', '@source "../sdk/runtime-services/*.js";')
    .replace(
      '@source "../shared/view-container/index.ts";',
      '@source "../shared/view-container/index.js";',
    )
    .replace('@source "../themes/*.ts";', '@source "../themes/*.js";');
  return dedupeSourceDirectives(builtCss);
}

function dedupeSourceDirectives(css) {
  const seen = new Set();
  return css
    .split("\n")
    .filter((line) => {
      const directive = line.trim();
      if (!directive.startsWith("@source")) return true;
      if (seen.has(directive)) return false;
      seen.add(directive);
      return true;
    })
    .join("\n");
}

function validateBuiltRuntimeCss(css) {
  const staleSourceDirectives = css
    .split("\n")
    .filter((line) => line.trim().startsWith("@source") && /\.(?:ts|vue)(?:["'};,]|$)/.test(line));
  if (staleSourceDirectives.length > 0) {
    console.error("Built runtime CSS still references source-only TypeScript/Vue files:");
    console.error(staleSourceDirectives.map((line) => `- ${line.trim()}`).join("\n"));
    process.exit(1);
  }

  const unsafeSourceDirectives = css
    .split("\n")
    .filter((line) => line.trim().startsWith("@source"))
    .filter(
      (line) => /\.\.\/groups\/\*\*\/\*\.js/.test(line) || /\/(?:tests|fixtures)\//.test(line),
    );
  if (unsafeSourceDirectives.length > 0) {
    console.error("Built runtime CSS references broad JS or test/fixture source globs:");
    console.error(unsafeSourceDirectives.map((line) => `- ${line.trim()}`).join("\n"));
    process.exit(1);
  }
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function ensureVueDeclarationStub(absoluteBase) {
  const declarationPath = `${absoluteBase}.d.ts`;
  if (await fileExists(declarationPath)) return;
  await writeFile(
    declarationPath,
    'import type { DefineComponent } from "vue";\n\ndeclare const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;\nexport default component;\n',
  );
}

async function resolveDeclarationSpecifier(fromFile, specifier) {
  const extension = extname(specifier);
  if (extension && extension !== ".ts" && extension !== ".vue") return specifier;

  const withoutExtension =
    extension === ".ts"
      ? specifier.slice(0, -3)
      : extension === ".vue"
        ? specifier.slice(0, -4)
        : specifier;
  const absoluteBase = resolve(dirname(fromFile), withoutExtension);
  if (extension === ".vue") {
    await ensureVueDeclarationStub(absoluteBase);
    return `${withoutExtension}.js`;
  }
  if (await fileExists(`${absoluteBase}.d.ts`)) return `${withoutExtension}.js`;
  if (await fileExists(resolve(absoluteBase, "index.d.ts"))) return `${withoutExtension}/index.js`;
  return specifier;
}

async function rewriteDeclarationFile(filePath) {
  const content = await readFile(filePath, "utf8");
  const replacements = [];
  const pattern = /((?:from\s+|import\s*(?:\(\s*)?)['"])(\.{1,2}\/[^'"]+)(['"])/g;
  for (const match of content.matchAll(pattern)) {
    replacements.push({
      match: match[0],
      prefix: match[1],
      specifier: match[2],
      suffix: match[3],
    });
  }

  if (replacements.length === 0) return;

  let rewritten = content;
  for (const replacement of replacements) {
    const nextSpecifier = await resolveDeclarationSpecifier(filePath, replacement.specifier);
    rewritten = rewritten.replace(
      replacement.match,
      `${replacement.prefix}${nextSpecifier}${replacement.suffix}`,
    );
  }
  if (rewritten !== content) await writeFile(filePath, rewritten);
}

async function rewriteDeclarationImports(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await rewriteDeclarationImports(entryPath);
        return;
      }
      if (entry.isFile() && entry.name.endsWith(".d.ts")) await rewriteDeclarationFile(entryPath);
    }),
  );
}

await rm(stagingDistDir, { recursive: true, force: true });
await rm(backupDistDir, { recursive: true, force: true });
run("vp", ["build", "--config", "./vite.config.js"], { COMPONENT_PACKAGE_OUT_DIR: stagingDistDir });
run("tsc", [
  "-p",
  "./tsconfig.build.json",
  "--outDir",
  stagingDistDir,
  "--tsBuildInfoFile",
  resolve(stagingDistDir, ".tsbuildinfo"),
]);
await rewriteDeclarationImports(stagingDistDir);
await copyRuntimeCss();
if (await fileExists(distDir)) await rename(distDir, backupDistDir);
try {
  await rename(stagingDistDir, distDir);
  await rm(backupDistDir, { recursive: true, force: true });
} catch (error) {
  if (await fileExists(backupDistDir)) await rename(backupDistDir, distDir);
  throw error;
}
