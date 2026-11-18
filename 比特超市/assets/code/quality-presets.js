/**
 * 画质预设 · Aurora-Quality
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L4191:C51664  var Pr / zy()
 *
 * 11 个字段 × 5 档 = 55 个可调数值。scale 是渲染倍率，msaa 是采样数，
 * shadow/tex 是贴图边长，volSteps 是体积光步进，planar 是湿地平面反射强度。
 * 依赖：无。纯数据 + 纯函数，可脱离引擎单独做配置校验。
 */

export const PRESETS = {
  test:   { name: "test",   scale: 1,    msaa: 0, shadow: 1024, tex: 256,  volSteps: 10, ao: true,  planar: 0.5, bloom: true, motionBlur: false, rain: 0.4 },
  low:    { name: "low",    scale: 0.7,  msaa: 0, shadow: 2048, tex: 512,  volSteps: 12, ao: false, planar: 0,   bloom: true, motionBlur: false, rain: 0.5 },
  medium: { name: "medium", scale: 0.85, msaa: 2, shadow: 2048, tex: 1024, volSteps: 16, ao: true,  planar: 0.5, bloom: true, motionBlur: false, rain: 0.8 },
  high:   { name: "high",   scale: 1,    msaa: 4, shadow: 4096, tex: 1024, volSteps: 24, ao: true,  planar: 0.5, bloom: true, motionBlur: true,  rain: 1 },
  ultra:  { name: "ultra",  scale: 1,    msaa: 4, shadow: 4096, tex: 2048, volSteps: 40, ao: true,  planar: 1,   bloom: true, motionBlur: true,  rain: 1 },
};

export const ORDER = ["test", "low", "medium", "high", "ultra"];

/** 字段语义，给资产库读表用。 */
export const FIELDS = {
  scale:      { label: "渲染倍率", unit: "×",     range: [0.7, 1] },
  msaa:       { label: "MSAA 采样", unit: "spp",  range: [0, 4] },
  shadow:     { label: "阴影贴图",  unit: "px",   range: [1024, 4096] },
  tex:        { label: "程序贴图",  unit: "px",   range: [256, 2048] },
  volSteps:   { label: "体积光步进", unit: "step", range: [10, 40] },
  ao:         { label: "环境光遮蔽", unit: "bool" },
  planar:     { label: "湿地反射",  unit: "0-1",  range: [0, 1] },
  bloom:      { label: "泛光",      unit: "bool" },
  motionBlur: { label: "运动模糊",  unit: "bool" },
  rain:       { label: "雨量",      unit: "0-1",  range: [0, 1] },
};

/** 按名取预设；未知名字返回 null（原版也是 if(Pr[i]) 才返回）。 */
export function get(name) {
  return PRESETS[name] ? { ...PRESETS[name] } : null;
}

/** 原版 zy()：显式档位优先，否则按设备与显卡字符串自动选。 */
export function autoSelect(name) {
  const explicit = get(name);
  if (explicit) return explicit;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const touch = typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;
  const screenMin = typeof screen !== "undefined" ? Math.min(screen.width, screen.height) : 9999;
  if (/Android|iPhone|iPad|Mobile/i.test(ua) || (touch > 1 && screenMin < 900)) {
    return { ...PRESETS.low };
  }

  let renderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    }
  } catch (_) { /* 探针失败就按 high，与原版一致 */ }

  const software = /SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(renderer);
  const weakIntel = /Intel/i.test(renderer) && !/Arc/i.test(renderer);
  return { ...(software || weakIntel ? PRESETS.medium : PRESETS.high) };
}

/** 校验一份自定义预设是否落在合法区间，返回问题列表。 */
export function validate(preset) {
  const issues = [];
  const p = preset || {};
  if (!p.name || typeof p.name !== "string") issues.push("name 缺失");
  if (!(p.scale > 0 && p.scale <= 2)) issues.push("scale 应在 (0,2]");
  if (!Number.isInteger(p.msaa) || p.msaa < 0 || p.msaa > 8) issues.push("msaa 应为 0-8 的整数");
  if (![1024, 2048, 4096, 8192].includes(p.shadow)) issues.push("shadow 应为 2 的幂贴图边长");
  if (![128, 256, 512, 1024, 2048, 4096].includes(p.tex)) issues.push("tex 应为 2 的幂贴图边长");
  if (!(p.volSteps >= 4 && p.volSteps <= 64)) issues.push("volSteps 应在 4-64");
  if (typeof p.ao !== "boolean") issues.push("ao 应为布尔");
  if (!(p.planar >= 0 && p.planar <= 1)) issues.push("planar 应在 0-1");
  if (!(p.rain >= 0 && p.rain <= 1)) issues.push("rain 应在 0-1");
  return issues;
}

export default { PRESETS, ORDER, FIELDS, get, autoSelect, validate };
