(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const toast=t=>{const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)};

const hero={blink:0,talk:0,mouse:null,tgt:[0,0],next:0,t:0};/* Eye and page field share particle-field.js. */
/* ===== hero ===== */
const NAMES=['FELYX'];let ni=0;const nm=$('#nm');
// Two overlapping layers: the outgoing name remains until the incoming one is visible.
const initialName=nm.firstElementChild;initialName.classList.add('name-layer');
const nextName=document.createElement('span');nextName.className='name-layer';nextName.style.opacity='0';nm.appendChild(nextName);
let activeName=initialName;
const setName=n=>{
 const text=n.toUpperCase();if(activeName.textContent===text)return;
 const incoming=activeName===initialName?nextName:initialName,outgoing=activeName;
 // Finish an interrupted crossfade before reusing its outgoing layer.
 for(const layer of [incoming,outgoing])layer.getAnimations().forEach(a=>a.cancel());
 outgoing.style.opacity='1';incoming.style.opacity='0';incoming.textContent=text;
 nm.setAttribute('aria-label',text);initialName.setAttribute('aria-hidden','true');nextName.setAttribute('aria-hidden','true');
 incoming.style.opacity='1';outgoing.style.opacity='0';
 if(!RM){incoming.animate([{opacity:0},{opacity:1}],{duration:550,easing:'linear'});outgoing.animate([{opacity:1},{opacity:0}],{duration:550,easing:'linear'});}
 activeName=incoming;
};
let nameTimer=RM?null:setInterval(()=>{ni=(ni+1)%NAMES.length;setName(NAMES[ni])},2300);
$$('#names li').forEach(li=>li.onclick=()=>{$$('#names li').forEach(x=>x.classList.remove('sel'));li.classList.add('sel');clearInterval(nameTimer);setName(li.textContent.replace(' e +','').trim());hero.blink=1});
$$('#voices li').forEach(li=>li.onclick=()=>{$$('#voices li').forEach(x=>x.classList.remove('sel'));li.classList.add('sel');toast('Voz '+li.textContent.trim()+' selecionada')});
let sec=0;setInterval(()=>{sec++;$('#clk').textContent=String(sec/60|0).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')},1000);
$('#more').onclick=e=>{const o=$('#tb').classList.toggle('open');e.currentTarget.textContent=o?'▴':'▾';e.currentTarget.setAttribute('aria-expanded',o)};
$('#mic').onclick=e=>{const on=e.currentTarget.classList.toggle('on');hero.talk=on?1:0;toast(on?'Ouvindo… (demonstração)':'Microfone desligado')};
$('#sw').onclick=e=>{const on=e.currentTarget.classList.toggle('on');$('#swl').innerHTML='Arandela<br><small style="color:'+(on?'var(--c1)':'var(--mute)')+'">'+(on?'on':'off')+'</small>'};
$('#scn').onclick=e=>{const on=e.currentTarget.classList.toggle('on');$('#scb').classList.toggle('on',on);$('#scl').innerHTML='Cinema<br><small style="color:'+(on?'var(--c1)':'var(--mute)')+'">'+(on?'luz 20%, cortina fechada, TV':'desligada')+'</small>'};
const CMDS=['› qual a agenda?','› apaga tudo e tranca a porta','› liga o ar em 23°','› cria a cena jantar','› como está o dólar?'];let ci=0;
setInterval(()=>{ci=(ci+1)%CMDS.length;$('#cmd').textContent=CMDS[ci]},2800);
const QT=['Cotações às 9h','Notícias às 7h','Agenda: 14h reunião','Clima: 24° e sol'];let qi=0;setInterval(()=>{qi=(qi+1)%QT.length;$('#quote').textContent=QT[qi]},3200);

/* ===== Casa 4D: agenda do dia ===== */
const ON=(m,ranges)=>ranges.some(([a,b])=>m>=a&&m<b);
const S={
 sala:m=>ON(m,[[1080,1400]]),tv:m=>ON(m,[[1180,1330]]),luminaria:m=>ON(m,[[1200,1400]]),
 cozinha:m=>ON(m,[[370,480],[1100,1260]]),fogao:m=>ON(m,[[390,480],[1120,1220]]),geladeira:m=>ON(m,[[375,460],[1105,1180]]),
 quarto:m=>ON(m,[[360,430],[1250,1300]]),abajur:m=>ON(m,[[360,410],[1260,1400]]),ar:m=>ON(m,[[0,360],[1290,1440]]),
 cortina:m=>m>=375&&m<1200,cortinaS:m=>m>=400&&m<1170,portao:m=>ON(m,[[430,540],[990,1100]]),carro:m=>!(m>=440&&m<1000),
 garagem:m=>ON(m,[[425,560],[990,1160]]),externa:m=>ON(m,[[1080,1440],[0,330]]),piscina:m=>ON(m,[[1080,1410]])
};
const EV=[[0,'00:00 · casa dormindo, ar da suíte em 23°'],[330,'05:30 · luzes do jardim apagadas'],[360,'06:00 · ar da suíte desligado'],[370,'06:10 · abajures acendem devagar: bom dia'],[390,'06:30 · cortinas da suíte abrindo'],[396,'06:36 · geladeira aberta: café'],[405,'06:45 · cooktop aceso'],[420,'07:00 · cortinas da sala abrindo'],[440,'07:20 · portão abrindo, você sai de carro'],[480,'08:00 · casa vazia, tudo apagado'],[540,'09:00 · cotações enviadas no WhatsApp'],[620,'🎙 “Felyx, cria o quarto do bebê.”'],[632,'✓ Quarto do bebê criado: berço, luz suave e babá eletrônica'],[720,'12:00 · casa em modo econômico'],[1000,'16:40 · portão abrindo, você chegou'],[1080,'18:00 · jardim e piscina acesos'],[1110,'18:30 · cena noite na sala'],[1140,'19:00 · geladeira aberta: jantar'],[1145,'19:05 · cooktop aceso'],[1180,'🎙 “Leva a cena Relax da sala para a cozinha.”'],[1192,'✓ Cena Relax agora mora na cozinha'],[1215,'20:15 · cinema: TV ligada, cortinas fechando'],[1280,'🎙 “Na cena Relax, liga a cascata e o LED da piscina.”'],[1292,'✓ Cena Relax atualizada: cascata e piscina incluídas'],[1300,'21:40 · abajures da suíte'],[1320,'22:00 · ar da suíte em 23°'],[1380,'23:00 · tudo apagado, portão trancado']];
const OVR={};
const st=(k,m)=>k in OVR?OVR[k]:S[k](m);
const fmt=m=>String(m/60|0).padStart(2,'0')+':'+String(m%60|0).padStart(2,'0');



/* ===== Casa 4D: comandos de voz e linha do tempo ===== */
const host=$('#house'),cvs=$('#h4d');
const sl=$('#tslider');let tMin=360,playing=true,inView=false;
const MAN={};let manPill=null,SC=null;
const AUTO=[[360,440,'06:00 · bom dia: cortinas abrem e o café vai pro fogo'],[440,540,'07:20 · portão abre e você sai de carro'],[540,620,'🎙 “Felyx, cria o quarto do bebê.”'],[620,780,'✓ Quarto do bebê criado'],[780,1000,'Casa vazia: modo econômico'],[1000,1120,'Você chegou: portão abre e a casa acende'],[1120,1180,'🎙 “Leva a cena Relax para a cozinha.”'],[1180,1230,'✓ Cena Relax agora mora na cozinha'],[1230,1280,'🎙 “Põe a cascata na cena Relax.”'],[1280,1330,'✓ Cascata e piscina na cena Relax'],[1330,1440,'Boa noite: casa apagada e trancada, ar da suíte em 23°'],[0,330,'Madrugada: só o jardim aceso e o ar da suíte'],[330,360,'05:30 · jardim apaga, a casa vai acordar']];
const babyOn=m=>'baby' in MAN?MAN.baby:m>=620;
const relaxOn=m=>!SC&&!('it' in OVR)&&m>=1080&&m<1400;
const relaxAt=m=>('relax' in MAN?MAN.relax:m>=1180)?'cozinha':'sala';
const cascOn=m=>'casc' in MAN?MAN.casc:(m>=1280&&m<1400);
/* cenas: o que cada toque faz na casa */
const SCN={
 bomdia:{t:420,casc:false,p:'Bom dia: cortinas abertas, luz suave e café no fogo',o:{cortina:true,cortinaS:true,abajur:true,quarto:true,cozinha:true,jantar:false,fogao:true,geladeira:false,sala:false,tv:false,luminaria:false,ar:false,externa:false,piscina:false,it:{sala:0,jantar:0,cozinha:1.6,quarto:1.2}}},
 alta:{night:1,p:'Luz alta: a casa inteira em 100%',o:{sala:true,cozinha:true,jantar:true,quarto:true,luminaria:true,abajur:true,it:{sala:3.6,jantar:2.6,cozinha:3,quarto:3}}},
 baixa:{night:1,p:'Luz baixa: tudo em 30%, clima de fim de noite',o:{sala:true,cozinha:true,jantar:true,quarto:true,luminaria:true,abajur:true,tv:false,it:{sala:.55,jantar:.45,cozinha:.4,quarto:.5}}},
 jantar:{t:1200,p:'Jantar: mesa em destaque e o resto da casa suave',o:{jantar:true,cozinha:true,sala:true,luminaria:false,tv:false,fogao:false,geladeira:false,quarto:false,abajur:false,cortinaS:false,it:{sala:.35,jantar:3,cozinha:.5,quarto:0}}},
 cinema:{t:1230,p:'Cinema: TV ligada, cortinas fechadas e luz baixinha',o:{tv:true,sala:true,luminaria:false,cortinaS:false,cortina:false,cozinha:false,jantar:false,fogao:false,geladeira:false,quarto:false,abajur:false,it:{sala:.18,jantar:0,cozinha:0,quarto:0}}},
 boanoite:{t:1350,casc:false,p:'Boa noite: tudo apagado, cortinas fechadas, portão trancado e ar em 23°',o:{sala:false,tv:false,luminaria:false,cozinha:false,jantar:false,fogao:false,geladeira:false,quarto:false,abajur:false,cortina:false,cortinaS:false,ar:true,externa:true,piscina:false,portao:false,carro:true,garagem:false,fogo:false,it:{sala:0,jantar:0,cozinha:0,quarto:0,garagem:0}}}
};
const TOG={
 cortinas:{get:()=>st('cortina',tMin)&&st('cortinaS',tMin),set:v=>{OVR.cortina=OVR.cortinaS=v},l:['Abrir cortinas','Fechar cortinas'],p:['Cortinas fechadas','Cortinas abertas']},
 cascata:{get:()=>cascOn(tMin),set:v=>{MAN.casc=v},l:['Ligar a cascata','Desligar a cascata'],p:['Cascata desligada','Cascata ligada']},
 tv:{get:()=>st('tv',tMin),set:v=>{OVR.tv=v},l:['Ligar a TV','Desligar a TV'],p:['TV desligada','TV ligada']},
 piscina:{night:1,get:()=>st('piscina',tMin),set:v=>{OVR.piscina=v},l:['Acender a piscina','Apagar a piscina'],p:['Luz da piscina apagada','Luz da piscina acesa']},
 carro:{get:()=>!st('carro',tMin),set:v=>{OVR.carro=!v;OVR.garagem=true},l:['Sair de carro','Chegar de carro'],p:['Você chegou: portão abre e a garagem acende','Portão abre, você sai e a casa se tranca']}
};
const isDay=()=>tMin>345&&tMin<1090;
function syncUI(){$('#thour').textContent=fmt(tMin);sl.value=Math.floor(tMin);const ev=$('#evt');
 let txt=null;if(manPill&&performance.now()<manPill.until)txt=manPill.text;else if(playing){const a=AUTO.find(([a,b])=>tMin>=a&&tMin<b);if(a)txt=a[2]}else{const e=EV.filter(([t])=>tMin>=t&&tMin<t+40).pop();if(e)txt=e[1]}
 if(txt){if(ev.textContent!==txt||ev.hidden){ev.hidden=false;ev.textContent=txt;ev.classList.toggle('voz',txt.startsWith('🎙'));ev.classList.toggle('feito',txt.startsWith('✓'))}}else ev.hidden=true;
 $$('.vchip').forEach(c=>{const k=c.dataset.sc,T=TOG[k];if(T){const t=T.l[+!!T.get()];if(c.textContent!==t)c.textContent=t}else c.classList.toggle('on',SC===k)})}
const pause=t=>{playing=false;$('#tplay').textContent='▶';$('#tmode').textContent=t};
const clearMan=()=>{Object.keys(OVR).forEach(k=>{delete OVR[k]});Object.keys(MAN).forEach(k=>{delete MAN[k]});manPill=null;SC=null};
sl.oninput=()=>{tMin=+sl.value;pause('VOCÊ NO CONTROLE');clearMan();syncUI()};
$('#tplay').onclick=e=>{playing=!playing;if(playing)clearMan();e.currentTarget.textContent=playing?'❚❚':'▶';$('#tmode').textContent=playing?'O DIA PASSANDO':'PAUSADO';syncUI()};
$$('.vchip').forEach(c=>c.onclick=()=>{const k=c.dataset.sc,s=SCN[k],T=TOG[k];pause('VOCÊ NO COMANDO');let txt;
 if(s){if(s.t!=null)tMin=s.t;else if(s.night&&isDay())tMin=1190;Object.assign(OVR,s.o);if('casc' in s)MAN.casc=s.casc;SC=k;txt=s.p}
 else{const cur=!!T.get();if(T.night&&!cur&&isDay())tMin=1190;T.set(!cur);SC=null;txt=T.p[+!cur]}
 manPill={text:'✓ '+txt,until:Infinity};syncUI()});
new IntersectionObserver(es=>{inView=es[0].isIntersecting},{threshold:.2}).observe(host);

if(!window.THREE||!(()=>{try{return !!document.createElement('canvas').getContext('webgl')}catch(e){return false}})()){host.insertAdjacentHTML('beforeend','<div class="nogl">Seu navegador não abriu a Casa 4D. Tente no Chrome ou no Safari atualizado.</div>');return}
const T=THREE;
function startMini(){const mcv=$('#mini4d');if(!mcv)return;const MW=200,MH=124;const st=(k,m)=>S[k](m);let hm=360,heroIn=true;
new IntersectionObserver(es=>{heroIn=es[0].isIntersecting},{threshold:.1}).observe(mcv);
const miniLabel=m=>{const e=EV.filter(([t])=>m>=t&&m<t+50).pop();const t=fmt(m)+' · '+(e?e[1].split('· ')[1]:'o dia passando');const el=$('#miniT');if(el.textContent!==t)el.textContent=t};
const ren=new T.WebGLRenderer({canvas:mcv,antialias:true,alpha:true});ren.setPixelRatio(Math.min(devicePixelRatio||1,2));
const scene=new T.Scene();
const cam=new T.PerspectiveCamera(32,1,.1,200);
ren.setSize(MW,MH,false);cam.aspect=MW/MH;cam.updateProjectionMatrix();cam.userData.d=23;

const M=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.05},o));
const box=(w,h,d,mat,x,y,z,p=scene)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m};
const hemi=new T.HemisphereLight(0x9fdcff,0x0b1a24,.5);scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});scene.add(sun);scene.add(sun.target);
// terreno
const ground=new T.Mesh(new T.BoxGeometry(22,.3,17),M(0x0f2a22));ground.position.set(0,-.3,1.2);ground.receiveShadow=true;scene.add(ground);
box(4.2,.05,4.5,M(0x2a3540),-3,-.12,6.2); // entrada de carro
const floorM=M(0x1d2c36),wallM=M(0xc9d6de,{roughness:.9}),wallLow=M(0xaebcc6),woodM=M(0x6b4a33),fabric=M(0x2b4a66),whiteM=M(0xe8eef2),darkM=M(0x1a1f24);
box(12,.15,8,floorM,0,-.08,0);
// pisos por cômodo
box(5.9,.02,4.9,M(0x3a2f28),-3,0,-1.5);box(5.9,.02,3.9,M(0x2c3a44),3,0,-2);box(5.9,.02,3.9,M(0xd5dde2),3,0,2);box(5.9,.02,2.9,M(0x39434c),-3,0,2.5);
const WH=2.2,LOW=.45,TH=.16;
// paredes altas (fundo e esquerda) e baixas (frente/direita, recorte de maquete)
box(12,WH,TH,wallM,0,WH/2,-4);box(TH,WH,8,wallM,-6,WH/2,0);
box(TH,LOW,8,wallLow,6,LOW/2,0);
box(4,LOW,TH,wallLow,-4,LOW/2,4);box(6,LOW,TH,wallLow,3,LOW/2,4);
// internas (meia altura)
const IH=1.1;box(TH,IH,8,wallLow,0,IH/2,0);box(5.9,IH,TH,wallLow,-3,IH/2,1);box(5.9,IH,TH,wallLow,3,IH/2,0);
// janela do quarto com cortinas (parede do fundo, x 1.5..4.5)
const glass=new T.Mesh(new T.PlaneGeometry(2.6,1.1),new T.MeshStandardMaterial({color:0x9fd8ff,emissive:0x1a4a66,transparent:true,opacity:.85}));glass.position.set(3,1.3,-3.91);scene.add(glass);
box(2.8,.08,.1,whiteM,3,.72,-3.88);box(2.8,.08,.1,whiteM,3,1.88,-3.88);
const curM=M(0x8fb7d6,{roughness:1});const curL=box(1.3,1.3,.06,curM,2.35,1.3,-3.82),curR=box(1.3,1.3,.06,curM,3.65,1.3,-3.82);
// QUARTO: cama, criado, ar-condicionado
box(2,.35,2.4,woodM,3,.2,-2.2);box(1.9,.18,2.3,whiteM,3,.46,-2.2);box(1.9,.12,.5,fabric,3,.6,-3.1);box(1.9,.06,1.3,fabric,3,.56,-1.6);
box(.5,.45,.5,woodM,1.4,.23,-3.4);
const acBody=box(1.4,.35,.32,whiteM,5.2,1.85,-3.78);const acSlot=box(1.2,.05,.05,darkM,5.2,1.7,-3.6);
const airM=new T.MeshBasicMaterial({color:0x7ff4ff,transparent:true,opacity:0});const air=[];for(let i=0;i<14;i++){const a=new T.Mesh(new T.BoxGeometry(.05,.05,.05),airM.clone());a.userData={o:Math.random()};scene.add(a);air.push(a)}
// SALA: sofá, rack, TV, tapete, mesa
box(2.8,.12,1.9,M(0x2f4f5f),-3,.07,-1.6);
box(2.6,.4,.9,M(0x41617a),-3,.25,-.3);box(2.6,.5,.25,M(0x41617a),-3,.55,.05);box(.25,.5,.9,M(0x41617a),-4.3,.4,-.3);box(.25,.5,.9,M(0x41617a),-1.7,.4,-.3);
box(2.6,.35,.5,woodM,-3,.2,-3.6);
const tvScr=new T.MeshStandardMaterial({color:0x05080b,emissive:0x000000});box(2,1.1,.06,darkM,-3,1.25,-3.9);const tv=new T.Mesh(new T.PlaneGeometry(1.85,.98),tvScr);tv.position.set(-3,1.25,-3.86);scene.add(tv);
box(.9,.3,.6,woodM,-3,.16,-1.7);
// planta
const pot=box(.35,.4,.35,M(0x6e5240),-5.5,.2,-3.5);const leaf=new T.Mesh(new T.SphereGeometry(.45,10,8),M(0x2f8a4f));leaf.position.set(-5.5,.85,-3.5);leaf.castShadow=true;scene.add(leaf);
// COZINHA: bancada, fogão com bocas, geladeira, mesa
box(.7,.9,3.6,M(0x8a96a0),5.55,.45,2);box(.75,.06,3.7,M(0x2a2f34),5.55,.92,2);
const stove=box(.72,.92,.9,M(0xd9dee2),5.55,.46,2.9);box(.74,.03,.9,darkM,5.55,.94,2.9);
const flameM=[];const burners=[];[[-.18,-.2],[.18,-.2],[-.18,.2],[.18,.2]].forEach(([dx,dz])=>{const mat=new T.MeshStandardMaterial({color:0x222222,emissive:0x000000});flameM.push(mat);const b=new T.Mesh(new T.CylinderGeometry(.11,.11,.03,16),mat);b.position.set(5.55+dx,.97,2.9+dz);scene.add(b);burners.push(b)});
const fl=[];for(let i=0;i<4;i++){const f=new T.Mesh(new T.ConeGeometry(.07,.18,8),new T.MeshBasicMaterial({color:0x4fb8ff,transparent:true,opacity:0}));f.position.copy(burners[i].position);f.position.y+=.1;scene.add(f);fl.push(f)}
box(.8,2,.75,whiteM,5.5,1,.55);
box(1.4,.06,1,woodM,2.6,.75,2.2);[[2.1,1.8],[3.1,1.8],[2.1,2.6],[3.1,2.6]].forEach(([x,z])=>box(.06,.75,.06,woodM,x,.38,z));
box(.45,.45,.45,woodM,1.8,.23,2.2);box(.45,.45,.45,woodM,3.4,.23,2.2);
// GARAGEM: carro e portão
const car=new T.Group();box(1.6,.45,2.8,M(0x1e6bd6,{metalness:.4,roughness:.4}),0,.35,0,car);box(1.4,.4,1.5,M(0x0e1b26,{metalness:.3}),0,.75,-.1,car);
[[-.75,.18,.9],[.75,.18,.9],[-.75,.18,-.9],[.75,.18,-.9]].forEach(([x,y,z])=>{const w=new T.Mesh(new T.CylinderGeometry(.2,.2,.15,14),darkM);w.rotation.z=Math.PI/2;w.position.set(x,y,z);car.add(w)});
car.position.set(-3,0,2.4);car.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(car);
const gate=new T.Group();for(let i=0;i<9;i++)box(.06,1.3,.06,M(0x9aa6ae,{metalness:.6,roughness:.4}),-1.8+i*.45,.65,0,gate);box(3.8,.08,.08,M(0x9aa6ae,{metalness:.6}),0,1.25,0,gate);box(3.8,.08,.08,M(0x9aa6ae,{metalness:.6}),0,.15,0,gate);gate.position.set(-3,0,4.05);scene.add(gate);
// luzes por cômodo
const mkLamp=(x,z,color)=>{const l=new T.PointLight(color,0,7,2);l.position.set(x,1.9,z);l.castShadow=false;scene.add(l);const bulb=new T.Mesh(new T.SphereGeometry(.09,10,8),new T.MeshBasicMaterial({color:0x333333}));bulb.position.set(x,2.0,z);scene.add(bulb);return {l,bulb}};
const L={sala:mkLamp(-3,-1.5,0xffc27a),quarto:mkLamp(3,-2,0xffd59a),cozinha:mkLamp(3,2,0xfff1d6),garagem:mkLamp(-3,2.5,0xe8f4ff)};
const ext=new T.PointLight(0xffb36b,0,6,2);ext.position.set(-1,1.6,4.8);scene.add(ext);
const acLight=new T.PointLight(0x5ff0ff,0,3,2);acLight.position.set(5.2,1.4,-3.3);scene.add(acLight);
const tvLight=new T.PointLight(0x5aa8ff,0,4,2);tvLight.position.set(-3,1.2,-3.2);scene.add(tvLight);
// céu
const sky=[[0,0x050b14],[300,0x0a1424],[390,0x6a4a6a],[480,0x5c9fd0],[720,0x7cc3ef],[1020,0x5c8fc0],[1110,0x8a4d48],[1200,0x101a30],[1440,0x050b14]];
const lerpC=(m)=>{for(let i=0;i<sky.length-1;i++){const [a,ca]=sky[i],[b,cb]=sky[i+1];if(m>=a&&m<=b){return new T.Color(ca).lerp(new T.Color(cb),(m-a)/(b-a))}}return new T.Color(0x050b14)};
let k=0,lastT=performance.now(),ang=0;const ease=(c,tgt,s)=>c+(tgt-c)*s;
function frame(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
 if(document.hidden)return;hm=(hm+dt*(RM?0:70))%1440;const m=hm;miniLabel(m);
 // sol
 const day=(m-360)/(1080-360),sunUp=day>0&&day<1;const sa=day*Math.PI;
 sun.position.set(Math.cos(sa)*14,Math.max(.5,Math.sin(sa)*14),6);sun.intensity=ease(sun.intensity,sunUp?Math.sin(sa)*1.25+.1:.05,.1);
 sun.color.set(sunUp&&(day<.15||day>.85)?0xffa36b:0xffffff);
 const sc=lerpC(m);hemi.intensity=ease(hemi.intensity,sunUp?.55:.18,.1);hemi.color.copy(sc).lerp(new T.Color(0xffffff),.4);
 mcv.style.background=`radial-gradient(90% 75% at 60% 0%,#${sc.getHexString()},#04090d 80%)`;
 for(const r in L){const on=st(r==='sala'?'sala':r,m),l=L[r];l.l.intensity=ease(l.l.intensity,on?2.2:0,.15);l.bulb.material.color.set(on?0xfff2c4:0x333333)}
 ext.intensity=ease(ext.intensity,st('externa',m)?1.6:0,.1);
 const tvOn=st('tv',m);tvScr.emissive.set(tvOn?new T.Color().setHSL((now/4000)%1*.2+.55,.7,.45):0x000000);tvLight.intensity=ease(tvLight.intensity,tvOn?1.2:0,.15);
 const fOn=st('fogao',m);flameM.forEach(f=>f.emissive.set(fOn?0xff5a1f:0x000000));fl.forEach((f,i)=>{f.material.opacity=ease(f.material.opacity,fOn?.85:0,.2);f.scale.y=1+.35*Math.sin(now/90+i*2)});
 const aOn=st('ar',m);acLight.intensity=ease(acLight.intensity,aOn?1.4:0,.1);acSlot.material.color.set(aOn?0x56e7ff:0x1a1f24);
 air.forEach(a=>{a.userData.o=(a.userData.o+dt*.6)%1;const o=a.userData.o;a.position.set(4.6+((a.id*37)%12)/10,1.62-o*1.2,-3.55+o*1.6);a.material.opacity=aOn?(1-o)*.8:0});
 const cOpen=st('cortina',m);curL.scale.x=ease(curL.scale.x,cOpen?.22:1,.08);curR.scale.x=curL.scale.x;curL.position.x=2.35-(1-curL.scale.x)*.6;curR.position.x=3.65+(1-curR.scale.x)*.6;
 glass.material.emissive.set(sunUp?0x3a8ac0:0x0a1a2a);
 const gOpen=st('portao',m);gate.position.x=ease(gate.position.x,gOpen?-6.9:-3,.06);
 const carIn=st('carro',m);car.position.z=ease(car.position.z,carIn?2.4:9,.04);car.visible=car.position.z<8.5;
 // câmera orbita devagar
 ang+=dt*.05;const d=cam.userData.d||28;cam.position.set(Math.sin(.75+Math.sin(ang)*.18)*d,d*.78,Math.cos(.75+Math.sin(ang)*.18)*d);cam.lookAt(0,.2,.6);
 ren.render(scene,cam);}
window.PalanteerCanvas.register(mcv,frame,{priority:()=>20});
}
startMini();
/* ===== Casa 4D grande: casa de arquiteto ===== */
const lin=c=>new T.Color(c).convertSRGBToLinear();
const rnd=(a,b)=>a+Math.random()*(b-a);
const ren=new T.WebGLRenderer({canvas:cvs,antialias:true,alpha:true});
ren.setPixelRatio(Math.min(devicePixelRatio||1,2));ren.shadowMap.enabled=true;ren.shadowMap.type=T.PCFSoftShadowMap;
ren.toneMapping=T.ACESFilmicToneMapping;ren.toneMappingExposure=1.05;ren.outputEncoding=T.sRGBEncoding;
const scene=new T.Scene();
const cam=new T.PerspectiveCamera(30,1,.1,300);
function rs(){const r=host.getBoundingClientRect();ren.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();cam.userData.d=Math.max(29,Math.min(52,38/cam.aspect))}
rs();addEventListener('resize',rs);

/* texturas procedurais */
function ctex(w,h,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t}
const woodT=(h,s,l,rx,ry,rows=8)=>ctex(512,512,(g,w,H)=>{const ph=H/rows;for(let i=0;i<rows;i++){g.fillStyle=`hsl(${h},${s}%,${l+rnd(-6,6)}%)`;g.fillRect(0,i*ph,w,ph);g.lineWidth=1;for(let k=0;k<9;k++){g.strokeStyle=`rgba(30,15,5,${rnd(.05,.2)})`;g.beginPath();const y0=i*ph+rnd(2,ph-2),f=rnd(40,110);g.moveTo(0,y0);for(let x=0;x<=w;x+=16)g.lineTo(x,y0+Math.sin(x/f+k)*1.6);g.stroke()}g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,i*ph,w,1.5);g.fillRect(rnd(0,w),i*ph,1.5,ph)}},rx,ry);
const marbleT=(base,vein,rx=1,ry=1)=>ctex(512,512,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<16;i++){g.strokeStyle=vein+rnd(.06,.3)+')';g.lineWidth=rnd(.4,2.4);g.beginPath();let x=rnd(0,w),y=rnd(0,h);g.moveTo(x,y);for(let k=0;k<5;k++){const nx=x+rnd(-170,170),ny=y+rnd(-170,170);g.bezierCurveTo(x+rnd(-90,90),y+rnd(-90,90),nx+rnd(-90,90),ny+rnd(-90,90),nx,ny);x=nx;y=ny}g.stroke()}},rx,ry);
const noiseT=(base,amt,rx,ry,size=256)=>ctex(size,size,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const n=rnd(-amt,amt);d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0)},rx,ry);
const tileT=(base,line,rx,ry)=>ctex(512,512,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const n=rnd(-5,5);d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0);g.strokeStyle=line;g.lineWidth=2;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*w/2,0);g.lineTo(i*w/2,h);g.stroke();g.beginPath();g.moveTo(0,i*h/2);g.lineTo(w,i*h/2);g.stroke()}},rx,ry);
const foldT=(c1,c2)=>ctex(256,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);for(let i=0;i<=12;i++)gr.addColorStop(i/12,i%2?c1:c2);g.fillStyle=gr;g.fillRect(0,0,w,h)},3,1);
const rugT=(base,border)=>ctex(512,512,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const n=rnd(-9,9);d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0);g.strokeStyle=border;g.lineWidth=10;g.strokeRect(26,26,w-52,h-52);g.lineWidth=2;g.strokeRect(44,44,w-88,h-88)});

const MATS=[];
const std=(c,o={})=>{const m=new T.MeshStandardMaterial(Object.assign({color:lin(c),roughness:.7,metalness:0},o));MATS.push(m);return m};
const phys=(c,o={})=>{const m=new T.MeshPhysicalMaterial(Object.assign({color:lin(c),roughness:.3,metalness:0},o));MATS.push(m);return m};
const tex=(map,o={})=>{const m=new T.MeshStandardMaterial(Object.assign({map,roughness:.6,metalness:0},o));MATS.push(m);return m};
const glow=c=>new T.MeshBasicMaterial({color:lin(c)});

const shadowy=m=>{m.castShadow=true;m.receiveShadow=true;return m};
const box=(w,h,d,mat,x,y,z,p=scene)=>{const m=shadowy(new T.Mesh(new T.BoxGeometry(w,h,d),mat));m.position.set(x,y,z);p.add(m);return m};
const cyl=(rt,rb,h,mat,x,y,z,p=scene,seg=24,open=false)=>{const m=shadowy(new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg,1,open),mat));m.position.set(x,y,z);p.add(m);return m};
const sph=(r,mat,x,y,z,p=scene)=>{const m=shadowy(new T.Mesh(new T.SphereGeometry(r,20,14),mat));m.position.set(x,y,z);p.add(m);return m};
function rrShape(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;r=Math.max(.001,Math.min(r,w/2-.001,h/2-.001));s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function rbox(w,h,d,r,mat,x,y,z,p=scene){const b=Math.min(.04,d/4,w/4,h/4);const g=new T.ExtrudeGeometry(rrShape(w-2*b,h-2*b,r),{depth:Math.max(.002,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:6});g.translate(0,0,-Math.max(.002,d-2*b)/2);const m=shadowy(new T.Mesh(g,mat));m.position.set(x,y,z);p.add(m);return m}

/* materiais da casa */
const M={
 wall:std(0xe9e4dc,{roughness:.95}),wallLow:std(0xd6d0c6,{roughness:.95}),concrete:tex(noiseT('#9a9a96',14,4,4)),
 oak:tex(woodT(30,38,52,3,2)),oakS:tex(woodT(28,35,40,2,2)),walnut:tex(woodT(22,35,24,1,1,6)),walnutS:std(0x4a3222,{roughness:.55}),
 marble:tex(marbleT('#f1efea','rgba(110,110,115,'),{roughness:.18}),marbleDark:tex(marbleT('#1d1f22','rgba(200,200,205,'),{roughness:.2}),
 tile:tex(tileT('#d9d6cf','rgba(120,115,105,.35)',5,2),{roughness:.35}),garage:tex(noiseT('#6d7074',10,3,3),{roughness:.35,metalness:.1}),
 grass:tex(noiseT('#1c3d20',12,10,8),{roughness:1}),paver:tex(tileT('#8f8a80','rgba(40,40,40,.5)',3,5),{roughness:.9}),deck:tex(woodT(25,30,38,4,6,10),{roughness:.8}),
 fabric:std(0xbdb6aa,{roughness:1}),fabricDark:std(0x5b6670,{roughness:1}),linen:std(0xe9e6df,{roughness:1}),white:std(0xf4f5f6,{roughness:.5}),
 leather:std(0x8a4b2a,{roughness:.55}),black:std(0x15171a,{roughness:.4}),blackGloss:std(0x0b0c0e,{roughness:.12,metalness:.3}),
 brass:std(0xc9a25e,{roughness:.3,metalness:1}),steel:std(0xc8cdd2,{roughness:.25,metalness:1}),chrome:std(0xe6eaee,{roughness:.08,metalness:1}),
 green:std(0x1f5a30,{roughness:.9}),green2:std(0x2c6f3d,{roughness:.9}),pot:std(0x8b8780,{roughness:.9}),lacquer:std(0x2d3238,{roughness:.35}),
 headboard:std(0x8f8578,{roughness:1}),rugL:tex(rugT('#cfc6b6','#8a7c66')),rugQ:tex(rugT('#6f7780','#b7aa92')),
 water:phys(0x2fb7d6,{roughness:.05,metalness:.1,transparent:true,opacity:.88,clearcoat:1}),
 glass:phys(0xa9d8f0,{roughness:.05,metalness:0,transparent:true,opacity:.28}),
 carPaint:phys(0x0a8fd0,{metalness:.7,roughness:.3,clearcoat:1,clearcoatRoughness:.04}),carGlass:phys(0x0c1118,{roughness:.05,metalness:.6,clearcoat:1})
};
const cozinhaLed=[];const ledM=c=>{const m=new T.MeshBasicMaterial({color:lin(0x111111)});m.userData.on=lin(c);return m};

/* mapa de ambiente para reflexos (carro, metais, mármore) */
{const pm=new T.PMREMGenerator(ren);const es=new T.Scene();const g=new T.SphereGeometry(50,32,16);const cols=[];const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const y=p.getY(i)/50;const c=new T.Color().lerpColors(new T.Color(0x3a3f45),new T.Color(0xcfe6ff),Math.max(0,y*.8+.25));cols.push(c.r,c.g,c.b)}
 g.setAttribute('color',new T.Float32BufferAttribute(cols,3));es.add(new T.Mesh(g,new T.MeshBasicMaterial({side:T.BackSide,vertexColors:true})));
 [[0,30,0,30,1,30],[25,10,0,1,10,20],[-25,12,8,1,8,16],[0,12,-25,20,8,1]].forEach(([x,y,z,w,h,d])=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:0xffffff}));m.position.set(x,y,z);es.add(m)});
 scene.environment=pm.fromScene(es,.04).texture}

/* luzes */
const hemi=new T.HemisphereLight(0xcfe6ff,0x2a2520,.55);scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,1.4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;
Object.assign(sun.shadow.camera,{left:-15,right:15,top:13,bottom:-13,near:1,far:60});sun.target.position.set(1,0,0);scene.add(sun,sun.target);
const PL=(c,x,y,z,dist)=>{const l=new T.PointLight(lin(c),0,dist,2);l.position.set(x,y,z);scene.add(l);return l};

/* terreno, piscina e paisagismo */
const ground=box(40,.3,32,M.grass,1,-.32,2);
box(4.9,.06,6,M.paver,-5.25,-.15,8.1);box(4.9,.06,6.9,M.paver,-5.25,-.15,14.55);           // entrada da garagem
box(1.4,.06,4.5,M.paver,1.2,-.15,7.4);            // caminho social
box(5.2,.1,8.2,M.deck,10.9,-.12,-1);              // deck
box(3.5,.05,5.8,M.water,10.9,-.05,-1.3);          // água
[[10.9,-4.25,3.7,.12,.22],[10.9,1.65,3.7,.12,.22],[9.1,-1.3,.12,.12,6.1],[12.7,-1.3,.12,.12,6.1]].forEach(([x,z,w,h,d])=>box(w,h,d,M.white,x,0,z));
const lounger=(x,z)=>{rbox(.7,.14,1.8,.04,M.white,x,.12,z);const b=rbox(.7,.1,.8,.04,M.white,x,.38,z-.75);b.rotation.x=.7;rbox(.6,.06,1.2,.03,M.linen,x,.22,z+.2)};
lounger(13.1,-3.3);lounger(13.1,-1.2);
const tree=(x,z,s=1)=>{cyl(.1*s,.14*s,1.6*s,M.walnutS,x,.65*s,z);[[0,2.1,0,.9],[.5,1.8,.2,.65],[-.45,1.85,-.2,.7],[.1,2.6,-.1,.6],[-.2,1.6,.45,.55]].forEach(([dx,dy,dz,r],i)=>sph(r*s,i%2?M.green:M.green2,x+dx*s,dy*s,z+dz*s))};
tree(-10.5,-4,1.2);tree(9.5,-6.5,1.1);tree(-10,6.5,1);tree(4.5,-7.2,.9);tree(15.6,-7,1.1);tree(-3,-7.3,.8);
rbox(9.6,.5,.6,.2,M.green,3.8,.15,6.2);rbox(.7,.7,4.2,.25,M.green,-9.2,.25,2.5);
const bollards=[];[[-8.1,6.2],[-8.1,8.6],[-2.4,6.2],[-2.4,8.6],[1.2,6],[1.2,9]].forEach(([x,z])=>{cyl(.08,.08,.5,M.black,x,.1,z);const g=cyl(.07,.07,.08,ledM(0xffd59a),x,.38,z);bollards.push(g.material)});
const extL=PL(0xffc27a,-5.25,1.6,6.4,8),poolL=PL(0x4fe6ff,10.9,.4,-1.3,8);
// cascata: muro de pedra, lâmina d'água e LED
const stoneM=tex(ctex(256,256,(g,w,h)=>{g.fillStyle='#3a3d40';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<5;c++){g.fillStyle=`hsl(210,5%,${rnd(20,34)}%)`;g.fillRect(c*w/4-(r%2)*w/8+1,r*h/8+1,w/4-2,h/8-2)}},2,1),{roughness:.85});
box(4.3,1.9,.4,stoneM,10.9,.95,-4.75);box(4.5,.08,.5,M.marbleDark,10.9,1.94,-4.75);box(2.6,.06,.3,M.steel,10.9,1.55,-4.5);
const fallT=ctex(128,256,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<70;i++){const x=rnd(0,w),l=rnd(40,200),y=rnd(0,h);const gr=g.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,`rgba(220,250,255,${rnd(.3,.9)})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x,y,rnd(1,4),l);g.fillRect(x,y-h,rnd(1,4),l)}},1,1);
const fallM=new T.MeshBasicMaterial({map:fallT,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});const fall=new T.Mesh(new T.PlaneGeometry(2.5,1.55),fallM);fall.position.set(10.9,.76,-4.36);scene.add(fall);
const cascLed=box(4.3,.03,.03,ledM(0x5dfdff),10.9,1.86,-4.53);cascLed.castShadow=false;const cascL=PL(0x5dfdff,10.9,1.2,-3.9,5);
const splash=[];for(let i=0;i<22;i++){const a=new T.Mesh(new T.SphereGeometry(.035,6,4),new T.MeshBasicMaterial({color:0xdffaff,transparent:true,opacity:0}));a.userData={o:Math.random(),x:rnd(-1.2,1.2),z:rnd(0,.5)};scene.add(a);splash.push(a)}
const poolLed=[];[[9.2,-1.3,.03,5.6],[12.6,-1.3,.03,5.6]].forEach(([x,z,w,d])=>{const b=box(w,.03,d,ledM(0x5dfdff),x,-.02,z);b.castShadow=false;poolLed.push(b.material)});
// lounge com pergolado e lareira
box(5.2,.08,4.6,M.paver,11.2,-.13,6.1);
[[9,4.1],[13.4,4.1],[9,8.1],[13.4,8.1]].forEach(([x,z])=>box(.14,2.5,.14,M.walnutS,x,1.25,z));box(4.7,.14,.14,M.walnutS,11.2,2.5,4.1);box(4.7,.14,.14,M.walnutS,11.2,2.5,8.1);for(let i=0;i<10;i++)box(.07,.1,4.3,M.walnutS,9.2+i*.445,2.62,6.1);
rbox(2.8,.36,.9,.06,M.fabric,11.2,.1,7.6);rbox(2.8,.5,.22,.08,M.fabric,11.2,.45,7.95);rbox(.9,.36,2.0,.06,M.fabric,13,.1,6.6);rbox(.22,.5,2.0,.08,M.fabric,13.34,.45,6.6);
[[10.4,7.55],[11.2,7.55],[12,7.55]].forEach(([x,z])=>rbox(.75,.14,.75,.06,M.linen,x,.35,z));rbox(.75,.14,1.7,.06,M.linen,12.95,.35,6.5);
cyl(.55,.6,.34,M.concrete,11,.1,6.1);cyl(.42,.42,.04,M.black,11,.27,6.1);
const fire=[];for(let i=0;i<7;i++){const f=new T.Mesh(new T.ConeGeometry(.09,.36,7),new T.MeshBasicMaterial({color:i%2?0xffb347:0xff6a1f,transparent:true,opacity:0}));f.position.set(11+rnd(-.2,.2),.46,6.1+rnd(-.2,.2));scene.add(f);fire.push(f)}
const fireL=PL(0xff8a3a,11,.9,6.1,6);
const pergLed=box(4.5,.02,.02,ledM(0xffd59a),11.2,2.42,8.02);pergLed.castShadow=false;
// palmeiras
const palm=(x,z,h=3.2)=>{const c=new T.QuadraticBezierCurve3(new T.Vector3(x,-.1,z),new T.Vector3(x+.35,h*.5,z),new T.Vector3(x+.15,h,z+.1));scene.add(shadowy(new T.Mesh(new T.TubeGeometry(c,16,.11,8,false),M.walnutS)));
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2,l=sph(.5,i%2?M.green:M.green2,x+.15+Math.cos(a)*.75,h-.12,z+.1+Math.sin(a)*.75);l.scale.set(1.9,.12,.5);l.rotation.y=-a;l.rotation.z=-.35}};
palm(14.3,-4.6,3.6);palm(15.3,-1.5,3);palm(8.6,-6.3,3.3);
// muro do terreno com arandelas
box(30,1.5,.25,M.wallLow,2,.6,-8.6);box(.25,1.5,17.5,M.wallLow,16.8,.6,0);
const muroL=[];[-8,-2,4,10].forEach(x=>{const b=box(.3,.06,.08,ledM(0xffd59a),x,1.1,-8.44);b.castShadow=false;muroL.push(b.material)});const muroPL=[PL(0xffc27a,-5,1,-7.9,6),PL(0xffc27a,7,1,-7.9,6)];

/* estrutura */
const H=2.7,LOW=.5,IH=1.05;
box(16.4,.3,10.4,M.concrete,0,-.15,0);
box(9,.02,5.5,M.oak,-3.5,.01,-2.25);           // sala
box(7,.02,5.5,M.oakS,4.5,.01,-2.25);           // suíte
box(10.5,.02,4.5,M.tile,2.75,.01,2.75);        // jantar e cozinha
box(5.5,.02,4.5,M.garage,-5.25,.01,2.75);      // garagem
box(16.4,H,.2,M.wall,0,H/2,-5.1);box(.2,H,10.4,M.wall,-8.1,H/2,0);
box(.2,LOW,10.4,M.wallLow,8.1,LOW/2,0);box(10.6,LOW,.2,M.wallLow,2.7,LOW/2,5.1);box(.3,LOW,.2,M.wallLow,-7.95,LOW/2,5.1);
box(16.4,.06,.26,M.lacquer,0,H+.03,-5.1);box(.26,.06,10.4,M.lacquer,-8.1,H+.03,0);   // pingadeira
box(.14,IH,4.3,M.wallLow,1,IH/2,-2.85);box(6,IH,.14,M.wallLow,5,IH/2,.5);box(.14,IH,4.5,M.wallLow,-2.5,IH/2,2.75);box(5.5,IH,.14,M.wallLow,-5.25,IH/2,.5);
/* janelas com cortinas */
const viewT=ctex(256,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#8fcbff');gr.addColorStop(.66,'#eaf7ff');gr.addColorStop(.67,'#6a9a63');gr.addColorStop(1,'#3f6f42');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.9)';[[56,58,36],[96,48,26],[176,92,32],[212,84,22]].forEach(([x,y,r])=>{g.beginPath();g.ellipse(x,y,r,r*.42,0,0,7);g.fill()});g.fillStyle='#2f5a34';[[40,176,30],[120,182,40],[210,174,34]].forEach(([x,y,r])=>{g.beginPath();g.arc(x,y,r,0,7);g.fill()})});
const sunT=ctex(128,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,236,190,.95)');gr.addColorStop(.55,'rgba(255,226,170,.5)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.clearRect(w/2-3,0,6,h);g.clearRect(0,0,4,h);g.clearRect(w-4,0,4,h)});
const curtM=tex(foldT('#c2b096','#8c7a62'),{roughness:1,side:T.DoubleSide});
function win(x,z,w,h,y,rot){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);
 const sky=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:viewT,color:0xffffff}));g.add(sky);
 box(w+.16,.08,.12,M.black,0,h/2+.04,.04,g);box(w+.16,.08,.12,M.black,0,-h/2-.04,.04,g);box(.08,h,.12,M.black,-w/2-.04,0,.04,g);box(.08,h,.12,M.black,w/2+.04,0,.04,g);
 const n=Math.max(2,Math.round(w/1.0));for(let k=1;k<n;k++)box(.045,h,.07,M.black,-w/2+k*w/n,0,.04,g);
 const gl=new T.Mesh(new T.PlaneGeometry(w,h),M.glass);gl.position.z=.02;g.add(gl);
 box(w+.9,.07,.1,M.black,0,h/2+.2,.24,g);
 const ch=y+h/2+.14,cw=w/2+.34;const L=box(cw,ch,.07,curtM,-w/4,ch/2-y+.02,.22,g),R=box(cw,ch,.07,curtM,w/4,ch/2-y+.02,.22,g);
 const patch=new T.Mesh(new T.PlaneGeometry(w*.92,2.4),new T.MeshBasicMaterial({map:sunT,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));patch.rotation.x=-Math.PI/2;patch.position.set(0,-y+.05,1.45);g.add(patch);
 return {sky,L,R,w,cw,patch}}
const winQ=win(7.05,-4.99,1.7,2.2,1.2,0),winS=win(-7.99,-2.3,3.2,2.2,1.2,Math.PI/2),winS2=win(-.45,-4.99,1.9,2.2,1.2,0);

/* ---------- SALA AMPLA ---------- */
box(4.2,.015,3.1,M.rugL,-4.3,.025,-2.4);
// painel ripado + TV + rack suspenso + LED
box(5.2,2.66,.04,M.walnut,-4.3,1.33,-4.98);for(let i=0;i<26;i++)box(.07,2.62,.05,M.walnutS,-6.85+i*.2,1.33,-4.93);
const ledTV=box(5.2,.025,.025,ledM(0xffd7a0),-4.3,2.64,-4.9);ledTV.castShadow=false;
box(2.6,1.48,.05,M.blackGloss,-4.3,1.48,-4.88);const tvScr=new T.MeshStandardMaterial({color:0x020304,emissive:0,roughness:.2});const tv=new T.Mesh(new T.PlaneGeometry(2.5,1.4),tvScr);tv.position.set(-4.3,1.48,-4.85);scene.add(tv);
rbox(3.4,.34,.46,.02,M.lacquer,-4.3,.5,-4.74);const ledRack=box(3.3,.02,.02,ledM(0xffd7a0),-4.3,.32,-4.62);ledRack.castShadow=false;
[[-5.6,.72,-4.75],[-3.2,.72,-4.75]].forEach(([x,y,z],i)=>{cyl(.08,.06,.26+i*.12,i?M.brass:M.white,x,y+.06*i,z)});
// sofá em L
const sofa=M.fabric;rbox(3.6,.38,1.05,.06,sofa,-4.5,.2,-.95);rbox(3.6,.55,.26,.08,sofa,-4.5,.6,-.52);rbox(.26,.55,1.05,.08,sofa,-6.42,.42,-.95);
rbox(1.05,.38,2.1,.06,sofa,-2.2,.2,-1.48);rbox(.26,.55,2.1,.08,sofa,-1.6,.42,-1.48);
[-5.7,-4.6,-3.5].forEach(x=>{rbox(1.05,.17,.95,.07,M.linen,x,.47,-1.0);rbox(1.0,.46,.2,.08,M.linen,x,.8,-.72)});rbox(.98,.17,1.95,.07,M.linen,-2.2,.47,-1.5);
[[-6.0,-.85,.3,M.leather],[-5.4,-.85,-.2,M.fabricDark],[-2.5,-.85,.15,M.leather]].forEach(([x,z,r,m])=>{const p=rbox(.46,.42,.13,.06,m,x,.85,z);p.rotation.z=r;p.rotation.x=-.25});
// mesa de centro em mármore + decoração
cyl(.62,.62,.05,M.marble,-4.2,.4,-2.55);cyl(.3,.38,.36,M.walnutS,-4.2,.19,-2.55);cyl(.36,.36,.04,M.marbleDark,-3.25,.32,-2.2);cyl(.22,.26,.3,M.walnutS,-3.25,.15,-2.2);
box(.32,.04,.24,M.black,-4.4,.45,-2.5);box(.3,.03,.22,M.white,-4.4,.485,-2.5);sph(.09,M.brass,-3.95,.5,-2.65);cyl(.07,.05,.2,M.white,-4.05,.52,-2.35);
// poltronas de couro
const armchair=(x,z,r)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=r;scene.add(g);rbox(.95,.18,.85,.08,M.leather,0,.38,0,g);rbox(.95,.55,.16,.08,M.leather,0,.7,-.36,g);rbox(.14,.32,.8,.06,M.leather,-.43,.55,0,g);rbox(.14,.32,.8,.06,M.leather,.43,.55,0,g);[[-.4,-.35],[.4,-.35],[-.4,.35],[.4,.35]].forEach(([a,b])=>cyl(.02,.02,.3,M.brass,a,.15,b,g))};
armchair(-6.7,-3.0,Math.PI/2.6);armchair(-6.7,-1.95,Math.PI/1.9);
// luminária de arco
cyl(.26,.26,.08,M.marble,-7.2,.04,-.6);const arc=new T.QuadraticBezierCurve3(new T.Vector3(-7.2,.08,-.6),new T.Vector3(-7.2,2.9,-.6),new T.Vector3(-5.1,2.05,-2.2));
scene.add(shadowy(new T.Mesh(new T.TubeGeometry(arc,40,.022,8,false),M.steel)));
const domeM=std(0xd7d2c8,{roughness:.4,metalness:.6,side:T.DoubleSide});const dome=new T.Mesh(new T.SphereGeometry(.26,24,12,0,Math.PI*2,0,Math.PI/2),domeM);dome.position.set(-5.1,1.92,-2.2);dome.castShadow=true;scene.add(dome);
const domeIn=sph(.08,ledM(0xffe2b0),-5.1,1.88,-2.2);domeIn.castShadow=false;
// plantas grandes
const plant=(x,z,s=1)=>{cyl(.24*s,.2*s,.5*s,M.pot,x,.25*s,z);for(let i=0;i<9;i++){const a=i/9*Math.PI*2,h=(.7+Math.random()*.9)*s,l=sph(.2*s,i%2?M.green:M.green2,x+Math.cos(a)*.22*s,.5*s+h,z+Math.sin(a)*.22*s);l.scale.set(1,1.6,.5);l.rotation.y=a}cyl(.02,.02,1.2*s,M.walnutS,x,.9*s,z)};
plant(-7.5,-4.55,1.1);
// aparador com arte, luminária e objetos
rbox(.44,.56,2.3,.02,M.walnut,.68,.4,-2.7);box(.48,.03,2.34,M.marble,.68,.7,-2.7);[-3.7,-1.7].forEach(z=>{box(.03,.12,.03,M.brass,.52,.06,z);box(.03,.12,.03,M.brass,.84,.06,z)});
const ledAp=box(.02,.02,2.2,ledM(0xffd7a0),.47,.11,-2.7);ledAp.castShadow=false;
cyl(.05,.08,.34,M.brass,.68,.89,-1.85);{const sh=new T.Mesh(new T.CylinderGeometry(.13,.18,.24,24,1,true),new T.MeshStandardMaterial({color:lin(0xf3e6cc),emissive:0x3a2a12,side:T.DoubleSide,roughness:.9}));sh.position.set(.68,1.16,-1.85);scene.add(sh)}
box(.26,.04,.34,M.black,.66,.735,-2.35);box(.24,.035,.3,M.white,.66,.772,-2.35);box(.2,.03,.28,M.leather,.66,.805,-2.36);sph(.07,M.brass,.66,.89,-2.36);
cyl(.1,.07,.3,M.white,.68,.865,-3.62);[[0,0],[.06,.05],[-.05,.04],[.02,-.06]].forEach(([dx,dz],i)=>{const l=sph(.09,i%2?M.green:M.green2,.68+dx,1.1+i*.05,-3.62+dz);l.scale.set(.6,1.5,.6)});
// pufes
[[-3.25,-3.6,.3],[-2.6,-3.3,.26]].forEach(([x,z,r])=>{const p=sph(r,M.linen,x,r*.62,z);p.scale.y=.62});
// manta no sofá
{const m=rbox(.5,.05,1.0,.02,M.fabricDark,-2.2,.58,-2.1);m.rotation.z=.04}

/* ---------- JANTAR ---------- */
const guatT=ctex(512,512,(g,w,h)=>{g.fillStyle='#0c3325';g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.fillStyle=`rgba(${rnd(8,36)|0},${rnd(70,125)|0},${rnd(48,86)|0},${rnd(.1,.34)})`;g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),rnd(18,90),rnd(8,38),rnd(0,3.1),0,7);g.fill()}
 const th0=rnd(.5,.9);for(let i=0;i<36;i++){g.strokeStyle=`rgba(${i%3?'226,244,232':'140,205,170'},${rnd(.12,.55)})`;g.lineWidth=rnd(.4,i%7?1.5:3);g.beginPath();let x=rnd(-60,w),y=rnd(-60,h),a=th0+rnd(-.35,.35);g.moveTo(x,y);for(let k=0;k<7;k++){a+=rnd(-.4,.4);const l=rnd(40,110),nx=x+Math.cos(a)*l,ny=y+Math.sin(a)*l;g.quadraticCurveTo(x+Math.cos(a+rnd(-.5,.5))*l*.5,y+Math.sin(a+rnd(-.5,.5))*l*.5,nx,ny);x=nx;y=ny}g.stroke()}},.36,.36);
const guat=new T.MeshPhysicalMaterial({map:guatT,roughness:.14,metalness:0,clearcoat:1,clearcoatRoughness:.08});MATS.push(guat);
const bronze=std(0x3b2f24,{roughness:.38,metalness:.85}),boucle=tex(noiseT('#ece5d8',9,2,2),{roughness:1}),rugJ=tex(noiseT('#7f796c',11,3,3),{roughness:1});
const JX=-.65,JZ=2.75;
{const r=cyl(1,1,.014,rugJ,JX,.03,JZ,scene,56);r.scale.set(1.75,1,1.5);r.castShadow=false;
 const pts=[[-1.32,-.08],[-1.16,-.47],[-.62,-.6],[-.02,-.5],[.6,-.6],[1.14,-.46],[1.33,.02],[1.1,.5],[.5,.62],[-.1,.52],[-.7,.6],[-1.16,.4]].map(([x,y])=>new T.Vector3(x,y,0));
 const sh=new T.Shape(new T.CatmullRomCurve3(pts,true,'catmullrom',.6).getPoints(96).map(p=>new T.Vector2(p.x,p.y)));
 const g=new T.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:3,curveSegments:24});g.rotateX(-Math.PI/2);
 const top=shadowy(new T.Mesh(g,guat));top.position.set(JX,.735,JZ);scene.add(top);
 [[-.62,.03,.3,.38],[.56,-.04,.22,.3]].forEach(([dx,dz,rt,rb])=>{cyl(rt,rb,.7,bronze,JX+dx,.37,JZ+dz,scene,18);cyl(rb+.03,rb+.05,.03,bronze,JX+dx,.035,JZ+dz,scene,24)})}
const backG=(()=>{const s=new T.Shape(),a0=-.42,a1=Math.PI+.42;s.absarc(0,0,.34,a0,a1,false);s.absarc(0,0,.26,a1,a0,true);const g=new T.ExtrudeGeometry(s,{depth:.36,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:3,curveSegments:22});g.rotateX(-Math.PI/2);return g})();
const chair=(x,z,r,mat=boucle,sc=1)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=r;g.scale.setScalar(sc);scene.add(g);
 const b=shadowy(new T.Mesh(backG,mat));b.position.y=.46;g.add(b);
 cyl(.3,.27,.15,mat,0,.42,0,g,28);const c=sph(.27,mat,0,.5,.01,g);c.scale.y=.26;
 cyl(.035,.035,.3,bronze,0,.2,0,g,12);cyl(.2,.23,.03,bronze,0,.03,0,g,24)};
[-.88,0,.88].forEach(dx=>{chair(JX+dx,JZ-.9,0);chair(JX+dx,JZ+.9,Math.PI)});
// canto de conversa na sala: poltronas giratórias em veludo verde
{const velvet=std(0x1f4a3a,{roughness:.82});const r=cyl(1,1,.014,rugJ,-.5,.028,-2.35,scene,48);r.scale.set(1.25,1,1.6);r.castShadow=false;
 chair(-.8,-1.4,2.785,velvet,1.3);chair(-.15,-3.3,-.356,velvet,1.3);
 cyl(.26,.26,.03,M.marbleDark,-.5,.5,-2.35);cyl(.02,.02,.48,M.brass,-.5,.25,-2.35);cyl(.15,.15,.02,M.brass,-.5,.03,-2.35);cyl(.05,.04,.16,M.white,-.5,.6,-2.3)}
// pendente em anel
[[.5,0],[-.25,.433],[-.25,-.433]].forEach(([dx,dz])=>cyl(.006,.006,.9,M.black,JX+dx,2.25,JZ+dz));
{const ring=new T.Mesh(new T.TorusGeometry(.5,.03,10,56),M.brass);ring.rotation.x=Math.PI/2;ring.position.set(JX,1.8,JZ);ring.castShadow=true;scene.add(ring)}
const ledJ=new T.Mesh(new T.TorusGeometry(.5,.018,8,56),ledM(0xffe0b0));ledJ.rotation.x=Math.PI/2;ledJ.position.set(JX,1.772,JZ);scene.add(ledJ);
// centro de mesa
cyl(.2,.12,.07,M.brass,JX-.1,.83,JZ);cyl(.07,.1,.34,M.white,JX+.5,.96,JZ-.05);sph(.09,M.white,JX+.5,1.17,JZ-.05).scale.set(1,.7,1);

/* ---------- COZINHA GOURMET ---------- */
box(5.2,.88,.62,M.lacquer,4.4,.44,.86);box(5.25,.05,.66,M.marble,4.4,.905,.86);box(.55,.02,.4,M.steel,3.4,.935,.86);
{const c=new T.CatmullRomCurve3([new T.Vector3(3.4,.93,.62),new T.Vector3(3.4,1.35,.62),new T.Vector3(3.4,1.42,.82),new T.Vector3(3.4,1.25,.9)]);scene.add(shadowy(new T.Mesh(new T.TubeGeometry(c,24,.018,8,false),M.chrome)))}
// geladeira de coluna (porta anima)
box(1.0,2.4,.9,M.steel,7.45,1.2,.95);const fInt=box(.86,2.1,.04,new T.MeshBasicMaterial({color:lin(0x1a1d20)}),7.45,1.15,1.37);fInt.castShadow=false;
[.6,1.1,1.6].forEach(y=>box(.84,.02,.3,M.glass,7.45,y,1.25));
const fDoor=new T.Group();fDoor.position.set(7.93,0,1.42);scene.add(fDoor);box(.96,2.3,.06,M.steel,-.48,1.17,0,fDoor);box(.03,1.2,.04,M.black,-.88,1.2,.05,fDoor);
const fLight=PL(0xe6f4ff,7.4,1.2,1.6,2.6);
// ilha com cascata de mármore e cooktop
box(2.8,.86,1.0,M.walnutS,4.2,.43,3.0);box(3.1,.06,1.12,M.marble,4.2,.92,3.0);box(.06,.92,1.12,M.marble,2.68,.46,3.0);box(.06,.92,1.12,M.marble,5.72,.46,3.0);
box(.82,.012,.56,M.blackGloss,4.9,.956,3.0);const ledIsl=box(2.7,.02,.02,ledM(0xffb866),4.2,.06,3.52);ledIsl.castShadow=false;const islL=PL(0xffb866,4.2,.3,3.9,3);
const burnM=[],flames=[];[[-.2,-.13],[.2,-.13],[-.2,.13],[.2,.13]].forEach(([dx,dz])=>{const m=new T.MeshStandardMaterial({color:0x222222,emissive:0,roughness:.4});burnM.push(m);const t=new T.Mesh(new T.TorusGeometry(.075,.014,8,24),m);t.rotation.x=Math.PI/2;t.position.set(4.9+dx,.968,3+dz);scene.add(t);
 for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const f=new T.Mesh(new T.ConeGeometry(.018,.09,6),new T.MeshBasicMaterial({color:0x4fb8ff,transparent:true,opacity:0}));f.position.set(4.9+dx+Math.cos(a)*.075,1.0,3+dz+Math.sin(a)*.075);scene.add(f);flames.push(f)}});
const flameL=PL(0xff7a2a,4.9,1.3,3,3);
// panela
cyl(.14,.12,.12,M.steel,4.7,1.03,2.87);
// banquetas
[3.4,4.2,5.0].forEach(x=>{cyl(.2,.2,.06,M.leather,x,.75,3.88);cyl(.025,.025,.72,M.black,x,.37,3.88);const r=new T.Mesh(new T.TorusGeometry(.16,.012,6,20),M.brass);r.rotation.x=Math.PI/2;r.position.set(x,.3,3.88);scene.add(r)});
// pendentes de vidro
const pend=[];[3.3,4.2,5.1].forEach(x=>{cyl(.006,.006,1.0,M.black,x,2.2,3);const g=sph(.15,new T.MeshStandardMaterial({color:0xfff3dc,emissive:0,roughness:.2,transparent:true,opacity:.9}),x,1.62,3);g.castShadow=false;pend.push(g.material)});
// fruteira
cyl(.2,.12,.08,M.white,3.5,.99,3.05);[[0,0,0xffa53a],[.08,.05,0xff7a2a],[-.07,.04,0x9ccf4f],[.02,-.08,0xffd23a]].forEach(([dx,dz,c])=>sph(.055,std(c,{roughness:.5}),3.5+dx,1.07,3.05+dz));

/* ---------- SUÍTE ---------- */
box(3.6,.015,3.2,M.rugQ,4.3,.025,-3.1);
for(let i=0;i<8;i++)rbox(.38,1.55,.12,.06,M.headboard,2.9+i*.4,.98,-4.93);
rbox(2.3,.3,2.35,.03,M.walnutS,4.3,.16,-3.7);rbox(2.12,.26,2.2,.08,M.white,4.3,.43,-3.7);
rbox(2.18,.1,1.5,.05,M.linen,4.3,.6,-3.2);rbox(2.2,.05,.55,.02,M.leather,4.3,.68,-2.75);
[[3.7,-4.5],[4.9,-4.5]].forEach(([x,z])=>{const p=rbox(.7,.22,.4,.1,M.white,x,.7,z);p.rotation.x=-.3});[[3.85,-4.25,M.fabricDark],[4.75,-4.25,M.fabricDark],[4.3,-4.15,M.leather]].forEach(([x,z,m])=>{const p=rbox(.45,.36,.12,.06,m,x,.78,z);p.rotation.x=-.35});
// criados e abajures
const abaj=[];[2.75,5.85].forEach(x=>{rbox(.6,.4,.45,.03,M.walnutS,x,.42,-4.7);box(.56,.02,.41,M.marble,x,.63,-4.7);cyl(.07,.1,.3,M.brass,x,.8,-4.72);const sm=new T.MeshStandardMaterial({color:lin(0xf3e6cc),emissive:0,side:T.DoubleSide,roughness:.9});
 const s=new T.Mesh(new T.CylinderGeometry(.15,.2,.25,24,1,true),sm);s.position.set(x,1.08,-4.72);s.castShadow=true;scene.add(s);abaj.push({sm,l:PL(0xffc47a,x,1.0,-4.45,3.6)})});
// banco aos pés
rbox(1.7,.44,.46,.06,M.leather,4.3,.22,-2.2);
// guarda-roupa planejado
box(1.4,2.5,.62,M.oakS,1.8,1.25,-4.68);box(.012,2.4,.01,M.black,1.8,1.25,-4.37);box(.03,.9,.03,M.brass,1.7,1.3,-4.35);box(.03,.9,.03,M.brass,1.9,1.3,-4.35);
const ledGR=box(1.4,.02,.02,ledM(0xffd7a0),1.8,2.48,-4.36);ledGR.castShadow=false;
// ar-condicionado
rbox(1.15,.32,.26,.06,M.white,4.3,2.28,-4.86);const acSlot=box(1.0,.04,.03,M.black,4.3,2.13,-4.72);const acLed=box(.04,.02,.01,new T.MeshBasicMaterial({color:0x222222}),4.75,2.36,-4.72);
const air=[];for(let i=0;i<26;i++){const a=new T.Mesh(new T.SphereGeometry(.025,6,4),new T.MeshBasicMaterial({color:0x9ff6ff,transparent:true,opacity:0}));a.userData.o=Math.random();a.userData.x=rnd(-.5,.5);scene.add(a);air.push(a)}
const acL=PL(0x6ff2ff,4.3,1.8,-4.2,3);
// poltrona de leitura
const corner=new T.Group();scene.add(corner);{const n0=scene.children.length;armchair(7.1,-2.2,-Math.PI/1.6);cyl(.2,.2,.03,M.marble,7.3,.55,-1.3);cyl(.02,.02,.55,M.brass,7.3,.27,-1.3);plant(7.5,-.2,.8);scene.children.slice(n0).forEach(o=>corner.add(o))}
const baby=new T.Group();scene.add(baby);baby.scale.y=.001;baby.visible=false;
{const pink=std(0xf3c9d2,{roughness:1}),mint=std(0xbfe6d8,{roughness:1}),cream=std(0xfaf3e6,{roughness:.8});
 box(.1,IH,5.4,M.wallLow,6.28,IH/2,-2.3,baby);
 const rg=new T.Mesh(new T.CylinderGeometry(.75,.75,.02,40),pink);rg.position.set(7.2,.04,-2.4);rg.receiveShadow=true;baby.add(rg);
 // berço
 rbox(.8,.1,1.4,.04,cream,7.25,.42,-3.9,baby);rbox(.72,.08,1.3,.04,M.white,7.25,.5,-3.9,baby);rbox(.5,.05,.6,.03,mint,7.25,.56,-3.7,baby);
 [[6.87,-4.58],[7.63,-4.58],[6.87,-3.22],[7.63,-3.22]].forEach(([x,z])=>box(.05,.95,.05,cream,x,.48,z,baby));
 for(let i=0;i<8;i++){box(.02,.42,.02,cream,6.87,.72,-4.45+i*.16,baby);box(.02,.42,.02,cream,7.63,.72,-4.45+i*.16,baby)}
 box(.05,.04,1.4,cream,6.87,.94,-3.9,baby);box(.05,.04,1.4,cream,7.63,.94,-3.9,baby);rbox(.8,.5,.05,.04,cream,7.25,.72,-4.58,baby);
 // móbile
 cyl(.01,.01,.9,M.brass,7.25,1.75,-4.4,baby);[[0,0,0xfff0a0],[.18,.1,0xbfe6d8],[-.16,.12,0xf3c9d2],[.05,-.17,0xbcdcff]].forEach(([dx,dz,c])=>sph(.06,std(c,{roughness:.6}),7.25+dx,1.28,-4.4+dz,baby));
 // poltrona de amamentação, cômoda, brinquedos
 rbox(.7,.18,.7,.08,mint,7.3,.36,-1.5,baby);rbox(.7,.55,.14,.08,mint,7.3,.68,-1.2,baby);rbox(.12,.3,.65,.05,mint,6.98,.52,-1.5,baby);rbox(.12,.3,.65,.05,mint,7.62,.52,-1.5,baby);
 rbox(.9,.7,.42,.03,cream,7.3,.36,-.05,baby);box(.86,.02,.38,M.oak,7.3,.72,-.05,baby);sph(.13,std(0xc49a6c,{roughness:1}),7.1,.87,-.05,baby);sph(.09,std(0xc49a6c,{roughness:1}),7.1,1.03,-.05,baby);
 [[6.65,-2.9,0xff9a8a],[6.8,-2.6,0x8ac8ff],[6.6,-2.45,0xffd76a]].forEach(([x,z,c])=>box(.16,.16,.16,std(c,{roughness:.7}),x,.1,z,baby));
 const bl=sph(.16,ledM(0xfff0d0),7.2,2.25,-2.6,baby);bl.castShadow=false;baby.userData.bl=bl.material;const cam2=box(.06,.1,.06,M.white,7.9,1.5,-4.9,baby);const bd=box(.02,.02,.02,ledM(0x5dfdff),7.9,1.52,-4.86,baby);baby.userData.dot=bd.material}
const babyL=PL(0xffe2c8,7.2,2,-2.6,4.5);

/* ---------- GARAGEM + ESPORTIVO ---------- */
const ledGa=box(.02,.02,4.2,ledM(0xe8f4ff),-7.97,2.3,2.75);ledGa.castShadow=false;box(.2,.3,.1,M.black,-7.95,1.2,1.4).rotation.y=Math.PI/2;
const car=new T.Group();
{const paint=phys(0xffd21a,{metalness:.5,roughness:.34,clearcoat:.7,clearcoatRoughness:.18}),trim=std(0x101214,{roughness:.6}),cover=std(0x1b1e22,{roughness:.45,metalness:.4});
 const poly=(pts,depth,mat,z0)=>{const s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false});g.translate(0,0,z0);const m=shadowy(new T.Mesh(g,mat));car.add(m);return m};
 const slab=(len,th,w,mat,x,y,ang)=>{const m=new T.Mesh(new T.BoxGeometry(len,th,w),mat);m.position.set(x,y,0);m.rotation.z=ang;car.add(m);return m};
 // carroceria angular: parte de baixo larga, cabine em prisma mais estreita
 poly([[-2.25,.36],[-2.3,.76],[-1.62,1.0],[2.25,1.0],[2.25,.44],[1.98,.44],[1.84,.94],[1.06,.94],[.92,.44],[-.92,.44],[-1.06,.94],[-1.84,.94],[-1.98,.44]],1.76,paint,-.88);
 poly([[-1.64,.99],[-.4,1.46],[2.25,.99]],1.56,paint,-.78);
 // vidros: para-brisa, teto e laterais
 slab(1.2,.014,1.4,M.carGlass,-1.0,1.245,.362);slab(1.05,.014,1.34,M.carGlass,.16,1.375,-.176);
 [-1,1].forEach(s=>{const w=poly([[-1.42,1.03],[-.42,1.41],[.98,1.165],[.98,1.03]],.012,M.carGlass,s>0?.776:-.788);w.castShadow=false});
 // caçamba com tampa
 slab(1.36,.02,1.4,cover,1.52,1.133,-.176);for(let i=0;i<6;i++){const l=slab(.02,.024,1.4,trim,.98+i*.22,1.229-i*.039,-.176)}
 // molduras pretas das rodas
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([fx,s])=>{const pts=[[.84,.44],[1.0,1.0],[1.9,1.0],[2.06,.44],[1.96,.44],[1.82,.9],[1.08,.9],[.94,.44]].map(([x,y])=>[x*fx,y]);poly(pts,.07,trim,s>0?.86:-.93)});
 // para-choques, barra de luz e lanternas
 const bf=new T.Mesh(new T.BoxGeometry(.16,.2,1.8),trim);bf.position.set(-2.24,.42,0);car.add(bf);const br=new T.Mesh(new T.BoxGeometry(.14,.2,1.8),trim);br.position.set(2.22,.5,0);car.add(br);
 const headM=new T.MeshBasicMaterial({color:0x666666}),tailM=new T.MeshBasicMaterial({color:0x330000});car.userData={headM,tailM};
 const hb=new T.Mesh(new T.BoxGeometry(.03,.035,1.7),headM);hb.position.set(-2.305,.775,0);hb.rotation.z=.12;car.add(hb);
 [-.74,.74].forEach(z=>{const h=new T.Mesh(new T.BoxGeometry(.03,.06,.2),headM);h.position.set(-2.33,.5,z);car.add(h);const mi=new T.Mesh(new T.BoxGeometry(.12,.1,.16),trim);mi.position.set(-1.38,1.06,z*1.3);car.add(mi)});
 const tb=new T.Mesh(new T.BoxGeometry(.03,.045,1.72),tailM);tb.position.set(2.26,.96,0);car.add(tb);
 // rodas grandes com calota fechada
 [[-1.45,.8],[-1.45,-.8],[1.45,.8],[1.45,-.8]].forEach(([x,z])=>{const s=Math.sign(z),w=new T.Group();w.position.set(x,.41,z);car.add(w);
  const tire=shadowy(new T.Mesh(new T.CylinderGeometry(.41,.41,.3,40),std(0x0c0c0e,{roughness:.95})));tire.rotation.x=Math.PI/2;w.add(tire);
  const cap=new T.Mesh(new T.CylinderGeometry(.29,.29,.31,7),cover);cap.rotation.x=Math.PI/2;w.add(cap);
  for(let k=0;k<7;k++){const sp=new T.Mesh(new T.BoxGeometry(.03,.24,.012),M.steel);sp.position.z=s*.158;sp.rotation.z=k/7*Math.PI*2;sp.translateY(.14);w.add(sp)}
  const hub=new T.Mesh(new T.CylinderGeometry(.06,.06,.02,7),M.steel);hub.rotation.x=Math.PI/2;hub.position.z=s*.16;w.add(hub)});
 const sh=new T.Mesh(new T.PlaneGeometry(4.9,2.3),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.4}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;car.add(sh)}
car.rotation.y=Math.PI/2;car.scale.setScalar(.88);car.position.set(-5.25,0,2.75);scene.add(car);
const carHL=new T.SpotLight(0xffffff,0,10,.5,.6,1.5);carHL.position.set(-2.1,.7,0);carHL.target.position.set(-8,0,0);car.add(carHL,carHL.target);
// portão de lâminas
const gate=new T.Group();box(4.95,.08,.08,M.black,0,2.05,0,gate);box(4.95,.08,.08,M.black,0,.06,0,gate);box(.08,2.06,.08,M.black,-2.45,1.03,0,gate);box(.08,2.06,.08,M.black,2.45,1.03,0,gate);
for(let i=0;i<13;i++)box(4.85,.12,.05,M.walnut,0,.2+i*.145,0,gate);gate.position.set(-5.25,0,5.12);scene.add(gate);
box(.25,2.3,.3,M.wallLow,-2.72,1.15,5.1);box(.25,2.3,.3,M.wallLow,-7.8,1.15,5.1);
const gLed=[];[-2.72,-7.8].forEach(x=>{const m=ledM(0xffd59a);const b=box(.04,.5,.04,m,x,1.6,5.27);b.castShadow=false;gLed.push(m)});

/* luzes internas */
const L={sala:PL(0xffc98a,-4.3,2.4,-2.4,9),jantar:PL(0xffd7a0,JX,1.6,JZ,5.5),cozinha:PL(0xfff0d8,4.2,2.2,2.8,6.5),quarto:PL(0xffd59a,4.3,2.4,-2.9,6.5),garagem:PL(0xeef6ff,-5.25,2.4,2.75,6.5)};
const tvL=PL(0x5aa8ff,-4.3,1.4,-4.1,5),lumL=PL(0xffc47a,-5.1,1.7,-2.2,4.5);

/* céu */
const SKY=[[0,0x050b14],[300,0x0a1424],[390,0x7a5a78],[480,0x6aa8d8],[720,0x86c9f2],[1020,0x6a9ac8],[1110,0x9a5a48],[1200,0x14203a],[1440,0x050b14]];
const skyC=m=>{for(let i=0;i<SKY.length-1;i++){const [a,ca]=SKY[i],[b,cb]=SKY[i+1];if(m>=a&&m<=b)return new T.Color(ca).lerp(new T.Color(cb),(m-a)/(b-a))}return new T.Color(0x050b14)};
const ease=(c,t,s)=>c+(t-c)*s;const W=new T.Color(0xffffff);
const setLed=(m,on)=>m.color.copy(on?m.userData.on:lin(0x15171a));
function curtain(wn,open){const s=ease(wn.L.scale.x,open?.17:1,.1);wn.L.scale.x=wn.R.scale.x=s;wn.L.position.x=-wn.w/2-.3+wn.cw*s/2;wn.R.position.x=wn.w/2+.3-wn.cw*s/2}
let lastT=performance.now(),ang=0,drawn=false,hold=0,carMov=false;
const tagBaby=$('#tagBaby'),tagRel=$('#tagRel'),RELS=new T.Vector3(-4.3,2.2,-2.4),RELK=new T.Vector3(4.2,2.2,3),relPos=RELS.clone(),pv=new T.Vector3();
function place(el,x,y,z,show){if(!el)return;if(!show){el.style.opacity=0;return}pv.set(x,y,z).project(cam);const r=host.getBoundingClientRect();el.style.opacity=1;el.style.transform=`translate(${((pv.x*.5+.5)*r.width).toFixed(1)}px,${((-pv.y*.5+.5)*r.height).toFixed(1)}px) translate(-50%,-100%)`}
function frame(now){const rdt=Math.min(.25,(now-lastT)/1000),dt=Math.min(.05,rdt);lastT=now;
 if(playing&&!RM){if(hold>0)hold-=rdt;else{const pv0=tMin;tMin+=rdt*(tMin>=1320||tMin<360?192:96)*(carMov?.32:1)}if(tMin>=1440){tMin=0;for(const kk in OVR)delete OVR[kk];for(const kk in MAN)delete MAN[kk];SC=null;manPill=null}syncUI()}
 if(!document.hidden){drawn=true;const m=tMin,day=(m-360)/720,up=day>0&&day<1,sa=day*Math.PI,lux=up?Math.min(1,Math.sin(sa)*1.6):0;
  sun.position.set(1+Math.cos(sa)*16,Math.max(1,Math.sin(sa)*18),9);sun.intensity=ease(sun.intensity,up?lux*1.15+.1:.04,.1);sun.color.set(up&&(day<.14||day>.86)?0xffa66b:0xfff6e8);
  const sc=skyC(m);hemi.intensity=ease(hemi.intensity,up?.22+lux*.2:.2,.1);hemi.color.copy(sc).lerp(W,.45);
  ren.toneMappingExposure=ease(ren.toneMappingExposure,up?.92:1.25,.05);
  MATS.forEach(x=>x.envMapIntensity=.22+lux*.38);
  host.style.background=`radial-gradient(90% 75% at 60% 0%,#${sc.getHexString()},#04090d 82%)`;
  [winQ,winS,winS2].forEach(w=>w.sky.material.color.copy(sc).lerp(W,up?.55+lux*.35:.1));
  const relOn=relaxOn(m),rel=relOn?relaxAt(m):null,casc=cascOn(m),bb=babyOn(m);
  const IT=OVR.it,jOn='jantar' in OVR?OVR.jantar:st('cozinha',m);for(const r in L){let on=r==='jantar'?jOn:st(r,m),it=on?(r==='sala'?2.6:2):0;if(rel==='sala'&&r==='sala')it=1.1;if(rel==='cozinha'&&(r==='cozinha'||r==='jantar'))it=r==='jantar'?1.3:.7;if(IT&&r in IT)it=IT[r];L[r].intensity=ease(L[r].intensity,it,.12)}
  L.sala.color.copy(lin(rel==='sala'?0xff9a4a:0xffc98a));L.cozinha.color.copy(lin(rel==='cozinha'?0xff9a4a:0xfff0d8));
  setLed(ledIsl.material,rel==='cozinha');islL.intensity=ease(islL.intensity,rel==='cozinha'?1.6:0,.12);
  // cascata, LED da piscina e lareira
  fallM.opacity=ease(fallM.opacity,casc?.9:0,.2);fallT.offset.y=(now/900)%1;setLed(cascLed.material,casc);cascL.intensity=ease(cascL.intensity,casc?2.2:0,.1);
  splash.forEach(a=>{a.userData.o=(a.userData.o+dt*1.6)%1;const o=a.userData.o;a.position.set(10.9+a.userData.x,.02+Math.sin(o*Math.PI)*.22,-4.25+a.userData.z*o);a.material.opacity=casc?(1-o)*.8:0});
  const pOn=st('piscina',m),hue=.5+.12*Math.sin(now/1800);poolLed.forEach(p=>{if(pOn&&casc)p.color.setHSL(hue,1,.6);else setLed(p,pOn)});if(casc){poolL.color.setHSL(hue,1,.55)}else poolL.color.copy(lin(0x4fe6ff));
  const fo2=st('externa',m)&&m>1080&&m<1335&&OVR.fogo!==false;fire.forEach((f,i)=>{f.material.opacity=ease(f.material.opacity,fo2?.85:0,.1);f.scale.y=1+.4*Math.sin(now/80+i*1.7)});fireL.intensity=ease(fireL.intensity,fo2?1.6+.4*Math.sin(now/90):0,.2);setLed(pergLed.material,st('externa',m));
  muroL.forEach(b=>setLed(b,st('externa',m)));muroPL.forEach(l=>l.intensity=ease(l.intensity,st('externa',m)?1.1:0,.1));
  // quarto do bebê
  baby.visible=bb||baby.scale.y>.02;baby.scale.y=ease(baby.scale.y,bb?1:.001,.16);const cs=ease(corner.scale.x,bb?.001:1,.12);corner.scale.setScalar(cs);corner.visible=cs>.02;
  setLed(baby.userData.bl,bb&&!up&&m>1080&&m<1330);babyL.intensity=ease(babyL.intensity,bb&&!up&&m>1080&&m<1330?1.5:0,.1);setLed(baby.userData.dot,bb);
  // etiquetas presas à casa
  place(tagBaby,7.2,2.3,-2.6,bb&&baby.scale.y>.6);relPos.lerp(rel==='cozinha'?RELK:RELS,.14);place(tagRel,relPos.x,relPos.y,relPos.z,!!rel);
  setLed(ledTV.material,st('sala',m));setLed(ledRack.material,st('sala',m));setLed(ledJ.material,jOn||rel==='cozinha');setLed(ledAp.material,st('sala',m));setLed(ledGR.material,st('quarto',m));setLed(ledGa.material,st('garagem',m));
  pend.forEach(p=>p.emissive.set(st('cozinha',m)||rel==='cozinha'?0xffd9a0:0x000000));
  const ext=st('externa',m);extL.intensity=ease(extL.intensity,ext?1.6:0,.1);bollards.forEach(b=>setLed(b,ext));gLed.forEach(b=>setLed(b,ext));
  poolL.intensity=ease(poolL.intensity,pOn?(casc?3.2:2.2):0,.1);M.water.emissive.set(pOn?0x0b5f78:0x000000);
  const tvOn=st('tv',m);tvScr.emissive.copy(tvOn?new T.Color().setHSL(.55+.12*Math.sin(now/2600),.65,.42):new T.Color(0));tvL.intensity=ease(tvL.intensity,tvOn?1.4:0,.15);
  const lu=st('luminaria',m)||rel==='sala';lumL.intensity=ease(lumL.intensity,lu?2:0,.12);setLed(domeIn.material,lu);
  abaj.forEach(a=>{const on=st('abajur',m);a.l.intensity=ease(a.l.intensity,on?1.6:0,.12);a.sm.emissive.set(on?0xffb866:0x000000)});
  const fo=st('fogao',m);burnM.forEach(b=>b.emissive.set(fo?0xff5a1f:0));flames.forEach((f,i)=>{f.material.opacity=ease(f.material.opacity,fo?.9:0,.2);f.scale.y=1+.5*Math.sin(now/70+i)});flameL.intensity=ease(flameL.intensity,fo?1.2:0,.2);
  const ge=st('geladeira',m);fDoor.rotation.y=ease(fDoor.rotation.y,ge?1.35:0,.2);fInt.material.color.copy(lin(ge?0xf2f8ff:0x1a1d20));fLight.intensity=ease(fLight.intensity,ge?1.6:0,.15);
  const ac=st('ar',m);acL.intensity=ease(acL.intensity,ac?1.2:0,.1);acSlot.material.color.set(ac?0x56e7ff:0x15171a);acLed.material.color.set(ac?0x5dfdff:0x222222);
  air.forEach(a=>{a.userData.o=(a.userData.o+dt*.5)%1;const o=a.userData.o;a.position.set(4.3+a.userData.x,2.08-o*1.3,-4.62+o*1.9);a.material.opacity=ac?(1-o)*.7:0});
  curtain(winQ,st('cortina',m));curtain(winS,st('cortinaS',m));curtain(winS2,st('cortinaS',m));[winQ,winS,winS2].forEach(w=>w.patch.material.opacity=lux*.5*Math.max(0,1-(w.L.scale.x-.17)/.83));
  const inG=st('carro',m),tz=inG?2.75:19.5,dz=tz-car.position.z,need=Math.abs(dz)>.02;
  gate.position.x=ease(gate.position.x,st('portao',m)||need?-10.3:-5.25,1-Math.pow(.004,dt));
  const moving=need&&gate.position.x<-9.6;if(moving)car.position.z+=Math.sign(dz)*Math.min(Math.abs(dz),dt*5.2);carMov=need&&car.position.z<17.5;car.visible=car.position.z<18.4;
  car.userData.headM.color.set(moving?0xffffff:0x555555);car.userData.tailM.color.set(moving?0xff2020:0x330000);carHL.intensity=moving&&!up?2:0;
  ang+=dt*.05;const d=cam.userData.d||27,a=.62+Math.sin(ang)*.2;cam.position.set(3.4+Math.sin(a)*d,d*.66,.8+Math.cos(a)*d);cam.lookAt(3.2,.2,1.5);if(window.__camFn)window.__camFn(cam);
  deviceCards.forEach(el=>{const on=st(el.dataset.device,m);el.querySelector('small').textContent=on?(el.dataset.device==='ar'?'Resfriando · 23°':'Ligada · 100%'):'Desligado';el.classList.toggle('off',!on);el.setAttribute('aria-pressed',String(on));el.querySelector('strong').textContent=el.dataset.device==='ar'?(on?'23°':'—'):(on?'100%':'0%')});ren.render(scene,cam)}
 }
const deviceCards=$$('[data-device]');deviceCards.forEach(el=>el.onclick=()=>{const key=el.dataset.device;pause('SIMULAÇÃO LOCAL');OVR[key]=!st(key,tMin);if(key==='sala'&&OVR[key])tMin=1190;syncUI()});
syncUI();
const redrawHouse=window.PalanteerCanvas.register(cvs,frame,{priority:()=>50});
host.addEventListener("click",redrawHouse);host.addEventListener("input",redrawHouse);

})();
/* Finite folding-phone story. Local demonstration, no network or house commands. */
(()=>{
const q=s=>document.querySelector(s),phone=q('#foldPhone'),scene=q('#duoShowcase'),chat=q('#phoneChat'),button=q('#duoPause');
const people=[['Felyx','felyx']];
let elapsed=0,last=performance.now(),phase=-1,round=-1,visible=false,paused=false;const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
new IntersectionObserver(es=>{visible=es[0].isIntersecting;last=performance.now()},{threshold:.15}).observe(scene);
function message(w,text){const d=document.createElement('div');d.className='chat-bubble '+w;d.textContent=text;const t=document.createElement('small');t.textContent='9:41 '+(w==='user'?'✓✓':'');d.appendChild(t);chat.appendChild(d);while(chat.children.length>4)chat.firstChild.remove()}
function setStory(t){const n=Math.floor(t/25)%people.length,sec=t%25;let step=sec<3?0:sec<5?1:sec<9?2:sec<13?3:sec<17?4:sec<21?5:sec<24?6:7;if(n!==round){round=n;const [name,file]=people[n];q('#assistantName').textContent=name;q('#assistantPhoto').src='felyx-rosto.jpg';q('#assistantPhoto').alt='Retrato do '+name;phase=-1}const drafts={2:'Bom dia. Ative a luz alta.',3:'Agora luz baixa, por favor.',4:'Boa noite, '+people[n][0]+'.'};
const starts={2:5,3:9,4:13};
if(step===phase){if(drafts[step])q('#phoneTyped').textContent=drafts[step].slice(0,Math.floor((sec-starts[step])*14))||'Mensagem';return}phase=step;
phone.classList.toggle('folding',step===1||step===6);phone.dataset.phase=step>=1&&step<6?'open':'closed';q('#phoneTyped').textContent='Mensagem';
if(step===0){chat.replaceChildren();message('assistant','Bom dia! Sou '+people[n][0]+'. Vamos começar o dia?');q('#duoCaption').textContent='Uma mensagem chegou';q('#assistantStatus').textContent='Seu assistente Felyx'}
if(step===1){q('#duoCaption').textContent='A conversa acompanha a abertura'}
if(step===2){q('#phoneTyped').textContent='Bom dia. Ative a luz alta…';q('#assistantStatus').textContent='online';q('#duoCaption').textContent='Aberto, com espaço para conversar'}
if(step===3){message('user','Bom dia. Ative a luz alta.');message('assistant','Luz alta preparada na casa modelo. ☀');q('#phoneTyped').textContent='Agora luz baixa, por favor…'}
if(step===4){message('user','Agora luz baixa, por favor.');message('assistant','Pronto. Um clima mais tranquilo para a sua noite.');q('#phoneTyped').textContent='Boa noite, '+people[n][0]+'…'}
if(step===5){message('user','Boa noite, '+people[n][0]+'.');message('assistant','Boa noite! Até amanhã.');q('#duoCaption').textContent='O dia termina com um boa noite'}
if(step===6){q('#duoCaption').textContent='A casa descansa com você'}
if(step===7){q('#duoCaption').textContent='Um novo dia. Uma nova conversa.'}
}
button.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'Continuar animação':'Pausar animação';button.setAttribute('aria-pressed',String(paused));last=performance.now()});
window.FelyxFoldPreview={seek(seconds){elapsed=seconds;phase=-1;round=-1;setStory(elapsed)},pause(){paused=true;button.textContent='Continuar animação';button.setAttribute('aria-pressed','true')}};
function tick(now){const dt=Math.min((now-last)/1000,.1);last=now;if(visible&&!document.hidden&&!paused&&!rm){elapsed+=dt;setStory(elapsed)}requestAnimationFrame(tick)}setStory(rm?10:0);requestAnimationFrame(tick);
})();
