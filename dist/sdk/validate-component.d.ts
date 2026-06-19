import type { ComponentManifest } from "../manifest.js";
import type { ComponentDefinition, StateSupportMeta } from "./component-definition.js";
import { type ComponentCategory, type ComponentGroupId } from "./taxonomy.js";
export interface ManifestDriftIssue {
    componentId: string;
    field: string;
    manifestValue: unknown;
    definitionValue: unknown;
    message: string;
}
export interface DriftCheckContext {
    /** Group inferred from the component's folder path (e.g. `content` for `groups/content/heading`). */
    folderGroup: ComponentGroupId;
    /** Optional taxonomy injection used by focused validator tests. Production callers use taxonomy.ts. */
    taxonomy?: {
        groupToCategory?: Partial<Record<ComponentGroupId, ComponentCategory>>;
        categoryOverrides?: Partial<Record<string, ComponentCategory>>;
    };
}
export interface StateSupportMetadataIssue {
    componentId: string;
    severity: "warning" | "error";
    field: "fixtureVariants" | "stateSupport" | `stateSupport.${keyof StateSupportMeta}`;
    message: string;
}
export interface StateSupportMetadataOptions {
    strict?: boolean;
}
export declare function collectStateSupportMetadataIssues(definitions: readonly ComponentDefinition<any>[], options?: StateSupportMetadataOptions): StateSupportMetadataIssue[];
export declare function findManifestDrift(definition: ComponentDefinition<any>, manifest: ComponentManifest, context: DriftCheckContext): ManifestDriftIssue[];
