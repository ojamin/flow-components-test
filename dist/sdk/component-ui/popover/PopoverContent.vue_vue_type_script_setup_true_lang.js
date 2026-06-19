import { cn as e } from "../cn.js";
import { createBlock as t, createVNode as n, defineComponent as r, mergeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { reactiveOmit as l } from "@vueuse/core";
import { PopoverContent as u, PopoverPortal as d, useForwardPropsEmits as f } from "reka-ui";
//#region src/sdk/component-ui/popover/PopoverContent.vue?vue&type=script&setup=true&lang.ts
var p = /* @__PURE__ */ r({
	inheritAttrs: !1,
	__name: "PopoverContent",
	props: {
		forceMount: { type: Boolean },
		side: {},
		sideOffset: { default: 4 },
		sideFlip: { type: Boolean },
		align: { default: "center" },
		alignOffset: {},
		alignFlip: { type: Boolean },
		avoidCollisions: { type: Boolean },
		collisionBoundary: {},
		collisionPadding: {},
		arrowPadding: {},
		hideShiftedArrow: { type: Boolean },
		sticky: {},
		hideWhenDetached: { type: Boolean },
		positionStrategy: {},
		updatePositionStrategy: {},
		disableUpdateOnLayoutShift: { type: Boolean },
		prioritizePosition: { type: Boolean },
		reference: {},
		asChild: { type: Boolean },
		as: {},
		disableOutsidePointerEvents: { type: Boolean },
		class: { type: [
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
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(r, { emit: p }) {
		let m = r, h = p, g = f(l(m, "class", "disablePortal"), h);
		return (r, l) => (a(), t(s(d), { disabled: m.disablePortal }, {
			default: c(() => [n(s(u), i({ "data-slot": "popover-content" }, {
				...r.$attrs,
				...s(g)
			}, { class: s(e)("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 flex w-72 origin-(--reka-popover-content-transform-origin) flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 outline-hidden duration-100", m.class) }), {
				default: c(() => [o(r.$slots, "default")]),
				_: 3
			}, 16, ["class"])]),
			_: 3
		}, 8, ["disabled"]));
	}
});
//#endregion
export { p as default };
