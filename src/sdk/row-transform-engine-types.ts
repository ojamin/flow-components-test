import { z } from "zod";

import { jsonValueSchema } from "./schema-primitives";

const fieldPathSchema = z.string().trim().min(1);
const prototypeSensitiveOutputKeys = new Set(["__proto__", "prototype", "constructor"]);

export function isPrototypeSensitiveOutputKey(field: string): boolean {
  return prototypeSensitiveOutputKeys.has(field);
}

export function assertSafeRowTransformOutputField(field: string, configPath: string): string {
  if (isPrototypeSensitiveOutputKey(field)) {
    throw new Error(
      `Invalid row transform output field at ${configPath}: "${field}" is reserved because it can mutate object prototypes or confuse JSON object handling.`,
    );
  }
  return field;
}

function addPrototypeSensitiveOutputIssue(
  context: z.RefinementCtx,
  path: (string | number)[],
  field: string,
): void {
  if (!isPrototypeSensitiveOutputKey(field)) return;
  context.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message: `Invalid row transform output field "${field}": reserved prototype-sensitive output fields are not allowed.`,
  });
}

const requiredOutputFieldSchema = z
  .string()
  .trim()
  .min(1)
  .superRefine((field, context) => {
    addPrototypeSensitiveOutputIssue(context, [], field);
  });
const outputFieldSchema = requiredOutputFieldSchema.optional();

export const rowSortDirectionSchema = z.enum(["asc", "desc"]);
export const rowAggregateOperationSchema = z.enum(["sum", "min", "max", "average", "count"]);

export const rowTransformBaseConfigSchema = z.object({
  rowsPath: z.string().default(""),
});

export const rowSortConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("sort"),
  keys: z
    .array(z.object({ field: fieldPathSchema, direction: rowSortDirectionSchema.default("asc") }))
    .min(1),
});

export const rowFilterOperatorSchema = z.enum([
  "equals",
  "notEquals",
  "contains",
  "startsWith",
  "endsWith",
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
  "exists",
  "isEmpty",
  "in",
  "notIn",
]);

export const rowFilterConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("filter"),
  clauses: z
    .array(
      z.object({
        field: fieldPathSchema,
        operator: rowFilterOperatorSchema,
        value: jsonValueSchema.optional(),
      }),
    )
    .min(1),
  match: z.enum(["all", "any"]).default("all"),
});

export const rowSelectConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("select"),
  fields: z
    .array(z.object({ sourceField: fieldPathSchema, outputField: outputFieldSchema }))
    .min(1),
});

export const rowLookupConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("lookup"),
  lookupRowsPath: z.string().default(""),
  leftKey: fieldPathSchema,
  rightKey: fieldPathSchema,
  fields: z
    .array(z.object({ sourceField: fieldPathSchema, outputField: outputFieldSchema }))
    .default([]),
  unmatched: z.enum(["keep", "drop"]).default("keep"),
  multiple: z.enum(["first", "all"]).default("first"),
  prefix: z.string().trim().default("lookup_"),
});

export const rowAggregateConfigSchema = z
  .object({
    sourceField: fieldPathSchema.optional(),
    operation: rowAggregateOperationSchema,
    outputField: z.string().trim().default(""),
  })
  .superRefine((config, context) => {
    if (config.outputField)
      addPrototypeSensitiveOutputIssue(context, ["outputField"], config.outputField);
    if (config.operation !== "count" && !config.sourceField) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceField"],
        message: "sourceField is required for non-count aggregates.",
      });
    }
  });

export const rowGroupConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("group"),
  groupByFields: z.array(fieldPathSchema).min(1),
  countField: requiredOutputFieldSchema.default("groupby_count"),
  aggregates: z.array(rowAggregateConfigSchema).default([]),
});

export const rowPivotConfigSchema = rowTransformBaseConfigSchema
  .extend({
    operation: z.literal("pivot"),
    groupByFields: z.array(fieldPathSchema).min(1),
    pivotField: fieldPathSchema,
    valueField: fieldPathSchema.optional(),
    aggregate: rowAggregateOperationSchema.default("count"),
    outputPrefix: z.string().trim().default(""),
    countField: requiredOutputFieldSchema.default("pivot_count"),
  })
  .superRefine((config, context) => {
    if (config.aggregate !== "count" && !config.valueField) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valueField"],
        message: "valueField is required for non-count pivot aggregates.",
      });
    }
  });

export const rowFlattenConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("flatten"),
  field: fieldPathSchema,
  outputField: outputFieldSchema,
  keepEmpty: z.boolean().default(false),
});

export const rowDedupeConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("dedupe"),
  keyFields: z.array(fieldPathSchema).default([]),
  keep: z.enum(["first", "last"]).default("first"),
});

export const rowDateBucketConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("dateBucket"),
  field: fieldPathSchema,
  outputField: outputFieldSchema,
  granularity: z.enum(["hour", "day", "week", "month", "year"]).default("day"),
});

export const rowNormalizeMethodSchema = z.enum(["minMax", "zScore"]);

export const rowNormalizeConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("normalize"),
  fields: z
    .array(
      z.object({
        sourceField: fieldPathSchema,
        outputField: outputFieldSchema,
        method: rowNormalizeMethodSchema.default("minMax"),
      }),
    )
    .min(1),
});

export const rowFormatOperationSchema = z.enum([
  "string",
  "uppercase",
  "lowercase",
  "trim",
  "numberFixed",
  "dateIso",
]);

export const rowFormatConfigSchema = rowTransformBaseConfigSchema.extend({
  operation: z.literal("format"),
  fields: z
    .array(
      z.object({
        sourceField: fieldPathSchema,
        outputField: outputFieldSchema,
        format: rowFormatOperationSchema,
        decimals: z.number().int().min(0).max(12).default(2),
      }),
    )
    .min(1),
});

export const rowTransformConfigSchema = z.discriminatedUnion("operation", [
  rowSortConfigSchema,
  rowFilterConfigSchema,
  rowSelectConfigSchema,
  rowLookupConfigSchema,
  rowGroupConfigSchema,
  rowPivotConfigSchema,
  rowFlattenConfigSchema,
  rowDedupeConfigSchema,
  rowDateBucketConfigSchema,
  rowNormalizeConfigSchema,
  rowFormatConfigSchema,
]);

export type RowTransformConfig = z.output<typeof rowTransformConfigSchema>;
export type RowTransformInputConfig = z.input<typeof rowTransformConfigSchema>;
export type RowAggregateOperation = z.output<typeof rowAggregateOperationSchema>;
export type RowFilterOperator = z.output<typeof rowFilterOperatorSchema>;
