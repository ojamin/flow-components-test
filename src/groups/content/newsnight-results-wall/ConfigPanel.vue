<script setup lang="ts">
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";

import { componentDefinition } from "./component";
import {
  NewsnightResultsWallConfigDefaults,
  NewsnightResultsWallParams,
  type NewsnightResultsWallConfig,
} from "./types";

const emit = defineEmits<{
  (e: "update:config", value: NewsnightResultsWallConfig): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();
</script>

<template>
  <SchemaConfigPanel
    title="Newsnight Results Wall settings"
    :params="NewsnightResultsWallParams"
    :defaults="NewsnightResultsWallConfigDefaults"
    :definition-inputs="componentDefinition.inputs"
    @update:config="emit('update:config', $event as NewsnightResultsWallConfig)"
    @update:param-values="emit('update:paramValues', $event)"
  />
</template>
