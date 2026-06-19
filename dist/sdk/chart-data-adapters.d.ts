/**
 * Chart data adapter facade for package-hosted chart components.
 *
 * Static chart components should import chart data utilities from this
 * package surface rather than reaching into host application paths directly.
 * This facade stays stable while the concrete behavior is owned by the package
 * SDK helpers.
 */
export * from "./chart-data-helpers.js";
export * from "./chart-data-series.js";
