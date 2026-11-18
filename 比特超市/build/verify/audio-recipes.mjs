/**
 * 音效配方 · Aurora-Sound
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L5939:C64931  var Go
 *
 * 57 条配方。每条描述"这个声音应该怎么混"：几层声部(n)、采样率档(sr)、
 * 峰值(peak)、总线(bus: near/dry/world)、同时发声上限(max)、优先级(pri)、
 * 是否开场地板(boot)、世界坐标下的参考距离(ref)与滚降(roll)。
 *
 * 边界：合成波形本身是 57 个生成器函数（gen 指向），依赖 WebAudio 上下文，
 * 未抽入本模块。本模块只保证"混音配方"这一层可独立管理与比对——
 * 换引擎时这一层能整体搬走，生成器需要重写。
 *
 * 依赖：无。
 */

export const RECIPES = {
  rifle_shot:            { gen: "KR", n: 4, sr: "ki", peak: 0.97, bus: "near", max: 5, pri: 9, boot: 1 },
  rifle_tail_out:        { gen: "QR", n: 2, sr: "Xn", peak: 0.5, bus: "dry", max: 3, pri: 8, boot: 1 },
  rifle_tail_in:         { gen: "e8", n: 2, sr: "Xn", peak: 0.62, bus: "dry", max: 3, pri: 8, boot: 1 },
  rifle_dry:             { gen: "t8", n: 1, sr: "ki", peak: 0.5, bus: "near", max: 2, pri: 6, boot: 1 },
  reload_magout:         { gen: "n8", n: 1, sr: "ki", peak: 0.6, bus: "near", max: 2, pri: 6 },
  reload_magin:          { gen: "i8", n: 1, sr: "ki", peak: 0.65, bus: "near", max: 2, pri: 6 },
  reload_bolt:           { gen: "s8", n: 1, sr: "ki", peak: 0.8, bus: "near", max: 2, pri: 6 },
  shell_bounce:          { gen: "o8", n: 3, sr: "ki", peak: 0.3, bus: "world", max: 4, pri: 1, ref: 2, roll: 1 },
  step_concrete:         { gen: "r8", n: 4, sr: "Xn", peak: 0.45, bus: "near", max: 3, pri: 3, boot: 1 },
  step_water:            { gen: "a8", n: 3, sr: "Xn", peak: 0.5, bus: "near", max: 3, pri: 3, boot: 1 },
  step_metal:            { gen: "l8", n: 3, sr: "Xn", peak: 0.5, bus: "near", max: 3, pri: 3, boot: 1 },
  land:                  { gen: "c8", n: 1, sr: "Xn", peak: 0.7, bus: "near", max: 2, pri: 4 },
  jump:                  { gen: "u8", n: 1, sr: "Xn", peak: 0.35, bus: "near", max: 2, pri: 3 },
  hurt:                  { gen: "h8", n: 1, sr: "Xn", peak: 0.85, bus: "dry", max: 2, pri: 8 },
  ear_ring:              { gen: "f8", n: 1, sr: "pl", peak: 0.2, bus: "dry", max: 1, pri: 5 },
  impact_metal:          { gen: "d8", n: 3, sr: "ki", peak: 0.7, bus: "world", max: 4, pri: 4, ref: 4, roll: 0.7 },
  impact_concrete:       { gen: "p8", n: 3, sr: "ki", peak: 0.7, bus: "world", max: 4, pri: 4, ref: 4, roll: 0.7 },
  impact_wood:           { gen: "m8", n: 2, sr: "ki", peak: 0.7, bus: "world", max: 3, pri: 4, ref: 4, roll: 0.7 },
  impact_water:          { gen: "g8", n: 2, sr: "Xn", peak: 0.6, bus: "world", max: 3, pri: 4, ref: 4, roll: 0.7 },
  impact_enemy:          { gen: "v8", n: 3, sr: "ki", peak: 0.75, bus: "world", max: 4, pri: 5, ref: 5, roll: 0.6 },
  impact_glass:          { gen: "x8", n: 1, sr: "ki", peak: 0.6, bus: "world", max: 2, pri: 4, ref: 4, roll: 0.7 },
  whiz:                  { gen: "b8", n: 3, sr: "ki", peak: 0.5, bus: "world", max: 3, pri: 5, ref: 2.5, roll: 0.6 },
  ricochet:              { gen: "y8", n: 3, sr: "ki", peak: 0.4, bus: "world", max: 2, pri: 3, ref: 5, roll: 0.6 },
  gull_fire:             { gen: "E8", n: 2, sr: "ki", peak: 0.85, bus: "world", max: 5, pri: 7, ref: 7, roll: 0.55 },
  hound_fire:            { gen: "S8", n: 2, sr: "ki", peak: 0.95, bus: "world", max: 5, pri: 7, ref: 8, roll: 0.5 },
  hound_step:            { gen: "T8", n: 3, sr: "Xn", peak: 0.7, bus: "world", max: 4, pri: 3, ref: 5, roll: 0.8 },
  gull_die:              { gen: "A8", n: 1, sr: "Xn", peak: 0.85, bus: "world", max: 3, pri: 7, ref: 7, roll: 0.5 },
  hound_die:             { gen: "R8", n: 1, sr: "Xn", peak: 0.9, bus: "world", max: 3, pri: 7, ref: 7, roll: 0.5 },
  telegraph:             { gen: "P8", n: 2, sr: "Xn", peak: 0.42, bus: "world", max: 4, pri: 6, ref: 6, roll: 0.6 },
  alert:                 { gen: "C8", n: 2, sr: "Xn", peak: 0.5, bus: "world", max: 3, pri: 6, ref: 8, roll: 0.5 },
  explosion:             { gen: "I8", n: 2, sr: "ki", peak: 0.97, bus: "world", max: 3, pri: 10, ref: 12, roll: 0.5 },
  relay_cut:             { gen: "z8", n: 1, sr: "Xn", peak: 0.75, bus: "world", max: 2, pri: 8, ref: 6, roll: 0.5 },
  thunder:               { gen: "D8", n: 2, sr: "pl", peak: 0.8, bus: "dry", max: 2, pri: 6 },
  foghorn:               { gen: "L8", n: 1, sr: "pl", peak: 0.5, bus: "world", max: 1, pri: 2 },
  gull_cry:              { gen: "k8", n: 2, sr: "pl", peak: 0.4, bus: "world", max: 2, pri: 1 },
  halyard:               { gen: "F8", n: 2, sr: "Xn", peak: 0.3, bus: "world", max: 2, pri: 1 },
  container_bang:        { gen: "U8", n: 1, sr: "pl", peak: 0.6, bus: "world", max: 1, pri: 2 },
  ui_click:              { gen: "N8", n: 1, sr: "ki", peak: 0.3, bus: "dry", max: 2, pri: 9 },
  ui_hover:              { gen: "B8", n: 1, sr: "ki", peak: 0.12, bus: "dry", max: 2, pri: 9 },
  objective:             { gen: "Z8", n: 1, sr: "Xn", peak: 0.6, bus: "music", max: 1, pri: 9 },
  objective_all:         { gen: "j8", n: 1, sr: "Xn", peak: 0.65, bus: "music", max: 1, pri: 9 },
  complete:              { gen: "J8", n: 1, sr: "Xn", peak: 0.7, bus: "music", max: 1, pri: 9 },
  death:                 { gen: "K8", n: 1, sr: "Xn", peak: 0.75, bus: "music", max: 1, pri: 9 },
  gull_rotor:            { gen: "_8", n: 1, sr: "Xn", peak: 0.6, ref: 5, roll: 0.9 },
  hound_servo:           { gen: "M8", n: 1, sr: "Xn", peak: 0.42, ref: 4, roll: 1 },
  relay_hum:             { gen: "w8", n: 1, sr: "Xn", peak: 0.4, ref: 2.5, roll: 1.4 },
  rain:                  { gen: "O8", n: 1, sr: "Xn", peak: 0.5 },
  rain_interior:         { gen: "H8", n: 1, sr: "Xn", peak: 0.7 },
  wind:                  { gen: "V8", n: 1, sr: "pl", peak: 0.5 },
  sea:                   { gen: "W8", n: 1, sr: "pl", peak: 0.5, ref: 10, roll: 0.6 },
  music_drone:           { gen: "G8", n: 1, sr: "Fr.sr", peak: 0.5 },
  music_ost:             { gen: "q8", n: 1, sr: "Fr.sr", peak: 0.45 },
  music_perc:            { gen: "X8", n: 1, sr: "Fr.sr", peak: 0.7 },
  music_brass:           { gen: "Y8", n: 1, sr: "Fr.sr", peak: 0.45 },
  music_motif:           { gen: "$8", n: 1, sr: "Fr.sr", peak: 0.45 },
  ir_outdoor:            { gen: "Q8", n: 1, sr: "ki", peak: 0.9 },
  ir_shed:               { gen: "eC", n: 1, sr: "ki", peak: 0.9 },
};

export const RECIPE_IDS = Object.keys(RECIPES);

/** 总线用量统计：预算分配看这个。 */
export function busLoad() {
  const out = {};
  for (const r of Object.values(RECIPES)) {
    const b = r.bus || "unset";
    out[b] = (out[b] || 0) + 1;
  }
  return out;
}

/** 同时发声上限之和：音频线程压力的上界。 */
export function voiceBudget() {
  return Object.values(RECIPES).reduce((s, r) => s + (r.max || 0), 0);
}

/** 按总线筛。 */
export function byBus(bus) {
  return RECIPE_IDS.filter((id) => RECIPES[id].bus === bus);
}

export default { RECIPES, RECIPE_IDS, busLoad, voiceBudget, byBus };
