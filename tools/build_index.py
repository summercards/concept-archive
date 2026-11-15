#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 concepts.json 生成概念星海。

每个真实概念对应一个静态链接；银河只是逐层增强，不依赖远端服务。
加概念：建立子目录/index.html → 更新清单 → 运行本脚本。
"""
import hashlib
import html
import json
import math
import re
from datetime import date
from pathlib import Path
from string import Template
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent

PAGE = Template('''<!DOCTYPE html>
<html lang="zh-CN" class="universe-root">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#05060d">
  <meta name="description" content="$description">
  <title>$name — 万千念头，各自成星</title>
  <script src="./assets/portal.js"></script>
  <link rel="stylesheet" href="./assets/base.css">
  <script src="./assets/galaxy.js" defer></script>
  <noscript><style>
    .universe-space { touch-action: auto; }
    .universe-stars { inset: 110px 20px 160px; display: grid; align-content: start; gap: 28px; padding: 12px; overflow: auto; pointer-events: auto; }
    .concept-star { position: relative; left: 0 !important; top: 0 !important; margin: 0; }
    .concept-star-label { min-width: 0; width: calc(100vw - 124px); max-width: 360px; }
    .concept-star-name { overflow-wrap: anywhere; }
    .concept-star-detail { opacity: 1; transform: none; }
    .concept-star-enter, .instruction-desktop { display: none; }
    .instruction-mobile { display: inline; }
  </style></noscript>
</head>
<body class="universe-page">
  <a class="universe-skip" href="#concept-stars">跳到概念星</a>
  <header class="universe-header">
    <a class="universe-wordmark" href="./index.html" aria-label="$name首页"><span class="universe-brand-star" aria-hidden="true">✧</span><span>$name<small>CONCEPT UNIVERSE</small></span></a>
    <div class="universe-status"><button class="universe-view-reset" id="view-reset" type="button" aria-label="恢复星海初始视距" hidden>返回远景</button><span class="universe-census">$number <span>已知星体</span></span><button class="universe-motion" id="motion-toggle" type="button" aria-label="暂停星海运动" aria-pressed="false" hidden><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path class="motion-pause" d="M7 5v10m6-10v10" stroke="currentColor" stroke-width="1.2"/><path class="motion-play" d="m7 5 8 5-8 5V5Z" stroke="currentColor" stroke-width="1.2"/></svg></button></div>
  </header>

  <main class="universe-space" id="universe" aria-labelledby="universe-title">
    <h1 class="universe-sr-only" id="universe-title">$name：万千念头，各自成星。</h1>
    <div class="universe-ambient" aria-hidden="true"></div>
    <canvas class="universe-canvas" id="galaxy" aria-hidden="true"></canvas>
    <div class="universe-vignette" aria-hidden="true"></div>
    <nav class="universe-stars" id="concept-stars" aria-label="概念星，点击进入独立的概念世界">
$stars
    </nav>
    <p class="universe-empty"$empty_hidden>第一颗星，尚在诞生。</p>
    <p class="universe-location" aria-hidden="true" hidden><span></span></p>
  </main>

  <footer class="universe-footer">
    <p class="universe-whisper">万千念头，<span>各自成星。</span></p>
    <p class="universe-instruction"><span class="instruction-desktop">拖动漫游<span class="instruction-separator">·</span>滚动靠近</span><span class="instruction-mobile">点击星体，进入一个念头</span></p>
    <button class="universe-index-toggle" id="index-toggle" type="button" aria-haspopup="dialog" aria-controls="star-index" hidden>星图 <span aria-hidden="true">↗</span></button>
  </footer>

  <dialog class="universe-index" id="star-index" aria-labelledby="star-index-title">
    <div class="universe-index-head"><h2 id="star-index-title">已知星体<span> / $number</span></h2><button id="index-close" type="button" aria-label="关闭星图">×</button></div>
    <nav aria-label="所有概念">
$index
    </nav>
    <p class="universe-index-note">其余的光，是尚未成形的可能。</p>
  </dialog>
  <p class="universe-sr-only" id="universe-announcement" role="status" aria-live="polite"></p>
</body>
</html>
''')


def escape(value):
    return html.escape(str(value), quote=True)


def coordinates(directory, concept):
    """目录名决定星位，增加或重排清单不会移动已有的星。"""
    digest = hashlib.sha256(directory.encode("utf-8")).digest()
    orbit = concept.get("orbit", {})
    radius = float(orbit.get("radius", 0.58 + digest[0] / 255 * 0.3))
    angle = float(orbit.get("angle", int.from_bytes(digest[1:3], "big") / 65535 * math.tau))
    if not math.isfinite(radius) or not 0.25 <= radius <= 1.0 or not math.isfinite(angle):
        raise ValueError(f"无效的星体轨道：{directory}")
    return radius, angle % math.tau


def render(data):
    site = data.get("site", {})
    concepts = sorted(data.get("concepts", []), key=lambda c: c.get("date", ""), reverse=True)
    stars, index, entries = [], [], set()
    for number, concept in enumerate(concepts, 1):
        directory = concept["dir"]
        if Path(directory).is_absolute():
            raise ValueError(f"概念目录必须是相对路径：{directory}")
        entry = (ROOT / directory / "index.html").resolve()
        if not entry.is_relative_to(ROOT) or not entry.is_file():
            raise ValueError(f"概念入口不存在或不在仓库内：{directory}/index.html")
        if entry in entries:
            raise ValueError(f"重复的概念目录：{directory}")
        entries.add(entry)
        if concept.get("date"):
            date.fromisoformat(concept["date"])
        radius, angle = coordinates(directory, concept)
        tint = concept.get("color", "#c8c6f0")
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", tint):
            raise ValueError(f"星体颜色必须为六位十六进制：{directory}")
        href = "./" + quote(entry.relative_to(ROOT).as_posix(), safe="/")
        name, desc = escape(concept["name"]), escape(concept.get("desc", ""))
        tag = escape(concept.get("tag", ""))
        # 无脚本时也有清晰的星体和真实入口，不制造虚构的概念链接。
        x = 50 + math.cos(angle) * radius * 32
        y = 51 + math.sin(angle) * radius * 22
        stars.append(f'''      <a class="concept-star" data-concept-star data-radius="{radius:.6f}" data-angle="{angle:.6f}" data-concept="{escape(directory)}" href="{escape(href)}" style="--star-color:{tint};left:{x:.3f}%;top:{y:.3f}%" aria-labelledby="star-name-{number}" aria-describedby="star-detail-{number}">
        <span class="concept-star-halo" aria-hidden="true"></span><span class="concept-star-core" aria-hidden="true"></span><span class="concept-star-orbit" aria-hidden="true"></span>
        <span class="concept-star-label"><span class="concept-star-code">{number:03}</span><span class="concept-star-name" id="star-name-{number}">{name}</span><span class="concept-star-detail" id="star-detail-{number}">{tag}<span class="concept-star-enter">进入此境 ↗</span></span></span>
        <span class="universe-sr-only">{desc}</span>
      </a>''')
        index.append(f'''      <a href="{escape(href)}" data-concept-star><span class="universe-index-number">{number:03}</span><span>{name}<small>{tag}</small></span><span aria-hidden="true">↗</span></a>''')
    if site.get("updated"):
        date.fromisoformat(site["updated"])
    return PAGE.substitute(
        name=escape(site.get("name", "概念仓")),
        description=escape(site.get("description", "每一个念头，都是宇宙里的一颗星。")),
        number=f"{len(concepts):02}", stars="\n".join(stars), index="\n".join(index),
        empty_hidden=" hidden" if concepts else "",
    )


def main():
    with (ROOT / "concepts.json").open(encoding="utf-8") as source:
        data = json.load(source)
    (ROOT / "index.html").write_text(render(data), encoding="utf-8")
    print(f"index.html generated: {len(data.get('concepts', []))} concept stars")


if __name__ == "__main__":
    main()
