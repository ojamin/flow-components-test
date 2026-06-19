import { describe, expect, it } from "vitest";

import { runRowTransform } from "../row-transform-engine";
import { rowTransformConfigSchema } from "../row-transform-engine-types";
import type { JsonObject } from "../schema-primitives";
import * as RootSdk from "../public-sdk";

const rows: JsonObject[] = [
  {
    id: "a",
    region: "East",
    category: "A",
    total: 10,
    date: "2026-05-15T10:30:00Z",
    tags: ["new", "vip"],
  },
  { id: "b", region: "West", category: "A", total: 4, date: "2026-05-21T01:00:00Z", tags: ["new"] },
  { id: "c", region: "East", category: "B", total: 7, date: "not-a-date", tags: [] },
  {
    id: "d",
    region: "East",
    category: "A",
    total: "ignored",
    date: "2026-06-01T00:00:00Z",
    tags: ["vip"],
  },
];

describe("row transform engine", () => {
  it("exports the pure engine through the public SDK", () => {
    expect(RootSdk.runRowTransform).toBe(runRowTransform);
    expect(RootSdk.rowTransformConfigSchema).toBe(rowTransformConfigSchema);
  });

  it("sorts rows deterministically by configured keys", () => {
    expect(
      runRowTransform(
        { operation: "sort", keys: [{ field: "region" }, { field: "total", direction: "desc" }] },
        { data: rows },
      ).rows.map((row) => row.id),
    ).toEqual(["d", "a", "c", "b"]);
  });

  it("filters rows with validated declarative operators", () => {
    expect(
      runRowTransform(
        {
          operation: "filter",
          clauses: [
            { field: "region", operator: "equals", value: "East" },
            { field: "tags", operator: "contains", value: "vip" },
          ],
        },
        { data: rows },
      ).rows.map((row) => row.id),
    ).toEqual(["a", "d"]);

    expect(() =>
      runRowTransform(
        {
          operation: "filter",
          clauses: [{ field: "region", operator: "regex" as never, value: "East" }],
        },
        { data: rows },
      ),
    ).toThrow();
  });

  it("projects selected fields and uses null for missing paths", () => {
    expect(
      runRowTransform(
        {
          operation: "select",
          fields: [
            { sourceField: "id", outputField: "key" },
            { sourceField: "missing.path", outputField: "missing" },
          ],
        },
        { data: rows.slice(0, 1) },
      ).rows,
    ).toEqual([{ key: "a", missing: null }]);
  });

  it("rejects prototype-sensitive select output fields", () => {
    expect(() =>
      runRowTransform(
        {
          operation: "select",
          fields: [{ sourceField: "id", outputField: "__proto__" }],
        },
        { data: rows.slice(0, 1) },
      ),
    ).toThrow(/fields[\s\S]*outputField[\s\S]*__proto__/);
    expect(Object.prototype).not.toHaveProperty("polluted");

    expect(() =>
      runRowTransform(
        { operation: "select", fields: [{ sourceField: "constructor" }] },
        { data: [{ constructor: "unsafe" }] },
      ),
    ).toThrow(/fields\[0\]\.sourceField[\s\S]*constructor/);
  });

  it("joins lookup rows and keeps unmatched left rows by default", () => {
    expect(
      runRowTransform(
        {
          operation: "lookup",
          leftKey: "region",
          rightKey: "code",
          fields: [{ sourceField: "name", outputField: "regionName" }],
        },
        { data: rows.slice(0, 2), lookupData: [{ code: "East", name: "Eastern" }] },
      ).rows,
    ).toEqual([{ ...rows[0], regionName: "Eastern" }, { ...rows[1] }]);
  });

  it("prefixes projected lookup fields unless an explicit output field is configured", () => {
    expect(
      runRowTransform(
        {
          operation: "lookup",
          leftKey: "id",
          rightKey: "id",
          fields: [{ sourceField: "id" }, { sourceField: "name", outputField: "regionName" }],
        },
        { data: rows.slice(0, 1), lookupData: [{ id: "a", name: "Eastern" }] },
      ).rows,
    ).toEqual([{ ...rows[0], lookup_id: "a", regionName: "Eastern" }]);
  });

  it("rejects prototype-sensitive lookup output fields", () => {
    expect(() =>
      runRowTransform(
        {
          operation: "lookup",
          leftKey: "id",
          rightKey: "id",
          fields: [{ sourceField: "name", outputField: "prototype" }],
        },
        { data: rows.slice(0, 1), lookupData: [{ id: "a", name: "Eastern" }] },
      ),
    ).toThrow(/fields[\s\S]*outputField[\s\S]*prototype/);

    expect(() =>
      runRowTransform(
        { operation: "lookup", leftKey: "id", rightKey: "id", fields: [], prefix: "" },
        { data: rows.slice(0, 1), lookupData: [{ id: "a", constructor: "unsafe" }] },
      ),
    ).toThrow(/prefix\/generated lookup field "constructor"[\s\S]*constructor/);
  });

  it("groups rows with count and numeric aggregates matching group-by behavior", () => {
    expect(
      runRowTransform(
        {
          operation: "group",
          groupByFields: ["region"],
          aggregates: [{ sourceField: "total", operation: "sum", outputField: "total_sum" }],
        },
        { data: rows },
      ).rows,
    ).toEqual([
      { region: "East", groupby_count: 3, total_sum: 17 },
      { region: "West", groupby_count: 1, total_sum: 4 },
    ]);
  });

  it("rejects prototype-sensitive group output fields", () => {
    expect(() =>
      runRowTransform(
        { operation: "group", groupByFields: ["region"], countField: "constructor" },
        { data: rows },
      ),
    ).toThrow(/countField[\s\S]*constructor/);
    expect(() =>
      runRowTransform(
        {
          operation: "group",
          groupByFields: ["region"],
          aggregates: [{ sourceField: "total", operation: "sum", outputField: "prototype" }],
        },
        { data: rows },
      ),
    ).toThrow(/aggregates[\s\S]*outputField[\s\S]*prototype/);
    expect(() =>
      runRowTransform(
        { operation: "group", groupByFields: ["constructor"] },
        { data: [{ constructor: "unsafe" }] },
      ),
    ).toThrow(/groupByFields\[0\][\s\S]*constructor/);
  });

  it("pivots group rows into deterministic aggregate columns", () => {
    expect(
      runRowTransform(
        {
          operation: "pivot",
          groupByFields: ["region"],
          pivotField: "category",
          valueField: "total",
          aggregate: "sum",
          outputPrefix: "cat_",
        },
        { data: rows },
      ).rows,
    ).toEqual([
      { region: "East", pivot_count: 3, cat_A: 10, cat_B: 7 },
      { region: "West", pivot_count: 1, cat_A: 4, cat_B: 0 },
    ]);
  });

  it("rejects non-count aggregates without value fields and keeps pivot columns unique", () => {
    expect(() =>
      runRowTransform(
        { operation: "group", groupByFields: ["region"], aggregates: [{ operation: "sum" }] },
        { data: rows },
      ),
    ).toThrow("sourceField is required");
    expect(() =>
      runRowTransform(
        { operation: "pivot", groupByFields: ["region"], pivotField: "category", aggregate: "sum" },
        { data: rows },
      ),
    ).toThrow("valueField is required");

    expect(
      runRowTransform(
        {
          operation: "pivot",
          groupByFields: ["region"],
          pivotField: "category",
          aggregate: "count",
          outputPrefix: "cat_",
        },
        {
          data: [
            { region: "East", category: "A B" },
            { region: "East", category: "A_B" },
          ],
        },
      ).rows,
    ).toEqual([{ region: "East", pivot_count: 2, cat_A_B: 1, cat_A_B_2: 1 }]);

    expect(
      runRowTransform(
        {
          operation: "pivot",
          groupByFields: ["region"],
          pivotField: "category",
          aggregate: "count",
        },
        {
          data: [
            { region: "East", category: "region" },
            { region: "East", category: "pivot_count" },
          ],
        },
      ).rows,
    ).toEqual([{ region: "East", pivot_count: 2, region_2: 1, pivot_count_2: 1 }]);
  });

  it("rejects prototype-sensitive pivot output fields", () => {
    expect(() =>
      runRowTransform(
        {
          operation: "pivot",
          groupByFields: ["region"],
          pivotField: "category",
          countField: "prototype",
        },
        { data: rows },
      ),
    ).toThrow(/countField[\s\S]*prototype/);
    expect(() =>
      runRowTransform(
        { operation: "pivot", groupByFields: ["region"], pivotField: "category" },
        { data: [{ region: "East", category: "constructor" }] },
      ),
    ).toThrow(/pivotField generated output from row 0[\s\S]*constructor/);
  });

  it("flattens array fields into one row per item", () => {
    expect(
      runRowTransform(
        { operation: "flatten", field: "tags", outputField: "tag" },
        { data: rows.slice(0, 2) },
      ).rows.map((row) => ({ id: row.id, tag: row.tag })),
    ).toEqual([
      { id: "a", tag: "new" },
      { id: "a", tag: "vip" },
      { id: "b", tag: "new" },
    ]);
  });

  it("rejects prototype-sensitive flatten output fields", () => {
    expect(() =>
      runRowTransform(
        { operation: "flatten", field: "tags", outputField: "__proto__" },
        { data: rows },
      ),
    ).toThrow(/outputField[\s\S]*__proto__/);
    expect(() =>
      runRowTransform(
        { operation: "flatten", field: "constructor", keepEmpty: true },
        { data: [{ constructor: ["unsafe"] }] },
      ),
    ).toThrow(/field[\s\S]*constructor/);
  });

  it("dedupes rows by stable keys", () => {
    expect(
      runRowTransform(
        { operation: "dedupe", keyFields: ["region"], keep: "last" },
        { data: rows },
      ).rows.map((row) => row.id),
    ).toEqual(["d", "b"]);

    expect(
      runRowTransform(
        { operation: "dedupe", keyFields: ["region", "category"], keep: "first" },
        { data: rows },
      ).rows.map((row) => row.id),
    ).toEqual(["a", "b", "c"]);
  });

  it("date-buckets valid dates and emits null for invalid dates", () => {
    expect(
      runRowTransform(
        { operation: "dateBucket", field: "date", granularity: "month", outputField: "month" },
        { data: rows },
      ).rows.map((row) => row.month),
    ).toEqual(["2026-05", "2026-05", null, "2026-06"]);
  });

  it("rejects prototype-sensitive date bucket output fields", () => {
    expect(() =>
      runRowTransform(
        { operation: "dateBucket", field: "date", outputField: "constructor" },
        { data: rows },
      ),
    ).toThrow(/outputField[\s\S]*constructor/);
  });

  it("normalizes numeric fields and leaves non-numeric values null", () => {
    expect(
      runRowTransform(
        { operation: "normalize", fields: [{ sourceField: "total", outputField: "score" }] },
        { data: rows },
      ).rows.map((row) => row.score),
    ).toEqual([1, 0, 0.5, null]);
  });

  it("rejects prototype-sensitive normalize output fields", () => {
    expect(() =>
      runRowTransform(
        { operation: "normalize", fields: [{ sourceField: "total", outputField: "constructor" }] },
        { data: rows },
      ),
    ).toThrow(/fields[\s\S]*outputField[\s\S]*constructor/);
  });

  it("formats values without executing user-authored code", () => {
    expect(
      runRowTransform(
        {
          operation: "format",
          fields: [
            { sourceField: "region", format: "uppercase", outputField: "REGION" },
            { sourceField: "total", format: "numberFixed", decimals: 1, outputField: "totalText" },
          ],
        },
        { data: rows.slice(0, 1) },
      ).rows,
    ).toEqual([{ ...rows[0], REGION: "EAST", totalText: "10.0" }]);
  });

  it("rejects prototype-sensitive format output fields", () => {
    expect(() =>
      runRowTransform(
        {
          operation: "format",
          fields: [{ sourceField: "region", format: "uppercase", outputField: "prototype" }],
        },
        { data: rows },
      ),
    ).toThrow(/fields[\s\S]*outputField[\s\S]*prototype/);

    expect(() =>
      runRowTransform(
        { operation: "format", fields: [{ sourceField: "constructor", format: "uppercase" }] },
        { data: [{ constructor: "unsafe" }] },
      ),
    ).toThrow(/Invalid row transform output field at fields\[0\]\.sourceField: "constructor"/);
  });

  it("returns empty standard outputs for non-array row sources", () => {
    expect(
      runRowTransform({ operation: "sort", keys: [{ field: "id" }] }, { data: { rows: "nope" } }),
    ).toEqual({
      rows: [],
      all: [],
    });
  });
});
