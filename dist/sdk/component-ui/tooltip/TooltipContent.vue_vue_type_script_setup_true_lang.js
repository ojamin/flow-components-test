import { cn as e } from "../cn.js";
import { createBlock as t, createVNode as n, defineComponent as r, mergeProps as i, normalizeClass as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { TooltipArrow as d, TooltipContent as f, TooltipPortal as p, useForwardPropsEmits as m } from "reka-ui";
//#region src/sdk/component-ui/tooltip/TooltipContent.vue?vue&type=script&setup=true&lang.ts
var h = /* @__PURE__ */ r({
	inheritAttrs: !1,
	__name: "TooltipContent",
	props: {
		forceMount: { type: Boolean },
		ariaLabel: {},
		asChild: { type: Boolean },
		as: {},
		side: {},
		sideOffset: { default: 0 },
		align: {},
		alignOffset: {},
		avoidCollisions: { type: Boolean },
		collisionBoundary: {},
		collisionPadding: {},
		arrowPadding: {},
		sticky: {},
		hideWhenDetached: { type: Boolean },
		positionStrategy: {},
		updatePositionStrategy: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		arrowClass: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		disablePortal: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["escapeKeyDown", "pointerDownOutside"],
	setup(r, { emit: h }) {
		let g = r, _ = h, v = m(u(g, "class", "arrowClass", "disablePortal"), _);
		return (r, u) => (o(), t(c(p), { disabled: g.disablePortal }, {
			default: l(() => [n(c(f), i({ "data-slot": "tooltip-content" }, {
				...c(v),
				...r.$attrs
			}, { class: c(e)("data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm bg-foreground text-background z-50 w-fit max-w-xs origin-(--reka-tooltip-content-transform-origin)", g.class) }), {
				default: l(() => [s(r.$slots, "default"), n(c(d), {
					"data-slot": "tooltip-arrow",
					class: a(c(e)("size-2.5 rotate-45 rounded-[2px] bg-foreground fill-foreground z-50 translate-y-[calc(-50%_-_2px)]", g.arrowClass))
				}, null, 8, ["class"])]),
				_: 3
			}, 16, ["class"])]),
			_: 3
		}, 8, ["disabled"]));
	}
});
//#endregion
export { h as default };
