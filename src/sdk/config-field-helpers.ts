import type { ZodTypeAny } from "zod";

import { param } from "./component-definition";
import type {
  ParamBindSource,
  ParamChartAdapterFieldDescriptor,
  ParamDescriptor,
  ParamMeta,
  ParamSelectOption,
} from "./component-definition";
import type { ComponentThemePropertyGroup, ThemePropertyKey } from "./theme";

export const dataBindSource = [{ input: "data", typeId: "all-data" }] satisfies ParamBindSource[];

export function dataBindSourceWithDefaultPath(defaultPath: string): ParamBindSource[] {
  return dataBindSource.map((source) => ({ ...source, defaultPath }));
}

export const visualPaddingTokens = ["none", "compact", "card", "panel", "page"] as const;
export const visualToneTokens = ["default"] as const;
export const visualRadiusTokens = ["none", "sm", "md", "lg", "xl"] as const;
export const visualShadowTokens = ["none", "sm", "md", "lg", "panel"] as const;
export const visualPaddingLabels = {
  none: "None",
  compact: "Compact",
  card: "Standard",
  panel: "Relaxed",
  page: "Generous",
} satisfies Partial<Record<(typeof visualPaddingTokens)[number], string>>;
export const visualRadiusLabels = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
} satisfies Partial<Record<(typeof visualRadiusTokens)[number], string>>;
export const visualShadowLabels = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  panel: "Extra large",
} satisfies Partial<Record<(typeof visualShadowTokens)[number], string>>;
export const visualToneLabels = {
  default: "Default",
} satisfies Partial<Record<(typeof visualToneTokens)[number], string>>;

type ParamInteractivityOptions = Pick<ParamMeta, "showWhen" | "disabledWhen" | "disabledHelpText">;

interface DataPathParamOptions extends ParamInteractivityOptions {
  label: string;
  placeholder: string;
  helpText?: string;
  testId?: string;
  bindable?: boolean;
  bindFrom?: ParamBindSource[];
}

interface RecordFieldParamOptions extends ParamInteractivityOptions {
  label: string;
  placeholder: string;
  helpText?: string;
  visible?: boolean;
  bindable?: boolean;
  bindFrom?: ParamBindSource[];
  /**
   * Optional sibling config key whose value scopes the data-path picker
   * tree. See `ParamControl["record-field"].pickerRootPathKey` for the
   * picker contract.
   */
  pickerRootPathKey?: string;
  /**
   * Optional sibling config key whose value joins onto the base rootPath via
   * a wildcard segment for nested array roots (e.g. multi-line points live
   * inside each series row). See
   * `ParamControl["record-field"].pickerRootPathSuffixKey` for the contract.
   */
  pickerRootPathSuffixKey?: string;
  testId?: string;
}

interface FieldListParamOptions extends ParamInteractivityOptions {
  label: string;
  helpText?: string;
  itemPlaceholder?: string;
  addLabel?: string;
  /**
   * Optional sibling config key whose value scopes the row picker tree.
   * See `ParamControl["field-list"].pickerRootPathKey` for the picker
   * contract.
   */
  pickerRootPathKey?: string;
  testId?: string;
  bindable?: boolean;
  bindFrom?: ParamBindSource[];
}

interface AggregateListParamOptions extends ParamInteractivityOptions {
  label: string;
  helpText?: string;
  operations: readonly ParamSelectOption[];
  addLabel?: string;
  sourcePlaceholder?: string;
  outputPlaceholder?: string;
  /**
   * Optional sibling config key whose value scopes the source-field
   * picker tree. See `ParamControl["aggregate-list"].sourcePickerRootPathKey`.
   */
  sourcePickerRootPathKey?: string;
  testId?: string;
  bindable?: boolean;
  bindFrom?: ParamBindSource[];
}

interface ChartAdapterParamOptions extends ParamInteractivityOptions {
  rowsKey?: string;
  rowsLabel?: string;
  rowsPlaceholder?: string;
  rowsHint?: string;
  fields: readonly ParamChartAdapterFieldDescriptor[];
  testId?: string;
  bindFrom?: ParamBindSource[];
}

interface NumberParamOptions extends ParamInteractivityOptions {
  label: string;
  helpText?: string;
  min: number;
  max: number;
  step?: number;
  testId?: string;
}

interface RenderLimitParamOptions extends Omit<NumberParamOptions, "helpText"> {
  noun: string;
  helpText?: string;
}

interface BooleanParamOptions extends ParamInteractivityOptions {
  label: string;
  helpText?: string;
  testId?: string;
}

interface SelectParamOptions<TValue extends string> extends ParamInteractivityOptions {
  label: string;
  options: readonly TValue[];
  labels?: Partial<Record<TValue, string>>;
  helpText?: string;
  testId?: string;
}

/**
 * Options for `themeRoleParam`. Outside the Theme component the only allowed
 * shape for color/font/typography authoring is selecting a declared
 * component-theme role; this helper wraps the canonical descriptor so each
 * call site stays consistent (humanised labels, inherit-from-theme default,
 * keyboard-accessible Select).
 *
 * Pick `groups` (defaults to `["color"]`) to enable a property family, or
 * provide an explicit `allowedKeys` allowlist when only a narrow subset of
 * roles is meaningful (e.g. accent + chart1-5 for a series tint control).
 */
interface ThemeRoleParamOptions extends ParamInteractivityOptions {
  label: string;
  helpText?: string;
  group?: string;
  groups?: readonly ComponentThemePropertyGroup[];
  allowedKeys?: readonly ThemePropertyKey[];
  /** Default `true`. Set `false` when a role binding is mandatory. */
  allowUnset?: boolean;
  unsetLabel?: string;
  /** Render the trigger as disabled (read-only). */
  disabled?: boolean;
  schemaProjection?: ParamMeta["schemaProjection"];
  testId?: string;
}

export function dataPathParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: DataPathParamOptions,
): ParamDescriptor<TSchema> {
  return param(
    schema,
    withBinding(options, {
      label: options.label,
      helpText: options.helpText,
      ...paramInteractivityMeta(options),
      control: {
        kind: "data-path",
        placeholder: options.placeholder,
        ...(options.testId ? { testId: options.testId } : {}),
      },
    }),
  );
}

export function recordFieldParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: RecordFieldParamOptions,
): ParamDescriptor<TSchema> {
  return param(
    schema,
    withBinding(options, {
      label: options.label,
      helpText: options.helpText,
      ...paramInteractivityMeta(options),
      control: {
        kind: "record-field",
        placeholder: options.placeholder,
        ...(options.pickerRootPathKey ? { pickerRootPathKey: options.pickerRootPathKey } : {}),
        ...(options.pickerRootPathSuffixKey
          ? { pickerRootPathSuffixKey: options.pickerRootPathSuffixKey }
          : {}),
        ...(options.testId ? { testId: options.testId } : {}),
      },
      ...(options.visible === false ? { visible: false } : {}),
    }),
  );
}

export function fieldListParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: FieldListParamOptions,
): ParamDescriptor<TSchema> {
  return param(
    schema,
    withBinding(options, {
      label: options.label,
      helpText: options.helpText,
      control: {
        kind: "field-list",
        ...(options.itemPlaceholder ? { itemPlaceholder: options.itemPlaceholder } : {}),
        ...(options.addLabel ? { addLabel: options.addLabel } : {}),
        ...(options.pickerRootPathKey ? { pickerRootPathKey: options.pickerRootPathKey } : {}),
        ...(options.testId ? { testId: options.testId } : {}),
      },
      ...paramInteractivityMeta(options),
    }),
  );
}

export function aggregateListParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: AggregateListParamOptions,
): ParamDescriptor<TSchema> {
  return param(
    schema,
    withBinding(options, {
      label: options.label,
      helpText: options.helpText,
      control: {
        kind: "aggregate-list",
        operations: options.operations.map((option) => ({ ...option })),
        ...(options.addLabel ? { addLabel: options.addLabel } : {}),
        ...(options.sourcePlaceholder ? { sourcePlaceholder: options.sourcePlaceholder } : {}),
        ...(options.outputPlaceholder ? { outputPlaceholder: options.outputPlaceholder } : {}),
        ...(options.sourcePickerRootPathKey
          ? { sourcePickerRootPathKey: options.sourcePickerRootPathKey }
          : {}),
        ...(options.testId ? { testId: options.testId } : {}),
      },
      ...paramInteractivityMeta(options),
    }),
  );
}

export function chartRowsAdapterParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: ChartAdapterParamOptions,
): ParamDescriptor<TSchema> {
  return param(schema, {
    label: options.rowsLabel ?? "Rows path",
    helpText: options.rowsHint,
    ...paramInteractivityMeta(options),
    control: {
      kind: "chart-adapter",
      rowsKey: options.rowsKey ?? "rowsPath",
      rowsLabel: options.rowsLabel ?? "Rows path",
      rowsPlaceholder: options.rowsPlaceholder ?? "Choose rows",
      fields: options.fields,
      ...(options.rowsHint ? { rowsHint: options.rowsHint } : {}),
      ...(options.testId ? { testId: options.testId } : {}),
    },
    bindable: true,
    bindFrom: options.bindFrom ?? dataBindSource,
  });
}

export function numberParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: NumberParamOptions,
): ParamDescriptor<TSchema> {
  return param(schema, {
    label: options.label,
    helpText: options.helpText,
    ...paramInteractivityMeta(options),
    control: {
      kind: "number",
      min: options.min,
      max: options.max,
      step: options.step ?? 1,
      ...(options.testId ? { testId: options.testId } : {}),
    },
  });
}

export function renderLimitParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: RenderLimitParamOptions,
): ParamDescriptor<TSchema> {
  return numberParam(schema, {
    ...options,
    helpText:
      options.helpText ?? `Caps how many ${options.noun} render so large data stays responsive.`,
  });
}

export function booleanParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: BooleanParamOptions,
): ParamDescriptor<TSchema> {
  return param(schema, {
    label: options.label,
    helpText: options.helpText,
    ...paramInteractivityMeta(options),
    control: { kind: "boolean", ...(options.testId ? { testId: options.testId } : {}) },
  });
}

export function themeRoleParam<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options: ThemeRoleParamOptions,
): ParamDescriptor<TSchema> {
  return param(schema, {
    label: options.label,
    helpText: options.helpText,
    group: options.group,
    schemaProjection: options.schemaProjection,
    ...paramInteractivityMeta(options),
    control: {
      kind: "theme-role",
      ...(options.groups ? { groups: options.groups } : {}),
      ...(options.allowedKeys ? { allowedKeys: options.allowedKeys } : {}),
      ...(typeof options.allowUnset === "boolean" ? { allowUnset: options.allowUnset } : {}),
      ...(options.unsetLabel ? { unsetLabel: options.unsetLabel } : {}),
      ...(options.disabled ? { disabled: options.disabled } : {}),
      ...(options.testId ? { testId: options.testId } : {}),
    },
  });
}

export function selectParam<TSchema extends ZodTypeAny, TValue extends string>(
  schema: TSchema,
  options: SelectParamOptions<TValue>,
): ParamDescriptor<TSchema> {
  return param(schema, {
    label: options.label,
    helpText: options.helpText,
    ...paramInteractivityMeta(options),
    control: {
      kind: "select",
      options: options.options.map((value) => ({
        label: options.labels?.[value] ?? titleizeToken(value),
        value,
      })) satisfies ParamSelectOption[],
      ...(options.testId ? { testId: options.testId } : {}),
    },
  });
}

function withBinding(
  options: { bindable?: boolean; bindFrom?: ParamBindSource[] },
  meta: ParamMeta,
) {
  if (options.bindable !== true) return meta;
  return {
    ...meta,
    bindable: true,
    bindFrom: options.bindFrom ?? dataBindSource,
  } satisfies ParamMeta;
}

function paramInteractivityMeta(options: ParamInteractivityOptions): Partial<ParamMeta> {
  return {
    ...(options.showWhen ? { showWhen: options.showWhen } : {}),
    ...(options.disabledWhen ? { disabledWhen: options.disabledWhen } : {}),
    ...(typeof options.disabledHelpText === "string"
      ? { disabledHelpText: options.disabledHelpText }
      : {}),
  };
}

function titleizeToken(value: string): string {
  if (value === "none") return "None";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
