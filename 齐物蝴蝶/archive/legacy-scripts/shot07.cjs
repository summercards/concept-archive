const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');
const path = require('path');
const base = __dirname;
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await page.goto('file://' + path.join(base, 'revision-07', 'index.html'), { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const shots = [
      ['.butterfly-thread', 'butterfly-preview.png'],
      ['.voice', 'voice-preview.png'],
      ['.defocus-module', 'defocus-preview.png'],
      ['[aria-labelledby="film-innocence"]', 'innocence-preview.png']
    ];
    for (const [selector, name] of shots) {
      const el = page.locator(selector);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await el.screenshot({ path: path.join(base, name) });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = page.locator('.butterfly-thread');
    await mobile.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await mobile.screenshot({ path: path.join(base, 'butterfly-mobile-preview.png') });
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
