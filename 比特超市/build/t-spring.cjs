const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  const ids = ['spring.kickZ','spring.kickY','spring.swayX','spring.swayY','spring.recoil'];
  for (const id of ids) {
    await p.goto('http://127.0.0.1:8099/index.html#/a/' + id, { waitUntil: 'load' });
    await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const f = document.querySelector('.pv-fail');
      const cv = document.querySelector('.pv-cv');
      const note = document.querySelector('.pv-note');
      return { fail: f ? f.textContent.slice(0, 90) : null, cv: cv ? cv.width + 'x' + cv.height : null,
               note: note ? note.textContent.slice(0, 90) : null,
               h1: (document.querySelector('h1') || {}).textContent };
    });
    console.log(id, JSON.stringify(r));
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
