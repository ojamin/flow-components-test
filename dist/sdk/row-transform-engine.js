import { rowTransformConfigSchema as e } from "./row-transform-engine-types.js";
import { resolveObjectRows as t } from "./row-transform-utils.js";
import { filterRows as n, sortRows as r } from "./row-transform-filter-sort.js";
import { groupRows as i, pivotRows as a } from "./row-transform-group-pivot.js";
import { lookupRows as o } from "./row-transform-lookup.js";
import { formatRows as s, normalizeRows as c } from "./row-transform-normalize-format.js";
import { dateBucketRows as l, dedupeRows as u, flattenRows as d, projectRow as f } from "./row-transform-projection.js";
//#region src/sdk/row-transform-engine.ts
function p(p, h) {
	let g = e.parse(p), _ = t(h.data, g.rowsPath), v = (() => {
		switch (g.operation) {
			case "sort": return r(_, g.keys);
			case "filter": return n(_, g.clauses, g.match);
			case "select": return _.map((e) => f(e, g.fields));
			case "lookup": return o(_, t(h.lookupData, g.lookupRowsPath), g);
			case "group": return i(_, g.groupByFields, g.countField, g.aggregates);
			case "pivot": return a(_, g);
			case "flatten": return d(_, g.field, g.outputField, g.keepEmpty);
			case "dedupe": return u(_, g.keyFields, g.keep);
			case "dateBucket": return l(_, g.field, g.outputField, g.granularity);
			case "normalize": return c(_, g.fields);
			case "format": return s(_, g.fields);
			default: return m(g);
		}
	})();
	return {
		rows: v,
		all: v
	};
}
function m(e) {
	throw Error(`Unsupported row transform operation: ${JSON.stringify(e)}`);
}
//#endregion
export { p as runRowTransform };
