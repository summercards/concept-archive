// 原创脚手架：先完成设计契约，再替换抛错；不要以空 Group 或占位盒提交验收。
// 导出模块由宿主构建器加载；不要在此 import 第二套 THREE 或注册全局条目。
// 使用 ctx.THREE、ctx.kit、ctx.mats 和宿主按 options.seed 隔离播种的 ctx.rng。
// 先核对实际 kit/mats 签名；不要假定 ctx.register 存在。
// 返回 THREE.Group，采用米制、Y 向上、底面中心原点、+Z 正面。
// 在 root.userData 填写实测 size、assetId: 'new.should-not-write'、authored: true、
// colliders: [{ min: [x,y,z], max: [x,y,z], surface: '已核实材质标识' }]、
// sockets: { 挂点名: { position: [x,y,z] } }；无挂点时使用 {} 并说明原因。
// 让 requiredParts 对应有几何的具名节点；保留动态部件，不合批门、抽屉或转轴。
// 为新表面显式使用 metricBox/planeUV 或修正 UV；不要依赖 Builder.box r0 的默认 UV。
// 不逐 mesh clone 材质；注意 clone 不复制 onBeforeCompile，不释放 ctx.mats 共享缓存。
// 动态资产按已核对宿主约定挂 root.update(dt)、root.reset()，dt 使用秒；
// 按所有权提供可重复调用的 root.dispose()，只回收本次构建的独占资源。
// 不启动 RAF/Interval，不使用 Math.random() 或时钟制造模型变化。
// 参照 references/api_reference.md 与 references/quality-standard.md 完成实现和验收。
export function build(ctx, options = {}) {
  throw new Error('尚未实现几何');
}
