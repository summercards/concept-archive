"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");
const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");

const ROOT = __dirname;
const OUT = path.join(ROOT, "validation");
fs.mkdirSync(OUT, { recursive: true });
const report = {
  startedAt: new Date().toISOString(),
  htmlSha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, "index.html"))).digest("hex"),
  checks: [],
  errors: [],
  external: [],
  shots: [],
  scope: "真实浏览器启动、任务交互、虫群实例状态、攀爬堆叠、真实鼠标开火/原版射线命中桥接、暂停与移动端溢出；固定摄影相机为补充证据；noaudio路径不证明主观听音。"
};
let browser;
function check(name, ok, detail) {
  report.checks.push({ name, ok: !!ok, detail });
  if (!ok) throw new Error(name + ": " + JSON.stringify(detail));
}
(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: "/Users/zyq/Library/Caches/ms-playwright/chromium-1254/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    args: ["--disable-dev-shm-usage"]
  });
  report.browser = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, offline: true, serviceWorkers: "block" });
  await context.route(/^https?:\/\//, route => { report.external.push(route.request().url()); return route.abort(); });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  page.on("pageerror", error => report.errors.push(String(error.stack || error)));
  page.on("console", message => { if (message.type() === "error") report.errors.push(message.text()); });
  const url = pathToFileURL(path.join(ROOT, "index.html"));
  url.search = "q=high&dynres=0&dt=0.016666666666666666&noaudio=1";
  await page.goto(url.href);
  await page.waitForFunction(() => window.__ready || window.__fatal);
  await page.waitForFunction(() => document.getElementById("boot").hidden);
  await page.waitForFunction(() => getComputedStyle(document.getElementById("boot")).display === "none");
  check("启动与高级渲染", await page.evaluate(() => !__fatal && __G.game.state === "title" && __G.render.advanced), await page.evaluate(() => ({ fatal: __fatal, state: __G.game.state, advanced: __G.render.advanced, stats: __stats() })));
  await page.screenshot({ path: path.join(OUT, "verify-title.png") });
  report.shots.push("verify-title.png");

  await page.locator('[data-nc-action="start"]').click();
  await page.waitForFunction(() => __G.game.state === "playing");
  check("第一人称防卫态", await page.evaluate(() => __G.game.state === "playing" && __G.level.cyber.sceneStats.swarmMax === 128), await page.evaluate(() => ({ state: __G.game.state, scene: __G.level.cyber.sceneStats })));
  const frames = async count => { const start = await page.evaluate(() => __frames); await page.waitForFunction(([s, n]) => __frames >= s + n, [start, count]); };
  const snapshot = () => page.evaluate(() => ({ status: __G.level.cyber.swarm.status, errors: __errors, stats: __stats(), player: __G.player.pos.toArray() }));

  await page.keyboard.down("KeyE");
  await frames(80);
  await page.keyboard.up("KeyE");
  await frames(4);
  check("真实E启动防卫协议", await page.evaluate(() => __cyber.stage === 1 && __G.level.cyber.swarm.status.phase === "inbound" && __G.level.cyber.swarm.status.active >= 26), await snapshot());
  await page.screenshot({ path: path.join(OUT, "verify-inbound.png") });
  report.shots.push("verify-inbound.png");

  await frames(680);
  const wave = await page.evaluate(() => ({ status: __G.level.cyber.swarm.status, climbers: __G.level.cyber.swarm.bugs.filter(b => b.alive && b.climber).map(b => ({ id: b.id, host: b.host, stack: b.stack, pos: b.pos.toArray() })), stats: __stats() }));
  check("虫潮实例池与波次增长", wave.status.active > 50 && wave.status.spawned >= 80 && wave.status.active <= 128 && wave.stats.advanced === true, wave);
  check("虫群攀爬堆叠状态", wave.climbers.length >= 1 && wave.climbers.every(b => b.host >= 0 && b.stack >= 1), wave.climbers.slice(0, 8));

  await page.evaluate(() => { __G.player.reset({ pos: new __G.THREE.Vector3(0, 0, 8), yaw: 0 }); __G.input.mode = "lock"; });
  await frames(4);
  await page.keyboard.press("Digit1");
  await frames(6);
  const target = await page.evaluate(() => {
    const bug = __G.level.cyber.swarm.bugs.find(b => b.alive && b.z < 0);
    const p = __G.player;
    const t = bug.pos.clone(); t.y += .4;
    const dx = t.x - p.eye.x, dz = t.z - p.eye.z;
    p.yaw = Math.atan2(-dx, -dz);
    p.pitch = Math.atan2(t.y - p.eye.y, Math.hypot(dx, dz));
    __G.camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");
    return { id: bug.id, target: t.toArray(), hp: bug.hp };
  });
  const ammoBefore = await page.evaluate(() => ({ ammo: __G.weapon.ammo, shots: __G.combat.stats.shots }));
  await page.mouse.down();
  await frames(18);
  await page.mouse.up();
  await frames(5);
  const fired = await page.evaluate(id => ({ ammo: __G.weapon.ammo, shots: __G.combat.stats.shots, hits: __G.combat.stats.hits, target: __G.level.cyber.swarm.bugs.find(b => b.id === id) }), target.id);
  check("真实鼠标开火与弹药提交", fired.shots > ammoBefore.shots && fired.ammo < ammoBefore.ammo, { target, ammoBefore, fired });
  check("原版射线命中虫群桥接", fired.hits >= 1, fired);
  await page.screenshot({ path: path.join(OUT, "verify-fire.png") });
  report.shots.push("verify-fire.png");

  const pausedBefore = await page.evaluate(() => __G.level.cyber.swarm.status.waveTime);
  await page.keyboard.press("KeyP");
  await page.waitForFunction(() => __G.game.state === "paused");
  await frames(40);
  const pausedAfter = await page.evaluate(() => __G.level.cyber.swarm.status.waveTime);
  check("暂停冻结虫潮局部时间", Math.abs(pausedAfter - pausedBefore) < 0.001, { pausedBefore, pausedAfter });
  await page.locator('[data-nc-action="resume"]').click();
  await page.waitForFunction(() => __G.game.state === "playing");
  await frames(4);

  await page.setViewportSize({ width: 390, height: 844 });
  await frames(4);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("窄屏无横向溢出", overflow <= 1, { overflow });
  await page.screenshot({ path: path.join(OUT, "verify-mobile.png") });
  report.shots.push("verify-mobile.png");
  check("零运行异常与零外联", report.errors.length === 0 && report.external.length === 0, { errors: report.errors, external: report.external });
  report.final = await page.evaluate(() => ({ stats: __stats(), scene: __G.level.cyber.sceneStats, swarm: __G.level.cyber.swarm.status, stubs: Object.fromEntries(["mats", "ground", "backdrop", "fx", "weapon", "enemies", "hud"].map(k => [k, !!__G[k].stub])) }));
  report.ok = true;
})().catch(error => {
  report.ok = false;
  report.failure = String(error.stack || error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: report.ok, checks: report.checks, failure: report.failure, errors: report.errors }, null, 2));
});
