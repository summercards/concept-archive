#!/usr/bin/env python3
"""保留原内嵌引擎，从锁定原始文件重建离线单 HTML 新主题。"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
BUNDLED_SOURCE = ROOT / "reference" / "baseline.html"
SOURCE = BUNDLED_SOURCE if BUNDLED_SOURCE.is_file() else Path("/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html")
EXPECTED = "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
raw = SOURCE.read_bytes()
assert hashlib.sha256(raw).hexdigest() == EXPECTED, "原始基准身份不符，拒绝构建"
text = raw.decode("utf-8")
anchor = "QC().catch(i=>bM(i&&i.stack||i));"
assert text.count(anchor) == 1
vendor_end = text.index("var oi=")
engine_region = text[text.index("<script>") + len("<script>"):vendor_end]

# XENO SIEGE 不使用原港区海水和环境随机笛声；虫群由新主题 life.js 独立接管。
changes = [
    ("function Os(te,he){let pe=1-.7*P;", "function Os(te,he){return;let pe=1-.7*P;"),
    ('sea:Be("sea",{gain:0,pos:[33,-1,0],fade:2,bus:"amb"})', 'sea:Ie'),
]
for old, new in changes:
    assert text.count(old) == 1, "业务替换锚点不存在或不唯一: " + old
    text = text.replace(old, new, 1)

# 雨遮挡uniform与CPU上传循环维持8槽，基地外墙和外星地形都可共享同一渲染链。
rain_changes = [
    ("uniform vec3 uBoxMin[4]; uniform vec3 uBoxMax[4];", "uniform vec3 uBoxMin[8]; uniform vec3 uBoxMax[8];"),
    ("a=[0,1,2,3].map(()=>new W),l=[0,1,2,3].map(()=>new W),c=Mn.color", "a=[0,1,2,3,4,5,6,7].map(()=>new W),l=[0,1,2,3,4,5,6,7].map(()=>new W),c=Mn.color"),
    ("for(let O=0;O<4;O++){let q=z[O];q&&q.min&&q.max?", "for(let O=0;O<8;O++){let q=z[O];q&&q.min&&q.max?"),
    ("for (int i = 0; i < 4; i++) { if (all(greaterThan(p, uBoxMin[i]))", "for (int i = 0; i < 8; i++) { if (all(greaterThan(p, uBoxMin[i]))"),
]
for old,new in rain_changes:
    assert text.count(old)==1, "雨遮挡锚点不唯一"
    text=text.replace(old,new,1)
fragments = ["core.js", "life.js", "game.js", "audio.js"]
patch = "\n/* === XENO SIEGE THEME START === */\n;(()=>{\n" + "\n".join((ROOT / f).read_text() for f in fragments)
patch += "\nC1=NC.createLevel;pv=NC.createBackdrop;mM=NC.createGame;window.__NC=NC;\n})();\n/* === XENO SIEGE THEME END === */\n"
assert "</script" not in patch.lower(), "片段包含非法script终止标签"
text = text.replace(anchor, patch + anchor, 1)
# 引擎片段逐字一致；页面标题与启动阶段说明属于新主题。
assert engine_region in text
text = re.sub(r"<title>.*?</title>", "<title>XENO SIEGE · BASTION 07</title>", text, count=1, flags=re.S)
text = text.replace('<div class="boot-mark">几猫</div>', '<div class="boot-mark">虫潮</div>',1)
text = text.replace('正在载入几猫港区','正在唤醒 Bastion 07 防卫战',1)
boot_words = {
    "正在布置集装箱":"正在构建外星防卫基地", "正在架设起重机":"正在部署轨道炮塔与护盾",
    "正在生成港区地面":"正在生成陨坑与异星地表", "正在检查几猫制式步枪":"正在校准第一人称火力",
    "正在启动港区主控":"正在连接 Bastion 07 核心", "正在加载弹道与烟雾":"正在生成虫群与爆浆反馈",
}
for old,new in boot_words.items():
    text=text.replace(old,new)
output=ROOT/"index.html"
output.write_text(text,encoding="utf-8")
script=re.search(r"<script>(.*?)</script>",text,re.S).group(1)
check=subprocess.run(["node","--check","-"],input=script,text=True,capture_output=True)
if check.returncode:
    sys.stderr.write(check.stderr)
    raise SystemExit(check.returncode)
manifest={
    "title":"XENO SIEGE / BASTION 07", "mode":"same-method-new-theme",
    "source":str(SOURCE),"sourceSha256":EXPECTED,
    "engine":"Three.js r180 / original embedded vendor byte-preserved",
    "vendorSha256":hashlib.sha256(engine_region.encode()).hexdigest(),
    "outputSha256":hashlib.sha256(output.read_bytes()).hexdigest(),
    "outputBytes":output.stat().st_size,
    "fragments":{f:hashlib.sha256((ROOT/f).read_bytes()).hexdigest() for f in fragments},
    "retained":["米制几何及UV","程序材质、ORM、法线与湿润","HDR末端映射","PCSS风格软阴影","双相机第一人称动作","原版程序声音/雨/音乐接口","输入→游戏→玩家/武器→敌群→FX/HUD→渲染顺序"],
    "replaced":["港区布局与海岸线","冷月城市天空","防卫基地与异星地表","虫群InstancedMesh、攀爬堆叠和波次","基地护盾任务与基地HUD文案","粗粒爆浆、冲击环和池化大特效"],
    "knownScope":["程序化第一人称防卫战纵切片，非商业AAA制作规模","虫群采用受控程序动画和InstancedMesh，不是布娃娃或完整多层NavMesh","虫群损伤/核心护盾/攀爬状态与原版射线战斗桥接，完整波次战术AI未宣称","无外部模型贴图和联网资源","实际听音、真机触控、长时性能需另验"],
    "syntax":"passed",
}
(ROOT/"build-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"output":str(output),"bytes":output.stat().st_size,"syntax":"passed","sourceUnchanged":hashlib.sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED},ensure_ascii=False,indent=2))
