#!/usr/bin/env python3
"""构建独立的原创资产账本，不修改或替代原版 DB。

仅接受可信本地代码；静态 AST 约束不是安全沙箱。需要 Node 内置 Acorn，
不安装第三方依赖，不执行作者模块。build(ctx, options = {}) 应返回
THREE.Object3D，交互、更新和清理 hooks 放在 root.userData 中，不返回 {root}。
尺寸、部件、碰撞和返回值的真实性须另行运行时验收，本工具不签发 PASS。

隔离测试：--root 指向临时项目，准备 assets/authored/*.js 及当前
assets/code/material-ledger.js；--registry 可指向绝对路径 fixture，
--output 指向项目内已有父目录，--check 完成全部静态检查但不写文件。
"""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile


# 只读解析源代码。位置裁剪在 JS 内完成，避免 UTF-16 与 Python 字符索引差异。
PARSER = r'''
const fs = require('node:fs');
let acorn;
try { acorn = require('internal/deps/acorn/acorn/dist/acorn'); }
catch (_) { throw new Error('需要提供内置 Acorn 的 Node（使用 --expose-internals），不回退到正则替换'); }
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const parse = (text) => acorn.parse(text, {ecmaVersion: 'latest', sourceType: 'module'});
const key = (node) => node && (node.type === 'Identifier' ? node.name : node.value);
const fail = (message) => { throw new Error(message); };
function materialIds(text) {
  const ast = parse(text);
  let instances, ids;
  for (const node of ast.body) {
    const d = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
    if (!d || d.type !== 'VariableDeclaration') continue;
    for (const v of d.declarations) {
      if (v.id.name === 'INSTANCES') instances = v.init;
      if (v.id.name === 'INSTANCE_IDS') ids = v.init;
    }
  }
  if (!instances || instances.type !== 'ObjectExpression' ||
      !ids || ids.type !== 'CallExpression' || ids.optional ||
      ids.callee.type !== 'MemberExpression' || ids.callee.computed ||
      ids.callee.object.name !== 'Object' || ids.callee.property.name !== 'keys' ||
      ids.arguments.length !== 1 || ids.arguments[0].name !== 'INSTANCES')
    fail('材质账本需使用 INSTANCES 对象及 INSTANCE_IDS = Object.keys(INSTANCES)；请显式适配新格式');
  return instances.properties.map(p => {
    if (p.type !== 'Property' || p.computed || p.kind !== 'init' || typeof key(p.key) !== 'string')
      fail('材质 INSTANCES 含无法静态读取的键');
    return key(p.key);
  });
}
const globals = new Set([
  'undefined', 'NaN', 'Infinity', 'Math', 'Number', 'String', 'Boolean', 'Object',
  'Array', 'Map', 'Set', 'WeakMap', 'WeakSet', 'JSON', 'RegExp', 'Error', 'TypeError',
  'RangeError', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
  'Int32Array', 'Uint32Array', 'parseInt', 'parseFloat', 'isFinite', 'isNaN'
]);
function transform(text) {
  const ast = parse(text);
  if (ast.body.length !== 1 || ast.body[0].type !== 'ExportNamedDeclaration')
    fail('模块只能包含 export function build(ctx, options = {})，辅助定义请放入函数内部');
  const ex = ast.body[0], fn = ex.declaration;
  if (!fn || fn.type !== 'FunctionDeclaration' || fn.id.name !== 'build' ||
      fn.async || fn.generator || fn.params.length !== 2 ||
      fn.params[0].type !== 'Identifier' || fn.params[0].name !== 'ctx' ||
      fn.params[1].type !== 'AssignmentPattern' || fn.params[1].left.name !== 'options' ||
      fn.params[1].right.type !== 'ObjectExpression' || fn.params[1].right.properties.length)
    fail('入口必须为同步 export function build(ctx, options = {})');
  const references = [];
  const scope = (parent, isFunction = false) => ({parent, isFunction, names: new Set()});
  const root = scope(null, true);
  function children(node, visit) {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'start' || k === 'end' || k === 'type') continue;
      if (Array.isArray(v)) { for (const x of v) if (x && x.type) visit(x); }
      else if (v && v.type) visit(v);
    }
  }
  function bind(p, target, current) {
    if (!p) return;
    if (p.type === 'Identifier') target.names.add(p.name);
    else if (p.type === 'RestElement') bind(p.argument, target, current);
    else if (p.type === 'AssignmentPattern') { bind(p.left, target, current); walk(p.right, current, p); }
    else if (p.type === 'ArrayPattern') p.elements.forEach(x => bind(x, target, current));
    else if (p.type === 'ObjectPattern') for (const prop of p.properties) {
      if (prop.computed) walk(prop.key, current, prop);
      bind(prop.type === 'RestElement' ? prop.argument : prop.value, target, current);
    }
  }
  function walk(n, s, parent) {
    if (!n) return;
    if (n.type.startsWith('Import') || n.type.startsWith('Export') || n.type === 'MetaProperty')
      fail('不允许 import、其他 export 或 import.meta');
    const literal = n.type === 'Literal' && typeof n.value === 'string' ? n.value :
      n.type === 'TemplateElement' ? n.value.cooked || n.value.raw : null;
    if (literal !== null && /^(?:https?:|wss?:|ftp:|file:|data:|blob:|\/\/)/i.test(literal.trim()))
      fail('不允许外部 URL；资源依赖须通过 ctx 注入');
    if (n.type === 'Identifier') {
      references.push([n.name, s]);
      if (n.name === 'Math') {
        const property = parent && parent.type === 'MemberExpression' && parent.object === n &&
          (!parent.computed ? parent.property.name :
            parent.property.type === 'Literal' ? parent.property.value : null);
        if (!property || property === 'random') fail('不允许 Math.random 或间接取用 Math；请使用确定性构造');
      }
      return;
    }
    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(n.type)) {
      if (n.type === 'FunctionDeclaration' && n.id) s.names.add(n.id.name);
      const local = scope(s, true);
      if (n.id) local.names.add(n.id.name);
      if (n.type !== 'ArrowFunctionExpression') local.names.add('arguments');
      n.params.forEach(p => bind(p, local, local));
      walk(n.body, local, n);
      return;
    }
    if (n.type === 'BlockStatement' || n.type === 'StaticBlock' ||
        ['ForStatement', 'ForInStatement', 'ForOfStatement', 'SwitchStatement'].includes(n.type)) {
      const local = scope(s);
      children(n, x => walk(x, local, n));
      return;
    }
    if (n.type === 'CatchClause') {
      const local = scope(s);
      bind(n.param, local, local);
      walk(n.body, local, n);
      return;
    }
    if (n.type === 'VariableDeclaration') {
      let target = s;
      if (n.kind === 'var') while (!target.isFunction) target = target.parent;
      for (const d of n.declarations) { bind(d.id, target, s); walk(d.init, s, d); }
      return;
    }
    if (n.type === 'ClassDeclaration' || n.type === 'ClassExpression') {
      if (n.type === 'ClassDeclaration' && n.id) s.names.add(n.id.name);
      const local = scope(s);
      if (n.id) local.names.add(n.id.name);
      walk(n.superClass, s, n);
      walk(n.body, local, n);
      return;
    }
    if (n.type === 'MemberExpression') {
      walk(n.object, s, n);
      if (n.computed) walk(n.property, s, n);
      return;
    }
    if (['Property', 'MethodDefinition', 'PropertyDefinition'].includes(n.type)) {
      if (n.computed) walk(n.key, s, n);
      walk(n.value, s, n);
      return;
    }
    if (n.type === 'LabeledStatement') { walk(n.body, s, n); return; }
    if (n.type === 'BreakStatement' || n.type === 'ContinueStatement' || n.type === 'PrivateIdentifier') return;
    if (n.type === 'ThisExpression' && s === root) fail('不允许顶层 this');
    children(n, x => walk(x, s, n));
  }
  walk(fn, root, null);
  for (const [name, start] of references) {
    let s = start;
    while (s && !s.names.has(name)) s = s.parent;
    if (!s && !globals.has(name)) fail(`未注入的外部依赖 ${name}；请通过 ctx 传入`);
  }
  // 仅删除 AST 定位到的唯一 export 前缀，保留注释、字符串及函数全文。
  return text.slice(0, ex.start) + text.slice(fn.start);
}
try {
  const ids = materialIds(input.ledger);
  const bodies = input.modules.map(m => {
    try { return transform(m.code); }
    catch (e) { fail(`${m.source}: ${e.message}`); }
  });
  process.stdout.write(JSON.stringify({ids, bodies}));
} catch (e) {
  process.stderr.write(`AST 校验失败：${e.message}\n`);
  process.exitCode = 1;
}
'''


class BuildError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise BuildError(message)


def load_json(path):
    def pairs(entries):
        result = {}
        for key, value in entries:
            require(key not in result, f"JSON 出现重复字段：{key}")
            result[key] = value
        return result

    def invalid(value):
        raise BuildError(f"JSON 不允许非有限值：{value}")

    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=pairs,
                      parse_constant=invalid)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def string_list(value):
    return isinstance(value, list) and all(text(v) for v in value) and len(set(value)) == len(value)


def contained(path, parent, label):
    resolved = path.resolve(strict=True)
    require(resolved.is_relative_to(parent), f"{label} 路径或符号链接逃逸：{path}")
    return resolved


def validate_entry(entry, index, ids, sources):
    label = f"assets[{index}]"
    require(isinstance(entry, dict), f"{label} 必须是对象")
    aid = entry.get("id")
    require(isinstance(aid, str) and re.fullmatch(r"new\.[a-z0-9]+(?:-[a-z0-9]+)*", aid),
            f"{label}.id 必须为 new.<小写连字符slug>")
    slug = aid[4:]
    require(aid not in ids, f"重复 id：{aid}")
    ids.add(aid)
    source = entry.get("source")
    require(source == f"{slug}.js", f"{aid}.source 必须为 {slug}.js，禁止目录或路径逃逸")
    require(source not in sources, f"重复 source：{source}")
    sources.add(source)
    require(text(entry.get("name")) and re.search(r"[\u3400-\u9fff]", entry["name"]),
            f"{aid}.name 必须含中文名称")
    require(text(entry.get("summary")), f"{aid}.summary 必须是非空字符串")
    require(string_list(entry.get("tags")), f"{aid}.tags 必须是无重复的字符串数组")
    c = entry.get("contract")
    require(isinstance(c, dict), f"{aid}.contract 缺失或不是对象")
    for key, expected in (("units", "m"), ("origin", "bottom-center"),
                          ("forward", "+Z"), ("qualityTier", "catalog")):
        require(c.get(key) == expected, f"{aid}.contract.{key} 必须为 {expected}")
    size = c.get("size")
    require(isinstance(size, list) and len(size) == 3 and all(
        type(n) in (int, float) and math.isfinite(n) and n > 0 for n in size),
        f"{aid}.contract.size 必须是三个有限正数（米），不能用布尔值")
    for key in ("materials", "requiredParts"):
        require(string_list(c.get(key)) and bool(c[key]),
                f"{aid}.contract.{key} 必须是非空、无重复字符串数组")
    require(isinstance(c.get("options"), dict), f"{aid}.contract.options 必须是对象")
    require(c.get("collidersRequired") is True, f"{aid}.contract.collidersRequired 必须为 true")
    baseline = c.get("baseline")
    require(isinstance(baseline, dict) and baseline.get("type") == "new-design",
            f"{aid}.contract.baseline.type 必须为 new-design，不得冒用原版基线")
    acceptance = entry.get("acceptance")
    fields = {"catalog", "geometry", "visual", "runtime"}
    require(isinstance(acceptance, dict) and set(acceptance) == fields and
            all(acceptance[k] == "unverified" for k in fields),
            f"{aid}.acceptance 四项必须均为 unverified；PASS 须由另行绑定证据的验收流程签发")
    evidence = entry.get("evidence")
    if evidence is not None:
        require(isinstance(evidence, dict) and text(evidence.get("report")), f"{aid}.evidence.report 必须是项目内报告路径")
        report = evidence["report"]
        require(re.fullmatch(r"outputs/[A-Za-z0-9._/-]+\.(?:html|json)", report) is not None and
                all(part not in (".", "..") for part in Path(report).parts),
                f"{aid}.evidence.report 只允许 outputs 内本地 HTML/JSON，禁止 URL 和路径逃逸")
    return slug


def run_node(node, args, source):
    try:
        result = subprocess.run([node, *args], input=source, text=True,
                                encoding="utf-8", capture_output=True, timeout=60)
    except subprocess.TimeoutExpired as exc:
        raise BuildError("Node 静态校验超时（未执行作者模块）") from exc
    require(result.returncode == 0, result.stderr.strip() or "Node 静态校验失败")
    return result.stdout


def render(entries, modules, bodies):
    items, chunks = [], []
    for entry, module, body in zip(entries, modules, bodies):
        aid, c = entry["id"], entry["contract"]
        chunks.append(f"window.AUTHORED_BUILDERS[{js_json(aid)}] = (function () {{\n"
                      f"{body}\n;\nreturn {{ build }};\n}})();\n")
        items.append({
            "id": aid, "cat": "NEW", "sub": "原创模型", "name": entry["name"],
            "en": aid[4:], "kind": "authored", "focus": {"asset": aid, "options": {}},
            "params": [["尺寸（米）", " × ".join(map(str, c["size"]))],
                       ["原点", c["origin"]], ["朝向", c["forward"]],
                       ["材质", ", ".join(c["materials"])],
                       ["必要部件", ", ".join(c["requiredParts"])]],
            "summary": entry["summary"], "anchor": f"assets/authored/{entry['source']}",
            "source": entry["source"], "code": module["code"], "tags": entry["tags"],
            "contract": c,
            "acceptance": entry["acceptance"], "sourceHash": module["sourceHash"],
            "evidence": entry.get("evidence", {}),
        })
    catalog = {
        "meta": {"schemaVersion": 1, "total": len(items), "source": "authored",
                 "trust": "仅限可信本地代码；静态校验不是安全沙箱",
                 "returnType": "THREE.Object3D", "hooks": "root.userData",
                 "verification": "未进行几何、视觉或运行时验收"},
        "cats": [{"id": "NEW", "name": "原创资产", "desc": "独立原创注册账本，非原版资产",
                  "color": "--model", "n": len(items),
                  "subs": [{"name": "原创模型", "n": len(items)}]}],
        "items": items,
    }
    return ("// 由 tools/build_authored.py 生成；仅限可信本地代码，不替代 window.DB。\n"
            "// build(ctx, options) 返回 THREE.Object3D，hooks 位于 userData；真实性另行验收。\n"
            '"use strict";\nwindow.AUTHORED_BUILDERS = Object.create(null);\n' +
            "\n".join(chunks) + "window.AUTHORED_CATALOG = " + js_json(catalog) + ";\n")


def js_json(value):
    # 经典脚本可独立载入；转义也允许调用方安全放进内联 script。
    return json.dumps(value, ensure_ascii=False, allow_nan=False, indent=2).replace(
        "<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent,
                        help="项目根目录（默认脚本所在 tools 的父目录）")
    parser.add_argument("--registry", type=Path, help="隔离测试注册表，必须是绝对路径")
    parser.add_argument("--output", type=Path, help="输出路径，须在项目内；相对路径基于 root")
    parser.add_argument("--check", action="store_true", help="只做静态校验，不写任何文件")
    args = parser.parse_args(argv)
    try:
        root = args.root.resolve(strict=True)
        require(root.is_dir(), f"root 不是目录：{root}")
        authored = contained(root / "assets" / "authored", root, "authored 目录")
        require(authored.is_dir(), f"authored 不是目录：{authored}")
        # 不允许把整个 authored 目录链接到项目的其他位置。
        require(authored == root / "assets" / "authored", "assets/authored 目录不得经过重定向符号链接")
        if args.registry is not None:
            require(args.registry.is_absolute(), "--registry 必须为绝对路径")
            registry = args.registry.resolve(strict=True)
        else:
            registry = contained(authored / "registry.json", authored, "registry")
        ledger = contained(root / "assets" / "code" / "material-ledger.js", root, "材质账本")
        data = load_json(registry)
        require(isinstance(data, dict) and type(data.get("schemaVersion")) is int and
                data["schemaVersion"] == 1 and isinstance(data.get("assets"), list),
                "registry 必须包含 schemaVersion: 1 和 assets 数组")
        entries = data["assets"]
        ids, sources, modules, inputs = set(), set(), [], {registry, ledger, Path(__file__).resolve()}
        for i, entry in enumerate(entries):
            validate_entry(entry, i, ids, sources)
            path = contained(authored / entry["source"], authored, entry["id"] + " source")
            require(path.is_file(), f"source 不是文件：{path}")
            require(path not in inputs, f"source 指向重复的实际文件或构建输入：{path}")
            inputs.add(path)
            raw = path.read_bytes()
            modules.append({"source": entry["source"], "code": raw.decode("utf-8"),
                            "sourceHash": hashlib.sha256(raw).hexdigest()})
        output = args.output or Path("assets/authored.js")
        if not output.is_absolute():
            output = root / output
        parent = contained(output.parent, root, "output 父目录")
        require(parent.is_dir(), f"output 父路径不是目录：{parent}")
        require(not output.is_symlink(), f"output 不得为符号链接：{output}")
        output = parent / output.name
        require(output not in inputs and not output.is_relative_to(authored),
                f"output 不得覆盖构建输入或 authored 源目录：{output}")
        require(not output.exists() or output.is_file(), f"output 不是普通文件：{output}")
        node = shutil.which("node")
        require(node is not None, "找不到 node；请安装支持内置 Acorn 的 Node")
        parsed = json.loads(run_node(node, ["--expose-internals", "-e", PARSER], json.dumps(
            {"ledger": ledger.read_text(encoding="utf-8"), "modules": modules}, ensure_ascii=False)))
        known_materials = set(parsed["ids"])
        for entry in entries:
            unknown = set(entry["contract"]["materials"]) - known_materials
            require(not unknown, f"{entry['id']} 引用了未知材质 INSTANCE_IDS：{', '.join(sorted(unknown))}")
        result = render(entries, modules, parsed["bodies"])
        run_node(node, ["--check", "--input-type=commonjs"], result)
        if args.check:
            print(f"静态校验通过：{len(entries)} 项；未执行作者代码，未写文件，acceptance 未升级")
            return 0
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="\n",
                                             prefix=".authored-", suffix=".tmp", dir=parent,
                                             delete=False) as handle:
                temporary = Path(handle.name)
                handle.write(result)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, output)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
        print(f"已构建 {len(entries)} 项：{output}；未执行作者代码，acceptance 未升级")
        return 0
    except (BuildError, OSError, ValueError) as exc:
        print(f"原创资产构建失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
