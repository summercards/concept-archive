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
export function patchStandard(THREE, shader, uniforms) {
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
export function createBaker(THREE, renderer, ledger, opts) {
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
