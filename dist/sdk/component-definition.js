import { jsonValueSchema as e } from "./schema-primitives.js";
import "./component-params.js";
import "./component-definition-factory.js";
import "./component-ports-slots.js";
import "./component-data-types.js";
import "./component-transform-context.js";
import { z as t } from "zod";
//#region src/sdk/component-definition.ts
function n() {
	return Promise.resolve({
		requiresFixtureData: !1,
		passthroughOutputs: { all: "data" },
		outputSchema: t.object({ all: e.optional() }),
		transform: ({ inputs: e }) => Object.prototype.hasOwnProperty.call(e, "data") ? { all: e.data } : {}
	});
}
//#endregion
export { n as createPassthroughTransform };
