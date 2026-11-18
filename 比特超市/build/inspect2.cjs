const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(500);
  const out = await p.evaluate(() => {
    const nav = document.querySelector("#nav");
    const items = [...nav.children].slice(0, 3);
    const r = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const report = items.map(el => {
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName, cls: el.className, text: el.textContent.trim().slice(0, 30),
        rect: r(el), color: cs.color, opacity: cs.opacity, visibility: cs.visibility,
        display: cs.display, fontSize: cs.fontSize, position: cs.position,
        transform: cs.transform, clip: cs.clipPath, overflow: cs.overflow,
      };
    });
    // what's on top at a nav item center?
    const it = nav.querySelector(".nav-item");
    const b2 = it.getBoundingClientRect();
    const cx = b2.x + b2.width / 2, cy = b2.y + b2.height / 2;
    const stack = document.elementsFromPoint(cx, cy).map(e => e.tagName + "." + (e.className || "") + "#" + (e.id || "")).slice(0, 6);
    const navCS = getComputedStyle(nav);
    return {
      report, stack, hitPoint: { cx: Math.round(cx), cy: Math.round(cy) },
      navOpacity: navCS.opacity, navFilter: navCS.filter, navMix: navCS.mixBlendMode,
      navColor: navCS.color, navZ: navCS.zIndex, navPosition: navCS.position,
      navboxOverflow: getComputedStyle(document.querySelector("#navbox")).overflow,
      railOverflow: getComputedStyle(document.querySelector("#rail")).overflow,
    };
  });
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
