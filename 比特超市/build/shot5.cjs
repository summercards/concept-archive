const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  const shots = ["env-atmosphere", "props-ledger", "modeling-kit", "material-ledger"];
  for (const id of shots) {
    await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html#/a/" + id, { waitUntil: "load" });
    await p.waitForTimeout(1800);
    const y = await p.evaluate(() => {
      const e = document.querySelector(".pv-wrap");
      return e ? e.getBoundingClientRect().top + window.scrollY - 70 : 0;
    });
    await p.evaluate(v => window.scrollTo(0, v), y);
    await p.waitForTimeout(400);
    await p.screenshot({ path: "build/shots/30-" + id + ".png" });
  }
  console.log("errors:", errs.length ? errs : "none");
  await b.close();
})();
