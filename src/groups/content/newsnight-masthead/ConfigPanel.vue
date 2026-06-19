<script setup lang="ts">
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";

import { componentDefinition } from "./component";
import {
  NewsnightMastheadConfigDefaults,
  NewsnightMastheadParams,
  type NewsnightMastheadConfig,
} from "./types";

const emit = defineEmits<{
  (e: "update:config", value: NewsnightMastheadConfig): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();
</script>

<template>
  <SchemaConfigPanel
    title="Newsnight Masthead settings"
    :params="NewsnightMastheadParams"
    :defaults="NewsnightMastheadConfigDefaults"
    :definition-inputs="componentDefinition.inputs"
    @update:config="emit('update:config', $event as NewsnightMastheadConfig)"
    @update:param-values="emit('update:paramValues', $event)"
  />
</template>
