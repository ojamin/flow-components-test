import { jsonValueSchema as e } from "../schema-primitives.js";
import { z as t } from "zod";
//#region src/sdk/runtime-services/dataset-derivation-service.ts
var n = [
	"root-json-parse",
	"path-index",
	"table-columns",
	"chart-field-options",
	"chart-series-mapping"
], r = t.enum(n), i = t.string().regex(/^sha256:[0-9a-f]{64}$/), a = t.union([t.string().min(1), t.number().int()]), o = t.object({
	id: t.string().min(1),
	contentRevision: a.optional(),
	contentHash: i.optional()
}).refine((e) => e.contentRevision !== void 0 || e.contentHash !== void 0, { message: "Root-source content revision or content hash is required." }), s = t.object({
	componentId: t.string().min(1).optional(),
	transformId: t.string().min(1).optional()
}).refine((e) => e.componentId !== void 0 || e.transformId !== void 0, { message: "Component id or transform id is required." }), c = t.object({
	definitionRevision: a.optional(),
	sourceRevision: a.optional(),
	materializationRevision: a.optional(),
	definitionHash: i.optional(),
	sourceHash: i.optional(),
	materializationHash: i.optional()
}).refine((e) => e.definitionRevision !== void 0 || e.sourceRevision !== void 0 || e.materializationRevision !== void 0 || e.definitionHash !== void 0 || e.sourceHash !== void 0 || e.materializationHash !== void 0, { message: "Definition, source, or materialization revision/hash is required." }), l = t.object({
	kind: r,
	rootSource: o,
	datasetPath: t.string().min(1),
	target: s,
	materialization: c,
	configSignature: i
}), u = l.extend({
	requestId: t.string().min(1),
	projectRevision: a.optional(),
	expectedProjectRevision: a.optional(),
	cacheKey: t.string().min(1).optional(),
	dataset: e.optional(),
	table: t.unknown().optional(),
	chartFieldOptions: t.unknown().optional(),
	chartSeriesMapping: t.unknown().optional()
}), d = t.object({
	path: t.string().min(1),
	valueKind: t.enum([
		"null",
		"boolean",
		"number",
		"string",
		"array",
		"object"
	]),
	childCount: t.number().int().nonnegative().optional()
}), f = t.object({
	id: t.string().min(1),
	label: t.string().min(1),
	valueKind: t.enum([
		"boolean",
		"number",
		"string",
		"date",
		"mixed",
		"unknown"
	]),
	sampleCount: t.number().int().nonnegative().optional()
}), p = t.enum([
	"x",
	"y",
	"label",
	"value"
]), m = t.object({
	id: t.string().min(1).optional(),
	path: t.string().min(1),
	label: t.string().min(1),
	sampleValue: t.string().nullable(),
	availableRowCount: t.number().int().nonnegative(),
	numericRowCount: t.number().int().nonnegative(),
	categoricalRowCount: t.number().int().nonnegative(),
	supportedRoles: t.array(p),
	valueKind: t.enum([
		"number",
		"string",
		"date",
		"category",
		"mixed",
		"unknown"
	]).optional()
}), h = t.object({
	tone: t.enum([
		"ready",
		"loading",
		"empty",
		"error"
	]),
	title: t.string().nullable(),
	description: t.string().nullable()
}), g = t.object({
	x: t.union([t.string(), t.number().finite()]),
	y: t.number().finite(),
	xLabel: t.string().nullable().optional()
}), _ = t.object({
	label: t.string().min(1),
	value: t.number().finite()
}), v = t.object({
	ok: t.boolean(),
	error: t.string().nullable(),
	totalRowCount: t.number().int().nonnegative(),
	skippedRowCount: t.number().int().nonnegative(),
	state: h
}), y = t.discriminatedUnion("kind", [v.extend({
	kind: t.literal("xy"),
	data: t.array(g),
	fields: t.object({
		x: t.string(),
		y: t.string()
	})
}), v.extend({
	kind: t.literal("slice"),
	data: t.array(_),
	fields: t.object({
		label: t.string(),
		value: t.string()
	})
})]), b = t.object({
	parsedJson: e.optional(),
	pathIndex: t.array(d).optional(),
	tableColumns: t.array(f).optional(),
	chartFieldOptions: t.array(m).optional(),
	chartSeriesMappings: t.array(y).optional(),
	diagnostics: t.array(t.object({
		code: t.string().min(1),
		message: t.string().min(1),
		severity: t.enum([
			"info",
			"warning",
			"error"
		])
	})).optional()
}), x = t.object({
	category: t.enum([
		"invalid-json",
		"worker-failure",
		"stale-revision",
		"unsupported-derivation",
		"cancelled"
	]),
	message: t.string().min(1),
	safeDetails: t.string().optional()
}), S = t.discriminatedUnion("status", [
	t.object({
		status: t.literal("success"),
		requestId: t.string().min(1),
		kind: r,
		cacheKey: t.string().min(1).optional(),
		result: b
	}).superRefine((e, n) => {
		e.kind === "root-json-parse" && e.result.parsedJson !== void 0 || e.kind === "path-index" && e.result.pathIndex !== void 0 || e.kind === "table-columns" && e.result.tableColumns !== void 0 || e.kind === "chart-field-options" && e.result.chartFieldOptions !== void 0 || e.kind === "chart-series-mapping" && e.result.chartSeriesMappings !== void 0 || n.addIssue({
			code: t.ZodIssueCode.custom,
			message: "Successful dataset derivation responses must include the result field for their kind.",
			path: ["result"]
		});
	}),
	t.object({
		status: t.literal("failure"),
		requestId: t.string().min(1),
		error: x
	}),
	t.object({
		status: t.literal("stale"),
		requestId: t.string().min(1),
		expectedRevision: a.optional(),
		actualRevision: a.optional()
	})
]), C = t.object({
	requestId: t.string().min(1),
	stage: t.enum([
		"queued",
		"parsing",
		"indexing",
		"deriving",
		"completed"
	]),
	completedUnits: t.number().finite().nonnegative().optional(),
	totalUnits: t.number().finite().positive().optional(),
	message: t.string().optional()
});
//#endregion
export { h as datasetChartAdapterStateSchema, m as datasetChartFieldOptionSchema, p as datasetChartFieldRoleSchema, y as datasetChartSeriesMappingSchema, g as datasetChartSeriesPointSchema, _ as datasetChartSliceSchema, l as datasetDerivationCacheKeyPartsSchema, x as datasetDerivationErrorSchema, i as datasetDerivationHashSchema, r as datasetDerivationKindSchema, n as datasetDerivationKinds, c as datasetDerivationMaterializationSchema, C as datasetDerivationProgressSchema, u as datasetDerivationRequestSchema, S as datasetDerivationResponseSchema, b as datasetDerivationResultSchema, a as datasetDerivationRevisionSchema, o as datasetDerivationRootSourceSchema, s as datasetDerivationTargetSchema, d as datasetPathIndexEntrySchema, f as datasetTableColumnSchema };
