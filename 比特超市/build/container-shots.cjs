const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const path = require("node:path");
const fs = require("node:fs");
const ROOT = path.resolve(__dirname, "..");
(async () => {
  const browser = await chromium.launch();
  try {
  const page = await browser.newPage({ viewport: { width: 1520, height: 1100 }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("http://127.0.0.1:8099/index.html#/a/prop.container40hc");
  await page.waitForSelector("canvas[data-builder='M3/zA']");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#pvHost").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ROOT, "outputs/container-after-detail.png") });
  async function press(name) {
    console.log("press", name, page.url());
    await page.locator("#pvHost").getByRole("button", { name, exact: true }).click();
  }
  async function snap(name) {
    await page.locator("#pvHost").screenshot({ path: path.join(ROOT, "outputs/" + name + ".png") });
    console.log("saved", name, "buttons", await page.locator("#pvHost button").count());
  }
  await snap("container40hc-original-material");
  await press("纯灰几何");
  await snap("container40hc-solid-geometry");
  await press("结构线框");
  await snap("container40hc-wireframe");
  await press("纯灰几何");
  await press("长侧板");
  await snap("container40hc-side-corrugation");
  await press("原材质");
  await press("箱门近景");
  await snap("container40hc-door-hardware");
  await press("顶板");
  await snap("container40hc-roof");
  await press("整体");
  await press("打开 60%");
  await snap("container40hc-open-interior");
  const models = [];
  for (const id of ["container20", "container40", "container40hc"]) {
    await page.evaluate(id => { location.hash = "#/a/prop." + id; }, id);
    await page.waitForFunction(id => document.querySelector("h1 em")?.textContent === id && document.querySelector("canvas[data-builder='M3/zA']"), id);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    models.push(await page.locator("canvas[data-builder='M3/zA']").evaluate(e => ({ ...e.dataset })));
    await snap(id + "-full-model");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.locator("#pvHost").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ROOT, "outputs/container-mobile.png") });
  console.log(JSON.stringify({ models, errors, mobileOverflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) }, null, 2));
  fs.writeFileSync(path.join(ROOT, "build/container-ui-result.json"), JSON.stringify({ models, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
