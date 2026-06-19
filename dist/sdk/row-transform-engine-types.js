import { jsonValueSchema as e } from "./schema-primitives.js";
import { z as t } from "zod";
//#region src/sdk/row-transform-engine-types.ts
var n = t.string().trim().min(1), r = new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function i(e) {
	return r.has(e);
}
function a(e, t) {
	if (i(e)) throw Error(`Invalid row transform output field at ${t}: "${e}" is reserved because it can mutate object prototypes or confuse JSON object handling.`);
	return e;
}
function o(e, n, r) {
	i(r) && e.addIssue({
		code: t.ZodIssueCode.custom,
		path: n,
		message: `Invalid row transform output field "${r}": reserved prototype-sensitive output fields are not allowed.`
	});
}
var s = t.string().trim().min(1).superRefine((e, t) => {
	o(t, [], e);
}), c = s.optional(), l = t.enum(["asc", "desc"]), u = t.enum([
	"sum",
	"min",
	"max",
	"average",
	"count"
]), d = t.object({ rowsPath: t.string().default("") }), f = d.extend({
	operation: t.literal("sort"),
	keys: t.array(t.object({
		field: n,
		direction: l.default("asc")
	})).min(1)
}), p = t.enum([
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
	"notIn"
]), m = d.extend({
	operation: t.literal("filter"),
	clauses: t.array(t.object({
		field: n,
		operator: p,
		value: e.optional()
	})).min(1),
	match: t.enum(["all", "any"]).default("all")
}), h = d.extend({
	operation: t.literal("select"),
	fields: t.array(t.object({
		sourceField: n,
		outputField: c
	})).min(1)
}), g = d.extend({
	operation: t.literal("lookup"),
	lookupRowsPath: t.string().default(""),
	leftKey: n,
	rightKey: n,
	fields: t.array(t.object({
		sourceField: n,
		outputField: c
	})).default([]),
	unmatched: t.enum(["keep", "drop"]).default("keep"),
	multiple: t.enum(["first", "all"]).default("first"),
	prefix: t.string().trim().default("lookup_")
}), _ = t.object({
	sourceField: n.optional(),
	operation: u,
	outputField: t.string().trim().default("")
}).superRefine((e, n) => {
	e.outputField && o(n, ["outputField"], e.outputField), e.operation !== "count" && !e.sourceField && n.addIssue({
		code: t.ZodIssueCode.custom,
		path: ["sourceField"],
		message: "sourceField is required for non-count aggregates."
	});
}), v = d.extend({
	operation: t.literal("group"),
	groupByFields: t.array(n).min(1),
	countField: s.default("groupby_count"),
	aggregates: t.array(_).default([])
}), y = d.extend({
	operation: t.literal("pivot"),
	groupByFields: t.array(n).min(1),
	pivotField: n,
	valueField: n.optional(),
	aggregate: u.default("count"),
	outputPrefix: t.string().trim().default(""),
	countField: s.default("pivot_count")
}).superRefine((e, n) => {
	e.aggregate !== "count" && !e.valueField && n.addIssue({
		code: t.ZodIssueCode.custom,
		path: ["valueField"],
		message: "valueField is required for non-count pivot aggregates."
	});
}), b = d.extend({
	operation: t.literal("flatten"),
	field: n,
	outputField: c,
	keepEmpty: t.boolean().default(!1)
}), x = d.extend({
	operation: t.literal("dedupe"),
	keyFields: t.array(n).default([]),
	keep: t.enum(["first", "last"]).default("first")
}), S = d.extend({
	operation: t.literal("dateBucket"),
	field: n,
	outputField: c,
	granularity: t.enum([
		"hour",
		"day",
		"week",
		"month",
		"year"
	]).default("day")
}), C = t.enum(["minMax", "zScore"]), w = d.extend({
	operation: t.literal("normalize"),
	fields: t.array(t.object({
		sourceField: n,
		outputField: c,
		method: C.default("minMax")
	})).min(1)
}), T = t.enum([
	"string",
	"uppercase",
	"lowercase",
	"trim",
	"numberFixed",
	"dateIso"
]), E = d.extend({
	operation: t.literal("format"),
	fields: t.array(t.object({
		sourceField: n,
		outputField: c,
		format: T,
		decimals: t.number().int().min(0).max(12).default(2)
	})).min(1)
}), D = t.discriminatedUnion("operation", [
	f,
	m,
	h,
	g,
	v,
	y,
	b,
	x,
	S,
	w,
	E
]);
//#endregion
export { a as assertSafeRowTransformOutputField, _ as rowAggregateConfigSchema, u as rowAggregateOperationSchema, S as rowDateBucketConfigSchema, x as rowDedupeConfigSchema, m as rowFilterConfigSchema, p as rowFilterOperatorSchema, b as rowFlattenConfigSchema, E as rowFormatConfigSchema, T as rowFormatOperationSchema, v as rowGroupConfigSchema, g as rowLookupConfigSchema, w as rowNormalizeConfigSchema, C as rowNormalizeMethodSchema, y as rowPivotConfigSchema, h as rowSelectConfigSchema, f as rowSortConfigSchema, l as rowSortDirectionSchema, d as rowTransformBaseConfigSchema, D as rowTransformConfigSchema };
