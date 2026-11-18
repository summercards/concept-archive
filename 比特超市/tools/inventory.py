#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""盘点原工程里的全部可独立资产。

原则：
  1. 逐条，不聚合。一个材质族、一个材质实例、一个道具、一条音效都是独立资产。
  2. 能不遗漏：材质族 29 + 实例 48 + 贴花 22 + 道具 36 + 几何原语 7 +
     专用建模器 36 + 音效 57 + 后期 13 + 环境 8 + 数值 10 + 角色 3 + 武器 10。
  3. 每条都带源码锚点与参数，供页面展示与验证脚本对账。

输出 build/inventory.json
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jsparse  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html"
src = open(SRC, encoding="utf-8").read()
D = json.load(open(os.path.join(ROOT, "build", "tables.json"), encoding="utf-8"))
LED = D["ledger"]
JS = json.load(open(os.path.join(ROOT, "build", "jsdata.json"), encoding="utf-8"))
PROP_SOURCE = json.load(open(os.path.join(ROOT, "build", "props-source.json"), encoding="utf-8"))["extraction"]
PROP_STATUS = "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"


def anchor_at(off):
    line = src.count("\n", 0, off) + 1
    col = off - src.rfind("\n", 0, off)
    return "L%d:C%d" % (line, col)


def find_off(needle, start=0):
    i = src.find(needle, start)
    return i


def snippet(off, n=220):
    return src[off:off + n].replace("\n", " ").strip()


# ---------------------------------------------------------------- 名称表
FAMILY_NAME = {
    "asphalt": ("沥青", "颗粒 + 裂纹，码头场坪的底子"),
    "concrete": ("混凝土", "方仓缝 + 气孔 + 泛碱"),
    "brick": ("砖墙", "错缝砌法，灰浆凹槽更深"),
    "epoxy": ("环氧地坪", "近乎镜面，靠划痕与色差破掉单调"),
    "paint": ("油漆", "掉漆边缘露出底漆，最常用的一族"),
    "hull": ("船壳漆", "厚涂 + 大量竖向锈蚀挂流"),
    "galv": ("镀锌钢", "锌花结晶，冷灰带蓝"),
    "metal": ("裸金属", "拉丝方向随机，斑驳氧化"),
    "brushed": ("拉丝金属", "单向拉丝，高光被拉成一条"),
    "rust": ("锈蚀", "锈层起皮，底下透出蓝灰底漆"),
    "diamond": ("花纹钢板", "菱形凸起，工业平台标配"),
    "corrugated": ("瓦楞板", "正弦波峰谷，边缘常带锈"),
    "chainlink": ("铁丝网", "菱形网格，alpha 镂空"),
    "hazard": ("警示条纹", "黄黑斜条，边缘磨损"),
    "gunmetal": ("枪金属", "深灰发蓝，细密磨痕"),
    "anodized": ("阳极氧化", "黑色微磨砂，边缘掉色露银"),
    "polymer": ("工程塑料", "模具分型线 + 细皮纹"),
    "carbon": ("碳纤维", "斜纹编织，清漆下可见"),
    "fabric": ("织物", "经纬交织，法线强"),
    "armor": ("装甲漆", "厚漆 + 划痕，军事风"),
    "wood": ("木材", "年轮 + 直纹两套，钉孔"),
    "plastic": ("塑料件", "纯色，轻微流痕"),
    "tarp": ("篷布", "褶皱 + 补丁，织物高光"),
    "cardboard": ("纸板", "瓦楞截面 + 折痕"),
    "rope": ("绳索", "捻向明显，纤维毛刺"),
    "tire": ("橡胶", "胎面花纹 + 磨损"),
    "glass": ("玻璃", "透射，表面灰尘与指印"),
    "glass_dirty": ("脏玻璃", "更重的灰尘与水痕"),
    "water": ("水面", "法线波纹，反射天空"),
}
INST_NAME = {
    "asphalt": ("沥青场坪", "wet 拉高，雨后反光"),
    "concrete": ("清水混凝土", "默认状态"),
    "concrete_dirty": ("脏混凝土", "污渍更重，色偏暖"),
    "concrete_painted": ("涂装混凝土", "刷了灰绿漆，局部剥落"),
    "brick": ("红砖", "默认状态"),
    "floor_epoxy": ("仓库环氧地坪", "极湿，几乎镜面"),
    "paint_red": ("红漆", "集装箱红"),
    "paint_blue": ("蓝漆", "集装箱蓝"),
    "paint_green": ("绿漆", "军绿"),
    "paint_yellow": ("黄漆", "设备黄"),
    "paint_orange": ("橙漆", "工程机械橙"),
    "paint_white": ("白漆", "标识白"),
    "paint_grey": ("灰漆", "中性灰"),
    "paint_teal": ("青漆", "偏冷的青绿"),
    "steel_galv": ("镀锌钢", "镀锌件默认"),
    "steel_dark": ("深色钢", "结构件"),
    "steel_worn": ("磨损钢", "棱角磨亮"),
    "steel_bare": ("裸钢", "未涂装"),
    "steel_rust": ("锈钢", "重度锈蚀"),
    "diamond_plate": ("花纹钢板", "平台踏板"),
    "corrugated_roof": ("瓦楞屋面板", "顶棚"),
    "chainlink": ("铁丝网", "围栏"),
    "aluminium": ("铝", "轻金属，冷白"),
    "brass": ("黄铜", "暖金，氧化发暗"),
    "hazard_stripes": ("警示条纹", "黄黑斜条"),
    "gunmetal": ("枪金属", "枪身主体"),
    "anodized_black": ("黑色阳极氧化", "配件"),
    "polymer_black": ("黑色塑料", "握把"),
    "polymer_tan": ("沙色塑料", "护木"),
    "rubber": ("橡胶", "护圈 / 垫"),
    "carbon": ("碳纤维", "轻量件"),
    "glove_fabric": ("手套织物", "手部"),
    "armor_white": ("白色装甲", "无人机外壳"),
    "armor_orange": ("橙色装甲", "警示涂装"),
    "wood_pallet": ("托盘木", "托盘"),
    "wood_dark": ("深色木", "浸水发黑"),
    "plastic_blue": ("蓝塑料", "筐 / 桶"),
    "plastic_red": ("红塑料", "警示件"),
    "plastic_grey": ("灰塑料", "通用件"),
    "tarp": ("篷布", "货物苫盖"),
    "cardboard": ("纸板", "纸箱"),
    "rope": ("绳索", "系泊"),
    "tire": ("轮胎", "堆场"),
    "glass": ("玻璃", "窗 / 灯罩"),
    "glass_dirty": ("脏玻璃", "久未清洁"),
    "hull_paint": ("船壳漆", "白蓝涂装"),
    "hull_red": ("船底红漆", "防污漆"),
    "water_dark": ("深水", "港池水面"),
}
PROP_NAME = {
    "container20": ("20 尺集装箱", "6.06×2.59×2.44 m，最基础的可堆叠单元"),
    "container40": ("40 尺集装箱", "12.19 m 长，码头主视觉"),
    "container40hc": ("40 尺高柜", "原版实体波纹、角件与双门构造；登记高度 2.90 m"),
    "jersey_barrier": ("混凝土隔离墩", "新泽西护栏，带吊装孔"),
    "light_mast": ("高杆灯", "14 m，带灯盘与爬梯"),
    "fence_panel": ("围栏片", "铁丝网 + 方管边框"),
    "guard_booth": ("岗亭", "带窗与雨檐"),
    "gate_arm": ("道闸杆", "红白相间，可抬起"),
    "bollard_mooring": ("系缆柱", "铸铁，带缆绳磨损"),
    "bollard_post": ("警示柱", "路侧矮柱"),
    "relay_node": ("中继节点", "任务目标物，带指示灯"),
    "shelf_rack": ("货架", "仓储层架"),
    "stairs_metal": ("钢楼梯", "带扶手踏步"),
    "catwalk": ("检修走道", "花纹板 + 栏杆"),
    "reefer_unit": ("冷机", "集装箱端部制冷机组"),
    "barrel": ("油桶", "0.6×0.9 m，带箍"),
    "pallet": ("托盘", "1.2×1.0 m 标准托盘"),
    "pallet_stack": ("托盘堆", "叠放若干"),
    "crate_wood": ("木箱", "板条箱，带钉"),
    "crate_stack": ("木箱堆", "两层错缝"),
    "ibc_tote": ("吨桶", "带金属框的 IBC"),
    "forklift": ("叉车", "带门架与货叉"),
    "cable_reel": ("电缆盘", "巨型木盘"),
    "tire_stack": ("轮胎堆", "交错叠放"),
    "dumpster": ("垃圾箱", "带盖与吊耳"),
    "generator": ("发电机", "带排气与油箱"),
    "jerry_can": ("油壶", "20 L 军用桶"),
    "traffic_cone": ("锥筒", "反光带 + 底座"),
    "gas_cylinders": ("气瓶组", "带护罩与链"),
    "tarp_cargo": ("苫布货堆", "篷布下的不定形货物"),
    "sandbags": ("沙袋", "堆叠成掩体"),
    "toolbox_cart": ("工具车", "带抽屉与轮"),
    "floodlight_stand": ("移动泛光灯", "三脚架 + 灯头"),
    "cardboard_boxes": ("纸箱堆", "轻货"),
    "pipe_stack": ("管材堆", "分层垫木"),
    "sign_post": ("标志牌", "杆 + 牌面"),
}
SFX_NAME = {
    "rifle_shot": ("步枪射击", "近场合成主体；n 表示生成变体数"),
    "rifle_tail_out": ("枪声尾音·室外", "带混响尾巴"),
    "rifle_tail_in": ("枪声尾音·室内", "短尾，反射密"),
    "rifle_dry": ("空仓扳机", "金属轻响"),
    "reload_magout": ("卸弹匣", "塑料摩擦 + 卡榫"),
    "reload_magin": ("上弹匣", "插入到底的一声"),
    "reload_bolt": ("拉枪机", "两段金属"),
    "shell_bounce": ("弹壳落地", "随机音高"),
    "step_concrete": ("脚步·混凝土", "按步频触发"),
    "step_water": ("脚步·积水", "带水花"),
    "step_metal": ("脚步·金属", "花纹板"),
    "land": ("落地", "重着陆"),
    "jump": ("起跳", "布料 + 呼气"),
    "hurt": ("受伤", "低频冲击 + 耳鸣前兆"),
    "ear_ring": ("耳鸣", "高频正弦衰减"),
    "impact_metal": ("命中金属", "弹着点"),
    "impact_concrete": ("命中混凝土", "碎屑"),
    "impact_wood": ("命中木材", "闷响"),
    "impact_water": ("命中水面", "水柱"),
    "impact_enemy": ("命中敌人", "机械反馈"),
    "impact_glass": ("命中玻璃", "碎裂"),
    "whiz": ("掠弹", "多普勒掠过"),
    "ricochet": ("跳弹", "带哨音"),
    "gull_fire": ("无人机射击", "电调 + 放电"),
    "hound_fire": ("猎犬射击", "霰弹"),
    "hound_step": ("猎犬脚步", "液压"),
    "gull_die": ("无人机坠毁", "旋翼失速"),
    "hound_die": ("猎犬停机", "伺服断电"),
    "telegraph": ("攻击预警", "给玩家的提示音"),
    "alert": ("警戒", "发现玩家"),
    "explosion": ("爆炸", "低频 + 碎片"),
    "relay_cut": ("中继切断", "电流骤停"),
    "thunder": ("雷声", "远场"),
    "foghorn": ("雾笛", "港口标志音"),
    "gull_cry": ("海鸥", "环境点缀"),
    "halyard": ("缆绳敲桅杆", "风里的金属叮当"),
    "container_bang": ("集装箱闷响", "远处堆放"),
    "ui_click": ("UI 点击", ""),
    "ui_hover": ("UI 悬停", ""),
    "objective": ("目标更新", ""),
    "objective_all": ("目标全清", ""),
    "complete": ("任务完成", ""),
    "death": ("死亡", ""),
    "gull_rotor": ("无人机旋翼", "循环层"),
    "hound_servo": ("猎犬伺服", "循环层"),
    "relay_hum": ("中继嗡鸣", "循环层"),
    "rain": ("雨声", "室外循环"),
    "rain_interior": ("雨声·室内", "隔一层屋顶"),
    "wind": ("风", "循环"),
    "sea": ("海浪", "循环"),
    "music_drone": ("配乐·低音铺底", "循环"),
    "music_ost": ("配乐·主题", ""),
    "music_perc": ("配乐·打击", ""),
    "music_brass": ("配乐·铜管", ""),
    "music_motif": ("配乐·动机", ""),
    "ir_outdoor": ("混响·室外", "卷积脉冲"),
    "ir_shed": ("混响·棚内", "卷积脉冲"),
}
DECAL_NAME = {
    "hazard_flammable": ("易燃品标识", "火焰图形 + 编号，256²"),
    "hazard_voltage": ("高压标识", "闪电 + 黄底"),
    "hazard_general": ("通用警示", "感叹号菱形"),
    "arrow": ("导向箭头", "场地导视"),
    "no_entry": ("禁止进入", "红圈斜杠"),
    "logo_a": ("港务 Logo A", "圆形徽标"),
    "logo_b": ("港务 Logo B", "方形徽标"),
    "logo_c": ("港务 Logo C", "字标"),
    "logo_d": ("港务 Logo D", "变体"),
    "numbers_0_9": ("数字条 0–9", "编号喷涂用"),
    "caution_stripes": ("警示斜条", "黄黑"),
    "csc_plate": ("CSC 铭牌", "集装箱安全铭牌"),
    "graffiti_tag": ("涂鸦签名", "随机笔迹"),
    "grime_streak": ("污渍挂流", "竖向脏痕"),
    "leak_stain": ("渗漏渍", "边缘深中间浅"),
    "oil_stain": ("油渍", "虹彩反光"),
    "rust_run": ("锈水痕", "从螺栓往下流"),
    "scorch": ("烧灼痕", "烟熏放射"),
    "bullet_concrete": ("弹孔·混凝土", "崩边 + 粉化"),
    "bullet_metal": ("弹孔·金属", "翻边 + 亮圈"),
    "crack": ("裂纹", "分叉走向"),
    "floor": ("地面标记", "分区线"),
}
GEO_NAME = {
    "metricBox": ("米制倒角盒", "全工程 90% 的方块都由它生成；倒角随尺寸夹紧，可选底锚"),
    "bevelBox": ("倒角箱", "斜切边 + 独立倒角宽度，用于护栏座一类"),
    "cylinder": ("米制圆柱", "半径/高按米，v 轴被原版补丁成米制"),
    "tube": ("样条管", "给定折线 + 半径，Catmull-Rom 插值"),
    "place": ("摆放", "把几何按位移 / 欧拉角写进顶点，便于静态合批"),
    "vertexColor": ("顶点着色", "按回调给每个顶点写入颜色"),
    "merge": ("几何合并", "带索引偏移的合并，材质分桶后合批"),
}
FX_ITEMS = [
    ("fx.bloom", "Bloom 泛光", "亮部提取 → 三级可分离模糊 → 叠加", ["uBloom", "阈值 1.0", "半径 3 级"]),
    ("fx.streak", "横向拉丝", "anamorphic 横向拉伸，光源被拉成一条", ["tStreak", "uStreak", "横向 1 次"]),
    ("fx.dirt", "镜头脏污", "屏幕空间脏污贴图，叠在合成最后", ["tDirt", "uDirt"]),
    ("fx.flare", "眩光", "按太阳屏幕位置生成的光斑链", ["uFlare", "太阳位置驱动"]),
    ("fx.ca", "色散", "RGB 三通道按半径错位", ["uCA", "边缘最强"]),
    ("fx.vignette", "暗角", "边缘压暗，配合曝光", ["uVignette"]),
    ("fx.agx", "AgX 色彩映射", "与 ACES 混合，避免高光死白", ["uAgxMix", "renderer 用 NoToneMapping"]),
    ("fx.adapt", "曝光自适应", "按场景亮度缓慢跟随，模拟眼睛", ["tAdapt", "0.6 × e × (1−fade)"]),
    ("fx.motion", "运动模糊", "深度重投影，按相机速度", ["depthHalf", "motion"]),
    ("fx.vol", "体积光", "沿视线步进的单次散射", ["uVolSteps", "volSunScale / volSigma"]),
    ("fx.ao", "屏幕空间 AO", "深度重建法线后做半球采样", ["aoA", "aoB"]),
    ("fx.planar", "平面反射", "湿地面的镜像 pass，半分辨率", ["reflectionTarget", "uReflLod"]),
    ("fx.rain", "雨", "GPU 雨丝 + 地面涟漪", ["uRain", "quality.rain 控制密度"]),
]
ENV_ITEMS = [
    ("env.world", "世界尺度", "岸线 X=30、海面 Y=−1.6、场地 80×60 m"),
    ("env.sun", "太阳", "方向 (0.916,0.225,0.331)，色 (1,.72,.42)，强度 9"),
    ("env.sky", "天空四色", "天顶 / 地平 / 背光侧 / 雾色"),
    ("env.fog", "体积雾", "6 个散射参数，太阳方向驱动"),
    ("env.shadow", "阴影正交框", "按太阳方向自动收拢，bias −1.2e−4"),
    ("env.lamps", "灯池预算", "同时点亮的灯上限，超出按距离剔除"),
    ("env.exposure", "曝光曲线", "0.6 × 曝光 × (1−衰减)"),
    ("env.probe", "环境探针", "天空与室内各烘一张 PMREM"),
]
NUM_ITEMS = [
    ("num.player", "玩家运动调参", "39 字段：速度、加速度、跳跃、下蹲、视角"),
    ("num.move", "移动手感", "36 字段：地面/空中加速、摩擦、台阶"),
    ("num.ai", "敌人感知", "16 字段：视野、听觉、丢失、搜索"),
    ("num.weapon", "武器数值", "18 字段：弹匣、伤害、射速、扩散"),
    ("num.waves", "波次节奏", "15 字段：开场、间隔、同屏上限"),
    ("num.input", "按键映射", "27 个动作绑定"),
]
ACTOR_ITEMS = [
    ("actor.gull", "Gull 无人机", "敌人 Zv：19 字段，血量、点射、预警、冷却", "敌人"),
    ("actor.hound", "Hound 猎犬", "敌人 Zv：21 字段，血量、霰弹、追击、绕后", "敌人"),
    ("actor.player", "玩家", "不在敌人表里，来自 Kv 玩家调参：身高 1.8 m，含蹲/站/冲刺三套速度", "玩家"),
]
WEAPON_ITEMS = [
    ("weapon.pac9", "PAC9 步枪", "30 发弹匣，720 RPM，26 伤害"),
]
SPRING_NAME = {
    "kickZ": "后坐 · 前后", "kickPitch": "后坐 · 俯仰", "kickYaw": "后坐 · 偏航",
    "kickRoll": "后坐 · 翻滚", "swayYaw": "挥动 · 偏航", "swayPitch": "挥动 · 俯仰",
    "jumpY": "落跳 · 纵向", "jumpPitch": "落跳 · 俯仰", "bump": "碰撞 · 抖动",
}
SPRING_ITEMS = [("spring." + k, SPRING_NAME.get(k, k), v) for k, v in JS["springs"].items()]

items = []


def add(**kw):
    kw.setdefault("tags", [])
    items.append(kw)


# ---------------------------------------------------------------- 材质族
for fid, fam in JS["fam"].items():
    nm, desc = FAMILY_NAME.get(fid, (fid, ""))
    off = find_off('"%s":{fn:"%s"' % (fid, fam.get("fn", fid)), 0)
    if off < 0:
        off = find_off("Tn.%s=" % fam.get("fn", fid), 0)
    add(id="matf." + fid, cat="MAT", sub="材质族", name=nm, en=fid,
        kind="sphere", focus={"fam": fid},
        params=[["shader", fam.get("fn", fid), "对应 GLSL 族函数"],
                ["尺寸", fam.get("size"), "贴图覆盖的米数"],
                ["tile", fam.get("tile"), "重复周期（米）"],
                ["bump", fam.get("bump"), "凹凸强度（毫米）"],
                ["hero", fam.get("hero", False), "是否主视觉材质"]],
        summary=desc or ("%s 族，由 GLSL 现烘" % fid),
        anchor=anchor_at(off if off >= 0 else 0),
        code=snippet(off if off >= 0 else 0, 180),
        tags=["材质", "GLSL", "程序化"])

# ---------------------------------------------------------------- 材质实例
for iid, it in JS["inst"].items():
    nm, desc = INST_NAME.get(iid, (iid, ""))
    fam = it.get("set", "")
    off = find_off(iid + ":", 0)
    add(id="mat." + iid, cat="MAT", sub="材质实例", name=nm, en=iid,
        kind="sphere", focus={"inst": iid},
        params=[["族", fam, "继承的材质族"],
                ["颜色", "#%06X" % it.get("color", 0), "基色（乘在贴图上）"],
                ["粗糙", it.get("rough", 1), "乘子"],
                ["金属", it.get("metal", 1), "乘子"],
                ["湿润", " / ".join("%.2f" % x for x in it.get("wet", [])), "水膜 / 低洼 / 朝向 / 高度"],
                ["脏污", " / ".join("%.2f" % x for x in it.get("macro", [])), "强度 / 尺度 / 阈值 / 对比"],
                ["法线", it.get("nrm", 1), "凹凸乘子"]],
        summary=desc or ("%s 实例" % iid),
        anchor=anchor_at(off if off >= 0 else 0),
        code=snippet(off if off >= 0 else 0, 160),
        tags=["材质", "实例"])

# ---------------------------------------------------------------- 贴花
dec_off = find_off("hazard_flammable")
dec_start = src.rfind("={", 0, dec_off) + 1
dec_keys = []
i = dec_start + 1
while i < len(src):
    m = re.compile(r'([\w$]+):\(\)=>r\("').match(src, i)
    if not m:
        # 跳到下一个逗号后的 key
        nxt = src.find(",", i)
        if nxt < 0 or nxt > dec_start + 13000:
            break
        i = nxt + 1
        continue
    dec_keys.append(m.group(1))
    i = m.end()
for k in dec_keys:
    nm, desc = DECAL_NAME.get(k, (k, ""))
    pos = find_off('"%s",256,256' % k, 0)
    if pos < 0:
        pos = find_off(k + ":", 0)
    add(id="decal." + k, cat="DECAL", sub="贴花", name=nm, en=k,
        kind="decal", focus={"decal": k},
        params=[["画布", "256 × 256", "构建时绘制的 canvas 纹理"],
                ["方式", "canvas 2D", "函数体在原工程 mats 模块"]],
        summary=desc or "canvas 2D 绘制的贴花",
        anchor=anchor_at(pos if pos >= 0 else dec_start),
        code=snippet(pos if pos >= 0 else dec_start, 200),
        tags=["贴花", "canvas"])

# ---------------------------------------------------------------- 道具
BUILDER_BY_ID = {b["id"]: b for b in LED.get("propBuilders", [])}


def builder_source(pid):
    entry = PROP_SOURCE["props"][pid]
    fragment = PROP_SOURCE["fragments"][entry["builder"]]
    off = fragment["sourceCodePointOffset"]
    end = fragment["sourceCodePointEnd"]
    return entry, off, src[off:min(end, off + 360)]


def builder_params(entry):
    return [["真实回调链", entry["entryCallback"], "原版注册回调；来自 build/props-source.json"],
            ["innerBuilders", " → ".join(entry["innerBuilders"]), "真实内部构造入口"],
            ["optionKeys", " / ".join(entry["optionKeys"]) or "未写", "源码实际消费的选项，不猜默认值"],
            ["预览状态", "已接入真实建模器", PROP_STATUS]]


for p in LED["props"]:
    pid = p["id"]
    nm, desc = PROP_NAME.get(pid, (pid, ""))
    entry, off, source_text = builder_source(pid)
    builder = BUILDER_BY_ID[pid]
    builder_name = builder["callback"]
    container = builder["group"] == "container-loop"
    container_color = {"container20": "red", "container40": "blue", "container40hc": "green"}.get(pid)
    preview_focus = {"prop": pid, "builder": builder_name,
                     "preview": "oneContainer" if container else "oneProp",
                     "integrated": True, "sourceStatus": "已接入真实建模器"}
    if container:
        preview_focus.update({"seed": 0, "doors": 0, "wear": 0.5, "color": container_color})
    summary = (desc or pid) + "；" + PROP_STATUS
    add(id="prop." + pid, cat="MODEL", sub="道具", name=nm, en=pid,
        kind="prop", focus=preview_focus,
        params=[["尺寸", " × ".join("%.2f" % x for x in p["size"]) + " m", "宽 × 高 × 深"],
                ["材质", p["material"], "指向材质实例"],
                ["表面", p["surface"], "脚步/弹着音采样类型"],
                ["建模器", builder_name, "源码回调"],
                ["注册组", builder["group"], "原版注册入口"],
                ["分派", "oneContainer" if container else "oneProp → buildProp", "容器保留原分派，其余调用真实 buildProp"]] + builder_params(entry) + ([
                    ["focus", "seed=0 / doors=0 / wear=0.5 / color=" + container_color, "容器默认预览参数"],
                    ["真实波纹侧", "P=.278 / d=.036", "Uo；来自 M3/zA"],
                    ["真实波纹顶", "P=.209 / d=.020", "x1；来自 M3/zA"],
                    ["真实波纹端", "P=.250 / d=.042", "y1；来自 M3/zA"],
                    ["源码函数", "M3 / zA", builder.get("sourceAnchors", {}).__str__()],
                ] if container else []),
        summary=summary,
        anchor=anchor_at(off if off >= 0 else 0),
        code=source_text,
        tags=["道具", "模型", "米制", "原版专用建模器", "真实几何已接入"])

# ---------------------------------------------------------------- 几何原语
KIT_FN = {
    "metricBox": ("米制倒角盒", "p3"),
    "bevelBox": ("倒角箱", "Wi"),
    "cylinder": ("米制圆柱", "ot"),
    "tube": ("样条管", "Fn"),
    "place": ("摆放", "je"),
    "vertexColor": ("顶点着色", "Lc"),
    "merge": ("几何合并", "Ii"),
}
for fn, (nm, orig) in KIT_FN.items():
    off = find_off("function %s(" % orig, 0)
    if off < 0:
        off = find_off("%s=(" % orig, 0)
    add(id="geo." + fn, cat="MODEL", sub="几何原语", name=nm, en=fn,
        kind="geo", focus={"geo": fn},
        params=[["原名", orig, "原工程里的短名"],
                ["依赖", "THREE.BufferGeometry", "返回带 position/normal/uv 的几何"]],
        summary="；".join(GEO_NAME.get(fn, ("", ""))),
        anchor=anchor_at(off if off >= 0 else 0),
        code=snippet(off if off >= 0 else 0, 220),
        tags=["几何", "纯函数"])

# ---------------------------------------------------------------- 专用建模器
for builder in LED.get("propBuilders", []):
    pid = builder["id"]
    nm, desc = PROP_NAME.get(pid, (pid, ""))
    entry, off, source_text = builder_source(pid)
    summary = "%s 的原版专用几何构造函数；%s" % (nm, PROP_STATUS)
    container = builder["group"] == "container-loop"
    container_color = {"container20": "red", "container40": "blue", "container40hc": "green"}.get(pid)
    preview_focus = {"prop": pid, "builder": builder["callback"],
                     "preview": "oneContainer" if container else "oneProp",
                     "integrated": True, "sourceStatus": "已接入真实建模器"}
    if container:
        preview_focus.update({"seed": 0, "doors": 0, "wear": 0.5, "color": container_color})
    add(id="build." + pid, cat="MODEL", sub="专用建模器", name=nm + "（建模器）", en=pid,
        kind="prop", focus=preview_focus,
        params=[["产出", pid, "该建模器只服务这一个道具"],
                ["回调", builder["callback"], "原版源码回调"],
                ["注册组", builder["group"], "原版注册入口"],
                ["注册锚点", builder["registrationAnchor"], "原版注册源码锚点"],
                ["函数锚点", anchor_at(off), "原版回调函数源码锚点"],
                ["注册原文", entry["registration"], "保留原引用，源码面板展示真实函数入口"]] + builder_params(entry),
        summary=summary,
        anchor=anchor_at(off),
        code=source_text,
        tags=["建模器", "几何", "源码追溯", "真实几何已接入"])

# ---------------------------------------------------------------- 音效
Go, go_off, _ = jsparse.parse_var(src, "Go")
for k, v in Go.items():
    nm, desc = SFX_NAME.get(k, (k, ""))
    off = find_off(k + ":{gen:", 0)
    n = v.get("n", "未写")
    sr = v.get("sr", "未写")
    if isinstance(sr, dict) and "$ref" in sr:
        ref = sr["$ref"]
        constant = re.search(r"(?:var\s+|[,;])" + re.escape(ref) + r"=(\d+)(?=[,;])", src)
        sr = int(constant.group(1)) if constant else "源码引用 %s；默认未写" % ref
    add(id="sfx." + k, cat="SFX", sub="音效", name=nm, en=k,
        kind="sfx", focus={"sfx": k},
        params=[["总线", v.get("bus", "未写"), "near / dry / world / music；未写不猜默认值"],
                ["生成变体数", n, "生成的声音变体数量，不是叠加层数"],
                ["采样率", sr, "Hz；只解析源码显式常量"],
                ["峰值", v.get("peak", "未写"), "0–1；未写不猜默认值"],
                ["同时发声", v.get("max", "未写"), "该音效的并发上限"],
                ["优先级", v.get("pri", "未写"), "抢占用"],
                ["参考距离", v.get("ref", "未写"), "米（3D 衰减）；未写不能据此推断为 2D"],
                ["滚降", v.get("roll", "未写"), "衰减曲线；未写不猜默认值"]],
        summary=desc or ("%s，合成配方一行" % k),
        anchor=anchor_at(off if off >= 0 else go_off),
        code=snippet(off if off >= 0 else go_off, 200),
        tags=["音效", "合成", "配方"])

# ---------------------------------------------------------------- 后期 / 特效
for fid, nm, desc, plist in FX_ITEMS:
    off = find_off(plist[0], 0)
    add(id=fid, cat="FX", sub="后期", name=nm, en=fid.split(".")[1],
        kind="fx", focus={"fx": fid.split(".")[1]},
        params=[["关键量", p, ""] for p in plist],
        summary=desc,
        anchor=anchor_at(off if off >= 0 else 0),
        code=snippet(off if off >= 0 else 0, 200),
        tags=["后期", "shader"])

# ---------------------------------------------------------------- 环境
for fid, nm, desc in ENV_ITEMS:
    add(id=fid, cat="ENV", sub="环境", name=nm, en=fid.split(".")[1],
        kind="env", focus={"env": fid.split(".")[1]},
        params=[["来源", "env-atmosphere", "数值表"]],
        summary=desc,
        anchor="L1:C1", code="", tags=["环境", "数值"])

# ---------------------------------------------------------------- 数值
for fid, nm, desc in NUM_ITEMS:
    add(id=fid, cat="NUM", sub="数值", name=nm, en=fid.split(".")[1],
        kind="chart", focus={"num": fid.split(".")[1]},
        params=[], summary=desc, anchor="L1:C1", code="", tags=["数值", "调参"])

# ---------------------------------------------------------------- 角色 / 武器 / 弹簧
for fid, nm, desc, sub in ACTOR_ITEMS:
    add(id=fid, cat="ACTOR", sub=sub, name=nm, en=fid.split(".")[1],
        kind="actor", focus={"actor": fid.split(".")[1]},
        params=[], summary=desc, anchor="L1:C1", code="", tags=["角色", "AI"])

weapon_off = find_off("async function dm(")
weapon_info, weapon_info_off, _ = jsparse.parse_var(src, "mi")
for fid, nm, desc in WEAPON_ITEMS:
    add(id=fid, cat="WEAPON", sub="武器", name=nm, en=fid.split(".")[1],
        kind="weapon", focus={"weapon": fid.split(".")[1]},
        params=[["弹匣", JS["weapon"].get("magSize"), "发"],
                ["备弹", JS["weapon"].get("reserve"), "发"],
                ["伤害", JS["weapon"].get("damage"), "每发"],
                ["弱点倍率", JS["weapon"].get("weakPointMul"), "命中弱点"],
                ["射速", JS["weapon"].get("rpm"), "RPM"],
                ["扩散", JS["weapon"].get("spread"), "弧度"],
                ["DPS", JS["weapon"].get("damage", 0) * JS["weapon"].get("rpm", 0) // 60, "派生"],
                ["真实入口", "dm", anchor_at(weapon_off)],
                ["模型常量", "mi", anchor_at(weapon_info_off)],
                ["枪口", weapon_info["muzzle"], "mi.muzzle；原版模型常量"]],
        summary=desc, anchor=anchor_at(weapon_off), code=snippet(weapon_off, 360), tags=["武器", "数值"])

# 源码里 9 组弹簧写成 kZ:pa(520,30) 这样的短名，全文件正好 9 处、顺序与导出表一致。
# 用它给每根弹簧补上真实代码片段与行号锚点，而不是留 L1:C1 占位。
SPRING_SRC = [(m.group(1), int(m.group(2)), int(m.group(3)), m.start())
              for m in re.finditer(r"([A-Za-z_$][\w$]*):pa\((\d+),(\d+)\)", src)]

for i, (fid, nm, kc) in enumerate(SPRING_ITEMS):
    sk, sk_k, sk_c, off = SPRING_SRC[i]
    if (sk_k, sk_c) != (kc[0], kc[1]):
        raise SystemExit("弹簧 %s 对不上源码第 %d 处 %s:pa(%d,%d)" % (fid, i, sk, sk_k, sk_c))
    add(id=fid, cat="WEAPON", sub="弹簧", name=nm, en=fid.split(".")[1],
        kind="spring", focus={"spring": fid.split(".")[1], "i": i},
        params=[["刚度 k", kc[0], "恢复力系数"], ["阻尼 c", kc[1], "衰减系数"],
                ["稳态", "%.3f" % (1.0), "阶跃输入下的终值"]],
        summary="%s。九根弹簧共用一个积分器，dt > 12ms 时自动切子步。" % nm,
        anchor=anchor_at(off),
        code="%s:pa(%d,%d)" % (sk, sk_k, sk_c), tags=["动画", "弹簧"])


# ---------------------------------------------------------------- 场景层
SCENE_ITEMS = [
    ("scene.level", "关卡布局", "在 80×60 m 场地上按台帐摆集装箱、货架、灯光与任务点；含中继节点与巡逻点。"),
    ("scene.backdrop", "远景", "港区外的门机、货船、小艇、天际线与海鸥群，纯程序化生成。"),
    ("scene.ground", "地面与海面", "码头面、岸线、水面、雨与积水反射；planar 反射在这里落地。"),
]
for fid, nm, desc in SCENE_ITEMS:
    add(id=fid, cat="SCENE", sub="场景层", name=nm, en=fid.split(".")[1],
        kind="env", focus={"scene": fid.split(".")[1]},
        params=[["规模", "80 × 60 m", "场地边界"], ["生成方式", "程序化", "无外部模型"]],
        summary=desc, anchor="L1:C1", code="", tags=["场景", "程序化"])

# ---------------------------------------------------------------- 画质预设
for name in ["test", "low", "medium", "high", "ultra"]:
    add(id="q." + name, cat="NUM", sub="画质预设", name=name.upper(), en=name,
        kind="quality", focus={"q": name},
        params=[], summary="%s 档：分辨率缩放 / MSAA / 阴影 / 贴图 / 体积光步数 / AO / 平面反射 / Bloom。" % name,
        anchor="L1:C1", code="", tags=["画质", "预设"])


# ---------------------------------------------------------------- 补锚点
ANCHOR_KEY = {
    "weapon.pac9": "async function dm(",
    "actor.gull": "boltDamage:",
    "actor.hound": "shotDamage:",
    "actor.player": "standHeight:",
    "env.world": "quayX:",
    "env.sun": "intensity:9",
    "env.sky": "horizonAway",
    "env.fog": "volSigma",
    "env.shadow": "normalBias",
    "env.lamps": "lightPool",
    "env.exposure": "slExposure(){",
    "env.probe": "PMREMGenerator",
    "num.player": "accelGround:",
    "num.move": "decelGround:",
    "num.ai": "sightRange:",
    "num.weapon": "magSize:Gv,reserve:B_",
    "num.waves": "spawnStagger:",
    "num.input": "KeyW:",
    "scene.level": "level-static",
    "scene.backdrop": '"backdrop"',
    "scene.ground": "apron_wet",
    "fx.agx": "uAgxMix",
}
for it in items:
    if it["anchor"] != "L1:C1":
        continue
    key = ANCHOR_KEY.get(it["id"])
    if not key:
        # 弹簧：找自己的键名
        if it["id"].startswith("spring."):
            key = it["id"].split(".", 1)[1] + ":["
        elif it["id"].startswith("q."):
            key = 'name:"%s"' % it["id"].split(".", 1)[1]
    if not key:
        continue
    off = find_off(key, 0)
    if off >= 0:
        it["anchor"] = anchor_at(off)
        it["code"] = snippet(off, 160)

MOD_ANCHOR = {m["role"]: m["anchor"] for m in D["modules"]}
FALLBACK = {"WEAPON": "weapon", "ACTOR": "enemies", "ENV": "render",
            "FX": "render", "NUM": "fx", "SCENE": "level"}
for it in items:
    if it["anchor"] == "L1:C1":
        it["anchor"] = MOD_ANCHOR.get(FALLBACK.get(it["cat"], ""), "L1:C1")

out = {
    "source": D["source"],
    "items": items,
    "counts": {},
}
from collections import Counter  # noqa: E402
c = Counter((x["cat"], x["sub"]) for x in items)
out["counts"] = [{"cat": k[0], "sub": k[1], "n": v} for k, v in sorted(c.items())]
out["total"] = len(items)

path = os.path.join(ROOT, "build", "inventory.json")
json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("total", len(items))
for row in out["counts"]:
    print("  %-6s %-8s %3d" % (row["cat"], row["sub"], row["n"]))
print("->", path)
