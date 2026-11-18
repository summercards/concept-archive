const { chromium } = require('/Users/zyq/work/wc/node_modules/playwright');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const ROOT = '/Users/zyq/WorkBuddy/2026-11-15-17-10-04', OUT = path.join(ROOT, 'outputs/nordic-spruce');
const BASE = 'http://127.0.0.1:8099/index.html', ID = 'new.nordic-spruce';
const files = ['assets/authored/nordic-spruce.js','assets/authored/contracts/nordic-spruce.json','assets/authored/registry.json','assets/authored.js','previews.js','app.js'];
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const hashes = () => Object.fromEntries(files.map(f=>[f,hash(path.join(ROOT,f))]));
(async()=>{
 const before = hashes(), b = await chromium.launch(); const errors=[],warnings=[],shots=[],cycles=[]; let report;
 try {
  const p=await b.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1.5});
  p.on('pageerror',e=>errors.push(e.message));p.on('crash',()=>errors.push('renderer crashed'));
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});
  const ready = async()=>{await p.waitForFunction(id=>location.hash==='#/a/'+id && !!document.querySelector('#pvHost canvas[data-authored="'+id+'"]'),ID);assert.equal(await p.locator('#pvHost .pv-fail').count(),0);};
  await p.goto(BASE+'#/a/'+ID,{waitUntil:'load'});await ready();
  const loaded=await p.evaluate(id=>{const it=AUTHORED_CATALOG.items.find(x=>x.id===id);return{sourceHash:it.sourceHash,contract:it.contract,authored:AUTHORED_CATALOG.items.length,original:DB.items.length,revision:THREE.REVISION}},ID);
  assert.equal(loaded.sourceHash,before['assets/authored/nordic-spruce.js']);assert.equal(loaded.authored,3);assert.equal(loaded.revision,'160');
  async function press(name){await p.locator('#pvHost').getByRole('button',{name,exact:true}).click();await ready();}
  async function shot(file){await p.locator('#pvHost').screenshot({path:path.join(OUT,file)});const cv=p.locator('#pvHost canvas[data-authored]');shots.push({file,sha256:hash(path.join(OUT,file)),assetId:ID,sourceHash:loaded.sourceHash,options:JSON.parse(await cv.getAttribute('data-authored-options')),camera:JSON.parse(await cv.getAttribute('data-authored-camera')),engine:loaded.revision});}
  await shot('material-overall.png');await press('正面');await shot('material-front.png');await press('背面');await shot('material-back.png');await press('整体');await press('纯灰几何');await shot('clay-overall.png');await press('结构线框');await shot('wire-overall.png');await press('原材质');
  await press('19');await shot('seed-19.png');await press('43');await shot('seed-43.png');await press('7');
  const canvas=p.locator('#pvHost canvas[data-authored]');await canvas.scrollIntoViewIfNeeded();let box=await canvas.boundingBox();
  // Actual wheel zoom; the following closeup is deliberately not a full-tree evidence frame.
  await p.mouse.move(box.x+box.width*.5,box.y+box.height*.5);
  for(let i=0;i<7;i++) await p.mouse.wheel(0,-160);
  await shot('crown-detail.png');await press('整体');
  // Larger portrait crop shows the real tree at more useful inspection resolution.
  await p.evaluate(()=>{const cv=document.querySelector('#pvHost canvas[data-authored]');cv.style.height='1040px';cv.style.width='100%';});
  await press('整体');await shot('material-portrait.png');
  const basePixel=await p.locator('#pvHost canvas[data-authored]').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data.slice(0,24)));
  for(let i=0;i<3;i++){
    await p.evaluate(()=>{location.hash='#/authoring'});await p.waitForFunction(()=>location.hash==='#/authoring'&&!document.querySelector('#pvHost'));
    await p.evaluate(id=>{location.hash='#/a/'+id},ID);await ready();cycles.push(i+1);
  }
  await p.evaluate(()=>{location.hash='#/'});await p.waitForFunction(()=>document.querySelectorAll('#authoredWall canvas[data-authored]').length===3);
  const recent=await p.locator('#authoredWall .pv-tile').evaluateAll(es=>es.map(e=>e.getAttribute('href')));assert.equal(recent[0],'#/a/'+ID);
  await p.locator('#authoredRecent').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,'library-home.png')});
  await p.evaluate(()=>{location.hash='#/c/NEW'});await p.waitForFunction(()=>document.querySelectorAll('#newCatWall canvas[data-authored]').length===3);await p.screenshot({path:path.join(OUT,'library-new.png')});
  await p.fill('#q','北欧');assert.equal(await p.locator('.nav-item').count(),1);await p.fill('#q','');
  await p.goto('http://10.30.70.199:8100/index.html#/a/'+ID,{waitUntil:'load'});await ready();
  await p.setViewportSize({width:390,height:844});await press('整体');
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.equal(overflow,0);await p.locator('#pvHost').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,'mobile.png')});
  const after=hashes();assert.deepEqual(before,after);assert.equal(errors.length,0,errors.join('\n'));
  report={status:'PASS',assetId:ID,scope:'真实网页三视图/灰模/线框/三个seed、3轮mount-unmount、首页NEW搜索、LAN、390宽。无完整GPU内存趋势证明。',sourceFiles:before,stableInputs:true,loaded,shots,cycles,library:{recent,search:'北欧',authored:3,original:283},mobile:{width:390,overflow},LAN:'http://10.30.70.199:8100/index.html#/a/'+ID,errors,warnings};
 }finally{await b.close()}
 fs.writeFileSync(path.join(OUT,'ui-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,shots:report.shots.length,cycles:report.cycles,library:report.library,mobile:report.mobile,errors:report.errors,warnings:report.warnings},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
