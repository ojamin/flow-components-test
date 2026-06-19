import type { ComponentManifest } from "../manifest";
import type { ComponentDefinition, StateSupportMeta } from "./component-definition";
import {
  categoryOverrides,
  groupToCategory,
  type ComponentCategory,
  type ComponentGroupId,
} from "./taxonomy";

export interface ManifestDriftIssue {
  componentId: string;
  field: string;
  manifestValue: unknown;
  definitionValue: unknown;
  message: string;
}

export interface DriftCheckContext {
  /** Group inferred from the component's folder path (e.g. `content` for `groups/content/heading`). */
  folderGroup: ComponentGroupId;
  /** Optional taxonomy injection used by focused validator tests. Production callers use taxonomy.ts. */
  taxonomy?: {
    groupToCategory?: Partial<Record<ComponentGroupId, ComponentCategory>>;
    categoryOverrides?: Partial<Record<string, ComponentCategory>>;
  };
}

export interface StateSupportMetadataIssue {
  componentId: string;
  severity: "warning" | "error";
  field: "fixtureVariants" | "stateSupport" | `stateSupport.${keyof StateSupportMeta}`;
  message: string;
}

export interface StateSupportMetadataOptions {
  strict?: boolean;
}

const requiredStateSupportFields = [
  "empty",
  "loading",
  "error",
  "disabled",
  "focus",
  "keyboard",
  "responsive",
] as const satisfies readonly (keyof StateSupportMeta)[];

export function collectStateSupportMetadataIssues(
  definitions: readonly ComponentDefinition<any>[],
  options: StateSupportMetadataOptions = {},
): StateSupportMetadataIssue[] {
  const severity = options.strict ? "error" : "warning";
  const issues: StateSupportMetadataIssue[] = [];

  for (const definition of definitions) {
    if (!definition.renderable) continue;

    if (!definition.fixtureVariants || definition.fixtureVariants.length === 0) {
      issues.push({
        componentId: definition.id,
        severity,
        field: "fixtureVariants",
        message:
          "Component definition is missing fixtureVariants metadata for package preview matrix coverage.",
      });
    }

    if (!definition.stateSupport) {
      issues.push({
        componentId: definition.id,
        severity,
        field: "stateSupport",
        message:
          "Component definition is missing StateSupport metadata for package preview matrix coverage.",
      });
      continue;
    }

    for (const field of requiredStateSupportFields) {
      if (!definition.stateSupport[field]) {
        issues.push({
          componentId: definition.id,
          severity,
          field: `stateSupport.${field}`,
          message: `Component definition is missing StateSupport.${field} metadata for package preview matrix coverage.`,
        });
      }
    }
  }

  return issues;
}

export function findManifestDrift(
  definition: ComponentDefinition<any>,
  manifest: ComponentManifest,
  context: DriftCheckContext,
): ManifestDriftIssue[] {
  const issues: ManifestDriftIssue[] = [];
  const componentId = manifest.id;

  const pushIssue = (
    field: string,
    manifestValue: unknown,
    definitionValue: unknown,
    message: string,
  ) => issues.push({ componentId, field, manifestValue, definitionValue, message });

  if (definition.id !== manifest.id) {
    pushIssue(
      "id",
      manifest.id,
      definition.id,
      `Definition id "${definition.id}" disagrees with manifest id "${manifest.id}"`,
    );
  }
  if (definition.displayName !== manifest.displayName) {
    pushIssue(
      "displayName",
      manifest.displayName,
      definition.displayName,
      `displayName disagrees: manifest="${manifest.displayName}" definition="${definition.displayName}"`,
    );
  }
  if (String(definition.version) !== manifest.version.split(".")[0]) {
    pushIssue(
      "version",
      manifest.version,
      definition.version,
      `Major version disagrees: manifest="${manifest.version}" definition="${definition.version}"`,
    );
  }
  if (definition.renderable !== manifest.renderable) {
    pushIssue("renderable", manifest.renderable, definition.renderable, "renderable disagrees");
  }
  if (manifest.group !== context.folderGroup) {
    pushIssue(
      "group",
      manifest.group,
      context.folderGroup,
      `manifest.group "${manifest.group}" must match folder group "${context.folderGroup}"`,
    );
  }

  // Folder-derived group is canonical; a stale manifest.group must not hide taxonomy drift.
  const categoryGroup = context.folderGroup;
  const taxonomyGroupToCategory = context.taxonomy?.groupToCategory ?? groupToCategory;
  const taxonomyCategoryOverrides = context.taxonomy?.categoryOverrides ?? categoryOverrides;
  const expectedCategory =
    taxonomyCategoryOverrides[manifest.id] ?? taxonomyGroupToCategory[categoryGroup];
  if (!expectedCategory) {
    pushIssue(
      "category",
      categoryGroup,
      definition.category,
      `No category mapping for folder group "${categoryGroup}"`,
    );
  } else if (expectedCategory !== definition.category) {
    pushIssue(
      "category",
      expectedCategory,
      definition.category,
      `Definition category "${definition.category}" does not match group→category mapping for "${categoryGroup}" (expected "${expectedCategory}")`,
    );
  }

  return issues;
}
