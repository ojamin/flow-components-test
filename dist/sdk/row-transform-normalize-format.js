import { deriveOutputFieldName as e, readRowField as t } from "./transform-contracts.js";
import { cloneJsonObject as n, isFiniteNumber as r, setOutputField as i, validateGeneratedOutputField as a, validateOutputField as o } from "./row-transform-utils.js";
//#region src/sdk/row-transform-normalize-format.ts
function s(s, c) {
	let u = /* @__PURE__ */ new Map();
	for (let e of c) {
		let n = s.map((n) => t(n, e.sourceField)).filter(r), i = n.length ? Math.min(...n) : 0, a = n.length ? Math.max(...n) : 0, o = n.length ? n.reduce((e, t) => e + t, 0) / n.length : 0, c = Math.sqrt(n.reduce((e, t) => e + (t - o) ** 2, 0) / (n.length || 1));
		u.set(e.sourceField, {
			min: i,
			max: a,
			mean: o,
			stdev: c
		});
	}
	return s.map((s) => {
		let d = n(s);
		return c.forEach((n, c) => {
			let f = t(s, n.sourceField), p = u.get(n.sourceField);
			i(d, n.outputField ? o(n.outputField, `fields[${c}].outputField`) : a(`${e(n.sourceField)}_${n.method}`, `fields[${c}].sourceField/method`), r(f) ? l(f, p, n.method) : null, `fields[${c}]`);
		}), d;
	});
}
function c(r, a) {
	return r.map((r) => {
		let o = n(r);
		return a.forEach((n, a) => {
			i(o, n.outputField ?? e(n.sourceField), u(t(r, n.sourceField), n.format, n.decimals), n.outputField ? `fields[${a}].outputField` : `fields[${a}].sourceField`);
		}), o;
	});
}
function l(e, t, n) {
	return n === "zScore" ? t.stdev === 0 ? 0 : (e - t.mean) / t.stdev : t.max === t.min ? 0 : (e - t.min) / (t.max - t.min);
}
function u(e, t, n) {
	if (e == null) return null;
	if (t === "uppercase") return String(e).toUpperCase();
	if (t === "lowercase") return String(e).toLowerCase();
	if (t === "trim") return String(e).trim();
	if (t === "numberFixed") return r(e) ? e.toFixed(n) : null;
	if (t === "dateIso") {
		let t = new Date(typeof e == "number" || typeof e == "string" ? e : NaN);
		return Number.isNaN(t.getTime()) ? null : t.toISOString();
	}
	return String(e);
}
//#endregion
export { c as formatRows, s as normalizeRows };
