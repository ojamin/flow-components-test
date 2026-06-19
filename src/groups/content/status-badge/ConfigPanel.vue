<script setup lang="ts">
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";

import { componentDefinition } from "./component";
import { StatusBadgeConfigDefaults, StatusBadgeParams, type StatusBadgeConfig } from "./types";

const emit = defineEmits<{
  (e: "update:config", value: StatusBadgeConfig): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();
</script>

<template>
  <SchemaConfigPanel
    title="Status Badge settings"
    :params="StatusBadgeParams"
    :defaults="StatusBadgeConfigDefaults"
    :definition-inputs="componentDefinition.inputs"
    @update:config="emit('update:config', $event as StatusBadgeConfig)"
    @update:param-values="emit('update:paramValues', $event)"
  />
</template>
