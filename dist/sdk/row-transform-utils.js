import { deriveOutputFieldName as e, readRowField as t, resolveRowSource as n } from "./transform-contracts.js";
import { assertSafeRowTransformOutputField as r } from "./row-transform-engine-types.js";
//#region src/sdk/row-transform-utils.ts
function i(e, t) {
	return n(e, t).filter(_).map((e) => S(e));
}
function a(e, t, n, i) {
	let a = r(t, i);
	Object.defineProperty(e, a, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	});
}
function o(e, t, n, r) {
	let i = S(e);
	return a(i, t, n, r), i;
}
function s(e, t) {
	return r(e, t);
}
function c(t, n) {
	return r(e(t), n);
}
function l(e, t) {
	return r(e, t);
}
function u(t, n) {
	return r(t.outputField.trim() || `${t.operation}_${t.sourceField ? e(t.sourceField) : "rows"}`, n);
}
function d(e, t) {
	return e.map((e, n) => c(e, `${t}[${n}]`));
}
function f(e, t) {
	return r(e, t);
}
function p(e, t) {
	return e == null ? t == null ? 0 : 1 : t == null ? -1 : typeof e == "number" && typeof t == "number" ? e - t : String(e).localeCompare(String(t));
}
function m(e, t) {
	return typeof e == "string" ? e.includes(String(t ?? "")) : Array.isArray(e) ? e.some((e) => x(e) === x(t ?? null)) : !1;
}
function h(e, n, r) {
	if (e === "count") return n.length;
	let i = n.map((e) => r ? t(e, r) : void 0).filter(v);
	return i.length === 0 ? e === "sum" ? 0 : null : e === "sum" ? i.reduce((e, t) => e + t, 0) : e === "min" ? Math.min(...i) : e === "max" ? Math.max(...i) : i.reduce((e, t) => e + t, 0) / i.length;
}
function g(e, n) {
	return t(e, n) ?? null;
}
function _(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function v(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function y(e) {
	return e.trim().replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "value";
}
function b(e, t) {
	let n = e, r = 2;
	for (; t.has(n);) n = `${e}_${r}`, r += 1;
	return t.add(n), n;
}
function x(e) {
	return Array.isArray(e) ? `[${e.map((e) => x(e)).join(",")}]` : _(e) ? `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${x(e[t])}`).join(",")}}` : JSON.stringify(e);
}
function S(e) {
	return C(e);
}
function C(e) {
	return JSON.parse(JSON.stringify(e));
}
//#endregion
export { S as cloneJsonObject, C as cloneJsonValue, o as cloneRowWithOutputField, p as compareValues, h as computeAggregate, m as containsValue, b as createUniqueOutputField, v as isFiniteNumber, g as readOrNull, i as resolveObjectRows, y as sanitizeFieldName, a as setOutputField, x as stableStringify, u as validateAggregateOutputField, f as validateCountOutputField, c as validateDerivedOutputField, l as validateGeneratedOutputField, d as validateGroupByOutputFields, s as validateOutputField };
