<script setup lang="ts">
import { computed } from "vue";

import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import {
  NewsnightResultsWallConfigDefaults,
  type NewsnightResultsWallConfig,
} from "./types";

const props = defineProps<StaticComponentRenderProps<NewsnightResultsWallConfig>>();

const config = computed(() => ({ ...NewsnightResultsWallConfigDefaults, ...props.config }));

const totalVotes = computed(() => config.value.candidateAVotes + config.value.candidateBVotes);
const candidateAPercent = computed(() =>
  totalVotes.value > 0 ? Math.round((config.value.candidateAVotes / totalVotes.value) * 1000) / 10 : 0,
);
const candidateBPercent = computed(() => Math.round((100 - candidateAPercent.value) * 10) / 10);
const voteMargin = computed(() => Math.abs(config.value.candidateAVotes - config.value.candidateBVotes));
const candidateAWidthClass = computed(() => widthClass(candidateAPercent.value));
const candidateBWidthClass = computed(() => widthClass(candidateBPercent.value));

const counties = [
  ["Denver", "D +42", "bg-cyan-400/75", "col-span-2"],
  ["Boulder", "D +36", "bg-cyan-300/65", ""],
  ["Larimer", "D +9", "bg-cyan-200/55", ""],
  ["Weld", "R +18", "bg-red-400/65", ""],
  ["Mesa", "R +25", "bg-red-500/70", ""],
  ["Jefferson", "D +7", "bg-violet-300/70", "col-span-2"],
  ["Arapahoe", "D +14", "bg-cyan-300/70", ""],
  ["El Paso", "R +21", "bg-red-400/70", "row-span-2"],
  ["Pueblo", "D +3", "bg-violet-300/55", ""],
  ["Adams", "D +17", "bg-cyan-300/65", ""],
  ["Douglas", "R +16", "bg-red-300/65", ""],
  ["La Plata", "D +12", "bg-cyan-300/60", ""],
  ["Garfield", "R +8", "bg-red-300/55", ""],
] as const;

const keyRaces = [
  ["CO-03", "Mesa batch expected", "Lean R", "text-red-300"],
  ["AG", "Denver provisionals pending", "Toss-up", "text-amber-200"],
  ["Prop 118", "Urban vote overperforming", "Lean Yes", "text-cyan-200"],
  ["Senate", "Projected hold", "Likely D", "text-cyan-200"],
] as const;

const pipeline = [
  ["County intake", "98%", "bg-cyan-300", "w-[98%]"],
  ["Validation", "82%", "bg-violet-300", "w-[82%]"],
  ["Graphics QA", "71%", "bg-amber-300", "w-[71%]"],
  ["Ready to air", "64%", "bg-emerald-300", "w-[64%]"],
] as const;

function widthClass(percent: number) {
  if (percent >= 60) return "w-[60%]";
  if (percent >= 58) return "w-[58%]";
  if (percent >= 56) return "w-[56%]";
  if (percent >= 54) return "w-[54%]";
  if (percent >= 52) return "w-[52%]";
  if (percent >= 50) return "w-[50%]";
  if (percent >= 48) return "w-[48%]";
  if (percent >= 46) return "w-[46%]";
  if (percent >= 44) return "w-[44%]";
  if (percent >= 42) return "w-[42%]";
  return "w-[40%]";
}
</script>

<template>
  <section
    class="w-full overflow-hidden rounded-md border border-white/10 bg-zinc-950 text-ct-foreground shadow-2xl"
    data-testid="newsnight-results-wall"
  >
    <div class="grid gap-px bg-white/10 lg:grid-cols-[29%_46%_25%]">
      <div class="bg-zinc-950 p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Race call desk</p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-white">{{ config.raceTitle }}</h2>
          </div>
          <span class="rounded-sm border border-amber-300/50 bg-amber-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-100">
            {{ config.raceStatus }}
          </span>
        </div>

        <div class="space-y-4">
          <div>
            <div class="mb-1 flex items-end justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-white">{{ config.candidateA }}</p>
                <p class="text-[11px] uppercase tracking-wider text-zinc-500">Democratic</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-lg font-black text-white">{{ candidateAPercent }}%</p>
                <p class="font-mono text-xs text-zinc-400">{{ config.candidateAVotes.toLocaleString() }}</p>
              </div>
            </div>
            <div class="h-3 overflow-hidden rounded-sm bg-white/10">
              <div :class="['h-full rounded-sm bg-cyan-400', candidateAWidthClass]" />
            </div>
          </div>

          <div>
            <div class="mb-1 flex items-end justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-white">{{ config.candidateB }}</p>
                <p class="text-[11px] uppercase tracking-wider text-zinc-500">Republican</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-lg font-black text-white">{{ candidateBPercent }}%</p>
                <p class="font-mono text-xs text-zinc-400">{{ config.candidateBVotes.toLocaleString() }}</p>
              </div>
            </div>
            <div class="h-3 overflow-hidden rounded-sm bg-white/10">
              <div :class="['h-full rounded-sm bg-red-500', candidateBWidthClass]" />
            </div>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded border border-white/10 bg-white/10 text-center">
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-xl font-black text-white">{{ config.precinctsReporting }}%</p>
            <p class="text-[10px] uppercase tracking-wider text-zinc-500">Reporting</p>
          </div>
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-xl font-black text-white">{{ voteMargin.toLocaleString() }}</p>
            <p class="text-[10px] uppercase tracking-wider text-zinc-500">Margin</p>
          </div>
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-xl font-black text-amber-200">0.62</p>
            <p class="text-[10px] uppercase tracking-wider text-zinc-500">Call index</p>
          </div>
        </div>

        <div class="mt-4 border-t border-white/10 pt-4">
          <p class="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-400">Producer notes</p>
          <p class="text-sm leading-5 text-zinc-300">
            Hold call until Denver batch 11 and Pueblo verification clear. Lower-third package staged but not armed.
          </p>
        </div>
      </div>

      <div class="bg-zinc-900 p-4">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Results wall</p>
            <h3 class="text-lg font-black text-white">Colorado county map</h3>
          </div>
          <div class="rounded border border-white/10 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-widest text-zinc-300">
            64 counties / live
          </div>
        </div>

        <div class="relative min-h-[22rem] overflow-hidden rounded border border-white/10 bg-slate-950 p-4">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_72%_65%,rgba(239,68,68,0.18),transparent_30%)]" />
          <div class="relative grid h-full grid-cols-5 gap-2">
            <div
              v-for="[county, margin, colorClass, spanClass] in counties"
              :key="county"
              :class="[
                'flex min-h-16 flex-col justify-between rounded-sm border border-white/20 p-2 text-xs shadow-lg',
                colorClass,
                spanClass,
                county === config.selectedCounty ? 'ring-2 ring-white' : '',
              ]"
            >
              <span class="font-black text-slate-950">{{ county }}</span>
              <span class="font-mono font-black text-slate-950">{{ margin }}</span>
            </div>
          </div>
          <div class="absolute bottom-4 left-4 rounded border border-white/10 bg-black/60 px-3 py-2 text-xs text-zinc-200">
            Selected: <span class="font-bold text-white">{{ config.selectedCounty }}</span>
          </div>
          <div class="absolute bottom-4 right-4 flex gap-2 text-[10px] uppercase tracking-wider text-zinc-300">
            <span class="inline-flex items-center gap-1"><i class="size-2 rounded-full bg-cyan-300" /> Vega</span>
            <span class="inline-flex items-center gap-1"><i class="size-2 rounded-full bg-red-400" /> Cross</span>
            <span class="inline-flex items-center gap-1"><i class="size-2 rounded-full bg-violet-300" /> Close</span>
          </div>
        </div>

        <div class="mt-4 grid gap-px overflow-hidden rounded border border-white/10 bg-white/10 md:grid-cols-4">
          <div v-for="[label, value, colorClass, widthClassName] in pipeline" :key="label" class="bg-zinc-950 p-3">
            <div class="mb-2 flex items-center justify-between text-xs">
              <span class="text-zinc-400">{{ label }}</span>
              <span class="font-mono font-bold text-white">{{ value }}</span>
            </div>
            <div class="h-1.5 rounded bg-white/10">
              <div :class="['h-full rounded', colorClass, widthClassName]" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-zinc-950 p-4">
        <p class="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Newsroom rail</p>
        <div class="space-y-3">
          <div v-for="[race, detail, status, toneClass] in keyRaces" :key="race" class="border-b border-white/10 pb-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-black text-white">{{ race }}</p>
                <p class="mt-1 text-xs text-zinc-400">{{ detail }}</p>
              </div>
              <span :class="['shrink-0 text-xs font-black uppercase', toneClass]">{{ status }}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded border border-ct-destructive/40 bg-ct-destructive/10 p-3">
          <p class="text-xs font-black uppercase tracking-widest text-red-200">Verification required</p>
          <p class="mt-2 text-sm leading-5 text-zinc-200">Pueblo 14 provisional batch variance exceeds newsroom threshold.</p>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded border border-white/10 bg-white/10 text-xs">
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-lg font-black text-white">312</p>
            <p class="uppercase tracking-wider text-zinc-500">Feeds</p>
          </div>
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-lg font-black text-amber-200">7</p>
            <p class="uppercase tracking-wider text-zinc-500">Flags</p>
          </div>
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-lg font-black text-cyan-200">18</p>
            <p class="uppercase tracking-wider text-zinc-500">Live shots</p>
          </div>
          <div class="bg-white/[0.04] p-3">
            <p class="font-mono text-lg font-black text-emerald-200">94%</p>
            <p class="uppercase tracking-wider text-zinc-500">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
