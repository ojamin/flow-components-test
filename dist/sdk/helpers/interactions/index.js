//#region src/sdk/helpers/interactions/index.ts
var e = new Set([
	"Enter",
	" ",
	"Spacebar"
]);
function t(t) {
	return e.has(t.key);
}
function n(e, t, n, r = {}) {
	if (t <= 0) return -1;
	let i = a(n, r.orientation ?? "both");
	if (i === 0) return o(e, t);
	let s = o(e, t) + i;
	return r.wrap ? (s + t) % t : Math.min(Math.max(s, 0), t - 1);
}
function r(e, t) {
	return [e ? s(e) : "", ...t.map(s)].filter(Boolean).join("-");
}
function i(e) {
	let t = c(e.kind), n = [e.label || t];
	return e.seriesName && n.push(`series ${e.seriesName}`), (e.rowLabel || e.columnLabel) && (n.push(`row ${e.rowLabel ?? "unknown"}`), n.push(`column ${e.columnLabel ?? "unknown"}`)), e.value !== void 0 && e.value !== null && n.push(`value ${e.value}`), e.index !== void 0 && e.total !== void 0 && n.push(`${e.index + 1} of ${e.total}`), n.join(", ");
}
function a(e, t) {
	if (t !== "vertical") {
		if (e === "ArrowRight") return 1;
		if (e === "ArrowLeft") return -1;
	}
	if (t !== "horizontal") {
		if (e === "ArrowDown") return 1;
		if (e === "ArrowUp") return -1;
	}
	return 0;
}
function o(e, t) {
	return Number.isInteger(e) ? Math.min(Math.max(e, 0), t - 1) : 0;
}
function s(e) {
	return e == null || e === "" ? "none" : String(e).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "none";
}
function c(e) {
	switch (e) {
		case "slice": return "Slice";
		case "cell": return "Cell";
		case "region": return "Region";
		case "graph": return "Graph item";
		case "geo": return "Geographic point";
		default: return "Datum";
	}
}
//#endregion
export { i as createAriaLabel, r as createInteractiveKey, n as getNextArrowNavigationIndex, t as isActivationKey };
