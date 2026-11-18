#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 assets/code/*.js 与抽取出来的表，打包成网页用的 assets/data.js。
网页只读这一个文件，离线 file:// 打开也能用（不走 fetch）。
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE = os.path.join(ROOT, "assets", "code")
OUT = os.path.join(ROOT, "assets", "data.js")
D = json.load(open(os.path.join(ROOT, "build", "tables.json"), encoding="utf-8"))
LED = D["ledger"]
MODS = {m["role"]: m for m in D["modules"]}

# 验证结果：build/verify.mjs 每次跑完写一份，这里直接读，避免手写数字漂移
VR_PATH = os.path.join(ROOT, "build", "verify-result.json")
if os.path.exists(VR_PATH):
    VR = json.load(open(VR_PATH, encoding="utf-8"))
else:
    raise SystemExit("缺 build/verify-result.json，先跑 node build/verify.mjs")


def vsec(name, default=0):
    return VR["sections"].get(name, {"n": default})["n"]



def read(name):
    return open(os.path.join(CODE, name), encoding="utf-8").read()


def lines_of(src):
    return len([l for l in src.split("\n") if l.strip()])


def bytes_of(src):
    return len(src.encode("utf-8"))


# ---------------------------------------------------------------- 材质实例表
def material_rows():
    raw = D["tables"]["material_instance"]
    i = raw.find("{") + 1
    depth = 0
    instr = None
    start = i
    entries = []
    for j in range(i, len(raw)):
        ch = raw[j]
        if instr:
            if ch == "\\":
                continue
            if ch == instr:
                instr = None
            continue
        if ch in "\"'`":
            instr = ch
        elif ch in "{[(":
            depth += 1
        elif ch in "}])":
            depth -= 1
            if depth < 0:
                entries.append(raw[start:j])
                break
        elif ch == "," and depth == 0:
            entries.append(raw[start:j])
            start = j + 1

    rows = []
    for e in entries:
        m = re.match(r"\s*([A-Za-z_]\w*):(Nt|Xa)\((.*)\)\s*$", e, re.S)
        if not m:
            continue
        name, kind, args = m.group(1), m.group(2), m.group(3)
        if kind == "Xa":
            rows.append({"id": name, "set": "paint", "color": args.strip(), "rough": "1", "metal": "1", "note": "Xa 着色"})
            continue
        am = re.match(r'\s*"([\w_]+)"\s*(?:,\s*\{(.*)\})?\s*$', args, re.S)
        if not am:
            continue
        fam, body = am.group(1), am.group(2) or ""
        row = {"id": name, "set": fam}
        for f in ("color", "rough", "metal", "tint"):
            mm = re.search(r'(?:^|,\s*)' + f + r':\s*("?[^,]+' + chr(34) + r'?)', body)
            if mm:
                row[f] = mm.group(1).strip()
        row["flags"] = [k for k in ("alphaCut", "transparent", "side") if re.search(r"(?:^|,)%s:" % k, body)]
        rows.append(row)
    return rows


# ---------------------------------------------------------------- 字段表工具
def kv_rows(src, start_marker):
    """从 `名 = { ... }` 里按顶层逗号切出 key:value，保持源码顺序。"""
    i = src.find(start_marker)
    if i < 0:
        return []
    j = src.index("{", i)
    depth = 0
    end = len(src)
    for k in range(j, len(src)):
        ch = src[k]
        if ch in "{[(":
            depth += 1
        elif ch in "}])":
            depth -= 1
            if depth == 0:
                end = k
                break
    body = src[j + 1:end]

    chunks, cur, depth = [], "", 0
    for ch in body:
        if ch in "{[(":
            depth += 1
        elif ch in "}])":
            depth -= 1
        if ch == "," and depth == 0:
            chunks.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        chunks.append(cur)

    out = []
    for r in chunks:
        m = re.match(r"^\s*([A-Za-z_$][\w$]*)\s*:\s*(.+)$", r, re.S)
        if m:
            out.append({"k": m.group(1), "v": m.group(2).strip()})
    return out



def audio_rows():
    """从 audio-recipes.js 里读回 57 条配方明细，供页面列表展示。"""
    src = read("audio-recipes.js")
    out = []
    for m in re.finditer(r"^\s{2}([a-z_0-9]+):\s*\{(.+?)\},$", src, re.M):
        body = m.group(2)
        row = {"id": m.group(1)}
        for f in ("gen", "n", "sr", "peak", "bus", "max", "pri", "ref", "roll", "boot"):
            mm = re.search(r"(?:^|,)\s*" + f + r":\s*([^,]+)", body)
            if mm:
                row[f] = mm.group(1).strip().strip('"')
        out.append(row)
    return out


CRIT = {
    "env-atmosphere": {"pure": "✓", "free": "△", "run": "✓", "verified": "✓"},
    "quality-presets": {"pure": "✓", "free": "✓", "run": "✓", "verified": "✓"},
    "material-ledger": {"pure": "✓", "free": "△", "run": "✓", "verified": "✓"},
    "material-baker": {"pure": "△", "free": "△", "run": "✓", "verified": "✓"},
    "props-ledger": {"pure": "✓", "free": "✓", "run": "✓", "verified": "✓"},
    "modeling-kit": {"pure": "△", "free": "△", "run": "✓", "verified": "✓"},
    "player-tuning": {"pure": "✓", "free": "✓", "run": "✓", "verified": "✓"},
    "weapon-tuning": {"pure": "✓", "free": "✓", "run": "✓", "verified": "✓"},
    "ai-tuning": {"pure": "✓", "free": "✓", "run": "✓", "verified": "✓"},
    "audio-recipes": {"pure": "△", "free": "✓", "run": "△", "verified": "✓"},
}


# ---------------------------------------------------------------- 资产清单
def build():
    env = read("env-atmosphere.js")
    q = read("quality-presets.js")
    mat = read("material-ledger.js")
    baker = read("material-baker.js")
    props = read("props-ledger.js")
    kit = read("modeling-kit.js")
    player = read("player-tuning.js")
    weapon = read("weapon-tuning.js")
    ai = read("ai-tuning.js")
    sound = read("audio-recipes.js")

    mat_rows = material_rows()
    fam_rows = kv_rows(mat, "export const FAMILIES = {")

    assets = [
        {
            "id": "env-atmosphere",
            "name": "环境光影包",
            "en": "Env Atmosphere",
            "type": "ENV",
            "grade": "A",
            "tags": ["光影", "体积光", "纯数据", "需宿壳", "米制"],
            "summary": "一整局游戏的「光」就是这几个对象：太阳方向与强度、天空四色、体积雾、阴影正交框、灯池预算、曝光曲线。全部是可读数值，抽出即用。",
            "anchor": "L4191:C51314 oi / L4191:C51389 Mn / L4191:C51468 en / L4744:C569 g",
            "deps": "THREE（仅安装函数需要）",
            "standalone": "数据零依赖；install() 需要 THREE",
            "code": env,
            "static": {
                "世界尺度 WORLD": [
                    {"k": "min / max", "v": "(-40, 0, -30) → (40, 30, 30) m"},
                    {"k": "groundY / seaY", "v": "0 / -1.6 m"},
                    {"k": "quayX", "v": "30 m（岸线，碰撞与海面分界）"},
                ],
                "太阳 SUN": [
                    {"k": "dir", "v": "(0.916, 0.225, 0.331) 归一化"},
                    {"k": "color", "v": "(1, 0.72, 0.42) 暖橙"},
                    {"k": "intensity", "v": "9"},
                ],
                "天空与雾 SKY": [
                    {"k": "zenith", "v": "(0.055, 0.085, 0.13)"},
                    {"k": "horizon", "v": "(0.95, 0.55, 0.28)"},
                    {"k": "horizonAway", "v": "(0.16, 0.22, 0.3)"},
                    {"k": "fog", "v": "(0.42, 0.47, 0.52)"},
                ],
            },
            "tuning": [{"k": r["k"], "v": r["v"]} for r in kv_rows(env, "export const TUNING = {")],
            "groups": ["体积光 6 项", "AO 3 项", "Bloom 2 项", "镜头脏污 5 项", "曝光自适应 3 项", "调色 7 项"],
            "verdict": "可直接搬。26 个字段全部与源码逐字一致，安装函数只做原版做过的事，没有额外加环境光。",
            "limits": "天空与体积光本身是 shader；这里给的是喂给 shader 的数值与安装方式，不含 shader 源码。",
        },
        {
            "id": "quality-presets",
            "name": "画质预设",
            "en": "Quality Presets",
            "type": "ENV",
            "grade": "A",
            "tags": ["性能", "配置", "纯数据", "纯函数", "自动选择"],
            "summary": "五档 × 11 字段的渲染预算表，加一个按设备与显卡字符串自动选档的函数。资产库里的「这条管线能跑多好」由这张表定义。",
            "anchor": "L4191:C51664 Pr / zy()",
            "deps": "无",
            "standalone": "完全独立",
            "code": q,
            "matrix": {
                "cols": ["scale", "msaa", "shadow", "tex", "volSteps", "ao", "planar", "bloom", "motionBlur", "rain"],
                "rows": [[p["name"], p["scale"], p["msaa"], p["shadow"], p["tex"], p["volSteps"],
                          "✓" if p["ao"] else "—", p["planar"], "✓" if p["bloom"] else "—",
                          "✓" if p["motionBlur"] else "—", p["rain"]] for p in q and [
                              {"name": "test", "scale": 1, "msaa": 0, "shadow": 1024, "tex": 256, "volSteps": 10, "ao": True, "planar": 0.5, "bloom": True, "motionBlur": False, "rain": 0.4},
                              {"name": "low", "scale": 0.7, "msaa": 0, "shadow": 2048, "tex": 512, "volSteps": 12, "ao": False, "planar": 0, "bloom": True, "motionBlur": False, "rain": 0.5},
                              {"name": "medium", "scale": 0.85, "msaa": 2, "shadow": 2048, "tex": 1024, "volSteps": 16, "ao": True, "planar": 0.5, "bloom": True, "motionBlur": False, "rain": 0.8},
                              {"name": "high", "scale": 1, "msaa": 4, "shadow": 4096, "tex": 1024, "volSteps": 24, "ao": True, "planar": 0.5, "bloom": True, "motionBlur": True, "rain": 1},
                              {"name": "ultra", "scale": 1, "msaa": 4, "shadow": 4096, "tex": 2048, "volSteps": 40, "ao": True, "planar": 1, "bloom": True, "motionBlur": True, "rain": 1},
                          ]],
            },
            "verdict": "可直接搬。55 个数值逐字一致，另外补了区间校验——原版没有。",
            "limits": "自动选档依赖 navigator/screen，服务端不可用；原版对显卡字符串的判断是启发式，不是白名单。",
        },
        {
            "id": "material-ledger",
            "name": "材质账簿",
            "en": "Material Ledger",
            "type": "MAT",
            "grade": "A",
            "tags": ["材质", "程序化", "纯数据", "米制"],
            "summary": "29 个材质族 × 48 个实例。族定米制尺度（贴图覆盖多少米、凹凸多少毫米），实例定这块表面脏成什么样。换一套实例就是换一套美术风格。",
            "anchor": "L5294:C17715 c3 / L5294:C19452 l1",
            "deps": "无（toStandard 需 THREE）",
            "standalone": "数据零依赖；落地成标准材质只还原颜色",
            "code": mat,
            "families": [{"id": f["k"], "v": f["v"]} for f in fam_rows],
            "instances": mat_rows,
            "verdict": "可直接搬。族与实例都是纯数据，逐字保留；48 条实例全部能解析到合法族。",
            "limits": "账簿本身只到「参数」这一层：rough/metal 是乘子、color 是基色，""不带贴图。真正的 albedo / ORM / 法线、湿润掩码与宏观脏污在同库的「材质烘焙器」里，""两者接起来才是完整材质——预览用的就是这个组合。",
            "related": ["material-baker", "props-ledger"],
        },
        {
            "id": "material-baker",
            "name": "材质烘焙器",
            "en": "Material Baker",
            "type": "MAT",
            "grade": "B",
            "tags": ["材质", "程序化", "需宿壳", "GLSL", "GPU"],
            "summary": "27 个 GLSL 族函数把「族参数 × 实例参数」在 GPU 上烘成 albedo / ORM / height，再由 height 求出法线；最后把湿润、脏污、三平面、镂空补丁注入标准材质。贴图不是图片，是算出来的。",
            "anchor": "L4833:C806325 Tn 表 / L5450:C869499 h3 补丁 / L5453:C870007 Gg",
            "deps": "THREE + WebGLRenderer（需注入）",
            "standalone": "需宿主渲染器，无引擎全局",
            "code": baker,
            "static": {"烘焙管线": [
                {"k": "surf 族函数", "v": "27 个（asphalt…water）"},
                {"k": "GLSL 总量", "v": "48,104 字符，逐字抽自原版"},
                {"k": "每族 pass", "v": "surf×3 → albedo / ORM / height，再 copy×2 + 法线×1"},
                {"k": "法线强度", "v": "uK = bump(mm) × 0.001 × 分辨率 / tile(m)"},
                {"k": "ORM 打包", "v": "R=AO  G=roughness  B=metalness"},
                {"k": "湿润", "v": "uSlWet / uSlWetP 4 元组，按朝向与高度加权"},
                {"k": "脏污", "v": "uSlMacro 4 元组，三线性噪声"},
                {"k": "与原版差异", "v": "MRT → 3 次单目标 pass（r160 无 count）"},
            ]},
            "verdict": "可搬，但要带宿主。GLSL 逐字抽自原版；唯一改动是把 MRT 拆成三次 uSel 选择的单目标 pass，逐像素结果相同。27 族在 three r160 上全部编译通过，并已用于 48 个材质实例。",
            "limits": "补丁靠替换 three 的标准材质 chunk（map_fragment / roughnessmap_fragment / normal_fragment_maps…），换 three 大版本需要重新核对变量名；原版是 r180，本机是 r160，已在 r160 上验证。",
            "related": ["material-ledger", "modeling-kit"],
        },
        {
            "id": "props-ledger",
            "name": "道具台账",
            "en": "Prop Ledger",
            "type": "MODEL",
            "grade": "A",
            "tags": ["道具", "关卡", "纯数据", "米制"],
            "summary": "36 条道具，每条 5 个字段：宽高深（米）、材质名、表面类型。这是全工程唯一一处「资产清单」式的数据，也是最容易独立管理的一层。",
            "anchor": "L5453:C13986 Gi / _i() 注册表",
            "deps": "无",
            "standalone": "完全独立",
            "code": props,
            "props": [{"id": r["id"], "size": r["size"], "material": r["material"], "surface": r["surface"],
                       "custom": r["id"] in set(LED["propsCustom"])} for r in LED["props"]],
            "verdict": "可直接搬。36 条 × 5 字段与源码逐字一致；底锚约定（原点在底面中心）也保住了。",
            "limits": "台账只描述「多大多重多什么材质」。几何本身由 14 个自定义构造器 + 1 个兜底盒生成，那部分在 modeling-kit 与关卡模块里。",
        },
        {
            "id": "modeling-kit",
            "name": "程序化建模工具",
            "en": "Modeling Kit",
            "type": "GEO",
            "grade": "B",
            "tags": ["几何", "生成器", "纯函数", "需宿壳", "米制"],
            "summary": "道具不是导入的，是被这些函数算出来的。倒角盒、推入倒角盒、圆柱、样条管、建模器、静态合批——抽出来后任何一个道具构造器都能脱离关卡单独跑。",
            "anchor": "L5453 p3 / Wi / ot / Fn / je / Lc / Ii / jn / By",
            "deps": "THREE + BufferGeometryUtils.mergeGeometries + mats 适配器",
            "standalone": "需要 THREE；已逐顶点比对通过",
            "code": kit,
            "api": [
                {"k": "metricBox(w, h, d, bevel, anchor)", "v": "24 顶点倒角盒，米制 UV，可底锚"},
                {"k": "bevelBox(w, h, d, bevel, anchor)", "v": "3×3×3 分段推入式倒角盒，软边"},
                {"k": "cylinder(rTop, rBot, h, seg, open, anchor)", "v": "侧面 v=顶点 Y（米），u=角度×周长"},
                {"k": "tube(points, radius, seg, closed, tension)", "v": "样条管，UV 按弧长与周长"},
                {"k": "place(geom, x, y, z, rot)", "v": "就地变换，避免 clone"},
                {"k": "vertexColor(geom, col)", "v": "按位置求色或整体色"},
                {"k": "merge(geoms)", "v": "补齐属性、统一索引后合并"},
                {"k": "Builder", "v": "建模器：box/cyl/tube/bar/beam/decal → 按材质分桶"},
                {"k": "batch(root, opts)", "v": "静态合批，userData.noMerge 例外"},
            ],
            "verdict": "可搬，但要带 THREE。7 个几何函数已与原件逐顶点比对（位置/法线/UV/索引全等），建模器与合批按结构复刻。",
            "limits": "原版的 CylinderGeometry 被补丁成「v 用米」，本地 three 没有这个补丁，抽出时按 y 还原了；换 three 版本要重跑比对。",
            "evidence": "%d 项校验中的 %d 项几何比对全部通过，逐顶点比位置/法线/UV/索引（见 build/verify.mjs）" % (VR["passed"], vsec("几何原语")),
            "related": ["material-baker", "props-ledger"],
        },
        {
            "id": "player-tuning",
            "name": "玩家运动调参",
            "en": "Player Tuning",
            "type": "NUM",
            "grade": "A",
            "tags": ["动作", "手感", "纯数据", "纯函数", "米制"],
            "summary": "手感的全部来源就是这 36 个数：走跑蹲瞄的速度、加减速、跳跃初速、步幅、镜头起伏、后坐恢复。原版没单位没区间，这里补齐了。",
            "anchor": "L4191:C51585 Pi / L5939:C100464 Mt",
            "deps": "无",
            "standalone": "完全独立",
            "code": player,
            "fields": [{"k": r["k"], "v": r["v"]} for r in kv_rows(player, "export const TUNING = {")],
            "scale": [{"k": r["k"], "v": r["v"]} for r in kv_rows(player, "export const SCALE = {")],
            "verdict": "可直接搬。36 个字段与源码逐字一致（standHeight 指向 SCALE.height，关系也保住了）。",
            "limits": "这些数只是「输入」；真正的运动解算在玩家模块里（碰撞、台阶、落地下沉），未抽。",
        },
        {
            "id": "weapon-tuning",
            "name": "武器数值与后坐弹簧",
            "en": "Weapon & Springs",
            "type": "NUM",
            "grade": "A",
            "tags": ["战斗", "手感", "纯数据", "纯函数", "弹簧"],
            "summary": "原版把核心四数写成了裸变量 Gv/B_/H_/O_，连名字都没有。这里给了名字、单位、派生量，还有驱动后坐与摆动的 9 根弹簧。",
            "anchor": "L6065:C68 Gv/B_/H_/O_ / L6065:C5784 弹簧组 / pa() ma()",
            "deps": "无",
            "standalone": "完全独立",
            "code": weapon,
            "numbers": [
                {"k": "magSize", "v": "30 发", "note": "原变量 Gv"},
                {"k": "reserve", "v": "150 发", "note": "原变量 B_"},
                {"k": "damage", "v": "26 hp/发", "note": "原变量 H_"},
                {"k": "rpm", "v": "720 发/分", "note": "原变量 O_"},
                {"k": "weakPointMul", "v": "2.2×", "note": "弱点倍率"},
                {"k": "spread", "v": "0.0125 rad", "note": "腰射基础扩散"},
            ],
            "springs": [
                {"id": "kickZ", "k": LED["springSet"]["kickZ"][0], "c": LED["springSet"]["kickZ"][1], "use": "后坐位移"},
                {"id": "kickPitch", "k": LED["springSet"]["kickPitch"][0], "c": LED["springSet"]["kickPitch"][1], "use": "枪口上跳"},
                {"id": "kickYaw", "k": LED["springSet"]["kickYaw"][0], "c": LED["springSet"]["kickYaw"][1], "use": "横向抖"},
                {"id": "kickRoll", "k": LED["springSet"]["kickRoll"][0], "c": LED["springSet"]["kickRoll"][1], "use": "滚转"},
                {"id": "swayYaw", "k": 110, "c": 15, "use": "视角惯性"},
                {"id": "swayPitch", "k": 110, "c": 15, "use": "视角惯性"},
                {"id": "jumpY", "k": 140, "c": 13, "use": "跳跃起伏"},
                {"id": "jumpPitch", "k": 140, "c": 13, "use": "落地点头"},
                {"id": "bump", "k": 600, "c": 30, "use": "磕碰"},
            ],
            "verdict": "可直接搬。4 个核心数 + 9 组弹簧逐字一致，积分器与原件数值全等（含低帧率子步切分）。",
            "limits": "换弹手部关键帧轨（2.1s/2.72s、1.345s 提交）依赖整段视图模型代码，目前只搬了时间点，没搬姿势曲线。",
        },
        {
            "id": "ai-tuning",
            "name": "敌人感知调参",
            "en": "AI Perception",
            "type": "NUM",
            "grade": "A",
            "tags": ["AI", "感知", "纯数据", "数值"],
            "summary": "14 个数决定敌人能不能发现你：视距、视锥角度、丢失时间、搜索时长、听觉半径、同时攻击令牌。",
            "anchor": "L6065:C60541 Ui",
            "deps": "无",
            "standalone": "完全独立",
            "code": ai,
            "fields": [{"k": r["k"], "v": r["v"]} for r in kv_rows(ai, "export const TUNING = {")],
            "verdict": "可直接搬。14 个字段逐字一致，视锥余弦的换算关系也保住了。",
            "limits": "感知状态机、导航、动画不在本模块。gull/hound 两个变体是构造函数，未抽。",
        },
        {
            "id": "audio-recipes",
            "name": "音效配方",
            "en": "Sound Recipes",
            "type": "AUDIO",
            "grade": "B",
            "tags": ["音效", "混音", "纯数据"],
            "summary": "57 条配方，每条说明这个声音该怎么混：几层声部、峰值、走哪条总线、同时最多几路、优先级、世界坐标下的参考距离与滚降。",
            "anchor": "L5939:C64931 Go",
            "deps": "无",
            "standalone": "配方独立；波形生成器未抽",
            "code": sound,
            "recipes": audio_rows(),
            "verdict": "配方层可搬。总线/优先级/并发上限这些是「混音设计」，换引擎也能照搬。",
            "limits": "57 个 gen 指向的合成函数依赖 WebAudio 上下文，未抽。要听声，得连同生成器一起搬或用采样替代。",
        },
    ]

    meta = {
        "source": {
            "file": "几猫国产3A大作_V1(4).html",
            "path": "/Users/zyq/work/工程参考/",
            "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
            "lines": D["source"]["lines"],
            "mb": round(D["source"]["chars"] / 1048576, 2),
            "engine": "Three.js r180（内嵌，含补丁）",
            "arch": "单 IIFE + 共享闭包，模块以命名空间对象导出后被打包压平",
        },
        "modules": [
            {"role": m["role"], "anchor": m["anchor"], "kb": m["kb"], "fn": m["functions"],
             "nums": m["numericLiterals"], "mats": m["ctxRefs"]["mats"], "scene": m["ctxRefs"]["scene"]}
            for m in D["modules"] if m["role"] != "three"
        ],
        "counts": {
            "assets": len(assets),
            "props": len(LED["props"]),
            "customBuilders": len(LED["propsCustom"]),
            "families": len(LED["materialFamilies"]),
            "instances": len(LED["materialInstances"]),
            "recipes": 57,
            "springs": 9,
        },
        "verify": {"passed": VR["passed"], "failed": VR["failed"],
            "note": "%d 项：%d 项几何逐顶点 + %d 项 GLSL 逐字回原工程 + %d 项数值/结构" % (
                VR["passed"], vsec("几何原语"), vsec("材质烘焙器"),
                VR["passed"] - vsec("几何原语") - vsec("材质烘焙器"))},
    }

    for a in assets:
        a["crit"] = CRIT[a["id"]]
        a["loc"] = lines_of(a["code"])
        a["bytes"] = bytes_of(a["code"])

    # 用经典脚本挂到 window，而不是 ESM：
    # 这样双击 index.html（file://）也能直接打开，不需要起服务器。
    blob = json.dumps({"meta": meta, "assets": assets}, ensure_ascii=False, indent=1).replace("</", "<\\/")
    payload = (
        "/* 由 tools/bundle.py 生成，勿手改。源：assets/code/*.js */\n"
        "window.CODE_ASSET_DB = " + blob + ";\n"
    )
    open(OUT, "w", encoding="utf-8").write(payload)
    print("已写出", OUT, os.path.getsize(OUT), "bytes;", len(assets), "个资产")


if __name__ == "__main__":
    build()
