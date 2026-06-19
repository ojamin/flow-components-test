import { type ThemePropertyKey } from "./theme.js";
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
export declare function validateComponentThemeContract(contract: ComponentThemeContract, context: {
    readonly inputs: readonly {
        id: string;
        acceptedTypeIds: readonly string[];
    }[];
    readonly outputs: readonly {
        id: string;
        typeId: string;
    }[];
}): ComponentThemeContractValidationIssue[];
