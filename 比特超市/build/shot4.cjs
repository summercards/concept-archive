const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  const y = await p.evaluate(() => {
    const w = document.querySelector(".pv-wall");
    return w ? w.getBoundingClientRect().top + window.scrollY - 130 : 0;
  });
  await p.evaluate(v => window.scrollTo(0, v), y);
  await p.waitForTimeout(500);
  await p.screenshot({ path: "build/shots/20-wall.png" });
  await p.evaluate(v => window.scrollTo(0, v + 620), y);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "build/shots/21-wall2.png" });
  console.log("errors:", errs.length ? errs : "none");
  await b.close();
})();
