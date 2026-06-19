<script setup lang="ts">
import { computed } from "vue";

import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import {
  NewsnightMastheadConfigDefaults,
  type NewsnightMastheadConfig,
} from "./types";

const props = defineProps<StaticComponentRenderProps<NewsnightMastheadConfig>>();

const config = computed(() => ({ ...NewsnightMastheadConfigDefaults, ...props.config }));

const tickerItems = computed(() =>
  config.value.ticker
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean),
);

const modeClass = computed(() => {
  if (config.value.mode === "air") return "border-ct-destructive/60 bg-ct-destructive/15";
  if (config.value.mode === "standby") return "border-amber-400/50 bg-amber-400/10";
  return "border-cyan-300/50 bg-cyan-300/10";
});
</script>

<template>
  <section
    class="w-full overflow-hidden rounded-md border border-white/10 bg-zinc-950 text-ct-foreground shadow-2xl"
    data-testid="newsnight-masthead"
  >
    <div class="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
      <div class="flex min-w-0 items-center gap-4">
        <div
          class="grid size-10 shrink-0 place-items-center rounded-sm bg-white text-[10px] font-black leading-none tracking-tighter text-zinc-950"
          aria-hidden="true"
        >
          NN
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-3">
            <p class="truncate text-xl font-black uppercase tracking-wide text-white">{{ config.brand }}</p>
            <span class="rounded-sm bg-ct-destructive px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
              Live
            </span>
          </div>
          <p class="truncate text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {{ config.edition }}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 text-xs">
        <div class="rounded border border-white/10 bg-white/5 px-3 py-2 text-right">
          <p class="font-mono text-sm font-semibold text-white">{{ config.timestamp }}</p>
          <p class="text-[10px] uppercase tracking-wider text-zinc-500">Control clock</p>
        </div>
        <div :class="['rounded border px-3 py-2 text-right', modeClass]">
          <p class="font-black uppercase tracking-wide text-white">{{ config.mode }}</p>
          <p class="text-[10px] uppercase tracking-wider text-zinc-400">Mode</p>
        </div>
      </div>
    </div>

    <div class="grid gap-0 border-b border-white/10 bg-white/[0.03] text-xs md:grid-cols-[1fr_auto]">
      <div class="flex min-w-0 items-center gap-3 overflow-hidden px-5 py-2">
        <span class="shrink-0 font-black uppercase tracking-widest text-ct-destructive">Breaking</span>
        <div class="flex min-w-0 items-center gap-5 overflow-hidden whitespace-nowrap">
          <span
            v-for="item in tickerItems"
            :key="item"
            class="min-w-0 text-zinc-200 after:ml-5 after:text-zinc-600 after:content-['/']"
          >
            {{ item }}
          </span>
        </div>
      </div>
      <div class="border-t border-white/10 px-5 py-2 text-zinc-400 md:border-t-0 md:border-l">
        {{ config.freshness }}
      </div>
    </div>
  </section>
</template>
