import { z as e } from "zod";
//#region src/sdk/schema-primitives.ts
var t = e.string().refine((e) => !Number.isNaN(Date.parse(e)), "Expected an ISO-8601 datetime string"), n = e.union([
	e.string(),
	e.number().finite(),
	e.boolean(),
	e.null()
]), r = e.lazy(() => e.union([
	n,
	e.array(r),
	i
])), i = e.lazy(() => e.record(e.string(), r)), a = e.lazy(() => e.array(r));
//#endregion
export { t as isoDateTimeSchema, a as jsonArraySchema, i as jsonObjectSchema, n as jsonPrimitiveSchema, r as jsonValueSchema };
