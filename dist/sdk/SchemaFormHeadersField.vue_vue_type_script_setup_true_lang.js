import { createUuid as e } from "./create-uuid.js";
import t from "./component-ui/badge/Badge.js";
import n from "./component-ui/button/Button.js";
import r from "./component-ui/input/Input.js";
import i from "./component-ui/switch/Switch.js";
import a from "./component-ui/label/Label.js";
import { Icon as o } from "./component-ui-primitives.js";
import { Fragment as s, computed as c, createCommentVNode as l, createElementBlock as u, createElementVNode as d, createTextVNode as f, createVNode as p, defineComponent as m, normalizeClass as h, openBlock as g, renderList as _, toDisplayString as v, unref as y, withCtx as b } from "vue";
//#region src/sdk/SchemaFormHeadersField.vue?vue&type=script&setup=true&lang.ts
var x = ["data-field", "data-testid"], S = {
	key: 0,
	class: "flex items-center justify-between gap-2"
}, C = {
	key: 1,
	class: "text-xs text-muted-foreground/70"
}, w = ["data-testid"], T = [
	"data-testid",
	"data-row-id",
	"data-row-enabled",
	"data-row-invalid"
], E = { class: "flex flex-1 flex-col gap-1.5 sm:flex-row" }, D = { class: "flex shrink-0 items-center gap-1 pt-0.5" }, O = ["data-testid"], k = ["data-testid"], A = /* @__PURE__ */ m({
	__name: "SchemaFormHeadersField",
	props: {
		fieldKey: {},
		label: {},
		helpText: {},
		modelValue: {},
		keyPlaceholder: { default: "Header name" },
		valuePlaceholder: { default: "Header value" },
		addLabel: { default: "Add header" },
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
	setup(m, { emit: A }) {
		let j = m, M = A, N = c(() => j.modelValue ?? []), P = c(() => {
			let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
			for (let e of N.value) {
				if (!e.enabled) continue;
				let n = e.key.trim();
				if (n.length === 0) continue;
				let r = n.toLowerCase();
				t.set(r, (t.get(r) ?? 0) + 1);
			}
			for (let n of N.value) {
				let r = n.key.trim(), i = r.toLowerCase();
				e.set(n.id, {
					emptyKey: n.enabled && r.length === 0,
					duplicateKey: n.enabled && r.length > 0 && (t.get(i) ?? 0) > 1
				});
			}
			return e;
		}), F = c(() => Array.from(P.value.values()).some((e) => e.emptyKey)), I = c(() => Array.from(P.value.values()).some((e) => e.duplicateKey)), L = c(() => (j.addLabel?.toLowerCase() ?? "").includes("query parameter") ? "No query parameters yet. Add one to append a custom URL parameter." : "No headers yet. Add one to send a custom request header.");
		function R(e) {
			return P.value.get(e) ?? {
				emptyKey: !1,
				duplicateKey: !1
			};
		}
		function z(e, t) {
			j.disabled || M("update:modelValue", N.value.map((n) => n.id === e ? {
				...n,
				...t
			} : n));
		}
		function B(e) {
			j.disabled || M("update:modelValue", N.value.filter((t) => t.id !== e));
		}
		function V() {
			if (j.disabled) return;
			let t = {
				id: e(),
				key: "",
				value: "",
				enabled: !0
			};
			M("update:modelValue", [...N.value, t]);
		}
		function H(e) {
			return (t) => `${j.fieldKey}-headers-row-${t}-${e}`;
		}
		let U = H("key"), W = H("value"), G = H("enabled"), K = H("remove"), q = H("row");
		function J() {
			return j.testId ?? `${j.fieldKey}-headers`;
		}
		function Y() {
			return `${j.fieldKey}-headers-empty`;
		}
		function X() {
			return `${j.fieldKey}-headers-add`;
		}
		function Z() {
			return `${j.fieldKey}-headers-validation-empty`;
		}
		function Q() {
			return `${j.fieldKey}-headers-validation-duplicate`;
		}
		return (e, c) => (g(), u("fieldset", {
			class: "flex flex-col gap-2",
			"data-field": m.fieldKey,
			"data-testid": J()
		}, [
			m.hideLabel ? l("", !0) : (g(), u("div", S, [p(y(a), {
				for: `${m.fieldKey}-headers`,
				class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			}, {
				default: b(() => [f(v(m.label), 1)]),
				_: 1
			}, 8, ["for"]), p(y(t), {
				variant: "outline",
				class: "text-[10px]"
			}, {
				default: b(() => [f(v(N.value.length) + " " + v(N.value.length === 1 ? "row" : "rows"), 1)]),
				_: 1
			})])),
			m.helpText ? (g(), u("p", C, v(m.helpText), 1)) : l("", !0),
			N.value.length === 0 ? (g(), u("p", {
				key: 2,
				class: "rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70",
				"data-testid": Y()
			}, v(L.value), 9, w)) : l("", !0),
			(g(!0), u(s, null, _(N.value, (e) => (g(), u("div", {
				key: e.id,
				class: h(["flex items-start gap-2 rounded-md border border-border/40 bg-muted/20 p-2", { "opacity-60": !e.enabled }]),
				"data-testid": y(q)(e.id),
				"data-row-id": e.id,
				"data-row-enabled": e.enabled ? "true" : "false",
				"data-row-invalid": R(e.id).emptyKey || R(e.id).duplicateKey ? "true" : void 0
			}, [d("div", E, [p(y(r), {
				"model-value": e.key,
				disabled: m.disabled || !e.enabled,
				placeholder: m.keyPlaceholder,
				"aria-label": `Header name for row ${e.id}`,
				"aria-invalid": R(e.id).emptyKey || R(e.id).duplicateKey || void 0,
				class: "h-8 flex-1 font-code text-xs",
				"data-testid": y(U)(e.id),
				"onUpdate:modelValue": (t) => z(e.id, { key: String(t) })
			}, null, 8, [
				"model-value",
				"disabled",
				"placeholder",
				"aria-label",
				"aria-invalid",
				"data-testid",
				"onUpdate:modelValue"
			]), p(y(r), {
				"model-value": e.value,
				disabled: m.disabled || !e.enabled,
				placeholder: m.valuePlaceholder,
				"aria-label": `Header value for row ${e.id}`,
				class: "h-8 flex-1 font-code text-xs",
				"data-testid": y(W)(e.id),
				"onUpdate:modelValue": (t) => z(e.id, { value: String(t) })
			}, null, 8, [
				"model-value",
				"disabled",
				"placeholder",
				"aria-label",
				"data-testid",
				"onUpdate:modelValue"
			])]), d("div", D, [p(y(i), {
				"model-value": e.enabled,
				disabled: m.disabled,
				"aria-label": `Toggle row ${e.id}`,
				"data-testid": y(G)(e.id),
				"onUpdate:modelValue": (t) => z(e.id, { enabled: t })
			}, null, 8, [
				"model-value",
				"disabled",
				"aria-label",
				"data-testid",
				"onUpdate:modelValue"
			]), p(y(n), {
				variant: "ghost",
				size: "icon-xs",
				type: "button",
				"aria-label": `Remove header row ${e.id}`,
				"data-testid": y(K)(e.id),
				disabled: m.disabled,
				onClick: (t) => B(e.id)
			}, {
				default: b(() => [p(y(o), {
					icon: "lucide:x",
					class: "size-3"
				})]),
				_: 1
			}, 8, [
				"aria-label",
				"data-testid",
				"disabled",
				"onClick"
			])])], 10, T))), 128)),
			p(y(n), {
				variant: "outline",
				size: "sm",
				type: "button",
				class: "w-full",
				"data-testid": X(),
				disabled: m.disabled,
				onClick: V
			}, {
				default: b(() => [p(y(o), {
					icon: "lucide:plus",
					class: "size-3.5",
					"data-icon": "inline-start"
				}), f(" " + v(m.addLabel), 1)]),
				_: 1
			}, 8, ["data-testid", "disabled"]),
			F.value ? (g(), u("p", {
				key: 3,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": Z()
			}, " Enabled headers must have a name. ", 8, O)) : l("", !0),
			I.value ? (g(), u("p", {
				key: 4,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": Q()
			}, " Enabled headers must have unique names. ", 8, k)) : l("", !0)
		], 8, x));
	}
});
//#endregion
export { A as default };
