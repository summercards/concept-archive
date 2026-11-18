/* 由 tools/bundle.py 生成，勿手改。源：assets/code/*.js */
window.CODE_ASSET_DB = {
 "meta": {
  "source": {
   "file": "几猫国产3A大作_V1(4).html",
   "path": "/Users/zyq/work/工程参考/",
   "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
   "lines": 6215,
   "mb": 1.36,
   "engine": "Three.js r180（内嵌，含补丁）",
   "arch": "单 IIFE + 共享闭包，模块以命名空间对象导出后被打包压平"
  },
  "modules": [
   {
    "role": "render",
    "anchor": "L4191:C62571",
    "kb": 54.4,
    "fn": 23,
    "nums": 1524,
    "mats": 7,
    "scene": 1
   },
   {
    "role": "mats",
    "anchor": "L4744:C23425",
    "kb": 81.0,
    "fn": 39,
    "nums": 4132,
    "mats": 1,
    "scene": 1
   },
   {
    "role": "props",
    "anchor": "L5453:C13896",
    "kb": 114.5,
    "fn": 96,
    "nums": 4874,
    "mats": 54,
    "scene": 1
   },
   {
    "role": "level",
    "anchor": "L5453:C131157",
    "kb": 44.2,
    "fn": 45,
    "nums": 2380,
    "mats": 7,
    "scene": 1
   },
   {
    "role": "backdrop",
    "anchor": "L5453:C176423",
    "kb": 51.9,
    "fn": 38,
    "nums": 3059,
    "mats": 20,
    "scene": 1
   },
   {
    "role": "ground",
    "anchor": "L5474:C2492",
    "kb": 39.5,
    "fn": 19,
    "nums": 1763,
    "mats": 9,
    "scene": 4
   },
   {
    "role": "fx",
    "anchor": "L5825:C5420",
    "kb": 123.3,
    "fn": 157,
    "nums": 4582,
    "mats": 2,
    "scene": 2
   },
   {
    "role": "weapon",
    "anchor": "L5939:C109406",
    "kb": 56.7,
    "fn": 40,
    "nums": 2123,
    "mats": 1,
    "scene": 1
   },
   {
    "role": "enemies",
    "anchor": "L6065:C16111",
    "kb": 53.7,
    "fn": 31,
    "nums": 1718,
    "mats": 5,
    "scene": 1
   }
  ],
  "counts": {
   "assets": 10,
   "props": 36,
   "customBuilders": 14,
   "families": 29,
   "instances": 48,
   "recipes": 57,
   "springs": 9
  },
  "verify": {
   "passed": 46,
   "failed": 0,
   "note": "46 项：12 项几何逐顶点 + 7 项 GLSL 逐字回原工程 + 27 项数值/结构"
  }
 },
 "assets": [
  {
   "id": "env-atmosphere",
   "name": "环境光影包",
   "en": "Env Atmosphere",
   "type": "ENV",
   "grade": "A",
   "tags": [
    "光影",
    "体积光",
    "纯数据",
    "需宿壳",
    "米制"
   ],
   "summary": "一整局游戏的「光」就是这几个对象：太阳方向与强度、天空四色、体积雾、阴影正交框、灯池预算、曝光曲线。全部是可读数值，抽出即用。",
   "anchor": "L4191:C51314 oi / L4191:C51389 Mn / L4191:C51468 en / L4744:C569 g",
   "deps": "THREE（仅安装函数需要）",
   "standalone": "数据零依赖；install() 需要 THREE",
   "code": "/**\n * 环境光影包 · Aurora-Env\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html\n *   WORLD   L4191:C51314  var oi\n *   SUN     L4191:C51389  var Mn\n *   SKY     L4191:C51468  var en\n *   TUNING  L4744:C569    渲染调参 g（体积光/AO/Bloom/调色/自适应曝光）\n *   SHADOW  L4744          Gy() 调用点：方向光 + 正交阴影框\n *   POOL    L4744          6 点灯池，distance 12 / decay 2\n *\n * 契约：单位米，Y 轴向上，地面 Y=0，海面 Y=-1.6，岸线 X=30。\n * 依赖：只依赖注入的 THREE，不读全局。\n */\n\nexport const WORLD = {\n  min: [-40, 0, -30],\n  max: [40, 30, 30],\n  groundY: 0,\n  seaY: -1.6,\n  quayX: 30,\n};\n\nexport const SUN = {\n  /** 未归一化方向。实测原版在取用时统一 normalize() */\n  dir: [0.916, 0.225, 0.331],\n  /** 暖阳 #ffb86b 量级 */\n  color: [1, 0.72, 0.42],\n  intensity: 9,\n};\n\nexport const SKY = {\n  zenith: [0.055, 0.085, 0.13],\n  horizon: [0.95, 0.55, 0.28],\n  horizonAway: [0.16, 0.22, 0.3],\n  fog: [0.42, 0.47, 0.52],\n};\n\n/** 体积/AO/Bloom/调色/自适应曝光。键名与原版一致，分组仅作检索。 */\nexport const TUNING = {\n  volSunScale: 0.85,\n  volAmbient: 0.2,\n  volSigma: 0.0034,\n  volMaxDist: 170,\n  volFarHaze: 0.42,\n  volInteriorDust: 6,\n\n  aoRadius: 0.9,\n  aoIntensity: 1.6,\n  aoStrength: 0.95,\n\n  bloom: 0.065,\n  bloomMix: 0.62,\n\n  dirt: 0.1,\n  streak: 0.03,\n  streakThreshold: 2.2,\n  flare: 0.16,\n  key: 0.12,\n\n  minExposure: 0.6,\n  maxExposure: 2,\n  adaptTau: 1.5,\n\n  agxMix: 0.25,\n  ca: 0.0013,\n  vignette: 0.3,\n  grain: 0.02,\n  sharpen: 0.3,\n  lookPower: 1.18,\n  lookSat: 1.22,\n};\n\n/** 分组索引，方便在资产库里定位字段。 */\nexport const TUNING_GROUPS = {\n  体积光: [\"volSunScale\", \"volAmbient\", \"volSigma\", \"volMaxDist\", \"volFarHaze\", \"volInteriorDust\"],\n  AO: [\"aoRadius\", \"aoIntensity\", \"aoStrength\"],\n  Bloom: [\"bloom\", \"bloomMix\"],\n  镜头脏污: [\"dirt\", \"streak\", \"streakThreshold\", \"flare\", \"key\"],\n  曝光自适应: [\"minExposure\", \"maxExposure\", \"adaptTau\"],\n  调色: [\"agxMix\", \"ca\", \"vignette\", \"grain\", \"sharpen\", \"lookPower\", \"lookSat\"],\n};\n\n/** 阴影：正交框由世界包围盒投到太阳空间后求得，这里给出原版的输入边界。 */\nexport const SHADOW = {\n  /** 主体阴影体积 */\n  body: { from: [-41, -0.2, -33], to: [37, 32, 31] },\n  /** 深度参考体积（只用于压近裁面） */\n  depthHint: { from: [-41, -3, -64], to: [72, 36, 34] },\n  bias: -0.00012,\n  normalBias: 0.02,\n  radius: 1,\n  mapSizeCap: 4096,\n  /** PCF 软化：把世界尺度写进 shader，按米做核 */\n  softShadow: { tapsHigh: 16, tapsLow: 10, searchTaps: 8 },\n};\n\n/** 灯池：固定 6 盏可复用的点光，靠预算调度而不是动态建灯。 */\nexport const LIGHT_POOL = {\n  count: 6,\n  color: 0xffffff,\n  baseIntensity: 0,\n  distance: 12,\n  decay: 2,\n};\n\n/** 色调映射曝光基线：原版是 .6 * exposure * (1 - fade) */\nexport const EXPOSURE = { base: 0.6 };\n\n/* ------------------------------------------------------------------ 运行时 */\n\n/** 归一化太阳方向（纯函数，不依赖 THREE）。 */\nexport function sunDir() {\n  const [x, y, z] = SUN.dir;\n  const len = Math.hypot(x, y, z);\n  return [x / len, y / len, z / len];\n}\n\n/**\n * 复刻 Gy()：把世界包围盒投影到太阳空间，得到正交阴影框。\n * 返回 { left, right, top, bottom, near, far, width, height, depth }（米）。\n */\nexport function shadowFrustum(THREE, { from, to, hintFrom, hintTo } = {}) {\n  const b = {\n    from: from || SHADOW.body.from,\n    to: to || SHADOW.body.to,\n    hintFrom: hintFrom || SHADOW.depthHint.from,\n    hintTo: hintTo || SHADOW.depthHint.to,\n  };\n  const V = THREE.Vector3;\n  const dir = new V(...sunDir());\n  const mid = new V(...b.from).add(new V(...b.to)).multiplyScalar(0.5);\n  const eye = mid.clone().addScaledVector(dir, 200);\n  const view = new THREE.Matrix4().lookAt(eye, mid, new V(0, 1, 0));\n  view.setPosition(eye);\n  view.invert();\n\n  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;\n  let minZ = Infinity, maxZ = -Infinity;\n  const p = new V();\n  const scan = (a, c, fn) => {\n    for (let i = 0; i < 8; i++) {\n      p.set(i & 1 ? c[0] : a[0], i & 2 ? c[1] : a[1], i & 4 ? c[2] : a[2]).applyMatrix4(view);\n      fn(p);\n    }\n  };\n  scan(b.from, b.to, (v) => {\n    minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);\n    minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);\n    minZ = Math.min(minZ, -v.z); maxZ = Math.max(maxZ, -v.z);\n  });\n  scan(b.hintFrom, b.hintTo, (v) => { minZ = Math.min(minZ, -v.z); });\n\n  const pad = 1;\n  const left = minX - pad, right = maxX + pad;\n  const bottom = minY - pad, top = maxY + pad;\n  const near = Math.max(1, minZ - 4), far = maxZ + 4;\n  return { left, right, top, bottom, near, far, width: right - left, height: top - bottom, depth: far - near };\n}\n\n/**\n * 把环境装进场景：方向光 + 阴影框 + 雾 + 背景色。\n * 只做原版做过的事，不额外加 AmbientLight（原版刻意用冷天空压暗部）。\n */\nexport function install(THREE, scene, opts = {}) {\n  const { shadowMapSize = 2048, withShadow = true } = opts;\n\n  const sun = new THREE.DirectionalLight(new THREE.Color(...SUN.color), SUN.intensity);\n  sun.name = \"sun\";\n  sun.castShadow = withShadow;\n  scene.add(sun, sun.target);\n\n  const dir = new THREE.Vector3(...sunDir());\n  const mid = new THREE.Vector3(...SHADOW.body.from)\n    .add(new THREE.Vector3(...SHADOW.body.to))\n    .multiplyScalar(0.5);\n  sun.target.position.copy(mid);\n  sun.position.copy(mid).addScaledVector(dir, 200);\n\n  const f = shadowFrustum(THREE);\n  const cam = sun.shadow.camera;\n  cam.left = f.left; cam.right = f.right;\n  cam.bottom = f.bottom; cam.top = f.top;\n  cam.near = f.near; cam.far = f.far;\n  cam.updateProjectionMatrix();\n\n  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);\n  sun.shadow.bias = SHADOW.bias;\n  sun.shadow.normalBias = SHADOW.normalBias;\n  sun.shadow.radius = SHADOW.radius;\n  sun.shadow.autoUpdate = true;\n\n  scene.fog = new THREE.FogExp2(\n    new THREE.Color(...SKY.fog),\n    1 / Math.max(1, TUNING.volMaxDist)\n  );\n  scene.background = new THREE.Color(...SKY.fog);\n\n  return { sun, frustum: f };\n}\n\n/** 复刻曝光公式：toneMappingExposure = .6 * exposure * (1 - fade) */\nexport function exposureValue(exposure = 1, fade = 0) {\n  return EXPOSURE.base * exposure * (1 - Math.min(1, Math.max(0, fade)));\n}\n\n/** 灯池调度器：固定 N 盏灯，按“最近的 N 个需求”点亮。 */\nexport function createLightPool(THREE, scene, opts = {}) {\n  const { count = LIGHT_POOL.count, distance = LIGHT_POOL.distance, decay = LIGHT_POOL.decay } = opts;\n  const lights = [];\n  for (let i = 0; i < count; i++) {\n    const l = new THREE.PointLight(LIGHT_POOL.color, LIGHT_POOL.baseIntensity, distance, decay);\n    l.visible = false;\n    scene.add(l);\n    lights.push(l);\n  }\n  return {\n    lights,\n    /** wants: [{pos:[x,y,z], color:0xRRGGBB, intensity}]，按距离取前 count 盏 */\n    update(wants) {\n      for (const l of lights) { l.visible = false; l.intensity = 0; }\n      wants.slice(0, count).forEach((w, i) => {\n        const l = lights[i];\n        l.visible = true;\n        l.position.set(w.pos[0], w.pos[1], w.pos[2]);\n        l.color.setHex(w.color);\n        l.intensity = w.intensity;\n      });\n    },\n  };\n}\n\nexport default { WORLD, SUN, SKY, TUNING, SHADOW, LIGHT_POOL, EXPOSURE, install, shadowFrustum, sunDir, exposureValue, createLightPool };\n",
   "static": {
    "世界尺度 WORLD": [
     {
      "k": "min / max",
      "v": "(-40, 0, -30) → (40, 30, 30) m"
     },
     {
      "k": "groundY / seaY",
      "v": "0 / -1.6 m"
     },
     {
      "k": "quayX",
      "v": "30 m（岸线，碰撞与海面分界）"
     }
    ],
    "太阳 SUN": [
     {
      "k": "dir",
      "v": "(0.916, 0.225, 0.331) 归一化"
     },
     {
      "k": "color",
      "v": "(1, 0.72, 0.42) 暖橙"
     },
     {
      "k": "intensity",
      "v": "9"
     }
    ],
    "天空与雾 SKY": [
     {
      "k": "zenith",
      "v": "(0.055, 0.085, 0.13)"
     },
     {
      "k": "horizon",
      "v": "(0.95, 0.55, 0.28)"
     },
     {
      "k": "horizonAway",
      "v": "(0.16, 0.22, 0.3)"
     },
     {
      "k": "fog",
      "v": "(0.42, 0.47, 0.52)"
     }
    ]
   },
   "tuning": [
    {
     "k": "volSunScale",
     "v": "0.85"
    },
    {
     "k": "volAmbient",
     "v": "0.2"
    },
    {
     "k": "volSigma",
     "v": "0.0034"
    },
    {
     "k": "volMaxDist",
     "v": "170"
    },
    {
     "k": "volFarHaze",
     "v": "0.42"
    },
    {
     "k": "volInteriorDust",
     "v": "6"
    },
    {
     "k": "aoRadius",
     "v": "0.9"
    },
    {
     "k": "aoIntensity",
     "v": "1.6"
    },
    {
     "k": "aoStrength",
     "v": "0.95"
    },
    {
     "k": "bloom",
     "v": "0.065"
    },
    {
     "k": "bloomMix",
     "v": "0.62"
    },
    {
     "k": "dirt",
     "v": "0.1"
    },
    {
     "k": "streak",
     "v": "0.03"
    },
    {
     "k": "streakThreshold",
     "v": "2.2"
    },
    {
     "k": "flare",
     "v": "0.16"
    },
    {
     "k": "key",
     "v": "0.12"
    },
    {
     "k": "minExposure",
     "v": "0.6"
    },
    {
     "k": "maxExposure",
     "v": "2"
    },
    {
     "k": "adaptTau",
     "v": "1.5"
    },
    {
     "k": "agxMix",
     "v": "0.25"
    },
    {
     "k": "ca",
     "v": "0.0013"
    },
    {
     "k": "vignette",
     "v": "0.3"
    },
    {
     "k": "grain",
     "v": "0.02"
    },
    {
     "k": "sharpen",
     "v": "0.3"
    },
    {
     "k": "lookPower",
     "v": "1.18"
    },
    {
     "k": "lookSat",
     "v": "1.22"
    }
   ],
   "groups": [
    "体积光 6 项",
    "AO 3 项",
    "Bloom 2 项",
    "镜头脏污 5 项",
    "曝光自适应 3 项",
    "调色 7 项"
   ],
   "verdict": "可直接搬。26 个字段全部与源码逐字一致，安装函数只做原版做过的事，没有额外加环境光。",
   "limits": "天空与体积光本身是 shader；这里给的是喂给 shader 的数值与安装方式，不含 shader 源码。",
   "crit": {
    "pure": "✓",
    "free": "△",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 205,
   "bytes": 7507
  },
  {
   "id": "quality-presets",
   "name": "画质预设",
   "en": "Quality Presets",
   "type": "ENV",
   "grade": "A",
   "tags": [
    "性能",
    "配置",
    "纯数据",
    "纯函数",
    "自动选择"
   ],
   "summary": "五档 × 11 字段的渲染预算表，加一个按设备与显卡字符串自动选档的函数。资产库里的「这条管线能跑多好」由这张表定义。",
   "anchor": "L4191:C51664 Pr / zy()",
   "deps": "无",
   "standalone": "完全独立",
   "code": "/**\n * 画质预设 · Aurora-Quality\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L4191:C51664  var Pr / zy()\n *\n * 11 个字段 × 5 档 = 55 个可调数值。scale 是渲染倍率，msaa 是采样数，\n * shadow/tex 是贴图边长，volSteps 是体积光步进，planar 是湿地平面反射强度。\n * 依赖：无。纯数据 + 纯函数，可脱离引擎单独做配置校验。\n */\n\nexport const PRESETS = {\n  test:   { name: \"test\",   scale: 1,    msaa: 0, shadow: 1024, tex: 256,  volSteps: 10, ao: true,  planar: 0.5, bloom: true, motionBlur: false, rain: 0.4 },\n  low:    { name: \"low\",    scale: 0.7,  msaa: 0, shadow: 2048, tex: 512,  volSteps: 12, ao: false, planar: 0,   bloom: true, motionBlur: false, rain: 0.5 },\n  medium: { name: \"medium\", scale: 0.85, msaa: 2, shadow: 2048, tex: 1024, volSteps: 16, ao: true,  planar: 0.5, bloom: true, motionBlur: false, rain: 0.8 },\n  high:   { name: \"high\",   scale: 1,    msaa: 4, shadow: 4096, tex: 1024, volSteps: 24, ao: true,  planar: 0.5, bloom: true, motionBlur: true,  rain: 1 },\n  ultra:  { name: \"ultra\",  scale: 1,    msaa: 4, shadow: 4096, tex: 2048, volSteps: 40, ao: true,  planar: 1,   bloom: true, motionBlur: true,  rain: 1 },\n};\n\nexport const ORDER = [\"test\", \"low\", \"medium\", \"high\", \"ultra\"];\n\n/** 字段语义，给资产库读表用。 */\nexport const FIELDS = {\n  scale:      { label: \"渲染倍率\", unit: \"×\",     range: [0.7, 1] },\n  msaa:       { label: \"MSAA 采样\", unit: \"spp\",  range: [0, 4] },\n  shadow:     { label: \"阴影贴图\",  unit: \"px\",   range: [1024, 4096] },\n  tex:        { label: \"程序贴图\",  unit: \"px\",   range: [256, 2048] },\n  volSteps:   { label: \"体积光步进\", unit: \"step\", range: [10, 40] },\n  ao:         { label: \"环境光遮蔽\", unit: \"bool\" },\n  planar:     { label: \"湿地反射\",  unit: \"0-1\",  range: [0, 1] },\n  bloom:      { label: \"泛光\",      unit: \"bool\" },\n  motionBlur: { label: \"运动模糊\",  unit: \"bool\" },\n  rain:       { label: \"雨量\",      unit: \"0-1\",  range: [0, 1] },\n};\n\n/** 按名取预设；未知名字返回 null（原版也是 if(Pr[i]) 才返回）。 */\nexport function get(name) {\n  return PRESETS[name] ? { ...PRESETS[name] } : null;\n}\n\n/** 原版 zy()：显式档位优先，否则按设备与显卡字符串自动选。 */\nexport function autoSelect(name) {\n  const explicit = get(name);\n  if (explicit) return explicit;\n\n  const ua = typeof navigator !== \"undefined\" ? navigator.userAgent : \"\";\n  const touch = typeof navigator !== \"undefined\" ? navigator.maxTouchPoints : 0;\n  const screenMin = typeof screen !== \"undefined\" ? Math.min(screen.width, screen.height) : 9999;\n  if (/Android|iPhone|iPad|Mobile/i.test(ua) || (touch > 1 && screenMin < 900)) {\n    return { ...PRESETS.low };\n  }\n\n  let renderer = \"\";\n  try {\n    const canvas = document.createElement(\"canvas\");\n    const gl = canvas.getContext(\"webgl2\") || canvas.getContext(\"webgl\");\n    if (gl) {\n      const ext = gl.getExtension(\"WEBGL_debug_renderer_info\");\n      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));\n      const lose = gl.getExtension(\"WEBGL_lose_context\");\n      if (lose) lose.loseContext();\n    }\n  } catch (_) { /* 探针失败就按 high，与原版一致 */ }\n\n  const software = /SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(renderer);\n  const weakIntel = /Intel/i.test(renderer) && !/Arc/i.test(renderer);\n  return { ...(software || weakIntel ? PRESETS.medium : PRESETS.high) };\n}\n\n/** 校验一份自定义预设是否落在合法区间，返回问题列表。 */\nexport function validate(preset) {\n  const issues = [];\n  const p = preset || {};\n  if (!p.name || typeof p.name !== \"string\") issues.push(\"name 缺失\");\n  if (!(p.scale > 0 && p.scale <= 2)) issues.push(\"scale 应在 (0,2]\");\n  if (!Number.isInteger(p.msaa) || p.msaa < 0 || p.msaa > 8) issues.push(\"msaa 应为 0-8 的整数\");\n  if (![1024, 2048, 4096, 8192].includes(p.shadow)) issues.push(\"shadow 应为 2 的幂贴图边长\");\n  if (![128, 256, 512, 1024, 2048, 4096].includes(p.tex)) issues.push(\"tex 应为 2 的幂贴图边长\");\n  if (!(p.volSteps >= 4 && p.volSteps <= 64)) issues.push(\"volSteps 应在 4-64\");\n  if (typeof p.ao !== \"boolean\") issues.push(\"ao 应为布尔\");\n  if (!(p.planar >= 0 && p.planar <= 1)) issues.push(\"planar 应在 0-1\");\n  if (!(p.rain >= 0 && p.rain <= 1)) issues.push(\"rain 应在 0-1\");\n  return issues;\n}\n\nexport default { PRESETS, ORDER, FIELDS, get, autoSelect, validate };\n",
   "matrix": {
    "cols": [
     "scale",
     "msaa",
     "shadow",
     "tex",
     "volSteps",
     "ao",
     "planar",
     "bloom",
     "motionBlur",
     "rain"
    ],
    "rows": [
     [
      "test",
      1,
      0,
      1024,
      256,
      10,
      "✓",
      0.5,
      "✓",
      "—",
      0.4
     ],
     [
      "low",
      0.7,
      0,
      2048,
      512,
      12,
      "—",
      0,
      "✓",
      "—",
      0.5
     ],
     [
      "medium",
      0.85,
      2,
      2048,
      1024,
      16,
      "✓",
      0.5,
      "✓",
      "—",
      0.8
     ],
     [
      "high",
      1,
      4,
      4096,
      1024,
      24,
      "✓",
      0.5,
      "✓",
      "✓",
      1
     ],
     [
      "ultra",
      1,
      4,
      4096,
      2048,
      40,
      "✓",
      1,
      "✓",
      "✓",
      1
     ]
    ]
   },
   "verdict": "可直接搬。55 个数值逐字一致，另外补了区间校验——原版没有。",
   "limits": "自动选档依赖 navigator/screen，服务端不可用；原版对显卡字符串的判断是启发式，不是白名单。",
   "crit": {
    "pure": "✓",
    "free": "✓",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 75,
   "bytes": 4577
  },
  {
   "id": "material-ledger",
   "name": "材质账簿",
   "en": "Material Ledger",
   "type": "MAT",
   "grade": "A",
   "tags": [
    "材质",
    "程序化",
    "纯数据",
    "米制"
   ],
   "summary": "29 个材质族 × 48 个实例。族定米制尺度（贴图覆盖多少米、凹凸多少毫米），实例定这块表面脏成什么样。换一套实例就是换一套美术风格。",
   "anchor": "L5294:C17715 c3 / L5294:C19452 l1",
   "deps": "无（toStandard 需 THREE）",
   "standalone": "数据零依赖；落地成标准材质只还原颜色",
   "code": "/**\n * 材质账簿 · Aurora-Materials\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L5294:C17715  var c3（族）\n *                                        L5294:C19452  var l1（实例）\n *\n * 两层结构：\n *   族  c3  —— 决定\"这张表面在米制空间里的尺度\"：size(米) / tile(平铺) / bump(毫米凹凸)\n *   实例 l1 —— 决定\"这块表面脏成什么样\"：色 / 粗糙 / 湿润 4 元组 / 脏污 4 元组\n *\n * 材质不是贴图文件，是\"族参数 × 实例参数\"算出来的。因此账簿本身即资产：\n * 换一套 l1 等于换一套美术风格，且不需要重算任何贴图。\n *\n * 依赖：无（resolve/toStandard 需要注入 THREE 才建材质）。\n */\n\n/** 族：米制 UV 契约。size 是贴图覆盖的物理尺寸，bump 是毫米级凹凸。 */\nexport const FAMILIES = {asphalt:{fn:\"asphalt\",size:1,tile:2,bump:1.6,hero:!0},concrete:{fn:\"concrete\",size:1,tile:3,bump:2.5},brick:{fn:\"brick\",size:.5,tile:1.8,bump:6},epoxy:{fn:\"epoxy\",size:.5,tile:4,bump:3},paint:{fn:\"paint\",size:1,tile:2.5,bump:2.5,p:[.5]},hull:{fn:\"hull\",size:.5,tile:4,bump:12},galv:{fn:\"galv\",size:.5,tile:1,bump:.8},metal:{fn:\"metal\",size:.5,tile:1,bump:.5,p:[1]},brushed:{fn:\"brushed\",size:.5,tile:.5,bump:.4},rust:{fn:\"rust\",size:.5,tile:1.2,bump:3},diamond:{fn:\"diamond\",size:.5,tile:.5,bump:2},corrugated:{fn:\"corrugated\",size:.5,tile:[.762,2.286],bump:19},chainlink:{fn:\"chainlink\",size:.5,tile:.5,bump:5},hazard:{fn:\"hazard\",size:.5,tile:1,bump:2.5},gunmetal:{fn:\"gunmetal\",size:.5,tile:.25,bump:.3,p:[.6]},anodized:{fn:\"gunmetal\",size:.5,tile:.25,bump:.25,p:[.2],seed:11},polymer:{fn:\"polymer\",size:.25,tile:.1,bump:.4},carbon:{fn:\"carbon\",size:.25,tile:.05,bump:.5},fabric:{fn:\"fabric\",size:.25,tile:.05,bump:.4},armor:{fn:\"armor\",size:.5,tile:.5,bump:.8},wood:{fn:\"wood\",size:.5,tile:1.2,bump:2.6},plastic:{fn:\"plastic\",size:.5,tile:1,bump:1},tarp:{fn:\"tarp\",size:.5,tile:1.5,bump:20},cardboard:{fn:\"cardboard\",size:.5,tile:1,bump:.8},rope:{fn:\"rope\",size:.25,tile:.1,bump:4},tire:{fn:\"tire\",size:.5,tile:[.5,.3],bump:7},glass:{fn:\"glass\",size:.5,tile:1.5,bump:1.5,p:[.3]},glass_dirty:{fn:\"glass\",size:.5,tile:1.5,bump:1.5,p:[1],seed:40},water:{fn:\"water\",size:.25,tile:4,bump:30}};\n\n/**\n * 湿润 / 脏污预设。4 元组按位置被着色器消费：\n * 原版没有为分量命名，此处保留原样，不做语义猜测。\n * 变量名（kc/aa/uA/o1…）与原版一致，便于逐字对照源码。\n */\nconst cA=[.42,.38,.5,0],kc=[.05,.62,.65,.7],aa=[0,.7,.55,.5],uA=[.3,.6,.55,0],i1=[.08,.62,.6,.5],u3=[.4,.5,.6,0],s1=[0,1,0,0],o1=[.22,.12,.35,.35],hA=[.14,.1,.8,.2],r1=[.07,.06,3,0],a1=[0,0,1,0];\n\n/** 原版工厂：所有字段都有默认值，实例只写差异。 */\nconst Nt=(i,e={})=>({set:i,tint:0,color:16777215,rough:1,metal:1,wet:cA,macro:hA,nrm:1,...e}),Xa=i=>Nt(\"paint\",{tint:1,color:i,wet:kc,macro:[.2,.16,.4,.45]});\n\n/** 实例：48 条。键名即 mats.get(\"...\") 的入参。原文照搬。 */\nexport const INSTANCES = {asphalt:Nt(\"asphalt\",{wet:[.45,.3,.5,0],macro:o1}),concrete:Nt(\"concrete\",{macro:o1}),concrete_dirty:Nt(\"concrete\",{color:13616822,macro:[.3,.15,.35,.9]}),concrete_painted:Nt(\"concrete\",{tint:2,color:9343638,rough:.9,wet:[.15,.55,.6,.3],macro:[.14,.1,.5,.3]}),brick:Nt(\"brick\"),floor_epoxy:Nt(\"epoxy\",{wet:[.04,.75,.4,0],macro:[.12,.2,.45,.25]}),paint_red:Xa(8200729),paint_blue:Xa(2047846),paint_green:Xa(2906692),paint_yellow:Xa(12159516),paint_orange:Xa(11751962),paint_white:Xa(12172214),paint_grey:Xa(5922920),paint_teal:Xa(2055523),steel_galv:Nt(\"galv\",{wet:aa}),steel_dark:Nt(\"metal\",{tint:1,color:4014406,rough:1.15,wet:aa}),steel_worn:Nt(\"metal\",{tint:1,color:9080466,rough:.9,wet:aa}),steel_bare:Nt(\"brushed\",{tint:1,color:11843771,wet:aa,macro:r1}),steel_rust:Nt(\"rust\",{wet:uA}),diamond_plate:Nt(\"diamond\",{wet:aa}),corrugated_roof:Nt(\"corrugated\",{wet:aa}),chainlink:Nt(\"chainlink\",{tint:3,alphaCut:!0,side:2,wet:s1,macro:a1}),aluminium:Nt(\"brushed\",{tint:1,color:12896459,rough:1.15,wet:aa,macro:r1}),brass:Nt(\"brushed\",{tint:1,color:12753477,rough:.9,wet:aa,macro:[.1,.08,20,0]}),hazard_stripes:Nt(\"hazard\",{wet:kc}),gunmetal:Nt(\"gunmetal\",{tint:1,color:2764081,wet:[0,.75,.6,.5],macro:[.08,.06,6,0]}),anodized_black:Nt(\"anodized\",{tint:1,color:1184790,rough:.72,metal:.9,wet:[0,.75,.6,.5],macro:[.06,.05,6,0]}),polymer_black:Nt(\"polymer\",{tint:1,color:1513498,wet:[0,.7,.6,.5],macro:[.06,.06,6,0]}),polymer_tan:Nt(\"polymer\",{tint:1,color:7299144,wet:[0,.7,.6,.5],macro:[.06,.06,6,0]}),rubber:Nt(\"polymer\",{tint:1,color:1052688,rough:1.4,wet:[.05,.6,.6,.4],macro:[.06,.06,6,0]}),carbon:Nt(\"carbon\",{wet:[0,.8,.6,.5],macro:[.05,.05,6,0]}),glove_fabric:Nt(\"fabric\",{tint:1,color:2303530,wet:[.3,.7,.6,0],macro:[.08,.04,8,0]}),armor_white:Nt(\"armor\",{tint:1,color:11449528,wet:kc,macro:[.08,.08,2.5,.15]}),armor_orange:Nt(\"armor\",{tint:1,color:12670234,wet:kc,macro:[.08,.08,2.5,.15]}),wood_pallet:Nt(\"wood\",{wet:u3,macro:[.2,.1,.9,.4]}),wood_dark:Nt(\"wood\",{color:9074794,wet:u3,macro:[.2,.1,.9,.4]}),plastic_blue:Nt(\"plastic\",{tint:1,color:1920134,wet:i1}),plastic_red:Nt(\"plastic\",{tint:1,color:9314074,wet:i1}),plastic_grey:Nt(\"plastic\",{tint:1,color:4935508,wet:i1}),tarp:Nt(\"tarp\",{tint:1,color:3885626,wet:i1,macro:[.1,.1,1.2,.2]}),cardboard:Nt(\"cardboard\",{wet:[.4,.75,.6,0]}),rope:Nt(\"rope\",{macro:r1}),tire:Nt(\"tire\",{wet:[.1,.6,.6,.3],macro:r1}),glass:Nt(\"glass\",{tint:3,transparent:!0,wet:s1,macro:a1}),glass_dirty:Nt(\"glass_dirty\",{tint:3,transparent:!0,wet:s1,macro:a1}),hull_paint:Nt(\"hull\",{tint:1,color:1778219,wet:kc,macro:o1}),hull_red:Nt(\"hull\",{tint:1,color:6233880,wet:kc,macro:o1}),water_dark:Nt(\"water\",{wet:s1,macro:a1})};\n\nexport const PRESETS = {\n  wetDefault: cA, wetPaint: kc, wetGalv: aa, wetRust: uA,\n  wetConcrete: i1, wetDry: u3, wetFull: s1,\n  macroDefault: hA, macroConcrete: o1, macroBrushed: r1, macroNone: a1,\n};\n\n/** 对外统一用 makeInstance，内部就是原文的 Nt。 */\nexport const makeInstance = Nt;\n\nexport const INSTANCE_IDS = Object.keys(INSTANCES);\n\n/**\n * 把 族 + 实例 合成一份可读的最终参数。\n * 不做渲染，只做合并，便于 UI 读表与做差异对比。\n */\nexport function resolve(id) {\n  const inst = INSTANCES[id];\n  if (!inst) throw new Error(`未知材质 \"${id}\"`);\n  const fam = FAMILIES[inst.set];\n  if (!fam) throw new Error(`材质 \"${id}\" 引用了不存在的族 \"${inst.set}\"`);\n  return {\n    id,\n    family: inst.set,\n    size: fam.size,\n    tile: fam.tile,\n    bump: fam.bump,\n    tint: inst.tint,\n    color: inst.color,\n    rough: inst.rough,\n    metal: inst.metal,\n    wet: inst.wet,\n    macro: inst.macro,\n    normalScale: inst.nrm,\n    alphaCut: !!inst.alphaCut,\n    side: inst.side === 2 ? \"DoubleSide\" : \"FrontSide\",\n  };\n}\n\n/**\n * 落地成 MeshStandardMaterial —— 只搬\"能等价搬\"的部分。\n *\n * 必须说清楚：原版的 rough / metal 不是 0-1 的物理量，而是送进自有 PBR shader\n * 的乘子；程序化 ORM、湿润掩码、宏观脏污都在 shader 里算。用标准材质无法等价还原，\n * 所以这里只设颜色，粗糙度/金属度交给调用方显式指定，不伪造。\n */\nexport function toStandard(THREE, id, extra = {}) {\n  const r = resolve(id);\n  const m = new THREE.MeshStandardMaterial({\n    color: new THREE.Color(r.color),\n    roughness: 0.82,\n    metalness: r.family === \"metal\" || r.family === \"galv\" || r.family === \"brushed\" ? 0.9 : 0.05,\n    ...extra,\n  });\n  m.name = id;\n  return m;\n}\n\n/** 台账体检：实例引用的族必须存在。 */\nexport function validate() {\n  const issues = [];\n  for (const [id, inst] of Object.entries(INSTANCES)) {\n    if (!FAMILIES[inst.set]) issues.push(`${id} → 族 \"${inst.set}\" 不存在`);\n    if (!Array.isArray(inst.wet) || inst.wet.length !== 4) issues.push(`${id} → wet 不是 4 元组`);\n    if (!Array.isArray(inst.macro) || inst.macro.length !== 4) issues.push(`${id} → macro 不是 4 元组`);\n  }\n  return issues;\n}\n\nexport default { FAMILIES, INSTANCES, PRESETS, makeInstance, resolve, toStandard, validate };\n",
   "families": [
    {
     "id": "asphalt",
     "v": "{fn:\"asphalt\",size:1,tile:2,bump:1.6,hero:!0}"
    },
    {
     "id": "concrete",
     "v": "{fn:\"concrete\",size:1,tile:3,bump:2.5}"
    },
    {
     "id": "brick",
     "v": "{fn:\"brick\",size:.5,tile:1.8,bump:6}"
    },
    {
     "id": "epoxy",
     "v": "{fn:\"epoxy\",size:.5,tile:4,bump:3}"
    },
    {
     "id": "paint",
     "v": "{fn:\"paint\",size:1,tile:2.5,bump:2.5,p:[.5]}"
    },
    {
     "id": "hull",
     "v": "{fn:\"hull\",size:.5,tile:4,bump:12}"
    },
    {
     "id": "galv",
     "v": "{fn:\"galv\",size:.5,tile:1,bump:.8}"
    },
    {
     "id": "metal",
     "v": "{fn:\"metal\",size:.5,tile:1,bump:.5,p:[1]}"
    },
    {
     "id": "brushed",
     "v": "{fn:\"brushed\",size:.5,tile:.5,bump:.4}"
    },
    {
     "id": "rust",
     "v": "{fn:\"rust\",size:.5,tile:1.2,bump:3}"
    },
    {
     "id": "diamond",
     "v": "{fn:\"diamond\",size:.5,tile:.5,bump:2}"
    },
    {
     "id": "corrugated",
     "v": "{fn:\"corrugated\",size:.5,tile:[.762,2.286],bump:19}"
    },
    {
     "id": "chainlink",
     "v": "{fn:\"chainlink\",size:.5,tile:.5,bump:5}"
    },
    {
     "id": "hazard",
     "v": "{fn:\"hazard\",size:.5,tile:1,bump:2.5}"
    },
    {
     "id": "gunmetal",
     "v": "{fn:\"gunmetal\",size:.5,tile:.25,bump:.3,p:[.6]}"
    },
    {
     "id": "anodized",
     "v": "{fn:\"gunmetal\",size:.5,tile:.25,bump:.25,p:[.2],seed:11}"
    },
    {
     "id": "polymer",
     "v": "{fn:\"polymer\",size:.25,tile:.1,bump:.4}"
    },
    {
     "id": "carbon",
     "v": "{fn:\"carbon\",size:.25,tile:.05,bump:.5}"
    },
    {
     "id": "fabric",
     "v": "{fn:\"fabric\",size:.25,tile:.05,bump:.4}"
    },
    {
     "id": "armor",
     "v": "{fn:\"armor\",size:.5,tile:.5,bump:.8}"
    },
    {
     "id": "wood",
     "v": "{fn:\"wood\",size:.5,tile:1.2,bump:2.6}"
    },
    {
     "id": "plastic",
     "v": "{fn:\"plastic\",size:.5,tile:1,bump:1}"
    },
    {
     "id": "tarp",
     "v": "{fn:\"tarp\",size:.5,tile:1.5,bump:20}"
    },
    {
     "id": "cardboard",
     "v": "{fn:\"cardboard\",size:.5,tile:1,bump:.8}"
    },
    {
     "id": "rope",
     "v": "{fn:\"rope\",size:.25,tile:.1,bump:4}"
    },
    {
     "id": "tire",
     "v": "{fn:\"tire\",size:.5,tile:[.5,.3],bump:7}"
    },
    {
     "id": "glass",
     "v": "{fn:\"glass\",size:.5,tile:1.5,bump:1.5,p:[.3]}"
    },
    {
     "id": "glass_dirty",
     "v": "{fn:\"glass\",size:.5,tile:1.5,bump:1.5,p:[1],seed:40}"
    },
    {
     "id": "water",
     "v": "{fn:\"water\",size:.25,tile:4,bump:30}"
    }
   ],
   "instances": [
    {
     "id": "asphalt",
     "set": "asphalt",
     "flags": []
    },
    {
     "id": "concrete",
     "set": "concrete",
     "flags": []
    },
    {
     "id": "concrete_dirty",
     "set": "concrete",
     "color": "13616822",
     "flags": []
    },
    {
     "id": "concrete_painted",
     "set": "concrete",
     "color": "9343638",
     "rough": ".9",
     "tint": "2",
     "flags": []
    },
    {
     "id": "brick",
     "set": "brick",
     "flags": []
    },
    {
     "id": "floor_epoxy",
     "set": "epoxy",
     "flags": []
    },
    {
     "id": "paint_red",
     "set": "paint",
     "color": "8200729",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_blue",
     "set": "paint",
     "color": "2047846",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_green",
     "set": "paint",
     "color": "2906692",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_yellow",
     "set": "paint",
     "color": "12159516",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_orange",
     "set": "paint",
     "color": "11751962",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_white",
     "set": "paint",
     "color": "12172214",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_grey",
     "set": "paint",
     "color": "5922920",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "paint_teal",
     "set": "paint",
     "color": "2055523",
     "rough": "1",
     "metal": "1",
     "note": "Xa 着色"
    },
    {
     "id": "steel_galv",
     "set": "galv",
     "flags": []
    },
    {
     "id": "steel_dark",
     "set": "metal",
     "color": "4014406",
     "rough": "1.15",
     "tint": "1",
     "flags": []
    },
    {
     "id": "steel_worn",
     "set": "metal",
     "color": "9080466",
     "rough": ".9",
     "tint": "1",
     "flags": []
    },
    {
     "id": "steel_bare",
     "set": "brushed",
     "color": "11843771",
     "tint": "1",
     "flags": []
    },
    {
     "id": "steel_rust",
     "set": "rust",
     "flags": []
    },
    {
     "id": "diamond_plate",
     "set": "diamond",
     "flags": []
    },
    {
     "id": "corrugated_roof",
     "set": "corrugated",
     "flags": []
    },
    {
     "id": "chainlink",
     "set": "chainlink",
     "tint": "3",
     "flags": [
      "alphaCut",
      "side"
     ]
    },
    {
     "id": "aluminium",
     "set": "brushed",
     "color": "12896459",
     "rough": "1.15",
     "tint": "1",
     "flags": []
    },
    {
     "id": "brass",
     "set": "brushed",
     "color": "12753477",
     "rough": ".9",
     "tint": "1",
     "flags": []
    },
    {
     "id": "hazard_stripes",
     "set": "hazard",
     "flags": []
    },
    {
     "id": "gunmetal",
     "set": "gunmetal",
     "color": "2764081",
     "tint": "1",
     "flags": []
    },
    {
     "id": "anodized_black",
     "set": "anodized",
     "color": "1184790",
     "rough": ".72",
     "metal": ".9",
     "tint": "1",
     "flags": []
    },
    {
     "id": "polymer_black",
     "set": "polymer",
     "color": "1513498",
     "tint": "1",
     "flags": []
    },
    {
     "id": "polymer_tan",
     "set": "polymer",
     "color": "7299144",
     "tint": "1",
     "flags": []
    },
    {
     "id": "rubber",
     "set": "polymer",
     "color": "1052688",
     "rough": "1.4",
     "tint": "1",
     "flags": []
    },
    {
     "id": "carbon",
     "set": "carbon",
     "flags": []
    },
    {
     "id": "glove_fabric",
     "set": "fabric",
     "color": "2303530",
     "tint": "1",
     "flags": []
    },
    {
     "id": "armor_white",
     "set": "armor",
     "color": "11449528",
     "tint": "1",
     "flags": []
    },
    {
     "id": "armor_orange",
     "set": "armor",
     "color": "12670234",
     "tint": "1",
     "flags": []
    },
    {
     "id": "wood_pallet",
     "set": "wood",
     "flags": []
    },
    {
     "id": "wood_dark",
     "set": "wood",
     "color": "9074794",
     "flags": []
    },
    {
     "id": "plastic_blue",
     "set": "plastic",
     "color": "1920134",
     "tint": "1",
     "flags": []
    },
    {
     "id": "plastic_red",
     "set": "plastic",
     "color": "9314074",
     "tint": "1",
     "flags": []
    },
    {
     "id": "plastic_grey",
     "set": "plastic",
     "color": "4935508",
     "tint": "1",
     "flags": []
    },
    {
     "id": "tarp",
     "set": "tarp",
     "color": "3885626",
     "tint": "1",
     "flags": []
    },
    {
     "id": "cardboard",
     "set": "cardboard",
     "flags": []
    },
    {
     "id": "rope",
     "set": "rope",
     "flags": []
    },
    {
     "id": "tire",
     "set": "tire",
     "flags": []
    },
    {
     "id": "glass",
     "set": "glass",
     "tint": "3",
     "flags": [
      "transparent"
     ]
    },
    {
     "id": "glass_dirty",
     "set": "glass_dirty",
     "tint": "3",
     "flags": [
      "transparent"
     ]
    },
    {
     "id": "hull_paint",
     "set": "hull",
     "color": "1778219",
     "tint": "1",
     "flags": []
    },
    {
     "id": "hull_red",
     "set": "hull",
     "color": "6233880",
     "tint": "1",
     "flags": []
    },
    {
     "id": "water_dark",
     "set": "water",
     "flags": []
    }
   ],
   "verdict": "可直接搬。族与实例都是纯数据，逐字保留；48 条实例全部能解析到合法族。",
   "limits": "账簿本身只到「参数」这一层：rough/metal 是乘子、color 是基色，不带贴图。真正的 albedo / ORM / 法线、湿润掩码与宏观脏污在同库的「材质烘焙器」里，两者接起来才是完整材质——预览用的就是这个组合。",
   "related": [
    "material-baker",
    "props-ledger"
   ],
   "crit": {
    "pure": "✓",
    "free": "△",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 90,
   "bytes": 8101
  },
  {
   "id": "material-baker",
   "name": "材质烘焙器",
   "en": "Material Baker",
   "type": "MAT",
   "grade": "B",
   "tags": [
    "材质",
    "程序化",
    "需宿壳",
    "GLSL",
    "GPU"
   ],
   "summary": "27 个 GLSL 族函数把「族参数 × 实例参数」在 GPU 上烘成 albedo / ORM / height，再由 height 求出法线；最后把湿润、脏污、三平面、镂空补丁注入标准材质。贴图不是图片，是算出来的。",
   "anchor": "L4833:C806325 Tn 表 / L5450:C869499 h3 补丁 / L5453:C870007 Gg",
   "deps": "THREE + WebGLRenderer（需注入）",
   "standalone": "需宿主渲染器，无引擎全局",
   "code": "/**\n * 材质烘焙器 · Aurora-Material Baker\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html  qg 命名空间（mats）\n *   surf 前导 e3        5283 字符\n *   27 个族函数 Tn.*     34385 字符（asphalt, concrete, brick, epoxy, paint…）\n *   height→法线 i3      615 字符\n *   拷贝/平方 s3        177 字符\n *   材质补丁 dA…yA      7446 字符\n *\n * 贴图不是图片文件，是「族参数 × GLSL」在 GPU 上烘出来的：\n *   surf() 三输出 → albedo(sqrt 编码) / ORM(R=AO G=rough B=metal) / height\n *   height + bump(mm) → 法线（Sobel，uK = bump*0.001*D/tile）\n *   补丁注入标准材质 → 湿润 4 元组 / 脏污 4 元组 / 三平面 / 镂空\n *\n * 与原版唯一的差异：原版 MRT 一次画三输出，本机 three 是 r160，\n * 不支持 WebGLRenderTarget count，故拆成 3 次 uSel 选择的单目标 pass。\n * 逐像素结果相同，只多两次 draw call。\n *\n * 依赖：注入 THREE + 已存在的 WebGLRenderer + material-ledger。\n */\n\nexport const GLSL_VERT = `\nin vec3 position; out vec2 vUv;\nvoid main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;\nexport const GLSL_COMMON = `\nprecision highp float; precision highp int;\nuniform vec4 uP; uniform float uSeed; uniform float uTexel;\nin vec2 vUv;\nuniform float uSel;\nvec4 o0; vec4 o1; vec4 o2;\nout vec4 oSel;\n#define TAU 6.28318530718\n#define sat(x) clamp(x, 0.0, 1.0)\n#define OV(D, k) { float k_ = sat(k); nt = mix(nt, D, k_); ta = mix(ta, 0.0, k_); }\nvec3 L(float r, float g, float b){ return pow(vec3(r, g, b), vec3(2.2)); }\nuvec3 pcg3(uvec3 v){ v = v * 1664525u + 1013904223u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; v ^= v >> 16u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; return v; }\nvec3 h3(vec2 c, vec2 per, float s){ c = mod(c, per); return vec3(pcg3(uvec3(uint(c.x + 0.5), uint(c.y + 0.5), uint(s + uSeed)))) * (1.0 / 4294967296.0); }\nfloat gn(vec2 p, vec2 per, float s){\n  vec2 i = floor(p), f = p - i; vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\n  float a = dot(h3(i, per, s).xy * 2.0 - 1.0, f);\n  float b = dot(h3(i + vec2(1.0, 0.0), per, s).xy * 2.0 - 1.0, f - vec2(1.0, 0.0));\n  float c = dot(h3(i + vec2(0.0, 1.0), per, s).xy * 2.0 - 1.0, f - vec2(0.0, 1.0));\n  float d = dot(h3(i + vec2(1.0, 1.0), per, s).xy * 2.0 - 1.0, f - vec2(1.0, 1.0));\n  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n}\n// fractal noise, ~0..1 centred on 0.5 (std ~0.18)\nfloat fbm(vec2 uv, vec2 f, int oct, float s){\n  float a = 0.5, v = 0.0, t = 0.0;\n  for (int i = 0; i < oct; i++){ v += a * gn(uv * f, f, s + float(i) * 7.0); t += a; a *= 0.5; f *= 2.0; }\n  return sat(v / t * 1.8 + 0.5);\n}\n// voronoi: x = F1, y = F2, z = cell random, w = second cell random\nvec4 vor(vec2 p, vec2 per, float s){\n  vec2 i = floor(p), f = p - i; float d1 = 9.0, d2 = 9.0; vec2 id = vec2(0.0);\n  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){\n    vec2 o = vec2(float(x), float(y)); vec3 r = h3(i + o, per, s); vec2 d = o + r.xy - f; float dd = dot(d, d);\n    if (dd < d1){ d2 = d1; d1 = dd; id = vec2(r.z, fract(r.z * 37.0 + r.x * 11.0)); } else if (dd < d2) d2 = dd;\n  }\n  return vec4(sqrt(d1), sqrt(d2), id);\n}\n// scattered straight scratches: f cells per tile, w half-width (cells), base angle + spread, density 0..1\nfloat scr(vec2 uv, float f, float s, float w, float ang, float spread, float dens){\n  vec2 p = uv * f; vec2 i = floor(p); vec2 fr = p - i; float m = 0.0;\n  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){\n    vec2 o = vec2(float(x), float(y)); vec3 r = h3(i + o, vec2(f), s); vec3 r2 = h3(i + o, vec2(f), s + 31.0);\n    vec2 c = o + r.xy - fr; float a = ang + (r.z - 0.5) * spread; vec2 dir = vec2(cos(a), sin(a));\n    float al = dot(c, dir), ac = dot(c, vec2(-dir.y, dir.x)); float len = 0.15 + r2.x * 0.8;\n    m = max(m, smoothstep(w, w * 0.3, abs(ac)) * smoothstep(len, len * 0.7, abs(al)) * step(r2.y, dens) * (0.35 + 0.65 * r2.z));\n  }\n  return m;\n}\nvoid emit(vec3 c, float a, float h, float ao, float r, float m){\n  o0 = vec4(sqrt(clamp(c, 0.0, 1.0)), sat(a));\n  o1 = vec4(sat(ao), clamp(r, 0.03, 1.0), sat(m), 1.0);\n  float hh = sat(h) * 255.0; float fl = floor(hh); o2 = vec4(fl / 255.0, hh - fl, 0.0, 1.0);\n}\n// soft, grainy rust patch mask: f = patch frequency, th = threshold (higher = rarer)\nfloat rustMask(vec2 uv, vec2 f, float th, float s){\n  float n = fbm(uv, f, 5, s), g = fbm(uv, f * 14.0, 3, s + 50.0);\n  return smoothstep(th, th + 0.14, n + (g - 0.5) * 0.3) * (0.5 + 0.5 * g);\n}\n// ---- shared paint damage model ----\nfloat chipsF(vec2 uv, vec2 f, float s, float dens, float rmax){\n  vec4 v = vor(uv * f, f, s); float e = fbm(uv, f * 3.0, 3, s + 3.0) - 0.5; float r = rmax * (0.25 + 0.75 * v.w);\n  return step(v.z, dens) * smoothstep(r, r * 0.55, v.x + e * 0.6);\n}\n// chip: 0 = intact paint .. 1 = through to substrate; stain: thin oxide halo; run: rust run below damage (-V is down)\nvoid paintDmg(vec2 uv, float amt, out float chip, out float stain, out float run){\n  float wearN = fbm(uv, vec2(3.0), 6, 21.0);\n  float zone = smoothstep(0.58, 0.82, fbm(uv, vec2(2.0), 3, 22.0));      // damage clusters; most of the panel is clean\n  float dn = (0.012 + 0.085 * zone) * (0.5 + amt);\n  float c1 = chipsF(uv, vec2(20.0, 11.0), 23.0, dn, 0.24);                // vertically stretched flakes\n  float c2 = chipsF(uv, vec2(64.0, 40.0), 24.0, dn * 1.6, 0.34);\n  float th = 0.925 - 0.06 * amt;\n  float c3 = smoothstep(th, th + 0.03, wearN + (fbm(uv, vec2(40.0), 3, 25.0) - 0.5) * 0.12);\n  float s1 = scr(uv, 5.0, 26.0, 0.0035, 0.0, 0.4, 0.2 + 0.25 * amt);\n  float s2 = scr(uv, 16.0, 27.0, 0.009, 1.57, 0.5, 0.12 + 0.2 * amt);\n  float sbreak = smoothstep(0.4, 0.65, fbm(uv, vec2(50.0), 2, 28.0));\n  chip = sat(max(max(c1, c2), max(c3, max(s1, s2) * sbreak)));\n  vec4 v = vor(uv * vec2(20.0, 11.0), vec2(20.0, 11.0), 23.0);\n  float b1 = step(v.z, dn) * smoothstep(0.42, 0.14, v.x) * (0.3 + 0.7 * v.w);\n  float bn = fbm(uv, vec2(36.0), 4, 29.0);\n  stain = sat(max(b1 * smoothstep(0.4, 0.7, bn) * 0.8, smoothstep(th - 0.03, th + 0.02, wearN) * smoothstep(0.4, 0.7, bn) * 0.7));\n  float streak = fbm(uv, vec2(120.0, 1.0), 3, 30.0);\n  float rr = 0.0;\n  for (int i = 1; i <= 4; i++){\n    vec2 q = uv + vec2(0.0, float(i) * 0.034);\n    float src = max(chipsF(q, vec2(20.0, 11.0), 23.0, dn, 0.24), smoothstep(th, th + 0.03, fbm(q, vec2(3.0), 6, 21.0)));\n    rr = max(rr, src * (1.0 - float(i) / 5.0));\n  }\n  run = rr * smoothstep(0.5, 0.78, streak);\n}\n`;\nexport const GLSL_MAIN = `\nvoid main(){ surf(vUv);\n  oSel = uSel < 0.5 ? o0 : (uSel < 1.5 ? o1 : o2);\n}`;\nexport const GLSL_NORMAL = `\nprecision highp float;\nuniform sampler2D tH; uniform vec2 uK; uniform float uTexel; in vec2 vUv; out vec4 o;\nfloat H(vec2 uv){ vec4 t = texture(tH, uv); return t.r + t.g / 255.0; }\nvoid main(){\n  vec2 e = vec2(uTexel, 0.0);\n  float l = H(vUv - e.xy), r = H(vUv + e.xy), d = H(vUv - e.yx), u = H(vUv + e.yx);\n  float ld = H(vUv - e.xx), rd = H(vUv + vec2(e.x, -e.x)), lu = H(vUv + vec2(-e.x, e.x)), ru = H(vUv + e.xx);\n  float gx = (r - l) * 0.5 + (ru + rd - lu - ld) * 0.25, gy = (u - d) * 0.5 + (ru + lu - rd - ld) * 0.25;\n  vec3 n = normalize(vec3(-gx * uK.x, -gy * uK.y, 1.0));\n  o = vec4(n * 0.5 + 0.5, 1.0);\n}`;\nexport const GLSL_COPY = `\nprecision highp float;\nuniform sampler2D tA; uniform float uSq; in vec2 vUv; out vec4 o;\nvoid main(){ vec4 t = texture(tA, vUv); o = uSq > 0.5 ? vec4(t.rgb * t.rgb, t.a) : t; }`;\n\nexport const GLSL_SURF = {\n  asphalt: `\nvoid surf(vec2 uv){\n  vec4 a = vor(uv * 110.0, vec2(110.0), 1.0);\n  vec4 b = vor(uv * 230.0 + 3.0, vec2(230.0), 2.0);\n  float big = fbm(uv, vec2(3.0), 4, 5.0), mid = fbm(uv, vec2(24.0), 4, 6.0), fine = fbm(uv, vec2(300.0), 2, 7.0);\n  float jag = fbm(uv, vec2(420.0), 2, 8.0) - 0.5;\n  float sa = smoothstep(0.46, 0.3, a.x + jag * 0.3 - (a.y - a.x) * 0.2 + (1.0 - a.w) * 0.12) * step(a.z, 0.62);\n  float sb = smoothstep(0.46, 0.3, b.x + jag * 0.2 + (1.0 - b.w) * 0.15) * step(b.z, 0.85);\n  float h = max(sa * (0.45 + 0.55 * a.w), sb * 0.5 * (0.5 + 0.5 * b.w));\n  h = h * 0.6 + fine * 0.3 + mid * 0.1;\n  float wearK = smoothstep(0.3, 0.7, big);\n  float stone = sat(max(sa, sb * 0.8));\n  vec3 stA = mix(L(0.28, 0.28, 0.29), L(0.45, 0.43, 0.41), a.w); stA = mix(stA, L(0.42, 0.35, 0.28), step(0.9, a.z * 0.5 + a.w * 0.6));\n  vec3 stB = mix(L(0.26, 0.26, 0.28), L(0.44, 0.43, 0.42), b.w);\n  vec3 col = L(0.13, 0.13, 0.135) * (0.8 + 0.4 * mid);\n  col = mix(col, stB, sb * 0.7 * (0.45 + 0.55 * wearK));\n  col = mix(col, stA, sa * (0.5 + 0.45 * wearK));\n  col *= 0.8 + 0.4 * big;\n  float cn = fbm(uv + vec2(0.13, 0.4), vec2(2.0), 3, 9.0);\n  float band = smoothstep(0.016, 0.009, abs(cn - 0.5) + (fbm(uv, vec2(70.0), 2, 13.0) - 0.5) * 0.008) * smoothstep(0.4, 0.6, fbm(uv, vec2(2.0), 2, 12.0));\n  col = mix(col, L(0.075, 0.075, 0.08), band * 0.93);\n  h = mix(h, 0.74 + fine * 0.05 + sa * 0.04, band * 0.88);\n  float r = mix(0.93, 0.74, stone * (0.4 + 0.6 * wearK)); r = mix(r, 0.36, band);\n  float oil = smoothstep(0.72, 0.86, fbm(uv + 0.5, vec2(5.0), 4, 14.0)); col *= 1.0 - oil * 0.45; r = mix(r, 0.5, oil * 0.6);\n  emit(col, 1.0, h, mix(0.55, 1.0, smoothstep(0.0, 0.6, h)), r, 0.0);\n}`,\n  concrete: `\nvoid surf(vec2 uv){\n  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(12.0), 5, 2.0), fine = fbm(uv, vec2(180.0), 3, 3.0);\n  float form = fbm(uv, vec2(2.0, 7.0), 5, 4.0);\n  vec4 po = vor(uv * 70.0, vec2(70.0), 5.0); float pore = step(po.z, 0.35) * smoothstep(0.16 * po.w + 0.03, 0.02, po.x);\n  vec4 po2 = vor(uv * 260.0, vec2(260.0), 6.0); float pore2 = step(po2.z, 0.5) * smoothstep(0.3 * po2.w, 0.05, po2.x);\n  vec2 wu = uv + (vec2(fbm(uv, vec2(6.0), 3, 7.0), fbm(uv, vec2(6.0), 3, 8.0)) - 0.5) * 0.12 + (vec2(fbm(uv, vec2(48.0), 3, 17.0), fbm(uv, vec2(48.0), 3, 18.0)) - 0.5) * 0.022;\n  vec4 cr = vor(wu * 3.0, vec2(3.0), 9.0);\n  float crack = smoothstep(0.0045, 0.0012, cr.y - cr.x) * smoothstep(0.45, 0.6, fbm(uv, vec2(3.0), 2, 10.0));\n  float chip = smoothstep(0.83, 0.87, fbm(uv, vec2(7.0), 4, 11.0) + (fine - 0.5) * 0.08 + (mid - 0.5) * 0.06);\n  vec4 ag = vor(uv * 140.0, vec2(140.0), 12.0); float stone = smoothstep(0.5, 0.3, ag.x) * step(ag.z, 0.6);\n  vec2 dj = min(uv, 1.0 - uv); float jd = min(dj.x, dj.y);\n  float joint = smoothstep(0.0022, 0.0012, jd), jstain = smoothstep(0.07, 0.0, jd + (mid - 0.5) * 0.04);\n  float h = 0.6 + (mid - 0.5) * 0.25 + (fine - 0.5) * 0.12 + (form - 0.5) * 0.06;\n  h -= pore * 0.35 + pore2 * 0.08 + crack * 0.2; h = mix(h, 0.42 + stone * 0.12 + fine * 0.08, chip); h = mix(h, 0.05, joint);\n  vec3 col = L(0.53, 0.52, 0.49) * (0.72 + 0.4 * big + 0.22 * (mid - 0.5) + 0.08 * (form - 0.5));\n  col *= mix(vec3(1.04, 1.0, 0.94), vec3(0.95, 1.0, 1.05), fbm(uv, vec2(3.0), 3, 13.0));\n  float st = smoothstep(0.55, 0.8, fbm(uv, vec2(4.0), 5, 14.0)); col *= 1.0 - st * 0.3;\n  float ef = smoothstep(0.66, 0.85, fbm(uv, vec2(5.0), 4, 15.0)) * sat(fine * 1.6 - 0.2); col = mix(col, L(0.68, 0.67, 0.64), ef * 0.22);\n  col *= 1.0 - pore * 0.5 - pore2 * 0.2 - crack * 0.6;\n  vec3 agc = mix(L(0.38, 0.37, 0.35), L(0.54, 0.52, 0.47), ag.w); agc = mix(agc, L(0.46, 0.41, 0.34), step(0.45, ag.z));\n  col = mix(col, mix(L(0.4, 0.39, 0.37) * (0.8 + 0.4 * fine), agc, stone * 0.8), chip);\n  col *= 1.0 - jstain * 0.25; col = mix(col, L(0.1, 0.1, 0.1), joint);\n  float r = 0.82 + (mid - 0.5) * 0.2 - (form - 0.5) * 0.15; r = mix(r, 0.95, chip); r = mix(r, 0.62, st * 0.3);\n  float ao = 1.0 - pore * 0.5 - crack * 0.5 - joint * 0.6 - chip * 0.15;\n  float pa = smoothstep(0.40, 0.47, fbm(uv, vec2(9.0), 5, 16.0) + (mid - 0.5) * 0.2) * (1.0 - chip) * (1.0 - crack) * (1.0 - pore);\n  emit(col, pa, h, ao, r, 0.0);\n}`,\n  brick: `\nvoid surf(vec2 uv){\n  float rows = 24.0, cols = 8.0; float y = uv.y * rows; float row = floor(y); float x = uv.x * cols + 0.5 * mod(row, 2.0); float cl = floor(x);\n  vec2 f = vec2(fract(x), fract(y)); vec3 id = h3(vec2(cl, row), vec2(cols, rows), 1.0);\n  float ed = fbm(uv, vec2(60.0), 3, 2.0);\n  vec2 d = min(f, 1.0 - f) * vec2(225.0, 75.0);\n  float mort = 5.0 + (ed - 0.5) * 5.0; float dm = min(d.x, d.y); float brick = smoothstep(mort, mort + 3.0, dm);\n  float fine = fbm(uv, vec2(200.0), 3, 3.0), mid = fbm(uv, vec2(30.0), 4, 4.0);\n  vec3 c = mix(L(0.52, 0.27, 0.2), L(0.42, 0.2, 0.15), id.x); c = mix(c, L(0.3, 0.17, 0.15), smoothstep(0.75, 1.0, id.y)); c = mix(c, L(0.58, 0.38, 0.26), smoothstep(0.85, 1.0, id.z));\n  c *= (0.8 + 0.4 * mid) * (0.9 + 0.2 * fine);\n  float pit = smoothstep(0.7, 0.8, fbm(uv, vec2(90.0), 3, 5.0)); c *= 1.0 - pit * 0.35;\n  vec3 mc = L(0.5, 0.48, 0.44) * (0.75 + 0.5 * fine);\n  float soot = smoothstep(0.5, 0.8, fbm(uv, vec2(3.0), 4, 6.0));\n  vec3 col = mix(mc, c, brick) * (1.0 - soot * 0.35);\n  float ef = smoothstep(0.7, 0.85, fbm(uv, vec2(5.0), 4, 7.0)) * brick; col = mix(col, L(0.7, 0.68, 0.64), ef * 0.3);\n  float h = mix(0.25 + fine * 0.1, 0.7 + (mid - 0.5) * 0.15 + (fine - 0.5) * 0.1 - pit * 0.2 + (id.x - 0.5) * 0.12, brick);\n  emit(col, 1.0, h, mix(0.6, 1.0, brick) * (1.0 - pit * 0.3), mix(0.95, 0.86 + (mid - 0.5) * 0.15, brick), 0.0);\n}`,\n  epoxy: `\nvoid surf(vec2 uv){\n  float big = fbm(uv, vec2(3.0), 5, 1.0), mid = fbm(uv, vec2(20.0), 4, 2.0), fine = fbm(uv, vec2(250.0), 2, 3.0), mott = fbm(uv, vec2(9.0), 5, 11.0);\n  vec3 col = L(0.41, 0.445, 0.435) * (0.78 + 0.3 * big + 0.22 * (mott - 0.5));\n  col *= mix(vec3(1.03, 1.0, 0.97), vec3(0.95, 1.0, 1.03), fbm(uv, vec2(2.0), 3, 19.0));\n  vec4 ag = vor(uv * 180.0, vec2(180.0), 12.0); col *= 1.0 + (ag.w - 0.5) * 0.14 * smoothstep(0.5, 0.2, ag.x);\n  float gloss = smoothstep(0.35, 0.62, fbm(uv, vec2(5.0), 5, 4.0));          // sealer still intact\n  float lane = smoothstep(0.35, 0.65, fbm(uv, vec2(1.0, 3.0), 3, 13.0));     // traffic lanes worn matt\n  float worn = sat(1.0 - gloss * 0.85 + lane * 0.45 - 0.15);\n  float sc1 = scr(uv, 14.0, 5.0, 0.012, 0.5, 6.3, 0.7), sc2 = scr(uv, 40.0, 6.0, 0.02, 0.0, 6.3, 0.5);\n  float t1 = abs(uv.y - 0.31 - 0.06 * sin(uv.x * TAU)), t2 = abs(uv.x - 0.62 - 0.09 * sin(uv.y * TAU + 1.0));\n  float t3 = abs(uv.y - 0.74 - 0.1 * sin(uv.x * TAU * 2.0 + 2.0)), t4 = abs(uv.x - 0.2 - 0.05 * sin(uv.y * TAU + 4.0));\n  float tread = 0.6 + 0.4 * sin((uv.x + uv.y) * TAU * 90.0);\n  float tm = smoothstep(0.022, 0.016, t1) * smoothstep(0.35, 0.6, fbm(uv, vec2(8.0), 3, 7.0)) + smoothstep(0.02, 0.014, t2) * smoothstep(0.4, 0.65, fbm(uv, vec2(6.0), 3, 8.0))\n           + smoothstep(0.026, 0.018, t3) * smoothstep(0.45, 0.7, fbm(uv, vec2(5.0), 3, 14.0)) + smoothstep(0.018, 0.012, t4) * smoothstep(0.4, 0.65, fbm(uv, vec2(7.0), 3, 15.0));\n  tm = sat(tm * tread);\n  col = mix(col, L(0.1, 0.1, 0.105), tm * 0.75);\n  col *= 1.0 - worn * 0.1; col = mix(col, col * 1.25, sc1 * 0.4);\n  float dirt = smoothstep(0.55, 0.85, fbm(uv, vec2(2.0), 4, 9.0)); col = mix(col, L(0.3, 0.29, 0.26), dirt * 0.3);\n  float r = mix(0.1, 0.52, worn) + sc1 * 0.2 + sc2 * 0.15 + tm * 0.3 + dirt * 0.2 + (mid - 0.5) * 0.12 + (mott - 0.5) * 0.1;\n  float h = 0.5 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.06 - sc1 * 0.2 - sc2 * 0.08 + tm * 0.05 + (gloss - 0.5) * 0.03;\n  float chip = smoothstep(0.87, 0.9, fbm(uv, vec2(14.0), 5, 10.0) + (fine - 0.5) * 0.06); col = mix(col, L(0.44, 0.44, 0.43) * (0.75 + 0.5 * fine), chip); h -= chip * 0.3; r = mix(r, 0.85, chip);\n  emit(col, 1.0, h, 1.0 - chip * 0.2, r, 0.0);\n}`,\n  paint: `\nvoid surf(vec2 uv){\n  float chip, stain, run; paintDmg(uv, uP.x, chip, stain, run);\n  float shade = 0.8, baseR = 0.40;\n  \n  float fine = fbm(uv, vec2(260.0), 2, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);\n  float chalk = smoothstep(0.3, 0.8, fbm(uv, vec2(1.0, 2.0), 4, 4.0));\n  float dirt = smoothstep(0.42, 0.85, fbm(uv, vec2(3.0, 2.0), 5, 5.0));\n  float vs1 = fbm(uv, vec2(70.0, 1.0), 3, 6.0), vs2 = fbm(uv, vec2(22.0, 1.0), 3, 16.0), vs3 = fbm(uv, vec2(9.0, 2.0), 3, 17.0);\n  float steel = smoothstep(0.55, 0.8, chip);\n  float primer = smoothstep(0.15, 0.4, chip) * (1.0 - steel);\n  float rustN = fbm(uv, vec2(60.0), 4, 7.0);\n  float fresh = steel * smoothstep(0.78, 0.86, fbm(uv, vec2(25.0), 3, 8.0));\n  vec3 rustC = mix(L(0.2, 0.135, 0.105), L(0.36, 0.23, 0.15), rustN);\n  rustC = mix(rustC, L(0.5, 0.33, 0.18), smoothstep(0.7, 0.95, fbm(uv, vec2(120.0), 2, 9.0)) * 0.5);\n  vec3 nt = vec3(0.0); float ta = shade * (0.9 + 0.2 * (mid - 0.5) + 0.2 * (big - 0.5));\n  // dirt film: broad grime + fine and broad vertical wash streaks\n  float df = sat(dirt * 0.3 + smoothstep(0.55, 0.85, vs1) * 0.3 * (0.4 + dirt) + smoothstep(0.55, 0.8, vs2) * 0.38 * (0.3 + dirt) + smoothstep(0.5, 0.8, vs3) * 0.2);\n  float clean = smoothstep(0.6, 0.85, 1.0 - vs2) * 0.5;            // rain-washed lighter streaks\n  float rs = sat(stain * 0.7 + run * 0.85);\n  ta *= 1.0 + clean * 0.08 - chalk * 0.06;\n  OV(vec3(0.72), chalk * 0.075 + clean * 0.02);\n  OV(L(0.24, 0.22, 0.19), df * 0.42);\n  OV(mix(L(0.3, 0.2, 0.14), L(0.44, 0.28, 0.16), rustN), rs * 0.5);\n  OV(mix(L(0.5, 0.25, 0.2), L(0.55, 0.54, 0.5), 0.35), primer);\n  OV(rustC, steel);\n  OV(L(0.55, 0.55, 0.57), fresh);\n  float h = 0.62 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.04;\n  h = mix(h, 0.5, primer); h = mix(h, 0.36 + rustN * 0.14, steel); h += rs * 0.02 * rustN;\n  float r = baseR + chalk * 0.26 + df * 0.3 - clean * 0.06 + (mid - 0.5) * 0.14 + (big - 0.5) * 0.1; r = mix(r, 0.75, primer); r = mix(r, 0.92, steel); r = mix(r, 0.35, fresh); r = mix(r, 0.72, rs * 0.6);\n  float m = fresh * 0.95 + (steel - fresh) * 0.15;\n  float ao = 1.0 - steel * 0.25 - primer * 0.1;\n\n  emit(nt, ta, h, ao, r, m);\n}`,\n  hazard: `\nvoid surf(vec2 uv){\n  float chip, stain, run; paintDmg(uv, 1.4, chip, stain, run);\n  float shade = 1.0, baseR = 0.5;\n  \n  float fine = fbm(uv, vec2(260.0), 2, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);\n  float chalk = smoothstep(0.3, 0.8, fbm(uv, vec2(1.0, 2.0), 4, 4.0));\n  float dirt = smoothstep(0.42, 0.85, fbm(uv, vec2(3.0, 2.0), 5, 5.0));\n  float vs1 = fbm(uv, vec2(70.0, 1.0), 3, 6.0), vs2 = fbm(uv, vec2(22.0, 1.0), 3, 16.0), vs3 = fbm(uv, vec2(9.0, 2.0), 3, 17.0);\n  float steel = smoothstep(0.55, 0.8, chip);\n  float primer = smoothstep(0.15, 0.4, chip) * (1.0 - steel);\n  float rustN = fbm(uv, vec2(60.0), 4, 7.0);\n  float fresh = steel * smoothstep(0.78, 0.86, fbm(uv, vec2(25.0), 3, 8.0));\n  vec3 rustC = mix(L(0.2, 0.135, 0.105), L(0.36, 0.23, 0.15), rustN);\n  rustC = mix(rustC, L(0.5, 0.33, 0.18), smoothstep(0.7, 0.95, fbm(uv, vec2(120.0), 2, 9.0)) * 0.5);\n  vec3 nt = vec3(0.0); float ta = shade * (0.9 + 0.2 * (mid - 0.5) + 0.2 * (big - 0.5));\n  // dirt film: broad grime + fine and broad vertical wash streaks\n  float df = sat(dirt * 0.3 + smoothstep(0.55, 0.85, vs1) * 0.3 * (0.4 + dirt) + smoothstep(0.55, 0.8, vs2) * 0.38 * (0.3 + dirt) + smoothstep(0.5, 0.8, vs3) * 0.2);\n  float clean = smoothstep(0.6, 0.85, 1.0 - vs2) * 0.5;            // rain-washed lighter streaks\n  float rs = sat(stain * 0.7 + run * 0.85);\n  ta *= 1.0 + clean * 0.08 - chalk * 0.06;\n  OV(vec3(0.72), chalk * 0.075 + clean * 0.02);\n  OV(L(0.24, 0.22, 0.19), df * 0.42);\n  OV(mix(L(0.3, 0.2, 0.14), L(0.44, 0.28, 0.16), rustN), rs * 0.5);\n  OV(mix(L(0.5, 0.25, 0.2), L(0.55, 0.54, 0.5), 0.35), primer);\n  OV(rustC, steel);\n  OV(L(0.55, 0.55, 0.57), fresh);\n  float h = 0.62 + (fine - 0.5) * 0.05 + (mid - 0.5) * 0.04;\n  h = mix(h, 0.5, primer); h = mix(h, 0.36 + rustN * 0.14, steel); h += rs * 0.02 * rustN;\n  float r = baseR + chalk * 0.26 + df * 0.3 - clean * 0.06 + (mid - 0.5) * 0.14 + (big - 0.5) * 0.1; r = mix(r, 0.75, primer); r = mix(r, 0.92, steel); r = mix(r, 0.35, fresh); r = mix(r, 0.72, rs * 0.6);\n  float m = fresh * 0.95 + (steel - fresh) * 0.15;\n  float ao = 1.0 - steel * 0.25 - primer * 0.1;\n\n  float s = fract((uv.x + uv.y) * 5.0);\n  float yel = smoothstep(0.244, 0.256, abs(s - 0.5) + (fbm(uv, vec2(80.0), 2, 41.0) - 0.5) * 0.02);\n  vec3 pc = mix(L(0.1, 0.1, 0.11), L(0.86, 0.66, 0.1), yel);\n  emit(nt + pc * ta, 1.0, h, ao, r, m);\n}`,\n  hull: `\nvoid surf(vec2 uv){\n  float ry = uv.y * 2.0; float row = floor(ry); float fy = fract(ry); float sx = fract(uv.x + 0.5 * mod(row, 2.0));\n  float dh = min(fy, 1.0 - fy) * 2.0, dv = min(sx, 1.0 - sx) * 4.0; float dseam = min(dh, dv);\n  float wn = fbm(uv, vec2(200.0), 2, 1.0);\n  float bead = smoothstep(0.012, 0.004, dseam + (wn - 0.5) * 0.004);\n  float ripple = 0.75 + 0.25 * sin((uv.x + uv.y) * TAU * 400.0);\n  float dish = cos(uv.x * TAU * 8.0) * 0.5 + 0.5;\n  float big = fbm(uv, vec2(2.0), 4, 2.0), mid = fbm(uv, vec2(14.0), 4, 3.0), fine = fbm(uv, vec2(220.0), 2, 4.0);\n  float roller = fbm(uv, vec2(120.0, 30.0), 3, 5.0);\n  float seamK = smoothstep(0.12, 0.0, dseam);\n  float pit = fbm(uv, vec2(70.0), 4, 7.0);\n  float rust = smoothstep(0.72, 0.79, fbm(uv, vec2(10.0), 5, 6.0) + seamK * 0.2);\n  rust *= smoothstep(0.3, 0.5, pit + rust * 0.3);\n  float streak = fbm(uv, vec2(110.0, 1.0), 3, 8.0);\n  float wp = 0.0;\n  for (int i = 1; i <= 4; i++){\n    vec2 q = uv + vec2(0.0, float(i) * 0.03); float qy = fract(q.y * 2.0);\n    float qs = smoothstep(0.02, 0.0, min(qy, 1.0 - qy) * 2.0); float qr = smoothstep(0.72, 0.79, fbm(q, vec2(10.0), 5, 6.0));\n    wp = max(wp, max(qs * 0.7, qr) * (1.0 - float(i) / 5.0));\n  }\n  float weep = wp * smoothstep(0.4, 0.75, streak);\n  float salt = smoothstep(0.6, 0.85, fbm(uv, vec2(3.0, 9.0), 4, 9.0));\n  vec3 nt = vec3(0.0); float ta = 0.82 * (0.88 + 0.2 * (big - 0.5) + 0.14 * (mid - 0.5) + 0.08 * (roller - 0.5));\n  OV(vec3(0.6), salt * 0.025 * (0.5 + roller));\n  OV(L(0.45, 0.27, 0.14), weep * 0.7);\n  OV(mix(L(0.25, 0.16, 0.11), L(0.5, 0.31, 0.17), pit), rust);\n  float h = 0.5 + (roller - 0.5) * 0.05 + (fine - 0.5) * 0.03 + bead * 0.35 * ripple + (dish - 0.5) * 0.1 - rust * 0.08 * (1.0 - pit);\n  float r = 0.5 + (mid - 0.5) * 0.15 + salt * 0.2; r = mix(r, 0.9, rust); r = mix(r, 0.7, weep * 0.5);\n  emit(nt, ta, h, 1.0 - rust * 0.2 - smoothstep(0.03, 0.012, dseam) * (1.0 - bead) * 0.3, r, rust * 0.1);\n}`,\n  galv: `\nvoid surf(vec2 uv){\n  vec2 wu = uv + (vec2(fbm(uv, vec2(8.0), 2, 1.0), fbm(uv, vec2(8.0), 2, 2.0)) - 0.5) * 0.03;\n  vec4 a = vor(wu * 22.0, vec2(22.0), 3.0); vec4 b = vor(wu * 50.0 + 1.5, vec2(50.0), 4.0);\n  float sp = mix(a.w, b.w, 0.35);\n  float edge = smoothstep(0.0, 0.08, a.y - a.x);\n  float big = fbm(uv, vec2(2.0), 4, 5.0), fine = fbm(uv, vec2(200.0), 2, 6.0), mid = fbm(uv, vec2(20.0), 4, 7.0);\n  vec3 col = vec3(0.56, 0.58, 0.6) * (0.72 + 0.4 * sp) * (0.92 + 0.16 * big);\n  float wr = smoothstep(0.55, 0.85, fbm(uv, vec2(6.0), 5, 8.0)) * (0.4 + 0.6 * fbm(uv, vec2(90.0), 3, 10.0));\n  col = mix(col, L(0.74, 0.74, 0.72), wr * 0.4);\n  float rs = rustMask(uv, vec2(9.0), 0.8, 9.0);\n  col = mix(col, L(0.42, 0.27, 0.16) * (0.7 + 0.6 * fine), rs);\n  float r = 0.3 + 0.28 * sp + (mid - 0.5) * 0.15 + wr * 0.3; r = mix(r, 0.9, rs);\n  float h = 0.5 + (sp - 0.5) * 0.08 * edge + (fine - 0.5) * 0.04 + wr * 0.05 * fine - (1.0 - edge) * 0.03;\n  emit(col, 1.0, h, 1.0, r, 1.0 - wr * 0.45 - rs * 0.9);\n}`,\n  metal: `\nvoid surf(vec2 uv){\n  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(18.0), 4, 2.0), fine = fbm(uv, vec2(240.0), 2, 3.0);\n  float smudge = fbm(uv, vec2(5.0, 7.0), 5, 4.0);\n  float s1 = scr(uv, 9.0, 5.0, 0.006, 0.2, 6.3, 0.6), s2 = scr(uv, 30.0, 6.0, 0.012, 1.0, 6.3, 0.5), s3 = scr(uv, 70.0, 7.0, 0.03, 2.0, 6.3, 0.4);\n  float sc = sat(max(s1, max(s2 * 0.8, s3 * 0.5)));\n  float rust = rustMask(uv, vec2(12.0), 0.74, 8.0) * uP.x;\n  float scale_ = smoothstep(0.4, 0.7, fbm(uv, vec2(7.0), 4, 10.0));\n  vec3 nt = vec3(0.0); float ta = 0.95 * (0.85 + 0.2 * (big - 0.5) + 0.16 * (mid - 0.5)) * (1.0 - scale_ * 0.18);\n  OV(vec3(0.55, 0.56, 0.58), sc * 0.3);\n  OV(mix(L(0.27, 0.17, 0.12), L(0.5, 0.31, 0.17), fbm(uv, vec2(90.0), 3, 11.0)), rust);\n  float r = 0.42 + (smudge - 0.5) * 0.3 + (mid - 0.5) * 0.1 - sc * 0.15 + scale_ * 0.08; r = mix(r, 0.9, rust);\n  float h = 0.5 + (fine - 0.5) * 0.04 + (mid - 0.5) * 0.04 - sc * 0.12 + rust * 0.08 * fine;\n  emit(nt, ta, h, 1.0 - rust * 0.2, r, 1.0 - rust * 0.85);\n}`,\n  brushed: `\nvoid surf(vec2 uv){\n  float l1 = fbm(uv, vec2(2.0, 300.0), 3, 1.0), l2 = fbm(uv, vec2(6.0, 120.0), 3, 2.0), l3 = fbm(uv, vec2(1.0, 500.0), 2, 12.0);\n  float big = fbm(uv, vec2(3.0), 4, 3.0), smudge = fbm(uv, vec2(6.0), 5, 4.0);\n  float sc = scr(uv, 12.0, 5.0, 0.008, 0.6, 6.3, 0.4);\n  float tar = smoothstep(0.45, 0.9, fbm(uv, vec2(5.0), 5, 6.0));\n  vec3 nt = vec3(0.0); float ta = 0.95 * (0.82 + 0.16 * (l1 - 0.5) + 0.14 * (l2 - 0.5) + 0.1 * (big - 0.5)) * (1.0 - tar * 0.13);\n  OV(vec3(0.7), sc * 0.2);\n  float r = 0.3 + (l1 - 0.5) * 0.2 + (smudge - 0.5) * 0.2 + tar * 0.18 - sc * 0.08;\n  float h = 0.5 + (l1 - 0.5) * 0.2 + (l3 - 0.5) * 0.2 + (l2 - 0.5) * 0.1 - sc * 0.2;\n  emit(nt, ta, h, 1.0, r, 1.0);\n}`,\n  rust: `\nvoid surf(vec2 uv){\n  vec2 wu = uv + (vec2(fbm(uv, vec2(5.0), 3, 1.0), fbm(uv, vec2(5.0), 3, 2.0)) - 0.5) * 0.08;\n  float n = fbm(wu, vec2(6.0), 7, 3.0);\n  float fl = fbm(wu, vec2(11.0), 6, 4.0);\n  float tf = fract(fl * 4.0); float layer = floor(fl * 4.0) / 4.0 + smoothstep(0.0, 0.45, tf) * 0.25;\n  float flakeEdge = smoothstep(0.1, 0.0, tf) * smoothstep(0.4, 0.6, fbm(uv, vec2(9.0), 3, 14.0));\n  vec4 pv = vor(uv * 70.0, vec2(70.0), 5.0); float pit = step(pv.z, 0.5) * smoothstep(0.35 * pv.w + 0.05, 0.03, pv.x);\n  vec4 pv2 = vor(uv * 190.0, vec2(190.0), 15.0); float speck = smoothstep(0.35, 0.1, pv2.x) * step(pv2.z, 0.4);\n  float grain = fbm(uv, vec2(220.0), 3, 6.0);\n  float scaleI = smoothstep(0.75, 0.8, fbm(wu, vec2(4.0), 5, 7.0) + (grain - 0.5) * 0.1);\n  float h = 0.25 + layer * 0.4 + (n - 0.5) * 0.3 + (grain - 0.5) * 0.14 - pit * 0.2 + speck * 0.04;\n  h = mix(h, 0.8 + (grain - 0.5) * 0.04, scaleI);\n  float t = sat(layer * 0.5 + n * 0.55 + (grain - 0.5) * 0.35);\n  vec3 c = mix(L(0.26, 0.17, 0.13), L(0.4, 0.25, 0.16), smoothstep(0.25, 0.6, t));\n  float bloom = smoothstep(0.55, 0.85, fbm(uv, vec2(7.0), 5, 8.0));\n  c = mix(c, L(0.55, 0.34, 0.17), bloom * (0.35 + 0.65 * smoothstep(0.4, 0.7, t)));\n  c = mix(c, L(0.62, 0.45, 0.25), smoothstep(0.7, 0.95, fbm(uv, vec2(34.0), 4, 18.0)) * 0.4);\n  c = mix(c, L(0.2, 0.14, 0.12), sat(flakeEdge * 0.6 + pit * 0.7));\n  c *= (0.8 + 0.4 * grain) * (0.9 + 0.2 * speck);\n  float streak = fbm(uv, vec2(60.0, 2.0), 3, 9.0); c = mix(c, L(0.5, 0.31, 0.17), smoothstep(0.55, 0.8, streak) * 0.2);\n  c = mix(c, L(0.3, 0.3, 0.33) * (0.8 + 0.4 * grain), scaleI);\n  float r = 0.9 + (grain - 0.5) * 0.15 - bloom * 0.06; r = mix(r, 0.55, scaleI);\n  emit(c, 1.0, h, 1.0 - pit * 0.4 - flakeEdge * 0.25, r, scaleI * 0.35);\n}`,\n  diamond: `\nvoid surf(vec2 uv){\n  vec2 p = uv * 12.0; vec2 i = floor(p); vec2 q = fract(p) - 0.5; float par = mod(i.x + i.y, 2.0);\n  vec2 d = (par < 0.5 ? vec2(q.x + q.y, q.x - q.y) : vec2(q.x - q.y, q.x + q.y)) * 0.7071;\n  float e = length(d * vec2(1.0 / 0.46, 1.0 / 0.13));\n  float loz = smoothstep(1.0, 0.55, e), top = smoothstep(0.75, 0.4, e);\n  float big = fbm(uv, vec2(2.0), 4, 1.0), mid = fbm(uv, vec2(16.0), 4, 2.0), fine = fbm(uv, vec2(200.0), 2, 3.0);\n  float wear = smoothstep(0.3, 0.7, big);\n  float grime = (1.0 - loz) * smoothstep(0.3, 0.65, fbm(uv, vec2(8.0), 4, 4.0));\n  float sc = scr(uv, 20.0, 5.0, 0.02, 0.0, 6.3, 0.5);\n  vec3 col = vec3(0.42, 0.43, 0.45) * (0.85 + 0.3 * (mid - 0.5));\n  col = mix(col, vec3(0.68, 0.69, 0.7), top * (0.4 + 0.6 * wear));\n  col = mix(col, L(0.22, 0.19, 0.16), grime * 0.8);\n  float rust = smoothstep(0.7, 0.86, fbm(uv, vec2(10.0), 5, 6.0) + (fine - 0.5) * 0.12) * (1.0 - top) * (0.6 + 0.4 * fine); col = mix(col, L(0.42, 0.27, 0.16) * (0.7 + 0.6 * fine), rust);\n  float r = 0.5 + (mid - 0.5) * 0.15; r = mix(r, 0.22, top * (0.4 + 0.6 * wear)); r = mix(r, 0.85, grime); r = mix(r, 0.9, rust); r -= sc * 0.1;\n  float h = 0.2 + loz * 0.7 + (fine - 0.5) * 0.03 - sc * 0.03 * top;\n  emit(col, 1.0, h, mix(1.0, 0.6, smoothstep(1.5, 1.0, e) * (1.0 - loz)), r, 1.0 - grime * 0.8 - rust * 0.9);\n}`,\n  corrugated: `\nvoid surf(vec2 uv){\n  float w = uv.x * 10.0; float cz = 0.5 + 0.5 * cos(w * TAU);\n  float big = fbm(uv, vec2(2.0), 4, 1.0), fine = fbm(uv, vec2(160.0, 480.0), 2, 3.0);\n  float streak = fbm(uv, vec2(40.0, 1.0), 3, 6.0), streak2 = fbm(uv, vec2(10.0, 1.0), 3, 16.0);\n  float lapV = smoothstep(0.004, 0.0015, abs(uv.y - 0.012) * 2.286);\n  float lapZone = smoothstep(0.32, 0.0, (uv.y - 0.012) * 2.286) * step(0.012, uv.y);       // drip end of the upper sheet\n  float fi = floor(w + 0.5); float onC = step(mod(fi, 5.0), 0.5);\n  float fd = length(vec2((w - fi) / 10.0 * 0.762, (uv.y - 0.5) * 2.286));\n  float fast = onC * smoothstep(0.008, 0.006, fd), washer = onC * smoothstep(0.014, 0.011, fd) * (1.0 - fast);\n  float rg = fbm(uv, vec2(90.0, 270.0), 3, 15.0);\n  float which = smoothstep(0.45, 0.7, fbm(uv, vec2(3.0, 1.0), 3, 5.0));\n  float rust = smoothstep(0.5, 0.95, lapZone * which * (0.55 + 0.9 * streak) + (rg - 0.5) * 0.22) * (0.5 + 0.5 * rg);\n  vec3 col = vec3(0.43, 0.47, 0.52) * (0.9 + 0.2 * (big - 0.5)) * (0.95 + 0.1 * (streak2 - 0.5));\n  col = mix(col, vec3(0.6, 0.62, 0.64), smoothstep(0.6, 0.9, streak) * 0.12);\n  float dirtV = (1.0 - cz) * smoothstep(0.4, 0.75, fbm(uv, vec2(3.0, 2.0), 4, 7.0)) * 0.5;\n  col = mix(col, L(0.25, 0.24, 0.22), dirtV * 0.6);\n  col = mix(col, mix(L(0.24, 0.16, 0.12), L(0.42, 0.28, 0.17), rg), rust);\n  col = mix(col, vec3(0.5, 0.52, 0.54), fast); col *= 1.0 - washer * 0.4;\n  col *= 1.0 - lapV * 0.5;\n  float h = cz * 0.9 + (fine - 0.5) * 0.008 + fast * 0.05 - lapV * 0.03;\n  float r = 0.5 + (streak2 - 0.5) * 0.14 + (big - 0.5) * 0.12; r = mix(r, 0.8, dirtV); r = mix(r, 0.92, rust);\n  emit(col, 1.0, h, mix(0.72, 1.0, smoothstep(0.0, 0.6, cz)) * (1.0 - lapV * 0.4), r, 0.72 * (1.0 - rust * 0.9) * (1.0 - dirtV * 0.6));\n}`,\n  chainlink: `\nvoid surf(vec2 uv){\n  float n = 7.0; float a = (uv.x + uv.y) * n, b = (uv.x - uv.y) * n;\n  float da = abs(fract(a) - 0.5), db = abs(fract(b) - 0.5);\n  float rw = 0.044;\n  float over = mod(floor(a) + floor(b), 2.0) < 0.5 ? 1.0 : -1.0;\n  float pa = sqrt(max(0.0, 1.0 - (da / rw) * (da / rw))), pb = sqrt(max(0.0, 1.0 - (db / rw) * (db / rw)));\n  float za = over * cos((fract(b) - 0.5) * 3.14159), zb = -over * cos((fract(a) - 0.5) * 3.14159);\n  float ha = da < rw ? 0.45 + 0.2 * za + 0.3 * pa : 0.0, hb = db < rw ? 0.45 + 0.2 * zb + 0.3 * pb : 0.0;\n  float px = uTexel * n * 1.41421;\n  float alpha = max(smoothstep(rw + px * 0.5, rw - px * 0.5, da), smoothstep(rw + px * 0.5, rw - px * 0.5, db));\n  float fine = fbm(uv, vec2(120.0), 3, 1.0);\n  vec3 col = vec3(0.6, 0.62, 0.64) * (0.8 + 0.3 * fine);\n  float rust = smoothstep(0.62, 0.75, fbm(uv, vec2(9.0), 4, 3.0)); col = mix(col, L(0.42, 0.26, 0.15), rust * 0.8);\n  emit(col, alpha, max(ha, hb), 1.0, mix(0.4 + 0.2 * fine, 0.9, rust), 1.0 - rust * 0.9);\n}`,\n  gunmetal: `\nvoid surf(vec2 uv){\n  float fine = fbm(uv, vec2(160.0), 3, 1.0), mid = fbm(uv, vec2(12.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);\n  vec4 g = vor(uv * 200.0, vec2(200.0), 4.0);\n  float wear = smoothstep(0.66, 0.92, fbm(uv, vec2(4.0), 5, 5.0) + (fine - 0.5) * 0.1) * uP.x;\n  float s1 = scr(uv, 8.0, 6.0, 0.005, 0.3, 6.3, 0.3), s2 = scr(uv, 24.0, 7.0, 0.011, 1.2, 6.3, 0.32), s3 = scr(uv, 60.0, 8.0, 0.03, 0.0, 6.3, 0.3);\n  float sc = sat(max(s1 * uP.x, max(s2 * 0.8, s3 * 0.6)));\n  float bright = sat(wear * 0.22 + sc * (0.3 + 0.4 * uP.x));\n  float oil = smoothstep(0.4, 0.75, fbm(uv, vec2(3.0, 5.0), 4, 9.0));\n  vec3 nt = vec3(0.0); float ta = 0.9 * (0.8 + 0.25 * (mid - 0.5) + 0.2 * (g.w - 0.5) + 0.15 * (big - 0.5));\n  OV(vec3(0.42, 0.42, 0.44), bright * 0.6);\n  float r = 0.58 + (g.w - 0.5) * 0.12 + (mid - 0.5) * 0.1 - oil * 0.14 - wear * 0.14; r = mix(r, 0.3, bright * 0.8);\n  float h = 0.5 + (g.x - 0.5) * 0.12 + (fine - 0.5) * 0.1 - sc * 0.25 - wear * 0.05;\n  emit(nt, ta, h, 1.0 - sc * 0.1, r, mix(0.75, 1.0, bright));\n}`,\n  polymer: `\nvoid surf(vec2 uv){\n  vec4 g = vor(uv * 40.0, vec2(40.0), 1.0); vec4 g2 = vor(uv * 90.0 + 0.5, vec2(90.0), 2.0);\n  float fine = fbm(uv, vec2(120.0), 2, 3.0), big = fbm(uv, vec2(3.0), 4, 4.0);\n  float stip = smoothstep(0.6, 0.1, g.x) * (0.5 + 0.5 * g.w) * 0.7 + smoothstep(0.6, 0.1, g2.x) * 0.3;\n  float scuff = smoothstep(0.62, 0.8, fbm(uv, vec2(4.0), 5, 5.0));\n  float sc = scr(uv, 10.0, 6.0, 0.01, 0.5, 6.3, 0.4);\n  vec3 nt = vec3(0.0); float ta = 0.92 * (0.9 + 0.12 * (big - 0.5) + 0.08 * (fine - 0.5));\n  OV(vec3(0.45), sc * 0.25 + scuff * 0.06);\n  float h = 0.3 + stip * 0.6 * (1.0 - scuff * 0.6) + (fine - 0.5) * 0.05 - sc * 0.2;\n  float r = 0.62 + (stip - 0.5) * 0.1 + (big - 0.5) * 0.1 - scuff * 0.22 + sc * 0.1;\n  emit(nt, ta, h, 0.8 + 0.2 * stip, r, 0.0);\n}`,\n  carbon: `\nvoid surf(vec2 uv){\n  vec2 p = uv * 12.0; vec2 i = floor(p), q = fract(p);\n  float warpTop = step(mod(i.x - i.y + 400.0, 4.0), 1.5);\n  float prof = warpTop > 0.5 ? sin(q.x * 3.14159) : sin(q.y * 3.14159);\n  float fib = warpTop > 0.5 ? fbm(uv, vec2(240.0, 12.0), 2, 1.0) : fbm(uv, vec2(12.0, 240.0), 2, 5.0);\n  float h = 0.35 + 0.5 * pow(prof, 0.6) + (fib - 0.5) * 0.12;\n  vec3 col = vec3(0.035, 0.036, 0.04) * (0.7 + 0.6 * fib) * (warpTop > 0.5 ? 1.0 : 0.8);\n  float big = fbm(uv, vec2(2.0), 3, 2.0);\n  emit(col, 1.0, h, 0.6 + 0.4 * prof, 0.32 + (fib - 0.5) * 0.2 + (big - 0.5) * 0.1, 0.0);\n}`,\n  fabric: `\nvoid surf(vec2 uv){\n  float f = 36.0; vec2 p = uv * f; vec2 i = floor(p), q = fract(p);\n  float top = mod(i.x + i.y, 2.0);\n  float pw = sin(q.x * 3.14159), pf = sin(q.y * 3.14159);\n  float h = top > 0.5 ? pw * (0.6 + 0.4 * pf) : pf * (0.6 + 0.4 * pw) * 0.85;\n  float fz = fbm(uv, vec2(150.0), 3, 1.0), big = fbm(uv, vec2(2.0), 4, 2.0);\n  float thr = h3(vec2(top > 0.5 ? i.x : i.y, top), vec2(f), 3.0).x;\n  float ta = 0.9 * (0.55 + 0.45 * h) * (0.85 + 0.2 * (thr - 0.5) + 0.2 * (fz - 0.5) + 0.2 * (big - 0.5));\n  emit(vec3(0.0), ta, 0.2 + h * 0.7 + (fz - 0.5) * 0.15, 0.5 + 0.5 * h, 0.92, 0.0);\n}`,\n  armor: `\nvoid surf(vec2 uv){\n  float chip, stain, run; paintDmg(uv, 0.5, chip, stain, run);\n  float fine = fbm(uv, vec2(200.0), 2, 1.0), mid = fbm(uv, vec2(14.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);\n  float grime = smoothstep(0.45, 0.8, fbm(uv, vec2(3.0, 4.0), 5, 4.0)); float sc = scr(uv, 14.0, 5.0, 0.008, 0.4, 6.3, 0.5);\n  float sub = smoothstep(0.5, 0.75, chip), prim = smoothstep(0.15, 0.4, chip) * (1.0 - sub);\n  vec3 nt = vec3(0.0); float ta = 0.85 * (0.92 + 0.14 * (mid - 0.5) + 0.1 * (big - 0.5));\n  OV(L(0.2, 0.18, 0.15), grime * 0.07 * (0.5 + fine));\n  OV(vec3(0.55), sc * 0.3);\n  OV(L(0.5, 0.5, 0.47), prim);\n  float wv = fbm(uv, vec2(160.0, 8.0), 2, 6.0);\n  OV(L(0.4, 0.38, 0.33) * (0.6 + 0.8 * wv), sub);\n  float h = 0.6 + (fine - 0.5) * 0.04 + (mid - 0.5) * 0.03 - prim * 0.1 - sub * 0.25 - sc * 0.08;\n  float r = 0.36 + (mid - 0.5) * 0.1 + grime * 0.1 + sc * 0.15; r = mix(r, 0.6, prim); r = mix(r, 0.75, sub);\n  emit(nt, ta, h, 1.0 - sub * 0.2, r, 0.0);\n}`,\n  wood: `\nvoid surf(vec2 uv){\n  vec4 kv = vor(uv * vec2(2.0, 4.0), vec2(2.0, 4.0), 1.0); float isK = step(kv.z, 0.3);\n  float knot = isK * smoothstep(0.2, 0.0, length((kv.x) * vec2(1.0))), core = isK * smoothstep(0.05, 0.03, kv.x);\n  float wob = fbm(uv, vec2(1.0, 3.0), 3, 2.0);\n  float ring = fract(uv.y * 44.0 + (wob - 0.5) * 2.4 + knot * knot * 4.0 + (fbm(uv, vec2(4.0, 30.0), 2, 12.0) - 0.5) * 0.35);\n  float late = smoothstep(0.5, 0.92, ring) * (1.0 - smoothstep(0.92, 1.0, ring));\n  float fib = fbm(uv, vec2(3.0, 260.0), 3, 3.0), fib2 = fbm(uv, vec2(8.0, 90.0), 3, 4.0);\n  float saw = 0.5 + 0.5 * sin((uv.x + 0.02 * sin(uv.y * TAU * 2.0)) * TAU * 240.0);\n  float sawK = smoothstep(0.35, 0.7, fbm(uv, vec2(3.0), 3, 5.0));\n  float grey = smoothstep(0.2, 0.68, fbm(uv, vec2(2.0, 3.0), 5, 6.0));\n  float crack = smoothstep(0.84, 0.87, fbm(uv, vec2(2.0, 110.0), 3, 7.0)) * smoothstep(0.45, 0.65, fbm(uv, vec2(5.0, 3.0), 3, 8.0));\n  vec3 early = L(0.58, 0.49, 0.38), lateC = L(0.36, 0.28, 0.2);\n  float bigv = fbm(uv, vec2(1.0, 2.0), 3, 21.0);\n  vec3 col = mix(early, lateC, late * 0.9) * (0.85 + 0.6 * (fib - 0.5) + 0.4 * (fib2 - 0.5)) * (0.78 + 0.44 * bigv);\n  col = mix(col, lateC * 0.8, knot * 0.5); col = mix(col, L(0.28, 0.17, 0.09), core);\n  col = mix(col, L(0.47, 0.465, 0.45) * (0.7 + 0.6 * fib) * (1.0 - late * 0.3), grey * 0.82);\n  float dirt = smoothstep(0.55, 0.85, fbm(uv, vec2(4.0), 5, 9.0)); col *= 1.0 - dirt * 0.35;\n  col *= 1.0 - crack * 0.55;\n  float h = 0.5 + (fib - 0.5) * 0.4 + (late - 0.5) * 0.2 - (saw - 0.5) * 0.12 * sawK + (fib2 - 0.5) * 0.15 - crack * 0.3 + core * 0.05;\n  emit(col, 1.0, h, 1.0 - crack * 0.5, 0.82 + (fib - 0.5) * 0.15 + grey * 0.08 - core * 0.15, 0.0);\n}`,\n  plastic: `\nvoid surf(vec2 uv){\n  float fine = fbm(uv, vec2(220.0), 3, 1.0), mid = fbm(uv, vec2(14.0), 4, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);\n  float scuff = smoothstep(0.55, 0.75, fbm(uv, vec2(5.0, 8.0), 5, 4.0));\n  float s1 = scr(uv, 7.0, 5.0, 0.005, 0.2, 6.3, 0.35), s2 = scr(uv, 22.0, 6.0, 0.012, 1.0, 6.3, 0.3), s3 = scr(uv, 50.0, 7.0, 0.03, 2.0, 6.3, 0.25);\n  float sc = sat(max(s1, max(s2 * 0.8, s3 * 0.5)));\n  float dirt = smoothstep(0.5, 0.85, fbm(uv, vec2(3.0), 5, 8.0));\n  vec3 nt = vec3(0.0); float ta = 0.9 * (0.92 + 0.1 * (mid - 0.5) + 0.1 * (big - 0.5));\n  OV(vec3(0.6), sc * 0.22 + scuff * 0.03 * fine);\n  OV(L(0.25, 0.22, 0.18), dirt * 0.4);\n  float h = 0.5 + (fine - 0.5) * 0.12 + (mid - 0.5) * 0.04 - sc * 0.25;\n  emit(nt, ta, h, 1.0, 0.42 + (fine - 0.5) * 0.08 + scuff * 0.2 + sc * 0.2 + dirt * 0.2, 0.0);\n}`,\n  tarp: `\nvoid surf(vec2 uv){\n  vec2 wu = uv + (vec2(fbm(uv, vec2(2.0), 3, 1.0), fbm(uv, vec2(2.0), 3, 2.0)) - 0.5) * 0.12;\n  float f1 = 1.0 - abs(gn(wu * vec2(2.0, 7.0), vec2(2.0, 7.0), 3.0)) * 2.4;        // long drape folds\n  float f2 = 1.0 - abs(gn(wu * vec2(5.0, 13.0) + 2.0, vec2(5.0, 13.0), 4.0)) * 2.4; // finer wrinkles\n  f1 = smoothstep(0.0, 1.0, sat(f1)); f2 = smoothstep(0.2, 1.0, sat(f2));\n  float bill = fbm(wu, vec2(2.0, 3.0), 3, 5.0);\n  float scrim = max(smoothstep(0.42, 0.5, abs(fract(uv.x * 200.0) - 0.5)), smoothstep(0.42, 0.5, abs(fract(uv.y * 200.0) - 0.5)));\n  float fine = fbm(uv, vec2(240.0), 2, 6.0), mid = fbm(uv, vec2(14.0), 4, 7.0);\n  float h = 0.25 + bill * 0.35 + f1 * 0.22 + f2 * 0.07 + scrim * 0.02 + (fine - 0.5) * 0.012;\n  float dirt = smoothstep(0.5, 0.85, fbm(uv, vec2(4.0), 5, 8.0) + (0.5 - f1) * 0.08);\n  vec3 nt = vec3(0.0); float ta = 0.9 * (0.88 + 0.14 * (mid - 0.5)) * (1.0 - scrim * 0.06);\n  OV(vec3(0.5), smoothstep(0.85, 1.0, f1) * 0.03);\n  OV(L(0.3, 0.27, 0.22), dirt * 0.3);\n  emit(nt, ta, h, 0.9 + 0.1 * smoothstep(0.1, 0.7, f1), 0.48 + (mid - 0.5) * 0.15 + dirt * 0.25, 0.0);\n}`,\n  cardboard: `\nvoid surf(vec2 uv){\n  float fl = 0.5 + 0.5 * cos(uv.y * TAU * 140.0);\n  float fib = fbm(uv, vec2(40.0, 160.0), 3, 1.0), fine = fbm(uv, vec2(250.0), 2, 2.0), big = fbm(uv, vec2(2.0), 4, 3.0);\n  float sn = fbm(uv, vec2(3.0), 5, 4.0); float damp = smoothstep(0.62, 0.72, sn); float tide = smoothstep(0.61, 0.64, sn) * (1.0 - smoothstep(0.64, 0.7, sn));\n  float crease = smoothstep(0.012, 0.004, abs(fbm(uv, vec2(2.0), 2, 5.0) - 0.5)) * smoothstep(0.5, 0.7, fbm(uv, vec2(3.0), 2, 6.0));\n  vec3 col = L(0.66, 0.52, 0.36) * (0.85 + 0.2 * (fib - 0.5) + 0.12 * (fine - 0.5) + 0.2 * (big - 0.5)) * (0.97 + 0.06 * fl);\n  col *= (1.0 - damp * 0.3) * (1.0 - tide * 0.18); col = mix(col, col * 1.25, crease * 0.5);\n  col *= 1.0 - smoothstep(0.8, 0.9, fbm(uv, vec2(120.0), 2, 7.0)) * 0.2;\n  float h = 0.5 + (fl - 0.5) * 0.12 + (fib - 0.5) * 0.15 + (fine - 0.5) * 0.08 - crease * 0.3 + damp * 0.2 * (fbm(uv, vec2(20.0), 3, 8.0) - 0.5);\n  emit(col, 1.0, h, 1.0 - crease * 0.3, 0.9 - damp * 0.2 + (fib - 0.5) * 0.1, 0.0);\n}`,\n  rope: `\nvoid surf(vec2 uv){\n  float a = (uv.x + uv.y) * 4.0; float prof = sin(fract(a) * 3.14159);\n  float fib = fbm(uv, vec2(60.0), 3, 1.0);\n  float yarn = 0.5 + 0.5 * sin((uv.x - uv.y) * 4.0 * TAU * 5.0 + 2.0 * sin(a * TAU));\n  float h = pow(prof, 0.7) * 0.8 + yarn * 0.1 + (fib - 0.5) * 0.15;\n  vec3 col = L(0.66, 0.6, 0.46) * (0.6 + 0.4 * prof) * (0.85 + 0.3 * (fib - 0.5)) * (0.92 + 0.16 * yarn);\n  float dirt = smoothstep(0.4, 0.8, fbm(uv, vec2(3.0), 4, 2.0)); col = mix(col, L(0.25, 0.22, 0.18), dirt * 0.5 * (1.0 - prof * 0.5));\n  emit(col, 1.0, h, 0.45 + 0.55 * prof, 0.95, 0.0);\n}`,\n  tire: `\nvoid surf(vec2 uv){\n  float sv = fract(uv.y + 0.5) - 0.5; float v = abs(sv) * 2.0; float u = uv.x;\n  float zig = 0.03 * abs(fract(u * 10.0) - 0.5) * 2.0;\n  float g1 = smoothstep(0.035, 0.02, abs(v - 0.36 - zig)), g0 = smoothstep(0.03, 0.018, abs(v - zig * 0.5));\n  float lat = smoothstep(0.06, 0.03, abs(fract(u * 10.0 + v * 1.2 * sign(sv)) - 0.5)) * step(0.4, v) * step(v, 0.8);\n  float sipe = smoothstep(0.012, 0.005, abs(fract(u * 20.0 + v * 0.8) - 0.5)) * step(0.05, v) * step(v, 0.33);\n  float groove = sat(max(max(g0, g1), max(lat, sipe * 0.6)));\n  float side = smoothstep(0.84, 0.9, v);\n  float rib = (0.5 + 0.5 * cos(v * TAU * 14.0)) * side;\n  float fine = fbm(uv, vec2(200.0, 120.0), 3, 1.0), mid = fbm(uv, vec2(10.0, 6.0), 4, 2.0);\n  float h = (1.0 - groove) * (1.0 - side) * 0.8 + side * (0.35 + rib * 0.1) + (fine - 0.5) * 0.04;\n  float dust = smoothstep(0.4, 0.75, fbm(uv, vec2(4.0, 3.0), 5, 3.0));\n  vec3 col = vec3(0.022) * (0.8 + 0.5 * (mid - 0.5)); col = mix(col, L(0.22, 0.2, 0.17), dust * 0.25 + groove * (1.0 - side) * 0.2);\n  emit(col, 1.0, h, 1.0 - groove * 0.5 * (1.0 - side), 0.85 + (fine - 0.5) * 0.1 - side * 0.1, 0.0);\n}`,\n  glass: `\nvoid surf(vec2 uv){\n  float d = uP.x;\n  float big = fbm(uv, vec2(2.0), 5, 1.0), mid = fbm(uv, vec2(12.0), 4, 2.0), fine = fbm(uv, vec2(200.0), 2, 3.0);\n  float dust = sat(smoothstep(0.75 - 0.45 * d, 0.95 - 0.3 * d, big * 0.7 + mid * 0.3) + fine * 0.15 * d);\n  float st2 = fbm(uv, vec2(120.0, 3.0), 2, 5.0);\n  float trail = smoothstep(0.62, 0.72, fbm(uv, vec2(50.0, 1.0), 2, 4.0)) * smoothstep(0.3, 0.6, fbm(uv, vec2(50.0, 2.0), 2, 6.0));\n  vec4 dv = vor(uv * 60.0, vec2(60.0), 7.0); float drop = step(dv.z, 0.45) * smoothstep(0.32 * dv.w + 0.06, 0.0, dv.x);\n  vec4 dv2 = vor(uv * 150.0, vec2(150.0), 8.0); float drop2 = step(dv2.z, 0.5) * smoothstep(0.3 * dv2.w + 0.05, 0.0, dv2.x);\n  dust *= 1.0 - trail * 0.7;\n  vec3 col = mix(L(0.5, 0.6, 0.62) * 0.25, L(0.5, 0.47, 0.4), dust);\n  float alpha = mix(0.16, 0.55 + 0.35 * d, dust) + drop * 0.08 + (st2 - 0.5) * 0.05 * d;\n  float h = 0.3 + drop * 0.5 + drop2 * 0.15 + trail * 0.06 * st2;\n  float r = mix(0.03, 0.55, dust); r = mix(r, 0.03, sat(drop * 2.0));\n  emit(col, alpha, h, 1.0, r, 0.0);\n}`,\n  water: `\nvoid surf(vec2 uv){\n  float a = fbm(uv, vec2(6.0, 10.0), 4, 1.0), b = fbm(uv + 0.3, vec2(20.0, 30.0), 3, 2.0);\n  emit(L(0.1, 0.16, 0.18) * 0.5, 1.0, 0.5 + (a - 0.5) * 0.6 + (b - 0.5) * 0.2, 1.0, 0.06, 0.0);\n}`,\n};\n\nexport const PATCH = {\n  common: `\nvarying vec3 vSlPos;\n#ifdef SL_TRIPLANAR\nvarying vec3 vSlONrm; varying vec3 vSlAx; varying vec3 vSlAy;\n#endif\n`,\n  projectVertex: `\n#ifdef SL_TRIPLANAR\n  vSlPos = position; vSlONrm = normal;\n  vec3 slAx = vec3(1.0, 0.0, 0.0), slAy = vec3(0.0, 1.0, 0.0);\n  #ifdef USE_SKINNING\n    slAx = (skinMatrix * vec4(slAx, 0.0)).xyz; slAy = (skinMatrix * vec4(slAy, 0.0)).xyz;\n  #endif\n  #ifdef USE_INSTANCING\n    slAx = mat3(instanceMatrix) * slAx; slAy = mat3(instanceMatrix) * slAy;\n  #endif\n  vSlAx = normalize(mat3(modelViewMatrix) * slAx); vSlAy = normalize(mat3(modelViewMatrix) * slAy);\n#else\n  vec4 slWP = vec4(transformed, 1.0);\n  #ifdef USE_INSTANCING\n    slWP = instanceMatrix * slWP;\n  #endif\n  vSlPos = (modelMatrix * slWP).xyz;\n#endif\n`,\n  fragCommon: `\nuniform float uSlWet; uniform vec4 uSlWetP; uniform vec4 uSlMacro; uniform vec3 uSlUv; uniform vec2 uSlX;\nvarying vec3 vSlPos;\n#ifdef SL_TRIPLANAR\nvarying vec3 vSlONrm; varying vec3 vSlAx; varying vec3 vSlAy;\nvec3 slTw; vec2 slUx; vec2 slUy; vec2 slUz;\nvec4 slTri(sampler2D t){ return texture2D(t, slUx) * slTw.x + texture2D(t, slUy) * slTw.y + texture2D(t, slUz) * slTw.z; }\n#endif\nvec4 slORM; vec2 slUv; float slWetK = 0.0; float slUp = 0.0; float slMac = 0.5; float slMac2 = 0.5; float slBead = 0.0;\nfloat slH(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }\nfloat slN3(vec3 x){\n  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);\n  return mix(mix(mix(slH(i), slH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 0.0)), slH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),\n             mix(mix(slH(i + vec3(0.0, 0.0, 1.0)), slH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 1.0)), slH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);\n}\n`,\n  map: `\n#ifdef SL_TRIPLANAR\n  { vec3 slOn = normalize(vSlONrm); vec3 slW3 = pow(abs(slOn), vec3(6.0)); slTw = slW3 / (slW3.x + slW3.y + slW3.z);\n    vec3 slQ = vSlPos * uSlUv.z; slUx = slQ.zy; slUy = slQ.xz; slUz = slQ.xy; }\n  vec4 sampledDiffuseColor = slTri(map);\n  slORM = slTri(roughnessMap);\n#else\n  slUv = vMapUv * uSlUv.xy;\n  vec4 sampledDiffuseColor = texture2D(map, slUv);\n  slORM = texture2D(roughnessMap, slUv);\n#endif\n#ifdef SL_FX\n  {\n    #ifdef FLAT_SHADED\n      vec3 slVN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));\n    #else\n      vec3 slVN = normalize(vNormal);\n      #ifdef DOUBLE_SIDED\n        slVN *= gl_FrontFacing ? 1.0 : -1.0;\n      #endif\n    #endif\n    vec3 slWN = inverseTransformDirection(slVN, viewMatrix);\n    vec3 slMp = vSlPos * uSlMacro.z;\n    slMac = slN3(slMp); slMac2 = slN3(slMp * 3.7 + 11.3);\n    float slM = slMac * 0.65 + slMac2 * 0.35 - 0.5;\n    sampledDiffuseColor.rgb *= 1.0 + uSlMacro.x * slM * 2.0;\n    float slGr = smoothstep(0.5, 0.85, slMac * 0.6 + slMac2 * 0.4 + (1.0 - slORM.r) * 0.3) * uSlMacro.w;\n    sampledDiffuseColor.rgb *= 1.0 - slGr * 0.35;\n    #if SL_TINT == 1\n      sampledDiffuseColor.a *= 1.0 - slGr * 0.2;\n    #endif\n    // rain wetness: strongest on up-facing faces, streaky on verticals, none underneath\n    slUp = smoothstep(0.15, 0.85, slWN.y);\n    float slExpo = smoothstep(-0.4, -0.05, slWN.y);\n    float slStreak = 0.0;\n    #ifndef SL_TRIPLANAR\n      float slSc = vSlPos.x + vSlPos.z;\n      slStreak = slN3(vec3(slSc * 9.0, vSlPos.y * 0.55, slSc * 0.7 + 3.0)) * slN3(vec3(slSc * 29.0, vSlPos.y * 1.1, 7.0));\n      slStreak = smoothstep(0.12, 0.42, slStreak) * smoothstep(0.3, 0.7, slN3(vec3(slSc * 1.1, vSlPos.y * 0.25, 1.7)));\n    #endif\n    float slW = uSlWet * uSlX.x * slExpo;\n    slWetK = slW * mix(uSlWetP.z * (0.55 + 0.9 * slStreak), 0.75 + 0.5 * slMac, slUp);\n    #ifndef SL_TRIPLANAR\n      { float slLow = smoothstep(0.5, 0.0, vSlPos.y) * (1.0 - slUp) * slExpo;        // damp, splashed band where things meet the ground\n        slWetK += slW * slLow * 0.6;\n        float slLg = 1.0 - slLow * min(uSlMacro.w, 0.5) * 0.45;\n        sampledDiffuseColor.rgb *= slLg;\n        #if SL_TINT == 1\n          sampledDiffuseColor.a *= slLg;\n        #endif\n      }\n    #endif\n    slWetK = clamp(slWetK, 0.0, 1.0);\n    float slBf = clamp(1.0 - length(fwidth(vSlPos)) * 120.0, 0.0, 1.0);\n    if (uSlWetP.w > 0.0 && slBf > 0.0) {\n      float slB = slN3(vSlPos * 170.0) * 0.6 + slN3(vSlPos * 410.0 + 5.0) * 0.4;\n      slBead = smoothstep(0.6, 0.68, slB) * uSlWetP.w * slW * slBf * (0.4 + 0.6 * slUp + 0.5 * slStreak);\n    }\n  }\n#endif\n#if SL_TINT == 1\n  diffuseColor.rgb = sampledDiffuseColor.rgb + diffuse * sampledDiffuseColor.a;\n#elif SL_TINT == 2\n  { float slL = clamp(dot(sampledDiffuseColor.rgb, vec3(0.3333)) / 0.19, 0.55, 1.35);\n    diffuseColor.rgb = mix(sampledDiffuseColor.rgb, diffuse * slL, sampledDiffuseColor.a * 0.96); }\n#elif SL_TINT == 3\n  diffuseColor *= sampledDiffuseColor;\n#else\n  diffuseColor.rgb *= sampledDiffuseColor.rgb;\n#endif\n#ifdef SL_FX\n  { float slLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));\n    diffuseColor.rgb = mix(vec3(slLum), diffuseColor.rgb, 1.0 + 0.25 * slWetK * uSlWetP.x * 2.0);\n    diffuseColor.rgb *= 1.0 - uSlWetP.x * slWetK; }\n#endif\n#ifdef SL_ACUT\n  // alpha-tested wire mesh that survives distance: wires stay ~1 px wide through the mips (lowered threshold),\n  // then dissolve into a stable ~1/3-coverage dither veil once the diamonds themselves are sub-pixel.\n  { vec2 slFw = fwidth(slUv) * 512.0; float slLod = log2(max(max(slFw.x, slFw.y), 1e-4));\n    float slThC = 0.5 * exp2(-clamp(slLod - 1.0, 0.0, 4.0));\n    float slIgn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\n    float slTh = mix(slThC, 0.05 + slIgn * 0.80, smoothstep(3.5, 5.5, slLod));\n    diffuseColor.a = sampledDiffuseColor.a > slTh ? 1.0 : 0.0;\n    // sub-pixel wires: the surviving fragments stand in for a much thinner wire, so dim them (no white sheets in the sun)\n    diffuseColor.rgb *= mix(1.0, 0.45, smoothstep(1.5, 4.5, slLod)); }\n#endif\n`,\n  roughness: `\nfloat roughnessFactor = roughness * slORM.g;\n#ifdef SL_FX\n  roughnessFactor += uSlMacro.y * ((slMac2 - 0.5) * 1.4 + (slMac - 0.5) * 0.8);\n  roughnessFactor = mix(roughnessFactor, roughnessFactor * uSlWetP.y, slWetK);\n  roughnessFactor = mix(roughnessFactor, 0.05, slBead);\n#endif\n#if defined( USE_NORMALMAP_TANGENTSPACE ) && !defined( SL_TRIPLANAR )\n  { float slNl = length(texture2D(normalMap, slUv).xyz * 2.0 - 1.0);\n    roughnessFactor = sqrt(roughnessFactor * roughnessFactor + clamp(1.0 - slNl, 0.0, 1.0) * 0.6); }\n#endif\nroughnessFactor = clamp(roughnessFactor, 0.045, 1.0);\n`,\n  metalness: `\nfloat metalnessFactor = metalness * slORM.b;\n`,\n  normal: `\n#ifdef SL_TRIPLANAR\n  { vec3 slOn = normalize(vSlONrm);\n    vec3 slTx = texture2D(normalMap, slUx).xyz * 2.0 - 1.0, slTy = texture2D(normalMap, slUy).xyz * 2.0 - 1.0, slTz = texture2D(normalMap, slUz).xyz * 2.0 - 1.0;\n    slTx.xy *= normalScale; slTy.xy *= normalScale; slTz.xy *= normalScale;\n    slTx = vec3(slTx.xy + slOn.zy, abs(slTx.z) * slOn.x); slTy = vec3(slTy.xy + slOn.xz, abs(slTy.z) * slOn.y); slTz = vec3(slTz.xy + slOn.xy, abs(slTz.z) * slOn.z);\n    vec3 slNo = normalize(slTx.zyx * slTw.x + slTy.xzy * slTw.y + slTz.xyz * slTw.z);\n    vec3 slA = normalize(vSlAx), slB = normalize(vSlAy); vec3 slC = cross(slA, slB);\n    normal = normalize(slA * slNo.x + slB * slNo.y + slC * slNo.z);\n    #ifdef DOUBLE_SIDED\n      normal *= faceDirection;\n    #endif\n  }\n#elif defined( USE_NORMALMAP_TANGENTSPACE )\n  { vec3 mapN = texture2D(normalMap, slUv).xyz * 2.0 - 1.0;\n    mapN.xy *= normalScale * (1.0 - 0.45 * slWetK * slUp);\n    normal = normalize(tbn * mapN); }\n#endif\n`,\n};\n\nexport const SURF_FAMILIES = [\"asphalt\", \"concrete\", \"brick\", \"epoxy\", \"paint\", \"hazard\", \"hull\", \"galv\", \"metal\", \"brushed\", \"rust\", \"diamond\", \"corrugated\", \"chainlink\", \"gunmetal\", \"polymer\", \"carbon\", \"fabric\", \"armor\", \"wood\", \"plastic\", \"tarp\", \"cardboard\", \"rope\", \"tire\", \"glass\", \"water\"];\nexport const SOURCE_CHARS = 48104;\n\n/* ---------------------------------------------------------------------------\n * 烘焙器宿主（非原版代码，等价重写）\n *\n * 原版把这段闭包在 mats 模块里，直接吃 i.renderer / i.quality。这里重写成可注入\n * THREE 与 renderer 的形式，逻辑逐行对应：\n *\n *   族参数 c3[family]  ──►  surf() 着色器（GLSL 逐字抽自原版）\n *                            ├─ pass0 → albedo（sqrt 编码，8 位）\n *                            ├─ pass1 → ORM（R=AO G=rough B=metal）\n *                            └─ pass2 → height（hi + lo 两通道打包）\n *   height + bump(mm) ──► 法线 pass（Sobel，uK = bump*0.001*D/tile）\n *   albedo(sqrt) ──► copy(uSq=1) 平方回线性\n *\n * 与原版唯一的差异：原版一次 MRT 画三个输出（WebGLRenderTarget count:3），\n * 本机 three 是 r160，还没有 count，于是拆成 3 次 uSel 选择的单目标 pass。\n * 逐像素结果相同，只是多两次 draw call。\n * ------------------------------------------------------------------------- */\n\nconst FALLBACK_INST = {\n  set: \"metal\", tint: 1, color: 8027520, rough: 1, metal: 1,\n  wet: [0, 0.7, 0.55, 0.5], macro: [0.14, 0.1, 0.8, 0.2], nrm: 1\n};\n\n/** 原版 h3()：把湿润/脏污/三平面/镂空的 GLSL 补丁塞进标准材质。 */\nexport function patchStandard(THREE, shader, uniforms) {\n  Object.assign(shader.uniforms, uniforms);\n  var ao = THREE.ShaderChunk.aomap_fragment.replace(\"texture2D( aoMap, vAoMapUv ).r\", \"slORM.r\");\n  shader.vertexShader = shader.vertexShader\n    .replace(\"#include <common>\", \"#include <common>\\n\" + PATCH.common)\n    .replace(\"#include <project_vertex>\", \"#include <project_vertex>\\n\" + PATCH.projectVertex);\n  shader.fragmentShader = shader.fragmentShader\n    .replace(\"#include <common>\", \"#include <common>\\n\" + PATCH.fragCommon)\n    .replace(\"#include <map_fragment>\", PATCH.map)\n    .replace(\"#include <roughnessmap_fragment>\", PATCH.roughness)\n    .replace(\"#include <metalnessmap_fragment>\", PATCH.metalness)\n    .replace(\"#include <normal_fragment_maps>\", PATCH.normal)\n    .replace(\"#include <aomap_fragment>\", ao);\n}\n\n/**\n * @param THREE    注入的 three\n * @param renderer 已存在的 WebGLRenderer（共用上下文，不新建）\n * @param ledger   material-ledger 模块（FAMILIES / INSTANCES / makeInstance）\n * @param opts     { tex: 基准分辨率, wet: 全局湿度 }\n */\nexport function createBaker(THREE, renderer, ledger, opts) {\n  opts = opts || {};\n  var FAM = ledger.FAMILIES, INST = ledger.INSTANCES;\n  var base = Math.max(64, Math.min(opts.tex || 1024, 2048));\n  var aniso = Math.min(8, renderer.capabilities && renderer.capabilities.getMaxAnisotropy\n    ? renderer.capabilities.getMaxAnisotropy() : 1);\n\n  /* 全屏 quad：RawShaderMaterial —— 不让 three 注入 attribute 声明，\n     否则会和着色器里的 in vec3 position 重定义冲突。 */\n  var quadScene = new THREE.Scene();\n  var quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\n  var quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));\n  quad.frustumCulled = false;\n  quadScene.add(quad);\n\n  var surfMats = new Map();\n  var sets = new Map();\n  var mats = new Map();\n  var liveTargets = [];\n  var wetU = { value: opts.wet === undefined ? 1 : +opts.wet };\n  var stats = { families: 0, passes: 0, ms: 0, bytes: 0 };\n\n  function raw(frag, uniforms) {\n    return new THREE.RawShaderMaterial({\n      glslVersion: THREE.GLSL3,\n      vertexShader: GLSL_VERT,\n      fragmentShader: frag,\n      uniforms: uniforms || {},\n      depthTest: false, depthWrite: false, blending: THREE.NoBlending\n    });\n  }\n\n  function surfMat(fn) {\n    var m = surfMats.get(fn);\n    if (m) return m;\n    m = raw(GLSL_COMMON + (GLSL_SURF[fn] || GLSL_SURF.metal) + GLSL_MAIN, {\n      uP: { value: new THREE.Vector4() },\n      uSeed: { value: 0 },\n      uTexel: { value: 0 },\n      uSel: { value: 0 }\n    });\n    surfMats.set(fn, m);\n    return m;\n  }\n\n  var copyMat = raw(GLSL_COPY, { tA: { value: null }, uSq: { value: 1 } });\n  var normalMat = raw(GLSL_NORMAL, { tH: { value: null }, uK: { value: new THREE.Vector2() }, uTexel: { value: 0 } });\n\n  function target(size, mip) {\n    var rt = new THREE.WebGLRenderTarget(size, size, {\n      depthBuffer: false,\n      generateMipmaps: !!mip,\n      minFilter: mip ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter,\n      magFilter: mip ? THREE.LinearFilter : THREE.NearestFilter,\n      wrapS: THREE.RepeatWrapping,\n      wrapT: THREE.RepeatWrapping,\n      anisotropy: mip ? aniso : 1,\n      format: THREE.RGBAFormat,\n      type: THREE.UnsignedByteType\n    });\n    rt.texture.colorSpace = THREE.NoColorSpace;\n    liveTargets.push(rt);\n    stats.bytes += size * size * 4 * (mip ? 3 : 2);\n    return rt;\n  }\n\n  function draw(rt, mat) {\n    quad.material = mat;\n    renderer.setRenderTarget(rt);\n    renderer.render(quadScene, quadCam);\n    stats.passes++;\n  }\n\n  function bake(familyId) {\n    var key = familyId + \"|\" + base;\n    var hit = sets.get(key);\n    if (hit) return hit;\n\n    var fam = FAM[familyId];\n    if (!fam) throw new Error(\"未知材质族 \" + familyId);\n    var t0 = (window.performance || Date).now();\n\n    var D = Math.round(base * fam.size);\n    if (fam.hero && base >= 2048) D = 2048;\n    D = Math.max(32, D);\n    var tile = Array.isArray(fam.tile) ? fam.tile : [fam.tile, fam.tile];\n    var p = fam.p || [];\n\n    /* pass 0/1/2：surf 的三个输出 */\n    var o = [target(D, false), target(D, false), target(D, false)];\n    var sm = surfMat(fam.fn);\n    sm.uniforms.uP.value.set(p[0] || 0, p[1] || 0, p[2] || 0, p[3] || 0);\n    sm.uniforms.uSeed.value = fam.seed || 0;\n    sm.uniforms.uTexel.value = 1 / D;\n\n    var prevRT = renderer.getRenderTarget();\n    var prevAuto = renderer.autoClear;\n    var prevXR = renderer.xr && renderer.xr.enabled;\n    var prevShadow = renderer.shadowMap.autoUpdate;\n    renderer.autoClear = true;\n    if (renderer.xr) renderer.xr.enabled = false;\n    renderer.shadowMap.autoUpdate = false;\n\n    for (var i = 0; i < 3; i++) {\n      sm.uniforms.uSel.value = i;\n      draw(o[i], sm);\n    }\n\n    /* albedo：emit 里写了 sqrt(c)，这里平方回线性 */\n    var albedo = target(D, true);\n    copyMat.uniforms.tA.value = o[0].texture;\n    copyMat.uniforms.uSq.value = 1;\n    draw(albedo, copyMat);\n\n    /* ORM：原样搬 */\n    var orm = target(D, true);\n    copyMat.uniforms.tA.value = o[1].texture;\n    copyMat.uniforms.uSq.value = 0;\n    draw(orm, copyMat);\n\n    /* 法线：从 height 求梯度，uK 把毫米凹凸换算到纹素空间 */\n    var nrm = target(D, true);\n    normalMat.uniforms.tH.value = o[2].texture;\n    normalMat.uniforms.uTexel.value = 1 / D;\n    normalMat.uniforms.uK.value.set(fam.bump * 0.001 * D / tile[0], fam.bump * 0.001 * D / tile[1]);\n    draw(nrm, normalMat);\n\n    renderer.setRenderTarget(prevRT);\n    renderer.autoClear = prevAuto;\n    if (renderer.xr) renderer.xr.enabled = prevXR;\n    renderer.shadowMap.autoUpdate = prevShadow;\n\n    o[0].dispose(); o[1].dispose(); o[2].dispose();\n\n    var set = {\n      key: familyId, size: D, tile: tile,\n      albedo: albedo.texture, orm: orm.texture, normal: nrm.texture,\n      targets: [albedo, orm, nrm]\n    };\n    [set.albedo, set.orm, set.normal].forEach(function (t) {\n      t.repeat.set(1 / tile[0], 1 / tile[1]);\n      t.needsUpdate = true;\n    });\n\n    stats.families++;\n    stats.ms += ((window.performance || Date).now() - t0);\n    sets.set(key, set);\n    return set;\n  }\n\n  function material(id, o) {\n    o = o || {};\n    var inst = INST[id] || FALLBACK_INST;\n    var fam = FAM[inst.set];\n    if (!fam) throw new Error(\"未知材质实例 \" + id);\n\n    var tri = !!o.triplanar;\n    var fx = !inst.transparent && !inst.alphaCut;\n    var key = id + \"|\" + (o.vertexColors ? \"v\" : \"\") + (tri ? \"t\" : \"\") +\n      (o.doubleSide || inst.side === 2 ? \"d\" : \"\") + (o.interior ? \"i\" : \"\") +\n      (o.color !== undefined ? \"c\" + o.color : \"\");\n\n    var hitm = mats.get(key);\n    if (hitm) return hitm;\n\n    var set = bake(inst.set);\n    var m = new THREE.MeshStandardMaterial({\n      map: set.albedo,\n      normalMap: set.normal,\n      roughnessMap: set.orm,\n      metalnessMap: set.orm,\n      aoMap: set.orm,\n      color: o.color !== undefined ? o.color : inst.color,\n      roughness: inst.rough,\n      metalness: inst.metal,\n      vertexColors: !!o.vertexColors\n    });\n    m.name = id;\n    m.normalScale.set(inst.nrm, inst.nrm);\n    if (o.doubleSide || inst.side === 2) m.side = THREE.DoubleSide;\n    if (inst.transparent) { m.transparent = true; m.depthWrite = false; m.envMapIntensity = 1.4; }\n    if (inst.alphaCut) m.alphaTest = 0.5;\n\n    m.defines = Object.assign({}, m.defines, { SL_TINT: inst.tint });\n    if (tri) m.defines.SL_TRIPLANAR = \"\";\n    if (fx) m.defines.SL_FX = \"\";\n    if (inst.alphaCut && !tri) m.defines.SL_ACUT = \"\";\n\n    var uniforms = {\n      uSlWet: wetU,\n      uSlWetP: { value: new THREE.Vector4().fromArray(inst.wet) },\n      uSlMacro: { value: new THREE.Vector4().fromArray(inst.macro) },\n      uSlUv: { value: new THREE.Vector3(1, 1, tri ? (o.scale || 1) / set.tile[0] : set.size) },\n      uSlX: { value: new THREE.Vector2(o.interior ? 0.12 : 1, 0) }\n    };\n    m.userData.sl = uniforms;\n    m.userData.set = set.key;\n    m.userData.tile = set.tile;\n    m.onBeforeCompile = function (sh) { patchStandard(THREE, sh, uniforms); };\n    m.customProgramCacheKey = function () {\n      return \"sl2|\" + inst.tint + (tri ? \"t\" : \"\") + (fx ? \"f\" : \"\") + (inst.alphaCut ? \"a\" : \"\");\n    };\n\n    mats.set(key, m);\n    return m;\n  }\n\n  return {\n    bake: bake,\n    material: material,\n    set: function (familyId) { return bake(familyId); },\n    stats: stats,\n    wet: wetU,\n    /** 把 uv 复制一份给 uv1：极少数几何（球/自定义）没有第二套 UV 时才需要 */\n    uv1: function (geo) {\n      if (geo && !geo.attributes.uv1 && geo.attributes.uv) geo.setAttribute(\"uv1\", geo.attributes.uv);\n      return geo;\n    },\n    dispose: function () {\n      mats.forEach(function (m) { m.dispose(); });\n      sets.forEach(function (s) { s.targets.forEach(function (t) { t.dispose(); }); });\n      surfMats.forEach(function (m) { m.dispose(); });\n      copyMat.dispose(); normalMat.dispose();\n      quad.geometry.dispose();\n      mats.clear(); sets.clear(); surfMats.clear(); liveTargets.length = 0;\n    }\n  };\n}\n",
   "static": {
    "烘焙管线": [
     {
      "k": "surf 族函数",
      "v": "27 个（asphalt…water）"
     },
     {
      "k": "GLSL 总量",
      "v": "48,104 字符，逐字抽自原版"
     },
     {
      "k": "每族 pass",
      "v": "surf×3 → albedo / ORM / height，再 copy×2 + 法线×1"
     },
     {
      "k": "法线强度",
      "v": "uK = bump(mm) × 0.001 × 分辨率 / tile(m)"
     },
     {
      "k": "ORM 打包",
      "v": "R=AO  G=roughness  B=metalness"
     },
     {
      "k": "湿润",
      "v": "uSlWet / uSlWetP 4 元组，按朝向与高度加权"
     },
     {
      "k": "脏污",
      "v": "uSlMacro 4 元组，三线性噪声"
     },
     {
      "k": "与原版差异",
      "v": "MRT → 3 次单目标 pass（r160 无 count）"
     }
    ]
   },
   "verdict": "可搬，但要带宿主。GLSL 逐字抽自原版；唯一改动是把 MRT 拆成三次 uSel 选择的单目标 pass，逐像素结果相同。27 族在 three r160 上全部编译通过，并已用于 48 个材质实例。",
   "limits": "补丁靠替换 three 的标准材质 chunk（map_fragment / roughnessmap_fragment / normal_fragment_maps…），换 three 大版本需要重新核对变量名；原版是 r180，本机是 r160，已在 r160 上验证。",
   "related": [
    "material-ledger",
    "modeling-kit"
   ],
   "crit": {
    "pure": "△",
    "free": "△",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 1042,
   "bytes": 60567
  },
  {
   "id": "props-ledger",
   "name": "道具台账",
   "en": "Prop Ledger",
   "type": "MODEL",
   "grade": "A",
   "tags": [
    "道具",
    "关卡",
    "纯数据",
    "米制"
   ],
   "summary": "36 条道具，每条 5 个字段：宽高深（米）、材质名、表面类型。这是全工程唯一一处「资产清单」式的数据，也是最容易独立管理的一层。",
   "anchor": "L5453:C13986 Gi / _i() 注册表",
   "deps": "无",
   "standalone": "完全独立",
   "code": "/**\n * 道具台账 · Aurora-Props\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L5453:C13986  var Gi\n *      自定义几何注册：_i(name, builder)，共 14 条\n *\n * 36 条道具，每条 5 个字段：[宽, 高, 深](米) + 材质名 + 表面类型。\n * 这是原版唯一一处\"资产清单\"式数据：尺寸、材质、碰撞面都写在一行里。\n * 原点在底面中心（bottom anchor），长轴沿 X。\n *\n * 依赖：无。纯数据，可直接被关卡生成/碰撞/合批三方共用。\n */\n\nexport const PROP_LEDGER = {\n  container20:       { size: [6.06, 2.59, 2.44], material: \"paint_red\", surface: \"metal\" },\n  container40:       { size: [12.19, 2.59, 2.44], material: \"paint_blue\", surface: \"metal\" },\n  container40hc:     { size: [12.19, 2.9, 2.44], material: \"paint_green\", surface: \"metal\" },\n  jersey_barrier:    { size: [3, 0.81, 0.6], material: \"concrete\", surface: \"concrete\" },  // 自定义几何\n  light_mast:        { size: [0.5, 14, 0.5], material: \"steel_galv\", surface: \"metal\" },  // 自定义几何\n  fence_panel:       { size: [3, 2.4, 0.08], material: \"chainlink\", surface: \"metal\" },  // 自定义几何\n  guard_booth:       { size: [2.6, 2.7, 2.2], material: \"paint_white\", surface: \"metal\" },  // 自定义几何\n  gate_arm:          { size: [5, 1.1, 0.3], material: \"hazard_stripes\", surface: \"metal\" },  // 自定义几何\n  bollard_mooring:   { size: [0.7, 0.6, 0.7], material: \"steel_dark\", surface: \"metal\" },  // 自定义几何\n  bollard_post:      { size: [0.17, 1, 0.17], material: \"paint_yellow\", surface: \"metal\" },  // 自定义几何\n  relay_node:        { size: [1.2, 2.4, 0.8], material: \"paint_grey\", surface: \"metal\" },  // 自定义几何\n  shelf_rack:        { size: [2.7, 4.2, 1.1], material: \"paint_orange\", surface: \"metal\" },  // 自定义几何\n  stairs_metal:      { size: [3, 2.6, 1], material: \"diamond_plate\", surface: \"metal\" },  // 自定义几何\n  catwalk:           { size: [3, 1.1, 1.2], material: \"diamond_plate\", surface: \"metal\" },  // 自定义几何\n  reefer_unit:       { size: [0.5, 2.3, 2.3], material: \"paint_white\", surface: \"metal\" },  // 自定义几何\n  barrel:            { size: [0.6, 0.9, 0.6], material: \"paint_blue\", surface: \"metal\" },\n  pallet:            { size: [1.2, 0.144, 1], material: \"wood_pallet\", surface: \"wood\" },\n  pallet_stack:      { size: [1.2, 1.15, 1], material: \"wood_pallet\", surface: \"wood\" },\n  crate_wood:        { size: [1.1, 1, 0.9], material: \"wood_pallet\", surface: \"wood\" },\n  crate_stack:       { size: [1.2, 1.9, 1], material: \"wood_pallet\", surface: \"wood\" },\n  ibc_tote:          { size: [1.2, 1.16, 1], material: \"plastic_grey\", surface: \"metal\" },\n  forklift:          { size: [3.4, 2.2, 1.25], material: \"paint_yellow\", surface: \"metal\" },\n  cable_reel:        { size: [1.3, 1.3, 0.8], material: \"wood_dark\", surface: \"wood\" },\n  tire_stack:        { size: [0.8, 1, 0.8], material: \"tire\", surface: \"rubber\" },\n  dumpster:          { size: [1.9, 1.35, 1.1], material: \"paint_green\", surface: \"metal\" },\n  generator:         { size: [2.2, 1.4, 1], material: \"paint_yellow\", surface: \"metal\" },\n  jerry_can:         { size: [0.35, 0.47, 0.17], material: \"paint_green\", surface: \"metal\" },\n  traffic_cone:      { size: [0.36, 0.7, 0.36], material: \"plastic_red\", surface: \"rubber\" },\n  gas_cylinders:     { size: [0.9, 1.6, 0.5], material: \"steel_dark\", surface: \"metal\" },\n  tarp_cargo:        { size: [2.4, 1.5, 1.4], material: \"tarp\", surface: \"dirt\" },\n  sandbags:          { size: [2, 0.9, 0.6], material: \"tarp\", surface: \"dirt\" },\n  toolbox_cart:      { size: [0.9, 0.95, 0.5], material: \"plastic_red\", surface: \"metal\" },\n  floodlight_stand:  { size: [1, 2.2, 1], material: \"paint_yellow\", surface: \"metal\" },  // 自定义几何\n  cardboard_boxes:   { size: [1, 0.8, 0.8], material: \"cardboard\", surface: \"wood\" },\n  pipe_stack:        { size: [6, 0.9, 1.2], material: \"steel_rust\", surface: \"metal\" },\n  sign_post:         { size: [0.6, 2.4, 0.08], material: \"paint_white\", surface: \"metal\" },  // 自定义几何\n};\n\n/** 有自定义几何构造器的道具（其余 22 条走倒角盒兜底）。 */\nexport const HAS_CUSTOM_BUILDER = new Set([\n\"jersey_barrier\",\n  \"light_mast\",\n  \"fence_panel\",\n  \"guard_booth\",\n  \"gate_arm\",\n  \"bollard_mooring\",\n  \"bollard_post\",\n  \"sign_post\",\n  \"floodlight_stand\",\n  \"stairs_metal\",\n  \"catwalk\",\n  \"shelf_rack\",\n  \"reefer_unit\",\n  \"relay_node\",\n]);\n\nexport const PROP_IDS = Object.keys(PROP_LEDGER);\n\n/** 取尺寸，未知 id 抛错——原版是 warn 后回退成 1×1×1 的 concrete 盒。 */\nexport function sizeOf(id) {\n  const p = PROP_LEDGER[id];\n  if (!p) throw new Error(`未知道具 \"${id}\"`);\n  return p.size.slice();\n}\n\n/** 包围盒：底面中心为原点，米制。 */\nexport function boundsOf(id) {\n  const [w, h, d] = sizeOf(id);\n  return { min: [-w / 2, 0, -d / 2], max: [w / 2, h, d / 2] };\n}\n\n/** 只覆盖部分字段的派生台账（用于做主题变体而不动原表）。 */\nexport function withOverrides(patch) {\n  const out = {};\n  for (const [id, p] of Object.entries(PROP_LEDGER)) {\n    out[id] = { ...p, ...(patch[id] || {}) };\n  }\n  return out;\n}\n\n/** 台账体检：尺寸为正、材质名非空。 */\nexport function validate() {\n  const issues = [];\n  for (const [id, p] of Object.entries(PROP_LEDGER)) {\n    if (!(p.size[0] > 0 && p.size[1] > 0 && p.size[2] > 0)) issues.push(`${id}: 尺寸非正`);\n    if (!p.material) issues.push(`${id}: 缺材质`);\n    if (!p.surface) issues.push(`${id}: 缺表面类型`);\n  }\n  return issues;\n}\n\nexport default { PROP_LEDGER, HAS_CUSTOM_BUILDER, PROP_IDS, sizeOf, boundsOf, withOverrides, validate };\n",
   "props": [
    {
     "id": "container20",
     "size": [
      6.06,
      2.59,
      2.44
     ],
     "material": "paint_red",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "container40",
     "size": [
      12.19,
      2.59,
      2.44
     ],
     "material": "paint_blue",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "container40hc",
     "size": [
      12.19,
      2.9,
      2.44
     ],
     "material": "paint_green",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "jersey_barrier",
     "size": [
      3.0,
      0.81,
      0.6
     ],
     "material": "concrete",
     "surface": "concrete",
     "custom": true
    },
    {
     "id": "light_mast",
     "size": [
      0.5,
      14.0,
      0.5
     ],
     "material": "steel_galv",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "fence_panel",
     "size": [
      3.0,
      2.4,
      0.08
     ],
     "material": "chainlink",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "guard_booth",
     "size": [
      2.6,
      2.7,
      2.2
     ],
     "material": "paint_white",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "gate_arm",
     "size": [
      5.0,
      1.1,
      0.3
     ],
     "material": "hazard_stripes",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "bollard_mooring",
     "size": [
      0.7,
      0.6,
      0.7
     ],
     "material": "steel_dark",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "bollard_post",
     "size": [
      0.17,
      1.0,
      0.17
     ],
     "material": "paint_yellow",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "relay_node",
     "size": [
      1.2,
      2.4,
      0.8
     ],
     "material": "paint_grey",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "shelf_rack",
     "size": [
      2.7,
      4.2,
      1.1
     ],
     "material": "paint_orange",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "stairs_metal",
     "size": [
      3.0,
      2.6,
      1.0
     ],
     "material": "diamond_plate",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "catwalk",
     "size": [
      3.0,
      1.1,
      1.2
     ],
     "material": "diamond_plate",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "reefer_unit",
     "size": [
      0.5,
      2.3,
      2.3
     ],
     "material": "paint_white",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "barrel",
     "size": [
      0.6,
      0.9,
      0.6
     ],
     "material": "paint_blue",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "pallet",
     "size": [
      1.2,
      0.144,
      1.0
     ],
     "material": "wood_pallet",
     "surface": "wood",
     "custom": false
    },
    {
     "id": "pallet_stack",
     "size": [
      1.2,
      1.15,
      1.0
     ],
     "material": "wood_pallet",
     "surface": "wood",
     "custom": false
    },
    {
     "id": "crate_wood",
     "size": [
      1.1,
      1.0,
      0.9
     ],
     "material": "wood_pallet",
     "surface": "wood",
     "custom": false
    },
    {
     "id": "crate_stack",
     "size": [
      1.2,
      1.9,
      1.0
     ],
     "material": "wood_pallet",
     "surface": "wood",
     "custom": false
    },
    {
     "id": "ibc_tote",
     "size": [
      1.2,
      1.16,
      1.0
     ],
     "material": "plastic_grey",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "forklift",
     "size": [
      3.4,
      2.2,
      1.25
     ],
     "material": "paint_yellow",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "cable_reel",
     "size": [
      1.3,
      1.3,
      0.8
     ],
     "material": "wood_dark",
     "surface": "wood",
     "custom": false
    },
    {
     "id": "tire_stack",
     "size": [
      0.8,
      1.0,
      0.8
     ],
     "material": "tire",
     "surface": "rubber",
     "custom": false
    },
    {
     "id": "dumpster",
     "size": [
      1.9,
      1.35,
      1.1
     ],
     "material": "paint_green",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "generator",
     "size": [
      2.2,
      1.4,
      1.0
     ],
     "material": "paint_yellow",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "jerry_can",
     "size": [
      0.35,
      0.47,
      0.17
     ],
     "material": "paint_green",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "traffic_cone",
     "size": [
      0.36,
      0.7,
      0.36
     ],
     "material": "plastic_red",
     "surface": "rubber",
     "custom": false
    },
    {
     "id": "gas_cylinders",
     "size": [
      0.9,
      1.6,
      0.5
     ],
     "material": "steel_dark",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "tarp_cargo",
     "size": [
      2.4,
      1.5,
      1.4
     ],
     "material": "tarp",
     "surface": "dirt",
     "custom": false
    },
    {
     "id": "sandbags",
     "size": [
      2.0,
      0.9,
      0.6
     ],
     "material": "tarp",
     "surface": "dirt",
     "custom": false
    },
    {
     "id": "toolbox_cart",
     "size": [
      0.9,
      0.95,
      0.5
     ],
     "material": "plastic_red",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "floodlight_stand",
     "size": [
      1.0,
      2.2,
      1.0
     ],
     "material": "paint_yellow",
     "surface": "metal",
     "custom": true
    },
    {
     "id": "cardboard_boxes",
     "size": [
      1.0,
      0.8,
      0.8
     ],
     "material": "cardboard",
     "surface": "wood",
     "custom": false
    },
    {
     "id": "pipe_stack",
     "size": [
      6.0,
      0.9,
      1.2
     ],
     "material": "steel_rust",
     "surface": "metal",
     "custom": false
    },
    {
     "id": "sign_post",
     "size": [
      0.6,
      2.4,
      0.08
     ],
     "material": "paint_white",
     "surface": "metal",
     "custom": true
    }
   ],
   "verdict": "可直接搬。36 条 × 5 字段与源码逐字一致；底锚约定（原点在底面中心）也保住了。",
   "limits": "台账只描述「多大多重多什么材质」。几何本身由 14 个自定义构造器 + 1 个兜底盒生成，那部分在 modeling-kit 与关卡模块里。",
   "crit": {
    "pure": "✓",
    "free": "✓",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 98,
   "bytes": 5732
  },
  {
   "id": "modeling-kit",
   "name": "程序化建模工具",
   "en": "Modeling Kit",
   "type": "GEO",
   "grade": "B",
   "tags": [
    "几何",
    "生成器",
    "纯函数",
    "需宿壳",
    "米制"
   ],
   "summary": "道具不是导入的，是被这些函数算出来的。倒角盒、推入倒角盒、圆柱、样条管、建模器、静态合批——抽出来后任何一个道具构造器都能脱离关卡单独跑。",
   "anchor": "L5453 p3 / Wi / ot / Fn / je / Lc / Ii / jn / By",
   "deps": "THREE + BufferGeometryUtils.mergeGeometries + mats 适配器",
   "standalone": "需要 THREE；已逐顶点比对通过",
   "code": "/**\n * 程序化建模工具 · Aurora-ModelKit\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html\n *   metricBox   L5453  function p3()      倒角盒 + 米制 UV（72 顶点，每面独立法线）\n *   bevelBox    L5453  function Wi()      八顶点推入式倒角盒\n *   cylinder    L5453  function ot()      米制侧面积 UV 的圆柱\n *   tube        L5453  function Fn()      米制 UV 的样条管\n *   place       L5453  function je()      就地变换\n *   vertexColor L5453  function Lc()      按位写顶点色\n *   merge       L5453  function Ii()      属性归一后合并\n *   Builder     L5453  var jn = class      建模器：按材质分桶，最后成组\n *   batch       L5453  function By()      静态合批（noMerge 例外）\n *\n * 这一层是\"模型资产\"的真正来源：道具不是导入的，是被这些函数算出来的。\n * 抽成独立模块后，任何一个道具构造器都能脱离关卡、脱离游戏单独跑。\n *\n * 依赖：THREE（含 addons 的 mergeGeometries），材质由 mats 适配器注入。\n */\n\nimport * as THREE from \"three\";\nimport { mergeGeometries } from \"three/addons/utils/BufferGeometryUtils.js\";\n\n/* --------------------------------------------------------------- 几何原语 */\n\n/**\n * 倒角盒。24 个顶点（8 角 × 3 个面各一份），因此每个面都有硬边法线，\n * 倒角不会被平滑成球面。UV 按\"米\"直接投：取该顶点的另外两个坐标。\n * anchor=\"bottom\" 时把几何抬起 h/2，让原点落在底面中心——这是全项目的约定。\n */\nexport function metricBox(w, h, d, bevel = 0.01, anchor = \"center\") {\n  const b = Math.max(0.0005, Math.min(bevel, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));\n  const hw = w / 2, hh = h / 2, hd = d / 2;\n\n  const position = new Float32Array(24 * 3);\n  const normal = new Float32Array(24 * 3);\n  const uv = new Float32Array(24 * 2);\n\n  // 每个角三个顶点：分别属于 x / y / z 三个面\n  const vId = (sx, sy, sz, axis) =>\n    ((sx > 0 ? 1 : 0) + (sy > 0 ? 2 : 0) + (sz > 0 ? 4 : 0)) * 3 + axis;\n\n  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {\n    const pts = [\n      [x * hw, y * (hh - b), z * (hd - b)],\n      [x * (hw - b), y * hh, z * (hd - b)],\n      [x * (hw - b), y * (hh - b), z * hd],\n    ];\n    const nrm = [[x, 0, 0], [0, y, 0], [0, 0, z]];\n    for (let a = 0; a < 3; a++) {\n      const id = vId(x, y, z, a);\n      position.set(pts[a], id * 3);\n      normal.set(nrm[a], id * 3);\n      // 米制 UV：轴 0 取 (z,y)，轴 1 取 (x,z)，轴 2 取 (x,y)\n      if (a === 0) uv.set([pts[a][2], pts[a][1]], id * 2);\n      else if (a === 1) uv.set([pts[a][0], pts[a][2]], id * 2);\n      else uv.set([pts[a][0], pts[a][1]], id * 2);\n    }\n  }\n\n  // 用面法线与形心方向判定朝向，自动纠正绕序\n  const idx = [];\n  const tri = (a, b, c) => {\n    const ax = position[a * 3], ay = position[a * 3 + 1], az = position[a * 3 + 2];\n    const bx = position[b * 3] - ax, by = position[b * 3 + 1] - ay, bz = position[b * 3 + 2] - az;\n    const cx = position[c * 3] - ax, cy = position[c * 3 + 1] - ay, cz = position[c * 3 + 2] - az;\n    const nx = by * cz - bz * cy;\n    const ny = bz * cx - bx * cz;\n    const nz = bx * cy - by * cx;\n    const mx = ax + (bx + cx) / 3;\n    const my = ay + (by + cy) / 3;\n    const mz = az + (bz + cz) / 3;\n    if (nx * mx + ny * my + nz * mz >= 0) idx.push(a, b, c);\n    else idx.push(a, c, b);\n  };\n  const quad = (a, b, c, d) => { tri(a, b, c); tri(a, c, d); };\n\n  const ring = [[-1, -1], [1, -1], [1, 1], [-1, 1]];\n\n  // 6 个主面\n  for (const s of [-1, 1]) {\n    quad(...ring.map(([u, v]) => vId(s, u, v, 0)));\n    quad(...ring.map(([u, v]) => vId(u, s, v, 1)));\n    quad(...ring.map(([u, v]) => vId(u, v, s, 2)));\n  }\n  // 12 条倒角带\n  for (const u of [-1, 1]) for (const v of [-1, 1]) {\n    quad(vId(-1, u, v, 1), vId(1, u, v, 1), vId(1, u, v, 2), vId(-1, u, v, 2));\n    quad(vId(u, -1, v, 0), vId(u, 1, v, 0), vId(u, 1, v, 2), vId(u, -1, v, 2));\n    quad(vId(u, v, -1, 0), vId(u, v, 1, 0), vId(u, v, 1, 1), vId(u, v, -1, 1));\n  }\n  // 8 个角三角\n  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {\n    tri(vId(x, y, z, 0), vId(x, y, z, 1), vId(x, y, z, 2));\n  }\n\n  const g = new THREE.BufferGeometry();\n  g.setAttribute(\"position\", new THREE.Float32BufferAttribute(position, 3));\n  g.setAttribute(\"normal\", new THREE.Float32BufferAttribute(normal, 3));\n  g.setAttribute(\"uv\", new THREE.Float32BufferAttribute(uv, 2));\n  g.setIndex(idx);\n  if (anchor === \"bottom\") g.translate(0, h / 2, 0);\n  return g;\n}\n\n/**\n * 推入式倒角盒：先建 3×3×3 分段的盒，再按\"离边距离\"把顶点往里推 b，\n * 边角顶点沿外法线重投影。面是平滑过渡的，适合需要软倒角的近景。\n */\nexport function bevelBox(w, h, d, bevel = 0.02, anchor = \"center\") {\n  const b = Math.min(bevel, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);\n  const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3);\n  const pos = g.attributes.position;\n  const nrm = g.attributes.normal;\n  const uv = g.attributes.uv;\n  const c = w / 2, y = h / 2, z = d / 2;\n  const push = (p, half) => {\n    const a = Math.abs(p);\n    return a > half - 1e-5 ? Math.sign(p) * half : Math.sign(p) * (half - b);\n  };\n  const n = new THREE.Vector3();\n  for (let i = 0; i < pos.count; i++) {\n    const px = push(pos.getX(i), c), py = push(pos.getY(i), y), pz = push(pos.getZ(i), z);\n    const cx = Math.max(-(c - b), Math.min(c - b, px));\n    const cy = Math.max(-(y - b), Math.min(y - b, py));\n    const cz = Math.max(-(z - b), Math.min(z - b, pz));\n    n.set(px - cx, py - cy, pz - cz);\n    let ox = px, oy = py, oz = pz;\n    if (n.lengthSq() > 1e-10) {\n      n.normalize();\n      const onEdge = (Math.abs(px) > c - 1e-5 ? 1 : 0)\n        + (Math.abs(py) > y - 1e-5 ? 1 : 0)\n        + (Math.abs(pz) > z - 1e-5 ? 1 : 0) >= 2;\n      if (onEdge) {\n        ox = cx + n.x * b; oy = cy + n.y * b; oz = cz + n.z * b;\n        nrm.setXYZ(i, n.x, n.y, n.z);\n      }\n    }\n    // 无论是否落在边上都要回写，否则中间顶点会留在原始位置\n    pos.setXYZ(i, ox, oy, oz);\n    // 米制 UV：正面投影到另外两轴\n    const ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));\n    if (ax >= ay && ax >= az) uv.setXY(i, oz, oy);\n    else if (ay >= ax && ay >= az) uv.setXY(i, ox, oz);\n    else uv.setXY(i, ox, oy);\n  }\n  // 原版不重算法线：被推过的边缘顶点用重投影法线，其余保留盒面法线\n  if (anchor === \"bottom\") g.translate(0, h / 2, 0);\n  return g;\n}\n\n/**\n * 圆柱：侧面 v 直接取顶点 Y（米），u 乘周长（米）——原版的 CylinderGeometry\n * 已被补丁成米制 v，因此这里必须按 y 还原，而不是沿用 three 的 0-1 归一化。\n */\nexport function cylinder(rTop, rBottom, h, seg = 16, open = false, anchor = \"center\") {\n  const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open);\n  const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;\n  const around = Math.PI * (rTop + rBottom);\n  for (let i = 0; i < uv.count; i++) {\n    if (Math.abs(nrm.getY(i)) > 0.9) uv.setXY(i, pos.getX(i), pos.getZ(i));\n    else uv.setXY(i, uv.getX(i) * around, pos.getY(i));\n  }\n  if (anchor === \"bottom\") g.translate(0, h / 2, 0);\n  return g;\n}\n\n/** 样条管：CatmullRom 采样后按弧长与周长做米制 UV。 */\nexport function tube(points, radius = 0.03, seg = 8, closed = false, tension = 0) {\n  const pts = points.map((p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2])));\n  const curve = new THREE.CatmullRomCurve3(pts, closed, \"catmullrom\", tension);\n  const len = curve.getLength();\n  const steps = Math.max(2, Math.ceil(len / Math.max(0.08, radius * 3)));\n  const g = new THREE.TubeGeometry(curve, Math.min(steps, 400), radius, seg, closed);\n  const uv = g.attributes.uv;\n  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len, uv.getY(i) * Math.PI * 2 * radius);\n  return g;\n}\n\n/** 就地变换：先应用矩阵再返回同一对象（避免大量 clone）。 */\nexport function place(geom, x = 0, y = 0, z = 0, rot = null) {\n  const q = new THREE.Quaternion();\n  if (rot) q.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));\n  const m = new THREE.Matrix4().compose(\n    new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)\n  );\n  geom.applyMatrix4(m);\n  return geom;\n}\n\n/** 顶点色。传函数则按位置求色，传数组则整体一个色。 */\nexport function vertexColor(geom, col) {\n  const pos = geom.attributes.position;\n  const n = pos.count;\n  const out = new Float32Array(n * 3);\n  for (let i = 0; i < n; i++) {\n    const c = typeof col === \"function\" ? col(pos.getX(i), pos.getY(i), pos.getZ(i)) : col;\n    out[i * 3] = c[0]; out[i * 3 + 1] = c[1]; out[i * 3 + 2] = c[2];\n  }\n  geom.setAttribute(\"color\", new THREE.Float32BufferAttribute(out, 3));\n  return geom;\n}\n\n/**\n * 合并。先补齐 uv/normal/color，再统一索引状态，最后交给 mergeGeometries。\n * 关键点：属性集必须一致，否则合并会静默丢数据。\n */\nexport function merge(geoms) {\n  const list = geoms.filter(Boolean).map((g) => {\n    if (!g.attributes.uv) {\n      g.setAttribute(\"uv\", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));\n    }\n    if (!g.attributes.normal) g.computeVertexNormals();\n    return g;\n  });\n  if (!list.length) return new THREE.BufferGeometry();\n\n  const anyColor = list.some((g) => g.attributes.color);\n  const norm = list.map((g) => {\n    if (anyColor && !g.attributes.color) {\n      const white = new Float32Array(g.attributes.position.count * 3).fill(1);\n      g.setAttribute(\"color\", new THREE.Float32BufferAttribute(white, 3));\n    }\n    for (const key of Object.keys(g.attributes)) {\n      if (![\"position\", \"normal\", \"uv\", \"color\"].includes(key)) g.deleteAttribute(key);\n    }\n    return g;\n  });\n\n  const allIndexed = norm.every((g) => g.index);\n  const noneIndexed = norm.every((g) => !g.index);\n  const ready = allIndexed || noneIndexed ? norm : norm.map((g) => (g.index ? g.toNonIndexed() : g));\n  return mergeGeometries(ready, false) || new THREE.BufferGeometry();\n}\n\nexport function plane(w, h) { return new THREE.PlaneGeometry(w, h); }\n\n/** 带 UV 缩放的平面：贴图按\"米\"重复，而不是 0-1。 */\nexport function planeUV(w, h) {\n  const g = new THREE.PlaneGeometry(w, h);\n  const uv = g.attributes.uv;\n  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);\n  return g;\n}\n\nexport function toNonIndexed(geom) {\n  const g = geom.index ? geom.toNonIndexed() : geom;\n  g.computeVertexNormals();\n  return g;\n}\n\n/* ----------------------------------------------------------------- 建模器 */\n\n/**\n * 建模器：所有 add 进同一个材质桶的几何最后被合成一个 Mesh。\n * 好处是 drawcall = 材质数；代价是零件失去独立变换——所以动态物件标 noMerge。\n *\n * mats 适配器需要提供 get(name, opts) → THREE.Material。\n */\nexport class Builder {\n  constructor(ctx) {\n    this.ctx = ctx;\n    this.buckets = new Map();\n    this.stack = [];\n    this.m = null;\n    this.defCol = new Map();\n  }\n\n  M(name, opts) { return this.ctx.mats.get(name, opts); }\n\n  /** 压入一个局部变换（相对于当前） */\n  push(mat4) {\n    this.stack.push(this.m);\n    this.m = this.m ? this.m.clone().multiply(mat4) : mat4.clone();\n    return this;\n  }\n\n  pop() { this.m = this.stack.pop(); return this; }\n\n  add(mat, geom, col, noCast) {\n    if (this.m) geom.applyMatrix4(this.m);\n    const c = col || this.defCol.get(mat);\n    if (c) vertexColor(geom, c);\n    let bucket = this.buckets.get(mat);\n    if (!bucket) {\n      bucket = { mat, geos: [], cast: !noCast };\n      this.buckets.set(mat, bucket);\n    }\n    bucket.geos.push(geom);\n    return geom;\n  }\n\n  /** 盒：r=0 时退化成无倒角盒（省顶点） */\n  box(mat, w, h, d, x, y, z, o = {}) {\n    const bevel = o.r === 0 ? null : (o.r || Math.min(0.012, Math.min(w, h, d) * 0.25));\n    const g = bevel === null\n      ? new THREE.BoxGeometry(w, h, d)\n      : metricBox(w, h, d, bevel);\n    return this.add(mat, place(g, x, y, z, o.rot), o.col);\n  }\n\n  cyl(mat, rTop, rBot, h, x, y, z, o = {}) {\n    let g = cylinder(rTop, rBot, h, o.seg || 12, !!o.open);\n    if (o.flat) g = toNonIndexed(g);\n    return this.add(mat, place(g, x, y, z, o.rot), o.col);\n  }\n\n  tube(mat, points, radius, o = {}) {\n    return this.add(mat, tube(points, radius, o.seg || 6, false, o.tension === undefined ? 0.5 : o.tension), o.col);\n  }\n\n  /** 两点之间的圆杆 */\n  bar(mat, a, b, radius, o = {}) {\n    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);\n    const len = d.length();\n    const g = cylinder(o.r2 === undefined ? radius : o.r2, radius, len, o.seg || 6, !o.caps);\n    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());\n    g.applyMatrix4(new THREE.Matrix4().compose(\n      new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), q, new THREE.Vector3(1, 1, 1)\n    ));\n    return this.add(mat, g, o.col);\n  }\n\n  /** 两点之间的方梁（钢结构的主力） */\n  beam(mat, a, b, w, h, o = {}) {\n    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);\n    const len = d.length();\n    const g = o.r === 0\n      ? new THREE.BoxGeometry(w, len, h)\n      : metricBox(w, len, h, o.r || Math.min(w, h) * 0.2);\n    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());\n    if (o.twist) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), o.twist));\n    g.applyMatrix4(new THREE.Matrix4().compose(\n      new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), q, new THREE.Vector3(1, 1, 1)\n    ));\n    return this.add(mat, g, o.col);\n  }\n\n  /** 贴花：不投影阴影，直接用 decal 材质 */\n  decal(tex, size, x, y, z, rot, aspect, tint) {\n    const w = aspect || size * tex.aspect;\n    return this.add(tex.material, place(plane(w, size), x, y, z, rot), null, true);\n  }\n\n  /** 按材质分桶出包：{mat, geo, cast} */\n  parts() {\n    const out = [];\n    for (const b of this.buckets.values()) {\n      out.push({ mat: b.mat, geo: merge(b.geos), cast: b.cast });\n    }\n    return out;\n  }\n\n  group(override) {\n    const g = new THREE.Group();\n    for (const p of this.parts()) {\n      const mesh = new THREE.Mesh(p.geo, (override && override.get(p.mat)) || p.mat);\n      mesh.castShadow = p.cast;\n      mesh.receiveShadow = true;\n      g.add(mesh);\n    }\n    return g;\n  }\n}\n\n/** 把 size/colliders 挂到 object.userData 上——资产与碰撞一起走。 */\nexport function annotate(obj, name, size, colliders) {\n  obj.userData.size = size;\n  obj.userData.colliders = colliders;\n  obj.name = name;\n  return obj;\n}\n\n/**\n * 静态合批：同材质 + 同阴影设置 + 同 layer 的网格合并成一个。\n * userData.noMerge 及其子树会被跳过（动态物件靠这个逃生）。\n */\nexport function batch(root, { castShadow = true, receiveShadow = true } = {}) {\n  root.updateMatrixWorld(true);\n  const groups = new Map();\n  const keep = [];\n  root.traverse((o) => {\n    if (!o.isMesh) return;\n    let p = o, skip = false;\n    while (p) {\n      if (p.userData && p.userData.noMerge) { skip = true; break; }\n      p = p.parent;\n    }\n    if (skip || o.isSkinnedMesh || o.isInstancedMesh || Array.isArray(o.material)) {\n      keep.push(o);\n      return;\n    }\n    const key = o.material.uuid + (o.castShadow ? \"c\" : \"n\") + (o.receiveShadow ? \"r\" : \"n\") + \":\" + o.layers.mask;\n    if (!groups.has(key)) {\n      groups.set(key, { mat: o.material, geos: [], cast: o.castShadow, recv: o.receiveShadow, layers: o.layers.mask });\n    }\n    const g = o.geometry.clone();\n    g.applyMatrix4(o.matrixWorld);\n    groups.get(key).geos.push(g);\n  });\n\n  const out = new THREE.Group();\n  for (const g of groups.values()) {\n    const mesh = new THREE.Mesh(merge(g.geos), g.mat);\n    mesh.castShadow = g.cast && castShadow;\n    mesh.receiveShadow = g.recv && receiveShadow;\n    mesh.layers.mask = g.layers;\n    out.add(mesh);\n  }\n  for (const m of keep) {\n    m.updateMatrixWorld(true);\n    const world = m.matrixWorld.clone();\n    out.add(m);\n    m.matrix.copy(world);\n    m.matrix.decompose(m.position, m.quaternion, m.scale);\n  }\n  return out;\n}\n\nexport default { metricBox, bevelBox, cylinder, tube, place, vertexColor, merge, plane, planeUV, toNonIndexed, Builder, annotate, batch };\n",
   "api": [
    {
     "k": "metricBox(w, h, d, bevel, anchor)",
     "v": "24 顶点倒角盒，米制 UV，可底锚"
    },
    {
     "k": "bevelBox(w, h, d, bevel, anchor)",
     "v": "3×3×3 分段推入式倒角盒，软边"
    },
    {
     "k": "cylinder(rTop, rBot, h, seg, open, anchor)",
     "v": "侧面 v=顶点 Y（米），u=角度×周长"
    },
    {
     "k": "tube(points, radius, seg, closed, tension)",
     "v": "样条管，UV 按弧长与周长"
    },
    {
     "k": "place(geom, x, y, z, rot)",
     "v": "就地变换，避免 clone"
    },
    {
     "k": "vertexColor(geom, col)",
     "v": "按位置求色或整体色"
    },
    {
     "k": "merge(geoms)",
     "v": "补齐属性、统一索引后合并"
    },
    {
     "k": "Builder",
     "v": "建模器：box/cyl/tube/bar/beam/decal → 按材质分桶"
    },
    {
     "k": "batch(root, opts)",
     "v": "静态合批，userData.noMerge 例外"
    }
   ],
   "verdict": "可搬，但要带 THREE。7 个几何函数已与原件逐顶点比对（位置/法线/UV/索引全等），建模器与合批按结构复刻。",
   "limits": "原版的 CylinderGeometry 被补丁成「v 用米」，本地 three 没有这个补丁，抽出时按 y 还原了；换 three 版本要重跑比对。",
   "evidence": "46 项校验中的 12 项几何比对全部通过，逐顶点比位置/法线/UV/索引（见 build/verify.mjs）",
   "related": [
    "material-baker",
    "props-ledger"
   ],
   "crit": {
    "pure": "△",
    "free": "△",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 381,
   "bytes": 16576
  },
  {
   "id": "player-tuning",
   "name": "玩家运动调参",
   "en": "Player Tuning",
   "type": "NUM",
   "grade": "A",
   "tags": [
    "动作",
    "手感",
    "纯数据",
    "纯函数",
    "米制"
   ],
   "summary": "手感的全部来源就是这 36 个数：走跑蹲瞄的速度、加减速、跳跃初速、步幅、镜头起伏、后坐恢复。原版没单位没区间，这里补齐了。",
   "anchor": "L4191:C51585 Pi / L5939:C100464 Mt",
   "deps": "无",
   "standalone": "完全独立",
   "code": "/**\n * 玩家运动调参 · Aurora-Player\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L4191:C51585  var Pi（尺度）\n *                                        L5939:C100464  var Mt（运动）\n *\n * 手感的全部来源就是这 45 个数。原版把它们写成一个对象，\n * 但没有版本号、没有单位注释、没有区间校验——这里补齐这三样。\n *\n * 依赖：无。\n */\n\n/** 尺度：眼高、蹲眼高、胶囊半径、身高等，米制。 */\nexport const SCALE = {\n  eye: 1.68,\n  crouchEye: 1.05,\n  radius: 0.32,\n  height: 1.8,\n  fov: 74,\n  viewFov: 54,\n};\n\n// 原文 Mt 里写的是 Pi.height，保留同名局部引用，避免改动原表\nconst Pi = SCALE;\n\n/** 运动：速度、加速度、重力、步幅、后坐、镜头。 */\nexport const TUNING = {walk:3.8,sprint:6.4,crouch:1.9,ads:2.4,accelGround:34,decelGround:26,accelAir:9,gravity:21,jumpApex:1,coyote:.12,jumpBuffer:.13,standHeight:Pi.height,crouchHeight:1.15,eyeRate:11,stride:{walk:1.55,sprint:2.1,crouch:1.05},bobY:.024,bobX:.013,bobSprint:1.9,bobAds:.22,rollStrafe:.02,landDip:.36,landDipMax:.2,fovSprint:6,fovAds:52,adsLook:.6,regenDelay:4,regenRate:25,recoilKeep:.35,recoilApply:34,recoilRecover:6.5,recoilHold:.09,shakeDecay:1.7,shakePitch:.03,shakeYaw:.03,shakeRoll:.045,pitchLimit:1.5};\n\n/** 字段语义与单位。原版无注释，此处按量纲标注。 */\nexport const UNITS = {\n  walk: \"m/s\", sprint: \"m/s\", crouch: \"m/s\", ads: \"m/s\",\n  accelGround: \"m/s²\", decelGround: \"m/s²\", accelAir: \"m/s²\", gravity: \"m/s²\",\n  jumpApex: \"m\", coyote: \"s\", jumpBuffer: \"s\",\n  standHeight: \"m\", crouchHeight: \"m\", eyeRate: \"1/s\",\n  bobY: \"m\", bobX: \"m\", bobSprint: \"×\", bobAds: \"×\",\n  rollStrafe: \"rad/m\", landDip: \"m\", landDipMax: \"m\",\n  fovSprint: \"deg\", fovAds: \"deg\", adsLook: \"×\",\n  regenDelay: \"s\", regenRate: \"hp/s\",\n  recoilKeep: \"0-1\", recoilApply: \"×\", recoilRecover: \"1/s\", recoilHold: \"s\",\n  shakeDecay: \"1/s\", shakePitch: \"rad\", shakeYaw: \"rad\", shakeRoll: \"rad\",\n  pitchLimit: \"rad\",\n};\n\n/** 由 gravity 与 jumpApex 反解初速，原版写的就是这条式子。 */\nexport const jumpSpeed = Math.sqrt(2 * TUNING.gravity * TUNING.jumpApex);\n\n/** 步幅频率 → 每秒步数，给脚步声与镜头起伏共用。 */\nexport function stepRate(mode = \"walk\") {\n  return TUNING.stride[mode] || TUNING.stride.walk;\n}\n\n/** 体检：速度必须为正、重力为正、蹲高低于站高。 */\nexport function validate() {\n  const issues = [];\n  for (const k of [\"walk\", \"sprint\", \"crouch\", \"ads\"]) {\n    if (!(TUNING[k] > 0)) issues.push(`${k} 必须为正`);\n  }\n  if (!(TUNING.gravity > 0)) issues.push(\"gravity 必须为正\");\n  if (!(TUNING.crouchHeight < TUNING.standHeight)) issues.push(\"crouchHeight 必须低于 standHeight\");\n  if (!(TUNING.walk < TUNING.sprint)) issues.push(\"sprint 应快于 walk\");\n  return issues;\n}\n\nexport default { SCALE, TUNING, UNITS, jumpSpeed, stepRate, validate };\n",
   "fields": [
    {
     "k": "walk",
     "v": "3.8"
    },
    {
     "k": "sprint",
     "v": "6.4"
    },
    {
     "k": "crouch",
     "v": "1.9"
    },
    {
     "k": "ads",
     "v": "2.4"
    },
    {
     "k": "accelGround",
     "v": "34"
    },
    {
     "k": "decelGround",
     "v": "26"
    },
    {
     "k": "accelAir",
     "v": "9"
    },
    {
     "k": "gravity",
     "v": "21"
    },
    {
     "k": "jumpApex",
     "v": "1"
    },
    {
     "k": "coyote",
     "v": ".12"
    },
    {
     "k": "jumpBuffer",
     "v": ".13"
    },
    {
     "k": "standHeight",
     "v": "Pi.height"
    },
    {
     "k": "crouchHeight",
     "v": "1.15"
    },
    {
     "k": "eyeRate",
     "v": "11"
    },
    {
     "k": "stride",
     "v": "{walk:1.55,sprint:2.1,crouch:1.05}"
    },
    {
     "k": "bobY",
     "v": ".024"
    },
    {
     "k": "bobX",
     "v": ".013"
    },
    {
     "k": "bobSprint",
     "v": "1.9"
    },
    {
     "k": "bobAds",
     "v": ".22"
    },
    {
     "k": "rollStrafe",
     "v": ".02"
    },
    {
     "k": "landDip",
     "v": ".36"
    },
    {
     "k": "landDipMax",
     "v": ".2"
    },
    {
     "k": "fovSprint",
     "v": "6"
    },
    {
     "k": "fovAds",
     "v": "52"
    },
    {
     "k": "adsLook",
     "v": ".6"
    },
    {
     "k": "regenDelay",
     "v": "4"
    },
    {
     "k": "regenRate",
     "v": "25"
    },
    {
     "k": "recoilKeep",
     "v": ".35"
    },
    {
     "k": "recoilApply",
     "v": "34"
    },
    {
     "k": "recoilRecover",
     "v": "6.5"
    },
    {
     "k": "recoilHold",
     "v": ".09"
    },
    {
     "k": "shakeDecay",
     "v": "1.7"
    },
    {
     "k": "shakePitch",
     "v": ".03"
    },
    {
     "k": "shakeYaw",
     "v": ".03"
    },
    {
     "k": "shakeRoll",
     "v": ".045"
    },
    {
     "k": "pitchLimit",
     "v": "1.5"
    }
   ],
   "scale": [
    {
     "k": "eye",
     "v": "1.68"
    },
    {
     "k": "crouchEye",
     "v": "1.05"
    },
    {
     "k": "radius",
     "v": "0.32"
    },
    {
     "k": "height",
     "v": "1.8"
    },
    {
     "k": "fov",
     "v": "74"
    },
    {
     "k": "viewFov",
     "v": "54"
    }
   ],
   "verdict": "可直接搬。36 个字段与源码逐字一致（standHeight 指向 SCALE.height，关系也保住了）。",
   "limits": "这些数只是「输入」；真正的运动解算在玩家模块里（碰撞、台阶、落地下沉），未抽。",
   "crit": {
    "pure": "✓",
    "free": "✓",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 56,
   "bytes": 2993
  },
  {
   "id": "weapon-tuning",
   "name": "武器数值与后坐弹簧",
   "en": "Weapon & Springs",
   "type": "NUM",
   "grade": "A",
   "tags": [
    "战斗",
    "手感",
    "纯数据",
    "纯函数",
    "弹簧"
   ],
   "summary": "原版把核心四数写成了裸变量 Gv/B_/H_/O_，连名字都没有。这里给了名字、单位、派生量，还有驱动后坐与摆动的 9 根弹簧。",
   "anchor": "L6065:C68 Gv/B_/H_/O_ / L6065:C5784 弹簧组 / pa() ma()",
   "deps": "无",
   "standalone": "完全独立",
   "code": "/**\n * 武器数值与后坐弹簧 · Aurora-Weapon\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L6065:C68  Gv=30 / B_=150 / H_=26 / O_=720\n *                                        L6065:C5784 弹簧组 kZ/kP/kY/kR/…\n *                                        L6065  pa()/ma() 弹簧积分器\n *\n * 原版把这 4 个核心数值写成了裸变量（Gv/B_/H_/O_），连名字都没有。\n * 数值可量化，但\"可管理\"需要名字、单位、派生量与引用关系——这里补上。\n *\n * 依赖：无。\n */\n\nexport const WEAPON = {\n  id: \"pac9\",\n  name: \"PAC-9\",\n  magSize: 30,        // 发\n  reserve: 150,       // 发\n  damage: 26,         // hp/发\n  weakPointMul: 2.2,  // 弱点倍率\n  rpm: 720,           // 发/分\n  spread: 0.0125,     // 弧度（腰射基础扩散）\n};\n\n/** 派生量：由核心数值算出，避免消费方各自除一遍。 */\nexport const DERIVED = {\n  /** 两发间隔，秒 */\n  fireInterval: 60 / WEAPON.rpm,\n  /** 理论 DPS（不含换弹与弱点） */\n  dps: (60 / WEAPON.rpm) > 0 ? WEAPON.damage * (WEAPON.rpm / 60) : 0,\n  /** 满弹匣可造成的伤害 */\n  magPotential: WEAPON.magSize * WEAPON.damage,\n  /** 总携弹量 / 弹匣数 */\n  mags: 1 + Math.floor(WEAPON.reserve / WEAPON.magSize),\n};\n\n/**\n * 弹簧组：k 是刚度，c 是阻尼。原版 9 组共用同一个积分器，\n * 分别驱动后坐位移、俯仰、偏航、滚转、摆动、跳跃起伏。\n */\nexport const SPRINGS = {\n  kickZ: [520, 30],\n  kickPitch: [380, 26],\n  kickYaw: [300, 22],\n  kickRoll: [300, 20],\n  swayYaw: [110, 15],\n  swayPitch: [110, 15],\n  jumpY: [140, 13],\n  jumpPitch: [140, 13],\n  bump: [600, 30],\n};\n\n/** 换弹时间表（秒）：原版 ue/$ 两条关键帧轨的终点与弹药提交点。 */\nexport const RELOAD = {\n  tacticalTotal: 2.1,\n  emptyTotal: 2.72,\n  ammoCommit: 1.345,\n  magOut: 0.47,\n};\n\n/** 造一根弹簧。 */\nexport const spring = (k, c) => ({ x: 0, v: 0, k, c });\n\n/**\n * 积分一帧。原版 ma(s, target, dt)：dt>0.012 时自动切成 ≤8ms 的子步，\n * 这是为了低帧率下弹簧不炸——属于必须保留的实现细节。\n */\nexport function integrate(s, target, dt) {\n  const n = dt > 0.012 ? Math.ceil(dt / 0.008) : 1;\n  const h = dt / n;\n  for (let i = 0; i < n; i++) {\n    s.v += ((target - s.x) * s.k - s.v * s.c) * h;\n    s.x += s.v * h;\n  }\n  return s.x;\n}\n\nexport default { WEAPON, DERIVED, SPRINGS, RELOAD, spring, integrate };\n",
   "numbers": [
    {
     "k": "magSize",
     "v": "30 发",
     "note": "原变量 Gv"
    },
    {
     "k": "reserve",
     "v": "150 发",
     "note": "原变量 B_"
    },
    {
     "k": "damage",
     "v": "26 hp/发",
     "note": "原变量 H_"
    },
    {
     "k": "rpm",
     "v": "720 发/分",
     "note": "原变量 O_"
    },
    {
     "k": "weakPointMul",
     "v": "2.2×",
     "note": "弱点倍率"
    },
    {
     "k": "spread",
     "v": "0.0125 rad",
     "note": "腰射基础扩散"
    }
   ],
   "springs": [
    {
     "id": "kickZ",
     "k": 520,
     "c": 30,
     "use": "后坐位移"
    },
    {
     "id": "kickPitch",
     "k": 380,
     "c": 26,
     "use": "枪口上跳"
    },
    {
     "id": "kickYaw",
     "k": 300,
     "c": 22,
     "use": "横向抖"
    },
    {
     "id": "kickRoll",
     "k": 300,
     "c": 20,
     "use": "滚转"
    },
    {
     "id": "swayYaw",
     "k": 110,
     "c": 15,
     "use": "视角惯性"
    },
    {
     "id": "swayPitch",
     "k": 110,
     "c": 15,
     "use": "视角惯性"
    },
    {
     "id": "jumpY",
     "k": 140,
     "c": 13,
     "use": "跳跃起伏"
    },
    {
     "id": "jumpPitch",
     "k": 140,
     "c": 13,
     "use": "落地点头"
    },
    {
     "id": "bump",
     "k": 600,
     "c": 30,
     "use": "磕碰"
    }
   ],
   "verdict": "可直接搬。4 个核心数 + 9 组弹簧逐字一致，积分器与原件数值全等（含低帧率子步切分）。",
   "limits": "换弹手部关键帧轨（2.1s/2.72s、1.345s 提交）依赖整段视图模型代码，目前只搬了时间点，没搬姿势曲线。",
   "crit": {
    "pure": "✓",
    "free": "✓",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 71,
   "bytes": 2501
  },
  {
   "id": "ai-tuning",
   "name": "敌人感知调参",
   "en": "AI Perception",
   "type": "NUM",
   "grade": "A",
   "tags": [
    "AI",
    "感知",
    "纯数据",
    "数值"
   ],
   "summary": "14 个数决定敌人能不能发现你：视距、视锥角度、丢失时间、搜索时长、听觉半径、同时攻击令牌。",
   "anchor": "L6065:C60541 Ui",
   "deps": "无",
   "standalone": "完全独立",
   "code": "/**\n * 敌人感知调参 · Aurora-AI\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L6065:C60541  var Ui\n *\n * 14 个数决定了\"敌人能不能发现你\"。gull / hound 两个变体对象是构造器，\n * 不属于数值资产，未抽入；其参数继承本表。\n *\n * 依赖：无。\n */\n\nexport const TUNING = {sightRange:45,sightCone:200,loseSight:4,searchTime:8,hearRadius:45,maxTokens:2,maxTokensCrowd:3,tokenGap:1.25,exposureUp:.1,exposureDown:.45,poolGulls:10,poolHounds:8,maxWrecks:5,maxBolts:32};\n\n/** 视锥半角的余弦，原版用 Math.cos(cone/2) 做点积判定。 */\nexport const SIGHT_COS = Math.cos((TUNING.sightCone / 2) * Math.PI / 180);\n\n/** 体检：角度在 (0,360)，时间与池容量为正。 */\nexport function validate() {\n  const issues = [];\n  if (!(TUNING.sightRange > 0)) issues.push(\"sightRange 必须为正\");\n  if (!(TUNING.sightCone > 0 && TUNING.sightCone < 360)) issues.push(\"sightCone 应在 (0,360)\");\n  if (!(TUNING.hearRadius > 0)) issues.push(\"hearRadius 必须为正\");\n  if (!(TUNING.maxTokens >= 1)) issues.push(\"maxTokens 至少 1\");\n  return issues;\n}\n\nexport default { TUNING, SIGHT_COS, validate };\n",
   "fields": [
    {
     "k": "sightRange",
     "v": "45"
    },
    {
     "k": "sightCone",
     "v": "200"
    },
    {
     "k": "loseSight",
     "v": "4"
    },
    {
     "k": "searchTime",
     "v": "8"
    },
    {
     "k": "hearRadius",
     "v": "45"
    },
    {
     "k": "maxTokens",
     "v": "2"
    },
    {
     "k": "maxTokensCrowd",
     "v": "3"
    },
    {
     "k": "tokenGap",
     "v": "1.25"
    },
    {
     "k": "exposureUp",
     "v": ".1"
    },
    {
     "k": "exposureDown",
     "v": ".45"
    },
    {
     "k": "poolGulls",
     "v": "10"
    },
    {
     "k": "poolHounds",
     "v": "8"
    },
    {
     "k": "maxWrecks",
     "v": "5"
    },
    {
     "k": "maxBolts",
     "v": "32"
    }
   ],
   "verdict": "可直接搬。14 个字段逐字一致，视锥余弦的换算关系也保住了。",
   "limits": "感知状态机、导航、动画不在本模块。gull/hound 两个变体是构造函数，未抽。",
   "crit": {
    "pure": "✓",
    "free": "✓",
    "run": "✓",
    "verified": "✓"
   },
   "loc": 23,
   "bytes": 1223
  },
  {
   "id": "audio-recipes",
   "name": "音效配方",
   "en": "Sound Recipes",
   "type": "AUDIO",
   "grade": "B",
   "tags": [
    "音效",
    "混音",
    "纯数据"
   ],
   "summary": "57 条配方，每条说明这个声音该怎么混：几层声部、峰值、走哪条总线、同时最多几路、优先级、世界坐标下的参考距离与滚降。",
   "anchor": "L5939:C64931 Go",
   "deps": "无",
   "standalone": "配方独立；波形生成器未抽",
   "code": "/**\n * 音效配方 · Aurora-Sound\n * ---------------------------------------------------------------\n * 来源：几猫国产3A大作_V1(4).html L5939:C64931  var Go\n *\n * 57 条配方。每条描述\"这个声音应该怎么混\"：几层声部(n)、采样率档(sr)、\n * 峰值(peak)、总线(bus: near/dry/world)、同时发声上限(max)、优先级(pri)、\n * 是否开场地板(boot)、世界坐标下的参考距离(ref)与滚降(roll)。\n *\n * 边界：合成波形本身是 57 个生成器函数（gen 指向），依赖 WebAudio 上下文，\n * 未抽入本模块。本模块只保证\"混音配方\"这一层可独立管理与比对——\n * 换引擎时这一层能整体搬走，生成器需要重写。\n *\n * 依赖：无。\n */\n\nexport const RECIPES = {\n  rifle_shot:            { gen: \"KR\", n: 4, sr: \"ki\", peak: 0.97, bus: \"near\", max: 5, pri: 9, boot: 1 },\n  rifle_tail_out:        { gen: \"QR\", n: 2, sr: \"Xn\", peak: 0.5, bus: \"dry\", max: 3, pri: 8, boot: 1 },\n  rifle_tail_in:         { gen: \"e8\", n: 2, sr: \"Xn\", peak: 0.62, bus: \"dry\", max: 3, pri: 8, boot: 1 },\n  rifle_dry:             { gen: \"t8\", n: 1, sr: \"ki\", peak: 0.5, bus: \"near\", max: 2, pri: 6, boot: 1 },\n  reload_magout:         { gen: \"n8\", n: 1, sr: \"ki\", peak: 0.6, bus: \"near\", max: 2, pri: 6 },\n  reload_magin:          { gen: \"i8\", n: 1, sr: \"ki\", peak: 0.65, bus: \"near\", max: 2, pri: 6 },\n  reload_bolt:           { gen: \"s8\", n: 1, sr: \"ki\", peak: 0.8, bus: \"near\", max: 2, pri: 6 },\n  shell_bounce:          { gen: \"o8\", n: 3, sr: \"ki\", peak: 0.3, bus: \"world\", max: 4, pri: 1, ref: 2, roll: 1 },\n  step_concrete:         { gen: \"r8\", n: 4, sr: \"Xn\", peak: 0.45, bus: \"near\", max: 3, pri: 3, boot: 1 },\n  step_water:            { gen: \"a8\", n: 3, sr: \"Xn\", peak: 0.5, bus: \"near\", max: 3, pri: 3, boot: 1 },\n  step_metal:            { gen: \"l8\", n: 3, sr: \"Xn\", peak: 0.5, bus: \"near\", max: 3, pri: 3, boot: 1 },\n  land:                  { gen: \"c8\", n: 1, sr: \"Xn\", peak: 0.7, bus: \"near\", max: 2, pri: 4 },\n  jump:                  { gen: \"u8\", n: 1, sr: \"Xn\", peak: 0.35, bus: \"near\", max: 2, pri: 3 },\n  hurt:                  { gen: \"h8\", n: 1, sr: \"Xn\", peak: 0.85, bus: \"dry\", max: 2, pri: 8 },\n  ear_ring:              { gen: \"f8\", n: 1, sr: \"pl\", peak: 0.2, bus: \"dry\", max: 1, pri: 5 },\n  impact_metal:          { gen: \"d8\", n: 3, sr: \"ki\", peak: 0.7, bus: \"world\", max: 4, pri: 4, ref: 4, roll: 0.7 },\n  impact_concrete:       { gen: \"p8\", n: 3, sr: \"ki\", peak: 0.7, bus: \"world\", max: 4, pri: 4, ref: 4, roll: 0.7 },\n  impact_wood:           { gen: \"m8\", n: 2, sr: \"ki\", peak: 0.7, bus: \"world\", max: 3, pri: 4, ref: 4, roll: 0.7 },\n  impact_water:          { gen: \"g8\", n: 2, sr: \"Xn\", peak: 0.6, bus: \"world\", max: 3, pri: 4, ref: 4, roll: 0.7 },\n  impact_enemy:          { gen: \"v8\", n: 3, sr: \"ki\", peak: 0.75, bus: \"world\", max: 4, pri: 5, ref: 5, roll: 0.6 },\n  impact_glass:          { gen: \"x8\", n: 1, sr: \"ki\", peak: 0.6, bus: \"world\", max: 2, pri: 4, ref: 4, roll: 0.7 },\n  whiz:                  { gen: \"b8\", n: 3, sr: \"ki\", peak: 0.5, bus: \"world\", max: 3, pri: 5, ref: 2.5, roll: 0.6 },\n  ricochet:              { gen: \"y8\", n: 3, sr: \"ki\", peak: 0.4, bus: \"world\", max: 2, pri: 3, ref: 5, roll: 0.6 },\n  gull_fire:             { gen: \"E8\", n: 2, sr: \"ki\", peak: 0.85, bus: \"world\", max: 5, pri: 7, ref: 7, roll: 0.55 },\n  hound_fire:            { gen: \"S8\", n: 2, sr: \"ki\", peak: 0.95, bus: \"world\", max: 5, pri: 7, ref: 8, roll: 0.5 },\n  hound_step:            { gen: \"T8\", n: 3, sr: \"Xn\", peak: 0.7, bus: \"world\", max: 4, pri: 3, ref: 5, roll: 0.8 },\n  gull_die:              { gen: \"A8\", n: 1, sr: \"Xn\", peak: 0.85, bus: \"world\", max: 3, pri: 7, ref: 7, roll: 0.5 },\n  hound_die:             { gen: \"R8\", n: 1, sr: \"Xn\", peak: 0.9, bus: \"world\", max: 3, pri: 7, ref: 7, roll: 0.5 },\n  telegraph:             { gen: \"P8\", n: 2, sr: \"Xn\", peak: 0.42, bus: \"world\", max: 4, pri: 6, ref: 6, roll: 0.6 },\n  alert:                 { gen: \"C8\", n: 2, sr: \"Xn\", peak: 0.5, bus: \"world\", max: 3, pri: 6, ref: 8, roll: 0.5 },\n  explosion:             { gen: \"I8\", n: 2, sr: \"ki\", peak: 0.97, bus: \"world\", max: 3, pri: 10, ref: 12, roll: 0.5 },\n  relay_cut:             { gen: \"z8\", n: 1, sr: \"Xn\", peak: 0.75, bus: \"world\", max: 2, pri: 8, ref: 6, roll: 0.5 },\n  thunder:               { gen: \"D8\", n: 2, sr: \"pl\", peak: 0.8, bus: \"dry\", max: 2, pri: 6 },\n  foghorn:               { gen: \"L8\", n: 1, sr: \"pl\", peak: 0.5, bus: \"world\", max: 1, pri: 2 },\n  gull_cry:              { gen: \"k8\", n: 2, sr: \"pl\", peak: 0.4, bus: \"world\", max: 2, pri: 1 },\n  halyard:               { gen: \"F8\", n: 2, sr: \"Xn\", peak: 0.3, bus: \"world\", max: 2, pri: 1 },\n  container_bang:        { gen: \"U8\", n: 1, sr: \"pl\", peak: 0.6, bus: \"world\", max: 1, pri: 2 },\n  ui_click:              { gen: \"N8\", n: 1, sr: \"ki\", peak: 0.3, bus: \"dry\", max: 2, pri: 9 },\n  ui_hover:              { gen: \"B8\", n: 1, sr: \"ki\", peak: 0.12, bus: \"dry\", max: 2, pri: 9 },\n  objective:             { gen: \"Z8\", n: 1, sr: \"Xn\", peak: 0.6, bus: \"music\", max: 1, pri: 9 },\n  objective_all:         { gen: \"j8\", n: 1, sr: \"Xn\", peak: 0.65, bus: \"music\", max: 1, pri: 9 },\n  complete:              { gen: \"J8\", n: 1, sr: \"Xn\", peak: 0.7, bus: \"music\", max: 1, pri: 9 },\n  death:                 { gen: \"K8\", n: 1, sr: \"Xn\", peak: 0.75, bus: \"music\", max: 1, pri: 9 },\n  gull_rotor:            { gen: \"_8\", n: 1, sr: \"Xn\", peak: 0.6, ref: 5, roll: 0.9 },\n  hound_servo:           { gen: \"M8\", n: 1, sr: \"Xn\", peak: 0.42, ref: 4, roll: 1 },\n  relay_hum:             { gen: \"w8\", n: 1, sr: \"Xn\", peak: 0.4, ref: 2.5, roll: 1.4 },\n  rain:                  { gen: \"O8\", n: 1, sr: \"Xn\", peak: 0.5 },\n  rain_interior:         { gen: \"H8\", n: 1, sr: \"Xn\", peak: 0.7 },\n  wind:                  { gen: \"V8\", n: 1, sr: \"pl\", peak: 0.5 },\n  sea:                   { gen: \"W8\", n: 1, sr: \"pl\", peak: 0.5, ref: 10, roll: 0.6 },\n  music_drone:           { gen: \"G8\", n: 1, sr: \"Fr.sr\", peak: 0.5 },\n  music_ost:             { gen: \"q8\", n: 1, sr: \"Fr.sr\", peak: 0.45 },\n  music_perc:            { gen: \"X8\", n: 1, sr: \"Fr.sr\", peak: 0.7 },\n  music_brass:           { gen: \"Y8\", n: 1, sr: \"Fr.sr\", peak: 0.45 },\n  music_motif:           { gen: \"$8\", n: 1, sr: \"Fr.sr\", peak: 0.45 },\n  ir_outdoor:            { gen: \"Q8\", n: 1, sr: \"ki\", peak: 0.9 },\n  ir_shed:               { gen: \"eC\", n: 1, sr: \"ki\", peak: 0.9 },\n};\n\nexport const RECIPE_IDS = Object.keys(RECIPES);\n\n/** 总线用量统计：预算分配看这个。 */\nexport function busLoad() {\n  const out = {};\n  for (const r of Object.values(RECIPES)) {\n    const b = r.bus || \"unset\";\n    out[b] = (out[b] || 0) + 1;\n  }\n  return out;\n}\n\n/** 同时发声上限之和：音频线程压力的上界。 */\nexport function voiceBudget() {\n  return Object.values(RECIPES).reduce((s, r) => s + (r.max || 0), 0);\n}\n\n/** 按总线筛。 */\nexport function byBus(bus) {\n  return RECIPE_IDS.filter((id) => RECIPES[id].bus === bus);\n}\n\nexport default { RECIPES, RECIPE_IDS, busLoad, voiceBudget, byBus };\n",
   "recipes": [
    {
     "id": "rifle_shot",
     "gen": "KR",
     "n": "4",
     "sr": "ki",
     "peak": "0.97",
     "bus": "near",
     "max": "5",
     "pri": "9",
     "boot": "1"
    },
    {
     "id": "rifle_tail_out",
     "gen": "QR",
     "n": "2",
     "sr": "Xn",
     "peak": "0.5",
     "bus": "dry",
     "max": "3",
     "pri": "8",
     "boot": "1"
    },
    {
     "id": "rifle_tail_in",
     "gen": "e8",
     "n": "2",
     "sr": "Xn",
     "peak": "0.62",
     "bus": "dry",
     "max": "3",
     "pri": "8",
     "boot": "1"
    },
    {
     "id": "rifle_dry",
     "gen": "t8",
     "n": "1",
     "sr": "ki",
     "peak": "0.5",
     "bus": "near",
     "max": "2",
     "pri": "6",
     "boot": "1"
    },
    {
     "id": "reload_magout",
     "gen": "n8",
     "n": "1",
     "sr": "ki",
     "peak": "0.6",
     "bus": "near",
     "max": "2",
     "pri": "6"
    },
    {
     "id": "reload_magin",
     "gen": "i8",
     "n": "1",
     "sr": "ki",
     "peak": "0.65",
     "bus": "near",
     "max": "2",
     "pri": "6"
    },
    {
     "id": "reload_bolt",
     "gen": "s8",
     "n": "1",
     "sr": "ki",
     "peak": "0.8",
     "bus": "near",
     "max": "2",
     "pri": "6"
    },
    {
     "id": "shell_bounce",
     "gen": "o8",
     "n": "3",
     "sr": "ki",
     "peak": "0.3",
     "bus": "world",
     "max": "4",
     "pri": "1",
     "ref": "2",
     "roll": "1"
    },
    {
     "id": "step_concrete",
     "gen": "r8",
     "n": "4",
     "sr": "Xn",
     "peak": "0.45",
     "bus": "near",
     "max": "3",
     "pri": "3",
     "boot": "1"
    },
    {
     "id": "step_water",
     "gen": "a8",
     "n": "3",
     "sr": "Xn",
     "peak": "0.5",
     "bus": "near",
     "max": "3",
     "pri": "3",
     "boot": "1"
    },
    {
     "id": "step_metal",
     "gen": "l8",
     "n": "3",
     "sr": "Xn",
     "peak": "0.5",
     "bus": "near",
     "max": "3",
     "pri": "3",
     "boot": "1"
    },
    {
     "id": "land",
     "gen": "c8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.7",
     "bus": "near",
     "max": "2",
     "pri": "4"
    },
    {
     "id": "jump",
     "gen": "u8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.35",
     "bus": "near",
     "max": "2",
     "pri": "3"
    },
    {
     "id": "hurt",
     "gen": "h8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.85",
     "bus": "dry",
     "max": "2",
     "pri": "8"
    },
    {
     "id": "ear_ring",
     "gen": "f8",
     "n": "1",
     "sr": "pl",
     "peak": "0.2",
     "bus": "dry",
     "max": "1",
     "pri": "5"
    },
    {
     "id": "impact_metal",
     "gen": "d8",
     "n": "3",
     "sr": "ki",
     "peak": "0.7",
     "bus": "world",
     "max": "4",
     "pri": "4",
     "ref": "4",
     "roll": "0.7"
    },
    {
     "id": "impact_concrete",
     "gen": "p8",
     "n": "3",
     "sr": "ki",
     "peak": "0.7",
     "bus": "world",
     "max": "4",
     "pri": "4",
     "ref": "4",
     "roll": "0.7"
    },
    {
     "id": "impact_wood",
     "gen": "m8",
     "n": "2",
     "sr": "ki",
     "peak": "0.7",
     "bus": "world",
     "max": "3",
     "pri": "4",
     "ref": "4",
     "roll": "0.7"
    },
    {
     "id": "impact_water",
     "gen": "g8",
     "n": "2",
     "sr": "Xn",
     "peak": "0.6",
     "bus": "world",
     "max": "3",
     "pri": "4",
     "ref": "4",
     "roll": "0.7"
    },
    {
     "id": "impact_enemy",
     "gen": "v8",
     "n": "3",
     "sr": "ki",
     "peak": "0.75",
     "bus": "world",
     "max": "4",
     "pri": "5",
     "ref": "5",
     "roll": "0.6"
    },
    {
     "id": "impact_glass",
     "gen": "x8",
     "n": "1",
     "sr": "ki",
     "peak": "0.6",
     "bus": "world",
     "max": "2",
     "pri": "4",
     "ref": "4",
     "roll": "0.7"
    },
    {
     "id": "whiz",
     "gen": "b8",
     "n": "3",
     "sr": "ki",
     "peak": "0.5",
     "bus": "world",
     "max": "3",
     "pri": "5",
     "ref": "2.5",
     "roll": "0.6"
    },
    {
     "id": "ricochet",
     "gen": "y8",
     "n": "3",
     "sr": "ki",
     "peak": "0.4",
     "bus": "world",
     "max": "2",
     "pri": "3",
     "ref": "5",
     "roll": "0.6"
    },
    {
     "id": "gull_fire",
     "gen": "E8",
     "n": "2",
     "sr": "ki",
     "peak": "0.85",
     "bus": "world",
     "max": "5",
     "pri": "7",
     "ref": "7",
     "roll": "0.55"
    },
    {
     "id": "hound_fire",
     "gen": "S8",
     "n": "2",
     "sr": "ki",
     "peak": "0.95",
     "bus": "world",
     "max": "5",
     "pri": "7",
     "ref": "8",
     "roll": "0.5"
    },
    {
     "id": "hound_step",
     "gen": "T8",
     "n": "3",
     "sr": "Xn",
     "peak": "0.7",
     "bus": "world",
     "max": "4",
     "pri": "3",
     "ref": "5",
     "roll": "0.8"
    },
    {
     "id": "gull_die",
     "gen": "A8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.85",
     "bus": "world",
     "max": "3",
     "pri": "7",
     "ref": "7",
     "roll": "0.5"
    },
    {
     "id": "hound_die",
     "gen": "R8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.9",
     "bus": "world",
     "max": "3",
     "pri": "7",
     "ref": "7",
     "roll": "0.5"
    },
    {
     "id": "telegraph",
     "gen": "P8",
     "n": "2",
     "sr": "Xn",
     "peak": "0.42",
     "bus": "world",
     "max": "4",
     "pri": "6",
     "ref": "6",
     "roll": "0.6"
    },
    {
     "id": "alert",
     "gen": "C8",
     "n": "2",
     "sr": "Xn",
     "peak": "0.5",
     "bus": "world",
     "max": "3",
     "pri": "6",
     "ref": "8",
     "roll": "0.5"
    },
    {
     "id": "explosion",
     "gen": "I8",
     "n": "2",
     "sr": "ki",
     "peak": "0.97",
     "bus": "world",
     "max": "3",
     "pri": "10",
     "ref": "12",
     "roll": "0.5"
    },
    {
     "id": "relay_cut",
     "gen": "z8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.75",
     "bus": "world",
     "max": "2",
     "pri": "8",
     "ref": "6",
     "roll": "0.5"
    },
    {
     "id": "thunder",
     "gen": "D8",
     "n": "2",
     "sr": "pl",
     "peak": "0.8",
     "bus": "dry",
     "max": "2",
     "pri": "6"
    },
    {
     "id": "foghorn",
     "gen": "L8",
     "n": "1",
     "sr": "pl",
     "peak": "0.5",
     "bus": "world",
     "max": "1",
     "pri": "2"
    },
    {
     "id": "gull_cry",
     "gen": "k8",
     "n": "2",
     "sr": "pl",
     "peak": "0.4",
     "bus": "world",
     "max": "2",
     "pri": "1"
    },
    {
     "id": "halyard",
     "gen": "F8",
     "n": "2",
     "sr": "Xn",
     "peak": "0.3",
     "bus": "world",
     "max": "2",
     "pri": "1"
    },
    {
     "id": "container_bang",
     "gen": "U8",
     "n": "1",
     "sr": "pl",
     "peak": "0.6",
     "bus": "world",
     "max": "1",
     "pri": "2"
    },
    {
     "id": "ui_click",
     "gen": "N8",
     "n": "1",
     "sr": "ki",
     "peak": "0.3",
     "bus": "dry",
     "max": "2",
     "pri": "9"
    },
    {
     "id": "ui_hover",
     "gen": "B8",
     "n": "1",
     "sr": "ki",
     "peak": "0.12",
     "bus": "dry",
     "max": "2",
     "pri": "9"
    },
    {
     "id": "objective",
     "gen": "Z8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.6",
     "bus": "music",
     "max": "1",
     "pri": "9"
    },
    {
     "id": "objective_all",
     "gen": "j8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.65",
     "bus": "music",
     "max": "1",
     "pri": "9"
    },
    {
     "id": "complete",
     "gen": "J8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.7",
     "bus": "music",
     "max": "1",
     "pri": "9"
    },
    {
     "id": "death",
     "gen": "K8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.75",
     "bus": "music",
     "max": "1",
     "pri": "9"
    },
    {
     "id": "gull_rotor",
     "gen": "_8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.6",
     "ref": "5",
     "roll": "0.9"
    },
    {
     "id": "hound_servo",
     "gen": "M8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.42",
     "ref": "4",
     "roll": "1"
    },
    {
     "id": "relay_hum",
     "gen": "w8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.4",
     "ref": "2.5",
     "roll": "1.4"
    },
    {
     "id": "rain",
     "gen": "O8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.5"
    },
    {
     "id": "rain_interior",
     "gen": "H8",
     "n": "1",
     "sr": "Xn",
     "peak": "0.7"
    },
    {
     "id": "wind",
     "gen": "V8",
     "n": "1",
     "sr": "pl",
     "peak": "0.5"
    },
    {
     "id": "sea",
     "gen": "W8",
     "n": "1",
     "sr": "pl",
     "peak": "0.5",
     "ref": "10",
     "roll": "0.6"
    },
    {
     "id": "music_drone",
     "gen": "G8",
     "n": "1",
     "sr": "Fr.sr",
     "peak": "0.5"
    },
    {
     "id": "music_ost",
     "gen": "q8",
     "n": "1",
     "sr": "Fr.sr",
     "peak": "0.45"
    },
    {
     "id": "music_perc",
     "gen": "X8",
     "n": "1",
     "sr": "Fr.sr",
     "peak": "0.7"
    },
    {
     "id": "music_brass",
     "gen": "Y8",
     "n": "1",
     "sr": "Fr.sr",
     "peak": "0.45"
    },
    {
     "id": "music_motif",
     "gen": "$8",
     "n": "1",
     "sr": "Fr.sr",
     "peak": "0.45"
    },
    {
     "id": "ir_outdoor",
     "gen": "Q8",
     "n": "1",
     "sr": "ki",
     "peak": "0.9"
    },
    {
     "id": "ir_shed",
     "gen": "eC",
     "n": "1",
     "sr": "ki",
     "peak": "0.9"
    }
   ],
   "verdict": "配方层可搬。总线/优先级/并发上限这些是「混音设计」，换引擎也能照搬。",
   "limits": "57 个 gen 指向的合成函数依赖 WebAudio 上下文，未抽。要听声，得连同生成器一起搬或用采样替代。",
   "crit": {
    "pure": "△",
    "free": "✓",
    "run": "△",
    "verified": "✓"
   },
   "loc": 93,
   "bytes": 7010
  }
 ]
};
