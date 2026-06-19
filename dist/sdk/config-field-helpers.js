import { param as e } from "./component-params.js";
//#region src/sdk/config-field-helpers.ts
var t = [{
	input: "data",
	typeId: "all-data"
}];
function n(e) {
	return t.map((t) => ({
		...t,
		defaultPath: e
	}));
}
var r = [
	"none",
	"compact",
	"card",
	"panel",
	"page"
], i = ["default"], a = [
	"none",
	"sm",
	"md",
	"lg",
	"xl"
], o = [
	"none",
	"sm",
	"md",
	"lg",
	"panel"
], s = {
	none: "None",
	compact: "Compact",
	card: "Standard",
	panel: "Relaxed",
	page: "Generous"
}, c = {
	none: "None",
	sm: "Small",
	md: "Medium",
	lg: "Large",
	xl: "Extra large"
}, l = {
	none: "None",
	sm: "Small",
	md: "Medium",
	lg: "Large",
	panel: "Extra large"
}, u = { default: "Default" };
function d(t, n) {
	return e(t, x(n, {
		label: n.label,
		helpText: n.helpText,
		...S(n),
		control: {
			kind: "data-path",
			placeholder: n.placeholder,
			...n.testId ? { testId: n.testId } : {}
		}
	}));
}
function f(t, n) {
	return e(t, x(n, {
		label: n.label,
		helpText: n.helpText,
		...S(n),
		control: {
			kind: "record-field",
			placeholder: n.placeholder,
			...n.pickerRootPathKey ? { pickerRootPathKey: n.pickerRootPathKey } : {},
			...n.pickerRootPathSuffixKey ? { pickerRootPathSuffixKey: n.pickerRootPathSuffixKey } : {},
			...n.testId ? { testId: n.testId } : {}
		},
		...n.visible === !1 ? { visible: !1 } : {}
	}));
}
function p(t, n) {
	return e(t, x(n, {
		label: n.label,
		helpText: n.helpText,
		control: {
			kind: "field-list",
			...n.itemPlaceholder ? { itemPlaceholder: n.itemPlaceholder } : {},
			...n.addLabel ? { addLabel: n.addLabel } : {},
			...n.pickerRootPathKey ? { pickerRootPathKey: n.pickerRootPathKey } : {},
			...n.testId ? { testId: n.testId } : {}
		},
		...S(n)
	}));
}
function m(t, n) {
	return e(t, x(n, {
		label: n.label,
		helpText: n.helpText,
		control: {
			kind: "aggregate-list",
			operations: n.operations.map((e) => ({ ...e })),
			...n.addLabel ? { addLabel: n.addLabel } : {},
			...n.sourcePlaceholder ? { sourcePlaceholder: n.sourcePlaceholder } : {},
			...n.outputPlaceholder ? { outputPlaceholder: n.outputPlaceholder } : {},
			...n.sourcePickerRootPathKey ? { sourcePickerRootPathKey: n.sourcePickerRootPathKey } : {},
			...n.testId ? { testId: n.testId } : {}
		},
		...S(n)
	}));
}
function h(n, r) {
	return e(n, {
		label: r.rowsLabel ?? "Rows path",
		helpText: r.rowsHint,
		...S(r),
		control: {
			kind: "chart-adapter",
			rowsKey: r.rowsKey ?? "rowsPath",
			rowsLabel: r.rowsLabel ?? "Rows path",
			rowsPlaceholder: r.rowsPlaceholder ?? "Choose rows",
			fields: r.fields,
			...r.rowsHint ? { rowsHint: r.rowsHint } : {},
			...r.testId ? { testId: r.testId } : {}
		},
		bindable: !0,
		bindFrom: r.bindFrom ?? t
	});
}
function g(t, n) {
	return e(t, {
		label: n.label,
		helpText: n.helpText,
		...S(n),
		control: {
			kind: "number",
			min: n.min,
			max: n.max,
			step: n.step ?? 1,
			...n.testId ? { testId: n.testId } : {}
		}
	});
}
function _(e, t) {
	return g(e, {
		...t,
		helpText: t.helpText ?? `Caps how many ${t.noun} render so large data stays responsive.`
	});
}
function v(t, n) {
	return e(t, {
		label: n.label,
		helpText: n.helpText,
		...S(n),
		control: {
			kind: "boolean",
			...n.testId ? { testId: n.testId } : {}
		}
	});
}
function y(t, n) {
	return e(t, {
		label: n.label,
		helpText: n.helpText,
		group: n.group,
		schemaProjection: n.schemaProjection,
		...S(n),
		control: {
			kind: "theme-role",
			...n.groups ? { groups: n.groups } : {},
			...n.allowedKeys ? { allowedKeys: n.allowedKeys } : {},
			...typeof n.allowUnset == "boolean" ? { allowUnset: n.allowUnset } : {},
			...n.unsetLabel ? { unsetLabel: n.unsetLabel } : {},
			...n.disabled ? { disabled: n.disabled } : {},
			...n.testId ? { testId: n.testId } : {}
		}
	});
}
function b(t, n) {
	return e(t, {
		label: n.label,
		helpText: n.helpText,
		...S(n),
		control: {
			kind: "select",
			options: n.options.map((e) => ({
				label: n.labels?.[e] ?? C(e),
				value: e
			})),
			...n.testId ? { testId: n.testId } : {}
		}
	});
}
function x(e, n) {
	return e.bindable === !0 ? {
		...n,
		bindable: !0,
		bindFrom: e.bindFrom ?? t
	} : n;
}
function S(e) {
	return {
		...e.showWhen ? { showWhen: e.showWhen } : {},
		...e.disabledWhen ? { disabledWhen: e.disabledWhen } : {},
		...typeof e.disabledHelpText == "string" ? { disabledHelpText: e.disabledHelpText } : {}
	};
}
function C(e) {
	return e === "none" ? "None" : e.split("-").map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
}
//#endregion
export { m as aggregateListParam, v as booleanParam, h as chartRowsAdapterParam, t as dataBindSource, n as dataBindSourceWithDefaultPath, d as dataPathParam, p as fieldListParam, g as numberParam, f as recordFieldParam, _ as renderLimitParam, b as selectParam, y as themeRoleParam, s as visualPaddingLabels, r as visualPaddingTokens, c as visualRadiusLabels, a as visualRadiusTokens, l as visualShadowLabels, o as visualShadowTokens, u as visualToneLabels, i as visualToneTokens };
