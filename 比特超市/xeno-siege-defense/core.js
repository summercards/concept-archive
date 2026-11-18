/* XENO SIEGE / BASTION 07 · 同方法新主题。保留原版渲染、材质、物理和双相机契约，替换世界与任务。 */
const NC = {version:"1.0.0", title:"XENO SIEGE / BASTION 07", seed:7407};
NC.source={sha256:"9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966", mode:"same-method-new-theme"};
NC.original={render:Hg, ground:O1, sky:Hy, audio:c_};

// 外星天空：冷靛星云、赭红恒星和高层云带。仍由原版天空入口、PMREM和后处理接入。
Mn.dir.set(-.42,.68,-.46).normalize();
Mn.color.setRGB(1.0,.36,.18);
Mn.intensity=8.2;
en.zenith.setRGB(.008,.012,.045);
en.horizon.setRGB(.22,.055,.09);
en.horizonAway.setRGB(.025,.04,.11);
en.fog.setRGB(.09,.045,.095);
Hy=function(noise){
  const T=lt, uniforms=W6(noise);
  const material=new T.ShaderMaterial({name:"xeno-nebula-sky",side:T.BackSide,depthWrite:false,depthTest:true,toneMapped:false,uniforms,vertexShader:V6,fragmentShader:`
    precision highp float;
    varying vec3 vDir;
    uniform float uTime,uEnv,uFlash;
    uniform vec3 uFlashDir;
    ${Ug}
    float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
      vec3 d=normalize(vDir); float h=max(d.y,0.);
      vec2 q=d.xz/(h+.12)*.62+vec2(.004,-.003)*uTime;
      float cloud=fbm5(q+fbm3(q*.5)*.55);
      vec3 zen=vec3(.008,.014,.052), hor=vec3(.19,.035,.075);
      vec3 col=mix(hor,zen,smoothstep(.02,.82,h));
      col*=.55+.72*cloud;
      col+=vec3(.08,.015,.12)*pow(max(0.,1.-abs(d.x-.25)),5.)*exp(-h*4.);
      col+=vec3(.02,.09,.18)*exp(-h*5.)*max(d.z,0.);
      vec3 starDir=normalize(vec3(-.48,.40,-.75));
      float star=max(dot(d,starDir),0.);
      col+=vec3(1.0,.16,.045)*pow(star,55.)*.9;
      col+=vec3(1.0,.48,.18)*smoothstep(.99955,.9999,star)*(1.-uEnv);
      float stars=step(.9975,hash21(floor(d.xz*680.)))*smoothstep(.05,.45,h);
      col+=vec3(.45,.58,1.)*stars*.55;
      col+=vec3(.24,.08,.12)*uFlash*pow(max(dot(d,uFlashDir),0.),4.);
      if(d.y<0.)col=mix(col,vec3(.018,.009,.028),clamp(-d.y*3.,0.,1.));
      gl_FragColor=vec4(col,1.);
    }`});
  const geometry=new T.BoxGeometry(2,2,2),mesh=new T.Mesh(geometry,material);
  mesh.name="xeno-sky";mesh.frustumCulled=false;mesh.renderOrder=-1000;mesh.matrixAutoUpdate=false;
  return {mesh,material,geometry};
};
Hg=async function(G){
  const R=await NC.original.render(G);
  R.tune.flare=.08;R.tune.streak=.08;R.tune.bloom=.10;R.tune.ca=.0011;R.tune.vignette=.28;R.tune.grain=.018;
  R.tune.volSunScale=.18;R.tune.volAmbient=.25;R.tune.volInteriorDust=2.8;
  R.autoExposure=false;R.exposure=1.08;R.scene.environmentIntensity=1.05;
  return R;
};

// 地面沿用原版湿润/深度/反射入口，隐藏港区海水并在其上叠加外星地表。
O1=async function(G){
  const T=G.THREE,ground=await NC.original.ground(G);
  if(ground.sea)ground.sea.visible=false;
  const skirt=ground.root.getObjectByName("quaySkirt");if(skirt)skirt.visible=false;
  if(ground.rain&&ground.rain.material&&ground.rain.material.uniforms.uDrip)ground.rain.material.uniforms.uDrip.value=0;
  if(typeof ground.setRain==="function")ground.setRain(.12);
  const terrain=new T.Group();terrain.name="alien-terrain-overlay";terrain.userData.noMerge=true;ground.root.add(terrain);
  const terrainMat=new T.ShaderMaterial({name:"alien-ground-material",uniforms:{uTime:{value:0}},vertexShader:`varying vec2 vUv;varying vec3 vPos;void main(){vUv=uv;vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;varying vec3 vPos;uniform float uTime;float hash(vec2 p){return fract(sin(dot(p,vec2(17.2,91.7)))*4317.3);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec2 p=vPos.xz*.075;float m=n(p*1.8)+.45*n(p*4.7)+.18*n(p*13.);vec3 col=mix(vec3(.055,.028,.068),vec3(.17,.055,.07),smoothstep(.35,.85,m));float vein=1.-smoothstep(.0,.07,abs(sin(vPos.x*.72+sin(vPos.z*.22)*2.5)));col+=vec3(.22,.025,.03)*vein*.42;float dust=smoothstep(.5,.9,n(p*9.));col+=vec3(.08,.025,.02)*dust*.32;gl_FragColor=vec4(col,1.);}` ,side:T.DoubleSide,roughness:.92,metalness:.08});
  const plane=new T.Mesh(new T.PlaneGeometry(82,70,1,1),terrainMat);plane.name="alien-crater-bed";plane.rotation.x=-Math.PI/2;plane.position.set(0,.012,-3);plane.receiveShadow=true;terrain.add(plane);
  for(let i=0;i<18;i++){
    const x=-25+(i*37%50),z=-30+(i*19%58),r=.35+(i%5)*.18;
    const crater=new T.Mesh(new T.TorusGeometry(r,r*.11,5,18),new T.MeshStandardMaterial({color:0x301a32,roughness:.98,metalness:0}));
    crater.name="alien-crater-"+i;crater.rotation.x=-Math.PI/2;crater.position.set(x,.035,z);terrain.add(crater);
  }
  // 包装更新，保留原版湿润/雨循环，再推进外星地表的时间参数。
  const originalUpdate=ground.update;
  ground.update=function(dt){originalUpdate(dt);terrainMat.uniforms.uTime.value+=dt;};
  return ground;
};

NC.createKit=function(G,root,stat,dynamic){
  const T=G.THREE,placed=[],updaters=[],interactions=[],lights=[];
  const rngState={v:NC.seed};const rng=()=>{rngState.v=(Math.imul(rngState.v,1664525)+1013904223)>>>0;return rngState.v/4294967296;};
  const mat={
    rock:new T.MeshStandardMaterial({name:"xeno-rock",color:0x241530,roughness:.96,metalness:.03}),
    rock2:new T.MeshStandardMaterial({name:"xeno-rock-hot",color:0x552534,roughness:.88,metalness:.04}),
    base:G.mats.get("concrete",{color:0x313846}),
    armor:G.mats.get("paint_grey",{color:0x56616e}),
    dark:G.mats.get("steel_dark"),steel:G.mats.get("steel_worn"),gun:G.mats.get("gunmetal"),
    white:G.mats.get("paint_white"),red:G.mats.get("paint_red"),blue:G.mats.get("paint_blue"),
    glass:G.mats.get("glass"),cyan:G.mats.emissive(0x4ee8ff,4.4),amber:G.mats.emissive(0xff7d3c,4.1),
    lime:G.mats.emissive(0xa7ff63,3.5),warning:G.mats.emissive(0xff302d,3.8),
    voidGlow:G.mats.emissive(0x7d31ff,2.8)
  };
  function box(parent,w,h,d,x,y,z,m,bevel=.02){const mesh=Qi(bevel>0?Wi(w,h,d,Math.min(bevel,w*.16,h*.16,d*.16)):$e(w,h,d),m,{cast:!m.isMeshBasicMaterial&&!m.transparent,recv:!m.isMeshBasicMaterial});mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function cyl(parent,rt,rb,h,x,y,z,m,segments=12){const mesh=Qi(ot(rt,rb,h,segments),m,{cast:!m.isMeshBasicMaterial&&!m.transparent,recv:!m.isMeshBasicMaterial});mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function tube(parent,points,r,m){const mesh=Qi(Fn(points.map(p=>p.isVector3?p:new T.Vector3(...p)),r,6),m,{cast:!m.isMeshBasicMaterial,recv:!m.isMeshBasicMaterial});parent.add(mesh);return mesh;}
  function beam(parent,a,b,w,m){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),mesh=box(parent,w,d.length(),w,...A.clone().add(B).multiplyScalar(.5).toArray(),m,.006);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;}
  function collider(x,y,z,w,h,d,tag="structure",surface="metal",opts={}){const min=new T.Vector3(x-w/2,y-h/2,z-d/2),max=new T.Vector3(x+w/2,y+h/2,z+d/2);const c=G.physics.addBox(min,max,{tag,surface,...opts});placed.push({name:tag,x,y,z,size:[w,h,d],bounds:{min,max}});return c;}
  function light(parent,color,intensity,distance,x,y,z){const l=new T.PointLight(color,intensity,distance,2);l.position.set(x,y,z);parent.add(l);lights.push(l);return l;}
  function sign(parent,text,w,h,x,y,z,opts={}){const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=256;const c=canvas.getContext("2d");c.fillStyle=opts.bg||"#08101b";c.fillRect(0,0,1024,256);c.strokeStyle=opts.color||"#73eaff";c.lineWidth=5;c.strokeRect(10,10,1004,236);c.fillStyle=opts.color||"#73eaff";c.textAlign="center";c.textBaseline="middle";c.font=`700 ${Math.min(92,Math.floor(1900/Math.max(8,text.length)))}px sans-serif`;c.fillText(text,512,116);if(opts.sub){c.font="500 24px monospace";c.globalAlpha=.72;c.fillText(opts.sub,512,202);c.globalAlpha=1;}const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const m=new T.MeshBasicMaterial({name:"xeno-sign",map:tex,color:new T.Color(1,1,1).multiplyScalar(opts.power||1.7),side:T.DoubleSide});const mesh=new T.Mesh(new T.PlaneGeometry(w,h),m);mesh.name="sign-"+text;mesh.position.set(x,y,z);mesh.rotation.y=opts.yaw||0;parent.add(mesh);return mesh;}
  return {G,root,static:stat,dynamic,box,cyl,tube,beam,collider,sign,light,mat,rng,placed,updaters,interactions,lights};
};

NC.createLevel=async function(G){
  const T=G.THREE,root=new T.Group(),stat=new T.Group(),dynamic=new T.Group();root.name="bastion-07-level";stat.name="bastion-static";dynamic.name="bastion-dynamic";dynamic.userData.noMerge=true;root.add(stat,dynamic);G.scene.add(root);
  const K=NC.createKit(G,root,stat,dynamic),{box,cyl,tube,beam,collider,sign,light,mat,rng}=K;
  const roomBoxes=[];
  const wall=(w,h,d,x,y,z,m=mat.base,tag="bastion-wall")=>{const mesh=box(stat,w,h,d,x,y,z,m);collider(x,y,z,w,h,d,tag,"metal");return mesh;};
  // 基地外墙与前方能量闸门，保持可走动的米制空间和独立碰撞登记。
  wall(1.2,4.6,23,-14,2.3,15,mat.base,"base-wall-west");wall(1.2,4.6,23,14,2.3,15,mat.base,"base-wall-east");
  wall(27,4.6,1.1,0,2.3,26,mat.base,"base-wall-rear");
  wall(8.1,4.6,1.0,-9.9,2.3,8.8,mat.base,"gate-wing-west");wall(8.1,4.6,1.0,9.9,2.3,8.8,mat.base,"gate-wing-east");
  roomBoxes.push({min:new T.Vector3(-13.3,.05,9.4),max:new T.Vector3(13.3,4.5,25.4)});
  // 防线、火力塔和顶部导轨。
  const gateGlow=new T.Mesh(new T.PlaneGeometry(11.2,4.1),new T.MeshBasicMaterial({name:"bastion-energy-gate",color:0x5138ff,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false}));gateGlow.name="energy-gate";gateGlow.position.set(0,2.35,8.35);gateGlow.rotation.y=0;dynamic.add(gateGlow);
  for(const x of [-11.5,11.5]){
    const tower=new T.Group();tower.name="defense-tower-"+x;tower.position.set(x,0,10.7);stat.add(tower);
    box(tower,2.6,5.8,2.6,0,2.9,0,mat.armor,.05);box(tower,2.1,.25,2.1,0,5.85,0,mat.dark);
    cyl(tower,.42,.32,.7,0,6.35,0,mat.gun,12).rotation.x=Math.PI/2;
    box(tower,.22,.22,1.7,0,6.25,.7,mat.amber);light(tower,0xff6b31,28,9,0,5.7,.4);
    collider(x,2.9,10.7,2.6,5.8,2.6,"defense-tower","metal");
  }
  for(const x of [-8,-4,0,4,8]){box(stat,.16,.22,25,x,5.15,17,mat.steel,0);box(stat,.035,.08,24,x,5.3,17,mat.cyan,0);}
  // 基地核心：动态护盾柱、环形线圈和状态灯。
  const core=new T.Group();core.name="bastion-core";core.position.set(0,0,23.6);dynamic.add(core);
  cyl(core,1.45,1.65,.42,0,.23,0,mat.dark,24);cyl(core,1.2,1.05,2.3,0,1.45,0,mat.armor,18);cyl(core,.65,.82,.14,0,2.65,0,mat.cyan,18);
  const coreGlow=new T.Mesh(new T.CylinderGeometry(.42,.42,2.5,18),mat.voidGlow);coreGlow.name="core-energy-column";coreGlow.position.y=1.45;coreGlow.material.transparent=true;coreGlow.material.opacity=.42;core.add(coreGlow);
  for(const y of [.55,1.2,1.85,2.5]){const ring=new T.Mesh(new T.TorusGeometry(1.08,.045,6,32),mat.cyan);ring.name="core-ring";ring.position.y=y;ring.rotation.x=Math.PI/2;core.add(ring);K.updaters.push(dt=>{ring.rotation.z+=dt*(y<1.3?1.8:-1.2);});}
  light(core,0x613cff,42,10,0,1.7,0);K.core={root:core,glow:coreGlow,health:100,maxHealth:100};
  sign(stat,"BASTION 07",5.8,1.15,0,5.0,26.62,{color:"#80eaff",sub:"DEFENSE GRID / HOLD THE LINE",power:2.2});
  // 弹药、掩体和维修件。
  for(const [x,z] of [[-8,20],[-6,14],[7,21],[8,14]]){box(stat,1.2,.9,1.05,x,.45,z,mat.red);box(stat,1.0,.06,.8,x,.93,z,mat.amber,0);collider(x,.45,z,1.2,.9,1.05,"ammo-crate","metal");}
  for(const x of [-10,-7,7,10]){box(stat,1.2,1.1,.8,x,.55,7.5,mat.armor);box(stat,1.28,.08,.86,x,1.12,7.5,mat.amber,0);collider(x,.55,7.5,1.2,1.1,.8,"barricade","metal");}
  // 外星地形：岩柱、远古门骨和发光裂隙，静态部分按材质合批。
  for(let i=0;i<30;i++){
    const x=-25+(i*17%50),z=-24+(i*29%54),h=1.5+(i%7)*.55,r=.35+(i%4)*.22;
    const rock=cyl(stat,r*.72,r,h,x,h/2,z,i%3?mat.rock:mat.rock2,7);rock.name="alien-monolith-"+i;rock.rotation.z=(rng()-.5)*.18;rock.rotation.x=(rng()-.5)*.13;
    if(i%5===0){const vein=box(stat,.035,h*.75,.035,x+r*.45,h*.45,z+r*.2,mat.lime,0);vein.rotation.z=.2;}
  }
  for(const x of [-21,-15,15,21]){beam(stat,[x,0,-25],[x*.82,10,-24],.28,mat.rock2);beam(stat,[x*.82,10,-24],[x*.62,10,-24],.2,mat.rock2);}
  for(let i=0;i<18;i++){const x=-12+(i*11%24),z=-22+(i*7%28);tube(stat,[[x-.6,.035,z],[x,.07,z+.8],[x+.7,.035,z+1.5]],.025,mat.lime);}
  // 少量基地功能交互，保留 E 的真实按住语义；修复会消费事件并影响护盾。
  const reactor={id:"reactor",kind:"base",label:"校准护盾核心",description:"按住 E 让护盾重新锁定虫潮。",pos:new T.Vector3(0,1.5,23.6),reach:2.8,hold:1.8,done:false,repeat:true,enabled(){return life.swarm.status.phase!=='dormant'&&life.swarm.status.phase!=='overrun';},callback(){K.core.health=Math.min(100,K.core.health+18);G.events.emit("xeno:repair",{amount:18,pos:K.core.root.position.clone()});return true;}};K.interactions.push(reactor);
  const life=NC.populateLife?NC.populateLife(G,K):{update(){},stats:{},swarm:{status:{phase:'dormant',waveTime:0,active:0,spawned:0,killed:0,climbers:0,coreHealth:100}}};
  // 四段任务与同一波次状态绑定：部署→观察潮头→修复护盾→确认防线。
  const deploy={id:"deploy",kind:"base",label:"启动防卫协议",description:"按住 E 启动 Bastion 07 防卫网，虫潮将从外环压入。",pos:new T.Vector3(0,1.45,20.4),reach:2.8,hold:1.1,done:false,repeat:false,callback(){life.startDefense();return true;}};
  const command={id:"command",kind:"base",label:"确认虫潮接敌",description:"等待第一波虫群越过外环，确认防线目标。",pos:new T.Vector3(-8,1.3,20.1),reach:3.0,hold:1.0,done:false,repeat:false,enabled(){const s=life.swarm.status;return s.waveTime>14&&s.phase!=='overrun';},lockedReason:"虫潮尚未进入射界",callback(){G.events.emit("xeno:contact",{wave:life.swarm.status.waveTime});return true;}};
  const extract={id:"extract",kind:"base",label:"确认防线守住",description:"虫潮已退，回到基地核心确认防卫战结果。",pos:new T.Vector3(0,1.45,23.6),reach:2.8,hold:1.1,done:false,repeat:false,enabled(){return life.swarm.status.phase==='secured';},lockedReason:"先击退整波虫潮",callback(){G.events.emit("xeno:secured",{time:life.swarm.status.waveTime});return true;}};
  K.interactions.unshift(deploy,command);K.interactions.push(extract);
  const merged=By(stat);merged.name="bastion-merged";root.remove(stat);root.add(merged);
  const compatCrawler={id:"crawler-S09",type:"xeno-swarm",snapshot(){const s=life.swarm.status;return {combat:{hp:s.coreHealth,maxHp:100,phase:s.phase,shots:0,hitsReceived:0,weakHits:0,playerHits:0,kills:s.killed,dead:s.phase==='overrun',gunAttached:false,parts:[],breakup:{maxTravel:0,releaseLog:[]}},status:s};},reset(){life.reset();}};
  const cyber={...K,core:K.core,swarm:life.swarm,crawler:compatCrawler,sceneStats:{mergedBatches:merged.children.length,interactions:K.interactions.length,...life.stats},startDefense(){if(life.startDefense)life.startDefense();},reset(){K.core.health=100;for(const i of K.interactions)i.done=false;if(life.reset)life.reset();G.events.emit("xeno:reset",{});}};
  return {root,playerStart:{pos:new T.Vector3(0,0,20.8),yaw:0},objectives:[],extraction:{pos:new T.Vector3(0,0,23.6),radius:2},enemySpawns:[],zones:[],interiorBoxes:roomBoxes,skylights:[],cinematicPath:[{pos:[0,2.1,25],look:[0,4,-12]},{pos:[-8,2.2,18],look:[0,3,8]}],coverPoints:[],shedLights:[],placed:K.placed,vantage:[],stats:cyber.sceneStats,cyber,groundSurfaceAt(){return "alien-rock";},update(dt){for(const u of K.updaters)u(dt);life.update(dt);}};
};

NC.createBackdrop=async function(G){
  const T=G.THREE,root=new T.Group(),stat=new T.Group(),dyn=new T.Group();root.name="alien-horizon";root.add(stat,dyn);G.scene.add(root);
  const K=NC.createKit(G,root,stat,dyn),{box,cyl,light,mat,rng}=K;
  const stars=[];for(let i=0;i<360;i++){const a=rng()*Math.PI*2,r=50+rng()*210,y=8+rng()*105;stars.push(Math.cos(a)*r,y,Math.sin(a)*r-30);}
  const sg=new T.BufferGeometry();sg.setAttribute("position",new T.Float32BufferAttribute(stars,3));const sm=new T.PointsMaterial({name:"alien-stars",color:0x8abfff,size:.11,sizeAttenuation:true,transparent:true,opacity:.82});const points=new T.Points(sg,sm);points.name="deep-space-stars";stat.add(points);
  const planet=new T.Mesh(new T.SphereGeometry(22,32,18),new T.MeshBasicMaterial({name:"red-planet",color:0x2d0e29,transparent:true,opacity:.86}));planet.name="red-planet";planet.position.set(78,54,-180);stat.add(planet);
  const halo=new T.Mesh(new T.SphereGeometry(25,32,18),new T.MeshBasicMaterial({name:"planet-halo",color:0xb12d53,transparent:true,opacity:.08,side:T.BackSide,depthWrite:false,blending:T.AdditiveBlending}));halo.position.copy(planet.position);stat.add(halo);
  for(let i=0;i<14;i++){const x=-55+i*8,z=-90-(i%4)*28,h=12+(i%5)*7;box(stat,2.2,h,2.2,x,h/2-2,z,i%2?mat.rock:mat.rock2,.08);box(stat,.06,h*.8,.06,x+1.15,h*.5,z+.9,i%2?mat.lime:mat.amber,0);}
  light(dyn,0xff3f51,50,110,-34,18,-55);light(dyn,0x4d52ff,38,120,36,22,-68);
  return {root,update(dt){points.rotation.y+=dt*.001;},stats:{starPoints:360,planet:1,horizonMonoliths:14}};
};

// 由 life.js 提供虫群和特效；保留统一入口，便于静态导航和验收。
window.__XENO_CONTRACT={engine:"Three.js r180",source:NC.source,world:{up:"+Y",groundY:0,playerFwd:"-Z",bugFwd:"+Z"},render:{doubleCamera:true,depthRange:"weapon 0..0.05",post:"HDR/AO/volume/bloom/grade/FXAA"},performance:{swarm:"InstancedMesh pools",maxActive:128,fx:"bounded pooled droplets"}};
