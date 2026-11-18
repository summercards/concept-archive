from pathlib import Path
import hashlib
import json

ROOT = Path('/Users/zyq/WorkBuddy/2026-11-15-17-10-04')
OUT = ROOT / 'outputs/nordic-spruce'
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
geometry = json.loads((OUT / 'geometry-verification.json').read_text())
ui = json.loads((OUT / 'ui-verification.json').read_text())
assert geometry['status'] == 'PASS' and ui['status'] == 'PASS'
for file, value in geometry['sourceFiles'].items():
    assert sha(ROOT / file) == value, '证据已过期：' + file
result = {
    'assetId': 'new.nordic-spruce',
    'scope': '原创静态树木 catalog 的实际图片检查，非精确物种鉴定或整机等价',
    'reviewMethod': '实际打开整树、树冠放大、灰模、线框、seed19及NEW分类PNG检查',
    'conclusion': '高耸窄冠、尖顶、下垂分枝、分级针叶与根颈均可见；加密后较首版减少裸枝骨架感。未见整块锥体替代、明显缺面或漂浮冠层。',
    'notes': ['树冠偏云杉式，保留层间透空和少量外露枝干，不以名称作植物学认证。', '针叶是双面交叉渐尖三角片；近景属于程序化游戏表示，不是每根针叶闭合实体或扫描级树皮。', '默认315936三角与691215顶点，仍需LOD优化才适合大量森林摆放。'],
    'sourceSha256': sha(ROOT / 'assets/authored/nordic-spruce.js'),
    'contractFileSha256': sha(ROOT / 'assets/authored/contracts/nordic-spruce.json'),
    'geometryReportSha256': sha(OUT / 'geometry-verification.json'),
    'uiReportSha256': sha(OUT / 'ui-verification.json'),
    'images': [{'file': f, 'sha256': sha(OUT / f)} for f in ['material-overall.png','material-portrait.png','material-front.png','material-back.png','crown-detail.png','clay-overall.png','wire-overall.png','seed-19.png','seed-43.png','library-new.png']],
    'genericVerifier': 'iteration1/report.json仍为FAIL；未关闭或篡改原检查，使用完整逐数组几何检查和独立UI实测补充，不冒称通用流程成功。',
    'runtimeWarnings': ui['warnings'],
    'notExecuted': ['r180整机集成','风摆/落雪/生长动画','远景LOD/森林实例化','完整GPU/CPU内存趋势','各移动设备帧率'],
    'acceptanceWriteback': False
}
target = OUT / 'visual-review.json'
assert not target.exists(), '拒绝覆盖独立检查记录'
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'review': str(target), 'sourceSha256': result['sourceSha256']}, ensure_ascii=False))
