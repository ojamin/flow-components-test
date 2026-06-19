import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, guardReactiveProps as r, mergeProps as i, normalizeProps as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { TabsRoot as d, useForwardPropsEmits as f } from "reka-ui";
//#region src/sdk/component-ui/tabs/Tabs.vue?vue&type=script&setup=true&lang.ts
var p = /* @__PURE__ */ n({
	__name: "Tabs",
	props: {
		defaultValue: {},
		orientation: {},
		dir: {},
		activationMode: {},
		modelValue: {},
		unmountOnHide: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	emits: ["update:modelValue"],
	setup(n, { emit: p }) {
		let m = n, h = p, g = f(u(m, "class"), h);
		return (n, u) => (o(), t(c(d), i({
			"data-slot": "tabs",
			"data-orientation": c(g).orientation || "horizontal"
		}, c(g), { class: c(e)("gap-2 group/tabs flex data-horizontal:flex-col", m.class) }), {
			default: l((e) => [s(n.$slots, "default", a(r(e)))]),
			_: 3
		}, 16, ["data-orientation", "class"]));
	}
});
//#endregion
export { p as default };
