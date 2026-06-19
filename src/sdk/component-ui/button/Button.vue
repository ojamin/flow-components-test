<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { ButtonVariants } from ".";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { cn } from "../cn";
import { buttonVariants } from ".";

type StyledButtonVariant = Exclude<ButtonVariants["variant"], "unstyled">;

interface Props extends /* @vue-ignore */ PrimitiveProps {
  as?: PrimitiveProps["as"];
  asChild?: PrimitiveProps["asChild"];
  disabled?: boolean;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});

const buttonClass = computed(() =>
  props.variant === "unstyled"
    ? undefined
    : buttonVariants({ variant: props.variant as StyledButtonVariant, size: props.size }),
);
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :disabled="disabled || undefined"
    :class="cn(buttonClass, props.class)"
  >
    <slot />
  </Primitive>
</template>
