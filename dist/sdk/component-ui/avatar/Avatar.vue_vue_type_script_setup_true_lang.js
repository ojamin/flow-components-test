import { cn as e } from "../cn.js";
import { avatarVariants as t } from "./index.js";
import { createBlock as n, defineComponent as r, normalizeClass as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { AvatarRoot as l } from "reka-ui";
//#region src/sdk/component-ui/avatar/Avatar.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ r({
	__name: "Avatar",
	props: {
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		size: {}
	},
	setup(r) {
		let u = r;
		return (d, f) => (a(), n(s(l), {
			"data-slot": "avatar",
			"data-size": r.size ?? "default",
			class: i(s(e)(s(t)({ size: r.size }), u.class))
		}, {
			default: c(() => [o(d.$slots, "default")]),
			_: 3
		}, 8, ["data-size", "class"]));
	}
});
//#endregion
export { u as default };
