import { colorRoleSwatchClass as e, componentThemePropertyGroupLabels as t, deriveThemePropertyGroupsFromKeys as n, describeThemePropertyKey as r, listThemePropertyKeysForGroups as i } from "./theme-role-labels.js";
import a from "./component-ui/label/Label.js";
import o from "./component-ui/select/Select.js";
import s from "./component-ui/select/SelectContent.js";
import c from "./component-ui/select/SelectGroup.js";
import l from "./component-ui/select/SelectItem.js";
import u from "./component-ui/select/SelectLabel.js";
import d from "./component-ui/select/SelectSeparator.js";
import f from "./component-ui/select/SelectTrigger.js";
import p from "./component-ui/select/SelectValue.js";
import { Icon as m } from "./component-ui-primitives.js";
import { Fragment as h, computed as g, createBlock as _, createCommentVNode as v, createElementBlock as y, createElementVNode as b, createTextVNode as x, createVNode as S, defineComponent as C, normalizeClass as w, openBlock as T, renderList as E, toDisplayString as D, unref as O, watch as k, withCtx as A } from "vue";
//#region src/sdk/SchemaFormThemeRoleControl.vue?vue&type=script&setup=true&lang.ts
var j = ["data-field"], M = { class: "flex min-w-0 items-center gap-2" }, N = { class: "flex min-w-0 items-center gap-2" }, P = { class: "italic text-muted-foreground" }, F = { class: "flex min-w-0 items-center gap-2" }, I = { class: "truncate" }, ee = ["data-testid"], te = ["data-testid"], L = ["data-testid"], R = "__inherit__", z = /* @__PURE__ */ C({
	__name: "SchemaFormThemeRoleControl",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		themeContext: { default: void 0 },
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
	emits: ["update:value", "update:invalid"],
	setup(C, { emit: z }) {
		let B = ["color"], V = C, H = z, U = g(() => {
			let e = V.descriptor.meta.control;
			if (e.kind !== "theme-role") return {
				groups: B,
				allowedKeys: i(B),
				allowUnset: !0,
				unsetLabel: "Inherit from theme",
				disabled: !1
			};
			let t = e.groups && e.groups.length > 0 ? e.groups : B, r = e.allowedKeys !== void 0, a = r ? [...e.allowedKeys] : i(t);
			return {
				groups: r ? n(a) : t,
				allowedKeys: a,
				allowUnset: e.allowUnset !== !1,
				unsetLabel: e.unsetLabel ?? "Inherit from theme",
				disabled: e.disabled === !0,
				...e.testId ? { testId: e.testId } : {}
			};
		}), W = g(() => V.disabled || U.value.disabled), G = g(() => typeof V.value == "string" ? V.value : ""), K = g(() => G.value === ""), q = g(() => !K.value && !U.value.allowedKeys.includes(G.value)), J = g(() => !!(q.value || K.value && !U.value.allowUnset));
		k(J, (e) => {
			H("update:invalid", e);
		}, { immediate: !0 });
		let Y = g(() => U.value.groups.map((n) => {
			let i = U.value.allowedKeys.filter((e) => e.startsWith(`${n}.`)).map((t) => {
				let { roleLabel: n } = r(t), i = V.themeContext ? e(t) : void 0, a = {
					key: t,
					label: n
				};
				return i && (a.swatchClass = i), a;
			});
			return {
				group: n,
				label: t[n],
				options: i
			};
		}).filter((e) => e.options.length > 0)), X = g(() => K.value ? R : G.value);
		function Z(e) {
			if (W.value) return;
			let t = typeof e == "string" ? e : "";
			if (t === R) {
				G.value !== "" && H("update:value", "");
				return;
			}
			t !== "" && t !== G.value && H("update:value", t);
		}
		let ne = g(() => {
			if (K.value) return U.value.unsetLabel;
			if (q.value) return G.value;
			let { roleLabel: e } = r(G.value);
			return e;
		}), Q = g(() => {
			if (!(K.value || q.value) && V.themeContext) return e(G.value);
		}), re = g(() => U.value.testId), $ = g(() => `${V.fieldKey}-theme-role-validation-hint`), ie = g(() => `${V.fieldKey}-theme-role-help-text`), ae = g(() => K.value ? "inherit" : q.value ? "unknown" : "role"), oe = g(() => !!V.descriptor.meta.helpText && !J.value);
		return (e, t) => (T(), y("div", {
			class: "flex flex-col gap-1.5",
			"data-field": C.fieldKey
		}, [
			C.hideLabel ? v("", !0) : (T(), _(O(a), {
				key: 0,
				for: C.inputId,
				class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			}, {
				default: A(() => [x(D(C.descriptor.meta.label), 1)]),
				_: 1
			}, 8, ["for"])),
			S(O(o), {
				"model-value": X.value,
				disabled: W.value,
				"onUpdate:modelValue": t[0] ||= (e) => Z(e)
			}, {
				default: A(() => [S(O(f), {
					id: C.inputId,
					class: "h-8 w-full min-w-0 max-w-full text-sm",
					"aria-label": C.descriptor.meta.label,
					"aria-invalid": J.value || void 0,
					"data-testid": re.value,
					"data-theme-role-state": ae.value
				}, {
					default: A(() => [b("span", M, [Q.value ? (T(), y("span", {
						key: 0,
						"aria-hidden": "true",
						class: w(["size-3.5 shrink-0 rounded-sm border border-border/60", Q.value])
					}, null, 2)) : K.value ? (T(), _(O(m), {
						key: 1,
						"aria-hidden": "true",
						class: "size-3.5 shrink-0 text-muted-foreground",
						icon: "lucide:circle-dashed"
					})) : v("", !0), S(O(p), null, {
						default: A(() => [b("span", { class: w(["truncate", { "italic text-muted-foreground": K.value }]) }, D(ne.value), 3)]),
						_: 1
					})])]),
					_: 1
				}, 8, [
					"id",
					"aria-label",
					"aria-invalid",
					"data-testid",
					"data-theme-role-state"
				]), S(O(s), null, {
					default: A(() => [U.value.allowUnset ? (T(), y(h, { key: 0 }, [S(O(c), null, {
						default: A(() => [S(O(l), {
							value: R,
							"data-testid": `${C.fieldKey}-theme-role-option-inherit`
						}, {
							default: A(() => [b("span", N, [S(O(m), {
								"aria-hidden": "true",
								class: "size-3.5 shrink-0 text-muted-foreground",
								icon: "lucide:circle-dashed"
							}), b("span", P, D(U.value.unsetLabel), 1)])]),
							_: 1
						}, 8, ["data-testid"])]),
						_: 1
					}), Y.value.length > 0 ? (T(), _(O(d), { key: 0 })) : v("", !0)], 64)) : v("", !0), (T(!0), y(h, null, E(Y.value, (e) => (T(), _(O(c), {
						key: e.group,
						"data-testid": `${C.fieldKey}-theme-role-group-${e.group}`
					}, {
						default: A(() => [Y.value.length > 1 ? (T(), _(O(u), { key: 0 }, {
							default: A(() => [x(D(e.label), 1)]),
							_: 2
						}, 1024)) : v("", !0), (T(!0), y(h, null, E(e.options, (e) => (T(), _(O(l), {
							key: e.key,
							value: e.key,
							"data-testid": `${C.fieldKey}-theme-role-option-${e.key}`
						}, {
							default: A(() => [b("span", F, [e.swatchClass ? (T(), y("span", {
								key: 0,
								"aria-hidden": "true",
								class: w(["size-3.5 shrink-0 rounded-sm border border-border/60", e.swatchClass])
							}, null, 2)) : v("", !0), b("span", I, D(e.label), 1)])]),
							_: 2
						}, 1032, ["value", "data-testid"]))), 128))]),
						_: 2
					}, 1032, ["data-testid"]))), 128))]),
					_: 1
				})]),
				_: 1
			}, 8, ["model-value", "disabled"]),
			q.value ? (T(), y("p", {
				key: 1,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": $.value
			}, D("Unknown theme role: " + G.value), 9, ee)) : K.value && !U.value.allowUnset ? (T(), y("p", {
				key: 2,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": $.value
			}, " Pick a theme role to apply. ", 8, te)) : oe.value ? (T(), y("p", {
				key: 3,
				class: "text-xs leading-relaxed text-muted-foreground/80",
				"data-testid": ie.value
			}, D(C.descriptor.meta.helpText), 9, L)) : v("", !0)
		], 8, j));
	}
});
//#endregion
export { z as default };
