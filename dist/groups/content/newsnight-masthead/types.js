import { param as e, paramsToConfigSchema as t } from "../../../sdk/component-params.js";
import { defineConfigDefaults as n } from "../../../sdk/component-definition-factory.js";
import { selectParam as r } from "../../../sdk/config-field-helpers.js";
import { z as i } from "zod";
//#region src/groups/content/newsnight-masthead/types.ts
var a = [
	"producer",
	"air",
	"standby"
], o = {
	brand: e(i.string().trim().default("NEWSNIGHT LIVE"), {
		label: "Brand",
		control: {
			kind: "input",
			placeholder: "NEWSNIGHT LIVE"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	edition: e(i.string().trim().default("Election Desk / Colorado 2026"), {
		label: "Edition",
		control: {
			kind: "input",
			placeholder: "Election Desk / Colorado 2026"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	timestamp: e(i.string().trim().default("22:14:08 MT"), {
		label: "Timestamp",
		control: {
			kind: "input",
			placeholder: "22:14:08 MT"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	freshness: e(i.string().trim().default("AP + state feeds refreshed 38s ago"), {
		label: "Freshness",
		control: {
			kind: "input",
			placeholder: "Data freshness"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	mode: r(i.enum(a).default("producer"), {
		label: "Mode",
		options: a
	}),
	ticker: e(i.string().trim().default("Denver margin narrows to D +18.4 | Mesa County first rural batch posted | Verification hold in Pueblo precinct 14"), {
		label: "Ticker items",
		control: {
			kind: "textarea",
			placeholder: "Separate ticker items with |"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	})
}, s = t(o), c = n(s);
//#endregion
export { c as NewsnightMastheadConfigDefaults, s as NewsnightMastheadConfigSchema, o as NewsnightMastheadParams };
