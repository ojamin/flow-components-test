import { NewsnightLowerThirdConfigDefaults as e } from "./types.js";
import { computed as t, createElementBlock as n, createElementVNode as r, defineComponent as i, normalizeClass as a, openBlock as o, toDisplayString as s } from "vue";
//#region src/groups/content/newsnight-lower-third/Renderer.vue?vue&type=script&setup=true&lang.ts
var c = {
	class: "w-full rounded-md border border-white/10 bg-zinc-950 p-3 text-ct-foreground shadow-2xl",
	"data-testid": "newsnight-lower-third"
}, l = { class: "overflow-hidden rounded border border-white/15 bg-black" }, u = { class: "grid gap-0 md:grid-cols-[12rem_1fr_8rem]" }, d = { class: "min-w-0 bg-zinc-900 px-5 py-4" }, f = { class: "truncate text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200" }, p = { class: "mt-1 truncate text-2xl font-black leading-tight text-white" }, m = { class: "mt-1 truncate text-sm font-medium text-zinc-300" }, h = /* @__PURE__ */ i({
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
	setup(i) {
		let h = i, g = t(() => ({
			...e,
			...h.config
		})), _ = t(() => g.value.tone === "breaking" ? "from-red-600 via-red-500 to-zinc-950" : g.value.tone === "projected" ? "from-cyan-500 via-blue-500 to-zinc-950" : g.value.tone === "hold" ? "from-amber-500 via-red-500 to-zinc-950" : "from-zinc-700 via-zinc-800 to-zinc-950");
		return (e, t) => (o(), n("section", c, [t[2] ||= r("div", { class: "mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-zinc-400" }, [r("span", null, "Lower-third preview"), r("span", { class: "rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-zinc-300" }, "Program bus / safe area")], -1), r("div", l, [r("div", { class: a(["h-1.5 bg-gradient-to-r", _.value]) }, null, 2), r("div", u, [
			t[0] ||= r("div", { class: "flex items-center justify-center bg-white px-4 py-4 text-zinc-950" }, [r("div", { class: "text-center" }, [r("p", { class: "text-xl font-black tracking-tight" }, "NEWSNIGHT"), r("p", { class: "text-[10px] font-black uppercase tracking-[0.28em]" }, "Live")])], -1),
			r("div", d, [
				r("p", f, s(g.value.eyebrow), 1),
				r("h3", p, s(g.value.headline), 1),
				r("p", m, s(g.value.subline), 1)
			]),
			t[1] ||= r("div", { class: "flex flex-col items-center justify-center border-t border-white/10 bg-zinc-950 px-3 py-4 text-center md:border-l md:border-t-0" }, [r("p", { class: "font-mono text-lg font-black text-white" }, "A-12"), r("p", { class: "text-[10px] uppercase tracking-[0.22em] text-zinc-500" }, "Armed")], -1)
		])])]));
	}
});
//#endregion
export { h as default };
