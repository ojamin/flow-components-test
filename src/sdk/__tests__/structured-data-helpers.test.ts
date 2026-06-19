import { describe, expect, it } from "vitest";

import {
  deriveTableColumns,
  deriveTableMetadata,
  validateTableRows,
} from "../structured-data-helpers";

describe("structured data table helpers", () => {
  it("keeps auto column derivation as an all-row first-seen union", () => {
    expect(
      deriveTableColumns(
        [
          { name: "Acme", status: "Active" },
          { owner: "Avery", name: "Northwind" },
        ],
        "auto",
        ["ignored"],
      ),
    ).toEqual(["name", "status", "owner"]);
  });

  it("returns selected columns without touching row keys", () => {
    const throwingRow = new Proxy(
      { name: "Acme" },
      {
        ownKeys() {
          throw new Error("selected columns must not enumerate row fields");
        },
      },
    );

    expect(deriveTableColumns([throwingRow], "selected", [" name ", "owner", "name", ""])).toEqual([
      "name",
      "owner",
    ]);
  });

  it("can validate only a visible row window for selected-column rendering", () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({ id: index }));
    rows[8] = "not an object" as never;

    expect(validateTableRows(rows, { startIndex: 0, maxRows: 2 })).toEqual({
      ok: true,
      error: null,
      rows: [{ id: 0 }, { id: 1 }],
    });
    expect(validateTableRows(rows, { startIndex: 8, maxRows: 2 })).toEqual({
      ok: false,
      error: "Row 9 must be an object to render a table.",
      rows: [],
    });
  });

  it("keeps default table row validation as a full-array semantic check", () => {
    const rows = [{ id: 1 }, "not an object"];

    expect(validateTableRows(rows)).toEqual({
      ok: false,
      error: "Row 2 must be an object to render a table.",
      rows: [],
    });
  });

  it("derives selected table metadata from the visible row window without scanning off-page rows", () => {
    const rows = Array.from({ length: 1_000 }) as { id: number; name: string }[];
    rows[0] = { id: 1, name: "Acme" };
    rows[1] = { id: 2, name: "Northwind" };
    Object.defineProperty(rows, 999, {
      configurable: true,
      get() {
        throw new Error("selected metadata must not read off-page rows");
      },
    });

    expect(
      deriveTableMetadata(rows, {
        columnsMode: "selected",
        selectedColumns: [" name ", "id", "name"],
        visibleStartIndex: 0,
        visibleRowCount: 2,
      }),
    ).toEqual({
      ok: true,
      error: null,
      columns: ["name", "id"],
      rows: [
        { id: 1, name: "Acme" },
        { id: 2, name: "Northwind" },
      ],
      rowCount: 1_000,
      validatedRange: { startIndex: 0, rowCount: 2 },
    });
  });

  it("derives selected table metadata without row validation when no visible window is requested", () => {
    const rows = Array.from({ length: 50 }) as { id: number }[];
    Object.defineProperty(rows, 0, {
      configurable: true,
      get() {
        throw new Error("metadata-only selected derivation must not read row objects");
      },
    });

    expect(
      deriveTableMetadata(rows, {
        columnsMode: "selected",
        selectedColumns: ["id"],
      }),
    ).toEqual({
      ok: true,
      error: null,
      columns: ["id"],
      rows: [],
      rowCount: 50,
      validatedRange: { startIndex: 0, rowCount: 0 },
    });
  });

  it("keeps auto table metadata as a full-row semantic scan", () => {
    expect(
      deriveTableMetadata([{ name: "Acme" }, { owner: "Avery" }, "not an object"], {
        columnsMode: "auto",
        selectedColumns: ["ignored"],
        visibleStartIndex: 0,
        visibleRowCount: 1,
      }),
    ).toEqual({
      ok: false,
      error: "Row 3 must be an object to render a table.",
      columns: [],
      rows: [],
      rowCount: 3,
      validatedRange: { startIndex: 0, rowCount: 3 },
    });
  });
});
