import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const ROOT = '/Users/zyq/WorkBuddy/2026-11-15-17-10-04';
const OUT = path.join(ROOT, 'outputs/nordic-spruce');
const hashFile = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'vendor/three.global.js'), 'utf8'), sandbox);
const T = sandbox.window.THREE;
assert.equal(String(T.REVISION), '160');
const { build } = await import(pathToFileURL(path.join(ROOT, 'assets/authored/nordic-spruce.js')).href);
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/authored/registry.json'), 'utf8'));
const entry = registry.assets.find(x => x.id === 'new.nordic-spruce');
const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/authored/contracts/nordic-spruce.json'), 'utf8'));
assert.deepEqual(entry.contract, contract.registryEntry.contract);
const rows = [];
function inspect(seed) {
  let n = seed >>> 0;
  const ctx = { THREE: T, sharedMaterials: new Set(), rng: () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; } };
  const start = performance.now();
  const root = build(ctx, { seed });
  assert(root.isObject3D && root.userData.authored && root.userData.assetId === entry.id);
  root.updateMatrixWorld(true);
  const digest = crypto.createHash('sha256');
  const bbox = new T.Box3(); bbox.makeEmpty();
  let meshes = 0, vertices = 0, triangles = 0, degenerates = 0;
  const materials = new Set(); const geometries = new Set();
  const v = new T.Vector3();
  root.traverse(o => {
    assert(o.matrix.elements.every(Number.isFinite));
    assert(o.matrixWorld.elements.every(Number.isFinite));
    if (!o.isMesh) return;
    meshes++;
    digest.update(o.name); digest.update(JSON.stringify(o.matrixWorld.elements));
    const g = o.geometry, p = g.getAttribute('position'), normal = g.getAttribute('normal'), uv = g.getAttribute('uv');
    assert(p && normal && uv && normal.count === p.count && uv.count === p.count, o.name);
    geometries.add(g); vertices += p.count;
    for (const name of Object.keys(g.attributes).sort()) {
      const a = g.attributes[name];
      assert(a.array.every(Number.isFinite), o.name + ' ' + name + ' finite');
      digest.update(name); digest.update(String(a.itemSize));
      digest.update(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength));
    }
    for (let i = 0; i < normal.count; i++) assert(Math.abs(Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) - 1) < .001, o.name + ' normal');
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); bbox.expandByPoint(v); }
    const index = g.index, count = index ? index.count : p.count;
    assert.equal(count % 3, 0); triangles += count / 3;
    if (index) {
      assert(index.array.every(i => Number.isInteger(i) && i >= 0 && i < p.count));
      digest.update(Buffer.from(index.array.buffer, index.array.byteOffset, index.array.byteLength));
    }
    for (let j = 0; j < count; j += 3) {
      const a = index ? index.getX(j) : j, b = index ? index.getX(j + 1) : j + 1, c = index ? index.getX(j + 2) : j + 2;
      const ax = p.getX(b) - p.getX(a), ay = p.getY(b) - p.getY(a), az = p.getZ(b) - p.getZ(a);
      const bx = p.getX(c) - p.getX(a), by = p.getY(c) - p.getY(a), bz = p.getZ(c) - p.getZ(a);
      if ((ay*bz-az*by)**2 + (az*bx-ax*bz)**2 + (ax*by-ay*bx)**2 <= 1e-18) degenerates++;
    }
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      assert(entry.contract.materials.includes(m.name)); materials.add(m);
      digest.update(JSON.stringify({ name:m.name, color:m.color.toArray(), roughness:m.roughness, metalness:m.metalness, side:m.side }));
    }
  });
  assert.equal(degenerates, 0);
  const size = bbox.getSize(new T.Vector3()).toArray();
  size.forEach((x,i) => { assert(Math.abs(x - entry.contract.size[i]) < .01); assert(Math.abs(x - root.userData.size[i]) < .001); });
  assert(Math.abs(bbox.min.y) < .01 && Math.abs(bbox.min.x + bbox.max.x) < .01 && Math.abs(bbox.min.z + bbox.max.z) < .01);
  assert(meshes <= entry.contract.budget.maxMeshes && triangles <= entry.contract.budget.triangles);
  for (const name of entry.contract.requiredParts) {
    const part = root.getObjectByName(name); assert(part, name);
    let actual = 0; part.traverse(o => { if (o.isMesh) actual += o.geometry.attributes.position.count; }); assert(actual > 0, name);
  }
  const colliders = root.userData.colliders; assert.equal(colliders.length, 3);
  for (const col of colliders) {
    assert(col.surface === 'wood');
    for (let k=0;k<3;k++) assert(Number.isFinite(col.min[k]) && Number.isFinite(col.max[k]) && col.max[k] > col.min[k]);
    for (let mask=0;mask<8;mask++) {
      const p = new T.Vector3(...[0,1,2].map(k => mask & (1<<k) ? col.max[k] : col.min[k]));
      assert(bbox.clone().expandByScalar(.001).containsPoint(p));
    }
  }
  for (let i=1;i<colliders.length;i++) assert(Math.abs(colliders[i].min[1]-colliders[i-1].max[1]) < .001);
  for (const s of Object.values(root.userData.sockets)) assert(s.position.length === 3 && s.position.every(Number.isFinite));
  assert(Math.abs(root.userData.sockets.tip.position[1] - bbox.max.y) < .001);
  const metadata = { size:root.userData.size, colliders, sockets:root.userData.sockets, stats:root.userData.stats };
  digest.update(JSON.stringify(metadata));
  const sha256 = digest.digest('hex');
  const disposal = { geometry:0, material:0, secondCallAdditionalEvents:0 };
  geometries.forEach(g => g.addEventListener('dispose', () => disposal.geometry++));
  materials.forEach(m => m.addEventListener('dispose', () => disposal.material++));
  root.userData.dispose(); const events = disposal.geometry + disposal.material;
  root.userData.dispose(); disposal.secondCallAdditionalEvents = disposal.geometry + disposal.material - events;
  assert.equal(disposal.geometry, geometries.size); assert.equal(disposal.material, materials.size); assert.equal(disposal.secondCallAdditionalEvents, 0); assert.equal(ctx.sharedMaterials.size, 0);
  return { seed, status:'PASS', counts:{meshes,vertices,triangles,degenerateTriangles:degenerates,materials:materials.size}, size, bbox:{min:bbox.min.toArray(),max:bbox.max.toArray()}, sha256, stats:metadata.stats, colliders, sockets:metadata.sockets, disposal, buildAndCheckMs:Math.round(performance.now()-start) };
}
const first = inspect(7), repeated = inspect(7); assert.equal(first.sha256, repeated.sha256); rows.push(first);
for (const seed of [19,43]) { const row = inspect(seed); assert.notEqual(row.sha256, first.sha256); rows.push(row); }
const files = ['assets/authored/nordic-spruce.js','assets/authored/contracts/nordic-spruce.json','assets/authored/registry.json','assets/authored.js','previews.js','app.js','vendor/three.global.js'];
const result = { status:'PASS', assetId:entry.id, engine:T.REVISION, method:'同网页本地 r160 引擎，全属性TypedArray逐项校验和增量SHA256，不把完整浮点数组跨浏览器序列化。', sourceFiles:Object.fromEntries(files.map(f=>[f,hashFile(path.join(ROOT,f))])), sameSeedRebuildEqual:true, distinctSeedsDifferent:true, rows,
 automaticChecks:{passed:true,failures:[]}, visual:'UNVERIFIED', notExecuted:['通用verify_asset因全量JSON/导航中断，旧失败保留iteration1。此报告只替代几何数据及有限dispose检查，不冒充原通用验证全部完成。','GPU后期整机等价','风摆/LOD/大规模森林性能','完整内存趋势'] };
assert(fs.statSync(OUT).isDirectory());
fs.writeFileSync(path.join(OUT,'geometry-verification.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({status:result.status,engine:result.engine,deterministic:true,rows:rows.map(r=>({seed:r.seed,...r.counts,needles:r.stats.needles,timeMs:r.buildAndCheckMs}))},null,2));
