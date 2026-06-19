import { isoDateTimeSchema as e, jsonObjectSchema as t, jsonPrimitiveSchema as n, jsonValueSchema as r } from "./schema-primitives.js";
import { componentThemeContextSchema as i, componentThemeSchema as a } from "../themes/schema.js";
import { vmap1DatasetDescriptorSchema as o, vmap1DatasetRegistrySchema as s, vmap1DatasetStatusSchema as c, vmap1DeckLayerDescriptorSchema as l, vmap1InitialViewSchema as u, vmap1LayerDescriptorSchema as d, vmap1PmtilesSourceDescriptorSchema as f, vmap1ResolvedDatasetSchema as p, vmap1SourceRegistrySchema as m, vmap1StyleDescriptorSchema as h, vmap1TerrainDescriptorSchema as g, vmap1TileSourceDescriptorSchema as _ } from "./vmap1-data-type-schemas.js";
import { z as v } from "zod";
//#region src/sdk/data-types.ts
var y = v.object({
	x: v.union([v.string(), v.number().finite()]),
	y: v.number().finite(),
	xLabel: v.string().nullable().optional()
}), b = v.object({
	label: v.string().min(1),
	value: v.number().finite()
}), x = v.object({
	x: v.union([v.number().finite(), v.string()]),
	y: v.number().finite(),
	seriesName: v.string().optional()
}), S = v.object({
	label: v.string(),
	value: v.number().finite()
}), C = v.object({
	x0: v.number().finite(),
	x1: v.number().finite()
}), w = v.object({
	seriesName: v.string(),
	visible: v.boolean()
}), T = v.object({
	rowKey: v.string(),
	columnKey: v.string(),
	rowIndex: v.number().int().nonnegative(),
	columnIndex: v.number().int().nonnegative(),
	value: v.number().finite(),
	rowLabel: v.string().optional(),
	columnLabel: v.string().optional(),
	source: t.optional()
}), E = v.object({
	lat: v.number().finite().min(-90).max(90),
	lon: v.number().finite().min(-180).max(180),
	id: v.string().optional(),
	label: v.string().optional(),
	value: v.number().finite().optional(),
	source: t.optional()
}), D = v.object({
	id: v.string().min(1),
	label: v.string().optional(),
	group: v.string().optional(),
	value: v.number().finite().optional(),
	source: t.optional()
}), O = v.object({
	source: v.string().min(1),
	target: v.string().min(1),
	id: v.string().optional(),
	label: v.string().optional(),
	value: v.number().finite().optional(),
	sourceData: t.optional()
}), k = v.union([a, i]), A = [
	{
		id: "all-data",
		label: "All data",
		description: "Any JSON-serializable value.",
		schema: r
	},
	{
		id: "json-object",
		label: "JSON object",
		description: "A JSON object with string keys and JSON values.",
		schema: t
	},
	{
		id: "json-array",
		label: "JSON array",
		description: "An ordered list of JSON values.",
		schema: v.array(r)
	},
	{
		id: "primitive",
		label: "Primitive",
		description: "A string, number, boolean, or null JSON value.",
		schema: n
	},
	{
		id: "text-value",
		label: "Text value",
		description: "A plain text string value.",
		schema: v.string()
	},
	{
		id: "url-string",
		label: "URL string",
		description: "A fully qualified URL string.",
		schema: v.string().url()
	},
	{
		id: "event-timestamp",
		label: "Event timestamp",
		description: "An ISO-8601 timestamp captured when a component event fires.",
		schema: v.string().datetime()
	},
	{
		id: "table-rows",
		label: "Table rows",
		description: "An array of JSON objects suitable for tabular rows.",
		schema: v.array(t)
	},
	{
		id: "key-value-object",
		label: "Key/value object",
		description: "A JSON object represented as named key/value pairs.",
		schema: t
	},
	{
		id: "chart-series-xy",
		label: "Chart series (x/y)",
		description: "An array of chart points with x and y coordinates.",
		schema: v.array(y)
	},
	{
		id: "chart-slices",
		label: "Chart slices",
		description: "An array of labeled numeric chart slices.",
		schema: v.array(b)
	},
	{
		id: "chart-cartesian-point",
		label: "Chart cartesian point",
		description: "A chart event payload for a clicked or hovered cartesian chart point.",
		schema: x
	},
	{
		id: "chart-donut-slice",
		label: "Chart donut slice",
		description: "A chart event payload for a clicked or hovered donut slice.",
		schema: S
	},
	{
		id: "chart-range",
		label: "Chart range",
		description: "A chart event payload for a selected numeric x-axis range.",
		schema: C
	},
	{
		id: "chart-legend-state",
		label: "Chart legend state",
		description: "A chart event payload for a toggled series legend item.",
		schema: w
	},
	{
		id: "chart-matrix-cell",
		label: "Chart matrix cell",
		description: "A chart event payload for a clicked matrix, heatmap, or region-grid cell.",
		schema: T
	},
	{
		id: "geo-point",
		label: "Geographic point",
		description: "A visualization event payload for a selected latitude/longitude point.",
		schema: E
	},
	{
		id: "graph-node",
		label: "Graph node",
		description: "A visualization event payload for a selected graph node.",
		schema: D
	},
	{
		id: "graph-edge",
		label: "Graph edge",
		description: "A visualization event payload for a selected graph edge.",
		schema: O
	},
	{
		id: "component-theme",
		label: "Component theme",
		description: "A canonical package component theme with fixed visual role maps.",
		schema: k
	},
	{
		id: "fetch-meta",
		label: "Fetch metadata",
		description: "Runtime fetch state metadata for manual and remote data sources.",
		schema: v.object({
			kind: v.enum(["manual", "remote"]),
			fetchedAt: e.optional(),
			status: v.enum([
				"error",
				"failure",
				"idle",
				"loading",
				"stale-cache",
				"success"
			]).optional(),
			error: v.object({
				category: v.string().min(1),
				message: v.string().min(1),
				status: v.number().int().optional(),
				details: v.string().optional()
			}).optional()
		})
	},
	{
		id: "vmap1.style-descriptor",
		label: "VMap style descriptor",
		description: "A canonical vmap1 map style descriptor for URL, inline, or preset styles.",
		schema: h
	},
	{
		id: "vmap1.tile-source-descriptor",
		label: "VMap tile source descriptor",
		description: "A canonical vmap1 MapLibre tile source descriptor.",
		schema: _
	},
	{
		id: "vmap1.pmtiles-source-descriptor",
		label: "VMap PMTiles source descriptor",
		description: "A canonical vmap1 PMTiles tile source descriptor.",
		schema: f
	},
	{
		id: "vmap1.terrain-descriptor",
		label: "VMap terrain descriptor",
		description: "A canonical vmap1 terrain source activation descriptor.",
		schema: g
	},
	{
		id: "vmap1.dataset-descriptor",
		label: "VMap dataset descriptor",
		description: "A canonical vmap1 dataset descriptor with source, status, and resolved dataset state.",
		schema: o
	},
	{
		id: "vmap1.dataset-status",
		label: "VMap dataset status",
		description: "Runtime loading, ready, idle, or error status emitted by vmap1 dataset components.",
		schema: c
	},
	{
		id: "vmap1.resolved-dataset",
		label: "VMap resolved dataset",
		description: "A resolved GeoJSON-compatible dataset emitted by vmap1 dataset components.",
		schema: p
	},
	{
		id: "vmap1.dataset-registry",
		label: "VMap dataset registry",
		description: "A canonical vmap1 registry of dataset descriptors and resolved dataset outputs.",
		schema: s
	},
	{
		id: "vmap1.source-registry",
		label: "VMap source registry",
		description: "A canonical vmap1 source registry merging tiles, PMTiles, datasets, terrain, and diagnostics.",
		schema: m
	},
	{
		id: "vmap1.layer-descriptor",
		label: "VMap layer descriptor",
		description: "A canonical vmap1 MapLibre layer descriptor referencing public source IDs.",
		schema: d
	},
	{
		id: "vmap1.deck-layer-descriptor",
		label: "VMap deck layer descriptor",
		description: "A canonical vmap1 deck.gl overlay descriptor referencing public source IDs.",
		schema: l
	},
	{
		id: "vmap1.initial-view",
		label: "VMap initial view",
		description: "Initial vmap1 camera state for center, zoom, pitch, and bearing.",
		schema: u
	}
], j = new Map(A.map((e) => [e.id, e])), M = A.map((e) => e.id);
function N(e) {
	return j.get(e);
}
function P(e) {
	return N(e)?.schema;
}
function F(e) {
	return j.has(e);
}
function I(e, t, n = {}) {
	if (e === t) return !0;
	let r = new Set(n.acceptedSourceTypeIds ?? []);
	return r.has(e) ? !0 : r.has("all-data") && F(e);
}
//#endregion
export { k as componentThemeSchema, A as dataTypeDefinitions, j as dataTypeDefinitionsById, M as dataTypeIds, N as getDataTypeDefinition, P as getDataTypeSchema, I as isDataTypeCompatible, F as isKnownDataTypeId };
