---
name: code-asset-authoring
description: 为 CODE ASSET LEDGER 网页自动触发新建原创代码资产（静态/动态模型、道具、设施、部件），处理变体、材质贴花、独立预览/入库/验收；新材质与动态能力按宿主实际支持执行，未来能力明确标记缺口，不虚称覆盖全部投影。适用于维修柜、灭火器站、工作台等新设计，默认使用原生代码建模；原版复刻另调用 jimao-original-game-replication。
agent_created: true
---

# CODE ASSET LEDGER 原创资产制作

## 明确范围与能力路由

- 为新增原创设计建立真实几何与设计契约，使其达到网页真实结构、表面尺度和预览检验标准；不要用涂色空盒、名义尺寸或占位 Group 冒充完成品。
- 默认用纯 JavaScript 与宿主 Three.js/modeling-kit 制作。按实际宿主能力处理静态/动态部件、变体、材质、贴花、碰撞和挂点；如实标记新材质或未来能力缺口。
- 遇到原版复刻、迁移、恢复原构造或要求与原版逐点一致时，另调用 `jimao-original-game-replication`；不要用原创标准替代复刻标准。
- 仅在需要概念参考时调用 ImageGen，并标注其不是可用几何或验收证据。仅在用户明确要求 3D AI 或 Blender 时加载对应技能，不默认改走外部模型生成。
- 独立编写原创几何，不复制版权不明的原版源码到 skill 模板。

## 先识别项目，限制改动边界

1. 取得用户明确指定的项目根目录；对支持 root 的命令始终显式传入 `--root`，不得自动采用当前目录。
2. 将 `/Users/zyq/WorkBuddy/2026-11-15-17-10-04` 仅作为已知项目的文档定位，不作为跨项目执行默认值。
3. 只在明确 root 内联合核对网页入口、registry、modeling-kit、材质及构建器；发现路径/符号链接越界或项目不匹配时停止，不扫描其他项目。
4. 先读将改文件，保留现有 id、source 和用户改动。不改 generated `data.js`、extractprops baseline、original hash 或原版提取链，不手改生成的 authored 输出。
5. 将构建器限制理解为“仅面向可信本地源码的静态约束；不是安全沙箱”。工厂不隔离恶意代码，不加载不可信源码；路径与 AST 检查不能替代安全隔离。

读取 [API 与入库契约](references/api_reference.md)，按已实现接口执行；发现实际接口差异时停止并报告，不擅自修改脚本或宿主。

## 执行制作流程

### 1. 写设计契约，再构造几何

- 读取 [质量标准](references/quality-standard.md)，复制并填写 [契约模板](assets/asset-contract.template.json)。将完整契约关联到 assetId，只把 registryEntry 放入 registry 根对象 `{schemaVersion: 1, assets: []}` 的 `assets` 数组。
- 明确米制尺寸、轴原点、轮廓、功能件、开口/厚度、连接装配、板缝、门锁、米制 UV、材质、碰撞、挂点、变体、seed、动态、LOD 与预算；未知项不能当通过，不适用项说明理由。
- 将 `contract.size` 作为默认状态名义尺寸；用 `contract.variantEnvelopes` 数组声明变体的 `options/min/max` 与可选 `size`。每次构建/更新后让 `userData.size` 反映当前真实 bbox，不机械复制默认尺寸。
- 从指定 root 内选择可信质量对照，实测功能层级、物理尺度、真实预览与成本后制定预算，不套统一三角形或厚度阈值。
- 使用 `baseline.type: 'new-design'`，用 design contract 与质量对照检验原创，不要求与原版逐点差异为零。

### 2. 实现纯代码模型

- 从 [模型脚手架](assets/model-template.js) 开始，仅允许单一导出 `export function build(ctx, options = {})`；保留 `options` 标识以符合 AST 约束，把 helpers 放在 build 内，不增加其他导出或顶层 helper。
- 在 scaffold 与 check 之间实现模型并填全契约。默认模板抛出“尚未实现几何”；若不替换，runtime 理应报未实现，即使静态 check 通过也不能称完成。
- 使用 `ctx.THREE`、`ctx.kit`、`ctx.mats`、确定性 `ctx.rng`；不假定存在 `ctx.register`，不 import 第二套 Three.js。
- 尊重由宿主维护的 `ctx.sharedMaterials` Set：宿主用它追踪共享材质，作者不得写入、删除、清空或伪造追踪；不释放共享材质及纹理，只回收明确独占资源。
- 返回带真实几何的 `THREE.Object3D`，填写 `userData.assetId`、`authored: true`、真实 bbox `size`、`colliders[{min,max,surface}]`、`sockets{name:{position:[...]}}`；采用米制、Y 向上、底面中心原点、+Z 正面。
- 按功能分层构造外壳、内腔、支撑、门/抽屉及五金，不用贴花代替影响轮廓、开口或厚度的结构。
- 保留 requiredParts 的名称与层级；对活动节点使用宿主支持的 noMerge/保留机制，确保合批后可查询及运动。
- 处理 `Builder.group` override 时先解析材质；识别 `Builder.box` r0 裸 BoxGeometry 的非米制 UV，使用 `metricBox`、`planeUV` 或显式修 UV。
- 不逐 mesh clone 材质，不假定 clone 复制 `onBeforeCompile`。动态 hooks 仅挂在 `root.userData.update(dt)/reset()/dispose()`，dt 使用秒；不自启 RAF/计时器。
- 声明 options/seed 规则并核查确定性，不使用 Math.random、时间依赖或跨 build 可变状态。

### 3. 静态检查、生成产物，再独立预览

- 在 registry 的 `assets` 中登记 `new.<slug>`、相对 source `<slug>.js`、name/summary/tags/contract/acceptance；完整契约保存到 root 内的 `assets/authored/contracts/<slug>.json`。
- 保持 acceptance 的 catalog/geometry/visual/runtime 全为 `unverified`；当前 builder 拒绝非 unverified 状态，不手写 PASS。真实证据由独立 report hash 绑定，专门签证流程尚未实现。
- 实现 source 并填全契约后先运行静态 check，再执行项目构建命令生成 `assets/authored.js`，之后才运行 verify。check 不生成该文件，不能省略构建；不要默认先 pack 一个未完成资产。
- 核对生成的 `window.AUTHORED_BUILDERS[id] = { build }`、`AUTHORED_CATALOG.items` 与 mainapp NEW 分类中条目的 `item.kind === 'authored'` 预览分派。
- 学习 skill 自带的 [workbench 源码](assets/workbench-example.js) 和 [entry/契约样本](assets/workbench-example.entry.json)，不要自动注册为用户成品。样本自动检查记录与限制见质量标准，不把旧记录当当前签证。

### 4. 区分自动检查与补充验收

- 区分 r160 catalog 棚拍与 r180 full-scene 门。原版 36 props 的 M3/Yg 基线不等于新资产完成数；r180 整机待恢复，不宣称两环境等价。
- 使用 verify 执行有限的 geometry/runtime 自动检查并采集截图；按实际 report 列出已执行项，不将完整 UV 品质、所有选项组合、全生命周期或内存回收列成自动通过。
- 按质量标准另行检查结构厚度、米制 UV/贴花、变体覆盖矩阵、完整动态边界、共享资源、内存趋势与 LOD/预算；未执行项明确列出。
- 保存真实三角度材质 PNG、clay/wire PNG 及必要近景/动态/变体图，实际打开并按契约与可信对照检查。截图成功不等于视觉通过，脚本 visual 始终 `UNVERIFIED`；人工结论单独记录，不改 registry 或覆盖自动报告。

## 使用实际命令，保持执行顺序

替换下列 root、Playwright 与输出路径占位值；确认预览服务实际服务于该 root，不猜测其他项目端口。下列分阶段示例不是一键执行脚本。

```bash
SKILL_DIR="/Users/zyq/.workbuddy/skills/code-asset-authoring"
ROOT="/已明确确认的/CODE-ASSET-LEDGER根目录"
ID="new.harbor-repair-cabinet"
PLAYWRIGHT="/绝对路径/node_modules/playwright"
OUT_PARENT="$ROOT/reports/authored"  # 确认此父目录已存在
OUT_DIR="$OUT_PARENT/$ID"           # 必须为 root 内不存在的新目录

python3 "$SKILL_DIR/scripts/asset_author.py" doctor --root "$ROOT" --playwright "$PLAYWRIGHT"
python3 "$SKILL_DIR/scripts/asset_author.py" scaffold --root "$ROOT" --id "$ID" --name "港区双门维修柜" --size "1.2,1.8,.5" --materials "paint_grey,steel_dark" --parts "body,frame,door.left,door.right"
# 在此暂停：实现 source，填全契约及实际 requiredParts；否则 runtime 理应报未实现。
python3 "$SKILL_DIR/scripts/asset_author.py" check --root "$ROOT" --id "$ID"
python3 "$ROOT/tools/build_authored.py" --root "$ROOT"
# 确认构建成功、预览服务可用及输出父目录已存在后，再运行动态验证。
node "$SKILL_DIR/scripts/verify_asset.cjs" --root "$ROOT" --id "$ID" --base-url "http://127.0.0.1:8099/index.html" --playwright "$PLAYWRIGHT" --out-dir "$OUT_DIR"
# 最后按需打包；证据须已存在，ZIP 必须为 root 内新文件，pack 不是验收。
python3 "$SKILL_DIR/scripts/asset_author.py" pack --root "$ROOT" --id "$ID" --output "$ROOT/outputs/authored-harbor-repair-cabinet.zip" --evidence "$OUT_DIR/report.json"
```

- `doctor --root [--playwright <absolute>]`：静态、只读识别项目与依赖，不构造资产或运行浏览器测试；检查 ready/errors，不仅看进程退出。
- `scaffold --root --id [--name --size --materials --parts]`：创建 draft source、contract 与 registry asset，拒绝覆盖，不完成几何。
- `check --root --id`：静态 only，调用 builder 的 `--check`，不执行 authored build、不生成 authored.js、不验 runtime/visual。
- `pack --root --id [--output <root 内新 zip>] [--evidence <root 内已有文件，可重复>]`：静态检查、构建与单资产 ZIP，不代表验收，不 setpass。优先使用独立构建命令准备预览，不以提前打包替代制作。
- `verify_asset.cjs --root --id --playwright <absolute package path> --out-dir <root 内新目录> [--base-url <url>]`：动态/运行验证；base URL 默认 `http://127.0.0.1:8099/index.html`。Playwright 参数必须有绝对路径值，out-dir 父目录须已存在、目标须不存在。只认实际报告覆盖范围，不提供完整 memory proof，不自动回写 acceptance。

## 正式入库是制作完成的必要条件

- 将用户要求制作完成的资产写入目标项目正式 `assets/authored/registry.json` 并重新构建；不只留在隔离测试目录、技能样例或交付截图里。隔离测试可以先跑，但不能代替入库。
- 核对首页“原创资产 / 最近制作”、NEW 分类、搜索和独立详情均能找到该资产；实际打开模型并检查原材质、灰模、线框和选项。完成后给出能直接打开的网页链接。
- 将源码、完整契约和独立验收报告链接在详情中体现；使用当前构建器支持的 `evidence: {report: 'outputs/项目内报告.html或json'}`，只引用真实已生成报告，不因登记而自动签 PASS。
- 仅在用户明确要求实验、不入库或丢弃草稿时保留为隔离产物；用户后来要求把已制作示例入库时，先重新验证当前源码，不沿用旧测试结论。

## 响应请求与交付

> 使用 code-asset-authoring 制作一个 1.2×1.8×0.5m 双门维修柜，带内腔、层板、铰链、锁把和可开合双门，保存进此资产库。

将尺寸理解为宽 X × 高 Y × 深 Z，先确认显式 root 和动态需求，再建立设计契约；类似处理灭火器站、工作台或部件，不套用全部维修柜结构。

- 交付 source、registry 变更、完整 contract、测试报告、三角度/clay/wire PNG 及必要补图，列出精确路径与实际命令。
- 分开汇报自动结果、人工视觉结论与未执行项；保留 report hash、失败原因和未覆盖范围，不自动更新 acceptance。
- 明确 r180 full-scene 是否执行，不将 catalog 结果等同整机等价；不创建额外 README。
