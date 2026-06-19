import type { ZodTypeAny } from "zod";

import type {
  ComponentConfig,
  ComponentConfigInput,
  ComponentDefinition,
  ComponentDefinitionInput,
  DataBoundaryExportBehavior,
  DataBoundaryMetric,
  DataBoundaryDirection,
  DataBoundarySourceKind,
} from "./component-definition-types";

const dataBoundaryDirections = [
  "ingress",
  "egress",
] as const satisfies readonly DataBoundaryDirection[];

const dataBoundarySourceKinds = [
  "root",
  "http",
  "file",
  "dataset",
  "download",
  "event",
  "custom",
] as const satisfies readonly DataBoundarySourceKind[];

const dataBoundaryMetrics = [
  "bytes",
  "rows",
  "lines",
  "objects",
  "loadDurationMs",
  "cacheAgeMs",
  "refreshCadence",
] as const satisfies readonly DataBoundaryMetric[];

const dataBoundaryExportBehaviors = [
  "live",
  "embedded",
  "fallback",
  "not-applicable",
  "custom",
] as const satisfies readonly DataBoundaryExportBehavior[];

const dataBoundaryFields = [
  "directions",
  "sourceKind",
  "supportsRefresh",
  "supportsCache",
  "supportsOverride",
  "supportsPayloadPreview",
  "supportsPromotion",
  "metrics",
  "exportBehavior",
] as const;

export function parseComponentConfig<TSchema extends ZodTypeAny>(
  schema: TSchema,
  config: ComponentConfigInput<TSchema> | ComponentConfig<TSchema>,
): ComponentConfig<TSchema> {
  const parsedConfig = schema.parse(config);

  if (!isPlainObject(parsedConfig)) {
    throw new Error("Component config schemas must resolve to an object.");
  }

  return parsedConfig as ComponentConfig<TSchema>;
}

export function defineConfigDefaults<TSchema extends ZodTypeAny>(
  schema: TSchema,
): ComponentConfig<TSchema> {
  return parseComponentConfig(schema, {} as ComponentConfigInput<TSchema>);
}

const fixtureDataCache = new WeakMap<ComponentDefinition, Promise<unknown>>();
const fixtureVariantsCache = new WeakMap<ComponentDefinition, Promise<Record<string, unknown>>>();

export function resolveFixtureData(definition: ComponentDefinition): Promise<unknown> {
  const cached = fixtureDataCache.get(definition);
  if (cached) return cached;

  const loaded = Promise.resolve()
    .then(() => definition.loadFixtureData())
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load fixture data for component "${definition.id}": ${message}`);
    });

  fixtureDataCache.set(definition, loaded);
  return loaded;
}

export function resolveFixtureVariants(
  definition: ComponentDefinition,
): Promise<Record<string, unknown>> {
  const cached = fixtureVariantsCache.get(definition);
  if (cached) return cached;

  const loaded = Promise.resolve()
    .then(() => definition.loadFixtureVariants?.() ?? {})
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load fixture variants for component "${definition.id}": ${message}`,
      );
    });

  fixtureVariantsCache.set(definition, loaded);
  return loaded;
}

export function defineComponent<TSchema extends ZodTypeAny>(
  definition: ComponentDefinitionInput<TSchema>,
): ComponentDefinition<TSchema> {
  assertDeclaredParams(definition);
  assertDataBoundaryMetadata(definition);

  return {
    ...definition,
    slots: definition.slots ?? [],
    configDefaults: parseComponentConfig(definition.configSchema, definition.configDefaults),
  };
}

function assertDeclaredParams(definition: Pick<ComponentDefinition, "id"> & { params?: unknown }) {
  if (
    !Object.prototype.hasOwnProperty.call(definition, "params") ||
    !isPlainObject(definition.params)
  ) {
    throw new Error(
      `Component definition "${definition.id}" must declare params (use params: {} when the component has no config).`,
    );
  }
}

function assertDataBoundaryMetadata(
  definition: Pick<ComponentDefinition, "id"> & { dataBoundary?: unknown },
) {
  const metadata = definition.dataBoundary;
  if (metadata === undefined) return;

  if (!isPlainObject(metadata)) {
    throw new Error(`Component definition "${definition.id}" dataBoundary must be an object.`);
  }

  for (const key of Object.keys(metadata)) {
    if (!(dataBoundaryFields as readonly string[]).includes(key)) {
      throw new Error(
        `Component definition "${definition.id}" dataBoundary contains unsupported field "${key}".`,
      );
    }
  }

  assertEnumArray(
    definition.id,
    "dataBoundary.directions",
    metadata.directions,
    dataBoundaryDirections,
    { allowEmpty: false },
  );
  assertOptionalEnum(
    definition.id,
    "dataBoundary.sourceKind",
    metadata.sourceKind,
    dataBoundarySourceKinds,
  );
  assertOptionalEnum(
    definition.id,
    "dataBoundary.exportBehavior",
    metadata.exportBehavior,
    dataBoundaryExportBehaviors,
  );
  assertOptionalEnumArray(
    definition.id,
    "dataBoundary.metrics",
    metadata.metrics,
    dataBoundaryMetrics,
  );

  for (const field of [
    "supportsRefresh",
    "supportsCache",
    "supportsOverride",
    "supportsPayloadPreview",
    "supportsPromotion",
  ] as const) {
    assertOptionalBoolean(definition.id, `dataBoundary.${field}`, metadata[field]);
  }
}

function assertEnumArray<const TAllowed extends readonly string[]>(
  componentId: string,
  fieldPath: string,
  value: unknown,
  allowed: TAllowed,
  options: { allowEmpty: boolean },
) {
  if (!Array.isArray(value)) {
    throw new Error(`Component definition "${componentId}" ${fieldPath} must be an array.`);
  }
  if (!options.allowEmpty && value.length === 0) {
    throw new Error(`Component definition "${componentId}" ${fieldPath} must not be empty.`);
  }

  for (const item of value) {
    if (!isAllowedString(item, allowed)) {
      throw new Error(
        `Component definition "${componentId}" ${fieldPath} contains unsupported value "${String(item)}".`,
      );
    }
  }
}

function assertOptionalEnumArray<const TAllowed extends readonly string[]>(
  componentId: string,
  fieldPath: string,
  value: unknown,
  allowed: TAllowed,
) {
  if (value === undefined) return;
  assertEnumArray(componentId, fieldPath, value, allowed, { allowEmpty: true });
}

function assertOptionalEnum<const TAllowed extends readonly string[]>(
  componentId: string,
  fieldPath: string,
  value: unknown,
  allowed: TAllowed,
) {
  if (value === undefined) return;
  if (!isAllowedString(value, allowed)) {
    throw new Error(
      `Component definition "${componentId}" ${fieldPath} contains unsupported value "${String(value)}".`,
    );
  }
}

function assertOptionalBoolean(componentId: string, fieldPath: string, value: unknown) {
  if (value === undefined) return;
  if (typeof value !== "boolean") {
    throw new Error(`Component definition "${componentId}" ${fieldPath} must be a boolean.`);
  }
}

function isAllowedString<const TAllowed extends readonly string[]>(
  value: unknown,
  allowed: TAllowed,
): value is TAllowed[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
