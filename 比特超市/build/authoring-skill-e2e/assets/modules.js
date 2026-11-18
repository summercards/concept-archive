/**
 * 资产模块运行时 · 由 tools/build_modules.py 生成，请勿手改。
 *
 * 每个 IIFE 里跑的都是 assets/code/<id>.js 的原文，一行实现都没动；
 * 只把 ESM 的 import/export 换成了依赖注入 + return 表。
 * 因此资产库里的预览，跑的就是那份可以直接拷进项目的源码本身。
 */
window.ASSET_MODULES = Object.create(null);

/* ── env-atmosphere ── 原文，仅替换 import ── */
window.ASSET_MODULES["env-atmosphere"] = (function () {

/**
 * 环境光影包 · Aurora-Env
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html
 *   WORLD   L4191:C51314  var oi
 *   SUN     L4191:C51389  var Mn
 *   SKY     L4191:C51468  var en
 *   TUNING  L4744:C569    渲染调参 g（体积光/AO/Bloom/调色/自适应曝光）
 *   SHADOW  L4744          Gy() 调用点：方向光 + 正交阴影框
 *   POOL    L4744          6 点灯池，distance 12 / decay 2
 *
 * 契约：单位米，Y 轴向上，地面 Y=0，海面 Y=-1.6，岸线 X=30。
 * 依赖：只依赖注入的 THREE，不读全局。
 */

const WORLD = {
  min: [-40, 0, -30],
  max: [40, 30, 30],
  groundY: 0,
  seaY: -1.6,
  quayX: 30,
};

const SUN = {
  /** 未归一化方向。实测原版在取用时统一 normalize() */
  dir: [0.916, 0.225, 0.331],
  /** 暖阳 #ffb86b 量级 */
  color: [1, 0.72, 0.42],
  intensity: 9,
};

const SKY = {
  zenith: [0.055, 0.085, 0.13],
  horizon: [0.95, 0.55, 0.28],
  horizonAway: [0.16, 0.22, 0.3],
  fog: [0.42, 0.47, 0.52],
};

/** 体积/AO/Bloom/调色/自适应曝光。键名与原版一致，分组仅作检索。 */
const TUNING = {
  volSunScale: 0.85,
  volAmbient: 0.2,
  volSigma: 0.0034,
  volMaxDist: 170,
  volFarHaze: 0.42,
  volInteriorDust: 6,

  aoRadius: 0.9,
  aoIntensity: 1.6,
  aoStrength: 0.95,

  bloom: 0.065,
  bloomMix: 0.62,

  dirt: 0.1,
  streak: 0.03,
  streakThreshold: 2.2,
  flare: 0.16,
  key: 0.12,

  minExposure: 0.6,
  maxExposure: 2,
  adaptTau: 1.5,

  agxMix: 0.25,
  ca: 0.0013,
  vignette: 0.3,
  grain: 0.02,
  sharpen: 0.3,
  lookPower: 1.18,
  lookSat: 1.22,
};

/** 分组索引，方便在资产库里定位字段。 */
const TUNING_GROUPS = {
  体积光: ["volSunScale", "volAmbient", "volSigma", "volMaxDist", "volFarHaze", "volInteriorDust"],
  AO: ["aoRadius", "aoIntensity", "aoStrength"],
  Bloom: ["bloom", "bloomMix"],
  镜头脏污: ["dirt", "streak", "streakThreshold", "flare", "key"],
  曝光自适应: ["minExposure", "maxExposure", "adaptTau"],
  调色: ["agxMix", "ca", "vignette", "grain", "sharpen", "lookPower", "lookSat"],
};

/** 阴影：正交框由世界包围盒投到太阳空间后求得，这里给出原版的输入边界。 */
const SHADOW = {
  /** 主体阴影体积 */
  body: { from: [-41, -0.2, -33], to: [37, 32, 31] },
  /** 深度参考体积（只用于压近裁面） */
  depthHint: { from: [-41, -3, -64], to: [72, 36, 34] },
  bias: -0.00012,
  normalBias: 0.02,
  radius: 1,
  mapSizeCap: 4096,
  /** PCF 软化：把世界尺度写进 shader，按米做核 */
  softShadow: { tapsHigh: 16, tapsLow: 10, searchTaps: 8 },
};

/** 灯池：固定 6 盏可复用的点光，靠预算调度而不是动态建灯。 */
const LIGHT_POOL = {
  count: 6,
  color: 0xffffff,
  baseIntensity: 0,
  distance: 12,
  decay: 2,
};

/** 色调映射曝光基线：原版是 .6 * exposure * (1 - fade) */
const EXPOSURE = { base: 0.6 };

/* ------------------------------------------------------------------ 运行时 */

/** 归一化太阳方向（纯函数，不依赖 THREE）。 */
function sunDir() {
  const [x, y, z] = SUN.dir;
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
}

/**
 * 复刻 Gy()：把世界包围盒投影到太阳空间，得到正交阴影框。
 * 返回 { left, right, top, bottom, near, far, width, height, depth }（米）。
 */
function shadowFrustum(THREE, { from, to, hintFrom, hintTo } = {}) {
  const b = {
    from: from || SHADOW.body.from,
    to: to || SHADOW.body.to,
    hintFrom: hintFrom || SHADOW.depthHint.from,
    hintTo: hintTo || SHADOW.depthHint.to,
  };
  const V = THREE.Vector3;
  const dir = new V(...sunDir());
  const mid = new V(...b.from).add(new V(...b.to)).multiplyScalar(0.5);
  const eye = mid.clone().addScaledVector(dir, 200);
  const view = new THREE.Matrix4().lookAt(eye, mid, new V(0, 1, 0));
  view.setPosition(eye);
  view.invert();

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  const p = new V();
  const scan = (a, c, fn) => {
    for (let i = 0; i < 8; i++) {
      p.set(i & 1 ? c[0] : a[0], i & 2 ? c[1] : a[1], i & 4 ? c[2] : a[2]).applyMatrix4(view);
      fn(p);
    }
  };
  scan(b.from, b.to, (v) => {
    minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    minZ = Math.min(minZ, -v.z); maxZ = Math.max(maxZ, -v.z);
  });
  scan(b.hintFrom, b.hintTo, (v) => { minZ = Math.min(minZ, -v.z); });

  const pad = 1;
  const left = minX - pad, right = maxX + pad;
  const bottom = minY - pad, top = maxY + pad;
  const near = Math.max(1, minZ - 4), far = maxZ + 4;
  return { left, right, top, bottom, near, far, width: right - left, height: top - bottom, depth: far - near };
}

/**
 * 把环境装进场景：方向光 + 阴影框 + 雾 + 背景色。
 * 只做原版做过的事，不额外加 AmbientLight（原版刻意用冷天空压暗部）。
 */
function install(THREE, scene, opts = {}) {
  const { shadowMapSize = 2048, withShadow = true } = opts;

  const sun = new THREE.DirectionalLight(new THREE.Color(...SUN.color), SUN.intensity);
  sun.name = "sun";
  sun.castShadow = withShadow;
  scene.add(sun, sun.target);

  const dir = new THREE.Vector3(...sunDir());
  const mid = new THREE.Vector3(...SHADOW.body.from)
    .add(new THREE.Vector3(...SHADOW.body.to))
    .multiplyScalar(0.5);
  sun.target.position.copy(mid);
  sun.position.copy(mid).addScaledVector(dir, 200);

  const f = shadowFrustum(THREE);
  const cam = sun.shadow.camera;
  cam.left = f.left; cam.right = f.right;
  cam.bottom = f.bottom; cam.top = f.top;
  cam.near = f.near; cam.far = f.far;
  cam.updateProjectionMatrix();

  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  sun.shadow.bias = SHADOW.bias;
  sun.shadow.normalBias = SHADOW.normalBias;
  sun.shadow.radius = SHADOW.radius;
  sun.shadow.autoUpdate = true;

  scene.fog = new THREE.FogExp2(
    new THREE.Color(...SKY.fog),
    1 / Math.max(1, TUNING.volMaxDist)
  );
  scene.background = new THREE.Color(...SKY.fog);

  return { sun, frustum: f };
}

/** 复刻曝光公式：toneMappingExposure = .6 * exposure * (1 - fade) */
function exposureValue(exposure = 1, fade = 0) {
  return EXPOSURE.base * exposure * (1 - Math.min(1, Math.max(0, fade)));
}

/** 灯池调度器：固定 N 盏灯，按“最近的 N 个需求”点亮。 */
function createLightPool(THREE, scene, opts = {}) {
  const { count = LIGHT_POOL.count, distance = LIGHT_POOL.distance, decay = LIGHT_POOL.decay } = opts;
  const lights = [];
  for (let i = 0; i < count; i++) {
    const l = new THREE.PointLight(LIGHT_POOL.color, LIGHT_POOL.baseIntensity, distance, decay);
    l.visible = false;
    scene.add(l);
    lights.push(l);
  }
  return {
    lights,
    /** wants: [{pos:[x,y,z], color:0xRRGGBB, intensity}]，按距离取前 count 盏 */
    update(wants) {
      for (const l of lights) { l.visible = false; l.intensity = 0; }
      wants.slice(0, count).forEach((w, i) => {
        const l = lights[i];
        l.visible = true;
        l.position.set(w.pos[0], w.pos[1], w.pos[2]);
        l.color.setHex(w.color);
        l.intensity = w.intensity;
      });
    },
  };
}

const __default = { WORLD, SUN, SKY, TUNING, SHADOW, LIGHT_POOL, EXPOSURE, install, shadowFrustum, sunDir, exposureValue, createLightPool };
  return { WORLD, SUN, SKY, TUNING, TUNING_GROUPS, SHADOW, LIGHT_POOL, EXPOSURE, sunDir, shadowFrustum, install, exposureValue, createLightPool, default: __default };
})();

/* ── quality-presets ── 原文，仅替换 import ── */
window.ASSET_MODULES["quality-presets"] = (function () {

/**
 * 画质预设 · Aurora-Quality
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L4191:C51664  var Pr / zy()
 *
 * 11 个字段 × 5 档 = 55 个可调数值。scale 是渲染倍率，msaa 是采样数，
 * shadow/tex 是贴图边长，volSteps 是体积光步进，planar 是湿地平面反射强度。
 * 依赖：无。纯数据 + 纯函数，可脱离引擎单独做配置校验。
 */

const PRESETS = {
  test:   { name: "test",   scale: 1,    msaa: 0, shadow: 1024, tex: 256,  volSteps: 10, ao: true,  planar: 0.5, bloom: true, motionBlur: false, rain: 0.4 },
  low:    { name: "low",    scale: 0.7,  msaa: 0, shadow: 2048, tex: 512,  volSteps: 12, ao: false, planar: 0,   bloom: true, motionBlur: false, rain: 0.5 },
  medium: { name: "medium", scale: 0.85, msaa: 2, shadow: 2048, tex: 1024, volSteps: 16, ao: true,  planar: 0.5, bloom: true, motionBlur: false, rain: 0.8 },
  high:   { name: "high",   scale: 1,    msaa: 4, shadow: 4096, tex: 1024, volSteps: 24, ao: true,  planar: 0.5, bloom: true, motionBlur: true,  rain: 1 },
  ultra:  { name: "ultra",  scale: 1,    msaa: 4, shadow: 4096, tex: 2048, volSteps: 40, ao: true,  planar: 1,   bloom: true, motionBlur: true,  rain: 1 },
};

const ORDER = ["test", "low", "medium", "high", "ultra"];

/** 字段语义，给资产库读表用。 */
const FIELDS = {
  scale:      { label: "渲染倍率", unit: "×",     range: [0.7, 1] },
  msaa:       { label: "MSAA 采样", unit: "spp",  range: [0, 4] },
  shadow:     { label: "阴影贴图",  unit: "px",   range: [1024, 4096] },
  tex:        { label: "程序贴图",  unit: "px",   range: [256, 2048] },
  volSteps:   { label: "体积光步进", unit: "step", range: [10, 40] },
  ao:         { label: "环境光遮蔽", unit: "bool" },
  planar:     { label: "湿地反射",  unit: "0-1",  range: [0, 1] },
  bloom:      { label: "泛光",      unit: "bool" },
  motionBlur: { label: "运动模糊",  unit: "bool" },
  rain:       { label: "雨量",      unit: "0-1",  range: [0, 1] },
};

/** 按名取预设；未知名字返回 null（原版也是 if(Pr[i]) 才返回）。 */
function get(name) {
  return PRESETS[name] ? { ...PRESETS[name] } : null;
}

/** 原版 zy()：显式档位优先，否则按设备与显卡字符串自动选。 */
function autoSelect(name) {
  const explicit = get(name);
  if (explicit) return explicit;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const touch = typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;
  const screenMin = typeof screen !== "undefined" ? Math.min(screen.width, screen.height) : 9999;
  if (/Android|iPhone|iPad|Mobile/i.test(ua) || (touch > 1 && screenMin < 900)) {
    return { ...PRESETS.low };
  }

  let renderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    }
  } catch (_) { /* 探针失败就按 high，与原版一致 */ }

  const software = /SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(renderer);
  const weakIntel = /Intel/i.test(renderer) && !/Arc/i.test(renderer);
  return { ...(software || weakIntel ? PRESETS.medium : PRESETS.high) };
}

/** 校验一份自定义预设是否落在合法区间，返回问题列表。 */
function validate(preset) {
  const issues = [];
  const p = preset || {};
  if (!p.name || typeof p.name !== "string") issues.push("name 缺失");
  if (!(p.scale > 0 && p.scale <= 2)) issues.push("scale 应在 (0,2]");
  if (!Number.isInteger(p.msaa) || p.msaa < 0 || p.msaa > 8) issues.push("msaa 应为 0-8 的整数");
  if (![1024, 2048, 4096, 8192].includes(p.shadow)) issues.push("shadow 应为 2 的幂贴图边长");
  if (![128, 256, 512, 1024, 2048, 4096].includes(p.tex)) issues.push("tex 应为 2 的幂贴图边长");
  if (!(p.volSteps >= 4 && p.volSteps <= 64)) issues.push("volSteps 应在 4-64");
  if (typeof p.ao !== "boolean") issues.push("ao 应为布尔");
  if (!(p.planar >= 0 && p.planar <= 1)) issues.push("planar 应在 0-1");
  if (!(p.rain >= 0 && p.rain <= 1)) issues.push("rain 应在 0-1");
  return issues;
}

const __default = { PRESETS, ORDER, FIELDS, get, autoSelect, validate };
  return { PRESETS, ORDER, FIELDS, get, autoSelect, validate, default: __default };
})();

/* ── props-ledger ── 原文，仅替换 import ── */
window.ASSET_MODULES["props-ledger"] = (function () {

/**
 * 道具台账 · Aurora-Props
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5453:C13986  var Gi
 *      自定义几何注册：Gi / J3 / eb / sb，共 36 条
 *
 * 36 条道具，每条 5 个字段：[宽, 高, 深](米) + 材质名 + 表面类型。
 * 这是原版唯一一处"资产清单"式数据：尺寸、材质、碰撞面都写在一行里。
 * 原点在底面中心（bottom anchor），长轴沿 X。
 *
 * 依赖：无。纯数据，可直接被关卡生成/碰撞/合批三方共用。
 */

const PROP_LEDGER = {
  container20:       { size: [6.06, 2.59, 2.44], material: "paint_red", surface: "metal" },
  container40:       { size: [12.19, 2.59, 2.44], material: "paint_blue", surface: "metal" },
  container40hc:     { size: [12.19, 2.9, 2.44], material: "paint_green", surface: "metal" },
  jersey_barrier:    { size: [3, 0.81, 0.6], material: "concrete", surface: "concrete" },  // 自定义几何
  light_mast:        { size: [0.5, 14, 0.5], material: "steel_galv", surface: "metal" },  // 自定义几何
  fence_panel:       { size: [3, 2.4, 0.08], material: "chainlink", surface: "metal" },  // 自定义几何
  guard_booth:       { size: [2.6, 2.7, 2.2], material: "paint_white", surface: "metal" },  // 自定义几何
  gate_arm:          { size: [5, 1.1, 0.3], material: "hazard_stripes", surface: "metal" },  // 自定义几何
  bollard_mooring:   { size: [0.7, 0.6, 0.7], material: "steel_dark", surface: "metal" },  // 自定义几何
  bollard_post:      { size: [0.17, 1, 0.17], material: "paint_yellow", surface: "metal" },  // 自定义几何
  relay_node:        { size: [1.2, 2.4, 0.8], material: "paint_grey", surface: "metal" },  // 自定义几何
  shelf_rack:        { size: [2.7, 4.2, 1.1], material: "paint_orange", surface: "metal" },  // 自定义几何
  stairs_metal:      { size: [3, 2.6, 1], material: "diamond_plate", surface: "metal" },  // 自定义几何
  catwalk:           { size: [3, 1.1, 1.2], material: "diamond_plate", surface: "metal" },  // 自定义几何
  reefer_unit:       { size: [0.5, 2.3, 2.3], material: "paint_white", surface: "metal" },  // 自定义几何
  barrel:            { size: [0.6, 0.9, 0.6], material: "paint_blue", surface: "metal" },
  pallet:            { size: [1.2, 0.144, 1], material: "wood_pallet", surface: "wood" },
  pallet_stack:      { size: [1.2, 1.15, 1], material: "wood_pallet", surface: "wood" },
  crate_wood:        { size: [1.1, 1, 0.9], material: "wood_pallet", surface: "wood" },
  crate_stack:       { size: [1.2, 1.9, 1], material: "wood_pallet", surface: "wood" },
  ibc_tote:          { size: [1.2, 1.16, 1], material: "plastic_grey", surface: "metal" },
  forklift:          { size: [3.4, 2.2, 1.25], material: "paint_yellow", surface: "metal" },
  cable_reel:        { size: [1.3, 1.3, 0.8], material: "wood_dark", surface: "wood" },
  tire_stack:        { size: [0.8, 1, 0.8], material: "tire", surface: "rubber" },
  dumpster:          { size: [1.9, 1.35, 1.1], material: "paint_green", surface: "metal" },
  generator:         { size: [2.2, 1.4, 1], material: "paint_yellow", surface: "metal" },
  jerry_can:         { size: [0.35, 0.47, 0.17], material: "paint_green", surface: "metal" },
  traffic_cone:      { size: [0.36, 0.7, 0.36], material: "plastic_red", surface: "rubber" },
  gas_cylinders:     { size: [0.9, 1.6, 0.5], material: "steel_dark", surface: "metal" },
  tarp_cargo:        { size: [2.4, 1.5, 1.4], material: "tarp", surface: "dirt" },
  sandbags:          { size: [2, 0.9, 0.6], material: "tarp", surface: "dirt" },
  toolbox_cart:      { size: [0.9, 0.95, 0.5], material: "plastic_red", surface: "metal" },
  floodlight_stand:  { size: [1, 2.2, 1], material: "paint_yellow", surface: "metal" },  // 自定义几何
  cardboard_boxes:   { size: [1, 0.8, 0.8], material: "cardboard", surface: "wood" },
  pipe_stack:        { size: [6, 0.9, 1.2], material: "steel_rust", surface: "metal" },
  sign_post:         { size: [0.6, 2.4, 0.08], material: "paint_white", surface: "metal" },  // 自定义几何
};

/** 36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价。 */
const HAS_CUSTOM_BUILDER = new Set(Object.keys(PROP_LEDGER));

const PROP_BUILDER_META = {
  container20: { group: "container-loop", callback: "M3", integrated: true, sourceStatus: "已接入真实建模器" },
  container40: { group: "container-loop", callback: "M3", integrated: true, sourceStatus: "已接入真实建模器" },
  container40hc: { group: "container-loop", callback: "M3", integrated: true, sourceStatus: "已接入真实建模器" },
  jersey_barrier: { group: "direct", callback: "S3", integrated: true, sourceStatus: "已接入真实建模器" },
  light_mast: { group: "direct", callback: "T3", integrated: true, sourceStatus: "已接入真实建模器" },
  fence_panel: { group: "direct", callback: "A3", integrated: true, sourceStatus: "已接入真实建模器" },
  guard_booth: { group: "direct", callback: "R3", integrated: true, sourceStatus: "已接入真实建模器" },
  gate_arm: { group: "direct", callback: "C3", integrated: true, sourceStatus: "已接入真实建模器" },
  bollard_mooring: { group: "direct", callback: "P3", integrated: true, sourceStatus: "已接入真实建模器" },
  bollard_post: { group: "direct", callback: "I3", integrated: true, sourceStatus: "已接入真实建模器" },
  sign_post: { group: "direct", callback: "z3", integrated: true, sourceStatus: "已接入真实建模器" },
  floodlight_stand: { group: "direct", callback: "D3", integrated: true, sourceStatus: "已接入真实建模器" },
  stairs_metal: { group: "direct", callback: "k3", integrated: true, sourceStatus: "已接入真实建模器" },
  catwalk: { group: "direct", callback: "F3", integrated: true, sourceStatus: "已接入真实建模器" },
  shelf_rack: { group: "direct", callback: "U3", integrated: true, sourceStatus: "已接入真实建模器" },
  reefer_unit: { group: "direct", callback: "N3", integrated: true, sourceStatus: "已接入真实建模器" },
  relay_node: { group: "direct", callback: "B3", integrated: true, sourceStatus: "已接入真实建模器" },
  barrel: { group: "J3", callback: "HA", integrated: true, sourceStatus: "已接入真实建模器" },
  pallet: { group: "J3", callback: "VA", integrated: true, sourceStatus: "已接入真实建模器" },
  pallet_stack: { group: "J3", callback: "WA", integrated: true, sourceStatus: "已接入真实建模器" },
  crate_wood: { group: "J3", callback: "GA", integrated: true, sourceStatus: "已接入真实建模器" },
  crate_stack: { group: "J3", callback: "qA", integrated: true, sourceStatus: "已接入真实建模器" },
  ibc_tote: { group: "J3", callback: "XA", integrated: true, sourceStatus: "已接入真实建模器" },
  cable_reel: { group: "J3", callback: "YA", integrated: true, sourceStatus: "已接入真实建模器" },
  tire_stack: { group: "J3", callback: "$A", integrated: true, sourceStatus: "已接入真实建模器" },
  jerry_can: { group: "J3", callback: "ZA", integrated: true, sourceStatus: "已接入真实建模器" },
  traffic_cone: { group: "J3", callback: "jA", integrated: true, sourceStatus: "已接入真实建模器" },
  gas_cylinders: { group: "J3", callback: "JA", integrated: true, sourceStatus: "已接入真实建模器" },
  pipe_stack: { group: "J3", callback: "KA", integrated: true, sourceStatus: "已接入真实建模器" },
  tarp_cargo: { group: "eb", callback: "QA", integrated: true, sourceStatus: "已接入真实建模器" },
  sandbags: { group: "eb", callback: "tR", integrated: true, sourceStatus: "已接入真实建模器" },
  cardboard_boxes: { group: "eb", callback: "nR", integrated: true, sourceStatus: "已接入真实建模器" },
  forklift: { group: "sb", callback: "oR", integrated: true, sourceStatus: "已接入真实建模器" },
  generator: { group: "sb", callback: "rR", integrated: true, sourceStatus: "已接入真实建模器" },
  dumpster: { group: "sb", callback: "aR", integrated: true, sourceStatus: "已接入真实建模器" },
  toolbox_cart: { group: "sb", callback: "lR", integrated: true, sourceStatus: "已接入真实建模器" },
};

const PROP_IDS = Object.keys(PROP_LEDGER);

/** 取尺寸，未知 id 抛错——原版是 warn 后回退成 1×1×1 的 concrete 盒。 */
function sizeOf(id) {
  const p = PROP_LEDGER[id];
  if (!p) throw new Error(`未知道具 "${id}"`);
  return p.size.slice();
}

/** 包围盒：底面中心为原点，米制。 */
function boundsOf(id) {
  const [w, h, d] = sizeOf(id);
  return { min: [-w / 2, 0, -d / 2], max: [w / 2, h, d / 2] };
}

/** 只覆盖部分字段的派生台账（用于做主题变体而不动原表）。 */
function withOverrides(patch) {
  const out = {};
  for (const [id, p] of Object.entries(PROP_LEDGER)) {
    out[id] = { ...p, ...(patch[id] || {}) };
  }
  return out;
}

/** 台账体检：尺寸为正、材质名非空。 */
function validate() {
  const issues = [];
  for (const [id, p] of Object.entries(PROP_LEDGER)) {
    if (!(p.size[0] > 0 && p.size[1] > 0 && p.size[2] > 0)) issues.push(`${id}: 尺寸非正`);
    if (!p.material) issues.push(`${id}: 缺材质`);
    if (!p.surface) issues.push(`${id}: 缺表面类型`);
  }
  return issues;
}

const __default = { PROP_LEDGER, HAS_CUSTOM_BUILDER, PROP_BUILDER_META, PROP_IDS, sizeOf, boundsOf, withOverrides, validate };
  return { PROP_LEDGER, HAS_CUSTOM_BUILDER, PROP_BUILDER_META, PROP_IDS, sizeOf, boundsOf, withOverrides, validate, default: __default };
})();

/* ── material-ledger ── 原文，仅替换 import ── */
window.ASSET_MODULES["material-ledger"] = (function () {

/**
 * 材质账簿 · Aurora-Materials
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5294:C17715  var c3（族）
 *                                        L5294:C19452  var l1（实例）
 *
 * 两层结构：
 *   族  c3  —— 决定"这张表面在米制空间里的尺度"：size(米) / tile(平铺) / bump(毫米凹凸)
 *   实例 l1 —— 决定"这块表面脏成什么样"：色 / 粗糙 / 湿润 4 元组 / 脏污 4 元组
 *
 * 材质不是贴图文件，是"族参数 × 实例参数"算出来的。因此账簿本身即资产：
 * 换一套 l1 等于换一套美术风格，且不需要重算任何贴图。
 *
 * 依赖：无（resolve/toStandard 需要注入 THREE 才建材质）。
 */

/** 族：米制 UV 契约。size 是贴图覆盖的物理尺寸，bump 是毫米级凹凸。 */
const FAMILIES = {asphalt:{fn:"asphalt",size:1,tile:2,bump:1.6,hero:!0},concrete:{fn:"concrete",size:1,tile:3,bump:2.5},brick:{fn:"brick",size:.5,tile:1.8,bump:6},epoxy:{fn:"epoxy",size:.5,tile:4,bump:3},paint:{fn:"paint",size:1,tile:2.5,bump:2.5,p:[.5]},hull:{fn:"hull",size:.5,tile:4,bump:12},galv:{fn:"galv",size:.5,tile:1,bump:.8},metal:{fn:"metal",size:.5,tile:1,bump:.5,p:[1]},brushed:{fn:"brushed",size:.5,tile:.5,bump:.4},rust:{fn:"rust",size:.5,tile:1.2,bump:3},diamond:{fn:"diamond",size:.5,tile:.5,bump:2},corrugated:{fn:"corrugated",size:.5,tile:[.762,2.286],bump:19},chainlink:{fn:"chainlink",size:.5,tile:.5,bump:5},hazard:{fn:"hazard",size:.5,tile:1,bump:2.5},gunmetal:{fn:"gunmetal",size:.5,tile:.25,bump:.3,p:[.6]},anodized:{fn:"gunmetal",size:.5,tile:.25,bump:.25,p:[.2],seed:11},polymer:{fn:"polymer",size:.25,tile:.1,bump:.4},carbon:{fn:"carbon",size:.25,tile:.05,bump:.5},fabric:{fn:"fabric",size:.25,tile:.05,bump:.4},armor:{fn:"armor",size:.5,tile:.5,bump:.8},wood:{fn:"wood",size:.5,tile:1.2,bump:2.6},plastic:{fn:"plastic",size:.5,tile:1,bump:1},tarp:{fn:"tarp",size:.5,tile:1.5,bump:20},cardboard:{fn:"cardboard",size:.5,tile:1,bump:.8},rope:{fn:"rope",size:.25,tile:.1,bump:4},tire:{fn:"tire",size:.5,tile:[.5,.3],bump:7},glass:{fn:"glass",size:.5,tile:1.5,bump:1.5,p:[.3]},glass_dirty:{fn:"glass",size:.5,tile:1.5,bump:1.5,p:[1],seed:40},water:{fn:"water",size:.25,tile:4,bump:30}};

/**
 * 湿润 / 脏污预设。4 元组按位置被着色器消费：
 * 原版没有为分量命名，此处保留原样，不做语义猜测。
 * 变量名（kc/aa/uA/o1…）与原版一致，便于逐字对照源码。
 */
const cA=[.42,.38,.5,0],kc=[.05,.62,.65,.7],aa=[0,.7,.55,.5],uA=[.3,.6,.55,0],i1=[.08,.62,.6,.5],u3=[.4,.5,.6,0],s1=[0,1,0,0],o1=[.22,.12,.35,.35],hA=[.14,.1,.8,.2],r1=[.07,.06,3,0],a1=[0,0,1,0];

/** 原版工厂：所有字段都有默认值，实例只写差异。 */
const Nt=(i,e={})=>({set:i,tint:0,color:16777215,rough:1,metal:1,wet:cA,macro:hA,nrm:1,...e}),Xa=i=>Nt("paint",{tint:1,color:i,wet:kc,macro:[.2,.16,.4,.45]});

/** 实例：48 条。键名即 mats.get("...") 的入参。原文照搬。 */
const INSTANCES = {asphalt:Nt("asphalt",{wet:[.45,.3,.5,0],macro:o1}),concrete:Nt("concrete",{macro:o1}),concrete_dirty:Nt("concrete",{color:13616822,macro:[.3,.15,.35,.9]}),concrete_painted:Nt("concrete",{tint:2,color:9343638,rough:.9,wet:[.15,.55,.6,.3],macro:[.14,.1,.5,.3]}),brick:Nt("brick"),floor_epoxy:Nt("epoxy",{wet:[.04,.75,.4,0],macro:[.12,.2,.45,.25]}),paint_red:Xa(8200729),paint_blue:Xa(2047846),paint_green:Xa(2906692),paint_yellow:Xa(12159516),paint_orange:Xa(11751962),paint_white:Xa(12172214),paint_grey:Xa(5922920),paint_teal:Xa(2055523),steel_galv:Nt("galv",{wet:aa}),steel_dark:Nt("metal",{tint:1,color:4014406,rough:1.15,wet:aa}),steel_worn:Nt("metal",{tint:1,color:9080466,rough:.9,wet:aa}),steel_bare:Nt("brushed",{tint:1,color:11843771,wet:aa,macro:r1}),steel_rust:Nt("rust",{wet:uA}),diamond_plate:Nt("diamond",{wet:aa}),corrugated_roof:Nt("corrugated",{wet:aa}),chainlink:Nt("chainlink",{tint:3,alphaCut:!0,side:2,wet:s1,macro:a1}),aluminium:Nt("brushed",{tint:1,color:12896459,rough:1.15,wet:aa,macro:r1}),brass:Nt("brushed",{tint:1,color:12753477,rough:.9,wet:aa,macro:[.1,.08,20,0]}),hazard_stripes:Nt("hazard",{wet:kc}),gunmetal:Nt("gunmetal",{tint:1,color:2764081,wet:[0,.75,.6,.5],macro:[.08,.06,6,0]}),anodized_black:Nt("anodized",{tint:1,color:1184790,rough:.72,metal:.9,wet:[0,.75,.6,.5],macro:[.06,.05,6,0]}),polymer_black:Nt("polymer",{tint:1,color:1513498,wet:[0,.7,.6,.5],macro:[.06,.06,6,0]}),polymer_tan:Nt("polymer",{tint:1,color:7299144,wet:[0,.7,.6,.5],macro:[.06,.06,6,0]}),rubber:Nt("polymer",{tint:1,color:1052688,rough:1.4,wet:[.05,.6,.6,.4],macro:[.06,.06,6,0]}),carbon:Nt("carbon",{wet:[0,.8,.6,.5],macro:[.05,.05,6,0]}),glove_fabric:Nt("fabric",{tint:1,color:2303530,wet:[.3,.7,.6,0],macro:[.08,.04,8,0]}),armor_white:Nt("armor",{tint:1,color:11449528,wet:kc,macro:[.08,.08,2.5,.15]}),armor_orange:Nt("armor",{tint:1,color:12670234,wet:kc,macro:[.08,.08,2.5,.15]}),wood_pallet:Nt("wood",{wet:u3,macro:[.2,.1,.9,.4]}),wood_dark:Nt("wood",{color:9074794,wet:u3,macro:[.2,.1,.9,.4]}),plastic_blue:Nt("plastic",{tint:1,color:1920134,wet:i1}),plastic_red:Nt("plastic",{tint:1,color:9314074,wet:i1}),plastic_grey:Nt("plastic",{tint:1,color:4935508,wet:i1}),tarp:Nt("tarp",{tint:1,color:3885626,wet:i1,macro:[.1,.1,1.2,.2]}),cardboard:Nt("cardboard",{wet:[.4,.75,.6,0]}),rope:Nt("rope",{macro:r1}),tire:Nt("tire",{wet:[.1,.6,.6,.3],macro:r1}),glass:Nt("glass",{tint:3,transparent:!0,wet:s1,macro:a1}),glass_dirty:Nt("glass_dirty",{tint:3,transparent:!0,wet:s1,macro:a1}),hull_paint:Nt("hull",{tint:1,color:1778219,wet:kc,macro:o1}),hull_red:Nt("hull",{tint:1,color:6233880,wet:kc,macro:o1}),water_dark:Nt("water",{wet:s1,macro:a1})};

const PRESETS = {
  wetDefault: cA, wetPaint: kc, wetGalv: aa, wetRust: uA,
  wetConcrete: i1, wetDry: u3, wetFull: s1,
  macroDefault: hA, macroConcrete: o1, macroBrushed: r1, macroNone: a1,
};

/** 对外统一用 makeInstance，内部就是原文的 Nt。 */
const makeInstance = Nt;

const INSTANCE_IDS = Object.keys(INSTANCES);

/**
 * 把 族 + 实例 合成一份可读的最终参数。
 * 不做渲染，只做合并，便于 UI 读表与做差异对比。
 */
function resolve(id) {
  const inst = INSTANCES[id];
  if (!inst) throw new Error(`未知材质 "${id}"`);
  const fam = FAMILIES[inst.set];
  if (!fam) throw new Error(`材质 "${id}" 引用了不存在的族 "${inst.set}"`);
  return {
    id,
    family: inst.set,
    size: fam.size,
    tile: fam.tile,
    bump: fam.bump,
    tint: inst.tint,
    color: inst.color,
    rough: inst.rough,
    metal: inst.metal,
    wet: inst.wet,
    macro: inst.macro,
    normalScale: inst.nrm,
    alphaCut: !!inst.alphaCut,
    side: inst.side === 2 ? "DoubleSide" : "FrontSide",
  };
}

/**
 * 落地成 MeshStandardMaterial —— 只搬"能等价搬"的部分。
 *
 * 必须说清楚：原版的 rough / metal 不是 0-1 的物理量，而是送进自有 PBR shader
 * 的乘子；程序化 ORM、湿润掩码、宏观脏污都在 shader 里算。用标准材质无法等价还原，
 * 所以这里只设颜色，粗糙度/金属度交给调用方显式指定，不伪造。
 */
function toStandard(THREE, id, extra = {}) {
  const r = resolve(id);
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(r.color),
    roughness: 0.82,
    metalness: r.family === "metal" || r.family === "galv" || r.family === "brushed" ? 0.9 : 0.05,
    ...extra,
  });
  m.name = id;
  return m;
}

/** 台账体检：实例引用的族必须存在。 */
function validate() {
  const issues = [];
  for (const [id, inst] of Object.entries(INSTANCES)) {
    if (!FAMILIES[inst.set]) issues.push(`${id} → 族 "${inst.set}" 不存在`);
    if (!Array.isArray(inst.wet) || inst.wet.length !== 4) issues.push(`${id} → wet 不是 4 元组`);
    if (!Array.isArray(inst.macro) || inst.macro.length !== 4) issues.push(`${id} → macro 不是 4 元组`);
  }
  return issues;
}

const __default = { FAMILIES, INSTANCES, PRESETS, makeInstance, resolve, toStandard, validate };
  return { FAMILIES, INSTANCES, PRESETS, makeInstance, INSTANCE_IDS, resolve, toStandard, validate, default: __default };
})();

/* ── material-baker ── 原文，仅替换 import ── */
window.ASSET_MODULES["material-baker"] = (function () {

/**
 * 材质烘焙器 · Aurora-Material Baker
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html  qg 命名空间（mats）
 *   surf 前导 e3        5283 字符
 *   27 个族函数 Tn.*     34385 字符（asphalt, concrete, brick, epoxy, paint…）
 *   height→法线 i3      615 字符
 *   拷贝/平方 s3        177 字符
 *   材质补丁 dA…yA      7446 字符
 *
 * 贴图不是图片文件，是「族参数 × GLSL」在 GPU 上烘出来的：
 *   surf() 三输出 → albedo(sqrt 编码) / ORM(R=AO G=rough B=metal) / height
 *   height + bump(mm) → 法线（Sobel，uK = bump*0.001*D/tile）
 *   补丁注入标准材质 → 湿润 4 元组 / 脏污 4 元组 / 三平面 / 镂空
 *
 * 与原版唯一的差异：原版 MRT 一次画三输出，本机 three 是 r160，
 * 不支持 WebGLRenderTarget count，故拆成 3 次 uSel 选择的单目标 pass。
 * 逐像素结果相同，只多两次 draw call。
 *
 * 依赖：注入 THREE + 已存在的 WebGLRenderer + material-ledger。
 */

const GLSL_VERT = `
in vec3 position; out vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const GLSL_COMMON = `
precision highp float; precision highp int;
uniform vec4 uP; uniform float uSeed; uniform float uTexel;
in vec2 vUv;
uniform float uSel;
vec4 o0; vec4 o1; vec4 o2;
out vec4 oSel;
#define TAU 6.28318530718
#define sat(x) clamp(x, 0.0, 1.0)
#define OV(D, k) { float k_ = sat(k); nt = mix(nt, D, k_); ta = mix(ta, 0.0, k_); }
vec3 L(float r, float g, float b){ return pow(vec3(r, g, b), vec3(2.2)); }
uvec3 pcg3(uvec3 v){ v = v * 1664525u + 1013904223u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; v ^= v >> 16u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; return v; }
vec3 h3(vec2 c, vec2 per, float s){ c = mod(c, per); return vec3(pcg3(uvec3(uint(c.x + 0.5), uint(c.y + 0.5), uint(s + uSeed)))) * (1.0 / 4294967296.0); }
float gn(vec2 p, vec2 per, float s){
  vec2 i = floor(p), f = p - i; vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(h3(i, per, s).xy * 2.0 - 1.0, f);
  float b = dot(h3(i + vec2(1.0, 0.0), per, s).xy * 2.0 - 1.0, f - vec2(1.0, 0.0));
  float c = dot(h3(i + vec2(0.0, 1.0), per, s).xy * 2.0 - 1.0, f - vec2(0.0, 1.0));
  float d = dot(h3(i + vec2(1.0, 1.0), per, s).xy * 2.0 - 1.0, f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// fractal noise, ~0..1 centred on 0.5 (std ~0.18)
float fbm(vec2 uv, vec2 f, int oct, float s){
  float a = 0.5, v = 0.0, t = 0.0;
  for (int i = 0; i < oct; i++){ v += a * gn(uv * f, f, s + float(i) * 7.0); t += a; a *= 0.5; f *= 2.0; }
  return sat(v / t * 1.8 + 0.5);
}
// voronoi: x = F1, y = F2, z = cell random, w = second cell random
vec4 vor(vec2 p, vec2 per, float s){
  vec2 i = floor(p), f = p - i; float d1 = 9.0, d2 = 9.0; vec2 id = vec2(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 o = vec2(float(x), float(y)); vec3 r = h3(i + o, per, s); vec2 d = o + r.xy - f; float dd = dot(d, d);
    if (dd < d1){ d2 = d1; d1 = dd; id = vec2(r.z, fract(r.z * 37.0 + r.x * 11.0)); } else if (dd < d2) d2 = dd;
  }
  return vec4(sqrt(d1), sqrt(d2), id);
}
// scattered straight scratches: f cells per tile, w half-width (cells), base angle + spread, density 0..1
float scr(vec2 uv, float f, float s, float w, float ang, float spread, float dens){
  vec2 p = uv * f; vec2 i = floor(p); vec2 fr = p - i; float m = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 o = vec2(float(x), float(y)); vec3 r = h3(i + o, vec2(f), s); vec3 r2 = h3(i + o, vec2(f), s + 31.0);
    vec2 c = o + r.xy - fr; float a = ang + (r.z - 0.5) * spread; vec2 dir = vec2(cos(a), sin(a));
    float al = dot(c, dir), ac = dot(c, vec2(-dir.y, dir.x)); float len = 0.15 + r2.x * 0.8;
    m = max(m, smoothstep(w, w * 0.3, abs(ac)) * smoothstep(len, len * 0.7, abs(al)) * step(r2.y, dens) * (0.35 + 0.65 * r2.z));
  }
  return m;
}
void emit(vec3 c, float a, float h, float ao, float r, float m){
  o0 = vec4(sqrt(clamp(c, 0.0, 1.0)), sat(a));
  o1 = vec4(sat(ao), clamp(r, 0.03, 1.0), sat(m), 1.0);
  float hh = sat(h) * 255.0; float fl = floor(hh); o2 = vec4(fl / 255.0, hh - fl, 0.0, 1.0);
}
// soft, grainy rust patch mask: f = patch frequency, th = threshold (higher = rarer)
float rustMask(vec2 uv, vec2 f, float th, float s){
  float n = fbm(uv, f, 5, s), g = fbm(uv, f * 14.0, 3, s + 50.0);
  return smoothstep(th, th + 0.14, n + (g - 0.5) * 0.3) * (0.5 + 0.5 * g);
}
// ---- shared paint damage model ----
float chipsF(vec2 uv, vec2 f, float s, float dens, float rmax){
  vec4 v = vor(uv * f, f, s); float e = fbm(uv, f * 3.0, 3, s + 3.0) - 0.5; float r = rmax * (0.25 + 0.75 * v.w);
  return step(v.z, dens) * smoothstep(r, r * 0.55, v.x + e * 0.6);
}
// chip: 0 = intact paint .. 1 = through to substrate; stain: thin oxide halo; run: rust run below damage (-V is down)
void paintDmg(vec2 uv, float amt, out float chip, out float stain, out float run){
  float wearN = fbm(uv, vec2(3.0), 6, 21.0);
  float zone = smoothstep(0.58, 0.82, fbm(uv, vec2(2.0), 3, 22.0));      // damage clusters; most of the panel is clean
  float dn = (0.012 + 0.085 * zone) * (0.5 + amt);
  float c1 = chipsF(uv, vec2(20.0, 11.0), 23.0, dn, 0.24);                // vertically stretched flakes
  float c2 = chipsF(uv, vec2(64.0, 40.0), 24.0, dn * 1.6, 0.34);
  float th = 0.925 - 0.06 * amt;
  float c3 = smoothstep(th, th + 0.03, wearN + (fbm(uv, vec2(40.0), 3, 25.0) - 0.5) * 0.12);
  float s1 = scr(uv, 5.0, 26.0, 0.0035, 0.0, 0.4, 0.2 + 0.25 * amt);
  float s2 = scr(uv, 16.0, 27.0, 0.009, 1.57, 0.5, 0.12 + 0.2 * amt);
  float sbreak = smoothstep(0.4, 0.65, fbm(uv, vec2(50.0), 2, 28.0));
  chip = sat(max(max(c1, c2), max(c3, max(s1, s2) * sbreak)));
  vec4 v = vor(uv * vec2(20.0, 11.0), vec2(20.0, 11.0), 23.0);
  float b1 = step(v.z, dn) * smoothstep(0.42, 0.14, v.x) * (0.3 + 0.7 * v.w);
  float bn = fbm(uv, vec2(36.0), 4, 29.0);
  stain = sat(max(b1 * smoothstep(0.4, 0.7, bn) * 0.8, smoothstep(th - 0.03, th + 0.02, wearN) * smoothstep(0.4, 0.7, bn) * 0.7));
  float streak = fbm(uv, vec2(120.0, 1.0), 3, 30.0);
  float rr = 0.0;
  for (int i = 1; i <= 4; i++){
    vec2 q = uv + vec2(0.0, float(i) * 0.034);
    float src = max(chipsF(q, vec2(20.0, 11.0), 23.0, dn, 0.24), smoothstep(th, th + 0.03, fbm(q, vec2(3.0), 6, 21.0)));
    rr = max(rr, src * (1.0 - float(i) / 5.0));
  }
  run = rr * smoothstep(0.5, 0.78, streak);
}
`;
const GLSL_MAIN = `
void main(){ surf(vUv);
  oSel = uSel < 0.5 ? o0 : (uSel < 1.5 ? o1 : o2);
}`;
const GLSL_NORMAL = `
precision highp float;
uniform sampler2D tH; uniform vec2 uK; uniform float uTexel; in vec2 vUv; out vec4 o;
float H(vec2 uv){ vec4 t = texture(tH, uv); return t.r + t.g / 255.0; }
void main(){
  vec2 e = vec2(uTexel, 0.0);
  float l = H(vUv - e.xy), r = H(vUv + e.xy), d = H(vUv - e.yx), u = H(vUv + e.yx);
  float ld = H(vUv - e.xx), rd = H(vUv + vec2(e.x, -e.x)), lu = H(vUv + vec2(-e.x, e.x)), ru = H(vUv + e.xx);
  float gx = (r - l) * 0.5 + (ru + rd - lu - ld) * 0.25, gy = (u - d) * 0.5 + (ru + lu - rd - ld) * 0.25;
  vec3 n = normalize(vec3(-gx * uK.x, -gy * uK.y, 1.0));
  o = vec4(n * 0.5 + 0.5, 1.0);
}`;
const GLSL_COPY = `
precision highp float;
uniform sampler2D tA; uniform float uSq; in vec2 vUv; out vec4 o;
void main(){ vec4 t = texture(tA, vUv); o = uSq > 0.5 ? vec4(t.rgb * t.rgb, t.a) : t; }`;

const GLSL_SURF = {
  asphalt: `
void surf(vec2 uv){
  vec4 a = vor(uv * 110.0, vec2(110.0), 1.0);
  vec4 b = vor(uv * 230.0 + 3.0, vec2(230.0), 2.0);
  float big = fbm(uv, vec2(3.0), 4, 5.0), mid = fbm(uv, vec2(24.0), 4, 6.0), fine = fbm(uv, vec2(300.0), 2, 7.0);
  float jag = fbm(uv, vec2(420.0), 2, 8.0) - 0.5;
  float sa = smoothstep(0.46, 0.3, a.x + jag * 0.3 - (a.y - a.x) * 0.2 + (1.0 - a.w) * 0.12) * step(a.z, 0.62);
  float sb = smoothstep(0.46, 0.3, b.x + jag * 0.2 + (1.0 - b.w) * 0.15) * step(b.z, 0.85);
  float h = max(sa * (0.45 + 0.55 * a.w), sb * 0.5 * (0.5 + 0.5 * b.w));
  h = h * 0.6 + fine * 0.3 + mid * 0.1;
  float wearK = smoothstep(0.3, 0.7, big);
  float stone = sat(max(sa, sb * 0.8));
  vec3 stA = mix(L(0.28, 0.28, 0.29), L(0.45, 0.43, 0.41), a.w); stA = mix(stA, L(0.42, 0.35, 0.28), step(0.9, a.z * 0.5 + a.w * 0.6));
  vec3 stB = mix(L(0.26, 0.26, 0.28), L(0.44, 0.43, 0.42), b.w);
  vec3 col = L(0.13, 0.13, 0.135) * (0.8 + 0.4 * mid);
  col = mix(col, stB, sb * 0.7 * (0.45 + 0.55 * wearK));
  col = mix(col, stA, sa * (0.5 + 0.45 * wearK));
  col *= 0.8 + 0.4 * big;
  float cn = fbm(uv + vec2(0.13, 0.4), vec2(2.0), 3, 9.0);
  float band = smoothstep(0.016, 0.009, abs(cn - 0.5) + (fbm(uv, vec2(70.0), 2, 13.0) - 0.5) * 0.008) * smoothstep(0.4, 0.6, fbm(uv, vec2(2.0), 2, 12.0));
  col = mix(col, L(0.075, 0.075, 0.08), band * 0.93);
  h = mix(h, 0.74 + fine * 0.05 + sa * 0.04, band * 0.88);
  float r = mix(0.93, 0.74, stone * (0.4 + 0.6 * wearK)); r = mix(r, 0.36, band);
  float oil = smoothstep(0.72, 0.86, fbm(uv + 0.5, vec2(5.0), 4, 14.0)); col *= 1.0 - oil * 0.45; r = mix(r, 0.5, oil * 0.6);
  emit(col, 1.0, h, mix(0.55, 1.0, smoothstep(0.0, 0.6, h)), r, 0.0);
}`,
  concrete: `
void surf(vec2 uv){
  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(12.0), 5, 2.0), fine = fbm(uv, vec2(180.0), 3, 3.0);
  float form = fbm(uv, vec2(2.0, 7.0), 5, 4.0);
  vec4 po = vor(uv * 70.0, vec2(70.0), 5.0); float pore = step(po.z, 0.35) * smoothstep(0.16 * po.w + 0.03, 0.02, po.x);
  vec4 po2 = vor(uv * 260.0, vec2(260.0), 6.0); float pore2 = step(po2.z, 0.5) * smoothstep(0.3 * po2.w, 0.05, po2.x);
  vec2 wu = uv + (vec2(fbm(uv, vec2(6.0), 3, 7.0), fbm(uv, vec2(6.0), 3, 8.0)) - 0.5) * 0.12 + (vec2(fbm(uv, vec2(48.0), 3, 17.0), fbm(uv, vec2(48.0), 3, 18.0)) - 0.5) * 0.022;
  vec4 cr = vor(wu * 3.0, vec2(3.0), 9.0);
  float crack = smoothstep(0.0045, 0.0012, cr.y - cr.x) * smoothstep(0.45, 0.6, fbm(uv, vec2(3.0), 2, 10.0));
  float chip = smoothstep(0.83, 0.87, fbm(uv, vec2(7.0), 4, 11.0) + (fine - 0.5) * 0.08 + (mid - 0.5) * 0.06);
  vec4 ag = vor(uv * 140.0, vec2(140.0), 12.0); float stone = smoothstep(0.5, 0.3, ag.x) * step(ag.z, 0.6);
  vec2 dj = min(uv, 1.0 - uv); float jd = min(dj.x, dj.y);
  float joint = smoothstep(0.0022, 0.0012, jd), jstain = smoothstep(0.07, 0.0, jd + (mid - 0.5) * 0.04);
  float h = 0.6 + (mid - 0.5) * 0.25 + (fine - 0.5) * 0.12 + (form - 0.5) * 0.06;
  h -= pore * 0.35 + pore2 * 0.08 + crack * 0.2; h = mix(h, 0.42 + stone * 0.12 + fine * 0.08, chip); h = mix(h, 0.05, joint);
  vec3 col = L(0.53, 0.52, 0.49) * (0.72 + 0.4 * big + 0.22 * (mid - 0.5) + 0.08 * (form - 0.5));
  col *= mix(vec3(1.04, 1.0, 0.94), vec3(0.95, 1.0, 1.05), fbm(uv, vec2(3.0), 3, 13.0));
  float st = smoothstep(0.55, 0.8, fbm(uv, vec2(4.0), 5, 14.0)); col *= 1.0 - st * 0.3;
  float ef = smoothstep(0.66, 0.85, fbm(uv, vec2(5.0), 4, 15.0)) * sat(fine * 1.6 - 0.2); col = mix(col, L(0.68, 0.67, 0.64), ef * 0.22);
  col *= 1.0 - pore * 0.5 - pore2 * 0.2 - crack * 0.6;
  vec3 agc = mix(L(0.38, 0.37, 0.35), L(0.54, 0.52, 0.47), ag.w); agc = mix(agc, L(0.46, 0.41, 0.34), step(0.45, ag.z));
  col = mix(col, mix(L(0.4, 0.39, 0.37) * (0.8 + 0.4 * fine), agc, stone * 0.8), chip);
  col *= 1.0 - jstain * 0.25; col = mix(col, L(0.1, 0.1, 0.1), joint);
  float r = 0.82 + (mid - 0.5) * 0.2 - (form - 0.5) * 0.15; r = mix(r, 0.95, chip); r = mix(r, 0.62, st * 0.3);
  float ao = 1.0 - pore * 0.5 - crack * 0.5 - joint * 0.6 - chip * 0.15;
  float pa = smoothstep(0.40, 0.47, fbm(uv, vec2(9.0), 5, 16.0) + (mid - 0.5) * 0.2) * (1.0 - chip) * (1.0 - crack) * (1.0 - pore);
  emit(col, pa, h, ao, r, 0.0);
}`,
  brick: `
void surf(vec2 uv){
  float rows = 24.0, cols = 8.0; float y = uv.y * rows; float row = floor(y); float x = uv.x * cols + 0.5 * mod(row, 2.0); float cl = floor(x);
  vec2 f = vec2(fract(x), fract(y)); vec3 id = h3(vec2(cl, row), vec2(cols, rows), 1.0);
  float ed = fbm(uv, vec2(60.0), 3, 2.0);
  vec2 d = min(f, 1.0 - f) * vec2(225.0, 75.0);
  float mort = 5.0 + (ed - 0.5) * 5.0; float dm = min(d.x, d.y); float brick = smoothstep(mort, mort + 3.0, dm);
  float fine = fbm(uv, vec2(200.0), 3, 3.0), mid = fbm(uv, vec2(30.0), 4, 4.0);
  vec3 c = mix(L(0.52, 0.27, 0.2), L(0.42, 0.2, 0.15), id.x); c = mix(c, L(0.3, 0.17, 0.15), smoothstep(0.75, 1.0, id.y)); c = mix(c, L(0.58, 0.38, 0.26), smoothstep(0.85, 1.0, id.z));
  c *= (0.8 + 0.4 * mid) * (0.9 + 0.2 * fine);
  float pit = smoothstep(0.7, 0.8, fbm(uv, vec2(90.0), 3, 5.0)); c *= 1.0 - pit * 0.35;
  vec3 mc = L(0.5, 0.48, 0.44) * (0.75 + 0.5 * fine);
  float soot = smoothstep(0.5, 0.8, fbm(uv, vec2(3.0), 4, 6.0));
  vec3 col = mix(mc, c, brick) * (1.0 - soot * 0.35);
  float ef = smoothstep(0.7, 0.85, fbm(uv, vec2(5.0), 4, 7.0)) * brick; col = mix(col, L(0.7, 0.68, 0.64), ef * 0.3);
  float h = mix(0.25 + fine * 0.1, 0.7 + (mid - 0.5) * 0.15 + (fine - 0.5) * 0.1 - pit * 0.2 + (id.x - 0.5) * 0.12, brick);
  emit(col, 1.0, h, mix(0.6, 1.0, brick) * (1.0 - pit * 0.3), mix(0.95, 0.86 + (mid - 0.5) * 0.15, brick), 0.0);
}`,
  epoxy: `
void surf(vec2 uv){
  float big = fbm(uv, vec2(3.0), 5, 1.0), mid = fbm(uv, vec2(20.0), 4, 2.0), fine = fbm(uv, vec2(250.0), 2, 3.0), mott = fbm(uv, vec2(9.0), 5, 11.0);
  vec3 col = L(0.41, 0.445, 0.435) * (0.78 + 0.3 * big + 0.22 * (mott - 0.5));
  col *= mix(vec3(1.03, 1.0, 0.97), vec3(0.95, 1.0, 1.03), fbm(uv, vec2(2.0), 3, 19.0));
  vec4 ag = vor(uv * 180.0, vec2(180.0), 12.0); col *= 1.0 + (ag.w - 0.5) * 0.14 * smoothstep(0.5, 0.2, ag.x);
  float gloss = smoothstep(0.35, 0.62, fbm(uv, vec2(5.0), 5, 4.0));          // sealer still intact
  float lane = smoothstep(0.35, 0.65, fbm(uv, vec2(1.0, 3.0), 3, 13.0));     // traffic lanes worn matt
  float worn = sat(1.0 - gloss * 0.85 + lane * 0.45 - 0.15);
  float sc1 = scr(uv, 14.0, 5.0, 0.012, 0.5, 6.3, 0.7), sc2 = scr(uv, 40.0, 6.0, 0.02, 0.0, 6.3, 0.5);
  float t1 = abs(uv.y - 0.31 - 0.06 * sin(uv.x * TAU)), t2 = abs(uv.x - 0.62 - 0.09 * sin(uv.y * TAU + 1.0));
  float t3 = abs(uv.y - 0.74 - 0.1 * sin(uv.x * TAU * 2.0 + 2.0)), t4 = abs(uv.x - 0.2 - 0.05 * sin(uv.y * TAU + 4.0));
  float tread = 0.6 + 0.4 * sin((uv.x + uv.y) * TAU * 90.0);
  float tm = smoothstep(0.022, 0.016, t1) * smoothstep(0.35, 0.6, fbm(uv, vec2(8.0), 3, 7.0)) + smoothstep(0.02, 0.014, t2) * smoothstep(0.4, 0.65, fbm(uv, vec2(6.0), 3, 8.0))
           + smoothstep(0.026, 0.018, t3) * smoothstep(0.45, 0.7, fbm(uv, vec2(5.0), 3, 14.0)) + smoothstep(0.018, 0.012, t4) * smoothstep(0.4, 0.65, fbm(uv, vec2(7.0), 3, 15.0));
  tm = sat(tm * tread);
  col = mix(col, L(0.1, 0.1, 0.105), tm * 0.75);
  col *= 1.0 - worn * 0.1; col = mix(col, col * 1.25, sc1 * 0.4);
  float dirt = smoothstep(0.55, 0.85, fbm(uv, vec2(2.0), 4, 9.0)); col = mix(col, L(0.3, 0.29, 0.26), dirt * 0.3);
  float r = mix(0.1, 0.52, worn) + sc1 * 0.2 + sc2 * 0.15 + tm * 0.3 + dirt * 0.2 + (mid - 0.5) * 0.12 + (mott - 0.5) * 0.1;
  float h = 0.5 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.06 - sc1 * 0.2 - sc2 * 0.08 + tm * 0.05 + (gloss - 0.5) * 0.03;
  float chip = smoothstep(0.87, 0.9, fbm(uv, vec2(14.0), 5, 10.0) + (fine - 0.5) * 0.06); col = mix(col, L(0.44, 0.44, 0.43) * (0.75 + 0.5 * fine), chip); h -= chip * 0.3; r = mix(r, 0.85, chip);
  emit(col, 1.0, h, 1.0 - chip * 0.2, r, 0.0);
}`,
  paint: `
void surf(vec2 uv){
  float chip, stain, run; paintDmg(uv, uP.x, chip, stain, run);
  float shade = 0.8, baseR = 0.40;
  
  float fine = fbm(uv, vec2(260.0), 2, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float chalk = smoothstep(0.3, 0.8, fbm(uv, vec2(1.0, 2.0), 4, 4.0));
  float dirt = smoothstep(0.42, 0.85, fbm(uv, vec2(3.0, 2.0), 5, 5.0));
  float vs1 = fbm(uv, vec2(70.0, 1.0), 3, 6.0), vs2 = fbm(uv, vec2(22.0, 1.0), 3, 16.0), vs3 = fbm(uv, vec2(9.0, 2.0), 3, 17.0);
  float steel = smoothstep(0.55, 0.8, chip);
  float primer = smoothstep(0.15, 0.4, chip) * (1.0 - steel);
  float rustN = fbm(uv, vec2(60.0), 4, 7.0);
  float fresh = steel * smoothstep(0.78, 0.86, fbm(uv, vec2(25.0), 3, 8.0));
  vec3 rustC = mix(L(0.2, 0.135, 0.105), L(0.36, 0.23, 0.15), rustN);
  rustC = mix(rustC, L(0.5, 0.33, 0.18), smoothstep(0.7, 0.95, fbm(uv, vec2(120.0), 2, 9.0)) * 0.5);
  vec3 nt = vec3(0.0); float ta = shade * (0.9 + 0.2 * (mid - 0.5) + 0.2 * (big - 0.5));
  // dirt film: broad grime + fine and broad vertical wash streaks
  float df = sat(dirt * 0.3 + smoothstep(0.55, 0.85, vs1) * 0.3 * (0.4 + dirt) + smoothstep(0.55, 0.8, vs2) * 0.38 * (0.3 + dirt) + smoothstep(0.5, 0.8, vs3) * 0.2);
  float clean = smoothstep(0.6, 0.85, 1.0 - vs2) * 0.5;            // rain-washed lighter streaks
  float rs = sat(stain * 0.7 + run * 0.85);
  ta *= 1.0 + clean * 0.08 - chalk * 0.06;
  OV(vec3(0.72), chalk * 0.075 + clean * 0.02);
  OV(L(0.24, 0.22, 0.19), df * 0.42);
  OV(mix(L(0.3, 0.2, 0.14), L(0.44, 0.28, 0.16), rustN), rs * 0.5);
  OV(mix(L(0.5, 0.25, 0.2), L(0.55, 0.54, 0.5), 0.35), primer);
  OV(rustC, steel);
  OV(L(0.55, 0.55, 0.57), fresh);
  float h = 0.62 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.04;
  h = mix(h, 0.5, primer); h = mix(h, 0.36 + rustN * 0.14, steel); h += rs * 0.02 * rustN;
  float r = baseR + chalk * 0.26 + df * 0.3 - clean * 0.06 + (mid - 0.5) * 0.14 + (big - 0.5) * 0.1; r = mix(r, 0.75, primer); r = mix(r, 0.92, steel); r = mix(r, 0.35, fresh); r = mix(r, 0.72, rs * 0.6);
  float m = fresh * 0.95 + (steel - fresh) * 0.15;
  float ao = 1.0 - steel * 0.25 - primer * 0.1;

  emit(nt, ta, h, ao, r, m);
}`,
  hazard: `
void surf(vec2 uv){
  float chip, stain, run; paintDmg(uv, 1.4, chip, stain, run);
  float shade = 1.0, baseR = 0.5;
  
  float fine = fbm(uv, vec2(260.0), 2, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float chalk = smoothstep(0.3, 0.8, fbm(uv, vec2(1.0, 2.0), 4, 4.0));
  float dirt = smoothstep(0.42, 0.85, fbm(uv, vec2(3.0, 2.0), 5, 5.0));
  float vs1 = fbm(uv, vec2(70.0, 1.0), 3, 6.0), vs2 = fbm(uv, vec2(22.0, 1.0), 3, 16.0), vs3 = fbm(uv, vec2(9.0, 2.0), 3, 17.0);
  float steel = smoothstep(0.55, 0.8, chip);
  float primer = smoothstep(0.15, 0.4, chip) * (1.0 - steel);
  float rustN = fbm(uv, vec2(60.0), 4, 7.0);
  float fresh = steel * smoothstep(0.78, 0.86, fbm(uv, vec2(25.0), 3, 8.0));
  vec3 rustC = mix(L(0.2, 0.135, 0.105), L(0.36, 0.23, 0.15), rustN);
  rustC = mix(rustC, L(0.5, 0.33, 0.18), smoothstep(0.7, 0.95, fbm(uv, vec2(120.0), 2, 9.0)) * 0.5);
  vec3 nt = vec3(0.0); float ta = shade * (0.9 + 0.2 * (mid - 0.5) + 0.2 * (big - 0.5));
  // dirt film: broad grime + fine and broad vertical wash streaks
  float df = sat(dirt * 0.3 + smoothstep(0.55, 0.85, vs1) * 0.3 * (0.4 + dirt) + smoothstep(0.55, 0.8, vs2) * 0.38 * (0.3 + dirt) + smoothstep(0.5, 0.8, vs3) * 0.2);
  float clean = smoothstep(0.6, 0.85, 1.0 - vs2) * 0.5;            // rain-washed lighter streaks
  float rs = sat(stain * 0.7 + run * 0.85);
  ta *= 1.0 + clean * 0.08 - chalk * 0.06;
  OV(vec3(0.72), chalk * 0.075 + clean * 0.02);
  OV(L(0.24, 0.22, 0.19), df * 0.42);
  OV(mix(L(0.3, 0.2, 0.14), L(0.44, 0.28, 0.16), rustN), rs * 0.5);
  OV(mix(L(0.5, 0.25, 0.2), L(0.55, 0.54, 0.5), 0.35), primer);
  OV(rustC, steel);
  OV(L(0.55, 0.55, 0.57), fresh);
  float h = 0.62 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.04;
  h = mix(h, 0.5, primer); h = mix(h, 0.36 + rustN * 0.14, steel); h += rs * 0.02 * rustN;
  float r = baseR + chalk * 0.26 + df * 0.3 - clean * 0.06 + (mid - 0.5) * 0.14 + (big - 0.5) * 0.1; r = mix(r, 0.75, primer); r = mix(r, 0.92, steel); r = mix(r, 0.35, fresh); r = mix(r, 0.72, rs * 0.6);
  float m = fresh * 0.95 + (steel - fresh) * 0.15;
  float ao = 1.0 - steel * 0.25 - primer * 0.1;

  float s = fract((uv.x + uv.y) * 5.0);
  float yel = smoothstep(0.244, 0.256, abs(s - 0.5) + (fbm(uv, vec2(80.0), 2, 41.0) - 0.5) * 0.02);
  vec3 pc = mix(L(0.1, 0.1, 0.11), L(0.86, 0.66, 0.1), yel);
  emit(nt + pc * ta, 1.0, h, ao, r, m);
}`,
  hull: `
void surf(vec2 uv){
  float ry = uv.y * 2.0; float row = floor(ry); float fy = fract(ry); float sx = fract(uv.x + 0.5 * mod(row, 2.0));
  float dh = min(fy, 1.0 - fy) * 2.0, dv = min(sx, 1.0 - sx) * 4.0; float dseam = min(dh, dv);
  float wn = fbm(uv, vec2(200.0), 2, 1.0);
  float bead = smoothstep(0.012, 0.004, dseam + (wn - 0.5) * 0.004);
  float ripple = 0.75 + 0.25 * sin((uv.x + uv.y) * TAU * 400.0);
  float dish = cos(uv.x * TAU * 8.0) * 0.5 + 0.5;
  float big = fbm(uv, vec2(2.0), 4, 2.0), mid = fbm(uv, vec2(14.0), 4, 3.0), fine = fbm(uv, vec2(220.0), 2, 4.0);
  float roller = fbm(uv, vec2(120.0, 30.0), 3, 5.0);
  float seamK = smoothstep(0.12, 0.0, dseam);
  float pit = fbm(uv, vec2(70.0), 4, 7.0);
  float rust = smoothstep(0.72, 0.79, fbm(uv, vec2(10.0), 5, 6.0) + seamK * 0.2);
  rust *= smoothstep(0.3, 0.5, pit + rust * 0.3);
  float streak = fbm(uv, vec2(110.0, 1.0), 3, 8.0);
  float wp = 0.0;
  for (int i = 1; i <= 4; i++){
    vec2 q = uv + vec2(0.0, float(i) * 0.03); float qy = fract(q.y * 2.0);
    float qs = smoothstep(0.02, 0.0, min(qy, 1.0 - qy) * 2.0); float qr = smoothstep(0.72, 0.79, fbm(q, vec2(10.0), 5, 6.0));
    wp = max(wp, max(qs * 0.7, qr) * (1.0 - float(i) / 5.0));
  }
  float weep = wp * smoothstep(0.4, 0.75, streak);
  float salt = smoothstep(0.6, 0.85, fbm(uv, vec2(3.0, 9.0), 4, 9.0));
  vec3 nt = vec3(0.0); float ta = 0.82 * (0.88 + 0.2 * (big - 0.5) + 0.14 * (mid - 0.5) + 0.08 * (roller - 0.5));
  OV(vec3(0.6), salt * 0.025 * (0.5 + roller));
  OV(L(0.45, 0.27, 0.14), weep * 0.7);
  OV(mix(L(0.25, 0.16, 0.11), L(0.5, 0.31, 0.17), pit), rust);
  float h = 0.5 + (roller - 0.5) * 0.05 + (fine - 0.5) * 0.03 + bead * 0.35 * ripple + (dish - 0.5) * 0.1 - rust * 0.08 * (1.0 - pit);
  float r = 0.5 + (mid - 0.5) * 0.15 + salt * 0.2; r = mix(r, 0.9, rust); r = mix(r, 0.7, weep * 0.5);
  emit(nt, ta, h, 1.0 - rust * 0.2 - smoothstep(0.03, 0.012, dseam) * (1.0 - bead) * 0.3, r, rust * 0.1);
}`,
  galv: `
void surf(vec2 uv){
  vec2 wu = uv + (vec2(fbm(uv, vec2(8.0), 2, 1.0), fbm(uv, vec2(8.0), 2, 2.0)) - 0.5) * 0.03;
  vec4 a = vor(wu * 22.0, vec2(22.0), 3.0); vec4 b = vor(wu * 50.0 + 1.5, vec2(50.0), 4.0);
  float sp = mix(a.w, b.w, 0.35);
  float edge = smoothstep(0.0, 0.08, a.y - a.x);
  float big = fbm(uv, vec2(2.0), 4, 5.0), fine = fbm(uv, vec2(200.0), 2, 6.0), mid = fbm(uv, vec2(20.0), 4, 7.0);
  vec3 col = vec3(0.56, 0.58, 0.6) * (0.72 + 0.4 * sp) * (0.92 + 0.16 * big);
  float wr = smoothstep(0.55, 0.85, fbm(uv, vec2(6.0), 5, 8.0)) * (0.4 + 0.6 * fbm(uv, vec2(90.0), 3, 10.0));
  col = mix(col, L(0.74, 0.74, 0.72), wr * 0.4);
  float rs = rustMask(uv, vec2(9.0), 0.8, 9.0);
  col = mix(col, L(0.42, 0.27, 0.16) * (0.7 + 0.6 * fine), rs);
  float r = 0.3 + 0.28 * sp + (mid - 0.5) * 0.15 + wr * 0.3; r = mix(r, 0.9, rs);
  float h = 0.5 + (sp - 0.5) * 0.08 * edge + (fine - 0.5) * 0.04 + wr * 0.05 * fine - (1.0 - edge) * 0.03;
  emit(col, 1.0, h, 1.0, r, 1.0 - wr * 0.45 - rs * 0.9);
}`,
  metal: `
void surf(vec2 uv){
  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(18.0), 4, 2.0), fine = fbm(uv, vec2(240.0), 2, 3.0);
  float smudge = fbm(uv, vec2(5.0, 7.0), 5, 4.0);
  float s1 = scr(uv, 9.0, 5.0, 0.006, 0.2, 6.3, 0.6), s2 = scr(uv, 30.0, 6.0, 0.012, 1.0, 6.3, 0.5), s3 = scr(uv, 70.0, 7.0, 0.03, 2.0, 6.3, 0.4);
  float sc = sat(max(s1, max(s2 * 0.8, s3 * 0.5)));
  float rust = rustMask(uv, vec2(12.0), 0.74, 8.0) * uP.x;
  float scale_ = smoothstep(0.4, 0.7, fbm(uv, vec2(7.0), 4, 10.0));
  vec3 nt = vec3(0.0); float ta = 0.95 * (0.85 + 0.2 * (big - 0.5) + 0.16 * (mid - 0.5)) * (1.0 - scale_ * 0.18);
  OV(vec3(0.55, 0.56, 0.58), sc * 0.3);
  OV(mix(L(0.27, 0.17, 0.12), L(0.5, 0.31, 0.17), fbm(uv, vec2(90.0), 3, 11.0)), rust);
  float r = 0.42 + (smudge - 0.5) * 0.3 + (mid - 0.5) * 0.1 - sc * 0.15 + scale_ * 0.08; r = mix(r, 0.9, rust);
  float h = 0.5 + (fine - 0.5) * 0.04 + (mid - 0.5) * 0.04 - sc * 0.12 + rust * 0.08 * fine;
  emit(nt, ta, h, 1.0 - rust * 0.2, r, 1.0 - rust * 0.85);
}`,
  brushed: `
void surf(vec2 uv){
  float l1 = fbm(uv, vec2(2.0, 300.0), 3, 1.0), l2 = fbm(uv, vec2(6.0, 120.0), 3, 2.0), l3 = fbm(uv, vec2(1.0, 500.0), 2, 12.0);
  float big = fbm(uv, vec2(3.0), 4, 3.0), smudge = fbm(uv, vec2(6.0), 5, 4.0);
  float sc = scr(uv, 12.0, 5.0, 0.008, 0.6, 6.3, 0.4);
  float tar = smoothstep(0.45, 0.9, fbm(uv, vec2(5.0), 5, 6.0));
  vec3 nt = vec3(0.0); float ta = 0.95 * (0.82 + 0.16 * (l1 - 0.5) + 0.14 * (l2 - 0.5) + 0.1 * (big - 0.5)) * (1.0 - tar * 0.13);
  OV(vec3(0.7), sc * 0.2);
  float r = 0.3 + (l1 - 0.5) * 0.2 + (smudge - 0.5) * 0.2 + tar * 0.18 - sc * 0.08;
  float h = 0.5 + (l1 - 0.5) * 0.2 + (l3 - 0.5) * 0.2 + (l2 - 0.5) * 0.1 - sc * 0.2;
  emit(nt, ta, h, 1.0, r, 1.0);
}`,
  rust: `
void surf(vec2 uv){
  vec2 wu = uv + (vec2(fbm(uv, vec2(5.0), 3, 1.0), fbm(uv, vec2(5.0), 3, 2.0)) - 0.5) * 0.08;
  float n = fbm(wu, vec2(6.0), 7, 3.0);
  float fl = fbm(wu, vec2(11.0), 6, 4.0);
  float tf = fract(fl * 4.0); float layer = floor(fl * 4.0) / 4.0 + smoothstep(0.0, 0.45, tf) * 0.25;
  float flakeEdge = smoothstep(0.1, 0.0, tf) * smoothstep(0.4, 0.6, fbm(uv, vec2(9.0), 3, 14.0));
  vec4 pv = vor(uv * 70.0, vec2(70.0), 5.0); float pit = step(pv.z, 0.5) * smoothstep(0.35 * pv.w + 0.05, 0.03, pv.x);
  vec4 pv2 = vor(uv * 190.0, vec2(190.0), 15.0); float speck = smoothstep(0.35, 0.1, pv2.x) * step(pv2.z, 0.4);
  float grain = fbm(uv, vec2(220.0), 3, 6.0);
  float scaleI = smoothstep(0.75, 0.8, fbm(wu, vec2(4.0), 5, 7.0) + (grain - 0.5) * 0.1);
  float h = 0.25 + layer * 0.4 + (n - 0.5) * 0.3 + (grain - 0.5) * 0.14 - pit * 0.2 + speck * 0.04;
  h = mix(h, 0.8 + (grain - 0.5) * 0.04, scaleI);
  float t = sat(layer * 0.5 + n * 0.55 + (grain - 0.5) * 0.35);
  vec3 c = mix(L(0.26, 0.17, 0.13), L(0.4, 0.25, 0.16), smoothstep(0.25, 0.6, t));
  float bloom = smoothstep(0.55, 0.85, fbm(uv, vec2(7.0), 5, 8.0));
  c = mix(c, L(0.55, 0.34, 0.17), bloom * (0.35 + 0.65 * smoothstep(0.4, 0.7, t)));
  c = mix(c, L(0.62, 0.45, 0.25), smoothstep(0.7, 0.95, fbm(uv, vec2(34.0), 4, 18.0)) * 0.4);
  c = mix(c, L(0.2, 0.14, 0.12), sat(flakeEdge * 0.6 + pit * 0.7));
  c *= (0.8 + 0.4 * grain) * (0.9 + 0.2 * speck);
  float streak = fbm(uv, vec2(60.0, 2.0), 3, 9.0); c = mix(c, L(0.5, 0.31, 0.17), smoothstep(0.55, 0.8, streak) * 0.2);
  c = mix(c, L(0.3, 0.3, 0.33) * (0.8 + 0.4 * grain), scaleI);
  float r = 0.9 + (grain - 0.5) * 0.15 - bloom * 0.06; r = mix(r, 0.55, scaleI);
  emit(c, 1.0, h, 1.0 - pit * 0.4 - flakeEdge * 0.25, r, scaleI * 0.35);
}`,
  diamond: `
void surf(vec2 uv){
  vec2 p = uv * 12.0; vec2 i = floor(p); vec2 q = fract(p) - 0.5; float par = mod(i.x + i.y, 2.0);
  vec2 d = (par < 0.5 ? vec2(q.x + q.y, q.x - q.y) : vec2(q.x - q.y, q.x + q.y)) * 0.7071;
  float e = length(d * vec2(1.0 / 0.46, 1.0 / 0.13));
  float loz = smoothstep(1.0, 0.55, e), top = smoothstep(0.75, 0.4, e);
  float big = fbm(uv, vec2(2.0), 4, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), fine = fbm(uv, vec2(200.0), 2, 3.0);
  float wear = smoothstep(0.3, 0.7, big);
  float grime = (1.0 - loz) * smoothstep(0.3, 0.65, fbm(uv, vec2(8.0), 4, 4.0));
  float sc = scr(uv, 20.0, 5.0, 0.02, 0.0, 6.3, 0.5);
  vec3 col = vec3(0.42, 0.43, 0.45) * (0.85 + 0.3 * (mid - 0.5));
  col = mix(col, vec3(0.68, 0.69, 0.7), top * (0.4 + 0.6 * wear));
  col = mix(col, L(0.22, 0.19, 0.16), grime * 0.8);
  float rust = smoothstep(0.7, 0.86, fbm(uv, vec2(10.0), 5, 6.0) + (fine - 0.5) * 0.12) * (1.0 - top) * (0.6 + 0.4 * fine); col = mix(col, L(0.42, 0.27, 0.16) * (0.7 + 0.6 * fine), rust);
  float r = 0.5 + (mid - 0.5) * 0.15; r = mix(r, 0.22, top * (0.4 + 0.6 * wear)); r = mix(r, 0.85, grime); r = mix(r, 0.9, rust); r -= sc * 0.1;
  float h = 0.2 + loz * 0.7 + (fine - 0.5) * 0.03 - sc * 0.03 * top;
  emit(col, 1.0, h, mix(1.0, 0.6, smoothstep(1.5, 1.0, e) * (1.0 - loz)), r, 1.0 - grime * 0.8 - rust * 0.9);
}`,
  corrugated: `
void surf(vec2 uv){
  float w = uv.x * 10.0; float cz = 0.5 + 0.5 * cos(w * TAU);
  float big = fbm(uv, vec2(2.0), 4, 1.0), fine = fbm(uv, vec2(160.0, 480.0), 2, 3.0);
  float streak = fbm(uv, vec2(40.0, 1.0), 3, 6.0), streak2 = fbm(uv, vec2(10.0, 1.0), 3, 16.0);
  float lapV = smoothstep(0.004, 0.0015, abs(uv.y - 0.012) * 2.286);
  float lapZone = smoothstep(0.32, 0.0, (uv.y - 0.012) * 2.286) * step(0.012, uv.y);       // drip end of the upper sheet
  float fi = floor(w + 0.5); float onC = step(mod(fi, 5.0), 0.5);
  float fd = length(vec2((w - fi) / 10.0 * 0.762, (uv.y - 0.5) * 2.286));
  float fast = onC * smoothstep(0.008, 0.006, fd), washer = onC * smoothstep(0.014, 0.011, fd) * (1.0 - fast);
  float rg = fbm(uv, vec2(90.0, 270.0), 3, 15.0);
  float which = smoothstep(0.45, 0.7, fbm(uv, vec2(3.0, 1.0), 3, 5.0));
  float rust = smoothstep(0.5, 0.95, lapZone * which * (0.55 + 0.9 * streak) + (rg - 0.5) * 0.22) * (0.5 + 0.5 * rg);
  vec3 col = vec3(0.43, 0.47, 0.52) * (0.9 + 0.2 * (big - 0.5)) * (0.95 + 0.1 * (streak2 - 0.5));
  col = mix(col, vec3(0.6, 0.62, 0.64), smoothstep(0.6, 0.9, streak) * 0.12);
  float dirtV = (1.0 - cz) * smoothstep(0.4, 0.75, fbm(uv, vec2(3.0, 2.0), 4, 7.0)) * 0.5;
  col = mix(col, L(0.25, 0.24, 0.22), dirtV * 0.6);
  col = mix(col, mix(L(0.24, 0.16, 0.12), L(0.42, 0.28, 0.17), rg), rust);
  col = mix(col, vec3(0.5, 0.52, 0.54), fast); col *= 1.0 - washer * 0.4;
  col *= 1.0 - lapV * 0.5;
  float h = cz * 0.9 + (fine - 0.5) * 0.008 + fast * 0.05 - lapV * 0.03;
  float r = 0.5 + (streak2 - 0.5) * 0.14 + (big - 0.5) * 0.12; r = mix(r, 0.8, dirtV); r = mix(r, 0.92, rust);
  emit(col, 1.0, h, mix(0.72, 1.0, smoothstep(0.0, 0.6, cz)) * (1.0 - lapV * 0.4), r, 0.72 * (1.0 - rust * 0.9) * (1.0 - dirtV * 0.6));
}`,
  chainlink: `
void surf(vec2 uv){
  float n = 7.0; float a = (uv.x + uv.y) * n, b = (uv.x - uv.y) * n;
  float da = abs(fract(a) - 0.5), db = abs(fract(b) - 0.5);
  float rw = 0.044;
  float over = mod(floor(a) + floor(b), 2.0) < 0.5 ? 1.0 : -1.0;
  float pa = sqrt(max(0.0, 1.0 - (da / rw) * (da / rw))), pb = sqrt(max(0.0, 1.0 - (db / rw) * (db / rw)));
  float za = over * cos((fract(b) - 0.5) * 3.14159), zb = -over * cos((fract(a) - 0.5) * 3.14159);
  float ha = da < rw ? 0.45 + 0.2 * za + 0.3 * pa : 0.0, hb = db < rw ? 0.45 + 0.2 * zb + 0.3 * pb : 0.0;
  float px = uTexel * n * 1.41421;
  float alpha = max(smoothstep(rw + px * 0.5, rw - px * 0.5, da), smoothstep(rw + px * 0.5, rw - px * 0.5, db));
  float fine = fbm(uv, vec2(120.0), 3, 1.0);
  vec3 col = vec3(0.6, 0.62, 0.64) * (0.8 + 0.3 * fine);
  float rust = smoothstep(0.62, 0.75, fbm(uv, vec2(9.0), 4, 3.0)); col = mix(col, L(0.42, 0.26, 0.15), rust * 0.8);
  emit(col, alpha, max(ha, hb), 1.0, mix(0.4 + 0.2 * fine, 0.9, rust), 1.0 - rust * 0.9);
}`,
  gunmetal: `
void surf(vec2 uv){
  float fine = fbm(uv, vec2(160.0), 3, 1.0), mid = fbm(uv, vec2(12.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  vec4 g = vor(uv * 200.0, vec2(200.0), 4.0);
  float wear = smoothstep(0.66, 0.92, fbm(uv, vec2(4.0), 5, 5.0) + (fine - 0.5) * 0.1) * uP.x;
  float s1 = scr(uv, 8.0, 6.0, 0.005, 0.3, 6.3, 0.3), s2 = scr(uv, 24.0, 7.0, 0.011, 1.2, 6.3, 0.32), s3 = scr(uv, 60.0, 8.0, 0.03, 0.0, 6.3, 0.3);
  float sc = sat(max(s1 * uP.x, max(s2 * 0.8, s3 * 0.6)));
  float bright = sat(wear * 0.22 + sc * (0.3 + 0.4 * uP.x));
  float oil = smoothstep(0.4, 0.75, fbm(uv, vec2(3.0, 5.0), 4, 9.0));
  vec3 nt = vec3(0.0); float ta = 0.9 * (0.8 + 0.25 * (mid - 0.5) + 0.2 * (g.w - 0.5) + 0.15 * (big - 0.5));
  OV(vec3(0.42, 0.42, 0.44), bright * 0.6);
  float r = 0.58 + (g.w - 0.5) * 0.12 + (mid - 0.5) * 0.1 - oil * 0.14 - wear * 0.14; r = mix(r, 0.3, bright * 0.8);
  float h = 0.5 + (g.x - 0.5) * 0.12 + (fine - 0.5) * 0.1 - sc * 0.25 - wear * 0.05;
  emit(nt, ta, h, 1.0 - sc * 0.1, r, mix(0.75, 1.0, bright));
}`,
  polymer: `
void surf(vec2 uv){
  vec4 g = vor(uv * 40.0, vec2(40.0), 1.0); vec4 g2 = vor(uv * 90.0 + 0.5, vec2(90.0), 2.0);
  float fine = fbm(uv, vec2(120.0), 2, 3.0), big = fbm(uv, vec2(3.0), 4, 4.0);
  float stip = smoothstep(0.6, 0.1, g.x) * (0.5 + 0.5 * g.w) * 0.7 + smoothstep(0.6, 0.1, g2.x) * 0.3;
  float scuff = smoothstep(0.62, 0.8, fbm(uv, vec2(4.0), 5, 5.0));
  float sc = scr(uv, 10.0, 6.0, 0.01, 0.5, 6.3, 0.4);
  vec3 nt = vec3(0.0); float ta = 0.92 * (0.9 + 0.12 * (big - 0.5) + 0.08 * (fine - 0.5));
  OV(vec3(0.45), sc * 0.25 + scuff * 0.06);
  float h = 0.3 + stip * 0.6 * (1.0 - scuff * 0.6) + (fine - 0.5) * 0.05 - sc * 0.2;
  float r = 0.62 + (stip - 0.5) * 0.1 + (big - 0.5) * 0.1 - scuff * 0.22 + sc * 0.1;
  emit(nt, ta, h, 0.8 + 0.2 * stip, r, 0.0);
}`,
  carbon: `
void surf(vec2 uv){
  vec2 p = uv * 12.0; vec2 i = floor(p), q = fract(p);
  float warpTop = step(mod(i.x - i.y + 400.0, 4.0), 1.5);
  float prof = warpTop > 0.5 ? sin(q.x * 3.14159) : sin(q.y * 3.14159);
  float fib = warpTop > 0.5 ? fbm(uv, vec2(240.0, 12.0), 2, 1.0) : fbm(uv, vec2(12.0, 240.0), 2, 5.0);
  float h = 0.35 + 0.5 * pow(prof, 0.6) + (fib - 0.5) * 0.12;
  vec3 col = vec3(0.035, 0.036, 0.04) * (0.7 + 0.6 * fib) * (warpTop > 0.5 ? 1.0 : 0.8);
  float big = fbm(uv, vec2(2.0), 3, 2.0);
  emit(col, 1.0, h, 0.6 + 0.4 * prof, 0.32 + (fib - 0.5) * 0.2 + (big - 0.5) * 0.1, 0.0);
}`,
  fabric: `
void surf(vec2 uv){
  float f = 36.0; vec2 p = uv * f; vec2 i = floor(p), q = fract(p);
  float top = mod(i.x + i.y, 2.0);
  float pw = sin(q.x * 3.14159), pf = sin(q.y * 3.14159);
  float h = top > 0.5 ? pw * (0.6 + 0.4 * pf) : pf * (0.6 + 0.4 * pw) * 0.85;
  float fz = fbm(uv, vec2(150.0), 3, 1.0), big = fbm(uv, vec2(2.0), 4, 2.0);
  float thr = h3(vec2(top > 0.5 ? i.x : i.y, top), vec2(f), 3.0).x;
  float ta = 0.9 * (0.55 + 0.45 * h) * (0.85 + 0.2 * (thr - 0.5) + 0.2 * (fz - 0.5) + 0.2 * (big - 0.5));
  emit(vec3(0.0), ta, 0.2 + h * 0.7 + (fz - 0.5) * 0.15, 0.5 + 0.5 * h, 0.92, 0.0);
}`,
  armor: `
void surf(vec2 uv){
  float chip, stain, run; paintDmg(uv, 0.5, chip, stain, run);
  float fine = fbm(uv, vec2(200.0), 2, 1.0), mid = fbm(uv, vec2(14.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float grime = smoothstep(0.45, 0.8, fbm(uv, vec2(3.0, 4.0), 5, 4.0)); float sc = scr(uv, 14.0, 5.0, 0.008, 0.4, 6.3, 0.5);
  float sub = smoothstep(0.5, 0.75, chip), prim = smoothstep(0.15, 0.4, chip) * (1.0 - sub);
  vec3 nt = vec3(0.0); float ta = 0.85 * (0.92 + 0.14 * (mid - 0.5) + 0.1 * (big - 0.5));
  OV(L(0.2, 0.18, 0.15), grime * 0.07 * (0.5 + fine));
  OV(vec3(0.55), sc * 0.3);
  OV(L(0.5, 0.5, 0.47), prim);
  float wv = fbm(uv, vec2(160.0, 8.0), 2, 6.0);
  OV(L(0.4, 0.38, 0.33) * (0.6 + 0.8 * wv), sub);
  float h = 0.6 + (fine - 0.5) * 0.04 + (mid - 0.5) * 0.03 - prim * 0.1 - sub * 0.25 - sc * 0.08;
  float r = 0.36 + (mid - 0.5) * 0.1 + grime * 0.1 + sc * 0.15; r = mix(r, 0.6, prim); r = mix(r, 0.75, sub);
  emit(nt, ta, h, 1.0 - sub * 0.2, r, 0.0);
}`,
  wood: `
void surf(vec2 uv){
  vec4 kv = vor(uv * vec2(2.0, 4.0), vec2(2.0, 4.0), 1.0); float isK = step(kv.z, 0.3);
  float knot = isK * smoothstep(0.2, 0.0, length((kv.x) * vec2(1.0))), core = isK * smoothstep(0.05, 0.03, kv.x);
  float wob = fbm(uv, vec2(1.0, 3.0), 3, 2.0);
  float ring = fract(uv.y * 44.0 + (wob - 0.5) * 2.4 + knot * knot * 4.0 + (fbm(uv, vec2(4.0, 30.0), 2, 12.0) - 0.5) * 0.35);
  float late = smoothstep(0.5, 0.92, ring) * (1.0 - smoothstep(0.92, 1.0, ring));
  float fib = fbm(uv, vec2(3.0, 260.0), 3, 3.0), fib2 = fbm(uv, vec2(8.0, 90.0), 3, 4.0);
  float saw = 0.5 + 0.5 * sin((uv.x + 0.02 * sin(uv.y * TAU * 2.0)) * TAU * 240.0);
  float sawK = smoothstep(0.35, 0.7, fbm(uv, vec2(3.0), 3, 5.0));
  float grey = smoothstep(0.2, 0.68, fbm(uv, vec2(2.0, 3.0), 5, 6.0));
  float crack = smoothstep(0.84, 0.87, fbm(uv, vec2(2.0, 110.0), 3, 7.0)) * smoothstep(0.45, 0.65, fbm(uv, vec2(5.0, 3.0), 3, 8.0));
  vec3 early = L(0.58, 0.49, 0.38), lateC = L(0.36, 0.28, 0.2);
  float bigv = fbm(uv, vec2(1.0, 2.0), 3, 21.0);
  vec3 col = mix(early, lateC, late * 0.9) * (0.85 + 0.6 * (fib - 0.5) + 0.4 * (fib2 - 0.5)) * (0.78 + 0.44 * bigv);
  col = mix(col, lateC * 0.8, knot * 0.5); col = mix(col, L(0.28, 0.17, 0.09), core);
  col = mix(col, L(0.47, 0.465, 0.45) * (0.7 + 0.6 * fib) * (1.0 - late * 0.3), grey * 0.82);
  float dirt = smoothstep(0.55, 0.85, fbm(uv, vec2(4.0), 5, 9.0)); col *= 1.0 - dirt * 0.35;
  col *= 1.0 - crack * 0.55;
  float h = 0.5 + (fib - 0.5) * 0.4 + (late - 0.5) * 0.2 - (saw - 0.5) * 0.12 * sawK + (fib2 - 0.5) * 0.15 - crack * 0.3 + core * 0.05;
  emit(col, 1.0, h, 1.0 - crack * 0.5, 0.82 + (fib - 0.5) * 0.15 + grey * 0.08 - core * 0.15, 0.0);
}`,
  plastic: `
void surf(vec2 uv){
  float fine = fbm(uv, vec2(220.0), 3, 1.0), mid = fbm(uv, vec2(14.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float scuff = smoothstep(0.55, 0.75, fbm(uv, vec2(5.0, 8.0), 5, 4.0));
  float s1 = scr(uv, 7.0, 5.0, 0.005, 0.2, 6.3, 0.35), s2 = scr(uv, 22.0, 6.0, 0.012, 1.0, 6.3, 0.3), s3 = scr(uv, 50.0, 7.0, 0.03, 2.0, 6.3, 0.25);
  float sc = sat(max(s1, max(s2 * 0.8, s3 * 0.5)));
  float dirt = smoothstep(0.5, 0.85, fbm(uv, vec2(3.0), 5, 8.0));
  vec3 nt = vec3(0.0); float ta = 0.9 * (0.92 + 0.1 * (mid - 0.5) + 0.1 * (big - 0.5));
  OV(vec3(0.6), sc * 0.22 + scuff * 0.03 * fine);
  OV(L(0.25, 0.22, 0.18), dirt * 0.4);
  float h = 0.5 + (fine - 0.5) * 0.12 + (mid - 0.5) * 0.04 - sc * 0.25;
  emit(nt, ta, h, 1.0, 0.42 + (fine - 0.5) * 0.08 + scuff * 0.2 + sc * 0.2 + dirt * 0.2, 0.0);
}`,
  tarp: `
void surf(vec2 uv){
  vec2 wu = uv + (vec2(fbm(uv, vec2(2.0), 3, 1.0), fbm(uv, vec2(2.0), 3, 2.0)) - 0.5) * 0.12;
  float f1 = 1.0 - abs(gn(wu * vec2(2.0, 7.0), vec2(2.0, 7.0), 3.0)) * 2.4;        // long drape folds
  float f2 = 1.0 - abs(gn(wu * vec2(5.0, 13.0) + 2.0, vec2(5.0, 13.0), 4.0)) * 2.4; // finer wrinkles
  f1 = smoothstep(0.0, 1.0, sat(f1)); f2 = smoothstep(0.2, 1.0, sat(f2));
  float bill = fbm(wu, vec2(2.0, 3.0), 3, 5.0);
  float scrim = max(smoothstep(0.42, 0.5, abs(fract(uv.x * 200.0) - 0.5)), smoothstep(0.42, 0.5, abs(fract(uv.y * 200.0) - 0.5)));
  float fine = fbm(uv, vec2(240.0), 2, 6.0), mid = fbm(uv, vec2(14.0), 4, 7.0);
  float h = 0.25 + bill * 0.35 + f1 * 0.22 + f2 * 0.07 + scrim * 0.02 + (fine - 0.5) * 0.012;
  float dirt = smoothstep(0.5, 0.85, fbm(uv, vec2(4.0), 5, 8.0) + (0.5 - f1) * 0.08);
  vec3 nt = vec3(0.0); float ta = 0.9 * (0.88 + 0.14 * (mid - 0.5)) * (1.0 - scrim * 0.06);
  OV(vec3(0.5), smoothstep(0.85, 1.0, f1) * 0.03);
  OV(L(0.3, 0.27, 0.22), dirt * 0.3);
  emit(nt, ta, h, 0.9 + 0.1 * smoothstep(0.1, 0.7, f1), 0.48 + (mid - 0.5) * 0.15 + dirt * 0.25, 0.0);
}`,
  cardboard: `
void surf(vec2 uv){
  float fl = 0.5 + 0.5 * cos(uv.y * TAU * 140.0);
  float fib = fbm(uv, vec2(40.0, 160.0), 3, 1.0), fine = fbm(uv, vec2(250.0), 2, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);
  float sn = fbm(uv, vec2(3.0), 5, 4.0); float damp = smoothstep(0.62, 0.72, sn); float tide = smoothstep(0.61, 0.64, sn) * (1.0 - smoothstep(0.64, 0.7, sn));
  float crease = smoothstep(0.012, 0.004, abs(fbm(uv, vec2(2.0), 2, 5.0) - 0.5)) * smoothstep(0.5, 0.7, fbm(uv, vec2(3.0), 2, 6.0));
  vec3 col = L(0.66, 0.52, 0.36) * (0.85 + 0.2 * (fib - 0.5) + 0.12 * (fine - 0.5) + 0.2 * (big - 0.5)) * (0.97 + 0.06 * fl);
  col *= (1.0 - damp * 0.3) * (1.0 - tide * 0.18); col = mix(col, col * 1.25, crease * 0.5);
  col *= 1.0 - smoothstep(0.8, 0.9, fbm(uv, vec2(120.0), 2, 7.0)) * 0.2;
  float h = 0.5 + (fl - 0.5) * 0.12 + (fib - 0.5) * 0.15 + (fine - 0.5) * 0.08 - crease * 0.3 + damp * 0.2 * (fbm(uv, vec2(20.0), 3, 8.0) - 0.5);
  emit(col, 1.0, h, 1.0 - crease * 0.3, 0.9 - damp * 0.2 + (fib - 0.5) * 0.1, 0.0);
}`,
  rope: `
void surf(vec2 uv){
  float a = (uv.x + uv.y) * 4.0; float prof = sin(fract(a) * 3.14159);
  float fib = fbm(uv, vec2(60.0), 3, 1.0);
  float yarn = 0.5 + 0.5 * sin((uv.x - uv.y) * 4.0 * TAU * 5.0 + 2.0 * sin(a * TAU));
  float h = pow(prof, 0.7) * 0.8 + yarn * 0.1 + (fib - 0.5) * 0.15;
  vec3 col = L(0.66, 0.6, 0.46) * (0.6 + 0.4 * prof) * (0.85 + 0.3 * (fib - 0.5)) * (0.92 + 0.16 * yarn);
  float dirt = smoothstep(0.4, 0.8, fbm(uv, vec2(3.0), 4, 2.0)); col = mix(col, L(0.25, 0.22, 0.18), dirt * 0.5 * (1.0 - prof * 0.5));
  emit(col, 1.0, h, 0.45 + 0.55 * prof, 0.95, 0.0);
}`,
  tire: `
void surf(vec2 uv){
  float sv = fract(uv.y + 0.5) - 0.5; float v = abs(sv) * 2.0; float u = uv.x;
  float zig = 0.03 * abs(fract(u * 10.0) - 0.5) * 2.0;
  float g1 = smoothstep(0.035, 0.02, abs(v - 0.36 - zig)), g0 = smoothstep(0.03, 0.018, abs(v - zig * 0.5));
  float lat = smoothstep(0.06, 0.03, abs(fract(u * 10.0 + v * 1.2 * sign(sv)) - 0.5)) * step(0.4, v) * step(v, 0.8);
  float sipe = smoothstep(0.012, 0.005, abs(fract(u * 20.0 + v * 0.8) - 0.5)) * step(0.05, v) * step(v, 0.33);
  float groove = sat(max(max(g0, g1), max(lat, sipe * 0.6)));
  float side = smoothstep(0.84, 0.9, v);
  float rib = (0.5 + 0.5 * cos(v * TAU * 14.0)) * side;
  float fine = fbm(uv, vec2(200.0, 120.0), 3, 1.0), mid = fbm(uv, vec2(10.0, 6.0), 4, 2.0);
  float h = (1.0 - groove) * (1.0 - side) * 0.8 + side * (0.35 + rib * 0.1) + (fine - 0.5) * 0.04;
  float dust = smoothstep(0.4, 0.75, fbm(uv, vec2(4.0, 3.0), 5, 3.0));
  vec3 col = vec3(0.022) * (0.8 + 0.5 * (mid - 0.5)); col = mix(col, L(0.22, 0.2, 0.17), dust * 0.25 + groove * (1.0 - side) * 0.2);
  emit(col, 1.0, h, 1.0 - groove * 0.5 * (1.0 - side), 0.85 + (fine - 0.5) * 0.1 - side * 0.1, 0.0);
}`,
  glass: `
void surf(vec2 uv){
  float d = uP.x;
  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(12.0), 4, 2.0), fine = fbm(uv, vec2(200.0), 2, 3.0);
  float dust = sat(smoothstep(0.75 - 0.45 * d, 0.95 - 0.3 * d, big * 0.7 + mid * 0.3) + fine * 0.15 * d);
  float st2 = fbm(uv, vec2(120.0, 3.0), 2, 5.0);
  float trail = smoothstep(0.62, 0.72, fbm(uv, vec2(50.0, 1.0), 2, 4.0)) * smoothstep(0.3, 0.6, fbm(uv, vec2(50.0, 2.0), 2, 6.0));
  vec4 dv = vor(uv * 60.0, vec2(60.0), 7.0); float drop = step(dv.z, 0.45) * smoothstep(0.32 * dv.w + 0.06, 0.0, dv.x);
  vec4 dv2 = vor(uv * 150.0, vec2(150.0), 8.0); float drop2 = step(dv2.z, 0.5) * smoothstep(0.3 * dv2.w + 0.05, 0.0, dv2.x);
  dust *= 1.0 - trail * 0.7;
  vec3 col = mix(L(0.5, 0.6, 0.62) * 0.25, L(0.5, 0.47, 0.4), dust);
  float alpha = mix(0.16, 0.55 + 0.35 * d, dust) + drop * 0.08 + (st2 - 0.5) * 0.05 * d;
  float h = 0.3 + drop * 0.5 + drop2 * 0.15 + trail * 0.06 * st2;
  float r = mix(0.03, 0.55, dust); r = mix(r, 0.03, sat(drop * 2.0));
  emit(col, alpha, h, 1.0, r, 0.0);
}`,
  water: `
void surf(vec2 uv){
  float a = fbm(uv, vec2(6.0, 10.0), 4, 1.0), b = fbm(uv + 0.3, vec2(20.0, 30.0), 3, 2.0);
  emit(L(0.1, 0.16, 0.18) * 0.5, 1.0, 0.5 + (a - 0.5) * 0.6 + (b - 0.5) * 0.2, 1.0, 0.06, 0.0);
}`,
};

const PATCH = {
  common: `
varying vec3 vSlPos;
#ifdef SL_TRIPLANAR
varying vec3 vSlONrm; varying vec3 vSlAx; varying vec3 vSlAy;
#endif
`,
  projectVertex: `
#ifdef SL_TRIPLANAR
  vSlPos = position; vSlONrm = normal;
  vec3 slAx = vec3(1.0, 0.0, 0.0), slAy = vec3(0.0, 1.0, 0.0);
  #ifdef USE_SKINNING
    slAx = (skinMatrix * vec4(slAx, 0.0)).xyz; slAy = (skinMatrix * vec4(slAy, 0.0)).xyz;
  #endif
  #ifdef USE_INSTANCING
    slAx = mat3(instanceMatrix) * slAx; slAy = mat3(instanceMatrix) * slAy;
  #endif
  vSlAx = normalize(mat3(modelViewMatrix) * slAx); vSlAy = normalize(mat3(modelViewMatrix) * slAy);
#else
  vec4 slWP = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    slWP = instanceMatrix * slWP;
  #endif
  vSlPos = (modelMatrix * slWP).xyz;
#endif
`,
  fragCommon: `
uniform float uSlWet; uniform vec4 uSlWetP; uniform vec4 uSlMacro; uniform vec3 uSlUv; uniform vec2 uSlX;
varying vec3 vSlPos;
#ifdef SL_TRIPLANAR
varying vec3 vSlONrm; varying vec3 vSlAx; varying vec3 vSlAy;
vec3 slTw; vec2 slUx; vec2 slUy; vec2 slUz;
vec4 slTri(sampler2D t){ return texture2D(t, slUx) * slTw.x + texture2D(t, slUy) * slTw.y + texture2D(t, slUz) * slTw.z; }
#endif
vec4 slORM; vec2 slUv; float slWetK = 0.0; float slUp = 0.0; float slMac = 0.5; float slMac2 = 0.5; float slBead = 0.0;
float slH(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float slN3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(slH(i), slH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 0.0)), slH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(slH(i + vec3(0.0, 0.0, 1.0)), slH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 1.0)), slH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
`,
  map: `
#ifdef SL_TRIPLANAR
  { vec3 slOn = normalize(vSlONrm); vec3 slW3 = pow(abs(slOn), vec3(6.0)); slTw = slW3 / (slW3.x + slW3.y + slW3.z);
    vec3 slQ = vSlPos * uSlUv.z; slUx = slQ.zy; slUy = slQ.xz; slUz = slQ.xy; }
  vec4 sampledDiffuseColor = slTri(map);
  slORM = slTri(roughnessMap);
#else
  slUv = vMapUv * uSlUv.xy;
  vec4 sampledDiffuseColor = texture2D(map, slUv);
  slORM = texture2D(roughnessMap, slUv);
#endif
#ifdef SL_FX
  {
    #ifdef FLAT_SHADED
      vec3 slVN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
    #else
      vec3 slVN = normalize(vNormal);
      #ifdef DOUBLE_SIDED
        slVN *= gl_FrontFacing ? 1.0 : -1.0;
      #endif
    #endif
    vec3 slWN = inverseTransformDirection(slVN, viewMatrix);
    vec3 slMp = vSlPos * uSlMacro.z;
    slMac = slN3(slMp); slMac2 = slN3(slMp * 3.7 + 11.3);
    float slM = slMac * 0.65 + slMac2 * 0.35 - 0.5;
    sampledDiffuseColor.rgb *= 1.0 + uSlMacro.x * slM * 2.0;
    float slGr = smoothstep(0.5, 0.85, slMac * 0.6 + slMac2 * 0.4 + (1.0 - slORM.r) * 0.3) * uSlMacro.w;
    sampledDiffuseColor.rgb *= 1.0 - slGr * 0.35;
    #if SL_TINT == 1
      sampledDiffuseColor.a *= 1.0 - slGr * 0.2;
    #endif
    // rain wetness: strongest on up-facing faces, streaky on verticals, none underneath
    slUp = smoothstep(0.15, 0.85, slWN.y);
    float slExpo = smoothstep(-0.4, -0.05, slWN.y);
    float slStreak = 0.0;
    #ifndef SL_TRIPLANAR
      float slSc = vSlPos.x + vSlPos.z;
      slStreak = slN3(vec3(slSc * 9.0, vSlPos.y * 0.55, slSc * 0.7 + 3.0)) * slN3(vec3(slSc * 29.0, vSlPos.y * 1.1, 7.0));
      slStreak = smoothstep(0.12, 0.42, slStreak) * smoothstep(0.3, 0.7, slN3(vec3(slSc * 1.1, vSlPos.y * 0.25, 1.7)));
    #endif
    float slW = uSlWet * uSlX.x * slExpo;
    slWetK = slW * mix(uSlWetP.z * (0.55 + 0.9 * slStreak), 0.75 + 0.5 * slMac, slUp);
    #ifndef SL_TRIPLANAR
      { float slLow = smoothstep(0.5, 0.0, vSlPos.y) * (1.0 - slUp) * slExpo;        // damp, splashed band where things meet the ground
        slWetK += slW * slLow * 0.6;
        float slLg = 1.0 - slLow * min(uSlMacro.w, 0.5) * 0.45;
        sampledDiffuseColor.rgb *= slLg;
        #if SL_TINT == 1
          sampledDiffuseColor.a *= slLg;
        #endif
      }
    #endif
    slWetK = clamp(slWetK, 0.0, 1.0);
    float slBf = clamp(1.0 - length(fwidth(vSlPos)) * 120.0, 0.0, 1.0);
    if (uSlWetP.w > 0.0 && slBf > 0.0) {
      float slB = slN3(vSlPos * 170.0) * 0.6 + slN3(vSlPos * 410.0 + 5.0) * 0.4;
      slBead = smoothstep(0.6, 0.68, slB) * uSlWetP.w * slW * slBf * (0.4 + 0.6 * slUp + 0.5 * slStreak);
    }
  }
#endif
#if SL_TINT == 1
  diffuseColor.rgb = sampledDiffuseColor.rgb + diffuse * sampledDiffuseColor.a;
#elif SL_TINT == 2
  { float slL = clamp(dot(sampledDiffuseColor.rgb, vec3(0.3333)) / 0.19, 0.55, 1.35);
    diffuseColor.rgb = mix(sampledDiffuseColor.rgb, diffuse * slL, sampledDiffuseColor.a * 0.96); }
#elif SL_TINT == 3
  diffuseColor *= sampledDiffuseColor;
#else
  diffuseColor.rgb *= sampledDiffuseColor.rgb;
#endif
#ifdef SL_FX
  { float slLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
    diffuseColor.rgb = mix(vec3(slLum), diffuseColor.rgb, 1.0 + 0.25 * slWetK * uSlWetP.x * 2.0);
    diffuseColor.rgb *= 1.0 - uSlWetP.x * slWetK; }
#endif
#ifdef SL_ACUT
  // alpha-tested wire mesh that survives distance: wires stay ~1 px wide through the mips (lowered threshold),
  // then dissolve into a stable ~1/3-coverage dither veil once the diamonds themselves are sub-pixel.
  { vec2 slFw = fwidth(slUv) * 512.0; float slLod = log2(max(max(slFw.x, slFw.y), 1e-4));
    float slThC = 0.5 * exp2(-clamp(slLod - 1.0, 0.0, 4.0));
    float slIgn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float slTh = mix(slThC, 0.05 + slIgn * 0.80, smoothstep(3.5, 5.5, slLod));
    diffuseColor.a = sampledDiffuseColor.a > slTh ? 1.0 : 0.0;
    // sub-pixel wires: the surviving fragments stand in for a much thinner wire, so dim them (no white sheets in the sun)
    diffuseColor.rgb *= mix(1.0, 0.45, smoothstep(1.5, 4.5, slLod)); }
#endif
`,
  roughness: `
float roughnessFactor = roughness * slORM.g;
#ifdef SL_FX
  roughnessFactor += uSlMacro.y * ((slMac2 - 0.5) * 1.4 + (slMac - 0.5) * 0.8);
  roughnessFactor = mix(roughnessFactor, roughnessFactor * uSlWetP.y, slWetK);
  roughnessFactor = mix(roughnessFactor, 0.05, slBead);
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) && !defined( SL_TRIPLANAR )
  { float slNl = length(texture2D(normalMap, slUv).xyz * 2.0 - 1.0);
    roughnessFactor = sqrt(roughnessFactor * roughnessFactor + clamp(1.0 - slNl, 0.0, 1.0) * 0.6); }
#endif
roughnessFactor = clamp(roughnessFactor, 0.045, 1.0);
`,
  metalness: `
float metalnessFactor = metalness * slORM.b;
`,
  normal: `
#ifdef SL_TRIPLANAR
  { vec3 slOn = normalize(vSlONrm);
    vec3 slTx = texture2D(normalMap, slUx).xyz * 2.0 - 1.0, slTy = texture2D(normalMap, slUy).xyz * 2.0 - 1.0, slTz = texture2D(normalMap, slUz).xyz * 2.0 - 1.0;
    slTx.xy *= normalScale; slTy.xy *= normalScale; slTz.xy *= normalScale;
    slTx = vec3(slTx.xy + slOn.zy, abs(slTx.z) * slOn.x); slTy = vec3(slTy.xy + slOn.xz, abs(slTy.z) * slOn.y); slTz = vec3(slTz.xy + slOn.xy, abs(slTz.z) * slOn.z);
    vec3 slNo = normalize(slTx.zyx * slTw.x + slTy.xzy * slTw.y + slTz.xyz * slTw.z);
    vec3 slA = normalize(vSlAx), slB = normalize(vSlAy); vec3 slC = cross(slA, slB);
    normal = normalize(slA * slNo.x + slB * slNo.y + slC * slNo.z);
    #ifdef DOUBLE_SIDED
      normal *= faceDirection;
    #endif
  }
#elif defined( USE_NORMALMAP_TANGENTSPACE )
  { vec3 mapN = texture2D(normalMap, slUv).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale * (1.0 - 0.45 * slWetK * slUp);
    normal = normalize(tbn * mapN); }
#endif
`,
};

const SURF_FAMILIES = ["asphalt", "concrete", "brick", "epoxy", "paint", "hazard", "hull", "galv", "metal", "brushed", "rust", "diamond", "corrugated", "chainlink", "gunmetal", "polymer", "carbon", "fabric", "armor", "wood", "plastic", "tarp", "cardboard", "rope", "tire", "glass", "water"];
const SOURCE_CHARS = 48104;

/* ---------------------------------------------------------------------------
 * 烘焙器宿主（非原版代码，等价重写）
 *
 * 原版把这段闭包在 mats 模块里，直接吃 i.renderer / i.quality。这里重写成可注入
 * THREE 与 renderer 的形式，逻辑逐行对应：
 *
 *   族参数 c3[family]  ──►  surf() 着色器（GLSL 逐字抽自原版）
 *                            ├─ pass0 → albedo（sqrt 编码，8 位）
 *                            ├─ pass1 → ORM（R=AO G=rough B=metal）
 *                            └─ pass2 → height（hi + lo 两通道打包）
 *   height + bump(mm) ──► 法线 pass（Sobel，uK = bump*0.001*D/tile）
 *   albedo(sqrt) ──► copy(uSq=1) 平方回线性
 *
 * 与原版唯一的差异：原版一次 MRT 画三个输出（WebGLRenderTarget count:3），
 * 本机 three 是 r160，还没有 count，于是拆成 3 次 uSel 选择的单目标 pass。
 * 逐像素结果相同，只是多两次 draw call。
 * ------------------------------------------------------------------------- */

const FALLBACK_INST = {
  set: "metal", tint: 1, color: 8027520, rough: 1, metal: 1,
  wet: [0, 0.7, 0.55, 0.5], macro: [0.14, 0.1, 0.8, 0.2], nrm: 1
};

/** 原版 h3()：把湿润/脏污/三平面/镂空的 GLSL 补丁塞进标准材质。 */
function patchStandard(THREE, shader, uniforms) {
  Object.assign(shader.uniforms, uniforms);
  var ao = THREE.ShaderChunk.aomap_fragment.replace("texture2D( aoMap, vAoMapUv ).r", "slORM.r");
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\n" + PATCH.common)
    .replace("#include <project_vertex>", "#include <project_vertex>\n" + PATCH.projectVertex);
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", "#include <common>\n" + PATCH.fragCommon)
    .replace("#include <map_fragment>", PATCH.map)
    .replace("#include <roughnessmap_fragment>", PATCH.roughness)
    .replace("#include <metalnessmap_fragment>", PATCH.metalness)
    .replace("#include <normal_fragment_maps>", PATCH.normal)
    .replace("#include <aomap_fragment>", ao);
}

/**
 * @param THREE    注入的 three
 * @param renderer 已存在的 WebGLRenderer（共用上下文，不新建）
 * @param ledger   material-ledger 模块（FAMILIES / INSTANCES / makeInstance）
 * @param opts     { tex: 基准分辨率, wet: 全局湿度 }
 */
function createBaker(THREE, renderer, ledger, opts) {
  opts = opts || {};
  var FAM = ledger.FAMILIES, INST = ledger.INSTANCES;
  var base = Math.max(64, Math.min(opts.tex || 1024, 2048));
  var aniso = Math.min(8, renderer.capabilities && renderer.capabilities.getMaxAnisotropy
    ? renderer.capabilities.getMaxAnisotropy() : 1);

  /* 全屏 quad：RawShaderMaterial —— 不让 three 注入 attribute 声明，
     否则会和着色器里的 in vec3 position 重定义冲突。 */
  var quadScene = new THREE.Scene();
  var quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  quadScene.add(quad);

  var surfMats = new Map();
  var sets = new Map();
  var mats = new Map();
  var liveTargets = [];
  var wetU = { value: opts.wet === undefined ? 1 : +opts.wet };
  var stats = { families: 0, passes: 0, ms: 0, bytes: 0 };

  function raw(frag, uniforms) {
    return new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: GLSL_VERT,
      fragmentShader: frag,
      uniforms: uniforms || {},
      depthTest: false, depthWrite: false, blending: THREE.NoBlending
    });
  }

  function surfMat(fn) {
    var m = surfMats.get(fn);
    if (m) return m;
    m = raw(GLSL_COMMON + (GLSL_SURF[fn] || GLSL_SURF.metal) + GLSL_MAIN, {
      uP: { value: new THREE.Vector4() },
      uSeed: { value: 0 },
      uTexel: { value: 0 },
      uSel: { value: 0 }
    });
    surfMats.set(fn, m);
    return m;
  }

  var copyMat = raw(GLSL_COPY, { tA: { value: null }, uSq: { value: 1 } });
  var normalMat = raw(GLSL_NORMAL, { tH: { value: null }, uK: { value: new THREE.Vector2() }, uTexel: { value: 0 } });

  function target(size, mip) {
    var rt = new THREE.WebGLRenderTarget(size, size, {
      depthBuffer: false,
      generateMipmaps: !!mip,
      minFilter: mip ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter,
      magFilter: mip ? THREE.LinearFilter : THREE.NearestFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      anisotropy: mip ? aniso : 1,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType
    });
    rt.texture.colorSpace = THREE.NoColorSpace;
    liveTargets.push(rt);
    stats.bytes += size * size * 4 * (mip ? 3 : 2);
    return rt;
  }

  function draw(rt, mat) {
    quad.material = mat;
    renderer.setRenderTarget(rt);
    renderer.render(quadScene, quadCam);
    stats.passes++;
  }

  function bake(familyId) {
    var key = familyId + "|" + base;
    var hit = sets.get(key);
    if (hit) return hit;

    var fam = FAM[familyId];
    if (!fam) throw new Error("未知材质族 " + familyId);
    var t0 = (window.performance || Date).now();

    var D = Math.round(base * fam.size);
    if (fam.hero && base >= 2048) D = 2048;
    D = Math.max(32, D);
    var tile = Array.isArray(fam.tile) ? fam.tile : [fam.tile, fam.tile];
    var p = fam.p || [];

    /* pass 0/1/2：surf 的三个输出 */
    var o = [target(D, false), target(D, false), target(D, false)];
    var sm = surfMat(fam.fn);
    sm.uniforms.uP.value.set(p[0] || 0, p[1] || 0, p[2] || 0, p[3] || 0);
    sm.uniforms.uSeed.value = fam.seed || 0;
    sm.uniforms.uTexel.value = 1 / D;

    var prevRT = renderer.getRenderTarget();
    var prevAuto = renderer.autoClear;
    var prevXR = renderer.xr && renderer.xr.enabled;
    var prevShadow = renderer.shadowMap.autoUpdate;
    renderer.autoClear = true;
    if (renderer.xr) renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;

    for (var i = 0; i < 3; i++) {
      sm.uniforms.uSel.value = i;
      draw(o[i], sm);
    }

    /* albedo：emit 里写了 sqrt(c)，这里平方回线性 */
    var albedo = target(D, true);
    copyMat.uniforms.tA.value = o[0].texture;
    copyMat.uniforms.uSq.value = 1;
    draw(albedo, copyMat);

    /* ORM：原样搬 */
    var orm = target(D, true);
    copyMat.uniforms.tA.value = o[1].texture;
    copyMat.uniforms.uSq.value = 0;
    draw(orm, copyMat);

    /* 法线：从 height 求梯度，uK 把毫米凹凸换算到纹素空间 */
    var nrm = target(D, true);
    normalMat.uniforms.tH.value = o[2].texture;
    normalMat.uniforms.uTexel.value = 1 / D;
    normalMat.uniforms.uK.value.set(fam.bump * 0.001 * D / tile[0], fam.bump * 0.001 * D / tile[1]);
    draw(nrm, normalMat);

    renderer.setRenderTarget(prevRT);
    renderer.autoClear = prevAuto;
    if (renderer.xr) renderer.xr.enabled = prevXR;
    renderer.shadowMap.autoUpdate = prevShadow;

    o[0].dispose(); o[1].dispose(); o[2].dispose();

    var set = {
      key: familyId, size: D, tile: tile,
      albedo: albedo.texture, orm: orm.texture, normal: nrm.texture,
      targets: [albedo, orm, nrm]
    };
    [set.albedo, set.orm, set.normal].forEach(function (t) {
      t.repeat.set(1 / tile[0], 1 / tile[1]);
      t.needsUpdate = true;
    });

    stats.families++;
    stats.ms += ((window.performance || Date).now() - t0);
    sets.set(key, set);
    return set;
  }

  function material(id, o) {
    o = o || {};
    var inst = INST[id] || FALLBACK_INST;
    var fam = FAM[inst.set];
    if (!fam) throw new Error("未知材质实例 " + id);

    var tri = !!o.triplanar;
    var fx = !inst.transparent && !inst.alphaCut;
    var key = id + "|" + (o.vertexColors ? "v" : "") + (tri ? "t" : "") +
      (o.doubleSide || inst.side === 2 ? "d" : "") + (o.interior ? "i" : "") +
      (o.color !== undefined ? "c" + o.color : "");

    var hitm = mats.get(key);
    if (hitm) return hitm;

    var set = bake(inst.set);
    var m = new THREE.MeshStandardMaterial({
      map: set.albedo,
      normalMap: set.normal,
      roughnessMap: set.orm,
      metalnessMap: set.orm,
      aoMap: set.orm,
      color: o.color !== undefined ? o.color : inst.color,
      roughness: inst.rough,
      metalness: inst.metal,
      vertexColors: !!o.vertexColors
    });
    m.name = id;
    m.normalScale.set(inst.nrm, inst.nrm);
    if (o.doubleSide || inst.side === 2) m.side = THREE.DoubleSide;
    if (inst.transparent) { m.transparent = true; m.depthWrite = false; m.envMapIntensity = 1.4; }
    if (inst.alphaCut) m.alphaTest = 0.5;

    m.defines = Object.assign({}, m.defines, { SL_TINT: inst.tint });
    if (tri) m.defines.SL_TRIPLANAR = "";
    if (fx) m.defines.SL_FX = "";
    if (inst.alphaCut && !tri) m.defines.SL_ACUT = "";

    var uniforms = {
      uSlWet: wetU,
      uSlWetP: { value: new THREE.Vector4().fromArray(inst.wet) },
      uSlMacro: { value: new THREE.Vector4().fromArray(inst.macro) },
      uSlUv: { value: new THREE.Vector3(1, 1, tri ? (o.scale || 1) / set.tile[0] : set.size) },
      uSlX: { value: new THREE.Vector2(o.interior ? 0.12 : 1, 0) }
    };
    m.userData.sl = uniforms;
    m.userData.set = set.key;
    m.userData.tile = set.tile;
    m.onBeforeCompile = function (sh) { patchStandard(THREE, sh, uniforms); };
    m.customProgramCacheKey = function () {
      return "sl2|" + inst.tint + (tri ? "t" : "") + (fx ? "f" : "") + (inst.alphaCut ? "a" : "");
    };

    mats.set(key, m);
    return m;
  }

  return {
    bake: bake,
    material: material,
    set: function (familyId) { return bake(familyId); },
    stats: stats,
    wet: wetU,
    /** 把 uv 复制一份给 uv1：极少数几何（球/自定义）没有第二套 UV 时才需要 */
    uv1: function (geo) {
      if (geo && !geo.attributes.uv1 && geo.attributes.uv) geo.setAttribute("uv1", geo.attributes.uv);
      return geo;
    },
    dispose: function () {
      mats.forEach(function (m) { m.dispose(); });
      sets.forEach(function (s) { s.targets.forEach(function (t) { t.dispose(); }); });
      surfMats.forEach(function (m) { m.dispose(); });
      copyMat.dispose(); normalMat.dispose();
      quad.geometry.dispose();
      mats.clear(); sets.clear(); surfMats.clear(); liveTargets.length = 0;
    }
  };
}
  return { GLSL_VERT, GLSL_COMMON, GLSL_MAIN, GLSL_NORMAL, GLSL_COPY, GLSL_SURF, PATCH, SURF_FAMILIES, SOURCE_CHARS, patchStandard, createBaker };
})();

/* ── modeling-kit ── 原文，仅替换 import ── */
window.ASSET_MODULES["modeling-kit"] = (function () {
  const THREE = window.THREE;
  const mergeGeometries = window.__mergeGeometries;
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



/* --------------------------------------------------------------- 几何原语 */

/**
 * 倒角盒。24 个顶点（8 角 × 3 个面各一份），因此每个面都有硬边法线，
 * 倒角不会被平滑成球面。UV 按"米"直接投：取该顶点的另外两个坐标。
 * anchor="bottom" 时把几何抬起 h/2，让原点落在底面中心——这是全项目的约定。
 */
function metricBox(w, h, d, bevel = 0.01, anchor = "center") {
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
function bevelBox(w, h, d, bevel = 0.02, anchor = "center") {
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
function cylinder(rTop, rBottom, h, seg = 16, open = false, anchor = "center") {
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
function tube(points, radius = 0.03, seg = 8, closed = false, tension = 0) {
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
function place(geom, x = 0, y = 0, z = 0, rot = null) {
  const q = new THREE.Quaternion();
  if (rot) q.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)
  );
  geom.applyMatrix4(m);
  return geom;
}

/** 顶点色。传函数则按位置求色，传数组则整体一个色。 */
function vertexColor(geom, col) {
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
function merge(geoms) {
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

function plane(w, h) { return new THREE.PlaneGeometry(w, h); }

/** 带 UV 缩放的平面：贴图按"米"重复，而不是 0-1。 */
function planeUV(w, h) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
  return g;
}

function toNonIndexed(geom) {
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
class Builder {
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
function annotate(obj, name, size, colliders) {
  obj.userData.size = size;
  obj.userData.colliders = colliders;
  obj.name = name;
  return obj;
}

/**
 * 静态合批：同材质 + 同阴影设置 + 同 layer 的网格合并成一个。
 * userData.noMerge 及其子树会被跳过（动态物件靠这个逃生）。
 */
function batch(root, { castShadow = true, receiveShadow = true } = {}) {
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

const __default = { metricBox, bevelBox, cylinder, tube, place, vertexColor, merge, plane, planeUV, toNonIndexed, Builder, annotate, batch };
  return { metricBox, bevelBox, cylinder, tube, place, vertexColor, merge, plane, planeUV, toNonIndexed, Builder, annotate, batch, default: __default };
})();

/* ── container-builder ── 原文，仅替换 import ── */
window.ASSET_MODULES["container-builder"] = (function () {
  const THREE = window.THREE;
  const mergeGeometries = window.__mergeGeometries;
/* Extracted from /Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html; source SHA-256 9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966. */

const W = THREE.Vector3;
const un = THREE.BoxGeometry;
const Ys = THREE.CylinderGeometry;
const Jr = THREE.CatmullRomCurve3;
const Kr = THREE.TubeGeometry;
const Lt = THREE.Quaternion;
const Ye = THREE.Matrix4;
const In = THREE.Euler;
const nt = THREE.BufferGeometry;
const et = THREE.BufferAttribute;
const Qe = THREE.Mesh;
const wt = THREE.Group;
const Qt = THREE.MeshStandardMaterial;
const Nn = THREE.MeshBasicMaterial;
const xs = THREE.CanvasTexture;
const rn = THREE.PlaneGeometry;
const ar = THREE.LatheGeometry;
const Ae = THREE.Vector2;
const ls = THREE.SphereGeometry;
const Vn = THREE.SRGBColorSpace;
const Ln = THREE.LinearMipmapLinearFilter;
const Sn = THREE.DoubleSide;
const bs = THREE.MathUtils;

let __containerCanvasFactory = null;
const document = globalThis.document || {
  createElement(type) {
    if (type !== "canvas" || !__containerCanvasFactory) throw new Error("container decal service needs ctx.canvasFactory(width, height)");
    return __containerCanvasFactory(1, 1);
  },
};

var o3='"PingFang SC", "PingFang SC", "PingFang SC", Impact, "PingFang SC", Arial, sans-serif';
var r3='"PingFang SC", "PingFang SC", "PingFang SC", Arial, sans-serif';
var oA='"PingFang SC", "PingFang SC", Menlo, Consolas, monospace';
var Ut={white:[226,223,213],black:[24,24,26],yellow:[222,172,30],red:[168,36,28],navy:[24,38,58],orange:[206,100,30]};
var An=(i,e=1)=>`rgba(${i[0]},${i[1]},${i[2]},${e})`;
var rA=new Set(["I","1"," ","-",".","/",":",",","'","!","\xB7"]);
function aA(i){let e=i>>>0;return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}
function lA(i){let e=2166136261;for(let t=0;t<i.length;t++)e^=i.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}
function Wg(i,e){let t=document.createElement("canvas");return t.width=i,t.height=e,t}
function ra(i,e,t,n,s,o=.35,r=9){i.beginPath();for(let a=0;a<r;a++){let l=a/r*Math.PI*2,c=n*(1-o+s()*o*2),u=e+Math.cos(l)*c,h=t+Math.sin(l)*c;a?i.lineTo(u,h):i.moveTo(u,h)}i.closePath()}
function Ks(i,e,t,n,s){if(n<=0)return;i.save(),i.globalCompositeOperation="destination-out";let o=Math.floor(n*e*t/700);for(let r=0;r<o;r++){let a=Math.pow(s(),3)*t*.09+.6;i.globalAlpha=.45+s()*.55,ra(i,s()*e,s()*t,a,s,.5,7),i.fill()}i.lineCap="round";for(let r=0;r<n*16;r++){let a=s()*e,l=s()*t,c=(s()-.5)*.7,u=(.1+s()*.5)*e;i.globalAlpha=.5+s()*.5,i.lineWidth=.5+s()*s()*3,i.beginPath(),i.moveTo(a,l),i.lineTo(a+Math.cos(c)*u,l+Math.sin(c)*u),i.stroke()}i.globalAlpha=.8;for(let r=0;r<n*e*t/60;r++)i.fillRect(s()*e,s()*t,1+s(),1+s());for(let r=0;r<n*6;r++){let a=s()*e,l=s()*t,c=(.1+s()*.25)*t,u=i.createRadialGradient(a,l,0,a,l,c);u.addColorStop(0,"rgba(0,0,0,"+(.25+s()*.4)+")"),u.addColorStop(1,"rgba(0,0,0,0)"),i.globalAlpha=1,i.fillStyle=u,i.fillRect(a-c,l-c,c*2,c*2)}i.restore()}
function a3(i,e,t,n,s,o){i.font=`${s} ${t}px ${n}`;let r=0;for(let a of e)r+=i.measureText(a).width+o;return r-o}
function qa(i,e,t,n,s,o,r={}){let a=r.font==="sans"?r3:r.font==="mono"?oA:o3,l=r.weight||700,c=r.spacing!==void 0?r.spacing:s*.06,u=r.font!=="sans"&&r.font!=="mono"&&r.bridges!==!1,h=a3(i,e,s,a,l,c),f=r.maxW&&h>r.maxW?r.maxW/h:r.fitW?r.fitW/h:1,p=Wg(Math.ceil(h*f)+8,Math.ceil(s*1.4)),d=p.getContext("2d");d.font=`${l} ${s}px ${a}`,d.textBaseline="alphabetic",d.fillStyle=o,d.scale(f,1);let v=4/f,g=s*1.08;for(let y of e){let b=d.measureText(y).width;d.fillText(y,v,g),u&&!rA.has(y)&&(d.save(),d.globalCompositeOperation="destination-out",d.fillRect(v+b*.5-s*.032,0,s*.064,s*1.4),d.restore()),v+=b+c}let x=r.align==="center"?t-h*f/2:r.align==="right"?t-h*f:t;return i.drawImage(p,x-4,n-g),h*f}
function l3(i,e=4){let t=new Map,n=[],s=0;function o(v,g={}){let x=new xs(v);x.colorSpace=Vn,x.anisotropy=e,x.generateMipmaps=!0,x.minFilter=Ln,s+=v.width*v.height*4*1.34;let y=new Qt({map:x,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,roughness:g.rough!==void 0?g.rough:.7,metalness:g.metal||0,opacity:g.opacity!==void 0?g.opacity:1});return y.name="decal",g.doubleSide&&(y.side=Sn),{material:y,aspect:v.width/v.height,texture:x}}function r(v,g,x,y,b={}){let m=Wg(g,x),A=m.getContext("2d"),_=()=>{A.setTransform(1,0,0,1,0,0),A.clearRect(0,0,g,x),A.globalAlpha=1,A.globalCompositeOperation="source-over",b.bleed&&(A.fillStyle=An(b.bleed,.012),A.fillRect(0,0,g,x)),y(A,g,x,aA(lA(v)+17))};_();let M=o(m,b);return b.text&&n.push(()=>{_(),M.texture.needsUpdate=!0}),M}function a(v,g,x,y){v.lineJoin="round",v.beginPath(),v.moveTo(g/2,x*.12),v.lineTo(g*.9,x*.84),v.lineTo(g*.1,x*.84),v.closePath(),v.lineWidth=g*.11,v.strokeStyle=An(Ut.black),v.stroke(),v.fillStyle=y,v.fill(),v.lineWidth=g*.035,v.strokeStyle=An(Ut.black),v.stroke()}function l(v,g,x,y,b,m,A,_){v.fillStyle=v.strokeStyle=An(y);let M=x;v.save(),v.translate(M*.5,M*.5),b(v,M*.38,An(_||y)),v.restore(),qa(v,m,M*1,x*.6,x*.42,An(y),{weight:900,bridges:!1,maxW:g-M*1.05,spacing:x*.012}),v.fillStyle=An(_||y),v.fillRect(M*1,x*.67,g-M*1.12,x*.022),qa(v,A,M*1,x*.84,x*.115,An(y),{font:"sans",weight:600,spacing:x*.035,maxW:g-M*1.1})}let c={hazard_flammable:()=>r("hazard_flammable",256,256,(v,g,x,y)=>{v.save(),v.translate(g/2,x/2),v.rotate(Math.PI/4),v.fillStyle=An(Ut.red),v.fillRect(-86,-86,172,172),v.strokeStyle=An(Ut.white),v.lineWidth=5,v.strokeRect(-76,-76,152,152),v.restore(),v.save(),v.translate(g/2,x/2-8),v.fillStyle=An(Ut.white),v.beginPath(),v.moveTo(2,-64),v.bezierCurveTo(34,-28,40,6,24,28),v.bezierCurveTo(12,44,-12,44,-24,28),v.bezierCurveTo(-40,6,-20,-12,-15,-34),v.bezierCurveTo(-6,-28,0,-44,2,-64),v.fill(),v.fillStyle=An(Ut.red),v.beginPath(),v.moveTo(1,-10),v.bezierCurveTo(15,6,15,24,0,31),v.bezierCurveTo(-15,24,-13,8,1,-10),v.fill(),v.fillStyle=An(Ut.white),v.fillRect(-34,50,68,6),v.restore(),qa(v,"3",g/2,x*.9,34,An(Ut.white),{align:"center",weight:900,bridges:!1}),Ks(v,g,x,.3,y)},{bleed:Ut.red,text:!0}),hazard_voltage:()=>r("hazard_voltage",256,256,(v,g,x,y)=>{a(v,g,x,An(Ut.yellow)),v.fillStyle=An(Ut.black),v.save(),v.translate(g/2,x*.56),v.beginPath(),[[12,-58],[-24,4],[-3,4],[-16,50],[26,-14],[5,-14],[22,-58]].forEach((b,m)=>m?v.lineTo(b[0],b[1]):v.moveTo(b[0],b[1])),v.closePath(),v.fill(),v.restore(),Ks(v,g,x,.3,y)},{bleed:Ut.yellow}),hazard_general:()=>r("hazard_general",256,256,(v,g,x,y)=>{a(v,g,x,An(Ut.yellow)),v.fillStyle=An(Ut.black),v.beginPath(),v.moveTo(g/2-13,x*.34),v.lineTo(g/2+13,x*.34),v.lineTo(g/2+7,x*.62),v.lineTo(g/2-7,x*.62),v.closePath(),v.fill(),v.beginPath(),v.arc(g/2,x*.715,11,0,7),v.fill(),Ks(v,g,x,.3,y)},{bleed:Ut.yellow}),arrow:()=>r("arrow",384,192,(v,g,x,y)=>{v.fillStyle=An(Ut.white),v.beginPath(),[[20,68],[226,68],[226,22],[364,96],[226,170],[226,124],[20,124]].forEach((b,m)=>m?v.lineTo(b[0],b[1]):v.moveTo(b[0],b[1])),v.closePath(),v.fill(),v.globalCompositeOperation="destination-out",v.fillRect(118,0,9,x),v.fillRect(232,0,7,x),v.globalCompositeOperation="source-over",Ks(v,g,x,.5,y)},{bleed:Ut.white}),no_entry:()=>r("no_entry",256,256,(v,g,x,y)=>{v.fillStyle=An(Ut.white),v.beginPath(),v.arc(128,128,112,0,7),v.fill(),v.fillStyle=An(Ut.red),v.beginPath(),v.arc(128,128,102,0,7),v.fill(),v.fillStyle=An(Ut.white),v.fillRect(52,106,152,44),Ks(v,g,x,.3,y)},{bleed:Ut.red}),logo_a:()=>r("logo_a",640,192,(v,g,x,y)=>{l(v,g,x,Ut.white,(b,m,A)=>{b.lineWidth=m*.13,b.beginPath(),b.arc(0,0,m*.92,.25*Math.PI,1.75*Math.PI),b.stroke(),b.beginPath(),b.moveTo(0,-m*1.08),b.lineTo(m*.26,0),b.lineTo(0,m*.62),b.lineTo(-m*.26,0),b.closePath(),b.fill(),b.beginPath(),b.moveTo(m*.5,0),b.lineTo(m*1.12,-m*.1),b.lineTo(m*1.12,m*.1),b.closePath(),b.fill()},"几猫北航","北极 · 大西洋 · 支线运输"),Ks(v,g,x,.35,y)},{bleed:Ut.white,text:!0}),logo_b:()=>r("logo_b",640,192,(v,g,x,y)=>{l(v,g,x,Ut.white,(b,m,A)=>{b.fillStyle=A;for(let _=0;_<2;_++){let M=-m*.35+_*m*.55,E=m*(.3-_*.06);b.beginPath(),b.moveTo(-m*1.05,M-m*.25),b.quadraticCurveTo(-m*.3,M-m*.2,0,M+m*.35),b.quadraticCurveTo(m*.3,M-m*.2,m*1.05,M-m*.25),b.quadraticCurveTo(m*.35,M+E*.2,0,M+m*.35+E),b.quadraticCurveTo(-m*.35,M+E*.2,-m*1.05,M-m*.25),b.fill()}},"几猫远洋","集装箱运输",Ut.orange),Ks(v,g,x,.35,y)},{bleed:Ut.white,text:!0}),logo_c:()=>r("logo_c",640,192,(v,g,x,y)=>{l(v,g,x,Ut.navy,(b,m,A)=>{b.beginPath(),b.arc(0,m*.25,m*.55,Math.PI,0),b.closePath(),b.fill(),b.lineWidth=m*.1,b.lineCap="butt";for(let _=0;_<7;_++){let M=Math.PI+(_+.5)/7*Math.PI;b.beginPath(),b.moveTo(Math.cos(M)*m*.7,m*.25+Math.sin(M)*m*.7),b.lineTo(Math.cos(M)*m*1.05,m*.25+Math.sin(M)*m*1.05),b.stroke()}b.fillRect(-m*1.05,m*.42,m*2.1,m*.13),b.fillRect(-m*.8,m*.68,m*1.6,m*.1)},"几猫太平洋","远洋 · 冷链 · 散货"),Ks(v,g,x,.35,y)},{bleed:Ut.navy,text:!0}),logo_d:()=>r("logo_d",640,192,(v,g,x,y)=>{l(v,g,x,Ut.white,(b,m,A)=>{b.fillRect(-m,-m,m*.5,m*2),b.fillRect(m*.5,-m,m*.5,m*2),b.fillRect(-m,-m*.2,m*2,m*.4),b.fillStyle=A,b.fillRect(-m*.32,-m,m*.64,m*.5),b.fillRect(-m*.32,m*.5,m*.64,m*.5)},"几猫联运","多式联运",Ut.yellow),Ks(v,g,x,.35,y)},{bleed:Ut.white,text:!0}),berth4:()=>r("berth4",640,224,(v,g,x,y)=>{v.strokeStyle=An(Ut.yellow),v.lineWidth=12,v.strokeRect(14,14,g-28,x-28),v.globalCompositeOperation="destination-out";for(let b of[g*.25,g*.75])v.fillRect(b-6,0,12,x);v.globalCompositeOperation="source-over",qa(v,"四号泊位",g/2,x*.76,x*.66,An(Ut.yellow),{align:"center",weight:900,maxW:g-80}),Ks(v,g,x,.55,y)},{bleed:Ut.yellow,text:!0}),caution_stripes:()=>r("caution_stripes",512,128,(v,g,x,y)=>{v.fillStyle=An(Ut.black),v.fillRect(0,8,g,x-16),v.save(),v.beginPath(),v.rect(0,8,g,x-16),v.clip(),v.fillStyle=An(Ut.yellow);for(let b=-x;b<g+x;b+=64)v.beginPath(),v.moveTo(b,x),v.lineTo(b+32,x),v.lineTo(b+32+x,0),v.lineTo(b+x,0),v.closePath(),v.fill();v.restore(),Ks(v,g,x,.5,y)},{bleed:Ut.black}),grime_streak:()=>r("grime_streak",128,256,(v,g,x,y)=>{for(let b=0;b<46;b++){let m=g*(.12+.76*(y()*.5+y()*.5)),A=x*(.25+y()*.7),_=1.5+y()*y()*12,M=.05+y()*.16,E=v.createLinearGradient(0,0,0,A);E.addColorStop(0,`rgba(26,23,19,${M})`),E.addColorStop(.15,`rgba(26,23,19,${M*1.3})`),E.addColorStop(1,"rgba(26,23,19,0)"),v.fillStyle=E,v.fillRect(m-_/2+(y()-.5)*2,0,_,A)}},{rough:.85,bleed:[26,23,19]}),rust_run:()=>r("rust_run",128,256,(v,g,x,y)=>{for(let b=0;b<40;b++){let m=g*(.2+.6*(y()*.5+y()*.5)),A=x*(.2+y()*.75),_=1.2+y()*y()*9,M=.08+y()*.22,E=y()<.5?"118,52,18":"150,78,26",w=v.createLinearGradient(0,8,0,A);w.addColorStop(0,`rgba(${E},${M*1.4})`),w.addColorStop(.3,`rgba(${E},${M})`),w.addColorStop(1,`rgba(${E},0)`),v.fillStyle=w,v.fillRect(m-_/2,8,_,A)}for(let b=0;b<9;b++)v.fillStyle=`rgba(${y()<.5?"70,30,14":"104,44,16"},${.5+y()*.4})`,ra(v,g*(.3+y()*.4),6+y()*12,3+y()*8,y,.5,7),v.fill()},{rough:.9,bleed:[118,52,18]}),oil_stain:()=>r("oil_stain",256,256,(v,g,x,y)=>{for(let b=0;b<26;b++){let m=y()*7,A=Math.pow(y(),1.5)*g*.26,_=g/2+Math.cos(m)*A,M=x/2+Math.sin(m)*A*.8,E=g*(.06+y()*.16),w=v.createRadialGradient(_,M,E*.2,_,M,E);w.addColorStop(0,`rgba(10,10,11,${.35+y()*.3})`),w.addColorStop(.75,"rgba(12,11,10,0.22)"),w.addColorStop(1,"rgba(12,11,10,0)"),v.fillStyle=w,v.fillRect(_-E,M-E,E*2,E*2)}for(let b=0;b<30;b++){v.fillStyle=`rgba(10,10,11,${.3+y()*.4})`;let m=y()*7,A=g*(.25+y()*.2);v.beginPath(),v.arc(g/2+Math.cos(m)*A,x/2+Math.sin(m)*A,1+y()*4,0,7),v.fill()}},{rough:.12,bleed:[10,10,11]}),leak_stain:()=>r("leak_stain",192,256,(v,g,x,y)=>{for(let b=0;b<18;b++){let m=g*(.3+y()*.4),A=x*(.12+y()*.2),_=g*(.1+y()*.2),M=v.createRadialGradient(m,A,_*.5,m,A,_);M.addColorStop(0,"rgba(150,146,130,0.0)"),M.addColorStop(.8,`rgba(168,162,140,${.18+y()*.2})`),M.addColorStop(1,"rgba(168,162,140,0)"),v.fillStyle=M,v.fillRect(m-_,A-_,_*2,_*2)}for(let b=0;b<22;b++){let m=g*(.25+.5*y()),A=x*(.3+y()*.6),_=2+y()*9,M=.08+y()*.16,E=y()<.6?"160,154,132":"60,66,52",w=v.createLinearGradient(0,x*.2,0,x*.2+A);w.addColorStop(0,`rgba(${E},${M})`),w.addColorStop(1,`rgba(${E},0)`),v.fillStyle=w,v.fillRect(m,x*.2,_,A)}},{rough:.8,bleed:[160,154,132]}),bullet_metal:()=>r("bullet_metal",128,128,(v,g,x,y)=>{v.fillStyle="rgba(96,52,40,0.9)",ra(v,64,64,30,y,.4,11),v.fill(),v.fillStyle="rgba(150,152,156,0.95)",ra(v,64,64,22,y,.3,12),v.fill(),v.strokeStyle="rgba(205,207,210,0.9)",v.lineWidth=1;for(let m=0;m<14;m++){let A=y()*7;v.beginPath(),v.moveTo(64+Math.cos(A)*9,64+Math.sin(A)*9),v.lineTo(64+Math.cos(A)*(16+y()*10),64+Math.sin(A)*(16+y()*10)),v.stroke()}let b=v.createRadialGradient(64,64,2,64,64,12);b.addColorStop(0,"rgba(4,4,5,1)"),b.addColorStop(.75,"rgba(10,10,12,1)"),b.addColorStop(1,"rgba(70,72,76,0.9)"),v.fillStyle=b,ra(v,64,64,12,y,.15,12),v.fill(),v.strokeStyle="rgba(230,232,235,0.85)",v.lineWidth=1.5,v.beginPath(),v.arc(64,64,12.5,3.6,5.6),v.stroke()},{rough:.4,metal:.8,bleed:[96,52,40]}),bullet_concrete:()=>r("bullet_concrete",128,128,(v,g,x,y)=>{let b=v.createRadialGradient(64,64,20,64,64,60);b.addColorStop(0,"rgba(176,172,162,0.5)"),b.addColorStop(1,"rgba(176,172,162,0)"),v.fillStyle=b,v.fillRect(0,0,g,x),v.fillStyle="rgba(168,164,154,0.95)",ra(v,64,64,32,y,.35,13),v.fill(),v.fillStyle="rgba(120,116,108,0.95)",ra(v,65,66,20,y,.35,11),v.fill(),v.strokeStyle="rgba(40,38,36,0.8)",v.lineWidth=1;for(let A=0;A<6;A++){let _=y()*7,M=64+Math.cos(_)*14,E=64+Math.sin(_)*14;v.beginPath(),v.moveTo(M,E);for(let w=0;w<5;w++)_+=(y()-.5)*.9,M+=Math.cos(_)*8,E+=Math.sin(_)*8,v.lineTo(M,E);v.stroke()}let m=v.createRadialGradient(64,64,1,64,64,11);m.addColorStop(0,"rgba(18,17,16,1)"),m.addColorStop(1,"rgba(60,58,54,0.95)"),v.fillStyle=m,ra(v,64,64,10,y,.3,9),v.fill();for(let A=0;A<40;A++){v.fillStyle=`rgba(${y()<.5?"90,86,80":"190,186,176"},0.8)`;let _=y()*7,M=10+y()*24;v.fillRect(64+Math.cos(_)*M,64+Math.sin(_)*M,1+y()*2,1+y()*2)}},{rough:.95,bleed:[168,164,154]}),scorch:()=>r("scorch",256,256,(v,g,x,y)=>{for(let b=0;b<40;b++){let m=y()*7,A=Math.pow(y(),1.2)*g*.3,_=g/2+Math.cos(m)*A,M=x/2+Math.sin(m)*A,E=g*(.07+y()*.15)*(1.2-A/(g*.4)),w=v.createRadialGradient(_,M,0,_,M,Math.max(4,E));w.addColorStop(0,`rgba(8,7,6,${.3+y()*.3})`),w.addColorStop(1,"rgba(8,7,6,0)"),v.fillStyle=w,v.fillRect(0,0,g,x)}v.strokeStyle="rgba(8,7,6,0.25)";for(let b=0;b<50;b++){let m=y()*7,A=g*.1,_=g*(.25+y()*.22);v.lineWidth=1+y()*3,v.beginPath(),v.moveTo(g/2+Math.cos(m)*A,x/2+Math.sin(m)*A),v.lineTo(g/2+Math.cos(m)*_,x/2+Math.sin(m)*_),v.stroke()}},{rough:.95,bleed:[8,7,6]}),crack:()=>r("crack",256,256,(v,g,x,y)=>{v.lineCap="round",v.lineJoin="round";let b=(m,A,_,M,E,w)=>{v.strokeStyle=`rgba(20,19,18,${.6+.35*Math.min(1,E/2.5)})`,v.lineWidth=E,v.beginPath(),v.moveTo(m,A);let S=Math.floor(M/9);for(let z=0;z<S;z++)_+=(y()-.5)*.8,m+=Math.cos(_)*9,A+=Math.sin(_)*9,v.lineTo(m,A),w>0&&y()<.22&&(v.stroke(),b(m,A,_+(y()<.5?1:-1)*(.5+y()*.7),M*(.3+y()*.3),E*.6,w-1),v.strokeStyle=`rgba(20,19,18,${.6+.35*Math.min(1,E/2.5)})`,v.lineWidth=E,v.beginPath(),v.moveTo(m,A));v.stroke()};b(g*.5,x*.5,y()*7,g*.42,2.6,3),b(g*.5,x*.5,y()*7+2,g*.4,2.2,3),b(g*.5,x*.5,y()*7+4,g*.36,1.8,2)},{rough:.95,bleed:[20,19,18]}),graffiti_tag:()=>r("graffiti_tag",384,256,(v,g,x,y)=>{v.lineCap="round",v.lineJoin="round";let b=(_,M,E)=>{v.strokeStyle=E,v.lineWidth=M,v.beginPath(),v.moveTo(_[0][0],_[0][1]);for(let w=1;w<_.length-1;w+=2)v.quadraticCurveTo(_[w][0],_[w][1],_[w+1][0],_[w+1][1]);v.stroke()},m="rgba(206,214,208,0.92)",A=[[[40,60],[36,130],[48,200],[70,150],[44,128],[80,110],[104,70]],[[104,70],[76,140],[108,190],[150,200],[150,110],[140,60],[112,84]],[[168,196],[172,120],[186,62],[200,110],[226,92],[214,150],[236,196]],[[250,76],[300,60],[318,66],[282,110],[262,178],[300,200],[334,176]]];for(let _ of A)b(_,12,"rgba(206,214,208,0.25)"),b(_,7,m);b([[30,222],[180,236],[352,206]],5,m),b([[330,40],[344,30],[356,44]],5,m);for(let _=0;_<7;_++){let M=50+y()*290,E=150+y()*50,w=12+y()*46,S=v.createLinearGradient(0,E,0,E+w);S.addColorStop(0,m),S.addColorStop(1,"rgba(206,214,208,0)"),v.fillStyle=S,v.fillRect(M,E,2+y()*2,w)}for(let _=0;_<260;_++)v.fillStyle=`rgba(206,214,208,${y()*.5})`,v.fillRect(30+y()*330,40+y()*190,1.2,1.2);Ks(v,g,x,.25,y)},{rough:.6,bleed:[206,214,208]}),csc_plate:()=>r("csc_plate",288,200,(v,g,x,y)=>{let b=v.createLinearGradient(0,0,g,x);b.addColorStop(0,"rgb(150,152,150)"),b.addColorStop(.5,"rgb(176,178,176)"),b.addColorStop(1,"rgb(138,140,138)"),v.fillStyle=b,v.beginPath(),v.roundRect?v.roundRect(3,3,g-6,x-6,8):v.rect(3,3,g-6,x-6),v.fill(),v.strokeStyle="rgba(40,42,44,0.8)",v.lineWidth=2,v.strokeRect(11,11,g-22,x-22);for(let[_,M]of[[20,20],[g-20,20],[20,x-20],[g-20,x-20]])v.fillStyle="rgb(96,98,98)",v.beginPath(),v.arc(_,M,5,0,7),v.fill(),v.fillStyle="rgba(230,232,232,0.7)",v.beginPath(),v.arc(_-1.2,M-1.2,2,0,7),v.fill();let m="rgba(28,30,32,0.92)";qa(v,"安全检验铭牌",g/2,46,19,m,{font:"sans",weight:600,align:"center",spacing:1.5,maxW:g-60}),["检验编号 SL/PA-4207/19","制造日期 2019年03月","设备编号 SLTU 402719 6","最大总重 30 480 千克","堆码载荷 192 000 千克","横向试验 150 千牛","下次检验 2027年09月"].forEach((_,M)=>{qa(v,_,30,70+M*16.5,11,m,{font:"mono",weight:500,spacing:0,maxW:g-60}),v.fillStyle="rgba(28,30,32,0.35)",v.fillRect(30,73+M*16.5,g-60,1)}),v.fillStyle="rgba(60,40,24,0.25)";for(let _=0;_<30;_++)ra(v,y()*g,y()*x,2+y()*9,y,.5,7),v.fill()},{rough:.45,metal:.75,text:!0}),numbers_0_9:()=>r("numbers_0_9",640,128,(v,g,x,y)=>{for(let b=0;b<10;b++)qa(v,String(b),b*64+32,x*.86,x*.92,An(Ut.white),{align:"center",weight:900,maxW:54});Ks(v,g,x,.3,y)},{bleed:Ut.white,text:!0})},u=Object.keys(c),h=new Set;function f(v){let g=t.get("d:"+v);if(g)return g;let x=c[v];if(!x)h.has(v)||(h.add(v),console.warn(`[mats] unknown decal "${v}"`)),g=f("grime_streak");else{let y=x();g={material:y.material,aspect:y.aspect},g.material.name="decal_"+v}return t.set("d:"+v,g),g}function p(v){let g="n:"+v,x=t.get(g);if(x)return x;let y=f("numbers_0_9").material,b=y.map.clone();b.repeat.set(.1,1),b.offset.set(Math.abs(v|0)%10/10,0),b.needsUpdate=!0;let m=y.clone();return m.map=b,n.push(()=>{b.needsUpdate=!0}),x={material:m,aspect:.5},t.set(g,x),x}function d(v,g={}){v=String(v===void 0?"":v).toUpperCase()||" ";let x=Ut[g.color]?g.color:"white",y=g.font==="sans"?"sans":"stencil",b=g.distress!==void 0?+g.distress:.35,m=`l:${v}|${x}|${y}|${b}`,A=t.get(m);if(A)return A;let _=128,M=100,E=Wg(4,4).getContext("2d"),w=y==="sans"?r3:o3,S=y==="sans"?600:700,z=M*.06,H=a3(E,v,M,w,S,z),O=Math.min(1,2e3/(H+32)),q=Math.max(48,Math.ceil((H+32)*O)),U=Math.ceil(_*O),T=r(m,q,U,(D,C,G,j)=>{D.save(),D.scale(O,O),qa(D,v,16,_*.84,M,An(Ut[x]),{font:y,weight:S,spacing:z,fitW:H}),D.restore(),Ks(D,C,G,b,j)},{bleed:Ut[x],text:!0,rough:.65});return A={material:T.material,aspect:T.aspect},A.material.name="label",t.set(m,A),A}try{if(typeof document<"u"&&document.fonts&&document.fonts.load){let v=0,g=()=>{v=0;for(let x of n)try{x()}catch{}};for(let x of['700 20px "PingFang SC"','900 20px "PingFang SC"','600 20px "PingFang SC"','500 20px "PingFang SC"'])document.fonts.load(x).then(y=>{y&&y.length&&!v&&(v=setTimeout(g,120))},()=>{})}}catch{}return{decal:f,label:d,number:p,names:u,bytes:()=>s}}
var Gi={container20:[6.06,2.59,2.44,"paint_red","metal"],container40:[12.19,2.59,2.44,"paint_blue","metal"],container40hc:[12.19,2.9,2.44,"paint_green","metal"],jersey_barrier:[3,.81,.6,"concrete","concrete"],light_mast:[.5,14,.5,"steel_galv","metal"],fence_panel:[3,2.4,.08,"chainlink","metal"],guard_booth:[2.6,2.7,2.2,"paint_white","metal"],gate_arm:[5,1.1,.3,"hazard_stripes","metal"],bollard_mooring:[.7,.6,.7,"steel_dark","metal"],bollard_post:[.17,1,.17,"paint_yellow","metal"],relay_node:[1.2,2.4,.8,"paint_grey","metal"],shelf_rack:[2.7,4.2,1.1,"paint_orange","metal"],stairs_metal:[3,2.6,1,"diamond_plate","metal"],catwalk:[3,1.1,1.2,"diamond_plate","metal"],reefer_unit:[.5,2.3,2.3,"paint_white","metal"],barrel:[.6,.9,.6,"paint_blue","metal"],pallet:[1.2,.144,1,"wood_pallet","wood"],pallet_stack:[1.2,1.15,1,"wood_pallet","wood"],crate_wood:[1.1,1,.9,"wood_pallet","wood"],crate_stack:[1.2,1.9,1,"wood_pallet","wood"],ibc_tote:[1.2,1.16,1,"plastic_grey","metal"],forklift:[3.4,2.2,1.25,"paint_yellow","metal"],cable_reel:[1.3,1.3,.8,"wood_dark","wood"],tire_stack:[.8,1,.8,"tire","rubber"],dumpster:[1.9,1.35,1.1,"paint_green","metal"],generator:[2.2,1.4,1,"paint_yellow","metal"],jerry_can:[.35,.47,.17,"paint_green","metal"],traffic_cone:[.36,.7,.36,"plastic_red","rubber"],gas_cylinders:[.9,1.6,.5,"steel_dark","metal"],tarp_cargo:[2.4,1.5,1.4,"tarp","dirt"],sandbags:[2,.9,.6,"tarp","dirt"],toolbox_cart:[.9,.95,.5,"plastic_red","metal"],floodlight_stand:[1,2.2,1,"paint_yellow","metal"],cardboard_boxes:[1,.8,.8,"cardboard","wood"],pipe_stack:[6,.9,1.2,"steel_rust","metal"],sign_post:[.6,2.4,.08,"paint_white","metal"]};
function $a(i){let e=(i|0)*2654435761|0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}
var RA=i=>Math.max(0,Math.min(1,i));
var mn=(i,e,t)=>{let n=RA((t-i)/(e-i));return n*n*(3-2*n)};
var Ir=(i,e,t)=>[i[0]+(e[0]-i[0])*t,i[1]+(e[1]-i[1])*t,i[2]+(e[2]-i[2])*t];
var f1=new In;
var Fc=new Lt;
var g3=new Ye;
var d1=new W;
var p1=new W(1,1,1);
var m1=new WeakMap;
var Bc=2.438;
var _3={container20:{type:"22G1",gross:"30,480",tare:"2,230",net:"28,250",cu:"33.2",def:"red"},container40:{type:"42G1",gross:"32,500",tare:"3,750",net:"28,750",cu:"67.7",def:"blue"},container40hc:{type:"45G1",gross:"32,500",tare:"3,940",net:"28,560",cu:"76.3",def:"green"}};
var v1=["SLTU 482915 7","HBMU 307144 2","NRDU 665201 9","OKTU 119873 4","VSLU 850362 1","TQLU 274590 6"];
var v3=["logo_a","logo_b","logo_c","logo_d"];
var jg=["red","blue","green","yellow","orange","white","grey","teal"];
var Jt={body:!0};
var IA=6;
var x3=new Map;
var y3=.178;
var bf=.118;
var b3=.162;
var Uo={P:.278,d:.036,fo:.072,sl:.068};
var x1={P:.209,d:.02,fo:.09,sl:.03};
var y1={P:.25,d:.042,fo:.07,sl:.06};
function Ly(i){let e,t,n,s=-1,o=0;for(let c=0;c<i.length;++c){let u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;o+=u.count*t}let r=new e(o),a=new et(r,t,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let f=0,p=u.count;f<p;f++)for(let d=0;d<t;d++){let v=u.getComponent(f,d);a.setComponent(f+h,d,v)}}else r.set(u.array,l);l+=u.count*t}return s!==void 0&&(a.gpuType=s),a}
function sa(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),o={},r={},a=i[0].morphTargetsRelative,l=new nt,c=0;for(let u=0;u<i.length;++u){let h=i[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in h.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(h.attributes[p]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in h.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;r[p]===void 0&&(r[p]=[]),r[p].push(h.morphAttributes[p])}if(e){let p;if(t)p=h.index.count;else if(h.attributes.position!==void 0)p=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,u),c+=p}}if(t){let u=0,h=[];for(let f=0;f<i.length;++f){let p=i[f].index;for(let d=0;d<p.count;++d)h.push(p.getX(d)+u);u+=i[f].attributes.position.count}l.setIndex(h)}for(let u in o){let h=Ly(o[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in r){let h=r[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let p=[];for(let v=0;v<r[u].length;++v)p.push(r[u][v][f]);let d=Ly(p);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(d)}}return l}
function $e(i,e,t,n="center"){let s=new un(i,e,t),o=s.attributes.uv,r=s.attributes.position,a=s.attributes.normal;for(let l=0;l<o.count;l++){let c=Math.abs(a.getX(l)),u=Math.abs(a.getY(l)),h=r.getX(l),f=r.getY(l),p=r.getZ(l);c>.5?o.setXY(l,p,f):u>.5?o.setXY(l,h,p):o.setXY(l,h,f)}return n==="bottom"&&s.translate(0,e/2,0),s}
function Wi(i,e,t,n=.02,s="center"){n=Math.min(n,i/2-1e-4,e/2-1e-4,t/2-1e-4);let o=new un(i,e,t,3,3,3),r=o.attributes.position,a=o.attributes.normal,l=o.attributes.uv,c=i/2,u=e/2,h=t/2,f=(p,d)=>{let v=Math.abs(p),g=Math.sign(p);return v>d-1e-5?g*d:g*(d-n)};for(let p=0;p<r.count;p++){let d=f(r.getX(p),c),v=f(r.getY(p),u),g=f(r.getZ(p),h),x=Math.max(-(c-n),Math.min(c-n,d)),y=Math.max(-(u-n),Math.min(u-n,v)),b=Math.max(-(h-n),Math.min(h-n,g));if(oa.set(d-x,v-y,g-b),oa.lengthSq()>1e-10){oa.normalize();let M=a.getX(p),E=a.getY(p),w=a.getZ(p);(Math.abs(d)>c-1e-5?1:0)+(Math.abs(v)>u-1e-5?1:0)+(Math.abs(g)>h-1e-5?1:0)>=2?(d=x+oa.x*n,v=y+oa.y*n,g=b+oa.z*n,a.setXYZ(p,oa.x,oa.y,oa.z)):a.setXYZ(p,M,E,w)}r.setXYZ(p,d,v,g);let m=Math.abs(a.getX(p)),A=Math.abs(a.getY(p)),_=Math.abs(a.getZ(p));m>=A&&m>=_?l.setXY(p,g,v):A>=m&&A>=_?l.setXY(p,d,g):l.setXY(p,d,v)}return s==="bottom"&&o.translate(0,e/2,0),o}
function ot(i,e,t,n=16,s=!1,o="center"){let r=new Ys(i,e,t,n,1,s),a=r.attributes.uv,l=r.attributes.position,c=r.attributes.normal,u=Math.PI*(i+e);for(let h=0;h<a.count;h++)Math.abs(c.getY(h))>.9?a.setXY(h,l.getX(h),l.getZ(h)):a.setXY(h,a.getX(h)*u,l.getY(h));return o==="bottom"&&r.translate(0,t/2,0),r}
function Fn(i,e=.03,t=8,n=!1,s=0){let o=i.map(h=>h.isVector3?h:new W(h[0],h[1],h[2])),r=new Jr(o,n,"catmullrom",s),a=r.getLength(),l=Math.max(2,Math.ceil(a/Math.max(.08,e*3))),c=new Kr(r,Math.min(l,400),e,t,n),u=c.attributes.uv;for(let h=0;h<u.count;h++)u.setXY(h,u.getX(h)*a,u.getY(h)*Math.PI*2*e);return c}
function Dc(i,{p:e=[0,0,0],r:t=[0,0,0],s:n=1}={}){return Uy.set(t[0],t[1],t[2]),Fy.setFromEuler(Uy),Ny.set(e[0],e[1],e[2]),typeof n=="number"?Fg.set(n,n,n):Fg.set(n[0],n[1],n[2]),ky.compose(Ny,Fy,Fg),i.applyMatrix4(ky),i}
function Lc(i,e){let t=i.attributes.position,n=t.count,s=new Float32Array(n*3);for(let o=0;o<n;o++){let r=typeof e=="function"?e(t.getX(o),t.getY(o),t.getZ(o)):e;s[o*3]=r[0],s[o*3+1]=r[1],s[o*3+2]=r[2]}return i.setAttribute("color",new et(s,3)),i}
function Ii(i){let e=i.filter(Boolean).map(l=>(l.attributes.uv||l.setAttribute("uv",new et(new Float32Array(l.attributes.position.count*2),2)),l.attributes.normal||l.computeVertexNormals(),l));if(!e.length)return new nt;let t=e.some(l=>l.attributes.color),n=e.map(l=>{let c=(l.index,l);if(t&&!c.attributes.color){let u=new Float32Array(c.attributes.position.count*3).fill(1);c.setAttribute("color",new et(u,3))}for(let u of Object.keys(c.attributes))["position","normal","uv","color"].includes(u)||c.deleteAttribute(u);return c}),s=n.every(l=>l.index),o=n.every(l=>!l.index),r=s||o?n:n.map(l=>l.index?l.toNonIndexed():l);return sa(r,!1)||new nt}
function h1(i,e){let t=Math.sin(i*127.1+e*311.7)*43758.5453;return t-Math.floor(t)}
function ri(i,e){let t=Math.floor(i),n=Math.floor(e),s=i-t,o=e-n,r=s*s*(3-2*s),a=o*o*(3-2*o),l=h1(t,n),c=h1(t+1,n),u=h1(t,n+1),h=h1(t+1,n+1);return l+(c-l)*r+(u-l)*a+(l-c-u+h)*r*a}
function p3(i,e,t,n=.01,s="center"){n=Math.max(5e-4,Math.min(n,i/2-1e-4,e/2-1e-4,t/2-1e-4));let o=i/2,r=e/2,a=t/2,l=new Float32Array(72),c=new Float32Array(72),u=new Float32Array(48),h=(x,y,b,m)=>((x>0?1:0)+(y>0?2:0)+(b>0?4:0))*3+m;for(let x of[-1,1])for(let y of[-1,1])for(let b of[-1,1]){let m=[[x*o,y*(r-n),b*(a-n)],[x*(o-n),y*r,b*(a-n)],[x*(o-n),y*(r-n),b*a]],A=[[x,0,0],[0,y,0],[0,0,b]];for(let _=0;_<3;_++){let M=h(x,y,b,_);l.set(m[_],M*3),c.set(A[_],M*3),_===0?(u[M*2]=m[_][2],u[M*2+1]=m[_][1]):_===1?(u[M*2]=m[_][0],u[M*2+1]=m[_][2]):(u[M*2]=m[_][0],u[M*2+1]=m[_][1])}}let f=[],p=(x,y,b)=>{let m=l[x*3],A=l[x*3+1],_=l[x*3+2],M=l[y*3]-m,E=l[y*3+1]-A,w=l[y*3+2]-_,S=l[b*3]-m,z=l[b*3+1]-A,H=l[b*3+2]-_,O=E*H-w*z,q=w*S-M*H,U=M*z-E*S,T=m+(M+S)/3,D=A+(E+z)/3,C=_+(w+H)/3;O*T+q*D+U*C>=0?f.push(x,y,b):f.push(x,b,y)},d=(x,y,b,m)=>{p(x,y,b),p(x,b,m)},v=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let x of[-1,1])d(...v.map(([y,b])=>h(x,y,b,0))),d(...v.map(([y,b])=>h(y,x,b,1))),d(...v.map(([y,b])=>h(y,b,x,2)));for(let x of[-1,1])for(let y of[-1,1])d(h(-1,x,y,1),h(1,x,y,1),h(1,x,y,2),h(-1,x,y,2)),d(h(x,-1,y,0),h(x,1,y,0),h(x,1,y,2),h(x,-1,y,2)),d(h(x,y,-1,0),h(x,y,1,0),h(x,y,1,1),h(x,y,-1,1));for(let x of[-1,1])for(let y of[-1,1])for(let b of[-1,1])p(h(x,y,b,0),h(x,y,b,1),h(x,y,b,2));let g=new nt;return g.setAttribute("position",new et(l,3)),g.setAttribute("normal",new et(c,3)),g.setAttribute("uv",new et(u,2)),g.setIndex(f),s==="bottom"&&g.translate(0,e/2,0),g}
function m3(i,e,t,n,s,o){let r=0;for(let a=t;a<n;a+=9){let l=i[a+3]-i[a],c=i[a+4]-i[a+1],u=i[a+5]-i[a+2],h=i[a+6]-i[a],f=i[a+7]-i[a+1],p=i[a+8]-i[a+2],d=c*p-u*f,v=u*h-l*p,g=l*f-c*h;r+=d*((i[a]+i[a+3]+i[a+6])/3-s[0])+v*((i[a+1]+i[a+4]+i[a+7])/3-s[1])+g*((i[a+2]+i[a+5]+i[a+8])/3-s[2])}if(r<0!=!!o)for(let a=t;a<n;a+=9){for(let c=0;c<3;c++){let u=i[a+3+c];i[a+3+c]=i[a+6+c],i[a+6+c]=u}let l=a/3*2;for(let c=0;c<2;c++){let u=e[l+2+c];e[l+2+c]=e[l+4+c],e[l+4+c]=u}}}
function la(i,e,t,{closed:n=!1,center:s=null,inward:o=!1,caps:r=!1}={}){let a=[],l=[],c=i.length,u=n?c:c-1,h=[0];for(let g=0;g<u;g++){let x=i[g],y=i[(g+1)%c];h.push(h[g]+Math.hypot(y[0]-x[0],y[1]-x[1]))}for(let g=0;g<e.length-1;g++){let x=e[g],y=e[g+1];for(let b=0;b<u;b++){let m=i[b],A=i[(b+1)%c],_=t(m[0],m[1],x,g),M=t(A[0],A[1],x,g),E=t(A[0],A[1],y,g+1),w=t(m[0],m[1],y,g+1);a.push(..._,...M,...E,..._,...E,...w),l.push(h[b],x,h[b+1],x,h[b+1],y,h[b],x,h[b+1],y,h[b],y)}}let f=a.length,p=null,d=()=>{if(s)return s;if(!p){p=[0,0,0];for(let x=0;x<f;x+=3)p[0]+=a[x],p[1]+=a[x+1],p[2]+=a[x+2];let g=3/f;p[0]*=g,p[1]*=g,p[2]*=g}return p};if(m3(a,l,0,f,d(),o),r&&n){let g=0,x=0;for(let y of i)g+=y[0],x+=y[1];g/=c,x/=c;for(let y of[0,e.length-1]){let b=a.length,m=e[y],A=t(g,x,m,y);for(let _=0;_<c;_++){let M=i[_],E=i[(_+1)%c];a.push(...A,...t(M[0],M[1],m,y),...t(E[0],E[1],m,y)),l.push(g,x,M[0],M[1],E[0],E[1])}m3(a,l,b,a.length,d(),o)}}let v=new nt;return v.setAttribute("position",new et(new Float32Array(a),3)),v.setAttribute("uv",new et(new Float32Array(l),2)),v.computeVertexNormals(),v}
function CA(i,e,t,n,s){let o=i%e;o<0&&(o+=e);let r=e-n-2*s;return o<=n?0:o<n+s?-t*(o-n)/s:o<=n+s+r?-t:-t*(1-(o-n-s-r)/s)}
function Uc(i,e,t,n,s,o,r=i){let a=t-s-2*o,l=[0,s,s+o,s+o+a],c=[i],u=Math.floor((i-r)/t)-1,h=Math.ceil((e-r)/t)+1;for(let f=u;f<=h;f++)for(let p of l){let d=r+f*t+p;d>i+1e-4&&d<e-1e-4&&c.push(d)}return c.push(e),c.map(f=>[f,CA(f-r,t,n,s,o)])}
function pr(i,e,t=5){let n=[],s=Math.min(i,e)/2,o=i/2-s,r=e/2-s;for(let u=0;u<4;u++)for(let h=0;h<=t;h++){let f=(u+h/t)*Math.PI/2;n.push([Math.cos(f)*s+(u===0||u===3?o:-o),Math.sin(f)*s+(u<2?r:-r)])}let a=[],l=[];for(let u=0;u<n.length;u++){let h=n[u],f=n[(u+1)%n.length];a.push(0,0,0,h[0],h[1],0,f[0],f[1],0),l.push(.5,.5,h[0]/i+.5,h[1]/e+.5,f[0]/i+.5,f[1]/e+.5)}let c=new nt;return c.setAttribute("position",new et(new Float32Array(a),3)),c.setAttribute("uv",new et(new Float32Array(l),2)),c.computeVertexNormals(),c}
function cn(i,e){return new rn(i,e)}
function Nc(i,e){let t=new rn(i,e),n=t.attributes.uv;for(let s=0;s<n.count;s++)n.setXY(s,n.getX(s)*i,n.getY(s)*e);return t}
function PA(i){let e=i.index?i.toNonIndexed():i;return e.computeVertexNormals(),e}
var oa=new W;
var ky=new Ye;
var Fy=new Lt;
var Uy=new In;
var Ny=new W;
var Fg=new W;
function je(i,e=0,t=0,n=0,s=null){return s?(f1.set(s[0],s[1],s[2]),Fc.setFromEuler(f1)):Fc.identity(),d1.set(e,t,n),g3.compose(d1,Fc,p1),i.applyMatrix4(g3),i}
function _o(i=0,e=0,t=0,n=null){return n?(f1.set(n[0],n[1],n[2]),Fc.setFromEuler(f1)):Fc.identity(),d1.set(i,e,t),new Ye().compose(d1,Fc,p1)}
var jn=class{constructor(e){this.G=e,this.buckets=new Map,this.stack=[],this.m=null,this.defCol=new Map}M(e,t){return this.G.mats.get(e,t)}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this}pop(){return this.m=this.stack.pop(),this}add(e,t,n,s){this.m&&t.applyMatrix4(this.m);let o=n||this.defCol.get(e);o&&Lc(t,o);let r=this.buckets.get(e);return r||(r={mat:e,geos:[],cast:!s},this.buckets.set(e,r)),r.geos.push(t),t}box(e,t,n,s,o,r,a,l={}){return this.add(e,je(l.r===0?$e(t,n,s):p3(t,n,s,l.r||Math.min(.012,Math.min(t,n,s)*.25)),o,r,a,l.rot),l.col)}cyl(e,t,n,s,o,r,a,l={}){let c=ot(t,n,s,l.seg||12,!!l.open);return l.flat&&(c=PA(c)),this.add(e,je(c,o,r,a,l.rot),l.col)}tube(e,t,n,s={}){return this.add(e,Fn(t,n,s.seg||6,!1,s.tension===void 0?.5:s.tension),s.col)}bar(e,t,n,s,o={}){let r=new W(n[0]-t[0],n[1]-t[1],n[2]-t[2]),a=r.length(),l=ot(o.r2===void 0?s:o.r2,s,a,o.seg||6,!o.caps),c=new Lt().setFromUnitVectors(new W(0,1,0),r.normalize());return l.applyMatrix4(new Ye().compose(new W((t[0]+n[0])/2,(t[1]+n[1])/2,(t[2]+n[2])/2),c,p1)),this.add(e,l,o.col)}beam(e,t,n,s,o,r={}){let a=new W(n[0]-t[0],n[1]-t[1],n[2]-t[2]),l=a.length(),c=r.r===0?$e(s,l,o):p3(s,l,o,r.r||Math.min(s,o)*.2),u=new Lt().setFromUnitVectors(new W(0,1,0),a.normalize());return r.twist&&u.multiply(new Lt().setFromAxisAngle(new W(0,1,0),r.twist)),c.applyMatrix4(new Ye().compose(new W((t[0]+n[0])/2,(t[1]+n[1])/2,(t[2]+n[2])/2),u,p1)),this.add(e,c,r.col)}decal(e,t,n,s,o,r,a){return this.add(e.material,je(cn(a||t*e.aspect,t),n,s,o,r),null,!0)}parts(){let e=[];for(let t of this.buckets.values())e.push({mat:t.mat,geo:Ii(t.geos),cast:t.cast});return e}group(e){return Zg(this.parts(),e)}};
function Zg(i,e){let t=new wt;for(let n of i){let s=new Qe(n.geo,e&&e.get(n.mat)||n.mat);s.castShadow=n.cast,s.receiveShadow=!0,t.add(s)}return t}
function qi(i,e,t,n){return i.userData.size=t,i.userData.colliders=n,i.name=e,i}
function Mi(i,e,t){let n=m1.get(i.mats);n||(n=new Map,m1.set(i.mats,n));let s="L|"+e+"|"+JSON.stringify(t||{});if(!n.has(s)){let o;try{o=i.mats.label(e,t||{})}catch{o=null}n.set(s,o&&o.material?o:{material:i.mats.get("paint_white"),aspect:Math.max(1,e.length*.6)})}return n.get(s)}
function Jn(i,e){let t=m1.get(i.mats);t||(t=new Map,m1.set(i.mats,t));let n="D|"+e;if(!t.has(n)){let s;try{s=i.mats.decal(e)}catch{s=null}t.set(n,s&&s.material?s:{material:i.mats.get("paint_white"),aspect:1})}return t.get(n)}
function zA(i,e,t,n,s){let o=Gi[e][0],r=Gi[e][1],a=_3[e],l=$a(1e3+t*77+e.length*13),c=new jn(i),u=c.M("steel_galv"),h=c.M("wood_pallet"),f=Bc/2,p=o/2,d=f-.012,v=-p+.085,g=p-.135,x=.167,y=r-.06,b=[],m=Math.round((1+l()*2.4)*(.4+s)),A=[[-p*.75,-p*.05],[p-2.2,p]];for(let $=0;$<m;$++){let ue=l()<.5?1:-1,me=0,ee=0;do me=(l()*2-1)*(p-.9),ee++;while(ee<8&&A.some(B=>me>B[0]-.4&&me<B[1]+.4&&l()<.9));b.push({side:ue,x:ue*me,y:.45+l()*1.3,r:.22+l()*.3,depth:.025+l()*.04})}let _=[],M=Math.round(o/2.2*(.5+s)*(.6+l()));for(let $=0;$<M*2;$++)_.push({side:$%2?1:-1,x:(l()*2-1)*(p-.3),w:.05+l()*.12,k:.4+l()*.6});let E=[.5,.44,.38],w=[.62,.38,.24],S=t*9.7,z=($,ue,me)=>{let ee=1+(ri($*.9+S,ue*1.7+me*.4)-.5)*.16*(.5+s);ee*=.94+.06*ri($*6.1+me*3.3,ue*5+S);let B=[ee,ee,ee],P=mn(.62,.02,ue)*(.45+.5*s)*(.75+.5*ri($*2.3+me,S));return B=Ir(B,[E[0]*ee,E[1]*ee,E[2]*ee],Math.min(1,P)),B};c.defCol.set(Jt,z);let H=($,ue,me)=>{let ee=0;for(let B of b)if(B.side===me){let P=Math.hypot($-B.x,(ue-B.y)*.9)/B.r;if(P<1){let V=1-P*P;ee+=B.depth*V*V}}return ee},O=[.035,.035,.04];for(let $ of[-1,1])for(let ue of[0,1])for(let me of[-1,1]){let ee=$*(p-y3/2),B=ue?r-bf/2:bf/2,P=me*(f-b3/2);c.box(Jt,y3,bf,b3,ee,B,P,{r:.012}),c.add(Jt,je(pr(.078,.052,3),ee,B,me*(f+.0012),[0,me>0?0:Math.PI,0]),O),c.add(Jt,je(pr(.064,.05,3),$*(p+.0012),B,P,[0,$*Math.PI/2,0]),O),ue&&c.add(Jt,je(pr(.124,.064,3),ee,r+.0012,P,[-Math.PI/2,0,0]),O)}for(let $ of[-1,1])c.box(Jt,.085,r-2*bf+.01,.15,-p+.0465,r/2,$*(f-.079),{r:.014}),c.box(Jt,.14,r-2*bf+.01,.056,p-.074,r/2,$*(f-.032),{r:.012}),c.box(Jt,o-.2,.062,.062,-.02,r-.031,$*(f-.035),{r:.008}),c.box(Jt,o-.2,.158,.05,-.02,.012+.079,$*(f-.029),{r:.008});if(c.box(Jt,.062,.062,Bc-.2,-p+.035,r-.031,0,{r:.008}),c.box(Jt,.05,.158,Bc-.2,-p+.029,.091,0,{r:.008}),c.box(Jt,.13,.12,Bc-.12,p-.072,r-.06,0,{r:.01}),c.box(Jt,.13,.158,Bc-.12,p-.072,.091,0,{r:.01}),c.box(Jt,.03,.012,Bc-.4,p-.012,r-.125,0,{r:.003,rot:[0,0,-.5]}),e==="container20")for(let $ of[-1,1])for(let ue of[-1.025,1.025]){c.add(Jt,je(cn(.36,.112),ue,.075,$*(f-.0035),[0,$>0?0:Math.PI,0]),O),c.box(Jt,.46,.018,.012,ue,.142,$*(f-.002),{r:.003});for(let me of[-1,1])c.box(Jt,.018,.13,.01,ue+me*.19,.078,$*(f-.003),{r:.003})}let q=[x,.44,1.25,r-.5,y],U=Uc(v,g,Uo.P,Uo.d,Uo.fo,Uo.sl,v+.02);for(let $ of[-1,1]){let ue=la(U,q,(B,P,V)=>[B,V,$*(d+P-H(B,V,$))],{center:[0,r/2,0]});ue.computeVertexNormals();let me=ue.attributes.position,ee=new Float32Array(me.count*3);for(let B=0;B<me.count;B++){let P=me.getX(B),V=me.getY(B),Y=me.getZ(B),L=z(P,V,Y),Z=d-Math.abs(Y),J=mn(.008,.034,Z);L=[L[0]*(1-.17*J),L[1]*(1-.18*J),L[2]*(1-.18*J)];let oe=mn(r-.75,y,V);if(oe>0){for(let le of _)if(le.side===$){let R=Math.abs(P-le.x)/le.w;R<1&&(L=Ir(L,[L[0]*w[0],L[1]*w[1],L[2]*w[2]],oe*oe*le.k*(1-R*R)*(.45+.55*s)))}}let fe=H(P,V,$);fe>.004&&(L=Ir(L,[L[0]*.66,L[1]*.46,L[2]*.36],Math.min(.8,fe*22))),ee[B*3]=L[0],ee[B*3+1]=L[1],ee[B*3+2]=L[2]}ue.setAttribute("color",new et(ee,3)),c.buckets.get(Jt).geos.push(ue)}for(let $ of[-1,1])for(let ue of o>7?[-1,1]:[1]){let me=$*ue*(p-.62),ee=r-.165,B=$*(d-.004);c.box(Jt,.24,.1,.03,me,ee,B,{r:.008});for(let P=-1;P<=1;P++)c.add(Jt,je(cn(.18,.012),me,ee+P*.026,$*(d+.0116),[0,$>0?0:Math.PI,0]),O)}{let $=Uc(-f+.155,f-.155,y1.P,y1.d,y1.fo,y1.sl,-f+.155+.03),ue=la($,[x,1.25,y],(ee,B,P)=>[-(p-.014+B),P,ee],{center:[0,r/2,0]}),me=-(p-.014);c.add(Jt,ue,(ee,B,P)=>{let V=z(ee,B,P),Y=mn(.008,.038,ee-me);return[V[0]*(1-.17*Y),V[1]*(1-.18*Y),V[2]*(1-.18*Y)]})}{let $=Uc(-p+.07,p-.13,x1.P,x1.d,x1.fo,x1.sl,-p+.1),ue=r-.008,me=la($,o>7?[-(f-.066),f-.066]:[-(f-.066),0,f-.066],(ee,B,P)=>[ee,ue+B+(Math.abs(P)<.01?.006:0),P],{center:[0,r/2,0]});c.add(Jt,me,(ee,B,P)=>{let V=.78+.3*ri(ee*.8+S,P*1.1),Y=mn(.004,.018,ue-B);return[V*(1-.25*Y),V*(1-.3*Y)*.97,V*(1-.32*Y)*.94]})}let T=n>.03,D=.172;if(T){let $=(ee,B,P)=>{let Y=(.16+.62*mn(-p,p,ee)*mn(-p,p,ee))*(.8+.2*mn(.2,1.4,B));return[Y,Y,Y]},ue=Uc(v,g,Uo.P,Uo.d,Uo.fo,Uo.sl,v+.02);for(let ee of[-1,1])c.add(Jt,la(ue,[D,y-.02],(B,P,V)=>[B,V,ee*(d+P-.004)],{center:[0,r/2,0],inward:!0}),$);c.add(Jt,je(cn(g-v,2*d),(v+g)/2,y-.03,0,[Math.PI/2,0,0]),$),c.add(Jt,je(cn(2*d,y-D),v+.03,(D+y)/2,0,[0,Math.PI/2,0]),$);let me=Nc(g-v+.1,2*d-.02);c.add(h,je(me,(v+g)/2+.05,D,0,[-Math.PI/2,0,0]),ee=>{let B=.3+.6*mn(-p,p,ee)**2;return[B,B*.97,B*.93]}),c.box(u,.05,.006,2*d-.1,p-.11,D+.001,0,{r:.002})}let C=.175,G=r-.124,j=G-C,N=f-.058-.004,Q=p-.066,K=($,ue,me)=>z($,ue,me),ie=[];for(let $ of[1,-1]){let ue=n*($>0?1:.88)*bs.degToRad($>0?112:100),me=$*(f-.058);c.push(_o(Q,0,me,[0,-$*ue,0]));let ee=k=>-$*k,B=(C+G)/2;c.box(Jt,.034,j,N-.006,0,B,ee(N/2),{r:.008,col:K});let P=e==="container40hc"?7:6,V=C+.085,Y=G-.085,L=(Y-V)/P,Z=.019,J=.031,oe=[];for(let k=0;k<P;k++){let ce=V+k*L;oe.push([ce,Z],[ce+.022,Z],[ce+.05,J],[ce+L-.05,J],[ce+L-.022,Z])}oe.push([Y,Z]),c.add(Jt,la(oe,[.075,N-.085],(k,ce,ve)=>[ce,k,ee(ve)],{center:[-1,B,ee(N/2)]}),(k,ce,ve)=>z(k,ce,ve));let fe=k=>V+(k+.5)*L,le=[.05,.05,.05];c.box(Jt,.022,j+.012,.018,.004,B,ee(N+.001),{r:0,col:le}),c.box(Jt,.022,.016,N,.004,G+.004,ee(N/2),{r:0,col:le}),c.box(Jt,.022,.016,N,.004,C-.004,ee(N/2),{r:0,col:le});let R=e==="container40hc"?5:4;for(let k=0;k<R;k++){let ce=C+.16+k*(j-.32)/(R-1);c.box(Jt,.012,.062,.15,.021,ce,ee(.085),{r:0}),c.cyl(u,.013,.013,.086,.026,ce,ee(-.002),{seg:6,open:!0})}for(let k of[.31,.83]){c.cyl(u,.0155,.0155,j+.2,.052,B,ee(k),{seg:7,open:!0});for(let Te of[-1,1])c.add(u,je($e(.03,.045,.085),.052-.004,B+Te*(j/2+.065),ee(k))),c.box(Jt,.03,.05,.075,.052-.012,B+Te*(j/2-.035),ee(k),{r:0});for(let Te of[C+j*.3,C+j*.72])c.box(Jt,.026,.04,.07,.052-.012,Te,ee(k),{r:0});let ve=1.02+(k>.5?0:.13),_e=k>.5?-1:1;c.box(u,.02,.05,.05,.052+.008,ve,ee(k),{r:0}),c.box(u,.011,.032,.36,.052+.016,ve,ee(k+_e*.19),{r:.004}),c.box(Jt,.03,.07,.05,.052-.008,ve,ee(k+_e*.33),{r:0}),c.box(u,.012,.085,.012,.052+.012,ve+.005,ee(k+_e*.33),{r:0})}let I=.031+.0025,se=[0,Math.PI/2,0],ae=(k,ce,ve,_e,Te)=>{let Pe=ce*k.aspect;Te&&Pe>Te&&(ce*=Te/Pe,Pe=Te),c.add(k.material,je(cn(Pe,ce),I,ve,ee(_e),se),null,!0)};if($<0){ae(Mi(i,v1[t%v1.length],{color:"white",font:"stencil",distress:.3}),.115,fe(P-1),N/2,N-.24),ae(Mi(i,a.type,{color:"white",font:"stencil",distress:.3}),.1,fe(P-2),N/2+.2,.4);let k={color:"white",font:"sans",distress:.2};ae(Mi(i,"最大总重 "+a.gross+" 千克",k),.052,fe(P-3)+.062,N/2-.01,.44),ae(Mi(i,"皮重 "+a.tare+" 千克  净重 "+a.net+" 千克",k),.045,fe(P-3),N/2-.01,.44),ae(Mi(i,"容积 "+a.cu+" 立方米",k),.045,fe(P-3)-.062,N/2-.01,.44)}else ae(Jn(i,v3[t%4]),.2,fe(P-1),N/2,N-.36),ae(Jn(i,"csc_plate"),.17,fe(1),N/2+.05,.36),e==="container40hc"&&ae(Jn(i,"caution_stripes"),.1,G-.04,N/2,N-.1);if(c.pop(),T)for(let k=0;k<3;k++){let ce=N*k/3,ve=N*(k+1)/3,_e=[Q+Math.sin(ue)*ce,me-$*Math.cos(ue)*ce],Te=[Q+Math.sin(ue)*ve,me-$*Math.cos(ue)*ve];ie.push({min:[Math.min(_e[0],Te[0])-.03,C,Math.min(_e[1],Te[1])-.03],max:[Math.max(_e[0],Te[0])+.03,G,Math.max(_e[1],Te[1])+.03],surface:"metal"})}}for(let $ of[1,-1])for(let ue of[.31,.83])for(let me of[-1,1]){let ee=$*(f-.058)-$*ue;c.add(Jt,je($e(.035,.05,.11),p-.03,me>0?r-.07:.115,ee))}let F=($,ue,me,ee,B,P)=>{let V=B*$.aspect;P&&V>P&&(B*=P/V,V=P);let Y=me-V/2,L=me+V/2,Z=ue>0?Y:-L,J=ue>0?L:-Y,oe=Uc(Math.max(v,Z),Math.min(g,J),Uo.P,Uo.d,Uo.fo,Uo.sl,v+.02),fe=ee-B/2,le=ee+B/2,R=la(oe,[fe,le],(ae,k,ce)=>[ae,ce,ue*(d+k+.003-H(ae,ce,ue))],{center:[0,r/2,0]}),I=R.attributes.position,se=R.attributes.uv;for(let ae=0;ae<I.count;ae++){let k=(I.getX(ae)-Z)/(J-Z);se.setXY(ae,ue>0?k:1-k,(I.getY(ae)-fe)/B)}return c.add($.material,R,null,!0),V},X=Mi(i,v1[t%v1.length],{color:"white",font:"stencil",distress:.3}),ne=Mi(i,a.type,{color:"white",font:"stencil",distress:.3}),re=Jn(i,v3[t%4]);for(let $ of[-1,1]){let ue=Math.min(r*.4,1.05),me=Math.min(ue*re.aspect,e==="container20"?2.2:3.4);F(re,$,e==="container20"?-.75:-p*.42,r*.52,me/re.aspect,me);let ee=Math.min(.14*X.aspect,1.9);F(X,$,p-.3-ee/2,r-.32,.14,1.9);let B=Math.min(.11*ne.aspect,.6);F(ne,$,p-.3-B/2,r-.52,.11,.6);let P=Math.round((1+l()*2)*(.4+s)*(o>7?1.6:1));for(let V=0;V<P;V++){let Y=Jn(i,l()<.6?"rust_run":"grime_streak"),L=.5+l()*.7,Z=Math.min(.5,Math.max(.16,L*Y.aspect));F({material:Y.material,aspect:Z/L},$,(l()*2-1)*(p-.6),y-L/2-.005,L)}}return T?ie.push({min:[-p,0,-f],max:[p,D,f],surface:"wood"},{min:[-p,r-.09,-f],max:[p,r,f],surface:"metal"},{min:[-p,0,-f],max:[p,r,-f+.07],surface:"metal"},{min:[-p,0,f-.07],max:[p,r,f],surface:"metal"},{min:[-p,0,-f],max:[-p+.07,r,f],surface:"metal"}):ie.push({min:[-p,0,-f],max:[p,r,f],surface:"metal"}),{parts:c.parts(),colliders:ie}}
function M3(i,e,t={}){let n=_3[e],s=t.seed===void 0?0:Math.abs(Math.floor(t.seed)),o=s%IA,r=Math.round(bs.clamp(t.doors||0,0,1)*10)/10,a=Math.round(bs.clamp(t.wear===void 0?.5:t.wear,0,1)*2)/2,l=e+"|"+o+"|"+r+"|"+a,c=x3.get(i.mats);c||(c=new Map,x3.set(i.mats,c)),c.has(l)||c.set(l,zA(i,e,o,r,a));let u=c.get(l),h=t.color;jg.includes(h)||(h=t.seed===void 0?n.def:jg[(s*7+3)%jg.length]);let f=Zg(u.parts,new Map([[Jt,i.mats.get("paint_"+h,{vertexColors:!0})]])),p=Gi[e];return f.userData.color=h,f.userData.doors=r,qi(f,e,[p[0],p[1],p[2]],u.colliders.map(d=>({min:d.min.slice(),max:d.max.slice(),surface:d.surface})))}
function createDecalService(ctx = {}, options = {}) {
  if (ctx.canvasFactory) __containerCanvasFactory = ctx.canvasFactory;
  else if (ctx.canvas && typeof ctx.canvas.getContext === "function") __containerCanvasFactory = () => ctx.canvas;
  return l3(ctx, options.anisotropy === undefined ? 4 : options.anisotropy);
}

function buildContainer(ctx, type, options = {}) {
  if (!ctx || !ctx.mats || typeof ctx.mats.get !== "function" || typeof ctx.mats.label !== "function" || typeof ctx.mats.decal !== "function") {
    throw new TypeError("buildContainer requires ctx.mats.get(), ctx.mats.label(), and ctx.mats.decal()");
  }
  return M3(ctx, type, options);
}
  return { createDecalService, buildContainer, M3, zA, jn, Zg, qi, l3, Gi };
})();

/* ── props-builder ── 原文，仅替换 import ── */
window.ASSET_MODULES["props-builder"] = (function () {
  const THREE = window.THREE;
  const mergeGeometries = window.__mergeGeometries;
/* Extracted from /Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html; source SHA-256 9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966. Constructor and registration sources are preserved verbatim. */

const lt = THREE;
const Ae = THREE.Vector2;
const Ci = THREE.TorusGeometry;
const In = THREE.Euler;
const Jr = THREE.CatmullRomCurve3;
const Kr = THREE.TubeGeometry;
const Lt = THREE.Quaternion;
const Qe = THREE.Mesh;
const Ve = THREE.Color;
const W = THREE.Vector3;
const Xs = THREE.ShapeUtils;
const Ye = THREE.Matrix4;
const Ys = THREE.CylinderGeometry;
const ar = THREE.LatheGeometry;
const bs = THREE.MathUtils;
const et = THREE.BufferAttribute;
const ls = THREE.SphereGeometry;
const nt = THREE.BufferGeometry;
const rn = THREE.PlaneGeometry;
const un = THREE.BoxGeometry;
const wt = THREE.Group;

function il(i=1337){let e=i>>>0,t=()=>{e|=0,e=e+1831565813|0;let n=Math.imul(e^e>>>15,1|e);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296};return t.range=(n,s)=>n+(s-n)*t(),t.int=(n,s)=>Math.floor(n+(s-n+1)*t()),t.pick=n=>n[Math.floor(t()*n.length)],t.sign=()=>t()<.5?-1:1,t.fork=()=>il(Math.floor(t()*4294967296)),t}
function sa(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),o={},r={},a=i[0].morphTargetsRelative,l=new nt,c=0;for(let u=0;u<i.length;++u){let h=i[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in h.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(h.attributes[p]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in h.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;r[p]===void 0&&(r[p]=[]),r[p].push(h.morphAttributes[p])}if(e){let p;if(t)p=h.index.count;else if(h.attributes.position!==void 0)p=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,u),c+=p}}if(t){let u=0,h=[];for(let f=0;f<i.length;++f){let p=i[f].index;for(let d=0;d<p.count;++d)h.push(p.getX(d)+u);u+=i[f].attributes.position.count}l.setIndex(h)}for(let u in o){let h=Ly(o[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in r){let h=r[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let p=[];for(let v=0;v<r[u].length;++v)p.push(r[u][v][f]);let d=Ly(p);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(d)}}return l}
function Ly(i){let e,t,n,s=-1,o=0;for(let c=0;c<i.length;++c){let u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;o+=u.count*t}let r=new e(o),a=new et(r,t,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let f=0,p=u.count;f<p;f++)for(let d=0;d<t;d++){let v=u.getComponent(f,d);a.setComponent(f+h,d,v)}}else r.set(u.array,l);l+=u.count*t}return s!==void 0&&(a.gpuType=s),a}
function $e(i,e,t,n="center"){let s=new un(i,e,t),o=s.attributes.uv,r=s.attributes.position,a=s.attributes.normal;for(let l=0;l<o.count;l++){let c=Math.abs(a.getX(l)),u=Math.abs(a.getY(l)),h=r.getX(l),f=r.getY(l),p=r.getZ(l);c>.5?o.setXY(l,p,f):u>.5?o.setXY(l,h,p):o.setXY(l,h,f)}return n==="bottom"&&s.translate(0,e/2,0),s}
function ot(i,e,t,n=16,s=!1,o="center"){let r=new Ys(i,e,t,n,1,s),a=r.attributes.uv,l=r.attributes.position,c=r.attributes.normal,u=Math.PI*(i+e);for(let h=0;h<a.count;h++)Math.abs(c.getY(h))>.9?a.setXY(h,l.getX(h),l.getZ(h)):a.setXY(h,a.getX(h)*u,l.getY(h));return o==="bottom"&&r.translate(0,t/2,0),r}
function Fn(i,e=.03,t=8,n=!1,s=0){let o=i.map(h=>h.isVector3?h:new W(h[0],h[1],h[2])),r=new Jr(o,n,"catmullrom",s),a=r.getLength(),l=Math.max(2,Math.ceil(a/Math.max(.08,e*3))),c=new Kr(r,Math.min(l,400),e,t,n),u=c.attributes.uv;for(let h=0;h<u.count;h++)u.setXY(h,u.getX(h)*a,u.getY(h)*Math.PI*2*e);return c}
var ky=new Ye,Fy=new Lt,Uy=new In,Ny=new W,Fg=new W;
function Dc(i,{p:e=[0,0,0],r:t=[0,0,0],s:n=1}={}){return Uy.set(t[0],t[1],t[2]),Fy.setFromEuler(Uy),Ny.set(e[0],e[1],e[2]),typeof n=="number"?Fg.set(n,n,n):Fg.set(n[0],n[1],n[2]),ky.compose(Ny,Fy,Fg),i.applyMatrix4(ky),i}
function Lc(i,e){let t=i.attributes.position,n=t.count,s=new Float32Array(n*3);for(let o=0;o<n;o++){let r=typeof e=="function"?e(t.getX(o),t.getY(o),t.getZ(o)):e;s[o*3]=r[0],s[o*3+1]=r[1],s[o*3+2]=r[2]}return i.setAttribute("color",new et(s,3)),i}
function Ii(i){let e=i.filter(Boolean).map(l=>(l.attributes.uv||l.setAttribute("uv",new et(new Float32Array(l.attributes.position.count*2),2)),l.attributes.normal||l.computeVertexNormals(),l));if(!e.length)return new nt;let t=e.some(l=>l.attributes.color),n=e.map(l=>{let c=(l.index,l);if(t&&!c.attributes.color){let u=new Float32Array(c.attributes.position.count*3).fill(1);c.setAttribute("color",new et(u,3))}for(let u of Object.keys(c.attributes))["position","normal","uv","color"].includes(u)||c.deleteAttribute(u);return c}),s=n.every(l=>l.index),o=n.every(l=>!l.index),r=s||o?n:n.map(l=>l.index?l.toNonIndexed():l);return sa(r,!1)||new nt}
function Qi(i,e,{cast:t=!0,recv:n=!0}={}){let s=new Qe(i,e);return s.castShadow=t,s.receiveShadow=n,s}
var Gi={container20:[6.06,2.59,2.44,"paint_red","metal"],container40:[12.19,2.59,2.44,"paint_blue","metal"],container40hc:[12.19,2.9,2.44,"paint_green","metal"],jersey_barrier:[3,.81,.6,"concrete","concrete"],light_mast:[.5,14,.5,"steel_galv","metal"],fence_panel:[3,2.4,.08,"chainlink","metal"],guard_booth:[2.6,2.7,2.2,"paint_white","metal"],gate_arm:[5,1.1,.3,"hazard_stripes","metal"],bollard_mooring:[.7,.6,.7,"steel_dark","metal"],bollard_post:[.17,1,.17,"paint_yellow","metal"],relay_node:[1.2,2.4,.8,"paint_grey","metal"],shelf_rack:[2.7,4.2,1.1,"paint_orange","metal"],stairs_metal:[3,2.6,1,"diamond_plate","metal"],catwalk:[3,1.1,1.2,"diamond_plate","metal"],reefer_unit:[.5,2.3,2.3,"paint_white","metal"],barrel:[.6,.9,.6,"paint_blue","metal"],pallet:[1.2,.144,1,"wood_pallet","wood"],pallet_stack:[1.2,1.15,1,"wood_pallet","wood"],crate_wood:[1.1,1,.9,"wood_pallet","wood"],crate_stack:[1.2,1.9,1,"wood_pallet","wood"],ibc_tote:[1.2,1.16,1,"plastic_grey","metal"],forklift:[3.4,2.2,1.25,"paint_yellow","metal"],cable_reel:[1.3,1.3,.8,"wood_dark","wood"],tire_stack:[.8,1,.8,"tire","rubber"],dumpster:[1.9,1.35,1.1,"paint_green","metal"],generator:[2.2,1.4,1,"paint_yellow","metal"],jerry_can:[.35,.47,.17,"paint_green","metal"],traffic_cone:[.36,.7,.36,"plastic_red","rubber"],gas_cylinders:[.9,1.6,.5,"steel_dark","metal"],tarp_cargo:[2.4,1.5,1.4,"tarp","dirt"],sandbags:[2,.9,.6,"tarp","dirt"],toolbox_cart:[.9,.95,.5,"plastic_red","metal"],floodlight_stand:[1,2.2,1,"paint_yellow","metal"],cardboard_boxes:[1,.8,.8,"cardboard","wood"],pipe_stack:[6,.9,1.2,"steel_rust","metal"],sign_post:[.6,2.4,.08,"paint_white","metal"]},Xg={};
function _i(i,e){Xg[i]=e}
function Yg(i){return{names:()=>Object.keys(Gi),has:e=>!!Gi[e],build(e,t={}){if(Xg[e])try{let o=Xg[e](i,t);if(o)return o.userData.prop=e,o}catch(o){console.error(`[props] builder "${e}" threw`,o)}let n=Gi[e]||[1,1,1,"concrete","concrete"];Gi[e]||console.warn(`[props] unknown prop "${e}"`);let s=new wt;return s.add(Qi($e(n[0],n[1],n[2],"bottom"),i.mats.get(n[3]))),s.userData.colliders=[{min:[-n[0]/2,0,-n[2]/2],max:[n[0]/2,n[1],n[2]/2],surface:n[4]}],s.userData.size=[n[0],n[1],n[2]],s.userData.prop=e,s}}}
function $a(i){let e=(i|0)*2654435761|0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}
function h1(i,e){let t=Math.sin(i*127.1+e*311.7)*43758.5453;return t-Math.floor(t)}
function ri(i,e){let t=Math.floor(i),n=Math.floor(e),s=i-t,o=e-n,r=s*s*(3-2*s),a=o*o*(3-2*o),l=h1(t,n),c=h1(t+1,n),u=h1(t,n+1),h=h1(t+1,n+1);return l+(c-l)*r+(u-l)*a+(l-c-u+h)*r*a}
var RA=i=>Math.max(0,Math.min(1,i)),mn=(i,e,t)=>{let n=RA((t-i)/(e-i));return n*n*(3-2*n)},Ir=(i,e,t)=>[i[0]+(e[0]-i[0])*t,i[1]+(e[1]-i[1])*t,i[2]+(e[2]-i[2])*t];
function p3(i,e,t,n=.01,s="center"){n=Math.max(5e-4,Math.min(n,i/2-1e-4,e/2-1e-4,t/2-1e-4));let o=i/2,r=e/2,a=t/2,l=new Float32Array(72),c=new Float32Array(72),u=new Float32Array(48),h=(x,y,b,m)=>((x>0?1:0)+(y>0?2:0)+(b>0?4:0))*3+m;for(let x of[-1,1])for(let y of[-1,1])for(let b of[-1,1]){let m=[[x*o,y*(r-n),b*(a-n)],[x*(o-n),y*r,b*(a-n)],[x*(o-n),y*(r-n),b*a]],A=[[x,0,0],[0,y,0],[0,0,b]];for(let _=0;_<3;_++){let M=h(x,y,b,_);l.set(m[_],M*3),c.set(A[_],M*3),_===0?(u[M*2]=m[_][2],u[M*2+1]=m[_][1]):_===1?(u[M*2]=m[_][0],u[M*2+1]=m[_][2]):(u[M*2]=m[_][0],u[M*2+1]=m[_][1])}}let f=[],p=(x,y,b)=>{let m=l[x*3],A=l[x*3+1],_=l[x*3+2],M=l[y*3]-m,E=l[y*3+1]-A,w=l[y*3+2]-_,S=l[b*3]-m,z=l[b*3+1]-A,H=l[b*3+2]-_,O=E*H-w*z,q=w*S-M*H,U=M*z-E*S,T=m+(M+S)/3,D=A+(E+z)/3,C=_+(w+H)/3;O*T+q*D+U*C>=0?f.push(x,y,b):f.push(x,b,y)},d=(x,y,b,m)=>{p(x,y,b),p(x,b,m)},v=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let x of[-1,1])d(...v.map(([y,b])=>h(x,y,b,0))),d(...v.map(([y,b])=>h(y,x,b,1))),d(...v.map(([y,b])=>h(y,b,x,2)));for(let x of[-1,1])for(let y of[-1,1])d(h(-1,x,y,1),h(1,x,y,1),h(1,x,y,2),h(-1,x,y,2)),d(h(x,-1,y,0),h(x,1,y,0),h(x,1,y,2),h(x,-1,y,2)),d(h(x,y,-1,0),h(x,y,1,0),h(x,y,1,1),h(x,y,-1,1));for(let x of[-1,1])for(let y of[-1,1])for(let b of[-1,1])p(h(x,y,b,0),h(x,y,b,1),h(x,y,b,2));let g=new nt;return g.setAttribute("position",new et(l,3)),g.setAttribute("normal",new et(c,3)),g.setAttribute("uv",new et(u,2)),g.setIndex(f),s==="bottom"&&g.translate(0,e/2,0),g}
function m3(i,e,t,n,s,o){let r=0;for(let a=t;a<n;a+=9){let l=i[a+3]-i[a],c=i[a+4]-i[a+1],u=i[a+5]-i[a+2],h=i[a+6]-i[a],f=i[a+7]-i[a+1],p=i[a+8]-i[a+2],d=c*p-u*f,v=u*h-l*p,g=l*f-c*h;r+=d*((i[a]+i[a+3]+i[a+6])/3-s[0])+v*((i[a+1]+i[a+4]+i[a+7])/3-s[1])+g*((i[a+2]+i[a+5]+i[a+8])/3-s[2])}if(r<0!=!!o)for(let a=t;a<n;a+=9){for(let c=0;c<3;c++){let u=i[a+3+c];i[a+3+c]=i[a+6+c],i[a+6+c]=u}let l=a/3*2;for(let c=0;c<2;c++){let u=e[l+2+c];e[l+2+c]=e[l+4+c],e[l+4+c]=u}}}
function la(i,e,t,{closed:n=!1,center:s=null,inward:o=!1,caps:r=!1}={}){let a=[],l=[],c=i.length,u=n?c:c-1,h=[0];for(let g=0;g<u;g++){let x=i[g],y=i[(g+1)%c];h.push(h[g]+Math.hypot(y[0]-x[0],y[1]-x[1]))}for(let g=0;g<e.length-1;g++){let x=e[g],y=e[g+1];for(let b=0;b<u;b++){let m=i[b],A=i[(b+1)%c],_=t(m[0],m[1],x,g),M=t(A[0],A[1],x,g),E=t(A[0],A[1],y,g+1),w=t(m[0],m[1],y,g+1);a.push(..._,...M,...E,..._,...E,...w),l.push(h[b],x,h[b+1],x,h[b+1],y,h[b],x,h[b+1],y,h[b],y)}}let f=a.length,p=null,d=()=>{if(s)return s;if(!p){p=[0,0,0];for(let x=0;x<f;x+=3)p[0]+=a[x],p[1]+=a[x+1],p[2]+=a[x+2];let g=3/f;p[0]*=g,p[1]*=g,p[2]*=g}return p};if(m3(a,l,0,f,d(),o),r&&n){let g=0,x=0;for(let y of i)g+=y[0],x+=y[1];g/=c,x/=c;for(let y of[0,e.length-1]){let b=a.length,m=e[y],A=t(g,x,m,y);for(let _=0;_<c;_++){let M=i[_],E=i[(_+1)%c];a.push(...A,...t(M[0],M[1],m,y),...t(E[0],E[1],m,y)),l.push(g,x,M[0],M[1],E[0],E[1])}m3(a,l,b,a.length,d(),o)}}let v=new nt;return v.setAttribute("position",new et(new Float32Array(a),3)),v.setAttribute("uv",new et(new Float32Array(l),2)),v.computeVertexNormals(),v}
function CA(i,e,t,n,s){let o=i%e;o<0&&(o+=e);let r=e-n-2*s;return o<=n?0:o<n+s?-t*(o-n)/s:o<=n+s+r?-t:-t*(1-(o-n-s-r)/s)}
function Uc(i,e,t,n,s,o,r=i){let a=t-s-2*o,l=[0,s,s+o,s+o+a],c=[i],u=Math.floor((i-r)/t)-1,h=Math.ceil((e-r)/t)+1;for(let f=u;f<=h;f++)for(let p of l){let d=r+f*t+p;d>i+1e-4&&d<e-1e-4&&c.push(d)}return c.push(e),c.map(f=>[f,CA(f-r,t,n,s,o)])}
function pr(i,e,t=5){let n=[],s=Math.min(i,e)/2,o=i/2-s,r=e/2-s;for(let u=0;u<4;u++)for(let h=0;h<=t;h++){let f=(u+h/t)*Math.PI/2;n.push([Math.cos(f)*s+(u===0||u===3?o:-o),Math.sin(f)*s+(u<2?r:-r)])}let a=[],l=[];for(let u=0;u<n.length;u++){let h=n[u],f=n[(u+1)%n.length];a.push(0,0,0,h[0],h[1],0,f[0],f[1],0),l.push(.5,.5,h[0]/i+.5,h[1]/e+.5,f[0]/i+.5,f[1]/e+.5)}let c=new nt;return c.setAttribute("position",new et(new Float32Array(a),3)),c.setAttribute("uv",new et(new Float32Array(l),2)),c.computeVertexNormals(),c}
function cn(i,e){return new rn(i,e)}
function Nc(i,e){let t=new rn(i,e),n=t.attributes.uv;for(let s=0;s<n.count;s++)n.setXY(s,n.getX(s)*i,n.getY(s)*e);return t}
function PA(i){let e=i.index?i.toNonIndexed():i;return e.computeVertexNormals(),e}
function mr(i,e=10,t=6,n=Math.PI*2,s=0,o=Math.PI){return new ls(i,e,t,0,n,s,o)}
function g1(i,e=16){return new ar(i.map(t=>new Ae(t[0],t[1])),e)}
var f1=new In,Fc=new Lt,g3=new Ye,d1=new W,p1=new W(1,1,1);
function je(i,e=0,t=0,n=0,s=null){return s?(f1.set(s[0],s[1],s[2]),Fc.setFromEuler(f1)):Fc.identity(),d1.set(e,t,n),g3.compose(d1,Fc,p1),i.applyMatrix4(g3),i}
function _o(i=0,e=0,t=0,n=null){return n?(f1.set(n[0],n[1],n[2]),Fc.setFromEuler(f1)):Fc.identity(),d1.set(i,e,t),new Ye().compose(d1,Fc,p1)}
var jn=class{constructor(e){this.G=e,this.buckets=new Map,this.stack=[],this.m=null,this.defCol=new Map}M(e,t){return this.G.mats.get(e,t)}push(e){return this.stack.push(this.m),this.m=this.m?this.m.clone().multiply(e):e.clone(),this}pop(){return this.m=this.stack.pop(),this}add(e,t,n,s){this.m&&t.applyMatrix4(this.m);let o=n||this.defCol.get(e);o&&Lc(t,o);let r=this.buckets.get(e);return r||(r={mat:e,geos:[],cast:!s},this.buckets.set(e,r)),r.geos.push(t),t}box(e,t,n,s,o,r,a,l={}){return this.add(e,je(l.r===0?$e(t,n,s):p3(t,n,s,l.r||Math.min(.012,Math.min(t,n,s)*.25)),o,r,a,l.rot),l.col)}cyl(e,t,n,s,o,r,a,l={}){let c=ot(t,n,s,l.seg||12,!!l.open);return l.flat&&(c=PA(c)),this.add(e,je(c,o,r,a,l.rot),l.col)}tube(e,t,n,s={}){return this.add(e,Fn(t,n,s.seg||6,!1,s.tension===void 0?.5:s.tension),s.col)}bar(e,t,n,s,o={}){let r=new W(n[0]-t[0],n[1]-t[1],n[2]-t[2]),a=r.length(),l=ot(o.r2===void 0?s:o.r2,s,a,o.seg||6,!o.caps),c=new Lt().setFromUnitVectors(new W(0,1,0),r.normalize());return l.applyMatrix4(new Ye().compose(new W((t[0]+n[0])/2,(t[1]+n[1])/2,(t[2]+n[2])/2),c,p1)),this.add(e,l,o.col)}beam(e,t,n,s,o,r={}){let a=new W(n[0]-t[0],n[1]-t[1],n[2]-t[2]),l=a.length(),c=r.r===0?$e(s,l,o):p3(s,l,o,r.r||Math.min(s,o)*.2),u=new Lt().setFromUnitVectors(new W(0,1,0),a.normalize());return r.twist&&u.multiply(new Lt().setFromAxisAngle(new W(0,1,0),r.twist)),c.applyMatrix4(new Ye().compose(new W((t[0]+n[0])/2,(t[1]+n[1])/2,(t[2]+n[2])/2),u,p1)),this.add(e,c,r.col)}decal(e,t,n,s,o,r,a){return this.add(e.material,je(cn(a||t*e.aspect,t),n,s,o,r),null,!0)}parts(){let e=[];for(let t of this.buckets.values())e.push({mat:t.mat,geo:Ii(t.geos),cast:t.cast});return e}group(e){return Zg(this.parts(),e)}};
function Zg(i,e){let t=new wt;for(let n of i){let s=new Qe(n.geo,e&&e.get(n.mat)||n.mat);s.castShadow=n.cast,s.receiveShadow=!0,t.add(s)}return t}
function qi(i,e,t,n){return i.userData.size=t,i.userData.colliders=n,i.name=e,i}
var m1=new WeakMap;
function Mi(i,e,t){let n=m1.get(i.mats);n||(n=new Map,m1.set(i.mats,n));let s="L|"+e+"|"+JSON.stringify(t||{});if(!n.has(s)){let o;try{o=i.mats.label(e,t||{})}catch{o=null}n.set(s,o&&o.material?o:{material:i.mats.get("paint_white"),aspect:Math.max(1,e.length*.6)})}return n.get(s)}
function Jn(i,e){let t=m1.get(i.mats);t||(t=new Map,m1.set(i.mats,t));let n="D|"+e;if(!t.has(n)){let s;try{s=i.mats.decal(e)}catch{s=null}t.set(n,s&&s.material?s:{material:i.mats.get("paint_white"),aspect:1})}return t.get(n)}
var Bc=2.438,_3={container20:{type:"22G1",gross:"30,480",tare:"2,230",net:"28,250",cu:"33.2",def:"red"},container40:{type:"42G1",gross:"32,500",tare:"3,750",net:"28,750",cu:"67.7",def:"blue"},container40hc:{type:"45G1",gross:"32,500",tare:"3,940",net:"28,560",cu:"76.3",def:"green"}},v1=["SLTU 482915 7","HBMU 307144 2","NRDU 665201 9","OKTU 119873 4","VSLU 850362 1","TQLU 274590 6"],v3=["logo_a","logo_b","logo_c","logo_d"],jg=["red","blue","green","yellow","orange","white","grey","teal"],Jt={body:!0},IA=6,x3=new Map,y3=.178,bf=.118,b3=.162,Uo={P:.278,d:.036,fo:.072,sl:.068},x1={P:.209,d:.02,fo:.09,sl:.03},y1={P:.25,d:.042,fo:.07,sl:.06};
function zA(i,e,t,n,s){let o=Gi[e][0],r=Gi[e][1],a=_3[e],l=$a(1e3+t*77+e.length*13),c=new jn(i),u=c.M("steel_galv"),h=c.M("wood_pallet"),f=Bc/2,p=o/2,d=f-.012,v=-p+.085,g=p-.135,x=.167,y=r-.06,b=[],m=Math.round((1+l()*2.4)*(.4+s)),A=[[-p*.75,-p*.05],[p-2.2,p]];for(let $=0;$<m;$++){let ue=l()<.5?1:-1,me=0,ee=0;do me=(l()*2-1)*(p-.9),ee++;while(ee<8&&A.some(B=>me>B[0]-.4&&me<B[1]+.4&&l()<.9));b.push({side:ue,x:ue*me,y:.45+l()*1.3,r:.22+l()*.3,depth:.025+l()*.04})}let _=[],M=Math.round(o/2.2*(.5+s)*(.6+l()));for(let $=0;$<M*2;$++)_.push({side:$%2?1:-1,x:(l()*2-1)*(p-.3),w:.05+l()*.12,k:.4+l()*.6});let E=[.5,.44,.38],w=[.62,.38,.24],S=t*9.7,z=($,ue,me)=>{let ee=1+(ri($*.9+S,ue*1.7+me*.4)-.5)*.16*(.5+s);ee*=.94+.06*ri($*6.1+me*3.3,ue*5+S);let B=[ee,ee,ee],P=mn(.62,.02,ue)*(.45+.5*s)*(.75+.5*ri($*2.3+me,S));return B=Ir(B,[E[0]*ee,E[1]*ee,E[2]*ee],Math.min(1,P)),B};c.defCol.set(Jt,z);let H=($,ue,me)=>{let ee=0;for(let B of b)if(B.side===me){let P=Math.hypot($-B.x,(ue-B.y)*.9)/B.r;if(P<1){let V=1-P*P;ee+=B.depth*V*V}}return ee},O=[.035,.035,.04];for(let $ of[-1,1])for(let ue of[0,1])for(let me of[-1,1]){let ee=$*(p-y3/2),B=ue?r-bf/2:bf/2,P=me*(f-b3/2);c.box(Jt,y3,bf,b3,ee,B,P,{r:.012}),c.add(Jt,je(pr(.078,.052,3),ee,B,me*(f+.0012),[0,me>0?0:Math.PI,0]),O),c.add(Jt,je(pr(.064,.05,3),$*(p+.0012),B,P,[0,$*Math.PI/2,0]),O),ue&&c.add(Jt,je(pr(.124,.064,3),ee,r+.0012,P,[-Math.PI/2,0,0]),O)}for(let $ of[-1,1])c.box(Jt,.085,r-2*bf+.01,.15,-p+.0465,r/2,$*(f-.079),{r:.014}),c.box(Jt,.14,r-2*bf+.01,.056,p-.074,r/2,$*(f-.032),{r:.012}),c.box(Jt,o-.2,.062,.062,-.02,r-.031,$*(f-.035),{r:.008}),c.box(Jt,o-.2,.158,.05,-.02,.012+.079,$*(f-.029),{r:.008});if(c.box(Jt,.062,.062,Bc-.2,-p+.035,r-.031,0,{r:.008}),c.box(Jt,.05,.158,Bc-.2,-p+.029,.091,0,{r:.008}),c.box(Jt,.13,.12,Bc-.12,p-.072,r-.06,0,{r:.01}),c.box(Jt,.13,.158,Bc-.12,p-.072,.091,0,{r:.01}),c.box(Jt,.03,.012,Bc-.4,p-.012,r-.125,0,{r:.003,rot:[0,0,-.5]}),e==="container20")for(let $ of[-1,1])for(let ue of[-1.025,1.025]){c.add(Jt,je(cn(.36,.112),ue,.075,$*(f-.0035),[0,$>0?0:Math.PI,0]),O),c.box(Jt,.46,.018,.012,ue,.142,$*(f-.002),{r:.003});for(let me of[-1,1])c.box(Jt,.018,.13,.01,ue+me*.19,.078,$*(f-.003),{r:.003})}let q=[x,.44,1.25,r-.5,y],U=Uc(v,g,Uo.P,Uo.d,Uo.fo,Uo.sl,v+.02);for(let $ of[-1,1]){let ue=la(U,q,(B,P,V)=>[B,V,$*(d+P-H(B,V,$))],{center:[0,r/2,0]});ue.computeVertexNormals();let me=ue.attributes.position,ee=new Float32Array(me.count*3);for(let B=0;B<me.count;B++){let P=me.getX(B),V=me.getY(B),Y=me.getZ(B),L=z(P,V,Y),Z=d-Math.abs(Y),J=mn(.008,.034,Z);L=[L[0]*(1-.17*J),L[1]*(1-.18*J),L[2]*(1-.18*J)];let oe=mn(r-.75,y,V);if(oe>0){for(let le of _)if(le.side===$){let R=Math.abs(P-le.x)/le.w;R<1&&(L=Ir(L,[L[0]*w[0],L[1]*w[1],L[2]*w[2]],oe*oe*le.k*(1-R*R)*(.45+.55*s)))}}let fe=H(P,V,$);fe>.004&&(L=Ir(L,[L[0]*.66,L[1]*.46,L[2]*.36],Math.min(.8,fe*22))),ee[B*3]=L[0],ee[B*3+1]=L[1],ee[B*3+2]=L[2]}ue.setAttribute("color",new et(ee,3)),c.buckets.get(Jt).geos.push(ue)}for(let $ of[-1,1])for(let ue of o>7?[-1,1]:[1]){let me=$*ue*(p-.62),ee=r-.165,B=$*(d-.004);c.box(Jt,.24,.1,.03,me,ee,B,{r:.008});for(let P=-1;P<=1;P++)c.add(Jt,je(cn(.18,.012),me,ee+P*.026,$*(d+.0116),[0,$>0?0:Math.PI,0]),O)}{let $=Uc(-f+.155,f-.155,y1.P,y1.d,y1.fo,y1.sl,-f+.155+.03),ue=la($,[x,1.25,y],(ee,B,P)=>[-(p-.014+B),P,ee],{center:[0,r/2,0]}),me=-(p-.014);c.add(Jt,ue,(ee,B,P)=>{let V=z(ee,B,P),Y=mn(.008,.038,ee-me);return[V[0]*(1-.17*Y),V[1]*(1-.18*Y),V[2]*(1-.18*Y)]})}{let $=Uc(-p+.07,p-.13,x1.P,x1.d,x1.fo,x1.sl,-p+.1),ue=r-.008,me=la($,o>7?[-(f-.066),f-.066]:[-(f-.066),0,f-.066],(ee,B,P)=>[ee,ue+B+(Math.abs(P)<.01?.006:0),P],{center:[0,r/2,0]});c.add(Jt,me,(ee,B,P)=>{let V=.78+.3*ri(ee*.8+S,P*1.1),Y=mn(.004,.018,ue-B);return[V*(1-.25*Y),V*(1-.3*Y)*.97,V*(1-.32*Y)*.94]})}let T=n>.03,D=.172;if(T){let $=(ee,B,P)=>{let Y=(.16+.62*mn(-p,p,ee)*mn(-p,p,ee))*(.8+.2*mn(.2,1.4,B));return[Y,Y,Y]},ue=Uc(v,g,Uo.P,Uo.d,Uo.fo,Uo.sl,v+.02);for(let ee of[-1,1])c.add(Jt,la(ue,[D,y-.02],(B,P,V)=>[B,V,ee*(d+P-.004)],{center:[0,r/2,0],inward:!0}),$);c.add(Jt,je(cn(g-v,2*d),(v+g)/2,y-.03,0,[Math.PI/2,0,0]),$),c.add(Jt,je(cn(2*d,y-D),v+.03,(D+y)/2,0,[0,Math.PI/2,0]),$);let me=Nc(g-v+.1,2*d-.02);c.add(h,je(me,(v+g)/2+.05,D,0,[-Math.PI/2,0,0]),ee=>{let B=.3+.6*mn(-p,p,ee)**2;return[B,B*.97,B*.93]}),c.box(u,.05,.006,2*d-.1,p-.11,D+.001,0,{r:.002})}let C=.175,G=r-.124,j=G-C,N=f-.058-.004,Q=p-.066,K=($,ue,me)=>z($,ue,me),ie=[];for(let $ of[1,-1]){let ue=n*($>0?1:.88)*bs.degToRad($>0?112:100),me=$*(f-.058);c.push(_o(Q,0,me,[0,-$*ue,0]));let ee=k=>-$*k,B=(C+G)/2;c.box(Jt,.034,j,N-.006,0,B,ee(N/2),{r:.008,col:K});let P=e==="container40hc"?7:6,V=C+.085,Y=G-.085,L=(Y-V)/P,Z=.019,J=.031,oe=[];for(let k=0;k<P;k++){let ce=V+k*L;oe.push([ce,Z],[ce+.022,Z],[ce+.05,J],[ce+L-.05,J],[ce+L-.022,Z])}oe.push([Y,Z]),c.add(Jt,la(oe,[.075,N-.085],(k,ce,ve)=>[ce,k,ee(ve)],{center:[-1,B,ee(N/2)]}),(k,ce,ve)=>z(k,ce,ve));let fe=k=>V+(k+.5)*L,le=[.05,.05,.05];c.box(Jt,.022,j+.012,.018,.004,B,ee(N+.001),{r:0,col:le}),c.box(Jt,.022,.016,N,.004,G+.004,ee(N/2),{r:0,col:le}),c.box(Jt,.022,.016,N,.004,C-.004,ee(N/2),{r:0,col:le});let R=e==="container40hc"?5:4;for(let k=0;k<R;k++){let ce=C+.16+k*(j-.32)/(R-1);c.box(Jt,.012,.062,.15,.021,ce,ee(.085),{r:0}),c.cyl(u,.013,.013,.086,.026,ce,ee(-.002),{seg:6,open:!0})}for(let k of[.31,.83]){c.cyl(u,.0155,.0155,j+.2,.052,B,ee(k),{seg:7,open:!0});for(let Te of[-1,1])c.add(u,je($e(.03,.045,.085),.052-.004,B+Te*(j/2+.065),ee(k))),c.box(Jt,.03,.05,.075,.052-.012,B+Te*(j/2-.035),ee(k),{r:0});for(let Te of[C+j*.3,C+j*.72])c.box(Jt,.026,.04,.07,.052-.012,Te,ee(k),{r:0});let ve=1.02+(k>.5?0:.13),_e=k>.5?-1:1;c.box(u,.02,.05,.05,.052+.008,ve,ee(k),{r:0}),c.box(u,.011,.032,.36,.052+.016,ve,ee(k+_e*.19),{r:.004}),c.box(Jt,.03,.07,.05,.052-.008,ve,ee(k+_e*.33),{r:0}),c.box(u,.012,.085,.012,.052+.012,ve+.005,ee(k+_e*.33),{r:0})}let I=.031+.0025,se=[0,Math.PI/2,0],ae=(k,ce,ve,_e,Te)=>{let Pe=ce*k.aspect;Te&&Pe>Te&&(ce*=Te/Pe,Pe=Te),c.add(k.material,je(cn(Pe,ce),I,ve,ee(_e),se),null,!0)};if($<0){ae(Mi(i,v1[t%v1.length],{color:"white",font:"stencil",distress:.3}),.115,fe(P-1),N/2,N-.24),ae(Mi(i,a.type,{color:"white",font:"stencil",distress:.3}),.1,fe(P-2),N/2+.2,.4);let k={color:"white",font:"sans",distress:.2};ae(Mi(i,"最大总重 "+a.gross+" 千克",k),.052,fe(P-3)+.062,N/2-.01,.44),ae(Mi(i,"皮重 "+a.tare+" 千克  净重 "+a.net+" 千克",k),.045,fe(P-3),N/2-.01,.44),ae(Mi(i,"容积 "+a.cu+" 立方米",k),.045,fe(P-3)-.062,N/2-.01,.44)}else ae(Jn(i,v3[t%4]),.2,fe(P-1),N/2,N-.36),ae(Jn(i,"csc_plate"),.17,fe(1),N/2+.05,.36),e==="container40hc"&&ae(Jn(i,"caution_stripes"),.1,G-.04,N/2,N-.1);if(c.pop(),T)for(let k=0;k<3;k++){let ce=N*k/3,ve=N*(k+1)/3,_e=[Q+Math.sin(ue)*ce,me-$*Math.cos(ue)*ce],Te=[Q+Math.sin(ue)*ve,me-$*Math.cos(ue)*ve];ie.push({min:[Math.min(_e[0],Te[0])-.03,C,Math.min(_e[1],Te[1])-.03],max:[Math.max(_e[0],Te[0])+.03,G,Math.max(_e[1],Te[1])+.03],surface:"metal"})}}for(let $ of[1,-1])for(let ue of[.31,.83])for(let me of[-1,1]){let ee=$*(f-.058)-$*ue;c.add(Jt,je($e(.035,.05,.11),p-.03,me>0?r-.07:.115,ee))}let F=($,ue,me,ee,B,P)=>{let V=B*$.aspect;P&&V>P&&(B*=P/V,V=P);let Y=me-V/2,L=me+V/2,Z=ue>0?Y:-L,J=ue>0?L:-Y,oe=Uc(Math.max(v,Z),Math.min(g,J),Uo.P,Uo.d,Uo.fo,Uo.sl,v+.02),fe=ee-B/2,le=ee+B/2,R=la(oe,[fe,le],(ae,k,ce)=>[ae,ce,ue*(d+k+.003-H(ae,ce,ue))],{center:[0,r/2,0]}),I=R.attributes.position,se=R.attributes.uv;for(let ae=0;ae<I.count;ae++){let k=(I.getX(ae)-Z)/(J-Z);se.setXY(ae,ue>0?k:1-k,(I.getY(ae)-fe)/B)}return c.add($.material,R,null,!0),V},X=Mi(i,v1[t%v1.length],{color:"white",font:"stencil",distress:.3}),ne=Mi(i,a.type,{color:"white",font:"stencil",distress:.3}),re=Jn(i,v3[t%4]);for(let $ of[-1,1]){let ue=Math.min(r*.4,1.05),me=Math.min(ue*re.aspect,e==="container20"?2.2:3.4);F(re,$,e==="container20"?-.75:-p*.42,r*.52,me/re.aspect,me);let ee=Math.min(.14*X.aspect,1.9);F(X,$,p-.3-ee/2,r-.32,.14,1.9);let B=Math.min(.11*ne.aspect,.6);F(ne,$,p-.3-B/2,r-.52,.11,.6);let P=Math.round((1+l()*2)*(.4+s)*(o>7?1.6:1));for(let V=0;V<P;V++){let Y=Jn(i,l()<.6?"rust_run":"grime_streak"),L=.5+l()*.7,Z=Math.min(.5,Math.max(.16,L*Y.aspect));F({material:Y.material,aspect:Z/L},$,(l()*2-1)*(p-.6),y-L/2-.005,L)}}return T?ie.push({min:[-p,0,-f],max:[p,D,f],surface:"wood"},{min:[-p,r-.09,-f],max:[p,r,f],surface:"metal"},{min:[-p,0,-f],max:[p,r,-f+.07],surface:"metal"},{min:[-p,0,f-.07],max:[p,r,f],surface:"metal"},{min:[-p,0,-f],max:[-p+.07,r,f],surface:"metal"}):ie.push({min:[-p,0,-f],max:[p,r,f],surface:"metal"}),{parts:c.parts(),colliders:ie}}
function M3(i,e,t={}){let n=_3[e],s=t.seed===void 0?0:Math.abs(Math.floor(t.seed)),o=s%IA,r=Math.round(bs.clamp(t.doors||0,0,1)*10)/10,a=Math.round(bs.clamp(t.wear===void 0?.5:t.wear,0,1)*2)/2,l=e+"|"+o+"|"+r+"|"+a,c=x3.get(i.mats);c||(c=new Map,x3.set(i.mats,c)),c.has(l)||c.set(l,zA(i,e,o,r,a));let u=c.get(l),h=t.color;jg.includes(h)||(h=t.seed===void 0?n.def:jg[(s*7+3)%jg.length]);let f=Zg(u.parts,new Map([[Jt,i.mats.get("paint_"+h,{vertexColors:!0})]])),p=Gi[e];return f.userData.color=h,f.userData.doors=r,qi(f,e,[p[0],p[1],p[2]],u.colliders.map(d=>({min:d.min.slice(),max:d.max.slice(),surface:d.surface})))}
var ca=i=>Gi[i].slice(0,3),hn=Math.PI;
function S3(i,e={}){let t=new jn(i),n=e.seed|0,s=$a(n+11),o=n*3.7,r=t.M("concrete",{vertexColors:!0}),a=[[-.3,0],[.3,0],[.3,.076],[.127,.33],[.1,.57],[.077,.79],[.06,.81],[-.06,.81],[-.077,.79],[-.1,.57],[-.127,.33],[-.3,.076]],l=[-1.5,-1.47];for(let f=-1.25;f<=1.26;f+=.25)l.push(f);l.push(1.47,1.5);let c=[];for(let f=0;f<7;f++)c.push([(s()*2-1)*1.5,s()*.8,.08+s()*.14,s()<.5?1:-1]);let u=la(a,l,(f,p,d)=>{let v=Math.abs(d)>1.49?1:0;return[d,p-v*.022*(p/.81),f*(1-v*.09)]},{closed:!0,caps:!0});t.add(r,u,(f,p,d)=>{let v=.86+.2*ri(f*1.3+o,p*3+d*2)+.08*ri(f*7,p*9+o),g=[v,v*.99,v*.97];g=Ir(g,[v*.5,v*.48,v*.44],mn(.3,0,p)*.8);let x=mn(.55,.8,ri(f*4.5+o,3.3))*mn(.25,.8,p);g=Ir(g,[v*.62,v*.6,v*.56],x*.6);let y=mn(.6,.85,ri(f*2.1+o*2,d*3))*mn(.2,.33,p)*mn(.62,.4,p);g=Ir(g,[.22,.22,.22],y*.65);for(let b of c)if(Math.sign(d||1)===b[3]){let m=Math.hypot(f-b[0],p-b[1])/b[2];m<1&&(g=Ir(g,[1.12,1.1,1.05],(1-m)*.7))}return Math.abs(f)>1.4&&(g=Ir(g,[1.08,1.06,1.02],.4*ri(p*9,d*9+o))),g});let h=[.05,.05,.05];for(let f of[-1,1])for(let p of[-.85,.85])t.add(r,je(cn(.3,.058),p,.03,f*.3008,[0,f>0?0:hn,0]),h),t.box(r,.34,.012,.012,p,.064,f*.3,{r:.003,col:[.7,.7,.68]});for(let f of[-.9,.9])t.tube(t.M("steel_rust"),[[f-.05,.8,0],[f-.04,.85,0],[f+.04,.85,0],[f+.05,.8,0]],.008,{seg:5});if(e.stripe){let f=t.M("hazard_stripes");t.add(f,je(Nc(2.9,.118),0,.8125,0,[-hn/2,0,0]));for(let p of[-1,1])t.add(f,je(Nc(2.9,.2),0,.68,p*.0905,[p>0?-.108:.108,p>0?0:hn,0]))}return qi(t.group(),"jersey_barrier",ca("jersey_barrier"),[{min:[-1.5,0,-.3],max:[1.5,.33,.3],surface:"concrete"},{min:[-1.5,.33,-.13],max:[1.5,.81,.13],surface:"concrete"}])}
function w3(i,e,t,n,s,o,r,a,l){i.push(_o(s,o,r,[0,a,0])),i.push(_o(0,0,0,[0,0,l])),i.box(t,.1,.34,.46,.09,0,0,{r:.014}),i.add(n,je(cn(.4,.28),.1415,0,0,[0,hn/2,0]),null,!0),i.box(t,.012,.018,.47,.146,.156,0,{r:0}),i.box(t,.012,.018,.47,.146,-.156,0,{r:0}),i.box(t,.012,.33,.018,.146,0,.222,{r:0}),i.box(t,.012,.33,.018,.146,0,-.222,{r:0}),i.box(t,.09,.008,.48,.17,.175,0,{r:0,rot:[0,0,-.12]});for(let c=-3;c<=3;c++)i.add(t,je($e(.045,.3,.008),.02,0,c*.062));i.pop(),i.box(e,.03,.05,.56,.02,-.02,0,{r:.004});for(let c of[-1,1])i.box(e,.1,.05,.012,.05,-.02,c*.275,{r:0,rot:[0,0,l*.5]});i.pop()}
function T3(i,e={}){let t=new jn(i),n=t.M("steel_galv"),s=t.M("concrete",{vertexColors:!0}),o=t.M("steel_dark"),r=i.mats.emissive(16769981,e.on===!1?.02:8);t.box(s,.8,.32,.8,0,.16,0,{r:.03,col:(x,y,b)=>{let m=.62+.36*mn(0,.3,y)+.1*ri(x*5,b*5);return[m,m,m*.97]}}),t.box(n,.5,.03,.5,0,.335,0,{r:.006});for(let x=0;x<8;x++){let y=(x+.5)*hn/4,b=Math.cos(y)*.215,m=Math.sin(y)*.215;t.cyl(n,.014,.014,.1,b,.38,m,{seg:6}),t.cyl(n,.027,.027,.024,b,.362,m,{seg:6,flat:!0})}let a=.35,l=13.3,c=.168,u=.07,h=x=>c+(u-c)*(x-a)/(l-a),f=[[a,4.75,0],[4.6,9.15,.007],[9,l,.014]];for(let[x,y,b]of f)t.cyl(n,h(y)+b,h(x)+b,y-x,0,(x+y)/2,0,{seg:8,flat:!0,open:!0,rot:[0,hn/8,0]});for(let x=0;x<4;x++){let y=x*hn/2;t.box(n,.012,.2,.12,Math.cos(y)*.2,.45,-Math.sin(y)*.2,{r:0,rot:[0,y+hn/2,0]})}t.cyl(n,.2,.2,.02,0,.36,0,{seg:8,rot:[0,hn/8,0]}),t.cyl(n,.09,.09,.03,0,l,0,{seg:8,rot:[0,hn/8,0]});let p=h(1.05)*.924;t.box(n,.13,.52,.012,0,1.05,p+.005,{r:.004}),t.box(o,.03,.045,.012,.04,1.05,p+.013,{r:.003}),t.decal(Jn(i,"hazard_voltage"),.09,-.01,1.2,p+.0125,null),t.tube(o,[[-.3,.3,.28],[-.3,.52,.28],[-.24,.72,.2],[-.1,.8,.1]],.024,{seg:6}),t.cyl(o,.034,.034,.03,-.3,.335,.28,{seg:8}),t.bar(n,[.1,3,-.13],[.42,3,-.13],.012),t.bar(n,[.1,3,.13],[.42,3,.13],.012),t.bar(n,[.42,3,-.16],[.42,3,.16],.012,{caps:!0}),t.bar(n,[.42,3,-.13],[.42,3.09,-.13],.012,{caps:!0}),t.bar(n,[.42,3,.13],[.42,3.09,.13],.012,{caps:!0}),t.cyl(n,h(3)+.012,h(3)+.012,.05,0,3,0,{seg:8,rot:[0,hn/8,0]});let d=0;for(let x=3.45;x<12.9;x+=.38,d++){let y=d%2?1:-1;t.bar(n,[0,x,y*h(x)*.8],[0,x,y*(h(x)+.15)],.009,{seg:5,caps:!0})}let v=l+.12;t.box(n,.1,.1,1.9,0,v,0,{r:.012}),t.box(n,.5,.07,.07,0,v+.085,.55,{r:.01}),t.box(n,.5,.07,.07,0,v+.085,-.55,{r:.01}),t.beam(n,[0,l-.5,.08],[0,v-.03,.7],.04,.04),t.beam(n,[0,l-.5,-.08],[0,v-.03,-.7],.04,.04);for(let x of[-.55,.55])w3(t,n,o,r,.22,v-.14,x,0,-.62),w3(t,n,o,r,-.22,v-.14,x,hn,-.62);t.box(o,.16,.2,.12,0,l-.25,-.14,{r:.01}),t.bar(n,[0,v,0],[0,14,0],.012,{r2:.003,seg:5,caps:!0});let g=t.group();g.userData.lamps=[];for(let x of[-.55,.55])for(let y of[-1,1])g.userData.lamps.push({pos:[y*.34,v-.22,x],dir:[y*.81,-.58,0],color:16769981});return qi(g,"light_mast",ca("light_mast"),[{min:[-.4,0,-.4],max:[.4,.32,.4],surface:"concrete"},{min:[-.17,.32,-.17],max:[.17,14,.17],surface:"metal"}])}
function A3(i,e={}){let t=new jn(i),n=$a((e.seed|0)+5),s=t.M("steel_galv"),o=t.M("concrete",{vertexColors:!0}),r=t.M("chainlink",{doubleSide:!0}),a=e.posts||"both",l=e.lean===1?1:-1,c=a==="both"?[-1.5,1.5]:a==="left"?[-1.5]:a==="right"?[1.5]:[];for(let p of c){t.box(o,.32,.09,.32,p,.035,0,{r:.02,col:(d,v)=>{let g=.6+.4*mn(0,.08,v);return[g,g,g]}}),t.cyl(s,.03,.03,2.02,p,1.05,0,{seg:8,open:!0}),t.cyl(s,.05,.05,.012,p,.086,0,{seg:8}),t.bar(s,[p,2.02,0],[p,2.4-.02,l*.36],.019,{seg:6,caps:!0}),t.cyl(s,.034,.034,.05,p,2.03,0,{seg:8});for(let d of[.2,1.05,1.9])t.cyl(s,.034,.034,.03,p,d,0,{seg:8,open:!0})}t.bar(s,[-1.5,2,.036],[1.5,2,.036],.021,{seg:7});for(let p of[.09,1.02])t.bar(s,[-1.5,p,.012],[1.5,p,.012],.0035,{seg:4});t.box(s,.008,1.9,.02,-1.462,1.03,.012,{r:0}),t.box(s,.008,1.9,.02,1.462,1.03,.012,{r:0});let u=new rn(2.92,1.93,6,3),h=u.attributes.position,f=u.attributes.uv;for(let p=0;p<h.count;p++){let d=h.getX(p),v=h.getY(p);f.setXY(p,d+1.5,v+1),h.setZ(p,.012+.02*(ri(d*1.3+(e.seed|0),v*1.5)-.5)*(1-Math.abs(d)/1.46))}u.computeVertexNormals(),t.add(r,je(u,0,1.025,0));for(let p=0;p<3;p++){let d=.3+p*.33,v=2.02+d*.36,g=l*d*.36;t.bar(s,[-1.5,v,g],[1.5,v,g],.0032,{seg:4});for(let x=-1.42+p%2*.09;x<1.45;x+=.18)t.add(s,je($e(.004,.032,.004),x,v,g,[n()*3,0,.8+n()]))}for(let p=0;p<5;p++)t.add(s,je($e(.012,.012,.03),-1.2+p*.6,2,.02));return qi(t.group(),"fence_panel",ca("fence_panel"),[{min:[-1.5,0,-.04],max:[1.5,2.4,.04],surface:"metal"}])}
function R3(i,e={}){let t=new jn(i),n=e.seed|0,s=n*1.3,o=2.6,r=2.2,a=o/2,l=r/2,c=t.M("paint_"+(["white","grey","teal"].includes(e.color)?e.color:"white"),{vertexColors:!0}),u=t.M("steel_dark"),h=t.M("steel_galv"),f=t.M("glass",{doubleSide:!0}),p=t.M("wood_dark"),d=t.M("polymer_black"),v=(H,O,q)=>{let U=(.9+.14*ri(H*2+s,O*2+q))*(.6+.4*mn(.1,.7,O))*(1-.25*mn(2.25,2.45,O));return[U,U*.985,U*.96]};t.defCol.set(c,v);let g=.12,x=1,y=2.08,b=2.42;t.box(u,o,.12,r,0,.06,0,{r:.015});for(let H of[-.7,.7])t.box(u,o+.06,.06,.1,0,.03,H,{r:.01});for(let H of[-1,1])for(let O of[-1,1])t.box(c,.09,b-g,.09,H*(a-.045),(b+g)/2,O*(l-.045),{r:.012});let m=.3,A=1.12,_=(H,O)=>{let q=O>0?[[-a+.09,m-.04]]:[[-a+.09,a-.09]];for(let[U,T]of q){t.box(c,T-U,x-g,.05,(U+T)/2,(x+g)/2,H,{r:.006}),t.box(c,T-U,.05,.075,(U+T)/2,x+.01,H+O*.005,{r:.008}),t.box(f,T-U,y-x-.03,.008,(U+T)/2,(x+y)/2+.01,H,{r:0});let D=T-U>1.6?2:1;for(let C=1;C<=D;C++)t.box(c,.04,y-x,.05,U+(T-U)*C/(D+1),(x+y)/2,H,{r:.006});for(let C=1;C<3;C++)t.box(c,.006,x-g-.04,.056,U+(T-U)*C/3,(x+g)/2,H,{r:0})}t.box(c,o-.18,b-y,.05,0,(b+y)/2,H,{r:.006})};_(l-.03,1),_(-l+.03,-1);for(let H of[-1,1]){let O=H*(a-.03);t.box(c,.05,x-g,r-.18,O,(x+g)/2,0,{r:.006}),t.box(c,.075,.05,r-.18,O+H*.005,x+.01,0,{r:.008}),t.box(f,.008,y-x-.03,r-.18,O,(x+y)/2+.01,0,{r:0}),t.box(c,.05,y-x,.04,O,(x+y)/2,0,{r:.006}),t.box(c,.05,b-y,r-.18,O,(b+y)/2,0,{r:.006})}let M=l-.03;t.box(c,.05,y-g,.07,m-.015,(y+g)/2,M,{r:.006}),t.box(c,.05,y-g,.07,A+.015,(y+g)/2,M,{r:.006}),t.box(c,a-.09-A-.04,y-g,.05,(a-.09+A+.04)/2,(y+g)/2,M,{r:.006});let E=A-m-.02,w=(m+A)/2;t.box(c,E,x-g-.01,.04,w,(x+g)/2,M+.005,{r:.006}),t.box(c,E,.07,.04,w,y-.04,M+.005,{r:.006});for(let H of[-1,1])t.box(c,.07,y-x,.04,w+H*(E/2-.035),(x+y)/2,M+.005,{r:.006});t.box(f,E-.12,y-x-.08,.008,w,(x+y)/2-.02,M+.005,{r:0}),t.box(h,E-.06,.22,.004,w,g+.14,M+.027,{r:0}),t.box(h,.03,.14,.02,m+.09,1.05,M+.035,{r:.004}),t.bar(h,[m+.09,1,M+.06],[m+.2,1,M+.06],.009,{caps:!0});for(let H of[.4,1.75])t.cyl(h,.012,.012,.1,A+.002,H,M+.03,{seg:6});t.box(u,.9,.03,.3,w,.105,l+.15,{r:.006}),t.box(c,o+.36,.1,r+.4,0,b+.05,0,{r:.02,col:(H,O,q)=>{let U=.72+.2*ri(H*1.5,q*1.5+s);return[U,U,U*.97]}}),t.box(u,o+.3,.03,r+.34,0,b+.112,0,{r:.01});for(let H of[-1,1])t.box(h,o+.36,.06,.08,0,b-.005,H*(l+.2+.03),{r:.012});t.tube(h,[[-a-.16,b-.03,l+.23],[-a-.1,b-.2,l+.1],[-a-.03,b-.4,l+.03],[-a-.03,.2,l+.03],[-a-.1,.06,l+.1]],.03,{seg:6,tension:.2});let S=-a-.17;t.box(c,.3,.52,.78,S,.62,-.25,{r:.02}),t.add(c,je(pr(.44,.44,6),S-.151,.62,-.14,[0,-hn/2,0]),[.06,.06,.06]);for(let H=-3;H<=3;H++)t.add(u,je($e(.006,.008,Math.sqrt(.22*.22-(H*.06)**2)*2),S-.154,.62+H*.06,-.14));t.cyl(u,.05,.05,.012,S-.156,.62,-.14,{seg:8,rot:[0,0,hn/2]});for(let H of[-.55,.05])t.beam(u,[-a,.32,H],[S-.1,.34,H],.03,.03,{r:0});t.tube(t.M("rubber"),[[S+.05,.86,.14],[S+.06,1,.2],[-a-.02,1.25,.24],[-a-.02,2.2,.24]],.014,{seg:5}),t.add(t.M("floor_epoxy"),je(Nc(o-.1,r-.1),0,.122,0,[-hn/2,0,0])),t.box(p,.6,.04,r-.3,-a+.4,.76,0,{r:.008});for(let H of[-.85,.85])t.box(u,.5,.64,.03,-a+.4,.44,H,{r:.005});t.box(d,.05,.32,.5,-a+.3,1.02,-.3,{r:.01,rot:[0,.25,0]}),t.add(i.mats.emissive(9418984,1.6),je(cn(.45,.27),-a+.3+.027,1.02,-.3-.007,[0,hn/2+.25,0]),null,!0),t.box(d,.05,.1,.06,-a+.28,.83,-.3,{r:.008}),t.box(d,.18,.015,.22,-a+.28,.787,-.3,{r:.004}),t.box(d,.14,.02,.42,-a+.52,.79,-.25,{r:.004}),t.box(d,.46,.07,.46,-a+1,.5,-.2,{r:.02,rot:[0,.3,0]}),t.box(d,.07,.55,.42,-a+1.22,.86,-.13,{r:.02,rot:[0,.3,-.12]}),t.cyl(u,.025,.025,.36,-a+1,.3,-.2,{seg:6});for(let H=0;H<5;H++){let O=H*hn*.4;t.beam(u,[-a+1,.16,-.2],[-a+1+Math.cos(O)*.26,.14,-.2+Math.sin(O)*.26],.03,.025,{r:0})}t.box(u,.2,.07,.1,w,y+.19,l+.03,{r:.012}),t.add(i.mats.emissive(16767398,e.on===!1?.02:5),je(cn(.17,.05),w,y+.152,l+.035,[hn/2,0,0]),null,!0),t.decal(Mi(i,"门禁控制",{color:"black",font:"stencil",distress:.2}),.1,-.45,(b+y)/2,l-.003,null,.9),t.decal(Jn(i,"berth4"),.34,a-.003,.56,.3,[0,hn/2,0]),t.decal(Jn(i,"no_entry"),.2,w,.72,M+.0265,null),t.decal(Jn(i,"grime_streak"),.7,-.6,.55,l-.003,null,.3),t.decal(Jn(i,"rust_run"),.6,-a+.003-0,.6,.55,[0,-hn/2,0],.25);let z=t.group();return z.userData.lamps=[{pos:[w,y+.14,l+.04],dir:[0,-1,.2],color:16767398}],qi(z,"guard_booth",ca("guard_booth"),[{min:[-a,0,-l],max:[a,2.54,l],surface:"metal"}])}
function C3(i,e={}){let t=new jn(i),n=bs.clamp(e.open||0,0,1),s=t.M("paint_orange",{vertexColors:!0}),o=t.M("paint_white"),r=t.M("paint_red"),a=t.M("steel_dark"),l=t.M("steel_galv"),c=t.M("paint_yellow"),u=-2.5+.19,h=.92;t.box(t.M("concrete"),.5,.06,.46,u,.03,0,{r:.015}),t.box(s,.36,1,.3,u,.56,0,{r:.02,col:(y,b)=>{let m=.6+.4*mn(.05,.5,b);return[m,m,m]}}),t.box(a,.4,.04,.34,u,1.075,0,{r:.012}),t.box(s,.3,.6,.012,u,.5,.151,{r:.004,col:[.9,.9,.9]}),t.cyl(l,.012,.012,.016,u+.1,.5,.16,{seg:6,rot:[hn/2,0,0]}),t.decal(Jn(i,"hazard_general"),.14,u,.9,.153,null),t.decal(Jn(i,"caution_stripes"),.08,u,.12,.153,null,.34),t.cyl(a,.03,.03,.05,u,1.12,0,{seg:8}),t.add(i.mats.emissive(16734750,2.2),je(ot(.026,.026,.045,8),u,1.165,0),null,!0),t.push(_o(u,h,0,[0,0,n*1.48])),t.cyl(a,.075,.075,.36,0,0,0,{seg:10,rot:[hn/2,0,0]});for(let y of[-1,1])t.box(a,.62,.11,.012,.05,0,y*.175,{r:.004});t.box(a,.3,.16,.3,-.33,-.02,0,{r:.02});let f=4.62,p=.12,d=9,v=f/d;for(let y=0;y<d;y++)t.box(y%2?o:r,v+.001,.1-y*.003,.05,p+v*(y+.5),0,0,{r:.008});t.box(a,.03,.11,.06,p+f+.012,0,0,{r:.008}),t.add(i.mats.emissive(16722450,1.5),je($e(.05,.03,.054),p+f-.5,.058,0),null,!0),t.pop();let g=2.5-.1;t.box(t.M("concrete"),.3,.05,.3,g,.025,0,{r:.012}),t.cyl(c,.04,.04,.8,g,.45,0,{seg:8}),t.box(c,.14,.02,.16,g,.855,0,{r:.005});for(let y of[-1,1])t.box(c,.14,.14,.014,g,.93,y*.073,{r:.004});t.cyl(l,.07,.07,.01,g,.055,0,{seg:8});let x=[{min:[u-.2,0,-.17],max:[u+.2,1.1,.17],surface:"metal"},{min:[g-.07,0,-.08],max:[g+.07,1,.08],surface:"metal"}];return n<.5&&x.push({min:[u,h-.07,-.04],max:[g,h+.07,.04],surface:"metal"}),qi(t.group(),"gate_arm",ca("gate_arm"),x)}
function P3(i,e={}){let t=new jn(i),n=(e.seed|0)*2.1,s=t.M("steel_dark",{vertexColors:!0}),o=t.M("steel_rust"),r=(a,l,c)=>{let u=mn(.3,.4,l)*mn(.47,.4,l),h=.75+.4*ri(a*6+n,c*6+l*4)+u*.9;return[h,h*.97,h*.93]};t.defCol.set(s,r),t.cyl(s,.34,.35,.045,0,.0225,0,{seg:20}),t.cyl(o,.37,.37,.006,0,.003,0,{seg:20});for(let a=0;a<6;a++){let l=a*hn/3+.3;t.cyl(o,.026,.026,.03,Math.cos(l)*.285,.058,Math.sin(l)*.285,{seg:6,flat:!0}),t.cyl(o,.013,.013,.022,Math.cos(l)*.285,.08,Math.sin(l)*.285,{seg:6})}t.add(s,g1([[.25,.045],[.21,.08],[.165,.16],[.145,.27],[.15,.36],[.17,.43],[.19,.5],[.17,.57],[.1,.6],[0,.602]],18)),t.cyl(s,.105,.115,.5,0,.485,0,{seg:14,open:!0,rot:[0,0,hn/2]});for(let a of[-1,1]){let l=mr(.108,14,8);l.scale(.55,1,1),t.add(s,je(l,a*.25,.485,0)),t.cyl(s,.125,.125,.03,a*.235,.485,0,{seg:14,rot:[0,0,hn/2]})}return qi(t.group(),"bollard_mooring",ca("bollard_mooring"),[{min:[-.3,0,-.22],max:[.3,.6,.22],surface:"metal"}])}
function I3(i,e={}){let t=new jn(i),n=(e.seed|0)*1.7,s=t.M("paint_yellow",{vertexColors:!0}),o=t.M("steel_galv"),r=.083,a=u=>u>.6&&u<.69||u>.78&&u<.87,l=[.012,.3,.6,.6001,.69,.6901,.78,.7801,.87,.8701,.955];for(let u=0;u<l.length-1;u++){let h=l[u],f=l[u+1];if(f-h<.001)continue;let p=a((h+f)/2);t.cyl(s,r,r,f-h,0,(h+f)/2,0,{seg:14,open:!0,col:(d,v,g)=>{if(p)return[.05,.05,.05];let x=(.55+.45*mn(0,.35,v))*(.9+.2*ri(d*30+n,v*6+g*30));return[x,x*.97,x*.9]}})}let c=mr(r,14,5,hn*2,0,hn/2);c.scale(1,.55,1),t.add(s,je(c,0,.955,0),[.95,.93,.88]),t.cyl(o,.085,.085,.012,0,.006,0,{seg:4,rot:[0,hn/4,0]}),t.box(o,.17,.012,.17,0,.006,0,{r:.004});for(let u of[-1,1])for(let h of[-1,1])t.cyl(o,.011,.011,.012,u*.066,.017,h*.066,{seg:6});return t.cyl(s,r+.006,r+.006,.02,0,.022,0,{seg:14,open:!0,col:[.5,.48,.42]}),qi(t.group(),"bollard_post",ca("bollard_post"),[{min:[-.085,0,-.085],max:[.085,1,.085],surface:"metal"}])}
var Jg=["hazard_general","no_entry","hazard_voltage","berth4","arrow","hazard_flammable"],E3=["仅限授权人员","禁止行人通行","请穿反光服并佩戴安全帽","自动作业车辆","请勿靠近"];
function z3(i,e={}){let t=new jn(i),n=e.seed|0,s=t.M("steel_galv"),o=t.M("aluminium"),r=t.M("paint_white"),a=t.M("paint_yellow"),l=Jg.includes(e.sign)?e.sign:Jg[n%Jg.length];t.box(t.M("concrete"),.3,.07,.3,0,.03,0,{r:.015}),t.box(s,.05,2.38,.05,0,1.2,0,{r:.006}),t.box(s,.058,.012,.058,0,2.395,0,{r:.004}),t.box(s,.13,.012,.13,0,.07,0,{r:.003});let c=(n%5-2)*.006;t.push(_o(0,0,0,[0,0,c])),t.box(o,.6,.6,.004,0,2.02,.031,{r:.0015}),t.box(l.startsWith("hazard")?a:r,.58,.58,.002,0,2.02,.034,{r:8e-4}),t.decal(Jn(i,l),.5,0,2.02,.0362,null,.5),t.box(o,.6,.22,.004,0,1.56,.031,{r:.0015}),t.box(r,.58,.2,.002,0,1.56,.034,{r:8e-4}),t.decal(Mi(i,e.text||E3[n%E3.length],{color:"black",font:"sans",distress:.15}),.07,0,1.56,.0362,null,.52);for(let u of[1.85,2.2,1.56])t.box(s,.5,.03,.012,0,u,.024,{r:0}),t.box(s,.09,.04,.07,0,u,-.002,{r:.004});for(let[u,h]of[[-.26,2.28],[.26,2.28],[-.26,1.76],[.26,1.76]])t.cyl(s,.008,.008,.004,u,h,.0365,{seg:6,rot:[hn/2,0,0]});return t.pop(),qi(t.group(),"sign_post",ca("sign_post"),[{min:[-.03,0,-.03],max:[.03,2.4,.03],surface:"metal"},{min:[-.3,1.44,.02],max:[.3,2.33,.04],surface:"metal",bulletOnly:!0}])}
function D3(i,e={}){let t=new jn(i),n=e.seed|0,s=$a(n+3),o=t.M("paint_yellow"),r=t.M("steel_dark"),a=t.M("aluminium"),l=t.M("rubber"),c=i.mats.emissive(16773596,e.on===!1?.02:10);t.cyl(a,.021,.021,1.1,0,.75,0,{seg:8,open:!0}),t.cyl(a,.016,.016,.9,0,1.6,0,{seg:8,open:!0}),t.cyl(r,.03,.03,.06,0,1.3,0,{seg:8}),t.bar(r,[.03,1.3,0],[.085,1.3,0],.008,{caps:!0}),t.box(r,.02,.03,.05,.09,1.3,0,{r:.005}),t.cyl(r,.032,.032,.07,0,.82,0,{seg:8}),t.cyl(r,.03,.03,.05,0,.36,0,{seg:8});for(let d=0;d<3;d++){let v=d*hn*2/3+.5,g=Math.cos(v),x=Math.sin(v);t.bar(a,[g*.035,.82,x*.035],[g*.5,.025,x*.5],.013,{seg:6}),t.bar(a,[g*.03,.36,x*.03],[g*.3,.37,x*.3],.008,{seg:5}),t.add(l,je(mr(.028,8,5),g*.5,.02,x*.5))}t.box(r,.05,.04,.72,0,2.03,0,{r:.008});for(let d of[-1,1]){t.push(_o(.03,2.03,d*.2,[0,d*-.12,0])),t.push(_o(0,0,0,[0,0,-.22])),t.box(o,.075,.24,.32,.06,.02,0,{r:.012}),t.add(c,je(cn(.28,.2),.0985,.02,0,[0,hn/2,0]),null,!0),t.box(r,.012,.25,.012,.1,.02,.157,{r:0}),t.box(r,.012,.25,.012,.1,.02,-.157,{r:0}),t.box(r,.012,.012,.33,.1,.143,0,{r:0}),t.box(r,.012,.012,.33,.1,-.103,0,{r:0});for(let v=-3;v<=3;v++)t.add(r,je($e(.035,.2,.006),.008,.02,v*.043));t.tube(o,[[.05,.14,-.1],[.05,.2,-.06],[.05,.2,.06],[.05,.14,.1]],.008,{seg:5}),t.pop(),t.pop()}let u=s()*hn*2,h=Math.cos(u),f=Math.sin(u);t.tube(l,[[0,2,.03],[-.03,1.7,.04],[.035,1.25,.02],[-.03,.9,.03],[.05,.5,.06],[.12,.08,.1],[.25,.012,.16],[.3+h*.3,.012,.2+f*.3],[.2+h*.75-f*.2,.012,.1+f*.75+h*.2],[h*1.2,.012,f*1.2]],.011,{seg:5}),t.box(o,.09,.05,.06,h*1.24,.026,f*1.24,{r:.01,rot:[0,-u,0]});let p=t.group();return p.userData.lamps=[{pos:[.14,2.03,0],dir:[.976,-.218,0],color:16773596}],qi(p,"floodlight_stand",ca("floodlight_stand"),[{min:[-.12,0,-.12],max:[.12,2.2,.12],surface:"metal"}])}
var b1=i=>Gi[i].slice(0,3),wi=Math.PI;
function k3(i,e={}){let t=new jn(i),n=t.M("diamond_plate"),s=t.M("steel_dark"),o=t.M("paint_yellow"),r=t.M("steel_galv"),a=12,l=.2,c=.2,u=-1.5,h=.5,f=u+a*c,p=[];for(let g=0;g<a;g++){let x=(g+1)*l,y=u+g*c;t.box(n,.25,.03,.9,y+.125,x-.015,0,{r:.005}),t.box(o,.035,.034,.9,y+.016,x-.015,0,{r:.006});for(let b of[-1,1])t.box(s,.2,.05,.01,y+.13,x-.05,b*.452,{r:0});p.push({min:[y,0,-h],max:[y+c,x,h],surface:"metal"})}for(let g of[-1,1]){t.beam(s,[u+.07,.13,g*.465],[f+.04,2.5,g*.465],.24,.014,{r:.004}),t.box(r,.3,.012,.12,u+.06,.006,g*.465,{r:0});for(let x of[-.08,.1])t.cyl(r,.012,.012,.02,u+.06+x,.02,g*.5,{seg:6})}let d=(a+1)*l;t.box(n,.64,.035,.96,f+.3,d-.0175,0,{r:.005}),t.box(o,.035,.038,.96,f+.016,d-.0175,0,{r:.006});for(let g of[-1,1])t.box(s,.66,.16,.06,f+.3,d-.115,g*.47,{r:.008});t.box(s,.06,.16,.96,1.47,d-.115,0,{r:.008}),t.box(s,.06,.12,.9,f+.02,d-.1,0,{r:.008});for(let g of[-1,1])t.box(s,.08,d-.19,.08,1.44,(d-.19)/2,g*.45,{r:.008}),t.box(r,.18,.012,.18,1.44,.006,g*.45,{r:0}),t.beam(s,[1.44,1.5,g*.45],[f+.1,d-.2,g*.45],.05,.05,{r:.006});t.beam(s,[1.44,.15,-.42],[1.44,2.2,.42],.045,.008,{r:0}),t.beam(s,[1.44,.15,.42],[1.44,2.2,-.42],.045,.008,{r:0}),t.box(s,.06,.06,.82,1.44,1.2,0,{r:.006}),p.push({min:[f,d-.2,-h],max:[1.5,d,h],surface:"metal"});for(let g of[-1,1])p.push({min:[1.4,0,g*.45-.04],max:[1.48,d-.2,g*.45+.04],surface:"metal"});let v=g=>(g-u)/c*l+l;for(let g of[-1,1]){let x=g*.485,y=[[u+.1,v(u+.1)],[u+.9,v(u+.9)-.1],[u+1.7,v(u+1.7)-.1],[f+.03,d],[1.47,d]];for(let[b,m]of y)t.bar(o,[b,m-.12,x],[b,m+1,x],.019,{seg:7}),t.box(s,.07,.1,.012,b,m-.1,x-g*.012,{r:0});for(let b of[1,.52]){let m=b===1?.021:.016;t.bar(o,[y[0][0],y[0][1]+b,x],[y[3][0],y[3][1]+b,x],m,{seg:7}),t.bar(o,[y[3][0],y[3][1]+b,x],[y[4][0],y[4][1]+b,x],m,{seg:7}),t.add(o,je(mr(m*1.05,7,5),y[3][0],y[3][1]+b,x)),t.add(o,je(mr(m*1.05,7,5),y[0][0],y[0][1]+b,x)),t.add(o,je(mr(m*1.05,7,5),y[4][0],y[4][1]+b,x))}t.box(s,.6,.1,.008,f+.3,d+.05,g*.476,{r:0}),p.push({min:[f,d,x-.03],max:[1.5,d+1.02,x+.03],surface:"metal"})}return qi(t.group(),"stairs_metal",b1("stairs_metal"),p)}
function F3(i,e={}){let t=new jn(i),n=t.M("steel_dark"),s=t.M("paint_yellow"),o=t.M("steel_galv"),r=e.rails||"both",a=r==="both"?[-1,1]:r==="left"?[-1]:r==="right"?[1]:[],l=.05;for(let u=-.51;u<=.511;u+=.034)t.add(o,je($e(2.98,.03,.004),0,l-.015,u));for(let u=-1.45;u<=1.451;u+=.1)t.add(o,je($e(.006,.006,1.04),u,l-.004,0));for(let u of[-1,1])t.add(o,je($e(2.99,.032,.005),0,l-.016,u*.525)),t.add(o,je($e(.005,.032,1.05),u*1.493,l-.016,0));for(let u of[-1,1])t.box(n,3,.18,.06,0,l-.09,u*.565,{r:.008});for(let u of[-1.45,-.5,.5,1.45])t.box(n,.05,.1,1.08,u,l-.085,0,{r:.006});let c=[{min:[-1.5,l-.08,-.6],max:[1.5,l,.6],surface:"metal"}];for(let u of a){let h=u*.565;t.box(n,3,.1,.008,0,l+.05,u*.535,{r:0});for(let f of[-1.42,0,1.42])t.box(s,.045,1.07,.045,f,l+.52,h,{r:.006}),t.box(n,.09,.012,.09,f,l+.006,h,{r:0});t.bar(s,[-1.5,l+1.05,h],[1.5,l+1.05,h],.021,{seg:7,caps:!0}),t.bar(s,[-1.5,l+.55,h],[1.5,l+.55,h],.016,{seg:6,caps:!0}),c.push({min:[-1.5,l,h-.035],max:[1.5,l+1.05,h+.035],surface:"metal"})}return qi(t.group(),"catwalk",b1("catwalk"),c)}
function L3(i,e,t,n,s){for(let o=-2;o<=2;o++)i.add(e,je($e(.14+(o===0?.02:0),.022,1),t+o*.2525,n+.133,s));for(let o of[-1,0,1])i.add(e,je($e(1.15,.022,.1),t,n+.111,s+o*.45));for(let o of[-1,0,1])for(let r of[-1,0,1])i.add(e,je($e(.14,.078,.1),t+r*.505,n+.061,s+o*.45));for(let o of[-1,0,1])i.add(e,je($e(1.15,.022,.1),t,n+.011,s+o*.45))}
function DA(i,e,t,n,s,o,r){L3(i,e.wood,n,s,o);let a=s+.144;if(t==="cartons"){let l=2+Math.floor(r()*2),c=.36;for(let u=0;u<l;u++)for(let h of[-1,1])for(let f of[-1,1])u===l-1&&r()<.25||(i.box(e.card,.53,c-.006,.46,n+h*.272+(r()-.5)*.02,a+c*(u+.5),o+f*.237+(r()-.5)*.02,{r:.008,rot:[0,(r()-.5)*.05,0]}),i.add(e.tape,je($e(.535,.002,.05),n+h*.272,a+c*(u+1)-.004,o+f*.237)));for(let u of[-.3,.3])i.add(e.poly,je($e(.016,l*c+.004,.002),n+u,a+l*c/2,o+.475)),i.add(e.poly,je($e(.016,l*c+.004,.002),n+u,a+l*c/2,o-.475))}else if(t==="wrapped"){let l=.9+r()*.25;i.box(e.card,1.08,l,.92,n,a+l/2,o,{r:.012}),i.box(e.wrap,1.1,l+.012,.94,n,a+l/2+.002,o,{r:.03});for(let c of[-1,1])for(let u of[-1,1])i.box(e.card,.05,l*.96,.05,n+c*.535,a+l/2,o+u*.455,{r:.004});i.decal(Mi(i.G,"批次 "+(1e3+Math.floor(r()*8999)),{color:"black",font:"sans",distress:.1}),.06,n+.2,a+l*.7,o+.474,null,.3)}else if(t==="drums"){for(let l of[-1,1])for(let c of[-1,1]){let u=n+l*.285,h=o+c*.24,f=r()<.3?e.drum2:e.drum;i.cyl(f,.225,.225,.86,u,a+.43,h,{seg:14,open:!0});for(let p of[.29,.58])i.cyl(f,.233,.233,.022,u,a+p,h,{seg:14,open:!0});i.cyl(f,.232,.232,.02,u,a+.85,h,{seg:14,open:!0}),i.cyl(f,.232,.232,.02,u,a+.01,h,{seg:14,open:!0}),i.add(e.dark,je(pr(.44,.44,4),u,a+.845,h,[-wi/2,0,0])),i.cyl(e.dark,.03,.03,.02,u+.13,a+.855,h,{seg:6})}i.add(e.poly,je($e(1.04,.03,.002),n,a+.6,o+.468)),i.add(e.poly,je($e(1.04,.03,.002),n,a+.6,o-.468))}else if(t==="pallets"){let l=2+Math.floor(r()*4);for(let c=0;c<l;c++)L3(i,e.wood,n+(r()-.5)*.04,a+c*.146,o+(r()-.5)*.04)}}
function U3(i,e={}){let t=new jn(i),n=e.seed|0,s=$a(n+21),o=t.M("paint_blue",{vertexColors:!0}),r=t.M("paint_orange"),a=t.M("steel_galv"),l={wood:t.M("wood_pallet"),card:t.M("cardboard"),tape:t.M("polymer_tan"),poly:t.M("polymer_black"),wrap:t.M("glass_dirty"),drum:t.M("plastic_blue"),drum2:t.M("paint_red"),dark:t.M("steel_dark")},c=4.2,u=1.305,h=.5,f=[.04,.04,.05];for(let v of[-1,1]){for(let x of[-1,1]){t.box(o,.09,c,.07,v*u,c/2,x*h,{r:.008,col:(y,b)=>{let m=.7+.3*mn(0,.5,b);return[m,m,m]}}),t.box(a,.14,.01,.12,v*u,.005,x*h,{r:0});for(let y of[-.05,.05])t.cyl(a,.01,.01,.02,v*u+y,.016,x*h,{seg:6});for(let y=.12;y<c-.05;y+=.1)for(let b of[-.022,.022])t.add(o,je(cn(.014,.034),v*u+b,y,x*(h+.0356),[0,x>0?0:wi,0]),f)}let g=[.2,1.1,2,2.9,3.8];for(let x=0;x<g.length;x++)t.box(o,.03,.03,2*h-.07,v*u,g[x],0,{r:0}),x<g.length-1&&t.beam(o,[v*u,g[x],x%2?h-.04:-h+.04],[v*u,g[x+1],x%2?-h+.04:h-.04],.03,.03,{r:0});t.box(t.M("paint_yellow"),.14,.4,.02,v*u,.2,h+.06,{r:.006})}let p=[1.45,2.86];for(let v of p){for(let g of[-1,1]){t.box(r,2*u-.09,.12,.05,0,v,g*(h+.01),{r:.008});for(let x of[-1,1])t.box(r,.012,.2,.065,x*(u-.051),v-.02,g*(h+.005),{r:0})}for(let g of[-.85,0,.85])t.add(a,je($e(.04,.025,2*h),g,v+.045,0));for(let g=-.45;g<=.451;g+=.1)t.add(a,je($e(2*u-.1,.005,.005),0,v+.062,g));for(let g=-1.2;g<=1.201;g+=.2)t.add(a,je($e(.005,.005,2*h+.04),g,v+.066,0))}t.decal(Mi(i,"货位 "+String.fromCharCode(65+n%6)+"-"+(10+n%40),{color:"black",font:"sans",distress:.1}),.07,0,p[0],h+.0365,null,.34),t.decal(Mi(i,"每层限重2000千克",{color:"black",font:"sans",distress:.1}),.045,.6,p[1],h+.0365,null,.5);let d=["cartons","wrapped","drums","cartons","wrapped","pallets","none"];return[0,p[0]+.068,p[1]+.068].forEach((v,g)=>{for(let x of[-1,1]){let y=d[Math.floor(s()*d.length)];g===2&&y==="drums"&&(y="wrapped"),y!=="none"&&DA(t,l,y,x*.615+(s()-.5)*.03,v,(s()-.5)*.05,s)}}),qi(t.group(),"shelf_rack",b1("shelf_rack"),[{min:[-1.35,0,-.55],max:[1.35,4.2,.55],surface:"metal"}])}
function N3(i,e={}){let t=new jn(i),n=e.seed|0,s=n*2.3,o=t.M("paint_white",{vertexColors:!0}),r=t.M("steel_dark"),a=t.M("steel_galv"),l=t.M("paint_grey"),c=t.M("brass"),u=t.M("rubber"),h=t.M("aluminium"),f=(g,x,y)=>{let b=(.86+.18*ri(y*2+s,x*2))*(.62+.38*mn(0,.6,x));return[b,b*.985,b*.955]};t.defCol.set(o,f);let p=[.05,.05,.055];e.flip||t.push(_o(0,0,0,[0,wi,0]));let d=.13;t.box(o,.38,2.3,2.3,-.06,1.15,0,{r:.012});for(let g of[-1,1])t.box(o,.12,2.3,.09,.19,1.15,g*1.105,{r:.012});t.box(o,.12,.09,2.12,.19,2.255,0,{r:.012}),t.box(o,.12,.1,2.12,.19,.05,0,{r:.012}),t.box(o,.1,.06,2.12,.18,1.42,0,{r:.01}),t.box(o,.1,.06,2.12,.18,.9,0,{r:.01});for(let g of[.3,.9,1.5,2.1])for(let x of[-1,1])t.cyl(a,.014,.014,.012,.255,g,x*1.105,{seg:6,rot:[0,0,wi/2]});for(let g of[-.8,-.3,.3,.8])for(let x of[.05,2.255])t.cyl(a,.014,.014,.012,.255,x,g,{seg:6,rot:[0,0,wi/2]});for(let g of[-1,1]){let x=g*.53,y=1.83;t.add(o,je(pr(.66,.66,6),d+.004,y,x,[0,wi/2,0]),p),t.cyl(o,.335,.345,.1,d+.05,y,x,{seg:20,open:!0,rot:[0,0,wi/2]}),t.cyl(o,.36,.36,.014,d+.006,y,x,{seg:20,open:!0,rot:[0,0,wi/2]});for(let b=0;b<3;b++)t.add(r,je($e(.012,.6,.12),d+.04,y,x,[b*wi/3+g*.4,.5,0]));t.cyl(r,.07,.07,.06,d+.05,y,x,{seg:10,rot:[0,0,wi/2]});for(let b=0;b<8;b++){let m=b*wi/4;t.add(a,je($e(.005,.66,.005),d+.098,y,x,[m,0,0]))}for(let b of[.12,.22,.32])t.cyl(a,b,b,.006,d+.1,y,x,{seg:20,open:!0,rot:[0,0,wi/2]})}t.decal(Mi(i,"几猫船用制冷",{color:"black",font:"sans",distress:.2}),.05,.2505,2.255,0,[0,wi/2,0],1.2);for(let g of[-1,1]){t.add(o,je(cn(.98,.44),d+.004,1.16,g*.53,[0,wi/2,0]),p);for(let x=0;x<9;x++)t.box(o,.06,.006,.98,d+.035,.965+x*.049,g*.53,{r:0,rot:[0,0,-.75]});t.box(o,.05,.46,.03,d+.03,1.16,g*.53,{r:.005})}t.add(o,je(cn(1,.76),d+.004,.49,-.53,[0,wi/2,0]),p),t.cyl(r,.15,.15,.46,d+.1,.36,-.58,{seg:14,open:!0,rot:[wi/2,0,0]});for(let g of[-1,1]){let x=mr(.15,14,6);x.scale(1,1,.45),t.add(r,je(x,d+.1,.36,-.58+g*.23))}t.box(r,.26,.03,.5,d+.1,.19,-.58,{r:.006}),t.cyl(h,.07,.07,.4,d+.07,.5,-.17,{seg:10}),t.tube(c,[[d+.1,.5,-.5],[d+.1,.68,-.5],[d+.08,.78,-.4],[d+.08,.8,-.2],[d+.07,.72,-.17]],.012,{seg:6}),t.tube(c,[[d+.12,.42,-.36],[d+.14,.6,-.33],[d+.1,.84,-.34],[d+.06,.88,-.6],[d+.03,.88,-.9]],.009,{seg:6}),t.tube(c,[[d+.1,.36,-.82],[d+.1,.36,-.93],[d+.06,.6,-.96],[d+.04,.86,-.96]],.012,{seg:6}),t.box(t.M("paint_red"),.04,.05,.05,d+.12,.6,-.33,{r:.008});let v=.55;t.box(l,.11,.56,.74,d+.055,.5,v,{r:.012}),t.box(l,.012,.5,.68,d+.114,.5,v,{r:.004}),t.add(r,je(cn(.26,.11),d+.1215,.66,v-.1,[0,wi/2,0])),t.add(i.mats.emissive(16757850,2.4),je(cn(.15,.05),d+.122,.665,v-.06,[0,wi/2,0]),null,!0),t.add(i.mats.emissive(5832570,3),je(cn(.014,.014),d+.122,.66,v-.2,[0,wi/2,0]),null,!0);for(let g=0;g<4;g++)for(let x=0;x<2;x++)t.box(r,.008,.03,.03,d+.122,.5-x*.045,v-.04-g*.045,{r:.003});return t.box(t.M("paint_red"),.03,.09,.03,d+.13,.42,v+.22,{r:.006}),t.cyl(a,.012,.012,.1,d+.124,.5,v+.325,{seg:6}),t.decal(Jn(i,"hazard_voltage"),.11,d+.1215,.64,v+.2,[0,wi/2,0]),t.tube(u,[[d+.06,.78,v+.2],[d+.06,.95,v+.25],[d+.05,1.4,v+.5],[d+.05,1.5,v-0]],.012,{seg:5}),t.tube(u,[[d+.06,.78,v-.2],[d+.06,.92,v-.3],[d+.05,.93,-.1]],.01,{seg:5}),t.cyl(a,.022,.022,.04,d+.06,.2,v+.2,{seg:8}),t.tube(u,[[d+.06,.2,v+.2],[d+.08,.12,v+.1],[d+.1,.16,v-.15],[d+.1,.2,v-.3],[d+.1,.13,v-.36],[d+.09,.12,v-.1],[d+.09,.14,v+.05]],.016,{seg:6}),t.box(t.M("paint_blue"),.07,.07,.12,d+.09,.14,v+.1,{r:.015}),t.decal(Jn(i,"grime_streak"),.8,.2512,.5,-1.105,[0,wi/2,0],.08),e.flip||t.pop(),qi(t.group(),"reefer_unit",b1("reefer_unit"),[{min:[-.25,0,-1.15],max:[.25,2.3,1.15],surface:"metal"}])}
var es=Math.PI,Kg=new Ve(16752680),LA=new Ve(16721940),kA=new Ve(16767392);
function B3(i,e={}){let t=e.seed|0,n=t*1.9,s=e.id||e.label||"ABC"[t%3],o=new jn(i),r=new jn(i),a=new jn(i),l=new jn(i),c=o.M("paint_grey",{vertexColors:!0}),u=o.M("steel_dark"),h=o.M("steel_galv"),f=o.M("aluminium"),p=o.M("rubber"),d=o.M("concrete",{vertexColors:!0}),v=(le,R,I)=>{let se=(.88+.2*ri(le*3+n,R*3+I*2))*(.6+.4*mn(.16,.7,R));return[se,se,se*.98]};o.defCol.set(c,v),r.defCol.set(c,(le,R,I)=>{let se=.9+.14*ri(le*4+n,R*3);return[se,se,se]});let g=[.035,.035,.04],x={em:!0};o.box(d,1.36,.16,.96,0,.08,0,{r:.025,col:(le,R,I)=>{let se=.6+.38*mn(0,.15,R)+.1*ri(le*5,I*5);return[se,se,se*.97]}}),o.decal(Jn(i,"caution_stripes"),.1,0,.085,.4815,null,1.2);for(let le of[-1,1])for(let R of[-1,1])o.cyl(h,.016,.016,.03,le*.44,.185,R*.36,{seg:6}),o.box(h,.1,.012,.1,le*.44,.166,R*.36,{r:0});let y=-.5,b=.5,m=.18,A=1.62,_=-.3,M=.3,E=.025,w=(m+A)/2,S=A-m;o.box(c,1,S,E,0,w,_+E/2,{r:.006});for(let le of[-1,1])o.box(c,E,S,.6,le*(.5-E/2),w,0,{r:.006});o.box(c,1,E,.6,0,m+E/2,0,{r:.006}),o.box(c,1,E,.6,0,A-E/2,0,{r:.006}),o.box(c,E,S,.58,0,w,0,{r:.004}),o.box(c,1,.12,E,0,A-.06,M-E/2,{r:.006}),o.box(c,1,.07,E,0,m+.035,M-E/2,{r:.006}),o.box(u,1.04,.04,.64,0,m-.01,0,{r:.008}),o.box(c,1.12,.05,.74,0,A+.025,.01,{r:.012});for(let le of[-1,1])o.tube(h,[[le*.4-.04,A+.05,.2],[le*.4-.03,A+.1,.2],[le*.4+.03,A+.1,.2],[le*.4+.04,A+.05,.2]],.008,{seg:5});let z=(le,R,I)=>[.16,.16,.17];o.add(c,je(cn(.45,S-.06),-.25,w,_+E+.002),z),o.add(c,je(cn(.55,S-.06),y+E+.002,w,0,[0,es/2,0]),z),o.add(c,je(cn(.55,S-.06),-E/2-.002,w,0,[0,-es/2,0]),z);for(let le=0;le<5;le++){let R=.42+le*.22;o.box(u,.42,.17,.4,-.25,R,-.05,{r:.008}),o.box(f,.4,.02,.012,-.25,R+.06,.152,{r:0});for(let I=0;I<4;I++)a.add(x,je(cn(.012,.012),-.41+I*.035,R-.04,.1512));for(let I=0;I<3;I++)o.add(u,je(pr(.03,.022,2),-.2+I*.06,R-.03,.1512),g)}let H=[p,p,p];for(let le=0;le<4;le++)o.tube(H[le%3],[[-.2+le%3*.06,.39+le*.22,.15],[-.14+le%3*.05,.36+le*.22,.24],[-.07,.55+le*.22,.22],[-.2+(le+1)%3*.06,.61+le*.22,.15]],.007,{seg:5});let O=.474,q=1.3,U=.9,T=(le,R,I)=>{let se=R+O/2,ae=0;le.box(c,O,q,.024,se,U,ae,{r:.006}),le.box(c,O-.07,q-.07,.006,se,U,ae+.013,{r:.003});for(let ve of[U+.36,U-.4]){le.add(c,je(cn(O-.14,.3),se,ve,ae+.0165),g);for(let _e=0;_e<7;_e++)le.box(c,O-.13,.034,.005,se,ve-.125+_e*.042,ae+.027,{r:0,rot:[.75,0,0]});le.box(c,.02,.31,.02,se-(O-.13)/2,ve,ae+.022,{r:.003}),le.box(c,.02,.31,.02,se+(O-.13)/2,ve,ae+.022,{r:.003})}let k=I?R+.07:R+O-.07;le.box(u,.045,.2,.02,k,U-.02,ae+.026,{r:.006}),le.box(h,.028,.13,.018,k,U+0,ae+.042,{r:.006}),le.cyl(h,.012,.012,.012,k,U-.09,ae+.04,{seg:8,rot:[es/2,0,0]});let ce=I?R+O:R;for(let ve of[U-.5,U,U+.5])le.cyl(h,.011,.011,.09,ce,ve,ae+.016,{seg:6})};o.push(_o(0,0,M-.004)),T(o,.013,!0),o.decal(Mi(i,"中继 "+s,{color:"yellow",font:"stencil",distress:.15}),.12,.013+O/2,U+.02,.018,null,O-.1),o.decal(Mi(i,"港区主控上行链路",{color:"white",font:"sans",distress:.15}),.034,.013+O/2,U-.1,.018,null,O-.1),o.decal(Jn(i,"hazard_voltage"),.13,.013+O/2+.1,U+.14,.018,null),o.pop();let D=[-.487,0,M-.004];T(r,0,!1),r.decal(Jn(i,"hazard_general"),.13,O/2,U+.1,.018,null),r.box(c,O-.1,.03,.014,O/2,U+.55,-.018,{r:.003}),r.box(c,O-.1,.03,.014,O/2,U-.55,-.018,{r:.003}),r.box(c,.03,1.1,.014,.07,U,-.018,{r:.003}),r.box(c,.03,1.1,.014,O-.07,U,-.018,{r:.003}),r.box(u,.24,.3,.02,O/2,U-.05,-.02,{r:.004}),r.add(Mi(i,"接线图 SLT-R4",{color:"white",font:"sans",distress:.1}).material,je(cn(.2,.03),O/2,U+.03,-.0305,[0,es,0]),null,!0);for(let le of[U+.36,U-.4])r.add(c,je(cn(O-.14,.3),O/2,le,-.0125,[0,es,0]),g);r.decal(Mi(i,"检修前请断电",{color:"white",font:"sans",distress:.15}),.03,O/2,U-.03,.018,null,O-.1);for(let le of[-1,1]){o.box(f,.012,.98,.5,le*.506,1.06,0,{r:.003});for(let R=-6;R<=6;R++)o.add(f,je($e(.06,.94,.007),le*.54,1.06,R*.038));o.box(c,.075,.03,.52,le*.54,1.56,0,{r:.006})}for(let le=0;le<3;le++){let R=-.17+le*.17,I=.44-le*.02,se=.86+le*.07;o.tube(p,[[.5,I,R],[.6,I,R],[.72+le*.04,I-.06,R],[se-.02,.16,R+.02],[se,-.03,R+.02]],.04,{seg:8,tension:.4}),o.cyl(h,.055,.055,.05,.515,I,R,{seg:8,flat:!0,rot:[0,0,es/2]}),o.cyl(h,.06,.066,.03,se,.015,R+.02,{seg:8})}o.tube(p,[[-.3,.35,_],[-.3,.33,_-.1],[-.34,.2,_-.2],[-.5,.165,_-.3],[-.9,.02,_-.36],[-1.5,.018,_-.2]],.022,{seg:6}),o.box(u,.3,.22,.1,.2,.75,_-.05,{r:.012}),o.tube(p,[[.2,.86,_-.06],[.2,1.2,_-.04],[-.1,1.55,_-.03],[-.3,1.66,-.16]],.012,{seg:5});let C=-.3,G=-.14,j=A+.05,N=2.5,Q=[0,1,2].map(le=>[C+Math.cos(le*2.094+.52)*.085,G+Math.sin(le*2.094+.52)*.085]);o.box(h,.24,.012,.24,C,j+.006,G,{r:0});for(let le=0;le<3;le++){let R=Q[le],I=Q[(le+1)%3];o.bar(h,[R[0],j,R[1]],[R[0],N,R[1]],.011,{seg:6});let se=5,ae=(N-j)/se;for(let k=0;k<se;k++)o.bar(h,[R[0],j+k*ae,R[1]],[I[0],j+(k+1)*ae,I[1]],.005,{seg:4}),o.bar(h,[R[0],j+(k+1)*ae,R[1]],[I[0],j+(k+1)*ae,I[1]],.005,{seg:4})}o.cyl(h,.11,.11,.014,C,N+.007,G,{seg:10}),o.cyl(u,.05,.06,.1,C,N+.06,G,{seg:10});let K=(le,R,I)=>{o.cyl(u,.016,.02,.07,le,A+.085,R,{seg:8}),o.cyl(h,.011,.011,.06,le,A+.15,R,{seg:6}),o.bar(u,[le,A+.17,R],[le+.02,I,R-.015],.005,{r2:.0018,seg:5,caps:!0})};K(.4,-.24,3.15),K(.26,-.24,2.72),o.cyl(u,.03,.03,.26,.42,A+.18,.18,{seg:8}),o.add(u,je(mr(.03,8,4,es*2,0,es/2),.42,A+.31,.18));let ie=g1([[0,0],[.06,.006],[.12,.024],[.18,.054],[.215,.078],[.222,.078],[.185,.05],[.12,.016],[.06,-.003],[0,-.01]],18);ie.computeVertexNormals(),l.add(f,je(ie,0,.3,.02,[es/2-.12,0,0])),l.cyl(f,.022,.03,.2,0,.1,0,{seg:8}),l.box(f,.07,.1,.06,0,.26,-.02,{r:.01});for(let le of[.5,2.6,4.7])l.bar(f,[Math.cos(le)*.2,.3+Math.sin(le)*.2,.09],[0,.325,.25],.0045,{seg:4});l.cyl(f,.022,.016,.05,0,.325,.25,{seg:8,rot:[es/2,0,0]});let F=[C,N+.11,G];o.box(u,.9,.07,.03,0,A-.06,M+.012,{r:.008}),a.add(x,je(cn(.84,.036),0,A-.06,M+.0275));for(let le=1;le<6;le++)o.add(u,je($e(.008,.05,.006),-.42+le*.14,A-.06,M+.028));o.box(u,.6,.06,.03,0,A-.06,_-.012,{r:.008}),a.add(x,je(cn(.54,.03),0,A-.06,_-.0275,[0,es,0]));for(let le of[-1,1])o.box(u,.03,1.2,.03,le*.5,.86,M,{r:.008,rot:[0,es/4,0]}),a.add(x,je(cn(.014,1.14),le*.5,.86,M+.0215,[0,le*es/4,0]).translate(le*.0152,0,0)),a.add(x,je(cn(.014,.9),le*.5715,1.06,.262,[0,le*es/2,0]));for(let le of[-1,1])o.box(u,.03,.06,.46,le*.587,A-.01,0,{r:.008}),a.add(x,je(cn(.4,.032),le*.6025,A-.01,0,[0,le*es/2,0]));o.cyl(u,.028,.028,.02,C+.2,A+.06,G,{seg:8}),o.bar(h,[C+.2,A+.06,G],[C+.2,2.64,G],.009,{seg:6}),a.add(x,je(ot(.045,.045,.1,10),C+.2,2.69,G)),o.cyl(u,.05,.05,.014,C+.2,2.747,G,{seg:10}),o.cyl(u,.05,.05,.014,C+.2,2.633,G,{seg:10}),o.decal(Jn(i,"rust_run"),.5,.5135,.3,.2,[0,es/2,0],.14),o.decal(Jn(i,"grime_streak"),.6,-.2,1.2,_-.001,[0,es,0],.2);let X=o.group(),ne=new wt;ne.userData.noMerge=!0,ne.name="relay_dynamic",X.add(ne);let re=i.mats.emissive(16752680,4);re=re.clone();let $=new Qe(Ii(a.buckets.get(x).geos),re);$.userData.noMerge=!0,ne.add($);let ue=r.group().children.slice();for(let le of ue)le.position.set(D[0],D[1],D[2]),le.userData.noMerge=!0,ne.add(le);let me=l.group().children.slice();for(let le of me)le.position.set(F[0],F[1],F[2]),le.userData.noMerge=!0,ne.add(le);let ee=new Ve,B=(le,R)=>{if(re.userData&&typeof re.userData.setEmissive=="function"){re.userData.setEmissive(le,R);return}re.emissive&&re.emissive.isColor&&re.isMeshStandardMaterial?(re.emissive.copy(le),re.emissiveIntensity=R):re.uniforms&&re.uniforms.color&&re.uniforms.color.value&&re.uniforms.color.value.isColor?(re.uniforms.color.value.copy(le).multiplyScalar(R),re.uniforms.intensity&&(re.uniforms.intensity.value=1)):re.color&&re.color.isColor&&re.color.copy(le).multiplyScalar(R)},P="live",V=t%7*.9,Y=0,L=.7,Z=0,J=0,oe=0,fe=X.userData;if(fe.state=P,fe.beacon=[C+.2,2.68,G],fe.interact=[0,1,.75],fe.emissiveMaterial=re,fe.level=0,fe.setState=le=>{le!=="live"&&le!=="cutting"&&le!=="cut"||le!==P&&(P=le,fe.state=le,le==="cut"&&(Y=0,oe=1.32,J=2.5),le==="live"&&(oe=0))},fe.update=le=>{le=Math.min(le||0,.1),V+=le;let R=0,I=Kg,se=.7;if(P==="live")R=5.5+3*Math.sin(V*2.2);else if(P==="cutting"){let ae=Math.sin(V*2*es*5.5)>0;R=ae?9:.5,I=ae?kA:Kg,se=2.6+Math.sin(V*9)*1.5}else if(Y+=le,I=LA,se=0,Y<.3)R=9;else if(Y<2.6){let ae=1-(Y-.3)/2.3;R=7*ae*ae*(Math.sin(Y*37)*Math.sin(Y*13.3)>-.2?1:.08)}else R=0;if(fe.level=R,B(ee.copy(I),R),L+=(se-L)*Math.min(1,le*(P==="cut"?1.6:3)),Math.abs(L)>.001)for(let ae of me)ae.rotateY(L*le);if(Math.abs(oe-Z)>1e-4||Math.abs(J)>.001){J+=(-(Z-oe)*30-J*3.2)*le;let ae=Z+J*le;ae<0&&(ae=0,J=Math.abs(J)*.3),ae>1.9&&(ae=1.9,J=-Math.abs(J)*.4);let k=ae-Z;Z=ae;for(let ce of ue)ce.rotateY(-k)}},e.state==="cut"){fe.setState("cut");for(let le=0;le<80;le++)fe.update(.05)}else e.state==="cutting"&&fe.setState("cutting"),fe.update(0),P==="live"&&B(ee.copy(Kg),6);return qi(X,"relay_node",Gi.relay_node.slice(0,3),[{min:[-.68,0,-.48],max:[.68,.16,.48],surface:"concrete"},{min:[-.57,.16,-.32],max:[.57,1.67,.33],surface:"metal"},{min:[-.42,1.67,-.26],max:[-.18,2.5,-.02],surface:"metal",bulletOnly:!0}])}
for(let i of["container20","container40","container40hc"])_i(i,(e,t)=>M3(e,i,t));
_i("jersey_barrier",S3);
_i("light_mast",T3);
_i("fence_panel",A3);
_i("guard_booth",R3);
_i("gate_arm",C3);
_i("bollard_mooring",P3);
_i("bollard_post",I3);
_i("sign_post",z3);
_i("floodlight_stand",D3);
_i("stairs_metal",k3);
_i("catwalk",F3);
_i("shelf_rack",U3);
_i("reefer_unit",N3);
_i("relay_node",B3);
var At=Math.PI,tt=Math.PI/2,zi=(i,e,t)=>Math.min(t,Math.max(e,i));
function Za(i,e,t){let n=Math.imul(i,374761393)^Math.imul(e,668265263)^Math.imul(t,2147483647);return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296}
function gn(i,e=0,t=0){let n=Math.floor(i),s=Math.floor(e),o=Math.floor(t),r=i-n,a=e-s,l=t-o;r=r*r*(3-2*r),a=a*a*(3-2*a),l=l*l*(3-2*l);let c=(u,h,f)=>u+(h-u)*f;return c(c(c(Za(n,s,o),Za(n+1,s,o),r),c(Za(n,s+1,o),Za(n+1,s+1,o),r),a),c(c(Za(n,s,o+1),Za(n+1,s,o+1),r),c(Za(n,s+1,o+1),Za(n+1,s+1,o+1),r),a),l)}
function Mf(i,e,t,n){let s=new nt;return s.setAttribute("position",new et(new Float32Array(i),3)),e&&s.setAttribute("normal",new et(new Float32Array(e),3)),s.setAttribute("uv",new et(new Float32Array(t),2)),n&&s.setIndex(n),e||s.computeVertexNormals(),s}
function us(i,e=16){let t=i.length,n=[],s=[],o=[],r=[],a=[],l=[],c=[],u=0,h=0;for(let f=0;f<t;f++){let p=0,d=0;if(f>0){let g=i[f][0]-i[f-1][0],x=i[f][1]-i[f-1][1],y=Math.hypot(g,x);y>1e-6&&(p+=g/y,d+=x/y,h+=y)}if(f<t-1){let g=i[f+1][0]-i[f][0],x=i[f+1][1]-i[f][1],y=Math.hypot(g,x);y>1e-6&&(p+=g/y,d+=x/y)}let v=Math.hypot(p,d)||1;a.push(d/v),l.push(-p/v),c.push(h),u=Math.max(u,i[f][0])}for(let f=0;f<t;f++)for(let p=0;p<=e;p++){let d=p/e*At*2,v=Math.cos(d),g=Math.sin(d);n.push(i[f][0]*v,i[f][1],i[f][0]*g),s.push(a[f]*v,l[f],a[f]*g),o.push(p/e*At*2*u,c[f])}for(let f=0;f<t-1;f++)if(!(Math.hypot(i[f+1][0]-i[f][0],i[f+1][1]-i[f][1])<1e-6))for(let p=0;p<e;p++){let d=f*(e+1)+p,v=d+e+1,g=v+1,x=d+1;i[f][0]>1e-6&&r.push(d,v,x),i[f+1][0]>1e-6&&r.push(v,g,x)}return Mf(n,s,o,r)}
function Ge(i,e,t,n=.008,s="center"){let o=[i/2,e/2,t/2];n=Math.min(n,o[0]*.9,o[1]*.9,o[2]*.9);let r=[],a=[],l=[],c=[];for(let p=0;p<8;p++)for(let d=0;d<3;d++){let v=[p&1?1:-1,p&2?1:-1,p&4?1:-1],g=[0,1,2].map(x=>v[x]*(o[x]-(x!==d?n:0)));r.push(g[0],g[1],g[2]),a.push(d===0?v[0]:0,d===1?v[1]:0,d===2?v[2]:0),d===0?l.push(g[2],g[1]):d===1?l.push(g[0],g[2]):l.push(g[0],g[1])}let u=(p,d)=>p*3+d,h=(p,d,v,g,x,y)=>{let b=r[d*3]-r[p*3],m=r[d*3+1]-r[p*3+1],A=r[d*3+2]-r[p*3+2],_=r[v*3]-r[p*3],M=r[v*3+1]-r[p*3+1],E=r[v*3+2]-r[p*3+2];(m*E-A*M)*g+(A*_-b*E)*x+(b*M-m*_)*y>=0?c.push(p,d,v):c.push(p,v,d)};for(let p=0;p<3;p++){let d=(p+1)%3,v=(p+2)%3;for(let g of[0,1]){let x=[[0,0],[1,0],[1,1],[0,1]].map(([b,m])=>g<<p|b<<d|m<<v),y=[0,0,0];y[p]=g?1:-1,h(u(x[0],p),u(x[1],p),u(x[2],p),...y),h(u(x[0],p),u(x[2],p),u(x[3],p),...y)}for(let g of[0,1])for(let x of[0,1]){let y=g<<d|x<<v,b=y|1<<p,m=[0,0,0];m[d]=g?1:-1,m[v]=x?1:-1,h(u(y,d),u(b,d),u(b,v),...m),h(u(y,d),u(b,v),u(y,v),...m)}}for(let p=0;p<8;p++)h(u(p,0),u(p,1),u(p,2),p&1?1:-1,p&2?1:-1,p&4?1:-1);let f=Mf(r,a,l,c);return s==="bottom"&&f.translate(0,e/2,0),f}
function eo(i,e,t,n=.03,s=3,o=3,r=3,a="center"){let l=new un(i,e,t,s,o,r),c=l.attributes.position,u=l.attributes.normal,h=l.attributes.uv,f=i/2,p=e/2,d=t/2;n=Math.min(n,f*.95,p*.95,d*.95);let v=(x,y,b)=>{if(Math.abs(x)>y-1e-6||b<3)return x;let m=2*y/b;return x*(y-n)/(y-m)},g=new W;for(let x=0;x<c.count;x++){let y=v(c.getX(x),f,s),b=v(c.getY(x),p,o),m=v(c.getZ(x),d,r),A=zi(y,-(f-n),f-n),_=zi(b,-(p-n),p-n),M=zi(m,-(d-n),d-n);g.set(y-A,b-_,m-M),(Math.abs(y)>f-1e-5?1:0)+(Math.abs(b)>p-1e-5?1:0)+(Math.abs(m)>d-1e-5?1:0)>=2&&g.lengthSq()>1e-12&&(g.normalize(),y=A+g.x*n,b=_+g.y*n,m=M+g.z*n,u.setXYZ(x,g.x,g.y,g.z)),c.setXYZ(x,y,b,m);let w=Math.abs(u.getX(x)),S=Math.abs(u.getY(x)),z=Math.abs(u.getZ(x));w>=S&&w>=z?h.setXY(x,m,b):S>=w&&S>=z?h.setXY(x,y,m):h.setXY(x,y,b)}return a==="bottom"&&l.translate(0,e/2,0),l}
function to(i,e){let t=i.attributes.position,n=new W;for(let s=0;s<t.count;s++)n.fromBufferAttribute(t,s),e(n,s),t.setXYZ(s,n.x,n.y,n.z);return i}
function gr(i){let e=i.attributes.position,t=i.index,n=e.count,s=new Map,o=f=>Math.round(e.getX(f)*2e3)+","+Math.round(e.getY(f)*2e3)+","+Math.round(e.getZ(f)*2e3),r=new Array(n);for(let f=0;f<n;f++)r[f]=o(f);let a=new W,l=new W,c=new W,u=t?t.count:n;for(let f=0;f<u;f+=3){let p=t?t.getX(f):f,d=t?t.getX(f+1):f+1,v=t?t.getX(f+2):f+2;a.fromBufferAttribute(e,p),l.fromBufferAttribute(e,d),c.fromBufferAttribute(e,v),l.sub(a),c.sub(a),l.cross(c);for(let g of[p,d,v]){let x=s.get(r[g]);x||(x=[0,0,0],s.set(r[g],x)),x[0]+=l.x,x[1]+=l.y,x[2]+=l.z}}let h=new Float32Array(n*3);for(let f=0;f<n;f++){let p=s.get(r[f])||[0,1,0],d=Math.hypot(p[0],p[1],p[2])||1;h[f*3]=p[0]/d,h[f*3+1]=p[1]/d,h[f*3+2]=p[2]/d}return i.setAttribute("normal",new et(h,3)),i}
function M1(i){if(i.index){let t=i.index.array;for(let n=0;n<t.length;n+=3){let s=t[n+1];t[n+1]=t[n+2],t[n+2]=s}}else for(let t of Object.keys(i.attributes)){let n=i.attributes[t],s=n.itemSize,o=n.array;for(let r=0;r<n.count;r+=3)for(let a=0;a<s;a++){let l=o[(r+1)*s+a];o[(r+1)*s+a]=o[(r+2)*s+a],o[(r+2)*s+a]=l}}let e=i.attributes.normal.array;for(let t=0;t<e.length;t++)e[t]=-e[t];return i}
function ev(i,e){let t=i.groups[e];if(!t)return i;let n=Array.from(i.index.array);n.splice(t.start,t.count),i.setIndex(n);for(let s of i.groups)s.start>t.start&&(s.start-=t.count);return t.count=0,i}
var O3=new Lt,FA=new W(0,1,0),_1=new W,H3=new Ye;
function vn(i,e,t=.02,n=6,s=!1,o=t){_1.set(e[0]-i[0],e[1]-i[1],e[2]-i[2]);let r=_1.length();_1.normalize();let a=ot(o,t,r,n,!s);return O3.setFromUnitVectors(FA,_1),H3.compose(new W((i[0]+e[0])/2,(i[1]+e[1])/2,(i[2]+e[2])/2),O3,new W(1,1,1)),a.applyMatrix4(H3),a}
function Mo(i,e,{soft:t=.6,caps:n=!0}={}){let s=i.length,o=[],r=[],a=[],l=[],c=e/2,u=[],h=0,f=[0];for(let d=0;d<s;d++){let v=i[d],g=i[(d+1)%s],x=g[0]-v[0],y=g[1]-v[1],b=Math.hypot(x,y)||1;u.push([y/b,-x/b]),h+=b,f.push(h)}let p=(d,v)=>{let g=u[d],x=u[(v+s)%s];if(g[0]*x[0]+g[1]*x[1]>Math.cos(t)){let y=g[0]+x[0],b=g[1]+x[1],m=Math.hypot(y,b)||1;return[y/m,b/m]}return g};for(let d=0;d<s;d++){let v=i[d],g=i[(d+1)%s],x=p(d,d-1),y=p(d,d+1),b=o.length/3;o.push(v[0],v[1],c,v[0],v[1],-c,g[0],g[1],-c,g[0],g[1],c),r.push(x[0],x[1],0,x[0],x[1],0,y[0],y[1],0,y[0],y[1],0),a.push(f[d],c,f[d],-c,f[d+1],-c,f[d+1],c),l.push(b,b+1,b+2,b,b+2,b+3)}if(n){let d=Xs.triangulateShape(i.map(v=>new Ae(v[0],v[1])),[]);for(let v of[1,-1]){let g=o.length/3;for(let x of i)o.push(x[0],x[1],v*c),r.push(0,0,v),a.push(x[0],x[1]);for(let x of d)v>0?l.push(g+x[0],g+x[1],g+x[2]):l.push(g+x[0],g+x[2],g+x[1])}}return Mf(o,r,a,l)}
function vr(i,e,t=!0){let n=i.length,s=[],o=[],r=[],a=0,l=Math.hypot(e[0],e[1],e[2])*2;for(let p=0;p<n;p++)p&&(a+=Math.hypot(i[p][0]-i[p-1][0],i[p][1]-i[p-1][1],i[p][2]-i[p-1][2])),s.push(i[p][0]-e[0],i[p][1]-e[1],i[p][2]-e[2],i[p][0]+e[0],i[p][1]+e[1],i[p][2]+e[2]),o.push(a,0,a,l);for(let p=0;p<n-1;p++){let d=p*2;r.push(d,d+1,d+3,d,d+3,d+2)}let c=Mf(s,null,o,r);if(!t)return c;let u=c.clone(),h=u.index.array;for(let p=0;p<h.length;p+=3){let d=h[p+1];h[p+1]=h[p+2],h[p+2]=d}let f=u.attributes.normal.array;for(let p=0;p<f.length;p++)f[p]=-f[p];return Ii([c,u])}
function _f(i,e){return new rn(i,e)}
function UA(i,e,t,n=4){let s=[],o=[],r=[],a=[];for(let l=0;l<=n;l++){let c=(l/n-.5)*e/i,u=Math.sin(c),h=Math.cos(c);s.push(i*u,-t/2,i*h,i*u,t/2,i*h),o.push(u,0,h,u,0,h),r.push(l/n,0,l/n,1)}for(let l=0;l<n;l++){let c=l*2;a.push(c,c+2,c+3,c,c+3,c+1)}return Mf(s,o,r,a)}
function ja(i,e,t=6,n=12,s=At*2){let o=new Ci(i,e,t,n,s),r=o.attributes.uv;for(let a=0;a<r.count;a++)r.setXY(a,r.getX(a)*s*i,r.getY(a)*2*At*e);return o}
function Y3(i,e=8,t=6){let n=new ls(i,e,t),s=n.attributes.uv;for(let o=0;o<s.count;o++)s.setXY(o,s.getX(o)*2*At*i,s.getY(o)*At*i);return n}
function NA(i,e){let t=i.attributes.position.count,n=i.attributes.color;if(n||(n=new et(new Float32Array(t*3).fill(1),3),i.setAttribute("color",n)),e===1||e==null)return i;let s=n.array;if(typeof e=="function"){let l=i.attributes.position;for(let c=0;c<t;c++){let u=e(l.getX(c),l.getY(c),l.getZ(c));typeof u=="number"?(s[c*3]*=u,s[c*3+1]*=u,s[c*3+2]*=u):(s[c*3]*=u[0],s[c*3+1]*=u[1],s[c*3+2]*=u[2])}return i}let o=typeof e=="number"?e:e[0],r=typeof e=="number"?e:e[1],a=typeof e=="number"?e:e[2];for(let l=0;l<t;l++)s[l*3]*=o,s[l*3+1]*=r,s[l*3+2]*=a;return i}
var V3={red:["paint_red",1],blue:["paint_blue",1],green:["paint_green",1],yellow:["paint_yellow",1],orange:["paint_orange",1],white:["paint_white",1],grey:["paint_grey",1],teal:["paint_teal",1],rust:["steel_rust",1],black:["paint_grey",[.2,.2,.22]],olive:["paint_green",[.75,.8,.45]]};
function Ja(i,e="blue"){return V3[i]||V3[e]}
var pI=new Ye,W3=new Lt,G3=new In,q3=new W,Qg=new W;
function BA({p:i=[0,0,0],r:e=[0,0,0],s:t=1}={}){return G3.set(e[0],e[1],e[2]),W3.setFromEuler(G3),q3.set(i[0],i[1],i[2]),typeof t=="number"?Qg.set(t,t,t):Qg.set(t[0],t[1],t[2]),new Ye().compose(q3,W3,Qg)}
var Kn=class{constructor(e,t,n=1){this.G=e,this.name=t,this.seed=Math.abs(n|0),this.rng=il((this.seed+1)*7919+t.length*131),this.b=new Map,this.stack=[new Ye]}push(e){return this.stack.push(this.stack[this.stack.length-1].clone().multiply(BA(e))),this}pop(){return this.stack.pop(),this}mat(e,t){return this.G.mats.get(e,{vertexColors:!0,...t||{}})}add(e,t,n,s=1,{raw:o=!1,cast:r=!0}={}){let a=typeof e=="string"?this.mat(e):e;n&&Dc(t,n),t.applyMatrix4(this.stack[this.stack.length-1]),o||NA(t,s);let l=a.uuid+(r?"c":"n"),c=this.b.get(l);return c||(c={mat:a,geos:[],raw:o,cast:r},this.b.set(l,c)),c.geos.push(t),this}decal(e,t,n,s){return this.add(e.material,_f(t,s||t/(e.aspect||1)),n,1,{raw:!0,cast:!1})}label(e,t,n,s,o){let r=this.G.mats.label(e,t),a=Math.min(n,s*(r.aspect||1));return this.add(r.material,_f(a,a/(r.aspect||1)),o,1,{raw:!0,cast:!1})}cdecal(e,t,n,s,o){return this.add(e.material,UA(t,n,o||n/(e.aspect||1)),s,1,{raw:!0,cast:!1})}finish({size:e,colliders:t,grime:n=1,surface:s}={}){let o=new wt,r=this.seed*3.71;for(let c of this.b.values()){let u=Ii(c.geos);if(!c.raw&&n>0&&u.attributes.color){let f=u.attributes.position,p=u.attributes.normal,d=u.attributes.color.array;for(let v=0;v<f.count;v++){let g=f.getX(v),x=f.getY(v),y=f.getZ(v),b=p.getY(v),m=gn(g*1.9+r,x*1.9,y*1.9+5.3),A=gn(g*9+2.1,x*9+r,y*9),_=(.82+.18*m)*(.92+.08*A)*(.76+.24*zi(b*.6+.62,0,1)),M=zi(1-x/.2,0,1);_*=1-.42*M*M*(.55+.45*A),_=1+(_-1)*n,d[v*3]*=_,d[v*3+1]*=_*(1-.05*M*n),d[v*3+2]*=_*(1-.12*M*n)}}let h=new Qe(u,c.mat);h.castShadow=c.cast,h.receiveShadow=!0,o.add(h)}let a=Gi[this.name]||[1,1,1,"","metal"],l=e||[a[0],a[1],a[2]];return o.userData.size=l,o.userData.colliders=t||[{min:[-l[0]/2,0,-l[2]/2],max:[l[0]/2,l[1],l[2]/2],surface:s||a[4]}],o}},X3=new Map;
function wf(i,e){let t=X3.get(i);return t||(t=e(),X3.set(i,t)),t.clone(!0)}
var j3=(i,e,t)=>{let n=zi((t-i)/(e-i),0,1);return n*n*(3-2*n)};
function $3(i,e,t=0,n=0){let s=new lt.PlaneGeometry(i,e),o=s.attributes.uv,r=s.attributes.position;for(let a=0;a<o.count;a++)o.setXY(a,r.getX(a)+t,r.getY(a)+n);return s}
var w1={pz:[0,0,0],nz:[0,At,0],px:[0,tt,0],nx:[0,-tt,0]};
function OA(i){let t=[[0,.016],[.262,.016],[.262,.016],[.268,.002],[.288,0],[.295,.008],[.295,.022],[.284,.034]];for(let n of[.305,.595])t.push([.283,n-.03],[.291,n-.018],[.297,n],[.291,n+.018],[.283,n+.03]);return t.push([.284,.866],[.295,.878],[.295,.892],[.288,.9],[.268,.898]),i?t.push([.268,.898],[.272,.888],[.272,.03],[.272,.03],[0,.03]):t.push([.262,.884],[.262,.884],[0,.884]),t}
function HA(i,e,t){let n=new Kn(i,"barrel",t),s=n.rng,o=22,[r,a]=Ja(e.color,"blue");e.lying&&n.push({p:[-.45,.297,0],r:[0,0,-tt]});let l=us(OA(!!e.open),o),c=[];for(let d=0;d<2+t%2;d++)c.push([s()*At*2,s.range(.12,.78),s.range(.07,.13),s.range(.006,.014)]);to(l,d=>{let v=Math.hypot(d.x,d.z);if(v<.27)return;let g=Math.atan2(d.z,d.x);for(let x of c){let y=Math.abs(g-x[0])%(At*2);y>At&&(y=At*2-y);let b=Math.hypot(y*.285,d.y-x[1]);if(b<x[2]){let m=1-x[3]*(.5+.5*Math.cos(At*b/x[2]))/v;d.x*=m,d.z*=m}}}),l.computeVertexNormals();let u=l.attributes.normal,h=l.attributes.position.count/(o+1);for(let d=0;d<h;d++){let v=d*(o+1),g=v+o,x=u.getX(v)+u.getX(g),y=u.getY(v)+u.getY(g),b=u.getZ(v)+u.getZ(g),m=Math.hypot(x,y,b)||1;u.setXYZ(v,x/m,y/m,b/m),u.setXYZ(g,x/m,y/m,b/m)}let f=t*2.37,p=e.color==="rust";return n.add(r,l,null,(d,v,g)=>{let x=Math.hypot(d,g),y=Math.atan2(g,d);if(x<.27){let w=v>.5?.62+.3*gn(d*9+f,g*9):.6;return[w,w,w]}let b=Math.pow(gn(y*2.6+f,3.1),2.2),m=v>.6?(.88-v)/.28:v>.31?(.6-v)/.29:(.31-v)/.31,A=1-.55*b*(1-.6*zi(m,0,1)),M=(x>.289?1:0)*(.35+.65*gn(y*7+f,v*20)),E=[A*(1-.25*M),A*(1-.42*M),A*(1-.55*M)];return typeof a!="number"&&(E[0]*=a[0],E[1]*=a[1],E[2]*=a[2]),E}),e.open||(n.add("steel_galv",ot(.036,.038,.016,8),{p:[.17,.891,.02]},.8),n.add("steel_galv",ot(.017,.018,.014,8),{p:[-.16,.89,-.08]},.8)),!p&&t%3!==2&&n.cdecal(i.mats.decal("hazard_flammable"),.2855,.15,{p:[0,.455,0],r:[0,.9+t,0]}),t%2===0&&n.cdecal(i.mats.label("UN 1202",{color:p||e.color==="white"||e.color==="yellow"?"black":"white",font:"stencil",distress:.5}),.2855,.2,{p:[0,.74,0],r:[0,2.6+t,0]}),n.finish(e.lying?{size:[.9,.6,.6]}:{})}
function S1(i,e,{broken:t=!1,stamp:n=!0,bevel:s=!1}={}){let o=s?(u,h,f)=>Ge(u,h,f,.004):(u,h,f)=>$e(u,h,f),r=()=>{let u=e.range(.62,1),h=e.range(.9,1);return[u,u*(.93+.07*h),u*(.82+.18*h)]},a=(u=.003)=>e.range(-u,u);for(let[u,h]of[[-.45,.1],[0,.145],[.45,.1]])i.add("wood_pallet",o(1.2,.022,h),{p:[a(),.011,u+a()],r:[0,a(.006),0]},r());let l=(u,h,f=.012)=>[[-u/2+f,-h/2],[u/2-f,-h/2],[u/2,-h/2+f],[u/2,h/2-f],[u/2-f,h/2],[-u/2+f,h/2],[-u/2,h/2-f],[-u/2,-h/2+f]];for(let u of[-.5275,0,.5275])for(let h of[-.45,0,.45])i.add("wood_pallet",Mo(l(.145,h===0?.145:.1),.078,{caps:!1,soft:0}),{p:[u+a(),.061,h+a()],r:[-tt,a(.03),0]},r().map(f=>f*.8));for(let u of[-.5275,0,.5275])i.add("wood_pallet",o(.145,.022,1),{p:[u+a(),.111,a()],r:[0,a(.006),0]},r());if([[-.4275,.145],[-.215,.1],[0,.145],[.215,.1],[.4275,.145]].forEach(([u,h],f)=>{t&&f===3||i.add("wood_pallet",o(1.2,.022,h),{p:[a(),.133,u+a(.006)],r:[a(.004),a(.008),0]},r())}),n){let u=i.G.mats.label("EUR",{color:"black",font:"sans",distress:.6});i.decal(u,.085,{p:[-.5275,.062,.5015]}),i.decal(u,.085,{p:[.5275,.062,-.5015],r:[0,At,0]})}}
function VA(i,e,t){let n=new Kn(i,"pallet",t);return S1(n,n.rng,{broken:!!e.broken,bevel:!0}),n.finish()}
function WA(i,e){let t=new Kn(i,"pallet_stack",e.seed||0),n=t.rng,s=zi(e.count|0||8,1,12);for(let o=0;o<s;o++){let r=o===s-1;t.push({p:[o?n.range(-.028,.028):0,o*.144,o?n.range(-.022,.022):0],r:[0,n.range(-.035,.035)+(n()<.3?At:0)+(r?n.range(-.06,.06):0),0]}),S1(t,n,{broken:!r&&n()<.2,stamp:o%3===0,bevel:r}),t.pop()}return t.finish({size:[1.2,s*.144,1]})}
function E1(i,e,t,n,{detail:s=!0,label:o="易碎物品",code:r="B4-117",skids:a=!0}={}){let l=i.rng,c=i.G,u=.022,h=.07,f=a?.07:0,p=t-f,d=f+p/2,v=(z=1)=>{let H=l.range(.7,1)*z;return[H,H*l.range(.92,1),H*l.range(.82,.95)]},g=s?(z,H,O)=>Ge(z,H,O,.004):(z,H,O)=>$e(z,H,O);if(a)for(let z of[-(e/2-.13),0,e/2-.13])i.add("wood_pallet",Ge(.09,f,n-.02,.006),{p:[z,f/2,0]},v(.6));i.add("wood_dark",$e(e-2*u-.012,p-u-.012,n-2*u-.012),{p:[0,f+(p-u-.012)/2+.002,0]},.25);let x=Math.max(3,Math.round(p/.125)),y=p/x;for(let z=0;z<x;z++){let H=f+y*(z+.5);for(let[O,q,U]of[["pz",e,n/2-u],["nz",e,n/2-u],["px",n,e/2-u],["nx",n,e/2-u]]){let T=U-l.range(0,.004),D=O==="pz"?[0,H,T]:O==="nz"?[0,H,-T]:O==="px"?[T,H,0]:[-T,H,0];i.add("wood_pallet",$3(q-.03,y-.005,l()*3,l()*3),{p:D,r:w1[O]},v())}}let b=Math.max(3,Math.round(n/.13)),m=(n-.02)/b;for(let z=0;z<b;z++)i.add("wood_pallet",$3(e-.03,m-.005,l()*3,l()*3),{p:[0,t-u-l.range(0,.003),-n/2+.01+m*(z+.5)],r:[-tt,0,0]},v());let A=Math.atan2(p-2*h,e-2*h),_=Math.hypot(e-2*h,p-2*h);for(let z of[1,-1]){let H=z*(n/2-u/2);i.add("wood_pallet",g(e,h,u),{p:[0,f+h/2,H]},v(.85)),i.add("wood_pallet",g(e,h,u),{p:[0,t-h/2,H]},v(.85));for(let U of[1,-1])i.add("wood_pallet",g(h,p-2*h,u),{p:[U*(e/2-h/2),d,H]},v(.85));s&&i.add("wood_pallet",Ge(_,h*.85,u*.8,.004),{p:[0,d,z*(n/2-u*.6)],r:[0,0,z*A]},v(.8));let O=z*(e/2-u/2),q=n-2*u;for(let U of[1,-1])i.add("wood_pallet",g(u,p,h),{p:[O,d,U*(q/2-h/2)]},v(.85));i.add("wood_pallet",g(u,h,q-2*h),{p:[O,f+h/2,0]},v(.85)),i.add("wood_pallet",g(u,h,q-2*h),{p:[O,t-h/2,0]},v(.85)),i.add("wood_pallet",g(e,u,h),{p:[0,t-u/2,z*(n/2-h/2)]},v(.85)),i.add("wood_pallet",g(h,u,n-2*h),{p:[z*(e/2-h/2),t-u/2,0]},v(.85))}s&&i.add("wood_pallet",Ge(h,u,n-2*h,.004),{p:[0,t-u/2,0]},v(.85));let M=.085,E=()=>{let z=l.range(.55,.9);return[z,z*.9,z*.8]};for(let z of[1,-1])for(let H of[1,-1])for(let O of s?[1,0]:[1]){let q=O?t-M/2:f+M/2,U=E();i.add("steel_galv",$e(M,M,.003),{p:[z*(e/2-M/2),q,H*(n/2+.0015)]},U),i.add("steel_galv",$e(.003,M,M),{p:[z*(e/2+.0015),q,H*(n/2-M/2)]},U),O&&i.add("steel_galv",$e(M,.003,M),{p:[z*(e/2-M/2),t+.0015,H*(n/2-M/2)]},U)}let w=n/2-u+.003,S=Math.min(.11,p*.15);o&&(i.label(o,{color:"black",font:"stencil",distress:.25},e*.4,S,{p:[-e*.2,t-h-S*.95,w]}),i.label(o,{color:"black",font:"stencil",distress:.25},e*.4,S,{p:[e*.2,t-h-S*.95,-w],r:[0,At,0]}),i.decal(c.mats.decal("arrow"),Math.min(.14,p*.2),{p:[e*.27,f+h+p*.16,w],r:[0,0,tt]})),r&&i.label(r,{color:"black",font:"stencil",distress:.3},n*.5,S*.9,{p:[e/2-u+.003,d+p*.12,0],r:w1.px}),s&&i.decal(c.mats.decal("logo_b"),Math.min(.2,p*.25),{p:[-(e/2-u+.003),d-p*.05,0],r:w1.nx})}
function GA(i,e){let t=new Kn(i,"crate_wood",e.seed||0);return E1(t,1.1,1,.9,{label:e.label===void 0?["易碎物品","此面向上","保持干燥","机械零件"][t.seed%4]:e.label,code:e.code||"B4-"+[117,204,318][t.seed%3]}),t.finish()}
function qA(i,e){let t=new Kn(i,"crate_stack",e.seed||0),n=t.rng;E1(t,1.2,.95,1,{label:"重物",code:"几猫04"+t.seed%2});let s={x:n.range(-.1,.02),z:n.range(-.05,.05),th:(n()<.5?-1:1)*n.range(.1,.16),L:.86,W:.72};t.push({p:[s.x,.95,s.z],r:[0,s.th,0]}),E1(t,s.L,.6,s.W,{detail:!1,skids:!1,label:"易碎物品",code:"B4-204"}),t.pop();let o={x:s.x+n.range(-.05,.05),z:s.z+n.range(-.04,.04),th:n.range(-.12,.12)};t.push({p:[o.x,1.55,o.z],r:[0,o.th,0]}),E1(t,.55,.35,.45,{detail:!1,skids:!1,label:"",code:""}),t.pop();let r=(a,l,c,u,h)=>{let f=(a-l.x-h*u*Math.sin(c))/Math.cos(c);return l.z-f*Math.sin(c)+h*u*Math.cos(c)};for(let a of[-.2,.17]){let c=[],u=h=>[[a,.09,h*.506],[a,.956,h*.506],[a,1.556,r(a,s,s.th,s.W/2,h)+h*.006],[a,1.906,r(a,o,o.th,.225,h)+h*.006]];c.push(...u(1),...u(-1).reverse()),t.add("paint_orange",vr(c,[.02,0,0]),null,[1,.8,.5]),t.add("steel_worn",Ge(.06,.09,.025,.006),{p:[a,.62,.5+.016]},.8),t.add("steel_dark",vn([a-.035,.66,.53],[a+.035,.66,.53],.008,6,!0),null,.8)}return t.finish()}
function XA(i,e){let t=new Kn(i,"ibc_tote",e.seed||0),n=t.rng,s=()=>n.range(.75,1);for(let y of[-.44,0,.44])t.add("steel_galv",$e(1.2,.028,.1),{p:[0,.014,y]},s());for(let y of[-.54,0,.54])for(let b of[-.44,0,.44])t.add("steel_galv",Ge(.12,.074,.1,.008),{p:[y,.065,b]},s()*.85);for(let y of[-.48,.48])t.add("steel_galv",Ge(1.2,.03,.04,.006),{p:[0,.115,y]},s());for(let y of[-.58,.58])t.add("steel_galv",Ge(.04,.03,.92,.006),{p:[y,.115,0]},s());t.add("steel_galv",$e(1.12,.012,.92),{p:[0,.124,0]},.6);let o=1.1,r=.95,a=.9,l=.13+r/2,c=eo(o,r,a,.07,8,6,8);to(c,y=>{let b=y.x/(o/2),m=y.y/(r/2),A=y.z/(a/2),_=Math.cos(tt*m)*Math.cos(tt*A),M=Math.cos(tt*b)*Math.cos(tt*A),E=Math.cos(tt*b)*Math.cos(tt*m);Math.abs(b)>.9&&(y.x+=Math.sign(b)*(.016*_+.004*Math.abs(Math.sin(y.y*At/.22))*_)),Math.abs(A)>.9&&(y.z+=Math.sign(A)*(.016*E+.004*Math.abs(Math.sin(y.y*At/.22))*E)),m>.9&&(y.y+=.012*M-.01*Math.max(0,1-Math.hypot(y.x,y.z)/.3))}),gr(c);let u=.13+r*n.range(.45,.8),h=t.seed*1.3,f=t.mat("plastic_grey",{color:14278096});t.add(f,c,{p:[0,l,0]},(y,b,m)=>{let A=j3(u-.03,u+.03,b+.02*gn(y*3+h,m*3)),_=.9+.1*gn(y*6,b*6+h,m*6);return[_*(.52+.48*A),_*(.6+.4*A),_*(.66+.34*A)]}),t.add(f,ot(.12,.125,.03,14),{p:[0,.13+r+.005,0]},.9),t.add("plastic_red",us([[.105,0],[.105,.042],[.105,.042],[.09,.05],[0,.05]],14),{p:[0,.13+r+.015,0]},.9);for(let y=0;y<8;y++){let b=y*At/4;t.add("plastic_red",$e(.012,.04,.02),{p:[Math.cos(b)*.108,.13+r+.036,Math.sin(b)*.108],r:[0,-b,0]},.8)}let p=.575,d=.475,v=.13,g=1.1,x=.011;for(let y of[.2,.42,.64,.86,g]){let b=y===g?.014:x;for(let m of[1,-1])t.add("steel_galv",vn([-p,y,m*d],[p,y,m*d],b,5),null,s()),t.add("steel_galv",vn([m*p,y,-d],[m*p,y,d],b,5),null,s())}for(let y of[1,-1]){for(let b=-.46;b<=.461;b+=.184)t.add("steel_galv",vn([b,v,y*(d-.012)],[b,g,y*(d-.012)],x,5),null,s());for(let b=-.36;b<=.361;b+=.18)t.add("steel_galv",vn([y*(p-.012),v,b],[y*(p-.012),g,b],x,5),null,s());t.add("steel_galv",vn([y*.28,g+.01,-d],[y*.28,g+.01,d],.013,5),null,s())}return t.add("aluminium",Ge(.42,.3,.004,.0015),{p:[-.1,.72,d+.014]},.85),t.label("储液箱 1000 升",{color:"black",font:"sans",distress:.2},.36,.06,{p:[-.1,.8,d+.0175]}),t.decal(i.mats.decal(["hazard_flammable","hazard_general"][t.seed%2]),.15,{p:[-.19,.67,d+.0175]}),t.decal(i.mats.decal("numbers_0_9"),.2,{p:[0,.66,d+.0175]}),t.decal(i.mats.decal("leak_stain"),.3,{p:[p+.004,.3,.02],r:w1.px}),t.add("polymer_black",vn([.52,.2,0],[.575,.2,0],.05,10,!0),null,1),t.add("plastic_red",vn([.575,.2,0],[.598,.2,0],.045,10,!0),null,.9),t.add("plastic_red",Ge(.02,.022,.13,.005),{p:[.55,.262,.02],r:[0,.4,0]},.9),t.add("polymer_black",ot(.012,.012,.03,6),{p:[.55,.245,0]}),t.finish()}
function Z3(i,e,t,n=0){let s=[],o=2*i/e;for(let r=0;r<e;r++){let a=-i+r*o+.003,l=-i+(r+1)*o-.003,c=[a,(a+l)/2,l],u=[],h=[],f=[],p=[],d=y=>Math.sqrt(Math.max(0,i*i-y*y)),v=t()*2,g=t()*2;for(let y of c)u.push(y,-d(y),0,y,d(y),0),h.push(0,0,1,0,0,1),f.push(-d(y)+v,y+g,d(y)+v,y+g);p.push(0,2,3,0,3,1,2,4,5,2,5,3);let x=new lt.BufferGeometry;x.setAttribute("position",new lt.BufferAttribute(new Float32Array(u),3)),x.setAttribute("normal",new lt.BufferAttribute(new Float32Array(h),3)),x.setAttribute("uv",new lt.BufferAttribute(new Float32Array(f),2)),x.setIndex(p),s.push(x)}return s}
function YA(i,e){let t=new Kn(i,"cable_reel",e.seed||0),n=t.rng,s=.65,o=s,r=.4,a=.045,l=(y=1)=>{let b=n.range(.7,1)*y;return[b,b*n.range(.93,1),b*n.range(.85,.97)]},c=n.range(-.5,.5);t.push({p:[0,o,0],r:[0,0,c]});for(let y of[1,-1]){for(let b of Z3(s-.004,9,n))t.add("wood_dark",b,{p:[0,0,y*(r+n.range(0,.003))],r:[0,y>0?0:At,0]},l());for(let b of Z3(s-.004,9,n))t.add("wood_dark",b,{p:[0,0,y*(r-a)],r:[0,y>0?At:0,tt]},l(.8));t.add("wood_dark",ot(s,s,a,24,!0),{p:[0,0,y*(r-a/2)],r:[tt,0,0]},l(.75)),t.add("steel_dark",ot(.105,.105,.008,12),{p:[0,0,y*(r+.006)],r:[tt,0,0]},.9),t.add("polymer_black",ot(.04,.04,.004,10),{p:[0,0,y*(r+.0105)],r:[tt,0,0]},.3);for(let b=0;b<6;b++){let m=b*At/3+.3;t.add("steel_galv",ot(.017,.017,.014,6),{p:[Math.cos(m)*.3,Math.sin(m)*.3,y*(r+.006)],r:[tt,0,0]},n.range(.5,.9))}t.label(y>0?"NYY-J 4x95 mm2  500 m":"几猫港区",{color:"white",font:"stencil",distress:.45},.7,.085,{p:[0,.4,y*(r+.006)],r:[0,y>0?0:At,0]}),y>0&&t.decal(i.mats.decal("arrow"),.2,{p:[.36,-.2,r+.006],r:[0,0,-1.2]})}let u=16,h=r-a,f=2*h/u,p=.47,d=[];for(let y=0;y<=u;y++)d.push([p-.017,-h+y*f]),y<u&&d.push([p,-h+(y+.5)*f]);let v=t.seed*.7;t.add("rubber",us(d,20),{r:[tt,0,0]},(y,b,m)=>.7+.5*gn(Math.atan2(b,y)*2+v,m*30)),t.pop();let g=.2,x=[];for(let y=1.9;y>=-.25;y-=.36)x.push([Math.cos(y)*(p+.012),o+Math.sin(y)*(p+.012),g+(1.9-y)*.02]);x.push([.53,.3,g+.05],[.56,.08,g+.06],[.5,.024,g+.02],[.3,.022,g-.1],[.05,.022,g-.02],[-.2,.022,g+.06],[-.38,.022,g-.05]),t.add("rubber",Fn(x,.02,6,!1,.5),null,.9),t.add("brass",vn([-.38,.022,g-.05],[-.41,.022,g-.07],.014,6,!0),null,.9);for(let y of[r-a/2,-(r-a/2)])t.add("wood_pallet",Mo([[.14,0],[.37,0],[.37,.1]],.1,{soft:0}),{p:[0,0,y]},l(.8)),t.add("wood_pallet",Mo([[-.37,0],[-.14,0],[-.37,.1]],.1,{soft:0}),{p:[0,0,y]},l(.8));return t.finish()}
function tv(i,e,t,n=20){let s=i-t,o=Math.min(.011,s*.08),r=[[t,e*.18],[t+s*.45,e*.035],[i-s*.2,e*.02],[i-s*.06,e*.07],[i,e*.17],[i,e*.17],[i,e*.355],[i-o,e*.385],[i,e*.415],[i,e*.585],[i-o,e*.615],[i,e*.645],[i,e*.83],[i,e*.83],[i-s*.06,e*.93],[i-s*.2,e*.98],[t+s*.45,e*.965],[t,e*.82],[t,e*.82],[t,e*.18]],a=us(r,n),l=a.attributes.uv,c=r.length,u=[0];for(let v=1;v<c;v++)u.push(u[v-1]+Math.hypot(r[v][0]-r[v-1][0],r[v][1]-r[v-1][1]));let h=(u[8]+u[9])/2,f=h-u[4],p=u[4]-u[0],d=Math.max(1,Math.round(2*At*i/.5))*.5;for(let v=0;v<c;v++){let g=v>=c-2?-(f+p):u[v]-h,x=Math.abs(g),y=Math.sign(g)*(x<=f+1e-6?x/f*.126:.126+Math.min(1,(x-f)/p)*.022);for(let b=0;b<=n;b++)l.setXY(v*(n+1)+b,b/n*d,y)}return a}
function $A(i,e){let t=new Kn(i,"tire_stack",e.seed||0),n=t.rng,s=zi(e.count|0||4,1,5);for(let o=0;o<s;o++){let r=tv(.39,.25,.215,s>4?16:20),a={p:[o?n.range(-.022,.022):0,o*.25-(o?.004:0),o?n.range(-.022,.022):0],r:[0,n()*6,0]},l=n.range(.75,1),c=o*3.1;t.add("tire",r,a,(u,h,f)=>{let p=Math.hypot(u-a.p[0],f-a.p[2]);return l*(p<.23?.5:.8+.2*gn(Math.atan2(f,u)*3+c,p*30))})}return t.finish({size:[.8,s*.25,.8]})}
function ZA(i,e,t){let n=new Kn(i,"jerry_can",t),[s,o]=Ja(e.color,"olive"),r=eo(.336,.36,.156,.022,3,3,3,"bottom"),a=(x,y)=>y>.3&&x>.04?y-(x-.04)*.5:y;to(r,x=>{x.y=a(x.x,x.y),Math.abs(x.z)>.07&&Math.abs(x.x)<.14&&x.y>.04&&x.y<.3&&(x.z*=1.02)}),r.computeVertexNormals(),n.add(s,r,null,o),n.add(s,Mo([[-.172,0],[.172,0],[.172,.297],[.045,.364],[-.172,.364]],.007,{soft:0}),null,typeof o=="number"?.8:o.map(x=>x*.8));let l=.24,c=.2,u=-.025,h=.165,f=Math.hypot(l,c)-.02,p=Math.atan2(c,l);for(let x of[1,-1]){let y=x*.079;for(let b of[1,-1])n.add(s,Ge(l,.016,.007,.003),{p:[u,h+b*c/2,y]},o);for(let b of[1,-1])n.add(s,Ge(.016,c,.007,.003),{p:[u+b*l/2,h,y]},o);for(let b of[1,-1])n.add(s,Ge(f,.018,.008,.003),{p:[u,h,y],r:[0,0,b*p]},o)}for(let x of[-.042,0,.042])n.add(s,Fn([[-.135,.35,x],[-.125,.42,x],[-.09,.44,x],[-.02,.44,x],[.01,.42,x],[.02,.35,x]],.0105,5,!1,.5),null,o);let d=[.1,.33,0],v=[.42,.9,0],g=x=>[d[0]+v[0]*x,d[1]+v[1]*x,0];return n.add(s,vn(g(-.02),g(.07),.03,8,!0),null,o),n.add("steel_dark",vn(g(.07),g(.1),.036,8,!0),null,.9),n.add("steel_galv",Ge(.07,.008,.02,.002),{p:g(.108),r:[0,0,-.44]},.8),n.decal(i.mats.decal("hazard_flammable"),.055,{p:[.125,.25,.0795]}),n.decal(i.mats.decal("hazard_flammable"),.055,{p:[-.125,.25,-.0795],r:[0,At,0]}),n.finish()}
function jA(i,e,t){let n=new Kn(i,"traffic_cone",t),s=n.rng,o=t*4.1;e.lying&&(n.push({p:[-.34,.18,0],r:[0,s()*6,0]}),n.push({r:[0,0,-tt+.16]}));let r=h=>.128+(.031-.128)*(h-.05)/(.685-.05);n.add("rubber",Ge(.36,.03,.36,.008,"bottom"),null,.9);let a=(h,f,p)=>{let d=gn(Math.atan2(p,h)*3+o,f*14);return d>.68?.45:.85+.15*d},l=(h,f,p=[],d=[])=>us([...p,[r(h),h],[r(f),f],...d],16),c=n.mat("plastic_red",{color:12734234}),u=n.mat("plastic_grey",{color:13224386});return n.add(c,l(.05,.36,[[.165,.03],[.15,.04],[.136,.05]]),null,a),n.add(u,l(.36,.5),null,(h,f,p)=>.85*a(h,f,p)),n.add(c,l(.5,.56),null,a),n.add(u,l(.56,.61),null,(h,f,p)=>.85*a(h,f,p)),n.add(c,l(.61,.685,[],[[.028,.696],[.018,.7],[.018,.7],[0,.7]]),null,a),e.lying&&(n.pop(),n.pop()),n.finish(e.lying?{size:[.72,.36,.36]}:{})}
function JA(i,e){let t=new Kn(i,"gas_cylinders",e.seed||0),n=t.rng,s=12,o=()=>n.range(.6,.9);t.add("diamond_plate",Ge(.9,.016,.5,.004,"bottom"),null,.8);for(let u of[-.43,.43])t.add("steel_dark",Ge(.04,1.14,.04,.005),{p:[u,.585,-.225]},o()),t.add("steel_dark",Ge(.036,.036,.43,.005),{p:[u,1.06,-.01]},o()),t.add("steel_dark",Ge(.036,.036,.43,.005),{p:[u,.3,-.01]},o()),t.add("steel_dark",Ge(.036,.32,.036,.005),{p:[u,.16,.19]},o()),t.add("steel_galv",ja(.016,.004,4,8),{p:[u-Math.sign(u)*0,1.06,.215],r:[0,tt,0]},.8);for(let u of[.45,1.06])t.add("steel_dark",Ge(.9,.04,.036,.005),{p:[0,u,-.225]},o());t.add("paint_yellow",Ge(.3,.2,.004,.001),{p:[0,.76,-.245]},.9),t.decal(i.mats.decal("hazard_flammable"),.15,{p:[0,.76,-.2475],r:[0,At,0]});let r=[["paint_red",1],["paint_white",1],["paint_blue",1],["paint_yellow",1],["paint_grey",.5]],a=[["paint_grey",.75],["paint_grey",.55],["paint_red",[.55,.4,.4]],["paint_blue",.8]];for(let u=0;u<3;u++){let h=(u-1)*.272,f=1-n.range(0,.05),p=.115,d=r[(t.seed+u*2)%r.length],v=a[(t.seed+u)%a.length],g=u*5.3+t.seed,x=n()*6;t.push({p:[h,.016,.015+n.range(-.01,.01)],r:[0,x,0],s:[1,f,1]}),t.add(v[0],us([[0,.012],[.095,.012],[.095,.012],[.1,0],[.111,0],[p,.008],[p,.4],[p,.8],[p,1.22]],s),null,(y,b,m)=>{let A=gn(Math.atan2(m,y)*3+g,b*5),_=A>.7?.55:1,M=typeof v[1]=="number"?[v[1],v[1],v[1]]:v[1];return[M[0]*_,M[1]*_*(A>.7?.85:1),M[2]*_*(A>.7?.7:1)]}),t.add(d[0],us([[p,1.22],[.111,1.285],[.098,1.34],[.075,1.385],[.052,1.41],[.04,1.42]],s),null,d[1]),t.add("steel_dark",us([[.04,1.42],[.057,1.42],[.057,1.42],[.057,1.448],[.057,1.448],[.05,1.452],[.053,1.53],[.046,1.565],[.026,1.585],[0,1.588]],s),null,.8);for(let y of[0,At])t.add("polymer_black",ot(.016,.016,.004,6),{p:[Math.cos(y)*.052,1.5,Math.sin(y)*.052],r:[0,-y,tt]},.2);u!==1&&t.cdecal(i.mats.decal(u?"hazard_general":"hazard_flammable"),p+.0015,.1,{p:[0,1.08,0],r:[0,n.range(-.5,.5)-x,0]}),t.cdecal(i.mats.label(["乙炔","氧气","氩气","丙烷"][(t.seed+u)%4],{color:"white",font:"stencil",distress:.4}),p+.0015,.2,{p:[0,.86,0],r:[0,n.range(-.4,.4)-x,0]}),t.pop()}let l=19,c=u=>{let h=.215;for(let f=-1;f<=1;f++){let p=u-f*.272;Math.abs(p)<.115&&(h=Math.max(h,.015+Math.sqrt(.123*.123-p*p)+0))}return Math.max(h,.1)};for(let u=0;u<l;u++){let h=u/(l-1),f=-.425+.85*h,p=Math.max(c(f),c(f-.03),c(f+.03))+.004,d=1.05-.035*Math.sin(At*(h*3%1))-.01;t.add("steel_galv",ja(.017,.0045,3,6),{p:[f,d,p],r:[u%2?tt:.15,0,0],s:[1.35,1,1]},n.range(.6,.95))}return t.finish()}
function KA(i,e){let t=new Kn(i,"pipe_stack",e.seed||0),n=t.rng,s=.1365,o=.012,r=.08,a=14,l=(h=1)=>{let f=n.range(.6,.95)*h;return[f,f*.95,f*.86]};for(let h of[-2.2,0,2.2]){t.add("wood_dark",Ge(.11,r,1.2,.008),{p:[h+n.range(-.1,.1),r/2,0],r:[0,n.range(-.03,.03),0]},l());for(let f of[1,-1])t.add("wood_pallet",Mo(f>0?[[0,0],[.158,0],[.158,.1]]:[[-.158,0],[0,0],[-.158,.1]],.1,{soft:0}),{p:[h,r,f*.44],r:[0,-tt,0]},l(.9))}let c=[4,3,2],u=2*s*Math.sin(At/3);c.forEach((h,f)=>{for(let p=0;p<h;p++){let d=(p-(h-1)/2)*2*s,v=r+s+f*u,g=n.range(5.78,5.92),x=n.range(-3,3-g)*.999+0,y=Math.max(-3,Math.min(3-g,x))+g/2,b=n()<.7?"steel_rust":"steel_dark",m=n()*50,A=n.range(.75,1),_=new lt.CylinderGeometry(s,s,g,a,4,!0);{let w=_.attributes.uv,S=_.attributes.position;for(let z=0;z<w.count;z++)w.setXY(z,w.getX(z)*2*At*s,S.getY(z))}let M={p:[y,v,d],r:[n()*6,0,tt]};t.add(b,_,M,(w,S,z)=>A*(.75+.35*gn(w*1.3+m,z*9,S*9)));let E=M1(ot(s-o,s-o,g-.002,a,!0));t.add("steel_rust",E,M,w=>.16+.5*j3(g/2+Math.abs(y)-.9,g/2+Math.abs(y)+.2,Math.abs(w-y)+Math.abs(y)));for(let w of[1,-1])t.add(b,us(w>0?[[s,0],[s-o,0]]:[[s-o,0],[s,0]],a),{p:[y+w*g/2,v,d],r:[0,0,-tt]},A*1.1)}});for(let h of[-1.35,1.5]){let p=2*s,d=r+s+2*u+s+.004,v=[],g=[[-(1.5*p+s+.004),r+s],[-(.5*p+s*.5+.004),r+s+2*u+s*.87],[-.5*p,d],[.5*p,d],[.5*p+s*.5+.004,r+s+2*u+s*.87],[1.5*p+s+.004,r+s],[1.5*p,r-.004],[-1.5*p,r-.004],[-(1.5*p+s+.004),r+s]];for(let x of g)v.push([h,x[1],x[0]]);t.add("steel_dark",vr(v,[.016,0,0]),null,.7),t.add("steel_galv",Ge(.04,.012,.05,.003),{p:[h,d+.005,.03]},.8)}return t.cdecal(i.mats.label("API 5L X52  273.1 x 12.5  HEAT 40719",{color:"white",font:"stencil",distress:.5}),s+.002,.2,{p:[.9,r+s+2*u,s],r:[-tt+.9,0,tt]},1.6),t.finish()}
function J3(i){i("barrel",(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`,()=>HA(e,t,n))}),i("pallet",(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`pallet|${!!t.broken}|${n}`,()=>VA(e,t,n))}),i("pallet_stack",(e,t={})=>WA(e,t)),i("crate_wood",(e,t={})=>GA(e,t)),i("crate_stack",(e,t={})=>qA(e,t)),i("ibc_tote",(e,t={})=>XA(e,t)),i("cable_reel",(e,t={})=>YA(e,t)),i("tire_stack",(e,t={})=>$A(e,t)),i("jerry_can",(e,t={})=>{let n=Math.abs(t.seed|0)%2;return wf(`jerry|${t.color}|${n}`,()=>ZA(e,t,n))}),i("traffic_cone",(e,t={})=>{let n=Math.abs(t.seed|0)%3;return wf(`cone|${!!t.lying}|${n}`,()=>jA(e,t,n))}),i("gas_cylinders",(e,t={})=>JA(e,t)),i("pipe_stack",(e,t={})=>KA(e,t))}
var Q3=(i,e,t)=>{let n=zi((t-i)/(e-i),0,1);return n*n*(3-2*n)};
function nv(i,e,t=0,n=0){let s=new lt.PlaneGeometry(i,e),o=s.attributes.uv,r=s.attributes.position;for(let a=0;a<o.count;a++)o.setXY(a,r.getX(a)+t,r.getY(a)+n);return s}
function QA(i,e){let t=new Kn(i,"tarp_cargo",e.seed||0),n=t.rng,s=t.seed*1.7,o=.144,r=[[-1.06,-.12,-.58,.58,n.range(.98,1.12)],[-.06,1.06,-.58,.12,n.range(1.32,1.42)],[.02,.62,.16,.58,n.range(.72,.86)],[.66,1.06,.18,.56,n.range(.5,.62)]];for(let N of[-.6,.6])t.push({p:[N,0,0],r:[0,0,0]}),S1(t,n,{stamp:!1}),t.pop();for(let N of r){let Q=N[1]-N[0],K=N[3]-N[2],ie=N[4]-o,F=(N[0]+N[1])/2,X=(N[2]+N[3])/2,ne=n.range(.7,.95);t.add("wood_pallet",Ge(Q,ie,K,.006),{p:[F,o+ie/2,X]},[ne,ne*.95,ne*.88]),t.add("wood_pallet",$e(Q+.012,.07,K+.012),{p:[F,o+.04,X]},ne*.75)}let a=1.9,l=22,c=14,u=-1.125,h=1.125,f=-.645,p=.645,d=5,v=(N,Q)=>{let K=.3;for(let ie of r){let F=Math.max(ie[0]-N,0,N-ie[1]),X=Math.max(ie[2]-Q,0,Q-ie[3]),ne=Math.hypot(F,X);K=Math.max(K,ie[4]-.95*ne-.9*ne*ne)}return K+.016+.022*gn(N*5+s,Q*5)+.008*Math.sin(N*23+Q*7+s)+.006*Math.sin(Q*31-N*5)},g=[],x=[],y=[],b=(N,Q)=>Q*(l+1)+N;for(let N=0;N<=c;N++)for(let Q=0;Q<=l;Q++){let K=u+(h-u)*Q/l,ie=f+(p-f)*N/c;g.push(K,v(K,ie),ie),x.push(K*a,ie*a)}for(let N=0;N<c;N++)for(let Q=0;Q<l;Q++){let K=b(Q,N),ie=b(Q+1,N),F=b(Q+1,N+1),X=b(Q,N+1);y.push(K,X,ie,ie,X,F)}let m=[];for(let N=0;N<l;N++)m.push([N,0,0,-1]);for(let N=0;N<c;N++)m.push([l,N,1,0]);for(let N=l;N>0;N--)m.push([N,c,0,1]);for(let N=c;N>0;N--)m.push([0,N,-1,0]);let A=m.length,_=(l+1)*(c+1),M=new Map,E=n()*A;m.forEach((N,Q)=>{M.set(N[0]+","+N[1],Q);let K=(N[0]===0||N[0]===l)&&(N[1]===0||N[1]===c),ie=N[2],F=N[3];K&&(ie=N[0]===0?-.707:.707,F=N[1]===0?-.707:.707);let X=b(N[0],N[1]),ne=g[X*3],re=g[X*3+1],$=g[X*3+2],ue=Math.abs(Q-E);ue=Math.min(ue,A-ue);let me=.17+.07*Math.sin(Q*.55+s)+.07*gn(Q*.31+s,2.2)+.3*Math.exp(-ue*ue/14),ee=n()*6;for(let B=1;B<=d;B++){let P=B/d,V=re+(me-re)*(.25*P+.75*P*P)-(B===1?.02:0),Y=(N[0]===5||N[0]===16)&&N[2]===0?.035*Math.sin(Math.PI*P):0,L=P*(.04*Math.sin(Q*1.7+ee*.2)+.028*Math.sin(Q*.83+1.3+s))+.02*P*gn(Q*.8,B*.9+s)-Y,Z=(B===1?.028:.04+.03*P)+L+(K?.012*P:0),J=zi(ne+ie*Z,-1.2,1.2),oe=zi($+F*Z,-.7,.7),fe=re-V;g.push(J,V,oe),x.push((ne+ie*(Z+fe))*a,($+F*(Z+fe))*a)}});let w=(N,Q)=>Q===0?b(m[N][0],m[N][1]):_+N*d+(Q-1);for(let N=0;N<A;N++)for(let Q=0;Q<d;Q++){let K=(N+1)%A,ie=w(N,Q),F=w(K,Q),X=w(K,Q+1),ne=w(N,Q+1);y.push(ie,F,ne,F,X,ne)}let S=new lt.BufferGeometry;S.setAttribute("position",new lt.BufferAttribute(new Float32Array(g),3)),S.setAttribute("uv",new lt.BufferAttribute(new Float32Array(x),2)),S.setIndex(y),S.computeVertexNormals();let z=S.attributes.normal,H=S.attributes.position,O=(N,Q)=>[H.getX(N)+z.getX(N)*Q,H.getY(N)+z.getY(N)*Q,H.getZ(N)+z.getZ(N)*Q],q=[];for(let N of[5,16]){let Q=[],K=M.get(N+",0"),ie=M.get(N+","+c);Q.push([H.getX(w(K,d)),.11,-.52]);for(let F=d;F>=1;F--)Q.push(O(w(K,F),.007));for(let F=0;F<=c;F++)Q.push(O(b(N,F),.007));for(let F=1;F<=d;F++)Q.push(O(w(ie,F),.007));Q.push([H.getX(w(ie,d)),.11,.52]),q.push(Q)}let U=6,T=[],D=M.get("0,"+U),C=M.get(l+","+U);T.push([-1.1,.1,H.getZ(w(D,d))]);for(let N=d;N>=1;N-=2)T.push(O(w(D,N),.012));for(let N=0;N<=l;N+=2)T.push(O(b(N,U),.012));for(let N=1;N<=d;N+=2)T.push(O(w(C,N),.012));T.push([1.1,.1,H.getZ(w(C,d))]),t.add(t.mat("tarp",{doubleSide:!0}),S,null,(N,Q,K)=>{let ie=gn(N*2.3+s,Q*2.3,K*2.3),F=gn(N*11,Q*11,K*11+s);return(.72+.28*ie)*(.9+.1*F)*(.8+.2*Q3(.15,.6,Q))});for(let N of q){t.add("paint_orange",vr(N,[.024,0,0]),null,[1,.82,.5]);let Q=N[N.length-4];t.add("steel_worn",Ge(.065,.1,.03,.006),{p:[Q[0],Q[1],Q[2]+.014],r:[.25,0,0]},.8),t.add("steel_dark",Ge(.02,.09,.012,.003),{p:[Q[0]+.03,Q[1]+.06,Q[2]+.04],r:[.9,0,0]},.8)}t.add("rope",Fn(T,.009,4,!1,.5),null,.85);let G=[2.4,1.5,1.4],j=Math.max(...r.map(N=>N[4]))+.04;return t.finish({size:G,colliders:[{min:[-1.2,0,-.7],max:[1.2,j,.7],surface:"dirt"}]})}
function eR(i,e,t,n){let s=ev(eo(i,e,t,Math.min(e*.46,.075),3,3,3),3),o=n()*9,r=n.range(-.05,.05),a=n.range(.4,1);return to(s,l=>{let c=l.x/(i/2),u=l.z/(t/2),h=l.y/(e/2),f=1-.22*Math.pow(Math.abs(c),2.5);l.z*=f*(h<0?1.05:1),l.y=(l.y+e/2)*(1-.3*Math.pow(Math.abs(c),3))-e/2,h>0&&(l.y+=.016*Math.cos(tt*c)*Math.cos(tt*u)),l.y-=a*.018*Math.abs(c)*Math.abs(c)*(h>-.9?1:0)+r*l.x*.3;let p=gn(l.x*9+o,l.y*9,l.z*9+o)-.5;l.x+=p*.014,l.z+=p*.016,h>-.9&&(l.y+=p*.014)}),gr(s)}
function tR(i,e){let t=new Kn(i,"sandbags",e.seed||0),n=t.rng,s=.18,o=zi(e.courses|0||5,1,7),r=t.mat(K3[0],K3[1]),a=(l,c,u,h)=>{let f=s*n.range(1.02,1.12),p=n()<.3?n.range(.55,.75):n.range(.82,1),d=n()*30,v={p:[u[0]+n.range(-.012,.012),u[1]+f/2-.004,u[2]+n.range(-.012,.012)],r:[n.range(-.03,.03),h+n.range(-.06,.06),0]};t.add(r,eR(l,f,c,n),v,(g,x,y)=>{let b=gn(g*7+d,x*7,y*7);return[p*(.85+.15*b),p*(.84+.15*b),p*(.8+.16*b)]});for(let g of[1,-1])t.add(r,vr([[g*(l/2-.004),n.range(-.008,.008),-c*.27],[g*(l/2-.002),n.range(-.008,.008),c*.27]],[g*.009,.001,0]),v,p*.9)};for(let l=0;l<o;l++){let c=l*s,u=l===o-1;if(l%2===0)for(let h=0;h<3;h++)for(let f of[1,-1])u&&h===2&&f===1&&o>2||a(.655,.3,[(h-1)*.655,c,f*.148],0);else for(let h=0;h<5;h++)u&&h===0&&o>2||a(.585,.385,[(h-2)*.392,c,0],tt)}return t.finish({size:[2,o*s,.6],surface:"dirt"})}
var K3=["glove_fabric",{color:9207134}];
function Oc(i,e,t,n,s,{crush:o=0,damp:r=.3,open:a=!1,tape:l=!0,label:c="",arrow:u=!1,tint:h=1}={}){let f=i.rng,p=i.G,d=f()*40;i.push(s);let v=_=>{if(!o)return;let M=zi(_.y/t,0,1),E=M*M;_.y-=o*t*.32*E*(.55+.45*Math.cos(At*_.x/e*.9+.5))*(.8+.2*Math.cos(At*_.z/n)),_.z*=1+.1*o*Math.sin(At*M),_.x+=.12*o*t*M+.02*o*Math.sin(At*M)*Math.sign(_.x)},g=eo(e,t,n,.007,4,5,4,"bottom");a&&ev(g,2),o&&(to(g,v),gr(g));let x=r*t,y=(_,M,E)=>{let w=gn(_*6+d,M*3,E*6+d),S=Q3(x-.03,x+.04,M+.08*(w-.5)),z=(.86+.14*gn(_*13,M*13+d,E*13))*h;return[z*(.5+.5*S),z*(.47+.53*S),z*(.42+.58*S)]};{let _=g.attributes.position,M=new Float32Array(_.count*3);for(let E=0;E<_.count;E++){let w=y(_.getX(E),_.getY(E),_.getZ(E));M[E*3]=w[0],M[E*3+1]=w[1],M[E*3+2]=w[2]}g.setAttribute("color",new lt.BufferAttribute(M,3))}i.add("cardboard",g);let b=.0025;if(a){let _=Math.min(.16,t*.6);i.add("cardboard",nv(e-.012,n-.012),{p:[0,t-_,0],r:[-tt,0,0]},.45*h);for(let[E,w,S]of[[0,e,n/2],[At,e,n/2],[tt,n,e/2],[-tt,n,e/2]])i.add("cardboard",M1(nv(w-.012,_)),{p:[Math.sin(E)*(S-.006),t-_/2,Math.cos(E)*(S-.006)],r:[0,E,0]},.55*h);let M=(E,w,S)=>{let z=Math.sin(S),H=Math.cos(S);return[E,w,z,H]};for(let E of[1,-1]){let w=f.range(.3,1.9),S=n/2-.01;i.add("cardboard",vr([[0,t,E*n/2],[0,t+Math.sin(w)*S*.5,E*(n/2+Math.cos(w)*S*.5)],[0,t+Math.sin(w)*S,E*(n/2+Math.cos(w)*S+.01)]],[e/2-.004,0,0]),null,.9*h)}for(let E of[1,-1]){let w=f.range(.9,2.3),S=n/2-.02;i.add("cardboard",vr([[E*e/2,t,0],[E*(e/2+Math.cos(w)*S),t+Math.sin(w)*S,0]],[0,0,n/2-.004]),null,.82*h)}}else if(l){let M=[];M.push([-e/2-b,t-.075,0]);for(let w=0;w<=8;w++)M.push([(-.5+w/8)*(e+2*b),t+b,0]);M.push([e/2+b,t-.075,0]);let E=new lt.Vector3;for(let w of M)E.set(w[0],w[1],w[2]),v(E),w[0]=E.x,w[1]=E.y+(o?.004:0),w[2]=E.z;i.add("polymer_tan",vr(M,[0,0,.025],!1),null,.9)}let m=n/2+b,A=Math.min(.055,t*.2);if(c&&!o&&(i.label(c,{color:"black",font:"sans",distress:.3},e*.6,A,{p:[-e*.1,t*.62,m]}),i.add("paint_white",nv(.11,.075),{p:[e*.26,t*.3,m-.001]},.9,{cast:!1}),i.decal(p.mats.decal("numbers_0_9"),.095,{p:[e*.26,t*.3,m+6e-4]})),u&&!o)for(let _ of[1,-1])i.decal(p.mats.decal("arrow"),Math.min(.09,t*.3),{p:[_*(e/2+b),t*.55,_*n*.2],r:[0,_*tt,tt]});i.pop()}
function nR(i,e){let t=new Kn(i,"cardboard_boxes",e.seed||0),n=t.rng,s=()=>n.range(-.015,.015),o=()=>n.range(.82,1);return Oc(t,.5,.38,.44,{p:[-.23+s(),0,-.16+s()],r:[0,n.range(-.05,.05),0]},{damp:.45,label:"易碎物品",arrow:!0,tint:o()}),Oc(t,.42,.33,.4,{p:[.26+s(),0,-.17+s()],r:[0,n.range(-.08,.08),0]},{damp:.5,label:"保持干燥",tint:o()}),Oc(t,.46,.28,.4,{p:[-.24+s(),.38,-.15+s()],r:[0,n.range(-.2,.2),0]},{crush:1,damp:.75,tint:o()*.92}),Oc(t,.33,.26,.32,{p:[.27+s(),.33,-.18+s()],r:[0,n.range(-.3,.3),0]},{open:!0,damp:.1,label:"",arrow:!0,tint:o()}),Oc(t,.3,.16,.24,{p:[-.26+s(),.565,-.16+s()],r:[.03,n.range(-.5,.5),-.09]},{damp:.2,label:"HX-2291",tint:o()}),Oc(t,.36,.26,.3,{p:[.06+s(),.105,.2],r:[.62,n.range(-.25,.25),0]},{damp:.9,crush:.25,tint:o()*.85}),t.finish()}
function eb(i){i("tarp_cargo",(e,t={})=>QA(e,t)),i("sandbags",(e,t={})=>tR(e,t)),i("cardboard_boxes",(e,t={})=>nR(e,t))}
var tb=new lt.Quaternion,iR=new lt.Vector3(0,1,0),T1=new lt.Vector3,nb=new lt.Matrix4;
function zr(i,e,t,n,s=.006,o=!1){T1.set(e[0]-i[0],e[1]-i[1],e[2]-i[2]);let r=T1.length();T1.normalize();let a=o?$e(t,r,n):Ge(t,r,n,s);return tb.setFromUnitVectors(iR,T1),nb.compose(new lt.Vector3((i[0]+e[0])/2,(i[1]+e[1])/2,(i[2]+e[2])/2),tb,new lt.Vector3(1,1,1)),a.applyMatrix4(nb),a}
var sR=i=>{let e=0;for(let t=0;t<i.length;t++){let n=i[t],s=i[(t+1)%i.length];e+=n[0]*s[1]-s[0]*n[1]}return e<0?i.slice().reverse():i};
function ib(i,e,t,n,s,o,r,a,l,c){let u=tv(t,n,r,a);i.push({p:[e,t,o>0?s-n/2:-(s-n/2)],r:[o>0?tt:-tt,0,0]}),i.push({r:[0,c()*6,0]});let h=c()*20;i.add("tire",u,null,(p,d,v)=>{let g=Math.hypot(p,v);return g<r+.01?.45:.78+.22*gn(Math.atan2(v,p)*3+h,g*30)});let f=n*.8;i.add("paint_yellow",us([[r+.006,f+.012],[r-.012,f+.016],[r-.03,f-.02],[r*.62,f-.05],[r*.5,f-.02],[r*.42,f-.012],[0,f-.012]],14),null,(p,d,v)=>Math.hypot(p,v)>r*.7?[.55,.5,.42]:[.8,.78,.7]),i.add("steel_dark",us([[0,n*.2],[r+.004,n*.2]],10),null,.4),i.add("steel_dark",ot(r*.2,r*.24,.035,8),{p:[0,f,0]},.7);for(let p=0;p<6;p++){let d=p*At/3;i.add("steel_galv",ot(.011,.012,.016,6),{p:[Math.cos(d)*r*.33,f-.006,Math.sin(d)*r*.33]},c.range(.5,.8))}i.pop(),i.pop()}
function oR(i,e){let t=new Kn(i,"forklift",e.seed||0),n=t.rng,s=zi(+e.forksUp||0,0,1),o=s*1.5,r=o/2,[a,l]=Ja(e.color,"yellow"),c=(K=1)=>typeof l=="number"?l*K:l.map(ie=>ie*K),u="steel_dark",h=()=>n.range(.68,.95),f=e.number||["04","07","12","22"][t.seed%4],p=.33,d=.23,v=.22,g=.47,x=.27,y=.18,b=-1.1,m=.46;for(let K of[1,-1])ib(t,v,p,d,g,K,.195,24,0,n),ib(t,b,x,y,m,K,.155,20,0,n);t.add(u,vn([v,p,-.4],[v,p,.4],.07,8),null,.5),t.add(u,Ge(.12,.1,.78,.01),{p:[b,x,0]},.5),t.add(u,Ge(1.95,.34,.68,.02),{p:[-.425,.37,0]},.55);for(let K of[1,-1]){t.add(a,Ge(.6,.3,.17,.02),{p:[-.47,.4,K*.42]},c(.92)),t.add("diamond_plate",Ge(.3,.012,.16,.003),{p:[-.32,.556,K*.42]},.7),t.add(u,ot(.03,.03,.02,8),{p:[-.62,.56,K*.42]},.6);let ie=[],F=p+.035,X=p+.06;for(let ne=0;ne<=7;ne++){let re=.12+(At-.5)*ne/7;ie.push([v+Math.cos(re)*X,p+Math.sin(re)*X])}for(let ne=7;ne>=0;ne--){let re=.12+(At-.5)*ne/7;ie.push([v+Math.cos(re)*F,p+Math.sin(re)*F])}t.add(a,Mo(ie,.27,{soft:.7}),{p:[0,0,K*.475]},c(.95))}t.add("diamond_plate",$e(.66,.016,.68),{p:[.2,.548,0]},.6);for(let K of[-.12,.1])t.add("rubber",Ge(.1,.02,.07,.006),{p:[.33,.6,K],r:[0,0,.5]},.8);let A=eo(.62,.63,1.12,.12,3,3,3);to(A,K=>{if(K.y>.1){let ie=(K.y-.1)/.215;K.x+=.03*ie*(K.x<0?1:0)}}),t.add(a,gr(A),{p:[-1.39,.915,0]},c(.97)),t.add(a,Ge(.56,.37,.64,.05),{p:[-1.4,.43,0]},c(.85)),t.add("hazard_stripes",Ge(.014,.085,.84,.004),{p:[-1.702,.77,0]},.95),t.label(f,{color:"black",font:"stencil",distress:.35},.4,.2,{p:[-1.703,.96,0],r:[0,-tt,0]});for(let K of[1,-1])t.add(i.mats.emissive(16722450,.16),Ge(.012,.05,.11,.004),{p:[-1.69,1.1,K*.37]},1,{raw:!0}),t.add(u,Ge(.016,.066,.126,.004),{p:[-1.684,1.1,K*.37]},.4),t.label("几猫",{color:"black",font:"sans",distress:.3},.42,.085,{p:[-1.39,.99,K*.5625],r:[0,K>0?0:At,0]}),t.add(u,Ge(.06,.05,.02,.004),{p:[-1.67,.44,K*.05]},.5);t.add("steel_worn",ot(.02,.02,.13,8),{p:[-1.68,.44,0]},.7),t.add(a,Ge(.98,.46,.94,.04),{p:[-.59,.79,0]},c());for(let K of[1,-1]){t.label(f,{color:"black",font:"stencil",distress:.35},.3,.19,{p:[-.84,.8,K*.4715],r:[0,K>0?0:At,0]}),t.add(u,$e(.34,.2,.004),{p:[-.36,.8,K*.47]},.2);for(let ie=0;ie<5;ie++)t.add(a,$e(.34,.03,.006),{p:[-.36,.72+ie*.04,K*.474],r:[K*.5,0,0]},c(.85))}t.add(u,Ge(.4,.05,.4,.01),{p:[-.54,1.045,0]},.5);let _=eo(.46,.1,.46,.04,3,3,3);to(_,K=>{K.y>0&&(K.y-=.018*Math.cos(K.x*5)*Math.cos(K.z*5))}),t.add("rubber",gr(_),{p:[-.53,1.115,0]},1);let M=eo(.1,.5,.44,.04,3,4,3);to(M,K=>{K.x>0&&(K.x-=.02*Math.cos(K.z*5.5))}),t.add("rubber",gr(M),{p:[-.8,1.39,0],r:[0,0,.16]},1);for(let K of[1,-1])t.add(u,zr([-.78,1.08,K*.24],[-.82,1.3,K*.24],.03,.012,.004),null,.5);t.add(a,Mo([[.2,.55],[.54,.55],[.54,1],[.46,1.12],[.3,1.14],[.21,1.02]],.7,{soft:.5}),null,c());let E=Math.atan2(.12,.09);t.push({p:[.253,1.082,0],r:[0,0,E]}),t.add(u,Ge(.012,.13,.44,.004),{p:[-.006,0,0]},.45),t.add(i.mats.emissive(9429168,.3),_f(.09,.05),{p:[-.0135,.01,.1],r:[0,-tt,0]},1,{raw:!0,cast:!1}),t.decal(i.mats.decal("csc_plate"),.09,{p:[-.0135,0,-.12],r:[0,-tt,0]}),t.add("plastic_red",ot(.016,.016,.02,8),{p:[-.02,0,.19],r:[0,0,tt]},.9),t.add("steel_bare",ot(.009,.009,.02,6),{p:[-.018,-.03,-.01],r:[0,0,tt]},.9),t.pop();let w=[.3,1.1,.04],S=[.1,1.31,.04];t.add(u,vn(w,S,.024,8),null,.5),t.push({p:S,r:[0,0,Math.atan2(S[1]-w[1],S[0]-w[0])]}),t.add("rubber",ja(.165,.014,6,18),{r:[0,tt,0]},1);for(let K=0;K<3;K++){let ie=K*At*2/3+.5;t.add(u,vn([-.01,0,0],[0,Math.cos(ie)*.16,Math.sin(ie)*.16],.009,5),null,.5)}t.add(u,ot(.035,.04,.03,10),{p:[-.005,0,0],r:[0,0,tt]},.5),t.add("rubber",ot(.016,.014,.045,8),{p:[.03,.16,.02],r:[0,0,tt]},1),t.pop();for(let K=0;K<3;K++){let ie=-.2-K*.055,F=[.33,1.12,ie],X=[.25-K*.012,1.3-K*.01,ie-.01];t.add("steel_bare",vn(F,X,.007,5),null,.8),t.add("rubber",Y3(.02,7,5),{p:X},1)}{let K=[.3,1.1,.27],ie=[.2,1.24,.29];t.add("steel_bare",vn(K,ie,.008,5),null,.8),t.add("plastic_red",ot(.016,.016,.07,7),{p:ie,r:[0,0,.6]},.9)}let z=2.045,H=[];for(let K of[1,-1]){let ie=[.47,1.08,K*.4],F=[.27,z,K*.46],X=[-1,1,K*.44],ne=[-.95,z,K*.46];t.add(u,zr(ie,F,.06,.05,.01),null,h()),t.add(u,zr(X,ne,.06,.05,.01),null,h()),t.add(u,zr([.3,z,K*.46],[-.98,z,K*.46],.05,.06,.01),null,h()),t.add(u,Ge(.09,.012,.08,.003),{p:[.47,1.085,K*.4]},.5),t.add(u,Ge(.09,.012,.08,.003),{p:[-1,1.024,K*.44]},.5);let re=.36,$=1.66;t.add(u,eo(.085,.1,.13,.02,3,3,3),{p:[re+.045,$,K*.47]},.45),t.add(i.mats.emissive(16773330,.7),Ge(.006,.075,.105,.002),{p:[re+.089,$,K*.47]},1,{raw:!0}),t.add(u,vn([.385,1.5,K*.42],[.42,1.52,K*.57],.008,5),null,.5),t.add(u,Ge(.022,.17,.1,.006),{p:[.42,1.52,K*.573],r:[0,K*.25,0]},.5),t.add("steel_bare",$e(.002,.15,.084),{p:[.408,1.52,K*.57],r:[0,K*.25,0]},1),H.push({min:[-1.03,1,K>0?.41:-.5],max:[-.92,z,K>0?.5:-.41],surface:"metal"},{min:[.24,1.08,K>0?.37:-.5],max:[.5,z,K>0?.5:-.37],surface:"metal"})}for(let K of[.28,-.96])t.add(u,Ge(.05,.06,.92,.01),{p:[K,z,0]},h());for(let K=0;K<8;K++)t.add(u,Ge(.03,.028,.9,.006),{p:[-.83+K*.139,z+.012,0]},h());t.add(u,Fn([[.44,1.2,.44],[.47,1.25,.49],[.41,1.55,.5],[.36,1.6,.455]],.011,5,!1,.5),null,.5),t.add(u,ot(.045,.05,.03,10),{p:[-.86,z+.045,.3]},.5),t.add(i.mats.emissive(16747026,.9),us([[.04,0],[.04,.06],[.03,.082],[0,.09]],10),{p:[-.86,z+.06,.3]},1,{raw:!0});let O=-1.4,q=1.23+.05+.155;for(let K of[-.2,.2])t.add(u,Ge(.3,.07,.04,.008),{p:[O,1.262,K]},.5),t.add(u,ot(.159,.159,.035,16,!0),{p:[O,q,K],r:[tt,0,0]},.35);t.add("steel_galv",us([[0,-.37],[.08,-.36],[.132,-.33],[.155,-.27],[.155,.27],[.132,.33],[.08,.36],[0,.37]],16),{p:[O,q,0],r:[tt,0,0]},(K,ie,F)=>.8+.2*gn(K*8,ie*8,F*8)),t.add("steel_galv",ot(.09,.09,.07,12,!0),{p:[O,q,.39],r:[tt,0,0]},.7),t.add("steel_galv",ot(.02,.02,.05,8),{p:[O,q,.39],r:[tt,0,0]},.9),t.add("rubber",Fn([[O,q,.41],[O+.05,q-.02,.46],[O+.2,q-.15,.44],[-1.07,1.1,.38],[-1,.98,.36]],.012,5,!1,.5),null,1),t.push({p:[O,q,0],r:[0,0,.7]}),t.cdecal(i.mats.decal("hazard_flammable"),.157,.12,{p:[0,0,-.05],r:[-tt,0,0]}),t.cdecal(i.mats.label("液化气",{color:"red",font:"stencil",distress:.3}),.157,.16,{p:[0,0,.14],r:[-tt,0,0]}),t.pop();let U=.6,T=.73,D=.375,C=.08,G=2.02;for(let K of[1,-1]){let ie=K*D,F=[[U,ie],[T,ie],[T,ie-K*.065],[T-.014,ie-K*.065],[T-.014,ie-K*.014],[U+.014,ie-K*.014],[U+.014,ie-K*.065],[U,ie-K*.065]];t.add(u,Mo(sR(F.map(P=>[P[0],-P[1]])),G-C,{soft:0}),{p:[0,(C+G)/2,0],r:[-tt,0,0]},h()),t.add(u,Ge(.085,1.86,.036,.006),{p:[.665,.13+r+.93,K*.335]},h()*1.25),t.decal(i.mats.decal("hazard_general"),.1,{p:[.665,1.3,K*(D+.002)],r:[0,K>0?0:At,0]});let X=[.36,.66,K*.3],ne=[.6,.86,K*.33],re=[.5,.777,K*.317];t.add(u,vn(X,re,.034,8,!0),null,.55),t.add("steel_bare",vn(re,ne,.018,6),null,1);let $=K*.13,ue=1.9+r,me=.055,ee=[[.725,.5+o,$],[.725,ue,$]];for(let P=.5;P<At;P+=.55)ee.push([.67+Math.cos(P)*me,ue+Math.sin(P)*me,$]);ee.push([.615,ue,$],[.615,1,$]);let B=0;for(let P=0;P<ee.length-1;P++){let V=ee[P],Y=ee[P+1],L=Math.hypot(Y[0]-V[0],Y[1]-V[1]),Z=Math.max(1,Math.round(L/.058));for(let J=0;J<Z;J++,B++){let oe=J/Z,fe=(J+.86)/Z,le=R=>[V[0]+(Y[0]-V[0])*R,V[1]+(Y[1]-V[1])*R,$];t.add("steel_worn",zr(le(oe),le(fe),.011,B%2?.034:.022,0,!0),null,B%2?.55:.75)}}t.add(u,ot(me-.006,me-.006,.04,12),{p:[.67,ue,$],r:[tt,0,0]},.7)}t.add(u,Ge(.04,.09,.78,.008),{p:[U-.012,1.96,0]},h()),t.add(u,Ge(.04,.12,.78,.008),{p:[U-.012,.42,0]},h()),t.add(u,Ge(.07,.09,.66,.008),{p:[.665,1.99+r,0]},h()),t.add(u,ot(.048,.048,1.15,10),{p:[.645,.72,0]},.6),t.add(u,ot(.055,.055,.05,10),{p:[.645,1.3,0]},.5),t.add("steel_bare",ot(.027,.027,.64+r,8,!0),{p:[.645,1.31+(.64+r)/2,0]},1),t.label("最大载重2500千克",{color:"yellow",font:"stencil",distress:.3},.5,.05,{p:[U-.033,.42,0],r:[0,-tt,0]});for(let K of[.21,.245])t.add("rubber",Fn([[.6,1.25,K],[.59,1.65+r*.6,K],[.655,1.86+r,K+.005],[.735,1.6+r*1.2,K],[.74,.56+o,K]],.011,5,!1,.5),null,1);t.push({p:[0,o,0]});let j=.06;for(let K of[j+.12,j+.5])t.add(u,Ge(.04,.1,1.02,.008),{p:[.755,K,0]},h());t.add("hazard_stripes",$e(.003,.06,.4),{p:[.7765,j+.5,0]},.9);for(let K of[1,-1])t.add(u,Ge(.03,.5,.06,.006),{p:[.745,j+.31,K*.3]},h()),t.add(u,Ge(.11,.36,.022,.005),{p:[.685,j+.31,K*.305]},h()),t.add(u,Ge(.03,.78,.04,.006),{p:[.755,j+.94,K*.5]},h()),t.add("steel_worn",ot(.04,.04,.03,10),{p:[.67,j+.2,K*.325],r:[tt,0,0]},.7);t.add(u,Ge(.03,.04,1.04,.006),{p:[.755,j+1.33,0]},h()),t.add(u,Ge(.02,.03,1,.004),{p:[.755,j+.94,0]},h());for(let K=-2;K<=2;K++)t.add(u,Ge(.02,.76,.02,.004),{p:[.755,j+.94,K*.165]},h());let N=.035;for(let K of[1,-1]){let ie=Mo([[.777,N],[1.45,N],[1.7,N+.006],[1.7,N+.016],[.87,N+.046],[.826,N+.075],[.822,N+.62],[.777,N+.62]],.1,{soft:.45});t.add("steel_worn",ie,{p:[0,0,K*.26]},(F,X,ne)=>{let re=zi((F-.8)/.9,0,1),$=gn(F*14,ne*30+K);return(.5+.5*re)*(.8+.2*$)}),t.add(u,Ge(.075,.05,.112,.006),{p:[.772,j+.575,K*.26]},.55),t.add(u,Ge(.03,.04,.112,.006),{p:[.79,j+.07,K*.26]},.55)}t.pop();let Q=Math.max(2.2,.06+o+1.36,2.04+r);return t.finish({size:[3.4,Q,1.25],colliders:[{min:[-1.7,0,-.6],max:[.58,1.24,.6],surface:"metal"},{min:[-1.56,1.24,-.4],max:[-1.22,1.6,.4],surface:"metal"},{min:[-.88,1.24,-.24],max:[-.7,1.66,.24],surface:"rubber"},{min:[.56,0,-.42],max:[.78,2.04+r,.42],surface:"metal"},{min:[.72,o,-.53],max:[.8,o+1.42,.53],surface:"metal"},{min:[.8,o,-.33],max:[1.7,o+.1,.33],surface:"metal"},{min:[-1.02,2,-.5],max:[.32,2.1,.5],surface:"metal"},...H]})}
function rR(i,e){let t=new Kn(i,"generator",e.seed||0),n=t.rng,[s,o]=Ja(e.color,"yellow"),r=(m=1)=>typeof o=="number"?o*m:o.map(A=>A*m),a="steel_dark",l=.46,c=1.03,u=.3,h=1.16,f=(u+h)/2;for(let m of[1,-1]){t.add(a,Ge(2.2,.14,.1,.012),{p:[0,.07,m*.4]},.6);for(let A of[-.45,.45])t.add(a,$e(.22,.075,.004),{p:[A,.075,m*.451]},.12)}for(let m of[-.85,0,.85])t.add(a,$e(.1,.1,.72),{p:[m,.07,0]},.55);t.add(a,Ge(2.1,.17,.94,.012),{p:[0,.215,0]},.8),t.add(s,Ge(2.06,h-u,l*2,.025),{p:[0,f,0]},r()),t.add(s,Ge(2.13,.045,.99,.014),{p:[0,h+.02,0]},r(.9));for(let m of[-.52,.52])t.add(s,$e(.04,.012,.95),{p:[m,h+.046,0]},r(.85));for(let m of[1,-1]){let A=m>0?0:At;[-.66,0,.66].forEach((_,M)=>{t.add(s,Ge(.62,.72,.012,.006),{p:[_,f+.01,m*(l+.004)]},r(n.range(.9,1))),t.add(a,$e(.03,.11,.016),{p:[_+.27,f,m*(l+.012)]},.6),t.add("steel_galv",$e(.012,.03,.006),{p:[_+.27,f+.03,m*(l+.022)]},.8);for(let E of[-.25,.25])t.add("steel_galv",ot(.009,.009,.06,5,!0),{p:[_-.305,f+E,m*(l+.012)]},.7);if(M>0){let E=M===2?8:5,w=.42,S=M===2?f+.14:f-.16;t.add(a,$e(w,E*.05,.004),{p:[_-.03,S,m*(l+.0105)]},.12);for(let z=0;z<E;z++)t.add(s,$e(w,.04,.005),{p:[_-.03,S+(z-(E-1)/2)*.05,m*(l+.018)],r:[m*.6,0,0]},r(.82));M===2&&t.decal(i.mats.decal("rust_run"),.3,{p:[_-.03,S-.36,m*(l+.011)],r:[0,A,0]})}}),t.label(e.label||"GEN-0"+(1+t.seed%2),{color:"black",font:"stencil",distress:.35},.5,.13,{p:[-.66*m,f+.17,m*(l+.0108)],r:[0,A,0]}),t.decal(i.mats.decal("hazard_voltage"),.15,{p:[-.66*m-m*.18,f-.17,m*(l+.0108)],r:[0,A,0]})}t.add(a,$e(.004,.66,.74),{p:[c+.001,f,0]},.1);for(let m=0;m<11;m++)t.add(s,$e(.006,.046,.74),{p:[c+.012,f-.3+m*.06,0],r:[0,0,-.6]},r(.8));for(let m of[1,-1])t.add(s,$e(.03,.72,.03),{p:[c+.012,f,m*.385]},r(.9)),t.add(s,$e(.03,.03,.8),{p:[c+.012,f+m*.345,0]},r(.9));let p=-c-.004,d=.14;t.add(a,Ge(.01,.44,.52,.004),{p:[p,.87,d]},.45),t.add(s,Ge(.075,.014,.56,.004),{p:[p-.03,1.1,d],r:[0,0,.12]},r(.9));for(let m of[1,-1])t.add(s,$e(.06,.44,.012),{p:[p-.025,.87,d+m*.268]},r(.9));let v=p-.0055,g=[0,-tt,0];t.add(i.mats.emissive(8840104,.32),_f(.13,.07),{p:[v-.001,.99,d-.12],r:g},1,{raw:!0,cast:!1}),t.add(a,Ge(.008,.09,.15,.003),{p:[v+.003,.99,d-.12]},.3),t.add("steel_galv",ot(.02,.02,.012,10),{p:[v-.004,1,d+.19],r:[0,0,tt]},.7),t.add(i.mats.emissive(4063082,3.2),ot(.013,.013,.014,10),{p:[v-.009,1,d+.19],r:[0,0,tt]},1,{raw:!0}),t.add(s,ot(.042,.042,.006,12),{p:[v-.003,.8,d+.17],r:[0,0,tt]},1),t.add("plastic_red",us([[0,0],[.018,0],[.018,.018],[.03,.02],[.03,.034],[.02,.042],[0,.044]],10),{p:[v-.004,.8,d+.17],r:[0,0,tt]},.95);for(let m=0;m<3;m++){let A=d-.2+m*.105;t.add("aluminium",ot(.04,.042,.012,10),{p:[v-.004,.86,A],r:[0,0,tt]},.8),t.add("aluminium",ot(.034,.034,.002,10),{p:[v-.0105,.86,A],r:[0,0,tt]},1),t.add(a,$e(.002,.028,.004),{p:[v-.0125,.868,A+.005],r:[n.range(-1,1),0,0]},.3)}for(let m=0;m<5;m++)t.add(m===0?"plastic_red":a,$e(.014,.04,.022),{p:[v-.006,.74,d-.2+m*.03],r:[0,0,n()<.5?.25:-.25]},.8);t.decal(i.mats.decal("hazard_voltage"),.13,{p:[-c-.002,.95,-.28],r:g}),t.label("危险",{color:"red",font:"stencil",distress:.3},.22,.05,{p:[-c-.002,.82,-.28],r:g});let x=[["plastic_red",.02],["plastic_blue",.2],["plastic_blue",-.25]];for(let[m,A]of x)t.add(a,Ge(.02,.12,.1,.006),{p:[-c-.008,.5,A]},.4),t.add(m,vn([-c-.01,.5,A],[-c-.06,.47,A],.036,10,!0),null,.9);t.add("plastic_blue",vn([-c-.06,.47,.2],[-c-.068,.39,.2],.03,8,!0,.02),null,.85),t.add("rubber",Fn([[-c-.066,.4,.2],[-c-.064,.25,.21],[-c-.05,.06,.26],[-c+.05,.016,.4],[-c+.3,.016,.478],[-.35,.016,.486]],.014,5,!1,.5),null,1);let y=h+.0425;t.add(a,Ge(.2,.012,.14,.004),{p:[0,y+.004,0]},.6),t.add("steel_galv",ja(.045,.014,5,10),{p:[0,y+.058,0]},.7);let b=[.72,y,.24];return t.add("steel_rust",ot(.062,.066,.025,12),{p:[b[0],y+.012,b[2]]},.6),t.add("steel_rust",ot(.04,.04,.17,12,!0),{p:[b[0],y+.085,b[2]]},(m,A)=>.45+.55*zi((y+.17-A)/.17,0,1)),t.add("steel_rust",ot(.034,.034,.002,10),{p:[b[0],y+.15,b[2]]},.08),t.add("steel_rust",ot(.046,.046,.005,12),{p:[b[0]-.012,y+.186,b[2]],r:[0,0,.5]},.6),t.decal(i.mats.decal("scorch"),.3,{p:[b[0],y+.001,b[2]],r:[-tt,0,0]}),t.add(a,vn([-.72,.25,.46],[-.72,.32,.5],.03,8,!0),null,.6),t.add("plastic_red",vn([-.72,.32,.5],[-.72,.338,.51],.037,10,!0),null,.9),t.decal(i.mats.decal("hazard_flammable"),.11,{p:[-.52,.215,.4712]}),t.label("柴油",{color:"white",font:"stencil",distress:.4},.2,.05,{p:[-.34,.215,.4712]}),t.finish({colliders:[{min:[-1.1,0,-.5],max:[1.1,1.21,.5],surface:"metal"}]})}
function aR(i,e){let t=new Kn(i,"dumpster",e.seed||0),n=t.rng,[s,o]=Ja(e.color,"green"),r=(M=1)=>typeof o=="number"?o*M:o.map(E=>E*M),a=.89,l=.2,c=1.12,u=.3,h=.5,f=-.44,p=-.5,d=.022,v=[[-h,c],[-u,l],[-f,l],[-p,c],[-p-d,c],[-f-d*.8,l+d],[-u+d*.8,l+d],[-h+d,c]],g=t.seed*2.3;t.add(s,Mo(v,a*2,{soft:0}),{r:[0,tt,0]},(M,E,w)=>{let S=Math.abs(w)<.4&&E>l+.01&&E<c-.01&&Math.abs(M)<a-.01;return r(.9+.1*gn(M*3+g,E*3))});for(let M of[1,-1]){t.add(s,Mo([[-h,c],[-u,l],[-f,l],[-p,c]],d,{soft:0}),{p:[M*(a-d/2),0,0],r:[0,tt,0]},r(.95)),t.add(s,Ge(.05,.045,h-p+.04,.008),{p:[M*a,c,0]},r(.9));for(let E of[-.22,.14])t.add(s,Ge(.03,.84,.05,.006),{p:[M*(a+.012),.66,E]},r(.9));t.add(s,Ge(.035,.1,.84,.008),{p:[M*(a+.014),.93,0]},r(.85)),t.add("steel_worn",vn([M*(a+.01),.93,.3],[M*(a+.065),.93,.3],.03,10,!0),null,.7),t.add("steel_worn",ot(.042,.042,.008,10),{p:[M*(a+.064),.93,.3],r:[0,0,tt]},.6)}t.add(s,Ge(a*2+.04,.045,.05,.008),{p:[0,c,h]},r(.9)),t.add(s,Ge(a*2+.04,.045,.05,.008),{p:[0,c,p]},r(.9));let x=Math.atan2(h-u,c-l),y=Math.atan2(p-f,c-l);for(let M of[-.6,-.2,.2,.6])t.add(s,zr([M,l+.03,u+.022],[M,c-.04,h+.012],.055,.03,.006),null,r(.9)),t.add(s,zr([M,l+.03,f-.016],[M,c-.04,p-.012],.055,.03,.006),null,r(.9));t.add(s,zr([-a,l+.5,u+.022+.5*(h-u)/(c-l)],[a,l+.5,u+.022+.5*(h-u)/(c-l)],.03,.06,.006),{r:[0,0,0]},r(.88));let b=M=>u+(M-l)*(h-u)/(c-l)+.003;t.label(e.label||"四号泊位废物 "+(11+t.seed%2),{color:"white",font:"stencil",distress:.5},.36,.09,{p:[-.4,.93,b(.93)],r:[-x,0,0]}),t.decal(i.mats.decal("grime_streak"),.36,{p:[.4,.82,b(.82)],r:[-x,0,0]}),t.decal(i.mats.decal("rust_run"),.3,{p:[0,.5,b(.5)],r:[-x,0,0]}),t.decal(i.mats.decal("logo_c"),.26,{p:[.4,.42,b(.42)],r:[-x,0,0]}),t.decal(i.mats.decal("leak_stain"),.34,{p:[-.4,.45,b(.45)],r:[-x,0,0]});let m=c+.045,A=p-.02;t.add("steel_galv",vn([-a-.02,m,A],[a+.02,m,A],.013,6,!0),null,.7);let _=(M,E)=>{t.push({p:[M,m,A],r:[E,0,0]});let w=1.07,S=eo(.885,.04,w,.016,3,3,4);to(S,H=>{H.y>0&&(H.y+=.018*Math.cos(H.z/w*At)*Math.cos(H.x/.885*At))}),S.computeVertexNormals();let z=n.range(.75,.95);t.add("plastic_grey",S,{p:[0,.005,w/2]},z);for(let H of[-.26,.26])t.add("plastic_grey",Ge(.07,.016,w-.16,.006),{p:[H,.036,w/2]},z*.9);t.add("plastic_grey",Ge(.3,.035,.05,.01),{p:[0,.02,w+.01]},z*.8);for(let H of[-.3,.3])t.add("plastic_grey",Ge(.08,.03,.09,.008),{p:[H,.005,.03]},z*.8);t.pop()};_(-.45,0),_(.45,tt+.07+n.range(0,.05));for(let[M,E,w,S]of[[.45,.93,.05,1],[.66,.9,-.24,.8],[.22,.86,-.2,.85]]){let z=eo(.46*S,.4*S,.42*S,.17*S,3,3,3),H=n()*20;to(z,O=>{let q=gn(O.x*9+H,O.y*9,O.z*9)-.5;O.x+=q*.06,O.z+=q*.06,O.y+=q*.04}),t.add("polymer_black",gr(z),{p:[M,E,w],r:[n()*.5,n()*6,0]},.8)}t.add("cardboard",vr([[.2,.9,.2],[.24,1.14,.26],[.3,1.2,.33]],[.16,0,-.05]),null,.7);for(let M of[-.7,.7])for(let E of[-.3,.17]){t.push({p:[M,0,E],r:[0,n()*6,0]}),t.add("steel_galv",Ge(.13,.012,.11,.003),{p:[0,.194,0]},.7);for(let w of[1,-1])t.add("steel_galv",zr([0,.19,w*.034],[.035,.08,w*.034],.05,.006,0,!0),null,.65);t.add("rubber",ot(.08,.08,.045,14),{p:[.035,.08,0],r:[tt,0,0]},.9),t.add("steel_galv",ot(.035,.035,.05,8),{p:[.035,.08,0],r:[tt,0,0]},.6),t.pop()}return t.finish({colliders:[{min:[-.95,.05,-.56],max:[.95,1.2,.55],surface:"metal"}]})}
function lR(i,e){let t=new Kn(i,"toolbox_cart",e.seed||0),n=t.rng,[s,o]=Ja(e.color,"red"),r=(y=1)=>typeof o=="number"?o*y:o.map(b=>b*y),a=.04,l=.74,c=.125,u=.785,h=.23;t.add(s,Ge(l,u-c,h*2,.012),{p:[a,(c+u)/2,0]},r()),t.add("steel_dark",Ge(l+.01,.02,h*2+.01,.006),{p:[a,c+.004,0]},.5);let f=[.075,.075,.1,.13,.19],p=1+t.seed%3,d=u-.03;f.forEach((y,b)=>{let m=b===p?.05:n()<.3?.004:0,A=d-y/2;if(t.add(s,Ge(l-.05,y-.01,.014,.004),{p:[a,A,h+.005+m]},r(n.range(.9,1))),t.add("aluminium",Ge(l-.09,.016,.016,.004),{p:[a,A+y/2-.02,h+.019+m]},.85),m>.01){t.add("steel_dark",$e(l-.07,y-.02,m),{p:[a,A,h+m/2]},.4),t.add("polymer_black",$e(l-.08,.004,m),{p:[a,A+y/2-.012,h+m/2]},.3);for(let _=0;_<4;_++)t.add("steel_bare",vn([a-.25+_*.15,A+y/2-.016,h+.008],[a-.23+_*.15,A+y/2-.014,h+m-.012],.007,5,!0),null,.8)}d-=y}),t.add("steel_bare",ot(.011,.011,.008,8),{p:[a+l/2-.06,u-.016,h+.004],r:[tt,0,0]},.8),t.add("rubber",$e(l-.04,.006,h*2-.04),{p:[a,u+.003,0]},.9),t.add(s,Ge(l,.03,.014,.004),{p:[a,u+.013,-h+.007]},r(.95));for(let y of[1,-1])t.add(s,Ge(.014,.03,h*2,.004),{p:[a+y*(l/2-.007),u+.013,0]},r(.95));t.add("aluminium",Fn([[a-l/2,.56,-.17],[-.41,.6,-.17],[-.435,.73,-.17],[-.435,.73,.17],[-.41,.6,.17],[a-l/2,.56,.17]],.012,6,!1,.2),null,.85);for(let y of[1,-1])for(let b of[1,-1]){t.push({p:[a+y*(l/2-.07),0,b*(h-.06)],r:[0,y>0?n()*6:0,0]}),t.add("steel_galv",Ge(.08,.008,.07,.002),{p:[0,.119,0]},.7);for(let m of[1,-1])t.add("steel_galv",zr([0,.117,m*.022],[.02,.05,m*.022],.035,.004,0,!0),null,.65);t.add("rubber",ot(.05,.05,.03,12),{p:[.02,.05,0],r:[tt,0,0]},.9),t.add("steel_galv",ot(.02,.02,.034,6),{p:[.02,.05,0],r:[tt,0,0]},.6),t.pop()}t.label(e.label||"检修 "+(1+t.seed%2),{color:"white",font:"stencil",distress:.4},.3,.07,{p:[a+l/2+.002,.6,0],r:[0,tt,0]}),t.decal(i.mats.decal("logo_d"),.2,{p:[a+l/2+.002,.42,0],r:[0,tt,0]}),t.decal(i.mats.decal("grime_streak"),.3,{p:[a,.45,-h-.002],r:[0,At,0]});let v=u+.006;t.push({p:[a-.18,v,.08],r:[0,.5,0]}),t.add("steel_bare",Ge(.2,.006,.02,.002),{p:[0,.004,0]},.9),t.add("steel_bare",ja(.016,.006,4,10),{p:[.11,.005,0],r:[tt,0,0]},.9),t.add("steel_bare",ja(.017,.006,4,7,At*1.4),{p:[-.112,.005,0],r:[tt,0,2.2]},.9),t.pop(),t.push({p:[a+.02,v,-.1],r:[0,-.3,0]}),t.add("wood_pallet",vn([-.14,.014,0],[.12,.016,0],.012,6,!0,.01),null,.9),t.add("steel_dark",Ge(.032,.03,.1,.006),{p:[.125,.017,.005]},.8),t.pop(),t.push({p:[a+.2,v,.1],r:[0,.12,0]}),t.add("polymer_black",Ge(.22,.014,.05,.004),{p:[0,.007,0]},.6);for(let y=0;y<6;y++)t.add("steel_bare",ot(.008+y*.0014,.008+y*.0014,.03,8),{p:[-.085+y*.034,.029,0]},.9);t.pop(),t.add("plastic_blue",ot(.032,.032,.13,12),{p:[a+.28,v+.065,-.12]},.9),t.add("steel_bare",us([[.032,0],[.028,.012],[.014,.018],[.014,.018],[.014,.03],[0,.03]],10),{p:[a+.28,v+.13,-.12]},.9),t.add("plastic_red",ot(.012,.012,.014,8),{p:[a+.28,v+.165,-.12]},.95),t.add("paint_yellow",vn([a-.3,v+.012,-.13],[a-.2,v+.012,-.16],.014,7,!0),null,.9),t.add("steel_bare",vn([a-.2,v+.012,-.16],[a-.08,v+.01,-.196],.004,5,!0),null,.9);let g=eo(.2,.02,.15,.009,4,3,4),x=n()*9;return to(g,y=>{y.y+=.012*gn(y.x*30+x,y.z*30)*(y.y>0?1:0),y.x+=.012*(gn(y.z*20,x)-.5)}),t.add(t.mat("glove_fabric",{color:8203044}),gr(g),{p:[a-.26,v+.01,.12],r:[0,.8,0]},.9),t.finish()}
function sb(i){i("forklift",(e,t={})=>oR(e,t)),i("generator",(e,t={})=>rR(e,t)),i("dumpster",(e,t={})=>aR(e,t)),i("toolbox_cart",(e,t={})=>lR(e,t))}
J3(_i);
eb(_i);
sb(_i);
function t0(i,e,t){let n=Math.imul(i,374761393)^Math.imul(e,668265263)^Math.imul(t,1274126177);return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967295}
function rl(i,e,t){let n=Math.floor(i),s=Math.floor(e),o=Math.floor(t),r=i-n,a=e-s,l=t-o;r=r*r*(3-2*r),a=a*a*(3-2*a),l=l*l*(3-2*l);let c=(u,h,f)=>u+(h-u)*f;return c(c(c(t0(n,s,o),t0(n+1,s,o),r),c(t0(n,s+1,o),t0(n+1,s+1,o),r),a),c(c(t0(n,s,o+1),t0(n+1,s,o+1),r),c(t0(n,s+1,o+1),t0(n+1,s+1,o+1),r),a),l)}
var P1=[1,1,1],fb=[1,1,1];
function hv(i,e,t,n=fb,s=1){let o=rl(i*.31+11.3,e*.23+5.1,t*.31+3.7),r=rl(i*1.7+40.2,9.5,t*1.7+17.9),a=1-s*(.3-.36*o),l=n[0]*a,c=n[1]*a,u=n[2]*a;if(r>.68){let h=Math.min(1,(r-.68)/.3)*.6*s*(.35+.65*rl(i*.9,e*.45,t*.9));l*=1+.45*h,c*=1-.3*h,u*=1-.6*h}return P1[0]=l,P1[1]=c,P1[2]=u,P1}
var db=new WeakSet;
var io=class{constructor(){this.b=new Map,this.tris=0,this.remap=null,this.dz=0,this.minSize=0}add(e,t,n){if(!t)return;if(Array.isArray(t)){for(let o of t)this.add(e,o,n);return}if(this.remap){let o=this.remap(e,n);if(!o)return;if(this.minSize){t.computeBoundingBox();let r=t.boundingBox;if(Math.max(r.max.x-r.min.x,r.max.y-r.min.y,r.max.z-r.min.z)<this.minSize)return}e=o[0],n=o[1],this.dz&&t.translate(0,0,this.dz)}db.has(e)&&!t.attributes.color&&Lc(t,(o,r,a)=>hv(o,r,a,n||fb));let s=this.b.get(e.uuid);s||(s={mat:e,geos:[]},this.b.set(e.uuid,s)),s.geos.push(t),this.tris+=(t.index?t.index.count:t.attributes.position.count)/3}build({cast:e=!0,recv:t=!0}={}){let n=new wt;for(let s of this.b.values()){let o=Ii(s.geos),r=new Qe(o,s.mat),a=s.mat.isMeshBasicMaterial||s.mat.transparent;r.castShadow=e&&!a,r.receiveShadow=t&&!a,n.add(r)}return this.b.clear(),n}};

let __lastPropBuild = null;

function __assertMats(ctx) {
  if (!ctx || !ctx.mats || typeof ctx.mats.get !== "function") throw new TypeError("props require ctx.mats.get(name, options?)");
  if (typeof ctx.mats.label !== "function") throw new TypeError("props require ctx.mats.label(id, options?)");
  if (typeof ctx.mats.decal !== "function") throw new TypeError("props require ctx.mats.decal(id)");
  if (typeof ctx.mats.emissive !== "function") throw new TypeError("props require ctx.mats.emissive(color, intensity)");
}

function __hasValidGeometry(value) {
  let meshes = 0;
  const visit = (object) => {
    if (!object) return;
    if (object.isMesh) {
      const position = object.geometry && object.geometry.attributes && object.geometry.attributes.position;
      if (position && position.count > 0) {
        for (let index = 0; index < position.array.length; index += 1) {
          if (!Number.isFinite(position.array[index])) return false;
        }
        meshes += 1;
      }
    }
    for (const child of object.children || []) if (!visit(child)) return false;
    return true;
  };
  return visit(value) && meshes > 0;
}

function __looksLikeFallback(value, id) {
  if (!value || !value.userData || value.userData.prop !== id) return true;
  if (!Xg[id]) return true;
  return !__hasValidGeometry(value);
}

function __buildChecked(ctx, id, options = {}) {
  __assertMats(ctx);
  if (!Gi[id] || !Xg[id]) throw new Error(`unknown or unregistered prop: ${id}`);
  const service = Yg(ctx);
  const originalError = console.error;
  let builderError = null;
  console.error = (...args) => {
    if (String(args[0] || "").startsWith(`[props] builder "${id}" threw`)) builderError = args[1] || new Error(String(args[0]));
    originalError(...args);
  };
  let value;
  let buildError = null;
  try { value = service.build(id, options); } catch (error) { buildError = error; } finally { console.error = originalError; }
  if (builderError || buildError || __looksLikeFallback(value, id)) {
    const error = new Error(`original Yg.build fallback for prop "${id}"`);
    error.cause = builderError || buildError || null;
    throw error;
  }
  __lastPropBuild = { id, options, value };
  return value;
}

function createPropService(ctx) {
  __assertMats(ctx);
  const service = Yg(ctx);
  return {
    names: () => service.names(),
    has: (id) => !!Gi[id] && !!Xg[id],
    build: (id, opts = {}) => __buildChecked(ctx, id, opts),
    registry: Xg,
    sizes: Gi,
  };
}

function buildProp(ctx, id, opts = {}) { return __buildChecked(ctx, id, opts); }
  return { createPropService, buildProp, Yg, Gi, Xg, _i, jn, Kn, io };
})();

/* ── player-tuning ── 原文，仅替换 import ── */
window.ASSET_MODULES["player-tuning"] = (function () {

/**
 * 玩家运动调参 · Aurora-Player
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L4191:C51585  var Pi（尺度）
 *                                        L5939:C100464  var Mt（运动）
 *
 * 手感的全部来源就是这 45 个数。原版把它们写成一个对象，
 * 但没有版本号、没有单位注释、没有区间校验——这里补齐这三样。
 *
 * 依赖：无。
 */

/** 尺度：眼高、蹲眼高、胶囊半径、身高等，米制。 */
const SCALE = {
  eye: 1.68,
  crouchEye: 1.05,
  radius: 0.32,
  height: 1.8,
  fov: 74,
  viewFov: 54,
};

// 原文 Mt 里写的是 Pi.height，保留同名局部引用，避免改动原表
const Pi = SCALE;

/** 运动：速度、加速度、重力、步幅、后坐、镜头。 */
const TUNING = {walk:3.8,sprint:6.4,crouch:1.9,ads:2.4,accelGround:34,decelGround:26,accelAir:9,gravity:21,jumpApex:1,coyote:.12,jumpBuffer:.13,standHeight:Pi.height,crouchHeight:1.15,eyeRate:11,stride:{walk:1.55,sprint:2.1,crouch:1.05},bobY:.024,bobX:.013,bobSprint:1.9,bobAds:.22,rollStrafe:.02,landDip:.36,landDipMax:.2,fovSprint:6,fovAds:52,adsLook:.6,regenDelay:4,regenRate:25,recoilKeep:.35,recoilApply:34,recoilRecover:6.5,recoilHold:.09,shakeDecay:1.7,shakePitch:.03,shakeYaw:.03,shakeRoll:.045,pitchLimit:1.5};

/** 字段语义与单位。原版无注释，此处按量纲标注。 */
const UNITS = {
  walk: "m/s", sprint: "m/s", crouch: "m/s", ads: "m/s",
  accelGround: "m/s²", decelGround: "m/s²", accelAir: "m/s²", gravity: "m/s²",
  jumpApex: "m", coyote: "s", jumpBuffer: "s",
  standHeight: "m", crouchHeight: "m", eyeRate: "1/s",
  bobY: "m", bobX: "m", bobSprint: "×", bobAds: "×",
  rollStrafe: "rad/m", landDip: "m", landDipMax: "m",
  fovSprint: "deg", fovAds: "deg", adsLook: "×",
  regenDelay: "s", regenRate: "hp/s",
  recoilKeep: "0-1", recoilApply: "×", recoilRecover: "1/s", recoilHold: "s",
  shakeDecay: "1/s", shakePitch: "rad", shakeYaw: "rad", shakeRoll: "rad",
  pitchLimit: "rad",
};

/** 由 gravity 与 jumpApex 反解初速，原版写的就是这条式子。 */
const jumpSpeed = Math.sqrt(2 * TUNING.gravity * TUNING.jumpApex);

/** 步幅频率 → 每秒步数，给脚步声与镜头起伏共用。 */
function stepRate(mode = "walk") {
  return TUNING.stride[mode] || TUNING.stride.walk;
}

/** 体检：速度必须为正、重力为正、蹲高低于站高。 */
function validate() {
  const issues = [];
  for (const k of ["walk", "sprint", "crouch", "ads"]) {
    if (!(TUNING[k] > 0)) issues.push(`${k} 必须为正`);
  }
  if (!(TUNING.gravity > 0)) issues.push("gravity 必须为正");
  if (!(TUNING.crouchHeight < TUNING.standHeight)) issues.push("crouchHeight 必须低于 standHeight");
  if (!(TUNING.walk < TUNING.sprint)) issues.push("sprint 应快于 walk");
  return issues;
}

const __default = { SCALE, TUNING, UNITS, jumpSpeed, stepRate, validate };
  return { SCALE, TUNING, UNITS, jumpSpeed, stepRate, validate, default: __default };
})();

/* ── weapon-tuning ── 原文，仅替换 import ── */
window.ASSET_MODULES["weapon-tuning"] = (function () {

/**
 * 武器数值与后坐弹簧 · Aurora-Weapon
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L6065:C68  Gv=30 / B_=150 / H_=26 / O_=720
 *                                        L6065:C5784 弹簧组 kZ/kP/kY/kR/…
 *                                        L6065  pa()/ma() 弹簧积分器
 *
 * 原版把这 4 个核心数值写成了裸变量（Gv/B_/H_/O_），连名字都没有。
 * 数值可量化，但"可管理"需要名字、单位、派生量与引用关系——这里补上。
 *
 * 依赖：无。
 */

const WEAPON = {
  id: "pac9",
  name: "PAC-9",
  magSize: 30,        // 发
  reserve: 150,       // 发
  damage: 26,         // hp/发
  weakPointMul: 2.2,  // 弱点倍率
  rpm: 720,           // 发/分
  spread: 0.0125,     // 弧度（腰射基础扩散）
};

/** 派生量：由核心数值算出，避免消费方各自除一遍。 */
const DERIVED = {
  /** 两发间隔，秒 */
  fireInterval: 60 / WEAPON.rpm,
  /** 理论 DPS（不含换弹与弱点） */
  dps: (60 / WEAPON.rpm) > 0 ? WEAPON.damage * (WEAPON.rpm / 60) : 0,
  /** 满弹匣可造成的伤害 */
  magPotential: WEAPON.magSize * WEAPON.damage,
  /** 总携弹量 / 弹匣数 */
  mags: 1 + Math.floor(WEAPON.reserve / WEAPON.magSize),
};

/**
 * 弹簧组：k 是刚度，c 是阻尼。原版 9 组共用同一个积分器，
 * 分别驱动后坐位移、俯仰、偏航、滚转、摆动、跳跃起伏。
 */
const SPRINGS = {
  kickZ: [520, 30],
  kickPitch: [380, 26],
  kickYaw: [300, 22],
  kickRoll: [300, 20],
  swayYaw: [110, 15],
  swayPitch: [110, 15],
  jumpY: [140, 13],
  jumpPitch: [140, 13],
  bump: [600, 30],
};

/** 换弹时间表（秒）：原版 ue/$ 两条关键帧轨的终点与弹药提交点。 */
const RELOAD = {
  tacticalTotal: 2.1,
  emptyTotal: 2.72,
  ammoCommit: 1.345,
  magOut: 0.47,
};

/** 造一根弹簧。 */
const spring = (k, c) => ({ x: 0, v: 0, k, c });

/**
 * 积分一帧。原版 ma(s, target, dt)：dt>0.012 时自动切成 ≤8ms 的子步，
 * 这是为了低帧率下弹簧不炸——属于必须保留的实现细节。
 */
function integrate(s, target, dt) {
  const n = dt > 0.012 ? Math.ceil(dt / 0.008) : 1;
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += ((target - s.x) * s.k - s.v * s.c) * h;
    s.x += s.v * h;
  }
  return s.x;
}

const __default = { WEAPON, DERIVED, SPRINGS, RELOAD, spring, integrate };
  return { WEAPON, DERIVED, SPRINGS, RELOAD, spring, integrate, default: __default };
})();

/* ── ai-tuning ── 原文，仅替换 import ── */
window.ASSET_MODULES["ai-tuning"] = (function () {

/**
 * 敌人感知调参 · Aurora-AI
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L6065:C60541  var Ui
 *
 * 14 个数决定了"敌人能不能发现你"。gull / hound 两个变体对象是构造器，
 * 不属于数值资产，未抽入；其参数继承本表。
 *
 * 依赖：无。
 */

const TUNING = {sightRange:45,sightCone:200,loseSight:4,searchTime:8,hearRadius:45,maxTokens:2,maxTokensCrowd:3,tokenGap:1.25,exposureUp:.1,exposureDown:.45,poolGulls:10,poolHounds:8,maxWrecks:5,maxBolts:32};

/** 视锥半角的余弦，原版用 Math.cos(cone/2) 做点积判定。 */
const SIGHT_COS = Math.cos((TUNING.sightCone / 2) * Math.PI / 180);

/** 体检：角度在 (0,360)，时间与池容量为正。 */
function validate() {
  const issues = [];
  if (!(TUNING.sightRange > 0)) issues.push("sightRange 必须为正");
  if (!(TUNING.sightCone > 0 && TUNING.sightCone < 360)) issues.push("sightCone 应在 (0,360)");
  if (!(TUNING.hearRadius > 0)) issues.push("hearRadius 必须为正");
  if (!(TUNING.maxTokens >= 1)) issues.push("maxTokens 至少 1");
  return issues;
}

const __default = { TUNING, SIGHT_COS, validate };
  return { TUNING, SIGHT_COS, validate, default: __default };
})();

/* ── audio-recipes ── 原文，仅替换 import ── */
window.ASSET_MODULES["audio-recipes"] = (function () {

/**
 * 音效配方 · Aurora-Sound
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5939:C64931  var Go
 *
 * 57 条配方。每条描述"这个声音应该怎么混"：几层声部(n)、采样率档(sr)、
 * 峰值(peak)、总线(bus: near/dry/world)、同时发声上限(max)、优先级(pri)、
 * 是否开场地板(boot)、世界坐标下的参考距离(ref)与滚降(roll)。
 *
 * 边界：合成波形本身是 57 个生成器函数（gen 指向），依赖 WebAudio 上下文，
 * 未抽入本模块。本模块只保证"混音配方"这一层可独立管理与比对——
 * 换引擎时这一层能整体搬走，生成器需要重写。
 *
 * 依赖：无。
 */

const RECIPES = {
  rifle_shot:            { gen: "KR", n: 4, sr: "ki", peak: 0.97, bus: "near", max: 5, pri: 9, boot: 1 },
  rifle_tail_out:        { gen: "QR", n: 2, sr: "Xn", peak: 0.5, bus: "dry", max: 3, pri: 8, boot: 1 },
  rifle_tail_in:         { gen: "e8", n: 2, sr: "Xn", peak: 0.62, bus: "dry", max: 3, pri: 8, boot: 1 },
  rifle_dry:             { gen: "t8", n: 1, sr: "ki", peak: 0.5, bus: "near", max: 2, pri: 6, boot: 1 },
  reload_magout:         { gen: "n8", n: 1, sr: "ki", peak: 0.6, bus: "near", max: 2, pri: 6 },
  reload_magin:          { gen: "i8", n: 1, sr: "ki", peak: 0.65, bus: "near", max: 2, pri: 6 },
  reload_bolt:           { gen: "s8", n: 1, sr: "ki", peak: 0.8, bus: "near", max: 2, pri: 6 },
  shell_bounce:          { gen: "o8", n: 3, sr: "ki", peak: 0.3, bus: "world", max: 4, pri: 1, ref: 2, roll: 1 },
  step_concrete:         { gen: "r8", n: 4, sr: "Xn", peak: 0.45, bus: "near", max: 3, pri: 3, boot: 1 },
  step_water:            { gen: "a8", n: 3, sr: "Xn", peak: 0.5, bus: "near", max: 3, pri: 3, boot: 1 },
  step_metal:            { gen: "l8", n: 3, sr: "Xn", peak: 0.5, bus: "near", max: 3, pri: 3, boot: 1 },
  land:                  { gen: "c8", n: 1, sr: "Xn", peak: 0.7, bus: "near", max: 2, pri: 4 },
  jump:                  { gen: "u8", n: 1, sr: "Xn", peak: 0.35, bus: "near", max: 2, pri: 3 },
  hurt:                  { gen: "h8", n: 1, sr: "Xn", peak: 0.85, bus: "dry", max: 2, pri: 8 },
  ear_ring:              { gen: "f8", n: 1, sr: "pl", peak: 0.2, bus: "dry", max: 1, pri: 5 },
  impact_metal:          { gen: "d8", n: 3, sr: "ki", peak: 0.7, bus: "world", max: 4, pri: 4, ref: 4, roll: 0.7 },
  impact_concrete:       { gen: "p8", n: 3, sr: "ki", peak: 0.7, bus: "world", max: 4, pri: 4, ref: 4, roll: 0.7 },
  impact_wood:           { gen: "m8", n: 2, sr: "ki", peak: 0.7, bus: "world", max: 3, pri: 4, ref: 4, roll: 0.7 },
  impact_water:          { gen: "g8", n: 2, sr: "Xn", peak: 0.6, bus: "world", max: 3, pri: 4, ref: 4, roll: 0.7 },
  impact_enemy:          { gen: "v8", n: 3, sr: "ki", peak: 0.75, bus: "world", max: 4, pri: 5, ref: 5, roll: 0.6 },
  impact_glass:          { gen: "x8", n: 1, sr: "ki", peak: 0.6, bus: "world", max: 2, pri: 4, ref: 4, roll: 0.7 },
  whiz:                  { gen: "b8", n: 3, sr: "ki", peak: 0.5, bus: "world", max: 3, pri: 5, ref: 2.5, roll: 0.6 },
  ricochet:              { gen: "y8", n: 3, sr: "ki", peak: 0.4, bus: "world", max: 2, pri: 3, ref: 5, roll: 0.6 },
  gull_fire:             { gen: "E8", n: 2, sr: "ki", peak: 0.85, bus: "world", max: 5, pri: 7, ref: 7, roll: 0.55 },
  hound_fire:            { gen: "S8", n: 2, sr: "ki", peak: 0.95, bus: "world", max: 5, pri: 7, ref: 8, roll: 0.5 },
  hound_step:            { gen: "T8", n: 3, sr: "Xn", peak: 0.7, bus: "world", max: 4, pri: 3, ref: 5, roll: 0.8 },
  gull_die:              { gen: "A8", n: 1, sr: "Xn", peak: 0.85, bus: "world", max: 3, pri: 7, ref: 7, roll: 0.5 },
  hound_die:             { gen: "R8", n: 1, sr: "Xn", peak: 0.9, bus: "world", max: 3, pri: 7, ref: 7, roll: 0.5 },
  telegraph:             { gen: "P8", n: 2, sr: "Xn", peak: 0.42, bus: "world", max: 4, pri: 6, ref: 6, roll: 0.6 },
  alert:                 { gen: "C8", n: 2, sr: "Xn", peak: 0.5, bus: "world", max: 3, pri: 6, ref: 8, roll: 0.5 },
  explosion:             { gen: "I8", n: 2, sr: "ki", peak: 0.97, bus: "world", max: 3, pri: 10, ref: 12, roll: 0.5 },
  relay_cut:             { gen: "z8", n: 1, sr: "Xn", peak: 0.75, bus: "world", max: 2, pri: 8, ref: 6, roll: 0.5 },
  thunder:               { gen: "D8", n: 2, sr: "pl", peak: 0.8, bus: "dry", max: 2, pri: 6 },
  foghorn:               { gen: "L8", n: 1, sr: "pl", peak: 0.5, bus: "world", max: 1, pri: 2 },
  gull_cry:              { gen: "k8", n: 2, sr: "pl", peak: 0.4, bus: "world", max: 2, pri: 1 },
  halyard:               { gen: "F8", n: 2, sr: "Xn", peak: 0.3, bus: "world", max: 2, pri: 1 },
  container_bang:        { gen: "U8", n: 1, sr: "pl", peak: 0.6, bus: "world", max: 1, pri: 2 },
  ui_click:              { gen: "N8", n: 1, sr: "ki", peak: 0.3, bus: "dry", max: 2, pri: 9 },
  ui_hover:              { gen: "B8", n: 1, sr: "ki", peak: 0.12, bus: "dry", max: 2, pri: 9 },
  objective:             { gen: "Z8", n: 1, sr: "Xn", peak: 0.6, bus: "music", max: 1, pri: 9 },
  objective_all:         { gen: "j8", n: 1, sr: "Xn", peak: 0.65, bus: "music", max: 1, pri: 9 },
  complete:              { gen: "J8", n: 1, sr: "Xn", peak: 0.7, bus: "music", max: 1, pri: 9 },
  death:                 { gen: "K8", n: 1, sr: "Xn", peak: 0.75, bus: "music", max: 1, pri: 9 },
  gull_rotor:            { gen: "_8", n: 1, sr: "Xn", peak: 0.6, ref: 5, roll: 0.9 },
  hound_servo:           { gen: "M8", n: 1, sr: "Xn", peak: 0.42, ref: 4, roll: 1 },
  relay_hum:             { gen: "w8", n: 1, sr: "Xn", peak: 0.4, ref: 2.5, roll: 1.4 },
  rain:                  { gen: "O8", n: 1, sr: "Xn", peak: 0.5 },
  rain_interior:         { gen: "H8", n: 1, sr: "Xn", peak: 0.7 },
  wind:                  { gen: "V8", n: 1, sr: "pl", peak: 0.5 },
  sea:                   { gen: "W8", n: 1, sr: "pl", peak: 0.5, ref: 10, roll: 0.6 },
  music_drone:           { gen: "G8", n: 1, sr: "Fr.sr", peak: 0.5 },
  music_ost:             { gen: "q8", n: 1, sr: "Fr.sr", peak: 0.45 },
  music_perc:            { gen: "X8", n: 1, sr: "Fr.sr", peak: 0.7 },
  music_brass:           { gen: "Y8", n: 1, sr: "Fr.sr", peak: 0.45 },
  music_motif:           { gen: "$8", n: 1, sr: "Fr.sr", peak: 0.45 },
  ir_outdoor:            { gen: "Q8", n: 1, sr: "ki", peak: 0.9 },
  ir_shed:               { gen: "eC", n: 1, sr: "ki", peak: 0.9 },
};

const RECIPE_IDS = Object.keys(RECIPES);

/** 总线用量统计：预算分配看这个。 */
function busLoad() {
  const out = {};
  for (const r of Object.values(RECIPES)) {
    const b = r.bus || "unset";
    out[b] = (out[b] || 0) + 1;
  }
  return out;
}

/** 同时发声上限之和：音频线程压力的上界。 */
function voiceBudget() {
  return Object.values(RECIPES).reduce((s, r) => s + (r.max || 0), 0);
}

/** 按总线筛。 */
function byBus(bus) {
  return RECIPE_IDS.filter((id) => RECIPES[id].bus === bus);
}

const __default = { RECIPES, RECIPE_IDS, busLoad, voiceBudget, byBus };
  return { RECIPES, RECIPE_IDS, busLoad, voiceBudget, byBus, default: __default };
})();
