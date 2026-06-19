import { isSafeDataPathProperty as e, resolveDataPath as t, validateDataPath as n } from "./data-path-helpers.js";
import { isKnownDataTypeId as r } from "./data-types.js";
//#region src/sdk/transform-contracts.ts
var i = [
	"sort",
	"filter",
	"select",
	"lookup",
	"group",
	"pivot",
	"flatten",
	"dedupe",
	"dateBucket",
	"normalize",
	"format"
], a = new Set(i), o = [
	"table-rows",
	"json-array",
	"all-data"
], s = {
	rows: "table-rows",
	all: "all-data"
}, c = [
	"row-source",
	"field",
	"numeric-field",
	"date-field",
	"group-key",
	"join-key",
	"sort-key",
	"projection",
	"format-target"
];
function l(e = {}) {
	return {
		id: e.id ?? "data",
		label: e.label ?? "Data",
		mode: "full",
		acceptedTypeIds: [...o],
		required: e.required ?? !0,
		allowMultiple: !1,
		allowCycle: !1
	};
}
function u(e = {}) {
	return l({
		id: e.id ?? "lookup",
		label: e.label ?? "Lookup data",
		required: e.required ?? !1
	});
}
function d(e = {}) {
	return [{
		id: e.rowsId ?? "rows",
		label: e.rowsLabel ?? "Rows",
		typeId: s.rows
	}, {
		id: e.allId ?? "all",
		label: e.allLabel ?? "All data",
		typeId: s.all
	}];
}
function f(e) {
	if (!a.has(e.operation)) throw Error(`Unknown transform operation: ${e.operation}`);
	let t = e.fieldPickers ?? [];
	return C("field picker", t.map((e) => e.id)), {
		operation: e.operation,
		inputs: [l({
			id: e.inputId,
			label: e.inputLabel
		}), ...e.includeLookupInput ? [u({
			id: e.lookupInputId,
			label: e.lookupInputLabel
		})] : []],
		outputs: d({
			rowsId: e.rowsOutputId,
			rowsLabel: e.rowsOutputLabel,
			allId: e.allOutputId,
			allLabel: e.allOutputLabel
		}),
		fieldPickers: t
	};
}
function p(e, r = "") {
	let i = e ?? null, a = r.trim();
	if (a.length === 0) return Array.isArray(i) ? i : [];
	if (!n(a, a.startsWith("$") ? "jsonpath" : "relative").ok) return [];
	let o = t(i, a);
	return o.ok && Array.isArray(o.value) ? o.value : [];
}
function m(e, n) {
	let r = n.trim();
	if (r.length === 0) return e;
	let i = t(e, r);
	return i.ok ? i.value : void 0;
}
function h(e, t = "value") {
	let r = e.trim();
	if (r.length === 0) return t;
	let i = n(r, r.startsWith("$") ? "jsonpath" : "relative");
	if (!i.ok || i.tokens.length === 0) return r;
	let a = i.tokens[i.tokens.length - 1];
	return a.kind === "property" ? a.key : a.kind === "index" ? String(a.index) : t;
}
function g(e, t = []) {
	let n = [];
	for (let r of t) {
		let t = m(e, r);
		(typeof t == "string" || typeof t == "number" || typeof t == "boolean") && n.push({
			field: r,
			value: t
		});
	}
	if (n.length === 1) {
		let e = n[0];
		return `${e.field}:${String(e.value)}`;
	}
	return n.length > 1 ? `key:${x(n)}` : `row:${x(e)}`;
}
function _(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) S(n) && v(n, "", t);
	return [...t.entries()].sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => ({
		path: e,
		label: h(e),
		kind: y(t.values),
		occurrences: t.occurrences,
		sampleValues: t.values.slice(0, 5)
	}));
}
function v(t, n, r) {
	for (let [i, a] of Object.entries(t)) {
		if (!e(i)) continue;
		let t = n ? `${n}.${i}` : i;
		if (S(a)) {
			v(a, t, r);
			continue;
		}
		let o = r.get(t) ?? {
			values: [],
			occurrences: 0
		};
		o.occurrences += 1, o.values.length < 5 && o.values.push(a), r.set(t, o);
	}
}
function y(e) {
	let t = new Set(e.map((e) => b(e)));
	return t.size === 1 ? [...t][0] : t.has("null") && t.size === 2 ? [...t].find((e) => e !== "null") : "mixed";
}
function b(e) {
	return e === null ? "null" : typeof e == "number" ? "number" : typeof e == "boolean" ? "boolean" : typeof e == "string" ? Number.isNaN(Date.parse(e)) ? "string" : "date" : "json";
}
function x(e) {
	return Array.isArray(e) ? `[${e.map((e) => x(e)).join(",")}]` : S(e) ? `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${x(e[t])}`).join(",")}}` : JSON.stringify(e);
}
function S(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function C(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of t) {
		if (n.has(r)) throw Error(`Duplicate ${e} id: ${r}`);
		n.add(r);
	}
}
for (let e of [...o, ...Object.values(s)]) if (!r(e)) throw Error(`Unknown row transform data type: ${e}`);
//#endregion
export { u as createLookupInputPort, f as createRowTransformContract, l as createRowTransformInputPort, d as createRowTransformOutputPorts, g as createStableRowKey, h as deriveOutputFieldName, _ as inferRowFieldMetadata, m as readRowField, p as resolveRowSource, o as rowTransformInputTypeIds, s as rowTransformOutputTypeIds, c as transformFieldPickerRoles, i as transformOperationIds };
