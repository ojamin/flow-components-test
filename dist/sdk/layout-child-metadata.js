import { z as e } from "zod";
//#region src/sdk/layout-child-metadata.ts
var t = "childComponents";
function n() {
	return {
		id: t,
		label: "Child components",
		typeId: "json-array",
		runtimePatchable: !1
	};
}
var r = e.enum([
	"authored",
	"placement-display",
	"device-hidden",
	"runtime-override",
	"inherited-parent",
	"inactive-slot"
]), i = e.enum(["visible", "hidden"]), a = e.object({
	placementId: e.string().min(1),
	instanceId: e.string().min(1),
	componentId: e.string().min(1),
	label: e.string(),
	displayName: e.string(),
	parentPlacementId: e.string().min(1),
	slotId: e.string().min(1),
	visible: e.boolean(),
	visibilitySource: r,
	visibilityStatus: i,
	reserveHiddenSpace: e.boolean(),
	fillHiddenSpace: e.boolean(),
	order: e.number().int().nonnegative(),
	targetOrder: e.number().int().nonnegative().optional()
}), o = e.array(a);
//#endregion
export { n as createLayoutChildMetadataOutputPort, a as layoutChildMetadataEntrySchema, t as layoutChildMetadataOutputId, o as layoutChildMetadataSchema, r as layoutChildVisibilitySourceSchema, i as layoutChildVisibilityStatusSchema };
