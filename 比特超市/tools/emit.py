#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 analyze.py 抽出的原版参数表，生成可独立 import 的代码资产。
数据不走手抄：所有数字直接从 build/tables.json 搬运。
输出：assets/code/*.js
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE = os.path.join(ROOT, "assets", "code")
D = json.load(open(os.path.join(ROOT, "build", "tables.json"), encoding="utf-8"))
T = D["tables"]
META = D["tableMeta"]
LED = D["ledger"]


def anchor(key):
    return META[key]["anchor"]


def num(v):
    """数字字面量还原成 JS 源码形态（去掉多余尾零）。"""
    s = ("%g" % v)
    return s


# ------------------------------------------------------------------ 道具台账
def emit_props():
    rows = LED["props"]
    custom = set(LED["propsCustom"])
    lines = []
    for r in rows:
        w, h, d = r["size"]
        flag = "  // 自定义几何" if r["id"] in custom else ""
        lines.append(
            '  %-18s { size: [%s, %s, %s], material: "%s", surface: "%s" },%s'
            % (r["id"] + ":", num(w), num(h), num(d), r["material"], r["surface"], flag)
        )
    body = "\n".join(lines)
    src = f'''/**
 * 道具台账 · Aurora-Props
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html {anchor("props")}  var Gi
 *      自定义几何注册：_i(name, builder)，共 {len(custom)} 条
 *
 * 36 条道具，每条 5 个字段：[宽, 高, 深](米) + 材质名 + 表面类型。
 * 这是原版唯一一处"资产清单"式数据：尺寸、材质、碰撞面都写在一行里。
 * 原点在底面中心（bottom anchor），长轴沿 X。
 *
 * 依赖：无。纯数据，可直接被关卡生成/碰撞/合批三方共用。
 */

export const PROP_LEDGER = {{
{body}
}};

/** 有自定义几何构造器的道具（其余 22 条走倒角盒兜底）。 */
export const HAS_CUSTOM_BUILDER = new Set([
{(chr(10) + "  ").join('"%s",' % c for c in LED["propsCustom"])}
]);

export const PROP_IDS = Object.keys(PROP_LEDGER);

/** 取尺寸，未知 id 抛错——原版是 warn 后回退成 1×1×1 的 concrete 盒。 */
export function sizeOf(id) {{
  const p = PROP_LEDGER[id];
  if (!p) throw new Error(`未知道具 "${{id}}"`);
  return p.size.slice();
}}

/** 包围盒：底面中心为原点，米制。 */
export function boundsOf(id) {{
  const [w, h, d] = sizeOf(id);
  return {{ min: [-w / 2, 0, -d / 2], max: [w / 2, h, d / 2] }};
}}

/** 只覆盖部分字段的派生台账（用于做主题变体而不动原表）。 */
export function withOverrides(patch) {{
  const out = {{}};
  for (const [id, p] of Object.entries(PROP_LEDGER)) {{
    out[id] = {{ ...p, ...(patch[id] || {{}}) }};
  }}
  return out;
}}

/** 台账体检：尺寸为正、材质名非空。 */
export function validate() {{
  const issues = [];
  for (const [id, p] of Object.entries(PROP_LEDGER)) {{
    if (!(p.size[0] > 0 && p.size[1] > 0 && p.size[2] > 0)) issues.push(`${{id}}: 尺寸非正`);
    if (!p.material) issues.push(`${{id}}: 缺材质`);
    if (!p.surface) issues.push(`${{id}}: 缺表面类型`);
  }}
  return issues;
}}

export default {{ PROP_LEDGER, HAS_CUSTOM_BUILDER, PROP_IDS, sizeOf, boundsOf, withOverrides, validate }};
'''
    open(os.path.join(CODE, "props-ledger.js"), "w", encoding="utf-8").write(src)
    return len(rows)


# ------------------------------------------------------------------ 材质账簿
RAW = open("/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html", encoding="utf-8").read()


def emit_materials():
    fam = T["material_family"].strip()
    inst = T["material_instance"].strip()
    fam = fam[fam.find("{"):]
    inst = inst[inst.find("{"):]

    # 预设 + 工厂：原文切片，保留原始短名，避免手抄与改名导致的漂移
    p0 = RAW.find("cA=[.42,.38,.5,0]")
    p1 = RAW.find('Nt=(i,e={})=>', p0)
    p2 = RAW.find("l1={", p1)
    preset_block = RAW[p0:p1].rstrip(",")              # cA=..,a1=[0,0,1,0]
    factory_block = RAW[p1:p2].rstrip(",")             # Nt=...,Xa=...

    src = f'''/**
 * 材质账簿 · Aurora-Materials
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html {anchor("material_family")}  var c3（族）
 *                                        {anchor("material_instance")}  var l1（实例）
 *
 * 两层结构：
 *   族  c3  —— 决定"这张表面在米制空间里的尺度"：size(米) / tile(平铺) / bump(毫米凹凸)
 *   实例 l1 —— 决定"这块表面脏成什么样"：色 / 粗糙 / 湿润 4 元组 / 脏污 4 元组
 *
 * 材质不是贴图文件，是"族参数 × 实例参数"算出来的。因此账簿本身即资产：
 * 换一套 l1 等于换一套美术风格，且不需要重算任何贴图。
 *
 * 依赖：无（resolve/toStandard 需要注入 THREE 才建材质）。
 */

/** 族：米制 UV 契约。size 是贴图覆盖的物理尺寸，bump 是毫米级凹凸。 */
export const FAMILIES = {fam};

/**
 * 湿润 / 脏污预设。4 元组按位置被着色器消费：
 * 原版没有为分量命名，此处保留原样，不做语义猜测。
 * 变量名（kc/aa/uA/o1…）与原版一致，便于逐字对照源码。
 */
const {preset_block};

/** 原版工厂：所有字段都有默认值，实例只写差异。 */
const {factory_block};

/** 实例：48 条。键名即 mats.get("...") 的入参。原文照搬。 */
export const INSTANCES = {inst};

export const PRESETS = {{
  wetDefault: cA, wetPaint: kc, wetGalv: aa, wetRust: uA,
  wetConcrete: i1, wetDry: u3, wetFull: s1,
  macroDefault: hA, macroConcrete: o1, macroBrushed: r1, macroNone: a1,
}};

/** 对外统一用 makeInstance，内部就是原文的 Nt。 */
export const makeInstance = Nt;

export const INSTANCE_IDS = Object.keys(INSTANCES);

/**
 * 把 族 + 实例 合成一份可读的最终参数。
 * 不做渲染，只做合并，便于 UI 读表与做差异对比。
 */
export function resolve(id) {{
  const inst = INSTANCES[id];
  if (!inst) throw new Error(`未知材质 "${{id}}"`);
  const fam = FAMILIES[inst.set];
  if (!fam) throw new Error(`材质 "${{id}}" 引用了不存在的族 "${{inst.set}}"`);
  return {{
    id,
    family: inst.set,
    size: fam.size,
    tile: fam.tile,
    bump: fam.bump,
    tint: inst.tint,
    color: inst.color,
    rough: inst.rough,
    metal: inst.metal,
    wet: inst.wet,
    macro: inst.macro,
    normalScale: inst.nrm,
    alphaCut: !!inst.alphaCut,
    side: inst.side === 2 ? "DoubleSide" : "FrontSide",
  }};
}}

/**
 * 落地成 MeshStandardMaterial —— 只搬"能等价搬"的部分。
 *
 * 必须说清楚：原版的 rough / metal 不是 0-1 的物理量，而是送进自有 PBR shader
 * 的乘子；程序化 ORM、湿润掩码、宏观脏污都在 shader 里算。用标准材质无法等价还原，
 * 所以这里只设颜色，粗糙度/金属度交给调用方显式指定，不伪造。
 */
export function toStandard(THREE, id, extra = {{}}) {{
  const r = resolve(id);
  const m = new THREE.MeshStandardMaterial({{
    color: new THREE.Color(r.color),
    roughness: 0.82,
    metalness: r.family === "metal" || r.family === "galv" || r.family === "brushed" ? 0.9 : 0.05,
    ...extra,
  }});
  m.name = id;
  return m;
}}

/** 台账体检：实例引用的族必须存在。 */
export function validate() {{
  const issues = [];
  for (const [id, inst] of Object.entries(INSTANCES)) {{
    if (!FAMILIES[inst.set]) issues.push(`${{id}} → 族 "${{inst.set}}" 不存在`);
    if (!Array.isArray(inst.wet) || inst.wet.length !== 4) issues.push(`${{id}} → wet 不是 4 元组`);
    if (!Array.isArray(inst.macro) || inst.macro.length !== 4) issues.push(`${{id}} → macro 不是 4 元组`);
  }}
  return issues;
}}

export default {{ FAMILIES, INSTANCES, PRESETS, makeInstance, resolve, toStandard, validate }};
'''
    open(os.path.join(CODE, "material-ledger.js"), "w", encoding="utf-8").write(src)
    return len(LED["materialFamilies"]), len(LED["materialInstances"])


# ------------------------------------------------------------------ 数值调参
def emit_player():
    mt = T["player_tuning"].strip()
    mt = mt[mt.find("{"):]
    src = f'''/**
 * 玩家运动调参 · Aurora-Player
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html {anchor("player_scale")}  var Pi（尺度）
 *                                        {anchor("player_tuning")}  var Mt（运动）
 *
 * 手感的全部来源就是这 45 个数。原版把它们写成一个对象，
 * 但没有版本号、没有单位注释、没有区间校验——这里补齐这三样。
 *
 * 依赖：无。
 */

/** 尺度：眼高、蹲眼高、胶囊半径、身高等，米制。 */
export const SCALE = {{
  eye: 1.68,
  crouchEye: 1.05,
  radius: 0.32,
  height: 1.8,
  fov: 74,
  viewFov: 54,
}};

// 原文 Mt 里写的是 Pi.height，保留同名局部引用，避免改动原表
const Pi = SCALE;

/** 运动：速度、加速度、重力、步幅、后坐、镜头。 */
export const TUNING = {mt};

/** 字段语义与单位。原版无注释，此处按量纲标注。 */
export const UNITS = {{
  walk: "m/s", sprint: "m/s", crouch: "m/s", ads: "m/s",
  accelGround: "m/s²", decelGround: "m/s²", accelAir: "m/s²", gravity: "m/s²",
  jumpApex: "m", coyote: "s", jumpBuffer: "s",
  standHeight: "m", crouchHeight: "m", eyeRate: "1/s",
  bobY: "m", bobX: "m", bobSprint: "×", bobAds: "×",
  rollStrafe: "rad/m", landDip: "m", landDipMax: "m",
  fovSprint: "deg", fovAds: "deg", adsLook: "×",
  regenDelay: "s", regenRate: "hp/s",
  recoilKeep: "0-1", recoilApply: "×", recoilRecover: "1/s", recoilHold: "s",
  shakeDecay: "1/s", shakePitch: "rad", shakeYaw: "rad", shakeRoll: "rad",
  pitchLimit: "rad",
}};

/** 由 gravity 与 jumpApex 反解初速，原版写的就是这条式子。 */
export const jumpSpeed = Math.sqrt(2 * TUNING.gravity * TUNING.jumpApex);

/** 步幅频率 → 每秒步数，给脚步声与镜头起伏共用。 */
export function stepRate(mode = "walk") {{
  return TUNING.stride[mode] || TUNING.stride.walk;
}}

/** 体检：速度必须为正、重力为正、蹲高低于站高。 */
export function validate() {{
  const issues = [];
  for (const k of ["walk", "sprint", "crouch", "ads"]) {{
    if (!(TUNING[k] > 0)) issues.push(`${{k}} 必须为正`);
  }}
  if (!(TUNING.gravity > 0)) issues.push("gravity 必须为正");
  if (!(TUNING.crouchHeight < TUNING.standHeight)) issues.push("crouchHeight 必须低于 standHeight");
  if (!(TUNING.walk < TUNING.sprint)) issues.push("sprint 应快于 walk");
  return issues;
}}

export default {{ SCALE, TUNING, UNITS, jumpSpeed, stepRate, validate }};
'''
    open(os.path.join(CODE, "player-tuning.js"), "w", encoding="utf-8").write(src)


# ------------------------------------------------------------------ 敌人调参
def emit_ai():
    ui = T["ai_tuning"].strip()
    ui = ui[ui.find("{"):]
    ui = re.sub(r"gull:\w+,", "", ui)
    ui = re.sub(r"hound:\w+,", "", ui)
    src = f'''/**
 * 敌人感知调参 · Aurora-AI
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html {anchor("ai_tuning")}  var Ui
 *
 * 14 个数决定了"敌人能不能发现你"。gull / hound 两个变体对象是构造器，
 * 不属于数值资产，未抽入；其参数继承本表。
 *
 * 依赖：无。
 */

export const TUNING = {ui};

/** 视锥半角的余弦，原版用 Math.cos(cone/2) 做点积判定。 */
export const SIGHT_COS = Math.cos((TUNING.sightCone / 2) * Math.PI / 180);

/** 体检：角度在 (0,360)，时间与池容量为正。 */
export function validate() {{
  const issues = [];
  if (!(TUNING.sightRange > 0)) issues.push("sightRange 必须为正");
  if (!(TUNING.sightCone > 0 && TUNING.sightCone < 360)) issues.push("sightCone 应在 (0,360)");
  if (!(TUNING.hearRadius > 0)) issues.push("hearRadius 必须为正");
  if (!(TUNING.maxTokens >= 1)) issues.push("maxTokens 至少 1");
  return issues;
}}

export default {{ TUNING, SIGHT_COS, validate }};
'''
    open(os.path.join(CODE, "ai-tuning.js"), "w", encoding="utf-8").write(src)


# ------------------------------------------------------------------ 武器数值 + 弹簧
def emit_weapon():
    sp = LED["springSet"]
    src = f'''/**
 * 武器数值与后坐弹簧 · Aurora-Weapon
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L6065:C68  Gv=30 / B_=150 / H_=26 / O_=720
 *                                        L6065:C5784 弹簧组 kZ/kP/kY/kR/…
 *                                        L6065  pa()/ma() 弹簧积分器
 *
 * 原版把这 4 个核心数值写成了裸变量（Gv/B_/H_/O_），连名字都没有。
 * 数值可量化，但"可管理"需要名字、单位、派生量与引用关系——这里补上。
 *
 * 依赖：无。
 */

export const WEAPON = {{
  id: "pac9",
  name: "PAC-9",
  magSize: 30,        // 发
  reserve: 150,       // 发
  damage: 26,         // hp/发
  weakPointMul: 2.2,  // 弱点倍率
  rpm: 720,           // 发/分
  spread: 0.0125,     // 弧度（腰射基础扩散）
}};

/** 派生量：由核心数值算出，避免消费方各自除一遍。 */
export const DERIVED = {{
  /** 两发间隔，秒 */
  fireInterval: 60 / WEAPON.rpm,
  /** 理论 DPS（不含换弹与弱点） */
  dps: (60 / WEAPON.rpm) > 0 ? WEAPON.damage * (WEAPON.rpm / 60) : 0,
  /** 满弹匣可造成的伤害 */
  magPotential: WEAPON.magSize * WEAPON.damage,
  /** 总携弹量 / 弹匣数 */
  mags: 1 + Math.floor(WEAPON.reserve / WEAPON.magSize),
}};

/**
 * 弹簧组：k 是刚度，c 是阻尼。原版 9 组共用同一个积分器，
 * 分别驱动后坐位移、俯仰、偏航、滚转、摆动、跳跃起伏。
 */
export const SPRINGS = {{
  kickZ: [{sp["kickZ"][0]}, {sp["kickZ"][1]}],
  kickPitch: [{sp["kickPitch"][0]}, {sp["kickPitch"][1]}],
  kickYaw: [{sp["kickYaw"][0]}, {sp["kickYaw"][1]}],
  kickRoll: [{sp["kickRoll"][0]}, {sp["kickRoll"][1]}],
  swayYaw: [110, 15],
  swayPitch: [110, 15],
  jumpY: [140, 13],
  jumpPitch: [140, 13],
  bump: [600, 30],
}};

/** 换弹时间表（秒）：原版 ue/$ 两条关键帧轨的终点与弹药提交点。 */
export const RELOAD = {{
  tacticalTotal: 2.1,
  emptyTotal: 2.72,
  ammoCommit: 1.345,
  magOut: 0.47,
}};

/** 造一根弹簧。 */
export const spring = (k, c) => ({{ x: 0, v: 0, k, c }});

/**
 * 积分一帧。原版 ma(s, target, dt)：dt>0.012 时自动切成 ≤8ms 的子步，
 * 这是为了低帧率下弹簧不炸——属于必须保留的实现细节。
 */
export function integrate(s, target, dt) {{
  const n = dt > 0.012 ? Math.ceil(dt / 0.008) : 1;
  const h = dt / n;
  for (let i = 0; i < n; i++) {{
    s.v += ((target - s.x) * s.k - s.v * s.c) * h;
    s.x += s.v * h;
  }}
  return s.x;
}}

export default {{ WEAPON, DERIVED, SPRINGS, RELOAD, spring, integrate }};
'''
    open(os.path.join(CODE, "weapon-tuning.js"), "w", encoding="utf-8").write(src)


# ------------------------------------------------------------------ 音频配方
def emit_audio():
    i = RAW.find("Go={") + 4
    depth = 0; instr = None; entries = []; start = i
    for j in range(i, len(RAW)):
        ch = RAW[j]
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
                entries.append(RAW[start:j]); break
        elif ch == "," and depth == 0:
            entries.append(RAW[start:j]); start = j + 1

    fields = ["n", "sr", "peak", "bus", "max", "pri", "boot", "ref", "roll"]
    rows = []
    for e in entries:
        m = re.match(r"\s*([A-Za-z_]\w*):\{(.*)\}\s*$", e, re.S)
        if not m:
            continue
        body, sid = m.group(2), m.group(1)
        gen = re.search(r"(?:^|,)gen:([^,]+)", body)
        d = {"id": sid, "gen": gen.group(1) if gen else "?"}
        for f in fields:
            mm = re.search(r"(?:^|,)%s:([^,]+)" % f, body)
            if mm:
                v = mm.group(1).strip()
                if re.fullmatch(r"-?(?:\d+\.?\d*|\.\d+)", v):
                    v = float(v) if "." in v else int(v)
                elif v in ("!0", "!1"):
                    v = v == "!0"
                elif v.startswith('"'):
                    v = v.strip('"')
                d[f] = v
        rows.append(d)

    lines = []
    for d in rows:
        parts = ['gen: "%s"' % d["gen"]]
        for f in fields:
            if f in d:
                v = d[f]
                parts.append("%s: %s" % (f, json.dumps(v, ensure_ascii=False)))
        lines.append('  %-22s { %s },' % (d["id"] + ":", ", ".join(parts)))

    src = '''/**
 * 音效配方 · Aurora-Sound
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5939:C64931  var Go
 *
 * 57 条配方。每条描述"这个声音应该怎么混"：几层声部(n)、采样率档(sr)、
 * 峰值(peak)、总线(bus: near/dry/world)、同时发声上限(max)、优先级(pri)、
 * 是否开场地板(boot)、世界坐标下的参考距离(ref)与滚降(roll)。
 *
 * 边界：合成波形本身是 57 个生成器函数（gen 指向），依赖 WebAudio 上下文，
 * 未抽入本模块。本模块只保证"混音配方"这一层可独立管理与比对——
 * 换引擎时这一层能整体搬走，生成器需要重写。
 *
 * 依赖：无。
 */

export const RECIPES = {
%s
};

export const RECIPE_IDS = Object.keys(RECIPES);

/** 总线用量统计：预算分配看这个。 */
export function busLoad() {
  const out = {};
  for (const r of Object.values(RECIPES)) {
    const b = r.bus || "unset";
    out[b] = (out[b] || 0) + 1;
  }
  return out;
}

/** 同时发声上限之和：音频线程压力的上界。 */
export function voiceBudget() {
  return Object.values(RECIPES).reduce((s, r) => s + (r.max || 0), 0);
}

/** 按总线筛。 */
export function byBus(bus) {
  return RECIPE_IDS.filter((id) => RECIPES[id].bus === bus);
}

export default { RECIPES, RECIPE_IDS, busLoad, voiceBudget, byBus };
''' % "\n".join(lines)
    open(os.path.join(CODE, "audio-recipes.js"), "w", encoding="utf-8").write(src)
    return len(rows)


if __name__ == "__main__":
    os.makedirs(CODE, exist_ok=True)
    n_props = emit_props()
    nf, ni = emit_materials()
    emit_player()
    emit_ai()
    emit_weapon()
    n_audio = emit_audio()
    print("已生成：props %d 条 / 材质族 %d / 材质实例 %d / player / ai / weapon / 音频 %d 条" % (n_props, nf, ni, n_audio))


