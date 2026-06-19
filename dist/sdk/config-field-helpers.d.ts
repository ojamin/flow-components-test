import type { ZodTypeAny } from "zod";
import type { ParamBindSource, ParamChartAdapterFieldDescriptor, ParamDescriptor, ParamMeta, ParamSelectOption } from "./component-definition.js";
import type { ComponentThemePropertyGroup, ThemePropertyKey } from "./theme.js";
export declare const dataBindSource: {
    input: string;
    typeId: string;
}[];
export declare function dataBindSourceWithDefaultPath(defaultPath: string): ParamBindSource[];
export declare const visualPaddingTokens: readonly ["none", "compact", "card", "panel", "page"];
export declare const visualToneTokens: readonly ["default"];
export declare const visualRadiusTokens: readonly ["none", "sm", "md", "lg", "xl"];
export declare const visualShadowTokens: readonly ["none", "sm", "md", "lg", "panel"];
export declare const visualPaddingLabels: {
    none: string;
    compact: string;
    card: string;
    panel: string;
    page: string;
};
export declare const visualRadiusLabels: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
};
export declare const visualShadowLabels: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    panel: string;
};
export declare const visualToneLabels: {
    default: string;
};
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
export declare function dataPathParam<TSchema extends ZodTypeAny>(schema: TSchema, options: DataPathParamOptions): ParamDescriptor<TSchema>;
export declare function recordFieldParam<TSchema extends ZodTypeAny>(schema: TSchema, options: RecordFieldParamOptions): ParamDescriptor<TSchema>;
export declare function fieldListParam<TSchema extends ZodTypeAny>(schema: TSchema, options: FieldListParamOptions): ParamDescriptor<TSchema>;
export declare function aggregateListParam<TSchema extends ZodTypeAny>(schema: TSchema, options: AggregateListParamOptions): ParamDescriptor<TSchema>;
export declare function chartRowsAdapterParam<TSchema extends ZodTypeAny>(schema: TSchema, options: ChartAdapterParamOptions): ParamDescriptor<TSchema>;
export declare function numberParam<TSchema extends ZodTypeAny>(schema: TSchema, options: NumberParamOptions): ParamDescriptor<TSchema>;
export declare function renderLimitParam<TSchema extends ZodTypeAny>(schema: TSchema, options: RenderLimitParamOptions): ParamDescriptor<TSchema>;
export declare function booleanParam<TSchema extends ZodTypeAny>(schema: TSchema, options: BooleanParamOptions): ParamDescriptor<TSchema>;
export declare function themeRoleParam<TSchema extends ZodTypeAny>(schema: TSchema, options: ThemeRoleParamOptions): ParamDescriptor<TSchema>;
export declare function selectParam<TSchema extends ZodTypeAny, TValue extends string>(schema: TSchema, options: SelectParamOptions<TValue>): ParamDescriptor<TSchema>;
export {};
