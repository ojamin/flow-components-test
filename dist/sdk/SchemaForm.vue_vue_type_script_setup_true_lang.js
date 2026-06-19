import e from "./component-ui/collapsible/Collapsible.js";
import t from "./component-ui/collapsible/CollapsibleContent.js";
import n from "./component-ui/collapsible/CollapsibleTrigger.js";
import { Icon as r } from "./component-ui-primitives.js";
import i from "./SchemaFormChartAdapterField.js";
import a from "./SchemaFormField.js";
import { evaluateParamInteractivity as o } from "./schema-form-interactivity.js";
import { schemaFormPerformanceDiagnosticsKey as s } from "./schema-form-performance-diagnostics.js";
import { Fragment as c, computed as l, createBlock as u, createCommentVNode as d, createElementBlock as f, createElementVNode as p, createTextVNode as m, createVNode as h, defineComponent as g, inject as _, nextTick as v, normalizeClass as y, openBlock as b, reactive as x, ref as S, renderList as C, toDisplayString as w, unref as T, watch as ee, withCtx as E } from "vue";
//#region src/sdk/SchemaForm.vue?vue&type=script&setup=true&lang.ts
var D = {
	key: 0,
	class: "grid gap-1 rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive",
	"data-testid": "schema-form-interactivity-diagnostics",
	role: "status",
	"aria-live": "polite"
}, O = ["data-testid"], k = { class: "font-code" }, A = {
	key: 1,
	class: "py-2 text-center text-sm text-muted-foreground",
	"data-testid": "schema-form-empty"
}, j = { class: "grid gap-4 pl-3" }, M = /* @__PURE__ */ g({
	__name: "SchemaForm",
	props: {
		params: {},
		config: {},
		paramValues: {},
		inputs: {},
		instanceId: {},
		data: { type: [
			String,
			Number,
			Boolean,
			null,
			Array,
			Object
		] },
		datasetDerivationService: {},
		themeContext: {}
	},
	emits: ["update:config", "update:paramValues"],
	setup(g, { emit: M }) {
		let N = g, P = _(s, (e, t) => t()), F = M, I = l(() => N.inputs ?? []), L = l(() => {
			let e = /* @__PURE__ */ new Map();
			for (let [t, n] of Object.entries(N.params)) e.set(t, o(t, n, N.config));
			return e;
		}), R = l(() => {
			let e = [];
			for (let t of L.value.values()) e.push(...t.diagnostics);
			return e;
		});
		function z(e) {
			return L.value.get(e) ?? {
				hidden: !1,
				disabled: !1,
				diagnostics: []
			};
		}
		let B = l(() => {
			let e = 0;
			return P("schemaForm.fieldPlan", () => {
				let t = Object.entries(N.params).filter(([e]) => L.value.get(e)?.hidden !== !0).map(([e, t]) => ({
					key: e,
					descriptor: t
				}));
				return e = t.length, t;
			}, () => ({ counts: {
				schemaFormFields: e,
				dataPathPickerInputs: I.value.length
			} }));
		}), V = l(() => {
			let e = 0, t = 0;
			return P("schemaForm.renderPlan", () => {
				let n = [], r = /* @__PURE__ */ new Map();
				for (let e of B.value) {
					let t = e.descriptor.meta.group;
					if (!t) {
						n.push({
							kind: "field",
							field: e
						});
						continue;
					}
					let i = r.get(t);
					if (i) {
						i.fields.push(e);
						continue;
					}
					let a = {
						kind: "group",
						name: t,
						fields: [e]
					};
					r.set(t, a), n.push(a);
				}
				return e = r.size, t = n.length, n;
			}, () => ({ counts: {
				schemaFormBlocks: t,
				schemaFormFields: B.value.length,
				schemaFormGroups: e
			} }));
		});
		function H(e, t) {
			return e.kind === "group" ? `group:${e.name}` : `field:${e.field.key}:${t}`;
		}
		function U(e) {
			return `schema-form-group-${e}`;
		}
		function W(e) {
			return `schema-form-group-${e}-header`;
		}
		function G(e) {
			return N.paramValues?.[e];
		}
		function K(e) {
			return L.value.get(e)?.disabled === !0;
		}
		function q(e, t) {
			K(e) || F("update:config", {
				...N.config,
				[e]: t
			});
		}
		function J(e, t) {
			K(e) || F("update:paramValues", {
				...N.paramValues ?? {},
				[e]: t
			});
		}
		function Y(e, t) {
			K(e) || F("update:config", {
				...N.config,
				...t
			});
		}
		function X(e) {
			return e.descriptor.meta.control.kind === "chart-adapter";
		}
		let Z = x({});
		function Q(e) {
			return Z[e] ?? !0;
		}
		function te(e, t) {
			Z[e] = t;
		}
		let $ = S(null);
		function ne(e) {
			let t = [
				"a[href]",
				"button:not([disabled])",
				"input:not([disabled]):not([type=\"hidden\"])",
				"select:not([disabled])",
				"textarea:not([disabled])",
				"[tabindex]:not([tabindex=\"-1\"])",
				"[contenteditable=\"true\"]"
			].join(", ");
			return Array.from(e.querySelectorAll(t));
		}
		function re(e, t) {
			let n = L.value, r = Object.keys(N.params), i = r.indexOf(t), a = ne(e), o = (e, t) => {
				if (!t) return !0;
				let r = n.get(t);
				return r?.hidden !== !0 && r?.disabled !== !0;
			};
			if (i >= 0) for (let e = i + 1; e < r.length; e++) {
				let t = r[e], i = n.get(t);
				if (i?.hidden === !0 || i?.disabled === !0) continue;
				let o = a.find((e) => e.closest("[data-field]")?.getAttribute("data-field") === t);
				if (o) {
					o.focus();
					return;
				}
			}
			let s = a.find((e) => o(e, e.closest("[data-field]")?.getAttribute("data-field") ?? null));
			if (s) {
				s.focus();
				return;
			}
			e.focus();
		}
		return ee(L, (e, t) => {
			if (typeof document > "u" || !t) return;
			let n = $.value;
			if (!n) return;
			let r = document.activeElement;
			if (!(r instanceof HTMLElement) || !n.contains(r)) return;
			let i = r.closest("[data-field]")?.getAttribute("data-field");
			if (!i) return;
			let a = t.get(i), o = e.get(i), s = o?.hidden === !0 && a?.hidden !== !0, c = o?.disabled === !0 && a?.disabled !== !0;
			!s && !c || v().then(() => {
				$.value && re($.value, i);
			});
		}, { flush: "pre" }), (o, s) => (b(), f("div", {
			ref_key: "formRoot",
			ref: $,
			class: "grid gap-4 outline-none",
			"data-testid": "schema-form",
			tabindex: "-1"
		}, [
			R.value.length > 0 ? (b(), f("ul", D, [(b(!0), f(c, null, C(R.value, (e) => (b(), f("li", {
				key: `${e.paramKey}:${e.conditionKind}`,
				"data-testid": `schema-form-interactivity-diagnostic-${e.paramKey}-${e.conditionKind}`
			}, [p("span", k, w(e.paramKey), 1), m(" (" + w(e.conditionKind) + "): " + w(e.message), 1)], 8, O))), 128))])) : d("", !0),
			V.value.length === 0 ? (b(), f("p", A, " No configurable fields. ")) : d("", !0),
			(b(!0), f(c, null, C(V.value, (o, s) => (b(), f(c, { key: H(o, s) }, [o.kind === "field" ? (b(), f(c, { key: 0 }, [X(o.field) ? (b(), u(i, {
				key: 0,
				"field-key": o.field.key,
				descriptor: o.field.descriptor,
				config: N.config,
				data: N.data,
				"dataset-derivation-service": N.datasetDerivationService,
				disabled: z(o.field.key).disabled,
				"disabled-help-text": z(o.field.key).disabledHelpText,
				"onUpdate:configPatch": (e) => Y(o.field.key, e)
			}, null, 8, [
				"field-key",
				"descriptor",
				"config",
				"data",
				"dataset-derivation-service",
				"disabled",
				"disabled-help-text",
				"onUpdate:configPatch"
			])) : (b(), u(a, {
				key: 1,
				"field-key": o.field.key,
				descriptor: o.field.descriptor,
				value: N.config[o.field.key],
				config: N.config,
				"param-value-state": G(o.field.key),
				inputs: I.value,
				"instance-id": N.instanceId,
				"theme-context": N.themeContext,
				disabled: z(o.field.key).disabled,
				"disabled-help-text": z(o.field.key).disabledHelpText,
				"onUpdate:value": (e) => q(o.field.key, e),
				"onUpdate:paramValueState": (e) => J(o.field.key, e)
			}, null, 8, [
				"field-key",
				"descriptor",
				"value",
				"config",
				"param-value-state",
				"inputs",
				"instance-id",
				"theme-context",
				"disabled",
				"disabled-help-text",
				"onUpdate:value",
				"onUpdate:paramValueState"
			]))], 64)) : (b(), u(T(e), {
				key: 1,
				open: Q(o.name),
				class: "flex flex-col gap-3",
				"data-group": o.name,
				"data-testid": U(o.name),
				"onUpdate:open": (e) => te(o.name, e)
			}, {
				default: E(() => [h(T(n), {
					class: "flex w-full cursor-pointer select-none items-center gap-1.5 rounded-sm text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
					"data-testid": W(o.name)
				}, {
					default: E(() => [h(T(r), {
						"aria-hidden": "true",
						class: y(["size-3.5 shrink-0 transition-transform", { "rotate-90": Q(o.name) }]),
						icon: "lucide:chevron-right"
					}, null, 8, ["class"]), p("span", null, w(o.name), 1)]),
					_: 2
				}, 1032, ["data-testid"]), h(T(t), null, {
					default: E(() => [p("div", j, [(b(!0), f(c, null, C(o.fields, (e) => (b(), f(c, { key: e.key }, [X(e) ? (b(), u(i, {
						key: 0,
						"field-key": e.key,
						descriptor: e.descriptor,
						config: N.config,
						data: N.data,
						"dataset-derivation-service": N.datasetDerivationService,
						disabled: z(e.key).disabled,
						"disabled-help-text": z(e.key).disabledHelpText,
						"onUpdate:configPatch": (t) => Y(e.key, t)
					}, null, 8, [
						"field-key",
						"descriptor",
						"config",
						"data",
						"dataset-derivation-service",
						"disabled",
						"disabled-help-text",
						"onUpdate:configPatch"
					])) : (b(), u(a, {
						key: 1,
						"field-key": e.key,
						descriptor: e.descriptor,
						value: N.config[e.key],
						config: N.config,
						"param-value-state": G(e.key),
						inputs: I.value,
						"instance-id": N.instanceId,
						"theme-context": N.themeContext,
						disabled: z(e.key).disabled,
						"disabled-help-text": z(e.key).disabledHelpText,
						"onUpdate:value": (t) => q(e.key, t),
						"onUpdate:paramValueState": (t) => J(e.key, t)
					}, null, 8, [
						"field-key",
						"descriptor",
						"value",
						"config",
						"param-value-state",
						"inputs",
						"instance-id",
						"theme-context",
						"disabled",
						"disabled-help-text",
						"onUpdate:value",
						"onUpdate:paramValueState"
					]))], 64))), 128))])]),
					_: 2
				}, 1024)]),
				_: 2
			}, 1032, [
				"open",
				"data-group",
				"data-testid",
				"onUpdate:open"
			]))], 64))), 128))
		], 512));
	}
});
//#endregion
export { M as default };
