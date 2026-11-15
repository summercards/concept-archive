'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');
const { setTimeout: retryDelay } = require('node:timers/promises');

const ROOT = path.resolve(__dirname, '..');
const TARGET = process.env.HOMEPAGE_URL || pathToFileURL(path.join(ROOT, 'index.html')).href;
const REPORT = path.join(__dirname, 'homepage-verification.json');
const PREVIEWS = path.join(ROOT, 'previews');
const IDS = ['top', 'story', 'dreams', 'experience', 'butterfly', 'awakening', 'credits'];
const NAV_IDS = ['story', 'dreams', 'experience', 'butterfly'];
const DREAM_NAMES = { forest: /森|林/u, valley: /谷/u, water: /水/u };
const TIMEOUT = 12000;
// 仅依赖 playwright 与 Node；该安装未必包含 @playwright/test 的 expect。
// 所有重试均围绕明确断言，定时器只作为条件轮询间隔，不作动画等待。
function expect(subject, options = {}) {
  function matchers(negate) {
    async function verify(test, description) {
      const deadline = Date.now() + TIMEOUT;
      let lastError;
      do {
        try {
          const value = typeof subject === 'function' ? await subject() : subject;
          const passed = await test(value);
          assert.ok(negate ? !passed : passed, options.message || `${negate ? '不应' : '应'}${description}`);
          return;
        } catch (error) {
          lastError = error;
        }
        if (Date.now() >= deadline) throw lastError;
        await retryDelay(80);
      } while (true);
    }
    const api = {
      toBe: expected => verify(value => Object.is(value, expected), `等于 ${String(expected)}`),
      toEqual: expected => verify(value => {
        try { assert.deepEqual(value, expected); return true; } catch { return false; }
      }, `深度等于 ${JSON.stringify(expected)}`),
      toBeLessThanOrEqual: maximum => verify(value => value <= maximum, `不大于 ${maximum}`),
      toHaveCount: count => verify(async locator => await locator.count() === count, `有 ${count} 个匹配元素`),
      toHaveAttribute: (name, expected) => verify(async locator => await locator.getAttribute(name) === expected, `具有 ${name}="${expected}"`),
      toHaveClass: pattern => verify(async locator => pattern.test(await locator.getAttribute('class') || ''), `具有样式类 ${pattern}`),
      toBeVisible: () => verify(locator => locator.isVisible(), '可见'),
      toBeFocused: () => verify(locator => locator.evaluate(element => document.activeElement === element), '获得焦点'),
      toContainText: expected => verify(async locator => {
        const text = await locator.innerText();
        return expected instanceof RegExp ? expected.test(text) : text.includes(expected);
      }, `包含正文 ${expected}`),
      toHaveURL: pattern => verify(page => pattern.test(page.url()), `匹配 URL ${pattern}`),
      toBeInViewport: () => verify(locator => locator.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      }), '位于视口中'),
    };
    Object.defineProperty(api, 'not', { get: () => matchers(!negate) });
    return api;
  }
  return matchers(false);
}
expect.poll = (callback, options) => expect(callback, options);

const report = {
  url: TARGET,
  startedAt: new Date().toISOString(),
  status: 'running',
  checks: [],
  screenshots: [],
  pageErrors: [],
  consoleErrors: [],
  localResourceFailures: [],
};
let browser;

function errorText(error) {
  return error instanceof Error ? error.stack || error.message : String(error);
}

async function check(name, action) {
  const item = { name, status: 'running' };
  report.checks.push(item);
  try {
    await action();
    item.status = 'passed';
    console.log(`通过：${name}`);
  } catch (error) {
    item.status = 'failed';
    item.error = errorText(error);
    console.error(`失败：${name}\n${item.error}`);
  }
}

function isIgnoredURL(url) {
  return /design[-_]notes/i.test(url);
}

function isLocalURL(value) {
  try {
    const url = new URL(value);
    const target = new URL(TARGET);
    if (url.protocol === 'file:') return target.protocol === 'file:';
    return url.origin === target.origin || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  } catch {
    return false;
  }
}

async function watch(page, label) {
  const ignoredFrames = new WeakSet();
  page.on('frameattached', frame => ignoredFrames.add(frame));
  // pageerror 事件不带 frame；在主文档捕获对应的 error/unhandledrejection，
  // 可准确排除包括 srcdoc、about:blank 在内的 iframe 异常。
  await page.exposeBinding('__homepageQAError', (source, text) => {
    if (source.frame !== page.mainFrame() || isIgnoredURL(text)) return;
    report.pageErrors.push({ context: label, error: text });
  });
  await page.addInitScript(() => {
    if (window !== window.top) return;
    const record = value => window.__homepageQAError(value).catch(() => {});
    window.addEventListener('error', event => {
      if (event instanceof ErrorEvent) record(event.error?.stack || `${event.message} ${event.filename}:${event.lineno}`);
    });
    window.addEventListener('unhandledrejection', event => record(event.reason?.stack || String(event.reason)));
  });
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location();
    if (isIgnoredURL(location.url || '') || isIgnoredURL(message.text())) return;
    if (page.frames().some(frame => frame !== page.mainFrame() && frame.url() === location.url)) return;
    report.consoleErrors.push({ context: label, text: message.text(), location });
  });
  function relevant(request) {
    if (!isLocalURL(request.url()) || isIgnoredURL(request.url())) return false;
    try {
      const frame = request.frame();
      return frame === page.mainFrame() && !ignoredFrames.has(frame);
    } catch {
      return false;
    }
  }
  page.on('requestfailed', request => {
    if (!relevant(request)) return;
    const error = request.failure()?.errorText || '未知资源错误';
    // 视频主动关闭会取消尚未完成的媒体流，这不是本地资源缺失。
    if (request.resourceType() === 'media' && /ERR_ABORTED|NS_BINDING_ABORTED/i.test(error)) return;
    report.localResourceFailures.push({ context: label, url: request.url(), error });
  });
  page.on('response', response => {
    if (response.status() < 400 || !relevant(response.request())) return;
    report.localResourceFailures.push({ context: label, url: response.url(), status: response.status() });
  });
}

async function openPage(context, label) {
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  await watch(page, label);
  await page.goto(TARGET, { waitUntil: 'load', timeout: 30000 });
  await expect(page.locator('h1')).toHaveAttribute('aria-label', '齐物·胡蝶');
  return page;
}

async function loadedImages(scope) {
  const images = scope.locator('img');
  assert.ok(await images.count(), '验收区域应有图片');
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => ({
      complete: img.complete,
      valid: img.naturalWidth > 0 && img.naturalHeight > 0 && img.getBoundingClientRect().width > 0 && img.getBoundingClientRect().height > 0,
    })), { message: '图片必须成功解码并具有有效自然尺寸及显示尺寸' }).toEqual({ complete: true, valid: true });
    // 只检查自然尺寸和有效显示尺寸；cover 裁切不要求显示框与原图比例相等。
  }
}

async function stableStill(page) {
  await expect(page.locator('body')).toHaveClass(/\bstill\b/);
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(async () => {
    await document.fonts.ready;
    // 等待字体与两次布局提交，不使用固定时长 sleep，也不等待可能无限循环的环境动画。
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await expect.poll(() => page.evaluate(() => {
    const targets = ['top', 'story', 'dreams', 'experience', 'butterfly', 'awakening', 'credits'];
    return targets.every(id => {
      const element = document.getElementById(id);
      if (!element || element.getBoundingClientRect().height <= 0) return false;
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) < 0.99) return false;
      }
      return true;
    });
  }), { message: '停镜模式下所有关键段落须完成入场并可见' }).toBe(true);
}

async function screenshot(page, name, section) {
  if (section) await page.locator(`#${section}`).scrollIntoViewIfNeeded();
  else await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const file = path.join(PREVIEWS, `home-${name}.png`);
  // 仅保存当前视口，避免为长页反复生成大图。
  await page.screenshot({ path: file, fullPage: false, animations: 'disabled' });
  report.screenshots.push(file);
}

async function assertCopy(page) {
  const body = page.locator('body');
  await expect(body).toContainText(/概念/u);
  await expect(body).toContainText(/非实机|并非实机|不是实机|不代表实机|非游戏实录|非实际游戏画面/u);
  await expect(body).toContainText('无署名委托');
  await expect(body).toContainText(/观蝶[，、\s]*不随蝶/u);
  for (const name of Object.values(DREAM_NAMES)) await expect(page.locator('#dreams')).toContainText(name);
}

async function assertStructure(page) {
  for (const id of IDS) {
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  for (const id of NAV_IDS) {
    const links = page.locator(`.site-nav a[href="#${id}"]`);
    assert.ok(await links.count() > 0, `导航缺少 #${id}`);
  }
  const issues = await page.evaluate(() => {
    const errors = [];
    const counts = new Map();
    for (const element of document.querySelectorAll('[id]')) {
      const id = element.id;
      if (!id) errors.push('存在空 ID');
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    for (const [id, count] of counts) if (count > 1) errors.push(`重复 ID：${id}`);
    for (const anchor of document.querySelectorAll('a')) {
      const raw = anchor.getAttribute('href');
      if (!raw || !raw.trim() || raw.trim() === '#') {
        errors.push(`空链接：${anchor.textContent.trim()}`);
        continue;
      }
      try {
        const url = new URL(raw, document.baseURI);
        if (!['http:', 'https:', 'file:', 'mailto:', 'tel:'].includes(url.protocol)) errors.push(`无效链接协议：${raw}`);
        const current = new URL(location.href);
        if (url.origin === current.origin && url.pathname === current.pathname && url.search === current.search && url.hash) {
          const id = decodeURIComponent(url.hash.slice(1));
          if (!document.getElementById(id)) errors.push(`锚点不存在：${raw}`);
        }
      } catch {
        errors.push(`无法解析的链接：${raw}`);
      }
    }
    for (const image of document.querySelectorAll('img')) {
      const candidates = [image.getAttribute('src'), image.currentSrc].filter(Boolean);
      if (!candidates.length) errors.push('图片未声明本地资源');
      for (const candidate of candidates) {
        const url = new URL(candidate, document.baseURI);
        const base = new URL(document.baseURI);
        const assets = new URL('assets/', document.baseURI);
        if (url.origin !== base.origin || url.protocol !== base.protocol || !url.pathname.startsWith(assets.pathname)) {
          errors.push(`图片不在本地 assets 中：${candidate}`);
        }
      }
    }
    return errors;
  });
  assert.deepEqual(issues, [], '链接、锚点、ID 及图片路径必须合法且无冲突');
}

async function assertDream(page, key) {
  const tabs = page.getByRole('tab');
  // 以 data-dream 作为契约，不依赖视觉文案中的标点或换行。
  for (const tab of await tabs.all()) {
    await expect(tab).toHaveAttribute('aria-selected', String(await tab.getAttribute('data-dream') === key));
  }
  const panel = page.locator('#dream-panel');
  await expect(panel).toHaveAttribute('role', 'tabpanel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(DREAM_NAMES[key]);
  await loadedImages(panel);
  const imageURLs = await panel.locator('img').evaluateAll(images => images.map(image => image.currentSrc || image.src));
  assert.ok(imageURLs.length, `${key} 梦域必须显示图片`);
  return imageURLs.join('|');
}

async function verifyDreams(page) {
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  const order = await tabs.evaluateAll(elements => elements.map(element => element.dataset.dream));
  assert.deepEqual([...order].sort(), ['forest', 'valley', 'water'], '三个梦域标识必须完整且唯一');
  const sources = [];
  for (const key of order) {
    await page.locator(`[role="tab"][data-dream="${key}"]`).click();
    sources.push(await assertDream(page, key));
  }
  assert.equal(new Set(sources).size, 3, '切换梦域必须更换 #dream-panel 图片');
  const first = page.locator(`[role="tab"][data-dream="${order[0]}"]`);
  await first.click();
  await first.focus();
  for (let index = 1; index < order.length; index++) {
    await page.keyboard.press('ArrowRight');
    await assertDream(page, order[index]);
    await expect(page.locator(`[role="tab"][data-dream="${order[index]}"]`)).toBeFocused();
  }
  for (let index = order.length - 2; index >= 0; index--) {
    await page.keyboard.press('ArrowLeft');
    await assertDream(page, order[index]);
    await expect(page.locator(`[role="tab"][data-dream="${order[index]}"]`)).toBeFocused();
  }
  await expect(first).toBeFocused();
}

async function verifyPlay(page) {
  const buttons = page.locator('button[data-play]');
  await expect(page.locator('[data-play]')).toHaveCount(3);
  await expect(buttons).toHaveCount(3);
  const keys = await buttons.evaluateAll(elements => elements.map(element => element.dataset.play).sort());
  assert.deepEqual(keys, ['0', '1', '2']);
  const copies = [];
  for (const key of keys) {
    await page.locator(`button[data-play="${key}"]`).click();
    for (const other of keys) {
      await expect(page.locator(`button[data-play="${other}"]`)).toHaveAttribute('aria-pressed', String(other === key));
    }
    await expect(page.locator('#play-copy')).toBeVisible();
    await expect(page.locator('#play-copy')).toContainText(/\S/u);
    await expect.poll(async () => copies.includes((await page.locator('#play-copy').innerText()).trim()), {
      message: `玩法 ${key} 必须显示区别于已选玩法的说明`,
    }).toBe(false);
    const text = (await page.locator('#play-copy').innerText()).trim();
    assert.ok(!copies.includes(text), '三个玩法应有不同说明');
    copies.push(text);
  }
}

async function verifyFilm(page) {
  const dialog = page.locator('dialog#film-dialog');
  const video = page.locator('video#reference-film');
  await expect(dialog).toHaveCount(1);
  await expect(video).toHaveCount(1);
  await expect(dialog).not.toBeVisible();
  const deferred = await video.evaluate(element => {
    const hasSource = Boolean(element.getAttribute('src')) || [...element.querySelectorAll('source')].some(source => source.getAttribute('src'));
    return !hasSource || element.preload === 'none';
  });
  assert.ok(deferred, '视频打开前须无 src（含 source 子节点）或 preload="none"');
  const triggers = page.locator('[data-film]');
  assert.ok(await triggers.count() > 0, '应有视频入口');
  for (const trigger of await triggers.all()) {
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate(element => element.open)).toBe(true);
    await expect(video).toBeVisible();
    const close = dialog.locator('button[data-close-film]');
    await expect(close).toBeVisible();
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect.poll(() => dialog.evaluate(element => element.open)).toBe(false);
  }
  await triggers.first().click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect.poll(() => dialog.evaluate(element => element.open)).toBe(false);
}

async function verifyMobileMenu(page) {
  const toggle = page.locator('button#menu-toggle');
  const menu = page.locator('#site-menu');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-controls', 'site-menu');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).not.toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  for (const id of NAV_IDS) await expect(menu.locator(`a[href="#${id}"]`)).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).not.toBeVisible();
}

async function noOverflow(page, width, height) {
  await page.setViewportSize({ width, height });
  await stableStill(page);
  for (const id of IDS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth), {
      message: `${width}×${height}，#${id} 不应产生横向溢出`,
    }).toBeLessThanOrEqual(1);
  }
}

async function run() {
  try {
    assert.ok(['file:', 'http:', 'https:'].includes(new URL(TARGET).protocol), 'HOMEPAGE_URL 须为 file/http/https URL');
    await fs.mkdir(PREVIEWS, { recursive: true });
    browser = await chromium.launch({ headless: true });
    const standard = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    await check('默认动态及停镜按钮双向切换', async () => {
      const page = await openPage(standard, '默认动态');
      const toggle = page.locator('button#motion-toggle');
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('body')).not.toHaveClass(/\bstill\b/);
      await toggle.click();
      await stableStill(page);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('body')).not.toHaveClass(/\bstill\b/);
    });
    await standard.close();

    const reduced = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await openPage(reduced, '减少动态');
    await check('减少动态时默认停镜且所有关键内容可见', async () => {
      await stableStill(page);
      for (const id of IDS) {
        const section = page.locator(`#${id}`);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible();
        const invisibleText = await section.evaluate(element => [...element.querySelectorAll('h1,h2,h3,p')]
          .filter(node => node.textContent.trim() && !node.closest('[hidden],[aria-hidden="true"],dialog'))
          .filter(node => {
            for (let current = node; current && current !== element.parentElement; current = current.parentElement) {
              const style = getComputedStyle(current);
              if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) < 0.99) return true;
            }
            return false;
          }).map(node => node.textContent.trim()));
        assert.deepEqual(invisibleText, [], `#${id} 不能因入场动画而隐藏正文`);
      }
    });
    await check('主页文案、导航、ID、锚点及本地图片路径', async () => {
      await assertCopy(page);
      await assertStructure(page);
    });
    await check('主视觉与页面图片可加载且不拉伸', async () => {
      await loadedImages(page.locator('#top'));
      for (const image of await page.locator('img:visible').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0)).toBe(true);
      }
    });
    await check('桌面首屏截图', async () => {
      await stableStill(page);
      await screenshot(page, 'desktop');
    });
    await check('梦域标签点击、方向键、选中状态及配图', () => verifyDreams(page));
    await check('三个玩法按钮及独立文案', () => verifyPlay(page));
    await check('视频懒加载、弹窗开启、关闭按钮及 Escape', () => verifyFilm(page));
    await check('故事、梦域、玩法各一张截图', async () => {
      await page.locator('[role="tab"][data-dream="forest"]').click();
      await assertDream(page, 'forest');
      await page.locator('button[data-play="0"]').click();
      for (const id of ['story', 'dreams', 'experience']) await screenshot(page, id, id);
    });
    for (const [width, height] of [[1440, 1000], [1024, 1000], [768, 1000], [390, 844], [320, 740]]) {
      await check(`${width}×${height} 全段落无横向溢出`, () => noOverflow(page, width, height));
    }
    await check('390 移动导航及首屏截图', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      // 新文档保证菜单初始状态不受此前交互影响。
      await page.reload({ waitUntil: 'load' });
      await stableStill(page);
      await verifyMobileMenu(page);
      await loadedImages(page.locator('#top'));
      await screenshot(page, '390');
    });
    await reduced.close();

    for (const [width, height] of [[1440, 1000], [390, 844]]) {
      const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width, height } });
      await check(`无 JavaScript ${width}：故事、首梦及锚点导航可读可用`, async () => {
        const fallback = await openPage(context, `无JS-${width}`);
        await expect(fallback.locator('#story')).toBeVisible();
        await expect(fallback.locator('#story')).toContainText(/梦|蝶|庄周/u);
        await assertCopy(fallback);
        await expect(fallback.locator('#dream-panel')).toBeVisible();
        await expect(fallback.locator('#dream-panel')).toContainText(DREAM_NAMES.forest);
        await loadedImages(fallback.locator('#dream-panel'));
        for (const id of NAV_IDS) {
          const links = fallback.locator(`.site-nav a[href="#${id}"]`);
          let navigated = false;
          for (const link of await links.all()) {
            if (!(await link.isVisible())) continue;
            await link.click();
            await expect(fallback).toHaveURL(new RegExp(`#${id}$`));
            await expect(fallback.locator(`#${id}`)).toBeInViewport();
            navigated = true;
            break;
          }
          assert.ok(navigated, `无 JS 时必须有可用的 #${id} 导航，不能依赖 JS 展开菜单`);
        }
      });
      await context.close();
    }
  } catch (error) {
    report.checks.push({ name: '验收环境或页面初始化', status: 'failed', error: errorText(error) });
  } finally {
    if (browser) {
      try { await browser.close(); } catch (error) {
        report.checks.push({ name: '浏览器清理', status: 'failed', error: errorText(error) });
      }
    }
    await check('无主页 pageerror 及本地资源加载失败', async () => {
      assert.deepEqual(report.pageErrors, [], '主页出现未捕获异常');
      assert.deepEqual(report.localResourceFailures, [], '本地资源请求失败或返回 HTTP 错误');
    });
    report.finishedAt = new Date().toISOString();
    report.status = report.checks.some(item => item.status === 'failed') ? 'failed' : 'passed';
    report.summary = {
      passed: report.checks.filter(item => item.status === 'passed').length,
      failed: report.checks.filter(item => item.status === 'failed').length,
      screenshots: report.screenshots.length,
    };
    await fs.writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`验收结果：${report.status}；报告：${REPORT}`);
    if (report.status === 'failed') process.exitCode = 1;
  }
}

run().catch(error => {
  console.error(errorText(error));
  process.exitCode = 1;
});
