const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const BASE = "file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html";

(async () => {
  const b = await chromium.launch();
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });

  // 首页预览墙：整页，看 10 张预览是否都出图
  await p.goto(BASE, { waitUntil: "load" });
  await p.waitForTimeout(2600);
  const info = await p.evaluate(() => {
    const tiles = [...document.querySelectorAll(".tile")];
    const cv = [...document.querySelectorAll("canvas")];
    return {
      tiles: tiles.length,
      canvases: cv.length,
      blank: cv.filter((c) => c.width === 0 || c.height === 0).length,
      fail: [...document.querySelectorAll(".pv-fail")].map((n) => n.textContent.slice(0, 40)),
      docH: document.documentElement.scrollHeight,
    };
  });
  console.log("home", JSON.stringify(info));
  await p.screenshot({ path: "build/shots/A1-home-top.png" });
  await p.screenshot({ path: "build/shots/A2-home-full.png", fullPage: true });

  const pages = [
    ["props-ledger", "A3-props"],
    ["env-atmosphere", "A4-env"],
    ["modeling-kit", "A5-kit"],
    ["material-ledger", "A6-ledger"],
    ["material-baker", "A7-baker"],
    ["#/matrix", "A8-matrix"],
  ];
  for (const [id, name] of pages) {
    await p.goto(BASE + (id.charAt(0) === "#" ? id : "#/a/" + id), { waitUntil: "load" });
    await p.waitForTimeout(id === "#/matrix" ? 600 : 2400);
    const st = await p.evaluate(() => {
      const fail = document.querySelector(".pv-fail");
      const cv = document.querySelector("canvas");
      return { fail: fail ? fail.textContent.slice(0, 40) : null, cv: cv ? cv.width + "x" + cv.height : null };
    });
    console.log(id, JSON.stringify(st));
    await p.screenshot({ path: `build/shots/${name}.png` });
  }

  console.log("errors:", errs.length ? errs.join(" | ") : "none");
  await b.close();
})();
