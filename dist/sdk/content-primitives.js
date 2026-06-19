//#region src/sdk/content-primitives.ts
var e = [
	"left",
	"center",
	"right"
], t = [
	"foregroundMuted",
	"chart1",
	"chart2",
	"chart3",
	"chart4",
	"chart5"
], n = [
	"none",
	"xs",
	"sm",
	"md",
	"lg",
	"xl"
], r = [
	"sm",
	"base",
	"lg"
], i = [
	"none",
	"2",
	"3",
	"4",
	"5",
	"6"
], a = [
	"cover",
	"contain",
	"fill",
	"none"
], o = [
	"auto",
	"square",
	"video",
	"landscape",
	"portrait"
], s = [
	"default",
	"secondary",
	"outline",
	"ghost",
	"link"
], c = [
	"xs",
	"sm",
	"default",
	"lg"
], l = ["self", "blank"], u = [
	"hairline",
	"thin",
	"medium",
	"thick"
], d = {
	left: "items-start text-left",
	center: "items-center text-center",
	right: "items-end text-right"
}, f = {
	left: "text-left",
	center: "text-center",
	right: "text-right"
}, p = {
	left: "mr-auto",
	center: "mx-auto",
	right: "ml-auto"
}, m = {
	foregroundMuted: "bg-ct-foreground-muted",
	chart1: "bg-ct-chart1",
	chart2: "bg-ct-chart2",
	chart3: "bg-ct-chart3",
	chart4: "bg-ct-chart4",
	chart5: "bg-ct-chart5"
}, h = {
	foregroundMuted: "color.foregroundMuted",
	chart1: "color.chart1",
	chart2: "color.chart2",
	chart3: "color.chart3",
	chart4: "color.chart4",
	chart5: "color.chart5"
}, g = {
	none: "mb-0",
	xs: "mb-1",
	sm: "mb-2",
	md: "mb-4",
	lg: "mb-6",
	xl: "mb-8"
}, _ = {
	none: "my-0",
	xs: "my-1",
	sm: "my-2",
	md: "my-4",
	lg: "my-6",
	xl: "my-8"
}, v = {
	sm: "prose-sm",
	base: "",
	lg: "prose-lg"
}, y = {
	none: "",
	2: "line-clamp-2",
	3: "line-clamp-3",
	4: "line-clamp-4",
	5: "line-clamp-5",
	6: "line-clamp-6"
}, b = {
	cover: "object-cover",
	contain: "object-contain",
	fill: "object-fill",
	none: "object-none"
}, x = {
	auto: "aspect-auto",
	square: "aspect-square",
	video: "aspect-video",
	landscape: "aspect-[4/3]",
	portrait: "aspect-[3/4]"
}, S = {
	hairline: "h-px",
	thin: "h-0.5",
	medium: "h-1",
	thick: "h-1.5"
}, C = /^(\/(?!\/)|\.{1,2}\/|\?|#)/, w = /^[^/:?#]+(?:[/?#].*)?$/, T = /^(https?:|mailto:|tel:)/i, E = /^(https?:|blob:|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i;
function D(e = "left") {
	return d[e];
}
function O(e = "left") {
	return f[e];
}
function k(e = "left") {
	return p[e];
}
function A(e = "foregroundMuted") {
	return m[e];
}
function j(e = "md") {
	return g[e];
}
function M(e = "md") {
	return _[e];
}
function N(e = "base") {
	return v[e];
}
function P(e = "none") {
	return y[e];
}
function F(e = "cover") {
	return b[e];
}
function I(e = "landscape") {
	return x[e];
}
function L(e = "thin") {
	return S[e];
}
function R(e) {
	let t = e.trim();
	return t ? T.test(t) || C.test(t) || w.test(t) ? {
		state: "valid",
		href: t
	} : { state: "unsafe" } : { state: "missing" };
}
function z(e) {
	let t = e.trim();
	if (!t) return null;
	try {
		let e = typeof document < "u" ? document.baseURI : void 0;
		return new URL(t, e).toString();
	} catch {
		return null;
	}
}
function B(e) {
	let t = e.trim();
	return t ? E.test(t) || C.test(t) || w.test(t) ? {
		state: "valid",
		src: t
	} : { state: "unsafe" } : { state: "missing" };
}
//#endregion
export { c as buttonSizeOptions, l as buttonTargetOptions, s as buttonVariantOptions, i as clampLineOptions, e as contentAlignOptions, n as contentSpacingOptions, t as contentToneOptions, h as contentToneThemeRoleByTone, u as dividerThicknessOptions, o as imageAspectRatioOptions, a as imageObjectFitOptions, r as proseSizeOptions, P as resolveClampLinesClass, k as resolveContentAccentAlignmentClass, D as resolveContentAlignClass, O as resolveContentTextAlignClass, A as resolveContentToneAccentClass, L as resolveDividerThicknessClass, I as resolveImageAspectRatioClass, F as resolveImageObjectFitClass, j as resolveMarginBottomClass, M as resolveMarginYClass, N as resolveProseSizeClass, R as resolveSafeHref, B as resolveSafeImageSrc, z as toAbsoluteUrlString };
