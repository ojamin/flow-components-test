import { z } from "zod";

export const componentThemeColorRoles = [
  "pageBackground",
  "surface",
  "cardForeground",
  "popover",
  "popoverForeground",
  "surfaceMuted",
  "foreground",
  "foregroundMuted",
  "border",
  "accent",
  "accentForeground",
  "secondary",
  "secondaryForeground",
  "accentSubtle",
  "accentSubtleForeground",
  "focusRing",
  "destructive",
  "destructiveForeground",
  "input",
  "sidebar",
  "sidebarForeground",
  "sidebarPrimary",
  "sidebarPrimaryForeground",
  "sidebarAccent",
  "sidebarAccentForeground",
  "sidebarBorder",
  "sidebarRing",
  "warning",
  "info",
  "success",
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
] as const;

export const componentThemeFontRoles = ["body", "heading", "mono"] as const;
export const componentThemeRadiusRoles = ["none", "sm", "md", "lg", "xl", "full"] as const;
export const componentThemeSpacingRoles = ["none", "sm", "md", "lg", "xl"] as const;
export const componentThemeMotionRoles = ["durationFastMs", "durationNormalMs", "easing"] as const;
export const componentThemeShadowRoles = ["sm", "md", "lg"] as const;

export type ComponentThemeColorRole = (typeof componentThemeColorRoles)[number];
export type ComponentThemeFontRole = (typeof componentThemeFontRoles)[number];
export type ComponentThemeRadiusRole = (typeof componentThemeRadiusRoles)[number];
export type ComponentThemeSpacingRole = (typeof componentThemeSpacingRoles)[number];
export type ComponentThemeMotionRole = (typeof componentThemeMotionRoles)[number];
export type ComponentThemeShadowRole = (typeof componentThemeShadowRoles)[number];

export const componentThemeVersionSchema = z.literal(1);

export const componentThemeIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, "Expected a stable lowercase kebab-case theme id");

const nonBlankStringSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "Expected a non-empty string",
});

function createPartialStringRoleMapSchema<const TRoles extends readonly string[]>(roles: TRoles) {
  return z.strictObject(
    Object.fromEntries(roles.map((role) => [role, nonBlankStringSchema.optional()])) as Record<
      TRoles[number],
      z.ZodOptional<typeof nonBlankStringSchema>
    >,
  );
}

const durationMsSchema = z.number().int().nonnegative().finite();

export const componentThemeColorMapSchema = z.strictObject({
  pageBackground: nonBlankStringSchema,
  surface: nonBlankStringSchema,
  cardForeground: nonBlankStringSchema.optional(),
  popover: nonBlankStringSchema.optional(),
  popoverForeground: nonBlankStringSchema.optional(),
  surfaceMuted: nonBlankStringSchema,
  foreground: nonBlankStringSchema,
  foregroundMuted: nonBlankStringSchema,
  border: nonBlankStringSchema,
  accent: nonBlankStringSchema,
  accentForeground: nonBlankStringSchema,
  secondary: nonBlankStringSchema.optional(),
  secondaryForeground: nonBlankStringSchema.optional(),
  accentSubtle: nonBlankStringSchema.optional(),
  accentSubtleForeground: nonBlankStringSchema.optional(),
  focusRing: nonBlankStringSchema,
  destructive: nonBlankStringSchema,
  destructiveForeground: nonBlankStringSchema.optional(),
  input: nonBlankStringSchema.optional(),
  sidebar: nonBlankStringSchema.optional(),
  sidebarForeground: nonBlankStringSchema.optional(),
  sidebarPrimary: nonBlankStringSchema.optional(),
  sidebarPrimaryForeground: nonBlankStringSchema.optional(),
  sidebarAccent: nonBlankStringSchema.optional(),
  sidebarAccentForeground: nonBlankStringSchema.optional(),
  sidebarBorder: nonBlankStringSchema.optional(),
  sidebarRing: nonBlankStringSchema.optional(),
  warning: nonBlankStringSchema,
  info: nonBlankStringSchema,
  success: nonBlankStringSchema,
  chart1: nonBlankStringSchema,
  chart2: nonBlankStringSchema,
  chart3: nonBlankStringSchema,
  chart4: nonBlankStringSchema,
  chart5: nonBlankStringSchema,
});

export const componentThemeFontMapSchema = z.strictObject({
  body: nonBlankStringSchema,
  heading: nonBlankStringSchema,
  mono: nonBlankStringSchema,
});

export const componentThemeRadiusMapSchema = z.strictObject({
  none: nonBlankStringSchema,
  sm: nonBlankStringSchema,
  md: nonBlankStringSchema,
  lg: nonBlankStringSchema,
  xl: nonBlankStringSchema.optional(),
  full: nonBlankStringSchema.optional(),
});

export const componentThemeSpacingMapSchema = z.strictObject({
  none: nonBlankStringSchema,
  sm: nonBlankStringSchema,
  md: nonBlankStringSchema,
  lg: nonBlankStringSchema,
  xl: nonBlankStringSchema,
});

export const componentThemeMotionSchema = z.strictObject({
  durationFastMs: durationMsSchema,
  durationNormalMs: durationMsSchema,
  easing: nonBlankStringSchema,
});

export const componentThemeShadowMapSchema = z.strictObject({
  sm: nonBlankStringSchema,
  md: nonBlankStringSchema,
  lg: nonBlankStringSchema,
});

export const componentThemePartialColorMapSchema =
  createPartialStringRoleMapSchema(componentThemeColorRoles);
export const componentThemePartialFontMapSchema =
  createPartialStringRoleMapSchema(componentThemeFontRoles);
export const componentThemePartialRadiusMapSchema =
  createPartialStringRoleMapSchema(componentThemeRadiusRoles);
export const componentThemePartialSpacingMapSchema = createPartialStringRoleMapSchema(
  componentThemeSpacingRoles,
);
export const componentThemePartialShadowMapSchema =
  createPartialStringRoleMapSchema(componentThemeShadowRoles);

export const componentThemePropertiesSchema = z.strictObject({
  color: componentThemeColorMapSchema,
  font: componentThemeFontMapSchema,
  radius: componentThemeRadiusMapSchema,
  spacing: componentThemeSpacingMapSchema,
  motion: componentThemeMotionSchema,
  shadow: componentThemeShadowMapSchema.optional(),
});

export const componentThemePalettePropertiesSchema = z.strictObject({
  color: componentThemePartialColorMapSchema.optional(),
  font: componentThemePartialFontMapSchema.optional(),
  radius: componentThemePartialRadiusMapSchema.optional(),
  spacing: componentThemePartialSpacingMapSchema.optional(),
  motion: componentThemeMotionSchema.partial().optional(),
  shadow: componentThemePartialShadowMapSchema.optional(),
});

export const componentThemePalettesSchema = z.strictObject({
  light: componentThemePalettePropertiesSchema.optional(),
  dark: componentThemePalettePropertiesSchema.optional(),
});

export const componentThemeSchema = z.strictObject({
  version: componentThemeVersionSchema,
  id: componentThemeIdSchema,
  displayName: nonBlankStringSchema,
  description: z.string().optional(),
  properties: componentThemePropertiesSchema,
  palettes: componentThemePalettesSchema.optional(),
});

export const componentThemeContextSchema = z.strictObject({
  themeId: componentThemeIdSchema.optional(),
  properties: componentThemePropertiesSchema,
});

export type ComponentThemeV1 = z.output<typeof componentThemeSchema>;
export type ComponentThemeContextV1 = z.output<typeof componentThemeContextSchema>;
