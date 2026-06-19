import { describe, expect, it } from "vitest";

import {
  datasetChartFieldOptionSchema,
  datasetChartSeriesMappingSchema,
  datasetDerivationProgressSchema,
  datasetDerivationRequestSchema,
  datasetDerivationResponseSchema,
  type DatasetDerivationService,
} from "./dataset-derivation-service";

const hash = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("DatasetDerivationService contract", () => {
  it("accepts package-safe derivation requests without host app internals", () => {
    const request = datasetDerivationRequestSchema.parse({
      requestId: "request-1",
      kind: "chart-field-options",
      rootSource: { id: "__root__", contentRevision: "rev-1", contentHash: hash },
      datasetPath: "$.rows",
      target: { componentId: "chart.line", transformId: "field-options" },
      materialization: {
        definitionRevision: "def-1",
        sourceHash: hash,
        materializationHash: hash,
      },
      configSignature: hash,
      expectedProjectRevision: 7,
    });

    expect(request.kind).toBe("chart-field-options");
    expect(Object.keys(request).sort()).not.toContain("store");
    expect(Object.keys(request).sort()).not.toContain("router");
    expect(Object.keys(request).sort()).not.toContain("projectDocument");
  });

  it("discriminates success, failure, stale, and progress payloads", () => {
    expect(
      datasetDerivationResponseSchema.parse({
        status: "success",
        requestId: "request-1",
        kind: "table-columns",
        result: {
          tableColumns: [{ id: "name", label: "Name", valueKind: "string" }],
        },
      }).status,
    ).toBe("success");

    expect(
      datasetDerivationResponseSchema.parse({
        status: "failure",
        requestId: "request-1",
        error: { category: "worker-failure", message: "Dataset worker failed." },
      }).status,
    ).toBe("failure");

    expect(
      datasetDerivationResponseSchema.parse({
        status: "stale",
        requestId: "request-1",
        expectedRevision: "rev-1",
        actualRevision: "rev-2",
      }).status,
    ).toBe("stale");

    expect(
      datasetDerivationProgressSchema.parse({
        requestId: "request-1",
        stage: "deriving",
        completedUnits: 1,
        totalUnits: 3,
      }).stage,
    ).toBe("deriving");
  });

  it("keeps the service seam host-owned and injectable", async () => {
    const service: DatasetDerivationService = {
      async derive(request, onProgress) {
        onProgress?.({ requestId: request.requestId, stage: "completed" });
        return {
          status: "stale",
          requestId: request.requestId,
          expectedRevision: "1",
          actualRevision: "2",
        };
      },
      clearCache() {},
    };
    const progress: string[] = [];
    const response = await service.derive(
      {
        requestId: "request-1",
        kind: "path-index",
        rootSource: { id: "__root__", contentHash: hash },
        datasetPath: "$",
        target: { transformId: "path-index" },
        materialization: { sourceHash: hash },
        configSignature: hash,
      },
      (event) => progress.push(event.stage),
    );

    expect(response.status).toBe("stale");
    expect(progress).toEqual(["completed"]);
  });

  it("rejects cache-key parts that omit required invalidation dimensions", () => {
    const baseRequest = {
      requestId: "request-1",
      kind: "table-columns",
      rootSource: { id: "__root__", contentHash: hash },
      datasetPath: "$.rows",
      target: { componentId: "content.table" },
      materialization: { definitionHash: hash },
      configSignature: hash,
    };

    expect(
      datasetDerivationRequestSchema.safeParse({ ...baseRequest, datasetPath: undefined }).success,
    ).toBe(false);
    expect(datasetDerivationRequestSchema.safeParse({ ...baseRequest, target: {} }).success).toBe(
      false,
    );
    expect(
      datasetDerivationRequestSchema.safeParse({ ...baseRequest, materialization: {} }).success,
    ).toBe(false);
    expect(
      datasetDerivationRequestSchema.safeParse({ ...baseRequest, configSignature: undefined })
        .success,
    ).toBe(false);
  });

  it("rejects successful responses that omit the result for their derivation kind", () => {
    expect(
      datasetDerivationResponseSchema.safeParse({
        status: "success",
        requestId: "request-1",
        kind: "chart-series-mapping",
        result: { tableColumns: [{ id: "name", label: "Name", valueKind: "string" }] },
      }).success,
    ).toBe(false);
  });

  it("accepts chart option semantics and mapped output payloads for worker parity", () => {
    expect(
      datasetChartFieldOptionSchema.parse({
        id: "revenue",
        path: "revenue",
        label: "Revenue",
        sampleValue: "120",
        availableRowCount: 2,
        numericRowCount: 2,
        categoricalRowCount: 2,
        supportedRoles: ["x", "y", "label", "value"],
      }),
    ).toMatchObject({ path: "revenue", numericRowCount: 2 });

    expect(
      datasetChartSeriesMappingSchema.parse({
        kind: "xy",
        ok: true,
        error: null,
        data: [{ x: 0, y: 120, xLabel: "Jan" }],
        fields: { x: "month", y: "revenue" },
        totalRowCount: 1,
        skippedRowCount: 0,
        state: { tone: "ready", title: null, description: null },
      }),
    ).toMatchObject({ kind: "xy", data: [{ x: 0, y: 120, xLabel: "Jan" }] });

    expect(
      datasetDerivationResponseSchema.parse({
        status: "success",
        requestId: "request-1",
        kind: "chart-series-mapping",
        result: {
          chartSeriesMappings: [
            {
              kind: "slice",
              ok: true,
              error: null,
              data: [{ label: "Won", value: 8 }],
              fields: { label: "status", value: "count" },
              totalRowCount: 1,
              skippedRowCount: 0,
              state: { tone: "ready", title: null, description: null },
            },
          ],
        },
      }).status,
    ).toBe("success");
  });
});
