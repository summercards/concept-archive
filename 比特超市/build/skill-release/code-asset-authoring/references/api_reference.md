# 原创程序化资产 API 与入库契约

## 1. 先识别根目录与宿主

- 将本 skill 当作跨项目的用户级能力，不把 skill 所在目录当作项目根目录。
- 将 `/Users/zyq/WorkBuddy/2026-11-15-17-10-04` 仅当作文档中已知的 CODE ASSET LEDGER 定位；执行时始终显式传入 `--root`，不得静默回退到此路径或当前工作目录。
- 只读取指定 root 内与任务直接相关的入口、registry、modeling-kit、材质和构建/预览接口。校验真实路径及符号链接；禁止通过 source、输出目录或链接越出 root，禁止扫描相邻项目自动寻找“正确”仓库。
- 联合检查网页标题/入口、`assets/authored/registry.json`、`tools/build_authored.py`、modeling-kit 与原版资产隔离关系。不能仅凭一个同名文件确认项目；缺失时报告不匹配并请求确认，不擅自初始化其他项目。
- 下文描述当前已完成接口。先用 doctor 识别目标 root；签名或路径不一致时报告 root 不匹配，不臆造宿主方法，不改脚本或项目实现。

## 2. 模块边界与构造入口

把独立纯 JavaScript 模块放到项目 `assets/authored/<slug>.js`，只允许以下单一导出；将 helpers 全部定义在 build 内，不增加 import、其他导出或顶层 helper。工厂不隔离恶意代码，只加载可信本地源码：

```js
export function build(ctx, options = {}) {
  throw new Error('尚未实现几何');
}
```

完成几何后返回一个 `THREE.Object3D`（通常为 `ctx.THREE.Group`）。禁止以空 Group、占位盒或复制原版整机源码代替完成的原创设计。把 `assets/model-template.js` 当作未实现脚手架，而不是可验收样品。

### ctx

| 字段 | 使用约定 |
| --- | --- |
| `ctx.THREE` | 使用宿主注入的同一 Three.js 实例；不要自行 import 第二个版本。 |
| `ctx.kit` | 使用宿主 modeling-kit；逐项核对实际参数和返回值。 |
| `ctx.mats` | 使用 `get`、`label`、`decal`、`number`、`emissive` 能力；名称、签名、缓存归属以宿主实现为准。 |
| `ctx.rng` | 调用宿主提供、已按当前构建 seed 初始化的确定性随机函数；不要假定存在 `.seed()` 等扩展。 |
| `ctx.sharedMaterials` | 由宿主维护的 Set，用于追踪共享材质；只读取，不由作者写入、清空、删除或替换，不伪造追踪结果。 |

不假定存在 `ctx.register`；由 registry 与构建器负责登记，不在 build 内注册全局条目。不要在模块顶层访问 DOM、修改全局 THREE、启动计时器、拉取远程依赖或执行随机构造。

### 返回对象

使用模型局部坐标填写以下 `root.userData`。此处值为形状示意，不能作为占位完成数据：

```js
root.userData.assetId = 'new.slug';
root.userData.authored = true;
root.userData.size = [width, height, depth];
root.userData.colliders = [{ min: [xmin, ymin, zmin], max: [xmax, ymax, zmax], surface: 'metal' }];
root.userData.sockets = { mount: { position: [x, y, z] } };
```

- 使用米制、Y 向上、`origin: 'bottom-center'`、`forward: '+Z'`；尺寸数组顺序为 X 宽、Y 高、Z 深。静置包围范围通常为 `[-w/2, 0, -d/2]` 至 `[w/2, h, d/2]`；装配突出件与活动范围必须在契约另行声明。
- 将 `contract.size` 作为默认状态的名义尺寸；每次 build 及影响 bbox 的动态更新后，从真实几何计算当前 `root.userData.size`，不能把默认 size 复制到所有变体上。
- 在 `contract.variantEnvelopes` 数组中以 `{options: {...}, min: [...], max: [...], size?: [...]}` 声明变体包络；使用模型局部坐标、finite min/max 和正跨度。options 描述对应变体条件，未改变的选项沿用默认；可选 size 描述该变体目标尺寸，不填写时仍以真实 bbox 计算 userData.size。
- 对照默认名义尺寸与匹配变体的包络检查真实 bbox、碰撞八角和偏移，不强制拉出抽屉后仍保持默认深度或 Z 居中。不能用过大包络掩盖尺寸错误；实际选项覆盖与误差以报告为准。
- 为 collider 提供 finite 的 min/max 三元组、各轴严格正跨度和有效 surface 标识；按使用功能拆分，不让粗略实心碰撞堵住需要进入的开口或可用层板空间。
- 为 socket 提供具名位置，按需要约定旋转/朝向和用途；未对齐宿主前不要混用 Euler、四元数或角度单位。没有挂点时显式填写 `{}` 并在契约解释。
- 给可验收结构设置稳定且唯一的 `Object3D.name`；确保 `requiredParts` 可经 `getObjectByName` 查到实际几何节点或包含几何的部件组。

### options 与生命周期

- 在设计契约声明 `options` 的类型、默认值、允许值和尺寸影响。让非法输入明确失败，不静默替换成“看起来能用”的版本。
- 使用 `options.seed` 作为宿主播种请求；由宿主在每次 build 前重新提供隔离的 `ctx.rng`。模型不要二次随机播种。未实现此宿主约定时停止 seed 验收并报告接口缺口。
- 在同 seed、同 options、同版本环境中生成相同几何、材质分配和元数据。禁止使用 `Math.random()`、时间或跨次 build 的可变全局状态。
- 动态资产把生命周期 hooks 挂在返回对象的 `userData` 上：`root.userData.update(dt)`、`root.userData.reset()`，按资源所有权可提供 `root.userData.dispose()`；不要把 hooks 直接挂在 Object3D 本体，也不要同时维护两套会重复执行的方法。
- 使用秒作为 dt；由宿主驱动 update，不在 build 内启动 RAF/Interval。reset 恢复所有部件变换、动态状态、碰撞与挂点，不推进随机序列；dispose 清理本资产独占资源及监听，允许重复调用而不误释放共享缓存。
- 通过 options 或宿主已存在的交互入口切换开门/指示灯状态；不要为每帧运动重建 geometry、material 或纹理。
- 静态资产无需伪造 hooks。动态 hooks、碰撞更新策略和宿主调用顺序必须在运行报告中写明，不能仅凭方法存在判通过。

## 3. modeling-kit：能力与已知陷阱

只按实际源码确定下列工具的参数；不要把名称表当作可直接复制的函数签名。

| 能力 | 使用边界 |
| --- | --- |
| `metricBox` | 为米制平面表面建立合适 UV；仍检查实际纹理密度及方向。 |
| `bevelBox` | 做有尺度依据的倒角；检查倒角法线、轮廓和预算。 |
| `cylinder`、`tube` | 构造销轴、管线、把手等；检查端盖、径向分段、接头和接缝。 |
| `place` | 组合局部变换；核对位置/旋转单位和父子空间。 |
| `vertexColor` | 使用顶点色；保留宿主材质的 vertexColors 配置。 |
| `merge`、`batch` | 仅处理允许静态合批的几何；保留材质组及追溯信息。 |
| `Builder`、`annotate` | 构造与标注部件；保持 requiredParts 的可查性。 |
| `planeUV` | 显式修复表面 UV；先核对平面方向、米制缩放与调用签名。 |

### Builder

- 处理 `Builder.group` 的材质 override 时先经宿主材质解析流程得到实际 Material，再向下传递；不要把字符串或 descriptor 当 Material 写入 mesh。检查组级 override 是否错误覆盖玻璃、发光件、贴花等专用材质。
- 识别 `Builder.box` 在 `r0` 路径使用裸 `BoxGeometry` 的情况：默认 0–1 UV 不等于米制 UV。新资产必须显式使用 `kit.metricBox`、`kit.planeUV` 或按实测修正 UV，不能因旧资产也使用此路径而豁免。
- 对门、抽屉、指示灯、可拆部件及 requiredParts 节点保留名称与层级。使用宿主支持的 `noMerge` 标记/等效保留机制，并验证最终产物仍可查询；不要假定某个尚未核对的属性一定被合批器识别。

### 材质与贴花

- 优先复用 `ctx.mats` 的缓存材质；不要为每个 mesh 无条件 clone。
- 注意 `Material.clone()` 不复制自定义 `onBeforeCompile`。确需独立材质时，通过宿主已有材质工厂重建或显式保留着色钩子及 program cache key 约定，验证最终着色；不能只比较材质名称。
- 禁止在模型 dispose 中释放 `ctx.mats` 缓存材质、`ctx.sharedMaterials` 追踪的共享材质、共享纹理或宿主资源；不由作者向 Set 添加材料以伪装资源所有权。只释放明确由当前构建独占创建的 geometry/material/texture；共享 geometry 同样遵守所有权规则。
- 以米为依据声明纹理重复、标签实际尺寸、朝向、边距和表面偏移；检查斜视角浮空、穿插、z-fighting、镜像文字及烘焙贴图缺失。
- 将贴花用于标签、刻度、污迹和适量表面信息；不要用贴花掩盖本应影响轮廓的门缝、开口、厚度、把手或连接件。

## 4. registry 与网页接入

将以下记录加入项目 `assets/authored/registry.json` 的 `assets` 数组；文件根对象必须是 `{ "schemaVersion": 1, "assets": [] }`。先读现有文件并检查 id/source 冲突，保留其他资产。将 `slug.js` 解析为 authored 目录内的相对文件名，拒绝绝对路径和目录穿越。

```json
{
  "schemaVersion": 1,
  "assets": [{
    "id": "new.slug",
    "source": "slug.js",
    "name": "原创资产名称",
    "summary": "描述实际设计与用途，不宣称已验收",
    "tags": ["原创", "设施"],
    "contract": {
      "units": "m",
      "size": [1.2, 1.8, 0.5],
      "origin": "bottom-center",
      "forward": "+Z",
      "qualityTier": "catalog",
      "materials": ["待按宿主核实的材质标识"],
      "requiredParts": ["body", "door.left", "door.right"],
      "options": {},
      "variantEnvelopes": [],
      "collidersRequired": true,
      "baseline": {
        "type": "new-design",
        "referenceAssets": []
      }
    },
    "acceptance": {
      "catalog": "unverified",
      "geometry": "unverified",
      "visual": "unverified",
      "runtime": "unverified"
    }
  }]
}
```

- 用 `assets/asset-contract.template.json` 整理完整设计契约；把其中 `registryEntry` 作为一个对象追加到 `assets`，不写入 `entries`，也不把整个模板包写进 registry。
- 完整契约放在 `assets/authored/contracts/<slug>.json`，按顶层 assetId 关联条目；脚手架和静态检查已按此路径工作。
- 在 contract.baseline.referenceAssets 中填写实际检查过的可信对照资产 id；记录其功能、尺度、相机与证据，不用未检查的名称填满列表。原创对照是质量比较，不是原版逐点复制。
- 由项目 `tools/build_authored.py` 从 registry/source 生成 `assets/authored.js`，暴露 `window.AUTHORED_BUILDERS[id] = { build }` 和 `AUTHORED_CATALOG.items`。核对 mainapp 的 NEW 分类条目按 `item.kind === 'authored'` 分派预览；不要让模块自己修改全局 catalog。
- 不手改生成的 `assets/authored.js`；不改 generated `data.js`、extractprops 基线、原版源码及 original hash。将 `build_authored.py` 理解为“仅面向可信本地源码的静态约束；不是安全沙箱”；工厂不隔离恶意代码。保留 source，拒绝覆盖已有源文件。
- 打包、构建成功或产生 catalog 条目不代表验收通过。registry 只保留 `unverified`；真正证据由独立 report hash 绑定。当前 builder 拒绝非 unverified 状态，后续专门签证流程尚未实现，不能在当前版本手写 PASS。

## 5. 已完成命令与验证边界

以下命令已由 skill 内脚本与项目构建器提供。先确认显式 root 属于目标 CODE ASSET LEDGER 项目，再执行；不擅自改脚本或宿主，不把命令成功等同于验收通过。将示例分阶段执行，不从 scaffold 直接跳到验证：在 scaffold 与 check 之间实现模型、填全契约，否则 runtime 理应报未实现。check 只静态检查，不生成 `assets/authored.js`；必须 check 后显式构建再 verify，不默认提前 pack 未完成资产。

```bash
SKILL_DIR="/Users/zyq/.workbuddy/skills/code-asset-authoring"
ROOT="/已明确确认的/CODE-ASSET-LEDGER根目录"
ID="new.harbor-repair-cabinet"
PLAYWRIGHT="/绝对路径/node_modules/playwright"
OUT_PARENT="$ROOT/reports/authored"  # 该父目录必须已存在
OUT_DIR="$OUT_PARENT/$ID"      # 该目录必须是 root 内不存在的新目录

python3 "$SKILL_DIR/scripts/asset_author.py" doctor --root "$ROOT"
python3 "$SKILL_DIR/scripts/asset_author.py" doctor --root "$ROOT" --playwright "$PLAYWRIGHT"
python3 "$SKILL_DIR/scripts/asset_author.py" scaffold --root "$ROOT" --id "$ID" --name "港区双门维修柜" --size "1.2,1.8,.5" --materials "paint_grey,steel_dark" --parts "body,frame,door.left,door.right"
# 在此暂停：实现 source，填全契约与 requiredParts；否则 runtime 理应报未实现。
python3 "$SKILL_DIR/scripts/asset_author.py" check --root "$ROOT" --id "$ID"
python3 "$ROOT/tools/build_authored.py" --root "$ROOT"
# 确认构建成功、预览服务服务于该 root、输出父目录存在，再执行 verify。
node "$SKILL_DIR/scripts/verify_asset.cjs" --root "$ROOT" --id "$ID" --base-url "http://127.0.0.1:8099/index.html" --playwright "$PLAYWRIGHT" --out-dir "$OUT_DIR"
# 只在模型完成且证据已生成后按需打包，不默认提前打包未完成资产。
python3 "$SKILL_DIR/scripts/asset_author.py" pack --root "$ROOT" --id "$ID" --output "$ROOT/outputs/authored-harbor-repair-cabinet.zip" --evidence "$OUT_DIR/report.json"
```

| 命令 | 实际职责与边界 |
| --- | --- |
| `asset_author.py doctor --root [--playwright <绝对路径>]` | 静态、只读识别 root、网页、registry、Three revision、Node/Acorn 与可选 Playwright；不构造资产、不运行浏览器验收、不安装依赖、不扫描其他项目；检查 ready/errors。 |
| `asset_author.py scaffold --root --id [--name --size '1.2,1.8,.5' --materials ... --parts ...]` | 创建 draft source、契约和 registry `assets` 条目，拒绝覆盖；初始 acceptance 全为 `unverified`。 |
| `asset_author.py check --root --id` | **静态 only**：校验 schema、路径、契约基本一致性与源码约束，调用 builder `--check`；不执行 build、不生成 authored.js，不证明设计契约全部完成或 runtime/visual 通过。 |
| `python3 "$ROOT/tools/build_authored.py" --root "$ROOT"` | 在 check 后生成 authored.js，再供真实页面验证；保留 source，不把构建成功解释为验收。 |
| `asset_author.py pack --root --id [--output <root 内不存在的新 zip>] [--evidence <root 内已存在文件，可重复>]` | 静态检查、构建并打单资产 ZIP；不代表验收、不 setpass、不替代 skill packaging。不默认用它提前打包未完成资产；仅面向可信本地源码的静态约束；不是安全沙箱。 |
| `verify_asset.cjs --root <root> --id <id> --playwright <绝对 package path> --out-dir <root 内新目录> [--base-url <url>]` | **动态/运行验证**：真实执行 build、有限 geometry/runtime 检查与截图采集；base URL 默认 `http://127.0.0.1:8099/index.html`，visual 始终 `UNVERIFIED`，不回写 acceptance。 |

`verify_asset.cjs` 的 `--playwright` 必须跟绝对 package path，不能写 bare flag；`--out-dir` 的父目录必须已存在，目标目录必须是 root 内全新目录。report 的 normalized hash 用于独立证据绑定；当前没有专门签证流程，registry 保持 `unverified`。

区分报告的有限自动检查与完整质量标准：检查 finite attributes、单位法线、索引/退化面、bbox/元数据、requiredParts、collider 八角及 socket 数值、同默认 options 重建、每个选项的一个非默认代表值（若存在）、若干 update/reset/dispose 调用、重复挂载与 console。具体执行及变化以当次 report 为准；这些不证明全部 UV 品质、所有选项值/组合、完整运动边界、资源所有权或内存回收。脚本不提供完整 memory proof；额外覆盖须单独执行并记录，不能把未执行检查列为自动 PASS。

### 变体包络形状示例

```json
{
  "variantEnvelopes": [{
    "options": {"drawerOpen": 0.12},
    "min": [-0.6, 0, -0.25],
    "max": [0.6, 1.8, 0.37],
    "size": [1.2, 1.8, 0.62]
  }]
}
```

只用此例解释 `contract.variantEnvelopes` 的字段形状，不将抽屉参数塞入维修柜契约。按实际变体重新测量；size 可省略，min/max 不可省略。默认名义 size 不随该示例覆盖，当前 userData.size 始终来自真实 bbox。
