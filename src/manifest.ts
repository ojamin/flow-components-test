import { z } from "zod";

export const componentManifestGroupSchema = z.enum([
  "chart",
  "content",
  "civic",
  "data",
  "layout",
  "marketing",
  "theme",
  "transform",
  "vmap1",
  "viz",
]);

export type ComponentManifestGroup = z.infer<typeof componentManifestGroupSchema>;

const componentIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)?$/, "Invalid component id.");

const sha256Schema = z
  .string()
  .regex(/^sha256:[a-f0-9]{64}$/, "Expected sha256:<64 lowercase hex characters>.");

const localPathSchema = z
  .string()
  .min(1)
  .superRefine((value, context) => {
    if (value.startsWith("/") || value.includes("\\") || value.split("/").includes("..")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Path must be a package-local relative path without traversal.",
      });
    }
  });

export const componentManifestEntrySchema = z.object({
  definition: localPathSchema,
  renderer: localPathSchema,
  configPanel: localPathSchema,
  transform: localPathSchema.optional(),
});

export const componentManifestResponsiveDefaultsSchema = z.object({
  mobileFullWidth: z.boolean().optional(),
  mobileMinRows: z.number().int().positive().optional(),
});

export const fixtureVariantMetaSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1).optional(),
  appliesTo: z.enum(["fixture-data", "config"]).optional(),
});

export const stateApplicabilitySchema = z.union([
  z.literal(true),
  z.object({ notApplicable: z.string().min(1) }),
]);

export const stateSupportMetaSchema = z.object({
  empty: stateApplicabilitySchema,
  loading: stateApplicabilitySchema,
  error: stateApplicabilitySchema,
  disabled: stateApplicabilitySchema,
  focus: stateApplicabilitySchema,
  keyboard: stateApplicabilitySchema,
  responsive: stateApplicabilitySchema,
});

export const componentManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: componentIdSchema,
    displayName: z.string().min(1),
    group: componentManifestGroupSchema,
    section: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)),
    version: z.string().min(1),
    renderable: z.boolean(),
    responsiveDefaults: componentManifestResponsiveDefaultsSchema.optional(),
    fixtureVariants: z.array(fixtureVariantMetaSchema).optional(),
    stateSupport: stateSupportMetaSchema.optional(),
    transformKind: z.enum(["module", "passthrough"]).default("module"),
    entry: componentManifestEntrySchema,
  })
  .superRefine((manifest, context) => {
    const hasTransform = manifest.entry.transform !== undefined;

    if (manifest.transformKind === "passthrough" && hasTransform) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entry", "transform"],
        message: "Passthrough component manifests must not declare entry.transform.",
      });
    }

    if (manifest.transformKind === "module" && !hasTransform) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entry", "transform"],
        message: "Module component manifests must declare entry.transform.",
      });
    }
  });

export type ComponentManifest = z.infer<typeof componentManifestSchema>;

export const componentManifestSummarySchema = z.object({
  id: componentIdSchema,
  displayName: z.string().min(1),
  group: componentManifestGroupSchema,
  section: z.string().min(1).optional(),
  source: z.literal("static"),
  sourceId: z.string().min(1),
  version: z.string().min(1),
  renderable: z.boolean(),
  tags: z.array(z.string().min(1)),
  sourcePath: localPathSchema,
  contentHash: sha256Schema,
  runtimeRequirements: z.array(z.string().min(1)).optional(),
  responsiveDefaults: componentManifestResponsiveDefaultsSchema.optional(),
  fixtureVariants: z.array(fixtureVariantMetaSchema).optional(),
  stateSupport: stateSupportMetaSchema.optional(),
  deprecated: z.boolean().optional(),
  experimental: z.boolean().optional(),
});

export type ComponentManifestSummary = z.infer<typeof componentManifestSummarySchema>;

export const componentGroupSummarySchema = z.object({
  id: componentManifestGroupSchema,
  displayName: z.string().min(1),
  componentIds: z.array(componentIdSchema),
});

export type ComponentGroupSummary = z.infer<typeof componentGroupSummarySchema>;

export const componentSourceManifestSchema = z.object({
  schemaVersion: z.literal(1),
  sourceId: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  packageName: z.string().min(1).optional(),
  commit: z.string().min(1).optional(),
  components: z.array(componentManifestSummarySchema),
  groups: z.array(componentGroupSummarySchema),
  fingerprints: z.object({
    manifestHash: sha256Schema,
    filesHash: sha256Schema,
  }),
});

export type GeneratedComponentSourceManifest = z.infer<typeof componentSourceManifestSchema>;

export type ParseComponentManifestOptions = {
  folderGroup?: ComponentManifestGroup;
  requiredEntries?: readonly (keyof ComponentManifest["entry"])[];
};

export function parseComponentManifest(
  candidate: unknown,
  options: ParseComponentManifestOptions = {},
): ComponentManifest {
  const manifest = componentManifestSchema.parse(candidate);

  if (options.folderGroup && manifest.group !== options.folderGroup) {
    throw new Error(
      `Component manifest group "${manifest.group}" must match folder group "${options.folderGroup}".`,
    );
  }

  for (const entryKey of options.requiredEntries ?? []) {
    if (!manifest.entry[entryKey]) {
      throw new Error(`Component manifest entry "${entryKey}" is required.`);
    }
  }

  return manifest;
}

export function parseComponentSourceManifest(candidate: unknown): GeneratedComponentSourceManifest {
  const manifest = componentSourceManifestSchema.parse(candidate);
  const componentIds = new Set(manifest.components.map((component) => component.id));

  for (const group of manifest.groups) {
    for (const componentId of group.componentIds) {
      if (!componentIds.has(componentId)) {
        throw new Error(
          `Source manifest group "${group.id}" references unknown component "${componentId}".`,
        );
      }
    }
  }

  return manifest;
}
