// Source-owned component theme-consumption contract metadata. Components
// declare the canonical theme roles (color/font/radius/spacing/motion) their
// renderer or config UI consumes, and provider components declare which
// output ports publish `component-theme` payloads. Agent Connect discovery
// surfaces (Task 4.2/4.3/4.5) and the host theme resolver project this
// metadata directly from the package contract instead of scraping renderer
// DOM, reading static Vue source, or maintaining a route-local token map.
//
// This contract started as an optional rollout seed (Task 4.4/Task 9). Task 10
// hardens package validation so shipped built-ins must declare the source-owned
// contract rather than relying on legacy discovery fallbacks.

import {
  componentThemePropertyRolesByGroup,
  type ComponentThemePropertyGroup,
  type ThemePropertyKey,
} from "./theme";

/**
 * One theme role the component consumes through SDK helpers
 * (`resolveThemeProperty`/`createThemeCssVariableMap`), Tailwind
 * component-theme aliases (`bg-ct-*`, `text-ct-*`, `font-ct-*`,
 * `rounded-ct-*`), or scoped `--ct-*` CSS variables emitted by the host
 * theme bridge. Declaring a role here is an authoring contract: agents may
 * rely on the role being meaningful for the component, and the component's
 * renderer/contract tests must show the role actually surfaces in the
 * rendered output.
 */
export interface ComponentThemeConsumptionEntry {
  /** Canonical theme property key (e.g. `"color.accent"`, `"font.heading"`). */
  readonly propertyKey: ThemePropertyKey;
  /**
   * Short human-readable note for catalog/route projection. Should describe
   * the visible site element or rendered surface the role controls — not a
   * Tailwind class name or DOM selector.
   */
  readonly note?: string;
  /**
   * True when the role is only consumed under specific config branches
   * (e.g. a particular `surfaceTreatment`). Helps agents understand why an
   * override may not always take visible effect.
   */
  readonly conditional?: boolean;
}

/**
 * One declared theme producer entry for components such as `theme.theme`
 * that publish a `component-theme` payload through an output port.
 */
export interface ComponentThemeProductionEntry {
  /** Output port id that publishes the theme payload. Must exist in `outputs`. */
  readonly outputId: string;
  /** Optional note describing what is published. */
  readonly note?: string;
}

/**
 * Declared theme inheritance for layout/root components that accept a
 * `component-theme` input port and propagate the resolved theme to
 * descendant placements (e.g. `layout.main-page`). Distinguishes
 * inheritance hosts from leaf consumers without overloading `produces`.
 */
export interface ComponentThemeInheritanceEntry {
  /** Input port id typed `component-theme` that drives inheritance. */
  readonly inputId: string;
  /** Optional note (e.g. `"Page-level theme inheritance seam"`). */
  readonly note?: string;
}

export interface ComponentThemeContract {
  /**
   * Roles the component's renderer/config UI consumes. Empty array means the
   * component explicitly declares no theme consumption (e.g. a headless
   * producer); omitting the contract field entirely means consumption is
   * undeclared and downstream surfaces should fall back to legacy discovery.
   */
  readonly consumes: readonly ComponentThemeConsumptionEntry[];
  /**
   * Output ports that publish `component-theme` payloads. Present on
   * provider components (e.g. `theme.theme`).
   */
  readonly produces?: readonly ComponentThemeProductionEntry[];
  /**
   * Input ports that drive theme inheritance for descendants. Present on
   * layout roots (e.g. `layout.main-page`).
   */
  readonly inherits?: readonly ComponentThemeInheritanceEntry[];
}

export type ComponentThemeContractValidationIssue = {
  readonly field: string;
  readonly message: string;
};

/**
 * Validate a `ComponentThemeContract` against the canonical theme registry
 * and a component's declared inputs/outputs. Used by component contract
 * tests and the future hard-enforcement gate.
 */
export function validateComponentThemeContract(
  contract: ComponentThemeContract,
  context: {
    readonly inputs: readonly { id: string; acceptedTypeIds: readonly string[] }[];
    readonly outputs: readonly { id: string; typeId: string }[];
  },
): ComponentThemeContractValidationIssue[] {
  const issues: ComponentThemeContractValidationIssue[] = [];
  const validPropertyKeys = collectValidPropertyKeys();
  const seenConsumes = new Set<string>();

  contract.consumes.forEach((entry, index) => {
    if (!validPropertyKeys.has(entry.propertyKey)) {
      issues.push({
        field: `consumes[${index}].propertyKey`,
        message: `Unknown theme property key "${entry.propertyKey}".`,
      });
      return;
    }
    if (seenConsumes.has(entry.propertyKey)) {
      issues.push({
        field: `consumes[${index}].propertyKey`,
        message: `Duplicate consumed property key "${entry.propertyKey}".`,
      });
    }
    seenConsumes.add(entry.propertyKey);
  });

  contract.produces?.forEach((entry, index) => {
    const output = context.outputs.find((candidate) => candidate.id === entry.outputId);
    if (!output) {
      issues.push({
        field: `produces[${index}].outputId`,
        message: `Unknown output port "${entry.outputId}".`,
      });
      return;
    }
    if (output.typeId !== "component-theme") {
      issues.push({
        field: `produces[${index}].outputId`,
        message: `Output port "${entry.outputId}" must publish "component-theme" (got "${output.typeId}").`,
      });
    }
  });

  contract.inherits?.forEach((entry, index) => {
    const input = context.inputs.find((candidate) => candidate.id === entry.inputId);
    if (!input) {
      issues.push({
        field: `inherits[${index}].inputId`,
        message: `Unknown input port "${entry.inputId}".`,
      });
      return;
    }
    if (!input.acceptedTypeIds.includes("component-theme")) {
      issues.push({
        field: `inherits[${index}].inputId`,
        message: `Input port "${entry.inputId}" must accept "component-theme" (accepted: ${input.acceptedTypeIds.join(", ") || "<none>"}).`,
      });
    }
  });

  return issues;
}

function collectValidPropertyKeys(): ReadonlySet<string> {
  const keys = new Set<string>();
  for (const [group, roles] of Object.entries(componentThemePropertyRolesByGroup)) {
    for (const role of roles) {
      keys.add(`${group as ComponentThemePropertyGroup}.${role as string}`);
    }
  }
  return keys;
}
