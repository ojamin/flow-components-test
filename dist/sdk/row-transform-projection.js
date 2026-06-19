import { createStableRowKey as e, deriveOutputFieldName as t, readRowField as n } from "./transform-contracts.js";
import { cloneJsonValue as r, cloneRowWithOutputField as i, readOrNull as a, setOutputField as o, stableStringify as s, validateDerivedOutputField as c, validateGeneratedOutputField as l, validateOutputField as u } from "./row-transform-utils.js";
//#region src/sdk/row-transform-projection.ts
function d(e, n) {
	let r = {};
	return n.forEach((n, i) => {
		o(r, n.outputField ?? t(n.sourceField), a(e, n.sourceField), n.outputField ? `fields[${i}].outputField` : `fields[${i}].sourceField`);
	}), r;
}
function f(e, t, a, o) {
	let s = a ? u(a, "outputField") : c(t, "field"), l = [];
	for (let a of e) {
		let e = n(a, t);
		if (Array.isArray(e)) if (e.length === 0 && o) l.push(i(a, s, null, "outputField"));
		else for (let t of e) l.push(i(a, s, r(t), "outputField"));
		else o && l.push(i(a, s, e ?? null, "outputField"));
	}
	return l;
}
function p(t, n, r) {
	let i = /* @__PURE__ */ new Map();
	for (let o of t) {
		let t = n.length > 0 ? s(n.map((e) => a(o, e))) : e(o);
		(r === "last" || !i.has(t)) && i.set(t, o);
	}
	return [...i.values()];
}
function m(e, r, a, o) {
	let s = a ? u(a, "outputField") : l(`${t(r)}_${o}`, "field/granularity");
	return e.map((e) => i(e, s, h(n(e, r), o), "outputField"));
}
function h(e, t) {
	let n = new Date(typeof e == "number" || typeof e == "string" ? e : NaN);
	if (Number.isNaN(n.getTime())) return null;
	if (t === "year") return `${n.getUTCFullYear()}`;
	if (t === "month") return `${n.getUTCFullYear()}-${g(n.getUTCMonth() + 1)}`;
	if (t === "week") {
		let e = n.getUTCDay() || 7;
		n.setUTCDate(n.getUTCDate() - e + 1);
	}
	let r = `${n.getUTCFullYear()}-${g(n.getUTCMonth() + 1)}-${g(n.getUTCDate())}`;
	return t === "hour" ? `${r}T${g(n.getUTCHours())}:00:00.000Z` : r;
}
function g(e) {
	return String(e).padStart(2, "0");
}
//#endregion
export { m as dateBucketRows, p as dedupeRows, f as flattenRows, d as projectRow };
