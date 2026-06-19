import { jsonValueSchema as e } from "../../../sdk/schema-primitives.js";
import { param as t, paramsToConfigSchema as n } from "../../../sdk/component-params.js";
import { defineConfigDefaults as r } from "../../../sdk/component-definition-factory.js";
import { buttonTargetOptions as i } from "../../../sdk/content-primitives.js";
import { z as a } from "zod";
//#region src/groups/content/button/types.ts
var o = [
	"default",
	"secondary",
	"outline",
	"ghost",
	"link",
	"destructive"
], s = [
	"xs",
	"sm",
	"default",
	"lg",
	"icon"
], c = {
	label: t(a.string().default("Learn more"), {
		label: "Label",
		control: {
			kind: "input",
			placeholder: "Learn more",
			testId: "button-label-input"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	href: t(a.string().trim().default(""), {
		label: "Href",
		control: {
			kind: "input",
			placeholder: "https://example.com",
			testId: "button-href-input"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	variant: t(a.enum(o).default("default"), {
		label: "Variant",
		control: {
			kind: "select",
			options: o.map((e) => ({
				label: e.charAt(0).toUpperCase() + e.slice(1),
				value: e
			}))
		}
	}),
	size: t(a.enum(s).default("default"), {
		label: "Size",
		control: {
			kind: "select",
			options: s.map((e) => ({
				label: e.toUpperCase(),
				value: e
			}))
		}
	}),
	target: t(a.enum(i).default("self"), {
		label: "Target",
		control: {
			kind: "select",
			options: [{
				label: "Same tab",
				value: "self"
			}, {
				label: "New tab",
				value: "blank"
			}]
		}
	}),
	requestedViewId: t(a.string().trim().default(""), {
		label: "Requested view ID",
		control: {
			kind: "input",
			placeholder: "details",
			testId: "button-requested-view-id-input"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	leadingIcon: t(a.string().trim().default(""), {
		label: "Leading icon",
		helpText: "Optional Iconify icon name, for example lucide:arrow-right.",
		control: {
			kind: "input",
			placeholder: "lucide:arrow-right",
			testId: "button-leading-icon-input"
		}
	}),
	trailingIcon: t(a.string().trim().default(""), {
		label: "Trailing icon",
		helpText: "Optional Iconify icon name rendered after the label.",
		control: {
			kind: "input",
			placeholder: "lucide:chevron-right",
			testId: "button-trailing-icon-input"
		}
	}),
	accessibleLabel: t(a.string().trim().default(""), {
		label: "Accessible label",
		helpText: "Required for icon-only buttons and useful when the visible label needs more context.",
		control: {
			kind: "input",
			placeholder: "Open details",
			testId: "button-accessible-label-input"
		}
	}),
	disabled: t(a.boolean().default(!1), {
		label: "Disabled",
		helpText: "Prevents pointer and keyboard activation while keeping the button visible.",
		control: { kind: "boolean" }
	}),
	disabledReason: t(a.string().trim().default(""), {
		label: "Disabled reason",
		helpText: "Optional accessible context for why the button cannot be activated.",
		control: {
			kind: "input",
			placeholder: "Complete the previous step first",
			testId: "button-disabled-reason-input"
		}
	})
}, l = n(c), u = r(l);
a.object({ all: e.optional() });
//#endregion
export { u as buttonConfigDefaults, l as buttonConfigSchema, c as buttonParams };
