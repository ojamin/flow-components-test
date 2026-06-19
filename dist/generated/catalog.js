import { componentDefinition as e } from "../groups/content/button/component.js";
import { componentDefinition as t } from "../groups/content/text/component.js";
import { componentDefinition as n } from "../groups/content/status-badge/component.js";
//#region src/generated/catalog.ts
var r = [
	e,
	t,
	n
], i = {
	groups: ["content"],
	components: [
		{
			id: "demo.demo-button",
			group: "content",
			title: "Button",
			description: e.description,
			source: "static",
			sourceId: "flow-components-test"
		},
		{
			id: "demo.demo-text",
			group: "content",
			title: "Text",
			description: t.description,
			source: "static",
			sourceId: "flow-components-test"
		},
		{
			id: "content.status-badge",
			group: "content",
			title: "Status Badge",
			description: n.description,
			source: "static",
			sourceId: "flow-components-test"
		}
	],
	definitions: r
}, a = r.map((e) => e.id);
function o(e) {
	return r.find((t) => t.id === e);
}
function s(e) {
	let t = o(e);
	if (!t) throw Error(`Unknown built-in component definition "${e}".`);
	return t;
}
//#endregion
export { o as getBuiltInComponentDefinition, s as requireBuiltInComponentDefinition, r as staticComponentDefinitions, i as staticComponentPackageCatalog, a as staticComponentPackageDefinitionIds };
