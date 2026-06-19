import path from "node:path";
import { pathToFileURL } from "node:url";

import { createServer, type ViteDevServer } from "vite";

import { discoverComponentManifests, type DiscoverComponentOptions } from "./generate-catalog.ts";
import { createComponentPackageAliases } from "../tooling/vite-package-aliases.js";

type ComponentDefinition = {
  id: string;
  displayName: string;
  version: number;
  renderable: boolean;
  category: string;
  inputs?: { id: string; acceptedTypeIds?: readonly string[] }[];
  fixtureVariants?: readonly { id: string; label: string; description?: string }[];
  stateSupport?: Record<string, unknown>;
};

type ManifestDriftIssue = {
  message: string;
};

type DefinitionModule = {
  componentDefinition?: ComponentDefinition;
  default?: ComponentDefinition;
};

type ValidatorModule = {
  collectStateSupportMetadataIssues: (
    definitions: readonly ComponentDefinition[],
    options: { strict?: boolean },
  ) => { field: string; message: string }[];
  findManifestDrift: (
    definition: ComponentDefinition,
    manifest: unknown,
    context: { folderGroup: string },
  ) => ManifestDriftIssue[];
};

export const approvedComponentThemeInputComponentIds = [
  "layout.main-page",
  "layout.card",
  "layout.section",
  "layout.repeater",
  "layout.split",
  "layout.tabs",
  "layout.view-stack",
  "layout.command-center-frame",
  "layout.command-section",
] as const;

const approvedComponentThemeInputComponentIdSet = new Set<string>(
  approvedComponentThemeInputComponentIds,
);

export function isApprovedComponentThemeInputComponentId(componentId: string) {
  return approvedComponentThemeInputComponentIdSet.has(componentId);
}

export async function collectManifestDriftIssues(options: DiscoverComponentOptions = {}) {
  const packageRoot = resolvePackageRoot(options);
  const discovered = discoverComponentManifests({ packageRoot });
  const server = await createDefinitionLoaderServer(packageRoot);

  try {
    const validator = (await server.ssrLoadModule(
      pathToFileURL(path.join(packageRoot, "src/sdk/validate-component.ts")).href,
    )) as ValidatorModule;
    const issues: string[] = [];
    for (const component of discovered) {
      const definitionPath = path.join(component.absolutePath, component.manifest.entry.definition);
      const module = (await server.ssrLoadModule(
        pathToFileURL(definitionPath).href,
      )) as DefinitionModule;
      const definition = module.componentDefinition ?? module.default;

      if (!definition || typeof definition !== "object") {
        issues.push(`${component.packagePath}/component.ts did not export a component definition`);
        continue;
      }

      for (const issue of validator.findManifestDrift(definition, component.manifest, {
        folderGroup: component.group,
      })) {
        issues.push(`${component.packagePath}/component.manifest.json: ${issue.message}`);
      }
      for (const issue of validator.collectStateSupportMetadataIssues([definition], {
        strict: true,
      })) {
        issues.push(`${component.packagePath}/component.ts: ${issue.message}`);
      }
      if (hasVizThemeInput(definition)) {
        issues.push(
          `${component.packagePath}/component.ts declares a removed viz-theme input; use canonical component-theme only on approved layout components`,
        );
      }
      if (
        !isApprovedComponentThemeInputComponentId(definition.id) &&
        hasComponentThemeInput(definition)
      ) {
        issues.push(
          `${component.packagePath}/component.ts declares a component-theme input; only approved layout components may declare component-theme inputs`,
        );
      }
    }

    return issues;
  } finally {
    await server.close();
  }
}

function hasComponentThemeInput(definition: ComponentDefinition) {
  return (definition.inputs ?? []).some((input) =>
    input.acceptedTypeIds?.includes("component-theme"),
  );
}

function hasVizThemeInput(definition: ComponentDefinition) {
  return (definition.inputs ?? []).some((input) => input.acceptedTypeIds?.includes("viz-theme"));
}

function createDefinitionLoaderServer(packageRoot: string): Promise<ViteDevServer> {
  return createServer({
    root: packageRoot,
    configFile: false,
    logLevel: "silent",
    server: { middlewareMode: true },
    resolve: { alias: createComponentPackageAliases() },
  });
}

function resolvePackageRoot(options: DiscoverComponentOptions) {
  return options.packageRoot ?? path.resolve(import.meta.dirname, "..");
}
