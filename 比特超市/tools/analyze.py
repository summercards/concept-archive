#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从《几猫国产3A大作》单文件原版中，量化并抽取「用代码生成的资产」。

只读原文件，不改动。输出：
  build/tables.json   原样抽取的参数表（未经改写，便于逐字比对）
  build/modules.json  模块体量/耦合度量
用法：
  python3 tools/analyze.py
"""
import json
import os
import re
import sys

SRC = "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "build")

# 业务代码起点：内嵌 Three.js 之后
BIZ_MARK = "var oi={min:new W(-40,0,-30)"


def load():
    with open(SRC, encoding="utf-8") as f:
        return f.read()


def line_col(text, pos):
    line = text.count("\n", 0, pos) + 1
    col = pos - (text.rfind("\n", 0, pos) + 1) + 1
    return line, col


def balanced(text, open_pos):
    """从 open_pos 处的 { 或 [ 开始，返回配平的片段（含首尾括号）。"""
    opener = text[open_pos]
    closer = "}" if opener == "{" else "]"
    depth = 0
    i = open_pos
    in_str = None
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == in_str:
                in_str = None
        elif ch in "\"'`":
            in_str = ch
        elif ch == opener:
            depth += 1
        elif ch == closer:
            depth -= 1
            if depth == 0:
                return text[open_pos:i + 1]
        i += 1
    raise ValueError("unbalanced from %d" % open_pos)


def find_decl(text, name, start=0):
    """定位 `name={` 或 `name=[` 的声明位置（要求前面不是标识符字符）。"""
    for m in re.finditer(re.escape(name) + r"\s*[=:]\s*([\{\[])", text[start:]):
        before = text[start + m.start() - 1] if start + m.start() > 0 else " "
        if re.match(r"[\w$.]", before):
            continue
        return start + m.start() + m.group(0).rindex(m.group(1))
    return -1


def grab(text, name, start=0):
    pos = find_decl(text, name, start)
    if pos < 0:
        return None, None
    return balanced(text, pos), pos


def js_ident_to_json(src):
    """把 JS 对象字面量尽量转成 JSON：去尾逗号、裸标识符当真值标记。"""
    s = re.sub(r"!0\b", "true", src)
    s = re.sub(r"!1\b", "false", s)
    s = re.sub(r",(\s*[}\]])", r"\1", s)
    s = re.sub(r"(\{|,)\s*([A-Za-z_$][\w$]*)\s*:", r'\1"\2":', s)
    s = s.replace("'", '"')
    return s


def numbers_in(src):
    return len(re.findall(r"(?<![\w$.])-?\d+(?:\.\d+)?(?:e[-+]?\d+)?(?![\w.])", src))


def function_anchor(text, name, start=0):
    m = re.search(r"function\s+" + re.escape(name) + r"\s*\(", text[start:])
    return start + m.start() if m else -1


def prop_builder_records(text):
    """追溯 Gi 的全部专用建模器注册，而不是只扫 _i(\"字面量。"""
    records = []

    container = re.search(
        r"for\(let i of\[([^]]+)\]\)_i\(i,\(e,t\)=>M3\(e,i,t\)\)", text
    )
    if container:
        ids = re.findall(r'"([a-z_][\w]*)"', container.group(1))
        reg_pos = container.start()
        for pid in ids:
            records.append({
                "id": pid,
                "group": "container-loop",
                "callback": "M3",
                "registration": container.group(0),
                "registrationAnchor": "L%d:C%d" % line_col(text, reg_pos),
                "functionAnchor": "L%d:C%d" % line_col(text, function_anchor(text, "M3")),
                "sourceAnchors": {
                    "M3": "L%d:C%d" % line_col(text, function_anchor(text, "M3")),
                    "zA": "L%d:C%d" % line_col(text, function_anchor(text, "zA")),
                },
            })

    for m in re.finditer(r'_i\("([a-z_][\w]*)",([A-Za-z_$][\w$]*)\)', text):
        pid, callback = m.groups()
        records.append({
            "id": pid,
            "group": "direct",
            "callback": callback,
            "registration": m.group(0),
            "registrationAnchor": "L%d:C%d" % line_col(text, m.start()),
            "functionAnchor": "L%d:C%d" % line_col(text, function_anchor(text, callback)),
        })

    for group in ("J3", "eb", "sb"):
        m = re.search(r"function\s+" + group + r"\(i\)\{", text)
        if not m:
            continue
        body_start = m.end() - 1
        body = balanced(text, body_start)
        for call in re.finditer(r'i\("([a-z_][\w]*)",', body):
            next_call = re.search(r',i\("', body[call.end():])
            chunk_end = call.end() + (next_call.start() if next_call else len(body[call.end():]))
            chunk = body[call.end():chunk_end]
            arrows = re.findall(
                r'=>\s*(?:\{[\s\S]*?=>\s*)?([A-Za-z_$][\w$]*)\s*\(', chunk
            )
            if not arrows:
                continue
            pid, callback = call.group(1), arrows[-1]
            pos = body_start + call.start()
            records.append({
                "id": pid,
                "group": group,
                "callback": callback,
                "registration": body[call.start():chunk_end].strip(),
                "registrationAnchor": "L%d:C%d" % line_col(text, pos),
                "functionAnchor": "L%d:C%d" % line_col(text, function_anchor(text, callback)),
            })

    seen = {}
    for record in records:
        seen[record["id"]] = record
    return list(seen.values())


# ---------------------------------------------------------------- 参数表抽取
TABLES = [
    # (key, 变量名, 人话名, 类型, 起始搜索位置提示)
    ("world", "oi", "世界尺度与岸线", "env"),
    ("sun", "Mn", "太阳方向/颜色/强度", "env"),
    ("sky", "en", "天空四色与雾色", "env"),
    ("volume", "g", "体积光参数（render 内）", "env"),
    ("quality", "Pr", "五档画质预设", "preset"),
    ("player_scale", "Pi", "玩家尺度与相机 FOV", "preset"),
    ("props", "Gi", "道具尺寸台账", "model"),
    ("material_family", "c3", "材质族：米制尺寸/平铺/凹凸", "material"),
    ("material_instance", "l1", "材质实例：色/粗糙/湿润/脏污", "material"),
    ("player_tuning", "Mt", "玩家运动调参", "number"),
    ("ai_tuning", "Ui", "敌人感知与令牌调参", "number"),
]

# 模块清单：命名空间对象 + 导出
MODULE_HINT = [
    ("lt", "three", "内嵌 Three.js r180"),
    ("Vg", "render", "渲染器/后处理/天空/阴影/体积"),
    ("qg", "mats", "程序材质与 GPU 贴图"),
    ("$g", "props", "道具构造服务"),
    ("cv", "level", "关卡布置"),
    ("mv", "backdrop", "远景背景"),
    ("vv", "ground", "地面与湿地"),
    ("Sv", "fx", "粒子与命中特效"),
    ("Xv", "weapon", "PAC-9 武器与视图模型"),
    ("ex", "enemies", "敌人 AI 与程序骨骼"),
]


def main():
    text = load()
    os.makedirs(OUT, exist_ok=True)
    biz = text.find(BIZ_MARK)
    if biz < 0:
        print("找不到业务起点", file=sys.stderr)
        sys.exit(1)

    # ---- 命名空间位置
    ns_pos = {}
    for ns, role, _desc in MODULE_HINT:
        m = re.search(r"var " + re.escape(ns) + r"=\{\};br\(" + re.escape(ns), text)
        if m:
            ns_pos[ns] = m.start()

    # ---- 模块体量：以命名空间为界
    order = sorted(ns_pos.items(), key=lambda kv: kv[1])
    modules = []
    end_all = len(text)
    for i, (ns, pos) in enumerate(order):
        nxt = order[i + 1][1] if i + 1 < len(order) else None
        # ex(enemies) 之后还有 hud/game，取到 QC 启动器前
        if nxt is None:
            stop = text.find("function hM(", pos)
            nxt = stop if stop > pos else end_all
        seg = text[pos:nxt]
        role = dict((n, r) for n, r, _ in MODULE_HINT)[ns]
        line, col = line_col(text, pos)
        modules.append({
            "ns": ns,
            "role": role,
            "anchor": "L%d:C%d" % (line, col),
            "chars": len(seg),
            "kb": round(len(seg) / 1024, 1),
            "functions": len(re.findall(r"function\s+[\w$]+\s*\(", seg)),
            "numericLiterals": numbers_in(seg),
            "ctxRefs": {
                k: len(re.findall(r"\bi\.(?:%s)\b" % k, seg))
                for k in ("mats", "scene", "events", "render", "physics", "input", "player", "weapon", "camera", "time", "rng", "quality", "level", "hud")
            },
        })

    # ---- 参数表
    tables = {}
    meta = {}
    for key, name, desc, kind in TABLES:
        src, pos = grab(text, name, biz)
        if src is None:
            print("!! 未找到表 %s" % name, file=sys.stderr)
            continue
        line, col = line_col(text, pos)
        tables[key] = src
        meta[key] = {
            "var": name, "label": desc, "kind": kind,
            "anchor": "L%d:C%d" % (line, col),
            "chars": len(src),
            "numericLiterals": numbers_in(src),
            "entries": len(re.findall(r"[{,]\s*[\"']?[A-Za-z_$][\w$]*[\"']?\s*:", src)),
        }

    # ---- 单条资产：道具自定义构造器 / 尺寸台账条目
    props_src = tables.get("props", "[...]")
    gate = re.findall(r"([a-z_][\w]*):\[([\d.\-]+),([\d.\-]+),([\d.\-]+),\"([\w_]+)\",\"([\w_]+)\"\]", props_src)
    prop_ledger = [
        {"id": n, "size": [float(a), float(b), float(c)], "material": mat, "surface": surf}
        for n, a, b, c, mat, surf in gate
    ]
    builder_records = prop_builder_records(text)
    custom = [record["id"] for record in builder_records]

    # ---- 材质实例名
    mat_src = tables.get("material_instance", "")
    mat_names = re.findall(r"[{,]([a-z_][\w]*):(?:Nt|Xa|Zs|Vc|Yl)\(", mat_src)

    fam_src = tables.get("material_family", "")
    fam_names = re.findall(r"([a-z_][\w]*):\{fn:", fam_src)

    # ---- 弹簧组（动画）
    spring = re.search(r"kZ:pa\((\d+),(\d+)\),kP:pa\((\d+),(\d+)\),kY:pa\((\d+),(\d+)\),kR:pa\((\d+),(\d+)\)", text)
    spring_set = None
    if spring:
        v = [int(x) for x in spring.groups()]
        spring_set = {
            "kickZ": [v[0], v[1]], "kickPitch": [v[2], v[3]],
            "kickYaw": [v[4], v[5]], "kickRoll": [v[6], v[7]],
        }

    data = {
        "source": {
            "path": SRC,
            "bytes": len(text.encode("utf-8")),
            "chars": len(text),
            "lines": text.count("\n") + 1,
            "businessStart": "L%d:C%d" % line_col(text, biz),
        },
        "modules": modules,
        "tables": tables,
        "tableMeta": meta,
        "ledger": {
            "props": prop_ledger,
            "propsCustom": custom,
            "propBuilders": builder_records,
            "materialFamilies": fam_names,
            "materialInstances": mat_names,
            "springSet": spring_set,
        },
    }
    with open(os.path.join(OUT, "tables.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    # ---- 控制台摘要
    print("源: %d 行 / %d 字符 / %.1f MB" % (data["source"]["lines"], data["source"]["chars"], data["source"]["chars"] / 1048576))
    print("\n模块体量:")
    for m in modules:
        print("  %-8s %-9s %-12s %6.1f KB  fn=%-4d 数值=%-5d mats=%d" % (
            m["ns"], m["role"], m["anchor"], m["kb"], m["functions"], m["numericLiterals"], m["ctxRefs"]["mats"]))
    print("\n参数表:")
    for k, v in meta.items():
        print("  %-18s %-4s %-12s %6d 字符  %4d 数值  ~%3d 条目" % (k, v["var"], v["anchor"], v["chars"], v["numericLiterals"], v["entries"]))
    print("\n台账: 道具 %d 条（其中自定义几何 %d），材质族 %d，材质实例 %d" % (
        len(prop_ledger), len(custom), len(fam_names), len(mat_names)))
    print("弹簧组:", spring_set)


if __name__ == "__main__":
    main()
