import type { ComponentDefinition } from "../sdk/public-sdk.js";
type AnyComponentDefinition = ComponentDefinition<any>;
export declare const staticComponentDefinitions: readonly [ComponentDefinition<import("zod").ZodObject<{
    label: import("zod").ZodDefault<import("zod").ZodString>;
    href: import("zod").ZodDefault<import("zod").ZodString>;
    variant: import("zod").ZodDefault<import("zod").ZodEnum<{
        default: "default";
        link: "link";
        secondary: "secondary";
        destructive: "destructive";
        outline: "outline";
        ghost: "ghost";
    }>>;
    size: import("zod").ZodDefault<import("zod").ZodEnum<{
        default: "default";
        sm: "sm";
        lg: "lg";
        icon: "icon";
        xs: "xs";
    }>>;
    target: import("zod").ZodDefault<import("zod").ZodEnum<{
        blank: "blank";
        self: "self";
    }>>;
    requestedViewId: import("zod").ZodDefault<import("zod").ZodString>;
    leadingIcon: import("zod").ZodDefault<import("zod").ZodString>;
    trailingIcon: import("zod").ZodDefault<import("zod").ZodString>;
    accessibleLabel: import("zod").ZodDefault<import("zod").ZodString>;
    disabled: import("zod").ZodDefault<import("zod").ZodBoolean>;
    disabledReason: import("zod").ZodDefault<import("zod").ZodString>;
}, import("zod/v4/core").$strip>>, ComponentDefinition<import("zod").ZodObject<{
    text: import("zod").ZodDefault<import("zod").ZodString>;
    prose: import("zod").ZodDefault<import("zod").ZodBoolean>;
    align: import("zod").ZodDefault<import("zod").ZodEnum<{
        left: "left";
        right: "right";
        center: "center";
    }>>;
    clampLines: import("zod").ZodDefault<import("zod").ZodEnum<{
        none: "none";
        2: "2";
        3: "3";
        4: "4";
        5: "5";
        6: "6";
    }>>;
}, import("zod/v4/core").$strip>>, ComponentDefinition<import("zod").ZodObject<{
    eyebrow: import("zod").ZodDefault<import("zod").ZodString>;
    headline: import("zod").ZodDefault<import("zod").ZodString>;
    subline: import("zod").ZodDefault<import("zod").ZodString>;
    tone: import("zod").ZodDefault<import("zod").ZodEnum<{
        neutral: "neutral";
        breaking: "breaking";
        projected: "projected";
        hold: "hold";
    }>>;
}, import("zod/v4/core").$strip>>, ComponentDefinition<import("zod").ZodObject<{
    brand: import("zod").ZodDefault<import("zod").ZodString>;
    edition: import("zod").ZodDefault<import("zod").ZodString>;
    timestamp: import("zod").ZodDefault<import("zod").ZodString>;
    freshness: import("zod").ZodDefault<import("zod").ZodString>;
    mode: import("zod").ZodDefault<import("zod").ZodEnum<{
        producer: "producer";
        air: "air";
        standby: "standby";
    }>>;
    ticker: import("zod").ZodDefault<import("zod").ZodString>;
}, import("zod/v4/core").$strip>>, ComponentDefinition<import("zod").ZodObject<{
    raceTitle: import("zod").ZodDefault<import("zod").ZodString>;
    raceStatus: import("zod").ZodDefault<import("zod").ZodString>;
    candidateA: import("zod").ZodDefault<import("zod").ZodString>;
    candidateAVotes: import("zod").ZodDefault<import("zod").ZodNumber>;
    candidateB: import("zod").ZodDefault<import("zod").ZodString>;
    candidateBVotes: import("zod").ZodDefault<import("zod").ZodNumber>;
    precinctsReporting: import("zod").ZodDefault<import("zod").ZodNumber>;
    selectedCounty: import("zod").ZodDefault<import("zod").ZodString>;
}, import("zod/v4/core").$strip>>, ComponentDefinition<import("zod").ZodObject<{
    label: import("zod").ZodDefault<import("zod").ZodString>;
    value: import("zod").ZodDefault<import("zod").ZodString>;
    tone: import("zod").ZodDefault<import("zod").ZodEnum<{
        success: "success";
        warning: "warning";
        neutral: "neutral";
        danger: "danger";
    }>>;
    size: import("zod").ZodDefault<import("zod").ZodEnum<{
        sm: "sm";
        md: "md";
    }>>;
}, import("zod/v4/core").$strip>>];
export declare const staticComponentPackageCatalog: {
    groups: readonly ["content"];
    components: {
        id: string;
        group: "content";
        title: string;
        description: string | undefined;
        source: "static";
        sourceId: string;
    }[];
    definitions: readonly AnyComponentDefinition[];
};
export declare const staticComponentPackageDefinitionIds: readonly string[];
export declare function getBuiltInComponentDefinition(componentId: string): AnyComponentDefinition | undefined;
export declare function requireBuiltInComponentDefinition(componentId: string): AnyComponentDefinition;
export {};
