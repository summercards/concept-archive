(() => {
  'use strict';
  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#motion-toggle');
  const menuButton = document.querySelector('#menu-toggle');
  const menu = document.querySelector('#site-menu');
  const dialog = document.querySelector('#film-dialog');
  const film = document.querySelector('#reference-film');
  const progress = document.querySelector('.page-progress span');
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  const heroCopy = document.querySelector('.hero-content');
  const descent = document.querySelector('.descent');
  const descentImage = document.querySelector('.descent-visual > img');
  const closing = document.querySelector('.awakening');
  const closingImage = document.querySelector('.awakening-visual > img');
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const sections = [...document.querySelectorAll('#top, [data-chapter]')];
  const locationLinks = [...document.querySelectorAll('.site-nav a[href^="#"], .chapter-rail a')];
  let still = reduceMotion.matches;
  let requestedFrame = 0;
  let revealObserver;
  let priorFocus;
  let activeChapter = '';

  body.classList.add('enhanced');

  const clamp = (number, min = 0, max = 1) => Math.min(max, Math.max(min, number));

  function initializeReveals() {
    if (revealObserver) revealObserver.disconnect();
    if (still || !('IntersectionObserver' in window)) {
      body.classList.remove('motion-ready');
      reveals.forEach(element => element.classList.add('in-view'));
      return;
    }
    body.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    reveals.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.top < innerHeight - 15 && rect.bottom > 0) element.classList.add('in-view');
      else revealObserver.observe(element);
    });
  }

  function updateMotion() {
    body.classList.toggle('still', still);
    root.style.scrollBehavior = still ? 'auto' : '';
    motionButton.setAttribute('aria-pressed', String(still));
    motionButton.setAttribute('aria-label', still ? '运镜，开启动态效果' : '停镜，减少动态效果');
    motionButton.querySelector('.motion-label').textContent = still ? '运镜' : '停镜';
    if (still) {
      [heroImage, heroCopy, descentImage, closingImage].forEach(element => {
        element.style.removeProperty('transform');
        element.style.removeProperty('opacity');
      });
    }
    initializeReveals();
    requestUpdate();
  }
  motionButton.addEventListener('click', () => {
    still = !still;
    updateMotion();
  });
  reduceMotion.addEventListener('change', event => {
    still = event.matches;
    updateMotion();
  });

  function renderScroll() {
    requestedFrame = 0;
    const y = window.scrollY;
    const viewport = window.innerHeight;
    const documentHeight = root.scrollHeight - viewport;
    progress.style.transform = `scaleX(${documentHeight > 0 ? clamp(y / documentHeight) : 0})`;
    body.classList.toggle('past-hero', y > hero.offsetHeight * 0.64);
    body.classList.toggle('header-scrolled', y > 65);
    let chapter = sections[0].id;
    const readingLine = viewport * 0.42;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) chapter = section.id;
    }
    if (chapter !== activeChapter) {
      activeChapter = chapter;
      locationLinks.forEach(link => {
        if (link.hash === '#' + chapter) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    if (still || document.hidden) return;
    if (y < hero.offsetHeight + 50) {
      const shot = clamp(y / hero.offsetHeight);
      heroImage.style.transform = `translate3d(0,${(y * 0.19).toFixed(2)}px,0) scale(${(1.045 + shot * 0.055).toFixed(4)})`;
      heroCopy.style.transform = `translate3d(0,${(y * 0.12).toFixed(2)}px,0)`;
      heroCopy.style.opacity = String(clamp(1 - shot * 1.35));
    }
    const descentRect = descent.getBoundingClientRect();
    if (descentRect.top < viewport && descentRect.bottom > 0) {
      const shot = clamp((viewport - descentRect.top) / (descentRect.height + viewport));
      descentImage.style.transform = `scale(${(1.015 + shot * 0.13).toFixed(4)}) translate3d(0,${((shot - 0.5) * -25).toFixed(2)}px,0)`;
    }
    const closingRect = closing.getBoundingClientRect();
    if (closingRect.top < viewport && closingRect.bottom > 0) {
      const shot = clamp((viewport - closingRect.top) / (closingRect.height + viewport));
      closingImage.style.transform = `scale(${(1.02 + shot * 0.055).toFixed(4)}) translate3d(0,${((shot - 0.5) * 20).toFixed(2)}px,0)`;
    }
  }
  function requestUpdate() {
    if (!requestedFrame) requestedFrame = requestAnimationFrame(renderScroll);
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('pageshow', requestUpdate);
  document.addEventListener('visibilitychange', requestUpdate);
  window.addEventListener('load', requestUpdate, { once: true });

  function menuIsOpen() { return menuButton.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open, restoreFocus = true) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '关闭章节导航' : '打开章节导航');
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    body.classList.toggle('modal-open', open || dialog.open);
    if (open) {
      document.querySelector('main').inert = true;
      document.querySelector('.site-footer').inert = true;
      menu.querySelector('a').focus({ preventScroll: true });
    } else {
      document.querySelector('main').inert = false;
      document.querySelector('.site-footer').inert = false;
      if (restoreFocus) menuButton.focus({ preventScroll: true });
    }
  }
  menuButton.addEventListener('click', () => setMenu(!menuIsOpen()));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (menuIsOpen()) setMenu(false, false);
  }));
  window.matchMedia('(min-width: 681px)').addEventListener('change', event => {
    if (event.matches && menuIsOpen()) setMenu(false, false);
  });
  document.addEventListener('keydown', event => {
    if (!menuIsOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...menu.querySelectorAll('a'), motionButton];
      const index = focusable.indexOf(document.activeElement);
      const direction = event.shiftKey ? -1 : 1;
      const next = (index + direction + focusable.length) % focusable.length;
      event.preventDefault();
      focusable[next].focus();
    }
  });

  const dreams = {
    forest: {
      number: '01', roman: 'I', image: '01-grove.jpg', title: '雾白林庭',
      kicker: '灰紫白 / 冷青 / 苔色',
      quote: '“他们叫出了一个你没听过的称呼，\n然后，等你纠正。”',
      description: '巨根截断近路，林庭与水声重复。一间从外侧数步可绕完的林屋，内部却容纳漫长庭院。',
      objective: '核对尺度与时序。记住蝶停下的接缝，判断这段林庭是否已经重复过。',
      alt: '原创概念图：潮湿林道两侧的巨大根系长成重复门拱，远处一名无名探索者；AI 生成，非实机'
    },
    valley: {
      number: '02', roman: 'II', image: '02-valley.jpg', title: '赭粉眠谷',
      kicker: '褪粉 / 烟紫 / 锈褐',
      quote: '“有人替你保存了一整段生活。\n只是，尺寸对不上你。”',
      description: '层叠巨壳随节律开合。向内攀升的楼梯，没有穿过壳壁，却抵达壳体外侧。熟悉的杯子和椅背，都大了一点。',
      objective: '比对证词与修补痕。查清巨构运动如何重接空间，又如何补写你的过去。',
      alt: '原创概念图：赭粉谷地里层叠的巨大空壳与一段向内攀升却抵达外侧的楼梯；AI 生成，非实机'
    },
    water: {
      number: '03', roman: 'III', image: '03-water.jpg', title: '深水灯庭',
      kicker: '冷青 / 深蓝紫 / 局部橙灯',
      quote: '“灯列按你的记忆排布。\n水位，按你的说法涨落。”',
      description: '门后接回门前，两个互斥庭院共用同一门槛。橙灯点亮近处湿面，却从不承诺安全。',
      objective: '以水位、灯列与跨梦证据辨认伪出口，打开不再回接的路，检验真正醒来。',
      alt: '原创概念图：积水柱廊里的一列橙色小灯与水中倒影，水面中央立着一扇孤门；AI 生成，非实机'
    }
  };
  const dreamButtons = [...document.querySelectorAll('[data-dream]')];
  const panel = document.querySelector('#dream-panel');
  const dreamImage = document.querySelector('#dream-image');
  let dreamRevision = 0;
  let dreamTimer;

  function commitDream(key) {
    const dream = dreams[key];
    panel.dataset.realm = key;
    dreamImage.src = './assets/generated/' + dream.image;
    dreamImage.alt = dream.alt;
    document.querySelector('#realm-numeral').textContent = dream.number;
    document.querySelector('#realm-glyph').textContent = dream.roman;
    document.querySelector('#realm-kicker').textContent = dream.kicker;
    document.querySelector('#realm-title').textContent = dream.title;
    document.querySelector('#realm-quote').textContent = dream.quote;
    document.querySelector('#realm-description').textContent = dream.description;
    document.querySelector('#realm-objective').textContent = dream.objective;
    panel.classList.remove('changing');
    requestUpdate();
  }
  function selectDream(key, focus = false) {
    if (!dreams[key]) return;
    dreamButtons.forEach(button => {
      const selected = button.dataset.dream === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    panel.setAttribute('aria-labelledby', 'tab-' + key);
    clearTimeout(dreamTimer);
    const revision = ++dreamRevision;
    if (still || panel.dataset.realm === key) {
      commitDream(key);
      return;
    }
    panel.classList.add('changing');
    const image = new Image();
    image.src = './assets/generated/' + dreams[key].image;
    const loaded = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
    Promise.all([loaded, new Promise(resolve => { dreamTimer = setTimeout(resolve, 160); })]).then(() => {
      if (revision === dreamRevision) commitDream(key);
    });
  }
  dreamButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectDream(button.dataset.dream));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % dreamButtons.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + dreamButtons.length) % dreamButtons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = dreamButtons.length - 1;
      else return;
      event.preventDefault();
      selectDream(dreamButtons[next].dataset.dream, true);
    });
  });

  const play = [
    { image: '06-scale.jpg', visualIndex: '01 / TRAVERSE', visualTitle: '让身体，成为第一份证据。', kicker: '身体进入世界', description: '攀越巨根，游渡水隙，借势滑行。在持续运动的巨构间寻找落点，从内外两侧核对同一空间。远处的一条纹理，可能只有走近才读得成证据。', detail: '行走 / 攀越 / 游渡 / 失重穿行', alt: '原创概念图：无名探索者沿狭窄阶梯攀向巨大有机开口；AI 生成，非实机' },
    { image: '09-doors.jpg', visualIndex: '02 / VERIFY', visualTitle: '别急着相信，先核对。', kicker: '让重复成为规律', description: '将纸页、证词、环境残痕与亲身行动交叉核查。居民说法彼此吻合，水位和磨损却可能留下另一种顺序。将已核实的事实与仍有疑问的部分分开记录。', detail: '纸页 / 证词 / 环境残痕 / 亲身行动', alt: '原创概念图：一列重复的相同门扉，只有一扇虚掩透出暖光；AI 生成，非实机' },
    { image: '05-descent.jpg', visualIndex: '03 / REROUTE', visualTitle: '你改了路，梦也在学你。', kicker: '借梦，不是支配梦', description: '基于证据已经暗示的联系，暂时改变巨构运动与空间相接。错开一次复位，穿过新的落点，再从另一侧验证出口。借梦不能凭空创造答案，也不能随意造出一扇门。', detail: '查证规律 / 错开巨构 / 改变连接 / 复查去向', alt: '原创概念图：人物穿过层层错位的门框向下坠落，雾在门缝间流动；AI 生成，非实机' }
  ];
  const playButtons = [...document.querySelectorAll('[data-play]')];
  playButtons.forEach(button => button.addEventListener('click', () => {
    const data = play[Number(button.dataset.play)];
    playButtons.forEach(option => {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.querySelector('.play-option-icon').textContent = selected ? '−' : '+';
    });
    const image = document.querySelector('#play-image');
    image.src = './assets/generated/' + data.image;
    image.alt = data.alt;
    document.querySelector('#play-visual-index').textContent = data.visualIndex;
    document.querySelector('#play-visual-title').textContent = data.visualTitle;
    document.querySelector('#play-kicker').textContent = data.kicker;
    document.querySelector('#play-description').textContent = data.description;
    document.querySelector('#play-detail').textContent = data.detail;
    if (!still && document.querySelector('#play-copy').animate) {
      document.querySelector('#play-copy').animate([{ opacity: 0.2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
    }
    requestUpdate();
  }));

  document.querySelectorAll('[data-film]').forEach(button => button.addEventListener('click', () => {
    priorFocus = document.activeElement;
    if (!film.getAttribute('src')) film.src = './assets/film-tone.mp4';
    dialog.showModal();
    body.classList.add('modal-open');
    dialog.querySelector('[data-close-film]').focus({ preventScroll: true });
    // The viewer explicitly starts playback with the native controls.
  }));
  document.querySelector('[data-close-film]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    film.pause();
    body.classList.toggle('modal-open', menuIsOpen());
    if (priorFocus && priorFocus.isConnected) priorFocus.focus({ preventScroll: true });
  });
  updateMotion();
})();
