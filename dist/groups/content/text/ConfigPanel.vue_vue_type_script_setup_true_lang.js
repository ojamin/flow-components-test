import { textConfigDefaults as e, textParams as t } from "./types.js";
import { componentDefinition as n } from "./component.js";
import r from "../../../sdk/SchemaConfigPanel.js";
import { createBlock as i, defineComponent as a, openBlock as o, unref as s } from "vue";
//#region src/groups/content/text/ConfigPanel.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ a({
	__name: "ConfigPanel",
	emits: ["update:config", "update:paramValues"],
	setup(a, { emit: c }) {
		let l = c;
		return (a, c) => (o(), i(s(r), {
			title: "Text settings",
			params: s(t),
			defaults: s(e),
			"definition-inputs": s(n).inputs,
			"onUpdate:config": c[0] ||= (e) => l("update:config", e),
			"onUpdate:paramValues": c[1] ||= (e) => l("update:paramValues", e)
		}, null, 8, [
			"params",
			"defaults",
			"definition-inputs"
		]));
	}
});
//#endregion
export { c as default };
