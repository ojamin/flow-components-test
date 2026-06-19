export type TsLiteralValue =
  | string
  | number
  | boolean
  | null
  | readonly TsLiteralValue[]
  | { readonly [key: string]: TsLiteralValue };

export function renderTsValue(value: TsLiteralValue, indent = 0): string {
  if (typeof value === "string") return renderTsString(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";

  if (Array.isArray(value)) return renderTsArray(value, indent);

  return renderTsObject(value as { readonly [key: string]: TsLiteralValue }, indent);
}

function renderTsString(value: string): string {
  if (!value.includes('"')) return JSON.stringify(value);

  let rendered = "'";
  for (const character of value) {
    switch (character) {
      case "\\":
        rendered += "\\\\";
        break;
      case "'":
        rendered += "\\'";
        break;
      case "\n":
        rendered += "\\n";
        break;
      case "\r":
        rendered += "\\r";
        break;
      case "\t":
        rendered += "\\t";
        break;
      case "\b":
        rendered += "\\b";
        break;
      case "\f":
        rendered += "\\f";
        break;
      case "\u2028":
        rendered += "\\u2028";
        break;
      case "\u2029":
        rendered += "\\u2029";
        break;
      default:
        rendered += character;
    }
  }
  return `${rendered}'`;
}

function renderTsArray(values: readonly TsLiteralValue[], indent: number): string {
  if (values.length === 0) return "[]";

  const oneLine = `[${values.map((value) => renderTsValue(value, indent)).join(", ")}]`;
  const allPrimitive = values.every((value) => typeof value !== "object" || value === null);

  // Keep generated primitive arrays within the repo formatter's line width once
  // the object property prefix is added by `renderTsObject`.
  if (allPrimitive && indent + oneLine.length <= 100) return oneLine;

  const nextIndent = indent + 2;
  const spaces = " ".repeat(indent);
  const nestedSpaces = " ".repeat(nextIndent);

  return `[
${values.map((value) => `${nestedSpaces}${renderTsValue(value, nextIndent)},`).join("\n")}
${spaces}]`;
}

function renderTsObject(value: { readonly [key: string]: TsLiteralValue }, indent: number): string {
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";

  const spaces = " ".repeat(indent);
  const nestedSpaces = " ".repeat(indent + 2);

  return `{
${entries
  .map(([key, nestedValue]) => {
    const renderedKey = renderTsPropertyKey(key);
    const renderedValue = renderTsValue(nestedValue, indent + 2);
    if (
      typeof nestedValue === "string" &&
      nestedSpaces.length + renderedKey.length + renderedValue.length + 2 > 99
    ) {
      return `${nestedSpaces}${renderedKey}:\n${nestedSpaces}  ${renderedValue},`;
    }
    return `${nestedSpaces}${renderedKey}: ${renderedValue},`;
  })
  .join("\n")}
${spaces}}`;
}

function renderTsPropertyKey(key: string) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}
