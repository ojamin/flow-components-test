//#region src/sdk/component-definition-factory.ts
var e = ["ingress", "egress"], t = [
	"root",
	"http",
	"file",
	"dataset",
	"download",
	"event",
	"custom"
], n = [
	"bytes",
	"rows",
	"lines",
	"objects",
	"loadDurationMs",
	"cacheAgeMs",
	"refreshCadence"
], r = [
	"live",
	"embedded",
	"fallback",
	"not-applicable",
	"custom"
], i = [
	"directions",
	"sourceKind",
	"supportsRefresh",
	"supportsCache",
	"supportsOverride",
	"supportsPayloadPreview",
	"supportsPromotion",
	"metrics",
	"exportBehavior"
];
function a(e, t) {
	let n = e.parse(t);
	if (!y(n)) throw Error("Component config schemas must resolve to an object.");
	return n;
}
function o(e) {
	return a(e, {});
}
var s = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
function l(e) {
	let t = s.get(e);
	if (t) return t;
	let n = Promise.resolve().then(() => e.loadFixtureData()).catch((t) => {
		let n = t instanceof Error ? t.message : String(t);
		throw Error(`Failed to load fixture data for component "${e.id}": ${n}`);
	});
	return s.set(e, n), n;
}
function u(e) {
	let t = c.get(e);
	if (t) return t;
	let n = Promise.resolve().then(() => e.loadFixtureVariants?.() ?? {}).catch((t) => {
		let n = t instanceof Error ? t.message : String(t);
		throw Error(`Failed to load fixture variants for component "${e.id}": ${n}`);
	});
	return c.set(e, n), n;
}
function d(e) {
	return f(e), p(e), {
		...e,
		slots: e.slots ?? [],
		configDefaults: a(e.configSchema, e.configDefaults)
	};
}
function f(e) {
	if (!Object.prototype.hasOwnProperty.call(e, "params") || !y(e.params)) throw Error(`Component definition "${e.id}" must declare params (use params: {} when the component has no config).`);
}
function p(a) {
	let o = a.dataBoundary;
	if (o !== void 0) {
		if (!y(o)) throw Error(`Component definition "${a.id}" dataBoundary must be an object.`);
		for (let e of Object.keys(o)) if (!i.includes(e)) throw Error(`Component definition "${a.id}" dataBoundary contains unsupported field "${e}".`);
		m(a.id, "dataBoundary.directions", o.directions, e, { allowEmpty: !1 }), g(a.id, "dataBoundary.sourceKind", o.sourceKind, t), g(a.id, "dataBoundary.exportBehavior", o.exportBehavior, r), h(a.id, "dataBoundary.metrics", o.metrics, n);
		for (let e of [
			"supportsRefresh",
			"supportsCache",
			"supportsOverride",
			"supportsPayloadPreview",
			"supportsPromotion"
		]) _(a.id, `dataBoundary.${e}`, o[e]);
	}
}
function m(e, t, n, r, i) {
	if (!Array.isArray(n)) throw Error(`Component definition "${e}" ${t} must be an array.`);
	if (!i.allowEmpty && n.length === 0) throw Error(`Component definition "${e}" ${t} must not be empty.`);
	for (let i of n) if (!v(i, r)) throw Error(`Component definition "${e}" ${t} contains unsupported value "${String(i)}".`);
}
function h(e, t, n, r) {
	n !== void 0 && m(e, t, n, r, { allowEmpty: !0 });
}
function g(e, t, n, r) {
	if (n !== void 0 && !v(n, r)) throw Error(`Component definition "${e}" ${t} contains unsupported value "${String(n)}".`);
}
function _(e, t, n) {
	if (n !== void 0 && typeof n != "boolean") throw Error(`Component definition "${e}" ${t} must be a boolean.`);
}
function v(e, t) {
	return typeof e == "string" && t.includes(e);
}
function y(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { d as defineComponent, o as defineConfigDefaults, a as parseComponentConfig, l as resolveFixtureData, u as resolveFixtureVariants };
