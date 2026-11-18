/**
 * 材质账簿 · Aurora-Materials
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5294:C17715  var c3（族）
 *                                        L5294:C19452  var l1（实例）
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
export const FAMILIES = {asphalt:{fn:"asphalt",size:1,tile:2,bump:1.6,hero:!0},concrete:{fn:"concrete",size:1,tile:3,bump:2.5},brick:{fn:"brick",size:.5,tile:1.8,bump:6},epoxy:{fn:"epoxy",size:.5,tile:4,bump:3},paint:{fn:"paint",size:1,tile:2.5,bump:2.5,p:[.5]},hull:{fn:"hull",size:.5,tile:4,bump:12},galv:{fn:"galv",size:.5,tile:1,bump:.8},metal:{fn:"metal",size:.5,tile:1,bump:.5,p:[1]},brushed:{fn:"brushed",size:.5,tile:.5,bump:.4},rust:{fn:"rust",size:.5,tile:1.2,bump:3},diamond:{fn:"diamond",size:.5,tile:.5,bump:2},corrugated:{fn:"corrugated",size:.5,tile:[.762,2.286],bump:19},chainlink:{fn:"chainlink",size:.5,tile:.5,bump:5},hazard:{fn:"hazard",size:.5,tile:1,bump:2.5},gunmetal:{fn:"gunmetal",size:.5,tile:.25,bump:.3,p:[.6]},anodized:{fn:"gunmetal",size:.5,tile:.25,bump:.25,p:[.2],seed:11},polymer:{fn:"polymer",size:.25,tile:.1,bump:.4},carbon:{fn:"carbon",size:.25,tile:.05,bump:.5},fabric:{fn:"fabric",size:.25,tile:.05,bump:.4},armor:{fn:"armor",size:.5,tile:.5,bump:.8},wood:{fn:"wood",size:.5,tile:1.2,bump:2.6},plastic:{fn:"plastic",size:.5,tile:1,bump:1},tarp:{fn:"tarp",size:.5,tile:1.5,bump:20},cardboard:{fn:"cardboard",size:.5,tile:1,bump:.8},rope:{fn:"rope",size:.25,tile:.1,bump:4},tire:{fn:"tire",size:.5,tile:[.5,.3],bump:7},glass:{fn:"glass",size:.5,tile:1.5,bump:1.5,p:[.3]},glass_dirty:{fn:"glass",size:.5,tile:1.5,bump:1.5,p:[1],seed:40},water:{fn:"water",size:.25,tile:4,bump:30}};

/**
 * 湿润 / 脏污预设。4 元组按位置被着色器消费：
 * 原版没有为分量命名，此处保留原样，不做语义猜测。
 * 变量名（kc/aa/uA/o1…）与原版一致，便于逐字对照源码。
 */
const cA=[.42,.38,.5,0],kc=[.05,.62,.65,.7],aa=[0,.7,.55,.5],uA=[.3,.6,.55,0],i1=[.08,.62,.6,.5],u3=[.4,.5,.6,0],s1=[0,1,0,0],o1=[.22,.12,.35,.35],hA=[.14,.1,.8,.2],r1=[.07,.06,3,0],a1=[0,0,1,0];

/** 原版工厂：所有字段都有默认值，实例只写差异。 */
const Nt=(i,e={})=>({set:i,tint:0,color:16777215,rough:1,metal:1,wet:cA,macro:hA,nrm:1,...e}),Xa=i=>Nt("paint",{tint:1,color:i,wet:kc,macro:[.2,.16,.4,.45]});

/** 实例：48 条。键名即 mats.get("...") 的入参。原文照搬。 */
export const INSTANCES = {asphalt:Nt("asphalt",{wet:[.45,.3,.5,0],macro:o1}),concrete:Nt("concrete",{macro:o1}),concrete_dirty:Nt("concrete",{color:13616822,macro:[.3,.15,.35,.9]}),concrete_painted:Nt("concrete",{tint:2,color:9343638,rough:.9,wet:[.15,.55,.6,.3],macro:[.14,.1,.5,.3]}),brick:Nt("brick"),floor_epoxy:Nt("epoxy",{wet:[.04,.75,.4,0],macro:[.12,.2,.45,.25]}),paint_red:Xa(8200729),paint_blue:Xa(2047846),paint_green:Xa(2906692),paint_yellow:Xa(12159516),paint_orange:Xa(11751962),paint_white:Xa(12172214),paint_grey:Xa(5922920),paint_teal:Xa(2055523),steel_galv:Nt("galv",{wet:aa}),steel_dark:Nt("metal",{tint:1,color:4014406,rough:1.15,wet:aa}),steel_worn:Nt("metal",{tint:1,color:9080466,rough:.9,wet:aa}),steel_bare:Nt("brushed",{tint:1,color:11843771,wet:aa,macro:r1}),steel_rust:Nt("rust",{wet:uA}),diamond_plate:Nt("diamond",{wet:aa}),corrugated_roof:Nt("corrugated",{wet:aa}),chainlink:Nt("chainlink",{tint:3,alphaCut:!0,side:2,wet:s1,macro:a1}),aluminium:Nt("brushed",{tint:1,color:12896459,rough:1.15,wet:aa,macro:r1}),brass:Nt("brushed",{tint:1,color:12753477,rough:.9,wet:aa,macro:[.1,.08,20,0]}),hazard_stripes:Nt("hazard",{wet:kc}),gunmetal:Nt("gunmetal",{tint:1,color:2764081,wet:[0,.75,.6,.5],macro:[.08,.06,6,0]}),anodized_black:Nt("anodized",{tint:1,color:1184790,rough:.72,metal:.9,wet:[0,.75,.6,.5],macro:[.06,.05,6,0]}),polymer_black:Nt("polymer",{tint:1,color:1513498,wet:[0,.7,.6,.5],macro:[.06,.06,6,0]}),polymer_tan:Nt("polymer",{tint:1,color:7299144,wet:[0,.7,.6,.5],macro:[.06,.06,6,0]}),rubber:Nt("polymer",{tint:1,color:1052688,rough:1.4,wet:[.05,.6,.6,.4],macro:[.06,.06,6,0]}),carbon:Nt("carbon",{wet:[0,.8,.6,.5],macro:[.05,.05,6,0]}),glove_fabric:Nt("fabric",{tint:1,color:2303530,wet:[.3,.7,.6,0],macro:[.08,.04,8,0]}),armor_white:Nt("armor",{tint:1,color:11449528,wet:kc,macro:[.08,.08,2.5,.15]}),armor_orange:Nt("armor",{tint:1,color:12670234,wet:kc,macro:[.08,.08,2.5,.15]}),wood_pallet:Nt("wood",{wet:u3,macro:[.2,.1,.9,.4]}),wood_dark:Nt("wood",{color:9074794,wet:u3,macro:[.2,.1,.9,.4]}),plastic_blue:Nt("plastic",{tint:1,color:1920134,wet:i1}),plastic_red:Nt("plastic",{tint:1,color:9314074,wet:i1}),plastic_grey:Nt("plastic",{tint:1,color:4935508,wet:i1}),tarp:Nt("tarp",{tint:1,color:3885626,wet:i1,macro:[.1,.1,1.2,.2]}),cardboard:Nt("cardboard",{wet:[.4,.75,.6,0]}),rope:Nt("rope",{macro:r1}),tire:Nt("tire",{wet:[.1,.6,.6,.3],macro:r1}),glass:Nt("glass",{tint:3,transparent:!0,wet:s1,macro:a1}),glass_dirty:Nt("glass_dirty",{tint:3,transparent:!0,wet:s1,macro:a1}),hull_paint:Nt("hull",{tint:1,color:1778219,wet:kc,macro:o1}),hull_red:Nt("hull",{tint:1,color:6233880,wet:kc,macro:o1}),water_dark:Nt("water",{wet:s1,macro:a1})};

export const PRESETS = {
  wetDefault: cA, wetPaint: kc, wetGalv: aa, wetRust: uA,
  wetConcrete: i1, wetDry: u3, wetFull: s1,
  macroDefault: hA, macroConcrete: o1, macroBrushed: r1, macroNone: a1,
};

/** 对外统一用 makeInstance，内部就是原文的 Nt。 */
export const makeInstance = Nt;

export const INSTANCE_IDS = Object.keys(INSTANCES);

/**
 * 把 族 + 实例 合成一份可读的最终参数。
 * 不做渲染，只做合并，便于 UI 读表与做差异对比。
 */
export function resolve(id) {
  const inst = INSTANCES[id];
  if (!inst) throw new Error(`未知材质 "${id}"`);
  const fam = FAMILIES[inst.set];
  if (!fam) throw new Error(`材质 "${id}" 引用了不存在的族 "${inst.set}"`);
  return {
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
  };
}

/**
 * 落地成 MeshStandardMaterial —— 只搬"能等价搬"的部分。
 *
 * 必须说清楚：原版的 rough / metal 不是 0-1 的物理量，而是送进自有 PBR shader
 * 的乘子；程序化 ORM、湿润掩码、宏观脏污都在 shader 里算。用标准材质无法等价还原，
 * 所以这里只设颜色，粗糙度/金属度交给调用方显式指定，不伪造。
 */
export function toStandard(THREE, id, extra = {}) {
  const r = resolve(id);
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(r.color),
    roughness: 0.82,
    metalness: r.family === "metal" || r.family === "galv" || r.family === "brushed" ? 0.9 : 0.05,
    ...extra,
  });
  m.name = id;
  return m;
}

/** 台账体检：实例引用的族必须存在。 */
export function validate() {
  const issues = [];
  for (const [id, inst] of Object.entries(INSTANCES)) {
    if (!FAMILIES[inst.set]) issues.push(`${id} → 族 "${inst.set}" 不存在`);
    if (!Array.isArray(inst.wet) || inst.wet.length !== 4) issues.push(`${id} → wet 不是 4 元组`);
    if (!Array.isArray(inst.macro) || inst.macro.length !== 4) issues.push(`${id} → macro 不是 4 元组`);
  }
  return issues;
}

export default { FAMILIES, INSTANCES, PRESETS, makeInstance, resolve, toStandard, validate };
