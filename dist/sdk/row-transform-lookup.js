import { deriveOutputFieldName as e, readRowField as t } from "./transform-contracts.js";
import { cloneJsonObject as n, cloneJsonValue as r, readOrNull as i, setOutputField as a, stableStringify as o } from "./row-transform-utils.js";
//#region src/sdk/row-transform-lookup.ts
function s(e, r, i) {
	let a = /* @__PURE__ */ new Map();
	for (let e of r) {
		let n = o(t(e, i.rightKey) ?? null);
		a.set(n, [...a.get(n) ?? [], e]);
	}
	let s = [];
	for (let r of e) {
		let e = a.get(o(t(r, i.leftKey) ?? null)) ?? [];
		if (e.length === 0) {
			i.unmatched === "keep" && s.push(n(r));
			continue;
		}
		for (let t of i.multiple === "first" ? e.slice(0, 1) : e) s.push({
			...r,
			...c(t, i.fields, i.prefix)
		});
	}
	return s;
}
function c(t, n, o) {
	if (n.length > 0) {
		let r = {};
		return n.forEach((n, s) => {
			a(r, n.outputField ?? `${o}${e(n.sourceField)}`, i(t, n.sourceField), n.outputField ? `fields[${s}].outputField` : `fields[${s}].sourceField/prefix`);
		}), r;
	}
	let s = {};
	for (let [e, n] of Object.entries(t)) a(s, `${o}${e}`, r(n), `prefix/generated lookup field "${e}"`);
	return s;
}
//#endregion
export { s as lookupRows };
