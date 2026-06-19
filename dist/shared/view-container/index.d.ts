import { z } from "zod";
import type { SlotDefinition } from "../../sdk/component-definition.js";
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
export declare const viewContainerDynamicSlotMetadata: readonly [{
    readonly canonicalIdTemplate: "view:<configured-view-id>";
    readonly configSource: "views[].id";
    readonly configSourceDescription: "Uses each normalized view id from the effective views config; resolveSlots remains the runtime source for realized slots.";
    readonly acceptsChildren: true;
    readonly childScopeMode: "inherit";
    readonly layoutKind: "grid";
    readonly exampleConfig: {
        readonly views: readonly [{
            readonly id: "alpha";
        }];
    };
}];
export declare const viewContainerItemSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    hashSlug: z.ZodOptional<z.ZodString>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const viewContainerItemsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    hashSlug: z.ZodOptional<z.ZodString>;
    disabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>>;
export declare const viewContainerActiveViewIdSchema: z.ZodOptional<z.ZodString>;
export declare const hashSlugSchema: z.ZodString;
export declare const viewRequestedPayloadSchema: z.ZodObject<{
    activeViewId: z.ZodString;
    hashSlug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const viewChangedPayloadSchema: z.ZodObject<{
    activeViewId: z.ZodString;
    previousViewId: z.ZodOptional<z.ZodString>;
    hashSlug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const viewContainerEventPayloadSchemas: {
    readonly viewRequested: z.ZodObject<{
        activeViewId: z.ZodString;
        hashSlug: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly viewChanged: z.ZodObject<{
        activeViewId: z.ZodString;
        previousViewId: z.ZodOptional<z.ZodString>;
        hashSlug: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export type ViewRequestedPayload = z.infer<typeof viewRequestedPayloadSchema>;
export type ViewChangedPayload = z.infer<typeof viewChangedPayloadSchema>;
export declare function normalizeViewContainerItems(items: readonly unknown[]): NormalizedViewContainerItem[];
export declare function resolveActiveViewId(items: readonly ViewContainerItem[], requestedId?: string | null): string | undefined;
export declare function createViewContainerSlots(items: readonly ViewContainerItem[], options?: CreateViewContainerSlotsOptions): SlotDefinition[];
export declare function createViewContainerItem(options?: CreateViewContainerItemOptions): ViewContainerItem;
export declare function renameViewContainerItem(items: readonly ViewContainerItem[], itemId: string, label: string): ViewContainerItem[];
export declare function reorderViewContainerItems(items: readonly ViewContainerItem[], itemId: string, targetIndex: number): ViewContainerItem[];
export declare function setViewContainerItemHashSlug(items: readonly ViewContainerItem[], itemId: string, hashSlug: unknown): ViewContainerItem[];
export declare function setViewContainerItemDisabled(items: readonly ViewContainerItem[], itemId: string, disabled: boolean): ViewContainerItem[];
export declare function deleteViewContainerItem(items: readonly ViewContainerItem[], itemId: string): ViewContainerItem[];
export declare function normalizeHashSlug(value: unknown): string | undefined;
