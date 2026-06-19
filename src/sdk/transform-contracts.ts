import type { InputPortDefinition, OutputPortDefinition } from "./component-definition";
import { isKnownDataTypeId, type DataTypeId } from "./data-types";
import { isSafeDataPathProperty, resolveDataPath, validateDataPath } from "./data-path-helpers";
import type { JsonObject, JsonValue } from "./schema-primitives";

export const transformOperationIds = [
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
] as const;

export type TransformOperationId = (typeof transformOperationIds)[number];

const transformOperationIdSet = new Set<string>(transformOperationIds);

export const rowTransformInputTypeIds = [
  "table-rows",
  "json-array",
  "all-data",
] as const satisfies readonly DataTypeId[];

export const rowTransformOutputTypeIds = {
  rows: "table-rows",
  all: "all-data",
} as const satisfies Record<string, DataTypeId>;

export const transformFieldPickerRoles = [
  "row-source",
  "field",
  "numeric-field",
  "date-field",
  "group-key",
  "join-key",
  "sort-key",
  "projection",
  "format-target",
] as const;

export type TransformFieldPickerRole = (typeof transformFieldPickerRoles)[number];

export interface TransformFieldPickerHint {
  readonly id: string;
  readonly role: TransformFieldPickerRole;
  readonly label?: string;
  readonly pathConfigKey?: string;
  readonly rowsPathConfigKey?: string;
  readonly allowMultiple?: boolean;
}

export interface RowTransformContract {
  readonly operation: TransformOperationId;
  readonly inputs: readonly InputPortDefinition[];
  readonly outputs: readonly OutputPortDefinition[];
  readonly fieldPickers: readonly TransformFieldPickerHint[];
}

export interface CreateRowTransformContractOptions {
  readonly operation: TransformOperationId;
  readonly inputId?: string;
  readonly inputLabel?: string;
  readonly includeLookupInput?: boolean;
  readonly lookupInputId?: string;
  readonly lookupInputLabel?: string;
  readonly rowsOutputId?: string;
  readonly rowsOutputLabel?: string;
  readonly allOutputId?: string;
  readonly allOutputLabel?: string;
  readonly fieldPickers?: readonly TransformFieldPickerHint[];
}

export type RowFieldValueKind =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "null"
  | "json"
  | "mixed";

interface StableRowKeyPart extends JsonObject {
  readonly field: string;
  readonly value: string | number | boolean;
}

export interface RowFieldMetadata {
  readonly path: string;
  readonly label: string;
  readonly kind: RowFieldValueKind;
  readonly occurrences: number;
  readonly sampleValues: readonly JsonValue[];
}

export function createRowTransformInputPort(
  options: {
    readonly id?: string;
    readonly label?: string;
    readonly required?: boolean;
  } = {},
): InputPortDefinition {
  return {
    id: options.id ?? "data",
    label: options.label ?? "Data",
    mode: "full",
    acceptedTypeIds: [...rowTransformInputTypeIds],
    required: options.required ?? true,
    allowMultiple: false,
    allowCycle: false,
  };
}

export function createLookupInputPort(
  options: {
    readonly id?: string;
    readonly label?: string;
    readonly required?: boolean;
  } = {},
): InputPortDefinition {
  return createRowTransformInputPort({
    id: options.id ?? "lookup",
    label: options.label ?? "Lookup data",
    required: options.required ?? false,
  });
}

export function createRowTransformOutputPorts(
  options: {
    readonly rowsId?: string;
    readonly rowsLabel?: string;
    readonly allId?: string;
    readonly allLabel?: string;
  } = {},
): readonly OutputPortDefinition[] {
  return [
    {
      id: options.rowsId ?? "rows",
      label: options.rowsLabel ?? "Rows",
      typeId: rowTransformOutputTypeIds.rows,
    },
    {
      id: options.allId ?? "all",
      label: options.allLabel ?? "All data",
      typeId: rowTransformOutputTypeIds.all,
    },
  ];
}

export function createRowTransformContract(
  options: CreateRowTransformContractOptions,
): RowTransformContract {
  if (!transformOperationIdSet.has(options.operation)) {
    throw new Error(`Unknown transform operation: ${options.operation}`);
  }

  const fieldPickers = options.fieldPickers ?? [];
  assertUniqueIds(
    "field picker",
    fieldPickers.map((hint) => hint.id),
  );

  return {
    operation: options.operation,
    inputs: [
      createRowTransformInputPort({ id: options.inputId, label: options.inputLabel }),
      ...(options.includeLookupInput
        ? [createLookupInputPort({ id: options.lookupInputId, label: options.lookupInputLabel })]
        : []),
    ],
    outputs: createRowTransformOutputPorts({
      rowsId: options.rowsOutputId,
      rowsLabel: options.rowsOutputLabel,
      allId: options.allOutputId,
      allLabel: options.allOutputLabel,
    }),
    fieldPickers,
  };
}

export function resolveRowSource(data: JsonValue | undefined, rowsPath = ""): readonly JsonValue[] {
  const source = data ?? null;
  const trimmedPath = rowsPath.trim();

  if (trimmedPath.length === 0) {
    return Array.isArray(source) ? source : [];
  }

  const validation = validateDataPath(
    trimmedPath,
    trimmedPath.startsWith("$") ? "jsonpath" : "relative",
  );
  if (!validation.ok) return [];

  const resolved = resolveDataPath(source, trimmedPath);
  return resolved.ok && Array.isArray(resolved.value) ? resolved.value : [];
}

export function readRowField(row: JsonValue, path: string): JsonValue | undefined {
  const trimmedPath = path.trim();
  if (trimmedPath.length === 0) return row;

  const resolved = resolveDataPath(row, trimmedPath);
  return resolved.ok ? resolved.value : undefined;
}

export function deriveOutputFieldName(path: string, fallback = "value"): string {
  const trimmedPath = path.trim();
  if (trimmedPath.length === 0) return fallback;

  const validation = validateDataPath(
    trimmedPath,
    trimmedPath.startsWith("$") ? "jsonpath" : "relative",
  );
  if (!validation.ok || validation.tokens.length === 0) return trimmedPath;

  const last = validation.tokens[validation.tokens.length - 1]!;
  if (last.kind === "property") return last.key;
  if (last.kind === "index") return String(last.index);
  return fallback;
}

export function createStableRowKey(row: JsonValue, keyFields: readonly string[] = []): string {
  const keyParts: StableRowKeyPart[] = [];

  for (const field of keyFields) {
    const value = readRowField(row, field);
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      keyParts.push({ field, value });
    }
  }

  if (keyParts.length === 1) {
    const part = keyParts[0]!;
    return `${part.field}:${String(part.value)}`;
  }

  if (keyParts.length > 1) return `key:${stableStringify(keyParts)}`;

  return `row:${stableStringify(row)}`;
}

export function inferRowFieldMetadata(rows: readonly JsonValue[]): readonly RowFieldMetadata[] {
  const byPath = new Map<string, { values: JsonValue[]; occurrences: number }>();

  for (const row of rows) {
    if (!isJsonObject(row)) continue;
    collectRowFields(row, "", byPath);
  }

  return [...byPath.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, entry]) => ({
      path,
      label: deriveOutputFieldName(path),
      kind: inferFieldKind(entry.values),
      occurrences: entry.occurrences,
      sampleValues: entry.values.slice(0, 5),
    }));
}

function collectRowFields(
  value: JsonObject,
  prefix: string,
  byPath: Map<string, { values: JsonValue[]; occurrences: number }>,
): void {
  for (const [key, child] of Object.entries(value)) {
    if (!isSafeDataPathProperty(key)) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isJsonObject(child)) {
      collectRowFields(child, path, byPath);
      continue;
    }
    const entry = byPath.get(path) ?? { values: [], occurrences: 0 };
    entry.occurrences += 1;
    if (entry.values.length < 5) entry.values.push(child);
    byPath.set(path, entry);
  }
}

function inferFieldKind(values: readonly JsonValue[]): RowFieldValueKind {
  const kinds = new Set(values.map((value) => classifyValue(value)));
  if (kinds.size === 1) return [...kinds][0]!;
  if (kinds.has("null") && kinds.size === 2) return [...kinds].find((kind) => kind !== "null")!;
  return "mixed";
}

function classifyValue(value: JsonValue): RowFieldValueKind {
  if (value === null) return "null";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") return Number.isNaN(Date.parse(value)) ? "string" : "date";
  return "json";
}

function stableStringify(value: JsonValue): string {
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  if (isJsonObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key]!)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertUniqueIds(kind: string, ids: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`Duplicate ${kind} id: ${id}`);
    seen.add(id);
  }
}

for (const typeId of [...rowTransformInputTypeIds, ...Object.values(rowTransformOutputTypeIds)]) {
  if (!isKnownDataTypeId(typeId)) throw new Error(`Unknown row transform data type: ${typeId}`);
}
