import {
  componentThemeColorRoles,
  componentThemeFontRoles,
  componentThemeMotionRoles,
  componentThemePropertiesSchema,
  componentThemeRadiusRoles,
  componentThemeShadowRoles,
  componentThemeSpacingRoles,
  getBuiltInComponentTheme,
  type ComponentThemeColorRole,
  type ComponentThemeContextV1,
  type ComponentThemeFontRole,
  type ComponentThemeMotionRole,
  type ComponentThemeRadiusRole,
  type ComponentThemeShadowRole,
  type ComponentThemeSpacingRole,
  type ComponentThemeV1,
} from "../themes";
import {
  formatComponentThemeCanvasColor,
  parseComponentThemeCssColor,
  type ComponentThemeRgbaColor,
} from "./theme-color-utils";

export type { ComponentThemeColorRole } from "../themes";

export type ComponentTheme = ComponentThemeV1;
export type ComponentThemeProperties = ComponentThemeV1["properties"];
export const componentThemePaletteModes = ["light", "dark"] as const;
export type ComponentThemePaletteMode = (typeof componentThemePaletteModes)[number];

export const componentThemeDefaultLightColor = "#ffffff";

export type ComponentThemeContext = ComponentThemeContextV1;
export type { ComponentThemeRgbaColor } from "./theme-color-utils";

export type ComponentThemePropertyGroup = keyof ComponentThemeProperties;
export type ComponentThemePropertyValue = string | number;
export type ThemePropertyKey =
  | `color.${ComponentThemeColorRole}`
  | `font.${ComponentThemeFontRole}`
  | `radius.${ComponentThemeRadiusRole}`
  | `spacing.${ComponentThemeSpacingRole}`
  | `motion.${ComponentThemeMotionRole}`
  | `shadow.${ComponentThemeShadowRole}`;
export type ComponentThemeCssVariableMap = Record<
  `--ct-${string}` | `--color-ct-${string}`,
  string
>;

export type ComponentThemePropertyOverrides = {
  readonly [Group in ComponentThemePropertyGroup]?: Partial<
    NonNullable<ComponentThemeProperties[Group]>
  >;
};

export type ComponentThemePaletteFallbackDiagnostic = {
  readonly code: "missing-dark-palette-role-fallback";
  readonly themeId?: string;
  readonly mode: "dark";
  readonly propertyKey: ThemePropertyKey;
  readonly path: string;
  readonly fallbackPath: string;
  readonly message: string;
};

export type ComponentThemePaletteResolutionResult = {
  readonly properties: ComponentThemeProperties;
  readonly diagnostics: readonly ComponentThemePaletteFallbackDiagnostic[];
};

export interface ResolveComponentThemePalettePropertiesOptions {
  readonly pathPrefix?: string;
  readonly fallbackPathPrefix?: string;
}

type RoleListByGroup = {
  readonly [Group in ComponentThemePropertyGroup]: readonly (keyof NonNullable<
    ComponentThemeProperties[Group]
  > &
    string)[];
};

type CssVariableSlots = {
  readonly [Group in ComponentThemePropertyGroup]: Readonly<
    Record<keyof NonNullable<ComponentThemeProperties[Group]> & string, `--ct-${string}`>
  >;
};

export const componentThemePropertyRolesByGroup = Object.freeze({
  color: componentThemeColorRoles,
  font: componentThemeFontRoles,
  radius: componentThemeRadiusRoles,
  spacing: componentThemeSpacingRoles,
  motion: componentThemeMotionRoles,
  shadow: componentThemeShadowRoles,
} as const satisfies RoleListByGroup);

const componentThemeRolesByGroup = componentThemePropertyRolesByGroup;
const optionalComponentThemePropertyGroups = new Set<ComponentThemePropertyGroup>(["shadow"]);

export const componentThemeScopeAttribute = "data-ct-scope" as const;
/** Raw CSS variable prefix without trailing hyphen; full slots are `--ct-{group}-{role}`. */
export const componentThemeCssVariablePrefix = "--ct" as const;
export const componentThemePropertyFallback = "" as const;

export function themeRoleKeyToCssVariableSuffix(roleKey: string): string {
  return roleKey.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function createCssVariableSlots(): CssVariableSlots {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(componentThemeRolesByGroup).map(([group, roles]) => [
        group,
        Object.freeze(
          Object.fromEntries(
            roles.map((role) => [
              role,
              `${componentThemeCssVariablePrefix}-${group}-${themeRoleKeyToCssVariableSuffix(role)}`,
            ]),
          ),
        ),
      ]),
    ),
  ) as CssVariableSlots;
}

export const componentThemeCssVariableSlots = createCssVariableSlots();

export const componentThemePropertyKeys = Object.freeze(
  Object.entries(componentThemeRolesByGroup).flatMap(([group, roles]) =>
    roles.map((role) => `${group}.${role}` as ThemePropertyKey),
  ),
);

export const componentThemeCssVariableByPropertyKey = Object.freeze(
  Object.fromEntries(
    componentThemePropertyKeys.map((propertyKey) => {
      const [group, role] = propertyKey.split(".") as [ComponentThemePropertyGroup, string];
      const slots = componentThemeCssVariableSlots[group] as Readonly<
        Record<string, `--ct-${string}`>
      >;
      return [propertyKey, slots[role]];
    }),
  ) as Record<ThemePropertyKey, `--ct-${string}`>,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidComponentThemePropertyValue(
  group: ComponentThemePropertyGroup,
  role: string,
  value: unknown,
): value is ComponentThemePropertyValue {
  if (group === "motion" && (role === "durationFastMs" || role === "durationNormalMs")) {
    return (
      typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= 0
    );
  }
  return typeof value === "string" && value.trim().length > 0;
}

function parseThemePropertyKey(
  propertyKey: string,
): [ComponentThemePropertyGroup, string] | undefined {
  const [group, role, ...extraSegments] = propertyKey.split(".");
  if (!group || !role) return undefined;
  if (extraSegments.length > 0) return undefined;
  if (!isThemePropertyGroup(group)) return undefined;
  if (!(componentThemeRolesByGroup[group] as readonly string[]).includes(role)) return undefined;
  return [group, role];
}

function isThemePropertyGroup(group: string): group is ComponentThemePropertyGroup {
  return Object.prototype.hasOwnProperty.call(componentThemeRolesByGroup, group);
}

function normalizeThemePropertyValue(
  value: ComponentThemePropertyValue,
): ComponentThemePropertyValue {
  return typeof value === "string" ? value.trim() : value;
}

function resolveFallbackValue(fallback?: ComponentThemePropertyValue): ComponentThemePropertyValue {
  if (typeof fallback === "number") {
    return Number.isFinite(fallback) ? fallback : componentThemePropertyFallback;
  }
  if (typeof fallback === "string") {
    const normalized = fallback.trim();
    return normalized.length > 0 ? normalized : componentThemePropertyFallback;
  }
  return componentThemePropertyFallback;
}

export function resolveThemeProperty(
  context: ComponentThemeContext | Record<string, unknown> | null | undefined,
  propertyKey: ThemePropertyKey | string,
  fallback?: ComponentThemePropertyValue,
): ComponentThemePropertyValue {
  const parsedKey = parseThemePropertyKey(propertyKey);
  if (!parsedKey || !isRecord(context) || !isRecord(context.properties)) {
    return resolveFallbackValue(fallback);
  }

  const [group, role] = parsedKey;
  const groupProperties = context.properties[group];
  if (!isRecord(groupProperties)) {
    return resolveFallbackValue(fallback);
  }

  const value = groupProperties[role];
  if (!isValidComponentThemePropertyValue(group, role, value)) {
    return resolveFallbackValue(fallback);
  }

  return normalizeThemePropertyValue(value);
}

function toCssVariableValue(
  group: ComponentThemePropertyGroup,
  role: string,
  value: ComponentThemePropertyValue,
): string {
  if (
    typeof value === "number" &&
    group === "motion" &&
    (role === "durationFastMs" || role === "durationNormalMs")
  ) {
    return `${value}ms`;
  }
  return String(value);
}

function isHslChannelValue(value: string): boolean {
  return /^-?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?\s+-?\d+(?:\.\d+)?%\s+-?\d+(?:\.\d+)?%(?:\s*\/\s*(?:\d+(?:\.\d+)?%?|\.\d+))?$/.test(
    value.trim(),
  );
}

function toTailwindColorAliasValue(rawSlot: `--ct-${string}`, rawValue: string): string {
  return isHslChannelValue(rawValue) ? `hsl(var(${rawSlot}))` : rawValue;
}

export function createThemeCssVariableMap(
  contextOrProperties:
    | ComponentThemeContext
    | ComponentThemeProperties
    | Record<string, unknown>
    | null
    | undefined,
  fallback?: ComponentThemePropertyValue,
): ComponentThemeCssVariableMap {
  const inputRecord: Record<string, unknown> | undefined = isRecord(contextOrProperties)
    ? (contextOrProperties as Record<string, unknown>)
    : undefined;
  const properties =
    inputRecord && isRecord(inputRecord["properties"])
      ? inputRecord["properties"]
      : contextOrProperties;
  const context = isRecord(properties) ? { properties } : undefined;

  return Object.fromEntries(
    componentThemePropertyKeys.flatMap((propertyKey) => {
      const [group, role] = parseThemePropertyKey(propertyKey) as [
        ComponentThemePropertyGroup,
        string,
      ];
      const rawSlot = componentThemeCssVariableByPropertyKey[propertyKey];
      const value = resolveThemeProperty(context, propertyKey, fallback);
      const rawEntry = [rawSlot, toCssVariableValue(group, role, value)] as const;

      if (group !== "color") {
        return [rawEntry];
      }

      return [
        rawEntry,
        [
          `--color-ct-${themeRoleKeyToCssVariableSuffix(role)}`,
          toTailwindColorAliasValue(rawSlot, rawEntry[1]),
        ] as const,
      ];
    }),
  ) as ComponentThemeCssVariableMap;
}

export function composeThemeProperties(
  base: ComponentThemeProperties,
  overrides?: ComponentThemePropertyOverrides | Record<string, unknown> | null,
): ComponentThemeProperties {
  const parsedBase = componentThemePropertiesSchema.parse(base);
  const overrideRecord: Record<string, unknown> = isRecord(overrides) ? overrides : {};

  return Object.fromEntries(
    Object.entries(componentThemeRolesByGroup).flatMap(([group, roles]) => {
      const typedGroup = group as ComponentThemePropertyGroup;
      const baseGroup: Record<string, unknown> = isRecord(parsedBase[typedGroup])
        ? parsedBase[typedGroup]
        : {};
      const overridesForGroup = isRecord(overrideRecord[group]) ? overrideRecord[group] : {};
      const optionalGroupWithoutBase =
        optionalComponentThemePropertyGroups.has(typedGroup) && Object.keys(baseGroup).length === 0;
      const nextGroup = Object.fromEntries(
        roles.flatMap((role) => {
          const overrideValue = overridesForGroup[role];
          const value = isValidComponentThemePropertyValue(typedGroup, role, overrideValue)
            ? overrideValue
            : baseGroup[role];
          return value === undefined ? [] : [[role, value]];
        }),
      ) as Record<string, ComponentThemePropertyValue | undefined>;

      if (optionalGroupWithoutBase && roles.some((role) => nextGroup[role] === undefined)) {
        return [];
      }

      return [[group, nextGroup]];
    }),
  ) as ComponentThemeProperties;
}

export function resolveComponentThemePaletteProperties(
  theme: ComponentTheme,
  mode: ComponentThemePaletteMode = "light",
  options: ResolveComponentThemePalettePropertiesOptions = {},
): ComponentThemePaletteResolutionResult {
  const lightProperties = composeThemeProperties(theme.properties, theme.palettes?.light);
  if (mode === "light") {
    return { properties: lightProperties, diagnostics: [] };
  }

  const darkOverrides = theme.palettes?.dark;
  return {
    properties: composeThemeProperties(lightProperties, darkOverrides),
    diagnostics: collectDarkPaletteFallbackDiagnostics(
      theme,
      lightProperties,
      darkOverrides,
      options,
    ),
  };
}

function collectDarkPaletteFallbackDiagnostics(
  theme: ComponentTheme,
  fallbackProperties: ComponentThemeProperties,
  darkOverrides: ComponentThemePropertyOverrides | Record<string, unknown> | null | undefined,
  options: ResolveComponentThemePalettePropertiesOptions,
): ComponentThemePaletteFallbackDiagnostic[] {
  const darkRecord = isRecord(darkOverrides) ? darkOverrides : {};
  const pathPrefix = options.pathPrefix ?? "palettes.dark";
  const fallbackPathPrefix = options.fallbackPathPrefix ?? "properties";
  const diagnostics: ComponentThemePaletteFallbackDiagnostic[] = [];

  for (const propertyKey of componentThemePropertyKeys) {
    const parsedKey = parseThemePropertyKey(propertyKey);
    if (!parsedKey) continue;
    const [group, role] = parsedKey;
    const darkGroup = darkRecord[group];
    const darkValue = isRecord(darkGroup) ? darkGroup[role] : undefined;
    if (isValidComponentThemePropertyValue(group, role, darkValue)) continue;

    const fallbackGroup = fallbackProperties[group];
    if (!isRecord(fallbackGroup)) continue;
    const fallbackValue = (fallbackGroup as Record<string, unknown>)[role];
    if (!isValidComponentThemePropertyValue(group, role, fallbackValue)) continue;

    const path = `${pathPrefix}.${group}.${role}`;
    const fallbackPath = `${fallbackPathPrefix}.${group}.${role}`;
    diagnostics.push({
      code: "missing-dark-palette-role-fallback",
      themeId: theme.id,
      mode: "dark",
      propertyKey,
      path,
      fallbackPath,
      message: `Theme "${theme.id}" is missing dark palette value "${propertyKey}"; falling back to "${fallbackPath}".`,
    });
  }

  return diagnostics;
}

const defaultComponentTheme = getBuiltInComponentTheme("default");

export function resolveThemeColorRgba(
  context: ComponentThemeContext | Record<string, unknown> | null | undefined,
  role: ComponentThemeColorRole,
): ComponentThemeRgbaColor {
  const fallbackValue = getDefaultThemeColorValue(role);
  const resolvedValue = resolveThemeProperty(context, `color.${role}`, fallbackValue);
  const parsed = parseComponentThemeCssColor(String(resolvedValue));

  return parsed ?? parseDefaultThemeColor(role);
}

export function resolveThemeColorForCanvas(
  context: ComponentThemeContext | Record<string, unknown> | null | undefined,
  role: ComponentThemeColorRole,
): string {
  return formatComponentThemeCanvasColor(resolveThemeColorRgba(context, role));
}

export function resolveThemeColorForSvg(
  context: ComponentThemeContext | Record<string, unknown> | null | undefined,
  role: ComponentThemeColorRole,
): string {
  return resolveThemeColorForCanvas(context, role);
}

function getDefaultThemeColorValue(role: ComponentThemeColorRole): string {
  const value = defaultComponentTheme?.properties.color[role];
  if (!value) {
    throw new Error(`Missing default component-theme color role "${role}"`);
  }
  return value;
}

function parseDefaultThemeColor(role: ComponentThemeColorRole): ComponentThemeRgbaColor {
  const value = getDefaultThemeColorValue(role);
  const parsed = parseComponentThemeCssColor(value);
  if (!parsed) {
    throw new Error(`Default component-theme color role "${role}" is not convertible`);
  }
  return parsed;
}
