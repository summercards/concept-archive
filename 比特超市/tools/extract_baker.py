#!/usr/bin/env python3
"""从原工程抽取材质烘焙器 → assets/code/material-baker.js

抽取清单（全部逐字搬运，只做一处 MRT→单目标改写）：
  Qy      全屏 quad 顶点着色器
  e3      surf 公共前导（噪声/voronoi/emit）
  Tn.*    27 个材质族的 surf() GLSL 函数
  t3      主函数
  i3      height → 法线（Sobel）
  s3      copy（albedo 平方回线性）
  dA/pA   顶点侧补丁
  mA/gA/vA/xA/yA  片元侧补丁（湿润/脏污/三平面/镂空）

改写只有一处：原版用 MRT（layout location 0/1/2），本机 three r160 不支持
WebGLRenderTarget count，因此把三个输出改成全局变量，加 uSel 分三次 pass 写。
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_HTML = "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html"
OUT = os.path.join(ROOT, "assets", "code", "material-baker.js")
HARNESS = os.path.join(ROOT, "tools", "baker_harness.js")

src = open(SRC_HTML, encoding="utf-8").read()


def grab(name):
    m = re.search(r'(?:var |,|;)' + re.escape(name) + r'=`', src)
    if not m:
        m = re.search(r'\b' + re.escape(name) + r'=`', src)
    if not m:
        raise SystemExit("找不到 " + name)
    i = m.end() - 1
    j = i + 1
    while j < len(src):
        if src[j] == "\\":
            j += 2
            continue
        if src[j] == "`":
            break
        j += 1
    return src[i + 1:j]


# ---- 27 个 surf 族函数 ------------------------------------------------------
head = src.find("Tn={}")
tail = src.find("var i3=", head)
block = src[head:tail]
surf = {}
for m in re.finditer(r"Tn\.([A-Za-z_]\w*)=`", block):
    name = m.group(1)
    i = m.end() - 1
    j = i + 1
    while j < len(block):
        if block[j] == "\\":
            j += 2
            continue
        if block[j] == "`":
            break
        j += 1
    surf[name] = block[i + 1:j]

assert len(surf) == 27, len(surf)

# 族函数本身是模板字符串，paint / hazard 里嵌了共享的 paintDmg 片段 ${n3}
shared = {}
for m in re.finditer(r"\$\{([A-Za-z_]\w*)\}", block):
    name = m.group(1)
    if name in shared:
        continue
    mm = re.search(r'(?:var |,|;)\s*' + name + r'\s*=\s*`', src)
    if not mm:
        raise SystemExit("插值片段找不到定义：" + name)
    i = mm.end() - 1
    j = i + 1
    while j < len(src):
        if src[j] == "\\":
            j += 2
            continue
        if src[j] == "`":
            break
        j += 1
    shared[name] = src[i + 1:j]

for key in list(surf):
    for name, body in shared.items():
        surf[key] = surf[key].replace("${" + name + "}", body)
    if "${" in surf[key]:
        raise SystemExit("还有未解析的插值：" + key)

vert = grab("Qy")
common = grab("e3")
main = grab("t3")
normal = grab("i3")
copy = grab("s3")
patches = {k: grab(k) for k in ["dA", "pA", "mA", "gA", "vA", "xA", "yA"]}

# ---- 唯一改写：MRT → 三次单目标 pass ---------------------------------------
old_out = ("layout(location=0) out vec4 o0; layout(location=1) out vec4 o1; "
           "layout(location=2) out vec4 o2;")
assert old_out in common, "MRT 声明没找到"
common = common.replace(
    old_out,
    "uniform float uSel;\nvec4 o0; vec4 o1; vec4 o2;\nout vec4 oSel;")

assert main.strip() == "void main(){ surf(vUv); }", repr(main)
main = ("\nvoid main(){ surf(vUv);\n"
        "  oSel = uSel < 0.5 ? o0 : (uSel < 1.5 ? o1 : o2);\n}")

total = sum(len(v) for v in surf.values())


def lit(s):
    """塞进模板字符串：转义反引号、${ 、反斜杠。"""
    s = s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return "`" + s + "`"


lines = []
lines.append("/**")
lines.append(" * 材质烘焙器 · Aurora-Material Baker")
lines.append(" * ---------------------------------------------------------------")
lines.append(" * 来源：几猫国产3A大作_V1(4).html  qg 命名空间（mats）")
lines.append(" *   surf 前导 e3        %d 字符" % len(common))
lines.append(" *   27 个族函数 Tn.*     %d 字符（%s…）" % (total, ", ".join(list(surf)[:5])))
lines.append(" *   height→法线 i3      %d 字符" % len(normal))
lines.append(" *   拷贝/平方 s3        %d 字符" % len(copy))
lines.append(" *   材质补丁 dA…yA      %d 字符" % sum(len(v) for v in patches.values()))
lines.append(" *")
lines.append(" * 贴图不是图片文件，是「族参数 × GLSL」在 GPU 上烘出来的：")
lines.append(" *   surf() 三输出 → albedo(sqrt 编码) / ORM(R=AO G=rough B=metal) / height")
lines.append(" *   height + bump(mm) → 法线（Sobel，uK = bump*0.001*D/tile）")
lines.append(" *   补丁注入标准材质 → 湿润 4 元组 / 脏污 4 元组 / 三平面 / 镂空")
lines.append(" *")
lines.append(" * 与原版唯一的差异：原版 MRT 一次画三输出，本机 three 是 r160，")
lines.append(" * 不支持 WebGLRenderTarget count，故拆成 3 次 uSel 选择的单目标 pass。")
lines.append(" * 逐像素结果相同，只多两次 draw call。")
lines.append(" *")
lines.append(" * 依赖：注入 THREE + 已存在的 WebGLRenderer + material-ledger。")
lines.append(" */")
lines.append("")
lines.append("export const GLSL_VERT = " + lit(vert) + ";")
lines.append("export const GLSL_COMMON = " + lit(common) + ";")
lines.append("export const GLSL_MAIN = " + lit(main) + ";")
lines.append("export const GLSL_NORMAL = " + lit(normal) + ";")
lines.append("export const GLSL_COPY = " + lit(copy) + ";")
lines.append("")
lines.append("export const GLSL_SURF = {")
for k, v in surf.items():
    lines.append("  %s: %s," % (k, lit(v)))
lines.append("};")
lines.append("")
lines.append("export const PATCH = {")
mapping = [("common", "dA"), ("projectVertex", "pA"), ("fragCommon", "mA"),
           ("map", "gA"), ("roughness", "vA"), ("metalness", "xA"), ("normal", "yA")]
for key, var in mapping:
    lines.append("  %s: %s," % (key, lit(patches[var])))
lines.append("};")
lines.append("")
lines.append("export const SURF_FAMILIES = [" + ", ".join('"%s"' % k for k in surf) + "];")
lines.append("export const SOURCE_CHARS = %d;" % (
    len(vert) + len(common) + len(main) + len(normal) + len(copy) + total +
    sum(len(v) for v in patches.values())))
lines.append("")

harness = open(HARNESS, encoding="utf-8").read()
out = "\n".join(lines) + "\n" + harness
open(OUT, "w", encoding="utf-8").write(out)

print("族函数      :", len(surf))
print("surf 总字符 :", total)
print("GLSL 总字符 :", len(vert) + len(common) + len(main) + len(normal) + len(copy) +
      total + sum(len(v) for v in patches.values()))
print("输出        :", OUT, os.path.getsize(OUT), "bytes")
