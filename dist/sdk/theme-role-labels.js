import { componentThemeColorRoles as e, componentThemeFontRoles as t, componentThemeMotionRoles as n, componentThemeRadiusRoles as r, componentThemeShadowRoles as i, componentThemeSpacingRoles as a } from "../themes/schema.js";
import { componentThemePropertyKeys as o, themeRoleKeyToCssVariableSuffix as s } from "./theme.js";
//#region src/sdk/theme-role-labels.ts
var c = {
	pageBackground: "Page background",
	surface: "Surface",
	cardForeground: "Card foreground",
	popover: "Popover",
	popoverForeground: "Popover foreground",
	surfaceMuted: "Muted surface",
	foreground: "Foreground",
	foregroundMuted: "Muted foreground",
	border: "Border",
	accent: "Accent",
	accentForeground: "Accent foreground",
	secondary: "Secondary",
	secondaryForeground: "Secondary foreground",
	accentSubtle: "Subtle accent",
	accentSubtleForeground: "Subtle accent foreground",
	focusRing: "Focus ring",
	destructive: "Destructive",
	destructiveForeground: "Destructive foreground",
	input: "Input",
	sidebar: "Sidebar",
	sidebarForeground: "Sidebar foreground",
	sidebarPrimary: "Sidebar primary",
	sidebarPrimaryForeground: "Sidebar primary foreground",
	sidebarAccent: "Sidebar accent",
	sidebarAccentForeground: "Sidebar accent foreground",
	sidebarBorder: "Sidebar border",
	sidebarRing: "Sidebar ring",
	warning: "Warning",
	info: "Info",
	success: "Success",
	chart1: "Chart 1",
	chart2: "Chart 2",
	chart3: "Chart 3",
	chart4: "Chart 4",
	chart5: "Chart 5"
}, l = {
	body: "Body",
	heading: "Heading",
	mono: "Mono"
}, u = {
	none: "None",
	sm: "Small",
	md: "Medium",
	lg: "Large",
	xl: "Extra large",
	full: "Full / pill"
}, d = {
	none: "None",
	sm: "Small",
	md: "Medium",
	lg: "Large",
	xl: "Extra large"
}, f = {
	durationFastMs: "Duration · fast",
	durationNormalMs: "Duration · normal",
	easing: "Easing"
}, p = {
	sm: "Small",
	md: "Medium",
	lg: "Large"
}, m = {
	color: "Color",
	font: "Font",
	radius: "Radius",
	spacing: "Spacing",
	motion: "Motion",
	shadow: "Shadow"
}, h = {
	color: c,
	font: l,
	radius: u,
	spacing: d,
	motion: f,
	shadow: p
}, g = {
	color: e,
	font: t,
	radius: r,
	spacing: a,
	motion: n,
	shadow: i
};
function _(e) {
	let [t, n] = e.split(".");
	return {
		group: t,
		groupLabel: m[t],
		role: n,
		roleLabel: h[t][n] ?? n
	};
}
function v(e) {
	return e.flatMap((e) => g[e].map((t) => `${e}.${t}`));
}
function y(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		let [e] = r.split(".");
		t.has(e) || (t.add(e), n.push(e));
	}
	return n;
}
function b(e) {
	if (e.startsWith("color.")) return `bg-ct-${s(e.slice(6))}`;
}
var x = /* @__PURE__ */ "bg-ct-page-background.bg-ct-surface.bg-ct-card-foreground.bg-ct-popover.bg-ct-popover-foreground.bg-ct-surface-muted.bg-ct-foreground.bg-ct-foreground-muted.bg-ct-border.bg-ct-accent.bg-ct-accent-foreground.bg-ct-secondary.bg-ct-secondary-foreground.bg-ct-accent-subtle.bg-ct-accent-subtle-foreground.bg-ct-focus-ring.bg-ct-destructive.bg-ct-destructive-foreground.bg-ct-input.bg-ct-sidebar.bg-ct-sidebar-foreground.bg-ct-sidebar-primary.bg-ct-sidebar-primary-foreground.bg-ct-sidebar-accent.bg-ct-sidebar-accent-foreground.bg-ct-sidebar-border.bg-ct-sidebar-ring.bg-ct-warning.bg-ct-info.bg-ct-success.bg-ct-chart1.bg-ct-chart2.bg-ct-chart3.bg-ct-chart4.bg-ct-chart5".split(".");
for (let e of o) {
	let [t, n] = e.split(".");
	if (!Object.prototype.hasOwnProperty.call(h[t], n)) throw Error(`componentTheme*RoleLabels is missing a label for "${e}". Update theme-role-labels.ts when adding a new role.`);
}
//#endregion
export { b as colorRoleSwatchClass, x as colorRoleSwatchClassNames, c as componentThemeColorRoleLabels, l as componentThemeFontRoleLabels, f as componentThemeMotionRoleLabels, m as componentThemePropertyGroupLabels, u as componentThemeRadiusRoleLabels, p as componentThemeShadowRoleLabels, d as componentThemeSpacingRoleLabels, y as deriveThemePropertyGroupsFromKeys, _ as describeThemePropertyKey, v as listThemePropertyKeysForGroups };
