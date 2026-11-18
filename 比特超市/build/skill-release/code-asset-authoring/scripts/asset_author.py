#!/usr/bin/env python3
"""原创 CODE ASSET LEDGER 资产脚手架、静态检查与单资产打包工具。"""

from __future__ import annotations

import argparse
import copy
import html
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile


SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = SKILL_DIR / "assets" / "asset-contract.template.json"
SOURCE_TEMPLATE_PATH = SKILL_DIR / "assets" / "model-template.js"
BUILDER_NAME = "build_authored.py"
ASSET_ID_RE = re.compile(r"^new\.([a-z0-9]+(?:-[a-z0-9]+)*)$")


class CliError(Exception):
    """用户可处理的 CLI 错误。"""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise CliError(message)


def json_load(path: Path):
    def reject_constant(value):
        raise CliError(f"JSON 不允许非有限值：{path}::{value}")

    try:
        return json.loads(path.read_text(encoding="utf-8"), parse_constant=reject_constant)
    except CliError:
        raise
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise CliError(f"无法读取 JSON：{path}：{exc}") from exc


def write_json(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n"


def resolved_root(value) -> Path:
    require(value is not None, "--root 必须显式提供")
    path = Path(value)
    require(path.is_absolute(), "--root 必须是绝对路径")
    try:
        root = path.resolve(strict=True)
    except OSError as exc:
        raise CliError(f"无法解析 root：{path}：{exc}") from exc
    require(root.is_dir(), f"root 不是目录：{root}")
    return root


def contained(path: Path, root: Path, label: str, *, must_exist: bool = False) -> Path:
    try:
        resolved = path.resolve(strict=must_exist)
    except OSError as exc:
        raise CliError(f"{label} 无法解析：{path}：{exc}") from exc
    require(resolved == root or root in resolved.parents, f"{label} 路径或符号链接逃逸：{path}")
    return resolved


def existing_file(path: Path, root: Path, label: str) -> Path:
    resolved = contained(path, root, label, must_exist=True)
    require(resolved.is_file(), f"{label} 不是文件：{path}")
    return resolved


def existing_dir(path: Path, root: Path, label: str) -> Path:
    resolved = contained(path, root, label, must_exist=True)
    require(resolved.is_dir(), f"{label} 不是目录：{path}")
    return resolved


def future_path(path: Path, root: Path, label: str) -> Path:
    resolved = contained(path, root, label, must_exist=False)
    require(not path.exists() and not path.is_symlink(), f"{label} 已存在，拒绝覆盖：{path}")
    return resolved


def read_project_files(root: Path) -> dict:
    index = existing_file(root / "index.html", root, "index.html")
    builder = existing_file(root / "tools" / BUILDER_NAME, root, "项目构建器")
    modeling_kit = existing_file(root / "assets" / "code" / "modeling-kit.js", root, "modeling-kit")
    material_ledger = existing_file(root / "assets" / "code" / "material-ledger.js", root, "material-ledger")
    authored = existing_dir(root / "assets" / "authored", root, "assets/authored")
    require(authored == root / "assets" / "authored", "assets/authored 目录不得经过符号链接重定向")
    registry = existing_file(authored / "registry.json", root, "authored registry")
    return {
        "index": index,
        "builder": builder,
        "modelingKit": modeling_kit,
        "materialLedger": material_ledger,
        "authored": authored,
        "registry": registry,
    }


def registry_data(path: Path) -> dict:
    data = json_load(path)
    require(
        isinstance(data, dict)
        and type(data.get("schemaVersion")) is int
        and data["schemaVersion"] == 1
        and isinstance(data.get("assets"), list),
        "registry 必须包含 schemaVersion: 1 和 assets 数组",
    )
    return data


def title_from_index(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"<title(?:\s[^>]*)?>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
    return html.unescape(re.sub(r"\s+", " ", match.group(1)).strip()) if match else None


def actual_three_revision(root: Path) -> str | None:
    vendor = root / "vendor" / "three.global.js"
    if not vendor.is_file():
        return None
    text = vendor.read_text(encoding="utf-8", errors="replace")
    match = re.search(r"(?:const|var)\s+REVISION\s*=\s*['\"](\d+)['\"]", text)
    return f"r{match.group(1)}" if match else None


def node_info() -> dict:
    node = shutil.which("node")
    if not node:
        return {"available": False, "path": None, "version": None}
    try:
        result = subprocess.run(
            [node, "--version"], capture_output=True, text=True, encoding="utf-8", timeout=10
        )
        version = result.stdout.strip() if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        version = None
    return {"available": version is not None, "path": str(Path(node).resolve()), "version": version}


def builtin_acorn_info(node: dict) -> dict:
    if not node["available"]:
        return {"available": False, "detail": "Node 不可用"}
    try:
        result = subprocess.run(
            [node["path"], "--expose-internals", "-e", "require('internal/deps/acorn/acorn/dist/acorn')"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"available": False, "detail": str(exc)}
    return {
        "available": result.returncode == 0,
        "detail": result.stderr.strip() if result.returncode else "internal/deps/acorn 可加载",
    }


def playwright_info(value) -> dict:
    if value is None:
        return {"provided": False, "path": None, "available": False}
    path = Path(value)
    require(path.is_absolute(), "--playwright 必须是绝对路径")
    resolved = contained(path, Path("/"), "Playwright", must_exist=True)
    return {"provided": True, "path": str(resolved), "available": resolved.exists()}


def doctor(args) -> dict:
    root = resolved_root(args.root)
    required = None
    errors = []
    try:
        required = read_project_files(root)
        title = title_from_index(required["index"])
        data = registry_data(required["registry"])
    except CliError as exc:
        errors.append(str(exc))
        title = None
        data = None

    identity = {
        "indexTitle": title,
        "titleContainsCodeAssetLedger": bool(title and "CODE ASSET LEDGER" in title),
        "registrySchema": "schemaVersion/assets" if data is not None else None,
        "sameHostRootRecognized": bool(
            title and "CODE ASSET LEDGER" in title and required is not None and data is not None
        ),
    }
    node = node_info()
    acorn = builtin_acorn_info(node)
    try:
        playwright = playwright_info(args.playwright)
    except CliError as exc:
        errors.append(str(exc))
        playwright = {"provided": args.playwright is not None, "path": None, "available": False}

    revision = actual_three_revision(root)
    if revision is None:
        errors.append("未能从 root/vendor/three.global.js 读取实际 Three.js revision")
    elif revision != "r160":
        errors.append(f"宿主实际 Three.js 为 {revision}，不是本项目记录的 r160")

    if required is None:
        files = {}
    else:
        files = {key: str(value) for key, value in required.items()}

    ready = not errors and identity["sameHostRootRecognized"] and node["available"] and acorn["available"] and revision == "r160"
    return {
        "ok": True,
        "command": "doctor",
        "ready": ready,
        "root": str(root),
        "identity": identity,
        "files": files,
        "node": node,
        "builtinAcorn": acorn,
        "playwright": playwright,
        "threeRevision": revision,
        "errors": errors,
        "readOnly": True,
        "scannedOutsideRoot": False,
    }


def parse_id(value: str) -> tuple[str, str]:
    match = ASSET_ID_RE.fullmatch(value or "")
    require(match is not None, "--id 必须匹配 new.<小写字母/数字/连字符 slug>")
    return value, match.group(1)


def parse_csv(value: str, label: str) -> list[str]:
    items = [item.strip() for item in (value or "").split(",")]
    require(items and all(items), f"{label} 必须是逗号分隔的非空字符串列表")
    require(len(set(items)) == len(items), f"{label} 不得包含重复项")
    require(all(re.fullmatch(r"[A-Za-z0-9_.-]+", item) for item in items), f"{label} 含非法标识符")
    return items


def size_values(value: str) -> list[float]:
    parts = [item.strip() for item in value.split(",")]
    require(len(parts) == 3 and all(parts), "--size 必须使用 width,height,depth 三个逗号分隔数值")
    try:
        values = [float(item) for item in parts]
    except ValueError as exc:
        raise CliError("--size 必须是三个数值，例如 1.2,1.8,0.5") from exc
    require(all(math.isfinite(item) and item > 0 for item in values), "--size 必须是三个有限正数")
    return values


def chinese_name(value: str | None, slug: str) -> str:
    if value is None:
        return f"原创资产 {slug}（设计草稿）"
    require(value.strip() and re.search(r"[\u3400-\u9fff]", value), "--name 必须是包含中文的非空名称")
    return value.strip()


def make_source(asset_id: str) -> str:
    try:
        source = SOURCE_TEMPLATE_PATH.read_text(encoding="utf-8")
    except OSError as exc:
        raise CliError(f"无法读取模型模板：{SOURCE_TEMPLATE_PATH}：{exc}") from exc
    source = source.replace("opts", "options").replace("'new.<slug>'", repr(asset_id))
    require("export function build(ctx, options = {})" in source, "模型模板未提供实际 build(ctx, options = {}) 入口")
    return source if source.endswith("\n") else source + "\n"


def make_contract(asset_id: str, slug: str, name: str, size: list[float], materials: list[str], parts: list[str]) -> dict:
    try:
        contract = json_load(TEMPLATE_PATH)
    except CliError as exc:
        raise CliError(f"无法读取完整契约模板：{exc}") from exc
    require(isinstance(contract, dict), "契约模板必须是对象")
    entry = contract.get("registryEntry")
    require(isinstance(entry, dict), "契约模板缺少 registryEntry")
    entry["id"] = asset_id
    entry["source"] = f"{slug}.js"
    entry["name"] = name
    entry["summary"] = f"{name}；尚未实现几何，未进行 runtime/visual 验收。"
    entry["tags"] = ["原创", "程序化资产"]
    entry_contract = entry.get("contract")
    require(isinstance(entry_contract, dict), "契约模板缺少 registryEntry.contract")
    entry_contract["size"] = size
    entry_contract["materials"] = materials
    entry_contract["requiredParts"] = parts
    design = contract.get("designContract")
    require(isinstance(design, dict), "契约模板缺少 designContract")
    coordinate = design.get("coordinateSystem")
    require(isinstance(coordinate, dict), "契约模板缺少 coordinateSystem")
    coordinate["size"] = size
    width, height, depth = size
    coordinate["nominalBounds"] = {
        "min": [-width / 2, 0, -depth / 2],
        "max": [width / 2, height, depth / 2],
    }
    coordinate["protrusionsAndMotionEnvelope"] = None
    contract["designStatus"] = "draft-unimplemented"
    functional = []
    for part in parts:
        functional.append({"name": part, "role": "待实现的原创几何部件", "parent": "root", "sizeM": None, "positionM": None})
    design["functionalParts"] = functional
    surface = design.get("surfaceAndUV")
    require(isinstance(surface, dict), "契约模板缺少 surfaceAndUV")
    surface["materialSpecifications"] = [
        {"id": material, "status": "unverified", "note": "待按宿主材质账本核对"} for material in materials
    ]
    contract["assetId"] = asset_id
    return contract


def atomic_create(path: Path, content: str) -> None:
    parent = path.parent
    require(parent.is_dir(), f"写入父目录不存在：{parent}")
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="\n", prefix=f".{path.name}.", suffix=".tmp", dir=parent, delete=False
        ) as handle:
            temporary = Path(handle.name)
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        require(not path.exists() and not path.is_symlink(), f"写入目标已出现，拒绝覆盖：{path}")
        os.link(temporary, path)
    except FileExistsError as exc:
        raise CliError(f"写入目标已存在，拒绝覆盖：{path}") from exc
    except OSError as exc:
        raise CliError(f"原子创建失败：{path}：{exc}") from exc
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def atomic_replace(path: Path, content: str) -> None:
    require(path.is_file() and not path.is_symlink(), f"registry 必须是普通文件且不能是符号链接：{path}")
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="\n", prefix=f".{path.name}.", suffix=".tmp", dir=path.parent, delete=False
        ) as handle:
            temporary = Path(handle.name)
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
        temporary = None
    except OSError as exc:
        raise CliError(f"registry 原子更新失败：{path}：{exc}") from exc
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def entry_for_id(data: dict, asset_id: str) -> dict:
    entries = data["assets"]
    matches = [entry for entry in entries if isinstance(entry, dict) and entry.get("id") == asset_id]
    require(len(matches) == 1, f"registry 中必须恰好存在一个 id：{asset_id}")
    return matches[0]


def source_for_entry(paths: dict, entry: dict, asset_id: str, root: Path) -> Path:
    slug = asset_id[4:]
    source = entry.get("source")
    require(source == f"{slug}.js", f"{asset_id}.source 必须为 {slug}.js")
    require(isinstance(source, str) and "/" not in source and "\\" not in source, "source 不得包含目录")
    return existing_file(paths["authored"] / source, root, f"{asset_id} source")


def contract_for_asset(paths: dict, asset_id: str, root: Path) -> Path:
    slug = asset_id[4:]
    return existing_file(paths["authored"] / "contracts" / f"{slug}.json", root, f"{asset_id} 完整契约")


def validate_full_contract(path: Path, asset_id: str, entry: dict) -> dict:
    contract = json_load(path)
    require(isinstance(contract, dict), f"完整契约不是对象：{path}")
    require(contract.get("assetId") == asset_id, f"完整契约 assetId 不匹配：{path}")
    contract_entry = contract.get("registryEntry")
    require(isinstance(contract_entry, dict) and contract_entry.get("id") == asset_id, f"完整契约 registryEntry.id 不匹配：{path}")
    require(contract_entry.get("source") == entry.get("source"), f"完整契约 source 不匹配：{path}")
    require(contract_entry.get("contract") == entry.get("contract"), f"完整契约的 registryEntry.contract 与 registry 不一致：{path}")
    for key in ("designContract", "verificationPlan", "evidence"):
        require(key in contract, f"完整契约缺少字段 {key}：{path}")
    return contract


def validate_asset_target(root: Path, asset_id: str) -> tuple[dict, dict, Path, Path]:
    paths = read_project_files(root)
    data = registry_data(paths["registry"])
    entry = entry_for_id(data, asset_id)
    source = source_for_entry(paths, entry, asset_id, root)
    contract_path = contract_for_asset(paths, asset_id, root)
    contract = validate_full_contract(contract_path, asset_id, entry)
    return paths, data, source, contract_path


def builder_run(root: Path, builder: Path, *, check: bool) -> dict:
    command = [sys.executable, "-B", str(builder), "--root", str(root)]
    if check:
        command.append("--check")
    try:
        result = subprocess.run(
            command,
            cwd=root,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=120,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise CliError(f"项目构建器调用失败：{exc}") from exc
    info = {
        "command": command,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }
    require(result.returncode == 0, f"项目构建器失败：{result.stderr.strip() or result.stdout.strip()}")
    return info


def check_asset(root: Path, asset_id: str) -> dict:
    paths, data, source, contract_path = validate_asset_target(root, asset_id)
    builder = builder_run(root, paths["builder"], check=True)
    return {
        "ok": True,
        "command": "check",
        "root": str(root),
        "id": asset_id,
        "source": str(source),
        "contract": str(contract_path),
        "message": "静态通过; runtime/visual未执行",
        "runtime": "未执行",
        "visual": "未执行",
        "acceptance": data["assets"][data["assets"].index(entry_for_id(data, asset_id))].get("acceptance"),
        "builder": builder,
        "executedAuthorCode": False,
    }


def scaffold(args) -> dict:
    root = resolved_root(args.root)
    asset_id, slug = parse_id(args.id)
    name = chinese_name(args.name, slug)
    size = size_values(args.size) if args.size is not None else [1.2, 1.8, 0.5]
    materials = parse_csv(args.materials, "--materials") if args.materials else ["paint_grey", "steel_dark"]
    parts = parse_csv(args.parts, "--parts") if args.parts else ["frame", "panel"]
    paths = read_project_files(root)
    data = registry_data(paths["registry"])
    existing_ids = [entry.get("id") for entry in data["assets"] if isinstance(entry, dict)]
    existing_sources = [entry.get("source") for entry in data["assets"] if isinstance(entry, dict)]
    require(asset_id not in existing_ids, f"registry 已有 id，拒绝覆盖：{asset_id}")
    require(f"{slug}.js" not in existing_sources, f"registry 已有 source，拒绝覆盖：{slug}.js")

    contracts_dir = paths["authored"] / "contracts"
    contracts_dir_resolved = contained(contracts_dir, root, "contracts 目录", must_exist=False)
    if contracts_dir.exists() or contracts_dir.is_symlink():
        existing_dir(contracts_dir, root, "contracts 目录")
    source_path = future_path(paths["authored"] / f"{slug}.js", root, "source")
    contract_path = future_path(contracts_dir / f"{slug}.json", root, "完整契约")
    require(paths["authored"].is_dir() and contracts_dir_resolved.parent.is_dir(), "scaffold 父目录未就绪")

    source = make_source(asset_id)
    contract = make_contract(asset_id, slug, name, size, materials, parts)
    entry = copy.deepcopy(contract["registryEntry"])
    require(entry["id"] == asset_id and entry["source"] == f"{slug}.js", "生成的 registry entry 不一致")
    updated = copy.deepcopy(data)
    updated["assets"] = list(data["assets"]) + [entry]

    if not contracts_dir.exists():
        try:
            contracts_dir.mkdir()
        except OSError as exc:
            raise CliError(f"无法创建 contracts 目录：{contracts_dir}：{exc}") from exc
    atomic_create(source_path, source)
    atomic_create(contract_path, write_json(contract))
    atomic_replace(paths["registry"], write_json(updated))
    return {
        "ok": True,
        "command": "scaffold",
        "root": str(root),
        "id": asset_id,
        "name": name,
        "source": str(source_path),
        "contract": str(contract_path),
        "registry": str(paths["registry"]),
        "status": "draft",
        "acceptance": entry["acceptance"],
        "geometryImplemented": False,
        "message": "已创建 draft 脚手架；source 会抛出尚未实现几何，未执行代码、未自动 PASS",
    }


def evidence_paths(root: Path, values) -> list[tuple[Path, str]]:
    results = []
    seen = set()
    for value in values or []:
        path = Path(value)
        if not path.is_absolute():
            path = root / path
        resolved = existing_file(path, root, "证据")
        require(resolved not in seen, f"证据重复：{resolved}")
        seen.add(resolved)
        relative = resolved.relative_to(root).as_posix()
        results.append((resolved, f"evidence/{relative}"))
    return results


def output_path(root: Path, value: str | None, slug: str) -> Path:
    path = Path(value) if value else root / "outputs" / f"authored-{slug}.zip"
    if not path.is_absolute():
        path = root / path
    resolved = contained(path, root, "pack 输出", must_exist=False)
    require(not path.exists() and not path.is_symlink(), f"pack 输出已存在，拒绝覆盖：{path}")
    require(resolved.parent != root / "assets" / "authored" and not (root / "assets" / "authored") in resolved.parent.parents, "pack 输出不得放入 authored 源目录")
    if not resolved.parent.exists():
        try:
            resolved.parent.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            raise CliError(f"无法创建 pack 输出父目录：{resolved.parent}：{exc}") from exc
    parent = existing_dir(resolved.parent, root, "pack 输出父目录")
    return parent / resolved.name


def pack(args) -> dict:
    root = resolved_root(args.root)
    asset_id, slug = parse_id(args.id)
    paths, data, source, contract_path = validate_asset_target(root, asset_id)
    evidence = evidence_paths(root, args.evidence)
    target = output_path(root, args.output, slug)
    require(target != paths["registry"] and target != source and target != contract_path, "pack 输出不得覆盖输入文件")

    check_result = check_asset(root, asset_id)
    built = builder_run(root, paths["builder"], check=False)
    generated = root / "assets" / "authored.js"
    generated = contained(generated, root, "生成的 authored.js", must_exist=True)
    require(generated.is_file(), "项目构建器未生成 assets/authored.js")

    entry = entry_for_id(data, asset_id)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(prefix=f".{target.name}.", suffix=".tmp", dir=target.parent, delete=False) as handle:
            temporary = Path(handle.name)
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.write(source, f"assets/authored/{source.name}")
            archive.writestr("assets/authored/registry-entry.json", write_json(entry))
            archive.write(contract_path, f"assets/authored/contracts/{contract_path.name}")
            for evidence_path, archive_name in evidence:
                archive.write(evidence_path, archive_name)
        require(not target.exists() and not target.is_symlink(), f"pack 输出已出现，拒绝覆盖：{target}")
        os.link(temporary, target)
    except FileExistsError as exc:
        raise CliError(f"pack 输出已存在，拒绝覆盖：{target}") from exc
    except OSError as exc:
        raise CliError(f"ZIP 写入失败：{target}：{exc}") from exc
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)

    return {
        "ok": True,
        "command": "pack",
        "root": str(root),
        "id": asset_id,
        "output": str(target),
        "members": [
            f"assets/authored/{source.name}",
            "assets/authored/registry-entry.json",
            f"assets/authored/contracts/{contract_path.name}",
            *[name for _, name in evidence],
        ],
        "check": check_result,
        "builder": built,
        "acceptance": entry.get("acceptance"),
        "status": "draft",
        "message": "已生成单资产 ZIP；未 setpass，runtime/visual 未执行；不调用 skill packaging",
    }


class JsonArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        raise CliError(message)


def parser() -> argparse.ArgumentParser:
    cli = JsonArgumentParser(description=__doc__)
    sub = cli.add_subparsers(dest="command", required=True, parser_class=JsonArgumentParser)

    doctor_parser = sub.add_parser("doctor", help="只读识别项目与宿主依赖")
    doctor_parser.add_argument("--root", required=True, help="项目根目录，必须显式提供绝对路径")
    doctor_parser.add_argument("--playwright", help="可选 Playwright 路径，必须是绝对路径")

    scaffold_parser = sub.add_parser("scaffold", help="创建原创资产 draft 脚手架")
    scaffold_parser.add_argument("--root", required=True, help="项目根目录，必须显式提供绝对路径")
    scaffold_parser.add_argument("--id", required=True, help="new.<slug>")
    scaffold_parser.add_argument("--name", help="可选中文资产名")
    scaffold_parser.add_argument("--size", metavar="WIDTH_X,HEIGHT_Y,DEPTH_Z")
    scaffold_parser.add_argument("--materials", help="逗号分隔材质 ID")
    scaffold_parser.add_argument("--parts", help="逗号分隔部件名")

    check_parser = sub.add_parser("check", help="静态检查单个原创资产")
    check_parser.add_argument("--root", required=True, help="项目根目录，必须显式提供绝对路径")
    check_parser.add_argument("--id", required=True, help="new.<slug>")

    pack_parser = sub.add_parser("pack", help="静态检查、构建 authored.js 并打包单资产")
    pack_parser.add_argument("--root", required=True, help="项目根目录，必须显式提供绝对路径")
    pack_parser.add_argument("--id", required=True, help="new.<slug>")
    pack_parser.add_argument("--output", help="可选 ZIP 输出路径；必须是 root 内不存在的新路径")
    pack_parser.add_argument("--evidence", action="append", help="可选 root 内证据文件，可重复传入")
    return cli


def run(argv=None) -> int:
    command = None
    try:
        args = parser().parse_args(argv)
        command = args.command
        if command == "doctor":
            result = doctor(args)
        elif command == "scaffold":
            result = scaffold(args)
        elif command == "check":
            root = resolved_root(args.root)
            asset_id, _ = parse_id(args.id)
            result = check_asset(root, asset_id)
        elif command == "pack":
            result = pack(args)
        else:
            raise CliError(f"未知子命令：{command}")
        print(json.dumps(result, ensure_ascii=False, allow_nan=False, separators=(",", ":")))
        return 0
    except (CliError, OSError, ValueError) as exc:
        print(json.dumps({"ok": False, "command": command, "error": str(exc)}, ensure_ascii=False, separators=(",", ":")))
        return 1


def main(argv=None) -> int:
    return run(argv)


if __name__ == "__main__":
    sys.exit(main())
