const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 960 } });
  await p.goto("http://127.0.0.1:8099/index.html#/", { waitUntil: "load" });
  await p.waitForTimeout(800);
  for (const id of ["matf.glass_dirty", "mat.glass_dirty", "sfx.rain_interior"]) {
    await p.evaluate(i => { location.hash = "#/a/" + i; }, id);
    await p.waitForTimeout(450);
    const r = await p.evaluate(() => [...document.querySelectorAll("[aria-current='page']")]
      .map(e => e.tagName + "." + e.className + " :: " + (e.getAttribute("href") || "") + " :: " + e.textContent.trim().slice(0, 30)));
    console.log(id, "→", JSON.stringify(r, null, 1));
  }
  await b.close();
})();
