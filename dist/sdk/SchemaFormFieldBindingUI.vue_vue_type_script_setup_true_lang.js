import { isValidJsonPath as e, resolveAllowedParamBindSources as t } from "./param-values.js";
import n from "./component-ui/input/Input.js";
import r from "./component-ui/label/Label.js";
import i from "./component-ui/toggle-group/ToggleGroup.js";
import a from "./component-ui/toggle-group/ToggleGroupItem.js";
import o from "./component-ui/tooltip/Tooltip.js";
import s from "./component-ui/tooltip/TooltipContent.js";
import c from "./component-ui/tooltip/TooltipProvider.js";
import l from "./component-ui/tooltip/TooltipTrigger.js";
import u from "./component-ui/config/ConfigSelector.js";
import { getRegisteredDataPathPicker as d } from "./data-path-picker-adapter.js";
import { Fragment as f, computed as p, createBlock as m, createCommentVNode as h, createElementBlock as g, createElementVNode as _, createTextVNode as v, createVNode as y, defineComponent as b, openBlock as x, reactive as S, resolveDynamicComponent as C, toDisplayString as w, unref as T, withCtx as E } from "vue";
//#region src/sdk/SchemaFormFieldBindingUI.vue?vue&type=script&setup=true&lang.ts
var D = { class: "flex items-center justify-between gap-2" }, O = {
	key: 0,
	class: "flex flex-col gap-1.5 pl-2"
}, k = { class: "flex items-center gap-1" }, A = ["data-testid"], j = {
	key: 1,
	class: "text-xs text-muted-foreground/80"
}, M = ["data-testid"], N = /* @__PURE__ */ b({
	__name: "SchemaFormFieldBindingUI",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		paramValueState: {},
		inputs: {},
		instanceId: {},
		inputId: {},
		disabled: { type: Boolean }
	},
	emits: ["update:paramValueState"],
	setup(b, { emit: N }) {
		let P = b, F = N, I = S({
			draft: null,
			invalid: !1
		}), L = p(() => t(P.descriptor, P.inputs)), R = p(() => L.value.length > 0), z = p(() => d()), B = p(() => `schema-field-${P.fieldKey}-bind-path`), V = p(() => P.paramValueState?.mode === "bind" ? "bind" : "literal"), H = p(() => L.value.map((e) => ({
			value: e.input,
			label: U(e.input)
		})));
		function U(e) {
			return P.inputs.find((t) => t.id === e)?.label ?? e;
		}
		function W() {
			let e = P.paramValueState;
			return e?.mode === "bind" ? e.input : "";
		}
		function G() {
			if (I.draft !== null) return I.draft;
			let e = P.paramValueState;
			return e?.mode === "bind" ? e.path : "$";
		}
		function K(e) {
			return typeof e == "string" ? e : String(e);
		}
		function q(e) {
			if (P.disabled || e === V.value) return;
			if (e === "literal") {
				I.draft = null, I.invalid = !1, F("update:paramValueState", {
					mode: "literal",
					value: P.value
				});
				return;
			}
			let t = L.value;
			if (t.length === 0) return;
			let n = t[0];
			I.draft = "$", I.invalid = !1, F("update:paramValueState", {
				mode: "bind",
				input: n.input,
				path: "$"
			});
		}
		function J(t) {
			if (P.disabled || !L.value.some((e) => e.input === t)) return;
			let n = P.paramValueState, r = G();
			if (!e(r)) {
				I.invalid = !0;
				return;
			}
			I.invalid = !1;
			let i = n?.mode === "bind" ? n.fallback : void 0;
			F("update:paramValueState", {
				mode: "bind",
				input: t,
				path: r,
				...i === void 0 ? {} : { fallback: i }
			});
		}
		function Y(e) {
			P.disabled || (I.draft = K(e), I.invalid = !1);
		}
		function X() {
			if (P.disabled) return;
			let t = I.draft ?? G();
			if (!e(t)) {
				I.invalid = !0;
				return;
			}
			I.invalid = !1;
			let n = P.paramValueState;
			!n || n.mode !== "bind" || n.path !== t && F("update:paramValueState", {
				mode: "bind",
				input: n.input,
				path: t,
				...n.fallback === void 0 ? {} : { fallback: n.fallback }
			});
		}
		function Z(e) {
			if (P.disabled) return;
			I.draft = e, I.invalid = !1;
			let t = P.paramValueState;
			!t || t.mode !== "bind" || F("update:paramValueState", {
				mode: "bind",
				input: t.input,
				path: e,
				...t.fallback === void 0 ? {} : { fallback: t.fallback }
			});
		}
		function Q() {
			return `${P.fieldKey}-bind-toggle`;
		}
		function $(e) {
			return `${P.fieldKey}-bind-mode-${e === "bind" ? "from-data" : "literal"}`;
		}
		function ee(e) {
			e !== "literal" && e !== "bind" || q(e);
		}
		function te(e) {
			ee(typeof e == "string" ? e : void 0);
		}
		return (e, t) => (x(), g(f, null, [_("div", D, [y(T(r), {
			for: b.inputId,
			class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
		}, {
			default: E(() => [v(w(b.descriptor.meta.label), 1)]),
			_: 1
		}, 8, ["for"]), y(T(c), { "delay-duration": 200 }, {
			default: E(() => [y(T(i), {
				type: "single",
				variant: "outline",
				size: "sm",
				"model-value": V.value,
				"aria-label": `${b.descriptor.meta.label} binding mode`,
				"data-testid": Q(),
				"onUpdate:modelValue": te
			}, {
				default: E(() => [y(T(a), {
					value: "literal",
					class: "text-xs",
					disabled: b.disabled,
					"data-testid": $("literal")
				}, {
					default: E(() => [...t[4] ||= [v(" Literal ", -1)]]),
					_: 1
				}, 8, ["disabled", "data-testid"]), R.value ? (x(), m(T(a), {
					key: 1,
					value: "bind",
					class: "text-xs",
					disabled: b.disabled,
					"data-testid": $("bind")
				}, {
					default: E(() => [...t[7] ||= [v(" From data ", -1)]]),
					_: 1
				}, 8, ["disabled", "data-testid"])) : (x(), m(T(o), { key: 0 }, {
					default: E(() => [y(T(l), { "as-child": "" }, {
						default: E(() => [y(T(a), {
							value: "bind",
							class: "text-xs aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
							"aria-disabled": "true",
							disabled: b.disabled,
							"data-testid": $("bind")
						}, {
							default: E(() => [...t[5] ||= [v(" From data ", -1)]]),
							_: 1
						}, 8, ["disabled", "data-testid"])]),
						_: 1
					}), y(T(s), { side: "bottom" }, {
						default: E(() => [...t[6] ||= [v("Connect an input port to enable binding.", -1)]]),
						_: 1
					})]),
					_: 1
				}))]),
				_: 1
			}, 8, [
				"model-value",
				"aria-label",
				"data-testid"
			])]),
			_: 1
		})]), V.value === "bind" ? (x(), g("div", O, [R.value ? (x(), g(f, { key: 0 }, [
			y(T(u), {
				"model-value": W(),
				options: H.value,
				label: "Source",
				disabled: b.disabled,
				"data-testid": `${b.fieldKey}-bind-source`,
				"onUpdate:modelValue": t[0] ||= (e) => J(e)
			}, null, 8, [
				"model-value",
				"options",
				"disabled",
				"data-testid"
			]),
			_("div", k, [y(T(n), {
				id: B.value,
				class: "min-w-0 flex-1",
				"model-value": G(),
				placeholder: "$.path.to.value",
				"aria-label": `JSONPath expression for ${b.descriptor.meta.label}`,
				"data-testid": `${b.fieldKey}-bind-path`,
				"aria-invalid": I.invalid || void 0,
				readonly: b.disabled || void 0,
				"aria-readonly": b.disabled || void 0,
				tabindex: b.disabled ? -1 : void 0,
				"onUpdate:modelValue": t[1] ||= (e) => Y(e),
				onBlur: t[2] ||= (e) => X()
			}, null, 8, [
				"id",
				"model-value",
				"aria-label",
				"data-testid",
				"aria-invalid",
				"readonly",
				"aria-readonly",
				"tabindex"
			]), z.value ? (x(), m(C(z.value), {
				key: 0,
				"model-value": G(),
				"field-label": b.descriptor.meta.label,
				mode: "binding",
				"output-format": "jsonpath",
				"instance-id": b.instanceId,
				"source-input-id": W(),
				inputs: b.inputs,
				disabled: b.disabled,
				"aria-disabled": b.disabled || void 0,
				tabindex: b.disabled ? -1 : void 0,
				"data-testid": `${b.fieldKey}-bind-data-path-picker`,
				"onUpdate:modelValue": t[3] ||= (e) => Z(e)
			}, null, 8, [
				"model-value",
				"field-label",
				"instance-id",
				"source-input-id",
				"inputs",
				"disabled",
				"aria-disabled",
				"tabindex",
				"data-testid"
			])) : h("", !0)]),
			I.invalid ? (x(), g("p", {
				key: 0,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": `${b.fieldKey}-bind-path-validation-hint`
			}, " Enter a JSONPath like $, $.foo, or $.items[0]. ", 8, A)) : b.descriptor.meta.helpText ? (x(), g("p", j, w(b.descriptor.meta.helpText), 1)) : h("", !0)
		], 64)) : (x(), g("p", {
			key: 1,
			class: "text-xs text-muted-foreground/80",
			"data-testid": `${b.fieldKey}-bind-no-source`
		}, " No compatible inputs are connected for this param. ", 8, M))])) : h("", !0)], 64));
	}
});
//#endregion
export { N as default };
