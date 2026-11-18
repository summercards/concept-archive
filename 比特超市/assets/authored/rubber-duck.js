export function build(ctx, options = {}) {
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
