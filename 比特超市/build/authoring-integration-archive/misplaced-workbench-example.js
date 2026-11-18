// 原创港区维修工作台：仅提供 build，不注册主项目或访问全局状态。
export function build(ctx, options = {}) {
  const THREE = ctx.THREE;
  const kit = ctx.kit;
  const mats = ctx.mats;
  const seed = options.seed === undefined ? 0 : options.seed;
  const colorName = options.color === undefined ? "paint_grey" : options.color;
  const drawerOpen = options.drawerOpen === undefined ? 0 : options.drawerOpen;
  const initialDrawerOpen = drawerOpen;
  const wearEnabled = options.wear === true;
  if (![0, 1, 5].includes(seed)) throw new Error("seed 必须是 0、1 或 5");
  if (!["paint_grey", "paint_blue"].includes(colorName)) throw new Error("color 必须是 paint_grey 或 paint_blue");
  if (![0, 0.12].includes(drawerOpen)) throw new Error("drawerOpen 必须是 0 或 0.12");

  const paint = mats.get(colorName, wearEnabled && typeof ctx.rng === "function" ? { wear: ctx.rng() } : undefined);
  const steel = mats.get("steel_dark");
  const wood = mats.get("wood_pallet");
  const rubber = mats.get("rubber");
  const labelInfo = mats.label("M-14", { seed });
  const labelMaterial = labelInfo && labelInfo.material ? labelInfo.material : steel;
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
  box(top, paint, "rightEdge", 0.025, 0.045, 0.58, 0.687, 0.825, 0.004);

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
  box(badge, labelMaterial, "assetLabel", 0.18, 0.035, 0.006, -0.47, 0.867, 0.321, 0.002);

  root.userData.assetId = "new.harbor-service-workbench";
  root.userData.authored = true;
  root.userData.size = [1.4, 0.9, 0.65];
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
  root.userData.options = { seed, color: colorName, drawerOpen, wear: wearEnabled };

  let disposed = false;
  let animationTime = 0;
  root.userData.update = (dt) => {
    if (initialDrawerOpen === 0) return;
    animationTime += Math.max(0, dt);
    const phase = (animationTime % 2) / 2;
    const offset = phase < 0.5 ? initialDrawerOpen * phase * 2 : initialDrawerOpen * (2 - phase * 2);
    drawer.position.z = offset;
    drawerSlides.position.z = offset;
    handle.position.z = offset;
  };
  root.userData.reset = () => {
    animationTime = 0;
    drawer.position.z = initialDrawerOpen;
    drawerSlides.position.z = initialDrawerOpen;
    handle.position.z = initialDrawerOpen;
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
