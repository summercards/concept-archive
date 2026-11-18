const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(String(e.message).slice(0, 140)));
  const BASE = "http://127.0.0.1:8099/index.html";
  await p.goto(BASE + "#/", { waitUntil: "load" }); await p.waitForTimeout(700);
  const ids = ["num.player","num.move","num.ai","num.weapon","num.waves","num.input",
               "actor.player","actor.hound","actor.gull"];
  for (const id of ids) {
    await p.evaluate(i => { location.hash = "#/a/" + i; }, id);
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const f = document.querySelector(".pv-fail");
      const cvs = [...document.querySelectorAll(".pv-cv")];
      const note = document.querySelector(".pv-note");
      return { fail: f ? f.textContent.slice(0, 70) : null, n: cvs.length,
               px: cvs.map(c => c.width + "x" + c.height).join(","),
               note: note ? note.textContent.slice(0, 60) : null };
    });
    console.log(id.padEnd(14), JSON.stringify(r));
  }
  console.log("errors:", errs.length ? [...new Set(errs)].join(" | ") : "none");
  await b.close();
})();
