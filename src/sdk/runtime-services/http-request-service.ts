import type { JsonValue } from "../schema-primitives";

export type StaticHttpRequestExportPolicy = "live" | "embedded" | "live-with-embedded-fallback";

export interface StaticHttpRequestKeyValueField {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface StaticHttpRequestConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  headers: StaticHttpRequestKeyValueField[];
  query: StaticHttpRequestKeyValueField[];
  bodyMode: "none" | "json" | "text";
  bodyText?: string;
  timeoutMs: number;
  responseMode: "json";
}

export interface StaticHttpRequestRuntimeInput {
  instanceId: string;
  config: StaticHttpRequestConfig;
  params?: JsonValue;
  previousCacheKind?: "cached" | "embedded";
  previousCacheSignature?: string;
  previousCacheData?: JsonValue;
  previousCacheFetchedAt?: string;
  exportPolicy: StaticHttpRequestExportPolicy;
}

export interface StaticHttpRequestRuntimeCachePersistence {
  data: JsonValue;
  fetchedAt: string;
  requestSignature: string;
}

export interface StaticHttpRequestRuntimeResult {
  outputs: {
    data?: JsonValue;
    meta?: JsonValue;
  };
  cachePersistence?: StaticHttpRequestRuntimeCachePersistence;
}

export type StaticHttpRequestRuntimeErrorCategory =
  | "http-status"
  | "timeout"
  | "fetch-failure"
  | "invalid-url"
  | "invalid-json"
  | "export-policy-failure";

export interface StaticHttpRequestRuntimeError {
  category: StaticHttpRequestRuntimeErrorCategory;
  message: string;
  status?: number;
  details?: string;
}

export interface StaticHttpRequestRuntimeService {
  evaluate(input: StaticHttpRequestRuntimeInput): Promise<StaticHttpRequestRuntimeResult>;
}

// ---------------------------------------------------------------------------
// Injectable service singletons — configured by the host application.
// Call configureHttpRequestRuntimeService / configureHttpRequestTransformService
// before any data.http-request runtime or transform evaluation runs.
// ---------------------------------------------------------------------------

let httpRequestRuntimeService: StaticHttpRequestRuntimeService | null = null;
let httpRequestTransformService: StaticHttpRequestRuntimeService | null = null;

export function configureHttpRequestRuntimeService(service: StaticHttpRequestRuntimeService): void {
  httpRequestRuntimeService = service;
}

export function getHttpRequestRuntimeService(): StaticHttpRequestRuntimeService {
  if (!httpRequestRuntimeService) {
    throw new Error(
      "HTTP request runtime service has not been configured. " +
        "Call configureHttpRequestRuntimeService() before evaluating data.http-request nodes.",
    );
  }

  return httpRequestRuntimeService;
}

export function configureHttpRequestTransformService(
  service: StaticHttpRequestRuntimeService,
): void {
  httpRequestTransformService = service;
}

export function getHttpRequestTransformService(): StaticHttpRequestRuntimeService {
  if (!httpRequestTransformService) {
    throw new Error(
      "HTTP request transform service has not been configured. " +
        "Call configureHttpRequestTransformService() before using data.http-request transforms.",
    );
  }

  return httpRequestTransformService;
}
