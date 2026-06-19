import { z } from "zod";

import type { DynamicSlotMetadata, SlotDefinition } from "../../sdk/component-definition";
import { createUuid } from "../../sdk/create-uuid";

const nonEmptyTrimmedString = z.string().trim().min(1);
const safeHashSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const defaultViewContainerItemLabel = "New view";

export interface ViewContainerItem {
  id: string;
  label: string;
  hashSlug?: string;
  disabled?: boolean;
}

export interface NormalizedViewContainerItem extends ViewContainerItem {
  disabled: boolean;
}

export interface CreateViewContainerSlotsOptions {
  slotIdPrefix?: string;
}

export interface CreateViewContainerItemOptions {
  label?: string;
  hashSlug?: unknown;
  disabled?: boolean;
  idFactory?: () => string;
}

export const viewContainerDynamicSlotMetadata = [
  {
    canonicalIdTemplate: "view:<configured-view-id>",
    configSource: "views[].id",
    configSourceDescription:
      "Uses each normalized view id from the effective views config; resolveSlots remains the runtime source for realized slots.",
    acceptsChildren: true,
    childScopeMode: "inherit",
    layoutKind: "grid",
    exampleConfig: { views: [{ id: "alpha" }] },
  },
] as const satisfies readonly DynamicSlotMetadata[];

export const viewContainerItemSchema = z.object({
  id: nonEmptyTrimmedString,
  label: nonEmptyTrimmedString,
  hashSlug: z.string().optional(),
  disabled: z.boolean().optional(),
});

export const viewContainerItemsSchema = z.array(viewContainerItemSchema);

export const viewContainerActiveViewIdSchema = nonEmptyTrimmedString.optional();

export const hashSlugSchema = z.string().regex(safeHashSlugPattern);

export const viewRequestedPayloadSchema = z.object({
  activeViewId: nonEmptyTrimmedString,
  hashSlug: hashSlugSchema.optional(),
});

export const viewChangedPayloadSchema = z.object({
  activeViewId: nonEmptyTrimmedString,
  previousViewId: nonEmptyTrimmedString.optional(),
  hashSlug: hashSlugSchema.optional(),
});

export const viewContainerEventPayloadSchemas = {
  viewRequested: viewRequestedPayloadSchema,
  viewChanged: viewChangedPayloadSchema,
} as const;

export type ViewRequestedPayload = z.infer<typeof viewRequestedPayloadSchema>;
export type ViewChangedPayload = z.infer<typeof viewChangedPayloadSchema>;

interface ParsedViewContainerItem extends NormalizedViewContainerItem {
  hashSlug?: string;
}

export function normalizeViewContainerItems(
  items: readonly unknown[],
): NormalizedViewContainerItem[] {
  const parsedItems = parseUniqueItems(items);
  const hashSlugs = resolveUniqueHashSlugs(parsedItems);

  return parsedItems.map((item, index) => ({
    id: item.id,
    label: item.label,
    ...(hashSlugs[index] ? { hashSlug: hashSlugs[index] } : {}),
    disabled: item.disabled,
  }));
}

export function resolveActiveViewId(
  items: readonly ViewContainerItem[],
  requestedId?: string | null,
): string | undefined {
  const normalizedItems = normalizeViewContainerItems(items);
  const requested = typeof requestedId === "string" ? requestedId.trim() : undefined;
  const requestedItem = normalizedItems.find((item) => item.id === requested);

  if (requestedItem && !requestedItem.disabled) {
    return requestedItem.id;
  }

  return normalizedItems.find((item) => !item.disabled)?.id;
}

export function createViewContainerSlots(
  items: readonly ViewContainerItem[],
  options: CreateViewContainerSlotsOptions = {},
): SlotDefinition[] {
  const slotIdPrefix = options.slotIdPrefix ?? "view:";

  return normalizeViewContainerItems(items).map((item) => ({
    id: `${slotIdPrefix}${item.id}`,
    label: item.label,
    acceptsChildren: true,
    childScopeMode: "inherit",
    layoutKind: "grid",
  }));
}

export function createViewContainerItem(
  options: CreateViewContainerItemOptions = {},
): ViewContainerItem {
  const id = normalizeOptionalString(options.idFactory?.()) ?? createUuid();
  const label = normalizeViewContainerItemLabel(options.label);
  const hashSlug = normalizeHashSlug(options.hashSlug);

  return {
    id,
    label,
    ...(hashSlug ? { hashSlug } : {}),
    ...(typeof options.disabled === "boolean" ? { disabled: options.disabled } : {}),
  };
}

export function renameViewContainerItem(
  items: readonly ViewContainerItem[],
  itemId: string,
  label: string,
): ViewContainerItem[] {
  const normalizedLabel = normalizeViewContainerItemLabel(label);

  return updateViewContainerItem(items, itemId, (item) => {
    if (item.label === normalizedLabel) return item;

    return {
      ...item,
      label: normalizedLabel,
    };
  });
}

export function reorderViewContainerItems(
  items: readonly ViewContainerItem[],
  itemId: string,
  targetIndex: number,
): ViewContainerItem[] {
  const currentIndex = items.findIndex((item) => item.id === itemId);
  if (currentIndex < 0) return items as ViewContainerItem[];

  const reorderedItems = [...items];
  const [item] = reorderedItems.splice(currentIndex, 1);
  if (!item) return items as ViewContainerItem[];

  const clampedTargetIndex = clampIndex(targetIndex, reorderedItems.length);
  if (clampedTargetIndex === currentIndex) return items as ViewContainerItem[];

  reorderedItems.splice(clampedTargetIndex, 0, item);

  return reorderedItems;
}

export function setViewContainerItemHashSlug(
  items: readonly ViewContainerItem[],
  itemId: string,
  hashSlug: unknown,
): ViewContainerItem[] {
  const normalizedHashSlug = normalizeHashSlug(hashSlug);

  return updateViewContainerItem(items, itemId, (item) => {
    if (item.hashSlug === normalizedHashSlug) return item;

    const { hashSlug: _previousHashSlug, ...itemWithoutHashSlug } = item;
    return {
      ...itemWithoutHashSlug,
      ...(normalizedHashSlug ? { hashSlug: normalizedHashSlug } : {}),
    };
  });
}

export function setViewContainerItemDisabled(
  items: readonly ViewContainerItem[],
  itemId: string,
  disabled: boolean,
): ViewContainerItem[] {
  return updateViewContainerItem(items, itemId, (item) => {
    if ((item.disabled ?? false) === disabled) return item;

    return {
      ...item,
      disabled,
    };
  });
}

export function deleteViewContainerItem(
  items: readonly ViewContainerItem[],
  itemId: string,
): ViewContainerItem[] {
  if (!items.some((item) => item.id === itemId)) return items as ViewContainerItem[];

  return items.filter((item) => item.id !== itemId);
}

export function normalizeHashSlug(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const slug = value
    .trim()
    .replace(/^#+/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || undefined;
}

function parseUniqueItems(items: readonly unknown[]): ParsedViewContainerItem[] {
  const seenIds = new Set<string>();
  const parsedItems: ParsedViewContainerItem[] = [];

  for (const item of items) {
    const result = viewContainerItemSchema.safeParse(item);
    if (!result.success || seenIds.has(result.data.id)) continue;

    seenIds.add(result.data.id);
    parsedItems.push({
      id: result.data.id,
      label: result.data.label,
      ...(result.data.hashSlug ? { hashSlug: result.data.hashSlug } : {}),
      disabled: result.data.disabled ?? false,
    });
  }

  return parsedItems;
}

function resolveUniqueHashSlugs(
  items: readonly ParsedViewContainerItem[],
): Array<string | undefined> {
  const normalizedByIndex = items.map((item) => normalizeHashSlug(item.hashSlug));
  const baseCounts = countValues(normalizedByIndex);
  const desiredSlugs = normalizedByIndex.map((baseSlug, index) => {
    if (!baseSlug) return undefined;

    const item = items[index];
    if (!item) return undefined;

    return baseCounts.get(baseSlug) === 1
      ? baseSlug
      : `${baseSlug}-${normalizeItemIdForSlug(item.id)}`;
  });

  return resolveSlugCollisions(desiredSlugs, items);
}

function resolveSlugCollisions(
  desiredSlugs: ReadonlyArray<string | undefined>,
  items: readonly ParsedViewContainerItem[],
): Array<string | undefined> {
  const slugIndices = new Map<string, number[]>();
  const resolvedSlugs: Array<string | undefined> = Array.from({ length: desiredSlugs.length });

  desiredSlugs.forEach((slug, index) => {
    if (!slug) return;
    slugIndices.set(slug, [...(slugIndices.get(slug) ?? []), index]);
  });

  for (const [slug, indices] of slugIndices.entries()) {
    if (indices.length === 1) {
      const onlyIndex = indices[0];
      if (onlyIndex !== undefined) resolvedSlugs[onlyIndex] = slug;
      continue;
    }

    const orderedIndices = [...indices].sort((left, right) =>
      (items[left]?.id ?? "").localeCompare(items[right]?.id ?? ""),
    );
    orderedIndices.forEach((index, orderedIndex) => {
      const item = items[index];
      if (!item) return;

      const candidate = `${slug}-${normalizeItemIdForSlug(item.id)}`;
      resolvedSlugs[index] = orderedIndex === 0 ? candidate : `${candidate}-${orderedIndex + 1}`;
    });
  }

  return resolvedSlugs;
}

function updateViewContainerItem(
  items: readonly ViewContainerItem[],
  itemId: string,
  updateItem: (item: ViewContainerItem) => ViewContainerItem,
): ViewContainerItem[] {
  if (!items.some((item) => item.id === itemId)) return items as ViewContainerItem[];

  let changed = false;
  const updatedItems = items.map((item) => {
    if (item.id !== itemId) return item;

    const updatedItem = updateItem(item);
    if (updatedItem !== item) changed = true;

    return updatedItem;
  });

  return changed ? updatedItems : (items as ViewContainerItem[]);
}

function normalizeViewContainerItemLabel(label: string | undefined): string {
  return normalizeOptionalString(label) ?? defaultViewContainerItemLabel;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized || undefined;
}

function clampIndex(index: number, maxIndex: number): number {
  if (!Number.isFinite(index)) return maxIndex;
  return Math.min(Math.max(Math.trunc(index), 0), maxIndex);
}

function countValues(values: ReadonlyArray<string | undefined>): Map<string, number> {
  const counts = new Map<string, number>();

  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function normalizeItemIdForSlug(id: string): string {
  return normalizeHashSlug(id) ?? "view";
}
