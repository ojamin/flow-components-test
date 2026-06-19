import e from "./component-ui/label/Label.js";
import t from "./component-ui/select/Select.js";
import n from "./component-ui/select/SelectContent.js";
import r from "./component-ui/select/SelectGroup.js";
import i from "./component-ui/select/SelectItem.js";
import a from "./component-ui/select/SelectSeparator.js";
import o from "./component-ui/select/SelectTrigger.js";
import s from "./component-ui/select/SelectValue.js";
import { Icon as c } from "./component-ui-primitives.js";
import { Fragment as l, computed as u, createBlock as d, createCommentVNode as f, createElementBlock as p, createElementVNode as m, createTextVNode as h, createVNode as g, defineComponent as _, normalizeClass as v, openBlock as y, renderList as b, toDisplayString as x, unref as S, withCtx as C } from "vue";
//#region src/sdk/SchemaFormViewSelectField.vue?vue&type=script&setup=true&lang.ts
var w = ["data-field"], T = { class: "flex min-w-0 items-center gap-2" }, E = { class: "flex min-w-0 items-center gap-2" }, D = { class: "italic text-muted-foreground" }, O = { class: "flex min-w-0 items-center gap-2" }, k = {
	key: 0,
	class: "ml-auto shrink-0 text-xs uppercase tracking-wider text-muted-foreground/80"
}, A = ["data-testid"], j = ["data-testid"], M = "__auto__", N = "Auto (first enabled view)", P = /* @__PURE__ */ _({
	__name: "SchemaFormViewSelectField",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		config: { default: void 0 },
		inputId: { default: void 0 },
		hideLabel: {
			type: Boolean,
			default: !1
		},
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:value"],
	setup(_, { emit: P }) {
		let F = _, I = P, L = u(() => {
			let e = F.descriptor.meta.control;
			return e.kind === "view-select" ? {
				viewsParamKey: e.viewsParamKey,
				autoLabel: e.autoLabel ?? N,
				invalidLabel: e.invalidLabel ?? "View not found",
				...e.placeholder ? { placeholder: e.placeholder } : {},
				...e.testId ? { testId: e.testId } : {}
			} : {
				viewsParamKey: "",
				autoLabel: N,
				invalidLabel: "View not found"
			};
		}), R = u(() => {
			if (!L.value.viewsParamKey) return [];
			let e = F.config?.[L.value.viewsParamKey];
			if (!Array.isArray(e)) return [];
			let t = /* @__PURE__ */ new Set(), n = [];
			for (let r of e) {
				if (typeof r != "object" || !r || Array.isArray(r)) continue;
				let e = r, i = typeof e.id == "string" ? e.id.trim() : "", a = typeof e.label == "string" ? e.label.trim() : "";
				!i || !a || t.has(i) || (t.add(i), n.push({
					id: i,
					label: a,
					disabled: e.disabled === !0
				}));
			}
			return n;
		}), z = u(() => {
			let e = F.value;
			return typeof e == "string" ? e.trim() : "";
		}), B = u(() => z.value === ""), V = u(() => B.value ? void 0 : R.value.find((e) => e.id === z.value)), H = u(() => !B.value && V.value === void 0), U = u(() => B.value ? M : z.value);
		function W(e) {
			if (F.disabled === !0) return;
			let t = typeof e == "string" ? e : "";
			if (t === M) {
				B.value || I("update:value", void 0);
				return;
			}
			t !== "" && t !== z.value && I("update:value", t);
		}
		let G = u(() => B.value ? L.value.autoLabel : V.value ? V.value.label : z.value), K = u(() => B.value ? "auto" : H.value ? "unknown" : "view"), q = u(() => `${F.fieldKey}-view-select-validation-hint`), J = u(() => `${F.fieldKey}-view-select-help-text`);
		function Y(e) {
			return `${F.fieldKey}-view-select-option-${e}`;
		}
		let X = u(() => !!F.descriptor.meta.helpText && !H.value);
		return (u, N) => (y(), p("div", {
			class: "flex flex-col gap-1.5",
			"data-field": _.fieldKey
		}, [
			_.hideLabel ? f("", !0) : (y(), d(S(e), {
				key: 0,
				for: _.inputId,
				class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			}, {
				default: C(() => [h(x(_.descriptor.meta.label), 1)]),
				_: 1
			}, 8, ["for"])),
			g(S(t), {
				"model-value": U.value,
				disabled: _.disabled,
				"onUpdate:modelValue": N[0] ||= (e) => W(e)
			}, {
				default: C(() => [g(S(o), {
					id: _.inputId,
					class: "h-8 w-full min-w-0 max-w-full text-sm",
					"aria-label": _.descriptor.meta.label,
					"aria-invalid": H.value || void 0,
					"data-testid": L.value.testId,
					"data-view-select-state": K.value,
					disabled: _.disabled
				}, {
					default: C(() => [m("span", T, [B.value ? (y(), d(S(c), {
						key: 0,
						"aria-hidden": "true",
						class: "size-3.5 shrink-0 text-muted-foreground",
						icon: "lucide:circle-dashed"
					})) : f("", !0), g(S(s), { placeholder: L.value.placeholder }, {
						default: C(() => [m("span", { class: v(["truncate", { "italic text-muted-foreground": B.value }]) }, x(G.value), 3)]),
						_: 1
					}, 8, ["placeholder"])])]),
					_: 1
				}, 8, [
					"id",
					"aria-label",
					"aria-invalid",
					"data-testid",
					"data-view-select-state",
					"disabled"
				]), g(S(n), null, {
					default: C(() => [g(S(r), null, {
						default: C(() => [g(S(i), {
							value: M,
							"data-testid": `${_.fieldKey}-view-select-option-auto`
						}, {
							default: C(() => [m("span", E, [g(S(c), {
								"aria-hidden": "true",
								class: "size-3.5 shrink-0 text-muted-foreground",
								icon: "lucide:circle-dashed"
							}), m("span", D, x(L.value.autoLabel), 1)])]),
							_: 1
						}, 8, ["data-testid"])]),
						_: 1
					}), R.value.length > 0 ? (y(), p(l, { key: 0 }, [g(S(a)), g(S(r), null, {
						default: C(() => [(y(!0), p(l, null, b(R.value, (e) => (y(), d(S(i), {
							key: e.id,
							value: e.id,
							"data-testid": Y(e.id),
							"data-view-select-disabled": e.disabled ? "true" : "false"
						}, {
							default: C(() => [m("span", O, [m("span", { class: v(["truncate", { "text-muted-foreground": e.disabled }]) }, x(e.label), 3), e.disabled ? (y(), p("span", k, " Disabled ")) : f("", !0)])]),
							_: 2
						}, 1032, [
							"value",
							"data-testid",
							"data-view-select-disabled"
						]))), 128))]),
						_: 1
					})], 64)) : f("", !0)]),
					_: 1
				})]),
				_: 1
			}, 8, ["model-value", "disabled"]),
			H.value ? (y(), p("p", {
				key: 1,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": q.value
			}, x(L.value.invalidLabel) + " — select another option or choose Auto. Stored value: " + x(z.value) + ". ", 9, A)) : X.value ? (y(), p("p", {
				key: 2,
				class: "text-xs text-muted-foreground/80",
				"data-testid": J.value
			}, x(_.descriptor.meta.helpText), 9, j)) : f("", !0)
		], 8, w));
	}
});
//#endregion
export { P as default };
