const { chromium } = require('/Users/zyq/.npm/_npx/405f4af606701f85/node_modules/playwright');
const path=require('path');
const root=path.join(__dirname,'..');
const target='file://'+path.join(root,'index.html');
const out=n=>path.join(root,'previews',n);
(async()=>{
  const b=await chromium.launch({headless:true});
  try{
    const ctx=await b.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const p=await ctx.newPage();
    await p.goto(target,{waitUntil:'load'});
    await p.evaluate(()=>document.fonts.ready);
    await p.waitForTimeout(600);
    await p.locator('.commission-block').scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await p.locator('.commission-block').screenshot({path:out('commission-preview.png')});
    await p.locator('.loop-line').screenshot({path:out('loop-preview.png')});
    await p.locator('#identity').scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    const y=await p.evaluate(()=>{const e=document.querySelector('.commission-block');const r=e.getBoundingClientRect();return window.scrollY+r.top-660;});
    await p.evaluate(y=>window.scrollTo(0,y),y);
    await p.waitForTimeout(300);
    await p.screenshot({path:out('identity-tail-preview.png')});
    await p.setViewportSize({width:390,height:844});
    await p.evaluate(()=>document.querySelector('.commission-block').scrollIntoView({block:'center'}));
    await p.waitForTimeout(400);
    await p.locator('.commission-block').screenshot({path:out('commission-mobile-preview.png')});
  } finally { await b.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
