//#region src/sdk/schema-form-interactivity.ts
function e(e, n, r) {
	let i = [];
	if (n.meta.visible === !1) return {
		hidden: !0,
		disabled: !1,
		diagnostics: i
	};
	let a = !t({
		paramKey: e,
		condition: "showWhen",
		predicate: n.meta.showWhen,
		config: r,
		fallback: !0,
		diagnostics: i
	});
	if (a) return {
		hidden: a,
		disabled: !1,
		diagnostics: i
	};
	let o = t({
		paramKey: e,
		condition: "disabledWhen",
		predicate: n.meta.disabledWhen,
		config: r,
		fallback: !1,
		diagnostics: i
	});
	return {
		hidden: a,
		disabled: o,
		...o && n.meta.disabledHelpText ? { disabledHelpText: n.meta.disabledHelpText } : {},
		diagnostics: i
	};
}
function t({ paramKey: e, condition: t, predicate: n, config: r, fallback: i, diagnostics: a }) {
	if (!n) return i;
	try {
		return n(r);
	} catch (n) {
		return a.push({
			paramKey: e,
			conditionKind: t,
			message: n instanceof Error ? n.message : String(n)
		}), i;
	}
}
//#endregion
export { e as evaluateParamInteractivity };
