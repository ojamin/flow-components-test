<script setup lang="ts">
import { computed, useId } from "vue";

import { Button, Icon } from "@flow-builder/components/component-ui";
import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import { resolveSafeHref } from "../../../sdk/content-primitives";
import { buttonConfigDefaults, type ButtonConfig, type ButtonFixtureData } from "./types";

const props = defineProps<StaticComponentRenderProps<ButtonConfig, ButtonFixtureData>>();
const disabledReasonId = useId();

const config = computed(() => ({
  ...buttonConfigDefaults,
  ...props.config,
}));

const label = computed(() => config.value.label.trim());
const leadingIcon = computed(() => config.value.leadingIcon.trim());
const trailingIcon = computed(() => config.value.trailingIcon.trim());
const hasIcon = computed(() => Boolean(leadingIcon.value || trailingIcon.value));
const isIconOnly = computed(() => hasIcon.value && (config.value.size === "icon" || !label.value));
const accessibleLabel = computed(() => config.value.accessibleLabel.trim());
const safeHref = computed(() => resolveSafeHref(config.value.href));
const safeLinkHref = computed(() => (safeHref.value.state === "valid" ? safeHref.value.href : ""));
const isDisabled = computed(() => config.value.disabled || safeHref.value.state !== "valid");
const buttonLabel = computed(
  () =>
    label.value || accessibleLabel.value || props.fixtureData?.emptyLabel || "Add a button label",
);
const linkLabel = computed(() => label.value || (!hasIcon.value ? accessibleLabel.value : ""));
const ariaLabel = computed(() => {
  if (accessibleLabel.value) return accessibleLabel.value;
  if (isIconOnly.value) return buttonLabel.value;
  return undefined;
});
const disabledDescription = computed(() => config.value.disabledReason.trim());
const disabledDescriptionId = computed(() =>
  disabledDescription.value ? disabledReasonId : undefined,
);
const target = computed(() => (config.value.target === "blank" ? "_blank" : undefined));
const rel = computed(() => (config.value.target === "blank" ? "noreferrer noopener" : undefined));
const buttonBaseClass =
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap border font-medium outline-none transition-all focus-visible:border-ct-focus-ring focus-visible:ring-2 focus-visible:ring-ct-focus-ring/45 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-75 active:translate-y-px disabled:active:translate-y-0";

const buttonSizeClass = computed(() => {
  if (config.value.size === "xs") {
    return "h-6 gap-1 rounded-md px-2 text-xs";
  }

  if (config.value.size === "sm") {
    return "h-7 gap-1 rounded-md px-2.5 text-[0.8rem]";
  }

  if (config.value.size === "lg") {
    return "h-9 gap-1.5 rounded-lg px-3 text-sm";
  }

  if (config.value.size === "icon") {
    return "size-8 rounded-lg p-0 text-sm";
  }

  return "h-8 gap-1.5 rounded-lg px-2.5 text-sm";
});

const iconClass = computed(() => {
  if (config.value.size === "xs" || config.value.size === "sm") return "size-3.5 shrink-0";
  return "size-4 shrink-0";
});

const buttonThemeClass = computed(() => {
  if (config.value.variant === "link") {
    return `${buttonBaseClass} ${buttonSizeClass.value} border-ct-border/0 bg-transparent text-ct-foreground underline decoration-ct-accent/70 underline-offset-4 hover:bg-transparent hover:text-ct-foreground hover:decoration-ct-accent focus-visible:border-ct-focus-ring disabled:text-ct-foreground-muted`;
  }

  if (config.value.variant === "ghost") {
    return `${buttonBaseClass} ${buttonSizeClass.value} border-ct-border/0 bg-transparent text-ct-foreground hover:bg-ct-surface-muted hover:text-ct-foreground focus-visible:border-ct-focus-ring disabled:bg-transparent disabled:text-ct-foreground-muted`;
  }

  if (config.value.variant === "outline") {
    return `${buttonBaseClass} ${buttonSizeClass.value} border-ct-input bg-transparent text-ct-foreground hover:border-ct-accent hover:bg-ct-surface-muted hover:text-ct-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted`;
  }

  if (config.value.variant === "secondary") {
    return `${buttonBaseClass} ${buttonSizeClass.value} border-ct-secondary bg-ct-secondary text-ct-secondary-foreground hover:bg-ct-secondary/80 hover:text-ct-secondary-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted`;
  }

  if (config.value.variant === "destructive") {
    return `${buttonBaseClass} ${buttonSizeClass.value} border-ct-destructive bg-ct-destructive text-ct-destructive-foreground hover:bg-ct-destructive/85 hover:text-ct-destructive-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted`;
  }

  return `${buttonBaseClass} ${buttonSizeClass.value} border-ct-accent bg-ct-accent text-ct-accent-foreground hover:bg-ct-accent/80 hover:text-ct-accent-foreground focus-visible:border-ct-focus-ring disabled:border-ct-border disabled:bg-ct-surface-muted disabled:text-ct-foreground-muted`;
});

function handleClick() {
  if (isDisabled.value) return;

  const at = new Date().toISOString();
  props.emitEvent?.("clicked", { at });

  // When the author has configured a Requested view ID, also emit the
  // `viewRequested` event. Host runtime projects the validated payload onto
  // the `requestedViewId` output, which can then drive a ViewStack
  // `activeViewId` input through a normal Flow edge — no direct mutation, no
  // component-id-specific runtime branch.
  const requestedViewId = config.value.requestedViewId.trim();
  if (requestedViewId) {
    props.emitEvent?.("viewRequested", { activeViewId: requestedViewId });
  }
}
</script>

<template>
  <Button
    v-if="!isDisabled && (label || ariaLabel)"
    as-child
    :size="config.size"
    variant="unstyled"
    :class="buttonThemeClass"
  >
    <a
      :href="safeLinkHref"
      :aria-label="ariaLabel"
      :rel="rel"
      :target="target"
      data-testid="button-link"
      @click="handleClick"
    >
      <Icon
        v-if="leadingIcon"
        :icon="leadingIcon"
        :class="iconClass"
        aria-hidden="true"
        data-testid="button-leading-icon"
      />
      <span v-if="linkLabel && !isIconOnly">{{ linkLabel }}</span>
      <Icon
        v-if="trailingIcon"
        :icon="trailingIcon"
        :class="iconClass"
        aria-hidden="true"
        data-testid="button-trailing-icon"
      />
    </a>
  </Button>

  <Button
    v-else
    disabled
    :size="config.size"
    variant="unstyled"
    :class="buttonThemeClass"
    :aria-label="ariaLabel"
    :aria-describedby="disabledDescriptionId"
    data-testid="button-disabled"
    type="button"
  >
    <Icon
      v-if="leadingIcon"
      :icon="leadingIcon"
      :class="iconClass"
      aria-hidden="true"
      data-testid="button-leading-icon"
    />
    <span v-if="!isIconOnly">{{ buttonLabel }}</span>
    <Icon
      v-if="trailingIcon"
      :icon="trailingIcon"
      :class="iconClass"
      aria-hidden="true"
      data-testid="button-trailing-icon"
    />
    <span v-if="disabledDescription" :id="disabledReasonId" class="sr-only">
      {{ disabledDescription }}
    </span>
  </Button>
</template>
