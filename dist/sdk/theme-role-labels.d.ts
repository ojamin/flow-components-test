import { type ComponentThemeColorRole, type ComponentThemeFontRole, type ComponentThemeMotionRole, type ComponentThemeRadiusRole, type ComponentThemeShadowRole, type ComponentThemeSpacingRole } from "../themes/index.js";
import { type ComponentThemePropertyGroup, type ThemePropertyKey } from "./theme.js";
export declare const componentThemeColorRoleLabels: Record<ComponentThemeColorRole, string>;
export declare const componentThemeFontRoleLabels: Record<ComponentThemeFontRole, string>;
export declare const componentThemeRadiusRoleLabels: Record<ComponentThemeRadiusRole, string>;
export declare const componentThemeSpacingRoleLabels: Record<ComponentThemeSpacingRole, string>;
export declare const componentThemeMotionRoleLabels: Record<ComponentThemeMotionRole, string>;
export declare const componentThemeShadowRoleLabels: Record<ComponentThemeShadowRole, string>;
export declare const componentThemePropertyGroupLabels: Record<ComponentThemePropertyGroup, string>;
export declare function describeThemePropertyKey(propertyKey: ThemePropertyKey): {
    group: ComponentThemePropertyGroup;
    groupLabel: string;
    role: string;
    roleLabel: string;
};
export declare function listThemePropertyKeysForGroups(groups: readonly ComponentThemePropertyGroup[]): ThemePropertyKey[];
/**
 * Deduped property groups present in a list of property keys, in first-
 * appearance order. The SchemaForm theme-role control uses this when
 * `allowedKeys` is provided so the visible group set follows the allowlist
 * — matching the documented contract that `allowedKeys` ignores `groups`.
 */
export declare function deriveThemePropertyGroupsFromKeys(keys: readonly ThemePropertyKey[]): ComponentThemePropertyGroup[];
/**
 * Static Tailwind class that paints the swatch for a `color.*` property key.
 * The aliases (`bg-ct-page-background`, `bg-ct-accent`, …) are defined in
 * `src/styles/tailwind.css` and resolve to the host-supplied
 * `--ct-color-*` runtime variables through the Theme style bridge.
 *
 * Returns `undefined` for non-color groups so the control falls back to a
 * label-only row (no fake colored swatch).
 */
export declare function colorRoleSwatchClass(propertyKey: ThemePropertyKey): string | undefined;
export declare const colorRoleSwatchClassNames: readonly ["bg-ct-page-background", "bg-ct-surface", "bg-ct-card-foreground", "bg-ct-popover", "bg-ct-popover-foreground", "bg-ct-surface-muted", "bg-ct-foreground", "bg-ct-foreground-muted", "bg-ct-border", "bg-ct-accent", "bg-ct-accent-foreground", "bg-ct-secondary", "bg-ct-secondary-foreground", "bg-ct-accent-subtle", "bg-ct-accent-subtle-foreground", "bg-ct-focus-ring", "bg-ct-destructive", "bg-ct-destructive-foreground", "bg-ct-input", "bg-ct-sidebar", "bg-ct-sidebar-foreground", "bg-ct-sidebar-primary", "bg-ct-sidebar-primary-foreground", "bg-ct-sidebar-accent", "bg-ct-sidebar-accent-foreground", "bg-ct-sidebar-border", "bg-ct-sidebar-ring", "bg-ct-warning", "bg-ct-info", "bg-ct-success", "bg-ct-chart1", "bg-ct-chart2", "bg-ct-chart3", "bg-ct-chart4", "bg-ct-chart5"];
