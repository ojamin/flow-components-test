import { z } from "zod";
export declare const componentManifestGroupSchema: z.ZodEnum<{
    transform: "transform";
    data: "data";
    chart: "chart";
    content: "content";
    civic: "civic";
    layout: "layout";
    marketing: "marketing";
    theme: "theme";
    vmap1: "vmap1";
    viz: "viz";
}>;
export type ComponentManifestGroup = z.infer<typeof componentManifestGroupSchema>;
export declare const componentManifestEntrySchema: z.ZodObject<{
    definition: z.ZodString;
    renderer: z.ZodString;
    configPanel: z.ZodString;
    transform: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const componentManifestResponsiveDefaultsSchema: z.ZodObject<{
    mobileFullWidth: z.ZodOptional<z.ZodBoolean>;
    mobileMinRows: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const fixtureVariantMetaSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    appliesTo: z.ZodOptional<z.ZodEnum<{
        "fixture-data": "fixture-data";
        config: "config";
    }>>;
}, z.core.$strip>;
export declare const stateApplicabilitySchema: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
    notApplicable: z.ZodString;
}, z.core.$strip>]>;
export declare const stateSupportMetaSchema: z.ZodObject<{
    empty: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
    loading: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
    error: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
    disabled: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
    focus: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
    keyboard: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
    responsive: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
        notApplicable: z.ZodString;
    }, z.core.$strip>]>;
}, z.core.$strip>;
export declare const componentManifestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    displayName: z.ZodString;
    group: z.ZodEnum<{
        transform: "transform";
        data: "data";
        chart: "chart";
        content: "content";
        civic: "civic";
        layout: "layout";
        marketing: "marketing";
        theme: "theme";
        vmap1: "vmap1";
        viz: "viz";
    }>;
    section: z.ZodOptional<z.ZodString>;
    tags: z.ZodArray<z.ZodString>;
    version: z.ZodString;
    renderable: z.ZodBoolean;
    responsiveDefaults: z.ZodOptional<z.ZodObject<{
        mobileFullWidth: z.ZodOptional<z.ZodBoolean>;
        mobileMinRows: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    fixtureVariants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        appliesTo: z.ZodOptional<z.ZodEnum<{
            "fixture-data": "fixture-data";
            config: "config";
        }>>;
    }, z.core.$strip>>>;
    stateSupport: z.ZodOptional<z.ZodObject<{
        empty: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        loading: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        error: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        disabled: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        focus: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        keyboard: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        responsive: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
    }, z.core.$strip>>;
    transformKind: z.ZodDefault<z.ZodEnum<{
        module: "module";
        passthrough: "passthrough";
    }>>;
    entry: z.ZodObject<{
        definition: z.ZodString;
        renderer: z.ZodString;
        configPanel: z.ZodString;
        transform: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ComponentManifest = z.infer<typeof componentManifestSchema>;
export declare const componentManifestSummarySchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    group: z.ZodEnum<{
        transform: "transform";
        data: "data";
        chart: "chart";
        content: "content";
        civic: "civic";
        layout: "layout";
        marketing: "marketing";
        theme: "theme";
        vmap1: "vmap1";
        viz: "viz";
    }>;
    section: z.ZodOptional<z.ZodString>;
    source: z.ZodLiteral<"static">;
    sourceId: z.ZodString;
    version: z.ZodString;
    renderable: z.ZodBoolean;
    tags: z.ZodArray<z.ZodString>;
    sourcePath: z.ZodString;
    contentHash: z.ZodString;
    runtimeRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
    responsiveDefaults: z.ZodOptional<z.ZodObject<{
        mobileFullWidth: z.ZodOptional<z.ZodBoolean>;
        mobileMinRows: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    fixtureVariants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        appliesTo: z.ZodOptional<z.ZodEnum<{
            "fixture-data": "fixture-data";
            config: "config";
        }>>;
    }, z.core.$strip>>>;
    stateSupport: z.ZodOptional<z.ZodObject<{
        empty: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        loading: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        error: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        disabled: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        focus: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        keyboard: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
        responsive: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
            notApplicable: z.ZodString;
        }, z.core.$strip>]>;
    }, z.core.$strip>>;
    deprecated: z.ZodOptional<z.ZodBoolean>;
    experimental: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type ComponentManifestSummary = z.infer<typeof componentManifestSummarySchema>;
export declare const componentGroupSummarySchema: z.ZodObject<{
    id: z.ZodEnum<{
        transform: "transform";
        data: "data";
        chart: "chart";
        content: "content";
        civic: "civic";
        layout: "layout";
        marketing: "marketing";
        theme: "theme";
        vmap1: "vmap1";
        viz: "viz";
    }>;
    displayName: z.ZodString;
    componentIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type ComponentGroupSummary = z.infer<typeof componentGroupSummarySchema>;
export declare const componentSourceManifestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    sourceId: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    generatedAt: z.ZodString;
    packageName: z.ZodOptional<z.ZodString>;
    commit: z.ZodOptional<z.ZodString>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodString;
        group: z.ZodEnum<{
            transform: "transform";
            data: "data";
            chart: "chart";
            content: "content";
            civic: "civic";
            layout: "layout";
            marketing: "marketing";
            theme: "theme";
            vmap1: "vmap1";
            viz: "viz";
        }>;
        section: z.ZodOptional<z.ZodString>;
        source: z.ZodLiteral<"static">;
        sourceId: z.ZodString;
        version: z.ZodString;
        renderable: z.ZodBoolean;
        tags: z.ZodArray<z.ZodString>;
        sourcePath: z.ZodString;
        contentHash: z.ZodString;
        runtimeRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
        responsiveDefaults: z.ZodOptional<z.ZodObject<{
            mobileFullWidth: z.ZodOptional<z.ZodBoolean>;
            mobileMinRows: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        fixtureVariants: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            appliesTo: z.ZodOptional<z.ZodEnum<{
                "fixture-data": "fixture-data";
                config: "config";
            }>>;
        }, z.core.$strip>>>;
        stateSupport: z.ZodOptional<z.ZodObject<{
            empty: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
            loading: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
            error: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
            disabled: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
            focus: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
            keyboard: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
            responsive: z.ZodUnion<readonly [z.ZodLiteral<true>, z.ZodObject<{
                notApplicable: z.ZodString;
            }, z.core.$strip>]>;
        }, z.core.$strip>>;
        deprecated: z.ZodOptional<z.ZodBoolean>;
        experimental: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    groups: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            transform: "transform";
            data: "data";
            chart: "chart";
            content: "content";
            civic: "civic";
            layout: "layout";
            marketing: "marketing";
            theme: "theme";
            vmap1: "vmap1";
            viz: "viz";
        }>;
        displayName: z.ZodString;
        componentIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    fingerprints: z.ZodObject<{
        manifestHash: z.ZodString;
        filesHash: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type GeneratedComponentSourceManifest = z.infer<typeof componentSourceManifestSchema>;
export type ParseComponentManifestOptions = {
    folderGroup?: ComponentManifestGroup;
    requiredEntries?: readonly (keyof ComponentManifest["entry"])[];
};
export declare function parseComponentManifest(candidate: unknown, options?: ParseComponentManifestOptions): ComponentManifest;
export declare function parseComponentSourceManifest(candidate: unknown): GeneratedComponentSourceManifest;
