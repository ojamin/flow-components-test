import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ComponentCatalogGenerationError,
  type DiscoverComponentOptions,
  resolvePackageRoot,
} from "./catalog-discovery.ts";
import { generateComponentLibraryOutputs } from "./catalog-generator.ts";

export async function writeGeneratedComponentLibraryOutputs(
  options: DiscoverComponentOptions = {},
) {
  const packageRoot = resolvePackageRoot(options);
  if (options.validateDefinitions !== false) {
    const { collectManifestDriftIssues } = await import("./manifest-drift.ts");
    const driftIssues = await collectManifestDriftIssues({ packageRoot });
    if (driftIssues.length > 0) {
      throw new ComponentCatalogGenerationError([
        "Manifest drift validation failed; fix component definitions or manifests before writing generated files.",
        ...driftIssues,
      ]);
    }
  }

  const outputs = generateComponentLibraryOutputs({ packageRoot });
  const generatedRoot = path.join(packageRoot, "src/generated");

  mkdirSync(generatedRoot, { recursive: true });
  writeFileSync(path.join(generatedRoot, "catalog.ts"), outputs.catalogSource);
  writeFileSync(path.join(generatedRoot, "source-manifest.ts"), outputs.sourceManifestSource);
  writeFileSync(path.join(generatedRoot, "source-files.ts"), outputs.sourceFilesSource);
  writeFileSync(path.join(packageRoot, "component-source.manifest.json"), outputs.sourceManifestJson);

  return outputs;
}

export function collectGeneratedOutputIssues(options: DiscoverComponentOptions = {}) {
  const packageRoot = resolvePackageRoot(options);
  const outputs = generateComponentLibraryOutputs({ packageRoot });
  const catalogPath = path.join(packageRoot, "src/generated/catalog.ts");
  const rootSourceManifestPath = path.join(packageRoot, "component-source.manifest.json");
  const sourceManifestPath = path.join(packageRoot, "src/generated/source-manifest.ts");
  const sourceFilesPath = path.join(packageRoot, "src/generated/source-files.ts");
  const issues: string[] = [];

  if (!existsSync(catalogPath)) issues.push("src/generated/catalog.ts is missing.");
  if (!existsSync(rootSourceManifestPath)) {
    issues.push("component-source.manifest.json is missing.");
  }
  if (!existsSync(sourceManifestPath)) issues.push("src/generated/source-manifest.ts is missing.");
  if (!existsSync(sourceFilesPath)) issues.push("src/generated/source-files.ts is missing.");
  if (issues.length > 0) return issues;

  const catalogSource = readFileSync(catalogPath, "utf8");
  const rootSourceManifestJson = readFileSync(rootSourceManifestPath, "utf8");
  const sourceManifestSource = readFileSync(sourceManifestPath, "utf8");
  const sourceFilesSource = readFileSync(sourceFilesPath, "utf8");
  if (catalogSource !== outputs.catalogSource) {
    issues.push(
      "src/generated/catalog.ts is stale; run npm run generate.",
    );
  }

  if (sourceManifestSource !== outputs.sourceManifestSource) {
    issues.push(
      "src/generated/source-manifest.ts is stale; run npm run generate.",
    );
  }

  if (rootSourceManifestJson !== outputs.sourceManifestJson) {
    issues.push(
      "component-source.manifest.json is stale; run npm run generate.",
    );
  }

  if (sourceFilesSource !== outputs.sourceFilesSource) {
    issues.push(
      "src/generated/source-files.ts is stale; run npm run generate.",
    );
  }

  return issues;
}
