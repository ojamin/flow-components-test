<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DialogContent, DialogPortal, useForwardPropsEmits } from "reka-ui";

import { Button } from "../button";
import { cn } from "../cn";
import DialogClose from "./DialogClose.vue";
import DialogOverlay from "./DialogOverlay.vue";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes["class"];
      disablePortal?: boolean;
      showCloseButton?: boolean;
    }
  >(),
  {
    disablePortal: false,
    showCloseButton: true,
  },
);
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, "class", "disablePortal", "showCloseButton");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal :disabled="props.disablePortal">
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-ct-xl border border-ct-border bg-ct-popover p-5 text-sm leading-6 text-ct-popover-foreground shadow-ct-lg ring-1 ring-ct-border/70 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 motion-reduce:animate-none motion-reduce:transition-none sm:w-full',
          props.class,
        )
      "
    >
      <slot />

      <DialogClose v-if="props.showCloseButton" as-child>
        <Button
          aria-label="Close dialog"
          class="absolute right-3 top-3 h-8 w-8 rounded-ct-md border border-transparent p-0 text-ct-foreground-muted hover:border-ct-border hover:bg-ct-surface-muted hover:text-ct-foreground focus-visible:border-ct-focus-ring focus-visible:ring-2 focus-visible:ring-ct-focus-ring/55"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <span aria-hidden="true" class="text-base leading-none">×</span>
          <span class="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
