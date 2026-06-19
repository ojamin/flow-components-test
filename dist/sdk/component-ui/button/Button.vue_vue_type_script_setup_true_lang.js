import { cn as e } from "../cn.js";
import { buttonVariants as t } from "./index.js";
import { computed as n, createBlock as r, defineComponent as i, normalizeClass as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { Primitive as u } from "reka-ui";
//#region src/sdk/component-ui/button/Button.vue?vue&type=script&setup=true&lang.ts
var d = /* @__PURE__ */ i({
	__name: "Button",
	props: {
		as: { default: "button" },
		asChild: { type: Boolean },
		disabled: { type: Boolean },
		variant: {},
		size: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(i) {
		let d = i, f = n(() => d.variant === "unstyled" ? void 0 : t({
			variant: d.variant,
			size: d.size
		}));
		return (t, n) => (o(), r(c(u), {
			"data-slot": "button",
			"data-variant": i.variant,
			"data-size": i.size,
			as: i.as,
			"as-child": i.asChild,
			disabled: i.disabled || void 0,
			class: a(c(e)(f.value, d.class))
		}, {
			default: l(() => [s(t.$slots, "default")]),
			_: 3
		}, 8, [
			"data-variant",
			"data-size",
			"as",
			"as-child",
			"disabled",
			"class"
		]));
	}
});
//#endregion
export { d as default };
