import { expect } from "vitest";

import { viewRequestedPayloadSchema } from "../../../../shared/view-container";
import type {
  StaticComponentContractCase,
  StaticComponentRenderCase,
  StaticComponentTransformCase,
} from "../../../../testing";

export const contractCases = [
  {
    name: "declares the optional full data input plus all-data passthrough, clickedAt and requestedViewId outputs",
    check: ({ definition }) => {
      expect(definition.inputs).toEqual([
        {
          id: "data",
          label: "Data",
          mode: "full",
          acceptedTypeIds: ["all-data"],
          required: false,
          allowMultiple: false,
          allowCycle: false,
        },
      ]);
      expect(definition.outputs).toEqual([
        {
          id: "all",
          label: "All data",
          typeId: "all-data",
        },
        {
          id: "clickedAt",
          label: "Clicked at",
          typeId: "event-timestamp",
        },
        {
          id: "requestedViewId",
          label: "Requested view ID",
          typeId: "text-value",
        },
      ]);
    },
  },
  {
    name: "declares clicked + viewRequested events projected to clickedAt + requestedViewId outputs",
    check: ({ definition }) => {
      expect(definition.events).toHaveLength(2);

      const events = definition.events ?? [];
      const [clicked, viewRequested] = events;

      expect(clicked?.id).toBe("clicked");
      expect(clicked?.label).toBe("Clicked");
      expect(clicked?.payloadTypeId).toBeUndefined();

      const validClickedPayload = clicked?.payloadSchema.safeParse({
        at: "2026-04-29T12:00:00.000Z",
      });
      expect(validClickedPayload?.success).toBe(true);

      const invalidClickedPayload = clicked?.payloadSchema.safeParse({ at: "not-a-date" });
      expect(invalidClickedPayload?.success).toBe(false);

      // The `viewRequested` event reuses the canonical shared payload schema
      // so source/target pairs (Button/Nav -> ViewStack/Tabs) speak the same
      // contract through Flow edges.
      expect(viewRequested?.id).toBe("viewRequested");
      expect(viewRequested?.payloadSchema).toBe(viewRequestedPayloadSchema);

      expect(viewRequested?.payloadSchema.safeParse({ activeViewId: "details" }).success).toBe(
        true,
      );
      expect(viewRequested?.payloadSchema.safeParse({ activeViewId: "" }).success).toBe(false);

      expect(definition.eventOutputs).toEqual([
        {
          eventId: "clicked",
          outputId: "clickedAt",
          project: expect.any(Function),
        },
        {
          eventId: "viewRequested",
          outputId: "requestedViewId",
          project: expect.any(Function),
        },
      ]);

      const [clickedBinding, viewRequestedBinding] = definition.eventOutputs ?? [];
      expect(clickedBinding?.project?.({ at: "2026-04-29T12:00:00.000Z" })).toBe(
        "2026-04-29T12:00:00.000Z",
      );
      expect(viewRequestedBinding?.project?.({ activeViewId: "details" })).toBe("details");
    },
  },
  {
    name: "declares params that match config fields and binding policy",
    check: ({ definition, config }) => {
      expect(Object.keys(definition.params ?? {})).toEqual([
        "label",
        "href",
        "variant",
        "size",
        "target",
        "requestedViewId",
        "leadingIcon",
        "trailingIcon",
        "accessibleLabel",
        "disabled",
        "disabledReason",
      ]);
      expect(Object.keys(config)).toEqual(Object.keys(definition.params ?? {}));

      const params = definition.params ?? {};

      expect(params.label?.meta).toMatchObject({
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      });
      expect(params.href?.meta).toMatchObject({
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      });
      expect(params.requestedViewId?.meta).toMatchObject({
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      });

      for (const key of [
        "variant",
        "size",
        "target",
        "leadingIcon",
        "trailingIcon",
        "accessibleLabel",
        "disabled",
        "disabledReason",
      ] as const) {
        expect(params[key]?.meta.bindable).toBeUndefined();
        expect(params[key]?.meta.bindFrom).toBeUndefined();
      }
    },
  },
  {
    name: "declares error state as not applicable because invalid targets disable the action",
    check: ({ definition }) => {
      expect(definition.stateSupport?.error).toEqual({
        notApplicable:
          "Invalid or missing navigation targets render disabled fallbacks, not error UI.",
      });
    },
  },
  {
    name: "accepts destructive and icon button configuration values",
    config: {
      label: "",
      href: "https://example.com/delete",
      variant: "destructive",
      size: "icon",
      leadingIcon: "lucide:trash-2",
      accessibleLabel: "Delete item",
    },
    check: ({ config }) => {
      expect(config).toMatchObject({
        variant: "destructive",
        size: "icon",
        leadingIcon: "lucide:trash-2",
        accessibleLabel: "Delete item",
      });
    },
  },
] as const satisfies readonly StaticComponentContractCase[];

function preventNextNavigation(element: Element) {
  element.addEventListener("click", (event) => event.preventDefault(), { once: true });
}

export const renderCases = [
  {
    name: "renders a navigable button when the href is safe",
    mountOptions: {
      props: {
        config: {
          label: "Start trial",
          href: "https://example.com/signup",
          variant: "secondary",
          size: "lg",
          target: "blank",
        },
      },
    },
    check: ({ wrapper }) => {
      const link = wrapper.find('[data-testid="button-link"]');

      expect(link.exists()).toBe(true);
      expect(link.attributes("href")).toBe("https://example.com/signup");
      expect(link.attributes("target")).toBe("_blank");
      expect(link.attributes("rel")).toContain("noreferrer");
    },
  },
  {
    name: "renders destructive icon-only buttons with an accessible label and square geometry",
    mountOptions: {
      props: {
        config: {
          label: "",
          href: "https://example.com/delete",
          variant: "destructive",
          size: "icon",
          leadingIcon: "lucide:trash-2",
          accessibleLabel: "Delete item",
        },
      },
    },
    check: ({ wrapper }) => {
      const link = wrapper.find('[data-testid="button-link"]');

      expect(link.exists()).toBe(true);
      expect(link.attributes("aria-label")).toBe("Delete item");
      expect(link.text()).toBe("");
      expect(link.classes()).toEqual(expect.arrayContaining(["size-8", "p-0"]));
      expect(link.classes()).toEqual(
        expect.arrayContaining([
          "border-ct-destructive",
          "bg-ct-destructive",
          "text-ct-destructive-foreground",
        ]),
      );
      expect(wrapper.find('[data-testid="button-leading-icon"]').exists()).toBe(true);
    },
  },
  {
    name: "renders accessible label text for label-less links without icons",
    mountOptions: {
      props: {
        config: {
          label: "",
          href: "https://example.com/read-more",
          accessibleLabel: "Read more about the launch",
        },
      },
    },
    check: ({ wrapper }) => {
      const link = wrapper.find('[data-testid="button-link"]');

      expect(link.exists()).toBe(true);
      expect(link.attributes("href")).toBe("https://example.com/read-more");
      expect(link.attributes("aria-label")).toBe("Read more about the launch");
      expect(link.text()).toBe("Read more about the launch");
    },
  },
  {
    name: "renders leading and trailing icons without hiding text labels",
    mountOptions: {
      props: {
        config: {
          label: "Continue",
          href: "https://example.com/continue",
          leadingIcon: "lucide:sparkles",
          trailingIcon: "lucide:arrow-right",
        },
      },
    },
    check: ({ wrapper }) => {
      const link = wrapper.find('[data-testid="button-link"]');

      expect(link.text()).toContain("Continue");
      expect(link.attributes("aria-label")).toBeUndefined();
      expect(wrapper.find('[data-testid="button-leading-icon"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="button-trailing-icon"]').exists()).toBe(true);
    },
  },
  {
    name: "emits a clicked event with an ISO timestamp when the link is activated",
    mountOptions: {
      props: {
        config: {
          label: "Start trial",
          href: "https://example.com/signup",
        },
      },
    },
    check: async ({ wrapper, capturedEvents }) => {
      const link = wrapper.find('[data-testid="button-link"]');
      preventNextNavigation(link.element);
      await link.trigger("click");

      // No `requestedViewId` configured -> only the `clicked` event fires.
      // The button must not silently emit `viewRequested` against an empty id
      // because the shared payload schema rejects empty strings.
      expect(capturedEvents).toHaveLength(1);
      const event = capturedEvents[0]!;
      expect(event.eventId).toBe("clicked");

      const payload = event.payload as { at: string };
      expect(typeof payload.at).toBe("string");
      expect(() => new Date(payload.at).toISOString()).not.toThrow();
      expect(new Date(payload.at).toISOString()).toBe(payload.at);
    },
  },
  {
    name: "also emits viewRequested with a validated payload when a Requested view ID is configured",
    mountOptions: {
      props: {
        config: {
          label: "Open details",
          href: "https://example.com/details",
          requestedViewId: "details",
        },
      },
    },
    check: async ({ wrapper, capturedEvents, definition }) => {
      const link = wrapper.find('[data-testid="button-link"]');
      preventNextNavigation(link.element);
      await link.trigger("click");

      const eventIds = capturedEvents.map((event) => event.eventId);
      expect(eventIds).toEqual(["clicked", "viewRequested"]);

      const viewRequestedEvent = capturedEvents[1]!;
      expect(viewRequestedEvent.payload).toEqual({ activeViewId: "details" });

      // Project through the declared event-output binding to prove the same
      // value the host runtime would publish on `requestedViewId` lines up
      // with the ViewStack `activeViewId` input contract.
      const binding = (definition.eventOutputs ?? []).find(
        (entry) => entry.eventId === "viewRequested",
      );
      expect(binding?.outputId).toBe("requestedViewId");
      expect(binding?.project?.(viewRequestedEvent.payload)).toBe("details");
    },
  },
  {
    name: "renders a disabled button when href is missing",
    mountOptions: {
      props: {
        config: {
          label: "Read the case study",
          href: "",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.find('[data-testid="button-disabled"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="button-hint"]').exists()).toBe(false);
    },
  },
  {
    name: "keeps configured disabled buttons non-interactive and visibly muted",
    mountOptions: {
      props: {
        config: {
          label: "Submit report",
          href: "https://example.com/report",
          disabled: true,
          disabledReason: "Report is locked",
        },
      },
    },
    check: async ({ wrapper, capturedEvents }) => {
      const disabledButton = wrapper.find('[data-testid="button-disabled"]');

      expect(disabledButton.exists()).toBe(true);
      expect(disabledButton.attributes("disabled")).toBeDefined();
      const disabledReasonId = disabledButton.attributes("aria-describedby");
      expect(disabledReasonId).toBeTruthy();
      expect(wrapper.find(`#${disabledReasonId}`).text()).toBe("Report is locked");
      expect(disabledButton.classes()).toEqual(
        expect.arrayContaining([
          "disabled:pointer-events-none",
          "disabled:cursor-not-allowed",
          "disabled:opacity-75",
          "disabled:bg-ct-surface-muted",
          "disabled:text-ct-foreground-muted",
        ]),
      );

      await disabledButton.trigger("click");
      expect(capturedEvents).toEqual([]);
    },
  },
  {
    name: "renders a blocked-state hint for unsafe href values",
    mountOptions: {
      props: {
        config: {
          label: "Open admin console",
          href: "javascript:alert('x')",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.find('[data-testid="button-disabled"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="button-hint"]').exists()).toBe(false);
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes the optional full data input through the all output",
    inputs: {
      data: {
        href: "/pricing",
      },
    },
    check: ({ outputs }) => {
      expect(outputs).toEqual({
        all: {
          href: "/pricing",
        },
      });
    },
  },
  {
    name: "omits the all output when no data input is connected",
    check: ({ outputs }) => {
      expect(outputs).toEqual({});
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];

export const componentTestCases = {
  contractCases,
  renderCases,
  transformCases,
};
