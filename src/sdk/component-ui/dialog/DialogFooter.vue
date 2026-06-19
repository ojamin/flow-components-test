<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "../cn";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="
      cn(
        '-mx-5 -mb-5 mt-1 flex flex-col-reverse gap-2 rounded-b-ct-xl border-t border-ct-border bg-ct-surface-muted/70 p-4 sm:flex-row sm:justify-end',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
