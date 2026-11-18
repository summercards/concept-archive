const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
  await p.goto("http://127.0.0.1:8099/index.html#/", { waitUntil: "load" });
  await p.waitForTimeout(800);
  console.log(JSON.stringify(await p.evaluate(() => {
    const g = s => document.querySelector(s);
    const info = s => { const e = g(s); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { h: Math.round(r.height), t: Math.round(r.top), display: cs.display, flex: cs.flex, minH: cs.minHeight, oh: cs.overflowY }; };
    return { rail: info(".rail"), head: info(".rail-head"), navbox: info(".navbox"),
             nav: info(".nav"), foot: info(".rail-foot"), tagsH: g("#tagFilter").getBoundingClientRect().height };
  }), null, 1));
  await b.close();
})();
