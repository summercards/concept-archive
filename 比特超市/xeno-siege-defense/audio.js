/* XENO SIEGE 音景：复用原合成雨、室内混响、脚步与分层配乐；叠加基地低频、虫潮冲击和酸液反馈。 */
Go.city_hum={n:1,sr:22050,peak:.12,loop:1,gen:function(sr,rng){
  const length=sr*8,out=new Float32Array(length);let low=0;
  for(let i=0;i<length;i++){
    const t=i/sr,phase=t/8*Math.PI*2;
    low=low*.985+(rng()*2-1)*.015;
    out[i]=low*.32+Math.sin(2*Math.PI*50*t)*.025+Math.sin(2*Math.PI*100*t)*.012+Math.sin(2*Math.PI*75*t+Math.sin(phase)*.7)*.009;
  }
  // 35ms边界平滑归零：首尾样本和边界斜率连续，避免城市循环接缝点击。
  const edge=Math.floor(sr*.035);
  for(let i=0;i<edge;i++){const x=i/(edge-1),p=x*x*(3-2*x);out[i]*=p;out[length-1-i]*=p;}
  return out;
}};
Go.city_chirp={n:2,sr:22050,peak:.2,bus:"near",max:3,pri:5,gen:function(sr,rng,variant){
  const out=new Float32Array(Math.floor(sr*.38));
  for(let i=0;i<out.length;i++){const t=i/sr,f=variant?740:560,a=Math.exp(-t*14)*Math.min(1,t*100);out[i]=(Math.sin(2*Math.PI*f*t)+Math.sin(2*Math.PI*f*1.5*t)*.3)*a*.4;}
  return out;
}};
Go.city_radio={n:1,sr:22050,peak:.12,loop:1,gen:function(sr,rng){
  const seconds=9.6,out=new Float32Array(Math.round(sr*seconds)),notes=[62,69,74,76,69,65,72,74,58,65,70,74,60,67,72,79];
  for(let n=0;n<64;n++){const start=n*.15,index=n%16;if(index%4===3)continue;const f=440*Math.pow(2,(notes[index]-69)/12);
    for(let i=0;i<Math.floor(sr*.5);i++){const t=i/sr,at=(Math.floor(start*sr)+i)%out.length;out[at]+=(Math.sin(t*f*Math.PI*2)*Math.exp(-t*11)+Math.sin(t*f*Math.PI*4)*Math.exp(-t*18)*.16)*.12*Math.min(1,t*150);}
  }return out;
}};
// NPC落水声单独登记world总线，避免复用玩家near脚步造成远处仍在耳边响。
Go.crawler_water={...Go.step_water,bus:"world",max:4,pri:2};
NC.crawlerSoundConfig={name:"crawler_water",bus:Go.crawler_water.bus,variants:Go.crawler_water.n};
// 重机枪合成：低频瞬态+带通爆裂+机械尾，独立world总线与声部配额。
Go.crawler_hmg={n:3,sr:32000,peak:.88,bus:"world",max:6,pri:9,gen:function(sr,rng,variant){
  const out=new Float32Array(Math.round(sr*.52));let low=0,mid=0;
  for(let i=0;i<out.length;i++){const t=i/sr,n=rng()*2-1;low=low*.92+n*.08;mid=mid*.68+n*.32;
    const attack=Math.min(1,t*2500),bass=Math.sin(2*Math.PI*(105*t-42*t*t))*.58*Math.exp(-t*24);
    out[i]=(n*.36*Math.exp(-t*210)+mid*.40*Math.exp(-t*32)+low*.75*Math.exp(-t*10)+bass+
      Math.sin(2*Math.PI*(690+variant*31)*t)*.055*Math.exp(-t*35))*attack;
  }return out;
}};
Go.crawler_telegraph={...Go.telegraph,n:2,bus:"world",max:1,pri:7};
Go.crawler_shutdown={...Go.hound_die,bus:"world",max:1,pri:9};
Go.crawler_break={n:2,sr:32000,peak:.88,bus:"world",max:2,pri:9,gen:function(sr,rng,variant=0){
  const out=new Float32Array(Math.round(sr*.78));let low=0,mid=0,peak=0;
  for(let i=0;i<out.length;i++){
    const t=i/sr,n=rng()*2-1;low=low*.96+n*.04;mid=mid*.72+n*.28;
    let s=(Math.sin(2*Math.PI*(72*t-24*t*t))*.66*Math.exp(-t*9)+low*1.5*Math.exp(-t*12)+mid*.48*Math.exp(-t*65))*Math.min(1,t*1400);
    // 三次宽厚断裂，不铺细碎的高频金属颗粒。
    for(let h=0;h<3;h++){
      const u=t-[0,.078,.205][h];if(u<0)continue;
      const a=[.62,.4,.23][h]*Math.min(1,u*1800);
      s+=a*(mid*.7*Math.exp(-u*46)+Math.sin(2*Math.PI*(238+variant*17+h*51)*u)*.5*Math.exp(-u*16)+Math.sin(2*Math.PI*(391+h*73)*u)*.22*Math.exp(-u*23));
    }
    const edge=Math.min(1,(out.length-1-i)/(sr*.035));out[i]=s*Math.max(0,edge);peak=Math.max(peak,Math.abs(out[i]));
  }
  if(peak>.88)for(let i=0;i<out.length;i++)out[i]*=.88/peak;
  return out;
}};
Go.crawler_heavy_impact={n:3,sr:32000,peak:.88,bus:"world",max:3,pri:7,gen:function(sr,rng,variant=0){
  const out=new Float32Array(Math.round(sr*.6));let low=0,mid=0,peak=0;
  for(let i=0;i<out.length;i++){
    const t=i/sr,n=rng()*2-1;low=low*.95+n*.05;mid=mid*.76+n*.24;
    const attack=Math.min(1,t*1800),bass=Math.sin(2*Math.PI*((67+variant*4)*t-26*t*t))*.8*Math.exp(-t*11);
    const metal=(Math.sin(2*Math.PI*(173+variant*19)*t)*.26+Math.sin(2*Math.PI*(287+variant*23)*t)*.14)*Math.exp(-t*8);
    const s=(bass+low*1.6*Math.exp(-t*17)+mid*.6*Math.exp(-t*65)+metal)*attack;
    out[i]=s*Math.max(0,Math.min(1,(out.length-1-i)/(sr*.04)));peak=Math.max(peak,Math.abs(out[i]));
  }
  if(peak>.88)for(let i=0;i<out.length;i++)out[i]*=.88/peak;
  return out;
}};
NC.audioSamples=function(){
  return ["city_hum","city_chirp","city_radio","crawler_water","crawler_hmg","crawler_break","crawler_heavy_impact"].map(name=>{const entry=Go[name],pcm=entry.gen(entry.sr,ao(Kb(name)),0),channels=Array.isArray(pcm)?pcm:[pcm];let peak=0,finite=true;for(const ch of channels)for(const s of ch){if(!Number.isFinite(s))finite=false;peak=Math.max(peak,Math.abs(s));}return {name,channels:channels.length,frames:channels[0].length,peak,finite,seamDelta:Math.abs(channels[0][0]-channels[0][channels[0].length-1])};});
};
NC.qualityPresets=Pr;
c_=async function(G){
  const audio=await NC.original.audio(G);
  if(audio.stub)return audio;
  let hum=null,radio=null,radioOn=false;
  const addHum=()=>{if(!hum&&audio.ctx)hum=audio.loop("city_hum",{gain:.24,bus:"amb",fade:2,offset:0});};
  const update=audio.update;
  audio.update=function(dt){addHum();update(dt);};
  G.events.on("cyber:interaction",data=>{
    audio.play("city_chirp",{gain:.28,jitter:0});
    if(data.id==="door")audio.play("reload_bolt",{gain:.16});
    if(data.id==="vending")audio.play("reload_magin",{gain:.18});
    if(data.id==="relay")audio.play("relay_cut",{gain:.22});
    if(data.id==="jukebox"){
      radioOn=!radioOn;
      if(!radio)radio=audio.loop("city_radio",{gain:0,pos:[-11.1,1.0,8.6],bus:"world",ref:2.5,roll:.9,fade:3,offset:0});
      radio.setGain(radioOn?.45:0);
      G.level.cyber.radioPlaying=radioOn;
    }
  });
  let crawlerLastStep=-1;
  G.events.on("crawler:step",data=>{
    if(data.time-crawlerLastStep<.08)return;
    crawlerLastStep=data.time;
    audio.play("crawler_water",{gain:data.arm?.12:.18,pos:data.pos,jitter:.035});
    if(!data.arm)audio.play("hound_step",{gain:.055,pos:data.pos,jitter:.025});
  });
  const crawlerAudio={fire:0,telegraph:0,shutdown:0,impacts:0,ruptures:0,largeImpacts:0};audio.crawlerEvents=crawlerAudio;
  const crawlerDebris=new Map();let crawlerLastImpact=-Infinity;
  const debrisState=d=>{
    const id=d.id??d.enemy?.id??d.enemy??"crawler";
    if(!crawlerDebris.has(id))crawlerDebris.set(id,{shutdown:false,ruptured:false,released:new Map(),parts:new Map(),impacts:0});
    return crawlerDebris.get(id);
  };
  G.events.on("crawler:fire",d=>{crawlerAudio.fire++;audio.play("crawler_hmg",{pos:d.pos.clone(),gain:.82,pitch:.94,jitter:.018});});
  G.events.on("crawler:telegraph",d=>{crawlerAudio.telegraph++;audio.play("crawler_telegraph",{pos:d.pos.clone(),variant:1,gain:.45,pitch:.85,jitter:0});});
  G.events.on("crawler:death",d=>{
    const state=debrisState(d);if(state.shutdown)return;state.shutdown=true;
    crawlerAudio.shutdown++;audio.play("crawler_shutdown",{pos:d.pos.clone(),gain:.35,jitter:.02});
  });
  G.events.on("crawler:rupture",d=>{
    const state=debrisState(d);if(state.ruptured)return;state.ruptured=true;
    crawlerAudio.ruptures++;audio.play("crawler_break",{pos:d.pos.clone(),gain:.65,jitter:0});
  });
  G.events.on("crawler:partReleased",d=>{
    const state=debrisState(d);if(!state.released.has(d.phase))state.released.set(d.phase,{mass:d.mass});
  });
  G.events.on("crawler:impact",d=>{
    const state=debrisState(d),tag=String(d.phase??"body"),heavy=/gun|body|chest|harness|ammo/i.test(tag);
    const released=state.released.get(d.phase),mass=Number.isFinite(d.mass)?Math.max(0,d.mass):Number.isFinite(released?.mass)?Math.max(0,released.mass):heavy?8:1;
    const energy=Number.isFinite(d.energy)?Math.max(0,d.energy):mass*4;
    const time=Number.isFinite(d.time)?d.time:audio.ctx.currentTime,previous=state.parts.get(tag);
    if(state.impacts>=10||mass<(heavy?.3:.75)||energy<(heavy?.12:.8))return;
    if(time-crawlerLastImpact<(heavy?.075:.14))return;
    if(previous&&(previous.count>=2||time-previous.time<.32||energy<previous.energy*.45))return;
    const strength=Math.min(1,Math.sqrt(energy/80)*.65+Math.sqrt(mass/25)*.35);
    // 每个部件最多两声，全次击败最多十声；重件不再叠小金属或水花声。
    const gain=Math.min(.82,(heavy?.36:.23)+strength*.42)*(previous?.78:1);
    state.parts.set(tag,{count:(previous?.count??0)+1,time,energy});state.impacts++;crawlerLastImpact=time;
    crawlerAudio.impacts++;crawlerAudio.largeImpacts++;
    audio.play("crawler_heavy_impact",{pos:d.pos.clone(),gain,pitch:heavy?.82:.96,jitter:0});
  });
  G.events.on("cyber:reset",()=>{crawlerLastStep=-1;crawlerLastImpact=-Infinity;crawlerDebris.clear();Object.keys(crawlerAudio).forEach(k=>crawlerAudio[k]=0);radioOn=false;G.level.cyber.radioPlaying=false;if(radio)radio.setGain(0);});
  G.events.on("cyber:completed",()=>audio.play("complete",{gain:.42}));
  return audio;
};
