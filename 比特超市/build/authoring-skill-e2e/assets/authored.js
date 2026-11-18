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
window.AUTHORED_CATALOG = {
  "meta": {
    "schemaVersion": 1,
    "total": 1,
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
      "n": 1,
      "subs": [
        {
          "name": "原创模型",
          "n": 1
        }
      ]
    }
  ],
  "items": [
    {
      "id": "new.harbor-service-workbench",
      "cat": "NEW",
      "sub": "原创模型",
      "name": "港区原创维修工作台",
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
      "summary": "原创四腿钢框架维修台，含真实厚度木台面、下层板、背侧加劲梁、抽屉和拉手、脚垫与平面标签；提供灰蓝换色及静态抽屉姿态，未完成真实视觉验收。",
      "anchor": "assets/authored/harbor-service-workbench.js",
      "source": "harbor-service-workbench.js",
      "code": "// 原创港区维修工作台：仅提供 build，不注册主项目或访问全局状态。\nexport function build(ctx, options = {}) {\n  const THREE = ctx.THREE;\n  const kit = ctx.kit;\n  const mats = ctx.mats;\n  const seed = options.seed === undefined ? 0 : options.seed;\n  const colorName = options.color === undefined ? \"paint_grey\" : options.color;\n  const drawerOpen = options.drawerOpen === undefined ? 0 : options.drawerOpen;\n  const initialDrawerOpen = drawerOpen;\n  if (![0, 1, 5].includes(seed)) throw new Error(\"seed 必须是 0、1 或 5\");\n  if (![\"paint_grey\", \"paint_blue\"].includes(colorName)) throw new Error(\"color 必须是 paint_grey 或 paint_blue\");\n  if (![0, 0.12].includes(drawerOpen)) throw new Error(\"drawerOpen 必须是 0 或 0.12\");\n\n  // seed 是宿主兼容参数；本静态样例不消费 rng，也不以 seed 改变外观。\n  const paint = mats.get(colorName);\n  const steel = mats.get(\"steel_dark\");\n  const wood = mats.get(\"wood_pallet\");\n  const rubber = mats.get(\"rubber\");\n  const labelInfo = mats.label(\"M-14\");\n  const labelMaterial = labelInfo.material;\n  const root = new THREE.Group();\n  root.name = \"harborServiceWorkbench\";\n\n  const part = (name) => {\n    const group = new THREE.Group();\n    group.name = name;\n    group.userData.noMerge = true;\n    root.add(group);\n    return group;\n  };\n  const box = (group, material, name, w, h, d, x, y, z, bevel = 0.006) => {\n    const geometry = kit.metricBox(w, h, d, bevel);\n    kit.place(geometry, x, y, z);\n    const mesh = new THREE.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    return mesh;\n  };\n  const cylinder = (group, material, name, radius, height, x, y, z, segments = 12) => {\n    const geometry = kit.cylinder(radius, radius, height, segments, false);\n    kit.place(geometry, x, y, z);\n    const mesh = new THREE.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    return mesh;\n  };\n  const tube = (group, material, name, points, radius) => {\n    const geometry = kit.tube(points, radius, 8, false, 0);\n    const mesh = new THREE.Mesh(geometry, material);\n    mesh.name = name;\n    mesh.castShadow = true;\n    mesh.receiveShadow = true;\n    group.add(mesh);\n    return mesh;\n  };\n\n  const frame = part(\"frame\");\n  const legPositions = [[-0.62, -0.245], [0.62, -0.245], [-0.62, 0.245], [0.62, 0.245]];\n  for (const [x, z] of legPositions) {\n    box(frame, steel, \"leg\", 0.06, 0.78, 0.06, x, 0.45, z, 0.006);\n  }\n  const supportRails = part(\"supportRails\");\n  box(supportRails, steel, \"frontRail\", 1.25, 0.055, 0.055, 0, 0.78, 0.255, 0.006);\n  box(supportRails, steel, \"rearRail\", 1.25, 0.055, 0.055, 0, 0.78, -0.255, 0.006);\n  box(supportRails, steel, \"leftRail\", 0.055, 0.055, 0.51, -0.62, 0.78, 0, 0.006);\n  box(supportRails, steel, \"rightRail\", 0.055, 0.055, 0.51, 0.62, 0.78, 0, 0.006);\n\n  const feet = part(\"feet\");\n  for (const [x, z] of legPositions) {\n    box(feet, rubber, \"footPad\", 0.085, 0.06, 0.085, x, 0.03, z, 0.012);\n  }\n\n  const top = part(\"top\");\n  box(top, wood, \"workSurface\", 1.4, 0.06, 0.65, 0, 0.87, 0, 0.008);\n  box(top, paint, \"frontEdge\", 1.32, 0.045, 0.024, 0, 0.825, 0.312, 0.004);\n  box(top, paint, \"leftEdge\", 0.025, 0.045, 0.58, -0.687, 0.825, 0, 0.004);\n  box(top, paint, \"rightEdge\", 0.025, 0.045, 0.58, 0.687, 0.825, 0, 0.004);\n\n  const shelf = part(\"shelf\");\n  box(shelf, wood, \"lowerShelf\", 1.12, 0.055, 0.45, 0, 0.235, -0.005, 0.006);\n  box(shelf, steel, \"shelfFrontRail\", 1.12, 0.035, 0.035, 0, 0.25, 0.225, 0.004);\n  box(shelf, steel, \"shelfRearRail\", 1.12, 0.035, 0.035, 0, 0.25, -0.235, 0.004);\n\n  const backBrace = part(\"backBrace\");\n  box(backBrace, steel, \"backStiffener\", 1.18, 0.055, 0.055, 0, 0.67, -0.265, 0.006);\n  tube(backBrace, steel, \"leftDiagonal\", [[-0.56, 0.29, -0.265], [-0.43, 0.67, -0.265]], 0.014);\n  tube(backBrace, steel, \"rightDiagonal\", [[0.56, 0.29, -0.265], [0.43, 0.67, -0.265]], 0.014);\n\n  const drawer = part(\"drawer\");\n  drawer.position.z = drawerOpen;\n  box(drawer, paint, \"drawerFront\", 0.72, 0.14, 0.03, 0, 0.62, 0.277, 0.005);\n  box(drawer, wood, \"drawerBottom\", 0.68, 0.025, 0.27, 0, 0.545, 0.14, 0.004);\n  box(drawer, paint, \"drawerLeftSide\", 0.025, 0.13, 0.27, -0.347, 0.61, 0.14, 0.004);\n  box(drawer, paint, \"drawerRightSide\", 0.025, 0.13, 0.27, 0.347, 0.61, 0.14, 0.004);\n  box(drawer, steel, \"drawerGap\", 0.76, 0.018, 0.014, 0, 0.532, 0.292, 0.002);\n\n  const drawerSlides = part(\"drawerSlides\");\n  drawerSlides.position.z = drawerOpen;\n  box(drawerSlides, steel, \"leftSlide\", 0.045, 0.025, 0.28, -0.39, 0.59, 0.13, 0.003);\n  box(drawerSlides, steel, \"rightSlide\", 0.045, 0.025, 0.28, 0.39, 0.59, 0.13, 0.003);\n\n  const handle = part(\"handle\");\n  handle.position.z = drawerOpen;\n  tube(handle, steel, \"drawerPull\", [[-0.12, 0.62, 0.31], [0.12, 0.62, 0.31]], 0.012);\n  cylinder(handle, steel, \"leftMount\", 0.016, 0.035, -0.12, 0.62, 0.295, 10);\n  cylinder(handle, steel, \"rightMount\", 0.016, 0.035, 0.12, 0.62, 0.295, 10);\n\n  const badge = part(\"badge\");\n  // 标签使用完整 0–1 UV，例外于实体部件的米制 UV；默认法线朝 +Z。\n  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.035), labelMaterial);\n  label.name = \"label_workbench\";\n  label.position.set(-0.47, 0.867, 0.325);\n  label.castShadow = false;\n  badge.add(label);\n\n  root.userData.assetId = \"new.harbor-service-workbench\";\n  root.userData.authored = true;\n  root.updateMatrixWorld(true);\n  const bounds = new THREE.Box3().setFromObject(root);\n  root.userData.size = bounds.getSize(new THREE.Vector3()).toArray();\n  root.userData.nominalBounds = { min: [-0.7, 0, -0.325], max: [0.7, 0.9, 0.325] };\n  root.userData.boundsEnvelope = { min: [-0.7, 0, -0.325], max: [0.7, 0.9, 0.445] };\n  root.userData.colliders = [\n    { min: [-0.66, 0.84, -0.29], max: [0.66, 0.9, 0.29], surface: \"wood_pallet\" },\n    { min: [-0.65, 0.08, -0.275], max: [-0.59, 0.82, -0.215], surface: \"steel_dark\" },\n    { min: [0.59, 0.08, -0.275], max: [0.65, 0.82, -0.215], surface: \"steel_dark\" },\n    { min: [-0.65, 0.08, 0.215], max: [-0.59, 0.82, 0.275], surface: \"steel_dark\" },\n    { min: [0.59, 0.08, 0.215], max: [0.65, 0.82, 0.275], surface: \"steel_dark\" },\n    { min: [-0.56, 0.205, -0.23], max: [0.56, 0.265, 0.22], surface: \"wood_pallet\" },\n    { min: [-0.36, 0.54, 0.12 + drawerOpen], max: [0.36, 0.7, 0.295 + drawerOpen], surface: colorName },\n    { min: [-0.59, 0.64, -0.292], max: [0.59, 0.7, -0.238], surface: \"steel_dark\" }\n  ];\n  root.userData.sockets = { workSurface: { position: [0, 0.9, 0] } };\n  root.userData.options = { seed, color: colorName, drawerOpen };\n\n  let disposed = false;\n  root.userData.reset = () => {\n    drawer.position.z = initialDrawerOpen;\n    drawerSlides.position.z = initialDrawerOpen;\n    handle.position.z = initialDrawerOpen;\n    root.userData.colliders[6].min = [-0.36, 0.54, 0.12 + initialDrawerOpen];\n    root.userData.colliders[6].max = [0.36, 0.7, 0.295 + initialDrawerOpen];\n    root.updateMatrixWorld(true);\n  };\n  root.userData.dispose = () => {\n    if (disposed) return;\n    disposed = true;\n    root.traverse((object) => {\n      if (object.geometry) object.geometry.dispose();\n    });\n  };\n  return root;\n}\n",
      "tags": [
        "原创",
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
      "sourceHash": "a079559be376ab36fb06e26eba15d0761d9a7fb7b47ca137bc45a69cb9083d91"
    }
  ]
};
