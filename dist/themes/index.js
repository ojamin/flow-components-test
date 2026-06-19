import e from "./aurora.js";
import t from "./civic-results.js";
import n from "./command-center.js";
import r from "./default.js";
import i from "./midnight.js";
import a from "./sunrise.js";
import { componentThemeSchema as o } from "./schema.js";
//#region src/themes/index.ts
function s(e) {
	for (let t of Object.values(e.properties)) Object.freeze(t);
	if (Object.freeze(e.properties), e.palettes) {
		for (let t of Object.values(e.palettes)) if (t) {
			for (let e of Object.values(t)) Object.freeze(e);
			Object.freeze(t);
		}
		Object.freeze(e.palettes);
	}
	return Object.freeze(e);
}
function c(e) {
	let t = e.map((e) => s(o.parse(e))), n = /* @__PURE__ */ new Map();
	for (let e of t) {
		if (n.has(e.id)) throw Error(`Duplicate component theme id "${e.id}"`);
		n.set(e.id, e);
	}
	return {
		themes: Object.freeze([...t]),
		ids: Object.freeze(t.map((e) => e.id)),
		byId: n
	};
}
var l = c([
	r,
	i,
	e,
	a,
	t,
	n
]), u = l.themes, d = l.ids;
function f(e) {
	return l.byId.get(e);
}
//#endregion
export { d as builtInComponentThemeIds, u as builtInComponentThemes, f as getBuiltInComponentTheme };
