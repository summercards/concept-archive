from pathlib import Path
import hashlib
import json

ROOT = Path('/Users/zyq/WorkBuddy/2026-11-15-17-10-04')
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

images = ['release/material-overall.png', 'release/material-front.png', 'release/material-back.png', 'release/clay-overall.png', 'release/wire-overall.png', 'cream-variant.png', 'library-recent.png']
source = ROOT / 'assets/authored/rubber-duck.js'
contract = ROOT / 'assets/authored/contracts/rubber-duck.json'
report = ROOT / 'outputs/rubber-duck/release/report.json'
checks = json.loads(report.read_text())
result = {
    'assetId': 'new.rubber-duck',
    'scope': '网页 catalog 棚拍的实际图片检查；非 r180 整机或全部质量签证',
    'reviewMethod': '实际打开真实网页渲染 PNG 检查，非仅判断文件存在',
    'conclusion': '已检查图中主体轮廓、头颈融合、上下嘴、眼睛、翅膀、尾、接地完整可见；未发现初版尾尖缺面或多余底盘环。',
    'notes': ['近景曲面仍存在采样离散与尾部造型转折，不宣称制造级曲面。', '黄色/奶油色使用自有物理软胶材质，标准自动摘要只比较材质名所以 changedFromDefault=false 不代表颜色无变化；换色效果另有实图。'],
    'sourceSha256': sha(source),
    'contractFileSha256': sha(contract),
    'automaticReportSha256': sha(report),
    'automaticNormalizedReportSha256': checks['normalizedReportSha256'],
    'automaticVisualStatusUnchanged': checks['visual']['status'],
    'images': [{'file': f, 'sha256': sha(ROOT / 'outputs/rubber-duck' / f)} for f in images],
    'notExecuted': ['r180整机集成', '软体与浮力', '音效', 'LOD与大规模实例化', '全部内存趋势与资源生命周期证明'],
    'acceptanceWriteback': False
}
target = ROOT / 'outputs/rubber-duck/visual-review.json'
assert target.parent.is_dir()
assert not target.exists()
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'visualReview': str(target), 'sourceSha256': result['sourceSha256']}, ensure_ascii=False))
