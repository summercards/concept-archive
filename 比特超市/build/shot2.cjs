const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  const base = "file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html";
  await p.goto(base, { waitUntil: "load" });
  await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(200);
  await p.screenshot({ path: "build/shots/05-cards.png" });

  await p.goto(base + "#/a/props-ledger", { waitUntil: "load" });
  await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(200);
  await p.screenshot({ path: "build/shots/06-props.png" });

  await p.goto(base + "#/a/env-atmosphere", { waitUntil: "load" });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const c = document.querySelector("#codeBody"); if (c) window.scrollTo(0, c.getBoundingClientRect().top + window.scrollY - 80); });
  await p.waitForTimeout(200);
  await p.screenshot({ path: "build/shots/07-code.png" });
  await b.close();
})();
