(() => {
  'use strict';
  const body = document.body;
  const root = document.documentElement;
  const $ = selector => document.querySelector(selector);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = $('#motion-toggle');
  const menuButton = $('#menu-toggle');
  const menu = $('#site-menu');
  const dialog = $('#film-dialog');
  const film = $('#reference-film');
  const journal = $('#journal-dialog');
  const progress = $('.page-progress span');
  const hero = $('.hero');
  const heroImage = $('.hero-image');
  const heroCopy = $('.hero-content');
  const descent = $('.descent');
  const descentImage = $('.descent-visual > img');
  const closing = $('.awakening');
  const closingImage = $('.awakening-visual > img');
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const sections = [...document.querySelectorAll('#top, [data-chapter], #awakening')];
  const locationLinks = [...document.querySelectorAll('.site-nav a[href^="#"], .chapter-rail a')];
  const clamp = (number, min = 0, max = 1) => Math.min(max, Math.max(min, number));
  const notes = new Map(); // Deliberately ephemeral: no storage, analytics or network writes.
  const animations = new Set();
  let still = reduceMotion.matches;
  let requestedFrame = 0;
  let revealObserver;
  let activeChapter = '';
  let feedbackTimer;
  let filmFocus;
  let journalFocus;
  let dreamRevision = 0;
  let echoAnimation;
  let playAnimation;
  let playRevision = 0;
  let lastDream = '';
  const dreamVisits = new Set(['forest']);
  body.classList.add('enhanced');

  function animate(element, frames, options) {
    if (still || !element.animate) return null;
    const animation = element.animate(frames, options);
    animations.add(animation);
    const remove = () => animations.delete(animation);
    animation.finished.then(remove, remove);
    return animation;
  }
  function announce(message) {
    clearTimeout(feedbackTimer);
    const feedback = $('#dream-feedback');
    feedback.textContent = message;
    feedback.classList.add('is-visible');
    feedbackTimer = setTimeout(() => feedback.classList.remove('is-visible'), 3600);
  }
  function menuIsOpen() { return menuButton.getAttribute('aria-expanded') === 'true'; }
  function syncScrollLock() {
    body.classList.toggle('modal-open', menuIsOpen() || dialog.open || journal.open);
  }

  // A notebook retains only explicit observations. Navigation never masquerades as evidence.
  const records = {
    signature: { title: '没有署名的委托', source: '委托函 · 纸背', observation: '翻过纸张之后，落款仍然是空的。', question: '是谁留下这份委托？熟悉的笔迹，不足以证明来源。' },
    forest: { title: '林庭的重复', source: '雾白林庭 · 接缝', observation: '门拱的形状一再出现；它们相似，却还不能证明是同一处。', question: '还要核对水位、尺度与行走的时间。' },
    valley: { title: '通向外侧的楼梯', source: '赭粉眠谷 · 接缝', observation: '梦域叙述中，向内攀升的楼梯却抵达了壳体外侧。', question: '还要从两侧核对位置，不能只相信居民的说法。' },
    water: { title: '共用门槛的庭院', source: '深水灯庭 · 接缝', observation: '梦域叙述中，两处互斥庭院共用同一道门槛。', question: '灯亮不等于安全。仍需水位与跨梦证据验证去向。' },
    butterfly: { title: '叶脉之外的边界', source: '观蝶 · 焦点之间', observation: '移焦后，蝶的轮廓与网页演绎的线迹不再完全重合。', question: '这是观察方式的提示，不是实机谜底，也不能证明蝶值得追随。' }
  };
  function updateRecordButton(button, key) {
    const saved = notes.has(key);
    button.classList.toggle('is-recorded', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.querySelector('span:first-child').textContent = saved ? '已留在纸上' : (key === 'signature' ? '记下空白落款' : key === 'butterfly' ? '记下这道边界' : '将此处留在纸上');
    button.querySelector('span:last-child').textContent = saved ? '✓' : '＋';
  }
  function renderNotes() {
    $('#journal-count').textContent = String(notes.size);
    $('[data-journal]').setAttribute('aria-label', `翻开梦中手记，${notes.size} 条亲手留下的记录`);
    $('#journal-empty').hidden = notes.size > 0;
    const fragment = document.createDocumentFragment();
    for (const [key, note] of notes) {
      const entry = document.createElement('li');
      entry.dataset.note = key;
      const source = document.createElement('span');
      source.className = 'note-source';
      source.textContent = note.source;
      const title = document.createElement('h3');
      title.textContent = note.title;
      const observation = document.createElement('p');
      observation.textContent = note.observation;
      const question = document.createElement('p');
      question.className = 'note-question';
      question.textContent = '仍然存疑 / ' + note.question;
      entry.append(source, title, observation, question);
      fragment.append(entry);
    }
    $('#journal-entries').replaceChildren(fragment);
    document.querySelectorAll('[data-record]').forEach(button => updateRecordButton(button, button.dataset.record));
    updateRecordButton($('#record-realm'), $('#dream-panel').dataset.realm);
    if (body.classList.contains('awake')) updateReceipt();
  }
  function remember(key) {
    if (!records[key]) return;
    if (notes.has(key)) { announce('这道痕迹已经在纸上。不必写第二次。'); return; }
    notes.set(key, records[key]);
    renderNotes();
    animate($('.journal-toggle'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
    announce('已记下「' + records[key].title + '」。观察留下，疑问也留下。');
  }
  document.querySelectorAll('[data-record]').forEach(button => button.addEventListener('click', () => remember(button.dataset.record)));
  function setJournalMode(mode) {
    journal.dataset.mode = mode;
    const awake = mode === 'awake';
    $('#journal-kicker').textContent = awake ? '醒后比对 / 此次浏览' : '梦中手记 / 此次浏览';
    $('#journal-title').replaceChildren();
    $('#journal-title').append(awake ? '梦已经退去。' : '只记下，', document.createElement('br'), awake ? '纸上留下了什么？' : '不急着相信。');
    $('#journal-intro').textContent = awake ? '核对你亲手带回的观察。记下的事实，不会因醒来被撤销。' : '梦会给出解释。纸只保留你亲手记下的观察。';
    $('#journal-verdict').hidden = !awake;
    journal.querySelector('[data-close-journal]').setAttribute('aria-label', awake ? '暂不确认，返回梦中' : '合上梦中手记');
    journal.querySelector('[data-close-journal] span').textContent = awake ? '暂不确认' : '合上';
  }
  function openJournal(mode, trigger) {
    if (journal.open || dialog.open) return;
    if (menuIsOpen()) setMenu(false, false);
    journalFocus = trigger || document.activeElement;
    setJournalMode(mode);
    renderNotes();
    journal.showModal();
    journal.scrollTop = 0;
    syncScrollLock();
    journal.querySelector('[data-close-journal]').focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-journal]').forEach(button => button.addEventListener('click', () => openJournal('dream', button)));
  $('#wake-compare').addEventListener('click', event => openJournal('awake', event.currentTarget));
  journal.querySelector('[data-close-journal]').addEventListener('click', () => journal.close());
  journal.addEventListener('close', () => {
    syncScrollLock();
    if (journalFocus?.isConnected) journalFocus.focus({ preventScroll: true });
  });
  function updateReceipt() {
    const receipt = $('#wake-receipt');
    receipt.hidden = false;
    receipt.textContent = notes.size ? `醒后核对：${notes.size} 道痕迹仍在。时间继续，已留下的事实没有被撤销。` : '醒后核对：纸上没有记录。无需编造回忆，你仍可以醒来。';
  }
  $('#wake-confirm').addEventListener('click', () => {
    body.classList.add('awake');
    updateReceipt();
    $('#wake-compare span:first-child').textContent = '再次核对留下的痕迹';
    $('#hero-title').dataset.returned = '你已经来过这里。纸上的记录仍在。';
    journal.close();
    announce('时间继续。记录没有被梦抹去。');
  });

  // Turning paper has a real reverse, not hidden canonical story content.
  const letterScene = $('.commission-scene');
  $('#letter-flip').addEventListener('click', () => {
    const flipped = $('#letter-flip').getAttribute('aria-pressed') !== 'true';
    $('#letter-flip').setAttribute('aria-pressed', String(flipped));
    $('#letter-flip span:first-child').textContent = flipped ? '回到正面' : '翻到背面';
    $('#letter-front').setAttribute('aria-hidden', String(flipped));
    $('#letter-front').inert = flipped;
    $('#letter-reverse').setAttribute('aria-hidden', String(!flipped));
    $('#letter-reverse').inert = !flipped;
    $('.letter-position').textContent = flipped ? '背面 / 02' : '正面 / 01';
    letterScene.classList.toggle('is-flipped', flipped);
  });

  // Rack focus belongs to the image only. Text and input targets never blur or move.
  function setFocus() {
    const depth = Number($('#focus-depth').value);
    const fraction = depth / 100;
    $('#focus-scene').style.setProperty('--focus-depth', String(fraction));
    $('#focus-scene').dataset.depth = depth >= 70 ? 'seam' : depth >= 35 ? 'between' : 'specimen';
    const reading = depth >= 70 ? '焦点越过蝶。叶脉停止了，边界还在继续。记下它，别急着跟随。' : depth >= 35 ? '两种轮廓正在错开。看见接缝，不等于已经知道去向。' : '焦点在蝶。它像一片叶子，但这不是全部。';
    $('#focus-reading').textContent = reading;
    $('#focus-depth').setAttribute('aria-valuetext', reading);
    $('[data-record="butterfly"]').disabled = depth < 70;
  }
  $('#focus-depth').addEventListener('input', setFocus);
  setFocus();

  function initializeReveals() {
    revealObserver?.disconnect();
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
    motionButton.setAttribute('aria-label', still ? '入梦，开启动态效果' : '定心，减少动态效果');
    motionButton.querySelector('.motion-label').textContent = still ? '入梦' : '定心';
    motionButton.title = still ? '开启梦境动态；功能与记录不变' : '减少动态，保留全部观察与记录';
    if (still) {
      animations.forEach(animation => animation.cancel());
      animations.clear();
      $('#dream-echo').hidden = true;
      [heroImage, heroCopy, descentImage, closingImage].forEach(element => {
        element.style.removeProperty('transform');
        element.style.removeProperty('opacity');
      });
      document.querySelectorAll('.looking').forEach(element => element.classList.remove('looking'));
    }
    initializeReveals();
    requestUpdate();
  }
  motionButton.addEventListener('click', () => { still = !still; updateMotion(); });
  reduceMotion.addEventListener('change', event => { still = event.matches; updateMotion(); });

  function renderScroll() {
    requestedFrame = 0;
    const y = scrollY;
    const viewport = innerHeight;
    const documentHeight = root.scrollHeight - viewport;
    progress.style.transform = `scaleX(${documentHeight > 0 ? clamp(y / documentHeight) : 0})`;
    body.classList.toggle('past-hero', y > hero.offsetHeight * 0.64);
    body.classList.toggle('header-scrolled', y > 65);
    let chapter = sections[0].id;
    for (const section of sections) if (section.getBoundingClientRect().top <= viewport * 0.42) chapter = section.id;
    if (chapter !== activeChapter) {
      activeChapter = chapter;
      body.dataset.chapter = chapter;
      locationLinks.forEach(link => {
        if (link.hash === '#' + chapter) { link.setAttribute('aria-current', 'location'); link.classList.add('has-visited'); }
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
      descent.style.setProperty('--descent-progress', String(shot));
    }
    const closingRect = closing.getBoundingClientRect();
    if (closingRect.top < viewport && closingRect.bottom > 0) {
      const shot = clamp((viewport - closingRect.top) / (closingRect.height + viewport));
      closingImage.style.transform = `scale(${(1.02 + shot * 0.055).toFixed(4)}) translate3d(0,${((shot - 0.5) * 20).toFixed(2)}px,0)`;
    }
  }
  function requestUpdate() { if (!requestedFrame) requestedFrame = requestAnimationFrame(renderScroll); }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  document.addEventListener('visibilitychange', requestUpdate);
  addEventListener('load', requestUpdate, { once: true });

  // A soft attention field follows a fine pointer; the native cursor remains accurate.
  [hero, $('.dream-image-wrap'), $('.play-visual')].forEach(surface => {
    let frame = 0;
    let point;
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      surface.classList.remove('looking');
      surface.style.setProperty('--look-x', '0px');
      surface.style.setProperty('--look-y', '0px');
    };
    surface.addEventListener('pointermove', event => {
      if (still || !finePointer.matches || event.pointerType === 'touch' || document.hidden) return;
      const rect = surface.getBoundingClientRect();
      point = { x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (still) return;
        surface.classList.add('looking');
        surface.style.setProperty('--gaze-x', (point.x * 100).toFixed(1) + '%');
        surface.style.setProperty('--gaze-y', (point.y * 100).toFixed(1) + '%');
        surface.style.setProperty('--look-x', ((point.x - 0.5) * 9).toFixed(2) + 'px');
        surface.style.setProperty('--look-y', ((point.y - 0.5) * 6).toFixed(2) + 'px');
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
    finePointer.addEventListener('change', reset);
  });

  function setMenu(open, restoreFocus = true) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '合上梦境目录' : '翻开梦境目录');
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    syncScrollLock();
    $('main').inert = open;
    $('.site-footer').inert = open;
    $('.journal-toggle').inert = open;
    $('.chapter-rail').inert = open;
    if (open) menu.querySelector('a').focus({ preventScroll: true });
    else if (restoreFocus) menuButton.focus({ preventScroll: true });
  }
  menuButton.addEventListener('click', () => setMenu(!menuIsOpen()));
  [...menu.querySelectorAll('a'), $('.brand')].forEach(link => link.addEventListener('click', () => { if (menuIsOpen()) setMenu(false, false); }));
  matchMedia('(min-width: 681px)').addEventListener('change', event => { if (event.matches && menuIsOpen()) setMenu(false, false); });
  document.addEventListener('keydown', event => {
    if (!menuIsOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...menu.querySelectorAll('a'), motionButton];
      const index = focusable.indexOf(document.activeElement);
      event.preventDefault();
      focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
    }
  });

  const dreams = {
    forest: {
      number: '01', roman: 'I', image: '01-grove.jpg', title: '雾白林庭', kicker: '灰紫白 / 冷青 / 苔色',
      quote: '“他们叫出了一个你没听过的称呼，\n然后，等你纠正。”',
      description: '巨根截断近路，林庭与水声重复。一间从外侧数步可绕完的林屋，内部却容纳漫长庭院。',
      objective: '核对尺度与时序。记住蝶停下的接缝，判断这段林庭是否已经重复过。',
      seam: '相似的门拱，不足以证明你回到了原处。把重复记下，再核对水位与行走的时间。',
      alt: '原创概念图：潮湿林道两侧的巨大根系长成重复门拱，远处一名无名探索者；AI 生成，非实机'
    },
    valley: {
      number: '02', roman: 'II', image: '02-valley.jpg', title: '赭粉眠谷', kicker: '褪粉 / 烟紫 / 锈褐',
      quote: '“有人替你保存了一整段生活。\n只是，尺寸对不上你。”',
      description: '层叠巨壳随节律开合。向内攀升的楼梯，没有穿过壳壁，却抵达壳体外侧。熟悉的杯子和椅背，都大了一点。',
      objective: '比对证词与修补痕。查清巨构运动如何重接空间，又如何补写你的过去。',
      seam: '向内的楼梯却抵达外侧。先把这条矛盾写下，别让一个完整的解释替代两侧的查证。',
      alt: '原创概念图：赭粉谷地里层叠的巨大空壳与一段向内攀升却抵达外侧的楼梯；AI 生成，非实机'
    },
    water: {
      number: '03', roman: 'III', image: '03-water.jpg', title: '深水灯庭', kicker: '冷青 / 深蓝紫 / 局部橙灯',
      quote: '“灯列按你的记忆排布。\n水位，按你的说法涨落。”',
      description: '门后接回门前，两个互斥庭院共用同一门槛。橙灯点亮近处湿面，却从不承诺安全。',
      objective: '以水位、灯列与跨梦证据辨认伪出口，打开不再回接的路，检验真正醒来。',
      seam: '灯亮了，门却可能接回原处。记下共用门槛的矛盾，真正的出口必须经得起醒后比对。',
      alt: '原创概念图：积水柱廊里的一列橙色小灯与水中倒影，水面中央立着一扇孤门；AI 生成，非实机'
    }
  };
  const dreamButtons = [...document.querySelectorAll('[data-dream]')];
  const panel = $('#dream-panel');
  const dreamImage = $('#dream-image');
  const echo = $('#dream-echo');
  function closeSeam() {
    $('#seam-trigger').setAttribute('aria-expanded', 'false');
    $('#seam-note').hidden = true;
    panel.classList.remove('examining');
  }
  $('#seam-trigger').addEventListener('click', () => {
    const open = $('#seam-trigger').getAttribute('aria-expanded') !== 'true';
    $('#seam-trigger').setAttribute('aria-expanded', String(open));
    $('#seam-note').hidden = !open;
    panel.classList.toggle('examining', open);
    if (open) animate($('#seam-note'), [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 480, easing: 'ease-out' });
    requestUpdate();
  });
  $('#record-realm').addEventListener('click', () => remember(panel.dataset.realm));

  function commitDream(key) {
    const dream = dreams[key];
    const previousKey = panel.dataset.realm;
    const previousSrc = dreamImage.getAttribute('src');
    echoAnimation?.cancel();
    echo.hidden = true;
    panel.dataset.realm = key;
    dreamImage.src = './assets/generated/' + dream.image;
    dreamImage.alt = dream.alt;
    $('#realm-numeral').textContent = dream.number;
    $('#realm-glyph').textContent = dream.roman;
    $('#realm-kicker').textContent = dream.kicker;
    $('#realm-title').textContent = dream.title;
    $('#realm-quote').textContent = dream.quote;
    $('#realm-description').textContent = dream.description;
    $('#realm-objective').textContent = dream.objective;
    $('#seam-description').textContent = dream.seam;
    updateRecordButton($('#record-realm'), key);
    const returning = dreamVisits.has(key) && lastDream !== key;
    $('#dream-memory-line').textContent = returning ? `又是${dream.title}。你回来过；尚未查证的地方，仍然存疑。` : (previousKey !== key ? `${dreams[previousKey].title}退到了记忆里。你现在看见的是${dream.title}。` : '你看见的，会留下痕迹。你未曾查证的，仍然存疑。');
    dreamVisits.add(key);
    lastDream = key;
    panel.setAttribute('aria-busy', 'false');
    panel.classList.remove('changing');
    if (!still && previousKey !== key) {
      echo.style.backgroundImage = `url("${previousSrc}")`;
      echo.hidden = false;
      const currentEcho = animate(echo, [{ opacity: 0.8, filter: 'blur(0px)', transform: 'scale(1.015)' }, { opacity: 0.32, filter: 'blur(1px)', transform: 'scale(1.035)', offset: 0.45 }, { opacity: 0, filter: 'blur(3px)', transform: 'scale(1.055)' }], { duration: 1050, easing: 'cubic-bezier(.2,.7,.2,1)' });
      echoAnimation = currentEcho;
      currentEcho?.finished.then(() => { if (echoAnimation === currentEcho) echo.hidden = true; }, () => {});
      animate($('.dream-info'), [{ opacity: 0.45 }, { opacity: 1 }], { duration: 550, easing: 'ease-out' });
    }
    requestUpdate();
  }
  async function selectDream(key, focus = false) {
    if (!dreams[key]) return;
    closeSeam();
    const revision = ++dreamRevision;
    echoAnimation?.cancel();
    echo.hidden = true;
    dreamButtons.forEach(button => {
      const selected = button.dataset.dream === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    if (panel.dataset.realm === key) { panel.setAttribute('aria-labelledby', 'tab-' + key); commitDream(key); return; }
    panel.setAttribute('aria-busy', 'true');
    panel.classList.add('changing');
    const image = new Image();
    image.src = './assets/generated/' + dreams[key].image;
    try { if (image.decode) await image.decode(); }
    catch (_) {
      if (revision !== dreamRevision) return;
      panel.setAttribute('aria-busy', 'false');
      panel.classList.remove('changing');
      dreamButtons.forEach(button => { const active = button.dataset.dream === panel.dataset.realm; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
      announce('这场梦还没有显影。已保留上一处，请再试一次。');
      return;
    }
    if (revision !== dreamRevision) return;
    panel.setAttribute('aria-labelledby', 'tab-' + key);
    commitDream(key);
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
      event.preventDefault(); selectDream(dreamButtons[next].dataset.dream, true);
    });
  });

  const play = [
    { image: '06-scale.jpg', visualIndex: '01 / TRAVERSE', visualTitle: '让身体，成为第一份证据。', kicker: '身体进入世界', description: '攀越巨根，游渡水隙，借势滑行。在持续运动的巨构间寻找落点，从内外两侧核对同一空间。远处的一条纹理，可能只有走近才读得成证据。', detail: '行走 / 攀越 / 游渡 / 失重穿行', alt: '原创概念图：无名探索者沿狭窄阶梯攀向巨大有机开口；AI 生成，非实机' },
    { image: '09-doors.jpg', visualIndex: '02 / VERIFY', visualTitle: '别急着相信，先核对。', kicker: '让重复成为规律', description: '将纸页、证词、环境残痕与亲身行动交叉核查。居民说法彼此吻合，水位和磨损却可能留下另一种顺序。将已核实的事实与仍有疑问的部分分开记录。', detail: '纸页 / 证词 / 环境残痕 / 亲身行动', alt: '原创概念图：一列重复的相同门扉，只有一扇虚掩透出暖光；AI 生成，非实机' },
    { image: '05-descent.jpg', visualIndex: '03 / REROUTE', visualTitle: '你改了路，梦也在学你。', kicker: '借梦，不是支配梦', description: '基于证据已经暗示的联系，暂时改变巨构运动与空间相接。错开一次复位，穿过新的落点，再从另一侧验证出口。借梦不能凭空创造答案，也不能随意造出一扇门。', detail: '查证规律 / 错开巨构 / 改变连接 / 复查去向', alt: '原创概念图：人物穿过层层错位的门框向下坠落，雾在门缝间流动；AI 生成，非实机' }
  ];
  const playButtons = [...document.querySelectorAll('[data-play]')];
  playButtons.forEach(button => button.addEventListener('click', async () => {
    const data = play[Number(button.dataset.play)];
    const revision = ++playRevision;
    playButtons.forEach(option => {
      const selected = option === button;
      option.setAttribute('aria-pressed', String(selected));
      option.querySelector('.play-option-icon').textContent = selected ? '−' : '+';
    });
    $('.play-visual').dataset.mode = button.dataset.play;
    $('#play-visual-index').textContent = data.visualIndex;
    $('#play-visual-title').textContent = data.visualTitle;
    $('#play-kicker').textContent = data.kicker;
    $('#play-description').textContent = data.description;
    $('#play-detail').textContent = data.detail;
    playAnimation?.cancel();
    playAnimation = animate($('#play-copy'), [{ opacity: 0.4, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
    const loaded = new Image();
    loaded.src = './assets/generated/' + data.image;
    try { if (loaded.decode) await loaded.decode(); } catch (_) { if (revision === playRevision) announce('画面暂未显影，玩法说明仍可阅读。'); return; }
    if (revision !== playRevision) return;
    $('#play-image').src = loaded.src;
    $('#play-image').alt = data.alt;
    animate($('#play-image'), [{ opacity: 0.35, filter: 'blur(1px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 650, easing: 'ease-out' });
    requestUpdate();
  }));

  document.querySelectorAll('[data-film]').forEach(button => button.addEventListener('click', () => {
    if (dialog.open || journal.open) return;
    filmFocus = document.activeElement;
    if (!film.getAttribute('src')) film.src = './assets/film-tone.mp4';
    dialog.showModal(); syncScrollLock();
    dialog.querySelector('[data-close-film]').focus({ preventScroll: true });
  }));
  $('[data-close-film]').addEventListener('click', () => dialog.close());
  for (const modal of [dialog, journal]) modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
  dialog.addEventListener('close', () => { film.pause(); syncScrollLock(); if (filmFocus?.isConnected) filmFocus.focus({ preventScroll: true }); });
  // Shared star-portal stays intact, but its returning link uses this experience's language.
  const stylePortal = () => {
    const back = $('.concept-portal-back');
    if (back) { back.textContent = '离梦 · 返回星海'; back.setAttribute('aria-label', '离开梦境，返回概念星海'); }
  };
  stylePortal();
  document.addEventListener('DOMContentLoaded', stylePortal, { once: true });
  panel.setAttribute('aria-busy', 'false');
  renderNotes();
  updateMotion();
})();
