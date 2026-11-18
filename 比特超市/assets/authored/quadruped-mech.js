export function build(ctx, options = {}) {
  const THREE = ctx.THREE;
  const seed = options.seed === undefined ? 7 : options.seed;
  const armor = options.armor === undefined ? 'grey' : options.armor;
  if (Object.keys(options).some(key => key !== 'seed' && key !== 'armor') ||
      ![7, 19, 43].includes(seed) || !['grey', 'orange'].includes(armor)) {
    throw new Error('四足机甲仅接受 seed: 7/19/43 与 armor: grey/orange');
  }
  const root = new THREE.Group();
  root.name = 'new.quadruped-mech';
  root.userData.noMerge = true;
  const ownGeometry = new Set();
  const ownMaterial = new Set();
  const geometryCache = new Map();
  const meshes = [];
  const legs = [];
  const collisionTargets = [];
  let disposed = false;
  const tau = Math.PI * 2;
  // 离散 seed 仅选择装甲细节，不建立第二套随机数发生器。
  const detail = seed === 7 ? -1 : seed === 19 ? 0 : 1;

  function material(name, color, metalness, roughness) {
    const result = new THREE.MeshStandardMaterial({ color, metalness, roughness });
    result.name = name;
    ownMaterial.add(result);
    return result;
  }
  const mats = {
    paint_grey: material('paint_grey', armor === 'grey' ? 0x66757c : 0xb76835, 0.48, 0.39),
    paint_orange: material('paint_orange', armor === 'grey' ? 0xc77736 : 0x59676e, 0.4, 0.44),
    steel_dark: material('steel_dark', 0x202b31, 0.76, 0.48),
    gunmetal: material('gunmetal', 0x859195, 0.88, 0.28),
    rubber: material('rubber', 0x141a1d, 0.03, 0.88),
    hazard_stripes: material('hazard_stripes', 0xd7b45f, 0.24, 0.55)
  };

  function geometry(key, create) {
    if (!geometryCache.has(key)) {
      const result = create();
      result.computeBoundingBox();
      ownGeometry.add(result);
      geometryCache.set(key, result);
    }
    return geometryCache.get(key);
  }
  function group(parent, name, position = [0, 0, 0]) {
    const result = new THREE.Group();
    result.name = name;
    result.position.set(...position);
    result.userData.noMerge = true;
    parent.add(result);
    return result;
  }
  function mesh(parent, name, shape, mat, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const result = new THREE.Mesh(shape, mat);
    result.name = name;
    result.position.set(...position);
    result.rotation.set(...rotation);
    result.castShadow = true;
    result.receiveShadow = true;
    result.userData.noMerge = true;
    parent.add(result);
    meshes.push(result);
    return result;
  }
  function box(parent, name, size, position, mat = mats.paint_grey, rotation = [0, 0, 0], bevel = 0.018) {
    const key = ['box', ...size, bevel].join(':');
    return mesh(parent, name, geometry(key, () => {
      const source = ctx.kit.metricBox(...size, bevel);
      const result = source.toNonIndexed();
      source.dispose();
      result.computeVertexNormals();
      const p = result.attributes.position, n = result.attributes.normal, uv = result.attributes.uv;
      // 倒角面独立展开，避免原语的共享角点把窄倒角 UV 压成一条线。
      for (let i = 0; i < p.count; i++) {
        const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
        if (ny >= nx && ny >= nz) uv.setXY(i, p.getX(i), p.getZ(i));
        else if (nx >= nz) uv.setXY(i, p.getZ(i), p.getY(i));
        else uv.setXY(i, p.getX(i), p.getY(i));
      }
      result.setIndex(Array.from({ length: p.count }, (_, i) => i));
      return result;
    }), mat, position, rotation);
  }
  function cylinder(parent, name, radius, length, position, mat = mats.steel_dark, rotation = [0, 0, 0], segments = 24, radiusBottom = radius) {
    const key = ['cylinder', radius, radiusBottom, length, segments].join(':');
    return mesh(parent, name, geometry(key, () => ctx.kit.cylinder(radius, radiusBottom, length, segments)), mat, position, rotation);
  }
  const axisY = new THREE.Vector3(0, 1, 0);
  const lineA = new THREE.Vector3();
  const lineB = new THREE.Vector3();
  function fitBetween(node, a, b) {
    lineA.set(...a);
    lineB.set(...b).sub(lineA);
    const length = lineB.length();
    node.position.copy(lineA).addScaledVector(lineB, 0.5);
    node.quaternion.setFromUnitVectors(axisY, lineB.multiplyScalar(1 / length));
    node.scale.set(1, length, 1);
  }
  function cylinderBetween(parent, name, a, b, radius, mat = mats.gunmetal, segments = 16) {
    const result = cylinder(parent, name, radius, 1, [0, 0, 0], mat, [0, 0, 0], segments);
    fitBetween(result, a, b);
    return result;
  }
  // 每个多边形独立法线，UV 按主法线平面以米投影；全部显式索引。
  function facesGeometry(faces) {
    const positions = [], normals = [], uvs = [], indices = [];
    const a = new THREE.Vector3(), b = new THREE.Vector3(), normal = new THREE.Vector3();
    for (const face of faces) {
      a.fromArray(face[1]).sub(b.fromArray(face[0]));
      b.fromArray(face[2]).sub(normal.fromArray(face[0]));
      normal.crossVectors(a, b).normalize();
      const offset = positions.length / 3;
      const nx = Math.abs(normal.x), ny = Math.abs(normal.y), nz = Math.abs(normal.z);
      for (const point of face) {
        positions.push(...point);
        normals.push(normal.x, normal.y, normal.z);
        if (ny >= nx && ny >= nz) uvs.push(point[0], point[2]);
        else if (nx >= nz) uvs.push(point[2], point[1]);
        else uvs.push(point[0], point[1]);
      }
      for (let i = 1; i < face.length - 1; i++) indices.push(offset, offset + i, offset + i + 1);
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    result.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    return result;
  }
  function hull(parent, name, levels, mat, position = [0, 0, 0]) {
    const key = 'hull:' + JSON.stringify(levels);
    return mesh(parent, name, geometry(key, () => {
      const rings = levels.map(([y, w, d, cut]) => [
        [-w / 2 + cut, y, -d / 2], [w / 2 - cut, y, -d / 2],
        [w / 2, y, -d / 2 + cut], [w / 2, y, d / 2 - cut],
        [w / 2 - cut, y, d / 2], [-w / 2 + cut, y, d / 2],
        [-w / 2, y, d / 2 - cut], [-w / 2, y, -d / 2 + cut]
      ]);
      const faces = [rings[0], rings[rings.length - 1].slice().reverse()];
      for (let j = 0; j < rings.length - 1; j++) {
        for (let i = 0; i < 8; i++) {
          const next = (i + 1) % 8;
          faces.push([rings[j][i], rings[j + 1][i], rings[j + 1][next], rings[j][next]]);
        }
      }
      return facesGeometry(faces);
    }), mat, position);
  }
  function annulus(parent, name, outer, inner, length, position, mat, rotation = [0, 0, 0], segments = 40) {
    const key = ['annulus', outer, inner, length, segments].join(':');
    return mesh(parent, name, geometry(key, () => {
      const faces = [];
      for (let i = 0; i < segments; i++) {
        const a = i * tau / segments, b = (i + 1) * tau / segments;
        const p = (r, y, t) => [r * Math.cos(t), y, r * Math.sin(t)];
        const h = length / 2;
        faces.push([p(outer, -h, a), p(outer, h, a), p(outer, h, b), p(outer, -h, b)]);
        faces.push([p(inner, -h, b), p(inner, h, b), p(inner, h, a), p(inner, -h, a)]);
        faces.push([p(inner, h, b), p(outer, h, b), p(outer, h, a), p(inner, h, a)]);
        faces.push([p(inner, -h, a), p(outer, -h, a), p(outer, -h, b), p(inner, -h, b)]);
      }
      return facesGeometry(faces);
    }), mat, position, rotation);
  }
  function cable(parent, name, points, radius = 0.025) {
    const key = ['cable', radius, JSON.stringify(points)].join(':');
    return mesh(parent, name, geometry(key, () => {
      const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
      const result = new THREE.TubeGeometry(curve, 16, radius, 8, false);
      const uv = result.attributes.uv;
      const length = curve.getLength();
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * length, uv.getY(i) * tau * radius);
      return result;
    }), mats.rubber);
  }
  function bolt(parent, name, position, rotation = [Math.PI / 2, 0, 0], radius = 0.028) {
    return cylinder(parent, name, radius, 0.026, position, mats.gunmetal, rotation, 6);
  }
  function collider(node, surface) {
    const result = { min: [0, 0, 0], max: [0, 0, 0], surface };
    collisionTargets.push({ node, result });
    return result;
  }

  const body = group(root, 'body');
  const chassis = hull(body, 'body.chassis', [
    [1.13, 1.55, 2.55, 0.22], [1.32, 2.08, 3.1, 0.32],
    [1.64, 2.18, 3.04, 0.36], [1.83, 1.78, 2.68, 0.32]
  ], mats.paint_grey);
  hull(body, 'body.belly', [[0.98, 1.1, 2.12, 0.17], [1.19, 1.56, 2.58, 0.23]], mats.steel_dark);
  const front = group(body, 'body.front-plate', [0, 1.54, 1.49]);
  box(front, 'front.armour', [1.42, 0.38, 0.12], [0, 0, 0], mats.paint_grey, [-0.24, 0, 0], 0.035);
  box(front, 'front.sensor-recess', [0.68, 0.12, 0.075], [0, 0.06, 0.083], mats.steel_dark);
  for (const s of [-1, 1]) {
    box(front, 'front.optic.' + s, [0.21, 0.054, 0.035], [s * 0.18, 0.06, 0.13], mats.hazard_stripes, [0, 0, 0], 0.006);
    bolt(front, 'front.fastener.' + s, [s * 0.57, -0.04, 0.1]);
    cylinderBetween(body, 'front.tow-loop.' + s, [s * 0.69, 1.15, 1.35], [s * 0.69, 1.15, 1.64], 0.055, mats.gunmetal);
    box(body, 'body.side-sill.' + s, [0.16, 0.15, 2.45], [s * 1.07, 1.29, -0.04], mats.steel_dark);
    for (let i = 0; i < 3; i++) {
      const panel = box(body, 'body.cheek.' + s + '.' + i, [0.1, 0.32, 0.58], [s * 1.074, 1.6, -0.72 + i * 0.74], mats.paint_grey, [0, s * (0.025 + detail * 0.008), s * -0.12]);
      panel.userData.detailSeed = seed;
      bolt(body, 'body.side-bolt.' + s + '.' + i, [s * 1.14, 1.57, -0.72 + i * 0.74], [0, 0, Math.PI / 2]);
    }
    box(body, 'body.identification.' + s, [0.022, 0.12, 0.43], [s * 1.147, 1.65, 0.12], mats.paint_orange);
    for (let i = 0; i < 3; i++) box(body, 'body.id-bar.' + s + '.' + i, [0.026, 0.078, 0.03], [s * 1.164, 1.65, 0.02 + i * 0.087], mats.hazard_stripes);
  }
  const power = group(body, 'body.rear-power', [0, 1.67, -1.12]);
  hull(power, 'power.shell', [[-0.13, 1.46, 0.93, 0.12], [0.14, 1.53, 0.98, 0.14], [0.34, 1.28, 0.8, 0.12]], mats.steel_dark);
  for (const s of [-1, 1]) {
    box(power, 'power.cover.' + s, [0.49, 0.07, 0.65], [s * 0.34, 0.33, -0.02], mats.paint_grey);
    for (let i = 0; i < 7; i++) box(power, 'power.cooling-fin.' + s + '.' + i, [0.38, 0.026, 0.035], [s * 0.34, 0.379, -0.29 + i * 0.083], mats.gunmetal, [0.17, 0, 0], 0.004);
    annulus(power, 'power.exhaust.' + s, 0.12, 0.082, 0.22, [s * 0.59, 0.02, -0.56], mats.gunmetal, [Math.PI / 2, 0, 0], 20);
    cylinder(power, 'power.exhaust-depth.' + s, 0.08, 0.02, [s * 0.59, 0.02, -0.465], mats.steel_dark, [Math.PI / 2, 0, 0]);
    cable(body, 'power.feed.' + s, [[s * 0.72, 1.85, -1.06], [s * (0.91 + detail * 0.018), 1.98, -0.84], [s * 0.85, 1.9, -0.48]], 0.035);
  }

  const ring = group(body, 'turret.ring', [0, 1.84, 0.13]);
  annulus(ring, 'ring.race', 0.8, 0.54, 0.16, [0, 0, 0], mats.steel_dark);
  annulus(ring, 'ring.bearing-lip', 0.76, 0.63, 0.05, [0, 0.095, 0], mats.gunmetal);
  for (let i = 0; i < 12; i++) {
    const angle = i * tau / 12;
    bolt(ring, 'ring.bolt.' + i, [Math.cos(angle) * 0.715, 0.13, Math.sin(angle) * 0.715], [0, 0, 0], 0.025);
  }
  const turret = group(ring, 'turret.yaw', [0, 0.13, 0]);
  hull(turret, 'turret.armour', [[0, 1.28, 1.27, 0.18], [0.27, 1.65, 1.43, 0.25], [0.57, 1.25, 1.11, 0.22]], mats.paint_grey, [0, 0, -0.08]);
  box(turret, 'turret.roof-access', [0.66, 0.045, 0.5], [0, 0.597, -0.21], mats.paint_grey, [0, 0, 0], 0.025);
  cylinderBetween(turret, 'turret.hatch-handle', [-0.15, 0.66, -0.23], [0.15, 0.66, -0.23], 0.025, mats.gunmetal);
  for (const s of [-1, 1]) {
    box(turret, 'turret.ammo-bay.' + s, [0.35, 0.34, 0.82], [s * 0.82, 0.245, -0.31], mats.steel_dark, [0, s * -0.04, 0], 0.04);
    box(turret, 'turret.ammo-lid.' + s, [0.055, 0.26, 0.7], [s * 1.005, 0.25, -0.31], mats.paint_orange);
    for (let i = 0; i < 3; i++) box(turret, 'turret.ammo-rib.' + s + '.' + i, [0.07, 0.3, 0.037], [s * 1.035, 0.25, -0.56 + i * 0.25], mats.gunmetal);
  }
  const gun = group(turret, 'turret.gun-mount', [0, 0.27, 0.59]);
  for (const s of [-1, 1]) {
    box(gun, 'mount.cheek.' + s, [0.16, 0.39, 0.45], [s * 0.285, 0, -0.015], mats.steel_dark, [-0.12, 0, 0], 0.025);
    cylinder(gun, 'mount.trunnion.' + s, 0.15, 0.18, [s * 0.36, 0, -0.03], mats.gunmetal, [0, 0, Math.PI / 2]);
    cylinder(gun, 'mount.trunnion-cap.' + s, 0.104, 0.03, [s * 0.46, 0, -0.03], mats.paint_orange, [0, 0, Math.PI / 2]);
  }
  box(gun, 'mount.cradle', [0.43, 0.25, 0.65], [0, -0.085, 0.1], mats.steel_dark);
  const recoil = group(gun, 'cannon.recoil', [0, 0, 0]);
  const sleeve = group(recoil, 'cannon.recoil-sleeve');
  annulus(sleeve, 'sleeve.shell', 0.198, 0.151, 0.67, [0, 0, 0.24], mats.paint_grey, [Math.PI / 2, 0, 0]);
  for (const s of [-1, 1]) {
    cylinderBetween(gun, 'recoil.guide.' + s, [s * 0.22, -0.14, 0.04], [s * 0.22, -0.14, 0.55], 0.033, mats.gunmetal);
    cylinderBetween(sleeve, 'recoil.buffer.' + s, [s * 0.22, -0.14, 0.16], [s * 0.22, -0.14, 0.44], 0.059, mats.steel_dark);
  }
  const barrel = group(recoil, 'cannon.barrel');
  annulus(barrel, 'barrel.bored-tube', 0.119, 0.077, 1.67, [0, 0, 1.115], mats.gunmetal, [Math.PI / 2, 0, 0], 32);
  annulus(barrel, 'barrel.thermal-jacket', 0.144, 0.121, 0.53, [0, 0, 0.81], mats.steel_dark, [Math.PI / 2, 0, 0], 32);
  for (const z of [0.56, 1.075, 1.72]) annulus(barrel, 'barrel.collar.' + z, 0.153, 0.12, 0.07, [0, 0, z], mats.paint_orange, [Math.PI / 2, 0, 0], 32);
  const muzzle = group(recoil, 'cannon.muzzle', [0, 0, 2.12]);
  // 制退器为有厚度的四侧框与侧向泄压孔，前端保留真实炮膛。
  annulus(muzzle, 'muzzle.bore-lip', 0.158, 0.077, 0.12, [0, 0, 0.13], mats.gunmetal, [Math.PI / 2, 0, 0], 32);
  for (const s of [-1, 1]) {
    box(muzzle, 'muzzle.plate.' + s, [0.43, 0.065, 0.43], [0, s * 0.147, -0.015], mats.steel_dark, [0, 0, 0], 0.012);
    for (let i = 0; i < 3; i++) box(muzzle, 'muzzle.port-bridge.' + s + '.' + i, [0.064, 0.26, 0.055], [s * 0.186, 0, -0.18 + i * 0.18], mats.gunmetal, [0, 0.16 * s, 0], 0.008);
  }

  const upperLength = 1.12, lowerLength = 1.39;
  for (const [label, s, frontSign, targetZ, yaw] of [
    ['front-left', -1, 1, 1.98, -0.09], ['front-right', 1, 1, 1.94, 0.075],
    ['rear-left', -1, -1, -2.48, 0.09], ['rear-right', 1, -1, -2.5, -0.075]
  ]) {
    const leg = group(body, 'leg.' + label, [s * 0.94, 1.45, frontSign * 1.0]);
    const hip = group(leg, 'hip');
    cylinder(hip, 'hip.axle', 0.245, 0.49, [0, 0, 0], mats.steel_dark, [Math.PI / 2, 0, 0]);
    cylinder(hip, 'hip.cap', 0.18, 0.045, [0, 0, 0.263], mats.paint_orange, [Math.PI / 2, 0, 0]);
    const upper = group(hip, 'upper');
    const upperBeam = box(upper, 'upper.load-beam', [0.26, upperLength, 0.28], [0, -upperLength / 2, 0], mats.steel_dark, [0, 0, 0], 0.035);
    hull(upper, 'upper.armour', [[-0.92, 0.3, 0.4, 0.07], [-0.74, 0.46, 0.52, 0.09], [-0.19, 0.5, 0.49, 0.08], [-0.08, 0.33, 0.35, 0.06]], mats.paint_grey);
    box(upper, 'upper.inset', [0.22, 0.48, 0.038], [0, -0.45, 0.277], mats.paint_orange, [0, 0, detail * 0.012]);
    for (const y of [-0.25, -0.66]) bolt(upper, 'upper.fastener.' + y, [0, y, 0.307]);
    cable(upper, 'upper.hose', [[0.16, -0.07, -0.1], [0.31 + detail * 0.012, -0.36, -0.2], [0.25, -0.82, -0.2], [0.12, -1.04, -0.14]], 0.026);
    const knee = group(upper, 'knee', [0, -upperLength, 0]);
    cylinder(knee, 'knee.axle', 0.217, 0.52, [0, 0, 0], mats.steel_dark, [Math.PI / 2, 0, 0]);
    for (const side of [-1, 1]) {
      cylinder(knee, 'knee.bearing.' + side, 0.15, 0.045, [0, 0, side * 0.282], mats.gunmetal, [Math.PI / 2, 0, 0]);
      bolt(knee, 'knee.lock.' + side, [0, 0, side * 0.316], [Math.PI / 2, 0, 0], 0.065);
    }
    const lower = group(knee, 'lower');
    const lowerBeam = box(lower, 'lower.load-beam', [0.19, 1.29, 0.22], [0, -0.675, 0], mats.gunmetal, [0, 0, 0], 0.025);
    hull(lower, 'lower.shin', [[-1.13, 0.25, 0.29, 0.045], [-0.94, 0.33, 0.39, 0.06], [-0.3, 0.39, 0.4, 0.065], [-0.18, 0.28, 0.3, 0.045]], mats.paint_grey);
    box(lower, 'lower.toe-guard', [0.29, 0.18, 0.33], [0, -1.19, 0.04], mats.steel_dark);
    const piston = group(upper, 'piston');
    const pistonBody = cylinderBetween(piston, 'piston.housing', [0, 0, 0], [0, 1, 0], 0.084, mats.steel_dark);
    const pistonRod = cylinderBetween(piston, 'piston.chrome', [0, 0, 0], [0, 1, 0], 0.044, mats.gunmetal);
    const pistonGland = cylinder(piston, 'piston.gland', 0.096, 0.055, [0, 0, 0], mats.paint_orange);
    const foot = group(lower, 'foot', [0, -lowerLength, 0]);
    cylinder(foot, 'foot.ankle', 0.135, 0.35, [0, 0.02, 0], mats.steel_dark, [0, 0, Math.PI / 2]);
    const footShell = hull(foot, 'foot.armour', [[-0.13, 0.82, 1.1, 0.1], [-0.04, 0.84, 1.12, 0.11], [0.12, 0.55, 0.76, 0.09]], mats.paint_grey);
    const sole = box(foot, 'foot.sole', [0.8, 0.07, 1.08], [0, -0.165, 0], mats.rubber, [0, 0, 0], 0.013);
    for (let i = 0; i < 5; i++) {
      for (const side of [-1, 1]) box(foot, 'foot.tread.' + side + '.' + i, [0.36, 0.035, 0.14], [side * 0.207, -0.2175, -0.42 + i * 0.21], mats.rubber, [0, side * 0.14, 0], 0.006);
    }
    for (const side of [-1, 1]) box(foot, 'foot.front-cleat.' + side, [0.17, 0.09, 0.12], [side * 0.23, -0.09, 0.535], mats.gunmetal);
    const target = new THREE.Vector3(s * 1.94, 0.235, targetZ);
    const direction = target.clone().sub(leg.position);
    hip.rotation.y = Math.atan2(-direction.z, direction.x);
    const horizontal = Math.hypot(direction.x, direction.z);
    const footYaw = new THREE.Quaternion().setFromAxisAngle(axisY, yaw);
    legs.push({ leg, hip, upper, knee, lower, foot, pistonBody, pistonRod, pistonGland, target, horizontal, footYaw, diagonal: s * frontSign });
    collider(upperBeam, 'metal');
    collider(lowerBeam, 'metal');
    collider(footShell, 'metal');
    collider(sole, 'rubber');
  }
  collider(chassis, 'metal');

  const sockets = {
    base: { position: [0, 0, 0] },
    turret: { position: [0, 0, 0] },
    muzzle: { position: [0, 0, 0] },
    'mount.front': { position: [0, 0, 0] },
    'mount.rear': { position: [0, 0, 0] }
  };
  const animation = { phase: 0, firePulse: 0, mode: 'idle' };
  const inverseRoot = new THREE.Matrix4();
  const localMatrix = new THREE.Matrix4();
  const bounds = new THREE.Box3();
  const targetBounds = new THREE.Box3();
  const point = new THREE.Vector3();
  const size = [0, 0, 0];
  const chainQuaternion = new THREE.Quaternion();
  const pistonStart = [0.19, -0.32, 0.31];
  const pistonEnd = [0, 0, 0.31];
  const pistonSplit = [0, 0, 0.31];
  function socketPosition(name, node, x, y, z) {
    point.set(x, y, z).applyMatrix4(node.matrixWorld).applyMatrix4(inverseRoot);
    point.toArray(sockets[name].position);
  }
  function refreshMetadata() {
    root.updateWorldMatrix(true, true);
    inverseRoot.copy(root.matrixWorld).invert();
    bounds.makeEmpty();
    for (const node of meshes) {
      localMatrix.multiplyMatrices(inverseRoot, node.matrixWorld);
      const positions = node.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(localMatrix);
        bounds.expandByPoint(point);
      }
    }
    size[0] = bounds.max.x - bounds.min.x;
    size[1] = bounds.max.y - bounds.min.y;
    size[2] = bounds.max.z - bounds.min.z;
    for (const { node, result } of collisionTargets) {
      localMatrix.multiplyMatrices(inverseRoot, node.matrixWorld);
      targetBounds.copy(node.geometry.boundingBox).applyMatrix4(localMatrix);
      targetBounds.min.toArray(result.min);
      targetBounds.max.toArray(result.max);
    }
    socketPosition('turret', turret, 0, 0, 0);
    socketPosition('muzzle', muzzle, 0, 0, 0.19);
    socketPosition('mount.front', body, 0, 1.2, 1.64);
    socketPosition('mount.rear', power, 0, -0.06, -0.56);
  }
  function pose(phase, firePulse) {
    body.position.y = 0.012 * Math.sin(phase * tau / 3.6);
    turret.rotation.y = 0.115 * Math.sin(phase * tau / 13);
    recoil.position.z = -0.18 * firePulse;
    for (const item of legs) {
      // 二连杆解析姿态：足底固定，交替髋高微动而不是整腿木棍旋转。
      const lift = 0.007 * Math.sin(phase * tau / 3.6) * item.diagonal;
      item.leg.position.y = 1.45 + lift;
      const down = item.leg.position.y + body.position.y - item.target.y;
      const distanceSquared = item.horizontal * item.horizontal + down * down;
      const cosine = (distanceSquared - upperLength * upperLength - lowerLength * lowerLength) / (2 * upperLength * lowerLength);
      const beta = -Math.acos(Math.max(-1, Math.min(1, cosine)));
      const alpha = Math.atan2(item.horizontal, down) - Math.atan2(lowerLength * Math.sin(beta), upperLength + lowerLength * Math.cos(beta));
      item.upper.rotation.z = alpha;
      item.knee.rotation.z = beta;
      chainQuaternion.copy(item.hip.quaternion).multiply(item.upper.quaternion).multiply(item.knee.quaternion);
      item.foot.quaternion.copy(chainQuaternion).invert().multiply(item.footYaw);
      pistonEnd[0] = 0.46 * Math.sin(beta) + 0.13 * Math.cos(beta);
      pistonEnd[1] = -upperLength - 0.46 * Math.cos(beta) + 0.13 * Math.sin(beta);
      for (let i = 0; i < 3; i++) pistonSplit[i] = pistonStart[i] + (pistonEnd[i] - pistonStart[i]) * 0.58;
      fitBetween(item.pistonBody, pistonStart, pistonSplit);
      fitBetween(item.pistonRod, pistonSplit, pistonEnd);
      item.pistonGland.position.set(...pistonSplit);
      item.pistonGland.quaternion.copy(item.pistonBody.quaternion);
    }
    refreshMetadata();
  }
  root.userData.assetId = 'new.quadruped-mech';
  root.userData.authored = true;
  root.userData.units = 'm';
  root.userData.origin = 'bottom-center';
  root.userData.forward = '+Z';
  root.userData.options = { seed, armor };
  root.userData.size = size;
  root.userData.colliders = collisionTargets.map(item => item.result);
  root.userData.sockets = sockets;
  root.userData.animation = animation;
  root.userData.stats = {
    meshes: meshes.length,
    triangles: meshes.reduce((sum, node) => sum + node.geometry.index.count / 3, 0),
    legs: 4,
    cannon: 1,
    geometries: ownGeometry.size,
    materials: ownMaterial.size
  };
  root.userData.update = function update(dt) {
    if (disposed) return;
    if (!Number.isFinite(dt) || dt < 0) throw new Error('dt 必须是有限的非负秒数');
    animation.phase += dt;
    const cycle = animation.phase % 4;
    let pulse = 0;
    // 每四秒一次：快速后坐 60ms，随后 320ms 平滑复进。
    if (cycle >= 1.2 && cycle < 1.26) {
      const t = (cycle - 1.2) / 0.06;
      pulse = t * t * (3 - 2 * t);
    } else if (cycle >= 1.26 && cycle < 1.58) {
      const t = (cycle - 1.26) / 0.32;
      pulse = 1 - t * t * (3 - 2 * t);
    }
    animation.firePulse = pulse;
    pose(animation.phase, pulse);
  };
  root.userData.reset = function reset() {
    if (disposed) return;
    animation.phase = 0;
    animation.firePulse = 0;
    animation.mode = 'idle';
    pose(0, 0);
  };
  root.userData.dispose = function dispose() {
    if (disposed) return;
    disposed = true;
    for (const item of ownGeometry) item.dispose();
    for (const item of ownMaterial) item.dispose();
    ownGeometry.clear();
    ownMaterial.clear();
    geometryCache.clear();
  };
  pose(0, 0);
  // 不缩放几何，仅校准静置包围盒的底面中心。
  body.position.x = -(bounds.min.x + bounds.max.x) / 2;
  body.position.z = -(bounds.min.z + bounds.max.z) / 2;
  root.position.y = -bounds.min.y;
  refreshMetadata();
  return root;
}
