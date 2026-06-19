// Human-readable labels for component-theme role keys (Task 6.7).
//
// The shared SchemaForm theme-role control (`SchemaFormThemeRoleControl.vue`)
// renders dropdown options grouped by property group ("Color", "Font", …) and
// labels each option with the friendly form here. Authoring controls outside
// the Theme component are constrained to picking a declared role; this module
// is the single source of truth for the strings shown to users so consumer
// ConfigPanels do not invent parallel label maps.
//
// Centralising the labels also makes it cheap to add a swatch utility class
// per color role: every color label is paired with the static Tailwind alias
// (`bg-ct-{kebab}`) defined in `src/styles/tailwind.css` so the swatch paints
// from the host theme bridge with no inline styles.

import {
  componentThemeColorRoles,
  componentThemeFontRoles,
  componentThemeMotionRoles,
  componentThemeRadiusRoles,
  componentThemeShadowRoles,
  componentThemeSpacingRoles,
  type ComponentThemeColorRole,
  type ComponentThemeFontRole,
  type ComponentThemeMotionRole,
  type ComponentThemeRadiusRole,
  type ComponentThemeShadowRole,
  type ComponentThemeSpacingRole,
} from "../themes";
import {
  componentThemePropertyKeys,
  themeRoleKeyToCssVariableSuffix,
  type ComponentThemePropertyGroup,
  type ThemePropertyKey,
} from "./theme";

export const componentThemeColorRoleLabels: Record<ComponentThemeColorRole, string> = {
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
  chart5: "Chart 5",
};

export const componentThemeFontRoleLabels: Record<ComponentThemeFontRole, string> = {
  body: "Body",
  heading: "Heading",
  mono: "Mono",
};

export const componentThemeRadiusRoleLabels: Record<ComponentThemeRadiusRole, string> = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
  full: "Full / pill",
};

export const componentThemeSpacingRoleLabels: Record<ComponentThemeSpacingRole, string> = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
};

export const componentThemeMotionRoleLabels: Record<ComponentThemeMotionRole, string> = {
  durationFastMs: "Duration · fast",
  durationNormalMs: "Duration · normal",
  easing: "Easing",
};

export const componentThemeShadowRoleLabels: Record<ComponentThemeShadowRole, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

export const componentThemePropertyGroupLabels: Record<ComponentThemePropertyGroup, string> = {
  color: "Color",
  font: "Font",
  radius: "Radius",
  spacing: "Spacing",
  motion: "Motion",
  shadow: "Shadow",
};

const roleLabelsByGroup: {
  readonly [Group in ComponentThemePropertyGroup]: Readonly<Record<string, string>>;
} = {
  color: componentThemeColorRoleLabels,
  font: componentThemeFontRoleLabels,
  radius: componentThemeRadiusRoleLabels,
  spacing: componentThemeSpacingRoleLabels,
  motion: componentThemeMotionRoleLabels,
  shadow: componentThemeShadowRoleLabels,
};

const rolesByGroup: {
  readonly [Group in ComponentThemePropertyGroup]: readonly string[];
} = {
  color: componentThemeColorRoles,
  font: componentThemeFontRoles,
  radius: componentThemeRadiusRoles,
  spacing: componentThemeSpacingRoles,
  motion: componentThemeMotionRoles,
  shadow: componentThemeShadowRoles,
};

export function describeThemePropertyKey(propertyKey: ThemePropertyKey): {
  group: ComponentThemePropertyGroup;
  groupLabel: string;
  role: string;
  roleLabel: string;
} {
  const [group, role] = propertyKey.split(".") as [ComponentThemePropertyGroup, string];
  const groupLabel = componentThemePropertyGroupLabels[group];
  const roleLabel = roleLabelsByGroup[group][role] ?? role;
  return { group, groupLabel, role, roleLabel };
}

export function listThemePropertyKeysForGroups(
  groups: readonly ComponentThemePropertyGroup[],
): ThemePropertyKey[] {
  return groups.flatMap((group) =>
    rolesByGroup[group].map((role) => `${group}.${role}` as ThemePropertyKey),
  );
}

/**
 * Deduped property groups present in a list of property keys, in first-
 * appearance order. The SchemaForm theme-role control uses this when
 * `allowedKeys` is provided so the visible group set follows the allowlist
 * — matching the documented contract that `allowedKeys` ignores `groups`.
 */
export function deriveThemePropertyGroupsFromKeys(
  keys: readonly ThemePropertyKey[],
): ComponentThemePropertyGroup[] {
  const seen = new Set<ComponentThemePropertyGroup>();
  const ordered: ComponentThemePropertyGroup[] = [];
  for (const key of keys) {
    const [group] = key.split(".") as [ComponentThemePropertyGroup, string];
    if (seen.has(group)) continue;
    seen.add(group);
    ordered.push(group);
  }
  return ordered;
}

/**
 * Static Tailwind class that paints the swatch for a `color.*` property key.
 * The aliases (`bg-ct-page-background`, `bg-ct-accent`, …) are defined in
 * `src/styles/tailwind.css` and resolve to the host-supplied
 * `--ct-color-*` runtime variables through the Theme style bridge.
 *
 * Returns `undefined` for non-color groups so the control falls back to a
 * label-only row (no fake colored swatch).
 */
export function colorRoleSwatchClass(propertyKey: ThemePropertyKey): string | undefined {
  if (!propertyKey.startsWith("color.")) return undefined;
  const role = propertyKey.slice("color.".length);
  return `bg-ct-${themeRoleKeyToCssVariableSuffix(role)}`;
}

// Tailwind v4 class extractor only emits utilities found in scanned source
// files. The list below pins every color-role swatch class as a literal
// string in `packages/components/src/sdk/*.ts` so the generated CSS contains
// every alias the control might render at runtime, even when the role is
// chosen dynamically from a saved config. Keep this list aligned with
// `componentThemeColorRoles`.
export const colorRoleSwatchClassNames = [
  "bg-ct-page-background",
  "bg-ct-surface",
  "bg-ct-card-foreground",
  "bg-ct-popover",
  "bg-ct-popover-foreground",
  "bg-ct-surface-muted",
  "bg-ct-foreground",
  "bg-ct-foreground-muted",
  "bg-ct-border",
  "bg-ct-accent",
  "bg-ct-accent-foreground",
  "bg-ct-secondary",
  "bg-ct-secondary-foreground",
  "bg-ct-accent-subtle",
  "bg-ct-accent-subtle-foreground",
  "bg-ct-focus-ring",
  "bg-ct-destructive",
  "bg-ct-destructive-foreground",
  "bg-ct-input",
  "bg-ct-sidebar",
  "bg-ct-sidebar-foreground",
  "bg-ct-sidebar-primary",
  "bg-ct-sidebar-primary-foreground",
  "bg-ct-sidebar-accent",
  "bg-ct-sidebar-accent-foreground",
  "bg-ct-sidebar-border",
  "bg-ct-sidebar-ring",
  "bg-ct-warning",
  "bg-ct-info",
  "bg-ct-success",
  "bg-ct-chart1",
  "bg-ct-chart2",
  "bg-ct-chart3",
  "bg-ct-chart4",
  "bg-ct-chart5",
] as const;

// Sanity check: every property key has a label entry. Keeps a missing
// addition to `componentThemeColorRoles`/etc. from silently rendering the
// raw camelCase role id in user-facing UI.
for (const propertyKey of componentThemePropertyKeys) {
  const [group, role] = propertyKey.split(".") as [ComponentThemePropertyGroup, string];
  if (!Object.prototype.hasOwnProperty.call(roleLabelsByGroup[group], role)) {
    throw new Error(
      `componentTheme*RoleLabels is missing a label for "${propertyKey}". ` +
        "Update theme-role-labels.ts when adding a new role.",
    );
  }
}
