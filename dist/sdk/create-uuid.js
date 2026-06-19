//#region src/sdk/create-uuid.ts
function e() {
	let e = globalThis.crypto;
	if (e && typeof e.randomUUID == "function") return e.randomUUID();
	if (e && typeof e.getRandomValues == "function") {
		let n = e.getRandomValues(new Uint8Array(16));
		return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, [
			t(n.subarray(0, 4)),
			t(n.subarray(4, 6)),
			t(n.subarray(6, 8)),
			t(n.subarray(8, 10)),
			t(n.subarray(10, 16))
		].join("-");
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
function t(e) {
	return Array.from(e, (e) => e.toString(16).padStart(2, "0")).join("");
}
//#endregion
export { e as createUuid };
