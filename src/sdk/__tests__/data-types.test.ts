import { describe, expect, it } from "vitest";

import {
  dataTypeDefinitions,
  dataTypeDefinitionsById,
  dataTypeIds,
  getDataTypeDefinition,
  getDataTypeSchema,
  isDataTypeCompatible,
  isKnownDataTypeId,
  parseDataTypeValue,
  safeParseDataTypeValue,
  shapePortOutputs,
  type DataTypeId,
} from "../public-sdk";

const expectedDataTypeIds = [
  "all-data",
  "json-object",
  "json-array",
  "primitive",
  "text-value",
  "url-string",
  "event-timestamp",
  "table-rows",
  "key-value-object",
  "chart-series-xy",
  "chart-slices",
  "chart-cartesian-point",
  "chart-donut-slice",
  "chart-range",
  "chart-legend-state",
  "chart-matrix-cell",
  "geo-point",
  "graph-node",
  "graph-edge",
  "component-theme",
  "fetch-meta",
  "vmap1.style-descriptor",
  "vmap1.tile-source-descriptor",
  "vmap1.pmtiles-source-descriptor",
  "vmap1.terrain-descriptor",
  "vmap1.dataset-descriptor",
  "vmap1.dataset-status",
  "vmap1.resolved-dataset",
  "vmap1.dataset-registry",
  "vmap1.source-registry",
  "vmap1.layer-descriptor",
  "vmap1.deck-layer-descriptor",
  "vmap1.initial-view",
] as const satisfies readonly DataTypeId[];

const validComponentTheme = {
  version: 1,
  id: "midnight",
  displayName: "Midnight",
  description: "High contrast theme for low-light authoring.",
  properties: {
    color: {
      pageBackground: "#020617",
      surface: "#0f172a",
      surfaceMuted: "#1e293b",
      foreground: "#f8fafc",
      foregroundMuted: "#cbd5e1",
      border: "#334155",
      accent: "#38bdf8",
      accentForeground: "#082f49",
      focusRing: "#7dd3fc",
      destructive: "#f87171",
      warning: "#fbbf24",
      info: "#60a5fa",
      success: "#22c55e",
      chart1: "#38bdf8",
      chart2: "#a78bfa",
      chart3: "#34d399",
      chart4: "#f472b6",
      chart5: "#facc15",
    },
    font: {
      body: "Inter",
      heading: "Inter Tight",
      mono: "JetBrains Mono",
    },
    radius: {
      none: "0px",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
    },
    spacing: {
      none: "0px",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "1rem",
      xl: "1.5rem",
    },
    motion: {
      durationFastMs: 120,
      durationNormalMs: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  },
};

const nonFiniteNumbers = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN];

const validVmap1TileSource = {
  kind: "vmap1-tile-source",
  version: 1,
  id: "osm",
  sourceType: "vector",
  url: "https://example.com/tiles.json",
  tileSize: 512,
  bounds: [-180, -85, 180, 85],
  attribution: ["Example tiles"],
};

const validVmap1PmtilesSource = {
  kind: "vmap1-pmtiles-source",
  version: 1,
  id: "archive",
  url: "https://example.com/world.pmtiles",
  pmtilesType: "vector",
};

const validVmap1ResolvedDataset = {
  kind: "vmap1-resolved-dataset",
  version: 1,
  id: "places",
  geojson: { type: "FeatureCollection", features: [] },
  featureCount: 0,
};

const validVmap1Dataset = {
  kind: "vmap1-dataset",
  version: 1,
  id: "places",
  label: "Places",
  source: { mode: "geojson-url", url: "https://example.com/places.geojson" },
  status: { state: "ready", loadedAt: "2026-05-08T12:00:00.000Z", featureCount: 0 },
  resolved: validVmap1ResolvedDataset,
};

const validVmap1Terrain = {
  kind: "vmap1-terrain-source",
  version: 1,
  id: "terrain",
  sourceRef: "archive",
  exaggeration: 1.5,
  hillshade: true,
};

const validVmap1LayerBase = {
  kind: "vmap1-layer",
  version: 1,
  sourceRef: "places",
  visible: true,
};

function expectParses(typeId: DataTypeId, value: unknown): void {
  expect(getDataTypeSchema(typeId)?.safeParse(value).success, `${typeId} should parse`).toBe(true);
}

function expectRejects(typeId: DataTypeId, value: unknown): void {
  expect(getDataTypeSchema(typeId)?.safeParse(value).success, `${typeId} should reject`).toBe(
    false,
  );
}

describe("SDK data type registry", () => {
  it("exports the current canonical data type ids and lookup helpers", () => {
    expect(dataTypeIds).toEqual(expectedDataTypeIds);
    expect(dataTypeDefinitions.map((definition) => definition.id)).toEqual(expectedDataTypeIds);
    expect([...dataTypeDefinitionsById.keys()]).toEqual(expectedDataTypeIds);

    for (const definition of dataTypeDefinitions) {
      expect(dataTypeDefinitionsById.get(definition.id)).toBe(definition);
      expect(getDataTypeDefinition(definition.id)).toBe(definition);
      expect(getDataTypeSchema(definition.id)).toBe(definition.schema);
      expect(isKnownDataTypeId(definition.id)).toBe(true);
    }

    expect(getDataTypeDefinition("unknown-type")).toBeUndefined();
    expect(getDataTypeSchema("unknown-type")).toBeUndefined();
    expect(isKnownDataTypeId("unknown-type")).toBe(false);
    expect(getDataTypeDefinition("site-theme")).toBeUndefined();
    expect(isKnownDataTypeId("site-theme")).toBe(false);
  });

  it("preserves conservative data type compatibility", () => {
    expect(isDataTypeCompatible("json-object", "json-object")).toBe(true);
    expect(isDataTypeCompatible("json-object", "json-array")).toBe(false);
    expect(
      isDataTypeCompatible("json-object", "json-array", {
        acceptedSourceTypeIds: ["json-object"],
      }),
    ).toBe(true);
    expect(
      isDataTypeCompatible("chart-slices", "json-array", {
        acceptedSourceTypeIds: ["all-data"],
      }),
    ).toBe(true);
    expect(
      isDataTypeCompatible("unknown-type", "json-array", {
        acceptedSourceTypeIds: ["all-data"],
      }),
    ).toBe(false);
    expect(
      isDataTypeCompatible("vmap1.dataset-descriptor", "vmap1.source-registry", {
        acceptedSourceTypeIds: ["vmap1.dataset-descriptor", "vmap1.dataset-registry"],
      }),
    ).toBe(true);
    expect(
      isDataTypeCompatible("vmap1.resolved-dataset", "vmap1.dataset-registry", {
        acceptedSourceTypeIds: ["vmap1.resolved-dataset"],
      }),
    ).toBe(true);
    expect(isDataTypeCompatible("vmap1.layer-descriptor", "vmap1.deck-layer-descriptor")).toBe(
      false,
    );
  });
});

describe("SDK data type schema parity", () => {
  it("covers valid and invalid samples for every canonical type", () => {
    const cases: Array<{ typeId: DataTypeId; valid: unknown[]; invalid: unknown[] }> = [
      {
        typeId: "all-data",
        valid: [null, "text", true, 42, ["nested", { count: 1 }], { rows: [{ id: "a" }] }],
        invalid: [undefined, () => undefined, ...nonFiniteNumbers],
      },
      {
        typeId: "json-object",
        valid: [{}, { nested: { values: ["a", 1, false, null] } }],
        invalid: [null, [], "text", { missing: undefined }, { bad: Number.POSITIVE_INFINITY }],
      },
      {
        typeId: "json-array",
        valid: [[], ["a", 1, false, null, { nested: [] }]],
        invalid: [null, {}, "text", [undefined], [Number.NEGATIVE_INFINITY]],
      },
      {
        typeId: "primitive",
        valid: ["text", 1, true, false, null],
        invalid: [{}, [], undefined, ...nonFiniteNumbers],
      },
      {
        typeId: "text-value",
        valid: ["", "plain text"],
        invalid: [1, true, null, {}, []],
      },
      {
        typeId: "url-string",
        valid: ["https://example.com/path?query=1", "http://localhost:5173"],
        invalid: ["", "not a url", "/relative", 1, null],
      },
      {
        typeId: "event-timestamp",
        valid: ["2026-04-29T12:34:56.000Z", "2026-04-29T12:34:56Z"],
        invalid: ["", "not-a-date", 123, null],
      },
      {
        typeId: "table-rows",
        valid: [[], [{ id: "a", count: 1 }, { nested: { ok: true } }]],
        invalid: [{ id: "a" }, [1], [{ bad: undefined }], [{ bad: Number.NaN }]],
      },
      {
        typeId: "key-value-object",
        valid: [{}, { title: "Hello", nested: { count: 2 } }],
        invalid: [[], null, "text", { bad: undefined }, { bad: Number.NaN }],
      },
      {
        typeId: "chart-series-xy",
        valid: [
          [],
          [
            { x: "Jan", y: 10 },
            { x: 2, y: 20, xLabel: "February" },
            { x: "Mar", y: 30, xLabel: null },
          ],
        ],
        invalid: [
          [{ name: "Series", points: [{ x: "Jan", y: 1 }] }],
          [{ x: true, y: 1 }],
          [{ x: "Jan", y: "1" }],
          [{ x: Number.POSITIVE_INFINITY, y: 1 }],
          [{ x: "Jan", y: Number.NEGATIVE_INFINITY }],
          [{ x: "Jan", y: Number.NaN }],
          [{ x: "Jan", y: 1, xLabel: 2 }],
        ],
      },
      {
        typeId: "chart-slices",
        valid: [[], [{ label: "North", value: 1 }]],
        invalid: [
          [{ label: "", value: 1 }],
          [{ label: "North", value: "1" }],
          [{ label: "North", value: Number.POSITIVE_INFINITY }],
          [{ label: "North", value: Number.NaN }],
        ],
      },
      {
        typeId: "chart-cartesian-point",
        valid: [
          { x: "Jan", y: 10 },
          { x: 2, y: 4.5, seriesName: "Revenue" },
        ],
        invalid: [
          { x: true, y: 1 },
          { x: "Jan", y: "1" },
          { x: "Jan" },
          { y: 1 },
          { x: Number.POSITIVE_INFINITY, y: 1 },
          { x: "Jan", y: Number.NEGATIVE_INFINITY },
          { x: "Jan", y: Number.NaN },
          { x: "Jan", y: 1, seriesName: 2 },
        ],
      },
      {
        typeId: "chart-donut-slice",
        valid: [
          { label: "North", value: 1 },
          { label: "", value: 0 },
        ],
        invalid: [
          { label: 1, value: 1 },
          { label: "North", value: "1" },
          { label: "North" },
          { value: 1 },
          { label: "North", value: Number.POSITIVE_INFINITY },
          { label: "North", value: Number.NaN },
        ],
      },
      {
        typeId: "chart-range",
        valid: [
          { x0: 0, x1: 10 },
          { x0: -4.5, x1: 4.5 },
        ],
        invalid: [
          { x0: "0", x1: 10 },
          { x0: 0, x1: "10" },
          { x0: 0 },
          { x1: 10 },
          { x0: Number.POSITIVE_INFINITY, x1: 10 },
          { x0: 0, x1: Number.NaN },
        ],
      },
      {
        typeId: "chart-legend-state",
        valid: [
          { seriesName: "Revenue", visible: true },
          { seriesName: "", visible: false },
        ],
        invalid: [
          { seriesName: 1, visible: true },
          { seriesName: "Revenue", visible: "true" },
          { seriesName: "Revenue" },
          { visible: true },
        ],
      },
      {
        typeId: "chart-matrix-cell",
        valid: [
          { rowKey: "north", columnKey: "q1", rowIndex: 0, columnIndex: 1, value: 25 },
          {
            rowKey: "south",
            columnKey: "q2",
            rowIndex: 2,
            columnIndex: 3,
            value: -4.5,
            rowLabel: "South",
            columnLabel: "Q2",
            source: { id: "raw-1" },
          },
        ],
        invalid: [
          { rowKey: "north", columnKey: "q1", rowIndex: -1, columnIndex: 1, value: 25 },
          { rowKey: "north", columnKey: "q1", rowIndex: 0.5, columnIndex: 1, value: 25 },
          { rowKey: "north", columnKey: "q1", rowIndex: 0, value: 25 },
          { rowKey: "north", columnKey: "q1", rowIndex: 0, columnIndex: 1, value: "25" },
          { rowKey: "north", columnKey: "q1", rowIndex: 0, columnIndex: 1, value: Number.NaN },
          {
            rowKey: "north",
            columnKey: "q1",
            rowIndex: 0,
            columnIndex: 1,
            value: 25,
            source: { bad: undefined },
          },
        ],
      },
      {
        typeId: "geo-point",
        valid: [
          { lat: 51.5, lon: -0.12 },
          {
            lat: -90,
            lon: 180,
            id: "london",
            label: "London",
            value: 12,
            source: { city: "London" },
          },
        ],
        invalid: [
          { lat: 91, lon: 0 },
          { lat: 0, lon: -181 },
          { lat: "51.5", lon: -0.12 },
          { lon: -0.12 },
          { lat: Number.NaN, lon: 0 },
          { lat: 0, lon: Number.POSITIVE_INFINITY },
          { lat: 0, lon: 0, value: Number.NEGATIVE_INFINITY },
          { lat: 0, lon: 0, source: { bad: undefined } },
        ],
      },
      {
        typeId: "graph-node",
        valid: [
          { id: "a" },
          { id: "b", label: "Beta", group: "Team", value: 3, source: { rawId: "b" } },
        ],
        invalid: [
          { id: "" },
          { label: "Missing id" },
          { id: 1 },
          { id: "a", value: Number.NaN },
          { id: "a", group: 2 },
          { id: "a", source: { bad: undefined } },
        ],
      },
      {
        typeId: "graph-edge",
        valid: [
          { source: "a", target: "b" },
          {
            source: "a",
            target: "b",
            id: "a-b",
            label: "A to B",
            value: 2,
            sourceData: { rawId: "e1" },
          },
        ],
        invalid: [
          { source: "", target: "b" },
          { source: "a", target: "" },
          { source: "a" },
          { target: "b" },
          { source: "a", target: "b", value: Number.POSITIVE_INFINITY },
          { source: "a", target: "b", sourceData: { bad: undefined } },
        ],
      },
      {
        typeId: "component-theme",
        valid: [
          validComponentTheme,
          { themeId: "default", properties: validComponentTheme.properties },
          { properties: validComponentTheme.properties },
        ],
        invalid: [
          { ...validComponentTheme, version: 2 },
          { ...validComponentTheme, id: "Midnight" },
          { ...validComponentTheme, displayName: "" },
          { themeId: "Default", properties: validComponentTheme.properties },
          { themeId: "default", properties: validComponentTheme.properties, extra: true },
          { themeId: "default" },
          {
            ...validComponentTheme,
            properties: {
              ...validComponentTheme.properties,
              color: { ...validComponentTheme.properties.color, accent: "" },
            },
          },
          {
            ...validComponentTheme,
            properties: {
              ...validComponentTheme.properties,
              color: { ...validComponentTheme.properties.color, siteBackground: "#000" },
            },
          },
          {
            ...validComponentTheme,
            properties: {
              ...validComponentTheme.properties,
              motion: { ...validComponentTheme.properties.motion, durationFastMs: Number.NaN },
            },
          },
          {
            ...validComponentTheme,
            properties: {
              ...validComponentTheme.properties,
              motion: { ...validComponentTheme.properties.motion, durationFastMs: -1 },
            },
          },
        ],
      },
      {
        typeId: "fetch-meta",
        valid: [
          { kind: "manual" },
          { kind: "remote", status: "idle" },
          { kind: "remote", status: "failure", fetchedAt: "2026-04-29T12:34:56.000Z" },
          { kind: "remote", status: "loading", fetchedAt: "2026-04-29" },
          { kind: "remote", status: "stale-cache" },
          { kind: "remote", status: "success" },
          {
            kind: "remote",
            status: "error",
            error: {
              category: "http-status",
              message: "Request failed with 500 Internal Server Error.",
              status: 500,
              details: "Server returned a non-JSON response body: temporary outage",
            },
          },
          ...[
            "timeout",
            "fetch-failure",
            "invalid-url",
            "invalid-json",
            "export-policy-failure",
          ].map((category) => ({
            kind: "remote" as const,
            status: "error" as const,
            error: {
              category,
              message: `HTTP request ${category} error.`,
              details: "Structured runtime error category from data.http-request.",
            },
          })),
        ],
        invalid: [
          {},
          { kind: "local" },
          { kind: "manual", status: "pending" },
          { kind: "remote", fetchedAt: "not-a-date" },
          { kind: "remote", fetchedAt: 123 },
        ],
      },
      {
        typeId: "vmap1.style-descriptor",
        valid: [
          { kind: "vmap1-style", version: 1, id: "blank", mode: "preset", preset: "blank" },
          {
            kind: "vmap1-style",
            version: 1,
            id: "inline",
            mode: "inline",
            styleJson: { version: 8, sources: {}, layers: [] },
            diagnostics: [{ code: "style-note", severity: "info", message: "Using inline style" }],
          },
        ],
        invalid: [
          { version: 1, id: "blank", mode: "preset" },
          { kind: "vmap1-style", version: 2, id: "blank", mode: "preset" },
          { kind: "vmap1-style", version: 1, id: "", mode: "preset" },
          { kind: "vmap1-style", version: 1, id: "blank", mode: "custom" },
          { kind: "vmap1-style", version: 1, id: "inline", mode: "inline", styleJson: Number.NaN },
        ],
      },
      {
        typeId: "vmap1.tile-source-descriptor",
        valid: [validVmap1TileSource],
        invalid: [
          { ...validVmap1TileSource, kind: "vmap1-source" },
          { ...validVmap1TileSource, version: 2 },
          { ...validVmap1TileSource, id: "" },
          { ...validVmap1TileSource, sourceType: "geojson" },
          { ...validVmap1TileSource, tileSize: 1024 },
          { ...validVmap1TileSource, bounds: [-180, -85, 180] },
        ],
      },
      {
        typeId: "vmap1.pmtiles-source-descriptor",
        valid: [validVmap1PmtilesSource],
        invalid: [
          { ...validVmap1PmtilesSource, kind: "vmap1-tile-source" },
          { ...validVmap1PmtilesSource, id: "" },
          { ...validVmap1PmtilesSource, pmtilesType: "terrain" },
          { ...validVmap1PmtilesSource, url: "" },
        ],
      },
      {
        typeId: "vmap1.terrain-descriptor",
        valid: [validVmap1Terrain],
        invalid: [
          { ...validVmap1Terrain, kind: "vmap1-terrain" },
          { ...validVmap1Terrain, sourceRef: "" },
          { ...validVmap1Terrain, exaggeration: Number.NaN },
          { ...validVmap1Terrain, hillshade: "true" },
        ],
      },
      {
        typeId: "vmap1.dataset-descriptor",
        valid: [
          validVmap1Dataset,
          {
            kind: "vmap1-dataset",
            version: 1,
            id: "bound-rows",
            source: {
              mode: "binding",
              bindingPath: "root.rows",
              mapping: { longitudeField: "lon", latitudeField: "lat" },
            },
            status: { state: "idle" },
          },
        ],
        invalid: [
          { ...validVmap1Dataset, kind: "vmap1-data" },
          { ...validVmap1Dataset, id: "" },
          { ...validVmap1Dataset, source: { mode: "geojson-url", url: "" } },
          { ...validVmap1Dataset, status: { state: "ready", loadedAt: "not-a-date" } },
          { ...validVmap1Dataset, resolved: { ...validVmap1ResolvedDataset, featureCount: -1 } },
        ],
      },
      {
        typeId: "vmap1.dataset-status",
        valid: [
          { state: "idle" },
          { state: "loading", startedAt: "2026-05-08T12:00:00.000Z" },
          { state: "ready", loadedAt: "2026-05-08T12:00:00.000Z", featureCount: 3 },
          { state: "error", message: "Fetch failed", loadedAt: "2026-05-08T12:00:00.000Z" },
        ],
        invalid: [
          {},
          { state: "pending" },
          { state: "loading", startedAt: "not-a-date" },
          { state: "ready", loadedAt: "2026-05-08T12:00:00.000Z", featureCount: -1 },
          { state: "error", message: "" },
        ],
      },
      {
        typeId: "vmap1.resolved-dataset",
        valid: [validVmap1ResolvedDataset],
        invalid: [
          { ...validVmap1ResolvedDataset, kind: "vmap1-dataset" },
          { ...validVmap1ResolvedDataset, id: "" },
          { ...validVmap1ResolvedDataset, geojson: undefined },
          { ...validVmap1ResolvedDataset, featureCount: -1 },
        ],
      },
      {
        typeId: "vmap1.dataset-registry",
        valid: [
          {
            kind: "vmap1-dataset-registry",
            version: 1,
            datasets: [validVmap1Dataset],
            resolvedDatasets: [validVmap1ResolvedDataset],
          },
        ],
        invalid: [
          { kind: "vmap1-dataset-registry", version: 1 },
          { kind: "vmap1-dataset-registry", version: 2, datasets: [] },
          {
            kind: "vmap1-dataset-registry",
            version: 1,
            datasets: [{ ...validVmap1Dataset, id: "" }],
          },
        ],
      },
      {
        typeId: "vmap1.source-registry",
        valid: [
          {
            kind: "vmap1-source-registry",
            version: 1,
            tileSources: [validVmap1TileSource],
            pmtilesSources: [validVmap1PmtilesSource],
            datasets: [validVmap1Dataset],
            resolvedDatasets: [validVmap1ResolvedDataset],
            terrain: validVmap1Terrain,
          },
        ],
        invalid: [
          {
            kind: "vmap1-source-registry",
            version: 1,
            tileSources: [],
            pmtilesSources: [],
            datasets: [],
          },
          {
            kind: "vmap1-source-registry",
            version: 1,
            tileSources: [{ ...validVmap1TileSource, sourceType: "geojson" }],
            pmtilesSources: [],
            datasets: [],
            resolvedDatasets: [],
          },
        ],
      },
      {
        typeId: "vmap1.layer-descriptor",
        valid: [
          {
            ...validVmap1LayerBase,
            id: "places-fill",
            layerType: "fill",
            fillColor: ["get", "color"],
            fillOpacity: 0.8,
          },
          {
            ...validVmap1LayerBase,
            id: "routes-line",
            layerType: "line",
            lineColor: "#2563eb",
            lineWidth: ["interpolate", ["linear"], ["zoom"], 4, 1, 12, 6],
          },
          {
            ...validVmap1LayerBase,
            id: "places-circle",
            layerType: "circle",
            circleRadius: 6,
            circleColor: "#f97316",
          },
          { ...validVmap1LayerBase, id: "labels-symbol", layerType: "symbol", textField: "name" },
          {
            ...validVmap1LayerBase,
            id: "density-heatmap",
            layerType: "heatmap",
            heatmapRadius: 24,
            colorRamp: ["#eff6ff", "#1d4ed8"],
          },
          {
            ...validVmap1LayerBase,
            id: "buildings-extrusion",
            layerType: "extrusion",
            fillExtrusionColor: "#64748b",
            fillExtrusionHeight: ["get", "height"],
          },
          { ...validVmap1LayerBase, id: "imagery-raster", layerType: "raster", rasterOpacity: 0.7 },
          {
            ...validVmap1LayerBase,
            id: "terrain-layer",
            layerType: "terrain",
            terrainSourceRef: "terrain-dem",
            exaggeration: 1.25,
          },
        ],
        invalid: [
          { kind: "vmap1-layer", version: 1, id: "places", visible: true, layerType: "fill" },
          {
            kind: "vmap1-layer",
            version: 1,
            id: "",
            sourceRef: "places",
            visible: true,
            layerType: "fill",
          },
          {
            kind: "vmap1-layer",
            version: 1,
            id: "places",
            sourceRef: "",
            visible: true,
            layerType: "fill",
          },
          {
            kind: "vmap1-layer",
            version: 1,
            id: "places",
            sourceRef: "places",
            visible: "yes",
            layerType: "fill",
          },
          {
            kind: "vmap1-layer",
            version: 1,
            id: "places",
            sourceRef: "places",
            visible: true,
            layerType: "custom",
          },
          { ...validVmap1LayerBase, id: "fill-missing-color", layerType: "fill", fillOpacity: 0.8 },
          {
            ...validVmap1LayerBase,
            id: "fill-missing-opacity",
            layerType: "fill",
            fillColor: "#0f172a",
          },
          { ...validVmap1LayerBase, id: "line-missing-color", layerType: "line", lineWidth: 2 },
          {
            ...validVmap1LayerBase,
            id: "line-missing-width",
            layerType: "line",
            lineColor: "#0f172a",
          },
          {
            ...validVmap1LayerBase,
            id: "circle-missing-radius",
            layerType: "circle",
            circleColor: "#0f172a",
          },
          {
            ...validVmap1LayerBase,
            id: "circle-missing-color",
            layerType: "circle",
            circleRadius: 4,
          },
          {
            ...validVmap1LayerBase,
            id: "symbol-invalid-text-size",
            layerType: "symbol",
            textSize: "large",
          },
          {
            ...validVmap1LayerBase,
            id: "heatmap-invalid-ramp",
            layerType: "heatmap",
            colorRamp: ["#fff", 3],
          },
          {
            ...validVmap1LayerBase,
            id: "extrusion-missing-color",
            layerType: "extrusion",
            fillExtrusionHeight: 24,
          },
          {
            ...validVmap1LayerBase,
            id: "extrusion-missing-height",
            layerType: "extrusion",
            fillExtrusionColor: "#0f172a",
          },
          {
            ...validVmap1LayerBase,
            id: "raster-invalid-opacity",
            layerType: "raster",
            rasterOpacity: Number.NaN,
          },
          {
            ...validVmap1LayerBase,
            id: "terrain-missing-source",
            layerType: "terrain",
            exaggeration: 1,
          },
          {
            ...validVmap1LayerBase,
            id: "terrain-missing-exaggeration",
            layerType: "terrain",
            terrainSourceRef: "terrain-dem",
          },
          {
            ...validVmap1LayerBase,
            id: "terrain-invalid-source",
            layerType: "terrain",
            terrainSourceRef: "",
            exaggeration: 1,
          },
          {
            ...validVmap1LayerBase,
            id: "terrain-invalid-exaggeration",
            layerType: "terrain",
            terrainSourceRef: "terrain-dem",
            exaggeration: Number.NaN,
          },
        ],
      },
      {
        typeId: "vmap1.deck-layer-descriptor",
        valid: [
          {
            kind: "vmap1-deck-layer",
            version: 1,
            id: "trips",
            deckLayerType: "trips",
            sourceRef: "routes",
            props: { widthMinPixels: 2 },
            accessors: { getPath: "path" },
            picking: true,
            visible: true,
          },
        ],
        invalid: [
          {
            kind: "vmap1-deck-layer",
            version: 1,
            id: "trips",
            deckLayerType: "custom",
            sourceRef: "routes",
            props: {},
            picking: true,
            visible: true,
          },
          {
            kind: "vmap1-deck-layer",
            version: 1,
            id: "",
            deckLayerType: "trips",
            sourceRef: "routes",
            props: {},
            picking: true,
            visible: true,
          },
          {
            kind: "vmap1-deck-layer",
            version: 1,
            id: "trips",
            deckLayerType: "trips",
            sourceRef: "",
            props: {},
            picking: true,
            visible: true,
          },
          {
            kind: "vmap1-deck-layer",
            version: 1,
            id: "trips",
            deckLayerType: "trips",
            sourceRef: "routes",
            props: { bad: undefined },
            picking: true,
            visible: true,
          },
        ],
      },
      {
        typeId: "vmap1.initial-view",
        valid: [
          {},
          { initialCenter: [-122.4, 37.8], initialZoom: 10, initialPitch: 45, initialBearing: -10 },
        ],
        invalid: [
          { initialCenter: [-181, 0] },
          { initialCenter: [0, 91] },
          { initialZoom: Number.NaN },
          { initialPitch: Number.POSITIVE_INFINITY },
        ],
      },
    ];

    expect(cases.map((entry) => entry.typeId)).toEqual(expectedDataTypeIds);

    for (const { typeId, valid, invalid } of cases) {
      for (const value of valid) {
        expectParses(typeId, value);
      }
      for (const value of invalid) {
        expectRejects(typeId, value);
      }
    }
  });

  it("does not expose the removed legacy viz-theme data type", () => {
    expect(getDataTypeDefinition("viz-theme")).toBeUndefined();
    expect(getDataTypeSchema("viz-theme")).toBeUndefined();
    expect(isKnownDataTypeId("viz-theme")).toBe(false);
  });

  it("rejects non-finite numbers in JSON, primitive, and chart number positions", () => {
    for (const value of nonFiniteNumbers) {
      expectRejects("all-data", value);
      expectRejects("json-object", { value });
      expectRejects("json-array", [value]);
      expectRejects("primitive", value);
      expectRejects("chart-series-xy", [{ x: value, y: 1 }]);
      expectRejects("chart-series-xy", [{ x: "Jan", y: value }]);
      expectRejects("chart-slices", [{ label: "Slice", value }]);
      expectRejects("chart-cartesian-point", { x: value, y: 1 });
      expectRejects("chart-cartesian-point", { x: "Jan", y: value });
      expectRejects("chart-donut-slice", { label: "Slice", value });
      expectRejects("chart-range", { x0: value, x1: 1 });
      expectRejects("chart-range", { x0: 0, x1: value });
      expectRejects("chart-matrix-cell", {
        rowKey: "row",
        columnKey: "column",
        rowIndex: 0,
        columnIndex: 0,
        value,
      });
      expectRejects("geo-point", { lat: value, lon: 0 });
      expectRejects("geo-point", { lat: 0, lon: value });
      expectRejects("geo-point", { lat: 0, lon: 0, value });
      expectRejects("graph-node", { id: "node", value });
      expectRejects("graph-edge", { source: "a", target: "b", value });
    }
  });
});

describe("SDK data type parse and output helpers", () => {
  it("parses canonical data types without host registry setup", () => {
    expect(safeParseDataTypeValue("text-value", "Launch")).toEqual({
      success: true,
      value: "Launch",
    });
    expect(parseDataTypeValue("json-object", { ok: true })).toEqual({ ok: true });

    const invalidValue = safeParseDataTypeValue("text-value", 42);
    expect(invalidValue.success).toBe(false);
    if (!invalidValue.success) {
      expect(invalidValue.error.message).toBe('Value does not satisfy data type "text-value".');
    }

    const unknownType = safeParseDataTypeValue("unknown-type", "Launch");
    expect(unknownType.success).toBe(false);
    if (!unknownType.success) {
      expect(unknownType.error.message).toBe('Unknown data type "unknown-type".');
    }
  });

  it("shapes output ports through canonical data type validation", () => {
    expect(
      shapePortOutputs(
        [
          { id: "label", label: "Label", typeId: "text-value" },
          { id: "metadata", label: "Metadata", typeId: "json-object" },
        ],
        { label: "Launch", metadata: { ok: true }, omitted: undefined },
      ),
    ).toEqual({ label: "Launch", metadata: { ok: true } });

    expect(() =>
      shapePortOutputs([{ id: "label", label: "Label", typeId: "text-value" }], {
        label: 42,
      }),
    ).toThrow(
      'Invalid component outputs. Output port "label" failed validation: Value does not satisfy data type "text-value".',
    );
  });
});
