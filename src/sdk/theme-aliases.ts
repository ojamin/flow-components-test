import {
  componentThemePropertyRolesByGroup,
  isValidComponentThemePropertyValue,
  type ComponentThemePropertyOverrides,
} from "./theme";

export const componentThemeShadcnColorAliasEntries = [
  ["background", "pageBackground"],
  ["foreground", "foreground"],
  ["card", "surface"],
  ["card-foreground", "cardForeground"],
  ["popover", "popover"],
  ["popover-foreground", "popoverForeground"],
  ["primary", "accent"],
  ["primary-foreground", "accentForeground"],
  ["secondary", "secondary"],
  ["secondary-foreground", "secondaryForeground"],
  ["muted", "surfaceMuted"],
  ["muted-foreground", "foregroundMuted"],
  ["accent", "accentSubtle"],
  ["accent-foreground", "accentSubtleForeground"],
  ["destructive", "destructive"],
  ["destructive-foreground", "destructiveForeground"],
  ["border", "border"],
  ["input", "input"],
  ["ring", "focusRing"],
  ["chart-1", "chart1"],
  ["chart-2", "chart2"],
  ["chart-3", "chart3"],
  ["chart-4", "chart4"],
  ["chart-5", "chart5"],
  ["sidebar", "sidebar"],
  ["sidebar-foreground", "sidebarForeground"],
  ["sidebar-primary", "sidebarPrimary"],
  ["sidebar-primary-foreground", "sidebarPrimaryForeground"],
  ["sidebar-accent", "sidebarAccent"],
  ["sidebar-accent-foreground", "sidebarAccentForeground"],
  ["sidebar-border", "sidebarBorder"],
  ["sidebar-ring", "sidebarRing"],
] as const;

export type ComponentThemeShadcnColorAlias =
  (typeof componentThemeShadcnColorAliasEntries)[number][0];

export type ComponentThemeAliasDiagnostic = {
  readonly path: string;
  readonly reason:
    | "conflicting-theme-property-alias"
    | "invalid-theme-property-value"
    | "unsupported-theme-property-key"
    | "unsupported-theme-alias";
  readonly message: string;
  readonly group?: string;
  readonly key?: string;
  readonly aliasKey?: string;
  readonly canonicalKey?: string;
  readonly expected?: string;
  readonly supportedKeys?: readonly string[];
  readonly suggestions?: readonly string[];
  readonly recovery?: string;
};

export type ComponentThemeAliasNormalizationResult =
  | { readonly ok: true; readonly value: ComponentThemePropertyOverrides }
  | { readonly ok: false; readonly diagnostics: readonly ComponentThemeAliasDiagnostic[] };

const shadcnColorAliasToRole = Object.freeze(
  Object.fromEntries(componentThemeShadcnColorAliasEntries),
) as Readonly<Record<ComponentThemeShadcnColorAlias, string>>;

const componentThemePropertyGroups = Object.keys(componentThemePropertyRolesByGroup);
const componentThemeColorRoles = componentThemePropertyRolesByGroup.color as readonly string[];
const shadcnAliasKeys = componentThemeShadcnColorAliasEntries.map(([alias]) => alias);
const supportedTopLevelKeys = Object.freeze([...componentThemePropertyGroups, ...shadcnAliasKeys]);
const supportedColorKeys = Object.freeze([...componentThemeColorRoles, ...shadcnAliasKeys]);

export function normalizeComponentThemePropertyAliases(
  overrides: Record<string, unknown>,
  path = "propertyOverrides",
): ComponentThemeAliasNormalizationResult {
  const normalized: Record<string, Record<string, unknown>> = {};
  const diagnostics: ComponentThemeAliasDiagnostic[] = [];

  for (const [key, value] of Object.entries(overrides)) {
    if (isThemePropertyGroup(key)) {
      if (isRecord(value)) {
        normalizeGroupProperties(normalized, diagnostics, key, value, `${path}.${key}`);
      } else {
        diagnostics.push({
          path: `${path}.${key}`,
          reason: "invalid-theme-property-value",
          message: "Component theme payload group must be an object.",
          group: key,
          expected: "object of component-theme role values",
          recovery: "Wrap role values in a supported component-theme group object.",
        });
      }
      continue;
    }

    if (isShadcnColorAlias(key)) {
      assignColorAlias(normalized, diagnostics, key, value, `${path}.${key}`);
      continue;
    }

    diagnostics.push(
      createUnsupportedAliasDiagnostic(key, `${path}.${key}`, supportedTopLevelKeys),
    );
  }

  if (diagnostics.length > 0) return { ok: false, diagnostics: sortDiagnostics(diagnostics) };
  return { ok: true, value: normalized as ComponentThemePropertyOverrides };
}

function normalizeGroupProperties(
  normalized: Record<string, Record<string, unknown>>,
  diagnostics: ComponentThemeAliasDiagnostic[],
  group: string,
  groupValue: Record<string, unknown>,
  path: string,
): void {
  const allowedKeys = componentThemePropertyRolesByGroup[
    group as keyof typeof componentThemePropertyRolesByGroup
  ] as readonly string[];
  for (const [key, value] of Object.entries(groupValue)) {
    if (allowedKeys.includes(key)) {
      assignCanonicalValue(normalized, diagnostics, group, key, value, `${path}.${key}`);
      continue;
    }

    if (group === "color" && isShadcnColorAlias(key)) {
      assignColorAlias(normalized, diagnostics, key, value, `${path}.${key}`);
      continue;
    }

    diagnostics.push(
      createUnsupportedAliasDiagnostic(
        key,
        `${path}.${key}`,
        group === "color" ? supportedColorKeys : allowedKeys,
        {
          reason: "unsupported-theme-property-key",
          message: "Component theme payload contains an unsupported property key.",
          group,
        },
      ),
    );
  }
}

function assignColorAlias(
  normalized: Record<string, Record<string, unknown>>,
  diagnostics: ComponentThemeAliasDiagnostic[],
  aliasKey: ComponentThemeShadcnColorAlias,
  value: unknown,
  path: string,
): void {
  assignCanonicalValue(
    normalized,
    diagnostics,
    "color",
    shadcnColorAliasToRole[aliasKey],
    value,
    path,
    aliasKey,
  );
}

function assignCanonicalValue(
  normalized: Record<string, Record<string, unknown>>,
  diagnostics: ComponentThemeAliasDiagnostic[],
  group: string,
  key: string,
  value: unknown,
  path: string,
  aliasKey?: string,
): void {
  const groupValues = (normalized[group] ??= {});
  const canonicalKey = `${group}.${key}`;
  const normalizedValue = group === "color" ? normalizeShadcnColorChannelValue(value) : value;
  if (!isValidComponentThemePropertyValue(group as never, key, normalizedValue)) {
    diagnostics.push({
      path,
      reason: "invalid-theme-property-value",
      message: "Component theme alias normalization received an invalid property value.",
      group,
      key,
      ...(aliasKey ? { aliasKey } : {}),
      canonicalKey,
      expected: group === "motion" ? "valid component-theme value" : "non-empty string",
    });
    return;
  }

  const existing = groupValues[key];
  if (existing !== undefined && existing !== normalizedValue) {
    diagnostics.push({
      path,
      reason: "conflicting-theme-property-alias",
      message: "Component theme payload contains conflicting values for the same canonical role.",
      group,
      key,
      ...(aliasKey ? { aliasKey } : {}),
      canonicalKey,
      recovery: `Keep only one value for ${canonicalKey}, or make the canonical key and shadcn alias values match.`,
    });
    return;
  }
  groupValues[key] = normalizedValue;
}

function normalizeShadcnColorChannelValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  const hslFunction = ["h", "s", "l"].join("");
  return isShadcnHslChannelValue(normalized) ? `${hslFunction}(${normalized})` : value;
}

function isShadcnHslChannelValue(value: string): boolean {
  return /^-?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?\s+-?\d+(?:\.\d+)?%\s+-?\d+(?:\.\d+)?%(?:\s*\/\s*(?:\d+(?:\.\d+)?%?|\.\d+))?$/.test(
    value,
  );
}

function createUnsupportedAliasDiagnostic(
  key: string,
  path: string,
  supportedKeys: readonly string[],
  options: {
    readonly reason?: "unsupported-theme-alias" | "unsupported-theme-property-key";
    readonly message?: string;
    readonly group?: string;
  } = {},
): ComponentThemeAliasDiagnostic {
  const suggestions = suggestKeys(key, supportedKeys);
  return {
    path,
    reason: options.reason ?? "unsupported-theme-alias",
    message:
      options.message ??
      "Component theme payload contains an unsupported shadcn alias or theme property key.",
    ...(options.group === undefined ? {} : { group: options.group }),
    supportedKeys: [...supportedKeys],
    ...(suggestions.length > 0 ? { suggestions } : {}),
    recovery:
      "Use a supported shadcn token alias or the canonical grouped component-theme property key.",
  };
}

function isThemePropertyGroup(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(componentThemePropertyRolesByGroup, value);
}

function isShadcnColorAlias(value: string): value is ComponentThemeShadcnColorAlias {
  return Object.prototype.hasOwnProperty.call(shadcnColorAliasToRole, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sortDiagnostics(
  diagnostics: readonly ComponentThemeAliasDiagnostic[],
): ComponentThemeAliasDiagnostic[] {
  return [...diagnostics].sort((left, right) => {
    const pathCompare = left.path.localeCompare(right.path);
    if (pathCompare !== 0) return pathCompare;
    return left.reason.localeCompare(right.reason);
  });
}

function suggestKeys(input: string, candidates: readonly string[]): string[] {
  const normalized = input.toLowerCase();
  return candidates
    .map((candidate) => ({ candidate, distance: levenshtein(normalized, candidate.toLowerCase()) }))
    .filter(({ candidate, distance }) => distance <= Math.max(2, Math.floor(candidate.length / 3)))
    .sort(
      (left, right) =>
        left.distance - right.distance || left.candidate.localeCompare(right.candidate),
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const current = [leftIndex + 1];
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      current[rightIndex + 1] = Math.min(
        current[rightIndex]! + 1,
        previous[rightIndex + 1]! + 1,
        previous[rightIndex]! + (left[leftIndex] === right[rightIndex] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length] ?? 0;
}
