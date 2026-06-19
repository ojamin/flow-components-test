<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { BadgeVariants } from ".";
import { reactiveOmit } from "@vueuse/core";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { cn } from "../cn";
import { badgeVariants } from ".";

type StyledBadgeVariant = Exclude<BadgeVariants["variant"], "unstyled">;

const props = defineProps<
  PrimitiveProps & {
    variant?: BadgeVariants["variant"];
    class?: HTMLAttributes["class"];
  }
>();

const delegatedProps = reactiveOmit(props, "class");

const badgeClass = computed(() =>
  props.variant === "unstyled"
    ? undefined
    : badgeVariants({ variant: props.variant as StyledBadgeVariant }),
);
</script>

<template>
  <Primitive
    data-slot="badge"
    :data-variant="variant"
    :class="cn(badgeClass, props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </Primitive>
</template>
