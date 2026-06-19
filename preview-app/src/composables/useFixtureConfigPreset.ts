import { computed, ref, watch, type ComputedRef, type Ref } from "vue";

import { resolveFixtureData, resolveFixtureVariants } from "@flow-builder/components/sdk";
import type { ComponentDefinition, FixtureVariantMeta } from "@flow-builder/components/sdk";

export type PreviewFixtureState =
  | { status: "idle" | "loading" | "error"; value?: never }
  | { status: "loaded"; value: unknown };

export interface UseFixtureConfigPresetOptions {
  definitionRef: Readonly<Ref<ComponentDefinition | undefined>>;
  configRef: Readonly<Ref<Record<string, unknown> | undefined>>;
  selectedFixtureVariantIdRef: Readonly<Ref<string>>;
  fixtureStateRef: Readonly<Ref<PreviewFixtureState>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findDeclaredFixtureVariant(
  definition: ComponentDefinition,
  variantId: string,
): FixtureVariantMeta | undefined {
  return definition.fixtureVariants?.find((variant) => variant.id === variantId);
}

function isConfigPresetVariant(variant: FixtureVariantMeta | undefined): boolean {
  return variant?.appliesTo === "config";
}

/**
 * Resolves the selected fixture variant payload, falling back to default fixture data
 * when the variant id is empty, undeclared, or omitted by the variant loader.
 */
export async function resolveSelectedFixturePayload(
  definition: ComponentDefinition,
  variantId: string,
): Promise<unknown> {
  if (!variantId || !definition.fixtureVariants?.length || !definition.loadFixtureVariants) {
    return resolveFixtureData(definition);
  }

  const declared = findDeclaredFixtureVariant(definition, variantId);
  if (!declared || isConfigPresetVariant(declared)) {
    return resolveFixtureData(definition);
  }

  const variants = await resolveFixtureVariants(definition);
  if (!Object.prototype.hasOwnProperty.call(variants, variantId)) {
    return resolveFixtureData(definition);
  }
  return variants[variantId];
}

/** Resolves only fixture variants explicitly declared as config presets. */
export async function resolveSelectedConfigPresetPayload(
  definition: ComponentDefinition,
  variantId: string,
): Promise<Record<string, unknown> | undefined> {
  if (!variantId || !definition.fixtureVariants?.length || !definition.loadFixtureVariants) {
    return undefined;
  }

  const declared = findDeclaredFixtureVariant(definition, variantId);
  if (!isConfigPresetVariant(declared)) return undefined;

  const variants = await resolveFixtureVariants(definition);
  if (!Object.prototype.hasOwnProperty.call(variants, variantId)) return undefined;

  const variantPayload = variants[variantId];
  return isRecord(variantPayload) ? variantPayload : undefined;
}

/**
 * Some package-preview fixture variants are explicitly declared config presets
 * instead of renderer fixture data. Merge only those payloads into preview config;
 * otherwise keep the fixtureData-only behavior for data-driven components.
 */
export function useFixtureConfigPreset({
  definitionRef,
  configRef,
  selectedFixtureVariantIdRef,
  fixtureStateRef,
}: UseFixtureConfigPresetOptions): ComputedRef<Record<string, unknown> | undefined> {
  const configPresetRef = ref<Record<string, unknown> | undefined>();
  let presetToken = 0;

  watch(
    [definitionRef, selectedFixtureVariantIdRef] as const,
    async ([definition, variantId]) => {
      const token = ++presetToken;
      configPresetRef.value = undefined;
      if (!definition || !variantId) return;

      try {
        const preset = await resolveSelectedConfigPresetPayload(definition, variantId);
        if (token !== presetToken) return;
        configPresetRef.value = preset;
      } catch {
        if (token !== presetToken) return;
        configPresetRef.value = undefined;
      }
    },
    { immediate: true },
  );

  return computed(() => {
    const definition = definitionRef.value;
    if (
      !definition ||
      !selectedFixtureVariantIdRef.value ||
      fixtureStateRef.value.status !== "loaded"
    ) {
      return configRef.value;
    }

    const selectedVariant = findDeclaredFixtureVariant(
      definition,
      selectedFixtureVariantIdRef.value,
    );
    if (!isConfigPresetVariant(selectedVariant)) return configRef.value;

    const variantPayload = configPresetRef.value;
    if (!variantPayload) return configRef.value;

    const mergedConfig = {
      ...(definition.configDefaults as Record<string, unknown>),
      ...configRef.value,
      ...variantPayload,
    };
    const parsed = definition.configSchema.safeParse(mergedConfig);
    return parsed.success ? (parsed.data as Record<string, unknown>) : configRef.value;
  });
}
