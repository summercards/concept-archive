const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: "build/shots/60-home.png" });

  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html#/a/props-ledger", { waitUntil: "load" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "build/shots/61-detail-top.png" });
  await b.close();
})();
