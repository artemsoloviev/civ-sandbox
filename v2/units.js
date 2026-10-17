// units.js — войска «Новой цивилизации» (16.10): человек на шарнирах, разведчик, дружина, варвары, стойбище; анимации шага и боя.
// Стиль — как у скота в kit.js: простые тела + текстуры, нарисованные кодом. Фигура смотрит вдоль +z, правая рука — со стороны −x.
// Рост человека 0.6 (корова 0.4, хата в деревне ≈ 2) — символьный масштаб, как у построек.
// Правила боя и числа — старый движок (index.html 8650–8700): исход решается сразу, анимация чисто зрительная.
export function makeUnits(W,K){
const {THREE,R}=W;
const rr=(a,b)=>a+(b-a)*R();
const {cnv,tex,log}=K;
const LCG=s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296;
const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const ST=m=>{ m.castShadow=true; m.receiveShadow=true; return m; };
const PI=Math.PI, UP=-PI/2;

// ================= ТЕКСТУРЫ =================
function clothCanvas(seed,hem){ const c=cnv(256), g=c.getContext('2d'), L=LCG(seed);     // домотканый лён: уток/основа, складки, пятна носки
  g.fillStyle='#ece6da'; g.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=2){ g.fillStyle=`rgba(0,0,0,${0.025+L()*0.05})`; g.fillRect(0,y,256,1); }
  for(let x=0;x<256;x+=2){ g.fillStyle=`rgba(255,255,255,${0.03+L()*0.05})`; g.fillRect(x,0,1,256); }
  for(let i=0;i<16;i++){ const x=L()*256, w=5+L()*12, gr=g.createLinearGradient(x-w,0,x+w,0);
    gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(0.5,`rgba(0,0,0,${0.10+L()*0.14})`); gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.fillRect(x-w,0,2*w,256); }
  for(let i=0;i<50;i++){ g.fillStyle=`rgba(70,50,25,${0.04+L()*0.07})`; g.beginPath(); g.ellipse(L()*256,L()*256,4+L()*16,3+L()*9,L()*3,0,7); g.fill(); }
  if(hem){ g.fillStyle='rgba(60,35,15,0.6)'; g.fillRect(0,228,256,16); g.fillStyle='rgba(215,180,115,0.55)';   // тканая кайма с ёлочкой (низ подола)
    for(let x=0;x<256;x+=10){ g.beginPath(); g.moveTo(x,231); g.lineTo(x+5,241); g.lineTo(x+10,231); g.fill(); } }
  return tex(c); }
const clothT=clothCanvas(501,false), skirtT=clothCanvas(502,true);
const leatherT=(()=>{ const c=cnv(128), g=c.getContext('2d'), L=LCG(503);
  g.fillStyle='#7a5434'; g.fillRect(0,0,128,128);
  for(let i=0;i<60;i++){ g.fillStyle=`rgba(${L()<0.5?'30,18,8':'170,130,85'},${0.08+L()*0.15})`; g.beginPath(); g.ellipse(L()*128,L()*128,3+L()*12,2+L()*6,L()*3,0,7); g.fill(); }
  g.strokeStyle='rgba(30,18,8,0.35)';
  for(let i=0;i<30;i++){ g.lineWidth=0.6+L(); const x=L()*128,y=L()*128; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+(L()-0.5)*20,y+(L()-0.5)*20,x+(L()-0.5)*30,y+(L()-0.5)*30); g.stroke(); }
  return tex(c); })();
const wrapT=(()=>{ const c=cnv(64), g=c.getContext('2d'); g.fillStyle='#8f7a5c'; g.fillRect(0,0,64,64);   // обмотки голени: косые витки
  g.strokeStyle='rgba(40,28,14,0.55)'; g.lineWidth=1.6;
  for(let y=-64;y<128;y+=8){ g.beginPath(); g.moveTo(0,y); g.lineTo(64,y+14); g.stroke(); }
  const t=tex(c); t.repeat.set(2,2); return t; })();
const furT=(()=>{ const c=cnv(256), g=c.getContext('2d'), L=LCG(504);                  // мех: тысячи коротких ворсинок вниз
  g.fillStyle='#6a5640'; g.fillRect(0,0,256,256);
  for(let i=0;i<5200;i++){ const x=L()*256, y=L()*256, l=3+L()*7, a=PI/2+(L()-0.5)*0.9, v=L();
    g.strokeStyle=v<0.45?`rgba(25,18,10,${0.25+L()*0.3})`:`rgba(${190+L()*40|0},${165+L()*40|0},${120+L()*40|0},${0.15+L()*0.25})`;
    g.lineWidth=0.8+L()*0.8; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); }
  return tex(c); })();
function shieldTex(col){ const c=cnv(128), g=c.getContext('2d'), L=LCG(505);              // плетёный щит под сыромятной кожей, крашеный обод, бляха
  g.fillStyle='#a27c54'; g.beginPath(); g.arc(64,64,64,0,7); g.fill();
  for(let i=0;i<40;i++){ g.fillStyle=`rgba(${L()<0.5?'70,45,20':'190,150,105'},${0.1+L()*0.15})`; g.beginPath(); g.ellipse(L()*128,L()*128,4+L()*12,3+L()*8,L()*3,0,7); g.fill(); }
  g.strokeStyle=col; g.lineWidth=15; g.beginPath(); g.arc(64,64,47,0,7); g.stroke();
  g.fillStyle=col; for(let k=0;k<6;k++){ const a=k/6*PI*2; g.beginPath();                // зубцы-лучи от обода к бляхе
    g.moveTo(64+Math.cos(a-0.22)*40,64+Math.sin(a-0.22)*40); g.lineTo(64+Math.cos(a)*17,64+Math.sin(a)*17); g.lineTo(64+Math.cos(a+0.22)*40,64+Math.sin(a+0.22)*40); g.fill(); }
  g.strokeStyle='rgba(35,22,10,0.75)'; g.lineWidth=4; g.beginPath(); g.arc(64,64,61,0,7); g.stroke();
  g.fillStyle='rgba(230,210,170,0.8)'; for(let k=0;k<28;k++){ const a=k/28*PI*2; g.beginPath(); g.arc(64+Math.cos(a)*56,64+Math.sin(a)*56,1.4,0,7); g.fill(); }   // стежки
  const gb=g.createRadialGradient(60,60,1,64,64,12); gb.addColorStop(0,'#e0a070'); gb.addColorStop(1,'#6a3a1c');
  g.fillStyle=gb; g.beginPath(); g.arc(64,64,11,0,7); g.fill();
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; }
function bannerTex(col){ const c=document.createElement('canvas'); c.width=256; c.height=160; const g=c.getContext('2d'), L=LCG(506);
  g.clearRect(0,0,256,160); g.fillStyle=col; g.fillRect(0,0,256,136);
  for(let i=0;i<400;i++){ g.fillStyle=`rgba(0,0,0,${0.03+L()*0.05})`; g.fillRect(0,L()*136,256,1); }
  g.strokeStyle='rgba(0,0,0,0.35)'; g.lineWidth=10; g.strokeRect(5,5,246,126);
  g.fillStyle='#efe2c0'; g.beginPath(); g.arc(128,68,26,0,7); g.fill();                  // солнечный знак
  g.strokeStyle='#efe2c0'; g.lineWidth=7; for(let k=0;k<8;k++){ const a=k/8*PI*2; g.beginPath(); g.moveTo(128+Math.cos(a)*34,68+Math.sin(a)*34); g.lineTo(128+Math.cos(a)*50,68+Math.sin(a)*50); g.stroke(); }
  g.fillStyle=col; g.beginPath(); g.arc(128,68,12,0,7); g.fill();
  for(let x=4;x<256;x+=14){ g.fillStyle=col; g.fillRect(x,134,7,18+L()*6); }             // бахрома
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; }
const ringT=(()=>{ const c=cnv(128), g=c.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64);   // мягкое кольцо отряда на земле
  gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(0.55,'rgba(255,255,255,0.07)'); gr.addColorStop(0.78,'rgba(255,255,255,0.6)');
  gr.addColorStop(0.86,'rgba(255,255,255,0.95)'); gr.addColorStop(0.93,'rgba(255,255,255,0.3)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,128,128); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
const puffT=(()=>{ const c=cnv(64), g=c.getContext('2d'), L=LCG(507);                    // клуб пыли
  for(let i=0;i<14;i++){ const x=32+(L()-0.5)*22, y=32+(L()-0.5)*22, r=8+L()*14, gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,'rgba(170,148,112,0.42)'); gr.addColorStop(1,'rgba(170,148,112,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();

// ================= МАТЕРИАЛЫ =================
const mat=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.95},o));
const TUNIC=[0xd9ceb4,0xc29458,0x8c6c4c,0xa65a42,0x938d7a,0x6f7a5a].map(c=>({top:mat({map:clothT,color:c}),skirt:mat({map:skirtT,color:c,side:THREE.DoubleSide})}));
const TUNIC_DARK=[0x5a4a3a,0x4a4238,0x6a4a34].map(c=>({top:mat({map:clothT,color:c}),skirt:mat({map:skirtT,color:c,side:THREE.DoubleSide})}));
const SKIN=[0xb8845e,0xa87452,0x8e5e3e,0xc49272].map(c=>mat({color:c,roughness:0.7}));
const HAIR=[0x2b1d13,0x3e2a1a,0x5e3b20,0x1b1512,0x7a5a34].map(c=>mat({color:c,roughness:0.9}));
const leatherM=mat({map:leatherT}), darkLeatherM=mat({map:leatherT,color:0x7a6a5a}), wrapM=mat({map:wrapT});
const woodM=mat({color:0x9a7650,roughness:0.75}), copperM=mat({color:0xc07a46,roughness:0.38,metalness:0.7}), flintM=mat({color:0x55504a,roughness:0.45});
const FUR=[mat({map:furT}),mat({map:furT,color:0x9a9080}),mat({map:furT,color:0x5a4a3a})];
const cloakM=mat({map:clothT,color:0x6e6450,side:THREE.DoubleSide});
const eyeM=new THREE.MeshBasicMaterial({color:0x1a120c});
const boneM=mat({color:0xe2d8c0,roughness:0.8});

// ================= ГЕОМЕТРИЯ ТЕЛА (общая на всех) =================
const V2=a=>a.map(([x,y])=>new THREE.Vector2(x,y));
const cap=(r,l)=>new THREE.CapsuleGeometry(r,l,3,8);
const G={thigh:cap(0.025,0.1), shin:cap(0.021,0.095), up:cap(0.019,0.08), fore:cap(0.016,0.07),
  foot:new THREE.SphereGeometry(1,8,6).scale(0.022,0.014,0.042), hand:new THREE.SphereGeometry(0.019,8,6),
  head:new THREE.SphereGeometry(0.047,14,10), neck:new THREE.CylinderGeometry(0.017,0.019,0.04,8),
  nose:new THREE.ConeGeometry(0.008,0.02,5), eye:new THREE.SphereGeometry(0.0055,5,4),
  hair:new THREE.SphereGeometry(0.05,12,8,0,PI*2,0,1.45), beard:new THREE.SphereGeometry(1,8,6).scale(0.03,0.027,0.022),
  torso:new THREE.LatheGeometry(V2([[0.05,-0.035],[0.049,0],[0.048,0.04],[0.055,0.1],[0.062,0.15],[0.058,0.18],[0.038,0.205],[0.014,0.218]]),14),
  skirt:new THREE.LatheGeometry(V2([[0.08,-0.135],[0.071,-0.085],[0.058,-0.025],[0.052,0.008]]),14),
  belt:new THREE.TorusGeometry(0.052,0.0075,5,16),
  capH:new THREE.SphereGeometry(0.053,12,6,0,PI*2,0,PI/2), rim:new THREE.TorusGeometry(0.05,0.006,4,14),
  furH:new THREE.CylinderGeometry(0.062,0.056,0.035,12), furTop:new THREE.SphereGeometry(0.06,12,6,0,PI*2,0,PI/2),
  hood:new THREE.SphereGeometry(0.059,12,8,PI/2+0.75,PI*2-1.5,0,2.1),
  cloak:new THREE.CylinderGeometry(0.072,0.135,0.33,16,1,true,0.85,PI*2-1.7),
  cape:new THREE.CylinderGeometry(0.07,0.1,0.15,14,1,true,0.6,PI*2-1.2),
  bag:new THREE.SphereGeometry(1,8,6).scale(0.045,0.055,0.03), sash:new THREE.TorusGeometry(0.075,0.004,4,18)};

// ================= ЧЕЛОВЕК =================
// Суставы: body (наклон/падение, ось — у пяток) → pelvis → бёдра/колени, chest (поясница) → плечи/локти/кисти, шея/голова.
// Оружие и щит крепятся к кисти (handR/handL) в «рамке оружия»: древко вдоль +z кисти.
function mkMan(o={}){
  const tun=o.tunic||TUNIC[Math.floor(R()*TUNIC.length)], skin=SKIN[Math.floor(R()*SKIN.length)], hair=HAIR[Math.floor(R()*HAIR.length)];
  const root=new THREE.Group(), body=new THREE.Group(); root.add(body);
  const pelvis=new THREE.Group(); pelvis.position.y=0.28; body.add(pelvis);
  const shinM=o.shinM||wrapM, shoeM=o.shoeM||darkLeatherM;
  const leg=s=>{ const hip=new THREE.Group(); hip.position.x=s*0.031; pelvis.add(hip);
    const th=ST(new THREE.Mesh(G.thigh,tun.top)); th.position.y=-0.07; hip.add(th);
    const knee=new THREE.Group(); knee.position.y=-0.14; hip.add(knee);
    const sh=ST(new THREE.Mesh(G.shin,shinM)); sh.position.y=-0.066; knee.add(sh);
    const ft=ST(new THREE.Mesh(G.foot,shoeM)); ft.position.set(0,-0.128,0.016); knee.add(ft);
    return {hip,knee}; };
  const lgR=leg(-1), lgL=leg(1);
  const sk=ST(new THREE.Mesh(G.skirt,tun.skirt)); sk.scale.z=0.85; pelvis.add(sk);
  const belt=new THREE.Mesh(G.belt,leatherM); belt.rotation.x=PI/2; belt.scale.y=0.75; belt.position.y=0.004; pelvis.add(belt);
  const chest=new THREE.Group(); pelvis.add(chest);
  const to=ST(new THREE.Mesh(G.torso,tun.top)); to.scale.z=0.72; chest.add(to);
  const arm=s=>{ const sh=new THREE.Group(); sh.position.set(s*0.066,0.183,0); chest.add(sh);
    const up=ST(new THREE.Mesh(G.up,tun.top)); up.position.y=-0.05; sh.add(up);
    const el=new THREE.Group(); el.position.y=-0.1; sh.add(el);
    const fo=ST(new THREE.Mesh(G.fore,o.armM||skin)); fo.position.y=-0.045; el.add(fo);
    const hand=new THREE.Group(); hand.position.y=-0.093; el.add(hand);
    const hm=new THREE.Mesh(G.hand,skin); hm.scale.set(0.9,1.1,0.85); hand.add(hm);
    return {sh,el,hand}; };
  const aR=arm(-1), aL=arm(1);
  const head=new THREE.Group(); head.position.y=0.21; chest.add(head);
  const nk=new THREE.Mesh(G.neck,skin); nk.position.y=0.012; head.add(nk);
  const hd=ST(new THREE.Mesh(G.head,skin)); hd.position.y=0.06; hd.scale.set(0.9,1.08,0.98); head.add(hd);
  const ns=new THREE.Mesh(G.nose,skin); ns.rotation.x=PI/2; ns.position.set(0,0.055,0.047); head.add(ns);
  for(const s of[-1,1]){ const e=new THREE.Mesh(G.eye,eyeM); e.position.set(s*0.016,0.066,0.04); head.add(e); }
  if(o.hat!=='hood'){ const h=new THREE.Mesh(G.hair,hair); h.position.set(0,0.066,-0.006); h.rotation.x=-0.38; h.scale.set(0.95,1.05,1.02); head.add(h); }
  if(o.beard??R()<0.55){ const b=new THREE.Mesh(G.beard,hair); b.position.set(0,0.02,0.032); head.add(b); }
  if(o.hat==='cap'){ const c=ST(new THREE.Mesh(G.capH,leatherM)); c.position.y=0.07; c.scale.set(0.95,0.8,1); head.add(c);
    const r=new THREE.Mesh(G.rim,darkLeatherM); r.rotation.x=PI/2; r.position.y=0.071; r.scale.set(0.95,1,1); head.add(r); }
  if(o.hat==='fur'){ const fm=o.furM||FUR[0]; const c=ST(new THREE.Mesh(G.furH,fm)); c.position.y=0.084; head.add(c);
    const t=new THREE.Mesh(G.furTop,fm); t.scale.y=0.6; t.position.y=0.1; head.add(t); }
  if(o.hat==='hood'){ const h=ST(new THREE.Mesh(G.hood,cloakM)); h.position.y=0.062; h.rotation.x=-0.25; head.add(h); }
  if(o.cloak){ const c=ST(new THREE.Mesh(G.cloak,cloakM)); c.position.y=0.025; c.scale.z=0.8; chest.add(c); }
  if(o.cape){ const c=ST(new THREE.Mesh(G.cape,o.furM||FUR[0])); c.position.y=0.125; c.scale.z=0.8; chest.add(c); }
  if(o.bag){ const b=ST(new THREE.Mesh(G.bag,leatherM)); b.position.set(-0.05,-0.01,-0.058); pelvis.add(b);
    const s=new THREE.Mesh(G.sash,leatherM); s.rotation.set(PI/2,0.62,0); s.scale.y=0.72; s.position.y=0.1; chest.add(s); }
  return {root,body,pelvis,chest,head,hipL:lgL.hip,hipR:lgR.hip,kneeL:lgL.knee,kneeR:lgR.knee,
    shL:aL.sh,elL:aL.el,handL:aL.hand,shR:aR.sh,elR:aR.el,handR:aR.hand};
}

// ================= СНАРЯЖЕНИЕ (рамка кисти: древко вдоль +z) =================
function shaft(len,r,from,m){ const s=ST(new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.1,len,6),m)); s.rotation.x=PI/2; s.position.z=from+len/2; return s; }
function mkSpear(){ const g=new THREE.Group(); g.add(shaft(0.8,0.0055,-0.26,woodM));                 // копьё ~1.3 роста, медный листовидный наконечник
  const tip=new THREE.Mesh(new THREE.ConeGeometry(0.012,0.055,4),copperM); tip.rotation.x=PI/2; tip.scale.x=0.45; tip.position.z=0.567; g.add(tip);
  const bd=new THREE.Mesh(new THREE.CylinderGeometry(0.0075,0.0075,0.02,6),leatherM); bd.rotation.x=PI/2; bd.position.z=0.535; g.add(bd);
  return g; }
function mkAxe(copper){ const g=new THREE.Group(); g.add(shaft(0.32,0.007,-0.07,woodM));            // топор: клинок вперёд (−y кисти)
  const hdG=new THREE.CylinderGeometry(0.004,0.015,0.075,4); hdG.rotateY(PI/4); hdG.scale(1,1,2.2);
  const hd=ST(new THREE.Mesh(hdG,copper?copperM:flintM)); hd.position.set(0,-0.035,0.225); g.add(hd);
  const bd=new THREE.Mesh(new THREE.CylinderGeometry(0.0105,0.0105,0.035,6),leatherM); bd.rotation.x=PI/2; bd.position.z=0.225; g.add(bd);
  return g; }
function mkStaff(){ const g=new THREE.Group(); g.add(shaft(0.7,0.008,-0.2,woodM)); return g; }
const SHIELD={};
function mkShield(col){ const m=SHIELD[col]||(SHIELD[col]=[leatherM,mat({map:shieldTex(col),roughness:0.85}),mat({map:K.M.wattle.map,color:0xb09070})]);
  const s=ST(new THREE.Mesh(new THREE.CylinderGeometry(0.088,0.088,0.012,22),m)); s.rotation.x=PI/2; s.position.z=0.014;
  const g=new THREE.Group(); g.add(s); return g; }
function mkBanner(col){ const g=new THREE.Group(); g.add(shaft(1.08,0.007,-0.3,woodM));            // стяг вожака: шест + полотнище с бахромой
  const kn=new THREE.Mesh(new THREE.ConeGeometry(0.013,0.045,6),copperM); kn.rotation.x=PI/2; kn.position.z=0.8; g.add(kn);
  const geo=new THREE.PlaneGeometry(0.27,0.17,10,4); geo.rotateX(PI/2); geo.translate(-0.143,0,0.66);
  const f=new THREE.Mesh(geo,mat({map:bannerTex(col),side:THREE.DoubleSide,alphaTest:0.4,roughness:0.9})); f.castShadow=true; g.add(f);
  g.userData.flag={geo,base:Float32Array.from(geo.attributes.position.array)};
  return g; }
function waveFlag(fl,t,amp){ const P=fl.geo.attributes.position, b=fl.base;
  for(let i=0;i<P.count;i++){ const x=-(b[i*3]+0.008), k=x/0.27; P.array[i*3+1]=b[i*3+1]+Math.sin(t*5.5-x*22+b[i*3+2]*6)*0.028*amp*k; }
  P.needsUpdate=true; fl.geo.computeVertexNormals(); }
function mkRing(col,r){ const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:ringT,color:new THREE.Color(col),transparent:true,depthWrite:false,opacity:0.9}));
  m.rotation.x=-PI/2; m.position.y=0.015; m.renderOrder=2; m.userData.noSh=1; return m; }

// ================= ПОЗЫ =================
// Углы в радианах. s* — плечо вперёд(−)/назад(+), e* — локоть (−сгиб вперёд), w* — наклон оружия относительно тела
// (0 — вперёд горизонтально, −π/2 — вверх), z* — отвод руки в сторону, h*/k* — бедро/колено, bx — наклон тела, fz — шаг корпусом вперёд.
const P0={bx:0,bz:0,py:0,fz:0,lift:0,ch:0,cy:0,hd:0,hy:0,hL:0,hR:0,kL:0,kR:0,sL:0.05,eL:-0.15,wL:0,zL:0,sR:0.05,eR:-0.15,wR:0,zR:0};
const P=o=>Object.assign({},P0,o);
const lerpP=(a,b,k)=>{ const o={}; for(const key in P0)o[key]=a[key]+(b[key]-a[key])*k; return o; };
function track(keys,u){ for(let i=0;i<keys.length-1;i++){ const [u0,p0]=keys[i],[u1,p1]=keys[i+1]; if(u<=u1)return lerpP(p0,p1,sm((u-u0)/(u1-u0))); } return keys[keys.length-1][1]; }
function apply(f,p){ f.body.rotation.set(p.bx,0,p.bz); f.body.position.set(0,p.lift,p.fz); f.pelvis.position.y=0.28+p.py;
  f.chest.rotation.set(p.ch,p.cy,0); f.head.rotation.set(p.hd,p.hy,0);
  f.hipL.rotation.x=p.hL; f.hipR.rotation.x=p.hR; f.kneeL.rotation.x=p.kL; f.kneeR.rotation.x=p.kR;
  f.shL.rotation.set(p.sL,0,0.1+p.zL); f.elL.rotation.x=p.eL; f.handL.rotation.x=p.wL-p.ch-p.sL-p.eL;
  f.shR.rotation.set(p.sR,0,-0.1-p.zR); f.elR.rotation.x=p.eR; f.handR.rotation.x=p.wR-p.ch-p.sR-p.eR; }
function gripP(f){ const p=P({});                                    // руки в покое — по снаряжению
  if(f.wpn==='spear'||f.wpn==='banner'){ p.sR=-0.12; p.eR=-1.35; p.wR=UP+0.06; }
  else if(f.wpn==='staff'){ p.sR=-0.25; p.eR=-0.8; p.wR=UP+0.07; }
  else if(f.wpn==='axe'){ p.sR=0.12; p.eR=-0.35; p.wR=1.25; }
  if(f.shield){ p.sL=0.08; p.eL=-0.4; p.wL=-0.05; p.zL=0.12; }
  return p; }
function idleP(f,t){ const p=gripP(f), q=t*f.sp+f.ph;
  p.ch=0.025*Math.sin(q*1.6); p.hy=0.4*Math.sin(q*0.31)*Math.sin(q*0.13); p.bz=0.015*Math.sin(q*0.5); p.hL=-0.04; p.hR=0.04;
  if(f.wpn==='banner')p.wR+=0.04*Math.sin(q*0.9);
  return p; }
function walkP(f){ const p=gripP(f), a=f.wph, s=Math.sin(a), c=Math.cos(a);
  p.hL=-0.42*s; p.hR=0.42*s; p.kL=0.08+0.8*Math.max(0,c); p.kR=0.08+0.8*Math.max(0,-c);
  p.py=0.007*Math.cos(2*a)-0.004; p.bx=0.06; p.hy=0;
  if(!f.wpn)p.sR=-0.35*s; else p.sR+=0.06*s;
  if(!f.shield)p.sL=0.35*s; else p.sL+=0.05*s;
  return p; }
const THRUST=[                                                       // копейщик: отвод — выпад — задержка — стойка
  [0,   P({bx:0.05,hL:-0.25,kL:0.25,hR:0.25,kR:0.15, sR:-0.55,eR:-0.95,wR:0.05, sL:-0.95,eL:-0.55,wL:0,zL:-0.1})],
  [0.3, P({bx:-0.04,ch:-0.08,hL:-0.3,kL:0.3,hR:0.3,kR:0.2, sR:0.15,eR:-1.2,wR:0.0, sL:-1.0,eL:-0.6,wL:0,zL:-0.1})],
  [0.45,P({bx:0.22,ch:0.12,hL:-0.65,kL:0.55,hR:0.45,kR:0.1, sR:-1.35,eR:-0.05,wR:0.12, sL:-0.7,eL:-0.7,wL:0,zL:-0.1,hd:-0.1,fz:0.13})],
  [0.6, P({bx:0.2,ch:0.1,hL:-0.6,kL:0.5,hR:0.42,kR:0.1, sR:-1.3,eR:-0.1,wR:0.1, sL:-0.75,eL:-0.7,wL:0,zL:-0.1,hd:-0.1,fz:0.11})],
  [1,   P({bx:0.05,hL:-0.25,kL:0.25,hR:0.25,kR:0.15, sR:-0.55,eR:-0.95,wR:0.05, sL:-0.95,eL:-0.55,wL:0,zL:-0.1})]];
const CHOP=[                                                         // варвар: замах из-за головы — удар сверху — задержка — стойка
  [0,   P({bx:0.05,hL:-0.2,kL:0.2,hR:0.2,kR:0.15, sR:-0.6,eR:-1.1,wR:-1.2, sL:-0.5,eL:-0.6})],
  [0.35,P({bx:-0.08,ch:-0.12,hL:-0.25,kL:0.25,hR:0.3,kR:0.2, sR:-2.9,eR:-0.7,wR:-3.3, sL:-0.8,eL:-0.4,hd:-0.15})],
  [0.48,P({bx:0.3,ch:0.2,hL:-0.6,kL:0.5,hR:0.45,kR:0.1, sR:-1.0,eR:-0.15,wR:0.35, sL:-0.3,eL:-0.5,hd:0.05,fz:0.12})],
  [0.62,P({bx:0.28,ch:0.18,hL:-0.58,kL:0.48,hR:0.42,kR:0.1, sR:-0.85,eR:-0.2,wR:0.5, sL:-0.3,eL:-0.5,fz:0.1})],
  [1,   P({bx:0.05,hL:-0.2,kL:0.2,hR:0.2,kR:0.15, sR:-0.6,eR:-1.1,wR:-1.2, sL:-0.5,eL:-0.6})]];
const BLOCK=[                                                        // вожак со стягом: щит вперёд — толчок щитом — стойка
  [0,   P({bx:-0.02,hL:-0.2,kL:0.2,hR:0.25,kR:0.2, sL:-1.15,eL:-0.5,wL:0,zL:-0.15, sR:-0.12,eR:-1.35,wR:UP+0.1})],
  [0.4, P({bx:0.18,ch:0.1,hL:-0.5,kL:0.45,hR:0.4,kR:0.1, sL:-1.45,eL:-0.15,wL:0,zL:-0.1, sR:-0.2,eR:-1.3,wR:UP+0.35,fz:0.1})],
  [0.6, P({bx:0.15,ch:0.08,hL:-0.45,kL:0.4,hR:0.38,kR:0.1, sL:-1.4,eL:-0.2,wL:0,zL:-0.1, sR:-0.2,eR:-1.3,wR:UP+0.3,fz:0.08})],
  [1,   P({bx:-0.02,hL:-0.2,kL:0.2,hR:0.25,kR:0.2, sL:-1.15,eL:-0.5,wL:0,zL:-0.15, sR:-0.12,eR:-1.35,wR:UP+0.1})]];
const STRIKE_U={spear:0.45,axe:0.48,banner:0.4};
// 17.10 «окопалась» (вариант C): на правом колене, левая нога вперёд; щит сомкнут перед собой, копьё упёрто наклоном вперёд; стяг — стоймя
function kneelP(f,t){ const q=t*f.sp+f.ph;
  const p=P({py:-0.115,bx:0.12,hL:-1.45,kL:1.42,hR:0.12,kR:1.5,hd:-0.06+0.02*Math.sin(q*0.7),ch:0.015*Math.sin(q*1.3)});
  if(f.wpn==='spear'){ p.sR=-0.62; p.eR=-0.85; p.wR=0.32; }
  else if(f.wpn==='banner'){ p.sR=-0.12; p.eR=-1.35; p.wR=UP+0.06; }
  else if(f.wpn==='staff'){ p.sR=-0.25; p.eR=-0.8; p.wR=UP+0.07; }
  if(f.shield){ p.sL=-1.05; p.eL=-0.55; p.wL=0; p.zL=-0.18; }
  return p; }
function digP(f,t){ const k=Math.min(1,(t-(f.digT??t))/0.7); return lerpP(idleP(f,t),kneelP(f,t),sm(k)); }
function cheerP(f,t){ const q=t*7*f.sp+f.ph, b=Math.max(0,Math.sin(q));
  const p=P({sR:-2.75+0.25*Math.sin(q),eR:-0.3,wR:UP-0.05, sL:-0.3,eL:-0.5, py:0.014*b, hd:-0.22, bx:-0.05, kL:0.1*b,kR:0.1*b});
  if(f.shield){ p.sL=-0.5; p.eL=-0.6; p.wL=0; }
  if(f.wpn==='banner'){ p.sR=-2.95+0.15*Math.sin(q*0.7); p.wR=UP+0.2*Math.sin(q*0.7); }
  return p; }
function fallP(f,a,from){ const k=Math.min(1,a/0.75), kk=k*k;   // падение навзничь «с тяжестью», рука с оружием отлетает
  const to=P({bx:-1.52,bz:f.fallSide*0.25,lift:0.045,hL:-0.35,hR:-0.1,kL:0.55,kR:0.25,sL:-0.6,eL:-0.3,zL:0.9,sR:-0.7,eR:-0.2,zR:0.8,wR:f.wpn==='axe'?0.6:0.1,wL:0,hd:0.25,hy:f.fallSide*0.5});
  const p=lerpP(from,to,Math.min(1,k*1.6)); p.bx=from.bx+(to.bx-from.bx)*kk; p.bz=to.bz*kk; p.lift=to.lift*kk;
  if(k<1&&k>0.85)p.bx+=Math.sin((k-0.85)/0.15*PI)*0.05;               // отскок о землю
  return p; }
function poseFig(f,t,dt){ let p;
  if(f.mode==='walk'){ f.wph+=dt*7*Math.max(0.6,(f.vel||0.5)/0.5); p=walkP(f); }
  else if(f.mode==='fight'){ const keys=f.wpn==='spear'?THRUST:f.wpn==='axe'?CHOP:BLOCK;
    const u=((t-f.fT0)/f.cyc+f.ph/(PI*2))%1; f.prevU=f.u??u; f.u=u; p=track(keys,u); p.hy=0; }
  else if(f.mode==='cheer') p=cheerP(f,t);
  else if(f.mode==='dig') p=digP(f,t);
  else p=idleP(f,t);
  if(f.hitT!=null){ const k=(t-f.hitT)/0.38; if(k>=0&&k<1){ const r=Math.sin(k*PI); p.bx-=0.28*r; p.hd-=0.35*r; p.fz-=0.05*r; p.bz+=0.08*r*f.fallSide; } }
  if(f.dieT!=null){ if(!f.lastP)f.lastP=p; p=fallP(f,t-f.dieT,f.lastP); } else f.lastP=null;
  apply(f,p);
  if(f.flag)waveFlag(f.flag,t,f.mode==='cheer'?1.6:f.mode==='walk'?1.2:0.7); }

// ================= ОТРЯДЫ =================
// kind: 'scout' — разведчик, 'band' — дружина (4 копейщика, у вожака стяг), 'raid' — варвары (3 с топорами).
function dress(kind,col,lead){
  if(kind==='scout'){ const f=mkMan({hat:'hood',cloak:true,bag:true,tunic:TUNIC[2],beard:true}); f.wpn='staff'; f.handR.add(mkStaff()); return f; }
  if(kind==='band'){ const f=mkMan({hat:'cap',tunic:TUNIC[[0,1,4,0][Math.floor(R()*4)]]});
    const w=lead?mkBanner(col):mkSpear(); f.handR.add(w); f.wpn=lead?'banner':'spear'; f.flag=lead?w.userData.flag:null;
    f.handL.add(mkShield(col)); f.shield=true; return f; }
  const fm=FUR[Math.floor(R()*FUR.length)];
  const f=mkMan({hat:'fur',cape:true,furM:fm,shinM:FUR[2],beard:true,tunic:TUNIC_DARK[Math.floor(R()*TUNIC_DARK.length)]});
  f.handR.add(mkAxe(R()<0.4)); f.wpn='axe'; return f; }
const FORM={scout:[[0,0]], band:[[-0.12,0.11],[0.12,0.11],[0.12,-0.13],[-0.12,-0.13]], raid:[[0,0.13],[-0.15,-0.07],[0.15,-0.09]]};
const COL={me:'#3a6fc4', raid:'#8a2a1c'};
function initFig(f){ f.ph=R()*PI*2; f.sp=rr(0.9,1.1); f.wph=R()*PI*2; f.fallSide=R()<0.5?-1:1; f.mode='idle'; f.cyc=rr(0.95,1.2); return f; }
function mkUnit(kind,o={}){
  const col=o.col||(kind==='raid'?COL.raid:COL.me);
  const g=new THREE.Group(), mv=new THREE.Group(); g.add(mv);
  const figs=FORM[kind].map(([x,z],i)=>{ const f=initFig(dress(kind,col,kind==='band'&&i===3));
    f.root.position.set(x+rr(-0.02,0.02),0,z+rr(-0.02,0.02)); f.root.rotation.y=rr(-0.12,0.12); mv.add(f.root); return f; });
  const ring=mkRing(col,kind==='scout'?0.22:0.36); mv.add(ring);
  let mode='idle', s=0, dir=1, tt=0, dug=false, digT=-9;
  const fort=new THREE.Group(); fort.visible=false; mv.add(fort); const stakes=[];   // 17.10: окоп — полукольцо вала и колья остриём наружу
  if(kind==='band'){                                                   // 17.10 (2-й заход, Артём: «не отличается от обычной дружины»): замкнутый вал, вскопанная земля, частокол по кругу
    const pit=new THREE.Mesh(new THREE.CircleGeometry(0.4,28),mat({color:0x4a3524,roughness:1})); pit.rotation.x=-PI/2; pit.position.y=0.006; pit.receiveShadow=true; pit.userData.noSh=1; fort.add(pit);
    const bank=new THREE.Mesh(new THREE.TorusGeometry(0.44,0.07,6,32),mat({color:0x8a6a45,roughness:1})); bank.rotation.x=PI/2; bank.scale.z=0.75; bank.position.y=0.02; bank.castShadow=true; bank.receiveShadow=true; fort.add(bank);
    for(let i=0;i<14;i++){ const a=i/14*PI*2+0.11, st=new THREE.Group(); st.position.set(Math.sin(a)*0.5,0.03,Math.cos(a)*0.5); st.rotation.y=a; fort.add(st);
      const m=ST(new THREE.Mesh(new THREE.CylinderGeometry(0.0,0.022,0.44,5),woodM)); m.position.y=0.2; m.rotation.x=0.22; st.add(m); stakes.push(st); } }
  g.userData={kind,figs,ring,col,get dug(){ return dug; },
    dig(on){ dug=!!on; digT=tt; fort.visible=dug; for(const f of figs){ f.mode=dug?'dig':'idle'; f.digT=tt; } },
    mode(m){ mode=m; for(const f of figs)f.mode=(m==='walk'||m==='go')?'walk':(dug?'dig':'idle'); if(m!=='walk'){ mv.position.z=0; mv.rotation.y=0; s=0; dir=1; } },   // go — шагает на месте (ведёт игра)
    upd(dt){ tt+=dt;
      if(mode==='walk'){ s+=dir*0.45*dt; if(Math.abs(s)>0.45){ s=Math.sign(s)*0.45; dir=-dir; }   // марш туда-обратно
        mv.position.z=s; mv.rotation.y+=((dir>0?0:PI)-mv.rotation.y)*Math.min(1,dt*6); for(const f of figs)f.vel=0.45; }
      else if(mode==='go')for(const f of figs)f.vel=0.9;
      if(fort.visible){ const k=Math.min(1,(tt-digT)/0.9); for(let i=0;i<stakes.length;i++){ const ki=Math.max(0.001,Math.min(1,k*1.6-i*0.08)); stakes[i].scale.set(1,ki,1); } }   // колья вырастают по очереди
      for(const f of figs)poseFig(f,tt,dt); }};
  for(const f of figs)poseFig(f,0,0);
  return g; }

// ================= СТОЙБИЩЕ ВАРВАРОВ =================
function mkCamp(o={}){ const g=new THREE.Group();
  const pg=new THREE.CircleGeometry(1.15,40), pp=pg.attributes.position;         // вытоптанная земля с рваным краем
  for(let i=1;i<pp.count;i++){ const x=pp.getX(i), y=pp.getY(i), a=Math.atan2(y,x), k=1+0.12*Math.sin(a*5+1)+0.06*Math.sin(a*11); pp.setXY(i,x*k,y*k); }
  pg.setAttribute('uv1',pg.attributes.uv);
  const patch=new THREE.Mesh(pg,K.M.dirt); patch.rotation.x=-PI/2; patch.position.y=0.008; patch.receiveShadow=true; g.add(patch);
  const tents=[]; for(const [x,z,ry] of[[-0.5,-0.35,0.6],[0.5,-0.42,-0.9]]){ const t=K.mkTent(); t.scale.setScalar(0.5); t.position.set(x,0,z); t.rotation.y=ry; g.add(t); tents.push(t); }
  const fire=K.mkFire(); fire.scale.setScalar(0.72); fire.position.set(0.05,0,0.3); g.add(fire);
  const flM=new THREE.MeshBasicMaterial({color:0xffa04a,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false});
  const flames=[0,1,2].map(i=>{ const m=new THREE.Mesh(new THREE.ConeGeometry(0.06-i*0.012,0.2-i*0.03,7),flM); m.position.set(0.05+(i-1)*0.03,0.12,0.3+(i%2)*0.02); m.userData.noSh=1; g.add(m); return m; });
  const light=new THREE.PointLight(0xff9a48,0.8,2.2,2); light.position.set(0.05,0.3,0.3); if(o.light!==false)g.add(light);   // в игре без света: каждый новый источник пересобирает шейдеры всей сцены
  for(const [x,z,ry] of[[-0.32,0.42,0.3],[0.42,0.48,-0.4]]){ const l=log(0.42,0.045,0.042); l.rotation.set(0,ry,PI/2); l.position.set(x,0.045,z); g.add(l); }   // брёвна-сиденья
  const n0=g.children.length;
  { const pole=log(1.3,0.032,0.026); pole.position.set(-0.05,0.65,-0.85); g.add(pole);    // шест с конским черепом и хвостами
    const bar=log(0.4,0.016,0.016); bar.rotation.z=PI/2; bar.position.set(-0.05,1.12,-0.85); g.add(bar);
    const sk=new THREE.Group(); sk.position.set(-0.05,1.32,-0.82); sk.rotation.x=0.95; g.add(sk);
    const cr=ST(new THREE.Mesh(new THREE.SphereGeometry(1,10,8).scale(0.04,0.042,0.12),boneM)); sk.add(cr);
    const jw=new THREE.Mesh(new THREE.SphereGeometry(1,8,6).scale(0.026,0.018,0.1),boneM); jw.position.set(0,-0.035,0.02); sk.add(jw);
    for(const s of[-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,4),eyeM); e.position.set(s*0.028,0.014,-0.035); sk.add(e); }
    for(const x of[-0.17,-0.06,0.07,0.17]){ const t=new THREE.Mesh(new THREE.ConeGeometry(0.018,0.3,5),HAIR[x>0?3:4]); t.rotation.x=PI; t.position.set(-0.05+x,0.97,-0.85); g.add(t); } }
  const totem=g.children.slice(n0);                                               // шест с черепом и хвостами — «стяг» стойбища
  { const h=K.mkHide(); h.scale.setScalar(0.6); h.position.set(-0.85,0,0.25); h.rotation.y=1.2; g.add(h); }
  for(let i=0;i<5;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.01,rr(0.08,0.14),5),boneM); b.rotation.set(PI/2,R()*3,0); b.position.set(0.3+rr(-0.15,0.15),0.012,0.05+rr(-0.12,0.12)); g.add(b); }
  const guard=initFig(dress('raid')); guard.root.position.set(0.42,0,0.05); guard.root.rotation.y=-2.2; g.add(guard.root);   // караульный у костра
  let tt=0;
  let ruined=false;
  g.userData={tents,
    ruin(on){ ruined=!!on;                                                        // 17.10: разорено дружиной (nestLook старого): шатры повалены, шест и караульный сняты, костёр погас
      tents.forEach((t,k)=>{ t.rotation.z=on?(k?-1.35:1.35):0; t.position.y=on?0.12:0; });
      totem.forEach(m=>m.visible=!on); guard.root.visible=!on; flames.forEach(m=>m.visible=!on); light.visible=!on; },
    upd(dt){ if(ruined)return; tt+=dt; flames.forEach((m,i)=>{ const k=0.85+0.25*Math.sin(tt*(11+i*3)+i)+0.1*Math.sin(tt*23+i*2); m.scale.set(1,k,1); m.position.y=0.06+0.1*k*(0.2-i*0.03)/0.2; });
      light.intensity=0.7+0.25*Math.sin(tt*13)+0.1*Math.sin(tt*29); poseFig(guard,tt,dt); }, mode(){}};
  poseFig(guard,0,0);
  return g; }

// ================= СРАЖЕНИЕ =================
// Дружина (A, слева) против варваров (B, справа). o.win: 'a' — дружина побеждает, 'b' — варвары.
// Сходятся бегом, бьются парами ~3 с, павшие падают по одному и лежат; у проигравших последний бежит,
// победители вскидывают оружие, стяг вожака поднимается и бьётся на ветру. Табличка «сила × сила», пыль из-под ног.
function swordsTag(a,b){ const c=document.createElement('canvas'); c.width=320; c.height=96; const g=c.getContext('2d');
  g.fillStyle='rgba(31,38,45,0.82)'; const r=18; g.beginPath(); g.moveTo(r,0); g.arcTo(320,0,320,96,r); g.arcTo(320,96,0,96,r); g.arcTo(0,96,0,0,r); g.arcTo(0,0,320,0,r); g.fill();
  g.save(); g.translate(52,48); g.strokeStyle='#ffe9c2'; g.lineCap='round';           // скрещённые мечи
  for(const s of[-1,1]){ g.save(); g.rotate(s*PI/4); g.lineWidth=7; g.beginPath(); g.moveTo(0,-30); g.lineTo(0,18); g.stroke();
    g.lineWidth=6; g.beginPath(); g.moveTo(-11,14); g.lineTo(11,14); g.stroke(); g.lineWidth=7; g.beginPath(); g.moveTo(0,18); g.lineTo(0,30); g.stroke(); g.restore(); }
  g.restore();
  g.font='800 50px system-ui,-apple-system,sans-serif'; g.fillStyle='#ffe9c2'; g.textBaseline='middle'; g.fillText(`${a} × ${b}`,100,52);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,depthTest:false})); sp.scale.set(0.9,0.27,1); sp.renderOrder=5; return sp; }
function mkBattle(o={}){
  const g=new THREE.Group(); let S=null;
  const dust=[]; for(let i=0;i<48;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffT,transparent:true,depthWrite:false,opacity:0}));
    s.visible=false; s.renderOrder=3; g.add(s); dust.push({s,life:0,age:0,v:0,s0:0,s1:0,o:0}); }
  let di=0; const puff=(x,z,size,life,op)=>{ const d=dust[di++%dust.length]; d.s.visible=true; d.s.position.set(x+rr(-0.06,0.06),0.05,z+rr(-0.06,0.06));
    d.age=0; d.life=life*rr(0.8,1.2); d.s0=size*0.35; d.s1=size*rr(0.9,1.3); d.v=rr(0.05,0.14); d.o=op; };
  function start(win){
    if(S){ for(const f of[...S.A,...S.B])g.remove(f.root); g.remove(S.ringA,S.ringB,S.tag); }
    win=win||o.win||'a';
    const mk=(kind,cx,face)=>FORM[kind].map(([x,z],i)=>{ const f=initFig(dress(kind,kind==='band'?(o.col||COL.me):COL.raid,kind==='band'&&i===3));
      const ry=face, c=Math.cos(ry), s=Math.sin(ry);               // строй развёрнут лицом к врагу
      f.x=cx+x*c+z*s; f.z=-x*s+z*c; f.ry=ry; f.side=kind; g.add(f.root); return f; });
    const A=mk('band',-1.5,PI/2), B=mk('raid',1.5,-PI/2);
    A.forEach((f,i)=>f.tgt=B[i%B.length]); B.forEach((f,i)=>f.tgt=A[i]);
    const W=win==='a'?A:B, L=win==='a'?B:A;
    // павшие: у проигравших — все, кроме одного (бежит); у победителей — по старым потерям (дружина теряет 0.4 силы варваров → 1 из 4; варвары — 1 из 3)
    const shuffle=a=>a.map(v=>[R(),v]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
    const runner=L.find(f=>f.wpn!=='banner'); const lDie=shuffle(L.filter(f=>f!==runner));
    lDie.forEach((f,i)=>f.dieAt=2.0+i*(2.2/lDie.length)+rr(0,0.3)); runner.fleeAt=4.5;
    const wDie=W.find(f=>f.wpn!=='banner'&&f!==W[0]); wDie.dieAt=rr(2.4,3.6);
    const ringA=mkRing(o.col||COL.me,0.36), ringB=mkRing(COL.raid,0.36); g.add(ringA,ringB);
    const tag=swordsTag(o.strA||30,o.strB||18); tag.visible=false; g.add(tag);
    S={t:0,A,B,W,L,ringA,ringB,tag,win};
    for(const d of dust){ d.s.visible=false; d.age=d.life=0; }
    step(0); }
  const alive=f=>f.dieT==null&&!f.fled;
  function step(dt){ const t=S.t+=dt, all=[...S.A,...S.B];
    for(const f of all){
      if(f.dieAt!=null&&f.dieT==null&&t>=f.dieAt){ f.dieT=t; for(let i=0;i<4;i++)puff(f.x,f.z,0.45,1.4,0.55); }
      if(f.dieT!=null){ poseFig(f,t,dt); continue; }
      const foes=(f.side==='band'?S.B:S.A).filter(e=>alive(e)&&e.fleeAt==null||alive(e)&&t<e.fleeAt);
      let mode='idle', vx=0, vz=0;
      if(f.fleeAt!=null&&t>=f.fleeAt){ mode='walk'; const a=f.side==='band'?PI*1.5:PI/2; vx=Math.sin(a)*0.75; vz=Math.cos(a)*0.75; let da=a-f.ry; da=Math.atan2(Math.sin(da),Math.cos(da)); f.ry+=da*Math.min(1,dt*5); }   // бегство
      else if(t<0.3){ mode='idle'; }
      else if(t>=4.6&&S.W.includes(f)){ mode='cheer'; }
      else { let e=f.tgt&&alive(f.tgt)?f.tgt:null;
        if(!e){ let bd=1e9; for(const q of foes){ const d=Math.hypot(q.x-f.x,q.z-f.z); if(d<bd){ bd=d; e=q; } } f.tgt=e; }
        if(e){ const dx=e.x-f.x, dz=e.z-f.z, d=Math.hypot(dx,dz)||1, want=Math.atan2(dx,dz);
          let da=want-f.ry; da=Math.atan2(Math.sin(da),Math.cos(da)); f.ry+=da*Math.min(1,dt*6);
          const reach=f.wpn==='spear'?0.75:0.62;                      // 16.10 (Артём: «чуть дальше» → «ещё дальше»): удар условный, как в Циве — выпад-шаг к врагу
          if(d>reach+0.03){ mode='walk'; const sp=t<2?0.75:0.45; vx=dx/d*sp; vz=dz/d*sp; }
          else { mode='fight'; if(d<reach-0.06){ vx=-dx/d*0.25; vz=-dz/d*0.25; } } } }
      for(const q of (f.side==='band'?S.A:S.B)){ if(q===f||q.dieT!=null)continue; const dx=f.x-q.x, dz=f.z-q.z, d=Math.hypot(dx,dz);   // свои не влезают друг в друга
        if(d<0.45&&d>1e-4){ vx+=dx/d*0.7*(0.45-d)/0.45; vz+=dz/d*0.7*(0.45-d)/0.45; } }
      if(mode==='fight'&&f.mode!=='fight'){ f.fT0=t; f.u=null; }
      f.mode=mode; f.vel=Math.hypot(vx,vz); f.x+=vx*dt; f.z+=vz*dt;
      poseFig(f,t,dt);
      if(mode==='fight'&&f.prevU!=null){ const su=STRIKE_U[f.wpn]??0.45;        // удар достиг цели: враг отшатывается, пыль
        if(f.prevU<su&&f.u>=su){ const e=f.tgt; if(e&&alive(e)&&R()<0.6&&e.wpn!=='banner')e.hitT=t; puff((f.x+(e?e.x:f.x))/2,(f.z+(e?e.z:f.z))/2,0.4,1.2,0.5); } }
      if(mode==='walk'&&R()<dt*3)puff(f.x,f.z,0.25,0.9,0.35);
      if(f.fleeAt!=null&&t>f.fleeAt+2.2)f.fled=true;
    }
    for(const f of all){ f.root.visible=!f.fled; f.root.position.set(f.x,o.ground?o.ground(f.x,f.z):0,f.z); f.root.rotation.y=f.ry; }   // o.ground — высота земли в осях боя (игра); в просмотрщике ровно
    if(t>1.3&&t<4.6&&R()<dt*14){ const fs=all.filter(alive); const f=fs[Math.floor(R()*fs.length)]; if(f)puff(f.x,f.z,0.55,1.6,0.45); }   // пыль схватки
    for(const d of dust){ if(!d.s.visible)continue; d.age+=dt; const k=d.age/d.life; if(k>=1){ d.s.visible=false; continue; }
      const sc=d.s0+(d.s1-d.s0)*Math.sqrt(k); d.s.scale.set(sc,sc*0.8,1); d.s.position.y=(o.ground?o.ground(d.s.position.x,d.s.position.z):0)+0.05+d.v*k+sc*0.3; d.s.material.opacity=d.o*(k<0.15?k/0.15:1-(k-0.15)/0.85); }
    const cen=(arr,ring)=>{ const fs=arr.filter(f=>f.dieT==null&&!f.fled); ring.visible=fs.length>0; if(!fs.length)return;   // кольцо — за живыми отряда
      let x=0,z=0; for(const f of fs){ x+=f.x; z+=f.z; } ring.position.x=x/fs.length; ring.position.z=z/fs.length; if(o.ground)ring.position.y=o.ground(ring.position.x,ring.position.z)+0.01; };
    cen(S.A,S.ringA); cen(S.B,S.ringB);
    const tg=S.tag, k=(t-1.5)/3.2; tg.visible=k>0&&k<1; if(tg.visible){ tg.position.set(0,(o.ground?o.ground(0,0):0)+1.0+k*0.4,0); tg.material.opacity=1-k*k; } }
  start(o.win);
  g.userData={upd(dt){ step(Math.min(dt,0.05)); },
    restart(win){ start(win); },
    seek(t,win){ start(win); const n=Math.round(t*30); for(let i=0;i<n;i++)step(1/30); },
    time:()=>S.t,
    center(){ const fs=[...S.A,...S.B].filter(f=>!f.fled&&(f.dieT==null||S.t<4.6)); let x=0,z=0; for(const f of fs){ x+=f.x; z+=f.z; }   // середина схватки — для камеры
      return fs.length?{x:x/fs.length,z:z/fs.length}:{x:0,z:0}; },
    state:()=>({t:+S.t.toFixed(2),win:S.win,A:S.A.map(f=>f.dieT!=null?'пал':f.fled?'бежал':f.mode),B:S.B.map(f=>f.dieT!=null?'пал':f.fled?'бежал':f.mode)}),
    mode(){}};
  return g; }

return {mkMan,mkUnit,mkCamp,mkBattle,COL};
}
