import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cloneJsonValue,
  JavaScriptExecutionError,
  JavaScriptExecutionService,
  type JavaScriptBlockedCapabilitiesPolicy,
} from "./javascript-execution-service";

const blockedCapabilitiesPolicy = {
  globalNames: ["window", "document", "fetch"],
  rejectDynamicImport: true,
  rejectAsync: true,
  rejectConstructorEscape: true,
  rejectScheduling: true,
} as const satisfies JavaScriptBlockedCapabilitiesPolicy;

type Listener = (event: { data: unknown }) => void;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("JavaScriptExecutionService", () => {
  it("executes and returns large JSON arrays without tripping the runtime payload cap", async () => {
    const rows = Array.from({ length: 50_000 }, (_, index) => index);

    await expect(
      new JavaScriptExecutionService().execute({
        script: `return {
  output1: data,
  output2: data.length,
  output3: data[data.length - 1],
};`,
        data: rows,
        timeoutMs: 1_000,
        blockedCapabilitiesPolicy,
      }),
    ).resolves.toEqual({
      value: {
        output1: rows,
        output2: 50_000,
        output3: 49_999,
      },
    });
  });

  it("exposes rows as a legacy alias for authored scripts", async () => {
    const data = { profile: { name: "Jess" } };

    await expect(
      new JavaScriptExecutionService().execute({
        script: "return { output1: rows.profile.name, output2: data.profile.name };",
        data,
        timeoutMs: 1_000,
        blockedCapabilitiesPolicy,
      }),
    ).resolves.toEqual({
      value: {
        output1: "Jess",
        output2: "Jess",
      },
    });
  });

  it("labels input validation failures as input errors", () => {
    expect(() => cloneJsonValue([Number.NaN])).toThrow(JavaScriptExecutionError);
    expect(() => cloneJsonValue([Number.NaN])).toThrow(
      'JavaScript execution input "value[0]" must be a finite JSON number.',
    );
  });

  it("falls back to cloned browser worker input when validated payloads are not cloneable", async () => {
    const postedMessages: unknown[] = [];
    const dataCloneError =
      typeof DOMException === "undefined"
        ? new Error("Failed to execute 'postMessage' on 'Worker': #<Object> could not be cloned.")
        : new DOMException(
            "Failed to execute 'postMessage' on 'Worker': #<Object> could not be cloned.",
            "DataCloneError",
          );
    let workerCount = 0;

    class FakeWorker {
      private readonly listeners = new Map<string, Listener>();
      private readonly workerIndex = ++workerCount;

      addEventListener(type: string, listener: Listener) {
        this.listeners.set(type, listener);
      }

      removeEventListener(type: string) {
        this.listeners.delete(type);
      }

      terminate() {}

      postMessage(message: unknown) {
        postedMessages.push(message);
        if (this.workerIndex === 1) {
          throw dataCloneError;
        }

        setTimeout(() => {
          this.listeners.get("message")?.({
            data: {
              ok: true,
              value: { output1: (message as { data: { marker: string } }).data.marker },
            },
          });
        }, 0);
      }
    }

    vi.stubGlobal("Blob", class FakeBlob {});
    vi.stubGlobal("Worker", FakeWorker);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:javascript-execution-test"),
      revokeObjectURL: vi.fn(),
    });

    const nonCloneableSymbol = Symbol("runtime-reference-brand");
    const data = { marker: "clone-fallback" };
    Object.defineProperty(data, nonCloneableSymbol, { enumerable: false, value: true });

    await expect(
      new JavaScriptExecutionService().execute({
        script: "return { output1: data.marker };",
        data,
        timeoutMs: 1_000,
        blockedCapabilitiesPolicy,
      }),
    ).resolves.toEqual({ value: { output1: "clone-fallback" } });

    expect(workerCount).toBe(2);
    expect(postedMessages).toHaveLength(2);
    expect((postedMessages[0] as { data: unknown }).data).toBe(data);
    expect((postedMessages[1] as { data: object }).data).not.toBe(data);
    expect(Object.getOwnPropertySymbols((postedMessages[1] as { data: object }).data)).toHaveLength(
      0,
    );
  });
});
