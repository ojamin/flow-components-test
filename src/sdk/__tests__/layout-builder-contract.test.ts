import { describe, expect, it } from "vitest";
import type { ZodTypeAny } from "zod";

import { staticComponentDefinitions } from "../../generated/catalog";
import {
  resolveComponentSlots,
  type ComponentDefinition,
  type SlotDefinition,
} from "../component-definition";

const EXPECTED_LAYOUT_IDS = [
  "layout.anchor-nav",
  "layout.breadcrumb",
  "layout.card",
  "layout.command-center-frame",
  "layout.command-section",
  "layout.footer",
  "layout.main-page",
  "layout.navbar",
  "layout.repeater",
  "layout.section",
  "layout.sidebar-nav",
  "layout.split",
  "layout.stack",
  "layout.stepper",
  "layout.tabs",
  "layout.view-stack",
] as const;

const ROOT_LAYOUT_ID = "layout.main-page";
const DYNAMIC_VIEW_LAYOUT_IDS = new Set(["layout.tabs", "layout.view-stack"]);
const ALLOWED_CHILD_SCOPE_MODES = new Set<SlotDefinition["childScopeMode"]>([
  "inherit",
  "repeater-item",
]);

const layoutDefinitions = [...staticComponentDefinitions]
  .filter((definition) => definition.id.startsWith("layout."))
  .sort((first, second) => first.id.localeCompare(second.id));

function assertPositiveFiniteSize(
  componentId: string,
  capability: "defaultSize" | "minSize",
  size: ComponentDefinition["builder"]["defaultSize"],
) {
  expect(size, `${componentId} builder.${capability} must be declared`).toBeDefined();

  expect(
    Number.isFinite(size?.w) && size?.w != null && size.w > 0,
    `${componentId} builder.${capability}.w must be a positive finite number`,
  ).toBe(true);
  expect(
    Number.isFinite(size?.h) && size?.h != null && size.h > 0,
    `${componentId} builder.${capability}.h must be a positive finite number`,
  ).toBe(true);
}

function assertGridCompatibleChildSlot(componentId: string, slot: SlotDefinition) {
  expect(slot.id.length, `${componentId} child slot must have a non-empty id`).toBeGreaterThan(0);
  expect(
    slot.label.length,
    `${componentId} slot ${slot.id} must have a non-empty label`,
  ).toBeGreaterThan(0);
  expect(
    slot.acceptsChildren,
    `${componentId} slot ${slot.id} must explicitly accept children`,
  ).toBe(true);
  expect(
    slot.layoutKind,
    `${componentId} slot ${slot.id} must use Builder grid-compatible layoutKind`,
  ).toBe("grid");
  expect(
    ALLOWED_CHILD_SCOPE_MODES.has(slot.childScopeMode),
    `${componentId} slot ${slot.id} has unsupported child scope ${slot.childScopeMode}`,
  ).toBe(true);
}

describe("layout Builder metadata contract", () => {
  it("discovers every built-in layout component from the generated package catalog", () => {
    expect(layoutDefinitions.map((definition) => definition.id)).toEqual(EXPECTED_LAYOUT_IDS);
  });

  it("keeps layout.main-page as the root-only non-draggable/non-resizable exception", () => {
    const rootDefinition = layoutDefinitions.find((definition) => definition.id === ROOT_LAYOUT_ID);

    expect(
      rootDefinition,
      `${ROOT_LAYOUT_ID} must be present in built-in layout definitions`,
    ).toBeDefined();
    expect(
      rootDefinition?.builder.draggable,
      `${ROOT_LAYOUT_ID} must remain root-only/non-draggable`,
    ).toBe(false);
    expect(rootDefinition?.builder.resizeX, `${ROOT_LAYOUT_ID} must not expose X resize`).toBe(
      false,
    );
    expect(rootDefinition?.builder.resizeY, `${ROOT_LAYOUT_ID} must not expose Y resize`).toBe(
      false,
    );
    expect(
      rootDefinition?.builder.heightMode,
      `${ROOT_LAYOUT_ID} must stay container-sized as the canonical page root`,
    ).toBe("container");
  });

  it("requires every non-root layout component to be draggable and manually resizable on both axes", () => {
    const placeableDefinitions = layoutDefinitions.filter(
      (definition) => definition.id !== ROOT_LAYOUT_ID,
    );

    for (const definition of placeableDefinitions) {
      const { builder, id } = definition;

      expect(builder.draggable, `${id} must set builder.draggable for Builder movement`).toBe(true);
      expect(builder.resizeX, `${id} must set builder.resizeX for Builder width resize`).toBe(true);
      expect(builder.resizeY, `${id} must set builder.resizeY for Builder height resize`).toBe(
        true,
      );
      expect(
        builder.heightMode,
        `${id} must use fixed heightMode so default Builder interactions allow both-axis manual editing`,
      ).toBe("fixed");

      assertPositiveFiniteSize(id, "defaultSize", builder.defaultSize);
      assertPositiveFiniteSize(id, "minSize", builder.minSize);

      expect(
        builder.minSize!.w <= builder.defaultSize!.w,
        `${id} builder.minSize.w must not exceed builder.defaultSize.w`,
      ).toBe(true);
      expect(
        builder.minSize!.h <= builder.defaultSize!.h,
        `${id} builder.minSize.h must not exceed builder.defaultSize.h`,
      ).toBe(true);
    }
  });

  it("requires every child-accepting static layout slot to be Builder-grid compatible", () => {
    for (const definition of layoutDefinitions) {
      for (const slot of definition.slots.filter((candidate) => candidate.acceptsChildren)) {
        assertGridCompatibleChildSlot(definition.id, slot);
      }
    }
  });

  it("recognizes repeater's canonical authored item slot and repeater-item child scope", () => {
    const repeaterDefinition = layoutDefinitions.find(
      (definition) => definition.id === "layout.repeater",
    );
    const itemSlot = repeaterDefinition?.slots.find((slot) => slot.id === "item");

    expect(
      repeaterDefinition,
      "layout.repeater must be present in built-in layout definitions",
    ).toBeDefined();
    expect(itemSlot, "layout.repeater must declare canonical authored item slot").toBeDefined();
    expect(itemSlot?.childScopeMode, "layout.repeater slot item must use repeater-item scope").toBe(
      "repeater-item",
    );
    if (itemSlot) {
      assertGridCompatibleChildSlot("layout.repeater", itemSlot);
    }
  });

  it("requires tabs/view-stack dynamic slots and resolvers to produce deterministic view slots", () => {
    const dynamicViewDefinitions = layoutDefinitions.filter((definition) =>
      DYNAMIC_VIEW_LAYOUT_IDS.has(definition.id),
    );

    expect(dynamicViewDefinitions.map((definition) => definition.id)).toEqual([
      "layout.tabs",
      "layout.view-stack",
    ]);

    for (const definition of dynamicViewDefinitions) {
      expect(
        definition.dynamicSlots,
        `${definition.id} must declare source-owned dynamic view slot metadata`,
      ).toEqual([
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
      ]);

      const slots = resolveComponentSlots(definition as ComponentDefinition<ZodTypeAny>, {
        views: [
          { id: "alpha", label: "Alpha" },
          { id: "beta", label: "Beta" },
        ],
      });

      expect(
        slots.map((slot) => slot.id),
        `${definition.id} resolveSlots must realize deterministic view:alpha/view:beta slots`,
      ).toEqual(["view:alpha", "view:beta"]);
      for (const slot of slots) {
        assertGridCompatibleChildSlot(definition.id, slot);
      }
    }
  });
});
