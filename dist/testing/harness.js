import { resolveFixtureData as e } from "../sdk/component-definition-factory.js";
import { getDataTypeDefinition as t, getDataTypeSchema as n } from "../sdk/data-types.js";
import { assertNoRawConfigStateProps as r, collectParamContractIssues as i, parseComponentConfig as a, resolveComponentConfig as o } from "./config-resolution.js";
import { mount as s } from "@vue/test-utils";
import { afterAll as c, describe as l, expect as u, test as d } from "vitest";
//#region src/testing/harness.ts
function f(e, t = []) {
	l(`${e.id} contract`, () => {
		d("exposes a valid static component manifest and lazy modules", { timeout: 6e4 }, async () => {
			await y(e);
			let t = await h(e);
			u(t.renderer).toBeTruthy(), u(t.configPanel).toBeTruthy(), u(t.transformModule.outputSchema).toBeTruthy(), u(typeof t.transformModule.transform).toBe("function");
			let n = await _(e);
			u(n.html()).not.toBe(""), n.unmount();
		});
		for (let n of t) d(n.name, async () => {
			let t = a(e, n.config);
			await y(e, t), await n.check?.({
				definition: e,
				config: t
			});
		});
	});
}
function p(e, t = []) {
	let n = t.length > 0 ? t : [{ name: "mounts with fixture data" }];
	l(`${e.id} renderer`, () => {
		let t = /* @__PURE__ */ new Set();
		for (let r of n) d(r.name, { timeout: r.timeout ?? 6e4 }, async () => {
			let n = await g(e, r.mountOptions, {
				inputs: r.inputs,
				paramValues: r.paramValues
			});
			try {
				u(n.html()).not.toBe(""), await r.check?.({
					definition: e,
					config: n.resolvedConfig,
					wrapper: n,
					capturedEvents: n.capturedEvents
				});
				for (let e of n.capturedEvents) t.add(e.eventId);
			} finally {
				n.unmount();
			}
		});
		c(() => {
			C(e, t);
		});
	});
}
function m(e, t = []) {
	let n = t.length > 0 ? t : [{ name: "validates default transform outputs" }];
	l(`${e.id} transform`, () => {
		for (let t of n) d(t.name, { timeout: 3e4 }, async () => {
			let n = await v(e, t);
			await t.check?.(n);
		});
	});
}
async function h(e) {
	return await y(e), {
		renderer: D(await e.renderer(), "renderer"),
		configPanel: D(await e.configPanel(), "configPanel"),
		transformModule: O(await e.transform())
	};
}
async function g(t, n = {}, i = {}) {
	let a = n.props ?? {};
	r(a, "renderer");
	let { renderer: c } = await h(t), l = await e(t), u = i.inputs ?? { data: a.fixtureData ?? l }, d = o(t, a.config, {
		inputs: u,
		paramValues: i.paramValues
	}), f = [], p = S(t, f), m = s(c, {
		props: {
			...a,
			config: d,
			fixtureData: a.fixtureData ?? l,
			emitEvent: p
		},
		slots: n.slots
	});
	return m.capturedEvents = f, m.resolvedConfig = d, m;
}
async function _(t, n = {}) {
	let r = n.props ?? {}, i = a(t, r.config), { configPanel: o } = await h(t), c = await e(t);
	return s(o, {
		props: {
			...r,
			config: i,
			fixtureData: r.fixtureData ?? c
		},
		slots: n.slots
	});
}
async function v(t, n) {
	let r = o(t, n.config, {
		inputs: n.inputs ?? {},
		paramValues: n.paramValues
	}), { transformModule: i } = await h(t), a = {
		config: r,
		fixtureData: await e(t),
		inputs: { ...n.inputs }
	}, s = await i.transform(a);
	return T(i.outputSchema, s), {
		definition: t,
		config: r,
		inputs: a.inputs,
		outputs: E(t, s),
		context: a
	};
}
async function y(n, r = n.configDefaults) {
	let a = [];
	if (typeof n.loadFixtureData != "function") a.push("loadFixtureData loader is missing");
	else try {
		await e(n) === void 0 && a.push("loadFixtureData resolved to undefined");
	} catch (e) {
		let t = e instanceof Error ? e.message : String(e);
		a.push(`loadFixtureData failed: ${t}`);
	}
	n.renderer || a.push("renderer loader is missing"), n.configPanel || a.push("configPanel loader is missing"), n.transform || a.push("transform loader is missing"), n.configSchema.safeParse(r).success || a.push("config is invalid"), w(n.inputs.map((e) => e.id), "input", a), w(n.outputs.map((e) => e.id), "output", a), b(n, a);
	for (let e of n.inputs) for (let n of e.acceptedTypeIds) t(n) || a.push(`Unknown input data type "${n}"`);
	for (let e of n.outputs) t(e.typeId) || a.push(`Unknown output data type "${e.typeId}"`);
	if (i(n, r, a), a.length > 0) throw Error(a.join("\n"));
}
function b(e, t) {
	let r = e.events ?? [], i = e.eventOutputs ?? [];
	w(r.map((e) => e.id), "event", t), r.length > 0 && !e.eventOutputs && t.push("Components with events must declare eventOutputs; use [] for capture-only events");
	let a = new Map(r.map((e) => [e.id, e])), o = new Map(e.outputs.map((e) => [e.id, e]));
	for (let e of r) x(e, t);
	for (let e of i) {
		let r = a.get(e.eventId), i = o.get(e.outputId);
		if (!r) {
			t.push(`Event output references unknown event "${e.eventId}"`);
			continue;
		}
		if (!i) {
			t.push(`Event output for event "${e.eventId}" references unknown output "${e.outputId}"`);
			continue;
		}
		if (!e.project) {
			if (!r.payloadTypeId) {
				t.push(`Event output "${e.eventId}" -> "${e.outputId}" requires payloadTypeId for identity mapping`);
				continue;
			}
			let a = n(r.payloadTypeId), o = n(i.typeId);
			r.payloadTypeId !== i.typeId && a !== o && t.push(`Event output "${e.eventId}" -> "${e.outputId}" needs a project function because payload type "${r.payloadTypeId}" does not match output type "${i.typeId}"`);
		}
	}
}
function x(e, t) {
	if (!e.payloadTypeId) return;
	let r = n(e.payloadTypeId);
	if (!r) {
		t.push(`Event "${e.id}" references unknown payload data type "${e.payloadTypeId}"`);
		return;
	}
	e.payloadSchema !== r && t.push(`Event "${e.id}" payloadSchema must be the canonical schema for "${e.payloadTypeId}"`);
}
function S(e, t) {
	let n = new Map((e.events ?? []).map((e) => [e.id, e]));
	return (r, i) => {
		let a = n.get(r);
		if (!a) throw Error(`Renderer emitted undeclared event "${r}" for ${e.id}`);
		let o = a.payloadSchema.safeParse(i);
		if (!o.success) throw Error(`Renderer emitted invalid payload for event "${r}". ${o.error.message}`);
		t.push({
			eventId: r,
			payload: o.data
		});
	};
}
function C(e, t) {
	let n = new Set((e.events ?? []).map((e) => e.id));
	if (n.size !== 0) {
		for (let e of t) n.delete(e);
		if (n.size > 0) throw Error(`Renderer test did not capture declared event(s): ${Array.from(n).join(", ")}`);
	}
}
function w(e, t, n) {
	let r = /* @__PURE__ */ new Set();
	for (let i of e) r.has(i) && n.push(`Duplicate ${t} id "${i}"`), r.add(i);
}
function T(e, t) {
	let n = e.safeParse(t);
	if (!n.success) throw Error(`Transform output schema validation failed. ${n.error.message}`);
}
function E(e, t) {
	if (!k(t)) throw Error("Static component transforms must return an object.");
	let r = new Map(e.outputs.map((e) => [e.id, e])), i = {};
	for (let [e, a] of Object.entries(t)) {
		if (a === void 0) continue;
		let t = r.get(e);
		if (!t) throw Error(`Unknown transform output "${e}".`);
		let o = n(t.typeId);
		if (!o) throw Error(`Unknown output data type "${t.typeId}".`);
		let s = o.safeParse(a);
		if (!s.success) throw Error(`Transform output "${e}" failed ${t.typeId} validation. ${s.error.message}`);
		i[e] = s.data;
	}
	return i;
}
function D(e, t) {
	if (typeof e == "function" || k(e)) return e;
	throw Error(`Static component ${t} loader did not resolve to a Vue component.`);
}
function O(e) {
	if (!k(e) || typeof e.transform != "function") throw Error("Static component transform loader must resolve a module with a transform function.");
	if (!k(e.outputSchema) || typeof e.outputSchema.safeParse != "function") throw Error("Static component transform modules must export an outputSchema.");
	return e;
}
function k(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { y as assertStaticComponentContract, f as describeStaticComponentContract, p as describeStaticComponentRenderer, m as describeStaticComponentTransform, v as executeStaticTransformCase, h as loadStaticComponentModules, _ as mountStaticComponentConfigPanel, g as mountStaticComponentRenderer };
