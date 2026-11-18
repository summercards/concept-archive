const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const ROOT = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "build/props-source.json"), "utf8"));
const inputPaths = { source: manifest.source.path, generated: "assets/code/props-builder.js", packedModule: "assets/modules.js",
 manifest: "build/props-source.json", container: "assets/code/container-builder.js", app: "app.js", previews: "previews.js", data: "assets/data.js" };
function inputHashes() {
 return Object.fromEntries(Object.entries(inputPaths).map(([key, file]) => [key, { path: file,
 sha256: crypto.createHash("sha256").update(fs.readFileSync(path.isAbsolute(file) ? file : path.join(ROOT, file))).digest("hex") }]));
}
const staticInputs = inputHashes();
(async () => {
 const browser = await chromium.launch();
 const rows = [], errors = [];
 try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" || /unknown (?:material|decal)/i.test(m.text())) errors.push(m.text()); });
  await page.goto("http://127.0.0.1:8099/index.html#/alignment");
  for (const id of Object.keys(manifest.extraction.props)) {
   await page.evaluate(id => { location.hash = "#/a/prop." + id; }, id);
   await page.waitForFunction(id => document.querySelector("h1 em")?.textContent === id, id);
   await page.waitForFunction(() => document.querySelector("canvas[data-builder]") || document.querySelector(".pv-fail"));
   await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
   const row = await page.evaluate(() => ({ id: document.querySelector("h1 em")?.textContent,
     ...document.querySelector("canvas[data-builder]")?.dataset,
     fail: document.querySelector(".pv-fail")?.textContent || null,
     note: document.querySelector(".pv-note")?.textContent }));
   rows.push(row);
   console.log(id, row.fail || row.vertices);
   if (!row.fail) {
    await page.locator("#pvHost").screenshot({ path: path.join(ROOT, "outputs/prop-" + id + ".png") });
    for (const label of ["纯灰几何", "结构线框", "原材质"]) {
     await page.locator("#pvHost").getByRole("button", { name: label, exact: true }).click();
    }
   }
  }
  for (const [id, label] of [["forklift", "抬起"], ["pallet", "缺板"], ["barrel", "倒放"], ["catwalk", "右侧"], ["gate_arm", "升起"]]) {
   await page.evaluate(id => { location.hash = "#/a/prop." + id; }, id);
   await page.waitForFunction(id => document.querySelector("canvas")?.dataset.prop === id || document.querySelector(".pv-fail"), id);
   if (await page.locator(".pv-fail").count()) continue;
   await page.getByRole("button", { name: label, exact: true }).click();
   await page.locator("#pvHost").screenshot({ path: path.join(ROOT, "outputs/prop-" + id + "-variant.png") });
  }
  await page.evaluate(() => { location.hash = "#/a/prop.relay_node"; });
  await page.waitForSelector("canvas[data-prop='relay_node']");
  await page.getByRole("button", { name: "切断中", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("canvas[data-prop]")?.dataset.state === "cutting");
  await page.getByRole("button", { name: "已切断", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("canvas[data-prop]")?.dataset.state === "cut");
  await page.getByRole("button", { name: "暂停", exact: true }).click();
  await page.locator("#pvHost").screenshot({ path: path.join(ROOT, "outputs/prop-relay_node-cut.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#pvHost").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ROOT, "outputs/props-mobile.png") });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const stableInputs = JSON.stringify(staticInputs) === JSON.stringify(inputHashes());
  const result = { status: rows.every(r => !r.fail && +r.vertices > 24) && errors.length === 0 && mobileOverflow === 0 && stableInputs ? "PASS" : "FAIL",
   static: staticInputs, stableInputs, total: rows.length, errors, mobileOverflow, rows,
   scope: "36 件实际页面构造与原材质/灰模/线框切换；五件关键变体、中继三状态、390宽；不等于全体人工视觉或GPU等价。" };
  fs.writeFileSync(path.join(ROOT, "outputs/props-ui-verification.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ status: result.status, total: rows.length, errors, mobileOverflow }, null, 2));
  if (result.status !== "PASS") process.exitCode = 1;
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
