import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

import { validateDirectBrowserGlobals } from "./browser-global-policy.ts";
import { validateConfigPanelParamContract } from "./config-panel-param-contract.ts";
import { collectGeneratedOutputIssues } from "./generate-catalog.ts";
import {
  collectManifestDriftIssues,
  isApprovedComponentThemeInputComponentId,
} from "./manifest-drift.ts";
import { collectManifestMetadataIssues } from "../src/sdk/manifest-metadata-validation.ts";
import { collectStateSupportConformanceIssues } from "./state-support-conformance.ts";

type ComponentManifest = {
  schemaVersion: number;
  id: string;
  displayName: string;
  group: string;
  version: string;
  renderable: boolean;
  fixtureVariants?: { id: string; label: string; description?: string }[];
  stateSupport?: Record<string, unknown>;
  transformKind: "module" | "passthrough";
  entry: {
    definition: string;
    renderer: string;
    configPanel: string;
    transform?: string;
  };
};

const packageRoot = path.resolve(import.meta.dirname, "..");
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

const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

export type ValidateComponentLibraryOptions = {
  packageRoot?: string;
  checkGeneratedOutput?: boolean;
  checkManifestDrift?: boolean;
  checkDependencies?: boolean;
  enforceThemeContracts?: boolean;
  strictStateSupportMetadata?: boolean;
};

export async function validateComponentLibrary(options: ValidateComponentLibraryOptions = {}) {
  const resolvedPackageRoot = options.packageRoot ?? packageRoot;
  const errors: string[] = [];
  const warnings: string[] = [];
  const generatedOutputIssues: string[] = [];
  const manifestDriftIssues: string[] = [];
  const componentFolders = listComponentFolders(resolvedPackageRoot);
  const manifests = validateComponentFolders(componentFolders, errors);
  const manifestMetadataIssues = collectManifestMetadataIssues(manifests);
  if (options.strictStateSupportMetadata === false) warnings.push(...manifestMetadataIssues);
  else errors.push(...manifestMetadataIssues);
  const stateSupportConformanceIssues = collectStateSupportConformanceIssues({
    packageRoot: resolvedPackageRoot,
  });
  if (options.strictStateSupportMetadata === false) {
    warnings.push(...stateSupportConformanceIssues);
  } else {
    errors.push(...stateSupportConformanceIssues);
  }
  await validateComponentDefinitions(manifests, resolvedPackageRoot, errors, {
    enforceThemeContracts: options.enforceThemeContracts !== false,
  });

  validateSourceManifest(manifests, resolvedPackageRoot, errors);
  validateDirectBrowserGlobals(resolvedPackageRoot, errors);
  if (options.checkGeneratedOutput !== false) {
    generatedOutputIssues.push(
      ...collectGeneratedOutputIssues({ packageRoot: resolvedPackageRoot }),
    );
  }
  if (options.checkManifestDrift !== false) {
    manifestDriftIssues.push(
      ...(await collectManifestDriftIssues({ packageRoot: resolvedPackageRoot })),
    );
  }
  if (options.checkDependencies !== false) validatePackageDependencies(resolvedPackageRoot, errors);

  return {
    errors: [...errors, ...generatedOutputIssues, ...manifestDriftIssues],
    warnings,
    generatedOutputIssues,
    manifestDriftIssues,
    componentCount: manifests.length,
  };
}

async function validateComponentDefinitions(
  manifests: (ComponentManifest & { sourcePath: string })[],
  resolvedPackageRoot: string,
  errors: string[],
  options: { enforceThemeContracts: boolean },
) {
  for (const manifest of manifests) {
    const definitionPath = path.join(
      resolvedPackageRoot,
      manifest.sourcePath,
      manifest.entry.definition,
    );
    const source = readFileSync(definitionPath, "utf8");

    if (!componentDefinitionDeclaresProperty(source, definitionPath, "params")) {
      errors.push(
        `${manifest.sourcePath}/${manifest.entry.definition} componentDefinition must declare params (use params: {} when the component has no config).`,
      );
    }

    if (
      options.enforceThemeContracts &&
      !componentDefinitionDeclaresProperty(source, definitionPath, "themeContract")
    ) {
      errors.push(
        `${manifest.sourcePath}/${manifest.entry.definition} componentDefinition must declare themeContract (use themeContract: { consumes: [] } when the component does not consume theme roles).`,
      );
    }

    validateConfigPanelParamContract(manifest, resolvedPackageRoot, source, definitionPath, errors);
  }
}

function componentDefinitionDeclaresProperty(
  source: string,
  fileName: string,
  propertyName: string,
) {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  let foundComponentDefinition = false;
  let declaresProperty = false;

  const inspectExpression = (expression: ts.Expression) => {
    foundComponentDefinition = true;
    const definitionObject = unwrapDefinitionObject(expression);
    if (definitionObject?.properties.some((property) => isNamedProperty(property, propertyName))) {
      declaresProperty = true;
    }
  };

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "componentDefinition" &&
      node.initializer
    ) {
      inspectExpression(node.initializer);
    }
    if (ts.isExportAssignment(node)) inspectExpression(node.expression);
    if (!declaresProperty) ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return foundComponentDefinition && declaresProperty;
}

function unwrapDefinitionObject(expression: ts.Expression): ts.ObjectLiteralExpression | undefined {
  if (ts.isObjectLiteralExpression(expression)) return expression;
  if (ts.isCallExpression(expression)) {
    const [firstArgument] = expression.arguments;
    if (firstArgument && ts.isObjectLiteralExpression(firstArgument)) return firstArgument;
  }
  if (ts.isSatisfiesExpression(expression) || ts.isAsExpression(expression)) {
    return unwrapDefinitionObject(expression.expression);
  }
  return undefined;
}

function isNamedProperty(property: ts.ObjectLiteralElementLike, propertyName: string) {
  if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property))
    return false;
  const name = property.name;
  return (
    (ts.isIdentifier(name) && name.text === propertyName) ||
    (ts.isStringLiteral(name) && name.text === propertyName)
  );
}

function listComponentFolders(resolvedPackageRoot: string) {
  const groupsRoot = path.join(resolvedPackageRoot, "src/groups");
  const folders: { group: string; name: string; relativePath: string; absolutePath: string }[] = [];

  for (const group of readdirSync(groupsRoot, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;

    const groupPath = path.join(groupsRoot, group.name);
    for (const component of readdirSync(groupPath, { withFileTypes: true })) {
      if (!component.isDirectory()) continue;
      if (component.name === "shared") continue;

      const relativePath = `src/groups/${group.name}/${component.name}`;
      folders.push({
        group: group.name,
        name: component.name,
        relativePath,
        absolutePath: path.join(groupPath, component.name),
      });
    }
  }

  return folders.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function validateComponentFolders(
  folders: ReturnType<typeof listComponentFolders>,
  errors: string[],
): (ComponentManifest & { sourcePath: string })[] {
  const seenIds = new Set<string>();
  const parsedManifests: (ComponentManifest & { sourcePath: string })[] = [];

  for (const folder of folders) {
    const manifestPath = path.join(folder.absolutePath, "component.manifest.json");
    if (!existsSync(manifestPath)) {
      errors.push(`${folder.relativePath} is missing required file component.manifest.json`);
      continue;
    }

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ComponentManifest;
    const sourcePath = folder.relativePath;

    for (const requiredFile of requiredComponentFilesForManifest(manifest)) {
      const absolutePath = path.join(folder.absolutePath, requiredFile);
      if (!existsSync(absolutePath)) {
        errors.push(`${folder.relativePath} is missing required file ${requiredFile}`);
      }
    }

    if (manifest.schemaVersion !== 1) {
      errors.push(`${sourcePath}/component.manifest.json must use schemaVersion 1`);
    }

    if (!manifest.id || seenIds.has(manifest.id)) {
      errors.push(
        `${sourcePath}/component.manifest.json has missing or duplicate id ${manifest.id}`,
      );
    }
    seenIds.add(manifest.id);

    if (manifest.group !== folder.group) {
      errors.push(
        `${sourcePath}/component.manifest.json group ${manifest.group} must match folder group ${folder.group}`,
      );
    }

    validateEntryPath(sourcePath, manifest.entry.definition, "component.ts", errors);
    validateEntryPath(sourcePath, manifest.entry.renderer, "Renderer.vue", errors);
    validateEntryPath(sourcePath, manifest.entry.configPanel, "ConfigPanel.vue", errors);
    validateTransformContract(sourcePath, folder.absolutePath, manifest, errors);
    validateThemeInputContract(sourcePath, folder.absolutePath, manifest, errors);

    parsedManifests.push({ ...manifest, sourcePath });
  }

  return parsedManifests.sort((a, b) => a.id.localeCompare(b.id));
}

function validateEntryPath(sourcePath: string, actual: string, expected: string, errors: string[]) {
  if (actual !== expected) {
    errors.push(`${sourcePath}/component.manifest.json entry must use ${expected}, got ${actual}`);
  }

  if (actual.includes("..") || path.isAbsolute(actual)) {
    errors.push(
      `${sourcePath}/component.manifest.json entry path ${actual} must stay package-local`,
    );
  }
}

function validateSourceManifest(
  manifests: (ComponentManifest & { sourcePath: string })[],
  resolvedPackageRoot: string,
  errors: string[],
) {
  const sourceManifestPath = path.join(resolvedPackageRoot, "src/generated/source-manifest.ts");
  const source = readFileSync(sourceManifestPath, "utf8");

  for (const manifest of manifests) {
    const idPattern = new RegExp(`["']?id["']?\\s*:\\s*["']${escapeRegExp(manifest.id)}["']`);
    const pathPattern = new RegExp(
      `["']?sourcePath["']?\\s*:\\s*["']${escapeRegExp(manifest.sourcePath)}["']`,
    );

    if (!idPattern.test(source) || !pathPattern.test(source)) {
      errors.push(`source-manifest.ts must include ${manifest.id} at ${manifest.sourcePath}`);
    }
  }
}

function validatePackageDependencies(resolvedPackageRoot: string, errors: string[]) {
  const packageJson = JSON.parse(
    readFileSync(path.join(resolvedPackageRoot, "package.json"), "utf8"),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  const declared = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]);

  for (const file of listSourceFiles(path.join(resolvedPackageRoot, "src"))) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];
      if (!specifier || isPackageInternalSpecifier(specifier)) continue;

      const packageName = packageNameFromSpecifier(specifier);
      if (!declared.has(packageName)) {
        errors.push(
          `${relativeToPackage(file, resolvedPackageRoot)} imports undeclared package ${packageName}`,
        );
      }
    }
  }
}

function listSourceFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(absolutePath));
      continue;
    }

    if (/\.(ts|vue)$/.test(entry.name)) files.push(absolutePath);
  }

  return files;
}

function isPackageInternalSpecifier(specifier: string) {
  return (
    specifier.startsWith(".") ||
    specifier.startsWith("node:") ||
    specifier.startsWith("@/") ||
    specifier === "@flow-builder/components" ||
    specifier.startsWith("@flow-builder/components/")
  );
}

function packageNameFromSpecifier(specifier: string) {
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0]!;
}

function relativeToPackage(file: string, resolvedPackageRoot: string) {
  return path.relative(resolvedPackageRoot, file).replaceAll(path.sep, "/");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requiredComponentFilesForManifest(manifest: ComponentManifest) {
  return [
    ...baseRequiredComponentFiles,
    ...(manifest.transformKind === "module" ? (["transform.ts"] as const) : []),
  ];
}

function validateTransformContract(
  sourcePath: string,
  absolutePath: string,
  manifest: ComponentManifest,
  errors: string[],
) {
  if (manifest.transformKind === "module") {
    if (!manifest.entry.transform) {
      errors.push(
        `${sourcePath}/component.manifest.json module manifests must declare entry.transform as transform.ts`,
      );
      return;
    }

    validateEntryPath(sourcePath, manifest.entry.transform, "transform.ts", errors);
    return;
  }

  if (manifest.transformKind === "passthrough") {
    if (manifest.entry.transform !== undefined) {
      errors.push(
        `${sourcePath}/component.manifest.json passthrough manifests must not declare entry.transform; remove the transform entry`,
      );
    }

    if (existsSync(path.join(absolutePath, "transform.ts"))) {
      errors.push(
        `${sourcePath} uses transformKind passthrough but includes transform.ts; delete transform.ts or switch transformKind to module`,
      );
    }
    return;
  }

  errors.push(`${sourcePath}/component.manifest.json transformKind must be module or passthrough`);
}

function validateThemeInputContract(
  sourcePath: string,
  absolutePath: string,
  manifest: ComponentManifest,
  errors: string[],
) {
  const definitionPath = path.join(absolutePath, manifest.entry.definition);
  if (!existsSync(definitionPath)) return;

  const source = readFileSync(definitionPath, "utf8");

  if (manifest.id === "viz.theme") {
    errors.push(
      `${sourcePath}/component.manifest.json declares removed legacy component viz.theme; use canonical theme.theme`,
    );
  }

  const declaresVizThemeInput = Array.from(source.matchAll(/\{[^{}]*\}/g)).some(([inputBlock]) =>
    /acceptedTypeIds\s*:\s*\[[^\]]*["']viz-theme["'][^\]]*\]/.test(inputBlock),
  );

  if (declaresVizThemeInput) {
    errors.push(
      `${sourcePath}/component.ts declares a removed viz-theme input; use canonical component-theme only on approved layout components`,
    );
  }

  const declaresVizThemeOutput = Array.from(source.matchAll(/\{[^{}]*\}/g)).some(([outputBlock]) =>
    /typeId\s*:\s*["']viz-theme["']/.test(outputBlock),
  );

  if (declaresVizThemeOutput) {
    errors.push(
      `${sourcePath}/component.ts declares a removed viz-theme output; use canonical theme.theme component-theme output`,
    );
  }

  if (isApprovedComponentThemeInputComponentId(manifest.id)) return;

  const declaresComponentThemeInput = Array.from(source.matchAll(/\{[^{}]*\}/g)).some(
    ([inputBlock]) =>
      /acceptedTypeIds\s*:\s*\[[^\]]*["']component-theme["'][^\]]*\]/.test(inputBlock),
  );

  if (declaresComponentThemeInput) {
    errors.push(
      `${sourcePath}/component.ts declares a component-theme input; only approved layout components may declare component-theme inputs`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await validateComponentLibrary();

  if (result.errors.length > 0) {
    console.error(`Component package validation failed with ${result.errors.length} issue(s):`);
    if (result.generatedOutputIssues.length > 0) {
      console.error("Generated output issues:");
      for (const error of result.generatedOutputIssues) console.error(`- ${error}`);
    }
    if (result.manifestDriftIssues.length > 0) {
      console.error("Manifest drift issues:");
      for (const error of result.manifestDriftIssues) console.error(`- ${error}`);
    }
    const structuralIssues = result.errors.filter(
      (error) =>
        !result.generatedOutputIssues.includes(error) &&
        !result.manifestDriftIssues.includes(error),
    );
    if (structuralIssues.length > 0) {
      console.error("Structural validation issues:");
      for (const error of structuralIssues) console.error(`- ${error}`);
    }
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn(`Component package validation passed with ${result.warnings.length} warning(s):`);
    for (const warning of result.warnings) console.warn(`- ${warning}`);
  }

  console.log(`Component package validation passed for ${result.componentCount} components.`);
}
