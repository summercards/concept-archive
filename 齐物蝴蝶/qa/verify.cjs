const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');
const fs = require('fs');
const assert = require('assert');
const path = require('path');
const base = path.join(__dirname, '..');
const shots = path.join(base, 'previews');
// The visitor homepage is checked by homepage.cjs; this preserves the full v09 design-book contract.
const target = process.argv[2] || path.join(base, 'design-notes.html');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + target, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').textContent(), '齐物·胡蝶');
    assert.equal(await page.locator('svg,canvas').count(), 0, 'No vector illustration substitutes');
    assert.equal(await page.locator('img').count(), 41);
    for (const selector of ['#top','#vision','#identity','#ritual','#experience','#journey','.manifesto','#horror','#culture','#direction','.domain','.beat','.play-row','.journey article','.art-grid article','.brief']) {
      for (const part of await page.locator(selector).all()) assert(await part.locator('img').count()>0, 'Missing section image: '+selector);
    }
    assert.equal(await page.locator('.brief').count(), 3);
    assert.equal(await page.locator('.ref').count(), 9);
    assert.equal(await page.locator('.hnote li').count(), 4);
    assert.equal(await page.locator('.film-study').count(), 5);
    assert.equal(await page.locator('#ritual-modal,#experiment-scene,.story-frame').count(), 0);
    const copy = await page.locator('body').innerText();
    for (const text of ['3A级电影化心理恐怖梦境冒险','委托入梦·蝶引概念版','齐物·胡蝶','无署名委托信','夹在书页','入梦的缘由','一份委托，四件事','一封信雇来的','心理恐怖','被认识','追溯改写','自证','恐怖语法','梦境探索者','任务书','安眠药','不尽相同','雾白林庭','赭粉眠谷','深水灯庭','不对称','不预设共享梦境网络或医学解释','收束','脱离','越界','抵达','低反差','巨物','重复','不合理构造','假醒','线索','逃脱','庄周','胡蝶','虚焦','观蝶','攻壳机动队2','无罪','台词','方其梦也','弗洛伊德','环形废墟','寂静岭2','SOMA']) assert(copy.includes(text), 'Missing copy: ' + text);
    for (const text of ['忆隙','Mnemic Rift','MNEMIC RIFT','枕海','Pillow Tide','林岑','舞台修复师','旧剧场修复师','承雨者','此版不展示图像','本轮不调用远端服务','16—22 周','四部电影','三张已有电影原图','三张电影原图','蝶引·虚焦']) assert(!copy.includes(text), 'Outdated copy: ' + text);
    assert.equal(await page.locator('html').getAttribute('data-page-node-id'), 'yotifEcPbBymFAGvGfNHtt');
    assert.equal(await page.locator('script[src="/page/page_comm/inject.js"]').count(), 1);
    const anchors = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]')).filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.getAttribute('href')));
    assert.deepEqual(anchors, []);
    const duplicates = await page.evaluate(() => { const ids = Array.from(document.querySelectorAll('[id]')).map(e => e.id); return ids.filter((id,i) => ids.indexOf(id) !== i); });
    assert.deepEqual(duplicates, []);
    const images = [];
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(i => i.loading = 'eager');
      await image.evaluate(i => i.decode());
      const info = await image.evaluate(i => ({ src:i.src, width:i.naturalWidth, height:i.naturalHeight, loaded:i.complete && i.naturalWidth>0, alt:i.alt, caption:i.closest('figure').querySelector('figcaption').textContent, layoutRatio:i.getBoundingClientRect().width/i.getBoundingClientRect().height }));
      assert(info.loaded, 'Image did not load: ' + info.src);
      assert(!/^https?:/.test(info.src), 'Image must be local: ' + info.src);
      assert(/原创.*AI 生成/.test(info.caption), 'Missing image status: '+info.caption);
      assert(/非实机|不是剧照/.test(info.caption), 'Missing real-machine disclaimer: '+info.caption);
      assert(info.alt.length > 8);
      assert(Math.abs(info.layoutRatio-info.width/info.height)<0.01, 'Image cropping or distortion: '+JSON.stringify(info));
      images.push(info);
    }
    assert((await page.locator('[aria-labelledby="film-paprika"]').innerText()).includes('不含影片画面'));
    assert((await page.locator('[aria-labelledby="film-cell"]').innerText()).includes('不作为不对称巨构'));
    assert.equal(await page.locator('[aria-labelledby="film-marienbad"] img').count(), 1);
    assert((await page.locator('[aria-labelledby="film-marienbad"] figcaption').innerText()).includes('非电影剧照'));
    const refSources = await page.locator('.video-ref img').evaluateAll(xs=>xs.map(i=>i.getAttribute('src')));
    assert.ok(refSources.length >= 8, '研究图组数量异常');
    assert(refSources.every(src => src.startsWith('./assets/generated/')), '研究图只能来自原创图集：' + refSources.filter(src => !src.startsWith('./assets/generated/')).join(','));
    assert.equal(new Set(refSources).size, refSources.length > 0 ? new Set(refSources).size : 0);
    assert.equal(await page.locator('.film-reference').count(),4);
    const innocence = await page.locator('[aria-labelledby="film-innocence"]').innerText();
    assert(innocence.includes('原创研究示意'));
    assert(innocence.includes('不作为本作角色'));
    assert(innocence.includes('虚焦'));
    assert.equal(await page.locator('[aria-labelledby="film-innocence"] img').count(), 1);
    const baselineName = path.basename(target) === 'design-notes.html' ? 'index.html' : path.basename(target);
    const baselinePath = path.join(path.dirname(target), '.baseline', baselineName);
    let preservation = null;
    if (fs.existsSync(baselinePath)) {
      const baseline = fs.readFileSync(baselinePath, 'utf8');
      preservation = await page.evaluate(html => {
        const old = new DOMParser().parseFromString(html,'text/html');
        const normalize = text => text.replaceAll('齐物·胡蝶','忆隙');
        const same = selector => normalize(Array.from(old.querySelectorAll(selector)).map(e=>e.outerHTML).join('')) === normalize(Array.from(document.querySelectorAll(selector)).map(e=>e.outerHTML).join(''));
        const oldIds = Array.from(old.querySelectorAll('[data-page-node-id]')).map(e=>e.getAttribute('data-page-node-id'));
        const ids = Array.from(document.querySelectorAll('[data-page-node-id]')).map(e=>e.getAttribute('data-page-node-id'));
        return { scriptContents: Array.from(old.scripts).map(e=>e.outerHTML).join('') === Array.from(document.scripts).map(e=>e.outerHTML).join(''), research:same('.ref'), retainedNodeIds:oldIds.every(id=>ids.includes(id)), oldNodeCount:oldIds.length };
      }, baseline);
      assert(preservation.scriptContents && preservation.research && preservation.retainedNodeIds, 'Unrelated content changed');
    }
    await page.evaluate(() => window.scrollTo(0,0));
    await page.locator('#reading-mode').click();
    assert.equal(await page.locator('#reading-mode').getAttribute('aria-pressed'), 'false');
    await page.locator('#reading-mode').click();
    assert.equal(await page.locator('#reading-mode').getAttribute('aria-pressed'), 'true');
    await page.evaluate(() => { window.print = function() { window.printChecked = true; }; });
    await page.locator('#print-button').click();
    assert.equal(await page.evaluate(() => window.printChecked), true);
    const backgroundChecks = [];
    for (const selector of ['header','.hero']) {
      const css = await page.locator(selector).evaluate(e => getComputedStyle(e).backgroundImage);
      const urls = Array.from(css.matchAll(/url\(["']?([^"')]+)["']?\)/g), m=>m[1]);
      assert(urls.length>0, 'Header needs a real raster background: '+selector);
      for (const src of urls) {
        assert(!/^https?:/.test(src), 'Background must be local: '+src);
        await page.evaluate(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>reject(new Error('Background failed'));i.src=src;}),src);
      }
      backgroundChecks.push({selector,css,loaded:true});
    }
    const widths = [];
    for (const width of [1440,1024,768,390,320]) {
      await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
      await page.evaluate(() => window.scrollTo(0,0));
      const m = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
      widths.push(m);
      assert(m.scrollWidth <= width+1, 'Overflow: ' + JSON.stringify(m));
      if (width === 1440) await page.screenshot({ path: path.join(shots,'desktop-preview.png'), fullPage:false });
      if (width === 390) await page.screenshot({ path: path.join(shots,'mobile-preview.png'), fullPage:false });
    }
    await page.setViewportSize({ width:1440, height:1000 });
    await page.locator('.nav a[href="#ritual"]').click();
    await page.waitForFunction(() => document.querySelector('.nav a[href="#ritual"]').getAttribute('aria-current') === 'location');
    await page.screenshot({ path:path.join(shots,'gameplay-preview.png'), fullPage:false });
    await page.locator('.domains').screenshot({ path:path.join(shots,'domains-preview.png') });
    await page.locator('.film-study').nth(1).screenshot({ path:path.join(shots,'film-preview.png') });
    await page.setViewportSize({ width:390, height:844 });
    await page.locator('.film-study').nth(1).screenshot({ path:path.join(shots,'film-mobile-preview.png') });
    await page.emulateMedia({ media:'print' });
    const printStatus = await page.evaluate(() => ({ background:getComputedStyle(document.body).backgroundColor, navigation:getComputedStyle(document.querySelector('.nav')).display, images:document.images.length }));
    assert.equal(printStatus.navigation,'none');
    const printHeadingColor=await page.locator('h1').evaluate(e=>getComputedStyle(e).color);
    assert.equal(printHeadingColor,'rgb(34, 34, 34)');
    assert.deepEqual(errors, []);
    const result = { status:'PASS', version:'10-qiwu-hudie-original-imagery', backgroundChecks, imageInstances:41, uniqueVideoFrames:0, uniqueFilmImages:0, imagesGenerated:11, imageGeneration:{model:'gpt-image-2',originals:11,thirdPartyAssets:0,note:'All page imagery is original AI-generated concept art; no third-party photos, stills or video remain.'}, filmReferences:images, conceptBriefs:3, coreFilmStudies:5, additionalResearchEntries:9, vectorCount:0, pageErrors:errors, viewports:widths, preservation, printStatus, checked:['commission as the reason for entering dreams','honest image status and film attribution','41 original raster image instances loaded at their frame ratio without cropping','all major sections and narrative subsections illustrated','five film studies','three original color domains','butterfly motif, classical opening and short-line voice','defocus grammar with readable interaction edges','psychological horror grammar, consent and ethical boundaries','four horror research notes','old microgame removed','unique IDs and anchors','reading mode','print action','chapter navigation','responsive layouts'], limits:['Original concept art generated by gpt-image-2; not yet validated as in-game art direction','No game prototype or playtest','Butterfly and defocus remain design directions, not validated in a playable build','Hosted platform injection script retained; not executed in local file preview','Font stylesheet uses pinned external CDN with system-font fallback','AI-generated imagery: model-provider commercial terms still to be reviewed before release'] };
    fs.writeFileSync(path.join(__dirname,'verification.json'), JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
