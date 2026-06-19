import { defineComponent as e } from "../../../sdk/component-definition-factory.js";
import { createPassthroughTransform as t } from "../../../sdk/component-definition.js";
import { viewRequestedPayloadSchema as n } from "../../../shared/view-container/index.js";
import { buttonConfigDefaults as r, buttonConfigSchema as i, buttonParams as a } from "./types.js";
import { z as o } from "zod";
//#region src/groups/content/button/component.ts
var s = o.object({ at: o.string().datetime() }), c = e({
	id: "demo.demo-button",
	version: 1,
	displayName: "Button",
	description: "CTA button with safe-link preview behavior and disabled fallbacks.",
	icon: "square-arrow-out-up-right",
	category: "content",
	renderable: !0,
	configSchema: i,
	configDefaults: r,
	params: a,
	themeContract: { consumes: [
		{
			propertyKey: "color.accent",
			note: "Interactive accents, highlights, and selected states."
		},
		{
			propertyKey: "color.accentForeground",
			note: "Text and icons displayed on accent surfaces."
		},
		{
			propertyKey: "color.border",
			note: "Component borders, dividers, and outlines."
		},
		{
			propertyKey: "color.input",
			note: "Outline button border color aligned with form/control boundaries."
		},
		{
			propertyKey: "color.secondary",
			note: "Secondary button surface."
		},
		{
			propertyKey: "color.secondaryForeground",
			note: "Text and icons displayed on secondary button surfaces."
		},
		{
			propertyKey: "color.destructive",
			note: "Destructive button surface and critical action emphasis."
		},
		{
			propertyKey: "color.destructiveForeground",
			note: "Text and icons displayed on destructive button surfaces."
		},
		{
			propertyKey: "color.focusRing",
			note: "Keyboard focus rings and active outlines."
		},
		{
			propertyKey: "color.foreground",
			note: "Primary content text and icons."
		},
		{
			propertyKey: "color.foregroundMuted",
			note: "Secondary labels, helper copy, and empty states."
		},
		{
			propertyKey: "color.surface",
			note: "Primary component surfaces."
		},
		{
			propertyKey: "color.surfaceMuted",
			note: "Muted panels, empty states, and hover surfaces."
		}
	] },
	builder: {
		defaultSize: {
			w: 8,
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
	outputs: [
		{
			id: "all",
			label: "All data",
			typeId: "all-data"
		},
		{
			id: "clickedAt",
			label: "Clicked at",
			typeId: "event-timestamp"
		},
		{
			id: "requestedViewId",
			label: "Requested view ID",
			typeId: "text-value"
		}
	],
	events: [{
		id: "clicked",
		label: "Clicked",
		description: "Emitted when the button is activated.",
		payloadSchema: s
	}, {
		id: "viewRequested",
		label: "View requested",
		description: "Emitted when the button is activated and a non-empty Requested view ID is configured. Carries the requested view id and optional hash slug for view-container targets.",
		payloadSchema: n
	}],
	eventOutputs: [{
		eventId: "clicked",
		outputId: "clickedAt",
		project: (e) => s.parse(e).at
	}, {
		eventId: "viewRequested",
		outputId: "requestedViewId",
		project: (e) => n.parse(e).activeViewId
	}],
	renderer: async () => (await import("./Renderer.js")).default,
	configPanel: async () => (await import("./ConfigPanel.js")).default,
	transform: t,
	fixtureVariants: [
		{
			id: "default",
			label: "Default button"
		},
		{
			id: "empty",
			label: "Missing label",
			appliesTo: "config"
		},
		{
			id: "disabled",
			label: "Disabled action",
			appliesTo: "config"
		}
	],
	stateSupport: {
		empty: !0,
		loading: { notApplicable: "Button does not perform component-owned async work." },
		error: { notApplicable: "Invalid or missing navigation targets render disabled fallbacks, not error UI." },
		disabled: !0,
		focus: !0,
		keyboard: !0,
		responsive: !0
	},
	loadFixtureData: async () => (await import("./fixtures/sample-data.js")).default,
	loadFixtureVariants: async () => ({
		default: (await import("./fixtures/sample-data.js")).default,
		empty: { label: "" },
		disabled: {
			label: "Action unavailable in this fixture.",
			href: ""
		}
	})
});
//#endregion
export { c as componentDefinition, c as default };
