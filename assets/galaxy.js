(() => {
  "use strict";

  const space = document.getElementById("universe");
  if (!space) return;
  let canvas = document.getElementById("galaxy");
  const stars = [...document.querySelectorAll(".universe-stars .concept-star")];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)");
  const motionButton = document.getElementById("motion-toggle");
  const indexButton = document.getElementById("index-toggle");
  const indexDialog = document.getElementById("star-index");
  const resetButton = document.getElementById("view-reset");
  const announcement = document.getElementById("universe-announcement");
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const outerOrbit = Math.max(.3, ...stars.map(star => Number(star.dataset.radius) * 1.12));
  const labelWidths = new Map();
  let width = 1, height = 1, ratio = 1, focal = 1;
  let time = 0, orbitTime = 0, lastTime = 0, frame = 0, userPaused = false;
  let yaw = 0, targetYaw = 0, tilt = .48, targetTilt = .48, velocity = 0;
  let proximity = 1, targetProximity = 1, drag = null, hovered = null, focused = null;
  let focusGlow = 0, focusAnchor = null;
  let pointer = { x: 0, y: 0 }, parallax = { x: 0, y: 0 };
  let journey = null, travel = 0, zoom = 1, shift = { x: 0, y: 0 };
  let cameraDistance = 3.45, cameraRoll = -.32, renderedFrames = 0;
  let renderer = null, rendererName = "static", averageFrameMs = 16.7;
  let quality = innerWidth < 680 ? .48 : .54, slowFrames = 0;
  const view = new Float32Array(9);

  // 一份相机用于体积、星尘和真实 DOM 星体。矩阵为列主序，屏幕 y 向下。
  function updateCamera() {
    const angle = yaw + orbitTime * .008;
    const c = Math.cos(angle), s = Math.sin(angle), t = tilt, q = Math.sqrt(1 - t * t);
    const cr = Math.cos(cameraRoll), sr = Math.sin(cameraRoll);
    view.set([cr * c - sr * t * s, sr * c + cr * t * s, q * s,
      -sr * q, cr * q, -t,
      -cr * s - sr * t * c, -sr * s + cr * t * c, q * c]);
    cameraDistance = 3.45 - travel * .48;
    let candidate = (width < 680 ? width * 1.72 : Math.min(width * 1.24, height * 1.90)) * proximity;
    // 旋转任意角度后，所有合法概念轨道仍保留完整的48px点击区。
    let bx = .01, by = .01;
    for (let i = 0; i < 64; i += 1) {
      const a = i * TAU / 64, x = Math.cos(a) * outerOrbit, z = Math.sin(a) * outerOrbit;
      const depth = 3.45 - (view[2] * x + view[8] * z);
      bx = Math.max(bx, Math.abs(view[0] * x + view[6] * z) / depth);
      by = Math.max(by, Math.abs(view[1] * x + view[7] * z) / depth);
    }
    focal = Math.min(candidate, Math.max(24, width / 2 - 42) / bx, Math.max(24, height / 2 - 104) / by);
  }
  function project(x, y, z) {
    const depth = Math.max(.12, cameraDistance - view[2] * x - view[5] * y - view[8] * z);
    return { x: (view[0] * x + view[3] * y + view[6] * z) * focal / depth + parallax.x,
      y: (view[1] * x + view[4] * y + view[7] * z) * focal / depth + parallax.y, depth };
  }
  function starPosition(star) {
    const r = Number(star.dataset.radius) * 1.12, a = Number(star.dataset.angle);
    return project(Math.cos(a) * r, .065, Math.sin(a) * r);
  }

  let seed = 470319;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  function normal() { return Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(TAU * random()); }
  const tones = [[.64, .70, .86], [.89, .79, .71], [.73, .65, .84], [.90, .88, .91]];
  const particles = [];
  const addParticle = (x, y, z, size, alpha, color, kind) => particles.push(x, y, z, size, alpha, ...color, kind);
  // 星尘不是概念：所有有名称和点击行为的星只来自清单中的真实链接。
  for (let i = 0; i < 11000; i += 1) {
    const r = .06 + Math.pow(random(), .7) * 1.8;
    const a = i % 2 * Math.PI + Math.log(r + .18) * 2.15 + normal() * .23;
    addParticle(Math.cos(a) * r, normal() * (.025 + .045 * r), Math.sin(a) * r,
      .55 + Math.pow(random(), 6) * 2, .09 + random() * .37, tones[i % 4], 1);
  }
  for (let i = 0; i < 470; i += 1) {
    addParticle(random() * 2 - 1, random() * 2 - 1, random(),
      .65 + Math.pow(random(), 8) * 2.2, .13 + random() * .42, tones[i % 4], 0);
  }
  for (let i = 0; i < 80; i += 1) {
    addParticle((random() - .5) * 4, (random() - .5) * 1.5, (random() - .5) * 3,
      1.7 + random() * 5, .014 + random() * .045, tones[i % 4], 2);
  }
  const particleData = new Float32Array(particles);

  function createWebGL() {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false,
      stencil: false, powerPreference: "high-performance" });
    if (!gl || gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision === 0) throw new Error("WebGL high precision unavailable");
    const allocated = { programs: [], buffers: [], textures: [], framebuffers: [] };
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message || "Shader compilation failed");
      }
      return shader;
    }
    function program(vertex, fragment) {
      const p = gl.createProgram(); let v, f, linked = false;
      try {
        v = compile(gl.VERTEX_SHADER, vertex); f = compile(gl.FRAGMENT_SHADER, fragment);
        gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "Shader link failed");
        linked = true; allocated.programs.push(p);
        const uniforms = {};
        const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i += 1) {
          const info = gl.getActiveUniform(p, i);
          uniforms[info.name] = gl.getUniformLocation(p, info.name);
        }
        return { p, uniforms };
      } finally {
        if (v) gl.deleteShader(v); if (f) gl.deleteShader(f);
        if (!linked) gl.deleteProgram(p);
      }
    }
    const quadSource = `attribute vec2 a_vertex; varying vec2 v_uv;
      void main(){v_uv=a_vertex*.5+.5;gl_Position=vec4(a_vertex,0.,1.);}`;
    const volumeSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_noise;
      uniform vec2 u_resolution;
      uniform vec2 u_shift;
      uniform vec2 u_pointer;
      uniform mat3 u_view;
      uniform float u_focal;
      uniform float u_distance;
      uniform float u_zoom;
      uniform float u_time;
      uniform float u_steps;
      const mat3 octave=mat3(0.,.8,.6,-.8,.36,-.48,-.6,-.48,.64);
      float noise3(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        vec2 uv=i.xy+vec2(37.,17.)*i.z+f.xy;
        vec2 rg=texture2D(u_noise,(uv+.5)/256.).rg;
        return mix(rg.r,rg.g,f.z);
      }
      float fbm(vec3 p){
        float n=.57*noise3(p);p=octave*p*2.03+7.1;
        n+=.28*noise3(p);p=octave*p*2.06+11.7;
        return n+.15*noise3(p);
      }
      vec3 inverseView(vec3 p){return vec3(dot(u_view[0],p),dot(u_view[1],p),dot(u_view[2],p));}
      vec2 sphere(vec3 ro,vec3 rd,float radius){
        float b=dot(ro,rd),c=dot(ro,ro)-radius*radius,h=b*b-c;
        if(h<0.)return vec2(-1.);h=sqrt(h);return vec2(-b-h,-b+h);
      }
      void main(){
        vec2 pixel=(vec2(v_uv.x,1.-v_uv.y)-.5)*u_resolution;
        pixel=(pixel/u_zoom+u_shift-u_pointer)/u_focal;
        vec3 ro=inverseView(vec3(0.,0.,u_distance));
        vec3 rd=normalize(inverseView(vec3(pixel,-1.)));
        vec2 hit=sphere(ro,rd,2.4);
        vec3 light=vec3(0.);float transmittance=1.;
        if(hit.y>0.){
          float nearT=max(0.,hit.x),farT=hit.y;
          // 体积被限制在有厚度的星盘内；避免为空旷深空支付完整积分成本。
          if(abs(rd.y)>.001){
            float a=(-.64-ro.y)/rd.y,b=(.64-ro.y)/rd.y;
            nearT=max(nearT,min(a,b));farT=min(farT,max(a,b));
          }
          float stepSize=max(0.,farT-nearT)/u_steps;
          float jitter=texture2D(u_noise,gl_FragCoord.xy/256.).b;
          float t=nearT+stepSize*(.12+.76*jitter);
          for(int i=0;i<52;i++){
            if(float(i)>=u_steps||t>farT||transmittance<.025)break;
            vec3 p=ro+rd*t;
            float r=length(p.xz);
            float rotation=u_time*.012/(.55+r);
            float cs=cos(rotation),sn=sin(rotation);
            vec3 q=vec3(p.x*cs-p.z*sn,p.y,p.x*sn+p.z*cs);
            vec3 drift=vec3(u_time*.026,-u_time*.014,u_time*.018);
            float warp=noise3(q*1.9+drift*.42)-.5;
            float a=atan(q.z,q.x);
            float phase=a*2.-log(r+.18)*4.3+warp*1.45;
            float arm=pow(.5+.5*cos(phase),3.0);
            float height=.105+.17*exp(-r*2.1);
            float bend=.038*sin(q.x*2.8+u_time*.11)+.05*warp;
            float envelope=exp(-pow((p.y-bend)/height,2.))
              *exp(-r*r*.38)*(1.-smoothstep(1.5,2.25,r));
            vec3 turbulence=q*9.2+drift+vec3(warp*.9,warp*1.3,-warp*.8);
            float n=fbm(turbulence);
            float micro=noise3(turbulence*4.1+drift*.4);
            float filaments=pow(smoothstep(.29,.73,n),1.45)*(.34+.88*micro);
            float cloud=envelope*(.045+arm*1.75)*filaments*4.3;
            float core=exp(-r*r*35.-p.y*p.y*65.)*.42;
            float dustBand=pow(.5+.5*cos(phase+.53+micro*.35),6.);
            float dust=envelope*(dustBand*.85+.20)*smoothstep(.08,.6,r)
              *smoothstep(.36,.66,fbm(turbulence*.72+19.))*6.2;
            float veil=exp(-r*r*.85-p.y*p.y*5.)*smoothstep(.38,.74,n)*.05;
            float density=cloud+core+dust+veil;
            float alpha=1.-exp(-density*stepSize*1.65);
            vec3 cool=mix(vec3(.21,.31,.49),vec3(.48,.31,.45),noise3(q*1.6+8.));
            vec3 warm=vec3(.98,.80,.66);
            float warmAmount=exp(-r*r*3.7);
            vec3 color=mix(cool,warm,warmAmount);
            float edge=clamp((n-noise3(turbulence+vec3(.4,.65,.2)))*3.+.68,.22,1.45);
            float illumination=.64+1.18*exp(-r*r*1.7);
            vec3 source=color*(cloud*edge*illumination+veil*.4)
              +vec3(1.14,.99,.87)*core*1.25+vec3(.007,.009,.019)*dust;
            source/=max(.001,density);
            light+=transmittance*alpha*source;
            transmittance*=1.-alpha;
            t+=stepSize;
          }
        }
        // RGBA8 内保留高光层次；alpha保存透射率供远层星尘合成。
        gl_FragColor=vec4(1.-exp(-light*1.32),transmittance);
      }
    `;
    const compositeSource = `
      precision highp float; varying vec2 v_uv;
      uniform sampler2D u_cloud; uniform sampler2D u_noise;
      uniform vec2 u_texel; uniform vec2 u_resolution;
      uniform vec2 u_focus; uniform float u_focusStrength; uniform float u_travel;
      void main(){
        vec3 c=texture2D(u_cloud,v_uv).rgb;
        vec3 glow=vec3(0.);
        glow+=max(vec3(0.),texture2D(u_cloud,v_uv+u_texel*vec2(4.,0.)).rgb-.28);
        glow+=max(vec3(0.),texture2D(u_cloud,v_uv+u_texel*vec2(-4.,0.)).rgb-.28);
        glow+=max(vec3(0.),texture2D(u_cloud,v_uv+u_texel*vec2(0.,4.)).rgb-.28);
        glow+=max(vec3(0.),texture2D(u_cloud,v_uv+u_texel*vec2(0.,-4.)).rgb-.28);
        glow+=max(vec3(0.),texture2D(u_cloud,v_uv+u_texel*vec2(9.,6.)).rgb-.28);
        glow+=max(vec3(0.),texture2D(u_cloud,v_uv+u_texel*vec2(-9.,-6.)).rgb-.28);
        vec2 uv=vec2(v_uv.x,1.-v_uv.y);
        float radius=length((uv-.5)*vec2(1.,.82));
        float vignette=1.-smoothstep(.24,.76,radius)*.43;
        vec3 base=vec3(.0196,.0235,.051);
        c=(c+glow*.045)*vignette+base;
        float focus=exp(-pow(length((uv-u_focus)*u_resolution)/82.,2.));
        c+=vec3(.095,.074,.12)*focus*u_focusStrength;
        c+=vec3(.025,.019,.036)*u_travel*smoothstep(.1,.8,c.r);
        float grain=texture2D(u_noise,gl_FragCoord.xy/256.).b-.5;
        c+=grain/320.;
        gl_FragColor=vec4(c,1.);
      }
    `;
    const pointVertex = `
      precision highp float;
      attribute vec3 a_position;attribute float a_size;attribute float a_alpha;
      attribute vec3 a_color;attribute float a_kind;
      uniform mat3 u_view; uniform vec2 u_resolution;uniform vec2 u_pointer;uniform vec2 u_shift;
      uniform float u_focal;uniform float u_distance;uniform float u_zoom;uniform float u_ratio;uniform float u_time;
      varying vec3 v_color;varying float v_alpha;varying vec2 v_uv;varying float v_behind;
      void main(){
        vec2 screen;float size=a_size;float alpha=a_alpha;
        if(a_kind<.5){
          screen=a_position.xy*u_resolution*.5+u_pointer*(.2+a_position.z*.4);
          screen*=1.+(u_zoom-1.)*.05;v_behind=1.;
        }else{
          vec3 pos=a_position;
          if(a_kind>1.5){pos.y+=sin(u_time*.12+pos.x*3.)*.035;pos.x+=sin(u_time*.08+pos.z)*.04;}
          vec3 v=u_view*pos;float depth=max(.1,u_distance-v.z);
          screen=(v.xy*u_focal/depth+u_pointer-u_shift)*u_zoom;
          size*=clamp(3.45/depth,.5,2.7)*sqrt(u_zoom);
          v_behind=1.-smoothstep(-1.,.1,v.z);
          alpha*=.86+.14*sin(u_time*.5+a_position.x*80.);
        }
        v_uv=vec2(screen.x/u_resolution.x+.5,.5-screen.y/u_resolution.y);
        gl_Position=vec4(screen.x/(u_resolution.x*.5),-screen.y/(u_resolution.y*.5),0.,1.);
        gl_PointSize=max(.8,size*u_ratio);v_alpha=alpha;v_color=a_color;
      }
    `;
    const pointFragment = `
      precision mediump float;uniform sampler2D u_cloud;
      varying vec3 v_color;varying float v_alpha;varying vec2 v_uv;varying float v_behind;
      void main(){vec2 p=gl_PointCoord*2.-1.;float d=dot(p,p);if(d>1.)discard;
        float fog=texture2D(u_cloud,v_uv).a;
        float visibility=mix(1.,max(.14,fog),v_behind);
        float glow=exp(-d*4.)*(1.-smoothstep(.6,1.,d));
        gl_FragColor=vec4(v_color,v_alpha*glow*visibility);}
    `;
    let volume, composite, points;
    try { volume = program(quadSource, volumeSource); composite = program(quadSource, compositeSource); points = program(pointVertex, pointFragment); }
    catch (error) { for (const p of allocated.programs) gl.deleteProgram(p); throw error; }
    const quad = gl.createBuffer(); allocated.buffers.push(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const pointBuffer = gl.createBuffer(); allocated.buffers.push(pointBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer); gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW);
    const noise = gl.createTexture(); allocated.textures.push(noise);
    const values = new Uint8Array(256 * 256), texture = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < values.length; i += 1) values[i] = Math.floor(random() * 256);
    for (let y = 0; y < 256; y += 1) for (let x = 0; x < 256; x += 1) {
      const i = (y * 256 + x) * 4;
      texture[i] = values[y * 256 + x]; texture[i + 1] = values[((y + 17) % 256) * 256 + (x + 37) % 256];
      texture[i + 2] = Math.floor(random() * 256); texture[i + 3] = 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, noise);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const cloud = gl.createTexture(), framebuffer = gl.createFramebuffer();
    allocated.textures.push(cloud); allocated.framebuffers.push(framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, cloud);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    let cloudWidth = 0, cloudHeight = 0, destroyed = false;
    function resizeBuffer() {
      const w = Math.max(1, Math.min(900, Math.round(width * quality)));
      const h = Math.max(1, Math.round(height * (w / width)));
      if (w === cloudWidth && h === cloudHeight) return;
      cloudWidth = w; cloudHeight = h;
      gl.bindTexture(gl.TEXTURE_2D, cloud);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cloud, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("Cloud framebuffer unavailable");
    }
    function bindQuad(p) {
      gl.useProgram(p.p); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const a = gl.getAttribLocation(p.p, "a_vertex");
      gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    }
    function common(p) {
      const u = p.uniforms;
      if (u.u_resolution) gl.uniform2f(u.u_resolution, width, height);
      if (u.u_pointer) gl.uniform2f(u.u_pointer, parallax.x, parallax.y);
      if (u.u_shift) gl.uniform2f(u.u_shift, shift.x, shift.y);
      if (u.u_view) gl.uniformMatrix3fv(u.u_view, false, view);
      if (u.u_focal) gl.uniform1f(u.u_focal, focal);
      if (u.u_distance) gl.uniform1f(u.u_distance, cameraDistance);
      if (u.u_zoom) gl.uniform1f(u.u_zoom, zoom);
      if (u.u_time) gl.uniform1f(u.u_time, time);
      if (u.u_ratio) gl.uniform1f(u.u_ratio, ratio);
    }
    function dispose() {
      if (destroyed) return; destroyed = true;
      for (const p of allocated.programs) gl.deleteProgram(p);
      for (const b of allocated.buffers) gl.deleteBuffer(b);
      for (const t of allocated.textures) gl.deleteTexture(t);
      for (const f of allocated.framebuffers) gl.deleteFramebuffer(f);
    }
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault(); dispose(); useCanvasFallback(); requestDraw();
    }, { once: true });
    rendererName = "webgl-volume";
    document.documentElement.dataset.galaxyRenderer = "webgl";
    document.documentElement.dataset.nebula = "volume";
    return {
      dispose,
      diagnostics: () => ({ cloudWidth, cloudHeight, steps: width < 680 ? 34 : 46, passes: 3 }),
      draw() {
        resizeBuffer();
        gl.disable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(0, 0, cloudWidth, cloudHeight);
        bindQuad(volume); common(volume);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, noise);
        gl.uniform1i(volume.uniforms.u_noise, 0);
        gl.uniform1f(volume.uniforms.u_steps, width < 680 ? 34 : 46);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
        bindQuad(composite); common(composite);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cloud);
        gl.uniform1i(composite.uniforms.u_cloud, 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, noise);
        gl.uniform1i(composite.uniforms.u_noise, 1);
        gl.uniform2f(composite.uniforms.u_texel, 1 / cloudWidth, 1 / cloudHeight);
        const pos = focusAnchor ? starPosition(focusAnchor) : { x: 0, y: 0 };
        gl.uniform2f(composite.uniforms.u_focus, .5 + (pos.x - shift.x) * zoom / width, .5 + (pos.y - shift.y) * zoom / height);
        gl.uniform1f(composite.uniforms.u_focusStrength, focusGlow);
        gl.uniform1f(composite.uniforms.u_travel, travel);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.useProgram(points.p); common(points);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cloud);
        gl.uniform1i(points.uniforms.u_cloud, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
        for (const [name, size, offset] of [["a_position", 3, 0], ["a_size", 1, 3], ["a_alpha", 1, 4], ["a_color", 3, 5], ["a_kind", 1, 8]]) {
          const a = gl.getAttribLocation(points.p, name);
          gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, size, gl.FLOAT, false, 36, offset * 4);
        }
        gl.drawArrays(gl.POINTS, 0, particleData.length / 9);
        // 后续全屏pass仅有一个attribute，关闭本pass所有数组避免小quad越界。
        const max = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        for (let i = 0; i < max; i += 1) gl.disableVertexAttribArray(i);
      }
    };
  }

  // 无 WebGL 时预绘制分层云纹，再以不同景深缓慢叠合。真实入口不依赖画布。
  function create2D() {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas unavailable");
    const texture = document.createElement("canvas"); texture.width = texture.height = 448;
    const painter = texture.getContext("2d");
    const image = painter.createImageData(448, 448);
    const grid = new Float32Array(256 * 256);
    for (let i = 0; i < grid.length; i += 1) grid[i] = random();
    function noise(x, y) {
      const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const at = (x, y) => grid[((y & 255) * 256) + (x & 255)];
      return (at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx) * (1 - fy)
        + (at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx) * fy;
    }
    for (let y = 0; y < 448; y += 1) for (let x = 0; x < 448; x += 1) {
      const px = (x / 448 - .5) * 4.5, py = (y / 448 - .5) * 4.5;
      const r = Math.hypot(px, py), a = Math.atan2(py, px);
      const n = noise(px * 4 + 80, py * 4 + 80) * .58 + noise(px * 9 + 50, py * 9 + 50) * .27 + noise(px * 19, py * 19) * .15;
      const phase = a * 2 - Math.log(r + .18) * 4.3 + (n - .5) * 1.4;
      const arm = Math.pow(.5 + .5 * Math.cos(phase), 3);
      const dust = Math.pow(.5 + .5 * Math.cos(phase + .78), 7) * smooth(.2, .9, r);
      const core = Math.exp(-r * r * 17);
      const density = Math.exp(-r * r * .42) * (1 - smooth(1.5, 2.2, r)) * (.1 + arm * 1.8) * n;
      const light = (density * (1 - dust * .78) + core * 1.3) * 1.1;
      const warm = Math.exp(-r * r * 2.2);
      const i = (y * 448 + x) * 4;
      image.data[i] = Math.min(255, (58 + warm * 160) * light);
      image.data[i + 1] = Math.min(255, (62 + warm * 122) * light);
      image.data[i + 2] = Math.min(255, (99 + warm * 75) * light);
      image.data[i + 3] = 255;
    }
    painter.putImageData(image, 0, 0);
    rendererName = "canvas2d-layered";
    document.documentElement.dataset.galaxyRenderer = "canvas2d";
    document.documentElement.dataset.nebula = "layered";
    return { diagnostics: () => ({ passes: 2, textureSize: 448 }), draw() {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = "#05060d"; ctx.fillRect(0, 0, width, height);
      const origin = project(0, 0, 0), size = focal / cameraDistance * 4.5 * zoom;
      ctx.save(); ctx.translate(width / 2 + (origin.x - shift.x) * zoom, height / 2 + (origin.y - shift.y) * zoom);
      ctx.rotate(cameraRoll); ctx.scale(1, tilt + .12);
      ctx.globalCompositeOperation = "screen";
      ctx.rotate(yaw + orbitTime * .008 + time * .009);
      ctx.globalAlpha = .92; ctx.drawImage(texture, -size / 2, -size / 2, size, size);
      ctx.rotate(-time * .003 - .12); ctx.globalAlpha = .16;
      ctx.drawImage(texture, -size * .54, -size * .54, size * 1.08, size * 1.08);
      ctx.restore(); ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particleData.length; i += 27) {
        const kind = particleData[i + 8];
        const p = kind === 0 ? { x: particleData[i] * width / 2, y: particleData[i + 1] * height / 2 } : project(particleData[i], particleData[i + 1], particleData[i + 2]);
        const x = width / 2 + (p.x - (kind ? shift.x : 0)) * (kind ? zoom : 1);
        const y = height / 2 + (p.y - (kind ? shift.y : 0)) * (kind ? zoom : 1);
        ctx.globalAlpha = particleData[i + 4] * .65; ctx.fillStyle = "#b9b4cb";
        ctx.fillRect(x, y, particleData[i + 3] * .65, particleData[i + 3] * .65);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    } };
  }
  function useCanvasFallback() {
    const replacement = canvas.cloneNode(false); canvas.replaceWith(replacement); canvas = replacement;
    canvas.width = Math.max(1, Math.round(width * ratio)); canvas.height = Math.max(1, Math.round(height * ratio));
    try { renderer = create2D(); }
    catch (_) { renderer = null; rendererName = "static"; document.documentElement.dataset.galaxyRenderer = "static"; }
  }
  try { renderer = createWebGL(); }
  catch (error) { console.info("Starfield uses the local canvas fallback:", error.message); useCanvasFallback(); }

  function moving() { return !motion.matches && !userPaused && !indexDialog.open; }
  function requestDraw() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
  function placeStars() {
    const occupied = [];
    for (const star of stars) {
      const p = starPosition(star);
      const x = width / 2 + (p.x - shift.x) * zoom, y = height / 2 + (p.y - shift.y) * zoom;
      star.style.left = `${x.toFixed(2)}px`; star.style.top = `${y.toFixed(2)}px`;
      const labelWidth = labelWidths.get(star) || 150;
      const rightFits = x + 23 + labelWidth <= width - 12;
      const left = !rightFits && x > width / 2;
      const rawLeft = left ? x - 23 - labelWidth : x + 23;
      const labelShift = clamp(rawLeft, 12, Math.max(12, width - labelWidth - 12)) - rawLeft;
      star.style.setProperty("--label-shift", `${labelShift.toFixed(2)}px`);
      star.classList.toggle("is-label-left", left); star.classList.toggle("is-label-above", y > height - 175);
      const lx = rawLeft + labelShift;
      const crowded = occupied.some(p => Math.abs(p.x - lx) < 155 && Math.abs(p.y - y) < 70);
      star.classList.toggle("is-label-quiet", crowded && star !== hovered && star !== focused);
      occupied.push({ x: lx, y });
    }
  }
  function tick(now) {
    frame = 0;
    const rawDelta = lastTime ? (now - lastTime) / 1000 : 0;
    const delta = Math.min(.075, rawDelta); lastTime = now;
    if (rawDelta > 0 && moving()) averageFrameMs = averageFrameMs * .96 + Math.min(150, rawDelta * 1000) * .04;
    if (moving()) {
      time += delta;
      if (!hovered && !focused && !drag && !journey) orbitTime += delta;
    }
    if (!drag && !hovered && !focused && moving() && !journey) {
      targetYaw += velocity * delta; velocity *= Math.exp(-delta * 5.5);
    } else if (hovered || focused || !moving()) velocity = 0;
    const blend = motion.matches || userPaused ? 1 : 1 - Math.exp(-delta * 5.8);
    const activeStar = hovered || focused;
    if (activeStar) focusAnchor = activeStar;
    focusGlow += ((activeStar ? 1 : 0) - focusGlow) * blend;
    yaw += (targetYaw - yaw) * blend; tilt += (targetTilt - tilt) * blend;
    proximity += (targetProximity - proximity) * blend;
    parallax.x += (pointer.x - parallax.x) * blend; parallax.y += (pointer.y - parallax.y) * blend;
    let progress = 0;
    if (journey) {
      progress = clamp((now - journey.start) / journey.duration, 0, 1);
      travel = smooth(.16, 1, progress);
      zoom = 1 + Math.pow(smooth(.20, 1, progress), 2) * 4.2;
    }
    updateCamera();
    if (journey) {
      const target = journey.star ? starPosition(journey.star) : journey.point;
      const arrival = smooth(.07, .83, progress);
      shift.x = target.x - journey.point.x * (1 - arrival) / zoom;
      shift.y = target.y - journey.point.y * (1 - arrival) / zoom;
    }
    if (renderer) {
      try { renderer.draw(); }
      catch (_) { renderer.dispose?.(); useCanvasFallback(); renderer?.draw(); }
    }
    placeStars(); renderedFrames += 1;
    if (resetButton) resetButton.hidden = Math.abs(targetYaw) < .06 && Math.abs(targetTilt - .48) < .025 && Math.abs(targetProximity - 1) < .03;
    const settling = Math.abs(targetYaw - yaw) + Math.abs(targetTilt - tilt) + Math.abs(targetProximity - proximity)
      + Math.abs((activeStar ? 1 : 0) - focusGlow)
      + (Math.abs(pointer.x - parallax.x) + Math.abs(pointer.y - parallax.y)) * .01 > .0002;
    // 自适应只降体积采样分辨率，不降文字、星核或点击精度。低帧时不反复升降档。
    if (moving() && rendererName === "webgl-volume" && renderedFrames > 100 && averageFrameMs > 36) slowFrames += 1;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 90 && quality > .32) { quality = Math.max(.32, quality - .08); slowFrames = 0; }
    if (moving() || journey || settling) requestDraw();
  }
  function resize() {
    width = Math.max(1, space.clientWidth); height = Math.max(1, space.clientHeight);
    ratio = Math.min(devicePixelRatio || 1, 1.8, Math.sqrt(3300000 / (width * height)));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    cameraRoll = width < 680 ? -.57 : -.30;
    for (const star of stars) labelWidths.set(star, star.querySelector(".concept-star-label").offsetWidth);
    requestDraw();
  }
  function syncNear() { document.body.classList.toggle("is-near-star", Boolean(hovered || focused)); }
  for (const star of stars) {
    star.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse") return;
      hovered = star; velocity = 0; pointer = { ...parallax }; targetYaw = yaw; targetTilt = tilt; targetProximity = proximity; syncNear(); requestDraw();
    });
    star.addEventListener("pointerleave", () => { hovered = null; syncNear(); requestDraw(); });
    star.addEventListener("focus", () => { focused = star; velocity = 0; targetYaw = yaw; targetTilt = tilt; targetProximity = proximity; pointer = { ...parallax }; syncNear(); requestDraw(); });
    star.addEventListener("blur", () => { focused = null; syncNear(); requestDraw(); });
  }
  space.addEventListener("pointerdown", event => {
    if (event.target.closest("a,button") || event.button !== 0 || journey) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, last: performance.now() };
    velocity = 0; space.setPointerCapture(event.pointerId); space.classList.add("is-dragging");
  });
  space.addEventListener("pointermove", event => {
    if (journey) return;
    if (drag && drag.id === event.pointerId) {
      const now = performance.now(), dx = event.clientX - drag.x;
      targetYaw += dx * .0035; targetTilt = clamp(targetTilt + (event.clientY - drag.y) * .0013, .30, .73);
      velocity = clamp(dx * .0035 / Math.max(.016, (now - drag.last) / 1000), -1.6, 1.6);
      drag.x = event.clientX; drag.y = event.clientY; drag.last = now; requestDraw();
    } else if (finePointer.matches && moving() && !hovered && !focused) {
      pointer.x = (event.clientX / width - .5) * 18; pointer.y = (event.clientY / height - .5) * 12; requestDraw();
    }
  });
  function stopDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null; space.classList.remove("is-dragging"); requestDraw();
  }
  space.addEventListener("pointerup", stopDrag); space.addEventListener("pointercancel", stopDrag);
  space.addEventListener("lostpointercapture", stopDrag);
  space.addEventListener("pointerleave", () => { if (!hovered && !focused) pointer = { x: 0, y: 0 }; requestDraw(); });
  space.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey || journey || indexDialog.open) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
    targetProximity = clamp(targetProximity + event.deltaY * unit * .00038, .82, 1.23); requestDraw();
  }, { passive: false });
  resetButton?.addEventListener("click", () => {
    targetYaw = 0; targetTilt = .48; targetProximity = 1; velocity = 0; pointer = { x: 0, y: 0 }; requestDraw();
  });
  function syncMotionButton() {
    const paused = userPaused || motion.matches;
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute("aria-label", motion.matches ? "已遵循系统减少动态效果设置" : paused ? "恢复星云流动" : "暂停星云流动");
    motionButton.title = motion.matches ? "跟随系统静止" : paused ? "恢复星云流动" : "暂停星云流动";
  }
  motionButton.hidden = false;
  motionButton.addEventListener("click", () => {
    if (motion.matches) { announcement.textContent = "已遵循系统减少动态效果设置，星云保持静止。"; return; }
    userPaused = !userPaused; pointer = { ...parallax }; targetYaw = yaw; targetTilt = tilt; targetProximity = proximity;
    velocity = 0; syncMotionButton(); lastTime = 0; requestDraw();
  });
  function changeMotion() {
    if (motion.matches) journey = null;
    velocity = 0; pointer = { ...parallax }; targetYaw = yaw; targetTilt = tilt; targetProximity = proximity;
    syncMotionButton(); lastTime = 0; requestDraw();
  }
  if (motion.addEventListener) motion.addEventListener("change", changeMotion); else motion.addListener(changeMotion);
  if (typeof indexDialog.showModal === "function") {
    indexButton.hidden = false;
    indexButton.addEventListener("click", () => { indexDialog.showModal(); requestDraw(); });
    document.getElementById("index-close").addEventListener("click", () => indexDialog.close());
    indexDialog.addEventListener("click", event => {
      if (event.target !== indexDialog) return;
      const r = indexDialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) indexDialog.close();
    });
    indexDialog.addEventListener("close", () => { lastTime = 0; requestDraw(); });
  }
  document.addEventListener("conceptportal:depart", event => {
    if (indexDialog.open) indexDialog.close();
    document.body.classList.add("is-travelling");
    const selected = stars.find(star => star.href === event.detail.url);
    const p = selected ? starPosition(selected) : { x: (event.detail.x ?? width / 2) - width / 2, y: (event.detail.y ?? height / 2) - height / 2 };
    journey = { start: performance.now(), duration: Math.max(1, event.detail.duration), point: p, star: selected };
    velocity = 0; targetYaw = yaw; targetTilt = tilt; pointer = { ...parallax }; requestDraw();
  });
  function reset() {
    journey = null; zoom = 1; travel = 0; shift = { x: 0, y: 0 }; drag = null; velocity = 0;
    focused = stars.includes(document.activeElement) ? document.activeElement : null;
    hovered = finePointer.matches ? stars.find(star => star.matches(":hover")) || null : null;
    pointer = { x: 0, y: 0 }; parallax = { x: 0, y: 0 };
    document.body.classList.remove("is-travelling"); space.classList.remove("is-dragging");
    syncNear(); lastTime = 0; requestDraw();
  }
  document.addEventListener("conceptportal:reset", reset);
  window.addEventListener("pageshow", event => { if (event.persisted) reset(); });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else requestDraw();
  });
  window.ConceptUniverse = Object.freeze({ inspect: () => ({ renderer: rendererName, quality,
    averageFrameMs: +averageFrameMs.toFixed(2), renderedFrames, paused: !moving(), width, height,
    time: +time.toFixed(3), orbitTime: +orbitTime.toFixed(3), proximity: +proximity.toFixed(3),
    ...renderer?.diagnostics?.() }) });
  if (!motion.matches) {
    document.body.classList.add("is-arriving");
    setTimeout(() => document.body.classList.remove("is-arriving"), 2100);
  }
  syncMotionButton(); resize();
})();
