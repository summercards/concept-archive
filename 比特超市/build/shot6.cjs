const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  const ids = ["player-tuning", "weapon-tuning", "ai-tuning", "audio-recipes", "quality-presets"];
  for (const id of ids) {
    await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html#/a/" + id, { waitUntil: "load" });
    await p.waitForTimeout(900);
    const el = await p.$(".pv-wrap");
    await el.screenshot({ path: "build/shots/40-" + id + ".png" });
  }
  console.log("errors:", errs.length ? errs : "none");
  await b.close();
})();
