#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 concepts.json 生成可直接以 file:// 打开的概念仓首页。

加一个新概念：建目录 → 在 concepts.json 里加一条 → 运行此脚本。
搜索、分类和装饰插画均内置于生成页，不依赖网络或前端构建工具。
不要手改 index.html，下次生成会覆盖。
"""
import html
import json
from datetime import date
from pathlib import Path
from string import Template
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parent.parent

ARROW = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
LOGO = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m16 3 12 7v13l-12 7-12-7V10L16 3Z" stroke="currentColor" stroke-width="1.4"/><path d="m4 10 12 7 12-7M16 17v13M10 6.5l12 7v6" stroke="currentColor" stroke-width="1.4"/></svg>'

HERO_ART = '''<svg class="archive-sculpture" viewBox="0 0 600 470" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="sheet-top" x1="144" y1="105" x2="440" y2="278" gradientUnits="userSpaceOnUse"><stop stop-color="#303c26"/><stop offset="1" stop-color="#171d15"/></linearGradient>
    <linearGradient id="sheet-front" x1="130" y1="270" x2="490" y2="300" gradientUnits="userSpaceOnUse"><stop stop-color="#20271c"/><stop offset="1" stop-color="#11160f"/></linearGradient>
    <radialGradient id="archive-glow"><stop stop-color="#badb73" stop-opacity=".13"/><stop offset="1" stop-color="#badb73" stop-opacity="0"/></radialGradient>
    <pattern id="archive-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#667255" fill-opacity=".3"/></pattern>
  </defs>
  <rect x="28" y="26" width="550" height="414" fill="url(#archive-dots)"/>
  <ellipse cx="309" cy="262" rx="260" ry="190" fill="url(#archive-glow)"/>
  <ellipse cx="305" cy="310" rx="265" ry="119" transform="rotate(-21 305 310)" stroke="#3a4133" stroke-width=".8" stroke-dasharray="3 8"/>
  <ellipse cx="306" cy="391" rx="174" ry="19" fill="#090c08" fill-opacity=".55"/>
  <g class="archive-sheets">
    <path d="m103 278 218-123 192 108v17L295 403 103 295Z" fill="url(#sheet-front)" stroke="#404936"/>
    <path d="m103 278 218-123 192 108-218 123L103 278Z" fill="#1b2218" stroke="#505b42"/>
    <path d="M295 386v17m0-17 218-123" stroke="#697753" stroke-opacity=".65"/>
    <path d="m122 236 218-123 192 108v16L314 360 122 252Z" fill="url(#sheet-front)" stroke="#46503b"/>
    <path d="m122 236 218-123 192 108-218 123L122 236Z" fill="#222b1c" stroke="#64744d"/>
    <path d="M314 344v16m0-16 218-123" stroke="#8a9c64" stroke-opacity=".65"/>
    <path d="m92 178 218-123 192 108v18L284 304 92 196Z" fill="url(#sheet-front)" stroke="#596746"/>
    <path d="m92 178 218-123 192 108-218 123L92 178Z" fill="url(#sheet-top)" stroke="#97ad6b" stroke-width="1.2"/>
    <path d="M284 286v18m0-18 218-123" stroke="#bddc80" stroke-opacity=".6"/>
    <path d="m114 176 196-110 171 97-197 110-170-97Z" stroke="#82965c" stroke-opacity=".3"/>
    <path d="m143 176 82-46m-67 55 53-30m-37 39 67-38" stroke="#94aa6a" stroke-width="2" stroke-linecap="round" stroke-opacity=".55"/>
    <path d="m228 239 72-40m-55 49 42-24" stroke="#728655" stroke-width="2" stroke-linecap="round"/>
    <g transform="matrix(.866 -.5 .866 .5 304 124)">
      <rect x="0" y="0" width="67" height="67" rx="10" fill="#c2e68a"/>
      <path d="M33.5 13v41M13 33.5h41M19 19l29 29M48 19 19 48" stroke="#26331c" stroke-width="2.5"/>
      <circle cx="33.5" cy="33.5" r="10" fill="#c2e68a" stroke="#26331c" stroke-width="2.5"/>
    </g>
    <path d="m387 215 49-28" stroke="#9db777" stroke-width="1.5"/>
    <circle cx="446" cy="181" r="2" fill="#c9ec95"/>
  </g>
  <path d="M450 90h49V57m-349 283H92v37" stroke="#73825c" stroke-width=".8"/>
  <circle cx="450" cy="90" r="3" fill="#c4e78b"/>
  <circle cx="150" cy="340" r="3" fill="#c4e78b"/>
  <text x="501" y="45" fill="#9ca98d" font-size="10" font-family="monospace" letter-spacing="2" text-anchor="end">IDEAS, IN FORM.</text>
  <text x="47" y="400" fill="#7c8970" font-size="10" font-family="monospace" letter-spacing="2">N° 001 — ∞</text>
  <path d="M544 320v16m-8-8h16M68 116v10m-5-5h10" stroke="#acc985" stroke-width="1"/>
  <circle cx="390" cy="425" r="2" fill="#8ca36c"/>
</svg>'''

BUTTERFLY_ART = '''<svg viewBox="0 0 420 370" fill="none" aria-hidden="true">
  <defs>
    <radialGradient id="butterfly-halo"><stop stop-color="#a4be80" stop-opacity=".18"/><stop offset="1" stop-color="#a4be80" stop-opacity="0"/></radialGradient>
    <linearGradient id="wing-tint" x1="90" y1="80" x2="320" y2="290" gradientUnits="userSpaceOnUse"><stop stop-color="#d7e4bb" stop-opacity=".22"/><stop offset="1" stop-color="#81956b" stop-opacity=".02"/></linearGradient>
  </defs>
  <rect width="420" height="370" fill="#19211b"/>
  <circle cx="210" cy="185" r="180" fill="url(#butterfly-halo)"/>
  <circle cx="210" cy="185" r="133" stroke="#728268" stroke-opacity=".26"/>
  <circle cx="210" cy="185" r="105" stroke="#728268" stroke-opacity=".17"/>
  <path d="M210 37v24m0 247v24M62 185h24m248 0h24" stroke="#8fa27d" stroke-opacity=".4"/>
  <g class="concept-butterfly">
    <path d="M209 191C185 139 128 68 87 84c-33 14-14 85 13 109 26 23 72 21 109 10Z" fill="url(#wing-tint)" stroke="#b8c9a3" stroke-width="1.15"/>
    <path d="M211 191c24-52 81-123 122-107 33 14 14 85-13 109-26 23-72 21-109 10Z" fill="url(#wing-tint)" stroke="#b8c9a3" stroke-width="1.15"/>
    <path d="M207 201c-36-3-91 8-94 43-2 28 35 59 58 35 18-19 28-45 36-78Zm6 0c36-3 91 8 94 43 2 28-35 59-58 35-18-19-28-45-36-78Z" fill="url(#wing-tint)" stroke="#b8c9a3" stroke-width="1.15"/>
    <path d="m207 193-112-94m108 89-39-67m32 66-73-18m75 28-86 1m101-5 112-94m-108 89 39-67m-32 66 73-18m-75 28 86 1m-104 9-65 52m64-47-31 63m44-68 65 52m-64-47 31 63" stroke="#9bad8c" stroke-width=".75" stroke-opacity=".65"/>
    <path d="M210 173v65m-2-65c-3-17-9-22-15-24m19 24c3-17 9-22 15-24" stroke="#d8e5c5" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="210" cy="195" rx="3" ry="24" fill="#cbd9b8"/>
    <circle cx="119" cy="130" r="9" stroke="#9bad8c" stroke-opacity=".65"/>
    <circle cx="301" cy="130" r="9" stroke="#9bad8c" stroke-opacity=".65"/>
  </g>
  <text x="25" y="30" fill="#a3b393" font-size="9" font-family="monospace" letter-spacing="2">A STUDY OF DREAMS</text>
  <text x="25" y="345" fill="#a3b393" font-size="8" font-family="monospace" letter-spacing="1.5">BETWEEN DREAM &amp; WAKING</text>
  <text x="394" y="346" fill="#a3b393" font-size="10" font-family="monospace" text-anchor="end">01</text>
  <path d="M24 51h17M379 319h17" stroke="#9aad83" stroke-opacity=".5"/>
</svg>'''

SCRIPT = r'''<script>
(() => {
  const root = document.querySelector('.archive-page');
  const tools = root.querySelector('.archive-tools');
  const search = root.querySelector('#concept-search');
  const filters = [...root.querySelectorAll('[data-filter]')];
  const entries = [...root.querySelectorAll('.concept-entry')];
  const count = root.querySelector('#result-count');
  const empty = root.querySelector('#empty-results');
  const openSlot = root.querySelector('.archive-open-slot');
  const grid = root.querySelector('.archive-concept-grid');
  let category = '';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('zh-CN');
  const index = new Map(entries.map(entry => [entry, normalize(entry.dataset.search)]));

  function update() {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const entry of entries) {
      const matches = (!category || entry.dataset.category === category)
        && terms.every(term => index.get(entry).includes(term));
      entry.hidden = !matches;
      if (matches) visible += 1;
    }
    for (const filter of filters) {
      filter.setAttribute('aria-pressed', String(filter.dataset.filter === category));
    }
    empty.hidden = visible > 0;
    openSlot.hidden = Boolean(terms.length || category || !visible);
    grid.classList.toggle('is-filtered', openSlot.hidden);
    count.textContent = `${visible} / ${entries.length} 个概念`;
  }

  tools.hidden = false;
  search.addEventListener('input', update);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      search.value = '';
      update();
    }
  });
  root.querySelector('.archive-search').addEventListener('submit', event => event.preventDefault());
  for (const filter of filters) {
    filter.addEventListener('click', () => {
      category = filter.dataset.filter;
      update();
    });
  }
  root.querySelector('#reset-filters').addEventListener('click', () => {
    category = '';
    search.value = '';
    update();
    search.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    event.preventDefault();
    search.focus();
  });
  update();
})();
</script>'''

PAGE = Template('''<!DOCTYPE html>
<html lang="zh-CN" class="archive-root">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#111310">
  <meta name="description" content="$description">
  <title>$name — 给想法一个去处</title>
  <link rel="stylesheet" href="./assets/base.css">
</head>
<body class="archive-page" id="top">
  <a class="archive-skip" href="#concepts">跳到概念索引</a>
  <div class="archive-shell">
    <header class="archive-header">
      <a class="archive-brand" href="./index.html" aria-label="$name首页">
        <span class="archive-brand-mark">$logo</span>
        <span class="archive-brand-name">$name<span>CONCEPT ARCHIVE</span></span>
      </a>
      <nav class="archive-nav" aria-label="主导航">
        <a href="#concepts" class="archive-nav-current">概念索引 <span>$number</span></a>
        <a href="#about">关于这里</a>
      </nav>
      $repository
    </header>

    <main>
      <section class="archive-hero" aria-labelledby="hero-title">
        <div class="archive-hero-copy">
          <p class="archive-eyebrow"><span class="archive-signal" aria-hidden="true"></span>一个持续生长的灵感档案馆</p>
          <h1 id="hero-title">一些念头，<br>值得<span class="archive-emphasis">留个位置</span>。</h1>
          <p class="archive-intro">先存住，不急着做成产品。<br>$subtitle</p>
          <div class="archive-hero-actions">
            <a class="archive-primary" href="#concepts">翻开概念集 <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v14m-5-5 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
            <span class="archive-hero-note">$number 个概念<span>无限种可能</span></span>
          </div>
        </div>
        <div class="archive-hero-art">$hero_art<span class="archive-art-caption">把一闪而过，变成有迹可循。</span></div>
      </section>

      <section class="archive-collection" id="concepts" aria-labelledby="collection-title">
        <div class="archive-section-heading">
          <div>
            <p class="archive-eyebrow archive-section-label"><span aria-hidden="true">01 /</span> THE COLLECTION</p>
            <h2 id="collection-title">概念索引<span>每一个入口，都是一个独立的世界。</span></h2>
          </div>
          <span class="archive-result-count" id="result-count" role="status" aria-live="polite" aria-atomic="true">$count / $count 个概念</span>
        </div>

        <div class="archive-tools" hidden>
          <div class="archive-filters" role="group" aria-label="按概念分类筛选">
            <button class="archive-filter" type="button" data-filter="" aria-pressed="true">全部概念 <span>$number</span></button>
$filters
          </div>
          <form class="archive-search" role="search">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="m13 13 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <label class="archive-sr-only" for="concept-search">搜索概念、分类或关键词</label>
            <input id="concept-search" type="search" placeholder="搜索概念、关键词…" autocomplete="off" spellcheck="false" aria-controls="concept-list">
            <kbd aria-hidden="true">/</kbd>
          </form>
        </div>

        <div class="archive-concept-grid$grid_modifier" id="concept-list">
$cards
          <aside class="archive-open-slot" aria-label="概念仓持续更新"$slot_hidden>
            <span class="archive-slot-symbol" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 7v18M7 16h18" stroke="currentColor" stroke-width="1"/></svg></span>
            <h3>下一个念头，<br>还在路上。</h3>
            <p>不设主题，不赶进度。<br>有意思的，就先放进来。</p>
            <span class="archive-slot-note">SPACE FOR THE UNEXPECTED <span aria-hidden="true">↗</span></span>
          </aside>
        </div>
        <div class="archive-empty" id="empty-results"$empty_hidden>
          <span class="archive-empty-symbol" aria-hidden="true">∅</span>
          <h3>这个念头，还没入仓。</h3>
          <p>换个关键词，或者看看全部概念。</p>
          <button class="archive-reset" id="reset-filters" type="button">查看全部概念 <span aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section class="archive-about" id="about" aria-labelledby="about-title">
        <div class="archive-about-label"><span class="archive-signal" aria-hidden="true"></span>ABOUT THIS SPACE</div>
        <div class="archive-about-copy">
          <h2 id="about-title">想法不必完整，<span>好奇就有意义。</span></h2>
          <p>这里收集那些尚未定型、却不想忘记的念头。<br>每个概念有自己的房间，各自生长，彼此敞开。</p>
        </div>
        <a class="archive-back-top" href="#top" aria-label="回到顶部"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      </section>
    </main>

    <footer class="archive-footer">
      <span>© $year $name <span class="archive-footer-divider">/</span> 保持好奇，持续归档。</span>
      <span class="archive-footer-meta">$number CONCEPTS <span aria-hidden="true">·</span> 更新于 <time datetime="$updated">$updated_display</time></span>
    </footer>
  </div>
$script
</body>
</html>
''')


def escape(value):
    return html.escape(str(value), quote=True)


def concept_art(concept, number):
    """原创矢量封面；新概念无 art 字段时使用通用档案图形。"""
    if concept.get("art") == "butterfly":
        # 未来复用相同插画时，SVG 渐变 ID 也必须保持全页唯一。
        return BUTTERFLY_ART.replace("butterfly-halo", f"butterfly-halo-{number}").replace(
            "wing-tint", f"wing-tint-{number}"
        )
    return f'''<svg viewBox="0 0 420 370" fill="none" aria-hidden="true">
      <rect width="420" height="370" fill="#1b241d"/>
      <circle cx="210" cy="185" r="128" stroke="#82966c" stroke-opacity=".3"/>
      <path d="m108 189 102-59 102 59-102 59-102-59Zm0 28 102 59 102-59m-204 28 102 59 102-59" stroke="#adc88e" stroke-width="1.2"/>
      <path d="M210 95v47m-23-24h46" stroke="#c4e78b" stroke-width="1.2"/>
      <text x="25" y="30" fill="#a3b393" font-size="9" font-family="monospace" letter-spacing="2">AN IDEA, TAKING SHAPE</text>
      <text x="394" y="346" fill="#a3b393" font-size="10" font-family="monospace" text-anchor="end">{number:02}</text>
    </svg>'''


def render(data):
    site = data.get("site", {})
    concepts = sorted(data.get("concepts", []), key=lambda c: c.get("date", ""), reverse=True)
    categories = {}
    cards = []
    directories = set()
    for number, concept in enumerate(concepts, 1):
        directory = concept["dir"]
        if Path(directory).is_absolute():
            raise ValueError(f"概念目录必须是相对路径：{directory}")
        entry = (ROOT / directory / "index.html").resolve()
        if not entry.is_relative_to(ROOT) or not entry.is_file():
            raise ValueError(f"概念入口不存在或不在仓库内：{directory}/index.html")
        if entry in directories:
            raise ValueError(f"重复的概念目录：{directory}")
        directories.add(entry)
        category = concept.get("category") or concept.get("tag") or "未分类"
        categories[category] = categories.get(category, 0) + 1
        concept_date = concept.get("date", "")
        if concept_date:
            date.fromisoformat(concept_date)
        keywords = concept.get("keywords", [])
        if not isinstance(keywords, list) or not all(isinstance(word, str) for word in keywords):
            raise ValueError(f"keywords 必须是字符串数组：{directory}")
        search = " ".join([concept["name"], category, concept.get("tag", ""), concept.get("desc", ""), *keywords])
        tags = "".join(f'<span>{escape(word)}</span>' for word in keywords)
        status = escape(concept.get("status", "概念存档"))
        href = "./" + quote(entry.relative_to(ROOT).as_posix(), safe="/")
        cards.append(f'''          <article class="concept-entry" data-category="{escape(category)}" data-search="{escape(search)}">
            <a class="concept-card" href="{escape(href)}" aria-labelledby="concept-title-{number}" aria-describedby="concept-desc-{number}">
              <div class="concept-art" aria-hidden="true">{concept_art(concept, number)}<span class="concept-art-number">N° {number:03}</span></div>
              <div class="concept-body">
                <div class="concept-topline"><span class="concept-category">{escape(category)}</span><span class="concept-status"><span aria-hidden="true"></span>{status}</span></div>
                <h3 id="concept-title-{number}">{escape(concept["name"])}</h3>
                <p class="concept-description" id="concept-desc-{number}">{escape(concept.get("desc", ""))}</p>
                <div class="concept-keywords">{tags}</div>
                <div class="concept-bottomline"><time datetime="{escape(concept_date)}">{escape(concept_date.replace("-", "."))}</time><span class="concept-enter">打开概念 {ARROW}</span></div>
              </div>
            </a>
          </article>''')

    filters = "\n".join(
        f'            <button class="archive-filter" type="button" data-filter="{escape(category)}" aria-pressed="false">{escape(category)} <span>{total:02}</span></button>'
        for category, total in categories.items()
    )
    updated = site.get("updated", "")
    if updated:
        date.fromisoformat(updated)
    repository = site.get("repository", "")
    repository_link = ''
    if repository:
        parsed = urlparse(repository)
        if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
            raise ValueError("repository 必须是无凭证的 HTTPS 地址")
        repository_link = f'<a class="archive-repository" href="{escape(repository)}" target="_blank" rel="noopener noreferrer">查看仓库 {ARROW}<span class="archive-sr-only">（在新标签页打开）</span></a>'
    return PAGE.substitute(
        name=escape(site.get("name", "概念仓")),
        description=escape(site.get("description", site.get("subtitle", ""))),
        subtitle=escape(site.get("subtitle", "每个子目录是一个概念，各自成形。")),
        updated=escape(updated), updated_display=escape(updated.replace("-", ".")),
        year=escape(updated[:4]), count=len(concepts), number=f"{len(concepts):02}",
        logo=LOGO, repository=repository_link, hero_art=HERO_ART,
        filters=filters, cards="\n".join(cards), script=SCRIPT,
        grid_modifier=" archive-concept-grid--single" if len(concepts) == 1 else "",
        empty_hidden=" hidden" if concepts else "",
        slot_hidden="" if concepts else " hidden",
    )


def main():
    with (ROOT / "concepts.json").open(encoding="utf-8") as source:
        data = json.load(source)
    document = render(data)
    (ROOT / "index.html").write_text(document, encoding="utf-8")
    print(f"index.html generated: {len(data.get('concepts', []))} concepts")


if __name__ == "__main__":
    main()
