import { existsSync } from "node:fs";
import path from "node:path";

import type { ComponentManifest } from "../src/manifest.ts";
import type { ComponentFolder } from "./catalog-discovery.ts";

const baseRequiredComponentFiles = [
  "component.manifest.json",
  "component.ts",
  "Renderer.vue",
  "ConfigPanel.vue",
  "types.ts",
  "fixtures/sample-data.json",
  "tests/cases.ts",
  "tests/component.contract.test.ts",
  "tests/component.render.test.ts",
  "tests/component.transform.test.ts",
] as const;

export function collectMissingRequiredFileIssues(
  folder: ComponentFolder,
  issues: string[],
  manifest: ComponentManifest,
) {
  for (const requiredFile of requiredComponentFilesForManifest(manifest)) {
    if (!existsSync(path.join(folder.absolutePath, requiredFile))) {
      issues.push(`${folder.packagePath} is missing required file ${requiredFile}`);
    }
  }
}

export function requiredComponentFilesForManifest(manifest: ComponentManifest) {
  return [
    ...baseRequiredComponentFiles,
    ...(manifest.transformKind === "module" ? ["transform.ts"] : []),
  ];
}

export function requiredManifestEntries(
  manifest: ComponentManifest,
): readonly (keyof ComponentManifest["entry"])[] {
  return [
    "definition",
    "renderer",
    "configPanel",
    ...(manifest.transformKind === "module" ? (["transform"] as const) : []),
  ];
}
