import type { ComponentManifestGroup } from "../manifest.js";
/**
 * Catalog/folder taxonomy. Mirrors the directory under packages/components/src/groups/.
 * Adding a group requires creating the folder, updating manifest.ts's
 * componentManifestGroupSchema, and adding an entry to groupToCategory below.
 */
export type ComponentGroupId = ComponentManifestGroup;
/**
 * UX classification used by builder pickers and inspector tinting. May be broader than
 * ComponentGroupId (e.g. includes "media" and "utility" classifications that don't have a
 * corresponding folder group).
 */
export type ComponentCategory = "layout" | "content" | "media" | "chart" | "civic" | "data" | "marketing" | "transform" | "utility";
/**
 * Canonical mapping from taxonomy group to default UX category. Drift validation
 * enforces parity: a definition's category must equal groupToCategory[manifest.group].
 *
 * If a category is broader than its group (e.g. some "content" components are tagged
 * "media" in the UX), that's a per-component override and is rejected by drift
 * validation unless the override is explicitly listed in categoryOverrides below.
 */
export declare const groupToCategory: {
    chart: "chart";
    civic: "civic";
    content: "content";
    data: "data";
    layout: "layout";
    marketing: "marketing";
    theme: "utility";
    transform: "transform";
    vmap1: "media";
    viz: "chart";
};
/** Per-component category overrides. Empty by default; add only with a documented rationale. */
export declare const categoryOverrides: Partial<Record<string, ComponentCategory>>;
