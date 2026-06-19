import { z } from "zod";

import { jsonValueSchema, type JsonValue } from "../schema-primitives";

export const datasetDerivationKinds = [
  "root-json-parse",
  "path-index",
  "table-columns",
  "chart-field-options",
  "chart-series-mapping",
] as const;

export type DatasetDerivationKind = (typeof datasetDerivationKinds)[number];

export const datasetDerivationKindSchema = z.enum(datasetDerivationKinds);

export const datasetDerivationHashSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
export const datasetDerivationRevisionSchema = z.union([z.string().min(1), z.number().int()]);

export const datasetDerivationRootSourceSchema = z
  .object({
    id: z.string().min(1),
    contentRevision: datasetDerivationRevisionSchema.optional(),
    contentHash: datasetDerivationHashSchema.optional(),
  })
  .refine((source) => source.contentRevision !== undefined || source.contentHash !== undefined, {
    message: "Root-source content revision or content hash is required.",
  });

export type DatasetDerivationRootSource = z.infer<typeof datasetDerivationRootSourceSchema>;

export const datasetDerivationTargetSchema = z
  .object({
    componentId: z.string().min(1).optional(),
    transformId: z.string().min(1).optional(),
  })
  .refine((target) => target.componentId !== undefined || target.transformId !== undefined, {
    message: "Component id or transform id is required.",
  });

export type DatasetDerivationTarget = z.infer<typeof datasetDerivationTargetSchema>;

export const datasetDerivationMaterializationSchema = z
  .object({
    definitionRevision: datasetDerivationRevisionSchema.optional(),
    sourceRevision: datasetDerivationRevisionSchema.optional(),
    materializationRevision: datasetDerivationRevisionSchema.optional(),
    definitionHash: datasetDerivationHashSchema.optional(),
    sourceHash: datasetDerivationHashSchema.optional(),
    materializationHash: datasetDerivationHashSchema.optional(),
  })
  .refine(
    (materialization) =>
      materialization.definitionRevision !== undefined ||
      materialization.sourceRevision !== undefined ||
      materialization.materializationRevision !== undefined ||
      materialization.definitionHash !== undefined ||
      materialization.sourceHash !== undefined ||
      materialization.materializationHash !== undefined,
    { message: "Definition, source, or materialization revision/hash is required." },
  );

export type DatasetDerivationMaterialization = z.infer<
  typeof datasetDerivationMaterializationSchema
>;

export const datasetDerivationCacheKeyPartsSchema = z.object({
  kind: datasetDerivationKindSchema,
  rootSource: datasetDerivationRootSourceSchema,
  datasetPath: z.string().min(1),
  target: datasetDerivationTargetSchema,
  materialization: datasetDerivationMaterializationSchema,
  configSignature: datasetDerivationHashSchema,
});

export type DatasetDerivationCacheKeyParts = z.infer<typeof datasetDerivationCacheKeyPartsSchema>;

export const datasetDerivationRequestSchema = datasetDerivationCacheKeyPartsSchema.extend({
  requestId: z.string().min(1),
  projectRevision: datasetDerivationRevisionSchema.optional(),
  expectedProjectRevision: datasetDerivationRevisionSchema.optional(),
  cacheKey: z.string().min(1).optional(),
  // Execution payloads are intentionally request-scoped and must not be used as cache-key
  // identity. They let render/config hosts hand a sampled dataset plus derivation-specific
  // options to the service without forcing every caller to define a parallel request type.
  dataset: jsonValueSchema.optional(),
  table: z.unknown().optional(),
  chartFieldOptions: z.unknown().optional(),
  chartSeriesMapping: z.unknown().optional(),
});

export type DatasetDerivationRequest = z.infer<typeof datasetDerivationRequestSchema>;

export const datasetPathIndexEntrySchema = z.object({
  path: z.string().min(1),
  valueKind: z.enum(["null", "boolean", "number", "string", "array", "object"]),
  childCount: z.number().int().nonnegative().optional(),
});

export type DatasetPathIndexEntry = z.infer<typeof datasetPathIndexEntrySchema>;

export const datasetTableColumnSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  valueKind: z.enum(["boolean", "number", "string", "date", "mixed", "unknown"]),
  sampleCount: z.number().int().nonnegative().optional(),
});

export type DatasetTableColumn = z.infer<typeof datasetTableColumnSchema>;

export const datasetChartFieldRoleSchema = z.enum(["x", "y", "label", "value"]);

export const datasetChartFieldOptionSchema = z.object({
  id: z.string().min(1).optional(),
  path: z.string().min(1),
  label: z.string().min(1),
  sampleValue: z.string().nullable(),
  availableRowCount: z.number().int().nonnegative(),
  numericRowCount: z.number().int().nonnegative(),
  categoricalRowCount: z.number().int().nonnegative(),
  supportedRoles: z.array(datasetChartFieldRoleSchema),
  valueKind: z.enum(["number", "string", "date", "category", "mixed", "unknown"]).optional(),
});

export type DatasetChartFieldOption = z.infer<typeof datasetChartFieldOptionSchema>;

export const datasetChartAdapterStateSchema = z.object({
  tone: z.enum(["ready", "loading", "empty", "error"]),
  title: z.string().nullable(),
  description: z.string().nullable(),
});

export const datasetChartSeriesPointSchema = z.object({
  x: z.union([z.string(), z.number().finite()]),
  y: z.number().finite(),
  xLabel: z.string().nullable().optional(),
});

export const datasetChartSliceSchema = z.object({
  label: z.string().min(1),
  value: z.number().finite(),
});

const datasetChartSeriesMappingBaseSchema = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
  totalRowCount: z.number().int().nonnegative(),
  skippedRowCount: z.number().int().nonnegative(),
  state: datasetChartAdapterStateSchema,
});

export const datasetChartSeriesMappingSchema = z.discriminatedUnion("kind", [
  datasetChartSeriesMappingBaseSchema.extend({
    kind: z.literal("xy"),
    data: z.array(datasetChartSeriesPointSchema),
    fields: z.object({ x: z.string(), y: z.string() }),
  }),
  datasetChartSeriesMappingBaseSchema.extend({
    kind: z.literal("slice"),
    data: z.array(datasetChartSliceSchema),
    fields: z.object({ label: z.string(), value: z.string() }),
  }),
]);

export type DatasetChartSeriesMapping = z.infer<typeof datasetChartSeriesMappingSchema>;

export const datasetDerivationResultSchema = z.object({
  parsedJson: jsonValueSchema.optional(),
  pathIndex: z.array(datasetPathIndexEntrySchema).optional(),
  tableColumns: z.array(datasetTableColumnSchema).optional(),
  chartFieldOptions: z.array(datasetChartFieldOptionSchema).optional(),
  chartSeriesMappings: z.array(datasetChartSeriesMappingSchema).optional(),
  diagnostics: z
    .array(
      z.object({
        code: z.string().min(1),
        message: z.string().min(1),
        severity: z.enum(["info", "warning", "error"]),
      }),
    )
    .optional(),
});

export type DatasetDerivationResult = z.infer<typeof datasetDerivationResultSchema>;

export const datasetDerivationErrorSchema = z.object({
  category: z.enum([
    "invalid-json",
    "worker-failure",
    "stale-revision",
    "unsupported-derivation",
    "cancelled",
  ]),
  message: z.string().min(1),
  safeDetails: z.string().optional(),
});

export type DatasetDerivationError = z.infer<typeof datasetDerivationErrorSchema>;

export const datasetDerivationResponseSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("success"),
      requestId: z.string().min(1),
      kind: datasetDerivationKindSchema,
      cacheKey: z.string().min(1).optional(),
      result: datasetDerivationResultSchema,
    })
    .superRefine((response, context) => {
      const hasExpectedResult =
        (response.kind === "root-json-parse" && response.result.parsedJson !== undefined) ||
        (response.kind === "path-index" && response.result.pathIndex !== undefined) ||
        (response.kind === "table-columns" && response.result.tableColumns !== undefined) ||
        (response.kind === "chart-field-options" &&
          response.result.chartFieldOptions !== undefined) ||
        (response.kind === "chart-series-mapping" &&
          response.result.chartSeriesMappings !== undefined);

      if (!hasExpectedResult) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Successful dataset derivation responses must include the result field for their kind.",
          path: ["result"],
        });
      }
    }),
  z.object({
    status: z.literal("failure"),
    requestId: z.string().min(1),
    error: datasetDerivationErrorSchema,
  }),
  z.object({
    status: z.literal("stale"),
    requestId: z.string().min(1),
    expectedRevision: datasetDerivationRevisionSchema.optional(),
    actualRevision: datasetDerivationRevisionSchema.optional(),
  }),
]);

export type DatasetDerivationResponse = z.infer<typeof datasetDerivationResponseSchema>;

export const datasetDerivationProgressSchema = z.object({
  requestId: z.string().min(1),
  stage: z.enum(["queued", "parsing", "indexing", "deriving", "completed"]),
  completedUnits: z.number().finite().nonnegative().optional(),
  totalUnits: z.number().finite().positive().optional(),
  message: z.string().optional(),
});

export type DatasetDerivationProgress = z.infer<typeof datasetDerivationProgressSchema>;

export interface DatasetDerivationService {
  derive(
    request: DatasetDerivationRequest,
    onProgress?: (progress: DatasetDerivationProgress) => void,
  ): Promise<DatasetDerivationResponse>;
  clearCache(scope?: { projectId?: string; rootSourceId?: string }): void;
}

export type DatasetDerivationJsonValue = JsonValue;
