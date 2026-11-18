#!/usr/bin/env python3
"""使用显式项目 root，在其 build 下执行真实隔离 selftest。"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile


SCRIPT = Path(__file__).resolve().with_name("asset_author.py")
COPY_FILES = (
    "index.html",
    "assets/code/modeling-kit.js",
    "assets/code/material-ledger.js",
    "tools/build_authored.py",
    "vendor/three.global.js",
)


class SelftestError(Exception):
    """隔离自测配置或断言失败。"""


class ArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        raise SelftestError(message)


def require(condition, message):
    if not condition:
        raise SelftestError(message)


def contained(path: Path, boundary: Path) -> Path:
    resolved = path.resolve()
    require(resolved.is_relative_to(boundary), f"路径或符号链接越界：{path}")
    return resolved


def call_asset_author(argv, *, success=True):
    process = subprocess.run(
        [sys.executable, "-B", str(SCRIPT), *argv],
        capture_output=True, text=True, encoding="utf-8", timeout=180,
    )
    lines = process.stdout.splitlines()
    require(len(lines) == 1, f"CLI stdout 不是单行 JSON：{process.stdout!r}")
    result = json.loads(lines[0])
    require(not process.stderr, f"CLI stderr 非空：{process.stderr}")
    require(
        (process.returncode == 0 and result.get("ok") is True) if success
        else (process.returncode != 0 and result.get("ok") is False),
        f"CLI 返回与预期不符：{argv!r} -> {result!r}",
    )
    return result


def prepare_project(source_files: dict[str, Path], root: Path) -> None:
    for relative, source in source_files.items():
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    authored = root / "assets" / "authored"
    authored.mkdir()
    (authored / "registry.json").write_text(
        '{\n  "schemaVersion": 1,\n  "assets": []\n}\n', encoding="utf-8"
    )


def selftest(args) -> dict:
    requested = Path(args.root)
    require(requested.is_absolute(), "--root 必须是绝对路径")
    project = requested.resolve(strict=True)
    require(project.is_dir(), f"root 不是目录：{project}")
    build = contained(project / "build", project)
    require(not build.exists() or build.is_dir(), "root/build 不是目录")
    requested_parent = Path(args.out_parent) if args.out_parent else build
    if not requested_parent.is_absolute():
        requested_parent = project / requested_parent
    parent = contained(requested_parent, build)
    require(not parent.exists() or parent.is_dir(), "--out-parent 不是目录")

    source_files = {}
    for relative in COPY_FILES:
        source = contained(project / relative, project)
        require(source.is_file(), f"缺少明确的 selftest 输入文件：{source}")
        source_files[relative] = source

    parent.mkdir(parents=True, exist_ok=True)
    checks = []
    with tempfile.TemporaryDirectory(prefix="asset-author-selftest-", dir=parent) as temporary:
        root = Path(temporary)
        prepare_project(source_files, root)
        doctor = call_asset_author(["doctor", "--root", str(root)])
        require(doctor["ready"] is True, f"隔离项目未就绪：{doctor}")
        checks.append("doctor")

        scaffold_args = [
            "scaffold", "--root", str(root), "--id", "new.selftest",
            "--name", "隔离自测资产（草稿）", "--size", "2.4,3.6,0.8",
            "--materials", "paint_grey,steel_dark", "--parts", "frame,panel",
        ]
        scaffold = call_asset_author(scaffold_args)
        require(scaffold["status"] == "draft", "scaffold 未保持 draft")
        source = root / "assets/authored/selftest.js"
        source_text = source.read_text(encoding="utf-8")
        require("export function build(ctx, options = {})" in source_text, "build 入口不匹配")
        require("throw new Error(" in source_text, "草稿未保留未实现抛错")
        contract_path = root / "assets/authored/contracts/selftest.json"
        contract = json.loads(contract_path.read_text(encoding="utf-8"))
        coordinate = contract["designContract"]["coordinateSystem"]
        require(coordinate["size"] == [2.4, 3.6, 0.8], "契约尺寸未更新")
        require(
            coordinate["nominalBounds"] == {"min": [-1.2, 0, -0.4], "max": [1.2, 3.6, 0.4]},
            "nominalBounds 未随新尺寸更新",
        )
        require(coordinate["protrusionsAndMotionEnvelope"] is None, "草稿不得虚构突出件或运动范围")
        require(contract["designStatus"] == "draft-unimplemented", "完整契约未保持 draft")
        checks.extend(["scaffold", "nondefault-size-bounds", "draft"])

        authored = root / "assets/authored"
        original_files = {p.relative_to(authored): p.read_bytes() for p in authored.rglob("*") if p.is_file()}
        call_asset_author(scaffold_args, success=False)
        after_collision = {p.relative_to(authored): p.read_bytes() for p in authored.rglob("*") if p.is_file()}
        require(after_collision == original_files, "重复 scaffold 产生了局部写入")
        checks.append("collision-no-write")

        check = call_asset_author(["check", "--root", str(root), "--id", "new.selftest"])
        require(check["message"] == "静态通过; runtime/visual未执行", "静态检查输出不匹配")
        require(not (root / "assets/authored.js").exists(), "check 不应生成 authored.js")
        checks.append("check-static-only")

        packed = call_asset_author(["pack", "--root", str(root), "--id", "new.selftest"])
        require(packed["status"] == "draft", "pack 未保持 draft")
        with zipfile.ZipFile(packed["output"]) as archive:
            require(set(archive.namelist()) == {
                "assets/authored/selftest.js", "assets/authored/registry-entry.json",
                "assets/authored/contracts/selftest.json",
            }, "单资产 ZIP 内容不匹配")
        require((root / "assets/authored.js").is_file(), "pack 未生成 authored.js")
        registry = json.loads((authored / "registry.json").read_text(encoding="utf-8"))
        require("entries" not in registry and len(registry["assets"]) == 1, "registry schema 不匹配")
        require(all(value == "unverified" for value in registry["assets"][0]["acceptance"].values()), "意外写入验收状态")
        call_asset_author(["pack", "--root", str(root), "--id", "new.selftest"], success=False)
        require(not any(root.rglob("__pycache__")), "隔离项目出现 Python 缓存")
        checks.extend(["pack", "pack-no-overwrite", "unverified", "no-pycache"])

    require(not root.exists(), "自建临时目录未清理")
    return {
        "ok": True, "command": "selftest", "root": str(project), "outParent": str(parent),
        "checks": checks, "temporaryDirectoryCleaned": True, "runtime": "未执行", "visual": "未执行",
    }


def main(argv=None) -> int:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="参考项目根目录，必须显式提供绝对路径")
    parser.add_argument("--out-parent", help="临时目录父目录，默认 root/build；仅允许 root/build 或其子目录，相对路径基于 root")
    try:
        result = selftest(parser.parse_args(argv))
        code = 0
    except (SelftestError, OSError, ValueError, subprocess.TimeoutExpired, zipfile.BadZipFile) as exc:
        result = {"ok": False, "command": "selftest", "error": str(exc)}
        code = 1
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
