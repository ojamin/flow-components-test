import { z } from "zod";
export declare const componentDefinition: import("@flow-builder/components/sdk").ComponentDefinition<z.ZodObject<{
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
export default componentDefinition;
