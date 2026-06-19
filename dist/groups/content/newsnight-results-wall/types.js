import { param as e, paramsToConfigSchema as t } from "../../../sdk/component-params.js";
import { defineConfigDefaults as n } from "../../../sdk/component-definition-factory.js";
import { z as r } from "zod";
//#region src/groups/content/newsnight-results-wall/types.ts
var i = {
	raceTitle: e(r.string().trim().default("Colorado Governor"), {
		label: "Race title",
		control: {
			kind: "input",
			placeholder: "Colorado Governor"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	raceStatus: e(r.string().trim().default("Too early to call"), {
		label: "Race status",
		control: {
			kind: "input",
			placeholder: "Too early to call"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	candidateA: e(r.string().trim().default("Marisol Vega"), {
		label: "Candidate A",
		control: {
			kind: "input",
			placeholder: "Candidate A"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	candidateAVotes: e(r.number().int().nonnegative().default(1284092), {
		label: "Candidate A votes",
		control: {
			kind: "number",
			min: 0,
			step: 1e3
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	candidateB: e(r.string().trim().default("Evan Cross"), {
		label: "Candidate B",
		control: {
			kind: "input",
			placeholder: "Candidate B"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	candidateBVotes: e(r.number().int().nonnegative().default(1197840), {
		label: "Candidate B votes",
		control: {
			kind: "number",
			min: 0,
			step: 1e3
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	precinctsReporting: e(r.number().min(0).max(100).default(74), {
		label: "Precincts reporting",
		control: {
			kind: "number",
			min: 0,
			max: 100,
			step: 1
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	}),
	selectedCounty: e(r.string().trim().default("Jefferson County"), {
		label: "Selected county",
		control: {
			kind: "input",
			placeholder: "Jefferson County"
		},
		bindable: !0,
		bindFrom: [{
			input: "data",
			typeId: "all-data"
		}]
	})
}, a = t(i), o = n(a);
//#endregion
export { o as NewsnightResultsWallConfigDefaults, a as NewsnightResultsWallConfigSchema, i as NewsnightResultsWallParams };
