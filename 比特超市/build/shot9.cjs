const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const BASE = "file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html";

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });

  await p.goto(BASE, { waitUntil: "load" });
  await p.waitForTimeout(3000);

  const wall = await p.$(".pv-wall");
  console.log("wall", !!wall);
  await wall.screenshot({ path: "build/shots/B1-wall.png" });

  // 单格：材质账簿 / 道具台账 / 环境 / 烘焙器
  const tiles = await p.$$(".pv-tile");
  console.log("tiles", tiles.length);
  const keep = ["material-ledger", "props-ledger", "env-atmosphere", "material-baker", "modeling-kit"];
  for (const t of tiles) {
    const id = await t.evaluate((n) => n.getAttribute("href").replace("#/a/", ""));
    if (!keep.includes(id)) continue;
    await t.screenshot({ path: `build/shots/tile-${id}.png` });
  }

  console.log("errors:", errs.length ? errs.join(" | ") : "none");
  await b.close();
})();
