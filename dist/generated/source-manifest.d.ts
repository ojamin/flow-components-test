export declare const staticComponentSourceManifest: {
    schemaVersion: 1;
    sourceId: string;
    name: string;
    version: string;
    generatedAt: string;
    packageName: string;
    components: ({
        id: string;
        displayName: string;
        group: "content";
        section: string;
        source: "static";
        sourceId: string;
        version: string;
        renderable: true;
        tags: string[];
        sourcePath: string;
        contentHash: string;
        fixtureVariants: ({
            id: string;
            label: string;
            appliesTo?: undefined;
        } | {
            id: string;
            label: string;
            appliesTo: "config";
        })[];
        stateSupport: {
            empty: true;
            loading: {
                notApplicable: string;
            };
            error: {
                notApplicable: string;
            };
            disabled: true;
            focus: true;
            keyboard: true;
            responsive: true;
        };
        responsiveDefaults?: undefined;
    } | {
        id: string;
        displayName: string;
        group: "content";
        section: string;
        source: "static";
        sourceId: string;
        version: string;
        renderable: true;
        tags: string[];
        sourcePath: string;
        contentHash: string;
        responsiveDefaults: {
            mobileFullWidth: true;
        };
        fixtureVariants: ({
            id: string;
            label: string;
            description?: undefined;
            appliesTo?: undefined;
        } | {
            id: string;
            label: string;
            description: string;
            appliesTo: "config";
        })[];
        stateSupport: {
            empty: true;
            loading: {
                notApplicable: string;
            };
            error: {
                notApplicable: string;
            };
            disabled: {
                notApplicable: string;
            };
            focus: {
                notApplicable: string;
            };
            keyboard: {
                notApplicable: string;
            };
            responsive: true;
        };
    })[];
    groups: {
        id: "content";
        displayName: string;
        componentIds: string[];
    }[];
    fingerprints: {
        manifestHash: string;
        filesHash: string;
    };
};
