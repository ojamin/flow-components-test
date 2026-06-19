import { z } from "zod";

import { isoDateTimeSchema, jsonObjectSchema, jsonValueSchema } from "./schema-primitives";

const vmap1DescriptorIdSchema = z.string().min(1);
const vmap1DescriptorVersionSchema = z.literal(1);
const vmap1AttributionSchema = z.array(z.string());
const vmap1BoundsSchema = z.tuple([
  z.number().finite(),
  z.number().finite(),
  z.number().finite(),
  z.number().finite(),
]);
const vmap1LngLatSchema = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);
const vmap1ExpressionSchema = z.array(jsonValueSchema);
const vmap1ColorValueSchema = z.union([z.string(), vmap1ExpressionSchema]);
const vmap1NumericPaintValueSchema = z.union([z.number().finite(), vmap1ExpressionSchema]);

const vmap1DiagnosticSchema = z
  .object({
    code: z.string().min(1),
    severity: z.enum(["info", "warning", "error"]),
    message: z.string().min(1),
    componentId: z.string().optional(),
    sourceId: z.string().optional(),
    sourceRef: z.string().optional(),
    layerId: z.string().optional(),
    details: jsonObjectSchema.optional(),
  })
  .passthrough();
const vmap1DiagnosticsSchema = z.array(vmap1DiagnosticSchema);

const vmap1StylePresetSchema = z.enum(["blank", "basic", "dark", "satellite", "terrain"]);

const vmap1StyleVariantSchema = z
  .object({
    styleUrl: z.string().optional(),
    preset: vmap1StylePresetSchema.optional(),
  })
  .passthrough();

const vmap1StyleVariantsSchema = z
  .object({
    light: vmap1StyleVariantSchema.optional(),
    dark: vmap1StyleVariantSchema.optional(),
  })
  .passthrough();

const vmap1StyleLightSchema = z
  .object({
    anchor: z.enum(["map", "viewport"]),
    color: z.string(),
    intensity: z.number().finite(),
    position: z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]),
  })
  .passthrough();

export const vmap1StyleDescriptorSchema = z
  .object({
    kind: z.literal("vmap1-style"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    mode: z.enum(["url", "inline", "preset"]),
    styleUrl: z.string().optional(),
    styleJson: jsonValueSchema.optional(),
    preset: vmap1StylePresetSchema.optional(),
    glyphsUrl: z.string().optional(),
    spriteUrl: z.string().optional(),
    attribution: vmap1AttributionSchema.optional(),
    variants: vmap1StyleVariantsSchema.optional(),
    light: vmap1StyleLightSchema.optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

export const vmap1TileSourceDescriptorSchema = z
  .object({
    kind: z.literal("vmap1-tile-source"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    sourceType: z.enum(["raster", "vector", "raster-dem", "tilejson"]),
    url: z.string().min(1),
    tileSize: z.union([z.literal(256), z.literal(512)]).optional(),
    minzoom: z.number().finite().optional(),
    maxzoom: z.number().finite().optional(),
    bounds: vmap1BoundsSchema.optional(),
    attribution: vmap1AttributionSchema.optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

export const vmap1PmtilesSourceDescriptorSchema = z
  .object({
    kind: z.literal("vmap1-pmtiles-source"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    url: z.string().min(1),
    pmtilesType: z.enum(["vector", "raster", "raster-dem"]),
    minzoom: z.number().finite().optional(),
    maxzoom: z.number().finite().optional(),
    bounds: vmap1BoundsSchema.optional(),
    attribution: vmap1AttributionSchema.optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

export const vmap1TerrainDescriptorSchema = z
  .object({
    kind: z.literal("vmap1-terrain-source"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    sourceRef: z.string().min(1),
    exaggeration: z.number().finite(),
    hillshade: z.boolean().optional(),
  })
  .passthrough();

const vmap1DatasetMappingSchema = z
  .object({
    geometryField: z.string().optional(),
    longitudeField: z.string().optional(),
    latitudeField: z.string().optional(),
    coordinatesField: z.string().optional(),
    lineCoordinatesField: z.string().optional(),
    originField: z.string().optional(),
    destinationField: z.string().optional(),
    properties: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

export const vmap1DatasetStatusSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("idle") }).passthrough(),
  z.object({ state: z.literal("loading"), startedAt: isoDateTimeSchema }).passthrough(),
  z
    .object({
      state: z.literal("ready"),
      loadedAt: isoDateTimeSchema,
      featureCount: z.number().int().nonnegative().optional(),
    })
    .passthrough(),
  z
    .object({
      state: z.literal("error"),
      message: z.string().min(1),
      loadedAt: isoDateTimeSchema.optional(),
    })
    .passthrough(),
]);

export const vmap1ResolvedDatasetSchema = z
  .object({
    kind: z.literal("vmap1-resolved-dataset"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    geojson: jsonValueSchema,
    featureCount: z.number().int().nonnegative().optional(),
  })
  .passthrough();

const vmap1DatasetSourceSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("geojson-url"), url: z.string().min(1) }).passthrough(),
  z.object({ mode: z.literal("geojson-inline"), data: jsonValueSchema }).passthrough(),
  z
    .object({
      mode: z.literal("json-url"),
      url: z.string().min(1),
      mapping: vmap1DatasetMappingSchema,
    })
    .passthrough(),
  z
    .object({
      mode: z.literal("csv-url"),
      url: z.string().min(1),
      mapping: vmap1DatasetMappingSchema,
    })
    .passthrough(),
  z
    .object({
      mode: z.literal("binding"),
      bindingPath: z.string().min(1),
      mapping: vmap1DatasetMappingSchema.optional(),
    })
    .passthrough(),
]);

export const vmap1DatasetDescriptorSchema = z
  .object({
    kind: z.literal("vmap1-dataset"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    label: z.string().optional(),
    source: vmap1DatasetSourceSchema,
    featureIdField: z.string().optional(),
    attribution: vmap1AttributionSchema.optional(),
    status: vmap1DatasetStatusSchema.optional(),
    resolved: vmap1ResolvedDatasetSchema.optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

export const vmap1DatasetRegistrySchema = z
  .object({
    kind: z.literal("vmap1-dataset-registry"),
    version: vmap1DescriptorVersionSchema,
    datasets: z.array(vmap1DatasetDescriptorSchema),
    resolvedDatasets: z.array(vmap1ResolvedDatasetSchema).optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

const vmap1LayerBaseShape = {
  kind: z.literal("vmap1-layer"),
  version: vmap1DescriptorVersionSchema,
  id: vmap1DescriptorIdSchema,
  sourceRef: z.string().min(1),
  sourceLayer: z.string().optional(),
  visible: z.boolean(),
  minzoom: z.number().finite().optional(),
  maxzoom: z.number().finite().optional(),
  filter: z.array(jsonValueSchema).optional(),
  beforeLayerId: z.string().optional(),
  interactive: z.boolean().optional(),
  attribution: vmap1AttributionSchema.optional(),
  // Optional user-authored display label; preserved verbatim so the host can
  // present it in chrome surfaces without inferring labels from layer ids.
  displayName: z.string().optional(),
  diagnostics: vmap1DiagnosticsSchema.optional(),
};

export const vmap1LayerDescriptorSchema = z.discriminatedUnion("layerType", [
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("fill"),
      fillColor: vmap1ColorValueSchema,
      fillOpacity: vmap1NumericPaintValueSchema,
      outlineColor: vmap1ColorValueSchema.optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("line"),
      lineColor: vmap1ColorValueSchema,
      lineWidth: vmap1NumericPaintValueSchema,
      lineOpacity: vmap1NumericPaintValueSchema.optional(),
      lineDasharray: z.union([z.array(z.number().finite()), vmap1ExpressionSchema]).optional(),
      lineCap: z.enum(["butt", "round", "square"]).optional(),
      lineJoin: z.enum(["bevel", "round", "miter"]).optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("circle"),
      circleRadius: vmap1NumericPaintValueSchema,
      circleColor: vmap1ColorValueSchema,
      circleOpacity: vmap1NumericPaintValueSchema.optional(),
      circleStrokeColor: vmap1ColorValueSchema.optional(),
      circleStrokeWidth: vmap1NumericPaintValueSchema.optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("symbol"),
      textField: z.union([z.string(), vmap1ExpressionSchema]).optional(),
      iconImage: z.union([z.string(), vmap1ExpressionSchema]).optional(),
      textSize: vmap1NumericPaintValueSchema.optional(),
      textColor: vmap1ColorValueSchema.optional(),
      textHaloColor: vmap1ColorValueSchema.optional(),
      textHaloWidth: vmap1NumericPaintValueSchema.optional(),
      allowOverlap: z.boolean().optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("heatmap"),
      weightField: z.string().optional(),
      heatmapWeight: vmap1NumericPaintValueSchema.optional(),
      heatmapIntensity: vmap1NumericPaintValueSchema.optional(),
      heatmapRadius: vmap1NumericPaintValueSchema.optional(),
      heatmapOpacity: vmap1NumericPaintValueSchema.optional(),
      colorRamp: z.array(z.string()).optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("extrusion"),
      heightField: z.string().optional(),
      baseHeightField: z.string().optional(),
      fillExtrusionColor: vmap1ColorValueSchema,
      fillExtrusionHeight: vmap1NumericPaintValueSchema,
      fillExtrusionBase: vmap1NumericPaintValueSchema.optional(),
      fillExtrusionOpacity: z.number().finite().optional(),
      fillExtrusionVerticalGradient: z.boolean().optional(),
      fillExtrusionTranslate: z.tuple([z.number().finite(), z.number().finite()]).optional(),
      fillExtrusionTranslateAnchor: z.enum(["map", "viewport"]).optional(),
      fillExtrusionPattern: z.string().optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("raster"),
      rasterOpacity: z.number().finite().optional(),
      rasterBrightnessMin: z.number().finite().optional(),
      rasterBrightnessMax: z.number().finite().optional(),
      rasterContrast: z.number().finite().optional(),
      rasterSaturation: z.number().finite().optional(),
    })
    .passthrough(),
  z
    .object({
      ...vmap1LayerBaseShape,
      layerType: z.literal("terrain"),
      terrainSourceRef: z.string().min(1),
      exaggeration: z.number().finite(),
    })
    .passthrough(),
]);

export const vmap1DeckLayerDescriptorSchema = z
  .object({
    kind: z.literal("vmap1-deck-layer"),
    version: vmap1DescriptorVersionSchema,
    id: vmap1DescriptorIdSchema,
    deckLayerType: z.enum([
      "scatterplot",
      "arc",
      "line",
      "path",
      "trips",
      "heatmap",
      "hexagon",
      "h3-hexagon",
      "grid",
      "geojson",
    ]),
    sourceRef: z.string().min(1),
    props: z.record(z.string(), jsonValueSchema),
    accessors: z.record(z.string(), z.string()).optional(),
    picking: z.boolean(),
    visible: z.boolean(),
    // Optional user-authored display label; preserved verbatim for chrome
    // surfaces (e.g. the map layer-visibility control).
    displayName: z.string().optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

export const vmap1SourceRegistrySchema = z
  .object({
    kind: z.literal("vmap1-source-registry"),
    version: vmap1DescriptorVersionSchema,
    tileSources: z.array(vmap1TileSourceDescriptorSchema),
    pmtilesSources: z.array(vmap1PmtilesSourceDescriptorSchema),
    datasets: z.array(vmap1DatasetDescriptorSchema),
    resolvedDatasets: z.array(vmap1ResolvedDatasetSchema),
    terrain: vmap1TerrainDescriptorSchema.optional(),
    diagnostics: vmap1DiagnosticsSchema.optional(),
  })
  .passthrough();

export const vmap1InitialViewSchema = z
  .object({
    initialCenter: vmap1LngLatSchema.optional(),
    initialZoom: z.number().finite().optional(),
    initialPitch: z.number().finite().optional(),
    initialBearing: z.number().finite().optional(),
  })
  .passthrough();
