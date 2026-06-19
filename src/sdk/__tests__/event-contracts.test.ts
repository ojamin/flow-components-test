import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  defineComponent,
  getDataTypeSchema,
  type ComponentEventDefinition,
  type EventOutputBinding,
  type StaticComponentRenderProps,
} from "../public-sdk";

const configSchema = z.object({});

describe("SDK event contracts", () => {
  it("exposes component event declarations and event-output bindings from the SDK", () => {
    const payloadSchema = getDataTypeSchema("json-object");
    expect(payloadSchema).toBeDefined();

    const events = [
      {
        id: "submitted",
        label: "Submitted",
        description: "Fires when the component submits a value.",
        payloadSchema: payloadSchema!,
        payloadTypeId: "json-object",
      },
    ] as const satisfies readonly ComponentEventDefinition[];

    const eventOutputs = [
      {
        eventId: "submitted",
        outputId: "submission",
      },
      {
        eventId: "submitted",
        outputId: "submissionLabel",
        project: (payload: unknown) => (typeof payload === "object" ? "submitted" : "unknown"),
      },
    ] as const satisfies readonly EventOutputBinding[];

    const definition = defineComponent({
      id: "content.eventful",
      version: 1,
      displayName: "Eventful",
      icon: "lucide:mouse-pointer-click",
      category: "content",
      renderable: true,
      configSchema,
      configDefaults: {},
      params: {},
      builder: {},
      flow: {},
      inputs: [],
      outputs: [
        { id: "submission", label: "Submission", typeId: "json-object" },
        { id: "submissionLabel", label: "Submission label", typeId: "text-value" },
      ],
      events,
      eventOutputs,
      loadFixtureData: async () => undefined,
    });

    expect(definition.events).toBe(events);
    expect(definition.eventOutputs).toBe(eventOutputs);
    expect(definition.events?.[0]?.payloadSchema).toBe(payloadSchema);
  });

  it("preserves the renderer device prop while adding synchronous emitEvent", () => {
    const emitted: Array<{ eventId: string; payload: unknown }> = [];
    const props = {
      config: { label: "Launch" },
      fixtureData: { sample: true },
      runtimeOutputs: { previous: "value" },
      updateRuntimeOutputs: () => undefined,
      device: "mobile",
      emitEvent: (eventId: string, payload: unknown) => {
        emitted.push({ eventId, payload });
      },
    } satisfies StaticComponentRenderProps<{ label: string }, { sample: boolean }>;

    const emitResult = props.emitEvent?.("submitted", { ok: true });

    expect(props.device).toBe("mobile");
    expect(emitResult).toBeUndefined();
    expect(emitted).toEqual([{ eventId: "submitted", payload: { ok: true } }]);
  });
});
