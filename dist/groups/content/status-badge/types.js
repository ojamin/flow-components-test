import { param as e, paramsToConfigSchema as t } from "../../../sdk/component-params.js";
import { defineConfigDefaults as n } from "../../../sdk/component-definition-factory.js";
import { selectParam as r } from "../../../sdk/config-field-helpers.js";
import { z as i } from "zod";
//#region src/groups/content/status-badge/types.ts
var a = [
	"neutral",
	"success",
	"warning",
	"danger"
], o = ["sm", "md"], s = {
	label: e(i.string().trim().default("System status"), {
		label: "Label",
		control: {
			kind: "input",
			placeholder: "Metric label",
			testId: "status-badge-label-input"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	value: e(i.string().trim().default("Operational"), {
		label: "Value",
		control: {
			kind: "input",
			placeholder: "Displayed status",
			testId: "status-badge-value-input"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	tone: r(i.enum(a).default("success"), {
		label: "Tone",
		options: a,
		testId: "status-badge-tone-select"
	}),
	size: r(i.enum(o).default("md"), {
		label: "Size",
		options: o,
		testId: "status-badge-size-select"
	})
}, c = t(s), l = n(c);
//#endregion
export { l as StatusBadgeConfigDefaults, c as StatusBadgeConfigSchema, s as StatusBadgeParams };
