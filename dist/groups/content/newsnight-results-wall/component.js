import { defineComponent as e } from "../../../sdk/component-definition-factory.js";
import { createPassthroughTransform as t } from "../../../sdk/component-definition.js";
import { NewsnightResultsWallConfigDefaults as n, NewsnightResultsWallConfigSchema as r, NewsnightResultsWallParams as i } from "./types.js";
var a = e({
	id: "content.newsnight-results-wall",
	version: 1,
	displayName: "Newsnight Results Wall",
	description: "Full broadcast results wall with race call, map board, newsroom rail, and analytics strip.",
	icon: "panel-top",
	category: "content",
	renderable: !0,
	configSchema: r,
	configDefaults: n,
	params: i,
	themeContract: { consumes: [
		{
			propertyKey: "color.pageBackground",
			note: "Results wall base."
		},
		{
			propertyKey: "color.foreground",
			note: "Primary labels and headline values."
		},
		{
			propertyKey: "color.foregroundMuted",
			note: "Secondary labels and metadata."
		},
		{
			propertyKey: "color.border",
			note: "Dense broadcast panel separation."
		},
		{
			propertyKey: "color.destructive",
			note: "Alerts and Republican-style result accents."
		},
		{
			propertyKey: "color.accent",
			note: "Democratic-style result accents and selected map state."
		}
	] },
	builder: {
		defaultSize: {
			w: 48,
			h: 74
		},
		minSize: {
			w: 28,
			h: 42
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
		label: "Newsroom results wall"
	}],
	stateSupport: {
		empty: { notApplicable: "Results wall ships with configured demo data." },
		loading: { notApplicable: "Results wall has no component-owned async operation." },
		error: { notApplicable: "Results wall has no component-owned fallible runtime operation." },
		disabled: { notApplicable: "Results wall is display-only." },
		focus: { notApplicable: "Results wall has no focusable renderer controls." },
		keyboard: { notApplicable: "Results wall exposes no keyboard interaction." },
		responsive: !0
	},
	loadFixtureData: async () => (await import("./fixtures/sample-data.js")).default
});
//#endregion
export { a as componentDefinition, a as default };
