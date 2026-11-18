const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const B = "http://127.0.0.1:8099/index.html";
  await p.goto(B + "#/a/sfx.rain", { waitUntil: "load" });
  for (const [id, f] of [["sfx.rain", "sfx-rain"], ["sfx.rifle_shot", "sfx-rifle"], ["sfx.impact_metal", "sfx-impact"]]) {
    await p.evaluate(i => { location.hash = "#/a/" + i; }, id);
    await p.waitForTimeout(700);
    const el = await p.$(".pv-stage");
    await el.screenshot({ path: "build/shots/" + f + ".png" });
    console.log(id, (await p.evaluate(() => (document.querySelector(".pv-fail") || {}).textContent || "ok")));
  }
  await b.close();
})();
