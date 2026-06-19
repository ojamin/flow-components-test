<script setup lang="ts">
// Shared SchemaForm config-panel wrapper (Phase 2.3 / Task 44.16 closeout).
//
// Every package ConfigPanel is a `SchemaForm` wrapper: section header +
// defaults-merged config + host-resolved inputs (with `definition.inputs`
// fallback) + optional fixture-data passthrough for chart-adapter fields.
// This file owns that wiring so each `groups/**/ConfigPanel.vue` stays a
// declarative, sub-30-line shell.
//
// Imports go through `./component-ui-primitives` and sibling SFCs (not the
// `./component-ui` barrel) so the facade stays cycle-free.
import { computed } from "vue";

import SchemaForm from "./SchemaForm.vue";
import type {
  ComponentParams,
  ComponentThemeContext,
  InputPortDefinition,
  JsonValue,
  ParamValuesState,
} from "./public-sdk";
import type { DatasetDerivationService } from "./runtime-services";

const props = defineProps<{
  /** Section title shown in the panel header. */
  title: string;
  /** Component-declared param descriptors (drives the form schema). */
  params: ComponentParams;
  /** Component config defaults; merged under the host-supplied `config` patch. */
  defaults: Record<string, unknown>;
  /**
   * Static fallback inputs from the component definition. Used when the host
   * does not supply `resolvedInputs` (preview-app or package-test contexts).
   */
  definitionInputs: readonly InputPortDefinition[];
  /** Host-supplied partial config patch. Merged over `defaults`. */
  config?: Record<string, unknown>;
  /** Persisted literal/bind state for the params. */
  paramValues?: ParamValuesState;
  /** Host-selected component instance id, used only by optional picker adapters. */
  instanceId?: string;
  /**
   * Inputs resolved through `resolveComponentPorts(definition, instance)`.
   * Falls back to `definitionInputs` when absent.
   */
  resolvedInputs?: readonly InputPortDefinition[];
  /** Adapter context for chart-adapter fields; ignored by other control kinds. */
  fixtureData?: unknown;
  /** Optional host metadata service for async chart-adapter field suggestions. */
  datasetDerivationService?: DatasetDerivationService;
  /**
   * Optional resolved component-theme context for the surrounding placement.
   * Forwarded to `kind: "theme-role"` fields so swatches paint from the host
   * theme bridge; other control kinds ignore it.
   */
  themeContext?: ComponentThemeContext;
}>();

const emit = defineEmits<{
  (e: "update:config", value: Record<string, unknown>): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();

const mergedConfig = computed<Record<string, unknown>>(() => ({
  ...props.defaults,
  ...props.config,
}));

const inputs = computed<readonly InputPortDefinition[]>(
  () => props.resolvedInputs ?? props.definitionInputs,
);

const adapterData = computed<JsonValue | undefined>(
  () => props.fixtureData as JsonValue | undefined,
);
</script>

<template>
  <section class="space-y-4">
    <header>
      <h3 class="text-sm font-semibold">{{ title }}</h3>
    </header>
    <SchemaForm
      :params="params"
      :config="mergedConfig"
      :param-values="paramValues"
      :inputs="inputs"
      :instance-id="instanceId"
      :data="adapterData"
      :dataset-derivation-service="datasetDerivationService"
      :theme-context="themeContext"
      @update:config="(value) => emit('update:config', value)"
      @update:param-values="(value) => emit('update:paramValues', value)"
    />
  </section>
</template>
