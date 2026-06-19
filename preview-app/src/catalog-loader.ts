import { staticComponentPackageCatalog } from "@flow-builder/components/catalog";
import { staticComponentSourceManifest } from "@flow-builder/components/source-manifest";
import type {
  ComponentCatalogEntry,
  ComponentDefinition,
  ComponentGroupId,
  ComponentManifestSummary,
} from "@flow-builder/components/sdk";

export type { ComponentManifestSummary };

// Module intent: provide typed catalog data helpers consumed by the browser view.
// Imports only from @flow-builder/components public facades — never from host app internals.

/** A section within a catalog group (source: source-manifest section field). */
export interface CatalogSection {
  id: string;
  /** Display-ready label derived from the source-manifest section ID (title-cased). */
  label: string;
  components: ComponentCatalogEntry[];
}

/** A catalog group with its sections, each containing ordered member entries. */
export interface CatalogGroupWithSections {
  id: ComponentGroupId;
  /** Display name from source manifest, falling back to title-cased group ID. */
  label: string;
  sections: CatalogSection[];
}

/** A catalog entry enriched with definition metadata and source-manifest section. */
export interface EnrichedCatalogEntry extends ComponentCatalogEntry {
  /** Undefined only if the catalog is somehow inconsistent. */
  definition: ComponentDefinition | undefined;
  /** Section ID from the source manifest (e.g. "basic", "media", "data"). */
  section: string | undefined;
}

/** Title-case a section ID for display (e.g. "basic" → "Basic"). */
function toSectionLabel(sectionId: string): string {
  return sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

/**
 * Returns catalog groups in catalog-defined order, each carrying its sections
 * (derived from source-manifest component section metadata) and their member entries.
 * Group display names come from the source manifest when available.
 */
export function loadCatalogGroups(): CatalogGroupWithSections[] {
  const { groups: groupIds, components } = staticComponentPackageCatalog;

  // Build component-id → section map from source manifest.
  const sectionById = new Map<string, string>();
  for (const mc of staticComponentSourceManifest.components) {
    if (mc.section) sectionById.set(mc.id, mc.section);
  }

  // Build group-id → displayName map from source manifest.
  const groupDisplayName = new Map<string, string>();
  for (const mg of staticComponentSourceManifest.groups) {
    groupDisplayName.set(mg.id, mg.displayName);
  }

  return groupIds.map((id) => {
    const groupComponents = components.filter((c) => c.group === id);
    const label = groupDisplayName.get(id) ?? toSectionLabel(id);

    // Build sections in component insertion order (first appearance determines position).
    const sectionOrder: string[] = [];
    const sectionComponents = new Map<string, ComponentCatalogEntry[]>();
    for (const comp of groupComponents) {
      const sectionId = sectionById.get(comp.id) ?? "other";
      if (!sectionComponents.has(sectionId)) {
        sectionOrder.push(sectionId);
        sectionComponents.set(sectionId, []);
      }
      sectionComponents.get(sectionId)!.push(comp);
    }

    const sections: CatalogSection[] = sectionOrder.map((sectionId) => ({
      id: sectionId,
      label: toSectionLabel(sectionId),
      components: sectionComponents.get(sectionId)!,
    }));

    return { id, label, sections };
  });
}

/** Total number of components across the entire catalog. */
export function loadCatalogCount(): number {
  return staticComponentPackageCatalog.components.length;
}

/** Returns an entry enriched with its definition and section, or undefined if the id is unknown. */
export function loadEnrichedEntry(id: string): EnrichedCatalogEntry | undefined {
  const entry = staticComponentPackageCatalog.components.find((c) => c.id === id);
  if (!entry) return undefined;
  const definition = staticComponentPackageCatalog.definitions.find((d) => d.id === id);
  const manifestEntry = staticComponentSourceManifest.components.find((c) => c.id === id);
  return { ...entry, definition, section: manifestEntry?.section };
}

/**
 * Returns a map of component ID → tags array from the source manifest.
 * Used for tag-aware text search in the browser filter composable.
 */
export function loadTagsByComponentId(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const mc of staticComponentSourceManifest.components) {
    if (mc.tags.length > 0) map.set(mc.id, mc.tags);
  }
  return map;
}

/** Discriminated union for the outcome of loading catalog groups. */
export type CatalogLoadResult =
  | { status: "loading" }
  | { status: "ready"; groups: CatalogGroupWithSections[] }
  | { status: "error"; message: string };

/**
 * Wraps loadCatalogGroups() in a try/catch and returns a typed result union.
 * Allows the browser view to show a polished error state without runtime crashes.
 */
export function loadCatalogResult(): CatalogLoadResult {
  try {
    return { status: "ready", groups: loadCatalogGroups() };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Catalog load failed.",
    };
  }
}

/** Returns the source-manifest summary for a component by ID, or undefined if not found. */
export function loadManifestEntry(id: string): ComponentManifestSummary | undefined {
  return staticComponentSourceManifest.components.find((c) => c.id === id);
}

/** Package-level source fingerprints from the generated source manifest. */
export interface SourceFingerprints {
  manifestHash: string;
  filesHash: string;
}

/**
 * Returns the package-level source fingerprints (manifestHash + filesHash) from the
 * generated source manifest. These are deterministic hashes over all component files
 * and the manifest itself, useful for verifying package integrity at a glance.
 */
export function loadSourceFingerprints(): SourceFingerprints {
  return staticComponentSourceManifest.fingerprints;
}
