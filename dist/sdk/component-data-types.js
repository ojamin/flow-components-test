import { getDataTypeDefinition as e } from "./data-types.js";
//#region src/sdk/component-data-types.ts
function t(t, n) {
	let r = e(t);
	if (!r) return {
		success: !1,
		error: /* @__PURE__ */ Error(`Unknown data type "${t}".`)
	};
	let i = r.schema.safeParse(n);
	return i.success ? {
		success: !0,
		value: i.data
	} : {
		success: !1,
		error: Error(`Value does not satisfy data type "${t}".`, { cause: i.error })
	};
}
function n(e, n) {
	let r = t(e, n);
	if (!r.success) throw r.error;
	return r.value;
}
function r(e, n) {
	let r = new Map(e.map((e) => [e.id, e])), i = {}, a = [];
	for (let [e, o] of Object.entries(n)) {
		if (o === void 0) continue;
		let n = r.get(e);
		if (!n) {
			a.push(`Unknown output port "${e}".`);
			continue;
		}
		let s = t(n.typeId, o);
		if (!s.success) {
			a.push(`Output port "${e}" failed validation: ${s.error.message}`);
			continue;
		}
		i[e] = s.value;
	}
	if (a.length > 0) throw Error(`Invalid component outputs. ${a.join(" ")}`);
	return i;
}
//#endregion
export { n as parseDataTypeValue, t as safeParseDataTypeValue, r as shapePortOutputs };
