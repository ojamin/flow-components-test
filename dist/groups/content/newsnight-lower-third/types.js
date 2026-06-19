import { param as e, paramsToConfigSchema as t } from "../../../sdk/component-params.js";
import { defineConfigDefaults as n } from "../../../sdk/component-definition-factory.js";
import { selectParam as r } from "../../../sdk/config-field-helpers.js";
import { z as i } from "zod";
//#region src/groups/content/newsnight-lower-third/types.ts
var a = [
	"neutral",
	"breaking",
	"projected",
	"hold"
], o = {
	eyebrow: e(i.string().trim().default("Election Night / Ready for air"), {
		label: "Eyebrow",
		control: {
			kind: "input",
			placeholder: "Election Night / Ready for air"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	headline: e(i.string().trim().default("Colorado Governor remains too early to call"), {
		label: "Headline",
		control: {
			kind: "input",
			placeholder: "Lower-third headline"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	subline: e(i.string().trim().default("74% reporting / Vega +3.5 / Pueblo batch under verification"), {
		label: "Subline",
		control: {
			kind: "input",
			placeholder: "Subline"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	tone: r(i.enum(a).default("hold"), {
		label: "Tone",
		options: a
	})
}, s = t(o), c = n(s);
//#endregion
export { c as NewsnightLowerThirdConfigDefaults, s as NewsnightLowerThirdConfigSchema, o as NewsnightLowerThirdParams };
