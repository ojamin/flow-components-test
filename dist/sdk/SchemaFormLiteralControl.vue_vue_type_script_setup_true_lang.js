import e from "./component-ui/input/Input.js";
import t from "./component-ui/switch/Switch.js";
import n from "./component-ui/textarea/Textarea.js";
import r from "./component-ui/select/Select.js";
import i from "./component-ui/select/SelectContent.js";
import a from "./component-ui/select/SelectItem.js";
import o from "./component-ui/select/SelectTrigger.js";
import s from "./component-ui/select/SelectValue.js";
import { getRegisteredCodeEditor as c } from "./code-editor-adapter.js";
import l from "./SchemaFormAggregateListField.js";
import u from "./SchemaFormDataPathField.js";
import d from "./SchemaFormFieldListField.js";
import ee from "./SchemaFormHeadersField.js";
import f from "./SchemaFormRecordFieldControl.js";
import p from "./SchemaFormThemeRoleControl.js";
import m from "./SchemaFormViewListField.js";
import h from "./SchemaFormViewSelectField.js";
import { Fragment as g, computed as _, createBlock as v, createCommentVNode as y, createElementBlock as b, createTextVNode as x, createVNode as S, defineComponent as C, openBlock as w, reactive as T, renderList as E, resolveDynamicComponent as D, toDisplayString as O, toRaw as k, unref as A, watch as j, withCtx as M } from "vue";
//#region src/sdk/SchemaFormLiteralControl.vue?vue&type=script&setup=true&lang.ts
var N = ["data-testid"], P = ["data-testid"], F = /* @__PURE__ */ C({
	__name: "SchemaFormLiteralControl",
	props: {
		fieldKey: {},
		descriptor: {},
		value: {},
		config: { default: void 0 },
		inputs: {},
		instanceId: { default: void 0 },
		hideLabel: {
			type: Boolean,
			default: !1
		},
		inputId: { default: void 0 },
		themeContext: { default: void 0 },
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:value", "update:invalid"],
	setup(C, { emit: F }) {
		let I = C, L = F, R = T({
			draft: "",
			invalid: !1
		}), z = T({
			draft: "",
			invalid: !1
		}), B = T({ invalid: !1 }), V = _(() => c());
		j(_(() => {
			let e = I.descriptor.meta.control.kind;
			return !!(e === "number" && R.invalid || e === "code" && z.invalid || e === "theme-role" && B.invalid);
		}), (e) => L("update:invalid", e));
		function H() {
			let e = I.value;
			return typeof e == "string" ? e : e == null ? "" : String(e);
		}
		function U() {
			if (I.descriptor.meta.control.kind !== "code" || I.descriptor.meta.control.language !== "json") return !1;
			let e = I.value;
			return e !== void 0 && typeof e != "string";
		}
		function W() {
			if (z.invalid) return z.draft;
			if (U()) try {
				return JSON.stringify(I.value, null, 2);
			} catch {
				return "";
			}
			return H();
		}
		function G() {
			if (R.invalid) return R.draft;
			let e = I.value;
			return typeof e == "number" && Number.isFinite(e) ? String(e) : "";
		}
		function K() {
			let e = k(I.descriptor.schema);
			return e.def?.type === "optional" || e._def?.type === "optional";
		}
		function te() {
			return !!I.value;
		}
		function q() {
			let e = I.value;
			return Array.isArray(e) ? e.filter((e) => typeof e == "object" && !!e && !Array.isArray(e)).map((e) => ({
				id: typeof e.id == "string" ? e.id : "",
				key: typeof e.key == "string" ? e.key : "",
				value: typeof e.value == "string" ? e.value : "",
				enabled: e.enabled !== !1
			})).filter((e) => e.id.length > 0) : [];
		}
		function J(e) {
			return typeof e == "string" ? e : String(e);
		}
		function Y() {
			return I.disabled === !0;
		}
		function X(e) {
			Y() || L("update:value", J(e));
		}
		function Z(e) {
			if (Y()) return;
			let t = J(e);
			if (!U()) {
				z.draft = "", z.invalid = !1, L("update:value", t);
				return;
			}
			if (z.draft = t, t.trim().length === 0) {
				z.invalid = !0;
				return;
			}
			try {
				let e = JSON.parse(t);
				z.invalid = !1, z.draft = "", L("update:value", e);
			} catch {
				z.invalid = !0;
			}
		}
		function Q(e) {
			if (Y()) return;
			let t = J(e);
			if (R.draft = t, t.trim().length === 0) {
				if (K()) {
					R.invalid = !1, R.draft = "", L("update:value", void 0);
					return;
				}
				R.invalid = !0;
				return;
			}
			let n = Number(t);
			if (Number.isFinite(n)) {
				R.invalid = !1, L("update:value", n);
				return;
			}
			R.invalid = !0;
		}
		function ne(e) {
			Y() || L("update:value", e);
		}
		function re(e) {
			Y() || L("update:value", e);
		}
		function ie(e) {
			Y() || L("update:value", e);
		}
		function ae() {
			let e = I.value;
			return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
		}
		function oe() {
			let e = I.value;
			return Array.isArray(e) ? e.filter((e) => typeof e == "object" && !!e && !Array.isArray(e)).map((e) => ({
				sourceField: typeof e.sourceField == "string" ? e.sourceField : "",
				operation: typeof e.operation == "string" ? e.operation : "",
				outputField: typeof e.outputField == "string" ? e.outputField : ""
			})) : [];
		}
		function se(e) {
			Y() || L("update:value", e);
		}
		function ce(e) {
			Y() || L("update:value", e);
		}
		function le() {
			let e = I.value;
			return Array.isArray(e) ? e.filter((e) => typeof e == "object" && !!e && !Array.isArray(e)).map((e) => {
				let t = typeof e.id == "string" ? e.id : "", n = typeof e.label == "string" ? e.label : "", r = typeof e.hashSlug == "string" ? e.hashSlug : void 0, i = typeof e.disabled == "boolean" ? e.disabled : void 0;
				return {
					id: t,
					label: n,
					...r ? { hashSlug: r } : {},
					...i === void 0 ? {} : { disabled: i }
				};
			}).filter((e) => e.id.length > 0 && e.label.length > 0) : [];
		}
		function ue(e) {
			Y() || L("update:value", e);
		}
		function de(e) {
			Y() || L("update:value", e);
		}
		function fe(e) {
			B.invalid = e;
		}
		function $(e) {
			Y() || L("update:value", e);
		}
		return (c, _) => C.descriptor.meta.control.kind === "input" ? (w(), v(A(e), {
			key: 0,
			id: C.inputId,
			"model-value": H(),
			placeholder: C.descriptor.meta.control.placeholder,
			"data-testid": C.descriptor.meta.control.testId,
			disabled: C.disabled,
			"onUpdate:modelValue": _[0] ||= (e) => X(e)
		}, null, 8, [
			"id",
			"model-value",
			"placeholder",
			"data-testid",
			"disabled"
		])) : C.descriptor.meta.control.kind === "data-path" ? (w(), v(u, {
			key: 1,
			"field-key": C.fieldKey,
			descriptor: C.descriptor,
			value: C.value,
			"hide-label": C.hideLabel,
			"instance-id": C.instanceId,
			inputs: C.inputs,
			disabled: C.disabled,
			"onUpdate:value": _[1] ||= (e) => $(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"hide-label",
			"instance-id",
			"inputs",
			"disabled"
		])) : C.descriptor.meta.control.kind === "record-field" ? (w(), v(f, {
			key: 2,
			"field-key": C.fieldKey,
			descriptor: C.descriptor,
			value: C.value,
			config: C.config,
			"hide-label": C.hideLabel,
			"instance-id": C.instanceId,
			inputs: C.inputs,
			"input-id": C.inputId,
			disabled: C.disabled,
			"onUpdate:value": _[2] ||= (e) => $(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"value",
			"config",
			"hide-label",
			"instance-id",
			"inputs",
			"input-id",
			"disabled"
		])) : C.descriptor.meta.control.kind === "field-list" ? (w(), v(d, {
			key: 3,
			"field-key": C.fieldKey,
			descriptor: C.descriptor,
			"model-value": ae(),
			config: C.config,
			"hide-label": C.hideLabel,
			"instance-id": C.instanceId,
			inputs: C.inputs,
			disabled: C.disabled,
			"onUpdate:modelValue": _[3] ||= (e) => se(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"model-value",
			"config",
			"hide-label",
			"instance-id",
			"inputs",
			"disabled"
		])) : C.descriptor.meta.control.kind === "aggregate-list" ? (w(), v(l, {
			key: 4,
			"field-key": C.fieldKey,
			descriptor: C.descriptor,
			"model-value": oe(),
			config: C.config,
			"hide-label": C.hideLabel,
			"instance-id": C.instanceId,
			inputs: C.inputs,
			disabled: C.disabled,
			"onUpdate:modelValue": _[4] ||= (e) => ce(e)
		}, null, 8, [
			"field-key",
			"descriptor",
			"model-value",
			"config",
			"hide-label",
			"instance-id",
			"inputs",
			"disabled"
		])) : C.descriptor.meta.control.kind === "textarea" ? (w(), v(A(n), {
			key: 5,
			id: C.inputId,
			"model-value": H(),
			placeholder: C.descriptor.meta.control.placeholder,
			rows: C.descriptor.meta.control.rows ?? 3,
			"data-testid": C.descriptor.meta.control.testId,
			disabled: C.disabled,
			"onUpdate:modelValue": _[5] ||= (e) => X(e)
		}, null, 8, [
			"id",
			"model-value",
			"placeholder",
			"rows",
			"data-testid",
			"disabled"
		])) : C.descriptor.meta.control.kind === "number" ? (w(), b(g, { key: 6 }, [S(A(e), {
			id: C.inputId,
			type: "number",
			"model-value": G(),
			min: C.descriptor.meta.control.min,
			max: C.descriptor.meta.control.max,
			step: C.descriptor.meta.control.step,
			"data-testid": C.descriptor.meta.control.testId,
			"aria-invalid": R.invalid || void 0,
			disabled: C.disabled,
			"onUpdate:modelValue": _[6] ||= (e) => Q(e)
		}, null, 8, [
			"id",
			"model-value",
			"min",
			"max",
			"step",
			"data-testid",
			"aria-invalid",
			"disabled"
		]), R.invalid ? (w(), b("p", {
			key: 0,
			class: "text-xs text-destructive",
			role: "alert",
			"data-testid": `${C.fieldKey}-number-validation-hint`
		}, " Enter a finite number. ", 8, N)) : y("", !0)], 64)) : C.descriptor.meta.control.kind === "select" ? (w(), v(A(r), {
			key: 7,
			"model-value": H(),
			disabled: C.disabled,
			"onUpdate:modelValue": _[7] ||= (e) => ne(String(e ?? ""))
		}, {
			default: M(() => [S(A(o), {
				id: C.inputId,
				class: "h-8 w-full min-w-0 max-w-full text-sm",
				"aria-label": C.descriptor.meta.label,
				"data-testid": C.descriptor.meta.control.testId,
				disabled: C.disabled
			}, {
				default: M(() => [S(A(s), { placeholder: "Select…" })]),
				_: 1
			}, 8, [
				"id",
				"aria-label",
				"data-testid",
				"disabled"
			]), S(A(i), null, {
				default: M(() => [(w(!0), b(g, null, E(C.descriptor.meta.control.options, (e) => (w(), v(A(a), {
					key: e.value,
					value: e.value
				}, {
					default: M(() => [x(O(e.label), 1)]),
					_: 2
				}, 1032, ["value"]))), 128))]),
				_: 1
			})]),
			_: 1
		}, 8, ["model-value", "disabled"])) : C.descriptor.meta.control.kind === "boolean" ? (w(), v(A(t), {
			key: 8,
			id: C.inputId,
			"model-value": te(),
			"aria-label": C.descriptor.meta.label,
			"data-testid": C.descriptor.meta.control.testId,
			disabled: C.disabled,
			"onUpdate:modelValue": _[8] ||= (e) => re(e)
		}, null, 8, [
			"id",
			"model-value",
			"aria-label",
			"data-testid",
			"disabled"
		])) : C.descriptor.meta.control.kind === "color" ? (w(), v(A(e), {
			key: 9,
			id: C.inputId,
			type: "color",
			"model-value": H(),
			"data-testid": C.descriptor.meta.control.testId,
			class: "h-9 w-16 cursor-pointer p-1",
			disabled: C.disabled,
			"onUpdate:modelValue": _[9] ||= (e) => X(e)
		}, null, 8, [
			"id",
			"model-value",
			"data-testid",
			"disabled"
		])) : C.descriptor.meta.control.kind === "code" ? (w(), b(g, { key: 10 }, [V.value ? (w(), v(D(V.value), {
			key: 0,
			id: C.inputId,
			"model-value": W(),
			language: C.descriptor.meta.control.language,
			rows: 6,
			"data-testid": C.descriptor.meta.control.testId,
			"aria-invalid": z.invalid || void 0,
			class: "font-mono text-xs",
			disabled: C.disabled,
			readonly: C.disabled || void 0,
			"aria-readonly": C.disabled || void 0,
			tabindex: C.disabled ? -1 : void 0,
			"onUpdate:modelValue": _[10] ||= (e) => Z(e)
		}, null, 8, [
			"id",
			"model-value",
			"language",
			"data-testid",
			"aria-invalid",
			"disabled",
			"readonly",
			"aria-readonly",
			"tabindex"
		])) : (w(), v(A(n), {
			key: 1,
			id: C.inputId,
			"model-value": W(),
			rows: 6,
			"data-testid": C.descriptor.meta.control.testId,
			"aria-invalid": z.invalid || void 0,
			class: "font-mono text-xs",
			disabled: C.disabled,
			"onUpdate:modelValue": _[11] ||= (e) => Z(e)
		}, null, 8, [
			"id",
			"model-value",
			"data-testid",
			"aria-invalid",
			"disabled"
		])), z.invalid ? (w(), b("p", {
			key: 2,
			class: "text-xs text-destructive",
			role: "alert",
			"data-testid": `${C.fieldKey}-code-validation-hint`
		}, " Enter valid JSON. ", 8, P)) : y("", !0)], 64)) : C.descriptor.meta.control.kind === "headers" ? (w(), v(ee, {
			key: 11,
			"field-key": C.fieldKey,
			label: C.descriptor.meta.label,
			"help-text": C.descriptor.meta.helpText,
			"model-value": q(),
			"key-placeholder": C.descriptor.meta.control.keyPlaceholder,
			"value-placeholder": C.descriptor.meta.control.valuePlaceholder,
			"add-label": C.descriptor.meta.control.addLabel,
			"test-id": C.descriptor.meta.control.testId,
			"hide-label": C.hideLabel,
			disabled: C.disabled,
			"onUpdate:modelValue": _[12] ||= (e) => ie(e)
		}, null, 8, [
			"field-key",
			"label",
			"help-text",
			"model-value",
			"key-placeholder",
			"value-placeholder",
			"add-label",
			"test-id",
			"hide-label",
			"disabled"
		])) : C.descriptor.meta.control.kind === "view-list" ? (w(), v(m, {
			key: 12,
			"field-key": C.fieldKey,
			label: C.descriptor.meta.label,
			"help-text": C.descriptor.meta.helpText,
			"model-value": le(),
			"add-label": C.descriptor.meta.control.addLabel,
			"hash-slug-placeholder": C.descriptor.meta.control.hashSlugPlaceholder,
			"test-id": C.descriptor.meta.control.testId,
			"hide-label": C.hideLabel,
			disabled: C.disabled,
			"onUpdate:modelValue": _[13] ||= (e) => ue(e)
		}, null, 8, [
			"field-key",
			"label",
			"help-text",
			"model-value",
			"add-label",
			"hash-slug-placeholder",
			"test-id",
			"hide-label",
			"disabled"
		])) : C.descriptor.meta.control.kind === "view-select" ? (w(), v(h, {
			key: 13,
			"field-key": C.fieldKey,
			"input-id": C.inputId,
			descriptor: C.descriptor,
			value: C.value,
			config: C.config,
			"hide-label": C.hideLabel,
			disabled: C.disabled,
			"onUpdate:value": _[14] ||= (e) => $(e)
		}, null, 8, [
			"field-key",
			"input-id",
			"descriptor",
			"value",
			"config",
			"hide-label",
			"disabled"
		])) : C.descriptor.meta.control.kind === "theme-role" ? (w(), v(p, {
			key: 14,
			"field-key": C.fieldKey,
			"input-id": C.inputId,
			descriptor: C.descriptor,
			value: C.value,
			"theme-context": C.themeContext,
			"hide-label": C.hideLabel,
			disabled: C.disabled,
			"onUpdate:value": _[15] ||= (e) => de(e),
			"onUpdate:invalid": _[16] ||= (e) => fe(e)
		}, null, 8, [
			"field-key",
			"input-id",
			"descriptor",
			"value",
			"theme-context",
			"hide-label",
			"disabled"
		])) : y("", !0);
	}
});
//#endregion
export { F as default };
