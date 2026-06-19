import { shallowRef as e } from "vue";
//#region src/sdk/data-path-picker-adapter.ts
var t = e(null);
function n(e) {
	t.value = e;
}
function r() {
	return t.value;
}
//#endregion
export { r as getRegisteredDataPathPicker, n as registerDataPathPicker };
