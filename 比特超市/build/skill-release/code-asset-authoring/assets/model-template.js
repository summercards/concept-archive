// 原创脚手架：先实现真实几何、填全契约，再 check；保留抛错时 runtime 理应报未实现。
// 仅允许下方 build 单一导出；options 标识保持不变，helpers 全部定义在 build 内。
// 仅面向可信本地源码的静态约束；不是安全沙箱，工厂不隔离恶意代码。
// 使用 ctx.THREE、ctx.kit、ctx.mats 和按 options.seed 提供的确定性 ctx.rng，不 import 第二套 THREE。
// ctx.sharedMaterials 是宿主维护的共享材质 Set；作者不写入、删除、清空、替换或伪造追踪。
// 返回带真实几何的 THREE.Object3D，米制、Y 向上、底面中心原点、+Z 正面。
// 在 root.userData 填写 assetId: 'new.<slug>'、authored: true、真实 bbox size、
// colliders: [{ min: [x,y,z], max: [x,y,z], surface: '已核实材质标识' }]、sockets: { 挂点名: { position: [x,y,z] } }。
// contract.size 仅为默认名义尺寸；contract.variantEnvelopes 使用 {options:{...},min:[...],max:[...],size?:[...]}。
// 每次 build 及影响尺寸的 update 后更新 userData.size 为当前真实 bbox，不强行复制默认尺寸。
// 让 requiredParts 对应有几何的具名节点；保留动态层级，不合批门、抽屉或转轴。
// 显式使用 metricBox/planeUV 或修正 UV；Builder.box r0 默认 UV 不是米制。
// 不逐 mesh clone 材质；clone 不复制 onBeforeCompile，不释放 ctx.mats 或 sharedMaterials 的共享资源。
// 动态 hooks 只挂 root.userData.update(dt)、root.userData.reset()，可选 root.userData.dispose()；dt 使用秒。
// dispose 只回收独占资源并允许重复调用，不自启 RAF/Interval，不使用 Math.random() 或时钟造型。
// check 只静态且不生成 authored.js；完成 source→check→项目 build_authored.py→verify，最后按需 pack。
// verify 只提供有限自动检查，不证明全部 UV/组合/生命周期或内存品质，visual 始终 UNVERIFIED。
export function build(ctx, options = {}) {
  throw new Error('尚未实现几何');
}
