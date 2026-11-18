const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html", { waitUntil: "load" });
  await p.waitForTimeout(2500);

  const info = await p.evaluate(() => {
    const g = window.PREVIEWS ? window.PREVIEWS.note3d() : "no PREVIEWS";
    const wall = document.querySelector(".pv-wall");
    const tiles = document.querySelectorAll(".pv-tile");
    const frames = [...document.querySelectorAll(".pv-frame")];
    return {
      gl: g,
      hasModules: !!window.ASSET_MODULES,
      modKeys: window.ASSET_MODULES ? Object.keys(window.ASSET_MODULES) : [],
      tiles: tiles.length,
      frames: frames.map(f => {
        const c = f.querySelector("canvas");
        return c ? c.width + "x" + c.height : "NO-CANVAS";
      }),
      fails: [...document.querySelectorAll(".pv-fail")].map(e => e.textContent),
      tagChips: document.querySelectorAll("#tagFilter .chip").length,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  console.log("ERRORS:", errs.length ? errs.join("\n") : "none");
  await b.close();
})();
