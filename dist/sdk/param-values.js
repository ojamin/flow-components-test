import { isValidDataPath as e, resolveDataPath as t } from "./data-path-helpers.js";
//#region src/sdk/param-values.ts
function n(t) {
	return e(t, "jsonpath");
}
function r({ params: e, state: t, inputValues: r, inputPorts: c, defaults: l }) {
	let u = { ...l }, d = [];
	if (!t) return {
		values: u,
		issues: d
	};
	for (let [l, f] of Object.entries(t)) {
		let t = e[l];
		if (!t) continue;
		if (!i(f)) {
			d.push(o(l, "invalid-path", `Param "${l}" has malformed persisted state.`));
			continue;
		}
		if (f.mode === "literal") {
			u[l] = f.value;
			continue;
		}
		if (f.mode !== "bind") {
			d.push(o(l, "invalid-path", `Param "${l}" has unsupported mode "${String(f.mode)}".`));
			continue;
		}
		if (!t.meta.bindable) {
			d.push(o(l, "not-bindable", `Param "${l}" is not bindable but persisted state is "bind".`));
			continue;
		}
		if (typeof f.input != "string") {
			d.push(o(l, "stale-input", `Param "${l}" has invalid persisted input id.`));
			continue;
		}
		let p = a(t, c);
		if (!c.some((e) => e.id === f.input)) {
			let e = c.map((e) => e.id).join(", ") || "(none)";
			d.push(o(l, "stale-input", `Param "${l}" is bound to stale input "${f.input}"; available inputs: ${e}.`));
			continue;
		}
		if (!p.some((e) => e.input === f.input)) {
			let e = p.map((e) => e.input).join(", ") || "(none)";
			d.push(o(l, "disallowed-input", `Param "${l}" is bound to disallowed input "${f.input}"; compatible inputs: ${e}.`));
			continue;
		}
		if (typeof f.path != "string" || !n(f.path)) {
			d.push(o(l, "invalid-path", `Param "${l}" has invalid JSONPath: ${String(f.path)}.`));
			continue;
		}
		let m = s(r[f.input], f.path);
		if (m === void 0) {
			let e = f.fallback === void 0 ? "" : "; applying configured fallback";
			d.push(o(l, "missing-value", `Param "${l}" could not resolve path "${f.path}" from input "${f.input}"${e}.`)), f.fallback !== void 0 && (u[l] = f.fallback);
			continue;
		}
		u[l] = m;
	}
	return {
		values: u,
		issues: d
	};
}
function i(e) {
	return typeof e == "object" && !!e;
}
function a(e, t) {
	if (!e.meta.bindable) return [];
	let n = new Map(t.map((e) => [e.id, e]));
	return (e.meta.bindFrom ?? []).filter((e) => {
		let t = n.get(e.input);
		return t ? t.acceptedTypeIds.includes(e.typeId) || t.acceptedTypeIds.includes("all-data") : !1;
	});
}
function o(e, t, n) {
	return {
		key: e,
		reason: t,
		message: n
	};
}
function s(e, r) {
	if (!n(r)) throw Error(`Invalid JSONPath: ${r}`);
	let i = t(e, r);
	return i.ok ? i.value : void 0;
}
//#endregion
export { n as isValidJsonPath, a as resolveAllowedParamBindSources, r as resolveParamValues };
