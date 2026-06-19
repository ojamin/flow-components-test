import { defineComponent as e } from "../../../sdk/component-definition-factory.js";
import { createPassthroughTransform as t } from "../../../sdk/component-definition.js";
import { textConfigDefaults as n, textConfigSchema as r, textParams as i } from "./types.js";
var a = e({
	id: "demo.demo-text",
	version: 1,
	displayName: "Text",
	description: "Text block with optional prose styling, line clamping, and alignment.",
	icon: "text",
	category: "content",
	renderable: !0,
	configSchema: r,
	configDefaults: n,
	params: i,
	themeContract: { consumes: [{
		propertyKey: "color.foreground",
		note: "Primary content text and icons."
	}, {
		propertyKey: "color.foregroundMuted",
		note: "Secondary labels, helper copy, and empty states."
	}] },
	builder: {
		defaultSize: {
			w: 24,
			h: 4
		},
		minSize: {
			w: 6,
			h: 2
		},
		resizeX: !0,
		resizeY: !1,
		heightMode: "content",
		draggable: !0,
		wrapperVariant: "default"
	},
	flow: { scaffolded: !0 },
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
			label: "Default copy"
		},
		{
			id: "empty",
			label: "Empty copy",
			description: "No text configured or resolved.",
			appliesTo: "config"
		},
		{
			id: "long",
			label: "Long copy",
			description: "Long prose for wrapping and clamping review.",
			appliesTo: "config"
		}
	],
	stateSupport: {
		empty: !0,
		loading: { notApplicable: "Text renders local config or already-resolved input data." },
		error: { notApplicable: "Text has no component-owned async or fallible runtime operation." },
		disabled: { notApplicable: "Text is non-interactive." },
		focus: { notApplicable: "Text exposes no focusable renderer surface." },
		keyboard: { notApplicable: "Text exposes no keyboard interaction." },
		responsive: !0
	},
	loadFixtureData: async () => (await import("./fixtures/sample-data.js")).default,
	loadFixtureVariants: async () => ({
		default: (await import("./fixtures/sample-data.js")).default,
		empty: { text: "" },
		long: { text: "Flow Builder text components should wrap long editorial copy without custom styling or layout breakage across responsive previews." }
	})
});
//#endregion
export { a as componentDefinition, a as default };
