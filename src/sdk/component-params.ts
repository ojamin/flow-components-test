import { z, type ZodTypeAny } from "zod";

import type { ComponentThemePropertyGroup, ThemePropertyKey } from "./theme";

export type ParamControl =
  | { kind: "input"; placeholder?: string; testId?: string }
  | { kind: "data-path"; placeholder?: string; testId?: string }
  | RecordFieldParamControl
  | FieldListParamControl
  | AggregateListParamControl
  | { kind: "textarea"; rows?: number; placeholder?: string; testId?: string }
  | { kind: "number"; min?: number; max?: number; step?: number; testId?: string }
  | { kind: "select"; options: ParamSelectOption[]; testId?: string }
  | { kind: "boolean"; testId?: string }
  | { kind: "color"; testId?: string }
  | { kind: "code"; language: "json" | "javascript" | "markdown"; testId?: string }
  | HeadersParamControl
  | ViewListParamControl
  | ViewSelectParamControl
  | ChartAdapterParamControl
  | ThemeRoleParamControl;

/**
 * Single record-field selector. Stores a string field path inside a row. The
 * optional picker keys scope host-provided data-path pickers without changing
 * the persisted string value shape.
 */
export interface RecordFieldParamControl {
  kind: "record-field";
  placeholder?: string;
  pickerRootPathKey?: string;
  pickerRootPathSuffixKey?: string;
  testId?: string;
}

/** Editor for a `string[]` of field paths such as Group By group fields. */
export interface FieldListParamControl {
  kind: "field-list";
  addLabel?: string;
  itemPlaceholder?: string;
  pickerRootPathKey?: string;
  testId?: string;
}

/** Editor for aggregate-row list configs with role-specific source fields. */
export interface AggregateListParamControl {
  kind: "aggregate-list";
  operations: ParamSelectOption[];
  addLabel?: string;
  sourcePlaceholder?: string;
  outputPlaceholder?: string;
  sourcePickerRootPathKey?: string;
  testId?: string;
}

export interface HeadersParamControl {
  kind: "headers";
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
  testId?: string;
}

export interface ViewListParamControl {
  kind: "view-list";
  /** Add-button label. Defaults to "Add view". */
  addLabel?: string;
  /** Placeholder for the optional hash-slug input shown in expanded row details. */
  hashSlugPlaceholder?: string;
  testId?: string;
}

/** View-id selector populated from a sibling `kind: "view-list"` config. */
export interface ViewSelectParamControl {
  kind: "view-select";
  viewsParamKey: string;
  autoLabel?: string;
  invalidLabel?: string;
  placeholder?: string;
  testId?: string;
}

export interface ChartAdapterParamControl {
  kind: "chart-adapter";
  /** Config key holding the chart rows path (e.g. "rowsPath"). */
  rowsKey: string;
  /** Dependent field config keys this control patches together with rowsKey. */
  fields: readonly ParamChartAdapterFieldDescriptor[];
  rowsLabel?: string;
  rowsHint?: string;
  rowsPlaceholder?: string;
  testId?: string;
}

/** Component-theme role/property selector for themed paint/typography config. */
export interface ThemeRoleParamControl {
  kind: "theme-role";
  /** Allowed role groups. Defaults to `["color"]` for most raw-color migrations. */
  groups?: readonly ComponentThemePropertyGroup[];
  /** Optional explicit allowlist of property keys. */
  allowedKeys?: readonly ThemePropertyKey[];
  /** Whether the user can clear back to inherited theme. Defaults to `true`. */
  allowUnset?: boolean;
  /** Label for the inherit/clear option. Defaults to "Inherit from theme". */
  unsetLabel?: string;
  /** Render the trigger as disabled (read-only). */
  disabled?: boolean;
  testId?: string;
}

/**
 * Per-field slot inside a `kind: "chart-adapter"` descriptor. Each field maps
 * one config key to a chart adapter role for role-filtered suggestions.
 */
export interface ParamChartAdapterFieldDescriptor {
  /** Config key the field selector reads/writes (e.g. "xField"). */
  key: string;
  /** Chart adapter role used for option filtering and validation. */
  role: "x" | "y" | "label" | "value";
  label?: string;
  hint?: string;
  placeholder?: string;
}

/** Row shape produced by the `kind: "headers"` control. */
export interface ParamHeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParamSelectOption {
  label: string;
  value: string;
  description?: string;
}

export interface ParamBindSource {
  /** Input port id this param can read from. Must exist in `inputs`. */
  input: string;
  /** Data type the binding expects to resolve to. */
  typeId: string;
  /** Optional JSONPath used by preview/dev tooling when seeding initial bind state. */
  defaultPath?: string;
}

export type ParamInteractivityPredicate = (config: Readonly<Record<string, unknown>>) => boolean;

export interface ParamMeta {
  label: string;
  helpText?: string;
  group?: string;
  control: ParamControl;
  /** When true, ConfigPanel renders a literal/bind toggle. */
  bindable?: boolean;
  /** Allowed binding sources. Required and non-empty when `bindable: true`. */
  bindFrom?: ParamBindSource[];
  /** When false, hide from ConfigPanel while still parsing the value. */
  visible?: boolean;
  /** Hide from authoring controls when the defaults-merged authoring config does not satisfy this predicate. */
  showWhen?: ParamInteractivityPredicate;
  /** Disable authoring controls when the defaults-merged authoring config satisfies this predicate. */
  disabledWhen?: ParamInteractivityPredicate;
  /** Help text shown when `disabledWhen` disables the authoring control. */
  disabledHelpText?: string;
  /** Optional public schema projection override for parser schemas that accept aliases. */
  schemaProjection?: unknown;
}

export interface ParamDescriptor<TSchema extends ZodTypeAny = ZodTypeAny> {
  schema: TSchema;
  meta: ParamMeta;
}

export type ComponentParams = Record<string, ParamDescriptor>;

type ComponentParamsShape<TParams extends ComponentParams> = {
  [K in keyof TParams]: TParams[K]["schema"];
};

export function param<TSchema extends ZodTypeAny>(
  schema: TSchema,
  meta: ParamMeta,
): ParamDescriptor<TSchema> {
  return { schema, meta };
}

/** Build a configSchema from a params record. Each descriptor's schema becomes the field schema. */
export function paramsToConfigSchema<TParams extends ComponentParams>(
  params: TParams,
): z.ZodObject<ComponentParamsShape<TParams>> {
  const shape = Object.fromEntries(
    Object.entries(params).map(([key, descriptor]) => [key, descriptor.schema]),
  ) as ComponentParamsShape<TParams>;

  return z.object(shape);
}
