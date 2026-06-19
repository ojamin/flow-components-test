import { cn as e } from "../cn.js";
import { toggleVariants as t } from "../toggle/index.js";
import { createBlock as n, defineComponent as r, guardReactiveProps as i, inject as a, mergeProps as o, normalizeProps as s, openBlock as c, renderSlot as l, unref as u, withCtx as d } from "vue";
import { reactiveOmit as f } from "@vueuse/core";
import { ToggleGroupItem as p, useForwardProps as m } from "reka-ui";
//#region src/sdk/component-ui/toggle-group/ToggleGroupItem.vue?vue&type=script&setup=true&lang.ts
var h = /* @__PURE__ */ r({
	__name: "ToggleGroupItem",
	props: {
		value: {},
		disabled: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		variant: {},
		size: {}
	},
	setup(r) {
		let h = r, g = a("toggleGroup"), _ = m(f(h, "class", "size", "variant"));
		return (a, f) => (c(), n(u(p), o({
			"data-slot": "toggle-group-item",
			"data-variant": u(g)?.variant || r.variant,
			"data-size": u(g)?.size || r.size,
			"data-spacing": u(g)?.spacing
		}, u(_), { class: u(e)("group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t", u(t)({
			variant: u(g)?.variant || r.variant,
			size: u(g)?.size || r.size
		}), h.class) }), {
			default: d((e) => [l(a.$slots, "default", s(i(e)))]),
			_: 3
		}, 16, [
			"data-variant",
			"data-size",
			"data-spacing",
			"class"
		]));
	}
});
//#endregion
export { h as default };
