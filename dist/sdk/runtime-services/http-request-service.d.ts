import type { JsonValue } from "../schema-primitives.js";
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
export type StaticHttpRequestRuntimeErrorCategory = "http-status" | "timeout" | "fetch-failure" | "invalid-url" | "invalid-json" | "export-policy-failure";
export interface StaticHttpRequestRuntimeError {
    category: StaticHttpRequestRuntimeErrorCategory;
    message: string;
    status?: number;
    details?: string;
}
export interface StaticHttpRequestRuntimeService {
    evaluate(input: StaticHttpRequestRuntimeInput): Promise<StaticHttpRequestRuntimeResult>;
}
export declare function configureHttpRequestRuntimeService(service: StaticHttpRequestRuntimeService): void;
export declare function getHttpRequestRuntimeService(): StaticHttpRequestRuntimeService;
export declare function configureHttpRequestTransformService(service: StaticHttpRequestRuntimeService): void;
export declare function getHttpRequestTransformService(): StaticHttpRequestRuntimeService;
