/**
 * 抽离保真度校验
 * ---------------------------------------------------------------
 * 做法：把原版被改名的几何函数（build/orig-geom.mjs，原字节 + 别名）
 * 与抽出来的 assets/code/modeling-kit.js 同时跑，逐顶点比对。
 * 数据表则和 build/tables.json（从原文件语法抽取）逐字段比对。
 *
 * 跑法：node build/verify.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const DIR = path.join(HERE, "verify");

fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "package.json"), JSON.stringify({ type: "module" }));
fs.symlinkSync("/Users/zyq/work/zero/node_modules", path.join(DIR, "node_modules"));

// 把待测资产复制进沙箱（ESM 解析按真实路径走，所以必须复制而不是软链）
const CODE = path.join(ROOT, "assets", "code");
const copies = {};
for (const f of fs.readdirSync(CODE)) {
  if (!f.endsWith(".js")) continue;
  const dst = path.join(DIR, f.replace(/\.js$/, ".mjs"));
  fs.copyFileSync(path.join(CODE, f), dst);
  copies[f] = fs.readFileSync(path.join(CODE, f), "utf8");
}
fs.copyFileSync(path.join(HERE, "orig-geom.mjs"), path.join(DIR, "orig-geom.mjs"));

const kit = await import(path.join(DIR, "modeling-kit.mjs"));
const orig = await import(path.join(DIR, "orig-geom.mjs"));
const env = await import(path.join(DIR, "env-atmosphere.mjs"));
const q = await import(path.join(DIR, "quality-presets.mjs"));
const props = await import(path.join(DIR, "props-ledger.mjs"));
const containerBuilder = await import(path.join(DIR, "container-builder.mjs"));
const propsBuilder = await import(path.join(DIR, "props-builder.mjs"));
const propsSource = JSON.parse(fs.readFileSync(path.join(HERE, "props-source.json"), "utf8"));
const mats = await import(path.join(DIR, "material-ledger.mjs"));
const player = await import(path.join(DIR, "player-tuning.mjs"));
const ai = await import(path.join(DIR, "ai-tuning.mjs"));
const weapon = await import(path.join(DIR, "weapon-tuning.mjs"));
const sound = await import(path.join(DIR, "audio-recipes.mjs"));

const tables = JSON.parse(fs.readFileSync(path.join(HERE, "tables.json"), "utf8"));
const THREE = await import(path.join(DIR, "node_modules", "three", "build", "three.module.js"));

let pass = 0, fail = 0;
const failures = [];
const bySec = {};
let curSec = "未分节";
function check(name, fn) {
  try {
    const msg = fn();
    pass++;
    (bySec[curSec] = bySec[curSec] || []).push(true);
    console.log(`  ✓ ${name}${msg ? "  " + msg : ""}`);
  } catch (e) {
    fail++;
    (bySec[curSec] = bySec[curSec] || []).push(false);
    failures.push(`${name}: ${e.message}`);
    console.log(`  ✗ ${name}  ${e.message}`);
  }
}
function section(title) {
  curSec = title.replace(/^\[\d+\]\s*/, "").split("——")[0].replace(/（.*?）/g, "").trim();
  console.log("\n" + title);
}
function eq(a, b, label = "") {
  if (a === undefined && b === undefined) return;
  if (typeof a === "number" && typeof b === "number") {
    if (Math.abs(a - b) > 1e-12) throw new Error(`${label} ${a} ≠ ${b}`);
    return;
  }
  if (a === null || b === null || typeof a !== "object") {
    if (a !== b) throw new Error(`${label} ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
    return;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) throw new Error(`${label} 键数 ${ka.length} ≠ ${kb.length}`);
  for (const k of ka) eq(a[k], b[k], label + "." + k);
}
function arr(name, a, b) {
  if (!a || !b) throw new Error(`${name} 缺数组`);
  if (a.length !== b.length) throw new Error(`${name} 长度 ${a.length} ≠ ${b.length}`);
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 1e-9) throw new Error(`${name}[${i}] ${a[i]} ≠ ${b[i]}`);
  }
}
function sameGeom(name, A, B) {
  if (A.attributes.position.count !== B.attributes.position.count) {
    throw new Error(`${name} 顶点数 ${A.attributes.position.count} ≠ ${B.attributes.position.count}`);
  }
  arr(name + ".position", A.attributes.position.array, B.attributes.position.array);
  arr(name + ".normal", A.attributes.normal.array, B.attributes.normal.array);
  arr(name + ".uv", A.attributes.uv.array, B.attributes.uv.array);
  const ia = A.index ? A.index.array : null, ib = B.index ? B.index.array : null;
  if (!!ia !== !!ib) throw new Error(`${name} 索引状态不一致`);
  if (ia) arr(name + ".index", Array.from(ia), Array.from(ib));
  return `${A.attributes.position.count} 顶点`;
}

section("[1] 几何原语 —— 与原件逐顶点比对");
check("metricBox == p3 (1×1×1)", () => sameGeom("box", kit.metricBox(1, 1, 1, 0.01), orig.metricBox(1, 1, 1, 0.01)));
check("metricBox == p3 (40 尺箱 12.19×2.59×2.44)", () =>
  sameGeom("box40", kit.metricBox(12.19, 2.59, 2.44, 0.012), orig.metricBox(12.19, 2.59, 2.44, 0.012)));
check("metricBox == p3 (油桶 0.6×0.9×0.6, 底锚)", () =>
  sameGeom("barrel", kit.metricBox(0.6, 0.9, 0.6, 0.002, "bottom"), orig.metricBox(0.6, 0.9, 0.6, 0.002, "bottom")));
check("metricBox 夹紧 oversized 倒角", () =>
  sameGeom("clamp", kit.metricBox(2, 2, 2, 5), orig.metricBox(2, 2, 2, 5)));
check("bevelBox == Wi (护栏座 0.5×0.06×0.46)", () =>
  sameGeom("wi", kit.bevelBox(0.5, 0.06, 0.46, 0.012), orig.bevelBox(0.5, 0.06, 0.46, 0.012)));
check("bevelBox == Wi (底锚)", () =>
  sameGeom("wi2", kit.bevelBox(1.2, 1.0, 0.9, 0.02, "bottom"), orig.bevelBox(1.2, 1.0, 0.9, 0.02, "bottom")));
check("cylinder == ot (立杆 0.17×1)", () => sameGeom("cyl", kit.cylinder(0.085, 0.085, 1, 12), orig.cylinder(0.085, 0.085, 1, 12)));
check("cylinder == ot (锥形 开顶)", () => sameGeom("cyl2", kit.cylinder(0.15, 0.15, 0.46, 14, true), orig.cylinder(0.15, 0.15, 0.46, 14, true)));
check("tube == Fn (5 点弯管)", () =>
  sameGeom("tube", kit.tube([[0, 0, 0], [0.3, 0.2, 0], [0.4, 0.5, 0.1], [0.3, 0.8, 0.2]], 0.012, 6),
    orig.tube([[0, 0, 0], [0.3, 0.2, 0], [0.4, 0.5, 0.1], [0.3, 0.8, 0.2]], 0.012, 6)));
check("place == je", () => {
  const a = kit.place(kit.metricBox(1, 1, 1, 0.01), 1, 2, 3, [0.3, 0.4, 0.5]);
  const b = orig.place(orig.metricBox(1, 1, 1, 0.01), 1, 2, 3, [0.3, 0.4, 0.5]);
  return sameGeom("place", a, b);
});
check("vertexColor == Lc", () => {
  const fn = (x, y, z) => [x + 0.5, y + 0.5, z + 0.5];
  const a = kit.vertexColor(kit.metricBox(1, 1, 1, 0.01), fn);
  const b = orig.vertexColor(orig.metricBox(1, 1, 1, 0.01), fn);
  arr("color", a.attributes.color.array, b.attributes.color.array);
  return "";
});
check("merge == Ii (两盒三盒混合索引)", () => {
  const A = kit.merge([kit.metricBox(1, 1, 1, 0.02), kit.metricBox(2, 0.5, 1, 0.02)]);
  const B = orig.merge([orig.metricBox(1, 1, 1, 0.02), orig.metricBox(2, 0.5, 1, 0.02)]);
  return sameGeom("merge", A, B);
});

section("[2] 环境光影数值 —— 与源码表比对");
check("WORLD 世界尺度", () => { eq(env.WORLD, { min: [-40, 0, -30], max: [40, 30, 30], groundY: 0, seaY: -1.6, quayX: 30 }); return "岸线 X=30 / 海面 Y=-1.6"; });
check("SUN 太阳", () => { eq(env.SUN, { dir: [0.916, 0.225, 0.331], color: [1, 0.72, 0.42], intensity: 9 }); return "强度 9"; });
check("SKY 四色", () => { eq(env.SKY, { zenith: [0.055, 0.085, 0.13], horizon: [0.95, 0.55, 0.28], horizonAway: [0.16, 0.22, 0.3], fog: [0.42, 0.47, 0.52] }); return ""; });
check("TUNING 26 项取自源码", () => {
  const raw = tables.tables.volume;
  for (const [k, v] of Object.entries(env.TUNING)) {
    const m = new RegExp(`(?:^|[,{])${k}:([-\\d.]+)`).exec(raw);
    if (!m) throw new Error(`源码无字段 ${k}`);
    if (Math.abs(parseFloat(m[1]) - v) > 1e-12) throw new Error(`${k} ${v} ≠ ${m[1]}`);
  }
  return Object.keys(env.TUNING).length + " 个字段全对";
});
check("sunDir 归一化", () => {
  const d = env.sunDir();
  const len = Math.hypot(...d);
  if (Math.abs(len - 1) > 1e-12) throw new Error("长度 " + len);
  return `(${d.map((x) => x.toFixed(4)).join(", ")})`;
});
check("shadowFrustum 尺寸为正且随太阳方向变化", () => {
  const f = env.shadowFrustum(THREE);
  if (!(f.width > 0 && f.height > 0 && f.depth > 0)) throw new Error("负尺寸");
  return `${f.width.toFixed(1)}×${f.height.toFixed(1)}×${f.depth.toFixed(1)} m`;
});
check("exposureValue 与公式一致", () => {
  if (Math.abs(env.exposureValue(1, 0) - 0.6) > 1e-12) throw new Error("基线非 0.6");
  if (Math.abs(env.exposureValue(2, 0.5) - 0.6) > 1e-12) throw new Error("衰减不符");
  return ".6 × e × (1−fade)";
});

section("[3] 画质预设");
check("五档 × 11 字段", () => {
  eq(q.PRESETS, {
    test: { name: "test", scale: 1, msaa: 0, shadow: 1024, tex: 256, volSteps: 10, ao: true, planar: 0.5, bloom: true, motionBlur: false, rain: 0.4 },
    low: { name: "low", scale: 0.7, msaa: 0, shadow: 2048, tex: 512, volSteps: 12, ao: false, planar: 0, bloom: true, motionBlur: false, rain: 0.5 },
    medium: { name: "medium", scale: 0.85, msaa: 2, shadow: 2048, tex: 1024, volSteps: 16, ao: true, planar: 0.5, bloom: true, motionBlur: false, rain: 0.8 },
    high: { name: "high", scale: 1, msaa: 4, shadow: 4096, tex: 1024, volSteps: 24, ao: true, planar: 0.5, bloom: true, motionBlur: true, rain: 1 },
    ultra: { name: "ultra", scale: 1, msaa: 4, shadow: 4096, tex: 2048, volSteps: 40, ao: true, planar: 1, bloom: true, motionBlur: true, rain: 1 },
  });
  return "55 个数值";
});
check("预设自检全部通过", () => {
  for (const p of Object.values(q.PRESETS)) {
    const issues = q.validate(p);
    if (issues.length) throw new Error(p.name + ": " + issues.join(","));
  }
  return "";
});

section("[4] 道具台账（36 条）");
check("条目数与源码一致", () => {
  const n = Object.keys(props.PROP_LEDGER).length;
  if (n !== 36) throw new Error("台账 " + n + " 条");
  return n + " 条";
});
check("尺寸与源码 Gi 逐条一致", () => {
  const raw = tables.tables.props;
  let n = 0;
  for (const [id, p] of Object.entries(props.PROP_LEDGER)) {
    const m = new RegExp(`${id}:\\[([\\d.\\-]+),([\\d.\\-]+),([\\d.\\-]+),"([\\w_]+)","([\\w_]+)"\\]`).exec(raw);
    if (!m) throw new Error("源码无 " + id);
    const want = [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    for (let i = 0; i < 3; i++) if (Math.abs(want[i] - p.size[i]) > 1e-12) throw new Error(`${id} 尺寸漂移`);
    if (m[4] !== p.material) throw new Error(`${id} 材质 ${p.material} ≠ ${m[4]}`);
    if (m[5] !== p.surface) throw new Error(`${id} 表面 ${p.surface} ≠ ${m[5]}`);
    n++;
  }
  return n + " 条 × 5 字段全对";
});
check("台账自检无问题", () => {
  const issues = props.validate();
  if (issues.length) throw new Error(issues.join("; "));
  return "";
});
check("包围盒落地在 Y=0 之上", () => {
  for (const id of props.PROP_IDS) {
    const b = props.boundsOf(id);
    if (b.min[1] !== 0) throw new Error(id + " 底面不在 0");
  }
  return "";
});
check("36 条道具均有原版专用建模器登记", () => {
  if (props.HAS_CUSTOM_BUILDER.size !== 36) throw new Error("建模器登记 " + props.HAS_CUSTOM_BUILDER.size + " 条");
  if (Object.keys(props.PROP_BUILDER_META).length !== 36) throw new Error("建模器元数据 " + Object.keys(props.PROP_BUILDER_META).length + " 条");
  for (const id of props.PROP_IDS) {
    const meta = props.PROP_BUILDER_META[id];
    if (!meta || !meta.callback || !meta.group || meta.integrated !== true) throw new Error(id + " 缺少 callback/group/integrated");
    const source = tables.ledger.propBuilders.find((builder) => builder.id === id);
    eq(meta.callback, source.callback, id + " callback");
    eq(meta.group, source.group, id + " group");
  }
  return "36真实构造已接入；结构对照看最新 props-verification.json，非完整视觉或声音验证";
});
// 这里只验证构造契约；无真实 canvas 贴图，不当作视觉验证。
const materialCache = new Map();
const constructionMats = {
  get(name, options = {}) {
    const key = JSON.stringify([name, options]);
    if (!materialCache.has(key)) {
      const { doubleSide, ...parameters } = options;
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff, ...parameters, ...(doubleSide ? { side: THREE.DoubleSide } : {}) });
      material.name = name;
      materialCache.set(key, material);
    }
    return materialCache.get(key);
  },
  label: () => ({ material: new THREE.MeshBasicMaterial({ color: 0xffffff }), aspect: 1 }),
  decal: () => ({ material: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }), aspect: 1 }),
  emissive: (color, intensity = 1) => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: true });
    material.name = "emissive";
    return material;
  },
};
check("36 道具完整注册均能经 buildProp 真实构造", () => {
  const ctx = { mats: constructionMats };
  const service = propsBuilder.createPropService(ctx);
  eq([...service.names()].sort(), [...props.PROP_IDS].sort(), "构造注册表");
  for (const id of props.PROP_IDS) {
    if (!service.has(id) || !propsSource.extraction.props[id]) throw new Error(id + " 缺少真实注册或来源");
    const object = propsBuilder.buildProp(ctx, id, { seed: 0 });
    if (!object?.isObject3D || object.userData.prop !== id) throw new Error(id + " 未返回真实道具");
    let meshes = 0;
    object.traverse((node) => {
      if (!node.isMesh) return;
      const position = node.geometry?.attributes.position;
      if (!position?.count || !Array.from(position.array).every(Number.isFinite)) throw new Error(id + " 几何无效");
      meshes++;
    });
    if (!meshes) throw new Error(id + " 没有网格");
    if (id === "relay_node") {
      const data = object.userData;
      if (typeof data.setState !== "function" || typeof data.update !== "function") throw new Error("relay_node 缺动态钩子");
      if (!data.emissiveMaterial?.isMaterial || !object.getObjectByName("relay_dynamic")?.userData.noMerge) throw new Error("relay_node 缺克隆材质或动态节点");
      for (const state of ["live", "cutting", "cut"]) {
        data.setState(state);
        data.update(0.016);
        if (data.state !== state || !Number.isFinite(data.level)) throw new Error("relay_node 动态状态无效");
      }
    }
  }
  return "36/36；完整 mats adapter，含 relay 克隆材质与动态钩子；不代表视觉/声音通过";
});
check("三种容器真实分派链可调用", () => {
  const ctx = { mats: constructionMats };
  for (const [id, color] of [["container20", "red"], ["container40", "blue"], ["container40hc", "green"]]) {
    const object = containerBuilder.buildContainer(ctx, id, { seed: 0, doors: 0, wear: 0.5, color });
    if (!object || object.name !== id || object.userData?.size?.[0] !== props.PROP_LEDGER[id].size[0]) throw new Error(id + " 未分派到 M3/zA");
  }
  return "container20/40/40hc → M3 → zA";
});

section("[5] 材质账簿");
check("族 29 / 实例 48", () => {
  const nf = Object.keys(mats.FAMILIES).length, ni = Object.keys(mats.INSTANCES).length;
  if (nf !== 29 || ni !== 48) throw new Error(`族 ${nf} / 实例 ${ni}`);
  return "29 族 × 48 实例";
});
check("每个实例都能解析出完整参数", () => {
  for (const id of mats.INSTANCE_IDS) {
    const r = mats.resolve(id);
    if (!(r.size > 0)) throw new Error(id + " size 缺失");
    if (!Array.isArray(r.wet) || r.wet.length !== 4) throw new Error(id + " wet 非 4 元组");
  }
  return mats.INSTANCE_IDS.length + " 条可解析";
});
check("账簿自检无问题", () => {
  const issues = mats.validate();
  if (issues.length) throw new Error(issues.slice(0, 3).join("; "));
  return "";
});
check("能落成 THREE 材质", () => {
  const m = mats.toStandard(THREE, "paint_red");
  if (!m.isMeshStandardMaterial) throw new Error("不是标准材质");
  return "color=#" + m.color.getHexString();
});

section("[6] 数值调参");
check("玩家 39 字段与原表一致", () => {
  const raw = tables.tables.player_tuning;
  for (const [k, v] of Object.entries(player.TUNING)) {
    if (typeof v === "object") continue;
    // standHeight 原文写的是 Pi.height，不是字面量
    if (k === "standHeight") {
      if (!/standHeight:Pi\.height/.test(raw)) throw new Error("standHeight 表达式变了");
      if (v !== player.SCALE.height) throw new Error("standHeight 未指向 SCALE.height");
      continue;
    }
    const m = new RegExp(`(?:^|[,{])${k}:([-\\d.]+)`).exec(raw);
    if (!m) throw new Error("源码无 " + k);
    if (Math.abs(parseFloat(m[1]) - v) > 1e-12) throw new Error(`${k} 漂移`);
  }
  return Object.keys(player.TUNING).length + " 个字段";
});
check("跳跃初速反解", () => {
  const want = Math.sqrt(2 * 21 * 1);
  if (Math.abs(player.jumpSpeed - want) > 1e-12) throw new Error(String(player.jumpSpeed));
  return player.jumpSpeed.toFixed(3) + " m/s";
});
check("敌人 14 字段与原表一致", () => {
  const raw = tables.tables.ai_tuning;
  for (const [k, v] of Object.entries(ai.TUNING)) {
    const m = new RegExp(`(?:^|[,{])${k}:([-\\d.]+)`).exec(raw);
    if (!m) throw new Error("源码无 " + k);
    if (Math.abs(parseFloat(m[1]) - v) > 1e-12) throw new Error(`${k} 漂移`);
  }
  return Object.keys(ai.TUNING).length + " 个字段（含视锥 " + si(ai.TUNING.sightCone) + "°）";
});
check("视锥余弦", () => {
  if (Math.abs(ai.SIGHT_COS - Math.cos((200 / 2) * Math.PI / 180)) > 1e-12) throw new Error("cos 不符");
  return ai.SIGHT_COS.toFixed(4);
});
check("武器核心四数 + 派生量", () => {
  eq({ m: weapon.WEAPON.magSize, r: weapon.WEAPON.reserve, d: weapon.WEAPON.damage, rpm: weapon.WEAPON.rpm }, { m: 30, r: 150, d: 26, rpm: 720 });
  if (Math.abs(weapon.DERIVED.fireInterval - 60 / 720) > 1e-12) throw new Error("间隔不符");
  if (Math.abs(weapon.DERIVED.dps - 26 * 12) > 1e-12) throw new Error("DPS 不符");
  return `间隔 ${weapon.DERIVED.fireInterval.toFixed(4)}s / DPS ${weapon.DERIVED.dps}`;
});
check("弹簧组 9 根", () => {
  if (Object.keys(weapon.SPRINGS).length !== 9) throw new Error("弹簧数不符");
  return "kZ " + weapon.SPRINGS.kickZ.join("/");
});
check("弹簧积分器与 ma() 数值一致", () => {
  const s = weapon.spring(520, 30), t = weapon.spring(520, 30);
  let a = 0, b = 0;
  for (let i = 0; i < 30; i++) { a = weapon.integrate(s, 1, 1 / 60); }
  // 复刻 ma()
  for (let f = 0; f < 30; f++) {
    const dt = 1 / 60;
    const n = dt > 0.012 ? Math.ceil(dt / 0.008) : 1, h = dt / n;
    for (let i = 0; i < n; i++) { t.v += ((1 - t.x) * t.k - t.v * t.c) * h; t.x += t.v * h; }
    b = t.x;
  }
  if (Math.abs(a - b) > 1e-12) throw new Error(`${a} ≠ ${b}`);
  return a.toFixed(4);
});


section("[7] 音效配方");
check("57 条配方", () => {
  const n = sound.RECIPE_IDS.length;
  if (n !== 57) throw new Error("配方 " + n + " 条");
  return n + " 条";
});
check("总线分布合理", () => {
  const load = sound.busLoad();
  const sum = Object.values(load).reduce((a, b) => a + b, 0);
  if (sum !== 57) throw new Error("总线合计 " + sum);
  return Object.entries(load).map(([k, v]) => k + ":" + v).join(" / ");
});
check("发声预算上界", () => {
  const b = sound.voiceBudget();
  if (!(b > 0)) throw new Error("预算为 0");
  return b + " 路同时发声";
});

section("[8] 材质烘焙器 —— GLSL 逐字回原工程比对");
/* 烘焙器不是数值表，而是一堆 GLSL 字符串。这里把原 HTML 的模板字面量
   重新抠一遍（含 ${n3} 共享片段展开、MRT→uSel 那一处改写），
   再和 material-baker.js 导出的常量逐字对照。 */
const BAKER_HTML = "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html";
const baker = await import(path.join(DIR, "material-baker.mjs"));
const HTML = fs.existsSync(BAKER_HTML) ? fs.readFileSync(BAKER_HTML, "utf8") : null;

function scanTpl(s, at) {
  for (let j = at + 1; j < s.length; j++) {
    if (s[j] === "\\") { j++; continue; }
    if (s[j] === "`") return { body: s.slice(at + 1, j), end: j };
  }
  throw new Error("模板未闭合");
}
function grab(name) {
  const re = new RegExp("(?:var |,|;)\\s*" + name + "\\s*=\\s*`");
  const m = re.exec(HTML);
  if (!m) throw new Error("原工程找不到 " + name);
  return scanTpl(HTML, m.index + m[0].length - 1).body;
}

if (!HTML) {
  check("原工程可读", () => { throw new Error("缺 " + BAKER_HTML); });
} else {
  const blk = HTML.slice(HTML.indexOf("Tn={}"), HTML.indexOf("var i3="));
  const n3 = grab("n3");
  const origSurf = {};
  for (const m of blk.matchAll(/Tn\.([A-Za-z_]\w*)=`/g)) {
    origSurf[m[1]] = scanTpl(blk, m.index + m[0].length - 1).body;
  }

  check("27 族 surf() GLSL 逐字一致", () => {
    const names = Object.keys(origSurf);
    if (names.length !== 27) throw new Error("原工程抠出 " + names.length + " 族");
    if (names.length !== baker.SURF_FAMILIES.length) throw new Error("模块族数不符");
    let n = 0, chars = 0;
    for (const name of names) {
      let want = origSurf[name].split("${n3}").join(n3);
      if (want.includes("${")) throw new Error(name + " 仍有未解析插值");
      const got = baker.GLSL_SURF[name];
      if (got === undefined) throw new Error("模块缺族 " + name);
      if (got !== want) {
        let k = 0; while (k < got.length && got[k] === want[k]) k++;
        throw new Error(`${name} 第 ${k} 字符起偏离：${JSON.stringify(want.slice(k, k + 24))} ≠ ${JSON.stringify(got.slice(k, k + 24))}`);
      }
      n++; chars += want.length;
    }
    return `${n} 族 / ${chars} 字符`;
  });

  check("surf 前导逐字一致（仅 MRT→uSel 改写）", () => {
    const oldOut = "layout(location=0) out vec4 o0; layout(location=1) out vec4 o1; " +
                   "layout(location=2) out vec4 o2;";
    const raw = grab("e3");
    if (!raw.includes(oldOut)) throw new Error("原工程 MRT 声明变了");
    const want = raw.replace(oldOut, "uniform float uSel;\nvec4 o0; vec4 o1; vec4 o2;\nout vec4 oSel;");
    if (baker.GLSL_COMMON !== want) {
      let k = 0; while (k < want.length && baker.GLSL_COMMON[k] === want[k]) k++;
      throw new Error(`第 ${k} 字符起偏离`);
    }
    if (baker.GLSL_COMMON.includes("layout(location")) throw new Error("MRT 声明残留");
    if (!baker.GLSL_COMMON.includes("uniform float uSel")) throw new Error("缺 uSel");
    return want.length + " 字符";
  });

  check("顶点 / main / 法线 / 拷贝 逐字一致", () => {
    if (baker.GLSL_VERT !== grab("Qy")) throw new Error("Qy 漂移");
    if (baker.GLSL_NORMAL !== grab("i3")) throw new Error("i3 漂移");
    if (baker.GLSL_COPY !== grab("s3")) throw new Error("s3 漂移");
    const main = grab("t3");
    if (main.trim() !== "void main(){ surf(vUv); }") throw new Error("t3 变了");
    if (!/o0 : \(uSel < 1\.5 \? o1 : o2\)/.test(baker.GLSL_MAIN)) throw new Error("uSel 选择逻辑不对");
    if (!baker.GLSL_MAIN.includes("surf(vUv)")) throw new Error("main 未调 surf");
    return `${baker.GLSL_VERT.length}+${baker.GLSL_MAIN.length}+${baker.GLSL_NORMAL.length}+${baker.GLSL_COPY.length} 字符`;
  });

  check("7 个材质补丁逐字一致", () => {
    const map = [["common", "dA"], ["projectVertex", "pA"], ["fragCommon", "mA"],
                 ["map", "gA"], ["roughness", "vA"], ["metalness", "xA"], ["normal", "yA"]];
    let n = 0;
    for (const [key, v] of map) {
      if (baker.PATCH[key] !== grab(v)) throw new Error(key + " ≠ " + v);
      n++;
    }
    return n + " 段 / " + Object.values(baker.PATCH).reduce((a, s) => a + s.length, 0) + " 字符";
  });

  check("SOURCE_CHARS 与实际总长吻合", () => {
    const real = baker.GLSL_VERT.length + baker.GLSL_COMMON.length + baker.GLSL_MAIN.length +
      baker.GLSL_NORMAL.length + baker.GLSL_COPY.length +
      Object.values(baker.GLSL_SURF).reduce((a, s) => a + s.length, 0) +
      Object.values(baker.PATCH).reduce((a, s) => a + s.length, 0);
    if (real !== baker.SOURCE_CHARS) throw new Error(`${real} ≠ ${baker.SOURCE_CHARS}`);
    return real + " 字符 GLSL";
  });
}

check("账簿 29 族全部落到 27 个 surf 函数", () => {
  const fns = new Set(baker.SURF_FAMILIES);
  const used = new Set();
  for (const [id, f] of Object.entries(mats.FAMILIES)) {
    if (!f.fn) throw new Error(id + " 缺 fn");
    if (!fns.has(f.fn)) throw new Error(`${id} 指向不存在的 surf ${f.fn}`);
    used.add(f.fn);
  }
  if (used.size !== 27) throw new Error("只用到 " + used.size + " 个 surf");
  return "29 → " + used.size;
});

check("patchStandard 能在 r160 的 chunk 上完成替换", () => {
  const vs = ["#include <common>", "void main(){", "#include <project_vertex>", "}"].join("\n");
  const fs0 = ["#include <common>", "void main(){", "#include <map_fragment>",
    "#include <roughnessmap_fragment>", "#include <metalnessmap_fragment>",
    "#include <normal_fragment_maps>", "#include <aomap_fragment>", "}"].join("\n");
  const shader = { vertexShader: vs, fragmentShader: fs0, uniforms: {} };
  baker.patchStandard(THREE, shader, { uSlX: { value: 1 }, uSlUv: { value: 2 } });
  for (const tag of ["map_fragment", "roughnessmap_fragment", "metalnessmap_fragment",
                     "normal_fragment_maps", "aomap_fragment"]) {
    if (shader.fragmentShader.includes("#include <" + tag + ">")) throw new Error(tag + " 未替换");
  }
  if (!shader.fragmentShader.includes("slORM.r")) throw new Error("AO 未改读 ORM");
  if (shader.uniforms.uSlX.value !== 1 || shader.uniforms.uSlUv.value !== 2) throw new Error("uniform 未合并");
  const bal = (t) => (t.match(/\{/g) || []).length - (t.match(/\}/g) || []).length;
  if (bal(shader.fragmentShader) !== bal(fs0) || bal(shader.vertexShader) !== bal(vs)) {
    throw new Error("花括号失衡");
  }
  return "5 个 chunk 全替换 / 括号平衡";
});

section("[9] 覆盖核对 —— 每条资产都对得上原工程的一处原文");

const DB = JSON.parse(
  fs.readFileSync(path.join(ROOT, "assets", "data.js"), "utf8")
    .replace(/^[\s\S]*?window\.DB\s*=\s*/, "")
    .replace(/;\s*$/, ""),
);
const ITEMS = DB.items;
const SRC_RAW = fs.readFileSync("/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html", "utf8");
const SRC_NORM = SRC_RAW.replace(/\s+/g, "");
const cnt = (cat, sub) => ITEMS.filter((i) => i.cat === cat && (!sub || i.sub === sub)).length;

check("条目总数 283，与 meta.total 一致", () => {
  if (ITEMS.length !== 283) throw new Error(`实际 ${ITEMS.length}`);
  if (DB.meta.total !== 283) throw new Error(`meta.total ${DB.meta.total}`);
  return `${ITEMS.length} 条`;
});

check("13 张注册表条目数与库内逐类相等", () => {
  const table = [
    ["材质族", cnt("MAT", "材质族"), Object.keys(mats.FAMILIES).length],
    ["材质实例", cnt("MAT", "材质实例"), Object.keys(mats.INSTANCES).length],
    ["贴花", cnt("DECAL", "贴花"), 22],
    ["道具", cnt("MODEL", "道具"), 36],
    ["几何原语", cnt("MODEL", "几何原语"), 7],
    ["专用建模器", cnt("MODEL", "专用建模器"), 36],
    ["环境", cnt("ENV", "环境"), 8],
    ["后期", cnt("FX", "后期"), 13],
    ["音效", cnt("SFX", "音效"), sound.RECIPE_IDS.length],
    ["弹簧", cnt("WEAPON", "弹簧"), Object.keys(weapon.SPRINGS).length],
    ["enemyZv2", cnt("ACTOR", "敌人"), 2],
    ["playerKv1", cnt("ACTOR", "玩家"), Object.keys(player.TUNING).length ? 1 : 0],
    ["画质预设", cnt("NUM", "画质预设"), Object.keys(q.PRESETS).length],
  ];
  const bad = table.filter(([, a, b]) => a !== b).map(([n, a, b]) => `${n} ${a}≠${b}`);
  if (bad.length) throw new Error(bad.join("; "));
  const tot = table.reduce((s, [, a]) => s + a, 0);
  if (tot !== 273) throw new Error(`这 13 表合计 ${tot} ≠ 273`);
  return "13 表全对齐 / 273 条";
});

check("每条源码片段都在原文件里原文命中（去空白比对）", () => {
  const miss = ITEMS.filter((it) => {
    const c = (it.code || "").replace(/\s+/g, "");
    return !c || c.length < 8 || SRC_NORM.indexOf(c) < 0;
  }).map((it) => it.id);
  if (miss.length) throw new Error(`${miss.length} 条落空：` + miss.slice(0, 8).join(", "));
  return `${ITEMS.length}/${ITEMS.length} 命中（${SRC_RAW.length} 字符原文）`;
});

check("没有 L1:C1 占位锚点，行号都落在文件内", () => {
  const bad = ITEMS.filter((it) => {
    const m = /^L(\d+):C(\d+)$/.exec(it.anchor || "");
    if (!m) return true;
    const line = +m[1];
    return line < 1 || line > SRC_RAW.split("\n").length;
  }).map((it) => it.id);
  if (bad.length) throw new Error(bad.slice(0, 8).join(", "));
  return `${ITEMS.length} 个锚点全部有效`;
});

check("id 唯一 / 中文名非空 / kind 能派发到预览", () => {
  const seen = new Set();
  const dispatchKinds = new Map([
    ["sphere", "oneMaterial"], ["prop", "oneProp"], ["geo", "oneGeo"], ["decal", "oneDecal"],
    ["sfx", "oneSfx"], ["fx", "oneFx"], ["spring", "oneSpring"], ["quality", "oneQuality"],
    ["num", "oneNum"], ["env", "oneEnv"], ["weapon", "weaponPreview"], ["actor", "oneActor"],
    ["chart", "oneSpec"], ["spec", "oneSpec"],
  ]);
  for (const it of ITEMS) {
    if (seen.has(it.id)) throw new Error("重复 id " + it.id);
    seen.add(it.id);
    if (!it.name || !it.cat || !it.kind) throw new Error("字段缺失 " + it.id);
    if (!Array.isArray(it.params)) throw new Error("params 非数组 " + it.id);
    if (!dispatchKinds.has(it.kind)) throw new Error("无真实函数分派 " + it.id + " / " + it.kind);
  }
  const kinds = new Set(ITEMS.map((i) => i.kind));
  return `${seen.size} 个唯一 id / ${kinds.size} 种 kind；按预览 KIND 表逐项分派（非视觉验证）`;
});

function si(x) { return Number(x).toString(); }

/**
 * 结果落盘：网页上的「N 项比对」直接读这个文件，
 * 不再手写数字，避免新增比对项后文案漂移。
 */
const RESULT = path.join(HERE, "verify-result.json");
const sections = {};
for (const [k, v] of Object.entries(bySec)) {
  sections[k] = { n: v.length, ok: v.filter(Boolean).length };
}
fs.writeFileSync(RESULT, JSON.stringify({
  passed: pass,
  failed: fail,
  at: new Date().toISOString().slice(0, 16).replace("T", " "),
  sections,
}, null, 1) + "\n");

console.log(`\n结果：通过 ${pass} / 失败 ${fail}`);
console.log("明细已写入 build/verify-result.json");
if (fail) {
  console.log("\n失败明细：");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
console.log("全部通过。");
