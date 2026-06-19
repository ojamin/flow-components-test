import { clearBrowserTimeout as e, setBrowserTimeout as t } from "./helpers/browser/index.js";
import { deriveChartFieldOptions as n, deriveChartRowsPathOptions as r, filterChartFieldOptions as i, formatChartFieldOptionSummary as a, formatChartRowsPathOptionSummary as o, resolveChartRows as s, resolveServiceChartRows as c, suggestChartFieldPath as ee, validateChartFieldSelection as l } from "./chart-data-helpers.js";
import u from "./component-ui/config/ConfigSelector.js";
import { Fragment as d, computed as f, createCommentVNode as p, createElementBlock as m, createElementVNode as te, createVNode as h, defineComponent as g, onUnmounted as _, openBlock as v, ref as y, renderList as ne, toDisplayString as b, unref as x, watch as re } from "vue";
//#region src/sdk/SchemaFormChartAdapterField.vue?vue&type=script&setup=true&lang.ts
var ie = [
	"data-field",
	"data-testid",
	"data-no-data"
], ae = ["data-field", "data-testid"], oe = ["data-testid"], se = ["data-testid"], ce = ["data-testid"], S = ["data-testid"], le = {
	key: 2,
	class: "flex flex-col gap-3"
}, ue = ["data-field", "data-testid"], de = ["data-testid"], C = 500, w = /* @__PURE__ */ g({
	__name: "SchemaFormChartAdapterField",
	props: {
		fieldKey: {},
		descriptor: {},
		config: {},
		data: { type: [
			String,
			Number,
			Boolean,
			null,
			Array,
			Object
		] },
		datasetDerivationService: { default: void 0 },
		disabled: {
			type: Boolean,
			default: !1
		},
		disabledHelpText: { default: void 0 }
	},
	emits: ["update:configPatch"],
	setup(g, { emit: w }) {
		let T = g, E = w, D = f(() => {
			let e = T.descriptor.meta.control;
			return e.kind === "chart-adapter" ? e : {
				kind: "chart-adapter",
				rowsKey: T.fieldKey,
				fields: []
			};
		}), O = f(() => T.disabled ? T.disabledHelpText ?? T.descriptor.meta.helpText ?? "Controlled by another setting." : null);
		function k(e) {
			let t = T.config[e];
			return typeof t == "string" ? t : "";
		}
		let A = f(() => k(D.value.rowsKey)), j = f(() => r(T.data, { includeFieldCount: T.datasetDerivationService === void 0 })), M = f(() => T.datasetDerivationService ? c(T.data, A.value) : s(T.data, A.value)), N = y([]), P = y("idle"), F = y(null), I = y(null), L = /* @__PURE__ */ new Map(), R = null, z = f(() => {
			if (T.datasetDerivationService) return N.value;
			let e = M.value;
			return e.ok ? n(e.rows) : [];
		});
		function B(e, t) {
			return `${e || t} · unavailable in current data`;
		}
		let V = f(() => {
			let e = j.value.map((e) => ({
				value: e.path,
				label: o(e)
			})), t = A.value.trim();
			return t.length === 0 || e.some((e) => e.value === t) ? e : [{
				value: t,
				label: B(t, "(root)")
			}, ...e];
		}), H = f(() => D.value.fields.map((e) => {
			let t = k(e.key), n = i(z.value, e.role).map((e) => ({
				value: e.path,
				label: a(e)
			})), r = t.trim(), o = r.length > 0 && !n.some((e) => e.value === r) ? [{
				value: r,
				label: B(r, "(none)")
			}, ...n] : n, s = null;
			if (M.value.ok && r.length > 0) {
				let t = l(z.value, e.role, r);
				t.ok || (s = t.error);
			}
			return {
				key: e.key,
				role: e.role,
				label: e.label ?? fe(e.role),
				hint: e.hint,
				value: t,
				options: o,
				disabled: T.disabled || !M.value.ok,
				validationError: s
			};
		}));
		function fe(e) {
			switch (e) {
				case "x": return "X field";
				case "y": return "Y field";
				case "label": return "Label field";
				default: return "Value field";
			}
		}
		let U = f(() => T.data === void 0 || j.value.length === 0), pe = f(() => T.disabled || V.value.length === 0), W = /* @__PURE__ */ new WeakMap(), G = 1, K = f(() => T.data === void 0 ? "Connect data to unlock guided chart field suggestions." : j.value.length === 0 ? "No arrays of objects detected in the connected data yet." : M.value.ok ? P.value === "failed" ? "Field suggestions unavailable. Keep the current field or choose another rows path." : P.value === "pending" ? "Updating field suggestions…" : D.value.rowsHint ?? `Pick an array of objects to chart. ${z.value.length} fields detected across ${M.value.rows.length} rows.` : M.value.state.description ?? M.value.state.title ?? "Pick a rows path to enable field suggestions."), q = f(() => !T.datasetDerivationService || !M.value.ok || P.value !== "pending" && P.value !== "failed" ? null : K.value);
		re(() => [
			T.datasetDerivationService,
			T.data,
			A.value,
			M.value
		], () => {
			me();
		}, { immediate: !0 });
		async function me() {
			let e = T.datasetDerivationService;
			if (!e) {
				he();
				return;
			}
			if (!M.value.ok) {
				N.value = [], P.value = "idle", F.value = null;
				return;
			}
			let t = A.value, n = ye(t, M.value.rows);
			if (F.value === n.requestId && P.value !== "failed") return;
			P.value = "pending", F.value = n.requestId;
			let r = be(n, M.value.rows);
			ge(await e.derive(r), t);
		}
		function he() {
			N.value = [], P.value = "idle", F.value = null, I.value = null;
		}
		function ge(e, t) {
			if (F.value === e.requestId) {
				if (e.status === "success" && e.kind === "chart-field-options") {
					let n = (e.result.chartFieldOptions ?? []).map(ve);
					N.value = n, P.value = "idle", _e(t, n);
					return;
				}
				N.value = [], P.value = "failed";
			}
		}
		function _e(e, t) {
			if (I.value !== e || (I.value = null, J())) return;
			let n = Q(e, t, !0);
			Object.keys(n).length > 1 && E("update:configPatch", n);
		}
		function J() {
			return T.disabled === !0;
		}
		function ve(e) {
			return {
				path: e.path,
				label: e.label,
				sampleValue: e.sampleValue,
				availableRowCount: e.availableRowCount,
				numericRowCount: e.numericRowCount,
				categoricalRowCount: e.categoricalRowCount,
				supportedRoles: e.supportedRoles
			};
		}
		function ye(e, t) {
			let n = e.trim() || "__root__", r = xe(n, t), i = Y({
				fields: D.value.fields.map((e) => e.role),
				maxSampleRows: C
			}), a = Y({
				componentId: "schema-form.chart-adapter",
				configContract: "dataset-derivation-service-v1"
			});
			return {
				requestId: [
					"schema-form.chart-adapter",
					r,
					n,
					i,
					a
				].join(":"),
				datasetPath: n,
				sourceHash: r,
				configSignature: i,
				materializationSignature: a
			};
		}
		function be(e, t) {
			let n = t.slice(0, C);
			return {
				requestId: e.requestId,
				kind: "chart-field-options",
				rootSource: {
					id: `config-panel:${e.datasetPath}`,
					contentHash: e.sourceHash
				},
				datasetPath: e.datasetPath,
				target: { componentId: "schema-form.chart-adapter" },
				materialization: { definitionHash: e.materializationSignature },
				configSignature: e.configSignature,
				dataset: n,
				chartFieldOptions: {}
			};
		}
		function xe(e, t) {
			return Y({
				datasetPath: e,
				rowCount: t.length,
				sourceRevision: Se(t)
			});
		}
		function Se(e) {
			let t = W.get(e);
			if (t !== void 0) return t;
			let n = G;
			return G += 1, W.set(e, n), n;
		}
		function Y(e) {
			let t = X(e), n = 14695981039346656037n;
			for (let e = 0; e < t.length; e += 1) n ^= BigInt(t.charCodeAt(e)), n = BigInt.asUintN(64, n * 1099511628211n);
			let r = n.toString(16).padStart(16, "0");
			return `sha256:${r}${r}${r}${r}`;
		}
		function X(e) {
			return Array.isArray(e) ? `[${e.map((e) => X(e)).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${X(e[t])}`).join(",")}}` : JSON.stringify(e);
		}
		function Z() {
			return D.value.testId ?? `${T.fieldKey}-chart-adapter`;
		}
		function Ce() {
			return `${Z()}-rows`;
		}
		function we(e) {
			return `${Z()}-field-${e.key}`;
		}
		function Te(e) {
			return `${Z()}-field-${e.key}-validation`;
		}
		function Ee() {
			return `${Z()}-rows-helper`;
		}
		function De() {
			return `${Z()}-rows-helper-status`;
		}
		function Oe() {
			return `${Z()}-no-data`;
		}
		function ke(e) {
			if (J()) return;
			if (T.datasetDerivationService) {
				if (!c(T.data, e).ok) {
					E("update:configPatch", Q(e, [], !1)), I.value = null;
					return;
				}
				I.value = e, E("update:configPatch", { [D.value.rowsKey]: e });
				return;
			}
			let t = s(T.data, e);
			E("update:configPatch", Q(e, t.ok ? n(t.rows) : [], t.ok));
		}
		function Q(e, t, n) {
			let r = { [D.value.rowsKey]: e };
			for (let e of D.value.fields) {
				let i = k(e.key), a = ee(t, e.role, n ? i : "");
				a !== i && (r[e.key] = a);
			}
			return r;
		}
		function Ae(e, t) {
			if (!J()) {
				if (t === e.value) {
					L.delete(e.key), Me();
					return;
				}
				L.set(e.key, t), je();
			}
		}
		function je() {
			R === null && (R = t($, 0), R === null && $());
		}
		function $() {
			if (R = null, L.size === 0) return;
			if (J()) {
				L.clear();
				return;
			}
			let e = Object.fromEntries(L.entries());
			L.clear(), E("update:configPatch", e);
		}
		function Me() {
			L.size > 0 || (e(R), R = null);
		}
		return _(() => {
			e(R), R = null, L.clear();
		}), (e, t) => (v(), m("fieldset", {
			class: "flex flex-col gap-3",
			"data-field": g.fieldKey,
			"data-testid": Z(),
			"data-no-data": U.value ? "true" : "false"
		}, [
			te("div", {
				"data-field": `${g.fieldKey}-${D.value.rowsKey}`,
				"data-testid": Ce()
			}, [
				h(x(u), {
					"model-value": A.value,
					options: V.value,
					disabled: pe.value,
					label: D.value.rowsLabel ?? g.descriptor.meta.label,
					placeholder: D.value.rowsPlaceholder ?? "Choose rows",
					hint: K.value,
					"onUpdate:modelValue": t[0] ||= (e) => ke(e)
				}, null, 8, [
					"model-value",
					"options",
					"disabled",
					"label",
					"placeholder",
					"hint"
				]),
				q.value ? (v(), m("p", {
					key: 0,
					class: "sr-only",
					role: "status",
					"aria-live": "polite",
					"aria-atomic": "true",
					"data-testid": De()
				}, b(q.value), 9, oe)) : p("", !0),
				O.value ? (v(), m("p", {
					key: 1,
					class: "mt-1.5 text-xs text-muted-foreground/80",
					"data-testid": `${g.fieldKey}-disabled-help`
				}, b(O.value), 9, se)) : p("", !0)
			], 8, ae),
			U.value ? (v(), m("p", {
				key: 0,
				class: "rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70",
				"data-testid": Oe()
			}, " Connect data with at least one array of objects to unlock guided chart field suggestions. ", 8, ce)) : M.value.ok ? p("", !0) : (v(), m("p", {
				key: 1,
				class: "text-xs text-muted-foreground/70",
				"data-testid": Ee()
			}, b(K.value), 9, S)),
			H.value.length > 0 ? (v(), m("div", le, [(v(!0), m(d, null, ne(H.value, (e) => (v(), m("div", {
				key: e.key,
				"data-field": `${g.fieldKey}-${e.key}`,
				"data-testid": we(e)
			}, [h(x(u), {
				"model-value": e.value,
				options: e.options,
				disabled: e.disabled || e.options.length === 0,
				label: e.label,
				placeholder: `Choose ${e.label.toLowerCase()}`,
				hint: e.hint,
				"onUpdate:modelValue": (t) => Ae(e, t)
			}, null, 8, [
				"model-value",
				"options",
				"disabled",
				"label",
				"placeholder",
				"hint",
				"onUpdate:modelValue"
			]), e.validationError ? (v(), m("p", {
				key: 0,
				class: "mt-1 text-xs text-destructive",
				role: "alert",
				"data-testid": Te(e)
			}, b(e.validationError), 9, de)) : p("", !0)], 8, ue))), 128))])) : p("", !0)
		], 8, ie));
	}
});
//#endregion
export { w as default };
