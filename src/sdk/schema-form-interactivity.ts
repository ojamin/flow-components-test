import type { ParamDescriptor } from "./component-params";

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

export function evaluateParamInteractivity(
  paramKey: string,
  descriptor: ParamDescriptor,
  config: Readonly<Record<string, unknown>>,
): ParamInteractivityState {
  const diagnostics: ParamInteractivityDiagnostic[] = [];

  if (descriptor.meta.visible === false) {
    return { hidden: true, disabled: false, diagnostics };
  }

  const visible = evaluateCondition({
    paramKey,
    condition: "showWhen",
    predicate: descriptor.meta.showWhen,
    config,
    fallback: true,
    diagnostics,
  });
  const hidden = !visible;

  if (hidden) {
    return { hidden, disabled: false, diagnostics };
  }

  const disabled = evaluateCondition({
    paramKey,
    condition: "disabledWhen",
    predicate: descriptor.meta.disabledWhen,
    config,
    fallback: false,
    diagnostics,
  });

  return {
    hidden,
    disabled,
    ...(disabled && descriptor.meta.disabledHelpText
      ? { disabledHelpText: descriptor.meta.disabledHelpText }
      : {}),
    diagnostics,
  };
}

interface EvaluateConditionOptions {
  paramKey: string;
  condition: ParamInteractivityConditionKind;
  predicate?: (config: Readonly<Record<string, unknown>>) => boolean;
  config: Readonly<Record<string, unknown>>;
  fallback: boolean;
  diagnostics: ParamInteractivityDiagnostic[];
}

function evaluateCondition({
  paramKey,
  condition,
  predicate,
  config,
  fallback,
  diagnostics,
}: EvaluateConditionOptions): boolean {
  if (!predicate) return fallback;

  try {
    return predicate(config);
  } catch (error) {
    diagnostics.push({
      paramKey,
      conditionKind: condition,
      message: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}
