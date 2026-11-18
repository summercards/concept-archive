#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const acorn = require('internal/deps/acorn/acorn/dist/acorn');
const { chromium } = require('/Users/zyq/work/wc/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = '/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html';
const MODULE = path.join(ROOT, 'assets/code/container-builder.js');
const MANIFEST = path.join(ROOT, 'build/container-source.json');
const OUTPUT = path.join(ROOT, 'outputs/container-verification.json');
const CURRENT_URL = 'http://127.0.0.1:8099/index.html';
const EXPECTED_SOURCE_HASH = '9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966';
const THREE_REQUIRED = ['Vector3', 'BoxGeometry', 'CylinderGeometry', 'CatmullRomCurve3', 'TubeGeometry', 'Quaternion', 'Matrix4', 'Euler', 'BufferGeometry', 'Float32BufferAttribute', 'Mesh', 'Group', 'MeshStandardMaterial', 'MeshBasicMaterial', 'CanvasTexture', 'PlaneGeometry', 'MathUtils'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'white', 'grey', 'teal'];
const TYPES = ['container20', 'container40', 'container40hc'];
const SEEDS = [0, 1, 5];
const DOORS = [0, 0.6, 1];
const WEARS = [0, 0.5, 1];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function pass(ok, detail) {
  return { pass: !!ok, detail };
}

function bindingNames(pattern) {
  if (pattern.type === 'Identifier') return [pattern.name];
  if (pattern.type === 'ObjectPattern') return pattern.properties.flatMap((p) => bindingNames(p.value || p.argument));
  if (pattern.type === 'ArrayPattern') return pattern.elements.flatMap((p) => p ? bindingNames(p) : []);
  return [];
}

function parseOriginalScript(html) {
  const startTag = html.indexOf('<script>');
  const endTag = html.indexOf('</script>', startTag);
  if (startTag < 0 || endTag < 0) throw new Error('原版 HTML 未找到完整内联脚本');
  const scriptOffset = startTag + '<script>'.length;
  const script = html.slice(scriptOffset, endTag);
  const ast = acorn.parse(script, { ecmaVersion: 'latest', sourceType: 'script' });
  if (ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement') throw new Error('原版脚本顶层不是单个 IIFE');
  const call = ast.body[0].expression;
  if (call.type !== 'CallExpression' || call.callee.type !== 'ArrowFunctionExpression' || call.callee.body.type !== 'BlockStatement') {
    throw new Error('原版脚本不是预期的完整箭头函数 IIFE');
  }
  const body = call.callee.body.body;
  const last = body[body.length - 1];
  if (!last || last.type !== 'ExpressionStatement' || last.expression.type !== 'CallExpression') throw new Error('IIFE 尾部未找到启动语句');
  const sourceObject = last.expression.callee && last.expression.callee.type === 'MemberExpression'
    ? last.expression.callee.object : null;
  if (!sourceObject || sourceObject.type !== 'CallExpression' || sourceObject.callee.type !== 'Identifier' || sourceObject.callee.name !== 'QC') {
    throw new Error('IIFE 尾部不是 QC().catch(...) 启动语句');
  }
  return { script, scriptOffset, startTag, endTag, last, html };
}

function makeOriginalHtml(parsed) {
  const injection = 'window.__ContainerReference={build:M3,decals:l3,THREE:lt};';
  const modifiedScript = parsed.script.slice(0, parsed.last.start) + injection + parsed.script.slice(parsed.last.end);
  return parsed.html.slice(0, parsed.scriptOffset) + modifiedScript + parsed.html.slice(parsed.endTag);
}

function cases() {
  return TYPES.flatMap((type, typeIndex) => COLORS.map((color, colorIndex) => ({
    id: `${type}-c${colorIndex + 1}`,
    type,
    seed: SEEDS[(colorIndex + typeIndex) % SEEDS.length],
    doors: DOORS[(colorIndex * 2 + typeIndex) % DOORS.length],
    wear: WEARS[(colorIndex + typeIndex * 2) % WEARS.length],
    color,
  })));
}

function materialSignature(material) {
  if (!material) return null;
  const color = material.color && typeof material.color.getHex === 'function' ? material.color.getHex() : null;
  const map = material.map && material.map.name ? material.map.name : null;
  return {
    name: material.name || null,
    type: material.type || null,
    color,
    vertexColors: !!material.vertexColors,
    roughness: material.roughness === undefined ? null : material.roughness,
    metalness: material.metalness === undefined ? null : material.metalness,
    transparent: !!material.transparent,
    opacity: material.opacity === undefined ? null : material.opacity,
    depthWrite: material.depthWrite === undefined ? null : !!material.depthWrite,
    side: material.side === undefined ? null : material.side,
    polygonOffset: !!material.polygonOffset,
    polygonOffsetFactor: material.polygonOffsetFactor === undefined ? null : material.polygonOffsetFactor,
    polygonOffsetUnits: material.polygonOffsetUnits === undefined ? null : material.polygonOffsetUnits,
    map,
  };
}

function arrayData(attribute) {
  if (!attribute) return null;
  return {
    itemSize: attribute.itemSize,
    count: attribute.count,
    normalized: !!attribute.normalized,
    values: Array.from(attribute.array),
  };
}

function boxData(box) {
  return box ? { min: [box.min.x, box.min.y, box.min.z], max: [box.max.x, box.max.y, box.max.z] } : null;
}

function serializeObject(object, THREE) {
  const meshes = [];
  object.updateMatrixWorld(true);
  object.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    meshes.push({
      name: mesh.name || null,
      attributes: {
        position: arrayData(geometry.getAttribute('position')),
        normal: arrayData(geometry.getAttribute('normal')),
        uv: arrayData(geometry.getAttribute('uv')),
        color: arrayData(geometry.getAttribute('color')),
      },
      index: arrayData(geometry.index),
      bbox: boxData(geometry.boundingBox),
      material: materialSignature(Array.isArray(mesh.material) ? mesh.material[0] : mesh.material),
    });
  });
  const worldBox = new THREE.Box3().setFromObject(object);
  return {
    name: object.name || null,
    userData: {
      size: object.userData && object.userData.size ? Array.from(object.userData.size) : null,
      color: object.userData ? object.userData.color : null,
      doors: object.userData ? object.userData.doors : null,
      colliders: object.userData && object.userData.colliders ? object.userData.colliders : null,
    },
    bbox: boxData(worldBox),
    meshes,
  };
}

async function collectPage(page, kind, testCases) {
  await page.evaluate(() => document.fonts && document.fonts.ready ? document.fonts.ready : undefined);
  return page.evaluate(({ kind, testCases }) => {
    const THREE = kind === 'original' ? window.__ContainerReference.THREE : window.THREE;
    const module = kind === 'original' ? null : window.ASSET_MODULES && window.ASSET_MODULES['container-builder'];
    const reference = kind === 'original' ? window.__ContainerReference : null;
    const build = kind === 'original' ? reference.build : module && module.buildContainer;
    if (!THREE || !build) throw new Error(`${kind} 构建入口不可用`);
    const materialCache = new Map();
    const get = (name, options = {}) => {
      const key = `${name}|${options.vertexColors ? 'v' : 'n'}`;
      if (!materialCache.has(key)) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.7,
          metalness: 0.1,
          vertexColors: !!options.vertexColors,
        });
        material.name = name;
        materialCache.set(key, material);
      }
      return materialCache.get(key);
    };
    const decals = kind === 'original' ? reference.decals({}, 4) : module.createDecalService({}, { anisotropy: 4 });
    const mats = { get, label: decals.label, decal: decals.decal };
    const arrayDataInPage = (attribute) => attribute ? {
      itemSize: attribute.itemSize,
      count: attribute.count,
      normalized: !!attribute.normalized,
      values: Array.from(attribute.array),
    } : null;
    const boxDataInPage = (box) => box ? { min: [box.min.x, box.min.y, box.min.z], max: [box.max.x, box.max.y, box.max.z] } : null;
    const materialSignatureInPage = (material) => material ? {
      name: material.name || null,
      type: material.type || null,
      color: material.color && typeof material.color.getHex === 'function' ? material.color.getHex() : null,
      vertexColors: !!material.vertexColors,
      roughness: material.roughness === undefined ? null : material.roughness,
      metalness: material.metalness === undefined ? null : material.metalness,
      transparent: !!material.transparent,
      opacity: material.opacity === undefined ? null : material.opacity,
      depthWrite: material.depthWrite === undefined ? null : !!material.depthWrite,
      side: material.side === undefined ? null : material.side,
      polygonOffset: !!material.polygonOffset,
      polygonOffsetFactor: material.polygonOffsetFactor === undefined ? null : material.polygonOffsetFactor,
      polygonOffsetUnits: material.polygonOffsetUnits === undefined ? null : material.polygonOffsetUnits,
      map: material.map && material.map.name ? material.map.name : null,
    } : null;
    const serializeObjectInPage = (object) => {
      const meshes = [];
      object.updateMatrixWorld(true);
      object.traverse((mesh) => {
        if (!mesh.isMesh) return;
        const geometry = mesh.geometry;
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        meshes.push({
          name: mesh.name || null,
          attributes: {
            position: arrayDataInPage(geometry.getAttribute('position')),
            normal: arrayDataInPage(geometry.getAttribute('normal')),
            uv: arrayDataInPage(geometry.getAttribute('uv')),
            color: arrayDataInPage(geometry.getAttribute('color')),
          },
          index: arrayDataInPage(geometry.index),
          bbox: boxDataInPage(geometry.boundingBox),
          material: materialSignatureInPage(Array.isArray(mesh.material) ? mesh.material[0] : mesh.material),
        });
      });
      const worldBox = new THREE.Box3().setFromObject(object);
      return {
        name: object.name || null,
        userData: {
          size: object.userData && object.userData.size ? Array.from(object.userData.size) : null,
          color: object.userData ? object.userData.color : null,
          doors: object.userData ? object.userData.doors : null,
          colliders: object.userData && object.userData.colliders ? object.userData.colliders : null,
        },
        bbox: boxDataInPage(worldBox),
        meshes,
      };
    };
    const results = [];
    for (const testCase of testCases) {
      const object = build({ mats }, testCase.type, testCase);
      results.push({ case: testCase, result: serializeObjectInPage(object) });
    }
    return {
      engine: { revision: THREE.REVISION || null, required: Object.fromEntries(['REVISION', 'Vector3', 'BoxGeometry', 'CylinderGeometry', 'CatmullRomCurve3', 'TubeGeometry', 'Quaternion', 'Matrix4', 'Euler', 'BufferGeometry', 'Float32BufferAttribute', 'Mesh', 'Group', 'MeshStandardMaterial', 'MeshBasicMaterial', 'CanvasTexture', 'PlaneGeometry', 'MathUtils'].map((name) => [name, name === 'REVISION' ? THREE.REVISION : THREE[name] !== undefined])) },
      service: {
        label: typeof decals.label === 'function',
        decal: typeof decals.decal === 'function',
        labelMaterialName: decals.label('VERIFY LABEL', { color: 'white' }).material.name,
        decalMaterialName: decals.decal('logo_a').material.name,
      },
      results,
    };
  }, { kind, testCases });
}

async function renderGrayEvidence(page, kind, view, outputPath) {
  const meta = await page.evaluate(({ kind, view }) => {
    const THREE = kind === 'original' ? window.__ContainerReference.THREE : window.THREE;
    const module = kind === 'original' ? null : window.ASSET_MODULES['container-builder'];
    const reference = kind === 'original' ? window.__ContainerReference : null;
    const build = kind === 'original' ? reference.build : module.buildContainer;
    const oldCanvas = document.querySelector('canvas[data-container-verify="gray"]');
    if (oldCanvas && oldCanvas.parentNode) oldCanvas.parentNode.removeChild(oldCanvas);
    const canvas = document.createElement('canvas');
    canvas.dataset.containerVerify = 'gray';
    canvas.width = view.width;
    canvas.height = view.height;
    canvas.style.cssText = `display:block;width:${view.width}px;height:${view.height}px;position:fixed;left:0;top:0;z-index:2147483647`;
    document.body.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(view.width, view.height, false);
    renderer.setClearColor(view.clearColor, 1);
    if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (THREE.NoToneMapping !== undefined) renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = false;

    const materialCache = new Map();
    const get = (name, options = {}) => {
      const key = `${name}|${options.vertexColors ? 'v' : 'n'}`;
      if (!materialCache.has(key)) {
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1, vertexColors: !!options.vertexColors });
        material.name = name;
        materialCache.set(key, material);
      }
      return materialCache.get(key);
    };
    const decals = kind === 'original' ? reference.decals({}, 4) : module.createDecalService({}, { anisotropy: 4 });
    const object = build({ mats: { get, label: decals.label, decal: decals.decal } }, 'container40hc', { seed: 0, wear: 0.5, doors: view.doors, color: 'green' });
    const gray = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.72, metalness: 0.12 });
    gray.name = 'verification-gray';
    let opaqueMeshes = 0;
    let hiddenTransparentMeshes = 0;
    object.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const transparent = materials.some((material) => material && (material.transparent || material.name === 'label' || material.name === 'decal' || String(material.name || '').startsWith('decal_')));
      if (transparent) {
        mesh.visible = false;
        hiddenTransparentMeshes += 1;
      } else {
        mesh.material = gray;
        opaqueMeshes += 1;
      }
    });

    const scene = new THREE.Scene();
    const floorMaterial = gray.clone();
    floorMaterial.name = 'verification-gray-floor';
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);
    scene.add(object);
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const directional = new THREE.DirectionalLight(0xffffff, 2.4);
    directional.position.set(9, 15, 11);
    scene.add(directional);

    const camera = new THREE.PerspectiveCamera(view.fov, view.width / view.height, 0.1, 100);
    camera.position.fromArray(view.camera);
    camera.lookAt(new THREE.Vector3().fromArray(view.lookAt));
    scene.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    return {
      kind,
      engineRevision: THREE.REVISION || null,
      viewport: [view.width, view.height],
      clearColor: view.clearColor,
      camera: { position: view.camera, lookAt: view.lookAt, fov: view.fov },
      lights: { ambient: 1.7, directional: 2.4, directionalPosition: [9, 15, 11] },
      case: { type: 'container40hc', seed: 0, wear: 0.5, doors: view.doors, color: 'green' },
      opaqueMeshes,
      hiddenTransparentMeshes,
      geometryUntouched: true,
      antialias: true,
    };
  }, { kind, view });
  const image = await page.locator('canvas[data-container-verify="gray"]').screenshot({ path: outputPath });
  return { ...meta, path: path.relative(ROOT, outputPath), bytes: image.length, sha256: sha256(image) };
}

function compareArrays(left, right) {
  if (!left || !right) return { pass: left === right, lengthEqual: left === right, maxAbsError: left === right ? 0 : Infinity };
  if (left.itemSize !== right.itemSize || left.count !== right.count || left.values.length !== right.values.length) {
    return { pass: false, lengthEqual: false, maxAbsError: Infinity, leftLength: left.values.length, rightLength: right.values.length };
  }
  let maxAbsError = 0;
  for (let i = 0; i < left.values.length; i += 1) maxAbsError = Math.max(maxAbsError, Math.abs(left.values[i] - right.values[i]));
  return { pass: maxAbsError <= 1e-6, lengthEqual: true, maxAbsError };
}

function compareJSON(left, right) {
  const a = JSON.stringify(left);
  const b = JSON.stringify(right);
  return { pass: a === b, left, right };
}

function compareBox(left, right) {
  if (!left || !right) return { pass: left === right, maxAbsError: left === right ? 0 : Infinity };
  let maxAbsError = 0;
  for (const key of ['min', 'max']) for (let i = 0; i < 3; i += 1) maxAbsError = Math.max(maxAbsError, Math.abs(left[key][i] - right[key][i]));
  return { pass: maxAbsError <= 1e-6, maxAbsError };
}

function compareCase(left, right) {
  const meshComparisons = [];
  let maxPositionError = 0;
  let vertices = 0;
  let triangles = 0;
  let allPass = left.meshes.length === right.meshes.length;
  const count = Math.max(left.meshes.length, right.meshes.length);
  for (let i = 0; i < count; i += 1) {
    const a = left.meshes[i];
    const b = right.meshes[i];
    if (!a || !b) {
      meshComparisons.push({ index: i, pass: false, reason: 'mesh 数量或顺序不同' });
      allPass = false;
      continue;
    }
    const attributes = {};
    for (const name of ['position', 'normal', 'uv', 'color']) {
      attributes[name] = compareArrays(a.attributes[name], b.attributes[name]);
      if (!attributes[name].pass) allPass = false;
    }
    const index = compareArrays(a.index, b.index);
    const bbox = compareBox(a.bbox, b.bbox);
    const material = compareJSON(a.material, b.material);
    if (!index.pass || !bbox.pass || !material.pass || a.name !== b.name) allPass = false;
    maxPositionError = Math.max(maxPositionError, attributes.position.maxAbsError || 0);
    vertices += a.attributes.position ? a.attributes.position.count : 0;
    triangles += a.index ? a.index.count / 3 : (a.attributes.position ? a.attributes.position.count / 3 : 0);
    meshComparisons.push({ index: i, name: a.name, pass: attributes.position.pass && attributes.normal.pass && attributes.uv.pass && attributes.color.pass && index.pass && bbox.pass && material.pass, attributes, index, bbox, material, nameEqual: a.name === b.name });
  }
  const userData = compareJSON(left.userData, right.userData);
  const groupBBox = compareBox(left.bbox, right.bbox);
  if (!userData.pass || !groupBBox.pass) allPass = false;
  return {
    pass: allPass,
    rawGeometryCompared: true,
    meshCount: { original: left.meshes.length, current: right.meshes.length, equal: left.meshes.length === right.meshes.length },
    vertexCount: vertices,
    triangleCount: triangles,
    maxPositionError,
    userData,
    bbox: groupBBox,
    meshes: meshComparisons,
  };
}

function checkManifest(sourceBytes, moduleBytes, manifest) {
  const items = [];
  const sourceHash = sha256(sourceBytes);
  items.push({ name: 'source sha256', ...pass(sourceHash === EXPECTED_SOURCE_HASH && sourceHash === manifest.source.sha256, { actual: sourceHash, expected: EXPECTED_SOURCE_HASH, manifest: manifest.source.sha256 }) });
  items.push({ name: 'source bytes', ...pass(sourceBytes.length === manifest.source.bytes, { actual: sourceBytes.length, manifest: manifest.source.bytes }) });
  const generatedHash = sha256(moduleBytes);
  items.push({ name: 'generated sha256', ...pass(generatedHash === manifest.generated.sha256, { actual: generatedHash, manifest: manifest.generated.sha256 }) });
  items.push({ name: 'generated bytes', ...pass(moduleBytes.length === manifest.generated.bytes, { actual: moduleBytes.length, manifest: manifest.generated.bytes }) });
  const sourceText = sourceBytes.toString('utf8');
  const fragments = manifest.extraction && manifest.extraction.fragments ? manifest.extraction.fragments : {};
  const fragmentEntries = Object.entries(fragments);
  items.push({ name: 'fragment count', ...pass(fragmentEntries.length === 74, { actual: fragmentEntries.length, expected: 74 }) });
  for (const [name, fragment] of fragmentEntries) {
    const start = fragment.sourceCodeUnitOffset;
    const end = fragment.sourceCodeUnitEnd;
    if (!Number.isInteger(start) || !Number.isInteger(end)) throw new Error(`invalid source offsets for ${name}`);
    const actual = sha256(sourceText.slice(start, end));
    items.push({ name: `fragment ${name}`, ...pass(actual === fragment.fragmentSha256, { actual, manifest: fragment.fragmentSha256, sourceCodeUnitOffset: start, sourceCodeUnitEnd: end }) });
  }
  return { pass: items.every((item) => item.pass), items };
}

async function main() {
  const startedAt = new Date().toISOString();
  const sourceBytes = fs.readFileSync(SOURCE);
  const moduleBytes = fs.readFileSync(MODULE);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const manifestCheck = checkManifest(sourceBytes, moduleBytes, manifest);
  const testCases = cases();
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });
  const originalPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const currentPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors = { original: [], current: [] };
  originalPage.on('pageerror', (error) => errors.original.push(error.message));
  currentPage.on('pageerror', (error) => errors.current.push(error.message));
  currentPage.on('console', (message) => { if (message.type() === 'error') errors.current.push(message.text()); });
  originalPage.on('console', (message) => { if (message.type() === 'error') errors.original.push(message.text()); });
  let originalData = null;
  let currentData = null;
  let currentReady = null;
  try {
    const parsed = parseOriginalScript(sourceBytes.toString('utf8'));
    await originalPage.setContent(makeOriginalHtml(parsed), { waitUntil: 'load' });
    const originalReference = await originalPage.evaluate(() => {
      const ref = window.__ContainerReference;
      return {
        exported: !!ref && typeof ref.build === 'function' && typeof ref.decals === 'function' && !!ref.THREE,
        revision: ref && ref.THREE ? ref.THREE.REVISION : null,
        required: ref && ref.THREE ? Object.fromEntries(['Vector3', 'BoxGeometry', 'CylinderGeometry', 'CatmullRomCurve3', 'TubeGeometry', 'Quaternion', 'Matrix4', 'Euler', 'BufferGeometry', 'Float32BufferAttribute', 'Mesh', 'Group', 'MeshStandardMaterial', 'MeshBasicMaterial', 'CanvasTexture', 'PlaneGeometry', 'MathUtils'].map((name) => [name, ref.THREE[name] !== undefined])) : {},
      };
    });
    if (!originalReference.exported) throw new Error('原版 IIFE 尾注入未导出 __ContainerReference');
    if (originalReference.revision !== '180') throw new Error(`原版引擎 revision 不是 r180: ${originalReference.revision}`);
    if (!Object.values(originalReference.required).every(Boolean)) throw new Error(`原版 lt namespace 缺少 buildContainer 所需 THREE 导出: ${JSON.stringify(originalReference)}`);
    currentReady = await currentPage.goto(CURRENT_URL, { waitUntil: 'load' });
    const readiness = await currentPage.evaluate(() => ({
      hasThree: !!window.THREE,
      revision: window.THREE && window.THREE.REVISION,
      hasModules: !!window.ASSET_MODULES,
      hasContainerModule: !!(window.ASSET_MODULES && window.ASSET_MODULES['container-builder']),
      hasBuild: !!(window.ASSET_MODULES && window.ASSET_MODULES['container-builder'] && typeof window.ASSET_MODULES['container-builder'].buildContainer === 'function'),
      hasDecals: !!(window.ASSET_MODULES && window.ASSET_MODULES['container-builder'] && typeof window.ASSET_MODULES['container-builder'].createDecalService === 'function'),
    }));
    if (!readiness.hasContainerModule || !readiness.hasBuild || !readiness.hasDecals) {
      const report = {
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'WAITING_FOR_BUILD_MODULES',
        message: '当前页面缺少 container-builder 模块；请等待主线程运行 tools/build_modules.py 完成后重新运行。本脚本未循环 sleep。',
        manifest: manifestCheck,
        readiness: { original: originalReference, current: readiness },
        engineDifference: { original: 'r180', current: readiness.revision || null, note: '仅记录引擎版本差异，不宣称材质或后期像素一致。' },
        cases: [],
        errors,
      };
      fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
      return report;
    }
    originalData = await collectPage(originalPage, 'original', testCases);
    currentData = await collectPage(currentPage, 'current', testCases);
    const caseReports = testCases.map((testCase, index) => ({
      ...testCase,
      ...compareCase(originalData.results[index].result, currentData.results[index].result),
    }));
    const visualView = {
      width: 1280,
      height: 900,
      clearColor: 0x101417,
      camera: [13, 8, 17],
      lookAt: [0, 1.45, 0],
      fov: 34,
      doors: 0,
    };
    const nearView = {
      width: 1280,
      height: 900,
      clearColor: 0x101417,
      camera: [9.2, 3.1, 0],
      lookAt: [0, 1.2, 0],
      fov: 34,
      doors: 1,
    };
    const visualEvidence = {
      grayOverview: {
        original: await renderGrayEvidence(originalPage, 'original', visualView, path.join(ROOT, 'outputs/container-original-reference-gray.png')),
        current: await renderGrayEvidence(currentPage, 'current', visualView, path.join(ROOT, 'outputs/container-restored-reference-gray.png')),
      },
      openDoorEnd: {
        original: await renderGrayEvidence(originalPage, 'original', nearView, path.join(ROOT, 'outputs/container-original-open-door-gray.png')),
        current: await renderGrayEvidence(currentPage, 'current', nearView, path.join(ROOT, 'outputs/container-restored-open-door-gray.png')),
      },
      interpretation: '两组截图均为真实 renderer 输出：同 viewport、clear 色、相机、ambient/directional light、container40hc(seed=0, wear=.5, doors=0/1)；所有 opaque mesh 临时替换为同一类纯灰 MeshStandardMaterial，透明 label/decal mesh 隐藏，未修改原始 geometry。截图用于视觉证据和内部木地板可见性，不作为跨 THREE r180/r160、不同抗锯齿实现的像素级相等证明，也不宣称全游戏材质/后期像素一致。',
      renderDifference: '原版 renderer 使用嵌入 THREE r180，当前 renderer 使用宿主 THREE r160；两者均启用 antialias，但具体抗锯齿实现和引擎细节可能不同。',
    };
    const report = {
      startedAt,
      completedAt: new Date().toISOString(),
      status: caseReports.every((item) => item.pass) && manifestCheck.pass ? 'PASS' : 'FAIL',
      scope: {
        original: '未抽取的原版完整 IIFE；仅用 Acorn AST 移除 IIFE 最后 QC() 启动 statement，并在同一 IIFE 尾部注入 window.__ContainerReference={build:M3,decals:l3,THREE:lt}。原文件未改。',
        current: CURRENT_URL,
        geometry: '逐 mesh 比较 position/normal/uv/color/index 原始 BufferGeometry 数组、mesh bbox、组 bbox、colliders、材质名与属性；不是仅比较外尺寸，M3 cache geometry 的原始 poly top/full 均在比较范围内。',
        materials: '两边均使用真实 label/decal service；get 使用同名 MeshStandardMaterial adapter，并忠实传递 vertexColors。',
        fonts: '两页均等待 document.fonts.ready；字体只用于真实 Canvas label service，不以贴花像素作为几何相等条件。',
      },
      manifest: manifestCheck,
      readiness: {
        original: { exported: true, engine: originalData.engine, service: originalData.service },
        current: { engine: currentData.engine, service: currentData.service },
      },
      engineDifference: {
        original: originalData.engine.revision,
        current: currentData.engine.revision,
        note: '原版使用嵌入 THREE r180，当前页面使用宿主 THREE r160；报告只记录该差异，不宣称材质/后期像素一致。',
      },
      cases: caseReports,
      visualEvidence,
      summary: {
        total: caseReports.length,
        passed: caseReports.filter((item) => item.pass).length,
        failed: caseReports.filter((item) => !item.pass).length,
        maxPositionError: Math.max(...caseReports.map((item) => item.maxPositionError), 0),
        allRawGeometryCompared: caseReports.every((item) => item.rawGeometryCompared),
      },
      errors,
    };
    fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
    return report;
  } catch (error) {
    const report = {
      startedAt,
      completedAt: new Date().toISOString(),
      status: 'ERROR',
      error: error && error.stack ? error.stack : String(error),
      manifest: manifestCheck,
      readiness: currentReady,
      engineDifference: { original: 'r180', current: null, note: '验证在构建前置阶段失败；不宣称材质/后期像素一致。' },
      cases: [],
      errors,
    };
    fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
    return report;
  } finally {
    await browser.close();
  }
}

main().then((report) => {
  console.log(JSON.stringify({ status: report.status, output: OUTPUT, summary: report.summary || null, error: report.error || null }, null, 2));
  if (report.status === 'ERROR') process.exitCode = 1;
});
