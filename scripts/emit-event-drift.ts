import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { ComponentManifest } from "../src/manifest.ts";
import type { ComponentFolder } from "./generate-catalog.ts";

const emitEventLiteralCallPattern = /\b(?:props\.)?emitEvent\s*(?:\?\.)?\(\s*["']([^"']+)["']/g;

export function collectEmitEventDeclarationIssues(
  folder: ComponentFolder,
  manifest: ComponentManifest,
  issues: string[],
) {
  const rendererPath = path.join(folder.absolutePath, manifest.entry.renderer);
  const definitionPath = path.join(folder.absolutePath, manifest.entry.definition);
  if (!existsSync(rendererPath) || !existsSync(definitionPath)) return;

  const declaredEventIds = collectDeclaredEventIds(readFileSync(definitionPath, "utf8"));
  const rendererSource = readFileSync(rendererPath, "utf8");
  const skippedLines = collectEventCheckOptOutLines(rendererSource);

  emitEventLiteralCallPattern.lastIndex = 0;
  for (const match of rendererSource.matchAll(emitEventLiteralCallPattern)) {
    const eventId = match[1];
    if (!eventId) continue;

    const lineNumber = sourceLineNumberAt(rendererSource, match.index ?? 0);
    if (skippedLines.has(lineNumber)) continue;
    if (declaredEventIds.has(eventId)) continue;

    issues.push(
      `${folder.packagePath}/${manifest.entry.renderer}:${lineNumber} emits undeclared event "${eventId}" for component "${manifest.id}". Declare the event in componentDefinition.events or remove the literal emitEvent call.`,
    );
  }
}

function collectDeclaredEventIds(definitionSource: string) {
  const eventIds = new Set<string>();
  for (const eventsArraySource of collectDefinitionEventsArraySources(definitionSource)) {
    for (const match of eventsArraySource.matchAll(/\bid\s*:\s*["']([^"']+)["']/g)) {
      if (match[1]) eventIds.add(match[1]);
    }
  }
  return eventIds;
}

function collectDefinitionEventsArraySources(definitionSource: string) {
  const sources: string[] = [];
  const eventsPropertyPattern = /\bevents\s*:\s*(\[|[A-Za-z_$][\w$]*)/g;

  for (const match of definitionSource.matchAll(eventsPropertyPattern)) {
    const token = match[1];
    if (!token) continue;

    const tokenIndex = (match.index ?? 0) + match[0].lastIndexOf(token);
    if (token === "[") {
      const arraySource = extractBracketedArraySource(definitionSource, tokenIndex);
      if (arraySource) sources.push(arraySource);
      continue;
    }

    const declarationPattern = new RegExp(
      `\\b(?:const|let|var)\\s+${escapeRegExp(token)}(?:\\s*:[^=]+)?\\s*=\\s*\\[`,
      "g",
    );
    const declaration = declarationPattern.exec(definitionSource);
    if (!declaration) continue;

    const arrayStart = (declaration.index ?? 0) + declaration[0].lastIndexOf("[");
    const arraySource = extractBracketedArraySource(definitionSource, arrayStart);
    if (arraySource) sources.push(arraySource);
  }

  return sources;
}

function extractBracketedArraySource(source: string, startIndex: number) {
  let depth = 0;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(startIndex, index + 1);
    }
  }

  return undefined;
}

function collectEventCheckOptOutLines(source: string) {
  const skippedLines = new Set<number>();
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes("// @event-check: dynamic")) skippedLines.add(index + 2);
  });
  return skippedLines;
}

function sourceLineNumberAt(source: string, index: number) {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (source.charCodeAt(position) === 10) line += 1;
  }
  return line;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
