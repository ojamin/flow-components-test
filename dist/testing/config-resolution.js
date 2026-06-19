import { resolveAllowedParamBindSources as e, resolveParamValues as t } from "../sdk/param-values.js";
//#region src/testing/config-resolution.ts
function n(e, t, n) {
	if (!e.params) return;
	let r = c(e.configSchema);
	if (!r) {
		n.push("params are present but configSchema is not an object schema with a shape");
		return;
	}
	let i = Object.entries(e.params), a = new Set(Object.keys(r));
	for (let [e, t] of i) {
		let i = r[e];
		if (!i) {
			n.push(`Param "${e}" is missing from configSchema.shape`);
			continue;
		}
		l(t.schema, i) || n.push(`Param "${e}" schema does not match configSchema.shape.${e}`);
	}
	for (let t of a) e.params[t] || n.push(`Config schema field "${t}" has no matching params entry`);
	let u = s(e, t, n);
	if (u) for (let [e, t] of i) o(e, t, u, n);
}
function r(e, t) {
	let n = e.configSchema.safeParse(t ?? e.configDefaults);
	if (!n.success || !d(n.data)) throw Error("Static component config must satisfy the schema and resolve to an object.");
	return n.data;
}
function i(e, n, i) {
	let a = r(e, n);
	if (!i.paramValues) return a;
	let o = [], c = s(e, a, o);
	if (!c) throw Error(o.join("\n"));
	let l = t({
		params: e.params,
		state: i.paramValues,
		inputValues: i.inputs ?? {},
		inputPorts: c,
		defaults: a
	});
	if (l.issues.length > 0) throw Error(l.issues.map((e) => e.message).join("\n"));
	return r(e, l.values);
}
function a(e, t) {
	for (let n of ["paramValues", "fields"]) if (n in e) throw Error(`Static component ${t} tests must not pass raw ${n} to the component; use the harness paramValues option and assert resolved config instead.`);
}
function o(t, n, r, i) {
	if (!n.meta.bindable) return;
	if (!n.meta.bindFrom || n.meta.bindFrom.length === 0) {
		i.push(`Bindable param "${t}" must declare non-empty bindFrom`);
		return;
	}
	let a = new Map(r.map((e) => [e.id, e]));
	for (let e of n.meta.bindFrom) {
		let n = a.get(e.input);
		if (!n) {
			i.push(`Bindable param "${t}" bindFrom input "${e.input}" does not exist`);
			continue;
		}
		!n.acceptedTypeIds.includes(e.typeId) && !n.acceptedTypeIds.includes("all-data") && i.push(`Bindable param "${t}" bindFrom source "${e.input}" type "${e.typeId}" is not compatible with accepted types ${n.acceptedTypeIds.join(", ")}`);
	}
	e(n, r).length === 0 && i.push(`Bindable param "${t}" has no compatible resolved input`);
}
function s(e, t, n) {
	if (!e.resolvePorts) return e.inputs;
	try {
		return e.resolvePorts({
			config: t,
			inputs: e.inputs,
			outputs: e.outputs
		}).inputs;
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		n.push(`resolvePorts failed during params validation: ${t}`);
		return;
	}
}
function c(e) {
	let t = e;
	return d(t.shape) ? t.shape : void 0;
}
function l(e, t) {
	if (e === t) return !0;
	let n = u(e), r = u(t);
	return n !== void 0 && n === r;
}
function u(e) {
	try {
		return JSON.stringify(e._def);
	} catch {
		return;
	}
}
function d(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { a as assertNoRawConfigStateProps, n as collectParamContractIssues, r as parseComponentConfig, i as resolveComponentConfig };
