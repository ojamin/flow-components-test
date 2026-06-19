import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  componentThemeColorRoles,
  componentThemeFontRoles,
  componentThemePalettesSchema,
  componentThemePartialColorMapSchema,
  componentThemePartialRadiusMapSchema,
  componentThemeRadiusRoles,
  componentThemeSchema,
  componentThemeShadowRoles,
  componentThemeSpacingRoles,
  type ComponentThemeV1,
} from "../../themes";

function roleMap<const TRole extends readonly string[]>(roles: TRole, value: string) {
  return Object.fromEntries(roles.map((role) => [role, value])) as Record<TRole[number], string>;
}

function createTheme(overrides: Partial<ComponentThemeV1> = {}): ComponentThemeV1 {
  return {
    version: 1,
    id: "default",
    displayName: "Default",
    description: "Base component theme",
    properties: {
      color: roleMap(componentThemeColorRoles, "oklch(0.98 0.01 250)"),
      font: roleMap(componentThemeFontRoles, "Inter, sans-serif"),
      radius: roleMap(componentThemeRadiusRoles, "0.5rem"),
      spacing: roleMap(componentThemeSpacingRoles, "1rem"),
      motion: {
        durationFastMs: 100,
        durationNormalMs: 220,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      shadow: roleMap(componentThemeShadowRoles, "0 1px 2px rgb(0 0 0 / 0.08)"),
    },
    ...overrides,
  };
}

const addedColorRoles = [
  "cardForeground",
  "popover",
  "popoverForeground",
  "secondary",
  "secondaryForeground",
  "accentSubtle",
  "accentSubtleForeground",
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
] as const;

describe("componentThemeSchema", () => {
  it("uses single optional wrappers for partial override color and radius roles", () => {
    const optionalColorRole = componentThemePartialColorMapSchema.shape.cardForeground;
    const optionalRadiusRole = componentThemePartialRadiusMapSchema.shape.full;

    expect(optionalColorRole).toBeInstanceOf(z.ZodOptional);
    expect(optionalRadiusRole).toBeInstanceOf(z.ZodOptional);
    expect(optionalColorRole.unwrap()).not.toBeInstanceOf(z.ZodOptional);
    expect(optionalRadiusRole.unwrap()).not.toBeInstanceOf(z.ZodOptional);
  });

  it("accepts a complete version 1 component-theme payload", () => {
    const theme = createTheme();

    expect(componentThemeSchema.parse(theme)).toEqual(theme);
  });

  it("accepts optional light and dark palette property sets while preserving properties", () => {
    const theme = createTheme({
      palettes: {
        light: {
          color: { accent: "oklch(0.65 0.2 250)" },
        },
        dark: {
          color: { accent: "oklch(0.75 0.18 250)" },
          motion: { durationFastMs: 80 },
        },
      },
    } as Partial<ComponentThemeV1>);

    expect(componentThemeSchema.parse(theme)).toEqual(theme);
    expect(componentThemePalettesSchema.parse(theme.palettes)).toEqual(theme.palettes);
  });

  it("accepts the new Issue #51 color, radius, and shadow roles", () => {
    const theme = createTheme({
      properties: {
        ...createTheme().properties,
        color: {
          ...createTheme().properties.color,
          ...Object.fromEntries(addedColorRoles.map((role) => [role, `oklch(0.7 0.1 250)`])),
        },
        radius: {
          ...createTheme().properties.radius,
          xl: "1rem",
          full: "9999px",
        },
        shadow: {
          sm: "0 1px 2px rgb(0 0 0 / 0.08)",
          md: "0 4px 12px rgb(0 0 0 / 0.10)",
          lg: "0 16px 32px rgb(0 0 0 / 0.12)",
        },
      },
    });

    expect(componentThemeSchema.parse(theme)).toEqual(theme);
  });

  it("keeps pre-expansion themes valid while rejecting misspelled new groups or roles", () => {
    const legacyCompatibleTheme = createTheme({
      properties: {
        ...createTheme().properties,
        color: Object.fromEntries(
          componentThemeColorRoles
            .filter((role) => !addedColorRoles.includes(role as (typeof addedColorRoles)[number]))
            .map((role) => [role, "oklch(0.98 0.01 250)"]),
        ) as ComponentThemeV1["properties"]["color"],
        radius: {
          none: "0",
          sm: "0.25rem",
          md: "0.5rem",
          lg: "0.75rem",
        },
      },
    });

    const misspelledTheme = createTheme({
      properties: {
        ...createTheme().properties,
        shadow: {
          ...roleMap(componentThemeShadowRoles, "0 1px 2px rgb(0 0 0 / 0.08)"),
          none: "none",
        } as ComponentThemeV1["properties"]["shadow"],
      },
    });

    expect(componentThemeSchema.safeParse(legacyCompatibleTheme).success).toBe(true);
    expect(componentThemeSchema.safeParse(misspelledTheme).success).toBe(false);
  });

  it("rejects missing required roles and undeclared role keys", () => {
    const missingColorRole = createTheme({
      properties: {
        ...createTheme().properties,
        color: Object.fromEntries(
          componentThemeColorRoles
            .filter((role) => role !== "pageBackground")
            .map((role) => [role, "oklch(0.98 0.01 250)"]),
        ) as ComponentThemeV1["properties"]["color"],
      },
    });

    const undeclaredFontRole = createTheme({
      properties: {
        ...createTheme().properties,
        font: {
          ...roleMap(componentThemeFontRoles, "Inter, sans-serif"),
          caption: "Inter, sans-serif",
        } as ComponentThemeV1["properties"]["font"],
      },
    });

    expect(componentThemeSchema.safeParse(missingColorRole).success).toBe(false);
    expect(componentThemeSchema.safeParse(undeclaredFontRole).success).toBe(false);
  });

  it("rejects invalid ids, display names, value shapes, and unsupported schema versions", () => {
    const rejectedThemes = [
      createTheme({ id: "Default Theme" }),
      createTheme({ displayName: "   " }),
      createTheme({
        properties: {
          ...createTheme().properties,
          spacing: { ...roleMap(componentThemeSpacingRoles, "1rem"), md: "" },
        },
      }),
      createTheme({
        properties: {
          ...createTheme().properties,
          motion: { ...createTheme().properties.motion, durationFastMs: -1 },
        },
      }),
      { ...createTheme(), version: 2 },
    ];

    for (const theme of rejectedThemes) {
      expect(componentThemeSchema.safeParse(theme).success).toBe(false);
    }
  });
});
