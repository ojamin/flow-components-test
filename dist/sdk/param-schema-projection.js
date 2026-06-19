import { z as e } from "zod";
//#region src/sdk/param-schema-projection.ts
function t(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, n(t)]));
}
function n(e) {
	let t = r(e.meta.schemaProjection), n = o(e.schema), i = t ?? a(n), s = g(e.meta.control);
	return !i.placeholder && s ? {
		...i,
		placeholder: s
	} : i;
}
function r(e) {
	if (!_(e)) return;
	let t = typeof e.type == "string" && v(e.type) ? e.type : void 0;
	if (t) return {
		type: t,
		...Array.isArray(e.schemaTypes) ? { schemaTypes: d(e.schemaTypes) } : {},
		..._(e.properties) ? { properties: i(e.properties) ?? {} } : {},
		..._(e.items) ? { items: r(e.items) ?? a(e.items) } : {},
		...Array.isArray(e.required) ? { required: d(e.required) } : {},
		...Array.isArray(e.enumValues) ? { enumValues: f(e.enumValues) } : {},
		...p("defaultValue", e.defaultValue),
		...m("placeholder", e.placeholder),
		...m("description", e.description)
	};
}
function i(e) {
	if (_(e)) return Object.fromEntries(Object.entries(e).flatMap(([e, t]) => _(t) ? [[e, r(t) ?? a(t)]] : []));
}
function a(e) {
	if (!e) return { type: "unknown" };
	let t = f(e.enum), n = u(e.type), r = {
		type: t.length > 0 ? "enum" : l(n),
		...n.length > 1 ? { schemaTypes: n } : {},
		...t.length > 0 ? { enumValues: t } : {},
		...p("defaultValue", e.default),
		...m("placeholder", e.placeholder),
		...m("description", e.description)
	}, i = s(e.properties);
	i && (r.properties = i);
	let a = c(e.items);
	a && (r.items = a);
	let o = d(e.required);
	return o.length > 0 && (r.required = o), r;
}
function o(t) {
	try {
		let n = e.toJSONSchema(t);
		return _(n) ? n : void 0;
	} catch {
		return;
	}
}
function s(e) {
	if (_(e)) return Object.fromEntries(Object.entries(e).flatMap(([e, t]) => _(t) ? [[e, a(t)]] : []));
}
function c(e) {
	return _(e) ? a(e) : void 0;
}
function l(e) {
	let t = e.find((e) => e !== "null") ?? e[0];
	return v(t) ? t : "unknown";
}
function u(e) {
	return typeof e == "string" ? [e] : Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
}
function d(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
}
function f(e) {
	return Array.isArray(e) ? e.flatMap((e) => {
		let t = h(e);
		return t === void 0 ? [] : [t];
	}) : [];
}
function p(e, t) {
	let n = h(t);
	return n === void 0 ? {} : { [e]: n };
}
function m(e, t) {
	return typeof t == "string" && t.length > 0 ? { [e]: t } : {};
}
function h(e) {
	if (!(e === void 0 || typeof e == "function" || typeof e == "symbol")) try {
		return JSON.parse(JSON.stringify(e));
	} catch {
		return;
	}
}
function g(e) {
	for (let t of b) {
		let n = e[t];
		if (typeof n == "string" && n.length > 0) return n;
	}
}
function _(e) {
	return !!e && typeof e == "object" && !Array.isArray(e);
}
function v(e) {
	return !!(e && y.has(e));
}
var y = new Set([
	"string",
	"number",
	"integer",
	"boolean",
	"object",
	"array",
	"enum",
	"null"
]), b = [
	"placeholder",
	"itemPlaceholder",
	"keyPlaceholder",
	"valuePlaceholder",
	"hashSlugPlaceholder",
	"sourcePlaceholder",
	"outputPlaceholder",
	"rowsPlaceholder"
];
//#endregion
export { t as projectComponentParamSchemas, n as projectParamSchema };
