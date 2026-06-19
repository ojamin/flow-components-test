import e from "./component-ui/input/Input.js";
import t from "./component-ui/label/Label.js";
import { getRegisteredDataPathPicker as n } from "./data-path-picker-adapter.js";
import { computed as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineComponent as u, openBlock as d, resolveDynamicComponent as f, toDisplayString as p, unref as m, withCtx as h } from "vue";
//#region src/sdk/SchemaFormDataPathField.vue?vue&type=script&setup=true&lang.ts
var g = ["data-field"], _ = { class: "flex items-center gap-1" }, v = {
	key: 1,
	class: "text-xs text-muted-foreground/70"
}, y = /* @__PURE__ */ u({
	__name: "SchemaFormDataPathField",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		hideLabel: {
			type: Boolean,
			default: !1
		},
		instanceId: { default: void 0 },
		inputs: { default: () => [] },
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:value"],
	setup(u, { emit: y }) {
		let b = u, x = y, S = r(() => n()), C = r(() => `schema-field-${b.fieldKey}`), w = r(() => b.descriptor.meta.control.kind === "data-path" ? b.descriptor.meta.control : null);
		function T() {
			let e = b.value;
			return typeof e == "string" ? e : e == null ? "" : String(e);
		}
		function E(e) {
			return typeof e == "string" ? e : String(e);
		}
		function D() {
			return b.disabled === !0;
		}
		function O(e) {
			D() || x("update:value", E(e));
		}
		function k(e) {
			D() || x("update:value", e);
		}
		return (n, r) => (d(), o("div", {
			class: "flex flex-col gap-1.5",
			"data-field": u.fieldKey
		}, [
			u.hideLabel ? a("", !0) : (d(), i(m(t), {
				key: 0,
				for: C.value,
				class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			}, {
				default: h(() => [c(p(u.descriptor.meta.label), 1)]),
				_: 1
			}, 8, ["for"])),
			s("div", _, [l(m(e), {
				id: C.value,
				class: "min-w-0 flex-1",
				"model-value": T(),
				placeholder: w.value?.placeholder,
				"aria-label": u.hideLabel ? u.descriptor.meta.label : void 0,
				"data-testid": w.value?.testId,
				disabled: u.disabled,
				"onUpdate:modelValue": r[0] ||= (e) => O(e)
			}, null, 8, [
				"id",
				"model-value",
				"placeholder",
				"aria-label",
				"data-testid",
				"disabled"
			]), S.value ? (d(), i(f(S.value), {
				key: 0,
				"model-value": T(),
				"field-label": u.descriptor.meta.label,
				mode: "literal",
				"output-format": "relative",
				"instance-id": u.instanceId,
				inputs: u.inputs,
				"data-testid": `${u.fieldKey}-data-path-picker`,
				disabled: u.disabled,
				"aria-disabled": u.disabled || void 0,
				tabindex: u.disabled ? -1 : void 0,
				"onUpdate:modelValue": r[1] ||= (e) => k(e)
			}, null, 8, [
				"model-value",
				"field-label",
				"instance-id",
				"inputs",
				"data-testid",
				"disabled",
				"aria-disabled",
				"tabindex"
			])) : a("", !0)]),
			u.descriptor.meta.helpText ? (d(), o("p", v, p(u.descriptor.meta.helpText), 1)) : a("", !0)
		], 8, g));
	}
});
//#endregion
export { y as default };
