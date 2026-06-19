import "zod";
//#region src/sdk/component-transform-context.ts
function e(e, t) {
	return {
		config: e,
		inputs: t
	};
}
function t(e, t) {
	return e.inputs[t];
}
function n(e, t) {
	if (!(t in e.inputs)) throw Error(`Missing required transform input "${t}".`);
	return e.inputs[t];
}
//#endregion
export { e as createTransformContext, t as getTransformInput, n as requireTransformInput };
