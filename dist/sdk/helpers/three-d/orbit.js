import { OrbitControls as e } from "three/examples/jsm/controls/OrbitControls.js";
//#region src/sdk/helpers/three-d/orbit.ts
var t = .08, n = .5;
function r(r, a, o = {}) {
	let s = new e(r, a);
	s.enableDamping = o.dampingEnabled ?? !0, s.dampingFactor = t, s.screenSpacePanning = !1, s.enablePan = o.enablePan ?? !0;
	let c = o.enableZoom ?? !0;
	s.enableZoom = c;
	let l = s;
	return "enableDolly" in l && (l.enableDolly = c), s.autoRotate = o.autoRotate ?? !1, s.autoRotateSpeed = o.autoRotateSpeed ?? n, s.enabled = o.enabled ?? !0, typeof o.minDistance == "number" && Number.isFinite(o.minDistance) && (s.minDistance = o.minDistance), typeof o.maxDistance == "number" && Number.isFinite(o.maxDistance) && (s.maxDistance = o.maxDistance), i(s, o.target), s.saveState(), {
		get enabled() {
			return s.enabled;
		},
		set enabled(e) {
			s.enabled = e;
		},
		setEnabled(e) {
			s.enabled = e;
		},
		setAutoRotate(e) {
			s.autoRotate = e;
		},
		update() {
			s.update();
		},
		reset() {
			s.reset();
		},
		dispose() {
			s.dispose();
		}
	};
}
function i(e, t) {
	if (t === void 0) return;
	let [n, r, i] = Array.isArray(t) ? t : [
		t.x,
		t.y,
		t.z
	];
	typeof n == "number" && typeof r == "number" && typeof i == "number" && Number.isFinite(n) && Number.isFinite(r) && Number.isFinite(i) && e.target.set(n, r, i);
}
//#endregion
export { r as createVizOrbitController };
