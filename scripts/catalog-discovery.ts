import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  parseComponentManifest,
  type ComponentManifest,
  type ComponentManifestGroup,
} from "../src/manifest.ts";
import { collectEmitEventDeclarationIssues } from "./emit-event-drift.ts";
import {
  collectMissingRequiredFileIssues,
  requiredManifestEntries,
} from "./catalog-required-files.ts";

export type ComponentFolder = {
  group: ComponentManifestGroup;
  folderName: string;
  absolutePath: string;
  packagePath: string;
};

export type DiscoveredComponentManifest = ComponentFolder & {
  manifest: ComponentManifest;
};

export type DiscoverComponentOptions = {
  packageRoot?: string;
  validateDefinitions?: boolean;
};

const legacyComponentOrder = [
  "chart.bar",
  "chart.line",
  "chart.donut",
  "demo.demo-button",
  "content.divider",
  "content.heading",
  "content.image",
  "content.json-viewer",
  "content.key-value",
  "content.markdown",
  "content.select",
  "content.table",
  "demo.demo-text",
  "data.http-request",
  "layout.card",
  "layout.repeater",
  "layout.section",
  "layout.split",
  "layout.view-stack",
  "hero-banner",
  "transform.javascript",
  "transform.json-select",
] as const;

const legacyComponentOrderRank = new Map<string, number>(
  legacyComponentOrder.map((componentId, index) => [componentId, index]),
);

export class ComponentCatalogGenerationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Component catalog generation validation failed:\n${issues.join("\n")}`);
    this.name = "ComponentCatalogGenerationError";
    this.issues = issues;
  }
}

export function discoverPackageComponentFolders(
  options: DiscoverComponentOptions = {},
): ComponentFolder[] {
  const packageRoot = resolvePackageRoot(options);
  const groupsRoot = path.join(packageRoot, "src/groups");
  const folders: ComponentFolder[] = [];

  for (const groupEntry of readdirSync(groupsRoot, { withFileTypes: true })) {
    if (!groupEntry.isDirectory()) continue;

    const group = groupEntry.name as ComponentManifestGroup;
    const groupPath = path.join(groupsRoot, group);
    for (const componentEntry of readdirSync(groupPath, { withFileTypes: true })) {
      if (!componentEntry.isDirectory()) continue;
      if (componentEntry.name === "shared") continue;

      const packagePath = `src/groups/${group}/${componentEntry.name}`;
      folders.push({
        group,
        folderName: componentEntry.name,
        absolutePath: path.join(groupPath, componentEntry.name),
        packagePath,
      });
    }
  }

  return folders.sort((left, right) => left.packagePath.localeCompare(right.packagePath));
}

export function discoverComponentManifests(
  options: DiscoverComponentOptions = {},
): DiscoveredComponentManifest[] {
  const issues: string[] = [];
  const seenIds = new Set<string>();
  const discovered: DiscoveredComponentManifest[] = [];

  for (const folder of discoverPackageComponentFolders(options)) {
    const manifestPath = path.join(folder.absolutePath, "component.manifest.json");
    if (!existsSync(manifestPath)) {
      issues.push(`${folder.packagePath} is missing required file component.manifest.json`);
      continue;
    }

    try {
      const manifestCandidate = JSON.parse(readFileSync(manifestPath, "utf8"));
      const manifestDraft = parseComponentManifest(manifestCandidate, {
        folderGroup: folder.group,
      });
      const manifest = parseComponentManifest(manifestCandidate, {
        folderGroup: folder.group,
        requiredEntries: requiredManifestEntries(manifestDraft),
      });

      collectMissingRequiredFileIssues(folder, issues, manifest);
      collectMissingManifestEntryTargetIssues(folder, manifest, issues);
      collectEmitEventDeclarationIssues(folder, manifest, issues);
      collectDuplicateComponentIdIssues(folder, manifest, seenIds, issues);
      discovered.push({ ...folder, manifest });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(`${folder.packagePath}/component.manifest.json: ${message}`);
    }
  }

  if (issues.length > 0) throw new ComponentCatalogGenerationError(issues);
  return discovered.sort(compareDiscoveredComponents);
}

export function resolvePackageRoot(options: DiscoverComponentOptions) {
  return options.packageRoot ?? path.resolve(import.meta.dirname, "..");
}

function collectMissingManifestEntryTargetIssues(
  folder: ComponentFolder,
  manifest: ComponentManifest,
  issues: string[],
) {
  for (const entryPath of Object.values(manifest.entry)) {
    const targetPath = path.join(folder.absolutePath, entryPath);
    if (!existsSync(targetPath)) {
      issues.push(`${folder.packagePath}/component.manifest.json references missing ${entryPath}`);
    }
  }
}

function collectDuplicateComponentIdIssues(
  folder: ComponentFolder,
  manifest: ComponentManifest,
  seenIds: Set<string>,
  issues: string[],
) {
  if (seenIds.has(manifest.id)) {
    issues.push(`Duplicate component id "${manifest.id}" in ${folder.packagePath}`);
  }
  seenIds.add(manifest.id);
}

function compareDiscoveredComponents(
  left: DiscoveredComponentManifest,
  right: DiscoveredComponentManifest,
) {
  const leftRank = legacyComponentOrderRank.get(left.manifest.id) ?? Number.MAX_SAFE_INTEGER;
  const rightRank = legacyComponentOrderRank.get(right.manifest.id) ?? Number.MAX_SAFE_INTEGER;

  if (leftRank !== rightRank) return leftRank - rightRank;
  return left.manifest.id.localeCompare(right.manifest.id);
}
