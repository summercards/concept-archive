/* 拼接于原版 IIFE 内；沿用 NC、Three 与原版主循环，不创建独立帧循环。 */
NC.createGame = function (G) {
  'use strict';
  const T = G.THREE;
  const input = G.input;
  const player = G.player;
  const camera = G.camera;
  const cyber = G.level.cyber;
  const app = document.getElementById('app');
  if (!app || !cyber || !Array.isArray(cyber.interactions)) {
    throw new Error('[XENO SIEGE] 需要 #app 和 level.cyber.interactions');
  }
  if (document.getElementById('ncui')) throw new Error('[XENO SIEGE] 游戏界面已创建');
  if (typeof NC.installXenoCombat === 'function') NC.installXenoCombat(G);

  const mainIds = ['deploy', 'command', 'reactor', 'extract'];
  const defaults = {
    deploy: ['防卫协议', '启动 Bastion 07 防卫网', '按住 E 启动基地防卫协议，准备承受虫潮。', [0, 1.45, 20.4]],
    command: ['虫潮接敌', '确认第一波虫潮', '等待虫群越过外环，确认射界内的敌群。', [-8, 1.3, 20.1]],
    reactor: ['护盾核心', '校准基地护盾核心', '虫群正在冲击防线，回到核心补充护盾能量。', [0, 1.5, 18]],
    extract: ['防线确认', '确认防卫战结果', '虫潮已退，回到基地核心确认 Bastion 07 仍在运转。', [0, 1.45, 18]]
  };
  const entries = cyber.interactions;
  const byId = new Map(entries.map(item => [item.id, item]));
  for (const id of mainIds) {
    if (!byId.has(id)) throw new Error('[XENO SIEGE] 场景缺少交互：' + id);
  }
  const metadata = new Map();
  entries.forEach(item => {
    const def = defaults[item.id];
    if (!item.pos && def) item.pos = new T.Vector3(...def[3]);
    if (!item.label) item.label = def ? def[0] : item.id;
    if (!item.description) item.description = def ? def[2] : '靠近并按住 E 交互。';
    item.reach = Number.isFinite(item.reach) && item.reach > 0 ? item.reach : 2.5;
    item.hold = Number.isFinite(item.hold) && item.hold > 0 ? item.hold : 1.2;
    item.done = false;
    item.repeat = item.repeat === true && !mainIds.includes(item.id);
    metadata.set(item, {hold: 0, state: '', count: 0});
  });

  const listeners = [];
  const unsubscribers = [];
  const call = (object, method, ...args) => {
    if (object && typeof object[method] === 'function') return object[method](...args);
  };
  const listen = (target, type, fn, options) => {
    target.addEventListener(type, fn, options);
    listeners.push(() => target.removeEventListener(type, fn, options));
  };
  const emit = (name, data) => call(G.events, 'emit', name, data);
  const bounded = (value, min, max) => Math.max(min, Math.min(max, value));
  const run = {
    time: 0, stage: 0, completed: false, progress: 0, restarts: 0,
    interactions: {attempts: 0, success: 0, failed: 0, main: 0, auxiliary: 0, doorToggles: 0},
    audio: {volume: 0.65, intensity: 0.12, clicks: 0, cues: 0, resumed: 0},
    scan: {cooldown: 0, remaining: 0, count: 0},
    flashlight: false, weaponVisible: false, subtitles: 0,
    input: {trustedKeys: 0, syntheticKeys: 0, interactionSamples: 0},
    debug: {calls: 0, lastSource: '', log: []}
  };
  let titleTime = 0;
  let focus = null;
  let heldLatch = false;
  let pauseGuard = 0;
  let hadLock = false;
  let pendingPause = false;
  let pendingScan = '';
  let pendingFlashlight = '';
  let pendingWeapon = '';
  let keyESource = '';
  let disposed = false;
  let modeMessage = '';
  let modePoll = 0;
  let bannerRemaining = 0;
  let toastRemaining = 0;
  let toastText = '';
  let panel = '';
  let previousFocus = null;
  let qualityBusy = false;
  let subtitle = null;
  const subtitleQueue = [];
  const combatUI = {
    enemyVisible: false,
    enemy: null,
    hurtRemaining: 0,
    hurtAngle: 0,
    hitMarker: '',
    hitRemaining: 0,
    feedback: []
  };
  const direction = new T.Vector3();
  const offset = new T.Vector3();
  const endpoint = new T.Vector3();
  const eye = new T.Vector3();
  const projected = new T.Vector3();

  const root = document.createElement('div');
  root.id = 'ncui';
  root.className = 'nc-root';
  root.dataset.state = 'title';
  root.innerHTML = `
    <style>
      #ncui{--nc-cyan:#75f3ed;--nc-pink:#ff94b8;--nc-white:#f2efe6;--nc-muted:#a9bdc5;position:absolute;inset:0;z-index:35;pointer-events:none;color:var(--nc-white);font:14px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;text-shadow:0 2px 14px #001016}
      #boot[hidden]{display:none!important}#ncui *{box-sizing:border-box}#ncui [hidden]{display:none!important}
      #ncui .nc-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
      #ncui button,#ncui input,#ncui select{pointer-events:auto;font:inherit}#ncui button{cursor:pointer;border-radius:0}#ncui button:disabled{cursor:wait;opacity:.5}
      #ncui button:focus-visible,#ncui input:focus-visible,#ncui select:focus-visible{outline:2px solid var(--nc-pink);outline-offset:5px}
      #ncui .nc-title{position:absolute;inset:0;padding:max(34px,env(safe-area-inset-top)) max(5.5vw,env(safe-area-inset-right)) max(30px,env(safe-area-inset-bottom));background:linear-gradient(90deg,rgba(3,16,25,.79),rgba(3,16,25,.35) 43%,transparent 75%);display:flex;flex-direction:column;justify-content:space-between}
      #ncui .nc-coords{color:var(--nc-cyan);font-size:11px;letter-spacing:.14em;display:flex;gap:22px;flex-wrap:wrap}
      #ncui .nc-title-content{margin:auto 0;max-width:570px;padding:38px 0 20px}
      #ncui .nc-eyebrow{font-size:11px;letter-spacing:.32em;color:var(--nc-cyan);margin:0 0 22px}
      #ncui .nc-title-name{margin:0;font-size:clamp(70px,10vw,148px);font-weight:750;letter-spacing:.03em;line-height:1.06}
      #ncui .nc-year{color:var(--nc-pink);font-size:clamp(36px,4.6vw,66px);letter-spacing:.19em;line-height:1.35}
      #ncui .nc-english{margin:12px 0 20px;font-size:clamp(18px,2.3vw,30px);letter-spacing:.19em;font-weight:500}
      #ncui .nc-blurb{max-width:360px;color:#c4d2d2;font-size:13px;line-height:1.9;margin:0 0 30px}
      #ncui .nc-primary{border:1px solid var(--nc-cyan);color:#08232b;background:var(--nc-cyan);padding:15px 24px;min-width:224px;text-align:left;letter-spacing:.12em;font-weight:700;box-shadow:0 0 30px #36e7e01a}
      #ncui .nc-primary:hover{background:#b0fff5}#ncui .nc-link{border:0;border-bottom:1px solid #90c0c044;background:none;color:var(--nc-white);padding:9px 0;margin-right:22px;font-size:12px;letter-spacing:.09em}
      #ncui .nc-title-nav{margin-top:17px}#ncui .nc-footer{font-size:10px;letter-spacing:.16em;color:#afc6c9;display:flex;gap:25px;flex-wrap:wrap}
      #ncui .nc-hud{position:absolute;inset:0;--nc-pad:28px}
      #ncui .nc-task{position:absolute;top:max(var(--nc-pad),env(safe-area-inset-top));left:max(var(--nc-pad),env(safe-area-inset-left));width:min(310px,60vw);border-left:2px solid var(--nc-cyan);padding:9px 15px;background:linear-gradient(90deg,#071b26c7,transparent)}
      #ncui .nc-task-kicker{font-size:10px;letter-spacing:.18em;color:var(--nc-cyan)}#ncui .nc-task-title{margin:5px 0;font-size:18px;font-weight:600}#ncui .nc-task-desc{font-size:12px;color:#bdcdce;margin:0;line-height:1.7}
      #ncui .nc-progress{display:flex;align-items:center;gap:7px;margin-top:12px;font-size:11px;color:var(--nc-pink)}#ncui .nc-progress i{height:2px;width:33px;background:#66818c66}#ncui .nc-progress i.nc-filled{background:var(--nc-pink)}
      #ncui .nc-telemetry{position:absolute;right:max(28px,env(safe-area-inset-right));top:max(29px,env(safe-area-inset-top));text-align:right;font-size:10px;letter-spacing:.12em;color:#c9dddd}#ncui .nc-clock{font-size:27px;color:var(--nc-white);margin-bottom:3px}
      #ncui .nc-crosshair{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border:1px solid #e9fffa;background:#b6fff75c;box-shadow:0 0 8px #7cfff755;border-radius:50%}
      #ncui .nc-interact{position:absolute;left:50%;top:calc(50% + 35px);transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:90vw;background:#061924c7;border:1px solid #7acdc933;padding:10px 14px;min-width:190px}
      #ncui .nc-ring{width:40px;height:40px;flex-shrink:0;border-radius:50%;background:conic-gradient(var(--nc-cyan) calc(var(--nc-hold,0)*1turn),#769a9c44 0);padding:2px}#ncui .nc-ring span{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#10252d;font:15px ui-monospace,monospace;color:var(--nc-cyan)}
      #ncui .nc-interact-name{font-size:13px}#ncui .nc-interact-reason{font-size:11px;color:var(--nc-muted);max-width:300px}#ncui .nc-interact.nc-locked .nc-interact-reason{color:var(--nc-pink)}
      #ncui .nc-subtitles{position:absolute;bottom:max(113px,calc(env(safe-area-inset-bottom) + 95px));left:50%;transform:translateX(-50%);width:min(580px,86vw);text-align:center}#ncui .nc-speaker{color:var(--nc-cyan);font-size:10px;letter-spacing:.2em;margin-bottom:5px}#ncui .nc-subtitle-text{display:inline;background:#05141de6;padding:5px 10px;box-decoration-break:clone;-webkit-box-decoration-break:clone;line-height:2.15;font-size:14px}
      #ncui .nc-location{position:absolute;bottom:max(29px,env(safe-area-inset-bottom));left:max(28px,env(safe-area-inset-left));font-size:10px;letter-spacing:.12em;color:#c2d8d9}#ncui .nc-location-name{font-size:15px;color:var(--nc-white);letter-spacing:.18em;margin-bottom:5px}
      #ncui .nc-hints{position:absolute;right:max(28px,env(safe-area-inset-right));bottom:max(28px,env(safe-area-inset-bottom));max-width:430px;text-align:right;color:#b7cdcf;font-size:11px;line-height:1.9}#ncui .nc-device{color:var(--nc-cyan)}
      #ncui .nc-mode{position:absolute;top:145px;right:28px;max-width:310px;color:#bbd0d1;font-size:11px;text-align:right}
      #ncui .nc-combat{position:absolute;right:max(28px,env(safe-area-inset-right));bottom:max(155px,calc(env(safe-area-inset-bottom) + 140px));width:min(300px,42vw);text-align:right;pointer-events:none}
      #ncui .nc-player-readout{display:flex;justify-content:flex-end;gap:18px;align-items:end;margin-top:12px}
      #ncui .nc-readout-label{font-size:10px;letter-spacing:.18em;color:var(--nc-muted)}
      #ncui .nc-health-value{font-size:25px;color:#f0f5e9}.nc-health-bar,.nc-enemy-bar{height:4px;background:#6d879044;margin-top:5px;overflow:hidden}.nc-health-bar i,.nc-enemy-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#75f3ed,#b7fff4);transform-origin:left}.nc-ammo-value{font-size:18px;color:#e9d4aa}.nc-ammo-sub{font-size:10px;color:#95aeb2}
      #ncui .nc-enemy-readout{margin-bottom:22px;padding:12px 14px;border-right:2px solid #ff94b8;background:linear-gradient(270deg,#111e2ad9,transparent);text-align:right}.nc-enemy-name{font-size:16px;letter-spacing:.12em}.nc-enemy-state{color:#ffb7c9;font-size:11px;margin-top:3px;letter-spacing:.08em}.nc-hit-marker{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 13px ui-monospace,monospace;letter-spacing:.16em;color:#fff;opacity:0;text-shadow:0 0 12px #fff}.nc-hit-marker.nc-body{color:#fff}.nc-hit-marker.nc-weak{color:#ffd66e}.nc-hit-marker.nc-kill{color:#ff94b8;font-size:15px}.nc-damage-feed{position:absolute;right:0;bottom:122px;display:grid;gap:3px}.nc-damage-feed span{font:700 13px ui-monospace,monospace;color:#ffd66e;text-shadow:0 0 12px #000}.nc-damage-feed small{font:10px system-ui;color:#d6e2df}.nc-hurt-vignette{position:absolute;inset:0;border:0 solid rgba(255,55,83,0);pointer-events:none}.nc-hurt-vignette.nc-hurt{border-width:12px;border-color:rgba(255,55,83,.48);background:conic-gradient(from calc(var(--nc-hurt-angle,0rad) - 18deg) at 50% 50%,rgba(255,26,55,.45),transparent 9%,transparent 91%,rgba(255,26,55,.45));box-shadow:inset 0 0 90px rgba(255,26,55,.38)}
      #ncui .nc-dead{position:absolute;inset:0;background:rgba(1,7,12,.76);display:grid;place-items:center;text-align:center;pointer-events:auto}.nc-dead-card{padding:38px 48px;border-top:1px solid #ff94b8;background:linear-gradient(180deg,#081923ee,#051018e8);box-shadow:0 20px 90px #0009}.nc-dead-card h2{margin:0 0 8px;font-size:42px;letter-spacing:.18em;color:#f2efe6}.nc-dead-card p{margin:0 0 25px;color:#a9bdc5;font-size:12px;letter-spacing:.12em}
      #ncui .nc-toast{position:absolute;top:24%;left:50%;transform:translateX(-50%);width:max-content;max-width:85vw;background:#0a202be8;border:1px solid #8bd1cc66;padding:10px 19px;font-size:12px;text-align:center}
      #ncui .nc-banner{position:absolute;left:50%;top:16%;transform:translateX(-50%);padding:14px 26px;border-top:1px solid var(--nc-pink);background:linear-gradient(90deg,transparent,#081e2bde 15%,#081e2bde 85%,transparent);text-align:center;width:min(460px,88vw)}#ncui .nc-banner strong{display:block;color:var(--nc-pink);font-size:18px;letter-spacing:.16em}#ncui .nc-banner span{font-size:12px;color:#d5e4df}
      #ncui .nc-pause{position:absolute;inset:0;background:linear-gradient(90deg,#04131ee8,#04131e80 52%,#04131e22);display:flex;align-items:center;padding:5.5vw}#ncui .nc-pause-card{width:340px;max-width:90vw}#ncui .nc-pause h2{font-size:40px;margin:8px 0 26px;letter-spacing:.14em}#ncui .nc-pause-actions{display:grid;gap:12px}#ncui .nc-secondary{background:#0c2532aa;color:var(--nc-white);border:1px solid #94cecc66;padding:12px 20px;text-align:left}
      #ncui .nc-panel{position:absolute;right:max(5vw,env(safe-area-inset-right));top:50%;transform:translateY(-50%);width:min(430px,90vw);max-height:80dvh;overflow:auto;pointer-events:auto;padding:26px;background:#071b27f5;border:1px solid #79b5bb80;box-shadow:0 20px 80px #0005;text-shadow:none}#ncui .nc-panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}#ncui .nc-panel h2{font-size:22px;margin:0}#ncui .nc-close{border:1px solid #89b1b966;background:none;color:var(--nc-white);padding:5px 12px}
      #ncui .nc-setting{display:block;font-size:12px;margin:22px 0}#ncui .nc-setting input{display:block;width:100%;margin-top:14px;accent-color:var(--nc-cyan)}#ncui .nc-setting select{display:block;width:100%;margin-top:12px;background:#102f3b;color:var(--nc-white);border:1px solid #77c8c866;padding:10px}#ncui .nc-quality-note{font-size:11px;color:var(--nc-muted)}
      #ncui .nc-controls{display:grid;grid-template-columns:115px 1fr;gap:12px 14px;font-size:12px}#ncui .nc-controls dt{color:var(--nc-cyan);font-family:ui-monospace,monospace}#ncui .nc-controls dd{margin:0;color:#cfdbd9}#ncui .nc-note{font-size:11px;color:var(--nc-muted);line-height:1.8;margin:22px 0 0}
      @media(max-width:700px){#ncui .nc-title{padding:26px 25px}#ncui .nc-title-content{padding:25px 0}#ncui .nc-coords{font-size:9px;gap:10px}#ncui .nc-title-name{font-size:88px}#ncui .nc-year{font-size:42px}#ncui .nc-blurb{max-width:280px;font-size:12px}#ncui .nc-footer{font-size:9px;gap:9px}#ncui .nc-hud{--nc-pad:16px}#ncui .nc-task{width:57vw;padding:6px 10px}#ncui .nc-task-title{font-size:14px}#ncui .nc-task-desc{font-size:11px}#ncui .nc-telemetry{right:max(16px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));font-size:9px}#ncui .nc-clock{font-size:22px}#ncui .nc-hints{right:16px;bottom:max(16px,env(safe-area-inset-bottom));font-size:9px;max-width:52vw}#ncui .nc-location{left:16px;bottom:max(18px,env(safe-area-inset-bottom));font-size:9px}#ncui .nc-location-name{font-size:12px}#ncui .nc-mode{right:16px;top:155px;max-width:55vw;font-size:10px}#ncui .nc-panel{right:5vw;padding:20px}#ncui .nc-pause{padding:26px}#ncui .nc-progress i{width:23px}#ncui .nc-subtitles{bottom:max(148px,calc(env(safe-area-inset-bottom) + 130px))}}
      @media(max-height:600px){#ncui .nc-title{padding-top:18px;padding-bottom:16px}#ncui .nc-title-content{padding:12px 0}#ncui .nc-eyebrow{margin-bottom:8px}#ncui .nc-title-name{font-size:66px}#ncui .nc-year{font-size:30px}#ncui .nc-english{font-size:18px;margin:3px 0 8px}#ncui .nc-blurb{margin-bottom:12px;font-size:11px}#ncui .nc-primary{padding:10px 20px}#ncui .nc-title-nav{margin-top:5px}#ncui .nc-pause h2{font-size:28px;margin:5px 0 12px}#ncui .nc-pause-actions{gap:7px}#ncui .nc-task-desc{display:none}#ncui .nc-mode{top:110px}#ncui .nc-subtitles{bottom:95px}#ncui .nc-banner{top:8%}}
      @media(prefers-reduced-motion:reduce){#ncui *{scroll-behavior:auto}}
    </style>
    <section class="nc-title" aria-label="XENO SIEGE / BASTION 07 标题">
      <div class="nc-coords nc-mono"><span>XS / BASTION 07</span><span>TACTICAL GRID / X00 · Z24</span><span>DUSK / SWARM INBOUND</span></div>
      <div class="nc-title-content"><p class="nc-eyebrow nc-mono">PLANETARY DEFENSE / FIRST CONTACT</p>
        <h1 class="nc-title-name">虫潮</h1><div class="nc-year nc-mono">07</div><div class="nc-english">XENO SIEGE</div>
        <p class="nc-blurb">Bastion 07 外环遭遇虫群。<br>启动防卫协议，在基地护盾崩溃前守住核心。</p>
        <button class="nc-primary" data-nc-action="start">启动防卫 ↗</button>
        <nav class="nc-title-nav" aria-label="标题菜单"><button class="nc-link" data-nc-action="settings">设置</button><button class="nc-link" data-nc-action="controls">操作指引</button></nav>
      </div><div class="nc-footer nc-mono"><span>DEFENSE / WAVE CONTROL</span><span>按 ENTER 进入 · 建议佩戴耳机</span></div>
    </section>
    <section class="nc-hud" hidden aria-label="探索状态">
      <div class="nc-task"><div class="nc-task-kicker nc-mono" data-nc="stage"></div><div class="nc-task-title" data-nc="objective"></div><p class="nc-task-desc" data-nc="description"></p><div class="nc-progress"><span class="nc-mono" data-nc="progress">0 / 4</span><i></i><i></i><i></i><i></i></div></div>
      <div class="nc-telemetry nc-mono"><div class="nc-clock">WAVE 01</div><div>护盾 100% · 虫潮 INBOUND</div><div>BASTION 07 / DEFENSE GRID</div></div>
      <div class="nc-crosshair" aria-hidden="true"></div>
      <div class="nc-interact" hidden><div class="nc-ring" aria-hidden="true"><span>E</span></div><div><div class="nc-interact-name" data-nc="target"></div><div class="nc-interact-reason" data-nc="reason"></div></div></div>
      <div class="nc-location"><div class="nc-location-name" data-nc="location">Bastion 07 核心防区</div><div class="nc-mono" data-nc="position"></div></div>
      <div class="nc-hints"><div class="nc-device" data-nc="devices"></div><div>WASD 移动 · SPACE 跳 · SHIFT 跑 · CTRL/C 蹲</div><div>E 按住交互 · F 手电 · Q 扫描 · 1 收放枪 · R 换弹 · ESC/P 暂停</div><div>方向键 / IJKL 转向</div></div>
      <div class="nc-mode" data-nc="mode"></div>
      <div class="nc-combat" data-nc="combat" hidden>
        <div class="nc-enemy-readout" data-nc="enemy-panel" hidden><div class="nc-enemy-name">虫潮 / SWARM MASS</div><div class="nc-enemy-state" data-nc="enemy-state"></div><div class="nc-enemy-bar"><i data-nc="enemy-health-bar"></i></div><div class="nc-mono" data-nc="enemy-health"></div></div>
        <div class="nc-damage-feed" data-nc="damage-feed"></div>
        <div class="nc-player-readout"><div><div class="nc-readout-label">生命</div><div class="nc-health-value nc-mono" data-nc="player-health"></div><div class="nc-health-bar"><i data-nc="player-health-bar"></i></div></div><div><div class="nc-readout-label">弹药</div><div class="nc-ammo-value nc-mono" data-nc="ammo"></div><div class="nc-ammo-sub">PRIMARY / READY</div></div></div>
      </div>
      <div class="nc-hit-marker" data-nc="hit-marker"></div><div class="nc-hurt-vignette" data-nc="hurt-vignette"></div>
    </section>
    <section class="nc-dead" hidden role="dialog" aria-modal="true" aria-label="防线失守"><div class="nc-dead-card"><h2>防线失守</h2><p>基地核心护盾归零 · 本场景已暂停</p><button class="nc-primary" data-nc-action="restart">重新启动防卫 ↗</button></div></section>
    <section class="nc-pause" hidden role="dialog" aria-modal="true" aria-label="暂停菜单"><div class="nc-pause-card"><div class="nc-eyebrow nc-mono">DEFENSE HELD / BASTION 07</div><h2>虫潮暂缓</h2><div class="nc-pause-actions"><button class="nc-primary" data-nc-action="resume">继续防卫 ↗</button><button class="nc-secondary" data-nc-action="restart">重新启动防卫</button><button class="nc-secondary" data-nc-action="settings">音量 / 画质</button><button class="nc-secondary" data-nc-action="controls">操作指引</button></div></div></section>
    <section class="nc-panel" hidden role="dialog" aria-modal="true" aria-labelledby="nc-panel-title"><div class="nc-panel-head"><h2 id="nc-panel-title">设置</h2><button class="nc-close" data-nc-action="close" aria-label="关闭面板">返回</button></div>
      <div data-nc="settings" hidden><label class="nc-setting">主音量 <output data-nc="volume-label">65%</output><input data-nc="volume" aria-label="主音量" type="range" min="0" max="100" value="65" step="1"></label><label class="nc-setting" data-nc="quality-setting">画面质量<select data-nc="quality" aria-label="画面质量"><option value="low">低 / LOW</option><option value="medium">中 / MEDIUM</option><option value="high">高 / HIGH</option><option value="ultra">极高 / ULTRA</option></select></label><p class="nc-quality-note" data-nc="quality-note"></p></div>
      <div data-nc="controls" hidden><dl class="nc-controls"><dt>W A S D</dt><dd>移动</dd><dt>鼠标 / 方向键</dt><dd>调整视角，也可使用 I J K L</dd><dt>SPACE / SHIFT</dt><dd>跳跃 / 奔跑</dd><dt>CTRL / C</dt><dd>按住蹲伏</dd><dt>按住 E</dt><dd>靠近、看向目标并保持按住</dd><dt>F / Q</dt><dd>手电 / 扫描（持续 6 秒，冷却 10 秒）</dd><dt>1</dt><dd>展示 / 收起第一人称武器</dd><dt>鼠标左键 / 右键</dt><dd>开火 / ADS 瞄准</dd><dt>R</dt><dd>装填</dd><dt>ESC / P</dt><dd>暂停 / 继续</dl><p class="nc-note">第一目标是启动防卫协议。虫群会从外环涌入并攀爬堆叠；粗红色爆浆为击杀反馈，酸性绿色为次级组织。保持护盾核心在可修复状态，直到虫潮退去。</p></div>
    </section>
    <div class="nc-subtitles" hidden role="status" aria-live="polite"><div class="nc-speaker nc-mono" data-nc="speaker"></div><div class="nc-subtitle-text" data-nc="subtitle"></div></div>
    <div class="nc-toast" hidden role="status" aria-live="polite"></div>
    <div class="nc-banner" hidden role="status" aria-live="polite"><strong>防卫阶段完成</strong><span>Bastion 07 核心仍在运转 · 虫潮已退</span></div>`;
  app.appendChild(root);
  const ui = {};
  root.querySelectorAll('[data-nc]').forEach(node => { ui[node.dataset.nc] = node; });
  const titleLayer = root.querySelector('.nc-title');
  const hudLayer = root.querySelector('.nc-hud');
  const pauseLayer = root.querySelector('.nc-pause');
  const deadLayer = root.querySelector('.nc-dead');
  const panelLayer = root.querySelector('.nc-panel');
  const interactionLayer = root.querySelector('.nc-interact');
  const subtitleLayer = root.querySelector('.nc-subtitles');
  const toastLayer = root.querySelector('.nc-toast');
  const bannerLayer = root.querySelector('.nc-banner');
  const ring = root.querySelector('.nc-ring');
  const progressBars = [...root.querySelectorAll('.nc-progress i')];

  const flashlight = new T.SpotLight(0xc8f5ff, 28, 20, 0.45, 0.55, 1.5);
  flashlight.name = 'nc-flashlight';
  flashlight.position.set(0.16, -0.12, -0.12);
  flashlight.visible = false;
  flashlight.castShadow = false;
  const flashlightTarget = new T.Object3D();
  flashlightTarget.name = 'nc-flashlight-target';
  flashlightTarget.position.set(0.08, -0.08, -15);
  camera.add(flashlight, flashlightTarget);
  flashlight.target = flashlightTarget;

  const markerGroup = new T.Group();
  markerGroup.name = 'nc-interaction-markers';
  const markerParent = cyber.markerRoot || G.scene;
  if (markerParent) markerParent.add(markerGroup);
  const markerGeometry = new T.OctahedronGeometry(0.085, 0);
  const markerMaterials = [];
  const markers = entries.filter(item => item.pos).map(item => {
    const material = new T.MeshBasicMaterial({color: 0x75f3ed, wireframe: true, transparent: true, opacity: 0.75, depthTest: true, depthWrite: false});
    markerMaterials.push(material);
    const mesh = new T.Mesh(markerGeometry, material);
    mesh.name = 'nc-marker-' + item.id;
    mesh.position.copy(item.pos);
    mesh.position.y += 0.32;
    mesh.renderOrder = 20;
    markerGroup.add(mesh);
    return {item, mesh};
  });

  const game = {
    state: 'title', flow: {total: 4, mainIds: mainIds.slice()}, run,
    menus: null,
    start(options = {}) { return start(options, 'debug'); },
    pause() { return pause('api'); },
    resume() { return resume('api'); },
    update,
    dispose
  };

  function record(action, source, data = {}) {
    run.debug.lastSource = source;
    if (source === 'debug') run.debug.calls++;
    run.debug.log.push({time: run.time, action, source, ...data});
    if (run.debug.log.length > 100) run.debug.log.shift();
  }
  function click() {
    run.audio.clicks++;
    emit('ui:click', {});
  }
  function cue() {
    // 已核实原版 play(name, {gain, pitch, jitter, ...})；不直连未知 master。
    if (G.audio && typeof G.audio.play === 'function') {
      const played = G.audio.play('ui_hover', {gain: 0.28, pitch: 0.85, jitter: 0});
      if (played !== false) run.audio.cues++;
    }
  }
  function toast(text, duration = 3) {
    toastText = text;
    toastRemaining = duration;
  }
  function say(text, speaker = '基地指挥', duration = 4.5) {
    if (subtitleQueue.length >= 12) subtitleQueue.shift();
    subtitleQueue.push({text, speaker, duration});
  }
  function setVisualState(item, state) {
    const meta = metadata.get(item);
    if (meta.state === state) return;
    meta.state = state;
    if (typeof item.setState === 'function') {
      try { item.setState(state); }
      catch (error) { record('scene-state-error', 'scene', {id: item.id, message: String(error)}); }
    }
  }
  function lockReason(item) {
    const index = mainIds.indexOf(item.id);
    if (index >= 0 && !item.done && run.stage !== index) {
      return ['先启动防卫协议', '先确认虫潮进入射界', '先回到护盾核心校准', '先守住这一波虫潮'][Math.max(0, index - 1)] || '先完成前一步防卫目标';
    }
    if (item.done && item.id !== 'door' && !item.repeat) return '已完成';
    if (typeof item.enabled === 'function') {
      try { if (!item.enabled()) return item.lockedReason || '目标当前尚未进入可操作状态'; }
      catch (error) { return '目标状态异常，暂不可操作'; }
    }
    // 部分场景将门的 enabled 仅用于首次授权，解锁后仍应允许重复开关。
    if (typeof item.enabled === 'function') {
      try {
        if (!item.enabled()) return item.lockedReason || '设备暂不可用，请先完成前置步骤';
      } catch (error) {
        record('enabled-error', 'scene', {id: item.id, message: String(error)});
        return '设备状态异常，暂不可用';
      }
    }
    return '';
  }
  function refreshStates() {
    entries.forEach(item => {
      const meta = metadata.get(item);
      setVisualState(item, item.done ? 'done' : lockReason(item) ? 'locked' : meta.hold > 0 ? 'holding' : 'ready');
    });
  }
  function setState(next) {
    const prev = game.state;
    if (prev !== next) {
      game.state = next;
      root.dataset.state = next;
      emit('game:state', {state: next, prev});
    }
    titleLayer.hidden = next !== 'title';
    hudLayer.hidden = next !== 'playing';
    pauseLayer.hidden = next !== 'paused';
    deadLayer.hidden = next !== 'dead';
    if (next !== 'playing') interactionLayer.hidden = true;
    call(G.hud, 'show', false);
  }
  function setFov(value) {
    camera.fov = value;
    camera.updateProjectionMatrix();
  }
  function clearInput() {
    call(input, 'setGameplay', false);
    call(input, 'endFrame');
    input.fire = false;
    input.ads = false;
    if (input.move) input.move.x = input.move.y = 0;
    keyESource = '';
    pendingPause = false;
    pendingScan = pendingFlashlight = pendingWeapon = '';
    heldLatch = false;
    entries.forEach(item => { metadata.get(item).hold = 0; });
    focus = null;
    call(input, 'setPrompt', null);
  }
  function setWeaponVisible(visible, source) {
    run.weaponVisible = !!visible;
    call(G.weapon, 'setVisible', run.weaponVisible);
    if (source) {
      record('weapon', source, {visible: run.weaponVisible});
      toast(run.weaponVisible ? '主武器已展示 · 瞄准虫群弱点并压制前锋' : '武器已收起');
    }
  }
  const originalWeaponUpdate = G.weapon && G.weapon.update;
  const weaponWrapper = function (...args) {
    if (run.weaponVisible && game.state === 'playing') return originalWeaponUpdate.apply(this, args);
    const fire = input.fire;
    const ads = input.ads;
    input.fire = false;
    input.ads = false;
    try { return originalWeaponUpdate.apply(this, args); }
    finally { input.fire = fire; input.ads = ads; }
  };
  if (typeof originalWeaponUpdate === 'function') G.weapon.update = weaponWrapper;

  function applyFlashlight(visible) {
    run.flashlight = !!visible;
    flashlight.visible = run.flashlight && game.state === 'playing';
  }
  function toggleFlashlight(source = 'debug') {
    if (game.state !== 'playing') return false;
    applyFlashlight(!run.flashlight);
    record('flashlight', source, {on: run.flashlight});
    cue();
    toast(run.flashlight ? '手电已开启' : '手电已关闭', 1.7);
    return run.flashlight;
  }
  function scan(source = 'debug') {
    if (game.state !== 'playing') return false;
    record('scan-attempt', source);
    if (run.scan.cooldown > 0) {
      toast('扫描充能中 · ' + Math.ceil(run.scan.cooldown) + ' 秒', 1.6);
      return false;
    }
    run.scan.remaining = 6;
    run.scan.cooldown = 10;
    run.scan.count++;
    cue();
    toast('扫描已展开 · 交互信标高亮 6 秒');
    return true;
  }
  function readPlayerHealth() {
    const value = Number(player.health ?? player.hp ?? player.currentHealth);
    const max = Number(player.maxHealth ?? player.maxHp ?? player.healthMax);
    return {value: Number.isFinite(value) ? Math.max(0, value) : 100, max: Number.isFinite(max) && max > 0 ? max : 100};
  }
  function readWeaponAmmo() {
    const weapon = G.weapon || {};
    const value = weapon.ammo ?? weapon.magazine ?? weapon.currentAmmo;
    const reserve = weapon.reserve ?? weapon.reserveAmmo ?? weapon.totalAmmo;
    return {value: Number.isFinite(Number(value)) ? Number(value) : null, reserve: Number.isFinite(Number(reserve)) ? Number(reserve) : null};
  }
  function crawlerState(payload = {}) {
    const swarm = cyber.swarm;
    if (swarm && swarm.status) {
      const s = swarm.status;
      return {hp:s.coreHealth,maxHp:100,phase:s.phase,active:s.active,kills:s.killed,climbers:s.climbers,shots:0,hitsReceived:0,playerHits:0,dead:s.phase==='overrun'};
    }
    const enemy = payload.enemy || cyber.crawler;
    if (enemy && typeof enemy.snapshot === 'function') {
      const snapshot = enemy.snapshot();
      return snapshot && snapshot.combat ? snapshot.combat : snapshot;
    }
    return enemy && enemy.combat ? enemy.combat : payload.combat || null;
  }
  function pushCombatFeedback(payload = {}) {
    const part = payload.part || payload.phase || 'body';
    const killed = !!payload.killed || part === 'kill';
    const weak = !!payload.weak || part === 'weak';
    combatUI.hitMarker = killed ? 'kill' : weak ? 'weak' : 'body';
    combatUI.hitRemaining = killed ? 0.42 : 0.24;
    const damage = Number(payload.damage);
    combatUI.feedback.unshift({damage: Number.isFinite(damage) ? damage : 0, part: killed ? '击杀' : weak ? '弱点' : part === 'gun' ? '枪体' : part === 'ammo' ? '弹药箱' : '本体', time: killed ? 0.42 : 0.95});
    if (combatUI.feedback.length > 4) combatUI.feedback.length = 4;
  }
  function updatePlayerHurt(payload = {}) {
    const from = payload.fromPos;
    if (from && player.pos) {
      direction.set(Number(from.x) || 0, 0, Number(from.z) || 0).sub(new T.Vector3(player.pos.x, 0, player.pos.z));
      if (direction.lengthSq() > 0.0001) combatUI.hurtAngle = Math.atan2(direction.x, direction.z);
    }
    combatUI.hurtRemaining = 0.3;
  }
  function diePlayer() {
    if (game.state === 'dead') return;
    clearInput();
    player.enabled = false;
    player.invulnerable = false;
    call(input, 'exitLock');
    flashlight.visible = false;
    setState('dead');
    call(G.audio, 'setPaused', true);
    call(G.audio, 'setIntensity', 0.12);
  }
  function resetCombatUI() {
    combatUI.enemyVisible = false;
    combatUI.enemy = null;
    combatUI.hurtRemaining = 0;
    combatUI.hurtAngle = 0;
    combatUI.hitMarker = '';
    combatUI.hitRemaining = 0;
    combatUI.feedback.length = 0;
    combatUI.lastDamage = 0;
  }
  function resetRun() {
    const restarts = run.restarts;
    const volume = run.audio.volume;
    clearInput();
    // 场景 reset 负责实际门碰撞与动画复位；没有 reset 时复用门自己的 reset。
    entries.forEach(item => { item.done = false; });
    run.stage = 0;
    run.completed = false;
    if (typeof cyber.reset === 'function') cyber.reset();
    else (cyber.doors || []).forEach(door => {
      if (typeof door.reset === 'function') door.reset();
      else if (typeof door.setOpen === 'function') door.setOpen(false);
      if ('open' in door) door.open = false;
      if ('targetOpen' in door) door.targetOpen = false;
      if ('locked' in door) door.locked = true;
    });
    Object.assign(run, {time: 0, stage: 0, completed: false, progress: 0, restarts, flashlight: false, weaponVisible: false, subtitles: 0});
    Object.keys(run.interactions).forEach(key => { run.interactions[key] = 0; });
    Object.assign(run.scan, {cooldown: 0, remaining: 0, count: 0});
    Object.assign(run.audio, {volume, intensity: 0.12, clicks: 0, cues: 0, resumed: 0});
    Object.assign(run.input, {trustedKeys: 0, syntheticKeys: 0, interactionSamples: 0});
    run.debug.log.length = 0;
    run.debug.calls = 0;
    subtitleQueue.length = 0;
    subtitle = null;
    resetCombatUI();
    bannerRemaining = toastRemaining = 0;
    entries.forEach(item => {
      item.done = false;
      Object.assign(metadata.get(item), {hold: 0, state: '', count: 0});
    });
    call(G.enemies, 'clear');
    call(G.fx, 'clear');
    call(G.combat, 'reset');
    call(G.weapon, 'reset');
    call(player, 'setFov', 74);
    player.reset(G.level.playerStart);
    player.enabled = true;
    player.invulnerable = false;
    setFov(74);
    setWeaponVisible(false);
    applyFlashlight(false);
    call(G.hud, 'reset');
    call(G.hud, 'show', false);
    call(G.audio, 'setVolume', volume);
    call(G.audio, 'setIntensity', 0.12);
    if (G.render && G.render.post) {
      G.render.post.fade = 0;
      G.render.post.damage = 0;
      G.render.post.lowHealth = 0;
    }
    refreshStates();
  }
  function resumeAudio() {
    run.audio.resumed++;
    const promise = call(G.audio, 'resume');
    if (promise && typeof promise.catch === 'function') promise.catch(() => {
      toast('音频尚未解锁，可再次点击游戏画面。');
    });
    call(G.audio, 'setPaused', false);
  }
  function requestLock() {
    hadLock = !!input.locked;
    call(input, 'requestLock');
    modePoll = 0;
  }
  function start(options = {}, source = 'debug') {
    if (disposed) return false;
    closePanel();
    resetRun();
    record('start', source, {skipIntro: !!options.skipIntro});
    resumeAudio();
    setState('playing');
    call(input, 'setGameplay', true);
    pauseGuard = 0.3;
    requestLock();
    if (!options.skipIntro) {
      say('Bastion 07 防卫协议待命。启动核心，等待虫潮进入射界。', '基地指挥', 5);
      say('不必赶路。走近终端，看向屏幕，按住 E 接收。', '操作提示', 4.5);
    }
    renderUI(0);
    return true;
  }
  function pause(source = 'input') {
    if (game.state !== 'playing') return false;
    record('pause', source);
    clearInput();
    player.enabled = false;
    setState('paused');
    call(G.audio, 'setPaused', true);
    flashlight.visible = false;
    call(input, 'exitLock');
    pauseGuard = 0.25;
    closePanel();
    root.querySelector('[data-nc-action="resume"]').focus({preventScroll: true});
    renderUI(0);
    return true;
  }
  function resume(source = 'input') {
    if (game.state !== 'paused' || document.hidden) return false;
    closePanel();
    clearInput();
    player.enabled = true;
    player.invulnerable = false;
    setState('playing');
    call(input, 'setGameplay', true);
    resumeAudio();
    flashlight.visible = run.flashlight;
    pauseGuard = 0.3;
    requestLock();
    record('resume', source);
    renderUI(0);
    return true;
  }

  function openPanel(name) {
    if (game.state === 'playing') return;
    if (panel === name) { closePanel(); return; }
    previousFocus = document.activeElement;
    panel = name;
    panelLayer.hidden = false;
    panelLayer.setAttribute('aria-label', name === 'settings' ? '设置' : '操作指引');
    document.getElementById('nc-panel-title').textContent = name === 'settings' ? '设置' : '操作指引';
    ui.settings.hidden = name !== 'settings';
    ui.controls.hidden = name !== 'controls';
    titleLayer.inert = game.state === 'title';
    pauseLayer.inert = game.state === 'paused';
    panelLayer.querySelector('button').focus({preventScroll: true});
  }
  function closePanel() {
    const wasOpen = !!panel;
    panel = '';
    panelLayer.hidden = true;
    titleLayer.inert = false;
    pauseLayer.inert = false;
    if (wasOpen && previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({preventScroll: true});
    return wasOpen;
  }
  function setVolume(value) {
    run.audio.volume = bounded(Number(value) || 0, 0, 1);
    call(G.audio, 'setVolume', run.audio.volume);
    ui.volume.value = String(Math.round(run.audio.volume * 100));
    ui['volume-label'].textContent = Math.round(run.audio.volume * 100) + '%';
  }
  let qualityValue = ['low', 'medium', 'high', 'ultra'].includes(G.quality && G.quality.name) ? G.quality.name : 'high';
  ui.quality.value = qualityValue;
  if (!G.render || typeof G.render.setQuality !== 'function') {
    ui['quality-setting'].hidden = true;
    ui['quality-note'].textContent = '当前渲染器未提供画质切换接口。';
  } else ui['quality-note'].textContent = '画质切换将调用当前渲染器，可能需要重建部分效果。';
  listen(ui.volume, 'input', () => setVolume(Number(ui.volume.value) / 100));
  listen(ui.quality, 'change', async () => {
    if (qualityBusy) return;
    qualityBusy = true;
    ui.quality.disabled = true;
    const requested = ui.quality.value;
    try {
      const result = await G.render.setQuality({...Pr[requested]});
      if (result === false) throw new Error('渲染器拒绝切换');
      qualityValue = requested;
      ui['quality-note'].textContent = '当前画质：' + ui.quality.selectedOptions[0].textContent;
    } catch (error) {
      ui.quality.value = qualityValue;
      ui['quality-note'].textContent = '画质未切换：' + String(error.message || error);
    } finally {
      qualityBusy = false;
      ui.quality.disabled = false;
    }
  });
  listen(root, 'click', event => {
    const button = event.target.closest('[data-nc-action]');
    if (!button || !root.contains(button)) return;
    const action = button.dataset.ncAction;
    const source = event.isTrusted ? 'ui' : 'synthetic-ui';
    click();
    if (action === 'start') start({}, source);
    else if (action === 'resume') resume(source);
    else if (action === 'restart') { run.restarts++; start({skipIntro: true}, source); }
    else if (action === 'settings' || action === 'controls') openPanel(action);
    else if (action === 'close') closePanel();
  });
  listen(window, 'keydown', event => {
    const editable = event.target && /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName);
    if (editable || event.isComposing) return;
    const source = event.isTrusted ? 'keyboard' : 'synthetic-keyboard';
    if (!event.repeat) {
      if (event.isTrusted) run.input.trustedKeys++;
      else run.input.syntheticKeys++;
    }
    if (event.code === 'KeyE') keyESource = source;
    if (event.code === 'Tab' && game.state !== 'playing') {
      const container = panel ? panelLayer : game.state === 'paused' ? pauseLayer : titleLayer;
      const buttons = [...container.querySelectorAll('button,input,select')].filter(node => !node.disabled && !node.closest('[hidden]'));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (first && ((!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) || (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
    if (event.repeat) return;
    if (event.code === 'Escape' || event.code === 'KeyP') {
      if (panel) { event.preventDefault(); closePanel(); pauseGuard = 0.3; return; }
      if (game.state !== 'title') { pendingPause = true; event.preventDefault(); }
      return;
    }
    if (game.state === 'title' && !panel && (event.code === 'Enter' || event.code === 'NumpadEnter') && event.target.tagName !== 'BUTTON') {
      // 在真实手势内调用音频和鼠标锁，不能延迟到下一帧再请求权限。
      event.preventDefault();
      start({}, source);
      return;
    }
    if (game.state === 'dead' && (event.code === 'Enter' || event.code === 'NumpadEnter')) {
      event.preventDefault();
      run.restarts++;
      start({skipIntro: true}, source);
      return;
    }
    if (game.state !== 'playing') return;
    if (event.code === 'KeyF') { pendingFlashlight = source; event.preventDefault(); }
    if (event.code === 'KeyQ') { pendingScan = source; event.preventDefault(); }
    if (event.code === 'Digit1') { pendingWeapon = source; event.preventDefault(); }
  });
  listen(window, 'keyup', event => { if (event.code === 'KeyE') keyESource = ''; });
  listen(window, 'blur', () => { if (game.state === 'playing') pause('blur'); });
  listen(document, 'visibilitychange', () => { if (document.hidden && game.state === 'playing') pause('visibility'); });
  if (G.events && typeof G.events.on === 'function') {
    const off = G.events.on('input:lock', event => {
      if (event.locked) hadLock = true;
      else if (hadLock && game.state === 'playing') { hadLock = false; pause('pointer-unlock'); }
    });
    if (typeof off === 'function') unsubscribers.push(off);
    const on = (name, handler) => {
      const remove = G.events.on(name, handler);
      if (typeof remove === 'function') unsubscribers.push(remove);
    };
    on('player:hitEnemy', payload => {
      if (!payload || (payload.enemy && payload.enemy.id && !String(payload.enemy.id).startsWith('xeno-'))) return;
      combatUI.enemyVisible = true;
      combatUI.enemy = payload.enemy || cyber.crawler;
      pushCombatFeedback({...payload, damage: combatUI.lastDamage || 0});
      combatUI.lastDamage = 0;
    });
    on('xeno:hit', payload => {
      if (!payload) return;
      combatUI.lastDamage = payload.damage;
      combatUI.enemyVisible = true;
      combatUI.enemy = payload.enemy || cyber.crawler;
    });
    on('xeno:death', payload => {
      if (!payload) return;
      combatUI.enemyVisible = true;
      combatUI.enemy = payload.enemy || cyber.crawler;
      pushCombatFeedback({ ...payload, part: 'kill', killed: true, damage: payload.damage || 0 });
    });
    on('xeno:coreHit', payload => {
      if (!payload) return;
      combatUI.enemyVisible = true;
      combatUI.enemy = cyber.crawler;
      updatePlayerHurt({fromPos: payload.pos});
    });
    on('player:hit', payload => {
      updatePlayerHurt(payload || {});
      const health = readPlayerHealth();
      if (health.value <= 0) diePlayer();
    });
  }

  function visibleFromEye(item) {
    if (!G.physics || typeof G.physics.lineOfSight !== 'function') return false;
    endpoint.copy(item.pos);
    // 只截短门端点，不跳过整条视线，也不修改物理碰撞盒。
    if (item.id === 'door' || item.kind === 'door') {
      offset.subVectors(endpoint, eye);
      const distance = offset.length();
      if (distance > 0.001) endpoint.addScaledVector(offset, -Math.min(0.25, distance * 0.5) / distance);
    }
    return !!G.physics.lineOfSight(eye, endpoint);
  }
  function findFocus() {
    eye.copy(player.eye || camera.position);
    camera.updateMatrixWorld(true);
    camera.getWorldDirection(direction).normalize();
    let best = null;
    let bestScore = -Infinity;
    for (const item of entries) {
      if (!item.pos || (item.done && !item.repeat)) continue;
      offset.subVectors(item.pos, eye);
      const distance = offset.length();
      if (distance > item.reach || distance < 0.001) continue;
      const dot = offset.dot(direction) / distance;
      if (dot <= 0.45 || !visibleFromEye(item)) continue;
      const score = dot * 2 - distance / item.reach;
      if (score > bestScore) { best = item; bestScore = score; }
    }
    return best;
  }
  function perform(item) {
    const reason = lockReason(item);
    if (reason) { toast(reason); return false; }
    const meta = metadata.get(item);
    const wasDone = item.done;
    const index = mainIds.indexOf(item.id);
    const doorToggle = false;
    const source = keyESource || 'input-touch-or-gamepad';
    run.interactions.attempts++;
    record('interaction-attempt', source, {id: item.id});
    try {
      // 主任务及门必须由场景回调实际完成，不能只更新界面数字。
      if (typeof item.callback !== 'function' && index >= 0) {
        toast('场景未接通 ' + item.label + ' 回调，无法执行。');
        run.interactions.failed++;
        return false;
      }
      const result = typeof item.callback === 'function' ? item.callback() : undefined;
      if (result === false || (result && typeof result.then === 'function')) {
        if (result && typeof result.catch === 'function') result.catch(error => {
          record('async-callback-error', 'scene', {id: item.id, message: String(error)});
        });
        item.done = wasDone;
        run.interactions.failed++;
        toast(result === false ? (item.lockedReason || '设备尚未就绪，请松开 E 后重试。') : '交互回调须同步返回成功或 false。');
        return false;
      }
    } catch (error) {
      item.done = wasDone;
      run.interactions.failed++;
      record('callback-error', 'scene', {id: item.id, message: String(error)});
      toast('交互未完成，请松开 E 后重试。');
      return false;
    }
    item.done = true;
    meta.count++;
    meta.hold = 0;
    run.interactions.success++;
    if (doorToggle) {
      run.interactions.doorToggles++;
      toast('诊所门开关已响应', 1.8);
    } else if (index >= 0) {
      run.stage = index + 1;
      run.progress = bounded(run.stage - 1, 0, 4);
      run.interactions.main++;
      const messages = {
        deploy: ['Bastion 07 防卫网已启动', '基地指挥', '外环传感器已锁定。虫潮正在靠近，准备接敌。'],
        command: ['第一波虫潮进入射界', '基地指挥', '红色目标为主群，绿色闪烁为酸性组织；保持火力并观察攀爬堆叠。'],
        reactor: ['护盾核心已校准', '基地核心', '护盾恢复。继续守住防线，直到虫潮退潮。'],
        extract: ['防卫战阶段完成', 'Bastion 07', '外环压力归零。基地仍在运转，本关卡结束。']
      };
      const text = messages[item.id];
      toast(text[0]);
      say(text[2], text[1], item.id === 'upload' ? 6 : 4.8);
      emit('cyber:quest', {id: item.id, stage: run.stage, progress: run.progress, source});
      if (item.id === 'extract') {
        run.completed = true;
        bannerRemaining = 8;
        emit('cyber:completed', {time: run.time, source});
      }
      } else {
        run.interactions.auxiliary++;
        say(item.description, item.label, 4.5);
        toast(item.label + ' · 状态已记录');
      }
    record('interaction-success', source, {id: item.id, count: meta.count});
    emit('cyber:interaction', {id: item.id, source, count: meta.count, repeat: wasDone});
    cue();
    refreshStates();
    return true;
  }
  function updateInteractions(dt) {
    focus = findFocus();
    const held = !!input.down('interact');
    if (!held) heldLatch = false;
    const available = focus && !lockReason(focus);
    entries.forEach(item => {
      const meta = metadata.get(item);
      if (item === focus && held && available && !heldLatch) {
        meta.hold = Math.min(item.hold, meta.hold + dt);
        run.input.interactionSamples++;
        setVisualState(item, 'holding');
        if (meta.hold + 1e-6 >= item.hold) {
          heldLatch = true;
          perform(item);
          meta.hold = 0;
          refreshStates();
        }
      } else if (meta.hold > 0) {
        meta.hold = Math.max(0, meta.hold - dt * 1.6);
        if (meta.hold === 0) setVisualState(item, item.done ? 'done' : lockReason(item) ? 'locked' : 'ready');
      }
    });
    call(input, 'setPrompt', focus ? '按住 E · ' + focus.label : null);
  }
  function animateMarkers(dt) {
    markerGroup.visible = game.state === 'playing';
    const scanning = run.scan.remaining > 0;
    for (const {item, mesh} of markers) {
      const done = item.done && item.id !== 'door' && !item.repeat;
      const disabled = typeof item.enabled === 'function' && !item.enabled();
      const distance = player.pos.distanceTo(item.pos);
      const main = mainIds[run.stage] === item.id;
      mesh.visible = !disabled && !done && (scanning || main || distance < 5);
      if (!mesh.visible) continue;
      mesh.rotation.y += dt * (scanning ? 1.8 : 0.5);
      mesh.position.copy(item.pos);
      mesh.position.y = item.pos.y + 0.32 + Math.sin(run.time * 2 + item.pos.x) * 0.035;
      const scale = scanning ? 1.5 + Math.sin(run.time * 5) * 0.15 : 1;
      mesh.scale.setScalar(scale);
      mesh.material.depthTest = !scanning;
      mesh.material.opacity = scanning ? 0.95 : main ? 0.8 : 0.5;
      mesh.material.color.set(lockReason(item) ? 0xff94b8 : 0x75f3ed);
    }
  }
  function updateMessages(dt) {
    combatUI.hurtRemaining = Math.max(0, combatUI.hurtRemaining - dt);
    combatUI.hitRemaining = Math.max(0, combatUI.hitRemaining - dt);
    combatUI.feedback.forEach(item => { item.time -= dt; });
    combatUI.feedback = combatUI.feedback.filter(item => item.time > 0);
    toastRemaining = Math.max(0, toastRemaining - dt);
    bannerRemaining = Math.max(0, bannerRemaining - dt);
    if (!subtitle && subtitleQueue.length) {
      subtitle = {...subtitleQueue.shift(), time: 0};
      run.subtitles++;
    }
    if (subtitle) {
      subtitle.time += dt;
      if (subtitle.time >= subtitle.duration) subtitle = null;
    }
  }
  function renderUI(dt) {
    const playing = game.state === 'playing';
    const id = mainIds[run.stage];
    ui.stage.textContent = run.completed ? 'DEFENSE SECURED / 防线完成' : run.stage === 0 ? 'DEFENSE PROTOCOL / 待命' : 'XENO SIEGE / 阶段 ' + run.progress + ' OF 4';
    ui.objective.textContent = run.completed ? '确认 Bastion 07 核心' : defaults[id][1];
    ui.description.textContent = run.completed ? '虫潮已退，确认护盾核心与基地结构仍在运转。' : defaults[id][2];
    ui.progress.textContent = run.progress + ' / 4';
    progressBars.forEach((bar, i) => bar.classList.toggle('nc-filled', i < run.progress));
    const pos = player.pos;
    ui.position.textContent = 'X ' + pos.x.toFixed(1) + ' / Z ' + pos.z.toFixed(1);
    ui.location.textContent = pos.z > 15 ? 'Bastion 07 核心防区' : pos.z > 8 ? '外环闸门 / 火力塔' : '异星外环地表';
    const swarmStatus = cyber.swarm && cyber.swarm.status ? cyber.swarm.status : null;
    ui.devices.textContent = 'F 手电 ' + (run.flashlight ? 'ON' : 'OFF') + ' · Q ' + (run.scan.remaining > 0 ? '扫描 ' + Math.ceil(run.scan.remaining) + 's' : run.scan.cooldown > 0 ? '充能 ' + Math.ceil(run.scan.cooldown) + 's' : '扫描就绪') + ' · 1 ' + (run.weaponVisible ? '收起武器' : '展示武器') + (swarmStatus ? ' · 活跃虫体 ' + swarmStatus.active : '');
    if (playing && focus) {
      const reason = lockReason(focus);
      const meta = metadata.get(focus);
      interactionLayer.hidden = false;
      interactionLayer.classList.toggle('nc-locked', !!reason);
      ui.target.textContent = focus.label;
      ui.reason.textContent = reason ? '已锁定 · ' + reason : heldLatch ? '松开 E 后可再次操作' : '按住 E · ' + focus.hold.toFixed(1) + ' 秒';
      ring.style.setProperty('--nc-hold', String(bounded(meta.hold / focus.hold, 0, 1)));
    } else interactionLayer.hidden = true;
    modePoll -= dt;
    if (modePoll <= 0) {
      modePoll = 0.75;
      const description = call(input, 'describeMode') || '';
      modeMessage = input.locked || input.touch ? '' : description.replace(/点击开火[；;]?/g, run.weaponVisible ? '点击开火；' : '武器收起时不会射击；');
    }
    ui.mode.textContent = modeMessage;
    const health = readPlayerHealth();
    const ammo = readWeaponAmmo();
    const combatState = crawlerState({enemy: combatUI.enemy || cyber.crawler});
    const enemyHp = combatState && Number.isFinite(Number(combatState.hp)) ? Number(combatState.hp) : null;
    const enemyMaxHp = combatState && Number.isFinite(Number(combatState.maxHp)) ? Number(combatState.maxHp) : 100;
    const enemyActive = combatUI.enemyVisible && combatState;
    ui.combat.hidden = !playing || (!run.weaponVisible && !combatUI.enemyVisible && !combatUI.feedback.length);
    ui['enemy-panel'].hidden = !enemyActive;
    ui['enemy-health'].textContent = enemyHp === null ? '' : Math.ceil(enemyHp) + ' / ' + enemyMaxHp;
    ui['enemy-health-bar'].style.transform = 'scaleX(' + bounded((enemyHp === null ? 0 : enemyHp) / enemyMaxHp, 0, 1) + ')';
    ui['enemy-state'].textContent = combatState ? ({dormant:'待命',inbound:'虫潮涌入',secured:'防线守住',overrun:'防线失守'}[combatState.phase] || combatState.phase || '') + (combatState.climbers ? ' · 攀爬堆叠 ' + combatState.climbers : '') : '';
    ui['player-health'].textContent = Math.ceil(health.value) + ' / ' + health.max;
    ui['player-health-bar'].style.transform = 'scaleX(' + bounded(health.value / health.max, 0, 1) + ')';
    ui.ammo.textContent = ammo.value === null ? '—' : ammo.value + (ammo.reserve === null ? '' : ' / ' + ammo.reserve);
    ui['hit-marker'].className = 'nc-hit-marker ' + (combatUI.hitMarker ? 'nc-' + combatUI.hitMarker : '');
    ui['hit-marker'].textContent = combatUI.hitMarker === 'kill' ? 'TARGET DOWN' : combatUI.hitMarker === 'weak' ? 'WEAK POINT' : combatUI.hitMarker === 'body' ? 'HIT' : '';
    ui['hit-marker'].style.opacity = combatUI.hitRemaining > 0 ? '1' : '0';
    ui['hurt-vignette'].classList.toggle('nc-hurt', combatUI.hurtRemaining > 0);
    ui['hurt-vignette'].style.setProperty('--nc-hurt-angle', combatUI.hurtAngle + 'rad');
    ui['damage-feed'].textContent = '';
    combatUI.feedback.forEach(item => {
      const line = document.createElement('span');
      line.textContent = '-' + item.damage + ' ';
      const part = document.createElement('small');
      part.textContent = item.part;
      line.appendChild(part);
      ui['damage-feed'].appendChild(line);
    });
    subtitleLayer.hidden = !playing || !subtitle;
    if (subtitle) {
      ui.speaker.textContent = subtitle.speaker;
      ui.subtitle.textContent = subtitle.text;
    }
    toastLayer.hidden = !playing || toastRemaining <= 0;
    toastLayer.textContent = toastText;
    bannerLayer.hidden = !playing || bannerRemaining <= 0;
  }
  function titleCamera(dt) {
    titleTime += dt;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const drift = reduced ? 0 : Math.sin(titleTime * 0.19);
    camera.position.set(-16.5 + drift * 0.35, 3.4 + (reduced ? 0 : Math.sin(titleTime * 0.27) * 0.04), 27 + drift * 0.18);
    projected.set(0, 3.0, 7);
    camera.lookAt(projected);
    if (camera.fov !== 58) setFov(58);
  }
  function update(dt) {
    if (disposed) return false;
    dt = Number.isFinite(dt) ? bounded(dt, 0, 0.1) : 0;
    pauseGuard = Math.max(0, pauseGuard - dt);
    // 原版 HUD 每帧仍会 update；show(false) 保证不会重现港区生命弹药层。
    call(G.hud, 'show', false);
    if (game.state === 'title') {
      titleCamera(dt);
      animateMarkers(0);
      renderUI(0);
      return false;
    }
    const pausePressed = pendingPause || input.pressed('pause');
    pendingPause = false;
    if (pausePressed && pauseGuard <= 0) {
      if (panel) closePanel();
      else if (game.state === 'playing') pause('input');
      else resume('input');
      pauseGuard = 0.3;
      return false;
    }
    if (game.state === 'paused' || game.state === 'dead') {
      renderUI(0);
      return false;
    }
    if (document.hidden) { pause('visibility'); return false; }
    run.time += dt;
    player.enabled = true;
    player.invulnerable = false;
    if (readPlayerHealth().value <= 0) { diePlayer(); renderUI(0); return false; }
    if (pendingFlashlight) toggleFlashlight(pendingFlashlight);
    if (pendingScan) scan(pendingScan);
    if (pendingWeapon) setWeaponVisible(!run.weaponVisible, pendingWeapon);
    pendingFlashlight = pendingScan = pendingWeapon = '';
    run.scan.remaining = Math.max(0, run.scan.remaining - dt);
    run.scan.cooldown = Math.max(0, run.scan.cooldown - dt);
    updateInteractions(dt);
    if (cyber.swarm && cyber.swarm.status && cyber.swarm.status.phase === 'overrun') {
      diePlayer();
      renderUI(0);
      return false;
    }
    animateMarkers(dt);
    updateMessages(dt);
    const intensity = run.completed ? 0.12 : Math.min(0.35, 0.12 + run.progress * 0.045 + (focus && input.down('interact') && !lockReason(focus) ? 0.05 : 0));
    if (intensity !== run.audio.intensity) {
      run.audio.intensity = intensity;
      call(G.audio, 'setIntensity', intensity);
    }
    renderUI(dt);
    return true;
  }
  const menus = {
    root, settings: {get volume() { return run.audio.volume; }, get quality() { return qualityValue; }},
    get screen() { return game.state === 'playing' ? 'none' : game.state; },
    get panelOpen() { return !!panel; },
    closePanel,
    fmtTime(value) { const seconds = Math.max(0, Math.floor(value || 0)); return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0'); },
    show(screen) { if (screen === 'paused') pause('menu'); else if (screen === 'none' && game.state === 'paused') resume('menu'); },
    setLookMode(text) { modeMessage = String(text || ''); },
    locationCard() {},
    applySettings() { setVolume(run.audio.volume); }
  };
  game.menus = menus;
  const debugAPI = {
    get stage() { return run.stage; },
    get quest() { return {stage: run.stage, progress: run.progress, completed: run.completed, target: mainIds[run.stage] || null}; },
    get state() { return game.state; },
    get focus() { return focus && {id: focus.id, locked: lockReason(focus), hold: metadata.get(focus).hold}; },
    interactions: entries,
    run,
    start(options) { return start(options || {}, 'debug'); },
    scan() { return scan('debug'); },
    toggleFlashlight() { return toggleFlashlight('debug'); },
    pause() { record('debug-pause', 'debug'); return pause('debug'); },
    resume() { return resume('debug'); },
    get markers() { return markerGroup; },
    flashlight,
    note: '调试 API 不提供完成任务或远程交互；debug 与合成按键不算真实玩家操作证据。'
  };
  window.__cyber = debugAPI;
  function dispose() {
    if (disposed) return;
    disposed = true;
    clearInput();
    listeners.forEach(remove => remove());
    unsubscribers.forEach(remove => remove());
    if (G.weapon && G.weapon.update === weaponWrapper) G.weapon.update = originalWeaponUpdate;
    camera.remove(flashlight, flashlightTarget);
    flashlight.dispose();
    if (markerGroup.parent) markerGroup.parent.remove(markerGroup);
    markerGeometry.dispose();
    markerMaterials.forEach(material => material.dispose());
    root.remove();
    if (window.__cyber === debugAPI) delete window.__cyber;
  }
  clearInput();
  player.enabled = false;
  player.invulnerable = false;
  setWeaponVisible(false);
  setVolume(run.audio.volume);
  call(G.hud, 'show', false);
  call(G.audio, 'setIntensity', 0.12);
  call(G.audio, 'setPaused', false);
  if (G.render && G.render.post) G.render.post.fade = 0;
  refreshStates();
  titleCamera(0);
  renderUI(0);
  return game;
};
