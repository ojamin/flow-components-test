import { z } from "zod";
export declare const isoDateTimeSchema: z.ZodString;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
export type JsonObject = {
    [key: string]: JsonValue;
};
export declare const jsonPrimitiveSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
export declare const jsonValueSchema: z.ZodType<JsonValue>;
export declare const jsonObjectSchema: z.ZodType<JsonObject>;
export declare const jsonArraySchema: z.ZodType<JsonValue[]>;
