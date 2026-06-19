import type { JsonValue } from "./schema-primitives";

export type DataPathToken =
  | { kind: "property"; key: string }
  | { kind: "index"; index: number }
  | { kind: "wildcard" };

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

const identifierPattern = /^[A-Za-z_$][\w$]*$/;

export function normalizeToJsonPath(path: string): string {
  if (path === "$" || path.startsWith("$.") || path.startsWith("$[")) return path;
  if (path.length === 0) return "$";
  if (path.startsWith("[")) return `$${path}`;
  return `$.${path}`;
}

export function normalizeToRelativePath(path: string): string {
  if (path === "$") return "";
  if (path.startsWith("$.")) return path.slice(2);
  if (path.startsWith("$[")) return path.slice(1);
  return path;
}

export function isValidDataPath(
  path: string,
  format: "jsonpath" | "relative" = "jsonpath",
): boolean {
  return validateDataPath(path, format).ok;
}

export function validateDataPath(
  path: string,
  format: "jsonpath" | "relative" = "jsonpath",
): DataPathValidationResult {
  const jsonPath = format === "jsonpath" ? path : normalizeToJsonPath(path);
  if (jsonPath.trim() !== jsonPath || !jsonPath.startsWith("$")) {
    return invalid(path, "Path must start with $ and cannot include surrounding spaces.");
  }

  const tokens: DataPathToken[] = [];
  let index = 1;
  while (index < jsonPath.length) {
    const char = jsonPath[index];
    if (char === ".") {
      const match = /^[A-Za-z_$][\w$]*/.exec(jsonPath.slice(index + 1));
      if (!match) return invalid(path, "Path contains an invalid property segment.");
      tokens.push({ kind: "property", key: match[0] });
      index += match[0].length + 1;
      continue;
    }

    if (char === "[") {
      const close = jsonPath.indexOf("]", index + 1);
      if (close < 0) return invalid(path, "Path contains an unterminated bracket segment.");
      const body = jsonPath.slice(index + 1, close);
      if (body === "*") {
        tokens.push({ kind: "wildcard" });
      } else if (/^\d+$/.test(body)) {
        tokens.push({ kind: "index", index: Number.parseInt(body, 10) });
      } else {
        return invalid(path, "Path bracket segments support indexes or * only.");
      }
      index = close + 1;
      continue;
    }

    return invalid(path, "Path contains unsupported syntax.");
  }

  return { ok: true, path: jsonPath, tokens, issueKind: null, message: null };
}

export function resolveDataPath(
  root: JsonValue | undefined,
  path: string,
): DataPathResolutionResult {
  if (root === undefined) {
    return {
      ok: false,
      value: undefined,
      issueKind: "unsupported-source",
      message: "No data source is available for this path.",
    };
  }

  const validation = validateDataPath(path, path.startsWith("$") ? "jsonpath" : "relative");
  if (!validation.ok) {
    return {
      ok: false,
      value: undefined,
      issueKind: validation.issueKind,
      message: validation.message,
    };
  }

  return resolveTokens(root, validation.tokens, path);
}

export function formatDataPathTokens(
  tokens: readonly DataPathToken[],
  format: "jsonpath" | "relative" = "relative",
): string {
  const relative = tokens.reduce((path, token) => {
    if (token.kind === "property") {
      return path.length === 0 ? token.key : `${path}.${token.key}`;
    }
    const bracket = token.kind === "index" ? `[${token.index}]` : "[*]";
    return `${path}${bracket}`;
  }, "");
  return format === "jsonpath" ? normalizeToJsonPath(relative) : relative;
}

export function isSafeDataPathProperty(key: string): boolean {
  return identifierPattern.test(key);
}

function resolveTokens(
  value: JsonValue,
  tokens: readonly DataPathToken[],
  originalPath: string,
): DataPathResolutionResult {
  if (tokens.length === 0) return { ok: true, value, issueKind: null, message: null };
  const [token, ...rest] = tokens;
  if (!token) return { ok: true, value, issueKind: null, message: null };

  if (token.kind === "property") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return missing(originalPath, `Path could not resolve property "${token.key}".`);
    }
    if (!Object.prototype.hasOwnProperty.call(value, token.key)) {
      return missing(originalPath, `Path could not resolve property "${token.key}".`);
    }
    return resolveTokens((value as Record<string, JsonValue>)[token.key]!, rest, originalPath);
  }

  if (token.kind === "index") {
    if (!Array.isArray(value) || token.index >= value.length) {
      return missing(originalPath, `Path could not resolve index ${token.index}.`);
    }
    return resolveTokens(value[token.index]!, rest, originalPath);
  }

  if (!Array.isArray(value)) {
    return missing(originalPath, "Wildcard selection requires an array value.");
  }

  const values: JsonValue[] = [];
  for (const item of value) {
    const resolved = resolveTokens(item, rest, originalPath);
    if (resolved.ok && resolved.value !== undefined) values.push(resolved.value);
  }
  return { ok: true, value: values, issueKind: null, message: null };
}

function invalid(path: string, message: string): DataPathValidationResult {
  return { ok: false, path, tokens: [], issueKind: "invalid-syntax", message };
}

function missing(path: string, message: string): DataPathResolutionResult {
  return {
    ok: false,
    value: undefined,
    issueKind: "missing-data",
    message: `${message} (${path})`,
  };
}
