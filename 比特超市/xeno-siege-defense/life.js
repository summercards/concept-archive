/* XENO SIEGE · 受控虫群、攀爬堆叠、爆浆特效与波次状态。沿用原版 level.update 顺序，不创建独立 RAF。 */
NC.populateLife=function(G,K){
  'use strict';
  const T=G.THREE,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=v=>v*v*(3-2*v);
  let seed=0x7407a11;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const life=new T.Group();life.name='xeno-swarm-life';life.userData.noMerge=true;K.dynamic.add(life);
  const maxBugs=128,bugs=Array.from({length:maxBugs},(_,i)=>({index:i,alive:false,climber:false,host:-1,stack:0,x:0,y:.24,z:0,baseX:0,speed:0,hp:0,maxHp:0,scale:1,phase:0,attack:0,age:0,brute:false,wall:false,deathT:0}));
  const bugBodyGeo=new T.IcosahedronGeometry(.34,1),bugHeadGeo=new T.SphereGeometry(.22,8,5),bugLegGeo=new T.CylinderGeometry(.035,.055,.7,5),bugSpineGeo=new T.ConeGeometry(.12,.5,6);
  const shellMat=new T.MeshStandardMaterial({name:'xeno-carapace',color:0x8f241f,roughness:.48,metalness:.18,vertexColors:true,emissive:0x3f0508,emissiveIntensity:.72});
  const headMat=new T.MeshStandardMaterial({name:'xeno-head',color:0x3a101c,roughness:.58,metalness:.08,vertexColors:true,emissive:0x21030d,emissiveIntensity:.58});
  const legMat=new T.MeshStandardMaterial({name:'xeno-limbs',color:0x211521,roughness:.68,metalness:.12,emissive:0x09020a,emissiveIntensity:.22});
  const eyeMat=new T.MeshBasicMaterial({name:'xeno-eyes',color:0xff9a4b,transparent:true,opacity:.98});
  const bruteMat=new T.MeshStandardMaterial({name:'xeno-brute-carapace',color:0x7f1025,roughness:.42,metalness:.24,emissive:0x2e020b,emissiveIntensity:.72});
  const bodyMesh=new T.InstancedMesh(bugBodyGeo,shellMat,maxBugs);bodyMesh.name='xeno-swarm-carapace-128';bodyMesh.userData.noMerge=true;bodyMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);life.add(bodyMesh);
  const headMesh=new T.InstancedMesh(bugHeadGeo,headMat,maxBugs);headMesh.name='xeno-swarm-head-128';headMesh.userData.noMerge=true;headMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);life.add(headMesh);
  const legMesh=new T.InstancedMesh(bugLegGeo,legMat,maxBugs*6);legMesh.name='xeno-swarm-legs-768';legMesh.userData.noMerge=true;legMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);life.add(legMesh);
  const spineMesh=new T.InstancedMesh(bugSpineGeo,bruteMat,maxBugs);spineMesh.name='xeno-brute-spines-128';spineMesh.userData.noMerge=true;spineMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);life.add(spineMesh);
  const eyeMesh=new T.InstancedMesh(new T.SphereGeometry(.045,6,4),eyeMat,maxBugs*2);eyeMesh.name='xeno-eyes-256';eyeMesh.userData.noMerge=true;life.add(eyeMesh);
  const matrix=new T.Matrix4(),quat=new T.Quaternion(),scale=new T.Vector3(),pos=new T.Vector3(),dir=new T.Vector3(0,1,0),scratch=new T.Vector3();
  const colorA=new T.Color(),colorB=new T.Color();
  const activeIndices=[];let activeCount=0,totalSpawned=0,totalKilled=0,climbers=0,waveTime=0,spawnClock=0,started=false,completed=false,phase='dormant',coreDamage=0;
  const colliders=[];
  for(let i=0;i<3;i++)colliders.push(G.physics.addBox(new T.Vector3(-12,.04,7+i*3.1),new T.Vector3(12,.72,7.65+i*3.1),{surface:'flesh',tag:'xeno-surge',noNav:true,playerOnly:true}));

  function makeFx(){
    const fx=new T.Group();fx.name='xeno-gore-fx';fx.userData.noMerge=true;life.add(fx);
    const gooMat=new T.MeshBasicMaterial({name:'xeno-ichor',color:0xff321c,transparent:true,opacity:.92,blending:T.AdditiveBlending,depthWrite:false});
    const acidMat=new T.MeshBasicMaterial({name:'xeno-acid',color:0xa6ff3d,transparent:true,opacity:.78,blending:T.AdditiveBlending,depthWrite:false});
    const goo=new T.InstancedMesh(new T.SphereGeometry(1,6,4),gooMat,288);goo.name='xeno-ichor-droplets-288';goo.userData.noMerge=true;goo.instanceMatrix.setUsage(T.DynamicDrawUsage);fx.add(goo);
    const splat=new T.InstancedMesh(new T.SphereGeometry(1,7,5),acidMat,72);splat.name='xeno-acid-chunks-72';splat.userData.noMerge=true;splat.instanceMatrix.setUsage(T.DynamicDrawUsage);fx.add(splat);
    const ringMat=new T.MeshBasicMaterial({name:'xeno-shock-ring',color:0xff5a28,transparent:true,opacity:.72,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
    const ring=new T.InstancedMesh(new T.TorusGeometry(1,.035,4,22),ringMat,32);ring.name='xeno-impact-rings-32';ring.userData.noMerge=true;ring.instanceMatrix.setUsage(T.DynamicDrawUsage);fx.add(ring);
    const flash=new T.PointLight(0xffb23a,0,8,2);flash.name='xeno-burst-flash';flash.visible=false;fx.add(flash);
    const droplets=Array.from({length:288},()=>({on:false,age:0,life:0,p:new T.Vector3(),v:new T.Vector3(),s:.05,acid:false}));
    const chunks=Array.from({length:72},()=>({on:false,age:0,life:0,p:new T.Vector3(),v:new T.Vector3(),s:.12,spin:0}));
    const rings=Array.from({length:32},()=>({on:false,age:0,life:.46,p:new T.Vector3(),s:.2}));let cursor=0,chunkCursor=0,ringCursor=0,flashAge=1;
    function emit(kind,point,normal=new T.Vector3(0,1,0),power=1){
      const n=kind==='kill'?18:kind==='impact'?5:8;const base=point.clone();
      for(let i=0;i<n;i++){const d=droplets[(cursor++)%droplets.length];d.on=true;d.age=0;d.life=.28+random()*.48;d.p.copy(base);d.v.set((random()-.5)*3.5,(.6+random()*2.8)*power,(random()-.5)*3.5).addScaledVector(normal,1.2*power);d.s=(.035+random()*.08)*(kind==='kill'?1.2:1);d.acid=i%4===0;}
      if(kind==='kill')for(let i=0;i<3;i++){const c=chunks[(chunkCursor++)%chunks.length];c.on=true;c.age=0;c.life=.7+random()*.55;c.p.copy(base);c.v.set((random()-.5)*2.6,.8+random()*2.4,(random()-.5)*2.6).addScaledVector(normal,1.4);c.s=.12+random()*.14;c.spin=random()*6;}
      const r=rings[(ringCursor++)%rings.length];r.on=true;r.age=0;r.life=kind==='kill'?.7:.42;r.p.copy(base);r.s=kind==='kill'?.32:.2;
      flashAge=0;flash.position.copy(base);flash.intensity=kind==='kill'?42:18;flash.visible=true;
    }
    function update(dt){
      flashAge+=dt;if(flashAge>.1){flash.visible=false;flash.intensity=0;}
      for(let i=0;i<droplets.length;i++){const d=droplets[i];if(!d.on){matrix.makeScale(0,0,0);goo.setMatrixAt(i,matrix);continue;}d.age+=dt;if(d.age>d.life){d.on=false;matrix.makeScale(0,0,0);goo.setMatrixAt(i,matrix);continue;}d.v.y-=8.5*dt;d.p.addScaledVector(d.v,dt);const a=1-d.age/d.life;scale.set(d.s*a,d.s*(.8+.4*a),d.s*a);matrix.compose(d.p,quat,scale);goo.setMatrixAt(i,matrix);}
      for(let i=0;i<chunks.length;i++){const d=chunks[i];if(!d.on){matrix.makeScale(0,0,0);splat.setMatrixAt(i,matrix);continue;}d.age+=dt;if(d.age>d.life){d.on=false;matrix.makeScale(0,0,0);splat.setMatrixAt(i,matrix);continue;}d.v.y-=7*dt;d.p.addScaledVector(d.v,dt);scale.setScalar(d.s*(1-d.age/d.life));matrix.compose(d.p,quat,scale);splat.setMatrixAt(i,matrix);}
      for(let i=0;i<rings.length;i++){const r=rings[i];if(!r.on){matrix.makeScale(0,0,0);ring.setMatrixAt(i,matrix);continue;}r.age+=dt;if(r.age>r.life){r.on=false;matrix.makeScale(0,0,0);ring.setMatrixAt(i,matrix);continue;}r.s+=dt*2.5;scale.set(r.s,r.s,1);quat.setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2);matrix.compose(r.p,quat,scale);ring.setMatrixAt(i,matrix);}
      goo.instanceMatrix.needsUpdate=true;splat.instanceMatrix.needsUpdate=true;ring.instanceMatrix.needsUpdate=true;
    }
    function reset(){for(const d of droplets)d.on=false;for(const d of chunks)d.on=false;for(const r of rings)r.on=false;flash.visible=false;flash.intensity=0;}
    function snapshot(){return {droplets:droplets.filter(d=>d.on).length,chunks:chunks.filter(d=>d.on).length,rings:rings.filter(d=>d.on).length,flash:flash.visible};}
    return {emit,update,reset,snapshot,config:{maxDrawCalls:3,droplets:288,chunks:72,rings:32,burst:'kill 18 droplets + 3 chunks + 1 shock ring',color:'red/orange with acid green secondary'}};
  }
  const fx=makeFx();

  function clearInstance(i){matrix.makeScale(0,0,0);bodyMesh.setMatrixAt(i,matrix);headMesh.setMatrixAt(i,matrix);spineMesh.setMatrixAt(i,matrix);for(let k=0;k<6;k++)legMesh.setMatrixAt(i*6+k,matrix);for(let k=0;k<2;k++)eyeMesh.setMatrixAt(i*2+k,matrix);}
  for(let i=0;i<maxBugs;i++){clearInstance(i);bodyMesh.setColorAt(i,colorA.setRGB(.65,.08,.055));headMesh.setColorAt(i,colorB.setRGB(.18,.025,.07));spineMesh.setColorAt(i,colorA.setRGB(.28,.015,.04));}
  for(let i=0;i<maxBugs;i++)for(let k=0;k<6;k++)legMesh.setColorAt(i*6+k,colorA.setRGB(.12,.025,.08));
  bodyMesh.instanceColor.needsUpdate=true;headMesh.instanceColor.needsUpdate=true;legMesh.instanceColor.needsUpdate=true;spineMesh.instanceColor.needsUpdate=true;

  function getActive(){activeIndices.length=0;for(const b of bugs)if(b.alive)activeIndices.push(b.index);activeCount=activeIndices.length;return activeIndices;}
  function nearestHost(b){let best=-1,bd=2.35;for(const j of activeIndices){const h=bugs[j];if(h===b||h.climber||h.z>15)continue;const d=Math.hypot(h.x-b.x,h.z-b.z);if(d<bd){bd=d;best=j;}}return best;}
  function spawnBug(x=(random()-.5)*21,z=-24-random()*3){const b=bugs.find(q=>!q.alive);if(!b)return null;b.alive=true;b.climber=false;b.host=-1;b.stack=0;b.x=x;b.baseX=x;b.y=.26;b.z=z;b.speed=1.02+random()*.72;b.scale=.92+random()*.34;b.phase=random()*TAU;b.age=0;b.attack=0;b.brute=totalSpawned%17===0;b.hp=b.maxHp=b.brute?92:44+Math.floor(random()*20);b.wall=Math.abs(x)>10.5;b.id='xeno-'+b.index;if(!b.pos)b.pos=new T.Vector3();b.damage=(amount,point,direction,part='body')=>damageBug(b,amount,point,direction,part);totalSpawned++;return b;}
  function killBug(b,point,normal){if(!b.alive)return;const p=point||new T.Vector3(b.x,b.y+.35,b.z);b.alive=false;b.deathT=0;totalKilled++;if(b.climber)climbers=Math.max(0,climbers-1);fx.emit('kill',p,normal||new T.Vector3(0,1,0),b.brute?1.3:1);G.events.emit('xeno:death',{id:'xeno-'+b.index,enemy:b,pos:p.clone(),dir:normal?.clone()||new T.Vector3(0,1,0),brute:b.brute});G.events.emit('enemy:killed',{enemy:b,pos:p.clone(),type:'xeno'});}
  function damageBug(b,amount,point,normal,part='body'){if(!b||!b.alive)return false;const mult=part==='weak'?1.8:1;const damage=Math.min(b.hp,amount*mult);b.hp-=amount*mult;const p=point||new T.Vector3(b.x,b.y+.3,b.z);fx.emit('impact',p,normal||new T.Vector3(0,1,0),.8);G.events.emit('xeno:hit',{id:'xeno-'+b.index,enemy:b,point:p.clone(),part,damage,hp:Math.max(0,b.hp),maxHp:b.maxHp});if(b.hp<=0)killBug(b,p,normal);return true;}
  function raycast(origin,direction,maxDist=300){let best=null;for(const b of bugs){if(!b.alive)continue;const center=new T.Vector3(b.x,b.y+.42*b.scale,b.z),r=.38*b.scale;const oc=origin.clone().sub(center),d=direction.clone().normalize(),A=d.lengthSq(),B=2*oc.dot(d),C=oc.lengthSq()-(r*r*1.55),D=B*B-4*A*C;if(D<0)continue;let t=(-B-Math.sqrt(D))/(2*A);if(t<.001)t=(-B+Math.sqrt(D))/(2*A);if(t<.001||t>maxDist||best&&t>=best.dist)continue;const point=origin.clone().addScaledVector(d,t);const weak=point.y>center.y+.22*b.scale;best={enemy:b,part:weak?'weak':'body',dist:t,point,normal:point.clone().sub(center).normalize(),surface:'enemy'};}return best;}
  function updateInstances(time){
    for(const b of bugs){if(!b.alive){clearInstance(b.index);continue;}const bob=Math.sin(time*8+b.phase)*.025;pos.set(b.x,b.y+bob,b.z);const yaw=Math.atan2((b.baseX-b.x)*.8,1);quat.setFromEuler(new T.Euler(0,yaw,Math.sin(time*5+b.phase)*.06));const s=b.scale*(b.brute?1.32:1);scale.set(s,s*.72,s*1.35);matrix.compose(pos,quat,scale);bodyMesh.setMatrixAt(b.index,matrix);pos.y+=.24*s;scale.set(s*.62,s*.46,s*.62);matrix.compose(pos,quat,scale);headMesh.setMatrixAt(b.index,matrix);pos.y-=.28*s;scale.set(s*.6,s*.75,s*.7);matrix.compose(pos,quat,scale);spineMesh.setMatrixAt(b.index,matrix);
      for(let k=0;k<6;k++){const side=k<3?-1:1,leg=k%3,phase=time*11+b.phase+leg*.9+(side>0?Math.PI:0);const lx=b.x+side*(.22+.12*leg)*s,ly=b.y+.16*s+Math.abs(Math.sin(phase))*.05,lz=b.z+(.28-leg*.28)*s;const end=new T.Vector3(lx+side*(.3+.08*Math.sin(phase))*s,ly-.18*s,lz+Math.cos(phase)*.26*s);const mid=new T.Vector3((lx+end.x)/2,ly-.02*s,(lz+end.z)/2);const dd=end.clone().sub(new T.Vector3(lx,ly,lz));quat.setFromUnitVectors(new T.Vector3(0,1,0),dd.normalize());scale.set(.7*s,dd.length()*.8,.7*s);matrix.compose(mid,quat,scale);legMesh.setMatrixAt(b.index*6+k,matrix);}
      for(let k=0;k<2;k++){pos.set(b.x+(k?-.13:.13)*s,b.y+.48*s,b.z+.42*s);scale.setScalar(.7*s);matrix.compose(pos,quat,scale);eyeMesh.setMatrixAt(b.index*2+k,matrix);}
    }
    bodyMesh.instanceMatrix.needsUpdate=true;headMesh.instanceMatrix.needsUpdate=true;legMesh.instanceMatrix.needsUpdate=true;spineMesh.instanceMatrix.needsUpdate=true;eyeMesh.instanceMatrix.needsUpdate=true;
  }
  function updateColliders(){getActive();for(let i=0;i<colliders.length;i++){const z0=7+i*3.1;let minX=99,maxX=-99,has=false;for(const idx of activeIndices){const b=bugs[idx];if(b.z>z0-1.8&&b.z<z0+1.8){has=true;minX=Math.min(minX,b.x-.34*b.scale);maxX=Math.max(maxX,b.x+.34*b.scale);}}if(!has){colliders[i].min.set(-12,.04,z0);colliders[i].max.set(-12,.03,z0);continue;}colliders[i].min.set(clamp(minX-1,-13,13),.04,z0-1.2);colliders[i].max.set(clamp(maxX+1,-13,13),.76,z0+1.2);}}
  function startDefense(){if(started)return;started=true;completed=false;phase='inbound';waveTime=0;spawnClock=0;totalSpawned=0;totalKilled=0;coreDamage=0;for(const b of bugs)b.alive=false;for(let i=0;i<26;i++)spawnBug(-10+(i%9)*2.5,-23-(i%4)*.9);G.events.emit('xeno:phase',{phase:'inbound',time:0});}
  function reset(){started=false;completed=false;phase='dormant';waveTime=0;spawnClock=0;totalSpawned=0;totalKilled=0;coreDamage=0;climbers=0;for(const b of bugs)b.alive=false;fx.reset();for(const c of colliders){c.min.set(-12,.04,0);c.max.set(-12,.03,0);}updateInstances(0);}
  function update(dt){fx.update(dt);if(!started){updateInstances(G.time?.t||0);return;}dt=clamp(dt,0,.05);waveTime+=dt;spawnClock-=dt;getActive();if(waveTime<58&&totalSpawned<116&&spawnClock<=0){const batch=waveTime<4?2:1;for(let i=0;i<batch;i++)spawnBug(-11+random()*22,-24-random()*2.4);spawnClock=waveTime<12?.16:.34;}
    for(const b of bugs){if(!b.alive)continue;b.age+=dt;if(b.host>=0){const h=bugs[b.host];if(!h||!h.alive){b.host=-1;b.climber=false;b.y=.26;}else{const a=b.phase+waveTime*.75;b.x=h.x+Math.cos(a)*.44;b.z=h.z+Math.sin(a)*.44;b.y=.27+.54*b.stack;continue;}}
      if(!b.climber&&b.z>-14&&(b.index%9===0||random()<dt*.9)){const host=nearestHost(b);if(host>=0){b.host=host;b.climber=true;b.stack=1+Math.floor(random()*2);climbers++;continue;}}
      const targetX=(b.z>8?0:b.baseX*.35);b.x+=(targetX-b.x)*dt*.16;b.z+=b.speed*dt*(b.brute?.78:1);b.y=.26+Math.sin(waveTime*5+b.phase)*.025;
      b.pos.set(b.x,b.y,b.z);
      if(b.z>16.4){b.attack+=dt;if(b.attack>.65){b.attack=0;const dmg=b.brute?3.8:1.4;K.core.health=Math.max(0,K.core.health-dmg);coreDamage+=dmg;G.events.emit('xeno:coreHit',{damage:dmg,pos:new T.Vector3(b.x,b.y,b.z),enemy:b,health:K.core.health});fx.emit('impact',new T.Vector3(b.x,.15,b.z),new T.Vector3(0,1,0),.45);}b.speed=0;}
      if(b.z>22.6&&b.attack>2.4){killBug(b,new T.Vector3(b.x,.4,b.z),new T.Vector3(0,1,0));continue;}
    }
    if(K.core.health<=0&&phase!=='overrun'){phase='overrun';G.events.emit('xeno:phase',{phase,time:waveTime});}
    if(phase!=='overrun'&&waveTime>58&&activeCount===0){phase='secured';completed=true;G.events.emit('xeno:phase',{phase,time:waveTime});}
    if(phase==='inbound'&&waveTime>38&&activeCount<5){phase='secured';completed=true;G.events.emit('xeno:phase',{phase,time:waveTime});}
    updateColliders();updateInstances(G.time?.t||waveTime);
  }
  const stats=Object.freeze({swarmMax:maxBugs,initialWave:26,spawnBudget:116,instancedBodies:1,instancedHeads:1,instancedLegs:6,climbStacking:true,gorePools:3});
  life.swarm={bugs,fx,stats,get status(){getActive();return {phase,waveTime,active:activeCount,spawned:totalSpawned,killed:totalKilled,climbers,coreHealth:K.core.health,coreDamage,completed};},startDefense,reset,update,raycast,damageBug};
  for(const b of bugs){b.pos=new T.Vector3();b.id='xeno-'+b.index;b.damage=(amount,point,direction,part='body')=>damageBug(b,amount,point,direction,part);}
  life.startDefense=startDefense;life.reset=reset;life.update=update;life.swarm=life.swarm;life.stats=stats;
  NC.installXenoCombat=function(G){const manager=G.enemies,swarm=G.level?.cyber?.swarm;if(!manager||!swarm||manager.__xenoBridge)return;const baseRay=manager.raycast.bind(manager),baseCount=manager.aliveCount.bind(manager),baseClear=manager.clear.bind(manager),baseList=manager.list;manager.raycast=function(origin,direction,maxDist=300){const a=baseRay(origin,direction,maxDist),b=swarm.raycast(origin,direction,a?a.dist:maxDist);return b&&(!a||b.dist<a.dist)?b:a;};manager.aliveCount=()=>baseCount()+swarm.status.active;manager.clear=function(){baseClear();swarm.reset();};Object.defineProperty(manager,'list',{configurable:true,enumerable:true,get:()=>baseList.concat(swarm.bugs.filter(b=>b.alive))});manager.__xenoBridge=true;};
  updateInstances(0);return {root:life,update,stats,swarm:life.swarm,startDefense,reset};
};
