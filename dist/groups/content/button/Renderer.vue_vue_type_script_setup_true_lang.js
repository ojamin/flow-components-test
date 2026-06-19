import { resolveSafeHref as e } from "../../../sdk/content-primitives.js";
import { buttonConfigDefaults as t } from "./types.js";
import n from "../../../sdk/component-ui/button/Button.js";
import { Icon as r } from "../../../sdk/component-ui-primitives.js";
import { computed as i, createBlock as a, createCommentVNode as o, createElementBlock as s, createElementVNode as c, defineComponent as l, normalizeClass as u, openBlock as d, toDisplayString as f, unref as p, useId as m, withCtx as h } from "vue";
//#region src/groups/content/button/Renderer.vue?vue&type=script&setup=true&lang.ts
var g = [
	"href",
	"aria-label",
	"rel",
	"target"
], _ = { key: 1 }, v = { key: 1 }, y = ["id"], b = "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap border font-medium outline-none transition-all focus-visible:border-ct-focus-ring focus-visible:ring-2 focus-visible:ring-ct-focus-ring/45 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-75 active:translate-y-px disabled:active:translate-y-0", x = /* @__PURE__ */ l({
	__name: "Renderer",
	props: {
		config: {},
		label: {},
		fixtureData: {},
		runtimeOutputs: {},
		runtimeInputIds: {},
		updateRuntimeOutputs: { type: Function },
		device: {},
		themeContext: {},
		emitEvent: { type: Function },
		renderMode: {},
		diagnostics: {},
		datasetDerivationService: {}
	},
	setup(l) {
		let x = l, S = m(), C = i(() => ({
			...t,
			...x.config
		})), w = i(() => C.value.label.trim()), T = i(() => C.value.leadingIcon.trim()), E = i(() => C.value.trailingIcon.trim()), D = i(() => !!(T.value || E.value)), O = i(() => D.value && (C.value.size === "icon" || !w.value)), k = i(() => C.value.accessibleLabel.trim()), A = i(() => e(C.value.href)), j = i(() => A.value.state === "valid" ? A.value.href : ""), M = i(() => C.value.disabled || A.value.state !== "valid"), N = i(() => w.value || k.value || x.fixtureData?.emptyLabel || "Add a button label"), P = i(() => w.value || (D.value ? "" : k.value)), F = i(() => {
			if (k.value) return k.value;
			if (O.value) return N.value;
		}), I = i(() => C.value.disabledReason.trim()), L = i(() => I.value ? S : void 0), R = i(() => C.value.target === "blank" ? "_blank" : void 0), z = i(() => C.value.target === "blank" ? "noreferrer noopener" : void 0), B = i(() => C.value.size === "xs" ? "h-6 gap-1 rounded-md px-2 text-xs" : C.value.size === "sm" ? "h-7 gap-1 rounded-md px-2.5 text-[0.8rem]" : C.value.size === "lg" ? "h-9 gap-1.5 rounded-lg px-3 text-sm" : C.value.size === "icon" ? "size-8 rounded-lg p-0 text-sm" : "h-8 gap-1.5 rounded-lg px-2.5 text-sm"), V = i(() => C.value.size === "xs" || C.value.size === "sm" ? "size-3.5 shrink-0" : "size-4 shrink-0"), H = i(() => C.value.variant === "link" ? `${b} ${B.value} border-ct-border/0 bg-transparent text-ct-foreground underline decoration-ct-accent/70 underline-offset-4 hover:bg-transparent hover:text-ct-foreground hover:decoration-ct-accent focus-visible:border-ct-focus-ring disabled:text-ct-foreground-muted` : C.value.variant === "ghost" ? `${b} ${B.value} border-ct-border/0 bg-transparent text-ct-foreground hover:bg-ct-surface-muted hover:text-ct-foreground focus-visible:border-ct-focus-ring disabled:bg-transparent disabled:text-ct-foreground-muted` : C.value.variant === "outline" ? `${b} ${B.value} border-ct-input bg-transparent text-ct-foreground hover:border-ct-accent hover:bg-ct-surface-muted hover:text-ct-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted` : C.value.variant === "secondary" ? `${b} ${B.value} border-ct-secondary bg-ct-secondary text-ct-secondary-foreground hover:bg-ct-secondary/80 hover:text-ct-secondary-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted` : C.value.variant === "destructive" ? `${b} ${B.value} border-ct-destructive bg-ct-destructive text-ct-destructive-foreground hover:bg-ct-destructive/85 hover:text-ct-destructive-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted` : `${b} ${B.value} border-ct-accent bg-ct-accent text-ct-accent-foreground hover:bg-ct-accent/80 hover:text-ct-accent-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted`);
		function U() {
			if (M.value) return;
			let e = (/* @__PURE__ */ new Date()).toISOString();
			x.emitEvent?.("clicked", { at: e });
			let t = C.value.requestedViewId.trim();
			t && x.emitEvent?.("viewRequested", { activeViewId: t });
		}
		return (e, t) => !M.value && (w.value || F.value) ? (d(), a(p(n), {
			key: 0,
			"as-child": "",
			size: C.value.size,
			variant: "unstyled",
			class: u(H.value)
		}, {
			default: h(() => [c("a", {
				href: j.value,
				"aria-label": F.value,
				rel: z.value,
				target: R.value,
				"data-testid": "button-link",
				onClick: U
			}, [
				T.value ? (d(), a(p(r), {
					key: 0,
					icon: T.value,
					class: u(V.value),
					"aria-hidden": "true",
					"data-testid": "button-leading-icon"
				}, null, 8, ["icon", "class"])) : o("", !0),
				P.value && !O.value ? (d(), s("span", _, f(P.value), 1)) : o("", !0),
				E.value ? (d(), a(p(r), {
					key: 2,
					icon: E.value,
					class: u(V.value),
					"aria-hidden": "true",
					"data-testid": "button-trailing-icon"
				}, null, 8, ["icon", "class"])) : o("", !0)
			], 8, g)]),
			_: 1
		}, 8, ["size", "class"])) : (d(), a(p(n), {
			key: 1,
			disabled: "",
			size: C.value.size,
			variant: "unstyled",
			class: u(H.value),
			"aria-label": F.value,
			"aria-describedby": L.value,
			"data-testid": "button-disabled",
			type: "button"
		}, {
			default: h(() => [
				T.value ? (d(), a(p(r), {
					key: 0,
					icon: T.value,
					class: u(V.value),
					"aria-hidden": "true",
					"data-testid": "button-leading-icon"
				}, null, 8, ["icon", "class"])) : o("", !0),
				O.value ? o("", !0) : (d(), s("span", v, f(N.value), 1)),
				E.value ? (d(), a(p(r), {
					key: 2,
					icon: E.value,
					class: u(V.value),
					"aria-hidden": "true",
					"data-testid": "button-trailing-icon"
				}, null, 8, ["icon", "class"])) : o("", !0),
				I.value ? (d(), s("span", {
					key: 3,
					id: p(S),
					class: "sr-only"
				}, f(I.value), 9, y)) : o("", !0)
			]),
			_: 1
		}, 8, [
			"size",
			"class",
			"aria-label",
			"aria-describedby"
		]));
	}
});
//#endregion
export { x as default };
