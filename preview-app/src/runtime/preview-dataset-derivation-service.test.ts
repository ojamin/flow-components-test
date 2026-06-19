import { describe, expect, test } from "vitest";
import type { JsonValue } from "@flow-builder/components/sdk";

import {
  __previewDatasetDerivationCacheKeyForTest,
  createPreviewDatasetDerivationService,
} from "./preview-dataset-derivation-service";

const sha256 = `sha256:${"a".repeat(64)}` as const;

describe("preview dataset derivation service", () => {
  test("reuses successful table-column derivations from a privacy-safe cache key", async () => {
    const service = createPreviewDatasetDerivationService();
    const baseRequest = {
      requestId: "table-preview-cache",
      kind: "table-columns" as const,
      rootSource: { id: "fixture", contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "content.table" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      table: { columnsMode: "auto" as const },
    };

    const first = await service.derive({
      ...baseRequest,
      dataset: [{ privatePayload: "do-not-key", revenue: 120 }],
    });
    const progressStages: string[] = [];
    const second = await service.derive(
      {
        ...baseRequest,
        requestId: "table-preview-cache-hit",
        dataset: [{ privatePayload: "changed", profit: 10 }],
      },
      (progress) => progressStages.push(progress.stage),
    );

    expect(first).toMatchObject({ status: "success", requestId: "table-preview-cache" });
    expect(second).toMatchObject({ status: "success", requestId: "table-preview-cache-hit" });
    expect(progressStages).toEqual(["queued", "deriving", "completed"]);
    expect(
      second.status === "success" ? second.result.tableColumns?.map((column) => column.id) : [],
    ).toEqual(["privatePayload", "revenue"]);

    const derivedKey = __previewDatasetDerivationCacheKeyForTest({
      ...baseRequest,
      dataset: [{ privatePayload: "do-not-key", revenue: 120 }],
    });
    expect(derivedKey).toContain("table-columns");
    expect(derivedKey).not.toContain("do-not-key");
    expect(derivedKey).not.toContain("privatePayload");
    expect(
      __previewDatasetDerivationCacheKeyForTest({
        ...baseRequest,
        cacheKey: "caller-provided-cache-key",
        dataset: [{ privatePayload: "do-not-key", revenue: 120 }],
      }),
    ).toBe("request:caller-provided-cache-key");
  });

  test("clears cache entries by root source id", async () => {
    const service = createPreviewDatasetDerivationService();
    const baseRequest = {
      requestId: "table-preview-clear",
      kind: "table-columns" as const,
      rootSource: { id: "fixture", contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "content.table" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      table: { columnsMode: "auto" as const },
    };

    await service.derive({ ...baseRequest, dataset: [{ revenue: 120 }] });
    service.clearCache({ rootSourceId: "fixture" });

    const response = await service.derive({
      ...baseRequest,
      requestId: "table-preview-after-clear",
      dataset: [{ profit: 10 }],
    });

    expect(
      response.status === "success" ? response.result.tableColumns?.map((column) => column.id) : [],
    ).toEqual(["profit"]);
  });

  test("matches app table value-kind derivation for dates and nested values", async () => {
    const service = createPreviewDatasetDerivationService();

    const response = await service.derive({
      requestId: "table-preview-value-kind",
      kind: "table-columns",
      rootSource: { id: "fixture", contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "content.table" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      table: { columnsMode: "auto" },
      dataset: [{ publishedAt: "2026-05-17", metadata: { nested: true } }],
    });

    const columns = response.status === "success" ? (response.result.tableColumns ?? []) : [];
    expect(columns.find((column) => column.id === "publishedAt")?.valueKind).toBe("date");
    expect(columns.find((column) => column.id === "metadata")?.valueKind).toBe("mixed");
  });

  test("reuses successful chart series mappings from cache", async () => {
    const service = createPreviewDatasetDerivationService();
    const baseRequest = {
      requestId: "chart-preview-cache",
      kind: "chart-series-mapping" as const,
      rootSource: { id: "fixture", contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "chart.bar" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      chartSeriesMapping: { kind: "xy" as const, xField: "month", yField: "revenue" },
    };

    await service.derive({ ...baseRequest, dataset: [{ month: "Jan", revenue: 120 }] });
    const response = await service.derive({
      ...baseRequest,
      requestId: "chart-preview-cache-hit",
      dataset: [{ month: "Feb", revenue: 10 }],
    });

    expect(
      response.status === "success" ? response.result.chartSeriesMappings?.[0]?.data : [],
    ).toEqual([{ x: 0, y: 120, xLabel: "Jan" }]);
  });

  test("derives chart field options with the same row validation service semantics", async () => {
    const service = createPreviewDatasetDerivationService();

    const response = await service.derive({
      requestId: "chart-preview-field-options",
      kind: "chart-field-options",
      rootSource: { id: "fixture", contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "chart.bar" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      dataset: [
        { month: "Jan", revenue: 120, activeUsers: 9 },
        { month: "Feb", revenue: 150, activeUsers: 12 },
      ],
      chartFieldOptions: {},
    });

    expect(response).toMatchObject({
      status: "success",
      requestId: "chart-preview-field-options",
      kind: "chart-field-options",
    });
    const options = response.status === "success" ? (response.result.chartFieldOptions ?? []) : [];
    expect(options.map((option) => option.path)).toEqual(
      expect.arrayContaining(["month", "revenue", "activeUsers"]),
    );
    expect(options.find((option) => option.path === "month")?.supportedRoles).toEqual(
      expect.arrayContaining(["x", "label"]),
    );
    expect(options.find((option) => option.path === "revenue")?.supportedRoles).toEqual(
      expect.arrayContaining(["y", "value"]),
    );
  });

  test("matches app chart field-option invalid-row semantics", async () => {
    const service = createPreviewDatasetDerivationService();

    const response = await service.derive({
      requestId: "chart-preview-field-options-invalid-row",
      kind: "chart-field-options",
      rootSource: { id: "fixture", contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "chart.bar" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      dataset: [{ month: "Jan", revenue: 120 }, null],
      chartFieldOptions: {},
    });

    expect(response).toMatchObject({
      status: "failure",
      error: { category: "unsupported-derivation" },
    });
    expect(response.status === "failure" ? response.error.message : "").toMatch(
      /Rows at Rows are invalid: Row 2 must be an object to render a table\./,
    );
  });

  test("evicts the oldest successful derivation when the cache exceeds its entry bound", async () => {
    const service = createPreviewDatasetDerivationService();
    const makeRequest = (index: number, dataset: JsonValue) => ({
      requestId: `table-preview-evict-${index}`,
      kind: "table-columns" as const,
      rootSource: { id: `fixture-${index}`, contentHash: sha256 },
      datasetPath: "rows",
      target: { componentId: "content.table" },
      materialization: { definitionHash: sha256 },
      configSignature: sha256,
      table: { columnsMode: "auto" as const },
      dataset,
    });

    await service.derive(makeRequest(0, [{ first: true }]));
    for (let index = 1; index <= 100; index += 1) {
      await service.derive(makeRequest(index, [{ [`column${index}`]: true }]));
    }

    const response = await service.derive(makeRequest(0, [{ recomputed: true }]));

    expect(
      response.status === "success" ? response.result.tableColumns?.map((column) => column.id) : [],
    ).toEqual(["recomputed"]);
  });

  test.each([
    ["chart.bar", { kind: "xy" as const, xField: "month", yField: "revenue" }],
    ["chart.line", { kind: "xy" as const, xField: "month", yField: "revenue" }],
    ["chart.donut", { kind: "slice" as const, labelField: "month", valueField: "revenue" }],
  ])(
    "matches app chart service invalid-row semantics for %s",
    async (componentId, chartSeriesMapping) => {
      const service = createPreviewDatasetDerivationService();

      const response = await service.derive({
        requestId: "chart-preview-invalid-row",
        kind: "chart-series-mapping",
        rootSource: { id: "fixture", contentHash: sha256 },
        datasetPath: "rows",
        target: { componentId },
        materialization: { definitionHash: sha256 },
        configSignature: sha256,
        dataset: [{ month: "Jan", revenue: 120 }, null],
        chartSeriesMapping,
      });

      expect(response).toMatchObject({
        status: "failure",
        error: { category: "unsupported-derivation" },
      });
      expect(response.status === "failure" ? response.error.message : "").toMatch(
        /Rows at Rows are invalid: Row 2 must be an object to render a table\./,
      );
    },
  );
});
