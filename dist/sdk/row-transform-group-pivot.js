import { deriveOutputFieldName as e } from "./transform-contracts.js";
import { computeAggregate as t, createUniqueOutputField as n, readOrNull as r, sanitizeFieldName as i, setOutputField as a, stableStringify as o, validateAggregateOutputField as s, validateCountOutputField as c, validateDerivedOutputField as l, validateGeneratedOutputField as u, validateGroupByOutputFields as d } from "./row-transform-utils.js";
//#region src/sdk/row-transform-group-pivot.ts
function f(e, n, i, l) {
	let u = d(n, "groupByFields"), f = c(i, "countField"), p = l.map((e, t) => s(e, e.outputField ? `aggregates[${t}].outputField` : `aggregates[${t}]`)), m = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = n.map((e) => r(t, e)), i = o(e);
		m.set(i, {
			values: e,
			rows: [...m.get(i)?.rows ?? [], t]
		});
	}
	return [...m.values()].map((e) => {
		let n = {};
		return u.forEach((t, r) => {
			a(n, t, e.values[r] ?? null, `groupByFields[${r}]`);
		}), a(n, f, e.rows.length, "countField"), l.forEach((r, i) => {
			a(n, p[i], t(r.operation, e.rows, r.sourceField), `aggregates[${i}]`);
		}), n;
	});
}
function p(e, t) {
	let a = /* @__PURE__ */ new Map(), s = new Set([...d(t.groupByFields, "groupByFields"), c(t.countField, "countField")]);
	return e.forEach((e, c) => {
		let l = r(e, t.pivotField), d = o(l);
		if (!a.has(d)) {
			let e = n(`${t.outputPrefix}${i(String(l ?? "null"))}`, s);
			a.set(d, u(e, `pivotField generated output from row ${c}`));
		}
	}), f(e, t.groupByFields, t.countField, [...a.entries()].map(([e, n]) => ({
		operation: t.aggregate,
		outputField: n,
		sourceField: t.valueField,
		pivotKey: e
	}))).map((n) => m(n, e, t, a));
}
function m(n, i, s, c) {
	let l = i.filter((t) => s.groupByFields.every((i) => o(r(t, i)) === o(n[e(i)] ?? null))), u = h(n, s.groupByFields, s.countField);
	for (let [e, n] of c.entries()) {
		let i = l.filter((t) => o(r(t, s.pivotField)) === e);
		a(u, n, t(s.aggregate, i, s.valueField), "pivotField generated output");
	}
	return u;
}
function h(e, t, n) {
	let r = {};
	t.forEach((t, n) => {
		let i = l(t, `groupByFields[${n}]`);
		a(r, i, e[i] ?? null, `groupByFields[${n}]`);
	});
	let i = c(n, "countField");
	return a(r, i, e[i] ?? 0, "countField"), r;
}
//#endregion
export { f as groupRows, p as pivotRows };
