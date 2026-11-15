(() => {
  "use strict";

  const space = document.getElementById("universe");
  if (!space) return;
  let canvas = document.getElementById("galaxy");
  const stars = [...document.querySelectorAll(".universe-stars .concept-star")];
  const outerOrbit = Math.max(.25, ...stars.map(star => Number(star.dataset.radius)));
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const motionButton = document.getElementById("motion-toggle");
  const indexButton = document.getElementById("index-toggle");
  const indexDialog = document.getElementById("star-index");
  const announcement = document.getElementById("universe-announcement");
  const TAU = Math.PI * 2;
  let width = 1, height = 1, ratio = 1, scale = 1, skyAngle = -.3;
  let elapsed = 0, lastTime = 0, frame = 0, userPaused = false;
  let turn = 0, tilt = .52, drag = null, hovered = null, focused = null;
  let pointer = { x: 0, y: 0 }, parallax = { x: 0, y: 0 };
  let journey = null, zoom = 1, shiftX = 0, shiftY = 0;
  let renderer;

  // 固定随机种子，让星系有形，不在每次重绘时随机闪烁。
  let seed = 470319;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function normal() {
    return Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(TAU * random());
  }
  const particles = [];
  function particle(x, y, z, size, alpha, color, kind) {
    particles.push(x, y, z, size, alpha, ...color, kind);
  }
  const tones = [[.69, .68, .88], [.86, .74, .81], [.62, .74, .88], [.87, .85, .93]];

  // 弥散星云先于恒星绘制。三条带有不规则厚度的旋臂，不画规则轨道线。
  for (let i = 0; i < 660; i += 1) {
    const r = Math.pow(random(), .92) * 1.08;
    const theta = (i % 3) * TAU / 3 + Math.log(r + .13) * 2.8 + normal() * .18;
    particle(Math.cos(theta) * r, normal() * .026, Math.sin(theta) * r,
      19 + random() * 62, .005 + .010 * (1 - r / 1.2), tones[i % 3], 2);
  }
  for (let i = 0; i < 22; i += 1) {
    particle(normal() * .075, normal() * .015, normal() * .08,
      50 + random() * 100, .018 + random() * .015, [.86, .77, .89], 2);
  }
  const starCount = window.innerWidth < 680 ? 17000 : 27000;
  for (let i = 0; i < starCount; i += 1) {
    const r = .018 + Math.pow(random(), .94) * 1.12;
    const scattered = random() < .2;
    const theta = scattered ? random() * TAU
      : (i % 3) * TAU / 3 + Math.log(r + .13) * 2.8 + normal() * (.105 + .16 * r);
    const thickness = (.012 + .028 * (1 - r / 1.2)) * normal();
    const size = .45 + Math.pow(random(), 5) * 1.8;
    const alpha = (.13 + random() * .45) * (1.0 - .46 * r);
    particle(Math.cos(theta) * r, thickness, Math.sin(theta) * r, size, alpha, tones[i % 4], 1);
  }
  // 球状核只占很小区域，避免一团不透明的发光圆盘。
  for (let i = 0; i < 2700; i += 1) {
    particle(normal() * .093, normal() * .042, normal() * .093,
      .45 + random() * .75, .15 + random() * .33, tones[3], 1);
  }
  for (let i = 0; i < 620; i += 1) {
    particle(random() * 2 - 1, random() * 2 - 1, random(),
      .6 + Math.pow(random(), 7) * 2.3, .10 + random() * .45, tones[i % 4], 0);
  }
  const data = new Float32Array(particles);

  function createWebGL() {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false,
      stencil: false, powerPreference: "low-power" });
    if (!gl) throw new Error("WebGL unavailable");
    const vertexSource = `
      precision highp float;
      attribute vec3 a_position;
      attribute float a_size;
      attribute float a_alpha;
      attribute vec3 a_color;
      attribute float a_kind;
      uniform vec2 u_resolution;
      uniform vec2 u_pointer;
      uniform vec2 u_shift;
      uniform float u_scale;
      uniform float u_ratio;
      uniform float u_time;
      uniform float u_turn;
      uniform float u_tilt;
      uniform float u_sky;
      uniform float u_zoom;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_kind;
      void main() {
        vec2 p;
        float pointSize = a_size;
        if (a_kind < .5) {
          p = a_position.xy * u_resolution * .5 + u_pointer * (1.0 + a_position.z);
          p *= 1.0 + (u_zoom - 1.0) * .12;
        } else {
          float radius = length(a_position.xz);
          float theta = u_turn + u_time * .018 / (.45 + radius);
          float x = a_position.x * cos(theta) - a_position.z * sin(theta);
          float z = a_position.x * sin(theta) + a_position.z * cos(theta);
          vec2 disk = vec2(x, z * u_tilt + a_position.y * .85);
          p = vec2(disk.x * cos(u_sky) - disk.y * sin(u_sky),
                   disk.x * sin(u_sky) + disk.y * cos(u_sky)) * u_scale;
          p += u_pointer;
          p = (p - u_shift) * u_zoom;
          pointSize *= min(3.0, sqrt(u_zoom));
        }
        gl_Position = vec4(p.x / (u_resolution.x * .5), -p.y / (u_resolution.y * .5), 0.0, 1.0);
        gl_PointSize = max(.7, pointSize * u_ratio);
        v_color = a_color;
        float twinkle = a_kind > .5 && a_kind < 1.5
          ? .88 + .12 * sin(u_time * .55 + a_position.x * 90.0) : 1.0;
        v_alpha = a_alpha * twinkle;
        v_kind = a_kind;
      }
    `;
    const fragmentSource = `
      precision mediump float;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_kind;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float d = dot(p, p);
        if (d > 1.0) discard;
        float glow = exp(-d * (v_kind > 1.5 ? 4.0 : 3.5)) * (1.0 - smoothstep(.6, 1.0, d));
        gl_FragColor = vec4(v_color, v_alpha * glow);
      }
    `;
    function shader(type, source) {
      const result = gl.createShader(type);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
        gl.deleteShader(result);
        throw new Error("Shader compilation unavailable");
      }
      return result;
    }
    const program = gl.createProgram();
    const vertex = shader(gl.VERTEX_SHADER, vertexSource);
    const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader link unavailable");
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const attributes = [["a_position", 3, 0], ["a_size", 1, 3], ["a_alpha", 1, 4],
      ["a_color", 3, 5], ["a_kind", 1, 8]];
    for (const [name, count, offset] of attributes) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, count, gl.FLOAT, false, 36, offset * 4);
    }
    const uniforms = {};
    for (const name of ["resolution", "pointer", "shift", "scale", "ratio", "time", "turn", "tilt", "sky", "zoom"]) {
      uniforms[name] = gl.getUniformLocation(program, "u_" + name);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    // 不透明底防止低 alpha 的星尘在画布与页面二次混合时被再次衰减。
    gl.clearColor(8 / 255, 9 / 255, 20 / 255, 1);
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      useCanvasFallback();
      requestDraw();
    }, { once: true });
    document.documentElement.dataset.galaxyRenderer = "webgl";
    return {
      draw() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uniforms.resolution, width, height);
        gl.uniform2f(uniforms.pointer, parallax.x, parallax.y);
        gl.uniform2f(uniforms.shift, shiftX, shiftY);
        gl.uniform1f(uniforms.scale, scale);
        gl.uniform1f(uniforms.ratio, ratio);
        gl.uniform1f(uniforms.time, elapsed);
        gl.uniform1f(uniforms.turn, turn);
        gl.uniform1f(uniforms.tilt, tilt);
        gl.uniform1f(uniforms.sky, skyAngle);
        gl.uniform1f(uniforms.zoom, zoom);
        gl.drawArrays(gl.POINTS, 0, data.length / 9);
      }
    };
  }

  function project(x, y, z) {
    const r = Math.hypot(x, z);
    const theta = turn + elapsed * .018 / (.45 + r);
    const xx = x * Math.cos(theta) - z * Math.sin(theta);
    const zz = x * Math.sin(theta) + z * Math.cos(theta);
    const yy = zz * tilt + y * .85;
    return {
      x: (xx * Math.cos(skyAngle) - yy * Math.sin(skyAngle)) * scale + parallax.x,
      y: (xx * Math.sin(skyAngle) + yy * Math.cos(skyAngle)) * scale + parallax.y
    };
  }

  function create2D() {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas unavailable");
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const painter = sprite.getContext("2d");
    const gradient = painter.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(206,189,229,.8)");
    gradient.addColorStop(.3, "rgba(175,157,205,.3)");
    gradient.addColorStop(1, "rgba(140,123,180,0)");
    painter.fillStyle = gradient;
    painter.fillRect(0, 0, 64, 64);
    document.documentElement.dataset.galaxyRenderer = "canvas2d";
    return {
      draw() {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < data.length; i += 9) {
          const kind = data[i + 8];
          if (kind === 1 && (i / 9) % 3 !== 0) continue;
          let point;
          if (kind === 0) point = { x: data[i] * width * .5, y: data[i + 1] * height * .5 };
          else point = project(data[i], data[i + 1], data[i + 2]);
          const x = width * .5 + (point.x - (kind ? shiftX : 0)) * (kind ? zoom : 1);
          const y = height * .5 + (point.y - (kind ? shiftY : 0)) * (kind ? zoom : 1);
          if (x < -100 || y < -100 || x > width + 100 || y > height + 100) continue;
          ctx.globalAlpha = data[i + 4] * (kind === 1 ? 1.8 : 1);
          const size = data[i + 3] * Math.min(3, Math.sqrt(zoom));
          if (kind === 2) ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
          else {
            ctx.fillStyle = kind ? "#c6bddc" : "#b7b9d1";
            ctx.fillRect(x, y, Math.max(.55, size * .65), Math.max(.55, size * .65));
          }
        }
        ctx.globalAlpha = 1;
      }
    };
  }

  function useCanvasFallback() {
    const replacement = canvas.cloneNode(false);
    canvas.replaceWith(replacement);
    canvas = replacement;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    try { renderer = create2D(); }
    catch (_) { renderer = null; document.documentElement.dataset.galaxyRenderer = "static"; }
  }
  try { renderer = createWebGL(); }
  catch (_) { useCanvasFallback(); }

  function autoMotion() {
    return !motion.matches && !userPaused && !hovered && !focused && !drag && !indexDialog.open;
  }
  function requestDraw() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function placeStars() {
    const occupied = [];
    for (const star of stars) {
      const r = Number(star.dataset.radius), angle = Number(star.dataset.angle);
      const projected = project(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      const x = width * .5 + (projected.x - shiftX) * zoom;
      const y = height * .5 + (projected.y - shiftY) * zoom;
      star.style.left = `${x.toFixed(2)}px`;
      star.style.top = `${y.toFixed(2)}px`;
      const left = x > width - (width < 680 ? 170 : 220);
      star.classList.toggle("is-label-left", left);
      star.classList.toggle("is-label-above", y > height - 180);
      // 星数增长后，只折叠确实碰撞的标注；星体与星图入口始终保留。
      const labelX = left ? x - 180 : x + 45;
      const crowded = occupied.some(p => Math.abs(p.x - labelX) < 150 && Math.abs(p.y - y) < 72);
      star.classList.toggle("is-label-quiet", crowded && hovered !== star && focused !== star);
      occupied.push({ x: labelX, y });
    }
  }
  function tick(now) {
    frame = 0;
    const delta = lastTime ? Math.min(.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    if (autoMotion() && !journey) elapsed += delta;
    const smoothing = motion.matches ? 1 : 1 - Math.exp(-delta * 4.8);
    parallax.x += (pointer.x - parallax.x) * smoothing;
    parallax.y += (pointer.y - parallax.y) * smoothing;
    if (journey) {
      const progress = Math.min(1, (now - journey.start) / journey.duration);
      const ease = progress * progress * progress;
      zoom = 1 + ease * 6.8;
      // 缩放和平移联合求解，目标只向画面中心靠近，不先被放大甩出屏幕。
      shiftX = journey.x * (1 - (1 - ease) / zoom);
      shiftY = journey.y * (1 - (1 - ease) / zoom);
    }
    if (renderer) renderer.draw();
    placeStars();
    const settling = Math.abs(pointer.x - parallax.x) + Math.abs(pointer.y - parallax.y) > .08;
    if (autoMotion() || journey || settling) requestDraw();
  }
  function fitGalaxy() {
    const candidate = width < 680 ? Math.min(width * .63, height * .35) : Math.min(width * .395, height * .63);
    const boundX = Math.hypot(Math.cos(skyAngle), tilt * Math.sin(skyAngle)) * outerOrbit;
    const boundY = Math.hypot(Math.sin(skyAngle), tilt * Math.cos(skyAngle)) * outerOrbit;
    scale = Math.max(1, Math.min(candidate, Math.max(20, width / 2 - 44) / boundX,
      Math.max(20, height / 2 - 110) / boundY));
  }
  function resize() {
    width = space.clientWidth;
    height = space.clientHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 1.8, Math.sqrt(3800000 / (width * height)));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    skyAngle = width < 680 ? -.72 : -.32;
    fitGalaxy();
    requestDraw();
  }

  for (const star of stars) {
    star.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse") return;
      hovered = star;
      requestDraw();
    });
    star.addEventListener("pointerleave", () => { hovered = null; lastTime = 0; requestDraw(); });
    star.addEventListener("focus", () => { focused = star; requestDraw(); });
    star.addEventListener("blur", () => { focused = null; lastTime = 0; requestDraw(); });
  }
  space.addEventListener("pointerdown", event => {
    if (event.target.closest("a, button") || event.button !== 0 || journey) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    space.setPointerCapture(event.pointerId);
    space.classList.add("is-dragging");
  });
  space.addEventListener("pointermove", event => {
    if (journey) return;
    if (drag && drag.id === event.pointerId) {
      turn += (event.clientX - drag.x) * .004;
      tilt = Math.max(.24, Math.min(.82, tilt + (event.clientY - drag.y) * .0017));
      fitGalaxy();
      drag.x = event.clientX;
      drag.y = event.clientY;
      requestDraw();
    } else if (finePointer.matches && !motion.matches && !userPaused) {
      pointer.x = (event.clientX / width - .5) * 12;
      pointer.y = (event.clientY / height - .5) * 9;
      requestDraw();
    }
  });
  function stopDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    space.classList.remove("is-dragging");
    lastTime = 0;
    requestDraw();
  }
  space.addEventListener("pointerup", stopDrag);
  space.addEventListener("pointercancel", stopDrag);
  space.addEventListener("lostpointercapture", stopDrag);
  space.addEventListener("pointerleave", () => { pointer = { x: 0, y: 0 }; requestDraw(); });

  function syncMotionButton() {
    const paused = userPaused || motion.matches;
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute("aria-label", paused ? "星海已静止，点击恢复运动" : "暂停星海运动");
    motionButton.title = paused ? "恢复星海运动" : "暂停星海运动";
  }
  motionButton.hidden = false;
  motionButton.addEventListener("click", () => {
    if (motion.matches) {
      announcement.textContent = "已遵循系统减少动态效果设置，星海保持静止。";
      return;
    }
    userPaused = !userPaused;
    pointer = { x: 0, y: 0 };
    syncMotionButton();
    lastTime = 0;
    requestDraw();
  });
  function changeMotion() {
    pointer = { x: 0, y: 0 };
    syncMotionButton();
    lastTime = 0;
    requestDraw();
  }
  if (motion.addEventListener) motion.addEventListener("change", changeMotion);
  else motion.addListener(changeMotion);

  if (typeof indexDialog.showModal === "function") {
    indexButton.hidden = false;
    indexButton.addEventListener("click", () => { indexDialog.showModal(); requestDraw(); });
    document.getElementById("index-close").addEventListener("click", () => indexDialog.close());
    indexDialog.addEventListener("click", event => { if (event.target === indexDialog) {
      const rect = indexDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) indexDialog.close();
    } });
    indexDialog.addEventListener("close", () => { lastTime = 0; requestDraw(); });
  }
  document.addEventListener("conceptportal:depart", event => {
    if (indexDialog.open) indexDialog.close();
    document.body.classList.add("is-travelling");
    let x = event.detail.x, y = event.detail.y;
    const selected = stars.find(star => star.href === event.detail.url);
    if (selected) {
      const rect = selected.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    journey = { start: performance.now(), duration: Math.max(1, event.detail.duration),
      x: (x ?? width / 2) - width / 2, y: (y ?? height / 2) - height / 2 };
    pointer = { ...parallax };
    requestDraw();
  });
  function reset() {
    journey = null;
    zoom = 1;
    shiftX = shiftY = 0;
    drag = null;
    focused = stars.includes(document.activeElement) ? document.activeElement : null;
    hovered = finePointer.matches ? stars.find(star => star.matches(":hover")) || null : null;
    pointer = parallax = { x: 0, y: 0 };
    document.body.classList.remove("is-travelling");
    space.classList.remove("is-dragging");
    lastTime = 0;
    requestDraw();
  }
  document.addEventListener("conceptportal:reset", reset);
  window.addEventListener("pageshow", event => { if (event.persisted) reset(); });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else requestDraw();
  });
  syncMotionButton();
  resize();
})();
