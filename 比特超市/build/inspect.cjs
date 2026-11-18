const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto('file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);

  const info = await p.evaluate(() => {
    const q = s => document.querySelector(s);
    const box = el => el ? { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), top: Math.round(el.getBoundingClientRect().top) } : null;
    const nav = q('#nav'), navbox = q('#navbox'), rail = q('#rail'), foot = q('.rail-foot');
    const cs = el => el ? getComputedStyle(el) : null;
    return {
      errs: null,
      nav: box(nav),
      navbox: box(navbox),
      rail: box(rail),
      foot: box(foot),
      navChildren: nav ? nav.children.length : -1,
      navHTMLlen: nav ? nav.innerHTML.length : -1,
      navFirst: nav && nav.firstElementChild ? nav.firstElementChild.outerHTML.slice(0, 160) : null,
      navboxDisplay: cs(navbox) ? cs(navbox).display : null,
      navboxFlex: cs(navbox) ? cs(navbox).flex : null,
      navDisplay: cs(nav) ? cs(nav).display : null,
      navHeightCSS: cs(nav) ? cs(nav).height : null,
      navOverflow: cs(nav) ? cs(nav).overflowY : null,
      navScrollH: nav ? nav.scrollHeight : -1,
      summaryDisplay: q('#navbox > summary') ? cs(q('#navbox > summary')).display : null,
      docH: document.documentElement.scrollHeight,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  console.log('ERRORS:', errs.length ? errs.join('\n') : 'none');
  await b.close();
})();
