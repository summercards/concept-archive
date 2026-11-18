/**
 * 移动端 390×844 检查：横向溢出 / 侧栏抽屉 / 详情页可读性 / 长列表渲染耗时
 */
const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const BASE = "http://127.0.0.1:8099/index.html";

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; p.on("pageerror", e => errs.push(e.message.slice(0, 120)));
  await p.goto(BASE + "#/", { waitUntil: "load" });
  await p.waitForTimeout(900);

  async function probe(hash, wait) {
    await p.evaluate(h => { location.hash = h; }, hash);
    await p.waitForTimeout(wait || 500);
    return p.evaluate(() => {
      const de = document.documentElement;
      const over = de.scrollWidth - de.clientWidth;
      const wide = [...document.querySelectorAll("body *")]
        .filter(e => e.getBoundingClientRect().right > de.clientWidth + 1)
        .slice(0, 6).map(e => e.tagName + "." + String(e.className).split(" ")[0] + "@" + Math.round(e.getBoundingClientRect().right));
      return { over, wide, h1: (document.querySelector("h1") || {}).textContent,
               fail: (document.querySelector(".pv-fail") || {}).textContent || null };
    });
  }

  for (const h of ["#/", "#/c/MAT", "#/a/mat.concrete", "#/a/prop.container40hc", "#/a/sfx.rain", "#/matrix", "#/about"]) {
    console.log(h.padEnd(26), JSON.stringify(await probe(h, h === "#/" ? 900 : 520)));
  }

  /* 261 条侧栏渲染耗时 */
  const t = await p.evaluate(() => {
    const t0 = performance.now();
    location.hash = "#/a/prop.container20gp";
    return new Promise(res => setTimeout(() => {
      const items = document.querySelectorAll(".nav-item").length;
      res({ ms: Math.round(performance.now() - t0), items });
    }, 0));
  });
  console.log("侧栏 261 条一次渲染", JSON.stringify(t));

  /* 抽屉开关：点汉堡看侧栏是否出来 */
  const burger = await p.$("#burger, .burger, [data-nav-toggle]");
  console.log("汉堡按钮", burger ? "有" : "无");
  if (burger) {
    await burger.click(); await p.waitForTimeout(420);
    const st = await p.evaluate(() => {
      const r = document.querySelector(".rail");
      const cs = r ? getComputedStyle(r) : null;
      return cs ? { display: cs.display, transform: cs.transform, left: Math.round(r.getBoundingClientRect().left), w: Math.round(r.getBoundingClientRect().width) } : null;
    });
    console.log("抽屉状态", JSON.stringify(st));
  }
  console.log("errors:", errs.length ? [...new Set(errs)].join(" | ") : "none");
  await b.close();
})();
