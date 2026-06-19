import { z as e } from "zod";
//#region src/sdk/component-params.ts
function t(e, t) {
	return {
		schema: e,
		meta: t
	};
}
function n(t) {
	let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [e, t.schema]));
	return e.object(n);
}
//#endregion
export { t as param, n as paramsToConfigSchema };
