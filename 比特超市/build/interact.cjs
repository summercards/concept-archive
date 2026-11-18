const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(400);

  const count = () => p.evaluate(() => ({
    items: document.querySelectorAll(".nav .nav-item").length,
    navCount: document.querySelector("#navCount").textContent.trim(),
    cards: document.querySelectorAll(".card").length,
  }));
  console.log("初始:", JSON.stringify(await count()));

  // 搜索
  await p.fill("#q", "弹簧");
  await p.waitForTimeout(300);
  console.log("搜「弹簧」:", JSON.stringify(await count()));
  await p.screenshot({ path: "build/shots/08-search.png" });

  // 清空 + 类型筛选
  await p.fill("#q", "");
  await p.waitForTimeout(250);
  const chip = await p.$('#typeFilter .chip[data-t="MAT"]');
  if (chip) { await chip.click(); await p.waitForTimeout(300); }
  console.log("筛 MAT:", JSON.stringify(await count()));
  await p.screenshot({ path: "build/shots/09-filter.png" });

  // 点进资产
  const first = await p.$('.nav .nav-item');
  if (first) { await first.click(); await p.waitForTimeout(400); }
  console.log("url:", p.url());
  console.log("标题存在:", await p.evaluate(() => !!document.querySelector("h1")));

  // 复制按钮存在性 + 展开全文
  const toggles = await p.evaluate(() => [...document.querySelectorAll("button")].map(b => b.textContent.trim()).slice(0, 8));
  console.log("按钮:", JSON.stringify(toggles));

  console.log("errors:", errs.length ? errs : "none");
  await b.close();
})();
