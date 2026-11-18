const { chromium } = require('/Users/zyq/work/wc/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = '/Users/zyq/WorkBuddy/2026-11-15-17-10-04';
const BASE = 'http://127.0.0.1:8099/index.html';
const OUT = path.join(ROOT, 'outputs/rubber-duck');
(async () => {
  const browser = await chromium.launch();
  const errors = [], results = [];
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1060 }, deviceScaleFactor: 1.5 });
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    await p.goto(BASE + '#/');
    await p.waitForFunction(() => document.querySelectorAll('#authoredWall canvas[data-authored]').length === 2);
    const home = await p.evaluate(() => ({ original: DB.items.length, authored: AUTHORED_CATALOG.items.length,
      recent: [...document.querySelectorAll('#authoredWall .pv-tile')].map(e => e.getAttribute('href')),
      fail: [...document.querySelectorAll('.pv-fail')].map(e => e.textContent) }));
    assert.equal(home.authored, 2); assert.equal(home.fail.length, 0);
    results.push({ check: 'homepage', ...home });
    await p.locator('#authoredRecent').scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(OUT, 'library-recent.png') });
    await p.evaluate(() => { location.hash = '#/c/NEW'; });
    await p.waitForFunction(() => document.querySelectorAll('#newCatWall canvas[data-authored]').length === 2);
    await p.screenshot({ path: path.join(OUT, 'library-new-category.png') });
    await p.fill('#q', '小黄鸭');
    const search = await p.locator('.nav-item').allTextContents();
    assert.equal(search.length, 1); assert.match(search[0], /小黄鸭/);
    results.push({ check: 'search', matches: search });
    await p.fill('#q', '');
    await p.evaluate(() => { location.hash = '#/a/new.rubber-duck'; });
    await p.waitForSelector('canvas[data-authored="new.rubber-duck"]');
    const links = await p.locator('#authoredContract .contract-links a').evaluateAll(es => es.map(e => ({ text: e.textContent, href: e.getAttribute('href') })));
    assert.equal(links.length, 3);
    for (const link of links) {
      if (link.href.endsWith('asset-review.html')) continue;
      const response = await p.request.get(new URL(link.href, BASE).toString());
      assert.equal(response.status(), 200, link.href);
    }
    results.push({ check: 'detail-links', links });
    await p.getByRole('button', { name: 'cream', exact: true }).click();
    await p.locator('#pvHost').screenshot({ path: path.join(OUT, 'cream-variant.png') });
    await p.getByRole('button', { name: 'yellow', exact: true }).click();
    await p.getByRole('button', { name: '结构线框', exact: true }).click();
    await p.locator('#pvHost').screenshot({ path: path.join(OUT, 'wire-check.png') });
    await p.getByRole('button', { name: '原材质', exact: true }).click();
    // Inspect actual mesh topology independently from the generic verifier.
    const topology = await p.evaluate(() => {
      const id = 'new.rubber-duck';
      const root = AUTHORED_BUILDERS[id].build(PREVIEWS.authoredContext(id, { color: 'yellow' }), { color: 'yellow' });
      const g = root.getObjectByName('body').geometry, edges = new Map(), indices = g.index.array;
      for (let i = 0; i < indices.length; i += 3) for (const [a, b] of [[indices[i], indices[i+1]], [indices[i+1], indices[i+2]], [indices[i+2], indices[i]]]) {
        const key = a < b ? a + ':' + b : b + ':' + a;
        edges.set(key, (edges.get(key) || 0) + 1);
      }
      const counts = [...edges.values()];
      root.userData.dispose();
      return { boundaryEdges: counts.filter(n => n === 1).length, nonManifoldEdges: counts.filter(n => n !== 2).length,
        edgeCount: counts.length, triangles: indices.length / 3 };
    });
    assert.equal(topology.nonManifoldEdges, 0);
    results.push({ check: 'closed-shell', ...topology });
    for (const hash of ['#/authoring', '#/alignment', '#/a/prop.container40hc']) {
      await p.evaluate(h => { location.hash = h; }, hash);
      await p.waitForFunction(() => !!document.querySelector('h1'));
      assert.equal(await p.locator('.pv-fail').count(), 0);
      results.push({ check: 'regression', hash, h1: await p.locator('h1').textContent() });
    }
    await p.goto('http://10.30.70.199:8100/index.html#/a/new.rubber-duck');
    await p.waitForSelector('canvas[data-authored="new.rubber-duck"]');
    results.push({ check: 'LAN', url: p.url(), status: 'PASS' });
    await p.setViewportSize({ width: 390, height: 844 });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.equal(overflow, 0);
    await p.locator('#pvHost').scrollIntoViewIfNeeded();
    await p.screenshot({ path: path.join(OUT, 'mobile.png') });
    results.push({ check: 'mobile', width: 390, overflow });
    assert.equal(errors.length, 0, errors.join('\n'));
    fs.writeFileSync(path.join(OUT, 'library-verification.json'), JSON.stringify({ status: 'PASS', errors, results }, null, 2));
    console.log(JSON.stringify({ status: 'PASS', errors, results }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
