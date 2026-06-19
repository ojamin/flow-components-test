import e from "../switch/Switch.js";
import t from "../label/Label.js";
import { createCommentVNode as n, createElementBlock as r, createElementVNode as i, createTextVNode as a, createVNode as o, defineComponent as s, openBlock as c, toDisplayString as l, unref as u, withCtx as d } from "vue";
//#region src/sdk/component-ui/config/ConfigToggle.vue?vue&type=script&setup=true&lang.ts
var f = {
	class: "flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2",
	"data-testid": "config-toggle"
}, p = { class: "flex flex-col gap-0.5" }, m = {
	key: 0,
	class: "text-xs leading-relaxed text-muted-foreground/70"
}, h = /* @__PURE__ */ s({
	__name: "ConfigToggle",
	props: {
		modelValue: { type: Boolean },
		label: {},
		description: {},
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:modelValue"],
	setup(s, { emit: h }) {
		let g = h;
		function _(e) {
			g("update:modelValue", e);
		}
		return (h, g) => (c(), r("div", f, [i("div", p, [o(u(t), { class: "text-sm font-medium leading-tight" }, {
			default: d(() => [a(l(s.label), 1)]),
			_: 1
		}), s.description ? (c(), r("p", m, l(s.description), 1)) : n("", !0)]), o(u(e), {
			"model-value": s.modelValue,
			disabled: s.disabled,
			"aria-label": s.label,
			"data-testid": "toggle-switch",
			"onUpdate:modelValue": _
		}, null, 8, [
			"model-value",
			"disabled",
			"aria-label"
		])]));
	}
});
//#endregion
export { h as default };
