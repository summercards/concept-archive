const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
const B = "http://127.0.0.1:8099/index.html";
const OUT = "build/shots/d/";

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
  const errs = []; p.on("pageerror", e => errs.push(e.message.slice(0, 120)));

  async function go(hash, wait) {
    await p.evaluate(h => { location.hash = h; }, hash);
    await p.waitForTimeout(wait || 700);
  }
  async function shot(name, hash, wait) {
    await go(hash, wait);
    await p.screenshot({ path: OUT + name + ".png" });
    console.log("  " + name);
  }

  await p.goto(B + "#/", { waitUntil: "load" });
  await p.waitForTimeout(1500);

  console.log("框架页");
  await shot("01-home", "#/", 900);
  await shot("02-matrix", "#/matrix", 800);
  await shot("03-about", "#/about", 700);

  console.log("分类页");
  await shot("10-cat-MAT", "#/c/MAT", 800);
  await shot("11-cat-MODEL", "#/c/MODEL", 800);
  await shot("12-cat-SFX", "#/c/SFX", 800);
  await shot("13-cat-ENV", "#/c/ENV", 900);
  await shot("14-cat-FX", "#/c/FX", 800);

  console.log("详情页");
  await shot("20-mat-concrete", "#/a/mat.concrete", 1100);
  await shot("21-matf-rust", "#/a/matf.rust", 1100);
  await shot("22-prop-container40hc", "#/a/prop.container40hc", 1100);
  await shot("23-geo-metricBox", "#/a/geo.metricBox", 1100);
  await shot("24-decal-hazard", "#/a/decal.hazard_flammable", 900);
  await shot("25-sfx-rain", "#/a/sfx.rain", 900);
  await shot("26-fx-bloom", "#/a/fx.bloom", 900);
  await shot("27-spring-kickZ", "#/a/spring.kickZ", 900);
  await shot("28-q-ultra", "#/a/q.ultra", 1100);
  await shot("29-env-exposure", "#/a/env.exposure", 1100);
  await shot("30-num-ai", "#/a/num.ai", 1000);
  await shot("31-actor-hound", "#/a/actor.hound", 1000);
  await shot("32-scene-ground", "#/a/scene.ground", 1200);
  await shot("33-weapon-pac9", "#/a/weapon.pac9", 1200);

  console.log("交互态");
  await go("#/", 600);
  await p.fill("#q", "glass");
  await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + "40-search.png" });
  console.log("  40-search");
  await p.fill("#q", "");
  await p.click('#typeFilter .chip[data-cat="SFX"]');
  await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + "41-filter-sfx.png" });
  console.log("  41-filter-sfx");

  console.log("errors:", errs.length ? [...new Set(errs)].join(" | ") : "none");
  await b.close();
})();
