/**
 * 全站巡检：总览 / 10 个分类页 / 覆盖核对页 / 关于页 / 261 个详情页
 * 每一页都检查：无 .pv-fail、无 JS 报错、有 h1、详情页有预览产物
 * 跑法：先起 http://127.0.0.1:8099，再 node build/sweep.cjs
 */
const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const fs = require("fs"), path = require("path");
const ROOT = "/Users/zyq/WorkBuddy/2026-11-15-17-10-04";
const BASE = "http://127.0.0.1:8099/index.html";
const DB = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data.js"), "utf8")
  .replace(/^[\s\S]*?window\.DB\s*=\s*/, "").replace(/;\s*$/, ""));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 960 } });
  const errs = [];
  p.on("pageerror", e => errs.push(String(e.message).slice(0, 140)));
  await p.goto(BASE + "#/", { waitUntil: "load" });
  await p.waitForTimeout(900);

  const out = [];
  async function visit(hash, wait) {
    errs.length = 0;
    await p.evaluate(h => { location.hash = h; }, hash);
    await p.waitForTimeout(wait || 380);
    const r = await p.evaluate(() => ({
      h1: (document.querySelector("h1") || {}).textContent || null,
      fail: (document.querySelector(".pv-fail") || {}).textContent || null,
      cv: document.querySelectorAll(".pv-cv").length,
      navOn: document.querySelectorAll(".nav-item[aria-current='page']").length,
    }));
    out.push({ hash, ...r, err: errs.length ? [...new Set(errs)].join(" | ") : null });
    return r;
  }

  /* 框架页 */
  for (const h of ["#/", "#/matrix", "#/about"]) await visit(h, 700);
  for (const c of DB.cats) await visit("#/c/" + c.id, 460);

  /* 261 个详情页 */
  for (const it of DB.items) await visit("#/a/" + it.id, it.kind === "sfx" ? 300 : 420);

  const bad = out.filter(o => o.fail || o.err || !o.h1 || (o.hash.startsWith("#/a/") && o.cv === 0));
  const navBad = out.filter(o => o.hash.startsWith("#/a/") && o.navOn !== 1);

  console.log(`巡检 ${out.length} 页（框架 3 + 分类 ${DB.cats.length} + 详情 ${DB.items.length}）`);
  console.log("坏页", bad.length);
  bad.slice(0, 25).forEach(o => console.log("  ", JSON.stringify(o)));
  console.log("侧栏高亮异常", navBad.length);
  navBad.slice(0, 10).forEach(o => console.log("  ", o.hash, "navOn=" + o.navOn));
  fs.writeFileSync(path.join(ROOT, "build", "sweep-result.json"),
    JSON.stringify({ at: new Date().toISOString().slice(0, 16), total: out.length,
      bad: bad.length, navBad: navBad.length, rows: out }, null, 1));
  await b.close();
})();
