import { componentThemePropertyRolesByGroup as e } from "./theme.js";
//#region src/sdk/theme-contract.ts
function t(e, t) {
	let r = [], i = n(), a = /* @__PURE__ */ new Set();
	return e.consumes.forEach((e, t) => {
		if (!i.has(e.propertyKey)) {
			r.push({
				field: `consumes[${t}].propertyKey`,
				message: `Unknown theme property key "${e.propertyKey}".`
			});
			return;
		}
		a.has(e.propertyKey) && r.push({
			field: `consumes[${t}].propertyKey`,
			message: `Duplicate consumed property key "${e.propertyKey}".`
		}), a.add(e.propertyKey);
	}), e.produces?.forEach((e, n) => {
		let i = t.outputs.find((t) => t.id === e.outputId);
		if (!i) {
			r.push({
				field: `produces[${n}].outputId`,
				message: `Unknown output port "${e.outputId}".`
			});
			return;
		}
		i.typeId !== "component-theme" && r.push({
			field: `produces[${n}].outputId`,
			message: `Output port "${e.outputId}" must publish "component-theme" (got "${i.typeId}").`
		});
	}), e.inherits?.forEach((e, n) => {
		let i = t.inputs.find((t) => t.id === e.inputId);
		if (!i) {
			r.push({
				field: `inherits[${n}].inputId`,
				message: `Unknown input port "${e.inputId}".`
			});
			return;
		}
		i.acceptedTypeIds.includes("component-theme") || r.push({
			field: `inherits[${n}].inputId`,
			message: `Input port "${e.inputId}" must accept "component-theme" (accepted: ${i.acceptedTypeIds.join(", ") || "<none>"}).`
		});
	}), r;
}
function n() {
	let t = /* @__PURE__ */ new Set();
	for (let [n, r] of Object.entries(e)) for (let e of r) t.add(`${n}.${e}`);
	return t;
}
//#endregion
export { t as validateComponentThemeContract };
