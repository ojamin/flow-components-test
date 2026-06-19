/**
 * Task 38.7 preview-control integration tests (package-local).
 *
 * Covers the two blocking review items that need new tests:
 *  1. Device control — clicking device buttons changes data-device attribute and
 *     frame classes on the preview frame (separate from viewport width).
 *  2. Loading stateMode — shows state-loading-preview instead of renderer output.
 *  3. Error stateMode — shows state-error-preview instead of renderer output.
 *
 * Kept in a separate file to avoid growing the oversized root spec.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { z } from "zod";

import {
  getDataTypeSchema,
  param,
  paramsToConfigSchema,
  type ComponentDefinition,
  type ComponentEventDefinition,
  type ComponentParams,
  type InputPortDefinition,
} from "@flow-builder/components/sdk";

import RendererHostPane from "../RendererHostPane.vue";

// ── Shared helpers ────────────────────────────────────────────────────────────

const StubRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs", "renderMode"],
  setup(props) {
    return () =>
      h("div", {
        "data-testid": "stub-renderer",
        "data-config": JSON.stringify(props.config ?? null),
        "data-fixture": JSON.stringify(props.fixtureData ?? null),
        "data-render-mode": props.renderMode,
      });
  },
});

// Minimal stand-in shape — fixture data resolves through the SDK contract
// (definition.loadFixtureData) which the host now awaits via resolveFixtureData.
type MinimalDefinition = {
  id?: string;
  renderable: boolean;
  renderer?: () => Promise<unknown>;
  params?: ComponentParams;
  configSchema?: z.ZodTypeAny;
  configDefaults?: Record<string, unknown>;
  loadFixtureData: () => Promise<unknown>;
};

let definitionSeq = 0;

function makeRenderableDef(overrides: Partial<MinimalDefinition> = {}): MinimalDefinition {
  // resolveFixtureData memoizes per-definition object identity in a module-level
  // WeakMap. Distinct ids/objects per call keep parallel test cases independent.
  return {
    id: `test.component.${++definitionSeq}`,
    renderable: true,
    renderer: async () => StubRenderer,
    params: {},
    configSchema: z.object({ label: z.string().optional() }),
    configDefaults: { label: "TestButton" },
    loadFixtureData: async () => ({ sample: "data" }),
    ...overrides,
  };
}

function mountPane(definition: MinimalDefinition | undefined) {
  return mount(RendererHostPane, {
    props: { definition: definition as never },
    attachTo: document.body,
  });
}

/** Find a button in RendererHostPane by its visible text label. */
function findButton(wrapper: ReturnType<typeof mountPane>, label: string) {
  return wrapper.findAll("button").find((b) => b.text() === label);
}

// ── Device control: data-device attribute and frame classes ───────────────────

describe("RendererHostPane — device control", () => {
  test("Device group is present in the toolbar", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();
    const deviceGroup = wrapper.find('[aria-label="Device"]');
    expect(deviceGroup.exists()).toBe(true);
    const buttons = deviceGroup.findAll("button");
    expect(buttons.map((b) => b.text())).toEqual(["Responsive", "Phone", "Tablet"]);
  });

  test("preview frame has data-device=responsive by default", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();
    const frame = wrapper.find('[data-testid="preview-frame"]');
    expect(frame.attributes("data-device")).toBe("responsive");
  });

  test("clicking Phone sets data-device=phone on the preview frame", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Phone")!.trigger("click");
    await nextTick();

    const frame = wrapper.find('[data-testid="preview-frame"]');
    expect(frame.attributes("data-device")).toBe("phone");
  });

  test("clicking Tablet (device) sets data-device=tablet on the preview frame", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    // Use the Device group explicitly to avoid ambiguity with the Viewport "Tablet" button.
    const deviceGroup = wrapper.find('[aria-label="Device"]');
    const tabletBtn = deviceGroup.findAll("button").find((b) => b.text() === "Tablet");
    await tabletBtn!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="preview-frame"]').attributes("data-device")).toBe("tablet");
  });

  test("clicking Phone adds ring-1 class to the preview frame", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    const deviceGroup = wrapper.find('[aria-label="Device"]');
    const phoneBtn = deviceGroup.findAll("button").find((b) => b.text() === "Phone");
    await phoneBtn!.trigger("click");
    await nextTick();

    const frame = wrapper.find('[data-testid="preview-frame"]');
    expect(frame.classes()).toContain("ring-1");
    expect(frame.classes()).toContain("rounded-xl");
  });

  test("clicking Responsive removes ring classes added by Phone", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    const deviceGroup = wrapper.find('[aria-label="Device"]');
    const phoneBtn = deviceGroup.findAll("button").find((b) => b.text() === "Phone");
    await phoneBtn!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="preview-frame"]').classes()).toContain("ring-1");

    const responsiveBtn = deviceGroup.findAll("button").find((b) => b.text() === "Responsive");
    await responsiveBtn!.trigger("click");
    await nextTick();

    const frame = wrapper.find('[data-testid="preview-frame"]');
    expect(frame.classes()).not.toContain("ring-1");
    expect(frame.attributes("data-device")).toBe("responsive");
  });

  test("device and viewport are independent: selecting Phone device with Desktop viewport keeps w-full", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    const deviceGroup = wrapper.find('[aria-label="Device"]');
    const phoneBtn = deviceGroup.findAll("button").find((b) => b.text() === "Phone");
    await phoneBtn!.trigger("click");
    await nextTick();

    const frame = wrapper.find('[data-testid="preview-frame"]');
    // Viewport still desktop (w-full), device adds ring classes.
    expect(frame.classes()).toContain("w-full");
    expect(frame.classes()).toContain("ring-1");
  });

  test("loaded preview frame is positioned and forwards authoring renderMode", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    const loaded = wrapper.find('[data-testid="renderer-loaded"]');
    expect(loaded.classes()).toContain("relative");
    expect(wrapper.find('[data-testid="stub-renderer"]').attributes("data-render-mode")).toBe(
      "authoring",
    );
  });
});

// ── Loading stateMode: replaces renderer output ───────────────────────────────

describe("RendererHostPane — loading stateMode replaces renderer output", () => {
  test("clicking Loading shows state-loading-preview", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Loading")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="state-loading-preview"]').exists()).toBe(true);
  });

  test("clicking Loading hides the renderer-loaded output", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    // Baseline: renderer is visible.
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);

    await findButton(wrapper, "Loading")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(false);
  });

  test("clicking Loading hides the stub renderer component", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Loading")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="stub-renderer"]').exists()).toBe(false);
  });

  test("state-loading-preview has role=status", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Loading")!.trigger("click");
    await nextTick();

    const frame = wrapper.find('[data-testid="state-loading-preview"]');
    expect(frame.attributes("role")).toBe("status");
  });

  test("switching from Loading back to Default restores renderer-loaded", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Loading")!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(false);

    await findButton(wrapper, "Default")!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);
  });
});

// ── Error stateMode: replaces renderer output ─────────────────────────────────

describe("RendererHostPane — error stateMode replaces renderer output", () => {
  test("clicking Error shows state-error-preview", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="state-error-preview"]').exists()).toBe(true);
  });

  test("clicking Error hides the renderer-loaded output", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(false);
  });

  test("clicking Error hides the stub renderer component", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="stub-renderer"]').exists()).toBe(false);
  });

  test("state-error-preview has role=alert", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();

    const frame = wrapper.find('[data-testid="state-error-preview"]');
    expect(frame.attributes("role")).toBe("alert");
  });

  test("state-error-preview contains 'Simulated error state' heading", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="state-error-preview"]').text()).toContain(
      "Simulated error state",
    );
  });

  test("switching from Error back to Default restores renderer-loaded", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(false);

    await findButton(wrapper, "Default")!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);
  });

  test("state-error-preview and state-loading-preview are mutually exclusive", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    await findButton(wrapper, "Error")!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="state-error-preview"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="state-loading-preview"]').exists()).toBe(false);

    await findButton(wrapper, "Loading")!.trigger("click");
    await nextTick();
    expect(wrapper.find('[data-testid="state-loading-preview"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="state-error-preview"]').exists()).toBe(false);
  });
});

// ── Fixture data lifecycle ────────────────────────────────────────────────────
// Covers the migration to resolveFixtureData(definition): the host must show a
// loading placeholder while the loader is pending, surface a deterministic error
// state when the loader rejects, and forward the resolved value to the renderer.

describe("RendererHostPane — fixture data lifecycle", () => {
  test("fixture-loading is shown while loadFixtureData is pending and clears once it resolves", async () => {
    let resolveFixture: (value: unknown) => void = () => {};
    const fixturePromise = new Promise((resolve) => {
      resolveFixture = resolve;
    });
    const def = makeRenderableDef({
      loadFixtureData: () => fixturePromise,
    });

    const wrapper = mountPane(def);
    // Allow the renderer module to resolve first so we are observing the
    // fixture-loading branch specifically (not renderer-loading).
    await nextTick();
    await nextTick();

    expect(wrapper.find('[data-testid="fixture-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(false);

    resolveFixture({ sample: "data" });
    await flushPromises();

    expect(wrapper.find('[data-testid="fixture-loading"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);
  });

  test("fixture-error is shown when loadFixtureData rejects and includes the component id", async () => {
    const def = makeRenderableDef({
      id: "test.fixture.failure",
      loadFixtureData: async () => {
        throw new Error("disk on fire");
      },
    });

    const wrapper = mountPane(def);
    await flushPromises();

    const errorEl = wrapper.find('[data-testid="fixture-error"]');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.attributes("role")).toBe("alert");
    // resolveFixtureData wraps the underlying error message with the component id,
    // so the surfaced text should include both signals.
    expect(errorEl.text()).toContain("test.fixture.failure");
    expect(errorEl.text()).toContain("disk on fire");
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(false);
  });

  test("resolved fixture data is forwarded to the renderer's fixtureData prop", async () => {
    const def = makeRenderableDef({
      loadFixtureData: async () => ({ sample: "resolved-fixture" }),
    });

    const wrapper = mountPane(def);
    await flushPromises();

    const stub = wrapper.find('[data-testid="stub-renderer"]');
    expect(stub.exists()).toBe(true);
    expect(stub.attributes("data-fixture")).toBe(JSON.stringify({ sample: "resolved-fixture" }));
  });
});

// ── Reset bind state + Replay last event (Task 50.6) ──────────────────────────
// Specialised fixtures: a renderer that exposes runtimeOutputs and emitEvent so
// tests can drive replay end-to-end and observe projected values, and a definition
// builder with bindable params + declared events + eventOutputs mappings.

const jsonObjectSchema = getDataTypeSchema("json-object")!;

const ActionRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs", "emitEvent"],
  setup(props) {
    return () =>
      h(
        "div",
        {
          "data-testid": "action-renderer",
          "data-config": JSON.stringify(props.config ?? null),
          "data-runtime-outputs": JSON.stringify(props.runtimeOutputs ?? {}),
        },
        [
          h(
            "button",
            {
              type: "button",
              "data-testid": "action-emit-valid",
              onClick: () => props.emitEvent?.("submitted", { value: 42 }),
            },
            "emit valid",
          ),
          h(
            "button",
            {
              type: "button",
              "data-testid": "action-emit-unmapped",
              onClick: () => props.emitEvent?.("noticed", { hover: true }),
            },
            "emit unmapped",
          ),
        ],
      );
  },
});

const actionInputs: InputPortDefinition[] = [
  {
    id: "label",
    label: "Label",
    mode: "named",
    acceptedTypeIds: ["primitive.string"],
    required: false,
    allowMultiple: false,
    allowCycle: false,
  },
];

const actionParams = {
  label: param(z.string(), {
    label: "Label",
    control: { kind: "input" },
    bindable: true,
    bindFrom: [{ input: "label", typeId: "primitive.string", defaultPath: "$" }],
  }),
} satisfies ComponentParams;

const actionConfigSchema = paramsToConfigSchema(actionParams);

const actionEvents = [
  {
    id: "submitted",
    label: "Submitted",
    payloadSchema: jsonObjectSchema,
    payloadTypeId: "json-object",
  },
  {
    id: "noticed",
    label: "Noticed",
    payloadSchema: jsonObjectSchema,
    payloadTypeId: "json-object",
  },
] as const satisfies readonly ComponentEventDefinition[];

let actionDefinitionSeq = 0;

interface ActionDefinitionOverrides {
  params?: ComponentParams;
  inputs?: InputPortDefinition[];
}

function makeActionDefinition(
  overrides: ActionDefinitionOverrides = {},
): ComponentDefinition<typeof actionConfigSchema> {
  return {
    id: `test.actions.${++actionDefinitionSeq}`,
    version: 1,
    displayName: "Action Demo",
    icon: "lucide:play",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: actionConfigSchema,
    configDefaults: { label: "Hello" },
    builder: {},
    flow: {},
    inputs: overrides.inputs ?? actionInputs,
    outputs: [
      { id: "submission", label: "Submission", typeId: "json-object" },
      { id: "submissionValue", label: "Value", typeId: "json-object" },
    ],
    events: actionEvents,
    eventOutputs: [{ eventId: "submitted", outputId: "submission" }],
    params: overrides.params ?? actionParams,
    renderer: async () => ActionRenderer,
    loadFixtureData: async () => null,
  };
}

function mountActionPane(definition: ComponentDefinition | undefined) {
  return mount(RendererHostPane, {
    props: { definition: definition as never },
    attachTo: document.body,
  });
}

describe("RendererHostPane — Reset bind state action", () => {
  test("Reset button is enabled when the definition declares bindable params", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    const btn = wrapper.find('[data-testid="preview-controls-reset"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("disabled")).toBeUndefined();
  });

  test("Reset button is disabled when no bindable params are declared", async () => {
    // Pass an empty params object so derivedDefaultParamValues evaluates to {}.
    const wrapper = mountActionPane(makeActionDefinition({ params: {}, inputs: [] }));
    await flushPromises();

    const btn = wrapper.find('[data-testid="preview-controls-reset"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("disabled")).toBeDefined();
  });

  test("clicking Reset emits update:paramValues with cleared bind state ({})", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    const initial = wrapper.emitted("update:paramValues") ?? [];
    expect(initial.length).toBeGreaterThan(0);
    const seedingEmits = initial.length;
    const seeded = initial[initial.length - 1]![0];
    expect(seeded).toMatchObject({ label: { mode: "bind", input: "label", path: "$" } });

    await wrapper.find('[data-testid="preview-controls-reset"]').trigger("click");
    await nextTick();

    const afterReset = wrapper.emitted("update:paramValues")!;
    expect(afterReset.length).toBeGreaterThan(seedingEmits);
    const cleared = afterReset[afterReset.length - 1]![0];
    expect(cleared).toEqual({});
  });

  test("after Reset clears bind state, the renderer falls back to configDefaults via the resolver", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    // Drive an explicit non-default bind value so we can prove Reset reverts it.
    await wrapper.find('[data-testid="renderer-host-stub-input-label"]').setValue('"Bound"');
    await nextTick();
    expect(
      JSON.parse(wrapper.find('[data-testid="action-renderer"]').attributes("data-config") ?? "{}"),
    ).toMatchObject({ label: "Bound" });

    // Mirror the parent contract: ComponentBrowserView updates currentParamValues
    // off the host's update:paramValues emission, so the test must too.
    const sync = async () => {
      const emits = wrapper.emitted("update:paramValues");
      if (!emits) return;
      const [latest] = emits[emits.length - 1] as [unknown];
      await wrapper.setProps({ paramValues: latest as never });
      await nextTick();
    };
    await sync();

    await wrapper.find('[data-testid="preview-controls-reset"]').trigger("click");
    await nextTick();
    await sync();

    // With paramValues cleared to {}, the bindable param has no bind entry, so
    // the resolver falls back to the configDefaults value rather than the
    // textarea-driven bound value.
    const resolved = JSON.parse(
      wrapper.find('[data-testid="action-renderer"]').attributes("data-config") ?? "{}",
    );
    expect(resolved.label).toBe("Hello");
  });
});
