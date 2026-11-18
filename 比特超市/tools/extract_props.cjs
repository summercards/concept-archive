#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const acorn = require('internal/deps/acorn/acorn/dist/acorn');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = '/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html';
const MODULE = path.join(ROOT, 'assets/code/props-builder.js');
const MANIFEST = path.join(ROOT, 'build/props-source.json');
const EXPECTED_HASH = '9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function namesFromPattern(node) {
  if (!node) return [];
  if (node.type === 'Identifier') return [node.name];
  if (node.type === 'RestElement') return namesFromPattern(node.argument);
  if (node.type === 'AssignmentPattern') return namesFromPattern(node.left);
  if (node.type === 'ObjectPattern') return node.properties.flatMap((p) => namesFromPattern(p.value || p.argument));
  if (node.type === 'ArrayPattern') return node.elements.flatMap((p) => namesFromPattern(p));
  return [];
}

function lineColumn(text, offset) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset; i += 1) {
    if (text.charCodeAt(i) === 10) { line += 1; column = 1; } else column += 1;
  }
  return { line, column };
}

function codePointOffset(text, offset) {
  return Array.from(text.slice(0, offset)).length;
}

function declarationBindings(node) {
  if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') return [node.id.name];
  if (node.type === 'VariableDeclaration') return node.declarations.flatMap((d) => namesFromPattern(d.id));
  return [];
}

function parseOriginal(html) {
  const scriptStart = html.indexOf('<script>');
  const scriptEnd = html.indexOf('</script>', scriptStart);
  if (scriptStart < 0 || scriptEnd < 0) throw new Error('未找到原始内联脚本');
  const scriptOffset = scriptStart + '<script>'.length;
  const script = html.slice(scriptOffset, scriptEnd);
  const ast = acorn.parse(script, { ecmaVersion: 'latest', sourceType: 'script' });
  const iife = ast.body.find((n) => n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && n.expression.callee.type === 'ArrowFunctionExpression');
  if (!iife) throw new Error('原始脚本不是预期 IIFE');
  const body = iife.expression.callee.body.body;
  const declarations = new Map();
  const statements = [];
  for (const statement of body) {
    statements.push(statement);
    for (const name of declarationBindings(statement)) {
      declarations.set(name, { name, node: statement, start: statement.start, end: statement.end, kind: statement.type === 'VariableDeclaration' ? statement.kind : 'function' });
    }
  }
  const threeAliases = new Map();
  for (const statement of body) {
    if (statement.type !== 'ExpressionStatement') continue;
    const call = statement.expression;
    if (call.type !== 'CallExpression' || call.callee.type !== 'Identifier' || call.callee.name !== 'br') continue;
    const [namespace, exports] = call.arguments;
    if (namespace?.type !== 'Identifier' || namespace.name !== 'lt' || exports?.type !== 'ObjectExpression') continue;
    for (const property of exports.properties) {
      const key = property.key.name ?? property.key.value;
      const value = property.value;
      if (value.type === 'ArrowFunctionExpression' && value.body.type === 'Identifier') threeAliases.set(value.body.name, key);
    }
  }
  if (!threeAliases.size) throw new Error('未找到原始 br(lt,{...}) Three 导出表');
  return { html, script, scriptOffset, ast, body, declarations, statements, threeAliases };
}

function functionScopeBindings(fn) {
  const out = new Set(fn.params.flatMap((p) => namesFromPattern(p)));
  function scan(node) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      if (node.type === 'FunctionDeclaration' && node.id) out.add(node.id.name);
      return;
    }
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      if (node.id) out.add(node.id.name);
      return;
    }
    if (node.type === 'VariableDeclaration') {
      for (const declaration of node.declarations) namesFromPattern(declaration.id).forEach((name) => out.add(name));
    }
    for (const key of Object.keys(node)) {
      if (key === 'start' || key === 'end' || key === 'loc') continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) if (child?.type) scan(child);
      } else if (value?.type) {
        scan(value);
      }
    }
  }
  scan(fn.body);
  return out;
}

function isPropertyKey(parent, key) {
  if (!parent) return false;
  if ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') && key === 'property' && !parent.computed) return true;
  if ((parent.type === 'Property' || parent.type === 'MethodDefinition') && key === 'key' && !parent.computed) return true;
  if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' || parent.type === 'ContinueStatement') return key === 'label';
  return false;
}

function freeIdentifiers(root) {
  const refs = new Set();
  const scopes = [];
  function declared(name) { return scopes.some((s) => s.has(name)); }
  function visit(node, parent = null, key = '') {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'Identifier') {
      if (!isPropertyKey(parent, key) && !declared(node.name)) refs.add(node.name);
      return;
    }
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      const local = functionScopeBindings(node);
      if (node.type !== 'FunctionDeclaration' && node.id) local.add(node.id.name);
      scopes.push(local);
      for (const p of node.params) visitPatternDefaults(p);
      visit(node.body, node, 'body');
      scopes.pop();
      return;
    }
    if (node.type === 'VariableDeclarator') {
      visitPatternDefaults(node.id);
      visit(node.init, node, 'init');
      return;
    }
    if (node.type === 'Property' && node.method) {
      visit(node.value, node, 'value');
      return;
    }
    if (node.type === 'CatchClause') {
      const local = new Set(namesFromPattern(node.param));
      scopes.push(local); visit(node.body, node, 'body'); scopes.pop(); return;
    }
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      const local = new Set(node.id ? [node.id.name] : []);
      scopes.push(local); visit(node.body, node, 'body'); scopes.pop(); return;
    }
    for (const childKey of Object.keys(node)) {
      if (childKey === 'start' || childKey === 'end' || childKey === 'loc') continue;
      const value = node[childKey];
      if (Array.isArray(value)) {
        for (const child of value) if (child?.type) visit(child, node, childKey);
      } else if (value?.type) {
        visit(value, node, childKey);
      }
    }
  }
  function visitPatternDefaults(pattern) {
    if (!pattern) return;
    if (pattern.type === 'AssignmentPattern') visit(pattern.right, pattern, 'right');
    else if (pattern.type === 'ObjectPattern') pattern.properties.forEach((p) => visitPatternDefaults(p.value || p.argument));
    else if (pattern.type === 'ArrayPattern') pattern.elements.forEach(visitPatternDefaults);
    else if (pattern.type === 'RestElement') visitPatternDefaults(pattern.argument);
  }
  visit(root);
  return refs;
}

function nodeSource(parsed, item) {
  const raw = parsed.script.slice(item.start, item.end);
  return { raw, text: raw };
}

function sourceInfo(parsed, item) {
  const start = parsed.scriptOffset + item.start;
  const end = parsed.scriptOffset + item.end;
  return {
    sourceByteOffset: Buffer.byteLength(parsed.html.slice(0, start)),
    sourceByteEnd: Buffer.byteLength(parsed.html.slice(0, end)),
    sourceCodeUnitOffset: start,
    sourceCodeUnitEnd: end,
    sourceCodePointOffset: codePointOffset(parsed.html, start),
    sourceCodePointEnd: codePointOffset(parsed.html, end),
    sourceLineColumn: lineColumn(parsed.html, start),
    sourceCodeUnitLength: item.end - item.start,
    fragmentSha256: sha256(parsed.script.slice(item.start, item.end)),
  };
}

function selectedRegistrationStatements(parsed) {
  return parsed.statements.filter((statement) => {
    if (statement.type === 'ExpressionStatement') {
      const expression = statement.expression;
      return expression.type === 'CallExpression' && expression.callee.type === 'Identifier' && ['_i', 'J3', 'eb', 'sb'].includes(expression.callee.name);
    }
    if (statement.type === 'ForOfStatement') {
      const expression = statement.body?.expression;
      return expression?.type === 'CallExpression' && expression.callee.type === 'Identifier' && expression.callee.name === '_i';
    }
    return false;
  });
}

function propKeys(parsed) {
  const gi = parsed.declarations.get('Gi');
  const declaration = gi.node.declarations.find((d) => d.id.type === 'Identifier' && d.id.name === 'Gi');
  return declaration.init.properties.map((p) => String(p.key.name ?? p.key.value));
}

function functionNode(parsed, name) {
  const item = parsed.declarations.get(name);
  if (!item) return null;
  if (item.node.type === 'FunctionDeclaration' || item.node.type === 'FunctionExpression') return item.node;
  if (item.node.type === 'VariableDeclaration') {
    const declaration = item.node.declarations.find((entry) => namesFromPattern(entry.id).includes(name));
    if (declaration?.init?.type === 'FunctionExpression' || declaration?.init?.type === 'ArrowFunctionExpression') return declaration.init;
  }
  return null;
}

function walkAst(node, visitor) {
  if (!node || typeof node.type !== 'string') return;
  visitor(node);
  for (const key of Object.keys(node)) {
    if (key === 'start' || key === 'end' || key === 'loc') continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) if (child?.type) walkAst(child, visitor);
    } else if (value?.type) {
      walkAst(value, visitor);
    }
  }
}

function calledDeclarationNames(parsed, root) {
  const names = [];
  const seen = new Set();
  walkAst(root, (node) => {
    if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier') return;
    if (!parsed.declarations.has(node.callee.name) || seen.has(node.callee.name)) return;
    seen.add(node.callee.name);
    names.push({ name: node.callee.name, node });
  });
  return names;
}

function memberKeysForNames(fn, parameterNames) {
  if (!fn) return [];
  const keys = new Set();
  walkAst(fn.body, (node) => {
    if (node.type !== 'MemberExpression' || node.computed || node.object.type !== 'Identifier') return;
    if (parameterNames.includes(node.object.name) && node.property.type === 'Identifier') keys.add(node.property.name);
  });
  return [...keys];
}

function memberKeysForParameters(fn) {
  if (!fn) return [];
  return memberKeysForNames(fn, fn.params.slice(1).flatMap((param) => namesFromPattern(param)));
}

function callsTo(parsed, root, name) {
  const calls = [];
  walkAst(root, (node) => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === name) calls.push(node);
  });
  return calls;
}

function actualOptionMetadata(parsed, callback, builder) {
  const fn = functionNode(parsed, builder);
  if (!fn) return { optionKeys: [], defaults: {} };
  const optionNames = callback ? namesFromPattern(callback.params[1]) : [];
  const keys = new Set(callback ? memberKeysForNames(callback, optionNames) : []);
  let optionParam = fn.params[1];
  if (callback) {
    for (const call of callsTo(parsed, callback, builder)) {
      for (let index = 0; index < call.arguments.length; index += 1) {
        const argument = call.arguments[index];
        if (argument.type !== 'Identifier' || !optionNames.includes(argument.name)) continue;
        optionParam = fn.params[index];
        keysForMappedOption(parsed, fn, optionParam, keys);
      }
    }
  } else {
    keysForMappedOption(parsed, fn, optionParam, keys);
  }
  const defaults = {};
  if (optionParam?.type === 'AssignmentPattern' && optionParam.left.type === 'ObjectPattern') {
    for (const property of optionParam.left.properties) {
      const key = property.key.name ?? property.key.value;
      const value = property.value?.type === 'AssignmentPattern' ? property.value.right : null;
      defaults[key] = value ? parsed.script.slice(value.start, value.end) : null;
    }
  }
  return { optionKeys: [...keys].filter((key) => !['mats', 'userData', 'length'].includes(key)).sort(), defaults };
}

function keysForMappedOption(parsed, fn, optionParam, keys) {
  if (!optionParam) return;
  const names = namesFromPattern(optionParam);
  for (const key of memberKeysForNames(fn, names)) keys.add(key);
}

function defaultsForParameters(parsed, functions) {
  const defaults = {};
  for (const fn of functions) {
    for (const param of fn?.params?.slice(1) || []) {
      if (param.type !== 'AssignmentPattern' || param.left.type !== 'ObjectPattern') continue;
      for (const property of param.left.properties) {
        const key = property.key.name ?? property.key.value;
        const value = property.value?.type === 'AssignmentPattern' ? property.value.right : null;
        defaults[key] = value ? parsed.script.slice(value.start, value.end) : null;
      }
    }
  }
  return defaults;
}

function functionClosure(parsed, roots) {
  const seen = new Set();
  const functions = [];
  const visit = (name) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    const fn = functionNode(parsed, name);
    if (!fn) return;
    functions.push(fn);
    for (const entry of calledDeclarationNames(parsed, fn)) visit(entry.name);
  };
  for (const root of roots) visit(root);
  return functions;
}

function isActualBuilder(parsed, name) {
  const fn = functionNode(parsed, name);
  if (!fn) return false;
  const source = parsed.script.slice(fn.start, fn.end);
  return name === 'M3' || /new\s+Kn\b|\.finish\s*\(/.test(source);
}

function chainMetadata(parsed, callback, directBuilder) {
  const chain = [];
  const add = (name, callNode = null) => {
    if (!name || chain.some((entry) => entry.name === name)) return;
    chain.push({ name, call: callNode ? parsed.script.slice(callNode.start, callNode.end) : null });
  };
  if (directBuilder) add(directBuilder);
  if (callback) {
    for (const entry of calledDeclarationNames(parsed, callback)) add(entry.name, entry.node);
  }
  const chainNames = chain.map((entry) => entry.name);
  const builder = [...chainNames].reverse().find((name) => isActualBuilder(parsed, name)) || chainNames.at(-1) || null;
  const functions = functionClosure(parsed, chainNames);
  const chainFunctions = chainNames.map((name) => functionNode(parsed, name)).filter(Boolean);
  const actual = actualOptionMetadata(parsed, callback, builder);
  const optionKeys = [...new Set([
    ...memberKeysForParameters(callback),
    ...actual.optionKeys,
  ])].filter((key) => !['mats', 'userData', 'length'].includes(key)).sort();
  return {
    chain: chain.map((entry) => ({ ...entry, role: entry.name === builder ? 'builder' : 'wrapper' })),
    builder,
    functions,
    chainFunctions,
    optionKeys,
    defaults: { ...defaultsForParameters(parsed, [callback]), ...actual.defaults },
  };
}

function findRegisteredBuilders(parsed, registrations) {
  const out = new Map();
  function addCallback(name, fn, registration) {
    const metadata = chainMetadata(parsed, fn, null);
    const builder = metadata.chain[0]?.name;
    if (builder) out.set(name, { builder, innerBuilders: metadata.chain.slice(1).map((entry) => entry.name), registration, callback: parsed.script.slice(fn.start, fn.end), entryCallback: parsed.script.slice(fn.start, fn.end), ...metadata });
  }
  for (const name of ['J3', 'eb', 'sb']) {
    const item = parsed.declarations.get(name);
    if (!item) continue;
    walkAst(item.node, (node) => {
      if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier' || node.callee.name !== 'i') return;
      const nameArg = node.arguments[0];
      const callback = node.arguments[1];
      if (nameArg?.type === 'Literal' && callback?.type === 'ArrowFunctionExpression') addCallback(String(nameArg.value), callback, parsed.script.slice(node.start, node.end));
    });
  }
  for (const statement of registrations) {
    if (statement.type === 'ExpressionStatement') {
      const call = statement.expression;
      const name = call.arguments[0]?.type === 'Literal' ? String(call.arguments[0].value) : null;
      const builder = call.arguments[1]?.type === 'Identifier' ? call.arguments[1].name : null;
      if (call.callee.type === 'Identifier' && call.callee.name === '_i' && name && builder) {
        const metadata = chainMetadata(parsed, null, builder);
        out.set(name, { builder, registration: parsed.script.slice(statement.start, statement.end), callback: null, entryCallback: builder, entryKind: 'direct', ...metadata });
      }
      continue;
    }
    if (statement.type !== 'ForOfStatement') continue;
    const names = statement.right?.type === 'ArrayExpression' ? statement.right.elements.map((element) => String(element.value)) : [];
    const call = statement.body?.expression;
    const callback = call?.type === 'CallExpression' ? call.arguments[1] : null;
    if (callback?.type !== 'ArrowFunctionExpression') continue;
    const metadata = chainMetadata(parsed, callback, null);
    const builder = metadata.chain[0]?.name;
    if (builder) for (const name of names) out.set(name, { builder, innerBuilders: metadata.chain.slice(1).map((entry) => entry.name), registration: parsed.script.slice(statement.start, statement.end), callback: parsed.script.slice(callback.start, callback.end), entryCallback: parsed.script.slice(callback.start, callback.end), ...metadata });
  }
  return out;
}

function buildExtraction(parsed) {
  const registrations = selectedRegistrationStatements(parsed);
  const initialStatements = new Set(registrations);
  for (const name of ['Gi', 'Xg', '_i', 'Yg', 'jn', 'Kn', 'io', 'J3', 'eb', 'sb']) {
    const item = parsed.declarations.get(name);
    if (!item) throw new Error(`原文缺少道具核心声明: ${name}`);
    initialStatements.add(item.node);
  }
  const selected = new Set(initialStatements);
  const queue = [...selected];
  const includedBindings = new Set();
  while (queue.length) {
    const statement = queue.shift();
    for (const binding of declarationBindings(statement)) includedBindings.add(binding);
    const refs = freeIdentifiers(statement);
    for (const ref of refs) {
      if (parsed.threeAliases.has(ref)) continue;
      const dep = parsed.declarations.get(ref);
      if (!dep || selected.has(dep.node)) continue;
      selected.add(dep.node); queue.push(dep.node);
    }
  }
  const ordered = parsed.statements.filter((statement) => selected.has(statement));
  const fragments = ordered.map((statement) => {
    const binding = declarationBindings(statement)[0] || `expr@${statement.start}`;
    const item = { name: binding, node: statement, start: statement.start, end: statement.end, kind: statement.type === 'VariableDeclaration' ? statement.kind : 'function' };
    return { ...item, ...nodeSource(parsed, item), source: sourceInfo(parsed, item), bindings: declarationBindings(statement), freeRefs: [...freeIdentifiers(statement)].sort() };
  });
  return { registrations, ordered, fragments, includedBindings };
}

function buildModule(parsed, extraction, sourceHash) {
  const usedAliases = new Set();
  for (const fragment of extraction.fragments) for (const ref of fragment.freeRefs) if (parsed.threeAliases.has(ref)) usedAliases.add(ref);
  const aliasNames = [...usedAliases].sort();
  const aliases = [`const lt = THREE;`, ...aliasNames.map((name) => `const ${name} = THREE.${parsed.threeAliases.get(name)};`)].join('\n');
  const raw = extraction.fragments.filter((fragment) => !fragment.bindings.includes('lt')).map((fragment) => fragment.text).join('\n');
  const propList = propKeys(parsed);
  const registrations = selectedRegistrationStatements(parsed).map((statement) => parsed.script.slice(statement.start, statement.end));
  const header = `/* Extracted from ${SOURCE}; source SHA-256 ${sourceHash}. Constructor and registration sources are preserved verbatim. */\n`;
  const adapter = `\nlet __lastPropBuild = null;\n\nfunction __assertMats(ctx) {\n  if (!ctx || !ctx.mats || typeof ctx.mats.get !== "function") throw new TypeError("props require ctx.mats.get(name, options?)");\n  if (typeof ctx.mats.label !== "function") throw new TypeError("props require ctx.mats.label(id, options?)");\n  if (typeof ctx.mats.decal !== "function") throw new TypeError("props require ctx.mats.decal(id)");\n  if (typeof ctx.mats.emissive !== "function") throw new TypeError("props require ctx.mats.emissive(color, intensity)");\n}\n\nfunction __hasValidGeometry(value) {\n  let meshes = 0;\n  const visit = (object) => {\n    if (!object) return;\n    if (object.isMesh) {\n      const position = object.geometry && object.geometry.attributes && object.geometry.attributes.position;\n      if (position && position.count > 0) {\n        for (let index = 0; index < position.array.length; index += 1) {\n          if (!Number.isFinite(position.array[index])) return false;\n        }\n        meshes += 1;\n      }\n    }\n    for (const child of object.children || []) if (!visit(child)) return false;\n    return true;\n  };\n  return visit(value) && meshes > 0;\n}\n\nfunction __looksLikeFallback(value, id) {\n  if (!value || !value.userData || value.userData.prop !== id) return true;\n  if (!Xg[id]) return true;\n  return !__hasValidGeometry(value);\n}\n\nfunction __buildChecked(ctx, id, options = {}) {\n  __assertMats(ctx);\n  if (!Gi[id] || !Xg[id]) throw new Error(\`unknown or unregistered prop: \${id}\`);\n  const service = Yg(ctx);\n  const originalError = console.error;\n  let builderError = null;\n  console.error = (...args) => {\n    if (String(args[0] || "").startsWith(\`[props] builder "\${id}" threw\`)) builderError = args[1] || new Error(String(args[0]));\n    originalError(...args);\n  };\n  let value;\n  let buildError = null;\n  try { value = service.build(id, options); } catch (error) { buildError = error; } finally { console.error = originalError; }\n  if (builderError || buildError || __looksLikeFallback(value, id)) {\n    const error = new Error(\`original Yg.build fallback for prop "\${id}"\`);\n    error.cause = builderError || buildError || null;\n    throw error;\n  }\n  __lastPropBuild = { id, options, value };\n  return value;\n}\n\nexport function createPropService(ctx) {\n  __assertMats(ctx);\n  const service = Yg(ctx);\n  return {\n    names: () => service.names(),\n    has: (id) => !!Gi[id] && !!Xg[id],\n    build: (id, opts = {}) => __buildChecked(ctx, id, opts),\n    registry: Xg,\n    sizes: Gi,\n  };\n}\n\nexport function buildProp(ctx, id, opts = {}) { return __buildChecked(ctx, id, opts); }\n\nexport { Yg, Gi, Xg, _i, jn, Kn, io };\n`;
  const text = `${header}import * as THREE from "three";\n${aliases}\n\n${raw}\n${adapter}`;
  const sourceIndex = {};
  for (const fragment of extraction.fragments) sourceIndex[fragment.name] = { ...fragment.source, bindings: fragment.bindings, freeRefs: fragment.freeRefs };
  return { text, sourceIndex, aliasAudit: Object.fromEntries(aliasNames.map((name) => [name, { originalBinding: name, brExport: parsed.threeAliases.get(name), generated: `THREE.${parsed.threeAliases.get(name)}` }])) , propList, registrations };
}

function objectPatternKeys(pattern) {
  if (!pattern || pattern.type !== 'ObjectPattern') return [];
  return pattern.properties.map((property) => String(property.key.name ?? property.key.value));
}

function functionSource(parsed, fn) {
  return fn ? parsed.script.slice(fn.start, fn.end) : '';
}

function materialDependencies(source) {
  const methods = new Set();
  for (const match of source.matchAll(/\.mats\.([A-Za-z_$][\w$]*)\s*\(/g)) methods.add(match[1]);
  return [...methods].sort();
}

function dynamicHookInfo(source) {
  const dynamicUserData = /userData[\s\S]{0,80}(?:setState|update|noMerge)|(?:setState|update|noMerge)[\s\S]{0,80}userData/.test(source);
  return {
    update: /(?:userData\s*\.\s*)?update\s*=/.test(source),
    setState: /(?:userData\s*\.\s*)?setState\s*=/.test(source),
    noMerge: /(?:userData\s*\.\s*)?noMerge\s*=/.test(source),
    userData: dynamicUserData,
  };
}

function makeManifest(parsed, extraction, built, htmlBytes, sourceHash) {
  const reg = findRegisteredBuilders(parsed, extraction.registrations);
  const props = Object.fromEntries(built.propList.map((id) => {
    const item = reg.get(id);
    const chainFunctions = item?.functions || [];
    const chainSource = [item?.entryCallback, ...chainFunctions.map((fn) => functionSource(parsed, fn))].filter(Boolean).join('\\n');
    const optionKeys = item?.optionKeys || [];
    const defaults = item?.defaults || {};
    const materials = materialDependencies(chainSource);
    return [id, {
      builder: item?.builder || null,
      entryCallback: item?.entryCallback || null,
      entryKind: item?.entryKind || (item?.entryCallback ? 'callback' : 'direct'),
      builderChain: item?.chain || [],
      innerBuilders: (item?.chain || []).filter((entry) => entry.role === 'builder').map((entry) => entry.name),
      defaultOptions: defaults,
      defaultParameter: 't={}',
      optionKeys,
      materialDependencies: materials,
      optionSources: (item?.chain || []).map((entry) => entry.name),
      dynamicHooks: dynamicHookInfo(chainSource),
      registration: item?.registration || null,
    }];
  }));
  return { source: { path: SOURCE, bytes: htmlBytes, sha256: sourceHash }, generated: { path: path.relative(ROOT, MODULE), bytes: Buffer.byteLength(built.text), sha256: sha256(built.text) }, extraction: { parser: 'node:internal/deps/acorn/acorn/dist/acorn', parserVersion: acorn.version, sourceUnit: 'sourceByteOffset/sourceByteEnd are UTF-8 byte offsets; sourceCodeUnitOffset/sourceCodeUnitEnd are UTF-16 code-unit offsets; sourceCodePointOffset/sourceCodePointEnd are Unicode code-point offsets; sourceLineColumn is 1-based HTML Unicode code-unit line/column', originalScriptTagOffset: parsed.scriptOffset, propCount: built.propList.length, props, publicAPI: ['createPropService(ctx)', 'buildProp(ctx,id,opts={})', 'Yg(ctx).names()', 'Yg(ctx).has(id)', 'Yg(ctx).build(id,opts)', '_i(id,builder)', 'Gi', 'Xg', 'jn', 'Kn', 'io'], exactDependencies: ['three@0.180.0', 'ctx.mats.get(name, options?)', 'ctx.mats.label(id, options?)', 'ctx.mats.decal(id)', 'ctx.mats.emissive(color, intensity)', 'console.error (only observed to reject original Yg fallback)', 'original top-level prop dependency closure'], aliasAudit: built.aliasAudit, includedBindings: [...extraction.includedBindings].sort(), registrations: built.registrations, fragments: built.sourceIndex } };
}

function main() {
  const htmlBuffer = fs.readFileSync(SOURCE);
  const sourceHash = sha256(htmlBuffer);
  if (sourceHash !== EXPECTED_HASH) throw new Error(`原文件 hash 不匹配: ${sourceHash}`);
  const parsed = parseOriginal(htmlBuffer.toString('utf8'));
  const extraction = buildExtraction(parsed);
  const built = buildModule(parsed, extraction, sourceHash);
  fs.writeFileSync(MODULE, built.text);
  fs.writeFileSync(MANIFEST, `${JSON.stringify(makeManifest(parsed, extraction, built, htmlBuffer.length, sourceHash), null, 2)}\n`);
  console.log(`写出 ${path.relative(ROOT, MODULE)} (${Buffer.byteLength(built.text)} B)`);
  console.log(`写出 ${path.relative(ROOT, MANIFEST)} (${Buffer.byteLength(fs.readFileSync(MANIFEST))} B)`);
  console.log(`道具 ${built.propList.length} 个；闭包声明 ${extraction.includedBindings.size} 个；Three 别名 ${Object.keys(built.aliasAudit).length} 个`);
}

main();
