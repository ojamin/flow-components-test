<script setup lang="ts">
/**
 * ConfigInspectorSection — collapsible section wrapper for inspector panels.
 *
 * Provides a consistent collapsible group with title, optional hover help,
 * and a slot for arbitrary config fields. The section intentionally stays
 * flat so inspector rails do not regress into nested faux-card chrome, and
 * helper copy lives behind a compact header affordance instead of inline.
 */
import { ref, watch } from "vue";
import { Icon } from "@iconify/vue";

import { Button } from "../button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";
import { Separator } from "../separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";

const props = withDefaults(
  defineProps<{
    /** Section heading text. */
    title: string;
    /** Optional help text exposed from the section header. */
    description?: string;
    /** Whether the section starts expanded. */
    defaultOpen?: boolean;
    /** Disable the collapse toggle. */
    disabled?: boolean;
  }>(),
  {
    defaultOpen: true,
    disabled: false,
  },
);

const isOpen = ref(props.defaultOpen);

watch(
  () => props.defaultOpen,
  (next) => {
    isOpen.value = next;
  },
);
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    :disabled="disabled"
    class="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0"
    data-testid="config-inspector-section"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-1.5">
        <h3 class="min-w-0 text-sm font-semibold leading-tight">{{ title }}</h3>
        <TooltipProvider v-if="description" :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                :aria-label="`More information about ${title}`"
                class="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                data-testid="section-help-trigger"
                type="button"
              >
                <Icon class="size-3.5" icon="lucide:circle-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent class="max-w-72 text-xs leading-relaxed" side="left">
              {{ description }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CollapsibleTrigger as-child>
        <Button
          variant="ghost"
          size="icon-xs"
          :disabled="disabled"
          :aria-label="isOpen ? `Collapse ${title}` : `Expand ${title}`"
          data-testid="section-toggle"
        >
          <Icon
            icon="lucide:chevron-down"
            class="size-4 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </Button>
      </CollapsibleTrigger>
    </div>

    <CollapsibleContent>
      <Separator class="mb-3" />
      <div class="flex flex-col gap-4">
        <slot />
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
