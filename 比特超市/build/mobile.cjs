const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(300);
  await p.screenshot({ path: "build/shots/08-mobile.png" });
  const ow = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log("scrollWidth", ow);
  await b.close();
})();
