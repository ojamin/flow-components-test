import { describe, expect, it } from "vitest";
import { defineComponent as defineVueComponent, h } from "vue";
import { z } from "zod";

import { defineComponent, getDataTypeSchema, type ComponentDefinition } from "../public-sdk";
import {
  assertStaticComponentContract,
  describeStaticComponentRenderer,
  mountStaticComponentRenderer,
} from "../../testing/harness";

const configSchema = z.object({});
const jsonObjectSchema = getDataTypeSchema("json-object")!;

const Renderer = defineVueComponent({
  props: ["emitEvent"],
  setup(props) {
    return () =>
      h(
        "button",
        {
          type: "button",
          onClick: () => props.emitEvent("submitted", { ok: true }),
        },
        "emit",
      );
  },
});

const ConfigPanel = defineVueComponent({
  setup() {
    return () => h("div", "config");
  },
});

function createEventfulDefinition(
  overrides: Partial<ComponentDefinition> = {},
): ComponentDefinition {
  return defineComponent({
    id: "content.harness-event-test",
    version: 1,
    displayName: "Harness Event Test",
    icon: "lucide:mouse-pointer-click",
    category: "content",
    renderable: true,
    configSchema,
    configDefaults: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [{ id: "submission", label: "Submission", typeId: "json-object" }],
    events: [
      {
        id: "submitted",
        label: "Submitted",
        payloadTypeId: "json-object",
        payloadSchema: jsonObjectSchema,
      },
    ],
    eventOutputs: [{ eventId: "submitted", outputId: "submission" }],
    renderer: async () => Renderer,
    configPanel: async () => ConfigPanel,
    transform: async () => ({
      outputSchema: z.object({}),
      transform: () => ({}),
    }),
    loadFixtureData: async () => null,
    ...overrides,
    params: overrides.params ?? {},
  });
}

describe("harness event contract validation", () => {
  it("accepts canonical event declarations and event-output mappings", async () => {
    await expect(
      assertStaticComponentContract(createEventfulDefinition()),
    ).resolves.toBeUndefined();
  });

  it("rejects duplicate event ids", async () => {
    const definition = createEventfulDefinition({
      events: [
        { id: "submitted", label: "Submitted", payloadSchema: jsonObjectSchema },
        { id: "submitted", label: "Submitted again", payloadSchema: jsonObjectSchema },
      ],
    });

    await expect(assertStaticComponentContract(definition)).rejects.toThrow(
      'Duplicate event id "submitted"',
    );
  });

  it("rejects non-canonical payload schemas for payloadTypeId", async () => {
    const definition = createEventfulDefinition({
      events: [
        {
          id: "submitted",
          label: "Submitted",
          payloadTypeId: "json-object",
          payloadSchema: z.object({}),
        },
      ],
    });

    await expect(assertStaticComponentContract(definition)).rejects.toThrow(
      'Event "submitted" payloadSchema must be the canonical schema for "json-object"',
    );
  });

  it("rejects event-output references to undeclared events or outputs", async () => {
    const definition = createEventfulDefinition({
      eventOutputs: [
        { eventId: "missing", outputId: "submission" },
        { eventId: "submitted", outputId: "missing" },
      ],
    });

    await expect(assertStaticComponentContract(definition)).rejects.toThrow(
      'Event output references unknown event "missing"',
    );
    await expect(assertStaticComponentContract(definition)).rejects.toThrow(
      'references unknown output "missing"',
    );
  });

  it("requires explicit projection when identity event output types differ", async () => {
    const definition = createEventfulDefinition({
      outputs: [{ id: "submission", label: "Submission", typeId: "text-value" }],
    });

    await expect(assertStaticComponentContract(definition)).rejects.toThrow(
      'needs a project function because payload type "json-object" does not match output type "text-value"',
    );

    await expect(
      assertStaticComponentContract(
        createEventfulDefinition({
          outputs: [{ id: "submission", label: "Submission", typeId: "text-value" }],
          eventOutputs: [
            { eventId: "submitted", outputId: "submission", project: () => "submitted" },
          ],
        }),
      ),
    ).resolves.toBeUndefined();
  });

  it("requires eventOutputs to be declared when events are present", async () => {
    const definition = createEventfulDefinition({ eventOutputs: undefined });

    await expect(assertStaticComponentContract(definition)).rejects.toThrow(
      "Components with events must declare eventOutputs",
    );
  });
});

describe("harness renderer event capture", () => {
  it("captures emitted events and validates payloads", async () => {
    const wrapper = await mountStaticComponentRenderer(createEventfulDefinition());

    try {
      await wrapper.get("button").trigger("click");

      expect(wrapper.capturedEvents).toEqual([{ eventId: "submitted", payload: { ok: true } }]);
    } finally {
      wrapper.unmount();
    }
  });

  it("fails undeclared and invalid renderer emits through the injected callback", async () => {
    const undeclaredWrapper = await mountStaticComponentRenderer(createEventfulDefinition());
    const invalidWrapper = await mountStaticComponentRenderer(createEventfulDefinition());
    const undeclaredEmit = (undeclaredWrapper.props() as Record<string, unknown>).emitEvent as (
      eventId: string,
      payload: unknown,
    ) => void;
    const invalidEmit = (invalidWrapper.props() as Record<string, unknown>).emitEvent as (
      eventId: string,
      payload: unknown,
    ) => void;

    try {
      expect(() => undeclaredEmit("missing", {})).toThrow(
        'Renderer emitted undeclared event "missing"',
      );
      expect(() => invalidEmit("submitted", "bad")).toThrow(
        'Renderer emitted invalid payload for event "submitted"',
      );
    } finally {
      undeclaredWrapper.unmount();
      invalidWrapper.unmount();
    }
  });
});

describeStaticComponentRenderer(createEventfulDefinition(), [
  {
    name: "exposes captured events to render tests and requires declared event triggers",
    check: async ({ wrapper, capturedEvents }) => {
      await wrapper.get("button").trigger("click");

      expect(capturedEvents).toEqual([{ eventId: "submitted", payload: { ok: true } }]);
    },
  },
]);

describeStaticComponentRenderer(
  createEventfulDefinition({ id: "content.harness-event-aggregate" }),
  [
    {
      name: "mounts without forcing every case to emit every declared event",
      check: ({ wrapper, capturedEvents }) => {
        expect(wrapper.get("button").text()).toBe("emit");
        expect(capturedEvents).toEqual([]);
      },
    },
    {
      name: "covers declared events in any render case for the component suite",
      check: async ({ wrapper, capturedEvents }) => {
        await wrapper.get("button").trigger("click");

        expect(capturedEvents).toEqual([{ eventId: "submitted", payload: { ok: true } }]);
      },
    },
  ],
);
