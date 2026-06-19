import { parseComponentConfig as e } from "./component-definition-factory.js";
//#region src/sdk/component-ports-slots.ts
function t(t, n = t.configDefaults) {
	let r = e(t.configSchema, n), i = t.resolvePorts?.({
		config: r,
		inputs: t.inputs,
		outputs: t.outputs
	});
	return {
		inputs: [...i?.inputs ?? t.inputs],
		outputs: [...i?.outputs ?? t.outputs]
	};
}
function n(e, t = e.configDefaults) {
	if (!e.resolveSlots) return [...e.slots];
	let n = e.configSchema.safeParse(t);
	return !n.success || !r(n.data) ? [...e.slots] : [...e.resolveSlots({
		config: n.data,
		slots: e.slots
	}).slots];
}
function r(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { t as resolveComponentPorts, n as resolveComponentSlots };
