export interface ActivationKeyboardEvent {
  readonly key: string;
}

export interface ArrowNavigationOptions {
  orientation?: "horizontal" | "vertical" | "both";
  wrap?: boolean;
}

export interface AriaLabelOptions {
  kind: "datum" | "slice" | "cell" | "region" | "graph" | "geo";
  label?: string;
  value?: number | string | null;
  seriesName?: string;
  rowLabel?: string;
  columnLabel?: string;
  index?: number;
  total?: number;
}

// Keep the legacy "Spacebar" key alias for older event shims and fixtures.
const activationKeys = new Set(["Enter", " ", "Spacebar"]);

export function isActivationKey(event: ActivationKeyboardEvent): boolean {
  return activationKeys.has(event.key);
}

export function getNextArrowNavigationIndex(
  currentIndex: number,
  itemCount: number,
  key: string,
  options: ArrowNavigationOptions = {},
): number {
  if (itemCount <= 0) return -1;

  const orientation = options.orientation ?? "both";
  const delta = getArrowDelta(key, orientation);
  if (delta === 0) return clampIndex(currentIndex, itemCount);

  const nextIndex = clampIndex(currentIndex, itemCount) + delta;
  if (options.wrap) return (nextIndex + itemCount) % itemCount;
  return Math.min(Math.max(nextIndex, 0), itemCount - 1);
}

export function createInteractiveKey(prefix: string, parts: readonly unknown[]): string {
  const segments = [prefix ? normalizeKeyPart(prefix) : "", ...parts.map(normalizeKeyPart)].filter(
    Boolean,
  );
  return segments.join("-");
}

export function createAriaLabel(options: AriaLabelOptions): string {
  const noun = labelNounForKind(options.kind);
  const parts = [options.label || noun];

  if (options.seriesName) parts.push(`series ${options.seriesName}`);
  if (options.rowLabel || options.columnLabel) {
    parts.push(`row ${options.rowLabel ?? "unknown"}`);
    parts.push(`column ${options.columnLabel ?? "unknown"}`);
  }
  if (options.value !== undefined && options.value !== null) parts.push(`value ${options.value}`);
  if (options.index !== undefined && options.total !== undefined) {
    parts.push(`${options.index + 1} of ${options.total}`);
  }

  return parts.join(", ");
}

function getArrowDelta(
  key: string,
  orientation: NonNullable<ArrowNavigationOptions["orientation"]>,
) {
  if (orientation !== "vertical") {
    if (key === "ArrowRight") return 1;
    if (key === "ArrowLeft") return -1;
  }
  if (orientation !== "horizontal") {
    if (key === "ArrowDown") return 1;
    if (key === "ArrowUp") return -1;
  }
  return 0;
}

function clampIndex(index: number, itemCount: number): number {
  if (!Number.isInteger(index)) return 0;
  return Math.min(Math.max(index, 0), itemCount - 1);
}

function normalizeKeyPart(part: unknown): string {
  if (part === null || part === undefined || part === "") return "none";
  return (
    String(part)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "none"
  );
}

function labelNounForKind(kind: AriaLabelOptions["kind"]): string {
  switch (kind) {
    case "slice":
      return "Slice";
    case "cell":
      return "Cell";
    case "region":
      return "Region";
    case "graph":
      return "Graph item";
    case "geo":
      return "Geographic point";
    case "datum":
    default:
      return "Datum";
  }
}
