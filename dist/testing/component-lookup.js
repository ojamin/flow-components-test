import { staticComponentSourceManifest as e } from "../generated/source-manifest.js";
//#region src/testing/component-lookup.ts
var t = /* @__PURE__ */ Object.assign({
	"../groups/content/button/component.ts": () => import("../groups/content/button/component.js"),
	"../groups/content/newsnight-lower-third/component.ts": () => import("../groups/content/newsnight-lower-third/component.js"),
	"../groups/content/newsnight-masthead/component.ts": () => import("../groups/content/newsnight-masthead/component.js"),
	"../groups/content/newsnight-results-wall/component.ts": () => import("../groups/content/newsnight-results-wall/component.js"),
	"../groups/content/status-badge/component.ts": () => import("../groups/content/status-badge/component.js"),
	"../groups/content/text/component.ts": () => import("../groups/content/text/component.js")
});
function n(t) {
	let n = e.components.find((e) => e.id === t);
	if (n) return n.sourcePath.replace("packages/components/src/", "../") + "/component.ts";
}
async function r(e) {
	let r = n(e), i = r ? t[r] : void 0;
	if (i) return (await i()).componentDefinition;
}
async function i(e) {
	let t = await r(e);
	if (!t) throw Error(`Unknown built-in component definition "${e}".`);
	return t;
}
//#endregion
export { r as loadBuiltInComponentDefinition, i as loadRequiredBuiltInComponentDefinition };
