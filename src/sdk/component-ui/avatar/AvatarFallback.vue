<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../cn";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span
    data-slot="avatar-fallback"
    :class="
      cn(
        'flex size-full items-center justify-center bg-ct-surface-muted text-ct-foreground-muted',
        props.class,
      )
    "
  >
    <slot />
  </span>
</template>
