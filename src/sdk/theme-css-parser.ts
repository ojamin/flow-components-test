import {
  componentThemeShadcnColorAliasEntries,
  normalizeComponentThemePropertyAliases,
  type ComponentThemeAliasDiagnostic,
  type ComponentThemeShadcnColorAlias,
} from "./theme-aliases";
import type { ComponentThemePropertyOverrides } from "./theme";

export type ComponentThemeCssBlockName = "light" | "dark";

export type ComponentThemeCssBlockParseValue = {
  readonly light?: ComponentThemePropertyOverrides;
  readonly dark?: ComponentThemePropertyOverrides;
};

export type ComponentThemeCssDiagnosticReason =
  | ComponentThemeAliasDiagnostic["reason"]
  | "theme-css-block-not-found"
  | "unsupported-theme-css-selector"
  | "unsupported-theme-css-declaration";

export type ComponentThemeCssDiagnostic = Omit<ComponentThemeAliasDiagnostic, "reason"> & {
  readonly reason: ComponentThemeCssDiagnosticReason;
  readonly selector?: string;
  readonly declarationIndex?: number;
};

export type ComponentThemeCssBlockParseResult =
  | { readonly ok: true; readonly value: ComponentThemeCssBlockParseValue }
  | { readonly ok: false; readonly diagnostics: readonly ComponentThemeCssDiagnostic[] };

export const shadcnRadiusBaseRole = "lg" as const;

const shadcnAliasToRole = Object.freeze(
  Object.fromEntries(componentThemeShadcnColorAliasEntries),
) as Readonly<Record<ComponentThemeShadcnColorAlias, string>>;

const cssBlockPattern = /([^{}]+)\{([^{}]*)\}/g;
const cssCommentPattern = /\/\*[\s\S]*?\*\//g;
const customPropertyPattern = /^--([A-Za-z0-9_-]+)\s*:\s*([\s\S]+)$/u;

export function parseShadcnThemeCssBlocks(
  cssText: string,
  path = "themeCss",
): ComponentThemeCssBlockParseResult {
  const value: Record<ComponentThemeCssBlockName, ComponentThemePropertyOverrides | undefined> = {
    light: undefined,
    dark: undefined,
  };
  const diagnostics: ComponentThemeCssDiagnostic[] = [];
  const cssWithoutComments = cssText.replace(cssCommentPattern, "");
  let supportedBlockCount = 0;
  let blockIndex = 0;

  for (const match of cssWithoutComments.matchAll(cssBlockPattern)) {
    const selector = match[1]?.trim() ?? "";
    const blockName = selectorToBlockName(selector);
    if (!blockName) {
      diagnostics.push({
        path: `${path}.selector[${blockIndex}]`,
        reason: "unsupported-theme-css-selector",
        message: "Theme CSS import only supports :root and .dark variable blocks.",
        selector,
        recovery: "Paste shadcn theme variables inside a :root or .dark block.",
      });
      blockIndex += 1;
      continue;
    }

    supportedBlockCount += 1;
    const parsedBlock = parseSupportedBlock(match[2] ?? "", blockName, path);
    diagnostics.push(...parsedBlock.diagnostics);
    if (parsedBlock.overrides) value[blockName] = parsedBlock.overrides;
    blockIndex += 1;
  }

  if (supportedBlockCount === 0) {
    diagnostics.push({
      path,
      reason: "theme-css-block-not-found",
      message: "Theme CSS import did not contain a supported :root or .dark block.",
      recovery: "Paste a shadcn :root block, .dark block, or both blocks before importing.",
    });
  }

  if (diagnostics.length > 0) return { ok: false, diagnostics: sortDiagnostics(diagnostics) };

  return {
    ok: true,
    value: {
      ...(value.light ? { light: value.light } : {}),
      ...(value.dark ? { dark: value.dark } : {}),
    },
  };
}

function parseSupportedBlock(
  blockBody: string,
  blockName: ComponentThemeCssBlockName,
  basePath: string,
): {
  readonly overrides?: ComponentThemePropertyOverrides;
  readonly diagnostics: readonly ComponentThemeCssDiagnostic[];
} {
  const declarations = blockBody.split(";");
  const aliases: Record<string, unknown> = {};
  const canonicalValues: Record<string, string> = {};
  const diagnostics: ComponentThemeCssDiagnostic[] = [];

  declarations.forEach((rawDeclaration, declarationIndex) => {
    const declaration = rawDeclaration.trim();
    if (!declaration) return;

    const customProperty = customPropertyPattern.exec(declaration);
    if (!customProperty) {
      diagnostics.push({
        path: `${basePath}.${blockName}.declaration[${declarationIndex}]`,
        reason: "unsupported-theme-css-declaration",
        message: "Theme CSS import only supports CSS custom property declarations.",
        declarationIndex,
        recovery: "Remove non-variable CSS declarations before importing theme data.",
      });
      return;
    }

    const token = customProperty[1] ?? "";
    const trimmedValue = (customProperty[2] ?? "").trim();
    if (token === "radius") {
      assignShadcnRadius(aliases, trimmedValue);
      return;
    }

    const role = shadcnAliasToRole[token as ComponentThemeShadcnColorAlias];
    if (role && canonicalValues[role] !== undefined && canonicalValues[role] !== trimmedValue) {
      diagnostics.push(createConflictDiagnostic(basePath, blockName, token, role));
      return;
    }

    aliases[token] = trimmedValue;
    if (role) canonicalValues[role] = trimmedValue;
  });

  const normalized = normalizeComponentThemePropertyAliases(aliases, `${basePath}.${blockName}`);
  if (!normalized.ok) {
    diagnostics.push(...normalized.diagnostics);
    return { diagnostics: sortDiagnostics(diagnostics) };
  }

  return {
    overrides: normalized.value,
    diagnostics: sortDiagnostics(diagnostics),
  };
}

function assignShadcnRadius(aliases: Record<string, unknown>, value: string): void {
  aliases.radius = {
    sm: `calc(${value} - 4px)`,
    md: `calc(${value} - 2px)`,
    [shadcnRadiusBaseRole]: value,
    xl: `calc(${value} + 4px)`,
    full: "9999px",
  };
}

function selectorToBlockName(selector: string): ComponentThemeCssBlockName | undefined {
  if (selector === ":root") return "light";
  if (selector === ".dark") return "dark";
  return undefined;
}

function createConflictDiagnostic(
  basePath: string,
  blockName: ComponentThemeCssBlockName,
  token: string,
  role: string,
): ComponentThemeCssDiagnostic {
  return {
    path: `${basePath}.${blockName}.${token}`,
    reason: "conflicting-theme-property-alias",
    message: "Component theme payload contains conflicting values for the same canonical role.",
    group: "color",
    key: role,
    aliasKey: token,
    canonicalKey: `color.${role}`,
    recovery: `Keep only one value for color.${role}, or make repeated shadcn CSS variable values match.`,
  };
}

function sortDiagnostics(
  diagnostics: readonly ComponentThemeCssDiagnostic[],
): ComponentThemeCssDiagnostic[] {
  return [...diagnostics].sort((left, right) => {
    const pathCompare = left.path.localeCompare(right.path);
    if (pathCompare !== 0) return pathCompare;
    return left.reason.localeCompare(right.reason);
  });
}
