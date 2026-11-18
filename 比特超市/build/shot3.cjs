const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();

  // 桌面：详情页向下滚动，拍源码块
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });

  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html#/a/modeling-kit", { waitUntil: "load" });
  await p.waitForTimeout(500);
  const target = await p.$(".code-block, pre, .src");
  const y = await p.evaluate(() => {
    const el = document.querySelector(".code-block") || document.querySelector("pre");
    if (!el) return null;
    return el.getBoundingClientRect().top + window.scrollY - 120;
  });
  console.log("scrollY target:", y);
  await p.evaluate(v => window.scrollTo(0, v), y || 1200);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "build/shots/05-detail-code.png" });
  console.log("desktop errors:", errs.length ? errs : "none");

  // 移动端
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const merrs = [];
  m.on("pageerror", e => merrs.push("PAGEERROR: " + e.message));
  await m.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await m.waitForTimeout(500);
  const mob = await m.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    navOpen: document.querySelector("#navbox").open,
    navH: Math.round(document.querySelector("#nav").getBoundingClientRect().height),
    summaryVisible: getComputedStyle(document.querySelector("#navbox > summary")).display,
  }));
  console.log("mobile:", JSON.stringify(mob));
  await m.screenshot({ path: "build/shots/06-mobile.png" });

  // 移动端展开清单
  await m.click("#navbox > summary");
  await m.waitForTimeout(350);
  await m.screenshot({ path: "build/shots/07-mobile-open.png" });
  const mob2 = await m.evaluate(() => ({
    navOpen: document.querySelector("#navbox").open,
    navH: Math.round(document.querySelector("#nav").getBoundingClientRect().height),
    scrollW: document.documentElement.scrollWidth,
  }));
  console.log("mobile after tap:", JSON.stringify(mob2));
  console.log("mobile errors:", merrs.length ? merrs : "none");

  await b.close();
})();
