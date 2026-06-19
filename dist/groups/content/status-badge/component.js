import { defineComponent as e } from "../../../sdk/component-definition-factory.js";
import { createPassthroughTransform as t } from "../../../sdk/component-definition.js";
import { StatusBadgeConfigDefaults as n, StatusBadgeConfigSchema as r, StatusBadgeParams as i } from "./types.js";
var a = e({
	id: "content.status-badge",
	version: 1,
	displayName: "Status Badge",
	description: "Compact status badge for operational labels, counts, and health states.",
	icon: "badge-check",
	category: "content",
	renderable: !0,
	configSchema: r,
	configDefaults: n,
	params: i,
	themeContract: { consumes: [
		{
			propertyKey: "color.accent",
			note: "Success and neutral badge emphasis."
		},
		{
			propertyKey: "color.border",
			note: "Badge outline and empty-state boundary."
		},
		{
			propertyKey: "color.destructive",
			note: "Danger status emphasis."
		},
		{
			propertyKey: "color.foreground",
			note: "Primary label and value text."
		},
		{
			propertyKey: "color.foregroundMuted",
			note: "Secondary label and empty-state copy."
		},
		{
			propertyKey: "color.surfaceMuted",
			note: "Muted badge surfaces."
		}
	] },
	builder: {
		defaultSize: {
			w: 6,
			h: 2
		},
		minSize: {
			w: 3,
			h: 2
		},
		resizeX: !0,
		resizeY: !1,
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
	fixtureVariants: [
		{
			id: "default",
			label: "Default status"
		},
		{
			id: "empty",
			label: "Missing status copy",
			description: "Label and value are both empty.",
			appliesTo: "config"
		},
		{
			id: "warning",
			label: "Warning tone",
			description: "Operational warning state.",
			appliesTo: "config"
		}
	],
	stateSupport: {
		empty: !0,
		loading: { notApplicable: "Status Badge renders already-resolved config and input data." },
		error: { notApplicable: "Status Badge has no component-owned fallible runtime operation." },
		disabled: { notApplicable: "Status Badge is non-interactive." },
		focus: { notApplicable: "Status Badge exposes no focusable renderer surface." },
		keyboard: { notApplicable: "Status Badge exposes no keyboard interaction." },
		responsive: !0
	},
	loadFixtureData: async () => (await import("./fixtures/sample-data.js")).default,
	loadFixtureVariants: async () => ({
		default: (await import("./fixtures/sample-data.js")).default,
		empty: {
			label: "",
			value: ""
		},
		warning: {
			label: "API latency",
			value: "Elevated",
			tone: "warning"
		}
	})
});
//#endregion
export { a as componentDefinition, a as default };
