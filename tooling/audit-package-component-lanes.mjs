#!/usr/bin/env node

import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const packageName = "@flow-builder/components";

const readPackageName = (packageJsonPath) => {
  if (!existsSync(packageJsonPath)) return null;

  try {
    return JSON.parse(readFileSync(packageJsonPath, "utf8")).name ?? null;
  } catch {
    return null;
  }
};

export const resolvePackageRootPath = (startCwd = process.cwd()) => {
  const cwd = path.resolve(startCwd).replace(/\/$/, "");
  if (readPackageName(path.join(cwd, "package.json")) === packageName) {
    return cwd;
  }

  const monorepoPackageRoot = path.join(cwd, "packages/components");
  if (readPackageName(path.join(monorepoPackageRoot, "package.json")) === packageName) {
    return monorepoPackageRoot;
  }

  if (cwd.endsWith("/packages/components")) {
    return cwd;
  }

  return monorepoPackageRoot;
};

const packageRootPath = resolvePackageRootPath();

export const defaultPackageRoot = pathToFileURL(`${packageRootPath}/`);
export const defaultPackageJsonPath = new URL("package.json", defaultPackageRoot);

export const groupNames = [
  "chart",
  "civic",
  "content",
  "data",
  "layout",
  "marketing",
  "theme",
  "transform",
  "viz",
  "vmap1",
];

export const groupLaneScriptNames = groupNames.map((groupName) => `test:groups:${groupName}`);

export const laneScriptNames = [...groupLaneScriptNames, "test:sdk:fast", "test:preview-app:fast"];

const packageVitestBinary = "./node_modules/.bin/vitest";
const stopOptionNames = new Set([
  "--maxWorkers",
  "--pool",
  "--project",
  "--reporter",
  "--environment",
  "--coverage",
  "--config",
  "--root",
  "--runInBand",
]);

const toPosixPath = (value) => value.replaceAll("\\", "/");

export const normalizeTestFilePath = (
  filePath,
  packageRootPath = fileURLToPath(defaultPackageRoot),
) => {
  const normalizedFile = toPosixPath(filePath);
  const normalizedRoot = toPosixPath(packageRootPath).replace(/\/$/, "");
  return normalizedFile.startsWith(`${normalizedRoot}/`)
    ? normalizedFile.slice(normalizedRoot.length + 1)
    : normalizedFile;
};

export const tokenizeScript = (script) => {
  const tokens = [];
  let current = "";
  let quote = null;

  for (let index = 0; index < script.length; index += 1) {
    const char = script[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (quote) {
    throw new Error(`Unclosed quote in package script: ${script}`);
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
};

export const extractVitestFilters = (script) => {
  const tokens = tokenizeScript(script);
  const markerIndex = tokens.findIndex(
    (token, index) => token === "--" && tokens[index - 1] === "test",
  );

  if (markerIndex !== -1) return extractFilterTokens(tokens.slice(markerIndex + 1), script);

  const vitestIndex = tokens.findIndex((token) => token === "vitest" || token.endsWith("/vitest"));
  if (vitestIndex !== -1) {
    const startIndex = tokens[vitestIndex + 1] === "run" ? vitestIndex + 2 : vitestIndex + 1;
    return extractFilterTokens(tokens.slice(startIndex), script);
  }

  throw new Error(`Package script does not expose Vitest filters: ${script}`);
};

export const resolveScriptFilters = (scripts, scriptName, seen = new Set()) => {
  if (seen.has(scriptName)) {
    throw new Error(`Circular npm script alias while resolving ${scriptName}.`);
  }
  seen.add(scriptName);

  const script = scripts[scriptName];
  const tokens = tokenizeScript(script);
  if (tokens[0] === "npm" && tokens[1] === "run" && typeof tokens[2] === "string") {
    return resolveScriptFilters(scripts, tokens[2], seen);
  }

  return extractVitestFilters(script);
};

const extractFilterTokens = (tokens, script) => {
  const filters = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === "&&") break;
    if (token === "run" || token === "list") continue;

    if (stopOptionNames.has(token)) {
      index += 1;
      continue;
    }

    if (token.startsWith("--")) {
      continue;
    }

    filters.push(token);
  }

  if (filters.length === 0) {
    throw new Error(`Package script must provide at least one Vitest filter: ${script}`);
  }

  return filters;
};

export const loadPackageScripts = async (packageJsonPath = defaultPackageJsonPath) => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const scripts = packageJson.scripts ?? {};
  const requiredScripts = ["test:components", ...laneScriptNames];

  for (const scriptName of requiredScripts) {
    if (typeof scripts[scriptName] !== "string") {
      throw new Error(`packages/components/package.json is missing script ${scriptName}.`);
    }
  }

  return scripts;
};

export const parseVitestListOutput = (
  output,
  packageRootPath = fileURLToPath(defaultPackageRoot),
) => {
  const trimmed = output.trim();
  if (!trimmed) {
    return [];
  }

  const jsonStartCandidates = [
    trimmed.indexOf("[\n"),
    trimmed.indexOf("[{"),
    trimmed.indexOf("[ {"),
  ].filter((index) => index !== -1);
  const jsonStart = jsonStartCandidates.length > 0 ? Math.min(...jsonStartCandidates) : -1;
  const jsonEnd = trimmed.lastIndexOf("]");
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
      return parsed
        .map((entry) => (typeof entry === "string" ? entry : entry?.file))
        .filter(Boolean)
        .map((filePath) => normalizeTestFilePath(filePath, packageRootPath))
        .sort((left, right) => left.localeCompare(right));
    } catch {
      // Fall through to line parsing for older/different Vite+ output shapes.
    }
  }

  const fileFieldMatches = [...trimmed.matchAll(/"file"\s*:\s*"([^"]+)"/g)].map(
    ([, filePath]) => filePath,
  );
  if (fileFieldMatches.length > 0) {
    return fileFieldMatches
      .map((filePath) => normalizeTestFilePath(filePath, packageRootPath))
      .sort((left, right) => left.localeCompare(right));
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(line))
    .map((line) => line.replace(/^[-•]\s*/, ""))
    .map((filePath) => normalizeTestFilePath(filePath, packageRootPath))
    .sort((left, right) => left.localeCompare(right));
};

export const listVitestFiles = async (filters, options = {}) => {
  const packageRoot = options.packageRoot ?? defaultPackageRoot;
  const packageRootPath = fileURLToPath(packageRoot);
  const vitestBinary = existsSync(new URL(packageVitestBinary, packageRoot))
    ? packageVitestBinary
    : "vitest";
  const args = [
    "--config",
    "vitest.config.js",
    "list",
    "--filesOnly",
    "--json",
    "--staticParse",
    ...filters,
  ];
  const { stdout, stderr } = await execFileAsync(vitestBinary, args, {
    cwd: packageRoot,
    maxBuffer: 1024 * 1024 * 16,
  });

  const files = parseVitestListOutput(`${stdout}\n${stderr}`, packageRootPath);
  if (files.length === 0) {
    throw new Error(`Vitest file listing returned no files for filters: ${filters.join(" ")}`);
  }

  return [...new Set(files)];
};

const sortedDifference = (left, right) => {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item)).sort((a, b) => a.localeCompare(b));
};

export const compareLaneCoverage = (broadFiles, splitFiles) => ({
  broadOnly: sortedDifference(broadFiles, splitFiles),
  splitOnly: sortedDifference(splitFiles, broadFiles),
});

export const runAudit = async (options = {}) => {
  const scripts = await loadPackageScripts(options.packageJsonPath);
  const broadFilters = resolveScriptFilters(scripts, "test:components");
  const splitLaneFilters = Object.fromEntries(
    laneScriptNames.map((scriptName) => [scriptName, resolveScriptFilters(scripts, scriptName)]),
  );

  const broadFiles = await listVitestFiles(broadFilters, options);
  const splitLaneFiles = {};
  for (const [scriptName, filters] of Object.entries(splitLaneFilters)) {
    splitLaneFiles[scriptName] = await listVitestFiles(filters, options);
  }

  const splitFiles = [...new Set(Object.values(splitLaneFiles).flat())].sort((left, right) =>
    left.localeCompare(right),
  );
  const { broadOnly, splitOnly } = compareLaneCoverage(broadFiles, splitFiles);

  return {
    broadFilters,
    splitLaneFilters,
    broadFiles,
    splitLaneFiles,
    splitFiles,
    broadOnly,
    splitOnly,
  };
};

const printFiles = (title, files) => {
  if (files.length === 0) {
    return;
  }

  console.error(`\n${title}:`);
  for (const file of files) {
    console.error(`- ${file}`);
  }
};

export const printAuditResult = (result) => {
  console.log(
    `Package component lane audit: broad=${result.broadFiles.length}, split-union=${result.splitFiles.length}`,
  );
  for (const scriptName of laneScriptNames) {
    console.log(`- ${scriptName}: ${result.splitLaneFiles[scriptName].length}`);
  }

  if (result.broadOnly.length === 0 && result.splitOnly.length === 0) {
    console.log("Package component lane audit passed: split release lanes match the broad lane.");
    return;
  }

  printFiles("Broad-only files", result.broadOnly);
  printFiles("Split-only files", result.splitOnly);
  process.exitCode = 1;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    printAuditResult(await runAudit());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
