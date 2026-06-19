import { describe, expect, it } from "vitest";

import { componentThemeShadcnColorAliasEntries, parseShadcnThemeCssBlocks } from "../public-sdk";

const issue51RootValues = {
  background: "40 60% 99%",
  foreground: "200 15% 27%",
  card: "0 0% 100%",
  "card-foreground": "200 15% 27%",
  popover: "0 0% 100%",
  "popover-foreground": "200 15% 27%",
  primary: "108 11% 53%",
  "primary-foreground": "40 60% 99%",
  secondary: "48 11% 91%",
  "secondary-foreground": "200 14% 29%",
  muted: "48 11% 91%",
  "muted-foreground": "212 6% 55%",
  accent: "86 20% 93%",
  "accent-foreground": "103 12% 45%",
  destructive: "5 40% 51%",
  "destructive-foreground": "40 60% 99%",
  border: "47 14% 87%",
  input: "47 14% 87%",
  ring: "108 11% 53%",
  "chart-1": "108 11% 53%",
  "chart-2": "191 9% 54%",
  "chart-3": "200 14% 29%",
  "chart-4": "37 17% 80%",
  "chart-5": "103 12% 45%",
  sidebar: "40 60% 99%",
  "sidebar-foreground": "200 15% 27%",
  "sidebar-primary": "108 11% 53%",
  "sidebar-primary-foreground": "40 60% 99%",
  "sidebar-accent": "86 20% 93%",
  "sidebar-accent-foreground": "103 12% 45%",
  "sidebar-border": "47 14% 87%",
  "sidebar-ring": "108 11% 53%",
  radius: "0.75rem",
} as const;

const issue51DarkValues = {
  background: "200 22% 14%",
  foreground: "48 18% 92%",
  card: "200 20% 19%",
  "card-foreground": "48 18% 92%",
  popover: "200 20% 19%",
  "popover-foreground": "48 18% 92%",
  primary: "108 18% 58%",
  "primary-foreground": "200 22% 14%",
  secondary: "200 16% 24%",
  "secondary-foreground": "48 18% 92%",
  muted: "200 16% 24%",
  "muted-foreground": "210 10% 72%",
  accent: "108 14% 30%",
  "accent-foreground": "48 18% 92%",
  destructive: "6 55% 56%",
  "destructive-foreground": "48 18% 92%",
  border: "200 14% 28%",
  input: "200 14% 28%",
  ring: "108 18% 58%",
  "chart-1": "108 18% 58%",
  "chart-2": "191 16% 60%",
  "chart-3": "210 14% 72%",
  "chart-4": "37 17% 80%",
  "chart-5": "103 12% 55%",
  sidebar: "200 20% 19%",
  "sidebar-foreground": "48 18% 92%",
  "sidebar-primary": "108 18% 58%",
  "sidebar-primary-foreground": "200 22% 14%",
  "sidebar-accent": "108 14% 30%",
  "sidebar-accent-foreground": "48 18% 92%",
  "sidebar-border": "200 14% 28%",
  "sidebar-ring": "108 18% 58%",
  radius: "0.75rem",
} as const;

function cssBlock(selector: string, values: Readonly<Record<string, string>>): string {
  return `${selector} {\n${Object.entries(values)
    .map(([token, value]) => `  --${token}: ${value};`)
    .join("\n")}\n}`;
}

function expectAliasValues(
  actual: Record<string, unknown> | undefined,
  expected: Readonly<Record<string, string>>,
): void {
  for (const [alias, role] of componentThemeShadcnColorAliasEntries) {
    expect(actual?.[role], alias).toBe(`hsl(${expected[alias]})`);
  }
}

function expectRadiusValues(actual: Record<string, unknown> | undefined): void {
  expect(actual).toMatchObject({
    sm: "calc(0.75rem - 4px)",
    md: "calc(0.75rem - 2px)",
    lg: "0.75rem",
    xl: "calc(0.75rem + 4px)",
    full: "9999px",
  });
}

describe("shadcn component-theme CSS block parser", () => {
  it("parses exact Issue #51 :root and .dark blocks into canonical light and dark values", () => {
    const result = parseShadcnThemeCssBlocks(
      `${cssBlock(":root", issue51RootValues)}\n\n${cssBlock(".dark", issue51DarkValues)}`,
      "themeCss",
    );

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) throw new Error("expected CSS block parsing to pass");
    expectAliasValues(result.value.light?.color, issue51RootValues);
    expectAliasValues(result.value.dark?.color, issue51DarkValues);
    expectRadiusValues(result.value.light?.radius);
    expectRadiusValues(result.value.dark?.radius);
  });

  it("ignores CSS comments and trims declaration values while normalizing HSL channels", () => {
    const result = parseShadcnThemeCssBlocks(
      `/* imported shadcn tokens */\n:root {\n  --background:   40 60% 99%  ;\n  /* keep channel string */\n  --primary: 108 11% 53%;\n}`,
      "themeCss",
    );

    expect(result).toEqual({
      ok: true,
      value: {
        light: {
          color: {
            pageBackground: "hsl(40 60% 99%)",
            accent: "hsl(108 11% 53%)",
          },
        },
      },
    });
  });

  it("diagnoses missing supported blocks", () => {
    const result = parseShadcnThemeCssBlocks(`.button { --background: red; }`, "themeCss");

    expect(result).toEqual({
      ok: false,
      diagnostics: [
        expect.objectContaining({
          path: "themeCss",
          reason: "theme-css-block-not-found",
        }),
        expect.objectContaining({
          path: "themeCss.selector[0]",
          reason: "unsupported-theme-css-selector",
          selector: ".button",
        }),
      ],
    });
  });

  it("reports unsupported variables and declarations with stable data diagnostic paths", () => {
    const result = parseShadcnThemeCssBlocks(
      `:root { color: red; --primari: 108 11% 53%; --background: 40 60% 99%; }`,
      "themeCss",
    );

    expect(result).toMatchObject({
      ok: false,
      diagnostics: [
        {
          path: "themeCss.light.declaration[0]",
          reason: "unsupported-theme-css-declaration",
        },
        {
          path: "themeCss.light.primari",
          reason: "unsupported-theme-alias",
          suggestions: ["primary"],
        },
      ],
    });
  });

  it("inherits deterministic conflict behavior from alias normalization", () => {
    const result = parseShadcnThemeCssBlocks(
      `:root { --primary: 108 11% 53%; --primary: 108 18% 58%; }`,
      "themeCss",
    );

    expect(result).toMatchObject({
      ok: false,
      diagnostics: [
        {
          path: "themeCss.light.primary",
          reason: "conflicting-theme-property-alias",
          group: "color",
          key: "accent",
          aliasKey: "primary",
          canonicalKey: "color.accent",
        },
      ],
    });
  });
});
