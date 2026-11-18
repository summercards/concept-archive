const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  // 桌面
  const d = await b.newPage({ viewport: { width: 1440, height: 980 } });
  await d.goto("http://127.0.0.1:8099/index.html#/", { waitUntil: "load" });
  await d.waitForTimeout(900);
  console.log("桌面 nav 可滚动:", JSON.stringify(await d.evaluate(() => {
    const n = document.querySelector(".nav");
    return { client: Math.round(n.clientHeight), scroll: Math.round(n.scrollHeight), canScroll: n.scrollHeight > n.clientHeight,
             btnVisible: getComputedStyle(document.querySelector(".navbox-summary")).display };
  })));
  await d.screenshot({ path: "build/shots/rail-fixed.png", clip: { x: 0, y: 560, width: 300, height: 420 } });
  // 移动
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto("http://127.0.0.1:8099/index.html#/", { waitUntil: "load" });
  await m.waitForTimeout(900);
  const before = await m.evaluate(() => ({ open: document.querySelector("#navbox").dataset.open,
    navShown: getComputedStyle(document.querySelector(".nav")).display, h: innerHeight,
    docTop: Math.round(document.querySelector("#main").getBoundingClientRect().top) }));
  await m.click("#navboxBtn"); await m.waitForTimeout(300);
  const after = await m.evaluate(() => ({ open: document.querySelector("#navbox").dataset.open,
    navShown: getComputedStyle(document.querySelector(".nav")).display,
    scroll: Math.round(document.querySelector(".nav").scrollHeight) }));
  console.log("移动 初始:", JSON.stringify(before), "点击后:", JSON.stringify(after));
  await m.screenshot({ path: "build/shots/m/nav-open.png" });
  await b.close();
})();
