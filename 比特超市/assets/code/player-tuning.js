/**
 * 玩家运动调参 · Aurora-Player
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L4191:C51585  var Pi（尺度）
 *                                        L5939:C100464  var Mt（运动）
 *
 * 手感的全部来源就是这 45 个数。原版把它们写成一个对象，
 * 但没有版本号、没有单位注释、没有区间校验——这里补齐这三样。
 *
 * 依赖：无。
 */

/** 尺度：眼高、蹲眼高、胶囊半径、身高等，米制。 */
export const SCALE = {
  eye: 1.68,
  crouchEye: 1.05,
  radius: 0.32,
  height: 1.8,
  fov: 74,
  viewFov: 54,
};

// 原文 Mt 里写的是 Pi.height，保留同名局部引用，避免改动原表
const Pi = SCALE;

/** 运动：速度、加速度、重力、步幅、后坐、镜头。 */
export const TUNING = {walk:3.8,sprint:6.4,crouch:1.9,ads:2.4,accelGround:34,decelGround:26,accelAir:9,gravity:21,jumpApex:1,coyote:.12,jumpBuffer:.13,standHeight:Pi.height,crouchHeight:1.15,eyeRate:11,stride:{walk:1.55,sprint:2.1,crouch:1.05},bobY:.024,bobX:.013,bobSprint:1.9,bobAds:.22,rollStrafe:.02,landDip:.36,landDipMax:.2,fovSprint:6,fovAds:52,adsLook:.6,regenDelay:4,regenRate:25,recoilKeep:.35,recoilApply:34,recoilRecover:6.5,recoilHold:.09,shakeDecay:1.7,shakePitch:.03,shakeYaw:.03,shakeRoll:.045,pitchLimit:1.5};

/** 字段语义与单位。原版无注释，此处按量纲标注。 */
export const UNITS = {
  walk: "m/s", sprint: "m/s", crouch: "m/s", ads: "m/s",
  accelGround: "m/s²", decelGround: "m/s²", accelAir: "m/s²", gravity: "m/s²",
  jumpApex: "m", coyote: "s", jumpBuffer: "s",
  standHeight: "m", crouchHeight: "m", eyeRate: "1/s",
  bobY: "m", bobX: "m", bobSprint: "×", bobAds: "×",
  rollStrafe: "rad/m", landDip: "m", landDipMax: "m",
  fovSprint: "deg", fovAds: "deg", adsLook: "×",
  regenDelay: "s", regenRate: "hp/s",
  recoilKeep: "0-1", recoilApply: "×", recoilRecover: "1/s", recoilHold: "s",
  shakeDecay: "1/s", shakePitch: "rad", shakeYaw: "rad", shakeRoll: "rad",
  pitchLimit: "rad",
};

/** 由 gravity 与 jumpApex 反解初速，原版写的就是这条式子。 */
export const jumpSpeed = Math.sqrt(2 * TUNING.gravity * TUNING.jumpApex);

/** 步幅频率 → 每秒步数，给脚步声与镜头起伏共用。 */
export function stepRate(mode = "walk") {
  return TUNING.stride[mode] || TUNING.stride.walk;
}

/** 体检：速度必须为正、重力为正、蹲高低于站高。 */
export function validate() {
  const issues = [];
  for (const k of ["walk", "sprint", "crouch", "ads"]) {
    if (!(TUNING[k] > 0)) issues.push(`${k} 必须为正`);
  }
  if (!(TUNING.gravity > 0)) issues.push("gravity 必须为正");
  if (!(TUNING.crouchHeight < TUNING.standHeight)) issues.push("crouchHeight 必须低于 standHeight");
  if (!(TUNING.walk < TUNING.sprint)) issues.push("sprint 应快于 walk");
  return issues;
}

export default { SCALE, TUNING, UNITS, jumpSpeed, stepRate, validate };
