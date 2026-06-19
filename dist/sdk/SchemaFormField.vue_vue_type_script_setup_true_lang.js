import e from "./component-ui/switch/Switch.js";
import t from "./component-ui/label/Label.js";
import n from "./component-ui/config/ConfigSelector.js";
import r from "./SchemaFormFieldBindingUI.js";
import i from "./SchemaFormLiteralControl.js";
import { computed as a, createCommentVNode as o, createElementBlock as s, createElementVNode as c, createTextVNode as l, createVNode as u, defineComponent as d, mergeProps as f, openBlock as p, ref as m, toDisplayString as h, unref as g, vShow as ee, withCtx as _, withDirectives as v } from "vue";
//#region src/sdk/SchemaFormField.vue?vue&type=script&setup=true&lang.ts
var te = ["data-field", "data-binding-mode"], ne = { class: "contents" }, re = {
	key: 0,
	class: "text-xs text-muted-foreground/80"
}, ie = ["data-testid"], y = ["data-field"], b = ["data-testid"], x = ["data-field"], S = { class: "flex min-w-0 flex-col gap-0.5" }, ae = {
	key: 0,
	class: "text-xs leading-relaxed text-muted-foreground/80"
}, oe = ["data-testid"], se = ["data-field"], ce = ["data-testid"], C = ["data-field"], w = ["data-testid"], T = ["data-field"], E = ["data-testid"], D = ["data-field"], O = ["data-testid"], k = ["data-field"], A = ["data-testid"], j = ["data-field"], M = ["data-testid"], N = ["data-field"], P = ["data-testid"], F = ["data-field"], I = ["data-testid"], L = ["data-field"], le = {
	key: 0,
	class: "text-xs text-muted-foreground/80"
}, R = ["data-testid"], z = /* @__PURE__ */ d({
	__name: "SchemaFormField",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		config: {},
		paramValueState: {},
		inputs: {},
		instanceId: {},
		themeContext: {},
		disabled: { type: Boolean },
		disabledHelpText: {}
	},
	emits: ["update:value", "update:paramValueState"],
	setup(d, { emit: z }) {
		let B = d, V = z, H = m(!1), U = a(() => `schema-field-${B.fieldKey}`), W = a(() => B.descriptor.meta.bindable === !0 && B.inputs.length > 0), G = a(() => B.paramValueState?.mode === "bind" ? "bind" : "literal"), K = a(() => {
			if (q.value || !B.descriptor.meta.helpText || H.value) return !1;
			let e = B.descriptor.meta.control.kind;
			return !(e === "data-path" || e === "headers" || e === "view-list" || e === "record-field" || e === "field-list" || e === "aggregate-list" || e === "theme-role" || e === "view-select");
		}), q = a(() => B.disabled ? B.disabledHelpText ?? B.descriptor.meta.helpText ?? "Controlled by another setting." : null), J = a(() => B.disabled ? B.disabledHelpText == null ? B.descriptor.meta.helpText == null ? "Controlled by another setting." : null : B.disabledHelpText : null), Y = a(() => G.value === "bind" ? J.value : q.value), X = a(() => {
			if (B.disabled) return {
				"aria-disabled": "true",
				"data-disabled": "true"
			};
		});
		function Z() {
			return B.disabled === !0;
		}
		function ue() {
			let e = B.value;
			return typeof e == "string" ? e : e == null ? "" : String(e);
		}
		function de() {
			return !!B.value;
		}
		function fe(e) {
			return e.map((e) => ({
				value: e.value,
				label: e.label
			}));
		}
		function pe(e) {
			Z() || V("update:value", e);
		}
		function me(e) {
			Z() || V("update:value", e);
		}
		function Q(e) {
			Z() || V("update:value", e);
		}
		function $(e) {
			H.value = e;
		}
		function he(e) {
			Z() || V("update:paramValueState", e);
		}
		return (a, m) => W.value ? (p(), s("div", f({
			key: 0,
			class: "flex flex-col gap-1.5",
			"data-field": d.fieldKey,
			"data-binding-mode": G.value
		}, X.value), [
			u(r, {
				"field-key": d.fieldKey,
				"input-id": U.value,
				descriptor: d.descriptor,
				value: d.value,
				"param-value-state": d.paramValueState,
				inputs: d.inputs,
				"instance-id": d.instanceId,
				disabled: d.disabled,
				"onUpdate:paramValueState": m[0] ||= (e) => he(e)
			}, null, 8, [
				"field-key",
				"input-id",
				"descriptor",
				"value",
				"param-value-state",
				"inputs",
				"instance-id",
				"disabled"
			]),
			v(c("div", ne, [u(i, {
				"field-key": d.fieldKey,
				"input-id": U.value,
				descriptor: d.descriptor,
				value: d.value,
				config: d.config,
				inputs: d.inputs,
				"instance-id": d.instanceId,
				"theme-context": d.themeContext,
				"hide-label": !0,
				disabled: d.disabled,
				"onUpdate:value": m[1] ||= (e) => Q(e),
				"onUpdate:invalid": m[2] ||= (e) => $(e)
			}, null, 8, [
				"field-key",
				"input-id",
				"descriptor",
				"value",
				"config",
				"inputs",
				"instance-id",
				"theme-context",
				"disabled"
			]), K.value ? (p(), s("p", re, h(d.descriptor.meta.helpText), 1)) : o("", !0)], 512), [[ee, G.value === "literal"]]),
			Y.value ? (p(), s("p", {
				key: 0,
				class: "text-xs text-muted-foreground/80",
				"data-testid": `schema-field-${d.fieldKey}-disabled-help`
			}, h(Y.value), 9, ie)) : o("", !0)
		], 16, te)) : d.descriptor.meta.control.kind === "select" ? (p(), s("div", f({
			key: 1,
			"data-field": d.fieldKey
		}, X.value), [u(g(n), {
			"model-value": ue(),
			options: fe(d.descriptor.meta.control.options),
			label: d.descriptor.meta.label,
			hint: d.disabled ? void 0 : d.descriptor.meta.helpText,
			"data-testid": d.descriptor.meta.control.testId,
			disabled: d.disabled,
			"onUpdate:modelValue": m[3] ||= (e) => pe(e)
		}, null, 8, [
			"model-value",
			"options",
			"label",
			"hint",
			"data-testid",
			"disabled"
		]), q.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(q.value), 9, b)) : o("", !0)], 16, y)) : d.descriptor.meta.control.kind === "boolean" ? (p(), s("div", f({
			key: 2,
			class: "flex items-start justify-between gap-3",
			"data-field": d.fieldKey
		}, X.value), [c("div", S, [
			u(g(t), {
				for: U.value,
				class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			}, {
				default: _(() => [l(h(d.descriptor.meta.label), 1)]),
				_: 1
			}, 8, ["for"]),
			d.descriptor.meta.helpText && !q.value ? (p(), s("p", ae, h(d.descriptor.meta.helpText), 1)) : o("", !0),
			q.value ? (p(), s("p", {
				key: 1,
				class: "text-xs leading-relaxed text-muted-foreground/80",
				"data-testid": `schema-field-${d.fieldKey}-disabled-help`
			}, h(q.value), 9, oe)) : o("", !0)
		]), u(g(e), {
			id: U.value,
			"model-value": de(),
			"aria-label": d.descriptor.meta.label,
			"data-testid": d.descriptor.meta.control.testId,
			disabled: d.disabled,
			"onUpdate:modelValue": m[4] ||= (e) => me(e)
		}, null, 8, [
			"id",
			"model-value",
			"aria-label",
			"data-testid",
			"disabled"
		])], 16, x)) : d.descriptor.meta.control.kind === "data-path" ? (p(), s("div", f({
			key: 3,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			descriptor: d.descriptor,
			value: d.value,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[5] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, ce)) : o("", !0)], 16, se)) : d.descriptor.meta.control.kind === "record-field" ? (p(), s("div", f({
			key: 4,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			"input-id": U.value,
			descriptor: d.descriptor,
			value: d.value,
			config: d.config,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[6] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"input-id",
			"descriptor",
			"value",
			"config",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, w)) : o("", !0)], 16, C)) : d.descriptor.meta.control.kind === "field-list" ? (p(), s("div", f({
			key: 5,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			descriptor: d.descriptor,
			value: d.value,
			config: d.config,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[7] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"config",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, E)) : o("", !0)], 16, T)) : d.descriptor.meta.control.kind === "aggregate-list" ? (p(), s("div", f({
			key: 6,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			descriptor: d.descriptor,
			value: d.value,
			config: d.config,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[8] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"config",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, O)) : o("", !0)], 16, D)) : d.descriptor.meta.control.kind === "headers" ? (p(), s("div", f({
			key: 7,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			descriptor: d.descriptor,
			value: d.value,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[9] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, A)) : o("", !0)], 16, k)) : d.descriptor.meta.control.kind === "view-list" ? (p(), s("div", f({
			key: 8,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			descriptor: d.descriptor,
			value: d.value,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[10] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, M)) : o("", !0)], 16, j)) : d.descriptor.meta.control.kind === "view-select" ? (p(), s("div", f({
			key: 9,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			"input-id": U.value,
			descriptor: d.descriptor,
			value: d.value,
			config: d.config,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			disabled: d.disabled,
			"onUpdate:value": m[11] ||= (e) => Q(e)
		}, null, 8, [
			"field-key",
			"input-id",
			"descriptor",
			"value",
			"config",
			"inputs",
			"instance-id",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, P)) : o("", !0)], 16, N)) : d.descriptor.meta.control.kind === "theme-role" ? (p(), s("div", f({
			key: 10,
			"data-field": d.fieldKey
		}, X.value), [u(i, {
			"field-key": d.fieldKey,
			"input-id": U.value,
			descriptor: d.descriptor,
			value: d.value,
			inputs: d.inputs,
			"instance-id": d.instanceId,
			"theme-context": d.themeContext,
			disabled: d.disabled,
			"onUpdate:value": m[12] ||= (e) => Q(e),
			"onUpdate:invalid": m[13] ||= (e) => $(e)
		}, null, 8, [
			"field-key",
			"input-id",
			"descriptor",
			"value",
			"inputs",
			"instance-id",
			"theme-context",
			"disabled"
		]), J.value ? (p(), s("p", {
			key: 0,
			class: "mt-1.5 text-xs text-muted-foreground/80",
			"data-testid": `schema-field-${d.fieldKey}-disabled-help`
		}, h(J.value), 9, I)) : o("", !0)], 16, F)) : (p(), s("div", f({
			key: 11,
			class: "flex flex-col gap-1.5",
			"data-field": d.fieldKey
		}, X.value), [
			u(g(t), {
				for: U.value,
				class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			}, {
				default: _(() => [l(h(d.descriptor.meta.label), 1)]),
				_: 1
			}, 8, ["for"]),
			u(i, {
				"field-key": d.fieldKey,
				"input-id": U.value,
				descriptor: d.descriptor,
				value: d.value,
				inputs: d.inputs,
				"instance-id": d.instanceId,
				"theme-context": d.themeContext,
				"hide-label": !0,
				disabled: d.disabled,
				"onUpdate:value": m[14] ||= (e) => Q(e),
				"onUpdate:invalid": m[15] ||= (e) => $(e)
			}, null, 8, [
				"field-key",
				"input-id",
				"descriptor",
				"value",
				"inputs",
				"instance-id",
				"theme-context",
				"disabled"
			]),
			K.value ? (p(), s("p", le, h(d.descriptor.meta.helpText), 1)) : o("", !0),
			q.value ? (p(), s("p", {
				key: 1,
				class: "text-xs text-muted-foreground/80",
				"data-testid": `schema-field-${d.fieldKey}-disabled-help`
			}, h(q.value), 9, R)) : o("", !0)
		], 16, L));
	}
});
//#endregion
export { z as default };
