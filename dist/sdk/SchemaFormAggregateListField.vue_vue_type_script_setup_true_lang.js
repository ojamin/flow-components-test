import e from "./component-ui/badge/Badge.js";
import t from "./component-ui/button/Button.js";
import n from "./component-ui/input/Input.js";
import r from "./component-ui/label/Label.js";
import i from "./component-ui/select/Select.js";
import a from "./component-ui/select/SelectContent.js";
import o from "./component-ui/select/SelectItem.js";
import s from "./component-ui/select/SelectTrigger.js";
import c from "./component-ui/select/SelectValue.js";
import { Icon as l } from "./component-ui-primitives.js";
import { getRegisteredDataPathPicker as u } from "./data-path-picker-adapter.js";
import { Fragment as d, computed as f, createBlock as p, createCommentVNode as m, createElementBlock as h, createElementVNode as g, createTextVNode as _, createVNode as v, defineComponent as y, openBlock as b, ref as x, renderList as S, resolveDynamicComponent as C, toDisplayString as w, unref as T, watch as E, withCtx as D } from "vue";
//#region src/sdk/SchemaFormAggregateListField.vue?vue&type=script&setup=true&lang.ts
var O = ["data-field", "data-testid"], k = {
	key: 0,
	class: "flex items-center justify-between gap-2"
}, A = {
	key: 1,
	class: "text-xs text-muted-foreground/70"
}, ee = ["data-testid"], te = [
	"data-testid",
	"data-row-index",
	"data-row-invalid"
], ne = { class: "flex items-start gap-2" }, j = { class: "flex flex-1 flex-col gap-1.5" }, M = { class: "flex items-center gap-1" }, N = { class: "flex items-end gap-2" }, P = { class: "flex w-32 flex-col gap-1.5" }, F = { class: "flex flex-1 flex-col gap-1.5" }, I = ["data-testid"], L = /* @__PURE__ */ y({
	__name: "SchemaFormAggregateListField",
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
	setup(y, { emit: L }) {
		let R = y, z = L, B = f(() => u()), V = f(() => R.descriptor.meta.control.kind === "aggregate-list" ? R.descriptor.meta.control : null), H = f(() => R.modelValue ?? []), U = x([]), W = 1, G = f(() => V.value?.operations ?? []), K = f(() => {
			let e = V.value?.sourcePickerRootPathKey;
			if (!e) return;
			let t = R.config?.[e];
			if (typeof t != "string") return;
			let n = t.trim();
			return n.length > 0 ? n : void 0;
		}), re = f(() => V.value?.sourcePlaceholder ?? "field path"), q = f(() => V.value?.outputPlaceholder ?? "result name"), J = f(() => V.value?.addLabel ?? "Add aggregate"), Y = f(() => G.value[0]?.value ?? ""), X = f(() => [...H.value.map((e, t) => ({
			...e,
			key: `persisted:${t}`,
			source: "persisted",
			sourceIndex: t,
			touched: !0
		})), ...U.value.map((e) => ({
			sourceField: e.sourceField,
			operation: e.operation,
			outputField: e.outputField,
			key: `draft:${e.id}`,
			source: "draft",
			sourceIndex: e.id,
			touched: e.touched
		}))]), ie = f(() => X.value.some(Q));
		function ae() {
			return V.value?.testId ?? `${R.fieldKey}-aggregate-list`;
		}
		function Z(e, t) {
			return `${R.fieldKey}-aggregate-list-row-${e}-${t}`;
		}
		function oe(e) {
			return e.sourceField.trim().length === 0;
		}
		function Q(e) {
			return oe(e) && (e.source === "persisted" || e.touched);
		}
		function se(e) {
			if (R.disabled) return;
			let t = e.filter((e) => e.sourceField.trim().length > 0);
			if (t.length === 0) {
				U.value = e;
				return;
			}
			U.value = e.filter((e) => e.sourceField.trim().length === 0), z("update:modelValue", t.reduce((e, t) => [...e, {
				sourceField: t.sourceField,
				operation: t.operation || Y.value,
				outputField: t.outputField
			}], [...H.value]));
		}
		function ce(e, t) {
			R.disabled || z("update:modelValue", H.value.map((n, r) => r === e ? {
				...n,
				...t
			} : n));
		}
		function le(e, t) {
			R.disabled || se(U.value.map((n) => n.id === e ? {
				...n,
				...t,
				touched: n.touched || t.sourceField === ""
			} : n));
		}
		function $(e, t) {
			if (!R.disabled) {
				if (e.source === "draft") {
					le(e.sourceIndex, t);
					return;
				}
				ce(e.sourceIndex, t);
			}
		}
		function ue(e) {
			if (!R.disabled) {
				if (e.source === "draft") {
					U.value = U.value.filter((t) => t.id !== e.sourceIndex);
					return;
				}
				z("update:modelValue", H.value.filter((t, n) => n !== e.sourceIndex));
			}
		}
		function de(e) {
			R.disabled || e.source === "draft" && (U.value = U.value.map((t) => t.id === e.sourceIndex ? {
				...t,
				touched: !0
			} : t));
		}
		function fe() {
			if (R.disabled) return;
			let e = {
				id: W++,
				sourceField: "",
				operation: Y.value,
				outputField: "",
				touched: !1
			};
			U.value = [...U.value, e];
		}
		return E(() => JSON.stringify(H.value), () => {
			U.value = [];
		}), (u, f) => (b(), h("fieldset", {
			class: "flex flex-col gap-2",
			"data-field": y.fieldKey,
			"data-testid": ae()
		}, [
			y.hideLabel ? m("", !0) : (b(), h("div", k, [v(T(r), { class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground" }, {
				default: D(() => [_(w(y.descriptor.meta.label), 1)]),
				_: 1
			}), v(T(e), {
				variant: "outline",
				class: "text-[10px]"
			}, {
				default: D(() => [_(w(X.value.length) + " " + w(X.value.length === 1 ? "row" : "rows"), 1)]),
				_: 1
			})])),
			!y.hideLabel && y.descriptor.meta.helpText ? (b(), h("p", A, w(y.descriptor.meta.helpText), 1)) : m("", !0),
			X.value.length === 0 ? (b(), h("p", {
				key: 2,
				class: "rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70",
				"data-testid": `${y.fieldKey}-aggregate-list-empty`
			}, " No aggregates yet. Add one to compute a per-group summary value. ", 8, ee)) : m("", !0),
			(b(!0), h(d, null, S(X.value, (e, u) => (b(), h("div", {
				key: e.key,
				class: "flex flex-col gap-1.5 rounded-md border border-border/40 bg-muted/20 p-2",
				"data-testid": Z(u, "row"),
				"data-row-index": u,
				"data-row-invalid": Q(e) ? "true" : void 0
			}, [g("div", ne, [g("div", j, [v(T(r), {
				class: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				for: `${y.fieldKey}-aggregate-list-row-${u}-source`
			}, {
				default: D(() => [...f[0] ||= [_(" Source field ", -1)]]),
				_: 1
			}, 8, ["for"]), g("div", M, [v(T(n), {
				id: `${y.fieldKey}-aggregate-list-row-${u}-source`,
				"model-value": e.sourceField,
				placeholder: re.value,
				"aria-label": `Source field for aggregate row ${u + 1}`,
				"aria-invalid": Q(e) || void 0,
				class: "h-8 flex-1 font-code text-xs",
				"data-testid": Z(u, "source"),
				disabled: y.disabled,
				"onUpdate:modelValue": (t) => $(e, { sourceField: String(t) }),
				onBlur: (t) => de(e)
			}, null, 8, [
				"id",
				"model-value",
				"placeholder",
				"aria-label",
				"aria-invalid",
				"data-testid",
				"disabled",
				"onUpdate:modelValue",
				"onBlur"
			]), B.value ? (b(), p(C(B.value), {
				key: 0,
				"model-value": e.sourceField,
				"field-label": `Source field row ${u + 1}`,
				mode: "literal",
				"output-format": "relative",
				"instance-id": y.instanceId,
				inputs: y.inputs,
				"root-path": K.value,
				"data-testid": Z(u, "source-picker"),
				disabled: y.disabled,
				"aria-disabled": y.disabled || void 0,
				"onUpdate:modelValue": (t) => $(e, { sourceField: t })
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
			])) : m("", !0)])]), v(T(t), {
				variant: "ghost",
				size: "icon-xs",
				type: "button",
				class: "mt-5",
				"aria-label": `Remove aggregate row ${u + 1}`,
				"data-testid": Z(u, "remove"),
				disabled: y.disabled,
				onClick: (t) => ue(e)
			}, {
				default: D(() => [v(T(l), {
					icon: "lucide:x",
					class: "size-3"
				})]),
				_: 1
			}, 8, [
				"aria-label",
				"data-testid",
				"disabled",
				"onClick"
			])]), g("div", N, [g("div", P, [v(T(r), {
				class: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				for: `${y.fieldKey}-aggregate-list-row-${u}-operation`
			}, {
				default: D(() => [...f[1] ||= [_(" Operation ", -1)]]),
				_: 1
			}, 8, ["for"]), v(T(i), {
				"model-value": e.operation,
				disabled: y.disabled,
				"onUpdate:modelValue": (t) => $(e, { operation: String(t ?? "") })
			}, {
				default: D(() => [v(T(s), {
					id: `${y.fieldKey}-aggregate-list-row-${u}-operation`,
					class: "h-8 w-full text-xs",
					"aria-label": `Operation for aggregate row ${u + 1}`,
					"data-testid": Z(u, "operation"),
					disabled: y.disabled
				}, {
					default: D(() => [v(T(c), { placeholder: "Select…" })]),
					_: 1
				}, 8, [
					"id",
					"aria-label",
					"data-testid",
					"disabled"
				]), v(T(a), null, {
					default: D(() => [(b(!0), h(d, null, S(G.value, (e) => (b(), p(T(o), {
						key: e.value,
						value: e.value
					}, {
						default: D(() => [_(w(e.label), 1)]),
						_: 2
					}, 1032, ["value"]))), 128))]),
					_: 1
				})]),
				_: 2
			}, 1032, [
				"model-value",
				"disabled",
				"onUpdate:modelValue"
			])]), g("div", F, [v(T(r), {
				class: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				for: `${y.fieldKey}-aggregate-list-row-${u}-output`
			}, {
				default: D(() => [...f[2] ||= [_(" Output field ", -1)]]),
				_: 1
			}, 8, ["for"]), v(T(n), {
				id: `${y.fieldKey}-aggregate-list-row-${u}-output`,
				"model-value": e.outputField,
				placeholder: q.value,
				"aria-label": `Output field for aggregate row ${u + 1}`,
				class: "h-8 flex-1 font-code text-xs",
				"data-testid": Z(u, "output"),
				disabled: y.disabled,
				"onUpdate:modelValue": (t) => $(e, { outputField: String(t) })
			}, null, 8, [
				"id",
				"model-value",
				"placeholder",
				"aria-label",
				"data-testid",
				"disabled",
				"onUpdate:modelValue"
			])])])], 8, te))), 128)),
			v(T(t), {
				variant: "outline",
				size: "sm",
				type: "button",
				class: "w-full",
				"data-testid": `${y.fieldKey}-aggregate-list-add`,
				disabled: y.disabled,
				onClick: fe
			}, {
				default: D(() => [v(T(l), {
					icon: "lucide:plus",
					class: "size-3.5",
					"data-icon": "inline-start"
				}), _(" " + w(J.value), 1)]),
				_: 1
			}, 8, ["data-testid", "disabled"]),
			ie.value ? (b(), h("p", {
				key: 3,
				class: "text-xs text-destructive",
				role: "alert",
				"data-testid": `${y.fieldKey}-aggregate-list-validation-empty`
			}, " Aggregate rows must have a source field. ", 8, I)) : m("", !0)
		], 8, O));
	}
});
//#endregion
export { L as default };
