import { readRowField as e } from "./transform-contracts.js";
import { compareValues as t, containsValue as n, stableStringify as r } from "./row-transform-utils.js";
//#region src/sdk/row-transform-filter-sort.ts
function i(n, r) {
	return n.map((e, t) => ({
		row: e,
		index: t
	})).sort((n, i) => {
		for (let a of r) {
			let r = t(e(n.row, a.field), e(i.row, a.field));
			if (r !== 0) return a.direction === "desc" ? -r : r;
		}
		return n.index - i.index;
	}).map((e) => e.row);
}
function a(t, n, r) {
	return t.filter((t) => {
		let i = n.map((n) => o(e(t, n.field), n.operator, n.value));
		return r === "all" ? i.every(Boolean) : i.some(Boolean);
	});
}
function o(e, i, a) {
	switch (i) {
		case "equals": return r(e ?? null) === r(a ?? null);
		case "notEquals": return r(e ?? null) !== r(a ?? null);
		case "contains": return n(e, a);
		case "startsWith": return String(e ?? "").startsWith(String(a ?? ""));
		case "endsWith": return String(e ?? "").endsWith(String(a ?? ""));
		case "greaterThan": return t(e, a) > 0;
		case "greaterThanOrEqual": return t(e, a) >= 0;
		case "lessThan": return t(e, a) < 0;
		case "lessThanOrEqual": return t(e, a) <= 0;
		case "exists": return e != null;
		case "isEmpty": return e == null || e === "" || Array.isArray(e) && e.length === 0;
		case "in": return Array.isArray(a) && a.some((t) => r(t) === r(e ?? null));
		case "notIn": return !Array.isArray(a) || a.every((t) => r(t) !== r(e ?? null));
		default: throw Error(`Unsupported filter operator: ${String(i)}`);
	}
}
//#endregion
export { a as filterRows, i as sortRows };
