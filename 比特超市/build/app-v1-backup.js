/* 代码资产库 · 前端（无依赖，file:// 直接可开） */
(function () {
  "use strict";

  var DB = window.CODE_ASSET_DB;
  var META = DB.meta;
  var ASSETS = DB.assets;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var TYPE = {
    ENV: { label: "环境", color: "var(--env)", cn: "光影环境" },
    MAT: { label: "材质", color: "var(--mat)", cn: "材质账簿" },
    MODEL: { label: "模型", color: "var(--model)", cn: "模型台账" },
    GEO: { label: "几何", color: "var(--geo)", cn: "几何工具" },
    NUM: { label: "数值", color: "var(--num)", cn: "数值调参" },
    AUDIO: { label: "音频", color: "var(--audio)", cn: "音频配方" }
  };
  var ORDER = ["ENV", "MAT", "MODEL", "GEO", "NUM", "AUDIO"];

  var state = { q: "", type: "ALL", tags: {} };

  /* ------------------------------------------------------------ 工具 */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var KW = "const|let|var|function|return|if|else|for|while|of|in|new|class|export|import|default|throw|try|catch|typeof|instanceof|null|true|false|undefined|this|await|async|switch|case|break|continue|delete|void";

  function tokenize(s) {
    var re = new RegExp("(\\b(?:" + KW + ")\\b)|(\\b0x[\\da-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_$][\\w$]*)(?=\\s*\\()", "g");
    var out = "", last = 0, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index));
      if (m[1]) out += '<span class="tok-key">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-num">' + esc(m[2]) + "</span>";
      else out += '<span class="tok-fn">' + esc(m[3]) + "</span>";
      last = m.index + m[0].length;
    }
    return out + esc(s.slice(last));
  }

  function hlLine(line, st) {
    var out = "", i = 0, n = line.length;
    while (i < n) {
      if (st.block) {
        var k = line.indexOf("*/", i);
        if (k < 0) return out + '<span class="tok-com">' + esc(line.slice(i)) + "</span>";
        out += '<span class="tok-com">' + esc(line.slice(i, k + 2)) + "</span>";
        st.block = false; i = k + 2; continue;
      }
      var two = line.slice(i, i + 2);
      if (two === "//") return out + '<span class="tok-com">' + esc(line.slice(i)) + "</span>";
      if (two === "/*") { st.block = true; continue; }
      var ch = line[i];
      if (ch === '"' || ch === "'" || ch === "`") {
        var j = i + 1;
        while (j < n) {
          if (line[j] === "\\") { j += 2; continue; }
          if (line[j] === ch) { j++; break; }
          j++;
        }
        out += '<span class="tok-str">' + esc(line.slice(i, j)) + "</span>";
        i = j; continue;
      }
      var t = i;
      while (t < n) {
        var c2 = line[t];
        if (c2 === '"' || c2 === "'" || c2 === "`") break;
        if (c2 === "/" && (line[t + 1] === "/" || line[t + 1] === "*")) break;
        t++;
      }
      if (t === i) t++;
      out += tokenize(line.slice(i, t));
      i = t;
    }
    return out;
  }

  function codeHTML(src) {
    var st = { block: false };
    var lines = src.split("\n");
    var html = "";
    for (var i = 0; i < lines.length; i++) {
      html += '<div class="cl"><span class="ln">' + (i + 1) + '</span><span class="ct">' +
        (hlLine(lines[i], st) || "&nbsp;") + "</span></div>";
    }
    return html;
  }

  function hex(c) {
    var n = parseInt(c, 10);
    if (isNaN(n)) return null;
    return "#" + ((n >>> 0).toString(16).padStart(6, "0"));
  }

  function toast(msg) {
    var t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(t._tm);
    t._tm = setTimeout(function () { t.classList.remove("on"); }, 1500);
  }

  function copy(text) {
    if (navigator.clipboard && location.protocol !== "file:") {
      navigator.clipboard.writeText(text).then(function () { toast("已复制"); }, fallback);
    } else fallback();

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast("已复制"); }
      catch (e) { toast("复制失败，请手动选择"); }
      ta.remove();
    }
  }

  function download(name, text) {
    var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    toast("已下载 " + name);
  }

  function matches(a) {
    if (state.type !== "ALL" && a.type !== state.type) return false;
    var want = Object.keys(state.tags);
    for (var i = 0; i < want.length; i++) {
      if ((a.tags || []).indexOf(want[i]) < 0) return false;
    }
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    var hay = [a.id, a.name, a.en, a.type, a.summary, a.anchor, (a.tags || []).join(" "), a.verdict]
      .join(" ").toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function tagFreq() {
    var f = {};
    ASSETS.forEach(function (a) {
      (a.tags || []).forEach(function (t) { f[t] = (f[t] || 0) + 1; });
    });
    return f;
  }

  function tagChips(a, max) {
    return (a.tags || []).slice(0, max || 99).map(function (t) {
      var on = state.tags[t] ? ' class="tg on"' : ' class="tg"';
      return "<button" + on + ' data-tag="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");
  }

  /* ------------------------------------------------------------ 导航 */
  function renderNav() {
    var nav = $("#nav");
    var html = "";
    ORDER.forEach(function (t) {
      var list = ASSETS.filter(function (a) { return a.type === t && matches(a); });
      if (!list.length) return;
      html += '<div class="nav-group">' + t + " · " + TYPE[t].cn + "</div>";
      list.forEach(function (a) {
        var cur = location.hash === "#/a/" + a.id ? ' aria-current="page"' : "";
        html += '<a class="nav-item" href="#/a/' + a.id + '"' + cur + ">" +
          '<span class="nav-dot" style="color:' + TYPE[t].color + '"></span>' +
          "<span>" + esc(a.name) + "</span>" +
          '<span class="nav-id">' + a.grade + "</span></a>";
      });
    });
    nav.innerHTML = html || '<div class="nav-group">没有匹配项</div>';

    var shown = ASSETS.filter(matches).length;
    var nc = $("#navCount");
    if (nc) nc.textContent = shown + " / " + ASSETS.length;
    $("#railStat").innerHTML = "资产 " + shown + " / " + ASSETS.length +
      "<br>道具 " + META.counts.props + " · 材质 " + META.counts.instances +
      " · 音效 " + META.counts.recipes;
  }

  function renderFilter() {
    var wrap = $("#typeFilter");
    var counts = {};
    ASSETS.forEach(function (a) { counts[a.type] = (counts[a.type] || 0) + 1; });
    var html = '<button class="chip" data-t="ALL" aria-pressed="' + (state.type === "ALL") + '">ALL ' + ASSETS.length + "</button>";
    ORDER.forEach(function (t) {
      if (!counts[t]) return;
      html += '<button class="chip" data-t="' + t + '" aria-pressed="' + (state.type === t) + '">' + t + " " + counts[t] + "</button>";
    });
    wrap.innerHTML = html;
    wrap.onclick = function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      state.type = b.dataset.t;
      renderFilter();
      renderNav();
      if (location.hash === "#/" || location.hash === "") renderOverview();
    };
    renderTags();
  }

  /* 标签云：按出现次数排序，高频的排在前面（也就是"能不能搬"那几条判据） */
  function renderTags() {
    var wrap = $("#tagFilter");
    if (!wrap) return;
    var f = tagFreq();
    var list = Object.keys(f).sort(function (a, b) { return f[b] - f[a] || (a < b ? -1 : 1); });
    var active = Object.keys(state.tags);
    var html = "";
    if (active.length) {
      html += '<button class="chip tag reset" data-clear="1">清空 ' + active.length + "</button>";
    }
    list.forEach(function (t) {
      html += '<button class="chip tag" data-tag="' + esc(t) + '" aria-pressed="' +
        (state.tags[t] ? "true" : "false") + '">' + esc(t) +
        '<i>' + f[t] + "</i></button>";
    });
    wrap.innerHTML = html;
    wrap.onclick = function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      if (b.dataset.clear) state.tags = {};
      else {
        var t = b.dataset.tag;
        if (state.tags[t]) delete state.tags[t];
        else state.tags[t] = true;
      }
      renderTags();
      renderFilter();
      renderNav();
      if (location.hash === "#/" || location.hash === "") renderOverview();
    };
  }

  /* 卡片上的标签也就能点，点完直接变成筛选条件 */
  function bindTagClicks(root) {
    if (!root || root._tgBound) return;
    root._tgBound = true;
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".tg");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      var t = b.dataset.tag;
      if (state.tags[t]) delete state.tags[t];
      else state.tags[t] = true;
      renderTags();
      renderNav();
      if (location.hash === "#/" || location.hash === "") renderOverview();
      else renderDetail(location.hash.replace(/^#\/a\//, ""));
    });
  }

  /* ------------------------------------------------------------ 总览 */
  function renderOverview() {
    var list = ASSETS.filter(matches);
    var c = META.counts;

    var html = '<div class="kicker">代码资产库 / v1 · 从单文件工程里拆出来的</div>' +
      "<h1>这些资产不是导入的，<br>是被代码算出来的</h1>" +
      '<p class="lede">源工程是一个 1.4 MB 的单文件第一人称射击：模型、材质、光影、动画、音效全部在运行时由 JS 算出来，没有一个 .glb、没有一张 .png。' +
      "这意味着它们天生就该是<strong>可量化的代码资产</strong>——问题只在于原工程把 10 个模块压平进了一个 IIFE。" +
      "下面这套库里，每一个资产都是能单独 import 的模块，数值与原件逐字比对过。</p>";

    html += '<div class="stats">' +
      stat(ASSETS.length, "个独立资产模块") +
      stat(c.props, "条道具尺寸台账") +
      stat(c.instances, "个材质实例") +
      stat(META.verify.passed + "/" + (META.verify.passed + META.verify.failed), "项比对通过") +
      "</div>";

    html += '<div class="verdicts">' +
      '<div class="vcard good"><h3><i></i>能直接搬</h3>' +
      "<p>纯数据与纯函数。拷走即用，换引擎也能带上。</p>" +
      '<ul><li>道具台账 / 材质账簿</li><li>画质预设 / 数值调参</li><li>光影环境数值</li></ul></div>' +
      '<div class="vcard mid"><h3><i></i>要带壳搬</h3>' +
      "<p>逻辑能搬，但要给它一个最小宿主：THREE、材质解析器、或音频上下文。</p>" +
      '<ul><li>程序化建模工具 → 需 THREE</li><li>音效配方 → 需波形生成器</li><li>环境安装函数 → 需渲染器</li></ul></div>' +
      '<div class="vcard bad"><h3><i></i>搬不动的部分</h3>' +
      "<p>不是不能拆，是拆了没有独立价值——它们和状态机、shader、时序绑在一起。</p>" +
      '<ul><li>后处理 shader 链</li><li>武器换弹姿势曲线</li><li>任务状态机与 AI 行为树</li></ul></div>' +
      "</div>";

    var unfiltered = !state.q.trim() && state.type === "ALL" && !Object.keys(state.tags).length;
    if (unfiltered && window.PREVIEWS) {
      html += "<h2>活体预览 <small>每一格都由下面那份源码现场算出来 · 可拖动</small></h2>";
      html += '<div id="pvWall"></div>';
      html += '<p style="font-size:12.5px;color:var(--ink-3);margin:10px 0 0">' +
        "这不是截图，也不是示意图：格子里的每个像素都由 <code>assets/code/</code> 里那份模块执行后产生。" +
        "点任意一格进详情，可以拖视角、拉参数，看画面跟着数值变。</p>";
    }

    html += "<h2>源工程模块体量 <small>按命名空间切分 · KB</small></h2>";
    var max = Math.max.apply(null, META.modules.map(function (m) { return m.kb; }));
    html += '<div class="bars">';
    META.modules.forEach(function (m) {
      html += '<div class="bar-row"><span>' + m.role + "</span>" +
        '<span class="bar-track"><span class="bar-fill" style="width:' + (m.kb / max * 100).toFixed(1) + '%"></span></span>' +
        '<span class="bar-val">' + m.kb.toFixed(1) + " KB</span></div>";
    });
    html += "</div>";
    html += '<p style="font-size:12.5px;color:var(--ink-3);margin-top:14px">' +
      "每个模块原本都导出了 { create, showcase } 两个入口——也就是说原版<em>本来就支持单模块预览</em>，" +
      "只是没有对外暴露成文件。这是「可独立管理」最硬的证据。</p>";

    html += "<h2>资产清单 <small>" + list.length + " / " + ASSETS.length + "</small></h2>";
    html += '<div class="cards">';
    if (!list.length) html += '<div class="empty">没有匹配的资产。</div>';
    list.forEach(function (a) {
      var t = TYPE[a.type];
      html += '<a class="card" href="#/a/' + a.id + '" style="--accent:' + t.color + '">' +
        '<div class="card-top"><span class="type">' + a.type + "</span>" +
        '<span class="grade" data-g="' + a.grade + '">抽离度 ' + a.grade + "</span>" +
        '<span class="pv-badge">▶ 预览</span></div>' +
        "<h3>" + esc(a.name) + "<span>" + esc(a.en) + "</span></h3>" +
        "<p>" + esc(a.summary) + "</p>" +
        '<div class="card-tags">' + tagChips(a, 4) + "</div>" +
        '<div class="card-foot"><span>' + a.loc + " 行</span><span>" + esc(a.deps.split("·")[0].trim()) + "</span></div>" +
        "</a>";
    });
    html += "</div>";

    $("#main").innerHTML = html;

    if (unfiltered && window.PREVIEWS) {
      var wall = $("#pvWall");
      if (wall) {
        window.PREVIEWS.mountWall(wall, ASSETS.map(function (a) {
          return { id: a.id, name: a.name, type: a.type, color: TYPE[a.type].color };
        }));
      }
    }
    bindTagClicks($("#main"));
  }

  function stat(v, label) {
    return '<div class="stat"><b>' + v + "</b><span>" + label + "</span></div>";
  }

  /* ------------------------------------------------------------ 表格 */
  function table(cols, rows) {
    var h = '<div class="tbl-wrap"><table><thead><tr>';
    cols.forEach(function (c) { h += "<th>" + c + "</th>"; });
    h += "</tr></thead><tbody>";
    rows.forEach(function (r) {
      h += "<tr>";
      r.forEach(function (cell) {
        if (cell && typeof cell === "object") h += "<td" + (cell.cls ? ' class="' + cell.cls + '"' : "") + ">" + cell.html + "</td>";
        else h += "<td>" + cell + "</td>";
      });
      h += "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  function kvTable(rows, cols) {
    cols = cols || ["字段", "值"];
    return table(cols, rows.map(function (r) {
      return [{ html: esc(r.k), cls: "id" }, { html: esc(r.v), cls: "mono" }];
    }));
  }

  /* ------------------------------------------------------------ 详情 */
  function renderDetail(id) {
    var a = ASSETS.filter(function (x) { return x.id === id; })[0];
    if (!a) { $("#main").innerHTML = '<div class="empty">没有这个资产：' + esc(id) + "</div>"; return; }
    var t = TYPE[a.type];

    var html = '<a class="back" href="#/">← 回到清单</a>' +
      '<div class="d-head"><span class="type" style="color:' + t.color + '">' + a.type + "</span>" +
      '<span class="grade" data-g="' + a.grade + '">抽离度 ' + a.grade + "</span>" +
      '<span class="d-tags">' + tagChips(a) + "</span>" +
      "</div>" +
      "<h1>" + esc(a.name) + "<em>" + esc(a.en) + "</em></h1>" +
      '<p class="summary">' + esc(a.summary) + "</p>";

    html += '<div class="pv-wrap"><div class="pv-head">' +
      "<b>预览</b><span>跑的就是下面那份源码</span>" +
      '<em id="pvBadge">' + (window.PREVIEWS ? window.PREVIEWS.note3d() : "") + "</em></div>" +
      '<div id="pvHost"></div></div>';

    html += '<div class="meta">' +
      metaCell("来源锚点", a.anchor, true) +
      metaCell("代码规模", a.loc + " 行 / " + (a.bytes / 1024).toFixed(1) + " KB", true) +
      metaCell("依赖", a.deps) +
      metaCell("独立性", a.standalone) +
      "</div>";

    html += '<div class="note"><b>结论</b>' + esc(a.verdict) + "</div>";
    html += '<div class="note limit"><b>边界</b>' + esc(a.limits) + "</div>";

    if (a.related && a.related.length) {
      html += '<div class="related"><b>配套</b>' + a.related.map(function (rid) {
        var r = ASSETS.filter(function (x) { return x.id === rid; })[0];
        return r ? '<a href="#/a/' + rid + '">' + esc(r.name) + "<em>" + esc(r.en) + "</em></a>" : "";
      }).join("") + "</div>";
    }

    html += renderData(a);
    html += renderCode(a);

    $("#main").innerHTML = html;
    bindCode(a);
    bindTagClicks($("#main"));
    if (window.PREVIEWS) {
      var host = $("#pvHost");
      if (host) window.PREVIEWS.mount(host, a.id, "full");
    }
  }

  function metaCell(k, v, mono) {
    return "<div><dl><dt>" + k + "</dt><dd" + (mono ? ' class="mono"' : "") + ">" + esc(v) + "</dd></dl></div>";
  }

  function renderData(a) {
    var h = "";
    var A = a;

    if (A.static) {
      Object.keys(A.static).forEach(function (group) {
        h += "<h2>" + esc(group) + " <small>常量</small></h2>";
        h += kvTable(A.static[group]);
      });
    }

    if (A.tuning && A.tuning.length) {
      h += "<h2>渲染调参 <small>" + A.tuning.length + " 项</small></h2>";
      if (A.groups) {
        h += '<p style="font-size:12.5px;color:var(--ink-3);margin-bottom:10px">' + A.groups.join(" · ") + "</p>";
      }
      h += kvTable(A.tuning);
    }

    if (A.matrix) {
      h += "<h2>画质档位 <small>5 × 11</small></h2>";
      h += table(A.matrix.cols, A.matrix.rows.map(function (r) {
        return r.map(function (c, i) {
          if (i === 0) return { html: esc(c), cls: "id" };
          return { html: esc(String(c)), cls: "num" };
        });
      }));
    }

    if (A.families && A.families.length) {
      h += "<h2>材质族 <small>" + A.families.length + " 个 · 米制尺度</small></h2>";
      h += table(["族", "参数（size 米 / tile 平铺 / bump 毫米）"], A.families.map(function (f) {
        return [{ html: esc(f.id), cls: "id" }, { html: esc(f.v), cls: "mono dim" }];
      }));
    }

    if (A.instances && A.instances.length) {
      h += "<h2>材质实例 <small>" + A.instances.length + " 个</small></h2>";
      h += table(["实例", "族", "颜色", "rough", "metal", "标记"], A.instances.map(function (r) {
        var c = r.color ? hex(r.color) : null;
        return [
          { html: esc(r.id), cls: "id" },
          { html: esc(r.set), cls: "mono dim" },
          { html: c ? '<span class="swatch" style="background:' + c + '"></span><span class="mono">' + c + "</span>" : "—" },
          { html: esc(r.rough || "1"), cls: "num" },
          { html: esc(r.metal || "1"), cls: "num" },
          { html: (r.flags || []).map(function (f) { return '<span class="tagline">' + esc(f) + "</span>"; }).join(" ") || "—" }
        ];
      }));
    }

    if (A.props && A.props.length) {
      h += "<h2>道具台账 <small>" + A.props.length + " 条 · 底锚 · 米</small></h2>";
      h += table(["道具", "宽 × 高 × 深 (m)", "材质", "表面", "几何"], A.props.map(function (r) {
        return [
          { html: esc(r.id), cls: "id" },
          { html: r.size.map(function (x) { return x.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""); }).join(" × "), cls: "num" },
          { html: esc(r.material), cls: "mono dim" },
          { html: esc(r.surface), cls: "dim" },
          { html: r.custom ? '<span class="tagline hot">自定义</span>' : '<span class="tagline">兜底盒</span>' }
        ];
      }));
      h += '<p style="font-size:12.5px;color:var(--ink-3);margin-top:10px">' +
        "「自定义」= 有专属几何构造器；「兜底盒」= 用倒角盒按尺寸生成。两者共用同一张台账。" +
        "</p>";
    }

    if (A.api && A.api.length) {
      h += "<h2>导出接口 <small>" + A.api.length + " 个</small></h2>";
      h += table(["签名", "作用"], A.api.map(function (x) {
        return [{ html: esc(x.k), cls: "id" }, { html: esc(x.v), cls: "dim" }];
      }));
    }

    if (A.scale) {
      h += "<h2>尺度 <small>米制</small></h2>";
      h += kvTable(A.scale);
    }

    if (A.fields && A.fields.length) {
      h += "<h2>调参字段 <small>" + A.fields.length + " 项</small></h2>";
      h += kvTable(A.fields);
    }

    if (A.numbers) {
      h += "<h2>核心数值 <small>原版是裸变量</small></h2>";
      h += table(["字段", "值", "备注"], A.numbers.map(function (x) {
        return [{ html: esc(x.k), cls: "id" }, { html: esc(x.v), cls: "num" }, { html: esc(x.note || ""), cls: "dim" }];
      }));
    }

    if (A.springs) {
      h += "<h2>动画弹簧 <small>" + A.springs.length + " 根</small></h2>";
      h += table(["弹簧", "刚度 k", "阻尼 c", "驱动"], A.springs.map(function (s) {
        return [{ html: esc(s.id), cls: "id" }, { html: s.k, cls: "num" }, { html: s.c, cls: "num" }, { html: esc(s.use), cls: "dim" }];
      }));
      h += '<p style="font-size:12.5px;color:var(--ink-3);margin-top:10px">' +
        "九根弹簧共用一个积分器；dt 大于 12ms 时自动切成 ≤8ms 子步，这是低帧率下不炸的关键。" +
        "</p>";
    }

    if (A.recipes && A.recipes.length) {
      h += "<h2>配方明细 <small>" + A.recipes.length + " 条</small></h2>";
      h += table(["音效", "总线", "声部", "同时上限", "优先级", "峰值"], A.recipes.map(function (r) {
        return [
          { html: esc(r.id), cls: "id" },
          { html: esc(r.bus || "—"), cls: "mono dim" },
          { html: esc(r.n || "—"), cls: "num" },
          { html: esc(r.max || "—"), cls: "num" },
          { html: esc(r.pri || "—"), cls: "num" },
          { html: esc(r.peak || "—"), cls: "num" }
        ];
      }));
    }

    if (A.evidence) {
      h += '<div class="note"><b>验证</b>' + esc(A.evidence) + "</div>";
    }
    return h;
  }

  function renderCode(a) {
    var name = a.id + ".js";
    return '<h2>资产源码 <small>可直接 import</small></h2>' +
      '<div class="code">' +
      '<div class="code-head">' +
      '<span class="code-name">' + name + "</span>" +
      '<span class="code-lines">' + a.loc + " 行</span>" +
      '<span class="code-actions">' +
      '<button class="btn" data-act="expand">展开全文</button>' +
      '<button class="btn" data-act="copy">复制</button>' +
      '<button class="btn primary" data-act="download">下载 .js</button>' +
      "</span></div>" +
      '<div class="code-body" id="codeBody"><pre>' + codeHTML(a.code) + "</pre></div>" +
      "</div>";
  }

  function bindCode(a) {
    var body = $("#codeBody");
    var head = $(".code-head");
    head.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.dataset.act;
      if (act === "copy") copy(a.code);
      else if (act === "download") download(a.id + ".js", a.code);
      else if (act === "expand") {
        body.classList.toggle("expanded");
        b.textContent = body.classList.contains("expanded") ? "收起" : "展开全文";
      }
    });
  }

  /* ------------------------------------------------------------ 矩阵 */
  function renderMatrix() {
    var rows = ASSETS.map(function (a) {
      var c = a.crit || {};
      var m = function (v) {
        if (v === "✓") return '<span class="mark-y">✓</span>';
        if (v === "△") return '<span class="mark-h">△</span>';
        return '<span class="mark-n">✗</span>';
      };
      return "<tr><td><a href=\"#/a/" + a.id + "\">" + esc(a.name) + "</a></td>" +
        "<td>" + a.type + "</td>" +
        "<td>" + m(c.pure) + "</td>" +
        "<td>" + m(c.free) + "</td>" +
        "<td>" + m(c.run) + "</td>" +
        "<td>" + m(c.verified) + "</td>" +
        "<td>" + (a.loc + " 行") + "</td></tr>";
    }).join("");

    $("#main").innerHTML =
      '<a class="back" href="#/">← 回到清单</a>' +
      '<div class="kicker">抽离度矩阵</div>' +
      "<h1>四个判据，" + ASSETS.length + " 个资产</h1>" +
      '<p class="lede">判断一个资产「能不能独立管理」，不该靠感觉。这里用四条可检验的判据：' +
      "能不能脱离运行时当数据看、有没有绑死在全局上下文上、能不能单独跑起来、有没有和原件逐值比对过。" +
      "四条都过 = A 级。</p>" +
      '<div class="matrix-wrap"><table class="matrix"><thead><tr>' +
      "<th>资产</th><th>类型</th><th>纯数据/纯函数</th><th>不依赖引擎全局</th><th>可单独跑</th><th>已与原件比对</th><th>规模</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<div class="legend">' +
      '<span><span class="mark-y">✓</span> 满足</span>' +
      '<span><span class="mark-h">△</span> 部分满足（需注入宿主或只覆盖一层）</span>' +
      '<span><span class="mark-n">✗</span> 不满足</span>' +
      "</div>" +
      '<p class="lede" style="margin-top:26px">' +
      "「不依赖引擎全局」这一列最容易被忽略。原版所有模块都通过 <code style=\"font-family:var(--mono)\">i.mats / i.scene / i.events</code> 拿到宿主，" +
      "看起来是依赖注入、很干净；但它同时也在用模块级的共享临时对象（向量、矩阵、四元数）来省 GC。" +
      "把那类函数搬出去时，这些共享状态必须一起搬，否则两次调用会互相踩。</p>";
  }

  /* ------------------------------------------------------------ 说明 */
  function renderAbout() {
    var s = META.source;
    $("#main").innerHTML =
      '<a class="back" href="#/">← 回到清单</a>' +
      '<div class="kicker">方法与边界</div>' +
      "<h1>怎么抽的，怎么验的</h1>" +
      '<div class="prose">' +
      "<h3>1. 先证明它本来就有模块边界</h3>" +
      "<p>原文件是单个 IIFE，但业务代码用了一个极简打包器：每个模块先建命名空间对象，再用 <code>br(ns,{…})</code> 挂导出。" +
      "扫出 10 个命名空间（render / mats / props / level / backdrop / ground / fx / weapon / enemies + 内嵌 three），" +
      "其中 9 个都导出 <code>create</code> 和 <code>showcase</code>——<b>showcase 就是单模块预览入口</b>。" +
      "所以「能不能独立管理」的答案在源码里已经写着了，缺的只是把文件切出来。</p>" +
      "<h3>2. 按「数据 / 行为」分层抽</h3>" +
      "<ul>" +
      "<li><b>纯数据层</b>（尺寸台账、材质族与实例、画质预设、运动调参、AI 调参、音效配方）：直接搬字面量，零改写。</li>" +
      "<li><b>纯函数层</b>（倒角盒、圆柱、样条管、弹簧积分器、阴影正交框）：搬逻辑，改成人能读的写法。</li>" +
      "<li><b>有状态层</b>（建模器、静态合批）：保留结构，把外部依赖收敛成一个 <code>mats</code> 适配器。</li>" +
      "<li><b>不抽</b>（后处理 shader 链、换弹姿势曲线、任务状态机）：它们脱离整机没有独立价值，硬抽只会得到一堆跑不起来的碎片。</li>" +
      "</ul>" +
      "<h3>3. 用原件验，不用自己验</h3>" +
      "<p>被改名的函数（<code>p3</code> → <code>metricBox</code> 等）都从原文件里按字节切出来，配上别名映射，" +
      "和新写的实现跑同一组输入，逐顶点比位置 / 法线 / UV / 索引。数值表则和语法抽取出来的原文逐字段比。</p>" +
      "<p>这一步抓到了四个真实漂移：倒角盒的中间顶点没有回写、圆柱的 v 在原版是米制（three 被打了补丁）、" +
      "样条管的张力默认值不是 0.5 而是 0、倒角盒不该重算法线。没有这个比对，这四个都会静默留在「看起来一样」的资产里。</p>" +
      "<h3>4. 源工程</h3>" +
      '<div class="meta" style="margin-top:14px">' +
      metaCell("文件", s.file, true) +
      metaCell("规模", s.lines + " 行 / " + s.mb + " MB", true) +
      metaCell("引擎", s.engine) +
      metaCell("哈希", s.sha256.slice(0, 16) + "…", true) +
      "</div>" +
      "<p style=\"margin-top:14px;font-size:13px;color:var(--ink-3)\">" + esc(s.arch) + "</p>" +
      "<h3>5. 预览跑的就是原文</h3>" +
      "<p>每个资产详情页顶上的那块预览，不是截图，也不是另写一套画图代码——它加载并执行 <code>assets/code/</code> 里那份模块本身。" +
      "光影预览调的是资产里的 <code>install()</code> 和 <code>shadowFrustum()</code>；道具预览按台账的米数调 <code>metricBox()</code>；" +
      "跳跃曲线用 <code>jumpSpeed</code> 逐点算；后坐柱子是把 <code>spring()</code> + <code>integrate()</code> 按 240Hz 积分出来的。</p>" +
      "<p>换句话说，<b>预览能跑起来这件事本身就是抽离度的证据</b>：如果这些模块还黏在整机上，没有任何一块能单独出画面。" +
      "唯一的中间层是 <code>tools/build_modules.py</code>——它只把 ESM 的 <code>import/export</code> 换成依赖注入，实现一个字没动。</p>" +
      "<h3>6. 预览和游戏内为什么不一样</h3>" +
      "<p>差距不在画质设置，在管线长度。游戏内是五段串联：几何 → 自定义着色 → 光照与阴影 → 后期合成 → 屏幕；" +
      "预览只保留前三段，而且每一段都是降级实现。</p>" +
      "<table><thead><tr><th>层</th><th>游戏内</th><th>预览</th></tr></thead><tbody>" +
      "<tr><td>环境光</td><td>天空与室内各烘一张 PMREM 探针</td><td>天空已按同样方法烘成探针；另外三个预览用笼统的棚拍探针</td></tr>" +
      "<tr><td>着色</td><td>标准 PBR + <code>h3()</code> 补丁：三输出烘焙（albedo / ORM / height）、湿润 4 元组、宏观脏污、三平面、镂空</td>" +
      "<td>同一套 GLSL 逐字搬入，在预览里现烘现用：族参数 → 三张图 → 同一份补丁。差的只有分辨率（1024 对 2048）与采样数</td></tr>" +
      "<tr><td>阴影</td><td>4096² PCF，另带湿地面的平面反射</td><td>1024² PCFSoft，无平面反射</td></tr>" +
      "<tr><td>后期</td><td>自适应曝光 → Bloom → 横向拉丝 → 镜头脏污 / 眩光 / 色散 / 暗角 → AgX</td><td>Bloom + 色散 + 暗角 + ACES，参数是经验值</td></tr>" +
      "<tr><td>时间</td><td>雨、体积光、运动模糊、水膜流动</td><td>静态单帧</td></tr></tbody></table>" +
      "<p style=\"font-size:13px;color:var(--ink-3)\">有一点是刻意留着的：预览的职责是证明这些数是真的，不是复刻画面。" +
      "如果把后期堆到和游戏一样，就分不清「好看」来自台账里的数值，还是来自镜头效果。</p>" +
      "<p>材质这一层已经追平。原版的贴图不是图片文件，是 <code>surf()</code> 这段 GLSL 在 GPU 上烘出来的三张图：" +
      "albedo（<code>sqrt</code> 编码的 8 位）、ORM（R=AO / G=粗糙 / B=金属）、height（hi + lo 两通道打包）。" +
      "把 27 个族函数、法线 Sobel、拷贝通道、7 段材质补丁全部逐字抽出来之后，预览里每个道具、每块地面、" +
      "每颗材质球显示的纹理与湿润/脏污，都是这套代码现场算的，不是纯色兜底。</p>" +
      "<p style=\"font-size:13px;color:var(--ink-3)\">唯一改写是 MRT：原版一次 <code>WebGLRenderTarget({count:3})</code> 画三个输出，" +
      "本机 three 是 r160，还没有 <code>count</code>，于是拆成三次 <code>uSel</code> 选择的单目标 pass。逐像素结果相同，只多两次 draw call。" +
      "这个差异写进了资产头部注释，验证脚本也把它当作唯一允许的偏离来卡。</p>" +
      "<h3>7. 复现</h3>" +
      "<ul>" +
      "<li><code>python3 tools/analyze.py</code> 量化模块与参数表 → <code>build/tables.json</code></li>" +
      "<li><code>python3 tools/emit.py</code> 从原文件生成数据型资产 → <code>assets/code/*.js</code></li>" +
      "<li><code>node build/verify.mjs</code> 46 项比对（12 项几何逐顶点、7 项 GLSL 逐字回原工程）</li>" +
      "<li><code>python3 tools/build_modules.py</code> 把 10 个模块打成可在 file:// 下执行的 <code>assets/modules.js</code></li>" +
      "<li><code>python3 tools/bundle.py</code> 打包成本页数据 → <code>assets/data.js</code></li>" +
      "</ul>" +
      "<p style=\"font-size:13px;color:var(--ink-3)\">" +
      "资产源码本身是标准 ES module，放在 <code>assets/code/</code>，可以直接被别的项目 import。" +
      "本页面为了能双击打开（file://），把 three 转成了全局经典脚本（r160），并用上面那个脚本把模块内联进来；" +
      "这两步都只影响「怎么加载」，不影响资产本身。预览里的地面网格、打光、材质近似属于宿主兜底，每个预览下方都标注了哪些数是资产的、哪些不是。</p>" +
      "</div>";
  }

  /* ------------------------------------------------------------ 路由 */
  function route() {
    if (window.PREVIEWS) window.PREVIEWS.clear();
    var h = location.hash.replace(/^#/, "") || "/";
    if (h === "/" || h === "") renderOverview();
    else if (h === "/matrix") renderMatrix();
    else if (h === "/about") renderAbout();
    else if (h.indexOf("/a/") === 0) renderDetail(h.slice(3));
    else renderOverview();
    renderNav();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------ 启动 */
  function boot() {
    $("#topMeta").innerHTML =
      '<span class="hide-sm">' + esc(META.source.file) + "</span>" +
      '<span class="badge"><i></i>校验 ' + META.verify.passed + "/" + (META.verify.passed + META.verify.failed) + "</span>";

    var q = $("#q");
    q.addEventListener("input", function () {
      state.q = q.value;
      renderNav();
      var h = location.hash.replace(/^#/, "");
      if (h === "/" || h === "") renderOverview();
    });

    renderFilter();

    /* 侧栏清单：窄屏收成可折叠的 <details>；桌面端必须保持 open —— 闭合时浏览器会把
       ::details-content 设为 content-visibility:hidden，元素仍占位但既不出图也不可点。 */
    var navbox = $("#navbox");
    var narrow = window.matchMedia("(max-width: 920px)");
    if (navbox && narrow.matches) navbox.open = false;
    narrow.addEventListener("change", function (e) {
      if (navbox && !e.matches) navbox.open = true;
    });

    window.addEventListener("hashchange", route);
    route();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
