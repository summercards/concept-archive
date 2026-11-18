// 原创北欧云杉式常青树：真实分层枝条、根颈、针叶簇和可测碰撞；仅提供 build 导出。
export function build(ctx, options = {}) {
  const T = ctx.THREE;
  const seed = options.seed === undefined ? 7 : options.seed;
  if (![7, 19, 43].includes(seed)) throw new Error('seed 必须是 7、19 或 43');
  if (Object.keys(options).some((key) => key !== 'seed')) throw new Error('只支持 seed 选项');
  if (typeof ctx.rng !== 'function') throw new Error('需要宿主为每次构建重置 ctx.rng');

  const rng = ctx.rng;
  const random = () => rng();
  const between = (a, b) => a + (b - a) * random();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAU = Math.PI * 2;
  const targetSize = [5.4, 14, 5.4];
  const root = new T.Group();
  root.name = 'nordic-spruce';
  const ownedGeometries = [];
  const ownedMaterials = [];
  const geometryByPart = {};
  const trunkGeometryList = [];
  let needleCount = 0;

  const barkMaterial = new T.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    vertexColors: true,
  });
  barkMaterial.name = 'wood_dark';
  barkMaterial.userData.recipe = 'nordic-spruce-authored rough brown-grey bark, not an old baked recipe';
  const needleMaterial = new T.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    vertexColors: true,
    side: T.DoubleSide,
  });
  needleMaterial.name = 'tarp';
  needleMaterial.userData.recipe = 'nordic-spruce-authored needle clusters with vertex color variation, not an old baked recipe';
  ownedMaterials.push(barkMaterial, needleMaterial);

  const barkColors = [
    [0.075, 0.065, 0.055],
    [0.095, 0.082, 0.069],
    [0.12, 0.105, 0.089],
    [0.145, 0.128, 0.109],
  ];
  const needleColors = [
    [0.025, 0.085, 0.036],
    [0.038, 0.145, 0.057],
    [0.065, 0.22, 0.083],
    [0.12, 0.31, 0.115],
  ];

  const makeBatch = () => ({ p: [], uv: [], c: [], i: [] });
  const addVertex = (batch, point, uv, color) => {
    const index = batch.p.length / 3;
    batch.p.push(point.x, point.y, point.z);
    batch.uv.push(uv[0], uv[1]);
    batch.c.push(color[0], color[1], color[2]);
    return index;
  };
  const addTriangle = (batch, a, b, c) => {
    if (a === b || b === c || c === a) return;
    batch.i.push(a, b, c);
  };
  const vector = (x, y, z) => new T.Vector3(x, y, z);
  const safeNormalize = (v, fallback) => {
    if (v.lengthSq() < 1e-12) return fallback.clone();
    return v.normalize();
  };

  const addTubePath = (batch, points, radii, sides, colorMode) => {
    const rings = [];
    let accumulated = 0;
    let previousSide = null;
    const ridgePhase = between(0, TAU);
    for (let k = 0; k < points.length; k += 1) {
      const point = points[k];
      const tangent = k === 0
        ? vector().subVectors(points[1], points[0])
        : (k === points.length - 1 ? vector().subVectors(points[k], points[k - 1]) : vector().subVectors(points[k + 1], points[k - 1]));
      tangent.normalize();
      const reference = Math.abs(tangent.y) < 0.88 ? vector(0, 1, 0) : vector(1, 0, 0);
      const sideA = previousSide
        ? previousSide.clone().addScaledVector(tangent, -previousSide.dot(tangent)).normalize()
        : new T.Vector3().crossVectors(tangent, reference).normalize();
      const sideB = new T.Vector3().crossVectors(tangent, sideA).normalize();
      previousSide = sideA;
      const ring = [];
      const radius = Math.max(0.0008, radii[k]);
      for (let j = 0; j <= sides; j += 1) {
        const angle = TAU * (j % sides) / sides;
        const ridge = Math.sin(angle * 11 + ridgePhase + accumulated * 0.22);
        const corrugation = colorMode === 'bark' ? 1 + 0.075 * ridge + 0.025 * Math.sin(angle * 5 + accumulated * 1.7) : 1;
        const offset = sideA.clone().multiplyScalar(Math.cos(angle) * radius * corrugation).addScaledVector(sideB, Math.sin(angle) * radius * corrugation);
        const vertex = point.clone().add(offset);
        const shade = clamp(Math.floor((ridge + 1) * 1.5), 0, 3);
        const color = colorMode === 'bark' ? barkColors[shade] : needleColors[1];
        ring.push(addVertex(batch, vertex, [TAU * radius * j / sides, accumulated], color));
      }
      rings.push(ring);
      if (k < points.length - 1) accumulated += points[k + 1].distanceTo(points[k]);
    }
    for (let k = 0; k < rings.length - 1; k += 1) {
      for (let j = 0; j < sides; j += 1) {
        const next = j + 1;
        addTriangle(batch, rings[k][j], rings[k + 1][next], rings[k + 1][j]);
        addTriangle(batch, rings[k][j], rings[k][next], rings[k + 1][next]);
      }
    }
    for (const end of [0, points.length - 1]) {
      const center = addVertex(batch, points[end], [0, 0], barkColors[1]);
      const capRing = [];
      for (let j = 0; j < sides; j += 1) {
        const id = rings[end][j];
        const angle = TAU * j / sides;
        const point = vector(batch.p[id * 3], batch.p[id * 3 + 1], batch.p[id * 3 + 2]);
        capRing.push(addVertex(batch, point, [Math.cos(angle) * radii[end], Math.sin(angle) * radii[end]], barkColors[1]));
      }
      for (let j = 0; j < sides; j += 1) {
        const next = (j + 1) % sides;
        if (end === 0) addTriangle(batch, center, capRing[next], capRing[j]);
        else addTriangle(batch, center, capRing[j], capRing[next]);
      }
    }
  };

  const addNeedle = (batch, base, direction, length, width, colorIndex) => {
    const dir = safeNormalize(direction, vector(0, 1, 0));
    const reference = Math.abs(dir.y) < 0.9 ? vector(0, 1, 0) : vector(1, 0, 0);
    const sideA = safeNormalize(new T.Vector3().crossVectors(dir, reference), vector(1, 0, 0));
    const sideB = safeNormalize(new T.Vector3().crossVectors(dir, sideA), vector(0, 0, 1));
    const tip = base.clone().addScaledVector(dir, length);
    const color = needleColors[clamp(colorIndex, 0, needleColors.length - 1)];
    const tipColor = color.map((value, i) => value * 0.82 + needleColors[3][i] * 0.18);
    const a0 = addVertex(batch, base.clone().addScaledVector(sideA, width * 0.5), [0, 0], color);
    const a1 = addVertex(batch, base.clone().addScaledVector(sideA, -width * 0.5), [width, 0], color);
    const at = addVertex(batch, tip, [width * 0.5, length], tipColor);
    const b0 = addVertex(batch, base.clone().addScaledVector(sideB, width * 0.5), [0, 0], color);
    const b1 = addVertex(batch, base.clone().addScaledVector(sideB, -width * 0.5), [width, 0], color);
    const bt = addVertex(batch, tip, [width * 0.5, length], tipColor);
    addTriangle(batch, a0, a1, at);
    addTriangle(batch, b0, b1, bt);
    needleCount += 1;
  };

  const makeGeometry = (batch) => {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(batch.p, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(batch.uv, 2));
    geometry.setAttribute('color', new T.Float32BufferAttribute(batch.c, 3));
    geometry.setIndex(batch.i);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    ownedGeometries.push(geometry);
    return geometry;
  };

  const makePart = (name) => {
    const group = new T.Group();
    group.name = name;
    group.userData.noMerge = true;
    root.add(group);
    return group;
  };
  const addPartMesh = (group, name, batch, material) => {
    if (batch.p.length === 0 || batch.i.length === 0) throw new Error(`${name} 没有有效几何`);
    const geometry = makeGeometry(batch);
    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    geometryByPart[group.name] = geometry;
    return mesh;
  };

  const trunkBatch = makeBatch();
  const rootFlareBatch = makeBatch();
  const primaryBatch = makeBatch();
  const secondaryBatch = makeBatch();
  const lowerFoliageBatch = makeBatch();
  const middleFoliageBatch = makeBatch();
  const upperFoliageBatch = makeBatch();
  const leaderBatch = makeBatch();

  const trunkCenters = [];
  const trunkRadii = [];
  const trunkHeight = 14.35;
  const bendPhase = between(0, TAU);
  const trunkPointAt = (y) => vector(
    0.075 * (Math.sin(y * 0.47 + bendPhase) - Math.sin(bendPhase)) + 0.025 * Math.sin(y * 1.17),
    y,
    -0.06 * (Math.cos(y * 0.38 + bendPhase) - Math.cos(bendPhase)) + 0.018 * Math.sin(y * 0.91),
  );
  const trunkRadiusAt = (y) => 0.003 + 0.255 * Math.pow(Math.max(0, 1 - y / trunkHeight), 1.12) + 0.05 * Math.exp(-y * 3.5);
  for (let k = 0; k <= 72; k += 1) {
    const y = trunkHeight * k / 72;
    trunkCenters.push(trunkPointAt(y));
    trunkRadii.push(trunkRadiusAt(y));
  }
  addTubePath(trunkBatch, trunkCenters, trunkRadii, 40, 'bark');

  const rootCount = 7 + Math.floor(random() * 2);
  const rootPhase = between(0, TAU);
  for (let j = 0; j < rootCount; j += 1) {
    const angle = rootPhase + j * 2.3999632297 + between(-0.24, 0.24);
    const radial = vector(Math.cos(angle), 0, Math.sin(angle));
    const lateral = vector(-radial.z, 0, radial.x);
    const start = trunkPointAt(0.14).addScaledVector(radial, 0.11);
    const reach = between(0.72, 1.08);
    const points = [
      start,
      start.clone().addScaledVector(radial, reach * 0.28).addScaledVector(lateral, between(-0.12, 0.12)).setY(between(0.04, 0.08)),
      start.clone().addScaledVector(radial, reach * 0.62).addScaledVector(lateral, between(-0.18, 0.18)).setY(between(0.025, 0.055)),
      start.clone().addScaledVector(radial, reach).addScaledVector(lateral, between(-0.24, 0.24)).setY(between(0.012, 0.025)),
    ];
    addTubePath(rootFlareBatch, points, [0.15, 0.105, 0.055, 0.018], 8, 'bark');
  }

  const makeNeedleCluster = (points, layerName, count, radii) => {
    const batch = layerName === 'lower' ? lowerFoliageBatch : (layerName === 'middle' ? middleFoliageBatch : upperFoliageBatch);
    const phase = between(0, TAU);
    for (let n = 0; n < count; n += 1) {
      // 沿小枝轴交错螺旋生长，而不是把一圈针叶堆在悬浮端点。
      const u = 0.08 + 0.91 * (n + between(0.08, 0.92)) / count;
      const segment = Math.min(points.length - 2, Math.floor(u * (points.length - 1)));
      const local = u * (points.length - 1) - segment;
      const dirTangent = points[segment + 1].clone().sub(points[segment]).normalize();
      const reference = Math.abs(dirTangent.y) < 0.88 ? vector(0, 1, 0) : vector(1, 0, 0);
      const sideA = new T.Vector3().crossVectors(dirTangent, reference).normalize();
      const sideB = new T.Vector3().crossVectors(dirTangent, sideA).normalize();
      const angle = phase + n * 2.3999632297 + between(-0.48, 0.48);
      const radial = sideA.multiplyScalar(Math.cos(angle)).addScaledVector(sideB, Math.sin(angle) * 0.65).normalize();
      const needleDirection = radial.clone().multiplyScalar(between(0.64, 0.95)).addScaledVector(dirTangent, between(0.35, 0.85));
      const radius = radii[segment] + (radii[segment + 1] - radii[segment]) * local;
      const base = points[segment].clone().lerp(points[segment + 1], local).addScaledVector(radial, radius * 0.76);
      const length = between(0.115, 0.18) * (0.95 + 0.05 * Math.sin(u * Math.PI));
      const width = between(0.012, 0.018);
      const colorIndex = u > 0.90 ? (random() < 0.25 ? 3 : 2) : (u < 0.35 ? (random() < 0.55 ? 0 : 1) : (random() < 0.72 ? 1 : 2));
      addNeedle(batch, base, needleDirection, length, width, colorIndex);
    }
  };

  const layerCount = 20;
  let primaryCount = 0;
  let secondaryCount = 0;
  let terminalTwigCount = 0;
  for (let layer = 0; layer < layerCount; layer += 1) {
    const t = layer / (layerCount - 1);
    const y = 1.34 + 11.9 * t + (layer === 0 ? 0 : between(-0.18, 0.18));
    const count = clamp(Math.round(7.6 - 2.4 * t + between(-0.9, 0.9)), 5, 8);
    const phase = between(-0.32, 0.32) + layer * 0.73;
    const layerLength = 0.19 + 2.25 * Math.pow(1 - t, 0.93);
    const layerName = y < 4.9 ? 'lower' : (y < 9.4 ? 'middle' : 'upper');
    for (let j = 0; j < count; j += 1) {
      const angle = phase + TAU * j / count + between(-0.16, 0.16);
      const radial = vector(Math.cos(angle), 0, Math.sin(angle));
      const tangent = vector(-Math.sin(angle), 0, Math.cos(angle));
      const branchLength = layerLength * between(0.82, 1.08);
      const branchY = y + between(-0.035 - 0.08 * t, 0.035 + 0.08 * t);
      const rootPoint = trunkPointAt(branchY).addScaledVector(radial, trunkRadiusAt(branchY) * 0.56);
      const sway = tangent.clone().multiplyScalar(between(-0.15, 0.15));
      const droop = between(0.23, 0.52) * (1 - 0.52 * t);
      const points = [
        rootPoint,
        rootPoint.clone().addScaledVector(radial, branchLength * 0.22).add(sway.clone().multiplyScalar(0.18)).setY(branchY - droop * 0.30),
        rootPoint.clone().addScaledVector(radial, branchLength * 0.48).add(sway.clone().multiplyScalar(0.42)).setY(branchY - droop * 0.80),
        rootPoint.clone().addScaledVector(radial, branchLength * 0.73).add(sway.clone().multiplyScalar(0.64)).setY(branchY - droop),
        rootPoint.clone().addScaledVector(radial, branchLength * 0.93).add(sway.clone().multiplyScalar(0.78)).setY(branchY - droop * 0.68),
        rootPoint.clone().addScaledVector(radial, branchLength).add(sway).setY(branchY - droop * 0.35 + between(-0.04, 0.06)),
      ];
      const branchRadius = 0.004 + 0.05 * Math.pow(1 - t, 1.15);
      const radii = [1, 0.76, 0.53, 0.34, 0.19, 0.06].map((factor) => branchRadius * factor);
      addTubePath(primaryBatch, points, radii, 7, 'bark');
      primaryCount += 1;

      makeNeedleCluster(points, layerName, Math.floor(between(22, 30)), radii);
      const secondaryPerPrimary = 8;
      for (let s = 0; s < secondaryPerPrimary; s += 1) {
        // 四对侧枝在主枝上前后错开，组成下垂羽状扇面。
        const pair = Math.floor(s / 2);
        const u = clamp(0.19 + pair * 0.24 + (s % 2) * 0.022 + between(-0.02, 0.02), 0.18, 0.95);
        const segment = Math.min(points.length - 2, Math.floor(u * (points.length - 1)));
        const localT = u * (points.length - 1) - segment;
        const start = points[segment].clone().lerp(points[segment + 1], localT);
        const sideSign = s % 2 === 0 ? -1 : 1;
        const secondaryAngle = angle + sideSign * between(0.58, 0.98) + between(-0.10, 0.10);
        const secondaryRadial = vector(Math.cos(secondaryAngle), 0, Math.sin(secondaryAngle));
        const secondaryTangent = vector(-Math.sin(secondaryAngle), 0, Math.cos(secondaryAngle));
        const length = (0.12 + branchLength * between(0.29, 0.40)) * (1 - 0.27 * u) * (1 - 0.18 * t);
        const secondaryPoints = [
          start,
          start.clone().addScaledVector(secondaryRadial, length * 0.34).addScaledVector(secondaryTangent, between(-0.06, 0.06)).setY(start.y - between(0.04, 0.12)),
          start.clone().addScaledVector(secondaryRadial, length * 0.70).addScaledVector(secondaryTangent, between(-0.10, 0.10)).setY(start.y - between(0.07, 0.18)),
          start.clone().addScaledVector(secondaryRadial, length).addScaledVector(secondaryTangent, between(-0.13, 0.13)).setY(start.y - between(0.04, 0.12)),
        ];
        const secondaryRadius = Math.max(0.002, branchRadius * (0.28 - 0.09 * u));
        const secondaryRadii = [secondaryRadius, secondaryRadius * 0.67, secondaryRadius * 0.38, 0.0013];
        addTubePath(secondaryBatch, secondaryPoints, secondaryRadii, 5, 'bark');
        secondaryCount += 1;
        makeNeedleCluster(secondaryPoints, layerName, Math.floor(between(25, 34)), secondaryRadii);

        for (let q = 0; q < 4; q += 1) {
          const v = 0.22 + Math.floor(q / 2) * 0.48 + (q % 2) * 0.095 + between(-0.045, 0.045);
          const seg = Math.min(secondaryPoints.length - 2, Math.floor(v * (secondaryPoints.length - 1)));
          const local = v * (secondaryPoints.length - 1) - seg;
          const twigStart = secondaryPoints[seg].clone().lerp(secondaryPoints[seg + 1], local);
          const twigAngle = secondaryAngle + (q % 2 === 0 ? -1 : 1) * between(0.40, 0.72);
          const twigRadial = vector(Math.cos(twigAngle), 0, Math.sin(twigAngle));
          const twigTangent = vector(-Math.sin(twigAngle), between(0.04, 0.16), Math.cos(twigAngle));
          const twigLength = between(0.18, 0.34) * (1 - 0.28 * t) * (1 - 0.15 * v);
          const twigDroop = between(0.035, 0.13) * (1 - 0.45 * t);
          const twigPoints = [
            twigStart,
            twigStart.clone().addScaledVector(twigRadial, twigLength * 0.55).addScaledVector(twigTangent, between(-0.025, 0.025)).setY(twigStart.y - twigDroop),
            twigStart.clone().addScaledVector(twigRadial, twigLength).addScaledVector(twigTangent, between(-0.035, 0.035)).setY(twigStart.y - twigDroop * 0.6 + between(-0.015, 0.025)),
          ];
          const twigRadii = [Math.min(0.004, secondaryRadius * 0.55), 0.0015, 0.0008];
          addTubePath(secondaryBatch, twigPoints, twigRadii, 3, 'bark');
          terminalTwigCount += 1;
          makeNeedleCluster(twigPoints, layerName, Math.floor(between(13, 19)), twigRadii);
        }
      }
    }
  }

  for (let j = 0; j < 24; j += 1) {
    const angle = j * 2.3999632297 + between(-0.22, 0.22);
    const radial = vector(Math.cos(angle), 0, Math.sin(angle));
    const y = 12.65 + j * 0.068;
    const twigStart = trunkPointAt(y);
    const twigEnd = twigStart.clone().addScaledVector(radial, between(0.13, 0.26) * (1 - j * 0.032)).add(vector(0, between(0.09, 0.18), 0));
    const leaderTwig = [twigStart, twigStart.clone().lerp(twigEnd, 0.6), twigEnd];
    const leaderRadii = [0.005, 0.003, 0.0011];
    addTubePath(leaderBatch, leaderTwig, leaderRadii, 5, 'bark');
    makeNeedleCluster(leaderTwig, 'upper', Math.floor(between(42, 58)), leaderRadii);
    terminalTwigCount += 1;
  }
  const leaderPoints = [trunkPointAt(12.9), trunkPointAt(13.65), trunkPointAt(trunkHeight)];
  makeNeedleCluster(leaderPoints, 'upper', 320, leaderPoints.map((point) => trunkRadiusAt(point.y)));

  const trunkPart = makePart('trunk');
  const rootFlarePart = makePart('root-flare');
  const primaryPart = makePart('branches.primary');
  const secondaryPart = makePart('branches.secondary');
  const lowerPart = makePart('foliage.lower');
  const middlePart = makePart('foliage.middle');
  const upperPart = makePart('foliage.upper');
  const leaderPart = makePart('leader');
  addPartMesh(trunkPart, 'trunk-batched', trunkBatch, barkMaterial);
  addPartMesh(rootFlarePart, 'root-flare-batched', rootFlareBatch, barkMaterial);
  addPartMesh(primaryPart, 'branches.primary-batched', primaryBatch, barkMaterial);
  addPartMesh(secondaryPart, 'branches.secondary-batched', secondaryBatch, barkMaterial);
  addPartMesh(lowerPart, 'foliage.lower-batched', lowerFoliageBatch, needleMaterial);
  addPartMesh(middlePart, 'foliage.middle-batched', middleFoliageBatch, needleMaterial);
  addPartMesh(upperPart, 'foliage.upper-batched', upperFoliageBatch, needleMaterial);
  addPartMesh(leaderPart, 'leader-batched', leaderBatch, barkMaterial);

  root.updateMatrixWorld(true);
  const rawBounds = new T.Box3().setFromObject(root);
  const rawSize = rawBounds.getSize(new T.Vector3());
  const rawCenter = rawBounds.getCenter(new T.Vector3());
  const scale = vector(targetSize[0] / rawSize.x, targetSize[1] / rawSize.y, targetSize[2] / rawSize.z);
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    const position = object.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i += 1) {
      position.setXYZ(
        i,
        (position.getX(i) - rawCenter.x) * scale.x,
        (position.getY(i) - rawBounds.min.y) * scale.y,
        (position.getZ(i) - rawCenter.z) * scale.z,
      );
    }
    position.needsUpdate = true;
    object.geometry.computeVertexNormals();
    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();
  });
  root.updateMatrixWorld(true);
  const actualBounds = new T.Box3().setFromObject(root);
  const actualSize = actualBounds.getSize(new T.Vector3());
  const actualMin = actualBounds.min;
  const actualMax = actualBounds.max;

  const measuredCollider = (low, high) => {
    const min = vector(Infinity, Infinity, Infinity);
    const max = vector(-Infinity, -Infinity, -Infinity);
    const clip = (polygon, plane, keepAbove) => {
      const result = [];
      for (let j = 0; j < polygon.length; j += 1) {
        const a = polygon[j];
        const b = polygon[(j + 1) % polygon.length];
        const insideA = keepAbove ? a.y >= plane : a.y <= plane;
        const insideB = keepAbove ? b.y >= plane : b.y <= plane;
        if (insideA) result.push(a);
        if (insideA !== insideB) result.push(a.clone().lerp(b, (plane - a.y) / (b.y - a.y)));
      }
      return result;
    };
    // 对归一化后的树干/根爪三角面按高度裁切再测量，三段之间不留采样空隙。
    for (const geometry of trunkGeometryList) {
      const position = geometry.getAttribute('position');
      const index = geometry.index;
      for (let i = 0; i < index.count; i += 3) {
        const triangle = [0, 1, 2].map((offset) => new T.Vector3().fromBufferAttribute(position, index.getX(i + offset)));
        const polygon = clip(clip(triangle, low, true), high, false);
        polygon.forEach((point) => { min.min(point); max.max(point); });
      }
    }
    if (!Number.isFinite(min.x)) throw new Error('无法从归一化树干测量碰撞段');
    return { min: min.toArray(), max: max.toArray(), surface: 'wood' };
  };
  trunkGeometryList.push(geometryByPart.trunk, geometryByPart['root-flare']);
  const colliders = [
    measuredCollider(0, 4.68),
    measuredCollider(4.68, 9.34),
    measuredCollider(9.34, 14.01),
  ];
  const leaderTop = vector();
  root.traverse((object) => {
    if (!object.isMesh) return;
    const position = object.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i += 1) {
      if (position.getY(i) >= leaderTop.y) leaderTop.fromBufferAttribute(position, i);
    }
  });
  const normalizedTrunkPoint = (y) => {
    const point = trunkPointAt(y);
    return [(point.x - rawCenter.x) * scale.x, (point.y - rawBounds.min.y) * scale.y, (point.z - rawCenter.z) * scale.z];
  };
  const rootParts = ['trunk', 'root-flare', 'branches.primary', 'branches.secondary', 'foliage.lower', 'foliage.middle', 'foliage.upper', 'leader'];
  let triangleCount = 0;
  let meshCount = 0;
  root.traverse((object) => {
    if (!object.isMesh) return;
    meshCount += 1;
    triangleCount += object.geometry.index ? object.geometry.index.count / 3 : object.geometry.getAttribute('position').count / 3;
  });

  root.userData = {
    assetId: 'new.nordic-spruce',
    authored: true,
    origin: 'bottom-center',
    forward: '+Z',
    size: actualSize.toArray(),
    recipe: {
      bark: 'wood_dark: authored brown-grey tapered bark with vertex color variation',
      needles: 'tarp: authored true-geometry crossed tapered needle triangles with vertex color variation',
    },
    colliders,
    sockets: {
      base: { position: [0, 0, 0] },
      tip: { position: leaderTop.toArray() },
      crown: { position: normalizedTrunkPoint(9.5) },
    },
    requiredPartNames: rootParts,
    requiredParts: rootParts,
    stats: {
      primaryBranches: primaryCount,
      secondaryBranches: secondaryCount,
      terminalTwigs: terminalTwigCount,
      branchLayers: layerCount,
      roots: rootCount,
      needles: needleCount,
      triangles: triangleCount,
      meshes: meshCount,
      materials: ['wood_dark', 'tarp'],
      lod: 'not implemented',
    },
    options: { seed },
  };

  let disposed = false;
  root.userData.dispose = () => {
    if (disposed) return;
    disposed = true;
    ownedGeometries.forEach((geometry) => geometry.dispose());
    ownedMaterials.forEach((material) => material.dispose());
  };

  const finiteValues = [actualMin.x, actualMin.y, actualMin.z, actualMax.x, actualMax.y, actualMax.z, ...actualSize.toArray()];
  if (!finiteValues.every(Number.isFinite)) throw new Error('nordic-spruce bbox contains non-finite values');
  return root;
}
