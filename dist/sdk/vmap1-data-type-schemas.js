import { isoDateTimeSchema as e, jsonObjectSchema as t, jsonValueSchema as n } from "./schema-primitives.js";
import { z as r } from "zod";
//#region src/sdk/vmap1-data-type-schemas.ts
var i = r.string().min(1), a = r.literal(1), o = r.array(r.string()), s = r.tuple([
	r.number().finite(),
	r.number().finite(),
	r.number().finite(),
	r.number().finite()
]), c = r.tuple([r.number().finite().min(-180).max(180), r.number().finite().min(-90).max(90)]), l = r.array(n), u = r.union([r.string(), l]), d = r.union([r.number().finite(), l]), f = r.object({
	code: r.string().min(1),
	severity: r.enum([
		"info",
		"warning",
		"error"
	]),
	message: r.string().min(1),
	componentId: r.string().optional(),
	sourceId: r.string().optional(),
	sourceRef: r.string().optional(),
	layerId: r.string().optional(),
	details: t.optional()
}).passthrough(), p = r.array(f), m = r.enum([
	"blank",
	"basic",
	"dark",
	"satellite",
	"terrain"
]), h = r.object({
	styleUrl: r.string().optional(),
	preset: m.optional()
}).passthrough(), g = r.object({
	light: h.optional(),
	dark: h.optional()
}).passthrough(), _ = r.object({
	anchor: r.enum(["map", "viewport"]),
	color: r.string(),
	intensity: r.number().finite(),
	position: r.tuple([
		r.number().finite(),
		r.number().finite(),
		r.number().finite()
	])
}).passthrough(), v = r.object({
	kind: r.literal("vmap1-style"),
	version: a,
	id: i,
	mode: r.enum([
		"url",
		"inline",
		"preset"
	]),
	styleUrl: r.string().optional(),
	styleJson: n.optional(),
	preset: m.optional(),
	glyphsUrl: r.string().optional(),
	spriteUrl: r.string().optional(),
	attribution: o.optional(),
	variants: g.optional(),
	light: _.optional(),
	diagnostics: p.optional()
}).passthrough(), y = r.object({
	kind: r.literal("vmap1-tile-source"),
	version: a,
	id: i,
	sourceType: r.enum([
		"raster",
		"vector",
		"raster-dem",
		"tilejson"
	]),
	url: r.string().min(1),
	tileSize: r.union([r.literal(256), r.literal(512)]).optional(),
	minzoom: r.number().finite().optional(),
	maxzoom: r.number().finite().optional(),
	bounds: s.optional(),
	attribution: o.optional(),
	diagnostics: p.optional()
}).passthrough(), b = r.object({
	kind: r.literal("vmap1-pmtiles-source"),
	version: a,
	id: i,
	url: r.string().min(1),
	pmtilesType: r.enum([
		"vector",
		"raster",
		"raster-dem"
	]),
	minzoom: r.number().finite().optional(),
	maxzoom: r.number().finite().optional(),
	bounds: s.optional(),
	attribution: o.optional(),
	diagnostics: p.optional()
}).passthrough(), x = r.object({
	kind: r.literal("vmap1-terrain-source"),
	version: a,
	id: i,
	sourceRef: r.string().min(1),
	exaggeration: r.number().finite(),
	hillshade: r.boolean().optional()
}).passthrough(), S = r.object({
	geometryField: r.string().optional(),
	longitudeField: r.string().optional(),
	latitudeField: r.string().optional(),
	coordinatesField: r.string().optional(),
	lineCoordinatesField: r.string().optional(),
	originField: r.string().optional(),
	destinationField: r.string().optional(),
	properties: r.record(r.string(), r.string()).optional()
}).passthrough(), C = r.discriminatedUnion("state", [
	r.object({ state: r.literal("idle") }).passthrough(),
	r.object({
		state: r.literal("loading"),
		startedAt: e
	}).passthrough(),
	r.object({
		state: r.literal("ready"),
		loadedAt: e,
		featureCount: r.number().int().nonnegative().optional()
	}).passthrough(),
	r.object({
		state: r.literal("error"),
		message: r.string().min(1),
		loadedAt: e.optional()
	}).passthrough()
]), w = r.object({
	kind: r.literal("vmap1-resolved-dataset"),
	version: a,
	id: i,
	geojson: n,
	featureCount: r.number().int().nonnegative().optional()
}).passthrough(), T = r.discriminatedUnion("mode", [
	r.object({
		mode: r.literal("geojson-url"),
		url: r.string().min(1)
	}).passthrough(),
	r.object({
		mode: r.literal("geojson-inline"),
		data: n
	}).passthrough(),
	r.object({
		mode: r.literal("json-url"),
		url: r.string().min(1),
		mapping: S
	}).passthrough(),
	r.object({
		mode: r.literal("csv-url"),
		url: r.string().min(1),
		mapping: S
	}).passthrough(),
	r.object({
		mode: r.literal("binding"),
		bindingPath: r.string().min(1),
		mapping: S.optional()
	}).passthrough()
]), E = r.object({
	kind: r.literal("vmap1-dataset"),
	version: a,
	id: i,
	label: r.string().optional(),
	source: T,
	featureIdField: r.string().optional(),
	attribution: o.optional(),
	status: C.optional(),
	resolved: w.optional(),
	diagnostics: p.optional()
}).passthrough(), D = r.object({
	kind: r.literal("vmap1-dataset-registry"),
	version: a,
	datasets: r.array(E),
	resolvedDatasets: r.array(w).optional(),
	diagnostics: p.optional()
}).passthrough(), O = {
	kind: r.literal("vmap1-layer"),
	version: a,
	id: i,
	sourceRef: r.string().min(1),
	sourceLayer: r.string().optional(),
	visible: r.boolean(),
	minzoom: r.number().finite().optional(),
	maxzoom: r.number().finite().optional(),
	filter: r.array(n).optional(),
	beforeLayerId: r.string().optional(),
	interactive: r.boolean().optional(),
	attribution: o.optional(),
	displayName: r.string().optional(),
	diagnostics: p.optional()
}, k = r.discriminatedUnion("layerType", [
	r.object({
		...O,
		layerType: r.literal("fill"),
		fillColor: u,
		fillOpacity: d,
		outlineColor: u.optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("line"),
		lineColor: u,
		lineWidth: d,
		lineOpacity: d.optional(),
		lineDasharray: r.union([r.array(r.number().finite()), l]).optional(),
		lineCap: r.enum([
			"butt",
			"round",
			"square"
		]).optional(),
		lineJoin: r.enum([
			"bevel",
			"round",
			"miter"
		]).optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("circle"),
		circleRadius: d,
		circleColor: u,
		circleOpacity: d.optional(),
		circleStrokeColor: u.optional(),
		circleStrokeWidth: d.optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("symbol"),
		textField: r.union([r.string(), l]).optional(),
		iconImage: r.union([r.string(), l]).optional(),
		textSize: d.optional(),
		textColor: u.optional(),
		textHaloColor: u.optional(),
		textHaloWidth: d.optional(),
		allowOverlap: r.boolean().optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("heatmap"),
		weightField: r.string().optional(),
		heatmapWeight: d.optional(),
		heatmapIntensity: d.optional(),
		heatmapRadius: d.optional(),
		heatmapOpacity: d.optional(),
		colorRamp: r.array(r.string()).optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("extrusion"),
		heightField: r.string().optional(),
		baseHeightField: r.string().optional(),
		fillExtrusionColor: u,
		fillExtrusionHeight: d,
		fillExtrusionBase: d.optional(),
		fillExtrusionOpacity: r.number().finite().optional(),
		fillExtrusionVerticalGradient: r.boolean().optional(),
		fillExtrusionTranslate: r.tuple([r.number().finite(), r.number().finite()]).optional(),
		fillExtrusionTranslateAnchor: r.enum(["map", "viewport"]).optional(),
		fillExtrusionPattern: r.string().optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("raster"),
		rasterOpacity: r.number().finite().optional(),
		rasterBrightnessMin: r.number().finite().optional(),
		rasterBrightnessMax: r.number().finite().optional(),
		rasterContrast: r.number().finite().optional(),
		rasterSaturation: r.number().finite().optional()
	}).passthrough(),
	r.object({
		...O,
		layerType: r.literal("terrain"),
		terrainSourceRef: r.string().min(1),
		exaggeration: r.number().finite()
	}).passthrough()
]), A = r.object({
	kind: r.literal("vmap1-deck-layer"),
	version: a,
	id: i,
	deckLayerType: r.enum([
		"scatterplot",
		"arc",
		"line",
		"path",
		"trips",
		"heatmap",
		"hexagon",
		"h3-hexagon",
		"grid",
		"geojson"
	]),
	sourceRef: r.string().min(1),
	props: r.record(r.string(), n),
	accessors: r.record(r.string(), r.string()).optional(),
	picking: r.boolean(),
	visible: r.boolean(),
	displayName: r.string().optional(),
	diagnostics: p.optional()
}).passthrough(), j = r.object({
	kind: r.literal("vmap1-source-registry"),
	version: a,
	tileSources: r.array(y),
	pmtilesSources: r.array(b),
	datasets: r.array(E),
	resolvedDatasets: r.array(w),
	terrain: x.optional(),
	diagnostics: p.optional()
}).passthrough(), M = r.object({
	initialCenter: c.optional(),
	initialZoom: r.number().finite().optional(),
	initialPitch: r.number().finite().optional(),
	initialBearing: r.number().finite().optional()
}).passthrough();
//#endregion
export { E as vmap1DatasetDescriptorSchema, D as vmap1DatasetRegistrySchema, C as vmap1DatasetStatusSchema, A as vmap1DeckLayerDescriptorSchema, M as vmap1InitialViewSchema, k as vmap1LayerDescriptorSchema, b as vmap1PmtilesSourceDescriptorSchema, w as vmap1ResolvedDatasetSchema, j as vmap1SourceRegistrySchema, v as vmap1StyleDescriptorSchema, x as vmap1TerrainDescriptorSchema, y as vmap1TileSourceDescriptorSchema };
