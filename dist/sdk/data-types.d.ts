import { z, type ZodTypeAny } from "zod";
import { componentThemeContextSchema, componentThemeSchema as componentThemePayloadSchema, type ComponentThemeContextV1, type ComponentThemeV1 } from "../themes/index.js";
export interface DataTypeDefinition {
    id: string;
    label: string;
    description: string;
    schema: ZodTypeAny;
}
export declare const componentThemeSchema: z.ZodUnion<readonly [z.ZodObject<{
    version: z.ZodLiteral<1>;
    id: z.ZodString;
    displayName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    properties: z.ZodObject<{
        color: z.ZodObject<{
            pageBackground: z.ZodString;
            surface: z.ZodString;
            cardForeground: z.ZodOptional<z.ZodString>;
            popover: z.ZodOptional<z.ZodString>;
            popoverForeground: z.ZodOptional<z.ZodString>;
            surfaceMuted: z.ZodString;
            foreground: z.ZodString;
            foregroundMuted: z.ZodString;
            border: z.ZodString;
            accent: z.ZodString;
            accentForeground: z.ZodString;
            secondary: z.ZodOptional<z.ZodString>;
            secondaryForeground: z.ZodOptional<z.ZodString>;
            accentSubtle: z.ZodOptional<z.ZodString>;
            accentSubtleForeground: z.ZodOptional<z.ZodString>;
            focusRing: z.ZodString;
            destructive: z.ZodString;
            destructiveForeground: z.ZodOptional<z.ZodString>;
            input: z.ZodOptional<z.ZodString>;
            sidebar: z.ZodOptional<z.ZodString>;
            sidebarForeground: z.ZodOptional<z.ZodString>;
            sidebarPrimary: z.ZodOptional<z.ZodString>;
            sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
            sidebarAccent: z.ZodOptional<z.ZodString>;
            sidebarAccentForeground: z.ZodOptional<z.ZodString>;
            sidebarBorder: z.ZodOptional<z.ZodString>;
            sidebarRing: z.ZodOptional<z.ZodString>;
            warning: z.ZodString;
            info: z.ZodString;
            success: z.ZodString;
            chart1: z.ZodString;
            chart2: z.ZodString;
            chart3: z.ZodString;
            chart4: z.ZodString;
            chart5: z.ZodString;
        }, z.core.$strict>;
        font: z.ZodObject<{
            body: z.ZodString;
            heading: z.ZodString;
            mono: z.ZodString;
        }, z.core.$strict>;
        radius: z.ZodObject<{
            none: z.ZodString;
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
            xl: z.ZodOptional<z.ZodString>;
            full: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        spacing: z.ZodObject<{
            none: z.ZodString;
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
            xl: z.ZodString;
        }, z.core.$strict>;
        motion: z.ZodObject<{
            durationFastMs: z.ZodNumber;
            durationNormalMs: z.ZodNumber;
            easing: z.ZodString;
        }, z.core.$strict>;
        shadow: z.ZodOptional<z.ZodObject<{
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    palettes: z.ZodOptional<z.ZodObject<{
        light: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodObject<{
                input: z.ZodOptional<z.ZodString>;
                success: z.ZodOptional<z.ZodString>;
                pageBackground: z.ZodOptional<z.ZodString>;
                surface: z.ZodOptional<z.ZodString>;
                cardForeground: z.ZodOptional<z.ZodString>;
                popover: z.ZodOptional<z.ZodString>;
                popoverForeground: z.ZodOptional<z.ZodString>;
                surfaceMuted: z.ZodOptional<z.ZodString>;
                foreground: z.ZodOptional<z.ZodString>;
                foregroundMuted: z.ZodOptional<z.ZodString>;
                border: z.ZodOptional<z.ZodString>;
                accent: z.ZodOptional<z.ZodString>;
                accentForeground: z.ZodOptional<z.ZodString>;
                secondary: z.ZodOptional<z.ZodString>;
                secondaryForeground: z.ZodOptional<z.ZodString>;
                accentSubtle: z.ZodOptional<z.ZodString>;
                accentSubtleForeground: z.ZodOptional<z.ZodString>;
                focusRing: z.ZodOptional<z.ZodString>;
                destructive: z.ZodOptional<z.ZodString>;
                destructiveForeground: z.ZodOptional<z.ZodString>;
                sidebar: z.ZodOptional<z.ZodString>;
                sidebarForeground: z.ZodOptional<z.ZodString>;
                sidebarPrimary: z.ZodOptional<z.ZodString>;
                sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
                sidebarAccent: z.ZodOptional<z.ZodString>;
                sidebarAccentForeground: z.ZodOptional<z.ZodString>;
                sidebarBorder: z.ZodOptional<z.ZodString>;
                sidebarRing: z.ZodOptional<z.ZodString>;
                warning: z.ZodOptional<z.ZodString>;
                info: z.ZodOptional<z.ZodString>;
                chart1: z.ZodOptional<z.ZodString>;
                chart2: z.ZodOptional<z.ZodString>;
                chart3: z.ZodOptional<z.ZodString>;
                chart4: z.ZodOptional<z.ZodString>;
                chart5: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            font: z.ZodOptional<z.ZodObject<{
                body: z.ZodOptional<z.ZodString>;
                heading: z.ZodOptional<z.ZodString>;
                mono: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            radius: z.ZodOptional<z.ZodObject<{
                none: z.ZodOptional<z.ZodString>;
                sm: z.ZodOptional<z.ZodString>;
                md: z.ZodOptional<z.ZodString>;
                lg: z.ZodOptional<z.ZodString>;
                xl: z.ZodOptional<z.ZodString>;
                full: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            spacing: z.ZodOptional<z.ZodObject<{
                none: z.ZodOptional<z.ZodString>;
                sm: z.ZodOptional<z.ZodString>;
                md: z.ZodOptional<z.ZodString>;
                lg: z.ZodOptional<z.ZodString>;
                xl: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            motion: z.ZodOptional<z.ZodObject<{
                durationFastMs: z.ZodOptional<z.ZodNumber>;
                durationNormalMs: z.ZodOptional<z.ZodNumber>;
                easing: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            shadow: z.ZodOptional<z.ZodObject<{
                sm: z.ZodOptional<z.ZodString>;
                md: z.ZodOptional<z.ZodString>;
                lg: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        dark: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodObject<{
                input: z.ZodOptional<z.ZodString>;
                success: z.ZodOptional<z.ZodString>;
                pageBackground: z.ZodOptional<z.ZodString>;
                surface: z.ZodOptional<z.ZodString>;
                cardForeground: z.ZodOptional<z.ZodString>;
                popover: z.ZodOptional<z.ZodString>;
                popoverForeground: z.ZodOptional<z.ZodString>;
                surfaceMuted: z.ZodOptional<z.ZodString>;
                foreground: z.ZodOptional<z.ZodString>;
                foregroundMuted: z.ZodOptional<z.ZodString>;
                border: z.ZodOptional<z.ZodString>;
                accent: z.ZodOptional<z.ZodString>;
                accentForeground: z.ZodOptional<z.ZodString>;
                secondary: z.ZodOptional<z.ZodString>;
                secondaryForeground: z.ZodOptional<z.ZodString>;
                accentSubtle: z.ZodOptional<z.ZodString>;
                accentSubtleForeground: z.ZodOptional<z.ZodString>;
                focusRing: z.ZodOptional<z.ZodString>;
                destructive: z.ZodOptional<z.ZodString>;
                destructiveForeground: z.ZodOptional<z.ZodString>;
                sidebar: z.ZodOptional<z.ZodString>;
                sidebarForeground: z.ZodOptional<z.ZodString>;
                sidebarPrimary: z.ZodOptional<z.ZodString>;
                sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
                sidebarAccent: z.ZodOptional<z.ZodString>;
                sidebarAccentForeground: z.ZodOptional<z.ZodString>;
                sidebarBorder: z.ZodOptional<z.ZodString>;
                sidebarRing: z.ZodOptional<z.ZodString>;
                warning: z.ZodOptional<z.ZodString>;
                info: z.ZodOptional<z.ZodString>;
                chart1: z.ZodOptional<z.ZodString>;
                chart2: z.ZodOptional<z.ZodString>;
                chart3: z.ZodOptional<z.ZodString>;
                chart4: z.ZodOptional<z.ZodString>;
                chart5: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            font: z.ZodOptional<z.ZodObject<{
                body: z.ZodOptional<z.ZodString>;
                heading: z.ZodOptional<z.ZodString>;
                mono: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            radius: z.ZodOptional<z.ZodObject<{
                none: z.ZodOptional<z.ZodString>;
                sm: z.ZodOptional<z.ZodString>;
                md: z.ZodOptional<z.ZodString>;
                lg: z.ZodOptional<z.ZodString>;
                xl: z.ZodOptional<z.ZodString>;
                full: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            spacing: z.ZodOptional<z.ZodObject<{
                none: z.ZodOptional<z.ZodString>;
                sm: z.ZodOptional<z.ZodString>;
                md: z.ZodOptional<z.ZodString>;
                lg: z.ZodOptional<z.ZodString>;
                xl: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            motion: z.ZodOptional<z.ZodObject<{
                durationFastMs: z.ZodOptional<z.ZodNumber>;
                durationNormalMs: z.ZodOptional<z.ZodNumber>;
                easing: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            shadow: z.ZodOptional<z.ZodObject<{
                sm: z.ZodOptional<z.ZodString>;
                md: z.ZodOptional<z.ZodString>;
                lg: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    themeId: z.ZodOptional<z.ZodString>;
    properties: z.ZodObject<{
        color: z.ZodObject<{
            pageBackground: z.ZodString;
            surface: z.ZodString;
            cardForeground: z.ZodOptional<z.ZodString>;
            popover: z.ZodOptional<z.ZodString>;
            popoverForeground: z.ZodOptional<z.ZodString>;
            surfaceMuted: z.ZodString;
            foreground: z.ZodString;
            foregroundMuted: z.ZodString;
            border: z.ZodString;
            accent: z.ZodString;
            accentForeground: z.ZodString;
            secondary: z.ZodOptional<z.ZodString>;
            secondaryForeground: z.ZodOptional<z.ZodString>;
            accentSubtle: z.ZodOptional<z.ZodString>;
            accentSubtleForeground: z.ZodOptional<z.ZodString>;
            focusRing: z.ZodString;
            destructive: z.ZodString;
            destructiveForeground: z.ZodOptional<z.ZodString>;
            input: z.ZodOptional<z.ZodString>;
            sidebar: z.ZodOptional<z.ZodString>;
            sidebarForeground: z.ZodOptional<z.ZodString>;
            sidebarPrimary: z.ZodOptional<z.ZodString>;
            sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
            sidebarAccent: z.ZodOptional<z.ZodString>;
            sidebarAccentForeground: z.ZodOptional<z.ZodString>;
            sidebarBorder: z.ZodOptional<z.ZodString>;
            sidebarRing: z.ZodOptional<z.ZodString>;
            warning: z.ZodString;
            info: z.ZodString;
            success: z.ZodString;
            chart1: z.ZodString;
            chart2: z.ZodString;
            chart3: z.ZodString;
            chart4: z.ZodString;
            chart5: z.ZodString;
        }, z.core.$strict>;
        font: z.ZodObject<{
            body: z.ZodString;
            heading: z.ZodString;
            mono: z.ZodString;
        }, z.core.$strict>;
        radius: z.ZodObject<{
            none: z.ZodString;
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
            xl: z.ZodOptional<z.ZodString>;
            full: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        spacing: z.ZodObject<{
            none: z.ZodString;
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
            xl: z.ZodString;
        }, z.core.$strict>;
        motion: z.ZodObject<{
            durationFastMs: z.ZodNumber;
            durationNormalMs: z.ZodNumber;
            easing: z.ZodString;
        }, z.core.$strict>;
        shadow: z.ZodOptional<z.ZodObject<{
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>]>;
export { componentThemeContextSchema, componentThemePayloadSchema };
export type { ComponentThemeContextV1, ComponentThemeV1 };
export declare const dataTypeDefinitions: readonly [{
    readonly id: "all-data";
    readonly label: "All data";
    readonly description: "Any JSON-serializable value.";
    readonly schema: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
}, {
    readonly id: "json-object";
    readonly label: "JSON object";
    readonly description: "A JSON object with string keys and JSON values.";
    readonly schema: z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>;
}, {
    readonly id: "json-array";
    readonly label: "JSON array";
    readonly description: "An ordered list of JSON values.";
    readonly schema: z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>;
}, {
    readonly id: "primitive";
    readonly label: "Primitive";
    readonly description: "A string, number, boolean, or null JSON value.";
    readonly schema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
}, {
    readonly id: "text-value";
    readonly label: "Text value";
    readonly description: "A plain text string value.";
    readonly schema: z.ZodString;
}, {
    readonly id: "url-string";
    readonly label: "URL string";
    readonly description: "A fully qualified URL string.";
    readonly schema: z.ZodString;
}, {
    readonly id: "event-timestamp";
    readonly label: "Event timestamp";
    readonly description: "An ISO-8601 timestamp captured when a component event fires.";
    readonly schema: z.ZodString;
}, {
    readonly id: "table-rows";
    readonly label: "Table rows";
    readonly description: "An array of JSON objects suitable for tabular rows.";
    readonly schema: z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
}, {
    readonly id: "key-value-object";
    readonly label: "Key/value object";
    readonly description: "A JSON object represented as named key/value pairs.";
    readonly schema: z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>;
}, {
    readonly id: "chart-series-xy";
    readonly label: "Chart series (x/y)";
    readonly description: "An array of chart points with x and y coordinates.";
    readonly schema: z.ZodArray<z.ZodObject<{
        x: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        y: z.ZodNumber;
        xLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, {
    readonly id: "chart-slices";
    readonly label: "Chart slices";
    readonly description: "An array of labeled numeric chart slices.";
    readonly schema: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodNumber;
    }, z.core.$strip>>;
}, {
    readonly id: "chart-cartesian-point";
    readonly label: "Chart cartesian point";
    readonly description: "A chart event payload for a clicked or hovered cartesian chart point.";
    readonly schema: z.ZodObject<{
        x: z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>;
        y: z.ZodNumber;
        seriesName: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, {
    readonly id: "chart-donut-slice";
    readonly label: "Chart donut slice";
    readonly description: "A chart event payload for a clicked or hovered donut slice.";
    readonly schema: z.ZodObject<{
        label: z.ZodString;
        value: z.ZodNumber;
    }, z.core.$strip>;
}, {
    readonly id: "chart-range";
    readonly label: "Chart range";
    readonly description: "A chart event payload for a selected numeric x-axis range.";
    readonly schema: z.ZodObject<{
        x0: z.ZodNumber;
        x1: z.ZodNumber;
    }, z.core.$strip>;
}, {
    readonly id: "chart-legend-state";
    readonly label: "Chart legend state";
    readonly description: "A chart event payload for a toggled series legend item.";
    readonly schema: z.ZodObject<{
        seriesName: z.ZodString;
        visible: z.ZodBoolean;
    }, z.core.$strip>;
}, {
    readonly id: "chart-matrix-cell";
    readonly label: "Chart matrix cell";
    readonly description: "A chart event payload for a clicked matrix, heatmap, or region-grid cell.";
    readonly schema: z.ZodObject<{
        rowKey: z.ZodString;
        columnKey: z.ZodString;
        rowIndex: z.ZodNumber;
        columnIndex: z.ZodNumber;
        value: z.ZodNumber;
        rowLabel: z.ZodOptional<z.ZodString>;
        columnLabel: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
    }, z.core.$strip>;
}, {
    readonly id: "geo-point";
    readonly label: "Geographic point";
    readonly description: "A visualization event payload for a selected latitude/longitude point.";
    readonly schema: z.ZodObject<{
        lat: z.ZodNumber;
        lon: z.ZodNumber;
        id: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodNumber>;
        source: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
    }, z.core.$strip>;
}, {
    readonly id: "graph-node";
    readonly label: "Graph node";
    readonly description: "A visualization event payload for a selected graph node.";
    readonly schema: z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        group: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodNumber>;
        source: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
    }, z.core.$strip>;
}, {
    readonly id: "graph-edge";
    readonly label: "Graph edge";
    readonly description: "A visualization event payload for a selected graph edge.";
    readonly schema: z.ZodObject<{
        source: z.ZodString;
        target: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodNumber>;
        sourceData: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
    }, z.core.$strip>;
}, {
    readonly id: "component-theme";
    readonly label: "Component theme";
    readonly description: "A canonical package component theme with fixed visual role maps.";
    readonly schema: z.ZodUnion<readonly [z.ZodObject<{
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        displayName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        properties: z.ZodObject<{
            color: z.ZodObject<{
                pageBackground: z.ZodString;
                surface: z.ZodString;
                cardForeground: z.ZodOptional<z.ZodString>;
                popover: z.ZodOptional<z.ZodString>;
                popoverForeground: z.ZodOptional<z.ZodString>;
                surfaceMuted: z.ZodString;
                foreground: z.ZodString;
                foregroundMuted: z.ZodString;
                border: z.ZodString;
                accent: z.ZodString;
                accentForeground: z.ZodString;
                secondary: z.ZodOptional<z.ZodString>;
                secondaryForeground: z.ZodOptional<z.ZodString>;
                accentSubtle: z.ZodOptional<z.ZodString>;
                accentSubtleForeground: z.ZodOptional<z.ZodString>;
                focusRing: z.ZodString;
                destructive: z.ZodString;
                destructiveForeground: z.ZodOptional<z.ZodString>;
                input: z.ZodOptional<z.ZodString>;
                sidebar: z.ZodOptional<z.ZodString>;
                sidebarForeground: z.ZodOptional<z.ZodString>;
                sidebarPrimary: z.ZodOptional<z.ZodString>;
                sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
                sidebarAccent: z.ZodOptional<z.ZodString>;
                sidebarAccentForeground: z.ZodOptional<z.ZodString>;
                sidebarBorder: z.ZodOptional<z.ZodString>;
                sidebarRing: z.ZodOptional<z.ZodString>;
                warning: z.ZodString;
                info: z.ZodString;
                success: z.ZodString;
                chart1: z.ZodString;
                chart2: z.ZodString;
                chart3: z.ZodString;
                chart4: z.ZodString;
                chart5: z.ZodString;
            }, z.core.$strict>;
            font: z.ZodObject<{
                body: z.ZodString;
                heading: z.ZodString;
                mono: z.ZodString;
            }, z.core.$strict>;
            radius: z.ZodObject<{
                none: z.ZodString;
                sm: z.ZodString;
                md: z.ZodString;
                lg: z.ZodString;
                xl: z.ZodOptional<z.ZodString>;
                full: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            spacing: z.ZodObject<{
                none: z.ZodString;
                sm: z.ZodString;
                md: z.ZodString;
                lg: z.ZodString;
                xl: z.ZodString;
            }, z.core.$strict>;
            motion: z.ZodObject<{
                durationFastMs: z.ZodNumber;
                durationNormalMs: z.ZodNumber;
                easing: z.ZodString;
            }, z.core.$strict>;
            shadow: z.ZodOptional<z.ZodObject<{
                sm: z.ZodString;
                md: z.ZodString;
                lg: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        palettes: z.ZodOptional<z.ZodObject<{
            light: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodObject<{
                    input: z.ZodOptional<z.ZodString>;
                    success: z.ZodOptional<z.ZodString>;
                    pageBackground: z.ZodOptional<z.ZodString>;
                    surface: z.ZodOptional<z.ZodString>;
                    cardForeground: z.ZodOptional<z.ZodString>;
                    popover: z.ZodOptional<z.ZodString>;
                    popoverForeground: z.ZodOptional<z.ZodString>;
                    surfaceMuted: z.ZodOptional<z.ZodString>;
                    foreground: z.ZodOptional<z.ZodString>;
                    foregroundMuted: z.ZodOptional<z.ZodString>;
                    border: z.ZodOptional<z.ZodString>;
                    accent: z.ZodOptional<z.ZodString>;
                    accentForeground: z.ZodOptional<z.ZodString>;
                    secondary: z.ZodOptional<z.ZodString>;
                    secondaryForeground: z.ZodOptional<z.ZodString>;
                    accentSubtle: z.ZodOptional<z.ZodString>;
                    accentSubtleForeground: z.ZodOptional<z.ZodString>;
                    focusRing: z.ZodOptional<z.ZodString>;
                    destructive: z.ZodOptional<z.ZodString>;
                    destructiveForeground: z.ZodOptional<z.ZodString>;
                    sidebar: z.ZodOptional<z.ZodString>;
                    sidebarForeground: z.ZodOptional<z.ZodString>;
                    sidebarPrimary: z.ZodOptional<z.ZodString>;
                    sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
                    sidebarAccent: z.ZodOptional<z.ZodString>;
                    sidebarAccentForeground: z.ZodOptional<z.ZodString>;
                    sidebarBorder: z.ZodOptional<z.ZodString>;
                    sidebarRing: z.ZodOptional<z.ZodString>;
                    warning: z.ZodOptional<z.ZodString>;
                    info: z.ZodOptional<z.ZodString>;
                    chart1: z.ZodOptional<z.ZodString>;
                    chart2: z.ZodOptional<z.ZodString>;
                    chart3: z.ZodOptional<z.ZodString>;
                    chart4: z.ZodOptional<z.ZodString>;
                    chart5: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                font: z.ZodOptional<z.ZodObject<{
                    body: z.ZodOptional<z.ZodString>;
                    heading: z.ZodOptional<z.ZodString>;
                    mono: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                radius: z.ZodOptional<z.ZodObject<{
                    none: z.ZodOptional<z.ZodString>;
                    sm: z.ZodOptional<z.ZodString>;
                    md: z.ZodOptional<z.ZodString>;
                    lg: z.ZodOptional<z.ZodString>;
                    xl: z.ZodOptional<z.ZodString>;
                    full: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                spacing: z.ZodOptional<z.ZodObject<{
                    none: z.ZodOptional<z.ZodString>;
                    sm: z.ZodOptional<z.ZodString>;
                    md: z.ZodOptional<z.ZodString>;
                    lg: z.ZodOptional<z.ZodString>;
                    xl: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                motion: z.ZodOptional<z.ZodObject<{
                    durationFastMs: z.ZodOptional<z.ZodNumber>;
                    durationNormalMs: z.ZodOptional<z.ZodNumber>;
                    easing: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                shadow: z.ZodOptional<z.ZodObject<{
                    sm: z.ZodOptional<z.ZodString>;
                    md: z.ZodOptional<z.ZodString>;
                    lg: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            dark: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodObject<{
                    input: z.ZodOptional<z.ZodString>;
                    success: z.ZodOptional<z.ZodString>;
                    pageBackground: z.ZodOptional<z.ZodString>;
                    surface: z.ZodOptional<z.ZodString>;
                    cardForeground: z.ZodOptional<z.ZodString>;
                    popover: z.ZodOptional<z.ZodString>;
                    popoverForeground: z.ZodOptional<z.ZodString>;
                    surfaceMuted: z.ZodOptional<z.ZodString>;
                    foreground: z.ZodOptional<z.ZodString>;
                    foregroundMuted: z.ZodOptional<z.ZodString>;
                    border: z.ZodOptional<z.ZodString>;
                    accent: z.ZodOptional<z.ZodString>;
                    accentForeground: z.ZodOptional<z.ZodString>;
                    secondary: z.ZodOptional<z.ZodString>;
                    secondaryForeground: z.ZodOptional<z.ZodString>;
                    accentSubtle: z.ZodOptional<z.ZodString>;
                    accentSubtleForeground: z.ZodOptional<z.ZodString>;
                    focusRing: z.ZodOptional<z.ZodString>;
                    destructive: z.ZodOptional<z.ZodString>;
                    destructiveForeground: z.ZodOptional<z.ZodString>;
                    sidebar: z.ZodOptional<z.ZodString>;
                    sidebarForeground: z.ZodOptional<z.ZodString>;
                    sidebarPrimary: z.ZodOptional<z.ZodString>;
                    sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
                    sidebarAccent: z.ZodOptional<z.ZodString>;
                    sidebarAccentForeground: z.ZodOptional<z.ZodString>;
                    sidebarBorder: z.ZodOptional<z.ZodString>;
                    sidebarRing: z.ZodOptional<z.ZodString>;
                    warning: z.ZodOptional<z.ZodString>;
                    info: z.ZodOptional<z.ZodString>;
                    chart1: z.ZodOptional<z.ZodString>;
                    chart2: z.ZodOptional<z.ZodString>;
                    chart3: z.ZodOptional<z.ZodString>;
                    chart4: z.ZodOptional<z.ZodString>;
                    chart5: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                font: z.ZodOptional<z.ZodObject<{
                    body: z.ZodOptional<z.ZodString>;
                    heading: z.ZodOptional<z.ZodString>;
                    mono: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                radius: z.ZodOptional<z.ZodObject<{
                    none: z.ZodOptional<z.ZodString>;
                    sm: z.ZodOptional<z.ZodString>;
                    md: z.ZodOptional<z.ZodString>;
                    lg: z.ZodOptional<z.ZodString>;
                    xl: z.ZodOptional<z.ZodString>;
                    full: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                spacing: z.ZodOptional<z.ZodObject<{
                    none: z.ZodOptional<z.ZodString>;
                    sm: z.ZodOptional<z.ZodString>;
                    md: z.ZodOptional<z.ZodString>;
                    lg: z.ZodOptional<z.ZodString>;
                    xl: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                motion: z.ZodOptional<z.ZodObject<{
                    durationFastMs: z.ZodOptional<z.ZodNumber>;
                    durationNormalMs: z.ZodOptional<z.ZodNumber>;
                    easing: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                shadow: z.ZodOptional<z.ZodObject<{
                    sm: z.ZodOptional<z.ZodString>;
                    md: z.ZodOptional<z.ZodString>;
                    lg: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        themeId: z.ZodOptional<z.ZodString>;
        properties: z.ZodObject<{
            color: z.ZodObject<{
                pageBackground: z.ZodString;
                surface: z.ZodString;
                cardForeground: z.ZodOptional<z.ZodString>;
                popover: z.ZodOptional<z.ZodString>;
                popoverForeground: z.ZodOptional<z.ZodString>;
                surfaceMuted: z.ZodString;
                foreground: z.ZodString;
                foregroundMuted: z.ZodString;
                border: z.ZodString;
                accent: z.ZodString;
                accentForeground: z.ZodString;
                secondary: z.ZodOptional<z.ZodString>;
                secondaryForeground: z.ZodOptional<z.ZodString>;
                accentSubtle: z.ZodOptional<z.ZodString>;
                accentSubtleForeground: z.ZodOptional<z.ZodString>;
                focusRing: z.ZodString;
                destructive: z.ZodString;
                destructiveForeground: z.ZodOptional<z.ZodString>;
                input: z.ZodOptional<z.ZodString>;
                sidebar: z.ZodOptional<z.ZodString>;
                sidebarForeground: z.ZodOptional<z.ZodString>;
                sidebarPrimary: z.ZodOptional<z.ZodString>;
                sidebarPrimaryForeground: z.ZodOptional<z.ZodString>;
                sidebarAccent: z.ZodOptional<z.ZodString>;
                sidebarAccentForeground: z.ZodOptional<z.ZodString>;
                sidebarBorder: z.ZodOptional<z.ZodString>;
                sidebarRing: z.ZodOptional<z.ZodString>;
                warning: z.ZodString;
                info: z.ZodString;
                success: z.ZodString;
                chart1: z.ZodString;
                chart2: z.ZodString;
                chart3: z.ZodString;
                chart4: z.ZodString;
                chart5: z.ZodString;
            }, z.core.$strict>;
            font: z.ZodObject<{
                body: z.ZodString;
                heading: z.ZodString;
                mono: z.ZodString;
            }, z.core.$strict>;
            radius: z.ZodObject<{
                none: z.ZodString;
                sm: z.ZodString;
                md: z.ZodString;
                lg: z.ZodString;
                xl: z.ZodOptional<z.ZodString>;
                full: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            spacing: z.ZodObject<{
                none: z.ZodString;
                sm: z.ZodString;
                md: z.ZodString;
                lg: z.ZodString;
                xl: z.ZodString;
            }, z.core.$strict>;
            motion: z.ZodObject<{
                durationFastMs: z.ZodNumber;
                durationNormalMs: z.ZodNumber;
                easing: z.ZodString;
            }, z.core.$strict>;
            shadow: z.ZodOptional<z.ZodObject<{
                sm: z.ZodString;
                md: z.ZodString;
                lg: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>]>;
}, {
    readonly id: "fetch-meta";
    readonly label: "Fetch metadata";
    readonly description: "Runtime fetch state metadata for manual and remote data sources.";
    readonly schema: z.ZodObject<{
        kind: z.ZodEnum<{
            manual: "manual";
            remote: "remote";
        }>;
        fetchedAt: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            error: "error";
            success: "success";
            idle: "idle";
            loading: "loading";
            failure: "failure";
            "stale-cache": "stale-cache";
        }>>;
        error: z.ZodOptional<z.ZodObject<{
            category: z.ZodString;
            message: z.ZodString;
            status: z.ZodOptional<z.ZodNumber>;
            details: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, {
    readonly id: "vmap1.style-descriptor";
    readonly label: "VMap style descriptor";
    readonly description: "A canonical vmap1 map style descriptor for URL, inline, or preset styles.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-style">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        mode: z.ZodEnum<{
            preset: "preset";
            url: "url";
            inline: "inline";
        }>;
        styleUrl: z.ZodOptional<z.ZodString>;
        styleJson: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>;
        preset: z.ZodOptional<z.ZodEnum<{
            dark: "dark";
            blank: "blank";
            basic: "basic";
            satellite: "satellite";
            terrain: "terrain";
        }>>;
        glyphsUrl: z.ZodOptional<z.ZodString>;
        spriteUrl: z.ZodOptional<z.ZodString>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        variants: z.ZodOptional<z.ZodObject<{
            light: z.ZodOptional<z.ZodObject<{
                styleUrl: z.ZodOptional<z.ZodString>;
                preset: z.ZodOptional<z.ZodEnum<{
                    dark: "dark";
                    blank: "blank";
                    basic: "basic";
                    satellite: "satellite";
                    terrain: "terrain";
                }>>;
            }, z.core.$loose>>;
            dark: z.ZodOptional<z.ZodObject<{
                styleUrl: z.ZodOptional<z.ZodString>;
                preset: z.ZodOptional<z.ZodEnum<{
                    dark: "dark";
                    blank: "blank";
                    basic: "basic";
                    satellite: "satellite";
                    terrain: "terrain";
                }>>;
            }, z.core.$loose>>;
        }, z.core.$loose>>;
        light: z.ZodOptional<z.ZodObject<{
            anchor: z.ZodEnum<{
                map: "map";
                viewport: "viewport";
            }>;
            color: z.ZodString;
            intensity: z.ZodNumber;
            position: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, z.core.$loose>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.tile-source-descriptor";
    readonly label: "VMap tile source descriptor";
    readonly description: "A canonical vmap1 MapLibre tile source descriptor.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-tile-source">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceType: z.ZodEnum<{
            raster: "raster";
            vector: "vector";
            "raster-dem": "raster-dem";
            tilejson: "tilejson";
        }>;
        url: z.ZodString;
        tileSize: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<256>, z.ZodLiteral<512>]>>;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.pmtiles-source-descriptor";
    readonly label: "VMap PMTiles source descriptor";
    readonly description: "A canonical vmap1 PMTiles tile source descriptor.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-pmtiles-source">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        url: z.ZodString;
        pmtilesType: z.ZodEnum<{
            raster: "raster";
            vector: "vector";
            "raster-dem": "raster-dem";
        }>;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.terrain-descriptor";
    readonly label: "VMap terrain descriptor";
    readonly description: "A canonical vmap1 terrain source activation descriptor.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-terrain-source">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        exaggeration: z.ZodNumber;
        hillshade: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.dataset-descriptor";
    readonly label: "VMap dataset descriptor";
    readonly description: "A canonical vmap1 dataset descriptor with source, status, and resolved dataset state.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-dataset">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"geojson-url">;
            url: z.ZodString;
        }, z.core.$loose>, z.ZodObject<{
            mode: z.ZodLiteral<"geojson-inline">;
            data: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
        }, z.core.$loose>, z.ZodObject<{
            mode: z.ZodLiteral<"json-url">;
            url: z.ZodString;
            mapping: z.ZodObject<{
                geometryField: z.ZodOptional<z.ZodString>;
                longitudeField: z.ZodOptional<z.ZodString>;
                latitudeField: z.ZodOptional<z.ZodString>;
                coordinatesField: z.ZodOptional<z.ZodString>;
                lineCoordinatesField: z.ZodOptional<z.ZodString>;
                originField: z.ZodOptional<z.ZodString>;
                destinationField: z.ZodOptional<z.ZodString>;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, z.core.$loose>;
        }, z.core.$loose>, z.ZodObject<{
            mode: z.ZodLiteral<"csv-url">;
            url: z.ZodString;
            mapping: z.ZodObject<{
                geometryField: z.ZodOptional<z.ZodString>;
                longitudeField: z.ZodOptional<z.ZodString>;
                latitudeField: z.ZodOptional<z.ZodString>;
                coordinatesField: z.ZodOptional<z.ZodString>;
                lineCoordinatesField: z.ZodOptional<z.ZodString>;
                originField: z.ZodOptional<z.ZodString>;
                destinationField: z.ZodOptional<z.ZodString>;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, z.core.$loose>;
        }, z.core.$loose>, z.ZodObject<{
            mode: z.ZodLiteral<"binding">;
            bindingPath: z.ZodString;
            mapping: z.ZodOptional<z.ZodObject<{
                geometryField: z.ZodOptional<z.ZodString>;
                longitudeField: z.ZodOptional<z.ZodString>;
                latitudeField: z.ZodOptional<z.ZodString>;
                coordinatesField: z.ZodOptional<z.ZodString>;
                lineCoordinatesField: z.ZodOptional<z.ZodString>;
                originField: z.ZodOptional<z.ZodString>;
                destinationField: z.ZodOptional<z.ZodString>;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, z.core.$loose>>;
        }, z.core.$loose>], "mode">;
        featureIdField: z.ZodOptional<z.ZodString>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        status: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            state: z.ZodLiteral<"idle">;
        }, z.core.$loose>, z.ZodObject<{
            state: z.ZodLiteral<"loading">;
            startedAt: z.ZodString;
        }, z.core.$loose>, z.ZodObject<{
            state: z.ZodLiteral<"ready">;
            loadedAt: z.ZodString;
            featureCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>, z.ZodObject<{
            state: z.ZodLiteral<"error">;
            message: z.ZodString;
            loadedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>], "state">>;
        resolved: z.ZodOptional<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-resolved-dataset">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
            featureCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.dataset-status";
    readonly label: "VMap dataset status";
    readonly description: "Runtime loading, ready, idle, or error status emitted by vmap1 dataset components.";
    readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"idle">;
    }, z.core.$loose>, z.ZodObject<{
        state: z.ZodLiteral<"loading">;
        startedAt: z.ZodString;
    }, z.core.$loose>, z.ZodObject<{
        state: z.ZodLiteral<"ready">;
        loadedAt: z.ZodString;
        featureCount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>, z.ZodObject<{
        state: z.ZodLiteral<"error">;
        message: z.ZodString;
        loadedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>], "state">;
}, {
    readonly id: "vmap1.resolved-dataset";
    readonly label: "VMap resolved dataset";
    readonly description: "A resolved GeoJSON-compatible dataset emitted by vmap1 dataset components.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-resolved-dataset">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
        featureCount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.dataset-registry";
    readonly label: "VMap dataset registry";
    readonly description: "A canonical vmap1 registry of dataset descriptors and resolved dataset outputs.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-dataset-registry">;
        version: z.ZodLiteral<1>;
        datasets: z.ZodArray<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-dataset">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                mode: z.ZodLiteral<"geojson-url">;
                url: z.ZodString;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"geojson-inline">;
                data: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"json-url">;
                url: z.ZodString;
                mapping: z.ZodObject<{
                    geometryField: z.ZodOptional<z.ZodString>;
                    longitudeField: z.ZodOptional<z.ZodString>;
                    latitudeField: z.ZodOptional<z.ZodString>;
                    coordinatesField: z.ZodOptional<z.ZodString>;
                    lineCoordinatesField: z.ZodOptional<z.ZodString>;
                    originField: z.ZodOptional<z.ZodString>;
                    destinationField: z.ZodOptional<z.ZodString>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, z.core.$loose>;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"csv-url">;
                url: z.ZodString;
                mapping: z.ZodObject<{
                    geometryField: z.ZodOptional<z.ZodString>;
                    longitudeField: z.ZodOptional<z.ZodString>;
                    latitudeField: z.ZodOptional<z.ZodString>;
                    coordinatesField: z.ZodOptional<z.ZodString>;
                    lineCoordinatesField: z.ZodOptional<z.ZodString>;
                    originField: z.ZodOptional<z.ZodString>;
                    destinationField: z.ZodOptional<z.ZodString>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, z.core.$loose>;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"binding">;
                bindingPath: z.ZodString;
                mapping: z.ZodOptional<z.ZodObject<{
                    geometryField: z.ZodOptional<z.ZodString>;
                    longitudeField: z.ZodOptional<z.ZodString>;
                    latitudeField: z.ZodOptional<z.ZodString>;
                    coordinatesField: z.ZodOptional<z.ZodString>;
                    lineCoordinatesField: z.ZodOptional<z.ZodString>;
                    originField: z.ZodOptional<z.ZodString>;
                    destinationField: z.ZodOptional<z.ZodString>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, z.core.$loose>>;
            }, z.core.$loose>], "mode">;
            featureIdField: z.ZodOptional<z.ZodString>;
            attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
            status: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"idle">;
            }, z.core.$loose>, z.ZodObject<{
                state: z.ZodLiteral<"loading">;
                startedAt: z.ZodString;
            }, z.core.$loose>, z.ZodObject<{
                state: z.ZodLiteral<"ready">;
                loadedAt: z.ZodString;
                featureCount: z.ZodOptional<z.ZodNumber>;
            }, z.core.$loose>, z.ZodObject<{
                state: z.ZodLiteral<"error">;
                message: z.ZodString;
                loadedAt: z.ZodOptional<z.ZodString>;
            }, z.core.$loose>], "state">>;
            resolved: z.ZodOptional<z.ZodObject<{
                kind: z.ZodLiteral<"vmap1-resolved-dataset">;
                version: z.ZodLiteral<1>;
                id: z.ZodString;
                geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
                featureCount: z.ZodOptional<z.ZodNumber>;
            }, z.core.$loose>>;
            diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                severity: z.ZodEnum<{
                    error: "error";
                    warning: "warning";
                    info: "info";
                }>;
                message: z.ZodString;
                componentId: z.ZodOptional<z.ZodString>;
                sourceId: z.ZodOptional<z.ZodString>;
                sourceRef: z.ZodOptional<z.ZodString>;
                layerId: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>;
        resolvedDatasets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-resolved-dataset">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
            featureCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.source-registry";
    readonly label: "VMap source registry";
    readonly description: "A canonical vmap1 source registry merging tiles, PMTiles, datasets, terrain, and diagnostics.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-source-registry">;
        version: z.ZodLiteral<1>;
        tileSources: z.ZodArray<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-tile-source">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            sourceType: z.ZodEnum<{
                raster: "raster";
                vector: "vector";
                "raster-dem": "raster-dem";
                tilejson: "tilejson";
            }>;
            url: z.ZodString;
            tileSize: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<256>, z.ZodLiteral<512>]>>;
            minzoom: z.ZodOptional<z.ZodNumber>;
            maxzoom: z.ZodOptional<z.ZodNumber>;
            bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
            diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                severity: z.ZodEnum<{
                    error: "error";
                    warning: "warning";
                    info: "info";
                }>;
                message: z.ZodString;
                componentId: z.ZodOptional<z.ZodString>;
                sourceId: z.ZodOptional<z.ZodString>;
                sourceRef: z.ZodOptional<z.ZodString>;
                layerId: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>;
        pmtilesSources: z.ZodArray<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-pmtiles-source">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            url: z.ZodString;
            pmtilesType: z.ZodEnum<{
                raster: "raster";
                vector: "vector";
                "raster-dem": "raster-dem";
            }>;
            minzoom: z.ZodOptional<z.ZodNumber>;
            maxzoom: z.ZodOptional<z.ZodNumber>;
            bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
            diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                severity: z.ZodEnum<{
                    error: "error";
                    warning: "warning";
                    info: "info";
                }>;
                message: z.ZodString;
                componentId: z.ZodOptional<z.ZodString>;
                sourceId: z.ZodOptional<z.ZodString>;
                sourceRef: z.ZodOptional<z.ZodString>;
                layerId: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>;
        datasets: z.ZodArray<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-dataset">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                mode: z.ZodLiteral<"geojson-url">;
                url: z.ZodString;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"geojson-inline">;
                data: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"json-url">;
                url: z.ZodString;
                mapping: z.ZodObject<{
                    geometryField: z.ZodOptional<z.ZodString>;
                    longitudeField: z.ZodOptional<z.ZodString>;
                    latitudeField: z.ZodOptional<z.ZodString>;
                    coordinatesField: z.ZodOptional<z.ZodString>;
                    lineCoordinatesField: z.ZodOptional<z.ZodString>;
                    originField: z.ZodOptional<z.ZodString>;
                    destinationField: z.ZodOptional<z.ZodString>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, z.core.$loose>;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"csv-url">;
                url: z.ZodString;
                mapping: z.ZodObject<{
                    geometryField: z.ZodOptional<z.ZodString>;
                    longitudeField: z.ZodOptional<z.ZodString>;
                    latitudeField: z.ZodOptional<z.ZodString>;
                    coordinatesField: z.ZodOptional<z.ZodString>;
                    lineCoordinatesField: z.ZodOptional<z.ZodString>;
                    originField: z.ZodOptional<z.ZodString>;
                    destinationField: z.ZodOptional<z.ZodString>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, z.core.$loose>;
            }, z.core.$loose>, z.ZodObject<{
                mode: z.ZodLiteral<"binding">;
                bindingPath: z.ZodString;
                mapping: z.ZodOptional<z.ZodObject<{
                    geometryField: z.ZodOptional<z.ZodString>;
                    longitudeField: z.ZodOptional<z.ZodString>;
                    latitudeField: z.ZodOptional<z.ZodString>;
                    coordinatesField: z.ZodOptional<z.ZodString>;
                    lineCoordinatesField: z.ZodOptional<z.ZodString>;
                    originField: z.ZodOptional<z.ZodString>;
                    destinationField: z.ZodOptional<z.ZodString>;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, z.core.$loose>>;
            }, z.core.$loose>], "mode">;
            featureIdField: z.ZodOptional<z.ZodString>;
            attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
            status: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"idle">;
            }, z.core.$loose>, z.ZodObject<{
                state: z.ZodLiteral<"loading">;
                startedAt: z.ZodString;
            }, z.core.$loose>, z.ZodObject<{
                state: z.ZodLiteral<"ready">;
                loadedAt: z.ZodString;
                featureCount: z.ZodOptional<z.ZodNumber>;
            }, z.core.$loose>, z.ZodObject<{
                state: z.ZodLiteral<"error">;
                message: z.ZodString;
                loadedAt: z.ZodOptional<z.ZodString>;
            }, z.core.$loose>], "state">>;
            resolved: z.ZodOptional<z.ZodObject<{
                kind: z.ZodLiteral<"vmap1-resolved-dataset">;
                version: z.ZodLiteral<1>;
                id: z.ZodString;
                geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
                featureCount: z.ZodOptional<z.ZodNumber>;
            }, z.core.$loose>>;
            diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                severity: z.ZodEnum<{
                    error: "error";
                    warning: "warning";
                    info: "info";
                }>;
                message: z.ZodString;
                componentId: z.ZodOptional<z.ZodString>;
                sourceId: z.ZodOptional<z.ZodString>;
                sourceRef: z.ZodOptional<z.ZodString>;
                layerId: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>;
        resolvedDatasets: z.ZodArray<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-resolved-dataset">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
            featureCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
        terrain: z.ZodOptional<z.ZodObject<{
            kind: z.ZodLiteral<"vmap1-terrain-source">;
            version: z.ZodLiteral<1>;
            id: z.ZodString;
            sourceRef: z.ZodString;
            exaggeration: z.ZodNumber;
            hillshade: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$loose>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.layer-descriptor";
    readonly label: "VMap layer descriptor";
    readonly description: "A canonical vmap1 MapLibre layer descriptor referencing public source IDs.";
    readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        layerType: z.ZodLiteral<"fill">;
        fillColor: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        fillOpacity: z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        outlineColor: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"line">;
        lineColor: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        lineWidth: z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        lineOpacity: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        lineDasharray: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodNumber>, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        lineCap: z.ZodOptional<z.ZodEnum<{
            butt: "butt";
            round: "round";
            square: "square";
        }>>;
        lineJoin: z.ZodOptional<z.ZodEnum<{
            round: "round";
            bevel: "bevel";
            miter: "miter";
        }>>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"circle">;
        circleRadius: z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        circleColor: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        circleOpacity: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        circleStrokeColor: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        circleStrokeWidth: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"symbol">;
        textField: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        iconImage: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        textSize: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        textColor: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        textHaloColor: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        textHaloWidth: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        allowOverlap: z.ZodOptional<z.ZodBoolean>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"heatmap">;
        weightField: z.ZodOptional<z.ZodString>;
        heatmapWeight: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        heatmapIntensity: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        heatmapRadius: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        heatmapOpacity: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        colorRamp: z.ZodOptional<z.ZodArray<z.ZodString>>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"extrusion">;
        heightField: z.ZodOptional<z.ZodString>;
        baseHeightField: z.ZodOptional<z.ZodString>;
        fillExtrusionColor: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        fillExtrusionHeight: z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>;
        fillExtrusionBase: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>]>>;
        fillExtrusionOpacity: z.ZodOptional<z.ZodNumber>;
        fillExtrusionVerticalGradient: z.ZodOptional<z.ZodBoolean>;
        fillExtrusionTranslate: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        fillExtrusionTranslateAnchor: z.ZodOptional<z.ZodEnum<{
            map: "map";
            viewport: "viewport";
        }>>;
        fillExtrusionPattern: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"raster">;
        rasterOpacity: z.ZodOptional<z.ZodNumber>;
        rasterBrightnessMin: z.ZodOptional<z.ZodNumber>;
        rasterBrightnessMax: z.ZodOptional<z.ZodNumber>;
        rasterContrast: z.ZodOptional<z.ZodNumber>;
        rasterSaturation: z.ZodOptional<z.ZodNumber>;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>, z.ZodObject<{
        layerType: z.ZodLiteral<"terrain">;
        terrainSourceRef: z.ZodString;
        exaggeration: z.ZodNumber;
        kind: z.ZodLiteral<"vmap1-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        sourceRef: z.ZodString;
        sourceLayer: z.ZodOptional<z.ZodString>;
        visible: z.ZodBoolean;
        minzoom: z.ZodOptional<z.ZodNumber>;
        maxzoom: z.ZodOptional<z.ZodNumber>;
        filter: z.ZodOptional<z.ZodArray<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>>;
        beforeLayerId: z.ZodOptional<z.ZodString>;
        interactive: z.ZodOptional<z.ZodBoolean>;
        attribution: z.ZodOptional<z.ZodArray<z.ZodString>>;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>], "layerType">;
}, {
    readonly id: "vmap1.deck-layer-descriptor";
    readonly label: "VMap deck layer descriptor";
    readonly description: "A canonical vmap1 deck.gl overlay descriptor referencing public source IDs.";
    readonly schema: z.ZodObject<{
        kind: z.ZodLiteral<"vmap1-deck-layer">;
        version: z.ZodLiteral<1>;
        id: z.ZodString;
        deckLayerType: z.ZodEnum<{
            path: "path";
            geojson: "geojson";
            line: "line";
            heatmap: "heatmap";
            scatterplot: "scatterplot";
            arc: "arc";
            trips: "trips";
            hexagon: "hexagon";
            "h3-hexagon": "h3-hexagon";
            grid: "grid";
        }>;
        sourceRef: z.ZodString;
        props: z.ZodRecord<z.ZodString, z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>;
        accessors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        picking: z.ZodBoolean;
        visible: z.ZodBoolean;
        displayName: z.ZodOptional<z.ZodString>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            componentId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            sourceRef: z.ZodOptional<z.ZodString>;
            layerId: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonObject, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonObject, unknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, {
    readonly id: "vmap1.initial-view";
    readonly label: "VMap initial view";
    readonly description: "Initial vmap1 camera state for center, zoom, pitch, and bearing.";
    readonly schema: z.ZodObject<{
        initialCenter: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        initialZoom: z.ZodOptional<z.ZodNumber>;
        initialPitch: z.ZodOptional<z.ZodNumber>;
        initialBearing: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>;
}];
export type DataTypeId = (typeof dataTypeDefinitions)[number]["id"];
export declare const dataTypeDefinitionsById: ReadonlyMap<string, DataTypeDefinition>;
export declare const dataTypeIds: ("all-data" | "json-object" | "json-array" | "primitive" | "text-value" | "url-string" | "event-timestamp" | "table-rows" | "key-value-object" | "chart-series-xy" | "chart-slices" | "chart-cartesian-point" | "chart-donut-slice" | "chart-range" | "chart-legend-state" | "chart-matrix-cell" | "geo-point" | "graph-node" | "graph-edge" | "component-theme" | "fetch-meta" | "vmap1.style-descriptor" | "vmap1.tile-source-descriptor" | "vmap1.pmtiles-source-descriptor" | "vmap1.terrain-descriptor" | "vmap1.dataset-descriptor" | "vmap1.dataset-status" | "vmap1.resolved-dataset" | "vmap1.dataset-registry" | "vmap1.source-registry" | "vmap1.layer-descriptor" | "vmap1.deck-layer-descriptor" | "vmap1.initial-view")[];
export declare function getDataTypeDefinition(typeId: string): DataTypeDefinition | undefined;
export declare function getDataTypeSchema(typeId: string): ZodTypeAny | undefined;
export declare function isKnownDataTypeId(typeId: string): boolean;
export declare function isDataTypeCompatible(sourceTypeId: string, targetTypeId: string, options?: {
    acceptedSourceTypeIds?: Iterable<string>;
}): boolean;
