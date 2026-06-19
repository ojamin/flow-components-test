<script setup lang="ts">
import { computed } from "vue";

import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import {
  NewsnightLowerThirdConfigDefaults,
  type NewsnightLowerThirdConfig,
} from "./types";

const props = defineProps<StaticComponentRenderProps<NewsnightLowerThirdConfig>>();

const config = computed(() => ({ ...NewsnightLowerThirdConfigDefaults, ...props.config }));

const toneClass = computed(() => {
  if (config.value.tone === "breaking") return "from-red-600 via-red-500 to-zinc-950";
  if (config.value.tone === "projected") return "from-cyan-500 via-blue-500 to-zinc-950";
  if (config.value.tone === "hold") return "from-amber-500 via-red-500 to-zinc-950";
  return "from-zinc-700 via-zinc-800 to-zinc-950";
});
</script>

<template>
  <section
    class="w-full rounded-md border border-white/10 bg-zinc-950 p-3 text-ct-foreground shadow-2xl"
    data-testid="newsnight-lower-third"
  >
    <div class="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-zinc-400">
      <span>Lower-third preview</span>
      <span class="rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-zinc-300">Program bus / safe area</span>
    </div>
    <div class="overflow-hidden rounded border border-white/15 bg-black">
      <div :class="['h-1.5 bg-gradient-to-r', toneClass]" />
      <div class="grid gap-0 md:grid-cols-[12rem_1fr_8rem]">
        <div class="flex items-center justify-center bg-white px-4 py-4 text-zinc-950">
          <div class="text-center">
            <p class="text-xl font-black tracking-tight">NEWSNIGHT</p>
            <p class="text-[10px] font-black uppercase tracking-[0.28em]">Live</p>
          </div>
        </div>
        <div class="min-w-0 bg-zinc-900 px-5 py-4">
          <p class="truncate text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">{{ config.eyebrow }}</p>
          <h3 class="mt-1 truncate text-2xl font-black leading-tight text-white">{{ config.headline }}</h3>
          <p class="mt-1 truncate text-sm font-medium text-zinc-300">{{ config.subline }}</p>
        </div>
        <div class="flex flex-col items-center justify-center border-t border-white/10 bg-zinc-950 px-3 py-4 text-center md:border-l md:border-t-0">
          <p class="font-mono text-lg font-black text-white">A-12</p>
          <p class="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Armed</p>
        </div>
      </div>
    </div>
  </section>
</template>
