#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 concepts.json 生成概念仓首页 index.html。

加一个新概念：建目录 → 在 concepts.json 里加一条 → 跑一次这个脚本。
不要手改 index.html，下次生成会覆盖。
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    with open(os.path.join(ROOT, "concepts.json"), encoding="utf-8") as f:
        data = json.load(f)

    site = data.get("site", {})
    concepts = data.get("concepts", [])

    cards = []
    for c in concepts:
        d = c["dir"]
        cards.append(
            f"""      <a class="card" href="./{html.escape(d)}/index.html">
        <h2 class="card-name">{html.escape(c["name"])}</h2>
        <p class="card-desc">{html.escape(c.get("desc", ""))}</p>
        <div class="card-meta"><span>{html.escape(c.get("tag", ""))}</span><span>{html.escape(c.get("date", ""))}</span></div>
      </a>"""
        )

    doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(site.get("name", "概念仓"))}</title>
<link rel="stylesheet" href="./assets/base.css">
</head>
<body>
  <div class="wrap">
    <div class="eyebrow">Concept Archive</div>
    <h1>{html.escape(site.get("name", "概念仓"))}</h1>
    <p class="lede">{html.escape(site.get("subtitle", ""))}</p>
    <div class="rule"></div>
    <div class="grid">
{chr(10).join(cards)}
    </div>
    <footer>{html.escape(site.get("name", "概念仓"))} · {html.escape(site.get("updated", ""))} · {len(concepts)} 个概念</footer>
  </div>
</body>
</html>
"""
    out = os.path.join(ROOT, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"index.html generated: {len(concepts)} concepts")


if __name__ == "__main__":
    main()
