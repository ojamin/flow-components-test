#!/usr/bin/env node

import { builtinModules } from "node:module";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.resolve(TOOLING_DIR, "..");
const ROOT_DIR = path.resolve(PACKAGE_DIR, "../..");
const PACKAGE_JSON_PATH = path.join(PACKAGE_DIR, "package.json");

const LIFECYCLE_SCRIPTS = new Set([
  "preinstall",
  "install",
  "postinstall",
  "prepublish",
  "prepublishOnly",
  "prepare",
  "prepack",
  "postpack",
  "publish",
  "postpublish",
  "preversion",
  "version",
  "postversion",
  "dependencies",
]);

const LIFECYCLE_ALLOWLIST = new Set([]);

export const APPROVED_PUBLIC_EXPORTS = [
  ".",
  "./catalog",
  "./source-manifest",
  "./source-files",
  "./manifest",
  "./sdk",
  "./sdk/browser",
  "./sdk/rendering",
  "./sdk/capabilities",
  "./sdk/three-d",
  "./sdk/interactions",
  "./sdk/data",
  "./sdk/config",
  "./sdk/theme",
  "./sdk/sanitization",
  "./sdk/markdown",
  "./component-ui",
  "./testing",
  "./runtime-services",
  "./shared/view-container",
  "./shared/nav",
  "./styles/component-runtime.css",
];

const SOURCE_SCAN_ROOTS = ["src", "preview-app/src"];
const PRIVACY_SCAN_ROOTS = [
  ".github",
  "docs",
  "scripts",
  "src/groups",
  "src/generated",
  "src/sdk",
  "src/shared/view-container",
  "src/shared/nav",
  "src/testing",
  "src/themes",
  "test",
  "tooling",
  "preview-app/src",
];
const PRIVACY_SCAN_ROOT_FILES = [
  "AGENTS.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "README.md",
  ".npmrc",
  "npm-shrinkwrap.json",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "vite.config.js",
  "vitest.config.js",
];
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".vue",
  ".yaml",
  ".yml",
]);
const SOURCE_EXTENSIONS = new Set([".css", ".js", ".mjs", ".ts", ".tsx", ".vue"]);
const IGNORED_DIRS = new Set([".git", "dist", "node_modules", "coverage"]);
const NODE_BUILTINS = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

const TS_IMPORT_RE =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;
const CSS_IMPORT_RE = /@(import|plugin)\s+(?:url\()?\s*["']([^"')]+)["']/g;

function issue(code, file, message) {
  return { code, file, message };
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readPackageJson() {
  return readJson(PACKAGE_JSON_PATH);
}

function toPackageRelative(filePath) {
  return path.relative(PACKAGE_DIR, filePath).split(path.sep).join("/");
}

function toRootRelative(filePath) {
  return path.relative(ROOT_DIR, filePath).split(path.sep).join("/");
}

function toPolicyRelative(filePath, packageDir = PACKAGE_DIR) {
  const relativeToPackage = path.relative(packageDir, filePath).split(path.sep).join("/");
  if (relativeToPackage && !relativeToPackage.startsWith("../") && relativeToPackage !== "..") {
    return `packages/components/${relativeToPackage}`;
  }
  return toRootRelative(filePath);
}

function walkFiles(rootPath, extensions = TEXT_EXTENSIONS) {
  if (!existsSync(rootPath)) return [];
  const files = [];

  function visit(currentPath) {
    const stat = statSync(currentPath);
    if (stat.isDirectory()) {
      if (IGNORED_DIRS.has(path.basename(currentPath))) return;
      for (const entry of readdirSync(currentPath)) visit(path.join(currentPath, entry));
      return;
    }
    if (stat.isFile() && shouldScanTextFile(currentPath, extensions)) files.push(currentPath);
  }

  visit(rootPath);
  return files;
}

function shouldScanTextFile(filePath, extensions = TEXT_EXTENSIONS) {
  const basename = path.basename(filePath);
  return extensions.has(path.extname(filePath)) || isSensitivePrivacyFileName(basename);
}

function isSensitivePrivacyFileName(basename) {
  return /^\.env(?:\.|$)/.test(basename) || /credentials?\.(?:json|ya?ml|env)$/i.test(basename);
}

function uniqueFilePaths(filePaths) {
  return [...new Set(filePaths.map((filePath) => path.resolve(filePath)))];
}

function declaredDependencyNames(packageJson) {
  return new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]);
}

function packageNameForSpecifier(specifier) {
  if (
    !specifier ||
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("@/")
  ) {
    return null;
  }
  if (specifier.startsWith("node:") || NODE_BUILTINS.has(specifier)) return null;
  if (specifier.startsWith("@flow-builder/components")) return null;
  if (/^(data|https?):/.test(specifier) || specifier.startsWith("virtual:")) return null;
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

function isRemoteSpecifier(specifier) {
  return /^https?:\/\//i.test(specifier);
}

function remoteImportAllowlist(_specifier, _filePath) {
  return false;
}

function extractSourceSpecifiers(filePath, source) {
  const specifiers = [];
  const extension = path.extname(filePath);
  if (extension === ".css") {
    for (const match of source.matchAll(CSS_IMPORT_RE)) {
      const specifier = match[2];
      if (specifier) specifiers.push(specifier);
    }
    return specifiers;
  }

  for (const match of source.matchAll(TS_IMPORT_RE)) {
    const specifier = match[1] ?? match[2];
    if (specifier) specifiers.push(specifier);
  }
  return specifiers;
}

export function validateLifecycleScripts(packageJson) {
  return Object.keys(packageJson.scripts ?? {})
    .filter(
      (scriptName) => LIFECYCLE_SCRIPTS.has(scriptName) && !LIFECYCLE_ALLOWLIST.has(scriptName),
    )
    .map((scriptName) =>
      issue(
        "lifecycle-script-blocked",
        "packages/components/package.json",
        `Lifecycle script "${scriptName}" must be removed or added to the explicit allowlist.`,
      ),
    );
}

export function validateExportMap(packageJson, { packageDir = PACKAGE_DIR } = {}) {
  const issues = [];
  const exportsMap = packageJson.exports ?? {};
  const exportKeys = Object.keys(exportsMap);
  const approved = new Set(APPROVED_PUBLIC_EXPORTS);

  for (const key of exportKeys) {
    if (key === "./groups" || key.startsWith("./groups/")) {
      issues.push(
        issue(
          "groups-export-blocked",
          "packages/components/package.json",
          `Export "${key}" is private.`,
        ),
      );
    }
    if (!approved.has(key)) {
      issues.push(
        issue(
          "export-not-approved",
          "packages/components/package.json",
          `Export "${key}" is not in the approved public surface list.`,
        ),
      );
    }
  }

  for (const key of APPROVED_PUBLIC_EXPORTS) {
    const target = exportsMap[key];
    if (!target) {
      issues.push(
        issue(
          "export-missing",
          "packages/components/package.json",
          `Approved public export "${key}" is missing from package.json exports.`,
        ),
      );
      continue;
    }
    if (typeof target !== "string") {
      issues.push(
        issue(
          "export-target-unsupported",
          "packages/components/package.json",
          `Export "${key}" must use a direct string target for standalone smoke checks.`,
        ),
      );
      continue;
    }
    if (!existsSync(path.resolve(packageDir, target))) {
      issues.push(
        issue(
          "export-target-missing",
          "packages/components/package.json",
          `Export "${key}" points at missing file "${target}".`,
        ),
      );
    }
  }

  return issues;
}

export function validateDependencyDeclarations({ packageJson, packageDir = PACKAGE_DIR } = {}) {
  const issues = [];
  const declared = declaredDependencyNames(packageJson);
  const missing = new Map();

  for (const root of SOURCE_SCAN_ROOTS) {
    for (const filePath of walkFiles(path.join(packageDir, root), SOURCE_EXTENSIONS)) {
      const source = readFileSync(filePath, "utf8");
      for (const specifier of extractSourceSpecifiers(filePath, source)) {
        if (isRemoteSpecifier(specifier) && !remoteImportAllowlist(specifier, filePath)) {
          issues.push(
            issue(
              "remote-source-import-blocked",
              toPolicyRelative(filePath, packageDir),
              `Remote source import "${specifier}" must be removed or added to the explicit standalone allowlist.`,
            ),
          );
          continue;
        }
        const packageName = packageNameForSpecifier(specifier);
        if (!packageName || declared.has(packageName)) continue;
        const files = missing.get(packageName) ?? new Set();
        files.add(toPackageRelative(filePath));
        missing.set(packageName, files);
      }
    }
  }

  for (const [packageName, files] of [...missing.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    issues.push(
      issue(
        "dependency-undeclared",
        "packages/components/package.json",
        `Package import "${packageName}" is used but not declared. Files: ${[...files].sort().join(", ")}`,
      ),
    );
  }

  return issues;
}

export function validateImportBoundaries({ packageDir = PACKAGE_DIR } = {}) {
  const issues = [];
  const roots = [
    { name: "package source", root: path.join(packageDir, "src"), allowVueRouter: false },
    { name: "preview app", root: path.join(packageDir, "preview-app/src"), allowVueRouter: true },
  ];

  for (const boundary of roots) {
    for (const filePath of walkFiles(boundary.root, SOURCE_EXTENSIONS)) {
      if (
        path.relative(packageDir, filePath).split(path.sep).join("/") ===
        "src/generated/source-files.ts"
      ) {
        // Generated source payloads embed already-scanned source files as string
        // literals. Import regexes would otherwise parse those payload strings
        // as if they were imports from the generated module itself.
        continue;
      }
      const source = readFileSync(filePath, "utf8");
      for (const specifier of extractSourceSpecifiers(filePath, source)) {
        const file = toPolicyRelative(filePath, packageDir);
        if (specifier.startsWith("@/")) {
          issues.push(
            issue(
              "package-to-app-import",
              file,
              `${boundary.name} must not import host app alias "${specifier}".`,
            ),
          );
          continue;
        }
        if (!boundary.allowVueRouter && specifier === "vue-router") {
          issues.push(
            issue(
              "package-router-import",
              file,
              "Package runtime source must not import vue-router; route behavior belongs to hosts.",
            ),
          );
          continue;
        }
        if (
          specifier === "@flow-builder/components/groups" ||
          specifier.startsWith("@flow-builder/components/groups/")
        ) {
          issues.push(
            issue(
              "package-groups-import",
              file,
              "@flow-builder/components/groups/** is private and must not be imported.",
            ),
          );
          continue;
        }
        if (specifier.startsWith(".")) {
          const resolved = path.resolve(path.dirname(filePath), specifier);
          if (resolved !== boundary.root && !resolved.startsWith(`${boundary.root}${path.sep}`)) {
            issues.push(
              issue(
                "package-relative-import-escape",
                file,
                `${boundary.name} relative import escapes its boundary: "${specifier}".`,
              ),
            );
          }
        }
      }
    }
  }

  return issues;
}

export function validateAuditPath(packageJson) {
  const script = packageJson.scripts?.["audit:prod"] ?? "";
  const issues = [];
  if (!script) {
    issues.push(
      issue(
        "audit-script-missing",
        "packages/components/package.json",
        "Package must expose audit:prod for production dependency security review.",
      ),
    );
  }
  if (script && !/npm\s+audit/.test(script)) {
    issues.push(
      issue(
        "audit-script-command",
        "packages/components/package.json",
        "audit:prod must run npm audit.",
      ),
    );
  }
  if (script && !script.includes("--omit=dev")) {
    issues.push(
      issue(
        "audit-script-production-only",
        "packages/components/package.json",
        "audit:prod must include --omit=dev so the threshold is explicit for production dependencies.",
      ),
    );
  }
  if (script && !script.includes("--audit-level=high")) {
    issues.push(
      issue(
        "audit-script-threshold",
        "packages/components/package.json",
        "audit:prod must fail high/critical production dependency advisories via --audit-level=high.",
      ),
    );
  }
  return issues;
}

export function validatePackagingMetadata(packageJson) {
  const issues = [];
  const files = packageJson.files;
  const requiredFiles = ["dist/", "docs/", "README.md", "CHANGELOG.md"];

  if (!Array.isArray(files)) {
    issues.push(
      issue(
        "pack-files-allowlist-missing",
        "packages/components/package.json",
        "Package must declare a files allowlist so packed installs only include intended dist/docs/metadata.",
      ),
    );
  } else {
    for (const required of requiredFiles) {
      if (!files.includes(required)) {
        issues.push(
          issue(
            "pack-files-required-entry-missing",
            "packages/components/package.json",
            `Package files allowlist must include "${required}".`,
          ),
        );
      }
    }
    for (const entry of files) {
      if (/^(?:src|scripts|tooling|preview-app|test|tests)\/?/.test(entry)) {
        issues.push(
          issue(
            "pack-files-raw-source-entry-blocked",
            "packages/components/package.json",
            `Package files allowlist must not include raw source/test/tooling entry "${entry}".`,
          ),
        );
      }
    }
  }

  if (packageJson.sideEffects === false) {
    issues.push(
      issue(
        "css-side-effects-disabled",
        "packages/components/package.json",
        "CSS is a public package API; sideEffects must not be false.",
      ),
    );
  }
  const sideEffects = Array.isArray(packageJson.sideEffects) ? packageJson.sideEffects : [];
  if (
    !sideEffects.includes("**/*.css") &&
    !sideEffects.includes("./dist/styles/component-runtime.css")
  ) {
    issues.push(
      issue(
        "css-side-effects-missing",
        "packages/components/package.json",
        "Package sideEffects must preserve public runtime CSS imports.",
      ),
    );
  }

  if (!packageJson.scripts?.["pack:dry-run"]?.includes("verify-pack-contents.mjs")) {
    issues.push(
      issue(
        "pack-policy-script-missing",
        "packages/components/package.json",
        "pack:dry-run must verify pack contents, not only print npm output.",
      ),
    );
  }
  if (!packageJson.scripts?.["smoke:packed-consumer"]) {
    issues.push(
      issue(
        "packed-consumer-smoke-missing",
        "packages/components/package.json",
        "Package must expose smoke:packed-consumer for packed install/lazy import/CSS proof.",
      ),
    );
  }
  if (!packageJson.scripts?.["smoke:git-ref-consumer"]?.includes("smoke-git-ref-consumer.mjs")) {
    issues.push(
      issue(
        "git-ref-consumer-smoke-missing",
        "packages/components/package.json",
        "Package must expose smoke:git-ref-consumer for protected Git-ref/local committed-dist install proof.",
      ),
    );
  }

  return issues;
}

function isPlaceholderSecret(value) {
  return /^(?:example|placeholder|redacted|dummy|test|changeme|your-|<|\*{3,}|x{3,}|not-a-secret)/i.test(
    value,
  );
}

function privacyPatternsForLine(line) {
  const matches = [];
  if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(line)) {
    matches.push("private-key");
  }
  if (/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/.test(line)) matches.push("aws-access-key");

  const secretMatch = line.match(
    /\b(api[_-]?key|token|secret|password|passwd|credential|authorization)\b\s*[:=]\s*["']([^"']{8,})["']/i,
  );
  if (secretMatch && !isPlaceholderSecret(secretMatch[2])) matches.push("credential-literal");

  if (
    /(?:^|["'=(\s])(?:\/Users\/[^\s)"']+|\/home\/(?!aic\b)[^\s)"']+|\/private\/var\/[^\s)"']+|\/var\/tmp\/[^\s)"']+|\/tmp\/[^\s)"']+|\/mnt\/[^\s)"']+|\/workspace\/[^\s)"']+|\/workspaces\/[^\s)"']+|\/l_[A-Za-z0-9_-]+\/[^\s)"']+|[A-Za-z]:\\[^\s)"']+)/.test(
      line,
    )
  ) {
    matches.push("absolute-local-path");
  }

  if (
    /https?:\/\/(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.|[^/\s"']+\.(?:internal|local|corp|lan)\b)/i.test(
      line,
    )
  ) {
    matches.push("private-url");
  }
  if (
    /https?:\/\/[^\s"']+[?&](?:X-Amz-Signature|AWSAccessKeyId|Signature|sig|token)=/i.test(line)
  ) {
    matches.push("signed-url");
  }
  if (
    /(?:displayName|label|sourceLabel)\s*[:=]\s*["'`][^"'`]*(?:\/Users\/|\\|\.env|\.git|node_modules)/i.test(
      line,
    )
  ) {
    matches.push("unsafe-display-label");
  }
  return matches;
}

function privacyAllowlist(file, line, matchType) {
  if (file === "packages/components/src/generated/source-files.ts") {
    // The generated source-files module embeds already-scanned package source
    // files as escaped string literals; avoid duplicate false positives from
    // huge generated lines while scanning the real source roots directly.
    return true;
  }
  if (
    matchType === "private-url" &&
    file === "packages/components/src/sdk/__tests__/data-types.test.ts" &&
    /http:\/\/localhost:5173/.test(line)
  ) {
    return true;
  }
  if (
    matchType === "signed-url" &&
    /[?&](?:X-Amz-Signature|AWSAccessKeyId|Signature|sig|token)=(?:KEEP|PLACEHOLDER|REDACTED|EXAMPLE)/i.test(
      line,
    )
  ) {
    return true;
  }
  if (matchType === "signed-url" && /https?:\/\/(?:[^\s"']+\.)?example\.com\//i.test(line)) {
    return true;
  }
  if (matchType === "private-url" && /https?:\/\/fixtures\.flow-builder\.local\//i.test(line)) {
    return true;
  }
  if (
    matchType === "private-url" &&
    file.startsWith("packages/components/src/groups/marketing/enquiry-form/tests/") &&
    /https?:\/\/(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.|169\.254\.|\[[^\]]+\]|[^/\s"']+\.local\b)/i.test(
      line,
    )
  ) {
    // These are explicit SSRF/local-network rejection fixtures; the production
    // validator under test rejects them before any fetch happens.
    return true;
  }
  if (file.startsWith("packages/components/docs/") && matchType === "private-url") {
    return /localhost|127\.0\.0\.1/.test(line) && /local|dev|preview|server|example/i.test(line);
  }
  return false;
}

export function validatePrivacy({ packageDir = PACKAGE_DIR } = {}) {
  const issues = [];
  const scanFiles = uniqueFilePaths([
    ...PRIVACY_SCAN_ROOTS.flatMap((root) =>
      walkFiles(path.join(packageDir, root), TEXT_EXTENSIONS),
    ),
    ...PRIVACY_SCAN_ROOT_FILES.map((file) => path.join(packageDir, file)).filter(existsSync),
  ]);
  for (const filePath of scanFiles) {
    const rootRelativeFile = toPolicyRelative(filePath, packageDir);
    const basename = path.basename(filePath);
    if (isSensitivePrivacyFileName(basename)) {
      issues.push(
        issue(
          "privacy-sensitive-file",
          rootRelativeFile,
          "Package docs, CI, metadata, fixtures, and source snapshots must not contain env or credential files.",
        ),
      );
    }

    const source = readFileSync(filePath, "utf8");
    source.split(/\r?\n/).forEach((line, index) => {
      for (const matchType of privacyPatternsForLine(line)) {
        if (privacyAllowlist(rootRelativeFile, line, matchType)) continue;
        issues.push(
          issue(
            `privacy-${matchType}`,
            `${rootRelativeFile}:${index + 1}`,
            "Potential private credential, URL, local path, signed URL, or unsafe label fragment found.",
          ),
        );
      }
    });
  }
  return issues;
}

export function validateStaticExportHooks({ packageDir = PACKAGE_DIR } = {}) {
  const issues = [];
  const packageDocs = [
    path.join(packageDir, "AGENTS.md"),
    path.join(packageDir, "docs/release-process.md"),
    path.join(packageDir, "docs/forking-and-overrides.md"),
  ]
    .filter(existsSync)
    .map((filePath) => readFileSync(filePath, "utf8"))
    .join("\n");

  if (
    !/raw embedded[\s\S]{0,80}not-runtime-executable/i.test(packageDocs) &&
    !/embedded snapshots[\s\S]{0,80}not automatic executable/i.test(packageDocs) &&
    !/source snapshots[\s\S]{0,80}not[\s\S]{0,40}executable/i.test(packageDocs)
  ) {
    issues.push(
      issue(
        "static-export-source-snapshot-hook-missing",
        "packages/components/docs",
        "Package docs must state source snapshots are editor/fallback artifacts, not static-export executable code.",
      ),
    );
  }
  for (const code of [
    "static-export-cache-only-source-unavailable",
    "static-export-component-hash-mismatch",
  ]) {
    if (!packageDocs.includes(code)) {
      issues.push(
        issue(
          "static-export-diagnostic-doc-missing",
          "packages/components/docs/release-process.md",
          `Package static-export hook must document blocking diagnostic "${code}".`,
        ),
      );
    }
  }

  return issues;
}

export function validatePreviewVisualLaneStandaloneSafety({
  packageJson,
  packageDir = PACKAGE_DIR,
} = {}) {
  const issues = [];
  const visualScript = packageJson.scripts?.["test:visual-state"] ?? "";
  const playwrightConfigPath = path.join(packageDir, "preview-app/playwright.config.ts");

  if (!visualScript) {
    issues.push(
      issue(
        "preview-visual-script-missing",
        "packages/components/package.json",
        "Package must expose test:visual-state for package-local preview visual/state proof.",
      ),
    );
  }
  if (visualScript && !visualScript.includes("./preview-app/playwright.config.ts")) {
    issues.push(
      issue(
        "preview-visual-config-missing",
        "packages/components/package.json",
        "test:visual-state must use the package-local preview-app Playwright config.",
      ),
    );
  }

  if (!existsSync(playwrightConfigPath)) {
    issues.push(
      issue(
        "preview-playwright-config-missing",
        "packages/components/preview-app/playwright.config.ts",
        "Preview visual/state lane must keep a package-local Playwright config.",
      ),
    );
    return issues;
  }

  const configSource = readFileSync(playwrightConfigPath, "utf8");
  if (configSource.includes("--workspace")) {
    issues.push(
      issue(
        "preview-webserver-workspace-coupled",
        "packages/components/preview-app/playwright.config.ts",
        "Playwright webServer command must run from the package root without npm workspace flags.",
      ),
    );
  }
  if (
    !/const\s+packageRoot\s*=\s*fileURLToPath\(new URL\(["']\.\.["'],\s*import\.meta\.url\)\)/.test(
      configSource,
    )
  ) {
    issues.push(
      issue(
        "preview-webserver-package-root-missing",
        "packages/components/preview-app/playwright.config.ts",
        "Playwright config must derive packageRoot as one level above preview-app from import.meta.url.",
      ),
    );
  }
  if (!/cwd:\s*packageRoot/.test(configSource)) {
    issues.push(
      issue(
        "preview-webserver-cwd-not-package-root",
        "packages/components/preview-app/playwright.config.ts",
        "Playwright webServer cwd must be packageRoot so standalone package CI works.",
      ),
    );
  }

  return issues;
}

export function validateStaticExportAppIntegrationHooks({ rootDir = ROOT_DIR } = {}) {
  const issues = [];
  const appDiagnosticsPath = path.join(rootDir, "src/lib/project/static-export-diagnostics.ts");
  if (!existsSync(appDiagnosticsPath)) {
    issues.push(
      issue(
        "static-export-app-diagnostic-file-missing",
        "src/lib/project/static-export-diagnostics.ts",
        "Monorepo app-integration static-export hook requires the app diagnostics file; this check is not part of package-only standalone policy.",
      ),
    );
  } else {
    const diagnosticsSource = readFileSync(appDiagnosticsPath, "utf8");
    for (const fragment of [
      "static-export-cache-only-source-unavailable",
      "static-export-component-hash-mismatch",
      "embedded Vue/TS snapshots are not executable in static exports",
    ]) {
      if (!diagnosticsSource.includes(fragment)) {
        issues.push(
          issue(
            "static-export-app-diagnostic-missing",
            toRootRelative(appDiagnosticsPath),
            `App static-export diagnostics must retain "${fragment}".`,
          ),
        );
      }
    }
  }

  const proofFiles = [
    "tests/unit/lib/project/static-site-export.spec.ts",
    "tests/e2e/static-export-source-aware.spec.ts",
  ].map((file) => path.join(rootDir, file));
  const existingProofFiles = proofFiles.filter(existsSync);
  if (existingProofFiles.length !== proofFiles.length) {
    for (const missingPath of proofFiles.filter((filePath) => !existsSync(filePath))) {
      issues.push(
        issue(
          "static-export-proof-file-missing",
          toRootRelative(missingPath),
          "Monorepo app-integration static-export hook requires focused app proof files; this check is not part of package-only standalone policy.",
        ),
      );
    }
  }
  const proofSource = existingProofFiles
    .map((filePath) => readFileSync(filePath, "utf8"))
    .join("\n");
  for (const code of [
    "static-export-cache-only-source-unavailable",
    "static-export-component-hash-mismatch",
  ]) {
    if (!proofSource.includes(code)) {
      issues.push(
        issue(
          "static-export-proof-reference-missing",
          "tests/unit/lib/project/static-site-export.spec.ts",
          `Focused static-export proof must retain blocking diagnostic "${code}".`,
        ),
      );
    }
  }
  return issues;
}

export function runGate(gate) {
  const packageJson = readPackageJson();
  switch (gate) {
    case "lifecycle":
      return validateLifecycleScripts(packageJson);
    case "exports":
      return validateExportMap(packageJson);
    case "deps":
      return validateDependencyDeclarations({ packageJson });
    case "imports":
      return validateImportBoundaries();
    case "audit":
      return validateAuditPath(packageJson);
    case "packaging":
      return validatePackagingMetadata(packageJson);
    case "privacy":
      return validatePrivacy();
    case "static-export":
      return validateStaticExportHooks();
    case "preview-visual":
      return validatePreviewVisualLaneStandaloneSafety({ packageJson });
    case "static-export-app-integration":
      return validateStaticExportAppIntegrationHooks();
    case "all":
      return [
        ...validateLifecycleScripts(packageJson),
        ...validateExportMap(packageJson),
        ...validateImportBoundaries(),
        ...validateDependencyDeclarations({ packageJson }),
        ...validateAuditPath(packageJson),
        ...validatePackagingMetadata(packageJson),
        ...validatePrivacy(),
        ...validateStaticExportHooks(),
        ...validatePreviewVisualLaneStandaloneSafety({ packageJson }),
      ];
    default:
      return [
        issue(
          "policy-unknown-gate",
          "packages/components/tooling/standalone-policy.mjs",
          `Unknown policy gate "${gate}".`,
        ),
      ];
  }
}

function printIssues(gate, issues) {
  if (issues.length === 0) {
    console.log(`standalone-policy:${gate} passed`);
    return;
  }
  console.error(`standalone-policy:${gate} failed with ${issues.length} issue(s):`);
  for (const item of issues) {
    console.error(`- [${item.code}] ${item.file}: ${item.message}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const gateArg = process.argv.find((arg) => arg.startsWith("--gate="));
  const gate = gateArg ? gateArg.slice("--gate=".length) : process.argv[2] || "all";
  const issues = runGate(gate);
  printIssues(gate, issues);
  process.exit(issues.length === 0 ? 0 : 1);
}
