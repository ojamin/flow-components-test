import type { JsonValue } from "./schema-primitives.js";
export type DataPathToken = {
    kind: "property";
    key: string;
} | {
    kind: "index";
    index: number;
} | {
    kind: "wildcard";
};
export type DataPathIssueKind = "invalid-syntax" | "missing-data" | "unsupported-source";
export interface DataPathValidationResult {
    ok: boolean;
    path: string;
    tokens: DataPathToken[];
    issueKind: DataPathIssueKind | null;
    message: string | null;
}
export interface DataPathResolutionResult {
    ok: boolean;
    value: JsonValue | undefined;
    issueKind: DataPathIssueKind | null;
    message: string | null;
}
export declare function normalizeToJsonPath(path: string): string;
export declare function normalizeToRelativePath(path: string): string;
export declare function isValidDataPath(path: string, format?: "jsonpath" | "relative"): boolean;
export declare function validateDataPath(path: string, format?: "jsonpath" | "relative"): DataPathValidationResult;
export declare function resolveDataPath(root: JsonValue | undefined, path: string): DataPathResolutionResult;
export declare function formatDataPathTokens(tokens: readonly DataPathToken[], format?: "jsonpath" | "relative"): string;
export declare function isSafeDataPathProperty(key: string): boolean;
