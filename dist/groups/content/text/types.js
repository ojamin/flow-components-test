import { jsonValueSchema as e } from "../../../sdk/schema-primitives.js";
import { param as t, paramsToConfigSchema as n } from "../../../sdk/component-params.js";
import { defineConfigDefaults as r } from "../../../sdk/component-definition-factory.js";
import { selectParam as i } from "../../../sdk/config-field-helpers.js";
import { clampLineOptions as a, contentAlignOptions as o } from "../../../sdk/content-primitives.js";
import { z as s } from "zod";
//#region src/groups/content/text/types.ts
var c = {
	text: t(s.string().trim().default("Your content goes here."), {
		label: "Text",
		control: {
			kind: "textarea",
			rows: 4,
			placeholder: "Enter paragraph text, or bind to a data field…",
			testId: "text-body-input"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	prose: t(s.boolean().default(!0), {
		label: "Prose styling",
		helpText: "Adds heading sizes, paragraph spacing, and list styles. Off shows plain unstyled text.",
		control: {
			kind: "boolean",
			testId: "text-prose-toggle"
		}
	}),
	align: i(s.enum(o).default("left"), {
		label: "Alignment",
		options: o,
		testId: "text-align-select"
	}),
	clampLines: i(s.enum(a).default("none"), {
		label: "Clamp lines",
		options: a,
		helpText: "Truncates visible lines at this limit. None renders all content regardless of height.",
		testId: "text-clamp-lines-select"
	})
}, l = n(c), u = r(l);
s.object({ all: e.optional() });
//#endregion
export { u as textConfigDefaults, l as textConfigSchema, c as textParams };
