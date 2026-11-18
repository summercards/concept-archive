const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));

  const base = "file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html";
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "build/shots/01-overview.png", fullPage: false });

  await page.goto(base + "#/a/modeling-kit", { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "build/shots/02-detail.png", fullPage: false });

  await page.goto(base + "#/matrix", { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "build/shots/03-matrix.png", fullPage: false });

  await page.goto(base + "#/about", { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "build/shots/04-about.png", fullPage: false });

  console.log("errors:", errors.length ? errors : "none");
  const title = await page.title();
  console.log("title:", title);
  await browser.close();
})();
