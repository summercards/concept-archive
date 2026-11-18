const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  await p.goto("http://127.0.0.1:8099/index.html#/a/spring.kickZ", { waitUntil: "load" });
  await p.waitForTimeout(1200);
  const el = await p.$(".pv-stage");
  await el.screenshot({ path: "build/shots/spring-card.png" });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  console.log("fail:", await p.evaluate(() => (document.querySelector(".pv-fail") || {}).textContent || "none"));
  await b.close();
})();
