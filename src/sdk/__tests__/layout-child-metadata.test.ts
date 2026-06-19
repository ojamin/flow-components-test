import { describe, expect, it } from "vitest";

import {
  createLayoutChildMetadataOutputPort,
  layoutChildMetadataEntrySchema,
  layoutChildMetadataOutputId,
  layoutChildMetadataSchema,
  type LayoutChildMetadataEntry,
} from "../public-sdk";

const visibleChild = {
  placementId: "placement-hero",
  instanceId: "instance-hero",
  componentId: "demo.demo-text",
  label: "Hero copy",
  displayName: "Text",
  parentPlacementId: "placement-main-page",
  slotId: "default",
  visible: true,
  visibilitySource: "authored",
  visibilityStatus: "visible",
  reserveHiddenSpace: false,
  fillHiddenSpace: true,
  order: 0,
} satisfies LayoutChildMetadataEntry;

describe("layout child metadata contract", () => {
  it("chooses the stable generic layout output id", () => {
    expect(layoutChildMetadataOutputId).toBe("childComponents");
    expect(createLayoutChildMetadataOutputPort()).toEqual({
      id: "childComponents",
      label: "Child components",
      typeId: "json-array",
      runtimePatchable: false,
    });
  });

  it("accepts the stable direct-child metadata entry shape", () => {
    expect(layoutChildMetadataEntrySchema.parse(visibleChild)).toEqual(visibleChild);
    expect(
      layoutChildMetadataSchema.parse([
        visibleChild,
        {
          ...visibleChild,
          placementId: "placement-hidden-chart",
          instanceId: "instance-hidden-chart",
          componentId: "viz.bar-chart",
          label: "Hidden chart",
          displayName: "Bar chart",
          visible: false,
          visibilitySource: "inactive-slot",
          visibilityStatus: "hidden",
          reserveHiddenSpace: true,
          targetOrder: 2,
          order: 1,
        },
      ]),
    ).toHaveLength(2);
  });

  it("rejects flattened or ambiguous child metadata", () => {
    expect(
      layoutChildMetadataEntrySchema.safeParse({
        ...visibleChild,
        parentPlacementId: "",
      }).success,
    ).toBe(false);
    expect(
      layoutChildMetadataEntrySchema.safeParse({
        ...visibleChild,
        visibilitySource: "private-renderer-state",
      }).success,
    ).toBe(false);
    expect(
      layoutChildMetadataEntrySchema.safeParse({
        ...visibleChild,
        order: -1,
      }).success,
    ).toBe(false);
  });
});
