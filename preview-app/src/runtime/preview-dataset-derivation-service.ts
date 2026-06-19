import {
  deriveDatasetChartFieldOptions,
  deriveDatasetChartSeriesMapping,
  deriveTableMetadata,
  formatStructuredKeyLabel,
  isJsonObjectRecord,
  validateServiceChartRows,
  type DatasetChartFieldOptionsDerivationOptions,
  type DatasetChartSeriesMappingConfig,
  type StructuredTableColumnsMode,
  type TableMetadataDerivationOptions,
} from "@flow-builder/components/sdk/data";
import type { JsonObject, JsonValue } from "@flow-builder/components/sdk";
import type {
  DatasetDerivationCacheKeyParts,
  DatasetDerivationRequest,
  DatasetDerivationResponse,
  DatasetDerivationService,
  DatasetDerivationResult,
  DatasetTableColumn,
} from "@flow-builder/components/runtime-services";

type PreviewTableDerivationRequest = DatasetDerivationRequest & {
  dataset?: JsonValue;
  table?: TableMetadataDerivationOptions;
};

type PreviewChartDerivationRequest = DatasetDerivationRequest & {
  dataset?: JsonValue;
  chartFieldOptions?: DatasetChartFieldOptionsDerivationOptions;
  chartSeriesMapping?: DatasetChartSeriesMappingConfig;
};

type PreviewDatasetDerivationRequest =
  | PreviewTableDerivationRequest
  | PreviewChartDerivationRequest;

const unsupportedDerivationMessage =
  "Package preview supports table columns, chart field options, and chart series mapping derivations only.";
const maxPreviewDerivationCacheEntries = 100;

type PreviewDatasetDerivationCacheEntry = {
  rootSourceId: string;
  kind: DatasetDerivationCacheKeyParts["kind"];
  result: DatasetDerivationResult;
  responseCacheKey?: string;
};

export function createPreviewDatasetDerivationService(): DatasetDerivationService {
  const cache = new Map<string, PreviewDatasetDerivationCacheEntry>();

  return {
    async derive(request, onProgress): Promise<DatasetDerivationResponse> {
      onProgress?.({ requestId: request.requestId, stage: "queued" });
      onProgress?.({ requestId: request.requestId, stage: "deriving" });

      const cacheKey = createPreviewDatasetDerivationCacheKey(request);
      const cached = getCachedPreviewDerivation(cache, cacheKey, request);
      if (cached) {
        onProgress?.({ requestId: request.requestId, stage: "completed" });
        return cached;
      }

      const response = derivePreviewDatasetRequest(request as PreviewDatasetDerivationRequest);
      if (response.status === "success") {
        setCachedPreviewDerivation(cache, cacheKey, request, response);
      }

      onProgress?.({ requestId: request.requestId, stage: "completed" });
      return response;
    },
    clearCache(scope) {
      if (!scope?.rootSourceId) {
        cache.clear();
        return;
      }

      for (const [key, entry] of cache) {
        if (entry.rootSourceId === scope.rootSourceId) cache.delete(key);
      }
    },
  };
}

export function __previewDatasetDerivationCacheKeyForTest(
  request: DatasetDerivationRequest,
): string {
  return createPreviewDatasetDerivationCacheKey(request);
}

function createPreviewDatasetDerivationCacheKey(request: DatasetDerivationRequest): string {
  if (request.cacheKey) return `request:${request.cacheKey}`;

  const parts: DatasetDerivationCacheKeyParts = {
    kind: request.kind,
    rootSource: {
      id: request.rootSource.id,
      contentRevision: request.rootSource.contentRevision,
      contentHash: request.rootSource.contentHash,
    },
    datasetPath: request.datasetPath,
    target: {
      componentId: request.target.componentId,
      transformId: request.target.transformId,
    },
    materialization: {
      definitionRevision: request.materialization.definitionRevision,
      sourceRevision: request.materialization.sourceRevision,
      materializationRevision: request.materialization.materializationRevision,
      definitionHash: request.materialization.definitionHash,
      sourceHash: request.materialization.sourceHash,
      materializationHash: request.materialization.materializationHash,
    },
    configSignature: request.configSignature,
  };

  return `parts:${JSON.stringify(parts)}`;
}

function getCachedPreviewDerivation(
  cache: Map<string, PreviewDatasetDerivationCacheEntry>,
  key: string,
  request: DatasetDerivationRequest,
): DatasetDerivationResponse | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;

  cache.delete(key);
  cache.set(key, entry);

  return {
    status: "success",
    requestId: request.requestId,
    kind: entry.kind,
    cacheKey: entry.responseCacheKey,
    result: structuredClone(entry.result),
  };
}

function setCachedPreviewDerivation(
  cache: Map<string, PreviewDatasetDerivationCacheEntry>,
  key: string,
  request: DatasetDerivationRequest,
  response: Extract<DatasetDerivationResponse, { status: "success" }>,
): void {
  cache.set(key, {
    rootSourceId: request.rootSource.id,
    kind: response.kind,
    result: structuredClone(response.result),
    responseCacheKey: response.cacheKey,
  });

  while (cache.size > maxPreviewDerivationCacheEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) return;
    cache.delete(oldestKey);
  }
}

function derivePreviewDatasetRequest(
  request: PreviewDatasetDerivationRequest,
): DatasetDerivationResponse {
  if (request.kind === "table-columns") {
    return deriveTableColumnsRequest(request as PreviewTableDerivationRequest);
  }

  if (request.kind === "chart-series-mapping") {
    return deriveChartSeriesMappingRequest(request as PreviewChartDerivationRequest);
  }

  if (request.kind === "chart-field-options") {
    return deriveChartFieldOptionsRequest(request as PreviewChartDerivationRequest);
  }

  return createUnsupportedResponse(request, unsupportedDerivationMessage);
}

function deriveTableColumnsRequest(
  request: PreviewTableDerivationRequest,
): DatasetDerivationResponse {
  if (!request.table) {
    return createUnsupportedResponse(request, "Table derivation options are required.");
  }

  const metadata = deriveTableMetadata(request.dataset, request.table);
  if (!metadata.ok) {
    return createUnsupportedResponse(request, metadata.error ?? "Rows could not be inspected.");
  }

  const rows = Array.isArray(request.dataset)
    ? request.dataset.filter(isJsonObjectRecord)
    : metadata.rows;

  return {
    status: "success",
    requestId: request.requestId,
    kind: "table-columns",
    cacheKey: request.cacheKey,
    result: {
      tableColumns: metadata.columns.map((column) =>
        createTableColumn(column, rows, request.table?.columnsMode ?? "auto"),
      ),
    },
  };
}

function deriveChartSeriesMappingRequest(
  request: PreviewChartDerivationRequest,
): DatasetDerivationResponse {
  if (!request.chartSeriesMapping) {
    return createUnsupportedResponse(request, "Chart series mapping options are required.");
  }

  const rows = validateServiceChartRows(request.dataset, request.datasetPath);
  if (!rows.ok) {
    return createUnsupportedResponse(request, rows.error);
  }

  return {
    status: "success",
    requestId: request.requestId,
    kind: "chart-series-mapping",
    cacheKey: request.cacheKey,
    result: {
      chartSeriesMappings: [deriveDatasetChartSeriesMapping(rows.rows, request.chartSeriesMapping)],
    },
  };
}

function deriveChartFieldOptionsRequest(
  request: PreviewChartDerivationRequest,
): DatasetDerivationResponse {
  const rows = validateServiceChartRows(request.dataset, request.datasetPath);
  if (!rows.ok) {
    return createUnsupportedResponse(request, rows.error);
  }

  return {
    status: "success",
    requestId: request.requestId,
    kind: "chart-field-options",
    cacheKey: request.cacheKey,
    result: {
      chartFieldOptions: deriveDatasetChartFieldOptions(rows.rows, request.chartFieldOptions),
    },
  };
}

function createTableColumn(
  id: string,
  rows: readonly JsonObject[],
  columnsMode: StructuredTableColumnsMode,
): DatasetTableColumn {
  return {
    id,
    label: formatStructuredKeyLabel(id, columnsMode === "selected" ? "none" : "start-case"),
    valueKind: inferColumnValueKind(rows, id),
    sampleCount: rows.length,
  };
}

function inferColumnValueKind(
  rows: readonly JsonObject[],
  column: string,
): DatasetTableColumn["valueKind"] {
  const kinds = new Set<DatasetTableColumn["valueKind"]>();

  rows.forEach((row) => {
    const value = row[column];
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") kinds.add("boolean");
    else if (typeof value === "number") kinds.add("number");
    else if (typeof value === "string") kinds.add(isIsoDateLike(value) ? "date" : "string");
    else kinds.add("mixed");
  });

  if (kinds.size === 0) return "unknown";
  if (kinds.size === 1) return [...kinds][0] ?? "unknown";
  return "mixed";
}

function isIsoDateLike(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
}

function createUnsupportedResponse(
  request: DatasetDerivationRequest,
  message: string,
): DatasetDerivationResponse {
  return {
    status: "failure",
    requestId: request.requestId,
    error: {
      category: "unsupported-derivation",
      message,
    },
  };
}
