const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('file:///Users/zyq/work/锚机/dream-concept/revision-08/index.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.hnote').scrollIntoViewIfNeeded();
  await page.locator('.hnote').screenshot({ path: 'horror-research-tail.png' });
  await browser.close();
})();
