(() => {
  'use strict';

  const home = document.currentScript?.dataset.home;
  const root = document.documentElement;
  const stateAttribute = 'data-concept-portal-state';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let preference = 'system';
  let enabled = !motion.matches;

  function updateMotion(value) {
    const nextEnabled = value === 'play' || (value === 'system' && !motion.matches);
    if (value === preference && nextEnabled === enabled) return;
    preference = value;
    enabled = nextEnabled;
    root.setAttribute('data-concept-motion', enabled ? 'on' : 'off');
    document.dispatchEvent(new CustomEvent('conceptmotion:change', {
      detail: { enabled, preference, reduced: motion.matches }
    }));
  }

  window.ConceptMotion = {
    get enabled() { return enabled; },
    get reduced() { return motion.matches; },
    get preference() { return preference; },
    set(value) {
      if (!['system', 'play', 'pause'].includes(value)) {
        throw new TypeError('动效偏好仅支持 system、play 或 pause');
      }
      updateMotion(value);
    }
  };
  root.setAttribute('data-concept-motion', enabled ? 'on' : 'off');
  function onSystemMotionChange() {
    if (preference === 'system') updateMotion('system');
  }
  if (motion.addEventListener) motion.addEventListener('change', onSystemMotionChange);
  else motion.addListener(onSystemMotionChange);

  let transitioning = false;
  let navigationTimer;
  let cleanupTimer;
  let entranceTimer;
  let destination;

  const style = document.createElement('style');
  style.textContent = `
    html[${stateAttribute}] { background-color: #05060d; }
    html[${stateAttribute}]::after {
      content: ''; position: fixed; inset: 0; z-index: 2147483646;
      background: #05060d; pointer-events: none;
    }
    html[${stateAttribute}="enter"]::after {
      animation: concept-portal-enter 360ms ease-out both;
    }
    html[${stateAttribute}="depart"]::after {
      pointer-events: auto;
      animation: concept-portal-depart var(--concept-portal-duration, 1350ms) ease-in-out both;
    }
    @keyframes concept-portal-enter {
      from { opacity: 1; }
      to { opacity: 0; visibility: hidden; }
    }
    @keyframes concept-portal-depart {
      0%, 62% { opacity: 0; }
      100% { opacity: 1; }
    }
    a.concept-portal-back {
      position: fixed; z-index: 2147483645;
      left: max(12px, env(safe-area-inset-left, 0px));
      bottom: max(12px, env(safe-area-inset-bottom, 0px));
      display: inline-flex; align-items: center; justify-content: center;
      box-sizing: border-box; min-width: 44px; min-height: 44px;
      padding: 0 14px; border: 1px solid rgba(210, 214, 230, .14);
      border-radius: 24px; background: rgba(5, 6, 13, .88);
      color: #c8cad4; font: 12px/1.4 system-ui, sans-serif;
      letter-spacing: .06em; text-decoration: none;
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    }
    a.concept-portal-back:hover { color: #fff; border-color: #9094ac; }
    a.concept-portal-back:focus-visible {
      outline: 2px solid #e2ddff; outline-offset: 4px;
    }
    html[data-concept-motion="off"][${stateAttribute}]::after {
      display: none; animation: none;
    }
    @media (prefers-reduced-motion: reduce) {
      html:not([data-concept-motion="on"])[${stateAttribute}]::after {
        display: none; animation: none;
      }
    }
    @media print {
      a.concept-portal-back, html[${stateAttribute}]::after { display: none; }
    }
  `;
  document.head.appendChild(style);

  function clearState() {
    window.clearTimeout(navigationTimer);
    window.clearTimeout(cleanupTimer);
    window.clearTimeout(entranceTimer);
    transitioning = false;
    destination = undefined;
    root.removeAttribute(stateAttribute);
    root.style.removeProperty('--concept-portal-duration');
    root.style.removeProperty('--concept-portal-x');
    root.style.removeProperty('--concept-portal-y');
  }

  function cancel() {
    clearState();
    document.dispatchEvent(new CustomEvent('conceptportal:reset'));
  }

  function assignDestination() {
    if (!transitioning || !destination) return;
    window.clearTimeout(navigationTimer);
    try {
      window.location.assign(destination);
    } catch (_) {
      cancel();
    }
  }

  function navigate(url, { duration = 1350, x, y } = {}) {
    if (transitioning) return false;
    const target = new URL(url, document.baseURI);
    if (!['http:', 'https:', 'file:'].includes(target.protocol)) {
      throw new TypeError('不支持此导航协议');
    }
    const milliseconds = Number.isFinite(duration)
      ? Math.max(0, Math.min(duration, 5000)) : 1350;
    clearState();
    transitioning = true;
    destination = target.href;
    // 即使导航被浏览器阻止，也不能把当前页面永久留在暗幕下。
    cleanupTimer = window.setTimeout(cancel, (window.ConceptMotion.enabled ? milliseconds : 0) + 1500);
    if (!window.ConceptMotion.enabled) {
      assignDestination();
      return true;
    }
    root.style.setProperty('--concept-portal-duration', `${milliseconds}ms`);
    root.style.setProperty('--concept-portal-x', `${Number.isFinite(x)
      ? Math.max(0, Math.min(100, x / Math.max(1, window.innerWidth) * 100)) : 50}%`);
    root.style.setProperty('--concept-portal-y', `${Number.isFinite(y)
      ? Math.max(0, Math.min(100, y / Math.max(1, window.innerHeight) * 100)) : 50}%`);
    root.setAttribute(stateAttribute, 'depart');
    navigationTimer = window.setTimeout(assignDestination, milliseconds);
    document.dispatchEvent(new CustomEvent('conceptportal:depart', {
      detail: { duration: milliseconds, x, y, url: target.href }
    }));
    return true;
  }

  window.ConceptPortal = {
    navigate,
    cancel,
    get transitioning() { return transitioning; }
  };

  let navigationType;
  try {
    navigationType = performance.getEntriesByType('navigation')[0]?.type;
    if (!navigationType && performance.navigation) {
      navigationType = ['navigate', 'reload', 'back_forward'][performance.navigation.type];
    }
  } catch (_) {
    // 无性能信息时仍使用有限时长入场，不依赖外部资源。
  }
  if (window.ConceptMotion.enabled && navigationType !== 'reload' && navigationType !== 'back_forward') {
    root.setAttribute(stateAttribute, 'enter');
    entranceTimer = window.setTimeout(() => {
      if (!transitioning) root.removeAttribute(stateAttribute);
    }, 450);
  }

  function activate(event, anchor, duration) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey ||
        anchor.hasAttribute('target') || anchor.hasAttribute('download') ||
        document.querySelector('base[target]')) return;
    try {
      const href = anchor.getAttribute('href');
      if (!href || href.trim().startsWith('#')) return;
      const target = new URL(href, document.baseURI);
      const current = new URL(window.location.href);
      if (!['http:', 'https:', 'file:'].includes(target.protocol) ||
          target.origin !== current.origin || target.protocol !== current.protocol ||
          (target.protocol === 'file:' && target.host !== current.host)) return;
      // 页内锚点和当前文档链接继续交由浏览器处理。
      if (target.pathname === current.pathname && target.search === current.search) return;
      if (transitioning) {
        event.preventDefault();
        return;
      }
      const rect = anchor.getBoundingClientRect();
      if (navigate(target.href, {
        duration,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })) event.preventDefault();
    } catch (_) {
      // 校验或测量失败时不阻止原生链接导航。
    }
  }

  document.addEventListener('click', (event) => {
    const anchor = event.target instanceof Element
      ? event.target.closest('a[data-concept-star]') : null;
    if (anchor) activate(event, anchor, 1350);
  });

  function addBackLink() {
    if (!home) return;
    const back = document.createElement('a');
    back.className = 'concept-portal-back';
    back.href = home;
    back.textContent = '返回星海';
    back.setAttribute('aria-label', '返回概念星海首页');
    back.addEventListener('click', (event) => activate(event, back, 350));
    document.body.appendChild(back);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBackLink, { once: true });
  } else {
    addBackLink();
  }

  window.addEventListener('pageshow', event => {
    if (event.persisted) cancel();
  });
  document.addEventListener('conceptmotion:change', () => {
    if (window.ConceptMotion.enabled) return;
    if (transitioning) assignDestination();
    else cancel();
  });
})();
