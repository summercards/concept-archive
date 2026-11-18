#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把原工程里的「对象字面量表」解析成 JSON。

这些表都是简单值（数字 / 字符串 / !0 / !1 / 短标识符 / 嵌套数组），
所以不需要完整 JS 解析器，手写一个递归下降就够，且必须逐字符推进，
避免正则在大文件上漏项。
"""
import json
import re


class P:
    def __init__(self, s, i=0):
        self.s = s
        self.i = i

    def ws(self):
        while self.i < len(self.s) and self.s[self.i] in " \n\r\t,":
            self.i += 1

    def value(self):
        self.ws()
        c = self.s[self.i]
        if c == "{":
            return self.obj()
        if c == "[":
            return self.arr()
        if c in "\"'":
            return self.string()
        if c == "`":
            return self.tpl()
        m = re.compile(r"-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?").match(self.s, self.i)
        if m:
            self.i = m.end()
            t = m.group(0)
            return float(t) if ("." in t or "e" in t or "E" in t) else int(t)
        if self.s.startswith("!0", self.i):
            self.i += 2
            return True
        if self.s.startswith("!1", self.i):
            self.i += 2
            return False
        m = re.compile(r"[\w$.]+").match(self.s, self.i)
        if m:
            self.i = m.end()
            t = m.group(0)
            return {"$ref": t}
        raise ValueError("value @%d %r" % (self.i, self.s[self.i:self.i + 24]))

    def string(self):
        q = self.s[self.i]
        j = self.i + 1
        out = []
        while j < len(self.s):
            c = self.s[j]
            if c == "\\":
                out.append(self.s[j + 1])
                j += 2
                continue
            if c == q:
                self.i = j + 1
                return "".join(out)
            out.append(c)
            j += 1
        raise ValueError("unterminated string")

    def tpl(self):
        j = self.i + 1
        while j < len(self.s):
            if self.s[j] == "\\":
                j += 2
                continue
            if self.s[j] == "`":
                self.i = j + 1
                return {"$tpl": self.s[self.i:j]}
            j += 1
        raise ValueError("unterminated template")

    def key(self):
        self.ws()
        c = self.s[self.i]
        if c in "\"'":
            return self.string()
        m = re.compile(r"[\w$]+").match(self.s, self.i)
        if not m:
            raise ValueError("key @%d %r" % (self.i, self.s[self.i:self.i + 20]))
        self.i = m.end()
        return m.group(0)

    def obj(self):
        assert self.s[self.i] == "{"
        self.i += 1
        out = {}
        while True:
            self.ws()
            if self.i >= len(self.s):
                raise ValueError("eof in obj")
            if self.s[self.i] == "}":
                self.i += 1
                return out
            k = self.key()
            self.ws()
            if self.s[self.i] != ":":
                raise ValueError("expect : @%d %r" % (self.i, self.s[self.i:self.i + 20]))
            self.i += 1
            out[k] = self.value()

    def arr(self):
        assert self.s[self.i] == "["
        self.i += 1
        out = []
        while True:
            self.ws()
            if self.s[self.i] == "]":
                self.i += 1
                return out
            out.append(self.value())


def find_obj(src, needle, key=""):
    """找到包含 needle 的对象字面量起点，返回 (start, text)。"""
    i = src.find(needle)
    if i < 0:
        raise SystemExit("找不到 " + needle)
    # 向前找最近的 "={" 或 "({" 边界
    j = src.rfind("={", 0, i)
    st = j + 1
    p = P(src, st)
    return p.obj(), st, p.i


def top_obj_at(src, st):
    p = P(src, st)
    return p.obj(), p.i


def parse_var(src, name, pat=None):
    """按 `name={` 定位并解析。"""
    m = re.search(r"(?:^|[;,]\s*)" + re.escape(name) + r"\s*=\s*\{", src, re.M)
    if not m:
        m = re.search(re.escape(name) + r"\s*=\s*\{", src)
    if not m:
        raise SystemExit("找不到变量 " + name)
    st = src.index("{", m.start())
    p = P(src, st)
    return p.obj(), st, p.i


if __name__ == "__main__":
    src = open("/Users/zyq/work/工程参考/几猫国产3A大作_V1(4).html", encoding="utf-8").read()
    for name in ["Go", "Mt", "h_", "hm", "Zv", "Kv", "Ui", "Yi", "g", "V3", "c3", "Gi"]:
        try:
            o, st, en = parse_var(src, name)
            print(name, len(o), list(o.items())[:2])
        except SystemExit as e:
            print(name, "FAIL", e)
