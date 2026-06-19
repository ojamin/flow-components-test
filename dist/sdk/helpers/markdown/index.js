import { sanitizeHtmlToResult as e } from "../sanitization/index.js";
import { marked as t } from "marked";
//#region src/sdk/helpers/markdown/index.ts
function n(n) {
	let r = n.trim();
	if (!r) return {
		html: "",
		wasSanitized: !1,
		error: null
	};
	try {
		let n = e(t.parse(r, {
			async: !1,
			breaks: !0,
			gfm: !0
		}));
		return n.error ? {
			html: "",
			wasSanitized: !1,
			error: n.error
		} : {
			html: n.html,
			wasSanitized: n.wasSanitized,
			error: null
		};
	} catch (e) {
		return {
			html: "",
			wasSanitized: !1,
			error: e instanceof Error ? e.message : "Markdown preview failed to render."
		};
	}
}
//#endregion
export { n as renderSanitizedMarkdown };
