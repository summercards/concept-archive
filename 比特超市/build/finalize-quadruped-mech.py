from pathlib import Path
import hashlib,json
ROOT=Path('/Users/zyq/WorkBuddy/2026-11-15-17-10-04'); OUT=ROOT/'outputs/quadruped-mech'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
auto=json.loads((OUT/'iteration2/report.json').read_text()); ui=json.loads((OUT/'ui-verification.json').read_text())
assert auto['automaticChecks']['passed'] and ui['status']=='PASS'
files=['assets/authored/quadruped-mech.js','assets/authored/contracts/quadruped-mech.json','assets/authored/registry.json','assets/authored.js','previews.js','app.js']
sourceFiles={f:sha(ROOT/f) for f in files}
images=['material-overall.png','material-front.png','material-back.png','clay-overall.png','wire-overall.png','armor-orange.png','animation-step.png','animation-paused.png','animation-reset.png','library-new.png','mobile.png']
result={'assetId':'new.quadruped-mech','scope':'原创四足机甲catalog实际图片/动画检查；非r180整机、真实弹道或物理IK认证','reviewMethod':'实际打开整体、正背面、灰模、线框、橙色装甲、动画中间态/复位和NEW分类图','conclusion':'四条独立机械腿、髋/膝/下腿/活塞/足掌、装甲机身、炮塔环、炮架、炮管、炮口制退器与后坐套筒均实际可见；动画状态中没有发现断裂、穿插或占位盒。','notes':['实际外形是轻量化四足炮台，不是人形机甲；四足宽稳支撑与前向单炮是本次契约。','动画为程序化待机/微步态/炮塔摆动/周期后坐；未接真实弹道、开火音效、粒子或导航。','截图出现浏览器GPU ReadPixels同步性能警告，但没有pageerror；不是帧率/大规模编队通过证据。'],'sourceFiles':sourceFiles,'automaticReportSha256':sha(OUT/'iteration2/report.json'),'uiReportSha256':sha(OUT/'ui-verification.json'),'images':[{'file':f,'sha256':sha(OUT/f)} for f in images],'notExecuted':['r180整机集成','真实弹道/开火音效','完整物理IK/导航','LOD和大规模编队性能','完整GPU/CPU内存趋势'],'acceptanceWriteback':False}
target=OUT/'visual-review.json'; assert not target.exists(); target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n'); print(json.dumps({'review':str(target),'source':sourceFiles['assets/authored/quadruped-mech.js']}))
