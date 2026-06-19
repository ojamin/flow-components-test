import { mount, type MountingOptions, type VueWrapper } from "@vue/test-utils";
import { afterAll, describe, expect, test } from "vitest";
import type { Component as VueComponent } from "vue";
import type { ZodTypeAny } from "zod";

import {
  getDataTypeDefinition,
  getDataTypeSchema,
  resolveFixtureData,
} from "@flow-builder/components/sdk";
import type {
  ComponentDefinition,
  ComponentEventDefinition,
  ParamValuesState,
  StaticComponentTransformContext,
  StaticComponentTransformModule,
} from "../sdk/public-sdk";
import {
  assertNoRawConfigStateProps,
  collectParamContractIssues,
  parseComponentConfig,
  resolveComponentConfig,
  type StaticComponentResolutionOptions,
} from "./config-resolution";

type MaybePromise<TValue> = TValue | Promise<TValue>;
type StaticComponentDefinition = ComponentDefinition<any>;

export interface StaticComponentContractCase {
  name: string;
  config?: Record<string, unknown>;
  check?: (context: StaticComponentContractCaseContext) => MaybePromise<void>;
}

export interface StaticComponentContractCaseContext {
  definition: StaticComponentDefinition;
  config: Record<string, unknown>;
}

export interface StaticComponentRenderCase {
  name: string;
  timeout?: number;
  paramValues?: ParamValuesState;
  inputs?: Record<string, unknown>;
  mountOptions?: StaticComponentMountOptions;
  check?: (context: StaticComponentRenderCaseContext) => MaybePromise<void>;
}

export interface StaticComponentRenderCaseContext {
  definition: StaticComponentDefinition;
  config: Record<string, unknown>;
  wrapper: VueWrapper;
  capturedEvents: CapturedComponentEvent[];
}

export interface CapturedComponentEvent {
  eventId: string;
  payload: unknown;
}

export type StaticComponentRendererWrapper = VueWrapper & {
  capturedEvents: CapturedComponentEvent[];
  resolvedConfig: Record<string, unknown>;
};

export interface StaticComponentTransformCase {
  name: string;
  config?: Record<string, unknown>;
  paramValues?: ParamValuesState;
  inputs?: Record<string, unknown>;
  check?: (context: StaticComponentTransformCaseContext) => MaybePromise<void>;
}

export interface StaticComponentTransformCaseContext {
  definition: StaticComponentDefinition;
  config: Record<string, unknown>;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  context: StaticComponentTransformContext<Record<string, unknown>>;
}

export interface StaticComponentMountOptions {
  props?: Record<string, unknown>;
  slots?: MountingOptions<unknown>["slots"];
}

interface LoadedStaticComponentModules {
  renderer: VueComponent;
  configPanel: VueComponent;
  transformModule: StaticComponentTransformModule;
}

export function describeStaticComponentContract(
  definition: StaticComponentDefinition,
  cases: readonly StaticComponentContractCase[] = [],
) {
  describe(`${definition.id} contract`, () => {
    test(
      "exposes a valid static component manifest and lazy modules",
      { timeout: 60_000 },
      async () => {
        await assertStaticComponentContract(definition);

        const modules = await loadStaticComponentModules(definition);
        expect(modules.renderer).toBeTruthy();
        expect(modules.configPanel).toBeTruthy();
        expect(modules.transformModule.outputSchema).toBeTruthy();
        expect(typeof modules.transformModule.transform).toBe("function");

        const configPanelWrapper = await mountStaticComponentConfigPanel(definition);
        expect(configPanelWrapper.html()).not.toBe("");
        configPanelWrapper.unmount();
      },
    );

    for (const contractCase of cases) {
      test(contractCase.name, async () => {
        const config = parseComponentConfig(definition, contractCase.config);

        await assertStaticComponentContract(definition, config);
        await contractCase.check?.({ definition, config });
      });
    }
  });
}

export function describeStaticComponentRenderer(
  definition: StaticComponentDefinition,
  cases: readonly StaticComponentRenderCase[] = [],
) {
  const resolvedCases = cases.length > 0 ? cases : [{ name: "mounts with fixture data" }];

  describe(`${definition.id} renderer`, () => {
    const capturedEventIds = new Set<string>();

    for (const renderCase of resolvedCases) {
      const runRenderCase = async () => {
        const wrapper = await mountStaticComponentRenderer(definition, renderCase.mountOptions, {
          inputs: renderCase.inputs,
          paramValues: renderCase.paramValues,
        });

        try {
          expect(wrapper.html()).not.toBe("");
          await renderCase.check?.({
            definition,
            config: wrapper.resolvedConfig,
            wrapper,
            capturedEvents: wrapper.capturedEvents,
          });
          for (const event of wrapper.capturedEvents) {
            capturedEventIds.add(event.eventId);
          }
        } finally {
          wrapper.unmount();
        }
      };

      test(renderCase.name, { timeout: renderCase.timeout ?? 60_000 }, runRenderCase);
    }

    afterAll(() => {
      assertDeclaredEventsWereCovered(definition, capturedEventIds);
    });
  });
}

export function describeStaticComponentTransform(
  definition: StaticComponentDefinition,
  cases: readonly StaticComponentTransformCase[] = [],
) {
  const resolvedCases =
    cases.length > 0 ? cases : [{ name: "validates default transform outputs" }];

  describe(`${definition.id} transform`, () => {
    for (const transformCase of resolvedCases) {
      test(transformCase.name, { timeout: 30_000 }, async () => {
        const context = await executeStaticTransformCase(definition, transformCase);

        await transformCase.check?.(context);
      });
    }
  });
}

export async function loadStaticComponentModules(
  definition: StaticComponentDefinition,
): Promise<LoadedStaticComponentModules> {
  await assertStaticComponentContract(definition);

  return {
    renderer: resolveVueComponent(await definition.renderer!(), "renderer"),
    configPanel: resolveVueComponent(await definition.configPanel!(), "configPanel"),
    transformModule: resolveTransformModule(await definition.transform!()),
  };
}

export async function mountStaticComponentRenderer(
  definition: StaticComponentDefinition,
  options: StaticComponentMountOptions = {},
  resolutionOptions: StaticComponentResolutionOptions = {},
): Promise<StaticComponentRendererWrapper> {
  const rawProps = options.props ?? {};
  assertNoRawConfigStateProps(rawProps, "renderer");
  const { renderer } = await loadStaticComponentModules(definition);
  const fixtureData = await resolveFixtureData(definition);
  const inputValues = resolutionOptions.inputs ?? { data: rawProps.fixtureData ?? fixtureData };
  const config = resolveComponentConfig(definition, rawProps.config, {
    inputs: inputValues,
    paramValues: resolutionOptions.paramValues,
  });
  const capturedEvents: CapturedComponentEvent[] = [];
  const emitEvent = createHarnessEmitEvent(definition, capturedEvents);

  const wrapper = mount(renderer, {
    props: {
      ...rawProps,
      config,
      fixtureData: rawProps.fixtureData ?? fixtureData,
      emitEvent,
    },
    slots: options.slots,
  }) as StaticComponentRendererWrapper;
  wrapper.capturedEvents = capturedEvents;
  wrapper.resolvedConfig = config;
  return wrapper;
}

export async function mountStaticComponentConfigPanel(
  definition: StaticComponentDefinition,
  options: StaticComponentMountOptions = {},
) {
  const rawProps = options.props ?? {};
  const config = parseComponentConfig(definition, rawProps.config);
  const { configPanel } = await loadStaticComponentModules(definition);
  const fixtureData = await resolveFixtureData(definition);

  return mount(configPanel, {
    props: {
      ...rawProps,
      config,
      fixtureData: rawProps.fixtureData ?? fixtureData,
    },
    slots: options.slots,
  });
}

export async function executeStaticTransformCase(
  definition: StaticComponentDefinition,
  transformCase: StaticComponentTransformCase,
) {
  const config = resolveComponentConfig(definition, transformCase.config, {
    inputs: transformCase.inputs ?? {},
    paramValues: transformCase.paramValues,
  });
  const { transformModule } = await loadStaticComponentModules(definition);
  const fixtureData = await resolveFixtureData(definition);
  const context: StaticComponentTransformContext<Record<string, unknown>> = {
    config,
    fixtureData,
    inputs: { ...transformCase.inputs },
  };
  const rawOutputs = await transformModule.transform(context);

  validateTransformOutputSchema(transformModule.outputSchema, rawOutputs);

  return {
    definition,
    config,
    inputs: context.inputs,
    outputs: validateComponentOutputs(definition, rawOutputs),
    context,
  } satisfies StaticComponentTransformCaseContext;
}

export async function assertStaticComponentContract(
  definition: StaticComponentDefinition,
  config: Record<string, unknown> = definition.configDefaults,
) {
  const issues: string[] = [];

  if (typeof definition.loadFixtureData !== "function") {
    issues.push("loadFixtureData loader is missing");
  } else {
    try {
      const fixtureData = await resolveFixtureData(definition);
      if (fixtureData === undefined) issues.push("loadFixtureData resolved to undefined");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      issues.push(`loadFixtureData failed: ${message}`);
    }
  }
  if (!definition.renderer) issues.push("renderer loader is missing");
  if (!definition.configPanel) issues.push("configPanel loader is missing");
  if (!definition.transform) issues.push("transform loader is missing");
  if (!definition.configSchema.safeParse(config).success) issues.push("config is invalid");

  collectDuplicateIdIssues(
    definition.inputs.map((input) => input.id),
    "input",
    issues,
  );
  collectDuplicateIdIssues(
    definition.outputs.map((output) => output.id),
    "output",
    issues,
  );
  collectEventContractIssues(definition, issues);

  for (const input of definition.inputs) {
    for (const typeId of input.acceptedTypeIds) {
      if (!getDataTypeDefinition(typeId)) issues.push(`Unknown input data type "${typeId}"`);
    }
  }

  for (const output of definition.outputs) {
    if (!getDataTypeDefinition(output.typeId))
      issues.push(`Unknown output data type "${output.typeId}"`);
  }

  collectParamContractIssues(definition, config, issues);

  if (issues.length > 0) {
    throw new Error(issues.join("\n"));
  }
}

function collectEventContractIssues(definition: StaticComponentDefinition, issues: string[]) {
  const events = definition.events ?? [];
  const eventOutputs = definition.eventOutputs ?? [];

  collectDuplicateIdIssues(
    events.map((event) => event.id),
    "event",
    issues,
  );

  if (events.length > 0 && !definition.eventOutputs) {
    issues.push("Components with events must declare eventOutputs; use [] for capture-only events");
  }

  const eventsById = new Map(events.map((event) => [event.id, event]));
  const outputsById = new Map(definition.outputs.map((output) => [output.id, output]));

  for (const event of events) {
    collectEventPayloadSchemaIssues(event, issues);
  }

  for (const binding of eventOutputs) {
    const event = eventsById.get(binding.eventId);
    const output = outputsById.get(binding.outputId);

    if (!event) {
      issues.push(`Event output references unknown event "${binding.eventId}"`);
      continue;
    }

    if (!output) {
      issues.push(
        `Event output for event "${binding.eventId}" references unknown output "${binding.outputId}"`,
      );
      continue;
    }

    if (!binding.project) {
      if (!event.payloadTypeId) {
        issues.push(
          `Event output "${binding.eventId}" -> "${binding.outputId}" requires payloadTypeId for identity mapping`,
        );
        continue;
      }

      const payloadSchema = getDataTypeSchema(event.payloadTypeId);
      const outputSchema = getDataTypeSchema(output.typeId);
      if (event.payloadTypeId !== output.typeId && payloadSchema !== outputSchema) {
        issues.push(
          `Event output "${binding.eventId}" -> "${binding.outputId}" needs a project function because payload type "${event.payloadTypeId}" does not match output type "${output.typeId}"`,
        );
      }
    }
  }
}

function collectEventPayloadSchemaIssues(event: ComponentEventDefinition, issues: string[]) {
  if (!event.payloadTypeId) return;

  const schema = getDataTypeSchema(event.payloadTypeId);
  if (!schema) {
    issues.push(
      `Event "${event.id}" references unknown payload data type "${event.payloadTypeId}"`,
    );
    return;
  }

  if (event.payloadSchema !== schema) {
    issues.push(
      `Event "${event.id}" payloadSchema must be the canonical schema for "${event.payloadTypeId}"`,
    );
  }
}

function createHarnessEmitEvent(
  definition: StaticComponentDefinition,
  capturedEvents: CapturedComponentEvent[],
) {
  const eventsById = new Map((definition.events ?? []).map((event) => [event.id, event]));

  return (eventId: string, payload: unknown) => {
    const event = eventsById.get(eventId);
    if (!event) {
      throw new Error(`Renderer emitted undeclared event "${eventId}" for ${definition.id}`);
    }

    const result = event.payloadSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(
        `Renderer emitted invalid payload for event "${eventId}". ${result.error.message}`,
      );
    }

    capturedEvents.push({ eventId, payload: result.data });
  };
}

function assertDeclaredEventsWereCovered(
  definition: StaticComponentDefinition,
  capturedEventIds: ReadonlySet<string>,
) {
  const declaredEventIds = new Set((definition.events ?? []).map((event) => event.id));
  if (declaredEventIds.size === 0) return;

  for (const eventId of capturedEventIds) {
    declaredEventIds.delete(eventId);
  }

  if (declaredEventIds.size > 0) {
    throw new Error(
      `Renderer test did not capture declared event(s): ${Array.from(declaredEventIds).join(", ")}`,
    );
  }
}

function collectDuplicateIdIssues(ids: readonly string[], kind: string, issues: string[]) {
  const seenIds = new Set<string>();

  for (const id of ids) {
    if (seenIds.has(id)) {
      issues.push(`Duplicate ${kind} id "${id}"`);
    }
    seenIds.add(id);
  }
}

function validateTransformOutputSchema(schema: ZodTypeAny, outputs: unknown) {
  const result = schema.safeParse(outputs);

  if (!result.success) {
    throw new Error(`Transform output schema validation failed. ${result.error.message}`);
  }
}

function validateComponentOutputs(definition: StaticComponentDefinition, outputs: unknown) {
  if (!isRecord(outputs)) {
    throw new Error("Static component transforms must return an object.");
  }

  const outputDefinitions = new Map(definition.outputs.map((output) => [output.id, output]));
  const validatedOutputs: Record<string, unknown> = {};

  for (const [outputId, value] of Object.entries(outputs)) {
    if (value === undefined) continue;

    const outputDefinition = outputDefinitions.get(outputId);
    if (!outputDefinition) throw new Error(`Unknown transform output "${outputId}".`);

    const schema = getDataTypeSchema(outputDefinition.typeId);
    if (!schema) throw new Error(`Unknown output data type "${outputDefinition.typeId}".`);

    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(
        `Transform output "${outputId}" failed ${outputDefinition.typeId} validation. ${result.error.message}`,
      );
    }

    validatedOutputs[outputId] = result.data;
  }

  return validatedOutputs;
}

function resolveVueComponent(candidate: unknown, path: string) {
  if (typeof candidate === "function" || isRecord(candidate)) {
    return candidate as VueComponent;
  }

  throw new Error(`Static component ${path} loader did not resolve to a Vue component.`);
}

function resolveTransformModule(candidate: unknown): StaticComponentTransformModule {
  if (!isRecord(candidate) || typeof candidate.transform !== "function") {
    throw new Error(
      "Static component transform loader must resolve a module with a transform function.",
    );
  }

  if (!isRecord(candidate.outputSchema) || typeof candidate.outputSchema.safeParse !== "function") {
    throw new Error("Static component transform modules must export an outputSchema.");
  }

  return candidate as unknown as StaticComponentTransformModule;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
