/* 资产预览：区分真实构造、参数图和尺寸占位。
 * 集装箱运行原版 M3/zA 构造链；尚未接入的道具必须明确显示占位状态。
 * 预览能运行不代表视觉还原，几何保真度由独立原版对照验证。
 */
(function () {
  "use strict";

  var T = window.THREE;
  var M = window.ASSET_MODULES;

  /* ------------------------------------------------------------ 贴图烘焙
     material-baker 跑的是原版 mats 模块的 GLSL：27 个族函数在 GPU 上烘出
     albedo / ORM / height，再求法线。这里按分辨率各缓存一个烘焙器。 */
  var BAKERS = {}, BAKE_TEX = 512, BAKER_OFF = false;

  function baker() {
    if (BAKER_OFF) return null;
    var MB = M["material-baker"], ML = M["material-ledger"];
    if (!MB || !ML) return null;
    var g = gl();
    if (!g) return null;
    var key = "t" + BAKE_TEX;
    if (BAKERS[key]) return BAKERS[key];
    try {
      BAKERS[key] = MB.createBaker(T, g, ML, { tex: BAKE_TEX });
      BAKERS[key].bake("concrete");   /* 先烘一张，编译错误当场暴露 */
      return BAKERS[key];
    } catch (e) {
      BAKER_OFF = true;
      if (window.console) console.warn("[preview] 贴图烘焙不可用，退回纯色：", e && e.message);
      return null;
    }
  }

  var C = {
    sun: "#ffb86b", horizon: "#f28c47", ink: "#e7ecf3", ink2: "#a9b6c6", ink3: "#6f7d8e",
    ok: "#6ee7b7", warn: "#fbbf24", bad: "#f87171",
    env: "#ffb86b", mat: "#7fd1a8", model: "#7fb8ff", geo: "#63d9d9", num: "#c9a7ff", audio: "#ff9ecb",
    line: "rgba(255,255,255,.10)"
  };

  /* ------------------------------------------------------------ canvas 工具 */

  function mkCanvas(host, ratio) {
    var c = document.createElement("canvas");
    c.className = "pv-cv";
    c.style.aspectRatio = String(ratio || 1.6);
    host.appendChild(c);
    return c;
  }

  function fit(c) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(160, c.clientWidth || 320);
    var h = Math.max(100, c.clientHeight || Math.round(w / 1.6));
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    var ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h, dpr: dpr };
  }

  function txt(ctx, s, x, y, color, size, align, weight) {
    ctx.font = (weight || 400) + " " + (size || 11) + "px ui-monospace, Menlo, monospace";
    ctx.fillStyle = color || C.ink2;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  }

  function line(ctx, x0, y0, x1, y1, color, w, dash) {
    ctx.save();
    ctx.strokeStyle = color || C.line;
    ctx.lineWidth = w || 1;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  }

  function hexColor(n) {
    return "#" + (n >>> 0).toString(16).padStart(6, "0");
  }

  /* 台账里 color 默认是 16777215（白）——原版靠程序贴图在那层白上再着色。
     标准材质没有那层贴图，直接用白会糊成一片，所以"没写颜色"的实例给一个族基色。
     这不是台账里的数，是预览宿主的兜底，note 里会说清楚。 */
  var FAM_BASE = {
    asphalt: 0x2b303a, concrete: 0xb9bec4, brick: 0x9a5a45, epoxy: 0x8b949c, paint: 0xd5d8dc,
    hull: 0x7d868f, galv: 0xa7b0b7, metal: 0x868d95, brushed: 0xb2b8be, rust: 0x8f4c2f,
    diamond: 0x9aa1a8, corrugated: 0x98a0a8, chainlink: 0x8b9299, hazard: 0xd4a017,
    gunmetal: 0x353b43, anodized: 0x1c2026, polymer: 0x2c3037, carbon: 0x24272c,
    fabric: 0x34383e, armor: 0xc2c7cc, wood: 0x9c7440, plastic: 0xc0392b, tarp: 0x3c4b40,
    cardboard: 0xa8824e, rope: 0x9b8759, tire: 0x1b1e21, glass: 0x9ec6cf, water: 0x2c4b55
  };

  function painted(ML, id, extra) {
    /* 优先走烘焙器：albedo / 法线 / ORM / 湿润脏污全部是原版那一套 */
    var b = baker();
    if (b) {
      try {
        var cached = b.material(id, extra);
        cached.userData.previewShared = true;
        return cached;
      } catch (e) { /* 落到纯色兜底 */ }
    }
    var m = ML.toStandard(T, id, extra);
    var inst = ML.INSTANCES[id];
    if (inst && (!inst.color || inst.color === 16777215)) {
      var base = FAM_BASE[inst.set];
      if (base !== undefined) m.color = new T.Color(base);
    }
    return m;
  }

  /* ------------------------------------------------------------ 3D 宿主 */

  var GL = null, GLC = null, glBroken = false;

  function gl() {
    if (GL || glBroken) return GL;
    try {
      GLC = document.createElement("canvas");
      GL = new T.WebGLRenderer({ canvas: GLC, antialias: true, preserveDrawingBuffer: true, alpha: false });
      GL.outputColorSpace = T.SRGBColorSpace;
      /* 色调映射不挂在渲染器上，和原版一样挪进合成 pass。
         否则场景进缓冲时已经被压过一道，后面的 bloom 就是把压过的结果当 HDR 用。 */
      GL.toneMapping = T.NoToneMapping;
      GL.shadowMap.enabled = true;
      GL.shadowMap.type = T.PCFSoftShadowMap;
    } catch (e) {
      glBroken = true;
      GL = null;
    }
    return GL;
  }

  /* ------------------------------------------------------------ 后期
     原版合成 pass 有 bloom、横向拉丝、镜头脏污、太阳眩光、色散、暗角、AgX 曲线。
     这里只搬最影响观感的三样：亮部提取→多次模糊→加回画面（bloom）、轻微色散、暗角。
     参数是宿主的经验值，不在任何资产里——和原版那套数值没有对应关系。 */

  var PV_VS = [
    "varying vec2 vUv;",
    "void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }"
  ].join("\n");

  var POST = null;
  /* 原版的曝光之后还有一次眼部适应（读 tAdapt 里的亮度再乘），预览没做那一步，
     这里用常数补上。它属于宿主，不在任何资产里。 */
  var HOST_EXPOSURE = 1.55;
  function post() {
    if (POST) return POST;
    var g = gl();
    if (!g) return null;

    var scene = new T.Scene();
    var cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var quad = new T.Mesh(new T.PlaneGeometry(2, 2), null);
    quad.frustumCulled = false;
    scene.add(quad);

    var bright = new T.ShaderMaterial({
      uniforms: {
        tSrc: { value: null }, uExposure: { value: 1 },
        uThreshold: { value: 1.05 }, uKnee: { value: 0.55 }
      },
      vertexShader: PV_VS,
      fragmentShader: [
        "uniform sampler2D tSrc;",
        "uniform float uExposure, uThreshold, uKnee;",
        "varying vec2 vUv;",
        "void main() {",
        "  vec3 c = texture2D(tSrc, vUv).rgb * uExposure;",
        "  float l = max(c.r, max(c.g, c.b));",
        "  float k = smoothstep(uThreshold, uThreshold + uKnee, l);",
        "  gl_FragColor = vec4(c * k, 1.0);",
        "}"
      ].join("\n"),
      depthTest: false, depthWrite: false
    });

    var blur = new T.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uDir: { value: new T.Vector2() } },
      vertexShader: PV_VS,
      fragmentShader: [
        "uniform sampler2D tSrc;",
        "uniform vec2 uDir;",
        "varying vec2 vUv;",
        "void main() {",
        "  vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270;",
        "  c += (texture2D(tSrc, vUv + uDir * 1.3846154).rgb + texture2D(tSrc, vUv - uDir * 1.3846154).rgb) * 0.3162162;",
        "  c += (texture2D(tSrc, vUv + uDir * 3.2307692).rgb + texture2D(tSrc, vUv - uDir * 3.2307692).rgb) * 0.0702703;",
        "  gl_FragColor = vec4(c, 1.0);",
        "}"
      ].join("\n"),
      depthTest: false, depthWrite: false
    });

    var comp = new T.ShaderMaterial({
      uniforms: {
        tScene: { value: null }, tBloom: { value: null },
        uExposure: { value: 1 }, uBloom: { value: 0.55 },
        uCA: { value: 0.0018 }, uVignette: { value: 0.30 }, uSat: { value: 0.97 }
      },
      vertexShader: PV_VS,
      fragmentShader: [
        "uniform sampler2D tScene, tBloom;",
        "uniform float uExposure, uBloom, uCA, uVignette, uSat;",
        "varying vec2 vUv;",
        "vec3 aces(vec3 x) {",
        "  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);",
        "}",
        "void main() {",
        "  vec2 cc = vUv - 0.5;",
        "  float r2 = dot(cc, cc);",
        "  vec2 off = cc * r2 * uCA;",
        "  vec3 col = vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b);",
        "  col *= uExposure;",
        "  col += texture2D(tBloom, vUv).rgb * uBloom;",
        "  col = aces(col);",
        "  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));",
        "  col = mix(vec3(lum), col, uSat);",
        "  col *= 1.0 - uVignette * smoothstep(0.12, 0.95, r2 * 1.35);",
        "  gl_FragColor = vec4(col, 1.0);",
        "  #include <colorspace_fragment>",
        "}"
      ].join("\n"),
      depthTest: false, depthWrite: false
    });

    POST = { scene: scene, cam: cam, quad: quad, bright: bright, blur: blur, comp: comp };
    return POST;
  }

  /** 一个可拖拽旋转的 3D 视口。所有实例共用一个 WebGL 上下文，渲染后贴到各自的 2D canvas。 */
  function View3D(host, opt) {
    opt = opt || {};
    var canvas = mkCanvas(host, opt.ratio || 1.6);
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(opt.fov || 36, 1.6, 0.05, 3000);
    var cam = {
      yaw: opt.yaw === undefined ? 0.7 : opt.yaw,
      pitch: opt.pitch === undefined ? 0.3 : opt.pitch,
      dist: opt.dist || 12,
      target: new T.Vector3().fromArray(opt.target || [0, 1, 0])
    };
    var disposables = [];
    var dirty = true;

    if (opt.fog) scene.fog = opt.fog;

    function place() {
      var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      camera.position.set(
        cam.target.x + Math.sin(cam.yaw) * cp * cam.dist,
        cam.target.y + sp * cam.dist,
        cam.target.z + Math.cos(cam.yaw) * cp * cam.dist
      );
      camera.lookAt(cam.target);
    }

    var exposure = opt.exposure === undefined ? 0.9 : opt.exposure;
    var bloomK = opt.bloom === undefined ? 0.55 : opt.bloom;
    var RT = null;

    function ensureRT(w, h) {
      if (RT && RT.w === w && RT.h === h) return RT;
      if (RT) { RT.color.dispose(); RT.a.dispose(); RT.b.dispose(); }
      var bw = Math.max(24, Math.round(w / 4));
      var bh = Math.max(24, Math.round(h / 4));
      var small = {
        type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter,
        depthBuffer: false, stencilBuffer: false
      };
      RT = {
        w: w, h: h,
        color: new T.WebGLRenderTarget(w, h, {
          type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter,
          depthBuffer: true, stencilBuffer: false, samples: opt.msaa ? 4 : 0
        }),
        a: new T.WebGLRenderTarget(bw, bh, small),
        b: new T.WebGLRenderTarget(bw, bh, small)
      };
      return RT;
    }

    function render() {
      var g = gl();
      if (!g) return;
      var s = fit(canvas);
      var dpr = s.dpr;
      var W = Math.round(s.w * dpr), H = Math.round(s.h * dpr);
      g.setSize(W, H, false);
      g.shadowMap.enabled = opt.shadow !== false;
      camera.aspect = s.w / s.h;
      camera.updateProjectionMatrix();
      place();

      if (typeof opt.beforeRender === "function") opt.beforeRender();

      var P = post();
      if (!P) {
        g.setRenderTarget(null);
        g.render(scene, camera);
        s.ctx.drawImage(GLC, 0, 0, GLC.width, GLC.height, 0, 0, s.w, s.h);
        dirty = false;
        return;
      }

      var rt = ensureRT(W, H);
      var ev = exposure * HOST_EXPOSURE;

      /* 1. 场景画进 HDR 缓冲（线性，不压色调） */
      g.setRenderTarget(rt.color);
      g.render(scene, camera);

      /* 2. 亮部提取到四分之一分辨率 */
      P.quad.material = P.bright;
      P.bright.uniforms.tSrc.value = rt.color.texture;
      P.bright.uniforms.uExposure.value = ev;
      g.setRenderTarget(rt.a);
      g.render(P.scene, P.cam);

      /* 3. 可分离模糊，半径逐级放大（三级就够出光晕） */
      var radii = [1.0, 2.2, 4.4];
      for (var i = 0; i < radii.length; i++) {
        P.quad.material = P.blur;
        P.blur.uniforms.tSrc.value = rt.a.texture;
        P.blur.uniforms.uDir.value.set(radii[i] / rt.a.width, 0);
        g.setRenderTarget(rt.b);
        g.render(P.scene, P.cam);

        P.blur.uniforms.tSrc.value = rt.b.texture;
        P.blur.uniforms.uDir.value.set(0, radii[i] / rt.b.height);
        g.setRenderTarget(rt.a);
        g.render(P.scene, P.cam);
      }

      /* 4. 合成：曝光 → 叠 bloom → ACES → 饱和度 → 暗角 → 出屏 */
      P.quad.material = P.comp;
      P.comp.uniforms.tScene.value = rt.color.texture;
      P.comp.uniforms.tBloom.value = rt.a.texture;
      P.comp.uniforms.uExposure.value = ev;
      P.comp.uniforms.uBloom.value = bloomK;
      g.setRenderTarget(null);
      g.render(P.scene, P.cam);

      s.ctx.drawImage(GLC, 0, 0, GLC.width, GLC.height, 0, 0, s.w, s.h);
      dirty = false;
    }

    function track(o) { disposables.push(o); return o; }

    /* 拖拽旋转 */
    if (opt.orbit !== false) {
      var down = null;
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", function (e) {
        down = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch };
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      });
      canvas.addEventListener("pointermove", function (e) {
        if (!down) return;
        cam.yaw = down.yaw - (e.clientX - down.x) * 0.01;
        cam.pitch = Math.max(-0.2, Math.min(1.35, down.pitch + (e.clientY - down.y) * 0.008));
        render();
      });
      var up = function (e) {
        if (!down) return;
        down = null;
        canvas.style.cursor = "grab";
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      };
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("wheel", function (e) {
        e.preventDefault();
        cam.dist = Math.max((opt.minDist || 1.5), Math.min((opt.maxDist || 400), cam.dist * (1 + Math.sign(e.deltaY) * 0.09)));
        render();
      }, { passive: false });
    }

    return {
      scene: scene, camera: camera, cam: cam, canvas: canvas,
      track: track,
      render: render,
      dirty: function () { return dirty; },
      setExposure: function (x) { exposure = x; },
      setBloom: function (x) { bloomK = x; },
      update: function (fn) { fn(); render(); },
      /* 自动取景：按相机朝向把包围盒投影到"横/竖/深"三个方向再算距离。
         直接用包围球半径会把"宽而扁"的排布推得太远（道具排 42 米、最高才 3 米）。 */
      frame: function (obj, pad) {
        var box = new T.Box3();
        if (obj && obj.isBox3) box.copy(obj);
        else if (obj) box.setFromObject(obj);
        else box.setFromObject(scene);
        if (box.isEmpty()) return;

        var size = box.getSize(new T.Vector3());
        var center = box.getCenter(new T.Vector3());
        cam.target.copy(center);

        var fovRad = (camera.fov * Math.PI) / 180;
        var asp = (canvas.clientWidth || 320) / (canvas.clientHeight || 200);
        var cy = Math.abs(Math.cos(cam.yaw)), sy = Math.abs(Math.sin(cam.yaw));
        var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);

        var hx = (size.x * cy + size.z * sy) * 0.5;
        var deep = (size.x * sy + size.z * cy) * 0.5;
        var hy = (size.y * cp + (size.x * sy + size.z * cy) * sp) * 0.5;

        var dv = hy / Math.tan(fovRad / 2);
        var dh = hx / (Math.tan(fovRad / 2) * asp);
        cam.dist = Math.max(dv, dh) * (pad || 1.06) + deep;
        render();
      },
      dispose: function () {
        if (RT) { RT.color.dispose(); RT.a.dispose(); RT.b.dispose(); RT = null; }
        disposables.forEach(function (d) { if (d && d.dispose) d.dispose(); });
        disposables.length = 0;
        scene.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
              if (m.userData && m.userData.previewShared) return;
              Object.keys(m).forEach(function (k) {
                var v = m[k];
                if (v && v.isTexture) v.dispose();
              });
              m.dispose();
            });
          }
        });
        canvas.remove();
      }
    };
  }

  /* 共用环境探针：冷色穹顶 + 一块暖色主光板 + 一块冷色边光板，烘成 PMREM。
     没有 envMap 时金属只能反射方向光那一个镜面点，所以之前所有金属都发黑。
     这套亮度是宿主给的经验值，不属于任何资产。 */
  var STUDIO_ENV = null;
  function studioEnv() {
    if (STUDIO_ENV) return STUDIO_ENV;
    var g = gl();
    if (!g) return null;

    var s = new T.Scene();
    var domeGeo = new T.SphereGeometry(40, 24, 16);
    var n = domeGeo.attributes.position.count;
    var cols = new Float32Array(n * 3);
    var cTop = new T.Color(0.15, 0.20, 0.29);
    var cBot = new T.Color(0.03, 0.04, 0.055);
    var tmp = new T.Color();
    for (var i = 0; i < n; i++) {
      var t = Math.max(0, Math.min(1, (domeGeo.attributes.position.getY(i) / 40) * 0.5 + 0.5));
      tmp.copy(cBot).lerp(cTop, Math.pow(t, 0.85));
      cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b;
    }
    domeGeo.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
    var domeMat = new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide });
    s.add(new T.Mesh(domeGeo, domeMat));

    var keyGeo = new T.PlaneGeometry(26, 26);
    var keyMat = new T.MeshBasicMaterial({ color: new T.Color(6.5, 5.7, 4.7) });
    var key = new T.Mesh(keyGeo, keyMat);
    key.position.set(22, 26, 16);
    key.lookAt(0, 0, 0);
    s.add(key);

    var rimGeo = new T.PlaneGeometry(40, 16);
    var rimMat = new T.MeshBasicMaterial({ color: new T.Color(0.42, 0.80, 1.65) });
    var rim = new T.Mesh(rimGeo, rimMat);
    rim.position.set(-26, 12, -20);
    rim.lookAt(0, 0, 0);
    s.add(rim);

    var pm = new T.PMREMGenerator(g);
    var rt = pm.fromScene(s, 0.02, 0.1, 200);
    pm.dispose();
    STUDIO_ENV = rt.texture;

    domeGeo.dispose(); domeMat.dispose();
    keyGeo.dispose(); keyMat.dispose();
    rimGeo.dispose(); rimMat.dispose();
    return STUDIO_ENV;
  }

  /* 共用：给场景打一套不抢戏的环境光（预览用的打光，不属于任何资产） */
  function studio(scene) {
    var env = studioEnv();
    if (env) scene.environment = env;
    var hemi = new T.HemisphereLight(0x33455f, 0x0a0e15, 0.45);
    scene.add(hemi);
    var key = new T.DirectionalLight(0xfff0dd, 2.4);
    key.position.set(5, 8, 4);
    scene.add(key);
    var fill = new T.DirectionalLight(0x9dc4ff, 0.22);
    fill.position.set(-4, 9, -3);
    scene.add(fill);
    return { hemi: hemi, key: key, fill: fill };
  }

  function ground(scene, size, color) {
    var g = new T.PlaneGeometry(size, size);
    var m = new T.MeshStandardMaterial({ color: color || 0x1b222c, roughness: 0.96, metalness: 0.02 });
    var mesh = new T.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  /** 一米一格的辅助线：只为让"米制"看得见，不属于任何资产 */
  function metricGrid(scene, span, opacity) {
    var grid = new T.GridHelper(span, span, 0xdfe8f5, 0x9fb0c4);
    grid.material.transparent = true;
    grid.material.opacity = opacity === undefined ? 0.2 : opacity;
    grid.material.depthWrite = false;
    grid.position.y = 0.004;
    scene.add(grid);
    return grid;
  }

  /* ------------------------------------------------------------ 控制条 */

  function controls(host, items) {
    var bar = document.createElement("div");
    bar.className = "pv-ctl";
    items.forEach(function (it) {
      var wrap = document.createElement(it.type === "range" ? "label" : "div");
      wrap.className = "pv-ctl-item";
      if (it.type !== "range") { wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", it.label); }
      var lab = document.createElement("span");
      lab.textContent = it.label;
      wrap.appendChild(lab);

      if (it.type === "range") {
        var inp = document.createElement("input");
        inp.type = "range";
        inp.min = it.min; inp.max = it.max; inp.step = it.step || 1;
        inp.value = it.value;
        var out = document.createElement("b");
        out.textContent = it.fmt ? it.fmt(it.value) : it.value;
        inp.addEventListener("input", function () {
          var v = parseFloat(inp.value);
          out.textContent = it.fmt ? it.fmt(v) : v;
          it.on(v);
        });
        wrap.appendChild(inp);
        wrap.appendChild(out);
      } else {
        it.options.forEach(function (o, i) {
          var b = document.createElement("button");
          b.className = "pv-btn";
          b.textContent = o;
          if (i === (it.value || 0)) b.setAttribute("aria-pressed", "true");
          b.addEventListener("click", function () {
            Array.prototype.forEach.call(wrap.querySelectorAll(".pv-btn"), function (x) { x.removeAttribute("aria-pressed"); });
            b.setAttribute("aria-pressed", "true");
            it.on(i);
          });
          wrap.appendChild(b);
        });
      }
      bar.appendChild(wrap);
    });
    host.appendChild(bar);
    return bar;
  }

  /* ================================================================ 1 · 光影环境 */

  function envPreview(host, mode) {
    var E = M["env-atmosphere"];
    var MK = M["modeling-kit"];
    var PL = M["props-ledger"];
    var ML = M["material-ledger"];

    var v = View3D(host, {
      fov: 40, dist: 30, yaw: 0.82, pitch: 0.30, target: [1, 3.4, -1],
      ratio: 1.6, minDist: 6, maxDist: 90,
      exposure: E.exposureValue(1), msaa: mode === "full", bloom: 0.5,
      beforeRender: syncFog
    });
    var scene = v.scene;

    /* 雾色取 SKY.fog —— 原版用它把地面与天空的接缝糊掉，不然天际线是一条硬边 */
    scene.fog = new T.Fog(
      new T.Color().setRGB(E.SKY.fog[0], E.SKY.fog[1], E.SKY.fog[2], T.SRGBColorSpace),
      320, 1500
    );

    /* 天空穹顶：天顶/地平线/背光侧三个颜色都来自 SKY，逐顶点插值 */
    var skyGeo = new T.SphereGeometry(600, 48, 32);
    var colAttr = new T.Float32BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3);
    skyGeo.setAttribute("color", colAttr);
    var skyMat = new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false });
    var sky = new T.Mesh(skyGeo, skyMat);
    scene.add(sky);
    v.track(skyGeo);

    var cZen = new T.Color().setRGB(E.SKY.zenith[0], E.SKY.zenith[1], E.SKY.zenith[2], T.SRGBColorSpace);
    var cHor = new T.Color().setRGB(E.SKY.horizon[0], E.SKY.horizon[1], E.SKY.horizon[2], T.SRGBColorSpace);
    var cAway = new T.Color().setRGB(E.SKY.horizonAway[0], E.SKY.horizonAway[1], E.SKY.horizonAway[2], T.SRGBColorSpace);
    var cSun = new T.Color().setRGB(E.SUN.color[0], E.SUN.color[1], E.SUN.color[2], T.SRGBColorSpace);

    /* 雾色跟着天空在地平线的颜色走：取相机方位那一侧的天空色，
       否则远处地面会被染成一片和橙色天空对不上的灰。 */
    var fogCol = new T.Color(), camDir = new T.Vector3(), sdNow = new T.Vector3();
    function syncFog() {
      if (!scene.fog) return;
      v.camera.getWorldDirection(camDir);
      sdNow.fromArray(E.sunDir());
      var side = 0.5 + 0.5 * (camDir.x * sdNow.x + camDir.z * sdNow.z);
      fogCol.copy(cHor).lerp(cAway, Math.max(0, 1 - side) * 0.55);
      scene.fog.color.copy(fogCol);
    }

    /* 太阳圆盘给到 HDR 亮度（>1），这样亮部提取才抓得到它，bloom 才有光晕。
       太阳本来就该比天空亮一个数量级，之前的 1.0 是被 clamp 死的白斑。 */
    var sunDisc = new T.Mesh(
      new T.CircleGeometry(1, 32),
      new T.MeshBasicMaterial({ color: new T.Color(5.2, 4.7, 4.0), transparent: true, opacity: 0.95, fog: false, depthWrite: false })
    );
    scene.add(sunDisc);
    v.track(sunDisc.geometry);
    v.track(sunDisc.material);

    var haloGeo = new T.PlaneGeometry(1, 1);
    var haloCan = document.createElement("canvas");
    haloCan.width = haloCan.height = 128;
    var hc = haloCan.getContext("2d");
    var grd = hc.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,236,205,.95)");
    grd.addColorStop(0.22, "rgba(255,190,120,.45)");
    grd.addColorStop(0.55, "rgba(255,150,80,.12)");
    grd.addColorStop(1, "rgba(255,140,70,0)");
    hc.fillStyle = grd;
    hc.fillRect(0, 0, 128, 128);
    var haloTex = new T.CanvasTexture(haloCan);
    haloTex.colorSpace = T.SRGBColorSpace;
    var halo = new T.Mesh(haloGeo, new T.MeshBasicMaterial({
      map: haloTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false
    }));
    scene.add(halo);
    v.track(haloGeo); v.track(halo.material); v.track(haloTex);

    /* 光照：直接调资产自己的 install()，阴影框也走它的 shadowFrustum() */
    var installed = E.install(T, scene, { shadowMapSize: mode === "full" ? 2048 : 1024 });
    var sun = installed.sun;

    /* 天空烘成环境探针。原版走的就是 PMREM，预览之前用一盏半球光顶替，
       现在补上真的一步：把天空穹顶单独放进临时场景烘一遍，再挂回 scene.environment。 */
    var envPM = null, envRT = null;
    var bakeEnv = function () {
      var g = gl();
      if (!g) return;
      if (!envPM) envPM = new T.PMREMGenerator(g);
      var tmp = new T.Scene();
      scene.remove(sky);
      tmp.add(sky);
      if (envRT) envRT.dispose();
      envRT = envPM.fromScene(tmp, 0.035, 1, 1200);
      tmp.remove(sky);
      scene.add(sky);
      scene.environment = envRT.texture;
    };
    v.track({ dispose: function () { if (envRT) envRT.dispose(); if (envPM) envPM.dispose(); } });

    /* 地面材质 + 道具，来自另外两份资产 */
    var groundMat = painted(ML, "asphalt");
    groundMat.color.setRGB(1.45, 1.45, 1.45);
    groundMat.roughness = 0.94;
    groundMat.metalness = 0.0;
    /* 掠射角上环境探针会给地面镀一层亮边，压一下强度 */
    groundMat.envMapIntensity = 0.55;
    var gGeo = new T.PlaneGeometry(1400, 1400);
    var gMesh = new T.Mesh(gGeo, groundMat);
    gMesh.rotation.x = -Math.PI / 2;
    gMesh.receiveShadow = true;
    scene.add(gMesh);
    v.track(gGeo);

    /* 一米一格的辅助线：不是资产里的东西，只为让"米制"这件事看得见。
       压到很低的透明度——它是刻度，不该比地面本身更抢眼。 */
    var grid = new T.GridHelper(100, 100, 0x9fb0c4, 0x5e6b7a);
    grid.material.transparent = true;
    grid.material.opacity = 0.115;
    grid.material.depthWrite = false;
    grid.position.y = 0.012;
    scene.add(grid);
    v.track(grid.geometry);
    v.track(grid.material);

    /* 光影测试摆场：集装箱用原版构造，其余道具仅作尺寸占位。 */
    var arrangement = [
      ["container40hc", 1.5, 0, -7.5, 0.06],
      ["container20", 10.5, 0, -7.0, -0.04],
      ["forklift", -3.2, 0, 1.4, 0.5],
      ["crate_wood", 3.4, 0, 1.1, 0.2],
      ["crate_stack", 4.9, 0, 2.0, -0.15],
      ["pallet", 1.2, 0, 3.1, 0.1],
      ["barrel", 2.4, 0, 3.4, 0],
      ["dumpster", 7.6, 0, 1.6, -0.3],
      ["tire_stack", 6.4, 0, 3.2, 0],
      ["jerry_can", 0.4, 0, 3.5, 0.4]
    ];
    var props = [];
    arrangement.forEach(function (row) {
      var p = PL.PROP_LEDGER[row[0]];
      if (!p) return;
      var mesh = previewPropObject(row[0]);
      mesh.position.set(row[1], row[2], row[3]);
      mesh.rotation.y = row[4];
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      props.push(mesh);
    });

    /* 太阳角度 → 同时改 SUN.dir、灯位、天空着色 */
    var paintSky = function () {
      var d = E.sunDir();
      var sd = new T.Vector3().fromArray(d);
      var pos = skyGeo.attributes.position;
      var col = skyGeo.attributes.color;
      var c = new T.Color();
      for (var i = 0; i < pos.count; i++) {
        var dx = pos.getX(i), dy = pos.getY(i), dz = pos.getZ(i);
        var len = Math.hypot(dx, dy, dz) || 1;
        dx /= len; dy /= len; dz /= len;
        var up = Math.pow(Math.max(0, Math.min(1, dy * 1.12 + 0.08)), 0.55);
        c.copy(cHor).lerp(cZen, up);
        var side = 0.5 + 0.5 * (dx * sd.x + dz * sd.z);
        c.lerp(cAway, Math.max(0, 1 - side) * 0.55);
        var s = Math.max(0, dx * sd.x + dy * sd.y + dz * sd.z);
        c.lerp(cSun, Math.pow(s, 10) * 0.5);
        col.setXYZ(i, c.r, c.g, c.b);
      }
      col.needsUpdate = true;

      sun.position.copy(sun.target.position).addScaledVector(sd, 200);
      sunDisc.position.copy(sd).multiplyScalar(520);
      sunDisc.quaternion.copy(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), sd));
      sunDisc.scale.setScalar(16);
      halo.position.copy(sd).multiplyScalar(515);
      halo.quaternion.copy(sunDisc.quaternion);
      halo.scale.setScalar(230);
    };
    paintSky();
    bakeEnv();

    var setSun = function (deg) {
      var rad = deg * Math.PI / 180;
      var y = Math.sin(rad);
      var r = Math.cos(rad);
      /* 保持方位角不变，只改高度 —— 相当于拖动时间 */
      var base = 0.34;
      E.SUN.dir[0] = r * Math.cos(base);
      E.SUN.dir[1] = y;
      E.SUN.dir[2] = r * Math.sin(base);
      paintSky();
      bakeEnv();
      v.render();
    };

    /* 取景：只看道具那一块，天空自然留在背后 */
    var fbox = new T.Box3();
    props.forEach(function (m) { fbox.expandByObject(m); });
    fbox.expandByVector(new T.Vector3(3, 2, 3));
    fbox.min.y = Math.min(0, fbox.min.y);
    v.cam.yaw = 0.86;
    v.cam.pitch = 0.17;
    v.frame(fbox, 1.05);

    if (mode === "full") {
      var expo = 1;
      controls(host, [
        {
          label: "太阳高度", type: "range", min: -4, max: 46, step: 1, value: 13,
          fmt: function (x) { return x + "°"; },
          on: function (x) { setSun(x); }
        },
        {
          label: "曝光", type: "range", min: 0.4, max: 2.4, step: 0.05, value: 1,
          fmt: function (x) { return E.exposureValue(x).toFixed(2); },
          on: function (x) {
            expo = x;
            v.setExposure(E.exposureValue(x));
            v.render();
          }
        }
      ]);
      setSun(13);
    }

    return {
      v: v,
      note: "天空三色 + 太阳方向/强度/阴影框全部来自 env-atmosphere，天空还按原版的做法烘成了 PMREM 环境探针；地面材质取自 material-ledger，箱子由 modeling-kit 的 metricBox 按 props-ledger 的真实尺寸生成。bloom、雾距、曝光补偿是宿主的近似值。",
      resize: function () { v.render(); }
    };
  }

  /* ================================================================ 2 · 画质预设 */

  function qualityPreview(host, mode, opt) {
    var Q = M["quality-presets"];
    var canvas = mkCanvas(host, 1.75);
    var names = Q.ORDER;
    var fields = Object.keys(Q.FIELDS);
    var picked = (opt && opt.picked >= 0) ? opt.picked : 3;

    function draw() {
      var s = fit(canvas), ctx = s.ctx, w = s.w, h = s.h;
      var compact = mode === "thumb";
      var padL = compact ? 12 : Math.min(96, w * 0.26), padR = 8;
      var padT = compact ? 19 : 24, padB = compact ? 8 : 12;
      var cw = (w - padL - padR) / names.length;
      var rh = (h - padT - padB) / fields.length;

      /* 列头 */
      names.forEach(function (n, i) {
        var x = padL + cw * i;
        var on = i === picked;
        if (on) {
          ctx.fillStyle = "rgba(255,184,107,.09)";
          ctx.fillRect(x + 1, padT - 16, cw - 2, h - padT - padB + 12);
        }
        txt(ctx, n, x + cw / 2, padT - 8, on ? C.sun : C.ink3, compact ? 8 : 10, "center", on ? 700 : 400);
      });

      fields.forEach(function (f, r) {
        var y = padT + rh * r;
        var F = Q.FIELDS[f];
        if (!compact) txt(ctx, F.label, 4, y + rh / 2, C.ink2, 10);
        if (r) line(ctx, compact ? 0 : 0, y, w, y, "rgba(255,255,255,.045)");

        names.forEach(function (n, i) {
          var p = Q.PRESETS[n];
          var val = p[f];
          var x = padL + cw * i + (compact ? 2 : 5);
          var bw = cw - (compact ? 4 : 10);
          var cy = y + rh / 2;

          if (typeof val === "boolean") {
            ctx.fillStyle = val ? C.ok : "rgba(255,255,255,.13)";
            ctx.beginPath();
            ctx.arc(x + bw / 2, cy, compact ? 2.4 : 3.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            var rg = F.range || [0, val || 1];
            var t = (val - rg[0]) / Math.max(1e-6, rg[1] - rg[0]);
            ctx.fillStyle = "rgba(255,255,255,.07)";
            ctx.fillRect(x, cy - 2, bw, compact ? 4 : 5);
            ctx.fillStyle = i === picked ? C.sun : "rgba(255,184,107,.42)";
            ctx.fillRect(x, cy - 2, Math.max(2, bw * t), compact ? 4 : 5);
            if (!compact) txt(ctx, String(val), x + bw, cy - 7, i === picked ? C.ink : C.ink3, 8.5, "right");
          }
        });
      });

      var auto = Q.autoSelect("high");
      if (!compact) {
        txt(ctx, "autoSelect(\"high\") → " + auto.name.toUpperCase() + " · scale " + auto.scale + " · shadow " + auto.shadow,
          w - padR, h - 4, C.ink3, 9, "right");
      } else {
        txt(ctx, auto.name.toUpperCase(), w - padR, h - 4, C.sun, 8, "right");
      }
    }

    draw();

    if (mode === "full") {
      controls(host, [{
        label: "高亮档位", type: "buttons", options: names, value: picked,
        on: function (i) { picked = i; draw(); }
      }]);
    }
    return { note: "11 字段 × 5 档全部按原表绘制；右下角那行是资产里的 autoSelect() 现场跑出来的。", resize: draw };
  }

  /* ================================================================ 3 · 材质账簿 */

  function materialPreview(host, mode) {
    var ML = M["material-ledger"];
    var ids = ML.INSTANCE_IDS.slice(0, 48);
    var v = View3D(host, { fov: 30, dist: 13.5, yaw: 0.0, pitch: 0.62, target: [0, 0.5, 0.6], ratio: 1.6, minDist: 5, maxDist: 40, msaa: mode === "full", bloom: 0.62 });
    studio(v.scene);
    ground(v.scene, 420, 0x0d1218);

    var geo = new T.SphereGeometry(0.42, 32, 20);
    /* 球面 UV 是 0..1，台账要求米制 UV：按真实周长/半周长铺开 */
    var uv = geo.attributes.uv;
    for (var ui = 0; ui < uv.count; ui++) {
      uv.setXY(ui, uv.getX(ui) * (2 * Math.PI * 0.42), uv.getY(ui) * (Math.PI * 0.42));
    }
    uv.needsUpdate = true;
    v.track(geo);

    var mode2 = 0; /* 0 按实例色 / 1 按族色 */
    var meshes = [];

    function build() {
      meshes.forEach(function (m) { v.scene.remove(m); });
      meshes = [];
      ids.forEach(function (id, i) {
        var inst = ML.INSTANCES[id];
        var mat = painted(ML, id);
        if (mode2 === 1) {
          var fam = inst.set;
          var hue = 0;
          for (var k = 0; k < fam.length; k++) hue = (hue * 31 + fam.charCodeAt(k)) % 360;
          var plain = new T.Color().setHSL(hue / 360, 0.42, 0.55, T.SRGBColorSpace);
          mat = painted(ML, id, { color: plain.getHex() });
        }
        var row = Math.floor(i / 8), col = i % 8;
        var mesh = new T.Mesh(geo, mat);
        mesh.position.set((col - 3.5) * 1.18, 0.45, (row - 2.5) * 1.18);
        v.scene.add(mesh);
        meshes.push(mesh);
      });
      var box = new T.Box3();
      meshes.forEach(function (m) { box.expandByObject(m); });
      v.cam.pitch = 0.66;
      v.cam.yaw = 0.0;
      v.frame(box, 1.14);
    }
    build();

    if (mode === "full") {
      controls(host, [{
        label: "着色依据", type: "buttons", options: ["实例色", "族色"], value: 0,
        on: function (i) { mode2 = i; build(); }
      }]);
    }
    return {
      note: "48 个实例逐个走 material-baker：每族先用 GLSL 烘 albedo / ORM / height，再由 height 求法线，最后把湿润与脏污补丁注入标准材质。球面 UV 已按 0.42m 半径换算成米制，所以纹理尺度是物理的。",
      resize: function () { v.render(); }
    };
  }

  /* ================================================================ 4 · 道具台账 */

  function propsPreview(host, mode) {
    var PL = M["props-ledger"];
    var MK = M["modeling-kit"];
    var ML = M["material-ledger"];

    var v = View3D(host, { fov: 34, dist: 52, yaw: 0.42, pitch: 0.52, target: [0, 1.6, 0], ratio: 1.6, minDist: 8, maxDist: 160, msaa: mode === "full" });
    studio(v.scene);
    var gm = ground(v.scene, 1100, 0x161d26);
    gm.material = painted(ML, "concrete_dirty");
    gm.material.roughness = 1;
    gm.material.envMapIntensity = 0.0;
    var guv = gm.geometry.attributes.uv;
    for (var gi = 0; gi < guv.count; gi++) guv.setXY(gi, guv.getX(gi) * 1100, guv.getY(gi) * 1100);
    guv.needsUpdate = true;
    var gr = metricGrid(v.scene, 48, 0.11);
    v.track(gr.geometry); v.track(gr.material);

    var ids = PL.PROP_IDS.slice();
    var order = 0;
    var group = new T.Group();
    v.scene.add(group);

    function layout() {
      while (group.children.length) {
        var c = group.children[0];
        group.remove(c);
        c.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material && !(o.material.userData && o.material.userData.previewShared)) o.material.dispose();
        });
      }
      var list = ids.map(function (id) { return { id: id, p: PL.PROP_LEDGER[id] }; });
      if (order === 1) list.sort(function (a, b) { return b.p.size[0] - a.p.size[0]; });
      if (order === 2) list.sort(function (a, b) { return b.p.size[1] - a.p.size[1]; });

      var maxW = 26, gap = 1.5, x = 0, z = 0, rowDepth = 0, maxRight = 0;
      list.forEach(function (it) {
        var s = it.p.size;
        if (x + s[0] > maxW && x > 0) { z += rowDepth + gap; x = 0; rowDepth = 0; }
        var mesh = previewPropObject(it.id);
        mesh.position.set(x + s[0] / 2, 0, z + s[2] / 2);
        mesh.rotation.y = ((x * 7 + z * 13) % 5) * 0.05;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        x += s[0] + gap;
        maxRight = Math.max(maxRight, x);
        rowDepth = Math.max(rowDepth, s[2]);
      });

      /* 1.8 米人形参照，直接摆在最前排 */
      var humanMat = new T.MeshStandardMaterial({ color: 0x5d6b7a, roughness: 0.9 });
      var hGeo = MK.metricBox(0.46, 1.8, 0.26, 0.04, "bottom");
      var human = new T.Mesh(hGeo, humanMat);
      human.position.set(-2.4, 0, -2.6);
      human.castShadow = true;
      group.add(human);

      v.cam.yaw = 0.42;
      v.cam.pitch = 0.5;
      /* 只按"铺开的那一片"取景：14 米的灯杆若算进去，整排道具会缩成一条 */
      v.frame(new T.Box3(
        new T.Vector3(-2.8, 0, -2.8),
        new T.Vector3(maxRight, 2.6, z + rowDepth + 1)
      ), 1.02);
    }
    layout();

    if (mode === "full") {
      controls(host, [{
        label: "排列", type: "buttons", options: ["台账顺序", "最宽在前", "最高在前"], value: 0,
        on: function (i) { order = i; layout(); }
      }]);
    }

    return {
      note: "36 条道具按台账里的真实米数摆开，没有做等比缩放——所以 40 尺箱是托盘的四倍长，而左下那个 1.8 米的人形参照是照 standHeight 立的。",
      resize: function () { v.render(); }
    };
  }

  /* ================================================================ 5 · 建模工具 */

  function kitPreview(host, mode) {
    var MK = M["modeling-kit"];
    var ML = M["material-ledger"];
    var v = View3D(host, { fov: 34, dist: 21, yaw: 0.55, pitch: 0.34, target: [0, 1.5, 0], ratio: 1.6, minDist: 6, maxDist: 70, msaa: mode === "full", bloom: 0.38 });
    studio(v.scene);
    ground(v.scene, 620, 0x141b24);
    var kgr = metricGrid(v.scene, 40, 0.14);
    v.track(kgr.geometry); v.track(kgr.material);

    /* 材质全部换成台账里的真实实例，不再用随手调的纯色 */
    var matA = painted(ML, "galv");
    var matB = painted(ML, "paint_orange");
    var matC = painted(ML, "anodized_black");

    var g1 = MK.metricBox(1.3, 1.5, 1.3, 0.02, "bottom");     /* 硬边倒角盒 */
    var g2 = MK.bevelBox(1.3, 1.5, 1.3, 0.24, "bottom");      /* 推入式大倒角 */
    var g3 = MK.cylinder(0.28, 0.62, 1.7, 24, false, "bottom");
    var g4 = MK.tube([[0, 0.1, 0], [0.55, 0.9, 0.2], [1.3, 0.5, -0.15], [1.85, 1.35, 0.1]], 0.075, 12, false, 0.5);
    var g5 = MK.planeUV(1.8, 1.8);
    var bc = document.createElement("canvas");
    bc.width = bc.height = 64;
    var bx = bc.getContext("2d");
    bx.fillStyle = "#2b3644"; bx.fillRect(0, 0, 64, 64);
    bx.fillStyle = "#3d4c5e"; bx.fillRect(0, 0, 32, 32); bx.fillRect(32, 32, 32, 32);
    var bTex = new T.CanvasTexture(bc);
    bTex.wrapS = bTex.wrapT = T.RepeatWrapping;
    bTex.colorSpace = T.SRGBColorSpace;
    bTex.anisotropy = 4;
    var g5mat = new T.MeshStandardMaterial({ map: bTex, roughness: 0.8 });

    var stage = new T.Group();
    v.scene.add(stage);

    var items = [
      { g: g1, m: matA, x: -8.4, label: "metricBox" },
      { g: g2, m: matA, x: -5.6, label: "bevelBox" },
      { g: g3, m: matC, x: -2.8, label: "cylinder" },
      { g: g4, m: matB, x: 0.2, label: "tube" },
      { g: g5, m: g5mat, x: 3.2, label: "planeUV" }
    ];
    items.forEach(function (it) {
      var mesh = new T.Mesh(it.g, it.m);
      mesh.position.x = it.x;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (it.label === "planeUV") { mesh.rotation.x = -Math.PI / 2; mesh.position.y = 0.01; }
      stage.add(mesh);
      v.track(it.g);
    });

    /* Builder + batch：三个盒子按材质分桶，最后合成 2 个 drawcall */
    var ctxMats = {
      mats: {
        get: function (name, opts) {
          if (name === "steel") return painted(ML, "steel_dark");
          return painted(ML, name === "accent" ? "paint_yellow" : "paint_blue");
        }
      }
    };
    var b = new MK.Builder(ctxMats);
    b.box("steel", 2.2, 0.12, 1.1, 0, 0.86, 0);
    b.box("steel", 0.1, 0.86, 1.1, -1.05, 0.43, 0);
    b.box("steel", 0.1, 0.86, 1.1, 1.05, 0.43, 0);
    b.box("accent", 2.2, 0.06, 0.14, 0, 0.3, 0.44);
    /* Builder 分桶时存的是材质名，group() 必须收一个 name → material 的解析器 */
    var built = b.group({
      get: function (name) { return name === "accent" ? matB : matA; }
    });
    if (built) {
      built.position.x = 7.4;
      stage.add(built);
      built.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.geometry && v.track(o.geometry); } });
    }

    var wire = false;
    v.cam.yaw = 0.5;
    v.cam.pitch = 0.3;
    v.frame(stage, 1.06);

    if (mode === "full") {
      controls(host, [{
        label: "线框", type: "buttons", options: ["关", "开"], value: 0,
        on: function (i) {
          wire = i === 1;
          v.scene.traverse(function (o) {
            if (o.isMesh && o.material && "wireframe" in o.material) o.material.wireframe = wire;
          });
          v.render();
        }
      }]);
    }

    return {
      note: "五件都是资产里那几个函数现场算的：metricBox 硬边、bevelBox 24 段推入倒角、cylinder 侧面 UV 按米、tube 沿样条、planeUV 一格一米。右边那张桌子是 Builder 分桶后又 batch() 合批的结果。",
      resize: function () { v.render(); }
    };
  }

  /* ================================================================ 6 · 玩家调参 */

  function playerPreview(host, mode) {
    var P = M["player-tuning"];
    var canvas = mkCanvas(host, 1.6);

    function draw() {
      var s = fit(canvas), ctx = s.ctx, w = s.w, h = s.h;
      var compact = mode === "thumb";
      var Tn = P.TUNING;
      var v0 = P.jumpSpeed, g = Tn.gravity, apex = Tn.jumpApex;
      var tEnd = 2 * v0 / g;

      var leftW = compact ? w - 4 : w * 0.58, padL = compact ? 30 : 58, padB = 18, padT = 14;
      var plotW = leftW - padL - 8, plotH = h - padT - padB;
      var maxY = Math.max(apex * 1.35, Tn.standHeight * 1.1);
      var maxT = tEnd * 1.06;

      var X = function (t) { return padL + (t / maxT) * plotW; };
      var Y = function (m) { return padT + plotH - (m / maxY) * plotH; };

      /* 地面与身高基准 */
      line(ctx, padL, Y(0), padL + plotW, Y(0), "rgba(255,255,255,.22)", 1);

      [[Tn.standHeight, "站 " + Tn.standHeight.toFixed(2) + "m", C.ink3],
       [Tn.crouchHeight, "蹲 " + Tn.crouchHeight.toFixed(2) + "m", C.ink3]].forEach(function (r) {
        line(ctx, padL, Y(r[0]), padL + plotW, Y(r[0]), "rgba(255,255,255,.09)", 1, [3, 3]);
        if (!compact) txt(ctx, r[1], padL + plotW - 2, Y(r[0]) - 7, r[2], 8.5, "right");
      });

      /* 抛物线：y = v0 t − g t²/2 */
      ctx.beginPath();
      for (var i = 0; i <= 90; i++) {
        var t = (i / 90) * tEnd;
        var y = v0 * t - 0.5 * g * t * t;
        var px = X(t), py = Y(Math.max(0, y));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = C.num;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      var tApex = v0 / g;
      ctx.fillStyle = C.sun;
      ctx.beginPath();
      ctx.arc(X(tApex), Y(apex), 3, 0, Math.PI * 2);
      ctx.fill();
      line(ctx, X(tApex), Y(apex), X(tApex), Y(0), "rgba(255,184,107,.35)", 1, [2, 3]);

      /* 顶点标注：靠近右边缘就翻到左边，别顶出画布 */
      var ax = X(tApex) + 6, right = ax + 96 > padL + plotW;
      if (right) ax = X(tApex) - 6;
      txt(ctx, (compact ? "" : "顶点 ") + apex.toFixed(2) + "m @" + tApex.toFixed(2) + "s",
        ax, Y(apex) - 8, C.sun, compact ? 8 : 9, right ? "right" : "left");

      /* 左侧量高：从地面拉到顶点，标出这一跳到底多高 */
      var dx = padL - 16;
      line(ctx, dx, Y(0), dx, Y(apex), "rgba(255,255,255,.28)", 1);
      line(ctx, dx - 4, Y(0), dx + 4, Y(0), "rgba(255,255,255,.28)", 1);
      line(ctx, dx - 4, Y(apex), dx + 4, Y(apex), "rgba(255,255,255,.28)", 1);
      txt(ctx, apex.toFixed(2) + "m", dx - 7, (Y(0) + Y(apex)) / 2, C.sun, compact ? 8 : 8.5, "right");
      txt(ctx, "v₀ " + v0.toFixed(3) + " m/s · g " + g + " m/s²", padL, padT + 2, C.ink3, compact ? 8 : 9);
      txt(ctx, "滞空 " + tEnd.toFixed(2) + "s", padL + 4, Y(0) + 11, C.ink3, compact ? 8 : 8.5);

      if (compact) return;

      /* 速度条 */
      var rx = leftW + 14;
      var rw = w - rx - 6;
      var modes = [["walk", "步行"], ["sprint", "冲刺"], ["ads", "瞄准"], ["crouch", "蹲行"]];
      var maxV = Tn.sprint;
      var rowH = Math.min(26, (h - 30) / modes.length);
      txt(ctx, "速度 m/s", rx, 12, C.ink3, 9);
      modes.forEach(function (m, i) {
        var y = 26 + rowH * i;
        var val = Tn[m[0]];
        txt(ctx, m[1], rx, y + rowH / 2, C.ink2, 9.5);
        var bx = rx + 34;
        var bw = rw - 34 - 30;
        ctx.fillStyle = "rgba(255,255,255,.07)";
        ctx.fillRect(bx, y + rowH / 2 - 3, bw, 6);
        ctx.fillStyle = C.num;
        ctx.fillRect(bx, y + rowH / 2 - 3, bw * (val / maxV), 6);
        txt(ctx, val.toFixed(1), rx + rw - 2, y + rowH / 2, C.ink, 9, "right");
      });

      var stepWalk = (60 / (Tn.walk * 1000)) ;
      txt(ctx, "步幅 " + Tn.stride.walk + "/" + Tn.stride.sprint + "/" + Tn.stride.crouch + " m",
        rx, h - 6, C.ink3, 8.5);
    }

    draw();
    return {
      note: "那条抛物线不是画的示意图，是拿资产里的 jumpSpeed（= √(2gh) 反解出来）和 gravity 逐点算的；虚线是全项目的站立/蹲下高度契约。",
      resize: draw
    };
  }

  /* ================================================================ 7 · 武器数值 */

  function weaponPreview(host, mode) {
    var W = M["weapon-tuning"];
    var canvas = mkCanvas(host, 1.6);

    function draw() {
      var s = fit(canvas), ctx = s.ctx, w = s.w, h = s.h;
      var compact = mode === "thumb";
      var leftW = compact ? w - 4 : w * 0.56;

      /* 左：9 根弹簧冲激响应，用资产自己的 integrate() */
      var keys = Object.keys(W.SPRINGS);
      var dur = 0.9, dt = 1 / 240;
      var series = keys.map(function (k) {
        var sp = W.spring(W.SPRINGS[k][0], W.SPRINGS[k][1]);
        sp.v = 1;
        var pts = [];
        for (var t = 0; t <= dur; t += dt) {
          pts.push([t, sp.x]);
          W.integrate(sp, 0, dt);
        }
        return { k: k, pts: pts };
      });

      var padL = 26, padT = 16, padB = 16;
      var plotW = leftW - padL - 6, plotH = h - padT - padB;
      var maxAbs = 0;
      series.forEach(function (sr) {
        sr.pts.forEach(function (p) { maxAbs = Math.max(maxAbs, Math.abs(p[1])); });
      });
      maxAbs = maxAbs || 1;

      var X = function (t) { return padL + (t / dur) * plotW; };
      /* 零位线放在 72% 高度：九根弹簧的响应都是"先冲高、再回零、微微过冲"，
         摆正中会浪费下半幅。 */
      var zeroY = padT + plotH * 0.72;
      var Y = function (v) {
        return v >= 0
          ? zeroY - (v / maxAbs) * (zeroY - padT - 6)
          : zeroY + (-v / maxAbs) * (plotH * 0.26);
      };

      line(ctx, padL, zeroY, padL + plotW, zeroY, "rgba(255,255,255,.16)", 1);
      txt(ctx, "弹簧冲激响应 · 归一化", padL, 10, C.ink3, compact ? 8 : 8.5);

      var pal = ["#ffb86b", "#ff9ecb", "#c9a7ff", "#7fb8ff", "#63d9d9", "#7fd1a8", "#fbbf24", "#f87171", "#93a4b8"];
      series.forEach(function (sr, i) {
        ctx.beginPath();
        sr.pts.forEach(function (p, j) {
          var px = X(p[0]), py = Y(p[1]);
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        var hi = sr.k === "kickPitch";
        ctx.strokeStyle = hi ? C.sun : pal[i % pal.length];
        ctx.globalAlpha = hi ? 1 : 0.55;
        ctx.lineWidth = hi ? 2 : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      var kp = series.filter(function (x) { return x.k === "kickPitch"; })[0];
      if (kp) {
        var zc = kp.pts.filter(function (p, i) { return i > 0 && p[1] <= 0; })[0];
        if (zc) txt(ctx, "kickPitch 过零 " + (zc[0] * 1000).toFixed(0) + "ms", padL + 2, h - 7, C.sun, 8.5);
      }

      if (compact) return;

      /* 右：720 rpm 连发时序 —— 每发给 kickPitch 一个冲量，看它被推多高、来不及回落多少 */
      var rx = leftW + 14, rw = w - rx - 10;
      var Tn = W.WEAPON, D = W.DERIVED;
      var shots = 8;
      var span = D.fireInterval * (shots + 2);
      var top = 40, baseY = top + 118;

      var kick = W.spring(W.SPRINGS.kickPitch[0], W.SPRINGS.kickPitch[1]);
      var bars = [], now = 0, step = 1 / 480;
      for (var i = 0; i < shots; i++) {
        var want = i * D.fireInterval;
        while (now < want) { W.integrate(kick, 0, step); now += step; }
        kick.v += 1;                     /* 一发的冲量 */
        W.integrate(kick, 0, step); now += step;
        bars.push(kick.x);
      }
      var peak = Math.max.apply(null, bars) || 1;

      txt(ctx, "连发时序 · " + Tn.rpm + " rpm", rx, 15, C.ink3, 9);
      txt(ctx, "柱高 = kickPitch 被连续推到的位移", rx, 29, C.ink3, 8);

      line(ctx, rx, baseY, rx + rw, baseY, "rgba(255,255,255,.16)", 1);
      var bw = Math.min(13, (rw / shots) * 0.42);
      for (var j = 0; j < shots; j++) {
        var x = rx + (j * D.fireInterval / span) * rw;
        var hgt = (bars[j] / peak) * 104;
        var grad = ctx.createLinearGradient(0, baseY - hgt, 0, baseY);
        grad.addColorStop(0, j === shots - 1 ? C.sun : "rgba(255,184,107,.8)");
        grad.addColorStop(1, "rgba(255,140,71,.22)");
        ctx.fillStyle = grad;
        ctx.fillRect(x, baseY - hgt, bw, hgt);
        if (j === 0 || j === shots - 1) {
          txt(ctx, bars[j].toFixed(2), x + bw / 2, baseY - hgt - 8, j === shots - 1 ? C.sun : C.ink3, 8, "center");
        }
      }
      txt(ctx, "0", rx, baseY + 12, C.ink3, 8, "left");
      txt(ctx, D.fireInterval.toFixed(3) + "s / 发 · 满 " + (shots * D.fireInterval).toFixed(2) + "s", rx + rw, baseY + 12, C.ink3, 8, "right");

      var lines = [
        ["伤害", Tn.damage + " ×" + Tn.weakPointMul + " 弱点"],
        ["DPS", D.dps.toFixed(0)],
        ["弹匣伤害", D.magPotential + " hp"],
        ["携弹", D.mags + " 匣 (" + Tn.reserve + ")"],
        ["换弹", W.RELOAD.tacticalTotal + "s / 空仓 " + W.RELOAD.emptyTotal + "s"],
        ["扩散", Tn.spread + " rad"]
      ];
      lines.forEach(function (l, i) {
        var y = baseY + 42 + i * 19;
        txt(ctx, l[0], rx, y, C.ink3, 8.5);
        txt(ctx, l[1], rx + rw, y, C.ink, 8.5, "right");
      });
    }

    draw();
    return {
      note: "左边九条曲线是拿资产里的 spring() + integrate() 跑 240Hz 积分出来的，不是手画的衰减；右边柱子是把同一套积分用在 kickPitch 上、每发加一个冲量——0.083s 一发根本来不及回落，所以后几发被顶到接近饱和。",
      resize: draw
    };
  }

  /* ================================================================ 8 · 敌人感知 */

  function aiPreview(host, mode) {
    var A = M["ai-tuning"];
    var canvas = mkCanvas(host, 1.6);

    function draw() {
      var s = fit(canvas), ctx = s.ctx, w = s.w, h = s.h;
      var compact = mode === "thumb";
      var Tn = A.TUNING;

      var ox = compact ? w * 0.30 : w * 0.25;
      var oy = h * 0.52;
      var R = compact ? Math.min(w * 0.46, h * 0.42) : Math.min(w * 0.28, h * 0.36);
      var scale = R / Tn.sightRange;
      var half = (Tn.sightCone / 2) * Math.PI / 180;

      /* 听觉圈 */
      ctx.save();
      ctx.strokeStyle = "rgba(255,158,203,.38)";
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ox, oy, Tn.hearRadius * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* 视锥 */
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.arc(ox, oy, R, -half, half);
      ctx.closePath();
      var grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, R);
      grd.addColorStop(0, "rgba(255,184,107,.32)");
      grd.addColorStop(1, "rgba(255,184,107,.03)");
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,184,107,.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      /* 守卫 */
      ctx.fillStyle = C.sun;
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();

      /* 目标：一个在锥内、一个背对但进了听觉圈 */
      var targets = [
        { t: -0.26, d: 0.74, c: C.ok, lab: "锥内 · 立刻发现" },
        { t: 2.5, d: 0.56, c: C.audio, lab: "背对 · 只听得到" }
      ];
      targets.forEach(function (tg) {
        var px = ox + Math.cos(tg.t) * R * tg.d;
        var py = oy + Math.sin(tg.t) * R * tg.d;
        ctx.fillStyle = tg.c;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        if (!compact) {
          var flip = px > w * 0.42;
          txt(ctx, tg.lab, px + (flip ? -8 : 8), py - 9, tg.c, 8.5, flip ? "right" : "left");
        }
      });

      /* 锥角弧 */
      ctx.strokeStyle = "rgba(255,255,255,.16)";
      ctx.beginPath();
      ctx.arc(ox, oy, 24, -half, half);
      ctx.stroke();
      txt(ctx, Tn.sightCone + "°", ox + 28, oy - 10, C.ink3, compact ? 8 : 9);

      if (compact) return;

      /* 右栏：把数值摆到画布空出来的那一半 */
      var rx = w * 0.60;
      txt(ctx, "视锥", rx, h * 0.2, C.ink3, 9);
      txt(ctx, Tn.sightRange + " m / " + Tn.sightCone + "°", rx, h * 0.2 + 15, C.ink, 12, "left", 600);

      txt(ctx, "听觉", rx, h * 0.42, C.ink3, 9);
      txt(ctx, Tn.hearRadius + " m", rx, h * 0.42 + 15, C.ink, 12, "left", 600);

      txt(ctx, "丢失 / 搜索", rx, h * 0.64, C.ink3, 9);
      txt(ctx, Tn.loseSight + "s / " + Tn.searchTime + "s", rx, h * 0.64 + 15, C.ink, 12, "left", 600);

      /* 令牌槽 */
      var ty = h * 0.84;
      txt(ctx, "攻击令牌", rx, ty, C.ink3, 9);
      for (var i = 0; i < Tn.maxTokensCrowd; i++) {
        ctx.fillStyle = i < Tn.maxTokens ? C.sun : "rgba(255,255,255,.12)";
        ctx.fillRect(rx + i * 15, ty + 8, 11, 11);
      }
      txt(ctx, Tn.maxTokens + "/" + Tn.maxTokensCrowd, rx + Tn.maxTokensCrowd * 15 + 4, ty + 14, C.ink3, 8.5);

      txt(ctx, "cos(半角) " + A.SIGHT_COS.toFixed(4), w - 6, h - 8, C.ink3, 8.5, "right");
    }

    draw();
    return {
      note: "锥角、半径、听觉圈、令牌槽全部按 ai-tuning 的数值算，连右下那个余弦都是资产里的 SIGHT_COS 常量，不是重新取一次 cos。",
      resize: draw
    };
  }

  /* ================================================================ 9 · 音效配方 */

  function audioPreview(host, mode) {
    var AU = M["audio-recipes"];
    var canvas = mkCanvas(host, 1.6);

    function draw() {
      var s = fit(canvas), ctx = s.ctx, w = s.w, h = s.h;

      /* 总线负载：按每条配方的 max 累加"同时在响的路数"，不是配方条数 */
      var buses = ["near", "dry", "world", "music", "unset"];
      var slots = {}, count = {};
      AU.RECIPE_IDS.forEach(function (id) {
        var r = AU.RECIPES[id];
        var b = r.bus || "unset";
        slots[b] = (slots[b] || 0) + (r.max || 0);
        count[b] = (count[b] || 0) + 1;
      });
      var budget = AU.voiceBudget();
      var total = buses.reduce(function (a, b) { return a + (slots[b] || 0); }, 0);

      /* 左：总线发声预算 */
      var compact = mode === "thumb";
      var padL = 8, padT = 26;
      var leftSpan = compact ? w - 16 : w * 0.44;
      var colW = leftSpan / buses.length;
      txt(ctx, "同时发声上限 " + total + " 路", padL, 12, C.ink2, compact ? 9 : 10);
      if (!compact) txt(ctx, AU.RECIPE_IDS.length + " 条配方 · " + budget + " 路预算", padL, h - 6, C.ink3, 8.5);

      var barMaxH = h - padT - (compact ? 22 : 30);
      var peak = Math.max.apply(null, buses.map(function (b) { return slots[b] || 0; }));
      buses.forEach(function (b, i) {
        var v = slots[b] || 0;
        var bh = (v / peak) * barMaxH;
        var x = padL + i * colW;
        var bw = Math.max(6, colW - Math.min(14, colW * 0.34));
        ctx.fillStyle = "rgba(255,255,255,.055)";
        ctx.fillRect(x, padT, bw, barMaxH);
        ctx.fillStyle = b === "world" ? C.audio : "rgba(255,158,203,.45)";
        ctx.fillRect(x, padT + barMaxH - bh, bw, bh);
        txt(ctx, b, x, padT + barMaxH + 11, C.ink3, compact ? 7 : 8);
        txt(ctx, String(v), x, padT + barMaxH - bh - 7, C.ink2, compact ? 7.5 : 8.5);
      });

      if (compact) return;

      /* 右：57 条配方的 优先级 × 峰值 散点 */
      var rx = w * 0.50, rw = w - rx - 14;
      var rh = h - 46, ry = 20;
      line(ctx, rx, ry + rh, rx + rw, ry + rh, "rgba(255,255,255,.14)", 1);
      line(ctx, rx, ry, rx, ry + rh, "rgba(255,255,255,.14)", 1);
      txt(ctx, "优先级 →", rx + rw, ry + rh + 9, C.ink3, 8, "right");
      txt(ctx, "峰值", rx, ry - 9, C.ink3, 8);

      var ids = AU.RECIPE_IDS;
      var busColor = { near: C.sun, dry: C.bad, world: C.audio, music: C.num, unset: C.ink3 };
      ids.forEach(function (id) {
        var r = AU.RECIPES[id];
        var p = r.pri === undefined ? 2 : r.pri;
        var x = rx + (p / 10) * rw;
        var y = ry + rh - (r.peak || 0.5) * rh;
        ctx.fillStyle = busColor[r.bus || "unset"] || C.ink3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + Math.min(2.6, (r.max || 1) * 0.42), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      /* 图例放到底部，别跟标题打架 */
      var leg = [["near", "近场"], ["dry", "干声"], ["world", "世界"], ["music", "音乐"]];
      leg.forEach(function (l, i) {
        var x = rx + i * 44;
        ctx.fillStyle = busColor[l[0]];
        ctx.beginPath();
        ctx.arc(x + 4, h - 8, 2.6, 0, Math.PI * 2);
        ctx.fill();
        txt(ctx, l[1], x + 10, h - 8, C.ink3, 8);
      });
    }

    draw();
    return {
      note: "57 条配方的总线、峰值、优先级、同时发声上限。波形生成器没抽出来（它和音频上下文绑在一起），所以这里能预览混音结构，听不到声音——这点不糊弄。",
      resize: draw
    };
  }

  /* ================================================================ 注册表 */


  /* ================================================================ 10 · 材质烘焙器
     展示每族烘出来的三张图：albedo（此处做 sRGB 编码显示）、法线、ORM。
     三张图直接从 GPU 上的 RenderTarget 采样，不是另画的示意图。 */

  function bakerPreview(host, mode) {
    var MB = M["material-baker"];
    var b = baker();
    if (!b) throw new Error("WebGL 不可用，烘焙器起不来");

    /* 详情页按「三块方图 + 标签 + 表头」算比例，缩略图跟 3D 预览一样用 1.6，预览墙上才齐 */
    var cv = mkCanvas(host, mode === "thumb" ? 1.6 : 2.5);
    var fams = ["asphalt", "concrete", "paint", "wood", "rust", "galv", "tire", "chainlink", "corrugated"];
    var picked = 0;

    var sc = new T.Scene();
    var cm = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var quad = new T.Mesh(new T.PlaneGeometry(2, 2));
    quad.frustumCulled = false;
    sc.add(quad);

    /* 采样并直接写出：albedo 做一次 gamma 编码，法线/ORM 保持原值 */
    function showMat(gamma, rep) {
      return new T.ShaderMaterial({
        uniforms: { t: { value: null }, uGamma: { value: gamma }, uRep: { value: rep ? 1 : 0 } },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: [
          "uniform sampler2D t; uniform float uGamma, uRep; varying vec2 vUv;",
          "void main(){",
          "  vec3 c = texture2D(t, vUv).rgb;",
          "  if (uGamma > 0.5) c = pow(max(c, 0.0), vec3(1.0 / 2.2));",
          "  gl_FragColor = vec4(c, 1.0);",
          "}"
        ].join("\n"),
        depthTest: false, depthWrite: false
      });
    }
    var mAlb = showMat(1, true), mNrm = showMat(0, false), mOrm = showMat(0, false);

    function blit(tex, mat, dw, dh) {
      var g = gl();
      if (!g) return null;
      mat.uniforms.t.value = tex;
      quad.material = mat;
      g.setRenderTarget(null);
      g.setSize(256, 256, false);
      g.render(sc, cm);
      return GLC;
    }

    function draw() {
      var compact = mode === "thumb";
      var set = b.set(fams[picked]);
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h;
      /* 窄画布（缩略图 / 手机）一律用短标签：长句在 300 多 px 里必然撞车 */
      var narrow = compact || w < 660;
      var pad = narrow ? 8 : 12, head = narrow ? 18 : 30, gap = narrow ? 6 : 10;
      var capH = narrow ? 13 : 40;

      var cells = [
        { t: set.albedo, m: mAlb, label: "albedo", sub: narrow ? "" : "族 shader 输出（含 paint 遮罩 alpha）" },
        { t: set.normal, m: mNrm, label: "normal", sub: narrow ? "" : "height → Sobel，uK 随 bump(mm) 缩放" },
        { t: set.orm, m: mOrm, label: "ORM", sub: narrow ? "" : "R=AO  G=rough  B=metal" }
      ];
      var cw = Math.max(24, (w - pad * 2 - gap * 2) / 3);
      var avail = Math.max(24, h - head - capH);
      /* 详情页保持正方形（纹理不被裁）；缩略图格子窄高，改成裁切铺满，
         否则一张 10 格的墙里就它矮一截 */
      var tw = Math.min(cw, avail), th = compact ? avail : tw;
      var top = head + Math.max(0, (avail - th) / 2);
      var ox = (cw - tw) / 2;

      cells.forEach(function (c, i) {
        var x = pad + ox + i * (tw + gap);
        var src = blit(c.t, c.m, tw, th);
        if (src) {
          /* cover：正方纹理塞进非正方格子时按短边裁中间，不拉伸 */
          var k = Math.max(tw / 256, th / 256);
          var sw = Math.min(256, tw / k), sh = Math.min(256, th / k);
          var sx = (256 - sw) / 2, sy = (256 - sh) / 2;
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, top, tw, th);
          ctx.clip();
          ctx.drawImage(src, sx, sy, sw, sh, x, top, tw, th);
          ctx.restore();
        }
        line(ctx, x, top, x + tw, top, "rgba(255,255,255,.14)", 1);
        line(ctx, x, top + th, x + tw, top + th, "rgba(255,255,255,.14)", 1);
        txt(ctx, c.label, x, top + th + (narrow ? 10 : 14), C.ink, narrow ? 8.5 : 10.5, "left", 700);
        if (c.sub) txt(ctx, c.sub, x, top + th + 28, C.ink3, 8.5);
      });

      var fam = MB.SURF_FAMILIES.indexOf(fams[picked]) >= 0 ? fams[picked] : "—";
      if (narrow) {
        /* 窄画布只留族名和分辨率 */
        txt(ctx, "族 " + fam + " · " + set.size + "²", pad, 11, C.ink2, 9);
        txt(ctx, b.stats.families + " 族 / " + b.stats.passes + " passe" + (b.stats.passes > 1 ? "s" : ""),
          w - pad, 11, C.ink3, 8.5, "right");
      } else {
        txt(ctx, "族 " + fam + " · tile " + set.tile[0] + "×" + set.tile[1] + " m · 烘焙 " + set.size + "²",
          pad, 12, C.ink2, 10);
        txt(ctx, "湿润 uSlWet " + b.wet.value.toFixed(2) + " · 已烘 " + b.stats.families + " 族 / " +
          b.stats.passes + " passes", w - pad, 12, C.ink3, 9, "right");
      }
    }

    draw();

    if (mode === "full") {
      controls(host, [{
        label: "族", type: "buttons", options: fams, value: 0,
        on: function (i) { picked = i; draw(); }
      }]);
    }
    return {
      note: "三张图都是 material-baker 在 GPU 上现烘的：albedo 存的是 sqrt 编码、显示时反编码；法线由 height 用 Sobel 求，强度来自台账里的 bump（毫米）；ORM 是同一张图的三通道。",
      resize: draw
    };
  }

  /* ================================================================
     v2：按「一件资产」出图
     每条资产只有一件东西，所以不再画整排：材质是一颗球，道具是一件物，
     几何是一个原语，音效是一张配方卡，弹簧是一条阶跃响应。
     ================================================================ */

  function famInst(ML, famId) {
    var ids = ML.INSTANCE_IDS;
    for (var i = 0; i < ids.length; i++) {
      if (ML.INSTANCES[ids[i]].set === famId) return ids[i];
    }
    return ids[0];
  }

  /* --- 材质：一颗球 ------------------------------------------------- */
  function oneMaterial(host, mode, focus) {
    var ML = M["material-ledger"];
    var inst = focus.inst || famInst(ML, focus.fam);
    var v = View3D(host, {
      fov: 30, dist: 3.2, yaw: 0.55, pitch: 0.32, target: [0, 0.52, 0],
      ratio: 1.6, minDist: 1.4, maxDist: 14, msaa: mode === "full", bloom: 0.5
    });
    studio(v.scene);
    var g = ground(v.scene, 40, 0x0c1118);
    g.material.roughness = 0.9;

    var R = 0.5;
    var geo = new T.SphereGeometry(R, 72, 48);
    /* 球面 UV 是 0..1，台账要米制：按真实周长 / 半周长铺开 */
    var uv = geo.attributes.uv;
    for (var i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * (2 * Math.PI * R), uv.getY(i) * (Math.PI * R));
    }
    uv.needsUpdate = true;
    v.track(geo);

    var mat = painted(ML, inst);
    var mesh = new T.Mesh(geo, mat);
    mesh.position.y = R + 0.02;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    v.scene.add(mesh);

    v.frame(new T.Box3(new T.Vector3(-R, 0, -R), new T.Vector3(R, R * 2 + 0.04, R)), 1.16);

    return {
      note: "球面 UV 按 " + R + " m 半径换算成米制，所以纹理尺度是物理的。" +
        "贴图由 material-baker 现烘：" + (focus.fam || ML.INSTANCES[inst].set) + " 族的 GLSL → albedo / ORM / height → 法线。",
      resize: function () { v.render(); }
    };
  }

  var CONTAINER_CONTEXTS = {};
  function containerContext() {
    var key = "t" + BAKE_TEX;
    if (CONTAINER_CONTEXTS[key]) return CONTAINER_CONTEXTS[key];
    var CB = M["container-builder"], ML = M["material-ledger"];
    if (!CB) throw new Error("原版集装箱构造模块未加载");
    var decals = CB.createDecalService({}, { anisotropy: 4 });
    var emissives = {};
    var ctx = { time: { t: 0, dt: 0, frame: 0 }, mats: {
      get: function (id, opts) {
        if (!ML.INSTANCES[id]) throw new Error("原版道具引用未知材质：" + id);
        var originalBaker = baker();
        if (!originalBaker) throw new Error("道具程序化材质烘焙不可用；拒绝纯色降级");
        var result = originalBaker.material(id, opts);
        result.userData.previewShared = true;
        return result;
      },
      emissive: function (color, intensity) {
        color = color === undefined ? 0xffffff : color;
        intensity = intensity === undefined ? 4 : intensity;
        var key = color + "|" + intensity;
        if (!emissives[key]) {
          var mat = new T.MeshBasicMaterial({ color: new T.Color(color).multiplyScalar(intensity), toneMapped: true });
          mat.name = "emissive";
          mat.userData.previewShared = true;
          emissives[key] = mat;
        }
        return emissives[key];
      },
      number: function (n) {
        var result = decals.number(n);
        result.material.userData.previewShared = true;
        return result;
      },
      label: function (text, opts) {
        var result = decals.label(text, opts);
        result.material.userData.previewShared = true;
        return result;
      },
      decal: function (id) {
        var result = decals.decal(id);
        result.material.userData.previewShared = true;
        return result;
      }
    } };
    CONTAINER_CONTEXTS[key] = ctx;
    return ctx;
  }

  function previewPropObject(id, opts) {
    var PB = M["props-builder"];
    if (!PB) throw new Error("全部道具真实构造模块未加载");
    var obj = PB.buildProp(containerContext(), id, opts || {});
    obj.traverse(function (o) { if (o.geometry) o.geometry = o.geometry.clone(); });
    return obj;
  }

  /* 完整集装箱：原版 M3 -> zA，保留实体波纹、门五金和曲面贴花。 */
  function oneContainer(host, mode, focus) {
    var CB = M["container-builder"], ctx = containerContext();
    var PL = M["props-ledger"], p = PL.PROP_LEDGER[focus.prop];
    var opts = { seed: focus.seed === undefined ? 0 : focus.seed,
      doors: focus.doors || 0, wear: focus.wear === undefined ? 0.5 : focus.wear,
      color: focus.color || p.material.replace("paint_", "") };
    var v = View3D(host, { fov: 34, yaw: 0.72, pitch: 0.32, ratio: 1.6,
      minDist: 1, maxDist: 55, msaa: mode === "full", bloom: 0.25 });
    studio(v.scene);
    ground(v.scene, 60, 0x141a22);
    var body = null, wire = null, display = 0, status;
    var clay = new T.MeshStandardMaterial({ color: 0xabb6c3, roughness: 0.7, metalness: 0.05,
      side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    v.track(clay);
    function release() {
      [body, wire].forEach(function (root) {
        if (!root) return;
        v.scene.remove(root);
        root.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.isLineSegments && o.material) o.material.dispose();
        });
      });
      body = wire = null;
    }
    function build(reframe) {
      release();
      body = CB.buildContainer(ctx, focus.prop, opts);
      var vertices = 0, triangles = 0, meshes = 0;
      body.traverse(function (o) {
        if (!o.isMesh) return;
        /* M3 缓存原几何。预览自行克隆，销毁页面时不能破坏原版缓存。 */
        o.geometry = o.geometry.clone();
        o.userData.sourceMaterial = o.material;
        vertices += o.geometry.attributes.position.count;
        triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
        meshes++;
      });
      body.userData.prop = focus.prop;
      v.scene.add(body);
      wire = new T.Group();
      body.updateMatrixWorld(true);
      body.traverse(function (o) {
        if (!o.isMesh) return;
        var transparent = o.userData.sourceMaterial.transparent;
        o.visible = display === 0 || !transparent;
        o.material = display === 0 ? o.userData.sourceMaterial : clay;
        if (display === 2 && !transparent) {
          var lines = new T.LineSegments(new T.WireframeGeometry(o.geometry),
            new T.LineBasicMaterial({ color: 0x273b51, transparent: true, opacity: 0.32 }));
          lines.applyMatrix4(o.matrixWorld);
          wire.add(lines);
        }
      });
      v.scene.add(wire);
      v.canvas.dataset.builder = "M3/zA";
      v.canvas.dataset.vertices = vertices;
      v.canvas.dataset.triangles = Math.round(triangles);
      v.canvas.dataset.doors = body.userData.doors;
      if (status) status.textContent = "原版 M3 → zA · " + meshes + " 材质网格 · " +
        vertices.toLocaleString() + " 顶点 · " + Math.round(triangles).toLocaleString() + " 三角 · " +
        body.userData.colliders.length + " 碰撞盒";
      if (reframe) v.frame(body, 1.14); else v.render();
    }
    if (mode === "full") {
      status = document.createElement("div");
      status.className = "pv-note";
      status.setAttribute("data-container-status", "true");
      host.appendChild(status);
      controls(host, [
        { label: "显示", options: ["原材质", "纯灰几何", "结构线框"], on: function (i) { display = i; build(false); } },
        { label: "箱门", options: ["关闭", "打开 60%", "全开"], value: opts.doors ? 1 : 0,
          on: function (i) { opts.doors = [0, 0.6, 1][i]; build(true); } },
        { label: "视角", options: ["整体", "长侧板", "箱门近景", "顶板", "端板"],
          on: function (i) {
            if (i === 0) { v.cam.yaw = 0.72; v.cam.pitch = 0.32; v.frame(body, 1.14); return; }
            var L = p.size[0], H = p.size[1];
            if (i === 1) { v.cam.target.set(0, H * 0.52, 1.08); v.cam.yaw = 0; v.cam.pitch = 0.08; v.cam.dist = 5.3; }
            if (i === 2) { v.cam.target.set(L / 2 - 0.04, H * 0.5, 0); v.cam.yaw = 1.38; v.cam.pitch = 0.12; v.cam.dist = 6.5; }
            if (i === 3) { v.cam.target.set(0, H, 0); v.cam.yaw = 0.12; v.cam.pitch = 1.1; v.cam.dist = 5.8; }
            if (i === 4) { v.cam.target.set(-L / 2 + 0.04, H * 0.5, 0); v.cam.yaw = -1.38; v.cam.pitch = 0.12; v.cam.dist = 6.5; }
            v.render();
          } },
        { label: "变体", options: ["0", "1", "5"], on: function (i) { opts.seed = [0, 1, 5][i]; build(false); } }
      ]);
    }
    build(true);
    return { note: "真实构造来自原工程 M3/zA，不是尺寸盒。侧/顶/端板波纹深度分别为 36/20/42 mm；" +
      "端框、角件、梁柱、门铰链、锁杆、封条、曲面编号和开门内饰均保留。切到纯灰或线框，可排除贴图造成的假凹凸。" +
      "预览照明仍是棚拍宿主，不代表整机光影逐像素一致。",
      resize: function () { v.render(); }, dispose: function () { release(); v.dispose(); } };
  }

  /* --- 道具：完整原版注册构造，禁止尺寸盒回退 ------------------------- */
  function oneProp(host, mode, focus) {
    if (/^container(?:20|40|40hc)$/.test(focus.prop)) return oneContainer(host, mode, focus);
    var id = focus.prop, PL = M["props-ledger"], p = PL.PROP_LEDGER[id];
    if (!p) throw new Error("台账里没有 " + id);
    var opts = { seed: focus.seed === undefined ? 0 : focus.seed };
    var v = View3D(host, { fov: 34, yaw: 0.72, pitch: 0.3, ratio: 1.6,
      minDist: 0.3, maxDist: 100, msaa: mode === "full", bloom: 0.3 });
    studio(v.scene);
    ground(v.scene, Math.max(30, p.size[0] * 4), 0x141a22);
    var body, wire, display = 0, raf = null, playing = false, lastTime = 0, status;
    var clay = new T.MeshStandardMaterial({ color: 0xaab8c6, roughness: 0.72, metalness: 0.05,
      side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    v.track(clay);
    function release() {
      if (body) {
        v.scene.remove(body);
        body.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          var ownedMaterial = o.userData.sourceMaterial || o.material;
          if (ownedMaterial && ownedMaterial !== clay && !(ownedMaterial.userData && ownedMaterial.userData.previewShared)) ownedMaterial.dispose();
        });
      }
      if (wire) {
        v.scene.remove(wire);
        wire.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      }
      body = wire = null;
    }
    function syncWire() {
      if (!wire || !body) return;
      body.updateMatrixWorld(true);
      wire.children.forEach(function (line) { line.matrix.copy(line.userData.mesh.matrixWorld); });
    }
    function build(reframe) {
      release();
      body = previewPropObject(id, opts);
      wire = new T.Group();
      var verts = 0, tris = 0, meshes = 0;
      body.traverse(function (o) {
        if (!o.isMesh) return;
        var original = o.material;
        o.userData.sourceMaterial = original;
        verts += o.geometry.attributes.position.count;
        tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
        meshes++;
        o.visible = display === 0 || !original.transparent;
        if (display !== 0) o.material = clay;
        if (display === 2 && !original.transparent) {
          var line = new T.LineSegments(new T.WireframeGeometry(o.geometry),
            new T.LineBasicMaterial({ color: 0x273b51, transparent: true, opacity: 0.35 }));
          line.matrixAutoUpdate = false;
          line.userData.mesh = o;
          wire.add(line);
        }
      });
      v.scene.add(body); v.scene.add(wire); syncWire();
      var colliders = body.userData.colliders || [];
      v.canvas.dataset.builder = "Yg/" + id;
      v.canvas.dataset.vertices = verts;
      v.canvas.dataset.triangles = Math.round(tris);
      v.canvas.dataset.prop = id;
      v.canvas.dataset.dynamic = typeof body.userData.update === "function";
      if (status) status.textContent = "原版 Yg.build → " + id + " · " + meshes + " 网格 · " +
        verts.toLocaleString() + " 顶点 · " + Math.round(tris).toLocaleString() + " 三角 · " + colliders.length + " 碰撞盒";
      if (reframe) v.frame(body, 1.2); else v.render();
    }
    function tick(now) {
      if (!playing || !document.body.contains(host)) { raf = null; return; }
      var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
      lastTime = now;
      if (body && body.userData.update) {
        body.userData.update(dt);
        v.canvas.dataset.state = body.userData.state;
        v.canvas.dataset.level = body.userData.level;
        syncWire(); v.render();
      }
      raf = requestAnimationFrame(tick);
    }
    if (mode === "full") {
      status = document.createElement("div"); status.className = "pv-note"; host.appendChild(status);
      var ctl = [
        { label: "显示", options: ["原材质", "纯灰几何", "结构线框"], on: function (i) { display = i; build(false); } },
        { label: "变体", options: ["seed 0", "seed 1", "seed 5"], on: function (i) { opts.seed = [0, 1, 5][i]; build(false); } },
        { label: "视角", options: ["整体", "侧面", "俯视"], on: function (i) {
          v.cam.yaw = i === 1 ? 0 : 0.72; v.cam.pitch = i === 2 ? 1.1 : 0.3; v.frame(body, 1.2);
        } }
      ];
      function option(label, labels, key, values) {
        ctl.push({ label: label, options: labels, on: function (i) { opts[key] = values[i]; build(true); } });
      }
      if (id === "barrel") { option("姿态", ["直立", "倒放"], "lying", [false, true]); option("桶盖", ["封闭", "敞口"], "open", [false, true]); }
      if (id === "pallet") option("破损", ["完整", "缺板"], "broken", [false, true]);
      if (id === "gate_arm") option("道闸", ["关闭", "半开", "升起"], "open", [0, 0.5, 1]);
      if (id === "forklift") option("货叉", ["降下", "中位", "抬起"], "forksUp", [0, 0.5, 1]);
      if (id === "catwalk") option("栏杆", ["双侧", "左侧", "右侧", "无栏杆"], "rails", ["both", "left", "right", "none"]);
      if (id === "light_mast" || id === "floodlight_stand" || id === "guard_booth") option("灯", ["开启", "关闭"], "on", [true, false]);
      if (id === "traffic_cone") option("姿态", ["直立", "倒放"], "lying", [false, true]);
      if (id === "pallet_stack" || id === "tire_stack") option("堆叠", ["默认", "2 层", "5 层"], "count", [undefined, 2, 5]);
      if (id === "sandbags") option("层数", ["5 层", "3 层", "7 层"], "courses", [5, 3, 7]);
      if (id === "relay_node") {
        ctl.push({ label: "中继", options: ["运行", "切断中", "已切断"], on: function (i) {
          body.userData.setState(["live", "cutting", "cut"][i]); body.userData.update(0); v.render();
        } });
        ctl.push({ label: "动作", options: ["播放", "暂停", "重置"], on: function (i) {
          playing = i === 0;
          if (i === 2) { playing = false; opts.state = "live"; build(false); }
          if (playing && !raf) { lastTime = 0; raf = requestAnimationFrame(tick); }
        } });
      }
      controls(host, ctl);
    }
    build(true);
    if (id === "relay_node" && mode === "full") { playing = true; raf = requestAnimationFrame(tick); }
    return { note: "此页执行原版 Yg 注册的专用构造器，保留真实几何、层级、米制 UV、材质槽、标签及碰撞。" +
      "选项直接传给原版函数；灯具和中继的发光来自原版接口。几何验证与最终游戏光影分开：当前仍是 r160 棚拍宿主，非完整渲染复刻。",
      resize: function () { syncWire(); v.render(); },
      dispose: function () { playing = false; if (raf) cancelAnimationFrame(raf); release(); v.dispose(); } };
  }

  /* --- 几何原语 ----------------------------------------------------- */
  function oneGeo(host, mode, focus) {
    var MK = M["modeling-kit"], ML = M["material-ledger"];
    var fn = focus.geo;
    var v = View3D(host, { fov: 32, dist: 5, yaw: 0.7, pitch: 0.3, target: [0, 0.6, 0], ratio: 1.6, minDist: 1, maxDist: 40, msaa: mode === "full" });
    studio(v.scene);
    ground(v.scene, 30, 0x10161e);
    var grid = metricGrid(v.scene, 12, 0.09);
    v.track(grid.geometry); v.track(grid.material);

    var geo, obj, note;
    if (fn === "metricBox") {
      geo = MK.metricBox(1.6, 1.0, 1.1, 0.06, "bottom");
      note = "1.6 × 1.0 × 1.1 m，倒角 6 cm，底锚。";
    } else if (fn === "bevelBox") {
      geo = MK.bevelBox(1.6, 0.12, 1.2, 0.02, "bottom");
      note = "1.6 × 0.12 × 1.2 m 的薄板，倒角 2 cm —— 护栏座那种比例。";
    } else if (fn === "cylinder") {
      geo = MK.cylinder(0.28, 0.28, 1.4, 16);
      note = "半径 0.28 m、高 1.4 m，16 段。";
    } else if (fn === "tube") {
      geo = MK.tube([[0, 0, 0], [0.4, 0.25, 0.1], [0.9, 0.5, 0.15], [1.4, 0.55, 0.3], [1.7, 0.3, 0.5]], 0.05, 10);
      note = "5 点折线 + 半径 5 cm 的样条管（Catmull-Rom）。";
    } else if (fn === "place") {
      geo = MK.place(MK.metricBox(1.0, 0.5, 0.7, 0.03, "bottom"), 0.6, 0.4, -0.3, [0.3, 0.7, 0.1]);
      note = "把盒子按位移与欧拉角烘进顶点，便于静态合批。";
    } else if (fn === "vertexColor") {
      geo = MK.vertexColor(MK.metricBox(1.4, 1.0, 1.4, 0.05, "bottom"), function (x, y, z) {
        return [0.2 + x * 0.5, 0.25 + y * 0.5, 0.4 + z * 0.4];
      });
      obj = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }));
      note = "按回调给每个顶点写颜色；这里用位置做渐变以便看见。";
    } else {
      geo = MK.merge([
        MK.metricBox(0.8, 0.8, 0.8, 0.03, "bottom"),
        MK.place(MK.metricBox(0.6, 0.6, 0.6, 0.03, "bottom"), 1.0, 0, 0)
      ]);
      note = "两个盒子合并成一个几何（带索引偏移），材质分桶后一次 draw call。";
    }
    v.track(geo);

    if (!obj) {
      var mat = painted(ML, fn === "bevelBox" ? "steel_galv" : "steel_dark");
      obj = new T.Mesh(geo, mat);
    }
    obj.castShadow = true;
    obj.receiveShadow = true;
    v.scene.add(obj);

    /* 线框：让三角面看得见 */
    var wf = new T.WireframeGeometry(geo);
    var line = new T.LineSegments(wf, new T.LineBasicMaterial({ color: 0x7fd1a8, transparent: true, opacity: 0.16 }));
    line.position.copy(obj.position);
    v.scene.add(line);
    v.track(wf); v.track(line.material);

    var box = new T.Box3().setFromObject(obj);
    v.frame(box, 1.7);

    return {
      note: note + " 三角面数 " + (geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3) + "，顶点 " + geo.attributes.position.count + "。",
      resize: function () { v.render(); }
    };
  }

  /* --- 音效：配方卡 ------------------------------------------------- */
  function oneSfx(host, mode, focus) {
    var AU = M["audio-recipes"];
    var R = (AU.RECIPES || {})[focus.sfx];
    if (!R) throw new Error("没有配方 " + focus.sfx);
    var cv = mkCanvas(host, 2.85);
    var BUS = { near: "#ffb86b", dry: "#7fd1a8", world: "#7fb8ff", music: "#c9a7ff", unset: "#6f7d8e" };
    var BUS_CN = { near: "近场", dry: "干声", world: "世界坐标", music: "音乐", unset: "未指定" };
    var SR = { ki: "44.1 kHz", Xn: "32 kHz", pl: "22.05 kHz" };
    var bus = R.bus || "unset";

    function draw() {
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h;
      var col = BUS[bus] || BUS.unset;
      var pad = 18, compact = w < 420;

      /* 抬头：配方名 + 总线 */
      txt(ctx, focus.sfx, pad, 24, C.ink, compact ? 13 : 15, "left", 700);
      var bw = compact ? 62 : 76;
      ctx.fillStyle = col + "26";
      roundRect(ctx, w - pad - bw, 10, bw, 20, 10);
      txt(ctx, BUS_CN[bus] || bus, w - pad - bw / 2, 24, col, compact ? 9 : 10, "center", 700);

      /* n 是音色变体数量，不是 DSP 合成声部层数。 */
      txt(ctx, (R.n || 1) + " 变体 · " + (SR[R.sr] || R.sr || "—") +
        (R.gen ? " · 生成器 " + R.gen : "") + (R.boot ? " · 开场地板" : ""),
        pad, 46, C.ink3, compact ? 8.5 : 9.5, "left");

      /* 峰值条 */
      var yp = 70;
      txt(ctx, "PEAK", pad, yp, C.ink3, 9, "left", 600);
      var bx = pad + (compact ? 36 : 44), bwid = w - pad * 2 - (compact ? 36 : 44) - 40;
      ctx.fillStyle = "rgba(255,255,255,.07)";
      roundRect(ctx, bx, yp - 7, bwid, 7, 4);
      ctx.fillStyle = R.peak > 0.9 ? C.warn : col;
      roundRect(ctx, bx, yp - 7, bwid * Math.min(1, R.peak || 0), 7, 4);
      txt(ctx, Math.round((R.peak || 0) * 100) + "%", w - pad, yp, C.ink2, 9.5, "right");

      /* n 个可选择的程序生成变体 */
      var yl = yp + 26, n = R.n || 1, slot = Math.min(48, bwid / Math.max(4, n));
      txt(ctx, "变体", pad, yl, C.ink3, 9, "left", 600);
      for (var i = 0; i < n; i++) {
        ctx.fillStyle = col + (i === 0 ? "" : "88");
        roundRect(ctx, bx + i * slot, yl - 8, Math.max(8, slot - 5), 8, 3);
      }

      /* 四格：并发 / 优先级 / 参考距离 / 滚降 */
      var gy = yl + 30, gw = (w - pad * 2) / 2;
      var cellH = Math.max(compact ? 54 : 58, (h - gy - 32) / 2);
      var cells = [
        ["同时发声上限", R.max == null ? "未指定" : R.max, R.max == null ? "配方没写 → 走默认" : "路"],
        ["优先级", R.pri == null ? "未指定" : R.pri, R.pri == null ? "配方没写 → 走默认" : "抢占用"],
        ["参考距离", R.ref == null ? "未指定" : R.ref, R.ref == null ? "运行时默认值/调用参数" : "米"],
        ["距离滚降", R.roll == null ? "—" : R.roll, R.roll == null ? "无" : "每倍距离"]
      ];
      cells.forEach(function (c, i) {
        var cx = pad + (i % 2) * gw, cy = gy + Math.floor(i / 2) * cellH;
        if (i % 2 === 0 && i > 0) line(ctx, pad, cy - 10, w - pad, cy - 10, "rgba(255,255,255,.05)");
        var off = Math.max(0, (cellH - 58) / 2);
        txt(ctx, c[0], cx, cy + 12 + off, C.ink3, 9);
        var big = String(c[1]);
        var fs = big.length > 3 ? (compact ? 13 : 15) : (compact ? 17 : 20);
        txt(ctx, big, cx, cy + 34 + off, c[1] === "未指定" ? C.ink3 : C.ink, fs, "left", 700);
        txt(ctx, c[2], cx, cy + 50 + off, "rgba(255,255,255,.22)", 8.5, "left");
      });

      /* 底注 */
      txt(ctx, "配方层可整体搬走；波形由音频模块的生成器现合成，没随页面打包",
        pad, h - 10, "rgba(255,255,255,.22)", 8.5, "left");
    }
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }
    draw();
    return {
      note: "这是配方本身：总线（" + (BUS_CN[bus] || bus) + "）、" + (R.n || 1) + " 个生成变体、峰值 " +
        Math.round((R.peak || 0) * 100) + "%、采样率 " + (SR[R.sr] || R.sr || "—") +
        (R.max == null ? "；这条配方没写并发上限" : "；同时最多 " + R.max + " 路") +
        (R.ref == null ? "；未写 ref 不代表没有 3D 衰减，需查运行时默认值与调用参数。" : "，参考距离 " + R.ref + " m。") +
        "纯 DSP 生成器可以独立抽取，但此页尚未接入合成与播放；配方卡不是声音验收。", 
      resize: draw
    };
  }

  /* --- 后期：在合成链里的位置 --------------------------------------- */
  var CHAIN = ["几何", "着色", "光照", "合成", "屏幕"];
  var FX_POS = {
    vol: [2, "体积光在光照段累加，写进 HDR 缓冲"],
    ao: [2, "AO 在光照段之前算，乘到环境项上"],
    shadow: [2, "阴影在光照段"],
    planar: [2, "平面反射在光照段之前多画一遍场景"],
    adapt: [3, "曝光自适应在合成段最先读亮度"],
    bloom: [3, "亮部提取 → 三级模糊 → 叠回"],
    streak: [3, "横向拉丝，与 bloom 并列"],
    dirt: [3, "镜头脏污，叠在最后"],
    flare: [3, "眩光，按太阳屏幕位置生成"],
    ca: [3, "色散，按半径错位 RGB"],
    vignette: [3, "暗角"],
    agx: [3, "色彩映射，AgX 与 ACES 混合"],
    motion: [3, "运动模糊，深度重投影"],
    rain: [2, "雨丝与涟漪在地面着色里"]
  };

  function oneFx(host, mode, focus) {
    var cv = mkCanvas(host, 1.9);
    function draw() {
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h;
      var key = focus.fx;
      var info = FX_POS[key] || [3, ""];
      var pad = 18;

      txt(ctx, key.toUpperCase(), pad, 26, C.ink, w < 420 ? 13 : 16, "left", 700);
      txt(ctx, info[1], pad, 46, C.ink3, 9.5);

      /* 五段管线 */
      var y = 78, bw = (w - pad * 2) / 5;
      CHAIN.forEach(function (name, i) {
        var on = i === info[0];
        ctx.fillStyle = on ? "rgba(255,184,107,.16)" : "rgba(255,255,255,.04)";
        roundRect(ctx, pad + i * bw + 2, y, bw - 4, 26, 5);
        if (on) {
          ctx.strokeStyle = "rgba(255,184,107,.55)";
          ctx.lineWidth = 1;
          ctx.strokeRect(pad + i * bw + 2.5, y + 0.5, bw - 5, 25);
        }
        txt(ctx, name, pad + i * bw + bw / 2, y + 17, on ? C.sun : C.ink3, 9.5, "center", on ? 700 : 400);
      });

      /* 说明 */
      var lines = [
        "这是一个 pass，不是一件能单独摆出来的模型。",
        "抽出来的是它的 uniform 与参数，GLSL 本身绑在合成链的 RT 上。",
        "预览只标出它在管线里的位置，不假装能单独渲染。"
      ];
      lines.forEach(function (L, i) {
        txt(ctx, L, pad, y + 62 + i * 18, i === 0 ? C.ink2 : C.ink3, 10);
      });
    }
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }
    draw();
    return { note: "后期链的 13 个效果各自抽出了 uniform；它们的 GLSL 与 RT 绑定属于整机，不单独出画面。", resize: draw };
  }

  /* --- 弹簧：阶跃响应 ----------------------------------------------- */
  function oneSpring(host, mode, focus) {
    var W = M["weapon-tuning"];
    var key = focus.spring;
    var kc = (W.SPRINGS || {})[key] || [520, 30];
    var full = mode === "full";
    var N = 260, dt = 1 / 240;

    /* integrate(s, target, dt) 是原地积分：状态对象 s 被改掉，返回值只是 s.x 这个数字。
       所以状态要自己留着，不能拿返回值去覆盖它。 */
    var st = W.spring(kc[0], kc[1]);
    var pts = [st.x], peak = st.x, iPeak = 0;
    for (var i = 0; i < N; i++) {
      W.integrate(st, 1, dt);
      pts.push(st.x);
      if (st.x > peak) { peak = st.x; iPeak = i + 1; }
    }
    var iSettle = 0;
    for (var j = 0; j < pts.length; j++) if (Math.abs(pts[j] - 1) > 0.02) iSettle = j;
    var over = peak > 1 ? (peak - 1) * 100 : 0;
    var tPeak = iPeak * dt, tSettle = iSettle * dt;
    var zeta = kc[1] / (2 * Math.sqrt(kc[0])), wn = Math.sqrt(kc[0]);

    var cv = mkCanvas(host, 1.9);
    function draw() {
      var f = fit(cv), ctx = f.ctx, w = f.w, h = f.h;
      var padL = 40, padR = 18, padT = 58, padB = 34;
      var ymax = Math.max(1.18, peak * 1.1);
      var y0 = padT, y1 = h - padB;
      function Y(v) { return y1 - (v / ymax) * (y1 - y0); }
      function X(i) { return padL + (i / N) * (w - padL - padR); }

      /* 抬头两行：左边是这根弹簧的身份，右边是它算出来的指标 */
      txt(ctx, key, padL, 18, C.ink, 12.5, "left", 700);
      txt(ctx, "k " + kc[0] + " · c " + kc[1], w - padR, 18, C.ink3, 9.5, "right");
      txt(ctx, "ζ " + zeta.toFixed(2) + " · ωn " + wn.toFixed(1) + " /s" +
        (zeta < 0.999 ? "（欠阻尼）" : "（临界）") + " · 260 步 @ 240 Hz", padL, 35, C.ink3, 9, "left");
      if (peak > 0.999) {
        txt(ctx, "峰值 " + peak.toFixed(3) + " @ " + tPeak.toFixed(3) + " s · 过冲 " + over.toFixed(1) + "%",
          w - padR, 35, C.sun, 9, "right");
      }

      /* ±2% 稳定带 */
      ctx.fillStyle = "rgba(110,231,183,.09)";
      ctx.fillRect(padL, Y(1.02), w - padL - padR, Math.max(1, Y(0.98) - Y(1.02)));

      /* 目标线 */
      line(ctx, padL, Y(1), w - padR, Y(1), "rgba(255,255,255,.20)");

      /* 时间轴 / 值轴 */
      line(ctx, padL, y1, w - padR, y1, "rgba(255,255,255,.13)");
      line(ctx, padL, y0, padL, y1, "rgba(255,255,255,.13)");
      txt(ctx, "1.0", padL - 6, Y(1) + 3, C.ink3, 8, "right");
      txt(ctx, "0", padL - 6, y1, C.ink3, 8, "right");
      txt(ctx, (N * dt).toFixed(2) + " s", w - padR, h - 10, C.ink3, 8, "right");

      /* 时间刻度：曲线 0.3 s 内就平了，剩下靠刻度读数 */
      [0, 0.25, 0.5, 0.75, 1.0].forEach(function (t) {
        var x = X(Math.round(t / dt));
        if (t > 0) line(ctx, x, y0, x, y1, "rgba(255,255,255,.05)");
        txt(ctx, t.toFixed(2), x, h - 10, "rgba(255,255,255,.26)", 7.5, t === 0 ? "left" : "center");
      });

      /* 峰值竖线 */
      if (peak > 1.005) {
        var xp = X(iPeak);
        line(ctx, xp, Y(peak), xp, y1, "rgba(255,184,107,.34)");
        ctx.beginPath();
        ctx.arc(xp, Y(peak), 2.4, 0, 6.2832);
        ctx.fillStyle = C.sun;
        ctx.fill();
      }

      /* 曲线 */
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var x = X(i), y = Y(Math.max(0, Math.min(ymax, pts[i])));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = C.sun;
      ctx.lineWidth = 1.7;
      ctx.lineJoin = "round";
      ctx.stroke();

      /* 稳定时刻 */
      if (tSettle > 0 && iSettle < N) {
        var xs = X(iSettle);
        line(ctx, xs, y0, xs, y1, "rgba(110,231,183,.40)");
        var lx = xs + 5 + 54 > w - padR ? xs - 5 : xs + 5;
        txt(ctx, "2% 内 " + tSettle.toFixed(2) + " s", lx, y1 - 5, C.ok, 8.5, lx > xs ? "left" : "right");
      }
    }
    draw();
    return {
      note: "用 weapon-tuning 的 spring(" + kc[0] + "," + kc[1] + ") 现造一根弹簧，再拿同模块的 integrate() 按 240 Hz 原地积分 260 步，" +
        "输入是阶跃 1.0 —— 也就是「开一枪」之后这根弹簧怎么把枪口推出去、又怎么抖回来。" +
        "阻尼比 ζ = c / 2√k = " + zeta.toFixed(2) + "，所以" + (zeta < 1 ? "有过冲，看得见回弹" : "接近临界阻尼，几乎不过冲") +
        "；过冲 " + over.toFixed(1) + "%，" + tSettle.toFixed(2) + " s 后落进 ±2% 带。",
      resize: draw
    };
  }

  /* --- 画质预设 ----------------------------------------------------- */
  function oneQuality(host, mode, focus) {
    return qualityPreview(host, mode, { picked: M["quality-presets"].ORDER.indexOf(focus.q) });
  }

  /* --- 数值类 ------------------------------------------------------- */
  function oneNum(host, mode, focus) {
    var which = focus.num;
    if (which === "player") return playerPreview(host, mode);
    if (which === "ai") return aiPreview(host, mode);
    if (which === "weapon") return weaponPreview(host, mode);
    return numCanvas(host, mode, which);
  }

  function numCanvas(host, mode, which) {
    var cv = mkCanvas(host, 1.8);
    function draw() {
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h, pad = 18;
      if (which === "move") {
        var P = M["player-tuning"].TUNING;
        txt(ctx, "移动手感：加速 / 减速", pad, 22, C.ink, 12, "left", 700);
        var rows = [
          ["地面加速", P.accelGround, 40],
          ["地面减速", P.decelGround, 40],
          ["空中加速", P.accelAir, 20],
          ["重力", P.gravity, 30],
          ["步行", P.walk, 8],
          ["冲刺", P.sprint, 10]
        ];
        var y = 52, maxV = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
        rows.forEach(function (r) {
          txt(ctx, r[0], pad, y + 10, C.ink2, 9.5);
          ctx.fillStyle = "rgba(255,255,255,.06)";
          ctx.fillRect(pad + 70, y + 2, w - pad * 2 - 110, 8);
          ctx.fillStyle = "rgba(127,209,168,.75)";
          ctx.fillRect(pad + 70, y + 2, (w - pad * 2 - 110) * (r[1] / maxV), 8);
          txt(ctx, String(r[1]), w - pad, y + 10, C.ink, 9.5, "right");
          y += 26;
        });
        return;
      }
      if (which === "input") {
        txt(ctx, "按键映射", pad, 22, C.ink, 12, "left", 700);
        txt(ctx, "27 个动作绑定（数据在 fx 模块的键位表里）", pad, 40, C.ink3, 9);
        return;
      }
      if (which === "waves") {
        txt(ctx, "波次节奏", pad, 22, C.ink, 12, "left", 700);
        txt(ctx, "开场 3.5 s，重试 1.3 s，同屏上限与投放间隔按表。", pad, 42, C.ink2, 10);
        txt(ctx, "15 个字段：introSeconds / retryIntroSeconds / waves / maxAlive / spawnStagger …", pad, 62, C.ink3, 9);
      }
    }
    draw();
    return { note: "这一条是纯数值表，图只画关键量；完整字段见「参数」表。", resize: draw };
  }

  /* --- 贴花：说明卡（绘制函数未抽） --------------------------------- */
  function oneDecal(host, mode, focus) {
    var cv = mkCanvas(host, 1.6);
    function draw() {
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h, pad = 18;
      /* 棋盘底，表示这是一张透明底的贴图 */
      var cell = 12;
      for (var y = 0; y < h; y += cell) {
        for (var x = 0; x < w; x += cell) {
          ctx.fillStyle = ((x / cell + y / cell) % 2) ? "rgba(255,255,255,.028)" : "rgba(255,255,255,.012)";
          ctx.fillRect(x, y, cell, cell);
        }
      }
      var result = containerContext().mats.decal(focus.decal);
      var image = result.material.map.image;
      var scale = Math.min((w - pad * 2) / image.width, (h - 60) / image.height);
      var iw = image.width * scale, ih = image.height * scale;
      ctx.drawImage(image, (w - iw) / 2, 20, iw, ih);
      txt(ctx, focus.decal + " · " + image.width + " × " + image.height,
        w / 2, h - 15, C.ink2, 10, "center", 600);
    }
    draw();
    return {
      note: "直接运行原工程 l3() 的 canvas 绘制函数，展示真实透明贴花；集装箱编号与污迹沿波纹曲面重建，不是平面悬贴。", 
      resize: draw
    };
  }

  /* --- 角色 --------------------------------------------------------- */
  function oneActor(host, mode, focus) {
    var inst = focus.actor === "player" ? playerPreview(host, mode) : aiPreview(host, mode);
    inst.note = "参数图，非角色模型或动作复刻。枪体/手部/程序骨骼/IK及状态机尚需接入。 " + (inst.note || "");
    return inst;
  }

  /* --- 兜底：参数卡 ------------------------------------------------- */
  function oneSpec(host, mode, focus) {
    var cv = mkCanvas(host, 1.8);
    function draw() {
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h;
      ctx.fillStyle = "rgba(255,255,255,.03)";
      ctx.fillRect(0, 0, w, h);
      txt(ctx, "无独立画面", w / 2, h / 2 - 8, C.ink2, 14, "center", 700);
      txt(ctx, "这一条是参数与函数体，见下方表格与源码", w / 2, h / 2 + 14, C.ink3, 10, "center");
    }
    draw();
    return { note: "没有独立画面：它是整机管线的一部分，抽出来的是参数。", resize: draw };
  }

  /* --- 场景层 ------------------------------------------------------- */
  function oneEnv(host, mode, focus) {
    var inst = envPreview(host, mode);
    inst.note = "光影测试摆场，非原版关卡/远景/地面生成器。棚拍与参数展示不等于场景完整还原。 " + (inst.note || "");
    return inst;
  }

  function authoredItem(id) {
    var items = (window.AUTHORED_CATALOG || {}).items || [];
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    throw new Error("未登记原创资产：" + id);
  }
  function authoredOptions(id, input) {
    var schema = authoredItem(id).contract.options || {}, out = {};
    Object.keys(schema).forEach(function (key) { out[key] = schema[key].default; });
    Object.keys(input || {}).forEach(function (key) { out[key] = input[key]; });
    return out;
  }
  function authoredContext(id, input) {
    var opts = authoredOptions(id, input), n = Number(opts.seed || 0) >>> 0;
    var shared = new Set(), service = containerContext().mats, mats = {};
    ["get", "label", "decal", "number", "emissive"].forEach(function (method) {
      mats[method] = function () {
        var result = service[method].apply(service, arguments);
        var mat = result && result.material ? result.material : result;
        if (mat && mat.isMaterial) shared.add(mat);
        return result;
      };
    });
    var ctx = { THREE: T, kit: M["modeling-kit"], mats: mats, sharedMaterials: shared,
      rng: function () { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; } };
    return ctx;
  }
  function buildAuthored(id, input) {
    var entry = (window.AUTHORED_BUILDERS || {})[id];
    if (!entry || typeof entry.build !== "function") throw new Error("缺少原创构造器：" + id);
    var opts = authoredOptions(id, input);
    var root = entry.build(authoredContext(id, opts), opts);
    if (!root || !root.isObject3D) throw new Error("build 必须返回 THREE.Object3D");
    if (root.userData.assetId !== id || root.userData.authored !== true) throw new Error("模型缺少原创 assetId/authored 元数据");
    var vertices = 0;
    root.traverse(function (o) { if (o.isMesh) vertices += o.geometry && o.geometry.attributes.position ? o.geometry.attributes.position.count : 0; });
    if (!vertices) throw new Error("原创资产没有实际几何，不能用空组占位");
    return root;
  }
  function inspectAuthored(id, options) {
    return { ctx: authoredContext(id, options),
      build: function (opts) { return buildAuthored(id, opts || options); },
      inspect: function (root) {
        var box = new T.Box3().setFromObject(root), vertices = 0, triangles = 0;
        root.traverse(function (o) { if (o.isMesh) { vertices += o.geometry.attributes.position.count;
          triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } });
        return { vertices: vertices, triangles: triangles, min: box.min.toArray(), max: box.max.toArray() };
      } };
  }
  function oneAuthored(host, mode, focus) {
    var id = focus.asset, item = authoredItem(id), opts = authoredOptions(id, focus.options), body, wire;
    var v = View3D(host, { fov: 34, yaw: 0.7, pitch: 0.3, ratio: 1.6, minDist: 0.3, maxDist: 80, msaa: mode === "full" });
    studio(v.scene); ground(v.scene, 40, 0x141a22);
    var clay = new T.MeshStandardMaterial({ color: 0xaab8c6, roughness: 0.72, side: T.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    v.track(clay);
    var display = 0, playing = false, raf = null, last = 0, status;
    function release() {
      if (body) {
        v.scene.remove(body);
        if (typeof body.userData.dispose === "function") body.userData.dispose();
        body.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          var m = o.userData.sourceMaterial || o.material;
          (Array.isArray(m) ? m : [m]).forEach(function (a) {
            if (a && a !== clay && !(a.userData && a.userData.previewShared)) a.dispose();
          });
        });
      }
      if (wire) { v.scene.remove(wire); wire.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
      body = wire = null;
    }
    function sync() {
      if (!body || !wire) return;
      body.updateMatrixWorld(true);
      wire.children.forEach(function (l) { l.matrix.copy(l.userData.mesh.matrixWorld); });
    }
    function build(reframe) {
      release(); body = buildAuthored(id, opts); wire = new T.Group();
      var vertices = 0, tris = 0, count = 0;
      body.traverse(function (o) {
        if (!o.isMesh) return;
        o.userData.sourceMaterial = o.material;
        vertices += o.geometry.attributes.position.count;
        tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
        count++;
        if (display !== 0) {
          o.visible = !o.material.transparent;
          o.material = clay;
        }
        if (display === 2 && o.visible) {
          var line = new T.LineSegments(new T.WireframeGeometry(o.geometry), new T.LineBasicMaterial({ color: 0x253a50, transparent: true, opacity: 0.35 }));
          line.matrixAutoUpdate = false; line.userData.mesh = o; wire.add(line);
        }
      });
      v.scene.add(body); v.scene.add(wire); sync();
      v.canvas.dataset.authored = id;
      v.canvas.dataset.authoredOptions = JSON.stringify(opts);
      v.canvas.dataset.vertices = vertices; v.canvas.dataset.triangles = Math.round(tris);
      if (status) status.textContent = "原创构造 · " + count + " 网格 · " + vertices + " 顶点 · " + Math.round(tris) + " 三角 · 验收报告独立记录";
      if (reframe) v.frame(body, 1.2); else v.render();
      recordCamera();
    }
    function recordCamera() {
      v.canvas.dataset.authoredCamera = JSON.stringify({ fov: v.camera.fov, position: v.camera.position.toArray(),
        target: v.cam.target.toArray(), yaw: v.cam.yaw, pitch: v.cam.pitch, distance: v.cam.dist });
    }
    function tick(now) {
      if (!playing || !document.body.contains(host)) { raf = null; return; }
      if (body && body.userData.update) body.userData.update(last ? Math.min(0.05, (now - last) / 1000) : 0);
      last = now; sync(); v.render(); raf = requestAnimationFrame(tick);
    }
    if (mode === "full") {
      status = document.createElement("div"); status.className = "pv-note"; host.appendChild(status);
      var ctl = [
        { label: "显示", options: ["原材质", "纯灰几何", "结构线框"], on: function (i) { display = i; build(false); } },
        { label: "视角", options: ["整体", "正面", "背面", "俯视"], on: function (i) {
          v.cam.yaw = [0.7, 0, Math.PI, 0.7][i]; v.cam.pitch = i === 3 ? 1.1 : 0.3; v.frame(body, 1.2); recordCamera();
        } }
      ];
      Object.keys(item.contract.options || {}).forEach(function (key) {
        var spec = item.contract.options[key];
        if (!spec.values || !spec.values.length) return;
        ctl.push({ label: key, options: spec.values.map(String), value: Math.max(0, spec.values.indexOf(opts[key])),
          on: function (i) { opts[key] = spec.values[i]; build(true); } });
      });
      if (item.contract.dynamic) ctl.push({ label: "动作", options: ["播放", "暂停", "重置"], on: function (i) {
        playing = i === 0;
        if (i === 2 && body.userData.reset) { body.userData.reset(); sync(); v.render(); }
        if (playing && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      } });
      controls(host, ctl);
    }
    build(true);
    return { note: "原创设计按自身设计契约与可信参考验收，不冒用原版零误差证据。几何、运行、视觉与整机标准分别记录；当前为网页 catalog 棚拍。",
      resize: function () { sync(); v.render(); }, dispose: function () { playing = false; if (raf) cancelAnimationFrame(raf); release(); v.dispose(); } };
  }

  var KIND = {
    authored: oneAuthored,
    sphere: oneMaterial,
    prop: oneProp,
    geo: oneGeo,
    decal: oneDecal,
    sfx: oneSfx,
    fx: oneFx,
    spring: oneSpring,
    quality: oneQuality,
    chart: oneNum,
    env: oneEnv,
    weapon: weaponPreview,
    spec: oneSpec,
    actor: oneActor
  };

  var LIVE = [];

  /* kind 只是内部标识，不来自用户输入；仍然过一遍，避免拼字符串时出岔子 */
  function esc0(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    }).slice(0, 40);
  }

  function mount(host, item, mode) {
    if (!host || !item) return null;
    var fn = KIND[item.kind];
    host.innerHTML = "";
    if (!fn) {
      /* 以前这里静默退回 oneSpec，页面看着"正常"其实没画东西。现在直接报错。 */
      host.innerHTML = '<div class="pv-fail">没有给 kind=' + esc0(item.kind) + " 配预览函数</div>";
      return null;
    }
    /* 缩略图烘 512，详情页烘 1024（原版 quality.tex 的常用档） */
    BAKE_TEX = mode === "thumb" ? 512 : 1024;
    var stage = document.createElement("div");
    stage.className = "pv-stage";
    host.appendChild(stage);
    var inst = null;
    try {
      inst = fn(stage, mode || "full", item.focus || {});
    } catch (e) {
      stage.innerHTML = '<div class="pv-fail">预览起不来：' + (e && e.message ? e.message : e) + "</div>";
      return null;
    }
    if (!inst) return null;

    if (inst.note) {
      var note = document.createElement("p");
      note.className = "pv-note";
      note.textContent = inst.note;
      host.appendChild(note);
    }
    var rec = { host: host, inst: inst };
    LIVE.push(rec);

    if (window.ResizeObserver) {
      try {
        rec.ro = new ResizeObserver(function () {
          clearTimeout(rec.tm);
          rec.tm = setTimeout(function () {
            if (!document.body.contains(host)) return;
            try { inst.resize && inst.resize(); } catch (e) {}
          }, 90);
        });
        rec.ro.observe(host);
      } catch (e) {}
    }
    requestAnimationFrame(function () {
      try { inst.resize && inst.resize(); } catch (e) {}
    });
    return rec;
  }

  function mountWall(host, items) {
    host.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "pv-wall";
    host.appendChild(grid);
    (items || []).forEach(function (it) {
      var cell = document.createElement("a");
      cell.className = "pv-tile";
      cell.href = "#/a/" + it.id;

      var frame = document.createElement("div");
      frame.className = "pv-frame";
      cell.appendChild(frame);

      var cap = document.createElement("div");
      cap.className = "pv-cap";
      var b = document.createElement("b");
      b.textContent = it.name;
      var sp = document.createElement("span");
      sp.textContent = it.cat + " · " + it.en;
      cap.appendChild(b);
      cap.appendChild(sp);
      cell.appendChild(cap);

      grid.appendChild(cell);
      setTimeout(function () {
        try { mount(frame, it, "thumb"); } catch (e) {}
      }, 0);
    });
    return grid;
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      LIVE.forEach(function (r) {
        if (!document.body.contains(r.host)) return;
        try { r.inst.resize && r.inst.resize(); } catch (e) {}
      });
    }, 180);
  });

  window.PREVIEWS = {
    authoredContext: authoredContext,
    inspectAuthored: inspectAuthored,
    has: function (kind) { return !!KIND[kind]; },
    mount: mount,
    mountWall: mountWall,
    clear: function () {
      LIVE.forEach(function (r) {
        try { r.inst.dispose && r.inst.dispose(); } catch (e) {}
        try { r.ro && r.ro.disconnect(); } catch (e) {}
      });
      LIVE.length = 0;
    },
    note3d: function () { return gl() ? "WebGL · three r" + (T.__revision || "?") : "WebGL 不可用"; }
  };
})();
