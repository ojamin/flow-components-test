import e from "../label/Label.js";
import t from "../select/Select.js";
import n from "../select/SelectContent.js";
import r from "../select/SelectItem.js";
import i from "../select/SelectTrigger.js";
import a from "../select/SelectValue.js";
import { Fragment as o, createBlock as s, createCommentVNode as c, createElementBlock as l, createTextVNode as u, createVNode as d, defineComponent as f, openBlock as p, renderList as m, toDisplayString as h, unref as g, withCtx as _ } from "vue";
//#region src/sdk/component-ui/config/ConfigSelector.vue?vue&type=script&setup=true&lang.ts
var v = ["disabled"], y = {
	key: 0,
	class: "text-xs text-muted-foreground/70"
}, b = /* @__PURE__ */ f({
	__name: "ConfigSelector",
	props: {
		modelValue: {},
		options: {},
		label: {},
		hint: {},
		placeholder: { default: "Select…" },
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:modelValue"],
	setup(f, { emit: b }) {
		let x = b;
		function S(e) {
			typeof e == "string" && x("update:modelValue", e);
		}
		return (b, x) => (p(), l("fieldset", {
			class: "flex min-w-0 flex-col gap-1.5",
			disabled: f.disabled,
			"data-testid": "config-selector"
		}, [
			d(g(e), { class: "text-xs font-semibold uppercase tracking-wider text-muted-foreground" }, {
				default: _(() => [u(h(f.label), 1)]),
				_: 1
			}),
			f.hint ? (p(), l("p", y, h(f.hint), 1)) : c("", !0),
			d(g(t), {
				"model-value": f.modelValue,
				disabled: f.disabled,
				"onUpdate:modelValue": S
			}, {
				default: _(() => [d(g(i), {
					class: "h-8 w-full min-w-0 max-w-full text-sm",
					"data-testid": "selector-trigger"
				}, {
					default: _(() => [d(g(a), { placeholder: f.placeholder }, null, 8, ["placeholder"])]),
					_: 1
				}), d(g(n), null, {
					default: _(() => [(p(!0), l(o, null, m(f.options, (e) => (p(), s(g(r), {
						key: e.value,
						value: e.value,
						disabled: e.disabled
					}, {
						default: _(() => [u(h(e.label), 1)]),
						_: 2
					}, 1032, ["value", "disabled"]))), 128))]),
					_: 1
				})]),
				_: 1
			}, 8, ["model-value", "disabled"])
		], 8, v));
	}
});
//#endregion
export { b as default };
