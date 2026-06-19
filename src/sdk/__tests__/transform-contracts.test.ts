import { describe, expect, it } from "vitest";

import {
  createLookupInputPort,
  createRowTransformContract,
  createRowTransformInputPort,
  createRowTransformOutputPorts,
  createStableRowKey,
  deriveOutputFieldName,
  inferRowFieldMetadata,
  readRowField,
  resolveRowSource,
  rowTransformInputTypeIds,
  rowTransformOutputTypeIds,
  transformFieldPickerRoles,
  transformOperationIds,
} from "../transform-contracts";
import { dataTypeIds } from "../data-types";
import * as RootSdk from "../public-sdk";

describe("transform contracts", () => {
  it("declares the required transform taxonomy", () => {
    expect(transformOperationIds).toEqual([
      "sort",
      "filter",
      "select",
      "lookup",
      "group",
      "pivot",
      "flatten",
      "dedupe",
      "dateBucket",
      "normalize",
      "format",
    ]);
    expect(transformFieldPickerRoles).toContain("row-source");
    expect(transformFieldPickerRoles).toContain("format-target");
    expect(RootSdk.transformOperationIds).toBe(transformOperationIds);
    expect(RootSdk.createRowTransformContract).toBe(createRowTransformContract);
  });

  it("creates standard row transform input, lookup input, and output ports", () => {
    expect(createRowTransformInputPort()).toMatchObject({
      id: "data",
      label: "Data",
      mode: "full",
      acceptedTypeIds: ["table-rows", "json-array", "all-data"],
      required: true,
      allowMultiple: false,
      allowCycle: false,
    });
    expect(createLookupInputPort()).toMatchObject({ id: "lookup", required: false });
    expect(createRowTransformOutputPorts()).toEqual([
      { id: "rows", label: "Rows", typeId: "table-rows" },
      { id: "all", label: "All data", typeId: "all-data" },
    ]);
  });

  it("keeps standard port data type ids in the canonical registry", () => {
    const knownIds = new Set(dataTypeIds);
    for (const typeId of rowTransformInputTypeIds) expect(knownIds.has(typeId)).toBe(true);
    for (const typeId of Object.values(rowTransformOutputTypeIds)) {
      expect(knownIds.has(typeId)).toBe(true);
    }
  });

  it("creates declarative contracts and rejects duplicate field picker ids", () => {
    expect(
      createRowTransformContract({
        operation: "lookup",
        includeLookupInput: true,
        fieldPickers: [{ id: "join", role: "join-key", pathConfigKey: "leftKey" }],
      }),
    ).toMatchObject({
      operation: "lookup",
      inputs: [{ id: "data" }, { id: "lookup" }],
      outputs: [{ id: "rows" }, { id: "all" }],
      fieldPickers: [{ id: "join", role: "join-key" }],
    });

    expect(() =>
      createRowTransformContract({
        operation: "sort",
        fieldPickers: [
          { id: "field", role: "sort-key" },
          { id: "field", role: "sort-key" },
        ],
      }),
    ).toThrow("Duplicate field picker id: field");

    expect(() => createRowTransformContract({ operation: "map" as never })).toThrow(
      "Unknown transform operation: map",
    );
  });

  it("resolves blank, nested, missing, and non-array row sources", () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const data = { payload: { rows }, other: { rows: "not rows" } };

    expect(resolveRowSource(rows, "")).toBe(rows);
    expect(resolveRowSource(data, "payload.rows")).toBe(rows);
    expect(resolveRowSource(data, "missing.rows")).toEqual([]);
    expect(resolveRowSource(data, "other.rows")).toEqual([]);
    expect(resolveRowSource({ value: true }, "")).toEqual([]);
  });

  it("reads row fields and derives output field names from paths", () => {
    const row = { id: 7, customer: { name: "Ada" }, scores: [10, 20] };

    expect(readRowField(row, "customer.name")).toBe("Ada");
    expect(readRowField(row, "scores[1]")).toBe(20);
    expect(readRowField(row, "missing")).toBeUndefined();
    expect(deriveOutputFieldName("customer.name")).toBe("name");
    expect(deriveOutputFieldName("scores[1]")).toBe("1");
    expect(deriveOutputFieldName(" ")).toBe("value");
  });

  it("creates stable row keys from preferred fields or canonical row content", () => {
    expect(createStableRowKey({ id: "a", label: "Alpha" }, ["id"])).toBe("id:a");
    expect(createStableRowKey({ nested: { b: 2, a: 1 } })).toBe('row:{"nested":{"a":1,"b":2}}');
    expect(createStableRowKey({ nested: { a: 1, b: 2 } })).toBe('row:{"nested":{"a":1,"b":2}}');
  });

  it("creates composite row keys from multiple primitive key fields", () => {
    const firstRowKey = createStableRowKey({ id: "shared", region: "north" }, ["id", "region"]);
    const secondRowKey = createStableRowKey({ id: "shared", region: "south" }, ["id", "region"]);

    expect(firstRowKey).toBe(
      'key:[{"field":"id","value":"shared"},{"field":"region","value":"north"}]',
    );
    expect(secondRowKey).toBe(
      'key:[{"field":"id","value":"shared"},{"field":"region","value":"south"}]',
    );
    expect(new Set([firstRowKey, secondRowKey]).size).toBe(2);
  });

  it("infers basic field metadata from object rows", () => {
    expect(
      inferRowFieldMetadata([
        { id: "a", total: 2, date: "2026-05-15", active: true, meta: { code: "x" } },
        { id: "b", total: 4, date: null, active: false, tags: ["one"] },
        "ignored",
      ]),
    ).toEqual([
      {
        path: "active",
        label: "active",
        kind: "boolean",
        occurrences: 2,
        sampleValues: [true, false],
      },
      {
        path: "date",
        label: "date",
        kind: "date",
        occurrences: 2,
        sampleValues: ["2026-05-15", null],
      },
      { path: "id", label: "id", kind: "string", occurrences: 2, sampleValues: ["a", "b"] },
      { path: "meta.code", label: "code", kind: "string", occurrences: 1, sampleValues: ["x"] },
      { path: "tags", label: "tags", kind: "json", occurrences: 1, sampleValues: [["one"]] },
      { path: "total", label: "total", kind: "number", occurrences: 2, sampleValues: [2, 4] },
    ]);
  });

  it("only infers field paths that the shared data-path reader can resolve", () => {
    const rows = [
      {
        id: "a",
        "display name": "Ada Lovelace",
        details: { "postal-code": "SW1", validName: "Ada" },
      },
    ];

    const metadata = inferRowFieldMetadata(rows);

    expect(metadata.map((field) => field.path)).toEqual(["details.validName", "id"]);
    for (const field of metadata) {
      expect(readRowField(rows[0]!, field.path)).toBeDefined();
    }
  });
});
