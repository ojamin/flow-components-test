import { z } from "zod";
export declare const contentButtonVariantOptions: readonly ["default", "secondary", "outline", "ghost", "link", "destructive"];
export declare const contentButtonSizeOptions: readonly ["xs", "sm", "default", "lg", "icon"];
export declare const buttonParams: {
    label: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    href: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    variant: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        default: "default";
        link: "link";
        secondary: "secondary";
        destructive: "destructive";
        outline: "outline";
        ghost: "ghost";
    }>>>;
    size: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        default: "default";
        sm: "sm";
        lg: "lg";
        icon: "icon";
        xs: "xs";
    }>>>;
    target: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        blank: "blank";
        self: "self";
    }>>>;
    requestedViewId: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    leadingIcon: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    trailingIcon: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    accessibleLabel: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    disabled: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodBoolean>>;
    disabledReason: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
};
export declare const buttonConfigSchema: z.ZodObject<{
    label: z.ZodDefault<z.ZodString>;
    href: z.ZodDefault<z.ZodString>;
    variant: z.ZodDefault<z.ZodEnum<{
        default: "default";
        link: "link";
        secondary: "secondary";
        destructive: "destructive";
        outline: "outline";
        ghost: "ghost";
    }>>;
    size: z.ZodDefault<z.ZodEnum<{
        default: "default";
        sm: "sm";
        lg: "lg";
        icon: "icon";
        xs: "xs";
    }>>;
    target: z.ZodDefault<z.ZodEnum<{
        blank: "blank";
        self: "self";
    }>>;
    requestedViewId: z.ZodDefault<z.ZodString>;
    leadingIcon: z.ZodDefault<z.ZodString>;
    trailingIcon: z.ZodDefault<z.ZodString>;
    accessibleLabel: z.ZodDefault<z.ZodString>;
    disabled: z.ZodDefault<z.ZodBoolean>;
    disabledReason: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type ButtonConfig = z.output<typeof buttonConfigSchema>;
export declare const buttonConfigDefaults: import("@flow-builder/components/sdk").ComponentConfig<z.ZodObject<{
    label: z.ZodDefault<z.ZodString>;
    href: z.ZodDefault<z.ZodString>;
    variant: z.ZodDefault<z.ZodEnum<{
        default: "default";
        link: "link";
        secondary: "secondary";
        destructive: "destructive";
        outline: "outline";
        ghost: "ghost";
    }>>;
    size: z.ZodDefault<z.ZodEnum<{
        default: "default";
        sm: "sm";
        lg: "lg";
        icon: "icon";
        xs: "xs";
    }>>;
    target: z.ZodDefault<z.ZodEnum<{
        blank: "blank";
        self: "self";
    }>>;
    requestedViewId: z.ZodDefault<z.ZodString>;
    leadingIcon: z.ZodDefault<z.ZodString>;
    trailingIcon: z.ZodDefault<z.ZodString>;
    accessibleLabel: z.ZodDefault<z.ZodString>;
    disabled: z.ZodDefault<z.ZodBoolean>;
    disabledReason: z.ZodDefault<z.ZodString>;
}, z.core.$strip>>;
export declare const buttonTransformOutputSchema: z.ZodObject<{
    all: z.ZodOptional<z.ZodType<import("@flow-builder/components/sdk").JsonValue, unknown, z.core.$ZodTypeInternals<import("@flow-builder/components/sdk").JsonValue, unknown>>>;
}, z.core.$strip>;
export interface ButtonFixtureData {
    emptyLabel: string;
}
