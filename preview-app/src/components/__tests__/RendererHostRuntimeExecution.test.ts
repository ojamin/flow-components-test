/**
 * Task 3 vmap1 dataset preview-host runtime execution.
 *
 * Covers the contract that components shipping a `runtime()` module have their
 * `evaluate()` invoked by RendererHostPane so renderer summaries reflect actual
 * pending → ready/error state instead of an inert {} runtimeOutputs payload.
 *
 * The synthetic-renderer cases prove the host plumbing in isolation (deferred
 * promise control, error propagation, stale-token guard). The real-definition
 * cases prove the same loading/ready/error transitions through the actual
 * vmap1.map-dataset-points renderer + runtime, with `globalThis.fetch` stubbed
 * so no live network is required.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";

import type { ComponentDefinition } from "@flow-builder/components/sdk";
import { staticComponentDefinitions } from "@flow-builder/components/catalog";

import RendererHostPane from "../RendererHostPane.vue";

const componentDefinitionPoints = staticComponentDefinitions.find(
  (candidate) => candidate.id === "vmap1.map-dataset-points",
);
if (!componentDefinitionPoints) {
  throw new Error("Expected vmap1.map-dataset-points to be registered in the public catalog.");
}
const pointsDefinition = componentDefinitionPoints;

// Renderer that mirrors runtimeOutputs.status into a stable data attribute so
// assertions can read the host-driven runtime state without coupling to any
// specific dataset renderer markup.
const RuntimeEchoRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs"],
  setup(props) {
    return () =>
      h("div", {
        "data-testid": "runtime-echo",
        "data-runtime-status": JSON.stringify(
          (props.runtimeOutputs as { status?: unknown } | undefined)?.status ?? null,
        ),
        "data-runtime-keys": Object.keys(
          (props.runtimeOutputs as Record<string, unknown> | undefined) ?? {},
        ).join(","),
      });
  },
});

let definitionSeq = 0;

interface DeferredEvaluate {
  readonly resolve: (outputs: Record<string, unknown>) => void;
  readonly reject: (reason: unknown) => void;
  readonly promise: Promise<{ outputs: Record<string, unknown> }>;
}

function createDeferredEvaluate(): DeferredEvaluate {
  let resolveFn: (value: { outputs: Record<string, unknown> }) => void = () => undefined;
  let rejectFn: (reason: unknown) => void = () => undefined;
  const promise = new Promise<{ outputs: Record<string, unknown> }>((res, rej) => {
    resolveFn = res;
    rejectFn = rej;
  });
  return {
    resolve: (outputs) => resolveFn({ outputs }),
    reject: (reason) => rejectFn(reason),
    promise,
  };
}

function makeSyntheticRuntimeDefinition(options: {
  evaluate: (context: {
    config: Record<string, unknown>;
    inputs: Record<string, unknown>;
    configValid: boolean;
    fixtureData: unknown;
    instanceId: string;
  }) => Promise<{ outputs: Record<string, unknown> }> | { outputs: Record<string, unknown> };
  runtimeLoadError?: Error;
}): ComponentDefinition {
  return {
    id: `test.runtime.${++definitionSeq}`,
    version: 1,
    displayName: "Runtime Echo",
    icon: "lucide:activity",
    category: "media",
    renderable: true,
    slots: [],
    // configSchema/configDefaults/params are intentionally minimal: empty params
    // exercise the current params-only preview contract without requiring bind
    // controls for these host-plumbing tests.
    configSchema: { safeParse: () => ({ success: true, data: {} }) } as never,
    configDefaults: {} as never,
    params: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    runtime: async () => {
      if (options.runtimeLoadError) throw options.runtimeLoadError;
      return { evaluate: options.evaluate };
    },
    renderer: async () => RuntimeEchoRenderer,
    loadFixtureData: async () => null,
  };
}

function readEchoStatus(
  html: string,
): { state?: string; message?: string; loadedAt?: string; startedAt?: string } | null {
  // Returns the parsed runtimeOutputs.status from the test attribute, or null
  // when the host has not yet pushed any status into the renderer.
  const match = html.match(/data-runtime-status="([^"]*)"/);
  if (!match) return null;
  const decoded = match[1]!.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const parsed = JSON.parse(decoded);
  return parsed === null
    ? null
    : (parsed as {
        state?: string;
        message?: string;
        loadedAt?: string;
        startedAt?: string;
      });
}

type EchoStatus = NonNullable<ReturnType<typeof readEchoStatus>>;

// The vmap1.map-dataset-points renderer + runtime live behind several lazy
// import() chains (renderer .vue compile, runtime module, fixture JSON). One
// or two flushPromises are not enough to settle them in jsdom, so we run a
// bounded loop of macrotask + microtask drains until a predicate is satisfied
// or the budget elapses. Predicate is checked between drains so we stop as
// soon as the renderer reaches the asserted state instead of spinning the
// full budget every time.
async function waitForCondition(
  predicate: () => boolean,
  options: { intervalMs?: number; maxIterations?: number } = {},
): Promise<void> {
  const intervalMs = options.intervalMs ?? 5;
  const maxIterations = options.maxIterations ?? 30;
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    if (predicate()) return;
    await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
    await flushPromises();
  }
  // Fall through; the caller's assertion will surface a clear failure
  // instead of throwing a generic timeout here.
}

async function waitForEchoStatus(
  wrapper: { html: () => string },
  predicate: (status: EchoStatus) => boolean,
): Promise<EchoStatus> {
  await waitForCondition(() => {
    const status = readEchoStatus(wrapper.html());
    return status !== null && predicate(status);
  });

  const status = readEchoStatus(wrapper.html());
  if (status === null) {
    throw new Error(`Expected runtime echo status in HTML: ${wrapper.html()}`);
  }
  return status;
}

describe("RendererHostPane — runtime execution", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("seeds a loading status with startedAt before evaluate resolves, then merges ready outputs", async () => {
    const deferred = createDeferredEvaluate();
    const def = makeSyntheticRuntimeDefinition({ evaluate: () => deferred.promise });

    const wrapper = mount(RendererHostPane, {
      props: { definition: def as never },
      attachTo: document.body,
    });

    // The seeded loading payload must carry an ISO `startedAt` so the renderer
    // sees a schema-valid VMapDatasetStatus loading variant; without it,
    // dataset renderers that re-validate the field would surface a schema
    // violation instead of a normal loading state.
    const loadingStatus = await waitForEchoStatus(wrapper, (status) => status.state === "loading");
    expect(
      loadingStatus,
      "expected the host to seed a pending status with startedAt before evaluate resolves",
    ).toEqual({
      state: "loading",
      startedAt: expect.any(String),
    });
    expect(
      Number.isNaN(Date.parse(loadingStatus?.startedAt ?? "")),
      `startedAt should parse as an ISO timestamp; got ${loadingStatus?.startedAt}`,
    ).toBe(false);

    // Now resolve the runtime evaluate with a ready payload and prove the
    // host merges it into runtimeOutputs visible to the renderer.
    deferred.resolve({
      status: { state: "ready", loadedAt: "2026-05-09T00:00:00.000Z", featureCount: 4 },
      descriptor: { id: "test", kind: "vmap1-dataset", version: 1 },
    });
    const readyStatus = await waitForEchoStatus(wrapper, (status) => status.state === "ready");
    expect(readyStatus).toMatchObject({ state: "ready", loadedAt: "2026-05-09T00:00:00.000Z" });
    expect(wrapper.attributes("data-runtime-keys") ?? wrapper.html()).toContain("descriptor");

    wrapper.unmount();
  });

  test("captures a thrown evaluate() rejection as an error status", async () => {
    const deferred = createDeferredEvaluate();
    const def = makeSyntheticRuntimeDefinition({ evaluate: () => deferred.promise });

    const wrapper = mount(RendererHostPane, {
      props: { definition: def as never },
      attachTo: document.body,
    });
    deferred.reject(new Error("boom"));

    const status = await waitForEchoStatus(
      wrapper,
      (currentStatus) => currentStatus.state === "error" && currentStatus.message === "boom",
    );
    expect(status).toEqual({ state: "error", message: "boom" });

    wrapper.unmount();
  });

  test("falls back to a synthetic error status when runtime() module load throws", async () => {
    const def = makeSyntheticRuntimeDefinition({
      evaluate: () => ({ outputs: {} }),
      runtimeLoadError: new Error("module-load-failed"),
    });

    const wrapper = mount(RendererHostPane, {
      props: { definition: def as never },
      attachTo: document.body,
    });
    const status = await waitForEchoStatus(
      wrapper,
      (currentStatus) =>
        currentStatus.state === "error" && currentStatus.message === "module-load-failed",
    );
    expect(status).toEqual({ state: "error", message: "module-load-failed" });

    wrapper.unmount();
  });

  test("passes the resolved input-stub values and configValid flag into evaluate()", async () => {
    // Capture the evaluate() context so we can assert the host wires the new
    // inputs/configValid fields through instead of hardcoded {} / true.
    const captured = vi.fn();
    const def = makeSyntheticRuntimeDefinition({
      evaluate: (context) => {
        captured(context);
        return { outputs: { status: { state: "ready", loadedAt: "2026-05-09T00:00:00.000Z" } } };
      },
    });

    const wrapper = mount(RendererHostPane, {
      props: { definition: def as never },
      attachTo: document.body,
    });
    await flushPromises();
    await nextTick();

    expect(captured).toHaveBeenCalled();
    const firstCall = captured.mock.calls[0];
    if (!firstCall) throw new Error("expected captured evaluate context");
    const context = firstCall[0] as {
      inputs: Record<string, unknown>;
      configValid: boolean;
      instanceId: string;
    };
    // Synthetic definition declares no bindable params, so inputStubParsing
    // resolves to {} — the contract is that the host forwards that map
    // verbatim instead of substituting an unconditional {}.
    expect(context.inputs).toEqual({});
    // configValid is computed from the param-resolution schemaError; the
    // synthetic definition's stub schema always succeeds so the flag is true.
    expect(context.configValid).toBe(true);
    expect(context.instanceId).toBe(`preview::${def.id}`);

    wrapper.unmount();
  });

  test("passes configValid=false through to evaluate when the resolved config fails schema validation", async () => {
    // Define a component with params + a configSchema that fails to parse so
    // useParamResolution's schemaError surfaces and configValid flips to false.
    // The runtime contract is that evaluate() is still invoked — runtimes that
    // opt into configValid (vmap1 datasets short-circuit to idle) can then
    // skip side effects safely.
    const captured = vi.fn();
    const def = makeSyntheticRuntimeDefinition({
      evaluate: (context) => {
        captured(context);
        return { outputs: { status: { state: "idle" } } };
      },
    });
    const failingSchemaDef: ComponentDefinition = {
      ...(def as ComponentDefinition),
      // Minimal params surface that triggers the resolver path. The descriptor
      // shape mirrors the `param()` factory output — `meta.bindable: false`
      // keeps useBindingInputStubs out of the picture so we can isolate the
      // configValid plumbing from the input-stub plumbing.
      params: {
        foo: {
          schema: { safeParse: () => ({ success: true, data: "ok" }) },
          meta: { bindable: false, label: "foo", control: { kind: "input" } },
        },
      } as never,
      configSchema: {
        safeParse: () => ({ success: false, error: { issues: [{ message: "bad config" }] } }),
      } as never,
    };

    const wrapper = mount(RendererHostPane, {
      props: { definition: failingSchemaDef as never },
      attachTo: document.body,
    });
    await flushPromises();
    await nextTick();

    expect(captured).toHaveBeenCalled();
    const firstCall = captured.mock.calls[0];
    if (!firstCall) throw new Error("expected captured evaluate context");
    const context = firstCall[0] as { configValid: boolean };
    expect(context.configValid).toBe(false);

    wrapper.unmount();
  });

  test("stale evaluate() promise from a previous definition cannot overwrite newer outputs", async () => {
    // First definition: evaluate stays pending so we can race a newer selection
    // against its eventual late resolution.
    const slow = createDeferredEvaluate();
    const slowDef = makeSyntheticRuntimeDefinition({ evaluate: () => slow.promise });

    // Second definition: resolves immediately with a recognizable ready payload.
    const freshDef = makeSyntheticRuntimeDefinition({
      evaluate: async () => ({
        outputs: {
          status: { state: "ready", loadedAt: "2026-05-09T00:00:01.000Z", featureCount: 9 },
        },
      }),
    });

    const wrapper = mount(RendererHostPane, {
      props: { definition: slowDef as never },
      attachTo: document.body,
    });
    const initialStatus = await waitForEchoStatus(wrapper, (status) => status.state === "loading");
    expect(initialStatus).toEqual({
      state: "loading",
      startedAt: expect.any(String),
    });

    // Switch to the fresh definition before the slow evaluate resolves; the
    // host's stale-token guard must invalidate the in-flight promise.
    await wrapper.setProps({ definition: freshDef as never });
    const afterSwap = await waitForEchoStatus(wrapper, (status) => status.state === "ready");
    expect(afterSwap).toMatchObject({ state: "ready", loadedAt: "2026-05-09T00:00:01.000Z" });

    // Now resolve the slow evaluate with a payload that would clobber the new
    // state if the stale guard were missing — and prove the visible status is
    // still the fresh definition's.
    slow.resolve({
      status: { state: "ready", loadedAt: "1999-12-31T00:00:00.000Z", featureCount: 0 },
    });
    await flushPromises();
    await nextTick();

    const finalStatus = readEchoStatus(wrapper.html());
    expect(finalStatus).toMatchObject({ state: "ready", loadedAt: "2026-05-09T00:00:01.000Z" });

    wrapper.unmount();
  });
});

describe("RendererHostPane — vmap1.map-dataset-points runtime path", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function pointsConfig(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      ...(pointsDefinition.configDefaults as Record<string, unknown>),
      sourceMode: "url",
      url: "https://example.test/points.json",
      urlFormat: "json",
      longitudeField: "lon",
      latitudeField: "lat",
      idField: "id",
      ...overrides,
    };
  }

  test("real dataset definition surfaces runtime-driven Ready status with feature count", async () => {
    // Stub global fetch with a deterministic JSON payload so the runtime can
    // resolve the dataset without touching the network. The dataset runtime
    // calls fetch(url, { signal }) and reads response.text().
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: "alpha", lon: -122.4, lat: 37.7, name: "Alpha" },
          { id: "beta", lon: -73.9, lat: 40.7, name: "Beta" },
          { id: "gamma", lon: 2.35, lat: 48.85, name: "Gamma" },
        ]),
        { status: 200, statusText: "OK" },
      ),
    );
    vi.stubGlobal("fetch", fetcher);

    const wrapper = mount(RendererHostPane, {
      props: {
        definition: pointsDefinition as never,
        config: pointsConfig() as never,
      },
      attachTo: document.body,
    });

    // Wait until the renderer reflects the runtime-driven ready state. The
    // renderer + runtime + fixture all sit behind lazy imports, so we drain
    // until the condition holds or the budget elapses.
    await waitForCondition(() => {
      const readout = wrapper.find('[data-testid="vmap1-map-dataset-points-status-readout"]');
      return readout.exists() && readout.attributes("data-status") === "ready";
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://example.test/points.json",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    const statusReadout = wrapper.find('[data-testid="vmap1-map-dataset-points-status-readout"]');
    expect(statusReadout.exists()).toBe(true);
    expect(statusReadout.attributes("data-status")).toBe("ready");
    expect(statusReadout.text()).toBe("Ready");

    const featureCount = wrapper.find(
      '[data-testid="vmap1-map-dataset-points-feature-count-readout"]',
    );
    expect(featureCount.attributes("data-empty")).toBe("false");
    expect(featureCount.text()).toBe("3");

    const lastLoaded = wrapper.find('[data-testid="vmap1-map-dataset-points-last-loaded"]');
    expect(lastLoaded.exists()).toBe(true);
    expect(lastLoaded.text()).not.toBe("—");

    wrapper.unmount();
  });

  test("real dataset definition surfaces runtime-driven Error status when fetch fails", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response("server exploded", { status: 500, statusText: "Server Error" }),
      );
    vi.stubGlobal("fetch", fetcher);

    const wrapper = mount(RendererHostPane, {
      props: {
        definition: componentDefinitionPoints as never,
        config: pointsConfig({ url: "https://example.test/missing.json" }) as never,
      },
      attachTo: document.body,
    });

    await waitForCondition(() => {
      const readout = wrapper.find('[data-testid="vmap1-map-dataset-points-status-readout"]');
      return readout.exists() && readout.attributes("data-status") === "error";
    });

    const statusReadout = wrapper.find('[data-testid="vmap1-map-dataset-points-status-readout"]');
    expect(statusReadout.exists()).toBe(true);
    expect(statusReadout.attributes("data-status")).toBe("error");
    expect(statusReadout.text()).toBe("Error");

    const message = wrapper.find('[data-testid="vmap1-map-dataset-points-status-message"]');
    expect(message.exists()).toBe(true);
    expect(message.text()).toContain("HTTP 500");

    const diagnostics = wrapper.find('[data-testid="vmap1-map-dataset-points-diagnostics"]');
    expect(diagnostics.exists()).toBe(true);
    expect(diagnostics.attributes("data-has-error")).toBe("true");

    wrapper.unmount();
  });

  test("loading status is visible after the renderer mounts but before fetch resolves", async () => {
    // Hold the fetch deferred so the runtime stays in its in-flight window
    // long enough for the assertion to observe the seeded loading payload.
    let resolveFetch: (value: Response) => void = () => undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetcher = vi.fn().mockReturnValue(fetchPromise);
    vi.stubGlobal("fetch", fetcher);

    const wrapper = mount(RendererHostPane, {
      props: {
        definition: componentDefinitionPoints as never,
        config: pointsConfig() as never,
      },
      attachTo: document.body,
    });

    // Wait until the renderer mounts (fetch is still pending so the runtime
    // status should be the seeded loading payload).
    await waitForCondition(() => {
      const readout = wrapper.find('[data-testid="vmap1-map-dataset-points-status-readout"]');
      return readout.exists() && readout.attributes("data-status") === "loading";
    });

    const statusReadout = wrapper.find('[data-testid="vmap1-map-dataset-points-status-readout"]');
    expect(statusReadout.exists()).toBe(true);
    expect(statusReadout.attributes("data-status")).toBe("loading");
    expect(statusReadout.text()).toBe("Loading…");

    // Resolve the fetch and prove the renderer transitions to the ready state.
    resolveFetch(
      new Response(JSON.stringify([{ id: "a", lon: 0, lat: 0 }]), {
        status: 200,
        statusText: "OK",
      }),
    );

    await waitForCondition(
      () =>
        wrapper
          .find('[data-testid="vmap1-map-dataset-points-status-readout"]')
          .attributes("data-status") === "ready",
    );

    expect(
      wrapper
        .find('[data-testid="vmap1-map-dataset-points-status-readout"]')
        .attributes("data-status"),
    ).toBe("ready");

    wrapper.unmount();
  });
});
