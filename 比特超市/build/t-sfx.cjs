const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("http://127.0.0.1:8099/index.html#/a/sfx.rain", { waitUntil: "load" });
  await p.waitForTimeout(900);
  console.log(JSON.stringify(await p.evaluate(() => {
    const M = window.ASSET_MODULES || {};
    const AU = M["audio-recipes"] || {};
    return { mkeys: Object.keys(M), auKeys: Object.keys(AU),
             n: AU.RECIPES ? Object.keys(AU.RECIPES).length : null,
             rain: AU.RECIPES && AU.RECIPES.rain };
  }), null, 1));
  await b.close();
})();
