import { cn as e } from "../cn.js";
import t from "./SelectScrollDownButton.js";
import n from "./SelectScrollUpButton.js";
import { createBlock as r, createVNode as i, defineComponent as a, mergeProps as o, normalizeClass as s, openBlock as c, renderSlot as l, unref as u, withCtx as d } from "vue";
import { reactiveOmit as f } from "@vueuse/core";
import { SelectContent as p, SelectPortal as m, SelectViewport as h, useForwardPropsEmits as g } from "reka-ui";
//#region src/sdk/component-ui/select/SelectContent.vue?vue&type=script&setup=true&lang.ts
var _ = /* @__PURE__ */ a({
	inheritAttrs: !1,
	__name: "SelectContent",
	props: {
		forceMount: { type: Boolean },
		position: { default: "item-aligned" },
		bodyLock: { type: Boolean },
		side: {},
		sideOffset: {},
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
		"closeAutoFocus",
		"escapeKeyDown",
		"pointerDownOutside"
	],
	setup(a, { emit: _ }) {
		let v = a, y = _, b = g(f(v, "class", "disablePortal"), y);
		return (f, g) => (c(), r(u(m), { disabled: v.disablePortal }, {
			default: d(() => [i(u(p), o({
				"data-slot": "select-content",
				"data-align-trigger": a.position === "item-aligned"
			}, {
				...f.$attrs,
				...u(b)
			}, { class: u(e)("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1 duration-100 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 cn-menu-translucent relative z-50 max-h-(--reka-select-content-available-height) origin-(--reka-select-content-transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none", a.position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", v.class) }), {
				default: d(() => [
					i(u(n)),
					i(u(h), {
						"data-position": a.position,
						class: s(u(e)("data-[position=popper]:h-[var(--reka-select-trigger-height)] data-[position=popper]:w-full data-[position=popper]:min-w-[var(--reka-select-trigger-width)]"))
					}, {
						default: d(() => [l(f.$slots, "default")]),
						_: 3
					}, 8, ["data-position", "class"]),
					i(u(t))
				]),
				_: 3
			}, 16, ["data-align-trigger", "class"])]),
			_: 3
		}, 8, ["disabled"]));
	}
});
//#endregion
export { _ as default };
