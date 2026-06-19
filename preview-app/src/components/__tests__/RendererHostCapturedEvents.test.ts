/**
 * Task 47.6 preview-app captured-events panel (package-local).
 *
 * Covers the contract added in docs/component-system-improvements-v1.md §1291-1311 / §1349-1350:
 *  - Renderers receive a void-returning, fire-and-forget `emitEvent(eventId, payload)` callback.
 *  - The preview-app captures each emit and surfaces it in a panel with id, payload, and
 *    validation status against the declared `events`/`payloadSchema` contract.
 *  - Valid payloads (per payloadSchema) record as "valid".
 *  - Mismatched payloads record as "invalid" and never crash the host.
 *  - Undeclared event ids record as "undeclared" and never crash the host.
 *  - The panel state resets when the selected definition changes.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { z } from "zod";

import {
  getDataTypeSchema,
  type ComponentDefinition,
  type ComponentEventDefinition,
} from "@flow-builder/components/sdk";

import RendererHostPane from "../RendererHostPane.vue";

const configSchema = z.object({});
const jsonObjectSchema = getDataTypeSchema("json-object")!;

// Renderer that exposes the injected emitEvent through buttons so test cases can
// drive valid / invalid / undeclared emits without touching component internals.
const EventfulRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs", "emitEvent"],
  setup(props) {
    return () =>
      h("div", { "data-testid": "eventful-renderer" }, [
        h(
          "button",
          {
            type: "button",
            "data-testid": "emit-valid",
            onClick: () => props.emitEvent?.("submitted", { ok: true }),
          },
          "emit valid",
        ),
        h(
          "button",
          {
            type: "button",
            "data-testid": "emit-invalid",
            onClick: () => props.emitEvent?.("submitted", "not-an-object"),
          },
          "emit invalid",
        ),
        h(
          "button",
          {
            type: "button",
            "data-testid": "emit-undeclared",
            onClick: () => props.emitEvent?.("missing", { stray: true }),
          },
          "emit undeclared",
        ),
      ]);
  },
});

const events = [
  {
    id: "submitted",
    label: "Submitted",
    payloadSchema: jsonObjectSchema,
    payloadTypeId: "json-object",
  },
] as const satisfies readonly ComponentEventDefinition[];

let definitionSeq = 0;

function makeEventfulDefinition(): ComponentDefinition<typeof configSchema> {
  // resolveFixtureData memoizes per-definition object identity in a module-level
  // WeakMap; distinct ids/objects per call keep parallel test cases independent.
  return {
    id: `test.events.${++definitionSeq}`,
    version: 1,
    displayName: "Eventful Demo",
    icon: "lucide:mouse-pointer-click",
    category: "content",
    renderable: true,
    slots: [],
    params: {},
    configSchema,
    configDefaults: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [{ id: "submission", label: "Submission", typeId: "json-object" }],
    events,
    eventOutputs: [{ eventId: "submitted", outputId: "submission" }],
    renderer: async () => EventfulRenderer,
    loadFixtureData: async () => null,
  };
}

function makeEventlessDefinition(): ComponentDefinition<typeof configSchema> {
  return {
    id: `test.eventless.${++definitionSeq}`,
    version: 1,
    displayName: "Eventless Demo",
    icon: "lucide:square",
    category: "content",
    renderable: true,
    slots: [],
    params: {},
    configSchema,
    configDefaults: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    renderer: async () => EventfulRenderer,
    loadFixtureData: async () => null,
  };
}

function mountPane(definition: ComponentDefinition | undefined) {
  return mount(RendererHostPane, {
    props: { definition: definition as never },
    attachTo: document.body,
  });
}

describe("RendererHostPane — captured events panel", () => {
  test("declared component renders the panel in an empty state and forwards emitEvent", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    const panel = wrapper.find('[data-testid="renderer-host-captured-events"]');
    expect(panel.exists()).toBe(true);
    expect(wrapper.find('[data-testid="renderer-host-captured-events-empty"]').exists()).toBe(true);
    // Header reflects the running count.
    expect(panel.find("summary").text()).toContain("Captured events (0)");
  });

  test("captures a valid emit and surfaces id + payload in the panel", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="emit-valid"]').trigger("click");
    await nextTick();

    const validEntries = wrapper.findAll('[data-testid="renderer-host-captured-event-valid"]');
    expect(validEntries).toHaveLength(1);
    const [entry] = validEntries;
    if (!entry) throw new Error("Expected one valid captured event entry");
    expect(entry.attributes("data-event-id")).toBe("submitted");
    expect(entry.find('[data-testid="renderer-host-captured-event-payload"]').text()).toContain(
      '"ok": true',
    );
    // Empty placeholder is replaced once an entry is recorded.
    expect(wrapper.find('[data-testid="renderer-host-captured-events-empty"]').exists()).toBe(
      false,
    );
  });

  test("invalid payload renders as invalid without crashing the renderer", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="emit-invalid"]').trigger("click");
    await nextTick();

    const invalidEntries = wrapper.findAll('[data-testid="renderer-host-captured-event-invalid"]');
    expect(invalidEntries).toHaveLength(1);
    const [entry] = invalidEntries;
    if (!entry) throw new Error("Expected one invalid captured event entry");
    expect(entry.attributes("data-event-id")).toBe("submitted");
    expect(entry.find('[data-testid="renderer-host-captured-event-message"]').text()).toContain(
      "Payload failed validation",
    );
    // Renderer must remain mounted — no crash, no error state.
    expect(wrapper.find('[data-testid="eventful-renderer"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="renderer-error"]').exists()).toBe(false);
  });

  test("undeclared event id renders as undeclared", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="emit-undeclared"]').trigger("click");
    await nextTick();

    const undeclaredEntries = wrapper.findAll(
      '[data-testid="renderer-host-captured-event-undeclared"]',
    );
    expect(undeclaredEntries).toHaveLength(1);
    const [entry] = undeclaredEntries;
    if (!entry) throw new Error("Expected one undeclared captured event entry");
    expect(entry.attributes("data-event-id")).toBe("missing");
    expect(entry.text()).toContain('Event "missing" is not declared');
    expect(wrapper.find('[data-testid="eventful-renderer"]').exists()).toBe(true);
  });

  test("Clear button empties the captured-events list", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="emit-valid"]').trigger("click");
    await wrapper.find('[data-testid="emit-undeclared"]').trigger("click");
    await nextTick();

    expect(wrapper.findAll("[data-event-id]")).toHaveLength(2);

    await wrapper.find('[data-testid="renderer-host-captured-events-clear"]').trigger("click");
    await nextTick();

    expect(wrapper.findAll("[data-event-id]")).toHaveLength(0);
    expect(wrapper.find('[data-testid="renderer-host-captured-events-empty"]').exists()).toBe(true);
  });

  test("entries reset when the selected definition changes", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    await wrapper.find('[data-testid="emit-valid"]').trigger("click");
    await nextTick();
    expect(wrapper.findAll("[data-event-id]")).toHaveLength(1);

    await wrapper.setProps({ definition: makeEventfulDefinition() as never });
    await flushPromises();

    expect(wrapper.findAll("[data-event-id]")).toHaveLength(0);
    expect(wrapper.find('[data-testid="renderer-host-captured-events-empty"]').exists()).toBe(true);
  });

  test("emits update:latestCapturedEvent for each capture and resets to null on definition change (Task 50.3)", async () => {
    const wrapper = mountPane(makeEventfulDefinition());
    await flushPromises();

    // Initial mount clears the buffer, which counts as a "no event" notification so
    // the parent's tracked event resets in lockstep with the panel.
    const beforeAny = wrapper.emitted("update:latestCapturedEvent");
    expect(beforeAny).toBeTruthy();
    expect(beforeAny![beforeAny!.length - 1]).toEqual([null]);

    await wrapper.find('[data-testid="emit-valid"]').trigger("click");
    await nextTick();

    const afterValid = wrapper.emitted("update:latestCapturedEvent")!;
    const [latestValid] = afterValid[afterValid.length - 1] as [Record<string, unknown>];
    expect(latestValid).toMatchObject({
      eventId: "submitted",
      status: "valid",
      payload: { ok: true },
    });

    await wrapper.find('[data-testid="emit-undeclared"]').trigger("click");
    await nextTick();

    const afterUndeclared = wrapper.emitted("update:latestCapturedEvent")!;
    const [latestUndeclared] = afterUndeclared[afterUndeclared.length - 1] as [
      Record<string, unknown>,
    ];
    expect(latestUndeclared).toMatchObject({ eventId: "missing", status: "undeclared" });

    // Switching definitions clears the buffer; parent sees a null pulse so any
    // "Replay last event" surface drops back into a disabled state.
    await wrapper.setProps({ definition: makeEventfulDefinition() as never });
    await flushPromises();

    const afterReset = wrapper.emitted("update:latestCapturedEvent")!;
    expect(afterReset[afterReset.length - 1]).toEqual([null]);
  });

  test("eventless component hides the panel until an undeclared emit is recorded", async () => {
    const wrapper = mountPane(makeEventlessDefinition());
    await flushPromises();

    // No declared events and no captured events → panel stays hidden.
    expect(wrapper.find('[data-testid="renderer-host-captured-events"]').exists()).toBe(false);

    await wrapper.find('[data-testid="emit-undeclared"]').trigger("click");
    await nextTick();

    expect(wrapper.find('[data-testid="renderer-host-captured-events"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="renderer-host-captured-event-undeclared"]')).toHaveLength(
      1,
    );
  });
});
