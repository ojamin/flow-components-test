// Unit coverage for the shared theme-role label helpers (Task 6.7).
//
// `SchemaFormThemeRoleControl.vue` and any future inspector copy depend on
// these to surface humanised role names and a stable Tailwind swatch class
// per color role. The tests guard the label coverage invariant (every
// declared role has a label) and the swatch-class lookup so a future role
// rename surfaces here, not in unrendered UI.

import { describe, expect, it } from "vitest";

import {
  componentThemeColorRoles,
  componentThemeFontRoles,
  componentThemeMotionRoles,
  componentThemeRadiusRoles,
  componentThemeShadowRoles,
  componentThemeSpacingRoles,
} from "../../themes";
import {
  colorRoleSwatchClass,
  colorRoleSwatchClassNames,
  componentThemeColorRoleLabels,
  componentThemeFontRoleLabels,
  componentThemeMotionRoleLabels,
  componentThemePropertyGroupLabels,
  componentThemeRadiusRoleLabels,
  componentThemeShadowRoleLabels,
  componentThemeSpacingRoleLabels,
  describeThemePropertyKey,
  listThemePropertyKeysForGroups,
} from "../theme-role-labels";

describe("theme-role-labels — coverage", () => {
  it("provides a label for every declared color role", () => {
    for (const role of componentThemeColorRoles) {
      expect(componentThemeColorRoleLabels[role]).toBeTypeOf("string");
      expect(componentThemeColorRoleLabels[role].length).toBeGreaterThan(0);
    }
  });

  it("provides labels for every non-color group", () => {
    for (const role of componentThemeFontRoles) {
      expect(componentThemeFontRoleLabels[role]).toBeTypeOf("string");
    }
    for (const role of componentThemeRadiusRoles) {
      expect(componentThemeRadiusRoleLabels[role]).toBeTypeOf("string");
    }
    for (const role of componentThemeSpacingRoles) {
      expect(componentThemeSpacingRoleLabels[role]).toBeTypeOf("string");
    }
    for (const role of componentThemeMotionRoles) {
      expect(componentThemeMotionRoleLabels[role]).toBeTypeOf("string");
    }
    for (const role of componentThemeShadowRoles) {
      expect(componentThemeShadowRoleLabels[role]).toBeTypeOf("string");
    }
  });

  it("labels every property group", () => {
    expect(componentThemePropertyGroupLabels).toEqual({
      color: "Color",
      font: "Font",
      radius: "Radius",
      spacing: "Spacing",
      motion: "Motion",
      shadow: "Shadow",
    });
  });

  it("listThemePropertyKeysForGroups returns canonical key strings", () => {
    expect(listThemePropertyKeysForGroups(["color"]).slice(0, 3)).toEqual([
      "color.pageBackground",
      "color.surface",
      "color.cardForeground",
    ]);
    expect(listThemePropertyKeysForGroups(["font"])).toEqual([
      "font.body",
      "font.heading",
      "font.mono",
    ]);
    expect(listThemePropertyKeysForGroups(["color", "font"]).at(-1)).toBe("font.mono");
    expect(listThemePropertyKeysForGroups(["shadow"])).toEqual([
      "shadow.sm",
      "shadow.md",
      "shadow.lg",
    ]);
  });

  it("describeThemePropertyKey returns humanised parts", () => {
    expect(describeThemePropertyKey("color.pageBackground")).toEqual({
      group: "color",
      groupLabel: "Color",
      role: "pageBackground",
      roleLabel: "Page background",
    });
    expect(describeThemePropertyKey("font.heading")).toEqual({
      group: "font",
      groupLabel: "Font",
      role: "heading",
      roleLabel: "Heading",
    });
    expect(describeThemePropertyKey("motion.durationFastMs").roleLabel).toBe("Duration · fast");
  });

  it("colorRoleSwatchClass returns a static Tailwind alias for color roles only", () => {
    expect(colorRoleSwatchClass("color.accent")).toBe("bg-ct-accent");
    expect(colorRoleSwatchClass("color.pageBackground")).toBe("bg-ct-page-background");
    expect(colorRoleSwatchClass("color.chart3")).toBe("bg-ct-chart3");
    expect(colorRoleSwatchClass("font.body")).toBeUndefined();
    expect(colorRoleSwatchClass("radius.md")).toBeUndefined();
  });

  it("pins every color-role swatch class as a literal source string for Tailwind extraction", () => {
    const expected = componentThemeColorRoles.map((role) => colorRoleSwatchClass(`color.${role}`)!);
    expect(colorRoleSwatchClassNames).toEqual(expected);
  });
});
