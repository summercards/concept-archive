/* 代码资产库 · 前端路由与渲染
   ---------------------------------------------------------------
   数据来自 assets/data.js（window.DB）：逐件管理条目，10 个分类；登记状态与实现状态分开。
   每条资产自带 kind，预览由 previews.js 按 kind 分派。
*/
(function () {
  "use strict";

  var DB = window.DB || { items: [], cats: [], meta: {} };
  var AUTHORED = window.AUTHORED_CATALOG || { items: [], cats: [] };
  var ITEMS = (DB.items || []).concat(AUTHORED.items || []);
  var CATS = (DB.cats || []).concat((AUTHORED.cats || []).filter(function (c) { return c.n > 0; }));
  var META = DB.meta || {};
  var BY = {};
  ITEMS.forEach(function (i) { BY[i.id] = i; });

  var state = { q: "", cat: "ALL", sub: "ALL" };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var toastT = null;
  function toast(msg) {
    var t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("on"); }, 1600);
  }

  function copy(text) {
    var done = function () { toast("已复制"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); });
    } else fallback(text);
  }
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("已复制"); } catch (e) { toast("复制失败"); }
    document.body.removeChild(ta);
  }

  function hl(src) {
    var out = esc(src);
    out = out.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
    out = out.replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="tok-str">$1</span>');
    out = out.replace(/\b(-?\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
    return out;
  }

  function matches(it) {
    if (state.cat !== "ALL" && it.cat !== state.cat) return false;
    if (state.sub !== "ALL" && it.sub !== state.sub) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    var hay = [it.id, it.name, it.en, it.sub, it.summary, it.anchor]
      .concat((it.params || []).map(function (p) { return p.join(" "); }))
      .join(" ").toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }

  /* ------------------------------------------------------------ 侧栏 */
  function renderNav() {
    var list = ITEMS.filter(matches);
    var html = "";
    var curId = (function () {
      var m = /^#\/a\/(.+)$/.exec(location.hash);
      if (!m) return null;
      try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
    })();
    CATS.forEach(function (c) {
      var sub = list.filter(function (i) { return i.cat === c.id; });
      if (!sub.length) return;
      html += '<div class="nav-group"><span>' + esc(c.name) + "</span><b>" + sub.length + "</b></div>";
      sub.forEach(function (it) {
        /* 精确比对：前缀匹配会让 matf.glass 在打开 matf.glass_dirty 时一起点亮 */
        var on = curId === it.id;
        html += '<a class="nav-item' + (on ? " on" : "") + '"' +
          (on ? ' aria-current="page"' : "") + ' href="#/a/' + it.id + '">' +
          '<i class="nav-dot" style="background:var(' + c.color + ')"></i>' +
          "<span>" + esc(it.name) + "</span>" +
          '<em class="nav-id">' + esc(it.en) + "</em></a>";
      });
    });
    $("#nav").innerHTML = html || '<div class="empty" style="padding:20px 12px">没有匹配的资产</div>';
    /* 261 条一屏放不下：把当前项滚进视野，但只在它本来就不可见时滚（block:"nearest"） */
    var cur = $("#nav .nav-item.on");
    if (cur) requestAnimationFrame(function () { if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" }); });
    $("#navCount").textContent = list.length + " / " + ITEMS.length;
    $("#railStat").innerHTML = "资产 <b>" + list.length + "</b> / " + ITEMS.length +
      '<br><span style="color:var(--ink-3)">' + CATS.length + " 类 · " +
      META.counts.modules + " 个源模块</span>";
  }

  function renderFilter() {
    var html = '<button class="chip" data-cat="ALL" aria-pressed="' + (state.cat === "ALL") + '">ALL ' + ITEMS.length + "</button>";
    CATS.forEach(function (c) {
      html += '<button class="chip" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' +
        c.id + " " + c.n + "</button>";
    });
    $("#typeFilter").innerHTML = html;
    $$("#typeFilter .chip").forEach(function (b) {
      b.onclick = function () { state.cat = b.dataset.cat; state.sub = "ALL"; renderFilter(); renderNav(); route(); };
    });

    var cur = CATS.filter(function (c) { return c.id === state.cat; })[0];
    var subs = cur ? cur.subs : [];
    var th = "";
    if (subs.length > 1) {
      th += subs.map(function (s) {
        return '<button class="chip tag' + (state.sub === s.name ? " reset" : "") + '" data-sub="' + esc(s.name) + '">' +
          esc(s.name) + " <i>" + s.n + "</i></button>";
      }).join("");
      th += '<button class="chip tag reset" data-sub="ALL">全部</button>';
    }
    $("#tagFilter").innerHTML = th;
    $$("#tagFilter .chip").forEach(function (b) {
      b.onclick = function () { state.sub = b.dataset.sub; renderFilter(); renderNav(); route(); };
    });
  }

  /* ------------------------------------------------------------ 概览 */
  function stat(n, label) {
    return '<div class="stat"><b>' + n + "</b><span>" + label + "</span></div>";
  }

  var WALL = ["matf.rust", "mat.paint_red", "prop.container40", "geo.metricBox",
    "sfx.rifle_shot", "scene.backdrop", "weapon.pac9", "fx.bloom", "mat.chainlink"];

  function renderOverview() {
    var v = META.verify || {};
    var c = META.counts || {};
    var html = '<div class="kicker">代码资产库 / v2 · 逐件独立</div>' +
      "<h1>" + ITEMS.length + " 件资产，<br>没有一件是导入的</h1>" +
      '<p class="lede">源工程是一个 1.4 MB 的单文件第一人称射击：模型、贴图、光影、音效全部在运行时由代码算出来——' +
      "没有一个 .glb、没有一张 .png、没有一段 .wav。" +
      "这里登记 <strong>" + (DB.items || []).length + " 个原版管理条目</strong>，另有 <strong>" + (AUTHORED.items || []).length + " 个原创资产</strong>。每个材质族、每个材质实例、每张贴花、每件道具、" +
      "每条音效都单独成条，可以单独点开看它自己的参数与源码锚点。</p>";

    html += '<p class="lede" style="border-left:3px solid var(--sun);padding-left:14px">' +
      '<strong>登记齐全 ≠ 实现还原。</strong>36 种道具现已接入原版专用构造器，支持纯灰/线框和关键变体；' +
      '结构对照与整机呈现分开验收。角色、场景、音效仍有仅参数展示或未接入部分。' +
      '<a href="#/alignment">查看完整对标条件与真实进度 →</a>　<a href="#/authoring">制作新的代码资产 →</a></p>';
    html += '<div class="stats">' +
      stat(ITEMS.length, "件独立资产") +
      stat(c.families + " / " + c.instances, "材质族 / 实例") +
      stat(c.props + " / " + c.decals, "件道具 / 张贴花") +
      stat(v.passed + "/" + (v.passed + v.failed), "项比对通过") +
      "</div>";

    html += '<div class="verdicts">' +
      '<div class="vcard good"><h3><i></i>可以直接拿走</h3>' +
      "<p>纯数据或纯函数，拷走即用，换引擎也能带上。</p>" +
      "<ul><li>材质族与实例 " + (c.families + c.instances) + " 条</li>" +
      "<li>道具台账 " + c.props + " 件 · 贴花 " + c.decals + " 张</li>" +
      "<li>音效配方 " + c.recipes + " 条</li></ul></div>" +
      '<div class="vcard mid"><h3><i></i>要带壳搬</h3>' +
      "<p>逻辑能搬，但要给它最小宿主：THREE、WebGL、音频上下文。</p>" +
      "<ul><li>几何原语 7 个 → 需 THREE</li><li>材质烘焙器 → 需 WebGL</li>" +
      "<li>场景层 3 个 → 需渲染器</li></ul></div>" +
      '<div class="vcard bad"><h3><i></i>只到参数层</h3>' +
      "<p>产物由整机管线生成，抽出的是参数与函数体，不是成品。</p>" +
      "<ul><li>音效：当前只接配方，DSP 与播放宿主待恢复</li><li>后期：需要深度/历史 RT 与合成宿主</li>" +
      "<li>场景层是整体生成器</li></ul></div>" +
      "</div>";

    if (window.PREVIEWS) {
      html += "<h2>随手挑九件 <small>原版构造 / 参数图 / 尺寸占位分开标注</small></h2>";
      html += '<div id="pvWall"></div>';
      html += '<p style="font-size:12.5px;color:var(--ink-3);margin:10px 0 0">' +
        "点任意一格进它自己的页面：参数、源码锚点、以及可以拖的预览。</p>";
    }

    html += "<h2>分类 <small>按类型切</small></h2><div class='cards'>";
    CATS.forEach(function (cc) {
      html += '<a class="card" href="#/c/' + cc.id + '">' +
        '<div class="card-top"><span class="type" style="color:var(' + cc.color + ')">' + cc.id + "</span>" +
        '<span style="font-family:var(--mono);font-size:10.5px;color:var(--ink-3)">' + cc.n + " 件</span></div>" +
        "<h3>" + esc(cc.name) + "</h3><p>" + esc(cc.desc) + "</p>" +
        '<div class="card-foot">' + cc.subs.map(function (s) { return esc(s.name) + " " + s.n; }).join(" · ") + "</div></a>";
    });
    html += "</div>";

    var mods = META.modules || [];
    var max = Math.max.apply(null, mods.map(function (m) { return m.kb; }));
    html += "<h2>源工程模块体量 <small>按命名空间切分 · KB</small></h2><div class='bars'>";
    mods.forEach(function (m) {
      html += '<div class="bar-row"><span>' + esc(m.role) + '</span><span class="bar-track">' +
        '<span class="bar-fill" style="width:' + (m.kb / max * 100).toFixed(1) + '%"></span></span>' +
        '<span class="bar-val">' + m.kb.toFixed(0) + "</span></div>";
    });
    html += "</div>";

    $("#main").innerHTML = html;
    if (window.PREVIEWS) {
      var host = $("#pvWall");
      var picks = WALL.map(function (id) { return BY[id]; }).filter(Boolean);
      if (host) window.PREVIEWS.mountWall(host, picks);
    }
  }

  /* ------------------------------------------------------------ 分类页 */
  function renderCat(cid) {
    var c = CATS.filter(function (x) { return x.id === cid; })[0];
    if (!c) { $("#main").innerHTML = '<div class="empty">没有这个分类：' + esc(cid) + "</div>"; return; }
    var list = ITEMS.filter(function (i) { return i.cat === cid && matches(i); });
    var html = '<a class="back" href="#/">← 回到总览</a>' +
      '<div class="kicker">' + c.id + " · " + esc(c.name) + "</div>" +
      "<h1>" + esc(c.name) + ' <em style="font-family:var(--mono);font-size:15px;color:var(--ink-3);font-style:normal">' +
      c.n + " 件</em></h1>" +
      '<p class="lede">' + esc(c.desc) + "</p>";

    html += '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      "<th>资产</th><th>子类</th><th>要点</th><th>锚点</th></tr></thead><tbody>";
    list.forEach(function (it) {
      var p = (it.params || []).slice(0, 2).map(function (x) { return x[0] + " " + x[1]; }).join(" · ");
      html += '<tr><td><a href="#/a/' + it.id + '">' + esc(it.name) +
        ' <span style="font-family:var(--mono);font-size:10.5px;color:var(--ink-3)">' + esc(it.en) + "</span></a></td>" +
        "<td>" + esc(it.sub) + "</td><td>" + esc(p || it.summary) + "</td>" +
        '<td style="font-family:var(--mono);font-size:10.5px;color:var(--ink-3)">' + esc(it.anchor) + "</td></tr>";
    });
    html += "</tbody></table></div>";
    $("#main").innerHTML = html;
  }

  /* ------------------------------------------------------------ 详情 */
  function metaCell(k, v, mono) {
    return "<div><dt>" + esc(k) + "</dt><dd" + (mono ? ' class="mono"' : "") + ">" + esc(v) + "</dd></div>";
  }

  function renderDetail(id) {
    var it = BY[id];
    if (!it) { $("#main").innerHTML = '<div class="empty">没有这件资产：' + esc(id) + "</div>"; return; }
    var cat = CATS.filter(function (c) { return c.id === it.cat; })[0] || { color: "--ink", name: it.cat };
    var idx = ITEMS.indexOf(it);
    var prev = ITEMS[idx - 1], next = ITEMS[idx + 1];

    var html = '<a class="back" href="#/c/' + it.cat + '">← ' + esc(cat.name) + "</a>" +
      '<div class="d-head"><span class="type" style="color:var(' + cat.color + ')">' + it.cat + "</span>" +
      '<span class="d-tags">' + esc(it.sub) + "</span>" +
      '<span class="d-tags" style="font-family:var(--mono);font-size:10.5px;color:var(--ink-3)">' + esc(it.anchor) + "</span></div>" +
      "<h1>" + esc(it.name) + "<em>" + esc(it.en) + "</em></h1>" +
      '<p class="summary">' + esc(it.summary) + "</p>";

    var previewLabel = it.kind === "authored" ? "原创代码资产 · 验收状态见契约与独立报告" : it.kind === "prop" ?
      (/^container(?:20|40|40hc)$/.test(it.focus.prop) ? "原版 M3/zA 真实构造" : "原版 Yg 专用构造 · 非占位盒") :
      (it.kind === "decal" ? "原版 canvas 绘制" : "按条目类型展示；参数图不等于成品");
    html += '<div class="pv-wrap"><div class="pv-head"><b>预览</b><span>' + previewLabel + '</span>' +
      '<em id="pvBadge">' + (window.PREVIEWS ? window.PREVIEWS.note3d() : "") + "</em></div>" +
      '<div id="pvHost"></div></div>';

    if (it.params && it.params.length) {
      html += "<h2>参数 <small>" + it.params.length + " 项</small></h2>" +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>字段</th><th>值</th><th>说明</th></tr></thead><tbody>';
      it.params.forEach(function (p) {
        html += "<tr><td>" + esc(p[0]) + '</td><td style="font-family:var(--mono)">' + esc(p[1]) +
          "</td><td>" + esc(p[2] || "") + "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    if (it.code) {
      html += "<h2>源码 <small>" + esc(it.anchor) + "</small></h2>" +
        '<div class="code"><div class="code-head"><span class="code-name">' + esc(it.en) + "</span>" +
        '<span class="code-actions"><button class="btn" id="cpBtn">复制</button></span></div>' +
        '<div class="code-body"><pre>' + hl(it.code) + "</pre></div></div>";
    }

    html += '<div class="related"><b>相邻</b>' +
      (prev ? '<a href="#/a/' + prev.id + '">← ' + esc(prev.name) + "</a>" : "") +
      (next ? '<a href="#/a/' + next.id + '">' + esc(next.name) + " →</a>" : "") +
      '<a href="#/c/' + it.cat + '">' + esc(cat.name) + " 全部 " + cat.n + " 件</a></div>";

    $("#main").innerHTML = html;
    var cp = $("#cpBtn");
    if (cp) cp.onclick = function () { copy(it.code); };
    if (window.PREVIEWS) {
      var host = $("#pvHost");
      if (host) window.PREVIEWS.mount(host, it, "full");
    }
  }

  /* ------------------------------------------------------------ 矩阵 / 覆盖 */
  function renderMatrix() {
    var cover = META.cover || [];
    var rows = cover.map(function (c) {
      return "<tr><td>" + esc(c.src) + "</td><td>" + c.n + "</td><td>" + c.got + "</td><td>" +
        (c.ok ? '<span class="mark-y">✓</span>' : '<span class="mark-n">✗</span>') + "</td><td>" + esc(c.note) + "</td></tr>";
    }).join("");
    var html = '<a class="back" href="#/">← 回到总览</a>' +
      '<div class="kicker">覆盖核对</div>' +
      "<h1>原工程里的每张表，都对上了</h1>" +
      '<p class="lede">判断「有没有漏」不能靠感觉。这张表把原工程里每一个注册表列在左边，右边是收进来的条目数。' +
      "数字不相等就是登记漏项；数字相等也不证明画面已还原。36 种道具已接入真实构造，但角色/场景/音频和整机渲染仍需按独立门槛恢复。<a href=\"#/alignment\">完整对标条件 →</a></p>" +
      '<div class="matrix-wrap"><table class="matrix"><thead><tr>' +
      "<th>原工程注册表</th><th>源码条目</th><th>本库</th><th>齐</th><th>粒度</th></tr></thead><tbody>" +
      rows + "</tbody></table></div>" +
      '<div class="legend"><span><span class="mark-y">✓</span> 已逐条收齐</span></div>';

    html += "<h2>分类明细 <small>共 " + ITEMS.length + " 件</small></h2>" +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>分类</th><th>子类</th><th>件数</th></tr></thead><tbody>';
    CATS.forEach(function (c) {
      c.subs.forEach(function (s) {
        html += "<tr><td>" + esc(c.name) + "</td><td>" + esc(s.name) + "</td><td>" + s.n + "</td></tr>";
      });
    });
    html += "</tbody></table></div>";

    html += "<h2>没有单独成条的部分 <small>以及为什么</small></h2>" +
      '<div class="prose"><ul>' +
      "<li><b>three.js 本体</b>（696 KB）：引擎，不是资产。</li>" +
      "<li><b>音效波形生成器</b>：57 条配方已登记；波形由绑在音频上下文上的振荡器与噪声源合成，当前库未接入试听。</li>" +
      "<li><b>后期 pass 的 GLSL</b>：13 个效果的 uniform 抽全了；shader 绑在合成链的 RT 上，脱离整机没有独立画面。</li>" +
      "<li><b>关卡 / 远景 / 地面</b>：三个模块是整体生成器（循环摆放 + 噪声），产物是整片港区而不是离散资产，" +
      "所以按「场景层」收了 3 条。</li>" +
      "<li><b>敌人部件、武器零件</b>：是角色/武器条目内部的建模细节，不能单独替换。</li>" +
      "</ul></div>";
    $("#main").innerHTML = html;
  }

  /* ------------------------------------------------------------ 说明 */
  function renderAbout() {
    var s = META.source || {}, v = META.verify || {};
    $("#main").innerHTML =
      '<a class="back" href="#/">← 回到总览</a>' +
      '<div class="kicker">方法与边界</div>' +
      "<h1>怎么拆的，怎么验的</h1>" +
      '<div class="prose">' +
      "<h3>1. 原文件是单个 IIFE，但业务代码自己就有模块边界</h3>" +
      "<p>每个模块先建命名空间对象，再用 <code>br(ns,{…})</code> 挂导出。扫出 " + (META.counts.modules) +
      " 个命名空间（three / render / mats / props / level / backdrop / ground / fx / weapon / enemies）。" +
      "命名空间有助于导航，但独立运行还需要抽全构造函数和依赖，不能把尺寸表或函数片段冒充已还原模型。</p>" +
      "<h3>2. 逐件，不聚合</h3>" +
      "<p>这一版把每个注册表都摊开成条目：材质族 " + META.counts.families + " 条、材质实例 " + META.counts.instances +
      " 条、贴花 " + META.counts.decals + " 张、道具 " + META.counts.props + " 件、音效 " + META.counts.recipes +
      " 条、弹簧 " + META.counts.springs + " 根……每一条都有自己的一页：参数、源码锚点、预览。" +
      "「覆盖核对」页把原工程的注册表和本库条目数并排放，数字不等就是漏了。</p>" +
      "<h3>3. 贴图不是图片，是 GLSL 烘出来的</h3>" +
      "<p>材质族的 27 个函数在 GPU 上烘出 albedo / ORM / height 三张图，再由 height 求法线，" +
      "最后把湿润、脏污、三平面补丁注入标准材质。这套管线整个搬了出来（第 10 个模块 <code>material-baker</code>），" +
      "所以材质球上的纹理是现场算的，不是贴的图。</p>" +
      "<h3>4. 用原件验，不用自己验</h3>" +
      "<p>被改名的函数（<code>p3</code> → <code>metricBox</code> 等）都从原文件按字节切出来，配上别名映射，" +
      "和新写的实现跑同一组输入逐顶点比位置 / 法线 / UV / 索引；数值表逐字段比；材质的 GLSL 逐字比。当前 " +
      v.passed + " 项通过，但这些不是整库视觉验收。集装箱另用未改原版 IIFE 的 M3 输出独立对比，不能只拿 metricBox 测试代替。</p>" +
      "<h3>5. 源工程</h3>" +
      '<div class="meta" style="margin-top:14px">' +
      metaCell("文件", s.file || "", true) +
      metaCell("规模", (s.lines || 0) + " 行 / " + (s.mb || 0) + " MB", true) +
      metaCell("引擎", s.engine || "") +
      metaCell("哈希", (s.sha256 || "").slice(0, 16) + "…", true) +
      "</div>" +
      "<h3>6. 预览为什么和游戏里不一样</h3>" +
      "<p>差距不在画质设置，在管线长度。游戏内是几何 → 自定义着色 → 光照与阴影 → 后期合成 → 屏幕五段串联；" +
      "36 种道具现已保留原版实体构造，棚拍环境光与后期仍是宿主近似；这不代表材质 GPU 输出或整机呈现已经等价。有些资产（音效波形、后期 pass）" +
      "本来就是整机的一部分，抽出来的是参数，页面上会明说。</p>" +
      "<h3>7. 复现</h3><ul>" +
      "<li><code>python3 tools/inventory.py</code> 盘点 → <code>build/inventory.json</code></li>" +
      "<li><code>python3 tools/bundle_items.py</code> 打包 → <code>assets/data.js</code></li>" +
      "<li><code>node build/verify.mjs</code> " + v.passed + " 项保真比对 + 覆盖核对</li>" +
      "<li><code>python3 tools/build_modules.py</code> 把模块内联成 <code>assets/modules.js</code></li>" +
      "</ul></div>";
  }

  function renderAlignment() {
    var audit = window.ALIGNMENT_AUDIT;
    var gates = audit && audit.gates || [];
    var html = '<a class="back" href="#/">← 回到资产库</a><div class="kicker">完整对标 / 真实进度</div>' +
      '<h1>能复刻，不等于已复刻完成</h1><p class="lede">每个组件必须有真实实现、完整依赖和对应证据。' +
      '36 种道具已接专用构造；角色、场景、DSP 音频和原版渲染仍需逐类恢复。<br>' +
      '<a href="outputs/full-alignment-audit.html">打开全组件条件矩阵、36 件道具状态与验收报告 →</a></p>';
    html += '<div class="prose"><h3>所有组件共用的六道门槛</h3><ol>' +
      '<li>来源完整：源文件 hash、真实构造/更新入口、依赖与导出可追溯。</li>' +
      '<li>结构完整：几何、UV、材质槽、层级、碰撞、挂点和动态子树不能缺。</li>' +
      '<li>宿主完整：锁原版 r180、WebGL2/MRT、ShaderChunk、PMREM、双相机、深度、曝光与输出。</li>' +
      '<li>行为完整：实际变体、seed、动作时序、数值提交与 FX/声音/HUD 使用同一状态。</li>' +
      '<li>生命周期完整：create/update/reset/dispose、暂停恢复、缓存与失败检测。</li>' +
      '<li>证据完整：数据/几何、GPU 纹理、动态采样、同机位画面；声音必须另有录音与实际听音。</li></ol>' +
      '<h3>两种不同的可复刻性</h3><p>原代码路线可以保留算法并整体携带最小宿主；跨引擎路线需要映射着色器、骨架/IK、物理与 DSP，' +
      '不能用通用 PBR 和默认后期宣称等价。商业分发还需单独核查权利，不从持有源码推定授权。</p></div>';
    $("#main").innerHTML = html;
  }

  function renderAuthoring() {
    $("#main").innerHTML = '<a class="back" href="#/">← 回到资产库</a><div class="kicker">原创资产 / CODE ASSET AUTHORING</div>' +
      '<h1>新资产也走完整制作链</h1><p class="lede">使用 code-asset-authoring 创建原创程序化模型：先写尺寸和结构契约，再调用米制建模、程序材质、贴花与动态接口。' +
      '原创源码保存在 assets/authored，独立于原版提取数据，重新盘点不会覆盖。</p>' +
      '<div class="prose"><h3>制作入口</h3><p>“使用 code-asset-authoring，在当前代码资产库制作一个双门维修柜，' +
      '1.2×1.8×0.5m，带真实内腔、层板、门轴、锁把和开合变体，并完成入库与验收。”</p>' +
      '<h3>制作流程</h3><ol><li>明确用途、尺寸、结构、表面、碰撞、挂点与变体契约。</li>' +
      '<li>使用 ctx.kit 生成真实几何，ctx.mats 生成材质与贴花，ctx.rng 保持可重建。</li>' +
      '<li>在 authored/registry.json 登记，构建 authored.js，由此页独立预览。</li>' +
      '<li>检查结构、UV、确定性、动态与资源所有权，再采集三角度/灰模/线框并实际看图验收。</li></ol>' +
      '<p>当前目标为网页 catalog 检查标准，不冒称原版 r180 整机等价；原创设计按设计契约验收，不用原版逐点零误差代替原创质量判断。</p>' +
      '<p><a href="outputs/new-asset-authoring-guide.html">打开完整使用指南、能力表与命令 →</a></p></div>';
  }

  /* ------------------------------------------------------------ 路由 */
  function route() {
    if (window.PREVIEWS) window.PREVIEWS.clear();
    var h = location.hash.replace(/^#/, "") || "/";
    var m;
    if ((m = /^\/a\/(.+)$/.exec(h))) renderDetail(decodeURIComponent(m[1]));
    else if ((m = /^\/c\/(.+)$/.exec(h))) renderCat(m[1]);
    else if (h === "/matrix") renderMatrix();
    else if (h === "/about") renderAbout();
    else if (h === "/alignment") renderAlignment();
    else if (h === "/authoring") renderAuthoring();
    else renderOverview();
    window.scrollTo(0, 0);
  }

  function boot() {
    renderFilter();
    renderNav();
    route();
    window.addEventListener("hashchange", function () { renderNav(); route(); });
    var q = $("#q");
    q.addEventListener("input", function () {
      state.q = q.value;
      renderNav();
    });

    /* 窄屏时资产清单默认收起来，否则 261 条会把正文顶到三屏之后 */
    var box = $("#navbox"), btn = $("#navboxBtn");
    var narrow = window.matchMedia("(max-width: 920px)");
    function setOpen(v) {
      if (!box) return;
      box.dataset.open = v ? "1" : "0";
      if (btn) btn.setAttribute("aria-expanded", v ? "true" : "false");
    }
    if (box) {
      setOpen(!narrow.matches);
      if (narrow.addEventListener) {
        narrow.addEventListener("change", function (e) { setOpen(!e.matches); });
      }
      if (btn) btn.addEventListener("click", function () { setOpen(box.dataset.open !== "1"); });
      /* 点中条目就收起，别让清单挡着详情页 */
      box.addEventListener("click", function (e) {
        if (narrow.matches && e.target.closest && e.target.closest(".nav-item")) setOpen(false);
      });
    }

    var cover = META.cover || [];
    $("#topMeta").innerHTML = '<a class="badge" href="#/matrix" style="text-decoration:none">' +
      "<i></i>覆盖 " + cover.filter(function (c) { return c.ok; }).length + " / " + cover.length + "</a>";
  }

  boot();
})();
