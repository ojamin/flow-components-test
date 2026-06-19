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
  type EventOutputBinding,
  type InputPortDefinition,
} from "@flow-builder/components/sdk";

import RendererHostPane from "../RendererHostPane.vue";

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
    bindFrom: [{ input: "label", typeId: "primitive.string" }],
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
  eventOutputs?: readonly EventOutputBinding[];
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
    eventOutputs: overrides.eventOutputs ?? [{ eventId: "submitted", outputId: "submission" }],
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

describe("RendererHostPane — Replay last event action", () => {
  test("Replay button is disabled until a valid event is captured", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    const replayBtn = wrapper.find('[data-testid="preview-controls-replay"]');
    expect(replayBtn.exists()).toBe(true);
    expect(replayBtn.attributes("disabled")).toBeDefined();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();

    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeUndefined();
  });

  test("clicking Replay projects the latest valid payload into runtimeOutputs", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();

    // Baseline: identity projection has not been applied yet.
    const baseline = JSON.parse(
      wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
    );
    expect(baseline).toEqual({});

    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    const after = JSON.parse(
      wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
    );
    expect(after).toEqual({ submission: { value: 42 } });

    const diagnostic = wrapper.find('[data-testid="renderer-host-replay-diagnostic"]');
    expect(diagnostic.exists()).toBe(true);
    expect(diagnostic.attributes("data-tone")).toBe("success");
    expect(diagnostic.text()).toContain("submitted");
    expect(diagnostic.text()).toContain("submission");

    // Visual-review remediation: the diagnostic must include the resulting
    // value/payload summary alongside the event id and output id, not just
    // the bare output name. role=status / aria-live=polite must remain so
    // the projected value is announced to assistive tech.
    expect(diagnostic.attributes("role")).toBe("status");
    expect(diagnostic.attributes("aria-live")).toBe("polite");
    const headline = wrapper.find('[data-testid="renderer-host-replay-diagnostic-headline"]');
    expect(headline.text()).toContain('event "submitted"');
    expect(headline.text()).toContain("1 output projected");
    const outputs = wrapper.find('[data-testid="renderer-host-replay-diagnostic-outputs"]');
    expect(outputs.exists()).toBe(true);
    const submissionRow = outputs.find('[data-output-id="submission"]');
    expect(submissionRow.exists()).toBe(true);
    expect(submissionRow.text().replace(/\s+/g, " ")).toContain('submission = {"value":42}');
  });

  test("Replay diagnostic shows a row per projected output for multi-binding events", async () => {
    const wrapper = mountActionPane(
      makeActionDefinition({
        eventOutputs: [
          { eventId: "submitted", outputId: "submission" },
          {
            eventId: "submitted",
            outputId: "submissionValue",
            project: (payload) => (payload as { value?: number }).value ?? null,
          },
        ],
      }),
    );
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();
    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    const headline = wrapper.find('[data-testid="renderer-host-replay-diagnostic-headline"]');
    expect(headline.text()).toContain("2 outputs projected");

    const outputs = wrapper.find('[data-testid="renderer-host-replay-diagnostic-outputs"]');
    const rows = outputs.findAll("li");
    expect(rows).toHaveLength(2);
    const submission = outputs.find('[data-output-id="submission"]');
    const submissionValue = outputs.find('[data-output-id="submissionValue"]');
    expect(submission.exists()).toBe(true);
    expect(submissionValue.exists()).toBe(true);
    expect(submission.text().replace(/\s+/g, " ")).toContain('submission = {"value":42}');
    expect(submissionValue.text().replace(/\s+/g, " ")).toContain("submissionValue = 42");
  });

  test("Replay diagnostic truncates long projected values so the banner stays readable", async () => {
    const longString = "x".repeat(500);
    const wrapper = mountActionPane(
      makeActionDefinition({
        eventOutputs: [
          {
            eventId: "submitted",
            outputId: "submission",
            project: () => longString,
          },
        ],
      }),
    );
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();
    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    const row = wrapper.find('[data-output-id="submission"]');
    expect(row.exists()).toBe(true);
    const text = row.text();
    // Truncated value ends with an ellipsis and stays well below the 500-char input.
    expect(text).toContain("…");
    expect(text.length).toBeLessThan(160);
  });

  test("Replay applies a custom project() function declared on the eventOutputs binding", async () => {
    const wrapper = mountActionPane(
      makeActionDefinition({
        eventOutputs: [
          {
            eventId: "submitted",
            outputId: "submissionValue",
            project: (payload) => (payload as { value?: number }).value ?? null,
          },
        ],
      }),
    );
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();

    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    const after = JSON.parse(
      wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
    );
    expect(after).toEqual({ submissionValue: 42 });
  });

  test("Replay surfaces a warning diagnostic when no output mapping exists for the event", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    // "noticed" is declared but has no eventOutputs binding in the default fixture.
    await wrapper.find('[data-testid="action-emit-unmapped"]').trigger("click");
    await nextTick();

    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    const diagnostic = wrapper.find('[data-testid="renderer-host-replay-diagnostic"]');
    expect(diagnostic.exists()).toBe(true);
    expect(diagnostic.attributes("data-tone")).toBe("warning");
    expect(diagnostic.text()).toContain('No output mapping declared for event "noticed"');

    // Runtime outputs untouched — no projection ran.
    const after = JSON.parse(
      wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
    );
    expect(after).toEqual({});
  });

  test("Replay surfaces an error diagnostic when the projection function throws", async () => {
    const wrapper = mountActionPane(
      makeActionDefinition({
        eventOutputs: [
          {
            eventId: "submitted",
            outputId: "submission",
            project: () => {
              throw new Error("boom");
            },
          },
        ],
      }),
    );
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();

    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    const diagnostic = wrapper.find('[data-testid="renderer-host-replay-diagnostic"]');
    expect(diagnostic.exists()).toBe(true);
    expect(diagnostic.attributes("data-tone")).toBe("error");
    expect(diagnostic.text()).toContain("Replay projection failed");
    expect(diagnostic.text()).toContain("boom");

    // Renderer remains mounted — the host never crashes on a thrown projection.
    expect(wrapper.find('[data-testid="action-renderer"]').exists()).toBe(true);

    // Runtime outputs unchanged when projection fails.
    const after = JSON.parse(
      wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
    );
    expect(after).toEqual({});
  });

  test("Replay re-uses the latest captured event when invoked multiple times", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();

    // First replay applies the projection.
    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();
    expect(
      JSON.parse(
        wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
      ),
    ).toEqual({ submission: { value: 42 } });

    // Second replay (no new events) re-applies the same projection deterministically.
    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();
    expect(
      JSON.parse(
        wrapper.find('[data-testid="action-renderer"]').attributes("data-runtime-outputs") ?? "{}",
      ),
    ).toEqual({ submission: { value: 42 } });
    expect(
      wrapper.find('[data-testid="renderer-host-replay-diagnostic"]').attributes("data-tone"),
    ).toBe("success");
  });

  test("Replay re-disables when a later invalid emit shadows a prior valid emit (closeout fix)", async () => {
    // Closeout review found that replay eligibility was tracking the newest
    // *valid* entry instead of the newest entry. After valid → invalid, the
    // host kept replay enabled and would have projected stale outputs that no
    // longer reflect the renderer's current behavior. Replay must follow the
    // actual latest captured event.
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    // The shared ActionRenderer fixture only exposes a valid + unmapped emit
    // button, so swap in a tiny inline renderer that can drive both a valid
    // and an invalid (schema-failing) emit against the same definition.
    const ShadowingRenderer = defineComponent({
      props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs", "emitEvent"],
      setup(props) {
        return () =>
          h(
            "div",
            {
              "data-testid": "shadow-renderer",
              "data-runtime-outputs": JSON.stringify(props.runtimeOutputs ?? {}),
            },
            [
              h(
                "button",
                {
                  type: "button",
                  "data-testid": "shadow-emit-valid",
                  onClick: () => props.emitEvent?.("submitted", { value: 7 }),
                },
                "emit valid",
              ),
              h(
                "button",
                {
                  type: "button",
                  "data-testid": "shadow-emit-invalid",
                  onClick: () => props.emitEvent?.("submitted", "not-an-object"),
                },
                "emit invalid",
              ),
            ],
          );
      },
    });
    await wrapper.setProps({
      definition: {
        ...(wrapper.props("definition") as ComponentDefinition),
        renderer: async () => ShadowingRenderer,
      } as never,
    });
    await flushPromises();

    // Valid emit → replay enabled.
    await wrapper.find('[data-testid="shadow-emit-valid"]').trigger("click");
    await nextTick();
    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeUndefined();

    // Invalid emit shadows the prior valid entry → replay must disable.
    await wrapper.find('[data-testid="shadow-emit-invalid"]').trigger("click");
    await nextTick();
    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeDefined();

    // Triggering the disabled action must not project stale outputs from the
    // shadowed valid entry. (The PreviewControlsBar emits replay-last-event
    // even when disabled if a click handler is invoked programmatically; the
    // host's handler must defensively reject it.)
    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();
    const stale = JSON.parse(
      wrapper.find('[data-testid="shadow-renderer"]').attributes("data-runtime-outputs") ?? "{}",
    );
    expect(stale).toEqual({});
  });

  test("Replay re-disables when a later undeclared emit shadows a prior valid emit (closeout fix)", async () => {
    // Mirrors the invalid-emit case: the latest captured event determines
    // replay eligibility, so an undeclared emit after a valid one must drop
    // the host out of replay regardless of buffer history.
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    const ShadowingUndeclaredRenderer = defineComponent({
      props: ["emitEvent"],
      setup(props) {
        return () =>
          h("div", [
            h(
              "button",
              {
                type: "button",
                "data-testid": "shadow-emit-valid-2",
                onClick: () => props.emitEvent?.("submitted", { value: 9 }),
              },
              "emit valid",
            ),
            h(
              "button",
              {
                type: "button",
                "data-testid": "shadow-emit-undeclared",
                onClick: () => props.emitEvent?.("ghost", { stray: true }),
              },
              "emit undeclared",
            ),
          ]);
      },
    });
    await wrapper.setProps({
      definition: {
        ...(wrapper.props("definition") as ComponentDefinition),
        renderer: async () => ShadowingUndeclaredRenderer,
      } as never,
    });
    await flushPromises();

    await wrapper.find('[data-testid="shadow-emit-valid-2"]').trigger("click");
    await nextTick();
    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeUndefined();

    await wrapper.find('[data-testid="shadow-emit-undeclared"]').trigger("click");
    await nextTick();
    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeDefined();
  });

  test("Replay re-enables once a fresh valid emit lands on top of an invalid one (closeout fix)", async () => {
    // The complement: after invalid → valid, replay should come back. Confirms
    // the eligibility check is on the latest entry's status, not a buffer-wide
    // property.
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    const ToggleRenderer = defineComponent({
      props: ["emitEvent"],
      setup(props) {
        return () =>
          h("div", [
            h(
              "button",
              {
                type: "button",
                "data-testid": "toggle-emit-invalid",
                onClick: () => props.emitEvent?.("submitted", "not-an-object"),
              },
              "emit invalid",
            ),
            h(
              "button",
              {
                type: "button",
                "data-testid": "toggle-emit-valid",
                onClick: () => props.emitEvent?.("submitted", { value: 1 }),
              },
              "emit valid",
            ),
          ]);
      },
    });
    await wrapper.setProps({
      definition: {
        ...(wrapper.props("definition") as ComponentDefinition),
        renderer: async () => ToggleRenderer,
      } as never,
    });
    await flushPromises();

    await wrapper.find('[data-testid="toggle-emit-invalid"]').trigger("click");
    await nextTick();
    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeDefined();

    await wrapper.find('[data-testid="toggle-emit-valid"]').trigger("click");
    await nextTick();
    expect(
      wrapper.find('[data-testid="preview-controls-replay"]').attributes("disabled"),
    ).toBeUndefined();
  });

  test("replay diagnostic clears when the selected definition changes", async () => {
    const wrapper = mountActionPane(makeActionDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="action-emit-valid"]').trigger("click");
    await nextTick();
    await wrapper.find('[data-testid="preview-controls-replay"]').trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="renderer-host-replay-diagnostic"]').exists()).toBe(true);

    await wrapper.setProps({ definition: makeActionDefinition() as never });
    await flushPromises();

    expect(wrapper.find('[data-testid="renderer-host-replay-diagnostic"]').exists()).toBe(false);
  });
});
