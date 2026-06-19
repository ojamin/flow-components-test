import { z } from "zod";
export declare const layoutChildMetadataOutputId = "childComponents";
export declare function createLayoutChildMetadataOutputPort(): {
    readonly id: "childComponents";
    readonly label: "Child components";
    readonly typeId: "json-array";
    readonly runtimePatchable: false;
};
export declare const layoutChildVisibilitySourceSchema: z.ZodEnum<{
    authored: "authored";
    "placement-display": "placement-display";
    "device-hidden": "device-hidden";
    "runtime-override": "runtime-override";
    "inherited-parent": "inherited-parent";
    "inactive-slot": "inactive-slot";
}>;
export declare const layoutChildVisibilityStatusSchema: z.ZodEnum<{
    visible: "visible";
    hidden: "hidden";
}>;
export declare const layoutChildMetadataEntrySchema: z.ZodObject<{
    placementId: z.ZodString;
    instanceId: z.ZodString;
    componentId: z.ZodString;
    label: z.ZodString;
    displayName: z.ZodString;
    parentPlacementId: z.ZodString;
    slotId: z.ZodString;
    visible: z.ZodBoolean;
    visibilitySource: z.ZodEnum<{
        authored: "authored";
        "placement-display": "placement-display";
        "device-hidden": "device-hidden";
        "runtime-override": "runtime-override";
        "inherited-parent": "inherited-parent";
        "inactive-slot": "inactive-slot";
    }>;
    visibilityStatus: z.ZodEnum<{
        visible: "visible";
        hidden: "hidden";
    }>;
    reserveHiddenSpace: z.ZodBoolean;
    fillHiddenSpace: z.ZodBoolean;
    order: z.ZodNumber;
    targetOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Contract for host-synthesized direct-child metadata exposed by layout outputs.
 * Layout component ports should advertise this as `json-array` until the SDK data
 * registry needs stricter port compatibility for this specialized shape.
 */
export declare const layoutChildMetadataSchema: z.ZodArray<z.ZodObject<{
    placementId: z.ZodString;
    instanceId: z.ZodString;
    componentId: z.ZodString;
    label: z.ZodString;
    displayName: z.ZodString;
    parentPlacementId: z.ZodString;
    slotId: z.ZodString;
    visible: z.ZodBoolean;
    visibilitySource: z.ZodEnum<{
        authored: "authored";
        "placement-display": "placement-display";
        "device-hidden": "device-hidden";
        "runtime-override": "runtime-override";
        "inherited-parent": "inherited-parent";
        "inactive-slot": "inactive-slot";
    }>;
    visibilityStatus: z.ZodEnum<{
        visible: "visible";
        hidden: "hidden";
    }>;
    reserveHiddenSpace: z.ZodBoolean;
    fillHiddenSpace: z.ZodBoolean;
    order: z.ZodNumber;
    targetOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>>;
export type LayoutChildVisibilitySource = z.infer<typeof layoutChildVisibilitySourceSchema>;
export type LayoutChildVisibilityStatus = z.infer<typeof layoutChildVisibilityStatusSchema>;
export type LayoutChildMetadataEntry = z.infer<typeof layoutChildMetadataEntrySchema>;
export type LayoutChildMetadata = z.infer<typeof layoutChildMetadataSchema>;
