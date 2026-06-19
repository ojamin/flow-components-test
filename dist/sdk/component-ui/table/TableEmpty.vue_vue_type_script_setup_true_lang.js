import { cn as e } from "../cn.js";
import t from "./TableCell.js";
import n from "./TableRow.js";
import { createBlock as r, createElementVNode as i, createVNode as a, defineComponent as o, mergeProps as s, openBlock as c, renderSlot as l, unref as u, withCtx as d } from "vue";
import { reactiveOmit as f } from "@vueuse/core";
//#region src/sdk/component-ui/table/TableEmpty.vue?vue&type=script&setup=true&lang.ts
var p = { class: "flex items-center justify-center py-10" }, m = /* @__PURE__ */ o({
	__name: "TableEmpty",
	props: {
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		colspan: { default: 1 }
	},
	setup(o) {
		let m = o, h = f(m, "class");
		return (o, f) => (c(), r(n, null, {
			default: d(() => [a(t, s({ class: u(e)("p-4 whitespace-nowrap align-middle text-sm text-foreground", m.class) }, u(h)), {
				default: d(() => [i("div", p, [l(o.$slots, "default")])]),
				_: 3
			}, 16, ["class"])]),
			_: 3
		}));
	}
});
//#endregion
export { m as default };
