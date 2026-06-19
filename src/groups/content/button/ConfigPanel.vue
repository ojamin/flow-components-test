<script setup lang="ts">
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";

import { componentDefinition } from "./component";
import { buttonConfigDefaults, buttonParams, type ButtonConfig } from "./types";

const emit = defineEmits<{
  (e: "update:config", value: ButtonConfig): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();
</script>

<template>
  <SchemaConfigPanel
    title="Button settings"
    :params="buttonParams"
    :defaults="buttonConfigDefaults"
    :definition-inputs="componentDefinition.inputs"
    @update:config="emit('update:config', $event as ButtonConfig)"
    @update:param-values="emit('update:paramValues', $event)"
  />
</template>
