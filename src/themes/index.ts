import auroraTheme from "./aurora.json";
import civicResultsTheme from "./civic-results.json";
import commandCenterTheme from "./command-center.json";
import defaultTheme from "./default.json";
import midnightTheme from "./midnight.json";
import sunriseTheme from "./sunrise.json";

import { componentThemeSchema, type ComponentThemeV1 } from "./schema";

export * from "./schema";

export type ComponentThemeRegistry = {
  readonly themes: readonly ComponentThemeV1[];
  readonly ids: readonly string[];
  readonly byId: ReadonlyMap<string, ComponentThemeV1>;
};

function deepFreezeTheme(theme: ComponentThemeV1): ComponentThemeV1 {
  for (const value of Object.values(theme.properties)) {
    Object.freeze(value);
  }
  Object.freeze(theme.properties);
  if (theme.palettes) {
    for (const palette of Object.values(theme.palettes)) {
      if (!palette) continue;
      for (const value of Object.values(palette)) {
        Object.freeze(value);
      }
      Object.freeze(palette);
    }
    Object.freeze(theme.palettes);
  }
  return Object.freeze(theme);
}

export function createComponentThemeRegistry(themes: readonly unknown[]): ComponentThemeRegistry {
  const parsedThemes = themes.map((theme) => deepFreezeTheme(componentThemeSchema.parse(theme)));
  const byId = new Map<string, ComponentThemeV1>();

  for (const theme of parsedThemes) {
    if (byId.has(theme.id)) {
      throw new Error(`Duplicate component theme id "${theme.id}"`);
    }
    byId.set(theme.id, theme);
  }

  return {
    themes: Object.freeze([...parsedThemes]),
    ids: Object.freeze(parsedThemes.map((theme) => theme.id)),
    byId,
  };
}

const builtInComponentThemeRegistry = createComponentThemeRegistry([
  defaultTheme,
  midnightTheme,
  auroraTheme,
  sunriseTheme,
  civicResultsTheme,
  commandCenterTheme,
]);

export const builtInComponentThemes = builtInComponentThemeRegistry.themes;
export const builtInComponentThemeIds = builtInComponentThemeRegistry.ids;

export function getBuiltInComponentTheme(id: string): ComponentThemeV1 | undefined {
  return builtInComponentThemeRegistry.byId.get(id);
}
