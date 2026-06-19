import { cn as e } from "../cn.js";
import { createBlock as t, createVNode as n, defineComponent as r, mergeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { reactiveOmit as l } from "@vueuse/core";
import { DropdownMenuContent as u, DropdownMenuPortal as d, useForwardPropsEmits as f } from "reka-ui";
//#region src/sdk/component-ui/dropdown-menu/DropdownMenuContent.vue?vue&type=script&setup=true&lang.ts
var p = /* @__PURE__ */ r({
	inheritAttrs: !1,
	__name: "DropdownMenuContent",
	props: {
		forceMount: { type: Boolean },
		loop: { type: Boolean },
		side: {},
		sideOffset: { default: 4 },
		sideFlip: { type: Boolean },
		align: { default: "start" },
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
		"closeAutoFocus"
	],
	setup(r, { emit: p }) {
		let m = r, h = p, g = f(l(m, "class", "disablePortal"), h);
		return (r, l) => (a(), t(s(d), { disabled: m.disablePortal }, {
			default: c(() => [n(s(u), i({ "data-slot": "dropdown-menu-content" }, {
				...r.$attrs,
				...s(g)
			}, { class: s(e)("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-lg p-1 shadow-md ring-1 duration-100 cn-menu-translucent z-50 max-h-(--reka-dropdown-menu-content-available-height) w-(--reka-dropdown-menu-trigger-width) origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto data-[state=closed]:overflow-hidden", m.class) }), {
				default: c(() => [o(r.$slots, "default")]),
				_: 3
			}, 16, ["class"])]),
			_: 3
		}, 8, ["disabled"]));
	}
});
//#endregion
export { p as default };
