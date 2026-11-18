"""在明确项目的 build 下建立隔离宿主，实测技能而不往正式资产库塞入样品。"""
from pathlib import Path
import json
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SKILL = Path("/Users/zyq/.workbuddy/skills/code-asset-authoring")
DEST = ROOT / "build" / "authoring-skill-e2e"
if DEST.exists():
    raise SystemExit("隔离目录已存在，拒绝覆盖")
if not DEST.parent.is_dir():
    raise SystemExit("隔离父目录不存在")
DEST.mkdir()
for directory in ("assets", "assets/code", "assets/authored", "assets/authored/contracts", "vendor", "tools", "outputs", "build"):
    (DEST / directory).mkdir(exist_ok=True)
for name in ("index.html", "style.css", "app.js", "previews.js", "assets/modules.js", "assets/data.js", "assets/alignment-audit.js", "assets/code/modeling-kit.js", "assets/code/material-ledger.js", "vendor/three.global.js", "vendor/three-addons.js", "tools/build_authored.py"):
    shutil.copy2(ROOT / name, DEST / name)
package = json.loads((SKILL / "assets/workbench-example.entry.json").read_text())
entry = package["registryEntry"]
(DEST / "assets/authored/registry.json").write_text(json.dumps({"schemaVersion": 1, "assets": [entry]}, ensure_ascii=False, indent=2))
(DEST / "assets/authored/contracts/harbor-service-workbench.json").write_text(json.dumps(package, ensure_ascii=False, indent=2))
shutil.copy2(SKILL / "assets/workbench-example.js", DEST / "assets/authored/harbor-service-workbench.js")
subprocess.run(["python3", str(DEST / "tools/build_authored.py"), "--root", str(DEST)], check=True)
print(DEST)
