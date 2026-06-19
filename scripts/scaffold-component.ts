import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  componentManifestGroupSchema,
  parseComponentManifest,
  type ComponentManifestGroup,
} from "../src/manifest.ts";

export type ScaffoldComponentOptions = {
  packageRoot?: string;
  group: ComponentManifestGroup;
  folderName: string;
  id: string;
  displayName: string;
  transformKind?: "module" | "passthrough";
  dryRun?: boolean;
};

export type ScaffoldComponentResult = {
  componentRoot: string;
  files: readonly string[];
  fileContents: Readonly<Record<string, string>>;
};

const folderNamePattern = /^[a-z][a-z0-9-]*$/;
const componentIdPattern = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)$/;

export function scaffoldComponent(options: ScaffoldComponentOptions): ScaffoldComponentResult {
  validateScaffoldOptions(options);

  const packageRoot = options.packageRoot ?? path.resolve(import.meta.dirname, "..");
  const componentRoot = path.join(packageRoot, "src/groups", options.group, options.folderName);
  const files = createScaffoldFiles(options);

  if (existsSync(componentRoot)) {
    throw new Error(`Component folder already exists: ${componentRoot}`);
  }

  if (!options.dryRun) {
    for (const [relativePath, contents] of Object.entries(files)) {
      const targetPath = path.join(componentRoot, relativePath);

      mkdirSync(path.dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, contents);
    }
  }

  return { componentRoot, files: Object.keys(files).sort(), fileContents: files };
}

function validateScaffoldOptions(options: ScaffoldComponentOptions) {
  componentManifestGroupSchema.parse(options.group);

  if (!folderNamePattern.test(options.folderName) || options.folderName.includes("..")) {
    throw new Error("Component folder must be a safe kebab-case path segment.");
  }

  if (!componentIdPattern.test(options.id)) {
    throw new Error("Component id must use the <group>.<name> format for scaffolded components.");
  }

  if (!options.id.startsWith(`${options.group}.`)) {
    throw new Error(`Component id ${options.id} must use the ${options.group}. namespace.`);
  }

  if (!options.displayName.trim()) {
    throw new Error("Component display name is required.");
  }
}

function createScaffoldFiles(options: ScaffoldComponentOptions) {
  const transformKind = options.transformKind ?? "module";
  const transformCaseName =
    transformKind === "passthrough" ? "passes data input to all" : "passes fixture data to all";
  const transformCaseInputs =
    transformKind === "passthrough"
      ? `
    inputs: { data: { label: ${JSON.stringify(options.displayName)} } },`
      : "";
  const entry = {
    definition: "component.ts",
    renderer: "Renderer.vue",
    configPanel: "ConfigPanel.vue",
    ...(transformKind === "module" ? { transform: "transform.ts" } : {}),
  };
  const manifest = {
    schemaVersion: 1,
    id: options.id,
    displayName: options.displayName,
    group: options.group,
    section: "custom",
    tags: [options.group, options.folderName],
    version: "1.0.0",
    renderable: true,
    transformKind,
    entry,
  };

  parseComponentManifest(manifest, { folderGroup: options.group });

  const files: Record<string, string> = {
    "component.manifest.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "component.ts": createComponentSource(options, transformKind),
    "Renderer.vue": `<script setup lang="ts">
import { computed } from "vue";

import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

// Definition-safe types and pure helpers belong in the root SDK import above.
// Runtime-heavy helpers should use explicit section subpaths, for example:
// import { createCanvas, resetBrowserTimeout } from "@flow-builder/components/sdk/browser";
// import { isActivationKey } from "@flow-builder/components/sdk/interactions";
// import { createFrameLoop } from "@flow-builder/components/sdk/rendering";

import { ${scaffoldSymbol(options.folderName)}ConfigDefaults, ${scaffoldSymbol(options.folderName)}ConfigSchema } from "./types";

const props = defineProps<StaticComponentRenderProps>();

const config = computed(() => ${scaffoldSymbol(options.folderName)}ConfigSchema.parse(props.config ?? ${scaffoldSymbol(options.folderName)}ConfigDefaults));
</script>

<template>
  <section class="space-y-2 text-sm">
    <p class="font-medium text-foreground">{{ config.label }}</p>
    <p class="text-muted-foreground">Scaffolded component renderer.</p>
  </section>
</template>
`,
    "ConfigPanel.vue": `<script setup lang="ts">
import { computed } from "vue";

import { ConfigInspectorSection } from "@flow-builder/components/component-ui";
import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import { ${scaffoldSymbol(options.folderName)}ConfigDefaults, ${scaffoldSymbol(options.folderName)}ConfigSchema } from "./types";

const props = defineProps<StaticComponentRenderProps>();

const config = computed(() => ${scaffoldSymbol(options.folderName)}ConfigSchema.parse(props.config ?? ${scaffoldSymbol(options.folderName)}ConfigDefaults));
</script>

<template>
  <ConfigInspectorSection title="${options.displayName}" description="Scaffolded config panel">
    <p class="text-sm text-muted-foreground">{{ config.label }}</p>
  </ConfigInspectorSection>
</template>
`,
    "types.ts": `import { z } from "zod";

import { defineConfigDefaults } from "@flow-builder/components/sdk";

export const ${scaffoldSymbol(options.folderName)}ConfigSchema = z.object({
  label: z.string().min(1).default(${JSON.stringify(options.displayName)}),
});

export const ${scaffoldSymbol(options.folderName)}ConfigDefaults = defineConfigDefaults(${scaffoldSymbol(options.folderName)}ConfigSchema);
`,
    "fixtures/sample-data.json": `${JSON.stringify({ label: options.displayName }, null, 2)}\n`,
    "tests/cases.ts": `import { expect } from "vitest";

import type {
  StaticComponentContractCase,
  StaticComponentRenderCase,
  StaticComponentTransformCase,
} from "../../../../testing";

export const contractCases = [
  {
    name: "declares scaffolded output",
    check: ({ definition }) => {
      expect(definition.outputs.map((output) => output.id)).toEqual(["all"]);
    },
  },
] as const satisfies readonly StaticComponentContractCase[];

export const renderCases = [
  {
    name: "renders configured label",
    mountOptions: { props: { config: { label: ${JSON.stringify(options.displayName)} } } },
    check: ({ wrapper }) => {
      expect(wrapper.text()).toContain(${JSON.stringify(options.displayName)});
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "${transformCaseName}",${transformCaseInputs}
    check: ({ outputs }) => {
      expect(outputs.all).toEqual({ label: ${JSON.stringify(options.displayName)} });
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];
`,
    "tests/component.contract.test.ts": `import { describeStaticComponentContract } from "../../../../testing";

import { componentDefinition } from "../component";
import { contractCases } from "./cases";

describeStaticComponentContract(componentDefinition, contractCases);
`,
    "tests/component.render.test.ts": `import { describeStaticComponentRenderer } from "../../../../testing";

import { componentDefinition } from "../component";
import { renderCases } from "./cases";

describeStaticComponentRenderer(componentDefinition, renderCases);
`,
    "tests/component.transform.test.ts": `import { describeStaticComponentTransform } from "../../../../testing";

import { componentDefinition } from "../component";
import { transformCases } from "./cases";

describeStaticComponentTransform(componentDefinition, transformCases);
`,
  } satisfies Record<string, string>;

  if (transformKind === "module") {
    files["transform.ts"] = `import { z } from "zod";

import type { StaticComponentTransformModule } from "@flow-builder/components/sdk";

export const outputSchema = z.object({ all: z.unknown().optional() });

export const transform: StaticComponentTransformModule["transform"] = (context) => ({
  all: context.fixtureData,
});
`;
  }

  return files;
}

function createComponentSource(
  options: ScaffoldComponentOptions,
  transformKind: "module" | "passthrough",
) {
  const sdkImports =
    transformKind === "passthrough"
      ? "createPassthroughTransform, defineComponent"
      : "defineComponent";
  const transformLoader =
    transformKind === "passthrough" ? "createPassthroughTransform" : '() => import("./transform")';

  return `import { ${sdkImports} } from "@flow-builder/components/sdk";

import { ${scaffoldSymbol(options.folderName)}ConfigDefaults, ${scaffoldSymbol(options.folderName)}ConfigSchema } from "./types";

export const componentDefinition = defineComponent({
  id: ${JSON.stringify(options.id)},
  version: 1,
  source: "static",
  displayName: ${JSON.stringify(options.displayName)},
  description: "${options.displayName} component.",
  icon: "box",
  category: ${JSON.stringify(options.group)},
  renderable: true,
  configSchema: ${scaffoldSymbol(options.folderName)}ConfigSchema,
  configDefaults: ${scaffoldSymbol(options.folderName)}ConfigDefaults,
  builder: {
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 3, h: 2 },
    resizeX: true,
    resizeY: true,
    heightMode: "content",
    draggable: true,
    wrapperVariant: "default",
  },
  flow: { scaffolded: true, tint: ${JSON.stringify(scaffoldFlowTint(options.group))} },
  inputs: [],
  outputs: [{ id: "all", label: "All data", typeId: "all-data" }],
  renderer: async () => (await import("./Renderer.vue")).default,
  configPanel: async () => (await import("./ConfigPanel.vue")).default,
  transform: ${transformLoader},
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
});

export default componentDefinition;
`;
}

function scaffoldSymbol(folderName: string) {
  return folderName.replace(/(^|-)([a-z0-9])/g, (_match, _separator, char: string) =>
    char.toUpperCase(),
  );
}

function scaffoldFlowTint(group: ComponentManifestGroup) {
  if (group === "marketing") return "content";
  if (group === "transform") return "utility";

  return group;
}

function readCliOptions(argv: readonly string[]): ScaffoldComponentOptions {
  const group = readFlag(argv, "--group");
  const folderName = readFlag(argv, "--folder");
  const id = readFlag(argv, "--id");
  const displayName = readFlag(argv, "--display-name");
  const transformKind = readFlag(argv, "--transform-kind");

  if (!group || !folderName || !id || !displayName) {
    throw new Error(
      "Usage: scaffold-component --group <group> --folder <folder> --id <group.id> --display-name <name> [--transform-kind module|passthrough] [--dry-run]",
    );
  }

  if (
    transformKind !== undefined &&
    transformKind !== "module" &&
    transformKind !== "passthrough"
  ) {
    throw new Error("Transform kind must be either module or passthrough.");
  }

  return {
    group: componentManifestGroupSchema.parse(group),
    folderName,
    id,
    displayName,
    transformKind,
    dryRun: argv.includes("--dry-run"),
  };
}

function readFlag(argv: readonly string[], flag: string) {
  const index = argv.indexOf(flag);

  return index === -1 ? undefined : argv[index + 1];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = scaffoldComponent(readCliOptions(process.argv.slice(2)));
  const action = process.argv.includes("--dry-run") ? "Would create" : "Created";

  console.log(`${action} ${result.files.length} files at ${result.componentRoot}`);
}
