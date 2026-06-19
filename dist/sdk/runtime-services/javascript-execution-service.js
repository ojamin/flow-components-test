//#region src/sdk/runtime-services/javascript-execution-service.ts
var e = class extends Error {
	constructor(e, t, n) {
		super(e, n), this.code = t, this.name = "JavaScriptExecutionError";
	}
}, t = 24, n = 1e6, r = 1e6, i = 1e6, a = {
	valueLabel: "input",
	maxNodes: n
}, o = {
	valueLabel: "output",
	maxNodes: r
};
function s(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function c(n, r = "value", a = 0, l = {
	nodes: 0,
	seen: /* @__PURE__ */ new WeakSet()
}, u = o) {
	if (a > t) throw new e(`JavaScript execution ${u.valueLabel} "${r}" exceeds maximum JSON depth.`, "invalid-output");
	if (l.nodes += 1, l.nodes > u.maxNodes) throw new e(`JavaScript execution ${u.valueLabel} exceeds maximum JSON size.`, "invalid-output");
	if (!(n === null || typeof n == "boolean")) {
		if (typeof n == "string") {
			if (n.length > i) throw new e(`JavaScript execution ${u.valueLabel} "${r}" exceeds maximum string length.`, "invalid-output");
			return;
		}
		if (typeof n == "number") {
			if (!Number.isFinite(n)) throw new e(`JavaScript execution ${u.valueLabel} "${r}" must be a finite JSON number.`, "invalid-output");
			return;
		}
		if (Array.isArray(n)) {
			if (l.seen.has(n)) throw new e(`JavaScript execution ${u.valueLabel} "${r}" must not contain circular references.`, "invalid-output");
			l.seen.add(n);
			for (let t = 0; t < n.length; t += 1) {
				if (!Object.prototype.hasOwnProperty.call(n, t)) throw new e(`JavaScript execution ${u.valueLabel} "${r}" must be strict JSON.`, "invalid-output");
				c(n[t], `${r}[${t}]`, a + 1, l, u);
			}
			l.seen.delete(n);
			return;
		}
		if (s(n) && Object.prototype.toString.call(n) === "[object Object]") {
			if (l.seen.has(n)) throw new e(`JavaScript execution ${u.valueLabel} "${r}" must not contain circular references.`, "invalid-output");
			l.seen.add(n);
			for (let [e, t] of Object.entries(n)) c(t, `${r}.${e}`, a + 1, l, u);
			l.seen.delete(n);
			return;
		}
		throw new e(`JavaScript execution ${u.valueLabel} "${r}" must be strict JSON.`, "invalid-output");
	}
}
function l(e, t = a) {
	return c(e, "value", 0, {
		nodes: 0,
		seen: /* @__PURE__ */ new WeakSet()
	}, t), JSON.parse(JSON.stringify(e));
}
function u(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		let r = e[n], i = e[n + 1];
		if (r === "/" && i === "/") {
			for (n += 2; n < e.length && e[n] !== "\n";) n += 1;
			t += "\n", n += 1;
			continue;
		}
		if (r === "/" && i === "*") {
			for (n += 2; n < e.length && !(e[n] === "*" && e[n + 1] === "/");) t += e[n] === "\n" ? "\n" : " ", n += 1;
			n += 2;
			continue;
		}
		if (r === "\"" || r === "'") {
			let i = r;
			for (t += " ", n += 1; n < e.length;) {
				if (e[n] === "\\") {
					t += " ", n += 2;
					continue;
				}
				if (e[n] === i) {
					n += 1;
					break;
				}
				t += e[n] === "\n" ? "\n" : " ", n += 1;
			}
			continue;
		}
		t += r, n += 1;
	}
	return t;
}
function d(t, n) {
	for (let t of n.globalNames) if (!/^[A-Za-z_$][\w$]*$/u.test(t)) throw new e(`Blocked global capability "${t}" must be a valid JavaScript identifier.`, "execution-failed");
	let r = u(t), i = [
		{
			enabled: n.rejectDynamicImport,
			pattern: /\bimport\s*\(/u,
			message: "Dynamic import() is not supported."
		},
		{
			enabled: n.rejectAsync,
			pattern: /\b(?:async|Promise)\b/u,
			message: "Async JavaScript is not supported."
		},
		{
			enabled: n.rejectConstructorEscape,
			pattern: /\b(?:constructor|Function|eval)\b/u,
			message: "Constructor and eval access is not supported in JavaScript execution."
		},
		{
			enabled: n.rejectScheduling,
			pattern: /\b(?:setTimeout|setInterval|setImmediate|queueMicrotask|requestAnimationFrame|requestIdleCallback)\b/u,
			message: "Background scheduling is not supported in JavaScript execution."
		}
	];
	for (let { enabled: t, pattern: n, message: a } of i) if (t && n.test(r)) throw new e(a, "blocked-capability");
}
function f(e) {
	return c(e, "output", 0, {
		nodes: 0,
		seen: /* @__PURE__ */ new WeakSet()
	}, o), JSON.parse(JSON.stringify(e));
}
function p(e) {
	return e instanceof Error || s(e) && typeof e.message == "string" ? e.message : String(e);
}
function m() {
	return `
const maxJsonDepth = ${t};
const maxOutputNodes = ${r};
const maxJsonStringLength = ${i};

function isPlainRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertStrictJsonValue(value, path, depth, state) {
  if (depth > maxJsonDepth) throw new Error('JavaScript execution output "' + path + '" exceeds maximum JSON depth.');
  state.nodes += 1;
  if (state.nodes > maxOutputNodes) throw new Error("JavaScript execution output exceeds maximum JSON size.");
  if (value === null || typeof value === "boolean") return;
  if (typeof value === "string") {
    if (value.length > maxJsonStringLength) throw new Error('JavaScript execution output "' + path + '" exceeds maximum string length.');
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error('JavaScript execution output "' + path + '" must be a finite JSON number.');
    return;
  }
  if (Array.isArray(value)) {
    if (state.seen.has(value)) throw new Error('JavaScript execution output "' + path + '" must not contain circular references.');
    state.seen.add(value);
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) throw new Error('JavaScript execution output "' + path + '" must be strict JSON.');
      assertStrictJsonValue(value[index], path + '[' + index + ']', depth + 1, state);
    }
    state.seen.delete(value);
    return;
  }
  if (isPlainRecord(value) && Object.prototype.toString.call(value) === "[object Object]") {
    if (state.seen.has(value)) throw new Error('JavaScript execution output "' + path + '" must not contain circular references.');
    state.seen.add(value);
    for (const [key, item] of Object.entries(value)) assertStrictJsonValue(item, path + '.' + key, depth + 1, state);
    state.seen.delete(value);
    return;
  }
  throw new Error('JavaScript execution output "' + path + '" must be strict JSON.');
}`;
}
function h(e) {
	return `
const compileUserFunction = Function;
const workerScope = globalThis;
const sendMessage = workerScope.postMessage.bind(workerScope);
const blockedGlobals = ${JSON.stringify([...e])};
${m()}

function disableAmbientAccess() {
  for (const name of blockedGlobals) {
    try {
      Object.defineProperty(workerScope, name, { configurable: false, enumerable: false, get() { return undefined; }, set() {} });
    } catch {}
  }

  const functionConstructorPrototypes = [Function.prototype, Object.getPrototypeOf(function* () {})];
  try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function () {})); } catch {}
  try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function* () {})); } catch {}

  for (const prototype of [Object.prototype, Array.prototype, ...functionConstructorPrototypes]) {
    try { Object.defineProperty(prototype, "constructor", { configurable: false, get() { return undefined; } }); } catch {}
  }
  try { Object.defineProperty(workerScope, "Function", { configurable: false, value: undefined }); } catch {}
  try { Object.defineProperty(workerScope, "eval", { configurable: false, value: undefined }); } catch {}
}

disableAmbientAccess();

workerScope.onmessage = (event) => {
  try {
    const { script, data, rows, secondary } = event.data;
    const runner = compileUserFunction("data", "rows", "secondary", ...blockedGlobals, '"use strict";\\n' + script);
    const value = runner(data, rows, secondary, ...blockedGlobals.map(() => undefined));
    if (value && typeof value.then === "function") throw new Error("Async JavaScript is not supported. Return plain JSON output values.");
    assertStrictJsonValue(value, "output", 0, { nodes: 0, seen: new WeakSet() });
    sendMessage({ ok: true, value });
  } catch (error) {
    sendMessage({ ok: false, code: "execution-failed", message: error instanceof Error ? error.message : String(error) });
  }
};`;
}
function g(e) {
	let t = e.blockedCapabilitiesPolicy.globalNames, n = [
		"data",
		"rows",
		"secondary",
		...t
	].join(", "), r = [
		"data",
		"rows",
		"secondary",
		...t.map(() => "undefined")
	].join(", ");
	return `
"use strict";
const data = JSON.parse(${JSON.stringify(JSON.stringify(e.data))});
const rows = JSON.parse(${JSON.stringify(JSON.stringify(e.rows))});
const secondary = ${e.secondary === void 0 ? "undefined" : `JSON.parse(${JSON.stringify(JSON.stringify(e.secondary))})`};

const functionConstructorPrototypes = [Function.prototype, Object.getPrototypeOf(function* () {})];
try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function () {})); } catch {}
try { functionConstructorPrototypes.push(Object.getPrototypeOf(async function* () {})); } catch {}

for (const prototype of [Object.prototype, Array.prototype, ...functionConstructorPrototypes]) {
  Object.defineProperty(prototype, "constructor", { configurable: false, get() { return undefined; } });
}

(function(${n}) {
  "use strict";
${e.script}
})(${r});`;
}
async function _() {
	return import(
		/* @vite-ignore */
		"node:vm"
);
}
async function v(e) {
	let t = await _(), n = t.createContext(Object.create(null), { codeGeneration: {
		strings: !1,
		wasm: !1
	} });
	return new t.Script(g(e)).runInContext(n, {
		timeout: e.timeoutMs,
		displayErrors: !1
	});
}
function y(t, n) {
	return new Promise((r, i) => {
		let a = setTimeout(() => {
			t.terminate(), i(new e("JavaScript execution timed out.", "timeout"));
		}, n.timeoutMs), o = () => {
			clearTimeout(a), t.removeEventListener("message", s), t.removeEventListener("error", c), t.removeEventListener("messageerror", l);
		}, s = (t) => {
			o();
			let n = t.data;
			if (n.ok) {
				r(n.value);
				return;
			}
			i(new e(n.message, n.code ?? "execution-failed"));
		}, c = (t) => {
			o(), i(new e(t.message, "execution-failed"));
		}, l = () => {
			o(), i(new e("JavaScript execution worker message failed.", "execution-failed"));
		};
		t.addEventListener("message", s), t.addEventListener("error", c), t.addEventListener("messageerror", l);
		try {
			t.postMessage({
				script: n.script,
				data: n.data,
				rows: n.rows,
				secondary: n.secondary
			});
		} catch (e) {
			o(), i(e);
		}
	});
}
async function b(e) {
	let t = h(e.blockedCapabilitiesPolicy.globalNames), n = URL.createObjectURL(new Blob([t], { type: "text/javascript" })), r = new Worker(n);
	try {
		return await y(r, e);
	} finally {
		r.terminate(), URL.revokeObjectURL(n);
	}
}
function x(e) {
	return typeof DOMException < "u" && e instanceof DOMException && e.name === "DataCloneError" ? !0 : /could not be cloned|DataCloneError/iu.test(p(e));
}
async function S(e) {
	try {
		return await b(e);
	} catch (t) {
		if (!x(t)) throw t;
		return b(E(e, e.data));
	}
}
function C() {
	return typeof Worker == "function" && typeof Blob == "function" && typeof URL < "u";
}
var w = class {
	async execute(t) {
		if (!Number.isFinite(t.timeoutMs) || t.timeoutMs <= 0) throw new e("JavaScript execution timeoutMs must be a positive finite number.", "execution-failed");
		let n = t.data ?? t.rows;
		if (n === void 0) throw new e("JavaScript execution data input is required.", "execution-failed");
		d(t.script, t.blockedCapabilitiesPolicy);
		try {
			return { value: f(C() ? await S(T(t, n)) : await v(E(t, n))) };
		} catch (t) {
			throw t instanceof e ? t : /timed out|Script execution timed out/iu.test(p(t)) ? new e("JavaScript execution timed out.", "timeout", { cause: t }) : new e(`JavaScript execution failed: ${p(t)}`, "execution-failed", { cause: t });
		}
	}
};
function T(e, t) {
	c(t, "value", 0, {
		nodes: 0,
		seen: /* @__PURE__ */ new WeakSet()
	}, a);
	let n = e.rows ?? t;
	return n !== t && c(n, "value", 0, {
		nodes: 0,
		seen: /* @__PURE__ */ new WeakSet()
	}, a), e.secondary !== void 0 && c(e.secondary, "value", 0, {
		nodes: 0,
		seen: /* @__PURE__ */ new WeakSet()
	}, a), {
		...e,
		data: t,
		rows: n
	};
}
function E(e, t) {
	let n = l(t), r = e.rows ?? t, i = r === t ? n : l(r);
	return {
		...e,
		data: n,
		rows: i,
		secondary: e.secondary === void 0 ? void 0 : l(e.secondary)
	};
}
//#endregion
export { e as JavaScriptExecutionError, w as JavaScriptExecutionService, c as assertStrictJsonValue, l as cloneJsonValue };
