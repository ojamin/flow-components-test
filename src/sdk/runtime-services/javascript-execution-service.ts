export type StrictJsonValue =
  | null
  | boolean
  | number
  | string
  | StrictJsonValue[]
  | { [key: string]: StrictJsonValue };

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

interface NormalizedJavaScriptExecutionInput extends JavaScriptExecutionInput {
  readonly data: StrictJsonValue;
  readonly rows: StrictJsonValue;
}

export class JavaScriptExecutionError extends Error {
  constructor(
    message: string,
    readonly code: "blocked-capability" | "execution-failed" | "invalid-output" | "timeout",
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "JavaScriptExecutionError";
  }
}

const maxJsonDepth = 24;
// Keep this high enough for real spreadsheet/API payloads while still bounding
// accidental runaway structures before cloning them through JSON serialization.
const maxInputNodes = 1_000_000;
const maxOutputNodes = 1_000_000;
const maxJsonStringLength = 1_000_000;

interface JsonValidationState {
  nodes: number;
  seen: WeakSet<object>;
}

interface JsonValidationOptions {
  readonly valueLabel: "input" | "output";
  readonly maxNodes: number;
}

const inputValidationOptions = {
  valueLabel: "input",
  maxNodes: maxInputNodes,
} as const satisfies JsonValidationOptions;

const outputValidationOptions = {
  valueLabel: "output",
  maxNodes: maxOutputNodes,
} as const satisfies JsonValidationOptions;

type BrowserExecutionResponse =
  | { ok: true; value: unknown }
  | { ok: false; message: string; code?: JavaScriptExecutionError["code"] };

interface NodeVmModule {
  Script: new (source: string) => {
    runInContext: (
      context: unknown,
      options: { timeout: number; displayErrors: boolean },
    ) => unknown;
  };
  createContext: (
    sandbox: object,
    options: { codeGeneration: { strings: boolean; wasm: boolean } },
  ) => unknown;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertStrictJsonValue(
  value: unknown,
  path = "value",
  depth = 0,
  state: JsonValidationState = { nodes: 0, seen: new WeakSet() },
  options: JsonValidationOptions = outputValidationOptions,
): asserts value is StrictJsonValue {
  if (depth > maxJsonDepth) {
    throw new JavaScriptExecutionError(
      `JavaScript execution ${options.valueLabel} "${path}" exceeds maximum JSON depth.`,
      "invalid-output",
    );
  }

  state.nodes += 1;
  if (state.nodes > options.maxNodes) {
    throw new JavaScriptExecutionError(
      `JavaScript execution ${options.valueLabel} exceeds maximum JSON size.`,
      "invalid-output",
    );
  }

  if (value === null || typeof value === "boolean") {
    return;
  }

  if (typeof value === "string") {
    if (value.length > maxJsonStringLength) {
      throw new JavaScriptExecutionError(
        `JavaScript execution ${options.valueLabel} "${path}" exceeds maximum string length.`,
        "invalid-output",
      );
    }
    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new JavaScriptExecutionError(
        `JavaScript execution ${options.valueLabel} "${path}" must be a finite JSON number.`,
        "invalid-output",
      );
    }
    return;
  }

  if (Array.isArray(value)) {
    if (state.seen.has(value)) {
      throw new JavaScriptExecutionError(
        `JavaScript execution ${options.valueLabel} "${path}" must not contain circular references.`,
        "invalid-output",
      );
    }

    state.seen.add(value);
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new JavaScriptExecutionError(
          `JavaScript execution ${options.valueLabel} "${path}" must be strict JSON.`,
          "invalid-output",
        );
      }
      assertStrictJsonValue(value[index], `${path}[${index}]`, depth + 1, state, options);
    }
    state.seen.delete(value);
    return;
  }

  if (isPlainRecord(value) && Object.prototype.toString.call(value) === "[object Object]") {
    if (state.seen.has(value)) {
      throw new JavaScriptExecutionError(
        `JavaScript execution ${options.valueLabel} "${path}" must not contain circular references.`,
        "invalid-output",
      );
    }

    state.seen.add(value);
    for (const [key, item] of Object.entries(value)) {
      assertStrictJsonValue(item, `${path}.${key}`, depth + 1, state, options);
    }
    state.seen.delete(value);
    return;
  }

  throw new JavaScriptExecutionError(
    `JavaScript execution ${options.valueLabel} "${path}" must be strict JSON.`,
    "invalid-output",
  );
}

export function cloneJsonValue<T extends StrictJsonValue>(
  value: T,
  options: JsonValidationOptions = inputValidationOptions,
): T {
  assertStrictJsonValue(value, "value", 0, { nodes: 0, seen: new WeakSet() }, options);
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripCommentsAndStrings(script: string) {
  let stripped = "";
  let index = 0;

  while (index < script.length) {
    const char = script[index];
    const next = script[index + 1];

    if (char === "/" && next === "/") {
      index += 2;
      while (index < script.length && script[index] !== "\n") {
        index += 1;
      }
      stripped += "\n";
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < script.length && !(script[index] === "*" && script[index + 1] === "/")) {
        stripped += script[index] === "\n" ? "\n" : " ";
        index += 1;
      }
      index += 2;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      stripped += " ";
      index += 1;
      while (index < script.length) {
        if (script[index] === "\\") {
          stripped += " ";
          index += 2;
          continue;
        }
        if (script[index] === quote) {
          index += 1;
          break;
        }
        stripped += script[index] === "\n" ? "\n" : " ";
        index += 1;
      }
      continue;
    }

    stripped += char;
    index += 1;
  }

  return stripped;
}

function assertBlockedCapabilities(script: string, policy: JavaScriptBlockedCapabilitiesPolicy) {
  for (const name of policy.globalNames) {
    if (!/^[A-Za-z_$][\w$]*$/u.test(name)) {
      throw new JavaScriptExecutionError(
        `Blocked global capability "${name}" must be a valid JavaScript identifier.`,
        "execution-failed",
      );
    }
  }

  const searchableScript = stripCommentsAndStrings(script);
  const checks: Array<{ enabled: boolean; pattern: RegExp; message: string }> = [
    {
      enabled: policy.rejectDynamicImport,
      pattern: /\bimport\s*\(/u,
      message: "Dynamic import() is not supported.",
    },
    {
      enabled: policy.rejectAsync,
      pattern: /\b(?:async|Promise)\b/u,
      message: "Async JavaScript is not supported.",
    },
    {
      enabled: policy.rejectConstructorEscape,
      pattern: /\b(?:constructor|Function|eval)\b/u,
      message: "Constructor and eval access is not supported in JavaScript execution.",
    },
    {
      enabled: policy.rejectScheduling,
      pattern:
        /\b(?:setTimeout|setInterval|setImmediate|queueMicrotask|requestAnimationFrame|requestIdleCallback)\b/u,
      message: "Background scheduling is not supported in JavaScript execution.",
    },
  ];

  for (const { enabled, pattern, message } of checks) {
    if (enabled && pattern.test(searchableScript)) {
      throw new JavaScriptExecutionError(message, "blocked-capability");
    }
  }
}

function normalizeExecutionOutput(value: unknown) {
  assertStrictJsonValue(
    value,
    "output",
    0,
    { nodes: 0, seen: new WeakSet() },
    outputValidationOptions,
  );
  return JSON.parse(JSON.stringify(value)) as StrictJsonValue;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (isPlainRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return String(error);
}

function createWorkerValidationSource() {
  return `
const maxJsonDepth = ${maxJsonDepth};
const maxOutputNodes = ${maxOutputNodes};
const maxJsonStringLength = ${maxJsonStringLength};

function isPlainRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertStrictJsonValue(value, path, depth, state) {
  if (depth > maxJsonDepth) throw new Error('JavaScript execution output "' + path + '" exceeds maximum JSON depth.');
  state.nodes += 1;
  if (state.nodes > maxOutputNodes) throw new Error("JavaScript execution output exceeds maximum JSON size.");
  if (value === null || typeof value === "boolean") return;
  if (typeof value === "string") {
    if (value.length > maxJsonStringLength) throw new Error('JavaScript execution output "' + path + '" exceeds maximum string length.');
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error('JavaScript execution output "' + path + '" must be a finite JSON number.');
    return;
  }
  if (Array.isArray(value)) {
    if (state.seen.has(value)) throw new Error('JavaScript execution output "' + path + '" must not contain circular references.');
    state.seen.add(value);
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) throw new Error('JavaScript execution output "' + path + '" must be strict JSON.');
      assertStrictJsonValue(value[index], path + '[' + index + ']', depth + 1, state);
    }
    state.seen.delete(value);
    return;
  }
  if (isPlainRecord(value) && Object.prototype.toString.call(value) === "[object Object]") {
    if (state.seen.has(value)) throw new Error('JavaScript execution output "' + path + '" must not contain circular references.');
    state.seen.add(value);
    for (const [key, item] of Object.entries(value)) assertStrictJsonValue(item, path + '.' + key, depth + 1, state);
    state.seen.delete(value);
    return;
  }
  throw new Error('JavaScript execution output "' + path + '" must be strict JSON.');
}`;
}

function createWorkerSource(globalNames: readonly string[]) {
  return `
const compileUserFunction = Function;
const workerScope = globalThis;
const sendMessage = workerScope.postMessage.bind(workerScope);
const blockedGlobals = ${JSON.stringify([...globalNames])};
${createWorkerValidationSource()}

function disableAmbientAccess() {
  for (const name of blockedGlobals) {
    try {
      Object.defineProperty(workerScope, name, { configurable: false, enumerable: false, get() { return undefined; }, set() {} });
    } catch {}
  }

  const functionConstructorPrototypes = [Function.prototype, Object.getPrototypeOf(function* () {})];
  try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function () {})); } catch {}
  try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function* () {})); } catch {}

  for (const prototype of [Object.prototype, Array.prototype, ...functionConstructorPrototypes]) {
    try { Object.defineProperty(prototype, "constructor", { configurable: false, get() { return undefined; } }); } catch {}
  }
  try { Object.defineProperty(workerScope, "Function", { configurable: false, value: undefined }); } catch {}
  try { Object.defineProperty(workerScope, "eval", { configurable: false, value: undefined }); } catch {}
}

disableAmbientAccess();

workerScope.onmessage = (event) => {
  try {
    const { script, data, rows, secondary } = event.data;
    const runner = compileUserFunction("data", "rows", "secondary", ...blockedGlobals, '"use strict";\\n' + script);
    const value = runner(data, rows, secondary, ...blockedGlobals.map(() => undefined));
    if (value && typeof value.then === "function") throw new Error("Async JavaScript is not supported. Return plain JSON output values.");
    assertStrictJsonValue(value, "output", 0, { nodes: 0, seen: new WeakSet() });
    sendMessage({ ok: true, value });
  } catch (error) {
    sendMessage({ ok: false, code: "execution-failed", message: error instanceof Error ? error.message : String(error) });
  }
};`;
}

function createVmSource(input: NormalizedJavaScriptExecutionInput) {
  const blockedGlobals = input.blockedCapabilitiesPolicy.globalNames;
  const parameters = ["data", "rows", "secondary", ...blockedGlobals].join(", ");
  const args = ["data", "rows", "secondary", ...blockedGlobals.map(() => "undefined")].join(", ");

  return `
"use strict";
const data = JSON.parse(${JSON.stringify(JSON.stringify(input.data))});
const rows = JSON.parse(${JSON.stringify(JSON.stringify(input.rows))});
const secondary = ${
    input.secondary === undefined
      ? "undefined"
      : `JSON.parse(${JSON.stringify(JSON.stringify(input.secondary))})`
  };

const functionConstructorPrototypes = [Function.prototype, Object.getPrototypeOf(function* () {})];
try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function () {})); } catch {}
try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function* () {})); } catch {}

for (const prototype of [Object.prototype, Array.prototype, ...functionConstructorPrototypes]) {
  Object.defineProperty(prototype, "constructor", { configurable: false, get() { return undefined; } });
}

(function(${parameters}) {
  "use strict";
${input.script}
})(${args});`;
}

async function importNodeVm() {
  const nodeVmSpecifier = "node:vm";
  return import(/* @vite-ignore */ nodeVmSpecifier) as Promise<NodeVmModule>;
}

async function executeInNodeVm(input: NormalizedJavaScriptExecutionInput) {
  const vm = await importNodeVm();
  const context = vm.createContext(Object.create(null), {
    codeGeneration: { strings: false, wasm: false },
  });
  const vmScript = new vm.Script(createVmSource(input));

  return vmScript.runInContext(context, {
    timeout: input.timeoutMs,
    displayErrors: false,
  });
}

function postBrowserWorkerExecution(worker: Worker, input: NormalizedJavaScriptExecutionInput) {
  return new Promise<unknown>((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new JavaScriptExecutionError("JavaScript execution timed out.", "timeout"));
    }, input.timeoutMs);

    const cleanup = () => {
      clearTimeout(timeout);
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.removeEventListener("messageerror", handleMessageError);
    };

    const handleMessage = (event: MessageEvent<BrowserExecutionResponse>) => {
      cleanup();
      const response = event.data;
      if (response.ok) {
        resolve(response.value);
        return;
      }
      reject(new JavaScriptExecutionError(response.message, response.code ?? "execution-failed"));
    };

    const handleError = (event: ErrorEvent) => {
      cleanup();
      reject(new JavaScriptExecutionError(event.message, "execution-failed"));
    };

    const handleMessageError = () => {
      cleanup();
      reject(
        new JavaScriptExecutionError(
          "JavaScript execution worker message failed.",
          "execution-failed",
        ),
      );
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
    worker.addEventListener("messageerror", handleMessageError);
    try {
      worker.postMessage({
        script: input.script,
        data: input.data,
        rows: input.rows,
        secondary: input.secondary,
      });
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

async function executeInBrowserWorkerOnce(input: NormalizedJavaScriptExecutionInput) {
  const workerSource = createWorkerSource(input.blockedCapabilitiesPolicy.globalNames);
  const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
  const worker = new Worker(workerUrl);

  try {
    return await postBrowserWorkerExecution(worker, input);
  } finally {
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }
}

function isBrowserWorkerCloneError(error: unknown) {
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "DataCloneError"
  ) {
    return true;
  }

  return /could not be cloned|DataCloneError/iu.test(getErrorMessage(error));
}

async function executeInBrowserWorker(input: NormalizedJavaScriptExecutionInput) {
  try {
    return await executeInBrowserWorkerOnce(input);
  } catch (error) {
    if (!isBrowserWorkerCloneError(error)) {
      throw error;
    }

    return executeInBrowserWorkerOnce(createClonedExecutionInput(input, input.data));
  }
}

function canUseBrowserWorker() {
  return typeof Worker === "function" && typeof Blob === "function" && typeof URL !== "undefined";
}

export class JavaScriptExecutionService {
  async execute(input: JavaScriptExecutionInput): Promise<JavaScriptExecutionResult> {
    if (!Number.isFinite(input.timeoutMs) || input.timeoutMs <= 0) {
      throw new JavaScriptExecutionError(
        "JavaScript execution timeoutMs must be a positive finite number.",
        "execution-failed",
      );
    }

    const data = input.data ?? input.rows;
    if (data === undefined) {
      throw new JavaScriptExecutionError(
        "JavaScript execution data input is required.",
        "execution-failed",
      );
    }

    assertBlockedCapabilities(input.script, input.blockedCapabilitiesPolicy);

    try {
      const rawValue = canUseBrowserWorker()
        ? await executeInBrowserWorker(createBrowserExecutionInput(input, data))
        : await executeInNodeVm(createClonedExecutionInput(input, data));

      return { value: normalizeExecutionOutput(rawValue) };
    } catch (error) {
      if (error instanceof JavaScriptExecutionError) {
        throw error;
      }

      if (/timed out|Script execution timed out/iu.test(getErrorMessage(error))) {
        throw new JavaScriptExecutionError("JavaScript execution timed out.", "timeout", {
          cause: error,
        });
      }

      throw new JavaScriptExecutionError(
        `JavaScript execution failed: ${getErrorMessage(error)}`,
        "execution-failed",
        {
          cause: error,
        },
      );
    }
  }
}

function createBrowserExecutionInput(
  input: JavaScriptExecutionInput,
  data: StrictJsonValue,
): NormalizedJavaScriptExecutionInput {
  assertStrictJsonValue(
    data,
    "value",
    0,
    { nodes: 0, seen: new WeakSet() },
    inputValidationOptions,
  );
  const rows = input.rows ?? data;

  if (rows !== data) {
    assertStrictJsonValue(
      rows,
      "value",
      0,
      { nodes: 0, seen: new WeakSet() },
      inputValidationOptions,
    );
  }

  if (input.secondary !== undefined) {
    assertStrictJsonValue(
      input.secondary,
      "value",
      0,
      { nodes: 0, seen: new WeakSet() },
      inputValidationOptions,
    );
  }

  return {
    ...input,
    data,
    rows,
  };
}

function createClonedExecutionInput(
  input: JavaScriptExecutionInput,
  data: StrictJsonValue,
): NormalizedJavaScriptExecutionInput {
  const clonedData = cloneJsonValue(data);
  const rowsSource = input.rows ?? data;
  const clonedRows = rowsSource === data ? clonedData : cloneJsonValue(rowsSource);

  return {
    ...input,
    data: clonedData,
    rows: clonedRows,
    secondary: input.secondary === undefined ? undefined : cloneJsonValue(input.secondary),
  };
}
