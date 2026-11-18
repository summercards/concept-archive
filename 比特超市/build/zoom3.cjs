const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const BASE = "file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html";

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 3 });
  await p.goto(BASE + "#/a/material-ledger", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  const box = await p.evaluate(() => {
    const c = document.querySelector("#pvHost canvas");
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  console.log("canvas", JSON.stringify(box));
  await p.screenshot({
    path: "build/shots/z-ledger-zoom.png",
    clip: { x: box.x + box.w * 0.18, y: box.y + box.h * 0.34, width: box.w * 0.34, height: box.h * 0.34 },
  });
  await b.close();
})();
