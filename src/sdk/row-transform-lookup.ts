import type { JsonObject } from "./schema-primitives";
import type { RowTransformConfig } from "./row-transform-engine-types";
import { deriveOutputFieldName, readRowField } from "./transform-contracts";
import {
  cloneJsonObject,
  cloneJsonValue,
  readOrNull,
  setOutputField,
  stableStringify,
} from "./row-transform-utils";

export function lookupRows(
  rows: readonly JsonObject[],
  lookupRowsData: readonly JsonObject[],
  config: Extract<RowTransformConfig, { operation: "lookup" }>,
): JsonObject[] {
  const index = new Map<string, JsonObject[]>();
  for (const lookupRow of lookupRowsData) {
    const key = stableStringify(readRowField(lookupRow, config.rightKey) ?? null);
    index.set(key, [...(index.get(key) ?? []), lookupRow]);
  }

  const joined: JsonObject[] = [];
  for (const row of rows) {
    const matches = index.get(stableStringify(readRowField(row, config.leftKey) ?? null)) ?? [];
    if (matches.length === 0) {
      if (config.unmatched === "keep") joined.push(cloneJsonObject(row));
      continue;
    }
    for (const match of config.multiple === "first" ? matches.slice(0, 1) : matches) {
      joined.push({ ...row, ...projectLookupFields(match, config.fields, config.prefix) });
    }
  }
  return joined;
}

function projectLookupFields(
  row: JsonObject,
  fields: readonly { readonly sourceField: string; readonly outputField?: string }[],
  prefix: string,
): JsonObject {
  if (fields.length > 0) {
    const projected: JsonObject = {};
    fields.forEach((field, index) => {
      setOutputField(
        projected,
        field.outputField ?? `${prefix}${deriveOutputFieldName(field.sourceField)}`,
        readOrNull(row, field.sourceField),
        field.outputField ? `fields[${index}].outputField` : `fields[${index}].sourceField/prefix`,
      );
    });
    return projected;
  }
  const projected: JsonObject = {};
  for (const [key, value] of Object.entries(row)) {
    setOutputField(
      projected,
      `${prefix}${key}`,
      cloneJsonValue(value),
      `prefix/generated lookup field "${key}"`,
    );
  }
  return projected;
}
