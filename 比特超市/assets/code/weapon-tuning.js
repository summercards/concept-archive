/**
 * 武器数值与后坐弹簧 · Aurora-Weapon
 * ---------------------------------------------------------------
 * 来源：几猫国产3A大作_V1(4).html L6065:C68  Gv=30 / B_=150 / H_=26 / O_=720
 *                                        L6065:C5784 弹簧组 kZ/kP/kY/kR/…
 *                                        L6065  pa()/ma() 弹簧积分器
 *
 * 原版把这 4 个核心数值写成了裸变量（Gv/B_/H_/O_），连名字都没有。
 * 数值可量化，但"可管理"需要名字、单位、派生量与引用关系——这里补上。
 *
 * 依赖：无。
 */

export const WEAPON = {
  id: "pac9",
  name: "PAC-9",
  magSize: 30,        // 发
  reserve: 150,       // 发
  damage: 26,         // hp/发
  weakPointMul: 2.2,  // 弱点倍率
  rpm: 720,           // 发/分
  spread: 0.0125,     // 弧度（腰射基础扩散）
};

/** 派生量：由核心数值算出，避免消费方各自除一遍。 */
export const DERIVED = {
  /** 两发间隔，秒 */
  fireInterval: 60 / WEAPON.rpm,
  /** 理论 DPS（不含换弹与弱点） */
  dps: (60 / WEAPON.rpm) > 0 ? WEAPON.damage * (WEAPON.rpm / 60) : 0,
  /** 满弹匣可造成的伤害 */
  magPotential: WEAPON.magSize * WEAPON.damage,
  /** 总携弹量 / 弹匣数 */
  mags: 1 + Math.floor(WEAPON.reserve / WEAPON.magSize),
};

/**
 * 弹簧组：k 是刚度，c 是阻尼。原版 9 组共用同一个积分器，
 * 分别驱动后坐位移、俯仰、偏航、滚转、摆动、跳跃起伏。
 */
export const SPRINGS = {
  kickZ: [520, 30],
  kickPitch: [380, 26],
  kickYaw: [300, 22],
  kickRoll: [300, 20],
  swayYaw: [110, 15],
  swayPitch: [110, 15],
  jumpY: [140, 13],
  jumpPitch: [140, 13],
  bump: [600, 30],
};

/** 换弹时间表（秒）：原版 ue/$ 两条关键帧轨的终点与弹药提交点。 */
export const RELOAD = {
  tacticalTotal: 2.1,
  emptyTotal: 2.72,
  ammoCommit: 1.345,
  magOut: 0.47,
};

/** 造一根弹簧。 */
export const spring = (k, c) => ({ x: 0, v: 0, k, c });

/**
 * 积分一帧。原版 ma(s, target, dt)：dt>0.012 时自动切成 ≤8ms 的子步，
 * 这是为了低帧率下弹簧不炸——属于必须保留的实现细节。
 */
export function integrate(s, target, dt) {
  const n = dt > 0.012 ? Math.ceil(dt / 0.008) : 1;
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += ((target - s.x) * s.k - s.v * s.c) * h;
    s.x += s.v * h;
  }
  return s.x;
}

export default { WEAPON, DERIVED, SPRINGS, RELOAD, spring, integrate };
