const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('file:///Users/zyq/work/锚机/dream-concept/revision-08/index.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(i => i.loading = 'eager');
    await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {})));
  });
  await page.locator('#horror').screenshot({ path: 'horror-preview.png' });
  await page.locator('#horror .horror-rules').screenshot({ path: 'horror-rules-preview.png' });
  await page.locator('.hnote').scrollIntoViewIfNeeded();
  await page.locator('#culture .wrap').screenshot({ path: 'horror-research-preview.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#horror').screenshot({ path: 'horror-mobile-preview.png' });
  await browser.close();
})();
