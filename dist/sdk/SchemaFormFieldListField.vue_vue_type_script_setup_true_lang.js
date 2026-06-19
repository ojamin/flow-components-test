import e from "./component-ui/badge/Badge.js";
import t from "./component-ui/button/Button.js";
import n from "./component-ui/input/Input.js";
import r from "./component-ui/label/Label.js";
import { Icon as i } from "./component-ui-primitives.js";
import { getRegisteredDataPathPicker as a } from "./data-path-picker-adapter.js";
import { Fragment as o, computed as s, createBlock as c, createCommentVNode as l, createElementBlock as u, createTextVNode as d, createVNode as f, defineComponent as p, openBlock as m, ref as h, renderList as g, resolveDynamicComponent as _, toDisplayString as v, unref as y, watch as b, withCtx as x } from "vue";
//#region src/sdk/SchemaFormFieldListField.vue?vue&type=script&setup=true&lang.ts
var S = ["data-field", "data-testid"], C = {
	key: 0,
	class: "flex items-center justify-between gap-2"
}, w = {
	key: 1,
	class: "text-xs text-muted-foreground/70"
}, T = ["data-testid"], E = [
	"data-testid",
	"data-row-index",
	"data-row-invalid"
], D = ["data-testid"], O = /* @__PURE__ */ p({
	__name: "SchemaFormFieldListField",
	props: {
		fieldKey: {},
		descriptor: {},
		modelValue: {},
		config: { default: void 0 },
		inputs: { default: () => [] },
		instanceId: { default: void 0 },
		hideLabel: {
			type: Boolean,
			default: !1
		},
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:modelValue"],
	setup(p, { emit: O }) {
		let k = p, A = O, j = s(() => a()), M = h([]), N = 1, P = s(() => k.descriptor.meta.control.kind === "field-list" ? k.descriptor.meta.control : null), F = s(() => k.modelValue ?? []), I = s(() => [...F.value.map((e, t) => ({
			key: `persisted:${t}`,
			value: e,
			source: "persisted",
			sourceIndex: t,
			touched: !0
		})), ...M.value.map((e, t) => ({
			key: `draft:${e.id}`,
			value: e.value,
			source: "draft",
			sourceIndex: t,
			touched: e.touched
		}))]);
		function L(e) {
			return e.value.trim().length === 0;
		}
		function R(e) {
			return L(e) && (e.source === "persisted" || e.touched);
		}
		let z = s(() => I.value.some(R)), B = s(() => P.value?.itemPlaceholder ?? "field path"), V = s(() => P.value?.addLabel ?? "Add field"), H = s(() => {
			let e = P.value?.pickerRootPathKey;
			if (!e) return;
			let t = k.config?.[e];
			if (typeof t != "string") return;
			let n = t.trim();
			return n.length > 0 ? n : void 0;
		});
		function U() {
			return P.value?.testId ?? `${k.fieldKey}-field-list`;
		}
		function W(e, t) {
			return `${k.fieldKey}-field-list-row-${e}-${t}`;
		}
		function G(e) {
			if (k.disabled) return;
			let t = e.map((e) => e.value).filter((e) => e.trim().length > 0);
			if (t.length === 0) {
				M.value = e;
				return;
			}
			M.value = e.filter((e) => e.value.trim().length === 0), A("update:modelValue", [...F.value, ...t]);
		}
		function K(e, t) {
			if (!k.disabled) {
				if (e.source === "draft") {
					G(M.value.map((n, r) => r === e.sourceIndex ? {
						...n,
						value: t,
						touched: n.touched || t.trim().length === 0
					} : n));
					return;
				}
				A("update:modelValue", F.value.map((n, r) => r === e.sourceIndex ? t : n));
			}
		}
		function q(e) {
			if (!k.disabled) {
				if (e.source === "draft") {
					M.value = M.value.filter((t, n) => n !== e.sourceIndex);
					return;
				}
				A("update:modelValue", F.value.filter((t, n) => n !== e.sourceIndex));
			}
		}
		function J(e) {
			k.disabled || e.source === "draft" && (M.value = M.value.map((t, n) => n === e.sourceIndex ? {
				...t,
				touched: !0
			} : t));
		}
		function Y() {
			k.disabled || (M.value = [...M.value, {
				id: N++,
				value: "",
				touched: !1
			}]);
		}
		return b(() => JSON.stringify(F.value), () => {
			M.value = [];
		}), (a, s) => (m(), u("fieldset", {
			class: "flex flex-col gap-2",
			"data-field": p.fieldKey,
			"data-testid": U()
		}, [
			p.hideLabel ? l("", !0) : (m(), u("div", C, [f(y(r), { class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground" }, {
				default: x(() => [d(v(p.descriptor.meta.label), 1)]),
				_: 1
			}), f(y(e), {
				variant: "outline",
				class: "text-[10px]"
			}, {
				default: x(() => [d(v(I.value.length) + " " + v(I.value.length === 1 ? "field" : "fields"), 1)]),
				_: 1
			})])),
			!p.hideLabel && p.descriptor.meta.helpText ? (m(), u("p", w, v(p.descriptor.meta.helpText), 1)) : l("", !0),
			I.value.length === 0 ? (m(), u("p", {
				key: 2,
				class: "rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70",
				"data-testid": `${p.fieldKey}-field-list-empty`
			}, " No fields yet. Add at least one field to include. ", 8, T)) : l("", !0),
			(m(!0), u(o, null, g(I.value, (e, r) => (m(), u("div", {
				key: e.key,
				class: "flex items-center gap-1",
				"data-testid": W(r, "row"),
				"data-row-index": r,
				"data-row-invalid": R(e) ? "true" : void 0
			}, [
				f(y(n), {
					"model-value": e.value,
					placeholder: B.value,
					"aria-label": `${p.descriptor.meta.label} row ${r + 1}`,
					"aria-invalid": R(e) || void 0,
					class: "h-8 flex-1 font-code text-xs",
					"data-testid": W(r, "input"),
					disabled: p.disabled,
					"onUpdate:modelValue": (t) => K(e, String(t)),
					onBlur: (t) => J(e)
				}, null, 8, [
					"model-value",
					"placeholder",
					"aria-label",
					"aria-invalid",
					"data-testid",
					"disabled",
					"onUpdate:modelValue",
					"onBlur"
				]),
				j.value ? (m(), c(_(j.value), {
					key: 0,
					"model-value": e.value,
					"field-label": p.descriptor.meta.label,
					mode: "literal",
					"output-format": "relative",
					"instance-id": p.instanceId,
					inputs: p.inputs,
					"root-path": H.value,
					"data-testid": W(r, "picker"),
					disabled: p.disabled,
					"aria-disabled": p.disabled || void 0,
					"onUpdate:modelValue": (t) => K(e, t)
				}, null, 8, [
					"model-value",
					"field-label",
					"instance-id",
					"inputs",
					"root-path",
					"data-testid",
					"disabled",
					"aria-disabled",
					"onUpdate:modelValue"
				])) : l("", !0),
				f(y(t), {
					variant: "ghost",
					size: "icon-xs",
					type: "button",
					"aria-label": `Remove ${p.descriptor.meta.label} row ${r + 1}`,
					"data-testid": W(r, "remove"),
					disabled: p.disabled,
					onClick: (t) => q(e)
				}, {
					default: x(() => [f(y(i), {
						icon: "lucide:x",
						class: "size-3"
					})]),
					_: 1
				}, 8, [
					"aria-label",
					"data-testid",
					"disabled",
					"onClick"
				])
			], 8, E))), 128)),
			f(y(t), {
				variant: "outline",
				size: "sm",
				type: "button",
				class: "w-full",
				"data-testid": `${p.fieldKey}-field-list-add`,
				disabled: p.disabled,
				onClick: Y
			}, {
				default: x(() => [f(y(i), {
					icon: "lucide:plus",
					class: "size-3.5",
					"data-icon": "inline-start"
				}), d(" " + v(V.value), 1)]),
				_: 1
			}, 8, ["data-testid", "disabled"]),
			z.value ? (m(), u("p", {
				key: 3,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": `${p.fieldKey}-field-list-validation-empty`
			}, " Field path must not be empty. ", 8, D)) : l("", !0)
		], 8, S));
	}
});
//#endregion
export { O as default };
