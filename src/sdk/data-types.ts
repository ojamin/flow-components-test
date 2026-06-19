import { z, type ZodTypeAny } from "zod";

import {
  componentThemeContextSchema,
  componentThemeSchema as componentThemePayloadSchema,
  type ComponentThemeContextV1,
  type ComponentThemeV1,
} from "../themes";
import {
  isoDateTimeSchema,
  jsonObjectSchema,
  jsonPrimitiveSchema,
  jsonValueSchema,
} from "./schema-primitives";
import {
  vmap1DatasetDescriptorSchema,
  vmap1DatasetRegistrySchema,
  vmap1DatasetStatusSchema,
  vmap1DeckLayerDescriptorSchema,
  vmap1InitialViewSchema,
  vmap1LayerDescriptorSchema,
  vmap1PmtilesSourceDescriptorSchema,
  vmap1ResolvedDatasetSchema,
  vmap1SourceRegistrySchema,
  vmap1StyleDescriptorSchema,
  vmap1TerrainDescriptorSchema,
  vmap1TileSourceDescriptorSchema,
} from "./vmap1-data-type-schemas";

export interface DataTypeDefinition {
  id: string;
  label: string;
  description: string;
  schema: ZodTypeAny;
}

const chartPointSchema = z.object({
  x: z.union([z.string(), z.number().finite()]),
  y: z.number().finite(),
  xLabel: z.string().nullable().optional(),
});

const chartSliceSchema = z.object({
  label: z.string().min(1),
  value: z.number().finite(),
});

const chartCartesianPointSchema = z.object({
  x: z.union([z.number().finite(), z.string()]),
  y: z.number().finite(),
  seriesName: z.string().optional(),
});

const chartDonutSliceSchema = z.object({
  label: z.string(),
  value: z.number().finite(),
});

const chartRangeSchema = z.object({
  x0: z.number().finite(),
  x1: z.number().finite(),
});

const chartLegendStateSchema = z.object({
  seriesName: z.string(),
  visible: z.boolean(),
});

const chartMatrixCellSchema = z.object({
  rowKey: z.string(),
  columnKey: z.string(),
  rowIndex: z.number().int().nonnegative(),
  columnIndex: z.number().int().nonnegative(),
  value: z.number().finite(),
  rowLabel: z.string().optional(),
  columnLabel: z.string().optional(),
  source: jsonObjectSchema.optional(),
});

const geoPointSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
  id: z.string().optional(),
  label: z.string().optional(),
  value: z.number().finite().optional(),
  source: jsonObjectSchema.optional(),
});

const graphNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  group: z.string().optional(),
  value: z.number().finite().optional(),
  source: jsonObjectSchema.optional(),
});

const graphEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  id: z.string().optional(),
  label: z.string().optional(),
  value: z.number().finite().optional(),
  sourceData: jsonObjectSchema.optional(),
});

export const componentThemeSchema = z.union([
  componentThemePayloadSchema,
  componentThemeContextSchema,
]);
export { componentThemeContextSchema, componentThemePayloadSchema };
export type { ComponentThemeContextV1, ComponentThemeV1 };

export const dataTypeDefinitions = [
  {
    id: "all-data",
    label: "All data",
    description: "Any JSON-serializable value.",
    schema: jsonValueSchema,
  },
  {
    id: "json-object",
    label: "JSON object",
    description: "A JSON object with string keys and JSON values.",
    schema: jsonObjectSchema,
  },
  {
    id: "json-array",
    label: "JSON array",
    description: "An ordered list of JSON values.",
    schema: z.array(jsonValueSchema),
  },
  {
    id: "primitive",
    label: "Primitive",
    description: "A string, number, boolean, or null JSON value.",
    schema: jsonPrimitiveSchema,
  },
  {
    id: "text-value",
    label: "Text value",
    description: "A plain text string value.",
    schema: z.string(),
  },
  {
    id: "url-string",
    label: "URL string",
    description: "A fully qualified URL string.",
    schema: z.string().url(),
  },
  {
    id: "event-timestamp",
    label: "Event timestamp",
    description: "An ISO-8601 timestamp captured when a component event fires.",
    schema: z.string().datetime(),
  },
  {
    id: "table-rows",
    label: "Table rows",
    description: "An array of JSON objects suitable for tabular rows.",
    schema: z.array(jsonObjectSchema),
  },
  {
    id: "key-value-object",
    label: "Key/value object",
    description: "A JSON object represented as named key/value pairs.",
    schema: jsonObjectSchema,
  },
  {
    id: "chart-series-xy",
    label: "Chart series (x/y)",
    description: "An array of chart points with x and y coordinates.",
    schema: z.array(chartPointSchema),
  },
  {
    id: "chart-slices",
    label: "Chart slices",
    description: "An array of labeled numeric chart slices.",
    schema: z.array(chartSliceSchema),
  },
  {
    id: "chart-cartesian-point",
    label: "Chart cartesian point",
    description: "A chart event payload for a clicked or hovered cartesian chart point.",
    schema: chartCartesianPointSchema,
  },
  {
    id: "chart-donut-slice",
    label: "Chart donut slice",
    description: "A chart event payload for a clicked or hovered donut slice.",
    schema: chartDonutSliceSchema,
  },
  {
    id: "chart-range",
    label: "Chart range",
    description: "A chart event payload for a selected numeric x-axis range.",
    schema: chartRangeSchema,
  },
  {
    id: "chart-legend-state",
    label: "Chart legend state",
    description: "A chart event payload for a toggled series legend item.",
    schema: chartLegendStateSchema,
  },
  {
    id: "chart-matrix-cell",
    label: "Chart matrix cell",
    description: "A chart event payload for a clicked matrix, heatmap, or region-grid cell.",
    schema: chartMatrixCellSchema,
  },
  {
    id: "geo-point",
    label: "Geographic point",
    description: "A visualization event payload for a selected latitude/longitude point.",
    schema: geoPointSchema,
  },
  {
    id: "graph-node",
    label: "Graph node",
    description: "A visualization event payload for a selected graph node.",
    schema: graphNodeSchema,
  },
  {
    id: "graph-edge",
    label: "Graph edge",
    description: "A visualization event payload for a selected graph edge.",
    schema: graphEdgeSchema,
  },
  {
    id: "component-theme",
    label: "Component theme",
    description: "A canonical package component theme with fixed visual role maps.",
    schema: componentThemeSchema,
  },
  {
    id: "fetch-meta",
    label: "Fetch metadata",
    description: "Runtime fetch state metadata for manual and remote data sources.",
    schema: z.object({
      kind: z.enum(["manual", "remote"]),
      fetchedAt: isoDateTimeSchema.optional(),
      status: z.enum(["error", "failure", "idle", "loading", "stale-cache", "success"]).optional(),
      error: z
        .object({
          category: z.string().min(1),
          message: z.string().min(1),
          status: z.number().int().optional(),
          details: z.string().optional(),
        })
        .optional(),
    }),
  },
  {
    id: "vmap1.style-descriptor",
    label: "VMap style descriptor",
    description: "A canonical vmap1 map style descriptor for URL, inline, or preset styles.",
    schema: vmap1StyleDescriptorSchema,
  },
  {
    id: "vmap1.tile-source-descriptor",
    label: "VMap tile source descriptor",
    description: "A canonical vmap1 MapLibre tile source descriptor.",
    schema: vmap1TileSourceDescriptorSchema,
  },
  {
    id: "vmap1.pmtiles-source-descriptor",
    label: "VMap PMTiles source descriptor",
    description: "A canonical vmap1 PMTiles tile source descriptor.",
    schema: vmap1PmtilesSourceDescriptorSchema,
  },
  {
    id: "vmap1.terrain-descriptor",
    label: "VMap terrain descriptor",
    description: "A canonical vmap1 terrain source activation descriptor.",
    schema: vmap1TerrainDescriptorSchema,
  },
  {
    id: "vmap1.dataset-descriptor",
    label: "VMap dataset descriptor",
    description:
      "A canonical vmap1 dataset descriptor with source, status, and resolved dataset state.",
    schema: vmap1DatasetDescriptorSchema,
  },
  {
    id: "vmap1.dataset-status",
    label: "VMap dataset status",
    description:
      "Runtime loading, ready, idle, or error status emitted by vmap1 dataset components.",
    schema: vmap1DatasetStatusSchema,
  },
  {
    id: "vmap1.resolved-dataset",
    label: "VMap resolved dataset",
    description: "A resolved GeoJSON-compatible dataset emitted by vmap1 dataset components.",
    schema: vmap1ResolvedDatasetSchema,
  },
  {
    id: "vmap1.dataset-registry",
    label: "VMap dataset registry",
    description: "A canonical vmap1 registry of dataset descriptors and resolved dataset outputs.",
    schema: vmap1DatasetRegistrySchema,
  },
  {
    id: "vmap1.source-registry",
    label: "VMap source registry",
    description:
      "A canonical vmap1 source registry merging tiles, PMTiles, datasets, terrain, and diagnostics.",
    schema: vmap1SourceRegistrySchema,
  },
  {
    id: "vmap1.layer-descriptor",
    label: "VMap layer descriptor",
    description: "A canonical vmap1 MapLibre layer descriptor referencing public source IDs.",
    schema: vmap1LayerDescriptorSchema,
  },
  {
    id: "vmap1.deck-layer-descriptor",
    label: "VMap deck layer descriptor",
    description: "A canonical vmap1 deck.gl overlay descriptor referencing public source IDs.",
    schema: vmap1DeckLayerDescriptorSchema,
  },
  {
    id: "vmap1.initial-view",
    label: "VMap initial view",
    description: "Initial vmap1 camera state for center, zoom, pitch, and bearing.",
    schema: vmap1InitialViewSchema,
  },
] as const satisfies readonly DataTypeDefinition[];

export type DataTypeId = (typeof dataTypeDefinitions)[number]["id"];

export const dataTypeDefinitionsById: ReadonlyMap<string, DataTypeDefinition> = new Map(
  dataTypeDefinitions.map((definition) => [definition.id, definition] as const),
);

export const dataTypeIds = dataTypeDefinitions.map((definition) => definition.id);

export function getDataTypeDefinition(typeId: string): DataTypeDefinition | undefined {
  return dataTypeDefinitionsById.get(typeId);
}

export function getDataTypeSchema(typeId: string): ZodTypeAny | undefined {
  return getDataTypeDefinition(typeId)?.schema;
}

export function isKnownDataTypeId(typeId: string): boolean {
  return dataTypeDefinitionsById.has(typeId);
}

export function isDataTypeCompatible(
  sourceTypeId: string,
  targetTypeId: string,
  options: { acceptedSourceTypeIds?: Iterable<string> } = {},
): boolean {
  if (sourceTypeId === targetTypeId) return true;

  const acceptedSourceTypeIds = new Set(options.acceptedSourceTypeIds ?? []);
  if (acceptedSourceTypeIds.has(sourceTypeId)) return true;

  return acceptedSourceTypeIds.has("all-data") && isKnownDataTypeId(sourceTypeId);
}
