const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(1200);

  const count = () => p.evaluate(() => ({
    nav: document.querySelectorAll(".nav .nav-item").length,
    cards: document.querySelectorAll(".card").length,
    active: document.querySelectorAll('#tagFilter .chip[aria-pressed="true"]').length,
  }));
  console.log("初始:", JSON.stringify(await count()));

  await p.click('#tagFilter .chip[data-tag="纯数据"]');
  await p.waitForTimeout(400);
  console.log("标签=纯数据:", JSON.stringify(await count()));

  await p.click('#tagFilter .chip[data-tag="米制"]');
  await p.waitForTimeout(400);
  console.log("+米制:", JSON.stringify(await count()));
  await p.screenshot({ path: "build/shots/50-tagfilter.png" });

  // 点击卡片里的标签
  await p.click('.card .tg');
  await p.waitForTimeout(300);
  console.log("点卡内标签后:", JSON.stringify(await count()));

  // 清空
  await p.click('#tagFilter .chip.reset');
  await p.waitForTimeout(300);
  console.log("清空:", JSON.stringify(await count()));

  console.log("errors:", errs.length ? errs : "none");
  await b.close();
})();
