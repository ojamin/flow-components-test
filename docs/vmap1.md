# vmap1 Map Components

## Scope

`vmap1` is the built-in MapLibre component family for composing one-page interactive maps from descriptor components. The family covers styles, external tile sources, PMTiles sources, resolved datasets, MapLibre layers, terrain activation, optional deck.gl overlays, the renderable `vmap1.map` host, and read-only dataset inspection surfaces such as `vmap1.map-attribute-table`.

Use this guide to discover common composition patterns, expected Flow wiring, package preview fixtures, and static-export behavior before opening host-app code.

## Component families

- **Map host:** `vmap1.map` renders the composed map and owns MapLibre runtime behavior, camera state, source/layer/deck reconciliation, optional legend/layer-control chrome, status text, and map events.
- **Styles and sources:** `vmap1.map-style`, `vmap1.map-tiles`, `vmap1.map-tiles-pmtiles`, and `vmap1.map-tiles-terrain` produce style, tile, PMTiles, and terrain-source descriptors.
- **Datasets:** `vmap1.map-dataset`, `vmap1.map-dataset-points`, `vmap1.map-dataset-routes`, `vmap1.map-dataset-regions`, and `vmap1.map-dataset-combiner` produce dataset descriptors, resolved GeoJSON, status, and source-registry output.
- **MapLibre layers:** `vmap1.map-layer-raster`, `vmap1.map-layer-fill`, `vmap1.map-layer-line`, `vmap1.map-layer-circle`, `vmap1.map-layer-symbol`, `vmap1.map-layer-heatmap`, `vmap1.map-layer-extrusion`, and `vmap1.map-layer-terrain` produce ordered layer descriptors.
- **Deck overlays:** `vmap1.map-deck-layer` produces optional deck.gl overlay descriptors without loading deck.gl during descriptor authoring.
- **Dataset inspection:** `vmap1.map-attribute-table` renders a read-only Schema/Data view over an already-resolved dataset so authors and viewers can inspect attributes without adding selection, search, sort, export, or dataset-fetch behavior.

Most components are descriptor producers and are intentionally non-renderable. `vmap1.map` is the renderable map sink that consumes those descriptors; `vmap1.map-attribute-table` is a separate renderable inspector for resolved dataset attributes.

Layer and deck descriptors may provide an optional `displayName`. Map chrome uses it for author-facing layer labels and falls back to descriptor IDs when it is absent.

## Basic raster or vector tile map

Use this for a conventional map with an external style and one or more public tile sources.

1. Add `vmap1.map-style` and choose a preset, inline JSON, or external style URL.
2. Add `vmap1.map-tiles` for each public raster, vector, raster-dem, or TileJSON source. Preserve source IDs because layers reference them through `sourceRef`.
3. Add the matching layer descriptors, for example `vmap1.map-layer-raster` for raster tiles or fill/line/circle/symbol layers for vector sources.
4. Add `vmap1.map` and connect:
   - `map-style.descriptor` → `map.style`
   - `map-tiles.descriptor` → `map.tileSources` or a source-registry path
   - layer `descriptor` outputs → `map.layers`

`map.layers`, `map.tileSources`, `map.pmtilesSources`, `map.datasets`, and `map.deckLayers` allow multiple ordered edges. Use Flow edge ordering when layer order matters; sibling edges are rendered in target order.

Package preview fixtures to inspect:

- `packages/components/src/groups/vmap1/map/fixtures/sample-data.json` — renderable map fixture with blank style, resolved GeoJSON, fill/line/heatmap/extrusion/circle/symbol layers.
- `packages/components/src/groups/vmap1/map-style/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-tiles/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-layer-raster/fixtures/sample-data.json`

## Dataset-backed map

Use datasets when you want Flow Builder to fetch/parse/normalize GeoJSON or row data before the map renders it.

1. Choose a dataset producer:
   - `vmap1.map-dataset` for generic GeoJSON, JSON, CSV, URL, inline, or binding-backed input.
   - `vmap1.map-dataset-points` for longitude/latitude row mapping.
   - `vmap1.map-dataset-routes` for line/route data from GeoJSON, JSON rows, coordinate arrays, or origin/destination fields.
   - `vmap1.map-dataset-regions` for polygon/region thematic data; its optional `boundData` input is used in binding source mode.
2. Combine multiple dataset outputs with `vmap1.map-dataset-combiner` when a map needs one canonical dataset/source registry.
3. Connect resolved datasets or the combiner registry into `vmap1.map` through `map.datasets` or `map.sources`.
4. Optionally connect a resolved dataset/status pair into `vmap1.map-attribute-table` when the page should expose a read-only attribute table beside or below the map.
5. Add layer descriptors that reference dataset source IDs:
   - `vmap1.map-layer-fill` for polygons.
   - `vmap1.map-layer-line` for routes.
   - `vmap1.map-layer-circle`, `vmap1.map-layer-symbol`, or `vmap1.map-layer-heatmap` for points.
   - `vmap1.map-layer-extrusion` for polygon height/base rendering.

`vmap1.map` consumes resolved datasets from the registry. It should not independently fetch dataset URLs; dataset fetching and parsing belong to the dataset runtime path.
`vmap1.map-attribute-table` follows the same resolved-data boundary: it inspects the resolved `FeatureCollection` it receives, keeps schema sampling and row projection bounded, and does not fetch, normalize, sort, search, select, copy, or export data by itself.

Package preview fixtures to inspect:

- `packages/components/src/groups/vmap1/map-dataset/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-dataset-points/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-dataset-routes/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-dataset-regions/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-dataset-combiner/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-attribute-table/fixtures/sample-data.json` — renderable table fixture with default, empty, no-attribute, wide, large, invalid, loading, and error preview variants.

## PMTiles maps

Use `vmap1.map-tiles-pmtiles` for external PMTiles archives.

1. Add `vmap1.map-tiles-pmtiles` and configure its public PMTiles URL plus source type: vector, raster, or raster-dem.
2. Connect `descriptor` → `vmap1.map.pmtilesSources` or into a source registry that feeds `vmap1.map.sources`.
3. Add a compatible layer:
   - vector PMTiles: fill/line/circle/symbol/heatmap/extrusion layers with the correct `sourceRef` and source-layer configuration where needed.
   - raster PMTiles: `vmap1.map-layer-raster`.
   - raster-dem PMTiles: pair with terrain activation as described below.

The PMTiles protocol is registered only by runtime paths that need it. Descriptor producers do not fetch the archive during authoring.

Package preview fixture: `packages/components/src/groups/vmap1/map-tiles-pmtiles/fixtures/sample-data.json`.

## Terrain maps

Terrain is a two-part composition: a terrain-capable source plus a terrain activation layer.

1. Add `vmap1.map-tiles-terrain` for a raster-dem tile source or raster-dem PMTiles terrain source.
2. Add `vmap1.map-layer-terrain` and select the connected terrain source. Its descriptor binds the source to the map and can override exaggeration.
3. Connect the terrain source to `vmap1.map.tileSources`, `vmap1.map.pmtilesSources`, or the source registry as appropriate.
4. Connect the terrain activation descriptor to `vmap1.map.terrain` or alongside other ordered `map.layers`, depending on the authoring surface.

The terrain picker should derive options from the same connected map's raster-dem tile sources and raster/raster-dem PMTiles sources, while preserving manual or unknown source IDs instead of clearing them.

Package preview fixtures to inspect:

- `packages/components/src/groups/vmap1/map-tiles-terrain/fixtures/sample-data.json`
- `packages/components/src/groups/vmap1/map-layer-terrain/fixtures/sample-data.json`

## Deck overlays

Use `vmap1.map-deck-layer` for advanced overlays that should render through deck.gl on top of the MapLibre map.

1. Add `vmap1.map-deck-layer` and choose the deck layer type and source reference.
2. Connect `descriptor` → `vmap1.map.deckLayers`.
3. Keep deck accessor/prop editing in the component config surface; descriptor authoring should not evaluate accessor strings.

Deck layer config uses two explicit authoring lists:

- **Layer props** are JSON values passed to deck.gl after the vmap runtime removes runtime-owned keys. Supported V1 authoring is pass-through JSON for deck.gl layer props that are safe to serialize: strings, numbers, booleans, arrays, objects, and `null`. The runtime owns and strips `id`, `data`, `pickable`, `visible`, `onClick`, and `onHover`; use the component's layer id, visibility, and picking controls instead of those prop keys.
- **Material** is authored as a layer prop with key `material` and a JSON object value, for example `{ "ambient": 0.35, "diffuse": 0.6, "shininess": 32 }`. It is forwarded to deck.gl material/lighting settings for layer types that support material.
- **Accessors** map deck.gl accessor prop names such as `getPosition`, `getRadius`, `getFillColor`, `getWeight`, `getSourcePosition`, `getTargetPosition`, `getPath`, and `getTimestamps` to declarative feature field paths. Paths are dot-separated safe property names or numeric array indexes, for example `geometry.coordinates`, `properties.count`, `properties.style.color`, or `$.properties.count`; `$` addresses the whole feature. Unsafe segments such as `__proto__`, `prototype`, and `constructor` are rejected.
- `literal:<json>` accessors provide a constant accessor value, for example `literal:[255, 99, 71]` for a static RGB color.
- `expr:` / `expression:` references are reserved for internal resolver hooks and are not public map-layer authoring syntax in V1. JavaScript callbacks, arrow functions, statement chains, dynamic imports, `eval`, and function constructors are rejected.

Common prop keys by layer family include:

| Layer type                   | Common JSON prop keys                                                                           | Common accessor keys                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `scatterplot`                | `radiusScale`, `radiusMinPixels`, `radiusMaxPixels`, `filled`, `stroked`, `opacity`, `material` | `getPosition`, `getRadius`, `getFillColor`, `getLineColor`, `getLineWidth`                           |
| `arc`, `line`                | `widthScale`, `widthMinPixels`, `widthMaxPixels`, `opacity`, `material`                         | `getSourcePosition`, `getTargetPosition`, `getSourceColor`, `getTargetColor`, `getColor`, `getWidth` |
| `path`, `trips`              | `widthScale`, `widthMinPixels`, `widthMaxPixels`, `rounded`, `opacity`, `material`              | `getPath`, `getColor`, `getWidth`, `getTimestamps`                                                   |
| `heatmap`, `hexagon`, `grid` | `radiusPixels`, `radius`, `cellSize`, `extruded`, `elevationScale`, `opacity`, `material`       | `getPosition`, `getWeight`, `getColor`, `getElevationWeight`                                         |
| `h3-hexagon`                 | `extruded`, `elevationScale`, `opacity`, `material`                                             | `getHexagon`, `getFillColor`, `getElevation`                                                         |
| `geojson`                    | `filled`, `stroked`, `extruded`, `opacity`, `material`                                          | `getFillColor`, `getLineColor`, `getLineWidth`, `getElevation`                                       |

Deck is lazy-loaded by the map runtime only when deck layer descriptors exist. If a project has no deck layers, deck.gl chunks should not load in Preview or static export.

### H3 hexagon overlays

Use `h3-hexagon` when the dataset already contains H3 cell IDs and should render through deck.gl `H3HexagonLayer` without converting cells into polygons first.

1. Add or resolve a dataset through `vmap1.map-dataset`, `vmap1.map-dataset-points`, or the dataset/source registry. The rows or GeoJSON features must expose valid 15-character H3 indexes such as `8928308280fffff`.
2. Prefer an explicit `getHexagon` accessor when the cell id is not on the canonical `h3` property. For example, the importable H3 example stores cells at `properties.hex_id` and configures `getHexagon=properties.hex_id`.
3. Connect the dataset descriptor to `vmap1.map.datasets` and the H3 deck descriptor to `vmap1.map.deckLayers`. Keep the deck layer `sourceRef` equal to the dataset descriptor id.
4. Use non-color-only context for interpretation. The fixture includes counts and labels in properties so tooltips, layer controls, or future inspector surfaces can communicate meaning beyond fill color.

Common H3 diagnostics to check are missing `sourceRef`, unsupported deck layer type, unsafe accessor paths such as `properties.constructor.hex_id`, missing H3 values at the configured accessor, invalid/non-H3 strings, unavailable WebGL2/deck support, and external dataset URLs that are not browser-fetchable. These should be surfaced with specific recovery text rather than leaving a blank map.

Static export uses the same Preview runtime contract: a project that can render an H3 deck layer in Preview must package the same map/deck runtime path and preserve any external dataset URLs as authored. Do not add an export-only H3 conversion path.

Importable example to exercise: `vmap1 H3 Hexagon Layer` (`examples/imports/vmap1-h3-hexagon-layer.project.json`).

Package preview fixture: `packages/components/src/groups/vmap1/map-deck-layer/fixtures/sample-data.json`.

## Runtime states and accessibility

Map renderers and panels must communicate state without relying only on color or pointer interaction.

- Empty maps should explain that style, sources, datasets, or layers need to be connected.
- Loading states should identify the source or dataset that is still resolving where possible.
- Error and unsupported states should include actionable diagnostic text, for example invalid source references, failed dataset parsing, unavailable WebGL, unavailable WebGL2 for deck paths, PMTiles failures, or unsupported deck layer types.
- Attribute tables should explain no dataset, loading, error, invalid GeoJSON, empty collection, and no-attribute states without exposing row-selection or export affordances.
- Disabled controls should remain discoverable with clear labels and reasons.
- Keyboard users must be able to focus map chrome and authoring controls. Pointer map interactions should not be the only way to understand status or diagnostics.
- Reduced-motion environments should avoid non-essential camera/deck animation and prefer stable deterministic rendering.

`vmap1.map` may show a layer visibility control through `layerControlVisible`. This control is independent of `legendVisible`: the legend explains layers, while the layer control lets Preview users temporarily show or hide layer and deck descriptors. Those toggles are session-local Preview chrome and must not rewrite persisted component visibility params.

`vmap1.map` exposes map events for runtime composition: `viewportChanged`, `featureClicked`, `featureHovered`, `sourceLoaded`, `sourceError`, `mapReady`, and `mapError`. Its `viewport` output projects `viewportChanged` into the `vmap1.initial-view` shape so one map's camera can feed another map's initial view when desired.

## Static export and external URLs

Static export reuses the same Preview runtime contract. Do not add an export-only map runtime or duplicate URL/source handling.

- External style, glyph, sprite, tile, dataset, PMTiles, and remote data URLs are serialized and preserved as configured.
- Static export does not provide a backend proxy, API-key vault, provider SDK, or credential redaction layer. User-entered URLs must already be browser-fetchable from the exported site.
- Dataset URLs are fetched by dataset components before feeding resolved data into the map; style, tile, glyph, sprite, and PMTiles loading remains MapLibre/PMTiles-owned.
- Exports without maps should not load map, deck, or PMTiles runtime chunks. Exports with maps load only the runtime paths required by the configured sources and overlays.
- Exports with `vmap1.map-attribute-table` must retain that component's renderer/runtime assets when placed, but still should not load MapLibre, deck, PMTiles, or dataset-fetch paths unless other placed components require them.
- Packaged sites must not contain development `/src/...` runtime references.

## Required acceptance flows to preserve

Future changes to `vmap1` should keep these user-visible flows working in Builder, Preview, and packaged static export:

1. Build a map with an external style and external raster/vector source.
2. Add multiple datasets and combine them.
3. Render fill, line, circle, and symbol layers.
4. Verify map pan, zoom, pitch, and bearing behavior.
5. Verify feature-click events from interactive layers.
6. Verify static export preserves external URLs.
7. Verify external PMTiles URL sources work.
8. Verify deck layers lazy-load and render.
9. Verify H3 hexagon overlays use valid H3 cell ids and safe `getHexagon` accessors.

## V1 non-goals

Do not imply or implement these capabilities as part of vmap1 V1 without a new spec slice:

- No migration from `viz.map-3d` and no legacy persistence compatibility.
- No Cesium/globe component.
- No Mapbox token integration or provider-specific SDKs.
- No backend proxy, API-key vault, or private credential handling.
- No drawing/editing tools.
- No WMS, WMTS, COG, or GeoTIFF support.
- No advanced expression editor.
- No custom vector-tile decoder outside MapLibre.
- No offline guarantee for external URLs.
- No attribution enforcement.
- No V1 URL hardening, secret classification, credential redaction, or provider-specific key guidance; user-entered URLs are preserved as configured.
