import { describe, expect, it } from "vitest";

import {
  componentThemeShadcnColorAliasEntries,
  normalizeComponentThemePropertyAliases,
} from "../public-sdk";

describe("component theme shadcn alias normalization", () => {
  it("normalizes every supported shadcn color token into canonical color roles", () => {
    const input = Object.fromEntries(
      componentThemeShadcnColorAliasEntries.map(([alias]) => [alias, `value:${alias}`]),
    );

    const result = normalizeComponentThemePropertyAliases(input, "propertyOverrides");

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected alias normalization to pass");
    for (const [alias, role] of componentThemeShadcnColorAliasEntries) {
      expect(result.value.color?.[role]).toBe(`value:${alias}`);
    }
  });

  it("allows mixed canonical groups and aliases when their canonical values agree", () => {
    const result = normalizeComponentThemePropertyAliases(
      {
        color: { accent: "#123456", foreground: "#111111" },
        primary: "#123456",
        background: "#ffffff",
      },
      "propertyOverrides",
    );

    expect(result).toEqual({
      ok: true,
      value: {
        color: {
          accent: "#123456",
          foreground: "#111111",
          pageBackground: "#ffffff",
        },
      },
    });
  });

  it("normalizes shadcn HSL channel strings into valid CSS color functions", () => {
    const result = normalizeComponentThemePropertyAliases(
      {
        background: "222 47% 11%",
        color: {
          "chart-1": "210deg 50% 40% / 0.75",
        },
      },
      "propertyOverrides",
    );

    expect(result).toEqual({
      ok: true,
      value: {
        color: {
          pageBackground: "hsl(222 47% 11%)",
          chart1: "hsl(210deg 50% 40% / 0.75)",
        },
      },
    });
  });

  it("diagnoses conflicting canonical and alias values deterministically", () => {
    const result = normalizeComponentThemePropertyAliases(
      { color: { accent: "#123456" }, primary: "#abcdef" },
      "propertyOverrides",
    );

    expect(result).toMatchObject({
      ok: false,
      diagnostics: [
        {
          path: "propertyOverrides.primary",
          reason: "conflicting-theme-property-alias",
          group: "color",
          key: "accent",
          aliasKey: "primary",
          canonicalKey: "color.accent",
        },
      ],
    });
  });

  it("reports unknown aliases with supported keys, suggestions, and recovery hints", () => {
    const result = normalizeComponentThemePropertyAliases(
      { primari: "#123456" },
      "propertyOverrides",
    );

    expect(result).toMatchObject({
      ok: false,
      diagnostics: [
        {
          path: "propertyOverrides.primari",
          reason: "unsupported-theme-alias",
          supportedKeys: expect.arrayContaining(["primary", "chart-1", "sidebar-ring"]),
          suggestions: ["primary"],
          recovery: expect.stringContaining("Use a supported shadcn token"),
        },
      ],
    });
  });

  it("diagnoses canonical groups that are not objects", () => {
    const result = normalizeComponentThemePropertyAliases(
      { color: "108 11% 53%" },
      "propertyOverrides",
    );

    expect(result).toMatchObject({
      ok: false,
      diagnostics: [
        {
          path: "propertyOverrides.color",
          reason: "invalid-theme-property-value",
          group: "color",
          expected: "object of component-theme role values",
        },
      ],
    });
  });
});
