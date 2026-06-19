import { createBlock as e, defineComponent as t, guardReactiveProps as n, normalizeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { TooltipProvider as c } from "reka-ui";
//#region src/sdk/component-ui/tooltip/TooltipProvider.vue?vue&type=script&setup=true&lang.ts
var l = /* @__PURE__ */ t({
	__name: "TooltipProvider",
	props: {
		delayDuration: { default: 0 },
		skipDelayDuration: {},
		disableHoverableContent: { type: Boolean },
		disableClosingTrigger: { type: Boolean },
		disabled: { type: Boolean },
		ignoreNonKeyboardFocus: { type: Boolean },
		content: {}
	},
	setup(t) {
		let l = t;
		return (t, u) => (i(), e(o(c), r(n(l)), {
			default: s(() => [a(t.$slots, "default")]),
			_: 3
		}, 16));
	}
});
//#endregion
export { l as default };
