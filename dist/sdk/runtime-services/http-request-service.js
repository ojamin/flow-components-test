//#region src/sdk/runtime-services/http-request-service.ts
var e = null, t = null;
function n(t) {
	e = t;
}
function r() {
	if (!e) throw Error("HTTP request runtime service has not been configured. Call configureHttpRequestRuntimeService() before evaluating data.http-request nodes.");
	return e;
}
function i(e) {
	t = e;
}
function a() {
	if (!t) throw Error("HTTP request transform service has not been configured. Call configureHttpRequestTransformService() before using data.http-request transforms.");
	return t;
}
//#endregion
export { n as configureHttpRequestRuntimeService, i as configureHttpRequestTransformService, r as getHttpRequestRuntimeService, a as getHttpRequestTransformService };
