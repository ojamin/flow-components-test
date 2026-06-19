import type { ParamDescriptor } from "./component-params.js";
export type ParamInteractivityConditionKind = "showWhen" | "disabledWhen";
export interface ParamInteractivityDiagnostic {
    paramKey: string;
    conditionKind: ParamInteractivityConditionKind;
    message: string;
}
export interface ParamInteractivityState {
    hidden: boolean;
    disabled: boolean;
    disabledHelpText?: string;
    diagnostics: ParamInteractivityDiagnostic[];
}
export declare function evaluateParamInteractivity(paramKey: string, descriptor: ParamDescriptor, config: Readonly<Record<string, unknown>>): ParamInteractivityState;
