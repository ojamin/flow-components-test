#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(packageDir, "package.json"), "utf8"));

const approvedExports = [
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

const errors = [];

const requiredRuntimeExports = {
  "./shared/nav": [
    "findDefaultSelectableNavItem",
    "findSelectableNavItem",
    "navChildConfigItemSchema",
    "navConfigItemSchema",
    "navConfigItemsSchema",
    "navItemSchema",
    "navItemsSchema",
    "normalizeNavHashSlug",
    "normalizeNavItems",
    "resolveActiveNavItemId",
    "selectedNavItemSchema",
    "toSelectedNavItem",
  ],
};

function declarationPathFor(target) {
  if (!target.endsWith(".js")) return null;
  return `${target.slice(0, -3)}.d.ts`;
}

for (const exportKey of approvedExports) {
  const target = packageJson.exports?.[exportKey];
  if (typeof target !== "string") {
    errors.push(`${exportKey} must use a direct string export target.`);
    continue;
  }
  if (target.includes("/src/") || target.startsWith("./src/")) {
    errors.push(`${exportKey} points at source instead of dist: ${target}`);
  }
  const absoluteTarget = resolve(packageDir, target);
  if (!existsSync(absoluteTarget)) errors.push(`${exportKey} target is missing: ${target}`);
  const declarationPath = declarationPathFor(target);
  if (declarationPath && !existsSync(resolve(packageDir, declarationPath))) {
    errors.push(`${exportKey} declaration is missing: ${declarationPath}`);
  }
}

for (const exportKey of Object.keys(packageJson.exports ?? {})) {
  if (exportKey === "./groups" || exportKey.startsWith("./groups/")) {
    errors.push(`Private groups export is present: ${exportKey}`);
  }
}

if (packageJson.types !== "./dist/index.d.ts") {
  errors.push(`Package types must point at ./dist/index.d.ts, got ${packageJson.types}`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

await import(pathToFileURL(resolve(packageDir, packageJson.exports["."])));
const catalog = await import(pathToFileURL(resolve(packageDir, packageJson.exports["./catalog"])));
const sourceFiles = await import(
  pathToFileURL(resolve(packageDir, packageJson.exports["./source-files"]))
);

for (const [exportKey, requiredNames] of Object.entries(requiredRuntimeExports)) {
  const surface = await import(pathToFileURL(resolve(packageDir, packageJson.exports[exportKey])));
  const missingNames = requiredNames.filter((name) => !(name in surface));
  if (missingNames.length > 0) {
    console.error(`- ${exportKey} is missing runtime exports: ${missingNames.join(", ")}`);
    process.exit(1);
  }
}

const firstRenderable = catalog.staticComponentDefinitions.find(
  (definition) => definition.renderable,
);

if (!firstRenderable) {
  console.error("- Built catalog did not expose a renderable component definition.");
  process.exit(1);
}

if (!firstRenderable.renderer || !firstRenderable.configPanel || !firstRenderable.loadFixtureData) {
  console.error(
    `- Built catalog component ${firstRenderable.id} is missing renderer, configPanel, or fixture data loaders.`,
  );
  process.exit(1);
}

const firstSourceFiles = sourceFiles.getBuiltInComponentSourceFiles(firstRenderable.id);
if (!firstSourceFiles?.["component.manifest.json"] || !firstSourceFiles["sdk/public-sdk.ts"]) {
  console.error(
    `- Built source-files export did not expose component and shared source payloads for ${firstRenderable.id}.`,
  );
  process.exit(1);
}

await firstRenderable.renderer();
await firstRenderable.configPanel();
await firstRenderable.loadFixtureData();

const proofDir = resolve(packageDir, ".tmp/build-export-resolution");
const proofFile = resolve(proofDir, "proof.ts");
await rm(proofDir, { recursive: true, force: true });
await mkdir(proofDir, { recursive: true });
await writeFile(
  proofFile,
  `${approvedExports
    .filter((exportKey) => exportKey !== "./styles/component-runtime.css")
    .map((exportKey, index) => {
      const specifier =
        exportKey === "." ? packageJson.name : `${packageJson.name}/${exportKey.slice(2)}`;
      return `import * as surface${index} from ${JSON.stringify(specifier)};`;
    })
    .join("\n")}\n\nexport const resolvedSurfaceCount = ${approvedExports.length - 1};\n`,
);

try {
  const typecheck = spawnSync(
    "tsc",
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--target",
      "ES2022",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      proofFile,
    ],
    {
      cwd: packageDir,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  if (typecheck.status !== 0) process.exit(typecheck.status ?? 1);
} finally {
  await rm(proofDir, { recursive: true, force: true });
}

console.log(
  `Verified ${approvedExports.length} built exports, type declarations, and lazy assets for ${firstRenderable.id}.`,
);
