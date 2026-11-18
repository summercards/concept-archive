#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把原版里被改名的几何函数原样取出，配好别名，落成可 import 的模块。
用途：和 assets/code/modeling-kit.js 做逐顶点比对，证明"抽出来没走形"。
输出：build/orig-geom.mjs
"""
import os

SRC = "/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "orig-geom.mjs")

RAW = open(SRC, encoding="utf-8").read()


def slice_function(sig):
    """按大括号配平，切出 `function xxx(...){...}` 的完整原文。"""
    i = RAW.find(sig)
    if i < 0:
        raise SystemExit("找不到 " + sig)
    j = RAW.find("{", i)
    depth = 0
    k = j
    instr = None
    while k < len(RAW):
        ch = RAW[k]
        if instr:
            if ch == "\\":
                k += 2
                continue
            if ch == instr:
                instr = None
        elif ch in "\"'`":
            instr = ch
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return RAW[i:k + 1]
        k += 1
    raise SystemExit("括号没配平: " + sig)


p3 = slice_function("function p3(")
wi = slice_function("function Wi(")
ot = slice_function("function ot(")
fn = slice_function("function Fn(")
je_src = slice_function("function je(")
lc = slice_function("function Lc(")
ii = slice_function("function Ii(")

header = """// 由 tools/stash.py 生成：原版几何函数的原字节 + 别名映射。
// 不要手改。对照目标：assets/code/modeling-kit.js
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const nt = THREE.BufferGeometry;
const et = THREE.Float32BufferAttribute;
const W = THREE.Vector3;
const Ys = THREE.CylinderGeometry;
const un = THREE.BoxGeometry;
const Jr = THREE.CatmullRomCurve3;
const Kr = THREE.TubeGeometry;
const Lt = THREE.Quaternion;
const Ye = THREE.Matrix4;
const In = THREE.Euler;
const sa = mergeGeometries;
const oa = new THREE.Vector3();
// je() 用的模块级临时对象，原版是共享变量，这里原样复刻
var f1 = new In, Fc = new Lt, g3 = new Ye, d1 = new W, p1 = new W(1, 1, 1);

"""

body = "\n\n".join([p3, wi, ot, fn, je_src, lc, ii])

exports = """\nexport const metricBox = p3;
export const bevelBox = Wi;
export const cylinder = ot;
export const tube = Fn;
export const place = je;
export const vertexColor = Lc;
export const merge = Ii;
"""

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(header + body + exports)
print("已写出", OUT, os.path.getsize(OUT), "bytes")
