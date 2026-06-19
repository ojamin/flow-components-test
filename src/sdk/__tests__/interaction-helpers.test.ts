import { describe, expect, it } from "vitest";

import {
  createAriaLabel,
  createInteractiveKey,
  getNextArrowNavigationIndex,
  isActivationKey,
} from "@flow-builder/components/sdk/interactions";

describe("SDK interaction helpers", () => {
  it("detects keyboard activation keys without browser globals", () => {
    expect(isActivationKey({ key: "Enter" })).toBe(true);
    expect(isActivationKey({ key: " " })).toBe(true);
    expect(isActivationKey({ key: "Spacebar" })).toBe(true);

    expect(isActivationKey({ key: "Space" })).toBe(false);
    expect(isActivationKey({ key: "Escape" })).toBe(false);
  });

  it("moves arrow navigation by orientation and clamps to bounds", () => {
    expect(getNextArrowNavigationIndex(1, 4, "ArrowRight", { orientation: "horizontal" })).toBe(2);
    expect(getNextArrowNavigationIndex(1, 4, "ArrowDown", { orientation: "horizontal" })).toBe(1);
    expect(getNextArrowNavigationIndex(1, 4, "ArrowDown", { orientation: "vertical" })).toBe(2);
    expect(getNextArrowNavigationIndex(1, 4, "ArrowLeft", { orientation: "vertical" })).toBe(1);
    expect(getNextArrowNavigationIndex(3, 4, "ArrowRight")).toBe(3);
    expect(getNextArrowNavigationIndex(0, 4, "ArrowLeft")).toBe(0);
  });

  it("wraps arrow navigation and normalizes invalid current indexes", () => {
    expect(getNextArrowNavigationIndex(3, 4, "ArrowRight", { wrap: true })).toBe(0);
    expect(getNextArrowNavigationIndex(0, 4, "ArrowLeft", { wrap: true })).toBe(3);
    expect(getNextArrowNavigationIndex(Number.NaN, 4, "ArrowRight", { wrap: true })).toBe(1);
    expect(getNextArrowNavigationIndex(10, 4, "ArrowDown", { wrap: true })).toBe(0);
    expect(getNextArrowNavigationIndex(0, 0, "ArrowDown", { wrap: true })).toBe(-1);
  });

  it("constructs stable interactive keys from normalized parts", () => {
    expect(createInteractiveKey("Item Group", ["North America", "Q1/Q2", 7])).toBe(
      "item-group-north-america-q1-q2-7",
    );
    expect(createInteractiveKey("legend", ["", null, undefined, "  !!!  "])).toBe(
      "legend-none-none-none-none",
    );
    expect(createInteractiveKey("", ["Already--Noisy"])).toBe("already-noisy");
  });

  it("composes ARIA labels from labels, context, values, and positions", () => {
    expect(
      createAriaLabel({
        kind: "cell",
        label: "Revenue",
        seriesName: "Actuals",
        rowLabel: "North",
        columnLabel: "Q1",
        value: 42,
        index: 1,
        total: 4,
      }),
    ).toBe("Revenue, series Actuals, row North, column Q1, value 42, 2 of 4");

    expect(createAriaLabel({ kind: "geo", columnLabel: "Longitude", value: null })).toBe(
      "Geographic point, row unknown, column Longitude",
    );
    expect(createAriaLabel({ kind: "datum", value: "pending" })).toBe("Datum, value pending");
  });
});
