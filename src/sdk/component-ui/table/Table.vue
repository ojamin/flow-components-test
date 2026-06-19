<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../cn";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  // containerClass lets callers override wrapper classes (e.g. remove overflow-x-auto when
  // the parent scroll area already handles horizontal overflow — required for sticky headers).
  containerClass?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="table-container"
    :class="cn('relative w-full overflow-x-auto', props.containerClass)"
  >
    <table data-slot="table" :class="cn('w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
