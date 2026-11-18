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

export const WORLD = {
  min: [-40, 0, -30],
  max: [40, 30, 30],
  groundY: 0,
  seaY: -1.6,
  quayX: 30,
};

export const SUN = {
  /** 未归一化方向。实测原版在取用时统一 normalize() */
  dir: [0.916, 0.225, 0.331],
  /** 暖阳 #ffb86b 量级 */
  color: [1, 0.72, 0.42],
  intensity: 9,
};

export const SKY = {
  zenith: [0.055, 0.085, 0.13],
  horizon: [0.95, 0.55, 0.28],
  horizonAway: [0.16, 0.22, 0.3],
  fog: [0.42, 0.47, 0.52],
};

/** 体积/AO/Bloom/调色/自适应曝光。键名与原版一致，分组仅作检索。 */
export const TUNING = {
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
export const TUNING_GROUPS = {
  体积光: ["volSunScale", "volAmbient", "volSigma", "volMaxDist", "volFarHaze", "volInteriorDust"],
  AO: ["aoRadius", "aoIntensity", "aoStrength"],
  Bloom: ["bloom", "bloomMix"],
  镜头脏污: ["dirt", "streak", "streakThreshold", "flare", "key"],
  曝光自适应: ["minExposure", "maxExposure", "adaptTau"],
  调色: ["agxMix", "ca", "vignette", "grain", "sharpen", "lookPower", "lookSat"],
};

/** 阴影：正交框由世界包围盒投到太阳空间后求得，这里给出原版的输入边界。 */
export const SHADOW = {
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
export const LIGHT_POOL = {
  count: 6,
  color: 0xffffff,
  baseIntensity: 0,
  distance: 12,
  decay: 2,
};

/** 色调映射曝光基线：原版是 .6 * exposure * (1 - fade) */
export const EXPOSURE = { base: 0.6 };

/* ------------------------------------------------------------------ 运行时 */

/** 归一化太阳方向（纯函数，不依赖 THREE）。 */
export function sunDir() {
  const [x, y, z] = SUN.dir;
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
}

/**
 * 复刻 Gy()：把世界包围盒投影到太阳空间，得到正交阴影框。
 * 返回 { left, right, top, bottom, near, far, width, height, depth }（米）。
 */
export function shadowFrustum(THREE, { from, to, hintFrom, hintTo } = {}) {
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
export function install(THREE, scene, opts = {}) {
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
export function exposureValue(exposure = 1, fade = 0) {
  return EXPOSURE.base * exposure * (1 - Math.min(1, Math.max(0, fade)));
}

/** 灯池调度器：固定 N 盏灯，按“最近的 N 个需求”点亮。 */
export function createLightPool(THREE, scene, opts = {}) {
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

export default { WORLD, SUN, SKY, TUNING, SHADOW, LIGHT_POOL, EXPOSURE, install, shadowFrustum, sunDir, exposureValue, createLightPool };
