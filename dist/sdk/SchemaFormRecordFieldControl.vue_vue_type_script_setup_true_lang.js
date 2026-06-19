import e from "./component-ui/input/Input.js";
import t from "./component-ui/label/Label.js";
import { getRegisteredDataPathPicker as n } from "./data-path-picker-adapter.js";
import { computed as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineComponent as u, openBlock as d, resolveDynamicComponent as f, toDisplayString as p, unref as m, withCtx as h } from "vue";
//#region src/sdk/SchemaFormRecordFieldControl.vue?vue&type=script&setup=true&lang.ts
var g = ["data-field"], _ = { class: "flex items-center gap-1" }, v = {
	key: 1,
	class: "text-xs text-muted-foreground/70"
}, y = /* @__PURE__ */ u({
	__name: "SchemaFormRecordFieldControl",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		config: { default: void 0 },
		hideLabel: {
			type: Boolean,
			default: !1
		},
		instanceId: { default: void 0 },
		inputs: { default: () => [] },
		inputId: { default: void 0 },
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:value"],
	setup(u, { emit: y }) {
		let b = u, x = y, S = r(() => n()), C = r(() => b.inputId ?? `schema-field-${b.fieldKey}`), w = r(() => b.descriptor.meta.control.kind === "record-field" ? b.descriptor.meta.control : null), T = r(() => {
			let e = w.value;
			if (!e) return;
			let t = E(e.pickerRootPathKey);
			if (!t) return;
			let n = E(e.pickerRootPathSuffixKey);
			return n ? D(t, n) : t;
		});
		function E(e) {
			if (!e) return;
			let t = b.config?.[e];
			if (typeof t != "string") return;
			let n = t.trim();
			return n.length > 0 ? n : void 0;
		}
		function D(e, t) {
			let n = t.startsWith(".") ? t.slice(1) : t;
			if (n.length === 0) return e;
			let r = e.endsWith("]") ? "" : "[*]";
			return n.startsWith("[") ? `${e}${r}${n}` : `${e}${r}.${n}`;
		}
		function O() {
			let e = b.value;
			return typeof e == "string" ? e : e == null ? "" : String(e);
		}
		function k(e) {
			return typeof e == "string" ? e : String(e);
		}
		function A() {
			return b.disabled === !0;
		}
		function j(e) {
			A() || x("update:value", k(e));
		}
		function M(e) {
			A() || x("update:value", e);
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
				"model-value": O(),
				placeholder: w.value?.placeholder,
				"aria-label": u.hideLabel ? u.descriptor.meta.label : void 0,
				"data-testid": w.value?.testId,
				disabled: u.disabled,
				"onUpdate:modelValue": r[0] ||= (e) => j(e)
			}, null, 8, [
				"id",
				"model-value",
				"placeholder",
				"aria-label",
				"data-testid",
				"disabled"
			]), S.value ? (d(), i(f(S.value), {
				key: 0,
				"model-value": O(),
				"field-label": u.descriptor.meta.label,
				mode: "literal",
				"output-format": "relative",
				"instance-id": u.instanceId,
				inputs: u.inputs,
				"root-path": T.value,
				"data-testid": `${u.fieldKey}-record-field-picker`,
				disabled: u.disabled,
				"aria-disabled": u.disabled || void 0,
				tabindex: u.disabled ? -1 : void 0,
				"onUpdate:modelValue": r[1] ||= (e) => M(e)
			}, null, 8, [
				"model-value",
				"field-label",
				"instance-id",
				"inputs",
				"root-path",
				"data-testid",
				"disabled",
				"aria-disabled",
				"tabindex"
			])) : a("", !0)]),
			!u.hideLabel && u.descriptor.meta.helpText ? (d(), o("p", v, p(u.descriptor.meta.helpText), 1)) : a("", !0)
		], 8, g));
	}
});
//#endregion
export { y as default };
