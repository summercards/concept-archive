#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('/Users/zyq/work/wc/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = '/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html';
const MODULE = path.join(ROOT, 'assets/code/props-builder.js');
const CONTAINER_MODULE = path.join(ROOT, 'assets/code/container-builder.js');
const MANIFEST = path.join(ROOT, 'build/props-source.json');
const OUTPUT = path.join(ROOT, 'outputs/props-verification.json');
const CURRENT_URL = 'http://127.0.0.1:8099/index.html';
const EXPECTED_SOURCE_HASH = '9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966';
const EPSILON = 1e-6;
const THREE_NAMES = ['Vector2', 'Vector3', 'BoxGeometry', 'CylinderGeometry', 'CatmullRomCurve3', 'TubeGeometry', 'Quaternion', 'Matrix4', 'Euler', 'BufferGeometry', 'BufferAttribute', 'Mesh', 'Group', 'MeshStandardMaterial', 'MeshBasicMaterial', 'CanvasTexture', 'PlaneGeometry', 'MathUtils'];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseOriginalScript(html) {
  const startTag = html.indexOf('<script>');
  const endTag = html.indexOf('</script>', startTag);
  if (startTag < 0 || endTag < 0) throw new Error('原版 HTML 未找到完整内联脚本');
  const scriptOffset = startTag + '<script>'.length;
  const script = html.slice(scriptOffset, endTag);
  const startupStart = script.lastIndexOf('QC().catch(');
  const startupEnd = script.indexOf(';', startupStart);
  if (startupStart < 0 || startupEnd < 0 || !script.slice(startupEnd + 1).trim().startsWith('})();')) throw new Error('IIFE 尾部不是 QC().catch(...) 启动语句');
  if (!script.trim().endsWith('})();')) throw new Error('原版脚本不是完整 IIFE');
  return { html, script, scriptOffset, endTag, startupStart, startupEnd: startupEnd + 1 };
}

function makeOriginalHtml(parsed) {
  const injection = 'window.__PropsReference={build:Yg,matsFactory:Gg,THREE:lt,registry:Xg,sizes:Gi};';
  const modifiedScript = parsed.script.slice(0, parsed.startupStart) + injection + parsed.script.slice(parsed.startupEnd);
  return parsed.html.slice(0, parsed.scriptOffset) + modifiedScript + parsed.html.slice(parsed.endTag);
}

function moduleAsIife(source, name, exports) {
  let body = source.replace(/^\s*import[^\n]*\n/gm, '');
  body = body.replace(/^export\s+function\s+/gm, 'function ');
  body = body.replace(/^export\s+const\s+/gm, 'const ');
  body = body.replace(/^export\s+let\s+/gm, 'let ');
  body = body.replace(/^export\s+var\s+/gm, 'var ');
  body = body.replace(/^export\s+default\s+/gm, '');
  body = body.replace(/^export\s*\{[^;]*\};?\s*$/gm, '');
  return `window.ASSET_MODULES = window.ASSET_MODULES || Object.create(null);\nwindow.ASSET_MODULES[${JSON.stringify(name)}] = (function () {\n  const THREE = window.THREE;\n${body}\n  return { ${exports.join(', ')} };\n})();`;
}

function optionValue(id, key) {
  const values = {
    doors: 0.6,
    wear: 1,
    stripe: true,
    on: false,
    lean: 1,
    posts: 'left',
    color: id === 'guard_booth' ? 'teal' : id === 'forklift' ? 'orange' : 'red',
    open: id === 'barrel' ? true : 1,
    id: 'VERIFY-R4',
    label: id === 'relay_node' ? '验证中继' : '验证标签',
    state: 'cutting',
    rails: 'right',
    flip: true,
    lying: true,
    broken: true,
    count: id === 'pallet_stack' || id === 'tire_stack' ? 3 : 1,
    code: 'VERIFY-204',
    forksUp: 1,
    number: '12',
    courses: 7,
    sign: 'hazard_voltage',
    text: '验证文本',
  };
  if (!(key in values)) throw new Error(`未定义选项值: ${id}.${key}`);
  return values[key];
}

function makeCases(manifest) {
  const cases = [];
  const props = manifest.extraction.props;
  for (const [id, meta] of Object.entries(props)) {
    cases.push({ id: `${id}__default`, prop: id, group: 'default', options: {} });
    cases.push({ id: `${id}__seed1`, prop: id, group: 'seed1', options: { seed: 1 } });
    for (const key of meta.optionKeys) {
      if (key === 'seed') continue;
      cases.push({ id: `${id}__option_${key}`, prop: id, group: `option:${key}`, options: { [key]: optionValue(id, key) } });
    }
  }
  return cases;
}

function materialSignature(material) {
  if (!material) return null;
  const color = material.color && material.color.isColor ? material.color.getHex() : null;
  const emissive = material.emissive && material.emissive.isColor ? material.emissive.getHex() : null;
  const mapName = (value) => value && value.name ? value.name : null;
  return {
    name: material.name || null,
    type: material.type || null,
    isMeshStandardMaterial: !!material.isMeshStandardMaterial,
    isMeshBasicMaterial: !!material.isMeshBasicMaterial,
    color,
    emissive,
    emissiveIntensity: material.emissiveIntensity === undefined ? null : material.emissiveIntensity,
    toneMapped: material.toneMapped === undefined ? null : !!material.toneMapped,
    vertexColors: !!material.vertexColors,
    roughness: material.roughness === undefined ? null : material.roughness,
    metalness: material.metalness === undefined ? null : material.metalness,
    transparent: !!material.transparent,
    opacity: material.opacity === undefined ? null : material.opacity,
    depthWrite: material.depthWrite === undefined ? null : !!material.depthWrite,
    depthTest: material.depthTest === undefined ? null : !!material.depthTest,
    side: material.side === undefined ? null : material.side,
    polygonOffset: !!material.polygonOffset,
    polygonOffsetFactor: material.polygonOffsetFactor === undefined ? null : material.polygonOffsetFactor,
    polygonOffsetUnits: material.polygonOffsetUnits === undefined ? null : material.polygonOffsetUnits,
    alphaTest: material.alphaTest === undefined ? null : material.alphaTest,
    map: mapName(material.map),
    normalMap: mapName(material.normalMap),
    roughnessMap: mapName(material.roughnessMap),
    metalnessMap: mapName(material.metalnessMap),
    aoMap: mapName(material.aoMap),
  };
}

function arrayData(attribute) {
  if (!attribute) return null;
  return { itemSize: attribute.itemSize, count: attribute.count, normalized: !!attribute.normalized, values: Array.from(attribute.array) };
}

function boxData(box) {
  return box ? { min: [box.min.x, box.min.y, box.min.z], max: [box.max.x, box.max.y, box.max.z] } : null;
}

function safeUserData(value, seen = new Set()) {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'function') return '[function]';
  if (value.isColor) return { colorHex: value.getHex() };
  if (value.isVector2 || value.isVector3 || value.isVector4) return value.toArray();
  if (value.isMaterial) return materialSignature(value);
  if (seen.has(value)) return '[cycle]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => safeUserData(item, seen));
  if (ArrayBuffer.isView(value)) return Array.from(value);
  const out = {};
  for (const key of Object.keys(value).sort()) {
    if (key === 'uuid' || key === 'id' || key === 'version') continue;
    out[key] = safeUserData(value[key], seen);
  }
  return out;
}

function serializeObject(object, THREE) {
  object.updateMatrixWorld(true);
  const nodes = [];
  const meshes = [];
  const lights = [];
  const indexOf = new Map();
  object.traverse((node) => {
    const index = nodes.length;
    indexOf.set(node, index);
    const record = {
      index,
      parent: node.parent ? (indexOf.get(node.parent) ?? null) : null,
      name: node.name || null,
      type: node.type || null,
      isMesh: !!node.isMesh,
      visible: !!node.visible,
      matrix: Array.from(node.matrix.elements),
      matrixWorld: Array.from(node.matrixWorld.elements),
      position: node.position ? node.position.toArray() : null,
      rotation: node.rotation ? [node.rotation.x, node.rotation.y, node.rotation.z, node.rotation.order] : null,
      scale: node.scale ? node.scale.toArray() : null,
      userData: safeUserData(node.userData || {}),
      materials: node.isMesh ? (Array.isArray(node.material) ? node.material.map(materialSignature) : [materialSignature(node.material)]) : [],
    };
    nodes.push(record);
    if (node.isLight) lights.push({ index, name: node.name || null, type: node.type, position: node.position.toArray(), intensity: node.intensity, color: node.color && node.color.getHex ? node.color.getHex() : null });
    if (!node.isMesh) return;
    const geometry = node.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const mesh = {
      index,
      name: node.name || null,
      attributes: {
        position: arrayData(geometry.getAttribute('position')),
        normal: arrayData(geometry.getAttribute('normal')),
        uv: arrayData(geometry.getAttribute('uv')),
        color: arrayData(geometry.getAttribute('color')),
      },
      indexAttribute: arrayData(geometry.index),
      bbox: boxData(geometry.boundingBox),
      materialSlots: Array.isArray(node.material) ? node.material.map(materialSignature) : [materialSignature(node.material)],
      userData: safeUserData(node.userData || {}),
    };
    meshes.push(mesh);
  });
  const worldBox = new THREE.Box3().setFromObject(object);
  return { name: object.name || null, userData: safeUserData(object.userData || {}), bbox: boxData(worldBox), nodes, meshes, lights };
}

function compareArray(left, right) {
  if (!left || !right) return { pass: left === right, maxAbsError: left === right ? 0 : Infinity, lengthEqual: left === right };
  if (left.itemSize !== right.itemSize || left.count !== right.count || left.normalized !== right.normalized || left.values.length !== right.values.length) return { pass: false, maxAbsError: Infinity, lengthEqual: false, left: { itemSize: left.itemSize, count: left.count, length: left.values.length }, right: { itemSize: right.itemSize, count: right.count, length: right.values.length } };
  let maxAbsError = 0;
  for (let i = 0; i < left.values.length; i += 1) {
    if (!Number.isFinite(left.values[i]) || !Number.isFinite(right.values[i])) return { pass: false, maxAbsError: Infinity, lengthEqual: true, nonFiniteIndex: i };
    maxAbsError = Math.max(maxAbsError, Math.abs(left.values[i] - right.values[i]));
  }
  return { pass: maxAbsError <= EPSILON, maxAbsError, lengthEqual: true };
}

function compareNumberArray(left, right) {
  if (!left || !right || left.length !== right.length) return { pass: left === right, maxAbsError: left === right ? 0 : Infinity };
  let maxAbsError = 0;
  for (let i = 0; i < left.length; i += 1) {
    if (!Number.isFinite(left[i]) || !Number.isFinite(right[i])) return { pass: false, maxAbsError: Infinity, nonFiniteIndex: i };
    maxAbsError = Math.max(maxAbsError, Math.abs(left[i] - right[i]));
  }
  return { pass: maxAbsError <= EPSILON, maxAbsError };
}

function compareJSON(left, right) {
  return { pass: JSON.stringify(left) === JSON.stringify(right), left, right };
}

function compareBox(left, right) {
  if (!left || !right) return { pass: left === right, maxAbsError: left === right ? 0 : Infinity };
  const values = [...left.min, ...left.max];
  const other = [...right.min, ...right.max];
  return compareNumberArray(values, other);
}

function compareObject(left, right) {
  const reasons = [];
  let maxError = 0;
  if (!left || !right) return { pass: false, maxError: Infinity, reasons: ['对象缺失'] };
  if (left.name !== right.name) reasons.push('根名称不同');
  const bbox = compareBox(left.bbox, right.bbox); maxError = Math.max(maxError, bbox.maxAbsError || 0); if (!bbox.pass) reasons.push('根 bbox 不同');
  const userData = compareJSON(left.userData, right.userData); if (!userData.pass) reasons.push('根 userData 不同');
  if (left.nodes.length !== right.nodes.length) reasons.push(`层级节点数不同 ${left.nodes.length}/${right.nodes.length}`);
  const nodeReports = [];
  const nodeCount = Math.max(left.nodes.length, right.nodes.length);
  for (let i = 0; i < nodeCount; i += 1) {
    const a = left.nodes[i]; const b = right.nodes[i];
    if (!a || !b) { nodeReports.push({ index: i, pass: false, reasons: ['层级节点缺失'] }); continue; }
    const nodeReasons = [];
    const matrix = compareNumberArray(a.matrix, b.matrix); maxError = Math.max(maxError, matrix.maxAbsError || 0); if (!matrix.pass) nodeReasons.push('local matrix 不同');
    const matrixWorld = compareNumberArray(a.matrixWorld, b.matrixWorld); maxError = Math.max(maxError, matrixWorld.maxAbsError || 0); if (!matrixWorld.pass) nodeReasons.push('world matrix 不同');
    if (a.parent !== b.parent || a.name !== b.name || a.type !== b.type || a.isMesh !== b.isMesh) nodeReasons.push('层级/name/type 不同');
    const materials = compareJSON(a.materials, b.materials); if (!materials.pass) nodeReasons.push('材质 slot 特征不同');
    const data = compareJSON(a.userData, b.userData); if (!data.pass) nodeReasons.push('节点 userData 不同');
    if (nodeReasons.length) reasons.push(`节点 ${i}: ${nodeReasons.join(', ')}`);
    nodeReports.push({ index: i, name: a.name, pass: nodeReasons.length === 0, reasons: nodeReasons, matrix, matrixWorld, materials, userData: data });
  }
  if (left.meshes.length !== right.meshes.length) reasons.push(`mesh 数量不同 ${left.meshes.length}/${right.meshes.length}`);
  const meshReports = [];
  const meshCount = Math.max(left.meshes.length, right.meshes.length);
  for (let i = 0; i < meshCount; i += 1) {
    const a = left.meshes[i]; const b = right.meshes[i];
    if (!a || !b) { meshReports.push({ index: i, pass: false, reasons: ['mesh 缺失'] }); continue; }
    const meshReasons = [];
    const attributes = {};
    for (const name of ['position', 'normal', 'uv', 'color']) { attributes[name] = compareArray(a.attributes[name], b.attributes[name]); maxError = Math.max(maxError, attributes[name].maxAbsError || 0); if (!attributes[name].pass) meshReasons.push(`${name} array`); }
    const index = compareArray(a.indexAttribute, b.indexAttribute); if (!index.pass) meshReasons.push('index array');
    const bboxMesh = compareBox(a.bbox, b.bbox); maxError = Math.max(maxError, bboxMesh.maxAbsError || 0); if (!bboxMesh.pass) meshReasons.push('mesh bbox');
    const slots = compareJSON(a.materialSlots, b.materialSlots); if (!slots.pass) meshReasons.push('material slots');
    const meshData = compareJSON(a.userData, b.userData); if (!meshData.pass) meshReasons.push('mesh userData');
    if (a.name !== b.name) meshReasons.push('mesh name');
    if (meshReasons.length) reasons.push(`mesh ${i} ${a.name || '<unnamed>'}: ${meshReasons.join(', ')}`);
    meshReports.push({ index: i, name: a.name, pass: meshReasons.length === 0, reasons: meshReasons, attributes, index, bbox: bboxMesh, materialSlots: slots, userData: meshData });
  }
  const lights = compareJSON(left.lights, right.lights); if (!lights.pass) reasons.push('灯位置/参数不同');
  return { pass: reasons.length === 0, maxError, reasons, nodeCount: { original: left.nodes.length, current: right.nodes.length }, meshCount: { original: left.meshes.length, current: right.meshes.length }, nodeReports, meshReports, lights };
}

function dynamicSample(object, THREE, state, dt) {
  const data = object.userData || {};
  if (typeof data.setState !== 'function' || typeof data.update !== 'function') return { available: false, state, dt, result: serializeObject(object, THREE) };
  data.setState(state);
  data.update(dt);
  return { available: true, state, dt, noMerge: data.noMerge === true, result: serializeObject(object, THREE) };
}

async function prepareOriginal(page) {
  return page.evaluate(async ({ names }) => {
    const ref = window.__PropsReference;
    if (!ref || typeof ref.build !== 'function' || typeof ref.matsFactory !== 'function' || !ref.THREE) throw new Error('原版尾部注入缺少 Yg/Gg/THREE');
    const THREE = ref.THREE;
    const canvas = document.createElement('canvas');
    canvas.dataset.propsVerify = 'original-mats';
    canvas.width = 16; canvas.height = 16;
    canvas.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:16px;height:16px';
    document.body.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(16, 16, false);
    const mats = await ref.matsFactory({ renderer, params: { tex: 256, wet: 1 }, quality: { tex: 256 } });
    const probe = { label: mats.label('VERIFY LABEL', { color: 'white' }), decal: mats.decal('hazard_voltage'), number: typeof mats.number === 'function' ? mats.number('12') : null, emissive: mats.emissive(16752680, 4) };
    return {
      revision: THREE.REVISION,
      required: Object.fromEntries(names.map((name) => [name, THREE[name] !== undefined])),
      hasYg: typeof ref.build === 'function',
      hasMatsFactory: typeof ref.matsFactory === 'function',
      service: { label: !!probe.label && !!probe.label.material, decal: !!probe.decal && !!probe.decal.material, number: !!probe.number && !!probe.number.material, emissive: !!probe.emissive && probe.emissive.name === 'emissive' && probe.emissive.isMeshBasicMaterial === true, labelName: probe.label?.material?.name || null, decalName: probe.decal?.material?.name || null, numberName: probe.number?.material?.name || null, emissiveName: probe.emissive?.name || null },
    };
  }, { names: THREE_NAMES });
}

async function prepareCurrent(page, moduleSource, containerSource) {
  return page.evaluate(async ({ names, moduleSource, containerSource }) => {
    window.__propsVerifyInjected = { props: false, container: false };
    const install = (source, name, exports) => {
      const body = source.replace(/^\s*import[^\n]*\n/gm, '').replace(/^export\s+function\s+/gm, 'function ').replace(/^export\s+const\s+/gm, 'const ').replace(/^export\s+let\s+/gm, 'let ').replace(/^export\s+var\s+/gm, 'var ').replace(/^export\s+default\s+/gm, '').replace(/^export\s*\{[^;]*\};?\s*$/gm, '');
      const script = `window.ASSET_MODULES = window.ASSET_MODULES || Object.create(null); window.ASSET_MODULES[${JSON.stringify(name)}] = (function(){ const THREE=window.THREE; ${body}\n return {${exports.join(',')}}; })();`;
      return script;
    };
    if (!window.ASSET_MODULES?.['container-builder']) {
      await new Promise((resolve, reject) => { const script = document.createElement('script'); script.textContent = install(containerSource, 'container-builder', ['createDecalService', 'buildContainer']); script.onload = resolve; script.onerror = reject; document.head.appendChild(script); resolve(); });
      window.__propsVerifyInjected.container = true;
    }
    if (!window.ASSET_MODULES?.['props-builder']?.buildProp) {
      await new Promise((resolve, reject) => { const script = document.createElement('script'); script.textContent = install(moduleSource, 'props-builder', ['createPropService', 'buildProp', 'Yg', 'Gi', 'Xg', 'jn', 'Kn', 'io']); script.onload = resolve; script.onerror = reject; document.head.appendChild(script); resolve(); });
      window.__propsVerifyInjected.props = true;
    }
    const THREE = window.THREE;
    const module = window.ASSET_MODULES?.['props-builder'];
    const container = window.ASSET_MODULES?.['container-builder'];
    if (!THREE || !module || typeof module.buildProp !== 'function') throw new Error('当前 props-builder 注入/接线失败');
    if (!container || typeof container.createDecalService !== 'function') throw new Error('当前 l3 decal service 不可用');
    const canvasFactory = (width, height) => { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; return canvas; };
    const decals = container.createDecalService({ canvasFactory }, { anisotropy: 4 });
    const materialCache = new Map();
    const get = (name, options = {}) => {
      const key = `${name}|${options.vertexColors ? 'v' : 'n'}|${options.doubleSide ? 'd' : ''}`;
      if (!materialCache.has(key)) {
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1, vertexColors: !!options.vertexColors, side: options.doubleSide ? THREE.DoubleSide : THREE.FrontSide });
        material.name = name;
        materialCache.set(key, material);
      }
      return materialCache.get(key);
    };
    const emissiveCache = new Map();
    const emissive = (color = 0xffffff, intensity = 4) => {
      const key = `em|${color}|${intensity}`;
      if (emissiveCache.has(key)) return emissiveCache.get(key);
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: true });
      material.name = 'emissive';
      emissiveCache.set(key, material);
      return material;
    };
    window.__propsVerifyCtx = { mats: { get, label: decals.label, decal: decals.decal, number: decals.number, emissive } };
    const probe = { label: decals.label('VERIFY LABEL', { color: 'white' }), decal: decals.decal('hazard_voltage'), number: typeof decals.number === 'function' ? decals.number('12') : null, emissive: emissive(16752680, 4) };
    return {
      revision: THREE.REVISION,
      required: Object.fromEntries(names.map((name) => [name, THREE[name] !== undefined])),
      hasModule: true,
      injected: window.__propsVerifyInjected,
      service: { label: !!probe.label && !!probe.label.material, decal: !!probe.decal && !!probe.decal.material, number: !!probe.number && !!probe.number.material, emissive: !!probe.emissive && probe.emissive.name === 'emissive' && probe.emissive.isMeshBasicMaterial === true, labelName: probe.label?.material?.name || null, decalName: probe.decal?.material?.name || null, numberName: probe.number?.material?.name || null, emissiveName: probe.emissive?.name || null },
    };
  }, { names: THREE_NAMES, moduleSource, containerSource });
}

async function runOne(page, kind, testCase) {
  return page.evaluate(({ kind, testCase }) => {
    const THREE = window.THREE || window.__PropsReference?.THREE;
    const sig = (m) => m ? { name: m.name || null, type: m.type || null, isMeshStandardMaterial: !!m.isMeshStandardMaterial, isMeshBasicMaterial: !!m.isMeshBasicMaterial, color: m.color?.isColor ? m.color.getHex() : null, colorLinear: m.color?.isColor ? m.color.toArray() : null, emissive: m.emissive?.isColor ? m.emissive.getHex() : null, emissiveLinear: m.emissive?.isColor ? m.emissive.toArray() : null, emissiveIntensity: m.emissiveIntensity ?? null, toneMapped: m.toneMapped === undefined ? null : !!m.toneMapped, vertexColors: !!m.vertexColors, roughness: m.roughness ?? null, metalness: m.metalness ?? null, transparent: !!m.transparent, opacity: m.opacity ?? null, depthWrite: m.depthWrite === undefined ? null : !!m.depthWrite, depthTest: m.depthTest === undefined ? null : !!m.depthTest, side: m.side ?? null, polygonOffset: !!m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor ?? null, polygonOffsetUnits: m.polygonOffsetUnits ?? null, alphaTest: m.alphaTest ?? null, map: m.map?.name || null, normalMap: m.normalMap?.name || null, roughnessMap: m.roughnessMap?.name || null, metalnessMap: m.metalnessMap?.name || null, aoMap: m.aoMap?.name || null } : null;
    const arr = (a) => a ? { itemSize: a.itemSize, count: a.count, normalized: !!a.normalized, values: Array.from(a.array) } : null;
    const box = (b) => b ? { min: [b.min.x, b.min.y, b.min.z], max: [b.max.x, b.max.y, b.max.z] } : null;
    const json = (v, seen = new Set()) => { if (v === null || v === undefined || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v; if (typeof v === 'function') return '[function]'; if (v.isColor) return { colorHex: v.getHex() }; if (v.isVector2 || v.isVector3 || v.isVector4) return v.toArray(); if (v.isMaterial) return sig(v); if (seen.has(v)) return '[cycle]'; seen.add(v); if (Array.isArray(v)) return v.map((x) => json(x, seen)); if (ArrayBuffer.isView(v)) return Array.from(v); const o = {}; for (const k of Object.keys(v).sort()) if (!['uuid', 'id', 'version'].includes(k)) o[k] = json(v[k], seen); return o; };
    const serializeObject = (object) => { object.updateMatrixWorld(true); const nodes = [], meshes = [], lights = [], nodeIndex = new Map(); object.traverse((node) => { const index = nodes.length; nodeIndex.set(node, index); nodes.push({ index, parent: node.parent ? (nodeIndex.get(node.parent) ?? null) : null, name: node.name || null, type: node.type || null, isMesh: !!node.isMesh, visible: !!node.visible, matrix: Array.from(node.matrix.elements), matrixWorld: Array.from(node.matrixWorld.elements), position: node.position?.toArray() || null, rotation: node.rotation ? [node.rotation.x, node.rotation.y, node.rotation.z, node.rotation.order] : null, scale: node.scale?.toArray() || null, userData: json(node.userData || {}), materials: node.isMesh ? (Array.isArray(node.material) ? node.material.map(sig) : [sig(node.material)]) : [] }); if (node.isLight) lights.push({ index, name: node.name || null, type: node.type, position: node.position.toArray(), intensity: node.intensity, color: node.color?.getHex ? node.color.getHex() : null }); if (node.isMesh) { const g = node.geometry; if (!g.boundingBox) g.computeBoundingBox(); meshes.push({ index, name: node.name || null, attributes: { position: arr(g.getAttribute('position')), normal: arr(g.getAttribute('normal')), uv: arr(g.getAttribute('uv')), color: arr(g.getAttribute('color')) }, indexAttribute: arr(g.index), bbox: box(g.boundingBox), materialSlots: Array.isArray(node.material) ? node.material.map(sig) : [sig(node.material)], userData: json(node.userData || {}) }); } }); return { name: object.name || null, userData: json(object.userData || {}), bbox: box(new THREE.Box3().setFromObject(object)), nodes, meshes, lights }; };
    const dynamicSample = (object, state, dt) => { const data = object.userData || {}; let noMerge = false; object.traverse((node) => { if (node.userData && node.userData.noMerge === true) noMerge = true; }); if (typeof data.setState !== 'function' || typeof data.update !== 'function') return { available: false, state, dt, noMerge, result: serializeObject(object) }; data.setState(state); data.update(dt); noMerge = false; object.traverse((node) => { if (node.userData && node.userData.noMerge === true) noMerge = true; }); return { available: true, state, dt, noMerge, result: serializeObject(object) }; };
    const errors = [];
    const oldError = console.error;
    const oldWarn = console.warn;
    console.error = (...args) => { errors.push({ level: 'error', text: args.map(String).join(' ') }); oldError(...args); };
    console.warn = (...args) => { errors.push({ level: 'warn', text: args.map(String).join(' ') }); oldWarn(...args); };
    try {
      const optionReads = new Set();
      const options = new Proxy(testCase.options, { get(target, key, receiver) { if (typeof key === 'string') optionReads.add(key); return Reflect.get(target, key, receiver); } });
      let object;
      if (kind === 'original') {
        const ref = window.__PropsReference;
        const mats = ref.__mats;
        object = ref.build({ mats }).build(testCase.prop, options);
      } else {
        const module = window.ASSET_MODULES['props-builder'];
        object = module.buildProp(window.__propsVerifyCtx, testCase.prop, options);
      }
      const fallbackMessages = errors.filter((item) => /builder .* threw|unknown prop|fallback/i.test(item.text));
      const fallback = fallbackMessages.length > 0 || !object || object.userData?.prop !== testCase.prop || object.userData?.__propsFallback === true;
      const result = { object: object ? serializeObject(object, THREE) : null, optionReads: [...optionReads].sort(), fallback, fallbackMessages, errors: errors.slice(), dynamic: null };
      if (testCase.prop === 'relay_node' && object && object.userData) {
        result.dynamic = ['live', 'cutting', 'cut'].flatMap((state) => [0, 0.016, 0.1].map((dt) => dynamicSample(object, state, dt)));
      }
      const checkFinite = (value, at) => { if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`非有限数值: ${at}`); if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) checkFinite(child, `${at}.${key}`); };
      checkFinite(result.object, 'object');
      if (result.dynamic) checkFinite(result.dynamic, 'dynamic');
      return result;
    } catch (error) {
      return { object: null, fallback: /fallback|builder/i.test(String(error)), fallbackMessages: errors.slice(), errors: errors.slice(), exception: error?.stack || String(error), dynamic: null };
    } finally {
      console.error = oldError;
      console.warn = oldWarn;
    }
  }, { kind, testCase });
}

async function attachOriginalMats(page) {
  return page.evaluate(async () => {
    const ref = window.__PropsReference;
    if (ref.__mats) return true;
    const canvas = document.querySelector('canvas[data-props-verify="original-mats"]');
    if (!canvas) throw new Error('原版真实 canvas 缺失');
    const renderer = new ref.THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(16, 16, false);
    const real = await ref.matsFactory({ renderer, params: { tex: 256, wet: 1 }, quality: { tex: 256 } });
    const materialCache = new Map();
    const get = (name, options = {}) => {
      const key = `${name}|${options.vertexColors ? 'v' : 'n'}|${options.doubleSide ? 'd' : ''}`;
      if (!materialCache.has(key)) {
        const material = new ref.THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1, vertexColors: !!options.vertexColors, side: options.doubleSide ? ref.THREE.DoubleSide : ref.THREE.FrontSide });
        material.name = name;
        materialCache.set(key, material);
      }
      return materialCache.get(key);
    };
    const emissiveCache = new Map();
    const emissive = (color = 0xffffff, intensity = 4) => {
      const key = `em|${color}|${intensity}`;
      if (emissiveCache.has(key)) return emissiveCache.get(key);
      const material = new ref.THREE.MeshBasicMaterial({ color: new ref.THREE.Color(color).multiplyScalar(intensity), toneMapped: true });
      material.name = 'emissive';
      emissiveCache.set(key, material);
      return material;
    };
    ref.__mats = { get, label: real.label, decal: real.decal, number: real.number, emissive };
    return true;
  });
}

async function renderEvidence(page, kind, outputPath) {
  const meta = await page.evaluate(async ({ kind }) => {
    const THREE = kind === 'original' ? window.__PropsReference.THREE : window.THREE;
    const canvas = document.createElement('canvas');
    canvas.dataset.propsVerify = kind;
    canvas.width = 960; canvas.height = 640;
    canvas.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:960px;height:640px';
    document.body.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(960, 640, false); renderer.setClearColor(0x101417, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 960 / 640, .1, 100);
    camera.position.set(4.3, 3.1, 5.1);
    const ctx = kind === 'original' ? { mats: window.__PropsReference.__mats } : window.__propsVerifyCtx;
    const object = kind === 'original' ? window.__PropsReference.build(ctx).build('relay_node', { seed: 1, id: 'VERIFY-R4', state: 'live' }) : window.ASSET_MODULES['props-builder'].buildProp(ctx, 'relay_node', { seed: 1, id: 'VERIFY-R4', state: 'live' });
    scene.add(object);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x6b7078, roughness: .76, metalness: .08 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMaterial); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x20242a, 2.2));
    const light = new THREE.DirectionalLight(0xffffff, 2.5); light.position.set(4, 7, 5); scene.add(light);
    camera.lookAt(0, 1.15, 0); scene.updateMatrixWorld(true); camera.updateProjectionMatrix(); renderer.render(scene, camera);
    return { kind, viewport: [960, 640], canvas: true, rendererRevision: THREE.REVISION, camera: { position: [4.3, 3.1, 5.1], lookAt: [0, 1.15, 0], fov: 35 }, lights: [{ type: 'HemisphereLight', intensity: 2.2 }, { type: 'DirectionalLight', intensity: 2.5, position: [4, 7, 5] }] };
  }, { kind });
  const bytes = await page.locator(`canvas[data-props-verify="${kind}"]`).screenshot({ path: outputPath });
  return { ...meta, path: path.relative(ROOT, outputPath), bytes: bytes.length, sha256: sha256(bytes) };
}

function staticChecks(sourceBytes, moduleBytes, manifest) {
  const sourceHash = sha256(sourceBytes);
  const moduleHash = sha256(moduleBytes);
  const original = sourceBytes.toString('utf8');
  const current = moduleBytes.toString('utf8');
  const bundle = fs.readFileSync(path.join(ROOT, 'assets/modules.js'), 'utf8');
  const packedBody = current.replace(/^import\s+[\s\S]*?;\s*$/gm, '').replace(/^export\s*\{([^}]+)\}\s*;?/gm, '').replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ').trim();
  const constructors = Object.fromEntries(Object.entries(manifest.extraction.props).map(([id, meta]) => [id, {
    optionKeys: meta.optionKeys,
    builderChain: meta.builderChain,
    registrationInOriginal: original.includes(meta.registration),
    fragments: [...new Set(meta.builderChain.map((item) => item.name))].map((name) => {
      const fragment = manifest.extraction.fragments[name];
      if (!fragment) throw new Error(`构造链缺少源码片段: ${id}.${name}`);
      const text = original.slice(fragment.sourceCodeUnitOffset, fragment.sourceCodeUnitEnd);
      return { name, originalHashMatches: sha256(text) === fragment.fragmentSha256, preservedInModule: current.includes(text) };
    }),
  }]));
  return {
    source: { path: SOURCE, bytes: sourceBytes.length, sha256: sourceHash, expectedSha256: EXPECTED_SOURCE_HASH, pass: sourceHash === EXPECTED_SOURCE_HASH && sourceHash === manifest.source.sha256 },
    generated: { path: path.relative(ROOT, MODULE), bytes: moduleBytes.length, sha256: moduleHash, manifestSha256: manifest.generated.sha256, pass: moduleHash === manifest.generated.sha256 },
    packedModule: { path: 'assets/modules.js', sha256: sha256(bundle), pass: bundle.includes(packedBody), note: '确认本轮 generated 模块仅去 import/export 后的完整正文存在于已打包文件中。' },
    constructors,
    constructorChainsPass: Object.values(constructors).every((item) => item.registrationInOriginal && item.fragments.every((fragment) => fragment.originalHashMatches && fragment.preservedInModule)),
    manifest: { sha256: sha256(fs.readFileSync(MANIFEST)), propCount: manifest.extraction.propCount }, 
    note: '静态 hash 只作为输入完整性记录；runtime 成功必须同时满足原版与当前实际 build、逐数组 compare、动态 hook 与 fallback 约束。',
  };
}

function summarizeCase(testCase, original, current) {
  const reasons = [];
  if (original.exception) reasons.push(`原版异常: ${original.exception}`);
  if (current.exception) reasons.push(`当前异常: ${current.exception}`);
  if (original.fallback) reasons.push('原版捕获到 fallback/构造失败');
  if (current.fallback) reasons.push('当前捕获到 fallback/构造失败');
  const testedKey = testCase.group.startsWith('option:') ? testCase.group.slice('option:'.length) : null;
  const optionConsumption = { key: testedKey, originalReads: original.optionReads || [], currentReads: current.optionReads || [], pass: !testedKey || ((original.optionReads || []).includes(testedKey) && (current.optionReads || []).includes(testedKey)) };
  if (!optionConsumption.pass) reasons.push(`关键选项未在两侧实际读取: ${testedKey}`);
  const structural = original.object && current.object ? compareObject(original.object, current.object) : { pass: false, maxError: Infinity, reasons: ['缺少可比较对象'] };
  reasons.push(...structural.reasons);
  const dynamic = [];
  if (testCase.prop === 'relay_node') {
    const a = original.dynamic || [];
    const b = current.dynamic || [];
    if (a.length !== 9 || b.length !== 9) reasons.push('relay_node 动态三状态/三时间点采样不完整');
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      const da = a[i]; const db = b[i];
      const report = da?.result && db?.result ? compareObject(da.result, db.result) : { pass: false, maxError: Infinity, reasons: ['动态样本缺失'] };
      if (!da?.available || !db?.available || da?.noMerge !== true || db?.noMerge !== true) { report.pass = false; report.reasons = [...(report.reasons || []), 'dynamic hook/noMerge 未保持']; }
      if (!report.pass) reasons.push(`relay dynamic sample ${i}: ${(report.reasons || []).join(', ')}`);
      dynamic.push({ state: da?.state || db?.state || null, dt: da?.dt ?? db?.dt ?? null, pass: report.pass, noMerge: { original: da?.noMerge === true, current: db?.noMerge === true }, maxError: report.maxError, reasons: report.reasons || [], nodeCount: report.nodeCount, meshCount: report.meshCount });
    }
  }
  const errors = { original: original.errors || [], current: current.errors || [] };
  const pass = !original.exception && !current.exception && !original.fallback && !current.fallback && optionConsumption.pass && structural.pass && (testCase.prop !== 'relay_node' || dynamic.length === 9) && dynamic.every((item) => item.pass) && !errors.original.some((e) => /builder .* threw|unknown prop|fallback/i.test(e.text)) && !errors.current.some((e) => /builder .* threw|unknown prop|fallback/i.test(e.text));
  return { id: testCase.id, prop: testCase.prop, group: testCase.group, options: testCase.options, optionConsumption, pass, maxError: Math.max(structural.maxError || 0, ...dynamic.map((item) => item.maxError || 0)), compare: structural, dynamic: dynamic.length ? dynamic : undefined, runtimeErrors: errors, diagnosis: reasons.slice(0, 80) };
}

async function main() {
  const startedAt = new Date().toISOString();
  const sourceBytes = fs.readFileSync(SOURCE);
  const moduleBytes = fs.readFileSync(MODULE);
  const containerBytes = fs.readFileSync(CONTAINER_MODULE);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const staticReport = staticChecks(sourceBytes, moduleBytes, manifest);
  const testCases = makeCases(manifest);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });
  const originalPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const currentPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors = { original: [], current: [] };
  originalPage.on('pageerror', (error) => errors.original.push(error.message));
  currentPage.on('pageerror', (error) => errors.current.push(error.message));
  originalPage.on('console', (message) => { if (message.type() === 'error') errors.original.push(message.text()); });
  currentPage.on('console', (message) => { if (message.type() === 'error') errors.current.push(message.text()); });
  let report;
  try {
    const parsed = parseOriginalScript(sourceBytes.toString('utf8'));
    await originalPage.setContent(makeOriginalHtml(parsed), { waitUntil: 'load' });
    await originalPage.evaluate(() => document.fonts.ready);
    const originalReady = await prepareOriginal(originalPage);
    if (originalReady.revision !== '180') throw new Error(`原版 THREE revision 不是 r180: ${originalReady.revision}`);
    if (!Object.values(originalReady.required).every(Boolean)) throw new Error(`原版 THREE 导出不完整: ${JSON.stringify(originalReady.required)}`);
    await attachOriginalMats(originalPage);

    await currentPage.route('**/previews.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await currentPage.route('**/app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await currentPage.goto(CURRENT_URL, { waitUntil: 'load' });
    await currentPage.evaluate(() => document.fonts.ready);
    const currentReady = await prepareCurrent(currentPage, moduleBytes.toString('utf8'), containerBytes.toString('utf8'));
    if (currentReady.revision !== '160') throw new Error(`当前 THREE revision 不是 r160: ${currentReady.revision}`);
    if (!Object.values(currentReady.required).every(Boolean)) throw new Error(`当前 THREE 导出不完整: ${JSON.stringify(currentReady.required)}`);

    const cases = [];
    for (const testCase of testCases) {
      const [original, current] = await Promise.all([runOne(originalPage, 'original', testCase), runOne(currentPage, 'current', testCase)]);
      cases.push(summarizeCase(testCase, original, current));
    }

    const visualEvidence = { omitted: true, note: '本次按限定仅更新验证脚本和 JSON；未重新生成或覆盖历史 PNG，也不将历史截图视为本轮运行证据。' };

    const passed = cases.filter((item) => item.pass).length;
    const failed = cases.length - passed;
    const relayCases = cases.filter((item) => item.prop === 'relay_node');
    report = {
      startedAt,
      completedAt: new Date().toISOString(),
      status: failed === 0 && staticReport.source.pass && staticReport.generated.pass && staticReport.constructorChainsPass && staticReport.packedModule.pass ? 'PASS' : 'FAIL',
      runtimeSuccess: failed === 0,
      scope: {
        sourceHash: EXPECTED_SOURCE_HASH,
        original: '完整原版 IIFE；仅在固定原 hash 与精确尾部检查确认的最后 QC().catch(...) 启动语句位置移除尾部 statement，并在同一 IIFE 尾部注入 __PropsReference={build:Yg,matsFactory:Gg,THREE:lt,registry:Xg,sizes:Gi}。原文件未修改。',
        current: CURRENT_URL,
        isolation: '只在验证浏览器内将 previews.js/app.js 响应替换为空；仍执行当前已打包 assets/modules.js，避免页面预览抢先构造并污染原版 wf 全局缓存。不改磁盘或实现。',
        currentInjection: '若页面未加载 props-builder/container-builder，则仅用 page.addScriptTag 在浏览器内去掉 import/export 后注入 IIFE；未写回 assets/modules.js、app.js 或其他文件。',
        buildEntrypoints: '原版严格调用 Yg({mats}).build(id, options)；当前严格调用 window.ASSET_MODULES["props-builder"].buildProp(ctx, id, options)。',
        cases: '36 个道具各跑 default 与 seed=1，并按 props-source.json optionKeys 为实际消费的每个关键选项生成独立 case；未凭空添加选项。',
        comparison: '逐 mesh/逐层级顺序比较 position/normal/uv/color/index 原始 array、local/world matrix、bbox、完整 material slot 特征、碰撞/userData、灯位置；不是统计量或静态 hash 代替。',
        materials: '原版 label/decal/number 保留真实 Gg 返回的 l3 服务，未替换为占位贴花；两侧 get 均为按同名缓存的确定 MeshStandardMaterial（白色、roughness=.7、metalness=.1），不是完整 Gg 纹理烘焙视觉验证。emissive 严格按原 Gg 的 MeshBasicMaterial({color:new Color(color).multiplyScalar(intensity),toneMapped:true}), name="emissive" 实现。',
        dynamic: 'relay_node 对 live/cutting/cut 各采样 dt=0/0.016/0.1；检查 setState、update、level/beacon/interact、dynamic noMerge 与逐样本结构。',
        fallback: '原版 console.warn/error、对象标记和模块 checked build 均捕获；任一 fallback、异常或构造失败都会使 case 失败，不静默降级。',
      },
      static: staticReport,
      readiness: { original: originalReady, current: currentReady, engineDifference: { original: 'r180', current: 'r160', note: '仅记录引擎差异；不宣称材质、后期或像素一致。' } },
      cases,
      visualEvidence,
      summary: { total: cases.length, passed, failed, maxError: Math.max(...cases.map((item) => item.maxError).filter(Number.isFinite), 0), relayDynamicCases: relayCases.length, allRawGeometryCompared: cases.every((item) => item.compare && item.compare.meshReports), optionCaseCount: cases.filter((item) => item.group.startsWith('option:')).length },
      unexecuted: [],
      outsideScope: ['未重新生成 PNG；历史 PNG 不代表本轮验证。', '未验证完整 Gg 纹理烘焙、后期或跨 r180/r160 像素相等。', '当前使用隔离宿主调用已打包 buildProp；未把主页面预览接线及其材质配置等同于该宿主。'],
      environmentDiagnosis: { issue: '未隔离页面的首轮有 barrel/pallet/jerry_can 默认 case 材质不同；阻止预览抢先 build 后全部一致。', cause: '原版 wf 全局缓存只按道具选项/seed 建 key，不按 ctx.mats 区分，缓存 clone 会保留首次构造的宿主材质。', implementationChanged: false },
      errors,
      diagnosis: failed ? cases.filter((item) => !item.pass).slice(0, 20).map((item) => ({ id: item.id, prop: item.prop, group: item.group, diagnosis: item.diagnosis, maxError: item.maxError })) : [],
      mainThreadSuggestions: failed ? ['先按 case diagnosis 区分原始 geometry、层级 matrix、material slot、userData/collider 与 dynamic hook 差异。', '若仅 material slot 失败，不要用静态 hash 或像素截图覆盖；保证主线程提供同名 MeshStandardMaterial get、真实 l3 label/decal/number 与严格 emissive。', 'relay_node 若失败，保持 setState/live-cutting-cut、update(dt) 和 relay_dynamic/noMerge 层级，不要 merge 动态 mesh。'] : ['原版 wf 缓存不含 ctx.mats；主线程同一模块实例应保持材质宿主稳定，避免预览先构造后切换 mats。此为原算法已有行为，本轮未改实现。'],
    };
  } catch (error) {
    report = {
      startedAt,
      completedAt: new Date().toISOString(),
      status: 'ERROR',
      runtimeSuccess: false,
      static: staticReport,
      cases: [],
      unexecuted: testCases.map((testCase) => testCase.id),
      error: error?.stack || String(error),
      errors,
      diagnosis: ['验证前置或浏览器运行时失败，未将静态 hash 视为 runtime 成功。'],
    };
  } finally {
    await browser.close();
  }
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, output: OUTPUT, summary: report.summary || null, error: report.error || null }, null, 2));
  if (report.status !== 'PASS') process.exitCode = 1;
}

main().catch((error) => { console.error(error?.stack || error); process.exitCode = 1; });
