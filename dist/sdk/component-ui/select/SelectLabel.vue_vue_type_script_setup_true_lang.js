import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { SelectLabel as c } from "reka-ui";
//#region src/sdk/component-ui/select/SelectLabel.vue?vue&type=script&setup=true&lang.ts
var l = /* @__PURE__ */ n({
	__name: "SelectLabel",
	props: {
		for: {},
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
	setup(n) {
		let l = n;
		return (n, u) => (i(), t(o(c), {
			"data-slot": "select-label",
			class: r(o(e)("text-muted-foreground px-1.5 py-1 text-xs", l.class))
		}, {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 8, ["class"]));
	}
});
//#endregion
export { l as default };
