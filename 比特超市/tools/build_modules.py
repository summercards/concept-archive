#!/usr/bin/env python3
"""把 assets/code/*.js（ESM）打成可在 file:// 下执行的经典脚本。

为什么需要这一步：资产库是双击打开的单页，file:// 下 <script type="module">
会被 CORS 直接拦掉，所以预览不能 import。这里不改任何实现，只做三件事：

  1. import 语句 → 依赖注入（THREE / mergeGeometries 来自全局）
  2. export 前缀剥掉，改成 IIFE 的 return 表（保持 ESM 的作用域隔离语义）
  3. export default → const __default，并在 return 表里登记为 default

产物：assets/modules.js，挂到 window.ASSET_MODULES[assetId]
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "code")
OUT = os.path.join(ROOT, "assets", "modules.js")

# 与 app.js 里的资产 id 一一对应
ORDER = [
    "env-atmosphere",
    "quality-presets",
    "props-ledger",
    "material-ledger",
    "material-baker",
    "modeling-kit",
    "container-builder",
    "props-builder",
    "player-tuning",
    "weapon-tuning",
    "ai-tuning",
    "audio-recipes",
]

IMPORT_RE = re.compile(r"^import\s+[\s\S]*?;\s*$", re.M)
EXPORT_DECL_RE = re.compile(r"^export\s+(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", re.M)


def transform(name: str, text: str):
    deps = []
    if 'from "three"' in text:
        deps.append("const THREE = window.THREE;")
    if "BufferGeometryUtils" in text:
        deps.append("const mergeGeometries = window.__mergeGeometries;")

    # import 语句整块删除（含多行）
    text = IMPORT_RE.sub("", text)

    exports = EXPORT_DECL_RE.findall(text)
    named_exports = []
    def export_list(match):
        for entry in match.group(1).split(","):
            parts = re.split(r"\s+as\s+", entry.strip())
            if parts[0]:
                named_exports.append(parts[0] if len(parts) == 1 else parts[1] + ": " + parts[0])
        return ""
    text = re.sub(r"^export\s*\{([^}]+)\}\s*;?", export_list, text, flags=re.M)
    text = EXPORT_DECL_RE.sub(lambda m: f"{m.group(1)} {m.group(2)}", text)

    has_default = re.search(r"^export\s+default\s+", text, re.M) is not None
    text = re.sub(r"^export\s+default\s+", "const __default = ", text, flags=re.M)

    names = [n for _, n in exports] + named_exports
    ret = ", ".join(names)
    if has_default:
        ret += (", " if ret else "") + "default: __default"
    return text, deps, ret


def main():
    chunks = []
    meta = {}
    for aid in ORDER:
        path = os.path.join(SRC, aid + ".js")
        raw = open(path, encoding="utf-8").read()
        body, deps, ret = transform(aid, raw)
        meta[aid] = {"bytes": len(raw.encode()), "lines": raw.count("\n") + 1,
                     "exports": [n for _, n in EXPORT_DECL_RE.findall(raw)]}
        dep_block = "\n".join("  " + d for d in deps)
        chunks.append(
            f"/* ── {aid} ── 原文，仅替换 import ── */\n"
            f"window.ASSET_MODULES[{json.dumps(aid)}] = (function () {{\n"
            f"{dep_block}\n"
            f'{body.strip()}\n'
            f"  return {{ {ret} }};\n"
            f"}})();\n"
        )

    head = (
        "/**\n"
        " * 资产模块运行时 · 由 tools/build_modules.py 生成，请勿手改。\n"
        " *\n"
        " * 每个 IIFE 里跑的都是 assets/code/<id>.js 的原文，一行实现都没动；\n"
        " * 只把 ESM 的 import/export 换成了依赖注入 + return 表。\n"
        " * 因此资产库里的预览，跑的就是那份可以直接拷进项目的源码本身。\n"
        " */\n"
        "window.ASSET_MODULES = Object.create(null);\n\n"
    )
    open(OUT, "w", encoding="utf-8").write(head + "\n".join(chunks))
    print("写出", OUT, os.path.getsize(OUT), "B")
    for k, v in meta.items():
        print(f"  {k:18} {v['lines']:4} 行")


if __name__ == "__main__":
    main()
