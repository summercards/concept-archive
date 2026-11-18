#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const acorn = require('internal/deps/acorn/acorn/dist/acorn');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = '/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html';
const MODULE = path.join(ROOT, 'assets/code/container-builder.js');
const MANIFEST = path.join(ROOT, 'build/container-source.json');
const EXPECTED_HASH = '9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function lineColumn(text, offset) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function htmlLineColumn(html, offset) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset; i += 1) {
    if (html.charCodeAt(i) === 10) {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function unicodeCodePointOffset(text, offset) {
  return Array.from(text.slice(0, offset)).length;
}

function bindingNames(pattern) {
  if (pattern.type === 'Identifier') return [pattern.name];
  if (pattern.type === 'ObjectPattern') return pattern.properties.flatMap((property) =>
    bindingNames(property.value || property.argument));
  if (pattern.type === 'ArrayPattern') return pattern.elements.flatMap((element) =>
    element ? bindingNames(element) : []);
  return [];
}

function parseOriginal(html) {
  const scriptStart = html.indexOf('<script>');
  const scriptEnd = html.indexOf('</script>', scriptStart);
  if (scriptStart < 0 || scriptEnd < 0) throw new Error('未找到原始内联脚本');
  const scriptOffset = scriptStart + '<script>'.length;
  const script = html.slice(scriptOffset, scriptEnd);
  const ast = acorn.parse(script, { ecmaVersion: 'latest', sourceType: 'script' });
  const call = ast.body.find((node) => node.type === 'ExpressionStatement')?.expression;
  if (!call || call.type !== 'CallExpression' || call.callee.type !== 'ArrowFunctionExpression') {
    throw new Error('原始脚本不是预期 IIFE');
  }
  const declarations = new Map();
  const threeAliases = new Map();
  for (const statement of call.callee.body.body) {
    if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression' &&
        statement.expression.callee.type === 'Identifier' && statement.expression.callee.name === 'br') {
      const [namespace, exports] = statement.expression.arguments;
      if (namespace?.type === 'Identifier' && namespace.name === 'lt' && exports?.type === 'ObjectExpression') {
        for (const property of exports.properties) {
          const key = property.key.name ?? property.key.value;
          const value = property.value;
          if (value.type === 'ArrowFunctionExpression' && value.body.type === 'Identifier') {
            threeAliases.set(value.body.name, key);
          }
        }
      }
    }
  }
  if (!threeAliases.size) throw new Error('未找到原始 br(lt,{...}) Three 导出表');
  for (const statement of call.callee.body.body) {
    if (statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') {
      declarations.set(statement.id.name, { node: statement, kind: 'function', start: statement.start, end: statement.end });
    } else if (statement.type === 'VariableDeclaration') {
      for (const declaration of statement.declarations) {
        for (const name of bindingNames(declaration.id)) {
          declarations.set(name, {
            node: declaration,
            kind: statement.kind,
            start: declaration.start,
            end: declaration.end,
          });
        }
      }
    }
  }
  return { script, scriptOffset, declarations, html, threeAliases };
}

function extractOriginal({ script, declarations }, names) {
  const seen = new Set();
  const fragments = [];
  for (const name of names) {
    if (seen.has(name)) continue;
    const item = declarations.get(name);
    if (!item) throw new Error(`原文缺少声明: ${name}`);
    seen.add(name);
    const raw = script.slice(item.start, item.end);
    const text = item.kind === 'function' || item.kind === 'class'
      ? raw
      : `${item.kind} ${raw};`;
    fragments.push({ name, text, raw, start: item.start, end: item.end });
  }
  return fragments;
}

function buildModule(parsed, sourceHash) {
  const three = (name) => {
    const exportName = parsed.threeAliases.get(name);
    if (!exportName) throw new Error(`缺少原始 br(lt,{}) 导出映射: ${name}`);
    return `THREE.${exportName}`;
  };
  const aliasNames = ['W', 'un', 'Ys', 'Jr', 'Kr', 'Lt', 'Ye', 'In', 'nt', 'et', 'Qe', 'wt', 'Qt', 'Nn', 'xs', 'rn', 'ar', 'Ae', 'ls', 'Vn', 'Ln', 'Sn', 'bs'];
  const aliasAudit = Object.fromEntries(aliasNames.map((name) => [name, {
    originalBinding: name,
    brExport: parsed.threeAliases.get(name),
    generated: three(name),
  }]));
  const canvasDecls = extractOriginal(parsed, ['o3', 'r3', 'oA', 'Ut', 'An', 'rA']);
  const canvasFunctions = extractOriginal(parsed, ['aA', 'lA', 'Wg', 'ra', 'Ks', 'a3', 'qa', 'l3']);
  const geometryFunctions = extractOriginal(parsed, [
    'Ly', 'sa', '$e', 'Wi', 'ot', 'Fn', 'Dc', 'Lc', 'Ii',
    'h1', 'ri', 'p3', 'm3', 'la', 'CA', 'Uc', 'pr', 'cn', 'Nc', 'PA', 'oa', 'ky', 'Fy', 'Uy', 'Ny', 'Fg',
    'je', '_o', 'jn', 'Zg', 'qi', 'Mi', 'Jn', 'zA', 'M3',
  ]);
  const geometryConstants = extractOriginal(parsed, [
    'Gi', '$a', 'RA', 'mn', 'Ir', 'f1', 'Fc', 'g3', 'd1', 'p1',
    'm1', 'Bc', '_3', 'v1', 'v3', 'jg', 'Jt', 'IA', 'x3', 'y3', 'bf', 'b3', 'Uo', 'x1', 'y1',
  ]);

  const all = [...canvasDecls, ...canvasFunctions, ...geometryConstants, ...geometryFunctions];
  const unique = [];
  const names = new Set();
  for (const fragment of all) {
    if (!names.has(fragment.name)) {
      names.add(fragment.name);
      unique.push(fragment);
    }
  }

  const sourceIndex = Object.fromEntries(unique.map((fragment) => [fragment.name, {
    sourceByteOffset: Buffer.byteLength(parsed.html.slice(0, parsed.scriptOffset + fragment.start)),
    sourceByteEnd: Buffer.byteLength(parsed.html.slice(0, parsed.scriptOffset + fragment.end)),
    sourceCodeUnitOffset: parsed.scriptOffset + fragment.start,
    sourceCodeUnitEnd: parsed.scriptOffset + fragment.end,
    sourceCodePointOffset: unicodeCodePointOffset(parsed.html, parsed.scriptOffset + fragment.start),
    sourceCodePointEnd: unicodeCodePointOffset(parsed.html, parsed.scriptOffset + fragment.end),
    sourceLineColumn: htmlLineColumn(parsed.html, parsed.scriptOffset + fragment.start),
    sourceCodeUnitLength: fragment.end - fragment.start,
    anchor: fragment.name === 'M3' ? 'function M3(i,e,t={})' : fragment.name === 'zA' ? 'function zA(i,e,t,n,s)' : fragment.name === 'l3' ? 'function l3(i,e=4)' : fragment.name === 'jn' ? 'var jn=class' : `${fragment.name} declaration`,
    fragmentSha256: sha256(fragment.raw),
  }]));

  const raw = unique.map((fragment) => fragment.text).join('\n');
  const header = `/* Extracted from ${SOURCE}; source SHA-256 ${sourceHash}. */\n`;
  const aliases = `import * as THREE from "three";\n\n${aliasNames.map((name) => `const ${name} = ${three(name)};`).join('\n')}\n\n`;
  const adapter = `let __containerCanvasFactory = null;\nconst document = globalThis.document || {\n  createElement(type) {\n    if (type !== "canvas" || !__containerCanvasFactory) throw new Error("container decal service needs ctx.canvasFactory(width, height)");\n    return __containerCanvasFactory(1, 1);\n  },\n};\n\n`;
  const api = `\nexport function createDecalService(ctx = {}, options = {}) {\n  if (ctx.canvasFactory) __containerCanvasFactory = ctx.canvasFactory;\n  else if (ctx.canvas && typeof ctx.canvas.getContext === "function") __containerCanvasFactory = () => ctx.canvas;\n  return l3(ctx, options.anisotropy === undefined ? 4 : options.anisotropy);\n}\n\nexport function buildContainer(ctx, type, options = {}) {\n  if (!ctx || !ctx.mats || typeof ctx.mats.get !== "function" || typeof ctx.mats.label !== "function" || typeof ctx.mats.decal !== "function") {\n    throw new TypeError("buildContainer requires ctx.mats.get(), ctx.mats.label(), and ctx.mats.decal()");\n  }\n  return M3(ctx, type, options);\n}\n\nexport { M3, zA, jn, Zg, qi, l3, Gi };\n`;
  return { text: header + aliases + adapter + raw + api, sourceIndex, names: unique.map((fragment) => fragment.name), aliasAudit };
}

function main() {
  const html = fs.readFileSync(SOURCE);
  const sourceHash = sha256(html);
  if (sourceHash !== EXPECTED_HASH) throw new Error(`原文件 hash 不匹配: ${sourceHash}`);
  const parsed = parseOriginal(html.toString('utf8'));
  const built = buildModule(parsed, sourceHash);
  fs.mkdirSync(path.dirname(MODULE), { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MODULE, built.text);
  const manifest = {
    source: { path: SOURCE, bytes: html.length, sha256: sourceHash },
    generated: { path: path.relative(ROOT, MODULE), bytes: Buffer.byteLength(built.text), sha256: sha256(built.text) },
    extraction: {
      parser: 'node:internal/deps/acorn/acorn/dist/acorn',
      parserVersion: acorn.version,
      sourceUnit: 'sourceByteOffset/sourceByteEnd are UTF-8 byte offsets; sourceCodeUnitOffset/sourceCodeUnitEnd are UTF-16 code-unit offsets; sourceCodePointOffset/sourceCodePointEnd are Unicode code-point offsets; sourceLineColumn is 1-based HTML Unicode code-unit line/column',
      originalScriptTagOffset: parsed.scriptOffset,
      publicApi: ['buildContainer(ctx,type,options={})', 'createDecalService(ctx,options={})', 'M3', 'zA', 'jn', 'Zg', 'qi', 'l3', 'Gi'],
      exactDependencies: ['three@0.180.0', 'ctx.mats.get(name, options?)', 'ctx.mats.label(id, options?)', 'ctx.mats.decal(id)', 'canvasFactory(width,height) or browser document.createElement("canvas")'],
      aliasAudit: built.aliasAudit,
      materialContract: {
        get: {
          ids: ['steel_galv', 'wood_pallet', 'paint_white', 'paint_<color>'],
          options: '{ vertexColors: true } is passed only for paint_<color>; other calls omit options',
        },
        label: {
          ids: ['SLTU 482915 7', 'HBMU 307144 2', 'NRDU 665201 9', 'OKTU 119873 4', 'VSLU 850362 1', 'TQLU 274590 6', '22G1', '42G1', '45G1', '最大总重 <gross> 千克', '皮重 <tare> 千克  净重 <net> 千克', '容积 <cu> 立方米'],
          options: '{ color: "white"|"black", font: "stencil"|"sans", distress: number }',
        },
        decal: {
          ids: ['logo_a', 'logo_b', 'logo_c', 'logo_d', 'csc_plate', 'caution_stripes', 'rust_run', 'grime_streak'],
          options: 'no second argument; returns { material, aspect }',
        },
      },
      fragments: built.sourceIndex,
      includedBindings: built.names,
    },
  };
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`写出 ${path.relative(ROOT, MODULE)} (${Buffer.byteLength(built.text)} B)`);
  console.log(`写出 ${path.relative(ROOT, MANIFEST)} (${Buffer.byteLength(JSON.stringify(manifest))} B)`);
}

main();
