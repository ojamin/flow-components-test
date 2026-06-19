import { z } from "zod";

const nonEmptyTrimmedString = z.string().trim().min(1);

export const navItemSchema = z.object({
  id: nonEmptyTrimmedString.optional(),
  label: nonEmptyTrimmedString,
  href: z.string().trim().optional(),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  disabled: z.boolean().optional(),
  external: z.boolean().optional(),
  hashSlug: z.string().trim().optional(),
  children: z.array(z.unknown()).optional(),
});

export const navItemsSchema = z.array(navItemSchema);

const navConfigItemBaseSchema = z.object({
  id: nonEmptyTrimmedString.optional(),
  label: nonEmptyTrimmedString,
  href: z.string().trim().default(""),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  disabled: z.boolean().default(false),
  external: z.boolean().default(false),
  hashSlug: z.string().trim().optional(),
});

export const navChildConfigItemSchema = navConfigItemBaseSchema.extend({
  children: z.array(z.unknown()).optional(),
});

export const navConfigItemSchema = navConfigItemBaseSchema.extend({
  children: z.array(navChildConfigItemSchema).optional(),
});

export const navConfigItemsSchema = z.array(navConfigItemSchema);

export const selectedNavItemSchema = z.object({
  id: nonEmptyTrimmedString,
  label: nonEmptyTrimmedString,
  href: z.string().trim().optional(),
  hashSlug: z.string().trim().optional(),
});

export type NavItemInput = z.input<typeof navItemSchema>;
export type NavConfigItem = z.output<typeof navConfigItemSchema>;
export type SelectedNavItem = z.output<typeof selectedNavItemSchema>;
export type NavItemDiagnosticCode =
  | "children_depth_unsupported"
  | "duplicate_hash_slug"
  | "duplicate_id"
  | "invalid_item"
  | "parent_hash_slug_ignored"
  | "parent_href_ignored";

export interface NavItemDiagnostic {
  code: NavItemDiagnosticCode;
  message: string;
  path: Array<number | string>;
  severity: "warning";
}

export interface NormalizedNavItem {
  id: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  disabled: boolean;
  external: boolean;
  hashSlug?: string;
  children?: NormalizedNavItem[];
  selectable: boolean;
  hashTargetable: boolean;
  depth: 0 | 1;
}

export interface NormalizedNavItemsResult {
  items: NormalizedNavItem[];
  selectableItems: NormalizedNavItem[];
  itemById: Map<string, NormalizedNavItem>;
  hashSlugMap: Map<string, NormalizedNavItem>;
  diagnostics: NavItemDiagnostic[];
}

export interface ResolveActiveNavItemOptions {
  activeItemId?: string | null;
  activeHref?: string | null;
}

export interface FindDefaultNavItemOptions {
  includeNested?: boolean;
}

interface ParsedNavItem {
  id: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  disabled: boolean;
  external: boolean;
  hashSlug?: string;
  childrenInputs?: readonly unknown[];
  path: Array<number | string>;
  depth: 0 | 1;
}

export function normalizeNavItems(items: readonly unknown[]): NormalizedNavItemsResult {
  const diagnostics: NavItemDiagnostic[] = [];
  const normalizedItems = items
    .map((item, index) => normalizeNavItem(item, [index], 0, diagnostics))
    .filter((item): item is NormalizedNavItem => item !== undefined);
  const flattenedItems = flattenNavItems(normalizedItems);
  const selectableItems = flattenedItems.filter((item) => item.selectable);
  const itemById = new Map<string, NormalizedNavItem>();
  const hashSlugMap = new Map<string, NormalizedNavItem>();
  const seenIds = new Set<string>();
  const seenHashSlugs = new Set<string>();

  for (const item of flattenedItems) {
    const path = findNormalizedItemPath(normalizedItems, item) ?? [];

    if (seenIds.has(item.id)) {
      diagnostics.push({
        code: "duplicate_id",
        message: `Navigation item id "${item.id}" is duplicated; active-id lookup will use the first occurrence.`,
        path: [...path, "id"],
        severity: "warning",
      });
    } else {
      seenIds.add(item.id);
      itemById.set(item.id, item);
    }

    if (!item.hashTargetable || !item.hashSlug) continue;

    if (seenHashSlugs.has(item.hashSlug)) {
      diagnostics.push({
        code: "duplicate_hash_slug",
        message: `Navigation hash slug "${item.hashSlug}" is duplicated; hash lookup will use the first occurrence.`,
        path: [...path, "hashSlug"],
        severity: "warning",
      });
    } else {
      seenHashSlugs.add(item.hashSlug);
      hashSlugMap.set(item.hashSlug, item);
    }
  }

  return {
    items: normalizedItems,
    selectableItems,
    itemById,
    hashSlugMap,
    diagnostics,
  };
}

export function resolveActiveNavItemId(
  navItems: NormalizedNavItemsResult | readonly unknown[],
  options: ResolveActiveNavItemOptions = {},
): string | undefined {
  const result = resolveNormalizedNavItems(navItems);
  const requestedId = normalizeOptionalString(options.activeItemId);
  const requestedItem = requestedId ? findSelectableNavItem(result, requestedId) : undefined;
  if (requestedItem) return requestedItem.id;

  const activeHref = normalizeOptionalString(options.activeHref);
  if (!activeHref) return undefined;

  return result.selectableItems.find((item) => item.href === activeHref)?.id;
}

export function findSelectableNavItem(
  navItems: NormalizedNavItemsResult | readonly unknown[],
  itemId: string | undefined | null,
): NormalizedNavItem | undefined {
  const result = resolveNormalizedNavItems(navItems);
  const normalizedId = normalizeOptionalString(itemId);
  if (!normalizedId) return undefined;

  const item = result.itemById.get(normalizedId);
  if (item?.selectable) return item;

  return result.selectableItems.find((selectableItem) => selectableItem.id === normalizedId);
}

export function findDefaultSelectableNavItem(
  navItems: NormalizedNavItemsResult | readonly unknown[],
  options: FindDefaultNavItemOptions = {},
): NormalizedNavItem | undefined {
  const result = resolveNormalizedNavItems(navItems);
  const includeNested = options.includeNested ?? true;

  return result.selectableItems.find((item) => includeNested || item.depth === 0);
}

export function toSelectedNavItem(
  item: NormalizedNavItem | undefined,
): SelectedNavItem | undefined {
  if (!item) return undefined;

  return {
    id: item.id,
    label: item.label,
    ...(item.href ? { href: item.href } : {}),
    ...(item.hashSlug ? { hashSlug: item.hashSlug } : {}),
  };
}

export function normalizeNavHashSlug(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const slug = slugify(value);
  return slug || undefined;
}

function normalizeNavItem(
  item: unknown,
  path: Array<number | string>,
  depth: 0 | 1,
  diagnostics: NavItemDiagnostic[],
  ancestorDisabled = false,
): NormalizedNavItem | undefined {
  const result = navItemSchema.safeParse(item);
  if (!result.success) {
    diagnostics.push({
      code: "invalid_item",
      message: "Navigation item must include a non-empty label.",
      path,
      severity: "warning",
    });
    return undefined;
  }

  const parsed = parseNavItem(result.data, path, depth);
  const children = parseChildren(parsed, diagnostics);
  const hasChildren = children.length > 0;
  const disabled = ancestorDisabled || parsed.disabled;
  // Nav selection is component state, not only link navigation. Items without
  // href can still drive activeItemId outputs or host-owned hash/ViewStack
  // routing; only disabled items and disclosure parents are non-selectable.
  const selectable = !disabled && !hasChildren;
  const hashSlug = normalizeNavHashSlug(parsed.hashSlug);
  const hashTargetable = selectable && Boolean(hashSlug);

  if (hasChildren && parsed.href) {
    diagnostics.push({
      code: "parent_href_ignored",
      message:
        "Navigation parent items with children are disclosure-only in V1; href is preserved but ignored for selection.",
      path: [...path, "href"],
      severity: "warning",
    });
  }

  if (hasChildren && hashSlug) {
    diagnostics.push({
      code: "parent_hash_slug_ignored",
      message:
        "Navigation parent items with children are disclosure-only in V1; hashSlug is preserved but excluded from hash targets.",
      path: [...path, "hashSlug"],
      severity: "warning",
    });
  }

  return {
    id: parsed.id,
    label: parsed.label,
    ...(parsed.href !== undefined ? { href: parsed.href } : {}),
    ...(parsed.description ? { description: parsed.description } : {}),
    ...(parsed.icon ? { icon: parsed.icon } : {}),
    disabled,
    external: parsed.external,
    ...(hashSlug ? { hashSlug } : {}),
    ...(hasChildren ? { children } : {}),
    selectable,
    hashTargetable,
    depth,
  };
}

function parseNavItem(
  item: z.infer<typeof navItemSchema>,
  path: Array<number | string>,
  depth: 0 | 1,
): ParsedNavItem {
  const label = item.label.trim();
  const href = normalizeOptionalString(item.href);
  const derivedId = href ?? slugify(label);
  const id = normalizeOptionalString(item.id) ?? (derivedId || fallbackIdFromPath(path));

  return {
    id,
    label,
    ...(href !== undefined ? { href } : {}),
    ...(item.description ? { description: item.description } : {}),
    ...(item.icon ? { icon: item.icon } : {}),
    disabled: item.disabled ?? false,
    external: item.external ?? false,
    ...(item.hashSlug ? { hashSlug: item.hashSlug } : {}),
    childrenInputs: item.children,
    path,
    depth,
  };
}

function parseChildren(item: ParsedNavItem, diagnostics: NavItemDiagnostic[]): NormalizedNavItem[] {
  if (!item.childrenInputs?.length) return [];

  if (item.depth >= 1) {
    diagnostics.push({
      code: "children_depth_unsupported",
      message:
        "Navigation helpers support one child level; deeper children are ignored with this diagnostic.",
      path: [...item.path, "children"],
      severity: "warning",
    });
    return [];
  }

  return item.childrenInputs
    .map((child, index) =>
      normalizeNavItem(child, [...item.path, "children", index], 1, diagnostics, item.disabled),
    )
    .filter((child): child is NormalizedNavItem => child !== undefined);
}

function flattenNavItems(items: readonly NormalizedNavItem[]): NormalizedNavItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavItems(item.children) : [])]);
}

function resolveNormalizedNavItems(
  navItems: NormalizedNavItemsResult | readonly unknown[],
): NormalizedNavItemsResult {
  if (isNormalizedNavItemsResult(navItems)) return navItems;

  return normalizeNavItems(navItems);
}

function isNormalizedNavItemsResult(
  navItems: NormalizedNavItemsResult | readonly unknown[],
): navItems is NormalizedNavItemsResult {
  return !Array.isArray(navItems) && "selectableItems" in navItems;
}

function findNormalizedItemPath(
  items: readonly NormalizedNavItem[],
  target: NormalizedNavItem,
): Array<number | string> | undefined {
  for (const [index, item] of items.entries()) {
    if (item === target) return [index];

    const childIndex = item.children?.findIndex((child) => child === target) ?? -1;
    if (childIndex >= 0) return [index, "children", childIndex];
  }

  return undefined;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized || undefined;
}

function slugify(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function fallbackIdFromPath(path: readonly (number | string)[]): string {
  const suffix = path.map((segment) => String(segment).replace(/[^a-zA-Z0-9]+/g, "-")).join("-");
  return suffix ? `item-${suffix}` : "item";
}
