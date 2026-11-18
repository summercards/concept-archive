const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const B = "http://127.0.0.1:8099/index.html";
  await p.goto(B + "#/", { waitUntil: "load" }); await p.waitForTimeout(1200);
  await p.screenshot({ path: "build/shots/m/home.png" });
  for (const [h, f] of [["#/a/mat.concrete", "mat"], ["#/a/prop.container40hc", "prop"], ["#/c/SFX", "cat"]]) {
    await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(900);
    await p.screenshot({ path: "build/shots/m/" + f + ".png" });
  }
  await b.close();
})();
