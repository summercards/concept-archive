window.ALIGNMENT_AUDIT = {
  "schemaVersion": "1.1.0",
  "generatedAt": "2026-11-16T04:53:03.052577+00:00",
  "meta": {
    "title": "几猫原版 · 全组件对标审计",
    "source": {
      "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
      "bytes": 1425707,
      "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "expectedSha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "hashMatches": true
    },
    "managedEntries": 283,
    "propCount": 36,
    "groupCount": 11,
    "completedProducts": null,
    "countNote": "283 是管理条目，不是 283 件成品；道具与建模器重复登记同一资产，参数/配方/流程亦计数。完整成品数未认证。",
    "scope": "静态读码 + 现有运行报告索引。本生成器不运行 GPU、游戏、音频或玩法验收。",
    "protectedFiles": "不写 app.js / previews.js / assets/modules.js / inventory / props 实现。"
  },
  "statusLabels": {
    "pending": "待接入",
    "partial": "局部实现",
    "reference": "参数/流程展示",
    "verified_scope": "限定范围通过",
    "stale": "待重跑",
    "failed": "验证失败",
    "unexecuted": "未执行",
    "complete": "完整验收完成"
  },
  "gateDefinitions": [
    {
      "id": "source",
      "label": "01 来源 / hash",
      "requirement": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。"
    },
    {
      "id": "structure",
      "label": "02 全部资产结构",
      "requirement": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。"
    },
    {
      "id": "runtime",
      "label": "03 运行依赖 / 锁版本",
      "requirement": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。"
    },
    {
      "id": "behavior",
      "label": "04 变体 / 动态 / 数值事件",
      "requirement": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。"
    },
    {
      "id": "lifecycle",
      "label": "05 生命周期 / 失败",
      "requirement": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。"
    },
    {
      "id": "evidence",
      "label": "06 分层证据",
      "requirement": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。"
    }
  ],
  "runtimeContract": {
    "baseline": "three@0.180.0 / 原内嵌 r180；WebGL2 + GLSL3/MRT + HDR/depth；保留许可注释",
    "current": "vendor THREE r160（以运行报告 revision 为证）；不是原 r180 整机",
    "locks": [
      "源 hash 与生成文件 hash",
      "THREE revision / ShaderChunk / 自定义 cache key",
      "字体/viewport/DPR/画质冷启动/纹理尺寸/seed/dt/相机/帧号",
      "GPU/浏览器/OS/音频设备与 sampleRate"
    ],
    "minimumFullHost": "原字节完整 HTML 的 QC 正式路径 + r180；模块化宿主还须保留 Hg/Gg/d3/Yg/C1/Eb/O1/Cf/c_/v_/x_/zv/dm/Em/hM/mM 的依赖与帧序。",
    "boundary": "原版完整宿主是必要基准，不表示当前资产库已接成整机；独立几何棚拍只可验证局部。"
  },
  "propsVerification": {
    "path": "outputs/props-verification.json",
    "href": "props-verification.json",
    "reportedStatus": "PASS",
    "effectiveStatus": "verified_scope",
    "fresh": true,
    "freshness": {
      "source": true,
      "module": true,
      "caseCoverage": true,
      "manifestSource": true,
      "packedModule": true
    },
    "summary": {
      "total": 116,
      "passed": 116,
      "failed": 0,
      "maxError": 0,
      "relayDynamicCases": 5,
      "allRawGeometryCompared": true,
      "optionCaseCount": 44
    },
    "startedAt": "2026-11-16T04:38:04.117Z",
    "completedAt": "2026-11-16T04:38:35.840Z",
    "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
    "currentModuleHash": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
    "reportModuleHash": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
    "manifestModuleHash": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
    "expectedCases": 116,
    "missingCases": [],
    "errors": [],
    "scope": {
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "original": "完整原版 IIFE；仅在固定原 hash 与精确尾部检查确认的最后 QC().catch(...) 启动语句位置移除尾部 statement，并在同一 IIFE 尾部注入 __PropsReference={build:Yg,matsFactory:Gg,THREE:lt,registry:Xg,sizes:Gi}。原文件未修改。",
      "current": "http://127.0.0.1:8099/index.html",
      "isolation": "只在验证浏览器内将 previews.js/app.js 响应替换为空；仍执行当前已打包 assets/modules.js，避免页面预览抢先构造并污染原版 wf 全局缓存。不改磁盘或实现。",
      "currentInjection": "若页面未加载 props-builder/container-builder，则仅用 page.addScriptTag 在浏览器内去掉 import/export 后注入 IIFE；未写回 assets/modules.js、app.js 或其他文件。",
      "buildEntrypoints": "原版严格调用 Yg({mats}).build(id, options)；当前严格调用 window.ASSET_MODULES[\"props-builder\"].buildProp(ctx, id, options)。",
      "cases": "36 个道具各跑 default 与 seed=1，并按 props-source.json optionKeys 为实际消费的每个关键选项生成独立 case；未凭空添加选项。",
      "comparison": "逐 mesh/逐层级顺序比较 position/normal/uv/color/index 原始 array、local/world matrix、bbox、完整 material slot 特征、碰撞/userData、灯位置；不是统计量或静态 hash 代替。",
      "materials": "原版 label/decal/number 保留真实 Gg 返回的 l3 服务，未替换为占位贴花；两侧 get 均为按同名缓存的确定 MeshStandardMaterial（白色、roughness=.7、metalness=.1），不是完整 Gg 纹理烘焙视觉验证。emissive 严格按原 Gg 的 MeshBasicMaterial({color:new Color(color).multiplyScalar(intensity),toneMapped:true}), name=\"emissive\" 实现。",
      "dynamic": "relay_node 对 live/cutting/cut 各采样 dt=0/0.016/0.1；检查 setState、update、level/beacon/interact、dynamic noMerge 与逐样本结构。",
      "fallback": "原版 console.warn/error、对象标记和模块 checked build 均捕获；任一 fallback、异常或构造失败都会使 case 失败，不静默降级。"
    },
    "readiness": {
      "original": {
        "revision": "180",
        "required": {
          "Vector2": true,
          "Vector3": true,
          "BoxGeometry": true,
          "CylinderGeometry": true,
          "CatmullRomCurve3": true,
          "TubeGeometry": true,
          "Quaternion": true,
          "Matrix4": true,
          "Euler": true,
          "BufferGeometry": true,
          "BufferAttribute": true,
          "Mesh": true,
          "Group": true,
          "MeshStandardMaterial": true,
          "MeshBasicMaterial": true,
          "CanvasTexture": true,
          "PlaneGeometry": true,
          "MathUtils": true
        },
        "hasYg": true,
        "hasMatsFactory": true,
        "service": {
          "label": true,
          "decal": true,
          "number": true,
          "emissive": true,
          "labelName": "label",
          "decalName": "decal_hazard_voltage",
          "numberName": "decal_numbers_0_9",
          "emissiveName": "emissive"
        }
      },
      "current": {
        "revision": "160",
        "required": {
          "Vector2": true,
          "Vector3": true,
          "BoxGeometry": true,
          "CylinderGeometry": true,
          "CatmullRomCurve3": true,
          "TubeGeometry": true,
          "Quaternion": true,
          "Matrix4": true,
          "Euler": true,
          "BufferGeometry": true,
          "BufferAttribute": true,
          "Mesh": true,
          "Group": true,
          "MeshStandardMaterial": true,
          "MeshBasicMaterial": true,
          "CanvasTexture": true,
          "PlaneGeometry": true,
          "MathUtils": true
        },
        "hasModule": true,
        "injected": {
          "props": false,
          "container": false
        },
        "service": {
          "label": true,
          "decal": true,
          "number": true,
          "emissive": true,
          "labelName": "label",
          "decalName": "decal_hazard_voltage",
          "numberName": "decal_numbers_0_9",
          "emissiveName": "emissive"
        }
      },
      "engineDifference": {
        "original": "r180",
        "current": "r160",
        "note": "仅记录引擎差异；不宣称材质、后期或像素一致。"
      }
    },
    "unexecuted": [],
    "note": "旧 PASS 不能穿透模块/hash/选项变更；生成器只实读，不修改验证报告。不将 report PASS 升格为完整复刻。"
  },
  "propsUiVerification": {
    "path": "outputs/props-ui-verification.json",
    "href": "props-ui-verification.json",
    "reportedStatus": "PASS",
    "reportedTotal": 36,
    "rows": 36,
    "matchedProps": 36,
    "runtimeVerified": 36,
    "errors": [],
    "readError": null,
    "mobileOverflow": 0,
    "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
    "versionBound": true,
    "hashChecks": {
      "source": true,
      "generated": true,
      "packedModule": true,
      "manifest": true,
      "container": true,
      "app": true,
      "previews": true,
      "data": true
    },
    "reportedInputHashes": {
      "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
      "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
      "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
      "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
      "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
      "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
      "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
    },
    "currentInputHashes": {
      "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
      "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
      "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
      "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
      "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
      "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
      "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
    },
    "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
    "scope": "实读主线程现有 UI 报告，不是本生成器新执行的 UI 测试。"
  },
  "gallery": {
    "total": 36,
    "imagesExist": 36,
    "variantImages": 6,
    "manualVisualReview": false,
    "columns": 3,
    "lazyLoading": true
  },
  "groups": [
    {
      "id": "props",
      "title": "道具 · 36 件真实构建器",
      "conditions": [
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "status": {
        "code": "verified_scope",
        "complete": false,
        "detail": "36 件道具已接完整专用构造器。结构与所测变体结论实读 props-verification.json；逐件页面接线/操作证据实读 props-ui-verification.json。GPU 材质、最终整机呈现与完整生命周期仍待验收。 当前结构报告：PASS；输入新鲜度：匹配。UI 报告：PASS。UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "source": [
        {
          "symbol": "Yg",
          "found": true,
          "line": 5453,
          "column": 15649,
          "signature": "function Yg(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "M3",
          "found": true,
          "line": 5453,
          "column": 33336,
          "signature": "function M3(i,e,t=",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "zA",
          "found": true,
          "line": 5453,
          "column": 24884,
          "signature": "function zA(i,e,t,n,s)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "J3",
          "found": true,
          "line": 5453,
          "column": 100763,
          "signature": "function J3(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "eb",
          "found": true,
          "line": 5453,
          "column": 109675,
          "signature": "function eb(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "sb",
          "found": true,
          "line": 5453,
          "column": 130988,
          "signature": "function sb(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "B3",
          "found": true,
          "line": 5453,
          "column": 61318,
          "signature": "function B3(i,e=",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "props-builder",
          "container-builder"
        ],
        "api": [
          "现有：createPropService(ctx).build(id, options)",
          "现有：buildProp(ctx, id, options)；ctx.mats={get,label,decal,number,emissive}",
          "集装箱：buildContainer(ctx,id,options)；动态对象 userData.update/setState 由宿主调度"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "几何宿主可用注入 THREE + mats 服务；正式外观必须进入 r180 原完整 render/mats/level/ground 链，不以棚拍代替整机。",
      "acceptanceTests": [
        "对原 Yg 独立 IIFE 与模块逐数组/层级/矩阵/碰撞比较，捕获 fallback。",
        "每件 default/seed 与实际选项；三箱额外六变体/开门/磨损组合；中继三状态与时间点。",
        "原材质 GPU 对照、近中远截图、碰撞行走、缓存与销毁仍须另验。"
      ],
      "limitations": [
        "结构对比使用同名简化 get 材质，不证明 GPU 纹理或最终外观一致。",
        "门/货叉主要是构建姿态；无可驾驶叉车或交互式物理门承诺。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "verified_scope",
          "detail": "逐 mesh/逐层级顺序比较 position/normal/uv/color/index 原始 array、local/world matrix、bbox、完整 material slot 特征、碰撞/userData、灯位置；不是统计量或静态 hash 代替。",
          "paths": [
            "outputs/props-verification.json"
          ]
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "verified_scope",
          "detail": "relay_node 对 live/cutting/cut 各采样 dt=0/0.016/0.1；检查 setState、update、level/beacon/interact、dynamic noMerge 与逐样本结构。",
          "paths": [
            "outputs/props-verification.json"
          ]
        },
        {
          "kind": "image",
          "status": "verified_scope",
          "detail": "36/36 截图存在；36/36 程序操作通过，但非全部人工视觉审阅，非 GPU 材质/最终整机比对。UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
          "paths": [
            "outputs/props-ui-verification.json",
            "outputs/prop-container20.png",
            "outputs/prop-container40.png",
            "outputs/prop-container40hc.png",
            "outputs/prop-jersey_barrier.png",
            "outputs/prop-light_mast.png",
            "outputs/prop-fence_panel.png",
            "outputs/prop-guard_booth.png",
            "outputs/prop-gate_arm.png",
            "outputs/prop-bollard_mooring.png",
            "outputs/prop-bollard_post.png",
            "outputs/prop-relay_node.png",
            "outputs/prop-shelf_rack.png",
            "outputs/prop-stairs_metal.png",
            "outputs/prop-catwalk.png",
            "outputs/prop-reefer_unit.png",
            "outputs/prop-barrel.png",
            "outputs/prop-pallet.png",
            "outputs/prop-pallet_stack.png",
            "outputs/prop-crate_wood.png",
            "outputs/prop-crate_stack.png",
            "outputs/prop-ibc_tote.png",
            "outputs/prop-forklift.png",
            "outputs/prop-cable_reel.png",
            "outputs/prop-tire_stack.png",
            "outputs/prop-dumpster.png",
            "outputs/prop-generator.png",
            "outputs/prop-jerry_can.png",
            "outputs/prop-traffic_cone.png",
            "outputs/prop-gas_cylinders.png",
            "outputs/prop-tarp_cargo.png",
            "outputs/prop-sandbags.png",
            "outputs/prop-toolbox_cart.png",
            "outputs/prop-floodlight_stand.png",
            "outputs/prop-cardboard_boxes.png",
            "outputs/prop-pipe_stack.png",
            "outputs/prop-sign_post.png"
          ],
          "versionBound": false,
          "uiVersionBound": true,
          "manualVisualReview": false
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "verified_scope",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "仅限报告实际 cases；不覆盖全变体笛卡尔积或整机材质。"
        },
        {
          "id": "structure",
          "status": "verified_scope",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "仅限报告实际 cases；不覆盖全变体笛卡尔积或整机材质。"
        },
        {
          "id": "runtime",
          "status": "partial",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "独立道具 UI 报告 36/36；UI 报告输入 hash 与当前 source/module/packedModule 匹配。 原 r180 整机运行链仍待验收。"
        },
        {
          "id": "behavior",
          "status": "verified_scope",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "仅限报告实际 cases；不覆盖全变体笛卡尔积或整机材质。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "partial",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "结构/所测变体与 UI 截图有证据；全族 GPU、整机、生命周期和全部人工视觉未完成。"
        }
      ],
      "componentIds": [
        "prop.container20",
        "prop.container40",
        "prop.container40hc",
        "prop.jersey_barrier",
        "prop.light_mast",
        "prop.fence_panel",
        "prop.guard_booth",
        "prop.gate_arm",
        "prop.bollard_mooring",
        "prop.bollard_post",
        "prop.relay_node",
        "prop.shelf_rack",
        "prop.stairs_metal",
        "prop.catwalk",
        "prop.reefer_unit",
        "prop.barrel",
        "prop.pallet",
        "prop.pallet_stack",
        "prop.crate_wood",
        "prop.crate_stack",
        "prop.ibc_tote",
        "prop.forklift",
        "prop.cable_reel",
        "prop.tire_stack",
        "prop.dumpster",
        "prop.generator",
        "prop.jerry_can",
        "prop.traffic_cone",
        "prop.gas_cylinders",
        "prop.tarp_cargo",
        "prop.sandbags",
        "prop.toolbox_cart",
        "prop.floodlight_stand",
        "prop.cardboard_boxes",
        "prop.pipe_stack",
        "prop.sign_post",
        "build.container20",
        "build.container40",
        "build.container40hc",
        "build.jersey_barrier",
        "build.light_mast",
        "build.fence_panel",
        "build.guard_booth",
        "build.gate_arm",
        "build.bollard_mooring",
        "build.bollard_post",
        "build.sign_post",
        "build.floodlight_stand",
        "build.stairs_metal",
        "build.catwalk",
        "build.shelf_rack",
        "build.reefer_unit",
        "build.relay_node",
        "build.barrel",
        "build.pallet",
        "build.pallet_stack",
        "build.crate_wood",
        "build.crate_stack",
        "build.ibc_tote",
        "build.cable_reel",
        "build.tire_stack",
        "build.jerry_can",
        "build.traffic_cone",
        "build.gas_cylinders",
        "build.pipe_stack",
        "build.tarp_cargo",
        "build.sandbags",
        "build.cardboard_boxes",
        "build.forklift",
        "build.generator",
        "build.dumpster",
        "build.toolbox_cart"
      ]
    },
    {
      "id": "geometry",
      "title": "几何、合批与碰撞",
      "conditions": [
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "status": {
        "code": "partial",
        "complete": false,
        "detail": "7 个原语条目与模型工具可管理/运行；d3/ob/By 的正式关卡碰撞、导航、合批链并未因几何预览而完成。"
      },
      "source": [
        {
          "symbol": "$e",
          "found": true,
          "line": 4191,
          "column": 58594,
          "signature": "function $e(i,e,t,n=\"center\")",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Wi",
          "found": true,
          "line": 4191,
          "column": 58918,
          "signature": "function Wi(i,e,t,n=.02,s=\"center\")",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "ot",
          "found": true,
          "line": 4191,
          "column": 59818,
          "signature": "function ot(i,e,t,n=16,s=!1,o=\"center\")",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Fn",
          "found": true,
          "line": 4191,
          "column": 60121,
          "signature": "function Fn(i,e=.03,t=8,n=!1,s=0)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Dc",
          "found": true,
          "line": 4191,
          "column": 60481,
          "signature": "function Dc(i,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Lc",
          "found": true,
          "line": 4191,
          "column": 60702,
          "signature": "function Lc(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Ii",
          "found": true,
          "line": 4191,
          "column": 60949,
          "signature": "function Ii(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "By",
          "found": true,
          "line": 4191,
          "column": 61594,
          "signature": "function By(i,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "d3",
          "found": true,
          "line": 5453,
          "column": 7032,
          "signature": "function d3(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "ob",
          "found": true,
          "line": 5453,
          "column": 131251,
          "signature": "function ob(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "modeling-kit",
          "props-builder"
        ],
        "api": [
          "现有 modeling-kit 导出以代码为准；不把它当 d3 SDK。",
          "原版契约：physics.addBox/raycast/lineOfSight/groundHeight/moveCapsule/nav",
          "原版 ob.place(name,x,z,yaw,opts,y,flags)；拟封装时保留入参顺序"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "r180 + 几何工具 + mats + d3；先构建实体/盒，再 physics.build；导航不能从最终合批网格反推。",
      "acceptanceTests": [
        "逐基元属性数组、索引、UV 米密度与变换对照。",
        "旋转薄盒、楼梯/猫道、顶棚起身、bulletOnly/playerOnly 与导航阻挡专项。",
        "合批前后材质/shadow/layer/noMerge、placed 与碰撞数量一致。"
      ],
      "limitations": [
        "Gi 不等于实测 bbox；碰撞是近似 AABB，不是精确三角网格。",
        "单层 XZ A*，不具多层 NavMesh 或通用刚体系统。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "geo.metricBox",
        "geo.bevelBox",
        "geo.cylinder",
        "geo.tube",
        "geo.place",
        "geo.vertexColor",
        "geo.merge"
      ]
    },
    {
      "id": "materials",
      "title": "材质、GPU 烘焙与贴花",
      "conditions": [
        "原 MRT sqrt(albedo)+A / ORM / height；平方还原、毫米 bump→normal、sRGB 与数据纹理必须区分。",
        "原尺寸 min(tex,1024)*size，hero 特例；核对当前 base 尺寸、colorSpace、缓存缺 scale 和三平面 UV 差异。",
        "漆面 A 为残漆权重；ORM=R AO/G rough/B metal；保留湿润/宏观脏污、铁丝网 alpha、图集与字体刷新。"
      ],
      "status": {
        "code": "partial",
        "complete": false,
        "detail": "29 配置族/48 实例、27 surf 函数与真实 l3 Canvas 贴花可见；baker 是 r160 三遍适配，尚无全族 GPU 对比证据。"
      },
      "source": [
        {
          "symbol": "Gg",
          "found": true,
          "line": 5453,
          "column": 225,
          "signature": "async function Gg(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "h3",
          "found": true,
          "line": 5450,
          "column": 76,
          "signature": "function h3(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "l3",
          "found": true,
          "line": 5294,
          "column": 2675,
          "signature": "function l3(i,e=4)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "rb",
          "found": true,
          "line": 5453,
          "column": 136145,
          "signature": "function rb(i,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "material-ledger",
          "material-baker",
          "container-builder"
        ],
        "api": [
          "现有：createBaker(THREE,renderer,ledger,{tex,wet}) → bake/material/set/stats/wet/dispose",
          "现有：createDecalService({canvasFactory},opts) → label/decal/number",
          "原版：await Gg(ctx)；mats.get/label/decal/number/emissive"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "r180 WebGL2/MRT + Gg/h3/l3/rb + 原天空/PMREM/探针/完整输出；r160 仅适配分支，不能预设像素等价。",
      "acceptanceTests": [
        "各族/实例/seed/分辨率的 albedo/ORM/height/normal GPU readback 与 metadata 比对。",
        "scale/interior/triplanar/color 缓存隔离；湿干/掠射/近远/alpha 专项截图。",
        "编译错误、目标状态恢复、字体就绪、重复创建与 dispose 检查。"
      ],
      "limitations": [
        "源码中的“唯一差异/逐像素相同”注释不是实测证明。",
        "通用 asphalt/water 不是正式地面/海面的替代；玻璃无物理折射链。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "matf.asphalt",
        "matf.concrete",
        "matf.brick",
        "matf.epoxy",
        "matf.paint",
        "matf.hull",
        "matf.galv",
        "matf.metal",
        "matf.brushed",
        "matf.rust",
        "matf.diamond",
        "matf.corrugated",
        "matf.chainlink",
        "matf.hazard",
        "matf.gunmetal",
        "matf.anodized",
        "matf.polymer",
        "matf.carbon",
        "matf.fabric",
        "matf.armor",
        "matf.wood",
        "matf.plastic",
        "matf.tarp",
        "matf.cardboard",
        "matf.rope",
        "matf.tire",
        "matf.glass",
        "matf.glass_dirty",
        "matf.water",
        "mat.asphalt",
        "mat.concrete",
        "mat.concrete_dirty",
        "mat.concrete_painted",
        "mat.brick",
        "mat.floor_epoxy",
        "mat.paint_red",
        "mat.paint_blue",
        "mat.paint_green",
        "mat.paint_yellow",
        "mat.paint_orange",
        "mat.paint_white",
        "mat.paint_grey",
        "mat.paint_teal",
        "mat.steel_galv",
        "mat.steel_dark",
        "mat.steel_worn",
        "mat.steel_bare",
        "mat.steel_rust",
        "mat.diamond_plate",
        "mat.corrugated_roof",
        "mat.chainlink",
        "mat.aluminium",
        "mat.brass",
        "mat.hazard_stripes",
        "mat.gunmetal",
        "mat.anodized_black",
        "mat.polymer_black",
        "mat.polymer_tan",
        "mat.rubber",
        "mat.carbon",
        "mat.glove_fabric",
        "mat.armor_white",
        "mat.armor_orange",
        "mat.wood_pallet",
        "mat.wood_dark",
        "mat.plastic_blue",
        "mat.plastic_red",
        "mat.plastic_grey",
        "mat.tarp",
        "mat.cardboard",
        "mat.rope",
        "mat.tire",
        "mat.glass",
        "mat.glass_dirty",
        "mat.hull_paint",
        "mat.hull_red",
        "mat.water_dark",
        "decal.hazard_flammable",
        "decal.hazard_voltage",
        "decal.hazard_general",
        "decal.arrow",
        "decal.no_entry",
        "decal.logo_a",
        "decal.logo_b",
        "decal.logo_c",
        "decal.logo_d",
        "decal.berth4",
        "decal.caution_stripes",
        "decal.grime_streak",
        "decal.rust_run",
        "decal.oil_stain",
        "decal.leak_stain",
        "decal.bullet_metal",
        "decal.bullet_concrete",
        "decal.scorch",
        "decal.crack",
        "decal.graffiti_tag",
        "decal.csc_plate",
        "decal.numbers_0_9"
      ]
    },
    {
      "id": "warehouse",
      "title": "仓库与关卡布局",
      "conditions": [
        "仓库 28×17m，檐 7/脊 9.5；门/百叶/8 处屋面缺口、办公室、货架、风扇与灯线完整。",
        "同一建筑同步可见网格、碰撞、interiorBoxes、skylights、雨盒/檐滴、探针与体积尘区。",
        "hR/fR 原摆放、箱列堆高、叉车托货、楼梯猫道连接点、出生/掩体/中继/撤离登记。"
      ],
      "status": {
        "code": "pending",
        "complete": false,
        "detail": "scene.level 与另外两个场景条目共用 envPreview 手工测试场；未接原 C1 仓库/箱列/关卡。"
      },
      "source": [
        {
          "symbol": "C1",
          "found": true,
          "line": 5453,
          "column": 170676,
          "signature": "async function C1(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "ab",
          "found": true,
          "line": 5453,
          "column": 138314,
          "signature": "function ab(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "hR",
          "found": true,
          "line": 5453,
          "column": 162580,
          "signature": "function hR(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "fR",
          "found": true,
          "line": 5453,
          "column": 168473,
          "signature": "function fR(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "ob",
          "found": true,
          "line": 5453,
          "column": 131251,
          "signature": "function ob(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [],
        "api": [
          "原版：await C1(ctx)；level.root/placed/interiorBoxes/skylights/playerStart/cinematicPath",
          "拟封装（未实现）：createLevelPackage(ctx) → level/update/reset/dispose；不得冒充现有 API"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "正式 Hg→Gg→d3/Yg→C1→Eb/O1→physics.build→onLevelReady；必须原版 r180 全链宿主。",
      "acceptanceTests": [
        "原入口/仓库内外/天窗/路线同机位截图；与原 placed、盒、缺口和材质清单核对。",
        "实际走通门、台阶、猫道；三中继与雨遮挡/光束/探针联动。"
      ],
      "limitations": [
        "手工棚拍场不等价于 C1；单个组件漂亮不能证明关卡整机一致。",
        "静态合批后不保留每个可见箱体 Mesh，须按 placed 追溯。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "scene.level"
      ]
    },
    {
      "id": "backdrop",
      "title": "船、吊机、岸线与远港",
      "conditions": [
        "岸线 X30、海面 -1.6、轨道 X18.5/28.5、梯 Z20、护舷/缆绳/泊位/碰撞与撤离同步。",
        "保留曲面船壳/艏艉收缩、船舱甲板、吊具/雷达/艇 hullGrp 层级；祖先 noMerge。",
        "固定 LCG 远港、简化吊机/货船/灯塔/海鸥与 update，不凭印象随机港区。"
      ],
      "status": {
        "code": "pending",
        "complete": false,
        "detail": "scene.backdrop 同样只是 envPreview；原吊机/船壳/艇/远港/海鸥与正式岸线未组成独立可复用包。"
      },
      "source": [
        {
          "symbol": "Eb",
          "found": true,
          "line": 5474,
          "column": 280,
          "signature": "function Eb(i,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "pv",
          "found": true,
          "line": 5474,
          "column": 2077,
          "signature": "async function pv(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "z1",
          "found": true,
          "line": 5460,
          "column": 808,
          "signature": "function z1(i,e,t=",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "vb",
          "found": true,
          "line": 5460,
          "column": 18367,
          "signature": "function vb(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "xb",
          "found": true,
          "line": 5460,
          "column": 28879,
          "signature": "function xb(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Mb",
          "found": true,
          "line": 5460,
          "column": 33848,
          "signature": "function Mb(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "wb",
          "found": true,
          "line": 5460,
          "column": 45022,
          "signature": "function wb(i,e,t=12)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "lb",
          "found": true,
          "line": 5453,
          "column": 157740,
          "signature": "var lb=",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "cb",
          "found": true,
          "line": 5453,
          "column": 157797,
          "signature": "function cb(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [],
        "api": [
          "原版：Eb/pv(ctx) 的 root/update 与船艇接口须从返回值封装",
          "拟封装（未实现）：createBackdropPackage(ctx) → root/update/dispose；保留 boat/crane/ship/skyline/gulls"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "C1 岸线 + Eb/pv + O1.seaHeight + Hg/mats/quality/time/rng；完整原版渲染。",
      "acceptanceTests": [
        "岸线、船艏、吊机、远港固定视角与原版对照；船壳数组/分块 AABB。",
        "按 t 采样吊具正弦、radar=t*1.9、艇层级摇摆、海鸥翼；缆绳与地面接缝。"
      ],
      "limitations": [
        "吊机仅轻摆，无操作吊装/钢索动力学；艇是正弦，不是真浮力。",
        "货船不整体随浪；远景是预制简化规则，不是自动 LOD。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "scene.backdrop"
      ]
    },
    {
      "id": "ground",
      "title": "正式地面、海、雨",
      "conditions": [
        "190×320 场坪至 X30；26 低洼点、蓄水/湿度/油污/磨损 mask、黄白线/轮痕与接缝。",
        "地面 Y0 镜像相机+oblique 裁剪与反射隐藏列表；海面 -1.6 自写大/小波、泡沫、环境反射。",
        "雨循环盒、室内盒/天窗/檐滴、雷事件、splash 关闭项与冷启动数量严格区分。"
      ],
      "status": {
        "code": "pending",
        "complete": false,
        "detail": "scene.ground 使用手工 envPreview；材质球和流程卡未恢复 O1 正式地面/反射/海浪/雨。"
      },
      "source": [
        {
          "symbol": "O1",
          "found": true,
          "line": 5825,
          "column": 2334,
          "signature": "async function O1(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Rb",
          "found": true,
          "line": 5474,
          "column": 4314,
          "signature": "function Rb(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Cb",
          "found": true,
          "line": 5474,
          "column": 5018,
          "signature": "function Cb(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Pb",
          "found": true,
          "line": 5474,
          "column": 6150,
          "signature": "function Pb(i,e=1)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Ib",
          "found": true,
          "line": 5654,
          "column": 3,
          "signature": "function Ib(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "zb",
          "found": true,
          "line": 5661,
          "column": 339,
          "signature": "function zb(i,e,t)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "B1",
          "found": true,
          "line": 5661,
          "column": 2256,
          "signature": "var B1=[[-.92,.39,9.5,.06],[-.75,-.66,5.7,.04],[-.99,.12,3.3,.026],[-.5,.87,2,.016]],Db=[[-.8,.6,1.3",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "kb",
          "found": true,
          "line": 5712,
          "column": 114,
          "signature": "function kb(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Nb",
          "found": true,
          "line": 5825,
          "column": 350,
          "signature": "function Nb(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [],
        "api": [
          "原版：await O1(ctx)；ground.root/update/seaHeight 与反射 pass 接 Hg",
          "拟封装（未实现）：createGroundPackage(ctx)；反射状态恢复、resize 与 dispose 必须显式"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "r180 Hg.renderWorld/depth + C1 interiorBoxes/skylights + mats/time/quality/rng + O1；不能用 Plane + asphalt 代替。",
      "acceptanceTests": [
        "mask/readback、标线和低洼坐标，干湿/积水掠射同机位截图。",
        "反射 belowY 禁用/隐藏列表/尺寸对齐；海浪 t 切片与雨穿屋顶测试。",
        "质量冷启动/resize/暂停/上下文失败与资源释放。"
      ],
      "limitations": [
        "地面不是完整几何位移；地面平面反射不是 SSR，也不是全海面反射。",
        "seaHeight 仅大波高度；没有雨水全局物理模拟或分叉闪电几何。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "scene.ground"
      ]
    },
    {
      "id": "weapon",
      "title": "武器、双手与程序动作",
      "conditions": [
        "w_ 七槽枪械、独立 bolt/mag/round、手掌/指节/袖套、右食指顶点插值与左手轨迹。",
        "世界 FOV74/layer0 与 view FOV54/layer1，depthRange(0,.05)，mi 枪口/抛壳/瞄具/握持挂点。",
        "30+150、720RPM、26/弱点2.2；换弹 .47/1.345/2.19 与 2.1/2.72s，数值和事件唯一提交。"
      ],
      "status": {
        "code": "reference",
        "complete": false,
        "detail": "weaponPreview 是数值/弹簧图，不是 PAC9 模型、双手、瞄具或完整动作；9 弹簧积分可跑不等于武器完成。"
      },
      "source": [
        {
          "symbol": "w_",
          "found": true,
          "line": 5939,
          "column": 113026,
          "signature": "function w_()",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Vv",
          "found": true,
          "line": 5939,
          "column": 133659,
          "signature": "function Vv(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "U_",
          "found": true,
          "line": 5939,
          "column": 140558,
          "signature": "function U_(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "TC",
          "found": true,
          "line": 5939,
          "column": 137834,
          "signature": "function TC()",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "F_",
          "found": true,
          "line": 5939,
          "column": 139530,
          "signature": "function F_(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "dm",
          "found": true,
          "line": 6065,
          "column": 540,
          "signature": "async function dm(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "ma",
          "found": true,
          "line": 6065,
          "column": 348,
          "signature": "function ma(i,e,t)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "weapon-tuning"
        ],
        "api": [
          "现有：weapon-tuning spring/integrate/WEAPON/RELOAD，只有参数与积分",
          "原版：await dm(ctx)；weapon.update/reset 等以返回对象为准",
          "拟封装（未实现）：createWeaponPackage(ctx)，不能把 chart API 当模型 API"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "r180 render 双相机 + player/input/combat/events/time/mats/fx/audio；dm 必须进入原主循环阶段。",
      "acceptanceTests": [
        "枪体/手几何、层级挂点、ADS 0/.09/.18 与换弹关键帧截图/视频。",
        "实际输入开火/空仓/打断/检视/重试，ammo/reserve 及事件日志同录。",
        "眼射线判伤与枪口曳光分开；60/30/20fps 短枪焰与音画同步。"
      ],
      "limitations": [
        "仅单武器、无玩家全身/导入手臂动画、换枪或掉落弹匣刚体。",
        "原有旧矩阵/一帧时序、reset 不完全与低帧率枪焰限制需记账，不静默修正。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "num.weapon",
        "weapon.pac9",
        "spring.kickZ",
        "spring.kickPitch",
        "spring.kickYaw",
        "spring.kickRoll",
        "spring.swayYaw",
        "spring.swayPitch",
        "spring.jumpY",
        "spring.jumpPitch",
        "spring.bump"
      ]
    },
    {
      "id": "actors",
      "title": "敌人、程序骨骼与四足 IK",
      "conditions": [
        "iu/pm 单骨骼权重蒙皮，飞鸥 body/rotor/gimbal/gun、猎犬 body/head/turret/四腿层级完整。",
        "猎犬站高 .72、腿长 .4/.42、支撑足世界锁定、对角摆腿、头/枪瞄准与天线弹簧。",
        "Em 感知/令牌/池/导航/命中体；飞鸥移动弹体与猎犬即时射线不同；死亡/残骸/声源回收。"
      ],
      "status": {
        "code": "reference",
        "complete": false,
        "detail": "actor.gull/hound 是 AI 参数图，未抽出 SkinnedMesh/Skeleton、程序构件、解析 IK 与行为动画。"
      },
      "source": [
        {
          "symbol": "pm",
          "found": true,
          "line": 6065,
          "column": 17740,
          "signature": "function pm(i,e,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "j_",
          "found": true,
          "line": 6065,
          "column": 27888,
          "signature": "function j_()",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Z_",
          "found": true,
          "line": 6065,
          "column": 20381,
          "signature": "function Z_()",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "q_",
          "found": true,
          "line": 6065,
          "column": 18792,
          "signature": "function q_(i,e,t,n,s,o,r,a)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Q_",
          "found": true,
          "line": 6065,
          "column": 33159,
          "signature": "function Q_(i,e,t,n)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "iM",
          "found": true,
          "line": 6065,
          "column": 43744,
          "signature": "function iM(i,e,t,n)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Em",
          "found": true,
          "line": 6065,
          "column": 60905,
          "signature": "async function Em(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "ai-tuning"
        ],
        "api": [
          "现有：ai-tuning.TUNING/validate 仅数值",
          "原版：await Em(ctx)；spawn/update/raycast/reset 等以真实返回值核对",
          "拟封装（未实现）：createEnemyPackage(ctx)，另保骨架绑定与行为所有权"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "完整 physics/nav/player/combat/events/time/fx/audio/render/mats 与池初始化；不能以普通旋转模型替代。",
      "acceptanceTests": [
        "骨骼 bind pose、skinIndex/skinWeight、几何与命中体对照。",
        "步态/台阶/转弯/预警/攻击/受损/死亡连续视频及脚点/事件日志。",
        "池满、旧残骸回收、暂停重置、最近六声源虚拟化与 60/30/20fps。"
      ],
      "limitations": [
        "程序死亡非 ragdoll；近似胶囊/球命中非精确网格。",
        "没有全身玩家模型、多层 NavMesh 或外部动作片段；扑击近似要保留说明。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "num.ai",
        "actor.gull",
        "actor.hound"
      ]
    },
    {
      "id": "render",
      "title": "光影、后期与视听 FX",
      "conditions": [
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "status": {
        "code": "reference",
        "complete": false,
        "detail": "env8 / fx13 主要是数值/流程卡与手工测试场；局部灯光/后期演示不等于 Hg/jy/Cf 原主管线。"
      },
      "source": [
        {
          "symbol": "Hg",
          "found": true,
          "line": 4744,
          "column": 10852,
          "signature": "async function Hg(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "jy",
          "found": true,
          "line": 4743,
          "column": 4,
          "signature": "function jy(i,e,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Hy",
          "found": true,
          "line": 4296,
          "column": 427,
          "signature": "function Hy(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Vy",
          "found": true,
          "line": 4296,
          "column": 759,
          "signature": "function Vy(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "qy",
          "found": true,
          "line": 4296,
          "column": 1864,
          "signature": "function qy(i,",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "Cf",
          "found": true,
          "line": 5939,
          "column": 16946,
          "signature": "async function Cf(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "env-atmosphere",
          "quality-presets"
        ],
        "api": [
          "现有：env-atmosphere.install/shadowFrustum/createLightPool；quality-presets 数值",
          "原版：await Hg(ctx)；render.frame/renderWorld/onLevelReady/setQuality；await Cf(ctx)",
          "拟封装（未实现）：createRenderPackage/createFxPackage；需要显式 render graph/resize/dispose"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "完整 r180 Hg + ShaderChunk 补丁 + WebGL2/HalfFloat/depth/MRT + 原世界与双相机；棚拍只作诊断层。",
      "acceptanceTests": [
        "固定 viewport/DPR/q/seed/cam/帧，原入口/箱道/室内/岸线截图；记录 advanced/stubs/errors。",
        "各 pass/depth/readback、wet/planar/post 单项开关；真实事件粒子/灯/弹孔采样。",
        "forward/软阴影 fallback 单独记降级，GPU/分辨率/帧时不能混报。"
      ],
      "limitations": [
        "无 SSR/SSGI/实时 GI/完整 DOF/TAA；动模是相机重投影非物体速度。",
        "渲染注释/参数字段不证明已启用；ready 或一张棚拍不能证明整机。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "fx.bloom",
        "fx.streak",
        "fx.dirt",
        "fx.flare",
        "fx.ca",
        "fx.vignette",
        "fx.agx",
        "fx.adapt",
        "fx.motion",
        "fx.vol",
        "fx.ao",
        "fx.planar",
        "fx.rain",
        "env.world",
        "env.sun",
        "env.sky",
        "env.fog",
        "env.shadow",
        "env.lamps",
        "env.exposure",
        "env.probe",
        "q.test",
        "q.low",
        "q.medium",
        "q.high",
        "q.ultra"
      ]
    },
    {
      "id": "audio",
      "title": "音效、环境混音与五层音乐",
      "conditions": [
        "保留噪声/滤波/包络/模态 DSP、固定 seed 变体、o_ 归一与 generator 分步合成。",
        "near/world/amb/dry/music 总线、双 IR/双枪尾、声部优先级/抢占/虚拟化/duck/用户手势。",
        "100BPM 五层音乐，19.2/9.6s，全部 ready 后同 currentTime+.08 起播；动作/任务事件时间表。"
      ],
      "status": {
        "code": "reference",
        "complete": false,
        "detail": "57 条 Go 配方的 gen 是字符串；未连接 DSP 生成器、AudioBuffer、运行混音/空间声源与可听播放。"
      },
      "source": [
        {
          "symbol": "c_",
          "found": true,
          "line": 5939,
          "column": 70898,
          "signature": "async function c_(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "u_",
          "found": true,
          "line": 5939,
          "column": 71155,
          "signature": "function u_(i,e,t)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "r_",
          "found": true,
          "line": 5939,
          "column": 68996,
          "signature": "function r_(i,e=0,t)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "a_",
          "found": true,
          "line": 5939,
          "column": 69171,
          "signature": "function a_(i,e=0,t)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "KR",
          "found": true,
          "line": 5939,
          "column": 40586,
          "signature": "function KR(i,e,t)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "G8",
          "found": true,
          "line": 5939,
          "column": 59928,
          "signature": "function*G8(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "audio-recipes"
        ],
        "api": [
          "现有：RECIPES/RECIPE_IDS/byBus/busLoad/voiceBudget，均非播放 API",
          "原版：audio.resume/play/loop/update/ready/selfTest/setIntensity/setInterior/setVolume/setPaused/debug",
          "拟封装（未实现）：createAudioPackage(ctx)，loop 句柄 setPos/setGain/setPitch/stop"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "WebAudio + c_/u_ + 全 DSP 依赖/Go/Fr + camera/interiorBoxes/events/game/time；独立宿主也需真实手势和可录音输出。",
      "acceptanceTests": [
        "每配方/变体离线 peak/over/nan/rms、接缝与 sampleRate；保留 IR 与双声道。",
        "真实手势后录音并听辨开火/换弹/脚步/室内外/混音/音乐强弱。",
        "未 ready 超时、抢占/池满、暂停/隐藏/恢复/重启循环释放与相位检查。"
      ],
      "limitations": [
        "配方、AudioContext=running 或静音冒烟都不能证明有声。",
        "radio:line 只有文字，无对白配音；不得凭字幕补造配音。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "sfx.rifle_shot",
        "sfx.rifle_tail_out",
        "sfx.rifle_tail_in",
        "sfx.rifle_dry",
        "sfx.reload_magout",
        "sfx.reload_magin",
        "sfx.reload_bolt",
        "sfx.shell_bounce",
        "sfx.step_concrete",
        "sfx.step_water",
        "sfx.step_metal",
        "sfx.land",
        "sfx.jump",
        "sfx.hurt",
        "sfx.ear_ring",
        "sfx.impact_metal",
        "sfx.impact_concrete",
        "sfx.impact_wood",
        "sfx.impact_water",
        "sfx.impact_enemy",
        "sfx.impact_glass",
        "sfx.whiz",
        "sfx.ricochet",
        "sfx.gull_fire",
        "sfx.hound_fire",
        "sfx.hound_step",
        "sfx.gull_die",
        "sfx.hound_die",
        "sfx.telegraph",
        "sfx.alert",
        "sfx.explosion",
        "sfx.relay_cut",
        "sfx.thunder",
        "sfx.foghorn",
        "sfx.gull_cry",
        "sfx.halyard",
        "sfx.container_bang",
        "sfx.ui_click",
        "sfx.ui_hover",
        "sfx.objective",
        "sfx.objective_all",
        "sfx.complete",
        "sfx.death",
        "sfx.gull_rotor",
        "sfx.hound_servo",
        "sfx.relay_hum",
        "sfx.rain",
        "sfx.rain_interior",
        "sfx.wind",
        "sfx.sea",
        "sfx.music_drone",
        "sfx.music_ost",
        "sfx.music_perc",
        "sfx.music_brass",
        "sfx.music_motif",
        "sfx.ir_outdoor",
        "sfx.ir_shed"
      ]
    },
    {
      "id": "gameplay",
      "title": "玩法、输入、任务与 HUD",
      "conditions": [
        "input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。",
        "title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。",
        "触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。"
      ],
      "status": {
        "code": "reference",
        "complete": false,
        "detail": "玩家/按键/波次调参和图表是资料层；原任务、输入状态机与 DOM HUD 尚非当前资产库可玩整机。"
      },
      "source": [
        {
          "symbol": "Dy",
          "found": true,
          "line": 4191,
          "column": 52860,
          "signature": "function Dy()",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "v_",
          "found": true,
          "line": 5939,
          "column": 92557,
          "signature": "function v_(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "x_",
          "found": true,
          "line": 5939,
          "column": 101007,
          "signature": "function x_(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "zv",
          "found": true,
          "line": 5939,
          "column": 107749,
          "signature": "function zv(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "hM",
          "found": true,
          "line": 6087,
          "column": 8499,
          "signature": "function hM(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "pM",
          "found": true,
          "line": 6110,
          "column": 10,
          "signature": "function pM(i,e)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "mM",
          "found": true,
          "line": 6202,
          "column": 5381,
          "signature": "function mM(i)",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        },
        {
          "symbol": "QC",
          "found": true,
          "line": 6202,
          "column": 18033,
          "signature": "async function QC()",
          "path": "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html",
          "sha256": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966"
        }
      ],
      "package": {
        "modules": [
          "player-tuning",
          "weapon-tuning",
          "ai-tuning"
        ],
        "api": [
          "原版：window.__G/__ready/__fatal/__errors/__frames/__stats/__setShot（调试，不是稳定 SDK）",
          "原版：game.start/pause/resume/update；hud.setObjective/setRelays/setMarkers/setPrompt/reset/update",
          "拟封装（未实现）：createGameHost(ctx)，提供启动/暂停/重试/清理；不要绕过真实输入验收"
        ],
        "apiNote": "“原版”在原单 IIFE 内；“拟封装”尚未实现，不能直接 import。"
      },
      "minimumHost": "带原 r180 全渲染的 QC 正式启动器；原 HTML 可作基准宿主，但不等于模块化交付已完成。",
      "acceptanceTests": [
        "从标题真实开始→三中继→实际撤离→结算；死亡重试、暂停/后台/恢复。",
        "键鼠/触摸多点/手柄、390×844/横屏/320px、设置/焦点与错误分支。",
        "事件→数值→模型动作→FX/HUD→声音同录；debugCut 和 API 注入只能另记。"
      ],
      "limitations": [
        "未接玩家 melee/alt、拾取补给/治疗、换枪/游泳；不能凭按键名扩写功能。",
        "原有单向 touch、ARIA/减动缺口、隔墙交互与时序近似需注明；商业分发须另做权利核查。"
      ],
      "technicalFeasibility": {
        "originalCode": "可：原代码入口与完整依赖可取得，基于 hash 锁定的原完整宿主制作；不表示当前包已完成。",
        "crossEngine": "需适配：坐标/UV/Shader/颜色与深度链、碰撞、程序动画、时钟和事件逐项映射并重新验收。",
        "rights": "技术可行性不是商业许可结论；商业分发前核查代码、标识、字体及其他权利。"
      },
      "lifecycleRequirements": [
        "创建/更新/暂停/恢复/reset/销毁各有可观测状态；资源共享与所有权明确，循环/订阅/目标/缓存不可泄漏。",
        "捕获构建异常、fallback/stub、pageerror/console 与帧增长；缺 GPU/WebAudio、池满或未 ready 时单独报告失败/预期降级，不升级为完整通过。"
      ],
      "evidence": [
        {
          "kind": "geometry",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "texture",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "dynamic",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "image",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        },
        {
          "kind": "audio",
          "status": "unexecuted",
          "detail": "本审计未新增该类实测。",
          "paths": []
        }
      ],
      "gates": [
        {
          "id": "source",
          "status": "partial",
          "required": "原始字节、真实入口、抽取范围、生成文件 hash 可追溯。",
          "detail": "入口已静态定位；非运行验收。"
        },
        {
          "id": "structure",
          "status": "unexecuted",
          "required": "逐件层级、属性数组、索引、UV、材质槽、尺寸、碰撞和 noMerge；登记不是成品。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "runtime",
          "status": "unexecuted",
          "required": "原版 r180、WebGL2/MRT、ShaderChunk、字体、设备与冷启动画质固定。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "behavior",
          "status": "unexecuted",
          "required": "实际消费选项、seed 与随机顺序、时间切片、权威状态提交和事件消费者闭环。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "lifecycle",
          "status": "unexecuted",
          "required": "创建、update、暂停、reset、dispose、池满、fallback 与错误；ready 不等于健康。",
          "detail": "见本类完整条件与验收项。"
        },
        {
          "id": "evidence",
          "status": "unexecuted",
          "required": "分别保存 geometry / texture / dynamic / image / audio；存在文件不等于内容通过。",
          "detail": "见本类完整条件与验收项。"
        }
      ],
      "componentIds": [
        "num.player",
        "num.move",
        "num.waves",
        "num.input",
        "actor.player"
      ]
    }
  ],
  "components": [
    {
      "id": "matf.asphalt",
      "name": "沥青",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4833:C34",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.asphalt",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "asphalt",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          1,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          2,
          "重复周期（米）"
        ],
        [
          "bump",
          1.6,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          true,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.concrete",
      "name": "混凝土",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4858:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.concrete",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "concrete",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          1,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          3,
          "重复周期（米）"
        ],
        [
          "bump",
          2.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.brick",
      "name": "砖墙",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4885:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.brick",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "brick",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1.8,
          "重复周期（米）"
        ],
        [
          "bump",
          6,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.epoxy",
      "name": "环氧地坪",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4902:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.epoxy",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "epoxy",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          4,
          "重复周期（米）"
        ],
        [
          "bump",
          3,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.paint",
      "name": "油漆",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4953:C3",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.paint",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "paint",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          1,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          2.5,
          "重复周期（米）"
        ],
        [
          "bump",
          2.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.hull",
      "name": "船壳漆",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4968:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.hull",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "hull",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          4,
          "重复周期（米）"
        ],
        [
          "bump",
          12,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.galv",
      "name": "镀锌钢",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4998:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.galv",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "galv",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1,
          "重复周期（米）"
        ],
        [
          "bump",
          0.8,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.metal",
      "name": "裸金属",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5013:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.metal",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "metal",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1,
          "重复周期（米）"
        ],
        [
          "bump",
          0.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.brushed",
      "name": "拉丝金属",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5027:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.brushed",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "brushed",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.5,
          "重复周期（米）"
        ],
        [
          "bump",
          0.4,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.rust",
      "name": "锈蚀",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5038:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.rust",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "rust",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1.2,
          "重复周期（米）"
        ],
        [
          "bump",
          3,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.diamond",
      "name": "花纹钢板",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5062:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.diamond",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "diamond",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.5,
          "重复周期（米）"
        ],
        [
          "bump",
          2,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.corrugated",
      "name": "瓦楞板",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5079:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.corrugated",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "corrugated",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          [
            0.762,
            2.286
          ],
          "重复周期（米）"
        ],
        [
          "bump",
          19,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.chainlink",
      "name": "铁丝网",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5102:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.chainlink",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "chainlink",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.5,
          "重复周期（米）"
        ],
        [
          "bump",
          5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.hazard",
      "name": "警示条纹",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L4959:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.hazard",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "hazard",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1,
          "重复周期（米）"
        ],
        [
          "bump",
          2.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.gunmetal",
      "name": "枪金属",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5117:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.gunmetal",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "gunmetal",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.25,
          "重复周期（米）"
        ],
        [
          "bump",
          0.3,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.anodized",
      "name": "阳极氧化",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5117:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.anodized",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "gunmetal",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.25,
          "重复周期（米）"
        ],
        [
          "bump",
          0.25,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.polymer",
      "name": "工程塑料",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5131:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.polymer",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "polymer",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.25,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.1,
          "重复周期（米）"
        ],
        [
          "bump",
          0.4,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.carbon",
      "name": "碳纤维",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5143:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.carbon",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "carbon",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.25,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.05,
          "重复周期（米）"
        ],
        [
          "bump",
          0.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.fabric",
      "name": "织物",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5153:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.fabric",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "fabric",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.25,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.05,
          "重复周期（米）"
        ],
        [
          "bump",
          0.4,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.armor",
      "name": "装甲漆",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5163:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.armor",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "armor",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.5,
          "重复周期（米）"
        ],
        [
          "bump",
          0.8,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.wood",
      "name": "木材",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5178:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.wood",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "wood",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1.2,
          "重复周期（米）"
        ],
        [
          "bump",
          2.6,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.plastic",
      "name": "塑料件",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5199:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.plastic",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "plastic",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1,
          "重复周期（米）"
        ],
        [
          "bump",
          1,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.tarp",
      "name": "篷布",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5211:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.tarp",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "tarp",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1.5,
          "重复周期（米）"
        ],
        [
          "bump",
          20,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.cardboard",
      "name": "纸板",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5226:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.cardboard",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "cardboard",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1,
          "重复周期（米）"
        ],
        [
          "bump",
          0.8,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.rope",
      "name": "绳索",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5237:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.rope",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "rope",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.25,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          0.1,
          "重复周期（米）"
        ],
        [
          "bump",
          4,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.tire",
      "name": "橡胶",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5246:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.tire",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "tire",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          [
            0.5,
            0.3
          ],
          "重复周期（米）"
        ],
        [
          "bump",
          7,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.glass",
      "name": "玻璃",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5261:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.glass",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "glass",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1.5,
          "重复周期（米）"
        ],
        [
          "bump",
          1.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.glass_dirty",
      "name": "脏玻璃",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5261:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.glass_dirty",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "glass",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.5,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          1.5,
          "重复周期（米）"
        ],
        [
          "bump",
          1.5,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "matf.water",
      "name": "水面",
      "category": "MAT",
      "sub": "材质族",
      "groupId": "materials",
      "sourceAnchor": "L5276:C4",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/matf.water",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "shader",
          "water",
          "对应 GLSL 族函数"
        ],
        [
          "尺寸",
          0.25,
          "贴图覆盖的米数"
        ],
        [
          "tile",
          4,
          "重复周期（米）"
        ],
        [
          "bump",
          30,
          "凹凸强度（毫米）"
        ],
        [
          "hero",
          false,
          "是否主视觉材质"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.asphalt",
      "name": "沥青场坪",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C17716",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.asphalt",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "asphalt",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.45 / 0.30 / 0.50 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.22 / 0.12 / 0.35 / 0.35",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.concrete",
      "name": "清水混凝土",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C11554",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.concrete",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "concrete",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.42 / 0.38 / 0.50 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.22 / 0.12 / 0.35 / 0.35",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.concrete_dirty",
      "name": "脏混凝土",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19539",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.concrete_dirty",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "concrete",
          "继承的材质族"
        ],
        [
          "颜色",
          "#CFC6B6",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.42 / 0.38 / 0.50 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.30 / 0.15 / 0.35 / 0.90",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.concrete_painted",
      "name": "涂装混凝土",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19608",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.concrete_painted",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "concrete",
          "继承的材质族"
        ],
        [
          "颜色",
          "#8E9296",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          0.9,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.15 / 0.55 / 0.60 / 0.30",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.50 / 0.30",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.brick",
      "name": "红砖",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L360:C91778",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.brick",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "brick",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.42 / 0.38 / 0.50 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.floor_epoxy",
      "name": "仓库环氧地坪",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19731",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.floor_epoxy",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "epoxy",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.04 / 0.75 / 0.40 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.12 / 0.20 / 0.45 / 0.25",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_red",
      "name": "红漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19799",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_red",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#7D2219",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_blue",
      "name": "蓝漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19821",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_blue",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#1F3F66",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_green",
      "name": "绿漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19844",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_green",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#2C5A44",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_yellow",
      "name": "黄漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19868",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_yellow",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#B98A1C",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_orange",
      "name": "橙漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19894",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_orange",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#B3521A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_white",
      "name": "白漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19920",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_white",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#B9BBB6",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_grey",
      "name": "灰漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19945",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_grey",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#5A6068",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.paint_teal",
      "name": "青漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19968",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.paint_teal",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "paint",
          "继承的材质族"
        ],
        [
          "颜色",
          "#1F5D63",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.16 / 0.40 / 0.45",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.steel_galv",
      "name": "镀锌钢",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C19991",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.steel_galv",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "galv",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.steel_dark",
      "name": "深色钢",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20022",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.steel_dark",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "metal",
          "继承的材质族"
        ],
        [
          "颜色",
          "#3D4146",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1.15,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.steel_worn",
      "name": "磨损钢",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20086",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.steel_worn",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "metal",
          "继承的材质族"
        ],
        [
          "颜色",
          "#8A8E92",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          0.9,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.steel_bare",
      "name": "裸钢",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20148",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.steel_bare",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "brushed",
          "继承的材质族"
        ],
        [
          "颜色",
          "#B4B8BB",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.07 / 0.06 / 3.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.steel_rust",
      "name": "锈钢",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20213",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.steel_rust",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "rust",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.30 / 0.60 / 0.55 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.diamond_plate",
      "name": "花纹钢板",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20244",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.diamond_plate",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "diamond",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.corrugated_roof",
      "name": "瓦楞屋面板",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20281",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.corrugated_roof",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "corrugated",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.chainlink",
      "name": "铁丝网",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18278",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.chainlink",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "chainlink",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 1.00 / 0.00 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.00 / 0.00 / 1.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.aluminium",
      "name": "铝",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20393",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.aluminium",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "brushed",
          "继承的材质族"
        ],
        [
          "颜色",
          "#C4C8CB",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1.15,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.07 / 0.06 / 3.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.brass",
      "name": "黄铜",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20468",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.brass",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "brushed",
          "继承的材质族"
        ],
        [
          "颜色",
          "#C29A45",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          0.9,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.55 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.10 / 0.08 / 20.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.hazard_stripes",
      "name": "警示条纹",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20548",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.hazard_stripes",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "hazard",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.gunmetal",
      "name": "枪金属",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18373",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.gunmetal",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "gunmetal",
          "继承的材质族"
        ],
        [
          "颜色",
          "#2A2D31",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.75 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.08 / 0.06 / 6.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.anodized_black",
      "name": "黑色阳极氧化",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20670",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.anodized_black",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "anodized",
          "继承的材质族"
        ],
        [
          "颜色",
          "#121416",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          0.72,
          "乘子"
        ],
        [
          "金属",
          0.9,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.75 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.06 / 0.05 / 6.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.polymer_black",
      "name": "黑色塑料",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20780",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.polymer_black",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "polymer",
          "继承的材质族"
        ],
        [
          "颜色",
          "#17181A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.06 / 0.06 / 6.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.polymer_tan",
      "name": "沙色塑料",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20868",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.polymer_tan",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "polymer",
          "继承的材质族"
        ],
        [
          "颜色",
          "#6F6048",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.70 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.06 / 0.06 / 6.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.rubber",
      "name": "橡胶",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C20954",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.rubber",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "polymer",
          "继承的材质族"
        ],
        [
          "颜色",
          "#101010",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1.4,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.60 / 0.60 / 0.40",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.06 / 0.06 / 6.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.carbon",
      "name": "碳纤维",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18544",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.carbon",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "carbon",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 0.80 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.05 / 0.05 / 6.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.glove_fabric",
      "name": "手套织物",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21106",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.glove_fabric",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "fabric",
          "继承的材质族"
        ],
        [
          "颜色",
          "#23262A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.30 / 0.70 / 0.60 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.08 / 0.04 / 8.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.armor_white",
      "name": "白色装甲",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21192",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.armor_white",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "armor",
          "继承的材质族"
        ],
        [
          "颜色",
          "#AEB4B8",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.08 / 0.08 / 2.50 / 0.15",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.armor_orange",
      "name": "橙色装甲",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21271",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.armor_orange",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "armor",
          "继承的材质族"
        ],
        [
          "颜色",
          "#C1551A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.08 / 0.08 / 2.50 / 0.15",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.wood_pallet",
      "name": "托盘木",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21351",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.wood_pallet",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "wood",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.40 / 0.50 / 0.60 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.10 / 0.90 / 0.40",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.wood_dark",
      "name": "深色木",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21403",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.wood_dark",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "wood",
          "继承的材质族"
        ],
        [
          "颜色",
          "#8A786A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.40 / 0.50 / 0.60 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.20 / 0.10 / 0.90 / 0.40",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.plastic_blue",
      "name": "蓝塑料",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21467",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.plastic_blue",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "plastic",
          "继承的材质族"
        ],
        [
          "颜色",
          "#1D4C86",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.08 / 0.62 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.plastic_red",
      "name": "红塑料",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21524",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.plastic_red",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "plastic",
          "继承的材质族"
        ],
        [
          "颜色",
          "#8E1F1A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.08 / 0.62 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.plastic_grey",
      "name": "灰塑料",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21580",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.plastic_grey",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "plastic",
          "继承的材质族"
        ],
        [
          "颜色",
          "#4B4F54",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.08 / 0.62 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.tarp",
      "name": "篷布",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18769",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.tarp",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "tarp",
          "继承的材质族"
        ],
        [
          "颜色",
          "#3B4A3A",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.08 / 0.62 / 0.60 / 0.50",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.10 / 0.10 / 1.20 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.cardboard",
      "name": "纸板",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18811",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.cardboard",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "cardboard",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.40 / 0.75 / 0.60 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.14 / 0.10 / 0.80 / 0.20",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.rope",
      "name": "绳索",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18861",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.rope",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "rope",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.42 / 0.38 / 0.50 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.07 / 0.06 / 3.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.tire",
      "name": "轮胎",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18902",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.tire",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "tire",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.10 / 0.60 / 0.60 / 0.30",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.07 / 0.06 / 3.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.glass",
      "name": "玻璃",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18947",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.glass",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "glass",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 1.00 / 0.00 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.00 / 0.00 / 1.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.glass_dirty",
      "name": "脏玻璃",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C18999",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.glass_dirty",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "glass_dirty",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 1.00 / 0.00 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.00 / 0.00 / 1.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.hull_paint",
      "name": "船壳漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C21950",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.hull_paint",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "hull",
          "继承的材质族"
        ],
        [
          "颜色",
          "#1B222B",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.22 / 0.12 / 0.35 / 0.35",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.hull_red",
      "name": "船底红漆",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C22011",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.hull_red",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "hull",
          "继承的材质族"
        ],
        [
          "颜色",
          "#5F1F18",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.05 / 0.62 / 0.65 / 0.70",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.22 / 0.12 / 0.35 / 0.35",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "mat.water_dark",
      "name": "深水",
      "category": "MAT",
      "sub": "材质实例",
      "groupId": "materials",
      "sourceAnchor": "L5294:C22070",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/mat.water_dark",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sphere",
      "catalogParameters": [
        [
          "族",
          "water",
          "继承的材质族"
        ],
        [
          "颜色",
          "#FFFFFF",
          "基色（乘在贴图上）"
        ],
        [
          "粗糙",
          1,
          "乘子"
        ],
        [
          "金属",
          1,
          "乘子"
        ],
        [
          "湿润",
          "0.00 / 1.00 / 0.00 / 0.00",
          "水膜 / 低洼 / 朝向 / 高度"
        ],
        [
          "脏污",
          "0.00 / 0.00 / 1.00 / 0.00",
          "强度 / 尺度 / 阈值 / 对比"
        ],
        [
          "法线",
          1,
          "凹凸乘子"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.hazard_flammable",
      "name": "易燃品标识",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C4137",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.hazard_flammable",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.hazard_voltage",
      "name": "高压标识",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C4930",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.hazard_voltage",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.hazard_general",
      "name": "通用警示",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C5271",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.hazard_general",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.arrow",
      "name": "导向箭头",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C5566",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.arrow",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.no_entry",
      "name": "禁止进入",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C5971",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.no_entry",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.logo_a",
      "name": "港务 Logo A",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C6225",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.logo_a",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.logo_b",
      "name": "港务 Logo B",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C6660",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.logo_b",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.logo_c",
      "name": "港务 Logo C",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C7105",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.logo_c",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.logo_d",
      "name": "港务 Logo D",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C7596",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.logo_d",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.berth4",
      "name": "berth4",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C7902",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.berth4",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.caution_stripes",
      "name": "警示斜条",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C8277",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.caution_stripes",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.grime_streak",
      "name": "污渍挂流",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C8636",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.grime_streak",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.rust_run",
      "name": "锈水痕",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C9032",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.rust_run",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.oil_stain",
      "name": "油渍",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C9580",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.oil_stain",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.leak_stain",
      "name": "渗漏渍",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C10147",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.leak_stain",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.bullet_metal",
      "name": "弹孔·金属",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C10789",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.bullet_metal",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.bullet_concrete",
      "name": "弹孔·混凝土",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C11547",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.bullet_concrete",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.scorch",
      "name": "烧灼痕",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C12539",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.scorch",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.crack",
      "name": "裂纹",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C13133",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.crack",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.graffiti_tag",
      "name": "涂鸦签名",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C13751",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.graffiti_tag",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.csc_plate",
      "name": "CSC 铭牌",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C14813",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.csc_plate",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "decal.numbers_0_9",
      "name": "数字条 0–9",
      "category": "DECAL",
      "sub": "贴花",
      "groupId": "materials",
      "sourceAnchor": "L5294:C15920",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/decal.numbers_0_9",
      "status": "partial",
      "complete": false,
      "contractRef": "materials",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "decal",
      "catalogParameters": [
        [
          "画布",
          "256 × 256",
          "构建时绘制的 canvas 纹理"
        ],
        [
          "方式",
          "canvas 2D",
          "函数体在原工程 mats 模块"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "此族/实例/贴花必须有独立 GPU 或 Canvas 输出证据；材质球不代替正式光照、贴花曲面/图集与颜色链验证。"
      ],
      "acceptanceRefs": "materials",
      "technicalFeasibilityRef": "materials",
      "limitationsRef": "materials"
    },
    {
      "id": "prop.container20",
      "name": "20 尺集装箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.container20",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "尺寸",
          "6.06 × 2.59 × 2.44 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_red",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "M3",
          "源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "分派",
          "oneContainer",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ],
        [
          "focus",
          "seed=0 / doors=0 / wear=0.5 / color=red",
          "容器默认预览参数"
        ],
        [
          "真实波纹侧",
          "P=.278 / d=.036",
          "Uo；来自 M3/zA"
        ],
        [
          "真实波纹顶",
          "P=.209 / d=.020",
          "x1；来自 M3/zA"
        ],
        [
          "真实波纹端",
          "P=.250 / d=.042",
          "y1；来自 M3/zA"
        ],
        [
          "源码函数",
          "M3 / zA",
          "{'M3': 'L5453:C33336', 'zA': 'L5453:C24884'}"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.container40",
      "name": "40 尺集装箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.container40",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "尺寸",
          "12.19 × 2.59 × 2.44 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_blue",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "M3",
          "源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "分派",
          "oneContainer",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ],
        [
          "focus",
          "seed=0 / doors=0 / wear=0.5 / color=blue",
          "容器默认预览参数"
        ],
        [
          "真实波纹侧",
          "P=.278 / d=.036",
          "Uo；来自 M3/zA"
        ],
        [
          "真实波纹顶",
          "P=.209 / d=.020",
          "x1；来自 M3/zA"
        ],
        [
          "真实波纹端",
          "P=.250 / d=.042",
          "y1；来自 M3/zA"
        ],
        [
          "源码函数",
          "M3 / zA",
          "{'M3': 'L5453:C33336', 'zA': 'L5453:C24884'}"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.container40hc",
      "name": "40 尺高柜",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.container40hc",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "尺寸",
          "12.19 × 2.90 × 2.44 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_green",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "M3",
          "源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "分派",
          "oneContainer",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ],
        [
          "focus",
          "seed=0 / doors=0 / wear=0.5 / color=green",
          "容器默认预览参数"
        ],
        [
          "真实波纹侧",
          "P=.278 / d=.036",
          "Uo；来自 M3/zA"
        ],
        [
          "真实波纹顶",
          "P=.209 / d=.020",
          "x1；来自 M3/zA"
        ],
        [
          "真实波纹端",
          "P=.250 / d=.042",
          "y1；来自 M3/zA"
        ],
        [
          "源码函数",
          "M3 / zA",
          "{'M3': 'L5453:C33336', 'zA': 'L5453:C24884'}"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.jersey_barrier",
      "name": "混凝土隔离墩",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33991",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.jersey_barrier",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 0.81 × 0.60 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "concrete",
          "指向材质实例"
        ],
        [
          "表面",
          "concrete",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "S3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "S3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "S3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed / stripe",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.light_mast",
      "name": "高杆灯",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C36210",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.light_mast",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.50 × 14.00 × 0.50 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_galv",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "T3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "T3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "T3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "on",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.fence_panel",
      "name": "围栏片",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C38499",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.fence_panel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 2.40 × 0.08 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "chainlink",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "A3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "A3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "A3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "lean / posts / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.guard_booth",
      "name": "岗亭",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C39956",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.guard_booth",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.60 × 2.70 × 2.20 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_white",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "R3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "R3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "R3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / on / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.gate_arm",
      "name": "道闸杆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C44205",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.gate_arm",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "5.00 × 1.10 × 0.30 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "hazard_stripes",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "C3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "C3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "C3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "open",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.bollard_mooring",
      "name": "系缆柱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C45841",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.bollard_mooring",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.70 × 0.60 × 0.70 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_dark",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "P3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "P3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "P3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.bollard_post",
      "name": "警示柱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C46774",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.bollard_post",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.17 × 1.00 × 0.17 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "I3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "I3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "I3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.relay_node",
      "name": "中继节点",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C61318",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.relay_node",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 2.40 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_grey",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "B3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "B3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "B3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "id / label / seed / state",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.shelf_rack",
      "name": "货架",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C55732",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.shelf_rack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.70 × 4.20 × 1.10 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_orange",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "U3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "U3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "U3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.stairs_metal",
      "name": "钢楼梯",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C50747",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.stairs_metal",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 2.60 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "diamond_plate",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "k3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "k3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "k3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "未写",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.catwalk",
      "name": "检修走道",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C52818",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.catwalk",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 1.10 × 1.20 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "diamond_plate",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "F3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "F3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "F3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "rails",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.reefer_unit",
      "name": "冷机",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C57696",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.reefer_unit",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.50 × 2.30 × 2.30 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_white",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "N3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "N3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "N3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "flip / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.barrel",
      "name": "油桶",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C81434",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.barrel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.60 × 0.90 × 0.60 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_blue",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "HA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`,()=>HA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "HA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / lying / open / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.pallet",
      "name": "托盘",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C84155",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.pallet",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 0.14 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "VA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`pallet|${!!t.broken}|${n}`,()=>VA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "VA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "broken / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.pallet_stack",
      "name": "托盘堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C84260",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.pallet_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 1.15 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "WA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>WA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "WA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "count / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.crate_wood",
      "name": "木箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C87218",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.crate_wood",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.10 × 1.00 × 0.90 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "GA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>GA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "GA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "code / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.crate_stack",
      "name": "木箱堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C87423",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.crate_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 1.90 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "qA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>qA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "qA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.ibc_tote",
      "name": "吨桶",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C88417",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.ibc_tote",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 1.16 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "plastic_grey",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "XA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>XA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "XA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.forklift",
      "name": "叉车",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C111029",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.forklift",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.40 × 2.20 × 1.25 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "oR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>oR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "oR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / forksUp / number / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.cable_reel",
      "name": "电缆盘",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C91648",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.cable_reel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.30 × 1.30 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_dark",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "YA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>YA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "YA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.tire_stack",
      "name": "轮胎堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C94138",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.tire_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.80 × 1.00 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "tire",
          "指向材质实例"
        ],
        [
          "表面",
          "rubber",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "$A",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>$A(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "$A",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "count / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.dumpster",
      "name": "垃圾箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C124584",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.dumpster",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.90 × 1.35 × 1.10 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_green",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "aR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>aR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "aR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.generator",
      "name": "发电机",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C120182",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.generator",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.20 × 1.40 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "rR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>rR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "rR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.jerry_can",
      "name": "油壶",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C94549",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.jerry_can",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.35 × 0.47 × 0.17 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_green",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "ZA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%2;return wf(`jerry|${t.color}|${n}`,()=>ZA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "ZA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.traffic_cone",
      "name": "锥筒",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C95819",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.traffic_cone",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.36 × 0.70 × 0.36 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "plastic_red",
          "指向材质实例"
        ],
        [
          "表面",
          "rubber",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "jA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%3;return wf(`cone|${!!t.lying}|${n}`,()=>jA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "jA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "lying / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.gas_cylinders",
      "name": "气瓶组",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C96606",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.gas_cylinders",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.90 × 1.60 × 0.50 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_dark",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "JA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>JA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "JA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.tarp_cargo",
      "name": "苫布货堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C101726",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.tarp_cargo",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.40 × 1.50 × 1.40 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "tarp",
          "指向材质实例"
        ],
        [
          "表面",
          "dirt",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "QA",
          "源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>QA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "QA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.sandbags",
      "name": "沙袋",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C105847",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.sandbags",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.00 × 0.90 × 0.60 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "tarp",
          "指向材质实例"
        ],
        [
          "表面",
          "dirt",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "tR",
          "源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>tR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "tR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "courses / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.toolbox_cart",
      "name": "工具车",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C127775",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.toolbox_cart",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.90 × 0.95 × 0.50 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "plastic_red",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "lR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>lR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "lR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.floodlight_stand",
      "name": "移动泛光灯",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C48964",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.floodlight_stand",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.00 × 2.20 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "D3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "D3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "D3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "on / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.cardboard_boxes",
      "name": "纸箱堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C108905",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.cardboard_boxes",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.00 × 0.80 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "cardboard",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "nR",
          "源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>nR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "nR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.pipe_stack",
      "name": "管材堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C99053",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.pipe_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "6.00 × 0.90 × 1.20 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_rust",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "KA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>KA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "KA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "prop.sign_post",
      "name": "标志牌",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C47827",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.sign_post",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.60 × 2.40 × 0.08 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_white",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "z3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "z3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "z3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed / sign / text",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "geo.metricBox",
      "name": "米制倒角盒",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L5453:C17146",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.metricBox",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "p3",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "geo.bevelBox",
      "name": "倒角箱",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L4191:C58918",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.bevelBox",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "Wi",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "geo.cylinder",
      "name": "米制圆柱",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L4191:C59818",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.cylinder",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "ot",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "geo.tube",
      "name": "样条管",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L4191:C60121",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.tube",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "Fn",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "geo.place",
      "name": "摆放",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L5453:C21481",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.place",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "je",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "geo.vertexColor",
      "name": "顶点着色",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L4191:C60702",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.vertexColor",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "Lc",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "geo.merge",
      "name": "几何合并",
      "category": "MODEL",
      "sub": "几何原语",
      "groupId": "geometry",
      "sourceAnchor": "L4191:C60949",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/geo.merge",
      "status": "partial",
      "complete": false,
      "contractRef": "geometry",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "geo",
      "catalogParameters": [
        [
          "原名",
          "Ii",
          "原工程里的短名"
        ],
        [
          "依赖",
          "THREE.BufferGeometry",
          "返回带 position/normal/uv 的几何"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Y-up 米制；bottom/center 原点、法线与米制 UV 必须原样；不把不同倒角算法合成一种。",
        "按 material/shadow/layer 分桶；排除祖先 noMerge、蒙皮与实例对象；placed 与运行层级分账。",
        "AABB surface/tag/noNav/bulletOnly/playerOnly，台阶 .42、导航 .5m 与膨胀 .5m。"
      ],
      "acceptanceRefs": "geometry",
      "technicalFeasibilityRef": "geometry",
      "limitationsRef": "geometry"
    },
    {
      "id": "build.container20",
      "name": "20 尺集装箱（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.container20",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "产出",
          "container20",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "M3",
          "原版源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70076",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C33336",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "for(let i of[\"container20\",\"container40\",\"container40hc\"])_i(i,(e,t)=>M3(e,i,t));",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.container40",
      "name": "40 尺集装箱（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.container40",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "产出",
          "container40",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "M3",
          "原版源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70076",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C33336",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "for(let i of[\"container20\",\"container40\",\"container40hc\"])_i(i,(e,t)=>M3(e,i,t));",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.container40hc",
      "name": "40 尺高柜（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.container40hc",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "产出",
          "container40hc",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "M3",
          "原版源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70076",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C33336",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "for(let i of[\"container20\",\"container40\",\"container40hc\"])_i(i,(e,t)=>M3(e,i,t));",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.jersey_barrier",
      "name": "混凝土隔离墩（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C33991",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.jersey_barrier",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "jersey_barrier",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "S3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70157",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C33991",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"jersey_barrier\",S3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "S3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "S3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed / stripe",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.light_mast",
      "name": "高杆灯（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C36210",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.light_mast",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "light_mast",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "T3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70181",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C36210",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"light_mast\",T3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "T3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "T3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "on",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.fence_panel",
      "name": "围栏片（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C38499",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.fence_panel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "fence_panel",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "A3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70201",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C38499",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"fence_panel\",A3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "A3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "A3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "lean / posts / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.guard_booth",
      "name": "岗亭（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C39956",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.guard_booth",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "guard_booth",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "R3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70222",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C39956",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"guard_booth\",R3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "R3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "R3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / on / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.gate_arm",
      "name": "道闸杆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C44205",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.gate_arm",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "gate_arm",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "C3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70243",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C44205",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"gate_arm\",C3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "C3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "C3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "open",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.bollard_mooring",
      "name": "系缆柱（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C45841",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.bollard_mooring",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "bollard_mooring",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "P3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70261",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C45841",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"bollard_mooring\",P3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "P3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "P3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.bollard_post",
      "name": "警示柱（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C46774",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.bollard_post",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "bollard_post",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "I3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70286",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C46774",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"bollard_post\",I3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "I3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "I3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.sign_post",
      "name": "标志牌（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C47827",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.sign_post",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "sign_post",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "z3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70308",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C47827",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"sign_post\",z3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "z3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "z3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed / sign / text",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.floodlight_stand",
      "name": "移动泛光灯（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C48964",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.floodlight_stand",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "floodlight_stand",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "D3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70327",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C48964",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"floodlight_stand\",D3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "D3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "D3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "on / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.stairs_metal",
      "name": "钢楼梯（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C50747",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.stairs_metal",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "stairs_metal",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "k3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70353",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C50747",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"stairs_metal\",k3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "k3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "k3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "未写",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.catwalk",
      "name": "检修走道（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C52818",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.catwalk",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "catwalk",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "F3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70375",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C52818",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"catwalk\",F3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "F3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "F3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "rails",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.shelf_rack",
      "name": "货架（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C55732",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.shelf_rack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "shelf_rack",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "U3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70392",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C55732",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"shelf_rack\",U3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "U3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "U3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.reefer_unit",
      "name": "冷机（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C57696",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.reefer_unit",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "reefer_unit",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "N3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70412",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C57696",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"reefer_unit\",N3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "N3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "N3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "flip / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.relay_node",
      "name": "中继节点（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C61318",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.relay_node",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "relay_node",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "B3",
          "原版源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C70433",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C61318",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "_i(\"relay_node\",B3);",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "B3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "B3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "id / label / seed / state",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.barrel",
      "name": "油桶（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C81434",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.barrel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "barrel",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "HA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C100778",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C81434",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"barrel\",(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`,()=>HA(e,t,n))})",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`,()=>HA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "HA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / lying / open / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.pallet",
      "name": "托盘（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C84155",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.pallet",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "pallet",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "VA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C100904",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C84155",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"pallet\",(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`pallet|${!!t.broken}|${n}`,()=>VA(e,t,n))})",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`pallet|${!!t.broken}|${n}`,()=>VA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "VA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "broken / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.pallet_stack",
      "name": "托盘堆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C84260",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.pallet_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "pallet_stack",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "WA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101008",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C84260",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"pallet_stack\",(e,t={})=>WA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>WA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "WA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "count / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.crate_wood",
      "name": "木箱（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C87218",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.crate_wood",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "crate_wood",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "GA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101044",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C87218",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"crate_wood\",(e,t={})=>GA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>GA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "GA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "code / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.crate_stack",
      "name": "木箱堆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C87423",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.crate_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "crate_stack",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "qA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101078",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C87423",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"crate_stack\",(e,t={})=>qA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>qA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "qA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.ibc_tote",
      "name": "吨桶（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C88417",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.ibc_tote",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "ibc_tote",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "XA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101113",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C88417",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"ibc_tote\",(e,t={})=>XA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>XA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "XA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.cable_reel",
      "name": "电缆盘（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C91648",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.cable_reel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "cable_reel",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "YA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101145",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C91648",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"cable_reel\",(e,t={})=>YA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>YA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "YA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.tire_stack",
      "name": "轮胎堆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C94138",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.tire_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "tire_stack",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "$A",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101179",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C94138",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"tire_stack\",(e,t={})=>$A(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>$A(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "$A",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "count / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.jerry_can",
      "name": "油壶（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C94549",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.jerry_can",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "jerry_can",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "ZA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101213",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C94549",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"jerry_can\",(e,t={})=>{let n=Math.abs(t.seed|0)%2;return wf(`jerry|${t.color}|${n}`,()=>ZA(e,t,n))})",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%2;return wf(`jerry|${t.color}|${n}`,()=>ZA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "ZA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.traffic_cone",
      "name": "锥筒（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C95819",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.traffic_cone",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "traffic_cone",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "jA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101316",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C95819",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"traffic_cone\",(e,t={})=>{let n=Math.abs(t.seed|0)%3;return wf(`cone|${!!t.lying}|${n}`,()=>jA(e,t,n))})",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%3;return wf(`cone|${!!t.lying}|${n}`,()=>jA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "jA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "lying / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.gas_cylinders",
      "name": "气瓶组（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C96606",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.gas_cylinders",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "gas_cylinders",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "JA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101423",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C96606",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"gas_cylinders\",(e,t={})=>JA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>JA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "JA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.pipe_stack",
      "name": "管材堆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C99053",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.pipe_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "pipe_stack",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "KA",
          "原版源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C101460",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C99053",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"pipe_stack\",(e,t={})=>KA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>KA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "KA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.tarp_cargo",
      "name": "苫布货堆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C101726",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.tarp_cargo",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "tarp_cargo",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "QA",
          "原版源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C109690",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C101726",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"tarp_cargo\",(e,t={})=>QA(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>QA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "QA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.sandbags",
      "name": "沙袋（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C105847",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.sandbags",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "sandbags",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "tR",
          "原版源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C109724",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C105847",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"sandbags\",(e,t={})=>tR(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>tR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "tR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "courses / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.cardboard_boxes",
      "name": "纸箱堆（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C108905",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.cardboard_boxes",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "cardboard_boxes",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "nR",
          "原版源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C109756",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C108905",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"cardboard_boxes\",(e,t={})=>nR(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>nR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "nR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.forklift",
      "name": "叉车（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C111029",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.forklift",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "forklift",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "oR",
          "原版源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C131003",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C111029",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"forklift\",(e,t={})=>oR(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>oR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "oR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / forksUp / number / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.generator",
      "name": "发电机（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C120182",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.generator",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "generator",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "rR",
          "原版源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C131035",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C120182",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"generator\",(e,t={})=>rR(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>rR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "rR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.dumpster",
      "name": "垃圾箱（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C124584",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.dumpster",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "dumpster",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "aR",
          "原版源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C131068",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C124584",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"dumpster\",(e,t={})=>aR(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>aR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "aR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "build.toolbox_cart",
      "name": "工具车（建模器）",
      "category": "MODEL",
      "sub": "专用建模器",
      "groupId": "props",
      "sourceAnchor": "L5453:C127775",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/build.toolbox_cart",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "产出",
          "toolbox_cart",
          "该建模器只服务这一个道具"
        ],
        [
          "回调",
          "lR",
          "原版源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "注册锚点",
          "L5453:C131100",
          "原版注册源码锚点"
        ],
        [
          "函数锚点",
          "L5453:C127775",
          "原版回调函数源码锚点"
        ],
        [
          "注册原文",
          "i(\"toolbox_cart\",(e,t={})=>lR(e,t))",
          "保留原引用，源码面板展示真实函数入口"
        ],
        [
          "真实回调链",
          "(e,t={})=>lR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "lR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。"
    },
    {
      "id": "sfx.rifle_shot",
      "name": "步枪射击",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C64936",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.rifle_shot",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          4,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.97,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          5,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.rifle_tail_out",
      "name": "枪声尾音·室外",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65005",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.rifle_tail_out",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          8,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.rifle_tail_in",
      "name": "枪声尾音·室内",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65076",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.rifle_tail_in",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.62,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          8,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.rifle_dry",
      "name": "空仓扳机",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65147",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.rifle_dry",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.reload_magout",
      "name": "卸弹匣",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65214",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.reload_magout",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.6,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.reload_magin",
      "name": "上弹匣",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65278",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.reload_magin",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.65,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.reload_bolt",
      "name": "拉枪机",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65342",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.reload_bolt",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.8,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.shell_bounce",
      "name": "弹壳落地",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65404",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.shell_bounce",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.3,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          4,
          "该音效的并发上限"
        ],
        [
          "优先级",
          1,
          "抢占用"
        ],
        [
          "参考距离",
          2,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          1,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.step_concrete",
      "name": "脚步·混凝土",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65481",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.step_concrete",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          4,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.45,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          3,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.step_water",
      "name": "脚步·积水",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65553",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.step_water",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          3,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.step_metal",
      "name": "脚步·金属",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65621",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.step_metal",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          3,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.land",
      "name": "落地",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65689",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.land",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          4,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.jump",
      "name": "起跳",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65744",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.jump",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "near",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.35,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          3,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.hurt",
      "name": "受伤",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65800",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.hurt",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.85,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          8,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.ear_ring",
      "name": "耳鸣",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65855",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.ear_ring",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.2,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          5,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.impact_metal",
      "name": "命中金属",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65913",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.impact_metal",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          4,
          "该音效的并发上限"
        ],
        [
          "优先级",
          4,
          "抢占用"
        ],
        [
          "参考距离",
          4,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.7,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.impact_concrete",
      "name": "命中混凝土",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C65991",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.impact_concrete",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          4,
          "该音效的并发上限"
        ],
        [
          "优先级",
          4,
          "抢占用"
        ],
        [
          "参考距离",
          4,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.7,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.impact_wood",
      "name": "命中木材",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66072",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.impact_wood",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          4,
          "抢占用"
        ],
        [
          "参考距离",
          4,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.7,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.impact_water",
      "name": "命中水面",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66149",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.impact_water",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.6,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          4,
          "抢占用"
        ],
        [
          "参考距离",
          4,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.7,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.impact_enemy",
      "name": "命中敌人",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66227",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.impact_enemy",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.75,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          4,
          "该音效的并发上限"
        ],
        [
          "优先级",
          5,
          "抢占用"
        ],
        [
          "参考距离",
          5,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.6,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.impact_glass",
      "name": "命中玻璃",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66306",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.impact_glass",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.6,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          4,
          "抢占用"
        ],
        [
          "参考距离",
          4,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.7,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.whiz",
      "name": "掠弹",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66384",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.whiz",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          5,
          "抢占用"
        ],
        [
          "参考距离",
          2.5,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.6,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.ricochet",
      "name": "跳弹",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66456",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.ricochet",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.4,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          3,
          "抢占用"
        ],
        [
          "参考距离",
          5,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.6,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.gull_fire",
      "name": "无人机射击",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66530",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.gull_fire",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.85,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          5,
          "该音效的并发上限"
        ],
        [
          "优先级",
          7,
          "抢占用"
        ],
        [
          "参考距离",
          7,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.55,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.hound_fire",
      "name": "猎犬射击",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66607",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.hound_fire",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.95,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          5,
          "该音效的并发上限"
        ],
        [
          "优先级",
          7,
          "抢占用"
        ],
        [
          "参考距离",
          8,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.5,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.hound_step",
      "name": "猎犬脚步",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66684",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.hound_step",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          3,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          4,
          "该音效的并发上限"
        ],
        [
          "优先级",
          3,
          "抢占用"
        ],
        [
          "参考距离",
          5,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.8,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.gull_die",
      "name": "无人机坠毁",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66760",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.gull_die",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.85,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          7,
          "抢占用"
        ],
        [
          "参考距离",
          7,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.5,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.hound_die",
      "name": "猎犬停机",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66835",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.hound_die",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.9,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          7,
          "抢占用"
        ],
        [
          "参考距离",
          7,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.5,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.telegraph",
      "name": "攻击预警",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66910",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.telegraph",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.42,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          4,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          6,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.6,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.alert",
      "name": "警戒",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C66986",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.alert",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          8,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.5,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.explosion",
      "name": "爆炸",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67057",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.explosion",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.97,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          3,
          "该音效的并发上限"
        ],
        [
          "优先级",
          10,
          "抢占用"
        ],
        [
          "参考距离",
          12,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.5,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.relay_cut",
      "name": "中继切断",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67135",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.relay_cut",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.75,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          8,
          "抢占用"
        ],
        [
          "参考距离",
          6,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.5,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.thunder",
      "name": "雷声",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67211",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.thunder",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.8,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          6,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.foghorn",
      "name": "雾笛",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67268",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.foghorn",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          2,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.gull_cry",
      "name": "海鸥",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67327",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.gull_cry",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.4,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          1,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.halyard",
      "name": "缆绳敲桅杆",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67387",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.halyard",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          2,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.3,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          1,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.container_bang",
      "name": "集装箱闷响",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67446",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.container_bang",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "world",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.6,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          2,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.ui_click",
      "name": "UI 点击",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67512",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.ui_click",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.3,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.ui_hover",
      "name": "UI 悬停",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67570",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.ui_hover",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "dry",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.12,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          2,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.objective",
      "name": "目标更新",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67629",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.objective",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "music",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.6,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.objective_all",
      "name": "目标全清",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67690",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.objective_all",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "music",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.65,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.complete",
      "name": "任务完成",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67756",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.complete",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "music",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.death",
      "name": "死亡",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67816",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.death",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "music",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.75,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          1,
          "该音效的并发上限"
        ],
        [
          "优先级",
          9,
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.gull_rotor",
      "name": "无人机旋翼",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67874",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.gull_rotor",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.6,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          5,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.9,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.hound_servo",
      "name": "猎犬伺服",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67933",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.hound_servo",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.42,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          4,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          1,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.relay_hum",
      "name": "中继嗡鸣",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C67993",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.relay_hum",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.4,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          2.5,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          1.4,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.rain",
      "name": "雨声",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68054",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.rain",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.rain_interior",
      "name": "雨声·室内",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68093",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.rain_interior",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Xn；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.wind",
      "name": "风",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68141",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.wind",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.sea",
      "name": "海浪",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68180",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.sea",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          22050,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          10,
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          0.6,
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.music_drone",
      "name": "配乐·低音铺底",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68233",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.music_drone",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Fr.sr；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.5,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.music_ost",
      "name": "配乐·主题",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68290",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.music_ost",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Fr.sr；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.45,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.music_perc",
      "name": "配乐·打击",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68346",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.music_perc",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Fr.sr；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.7,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.music_brass",
      "name": "配乐·铜管",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68402",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.music_brass",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Fr.sr；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.45,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.music_motif",
      "name": "配乐·动机",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68460",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.music_motif",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          "源码引用 Fr.sr；默认未写",
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.45,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.ir_outdoor",
      "name": "混响·室外",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68518",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.ir_outdoor",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.9,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "sfx.ir_shed",
      "name": "混响·棚内",
      "category": "SFX",
      "sub": "音效",
      "groupId": "audio",
      "sourceAnchor": "L5939:C68561",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/sfx.ir_shed",
      "status": "reference",
      "complete": false,
      "contractRef": "audio",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "sfx",
      "catalogParameters": [
        [
          "总线",
          "未写",
          "near / dry / world / music；未写不猜默认值"
        ],
        [
          "生成变体数",
          1,
          "生成的声音变体数量，不是叠加层数"
        ],
        [
          "采样率",
          44100,
          "Hz；只解析源码显式常量"
        ],
        [
          "峰值",
          0.9,
          "0–1；未写不猜默认值"
        ],
        [
          "同时发声",
          "未写",
          "该音效的并发上限"
        ],
        [
          "优先级",
          "未写",
          "抢占用"
        ],
        [
          "参考距离",
          "未写",
          "米（3D 衰减）；未写不能据此推断为 2D"
        ],
        [
          "滚降",
          "未写",
          "衰减曲线；未写不猜默认值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "必须取得该音色 gen 对应 DSP 及全部依赖，逐变体合成；记录 buffer、总线、事件与真实听音。"
      ],
      "acceptanceRefs": "audio",
      "technicalFeasibilityRef": "audio",
      "limitationsRef": "audio"
    },
    {
      "id": "fx.bloom",
      "name": "Bloom 泛光",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4612:C31",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.bloom",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uBloom",
          ""
        ],
        [
          "关键量",
          "阈值 1.0",
          ""
        ],
        [
          "关键量",
          "半径 3 级",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.streak",
      "name": "横向拉丝",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4608:C42",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.streak",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "tStreak",
          ""
        ],
        [
          "关键量",
          "uStreak",
          ""
        ],
        [
          "关键量",
          "横向 1 次",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.dirt",
      "name": "镜头脏污",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4608:C51",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.dirt",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "tDirt",
          ""
        ],
        [
          "关键量",
          "uDirt",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.flare",
      "name": "眩光",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4612:C55",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.flare",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uFlare",
          ""
        ],
        [
          "关键量",
          "太阳位置驱动",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.ca",
      "name": "色散",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4612:C63",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.ca",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uCA",
          ""
        ],
        [
          "关键量",
          "边缘最强",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.vignette",
      "name": "暗角",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4612:C68",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.vignette",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uVignette",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.agx",
      "name": "AgX 色彩映射",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4613:C88",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.agx",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uAgxMix",
          ""
        ],
        [
          "关键量",
          "renderer 用 NoToneMapping",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.adapt",
      "name": "曝光自适应",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4355:C19",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.adapt",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "tAdapt",
          ""
        ],
        [
          "关键量",
          "0.6 × e × (1−fade)",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.motion",
      "name": "运动模糊",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4744:C1023",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.motion",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "depthHalf",
          ""
        ],
        [
          "关键量",
          "motion",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.vol",
      "name": "体积光",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4191:C62571",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.vol",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uVolSteps",
          ""
        ],
        [
          "关键量",
          "volSunScale / volSigma",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.ao",
      "name": "屏幕空间 AO",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L4744:C1062",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.ao",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "aoA",
          ""
        ],
        [
          "关键量",
          "aoB",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.planar",
      "name": "平面反射",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L5825:C3426",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.planar",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "reflectionTarget",
          ""
        ],
        [
          "关键量",
          "uReflLod",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "fx.rain",
      "name": "雨",
      "category": "FX",
      "sub": "后期",
      "groupId": "render",
      "sourceAnchor": "L5475:C22",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/fx.rain",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "fx",
      "catalogParameters": [
        [
          "关键量",
          "uRain",
          ""
        ],
        [
          "关键量",
          "quality.rain 控制密度",
          ""
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.world",
      "name": "世界尺度",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L4191:C51376",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.world",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.sun",
      "name": "太阳",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L4191:C51452",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.sun",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.sky",
      "name": "天空四色",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L4191:C51526",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.sky",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.fog",
      "name": "体积雾",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L4744:C600",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.fog",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.shadow",
      "name": "阴影正交框",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L399:C138498",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.shadow",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.lamps",
      "name": "灯池预算",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L4744:C16677",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.lamps",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.exposure",
      "name": "曝光曲线",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L4356:C7",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.exposure",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "env.probe",
      "name": "环境探针",
      "category": "ENV",
      "sub": "环境",
      "groupId": "render",
      "sourceAnchor": "L360:C5887",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/env.probe",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "来源",
          "env-atmosphere",
          "数值表"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "num.player",
      "name": "玩家运动调参",
      "category": "NUM",
      "sub": "数值",
      "groupId": "gameplay",
      "sourceAnchor": "L5939:C100504",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/num.player",
      "status": "reference",
      "complete": false,
      "contractRef": "gameplay",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "chart",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。",
        "title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。",
        "触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。"
      ],
      "acceptanceRefs": "gameplay",
      "technicalFeasibilityRef": "gameplay",
      "limitationsRef": "gameplay"
    },
    {
      "id": "num.move",
      "name": "移动手感",
      "category": "NUM",
      "sub": "数值",
      "groupId": "gameplay",
      "sourceAnchor": "L5939:C100519",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/num.move",
      "status": "reference",
      "complete": false,
      "contractRef": "gameplay",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "chart",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。",
        "title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。",
        "触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。"
      ],
      "acceptanceRefs": "gameplay",
      "technicalFeasibilityRef": "gameplay",
      "limitationsRef": "gameplay"
    },
    {
      "id": "num.ai",
      "name": "敌人感知",
      "category": "NUM",
      "sub": "数值",
      "groupId": "actors",
      "sourceAnchor": "L6065:C60559",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/num.ai",
      "status": "reference",
      "complete": false,
      "contractRef": "actors",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "chart",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "actors",
      "technicalFeasibilityRef": "actors",
      "limitationsRef": "actors"
    },
    {
      "id": "num.weapon",
      "name": "武器数值",
      "category": "NUM",
      "sub": "数值",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6247",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/num.weapon",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "chart",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "num.waves",
      "name": "波次节奏",
      "category": "NUM",
      "sub": "数值",
      "groupId": "gameplay",
      "sourceAnchor": "L6202:C4994",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/num.waves",
      "status": "reference",
      "complete": false,
      "contractRef": "gameplay",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "chart",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。",
        "title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。",
        "触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。"
      ],
      "acceptanceRefs": "gameplay",
      "technicalFeasibilityRef": "gameplay",
      "limitationsRef": "gameplay"
    },
    {
      "id": "num.input",
      "name": "按键映射",
      "category": "NUM",
      "sub": "数值",
      "groupId": "gameplay",
      "sourceAnchor": "L5939:C92096",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/num.input",
      "status": "reference",
      "complete": false,
      "contractRef": "gameplay",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "chart",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。",
        "title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。",
        "触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。"
      ],
      "acceptanceRefs": "gameplay",
      "technicalFeasibilityRef": "gameplay",
      "limitationsRef": "gameplay"
    },
    {
      "id": "actor.gull",
      "name": "Gull 无人机",
      "category": "ACTOR",
      "sub": "敌人",
      "groupId": "actors",
      "sourceAnchor": "L6065:C32685",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/actor.gull",
      "status": "reference",
      "complete": false,
      "contractRef": "actors",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "actor",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "actors",
      "technicalFeasibilityRef": "actors",
      "limitationsRef": "actors"
    },
    {
      "id": "actor.hound",
      "name": "Hound 猎犬",
      "category": "ACTOR",
      "sub": "敌人",
      "groupId": "actors",
      "sourceAnchor": "L6065:C43130",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/actor.hound",
      "status": "reference",
      "complete": false,
      "contractRef": "actors",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "actor",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "actors",
      "technicalFeasibilityRef": "actors",
      "limitationsRef": "actors"
    },
    {
      "id": "actor.player",
      "name": "玩家",
      "category": "ACTOR",
      "sub": "玩家",
      "groupId": "gameplay",
      "sourceAnchor": "L5939:C100593",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/actor.player",
      "status": "reference",
      "complete": false,
      "contractRef": "gameplay",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "actor",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "input→game→player→weapon→enemies→fx/ground/level/backdrop/mats→audio→hud→render→endFrame。",
        "title/intro/playing/paused/dead/complete；三中继按住 E 2.4s、波次、撤离半径与结算。",
        "触控/键鼠/手柄来源、pointer lock 失败回退、设置存储、字幕/命中/生命/弹药/标记及 safe-area。"
      ],
      "acceptanceRefs": "gameplay",
      "technicalFeasibilityRef": "gameplay",
      "limitationsRef": "gameplay"
    },
    {
      "id": "weapon.pac9",
      "name": "PAC9 步枪",
      "category": "WEAPON",
      "sub": "武器",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C540",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/weapon.pac9",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "weapon",
      "catalogParameters": [
        [
          "弹匣",
          30,
          "发"
        ],
        [
          "备弹",
          150,
          "发"
        ],
        [
          "伤害",
          26,
          "每发"
        ],
        [
          "弱点倍率",
          2.2,
          "命中弱点"
        ],
        [
          "射速",
          720,
          "RPM"
        ],
        [
          "扩散",
          0.0125,
          "弧度"
        ],
        [
          "DPS",
          312,
          "派生"
        ],
        [
          "真实入口",
          "dm",
          "L6065:C540"
        ],
        [
          "模型常量",
          "mi",
          "L5939:C112703"
        ],
        [
          "枪口",
          [
            0,
            0,
            -0.531
          ],
          "mi.muzzle；原版模型常量"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.kickZ",
      "name": "后坐 · 前后",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6035",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.kickZ",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          520,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          30,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.kickPitch",
      "name": "后坐 · 俯仰",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6049",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.kickPitch",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          380,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          26,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.kickYaw",
      "name": "后坐 · 偏航",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6063",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.kickYaw",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          300,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          22,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.kickRoll",
      "name": "后坐 · 翻滚",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6077",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.kickRoll",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          300,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          20,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.swayYaw",
      "name": "挥动 · 偏航",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6091",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.swayYaw",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          110,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          15,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.swayPitch",
      "name": "挥动 · 俯仰",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6106",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.swayPitch",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          110,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          15,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.jumpY",
      "name": "落跳 · 纵向",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6121",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.jumpY",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          140,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          13,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.jumpPitch",
      "name": "落跳 · 俯仰",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6135",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.jumpPitch",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          140,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          13,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "spring.bump",
      "name": "碰撞 · 抖动",
      "category": "WEAPON",
      "sub": "弹簧",
      "groupId": "weapon",
      "sourceAnchor": "L6065:C6149",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/spring.bump",
      "status": "reference",
      "complete": false,
      "contractRef": "weapon",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "spring",
      "catalogParameters": [
        [
          "刚度 k",
          600,
          "恢复力系数"
        ],
        [
          "阻尼 c",
          30,
          "衰减系数"
        ],
        [
          "稳态",
          "1.000",
          "阶跃输入下的终值"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "本条数值/弹簧/定义与所属模型/动作时间线联合验收，图表不算模型或动作完成。"
      ],
      "acceptanceRefs": "weapon",
      "technicalFeasibilityRef": "weapon",
      "limitationsRef": "weapon"
    },
    {
      "id": "scene.level",
      "name": "关卡布局",
      "category": "SCENE",
      "sub": "场景层",
      "groupId": "warehouse",
      "sourceAnchor": "L5453:C131287",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/scene.level",
      "status": "pending",
      "complete": false,
      "contractRef": "warehouse",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "规模",
          "80 × 60 m",
          "场地边界"
        ],
        [
          "生成方式",
          "程序化",
          "无外部模型"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "仓库 28×17m，檐 7/脊 9.5；门/百叶/8 处屋面缺口、办公室、货架、风扇与灯线完整。",
        "同一建筑同步可见网格、碰撞、interiorBoxes、skylights、雨盒/檐滴、探针与体积尘区。",
        "hR/fR 原摆放、箱列堆高、叉车托货、楼梯猫道连接点、出生/掩体/中继/撤离登记。"
      ],
      "acceptanceRefs": "warehouse",
      "technicalFeasibilityRef": "warehouse",
      "limitationsRef": "warehouse"
    },
    {
      "id": "scene.backdrop",
      "name": "远景",
      "category": "SCENE",
      "sub": "场景层",
      "groupId": "backdrop",
      "sourceAnchor": "L5474:C361",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/scene.backdrop",
      "status": "pending",
      "complete": false,
      "contractRef": "backdrop",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "规模",
          "80 × 60 m",
          "场地边界"
        ],
        [
          "生成方式",
          "程序化",
          "无外部模型"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "岸线 X30、海面 -1.6、轨道 X18.5/28.5、梯 Z20、护舷/缆绳/泊位/碰撞与撤离同步。",
        "保留曲面船壳/艏艉收缩、船舱甲板、吊具/雷达/艇 hullGrp 层级；祖先 noMerge。",
        "固定 LCG 远港、简化吊机/货船/灯塔/海鸥与 update，不凭印象随机港区。"
      ],
      "acceptanceRefs": "backdrop",
      "technicalFeasibilityRef": "backdrop",
      "limitationsRef": "backdrop"
    },
    {
      "id": "scene.ground",
      "name": "地面与海面",
      "category": "SCENE",
      "sub": "场景层",
      "groupId": "ground",
      "sourceAnchor": "L5654:C569",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/scene.ground",
      "status": "pending",
      "complete": false,
      "contractRef": "ground",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "env",
      "catalogParameters": [
        [
          "规模",
          "80 × 60 m",
          "场地边界"
        ],
        [
          "生成方式",
          "程序化",
          "无外部模型"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "190×320 场坪至 X30；26 低洼点、蓄水/湿度/油污/磨损 mask、黄白线/轮痕与接缝。",
        "地面 Y0 镜像相机+oblique 裁剪与反射隐藏列表；海面 -1.6 自写大/小波、泡沫、环境反射。",
        "雨循环盒、室内盒/天窗/檐滴、雷事件、splash 关闭项与冷启动数量严格区分。"
      ],
      "acceptanceRefs": "ground",
      "technicalFeasibilityRef": "ground",
      "limitationsRef": "ground"
    },
    {
      "id": "q.test",
      "name": "TEST",
      "category": "NUM",
      "sub": "画质预设",
      "groupId": "render",
      "sourceAnchor": "L4191:C51671",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/q.test",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "quality",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "q.low",
      "name": "LOW",
      "category": "NUM",
      "sub": "画质预设",
      "groupId": "render",
      "sourceAnchor": "L4191:C51783",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/q.low",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "quality",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "q.medium",
      "name": "MEDIUM",
      "category": "NUM",
      "sub": "画质预设",
      "groupId": "render",
      "sourceAnchor": "L4191:C51897",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/q.medium",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "quality",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "q.high",
      "name": "HIGH",
      "category": "NUM",
      "sub": "画质预设",
      "groupId": "render",
      "sourceAnchor": "L4191:C52015",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/q.high",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "quality",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    },
    {
      "id": "q.ultra",
      "name": "ULTRA",
      "category": "NUM",
      "sub": "画质预设",
      "groupId": "render",
      "sourceAnchor": "L4191:C52129",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/q.ultra",
      "status": "reference",
      "complete": false,
      "contractRef": "render",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [],
      "currentPreview": "quality",
      "catalogParameters": [],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "暖阳 normalize(.916,.225,.331)、色(1,.72,.42)/强9、冷天空 PMREM/室内探针/PCSS 补丁与阴影视锥。",
        "HDR→深度→世界/武器→AO/体积→相机动模→Bloom→曝光/grade→手动sRGB→FXAA/颗粒，禁止重复 Gamma/ACES。",
        "Cf 粒子/弹孔/抛壳/灯池预算、事件顺序、纹理/深度输入和质量冷启动；env.install 的 FogExp2 不等价原体积。"
      ],
      "acceptanceRefs": "render",
      "technicalFeasibilityRef": "render",
      "limitationsRef": "render"
    }
  ],
  "props": [
    {
      "id": "prop.container20",
      "name": "20 尺集装箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.container20",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "尺寸",
          "6.06 × 2.59 × 2.44 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_red",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "M3",
          "源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "分派",
          "oneContainer",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ],
        [
          "focus",
          "seed=0 / doors=0 / wear=0.5 / color=red",
          "容器默认预览参数"
        ],
        [
          "真实波纹侧",
          "P=.278 / d=.036",
          "Uo；来自 M3/zA"
        ],
        [
          "真实波纹顶",
          "P=.209 / d=.020",
          "x1；来自 M3/zA"
        ],
        [
          "真实波纹端",
          "P=.250 / d=.042",
          "y1；来自 M3/zA"
        ],
        [
          "源码函数",
          "M3 / zA",
          "{'M3': 'L5453:C33336', 'zA': 'L5453:C24884'}"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "container20",
      "builder": "M3",
      "builderChain": [
        {
          "name": "M3",
          "call": "M3(e,i,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "doors",
        "seed",
        "wear"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneContainer",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "container20",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "M3/zA",
        "builderMatches": true,
        "vertices": 15102,
        "triangles": 5338,
        "meshes": 11,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "container20",
          "builder": "M3/zA",
          "vertices": "15102",
          "triangles": "5338",
          "doors": "0",
          "fail": null,
          "note": "原版 M3 → zA · 11 材质网格 · 15,102 顶点 · 5,338 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-container20.png",
        "href": "prop-container20.png",
        "exists": true,
        "sha256": "92503151adbd586de2e125bca4f74d19a3a10053e900b6fe302d101254651ab1",
        "bytes": 319557,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 5,
        "passed": 5,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:doors",
          "option:wear"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.container40",
      "name": "40 尺集装箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.container40",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "尺寸",
          "12.19 × 2.59 × 2.44 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_blue",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "M3",
          "源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "分派",
          "oneContainer",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ],
        [
          "focus",
          "seed=0 / doors=0 / wear=0.5 / color=blue",
          "容器默认预览参数"
        ],
        [
          "真实波纹侧",
          "P=.278 / d=.036",
          "Uo；来自 M3/zA"
        ],
        [
          "真实波纹顶",
          "P=.209 / d=.020",
          "x1；来自 M3/zA"
        ],
        [
          "真实波纹端",
          "P=.250 / d=.042",
          "y1；来自 M3/zA"
        ],
        [
          "源码函数",
          "M3 / zA",
          "{'M3': 'L5453:C33336', 'zA': 'L5453:C24884'}"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "container40",
      "builder": "M3",
      "builderChain": [
        {
          "name": "M3",
          "call": "M3(e,i,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "doors",
        "seed",
        "wear"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneContainer",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "container40",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "M3/zA",
        "builderMatches": true,
        "vertices": 18444,
        "triangles": 6452,
        "meshes": 11,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "container40",
          "builder": "M3/zA",
          "vertices": "18444",
          "triangles": "6452",
          "doors": "0",
          "fail": null,
          "note": "原版 M3 → zA · 11 材质网格 · 18,444 顶点 · 6,452 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-container40.png",
        "href": "prop-container40.png",
        "exists": true,
        "sha256": "fd362f35594cbc101105434df81fa16ed5aefa1d37dc7b393c7c5f186f8350f6",
        "bytes": 267964,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 5,
        "passed": 5,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:doors",
          "option:wear"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.container40hc",
      "name": "40 尺高柜",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33336",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.container40hc",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneContainer",
      "catalogParameters": [
        [
          "尺寸",
          "12.19 × 2.90 × 2.44 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_green",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "M3",
          "源码回调"
        ],
        [
          "注册组",
          "container-loop",
          "原版注册入口"
        ],
        [
          "分派",
          "oneContainer",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t)=>M3(e,i,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "M3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / doors / seed / wear",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ],
        [
          "focus",
          "seed=0 / doors=0 / wear=0.5 / color=green",
          "容器默认预览参数"
        ],
        [
          "真实波纹侧",
          "P=.278 / d=.036",
          "Uo；来自 M3/zA"
        ],
        [
          "真实波纹顶",
          "P=.209 / d=.020",
          "x1；来自 M3/zA"
        ],
        [
          "真实波纹端",
          "P=.250 / d=.042",
          "y1；来自 M3/zA"
        ],
        [
          "源码函数",
          "M3 / zA",
          "{'M3': 'L5453:C33336', 'zA': 'L5453:C24884'}"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "container40hc",
      "builder": "M3",
      "builderChain": [
        {
          "name": "M3",
          "call": "M3(e,i,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "doors",
        "seed",
        "wear"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneContainer",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "container40hc",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "M3/zA",
        "builderMatches": true,
        "vertices": 18476,
        "triangles": 6478,
        "meshes": 12,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "container40hc",
          "builder": "M3/zA",
          "vertices": "18476",
          "triangles": "6478",
          "doors": "0",
          "fail": null,
          "note": "原版 M3 → zA · 12 材质网格 · 18,476 顶点 · 6,478 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-container40hc.png",
        "href": "prop-container40hc.png",
        "exists": true,
        "sha256": "7811a9c9ecbae189f238e34680a046a9661d3f2a3d5b012151e119116d83db00",
        "bytes": 281551,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 5,
        "passed": 5,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:doors",
          "option:wear"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.jersey_barrier",
      "name": "混凝土隔离墩",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C33991",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.jersey_barrier",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 0.81 × 0.60 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "concrete",
          "指向材质实例"
        ],
        [
          "表面",
          "concrete",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "S3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "S3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "S3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed / stripe",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "jersey_barrier",
      "builder": "S3",
      "builderChain": [
        {
          "name": "S3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed",
        "stripe"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "jersey_barrier",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/jersey_barrier",
        "builderMatches": true,
        "vertices": 1680,
        "triangles": 604,
        "meshes": 2,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "jersey_barrier",
          "builder": "Yg/jersey_barrier",
          "vertices": "1680",
          "triangles": "604",
          "prop": "jersey_barrier",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → jersey_barrier · 2 网格 · 1,680 顶点 · 604 三角 · 2 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-jersey_barrier.png",
        "href": "prop-jersey_barrier.png",
        "exists": true,
        "sha256": "187d299dbc5b79f844105897c4a04bdcdadf115f01fda82846ff7161d516406e",
        "bytes": 238326,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:stripe"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.light_mast",
      "name": "高杆灯",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C36210",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.light_mast",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.50 × 14.00 × 0.50 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_galv",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "T3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "T3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "T3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "on",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "light_mast",
      "builder": "T3",
      "builderChain": [
        {
          "name": "T3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "on"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive",
        "get"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "light_mast",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/light_mast",
        "builderMatches": true,
        "vertices": 6771,
        "triangles": 2794,
        "meshes": 5,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "light_mast",
          "builder": "Yg/light_mast",
          "vertices": "6771",
          "triangles": "2794",
          "prop": "light_mast",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → light_mast · 5 网格 · 6,771 顶点 · 2,794 三角 · 2 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-light_mast.png",
        "href": "prop-light_mast.png",
        "exists": true,
        "sha256": "4846ed84ea5d2c2167f185a600275a9c29cf08a0cc6e43309cc9674fdeb05aeb",
        "bytes": 86779,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:on"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.fence_panel",
      "name": "围栏片",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C38499",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.fence_panel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 2.40 × 0.08 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "chainlink",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "A3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "A3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "A3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "lean / posts / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "fence_panel",
      "builder": "A3",
      "builderChain": [
        {
          "name": "A3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "lean",
        "posts",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "fence_panel",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/fence_panel",
        "builderMatches": true,
        "vertices": 1894,
        "triangles": 1142,
        "meshes": 3,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "fence_panel",
          "builder": "Yg/fence_panel",
          "vertices": "1894",
          "triangles": "1142",
          "prop": "fence_panel",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → fence_panel · 3 网格 · 1,894 顶点 · 1,142 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-fence_panel.png",
        "href": "prop-fence_panel.png",
        "exists": true,
        "sha256": "7fcb9c0a88e4c1022b91facfbb6172257ce3a7e94033134407b81eef6d1029ba",
        "bytes": 258702,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:lean",
          "option:posts"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.guard_booth",
      "name": "岗亭",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C39956",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.guard_booth",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.60 × 2.70 × 2.20 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_white",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "R3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "R3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "R3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / on / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "guard_booth",
      "builder": "R3",
      "builderChain": [
        {
          "name": "R3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "on",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "guard_booth",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/guard_booth",
        "builderMatches": true,
        "vertices": 5661,
        "triangles": 3088,
        "meshes": 15,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "guard_booth",
          "builder": "Yg/guard_booth",
          "vertices": "5661",
          "triangles": "3088",
          "prop": "guard_booth",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → guard_booth · 15 网格 · 5,661 顶点 · 3,088 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-guard_booth.png",
        "href": "prop-guard_booth.png",
        "exists": true,
        "sha256": "b78333221bce611b10c320b7e5c797f7f81a8524b285f264047cd42dc33fe722",
        "bytes": 242735,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:on"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.gate_arm",
      "name": "道闸杆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C44205",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.gate_arm",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "5.00 × 1.10 × 0.30 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "hazard_stripes",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "C3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "C3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "C3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "open",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "gate_arm",
      "builder": "C3",
      "builderChain": [
        {
          "name": "C3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "open"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive",
        "get"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "gate_arm",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/gate_arm",
        "builderMatches": true,
        "vertices": 848,
        "triangles": 1132,
        "meshes": 11,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "gate_arm",
          "builder": "Yg/gate_arm",
          "vertices": "848",
          "triangles": "1132",
          "prop": "gate_arm",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → gate_arm · 11 网格 · 848 顶点 · 1,132 三角 · 3 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-gate_arm.png",
        "href": "prop-gate_arm.png",
        "exists": true,
        "sha256": "28e5a07d014ba4b07e41cd3c3443a723f8f2ddff304fea3baad2a7dc9ecb7251",
        "bytes": 108082,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [
        {
          "path": "outputs/prop-gate_arm-variant.png",
          "href": "prop-gate_arm-variant.png",
          "exists": true,
          "sha256": "68c3e50053be4365a6f9a1754636cedd7cd77ac4581ff4d0f2a051fc0c5e6c92",
          "bytes": 73403,
          "versionBound": false,
          "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
        }
      ],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:open"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.bollard_mooring",
      "name": "系缆柱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C45841",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.bollard_mooring",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.70 × 0.60 × 0.70 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_dark",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "P3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "P3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "P3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "bollard_mooring",
      "builder": "P3",
      "builderChain": [
        {
          "name": "P3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "bollard_mooring",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/bollard_mooring",
        "builderMatches": true,
        "vertices": 1894,
        "triangles": 1304,
        "meshes": 2,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "bollard_mooring",
          "builder": "Yg/bollard_mooring",
          "vertices": "1894",
          "triangles": "1304",
          "prop": "bollard_mooring",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → bollard_mooring · 2 网格 · 1,894 顶点 · 1,304 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-bollard_mooring.png",
        "href": "prop-bollard_mooring.png",
        "exists": true,
        "sha256": "80d3fe4762eece1cdaf9e60a79accbca58a22058dc58b4db7de0150c973367a6",
        "bytes": 176468,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.bollard_post",
      "name": "警示柱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C46774",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.bollard_post",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.17 × 1.00 × 0.17 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "I3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "I3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "I3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "bollard_post",
      "builder": "I3",
      "builderChain": [
        {
          "name": "I3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "bollard_post",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/bollard_post",
        "builderMatches": true,
        "vertices": 512,
        "triangles": 478,
        "meshes": 2,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "bollard_post",
          "builder": "Yg/bollard_post",
          "vertices": "512",
          "triangles": "478",
          "prop": "bollard_post",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → bollard_post · 2 网格 · 512 顶点 · 478 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-bollard_post.png",
        "href": "prop-bollard_post.png",
        "exists": true,
        "sha256": "a54387ba53764aa573c51aa01c8769abf5f9e1b98ea6ce90eac56917e617eec2",
        "bytes": 108570,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.relay_node",
      "name": "中继节点",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C61318",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.relay_node",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 2.40 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_grey",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "B3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "B3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "B3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "id / label / seed / state",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "relay_node",
      "builder": "B3",
      "builderChain": [
        {
          "name": "B3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "id",
        "label",
        "seed",
        "state"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": true,
        "setState": true,
        "noMerge": true,
        "userData": true
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "relay_node",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/relay_node",
        "builderMatches": true,
        "vertices": 9975,
        "triangles": 5908,
        "meshes": 20,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "relay_node",
          "builder": "Yg/relay_node",
          "vertices": "9975",
          "triangles": "5908",
          "prop": "relay_node",
          "dynamic": "true",
          "state": "live",
          "level": "6.367855526694164",
          "fail": null,
          "note": "原版 Yg.build → relay_node · 20 网格 · 9,975 顶点 · 5,908 三角 · 3 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-relay_node.png",
        "href": "prop-relay_node.png",
        "exists": true,
        "sha256": "3ab59eb93011d93427cc8d8975a147156b7d80d771b83269c6c85211c42e12a6",
        "bytes": 161576,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [
        {
          "path": "outputs/prop-relay_node-cut.png",
          "href": "prop-relay_node-cut.png",
          "exists": true,
          "sha256": "d065f1b0fb76c1459650c1f2e3040d8cf6116845865ed720d4e9e825af1a60e9",
          "bytes": 143734,
          "versionBound": false,
          "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
        }
      ],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 5,
        "passed": 5,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:id",
          "option:label",
          "option:state"
        ],
        "dynamicSamples": 45,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.shelf_rack",
      "name": "货架",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C55732",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.shelf_rack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.70 × 4.20 × 1.10 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_orange",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "U3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "U3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "U3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "shelf_rack",
      "builder": "U3",
      "builderChain": [
        {
          "name": "U3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "shelf_rack",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/shelf_rack",
        "builderMatches": true,
        "vertices": 9716,
        "triangles": 6394,
        "meshes": 14,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "shelf_rack",
          "builder": "Yg/shelf_rack",
          "vertices": "9716",
          "triangles": "6394",
          "prop": "shelf_rack",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → shelf_rack · 14 网格 · 9,716 顶点 · 6,394 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-shelf_rack.png",
        "href": "prop-shelf_rack.png",
        "exists": true,
        "sha256": "2adda3d8fba519e94fa445058977238fa7618849eb04fad05beb2b9fbe0e2134",
        "bytes": 219858,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.stairs_metal",
      "name": "钢楼梯",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C50747",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.stairs_metal",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 2.60 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "diamond_plate",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "k3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "k3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "k3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "未写",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "stairs_metal",
      "builder": "k3",
      "builderChain": [
        {
          "name": "k3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "stairs_metal",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/stairs_metal",
        "builderMatches": true,
        "vertices": 2920,
        "triangles": 3152,
        "meshes": 4,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "stairs_metal",
          "builder": "Yg/stairs_metal",
          "vertices": "2920",
          "triangles": "3152",
          "prop": "stairs_metal",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → stairs_metal · 4 网格 · 2,920 顶点 · 3,152 三角 · 17 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-stairs_metal.png",
        "href": "prop-stairs_metal.png",
        "exists": true,
        "sha256": "4492f71e7e1540bf23e57040bb27f29d183a83c27f1abd74ec7193ae5818173b",
        "bytes": 137588,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.catwalk",
      "name": "检修走道",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C52818",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.catwalk",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.00 × 1.10 × 1.20 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "diamond_plate",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "F3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "F3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "F3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "rails",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "catwalk",
      "builder": "F3",
      "builderChain": [
        {
          "name": "F3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "rails"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "catwalk",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/catwalk",
        "builderMatches": true,
        "vertices": 2212,
        "triangles": 1508,
        "meshes": 3,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "catwalk",
          "builder": "Yg/catwalk",
          "vertices": "2212",
          "triangles": "1508",
          "prop": "catwalk",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → catwalk · 3 网格 · 2,212 顶点 · 1,508 三角 · 3 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-catwalk.png",
        "href": "prop-catwalk.png",
        "exists": true,
        "sha256": "a7d31eb920c92b10360958e4fcf24c8928007e156be5df0854ee0dbc75258805",
        "bytes": 229014,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [
        {
          "path": "outputs/prop-catwalk-variant.png",
          "href": "prop-catwalk-variant.png",
          "exists": true,
          "sha256": "180930fcedc65b834e2ca6abb05a55e0bd45ef9e0b689f2f93e4c58b25ed15f9",
          "bytes": 203663,
          "versionBound": false,
          "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
        }
      ],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:rails"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.reefer_unit",
      "name": "冷机",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C57696",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.reefer_unit",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.50 × 2.30 × 2.30 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_white",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "N3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "N3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "N3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "flip / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "reefer_unit",
      "builder": "N3",
      "builderChain": [
        {
          "name": "N3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "flip",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "reefer_unit",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/reefer_unit",
        "builderMatches": true,
        "vertices": 5285,
        "triangles": 3580,
        "meshes": 14,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "reefer_unit",
          "builder": "Yg/reefer_unit",
          "vertices": "5285",
          "triangles": "3580",
          "prop": "reefer_unit",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → reefer_unit · 14 网格 · 5,285 顶点 · 3,580 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-reefer_unit.png",
        "href": "prop-reefer_unit.png",
        "exists": true,
        "sha256": "e5fb2654f559c5207f72a7a5f2698b82764db28072bcc0d5d5079ef14d8c5d96",
        "bytes": 170317,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:flip"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.barrel",
      "name": "油桶",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C81434",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.barrel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.60 × 0.90 × 0.60 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_blue",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "HA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`,()=>HA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "HA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / lying / open / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "barrel",
      "builder": "HA",
      "builderChain": [
        {
          "name": "wf",
          "call": "wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`,()=>HA(e,t,n))",
          "role": "wrapper"
        },
        {
          "name": "HA",
          "call": "HA(e,t,n)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "lying",
        "open",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "barrel",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/barrel",
        "builderMatches": true,
        "vertices": 722,
        "triangles": 1048,
        "meshes": 4,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "barrel",
          "builder": "Yg/barrel",
          "vertices": "722",
          "triangles": "1048",
          "prop": "barrel",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → barrel · 4 网格 · 722 顶点 · 1,048 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-barrel.png",
        "href": "prop-barrel.png",
        "exists": true,
        "sha256": "3d3a1ac43e1e2a32c63842e6f256ba3fa78d4cfac7f53db3b5a7f8b23e145b37",
        "bytes": 154677,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [
        {
          "path": "outputs/prop-barrel-variant.png",
          "href": "prop-barrel-variant.png",
          "exists": true,
          "sha256": "3a9448c2c274d3512be8a442cbc605ab23720045fed0b5f59dd528aec942e70b",
          "bytes": 185040,
          "versionBound": false,
          "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
        }
      ],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 5,
        "passed": 5,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:lying",
          "option:open"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.pallet",
      "name": "托盘",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C84155",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.pallet",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 0.14 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "VA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%4;return wf(`pallet|${!!t.broken}|${n}`,()=>VA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "VA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "broken / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "pallet",
      "builder": "VA",
      "builderChain": [
        {
          "name": "wf",
          "call": "wf(`pallet|${!!t.broken}|${n}`,()=>VA(e,t,n))",
          "role": "wrapper"
        },
        {
          "name": "VA",
          "call": "VA(e,t,n)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "broken",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "pallet",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/pallet",
        "builderMatches": true,
        "vertices": 560,
        "triangles": 632,
        "meshes": 2,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "pallet",
          "builder": "Yg/pallet",
          "vertices": "560",
          "triangles": "632",
          "prop": "pallet",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → pallet · 2 网格 · 560 顶点 · 632 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-pallet.png",
        "href": "prop-pallet.png",
        "exists": true,
        "sha256": "3a8ee949da4e16e61cc01ad4cec441658406b256c1f18ed426dd064319dae8a6",
        "bytes": 196221,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [
        {
          "path": "outputs/prop-pallet-variant.png",
          "href": "prop-pallet-variant.png",
          "exists": true,
          "sha256": "3a6d10713de89bf7019e1f90364d1d43fa3cbbc93b453edf13416ebfd9222326",
          "bytes": 193625,
          "versionBound": false,
          "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
        }
      ],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:broken"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.pallet_stack",
      "name": "托盘堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C84260",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.pallet_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 1.15 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "WA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>WA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "WA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "count / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "pallet_stack",
      "builder": "WA",
      "builderChain": [
        {
          "name": "WA",
          "call": "WA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "count",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "pallet_stack",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/pallet_stack",
        "builderMatches": true,
        "vertices": 4416,
        "triangles": 2560,
        "meshes": 2,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "pallet_stack",
          "builder": "Yg/pallet_stack",
          "vertices": "4416",
          "triangles": "2560",
          "prop": "pallet_stack",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → pallet_stack · 2 网格 · 4,416 顶点 · 2,560 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-pallet_stack.png",
        "href": "prop-pallet_stack.png",
        "exists": true,
        "sha256": "f86750b3e6315b8f58070b10adbb5c31ac6ebda0ae576c2602a5295ab3033808",
        "bytes": 309323,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:count"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.crate_wood",
      "name": "木箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C87218",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.crate_wood",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.10 × 1.00 × 0.90 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "GA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>GA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "GA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "code / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "crate_wood",
      "builder": "GA",
      "builderChain": [
        {
          "name": "GA",
          "call": "GA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "code",
        "label",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "crate_wood",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/crate_wood",
        "builderMatches": true,
        "vertices": 1288,
        "triangles": 1476,
        "meshes": 7,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "crate_wood",
          "builder": "Yg/crate_wood",
          "vertices": "1288",
          "triangles": "1476",
          "prop": "crate_wood",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → crate_wood · 7 网格 · 1,288 顶点 · 1,476 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-crate_wood.png",
        "href": "prop-crate_wood.png",
        "exists": true,
        "sha256": "0b1c5e517a3d6c26675b62fddd396722107e386458a8962c1ba082826537ef41",
        "bytes": 297911,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:code",
          "option:label"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.crate_stack",
      "name": "木箱堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C87423",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.crate_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 1.90 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_pallet",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "qA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>qA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "qA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "crate_stack",
      "builder": "qA",
      "builderChain": [
        {
          "name": "qA",
          "call": "qA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "crate_stack",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/crate_stack",
        "builderMatches": true,
        "vertices": 3248,
        "triangles": 2552,
        "meshes": 12,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "crate_stack",
          "builder": "Yg/crate_stack",
          "vertices": "3248",
          "triangles": "2552",
          "prop": "crate_stack",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → crate_stack · 12 网格 · 3,248 顶点 · 2,552 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-crate_stack.png",
        "href": "prop-crate_stack.png",
        "exists": true,
        "sha256": "4c651c3eb1194a887cc2c31d25ac5a450ad7381dccf916b81ca229f11f34c897",
        "bytes": 233701,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.ibc_tote",
      "name": "吨桶",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C88417",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.ibc_tote",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.20 × 1.16 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "plastic_grey",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "XA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>XA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "XA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "ibc_tote",
      "builder": "XA",
      "builderChain": [
        {
          "name": "XA",
          "call": "XA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "ibc_tote",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/ibc_tote",
        "builderMatches": true,
        "vertices": 1937,
        "triangles": 2122,
        "meshes": 9,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "ibc_tote",
          "builder": "Yg/ibc_tote",
          "vertices": "1937",
          "triangles": "2122",
          "prop": "ibc_tote",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → ibc_tote · 9 网格 · 1,937 顶点 · 2,122 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-ibc_tote.png",
        "href": "prop-ibc_tote.png",
        "exists": true,
        "sha256": "0f4327bd806a07cfe0bc16871d4d611e13593aa41fa85ff1e00fef4eb0758b30",
        "bytes": 256039,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.forklift",
      "name": "叉车",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C111029",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.forklift",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "3.40 × 2.20 × 1.25 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "oR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>oR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "oR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / forksUp / number / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "forklift",
      "builder": "oR",
      "builderChain": [
        {
          "name": "oR",
          "call": "oR(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "forksUp",
        "number",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "forklift",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/forklift",
        "builderMatches": true,
        "vertices": 10987,
        "triangles": 11628,
        "meshes": 21,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "forklift",
          "builder": "Yg/forklift",
          "vertices": "10987",
          "triangles": "11628",
          "prop": "forklift",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → forklift · 21 网格 · 10,987 顶点 · 11,628 三角 · 11 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-forklift.png",
        "href": "prop-forklift.png",
        "exists": true,
        "sha256": "320874d29b01ed78baf10dafce7604c4c8230da0f49a67b5cda10f6191bfaf3f",
        "bytes": 189000,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [
        {
          "path": "outputs/prop-forklift-variant.png",
          "href": "prop-forklift-variant.png",
          "exists": true,
          "sha256": "d79a5be759fb9a3550bcc3a2f9762829aa2114a22bebe2557b560dbcf4f297a2",
          "bytes": 166556,
          "versionBound": false,
          "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
        }
      ],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 5,
        "passed": 5,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:forksUp",
          "option:number"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.cable_reel",
      "name": "电缆盘",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C91648",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.cable_reel",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.30 × 1.30 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "wood_dark",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "YA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>YA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "YA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "cable_reel",
      "builder": "YA",
      "builderChain": [
        {
          "name": "YA",
          "call": "YA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "cable_reel",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/cable_reel",
        "builderMatches": true,
        "vertices": 2131,
        "triangles": 2442,
        "meshes": 10,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "cable_reel",
          "builder": "Yg/cable_reel",
          "vertices": "2131",
          "triangles": "2442",
          "prop": "cable_reel",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → cable_reel · 10 网格 · 2,131 顶点 · 2,442 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-cable_reel.png",
        "href": "prop-cable_reel.png",
        "exists": true,
        "sha256": "a3cc3e52e5c83135930ba20395ba27a6d726e7ed002487b60a74079e2c05c97d",
        "bytes": 223795,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.tire_stack",
      "name": "轮胎堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C94138",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.tire_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.80 × 1.00 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "tire",
          "指向材质实例"
        ],
        [
          "表面",
          "rubber",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "$A",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>$A(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "$A",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "count / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "tire_stack",
      "builder": "$A",
      "builderChain": [
        {
          "name": "$A",
          "call": "$A(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "count",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "tire_stack",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/tire_stack",
        "builderMatches": true,
        "vertices": 1680,
        "triangles": 2560,
        "meshes": 1,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "tire_stack",
          "builder": "Yg/tire_stack",
          "vertices": "1680",
          "triangles": "2560",
          "prop": "tire_stack",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → tire_stack · 1 网格 · 1,680 顶点 · 2,560 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-tire_stack.png",
        "href": "prop-tire_stack.png",
        "exists": true,
        "sha256": "7a68e5c36debbad1aa90e4b81c8ad51839ec06101d0daaefc2587a785ed38eac",
        "bytes": 207114,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:count"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.dumpster",
      "name": "垃圾箱",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C124584",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.dumpster",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.90 × 1.35 × 1.10 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_green",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "aR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>aR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "aR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "dumpster",
      "builder": "aR",
      "builderChain": [
        {
          "name": "aR",
          "call": "aR(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "label",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "dumpster",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/dumpster",
        "builderMatches": true,
        "vertices": 2480,
        "triangles": 2742,
        "meshes": 12,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "dumpster",
          "builder": "Yg/dumpster",
          "vertices": "2480",
          "triangles": "2742",
          "prop": "dumpster",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → dumpster · 12 网格 · 2,480 顶点 · 2,742 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-dumpster.png",
        "href": "prop-dumpster.png",
        "exists": true,
        "sha256": "2e6079aa9e462d0e3f01886724ad5b1afeaf73bb77881e5b526e74bbf5de1e5d",
        "bytes": 202961,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:label"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.generator",
      "name": "发电机",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C120182",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.generator",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.20 × 1.40 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "rR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>rR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "rR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "generator",
      "builder": "rR",
      "builderChain": [
        {
          "name": "rR",
          "call": "rR(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "label",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "emissive"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "generator",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/generator",
        "builderMatches": true,
        "vertices": 3901,
        "triangles": 2962,
        "meshes": 17,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "generator",
          "builder": "Yg/generator",
          "vertices": "3901",
          "triangles": "2962",
          "prop": "generator",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → generator · 17 网格 · 3,901 顶点 · 2,962 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-generator.png",
        "href": "prop-generator.png",
        "exists": true,
        "sha256": "22da2035bd0ed31a730a07c8d348b52f3ec6978710fc365757c2f080d14d5b35",
        "bytes": 229189,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:label"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.jerry_can",
      "name": "油壶",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C94549",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.jerry_can",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.35 × 0.47 × 0.17 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_green",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "ZA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%2;return wf(`jerry|${t.color}|${n}`,()=>ZA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "ZA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "jerry_can",
      "builder": "ZA",
      "builderChain": [
        {
          "name": "wf",
          "call": "wf(`jerry|${t.color}|${n}`,()=>ZA(e,t,n))",
          "role": "wrapper"
        },
        {
          "name": "ZA",
          "call": "ZA(e,t,n)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "jerry_can",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/jerry_can",
        "builderMatches": true,
        "vertices": 640,
        "triangles": 884,
        "meshes": 4,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "jerry_can",
          "builder": "Yg/jerry_can",
          "vertices": "640",
          "triangles": "884",
          "prop": "jerry_can",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → jerry_can · 4 网格 · 640 顶点 · 884 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-jerry_can.png",
        "href": "prop-jerry_can.png",
        "exists": true,
        "sha256": "212017373ad9f4e8a7ff3a5487f137decb826c2d52d2fa6b81e28a2634b71d5f",
        "bytes": 163606,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.traffic_cone",
      "name": "锥筒",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C95819",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.traffic_cone",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.36 × 0.70 × 0.36 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "plastic_red",
          "指向材质实例"
        ],
        [
          "表面",
          "rubber",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "jA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>{let n=Math.abs(t.seed|0)%3;return wf(`cone|${!!t.lying}|${n}`,()=>jA(e,t,n))}",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "jA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "lying / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "traffic_cone",
      "builder": "jA",
      "builderChain": [
        {
          "name": "wf",
          "call": "wf(`cone|${!!t.lying}|${n}`,()=>jA(e,t,n))",
          "role": "wrapper"
        },
        {
          "name": "jA",
          "call": "jA(e,t,n)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "lying",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "traffic_cone",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/traffic_cone",
        "builderMatches": true,
        "vertices": 313,
        "triangles": 380,
        "meshes": 3,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "traffic_cone",
          "builder": "Yg/traffic_cone",
          "vertices": "313",
          "triangles": "380",
          "prop": "traffic_cone",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → traffic_cone · 3 网格 · 313 顶点 · 380 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-traffic_cone.png",
        "href": "prop-traffic_cone.png",
        "exists": true,
        "sha256": "8499f562f628caea97a60f514da46ca6f40a87a347fbb2d59d21ac7edb75f271",
        "bytes": 128769,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:lying"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.gas_cylinders",
      "name": "气瓶组",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C96606",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.gas_cylinders",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.90 × 1.60 × 0.50 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_dark",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "JA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>JA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "JA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "gas_cylinders",
      "builder": "JA",
      "builderChain": [
        {
          "name": "JA",
          "call": "JA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "gas_cylinders",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/gas_cylinders",
        "builderMatches": true,
        "vertices": 2179,
        "triangles": 2822,
        "meshes": 13,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "gas_cylinders",
          "builder": "Yg/gas_cylinders",
          "vertices": "2179",
          "triangles": "2822",
          "prop": "gas_cylinders",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → gas_cylinders · 13 网格 · 2,179 顶点 · 2,822 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-gas_cylinders.png",
        "href": "prop-gas_cylinders.png",
        "exists": true,
        "sha256": "a0e75b002ab98a52e5ff1214a3ebcede3cc3612e582cb555e23a029ee1184163",
        "bytes": 157966,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.tarp_cargo",
      "name": "苫布货堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C101726",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.tarp_cargo",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.40 × 1.50 × 1.40 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "tarp",
          "指向材质实例"
        ],
        [
          "表面",
          "dirt",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "QA",
          "源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>QA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "QA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "tarp_cargo",
      "builder": "QA",
      "builderChain": [
        {
          "name": "QA",
          "call": "QA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "tarp_cargo",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/tarp_cargo",
        "builderMatches": true,
        "vertices": 2618,
        "triangles": 2976,
        "meshes": 6,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "tarp_cargo",
          "builder": "Yg/tarp_cargo",
          "vertices": "2618",
          "triangles": "2976",
          "prop": "tarp_cargo",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → tarp_cargo · 6 网格 · 2,618 顶点 · 2,976 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-tarp_cargo.png",
        "href": "prop-tarp_cargo.png",
        "exists": true,
        "sha256": "2eab3ff7944e7603609a389d3f7e8a269bc54cd732c10b339ce4aa36b20491e0",
        "bytes": 225802,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.sandbags",
      "name": "沙袋",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C105847",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.sandbags",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "2.00 × 0.90 × 0.60 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "tarp",
          "指向材质实例"
        ],
        [
          "表面",
          "dirt",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "tR",
          "源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>tR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "tR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "courses / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "sandbags",
      "builder": "tR",
      "builderChain": [
        {
          "name": "tR",
          "call": "tR(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "courses",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "sandbags",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/sandbags",
        "builderMatches": true,
        "vertices": 3024,
        "triangles": 2646,
        "meshes": 1,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "sandbags",
          "builder": "Yg/sandbags",
          "vertices": "3024",
          "triangles": "2646",
          "prop": "sandbags",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → sandbags · 1 网格 · 3,024 顶点 · 2,646 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-sandbags.png",
        "href": "prop-sandbags.png",
        "exists": true,
        "sha256": "56620dc6b30c5fb07da265838132127792117732668d32a6f42f463cfa2c8ff5",
        "bytes": 246954,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:courses"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.toolbox_cart",
      "name": "工具车",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C127775",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.toolbox_cart",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.90 × 0.95 × 0.50 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "plastic_red",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "lR",
          "源码回调"
        ],
        [
          "注册组",
          "sb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>lR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "lR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "color / label / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "toolbox_cart",
      "builder": "lR",
      "builderChain": [
        {
          "name": "lR",
          "call": "lR(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "color",
        "label",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "toolbox_cart",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/toolbox_cart",
        "builderMatches": true,
        "vertices": 2384,
        "triangles": 2336,
        "meshes": 15,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "toolbox_cart",
          "builder": "Yg/toolbox_cart",
          "vertices": "2384",
          "triangles": "2336",
          "prop": "toolbox_cart",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → toolbox_cart · 15 网格 · 2,384 顶点 · 2,336 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-toolbox_cart.png",
        "href": "prop-toolbox_cart.png",
        "exists": true,
        "sha256": "e1719d163b0bdc7376df1259bc6051b2f77357f890feebc0703f8c8e3b420fe6",
        "bytes": 198262,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:color",
          "option:label"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.floodlight_stand",
      "name": "移动泛光灯",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C48964",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.floodlight_stand",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.00 × 2.20 × 1.00 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_yellow",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "D3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "D3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "D3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "on / seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "floodlight_stand",
      "builder": "D3",
      "builderChain": [
        {
          "name": "D3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "on",
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "emissive"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "floodlight_stand",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/floodlight_stand",
        "builderMatches": true,
        "vertices": 1446,
        "triangles": 1398,
        "meshes": 5,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "floodlight_stand",
          "builder": "Yg/floodlight_stand",
          "vertices": "1446",
          "triangles": "1398",
          "prop": "floodlight_stand",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → floodlight_stand · 5 网格 · 1,446 顶点 · 1,398 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-floodlight_stand.png",
        "href": "prop-floodlight_stand.png",
        "exists": true,
        "sha256": "1043b5642495d60513f31f93cda4d90e6853bbd21dae41459bb21f9f72bec105",
        "bytes": 109250,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 3,
        "passed": 3,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:on"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.cardboard_boxes",
      "name": "纸箱堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C108905",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.cardboard_boxes",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "1.00 × 0.80 × 0.80 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "cardboard",
          "指向材质实例"
        ],
        [
          "表面",
          "wood",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "nR",
          "源码回调"
        ],
        [
          "注册组",
          "eb",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>nR(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "nR",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "cardboard_boxes",
      "builder": "nR",
      "builderChain": [
        {
          "name": "nR",
          "call": "nR(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "cardboard_boxes",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/cardboard_boxes",
        "builderMatches": true,
        "vertices": 1242,
        "triangles": 1472,
        "meshes": 8,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "cardboard_boxes",
          "builder": "Yg/cardboard_boxes",
          "vertices": "1242",
          "triangles": "1472",
          "prop": "cardboard_boxes",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → cardboard_boxes · 8 网格 · 1,242 顶点 · 1,472 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-cardboard_boxes.png",
        "href": "prop-cardboard_boxes.png",
        "exists": true,
        "sha256": "e547961d71c87c4954d102ff301000a205bdd24f45f17d8e9c27ed6e0b9aa682",
        "bytes": 195636,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.pipe_stack",
      "name": "管材堆",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C99053",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.pipe_stack",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "6.00 × 0.90 × 1.20 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "steel_rust",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "KA",
          "源码回调"
        ],
        [
          "注册组",
          "J3",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "(e,t={})=>KA(e,t)",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "KA",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "pipe_stack",
      "builder": "KA",
      "builderChain": [
        {
          "name": "KA",
          "call": "KA(e,t)",
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "pipe_stack",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/pipe_stack",
        "builderMatches": true,
        "vertices": 1795,
        "triangles": 2104,
        "meshes": 6,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "pipe_stack",
          "builder": "Yg/pipe_stack",
          "vertices": "1795",
          "triangles": "2104",
          "prop": "pipe_stack",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → pipe_stack · 6 网格 · 1,795 顶点 · 2,104 三角 · 1 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-pipe_stack.png",
        "href": "prop-pipe_stack.png",
        "exists": true,
        "sha256": "807b6a443185a33b755cad77f41a17345bb18ac6a008233754f0e93d4a215e91",
        "bytes": 179549,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 2,
        "passed": 2,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    },
    {
      "id": "prop.sign_post",
      "name": "标志牌",
      "category": "MODEL",
      "sub": "道具",
      "groupId": "props",
      "sourceAnchor": "L5453:C47827",
      "sourceHash": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
      "href": "../index.html#/a/prop.sign_post",
      "status": "verified_scope",
      "complete": false,
      "contractRef": "props",
      "conditionRefs": [
        "source",
        "structure",
        "runtime",
        "behavior",
        "lifecycle",
        "evidence"
      ],
      "evidenceRefs": [
        "outputs/props-verification.json"
      ],
      "currentPreview": "oneProp",
      "catalogParameters": [
        [
          "尺寸",
          "0.60 × 2.40 × 0.08 m",
          "宽 × 高 × 深"
        ],
        [
          "材质",
          "paint_white",
          "指向材质实例"
        ],
        [
          "表面",
          "metal",
          "脚步/弹着音采样类型"
        ],
        [
          "建模器",
          "z3",
          "源码回调"
        ],
        [
          "注册组",
          "direct",
          "原版注册入口"
        ],
        [
          "分派",
          "oneProp → buildProp",
          "容器保留原分派，其余调用真实 buildProp"
        ],
        [
          "真实回调链",
          "z3",
          "原版注册回调；来自 build/props-source.json"
        ],
        [
          "innerBuilders",
          "z3",
          "真实内部构造入口"
        ],
        [
          "optionKeys",
          "seed / sign / text",
          "源码实际消费的选项，不猜默认值"
        ],
        [
          "预览状态",
          "已接入真实建模器",
          "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价"
        ]
      ],
      "specificConditions": [
        "逐字段核对本条参数的单位、默认值、消费点与运行结果；原台账参数描述本身不构成通过证明。",
        "Gi 登记尺寸与突出细节实测 bbox 分开；保留 position/normal/uv/color/index、材质槽、层级与独立碰撞。",
        "M3 六档 seed 变体、doors 0.1、wear 0/.5/1、八色；开门内壁/地板/门碰撞不得省略。",
        "B3 保留 relay_dynamic/noMerge、setState(live/cutting/cut)、update；灯杆/泛光灯 lamps 数据必须有消费者。"
      ],
      "acceptanceRefs": "props",
      "technicalFeasibilityRef": "props",
      "limitationsRef": "props",
      "detail": "逐件结构/所测选项证据；纹理/整机外观/生命周期未完成。",
      "propId": "sign_post",
      "builder": "z3",
      "builderChain": [
        {
          "name": "z3",
          "call": null,
          "role": "builder"
        }
      ],
      "optionKeys": [
        "seed",
        "sign",
        "text"
      ],
      "defaultOptions": {},
      "materialDependencies": [
        "decal",
        "get",
        "label"
      ],
      "dynamicHooks": {
        "update": false,
        "setState": false,
        "noMerge": false,
        "userData": false
      },
      "previewWiring": {
        "declared": "oneProp",
        "bundled": false,
        "runtimeVerified": true,
        "versionBound": true,
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "reportHref": "props-ui-verification.json",
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "note": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。"
      },
      "uiEvidence": {
        "propId": "sign_post",
        "status": "verified_scope",
        "runtimeVerified": true,
        "matchedRows": 1,
        "canvasBuilder": "Yg/sign_post",
        "builderMatches": true,
        "vertices": 504,
        "triangles": 620,
        "meshes": 7,
        "metricsSource": "UI 报告 canvas.dataset；meshes 从原 row.note 明确数值读取",
        "scope": "逐件页面 canvas 构建、vertices>24、几何/线框/材质按钮及报告所测操作；不是全体人工视觉或整机验收。",
        "versionBound": true,
        "hashChecks": {
          "source": true,
          "generated": true,
          "packedModule": true,
          "manifest": true,
          "container": true,
          "app": true,
          "previews": true,
          "data": true
        },
        "reportedInputHashes": {
          "source": "9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966",
          "generated": "0e4a75b1e38276fce7b3d86a8e7ee64277e13acea4b0060d0a734c77dfe5a672",
          "packedModule": "0600175e57eb7af2b1e5ccc51974578eb126e499e8dd5ca97d3b992e8ab48964",
          "manifest": "81d1af768dbd8a188ea60844ac191b7166715d03d2a8e73a33b6acb8633cc4e7",
          "container": "1a13382d4dd8a66b50367b5cd97b3dcd8123cdf37bbdc5c4e53717e1c469c28d",
          "app": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
          "previews": "3275f1959592a8db74791482c97b3aba8af684ec28f17f0e16c4ef99317e9708",
          "data": "80da076d5e07fd56401f46a603fe66d97c4a94141a3ec29c5d2192655804f3ea"
        },
        "reportSha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
        "reportHref": "props-ui-verification.json",
        "bindingNote": "UI 报告输入 hash 与当前 source/module/packedModule 匹配。",
        "row": {
          "id": "sign_post",
          "builder": "Yg/sign_post",
          "vertices": "504",
          "triangles": "620",
          "prop": "sign_post",
          "dynamic": "false",
          "fail": null,
          "note": "原版 Yg.build → sign_post · 7 网格 · 504 顶点 · 620 三角 · 2 碰撞盒"
        }
      },
      "image": {
        "path": "outputs/prop-sign_post.png",
        "href": "prop-sign_post.png",
        "exists": true,
        "sha256": "0c2c7d65e63991aa7de7973ff1e21fb62453600069a981e51061f57fb1916bca",
        "bytes": 100916,
        "versionBound": false,
        "scope": "文件存在/可打开；截图未绑定原采集文件 hash，未做全部人工视觉审阅。"
      },
      "variantImages": [],
      "verification": {
        "status": "verified_scope",
        "geometryStatus": "verified_scope",
        "scope": "独立道具 geometry/层级/碰撞与所测变体，不是 GPU 材质或最终整机通过。",
        "reportedStatus": "PASS",
        "cases": 4,
        "passed": 4,
        "failed": 0,
        "caseGroups": [
          "default",
          "seed1",
          "option:sign",
          "option:text"
        ],
        "dynamicSamples": 0,
        "reportHref": "props-verification.json"
      },
      "limitations": [
        "全族 GPU 材质/整机截图未验收。",
        "完整选项组合、场景放置与生命周期需另测。"
      ]
    }
  ],
  "evidenceFiles": [
    {
      "path": "outputs/props-verification.json",
      "href": "props-verification.json",
      "exists": true,
      "sha256": "1db64ecacf81c5dc3f0553e20e79634db3c938491862a217d7aa3cd0562c4fa3",
      "qualification": "文件存在仅为索引；按报告范围解释，不是完整对标通过。"
    },
    {
      "path": "outputs/props-ui-verification.json",
      "href": "props-ui-verification.json",
      "exists": true,
      "sha256": "8648ca88f945186b530b49be7b29cee9255e5556cc086c4bddeb5f964646e577",
      "qualification": "文件存在仅为索引；按报告范围解释，不是完整对标通过。"
    },
    {
      "path": "outputs/container-verification.json",
      "href": "container-verification.json",
      "exists": true,
      "sha256": "a50fe62b02f43f471b9fa5cf933eb76c11230e33b6ec436083943b55bb241bfb",
      "qualification": "文件存在仅为索引；按报告范围解释，不是完整对标通过。"
    },
    {
      "path": "outputs/props-reference-original.png",
      "href": "props-reference-original.png",
      "exists": true,
      "sha256": "8d1dfb976bf6dbdda19ae2e0c156dcae0cfd39fa70ca681d5cc8fd2a01ea51f7",
      "qualification": "文件存在仅为索引；按报告范围解释，不是完整对标通过。"
    },
    {
      "path": "outputs/props-reference-current.png",
      "href": "props-reference-current.png",
      "exists": true,
      "sha256": "f5ffec4684981f1fab9d087c6e7b59efd736f30d64128130128aceb0633e43e0",
      "qualification": "文件存在仅为索引；按报告范围解释，不是完整对标通过。"
    },
    {
      "path": "outputs/container-structure-comparison.html",
      "href": "container-structure-comparison.html",
      "exists": true,
      "sha256": "3ab8bfd2346ff5ffa65b57e12bffab55da844de07565c005a063e574d561d8cc",
      "qualification": "文件存在仅为索引；按报告范围解释，不是完整对标通过。"
    }
  ],
  "limitations": [
    "无对白配音、玩家全身、玩家 melee/alt 消费、换枪/拾取补给、布娃娃、多层 NavMesh、SSR/SSGI/实时 GI/完整 DOF/TAA 的已启用证据。",
    "固定 seed 不覆盖 Math.random/字体/真实时钟；ready 不等于健康，fallback 不等于完整通过。",
    "可复刻与已完成是两个字段；商业分发需独立权利核查，不能由源码取得推导许可。"
  ],
  "integration": {
    "global": "window.ALIGNMENT_AUDIT",
    "script": "assets/alignment-audit.js",
    "page": "outputs/full-alignment-audit.html",
    "suggestedRoute": "#/alignment",
    "routeImplemented": true,
    "routeEvidence": {
      "path": "app.js",
      "line": 398,
      "sha256": "7c6efe085deccec5274167ce7ec6127011a4a9e9da3030a2892f35d53526d64f",
      "scope": "静态识别路由分支与报告链接；不是运行导航测试。"
    },
    "simpleLink": "outputs/full-alignment-audit.html",
    "pathRule": "href 以 outputs 页面为基准；主 app 使用时将 ../index.html#/a/ 替换为 #/a/，报告 href 加 outputs/。",
    "refreshCommand": "python3 tools/build_alignment_audit.py",
    "order": "主线程生成 manifest/modules/data 与验证报告后，再执行本生成器。",
    "fields": {
      "groups": "id/title/source/status/conditions/minimumHost/package/acceptanceTests/lifecycleRequirements/technicalFeasibility/limitations/gates/evidence/componentIds",
      "components": "id/name/category/sub/groupId/sourceAnchor/sourceHash/href/status/complete/contractRef/conditionRefs/evidenceRefs/currentPreview/catalogParameters/specificConditions/acceptanceRefs/technicalFeasibilityRef/limitationsRef",
      "props": "逐件 component + propId/builder/builderChain/optionKeys/defaultOptions/materialDependencies/dynamicHooks/previewWiring/verification/uiEvidence/image/variantImages/limitations",
      "propsUiVerification": "reportedStatus/rows/matchedProps/runtimeVerified/errors/mobileOverflow/reportSha256/versionBound/hashChecks/reportedInputHashes/currentInputHashes/scope",
      "previewWiring": "runtimeVerified 是现有报告限定 UI 证据；versionBound 单独表示与当前模块 hash 绑定，缺 hash 时为 false",
      "gallery": "total/imagesExist/variantImages/manualVisualReview/columns/lazyLoading",
      "status": "状态 code 见 statusLabels；complete 只在完整验收后为 true；本版均 false",
      "propsVerification": "reportedStatus 原报告；effectiveStatus 含 freshness；summary 原样实读"
    }
  }
};
