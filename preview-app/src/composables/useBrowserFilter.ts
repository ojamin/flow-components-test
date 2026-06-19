import { computed, ref } from "vue";

import type { CatalogGroupWithSections, CatalogSection } from "../catalog-loader";

// Module intent: browser search/filter/sort state as a pure Vue composable.
// No DOM dependencies — can be unit-tested by importing directly without mounting a component.

/** Sort order for components within each section. */
export type SortOrder = "catalog" | "asc" | "desc";

/** Immutable map of component ID → tags sourced from the manifest. */
export type TagsByComponentId = ReadonlyMap<string, readonly string[]>;

/**
 * Returns true when the entry's id, title, description, or any tag contains the query
 * (case-insensitive substring match).
 */
function matchesQuery(
  entry: { id: string; title: string; description?: string },
  tags: readonly string[],
  query: string,
): boolean {
  const q = query.toLowerCase();
  return (
    entry.id.toLowerCase().includes(q) ||
    entry.title.toLowerCase().includes(q) ||
    (entry.description ?? "").toLowerCase().includes(q) ||
    tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

/**
 * Composable that owns browser search, group/section filter, and sort state.
 * Accepts the full group hierarchy and tag map from catalog-loader; returns
 * computed derived state and imperative control helpers.
 */
export function useBrowserFilter(
  groups: CatalogGroupWithSections[],
  tagsByComponentId: TagsByComponentId,
) {
  const searchQuery = ref("");
  const selectedGroupId = ref<string | null>(null);
  const selectedSectionId = ref<string | null>(null);
  const sortOrder = ref<SortOrder>("catalog");

  // All group IDs from the catalog in their display order (stable, not reactive).
  const allGroupIds = groups.map((g) => g.id);

  // Label per group ID for display in the controls dropdown.
  const groupLabelById = new Map(groups.map((g) => [g.id, g.label]));

  // Sections available in the current group context (all groups when none selected).
  const availableSections = computed((): CatalogSection[] => {
    const sourceGroups = selectedGroupId.value
      ? groups.filter((g) => g.id === selectedGroupId.value)
      : groups;
    const seen = new Set<string>();
    const result: CatalogSection[] = [];
    for (const group of sourceGroups) {
      for (const section of group.sections) {
        if (!seen.has(section.id)) {
          seen.add(section.id);
          result.push(section);
        }
      }
    }
    return result;
  });

  const filteredGroups = computed((): CatalogGroupWithSections[] => {
    const q = searchQuery.value.trim();
    const groupFilter = selectedGroupId.value;
    const sectionFilter = selectedSectionId.value;
    const sort = sortOrder.value;

    const sourceGroups = groupFilter ? groups.filter((g) => g.id === groupFilter) : groups;
    const result: CatalogGroupWithSections[] = [];

    for (const group of sourceGroups) {
      const filteredSections: CatalogSection[] = [];

      for (const section of group.sections) {
        if (sectionFilter !== null && section.id !== sectionFilter) continue;

        let components = q
          ? section.components.filter((entry) =>
              matchesQuery(entry, tagsByComponentId.get(entry.id) ?? [], q),
            )
          : section.components.slice();

        if (sort === "asc") {
          components = [...components].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === "desc") {
          components = [...components].sort((a, b) => b.title.localeCompare(a.title));
        }

        if (components.length > 0) filteredSections.push({ ...section, components });
      }

      if (filteredSections.length > 0) result.push({ ...group, sections: filteredSections });
    }

    return result;
  });

  const totalMatches = computed(() =>
    filteredGroups.value.reduce(
      (n, g) => n + g.sections.reduce((s, sec) => s + sec.components.length, 0),
      0,
    ),
  );

  const hasActiveFilters = computed(
    () =>
      searchQuery.value.trim() !== "" ||
      selectedGroupId.value !== null ||
      selectedSectionId.value !== null ||
      sortOrder.value !== "catalog",
  );

  function clearFilters(): void {
    searchQuery.value = "";
    selectedGroupId.value = null;
    selectedSectionId.value = null;
    sortOrder.value = "catalog";
  }

  /**
   * Set the active group filter and synchronously clear a section selection
   * that no longer exists in the new group context.
   */
  function setGroupFilter(groupId: string | null): void {
    selectedGroupId.value = groupId;
    if (selectedSectionId.value !== null) {
      const scopedGroups = groupId ? groups.filter((g) => g.id === groupId) : groups;
      const sectionExists = scopedGroups.some((g) =>
        g.sections.some((s) => s.id === selectedSectionId.value),
      );
      if (!sectionExists) selectedSectionId.value = null;
    }
  }

  return {
    searchQuery,
    selectedGroupId,
    selectedSectionId,
    sortOrder,
    filteredGroups,
    totalMatches,
    hasActiveFilters,
    availableSections,
    allGroupIds,
    groupLabelById,
    clearFilters,
    setGroupFilter,
  };
}
