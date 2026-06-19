import e from "./SchemaForm.js";
import { computed as t, createElementBlock as n, createElementVNode as r, createVNode as i, defineComponent as a, openBlock as o, toDisplayString as s } from "vue";
//#region src/sdk/SchemaConfigPanel.vue?vue&type=script&setup=true&lang.ts
var c = { class: "space-y-4" }, l = { class: "text-sm font-semibold" }, u = /* @__PURE__ */ a({
	__name: "SchemaConfigPanel",
	props: {
		title: {},
		params: {},
		defaults: {},
		definitionInputs: {},
		config: {},
		paramValues: {},
		instanceId: {},
		resolvedInputs: {},
		fixtureData: {},
		datasetDerivationService: {},
		themeContext: {}
	},
	emits: ["update:config", "update:paramValues"],
	setup(a, { emit: u }) {
		let d = a, f = u, p = t(() => ({
			...d.defaults,
			...d.config
		})), m = t(() => d.resolvedInputs ?? d.definitionInputs), h = t(() => d.fixtureData);
		return (t, u) => (o(), n("section", c, [r("header", null, [r("h3", l, s(a.title), 1)]), i(e, {
			params: a.params,
			config: p.value,
			"param-values": a.paramValues,
			inputs: m.value,
			"instance-id": a.instanceId,
			data: h.value,
			"dataset-derivation-service": a.datasetDerivationService,
			"theme-context": a.themeContext,
			"onUpdate:config": u[0] ||= (e) => f("update:config", e),
			"onUpdate:paramValues": u[1] ||= (e) => f("update:paramValues", e)
		}, null, 8, [
			"params",
			"config",
			"param-values",
			"inputs",
			"instance-id",
			"data",
			"dataset-derivation-service",
			"theme-context"
		])]));
	}
});
//#endregion
export { u as default };
