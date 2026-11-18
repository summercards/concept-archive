#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_BASE_URL = 'http://127.0.0.1:8099/index.html';
const USAGE = `用法：
  node verify_asset.cjs --root <绝对项目根> --id new.<slug> --playwright <绝对Playwright包路径> --out-dir <root内不存在的新目录> [--base-url <url>]

参数：
  --root        必填，绝对项目根目录；不会回退到当前目录
  --id          必填，形如 new.slug
  --base-url    可选，默认 ${DEFAULT_BASE_URL}
  --playwright  必填，绝对路径，直接加载该 Playwright 包；不会自动发现其他 workspace
  --out-dir     必填，位于 root 内且父目录已存在的全新证据目录；不会覆盖既有目录
  --help        显示帮助
`;

function die(message, code = 2) {
  process.stderr.write(`verify_asset.cjs: ${message}\n`);
  process.exitCode = code;
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return { help: true };
  const values = new Set(['--root', '--id', '--base-url', '--playwright', '--out-dir']);
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!values.has(key)) throw new Error(`未知参数：${key}`);
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`${key} 缺少值`);
    out[key.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = argv[++i];
  }
  for (const key of ['root', 'id', 'playwright', 'outDir']) {
    if (!out[key]) throw new Error(`缺少必填参数：--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`);
  }
  if (!path.isAbsolute(out.root)) throw new Error('--root 必须是绝对路径');
  if (!path.isAbsolute(out.playwright)) throw new Error('--playwright 必须是绝对路径');
  if (!/^new\.[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.id)) throw new Error('--id 必须符合 new.<小写连字符slug>');
  out.baseUrl = out.baseUrl || DEFAULT_BASE_URL;
  let base;
  try { base = new URL(out.baseUrl); } catch (_) { throw new Error('--base-url 不是有效 URL'); }
  if (!['http:', 'https:', 'file:'].includes(base.protocol)) throw new Error('--base-url 只支持 http、https 或 file URL');
  out.baseUrl = base.href;
  return out;
}

function realExisting(p, label) {
  let st;
  try { st = fs.statSync(p); } catch (_) { throw new Error(`${label}不存在：${p}`); }
  if (!st.isDirectory()) throw new Error(`${label}不是目录：${p}`);
  return fs.realpathSync(p);
}

function ensureOutputDir(root, requested) {
  const out = path.resolve(root, requested);
  if (fs.existsSync(out)) throw new Error('--out-dir 必须是不存在的新目录，拒绝覆盖 evidence：' + out);
  const parent = path.dirname(out);
  const parentReal = realExisting(parent, '--out-dir 的父目录');
  const rootReal = fs.realpathSync(root);
  const rel = path.relative(rootReal, parentReal);
  if (rel.startsWith('..' + path.sep) || rel === '..' || path.isAbsolute(rel)) {
    throw new Error('--out-dir 的父目录必须位于 root 内：' + parentReal);
  }
  fs.mkdirSync(out);
  return out;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  Object.keys(value).sort().forEach(k => { out[k] = stable(value[k]); });
  return out;
}

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function finiteArray(v, n) {
  return Array.isArray(v) && v.length === n && v.every(x => typeof x === 'number' && Number.isFinite(x));
}

function typeMatches(value, type) {
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'string') return typeof value === 'string';
  if (type === 'object') return value && typeof value === 'object' && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  return true;
}

function makeOptions(contract) {
  const schema = contract && contract.options;
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) throw new Error('contract.options 缺失或不是对象');
  const defaults = {};
  const variants = [];
  for (const [key, spec] of Object.entries(schema)) {
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error(`contract.options.${key} 必须是对象`);
    if (!Object.prototype.hasOwnProperty.call(spec, 'default')) throw new Error(`contract.options.${key}.default 缺失`);
    if (!Array.isArray(spec.values) || !spec.values.length) throw new Error(`contract.options.${key}.values 必须是非空数组`);
    if (spec.type && !typeMatches(spec.default, spec.type)) throw new Error(`contract.options.${key}.default 类型不匹配`);
    if (spec.type && spec.values.some(v => !typeMatches(v, spec.type))) throw new Error(`contract.options.${key}.values 类型不匹配`);
    if (!spec.values.some(v => JSON.stringify(v) === JSON.stringify(spec.default))) {
      throw new Error(`contract.options.${key}.values 必须包含 default`);
    }
    defaults[key] = spec.default;
    const different = spec.values.find(v => JSON.stringify(v) !== JSON.stringify(spec.default));
    variants.push({ key, value: different === undefined ? spec.default : different, changed: different !== undefined });
  }
  return { defaults, variants };
}

function hashFile(file) {
  try { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
  catch (_) { return null; }
}

function projectFileSnapshot(root, source) {
  const names = [
    'assets/authored/registry.json',
    'assets/authored.js',
    'previews.js',
    'app.js',
  ];
  if (source) {
    names.push(path.join('assets/authored', source));
    names.push(path.join('assets/authored/contracts', path.basename(source, '.js') + '.json'));
  }
  const files = {};
  for (const relative of names) {
    const file = path.resolve(root, relative);
    const inside = file === root || file.startsWith(root + path.sep);
    files[relative] = inside ? { path: file, sha256: hashFile(file) } : { path: file, sha256: null, error: 'path escaped root' };
  }
  return files;
}

function emptyReport(args, outDir) {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    command: process.argv.slice(2),
    root: args.root,
    id: args.id,
    baseUrl: args.baseUrl,
    playwright: args.playwright,
    outDir,
    projectFilesBefore: {},
    projectFilesAfter: {},
    catalog: { status: 'UNVERIFIED', fullPass: false },
    geometry: { status: 'FAIL', automatic: true, checks: {}, determinism: {}, variants: [] },
    runtime: { status: 'FAIL', automatic: true, notExecutedMemory: ['无法在本验证器中可靠执行浏览器堆内存/显存回收证明'], mountCycles: {} },
    visual: { status: 'UNVERIFIED', scope: '截图生成不等于真实视觉验收；本脚本始终不写 visual pass', screenshots: [], controls: {} },
    pageConsole: [],
    errors: [],
    shaderMessages: [],
    network: { externalRejected: [], failed: [] },
    automaticChecks: { passed: false, failures: [] },
    normalizedReportSha256: null,
  };
}

function addFailure(report, message) {
  if (!report.automaticChecks.failures.includes(message)) report.automaticChecks.failures.push(message);
}

function pageUtilitySource() {
  return ({ id, contract, baseOptions, variantOptions }) => {
    const T = window.THREE;
    const catalog = window.AUTHORED_CATALOG;
    const builders = window.AUTHORED_BUILDERS;
    const item = catalog && Array.isArray(catalog.items) ? catalog.items.find(x => x && x.id === id) : null;
    const builder = builders && builders[id];
    const failures = [];
    const warnings = [];
    const materialNames = new Set();
    const sharedMaterials = new Set();
    const materialDisposeEvents = [];
    const materialListeners = new Map();
    const roots = [];

    function finite(n) { return typeof n === 'number' && Number.isFinite(n); }
    function finiteArray(a, n) { return Array.isArray(a) && a.length === n && a.every(finite); }
    function clean(value, seen) {
      if (typeof value === 'function' || value === undefined) return undefined;
      if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
      if (!value || typeof value !== 'object') return value;
      if (!seen) seen = new WeakSet();
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      if (Array.isArray(value)) return value.map(v => clean(v, seen));
      const out = {};
      Object.keys(value).sort().forEach(k => {
        if (/uuid|timestamp|time/i.test(k)) return;
        const v = clean(value[k], seen);
        if (v !== undefined) out[k] = v;
      });
      return out;
    }
    function matrixArray(m) { return m && Array.isArray(m.elements) ? m.elements.slice() : null; }
    function nodePath(root, node) {
      const parts = [];
      let cur = node;
      while (cur && cur !== root) {
        const parent = cur.parent;
        const index = parent ? parent.children.indexOf(cur) : -1;
        parts.unshift(`${cur.name || ''}#${index}`);
        cur = parent;
      }
      return parts.join('/');
    }
    function attrArray(attr) {
      return attr && attr.array ? Array.from(attr.array) : null;
    }
    function addAttrCheck(mesh, attr, label, checks, options) {
      if (!attr) {
        if (options.required) failures.push(`${mesh.name || '匿名Mesh'} 缺少 ${label} attribute`);
        return null;
      }
      const data = attrArray(attr);
      if (!data || !data.every(finite)) failures.push(`${mesh.name || '匿名Mesh'} 的 ${label} 含非finite值`);
      checks.attributes += 1;
      return data;
    }
    function resolveEnvelope(c, options) {
      function bounds(value, label) {
        if (!value || !finiteArray(value.min, 3) || !finiteArray(value.max, 3) || value.min.some((v, i) => v >= value.max[i])) throw new Error(`${label} min/max 必须是有限且有正跨度的三元组`);
        return { min: value.min.slice(), max: value.max.slice() };
      }
      if (!finiteArray(c.size, 3) || c.size.some(v => v <= 0)) throw new Error('contract.size 必须是有限正数三元组');
      const nominal = bounds(c.nominalBounds || { min: [-c.size[0] / 2, 0, -c.size[2] / 2], max: [c.size[0] / 2, c.size[1], c.size[2] / 2] }, 'contract.nominalBounds');
      const isDefault = Object.entries(c.options).every(([key, spec]) => JSON.stringify(options[key] === undefined ? spec.default : options[key]) === JSON.stringify(spec.default));
      let matched = null;
      let matchedIndex = null;
      if (c.variantEnvelopes !== undefined && !Array.isArray(c.variantEnvelopes)) throw new Error('contract.variantEnvelopes 必须是数组');
      for (const [index, variant] of (c.variantEnvelopes || []).entries()) {
        if (!variant || !variant.options || typeof variant.options !== 'object' || Array.isArray(variant.options) || !Object.keys(variant.options).length) throw new Error(`variantEnvelopes[${index}].options 必须是非空对象`);
        const matches = Object.entries(variant.options).every(([key, value]) => Object.prototype.hasOwnProperty.call(c.options, key) && JSON.stringify(options[key] === undefined ? c.options[key].default : options[key]) === JSON.stringify(value));
        if (matches && (!matched || Object.keys(variant.options).length > Object.keys(matched.options).length)) { matched = variant; matchedIndex = index; }
      }
      // 默认姿态不能借用总活动包络逃过名义尺寸与原点检查。
      const envelope = !isDefault && matched ? bounds(matched, `variantEnvelopes[${matchedIndex}]`) : nominal;
      const expectedSize = isDefault || !matched ? c.size : (matched.size || null);
      if (expectedSize && (!finiteArray(expectedSize, 3) || expectedSize.some(v => v <= 0))) throw new Error('变体 size 必须是有限正数三元组');
      return { isDefault, matchedIndex, options: clean(options), expectedSize, envelope, boundsEnvelope: !isDefault && c.boundsEnvelope ? bounds(c.boundsEnvelope, 'contract.boundsEnvelope') : null };
    }
    function sizeTolerances(size, c) {
      const declared = c && c.sizeTolerance;
      if (typeof declared === 'number' && Number.isFinite(declared) && declared >= 0) return size.map(v => Math.max(declared, v * 0.01));
      if (declared && typeof declared === 'object') {
        const m = Number.isFinite(declared.meters) ? declared.meters : 0.02;
        const p = Number.isFinite(declared.percent) ? declared.percent : 0.01;
        return size.map(v => Math.max(m, v * p));
      }
      return size.map(v => Math.max(0.02, v * 0.01));
    }
    function getMeshMaterialNames(material) {
      const list = Array.isArray(material) ? material : [material];
      list.forEach(m => {
        if (!m || typeof m.name !== 'string' || !m.name) failures.push('Mesh 使用了没有 name 的材质');
        else { materialNames.add(m.name); }
      });
    }
    function watchMaterial(material) {
      if (!material || !material.isMaterial || materialListeners.has(material)) return;
      const listener = () => materialDisposeEvents.push({ name: material.name || '(unnamed)', shared: sharedMaterials.has(material) });
      material.addEventListener('dispose', listener);
      materialListeners.set(material, listener);
    }
    function trackSharedMaterials(ctx) {
      if (!(ctx.sharedMaterials instanceof Set)) throw new Error('authoredContext.sharedMaterials 必须是宿主维护的 Set<THREE.Material>');
      for (const material of ctx.sharedMaterials) {
        if (!material || material.isMaterial !== true) throw new Error('ctx.sharedMaterials 只能包含 THREE.Material 实例');
        sharedMaterials.add(material);
        watchMaterial(material);
      }
    }
    function resolveContextMaterialNames(ctx) {
      const allowed = new Set(Array.isArray(contract.materials) ? contract.materials : []);
      trackSharedMaterials(ctx);
      if (ctx.mats && typeof ctx.mats.get === 'function') {
        for (const name of Array.from(allowed)) {
          const result = ctx.mats.get(name);
          const materials = Array.isArray(result) ? result : [result];
          for (const material of materials) {
            if (!material || material.isMaterial !== true) throw new Error(`ctx.mats.get(${name}) 未返回 THREE.Material`);
            ctx.sharedMaterials.add(material);
          }
        }
      }
      trackSharedMaterials(ctx);
      return allowed;
    }
    function capture(root, ctx, label, options) {
      if (!root || !root.isObject3D) throw new Error(`${label} build 未返回 THREE.Object3D`);
      if (!root.userData || root.userData.assetId !== id) failures.push(`${label} userData.assetId 不正确`);
      if (!root.userData || root.userData.authored !== true) failures.push(`${label} userData.authored 必须为 true`);
      root.updateMatrixWorld(true);
      const meshes = [];
      const usedMaterials = new Set();
      const checks = { meshes: 0, vertices: 0, triangles: 0, degenerateTriangles: 0, attributes: 0 };
      const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
      root.traverse(o => {
        if (!o.matrix || !o.matrixWorld || !o.matrix.elements.every(finite) || !o.matrixWorld.elements.every(finite)) {
          failures.push(`${label} ${o.name || '匿名节点'} transform 非finite`);
        }
        if (!o.isMesh) return;
        checks.meshes += 1;
        const g = o.geometry;
        if (!g || !g.attributes) { failures.push(`${label} ${o.name || '匿名Mesh'} 缺少 geometry`); return; }
        const posAttr = g.getAttribute('position');
        const normalAttr = g.getAttribute('normal');
        const uvAttr = g.getAttribute('uv');
        const colorAttr = g.getAttribute('color');
        const pos = addAttrCheck(o, posAttr, 'position', checks, { required: true });
        const normal = addAttrCheck(o, normalAttr, 'normal', checks, { required: true });
        const uv = addAttrCheck(o, uvAttr, 'uv', checks, { required: true });
        const color = addAttrCheck(o, colorAttr, 'color', checks, { required: false });
        if (!posAttr || !pos || posAttr.itemSize < 3 || posAttr.count === 0) {
          failures.push(`${label} ${o.name || '匿名Mesh'} position 为空或 itemSize 无效`);
          return;
        }
        checks.vertices += posAttr.count;
        if (normal) {
          for (let i = 0; i < normalAttr.count; i += 1) {
            const x = normal[i * normalAttr.itemSize], y = normal[i * normalAttr.itemSize + 1], z = normal[i * normalAttr.itemSize + 2];
            const len = Math.hypot(x, y, z);
            if (Math.abs(len - 1) > 1e-3) { failures.push(`${label} ${o.name || '匿名Mesh'} normal 非单位长度`); break; }
          }
        }
        const indexAttr = g.index;
        const index = indexAttr ? attrArray(indexAttr) : null;
        const count = index ? index.length : posAttr.count;
        if (count % 3 !== 0) failures.push(`${label} ${o.name || '匿名Mesh'} triangle index/count 不是3的倍数`);
        checks.triangles += Math.floor(count / 3);
        for (let i = 0; i < count; i += 1) {
          const ix = index ? index[i] : i;
          if (!Number.isInteger(ix) || ix < 0 || ix >= posAttr.count) { failures.push(`${label} ${o.name || '匿名Mesh'} index 越界`); break; }
        }
        for (let i = 0; i + 2 < count; i += 3) {
          const ia = index ? index[i] : i, ib = index ? index[i + 1] : i + 1, ic = index ? index[i + 2] : i + 2;
          const ax = pos[ia * posAttr.itemSize], ay = pos[ia * posAttr.itemSize + 1], az = pos[ia * posAttr.itemSize + 2];
          const bx = pos[ib * posAttr.itemSize], by = pos[ib * posAttr.itemSize + 1], bz = pos[ib * posAttr.itemSize + 2];
          const cx = pos[ic * posAttr.itemSize], cy = pos[ic * posAttr.itemSize + 1], cz = pos[ic * posAttr.itemSize + 2];
          const abx = bx - ax, aby = by - ay, abz = bz - az;
          const acx = cx - ax, acy = cy - ay, acz = cz - az;
          const cross = [aby * acz - abz * acy, abz * acx - abx * acz, abx * acy - aby * acx];
          if (cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2] <= 1e-18) checks.degenerateTriangles += 1;
        }
        getMeshMaterialNames(o.material);
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => usedMaterials.add(m));
        const material = Array.isArray(o.material) ? o.material.map(m => m && m.name || '') : (o.material && o.material.name || '');
        const node = { path: nodePath(root, o), name: o.name || '', visible: !!o.visible, matrix: matrixArray(o.matrix), matrixWorld: matrixArray(o.matrixWorld), material, position: pos, normal, uv, color, index };
        meshes.push(node);
        for (let i = 0; i < posAttr.count; i += 1) {
          const v = new T.Vector3(pos[i * posAttr.itemSize], pos[i * posAttr.itemSize + 1], pos[i * posAttr.itemSize + 2]).applyMatrix4(o.matrixWorld);
          if (![v.x, v.y, v.z].every(finite)) failures.push(`${label} ${o.name || '匿名Mesh'} world position 非finite`);
          bbox.min[0] = Math.min(bbox.min[0], v.x); bbox.min[1] = Math.min(bbox.min[1], v.y); bbox.min[2] = Math.min(bbox.min[2], v.z);
          bbox.max[0] = Math.max(bbox.max[0], v.x); bbox.max[1] = Math.max(bbox.max[1], v.y); bbox.max[2] = Math.max(bbox.max[2], v.z);
        }
      });
      if (!meshes.length) failures.push(`${label} 没有 Mesh`);
      if (![...bbox.min, ...bbox.max].every(finite)) failures.push(`${label} bbox 非finite或为空`);
      if (checks.degenerateTriangles) warnings.push(`${label} 含 ${checks.degenerateTriangles} 个退化三角形`);
      if (checks.degenerateTriangles && !(contract && contract.allowDegenerateTriangles === true)) failures.push(`${label} 新资产存在退化三角形`);
      const budget = contract && contract.budget;
      if (budget && typeof budget === 'object') {
        if (Number.isFinite(budget.triangles) && checks.triangles > budget.triangles) failures.push(`${label} triangles 超过 contract.budget.triangles`);
        if (Number.isFinite(budget.maxMeshes) && checks.meshes > budget.maxMeshes) failures.push(`${label} meshes 超过 contract.budget.maxMeshes`);
      } else warnings.push(`${label} 未声明 budget，预算检查未执行`);
      const resolved = resolveEnvelope(contract, options);
      const size = bbox.max.map((v, i) => v - bbox.min[i]);
      const tol = sizeTolerances(contract.size, contract);
      if (!finiteArray(size, 3) || size.some(v => v <= 0)) failures.push(`${label} 实测 bbox 没有三轴正跨度`);
      if (root.userData && root.userData.origin && root.userData.origin !== 'bottom-center') failures.push(`${label} userData.origin 必须为 bottom-center`);
      if (root.userData && root.userData.forward && root.userData.forward !== '+Z') failures.push(`${label} userData.forward 必须为 +Z`);
      if (resolved.expectedSize) {
        size.forEach((v, i) => { if (Math.abs(v - resolved.expectedSize[i]) > tol[i]) failures.push(`${label} bbox size[${i}] 超出${resolved.isDefault ? '默认名义' : '当前变体'}尺寸容差`); });
      }
      if (resolved.isDefault || resolved.matchedIndex === null) {
        if (Math.abs((bbox.min[0] + bbox.max[0]) / 2) > tol[0]) failures.push(`${label} bbox X 未以原点居中`);
        if (Math.abs((bbox.min[2] + bbox.max[2]) / 2) > tol[2]) failures.push(`${label} bbox Z 未以原点居中`);
      }
      if (Math.abs(bbox.min[1]) > tol[1]) failures.push(`${label} bbox bottom 未落在 y=0`);
      if (!finiteArray(root.userData.size, 3) || root.userData.size.some((v, i) => v <= 0 || Math.abs(v - size[i]) > tol[i])) failures.push(`${label} userData.size 与当前实测 bbox 不匹配`);
      const geometryInside = [0, 1, 2].every(i => bbox.min[i] >= resolved.envelope.min[i] - tol[i] && bbox.max[i] <= resolved.envelope.max[i] + tol[i]);
      const withinTotalEnvelope = !resolved.boundsEnvelope || [0, 1, 2].every(i => bbox.min[i] >= resolved.boundsEnvelope.min[i] - tol[i] && bbox.max[i] <= resolved.boundsEnvelope.max[i] + tol[i]);
      if (!geometryInside) failures.push(`${label} bbox 超出当前 options 匹配的 contract envelope`);
      if (!withinTotalEnvelope) failures.push(`${label} bbox 超出 contract.boundsEnvelope`);
      checks.size = { measured: size, declared: clean(root.userData.size), expected: resolved.expectedSize, tolerance: tol };
      checks.checkenv = { ...resolved, bbox, geometryInside, withinTotalEnvelope, collidersInside: true };
      const required = contract && Array.isArray(contract.requiredParts) ? contract.requiredParts : [];
      for (const name of required) {
        const found = typeof root.getObjectByName === 'function' ? root.getObjectByName(name) : null;
        let vertices = 0;
        if (found) found.traverse(o => { const p = o.geometry && o.geometry.getAttribute && o.geometry.getAttribute('position'); if (o.isMesh && p) vertices += p.count; });
        if (!found || vertices <= 0) failures.push(`${label} requiredPart ${name} 不是带顶点的实际几何节点`);
      }
      const colliders = root.userData && root.userData.colliders;
      if (!Array.isArray(colliders) || !colliders.length) failures.push(`${label} colliders 缺失或为空`);
      const envelope = resolved.envelope;
      if (Array.isArray(colliders)) colliders.forEach((c, ci) => {
        if (!c || !finiteArray(c.min, 3) || !finiteArray(c.max, 3)) { failures.push(`${label} collider[${ci}] min/max 无效`); return; }
        if ([0, 1, 2].some(i => !(c.min[i] < c.max[i]))) failures.push(`${label} collider[${ci}] 没有正跨度`);
        if (!c.surface || typeof c.surface !== 'string') failures.push(`${label} collider[${ci}] surface 无效`);
        if (envelope) {
          for (const x of [c.min[0], c.max[0]]) for (const y of [c.min[1], c.max[1]]) for (const z of [c.min[2], c.max[2]]) {
            if (x < envelope.min[0] - tol[0] || x > envelope.max[0] + tol[0] || y < envelope.min[1] - tol[1] || y > envelope.max[1] + tol[1] || z < envelope.min[2] - tol[2] || z > envelope.max[2] + tol[2]) {
              checks.checkenv.collidersInside = false;
              failures.push(`${label} collider[${ci}] 八角超出当前 options 匹配的 contract envelope`);
            }
          }
        }
      });
      const sockets = root.userData && root.userData.sockets;
      if (!sockets || typeof sockets !== 'object' || Array.isArray(sockets)) failures.push(`${label} sockets 缺失或不是对象`);
      if (sockets && typeof sockets === 'object') Object.keys(sockets).forEach(name => {
        const s = sockets[name];
        if (!s || !finiteArray(s.position, 3)) failures.push(`${label} socket ${name} position 无效`);
      });
      const allowed = resolveContextMaterialNames(ctx);
      usedMaterials.forEach(material => {
        if (!material || material.isMaterial !== true) { failures.push(`${label} Mesh 材质不是 THREE.Material`); return; }
        watchMaterial(material);
        if (!allowed.has(material.name) && !ctx.sharedMaterials.has(material)) failures.push(`${label} 材质 ${material.name || '(unnamed)'} 不在 contract.materials 且不是 ctx.sharedMaterials 中的服务产物`);
      });
      const normalized = {
        metadata: clean({ assetId: root.userData && root.userData.assetId, authored: root.userData && root.userData.authored, size: root.userData && root.userData.size, colliders, sockets }),
        meshes,
        bbox,
        counts: { meshes: checks.meshes, vertices: checks.vertices, triangles: checks.triangles, degenerateTriangles: checks.degenerateTriangles, attributes: checks.attributes },
      };
      return { normalized, checks, bbox, root, ctx };
    }
    function buildOne(options, label) {
      const ctx = window.PREVIEWS.authoredContext(id, options);
      if (!ctx || !ctx.THREE || !ctx.kit || !ctx.mats || typeof ctx.rng !== 'function') throw new Error(`${label} authoredContext 未返回 {THREE,kit,mats,rng}`);
      trackSharedMaterials(ctx);
      const root = builder.build(ctx, options);
      const captured = capture(root, ctx, label, options);
      roots.push({ root, ctx, captured });
      return captured;
    }
    function dynamicState(snapshot) {
      return { meshes: snapshot.meshes.map(m => ({ path: m.path, matrixWorld: m.matrixWorld })), colliders: snapshot.metadata && snapshot.metadata.colliders, sockets: snapshot.metadata && snapshot.metadata.sockets };
    }
    if (!T || !catalog || !item || !builder || typeof builder.build !== 'function') throw new Error('页面公开 authored API 不完整：需要 AUTHORED_CATALOG.items、AUTHORED_BUILDERS[id].build 和 THREE');
    if (!window.PREVIEWS || typeof window.PREVIEWS.authoredContext !== 'function') throw new Error('页面缺少公开 PREVIEWS.authoredContext(id, options)');
    if (typeof window.PREVIEWS.inspectAuthored !== 'function') warnings.push('页面缺少公开 PREVIEWS.inspectAuthored(id, options)，未执行该诊断入口');

    const first = buildOne(baseOptions, 'build#1');
    const second = buildOne(baseOptions, 'build#2');
    const same = JSON.stringify(first.normalized) === JSON.stringify(second.normalized);
    if (!same) failures.push('同 seed/options 两次 build normalized geometry 不一致');
    const variantResults = [];
    for (const v of variantOptions) {
      const opts = JSON.parse(JSON.stringify(baseOptions));
      opts[v.key] = v.value;
      try {
        const failureStart = failures.length;
        const result = buildOne(opts, `variant:${v.key}=${JSON.stringify(v.value)}`);
        variantResults.push({ key: v.key, value: v.value, changedFromDefault: JSON.stringify(result.normalized) !== JSON.stringify(first.normalized), sha256: null, counts: result.checks, size: result.checks.size, checkenv: result.checks.checkenv, status: failures.length === failureStart ? 'PASS' : 'FAIL' });
      } catch (e) {
        failures.push(`variant ${v.key} build 失败：${e.message || e}`);
        variantResults.push({ key: v.key, value: v.value, error: String(e && e.message || e) });
      }
    }
    const dynamic = !!(contract && ((contract.dynamic === true) || (contract.dynamic && contract.dynamic.enabled === true) || (contract.designContract && contract.designContract.dynamic && contract.designContract.dynamic.enabled === true)));
    const runtime = { dynamic, hookPresence: {}, updateSamples: [], resetMatchesBaseline: null, dispose: { declared: false, calls: 0, errors: [], sharedMaterialDisposeEvents: 0 } };
    const ud = first.root.userData || {};
    runtime.hookPresence = { update: typeof ud.update === 'function', reset: typeof ud.reset === 'function', dispose: typeof ud.dispose === 'function' };
    if (dynamic && (!runtime.hookPresence.update || !runtime.hookPresence.reset)) failures.push('contract.dynamic=true 但缺少 root.userData.update/reset hooks');
    if (runtime.hookPresence.update) {
      const baseline = dynamicState(first.normalized);
      try {
        for (const dt of [0.016, 0.033, 0.05]) { ud.update(dt); first.root.updateMatrixWorld(true); const after = capture(first.root, first.ctx, `dynamic:update:${dt}`, baseOptions); runtime.updateSamples.push({ dt, state: dynamicState(after.normalized) }); }
        if (runtime.hookPresence.reset) {
          ud.reset();
          first.root.updateMatrixWorld(true);
          const reset = capture(first.root, first.ctx, 'dynamic:reset', baseOptions);
          runtime.resetMatchesBaseline = JSON.stringify(dynamicState(reset.normalized)) === JSON.stringify(baseline);
          if (!runtime.resetMatchesBaseline) failures.push('reset 后 geometry matrixWorld/collider state 未恢复 baseline');
        }
      } catch (e) { failures.push(`dynamic update/reset 失败：${e.message || e}`); }
    }
    roots.forEach(rec => trackSharedMaterials(rec.ctx));
    try {
      roots.forEach(rec => {
        const d = rec.root.userData && rec.root.userData.dispose;
        if (typeof d !== 'function') return;
        runtime.dispose.declared = true;
        try { d.call(rec.root.userData); runtime.dispose.calls += 1; } catch (e) { runtime.dispose.errors.push(String(e && e.message || e)); }
        try { d.call(rec.root.userData); runtime.dispose.calls += 1; } catch (e) { runtime.dispose.errors.push(String(e && e.message || e)); }
      });
    } finally {
      materialListeners.forEach((listener, material) => material.removeEventListener('dispose', listener));
    }
    runtime.dispose.sharedMaterialDisposeEvents = materialDisposeEvents.filter(x => x.shared).length;
    runtime.dispose.materialDisposeEvents = materialDisposeEvents;
    if (runtime.dispose.errors.length) failures.push('dispose 调用报错');
    if (runtime.dispose.sharedMaterialDisposeEvents) failures.push('dispose 释放了 ctx.mats 共享材质');
    return {
      catalog: { id: item.id, contract: item.contract, acceptance: item.acceptance, builderShape: Object.keys(builder).sort(), hasInspectAuthored: typeof window.PREVIEWS.inspectAuthored === 'function' },
      normalized: { first: first.normalized, second: second.normalized, variants: variantResults.map(x => ({ key: x.key, value: x.value, changedFromDefault: x.changedFromDefault, counts: x.counts })) },
      checks: first.checks,
      warnings,
      failures,
      deterministic: { equal: same, first: first.normalized, second: second.normalized },
      variants: variantResults,
      runtime,
      hookCounters: window.__AUTHORED_VERIFY_COUNTERS || null,
      materialNames: Array.from(materialNames).sort(),
    };
  };
}

function installWrapperSource() {
  return id => {
    const b = window.AUTHORED_BUILDERS && window.AUTHORED_BUILDERS[id];
    if (!b || typeof b.build !== 'function') return { ok: false, reason: 'builder.build 缺失' };
    window.__AUTHORED_VERIFY_COUNTERS = { build: 0, update: 0, reset: 0, dispose: 0 };
    if (!b.__authoredVerifyWrapped) {
      const original = b.build;
      b.build = function wrappedBuild(...args) {
        window.__AUTHORED_VERIFY_COUNTERS.build += 1;
        const root = original.apply(this, args);
        if (root && root.userData && !root.userData.__authoredVerifyWrapped) {
          const ud = root.userData;
          ['update', 'reset', 'dispose'].forEach(name => {
            if (typeof ud[name] !== 'function') return;
            const fn = ud[name];
            ud[name] = function wrappedHook(...hookArgs) {
              window.__AUTHORED_VERIFY_COUNTERS[name] += 1;
              return fn.apply(this, hookArgs);
            };
          });
          try { Object.defineProperty(ud, '__authoredVerifyWrapped', { value: true, enumerable: false }); } catch (_) { ud.__authoredVerifyWrapped = true; }
        }
        return root;
      };
      try { Object.defineProperty(b, '__authoredVerifyWrapped', { value: true, enumerable: false }); } catch (_) { b.__authoredVerifyWrapped = true; }
    }
    return { ok: true };
  };
}

async function waitForAuthoredPage(page, id) {
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForFunction(assetId => document.querySelector('.pv-fail') || Array.from(document.querySelectorAll('canvas')).some(c => c.dataset.authored === assetId), id, { timeout: 15000 });
  const state = await page.evaluate(assetId => ({
    canvas: Array.from(document.querySelectorAll('canvas')).some(c => c.dataset.authored === assetId),
    failures: Array.from(document.querySelectorAll('.pv-fail')).map(x => x.textContent || ''),
  }), id);
  if (state.failures.length) throw new Error('页面出现 pv-fail：' + state.failures.join(' | '));
  if (!state.canvas) throw new Error(`页面未找到 canvas[data-authored="${id}"]`);
}

async function clickPreviewControl(page, id, ariaLabel, buttonText) {
  const result = await page.evaluate(({ assetId, groupLabel, text }) => {
    const canvas = Array.from(document.querySelectorAll('canvas')).find(c => c.dataset.authored === assetId);
    if (!canvas) return { ok: false, reason: `缺少 canvas[data-authored="${assetId}"]` };
    const wrap = canvas.closest('.pv-wrap') || canvas.parentElement;
    const group = wrap && Array.from(wrap.querySelectorAll('[role="group"][aria-label]')).find(x => x.getAttribute('aria-label') === groupLabel);
    if (!group) return { ok: false, reason: `缺少预览控件组：${groupLabel}` };
    const button = Array.from(group.querySelectorAll('button')).find(x => (x.textContent || '').trim() === text);
    if (!button) return { ok: false, reason: `缺少预览控件：${groupLabel}/${text}` };
    button.click();
    return { ok: true, pressed: button.getAttribute('aria-pressed') };
  }, { assetId: id, groupLabel: ariaLabel, text: buttonText });
  if (!result.ok) throw new Error(result.reason);
  await page.waitForTimeout(100);
  return result;
}

async function captureVisuals(page, id, outDir, report) {
  const shots = [
    ['原材质', '整体', 'material-overall.png'],
    ['原材质', '正面', 'material-front.png'],
    ['原材质', '背面', 'material-back.png'],
    ['纯灰几何', '整体', 'clay-overall.png'],
    ['结构线框', '整体', 'wire-overall.png'],
  ];
  const requiredViews = ['整体', '正面', '背面', '俯视'];
  const available = await page.evaluate(id0 => {
    const canvas = Array.from(document.querySelectorAll('canvas')).find(c => c.dataset.authored === id0);
    const wrap = canvas && (canvas.closest('.pv-wrap') || canvas.parentElement);
    const groups = wrap ? Array.from(wrap.querySelectorAll('[role="group"][aria-label]')) : [];
    const find = label => {
      const g = groups.find(x => x.getAttribute('aria-label') === label);
      return g ? Array.from(g.querySelectorAll('button')).map(b => (b.textContent || '').trim()) : null;
    };
    return { display: find('显示'), views: find('视角') };
  }, id);
  report.visual.controls = { display: available.display, views: available.views, requiredDisplay: ['原材质', '纯灰几何', '结构线框'], requiredViews, status: 'PASS' };
  for (const label of ['原材质', '纯灰几何', '结构线框']) if (!available.display || !available.display.includes(label)) { report.visual.controls.status = 'FAIL'; throw new Error(`缺少预览控件：显示/${label}`); }
  for (const label of requiredViews) if (!available.views || !available.views.includes(label)) { report.visual.controls.status = 'FAIL'; throw new Error(`缺少预览控件：视角/${label}`); }
  for (const [display, view, filename] of shots) {
    await clickPreviewControl(page, id, '显示', display);
    await clickPreviewControl(page, id, '视角', view);
    const target = path.join(outDir, filename);
    const preview = page.locator('#pvHost');
    await preview.screenshot({ path: target });
    const stat = fs.statSync(target);
    if (!stat.size) throw new Error(`截图为空：${filename}`);
    report.visual.screenshots.push({ file: filename, display, view, bytes: stat.size,
      sha256: hashFile(target), viewport: page.viewportSize(),
      renderer: await page.evaluate(() => ({ revision: window.THREE && window.THREE.REVISION, scope: 'catalog-studio' })),
      assetId: id, sourceHash: report.catalog.publicApi.item.sourceHash,
      contractHash: sha256(report.catalog.publicApi.item.contract),
      options: await page.locator('canvas[data-authored]').evaluate(el => el.dataset.authoredOptions || null),
      camera: await page.locator('canvas[data-authored]').evaluate(el => el.dataset.authoredCamera || null) });
  }
}

async function repeatMounts(page, id, report) {
  const cycles = [];
  for (let i = 1; i <= 3; i += 1) {
    await page.evaluate(() => { location.hash = '#/'; });
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.evaluate(assetId => { location.hash = '#/a/' + encodeURIComponent(assetId); }, id);
    await waitForAuthoredPage(page, id);
    cycles.push(i);
  }
  const counters = await page.evaluate(() => window.__AUTHORED_VERIFY_COUNTERS || null);
  report.runtime.mountCycles = { attempted: 3, completed: cycles.length, hookCounters: counters, status: cycles.length === 3 ? 'limitedpass' : 'FAIL' };
  if (cycles.length !== 3) throw new Error('页面重复挂载未完成3轮');
}

async function run(args, outDir) {
  const report = emptyReport(args, outDir);
  report.projectFilesBefore = projectFileSnapshot(args.root, null);
  let browser = null;
  let context = null;
  let page = null;
  try {
    let playwright;
    try { playwright = require(args.playwright); } catch (e) { throw new Error(`无法加载 --playwright 包：${e.message || e}`); }
    if (!playwright || !playwright.chromium) throw new Error('--playwright 路径未提供带 chromium 的 Playwright 包');
    browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });
    const base = new URL(args.baseUrl);
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await context.route('**/*', async route => {
      const u = new URL(route.request().url());
      const localScheme = ['data:', 'blob:', 'about:'].includes(u.protocol);
      const sameOrigin = u.origin === base.origin && u.protocol === base.protocol;
      const sameFileRoot = base.protocol === 'file:' && u.protocol === 'file:' && u.pathname.startsWith(path.resolve(args.root) + path.sep);
      if (!localScheme && !sameOrigin && !sameFileRoot) {
        report.network.externalRejected.push(u.href);
        await route.abort();
        return;
      }
      await route.continue();
    });
    page = await context.newPage();
    page.on('console', msg => {
      const rec = { type: msg.type(), text: msg.text(), location: msg.location() };
      report.pageConsole.push(rec);
      if (msg.type() === 'error') report.errors.push('console.error: ' + msg.text());
      if (/shader|webgl|glsl|program|compile|link/i.test(msg.text())) report.shaderMessages.push(rec);
    });
    page.on('pageerror', error => report.errors.push('pageerror: ' + (error && error.stack || error && error.message || error)));
    page.on('requestfailed', request => {
      const message = `${request.url()} :: ${request.failure() && request.failure().errorText || 'request failed'}`;
      report.network.failed.push(message);
      report.errors.push('requestfailed: ' + message);
    });

    const baseNoHash = new URL(args.baseUrl);
    baseNoHash.hash = '';
    await page.goto(baseNoHash.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(100);
    const publicInfo = await page.evaluate(id => {
      const item = window.AUTHORED_CATALOG && Array.isArray(window.AUTHORED_CATALOG.items) ? window.AUTHORED_CATALOG.items.find(x => x && x.id === id) : null;
      const b = window.AUTHORED_BUILDERS && window.AUTHORED_BUILDERS[id];
      return {
        catalog: !!window.AUTHORED_CATALOG,
        item: item ? { id: item.id, source: item.source, sourceHash: item.sourceHash, anchor: item.anchor, contract: item.contract, acceptance: item.acceptance } : null,
        builder: b ? { type: typeof b, hasBuild: typeof b.build === 'function', keys: Object.keys(b).sort() } : null,
        authoredContext: !!(window.PREVIEWS && typeof window.PREVIEWS.authoredContext === 'function'),
        inspectAuthored: !!(window.PREVIEWS && typeof window.PREVIEWS.inspectAuthored === 'function'),
        inspectResult: null,
        publicContract: {
          authoredContext: 'window.PREVIEWS.authoredContext(id, options) => { THREE, kit, mats, rng, sharedMaterials: Set<THREE.Material> }',
          inspectAuthored: 'window.PREVIEWS.inspectAuthored(id, options) => object | Promise<object>（仅检查公开返回形状）',
          builder: 'window.AUTHORED_BUILDERS[id] => { build }',
          catalog: 'window.AUTHORED_CATALOG.items[] => { id, contract, acceptance }',
        },
      };
    }, args.id);
    report.catalog.publicApi = publicInfo;
    if (!publicInfo.item) addFailure(report, `AUTHORED_CATALOG.items 缺少 ${args.id}`);
    if (!publicInfo.builder || !publicInfo.builder.hasBuild) addFailure(report, `AUTHORED_BUILDERS[${args.id}].build 缺失`);
    if (!publicInfo.authoredContext) addFailure(report, 'PREVIEWS.authoredContext(id, options) 缺失');
    if (!publicInfo.inspectAuthored) addFailure(report, 'PREVIEWS.inspectAuthored(id, options) 缺失');
    if (publicInfo.item) {
      report.catalog.entry = publicInfo.item;
      const source = publicInfo.item.source || (typeof publicInfo.item.anchor === 'string' && publicInfo.item.anchor.startsWith('assets/authored/') ? publicInfo.item.anchor.slice('assets/authored/'.length) : null);
      report.catalog.entry.source = source;
      report.projectFilesBefore = projectFileSnapshot(args.root, source);
      const localSource = path.resolve(args.root, 'assets/authored', source || '');
      const localHash = hashFile(localSource);
      if (!localHash || publicInfo.item.sourceHash !== localHash) addFailure(report, '页面 sourceHash 与 --root 本地 source 不匹配；拒绝验证另一个项目或陈旧构建');
      const registry = JSON.parse(fs.readFileSync(path.join(args.root, 'assets/authored/registry.json'), 'utf8'));
      const localEntry = registry.assets && registry.assets.find(x => x.id === args.id);
      if (!localEntry || JSON.stringify(stable(localEntry.contract)) !== JSON.stringify(stable(publicInfo.item.contract))) addFailure(report, '页面契约与本地 registry 不一致，需重新构建');
      if (!publicInfo.item.contract || typeof publicInfo.item.contract !== 'object') addFailure(report, 'catalog contract 无效');
    }
    const contract = publicInfo.item && publicInfo.item.contract;
    const optionPlan = makeOptions(contract || {});
    if (publicInfo.inspectAuthored) {
      publicInfo.inspectResult = await page.evaluate(async ({ assetId, options }) => {
        try {
          const value = await window.PREVIEWS.inspectAuthored(assetId, options);
          const objectValue = value && typeof value === 'object' && !Array.isArray(value) ? value : null;
          return {
            ok: !!objectValue,
            shape: objectValue ? Object.keys(objectValue).sort() : typeof value,
            ...(objectValue ? {} : { error: 'inspectAuthored 未返回可用对象' }),
          };
        } catch (e) {
          return { ok: false, error: String(e && e.message || e) };
        }
      }, { assetId: args.id, options: optionPlan.defaults });
      report.catalog.publicApi.inspectResult = publicInfo.inspectResult;
      if (!publicInfo.inspectResult.ok) addFailure(report, 'PREVIEWS.inspectAuthored 调用失败：' + publicInfo.inspectResult.error);
    }
    const wrapped = await page.evaluate(installWrapperSource(), args.id);
    if (!wrapped.ok) addFailure(report, wrapped.reason);
    const target = new URL(baseNoHash.href);
    target.hash = '#/a/' + encodeURIComponent(args.id);
    await page.evaluate(url => { location.href = url; }, target.href);
    await waitForAuthoredPage(page, args.id);

    if (publicInfo.item && publicInfo.builder && publicInfo.builder.hasBuild && publicInfo.authoredContext) {
      const result = await page.evaluate(pageUtilitySource(), {
        id: args.id,
        contract,
        baseOptions: optionPlan.defaults,
        variantOptions: optionPlan.variants,
      });
      report.catalog.contract = result.catalog.contract;
      report.geometry.checks = result.checks;
      report.geometry.warnings = result.warnings;
      report.geometry.determinism = { equal: result.deterministic.equal, firstSha256: sha256(result.deterministic.first), secondSha256: sha256(result.deterministic.second) };
      report.geometry.normalized = { firstSha256: report.geometry.determinism.firstSha256, secondSha256: report.geometry.determinism.secondSha256 };
      report.geometry.variants = result.variants.map(v => ({ ...v, normalizedSha256: sha256(v) }));
      report.runtime.dynamic = result.runtime.dynamic;
      report.runtime.hookPresence = result.runtime.hookPresence;
      report.runtime.updateSamples = result.runtime.updateSamples.map(x => ({ dt: x.dt, stateSha256: sha256(x.state) }));
      report.runtime.resetMatchesBaseline = result.runtime.resetMatchesBaseline;
      report.runtime.dispose = result.runtime.dispose;
      report.runtime.builderHookCounters = result.hookCounters;
      report.geometry.materialNames = result.materialNames;
      for (const failure of result.failures) addFailure(report, failure);
      report.geometry.status = result.failures.length ? 'FAIL' : 'PASS';
      report.runtime.status = result.failures.some(x => /dynamic|reset|dispose|hook/.test(x)) ? 'FAIL' : 'limitedpass';
      report.catalog.status = 'UNVERIFIED';
      report.catalog.fullPass = false;
    }

    try {
      await captureVisuals(page, args.id, outDir, report);
    } catch (e) {
      report.visual.controls.status = report.visual.controls.status === 'FAIL' ? 'FAIL' : 'FAIL';
      addFailure(report, e.message || String(e));
    }
    try { await repeatMounts(page, args.id, report); } catch (e) { addFailure(report, e.message || String(e)); }
  } catch (e) {
    addFailure(report, e && e.message || String(e));
    report.errors.push('runner: ' + (e && e.stack || e && e.message || e));
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    if (context) {
      try { await context.close(); } catch (_) {}
    }
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
  }
  if (report.network.externalRejected.length) addFailure(report, '检测到外部网络请求，已拒绝');
  if (report.errors.length) addFailure(report, '页面存在 error/pageerror/requestfailed');
  if (report.shaderMessages.some(x => x.type === 'error' || /error|fail|invalid|compile|link/i.test(x.text))) addFailure(report, '检测到 shader/WebGL 错误消息');
  if (report.visual.screenshots.length < 5) addFailure(report, '真实页面截图少于5张');
  report.automaticChecks.passed = report.automaticChecks.failures.length === 0 && report.geometry.status === 'PASS' && report.runtime.status !== 'FAIL';
  report.visual.status = 'UNVERIFIED';
  report.projectFilesAfter = projectFileSnapshot(args.root, report.catalog.entry && report.catalog.entry.source);
  const changedProjectFiles = Object.keys(report.projectFilesAfter).filter(k => JSON.stringify(report.projectFilesBefore[k]) !== JSON.stringify(report.projectFilesAfter[k]));
  if (changedProjectFiles.length) addFailure(report, '验证期间项目文件发生变化：' + changedProjectFiles.join(', '));
  report.automaticChecks.passed = report.automaticChecks.failures.length === 0 && report.geometry.status === 'PASS' && report.runtime.status !== 'FAIL';
  report.normalizedReportSha256 = sha256({ id: report.id, catalog: report.catalog, geometry: report.geometry, runtime: report.runtime, visual: { screenshots: report.visual.screenshots, controls: report.visual.controls } });
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  process.stdout.write(JSON.stringify({ report: path.join(outDir, 'report.json'), automaticChecks: report.automaticChecks, visual: report.visual.status }, null, 2) + '\n');
  return report.automaticChecks.passed ? 0 : 1;
}

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) { process.stdout.write(USAGE); return; }
    const root = realExisting(path.resolve(args.root), '--root');
    args.root = root;
    if (!fs.existsSync(args.playwright)) throw new Error('--playwright 路径不存在：' + args.playwright);
    const outDir = ensureOutputDir(root, args.outDir);
    const code = await run(args, outDir);
    process.exitCode = code;
  } catch (e) {
    die(e && e.message || String(e));
  }
})();
