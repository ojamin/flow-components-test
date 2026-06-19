<script lang="ts">
// Module intent: preview controls toolbar for RendererHostPane.
// Exports shared types consumed by RendererHostPane alongside the component import.
// Plain <button> elements with Tailwind follow the ComponentBrowserView.vue precedent.

/** Theme override for the preview frame. "system" auto-detects from OS preference. */
export type PreviewTheme = "light" | "dark" | "system";

/**
 * Device context applied to the preview frame.
 * "responsive" has no frame decoration; "phone"/"tablet" add a ring to simulate a device shell.
 */
export type DeviceMode = "responsive" | "phone" | "tablet";

/** Viewport width preset applied to the preview frame wrapper. */
export type ViewportPreset = "desktop" | "tablet" | "mobile";

/**
 * State mode to simulate in the preview frame.
 * "default" renders the real component with fixture data.
 * "empty" passes null fixture-data to the renderer.
 * "loading" shows a loading state frame instead of the renderer output.
 * "error" shows an error state frame instead of the renderer output.
 * "disabled" wraps the renderer in a pointer-events-none + opacity layer.
 */
export type StateMode = "default" | "empty" | "loading" | "error" | "disabled";
</script>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flow-builder/components/component-ui";
import type {
  FixtureVariantMeta,
  StateApplicability,
  StateSupportMeta,
} from "@flow-builder/components/sdk";

const props = withDefaults(
  defineProps<{
    theme: PreviewTheme;
    device: DeviceMode;
    viewport: ViewportPreset;
    stateMode: StateMode;
    /** Whether the renderer host has bind state to clear. */
    canReset?: boolean;
    /** Whether a valid captured event is available for replay. */
    canReplay?: boolean;
    /**
     * Optional fixture-variant metadata from the selected component definition.
     * When the list has 2+ entries, the controls bar renders a variant selector
     * so authors can preview alternate fixture payloads without editing config.
     * A single or empty list hides the selector entirely.
     */
    fixtureVariants?: readonly FixtureVariantMeta[];
    /**
     * Selected fixture variant id. Empty string represents the default
     * (definition.loadFixtureData) fixture. Stays a string so the underlying
     * Select control can round-trip the value without sentinels.
     */
    fixtureVariantId?: string;
    /**
     * Optional state-applicability metadata. When provided, state buttons whose
     * key is marked `{ notApplicable: reason }` render with dimmed chrome, an
     * "N/A" suffix, and an accessible description carrying the reason. The
     * controls remain clickable so authors can still inspect the simulated
     * state manually.
     */
    stateSupport?: StateSupportMeta;
  }>(),
  { canReset: false, canReplay: false, fixtureVariantId: "" },
);

const emit = defineEmits<{
  "update:theme": [value: PreviewTheme];
  "update:device": [value: DeviceMode];
  "update:viewport": [value: ViewportPreset];
  "update:stateMode": [value: StateMode];
  "update:fixtureVariantId": [value: string];
  /** User asked to clear paramValues / bind edits and return to derived defaults. */
  "reset-param-values": [];
  /** User asked to project the most recent valid captured event into runtime outputs. */
  "replay-last-event": [];
}>();

// Inline capitalise helper — avoids importing a utility just for label formatting.
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Fixture variant selector visibility: hide entirely when the definition does
// not ship multiple variants. The default fixture is still available through
// the implicit "" value emitted upward.
const showFixtureVariantSelector = computed(
  (): boolean => (props.fixtureVariants?.length ?? 0) >= 2,
);

/**
 * Sentinel value for the "Default fixture" option. reka-ui's Select rejects
 * empty-string `value` props on items because the empty string represents the
 * cleared state, so the dropdown must use a distinct token. The parent always
 * sees the empty string for "no variant override" — the bar maps both
 * directions at the Select boundary.
 */
const DEFAULT_FIXTURE_SENTINEL = "__default__";

const fixtureVariantSelectValue = computed((): string =>
  props.fixtureVariantId ? props.fixtureVariantId : DEFAULT_FIXTURE_SENTINEL,
);

function emitFixtureVariantChange(next: unknown): void {
  const value = next == null ? "" : String(next);
  emit("update:fixtureVariantId", value === DEFAULT_FIXTURE_SENTINEL ? "" : value);
}

// Map state keys onto their applicability metadata. Missing entries fall back
// to `true` (fully applicable) so legacy definitions without stateSupport keep
// the previous appearance/behavior.
const STATE_KEY_BY_MODE = {
  empty: "empty",
  loading: "loading",
  error: "error",
  disabled: "disabled",
} as const satisfies Record<Exclude<StateMode, "default">, keyof StateSupportMeta>;

function stateApplicability(mode: StateMode): StateApplicability {
  if (mode === "default") return true;
  const key = STATE_KEY_BY_MODE[mode];
  return props.stateSupport?.[key] ?? true;
}

function notApplicableReason(mode: StateMode): string | undefined {
  const applicability = stateApplicability(mode);
  return applicability === true ? undefined : applicability.notApplicable;
}

// `aria-description` has uneven AT/browser support; pair the visible button
// with a hidden sr-only paragraph and reference it via `aria-describedby`
// instead so screen readers reliably announce the N/A reason after the
// button label.
function notApplicableDescribedById(mode: StateMode): string | undefined {
  return notApplicableReason(mode) ? `preview-controls-state-${mode}-na-reason` : undefined;
}
</script>

<template>
  <!--
    Toolbar with four button groups: theme / device / viewport / state-mode.
    aria-pressed reflects the active value in each group.
    Uses plain <button> elements with Tailwind per ComponentBrowserView.vue precedent.
  -->
  <div
    class="flex flex-wrap gap-x-4 gap-y-2 mb-3 pb-2.5 border-b border-border/50"
    role="toolbar"
    aria-label="Preview controls"
  >
    <!-- Theme group -->
    <div class="flex items-center gap-2" role="group" aria-label="Theme">
      <span
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5 select-none"
        aria-hidden="true"
      >
        Theme
      </span>
      <button
        v-for="t in ['system', 'light', 'dark'] as const"
        :key="t"
        type="button"
        :aria-pressed="props.theme === t"
        class="px-3 py-2 text-[11px] rounded min-h-9 inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          props.theme === t
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        "
        @click="emit('update:theme', t)"
      >
        {{ cap(t) }}
      </button>
    </div>

    <!-- Viewport group -->
    <div class="flex items-center gap-2" role="group" aria-label="Viewport">
      <span
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5 select-none"
        aria-hidden="true"
      >
        Viewport
      </span>
      <button
        v-for="vp in ['desktop', 'tablet', 'mobile'] as const"
        :key="vp"
        type="button"
        :aria-pressed="props.viewport === vp"
        class="px-3 py-2 text-[11px] rounded min-h-9 inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          props.viewport === vp
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        "
        @click="emit('update:viewport', vp)"
      >
        {{ cap(vp) }}
      </button>
    </div>

    <!-- Device group -->
    <div class="flex items-center gap-2" role="group" aria-label="Device">
      <span
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5 select-none"
        aria-hidden="true"
      >
        Device
      </span>
      <button
        v-for="d in ['responsive', 'phone', 'tablet'] as const"
        :key="d"
        type="button"
        :aria-pressed="props.device === d"
        class="px-3 py-2 text-[11px] rounded min-h-9 inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          props.device === d
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        "
        @click="emit('update:device', d)"
      >
        {{ cap(d) }}
      </button>
    </div>

    <!--
      Fixture variant selector. Hidden unless the active definition ships 2+
      fixture variants (the default fixture is always available via the implicit
      "" id, so a single declared variant is functionally equivalent to no
      selector). Uses the shared shadcn-vue Select so the trigger surface and
      keyboard semantics match every other dropdown in the bar.
    -->
    <div
      v-if="showFixtureVariantSelector"
      class="flex items-center gap-2"
      role="group"
      aria-label="Fixture variant"
    >
      <label
        for="preview-controls-fixture-variant"
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5 select-none"
      >
        Fixture
      </label>
      <Select
        :model-value="fixtureVariantSelectValue"
        @update:model-value="emitFixtureVariantChange($event)"
      >
        <SelectTrigger
          id="preview-controls-fixture-variant"
          class="h-9 min-w-[10rem] text-[11px]"
          data-testid="preview-controls-fixture-variant"
        >
          <SelectValue placeholder="Default fixture" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="DEFAULT_FIXTURE_SENTINEL">Default fixture</SelectItem>
          <SelectItem
            v-for="variant in props.fixtureVariants ?? []"
            :key="variant.id"
            :value="variant.id"
          >
            {{ variant.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!--
      State group: buttons are wrapped in a sub-group div so all five flow together.
      w-full forces the button row to its own line below the "State" label at narrow
      viewports, preventing "Disabled" from appearing alone. gap-x-1.5 on the inner
      group (vs gap-2 elsewhere) compensates for the sub-pixel overflow that would
      otherwise push the fifth button to a second line at 390px. sm:w-auto restores
      the inline label + buttons layout at wider viewports.

      When a definition declares `stateSupport[mode] = { notApplicable: reason }`,
      the matching button renders dimmed with an "N/A" suffix and an accessible
      description carrying the reason. The button stays clickable so authors can
      still simulate the state manually for inspection.
    -->
    <div class="flex items-center gap-2 flex-wrap gap-y-2" role="group" aria-label="State">
      <span
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5 select-none"
        aria-hidden="true"
      >
        State
      </span>
      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-2 w-full sm:w-auto">
        <template
          v-for="s in ['default', 'empty', 'loading', 'error', 'disabled'] as const"
          :key="s"
        >
          <button
            type="button"
            :aria-pressed="props.stateMode === s"
            :data-state-applicability="notApplicableReason(s) ? 'not-applicable' : 'applicable'"
            :title="notApplicableReason(s)"
            :aria-describedby="notApplicableDescribedById(s)"
            class="px-3 py-2 text-[11px] rounded min-h-9 inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="[
              props.stateMode === s
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              notApplicableReason(s) ? 'opacity-60' : '',
            ]"
            @click="emit('update:stateMode', s)"
          >
            <span>{{ cap(s) }}</span>
            <span
              v-if="notApplicableReason(s)"
              class="text-[9px] font-semibold uppercase tracking-wider rounded px-1 py-px bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              N/A
            </span>
          </button>
          <!--
            Hidden description referenced by `aria-describedby`. The reason
            text stays out of the visual flow (sr-only) but remains in the
            accessibility tree so AT can announce it after the button label.
            Kept as a sibling so the surrounding flex layout is unaffected.
          -->
          <span
            v-if="notApplicableReason(s)"
            :id="`preview-controls-state-${s}-na-reason`"
            class="sr-only"
            data-testid="preview-controls-state-na-reason"
          >
            {{ notApplicableReason(s) }}
          </span>
        </template>
      </div>
    </div>

    <!--
      Actions group: command buttons (not toggles) for bind/event-driven workflows.
      Reset clears paramValues back to derived defaults so authors can re-explore
      bind edits from a known state. Replay projects the most recent valid captured
      event into runtime outputs so authors can iterate on event projections without
      re-clicking through the renderer. Both render as outlined shadcn-vue buttons
      with leading icons so the action shape stays visible — including the disabled
      state — instead of fading into adjacent toggle-button text.
    -->
    <div class="flex items-center gap-2 flex-wrap gap-y-2" role="group" aria-label="Actions">
      <span
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5 select-none"
        aria-hidden="true"
      >
        Actions
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="!props.canReset"
        :aria-disabled="!props.canReset"
        :class="
          !props.canReset
            ? 'opacity-45 bg-muted/30 text-muted-foreground border-border/60 cursor-not-allowed'
            : ''
        "
        data-testid="preview-controls-reset"
        @click="emit('reset-param-values')"
      >
        <Icon icon="lucide:rotate-ccw" aria-hidden="true" />
        Reset bind state
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="!props.canReplay"
        :aria-disabled="!props.canReplay"
        :title="
          !props.canReplay ? 'Available after the first valid component event fires' : undefined
        "
        :class="
          !props.canReplay
            ? 'opacity-45 bg-muted/30 text-muted-foreground border-border/60 cursor-not-allowed'
            : ''
        "
        data-testid="preview-controls-replay"
        @click="emit('replay-last-event')"
      >
        <Icon icon="lucide:play" aria-hidden="true" />
        Replay last event
      </Button>
    </div>
  </div>
</template>
