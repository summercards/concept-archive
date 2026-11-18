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

  /* --- 道具：一件 --------------------------------------------------- */
  function oneProp(host, mode, focus) {
    var PL = M["props-ledger"], MK = M["modeling-kit"], ML = M["material-ledger"];
    var p = PL.PROP_LEDGER[focus.prop];
    if (!p) throw new Error("台账里没有 " + focus.prop);
    var v = View3D(host, {
      fov: 32, dist: 6, yaw: 0.68, pitch: 0.26, target: [0, p.size[1] * 0.5, 0],
      ratio: 1.6, minDist: 1, maxDist: 60, msaa: mode === "full"
    });
    studio(v.scene);
    var gm = ground(v.scene, Math.max(12, p.size[0] * 4), 0x141a22);
    gm.material = painted(ML, "concrete_dirty");
    gm.material.roughness = 1;
    gm.material.envMapIntensity = 0;
    var guv = gm.geometry.attributes.uv;
    for (var k = 0; k < guv.count; k++) guv.setXY(k, guv.getX(k) * 40, guv.getY(k) * 40);
    guv.needsUpdate = true;

    var geo = MK.metricBox(p.size[0], p.size[1], p.size[2],
      Math.min(0.02, Math.min(p.size[0], p.size[1], p.size[2]) * 0.06), "bottom");
    var mat = painted(ML, p.material);
    var mesh = new T.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    v.scene.add(mesh);
    v.track(geo);

    /* 1.8 m 人形参照：只在新页面上标尺，不是资产 */
    var hm = new T.MeshStandardMaterial({ color: 0x51606f, roughness: 0.9 });
    var hg = MK.metricBox(0.46, 1.8, 0.26, 0.04, "bottom");
    var human = new T.Mesh(hg, hm);
    human.position.set(-p.size[0] * 0.5 - 1.2, 0, p.size[2] * 0.5 + 0.8);
    human.castShadow = true;
    v.scene.add(human);
    v.track(hg); v.track(hm);

    var box = new T.Box3();
    box.expandByObject(mesh);
    v.frame(box, 1.5);

    return {
      note: "尺寸 " + p.size.map(function (x) { return x.toFixed(2); }).join(" × ") + " m，直接来自台账；" +
        "几何由 modeling-kit 的 metricBox 按米生成，材质是 " + p.material + " 实例（贴图现烘）。旁边那根 1.8 m 的柱子是标尺。",
      resize: function () { v.render(); }
    };
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
    var cv = mkCanvas(host, 1.75);
    var BUS = { near: "#ffb86b", dry: "#7fd1a8", world: "#7fb8ff", music: "#c9a7ff", unset: "#6f7d8e" };

    function draw() {
      var s = fit(cv), ctx = s.ctx, w = s.w, h = s.h;
      var col = BUS[R.bus] || BUS.unset;
      var pad = 18;

      /* 顶部：名 + 总线 */
      txt(ctx, focus.sfx, pad, 24, C.ink, w < 420 ? 12 : 15, "left", 700);
      ctx.fillStyle = col + "26";
      roundRect(ctx, w - pad - 74, 12, 74, 20, 10);
      ctx.fillStyle = col;
      txt(ctx, R.bus, w - pad - 37, 26, col, 10, "center", 700);

      /* 峰值条 */
      var y0 = 54;
      txt(ctx, "PEAK", pad, y0, C.ink3, 9, "left", 600);
      ctx.fillStyle = "rgba(255,255,255,.07)";
      roundRect(ctx, pad + 44, y0 - 7, w - pad * 2 - 44, 7, 4);
      ctx.fillStyle = R.peak > 0.9 ? C.warn : col;
      roundRect(ctx, pad + 44, y0 - 7, (w - pad * 2 - 44) * Math.min(1, R.peak), 7, 4);
      txt(ctx, (R.peak * 100).toFixed(0) + "%", w - pad, y0, C.ink2, 9.5, "right");

      /* 层：n 条振荡器 */
      var ly = y0 + 26;
      txt(ctx, "层", pad, ly, C.ink3, 9, "left", 600);
      var n = R.n || 1;
      for (var i = 0; i < n; i++) {
        var bx = pad + 44 + i * ((w - pad * 2 - 44) / Math.max(4, n));
        ctx.fillStyle = col + (i === 0 ? "" : "88");
        roundRect(ctx, bx, ly - 8, Math.max(8, (w - pad * 2 - 44) / Math.max(4, n) - 5), 8, 3);
        ctx.fill();
      }

      /* 下方四格：并发 / 优先级 / 采样率 / 参考距离 */
      var gy = ly + 34, gw = (w - pad * 2) / 2, gh = (h - gy - pad) / 2;
      var cells = [
        ["同时发声", R.max == null ? "—" : R.max, "路"],
        ["优先级", R.pri == null ? "—" : R.pri, "抢占用"],
        ["采样率", R.sr === "ki" ? "44.1k" : R.sr === "Xn" ? "32k" : R.sr === "pl" ? "22.05k" : (R.sr || "—"), "Hz"],
        ["参考距离", R.ref == null ? "2D" : R.ref, R.ref == null ? "无 3D 衰减" : "米"]
      ];
      cells.forEach(function (c, i) {
        var cx = pad + (i % 2) * gw, cy = gy + Math.floor(i / 2) * gh;
        txt(ctx, c[0], cx, cy + 10, C.ink3, 9);
        txt(ctx, String(c[1]), cx, cy + 32, C.ink, w < 420 ? 16 : 20, "left", 700);
        txt(ctx, c[2], cx + (w < 420 ? 34 : 44), cy + 32, C.ink3, 9);
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
    return {
      note: "这是配方本身：总线、层数、峰值、并发上限、优先级、采样率。" +
        "波形由绑在音频上下文上的振荡器与噪声源合成，生成器没随页面打包，所以这里不放假的波形图。",
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
    var s = W.spring(kc[0], kc[1]);
    var cv = mkCanvas(host, 1.9);
    var pts = [], t = s, N = 260, dt = 1 / 240, maxV = 0;
    for (var i = 0; i < N; i++) {
      t = W.integrate(t, 1, dt);
      pts.push(t.x);
      maxV = Math.max(maxV, Math.abs(t.x));
    }
    function draw() {
      var f = fit(cv), ctx = f.ctx, w = f.w, h = f.h;
      var padL = 34, padR = 16, padT = 30, padB = 26;
      txt(ctx, key, padL, 20, C.ink, 12, "left", 700);
      txt(ctx, "k " + kc[0] + " · c " + kc[1], w - padR, 20, C.ink3, 10, "right");
      var y0 = padT, y1 = h - padB;
      line(ctx, padL, y1, w - padR, y1, "rgba(255,255,255,.12)");
      line(ctx, padL, y0, padL, y1, "rgba(255,255,255,.12)");
      txt(ctx, "1.0", padL - 6, y0 + 4, C.ink3, 8, "right");
      txt(ctx, "0", padL - 6, y1, C.ink3, 8, "right");
      var gw = (w - padL - padR) / (pts.length - 1);
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var x = padL + i * gw, y = y1 - Math.min(1.25, pts[i]) * (y1 - y0);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = C.sun;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      /* 1.0 参考线 */
      line(ctx, padL, y1 - (y1 - y0), w - padR, y1 - (y1 - y0), "rgba(255,255,255,.08)");
      txt(ctx, "260 步 @ 240 Hz", w - padR, h - 8, C.ink3, 8.5, "right");
    }
    draw();
    return {
      note: "用 weapon-tuning 的 spring(" + kc[0] + "," + kc[1] + ") 与 integrate() 按 240 Hz 积分 260 步，" +
        "输入是阶跃 1.0 —— 也就是"开一枪"之后这一根弹簧怎么回位。",
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
        var K = M["fx"] && M["fx"].KEYMAP;
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
      txt(ctx, focus.decal, w / 2, h / 2 - 6, C.ink2, w < 420 ? 12 : 15, "center", 700);
      txt(ctx, "256 × 256 · canvas 2D 绘制", w / 2, h / 2 + 16, C.ink3, 10, "center");
      txt(ctx, "绘制函数在原工程 mats 模块，未随页面打包", w / 2, h / 2 + 34, C.ink3, 9, "center");
    }
    draw();
    return {
      note: "贴花是 canvas 2D 一笔一笔画出来的（三角警示牌、弹孔、锈水痕…）。" +
        "这里没放替身图：函数体与参数在下方，预览等抽出绘制函数后再补。",
      resize: draw
    };
  }

  /* --- 角色 --------------------------------------------------------- */
  function oneActor(host, mode, focus) {
    if (focus.actor === "player") return playerPreview(host, mode);
    return aiPreview(host, mode);
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
  function oneEnv(host, mode) {
    return envPreview(host, mode);
  }

  var KIND = {
    sphere: oneMaterial,
    prop: oneProp,
    geo: oneGeo,
    decal: oneDecal,
    sfx: oneSfx,
    fx: oneFx,
    spring: oneSpring,
    quality: oneQuality,
    num: oneNum,
    env: oneEnv,
    weapon: weaponPreview,
    spec: oneSpec,
    actor: oneActor
  };

  var LIVE = [];

  function mount(host, item, mode) {
    if (!host || !item) return null;
    var fn = KIND[item.kind] || oneSpec;
    host.innerHTML = "";
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
    has: function (id) { return !!REG[id] || !!KIND[id]; },
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
