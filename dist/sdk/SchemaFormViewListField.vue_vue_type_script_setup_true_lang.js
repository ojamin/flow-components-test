import { createViewContainerItem as e, deleteViewContainerItem as t, renameViewContainerItem as n, reorderViewContainerItems as r, setViewContainerItemDisabled as i, setViewContainerItemHashSlug as a } from "../shared/view-container/index.js";
import o from "./component-ui/badge/Badge.js";
import s from "./component-ui/button/Button.js";
import c from "./component-ui/input/Input.js";
import l from "./component-ui/switch/Switch.js";
import u from "./component-ui/label/Label.js";
import { Icon as d } from "./component-ui-primitives.js";
import { Fragment as f, computed as p, createCommentVNode as m, createElementBlock as h, createElementVNode as g, createTextVNode as _, createVNode as v, defineComponent as y, normalizeClass as b, openBlock as x, reactive as S, renderList as C, toDisplayString as w, unref as T, withCtx as E } from "vue";
//#region src/sdk/SchemaFormViewListField.vue?vue&type=script&setup=true&lang.ts
var D = ["data-field", "data-testid"], O = {
	key: 0,
	class: "flex items-center justify-between gap-2"
}, k = {
	key: 1,
	class: "text-xs text-muted-foreground/70"
}, A = ["data-testid"], j = [
	"data-testid",
	"data-row-id",
	"data-row-disabled"
], M = { class: "flex items-center gap-1.5" }, N = ["data-testid"], P = { class: "flex flex-col gap-1" }, F = { class: "flex items-center justify-between gap-2" }, I = /* @__PURE__ */ y({
	__name: "SchemaFormViewListField",
	props: {
		fieldKey: {},
		label: {},
		helpText: {},
		modelValue: {},
		addLabel: { default: "Add view" },
		hashSlugPlaceholder: { default: "url-slug" },
		testId: {},
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
	setup(y, { emit: I }) {
		let L = y, R = I, z = S({}), B = p(() => L.modelValue ?? []);
		function V(e) {
			return !!z[e];
		}
		function H(e) {
			L.disabled || (z[e] = !z[e]);
		}
		function U(e) {
			L.disabled || e !== B.value && R("update:modelValue", [...e]);
		}
		function W() {
			if (L.disabled) return;
			let t = e({ label: `View ${B.value.length + 1}` });
			R("update:modelValue", [...B.value, t]);
		}
		function G(e) {
			if (L.disabled) return;
			let t = B.value.findIndex((t) => t.id === e);
			t <= 0 || U(r(B.value, e, t - 1));
		}
		function K(e) {
			if (L.disabled) return;
			let t = B.value.findIndex((t) => t.id === e);
			t < 0 || t >= B.value.length - 1 || U(r(B.value, e, t + 1));
		}
		function q(e, t) {
			L.disabled || U(n(B.value, e, t));
		}
		function J(e, t) {
			L.disabled || U(a(B.value, e, t));
		}
		function Y(e, t) {
			L.disabled || U(i(B.value, e, t));
		}
		function X(e) {
			L.disabled || U(t(B.value, e));
		}
		function Z() {
			return L.testId ?? `${L.fieldKey}-view-list`;
		}
		function Q(e, t) {
			return `${L.fieldKey}-view-list-row-${e}-${t}`;
		}
		function $() {
			return `${L.fieldKey}-view-list-empty`;
		}
		function ee() {
			return `${L.fieldKey}-view-list-add`;
		}
		return (e, t) => (x(), h("fieldset", {
			class: "flex flex-col gap-2",
			"data-field": y.fieldKey,
			"data-testid": Z()
		}, [
			y.hideLabel ? m("", !0) : (x(), h("div", O, [v(T(u), { class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground" }, {
				default: E(() => [_(w(y.label), 1)]),
				_: 1
			}), v(T(o), {
				variant: "outline",
				class: "text-[10px]"
			}, {
				default: E(() => [_(w(B.value.length) + " " + w(B.value.length === 1 ? "view" : "views"), 1)]),
				_: 1
			})])),
			y.helpText ? (x(), h("p", k, w(y.helpText), 1)) : m("", !0),
			B.value.length === 0 ? (x(), h("p", {
				key: 2,
				class: "rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70",
				"data-testid": $()
			}, " No views. Add one. ", 8, A)) : m("", !0),
			(x(!0), h(f, null, C(B.value, (e, n) => (x(), h("div", {
				key: e.id,
				class: b(["flex flex-col gap-2 rounded-md border border-border/40 bg-muted/20 p-2", { "opacity-60": e.disabled }]),
				"data-testid": Q(e.id, "row"),
				"data-row-id": e.id,
				"data-row-disabled": e.disabled ? "true" : "false"
			}, [g("div", M, [
				v(T(s), {
					variant: "ghost",
					size: "icon-xs",
					type: "button",
					disabled: y.disabled || n === 0,
					"aria-label": `Move ${e.label} up`,
					"data-testid": Q(e.id, "move-up"),
					onClick: (t) => G(e.id)
				}, {
					default: E(() => [v(T(d), {
						icon: "lucide:chevron-up",
						class: "size-3"
					})]),
					_: 1
				}, 8, [
					"disabled",
					"aria-label",
					"data-testid",
					"onClick"
				]),
				v(T(s), {
					variant: "ghost",
					size: "icon-xs",
					type: "button",
					disabled: y.disabled || n === B.value.length - 1,
					"aria-label": `Move ${e.label} down`,
					"data-testid": Q(e.id, "move-down"),
					onClick: (t) => K(e.id)
				}, {
					default: E(() => [v(T(d), {
						icon: "lucide:chevron-down",
						class: "size-3"
					})]),
					_: 1
				}, 8, [
					"disabled",
					"aria-label",
					"data-testid",
					"onClick"
				]),
				v(T(c), {
					"model-value": e.label,
					"aria-label": `View label for ${e.label}`,
					class: "h-8 flex-1 text-xs",
					"data-testid": Q(e.id, "label"),
					disabled: y.disabled,
					"onUpdate:modelValue": (t) => q(e.id, String(t))
				}, null, 8, [
					"model-value",
					"aria-label",
					"data-testid",
					"disabled",
					"onUpdate:modelValue"
				]),
				v(T(s), {
					variant: "ghost",
					size: "icon-xs",
					type: "button",
					"aria-label": `${V(e.id) ? "Close" : "Edit"} ${e.label} details`,
					"aria-expanded": V(e.id),
					"data-testid": Q(e.id, "toggle-details"),
					disabled: y.disabled,
					onClick: (t) => H(e.id)
				}, {
					default: E(() => [v(T(d), {
						icon: V(e.id) ? "lucide:chevron-up" : "lucide:settings-2",
						class: "size-3"
					}, null, 8, ["icon"])]),
					_: 2
				}, 1032, [
					"aria-label",
					"aria-expanded",
					"data-testid",
					"disabled",
					"onClick"
				]),
				v(T(s), {
					variant: "ghost",
					size: "icon-xs",
					type: "button",
					"aria-label": `Delete view ${e.label}`,
					"data-testid": Q(e.id, "delete"),
					disabled: y.disabled,
					onClick: (t) => X(e.id)
				}, {
					default: E(() => [v(T(d), {
						icon: "lucide:trash-2",
						class: "size-3"
					})]),
					_: 1
				}, 8, [
					"aria-label",
					"data-testid",
					"disabled",
					"onClick"
				])
			]), V(e.id) ? (x(), h("div", {
				key: 0,
				class: "flex flex-col gap-2 border-t border-border/40 pt-2",
				"data-testid": Q(e.id, "details")
			}, [g("div", P, [v(T(u), {
				class: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				for: `${y.fieldKey}-view-list-${e.id}-hash`
			}, {
				default: E(() => [...t[0] ||= [_(" Hash slug ", -1)]]),
				_: 1
			}, 8, ["for"]), v(T(c), {
				id: `${y.fieldKey}-view-list-${e.id}-hash`,
				"model-value": e.hashSlug ?? "",
				placeholder: y.hashSlugPlaceholder,
				"aria-label": `Hash slug for ${e.label}`,
				class: "h-8 font-code text-xs",
				"data-testid": Q(e.id, "hash-slug"),
				disabled: y.disabled,
				"onUpdate:modelValue": (t) => J(e.id, String(t))
			}, null, 8, [
				"id",
				"model-value",
				"placeholder",
				"aria-label",
				"data-testid",
				"disabled",
				"onUpdate:modelValue"
			])]), g("div", F, [v(T(u), {
				class: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				for: `${y.fieldKey}-view-list-${e.id}-disabled`
			}, {
				default: E(() => [...t[1] ||= [_(" Disabled ", -1)]]),
				_: 1
			}, 8, ["for"]), v(T(l), {
				id: `${y.fieldKey}-view-list-${e.id}-disabled`,
				"model-value": !!e.disabled,
				"aria-label": `Disable view ${e.label}`,
				"data-testid": Q(e.id, "disabled"),
				disabled: y.disabled,
				"onUpdate:modelValue": (t) => Y(e.id, t)
			}, null, 8, [
				"id",
				"model-value",
				"aria-label",
				"data-testid",
				"disabled",
				"onUpdate:modelValue"
			])])], 8, N)) : m("", !0)], 10, j))), 128)),
			v(T(s), {
				variant: "outline",
				size: "sm",
				type: "button",
				class: "w-full",
				"data-testid": ee(),
				disabled: y.disabled,
				onClick: W
			}, {
				default: E(() => [v(T(d), {
					icon: "lucide:plus",
					class: "size-3.5",
					"data-icon": "inline-start"
				}), _(" " + w(y.addLabel), 1)]),
				_: 1
			}, 8, ["data-testid", "disabled"])
		], 8, D));
	}
});
//#endregion
export { I as default };
