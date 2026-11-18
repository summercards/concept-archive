// 由 tools/build_authored.py 生成；仅限可信本地代码，不替代 window.DB。
// build(ctx, options) 返回 THREE.Object3D，hooks 位于 userData；真实性另行验收。
"use strict";
window.AUTHORED_BUILDERS = Object.create(null);
window.AUTHORED_BUILDERS["new.harbor-service-workbench"] = (function () {
// 原创港区维修工作台：仅提供 build，不注册主项目或访问全局状态。
function build(ctx, options = {}) {
  const THREE = ctx.THREE;
  const kit = ctx.kit;
  const mats = ctx.mats;
  const seed = options.seed === undefined ? 0 : options.seed;
  const colorName = options.color === undefined ? "paint_grey" : options.color;
  const drawerOpen = options.drawerOpen === undefined ? 0 : options.drawerOpen;
  const initialDrawerOpen = drawerOpen;
  if (![0, 1, 5].includes(seed)) throw new Error("seed 必须是 0、1 或 5");
  if (!["paint_grey", "paint_blue"].includes(colorName)) throw new Error("color 必须是 paint_grey 或 paint_blue");
  if (![0, 0.12].includes(drawerOpen)) throw new Error("drawerOpen 必须是 0 或 0.12");

  // seed 是宿主兼容参数；本静态样例不消费 rng，也不以 seed 改变外观。
  const paint = mats.get(colorName);
  const steel = mats.get("steel_dark");
  const wood = mats.get("wood_pallet");
  const rubber = mats.get("rubber");
  const labelInfo = mats.label("M-14");
  const labelMaterial = labelInfo.material;
  const root = new THREE.Group();
  root.name = "harborServiceWorkbench";

  const part = (name) => {
    const group = new THREE.Group();
    group.name = name;
    group.userData.noMerge = true;
    root.add(group);
    return group;
  };
  const box = (group, material, name, w, h, d, x, y, z, bevel = 0.006) => {
    const geometry = kit.metricBox(w, h, d, bevel);
    kit.place(geometry, x, y, z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const cylinder = (group, material, name, radius, height, x, y, z, segments = 12) => {
    const geometry = kit.cylinder(radius, radius, height, segments, false);
    kit.place(geometry, x, y, z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const tube = (group, material, name, points, radius) => {
    const geometry = kit.tube(points, radius, 8, false, 0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const frame = part("frame");
  const legPositions = [[-0.62, -0.245], [0.62, -0.245], [-0.62, 0.245], [0.62, 0.245]];
  for (const [x, z] of legPositions) {
    box(frame, steel, "leg", 0.06, 0.78, 0.06, x, 0.45, z, 0.006);
  }
  const supportRails = part("supportRails");
  box(supportRails, steel, "frontRail", 1.25, 0.055, 0.055, 0, 0.78, 0.255, 0.006);
  box(supportRails, steel, "rearRail", 1.25, 0.055, 0.055, 0, 0.78, -0.255, 0.006);
  box(supportRails, steel, "leftRail", 0.055, 0.055, 0.51, -0.62, 0.78, 0, 0.006);
  box(supportRails, steel, "rightRail", 0.055, 0.055, 0.51, 0.62, 0.78, 0, 0.006);

  const feet = part("feet");
  for (const [x, z] of legPositions) {
    box(feet, rubber, "footPad", 0.085, 0.06, 0.085, x, 0.03, z, 0.012);
  }

  const top = part("top");
  box(top, wood, "workSurface", 1.4, 0.06, 0.65, 0, 0.87, 0, 0.008);
  box(top, paint, "frontEdge", 1.32, 0.045, 0.024, 0, 0.825, 0.312, 0.004);
  box(top, paint, "leftEdge", 0.025, 0.045, 0.58, -0.687, 0.825, 0, 0.004);
  box(top, paint, "rightEdge", 0.025, 0.045, 0.58, 0.687, 0.825, 0, 0.004);

  const shelf = part("shelf");
  box(shelf, wood, "lowerShelf", 1.12, 0.055, 0.45, 0, 0.235, -0.005, 0.006);
  box(shelf, steel, "shelfFrontRail", 1.12, 0.035, 0.035, 0, 0.25, 0.225, 0.004);
  box(shelf, steel, "shelfRearRail", 1.12, 0.035, 0.035, 0, 0.25, -0.235, 0.004);

  const backBrace = part("backBrace");
  box(backBrace, steel, "backStiffener", 1.18, 0.055, 0.055, 0, 0.67, -0.265, 0.006);
  tube(backBrace, steel, "leftDiagonal", [[-0.56, 0.29, -0.265], [-0.43, 0.67, -0.265]], 0.014);
  tube(backBrace, steel, "rightDiagonal", [[0.56, 0.29, -0.265], [0.43, 0.67, -0.265]], 0.014);

  const drawer = part("drawer");
  drawer.position.z = drawerOpen;
  box(drawer, paint, "drawerFront", 0.72, 0.14, 0.03, 0, 0.62, 0.277, 0.005);
  box(drawer, wood, "drawerBottom", 0.68, 0.025, 0.27, 0, 0.545, 0.14, 0.004);
  box(drawer, paint, "drawerLeftSide", 0.025, 0.13, 0.27, -0.347, 0.61, 0.14, 0.004);
  box(drawer, paint, "drawerRightSide", 0.025, 0.13, 0.27, 0.347, 0.61, 0.14, 0.004);
  box(drawer, steel, "drawerGap", 0.76, 0.018, 0.014, 0, 0.532, 0.292, 0.002);

  const drawerSlides = part("drawerSlides");
  drawerSlides.position.z = drawerOpen;
  box(drawerSlides, steel, "leftSlide", 0.045, 0.025, 0.28, -0.39, 0.59, 0.13, 0.003);
  box(drawerSlides, steel, "rightSlide", 0.045, 0.025, 0.28, 0.39, 0.59, 0.13, 0.003);

  const handle = part("handle");
  handle.position.z = drawerOpen;
  tube(handle, steel, "drawerPull", [[-0.12, 0.62, 0.31], [0.12, 0.62, 0.31]], 0.012);
  cylinder(handle, steel, "leftMount", 0.016, 0.035, -0.12, 0.62, 0.295, 10);
  cylinder(handle, steel, "rightMount", 0.016, 0.035, 0.12, 0.62, 0.295, 10);

  const badge = part("badge");
  // 标签使用完整 0–1 UV，例外于实体部件的米制 UV；默认法线朝 +Z。
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.035), labelMaterial);
  label.name = "label_workbench";
  label.position.set(-0.47, 0.867, 0.325);
  label.castShadow = false;
  badge.add(label);

  root.userData.assetId = "new.harbor-service-workbench";
  root.userData.authored = true;
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  root.userData.size = bounds.getSize(new THREE.Vector3()).toArray();
  root.userData.nominalBounds = { min: [-0.7, 0, -0.325], max: [0.7, 0.9, 0.325] };
  root.userData.boundsEnvelope = { min: [-0.7, 0, -0.325], max: [0.7, 0.9, 0.445] };
  root.userData.colliders = [
    { min: [-0.66, 0.84, -0.29], max: [0.66, 0.9, 0.29], surface: "wood_pallet" },
    { min: [-0.65, 0.08, -0.275], max: [-0.59, 0.82, -0.215], surface: "steel_dark" },
    { min: [0.59, 0.08, -0.275], max: [0.65, 0.82, -0.215], surface: "steel_dark" },
    { min: [-0.65, 0.08, 0.215], max: [-0.59, 0.82, 0.275], surface: "steel_dark" },
    { min: [0.59, 0.08, 0.215], max: [0.65, 0.82, 0.275], surface: "steel_dark" },
    { min: [-0.56, 0.205, -0.23], max: [0.56, 0.265, 0.22], surface: "wood_pallet" },
    { min: [-0.36, 0.54, 0.12 + drawerOpen], max: [0.36, 0.7, 0.295 + drawerOpen], surface: colorName },
    { min: [-0.59, 0.64, -0.292], max: [0.59, 0.7, -0.238], surface: "steel_dark" }
  ];
  root.userData.sockets = { workSurface: { position: [0, 0.9, 0] } };
  root.userData.options = { seed, color: colorName, drawerOpen };

  let disposed = false;
  root.userData.reset = () => {
    drawer.position.z = initialDrawerOpen;
    drawerSlides.position.z = initialDrawerOpen;
    handle.position.z = initialDrawerOpen;
    root.userData.colliders[6].min = [-0.36, 0.54, 0.12 + initialDrawerOpen];
    root.userData.colliders[6].max = [0.36, 0.7, 0.295 + initialDrawerOpen];
    root.updateMatrixWorld(true);
  };
  root.userData.dispose = () => {
    if (disposed) return;
    disposed = true;
    root.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
    });
  };
  return root;
}

;
return { build };
})();

window.AUTHORED_BUILDERS["new.rubber-duck"] = (function () {
function build(ctx, options = {}) {
  const T = ctx.THREE;
  const color = options.color === undefined ? 'yellow' : options.color;
  if (color !== 'yellow' && color !== 'cream') throw new Error("options.color must be 'yellow' or 'cream'");

  const root = new T.Group();
  root.name = 'rubber-duck';
  const ownedGeometries = [];
  const ownedMaterials = [];
  const meshes = [];
  const targetSize = [0.15, 0.18, 0.21];
  const shellColor = color === 'cream' ? 0xffeaa6 : 0xffd52b;

  function material(name, hex, roughness = 0.34, clearcoat = 0.12, clearcoatRoughness = 0.3) {
    const m = new T.MeshPhysicalMaterial({
      color: hex,
      roughness,
      metalness: 0,
      clearcoat,
      clearcoatRoughness,
    });
    m.name = name;
    m.userData.recipe = 'duck-specific physical rubber, not original cached recipe';
    ownedMaterials.push(m);
    return m;
  }

  const rubber = material('rubber', shellColor);
  const beakMaterial = material('rubber', 0xfa8d16);
  const eyeMaterial = material('polymer_black', 0x090806, 0.22, 0.18, 0.22);
  const valveMaterial = material('plastic_grey', 0x8c8c84, 0.28, 0.08, 0.24);

  function rememberGeometry(g) {
    ownedGeometries.push(g);
    return g;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function length3(x, y, z) {
    return Math.hypot(x, y, z);
  }

  function ellipsoid(p, r) {
    const qx = p.x / r.x;
    const qy = p.y / r.y;
    const qz = p.z / r.z;
    const k0 = length3(qx, qy, qz);
    const k1 = length3(p.x / (r.x * r.x), p.y / (r.y * r.y), p.z / (r.z * r.z));
    return k1 < 1e-9 ? -Math.min(r.x, r.y, r.z) : k0 * (k0 - 1) / k1;
  }

  function smoothMin(a, b, k) {
    const h = clamp(0.5 + 0.5 * (b - a) / k, 0, 1);
    return (b * (1 - h) + a * h) - k * h * (1 - h);
  }

  function field(p) {
    // 躯干自然截平接地，不叠加会露出成脚环的独立底盘。
    const body = ellipsoid({ x: p.x, y: p.y - 0.052, z: p.z + 0.012 }, { x: 0.071, y: 0.058, z: 0.084 });
    const neck = ellipsoid({ x: p.x, y: p.y - 0.103, z: p.z - 0.029 }, { x: 0.037, y: 0.044, z: 0.037 });
    const head = ellipsoid({ x: p.x, y: p.y - 0.142, z: p.z - 0.035 }, { x: 0.049, y: 0.049, z: 0.049 });
    const tailBase = ellipsoid({ x: p.x, y: p.y - 0.083, z: p.z + 0.083 }, { x: 0.027, y: 0.022, z: 0.034 });
    const tailTip = ellipsoid({ x: p.x, y: p.y - 0.107, z: p.z + 0.106 }, { x: 0.014, y: 0.020, z: 0.027 });
    let shell = smoothMin(body, neck, 0.016);
    shell = smoothMin(shell, head, 0.018);
    shell = smoothMin(shell, tailBase, 0.018);
    shell = smoothMin(shell, tailTip, 0.018);
    return Math.max(shell, -p.y) + 1e-7;
  }

  function gradient(p, delta) {
    const d = delta === undefined ? 0.0003 : delta;
    const x = field({ x: p.x + d, y: p.y, z: p.z }) - field({ x: p.x - d, y: p.y, z: p.z });
    const y = field({ x: p.x, y: p.y + d, z: p.z }) - field({ x: p.x, y: p.y - d, z: p.z });
    const z = field({ x: p.x, y: p.y, z: p.z + d }) - field({ x: p.x, y: p.y, z: p.z - d });
    const n = new T.Vector3(x, y, z);
    if (n.lengthSq() < 1e-14) n.set(0, 1, 0);
    return n.normalize();
  }

  function makeShellGeometry() {
    const step = 0.006;
    const min = { x: -0.10, y: -0.008, z: -0.16 };
    const max = { x: 0.10, y: 0.21, z: 0.15 };
    const nx = Math.round((max.x - min.x) / step);
    const ny = Math.round((max.y - min.y) / step);
    const nz = Math.round((max.z - min.z) / step);
    const sx = nx + 1;
    const sy = ny + 1;
    const sz = nz + 1;
    const values = new Float32Array(sx * sy * sz);
    const pointId = (ix, iy, iz) => ix + sx * (iy + sy * iz);
    for (let iz = 0; iz <= nz; iz += 1) {
      const z = min.z + iz * step;
      for (let iy = 0; iy <= ny; iy += 1) {
        const y = min.y + iy * step;
        for (let ix = 0; ix <= nx; ix += 1) {
          const x = min.x + ix * step;
          values[pointId(ix, iy, iz)] = field({ x, y, z });
        }
      }
    }

    const surfacePositions = [];
    const surfaceNormals = [];
    const surfaceUVs = [];
    const surfaceIndices = [];
    const cellVertex = new Int32Array(nx * ny * nz);
    cellVertex.fill(-1);
    const cellId = (ix, iy, iz) => ix + nx * (iy + ny * iz);
    const cubeOffsets = [
      [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1],
      [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1],
    ];
    const cubeEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (let iz = 0; iz < nz; iz += 1) {
      for (let iy = 0; iy < ny; iy += 1) {
        for (let ix = 0; ix < nx; ix += 1) {
          const cube = cubeOffsets.map(o => {
            const gx = ix + o[0];
            const gy = iy + o[1];
            const gz = iz + o[2];
            return {
              x: min.x + gx * step,
              y: min.y + gy * step,
              z: min.z + gz * step,
              value: values[pointId(gx, gy, gz)],
            };
          });
          const minValue = Math.min(...cube.map(point => point.value));
          const maxValue = Math.max(...cube.map(point => point.value));
          if (!(minValue < 0 && maxValue >= 0)) continue;
          const center = new T.Vector3();
          let crossings = 0;
          for (const edge of cubeEdges) {
            const a = cube[edge[0]];
            const b = cube[edge[1]];
            if ((a.value < 0) === (b.value < 0)) continue;
            const denom = a.value - b.value;
            const t = Math.abs(denom) < 1e-12 ? 0.5 : clamp(a.value / denom, 0, 1);
            center.x += a.x + (b.x - a.x) * t;
            center.y += a.y + (b.y - a.y) * t;
            center.z += a.z + (b.z - a.z) * t;
            crossings += 1;
          }
          if (crossings === 0) continue;
          center.multiplyScalar(1 / crossings);
          // 将 dual-cell 平均点投回等值面，减小格点在光滑胶面上的环状反光。
          for (let iteration = 0; iteration < 3; iteration += 1) {
            const distance = field(center);
            const d = 0.0003;
            const derivative = new T.Vector3(
              (field({x: center.x + d, y: center.y, z: center.z}) - field({x: center.x - d, y: center.y, z: center.z})) / (2 * d),
              (field({x: center.x, y: center.y + d, z: center.z}) - field({x: center.x, y: center.y - d, z: center.z})) / (2 * d),
              (field({x: center.x, y: center.y, z: center.z + d}) - field({x: center.x, y: center.y, z: center.z - d})) / (2 * d)
            );
            const normSq = derivative.lengthSq();
            if (normSq < 1e-10 || Math.abs(distance) < 1e-7) break;
            const offset = derivative.multiplyScalar(distance / normSq);
            if (offset.length() > step * 0.45) offset.setLength(step * 0.45);
            center.sub(offset);
          }
          const index = surfacePositions.length / 3;
          surfacePositions.push(center.x, center.y, center.z);
          const normal = gradient(center);
          surfaceNormals.push(normal.x, normal.y, normal.z);
          surfaceUVs.push(0.5 + Math.atan2(center.z, center.x) / (Math.PI * 2), clamp(center.y / targetSize[1], 0, 1));
          cellVertex[cellId(ix, iy, iz)] = index;
        }
      }
    }
    function addSurfaceTriangle(a, b, c) {
      if (a < 0 || b < 0 || c < 0 || a === b || b === c || c === a) return;
      const ax = surfacePositions[b * 3] - surfacePositions[a * 3];
      const ay = surfacePositions[b * 3 + 1] - surfacePositions[a * 3 + 1];
      const az = surfacePositions[b * 3 + 2] - surfacePositions[a * 3 + 2];
      const bx = surfacePositions[c * 3] - surfacePositions[a * 3];
      const by = surfacePositions[c * 3 + 1] - surfacePositions[a * 3 + 1];
      const bz = surfacePositions[c * 3 + 2] - surfacePositions[a * 3 + 2];
      const cx = ay * bz - az * by;
      const cy = az * bx - ax * bz;
      const cz = ax * by - ay * bx;
      if (cx * cx + cy * cy + cz * cz <= 1e-18) return;
      const gx = surfaceNormals[a * 3] + surfaceNormals[b * 3] + surfaceNormals[c * 3];
      const gy = surfaceNormals[a * 3 + 1] + surfaceNormals[b * 3 + 1] + surfaceNormals[c * 3 + 1];
      const gz = surfaceNormals[a * 3 + 2] + surfaceNormals[b * 3 + 2] + surfaceNormals[c * 3 + 2];
      if (cx * gx + cy * gy + cz * gz < 0) surfaceIndices.push(a, c, b);
      else surfaceIndices.push(a, b, c);
    }
    function addSurfaceQuad(cells) {
      const ids = cells.map(cell => cellVertex[cellId(cell[0], cell[1], cell[2])]);
      if (ids.every(id => id >= 0)) {
        addSurfaceTriangle(ids[0], ids[1], ids[2]);
        addSurfaceTriangle(ids[0], ids[2], ids[3]);
      }
    }
    for (let iz = 0; iz <= nz; iz += 1) {
      for (let iy = 0; iy <= ny; iy += 1) {
        for (let ix = 0; ix < nx; ix += 1) {
          if ((values[pointId(ix, iy, iz)] < 0) === (values[pointId(ix + 1, iy, iz)] < 0)) continue;
          if (iy > 0 && iy < ny && iz > 0 && iz < nz) addSurfaceQuad([[ix, iy - 1, iz - 1], [ix, iy, iz - 1], [ix, iy, iz], [ix, iy - 1, iz]]);
        }
      }
    }
    for (let iz = 0; iz <= nz; iz += 1) {
      for (let iy = 0; iy < ny; iy += 1) {
        for (let ix = 0; ix <= nx; ix += 1) {
          if ((values[pointId(ix, iy, iz)] < 0) === (values[pointId(ix, iy + 1, iz)] < 0)) continue;
          if (ix > 0 && ix < nx && iz > 0 && iz < nz) addSurfaceQuad([[ix - 1, iy, iz - 1], [ix, iy, iz - 1], [ix, iy, iz], [ix - 1, iy, iz]]);
        }
      }
    }
    for (let iz = 0; iz < nz; iz += 1) {
      for (let iy = 0; iy <= ny; iy += 1) {
        for (let ix = 0; ix <= nx; ix += 1) {
          if ((values[pointId(ix, iy, iz)] < 0) === (values[pointId(ix, iy, iz + 1)] < 0)) continue;
          if (ix > 0 && ix < nx && iy > 0 && iy < ny) addSurfaceQuad([[ix - 1, iy - 1, iz], [ix, iy - 1, iz], [ix, iy, iz], [ix - 1, iy, iz]]);
        }
      }
    }
    const surfaceGeometry = new T.BufferGeometry();
    surfaceGeometry.setAttribute('position', new T.Float32BufferAttribute(surfacePositions, 3));
    surfaceGeometry.setAttribute('normal', new T.Float32BufferAttribute(surfaceNormals, 3));
    surfaceGeometry.setAttribute('uv', new T.Float32BufferAttribute(surfaceUVs, 2));
    surfaceGeometry.setIndex(surfaceIndices);
    surfaceGeometry.computeBoundingSphere();
    return rememberGeometry(surfaceGeometry);
  }

  function addMesh(name, geometry, mat, position, scale, rotation) {
    const mesh = new T.Mesh(geometry, mat);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (position) mesh.position.set(position[0], position[1], position[2]);
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    root.add(mesh);
    meshes.push(mesh);
    return mesh;
  }

  const shell = addMesh('body', makeShellGeometry(), rubber);

  function makeRoundedEllipsoid(segments, rings) {
    return rememberGeometry(new T.SphereGeometry(1, segments, rings));
  }

  const beakUpper = addMesh('beak.upper', makeRoundedEllipsoid(20, 10), beakMaterial, [0, 0.121, 0.091], [0.031, 0.008, 0.013]);
  const beakLower = addMesh('beak.lower', makeRoundedEllipsoid(20, 10), beakMaterial, [0, 0.112, 0.090], [0.028, 0.005, 0.011]);

  const smileCurve = new T.CatmullRomCurve3([
    new T.Vector3(-0.021, 0.116, 0.102),
    new T.Vector3(0, 0.113, 0.104),
    new T.Vector3(0.021, 0.116, 0.102),
  ]);
  addMesh('beak.smile-seam', rememberGeometry(new T.TubeGeometry(smileCurve, 8, 0.0010, 6, false)), eyeMaterial);

  addMesh('eye.left', makeRoundedEllipsoid(16, 10), eyeMaterial, [-0.026, 0.151, 0.082], [0.008, 0.009, 0.004]);
  addMesh('eye.right', makeRoundedEllipsoid(16, 10), eyeMaterial, [0.026, 0.151, 0.082], [0.008, 0.009, 0.004]);

  function makeWing(side) {
    const g = new T.SphereGeometry(1, 16, 10);
    const position = g.getAttribute('position');
    for (let i = 0; i < position.count; i += 1) {
      const px = position.getX(i);
      const py = position.getY(i);
      const pz = position.getZ(i);
      const droop = 0.004 * (1 - pz * pz);
      position.setXYZ(i,
        side * (0.061 + 0.009 * px + 0.003 * pz),
        0.078 + 0.019 * py - droop,
        0.004 + 0.030 * pz,
      );
    }
    position.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return rememberGeometry(g);
  }

  addMesh('wing.left', makeWing(-1), rubber);
  addMesh('wing.right', makeWing(1), rubber);

  const valveGeometry = rememberGeometry(new T.CylinderGeometry(0.008, 0.008, 0.005, 16, 1, false));
  addMesh('base.valve', valveGeometry, valveMaterial, [0, 0.0025, -0.024]);

  root.updateMatrixWorld(true);
  const rawBounds = new T.Box3().setFromObject(root);
  const rawSize = rawBounds.getSize(new T.Vector3());
  const rawCenter = rawBounds.getCenter(new T.Vector3());
  root.scale.set(targetSize[0] / rawSize.x, targetSize[1] / rawSize.y, targetSize[2] / rawSize.z);
  root.position.set(-rawCenter.x * root.scale.x, -rawBounds.min.y * root.scale.y, -rawCenter.z * root.scale.z);
  root.updateMatrixWorld(true);
  meshes.forEach(mesh => {
    mesh.updateMatrix();
    const baked = new T.Matrix4().multiplyMatrices(root.matrix, mesh.matrix);
    mesh.geometry.applyMatrix4(baked);
    const bakedPosition = mesh.geometry.getAttribute('position');
    for (let i = 0; i < bakedPosition.count; i += 1) {
      if (Math.abs(bakedPosition.getY(i)) < 1e-10) bakedPosition.setY(i, 0);
    }
    bakedPosition.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    const bakedNormal = mesh.geometry.getAttribute('normal');
    for (let i = 0; i < bakedNormal.count; i += 1) {
      const nx = bakedNormal.getX(i);
      const ny = bakedNormal.getY(i);
      const nz = bakedNormal.getZ(i);
      const length = Math.hypot(nx, ny, nz);
      if (length < 1e-12) bakedNormal.setXYZ(i, 0, 1, 0);
      else bakedNormal.setXYZ(i, nx / length, ny / length, nz / length);
    }
    bakedNormal.needsUpdate = true;
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    mesh.updateMatrix();
  });
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);
  const actualBounds = new T.Box3().setFromObject(root);
  const actualSize = actualBounds.getSize(new T.Vector3());
  const actualMin = actualBounds.min;
  const actualMax = actualBounds.max;

  root.userData = {
    assetId: 'new.rubber-duck',
    authored: true,
    origin: 'bottom-center',
    forward: '+Z',
    size: [actualSize.x, actualSize.y, actualSize.z],
    recipe: 'duck-specific physical rubber, not original cached recipe',
    colliders: [
      { min: [-0.066, 0.004, -0.078], max: [0.066, 0.127, 0.058], surface: 'rubber' },
      { min: [-0.046, 0.096, 0.018], max: [0.046, 0.179, 0.104], surface: 'rubber' },
    ],
    sockets: {
      grip: { position: [0, 0.08, 0] },
      base: { position: [0, 0, 0] },
    },
  };

  let disposed = false;
  root.userData.dispose = () => {
    if (disposed) return;
    disposed = true;
    ownedGeometries.forEach(g => g.dispose());
    ownedMaterials.forEach(m => m.dispose());
  };

  if (![actualMin.x, actualMin.y, actualMin.z, actualMax.x, actualMax.y, actualMax.z].every(Number.isFinite)) {
    throw new Error('rubber-duck bbox contains non-finite values');
  }
  return root;
}

;
return { build };
})();

window.AUTHORED_BUILDERS["new.nordic-spruce"] = (function () {
// 原创北欧云杉式常青树：真实分层枝条、根颈、针叶簇和可测碰撞；仅提供 build 导出。
function build(ctx, options = {}) {
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

;
return { build };
})();

window.AUTHORED_BUILDERS["new.quadruped-mech"] = (function () {
function build(ctx, options = {}) {
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

;
return { build };
})();
window.AUTHORED_CATALOG = {
  "meta": {
    "schemaVersion": 1,
    "total": 4,
    "source": "authored",
    "trust": "仅限可信本地代码；静态校验不是安全沙箱",
    "returnType": "THREE.Object3D",
    "hooks": "root.userData",
    "verification": "未进行几何、视觉或运行时验收"
  },
  "cats": [
    {
      "id": "NEW",
      "name": "原创资产",
      "desc": "独立原创注册账本，非原版资产",
      "color": "--model",
      "n": 4,
      "subs": [
        {
          "name": "原创模型",
          "n": 4
        }
      ]
    }
  ],
  "items": [
    {
      "id": "new.harbor-service-workbench",
      "cat": "NEW",
      "sub": "原创模型",
      "name": "港区维修工作台 · 制作示例",
      "en": "harbor-service-workbench",
      "kind": "authored",
      "focus": {
        "asset": "new.harbor-service-workbench",
        "options": {}
      },
      "params": [
        [
          "尺寸（米）",
          "1.4 × 0.9 × 0.65"
        ],
        [
          "原点",
          "bottom-center"
        ],
        [
          "朝向",
          "+Z"
        ],
        [
          "材质",
          "paint_grey, paint_blue, steel_dark, wood_pallet, rubber"
        ],
        [
          "必要部件",
          "frame, supportRails, top, workSurface, shelf, backBrace, drawer, drawerSlides, handle, feet, badge"
        ]
      ],
      "summary": "正式入库的原创制作示例：四腿钢框架、厚木台面、下层板、加劲梁、抽屉、拉手、脚垫与标签。支持灰/蓝换色及抽屉拉出，运行证据另见本轮独立报告。",
      "anchor": "assets/authored/harbor-service-workbench.js",
      "source": "harbor-service-workbench.js",
      "code": "// 原创港区维修工作台：仅提供 build，不注册主项目或访问全局状态。\nexport function build(ctx, options = {}) {\n  const THREE = ctx.THREE;\n  const kit = ctx.kit;\n  const mats = ctx.mats;\n  const seed = options.seed === undefined ? 0 : options.seed;\n  const colorName = options.color === undefined ? \"paint_grey\" : options.color;\n  const drawerOpen = options.drawerOpen === undefined ? 0 : options.drawerOpen;\n  const initialDrawerOpen = drawerOpen;\n  if (![0, 1, 5].includes(seed)) throw new Error(\"seed 必须是 0、1 或 5\");\n  if (![\"paint_grey\", \"paint_blue\"].includes(colorName)) throw new Error(\"color 必须是 paint_grey 或 paint_blue\");\n  if (![0, 0.12].includes(drawerOpen)) throw new Error(\"drawerOpen 必须是 0 或 0.12\");\n\n  // seed 是宿主兼容参数；本静态样例不消费 rng，也不以 seed 改变外观。\n  const paint = mats.get(colorName);\n  const steel = mats.get(\"steel_dark\");\n  const wood = mats.get(\"wood_pallet\");\n  const rubber = mats.get(\"rubber\");\n  const labelInfo = mats.label(\"M-14\");\n  const labelMaterial = labelInfo.material;\n  const root = new THREE.Group();\n  root.name = \"harborServiceWorkbench\";\n\n  const part = (name) => {\n    const group = new THREE.Group();\n    group.name = name;\n    group.userData.noMerge = true;\n    root.add(group);\n    return group;\n  };\n  const box = (group, material, name, w, h, d, x, y, z, bevel = 0.006) => {\n    const geometry = kit.metricBox(w, h, d, bevel);\n    kit.place(geometry, x, y, z);\n    const mesh = new THREE.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    return mesh;\n  };\n  const cylinder = (group, material, name, radius, height, x, y, z, segments = 12) => {\n    const geometry = kit.cylinder(radius, radius, height, segments, false);\n    kit.place(geometry, x, y, z);\n    const mesh = new THREE.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    return mesh;\n  };\n  const tube = (group, material, name, points, radius) => {\n    const geometry = kit.tube(points, radius, 8, false, 0);\n    const mesh = new THREE.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    return mesh;\n  };\n\n  const frame = part(\"frame\");\n  const legPositions = [[-0.62, -0.245], [0.62, -0.245], [-0.62, 0.245], [0.62, 0.245]];\n  for (const [x, z] of legPositions) {\n    box(frame, steel, \"leg\", 0.06, 0.78, 0.06, x, 0.45, z, 0.006);\n  }\n  const supportRails = part(\"supportRails\");\n  box(supportRails, steel, \"frontRail\", 1.25, 0.055, 0.055, 0, 0.78, 0.255, 0.006);\n  box(supportRails, steel, \"rearRail\", 1.25, 0.055, 0.055, 0, 0.78, -0.255, 0.006);\n  box(supportRails, steel, \"leftRail\", 0.055, 0.055, 0.51, -0.62, 0.78, 0, 0.006);\n  box(supportRails, steel, \"rightRail\", 0.055, 0.055, 0.51, 0.62, 0.78, 0, 0.006);\n\n  const feet = part(\"feet\");\n  for (const [x, z] of legPositions) {\n    box(feet, rubber, \"footPad\", 0.085, 0.06, 0.085, x, 0.03, z, 0.012);\n  }\n\n  const top = part(\"top\");\n  box(top, wood, \"workSurface\", 1.4, 0.06, 0.65, 0, 0.87, 0, 0.008);\n  box(top, paint, \"frontEdge\", 1.32, 0.045, 0.024, 0, 0.825, 0.312, 0.004);\n  box(top, paint, \"leftEdge\", 0.025, 0.045, 0.58, -0.687, 0.825, 0, 0.004);\n  box(top, paint, \"rightEdge\", 0.025, 0.045, 0.58, 0.687, 0.825, 0, 0.004);\n\n  const shelf = part(\"shelf\");\n  box(shelf, wood, \"lowerShelf\", 1.12, 0.055, 0.45, 0, 0.235, -0.005, 0.006);\n  box(shelf, steel, \"shelfFrontRail\", 1.12, 0.035, 0.035, 0, 0.25, 0.225, 0.004);\n  box(shelf, steel, \"shelfRearRail\", 1.12, 0.035, 0.035, 0, 0.25, -0.235, 0.004);\n\n  const backBrace = part(\"backBrace\");\n  box(backBrace, steel, \"backStiffener\", 1.18, 0.055, 0.055, 0, 0.67, -0.265, 0.006);\n  tube(backBrace, steel, \"leftDiagonal\", [[-0.56, 0.29, -0.265], [-0.43, 0.67, -0.265]], 0.014);\n  tube(backBrace, steel, \"rightDiagonal\", [[0.56, 0.29, -0.265], [0.43, 0.67, -0.265]], 0.014);\n\n  const drawer = part(\"drawer\");\n  drawer.position.z = drawerOpen;\n  box(drawer, paint, \"drawerFront\", 0.72, 0.14, 0.03, 0, 0.62, 0.277, 0.005);\n  box(drawer, wood, \"drawerBottom\", 0.68, 0.025, 0.27, 0, 0.545, 0.14, 0.004);\n  box(drawer, paint, \"drawerLeftSide\", 0.025, 0.13, 0.27, -0.347, 0.61, 0.14, 0.004);\n  box(drawer, paint, \"drawerRightSide\", 0.025, 0.13, 0.27, 0.347, 0.61, 0.14, 0.004);\n  box(drawer, steel, \"drawerGap\", 0.76, 0.018, 0.014, 0, 0.532, 0.292, 0.002);\n\n  const drawerSlides = part(\"drawerSlides\");\n  drawerSlides.position.z = drawerOpen;\n  box(drawerSlides, steel, \"leftSlide\", 0.045, 0.025, 0.28, -0.39, 0.59, 0.13, 0.003);\n  box(drawerSlides, steel, \"rightSlide\", 0.045, 0.025, 0.28, 0.39, 0.59, 0.13, 0.003);\n\n  const handle = part(\"handle\");\n  handle.position.z = drawerOpen;\n  tube(handle, steel, \"drawerPull\", [[-0.12, 0.62, 0.31], [0.12, 0.62, 0.31]], 0.012);\n  cylinder(handle, steel, \"leftMount\", 0.016, 0.035, -0.12, 0.62, 0.295, 10);\n  cylinder(handle, steel, \"rightMount\", 0.016, 0.035, 0.12, 0.62, 0.295, 10);\n\n  const badge = part(\"badge\");\n  // 标签使用完整 0–1 UV，例外于实体部件的米制 UV；默认法线朝 +Z。\n  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.035), labelMaterial);\n  label.name = \"label_workbench\";\n  label.position.set(-0.47, 0.867, 0.325);\n  label.castShadow = false;\n  badge.add(label);\n\n  root.userData.assetId = \"new.harbor-service-workbench\";\n  root.userData.authored = true;\n  root.updateMatrixWorld(true);\n  const bounds = new THREE.Box3().setFromObject(root);\n  root.userData.size = bounds.getSize(new THREE.Vector3()).toArray();\n  root.userData.nominalBounds = { min: [-0.7, 0, -0.325], max: [0.7, 0.9, 0.325] };\n  root.userData.boundsEnvelope = { min: [-0.7, 0, -0.325], max: [0.7, 0.9, 0.445] };\n  root.userData.colliders = [\n    { min: [-0.66, 0.84, -0.29], max: [0.66, 0.9, 0.29], surface: \"wood_pallet\" },\n    { min: [-0.65, 0.08, -0.275], max: [-0.59, 0.82, -0.215], surface: \"steel_dark\" },\n    { min: [0.59, 0.08, -0.275], max: [0.65, 0.82, -0.215], surface: \"steel_dark\" },\n    { min: [-0.65, 0.08, 0.215], max: [-0.59, 0.82, 0.275], surface: \"steel_dark\" },\n    { min: [0.59, 0.08, 0.215], max: [0.65, 0.82, 0.275], surface: \"steel_dark\" },\n    { min: [-0.56, 0.205, -0.23], max: [0.56, 0.265, 0.22], surface: \"wood_pallet\" },\n    { min: [-0.36, 0.54, 0.12 + drawerOpen], max: [0.36, 0.7, 0.295 + drawerOpen], surface: colorName },\n    { min: [-0.59, 0.64, -0.292], max: [0.59, 0.7, -0.238], surface: \"steel_dark\" }\n  ];\n  root.userData.sockets = { workSurface: { position: [0, 0.9, 0] } };\n  root.userData.options = { seed, color: colorName, drawerOpen };\n\n  let disposed = false;\n  root.userData.reset = () => {\n    drawer.position.z = initialDrawerOpen;\n    drawerSlides.position.z = initialDrawerOpen;\n    handle.position.z = initialDrawerOpen;\n    root.userData.colliders[6].min = [-0.36, 0.54, 0.12 + initialDrawerOpen];\n    root.userData.colliders[6].max = [0.36, 0.7, 0.295 + initialDrawerOpen];\n    root.updateMatrixWorld(true);\n  };\n  root.userData.dispose = () => {\n    if (disposed) return;\n    disposed = true;\n    root.traverse((object) => {\n      if (object.geometry) object.geometry.dispose();\n    });\n  };\n  return root;\n}\n",
      "tags": [
        "原创",
        "示例",
        "港区",
        "维修",
        "工作台",
        "程序化资产"
      ],
      "contract": {
        "units": "m",
        "size": [
          1.4,
          0.9,
          0.65
        ],
        "origin": "bottom-center",
        "forward": "+Z",
        "qualityTier": "catalog",
        "materials": [
          "paint_grey",
          "paint_blue",
          "steel_dark",
          "wood_pallet",
          "rubber"
        ],
        "requiredParts": [
          "frame",
          "supportRails",
          "top",
          "workSurface",
          "shelf",
          "backBrace",
          "drawer",
          "drawerSlides",
          "handle",
          "feet",
          "badge"
        ],
        "options": {
          "seed": {
            "type": "integer",
            "default": 0,
            "values": [
              0,
              1,
              5
            ],
            "note": "仅兼容参数，不消费 ctx.rng，不改变几何或材质。"
          },
          "color": {
            "type": "string",
            "default": "paint_grey",
            "values": [
              "paint_grey",
              "paint_blue"
            ]
          },
          "drawerOpen": {
            "type": "number",
            "default": 0,
            "values": [
              0,
              0.12
            ],
            "note": "构建时静态平移，不提供自动 update。"
          }
        },
        "dynamic": false,
        "collidersRequired": true,
        "sizeTolerance": {
          "meters": 0.01,
          "percent": 0.01
        },
        "budget": {
          "triangles": 6000,
          "maxMeshes": 60
        },
        "nominalBounds": {
          "min": [
            -0.7,
            0,
            -0.325
          ],
          "max": [
            0.7,
            0.9,
            0.325
          ]
        },
        "boundsEnvelope": {
          "min": [
            -0.7,
            0,
            -0.325
          ],
          "max": [
            0.7,
            0.9,
            0.445
          ]
        },
        "variantEnvelopes": [
          {
            "options": {
              "drawerOpen": 0
            },
            "min": [
              -0.7,
              0,
              -0.325
            ],
            "max": [
              0.7,
              0.9,
              0.325
            ]
          },
          {
            "options": {
              "drawerOpen": 0.12
            },
            "min": [
              -0.7,
              0,
              -0.325
            ],
            "max": [
              0.7,
              0.9,
              0.445
            ]
          }
        ],
        "baseline": {
          "type": "new-design",
          "referenceAssets": [
            "prop.shelf_rack",
            "prop.toolbox_cart"
          ],
          "referenceScope": "仅承重框架和收纳层级的结构级参考；未执行比较测量，不声称 measured=true。"
        }
      },
      "acceptance": {
        "catalog": "unverified",
        "geometry": "unverified",
        "visual": "unverified",
        "runtime": "unverified"
      },
      "sourceHash": "a079559be376ab36fb06e26eba15d0761d9a7fb7b47ca137bc45a69cb9083d91",
      "evidence": {
        "report": "outputs/workbench-review/release/report.json"
      }
    },
    {
      "id": "new.rubber-duck",
      "cat": "NEW",
      "sub": "原创模型",
      "name": "小黄鸭 · 软胶玩具",
      "en": "rubber-duck",
      "kind": "authored",
      "focus": {
        "asset": "new.rubber-duck",
        "options": {}
      },
      "params": [
        [
          "尺寸（米）",
          "0.15 × 0.18 × 0.21"
        ],
        [
          "原点",
          "bottom-center"
        ],
        [
          "朝向",
          "+Z"
        ],
        [
          "材质",
          "rubber, polymer_black, plastic_grey"
        ],
        [
          "必要部件",
          "body, beak.upper, beak.lower, eye.left, eye.right, wing.left, wing.right, base.valve"
        ]
      ],
      "summary": "原创代码生成的圆润软胶小黄鸭，连续鸭身与头颈、上翘尾部、独立上下鸭嘴、黑眼睛、水滴翅膀和底部气阀。默认黄色，支持奶油色变体；尺寸 15 × 18 × 21 cm。",
      "anchor": "assets/authored/rubber-duck.js",
      "source": "rubber-duck.js",
      "code": "export function build(ctx, options = {}) {\n  const T = ctx.THREE;\n  const color = options.color === undefined ? 'yellow' : options.color;\n  if (color !== 'yellow' && color !== 'cream') throw new Error(\"options.color must be 'yellow' or 'cream'\");\n\n  const root = new T.Group();\n  root.name = 'rubber-duck';\n  const ownedGeometries = [];\n  const ownedMaterials = [];\n  const meshes = [];\n  const targetSize = [0.15, 0.18, 0.21];\n  const shellColor = color === 'cream' ? 0xffeaa6 : 0xffd52b;\n\n  function material(name, hex, roughness = 0.34, clearcoat = 0.12, clearcoatRoughness = 0.3) {\n    const m = new T.MeshPhysicalMaterial({\n      color: hex,\n      roughness,\n      metalness: 0,\n      clearcoat,\n      clearcoatRoughness,\n    });\n    m.name = name;\n    m.userData.recipe = 'duck-specific physical rubber, not original cached recipe';\n    ownedMaterials.push(m);\n    return m;\n  }\n\n  const rubber = material('rubber', shellColor);\n  const beakMaterial = material('rubber', 0xfa8d16);\n  const eyeMaterial = material('polymer_black', 0x090806, 0.22, 0.18, 0.22);\n  const valveMaterial = material('plastic_grey', 0x8c8c84, 0.28, 0.08, 0.24);\n\n  function rememberGeometry(g) {\n    ownedGeometries.push(g);\n    return g;\n  }\n\n  function clamp(v, a, b) {\n    return Math.max(a, Math.min(b, v));\n  }\n\n  function length3(x, y, z) {\n    return Math.hypot(x, y, z);\n  }\n\n  function ellipsoid(p, r) {\n    const qx = p.x / r.x;\n    const qy = p.y / r.y;\n    const qz = p.z / r.z;\n    const k0 = length3(qx, qy, qz);\n    const k1 = length3(p.x / (r.x * r.x), p.y / (r.y * r.y), p.z / (r.z * r.z));\n    return k1 \u003c 1e-9 ? -Math.min(r.x, r.y, r.z) : k0 * (k0 - 1) / k1;\n  }\n\n  function smoothMin(a, b, k) {\n    const h = clamp(0.5 + 0.5 * (b - a) / k, 0, 1);\n    return (b * (1 - h) + a * h) - k * h * (1 - h);\n  }\n\n  function field(p) {\n    // 躯干自然截平接地，不叠加会露出成脚环的独立底盘。\n    const body = ellipsoid({ x: p.x, y: p.y - 0.052, z: p.z + 0.012 }, { x: 0.071, y: 0.058, z: 0.084 });\n    const neck = ellipsoid({ x: p.x, y: p.y - 0.103, z: p.z - 0.029 }, { x: 0.037, y: 0.044, z: 0.037 });\n    const head = ellipsoid({ x: p.x, y: p.y - 0.142, z: p.z - 0.035 }, { x: 0.049, y: 0.049, z: 0.049 });\n    const tailBase = ellipsoid({ x: p.x, y: p.y - 0.083, z: p.z + 0.083 }, { x: 0.027, y: 0.022, z: 0.034 });\n    const tailTip = ellipsoid({ x: p.x, y: p.y - 0.107, z: p.z + 0.106 }, { x: 0.014, y: 0.020, z: 0.027 });\n    let shell = smoothMin(body, neck, 0.016);\n    shell = smoothMin(shell, head, 0.018);\n    shell = smoothMin(shell, tailBase, 0.018);\n    shell = smoothMin(shell, tailTip, 0.018);\n    return Math.max(shell, -p.y) + 1e-7;\n  }\n\n  function gradient(p, delta) {\n    const d = delta === undefined ? 0.0003 : delta;\n    const x = field({ x: p.x + d, y: p.y, z: p.z }) - field({ x: p.x - d, y: p.y, z: p.z });\n    const y = field({ x: p.x, y: p.y + d, z: p.z }) - field({ x: p.x, y: p.y - d, z: p.z });\n    const z = field({ x: p.x, y: p.y, z: p.z + d }) - field({ x: p.x, y: p.y, z: p.z - d });\n    const n = new T.Vector3(x, y, z);\n    if (n.lengthSq() \u003c 1e-14) n.set(0, 1, 0);\n    return n.normalize();\n  }\n\n  function makeShellGeometry() {\n    const step = 0.006;\n    const min = { x: -0.10, y: -0.008, z: -0.16 };\n    const max = { x: 0.10, y: 0.21, z: 0.15 };\n    const nx = Math.round((max.x - min.x) / step);\n    const ny = Math.round((max.y - min.y) / step);\n    const nz = Math.round((max.z - min.z) / step);\n    const sx = nx + 1;\n    const sy = ny + 1;\n    const sz = nz + 1;\n    const values = new Float32Array(sx * sy * sz);\n    const pointId = (ix, iy, iz) => ix + sx * (iy + sy * iz);\n    for (let iz = 0; iz \u003c= nz; iz += 1) {\n      const z = min.z + iz * step;\n      for (let iy = 0; iy \u003c= ny; iy += 1) {\n        const y = min.y + iy * step;\n        for (let ix = 0; ix \u003c= nx; ix += 1) {\n          const x = min.x + ix * step;\n          values[pointId(ix, iy, iz)] = field({ x, y, z });\n        }\n      }\n    }\n\n    const surfacePositions = [];\n    const surfaceNormals = [];\n    const surfaceUVs = [];\n    const surfaceIndices = [];\n    const cellVertex = new Int32Array(nx * ny * nz);\n    cellVertex.fill(-1);\n    const cellId = (ix, iy, iz) => ix + nx * (iy + ny * iz);\n    const cubeOffsets = [\n      [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1],\n      [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1],\n    ];\n    const cubeEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];\n    for (let iz = 0; iz \u003c nz; iz += 1) {\n      for (let iy = 0; iy \u003c ny; iy += 1) {\n        for (let ix = 0; ix \u003c nx; ix += 1) {\n          const cube = cubeOffsets.map(o => {\n            const gx = ix + o[0];\n            const gy = iy + o[1];\n            const gz = iz + o[2];\n            return {\n              x: min.x + gx * step,\n              y: min.y + gy * step,\n              z: min.z + gz * step,\n              value: values[pointId(gx, gy, gz)],\n            };\n          });\n          const minValue = Math.min(...cube.map(point => point.value));\n          const maxValue = Math.max(...cube.map(point => point.value));\n          if (!(minValue \u003c 0 && maxValue >= 0)) continue;\n          const center = new T.Vector3();\n          let crossings = 0;\n          for (const edge of cubeEdges) {\n            const a = cube[edge[0]];\n            const b = cube[edge[1]];\n            if ((a.value \u003c 0) === (b.value \u003c 0)) continue;\n            const denom = a.value - b.value;\n            const t = Math.abs(denom) \u003c 1e-12 ? 0.5 : clamp(a.value / denom, 0, 1);\n            center.x += a.x + (b.x - a.x) * t;\n            center.y += a.y + (b.y - a.y) * t;\n            center.z += a.z + (b.z - a.z) * t;\n            crossings += 1;\n          }\n          if (crossings === 0) continue;\n          center.multiplyScalar(1 / crossings);\n          // 将 dual-cell 平均点投回等值面，减小格点在光滑胶面上的环状反光。\n          for (let iteration = 0; iteration \u003c 3; iteration += 1) {\n            const distance = field(center);\n            const d = 0.0003;\n            const derivative = new T.Vector3(\n              (field({x: center.x + d, y: center.y, z: center.z}) - field({x: center.x - d, y: center.y, z: center.z})) / (2 * d),\n              (field({x: center.x, y: center.y + d, z: center.z}) - field({x: center.x, y: center.y - d, z: center.z})) / (2 * d),\n              (field({x: center.x, y: center.y, z: center.z + d}) - field({x: center.x, y: center.y, z: center.z - d})) / (2 * d)\n            );\n            const normSq = derivative.lengthSq();\n            if (normSq \u003c 1e-10 || Math.abs(distance) \u003c 1e-7) break;\n            const offset = derivative.multiplyScalar(distance / normSq);\n            if (offset.length() > step * 0.45) offset.setLength(step * 0.45);\n            center.sub(offset);\n          }\n          const index = surfacePositions.length / 3;\n          surfacePositions.push(center.x, center.y, center.z);\n          const normal = gradient(center);\n          surfaceNormals.push(normal.x, normal.y, normal.z);\n          surfaceUVs.push(0.5 + Math.atan2(center.z, center.x) / (Math.PI * 2), clamp(center.y / targetSize[1], 0, 1));\n          cellVertex[cellId(ix, iy, iz)] = index;\n        }\n      }\n    }\n    function addSurfaceTriangle(a, b, c) {\n      if (a \u003c 0 || b \u003c 0 || c \u003c 0 || a === b || b === c || c === a) return;\n      const ax = surfacePositions[b * 3] - surfacePositions[a * 3];\n      const ay = surfacePositions[b * 3 + 1] - surfacePositions[a * 3 + 1];\n      const az = surfacePositions[b * 3 + 2] - surfacePositions[a * 3 + 2];\n      const bx = surfacePositions[c * 3] - surfacePositions[a * 3];\n      const by = surfacePositions[c * 3 + 1] - surfacePositions[a * 3 + 1];\n      const bz = surfacePositions[c * 3 + 2] - surfacePositions[a * 3 + 2];\n      const cx = ay * bz - az * by;\n      const cy = az * bx - ax * bz;\n      const cz = ax * by - ay * bx;\n      if (cx * cx + cy * cy + cz * cz \u003c= 1e-18) return;\n      const gx = surfaceNormals[a * 3] + surfaceNormals[b * 3] + surfaceNormals[c * 3];\n      const gy = surfaceNormals[a * 3 + 1] + surfaceNormals[b * 3 + 1] + surfaceNormals[c * 3 + 1];\n      const gz = surfaceNormals[a * 3 + 2] + surfaceNormals[b * 3 + 2] + surfaceNormals[c * 3 + 2];\n      if (cx * gx + cy * gy + cz * gz \u003c 0) surfaceIndices.push(a, c, b);\n      else surfaceIndices.push(a, b, c);\n    }\n    function addSurfaceQuad(cells) {\n      const ids = cells.map(cell => cellVertex[cellId(cell[0], cell[1], cell[2])]);\n      if (ids.every(id => id >= 0)) {\n        addSurfaceTriangle(ids[0], ids[1], ids[2]);\n        addSurfaceTriangle(ids[0], ids[2], ids[3]);\n      }\n    }\n    for (let iz = 0; iz \u003c= nz; iz += 1) {\n      for (let iy = 0; iy \u003c= ny; iy += 1) {\n        for (let ix = 0; ix \u003c nx; ix += 1) {\n          if ((values[pointId(ix, iy, iz)] \u003c 0) === (values[pointId(ix + 1, iy, iz)] \u003c 0)) continue;\n          if (iy > 0 && iy \u003c ny && iz > 0 && iz \u003c nz) addSurfaceQuad([[ix, iy - 1, iz - 1], [ix, iy, iz - 1], [ix, iy, iz], [ix, iy - 1, iz]]);\n        }\n      }\n    }\n    for (let iz = 0; iz \u003c= nz; iz += 1) {\n      for (let iy = 0; iy \u003c ny; iy += 1) {\n        for (let ix = 0; ix \u003c= nx; ix += 1) {\n          if ((values[pointId(ix, iy, iz)] \u003c 0) === (values[pointId(ix, iy + 1, iz)] \u003c 0)) continue;\n          if (ix > 0 && ix \u003c nx && iz > 0 && iz \u003c nz) addSurfaceQuad([[ix - 1, iy, iz - 1], [ix, iy, iz - 1], [ix, iy, iz], [ix - 1, iy, iz]]);\n        }\n      }\n    }\n    for (let iz = 0; iz \u003c nz; iz += 1) {\n      for (let iy = 0; iy \u003c= ny; iy += 1) {\n        for (let ix = 0; ix \u003c= nx; ix += 1) {\n          if ((values[pointId(ix, iy, iz)] \u003c 0) === (values[pointId(ix, iy, iz + 1)] \u003c 0)) continue;\n          if (ix > 0 && ix \u003c nx && iy > 0 && iy \u003c ny) addSurfaceQuad([[ix - 1, iy - 1, iz], [ix, iy - 1, iz], [ix, iy, iz], [ix - 1, iy, iz]]);\n        }\n      }\n    }\n    const surfaceGeometry = new T.BufferGeometry();\n    surfaceGeometry.setAttribute('position', new T.Float32BufferAttribute(surfacePositions, 3));\n    surfaceGeometry.setAttribute('normal', new T.Float32BufferAttribute(surfaceNormals, 3));\n    surfaceGeometry.setAttribute('uv', new T.Float32BufferAttribute(surfaceUVs, 2));\n    surfaceGeometry.setIndex(surfaceIndices);\n    surfaceGeometry.computeBoundingSphere();\n    return rememberGeometry(surfaceGeometry);\n  }\n\n  function addMesh(name, geometry, mat, position, scale, rotation) {\n    const mesh = new T.Mesh(geometry, mat);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    if (position) mesh.position.set(position[0], position[1], position[2]);\n    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);\n    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);\n    root.add(mesh);\n    meshes.push(mesh);\n    return mesh;\n  }\n\n  const shell = addMesh('body', makeShellGeometry(), rubber);\n\n  function makeRoundedEllipsoid(segments, rings) {\n    return rememberGeometry(new T.SphereGeometry(1, segments, rings));\n  }\n\n  const beakUpper = addMesh('beak.upper', makeRoundedEllipsoid(20, 10), beakMaterial, [0, 0.121, 0.091], [0.031, 0.008, 0.013]);\n  const beakLower = addMesh('beak.lower', makeRoundedEllipsoid(20, 10), beakMaterial, [0, 0.112, 0.090], [0.028, 0.005, 0.011]);\n\n  const smileCurve = new T.CatmullRomCurve3([\n    new T.Vector3(-0.021, 0.116, 0.102),\n    new T.Vector3(0, 0.113, 0.104),\n    new T.Vector3(0.021, 0.116, 0.102),\n  ]);\n  addMesh('beak.smile-seam', rememberGeometry(new T.TubeGeometry(smileCurve, 8, 0.0010, 6, false)), eyeMaterial);\n\n  addMesh('eye.left', makeRoundedEllipsoid(16, 10), eyeMaterial, [-0.026, 0.151, 0.082], [0.008, 0.009, 0.004]);\n  addMesh('eye.right', makeRoundedEllipsoid(16, 10), eyeMaterial, [0.026, 0.151, 0.082], [0.008, 0.009, 0.004]);\n\n  function makeWing(side) {\n    const g = new T.SphereGeometry(1, 16, 10);\n    const position = g.getAttribute('position');\n    for (let i = 0; i \u003c position.count; i += 1) {\n      const px = position.getX(i);\n      const py = position.getY(i);\n      const pz = position.getZ(i);\n      const droop = 0.004 * (1 - pz * pz);\n      position.setXYZ(i,\n        side * (0.061 + 0.009 * px + 0.003 * pz),\n        0.078 + 0.019 * py - droop,\n        0.004 + 0.030 * pz,\n      );\n    }\n    position.needsUpdate = true;\n    g.computeVertexNormals();\n    g.computeBoundingSphere();\n    return rememberGeometry(g);\n  }\n\n  addMesh('wing.left', makeWing(-1), rubber);\n  addMesh('wing.right', makeWing(1), rubber);\n\n  const valveGeometry = rememberGeometry(new T.CylinderGeometry(0.008, 0.008, 0.005, 16, 1, false));\n  addMesh('base.valve', valveGeometry, valveMaterial, [0, 0.0025, -0.024]);\n\n  root.updateMatrixWorld(true);\n  const rawBounds = new T.Box3().setFromObject(root);\n  const rawSize = rawBounds.getSize(new T.Vector3());\n  const rawCenter = rawBounds.getCenter(new T.Vector3());\n  root.scale.set(targetSize[0] / rawSize.x, targetSize[1] / rawSize.y, targetSize[2] / rawSize.z);\n  root.position.set(-rawCenter.x * root.scale.x, -rawBounds.min.y * root.scale.y, -rawCenter.z * root.scale.z);\n  root.updateMatrixWorld(true);\n  meshes.forEach(mesh => {\n    mesh.updateMatrix();\n    const baked = new T.Matrix4().multiplyMatrices(root.matrix, mesh.matrix);\n    mesh.geometry.applyMatrix4(baked);\n    const bakedPosition = mesh.geometry.getAttribute('position');\n    for (let i = 0; i \u003c bakedPosition.count; i += 1) {\n      if (Math.abs(bakedPosition.getY(i)) \u003c 1e-10) bakedPosition.setY(i, 0);\n    }\n    bakedPosition.needsUpdate = true;\n    mesh.geometry.computeVertexNormals();\n    const bakedNormal = mesh.geometry.getAttribute('normal');\n    for (let i = 0; i \u003c bakedNormal.count; i += 1) {\n      const nx = bakedNormal.getX(i);\n      const ny = bakedNormal.getY(i);\n      const nz = bakedNormal.getZ(i);\n      const length = Math.hypot(nx, ny, nz);\n      if (length \u003c 1e-12) bakedNormal.setXYZ(i, 0, 1, 0);\n      else bakedNormal.setXYZ(i, nx / length, ny / length, nz / length);\n    }\n    bakedNormal.needsUpdate = true;\n    mesh.geometry.computeBoundingBox();\n    mesh.geometry.computeBoundingSphere();\n    mesh.position.set(0, 0, 0);\n    mesh.rotation.set(0, 0, 0);\n    mesh.scale.set(1, 1, 1);\n    mesh.updateMatrix();\n  });\n  root.position.set(0, 0, 0);\n  root.rotation.set(0, 0, 0);\n  root.scale.set(1, 1, 1);\n  root.updateMatrixWorld(true);\n  const actualBounds = new T.Box3().setFromObject(root);\n  const actualSize = actualBounds.getSize(new T.Vector3());\n  const actualMin = actualBounds.min;\n  const actualMax = actualBounds.max;\n\n  root.userData = {\n    assetId: 'new.rubber-duck',\n    authored: true,\n    origin: 'bottom-center',\n    forward: '+Z',\n    size: [actualSize.x, actualSize.y, actualSize.z],\n    recipe: 'duck-specific physical rubber, not original cached recipe',\n    colliders: [\n      { min: [-0.066, 0.004, -0.078], max: [0.066, 0.127, 0.058], surface: 'rubber' },\n      { min: [-0.046, 0.096, 0.018], max: [0.046, 0.179, 0.104], surface: 'rubber' },\n    ],\n    sockets: {\n      grip: { position: [0, 0.08, 0] },\n      base: { position: [0, 0, 0] },\n    },\n  };\n\n  let disposed = false;\n  root.userData.dispose = () => {\n    if (disposed) return;\n    disposed = true;\n    ownedGeometries.forEach(g => g.dispose());\n    ownedMaterials.forEach(m => m.dispose());\n  };\n\n  if (![actualMin.x, actualMin.y, actualMin.z, actualMax.x, actualMax.y, actualMax.z].every(Number.isFinite)) {\n    throw new Error('rubber-duck bbox contains non-finite values');\n  }\n  return root;\n}\n",
      "tags": [
        "原创",
        "小黄鸭",
        "玩具",
        "软胶",
        "程序化",
        "可换色"
      ],
      "contract": {
        "units": "m",
        "size": [
          0.15,
          0.18,
          0.21
        ],
        "sizeTolerance": {
          "meters": 0.001,
          "percent": 0.01
        },
        "origin": "bottom-center",
        "forward": "+Z",
        "qualityTier": "catalog",
        "materials": [
          "rubber",
          "polymer_black",
          "plastic_grey"
        ],
        "requiredParts": [
          "body",
          "beak.upper",
          "beak.lower",
          "eye.left",
          "eye.right",
          "wing.left",
          "wing.right",
          "base.valve"
        ],
        "options": {
          "color": {
            "type": "string",
            "default": "yellow",
            "values": [
              "yellow",
              "cream"
            ]
          }
        },
        "variantEnvelopes": [],
        "collidersRequired": true,
        "dynamic": false,
        "budget": {
          "triangles": 24000,
          "maxMeshes": 14
        },
        "baseline": {
          "type": "new-design",
          "referenceAssets": [
            "prop.barrel"
          ],
          "scope": "只对照现有道具的真实部件、分拆碰撞与资源规范；小黄鸭为近景有机曲面原创，不套用油桶的面数限制。"
        }
      },
      "acceptance": {
        "catalog": "unverified",
        "geometry": "unverified",
        "visual": "unverified",
        "runtime": "unverified"
      },
      "sourceHash": "043bf522190614ed099efbec576afb434103f489b8b4fed50e4f8b7ebcc812ec",
      "evidence": {
        "report": "outputs/rubber-duck/asset-review.html"
      }
    },
    {
      "id": "new.nordic-spruce",
      "cat": "NEW",
      "sub": "原创模型",
      "name": "北欧高松 · 常绿针叶树",
      "en": "nordic-spruce",
      "kind": "authored",
      "focus": {
        "asset": "new.nordic-spruce",
        "options": {}
      },
      "params": [
        [
          "尺寸（米）",
          "5.4 × 14 × 5.4"
        ],
        [
          "原点",
          "bottom-center"
        ],
        [
          "朝向",
          "+Z"
        ],
        [
          "材质",
          "wood_dark, tarp"
        ],
        [
          "必要部件",
          "trunk, root-flare, branches.primary, branches.secondary, foliage.lower, foliage.middle, foliage.upper, leader"
        ]
      ],
      "summary": "按高耸北欧常绿树造型制作的原创程序化树木：14 米高、窄锥冠，含根颈、渐细树干、下垂主枝、分级细枝和真实几何针叶。默认绿色、不覆雪，可用 seed 重建三种分枝形态。云杉式视觉设计，不作精确物种鉴定。",
      "anchor": "assets/authored/nordic-spruce.js",
      "source": "nordic-spruce.js",
      "code": "// 原创北欧云杉式常青树：真实分层枝条、根颈、针叶簇和可测碰撞；仅提供 build 导出。\nexport function build(ctx, options = {}) {\n  const T = ctx.THREE;\n  const seed = options.seed === undefined ? 7 : options.seed;\n  if (![7, 19, 43].includes(seed)) throw new Error('seed 必须是 7、19 或 43');\n  if (Object.keys(options).some((key) => key !== 'seed')) throw new Error('只支持 seed 选项');\n  if (typeof ctx.rng !== 'function') throw new Error('需要宿主为每次构建重置 ctx.rng');\n\n  const rng = ctx.rng;\n  const random = () => rng();\n  const between = (a, b) => a + (b - a) * random();\n  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));\n  const TAU = Math.PI * 2;\n  const targetSize = [5.4, 14, 5.4];\n  const root = new T.Group();\n  root.name = 'nordic-spruce';\n  const ownedGeometries = [];\n  const ownedMaterials = [];\n  const geometryByPart = {};\n  const trunkGeometryList = [];\n  let needleCount = 0;\n\n  const barkMaterial = new T.MeshStandardMaterial({\n    color: 0xffffff,\n    roughness: 0.9,\n    metalness: 0,\n    vertexColors: true,\n  });\n  barkMaterial.name = 'wood_dark';\n  barkMaterial.userData.recipe = 'nordic-spruce-authored rough brown-grey bark, not an old baked recipe';\n  const needleMaterial = new T.MeshStandardMaterial({\n    color: 0xffffff,\n    roughness: 0.9,\n    metalness: 0,\n    vertexColors: true,\n    side: T.DoubleSide,\n  });\n  needleMaterial.name = 'tarp';\n  needleMaterial.userData.recipe = 'nordic-spruce-authored needle clusters with vertex color variation, not an old baked recipe';\n  ownedMaterials.push(barkMaterial, needleMaterial);\n\n  const barkColors = [\n    [0.075, 0.065, 0.055],\n    [0.095, 0.082, 0.069],\n    [0.12, 0.105, 0.089],\n    [0.145, 0.128, 0.109],\n  ];\n  const needleColors = [\n    [0.025, 0.085, 0.036],\n    [0.038, 0.145, 0.057],\n    [0.065, 0.22, 0.083],\n    [0.12, 0.31, 0.115],\n  ];\n\n  const makeBatch = () => ({ p: [], uv: [], c: [], i: [] });\n  const addVertex = (batch, point, uv, color) => {\n    const index = batch.p.length / 3;\n    batch.p.push(point.x, point.y, point.z);\n    batch.uv.push(uv[0], uv[1]);\n    batch.c.push(color[0], color[1], color[2]);\n    return index;\n  };\n  const addTriangle = (batch, a, b, c) => {\n    if (a === b || b === c || c === a) return;\n    batch.i.push(a, b, c);\n  };\n  const vector = (x, y, z) => new T.Vector3(x, y, z);\n  const safeNormalize = (v, fallback) => {\n    if (v.lengthSq() \u003c 1e-12) return fallback.clone();\n    return v.normalize();\n  };\n\n  const addTubePath = (batch, points, radii, sides, colorMode) => {\n    const rings = [];\n    let accumulated = 0;\n    let previousSide = null;\n    const ridgePhase = between(0, TAU);\n    for (let k = 0; k \u003c points.length; k += 1) {\n      const point = points[k];\n      const tangent = k === 0\n        ? vector().subVectors(points[1], points[0])\n        : (k === points.length - 1 ? vector().subVectors(points[k], points[k - 1]) : vector().subVectors(points[k + 1], points[k - 1]));\n      tangent.normalize();\n      const reference = Math.abs(tangent.y) \u003c 0.88 ? vector(0, 1, 0) : vector(1, 0, 0);\n      const sideA = previousSide\n        ? previousSide.clone().addScaledVector(tangent, -previousSide.dot(tangent)).normalize()\n        : new T.Vector3().crossVectors(tangent, reference).normalize();\n      const sideB = new T.Vector3().crossVectors(tangent, sideA).normalize();\n      previousSide = sideA;\n      const ring = [];\n      const radius = Math.max(0.0008, radii[k]);\n      for (let j = 0; j \u003c= sides; j += 1) {\n        const angle = TAU * (j % sides) / sides;\n        const ridge = Math.sin(angle * 11 + ridgePhase + accumulated * 0.22);\n        const corrugation = colorMode === 'bark' ? 1 + 0.075 * ridge + 0.025 * Math.sin(angle * 5 + accumulated * 1.7) : 1;\n        const offset = sideA.clone().multiplyScalar(Math.cos(angle) * radius * corrugation).addScaledVector(sideB, Math.sin(angle) * radius * corrugation);\n        const vertex = point.clone().add(offset);\n        const shade = clamp(Math.floor((ridge + 1) * 1.5), 0, 3);\n        const color = colorMode === 'bark' ? barkColors[shade] : needleColors[1];\n        ring.push(addVertex(batch, vertex, [TAU * radius * j / sides, accumulated], color));\n      }\n      rings.push(ring);\n      if (k \u003c points.length - 1) accumulated += points[k + 1].distanceTo(points[k]);\n    }\n    for (let k = 0; k \u003c rings.length - 1; k += 1) {\n      for (let j = 0; j \u003c sides; j += 1) {\n        const next = j + 1;\n        addTriangle(batch, rings[k][j], rings[k + 1][next], rings[k + 1][j]);\n        addTriangle(batch, rings[k][j], rings[k][next], rings[k + 1][next]);\n      }\n    }\n    for (const end of [0, points.length - 1]) {\n      const center = addVertex(batch, points[end], [0, 0], barkColors[1]);\n      const capRing = [];\n      for (let j = 0; j \u003c sides; j += 1) {\n        const id = rings[end][j];\n        const angle = TAU * j / sides;\n        const point = vector(batch.p[id * 3], batch.p[id * 3 + 1], batch.p[id * 3 + 2]);\n        capRing.push(addVertex(batch, point, [Math.cos(angle) * radii[end], Math.sin(angle) * radii[end]], barkColors[1]));\n      }\n      for (let j = 0; j \u003c sides; j += 1) {\n        const next = (j + 1) % sides;\n        if (end === 0) addTriangle(batch, center, capRing[next], capRing[j]);\n        else addTriangle(batch, center, capRing[j], capRing[next]);\n      }\n    }\n  };\n\n  const addNeedle = (batch, base, direction, length, width, colorIndex) => {\n    const dir = safeNormalize(direction, vector(0, 1, 0));\n    const reference = Math.abs(dir.y) \u003c 0.9 ? vector(0, 1, 0) : vector(1, 0, 0);\n    const sideA = safeNormalize(new T.Vector3().crossVectors(dir, reference), vector(1, 0, 0));\n    const sideB = safeNormalize(new T.Vector3().crossVectors(dir, sideA), vector(0, 0, 1));\n    const tip = base.clone().addScaledVector(dir, length);\n    const color = needleColors[clamp(colorIndex, 0, needleColors.length - 1)];\n    const tipColor = color.map((value, i) => value * 0.82 + needleColors[3][i] * 0.18);\n    const a0 = addVertex(batch, base.clone().addScaledVector(sideA, width * 0.5), [0, 0], color);\n    const a1 = addVertex(batch, base.clone().addScaledVector(sideA, -width * 0.5), [width, 0], color);\n    const at = addVertex(batch, tip, [width * 0.5, length], tipColor);\n    const b0 = addVertex(batch, base.clone().addScaledVector(sideB, width * 0.5), [0, 0], color);\n    const b1 = addVertex(batch, base.clone().addScaledVector(sideB, -width * 0.5), [width, 0], color);\n    const bt = addVertex(batch, tip, [width * 0.5, length], tipColor);\n    addTriangle(batch, a0, a1, at);\n    addTriangle(batch, b0, b1, bt);\n    needleCount += 1;\n  };\n\n  const makeGeometry = (batch) => {\n    const geometry = new T.BufferGeometry();\n    geometry.setAttribute('position', new T.Float32BufferAttribute(batch.p, 3));\n    geometry.setAttribute('uv', new T.Float32BufferAttribute(batch.uv, 2));\n    geometry.setAttribute('color', new T.Float32BufferAttribute(batch.c, 3));\n    geometry.setIndex(batch.i);\n    geometry.computeVertexNormals();\n    geometry.computeBoundingBox();\n    geometry.computeBoundingSphere();\n    ownedGeometries.push(geometry);\n    return geometry;\n  };\n\n  const makePart = (name) => {\n    const group = new T.Group();\n    group.name = name;\n    group.userData.noMerge = true;\n    root.add(group);\n    return group;\n  };\n  const addPartMesh = (group, name, batch, material) => {\n    if (batch.p.length === 0 || batch.i.length === 0) throw new Error(`${name} 没有有效几何`);\n    const geometry = makeGeometry(batch);\n    const mesh = new T.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    geometryByPart[group.name] = geometry;\n    return mesh;\n  };\n\n  const trunkBatch = makeBatch();\n  const rootFlareBatch = makeBatch();\n  const primaryBatch = makeBatch();\n  const secondaryBatch = makeBatch();\n  const lowerFoliageBatch = makeBatch();\n  const middleFoliageBatch = makeBatch();\n  const upperFoliageBatch = makeBatch();\n  const leaderBatch = makeBatch();\n\n  const trunkCenters = [];\n  const trunkRadii = [];\n  const trunkHeight = 14.35;\n  const bendPhase = between(0, TAU);\n  const trunkPointAt = (y) => vector(\n    0.075 * (Math.sin(y * 0.47 + bendPhase) - Math.sin(bendPhase)) + 0.025 * Math.sin(y * 1.17),\n    y,\n    -0.06 * (Math.cos(y * 0.38 + bendPhase) - Math.cos(bendPhase)) + 0.018 * Math.sin(y * 0.91),\n  );\n  const trunkRadiusAt = (y) => 0.003 + 0.255 * Math.pow(Math.max(0, 1 - y / trunkHeight), 1.12) + 0.05 * Math.exp(-y * 3.5);\n  for (let k = 0; k \u003c= 72; k += 1) {\n    const y = trunkHeight * k / 72;\n    trunkCenters.push(trunkPointAt(y));\n    trunkRadii.push(trunkRadiusAt(y));\n  }\n  addTubePath(trunkBatch, trunkCenters, trunkRadii, 40, 'bark');\n\n  const rootCount = 7 + Math.floor(random() * 2);\n  const rootPhase = between(0, TAU);\n  for (let j = 0; j \u003c rootCount; j += 1) {\n    const angle = rootPhase + j * 2.3999632297 + between(-0.24, 0.24);\n    const radial = vector(Math.cos(angle), 0, Math.sin(angle));\n    const lateral = vector(-radial.z, 0, radial.x);\n    const start = trunkPointAt(0.14).addScaledVector(radial, 0.11);\n    const reach = between(0.72, 1.08);\n    const points = [\n      start,\n      start.clone().addScaledVector(radial, reach * 0.28).addScaledVector(lateral, between(-0.12, 0.12)).setY(between(0.04, 0.08)),\n      start.clone().addScaledVector(radial, reach * 0.62).addScaledVector(lateral, between(-0.18, 0.18)).setY(between(0.025, 0.055)),\n      start.clone().addScaledVector(radial, reach).addScaledVector(lateral, between(-0.24, 0.24)).setY(between(0.012, 0.025)),\n    ];\n    addTubePath(rootFlareBatch, points, [0.15, 0.105, 0.055, 0.018], 8, 'bark');\n  }\n\n  const makeNeedleCluster = (points, layerName, count, radii) => {\n    const batch = layerName === 'lower' ? lowerFoliageBatch : (layerName === 'middle' ? middleFoliageBatch : upperFoliageBatch);\n    const phase = between(0, TAU);\n    for (let n = 0; n \u003c count; n += 1) {\n      // 沿小枝轴交错螺旋生长，而不是把一圈针叶堆在悬浮端点。\n      const u = 0.08 + 0.91 * (n + between(0.08, 0.92)) / count;\n      const segment = Math.min(points.length - 2, Math.floor(u * (points.length - 1)));\n      const local = u * (points.length - 1) - segment;\n      const dirTangent = points[segment + 1].clone().sub(points[segment]).normalize();\n      const reference = Math.abs(dirTangent.y) \u003c 0.88 ? vector(0, 1, 0) : vector(1, 0, 0);\n      const sideA = new T.Vector3().crossVectors(dirTangent, reference).normalize();\n      const sideB = new T.Vector3().crossVectors(dirTangent, sideA).normalize();\n      const angle = phase + n * 2.3999632297 + between(-0.48, 0.48);\n      const radial = sideA.multiplyScalar(Math.cos(angle)).addScaledVector(sideB, Math.sin(angle) * 0.65).normalize();\n      const needleDirection = radial.clone().multiplyScalar(between(0.64, 0.95)).addScaledVector(dirTangent, between(0.35, 0.85));\n      const radius = radii[segment] + (radii[segment + 1] - radii[segment]) * local;\n      const base = points[segment].clone().lerp(points[segment + 1], local).addScaledVector(radial, radius * 0.76);\n      const length = between(0.115, 0.18) * (0.95 + 0.05 * Math.sin(u * Math.PI));\n      const width = between(0.012, 0.018);\n      const colorIndex = u > 0.90 ? (random() \u003c 0.25 ? 3 : 2) : (u \u003c 0.35 ? (random() \u003c 0.55 ? 0 : 1) : (random() \u003c 0.72 ? 1 : 2));\n      addNeedle(batch, base, needleDirection, length, width, colorIndex);\n    }\n  };\n\n  const layerCount = 20;\n  let primaryCount = 0;\n  let secondaryCount = 0;\n  let terminalTwigCount = 0;\n  for (let layer = 0; layer \u003c layerCount; layer += 1) {\n    const t = layer / (layerCount - 1);\n    const y = 1.34 + 11.9 * t + (layer === 0 ? 0 : between(-0.18, 0.18));\n    const count = clamp(Math.round(7.6 - 2.4 * t + between(-0.9, 0.9)), 5, 8);\n    const phase = between(-0.32, 0.32) + layer * 0.73;\n    const layerLength = 0.19 + 2.25 * Math.pow(1 - t, 0.93);\n    const layerName = y \u003c 4.9 ? 'lower' : (y \u003c 9.4 ? 'middle' : 'upper');\n    for (let j = 0; j \u003c count; j += 1) {\n      const angle = phase + TAU * j / count + between(-0.16, 0.16);\n      const radial = vector(Math.cos(angle), 0, Math.sin(angle));\n      const tangent = vector(-Math.sin(angle), 0, Math.cos(angle));\n      const branchLength = layerLength * between(0.82, 1.08);\n      const branchY = y + between(-0.035 - 0.08 * t, 0.035 + 0.08 * t);\n      const rootPoint = trunkPointAt(branchY).addScaledVector(radial, trunkRadiusAt(branchY) * 0.56);\n      const sway = tangent.clone().multiplyScalar(between(-0.15, 0.15));\n      const droop = between(0.23, 0.52) * (1 - 0.52 * t);\n      const points = [\n        rootPoint,\n        rootPoint.clone().addScaledVector(radial, branchLength * 0.22).add(sway.clone().multiplyScalar(0.18)).setY(branchY - droop * 0.30),\n        rootPoint.clone().addScaledVector(radial, branchLength * 0.48).add(sway.clone().multiplyScalar(0.42)).setY(branchY - droop * 0.80),\n        rootPoint.clone().addScaledVector(radial, branchLength * 0.73).add(sway.clone().multiplyScalar(0.64)).setY(branchY - droop),\n        rootPoint.clone().addScaledVector(radial, branchLength * 0.93).add(sway.clone().multiplyScalar(0.78)).setY(branchY - droop * 0.68),\n        rootPoint.clone().addScaledVector(radial, branchLength).add(sway).setY(branchY - droop * 0.35 + between(-0.04, 0.06)),\n      ];\n      const branchRadius = 0.004 + 0.05 * Math.pow(1 - t, 1.15);\n      const radii = [1, 0.76, 0.53, 0.34, 0.19, 0.06].map((factor) => branchRadius * factor);\n      addTubePath(primaryBatch, points, radii, 7, 'bark');\n      primaryCount += 1;\n\n      makeNeedleCluster(points, layerName, Math.floor(between(22, 30)), radii);\n      const secondaryPerPrimary = 8;\n      for (let s = 0; s \u003c secondaryPerPrimary; s += 1) {\n        // 四对侧枝在主枝上前后错开，组成下垂羽状扇面。\n        const pair = Math.floor(s / 2);\n        const u = clamp(0.19 + pair * 0.24 + (s % 2) * 0.022 + between(-0.02, 0.02), 0.18, 0.95);\n        const segment = Math.min(points.length - 2, Math.floor(u * (points.length - 1)));\n        const localT = u * (points.length - 1) - segment;\n        const start = points[segment].clone().lerp(points[segment + 1], localT);\n        const sideSign = s % 2 === 0 ? -1 : 1;\n        const secondaryAngle = angle + sideSign * between(0.58, 0.98) + between(-0.10, 0.10);\n        const secondaryRadial = vector(Math.cos(secondaryAngle), 0, Math.sin(secondaryAngle));\n        const secondaryTangent = vector(-Math.sin(secondaryAngle), 0, Math.cos(secondaryAngle));\n        const length = (0.12 + branchLength * between(0.29, 0.40)) * (1 - 0.27 * u) * (1 - 0.18 * t);\n        const secondaryPoints = [\n          start,\n          start.clone().addScaledVector(secondaryRadial, length * 0.34).addScaledVector(secondaryTangent, between(-0.06, 0.06)).setY(start.y - between(0.04, 0.12)),\n          start.clone().addScaledVector(secondaryRadial, length * 0.70).addScaledVector(secondaryTangent, between(-0.10, 0.10)).setY(start.y - between(0.07, 0.18)),\n          start.clone().addScaledVector(secondaryRadial, length).addScaledVector(secondaryTangent, between(-0.13, 0.13)).setY(start.y - between(0.04, 0.12)),\n        ];\n        const secondaryRadius = Math.max(0.002, branchRadius * (0.28 - 0.09 * u));\n        const secondaryRadii = [secondaryRadius, secondaryRadius * 0.67, secondaryRadius * 0.38, 0.0013];\n        addTubePath(secondaryBatch, secondaryPoints, secondaryRadii, 5, 'bark');\n        secondaryCount += 1;\n        makeNeedleCluster(secondaryPoints, layerName, Math.floor(between(25, 34)), secondaryRadii);\n\n        for (let q = 0; q \u003c 4; q += 1) {\n          const v = 0.22 + Math.floor(q / 2) * 0.48 + (q % 2) * 0.095 + between(-0.045, 0.045);\n          const seg = Math.min(secondaryPoints.length - 2, Math.floor(v * (secondaryPoints.length - 1)));\n          const local = v * (secondaryPoints.length - 1) - seg;\n          const twigStart = secondaryPoints[seg].clone().lerp(secondaryPoints[seg + 1], local);\n          const twigAngle = secondaryAngle + (q % 2 === 0 ? -1 : 1) * between(0.40, 0.72);\n          const twigRadial = vector(Math.cos(twigAngle), 0, Math.sin(twigAngle));\n          const twigTangent = vector(-Math.sin(twigAngle), between(0.04, 0.16), Math.cos(twigAngle));\n          const twigLength = between(0.18, 0.34) * (1 - 0.28 * t) * (1 - 0.15 * v);\n          const twigDroop = between(0.035, 0.13) * (1 - 0.45 * t);\n          const twigPoints = [\n            twigStart,\n            twigStart.clone().addScaledVector(twigRadial, twigLength * 0.55).addScaledVector(twigTangent, between(-0.025, 0.025)).setY(twigStart.y - twigDroop),\n            twigStart.clone().addScaledVector(twigRadial, twigLength).addScaledVector(twigTangent, between(-0.035, 0.035)).setY(twigStart.y - twigDroop * 0.6 + between(-0.015, 0.025)),\n          ];\n          const twigRadii = [Math.min(0.004, secondaryRadius * 0.55), 0.0015, 0.0008];\n          addTubePath(secondaryBatch, twigPoints, twigRadii, 3, 'bark');\n          terminalTwigCount += 1;\n          makeNeedleCluster(twigPoints, layerName, Math.floor(between(13, 19)), twigRadii);\n        }\n      }\n    }\n  }\n\n  for (let j = 0; j \u003c 24; j += 1) {\n    const angle = j * 2.3999632297 + between(-0.22, 0.22);\n    const radial = vector(Math.cos(angle), 0, Math.sin(angle));\n    const y = 12.65 + j * 0.068;\n    const twigStart = trunkPointAt(y);\n    const twigEnd = twigStart.clone().addScaledVector(radial, between(0.13, 0.26) * (1 - j * 0.032)).add(vector(0, between(0.09, 0.18), 0));\n    const leaderTwig = [twigStart, twigStart.clone().lerp(twigEnd, 0.6), twigEnd];\n    const leaderRadii = [0.005, 0.003, 0.0011];\n    addTubePath(leaderBatch, leaderTwig, leaderRadii, 5, 'bark');\n    makeNeedleCluster(leaderTwig, 'upper', Math.floor(between(42, 58)), leaderRadii);\n    terminalTwigCount += 1;\n  }\n  const leaderPoints = [trunkPointAt(12.9), trunkPointAt(13.65), trunkPointAt(trunkHeight)];\n  makeNeedleCluster(leaderPoints, 'upper', 320, leaderPoints.map((point) => trunkRadiusAt(point.y)));\n\n  const trunkPart = makePart('trunk');\n  const rootFlarePart = makePart('root-flare');\n  const primaryPart = makePart('branches.primary');\n  const secondaryPart = makePart('branches.secondary');\n  const lowerPart = makePart('foliage.lower');\n  const middlePart = makePart('foliage.middle');\n  const upperPart = makePart('foliage.upper');\n  const leaderPart = makePart('leader');\n  addPartMesh(trunkPart, 'trunk-batched', trunkBatch, barkMaterial);\n  addPartMesh(rootFlarePart, 'root-flare-batched', rootFlareBatch, barkMaterial);\n  addPartMesh(primaryPart, 'branches.primary-batched', primaryBatch, barkMaterial);\n  addPartMesh(secondaryPart, 'branches.secondary-batched', secondaryBatch, barkMaterial);\n  addPartMesh(lowerPart, 'foliage.lower-batched', lowerFoliageBatch, needleMaterial);\n  addPartMesh(middlePart, 'foliage.middle-batched', middleFoliageBatch, needleMaterial);\n  addPartMesh(upperPart, 'foliage.upper-batched', upperFoliageBatch, needleMaterial);\n  addPartMesh(leaderPart, 'leader-batched', leaderBatch, barkMaterial);\n\n  root.updateMatrixWorld(true);\n  const rawBounds = new T.Box3().setFromObject(root);\n  const rawSize = rawBounds.getSize(new T.Vector3());\n  const rawCenter = rawBounds.getCenter(new T.Vector3());\n  const scale = vector(targetSize[0] / rawSize.x, targetSize[1] / rawSize.y, targetSize[2] / rawSize.z);\n  root.traverse((object) => {\n    if (!object.isMesh || !object.geometry) return;\n    const position = object.geometry.getAttribute('position');\n    for (let i = 0; i \u003c position.count; i += 1) {\n      position.setXYZ(\n        i,\n        (position.getX(i) - rawCenter.x) * scale.x,\n        (position.getY(i) - rawBounds.min.y) * scale.y,\n        (position.getZ(i) - rawCenter.z) * scale.z,\n      );\n    }\n    position.needsUpdate = true;\n    object.geometry.computeVertexNormals();\n    object.geometry.computeBoundingBox();\n    object.geometry.computeBoundingSphere();\n  });\n  root.updateMatrixWorld(true);\n  const actualBounds = new T.Box3().setFromObject(root);\n  const actualSize = actualBounds.getSize(new T.Vector3());\n  const actualMin = actualBounds.min;\n  const actualMax = actualBounds.max;\n\n  const measuredCollider = (low, high) => {\n    const min = vector(Infinity, Infinity, Infinity);\n    const max = vector(-Infinity, -Infinity, -Infinity);\n    const clip = (polygon, plane, keepAbove) => {\n      const result = [];\n      for (let j = 0; j \u003c polygon.length; j += 1) {\n        const a = polygon[j];\n        const b = polygon[(j + 1) % polygon.length];\n        const insideA = keepAbove ? a.y >= plane : a.y \u003c= plane;\n        const insideB = keepAbove ? b.y >= plane : b.y \u003c= plane;\n        if (insideA) result.push(a);\n        if (insideA !== insideB) result.push(a.clone().lerp(b, (plane - a.y) / (b.y - a.y)));\n      }\n      return result;\n    };\n    // 对归一化后的树干/根爪三角面按高度裁切再测量，三段之间不留采样空隙。\n    for (const geometry of trunkGeometryList) {\n      const position = geometry.getAttribute('position');\n      const index = geometry.index;\n      for (let i = 0; i \u003c index.count; i += 3) {\n        const triangle = [0, 1, 2].map((offset) => new T.Vector3().fromBufferAttribute(position, index.getX(i + offset)));\n        const polygon = clip(clip(triangle, low, true), high, false);\n        polygon.forEach((point) => { min.min(point); max.max(point); });\n      }\n    }\n    if (!Number.isFinite(min.x)) throw new Error('无法从归一化树干测量碰撞段');\n    return { min: min.toArray(), max: max.toArray(), surface: 'wood' };\n  };\n  trunkGeometryList.push(geometryByPart.trunk, geometryByPart['root-flare']);\n  const colliders = [\n    measuredCollider(0, 4.68),\n    measuredCollider(4.68, 9.34),\n    measuredCollider(9.34, 14.01),\n  ];\n  const leaderTop = vector();\n  root.traverse((object) => {\n    if (!object.isMesh) return;\n    const position = object.geometry.getAttribute('position');\n    for (let i = 0; i \u003c position.count; i += 1) {\n      if (position.getY(i) >= leaderTop.y) leaderTop.fromBufferAttribute(position, i);\n    }\n  });\n  const normalizedTrunkPoint = (y) => {\n    const point = trunkPointAt(y);\n    return [(point.x - rawCenter.x) * scale.x, (point.y - rawBounds.min.y) * scale.y, (point.z - rawCenter.z) * scale.z];\n  };\n  const rootParts = ['trunk', 'root-flare', 'branches.primary', 'branches.secondary', 'foliage.lower', 'foliage.middle', 'foliage.upper', 'leader'];\n  let triangleCount = 0;\n  let meshCount = 0;\n  root.traverse((object) => {\n    if (!object.isMesh) return;\n    meshCount += 1;\n    triangleCount += object.geometry.index ? object.geometry.index.count / 3 : object.geometry.getAttribute('position').count / 3;\n  });\n\n  root.userData = {\n    assetId: 'new.nordic-spruce',\n    authored: true,\n    origin: 'bottom-center',\n    forward: '+Z',\n    size: actualSize.toArray(),\n    recipe: {\n      bark: 'wood_dark: authored brown-grey tapered bark with vertex color variation',\n      needles: 'tarp: authored true-geometry crossed tapered needle triangles with vertex color variation',\n    },\n    colliders,\n    sockets: {\n      base: { position: [0, 0, 0] },\n      tip: { position: leaderTop.toArray() },\n      crown: { position: normalizedTrunkPoint(9.5) },\n    },\n    requiredPartNames: rootParts,\n    requiredParts: rootParts,\n    stats: {\n      primaryBranches: primaryCount,\n      secondaryBranches: secondaryCount,\n      terminalTwigs: terminalTwigCount,\n      branchLayers: layerCount,\n      roots: rootCount,\n      needles: needleCount,\n      triangles: triangleCount,\n      meshes: meshCount,\n      materials: ['wood_dark', 'tarp'],\n      lod: 'not implemented',\n    },\n    options: { seed },\n  };\n\n  let disposed = false;\n  root.userData.dispose = () => {\n    if (disposed) return;\n    disposed = true;\n    ownedGeometries.forEach((geometry) => geometry.dispose());\n    ownedMaterials.forEach((material) => material.dispose());\n  };\n\n  const finiteValues = [actualMin.x, actualMin.y, actualMin.z, actualMax.x, actualMax.y, actualMax.z, ...actualSize.toArray()];\n  if (!finiteValues.every(Number.isFinite)) throw new Error('nordic-spruce bbox contains non-finite values');\n  return root;\n}\n",
      "tags": [
        "原创",
        "北欧",
        "松树",
        "云杉式",
        "常绿",
        "针叶树",
        "植物",
        "程序化"
      ],
      "contract": {
        "units": "m",
        "size": [
          5.4,
          14,
          5.4
        ],
        "sizeTolerance": {
          "meters": 0.01,
          "percent": 0.01
        },
        "origin": "bottom-center",
        "forward": "+Z",
        "qualityTier": "catalog",
        "materials": [
          "wood_dark",
          "tarp"
        ],
        "requiredParts": [
          "trunk",
          "root-flare",
          "branches.primary",
          "branches.secondary",
          "foliage.lower",
          "foliage.middle",
          "foliage.upper",
          "leader"
        ],
        "options": {
          "seed": {
            "type": "integer",
            "default": 7,
            "values": [
              7,
              19,
              43
            ]
          }
        },
        "variantEnvelopes": [],
        "collidersRequired": true,
        "dynamic": false,
        "budget": {
          "triangles": 350000,
          "maxMeshes": 12
        },
        "baseline": {
          "type": "new-design",
          "referenceAssets": [],
          "scope": "现库无同尺度树木参考，不虚构植物比较通过。对照现有资产的结构、资源归属、实际预览和证据规范，树形按本设计契约验收。"
        }
      },
      "acceptance": {
        "catalog": "unverified",
        "geometry": "unverified",
        "visual": "unverified",
        "runtime": "unverified"
      },
      "sourceHash": "ef3bfaf11b418948812a2023745b4827edfc2000db6681160bb3711cd245236f",
      "evidence": {
        "report": "outputs/nordic-spruce/asset-review.html"
      }
    },
    {
      "id": "new.quadruped-mech",
      "cat": "NEW",
      "sub": "原创模型",
      "name": "四足机甲 · 火炮平台",
      "en": "quadruped-mech",
      "kind": "authored",
      "focus": {
        "asset": "new.quadruped-mech",
        "options": {}
      },
      "params": [
        [
          "尺寸（米）",
          "4.82 × 2.68 × 6.16"
        ],
        [
          "原点",
          "bottom-center"
        ],
        [
          "朝向",
          "+Z"
        ],
        [
          "材质",
          "paint_grey, paint_orange, steel_dark, gunmetal, rubber, hazard_stripes"
        ],
        [
          "必要部件",
          "body.chassis, body.front-plate, body.rear-power, turret.ring, turret.gun-mount, cannon.barrel, cannon.muzzle, cannon.recoil-sleeve, leg.front-left, leg.front-right, leg.rear-left, leg.rear-right"
        ]
      ],
      "summary": "原创程序化四足战斗机甲：装甲机身、四组分级机械腿、可摆动炮塔与一门带制退器和后坐套筒的火炮。支持灰/橙装甲与三种细节 seed，含待机微动、步态微动、炮塔摆动和四秒周期火炮后坐动画。",
      "anchor": "assets/authored/quadruped-mech.js",
      "source": "quadruped-mech.js",
      "code": "export function build(ctx, options = {}) {\n  const THREE = ctx.THREE;\n  const seed = options.seed === undefined ? 7 : options.seed;\n  const armor = options.armor === undefined ? 'grey' : options.armor;\n  if (Object.keys(options).some(key => key !== 'seed' && key !== 'armor') ||\n      ![7, 19, 43].includes(seed) || !['grey', 'orange'].includes(armor)) {\n    throw new Error('四足机甲仅接受 seed: 7/19/43 与 armor: grey/orange');\n  }\n  const root = new THREE.Group();\n  root.name = 'new.quadruped-mech';\n  root.userData.noMerge = true;\n  const ownGeometry = new Set();\n  const ownMaterial = new Set();\n  const geometryCache = new Map();\n  const meshes = [];\n  const legs = [];\n  const collisionTargets = [];\n  let disposed = false;\n  const tau = Math.PI * 2;\n  // 离散 seed 仅选择装甲细节，不建立第二套随机数发生器。\n  const detail = seed === 7 ? -1 : seed === 19 ? 0 : 1;\n\n  function material(name, color, metalness, roughness) {\n    const result = new THREE.MeshStandardMaterial({ color, metalness, roughness });\n    result.name = name;\n    ownMaterial.add(result);\n    return result;\n  }\n  const mats = {\n    paint_grey: material('paint_grey', armor === 'grey' ? 0x66757c : 0xb76835, 0.48, 0.39),\n    paint_orange: material('paint_orange', armor === 'grey' ? 0xc77736 : 0x59676e, 0.4, 0.44),\n    steel_dark: material('steel_dark', 0x202b31, 0.76, 0.48),\n    gunmetal: material('gunmetal', 0x859195, 0.88, 0.28),\n    rubber: material('rubber', 0x141a1d, 0.03, 0.88),\n    hazard_stripes: material('hazard_stripes', 0xd7b45f, 0.24, 0.55)\n  };\n\n  function geometry(key, create) {\n    if (!geometryCache.has(key)) {\n      const result = create();\n      result.computeBoundingBox();\n      ownGeometry.add(result);\n      geometryCache.set(key, result);\n    }\n    return geometryCache.get(key);\n  }\n  function group(parent, name, position = [0, 0, 0]) {\n    const result = new THREE.Group();\n    result.name = name;\n    result.position.set(...position);\n    result.userData.noMerge = true;\n    parent.add(result);\n    return result;\n  }\n  function mesh(parent, name, shape, mat, position = [0, 0, 0], rotation = [0, 0, 0]) {\n    const result = new THREE.Mesh(shape, mat);\n    result.name = name;\n    result.position.set(...position);\n    result.rotation.set(...rotation);\n    result.castShadow = true;\n    result.receiveShadow = true;\n    result.userData.noMerge = true;\n    parent.add(result);\n    meshes.push(result);\n    return result;\n  }\n  function box(parent, name, size, position, mat = mats.paint_grey, rotation = [0, 0, 0], bevel = 0.018) {\n    const key = ['box', ...size, bevel].join(':');\n    return mesh(parent, name, geometry(key, () => {\n      const source = ctx.kit.metricBox(...size, bevel);\n      const result = source.toNonIndexed();\n      source.dispose();\n      result.computeVertexNormals();\n      const p = result.attributes.position, n = result.attributes.normal, uv = result.attributes.uv;\n      // 倒角面独立展开，避免原语的共享角点把窄倒角 UV 压成一条线。\n      for (let i = 0; i \u003c p.count; i++) {\n        const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));\n        if (ny >= nx && ny >= nz) uv.setXY(i, p.getX(i), p.getZ(i));\n        else if (nx >= nz) uv.setXY(i, p.getZ(i), p.getY(i));\n        else uv.setXY(i, p.getX(i), p.getY(i));\n      }\n      result.setIndex(Array.from({ length: p.count }, (_, i) => i));\n      return result;\n    }), mat, position, rotation);\n  }\n  function cylinder(parent, name, radius, length, position, mat = mats.steel_dark, rotation = [0, 0, 0], segments = 24, radiusBottom = radius) {\n    const key = ['cylinder', radius, radiusBottom, length, segments].join(':');\n    return mesh(parent, name, geometry(key, () => ctx.kit.cylinder(radius, radiusBottom, length, segments)), mat, position, rotation);\n  }\n  const axisY = new THREE.Vector3(0, 1, 0);\n  const lineA = new THREE.Vector3();\n  const lineB = new THREE.Vector3();\n  function fitBetween(node, a, b) {\n    lineA.set(...a);\n    lineB.set(...b).sub(lineA);\n    const length = lineB.length();\n    node.position.copy(lineA).addScaledVector(lineB, 0.5);\n    node.quaternion.setFromUnitVectors(axisY, lineB.multiplyScalar(1 / length));\n    node.scale.set(1, length, 1);\n  }\n  function cylinderBetween(parent, name, a, b, radius, mat = mats.gunmetal, segments = 16) {\n    const result = cylinder(parent, name, radius, 1, [0, 0, 0], mat, [0, 0, 0], segments);\n    fitBetween(result, a, b);\n    return result;\n  }\n  // 每个多边形独立法线，UV 按主法线平面以米投影；全部显式索引。\n  function facesGeometry(faces) {\n    const positions = [], normals = [], uvs = [], indices = [];\n    const a = new THREE.Vector3(), b = new THREE.Vector3(), normal = new THREE.Vector3();\n    for (const face of faces) {\n      a.fromArray(face[1]).sub(b.fromArray(face[0]));\n      b.fromArray(face[2]).sub(normal.fromArray(face[0]));\n      normal.crossVectors(a, b).normalize();\n      const offset = positions.length / 3;\n      const nx = Math.abs(normal.x), ny = Math.abs(normal.y), nz = Math.abs(normal.z);\n      for (const point of face) {\n        positions.push(...point);\n        normals.push(normal.x, normal.y, normal.z);\n        if (ny >= nx && ny >= nz) uvs.push(point[0], point[2]);\n        else if (nx >= nz) uvs.push(point[2], point[1]);\n        else uvs.push(point[0], point[1]);\n      }\n      for (let i = 1; i \u003c face.length - 1; i++) indices.push(offset, offset + i, offset + i + 1);\n    }\n    const result = new THREE.BufferGeometry();\n    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));\n    result.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));\n    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));\n    result.setIndex(indices);\n    return result;\n  }\n  function hull(parent, name, levels, mat, position = [0, 0, 0]) {\n    const key = 'hull:' + JSON.stringify(levels);\n    return mesh(parent, name, geometry(key, () => {\n      const rings = levels.map(([y, w, d, cut]) => [\n        [-w / 2 + cut, y, -d / 2], [w / 2 - cut, y, -d / 2],\n        [w / 2, y, -d / 2 + cut], [w / 2, y, d / 2 - cut],\n        [w / 2 - cut, y, d / 2], [-w / 2 + cut, y, d / 2],\n        [-w / 2, y, d / 2 - cut], [-w / 2, y, -d / 2 + cut]\n      ]);\n      const faces = [rings[0], rings[rings.length - 1].slice().reverse()];\n      for (let j = 0; j \u003c rings.length - 1; j++) {\n        for (let i = 0; i \u003c 8; i++) {\n          const next = (i + 1) % 8;\n          faces.push([rings[j][i], rings[j + 1][i], rings[j + 1][next], rings[j][next]]);\n        }\n      }\n      return facesGeometry(faces);\n    }), mat, position);\n  }\n  function annulus(parent, name, outer, inner, length, position, mat, rotation = [0, 0, 0], segments = 40) {\n    const key = ['annulus', outer, inner, length, segments].join(':');\n    return mesh(parent, name, geometry(key, () => {\n      const faces = [];\n      for (let i = 0; i \u003c segments; i++) {\n        const a = i * tau / segments, b = (i + 1) * tau / segments;\n        const p = (r, y, t) => [r * Math.cos(t), y, r * Math.sin(t)];\n        const h = length / 2;\n        faces.push([p(outer, -h, a), p(outer, h, a), p(outer, h, b), p(outer, -h, b)]);\n        faces.push([p(inner, -h, b), p(inner, h, b), p(inner, h, a), p(inner, -h, a)]);\n        faces.push([p(inner, h, b), p(outer, h, b), p(outer, h, a), p(inner, h, a)]);\n        faces.push([p(inner, -h, a), p(outer, -h, a), p(outer, -h, b), p(inner, -h, b)]);\n      }\n      return facesGeometry(faces);\n    }), mat, position, rotation);\n  }\n  function cable(parent, name, points, radius = 0.025) {\n    const key = ['cable', radius, JSON.stringify(points)].join(':');\n    return mesh(parent, name, geometry(key, () => {\n      const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));\n      const result = new THREE.TubeGeometry(curve, 16, radius, 8, false);\n      const uv = result.attributes.uv;\n      const length = curve.getLength();\n      for (let i = 0; i \u003c uv.count; i++) uv.setXY(i, uv.getX(i) * length, uv.getY(i) * tau * radius);\n      return result;\n    }), mats.rubber);\n  }\n  function bolt(parent, name, position, rotation = [Math.PI / 2, 0, 0], radius = 0.028) {\n    return cylinder(parent, name, radius, 0.026, position, mats.gunmetal, rotation, 6);\n  }\n  function collider(node, surface) {\n    const result = { min: [0, 0, 0], max: [0, 0, 0], surface };\n    collisionTargets.push({ node, result });\n    return result;\n  }\n\n  const body = group(root, 'body');\n  const chassis = hull(body, 'body.chassis', [\n    [1.13, 1.55, 2.55, 0.22], [1.32, 2.08, 3.1, 0.32],\n    [1.64, 2.18, 3.04, 0.36], [1.83, 1.78, 2.68, 0.32]\n  ], mats.paint_grey);\n  hull(body, 'body.belly', [[0.98, 1.1, 2.12, 0.17], [1.19, 1.56, 2.58, 0.23]], mats.steel_dark);\n  const front = group(body, 'body.front-plate', [0, 1.54, 1.49]);\n  box(front, 'front.armour', [1.42, 0.38, 0.12], [0, 0, 0], mats.paint_grey, [-0.24, 0, 0], 0.035);\n  box(front, 'front.sensor-recess', [0.68, 0.12, 0.075], [0, 0.06, 0.083], mats.steel_dark);\n  for (const s of [-1, 1]) {\n    box(front, 'front.optic.' + s, [0.21, 0.054, 0.035], [s * 0.18, 0.06, 0.13], mats.hazard_stripes, [0, 0, 0], 0.006);\n    bolt(front, 'front.fastener.' + s, [s * 0.57, -0.04, 0.1]);\n    cylinderBetween(body, 'front.tow-loop.' + s, [s * 0.69, 1.15, 1.35], [s * 0.69, 1.15, 1.64], 0.055, mats.gunmetal);\n    box(body, 'body.side-sill.' + s, [0.16, 0.15, 2.45], [s * 1.07, 1.29, -0.04], mats.steel_dark);\n    for (let i = 0; i \u003c 3; i++) {\n      const panel = box(body, 'body.cheek.' + s + '.' + i, [0.1, 0.32, 0.58], [s * 1.074, 1.6, -0.72 + i * 0.74], mats.paint_grey, [0, s * (0.025 + detail * 0.008), s * -0.12]);\n      panel.userData.detailSeed = seed;\n      bolt(body, 'body.side-bolt.' + s + '.' + i, [s * 1.14, 1.57, -0.72 + i * 0.74], [0, 0, Math.PI / 2]);\n    }\n    box(body, 'body.identification.' + s, [0.022, 0.12, 0.43], [s * 1.147, 1.65, 0.12], mats.paint_orange);\n    for (let i = 0; i \u003c 3; i++) box(body, 'body.id-bar.' + s + '.' + i, [0.026, 0.078, 0.03], [s * 1.164, 1.65, 0.02 + i * 0.087], mats.hazard_stripes);\n  }\n  const power = group(body, 'body.rear-power', [0, 1.67, -1.12]);\n  hull(power, 'power.shell', [[-0.13, 1.46, 0.93, 0.12], [0.14, 1.53, 0.98, 0.14], [0.34, 1.28, 0.8, 0.12]], mats.steel_dark);\n  for (const s of [-1, 1]) {\n    box(power, 'power.cover.' + s, [0.49, 0.07, 0.65], [s * 0.34, 0.33, -0.02], mats.paint_grey);\n    for (let i = 0; i \u003c 7; i++) box(power, 'power.cooling-fin.' + s + '.' + i, [0.38, 0.026, 0.035], [s * 0.34, 0.379, -0.29 + i * 0.083], mats.gunmetal, [0.17, 0, 0], 0.004);\n    annulus(power, 'power.exhaust.' + s, 0.12, 0.082, 0.22, [s * 0.59, 0.02, -0.56], mats.gunmetal, [Math.PI / 2, 0, 0], 20);\n    cylinder(power, 'power.exhaust-depth.' + s, 0.08, 0.02, [s * 0.59, 0.02, -0.465], mats.steel_dark, [Math.PI / 2, 0, 0]);\n    cable(body, 'power.feed.' + s, [[s * 0.72, 1.85, -1.06], [s * (0.91 + detail * 0.018), 1.98, -0.84], [s * 0.85, 1.9, -0.48]], 0.035);\n  }\n\n  const ring = group(body, 'turret.ring', [0, 1.84, 0.13]);\n  annulus(ring, 'ring.race', 0.8, 0.54, 0.16, [0, 0, 0], mats.steel_dark);\n  annulus(ring, 'ring.bearing-lip', 0.76, 0.63, 0.05, [0, 0.095, 0], mats.gunmetal);\n  for (let i = 0; i \u003c 12; i++) {\n    const angle = i * tau / 12;\n    bolt(ring, 'ring.bolt.' + i, [Math.cos(angle) * 0.715, 0.13, Math.sin(angle) * 0.715], [0, 0, 0], 0.025);\n  }\n  const turret = group(ring, 'turret.yaw', [0, 0.13, 0]);\n  hull(turret, 'turret.armour', [[0, 1.28, 1.27, 0.18], [0.27, 1.65, 1.43, 0.25], [0.57, 1.25, 1.11, 0.22]], mats.paint_grey, [0, 0, -0.08]);\n  box(turret, 'turret.roof-access', [0.66, 0.045, 0.5], [0, 0.597, -0.21], mats.paint_grey, [0, 0, 0], 0.025);\n  cylinderBetween(turret, 'turret.hatch-handle', [-0.15, 0.66, -0.23], [0.15, 0.66, -0.23], 0.025, mats.gunmetal);\n  for (const s of [-1, 1]) {\n    box(turret, 'turret.ammo-bay.' + s, [0.35, 0.34, 0.82], [s * 0.82, 0.245, -0.31], mats.steel_dark, [0, s * -0.04, 0], 0.04);\n    box(turret, 'turret.ammo-lid.' + s, [0.055, 0.26, 0.7], [s * 1.005, 0.25, -0.31], mats.paint_orange);\n    for (let i = 0; i \u003c 3; i++) box(turret, 'turret.ammo-rib.' + s + '.' + i, [0.07, 0.3, 0.037], [s * 1.035, 0.25, -0.56 + i * 0.25], mats.gunmetal);\n  }\n  const gun = group(turret, 'turret.gun-mount', [0, 0.27, 0.59]);\n  for (const s of [-1, 1]) {\n    box(gun, 'mount.cheek.' + s, [0.16, 0.39, 0.45], [s * 0.285, 0, -0.015], mats.steel_dark, [-0.12, 0, 0], 0.025);\n    cylinder(gun, 'mount.trunnion.' + s, 0.15, 0.18, [s * 0.36, 0, -0.03], mats.gunmetal, [0, 0, Math.PI / 2]);\n    cylinder(gun, 'mount.trunnion-cap.' + s, 0.104, 0.03, [s * 0.46, 0, -0.03], mats.paint_orange, [0, 0, Math.PI / 2]);\n  }\n  box(gun, 'mount.cradle', [0.43, 0.25, 0.65], [0, -0.085, 0.1], mats.steel_dark);\n  const recoil = group(gun, 'cannon.recoil', [0, 0, 0]);\n  const sleeve = group(recoil, 'cannon.recoil-sleeve');\n  annulus(sleeve, 'sleeve.shell', 0.198, 0.151, 0.67, [0, 0, 0.24], mats.paint_grey, [Math.PI / 2, 0, 0]);\n  for (const s of [-1, 1]) {\n    cylinderBetween(gun, 'recoil.guide.' + s, [s * 0.22, -0.14, 0.04], [s * 0.22, -0.14, 0.55], 0.033, mats.gunmetal);\n    cylinderBetween(sleeve, 'recoil.buffer.' + s, [s * 0.22, -0.14, 0.16], [s * 0.22, -0.14, 0.44], 0.059, mats.steel_dark);\n  }\n  const barrel = group(recoil, 'cannon.barrel');\n  annulus(barrel, 'barrel.bored-tube', 0.119, 0.077, 1.67, [0, 0, 1.115], mats.gunmetal, [Math.PI / 2, 0, 0], 32);\n  annulus(barrel, 'barrel.thermal-jacket', 0.144, 0.121, 0.53, [0, 0, 0.81], mats.steel_dark, [Math.PI / 2, 0, 0], 32);\n  for (const z of [0.56, 1.075, 1.72]) annulus(barrel, 'barrel.collar.' + z, 0.153, 0.12, 0.07, [0, 0, z], mats.paint_orange, [Math.PI / 2, 0, 0], 32);\n  const muzzle = group(recoil, 'cannon.muzzle', [0, 0, 2.12]);\n  // 制退器为有厚度的四侧框与侧向泄压孔，前端保留真实炮膛。\n  annulus(muzzle, 'muzzle.bore-lip', 0.158, 0.077, 0.12, [0, 0, 0.13], mats.gunmetal, [Math.PI / 2, 0, 0], 32);\n  for (const s of [-1, 1]) {\n    box(muzzle, 'muzzle.plate.' + s, [0.43, 0.065, 0.43], [0, s * 0.147, -0.015], mats.steel_dark, [0, 0, 0], 0.012);\n    for (let i = 0; i \u003c 3; i++) box(muzzle, 'muzzle.port-bridge.' + s + '.' + i, [0.064, 0.26, 0.055], [s * 0.186, 0, -0.18 + i * 0.18], mats.gunmetal, [0, 0.16 * s, 0], 0.008);\n  }\n\n  const upperLength = 1.12, lowerLength = 1.39;\n  for (const [label, s, frontSign, targetZ, yaw] of [\n    ['front-left', -1, 1, 1.98, -0.09], ['front-right', 1, 1, 1.94, 0.075],\n    ['rear-left', -1, -1, -2.48, 0.09], ['rear-right', 1, -1, -2.5, -0.075]\n  ]) {\n    const leg = group(body, 'leg.' + label, [s * 0.94, 1.45, frontSign * 1.0]);\n    const hip = group(leg, 'hip');\n    cylinder(hip, 'hip.axle', 0.245, 0.49, [0, 0, 0], mats.steel_dark, [Math.PI / 2, 0, 0]);\n    cylinder(hip, 'hip.cap', 0.18, 0.045, [0, 0, 0.263], mats.paint_orange, [Math.PI / 2, 0, 0]);\n    const upper = group(hip, 'upper');\n    const upperBeam = box(upper, 'upper.load-beam', [0.26, upperLength, 0.28], [0, -upperLength / 2, 0], mats.steel_dark, [0, 0, 0], 0.035);\n    hull(upper, 'upper.armour', [[-0.92, 0.3, 0.4, 0.07], [-0.74, 0.46, 0.52, 0.09], [-0.19, 0.5, 0.49, 0.08], [-0.08, 0.33, 0.35, 0.06]], mats.paint_grey);\n    box(upper, 'upper.inset', [0.22, 0.48, 0.038], [0, -0.45, 0.277], mats.paint_orange, [0, 0, detail * 0.012]);\n    for (const y of [-0.25, -0.66]) bolt(upper, 'upper.fastener.' + y, [0, y, 0.307]);\n    cable(upper, 'upper.hose', [[0.16, -0.07, -0.1], [0.31 + detail * 0.012, -0.36, -0.2], [0.25, -0.82, -0.2], [0.12, -1.04, -0.14]], 0.026);\n    const knee = group(upper, 'knee', [0, -upperLength, 0]);\n    cylinder(knee, 'knee.axle', 0.217, 0.52, [0, 0, 0], mats.steel_dark, [Math.PI / 2, 0, 0]);\n    for (const side of [-1, 1]) {\n      cylinder(knee, 'knee.bearing.' + side, 0.15, 0.045, [0, 0, side * 0.282], mats.gunmetal, [Math.PI / 2, 0, 0]);\n      bolt(knee, 'knee.lock.' + side, [0, 0, side * 0.316], [Math.PI / 2, 0, 0], 0.065);\n    }\n    const lower = group(knee, 'lower');\n    const lowerBeam = box(lower, 'lower.load-beam', [0.19, 1.29, 0.22], [0, -0.675, 0], mats.gunmetal, [0, 0, 0], 0.025);\n    hull(lower, 'lower.shin', [[-1.13, 0.25, 0.29, 0.045], [-0.94, 0.33, 0.39, 0.06], [-0.3, 0.39, 0.4, 0.065], [-0.18, 0.28, 0.3, 0.045]], mats.paint_grey);\n    box(lower, 'lower.toe-guard', [0.29, 0.18, 0.33], [0, -1.19, 0.04], mats.steel_dark);\n    const piston = group(upper, 'piston');\n    const pistonBody = cylinderBetween(piston, 'piston.housing', [0, 0, 0], [0, 1, 0], 0.084, mats.steel_dark);\n    const pistonRod = cylinderBetween(piston, 'piston.chrome', [0, 0, 0], [0, 1, 0], 0.044, mats.gunmetal);\n    const pistonGland = cylinder(piston, 'piston.gland', 0.096, 0.055, [0, 0, 0], mats.paint_orange);\n    const foot = group(lower, 'foot', [0, -lowerLength, 0]);\n    cylinder(foot, 'foot.ankle', 0.135, 0.35, [0, 0.02, 0], mats.steel_dark, [0, 0, Math.PI / 2]);\n    const footShell = hull(foot, 'foot.armour', [[-0.13, 0.82, 1.1, 0.1], [-0.04, 0.84, 1.12, 0.11], [0.12, 0.55, 0.76, 0.09]], mats.paint_grey);\n    const sole = box(foot, 'foot.sole', [0.8, 0.07, 1.08], [0, -0.165, 0], mats.rubber, [0, 0, 0], 0.013);\n    for (let i = 0; i \u003c 5; i++) {\n      for (const side of [-1, 1]) box(foot, 'foot.tread.' + side + '.' + i, [0.36, 0.035, 0.14], [side * 0.207, -0.2175, -0.42 + i * 0.21], mats.rubber, [0, side * 0.14, 0], 0.006);\n    }\n    for (const side of [-1, 1]) box(foot, 'foot.front-cleat.' + side, [0.17, 0.09, 0.12], [side * 0.23, -0.09, 0.535], mats.gunmetal);\n    const target = new THREE.Vector3(s * 1.94, 0.235, targetZ);\n    const direction = target.clone().sub(leg.position);\n    hip.rotation.y = Math.atan2(-direction.z, direction.x);\n    const horizontal = Math.hypot(direction.x, direction.z);\n    const footYaw = new THREE.Quaternion().setFromAxisAngle(axisY, yaw);\n    legs.push({ leg, hip, upper, knee, lower, foot, pistonBody, pistonRod, pistonGland, target, horizontal, footYaw, diagonal: s * frontSign });\n    collider(upperBeam, 'metal');\n    collider(lowerBeam, 'metal');\n    collider(footShell, 'metal');\n    collider(sole, 'rubber');\n  }\n  collider(chassis, 'metal');\n\n  const sockets = {\n    base: { position: [0, 0, 0] },\n    turret: { position: [0, 0, 0] },\n    muzzle: { position: [0, 0, 0] },\n    'mount.front': { position: [0, 0, 0] },\n    'mount.rear': { position: [0, 0, 0] }\n  };\n  const animation = { phase: 0, firePulse: 0, mode: 'idle' };\n  const inverseRoot = new THREE.Matrix4();\n  const localMatrix = new THREE.Matrix4();\n  const bounds = new THREE.Box3();\n  const targetBounds = new THREE.Box3();\n  const point = new THREE.Vector3();\n  const size = [0, 0, 0];\n  const chainQuaternion = new THREE.Quaternion();\n  const pistonStart = [0.19, -0.32, 0.31];\n  const pistonEnd = [0, 0, 0.31];\n  const pistonSplit = [0, 0, 0.31];\n  function socketPosition(name, node, x, y, z) {\n    point.set(x, y, z).applyMatrix4(node.matrixWorld).applyMatrix4(inverseRoot);\n    point.toArray(sockets[name].position);\n  }\n  function refreshMetadata() {\n    root.updateWorldMatrix(true, true);\n    inverseRoot.copy(root.matrixWorld).invert();\n    bounds.makeEmpty();\n    for (const node of meshes) {\n      localMatrix.multiplyMatrices(inverseRoot, node.matrixWorld);\n      const positions = node.geometry.attributes.position;\n      for (let i = 0; i \u003c positions.count; i++) {\n        point.fromBufferAttribute(positions, i).applyMatrix4(localMatrix);\n        bounds.expandByPoint(point);\n      }\n    }\n    size[0] = bounds.max.x - bounds.min.x;\n    size[1] = bounds.max.y - bounds.min.y;\n    size[2] = bounds.max.z - bounds.min.z;\n    for (const { node, result } of collisionTargets) {\n      localMatrix.multiplyMatrices(inverseRoot, node.matrixWorld);\n      targetBounds.copy(node.geometry.boundingBox).applyMatrix4(localMatrix);\n      targetBounds.min.toArray(result.min);\n      targetBounds.max.toArray(result.max);\n    }\n    socketPosition('turret', turret, 0, 0, 0);\n    socketPosition('muzzle', muzzle, 0, 0, 0.19);\n    socketPosition('mount.front', body, 0, 1.2, 1.64);\n    socketPosition('mount.rear', power, 0, -0.06, -0.56);\n  }\n  function pose(phase, firePulse) {\n    body.position.y = 0.012 * Math.sin(phase * tau / 3.6);\n    turret.rotation.y = 0.115 * Math.sin(phase * tau / 13);\n    recoil.position.z = -0.18 * firePulse;\n    for (const item of legs) {\n      // 二连杆解析姿态：足底固定，交替髋高微动而不是整腿木棍旋转。\n      const lift = 0.007 * Math.sin(phase * tau / 3.6) * item.diagonal;\n      item.leg.position.y = 1.45 + lift;\n      const down = item.leg.position.y + body.position.y - item.target.y;\n      const distanceSquared = item.horizontal * item.horizontal + down * down;\n      const cosine = (distanceSquared - upperLength * upperLength - lowerLength * lowerLength) / (2 * upperLength * lowerLength);\n      const beta = -Math.acos(Math.max(-1, Math.min(1, cosine)));\n      const alpha = Math.atan2(item.horizontal, down) - Math.atan2(lowerLength * Math.sin(beta), upperLength + lowerLength * Math.cos(beta));\n      item.upper.rotation.z = alpha;\n      item.knee.rotation.z = beta;\n      chainQuaternion.copy(item.hip.quaternion).multiply(item.upper.quaternion).multiply(item.knee.quaternion);\n      item.foot.quaternion.copy(chainQuaternion).invert().multiply(item.footYaw);\n      pistonEnd[0] = 0.46 * Math.sin(beta) + 0.13 * Math.cos(beta);\n      pistonEnd[1] = -upperLength - 0.46 * Math.cos(beta) + 0.13 * Math.sin(beta);\n      for (let i = 0; i \u003c 3; i++) pistonSplit[i] = pistonStart[i] + (pistonEnd[i] - pistonStart[i]) * 0.58;\n      fitBetween(item.pistonBody, pistonStart, pistonSplit);\n      fitBetween(item.pistonRod, pistonSplit, pistonEnd);\n      item.pistonGland.position.set(...pistonSplit);\n      item.pistonGland.quaternion.copy(item.pistonBody.quaternion);\n    }\n    refreshMetadata();\n  }\n  root.userData.assetId = 'new.quadruped-mech';\n  root.userData.authored = true;\n  root.userData.units = 'm';\n  root.userData.origin = 'bottom-center';\n  root.userData.forward = '+Z';\n  root.userData.options = { seed, armor };\n  root.userData.size = size;\n  root.userData.colliders = collisionTargets.map(item => item.result);\n  root.userData.sockets = sockets;\n  root.userData.animation = animation;\n  root.userData.stats = {\n    meshes: meshes.length,\n    triangles: meshes.reduce((sum, node) => sum + node.geometry.index.count / 3, 0),\n    legs: 4,\n    cannon: 1,\n    geometries: ownGeometry.size,\n    materials: ownMaterial.size\n  };\n  root.userData.update = function update(dt) {\n    if (disposed) return;\n    if (!Number.isFinite(dt) || dt \u003c 0) throw new Error('dt 必须是有限的非负秒数');\n    animation.phase += dt;\n    const cycle = animation.phase % 4;\n    let pulse = 0;\n    // 每四秒一次：快速后坐 60ms，随后 320ms 平滑复进。\n    if (cycle >= 1.2 && cycle \u003c 1.26) {\n      const t = (cycle - 1.2) / 0.06;\n      pulse = t * t * (3 - 2 * t);\n    } else if (cycle >= 1.26 && cycle \u003c 1.58) {\n      const t = (cycle - 1.26) / 0.32;\n      pulse = 1 - t * t * (3 - 2 * t);\n    }\n    animation.firePulse = pulse;\n    pose(animation.phase, pulse);\n  };\n  root.userData.reset = function reset() {\n    if (disposed) return;\n    animation.phase = 0;\n    animation.firePulse = 0;\n    animation.mode = 'idle';\n    pose(0, 0);\n  };\n  root.userData.dispose = function dispose() {\n    if (disposed) return;\n    disposed = true;\n    for (const item of ownGeometry) item.dispose();\n    for (const item of ownMaterial) item.dispose();\n    ownGeometry.clear();\n    ownMaterial.clear();\n    geometryCache.clear();\n  };\n  pose(0, 0);\n  // 不缩放几何，仅校准静置包围盒的底面中心。\n  body.position.x = -(bounds.min.x + bounds.max.x) / 2;\n  body.position.z = -(bounds.min.z + bounds.max.z) / 2;\n  root.position.y = -bounds.min.y;\n  refreshMetadata();\n  return root;\n}\n",
      "tags": [
        "原创",
        "四足",
        "机甲",
        "火炮",
        "动画",
        "程序化",
        "战斗载具"
      ],
      "contract": {
        "units": "m",
        "size": [
          4.82,
          2.68,
          6.16
        ],
        "sizeTolerance": {
          "meters": 0.05,
          "percent": 0.02
        },
        "origin": "bottom-center",
        "forward": "+Z",
        "qualityTier": "catalog",
        "materials": [
          "paint_grey",
          "paint_orange",
          "steel_dark",
          "gunmetal",
          "rubber",
          "hazard_stripes"
        ],
        "requiredParts": [
          "body.chassis",
          "body.front-plate",
          "body.rear-power",
          "turret.ring",
          "turret.gun-mount",
          "cannon.barrel",
          "cannon.muzzle",
          "cannon.recoil-sleeve",
          "leg.front-left",
          "leg.front-right",
          "leg.rear-left",
          "leg.rear-right"
        ],
        "options": {
          "seed": {
            "type": "integer",
            "default": 7,
            "values": [
              7,
              19,
              43
            ]
          },
          "armor": {
            "type": "string",
            "default": "grey",
            "values": [
              "grey",
              "orange"
            ]
          }
        },
        "variantEnvelopes": [],
        "collidersRequired": true,
        "dynamic": true,
        "budget": {
          "triangles": 60000,
          "maxMeshes": 260
        },
        "baseline": {
          "type": "new-design",
          "referenceAssets": [
            "prop.forklift"
          ],
          "scope": "仅对照现有载具/机械资产的结构层级、材料所有权、碰撞与动画生命周期；不复刻原版外形。"
        }
      },
      "acceptance": {
        "catalog": "unverified",
        "geometry": "unverified",
        "visual": "unverified",
        "runtime": "unverified"
      },
      "sourceHash": "1ed51d680989973a6240376bd32a5bb2ace2044481197d1864077f439a56c967",
      "evidence": {
        "report": "outputs/quadruped-mech/asset-review.html"
      }
    }
  ]
};
