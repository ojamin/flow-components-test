/**
 * Task 43.6 preview-app param-resolution + binding stubs (package-local).
 *
 * Covers the contract added in docs/component-system-improvements-v1.md §619-622:
 *  - Renderers receive resolved literal config only — never raw paramValues.
 *  - When the selected definition declares bindable params, the host renders a small
 *    stub UI with one textarea per allowed input id.
 *  - Editing a stub feeds parsed values into resolveParamValues, and the renderer's
 *    `:config` reflects the resolved value.
 *  - Resolver and stub-parse issues surface deterministically without crashing the
 *    renderer; loading / error states from the existing host state machine are not
 *    affected.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { z } from "zod";

import {
  param,
  paramsToConfigSchema,
  type ComponentDefinition,
  type ComponentParams,
  type InputPortDefinition,
  type ParamValuesState,
} from "@flow-builder/components/sdk";

import RendererHostPane from "../RendererHostPane.vue";

// Minimal echo renderer: surfaces the received `config` as a JSON-serialised attribute
// so assertions can read the literal config the host actually passed into the slot.
const ConfigEchoRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs"],
  setup(props) {
    return () =>
      h("div", {
        "data-testid": "echo-renderer",
        "data-config": JSON.stringify(props.config ?? null),
      });
  },
});

const inputs: InputPortDefinition[] = [
  {
    id: "data",
    label: "Data",
    mode: "full",
    acceptedTypeIds: ["all-data"],
    required: false,
    allowMultiple: false,
    allowCycle: false,
  },
  {
    id: "title",
    label: "Title",
    mode: "named",
    acceptedTypeIds: ["primitive.string"],
    required: false,
    allowMultiple: false,
    allowCycle: false,
  },
];

const params = {
  title: param(z.string(), {
    label: "Title",
    control: { kind: "input" },
    bindable: true,
    bindFrom: [
      { input: "data", typeId: "primitive.string", defaultPath: "$" },
      { input: "title", typeId: "primitive.string" },
    ],
  }),
  eyebrow: param(z.string(), { label: "Eyebrow", control: { kind: "input" } }),
} satisfies ComponentParams;

const configSchema = paramsToConfigSchema(params);

let definitionSeq = 0;

function makeDefinition(): ComponentDefinition<typeof configSchema> {
  // resolveFixtureData memoizes per-definition object identity in a module-level
  // WeakMap; distinct ids/objects per call keep parallel test cases independent.
  return {
    id: `test.params.${++definitionSeq}`,
    version: 1,
    displayName: "Params Demo",
    icon: "lucide:cog",
    category: "content",
    renderable: true,
    slots: [],
    configSchema,
    configDefaults: { title: "Default", eyebrow: "Intro" },
    builder: {},
    flow: {},
    inputs,
    outputs: [],
    params,
    renderer: async () => ConfigEchoRenderer,
    loadFixtureData: async () => null,
  };
}

function mountPane(definition: ComponentDefinition | undefined) {
  return mount(RendererHostPane, {
    props: { definition: definition as never },
    attachTo: document.body,
  });
}

describe("RendererHostPane — param resolution and binding stubs", () => {
  test("renders the binding stubs section when bindable params declare compatible inputs", async () => {
    const wrapper = mountPane(makeDefinition());
    await flushPromises();

    expect(wrapper.find('[data-testid="renderer-host-param-stubs"]').exists()).toBe(true);
    // Two unique allowed inputs across all bindable params (data + title).
    expect(wrapper.find('[data-testid="renderer-host-stub-input-data"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="renderer-host-stub-input-title"]').exists()).toBe(true);
  });

  test("with no stubs entered, renderer receives configDefaults via the resolver fallback path", async () => {
    const wrapper = mountPane(makeDefinition());
    await flushPromises();

    const echo = wrapper.find('[data-testid="echo-renderer"]');
    expect(echo.exists()).toBe(true);
    const passed = JSON.parse(echo.attributes("data-config")!);
    expect(passed).toEqual({ title: "Default", eyebrow: "Intro" });
  });

  test("editing an input stub flows resolved values into the renderer's :config prop", async () => {
    const wrapper = mountPane(makeDefinition());
    await flushPromises();

    const stub = wrapper.find('[data-testid="renderer-host-stub-input-data"]');
    // Default param state binds title→data with path "$"; a JSON string at the root
    // resolves directly to the title param value.
    await stub.setValue('"Bound Title"');
    await nextTick();

    const echo = wrapper.find('[data-testid="echo-renderer"]');
    const passed = JSON.parse(echo.attributes("data-config")!);
    expect(passed.title).toBe("Bound Title");
    // Eyebrow is non-bindable; it should still come from configDefaults.
    expect(passed.eyebrow).toBe("Intro");
  });

  test("invalid JSON in a stub surfaces a parse-error diagnostic but keeps the renderer mounted", async () => {
    const wrapper = mountPane(makeDefinition());
    await flushPromises();

    // Leading "{" makes the parser try JSON; mismatched braces force a parse error.
    await wrapper.find('[data-testid="renderer-host-stub-input-data"]').setValue("{not-json");
    await nextTick();

    const issues = wrapper.find('[data-testid="renderer-host-param-issues"]');
    expect(issues.exists()).toBe(true);
    expect(issues.text()).toContain('Stub for input "data"');
    // Renderer must remain mounted with deterministic config rather than crashing.
    expect(wrapper.find('[data-testid="echo-renderer"]').exists()).toBe(true);
  });

  test("plain text stubs that start with JSON keyword words do not emit parse errors", async () => {
    const wrapper = mountPane(makeDefinition());
    await flushPromises();

    for (const stubValue of ["normal text", "true story", "false alarm", "null value"]) {
      await wrapper.find('[data-testid="renderer-host-stub-input-data"]').setValue(stubValue);
      await nextTick();

      expect(wrapper.find('[data-testid="renderer-host-param-issues"]').exists()).toBe(false);
      const echo = wrapper.find('[data-testid="echo-renderer"]');
      const passed = JSON.parse(echo.attributes("data-config")!);
      expect(passed.title).toBe(stubValue);
    }
  });

  test("emits update:paramValues with derived defaults when mounted without controlled state (Task 50.3)", async () => {
    const wrapper = mountPane(makeDefinition());
    await flushPromises();

    const emitted = wrapper.emitted("update:paramValues");
    expect(emitted).toBeTruthy();
    // First emit is the initial seed for the parent (ComponentBrowserView).
    const [seed] = emitted![0] as [Record<string, unknown>];
    expect(seed).toMatchObject({
      title: { mode: "bind", input: "data", path: "$", fallback: "Default" },
    });
    // eyebrow is non-bindable so it is omitted from the seeded state.
    expect(seed).not.toHaveProperty("eyebrow");
  });

  test("does not auto-seed bindable params without explicit default paths", async () => {
    const noDefaultPathParams = {
      title: param(z.string(), {
        label: "Title",
        control: { kind: "input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "primitive.string" }],
      }),
    } satisfies ComponentParams;
    const noDefaultPathSchema = paramsToConfigSchema(noDefaultPathParams);
    const definition: ComponentDefinition<typeof noDefaultPathSchema> = {
      ...(makeDefinition() as ComponentDefinition<typeof noDefaultPathSchema>),
      params: noDefaultPathParams,
      configSchema: noDefaultPathSchema,
      configDefaults: { title: "Default" },
    };

    const wrapper = mountPane(definition);
    await flushPromises();

    const emitted = wrapper.emitted("update:paramValues");
    expect(emitted).toBeTruthy();
    const [seed] = emitted![0] as [Record<string, unknown>];
    expect(seed).toEqual({});
  });

  test("controlled paramValues prop drives resolution and suppresses the auto-seed emit", async () => {
    // Bind title against the secondary "title" input port so the resolver picks up
    // its stub value instead of the default-source "data" port.
    const controlled: ParamValuesState = {
      title: { mode: "bind", input: "title", path: "$", fallback: "Default" },
    };
    const wrapper = mount(RendererHostPane, {
      props: {
        definition: makeDefinition() as never,
        paramValues: controlled,
      },
      attachTo: document.body,
    });
    await flushPromises();

    // Parent supplied state explicitly, so the host must not seed defaults.
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();

    await wrapper.find('[data-testid="renderer-host-stub-input-title"]').setValue('"From title"');
    await nextTick();

    const echo = wrapper.find('[data-testid="echo-renderer"]');
    const passed = JSON.parse(echo.attributes("data-config")!);
    expect(passed.title).toBe("From title");
  });

  test("definitions without params block renderer config instead of using configDefaults", async () => {
    const definition = {
      id: `test.no-params.${++definitionSeq}`,
      version: 1,
      displayName: "No Params",
      icon: "lucide:square",
      category: "content",
      renderable: true,
      slots: [],
      configSchema: z.object({ label: z.string() }),
      configDefaults: { label: "Static" },
      builder: {},
      flow: {},
      inputs: [],
      outputs: [],
      renderer: async () => ConfigEchoRenderer,
      loadFixtureData: async () => null,
    } as unknown as ComponentDefinition;

    const wrapper = mountPane(definition);
    await flushPromises();

    expect(wrapper.find('[data-testid="renderer-host-param-stubs"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="echo-renderer"]').exists()).toBe(false);
    const diagnostics = wrapper.get('[data-testid="renderer-host-param-issues"]');
    expect(diagnostics.text()).toContain("Contract failure");
    expect(diagnostics.text()).toContain("missing params");
    expect(diagnostics.text()).toContain("cannot resolve renderer config");
    const error = wrapper.get('[data-testid="renderer-error"]');
    expect(error.text()).toContain("missing params");
    expect(error.text()).toContain("cannot resolve renderer config");
  });
});
