import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  defineComponent,
  resolveComponentSlots,
  type ResolveSlotsContext,
  type ResolvedSlots,
  type SlotDefinition,
} from "../public-sdk";

const staticSlot = {
  id: "content",
  label: "Content",
  acceptsChildren: true,
  childScopeMode: "inherit",
  layoutKind: "grid",
} satisfies SlotDefinition;

const configSchema = z.object({
  includeAside: z.boolean().default(false),
});

function createDefinition(
  options: {
    resolveSlots?: (context: ResolveSlotsContext<z.output<typeof configSchema>>) => ResolvedSlots;
  } = {},
) {
  return defineComponent({
    id: "layout.dynamic-slots-test",
    version: 1,
    displayName: "Dynamic slots test",
    icon: "lucide:panel-top",
    category: "layout",
    renderable: true,
    slots: [staticSlot],
    configSchema,
    configDefaults: { includeAside: false },
    params: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    loadFixtureData: async () => undefined,
    ...options,
  });
}

describe("resolveComponentSlots", () => {
  it("uses static slots when a component has no dynamic slot resolver", () => {
    const definition = createDefinition();

    expect(resolveComponentSlots(definition)).toEqual([staticSlot]);
  });

  it("returns plain slots from a resolver using parsed config and static slots", () => {
    const asideSlot = {
      id: "aside",
      label: "Aside",
      acceptsChildren: true,
      childScopeMode: "inherit",
      layoutKind: "grid",
    } satisfies SlotDefinition;
    const definition = createDefinition({
      resolveSlots: ({ config, slots }) => ({
        slots: config.includeAside ? [...slots, asideSlot] : [...slots],
      }),
    });

    expect(resolveComponentSlots(definition, { includeAside: true })).toEqual([
      staticSlot,
      asideSlot,
    ]);
  });

  it("falls back deterministically to static slots when config is invalid", () => {
    const definition = createDefinition({
      resolveSlots: ({ slots }) => ({
        slots: [
          ...slots,
          {
            id: "unreachable",
            label: "Unreachable",
            acceptsChildren: true,
            childScopeMode: "inherit",
            layoutKind: "grid",
          },
        ],
      }),
    });

    expect(resolveComponentSlots(definition, { includeAside: "yes" } as never)).toEqual([
      staticSlot,
    ]);
  });

  it("exposes dynamic slot resolver types through the public SDK", () => {
    const resolver = (({ slots }) => ({
      slots: slots.map((slot) => ({ ...slot })),
    })) satisfies (context: ResolveSlotsContext<z.output<typeof configSchema>>) => ResolvedSlots;

    expect(createDefinition({ resolveSlots: resolver }).resolveSlots).toBe(resolver);
  });
});
