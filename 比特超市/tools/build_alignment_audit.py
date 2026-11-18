#!/usr/bin/env python3
"""从当前资产台账、原版字节和真实验证报告重建对标审计；不执行游戏测试。"""
import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html')
EXPECTED = '9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966'
STATUS = {'pending': '待接入', 'partial': '局部实现', 'reference': '参数/流程展示', 'verified_scope': '限定范围通过', 'stale': '待重跑', 'failed': '验证失败', 'unexecuted': '未执行', 'complete': '完整验收完成'}
GATES = [
    ('source', '01 来源 / hash', '原始字节、真实入口、抽取范围、生成文件 hash 可追溯。'),
    ('structure', '02 全部资产结构', '逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。'),
    ('runtime', '03 运行依赖 / 锁版本', '原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。'),
    ('behavior', '04 变体 / 动态 / 数值事件', '实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。'),
    ('lifecycle', '05 生命周期 / 失败', '创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。'),
    ('evidence', '06 分层证据', '分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。'),
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def load_json(path):
    try:
        return json.loads(path.read_text()), None
    except (OSError, ValueError) as exc:
        return {}, str(exc)


def load_db(root):
    text = (root / 'assets/data.js').read_text()
    match = re.search(r'window\.DB\s*=\s*(\{.*\})\s*;?\s*$', text, re.S)
    if not match:
        raise ValueError('assets/data.js 不是 window.DB 纯 JSON 赋值')
    return json.loads(match.group(1))


def anchor(text, name):
    match = re.search(r'(?<![\w$])(?:async\s+)?function\s*\*?\s*' + re.escape(name) + r'\s*\(', text)
    if not match:
        match = re.search(r'(?<![\w$])(?:var|let|const)\s+' + re.escape(name) + r'\s*=', text)
    if not match:
        return {'symbol': name, 'found': False, 'line': None, 'column': None}
    pos = match.start()
    return {'symbol': name, 'found': True, 'line': text.count('\n', 0, pos) + 1,
            'column': pos - text.rfind('\n', 0, pos), 'signature': text[pos:pos + 100].split('{')[0]}


def proof(kind, state='unexecuted', detail='', paths=None):
    return {'kind': kind, 'status': state, 'detail': detail, 'paths': paths or []}


def group_specs():
    # 这些是静态源码契约与待验收清单，不是运行结果。
    return [
        dict(id='props', title='道具 · 36 件真实构建器', symbols=['Yg', 'M3', 'zA', 'J3', 'eb', 'sb', 'B3'], modules=['props-builder', 'container-builder'], state='partial',
             current='36 件道具已接完整专用构造器。结构与所测变体结论实读 props-verification.json；逐件页面接线/操作证据实读 props-ui-verification.json。GPU 材质、最终整机呈现与完整生命周期仍待验收。',
             conditions=['Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。', 'M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。', 'B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。'],
             host='几何宿主可用注入 THREE + mats 服务；正式外观必须进入 r180 原完整 render/mats/level/ground 链，不以棚拍代替整机。',
             api=['现有：createPropService(ctx).build(id, options)', '现有：buildProp(ctx, id, options)；ctx.mats={get,label,decal,number,emissive}', '集装箱：buildContainer(ctx,id,options)；动态对象 userData.update/setState 由宿主调度'],
             tests=['对原 Yg 独立 IIFE 与模块逐数组/层级/矩阵/碰撞比较，捕获 fallback。', '每件 default/seed 与实际选项；三箱额外六变体/开门/磨损组合；中继三状态与时间点。', '原材质 GPU 对照、近中远截图、碰撞行走、缓存与销毁仍须另验。'],
             limits=['结构对比使用同名简化 get 材质，不证明 GPU 纹理或最终外观一致。', '门/货叉主要是构建姿态；无可驾驶叉车或交互式物理门承诺。']),
        dict(id='geometry', title='几何、合批与碰撞', symbols=['$e', 'Wi', 'ot', 'Fn', 'Dc', 'Lc', 'Ii', 'By', 'd3', 'ob'], modules=['modeling-kit', 'props-builder'], state='partial',
             current='7 个原语条目与模型工具可管理/运行；d3/ob/By 的正式关卡碰撞、导航、合批链并未因几何预览而完成。',
             conditions=['Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。', '按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。', 'AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。'],
             host='r180 + 几何工具 + mats + d3；先构建实体/盒，再 physics.build；导航不能从最终合批网格反推。',
             api=['现有 modeling-kit 导出以代码为准；不把它当 d3 SDK。', '原版契约：physics.addBox/raycast/lineOfSight/groundHeight/moveCapsule/nav', '原版 ob.place(name,x,z,yaw,opts,y,flags)；拟封装时保留入参顺序'],
             tests=['逐基元属性数组、索引、UV 米密度与变换对照。', '旋转薄盒、楼梯/猫道、顶棚起身、bulletOnly/playerOnly 与导航阻挡专项。', '合批前后材质/shadow/layer/noMerge、placed 与碰撞数量一致。'],
             limits=['Gi 不等于实测 bbox；碰撞是近似 AABB，不是精确三角网格。', '单层 XZ A*，不具多层 NavMesh 或通用刚体系统。']),
        dict(id='materials', title='材质、GPU 烘焙与贴花', symbols=['Gg', 'h3', 'l3', 'rb'], modules=['material-ledger', 'material-baker', 'container-builder'], state='partial',
             current='29 配置族/48 实例、27 surf 函数与真实 l3 Canvas 贴花可见；baker 是 r160 三遍适配，尚无全族 GPU 对比证据。',
             conditions=['原 MRT sqrt(albedo)+A / ORM / height；平方还原、毫米 bump→normal、sRGB 与数据纹理必须区分。', '原尺寸 min(tex,1024)*size，hero 特例；核对当前 base 尺寸、colorSpace、缓存缺 scale 和三平面 UV 差异。', '漆面 A 为残漆权重；ORM=R AO/G rough/B metal；保留湿润/宏观脏污、铁丝网 alpha、图集与字体刷新。'],
             host='r180 WebGL2/MRT + Gg/h3/l3/rb + 原天空/PMREM/探针/完整输出；r160 仅适配分支，不能预设像素等价。',
             api=['现有：createBaker(THREE,renderer,ledger,{tex,wet}) → bake/material/set/stats/wet/dispose', '现有：createDecalService({canvasFactory},opts) → label/decal/number', '原版：await Gg(ctx)；mats.get/label/decal/number/emissive'],
             tests=['各族/实例/seed/分辨率的 albedo/ORM/height/normal GPU readback 与 metadata 比对。', 'scale/interior/triplanar/color 缓存隔离；湿干/掠射/近远/alpha 专项截图。', '编译错误、目标状态恢复、字体就绪、重复创建与 dispose 检查。'],
             limits=['源码中的“唯一差异/逐像素相同”注释不是实测证明。', '通用 asphalt/water 不是正式地面/海面的替代；玻璃无物理折射链。']),
        dict(id='warehouse', title='仓库与关卡布局', symbols=['C1', 'ab', 'hR', 'fR', 'ob'], modules=[], state='pending',
             current='scene.level 与另外两个场景条目共用 envPreview 手工测试场；未接原 C1 仓库/箱列/关卡。',
             conditions=['仓库 28×17m，檐 7/脊 9.5；门/百叶/8 处屋面缺口、办公室、货架、风扇与灯线完整。', '同一建筑同步可见网格、碰撞、interiorBoxes、skylights、雨盒/檐滴、探针与体积尘区。', 'hR/fR 原摆放、箱列堆高、叉车托货、楼梯猫道连接点、出生/掩体/中继/撤离登记。'],
             host='正式 Hg→Gg→d3/Yg→C1→Eb/O1→physics.build→onLevelReady；必须原版 r180 全链宿主。',
             api=['原版：await C1(ctx)；level.root/placed/interiorBoxes/skylights/playerStart/cinematicPath', '拟封装（未实现）：createLevelPackage(ctx) → level/update/reset/dispose；不得冒充现有 API'],
             tests=['原入口/仓库内外/天窗/路线同机位截图；与原 placed、盒、缺口和材质清单核对。', '实际走通门、台阶、猫道；三中继与雨遮挡/光束/探针联动。'],
             limits=['手工棚拍场不等价于 C1；单个组件漂亮不能证明关卡整机一致。', '静态合批后不保留每个可见箱体 Mesh，须按 placed 追溯。']),
        dict(id='backdrop', title='船、吊机、岸线与远港', symbols=['Eb', 'pv', 'z1', 'vb', 'xb', 'Mb', 'wb', 'lb', 'cb'], modules=[], state='pending',
             current='scene.backdrop 同样只是 envPreview；原吊机/船壳/艇/远港/海鸥与正式岸线未组成独立可复用包。',
             conditions=['岸线 X30、海面 -1.6、轨道 X18.5/28.5、梯 Z20、护舷/缆绳/泊位/碰撞与撤离同步。', '保留曲面船壳/艏艉收缩、船舱甲板、吊具/雷达/艇 hullGrp 层级；祖先 noMerge。', '固定 LCG 远港、简化吊机/货船/灯塔/海鸥与 update，不凭印象随机港区。'],
             host='C1 岸线 + Eb/pv + O1.seaHeight + Hg/mats/quality/time/rng；完整原版渲染。',
             api=['原版：Eb/pv(ctx) 的 root/update 与船艇接口须从返回值封装', '拟封装（未实现）：createBackdropPackage(ctx) → root/update/dispose；保留 boat/crane/ship/skyline/gulls'],
             tests=['岸线、船艏、吊机、远港固定视角与原版对照；船壳数组/分块 AABB。', '按 t 采样吊具正弦、radar=t*1.9、艇层级摇摆、海鸥翼；缆绳与地面接缝。'],
             limits=['吊机仅轻摆，无操作吊装/钢索动力学；艇是正弦，不是真浮力。', '货船不整体随浪；远景是预制简化规则，不是自动 LOD。']),
        dict(id='ground', title='正式地面、海、雨', symbols=['O1', 'Rb', 'Cb', 'Pb', 'Ib', 'zb', 'B1', 'kb', 'Nb'], modules=[], state='pending',
             current='scene.ground 使用手工 envPreview；材质球和流程卡未恢复 O1 正式地面/反射/海浪/雨。',
             conditions=['190×320 场坪至 X30；26 低洼点、蓄水/湿度/油污/磨损 mask、黄白线/轮痕与接缝。', '地面 Y0 镜像相机+oblique 裁剪与反射隐藏列表；海面 -1.6 自写大/小波、泡沫、环境反射。', '雨循环盒、室内盒/天窗/檐滴、雷事件、splash 关闭项与冷启动数量严格区分。'],
             host='r180 Hg.renderWorld/depth + C1 interiorBoxes/skylights + mats/time/quality/rng + O1；不能用 Plane + asphalt 代替。',
             api=['原版：await O1(ctx)；ground.root/update/seaHeight 与反射 pass 接 Hg', '拟封装（未实现）：createGroundPackage(ctx)；反射状态恢复、resize 与 dispose 必须显式'],
             tests=['mask/readback、标线和低洼坐标，干湿/积水掠射同机位截图。', '反射 belowY 禁用/隐藏列表/尺寸对齐；海浪 t 切片与雨穿屋顶测试。', '质量冷启动/resize/暂停/上下文失败与资源释放。'],
             limits=['地面不是完整几何位移；地面平面反射不是 SSR，也不是全海面反射。', 'seaHeight 仅大波高度；没有雨水全局物理模拟或分叉闪电几何。']),
        dict(id='weapon', title='武器、双手与程序动作', symbols=['w_', 'Vv', 'U_', 'TC', 'F_', 'dm', 'ma'], modules=['weapon-tuning'], state='reference',
             current='weaponPreview 是数值/弹簧图，不是 PAC9 模型、双手、瞄具或完整动作；9 弹簧积分可跑不等于武器完成。',
             conditions=['w_ 七槽枪械、独立 bolt/mag/round、手掌/指节/袖套、右食指顶点插值与左手轨迹。', '世界 FOV74/layer0 与 view FOV54/layer1，depthRange(0,.05)，mi 枪口/抛壳/瞄具/握持挂点。', '30+150、720RPM、26/弱点2.2；换弹 .47/1.345/2.19 与 2.1/2.72s，数值和事件唯一提交。'],
             host='r180 render 双相机 + player/input/combat/events/time/mats/fx/audio；dm 必须进入原主循环阶段。',
             api=['现有：weapon-tuning spring/integrate/WEAPON/RELOAD，只有参数与积分', '原版：await dm(ctx)；weapon.update/reset 等以返回对象为准', '拟封装（未实现）：createWeaponPackage(ctx)，不能把 chart API 当模型 API'],
             tests=['枪体/手几何、层级挂点、ADS 0/.09/.18 与换弹关键帧截图/视频。', '实际输入开火/空仓/打断/检视/重试，ammo/reserve 及事件日志同录。', '眼射线判伤与枪口曳光分开；60/30/20fps 短枪焰与音画同步。'],
             limits=['仅单武器、无玩家全身/导入手臂动画、换枪或掉落弹匣刚体。', '原有旧矩阵/一帧时序、reset 不完全与低帧率枪焰限制需记账，不静默修正。']),
        dict(id='actors', title='敌人、程序骨骼与四足 IK', symbols=['pm', 'j_', 'Z_', 'q_', 'Q_', 'iM', 'Em'], modules=['ai-tuning'], state='reference',
             current='actor.gull/hound 是 AI 参数图，未抽出 SkinnedMesh/Skeleton、程序构件、解析 IK 与行为动画。',
             conditions=['iu/pm 单骨骼权重蒙皮，飞鸥 body/rotor/gimbal/gun、猎犬 body/head/turret/四腿层级完整。', '猎犬站高 .72、腿长 .4/.42、支撑足世界锁定、对角摆腿、头/枪瞄准与天线弹簧。', 'Em 感知/令牌/池/导航/命中体；飞鸥移动弹体与猎犬即时射线不同；死亡/残骸/声源回收。'],
             host='完整 physics/nav/player/combat/events/time/fx/audio/render/mats 与池初始化；不能以普通旋转模型替代。',
             api=['现有：ai-tuning.TUNING/validate 仅数值', '原版：await Em(ctx)；spawn/update/raycast/reset 等以真实返回值核对', '拟封装（未实现）：createEnemyPackage(ctx)，另保骨架绑定与行为所有权'],
             tests=['骨骼 bind pose、skinIndex/skinWeight、几何与命中体对照。', '步态/台阶/转弯/预警/攻击/受损/死亡连续视频及脚点/事件日志。', '池满、旧残骸回收、暂停重置、最近六声源虚拟化与 60/30/20fps。'],
             limits=['程序死亡非 ragdoll；近似胶囊/球命中非精确网格。', '没有全身玩家模型、多层 NavMesh 或外部动作片段；扑击近似要保留说明。']),
        dict(id='render', title='光影、后期与视听 FX', symbols=['Hg', 'jy', 'Hy', 'Vy', 'qy', 'Cf'], modules=['env-atmosphere', 'quality-presets'], state='reference',
             current='env8 / fx13 主要是数值/流程卡与手工测试场；局部灯光/后期演示不等于 Hg/jy/Cf 原主管线。',
             conditions=['暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。', 'HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。', 'Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。'],
             host='完整 r180 Hg + ShaderChunk 补丁 + WebGL2/HalfFloat/depth/MRT + 原世界与双相机；棚拍只作诊断层。',
             api=['现有：env-atmosphere.install/shadowFrustum/createLightPool；quality-presets 数值', '原版：await Hg(ctx)；render.frame/renderWorld/onLevelReady/setQuality；await Cf(ctx)', '拟封装（未实现）：createRenderPackage/createFxPackage；需要显式 render graph/resize/dispose'],
             tests=['固定 viewport/DPR/q/seed/cam/帧，原入口/箱道/室内/岸线截图；记录 advanced/stubs/errors。', '各 pass/depth/readback、wet/planar/post 单项开关；真实事件粒子/灯/弹孔采样。', 'forward/软阴影 fallback 单独记降级，GPU/分辨率/帧时不能混报。'],
             limits=['无 SSR/SSGI/实时 GI/完整 DOF/TAA；动模是相机重投影非物体速度。', '渲染注释/参数字段不证明已启用；ready 或一张棚拍不能证明整机。']),
        dict(id='audio', title='音效、环境混音与五层音乐', symbols=['c_', 'u_', 'r_', 'a_', 'KR', 'G8'], modules=['audio-recipes'], state='reference',
             current='57 条 Go 配方的 gen 是字符串；未连接 DSP 生成器、AudioBuffer、运行混音/空间声源与可听播放。',
             conditions=['保留噪声/滤波/包络/模态 DSP、固定 seed 变体、o_ 归一与 generator 分步合成。', 'near/world/amb/dry/music 总线、双 IR/双枪尾、声部优先级/抢占/虚拟化/duck/用户手势。', '100BPM 五层音乐，19.2/9.6s，全部 ready 后同 currentTime+.08 起播；动作/任务事件时间表。'],
             host='WebAudio + c_/u_ + 全 DSP 依赖/Go/Fr + camera/interiorBoxes/events/game/time；独立宿主也需真实手势和可录音输出。',
             api=['现有：RECIPES/RECIPE_IDS/byBus/busLoad/voiceBudget，均非播放 API', '原版：audio.resume/play/loop/update/ready/selfTest/setIntensity/setInterior/setVolume/setPaused/debug', '拟封装（未实现）：createAudioPackage(ctx)，loop 句柄 setPos/setGain/setPitch/stop'],
             tests=['每配方/变体离线 peak/over/nan/rms、接缝与 sampleRate；保留 IR 与双声道。', '真实手势后录音并听辨开火/换弹/脚步/室内外/混音/音乐强弱。', '未 ready 超时、抢占/池满、暂停/隐藏/恢复/重启循环释放与相位检查。'],
             limits=['配方、AudioContext=running 或静音冒烟都不能证明有声。', 'radio:line 只有文字，无对白配音；不得凭字幕补造配音。']),
        dict(id='gameplay', title='玩法、输入、任务与 HUD', symbols=['Dy', 'v_', 'x_', 'zv', 'hM', 'pM', 'mM', 'QC'], modules=['player-tuning', 'weapon-tuning', 'ai-tuning'], state='reference',
             current='玩家/按键/波次调参和图表是资料层；原任务、输入状态机与 DOM HUD 尚非当前资产库可玩整机。',
             conditions=['input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。', 'title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。', '触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。'],
             host='带原 r180 全渲染的 QC 正式启动器；原 HTML 可作基准宿主，但不等于模块化交付已完成。',
             api=['原版：window.__G/__ready/__fatal/__errors/__frames/__stats/__setShot（调试，不是稳定 SDK）', '原版：game.start/pause/resume/update；hud.setObjective/setRelays/setMarkers/setPrompt/reset/update', '拟封装（未实现）：createGameHost(ctx)，提供启动/暂停/重试/清理；不要绕过真实输入验收'],
             tests=['从标题真实开始→三中继→实际撤离→结算；死亡重试、暂停/后台/恢复。', '键鼠/触摸多点/手柄、390×844/横屏/320px、设置/焦点与错误分支。', '事件→数值→模型动作→FX/HUD→声音同录；debugCut 和 API 注入只能另记。'],
             limits=['未接玩家 melee/alt、拾取补给/治疗、换枪/游泳；不能凭按键名扩写功能。', '原有单向 touch、ARIA/减动缺口、隔墙交互与时序近似需注明；商业分发须另做权利核查。']),
    ]


def build(root, source):
    db = load_db(root)
    raw = source.read_bytes()
    text = raw.decode('utf-8')
    source_hash = hashlib.sha256(raw).hexdigest()
    manifest, manifest_error = load_json(root / 'build/props-source.json')
    report, report_error = load_json(root / 'outputs/props-verification.json')
    modules_text = (root / 'assets/modules.js').read_text()
    app_text = (root / 'app.js').read_text()
    route_match = re.search(r'''else\s+if\s*\(h\s*===\s*["']/alignment["']\)\s*renderAlignment\s*\(''', app_text)
    route_implemented = bool(route_match and 'outputs/full-alignment-audit.html' in app_text)
    ui, ui_error = load_json(root / 'outputs/props-ui-verification.json')
    ui_rows = ui.get('rows', [])
    ui_by_id = {}
    for row in ui_rows:
        ui_by_id.setdefault(row.get('propId', row.get('id')), []).append(row)
    props_hash = digest(root / 'assets/code/props-builder.js')
    input_hashes = {'source': source_hash, 'generated': props_hash,
                    'packedModule': digest(root / 'assets/modules.js'), 'manifest': digest(root / 'build/props-source.json'),
                    'container': digest(root / 'assets/code/container-builder.js'),
                    'app': digest(root / 'app.js'), 'previews': digest(root / 'previews.js'),
                    'data': digest(root / 'assets/data.js')}
    # 可选版本字段约定与结构报告一致：static.<key>.sha256；缺失不能倒填当前 hash。
    ui_hashes = {key: ui.get('static', {}).get(key, {}).get('sha256') for key in input_hashes}
    ui_hash_checks = {key: (ui_hashes[key] == value if ui_hashes[key] else None) for key, value in input_hashes.items()}
    ui_module_bound = all(ui_hash_checks[key] is True for key in ['source', 'generated', 'packedModule'])
    ui_hash_mismatch = any(value is False for value in ui_hash_checks.values())
    ui_binding_note = ('UI 报告输入 hash 与当前 source/module/packedModule 匹配。' if ui_module_bound and not ui_hash_mismatch else
                       'UI 报告输入 hash 已不匹配，不能作为当前版本 UI 通过。' if ui_hash_mismatch else
                       'UI 报告缺少输入 hash：仅是该次 UI 运行证据，不能绑定当前 module 版本；主线程可在 UI 生成器写入 static.source/generated/packedModule.sha256（建议同时记录 manifest/container/app/previews/data）后重跑。')
    ui_report_ok = (ui.get('status') == 'PASS' and ui.get('errors') == [] and ui.get('mobileOverflow') == 0)

    def ui_evidence(pid):
        matches = ui_by_id.get(pid, [])
        row = matches[0] if len(matches) == 1 else {}
        try:
            vertices = int(str(row.get('vertices', '')).replace(',', ''))
            triangles = int(str(row.get('triangles', '')).replace(',', ''))
        except ValueError:
            vertices, triangles = None, None
        builder = row.get('builder')
        builder_valid = builder == ('M3/zA' if pid in ['container20', 'container40', 'container40hc'] else 'Yg/' + pid)
        passed = bool(ui_report_ok and len(matches) == 1 and builder_valid and vertices is not None and vertices > 24
                      and triangles is not None and triangles > 0 and not row.get('fail')
                      and row.get('prop', pid) == pid)
        mesh_match = re.search(r'([\d,]+)\s*(?:材质)?网格', row.get('note', ''))
        meshes = int(mesh_match.group(1).replace(',', '')) if mesh_match else None
        return {'propId': pid, 'status': 'stale' if ui_hash_mismatch else 'verified_scope' if passed else 'unexecuted' if ui_error or not row else 'failed',
                'runtimeVerified': passed and not ui_hash_mismatch, 'matchedRows': len(matches), 'canvasBuilder': builder,
                'builderMatches': builder_valid, 'vertices': vertices, 'triangles': triangles, 'meshes': meshes,
                'metricsSource': 'UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取',
                'scope': '逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。',
                'versionBound': ui_module_bound and not ui_hash_mismatch, 'hashChecks': ui_hash_checks,
                'reportedInputHashes': ui_hashes, 'reportSha256': digest(root / 'outputs/props-ui-verification.json'),
                'reportHref': 'props-ui-verification.json', 'bindingNote': ui_binding_note, 'row': row}

    def screenshot(name):
        path = root / 'outputs' / name
        return {'path': 'outputs/' + name, 'href': name, 'exists': path.is_file(), 'sha256': digest(path),
                'bytes': path.stat().st_size if path.is_file() else None, 'versionBound': False,
                'scope': '文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。'}
    report_hash = report.get('static', {}).get('generated', {}).get('sha256')
    manifest_hash = manifest.get('generated', {}).get('sha256')
    definitions = manifest.get('extraction', {}).get('props', {})
    cases = report.get('cases', [])
    expected_cases = {(pid, 'default') for pid in definitions} | {(pid, 'seed1') for pid in definitions}
    expected_cases |= {(pid, 'option:' + key) for pid, meta in definitions.items() for key in meta.get('optionKeys', []) if key != 'seed'}
    actual_cases = {(case.get('prop'), case.get('group')) for case in cases}
    freshness = {'source': source_hash == EXPECTED == report.get('static', {}).get('source', {}).get('sha256'),
                 'module': bool(props_hash) and props_hash == report_hash == manifest_hash,
                 'caseCoverage': expected_cases <= actual_cases and bool(expected_cases),
                 'manifestSource': manifest.get('source', {}).get('sha256') == source_hash,
                 'packedModule': report.get('static', {}).get('packedModule', {}).get('sha256') == input_hashes['packedModule']}
    fresh = all(freshness.values())
    report_state = ('unexecuted' if report_error else 'stale' if not fresh else
                    'verified_scope' if report.get('status') == 'PASS' and report.get('runtimeSuccess') is True and cases and all(c.get('pass') is True for c in cases) else 'failed')
    groups = []
    for spec in group_specs():
        group = dict(spec)
        group['status'] = {'code': group.pop('state'), 'complete': False, 'detail': group.pop('current')}
        group['source'] = [dict(anchor(text, name), path=str(source), sha256=source_hash) for name in group.pop('symbols')]
        group['package'] = {'modules': group.pop('modules'), 'api': group.pop('api'), 'apiNote': '“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。'}
        group['minimumHost'] = group.pop('host')
        group['acceptanceTests'] = group.pop('tests')
        group['limitations'] = group.pop('limits')
        group['technicalFeasibility'] = {'originalCode': '可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。', 'crossEngine': '需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。', 'rights': '技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。'}
        group['lifecycleRequirements'] = ['创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。', '捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。']
        group['evidence'] = [proof(kind, detail='本审计未新增该类实测。') for kind in ['geometry', 'texture', 'dynamic', 'image', 'audio']]
        group['gates'] = [{'id': gid, 'status': 'partial' if gid == 'source' else 'unexecuted', 'required': desc, 'detail': '入口已静态定位；非运行验收。' if gid == 'source' else '见本类完整条件与验收项。'} for gid, _, desc in GATES]
        if group['id'] == 'props':
            group['status']['code'] = report_state
            group['status']['detail'] += ' 当前结构报告：' + str(report.get('status', '无报告')) + '；输入新鲜度：' + ('匹配' if fresh else '不匹配/未覆盖，须重跑') + '。UI 报告：' + str(ui.get('status', '无报告')) + '。' + ui_binding_note
            group['evidence'][0] = proof('geometry', report_state, report.get('scope', {}).get('comparison', '无运行报告'), ['outputs/props-verification.json'])
            group['evidence'][2] = proof('dynamic', report_state, report.get('scope', {}).get('dynamic', '中继动态未报告'), ['outputs/props-verification.json'])
            for gate in group['gates']:
                if gate['id'] in ['source', 'structure', 'behavior']:
                    gate['status'] = report_state
                    gate['detail'] = '仅限报告实际 cases；不覆盖全变体笛卡尔积或整机材质。'
        groups.append(group)

    def group_id(item):
        cat, ident = item['cat'], item['id']
        if cat in ['MAT', 'DECAL']: return 'materials'
        if cat == 'MODEL': return 'geometry' if ident.startswith('geo.') else 'props'
        if cat == 'SCENE': return {'scene.level': 'warehouse', 'scene.backdrop': 'backdrop', 'scene.ground': 'ground'}[ident]
        if cat in ['ENV', 'FX'] or ident.startswith('q.'): return 'render'
        if cat == 'SFX': return 'audio'
        if cat == 'WEAPON' or ident == 'num.weapon': return 'weapon'
        if ident in ['actor.gull', 'actor.hound', 'num.ai']: return 'actors'
        return 'gameplay'

    group_map = {g['id']: g for g in groups}
    components, props = [], []
    for item in db['items']:
        gid = group_id(item)
        component = {'id': item['id'], 'name': item['name'], 'category': item['cat'], 'sub': item['sub'], 'groupId': gid,
                     'sourceAnchor': item.get('anchor'), 'sourceHash': source_hash, 'href': '../index.html#/a/' + item['id'],
                     'status': group_map[gid]['status']['code'], 'complete': False,
                     'contractRef': gid, 'conditionRefs': [g[0] for g in GATES], 'evidenceRefs': [],
                     'currentPreview': item.get('focus', {}).get('preview', item.get('kind')),
                     'catalogParameters': item.get('params', []),
                     'specificConditions': ['逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。'],
                     'acceptanceRefs': gid,
                     'technicalFeasibilityRef': gid, 'limitationsRef': gid}
        if gid == 'audio':
            component['specificConditions'] += ['必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。']
        elif gid == 'materials':
            component['specificConditions'] += ['此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。']
        elif gid in ['weapon', 'actors']:
            component['specificConditions'] += ['本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。']
        else:
            component['specificConditions'] += group_map[gid]['conditions']
        if item['id'].startswith(('prop.', 'build.')):
            pid = item['id'].split('.', 1)[1]
            pcases = [c for c in cases if c.get('prop') == pid]
            meta = definitions.get(pid, {})
            state = report_state if pcases else 'unexecuted'
            if fresh and any(c.get('pass') is not True for c in pcases): state = 'failed'
            component.update(status=state, evidenceRefs=['outputs/props-verification.json'],
                             detail='逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。')
            if item['id'].startswith('prop.'):
                preview = item.get('focus', {}).get('preview')
                wired = preview in ['props-builder', 'container-builder'] and ('props-builder' if preview == 'props-builder' else 'container-builder') in modules_text
                ui_record = ui_evidence(pid)
                image = screenshot('prop-' + pid + '.png')
                variants = [screenshot(path.name) for path in sorted((root / 'outputs').glob('prop-' + pid + '-*.png'))]
                props.append({**component, 'propId': pid, 'builder': meta.get('builder', item.get('focus', {}).get('builder')),
                              'builderChain': meta.get('builderChain', []), 'optionKeys': meta.get('optionKeys', []),
                              'defaultOptions': meta.get('defaultOptions', {}), 'materialDependencies': meta.get('materialDependencies', []),
                              'dynamicHooks': meta.get('dynamicHooks', {}),
                              'previewWiring': {'declared': preview, 'bundled': wired, 'runtimeVerified': ui_record['runtimeVerified'],
                                                'versionBound': ui_record['versionBound'], 'scope': ui_record['scope'],
                                                'reportHref': ui_record['reportHref'], 'reportSha256': ui_record['reportSha256'],
                                                'hashChecks': ui_hash_checks, 'note': ui_binding_note},
                              'uiEvidence': ui_record, 'image': image, 'variantImages': variants,
                              'verification': {'status': state, 'geometryStatus': state,
                                               'scope': '独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。',
                                               'reportedStatus': report.get('status'), 'cases': len(pcases), 'passed': sum(c.get('pass') is True for c in pcases),
                                               'failed': sum(c.get('pass') is not True for c in pcases), 'caseGroups': [c.get('group') for c in pcases],
                                               'dynamicSamples': sum(len(c.get('dynamic', [])) for c in pcases), 'reportHref': 'props-verification.json'},
                              'limitations': ['全族 GPU 材质/整机截图未验收。', '完整选项组合、场景放置与生命周期需另测。']})
        components.append(component)
    for group in groups:
        group['componentIds'] = [c['id'] for c in components if c['groupId'] == group['id']]
    ui_verified_count = sum(p['previewWiring']['runtimeVerified'] for p in props)
    image_count = sum(p['image']['exists'] for p in props)
    props_group = group_map['props']
    props_group['evidence'][3] = proof('image', 'verified_scope' if image_count == len(props) and ui_verified_count == len(props) else 'partial',
                                      f'{image_count}/{len(props)} 截图存在；{ui_verified_count}/{len(props)} 程序操作通过，但非全部人工视觉审阅，非 GPU 材质/最终整机比对。' + ui_binding_note,
                                      ['outputs/props-ui-verification.json'] + [p['image']['path'] for p in props if p['image']['exists']])
    props_group['evidence'][3]['versionBound'] = False
    props_group['evidence'][3]['uiVersionBound'] = ui_module_bound and not ui_hash_mismatch
    props_group['evidence'][3]['manualVisualReview'] = False
    for gate in props_group['gates']:
        if gate['id'] == 'runtime':
            gate['status'] = 'partial'
            gate['detail'] = f'独立道具 UI 报告 {ui_verified_count}/{len(props)}；' + ui_binding_note + ' 原 r180 整机运行链仍待验收。'
        elif gate['id'] == 'evidence':
            gate['status'] = 'partial'
            gate['detail'] = '结构/所测变体与 UI 截图有证据；全族 GPU、整机、生命周期和全部人工视觉未完成。'
    evidence_files = []
    for name in ['props-verification.json', 'props-ui-verification.json', 'container-verification.json', 'props-reference-original.png', 'props-reference-current.png', 'container-structure-comparison.html']:
        path = root / 'outputs' / name
        evidence_files.append({'path': 'outputs/' + name, 'href': name, 'exists': path.is_file(), 'sha256': digest(path), 'qualification': '文件存在仅为索引；按报告范围解释，不是完整对标通过。'})
    return {'schemaVersion': '1.1.0', 'generatedAt': datetime.now(timezone.utc).isoformat(),
            'meta': {'title': '几猫原版 · 全组件对标审计', 'source': {'path': str(source), 'bytes': len(raw), 'sha256': source_hash, 'expectedSha256': EXPECTED, 'hashMatches': source_hash == EXPECTED},
                     'managedEntries': len(components), 'propCount': len(props), 'groupCount': len(groups), 'completedProducts': None,
                     'countNote': '283 是管理条目，不是 283 件成品；道具与建模器重复登记同一资产，参数/配方/流程亦计数。完整成品数未认证。',
                     'scope': '静态读码 + 现有运行报告索引。本生成器不运行 GPU、游戏、音频或玩法验收。',
                     'protectedFiles': '不写 app.js / previews.js / assets/modules.js / inventory / props 实现。'},
            'statusLabels': STATUS, 'gateDefinitions': [{'id': gid, 'label': label, 'requirement': desc} for gid, label, desc in GATES],
            'runtimeContract': {'baseline': 'three@0.180.0 / 原内嵌 r180；WebGL2 + GLSL3/MRT + HDR/depth；保留许可注释', 'current': 'vendor THREE r160（以运行报告 revision 为证）；不是原 r180 整机',
                                'locks': ['源 hash 与生成文件 hash', 'THREE revision / ShaderChunk / 自定义 cache key', '字体/viewport/DPR/画质冷启动/纹理尺寸/seed/dt/相机/帧号', 'GPU/浏览器/OS/音频设备与 sampleRate'],
                                'minimumFullHost': '原字节完整 HTML 的 QC 正式路径 + r180；模块化宿主还须保留 Hg/Gg/d3/Yg/C1/Eb/O1/Cf/c_/v_/x_/zv/dm/Em/hM/mM 的依赖与帧序。',
                                'boundary': '原版完整宿主是必要基准，不表示当前资产库已接成整机；独立几何棚拍只可验证局部。'},
            'propsVerification': {'path': 'outputs/props-verification.json', 'href': 'props-verification.json', 'reportedStatus': report.get('status'), 'effectiveStatus': report_state,
                                  'fresh': fresh, 'freshness': freshness, 'summary': report.get('summary', {}), 'startedAt': report.get('startedAt'), 'completedAt': report.get('completedAt'),
                                  'sourceHash': source_hash, 'currentModuleHash': props_hash, 'reportModuleHash': report_hash, 'manifestModuleHash': manifest_hash,
                                  'expectedCases': len(expected_cases), 'missingCases': [{'prop': p, 'group': g} for p, g in sorted(expected_cases - actual_cases)],
                                  'errors': [e for e in [report_error, manifest_error, report.get('error')] if e],
                                  'scope': report.get('scope', {}), 'readiness': report.get('readiness', {}), 'unexecuted': report.get('unexecuted', []),
                                  'note': '旧 PASS 不能穿透模块/hash/选项变更；生成器只实读，不修改验证报告。不将 report PASS 升格为完整复刻。'},
            'propsUiVerification': {'path': 'outputs/props-ui-verification.json', 'href': 'props-ui-verification.json',
                                    'reportedStatus': ui.get('status'), 'reportedTotal': ui.get('total'), 'rows': len(ui_rows),
                                    'matchedProps': sum(p['uiEvidence']['matchedRows'] == 1 for p in props),
                                    'runtimeVerified': ui_verified_count, 'errors': ui.get('errors'), 'readError': ui_error,
                                    'mobileOverflow': ui.get('mobileOverflow'), 'reportSha256': digest(root / 'outputs/props-ui-verification.json'),
                                    'versionBound': ui_module_bound and not ui_hash_mismatch, 'hashChecks': ui_hash_checks,
                                    'reportedInputHashes': ui_hashes, 'currentInputHashes': input_hashes, 'bindingNote': ui_binding_note,
                                    'scope': '实读主线程现有 UI 报告，不是本生成器新执行的 UI 测试。'},
            'gallery': {'total': len(props), 'imagesExist': image_count, 'variantImages': sum(len(p['variantImages']) for p in props),
                        'manualVisualReview': False, 'columns': 3, 'lazyLoading': True},
            'groups': groups, 'components': components, 'props': props, 'evidenceFiles': evidence_files,
            'limitations': ['无对白配音、玩家全身、玩家 melee/alt 消费、换枪/拾取补给、布娃娃、多层 NavMesh、SSR/SSGI/实时 GI/完整 DOF/TAA 的已启用证据。',
                            '固定 seed 不覆盖 Math.random/字体/真实时钟；ready 不等于健康，fallback 不等于完整通过。',
                            '可复刻与已完成是两个字段；商业分发需独立权利核查，不能由源码取得推导许可。'],
            'integration': {'global': 'window.ALIGNMENT_AUDIT', 'script': 'assets/alignment-audit.js', 'page': 'outputs/full-alignment-audit.html',
                            'suggestedRoute': '#/alignment', 'routeImplemented': route_implemented,
                            'routeEvidence': {'path': 'app.js', 'line': app_text.count('\n', 0, route_match.start()) + 1 if route_match else None,
                                              'sha256': input_hashes['app'], 'scope': '静态识别路由分支与报告链接；不是运行导航测试。'},
                            'simpleLink': 'outputs/full-alignment-audit.html',
                            'pathRule': 'href 以 outputs 页面为基准；主 app 使用时将 ../index.html#/a/ 替换为 #/a/，报告 href 加 outputs/。',
                            'refreshCommand': 'python3 tools/build_alignment_audit.py', 'order': '主线程生成 manifest/modules/data 与验证报告后，再执行本生成器。',
                            'fields': {'groups': 'id/title/source/status/conditions/minimumHost/package/acceptanceTests/lifecycleRequirements/technicalFeasibility/limitations/gates/evidence/componentIds',
                                       'components': 'id/name/category/sub/groupId/sourceAnchor/sourceHash/href/status/complete/contractRef/conditionRefs/evidenceRefs/currentPreview/catalogParameters/specificConditions/acceptanceRefs/technicalFeasibilityRef/limitationsRef',
                                       'props': '逐件 component + propId/builder/builderChain/optionKeys/defaultOptions/materialDependencies/dynamicHooks/previewWiring/verification/uiEvidence/image/variantImages/limitations',
                                       'propsUiVerification': 'reportedStatus/rows/matchedProps/runtimeVerified/errors/mobileOverflow/reportSha256/versionBound/hashChecks/reportedInputHashes/currentInputHashes/scope',
                                       'previewWiring': 'runtimeVerified 是现有报告限定 UI 证据；versionBound 单独表示与当前模块 hash 绑定，缺 hash 时为 false',
                                       'gallery': 'total/imagesExist/variantImages/manualVisualReview/columns/lazyLoading',
                                       'status': '状态 code 见 statusLabels；complete 只在完整验收后为 true；本版均 false',
                                       'propsVerification': 'reportedStatus 原报告；effectiveStatus 含 freshness；summary 原样实读'}}}


HTML = r'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>几猫原版 · 全组件对标审计</title>
<style>
:root{--ink:#182b32;--muted:#526970;--line:#cedbdc;--paper:#f3f6f3;--card:#fff;--teal:#086b67;--amber:#955610;--red:#a13535}*{box-sizing:border-box;min-width:0}body{margin:0;overflow-wrap:anywhere;background:var(--paper);color:var(--ink);font:15px/1.7 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}a{color:var(--teal);text-underline-offset:4px}button,input,select{font:inherit}button,select,input{border:1px solid #a5bcbe;border-radius:6px;background:#fff;padding:9px 12px;color:var(--ink)}button{cursor:pointer}button:hover{background:#e5f2ef}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #d39c37;outline-offset:3px}header{background:#153c42;color:#f3f7f3;padding:42px max(24px,calc((100vw - 1240px)/2)) 35px}header p{max-width:940px;color:#c9dddd}h1{font-size:clamp(27px,4vw,43px);line-height:1.25;margin:12px 0 18px;font-weight:750;letter-spacing:-1px}h2{font-size:24px;line-height:1.4}h3{font-size:18px;margin:0 0 8px}h4{font-size:14px;margin:15px 0 4px;color:var(--teal)}.eyebrow{font:12px/1.4 ui-monospace,monospace;letter-spacing:2px}nav{display:flex;gap:18px;flex-wrap:wrap}header a{color:#b8eee0}main{max-width:1288px;margin:auto;padding:26px 24px 60px}section{margin-bottom:34px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 20px}.stat,.panel,.group,.gate{border:1px solid var(--line);background:var(--card);border-radius:9px;padding:20px}.stat strong{display:block;font-size:31px;line-height:1.3}.muted,.small{color:var(--muted)}.small{font-size:12px}.notice{padding:16px 20px;background:#fff6e8;border-left:4px solid #bd7b20;border-radius:3px;margin:14px 0}.bad{background:#fbeeee;border-color:var(--red)}.filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:15px 0}.filters label{display:flex;gap:7px;align-items:center;font-size:13px}.filters input{width:260px;max-width:100%}.badge{display:inline-block;border-radius:4px;padding:2px 8px;background:#edf1ef;color:#385b5c;font-size:12px;border:1px solid #d5dfdd;white-space:nowrap}.badge.verified_scope{background:#e0f1e9;color:#1a6050}.badge.failed{background:#fde9e7;color:#982f2a}.badge.stale{background:#fff0da;color:#89520b}.badge.reference,.badge.pending{background:#eff0f4;color:#535c75}.gates{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.gate{padding:16px}.gate p{margin:6px 0}.group{margin:15px 0;padding:0;overflow:hidden}.group summary{padding:20px;cursor:pointer;list-style:none}.group summary::-webkit-details-marker{display:none}.group summary h3{display:inline}.group summary .badge{float:right}.group summary p{margin:9px 0 0}.group summary::before{content:'＋';display:inline-block;margin-right:10px;color:var(--teal)}.group[open] summary::before{content:'−'}.group-body{padding:0 20px 22px;border-top:1px solid var(--line)}.columns{display:grid;grid-template-columns:1fr 1fr;gap:8px 28px}ul{padding-left:20px;margin:6px 0}li{margin:5px 0}code,pre{font:12px/1.65 ui-monospace,SFMono-Regular,monospace;overflow-wrap:anywhere}code{background:#edf3f1;padding:2px 5px}pre{white-space:pre-wrap;background:#edf3f1;padding:16px;border-radius:6px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--line);padding:12px 10px}th{background:#edf3f1;font-size:12px}td a{font-weight:600}td code{font-size:11px}.tablewrap{overflow:auto;border:1px solid var(--line);border-radius:8px;background:#fff}.prop-table{min-width:850px}.compact{min-width:680px}.hash{word-break:break-all;font:12px/1.7 ui-monospace,monospace}.flex{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.component-list{max-height:520px;overflow:auto}.section-title{border-top:2px solid var(--ink);padding-top:17px}.sources{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.empty{padding:25px;color:var(--muted)}footer{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:18px}#schema details summary{cursor:pointer}#error{color:#a13535}.count{font-size:13px;color:var(--muted)}
.gallery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.gallery-card{background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden}.gallery-card img{display:block;width:100%;aspect-ratio:16/11;object-fit:contain;background:#e6ece9}.gallery-info{padding:16px}.gallery-info h3{font-size:17px}.gallery-metrics{font-variant-numeric:tabular-nums;font-size:13px}.gallery-links{display:flex;gap:12px;flex-wrap:wrap}.gallery-card .small{line-height:1.6}
@media(max-width:760px){.gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}header{padding:30px 20px}main{padding:20px 14px 40px}.stats{grid-template-columns:repeat(2,1fr)}.gates{grid-template-columns:1fr 1fr}.columns{grid-template-columns:1fr}.group summary,.group-body{padding:16px}.group summary h3{font-size:17px}.group summary .badge{float:none;margin:8px 0 0 26px;display:table}.filters label{width:100%;justify-content:space-between}.filters input,.filters select{flex:1;min-width:0}.panel{padding:16px}.stat{padding:15px}.stat strong{font-size:26px}}
@media(max-width:430px){.gallery-grid{grid-template-columns:1fr}.gates{grid-template-columns:1fr}.eyebrow{letter-spacing:1px}h2{font-size:21px}}
</style></head><body>
<header><div class="eyebrow">ALIGNMENT AUDIT / SOURCE → PACKAGE → EVIDENCE</div><h1>可以复刻，不等于已经完成。</h1><p>依据静态 source/hash 与实读现有结构、变体和 UI 报告更新进度，并非本生成器新做游戏实测。36 件专用道具的几何、页面操作与截图分账；GPU 材质、整机呈现及完整生命周期仍待验收。</p><nav><a href="#matrix">11 类矩阵</a><a href="#props">36 件道具</a><a href="#gallery">道具图库</a><a href="#components">逐组件索引</a><a href="#gates">六道门</a><a href="#schema">集成 schema</a><a href="../index.html">返回资产库</a></nav></header>
<main><p id="error" role="alert"></p><section id="overview"><div class="stats" id="stats"></div><div class="notice" id="count-note"></div><div class="panel" id="source"></div><div id="verification"></div></section>
<section id="gates"><h2 class="section-title">六道门 · 逐类复刻的共同底线</h2><p class="muted">通过一个门不代表通过全部门；geometry / texture / dynamic / image / audio 必须各自留证。</p><div class="gates" id="gate-list"></div><div class="notice" id="host"></div></section>
<section id="matrix"><div class="flex"><h2 class="section-title">完整对标矩阵</h2><span id="group-count" class="count" aria-live="polite"></span></div><div class="filters"><label>检索<input id="group-query" type="search" placeholder="入口、条件、API、限制…"></label><label>真实状态<select id="group-status"><option value="">全部状态</option></select></label><button id="expand" type="button">展开全部</button><button id="collapse" type="button">收起全部</button></div><div id="group-list"></div></section>
<section id="props"><h2 class="section-title">每件道具 · 构建、接线与验证分账</h2><p class="muted">每行链接到 prop.id。结构/动态 case 来自真实报告；包声明不是浏览器实测，表中“未完整验收”不会被 PASS 覆盖。</p><div class="filters"><label>查找道具<input id="prop-query" type="search" placeholder="名称、ID、构建器、选项…"></label><label>验证状态<select id="prop-status"><option value="">全部状态</option></select></label><a href="props-verification.json">打开原始验证报告</a><span id="prop-count" class="count" aria-live="polite"></span></div><div class="tablewrap"><table class="prop-table"><thead><tr><th>道具 / 真实构建器</th><th>报告状态 / 用例</th><th>实际选项 / 动态</th><th>预览接线</th><th>完整条件 / 限制</th></tr></thead><tbody id="prop-rows"></tbody></table></div></section>
<section id="gallery"><div class="flex"><h2 class="section-title">36 件道具图库 · 现有截图证据</h2><span id="gallery-count" class="count" aria-live="polite"></span></div><p class="muted">沿用上方道具名称/状态筛选。数值取逐件 UI 报告，case 数取结构报告；截图存在及程序操作通过，不等于全部人工视觉、GPU 材质或最终整机验收。</p><div id="gallery-cards" class="gallery-grid"></div></section>
<section id="components"><h2 class="section-title">全部管理条目 · 一项不跳过</h2><p class="muted">每项映射到所属矩阵的完整条件、最小宿主、六门和验收；重复登记建模器不再计作另一件成品。</p><div class="filters"><label>查找组件<input id="component-query" type="search" placeholder="ID、中文名、分类…"></label><label>组件类别<select id="component-category"><option value="">全部类别</option></select></label><span id="component-count" class="count" aria-live="polite"></span></div><div class="tablewrap component-list"><table class="compact"><thead><tr><th>组件</th><th>类别 / 来源</th><th>当前状态</th><th>完整契约</th></tr></thead><tbody id="component-rows"></tbody></table></div></section>
<section id="evidence"><h2 class="section-title">证据范围与已知边界</h2><div class="columns"><div class="panel"><h3>已有文件索引</h3><div id="evidence-list"></div><p class="small">真实 canvas 截图只证明该诊断条件下输出过画面，不等于原材质/整机像素相等；本页没有新做 GPU、玩法或听音验收。</p></div><div class="panel"><h3>禁止扩写的能力</h3><ul id="limits"></ul></div></div></section>
<section id="schema"><h2 class="section-title">主线程集成 · 数据纯赋值，页面可再生成</h2><div class="panel"><p>入口 <code>window.ALIGNMENT_AUDIT</code>。本次不改主应用；<code>#/alignment</code> 是否已接由生成器静态读取 app.js，下方显示检测结果，也可直接链接本报告。</p><pre id="integration"></pre><details><summary>字段 schema / 路径与状态约定</summary><pre id="schema-fields"></pre></details><p class="small">刷新按钮只重载生成后的页面；更新 manifest / modules / data 与验证报告后，需先运行 Python 生成器。file:// 不要求 fetch，数据由相邻 JS 载入。</p><button type="button" onclick="location.reload()">重载最新审计数据</button> <a href="../assets/alignment-audit.js">查看纯数据 JS</a></div></section>
<footer id="footer"></footer></main><script src="../assets/alignment-audit.js"></script><script>
'use strict';
const D=window.ALIGNMENT_AUDIT;
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>'<ul>'+items.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>';
const badge=s=>'<span class="badge '+esc(s)+'">'+esc(D.statusLabels[s]||s)+'</span>';
const search=(obj,q)=>!q||JSON.stringify(obj).toLowerCase().includes(q.toLowerCase());
function options(id,values){$(id).insertAdjacentHTML('beforeend',[...new Set(values)].map(v=>'<option value="'+esc(v)+'">'+esc(D.statusLabels[v]||v)+'</option>').join(''));}
if(!D){$('error').textContent='未载入 assets/alignment-audit.js，请先运行 tools/build_alignment_audit.py。';}else{
$('stats').innerHTML=[['管理条目',D.meta.managedEntries],['独立道具',D.meta.propCount],['对标矩阵',D.groups.length],['完整成品认证','未执行']].map(([a,b])=>'<div class="stat"><strong>'+esc(b)+'</strong><span class="muted">'+esc(a)+'</span></div>').join('');
$('count-note').textContent=D.meta.countNote;
$('source').innerHTML='<h3>原版身份 '+(D.meta.source.hashMatches?'已核对':'不匹配')+'</h3><div class="hash">'+esc(D.meta.source.path)+'<br>SHA-256 '+esc(D.meta.source.sha256)+'</div><p class="small">'+esc(D.meta.scope)+'<br>生成时间 '+esc(D.generatedAt)+'</p>';
const V=D.propsVerification;
$('verification').innerHTML='<div class="notice '+(V.effectiveStatus==='failed'?'bad':'')+'"><h3>道具运行报告 '+badge(V.effectiveStatus)+'</h3><p>原报告 '+esc(V.reportedStatus||'缺失')+' · '+esc(V.summary.passed??0)+' / '+esc(V.summary.total??0)+' cases；当前选项清单预期 '+esc(V.expectedCases)+' cases。<a href="props-verification.json">查看报告</a></p><p>'+esc(V.note)+'</p><details><summary>输入新鲜度 / hash</summary><pre>'+esc(JSON.stringify({fresh:V.fresh,checks:V.freshness,current:V.currentModuleHash,report:V.reportModuleHash,manifest:V.manifestModuleHash,missingCases:V.missingCases,errors:V.errors},null,2))+'</pre></details></div>';
const U=D.propsUiVerification;
$('verification').insertAdjacentHTML('beforeend','<div class="notice"><h3>已有 UI 报告 '+esc(U.reportedStatus||'缺失')+'</h3><p>'+U.runtimeVerified+' / '+D.props.length+' 件逐项通过 · errors '+esc(Array.isArray(U.errors)?U.errors.length:'未提供')+' · mobileOverflow '+esc(U.mobileOverflow??'未提供')+' · 截图存在 '+D.gallery.imagesExist+' / '+D.gallery.total+'。<a href="props-ui-verification.json">UI 原报告</a></p><p>'+esc(U.bindingNote)+'</p><p class="small">'+esc(U.scope)+'</p></div>');
$('gate-list').innerHTML=D.gateDefinitions.map(g=>'<article class="gate"><h3>'+esc(g.label)+'</h3><p class="small">'+esc(g.requirement)+'</p></article>').join('');
$('host').innerHTML='<strong>最小整机宿主，不是棚拍场</strong><p>'+esc(D.runtimeContract.minimumFullHost)+'</p><p>'+esc(D.runtimeContract.boundary)+'</p>'+list(D.runtimeContract.locks);
options('group-status',D.groups.map(g=>g.status.code));options('prop-status',D.props.map(p=>p.status));options('component-category',D.components.map(c=>c.category));
function renderGroups(){const q=$('group-query').value,s=$('group-status').value;const groups=D.groups.filter(g=>search(g,q)&&(!s||g.status.code===s));$('group-count').textContent=groups.length+' / '+D.groups.length+' 类';$('group-list').innerHTML=groups.map(g=>'<details class="group" id="group-'+esc(g.id)+'"><summary><h3>'+esc(g.title)+'</h3>'+badge(g.status.code)+'<p>'+esc(g.status.detail)+'</p><div class="small">技术可复刻 · 当前未完整验收 · '+g.componentIds.length+' 个管理条目</div></summary><div class="group-body"><div class="sources">'+g.source.map(a=>'<code title="'+esc(a.path)+'">'+esc(a.symbol)+' '+(a.found?'L'+a.line+':C'+a.column:'未定位')+'</code>').join('')+'</div><div class="columns"><div><h4>完整制作条件</h4>'+list(g.conditions)+'<h4>最小宿主</h4><p>'+esc(g.minimumHost)+'</p><h4>Package API</h4>'+list(g.package.api)+'<p class="small">'+esc(g.package.apiNote)+'</p><h4>生命周期 / 失败要求</h4>'+list(g.lifecycleRequirements)+'</div><div><h4>验收 test</h4>'+list(g.acceptanceTests)+'<h4>技术可行性 ≠ 完成度</h4><p>'+esc(g.technicalFeasibility.originalCode)+'</p><p>'+esc(g.technicalFeasibility.crossEngine)+'</p><h4>限制</h4>'+list(g.limitations)+'</div></div><h4>六门当前证据</h4><div class="tablewrap"><table><tbody>'+g.gates.map(v=>'<tr><td>'+esc(D.gateDefinitions.find(x=>x.id===v.id).label)+'</td><td>'+badge(v.status)+'</td><td>'+esc(v.detail)+'</td></tr>').join('')+'</tbody></table></div><h4>证据分层</h4>'+g.evidence.map(e=>'<p><code>'+esc(e.kind)+'</code> '+badge(e.status)+' '+esc(e.detail)+'</p>').join('')+'<p class="small">'+esc(g.technicalFeasibility.rights)+'</p></div></details>').join('')||'<p class="empty">没有匹配项；可清空检索或状态筛选。</p>';}
function renderProps(){const q=$('prop-query').value,s=$('prop-status').value;const rows=D.props.filter(p=>search([p.name,p.propId,p.builder,p.optionKeys,p.materialDependencies],q)&&(!s||p.status===s));$('prop-count').textContent=rows.length+' / '+D.props.length+' 件';$('prop-rows').innerHTML=rows.map(p=>'<tr><td><a href="'+esc(p.href)+'">'+esc(p.name)+'</a><br><code>'+esc(p.propId)+'</code><br>'+esc(p.builder||'未登记')+'</td><td>'+badge(p.status)+'<br>'+p.verification.passed+' / '+p.verification.cases+' cases<br><span class="small">完整验收：未完成</span></td><td>'+esc(p.optionKeys.join(' / ')||'无 manifest 选项')+'<br><span class="small">动态采样 '+p.verification.dynamicSamples+'；'+esc(JSON.stringify(p.dynamicHooks))+'</span></td><td>'+esc(p.previewWiring.declared||'未声明')+'<br>'+esc(p.previewWiring.bundled?'台账/包声明已接':'待主线程接线/刷新')+'<br><span class="small">'+esc(p.previewWiring.runtimeVerified?'已有逐件 UI 运行证据通过':'UI 未通过/未执行')+' · '+esc(p.previewWiring.versionBound?'版本已绑定':'未绑定当前模块版本')+'</span></td><td><a href="#group-props" data-open="props">完整条件 / API / test</a><br><a href="props-verification.json">实读报告</a><br>'+esc(p.limitations.join(' '))+'</td></tr>').join('')||'<tr><td colspan="5" class="empty">无匹配道具。</td></tr>';renderGallery(rows);}
function renderGallery(rows){$('gallery-count').textContent=rows.length+' / '+D.props.length+' 件 · '+D.gallery.imagesExist+' 张主图存在';$('gallery-cards').innerHTML=rows.map(p=>'<article class="gallery-card" data-prop="'+esc(p.propId)+'">'+(p.image.exists?'<a class="gallery-original" href="'+esc(p.image.href)+'"><img src="'+esc(p.image.href)+'" alt="'+esc(p.name)+' · 已有页面截图（未全部人工视觉验收）" loading="lazy" decoding="async" width="640" height="440"></a>':'<p class="empty">截图文件缺失</p>')+'<div class="gallery-info"><h3><a class="gallery-asset" href="'+esc(p.href)+'">'+esc(p.name)+'</a></h3><code>'+esc(p.propId)+'</code><p class="gallery-metrics">'+esc(p.uiEvidence.meshes??'未记录')+' mesh · '+esc(p.uiEvidence.vertices??'未记录')+' vertices · '+esc(p.uiEvidence.triangles??'未记录')+' tri<br>'+p.verification.passed+' / '+p.verification.cases+' 结构/所测变体 cases</p><p>'+badge(p.status)+'</p><div class="gallery-links">'+(p.image.exists?'<a href="'+esc(p.image.href)+'">查看原图</a>':'')+'<a href="'+esc(p.href)+'">打开资产</a><a href="props-ui-verification.json">UI 报告</a></div>'+(p.variantImages.length?'<p class="small">已有变体图：'+p.variantImages.map(v=>'<a href="'+esc(v.href)+'">'+esc(v.href)+'</a>').join(' · ')+'</p>':'')+'<p class="small">'+esc(p.previewWiring.runtimeVerified?'程序操作通过；非全部人工视觉':'未取得有效 UI 通过证据')+' · '+esc(p.previewWiring.versionBound?'UI 版本已绑定':'UI 未绑定 module 版本')+'</p></div></article>').join('')||'<p class="empty">无匹配道具；请清空上方筛选。</p>';}
function renderComponents(){const q=$('component-query').value,cat=$('component-category').value;const rows=D.components.filter(c=>search(c,q)&&(!cat||c.category===cat));$('component-count').textContent=rows.length+' / '+D.components.length+' 条';$('component-rows').innerHTML=rows.map(c=>'<tr><td><a href="'+esc(c.href)+'">'+esc(c.name)+'</a><br><code>'+esc(c.id)+'</code><details><summary>本组件条件 / 参数</summary>'+list(c.specificConditions)+'<pre>'+esc(JSON.stringify(c.catalogParameters,null,2))+'</pre><p class="small">参数为原台账记录，语义/单位仍须核对真实消费点；host / API / test / 可行性 / 限制见右侧所属契约。</p></details></td><td>'+esc(c.category+' / '+c.sub)+'<br><span class="small">'+esc(c.sourceAnchor||'见所属矩阵')+'</span></td><td>'+badge(c.status)+'<br><span class="small">非完整成品认证</span></td><td><a href="#group-'+esc(c.groupId)+'" data-open="'+esc(c.groupId)+'">'+esc(D.groups.find(g=>g.id===c.groupId).title)+'</a><br><span class="small">来源 / 结构 / 依赖 / 动态事件 / 生命周期 / 分层证据</span></td></tr>').join('')||'<tr><td colspan="4" class="empty">无匹配组件。</td></tr>';}
for(const id of ['group-query','group-status'])$(id).addEventListener('input',renderGroups);
for(const id of ['prop-query','prop-status'])$(id).addEventListener('input',renderProps);
for(const id of ['component-query','component-category'])$(id).addEventListener('input',renderComponents);
$('expand').onclick=()=>document.querySelectorAll('.group').forEach(g=>g.open=true);$('collapse').onclick=()=>document.querySelectorAll('.group').forEach(g=>g.open=false);
document.addEventListener('click',e=>{const a=e.target.closest('[data-open]');if(!a)return;$('group-query').value='';$('group-status').value='';renderGroups();const g=$('group-'+a.dataset.open);if(g)g.open=true;});
$('evidence-list').innerHTML=D.evidenceFiles.map(e=>'<p>'+(e.exists?'<a href="'+esc(e.href)+'">'+esc(e.path)+'</a>':'<span>'+esc(e.path)+' · 缺失</span>')+'</p>').join('');$('limits').innerHTML=D.limitations.map(x=>'<li>'+esc(x)+'</li>').join('');
$('integration').textContent='加载 <script src="assets/alignment-audit.js"><'+'/script>\n数据 window.ALIGNMENT_AUDIT\n简单链接 outputs/full-alignment-audit.html\n路由 #/alignment：'+(D.integration.routeImplemented?'app.js 已接入（静态检测）':'未检测到接入')+'\n再生成 python3 tools/build_alignment_audit.py\n顺序 '+D.integration.order;
$('schema-fields').textContent=JSON.stringify({schemaVersion:D.schemaVersion,fields:D.integration.fields,pathRule:D.integration.pathRule,statusLabels:D.statusLabels},null,2);
$('footer').textContent='基准 '+D.meta.source.sha256+' · '+D.generatedAt+' · '+D.meta.protectedFiles;
renderGroups();renderProps();renderComponents();
}
</script></body></html>
'''


def main():
    parser = argparse.ArgumentParser(description='重建中文全组件对标审计与 window.ALIGNMENT_AUDIT 纯数据。')
    parser.add_argument('--root', type=Path, default=ROOT, help='资产库根目录')
    parser.add_argument('--source', type=Path, default=SOURCE, help='锁定原版 HTML')
    args = parser.parse_args()
    root = args.root.resolve()
    for directory in ['assets', 'outputs']:
        if not (root / directory).is_dir():
            raise SystemExit('输出父目录不存在：' + str(root / directory))
    data = build(root, args.source)
    payload = json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    (root / 'assets/alignment-audit.js').write_text('window.ALIGNMENT_AUDIT = ' + payload + ';\n')
    (root / 'outputs/full-alignment-audit.html').write_text(HTML)
    print(json.dumps({'groups': len(data['groups']), 'components': len(data['components']), 'props': len(data['props']),
                      'sourceHashMatches': data['meta']['source']['hashMatches'], 'propsReport': data['propsVerification']['reportedStatus'],
                      'effectiveStatus': data['propsVerification']['effectiveStatus'], 'fresh': data['propsVerification']['fresh'],
                      'structuralCases': data['propsVerification']['summary'], 'uiRuntimeVerified': data['propsUiVerification']['runtimeVerified'],
                      'uiVersionBound': data['propsUiVerification']['versionBound'], 'gallery': data['gallery'],
                      'routeImplemented': data['integration']['routeImplemented']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
