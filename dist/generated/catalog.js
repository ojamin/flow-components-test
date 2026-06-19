import { componentDefinition as e } from "../groups/content/button/component.js";
import { componentDefinition as t } from "../groups/content/text/component.js";
//#region src/generated/catalog.ts
var n = [e, t], r = {
	groups: ["content"],
	components: [{
		id: "demo.demo-button",
		group: "content",
		title: "Button",
		description: e.description,
		source: "static",
		sourceId: "flow-components-test"
	}, {
		id: "demo.demo-text",
		group: "content",
		title: "Text",
		description: t.description,
		source: "static",
		sourceId: "flow-components-test"
	}],
	definitions: n
}, i = n.map((e) => e.id);
function a(e) {
	return n.find((t) => t.id === e);
}
function o(e) {
	let t = a(e);
	if (!t) throw Error(`Unknown built-in component definition "${e}".`);
	return t;
}
//#endregion
export { a as getBuiltInComponentDefinition, o as requireBuiltInComponentDefinition, n as staticComponentDefinitions, r as staticComponentPackageCatalog, i as staticComponentPackageDefinitionIds };
