import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import type { DiscoveredComponentManifest } from "./catalog-discovery.ts";

export function listComponentFiles(component: DiscoveredComponentManifest) {
  return listFiles(component.absolutePath).sort((left, right) =>
    relativeComponentFilePath(component, left).localeCompare(
      relativeComponentFilePath(component, right),
    ),
  );
}

export function collectComponentSourceFiles(component: DiscoveredComponentManifest) {
  return Object.fromEntries(
    listComponentFiles(component)
      .map((file) => [relativeComponentFilePath(component, file), file] as const)
      .filter(([sourcePath]) => isAllowedSourceSnapshotPath(sourcePath, { allowTests: true }))
      .map(([sourcePath, file]) => [sourcePath, readFileSync(file, "utf8")] as const),
  );
}

export function collectSharedSourceFiles(packageRoot: string) {
  return Object.fromEntries(
    collectSharedSourceFileEntries(packageRoot).map(({ sourcePath, contents }) => [
      sourcePath,
      contents,
    ]),
  );
}

interface SharedSourceFileEntry {
  sourcePath: string;
  absolutePath: string;
  contents: string;
}

export function collectSharedSourceFileEntries(packageRoot: string): SharedSourceFileEntry[] {
  // Shared snapshots are runtime/editor dependencies only; component contract
  // tests belong in each component payload and shared test fixtures stay out of
  // the public source-files API.
  const sharedRoots = [
    "src/sdk",
    "src/themes",
    "src/shared/nav",
    "src/shared/view-container",
    "src/manifest.ts",
  ];
  return sharedRoots
    .flatMap((sharedRoot) => {
      const absoluteRoot = path.join(packageRoot, sharedRoot);
      if (!existsSync(absoluteRoot)) return [];

      const files = statSync(absoluteRoot).isDirectory() ? listFiles(absoluteRoot) : [absoluteRoot];

      return files
        .map(
          (file) => [packageRelativePath(file, packageRoot).replace(/^src\//, ""), file] as const,
        )
        .filter(([sourcePath]) => isAllowedSourceSnapshotPath(sourcePath));
    })
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
    .map(([sourcePath, file]) => ({
      sourcePath,
      absolutePath: file,
      contents: readFileSync(file, "utf8"),
    }));
}

const packagePublicSourceEntrypoints = new Map<string, { sourcePath: string; traverse: boolean }>([
  ["@flow-builder/components/sdk", { sourcePath: "src/sdk/public-sdk.ts", traverse: true }],
  [
    "@flow-builder/components/component-ui",
    { sourcePath: "src/sdk/component-ui.ts", traverse: true },
  ],
  [
    "@flow-builder/components/runtime-services",
    { sourcePath: "src/sdk/runtime-services/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/shared/nav",
    { sourcePath: "src/shared/nav/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/shared/view-container",
    { sourcePath: "src/shared/view-container/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/browser",
    { sourcePath: "src/sdk/helpers/browser/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/rendering",
    { sourcePath: "src/sdk/helpers/rendering/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/capabilities",
    { sourcePath: "src/sdk/helpers/capabilities/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/three-d",
    { sourcePath: "src/sdk/helpers/three-d/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/interactions",
    { sourcePath: "src/sdk/helpers/interactions/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/data",
    { sourcePath: "src/sdk/helpers/data/index.ts", traverse: true },
  ],
  [
    "@flow-builder/components/sdk/config",
    { sourcePath: "src/sdk/helpers/config/index.ts", traverse: true },
  ],
  ["@flow-builder/components/sdk/theme", { sourcePath: "src/sdk/theme.ts", traverse: true }],
  [
    "@flow-builder/components/sdk/sanitization",
    { sourcePath: "src/sdk/helpers/sanitization/index.ts", traverse: true },
  ],
]);

const sourceImportPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

export function collectSharedDependencySourceFilePaths(
  component: DiscoveredComponentManifest,
  packageRoot: string,
): string[] {
  const sharedEntries = collectSharedSourceFileEntries(packageRoot);
  const sharedEntriesByAbsolutePath = new Map(
    sharedEntries.map((entry) => [path.resolve(entry.absolutePath), entry]),
  );
  const included = new Map<string, SharedSourceFileEntry>();
  const traversed = new Set<string>();
  const queue: { file: string; traverse: boolean }[] = [];

  const enqueue = (resolved: ResolvedSourceImport | null) => {
    if (!resolved) return;
    const absolutePath = path.resolve(resolved.file);
    const entry = sharedEntriesByAbsolutePath.get(absolutePath);
    if (!entry) return;
    const queued = queue.some((item) => path.resolve(item.file) === absolutePath && item.traverse);
    if (included.has(entry.sourcePath) && (!resolved.traverse || traversed.has(entry.sourcePath))) {
      return;
    }
    if (queued && resolved.traverse) return;
    queue.push({ file: entry.absolutePath, traverse: resolved.traverse });
  };

  for (const file of listComponentFiles(component)) {
    for (const specifier of extractSourceImportSpecifiers(readFileSync(file, "utf8"))) {
      enqueue(resolveSourceImportSpecifier(specifier, file, packageRoot));
    }
  }

  while (queue.length > 0) {
    const { file, traverse } = queue.shift()!;
    const entry = sharedEntriesByAbsolutePath.get(path.resolve(file));
    if (!entry) continue;
    included.set(entry.sourcePath, entry);
    if (!traverse || traversed.has(entry.sourcePath)) continue;
    traversed.add(entry.sourcePath);

    for (const specifier of extractSourceImportSpecifiers(entry.contents)) {
      enqueue(resolveSourceImportSpecifier(specifier, entry.absolutePath, packageRoot));
    }
  }

  return [...included.keys()].sort((left, right) => left.localeCompare(right));
}

export function hashFiles(files: readonly string[], packageRoot: string) {
  const hash = createHash("sha256");
  const sortedFiles = [...files].sort((left, right) =>
    packageRelativePath(left, packageRoot).localeCompare(packageRelativePath(right, packageRoot)),
  );

  for (const file of sortedFiles) {
    hash.update(packageRelativePath(file, packageRoot));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }

  return `sha256:${hash.digest("hex")}`;
}

export function packageRelativePath(file: string, packageRoot: string) {
  return path.relative(packageRoot, file).replaceAll(path.sep, "/");
}

function extractSourceImportSpecifiers(source: string): string[] {
  sourceImportPattern.lastIndex = 0;
  const specifiers: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = sourceImportPattern.exec(source))) {
    const specifier = match[1] ?? match[2];
    if (specifier) specifiers.push(specifier);
  }

  return specifiers;
}

interface ResolvedSourceImport {
  file: string;
  traverse: boolean;
}

function resolveSourceImportSpecifier(
  specifier: string,
  importerFile: string,
  packageRoot: string,
): ResolvedSourceImport | null {
  if (specifier.startsWith(".")) {
    const file = resolveExistingSourceFile(path.resolve(path.dirname(importerFile), specifier));
    return file ? { file, traverse: true } : null;
  }

  const publicEntrypoint = packagePublicSourceEntrypoints.get(specifier);
  if (publicEntrypoint) {
    const file = resolveExistingSourceFile(path.join(packageRoot, publicEntrypoint.sourcePath));
    return file ? { file, traverse: publicEntrypoint.traverse } : null;
  }

  if (specifier.startsWith("@flow-builder/components/sdk/")) {
    const file = resolveExistingSourceFile(
      path.join(packageRoot, "src/sdk", specifier.replace("@flow-builder/components/sdk/", "")),
    );
    return file ? { file, traverse: true } : null;
  }

  return null;
}

function resolveExistingSourceFile(basePath: string): string | null {
  const candidates = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.vue`,
    `${basePath}.json`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.vue"),
    path.join(basePath, "index.js"),
    basePath,
  ];

  return (
    candidates.find((candidate) => existsSync(candidate) && !statSync(candidate).isDirectory()) ??
    null
  );
}

function listFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function isAllowedSourceSnapshotPath(sourcePath: string, options: { allowTests?: boolean } = {}) {
  const segments = sourcePath.split("/");
  if (segments.some((segment) => segment.startsWith("."))) return false;
  if (segments.some((segment) => segment === "node_modules" || segment === "__tests__")) {
    return false;
  }
  if (!options.allowTests && segments.includes("tests")) return false;
  if (sourcePath.endsWith(".d.ts") || sourcePath.endsWith(".map")) return false;
  if (
    !options.allowTests &&
    /(?:^|\/)[^/]+\.(?:test|spec)\.(?:ts|tsx|vue|js|mjs|cjs)$/u.test(sourcePath)
  ) {
    return false;
  }
  if (/(?:^|\/)\.env(?:\.|$)/u.test(sourcePath)) return false;
  if (/(?:^|\/)(?:credentials?|secrets?)\.(?:json|ya?ml|env|txt)$/iu.test(sourcePath)) {
    return false;
  }

  return true;
}

function relativeComponentFilePath(component: DiscoveredComponentManifest, file: string) {
  return path.relative(component.absolutePath, file).replaceAll(path.sep, "/");
}
