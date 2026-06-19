import { defineComponent as e } from "../../../sdk/component-definition-factory.js";
import { createPassthroughTransform as t } from "../../../sdk/component-definition.js";
import { NewsnightMastheadConfigDefaults as n, NewsnightMastheadConfigSchema as r, NewsnightMastheadParams as i } from "./types.js";
var a = e({
	id: "content.newsnight-masthead",
	version: 1,
	displayName: "Newsnight Masthead",
	description: "Broadcast masthead with live state, producer mode, freshness, and ticker strip.",
	icon: "radio-tower",
	category: "content",
	renderable: !0,
	configSchema: r,
	configDefaults: n,
	params: i,
	themeContract: { consumes: [
		{
			propertyKey: "color.pageBackground",
			note: "Broadcast masthead base."
		},
		{
			propertyKey: "color.foreground",
			note: "Primary masthead text."
		},
		{
			propertyKey: "color.foregroundMuted",
			note: "Secondary labels and ticker copy."
		},
		{
			propertyKey: "color.border",
			note: "Subtle dividers and control outlines."
		},
		{
			propertyKey: "color.destructive",
			note: "Live and breaking-news emphasis."
		},
		{
			propertyKey: "color.accent",
			note: "Producer-mode and data freshness emphasis."
		}
	] },
	builder: {
		defaultSize: {
			w: 48,
			h: 9
		},
		minSize: {
			w: 20,
			h: 6
		},
		resizeX: !0,
		resizeY: !0,
		heightMode: "content",
		draggable: !0,
		wrapperVariant: "default"
	},
	flow: {
		scaffolded: !0,
		tint: "content"
	},
	inputs: [{
		id: "data",
		label: "Data",
		mode: "full",
		acceptedTypeIds: ["all-data"],
		required: !1,
		allowMultiple: !1,
		allowCycle: !1
	}],
	outputs: [{
		id: "all",
		label: "All data",
		typeId: "all-data"
	}],
	renderer: async () => (await import("./Renderer.js")).default,
	configPanel: async () => (await import("./ConfigPanel.js")).default,
	transform: t,
	fixtureVariants: [{
		id: "default",
		label: "Broadcast masthead"
	}],
	stateSupport: {
		empty: { notApplicable: "Masthead always renders from configured broadcast copy." },
		loading: { notApplicable: "Masthead has no component-owned async operation." },
		error: { notApplicable: "Masthead has no component-owned fallible runtime operation." },
		disabled: { notApplicable: "Masthead is display-only." },
		focus: { notApplicable: "Masthead has no focusable renderer controls." },
		keyboard: { notApplicable: "Masthead exposes no keyboard interaction." },
		responsive: !0
	},
	loadFixtureData: async () => (await import("./fixtures/sample-data.js")).default
});
//#endregion
export { a as componentDefinition, a as default };
