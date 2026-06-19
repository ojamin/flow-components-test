import { z } from "zod";
export declare function isPrototypeSensitiveOutputKey(field: string): boolean;
export declare function assertSafeRowTransformOutputField(field: string, configPath: string): string;
export declare const rowSortDirectionSchema: z.ZodEnum<{
    asc: "asc";
    desc: "desc";
}>;
export declare const rowAggregateOperationSchema: z.ZodEnum<{
    min: "min";
    max: "max";
    sum: "sum";
    average: "average";
    count: "count";
}>;
export declare const rowTransformBaseConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const rowSortConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"sort">;
    keys: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const rowFilterOperatorSchema: z.ZodEnum<{
    in: "in";
    endsWith: "endsWith";
    startsWith: "startsWith";
    equals: "equals";
    notEquals: "notEquals";
    contains: "contains";
    greaterThan: "greaterThan";
    greaterThanOrEqual: "greaterThanOrEqual";
    lessThan: "lessThan";
    lessThanOrEqual: "lessThanOrEqual";
    exists: "exists";
    isEmpty: "isEmpty";
    notIn: "notIn";
}>;
export declare const rowFilterConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"filter">;
    clauses: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<{
            in: "in";
            endsWith: "endsWith";
            startsWith: "startsWith";
            equals: "equals";
            notEquals: "notEquals";
            contains: "contains";
            greaterThan: "greaterThan";
            greaterThanOrEqual: "greaterThanOrEqual";
            lessThan: "lessThan";
            lessThanOrEqual: "lessThanOrEqual";
            exists: "exists";
            isEmpty: "isEmpty";
            notIn: "notIn";
        }>;
        value: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>;
    }, z.core.$strip>>;
    match: z.ZodDefault<z.ZodEnum<{
        any: "any";
        all: "all";
    }>>;
}, z.core.$strip>;
export declare const rowSelectConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"select">;
    fields: z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const rowLookupConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"lookup">;
    lookupRowsPath: z.ZodDefault<z.ZodString>;
    leftKey: z.ZodString;
    rightKey: z.ZodString;
    fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    unmatched: z.ZodDefault<z.ZodEnum<{
        keep: "keep";
        drop: "drop";
    }>>;
    multiple: z.ZodDefault<z.ZodEnum<{
        all: "all";
        first: "first";
    }>>;
    prefix: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const rowAggregateConfigSchema: z.ZodObject<{
    sourceField: z.ZodOptional<z.ZodString>;
    operation: z.ZodEnum<{
        min: "min";
        max: "max";
        sum: "sum";
        average: "average";
        count: "count";
    }>;
    outputField: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const rowGroupConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"group">;
    groupByFields: z.ZodArray<z.ZodString>;
    countField: z.ZodDefault<z.ZodString>;
    aggregates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        sourceField: z.ZodOptional<z.ZodString>;
        operation: z.ZodEnum<{
            min: "min";
            max: "max";
            sum: "sum";
            average: "average";
            count: "count";
        }>;
        outputField: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const rowPivotConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"pivot">;
    groupByFields: z.ZodArray<z.ZodString>;
    pivotField: z.ZodString;
    valueField: z.ZodOptional<z.ZodString>;
    aggregate: z.ZodDefault<z.ZodEnum<{
        min: "min";
        max: "max";
        sum: "sum";
        average: "average";
        count: "count";
    }>>;
    outputPrefix: z.ZodDefault<z.ZodString>;
    countField: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const rowFlattenConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"flatten">;
    field: z.ZodString;
    outputField: z.ZodOptional<z.ZodString>;
    keepEmpty: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const rowDedupeConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"dedupe">;
    keyFields: z.ZodDefault<z.ZodArray<z.ZodString>>;
    keep: z.ZodDefault<z.ZodEnum<{
        first: "first";
        last: "last";
    }>>;
}, z.core.$strip>;
export declare const rowDateBucketConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"dateBucket">;
    field: z.ZodString;
    outputField: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<{
        hour: "hour";
        day: "day";
        week: "week";
        month: "month";
        year: "year";
    }>>;
}, z.core.$strip>;
export declare const rowNormalizeMethodSchema: z.ZodEnum<{
    minMax: "minMax";
    zScore: "zScore";
}>;
export declare const rowNormalizeConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"normalize">;
    fields: z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
        method: z.ZodDefault<z.ZodEnum<{
            minMax: "minMax";
            zScore: "zScore";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const rowFormatOperationSchema: z.ZodEnum<{
    string: "string";
    trim: "trim";
    uppercase: "uppercase";
    lowercase: "lowercase";
    numberFixed: "numberFixed";
    dateIso: "dateIso";
}>;
export declare const rowFormatConfigSchema: z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"format">;
    fields: z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
        format: z.ZodEnum<{
            string: "string";
            trim: "trim";
            uppercase: "uppercase";
            lowercase: "lowercase";
            numberFixed: "numberFixed";
            dateIso: "dateIso";
        }>;
        decimals: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const rowTransformConfigSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"sort">;
    keys: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"filter">;
    clauses: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<{
            in: "in";
            endsWith: "endsWith";
            startsWith: "startsWith";
            equals: "equals";
            notEquals: "notEquals";
            contains: "contains";
            greaterThan: "greaterThan";
            greaterThanOrEqual: "greaterThanOrEqual";
            lessThan: "lessThan";
            lessThanOrEqual: "lessThanOrEqual";
            exists: "exists";
            isEmpty: "isEmpty";
            notIn: "notIn";
        }>;
        value: z.ZodOptional<z.ZodType<import("./schema-primitives.js").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema-primitives.js").JsonValue, unknown>>>;
    }, z.core.$strip>>;
    match: z.ZodDefault<z.ZodEnum<{
        any: "any";
        all: "all";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"select">;
    fields: z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"lookup">;
    lookupRowsPath: z.ZodDefault<z.ZodString>;
    leftKey: z.ZodString;
    rightKey: z.ZodString;
    fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    unmatched: z.ZodDefault<z.ZodEnum<{
        keep: "keep";
        drop: "drop";
    }>>;
    multiple: z.ZodDefault<z.ZodEnum<{
        all: "all";
        first: "first";
    }>>;
    prefix: z.ZodDefault<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"group">;
    groupByFields: z.ZodArray<z.ZodString>;
    countField: z.ZodDefault<z.ZodString>;
    aggregates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        sourceField: z.ZodOptional<z.ZodString>;
        operation: z.ZodEnum<{
            min: "min";
            max: "max";
            sum: "sum";
            average: "average";
            count: "count";
        }>;
        outputField: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"pivot">;
    groupByFields: z.ZodArray<z.ZodString>;
    pivotField: z.ZodString;
    valueField: z.ZodOptional<z.ZodString>;
    aggregate: z.ZodDefault<z.ZodEnum<{
        min: "min";
        max: "max";
        sum: "sum";
        average: "average";
        count: "count";
    }>>;
    outputPrefix: z.ZodDefault<z.ZodString>;
    countField: z.ZodDefault<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"flatten">;
    field: z.ZodString;
    outputField: z.ZodOptional<z.ZodString>;
    keepEmpty: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"dedupe">;
    keyFields: z.ZodDefault<z.ZodArray<z.ZodString>>;
    keep: z.ZodDefault<z.ZodEnum<{
        first: "first";
        last: "last";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"dateBucket">;
    field: z.ZodString;
    outputField: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<{
        hour: "hour";
        day: "day";
        week: "week";
        month: "month";
        year: "year";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"normalize">;
    fields: z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
        method: z.ZodDefault<z.ZodEnum<{
            minMax: "minMax";
            zScore: "zScore";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    rowsPath: z.ZodDefault<z.ZodString>;
    operation: z.ZodLiteral<"format">;
    fields: z.ZodArray<z.ZodObject<{
        sourceField: z.ZodString;
        outputField: z.ZodOptional<z.ZodString>;
        format: z.ZodEnum<{
            string: "string";
            trim: "trim";
            uppercase: "uppercase";
            lowercase: "lowercase";
            numberFixed: "numberFixed";
            dateIso: "dateIso";
        }>;
        decimals: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>], "operation">;
export type RowTransformConfig = z.output<typeof rowTransformConfigSchema>;
export type RowTransformInputConfig = z.input<typeof rowTransformConfigSchema>;
export type RowAggregateOperation = z.output<typeof rowAggregateOperationSchema>;
export type RowFilterOperator = z.output<typeof rowFilterOperatorSchema>;
