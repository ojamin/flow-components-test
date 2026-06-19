import { shallowRef as e } from "vue";
//#region src/sdk/code-editor-adapter.ts
var t = e(null);
function n(e) {
	t.value = e;
}
function r() {
	return t.value;
}
//#endregion
export { r as getRegisteredCodeEditor, n as registerCodeEditor };
