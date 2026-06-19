import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

type ConfigPanelManifest = {
  entry: { configPanel: string };
  sourcePath: string;
};

export function validateConfigPanelParamContract(
  manifest: ConfigPanelManifest,
  resolvedPackageRoot: string,
  definitionSource: string,
  definitionPath: string,
  errors: string[],
) {
  const declaredParamKeys = collectDeclaredParamKeys(definitionSource, definitionPath);
  if (!declaredParamKeys) return;

  const configPanelPath = path.join(
    resolvedPackageRoot,
    manifest.sourcePath,
    manifest.entry.configPanel,
  );
  if (!existsSync(configPanelPath)) return;

  const source = readFileSync(configPanelPath, "utf8");
  const relativePath = `${manifest.sourcePath}/${manifest.entry.configPanel}`;

  validateConfigPanelTemplateParams(
    source,
    configPanelPath,
    relativePath,
    declaredParamKeys,
    errors,
  );
  validateConfigPanelScript(source, configPanelPath, relativePath, declaredParamKeys, errors);
}

function collectDeclaredParamKeys(
  source: string,
  fileName: string,
  seen = new Set<string>(),
): Set<string> | null {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const definitionObject = findComponentDefinitionObject(sourceFile);
  const paramsProperty = definitionObject?.properties.find(isParamsProperty);
  if (!paramsProperty || !ts.isPropertyAssignment(paramsProperty)) return null;

  const paramsObject = resolveObjectLiteralExpression(
    paramsProperty.initializer,
    sourceFile,
    fileName,
    seen,
  );
  if (!paramsObject) return null;

  return new Set(collectObjectLiteralKeys(paramsObject));
}

function findComponentDefinitionObject(sourceFile: ts.SourceFile) {
  let definitionObject: ts.ObjectLiteralExpression | undefined;

  const inspectExpression = (expression: ts.Expression) => {
    definitionObject = unwrapDefinitionObject(expression);
  };

  const visit = (node: ts.Node) => {
    if (definitionObject) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "componentDefinition" &&
      node.initializer
    ) {
      inspectExpression(node.initializer);
      return;
    }
    if (ts.isExportAssignment(node)) {
      inspectExpression(node.expression);
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return definitionObject;
}

function resolveObjectLiteralExpression(
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
  fileName: string,
  seen: Set<string>,
): ts.ObjectLiteralExpression | null {
  const unwrapped = unwrapExpression(expression);
  if (ts.isObjectLiteralExpression(unwrapped)) return unwrapped;
  if (!ts.isIdentifier(unwrapped)) return null;

  const local = findLocalObjectLiteral(sourceFile, unwrapped.text);
  if (local) return local;

  const importedSource = findImportedBindingSource(sourceFile, unwrapped.text, fileName);
  if (!importedSource) return null;
  const importKey = `${importedSource.filePath}:${importedSource.importedName}`;
  if (seen.has(importKey)) return null;
  seen.add(importKey);

  const importedFile = ts.createSourceFile(
    importedSource.filePath,
    readFileSync(importedSource.filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  return findExportedObjectLiteral(importedFile, importedSource.importedName);
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  if (ts.isSatisfiesExpression(expression) || ts.isAsExpression(expression)) {
    return unwrapExpression(expression.expression);
  }
  if (ts.isParenthesizedExpression(expression)) return unwrapExpression(expression.expression);
  return expression;
}

function findLocalObjectLiteral(sourceFile: ts.SourceFile, bindingName: string) {
  let result: ts.ObjectLiteralExpression | null = null;
  const visit = (node: ts.Node) => {
    if (result) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === bindingName &&
      node.initializer
    ) {
      const unwrapped = unwrapExpression(node.initializer);
      if (ts.isObjectLiteralExpression(unwrapped)) result = unwrapped;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function findExportedObjectLiteral(sourceFile: ts.SourceFile, exportedName: string) {
  let result: ts.ObjectLiteralExpression | null = null;
  const visit = (node: ts.Node) => {
    if (result) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === exportedName &&
      node.initializer
    ) {
      const unwrapped = unwrapExpression(node.initializer);
      if (ts.isObjectLiteralExpression(unwrapped)) result = unwrapped;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function findImportedBindingSource(sourceFile: ts.SourceFile, localName: string, fileName: string) {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const specifier = stringLiteralText(statement.moduleSpecifier);
    if (!specifier?.startsWith(".")) continue;
    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const element of namedBindings.elements) {
      if (element.name.text !== localName) continue;
      const importedName = element.propertyName?.text ?? element.name.text;
      const filePath = resolveRelativeTsImport(fileName, specifier);
      if (filePath) return { filePath, importedName };
    }
  }
  return null;
}

function resolveRelativeTsImport(fromFile: string, specifier: string) {
  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [basePath, `${basePath}.ts`, path.join(basePath, "index.ts")];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function collectObjectLiteralKeys(objectLiteral: ts.ObjectLiteralExpression) {
  return objectLiteral.properties
    .map((property) => {
      if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
        return null;
      }
      return propertyNameText(property.name);
    })
    .filter((key): key is string => key !== null && key !== undefined);
}

function validateConfigPanelTemplateParams(
  source: string,
  fileName: string,
  relativePath: string,
  declaredParamKeys: ReadonlySet<string>,
  errors: string[],
) {
  const scriptSourceFiles = extractVueScriptBlocks(source).map((block) =>
    ts.createSourceFile(fileName, block.source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
  );
  const paramsBindingPattern = /<Schema(?:ConfigPanel|Form)\b[\s\S]*?:params\s*=\s*(["'])(.*?)\1/g;
  for (const match of source.matchAll(paramsBindingPattern)) {
    const expression = match[2];
    if (!expression) continue;
    const syntheticSource = `const __configPanelParams = (${expression});`;
    const sourceFile = ts.createSourceFile(
      relativePath,
      syntheticSource,
      ts.ScriptTarget.Latest,
      true,
    );
    const syntheticObjectLiteral = findLocalObjectLiteral(sourceFile, "__configPanelParams");
    const objectLiteral =
      syntheticObjectLiteral ??
      resolveTemplateParamsIdentifier(expression, scriptSourceFiles, fileName);
    if (!objectLiteral) continue;
    validateObjectLiteralKeys(
      objectLiteral,
      declaredParamKeys,
      (key) =>
        `${relativePath} exposes ConfigPanel param "${key}" that is not declared by componentDefinition.params.`,
      errors,
    );
  }
}

function resolveTemplateParamsIdentifier(
  expression: string,
  sourceFiles: readonly ts.SourceFile[],
  fileName: string,
) {
  const expressionSource = ts.createSourceFile(
    fileName,
    `const __templateExpression = (${expression});`,
    ts.ScriptTarget.Latest,
    true,
  );
  const expressionNode = findLocalVariableInitializer(expressionSource, "__templateExpression");
  if (!expressionNode) return null;

  for (const sourceFile of sourceFiles) {
    const objectLiteral = resolveObjectLiteralExpression(
      expressionNode,
      sourceFile,
      fileName,
      new Set<string>(),
    );
    if (objectLiteral) return objectLiteral;
  }

  return null;
}

function validateConfigPanelScript(
  source: string,
  fileName: string,
  relativePath: string,
  declaredParamKeys: ReadonlySet<string>,
  errors: string[],
) {
  const blocks = extractVueScriptBlocks(source);
  for (const block of blocks) {
    const sourceFile = ts.createSourceFile(
      fileName,
      block.source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    collectConfigPanelScriptIssues(
      sourceFile,
      relativePath,
      block.lineOffset,
      declaredParamKeys,
      errors,
    );
  }
}

const appPrivateLegacyHelperModules = new Set([
  "@/components/config",
  "@/lib/project-inspector-config-update",
  "@/registry/definition",
]);

const legacyFieldHelperNamePattern =
  /^(deriveParamValuesFromFields|normalizeLegacy.*Fields?|migrateLegacy.*Fields?|normalizeLegacyFieldPath|.*FieldsToParamValues.*|.*FieldPathNormalization.*)$/;

function collectConfigPanelScriptIssues(
  sourceFile: ts.SourceFile,
  relativePath: string,
  lineOffset: number,
  declaredParamKeys: ReadonlySet<string>,
  errors: string[],
) {
  const emitIdentifiers = collectDefineEmitsIdentifiers(sourceFile);
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      const specifier = stringLiteralText(node.moduleSpecifier);
      if (specifier && appPrivateLegacyHelperModules.has(specifier)) {
        pushConfigPanelPolicyError(
          sourceFile,
          relativePath,
          node.moduleSpecifier,
          lineOffset,
          `imports app-private legacy field helper module "${specifier}"`,
          errors,
        );
      }
    }

    if (
      ts.isIdentifier(node) &&
      legacyFieldHelperNamePattern.test(node.text) &&
      !isIgnoredIdentifierReference(node)
    ) {
      pushConfigPanelPolicyError(
        sourceFile,
        relativePath,
        node,
        lineOffset,
        `uses app-private legacy field helper "${node.text}"`,
        errors,
      );
    }

    const emittedUpdate = emittedConfigPanelUpdate(node, emitIdentifiers);
    if (emittedUpdate) {
      validateObjectLiteralKeys(
        emittedUpdate.payload,
        declaredParamKeys,
        (key) =>
          `${relativePath} emits ${emittedUpdate.eventName} key "${key}" that is not declared by componentDefinition.params.`,
        errors,
      );
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

function emittedConfigPanelUpdate(node: ts.Node, emitIdentifiers: ReadonlySet<string>) {
  if (!ts.isCallExpression(node)) return null;
  if (!ts.isIdentifier(node.expression) || !emitIdentifiers.has(node.expression.text)) return null;
  const eventName = stringLiteralText(node.arguments[0]);
  if (eventName !== "update:config" && eventName !== "update:paramValues") return null;
  const payload = node.arguments[1];
  const unwrapped = payload && ts.isExpression(payload) ? unwrapExpression(payload) : null;
  if (!unwrapped) return null;
  const payloadObject = resolveObjectLiteralExpression(
    unwrapped,
    node.getSourceFile(),
    node.getSourceFile().fileName,
    new Set<string>(),
  );
  if (!payloadObject) return null;
  return { eventName, payload: payloadObject };
}

function collectDefineEmitsIdentifiers(sourceFile: ts.SourceFile) {
  const identifiers = new Set<string>(["emit"]);
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "defineEmits"
    ) {
      identifiers.add(node.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return identifiers;
}

function findLocalVariableInitializer(sourceFile: ts.SourceFile, bindingName: string) {
  let result: ts.Expression | null = null;
  const visit = (node: ts.Node) => {
    if (result) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === bindingName &&
      node.initializer
    ) {
      result = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function validateObjectLiteralKeys(
  objectLiteral: ts.ObjectLiteralExpression,
  declaredParamKeys: ReadonlySet<string>,
  message: (key: string) => string,
  errors: string[],
) {
  for (const key of collectObjectLiteralKeys(objectLiteral)) {
    if (!declaredParamKeys.has(key)) errors.push(message(key));
  }
}

function pushConfigPanelPolicyError(
  sourceFile: ts.SourceFile,
  relativePath: string,
  node: ts.Node,
  lineOffset: number,
  message: string,
  errors: string[],
) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  errors.push(`${relativePath}:${position.line + 1 + lineOffset} ${message}.`);
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

function unwrapDefinitionObject(expression: ts.Expression): ts.ObjectLiteralExpression | undefined {
  if (ts.isObjectLiteralExpression(expression)) return expression;
  if (ts.isCallExpression(expression)) {
    const [firstArgument] = expression.arguments;
    if (firstArgument && ts.isObjectLiteralExpression(firstArgument)) return firstArgument;
  }
  if (ts.isSatisfiesExpression(expression) || ts.isAsExpression(expression)) {
    return unwrapDefinitionObject(expression.expression);
  }
  return undefined;
}

function isParamsProperty(property: ts.ObjectLiteralElementLike) {
  if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property))
    return false;
  const name = property.name;
  return (
    (ts.isIdentifier(name) && name.text === "params") ||
    (ts.isStringLiteral(name) && name.text === "params")
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

function lineCount(source: string) {
  return source.split("\n").length - 1;
}
