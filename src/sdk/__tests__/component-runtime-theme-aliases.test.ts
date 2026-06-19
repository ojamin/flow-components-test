import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { componentThemeColorRoles, componentThemeRadiusRoles } from "../../themes/schema";

function toKebabCase(role: string): string {
  return role.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

const runtimeCss = readFileSync(resolve(process.cwd(), "src/styles/component-runtime.css"), "utf8");

describe("component runtime theme aliases", () => {
  it("registers every canonical color role as a Tailwind ct color token", () => {
    for (const role of componentThemeColorRoles) {
      const kebabRole = toKebabCase(role);

      expect(runtimeCss).toContain(`--color-ct-${kebabRole}: var(--ct-color-${kebabRole});`);
    }
  });

  it("registers every canonical radius role as a Tailwind ct radius token", () => {
    for (const role of componentThemeRadiusRoles) {
      expect(runtimeCss).toContain(`--radius-ct-${role}: var(--ct-radius-${role});`);
    }
  });

  it("maps prose color slots through ct color aliases instead of raw channel slots", () => {
    expect(runtimeCss).toContain("--tw-prose-body: var(--color-ct-foreground);");
    expect(runtimeCss).toContain("--tw-prose-links: var(--color-ct-accent);");
    expect(runtimeCss).not.toContain("--tw-prose-body: hsl(var(--ct-color-foreground));");
    expect(runtimeCss).not.toContain("background-color: hsl(var(--ct-color-surface));");
  });
});
