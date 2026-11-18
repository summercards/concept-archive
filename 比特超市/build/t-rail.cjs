const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
  await p.goto("http://127.0.0.1:8099/index.html#/", { waitUntil: "load" });
  await p.waitForTimeout(900);
  console.log(JSON.stringify(await p.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height) }; };
    const rail = document.querySelector(".rail"), nav = document.querySelector(".nav"), foot = document.querySelector(".rail-foot");
    return { vh: innerHeight, rail: R(rail), nav: R(nav), foot: R(foot),
             navScroll: nav.scrollHeight, navClient: nav.clientHeight,
             railPos: getComputedStyle(rail).position, railH: getComputedStyle(rail).height,
             footBg: getComputedStyle(foot).backgroundColor,
             shellDisplay: getComputedStyle(document.querySelector(".shell")).display,
             railOverflow: getComputedStyle(rail).overflow };
  }), null, 1));
  await p.screenshot({ path: "build/shots/rail-bottom.png", clip: { x: 0, y: 600, width: 260, height: 380 } });
  await b.close();
})();
