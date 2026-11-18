const { chromium } = require("/Users/zyq/work/wc/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3 });
  await p.goto("file:///Users/zyq/WorkBuddy/2026-11-15-17-10-04/index.html#/a/props-ledger", { waitUntil: "load" });
  await p.waitForTimeout(300);
  const body = await p.$("#codeBody");
  await body.screenshot({ path: "build/shots/zoom-code.png", clip: undefined });
  // 检查高亮结构
  const info = await p.$eval("#codeBody .cl:nth-child(4)", el => el.innerHTML.slice(0, 400));
  console.log(info);
  await b.close();
})();
