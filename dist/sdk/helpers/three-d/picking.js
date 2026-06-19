import * as e from "three";
//#region src/sdk/helpers/three-d/picking.ts
var t = 4;
function n(t, n) {
	return n.width <= 0 || n.height <= 0 ? null : new e.Vector2((t.clientX - n.left) / n.width * 2 - 1, -((t.clientY - n.top) / n.height) * 2 + 1);
}
function r(e, t = "payload") {
	let n = e[0];
	if (!n) return null;
	let r = n.object.userData[t];
	return r === void 0 ? null : {
		objectId: n.object.name || n.object.uuid,
		payload: r,
		point: [
			n.point.x,
			n.point.y,
			n.point.z
		],
		distance: n.distance
	};
}
function i(e) {
	let n = !1, r = 0, i = 0, a = !1, o = (e) => {
		n = !1, a = !0, r = e.clientX, i = e.clientY;
	}, s = (e) => {
		if (!a || n) return;
		let o = e.clientX - r, s = e.clientY - i;
		(Math.abs(o) > t || Math.abs(s) > t) && (n = !0);
	}, c = () => {
		a = !1;
	};
	e.addEventListener("pointerdown", o), e.addEventListener("pointermove", s), e.addEventListener("pointerup", c), e.addEventListener("pointercancel", c);
	let l = !1;
	return {
		wasDrag() {
			return n;
		},
		dispose() {
			l || (l = !0, e.removeEventListener("pointerdown", o), e.removeEventListener("pointermove", s), e.removeEventListener("pointerup", c), e.removeEventListener("pointercancel", c));
		}
	};
}
//#endregion
export { i as createVizPickSuppressor, r as pickFirstThreeObject, n as pointerToNormalizedDeviceCoordinates };
