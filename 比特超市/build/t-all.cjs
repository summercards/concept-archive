const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const fs = require("fs"), path = require("path");
const ROOT = "/Users/zyq/WorkBuddy/2026-11-15-17-10-04";
const B = "http://127.0.0.1:8099/index.html";
const src = fs.readFileSync(path.join(ROOT, "assets/data.js"), "utf8");
const J = JSON.parse(src.replace(/^[^{]*/, "").replace(/;\s*$/, ""));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push(String(e.message).slice(0, 120)));
  await p.goto(B + "#/", { waitUntil: "load" });
  await p.waitForTimeout(800);

  const rows = [];
  for (const it of J.items) {
    await p.evaluate(id => { location.hash = "#/a/" + id; }, it.id);
    await p.waitForTimeout(it.kind === "sfx" || it.kind === "actor" ? 260 : 420);
    const r = await p.evaluate(() => {
      const f = document.querySelector(".pv-fail");
      const cvs = document.querySelectorAll(".pv-cv");
      const h1 = document.querySelector("h1");
      return { fail: f ? f.textContent.slice(0, 80) : null, n: cvs.length,
               h1: h1 ? h1.textContent : null };
    });
    const bad = r.fail || !r.h1 || (r.n === 0 && it.kind !== "decal" && it.kind !== "spec");
    if (bad) rows.push({ id: it.id, kind: it.kind, ...r });
  }
  console.log("checked", J.items.length, "bad", rows.length);
  rows.forEach(r => console.log(" ", JSON.stringify(r)));
  console.log("pageerrors:", errs.length ? [...new Set(errs)].slice(0, 6).join(" | ") : "none");
  await b.close();
})();
