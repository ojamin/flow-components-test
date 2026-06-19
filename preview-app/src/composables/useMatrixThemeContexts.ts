// Module intent: precompute light and dark built-in component-theme contexts
// (and their CSS-variable maps) for the matrix route's two theme columns.
// Without this split, both columns would inherit identical light `--ct-*`
// tokens, leaving dark-mode renderer surfaces (disabled chrome, muted text,
// accent fills) with collapsed contrast against the `.dark` background.
// Bridge scope ids stay unique per cell so the cleanup directive only removes
// its own style element on unmount.

import { createThemeCssVariableMap, getBuiltInComponentTheme } from "@flow-builder/components/sdk";
import type { ComponentThemeContext } from "@flow-builder/components/sdk";

import type { MatrixCellState } from "../components/MatrixCell.vue";
import type { PreviewThemeStyleBridgeInput } from "../components/preview-theme-style-bridge";

export type MatrixThemeColumn = "light" | "dark";

export interface MatrixThemeContexts {
  themeContextFor(themeColumn: MatrixThemeColumn): ComponentThemeContext | undefined;
  cellThemeBridge(
    themeColumn: MatrixThemeColumn,
    state: MatrixCellState,
  ): PreviewThemeStyleBridgeInput | undefined;
}

export function useMatrixThemeContexts(): MatrixThemeContexts {
  const lightBuiltInTheme = getBuiltInComponentTheme("default");
  const darkBuiltInTheme = getBuiltInComponentTheme("midnight");

  const lightThemeContext: ComponentThemeContext | undefined = lightBuiltInTheme
    ? Object.freeze({
        themeId: lightBuiltInTheme.id,
        properties: lightBuiltInTheme.properties,
      })
    : undefined;
  const darkThemeContext: ComponentThemeContext | undefined = darkBuiltInTheme
    ? Object.freeze({
        themeId: darkBuiltInTheme.id,
        properties: darkBuiltInTheme.properties,
      })
    : undefined;

  const lightThemeCssVariables = lightThemeContext
    ? createThemeCssVariableMap(lightThemeContext)
    : undefined;
  const darkThemeCssVariables = darkThemeContext
    ? createThemeCssVariableMap(darkThemeContext)
    : undefined;

  function themeContextFor(themeColumn: MatrixThemeColumn): ComponentThemeContext | undefined {
    return themeColumn === "dark" ? darkThemeContext : lightThemeContext;
  }

  function cellThemeBridge(
    themeColumn: MatrixThemeColumn,
    state: MatrixCellState,
  ): PreviewThemeStyleBridgeInput | undefined {
    const cssVariables = themeColumn === "dark" ? darkThemeCssVariables : lightThemeCssVariables;
    const context = themeContextFor(themeColumn);
    if (!context || !cssVariables) return undefined;
    return {
      scopeId: `package-preview-matrix-${themeColumn}-${state}`,
      cssVariables,
    };
  }

  return { themeContextFor, cellThemeBridge };
}
