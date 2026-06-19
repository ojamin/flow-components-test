import { cn as e } from "../cn.js";
import { badgeVariants as t } from "./index.js";
import { computed as n, createBlock as r, defineComponent as i, mergeProps as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { Primitive as d } from "reka-ui";
//#region src/sdk/component-ui/badge/Badge.vue?vue&type=script&setup=true&lang.ts
var f = /* @__PURE__ */ i({
	__name: "Badge",
	props: {
		asChild: { type: Boolean },
		as: {},
		variant: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(i) {
		let f = i, p = u(f, "class"), m = n(() => f.variant === "unstyled" ? void 0 : t({ variant: f.variant }));
		return (t, n) => (o(), r(c(d), a({
			"data-slot": "badge",
			"data-variant": i.variant,
			class: c(e)(m.value, f.class)
		}, c(p)), {
			default: l(() => [s(t.$slots, "default")]),
			_: 3
		}, 16, ["data-variant", "class"]));
	}
});
//#endregion
export { f as default };
