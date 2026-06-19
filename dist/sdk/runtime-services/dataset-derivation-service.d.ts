import { z } from "zod";
import { type JsonValue } from "../schema-primitives.js";
export declare const datasetDerivationKinds: readonly ["root-json-parse", "path-index", "table-columns", "chart-field-options", "chart-series-mapping"];
export type DatasetDerivationKind = (typeof datasetDerivationKinds)[number];
export declare const datasetDerivationKindSchema: z.ZodEnum<{
    "root-json-parse": "root-json-parse";
    "path-index": "path-index";
    "table-columns": "table-columns";
    "chart-field-options": "chart-field-options";
    "chart-series-mapping": "chart-series-mapping";
}>;
export declare const datasetDerivationHashSchema: z.ZodString;
export declare const datasetDerivationRevisionSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
export declare const datasetDerivationRootSourceSchema: z.ZodObject<{
    id: z.ZodString;
    contentRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    contentHash: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DatasetDerivationRootSource = z.infer<typeof datasetDerivationRootSourceSchema>;
export declare const datasetDerivationTargetSchema: z.ZodObject<{
    componentId: z.ZodOptional<z.ZodString>;
    transformId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DatasetDerivationTarget = z.infer<typeof datasetDerivationTargetSchema>;
export declare const datasetDerivationMaterializationSchema: z.ZodObject<{
    definitionRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    sourceRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    materializationRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    definitionHash: z.ZodOptional<z.ZodString>;
    sourceHash: z.ZodOptional<z.ZodString>;
    materializationHash: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DatasetDerivationMaterialization = z.infer<typeof datasetDerivationMaterializationSchema>;
export declare const datasetDerivationCacheKeyPartsSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        "root-json-parse": "root-json-parse";
        "path-index": "path-index";
        "table-columns": "table-columns";
        "chart-field-options": "chart-field-options";
        "chart-series-mapping": "chart-series-mapping";
    }>;
    rootSource: z.ZodObject<{
        id: z.ZodString;
        contentRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        contentHash: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    datasetPath: z.ZodString;
    target: z.ZodObject<{
        componentId: z.ZodOptional<z.ZodString>;
        transformId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    materialization: z.ZodObject<{
        definitionRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        sourceRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        materializationRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        definitionHash: z.ZodOptional<z.ZodString>;
        sourceHash: z.ZodOptional<z.ZodString>;
        materializationHash: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    configSignature: z.ZodString;
}, z.core.$strip>;
export type DatasetDerivationCacheKeyParts = z.infer<typeof datasetDerivationCacheKeyPartsSchema>;
export declare const datasetDerivationRequestSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        "root-json-parse": "root-json-parse";
        "path-index": "path-index";
        "table-columns": "table-columns";
        "chart-field-options": "chart-field-options";
        "chart-series-mapping": "chart-series-mapping";
    }>;
    rootSource: z.ZodObject<{
        id: z.ZodString;
        contentRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        contentHash: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    datasetPath: z.ZodString;
    target: z.ZodObject<{
        componentId: z.ZodOptional<z.ZodString>;
        transformId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    materialization: z.ZodObject<{
        definitionRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        sourceRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        materializationRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        definitionHash: z.ZodOptional<z.ZodString>;
        sourceHash: z.ZodOptional<z.ZodString>;
        materializationHash: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    configSignature: z.ZodString;
    requestId: z.ZodString;
    projectRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    expectedProjectRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    cacheKey: z.ZodOptional<z.ZodString>;
    dataset: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    table: z.ZodOptional<z.ZodUnknown>;
    chartFieldOptions: z.ZodOptional<z.ZodUnknown>;
    chartSeriesMapping: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export type DatasetDerivationRequest = z.infer<typeof datasetDerivationRequestSchema>;
export declare const datasetPathIndexEntrySchema: z.ZodObject<{
    path: z.ZodString;
    valueKind: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        object: "object";
        null: "null";
        array: "array";
    }>;
    childCount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type DatasetPathIndexEntry = z.infer<typeof datasetPathIndexEntrySchema>;
export declare const datasetTableColumnSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    valueKind: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        unknown: "unknown";
        date: "date";
        mixed: "mixed";
    }>;
    sampleCount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type DatasetTableColumn = z.infer<typeof datasetTableColumnSchema>;
export declare const datasetChartFieldRoleSchema: z.ZodEnum<{
    value: "value";
    label: "label";
    x: "x";
    y: "y";
}>;
export declare const datasetChartFieldOptionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    path: z.ZodString;
    label: z.ZodString;
    sampleValue: z.ZodNullable<z.ZodString>;
    availableRowCount: z.ZodNumber;
    numericRowCount: z.ZodNumber;
    categoricalRowCount: z.ZodNumber;
    supportedRoles: z.ZodArray<z.ZodEnum<{
        value: "value";
        label: "label";
        x: "x";
        y: "y";
    }>>;
    valueKind: z.ZodOptional<z.ZodEnum<{
        string: "string";
        number: "number";
        unknown: "unknown";
        date: "date";
        category: "category";
        mixed: "mixed";
    }>>;
}, z.core.$strip>;
export type DatasetChartFieldOption = z.infer<typeof datasetChartFieldOptionSchema>;
export declare const datasetChartAdapterStateSchema: z.ZodObject<{
    tone: z.ZodEnum<{
        error: "error";
        loading: "loading";
        ready: "ready";
        empty: "empty";
    }>;
    title: z.ZodNullable<z.ZodString>;
    description: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const datasetChartSeriesPointSchema: z.ZodObject<{
    x: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    y: z.ZodNumber;
    xLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const datasetChartSliceSchema: z.ZodObject<{
    label: z.ZodString;
    value: z.ZodNumber;
}, z.core.$strip>;
export declare const datasetChartSeriesMappingSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
    totalRowCount: z.ZodNumber;
    skippedRowCount: z.ZodNumber;
    state: z.ZodObject<{
        tone: z.ZodEnum<{
            error: "error";
            loading: "loading";
            ready: "ready";
            empty: "empty";
        }>;
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    kind: z.ZodLiteral<"xy">;
    data: z.ZodArray<z.ZodObject<{
        x: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        y: z.ZodNumber;
        xLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    fields: z.ZodObject<{
        x: z.ZodString;
        y: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    ok: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
    totalRowCount: z.ZodNumber;
    skippedRowCount: z.ZodNumber;
    state: z.ZodObject<{
        tone: z.ZodEnum<{
            error: "error";
            loading: "loading";
            ready: "ready";
            empty: "empty";
        }>;
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    kind: z.ZodLiteral<"slice">;
    data: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodNumber;
    }, z.core.$strip>>;
    fields: z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>], "kind">;
export type DatasetChartSeriesMapping = z.infer<typeof datasetChartSeriesMappingSchema>;
export declare const datasetDerivationResultSchema: z.ZodObject<{
    parsedJson: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    pathIndex: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        valueKind: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            object: "object";
            null: "null";
            array: "array";
        }>;
        childCount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    tableColumns: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        valueKind: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            unknown: "unknown";
            date: "date";
            mixed: "mixed";
        }>;
        sampleCount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    chartFieldOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        path: z.ZodString;
        label: z.ZodString;
        sampleValue: z.ZodNullable<z.ZodString>;
        availableRowCount: z.ZodNumber;
        numericRowCount: z.ZodNumber;
        categoricalRowCount: z.ZodNumber;
        supportedRoles: z.ZodArray<z.ZodEnum<{
            value: "value";
            label: "label";
            x: "x";
            y: "y";
        }>>;
        valueKind: z.ZodOptional<z.ZodEnum<{
            string: "string";
            number: "number";
            unknown: "unknown";
            date: "date";
            category: "category";
            mixed: "mixed";
        }>>;
    }, z.core.$strip>>>;
    chartSeriesMappings: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        totalRowCount: z.ZodNumber;
        skippedRowCount: z.ZodNumber;
        state: z.ZodObject<{
            tone: z.ZodEnum<{
                error: "error";
                loading: "loading";
                ready: "ready";
                empty: "empty";
            }>;
            title: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
        kind: z.ZodLiteral<"xy">;
        data: z.ZodArray<z.ZodObject<{
            x: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            y: z.ZodNumber;
            xLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        fields: z.ZodObject<{
            x: z.ZodString;
            y: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        ok: z.ZodBoolean;
        error: z.ZodNullable<z.ZodString>;
        totalRowCount: z.ZodNumber;
        skippedRowCount: z.ZodNumber;
        state: z.ZodObject<{
            tone: z.ZodEnum<{
                error: "error";
                loading: "loading";
                ready: "ready";
                empty: "empty";
            }>;
            title: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
        kind: z.ZodLiteral<"slice">;
        data: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodNumber;
        }, z.core.$strip>>;
        fields: z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], "kind">>>;
    diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodEnum<{
            error: "error";
            warning: "warning";
            info: "info";
        }>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type DatasetDerivationResult = z.infer<typeof datasetDerivationResultSchema>;
export declare const datasetDerivationErrorSchema: z.ZodObject<{
    category: z.ZodEnum<{
        "invalid-json": "invalid-json";
        "worker-failure": "worker-failure";
        "stale-revision": "stale-revision";
        "unsupported-derivation": "unsupported-derivation";
        cancelled: "cancelled";
    }>;
    message: z.ZodString;
    safeDetails: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DatasetDerivationError = z.infer<typeof datasetDerivationErrorSchema>;
export declare const datasetDerivationResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"success">;
    requestId: z.ZodString;
    kind: z.ZodEnum<{
        "root-json-parse": "root-json-parse";
        "path-index": "path-index";
        "table-columns": "table-columns";
        "chart-field-options": "chart-field-options";
        "chart-series-mapping": "chart-series-mapping";
    }>;
    cacheKey: z.ZodOptional<z.ZodString>;
    result: z.ZodObject<{
        parsedJson: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
        pathIndex: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            valueKind: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                object: "object";
                null: "null";
                array: "array";
            }>;
            childCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        tableColumns: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            valueKind: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                unknown: "unknown";
                date: "date";
                mixed: "mixed";
            }>;
            sampleCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        chartFieldOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            path: z.ZodString;
            label: z.ZodString;
            sampleValue: z.ZodNullable<z.ZodString>;
            availableRowCount: z.ZodNumber;
            numericRowCount: z.ZodNumber;
            categoricalRowCount: z.ZodNumber;
            supportedRoles: z.ZodArray<z.ZodEnum<{
                value: "value";
                label: "label";
                x: "x";
                y: "y";
            }>>;
            valueKind: z.ZodOptional<z.ZodEnum<{
                string: "string";
                number: "number";
                unknown: "unknown";
                date: "date";
                category: "category";
                mixed: "mixed";
            }>>;
        }, z.core.$strip>>>;
        chartSeriesMappings: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            ok: z.ZodBoolean;
            error: z.ZodNullable<z.ZodString>;
            totalRowCount: z.ZodNumber;
            skippedRowCount: z.ZodNumber;
            state: z.ZodObject<{
                tone: z.ZodEnum<{
                    error: "error";
                    loading: "loading";
                    ready: "ready";
                    empty: "empty";
                }>;
                title: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>;
            kind: z.ZodLiteral<"xy">;
            data: z.ZodArray<z.ZodObject<{
                x: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
                y: z.ZodNumber;
                xLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
            fields: z.ZodObject<{
                x: z.ZodString;
                y: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>, z.ZodObject<{
            ok: z.ZodBoolean;
            error: z.ZodNullable<z.ZodString>;
            totalRowCount: z.ZodNumber;
            skippedRowCount: z.ZodNumber;
            state: z.ZodObject<{
                tone: z.ZodEnum<{
                    error: "error";
                    loading: "loading";
                    ready: "ready";
                    empty: "empty";
                }>;
                title: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>;
            kind: z.ZodLiteral<"slice">;
            data: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodNumber;
            }, z.core.$strip>>;
            fields: z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>], "kind">>>;
        diagnostics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"failure">;
    requestId: z.ZodString;
    error: z.ZodObject<{
        category: z.ZodEnum<{
            "invalid-json": "invalid-json";
            "worker-failure": "worker-failure";
            "stale-revision": "stale-revision";
            "unsupported-derivation": "unsupported-derivation";
            cancelled: "cancelled";
        }>;
        message: z.ZodString;
        safeDetails: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"stale">;
    requestId: z.ZodString;
    expectedRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    actualRevision: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>], "status">;
export type DatasetDerivationResponse = z.infer<typeof datasetDerivationResponseSchema>;
export declare const datasetDerivationProgressSchema: z.ZodObject<{
    requestId: z.ZodString;
    stage: z.ZodEnum<{
        queued: "queued";
        parsing: "parsing";
        indexing: "indexing";
        deriving: "deriving";
        completed: "completed";
    }>;
    completedUnits: z.ZodOptional<z.ZodNumber>;
    totalUnits: z.ZodOptional<z.ZodNumber>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DatasetDerivationProgress = z.infer<typeof datasetDerivationProgressSchema>;
export interface DatasetDerivationService {
    derive(request: DatasetDerivationRequest, onProgress?: (progress: DatasetDerivationProgress) => void): Promise<DatasetDerivationResponse>;
    clearCache(scope?: {
        projectId?: string;
        rootSourceId?: string;
    }): void;
}
export type DatasetDerivationJsonValue = JsonValue;
