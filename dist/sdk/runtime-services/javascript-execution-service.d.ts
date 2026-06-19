export type StrictJsonValue = null | boolean | number | string | StrictJsonValue[] | {
    [key: string]: StrictJsonValue;
};
export interface JavaScriptBlockedCapabilitiesPolicy {
    readonly globalNames: readonly string[];
    readonly rejectDynamicImport: boolean;
    readonly rejectAsync: boolean;
    readonly rejectConstructorEscape: boolean;
    readonly rejectScheduling: boolean;
}
export interface JavaScriptExecutionInput {
    readonly script: string;
    readonly data?: StrictJsonValue;
    /** Legacy alias exposed to scripts authored before transform.javascript used a generic data input. */
    readonly rows?: StrictJsonValue;
    readonly secondary?: StrictJsonValue;
    readonly timeoutMs: number;
    readonly blockedCapabilitiesPolicy: JavaScriptBlockedCapabilitiesPolicy;
}
export interface JavaScriptExecutionResult {
    readonly value: StrictJsonValue;
}
export declare class JavaScriptExecutionError extends Error {
    readonly code: "blocked-capability" | "execution-failed" | "invalid-output" | "timeout";
    constructor(message: string, code: "blocked-capability" | "execution-failed" | "invalid-output" | "timeout", options?: {
        cause?: unknown;
    });
}
interface JsonValidationState {
    nodes: number;
    seen: WeakSet<object>;
}
interface JsonValidationOptions {
    readonly valueLabel: "input" | "output";
    readonly maxNodes: number;
}
export declare function assertStrictJsonValue(value: unknown, path?: string, depth?: number, state?: JsonValidationState, options?: JsonValidationOptions): asserts value is StrictJsonValue;
export declare function cloneJsonValue<T extends StrictJsonValue>(value: T, options?: JsonValidationOptions): T;
export declare class JavaScriptExecutionService {
    execute(input: JavaScriptExecutionInput): Promise<JavaScriptExecutionResult>;
}
export {};
