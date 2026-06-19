import { componentDefinition as e } from "../groups/content/button/component.js";
import { componentDefinition as t } from "../groups/content/text/component.js";
import { componentDefinition as n } from "../groups/content/newsnight-lower-third/component.js";
import { componentDefinition as r } from "../groups/content/newsnight-masthead/component.js";
import { componentDefinition as i } from "../groups/content/newsnight-results-wall/component.js";
import { componentDefinition as a } from "../groups/content/status-badge/component.js";
//#region src/generated/catalog.ts
var o = [
	e,
	t,
	n,
	r,
	i,
	a
], s = {
	groups: ["content"],
	components: [
		{
			id: "demo.demo-button",
			group: "content",
			title: "Button",
			description: e.description,
			source: "static",
			sourceId: "flow-components-test-newsnight"
		},
		{
			id: "demo.demo-text",
			group: "content",
			title: "Text",
			description: t.description,
			source: "static",
			sourceId: "flow-components-test-newsnight"
		},
		{
			id: "content.newsnight-lower-third",
			group: "content",
			title: "Newsnight Lower Third",
			description: n.description,
			source: "static",
			sourceId: "flow-components-test-newsnight"
		},
		{
			id: "content.newsnight-masthead",
			group: "content",
			title: "Newsnight Masthead",
			description: r.description,
			source: "static",
			sourceId: "flow-components-test-newsnight"
		},
		{
			id: "content.newsnight-results-wall",
			group: "content",
			title: "Newsnight Results Wall",
			description: i.description,
			source: "static",
			sourceId: "flow-components-test-newsnight"
		},
		{
			id: "content.status-badge",
			group: "content",
			title: "Status Badge",
			description: a.description,
			source: "static",
			sourceId: "flow-components-test-newsnight"
		}
	],
	definitions: o
}, c = o.map((e) => e.id);
function l(e) {
	return o.find((t) => t.id === e);
}
function u(e) {
	let t = l(e);
	if (!t) throw Error(`Unknown built-in component definition "${e}".`);
	return t;
}
//#endregion
export { l as getBuiltInComponentDefinition, u as requireBuiltInComponentDefinition, o as staticComponentDefinitions, s as staticComponentPackageCatalog, c as staticComponentPackageDefinitionIds };
