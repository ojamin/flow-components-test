import { defineComponent as e } from "../../../sdk/component-definition-factory.js";
import { createPassthroughTransform as t } from "../../../sdk/component-definition.js";
import { NewsnightLowerThirdConfigDefaults as n, NewsnightLowerThirdConfigSchema as r, NewsnightLowerThirdParams as i } from "./types.js";
var a = e({
	id: "content.newsnight-lower-third",
	version: 1,
	displayName: "Newsnight Lower Third",
	description: "Broadcast lower-third preview with air-readiness and tone states.",
	icon: "captions",
	category: "content",
	renderable: !0,
	configSchema: r,
	configDefaults: n,
	params: i,
	themeContract: { consumes: [
		{
			propertyKey: "color.pageBackground",
			note: "Preview base."
		},
		{
			propertyKey: "color.foreground",
			note: "Headline text."
		},
		{
			propertyKey: "color.foregroundMuted",
			note: "Secondary copy."
		},
		{
			propertyKey: "color.border",
			note: "Broadcast frame outlines."
		},
		{
			propertyKey: "color.destructive",
			note: "Breaking and hold tones."
		},
		{
			propertyKey: "color.accent",
			note: "Projected and ready tones."
		}
	] },
	builder: {
		defaultSize: {
			w: 48,
			h: 10
		},
		minSize: {
			w: 18,
			h: 7
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
		label: "Lower-third preview"
	}],
	stateSupport: {
		empty: { notApplicable: "Lower third always renders from configured copy." },
		loading: { notApplicable: "Lower third has no component-owned async operation." },
		error: { notApplicable: "Lower third has no component-owned fallible runtime operation." },
		disabled: { notApplicable: "Lower third is display-only." },
		focus: { notApplicable: "Lower third has no focusable renderer controls." },
		keyboard: { notApplicable: "Lower third exposes no keyboard interaction." },
		responsive: !0
	},
	loadFixtureData: async () => (await import("./fixtures/sample-data.js")).default
});
//#endregion
export { a as componentDefinition, a as default };
