# Basic Civic Components Plan

Source: `docs/process-evaluation.md` recommends a purpose-built civic operations component pack after the Loudoun County demo evaluation, especially the "Useful Components Flow Builder Should Add" list in `docs/process-evaluation.md:86-102`.

## Current implementation scope

The basic civic components in this plan are complete and verified as focused, reusable package components. The GIS thematic map follow-up is implemented as a real SVG GeoJSON map with explicit shape/data join contracts.

| Component                           | Proposed generic ID           | Current status   | Notes                                                                                                                                                        |
| ----------------------------------- | ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| KPI Grid                            | `viz.kpi-grid`                | COMPLETED [PASS] | Array-driven responsive KPI summaries so authors do not need a Repeater setup for common metric grids.                                                       |
| Status Badge / Risk Badge           | `content.status-badge`        | COMPLETED [PASS] | Generic status/severity/confidence badge with non-color-only labels.                                                                                         |
| Data Quality Banner                 | `content.data-quality-banner` | COMPLETED [PASS] | Synthetic/draft/official/stale/verified data-state messaging.                                                                                                |
| Metric Delta Card                   | `viz.metric-delta-card`       | COMPLETED [PASS] | Single metric plus prior value, delta, trend, and explanatory note.                                                                                          |
| Filter Bar                          | `content.filter-bar`          | COMPLETED [PASS] | Search/select/toggle/date controls with reset affordance.                                                                                                    |
| Crossfilter Table                   | `content.crossfilter-table`   | COMPLETED [PASS] | Table surface designed to respond to filter controls and emit selected rows.                                                                                 |
| Regional Score Tiles                | `viz.regional-score-tiles`    | COMPLETED [PASS] | Region-coded score/value tile grid for non-GIS regional scanning.                                                                                            |
| GIS Thematic Map                    | `viz.gis-thematic-map`        | COMPLETED [PASS] | Basic SVG GeoJSON thematic map with explicit shape and attribute-data contracts, fit/Albers/Mercator projection options, feature selection, and diagnostics. |
| Calendar Heatmap                    | `viz.calendar-heatmap`        | COMPLETED [PASS] | Date-density view for voting volume, processing, staffing, or similar time series.                                                                           |
| Timeline / Milestone Tracker        | `viz.milestone-timeline`      | COMPLETED [PASS] | Process stage and election-calendar milestone visualization.                                                                                                 |
| Alert List / Exception Queue        | `content.exception-queue`     | COMPLETED [PASS] | Prioritized operational exceptions requiring attention.                                                                                                      |
| Small Multiples                     | `viz.small-multiples`         | COMPLETED [PASS] | Repeated mini charts by district, precinct, category, or mode.                                                                                               |
| Sankey / Flow Diagram               | `viz.flow-diagram`            | COMPLETED [PASS] | Lifecycle flow from one stage to another, such as ballot processing.                                                                                         |
| Confidence / Uncertainty Band Chart | `viz.uncertainty-band`        | COMPLETED [PASS] | Forecast/projection ranges, benchmark bands, and confidence intervals.                                                                                       |
| Narrative Insight Card              | `content.insight-card`        | COMPLETED [PASS] | Authored interpretation attached to a chart or data section.                                                                                                 |
| Export Button                       | `content.export-button`       | COMPLETED [PASS] | Export a table, chart image, or page section through a declared contract.                                                                                    |

## Completed component contract: KPI Grid

Reusable unit: render a generic array of KPI objects as a responsive, accessible summary grid.

- Declared input: optional `data` input accepting `all-data`; the component reads an array from a configurable path.
- Declared output: pass connected data through on `all` for downstream composition.
- Declared events and event outputs: none in this first slice; item selection and drill-down behavior are future scope.
- Params/config fields: array path, label/value/delta/context/status path keys, display title, empty message, max columns, number formatting, and optional compact density.
- Slots or child-composition seams: none; this is a focused renderer, not a layout container.
- Shared helpers/runtime services: reuse existing package SDK helpers and nearby visualization coercion/formatting helpers where allowed.
- Monolith split triggers reviewed: this component renders one reusable visual/data shape only; badges, filters, table crossfiltering, and export actions remain separate components.

## Completed component contract: Status Badge

Reusable unit: render a compact generic status, severity, or confidence badge with non-color-only semantics.

- Declared input: optional `data` input accepting `all-data` for bindable label, semantic tone, supporting text, and downstream passthrough.
- Declared output: pass connected data through on `all` for downstream composition.
- Declared events and event outputs: none; the badge is read-only display metadata.
- Params/config fields: label, semantic tone, supporting text, icon visibility, density, and fallback label.
- Slots or child-composition seams: none; this is a focused metadata renderer, not a layout container.
- Shared helpers/runtime services: none beyond package SDK params and component-ui config panel facade.
- Monolith split triggers reviewed: this component renders one compact status primitive only; data-quality messaging, exception queues, filters, and tables remain separate components.

## Completed component contract: Data Quality Banner

Reusable unit: render a generic data provenance, freshness, and trust-state message band.

- Declared input: optional `data` input accepting `all-data` for bindable message, data state, source, timestamp, and downstream passthrough.
- Declared output: pass connected data through on `all` for downstream composition.
- Declared events and event outputs: none; the banner is read-only provenance messaging.
- Params/config fields: data state, title, description, source label, updated-at note, icon visibility, density, and fallback title.
- Slots or child-composition seams: none; the component intentionally stays a focused provenance message rather than a multi-region alert workflow.
- Shared helpers/runtime services: none beyond package SDK params and component-ui config panel facade.
- Monolith split triggers reviewed: synthetic/draft/official/stale/verified messaging belongs in this reusable primitive; filtering, data validation summaries, exception queues, and export actions remain separate components.

## Completed component contract: Metric Delta Card

Reusable unit: render one metric with current value, comparison value, directional delta, and an optional explanatory note.

- Declared input: optional `data` input accepting `all-data` for value, previous value, label/note, and downstream passthrough.
- Declared output: pass connected data through on `all` for downstream composition.
- Declared events and event outputs: none in this slice; the component is read-only metric presentation.
- Params/config fields: label, value path, previous-value path, comparison label, note path, direction semantics, trend icon visibility, value/delta formats, fraction digits, density, and fallback value.
- Slots or child-composition seams: none; this is a focused metric renderer, not a layout container.
- Shared helpers/runtime services: reuses package viz coercion/formatting helpers and SDK theme-role resolution.
- Monolith split triggers reviewed: the component stays focused on one metric; KPI grids, filters, tables, and narrative insight remain separate components.

## Completed component contract: Filter Bar

Reusable unit: render a flat, wrapped filter-control strip that publishes normalized filter state while still emitting discrete interaction events for listeners.

- Declared input: optional `data` input accepting `all-data` for bindable option data and downstream passthrough.
- Declared outputs: renderer-managed `filters` and `all` ports containing the current search/select/toggle/date state plus active count.
- Declared events and event outputs: `changed` emits normalized search/select/toggle/date state plus active count; `reset` emits reset intent. Event-output projection is intentionally disabled so the renderer is the single steady-state writer for `filters` / `all`.
- Params/config fields: search/select/toggle/date labels and visibility, select options, reset label/visibility, density, immediate-vs-submit mode, and disabled state.
- Slots or child-composition seams: none; downstream coordination happens through Flow via the declared `filters` output/events.
- Shared helpers/runtime services: none beyond package SDK params and component-ui controls.
- Monolith split triggers reviewed: this component only collects filter state; table filtering, chart updates, and dashboard orchestration remain outside the renderer.

## Completed component contract: Crossfilter Table

Reusable unit: render structured rows as a filter-aware, selectable table that publishes visible-row metadata and renderer-owned selected-row state for crossfilter composition.

- Declared input: optional `data` input accepting `all-data`; rows and optional filter state are read through configurable paths.
- Declared outputs: `all` passthrough, transform-owned visible rows / visible row count metadata, and renderer-managed selected rows / selected row IDs.
- Declared events and event outputs: `rowSelected` and `selectionChanged` expose stable row IDs and row snapshots for discrete listeners. Event-output projection is intentionally disabled so selected-row ports have one steady-state writer.
- Params/config fields: rows path, columns mode/selected columns, row ID path, filter state path, selection mode, summary visibility, density, empty/filtered-empty messages, max rows, striping, and sticky header.
- Slots or child-composition seams: none; this is a table surface, not a dashboard orchestrator.
- Shared helpers/runtime services: reuses package structured-data helpers and component-ui table primitives.
- Monolith split triggers reviewed: sorting/filtering/selection are table responsibilities, while cross-component coordination remains explicit through events/outputs and Flow.

## Completed component contracts: Remaining civic pack

The remaining components follow the same package contract shape: optional `data` input, `all` passthrough where useful, stable normalized all-data outputs, SchemaConfigPanel-based config, package-boundary renderers, fixtures, and contract/render/transform coverage.

- `viz.regional-score-tiles`: region-coded numeric/category rows rendered as an accessible score-tile grid/list with legend, missing-value handling, normalized `regions`, and summary metadata. First pass intentionally avoids GIS/shape loading.
- `viz.calendar-heatmap`: date/value rows aggregated into an accessible calendar-density grid with legend, normalized day buckets, date range summary, and invalid/empty handling.
- `viz.milestone-timeline`: ordered milestone rows rendered as a process timeline with non-color-only status cues, normalized milestones, and status summary counts.
- `content.exception-queue`: prioritized exception rows rendered as a read-only attention queue with severity/status text cues, normalized exceptions, summary counts, and declared selection behavior where applicable.
- `viz.small-multiples`: grouped rows rendered as repeated mini line/bar panels with truncation messaging, normalized panel data, shared-scale summary, and empty/invalid handling.
- `viz.flow-diagram`: node/link data rendered as an accessible first-pass flow diagram plus readable links table, normalized nodes/links/summary outputs, and invalid-link diagnostics. First pass intentionally avoids graph editing or full Sankey authoring.
- `viz.uncertainty-band`: x/low/mid/high rows rendered as a range/line uncertainty visualization with legend, normalized points, range summary, and invalid-row handling.
- `content.insight-card`: authored or data-bound narrative insight block with flat annotation styling, normalized insight output, and declared action event/output when an action is configured.
- `content.export-button`: declared-data export trigger for JSON/CSV/text payloads with no DOM/chart capture, normalized export payload output, and `exportRequested` event payload for host-owned export handling.

## Completed component contract: GIS Thematic Map

Reusable unit: render real geographic features as a basic thematic map by joining shape features to attribute rows through an explicit key contract.

- Declared inputs: separate optional `shapes` and `data` inputs accepting `all-data`; shapes contain GeoJSON `FeatureCollection` data and data contains attribute-table rows for the active layer.
- Declared outputs: `all`, active-layer `shapes`, `joinedFeatures`, `selectedFeature`, `summary`, and `diagnostics` expose normalized map/runtime state without emitting raw full GeoJSON by default except for the active layer output.
- Declared events and event outputs: `featureSelected` emits feature key, label, scalar values/category, joined attributes, and GeoJSON properties; the event projects to `selectedFeature`.
- Params/config fields: up to three configured layers, active layer selection, per-layer shape/data/key/value/category/label paths, numeric/categorical/status mode, fit/Albers USA/Mercator projection, legend/tooltip toggles, missing-data label, density, number formatting, and feature-count warning threshold.
- Slots or child-composition seams: none; layer controls, basemap tiles, geocoding/search, shape editing, and remote tile loading remain out of scope for this first pass.
- Shared helpers/runtime services: renderer logic is split into component-local map renderer modules and uses package SDK/component-ui boundaries only; no app stores or direct browser globals.
- Monolith split triggers reviewed: GIS projection, joining, legend, rendering, and interaction helpers are split below the repo file-size hard cap while preserving this component as a basic thematic map rather than a full map application.
