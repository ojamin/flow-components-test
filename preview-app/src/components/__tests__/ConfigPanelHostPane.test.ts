/**
 * Task 50.4 — ConfigPanelHostPane bind-toggle and update flow.
 *
 * Covers the contract from docs/component-system-improvements-v1.md §1514-1527:
 *  - Loaded ConfigPanel renders the SchemaForm `Literal | From data` bind toggle
 *    when a definition declares bindable params with compatible inputs.
 *  - Editing a literal field flows through `update:config` (existing contract).
 *  - Switching the bind toggle to "From data" emits `update:paramValues` back
 *    to the host so the preview-app session can store bind state alongside config.
 *  - The host forwards `paramValues` into the loaded panel without interpreting it.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { z } from "zod";

import {
  param,
  paramsToConfigSchema,
  type ComponentDefinition,
  type ComponentParams,
  type InputPortDefinition,
  type ParamValuesState,
} from "@flow-builder/components/sdk";
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { DatasetDerivationService } from "@flow-builder/components/runtime-services";

import ConfigPanelHostPane from "../ConfigPanelHostPane.vue";

// Real SchemaConfigPanel wrapper so the test exercises the same SchemaForm path
// every package ConfigPanel uses (Phase 2.3 / Task 44 closeout). Using the real
// wrapper here is the contract: Task 50.4 verifies bind UI renders correctly,
// which is meaningful only against the actual SchemaForm-backed panel.
const TestConfigPanel = defineComponent({
  name: "TestConfigPanel",
  props: {
    config: { type: Object, default: () => ({}) },
    paramValues: { type: Object, default: undefined },
    fixtureData: { type: null, default: undefined },
    datasetDerivationService: { type: Object, default: undefined },
  },
  emits: ["update:config", "update:paramValues"],
  setup(props, { emit }) {
    return () =>
      h(SchemaConfigPanel, {
        title: "Test settings",
        params: testParams,
        defaults: testDefaults,
        definitionInputs: testInputs,
        config: props.config as Record<string, unknown>,
        paramValues: props.paramValues as ParamValuesState | undefined,
        fixtureData: props.fixtureData as unknown,
        datasetDerivationService: props.datasetDerivationService as
          | DatasetDerivationService
          | undefined,
        "onUpdate:config": (next: Record<string, unknown>) => emit("update:config", next),
        "onUpdate:paramValues": (next: ParamValuesState) => emit("update:paramValues", next),
      });
  },
});

const testInputs: InputPortDefinition[] = [
  {
    id: "data",
    label: "Data",
    mode: "full",
    acceptedTypeIds: ["all-data"],
    required: false,
    allowMultiple: false,
    allowCycle: false,
  },
];

const testParams = {
  title: param(z.string(), {
    label: "Title",
    control: { kind: "input" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "primitive.string" }],
  }),
  eyebrow: param(z.string(), { label: "Eyebrow", control: { kind: "input" } }),
} satisfies ComponentParams;

const testConfigSchema = paramsToConfigSchema(testParams);
const testDefaults = { title: "Default", eyebrow: "Intro" };

let definitionSeq = 0;

function makeDefinition(): ComponentDefinition<typeof testConfigSchema> {
  return {
    id: `test.config-host.${++definitionSeq}`,
    version: 1,
    displayName: "Config Host Demo",
    icon: "lucide:cog",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: testConfigSchema,
    configDefaults: testDefaults,
    builder: {},
    flow: {},
    inputs: testInputs,
    outputs: [],
    params: testParams,
    configPanel: async () => TestConfigPanel,
    loadFixtureData: async () => null,
  };
}

describe("ConfigPanelHostPane — bind toggle + update flow", () => {
  test("loads the config panel and renders the SchemaForm bind toggle for bindable params", async () => {
    const wrapper = mount(ConfigPanelHostPane, {
      props: { definition: makeDefinition() },
      attachTo: document.body,
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="config-panel-loaded"]').exists()).toBe(true);

    // SchemaForm renders a Literal | From data toggle for the bindable `title` param.
    expect(wrapper.find('[data-testid="title-bind-toggle"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="title-bind-mode-literal"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="title-bind-mode-from-data"]').exists()).toBe(true);

    // Non-bindable `eyebrow` param has no bind toggle.
    expect(wrapper.find('[data-testid="eyebrow-bind-toggle"]').exists()).toBe(false);
  });

  test("switching the bind toggle to 'From data' emits update:paramValues with bind state", async () => {
    const wrapper = mount(ConfigPanelHostPane, {
      props: { definition: makeDefinition() },
      attachTo: document.body,
    });
    await flushPromises();

    await wrapper.find('[data-testid="title-bind-mode-from-data"]').trigger("click");
    await flushPromises();

    const updates = wrapper.emitted("update:paramValues");
    expect(updates).toBeTruthy();
    expect(updates!.length).toBeGreaterThanOrEqual(1);
    const latest = updates![updates!.length - 1]![0] as ParamValuesState;
    expect(latest.title).toEqual({ mode: "bind", input: "data", path: "$" });
  });

  test("bind state passed via paramValues prop is reflected in the toggle's pressed state", async () => {
    const wrapper = mount(ConfigPanelHostPane, {
      props: {
        definition: makeDefinition(),
        paramValues: { title: { mode: "bind", input: "data", path: "$" } },
      },
      attachTo: document.body,
    });
    await flushPromises();

    const fromData = wrapper.find('[data-testid="title-bind-mode-from-data"]');
    expect(fromData.attributes("aria-pressed")).toBe("true");
    const literal = wrapper.find('[data-testid="title-bind-mode-literal"]');
    expect(literal.attributes("aria-pressed")).toBe("false");
    // Bind-mode body (source selector + path input) is rendered.
    expect(wrapper.find('[data-testid="title-bind-path"]').exists()).toBe(true);
  });

  test("editing a literal field still flows through update:config (validated)", async () => {
    const wrapper = mount(ConfigPanelHostPane, {
      props: { definition: makeDefinition() },
      attachTo: document.body,
    });
    await flushPromises();

    // `eyebrow` is non-bindable, so its plain input renders without a bind toggle.
    // Locate it via the field wrapper's data-field attribute and dispatch an input event.
    const field = wrapper.find('[data-field="eyebrow"]');
    expect(field.exists()).toBe(true);
    const input = field.find("input");
    expect(input.exists()).toBe(true);
    await input.setValue("Updated eyebrow");
    await flushPromises();

    const updates = wrapper.emitted("update:config");
    expect(updates).toBeTruthy();
    const latest = updates![updates!.length - 1]![0] as Record<string, unknown>;
    expect(latest.eyebrow).toBe("Updated eyebrow");
    // Schema-validated payload preserves untouched fields.
    expect(latest.title).toBe("Default");
    // No invalid-config diagnostic should appear for a schema-valid update.
    expect(wrapper.find('[data-testid="config-panel-invalid-config"]').exists()).toBe(false);
  });

  test("forwards the preview dataset derivation service to loaded config panels", async () => {
    const datasetDerivationService: DatasetDerivationService = {
      derive: async (request) => ({
        status: "success",
        requestId: request.requestId,
        kind: "chart-field-options",
        result: { chartFieldOptions: [] },
      }),
      clearCache: () => {},
    };
    const wrapper = mount(ConfigPanelHostPane, {
      props: { definition: makeDefinition(), datasetDerivationService },
      attachTo: document.body,
    });
    await flushPromises();

    const forwardedService = wrapper
      .findComponent(SchemaConfigPanel)
      .props("datasetDerivationService") as DatasetDerivationService;
    expect(forwardedService.derive).toBe(datasetDerivationService.derive);
    expect(forwardedService.clearCache).toBe(datasetDerivationService.clearCache);
  });

  test("loads and forwards fixture data with the preview dataset derivation service", async () => {
    const fixtureData = { rows: [{ label: "A", value: 1 }] };
    const datasetDerivationService: DatasetDerivationService = {
      derive: async (request) => ({
        status: "success",
        requestId: request.requestId,
        kind: "chart-field-options",
        result: { chartFieldOptions: [] },
      }),
      clearCache: () => {},
    };
    const definition = {
      ...makeDefinition(),
      loadFixtureData: async () => fixtureData,
    } satisfies ComponentDefinition<typeof testConfigSchema>;

    const wrapper = mount(ConfigPanelHostPane, {
      props: { definition: definition as ComponentDefinition, datasetDerivationService },
      attachTo: document.body,
    });
    await flushPromises();

    const schemaPanel = wrapper.findComponent(SchemaConfigPanel);
    expect(schemaPanel.props("fixtureData")).toStrictEqual(fixtureData);
    expect((schemaPanel.props("datasetDerivationService") as DatasetDerivationService).derive).toBe(
      datasetDerivationService.derive,
    );
  });
});
