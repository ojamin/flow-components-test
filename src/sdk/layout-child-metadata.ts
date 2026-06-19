import { z } from "zod";

export const layoutChildMetadataOutputId = "childComponents";

export function createLayoutChildMetadataOutputPort() {
  return {
    id: layoutChildMetadataOutputId,
    label: "Child components",
    typeId: "json-array",
    runtimePatchable: false,
  } as const;
}

export const layoutChildVisibilitySourceSchema = z.enum([
  "authored",
  "placement-display",
  "device-hidden",
  "runtime-override",
  "inherited-parent",
  "inactive-slot",
]);

export const layoutChildVisibilityStatusSchema = z.enum(["visible", "hidden"]);

export const layoutChildMetadataEntrySchema = z.object({
  placementId: z.string().min(1),
  instanceId: z.string().min(1),
  componentId: z.string().min(1),
  label: z.string(),
  displayName: z.string(),
  parentPlacementId: z.string().min(1),
  slotId: z.string().min(1),
  visible: z.boolean(),
  visibilitySource: layoutChildVisibilitySourceSchema,
  visibilityStatus: layoutChildVisibilityStatusSchema,
  reserveHiddenSpace: z.boolean(),
  fillHiddenSpace: z.boolean(),
  order: z.number().int().nonnegative(),
  targetOrder: z.number().int().nonnegative().optional(),
});

/**
 * Contract for host-synthesized direct-child metadata exposed by layout outputs.
 * Layout component ports should advertise this as `json-array` until the SDK data
 * registry needs stricter port compatibility for this specialized shape.
 */
export const layoutChildMetadataSchema = z.array(layoutChildMetadataEntrySchema);

export type LayoutChildVisibilitySource = z.infer<typeof layoutChildVisibilitySourceSchema>;
export type LayoutChildVisibilityStatus = z.infer<typeof layoutChildVisibilityStatusSchema>;
export type LayoutChildMetadataEntry = z.infer<typeof layoutChildMetadataEntrySchema>;
export type LayoutChildMetadata = z.infer<typeof layoutChildMetadataSchema>;
