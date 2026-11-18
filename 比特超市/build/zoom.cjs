const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 3 });
  const base = "file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html";
  await p.goto(base, { waitUntil: "load" });
  await p.waitForTimeout(300);
  const bars = await p.$(".bars");
  await bars.screenshot({ path: "build/shots/zoom-bars.png" });
  const info = await p.$$eval(".bar-fill", els => els.map(e => ({ w: e.style.width, rect: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, bg: getComputedStyle(e).backgroundImage.slice(0,60) })));
  console.log(JSON.stringify(info.slice(0,3), null, 1));

  await p.goto(base + "#/matrix", { waitUntil: "load" });
  await p.waitForTimeout(200);
  const lede = await p.$$(".lede");
  await lede[lede.length - 1].screenshot({ path: "build/shots/zoom-lede.png" });
  await b.close();
})();
