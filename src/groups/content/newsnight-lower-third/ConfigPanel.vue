<script setup lang="ts">
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";

import { componentDefinition } from "./component";
import {
  NewsnightLowerThirdConfigDefaults,
  NewsnightLowerThirdParams,
  type NewsnightLowerThirdConfig,
} from "./types";

const emit = defineEmits<{
  (e: "update:config", value: NewsnightLowerThirdConfig): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();
</script>

<template>
  <SchemaConfigPanel
    title="Newsnight Lower Third settings"
    :params="NewsnightLowerThirdParams"
    :defaults="NewsnightLowerThirdConfigDefaults"
    :definition-inputs="componentDefinition.inputs"
    @update:config="emit('update:config', $event as NewsnightLowerThirdConfig)"
    @update:param-values="emit('update:paramValues', $event)"
  />
</template>
