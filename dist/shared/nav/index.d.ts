import { z } from "zod";
export declare const navItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    href: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    external: z.ZodOptional<z.ZodBoolean>;
    hashSlug: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
}, z.core.$strip>;
export declare const navItemsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    href: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    disabled: z.ZodOptional<z.ZodBoolean>;
    external: z.ZodOptional<z.ZodBoolean>;
    hashSlug: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
}, z.core.$strip>>;
export declare const navChildConfigItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    href: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    disabled: z.ZodDefault<z.ZodBoolean>;
    external: z.ZodDefault<z.ZodBoolean>;
    hashSlug: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
}, z.core.$strip>;
export declare const navConfigItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    href: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    disabled: z.ZodDefault<z.ZodBoolean>;
    external: z.ZodDefault<z.ZodBoolean>;
    hashSlug: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        label: z.ZodString;
        href: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        disabled: z.ZodDefault<z.ZodBoolean>;
        external: z.ZodDefault<z.ZodBoolean>;
        hashSlug: z.ZodOptional<z.ZodString>;
        children: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const navConfigItemsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    href: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    disabled: z.ZodDefault<z.ZodBoolean>;
    external: z.ZodDefault<z.ZodBoolean>;
    hashSlug: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        label: z.ZodString;
        href: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        disabled: z.ZodDefault<z.ZodBoolean>;
        external: z.ZodDefault<z.ZodBoolean>;
        hashSlug: z.ZodOptional<z.ZodString>;
        children: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
    }, z.core.$strip>>>;
}, z.core.$strip>>;
export declare const selectedNavItemSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    href: z.ZodOptional<z.ZodString>;
    hashSlug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type NavItemInput = z.input<typeof navItemSchema>;
export type NavConfigItem = z.output<typeof navConfigItemSchema>;
export type SelectedNavItem = z.output<typeof selectedNavItemSchema>;
export type NavItemDiagnosticCode = "children_depth_unsupported" | "duplicate_hash_slug" | "duplicate_id" | "invalid_item" | "parent_hash_slug_ignored" | "parent_href_ignored";
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
export declare function normalizeNavItems(items: readonly unknown[]): NormalizedNavItemsResult;
export declare function resolveActiveNavItemId(navItems: NormalizedNavItemsResult | readonly unknown[], options?: ResolveActiveNavItemOptions): string | undefined;
export declare function findSelectableNavItem(navItems: NormalizedNavItemsResult | readonly unknown[], itemId: string | undefined | null): NormalizedNavItem | undefined;
export declare function findDefaultSelectableNavItem(navItems: NormalizedNavItemsResult | readonly unknown[], options?: FindDefaultNavItemOptions): NormalizedNavItem | undefined;
export declare function toSelectedNavItem(item: NormalizedNavItem | undefined): SelectedNavItem | undefined;
export declare function normalizeNavHashSlug(value: unknown): string | undefined;
