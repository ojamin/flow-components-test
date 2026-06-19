import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

const directBrowserGlobalNames = new Set([
  "window",
  "document",
  "navigator",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "requestAnimationFrame",
  "cancelAnimationFrame",
]);
const directBrowserGlobalMembers = new Set(
  [...directBrowserGlobalNames].flatMap((name) => [`globalThis.${name}`, `window.${name}`]),
);
const policyDenylistAllowlist = new Set(["src/groups/transform/javascript/execute-script.ts"]);
const directGlobalHelpText =
  "Use @flow-builder/components/sdk/browser or the SDK helper sections documented in packages/components/docs/sdk-helpers.md instead.";
const runtimeServiceConfigureHelpText =
  "configure*Service() APIs are host, test, or package-bootstrap only; production components may use approved service getters but must not configure runtime services.";

export function validateDirectBrowserGlobals(resolvedPackageRoot: string, errors: string[]) {
  const groupsRoot = path.join(resolvedPackageRoot, "src/groups");
  if (!existsSync(groupsRoot)) return;

  for (const file of listSourceFiles(groupsRoot)) {
    if (!isProductionComponentSourceFile(file, resolvedPackageRoot)) continue;

    const source = readFileSync(file, "utf8");
    const relativePath = componentValidationRelativePath(file, resolvedPackageRoot);
    const scriptBlocks = file.endsWith(".vue")
      ? extractVueScriptBlocks(source)
      : [{ source, lineOffset: 0 }];

    for (const block of scriptBlocks) {
      const sourceFile = ts.createSourceFile(
        file,
        block.source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      collectDirectBrowserGlobalIssues(sourceFile, relativePath, block.lineOffset, errors);
    }
  }
}

function isProductionComponentSourceFile(file: string, resolvedPackageRoot: string) {
  const relativePath = relativeToPackage(file, resolvedPackageRoot);
  if (!relativePath.startsWith("src/groups/")) return false;
  if (relativePath.includes("/tests/") || /\.(test|spec)\.ts$/.test(relativePath)) return false;
  if (relativePath.includes("/fixtures/") || relativePath.includes("/generated/")) return false;

  return true;
}

function extractVueScriptBlocks(source: string) {
  const blocks: { source: string; lineOffset: number }[] = [];
  const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of source.matchAll(scriptPattern)) {
    const blockSource = match[1] ?? "";
    const blockStart = (match.index ?? 0) + match[0].indexOf(blockSource);
    blocks.push({ source: blockSource, lineOffset: lineCount(source.slice(0, blockStart)) });
  }

  return blocks;
}

function collectDirectBrowserGlobalIssues(
  sourceFile: ts.SourceFile,
  relativePath: string,
  lineOffset: number,
  errors: string[],
) {
  const sourceRelativePath = relativePath.replace(/^packages\/components\//, "");

  function visit(node: ts.Node) {
    const globalName = directGlobalNameForNode(node);
    if (globalName) {
      pushDirectGlobalError(sourceFile, relativePath, node, lineOffset, globalName, errors);
      if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) return;
    }

    const configureServiceName = runtimeServiceConfigureNameForNode(node);
    if (configureServiceName) {
      pushRuntimeServiceConfigureError(
        sourceFile,
        relativePath,
        node,
        lineOffset,
        configureServiceName,
        errors,
      );
      return;
    }

    if (
      !policyDenylistAllowlist.has(sourceRelativePath) &&
      ts.isPropertyAssignment(node) &&
      propertyNameText(node.name) === "globalNames" &&
      ts.isArrayLiteralExpression(node.initializer) &&
      node.initializer.elements.some(
        (element) => ts.isStringLiteralLike(element) && directBrowserGlobalNames.has(element.text),
      )
    ) {
      pushDirectGlobalError(
        sourceFile,
        relativePath,
        node.name,
        lineOffset,
        "policy globalNames denylist",
        errors,
      );
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function directGlobalNameForNode(node: ts.Node) {
  if (ts.isPropertyAccessExpression(node)) {
    const expressionName = node.expression.getText();
    const memberName = `${expressionName}.${node.name.text}`;
    if (directBrowserGlobalMembers.has(memberName)) return memberName;
    return undefined;
  }

  if (ts.isElementAccessExpression(node)) {
    const memberName = stringLiteralText(node.argumentExpression);
    if (!memberName) return undefined;

    const expressionName = node.expression.getText();
    const memberPath = `${expressionName}.${memberName}`;
    if (directBrowserGlobalMembers.has(memberPath)) {
      return `${expressionName}[${JSON.stringify(memberName)}]`;
    }
    return undefined;
  }

  if (!ts.isIdentifier(node)) return undefined;
  if (!directBrowserGlobalNames.has(node.text)) return undefined;
  if (isIgnoredIdentifierReference(node)) return undefined;

  return node.text;
}

function runtimeServiceConfigureNameForNode(node: ts.Node) {
  if (!ts.isCallExpression(node)) return undefined;

  const callee = node.expression;
  const calleeName = ts.isIdentifier(callee)
    ? callee.text
    : ts.isPropertyAccessExpression(callee)
      ? callee.name.text
      : ts.isElementAccessExpression(callee)
        ? stringLiteralText(callee.argumentExpression)
        : undefined;

  return calleeName && /^configure[A-Z]\w*Service$/.test(calleeName) ? calleeName : undefined;
}

function isIgnoredIdentifierReference(node: ts.Identifier) {
  const parent = node.parent;

  if (isInTypeOnlyPosition(node)) return true;
  if (isDeclarationName(node)) return true;
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isNamespaceImport(parent)) {
    return true;
  }
  if (ts.isExportSpecifier(parent)) return true;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return true;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return true;
  if (ts.isBindingElement(parent) && (parent.name === node || parent.propertyName === node)) {
    return true;
  }
  if (ts.isLiteralTypeNode(parent)) return true;

  return false;
}

function isInTypeOnlyPosition(node: ts.Node) {
  let current: ts.Node | undefined = node;
  while (current?.parent) {
    current = current.parent;
    if (
      ts.isTypeNode(current) ||
      ts.isInterfaceDeclaration(current) ||
      ts.isTypeAliasDeclaration(current)
    ) {
      return true;
    }
    if (
      ts.isExpressionStatement(current) ||
      ts.isStatement(current) ||
      ts.isVariableDeclaration(current)
    ) {
      return false;
    }
  }

  return false;
}

function isDeclarationName(node: ts.Identifier) {
  const parent = node.parent;
  return (
    (ts.isVariableDeclaration(parent) ||
      ts.isFunctionDeclaration(parent) ||
      ts.isParameter(parent) ||
      ts.isClassDeclaration(parent) ||
      ts.isInterfaceDeclaration(parent) ||
      ts.isTypeAliasDeclaration(parent) ||
      ts.isEnumDeclaration(parent) ||
      ts.isImportSpecifier(parent)) &&
    parent.name === node
  );
}

function propertyNameText(name: ts.PropertyName) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return undefined;
}

function stringLiteralText(node: ts.Node | undefined) {
  return node && ts.isStringLiteralLike(node) ? node.text : undefined;
}

function pushDirectGlobalError(
  sourceFile: ts.SourceFile,
  relativePath: string,
  node: ts.Node,
  lineOffset: number,
  globalName: string,
  errors: string[],
) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  errors.push(
    `${relativePath}:${position.line + 1 + lineOffset} uses direct browser global ${globalName}. ${directGlobalHelpText}`,
  );
}

function pushRuntimeServiceConfigureError(
  sourceFile: ts.SourceFile,
  relativePath: string,
  node: ts.Node,
  lineOffset: number,
  configureServiceName: string,
  errors: string[],
) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  errors.push(
    `${relativePath}:${position.line + 1 + lineOffset} calls runtime-service configuration API ${configureServiceName}. ${runtimeServiceConfigureHelpText}`,
  );
}

function lineCount(source: string) {
  return source.split("\n").length - 1;
}

function componentValidationRelativePath(file: string, resolvedPackageRoot: string) {
  return `packages/components/${relativeToPackage(file, resolvedPackageRoot)}`;
}

function listSourceFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(absolutePath));
      continue;
    }

    if (/\.(ts|vue)$/.test(entry.name)) files.push(absolutePath);
  }

  return files;
}

function relativeToPackage(file: string, resolvedPackageRoot: string) {
  return path.relative(resolvedPackageRoot, file).replaceAll(path.sep, "/");
}
