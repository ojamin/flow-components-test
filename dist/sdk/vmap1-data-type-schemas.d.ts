import { z } from "zod";
export declare const vmap1StyleDescriptorSchema: z.ZodObject<{
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
export declare const vmap1TileSourceDescriptorSchema: z.ZodObject<{
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
export declare const vmap1PmtilesSourceDescriptorSchema: z.ZodObject<{
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
export declare const vmap1TerrainDescriptorSchema: z.ZodObject<{
    kind: z.ZodLiteral<"vmap1-terrain-source">;
    version: z.ZodLiteral<1>;
    id: z.ZodString;
    sourceRef: z.ZodString;
    exaggeration: z.ZodNumber;
    hillshade: z.ZodOptional<z.ZodBoolean>;
}, z.core.$loose>;
export declare const vmap1DatasetStatusSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const vmap1ResolvedDatasetSchema: z.ZodObject<{
    kind: z.ZodLiteral<"vmap1-resolved-dataset">;
    version: z.ZodLiteral<1>;
    id: z.ZodString;
    geojson: z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>;
    featureCount: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export declare const vmap1DatasetDescriptorSchema: z.ZodObject<{
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
export declare const vmap1DatasetRegistrySchema: z.ZodObject<{
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
export declare const vmap1LayerDescriptorSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const vmap1DeckLayerDescriptorSchema: z.ZodObject<{
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
export declare const vmap1SourceRegistrySchema: z.ZodObject<{
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
export declare const vmap1InitialViewSchema: z.ZodObject<{
    initialCenter: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    initialZoom: z.ZodOptional<z.ZodNumber>;
    initialPitch: z.ZodOptional<z.ZodNumber>;
    initialBearing: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
