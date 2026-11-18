/**
 * 敌人感知调参 · Aurora-AI
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L6065:C60541  var Ui
 *
 * 14 个数决定了"敌人能不能发现你"。gull / hound 两个变体对象是构造器，
 * 不属于数值资产，未抽入；其参数继承本表。
 *
 * 依赖：无。
 */

export const TUNING = {sightRange:45,sightCone:200,loseSight:4,searchTime:8,hearRadius:45,maxTokens:2,maxTokensCrowd:3,tokenGap:1.25,exposureUp:.1,exposureDown:.45,poolGulls:10,poolHounds:8,maxWrecks:5,maxBolts:32};

/** 视锥半角的余弦，原版用 Math.cos(cone/2) 做点积判定。 */
export const SIGHT_COS = Math.cos((TUNING.sightCone / 2) * Math.PI / 180);

/** 体检：角度在 (0,360)，时间与池容量为正。 */
export function validate() {
  const issues = [];
  if (!(TUNING.sightRange > 0)) issues.push("sightRange 必须为正");
  if (!(TUNING.sightCone > 0 && TUNING.sightCone < 360)) issues.push("sightCone 应在 (0,360)");
  if (!(TUNING.hearRadius > 0)) issues.push("hearRadius 必须为正");
  if (!(TUNING.maxTokens >= 1)) issues.push("maxTokens 至少 1");
  return issues;
}

export default { TUNING, SIGHT_COS, validate };
