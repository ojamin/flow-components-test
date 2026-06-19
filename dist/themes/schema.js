import { z as e } from "zod";
//#region src/themes/schema.ts
var t = /* @__PURE__ */ "pageBackground.surface.cardForeground.popover.popoverForeground.surfaceMuted.foreground.foregroundMuted.border.accent.accentForeground.secondary.secondaryForeground.accentSubtle.accentSubtleForeground.focusRing.destructive.destructiveForeground.input.sidebar.sidebarForeground.sidebarPrimary.sidebarPrimaryForeground.sidebarAccent.sidebarAccentForeground.sidebarBorder.sidebarRing.warning.info.success.chart1.chart2.chart3.chart4.chart5".split("."), n = [
	"body",
	"heading",
	"mono"
], r = [
	"none",
	"sm",
	"md",
	"lg",
	"xl",
	"full"
], i = [
	"none",
	"sm",
	"md",
	"lg",
	"xl"
], a = [
	"durationFastMs",
	"durationNormalMs",
	"easing"
], o = [
	"sm",
	"md",
	"lg"
], s = e.literal(1), c = e.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, "Expected a stable lowercase kebab-case theme id"), l = e.string().refine((e) => e.trim().length > 0, { message: "Expected a non-empty string" });
function u(t) {
	return e.strictObject(Object.fromEntries(t.map((e) => [e, l.optional()])));
}
var d = e.number().int().nonnegative().finite(), f = e.strictObject({
	pageBackground: l,
	surface: l,
	cardForeground: l.optional(),
	popover: l.optional(),
	popoverForeground: l.optional(),
	surfaceMuted: l,
	foreground: l,
	foregroundMuted: l,
	border: l,
	accent: l,
	accentForeground: l,
	secondary: l.optional(),
	secondaryForeground: l.optional(),
	accentSubtle: l.optional(),
	accentSubtleForeground: l.optional(),
	focusRing: l,
	destructive: l,
	destructiveForeground: l.optional(),
	input: l.optional(),
	sidebar: l.optional(),
	sidebarForeground: l.optional(),
	sidebarPrimary: l.optional(),
	sidebarPrimaryForeground: l.optional(),
	sidebarAccent: l.optional(),
	sidebarAccentForeground: l.optional(),
	sidebarBorder: l.optional(),
	sidebarRing: l.optional(),
	warning: l,
	info: l,
	success: l,
	chart1: l,
	chart2: l,
	chart3: l,
	chart4: l,
	chart5: l
}), p = e.strictObject({
	body: l,
	heading: l,
	mono: l
}), m = e.strictObject({
	none: l,
	sm: l,
	md: l,
	lg: l,
	xl: l.optional(),
	full: l.optional()
}), h = e.strictObject({
	none: l,
	sm: l,
	md: l,
	lg: l,
	xl: l
}), g = e.strictObject({
	durationFastMs: d,
	durationNormalMs: d,
	easing: l
}), _ = e.strictObject({
	sm: l,
	md: l,
	lg: l
}), v = u(t), y = u(n), b = u(r), x = u(i), S = u(o), C = e.strictObject({
	color: f,
	font: p,
	radius: m,
	spacing: h,
	motion: g,
	shadow: _.optional()
}), w = e.strictObject({
	color: v.optional(),
	font: y.optional(),
	radius: b.optional(),
	spacing: x.optional(),
	motion: g.partial().optional(),
	shadow: S.optional()
}), T = e.strictObject({
	light: w.optional(),
	dark: w.optional()
}), E = e.strictObject({
	version: s,
	id: c,
	displayName: l,
	description: e.string().optional(),
	properties: C,
	palettes: T.optional()
}), D = e.strictObject({
	themeId: c.optional(),
	properties: C
});
//#endregion
export { f as componentThemeColorMapSchema, t as componentThemeColorRoles, D as componentThemeContextSchema, p as componentThemeFontMapSchema, n as componentThemeFontRoles, c as componentThemeIdSchema, a as componentThemeMotionRoles, g as componentThemeMotionSchema, w as componentThemePalettePropertiesSchema, T as componentThemePalettesSchema, v as componentThemePartialColorMapSchema, y as componentThemePartialFontMapSchema, b as componentThemePartialRadiusMapSchema, S as componentThemePartialShadowMapSchema, x as componentThemePartialSpacingMapSchema, C as componentThemePropertiesSchema, m as componentThemeRadiusMapSchema, r as componentThemeRadiusRoles, E as componentThemeSchema, _ as componentThemeShadowMapSchema, o as componentThemeShadowRoles, h as componentThemeSpacingMapSchema, i as componentThemeSpacingRoles, s as componentThemeVersionSchema };
