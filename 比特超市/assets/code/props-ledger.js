/**
 * 道具台账 · Aurora-Props
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5453:C13986  var Gi
 *      自定义几何注册：Gi / J3 / eb / sb，共 36 条
 *
 * 36 条道具，每条 5 个字段：[宽, 高, 深](米) + 材质名 + 表面类型。
 * 这是原版唯一一处"资产清单"式数据：尺寸、材质、碰撞面都写在一行里。
 * 原点在底面中心（bottom anchor），长轴沿 X。
 *
 * 依赖：无。纯数据，可直接被关卡生成/碰撞/合批三方共用。
 */

export const PROP_LEDGER = {
  container20:       { size: [6.06, 2.59, 2.44], material: "paint_red", surface: "metal" },
  container40:       { size: [12.19, 2.59, 2.44], material: "paint_blue", surface: "metal" },
  container40hc:     { size: [12.19, 2.9, 2.44], material: "paint_green", surface: "metal" },
  jersey_barrier:    { size: [3, 0.81, 0.6], material: "concrete", surface: "concrete" },  // 自定义几何
  light_mast:        { size: [0.5, 14, 0.5], material: "steel_galv", surface: "metal" },  // 自定义几何
  fence_panel:       { size: [3, 2.4, 0.08], material: "chainlink", surface: "metal" },  // 自定义几何
  guard_booth:       { size: [2.6, 2.7, 2.2], material: "paint_white", surface: "metal" },  // 自定义几何
  gate_arm:          { size: [5, 1.1, 0.3], material: "hazard_stripes", surface: "metal" },  // 自定义几何
  bollard_mooring:   { size: [0.7, 0.6, 0.7], material: "steel_dark", surface: "metal" },  // 自定义几何
  bollard_post:      { size: [0.17, 1, 0.17], material: "paint_yellow", surface: "metal" },  // 自定义几何
  relay_node:        { size: [1.2, 2.4, 0.8], material: "paint_grey", surface: "metal" },  // 自定义几何
  shelf_rack:        { size: [2.7, 4.2, 1.1], material: "paint_orange", surface: "metal" },  // 自定义几何
  stairs_metal:      { size: [3, 2.6, 1], material: "diamond_plate", surface: "metal" },  // 自定义几何
  catwalk:           { size: [3, 1.1, 1.2], material: "diamond_plate", surface: "metal" },  // 自定义几何
  reefer_unit:       { size: [0.5, 2.3, 2.3], material: "paint_white", surface: "metal" },  // 自定义几何
  barrel:            { size: [0.6, 0.9, 0.6], material: "paint_blue", surface: "metal" },
  pallet:            { size: [1.2, 0.144, 1], material: "wood_pallet", surface: "wood" },
  pallet_stack:      { size: [1.2, 1.15, 1], material: "wood_pallet", surface: "wood" },
  crate_wood:        { size: [1.1, 1, 0.9], material: "wood_pallet", surface: "wood" },
  crate_stack:       { size: [1.2, 1.9, 1], material: "wood_pallet", surface: "wood" },
  ibc_tote:          { size: [1.2, 1.16, 1], material: "plastic_grey", surface: "metal" },
  forklift:          { size: [3.4, 2.2, 1.25], material: "paint_yellow", surface: "metal" },
  cable_reel:        { size: [1.3, 1.3, 0.8], material: "wood_dark", surface: "wood" },
  tire_stack:        { size: [0.8, 1, 0.8], material: "tire", surface: "rubber" },
  dumpster:          { size: [1.9, 1.35, 1.1], material: "paint_green", surface: "metal" },
  generator:         { size: [2.2, 1.4, 1], material: "paint_yellow", surface: "metal" },
  jerry_can:         { size: [0.35, 0.47, 0.17], material: "paint_green", surface: "metal" },
  traffic_cone:      { size: [0.36, 0.7, 0.36], material: "plastic_red", surface: "rubber" },
  gas_cylinders:     { size: [0.9, 1.6, 0.5], material: "steel_dark", surface: "metal" },
  tarp_cargo:        { size: [2.4, 1.5, 1.4], material: "tarp", surface: "dirt" },
  sandbags:          { size: [2, 0.9, 0.6], material: "tarp", surface: "dirt" },
  toolbox_cart:      { size: [0.9, 0.95, 0.5], material: "plastic_red", surface: "metal" },
  floodlight_stand:  { size: [1, 2.2, 1], material: "paint_yellow", surface: "metal" },  // 自定义几何
  cardboard_boxes:   { size: [1, 0.8, 0.8], material: "cardboard", surface: "wood" },
  pipe_stack:        { size: [6, 0.9, 1.2], material: "steel_rust", surface: "metal" },
  sign_post:         { size: [0.6, 2.4, 0.08], material: "paint_white", surface: "metal" },  // 自定义几何
};

/** 36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价。 */
export const HAS_CUSTOM_BUILDER = new Set(Object.keys(PROP_LEDGER));

export const PROP_BUILDER_META = {
  container20: { group: "container-loop", callback: "M3", integrated: true, sourceStatus: "已接入真实建模器" },
  container40: { group: "container-loop", callback: "M3", integrated: true, sourceStatus: "已接入真实建模器" },
  container40hc: { group: "container-loop", callback: "M3", integrated: true, sourceStatus: "已接入真实建模器" },
  jersey_barrier: { group: "direct", callback: "S3", integrated: true, sourceStatus: "已接入真实建模器" },
  light_mast: { group: "direct", callback: "T3", integrated: true, sourceStatus: "已接入真实建模器" },
  fence_panel: { group: "direct", callback: "A3", integrated: true, sourceStatus: "已接入真实建模器" },
  guard_booth: { group: "direct", callback: "R3", integrated: true, sourceStatus: "已接入真实建模器" },
  gate_arm: { group: "direct", callback: "C3", integrated: true, sourceStatus: "已接入真实建模器" },
  bollard_mooring: { group: "direct", callback: "P3", integrated: true, sourceStatus: "已接入真实建模器" },
  bollard_post: { group: "direct", callback: "I3", integrated: true, sourceStatus: "已接入真实建模器" },
  sign_post: { group: "direct", callback: "z3", integrated: true, sourceStatus: "已接入真实建模器" },
  floodlight_stand: { group: "direct", callback: "D3", integrated: true, sourceStatus: "已接入真实建模器" },
  stairs_metal: { group: "direct", callback: "k3", integrated: true, sourceStatus: "已接入真实建模器" },
  catwalk: { group: "direct", callback: "F3", integrated: true, sourceStatus: "已接入真实建模器" },
  shelf_rack: { group: "direct", callback: "U3", integrated: true, sourceStatus: "已接入真实建模器" },
  reefer_unit: { group: "direct", callback: "N3", integrated: true, sourceStatus: "已接入真实建模器" },
  relay_node: { group: "direct", callback: "B3", integrated: true, sourceStatus: "已接入真实建模器" },
  barrel: { group: "J3", callback: "HA", integrated: true, sourceStatus: "已接入真实建模器" },
  pallet: { group: "J3", callback: "VA", integrated: true, sourceStatus: "已接入真实建模器" },
  pallet_stack: { group: "J3", callback: "WA", integrated: true, sourceStatus: "已接入真实建模器" },
  crate_wood: { group: "J3", callback: "GA", integrated: true, sourceStatus: "已接入真实建模器" },
  crate_stack: { group: "J3", callback: "qA", integrated: true, sourceStatus: "已接入真实建模器" },
  ibc_tote: { group: "J3", callback: "XA", integrated: true, sourceStatus: "已接入真实建模器" },
  cable_reel: { group: "J3", callback: "YA", integrated: true, sourceStatus: "已接入真实建模器" },
  tire_stack: { group: "J3", callback: "$A", integrated: true, sourceStatus: "已接入真实建模器" },
  jerry_can: { group: "J3", callback: "ZA", integrated: true, sourceStatus: "已接入真实建模器" },
  traffic_cone: { group: "J3", callback: "jA", integrated: true, sourceStatus: "已接入真实建模器" },
  gas_cylinders: { group: "J3", callback: "JA", integrated: true, sourceStatus: "已接入真实建模器" },
  pipe_stack: { group: "J3", callback: "KA", integrated: true, sourceStatus: "已接入真实建模器" },
  tarp_cargo: { group: "eb", callback: "QA", integrated: true, sourceStatus: "已接入真实建模器" },
  sandbags: { group: "eb", callback: "tR", integrated: true, sourceStatus: "已接入真实建模器" },
  cardboard_boxes: { group: "eb", callback: "nR", integrated: true, sourceStatus: "已接入真实建模器" },
  forklift: { group: "sb", callback: "oR", integrated: true, sourceStatus: "已接入真实建模器" },
  generator: { group: "sb", callback: "rR", integrated: true, sourceStatus: "已接入真实建模器" },
  dumpster: { group: "sb", callback: "aR", integrated: true, sourceStatus: "已接入真实建模器" },
  toolbox_cart: { group: "sb", callback: "lR", integrated: true, sourceStatus: "已接入真实建模器" },
};

export const PROP_IDS = Object.keys(PROP_LEDGER);

/** 取尺寸，未知 id 抛错——原版是 warn 后回退成 1×1×1 的 concrete 盒。 */
export function sizeOf(id) {
  const p = PROP_LEDGER[id];
  if (!p) throw new Error(`未知道具 "${id}"`);
  return p.size.slice();
}

/** 包围盒：底面中心为原点，米制。 */
export function boundsOf(id) {
  const [w, h, d] = sizeOf(id);
  return { min: [-w / 2, 0, -d / 2], max: [w / 2, h, d / 2] };
}

/** 只覆盖部分字段的派生台账（用于做主题变体而不动原表）。 */
export function withOverrides(patch) {
  const out = {};
  for (const [id, p] of Object.entries(PROP_LEDGER)) {
    out[id] = { ...p, ...(patch[id] || {}) };
  }
  return out;
}

/** 台账体检：尺寸为正、材质名非空。 */
export function validate() {
  const issues = [];
  for (const [id, p] of Object.entries(PROP_LEDGER)) {
    if (!(p.size[0] > 0 && p.size[1] > 0 && p.size[2] > 0)) issues.push(`${id}: 尺寸非正`);
    if (!p.material) issues.push(`${id}: 缺材质`);
    if (!p.surface) issues.push(`${id}: 缺表面类型`);
  }
  return issues;
}

export default { PROP_LEDGER, HAS_CUSTOM_BUILDER, PROP_BUILDER_META, PROP_IDS, sizeOf, boundsOf, withOverrides, validate };
