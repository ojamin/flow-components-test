import { NewsnightMastheadConfigDefaults as e } from "./types.js";
import { Fragment as t, computed as n, createElementBlock as r, createElementVNode as i, defineComponent as a, normalizeClass as o, openBlock as s, renderList as c, toDisplayString as l } from "vue";
//#region src/groups/content/newsnight-masthead/Renderer.vue?vue&type=script&setup=true&lang.ts
var u = {
	class: "w-full overflow-hidden rounded-md border border-white/10 bg-zinc-950 text-ct-foreground shadow-2xl",
	"data-testid": "newsnight-masthead"
}, d = { class: "flex min-h-16 items-center justify-between gap-4 border-b border-white/10 px-5 py-3" }, f = { class: "flex min-w-0 items-center gap-4" }, p = { class: "min-w-0" }, m = { class: "flex items-center gap-3" }, h = { class: "truncate text-xl font-black uppercase tracking-wide text-white" }, g = { class: "truncate text-xs font-medium uppercase tracking-[0.22em] text-zinc-400" }, _ = { class: "flex shrink-0 items-center gap-2 text-xs" }, v = { class: "rounded border border-white/10 bg-white/5 px-3 py-2 text-right" }, y = { class: "font-mono text-sm font-semibold text-white" }, b = { class: "font-black uppercase tracking-wide text-white" }, x = { class: "grid gap-0 border-b border-white/10 bg-white/[0.03] text-xs md:grid-cols-[1fr_auto]" }, S = { class: "flex min-w-0 items-center gap-3 overflow-hidden px-5 py-2" }, C = { class: "flex min-w-0 items-center gap-5 overflow-hidden whitespace-nowrap" }, w = { class: "border-t border-white/10 px-5 py-2 text-zinc-400 md:border-t-0 md:border-l" }, T = /* @__PURE__ */ a({
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
		let T = a, E = n(() => ({
			...e,
			...T.config
		})), D = n(() => E.value.ticker.split("|").map((e) => e.trim()).filter(Boolean)), O = n(() => E.value.mode === "air" ? "border-ct-destructive/60 bg-ct-destructive/15" : E.value.mode === "standby" ? "border-amber-400/50 bg-amber-400/10" : "border-cyan-300/50 bg-cyan-300/10");
		return (e, n) => (s(), r("section", u, [i("div", d, [i("div", f, [n[1] ||= i("div", {
			class: "grid size-10 shrink-0 place-items-center rounded-sm bg-white text-[10px] font-black leading-none tracking-tighter text-zinc-950",
			"aria-hidden": "true"
		}, " NN ", -1), i("div", p, [i("div", m, [i("p", h, l(E.value.brand), 1), n[0] ||= i("span", { class: "rounded-sm bg-ct-destructive px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white" }, " Live ", -1)]), i("p", g, l(E.value.edition), 1)])]), i("div", _, [i("div", v, [i("p", y, l(E.value.timestamp), 1), n[2] ||= i("p", { class: "text-[10px] uppercase tracking-wider text-zinc-500" }, "Control clock", -1)]), i("div", { class: o(["rounded border px-3 py-2 text-right", O.value]) }, [i("p", b, l(E.value.mode), 1), n[3] ||= i("p", { class: "text-[10px] uppercase tracking-wider text-zinc-400" }, "Mode", -1)], 2)])]), i("div", x, [i("div", S, [n[4] ||= i("span", { class: "shrink-0 font-black uppercase tracking-widest text-ct-destructive" }, "Breaking", -1), i("div", C, [(s(!0), r(t, null, c(D.value, (e) => (s(), r("span", {
			key: e,
			class: "min-w-0 text-zinc-200 after:ml-5 after:text-zinc-600 after:content-['/']"
		}, l(e), 1))), 128))])]), i("div", w, l(E.value.freshness), 1)])]));
	}
});
//#endregion
export { T as default };
