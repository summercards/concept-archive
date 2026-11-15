'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const TARGET = process.env.HOMEPAGE_URL || pathToFileURL(path.join(ROOT, 'index.html')).href;
const REPORT = path.join(__dirname, 'dream-interaction-verification.json');
const PREVIEWS = path.join(ROOT, 'previews');
const TIMEOUT = 12000;
const REALMS = {
  forest: { title: '雾白林庭', image: '01-grove.jpg' },
  valley: { title: '赭粉眠谷', image: '02-valley.jpg' },
  water: { title: '深水灯庭', image: '03-water.jpg' },
};
const SIGNATURE = /空.{0,8}落款|落款.{0,8}空|未署名/u;
const BUTTERFLY = /蝶|翅/u;
const report = {
  url: TARGET,
  startedAt: new Date().toISOString(),
  status: 'running',
  groups: [],
  screenshots: [],
  pageErrors: [],
  consoleErrors: [],
  resourceFailures: [],
  excludedMediaAborts: [],
  blockedExternalRequests: [],
};
let browser;

function errorText(error) {
  return error instanceof Error ? error.stack || error.message : String(error);
}

async function group(name, action) {
  const result = { name, status: 'running', details: {} };
  report.groups.push(result);
  try {
    await action(result.details);
    result.status = 'passed';
    console.log(`通过：${name}`);
  } catch (error) {
    result.status = 'failed';
    result.error = errorText(error);
    console.error(`失败：${name}\n${result.error}`);
  }
}

function watch(page, label) {
  const mediaURLs = new Set();
  page.on('pageerror', error => report.pageErrors.push({ context: label, error: errorText(error) }));
  page.on('request', request => {
    if (request.resourceType() === 'media') mediaURLs.add(request.url());
  });
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location();
    const item = { context: label, text: message.text(), location };
    // 仅排除已识别媒体请求的主动取消；不屏蔽其他来源、iframe 或正文脚本异常。
    if (mediaURLs.has(location.url) && /ERR_ABORTED|NS_BINDING_ABORTED/u.test(item.text)) {
      report.excludedMediaAborts.push(item);
    } else {
      report.consoleErrors.push(item);
    }
  });
  page.on('requestfailed', request => {
    const error = request.failure()?.errorText || '未知请求错误';
    const item = { context: label, url: request.url(), type: request.resourceType(), error };
    if (request.resourceType() === 'media' && /ERR_ABORTED|NS_BINDING_ABORTED/u.test(error)) {
      report.excludedMediaAborts.push(item);
    } else {
      report.resourceFailures.push(item);
    }
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      report.resourceFailures.push({ context: label, url: response.url(), status: response.status() });
    }
  });
}

async function withPage(label, options, action) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
    serviceWorkers: 'block',
    ...options,
  });
  try {
    const target = new URL(TARGET);
    // 只允许目标站点请求；意外外网依赖同时计入失败，不用真实外网请求掩盖问题。
    await context.route(/^https?:\/\//u, async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (['http:', 'https:'].includes(target.protocol) && url.origin === target.origin) {
        await route.continue();
      } else {
        report.blockedExternalRequests.push({ context: label, url: request.url(), type: request.resourceType() });
        await route.abort('blockedbyclient');
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(30000);
    watch(page, label);
    await page.goto(TARGET, { waitUntil: 'load' });
    await page.locator('#hero-title').waitFor({ state: 'visible' });
    await action(page);
    // With JavaScript disabled, RAF callbacks do not run in Chromium. Static fallback
    // assertions below inspect computed layout synchronously instead of awaiting RAF.
    if (options.javaScriptEnabled !== false) await frames(page);
  } finally {
    await context.close();
  }
}

async function frames(page, count = 3) {
  await page.evaluate(async count => {
    for (let index = 0; index < count; index++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }, count);
}

async function attr(page, selector, name, value) {
  await page.waitForFunction(({ selector, name, value }) =>
    document.querySelector(selector)?.getAttribute(name) === value,
  { selector, name, value }, { timeout: TIMEOUT });
}

async function hidden(page, selector, expected) {
  await page.waitForFunction(({ selector, expected }) => {
    const element = document.querySelector(selector);
    return element && element.hidden === expected;
  }, { selector, expected }, { timeout: TIMEOUT });
  if (!expected) assert.ok(await page.locator(selector).isVisible(), `${selector} 应真实可见`);
}

async function bodyClass(page, name, expected) {
  await page.waitForFunction(({ name, expected }) =>
    document.body.classList.contains(name) === expected,
  { name, expected }, { timeout: TIMEOUT });
}

async function focused(page, locator) {
  const handle = await locator.elementHandle();
  assert.ok(handle, '焦点目标必须存在');
  try {
    await page.waitForFunction(element => document.activeElement === element, handle, { timeout: TIMEOUT });
  } finally {
    await handle.dispose();
  }
}

async function activate(page, selector, touch = false) {
  const locator = typeof selector === 'string' ? page.locator(selector) : selector;
  assert.ok(await locator.isEnabled(), '交互控件应可用');
  // 触屏验收用真实 tap，桌面用正常 click，均不使用 force、hover 或长按。
  if (touch) await locator.tap();
  else await locator.click();
}

async function dialogOpen(page, mode) {
  await page.waitForFunction(() => {
    const dialog = document.querySelector('dialog#journal-dialog');
    return dialog instanceof HTMLDialogElement && dialog.open && dialog.matches(':modal');
  }, undefined, { timeout: TIMEOUT });
  assert.ok(await page.locator('#journal-dialog').isVisible(), '日志原生模态对话框应可见');
  await bodyClass(page, 'modal-open', true);
  if (mode) await attr(page, '#journal-dialog', 'data-mode', mode);
  await page.waitForFunction(() => document.querySelector('#journal-dialog').contains(document.activeElement));
}

async function dialogClosed(page, opener) {
  await page.waitForFunction(() => {
    const dialog = document.querySelector('dialog#journal-dialog');
    return dialog && !dialog.open && !dialog.matches(':modal');
  });
  assert.equal(await page.locator('#journal-dialog').isVisible(), false, '关闭后对话框不可见');
  await bodyClass(page, 'modal-open', false);
  if (opener) await focused(page, opener);
}

async function journalOpener(page) {
  const buttons = page.locator('button[data-journal]');
  assert.ok(await buttons.count() >= 1, '至少一个 button[data-journal] 日志入口');
  for (const button of await buttons.all()) {
    if (await button.isVisible()) return button;
  }
  assert.fail('当前视口应有可见的日志入口');
}

async function openJournal(page, touch = false, opener) {
  opener ||= await journalOpener(page);
  await activate(page, opener, touch);
  await dialogOpen(page);
  return opener;
}

async function closeJournal(page, opener, escape = false, touch = false) {
  if (escape) await page.keyboard.press('Escape');
  else await activate(page, '#journal-dialog [data-close-journal]', touch);
  await dialogClosed(page, opener);
}

async function journalState(page, count, patterns = []) {
  // 只在已打开的 dialog 内读取，避免对隐藏 dialog 的 innerText 作错误推断。
  await dialogOpen(page);
  await page.waitForFunction(expected => {
    const numbers = document.querySelector('#journal-count')?.textContent.match(/\d+/gu);
    return numbers && Number(numbers[0]) === expected;
  }, count, { timeout: TIMEOUT });
  const state = await page.locator('#journal-entries').evaluate(element => {
    const normalize = text => text.replace(/\s+/gu, ' ').trim();
    const items = [...element.querySelectorAll('li')].filter(item => !item.parentElement.closest('li'));
    return {
      text: normalize(element.innerText),
      listItems: items.map(item => normalize(item.innerText)).filter(Boolean),
    };
  });
  const empty = page.locator('#journal-empty');
  if (count === 0) {
    assert.ok(await empty.isVisible(), '初始空记录提示应可见');
    assert.equal(state.text, '', '#journal-entries 初始不得预填任何记录');
  } else {
    assert.equal(await empty.isVisible(), false, '有记录后不应显示空记录提示');
    assert.ok(state.text.length > 0, '主动记录应呈现在 #journal-entries');
    for (const pattern of patterns) assert.match(state.text, pattern, '日志应包含已主动记下的内容');
    // 不强制模板使用 li；使用列表时核对实际条数，避免只改计数文案。
    if (state.listItems.length) assert.equal(state.listItems.length, count, '日志实际列表条数须与文案一致');
  }
  return { count, ...state };
}

async function inspectJournal(page, count, patterns = [], touch = false) {
  const opener = await openJournal(page, touch);
  const state = await journalState(page, count, patterns);
  await closeJournal(page, opener, false, touch);
  return state;
}

async function flip(page, reverse, touch = false) {
  const button = page.locator('button#letter-flip');
  const pressed = await button.getAttribute('aria-pressed');
  assert.ok(['false', 'true'].includes(pressed), '翻页按钮须有布尔 aria-pressed');
  if (pressed !== String(reverse)) await activate(page, button, touch);
  await attr(page, '#letter-flip', 'aria-pressed', String(reverse));
  await attr(page, '#letter-reverse', 'aria-hidden', String(!reverse));
  await attr(page, '#letter-front', 'aria-hidden', String(reverse));
  await page.waitForFunction(reverse => {
    const front = document.querySelector('#letter-front');
    const back = document.querySelector('#letter-reverse');
    return front && back && front.inert === reverse && (!reverse || !back.inert);
  }, reverse);
}

async function signature(page, touch = false) {
  await flip(page, true, touch);
  const record = page.locator('#letter-reverse button[data-record="signature"]');
  assert.equal(await record.count(), 1, '背面应有记下空落款的按钮');
  await activate(page, record, touch);
}

async function duplicateRecord(page, selector, touch = false) {
  const button = page.locator(selector);
  assert.equal(await button.count(), 1, '重复记录按钮仍应存在');
  // 已记录后禁用按钮也是有效防重策略；可点击时必须实测第二次点击。
  if (await button.isEnabled()) await activate(page, button, touch);
  else assert.ok(await button.isDisabled(), '已记录按钮应明确禁用');
}

async function dreamState(page, key) {
  const expected = REALMS[key];
  await page.waitForFunction(({ key, expected }) => {
    const panel = document.querySelector('#dream-panel');
    const image = document.querySelector('#dream-image');
    const tabs = [...document.querySelectorAll('button[data-dream]')];
    return panel?.dataset.realm === key && panel.getAttribute('aria-busy') === 'false'
      && tabs.length === 3 && tabs.every(tab => tab.getAttribute('aria-selected') === String(tab.dataset.dream === key))
      && panel.getAttribute('aria-labelledby') === document.querySelector(`button[data-dream="${key}"]`)?.id
      && document.querySelector('#realm-title')?.textContent.trim() === expected.title
      && image?.complete && image.naturalWidth > 0
      && new URL(image.currentSrc || image.src, document.baseURI).pathname.endsWith('/' + expected.image);
  }, { key, expected }, { timeout: TIMEOUT });
  await hidden(page, '#dream-echo', true);
  assert.equal(await page.locator('#dream-echo').getAttribute('aria-hidden'), 'true', '残影必须为装饰影像');
  return page.evaluate(() => {
    const image = document.querySelector('#dream-image');
    const fields = ['realm-title', 'realm-kicker', 'realm-glyph', 'realm-numeral', 'realm-quote', 'realm-description', 'realm-objective'];
    const text = Object.fromEntries(fields.map(id => [id, document.getElementById(id)?.textContent.trim()]));
    return { text, src: image.currentSrc || image.src, alt: image.alt, realm: document.querySelector('#dream-panel').dataset.realm };
  });
}

async function selectDream(page, key, touch = false) {
  await activate(page, `button[data-dream="${key}"]`, touch);
  const state = await dreamState(page, key);
  for (const [field, text] of Object.entries(state.text)) assert.ok(text, `${field} 不得为空`);
  assert.ok(state.alt, '梦域配图须有替代文字');
  return state;
}

async function seam(page, expanded, touch = false) {
  const current = await page.locator('#seam-trigger').getAttribute('aria-expanded');
  assert.ok(['true', 'false'].includes(current), '接缝按钮须有布尔 aria-expanded');
  if (current !== String(expanded)) await activate(page, 'button#seam-trigger', touch);
  await attr(page, '#seam-trigger', 'aria-expanded', String(expanded));
  await hidden(page, '#seam-note', !expanded);
}

async function focusValue(page, value) {
  await page.waitForFunction(value => Number(document.querySelector('#focus-depth')?.value) === value, value);
}

async function setFocus(page, value) {
  // 阈值精确验收用原生 input/change 事件；Home/End 另走真实键盘。
  await page.locator('#focus-depth').evaluate((input, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await focusValue(page, value);
}

async function readable(page, selector) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  assert.ok(await locator.isVisible(), `${selector} 应可见`);
  assert.ok((await locator.innerText()).trim(), `${selector} 应有可读文字`);
  await page.waitForFunction(selector => {
    const element = document.querySelector(selector);
    if (!element) return false;
    let opacity = 1;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= Number(style.opacity);
      const blurs = [...style.filter.matchAll(/blur\(([\d.]+)px\)/gu)];
      if (blurs.some(match => Number(match[1]) > 0.01)) return false;
      if (style.visibility !== 'visible' || style.display === 'none') return false;
    }
    return opacity >= 0.9;
  }, selector, { timeout: TIMEOUT });
}

async function noAnimations(page) {
  await page.waitForFunction(() => document.getAnimations().every(animation =>
    animation.playState !== 'running' && !animation.pending), undefined, { timeout: TIMEOUT });
  const sample = () => page.evaluate(() => {
    const selectors = ['.hero-image', '#dream-image', '#dream-echo', '.butterfly-image-window img'];
    return selectors.map(selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      return { selector, transform: style.transform, opacity: style.opacity, filter: style.filter };
    });
  });
  const before = await sample();
  await frames(page, 8);
  assert.deepEqual(await sample(), before, '停镜后连续渲染帧不得继续改变主影像');
}

async function screenshot(page, name, selector) {
  const filename = path.join(PREVIEWS, name);
  assert.ok(['dream-journal.png', 'dream-focus.png'].includes(name), '只允许约定的两张截图');
  assert.ok(!report.screenshots.includes(filename), '每个功能状态只截图一次');
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await frames(page);
  // 不禁用动画，以免截图 API 自己完成动画而掩盖交互问题；不保存全页图或失败附加截图。
  await page.screenshot({ path: filename, fullPage: false, animations: 'allow' });
  report.screenshots.push(filename);
}

async function confirmWake(page, touch = false) {
  const opener = page.locator('#wake-compare');
  await activate(page, opener, touch);
  await dialogOpen(page, 'awake');
  assert.ok(await page.locator('button#wake-confirm').isEnabled(), '不集齐记录也应能确认醒来');
  await activate(page, 'button#wake-confirm', touch);
  await bodyClass(page, 'awake', true);
  await dialogClosed(page);
  await hidden(page, '#wake-receipt', false);
}

async function overflow(page, width, state, details) {
  await frames(page);
  const measurement = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    dialogs: [...document.querySelectorAll('dialog[open]')].map(dialog => ({
      width: dialog.clientWidth,
      scroll: dialog.scrollWidth,
      left: dialog.getBoundingClientRect().left,
      right: dialog.getBoundingClientRect().right,
    })),
  }));
  details.push({ width, state, ...measurement });
  assert.ok(Math.max(measurement.document, measurement.body) <= measurement.viewport + 1,
    `${width}px ${state} 页面横向溢出：${JSON.stringify(measurement)}`);
  for (const dialog of measurement.dialogs) {
    assert.ok(dialog.scroll <= dialog.width + 1 && dialog.left >= -1 && dialog.right <= measurement.viewport + 1,
      `${width}px ${state} 对话框横向溢出`);
  }
}

async function run() {
  try {
    assert.ok(['file:', 'http:', 'https:'].includes(new URL(TARGET).protocol), 'HOMEPAGE_URL 仅支持 file/http/https');
    // 两个父目录由项目提供；运行时也不创建其他目录。
    await fs.access(__dirname);
    await fs.access(PREVIEWS);
    browser = await chromium.launch({ headless: true });

    await group('01 委托函翻面、inert 与空落款去重', details => withPage('委托函', {}, async page => {
      await attr(page, '#letter-flip', 'aria-pressed', 'false');
      await attr(page, '#letter-front', 'aria-hidden', 'false');
      await attr(page, '#letter-reverse', 'aria-hidden', 'true');
      await inspectJournal(page, 0);
      await signature(page);
      const first = await inspectJournal(page, 1, [SIGNATURE]);
      await duplicateRecord(page, '#letter-reverse button[data-record="signature"]');
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), first, '重复记下空落款不得增加或改写日志');
      await flip(page, false);
      await flip(page, true);
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), first, '翻页不得清除或自动增加记录');
      details.record = first;
    }));

    await group('02 空日志、全部入口、原生模态、Tab/Esc 与焦点恢复', details => withPage('日志', {}, async page => {
      const entries = page.locator('button[data-journal]');
      assert.ok(await entries.count() >= 1, '至少一个日志入口');
      let tested = 0;
      for (const opener of await entries.all()) {
        if (!(await opener.isVisible())) continue;
        await openJournal(page, false, opener);
        await journalState(page, 0);
        await closeJournal(page, opener, tested % 2 === 1);
        tested++;
      }
      assert.ok(tested > 0, '至少验收一个可见日志入口');
      await signature(page);
      const opener = await openJournal(page);
      const state = await journalState(page, 1, [SIGNATURE]);
      assert.ok(!Object.values(REALMS).some(realm => state.text.includes(realm.title)), '日志不得预填未主动记下的梦域');
      const focusableCount = await page.locator('#journal-dialog').evaluate(dialog =>
        [...dialog.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')]
          .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length).length);
      assert.ok(focusableCount > 0, '原生对话框须有键盘可达控件');
      for (const key of ['Tab', 'Shift+Tab']) {
        for (let index = 0; index < focusableCount + 2; index++) {
          await page.keyboard.press(key);
          assert.ok(await page.locator('#journal-dialog').evaluate(dialog =>
            dialog.contains(document.activeElement) || document.activeElement === document.body),
          'Tab 不得聚焦模态框外的页面控件；原生对话框循环的 body 中间态允许存在');
        }
      }
      await screenshot(page, 'dream-journal.png', '#journal-dialog');
      await closeJournal(page, opener, true);
      await openJournal(page, false, opener);
      assert.deepEqual(await journalState(page, 1, [SIGNATURE]), state, '重复打开日志应保留现有记录');
      await closeJournal(page, opener);
      details.visibleOpenersTested = tested;
      details.record = state;
    }));

    await group('03 三梦域、主动接缝记录、快速切换与残影清理', details => withPage('梦域', {}, async page => {
      assert.equal(await page.locator('button[data-dream]').count(), 3, '恰好三个梦域标签');
      const keys = await page.locator('button[data-dream]').evaluateAll(tabs => tabs.map(tab => tab.dataset.dream).sort());
      assert.deepEqual(keys, ['forest', 'valley', 'water']);
      const states = {};
      const recorded = [];
      for (const key of Object.keys(REALMS)) {
        states[key] = await selectDream(page, key);
        assert.equal(await page.locator(`button[data-dream="${key}"]`).getAttribute('role'), 'tab');
        await attr(page, '#seam-trigger', 'aria-expanded', 'false');
        await hidden(page, '#seam-note', true);
        await seam(page, true);
        assert.equal(await page.locator('#seam-note button#record-realm').count(), 1, '展开说明内应有记下当前梦域按钮');
        await inspectJournal(page, recorded.length, recorded.map(name => new RegExp(name, 'u')));
        await activate(page, '#seam-note button#record-realm');
        recorded.push(REALMS[key].title);
        const first = await inspectJournal(page, recorded.length, recorded.map(name => new RegExp(name, 'u')));
        await seam(page, true);
        await duplicateRecord(page, '#seam-note button#record-realm');
        assert.deepEqual(await inspectJournal(page, recorded.length, recorded.map(name => new RegExp(name, 'u'))), first,
          '重复记下同一梦域不得增加记录');
        await seam(page, true);
      }
      // 同一个任务内连发点击，刻意不让 Playwright 的稳定性等待串行完成每个过渡。
      await page.evaluate(() => {
        for (const key of ['valley', 'forest', 'water', 'forest', 'valley', 'water']) {
          document.querySelector(`button[data-dream="${key}"]`).click();
        }
      });
      assert.deepEqual(await dreamState(page, 'water'), states.water, '快切后的图、替代文字与所有说明须对应最后一个梦域');
      await attr(page, '#seam-trigger', 'aria-expanded', 'false');
      await hidden(page, '#seam-note', true);
      await frames(page, 8);
      assert.deepEqual(await dreamState(page, 'water'), states.water, '旧过渡不得迟到覆盖最终状态');
      await inspectJournal(page, 3, recorded.map(name => new RegExp(name, 'u')));
      details.states = states;
    }));

    await group('04 焦距阈值、键盘 Home/End、正文清晰度与观蝶记录', details => withPage('焦距', {}, async page => {
      const input = page.locator('input#focus-depth');
      assert.equal(await input.getAttribute('type'), 'range');
      assert.equal(await input.getAttribute('min'), '0');
      assert.equal(await input.getAttribute('max'), '100');
      await input.focus();
      await page.keyboard.press('Home');
      await focusValue(page, 0);
      assert.ok(await page.locator('button[data-record="butterfly"]').isDisabled(), '低焦距不可记下观蝶');
      const low = (await page.locator('#focus-reading').innerText()).trim();
      assert.ok(low, '焦距解释不得为空');
      await readable(page, '#butterfly-title');
      await readable(page, '.butterfly-copy .body-copy');
      await setFocus(page, 69);
      assert.ok(await page.locator('button[data-record="butterfly"]').isDisabled(), '69 未达到记录阈值');
      await input.focus();
      await page.keyboard.press('ArrowRight');
      await focusValue(page, 70);
      await page.waitForFunction(() => document.querySelector('button[data-record="butterfly"]')?.disabled === false);
      await page.waitForFunction(low => {
        const text = document.querySelector('#focus-reading')?.textContent.trim();
        return text && text !== low;
      }, low);
      await input.focus();
      await page.keyboard.press('End');
      await focusValue(page, 100);
      await readable(page, '#focus-reading');
      await readable(page, '#butterfly-title');
      await readable(page, '.butterfly-copy .body-copy');
      const high = (await page.locator('#focus-reading').innerText()).trim();
      assert.notEqual(high, low, '100 与 0 的焦距解释应不同');
      assert.ok(await page.locator('button[data-record="butterfly"]').isEnabled(), '100 应允许记下观蝶');
      await activate(page, 'button[data-record="butterfly"]');
      const first = await inspectJournal(page, 1, [BUTTERFLY]);
      await duplicateRecord(page, 'button[data-record="butterfly"]');
      assert.deepEqual(await inspectJournal(page, 1, [BUTTERFLY]), first, '观蝶记录应防重');
      await screenshot(page, 'dream-focus.png', '#butterfly');
      await input.focus();
      await page.keyboard.press('Home');
      await focusValue(page, 0);
      assert.deepEqual(await inspectJournal(page, 1, [BUTTERFLY]), first, '重新失焦不得删除已记下的观蝶记录');
      details.readings = { low, high };
    }));

    await group('05 未集齐即可醒来、重复比对、返回顶部不丢记录', details => withPage('醒后比对', {}, async page => {
      await signature(page);
      const before = await inspectJournal(page, 1, [SIGNATURE]);
      await activate(page, 'button#wake-compare');
      await dialogOpen(page, 'awake');
      assert.deepEqual(await journalState(page, 1, [SIGNATURE]), before);
      assert.ok(await page.locator('button#wake-confirm').isEnabled(), '仅一条记录也能确认');
      await page.keyboard.press('Escape');
      await dialogClosed(page, page.locator('#wake-compare'));
      await confirmWake(page);
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), before, '醒来不得丢失记录');
      await confirmWake(page);
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), before, '重复比对不得清空或增加记录');
      await activate(page, '.back-top[href="#top"]');
      await page.waitForFunction(() => scrollY <= 2, undefined, { timeout: TIMEOUT });
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), before, '回到顶部不得重置记录');
      await bodyClass(page, 'awake', true);
      await hidden(page, '#wake-receipt', false);
      details.record = before;
    }));

    await group('05b 空记录也能确认醒来', () => withPage('空记录醒来', {}, async page => {
      await inspectJournal(page, 0);
      await confirmWake(page);
      await inspectJournal(page, 0);
      await bodyClass(page, 'awake', true);
      await hidden(page, '#wake-receipt', false);
    }));

    await group('06 停镜取消动效、语义与记录保留、双向切换', () => withPage('停镜', {}, async page => {
      await bodyClass(page, 'still', false);
      await attr(page, '#motion-toggle', 'aria-pressed', 'false');
      await signature(page);
      await setFocus(page, 80);
      const before = await inspectJournal(page, 1, [SIGNATURE]);
      await selectDream(page, 'forest');
      await seam(page, true);
      // 在同一事件循环中切梦并停镜，覆盖仍在途的过渡。
      await page.evaluate(() => {
        document.querySelector('button[data-dream="valley"]').click();
        document.querySelector('button#motion-toggle').click();
      });
      await bodyClass(page, 'still', true);
      await attr(page, '#motion-toggle', 'aria-pressed', 'true');
      await dreamState(page, 'valley');
      await attr(page, '#letter-flip', 'aria-pressed', 'true');
      await attr(page, '#letter-front', 'aria-hidden', 'true');
      await attr(page, '#letter-reverse', 'aria-hidden', 'false');
      await focusValue(page, 80);
      await attr(page, '#seam-trigger', 'aria-expanded', 'false');
      await hidden(page, '#seam-note', true);
      await noAnimations(page);
      await selectDream(page, 'water');
      await seam(page, true);
      await noAnimations(page);
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), before, '停镜及切梦不得改变记录');
      await activate(page, '#motion-toggle');
      await bodyClass(page, 'still', false);
      await attr(page, '#motion-toggle', 'aria-pressed', 'false');
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE]), before, '恢复动态不得改变记录');
    }));

    await group('06b 系统 reduce 默认 still，交互仍保留语义', () => withPage('系统减少动态', { reducedMotion: 'reduce' }, async page => {
      await bodyClass(page, 'still', true);
      await attr(page, '#motion-toggle', 'aria-pressed', 'true');
      await noAnimations(page);
      await signature(page);
      await selectDream(page, 'water');
      await seam(page, true);
      await noAnimations(page);
      await setFocus(page, 100);
      await activate(page, 'button[data-record="butterfly"]');
      await inspectJournal(page, 2, [SIGNATURE, BUTTERFLY]);
    }));

    for (const width of [1440, 390]) {
      await group(`06c 无 JavaScript ${width}px 关键与替代文字可读`, () => withPage(`无JS-${width}`, {
        javaScriptEnabled: false,
        reducedMotion: 'reduce',
        viewport: { width, height: width < 500 ? 844 : 1000 },
      }, async page => {
        for (const selector of ['#hero-title', '.hero-tagline', '#story-title', '.paper-question', '#letter-front .paper-foot',
          '#dreams-title', '#realm-title', '#realm-description', '#butterfly-title', '.butterfly-rules', '#awakening-title']) {
          const node = page.locator(selector);
          await node.scrollIntoViewIfNeeded();
          assert.ok(await node.isVisible(), selector + ' should remain visible without JS');
          assert.ok((await node.innerText()).trim(), selector + ' needs readable copy');
          assert.ok(await node.evaluate(element => {
            let opacity = 1;
            for (let current = element; current; current = current.parentElement) {
              const style = getComputedStyle(current);
              opacity *= Number(style.opacity);
              if (style.display === 'none' || style.visibility !== 'visible' || /blur\(([1-9]|0\.[1-9])/.test(style.filter)) return false;
            }
            return opacity >= .9;
          }), selector + ' must not rely on JS for clarity');
        }
        const bodyText = await page.locator('body').innerText();
        assert.match(bodyText, /落款|署名/u, '无 JS 仍应读到委托线索');
        assert.match(bodyText, /概念/u);
        assert.match(bodyText, /非实机|不是实机|并非实机/u);
        const fallback = await page.locator('noscript').evaluateAll(nodes => nodes.filter(node =>
          node.getClientRects().length && getComputedStyle(node).visibility === 'visible')
          .map(node => node.innerText).join('\n'));
        assert.match(fallback, /赭粉眠谷/u, '无 JS 梦域替代文字必须真实可见');
        assert.match(fallback, /深水灯庭/u, '无 JS 梦域替代文字必须真实可见');
        assert.match(fallback, /记|证|梦|蝶/u, '无 JS 应提供可读说明，不要求新增互动可用');
        // 不遍历全部正文：关闭的 dialog、aria-hidden 翻面和 #credits details 的藏文案均属正常。
      }));
    }

    await group('07 五档宽度：正文、翻面、接缝、焦距、日志与回执无横向溢出', details => withPage('响应式', {
      reducedMotion: 'reduce',
    }, async page => {
      details.measurements = [];
      details.widths = [];
      for (const width of [1440, 1024, 768, 390, 320]) {
        const item = { width, status: 'running' };
        details.widths.push(item);
        try {
          await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
          for (const id of ['top', 'story', 'dreams', 'experience', 'butterfly', 'awakening', 'credits']) {
            await page.locator(`#${id}`).scrollIntoViewIfNeeded();
            await overflow(page, width, id, details.measurements);
          }
          await flip(page, true);
          await overflow(page, width, '委托背面', details.measurements);
          await seam(page, true);
          await overflow(page, width, '接缝展开', details.measurements);
          await setFocus(page, 100);
          await page.locator('#butterfly').scrollIntoViewIfNeeded();
          await overflow(page, width, '焦距100', details.measurements);
          const opener = await openJournal(page);
          await overflow(page, width, '日志', details.measurements);
          await closeJournal(page, opener);
          await confirmWake(page);
          await page.locator('#wake-receipt').scrollIntoViewIfNeeded();
          await overflow(page, width, '醒来回执', details.measurements);
          item.status = 'passed';
        } catch (error) {
          item.status = 'failed';
          item.error = errorText(error);
          // 保留后续宽度的独立测量机会，不用失败状态污染下一档。
          await page.reload({ waitUntil: 'load' });
        }
      }
      assert.ok(details.widths.every(item => item.status === 'passed'), '至少一档宽度失败，见 details.widths');
    }));

    await group('07b 移动触屏直接翻页、记录、打开日志与确认醒来', details => withPage('移动触屏', {
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce',
    }, async page => {
      assert.ok(await page.evaluate(() => navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches), '触屏环境不应依赖 hover');
      await inspectJournal(page, 0, [], true);
      await signature(page, true);
      const first = await inspectJournal(page, 1, [SIGNATURE], true);
      await duplicateRecord(page, '#letter-reverse button[data-record="signature"]', true);
      assert.deepEqual(await inspectJournal(page, 1, [SIGNATURE], true), first);
      await flip(page, false, true);
      await flip(page, true, true);
      await selectDream(page, 'water', true);
      await seam(page, true, true);
      await activate(page, '#seam-note button#record-realm', true);
      const before = await inspectJournal(page, 2, [SIGNATURE, /深水灯庭/u], true);
      await confirmWake(page, true);
      assert.deepEqual(await inspectJournal(page, 2, [SIGNATURE, /深水灯庭/u], true), before);
      await page.setViewportSize({ width: 320, height: 740 });
      await flip(page, false, true);
      await flip(page, true, true);
      await confirmWake(page, true);
      assert.deepEqual(await inspectJournal(page, 2, [SIGNATURE, /深水灯庭/u], true), before);
      details.record = before;
    }));

    await group('07c 键盘可达、Tab 标签、方向键、Enter/Space 与 Esc', () => withPage('键盘', {
      reducedMotion: 'reduce',
    }, async page => {
      const required = ['#letter-flip', 'button[data-journal]', '#seam-trigger', '#record-realm', '#focus-depth',
        'button[data-record="signature"]', 'button[data-record="butterfly"]', '#wake-compare', '#motion-toggle'];
      for (const selector of required) assert.ok(await page.locator(selector).count(), `缺少键盘控件 ${selector}`);
      // 从文档起点用真实 Tab 找到翻页按钮，避免仅调用 focus 就误判为可顺序访问。
      await page.keyboard.press('Control+Home');
      let reached = false;
      for (let index = 0; index < 100; index++) {
        await page.keyboard.press('Tab');
        if (await page.locator('#letter-flip').evaluate(element => document.activeElement === element)) {
          reached = true;
          break;
        }
      }
      assert.ok(reached, 'Tab 顺序应可到达翻页按钮');
      await page.keyboard.press('Enter');
      await attr(page, '#letter-flip', 'aria-pressed', 'true');
      const record = page.locator('#letter-reverse button[data-record="signature"]');
      assert.ok(await record.evaluate(element => element.tabIndex >= 0 && !element.closest('[inert]')), '背面记录应进入键盘焦点顺序');
      await record.focus();
      await page.keyboard.press('Space');
      await inspectJournal(page, 1, [SIGNATURE]);
      await selectDream(page, 'forest');
      const first = page.locator('button[data-dream="forest"]');
      await first.focus();
      for (const [key, realm] of [['ArrowRight', 'valley'], ['ArrowRight', 'water'], ['ArrowLeft', 'valley'], ['Home', 'forest'], ['End', 'water']]) {
        await page.keyboard.press(key);
        await dreamState(page, realm);
        await focused(page, page.locator(`button[data-dream="${realm}"]`));
      }
      const tabs = await page.locator('button[data-dream]').evaluateAll(tabs => tabs.map(tab => ({
        selected: tab.getAttribute('aria-selected') === 'true', tabIndex: tab.tabIndex,
      })));
      assert.deepEqual(tabs.filter(tab => tab.tabIndex === 0), [{ selected: true, tabIndex: 0 }], '只有选中梦域应在 Tab 顺序中');
      const seamButton = page.locator('#seam-trigger');
      await seamButton.focus();
      await page.keyboard.press('Space');
      await hidden(page, '#seam-note', false);
      const opener = await journalOpener(page);
      assert.ok(await opener.evaluate(element => element.tabIndex >= 0 && !element.disabled));
      await opener.focus();
      await page.keyboard.press('Enter');
      await dialogOpen(page);
      await page.keyboard.press('Escape');
      await dialogClosed(page, opener);
    }));
  } catch (error) {
    report.groups.push({ name: '验收环境或初始化', status: 'failed', error: errorText(error) });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        report.groups.push({ name: '浏览器清理', status: 'failed', error: errorText(error) });
      }
    }
    await group('08 全部页面异常、控制台及资源错误汇总', async () => {
      assert.deepEqual({
        pageErrors: report.pageErrors,
        consoleErrors: report.consoleErrors,
        resourceFailures: report.resourceFailures,
        blockedExternalRequests: report.blockedExternalRequests,
      }, { pageErrors: [], consoleErrors: [], resourceFailures: [], blockedExternalRequests: [] },
      '真实错误不得忽略；仅媒体主动取消 ERR_ABORTED 可排除');
    });
    await group('09 仅保存两张约定功能状态截图', async () => {
      assert.deepEqual([...report.screenshots].sort(), [
        path.join(PREVIEWS, 'dream-focus.png'),
        path.join(PREVIEWS, 'dream-journal.png'),
      ].sort(), '应成功保存日志与焦距两张截图，不额外截图');
    });
    report.finishedAt = new Date().toISOString();
    report.summary = {
      passed: report.groups.filter(item => item.status === 'passed').length,
      failed: report.groups.filter(item => item.status === 'failed').length,
      screenshots: report.screenshots.length,
      pageErrors: report.pageErrors.length,
      consoleErrors: report.consoleErrors.length,
      resourceFailures: report.resourceFailures.length,
    };
    report.status = report.summary.failed ? 'failed' : 'passed';
    await fs.writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`验收结果：${report.status}；通过 ${report.summary.passed} 组，失败 ${report.summary.failed} 组；报告：${REPORT}`);
    if (report.summary.failed) process.exitCode = 1;
  }
}

run().catch(error => {
  console.error(errorText(error));
  process.exitCode = 1;
});
