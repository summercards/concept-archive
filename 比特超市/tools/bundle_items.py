#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 build/inventory.json 打包成网页用的 assets/data.js。

与旧版区别：旧版是 10 个「汇总资产」，每条塞进整份模块源码（165 KB）；
现在每条是一件独立资产，只带自己的参数与源码片段，全量 283 条。
"""
import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INV = json.load(open(os.path.join(ROOT, "build", "inventory.json"), encoding="utf-8"))
D = json.load(open(os.path.join(ROOT, "build", "tables.json"), encoding="utf-8"))
VR = json.load(open(os.path.join(ROOT, "build", "verify-result.json"), encoding="utf-8"))
PROP_REPORT = os.path.join(ROOT, "outputs", "props-verification.json")
PV = json.load(open(PROP_REPORT, encoding="utf-8")) if os.path.exists(PROP_REPORT) else {}
PV_SUMMARY = PV.get("summary", {})
PROP_MANIFEST = json.load(open(os.path.join(ROOT, "build", "props-source.json"), encoding="utf-8"))
PROP_HASH = hashlib.sha256(open(os.path.join(ROOT, "assets", "code", "props-builder.js"), "rb").read()).hexdigest()
PV_CURRENT = (PV.get("static", {}).get("generated", {}).get("sha256") == PROP_HASH
              and PV.get("scope", {}).get("sourceHash") == PROP_MANIFEST["source"]["sha256"])
PROP_VERIFICATION = {
    "report": "outputs/props-verification.json",
    "status": PV.get("status", "未验证") if PV_CURRENT else ("待重跑" if PV else "未验证"),
    "reportedStatus": PV.get("status", "未验证"),
    "completedAt": PV.get("completedAt"),
    "inputsMatchCurrent": PV_CURRENT,
    "summary": PV_SUMMARY,
    "visualStatus": PV_SUMMARY.get("visualStatus", "未验证；棚拍仅作运行证据") if PV_CURRENT else "未验证；报告待更新，棚拍非全游戏等价",
    "audioStatus": PV_SUMMARY.get("audioStatus", "未验证") if PV_CURRENT else "未验证",
    "scope": "36真实构造已接入、结构对照看最新props-verification.json，棚拍渲染非全游戏等价",
}

CAT_META = [
    ("MAT", "材质", "材质族与材质实例，贴图由 GLSL 现烘", "--mat"),
    ("DECAL", "贴花", "canvas 2D 绘制的标识与污渍", "--mat"),
    ("MODEL", "模型", "道具、几何原语、专用建模器", "--model"),
    ("SCENE", "场景", "程序化生成的关卡 / 远景 / 地面", "--geo"),
    ("ENV", "光影", "数值型环境参数", "--env"),
    ("FX", "后期", "合成链上的效果", "--num"),
    ("SFX", "音效", "合成配方", "--audio"),
    ("NUM", "数值", "调参与画质预设", "--num"),
    ("ACTOR", "角色", "玩家与两种敌人", "--model"),
    ("WEAPON", "武器", "枪与后坐弹簧", "--geo"),
]

SUBS = {}
for it in INV["items"]:
    SUBS.setdefault(it["cat"], {}).setdefault(it["sub"], 0)
    SUBS[it["cat"]][it["sub"]] += 1

cats = []
for cid, name, desc, color in CAT_META:
    subs = [{"name": k, "n": v} for k, v in SUBS.get(cid, {}).items()]
    cats.append({"id": cid, "name": name, "desc": desc, "color": color,
                 "n": sum(s["n"] for s in subs), "subs": subs})

items = []
for it in INV["items"]:
    items.append({
        "id": it["id"],
        "cat": it["cat"],
        "sub": it["sub"],
        "name": it["name"],
        "en": it["en"],
        "kind": it["kind"],
        "focus": it["focus"],
        "params": it["params"],
        "summary": it["summary"],
        "anchor": it["anchor"],
        "code": it["code"],
        "tags": it["tags"],
    })

# 覆盖核对：原工程的每个注册表 ↔ 本库条目数
COVER = [
    {"src": "c3 材质族表", "n": 29, "cat": "MAT", "sub": "材质族", "note": "逐族"},
    {"src": "l1 材质实例表", "n": 48, "cat": "MAT", "sub": "材质实例", "note": "逐实例"},
    {"src": "贴花绘制表", "n": 22, "cat": "DECAL", "sub": "贴花", "note": "逐图"},
    {"src": "Gi 道具尺寸表", "n": 36, "cat": "MODEL", "sub": "道具", "note": "逐件"},
    {"src": "Gi/J3/eb/sb 建模器注册", "n": 36, "cat": "MODEL", "sub": "专用建模器", "note": "逐函数，含容器循环与三组注册函数"},
    {"src": "modeling-kit 原语", "n": 7, "cat": "MODEL", "sub": "几何原语", "note": "逐函数"},
    {"src": "Go 音效配方表", "n": 57, "cat": "SFX", "sub": "音效", "note": "逐条"},
    {"src": "合成链 uniform", "n": 13, "cat": "FX", "sub": "后期", "note": "逐个 pass"},
    {"src": "env 数值表", "n": 8, "cat": "ENV", "sub": "环境", "note": "逐组"},
    {"src": "SPRINGS 弹簧表", "n": 9, "cat": "WEAPON", "sub": "弹簧", "note": "逐根"},
    {"src": "敌人定义 Zv", "n": 2, "cat": "ACTOR", "sub": "敌人", "note": "逐型"},
    {"src": "玩家调参 Kv", "n": 1, "cat": "ACTOR", "sub": "玩家", "note": "单例"},
    {"src": "quality 五档", "n": 5, "cat": "NUM", "sub": "画质预设", "note": "逐档"},
]
have = {}
for it in INV["items"]:
    have[(it["cat"], it["sub"])] = have.get((it["cat"], it["sub"]), 0) + 1
for c in COVER:
    c["got"] = have.get((c["cat"], c["sub"]), 0)
    c["ok"] = c["got"] >= c["n"]

MODS = [{"role": m["role"], "ns": m["ns"], "kb": m["kb"], "fn": m["functions"],
         "num": m["numericLiterals"], "anchor": m["anchor"]} for m in D["modules"]]

DB = {
    "meta": {
        "source": D["source"],
        "total": len(items),
        "verify": {"passed": VR["passed"], "failed": VR["failed"],
                   "sections": VR.get("sections", {}),
                   "scope": "数值、源码及构造检查；不代表完整视觉或声音通过"},
        "propsStatus": PROP_VERIFICATION["scope"],
        "propsVerification": PROP_VERIFICATION,
        "counts": {
            "assets": len(items),
            "props": 36,
            "propsIntegrated": sum(it["sub"] == "道具" and it["focus"].get("integrated") is True for it in items),
            "propsVisualVerified": PV_SUMMARY.get("propsVisualVerified") if PV_CURRENT else None,
            "builders": 36,
            "families": 29,
            "instances": 48,
            "recipes": 57,
            "decals": 22,
            "springs": 9,
            "modules": len(MODS),
        },
        "modules": MODS,
        "cover": COVER,
    },
    "cats": cats,
    "items": items,
}

out = os.path.join(ROOT, "assets", "data.js")
body = json.dumps(DB, ensure_ascii=False, separators=(",", ":"))
open(out, "w", encoding="utf-8").write("/* 由 tools/bundle_items.py 生成，勿手改 */\nwindow.DB=" + body + ";\n")
print("已写出 %s  %d bytes; %d 件资产 / %d 个分类" % (out, os.path.getsize(out), len(items), len(cats)))
for c in cats:
    print("  %-6s %-4s %3d  %s" % (c["id"], "", c["n"], " / ".join("%s %d" % (s["name"], s["n"]) for s in c["subs"])))
bad = [c for c in COVER if not c["ok"]]
print("覆盖核对:", "全对" if not bad else bad)
