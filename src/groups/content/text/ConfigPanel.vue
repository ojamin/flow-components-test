<script setup lang="ts">
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";

import { componentDefinition } from "./component";
import { textConfigDefaults, textParams, type TextConfig } from "./types";

const emit = defineEmits<{
  (e: "update:config", value: TextConfig): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();
</script>

<template>
  <SchemaConfigPanel
    title="Text settings"
    :params="textParams"
    :defaults="textConfigDefaults"
    :definition-inputs="componentDefinition.inputs"
    @update:config="emit('update:config', $event as TextConfig)"
    @update:param-values="emit('update:paramValues', $event)"
  />
</template>
