# 代码资产库项目约定

- 唯一基准 `/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html`；SHA-256 `9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966`。不改原文件。
- 用户要求逐件独立管理、不得遗漏，并真实恢复结构、材质、贴图、法线等；不接受尺寸盒替代完整模型。
- 必须分开报告：登记覆盖、可执行抽取、几何对照、视觉/声音验收。页面能画、总数齐、GLSL/原语一致都不等于完整模型还原。
- 2026-11-16已推翻旧“261件全部还原”表述：现283管理条目，不是成品数。36道具全部真实构造已接入，独立原版116case通过/误差0，实页36/36通过；仍不代表GPU材质/整机还原。场景、角色武器动作、DSP音频、原渲染与玩法仍需恢复，不得隐藏降级。
- 全组件审计`outputs/full-alignment-audit.html`由`tools/build_alignment_audit.py`生成，11类矩阵/283条目/36图库；#/alignment入口。六门：来源、结构、锁版宿主、变体动态事件、生命周期失败、分层证据；旧报告hash不匹配不得沿用PASS。
- 集装箱真实链 `M3→zA` 在 `assets/code/container-builder.js`；与未抽取原版IIFE比较24组几何全一致。细节见2026-11-16日志及`outputs/container-verification.json`。
- 源抽取用AST和原版导出别名映射；`et=THREE.BufferAttribute`不是Float32BufferAttribute。使用生成器复现，不手工改生成模块。
- 新制作原创代码资产使用用户级`code-asset-authoring`技能；项目入口#/authoring，原创assets/authored/registry.json与原DB分账。唯一build(ctx,options={})，hooks=root.userData；工具check静态、build_authored生成、verify_asset实际检查、pack不签PASS。原创质量按设计契约/参考，catalog与r180整机分开验，视觉必须看图。
- 用户2026-11-17明确：制作完成的资产必须正式注册并在网页体现，不能只放隔离示例或截图。首页最近制作、NEW图库、搜索、详情模型/源码/契约/报告全部可达才算交付。当前原创4件：new.quadruped-mech四足机甲、new.nordic-spruce北欧高松、new.rubber-duck与new.harbor-service-workbench（制作示例），287总条目≠287成品；机甲244mesh/15816tri，含四足、火炮、update/reset/dispose动画，约4.81×2.66×6.14m；松树14m/5.4m冠幅，seed7/19/43静态近景，无LOD风摆；小黄鸭9mesh5151v9584tri、黄/奶油两色。独立自动与看图证据位于outputs/rubber-duck，r180整机仍未验收。
