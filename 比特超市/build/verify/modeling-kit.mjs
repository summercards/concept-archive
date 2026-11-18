/**
 * 程序化建模工具 · Aurora-ModelKit
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html
 *   metricBox   L5453  function p3()      倒角盒 + 米制 UV（72 顶点，每面独立法线）
 *   bevelBox    L5453  function Wi()      八顶点推入式倒角盒
 *   cylinder    L5453  function ot()      米制侧面积 UV 的圆柱
 *   tube        L5453  function Fn()      米制 UV 的样条管
 *   place       L5453  function je()      就地变换
 *   vertexColor L5453  function Lc()      按位写顶点色
 *   merge       L5453  function Ii()      属性归一后合并
 *   Builder     L5453  var jn = class      建模器：按材质分桶，最后成组
 *   batch       L5453  function By()      静态合批（noMerge 例外）
 *
 * 这一层是"模型资产"的真正来源：道具不是导入的，是被这些函数算出来的。
 * 抽成独立模块后，任何一个道具构造器都能脱离关卡、脱离游戏单独跑。
 *
 * 依赖：THREE（含 addons 的 mergeGeometries），材质由 mats 适配器注入。
 */

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/* --------------------------------------------------------------- 几何原语 */

/**
 * 倒角盒。24 个顶点（8 角 × 3 个面各一份），因此每个面都有硬边法线，
 * 倒角不会被平滑成球面。UV 按"米"直接投：取该顶点的另外两个坐标。
 * anchor="bottom" 时把几何抬起 h/2，让原点落在底面中心——这是全项目的约定。
 */
export function metricBox(w, h, d, bevel = 0.01, anchor = "center") {
  const b = Math.max(0.0005, Math.min(bevel, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const hw = w / 2, hh = h / 2, hd = d / 2;

  const position = new Float32Array(24 * 3);
  const normal = new Float32Array(24 * 3);
  const uv = new Float32Array(24 * 2);

  // 每个角三个顶点：分别属于 x / y / z 三个面
  const vId = (sx, sy, sz, axis) =>
    ((sx > 0 ? 1 : 0) + (sy > 0 ? 2 : 0) + (sz > 0 ? 4 : 0)) * 3 + axis;

  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
    const pts = [
      [x * hw, y * (hh - b), z * (hd - b)],
      [x * (hw - b), y * hh, z * (hd - b)],
      [x * (hw - b), y * (hh - b), z * hd],
    ];
    const nrm = [[x, 0, 0], [0, y, 0], [0, 0, z]];
    for (let a = 0; a < 3; a++) {
      const id = vId(x, y, z, a);
      position.set(pts[a], id * 3);
      normal.set(nrm[a], id * 3);
      // 米制 UV：轴 0 取 (z,y)，轴 1 取 (x,z)，轴 2 取 (x,y)
      if (a === 0) uv.set([pts[a][2], pts[a][1]], id * 2);
      else if (a === 1) uv.set([pts[a][0], pts[a][2]], id * 2);
      else uv.set([pts[a][0], pts[a][1]], id * 2);
    }
  }

  // 用面法线与形心方向判定朝向，自动纠正绕序
  const idx = [];
  const tri = (a, b, c) => {
    const ax = position[a * 3], ay = position[a * 3 + 1], az = position[a * 3 + 2];
    const bx = position[b * 3] - ax, by = position[b * 3 + 1] - ay, bz = position[b * 3 + 2] - az;
    const cx = position[c * 3] - ax, cy = position[c * 3 + 1] - ay, cz = position[c * 3 + 2] - az;
    const nx = by * cz - bz * cy;
    const ny = bz * cx - bx * cz;
    const nz = bx * cy - by * cx;
    const mx = ax + (bx + cx) / 3;
    const my = ay + (by + cy) / 3;
    const mz = az + (bz + cz) / 3;
    if (nx * mx + ny * my + nz * mz >= 0) idx.push(a, b, c);
    else idx.push(a, c, b);
  };
  const quad = (a, b, c, d) => { tri(a, b, c); tri(a, c, d); };

  const ring = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

  // 6 个主面
  for (const s of [-1, 1]) {
    quad(...ring.map(([u, v]) => vId(s, u, v, 0)));
    quad(...ring.map(([u, v]) => vId(u, s, v, 1)));
    quad(...ring.map(([u, v]) => vId(u, v, s, 2)));
  }
  // 12 条倒角带
  for (const u of [-1, 1]) for (const v of [-1, 1]) {
    quad(vId(-1, u, v, 1), vId(1, u, v, 1), vId(1, u, v, 2), vId(-1, u, v, 2));
    quad(vId(u, -1, v, 0), vId(u, 1, v, 0), vId(u, 1, v, 2), vId(u, -1, v, 2));
    quad(vId(u, v, -1, 0), vId(u, v, 1, 0), vId(u, v, 1, 1), vId(u, v, -1, 1));
  }
  // 8 个角三角
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
    tri(vId(x, y, z, 0), vId(x, y, z, 1), vId(x, y, z, 2));
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normal, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  if (anchor === "bottom") g.translate(0, h / 2, 0);
  return g;
}

/**
 * 推入式倒角盒：先建 3×3×3 分段的盒，再按"离边距离"把顶点往里推 b，
 * 边角顶点沿外法线重投影。面是平滑过渡的，适合需要软倒角的近景。
 */
export function bevelBox(w, h, d, bevel = 0.02, anchor = "center") {
  const b = Math.min(bevel, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3);
  const pos = g.attributes.position;
  const nrm = g.attributes.normal;
  const uv = g.attributes.uv;
  const c = w / 2, y = h / 2, z = d / 2;
  const push = (p, half) => {
    const a = Math.abs(p);
    return a > half - 1e-5 ? Math.sign(p) * half : Math.sign(p) * (half - b);
  };
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const px = push(pos.getX(i), c), py = push(pos.getY(i), y), pz = push(pos.getZ(i), z);
    const cx = Math.max(-(c - b), Math.min(c - b, px));
    const cy = Math.max(-(y - b), Math.min(y - b, py));
    const cz = Math.max(-(z - b), Math.min(z - b, pz));
    n.set(px - cx, py - cy, pz - cz);
    let ox = px, oy = py, oz = pz;
    if (n.lengthSq() > 1e-10) {
      n.normalize();
      const onEdge = (Math.abs(px) > c - 1e-5 ? 1 : 0)
        + (Math.abs(py) > y - 1e-5 ? 1 : 0)
        + (Math.abs(pz) > z - 1e-5 ? 1 : 0) >= 2;
      if (onEdge) {
        ox = cx + n.x * b; oy = cy + n.y * b; oz = cz + n.z * b;
        nrm.setXYZ(i, n.x, n.y, n.z);
      }
    }
    // 无论是否落在边上都要回写，否则中间顶点会留在原始位置
    pos.setXYZ(i, ox, oy, oz);
    // 米制 UV：正面投影到另外两轴
    const ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));
    if (ax >= ay && ax >= az) uv.setXY(i, oz, oy);
    else if (ay >= ax && ay >= az) uv.setXY(i, ox, oz);
    else uv.setXY(i, ox, oy);
  }
  // 原版不重算法线：被推过的边缘顶点用重投影法线，其余保留盒面法线
  if (anchor === "bottom") g.translate(0, h / 2, 0);
  return g;
}

/**
 * 圆柱：侧面 v 直接取顶点 Y（米），u 乘周长（米）——原版的 CylinderGeometry
 * 已被补丁成米制 v，因此这里必须按 y 还原，而不是沿用 three 的 0-1 归一化。
 */
export function cylinder(rTop, rBottom, h, seg = 16, open = false, anchor = "center") {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open);
  const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;
  const around = Math.PI * (rTop + rBottom);
  for (let i = 0; i < uv.count; i++) {
    if (Math.abs(nrm.getY(i)) > 0.9) uv.setXY(i, pos.getX(i), pos.getZ(i));
    else uv.setXY(i, uv.getX(i) * around, pos.getY(i));
  }
  if (anchor === "bottom") g.translate(0, h / 2, 0);
  return g;
}

/** 样条管：CatmullRom 采样后按弧长与周长做米制 UV。 */
export function tube(points, radius = 0.03, seg = 8, closed = false, tension = 0) {
  const pts = points.map((p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2])));
  const curve = new THREE.CatmullRomCurve3(pts, closed, "catmullrom", tension);
  const len = curve.getLength();
  const steps = Math.max(2, Math.ceil(len / Math.max(0.08, radius * 3)));
  const g = new THREE.TubeGeometry(curve, Math.min(steps, 400), radius, seg, closed);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len, uv.getY(i) * Math.PI * 2 * radius);
  return g;
}

/** 就地变换：先应用矩阵再返回同一对象（避免大量 clone）。 */
export function place(geom, x = 0, y = 0, z = 0, rot = null) {
  const q = new THREE.Quaternion();
  if (rot) q.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)
  );
  geom.applyMatrix4(m);
  return geom;
}

/** 顶点色。传函数则按位置求色，传数组则整体一个色。 */
export function vertexColor(geom, col) {
  const pos = geom.attributes.position;
  const n = pos.count;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const c = typeof col === "function" ? col(pos.getX(i), pos.getY(i), pos.getZ(i)) : col;
    out[i * 3] = c[0]; out[i * 3 + 1] = c[1]; out[i * 3 + 2] = c[2];
  }
  geom.setAttribute("color", new THREE.Float32BufferAttribute(out, 3));
  return geom;
}

/**
 * 合并。先补齐 uv/normal/color，再统一索引状态，最后交给 mergeGeometries。
 * 关键点：属性集必须一致，否则合并会静默丢数据。
 */
export function merge(geoms) {
  const list = geoms.filter(Boolean).map((g) => {
    if (!g.attributes.uv) {
      g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    return g;
  });
  if (!list.length) return new THREE.BufferGeometry();

  const anyColor = list.some((g) => g.attributes.color);
  const norm = list.map((g) => {
    if (anyColor && !g.attributes.color) {
      const white = new Float32Array(g.attributes.position.count * 3).fill(1);
      g.setAttribute("color", new THREE.Float32BufferAttribute(white, 3));
    }
    for (const key of Object.keys(g.attributes)) {
      if (!["position", "normal", "uv", "color"].includes(key)) g.deleteAttribute(key);
    }
    return g;
  });

  const allIndexed = norm.every((g) => g.index);
  const noneIndexed = norm.every((g) => !g.index);
  const ready = allIndexed || noneIndexed ? norm : norm.map((g) => (g.index ? g.toNonIndexed() : g));
  return mergeGeometries(ready, false) || new THREE.BufferGeometry();
}

export function plane(w, h) { return new THREE.PlaneGeometry(w, h); }

/** 带 UV 缩放的平面：贴图按"米"重复，而不是 0-1。 */
export function planeUV(w, h) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
  return g;
}

export function toNonIndexed(geom) {
  const g = geom.index ? geom.toNonIndexed() : geom;
  g.computeVertexNormals();
  return g;
}

/* ----------------------------------------------------------------- 建模器 */

/**
 * 建模器：所有 add 进同一个材质桶的几何最后被合成一个 Mesh。
 * 好处是 drawcall = 材质数；代价是零件失去独立变换——所以动态物件标 noMerge。
 *
 * mats 适配器需要提供 get(name, opts) → THREE.Material。
 */
export class Builder {
  constructor(ctx) {
    this.ctx = ctx;
    this.buckets = new Map();
    this.stack = [];
    this.m = null;
    this.defCol = new Map();
  }

  M(name, opts) { return this.ctx.mats.get(name, opts); }

  /** 压入一个局部变换（相对于当前） */
  push(mat4) {
    this.stack.push(this.m);
    this.m = this.m ? this.m.clone().multiply(mat4) : mat4.clone();
    return this;
  }

  pop() { this.m = this.stack.pop(); return this; }

  add(mat, geom, col, noCast) {
    if (this.m) geom.applyMatrix4(this.m);
    const c = col || this.defCol.get(mat);
    if (c) vertexColor(geom, c);
    let bucket = this.buckets.get(mat);
    if (!bucket) {
      bucket = { mat, geos: [], cast: !noCast };
      this.buckets.set(mat, bucket);
    }
    bucket.geos.push(geom);
    return geom;
  }

  /** 盒：r=0 时退化成无倒角盒（省顶点） */
  box(mat, w, h, d, x, y, z, o = {}) {
    const bevel = o.r === 0 ? null : (o.r || Math.min(0.012, Math.min(w, h, d) * 0.25));
    const g = bevel === null
      ? new THREE.BoxGeometry(w, h, d)
      : metricBox(w, h, d, bevel);
    return this.add(mat, place(g, x, y, z, o.rot), o.col);
  }

  cyl(mat, rTop, rBot, h, x, y, z, o = {}) {
    let g = cylinder(rTop, rBot, h, o.seg || 12, !!o.open);
    if (o.flat) g = toNonIndexed(g);
    return this.add(mat, place(g, x, y, z, o.rot), o.col);
  }

  tube(mat, points, radius, o = {}) {
    return this.add(mat, tube(points, radius, o.seg || 6, false, o.tension === undefined ? 0.5 : o.tension), o.col);
  }

  /** 两点之间的圆杆 */
  bar(mat, a, b, radius, o = {}) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const len = d.length();
    const g = cylinder(o.r2 === undefined ? radius : o.r2, radius, len, o.seg || 6, !o.caps);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), q, new THREE.Vector3(1, 1, 1)
    ));
    return this.add(mat, g, o.col);
  }

  /** 两点之间的方梁（钢结构的主力） */
  beam(mat, a, b, w, h, o = {}) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const len = d.length();
    const g = o.r === 0
      ? new THREE.BoxGeometry(w, len, h)
      : metricBox(w, len, h, o.r || Math.min(w, h) * 0.2);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    if (o.twist) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), o.twist));
    g.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), q, new THREE.Vector3(1, 1, 1)
    ));
    return this.add(mat, g, o.col);
  }

  /** 贴花：不投影阴影，直接用 decal 材质 */
  decal(tex, size, x, y, z, rot, aspect, tint) {
    const w = aspect || size * tex.aspect;
    return this.add(tex.material, place(plane(w, size), x, y, z, rot), null, true);
  }

  /** 按材质分桶出包：{mat, geo, cast} */
  parts() {
    const out = [];
    for (const b of this.buckets.values()) {
      out.push({ mat: b.mat, geo: merge(b.geos), cast: b.cast });
    }
    return out;
  }

  group(override) {
    const g = new THREE.Group();
    for (const p of this.parts()) {
      const mesh = new THREE.Mesh(p.geo, (override && override.get(p.mat)) || p.mat);
      mesh.castShadow = p.cast;
      mesh.receiveShadow = true;
      g.add(mesh);
    }
    return g;
  }
}

/** 把 size/colliders 挂到 object.userData 上——资产与碰撞一起走。 */
export function annotate(obj, name, size, colliders) {
  obj.userData.size = size;
  obj.userData.colliders = colliders;
  obj.name = name;
  return obj;
}

/**
 * 静态合批：同材质 + 同阴影设置 + 同 layer 的网格合并成一个。
 * userData.noMerge 及其子树会被跳过（动态物件靠这个逃生）。
 */
export function batch(root, { castShadow = true, receiveShadow = true } = {}) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  const keep = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    let p = o, skip = false;
    while (p) {
      if (p.userData && p.userData.noMerge) { skip = true; break; }
      p = p.parent;
    }
    if (skip || o.isSkinnedMesh || o.isInstancedMesh || Array.isArray(o.material)) {
      keep.push(o);
      return;
    }
    const key = o.material.uuid + (o.castShadow ? "c" : "n") + (o.receiveShadow ? "r" : "n") + ":" + o.layers.mask;
    if (!groups.has(key)) {
      groups.set(key, { mat: o.material, geos: [], cast: o.castShadow, recv: o.receiveShadow, layers: o.layers.mask });
    }
    const g = o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    groups.get(key).geos.push(g);
  });

  const out = new THREE.Group();
  for (const g of groups.values()) {
    const mesh = new THREE.Mesh(merge(g.geos), g.mat);
    mesh.castShadow = g.cast && castShadow;
    mesh.receiveShadow = g.recv && receiveShadow;
    mesh.layers.mask = g.layers;
    out.add(mesh);
  }
  for (const m of keep) {
    m.updateMatrixWorld(true);
    const world = m.matrixWorld.clone();
    out.add(m);
    m.matrix.copy(world);
    m.matrix.decompose(m.position, m.quaternion, m.scale);
  }
  return out;
}

export default { metricBox, bevelBox, cylinder, tube, place, vertexColor, merge, plane, planeUV, toNonIndexed, Builder, annotate, batch };
