import { StatusBadgeConfigDefaults as e } from "./types.js";
import { computed as t, createCommentVNode as n, createElementBlock as r, createElementVNode as i, defineComponent as a, normalizeClass as o, openBlock as s, toDisplayString as c } from "vue";
//#region src/groups/content/status-badge/Renderer.vue?vue&type=script&setup=true&lang.ts
var l = { class: "w-full" }, u = ["aria-label"], d = {
	key: 0,
	class: "truncate text-ct-foreground-muted",
	"data-testid": "status-badge-label"
}, f = {
	key: 1,
	class: "text-ct-foreground-muted",
	"aria-hidden": "true"
}, p = {
	key: 2,
	class: "truncate text-ct-foreground",
	"data-testid": "status-badge-value"
}, m = {
	key: 1,
	class: "inline-flex items-center rounded-lg border border-dashed border-ct-border px-3 py-2 text-sm text-ct-foreground-muted",
	"data-testid": "status-badge-empty-state"
}, h = /* @__PURE__ */ a({
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
	setup(a) {
		let h = a, g = t(() => ({
			...e,
			...h.config
		})), _ = t(() => g.value.label.trim()), v = t(() => g.value.value.trim()), y = t(() => !!(_.value || v.value)), b = t(() => {
			let e = g.value.size === "sm" ? "gap-1.5 rounded-md px-2 py-1 text-xs" : "gap-2 rounded-lg px-3 py-2 text-sm";
			return g.value.tone === "danger" ? `${e} border-ct-destructive/35 bg-ct-destructive/10 text-ct-foreground` : g.value.tone === "warning" ? `${e} border-amber-500/35 bg-amber-500/10 text-ct-foreground` : g.value.tone === "neutral" ? `${e} border-ct-border bg-ct-surface-muted text-ct-foreground` : `${e} border-ct-accent/35 bg-ct-accent/10 text-ct-foreground`;
		}), x = t(() => g.value.tone === "danger" ? "bg-ct-destructive" : g.value.tone === "warning" ? "bg-amber-500" : g.value.tone === "neutral" ? "bg-ct-foreground-muted" : "bg-ct-accent");
		return (e, t) => (s(), r("section", l, [y.value ? (s(), r("div", {
			key: 0,
			class: o(["inline-flex max-w-full items-center border font-medium shadow-sm", b.value]),
			"aria-label": [_.value, v.value].filter(Boolean).join(": "),
			"data-testid": "status-badge"
		}, [
			i("span", {
				class: o(["size-2 shrink-0 rounded-full", x.value]),
				"aria-hidden": "true"
			}, null, 2),
			_.value ? (s(), r("span", d, c(_.value), 1)) : n("", !0),
			_.value && v.value ? (s(), r("span", f, "/")) : n("", !0),
			v.value ? (s(), r("span", p, c(v.value), 1)) : n("", !0)
		], 10, u)) : (s(), r("div", m, c(h.fixtureData?.emptyStateTitle ?? "Add a status label or value."), 1))]));
	}
});
//#endregion
export { h as default };
