// Package-owned class-name helper for component-ui primitives. Mirrors the
// shadcn-vue `cn` utility so package primitives never reach into the host app's
// `@/lib/utils`.

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
