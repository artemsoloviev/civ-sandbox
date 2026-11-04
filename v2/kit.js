// kit.js — общий набор моделей «Новой цивилизации»: текстуры, материалы, деревья, постройки, животные, загон, пашня, причал, ступени поселений.
// 15.10: вынесено из big.html, чтобы игра (big.html) и просмотрщик (models.html) показывали ОДНИ И ТЕ ЖЕ модели.
// Мир подаётся снаружи (W): высота земли, реки, тропы, кольцо по X. В просмотрщике — плоская земля.
export function makeKit(W){
const {THREE,mergeGeometries,R,TL}=W;
const rr=(a,b)=>a+(b-a)*R();
const hash=W.hash, HEXR=W.HEXR;
const heightAt=(x,z,n)=>W.heightAt(x,z,n), riverD=(x,z)=>W.riverD(x,z), wdx=(a,b)=>W.wdx(a,b), mergeGeos=gs=>W.mergeGeos(gs);
const TRAILS={near:(x,z,r)=>W.trailNear(x,z,r)};
const worldRV=()=>W.RV();          // не W.RV() в теле: у пашни/длинного дома/причала своя переменная W (ширина)
function cnv(n){const c=document.createElement('canvas');c.width=c.height=n;return c;}
function tex(c,rep=1){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=8;return t;}

// плотная трава тайла (детальная, тайлится на плитке)
function grassCanvas(seed,base,dryK){
  const c=cnv(512);const g=c.getContext('2d');
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(seed);
  g.fillStyle=base;g.fillRect(0,0,512,512);
  for(let i=0;i<180;i++){ // крупные пятна свет/сушь
    g.fillStyle=`hsla(${74+L()*30},${30+L()*22}%,${24+L()*20}%,${0.25+L()*0.3})`;
    g.beginPath();g.ellipse(L()*512,L()*512,14+L()*52,10+L()*36,L()*3,0,7);g.fill();}
  for(let i=0;i<9000;i++){ // травинки
    const x=L()*512,y=L()*512,t0=L();
    g.strokeStyle=`hsla(${70+t0*34},${34+t0*26}%,${20+t0*30}%,0.8)`;
    g.lineWidth=0.8+L()*1.3;g.beginPath();g.moveTo(x,y);
    g.lineTo(x+(L()-0.5)*4,y-3-L()*7);g.stroke();}
  if(dryK)for(let i=0;i<160;i++){ // сухие метёлки
    const x=L()*512,y=L()*512;
    g.strokeStyle=`hsla(${48+L()*14},${40+L()*20}%,${44+L()*20}%,${0.5*dryK})`;
    g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(L()-0.5)*5,y-6-L()*8);g.stroke();}
  for(let i=0;i<240;i++){ // земля проплешинами
    g.fillStyle=`hsla(${30+L()*12},${26+L()*14}%,${28+L()*14}%,${0.2+L()*0.25})`;
    g.beginPath();g.ellipse(L()*512,L()*512,2+L()*6,1.5+L()*4,L()*3,0,7);g.fill();}
  return c;
}
const grassT =tex(grassCanvas(11,'#5d7038',0.2),2);
const dryT   =tex(grassCanvas(77,'#7a7a42',0.8),2);
const forestFloorT=tex(grassCanvas(33,'#41522c',0),2);
// вытоптанная земля деревни
function dirtCanvas(){
  const c=cnv(512);const g=c.getContext('2d');
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(55);
  g.fillStyle='#6d5a3c';g.fillRect(0,0,512,512);
  for(let i=0;i<7000;i++){const t0=L();
    g.fillStyle=`hsla(${28+t0*14},${22+t0*16}%,${24+t0*22}%,0.65)`;
    g.beginPath();g.ellipse(L()*512,L()*512,1.5+L()*5,1+L()*3.5,L()*3,0,7);g.fill();}
  for(let i=0;i<120;i++){ // камешки
    g.fillStyle=`hsl(${34+L()*12} ${12+L()*10}% ${46+L()*22}%)`;
    g.beginPath();g.ellipse(L()*512,L()*512,1.5+L()*3.5,1+L()*2.5,L()*3,0,7);g.fill();
    g.strokeStyle='rgba(30,22,12,0.5)';g.lineWidth=0.8;g.stroke();}
  for(let i=0;i<70;i++){ // трава пробивается
    g.strokeStyle=`hsla(${76+L()*24},32%,${26+L()*18}%,0.7)`;g.lineWidth=1;
    const x=L()*512,y=L()*512;g.beginPath();g.moveTo(x,y);g.lineTo(x+(L()-0.5)*4,y-4-L()*5);g.stroke();}
  return c;
}
const dirtT=tex(dirtCanvas(),2);
// скала
function rockCanvas(){
  const c=cnv(512);const g=c.getContext('2d');
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(88);
  g.fillStyle='#7e7a70';g.fillRect(0,0,512,512);
  for(let i=0;i<260;i++){g.fillStyle=`hsla(${30+L()*20},${6+L()*10}%,${34+L()*30}%,${0.3+L()*0.3})`;
    g.beginPath();g.ellipse(L()*512,L()*512,8+L()*40,6+L()*26,L()*3,0,7);g.fill();}
  for(let i=0;i<90;i++){ // трещины
    let x=L()*512,y=L()*512;g.strokeStyle='rgba(40,36,30,0.55)';g.lineWidth=1+L()*1.5;
    g.beginPath();g.moveTo(x,y);
    for(let s2=0;s2<4;s2++){x+=(L()-0.5)*60;y+=(L()-0.5)*60;g.lineTo(x,y);}g.stroke();}
  return c;
}
const rockT=tex(rockCanvas(),2);
// пашня: борозды
function fieldCanvas(){
  const c=cnv(512);const g=c.getContext('2d');
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(99);
  g.fillStyle='#6a5335';g.fillRect(0,0,512,512);
  for(let y=0;y<512;y+=18){
    const gr=g.createLinearGradient(0,y,0,y+18);
    gr.addColorStop(0,'#7c6440');gr.addColorStop(0.5,'#5b452a');gr.addColorStop(1,'#443317');
    g.fillStyle=gr;g.fillRect(0,y,512,18);
    for(let i=0;i<60;i++){g.fillStyle=`hsla(${32+L()*10},20%,${22+L()*22}%,0.5)`;
      g.beginPath();g.ellipse(L()*512,y+L()*18,1.5+L()*4,1+L()*2.5,0,0,7);g.fill();}}
  for(let i=0;i<130;i++){ // ростки
    g.strokeStyle=`hsla(${80+L()*20},40%,${28+L()*16}%,0.8)`;g.lineWidth=1.2;
    const x=L()*512,y=Math.floor(L()*28)*18+5;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+(L()-0.5)*3,y-4-L()*5);g.stroke();}
  return c;
}
const fieldT=tex(fieldCanvas(),1.6);
// солома / кора / торцы / плетень (из эталона)
function strawCanvas(w,h,frayed){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  g.fillStyle='#b08a3e';g.fillRect(0,0,w,h);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(777+w+h);
  for(let i=0;i<w*3;i++){const x=L()*w, wd=0.8+L()*1.8, v=L();
    g.strokeStyle=`hsl(${34+L()*12} ${30+L()*22}% ${22+v*30}%)`;g.lineWidth=wd;g.beginPath();
    const bow=(L()-0.5)*6;g.moveTo(x,-4);g.quadraticCurveTo(x+bow,h*0.5,x+(L()-0.5)*10,h+4);g.stroke();}
  for(let i=0;i<w/6;i++){const x=L()*w;g.strokeStyle='rgba(60,40,10,0.35)';g.lineWidth=2+L()*3;
    g.beginPath();g.moveTo(x,0);g.lineTo(x+(L()-0.5)*14,h);g.stroke();}
  if(frayed){
    g.globalCompositeOperation='destination-out';
    for(let x=0;x<w;x+=2){const d=h*(0.06+0.10*L());g.fillRect(x,h-d,2,d);}
    g.globalCompositeOperation='source-over';
  }
  return c;
}
const strawT=tex(strawCanvas(512,512,false));strawT.wrapT=THREE.ClampToEdgeWrapping;
const strawFrT=(()=>{const t=tex(strawCanvas(512,512,true));t.wrapT=THREE.ClampToEdgeWrapping;return t;})();
function barkCanvas(){
  const c=cnv(256);const g=c.getContext('2d');g.fillStyle='#7d5f3d';g.fillRect(0,0,256,256);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(311);
  for(let i=0;i<420;i++){const y=L()*256, ln=20+L()*120, x=L()*256;
    g.strokeStyle=`hsl(${24+L()*12} ${20+L()*20}% ${26+L()*22}%)`;g.lineWidth=1+L()*2.5;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+ln,y+(L()-0.5)*8);g.stroke();}
  for(let i=0;i<14;i++){const x=L()*256,y=L()*256,r2=3+L()*6;
    g.fillStyle='#3d2a17';g.beginPath();g.ellipse(x,y,r2,r2*0.7,L(),0,7);g.fill();}
  return c;
}
const barkT=tex(barkCanvas());barkT.rotation=Math.PI/2;barkT.center.set(0.5,0.5);
function ringCanvas(){
  const c=cnv(128);const g=c.getContext('2d');g.fillStyle='#c9a86f';g.beginPath();g.arc(64,64,63,0,7);g.fill();
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(99);
  for(let r2=60;r2>3;r2-=2+L()*4){g.strokeStyle=`hsl(33 ${30+L()*20}% ${34+L()*22}%)`;
    g.lineWidth=1+L();g.beginPath();g.arc(64+(L()-0.5)*5,64+(L()-0.5)*5,r2,0,7);g.stroke();}
  return c;
}
const ringT=tex(ringCanvas());
// листва
const leafC=cnv(128);
{ const lg=leafC.getContext('2d');
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(606);
  lg.fillStyle='#4e6a30';lg.fillRect(0,0,128,128);
  for(let i=0;i<900;i++){lg.fillStyle=`hsl(${84+L()*28} ${28+L()*24}% ${20+L()*26}%)`;
    lg.beginPath();lg.ellipse(L()*128,L()*128,1.5+L()*3.5,1+L()*2.5,L()*3,0,7);lg.fill();}}
const leafT=tex(leafC,2);
// карточка листвы: плотная листовая масса по кластерной маске, рваный край
const leafCardC=cnv(256);
{ const lg=leafCardC.getContext('2d');lg.clearRect(0,0,256,256);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(909);
  // маска кластера: слитые овалы
  const blobs=[];
  for(let b=0;b<6;b++)blobs.push([128+(L()-0.5)*120,128+(L()-0.5)*110,42+L()*38,34+L()*30]);
  const inMask=(x,y)=>blobs.some(([bx,by,rx,ry])=>((x-bx)/rx)**2+((y-by)/ry)**2<1);
  // тёмная подложка массы
  for(const [bx,by,rx,ry] of blobs){
    lg.fillStyle='rgba(28,42,18,0.9)';
    lg.beginPath();lg.ellipse(bx,by,rx*0.92,ry*0.92,0,0,7);lg.fill();}
  // листья: сотни мелких, светлее к краям массы
  for(let i=0;i<2400;i++){
    const x=L()*256,y=L()*256;
    const inside=inMask(x,y);
    if(!inside && L()>0.06) continue;          // редкие листья за маской = рваный край
    lg.fillStyle=`hsla(${78+L()*36},${32+L()*26}%,${22+L()*30}%,${0.8+L()*0.2})`;
    lg.beginPath();lg.ellipse(x,y,1.2+L()*2.6,0.9+L()*2,L()*3,0,7);lg.fill();}
  // блики верхних листьев
  for(let i=0;i<420;i++){
    const x=L()*256,y=L()*256; if(!inMask(x,y)) continue;
    lg.fillStyle=`hsla(${84+L()*26},${40+L()*20}%,${44+L()*18}%,0.75)`;
    lg.beginPath();lg.ellipse(x,y,1+L()*1.8,0.8+L()*1.4,L()*3,0,7);lg.fill();}}
const leafCardT=(()=>{const t=new THREE.CanvasTexture(leafCardC);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const wattleT=(()=>{ const c=cnv(128);const g=c.getContext('2d');g.fillStyle='#7a5c36';g.fillRect(0,0,128,128);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(1234);
  for(let y=0;y<128;y+=10)for(let x=0;x<128;x+=24){
    g.fillStyle=`hsl(${30+L()*12} ${30+L()*15}% ${26+L()*18}%)`;
    g.beginPath();g.ellipse(x+12,y+5,13,4.5,((x/24+y/10)%2)?0.16:-0.16,0,7);g.fill();}
  return tex(c,2); })();

// ================= МАТЕРИАЛЫ =================
// фото-текстуры CC0 (ambientCG): цвет + нормали + затенение пор
function photoMat(id,rep,tint){
  const c=TL.load('../visual2/tex/'+id+'_c.jpg'); c.colorSpace=THREE.SRGBColorSpace;
  c.wrapS=c.wrapT=THREE.RepeatWrapping; c.repeat.set(rep,rep); c.anisotropy=8;
  const n=TL.load('../visual2/tex/'+id+'_n.jpg');
  n.wrapS=n.wrapT=THREE.RepeatWrapping; n.repeat.set(rep,rep);
  const ao=TL.load('../visual2/tex/'+id+'_ao.jpg');
  ao.wrapS=ao.wrapT=THREE.RepeatWrapping; ao.repeat.set(rep,rep);
  return new THREE.MeshStandardMaterial({map:c,normalMap:n,aoMap:ao,aoMapIntensity:0.9,
    roughness:1,color:tint||0xffffff});
}
// макро-вариация оттенка (лечит «заливку» фото-травы с высоты)
function addMacro(mat,amp=0.16,scale=1.7){
  mat.onBeforeCompile=sh=>{
    sh.uniforms.uMac={value:[amp,scale]};
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\nuniform vec2 uMac;')
      .replace('#include <map_fragment>',
        `#include <map_fragment>\n{ vec2 mu=vMapUv*uMac.y;
          float n=sin(mu.x*3.1+mu.y*5.3)*0.5+sin(mu.x*7.7-mu.y*2.9+1.7)*0.3+sin(mu.x*1.3+mu.y*1.1+4.2)*0.6;
          diffuseColor.rgb*=1.0+n*uMac.x*0.5;
          diffuseColor.g*=1.0+sin(mu.x*2.2-mu.y*3.7)*uMac.x*0.35; }`);};
  return mat;
}
const M={
  grass:addMacro(photoMat('Grass005',3)),
  dry:  addMacro(photoMat('Grass005',3,0xdccfa2)),
  ffloor:addMacro(photoMat('Ground042',3),0.12),
  dirt: addMacro(photoMat('Ground048',4),0.12),
  rock: photoMat('Rock030',2.2),
  field:photoMat('Ground048',3),
  snowCap:photoMat('Snow015',1),
  sand: photoMat('Sand033',3),
  tundra: photoMat('Ground037',3),
  side: (()=>{const m=photoMat('Ground048',1);m.map.repeat.set(4,0.7);m.normalMap.repeat.set(4,0.7);m.aoMap.repeat.set(4,0.7);m.color.set(0x9a8468);return m;})(),
  log:  new THREE.MeshStandardMaterial({map:barkT,roughness:0.95}),
  ring: new THREE.MeshStandardMaterial({map:ringT,roughness:0.9}),
  straw:new THREE.MeshStandardMaterial({map:strawT,roughness:1,side:THREE.DoubleSide}),
  strawFr:new THREE.MeshStandardMaterial({map:strawFrT,roughness:1,side:THREE.DoubleSide,transparent:true,alphaTest:0.45}),
  leaf: new THREE.MeshStandardMaterial({map:leafT,bumpMap:leafT,bumpScale:1.6,roughness:0.97}),
  leafCard:new THREE.MeshStandardMaterial({map:leafCardT,alphaTest:0.4,side:THREE.DoubleSide,roughness:1}),
  stone:new THREE.MeshStandardMaterial({color:0x8d8778,roughness:1}),
  water:new THREE.MeshStandardMaterial({color:0x3d6a78,roughness:0.35,metalness:0.05}),
  wattle:new THREE.MeshStandardMaterial({map:wattleT,roughness:1}),
  dark: new THREE.MeshBasicMaterial({color:0x0f0a05}),
};

function log(len,r0,r1){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,len,7),M.log);
  body.castShadow=body.receiveShadow=true;g.add(body);
  for(const e of[-1,1]){const cap=new THREE.Mesh(new THREE.CircleGeometry(e<0?r0:r1,7),M.ring);
    cap.position.y=e*len/2;cap.rotation.x=e<0?Math.PI/2:-Math.PI/2;g.add(cap);}
  return g;
}

// ================= ДЕКОР =================
// листовой спрайт: пучок из ~15 листиков на прозрачном фоне
const leafSpriteC=cnv(64);
{ const lg=leafSpriteC.getContext('2d');lg.clearRect(0,0,64,64);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(515);
  for(let i=0;i<15;i++){
    const a=L()*Math.PI*2, d=L()*22, x=32+Math.cos(a)*d, y=32+Math.sin(a)*d;
    lg.fillStyle=`hsla(${80+L()*34},${34+L()*24}%,${26+L()*28}%,${0.85+L()*0.15})`;
    lg.save();lg.translate(x,y);lg.rotate(L()*3.2);
    lg.beginPath();lg.ellipse(0,0,3+L()*4.5,1.6+L()*2.4,0,0,7);lg.fill();lg.restore();}}
const leafSpriteT=(()=>{const t=new THREE.CanvasTexture(leafSpriteC);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const leafSpriteMat=new THREE.MeshStandardMaterial({map:leafSpriteT,alphaTest:0.3,side:THREE.DoubleSide,roughness:1});
const crownCoreMat=new THREE.MeshStandardMaterial({roughness:1,vertexColors:true}); // ядра крон: цельная масса
// ===== ДЕРЕВЬЯ СТАРОГО ДВИЖКА 1-в-1 (вердикт 06.10 «старый лес на порядок реалистичнее») =====
// crumple: помятие вершин шумом ОТ ПОЗИЦИИ (совпадающие вершины сдвигаются одинаково — грани не рвёт),
// низ кроны темнее / верх светлее через vertex colors. Код из site/index.html.
const crumpleB=(geo,amp,tones)=>{
  const pp=geo.attributes.position;
  const hsf=(x,y,z)=>{ const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return h-Math.floor(h); };
  geo.computeBoundingBox();
  const y0=geo.boundingBox.min.y, y1=geo.boundingBox.max.y;
  for(let i=0;i<pp.count;i++){
    const x=pp.getX(i), y=pp.getY(i), z=pp.getZ(i);
    pp.setXYZ(i, x+(hsf(x,y,z)-0.5)*amp, y+(hsf(z,x,y)-0.5)*amp*0.8, z+(hsf(y,z,x)-0.5)*amp); }
  if(tones){ const [dk,lt]=tones, col=new Float32Array(pp.count*3);
    for(let i=0;i<pp.count;i++){
      const t=(pp.getY(i)-y0)/((y1-y0)||1), f=dk+(lt-dk)*Math.min(1,Math.max(0,t));
      col[i*3]=f; col[i*3+1]=f; col[i*3+2]=f; }
    geo.setAttribute('color',new THREE.BufferAttribute(col,3)); }
  geo.computeVertexNormals(); return geo;
};
const TONESB=[0.60,1.22];
const _treeTexB=(w,h,draw)=>{ const cv=cnv(Math.max(w,h)); cv.width=w; cv.height=h;
  draw(cv.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
let _txSeedB=7; const _trB=()=>{ _txSeedB=(_txSeedB*1103515245+12345)&0x7fffffff; return _txSeedB/0x7fffffff; };
const barkTexB=_treeTexB(64,128,(c,w,h)=>{ c.fillStyle='#6f4a2a'; c.fillRect(0,0,w,h);
  for(let i=0;i<26;i++){ const x=_trB()*w, wd=1+_trB()*2.5, l=10+_trB()*80;
    c.fillStyle=_trB()<0.5?'rgba(52,32,16,0.55)':'rgba(140,100,62,0.45)';
    c.fillRect(x,_trB()*h,wd,l); } });
const birchTexB=_treeTexB(64,128,(c,w,h)=>{ c.fillStyle='#eceadf'; c.fillRect(0,0,w,h);
  for(let i=0;i<22;i++){ c.fillStyle='rgba(30,28,24,'+(0.35+_trB()*0.45)+')';
    c.fillRect(_trB()*w,_trB()*h,4+_trB()*12,1.5+_trB()*2.5); } });
const leafMottleTexB=_treeTexB(128,128,(c,w,h)=>{ c.fillStyle='#cfcfcf'; c.fillRect(0,0,w,h);
  for(let i=0;i<220;i++){ const r=2+_trB()*7, g=170+(_trB()*86|0);
    c.fillStyle='rgba('+g+','+g+','+g+',0.5)';
    c.beginPath(); c.arc(_trB()*w,_trB()*h,r,0,6.3); c.fill(); } });
const M_barkB=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,map:barkTexB});
const M_birchBarkB=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.9,map:birchTexB});
const _leafMatB=hex=>{ const m=new THREE.MeshStandardMaterial({color:hex,roughness:1,flatShading:true,
  map:leafMottleTexB,vertexColors:true}); m.color.multiplyScalar(1.12); return m; };
const M_leafPineB=_leafMatB(0x2f6b3a), M_leafOakB=_leafMatB(0x4c8f3f), M_leafAutB=_leafMatB(0xc8862f);
const pineTrunkGeoB=new THREE.CylinderGeometry(0.09,0.12,0.6,6).translate(0,0.3,0);
const pineCrownGeoB=crumpleB(mergeGeometries([0,1,2].map(i=>new THREE.ConeGeometry(0.7-i*0.18,0.9,7,1,true).translate(0,0.7+i*0.55,0))),0.11,TONESB);
const spruceTrunkGeoB=new THREE.CylinderGeometry(0.06,0.10,0.5,5).translate(0,0.25,0);
const spruceCrownGeoB=crumpleB(mergeGeometries([0,1,2,3].map(i=>new THREE.ConeGeometry(0.52-i*0.11,0.55,7,1,true).translate(0,0.5+i*0.4,0))),0.09,TONESB);
const umbTrunkGeoB=new THREE.CylinderGeometry(0.07,0.11,1.15,6).translate(0,0.57,0);
const umbCrownGeoB=crumpleB(mergeGeometries([
  new THREE.ConeGeometry(0.78,0.4,8,1,true).translate(0,1.3,0),
  new THREE.ConeGeometry(0.5,0.3,7,1,true).translate(0.18,1.5,0.1)]),0.10,TONESB);
const oakTrunkGeoB=new THREE.CylinderGeometry(0.1,0.14,0.7,6).translate(0,0.35,0);
const oakCrownGeoB=crumpleB(mergeGeometries([
  new THREE.IcosahedronGeometry(0.62,0).translate(0,1.12,0),
  new THREE.IcosahedronGeometry(0.45,0).translate(0.34,0.95,0.12),
  new THREE.IcosahedronGeometry(0.40,0).translate(-0.30,1.0,-0.16),
  new THREE.IcosahedronGeometry(0.34,0).translate(0.04,1.45,-0.04)]),0.15,TONESB);
const birchTrunkGeoB=new THREE.CylinderGeometry(0.045,0.065,0.95,6).translate(0,0.47,0);
const birchCrownGeoB=crumpleB(mergeGeometries([
  new THREE.IcosahedronGeometry(0.40,0).scale(1,1.25,1).translate(0,1.18,0),
  new THREE.IcosahedronGeometry(0.28,0).translate(0.2,0.9,0.1)]),0.12,TONESB);
function _tintB(){ const u=R(), w=(R()-0.5)*0.14, f=0.84+u*0.30;  // джиттер оттенка на дерево (fillIM старой игры)
  return [f*(1+w), f*(1+w*0.25), f*(1-w)]; }
function mkTree(s=1){   // дуб/берёза СТАРОГО движка
  const tr=new THREE.Group();
  const birch=R()<0.22, aut=R()<0.14;
  const trm=new THREE.Mesh(birch?birchTrunkGeoB:oakTrunkGeoB, birch?M_birchBarkB:M_barkB);
  trm.castShadow=true; tr.add(trm);
  const cm=new THREE.Mesh(birch?birchCrownGeoB:oakCrownGeoB, aut?M_leafAutB:M_leafOakB);
  cm.castShadow=true; cm.userData.tint=_tintB(); tr.add(cm);
  tr.rotation.y=R()*Math.PI*2; tr.scale.setScalar(s*1.15); return tr;
}
function mkPine(s=1){   // сосна/ель СТАРОГО движка
  const tr=new THREE.Group();
  const spruce=R()<0.5;
  const trm=new THREE.Mesh(spruce?spruceTrunkGeoB:pineTrunkGeoB, M_barkB);
  trm.castShadow=true; tr.add(trm);
  const cm=new THREE.Mesh(spruce?spruceCrownGeoB:pineCrownGeoB, M_leafPineB);
  cm.castShadow=true; cm.userData.tint=_tintB(); tr.add(cm);
  tr.rotation.y=R()*Math.PI*2; tr.scale.setScalar(s*0.95); return tr;
}
// южная сосна (пиния): высокий голый ствол, плоская крона-зонт
function mkSPine(s=1){  // пиния-зонт СТАРОГО движка
  const tr=new THREE.Group();
  const trm=new THREE.Mesh(umbTrunkGeoB,M_barkB); trm.castShadow=true; tr.add(trm);
  const cm=new THREE.Mesh(umbCrownGeoB,M_leafOakB);
  cm.castShadow=true; cm.userData.tint=_tintB(); tr.add(cm);
  tr.rotation.y=R()*Math.PI*2; tr.scale.setScalar(s*0.9); return tr;
}
// пальмовый лист: перистая лента с зубцами
const palmLeafT=(()=>{ const c=cnv(64); const g=c.getContext('2d');g.clearRect(0,0,64,64);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(212);
  g.strokeStyle='#3e5c22';g.lineWidth=3;
  g.beginPath();g.moveTo(32,64);g.lineTo(32,2);g.stroke();     // хребет
  for(let y=6;y<62;y+=4){ const w=26*(1-y/70)+6;               // перья, к концу короче
    g.strokeStyle=`hsl(${88+L()*22} ${38+L()*20}% ${24+L()*16}%)`;g.lineWidth=2.4;
    g.beginPath();g.moveTo(32,y);g.lineTo(32-w,y+5);g.stroke();
    g.beginPath();g.moveTo(32,y);g.lineTo(32+w,y+5);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t; })();
const palmLeafMat=new THREE.MeshStandardMaterial({map:palmLeafT,alphaTest:0.3,side:THREE.DoubleSide,roughness:1});
// пальма: изогнутый ствол + веер перистых листьев
function mkPalm(s=1){
  const tr=new THREE.Group();
  const a0=R()*Math.PI*2, bend=rr(0.12,0.3);
  let px=0,pz=0,py=0;
  for(let k=0;k<5;k++){
    const tl=bend*k/4;
    const seg=new THREE.Mesh(new THREE.CylinderGeometry(0.05-k*0.006,0.058-k*0.006,0.34,6),M.log);
    seg.position.set(px,py+0.16,pz);
    seg.rotation.set(Math.sin(a0)*tl,0,Math.cos(a0)*tl);
    seg.castShadow=true;tr.add(seg);
    px+=Math.cos(a0)*Math.sin(tl)*0.32; pz+=Math.sin(a0)*Math.sin(tl)*0.32; py+=Math.cos(tl)*0.32;}
  for(let k=0;k<9;k++){ const a=k/9*Math.PI*2+rr(-0.15,0.15);
    const g2=new THREE.PlaneGeometry(0.26,0.85); g2.translate(0,-0.36,0);
    const lf=new THREE.Mesh(g2,palmLeafMat);
    lf.position.set(px,py+0.1,pz);
    lf.rotation.set(rr(0.5,0.95),a,0,'YXZ');       // вниз-наружу веером
    lf.castShadow=true;tr.add(lf);}
  const cr=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,5),
    new THREE.MeshStandardMaterial({color:0x5a4a22,roughness:1}));
  cr.position.set(px,py+0.05,pz);tr.add(cr);
  tr.scale.setScalar(s);return tr;
}
// коряга болота: голый кривой ствол
function mkSnag(s=1){
  const tr=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({color:0x6b6257,roughness:1});
  const st=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.05,rr(0.5,0.8),5),m);
  st.position.y=0.3;st.rotation.set(rr(-0.3,0.3),0,rr(-0.3,0.3));st.castShadow=true;tr.add(st);
  for(let k=0;k<2;k++){const br=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.018,rr(0.2,0.35),4),m);
    br.position.set(rr(-0.06,0.06),rr(0.35,0.55),rr(-0.06,0.06));
    br.rotation.set(rr(-1,1),0,rr(-1,1));tr.add(br);}
  tr.scale.setScalar(s);return tr;
}
// зонтичное дерево саванны: наклонный ствол + плоская широкая крона
function mkAcacia(s=1){
  const tr=new THREE.Group();
  const tilt=rr(-0.16,0.16);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.075,0.75,6),M.log);
  trunk.position.y=0.36;trunk.rotation.z=tilt;trunk.castShadow=true;tr.add(trunk);
  for(let b=0;b<3;b++){const a=b/3*Math.PI*2+0.5;
    const br=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.03,0.34,5),M.log);
    br.position.set(Math.cos(a)*0.12-tilt*0.5,0.78,Math.sin(a)*0.12);
    br.rotation.set(Math.sin(a)*0.9,0,Math.cos(a)*0.9);br.castShadow=true;tr.add(br);}
  { const N=46;
    const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5,0.4),leafSpriteMat,N);
    const Mx=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),C=new THREE.Color();
    for(let k=0;k<N;k++){
      const a=R()*Math.PI*2, d=Math.sqrt(R())*0.72;
      E.set(rr(-1.65,-1.45),R()*Math.PI,rr(-0.15,0.15));Q.setFromEuler(E); // почти плоско
      Mx.compose(new THREE.Vector3(Math.cos(a)*d-tilt*0.6,0.95+rr(-0.045,0.05)-d*0.1,Math.sin(a)*d),Q,
        new THREE.Vector3(rr(0.75,1.2),rr(0.75,1.1),1));
      im.setMatrixAt(k,Mx);
      C.setHSL(0.21+rr(-0.02,0.03),rr(0.4,0.55),rr(0.3,0.42),THREE.SRGBColorSpace);
      im.setColorAt(k,C);}
    im.castShadow=true;tr.add(im); }
  tr.scale.setScalar(s);return tr;
}
// камыш болота: пучок стеблей с бурыми головками
const reedMat=new THREE.MeshStandardMaterial({color:0x5a6b34,roughness:1,side:THREE.DoubleSide});
const reedHeadMat=new THREE.MeshStandardMaterial({color:0x6b4a26,roughness:1});
function addReeds(g,n,cx,cz){
  for(let i=0;i<n;i++){
    const a=R()*Math.PI*2, d=Math.sqrt(R())*HEXR*0.8;
    const lx=Math.cos(a)*d, lz=Math.sin(a)*d;
    const y=heightAt(cx+lx,cz+lz);
    if(y>-0.15||y<-0.62)continue;          // камыш живёт у кромки окон воды
    const cl=new THREE.Group();
    for(let k2=0;k2<rr(3,6);k2++){
      const h=rr(0.35,0.6);
      const st=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.012,h,4),reedMat);
      st.position.set(rr(-0.07,0.07),h/2,rr(-0.07,0.07));
      st.rotation.set(rr(-0.12,0.12),0,rr(-0.12,0.12));cl.add(st);
      if(R()<0.7){const hd=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.1,5),reedHeadMat);
        hd.position.set(st.position.x,h+0.04,st.position.z);cl.add(hd);}}
    cl.position.set(lx,y,lz);g.add(cl);}
}
function mkRock(s=1){
  const g2=new THREE.DodecahedronGeometry(0.4,0);
  const m=new THREE.Mesh(g2,M.stone);
  m.scale.set(s,s*rr(0.5,0.7),s);m.rotation.set(R()*3,R()*3,R()*3);
  m.castShadow=true;return m;
}
// хата (компактная версия эталона)
function mkHut(s=1){
  const g=new THREE.Group();
  const RAD2=1.15,W2=1.3,A2=2.7,E2=0.2;
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(RAD2-0.02,RAD2+0.03,W2,24,1,true,0,Math.PI*11/6),
    new THREE.MeshStandardMaterial({map:barkT,roughness:1}));
  wall.position.y=W2/2;wall.castShadow=wall.receiveShadow=true;g.add(wall);
  const inner=new THREE.Mesh(new THREE.CylinderGeometry(RAD2-0.1,RAD2-0.1,W2-0.05,16,1,true),
    new THREE.MeshBasicMaterial({color:0x0f0a05,side:THREE.BackSide}));
  inner.position.y=W2/2-0.03;g.add(inner);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;
    const p=log(W2+0.14,0.045,0.055);p.position.set(Math.cos(a)*(RAD2+0.04),(W2+0.14)/2,Math.sin(a)*(RAD2+0.04));
    g.add(p);}
  // крыша-толща
  const RB2=RAD2+E2+0.08,YB2=W2+0.02,RT2=0.14,YT2=A2;
  const pts=[new THREE.Vector2(RB2-0.13,YB2-0.16),new THREE.Vector2(RB2+0.06,YB2-0.13),
             new THREE.Vector2(RB2+0.11,YB2-0.0),new THREE.Vector2(RB2+0.07,YB2+0.1)];
  for(let k=1;k<=5;k++){const t=k/5;
    pts.push(new THREE.Vector2(RB2*(1-t)+RT2*t+0.02+0.02*Math.sin(k*2.2),YB2*(1-t)+YT2*t));}
  const rg=new THREE.LatheGeometry(pts,36);
  const P=rg.attributes.position;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),r2=Math.hypot(x,z);
    if(r2<0.05)continue;const a=Math.atan2(z,x);
    const n=Math.sin(a*6+y*2.2)*0.5+Math.sin(a*13+1.7+y)*0.3+Math.sin(a*23+y*7)*0.2;
    P.setXYZ(i,x*(1+n*0.05),y+n*0.05,z*(1+n*0.05));}
  rg.computeVertexNormals();
  const roofT2=tex(strawCanvas(512,512,false));roofT2.repeat.set(16,3);
  const roof=new THREE.Mesh(rg,new THREE.MeshStandardMaterial({map:roofT2,bumpMap:roofT2,bumpScale:2.4,roughness:1}));
  roof.castShadow=roof.receiveShadow=true;g.add(roof);
  for(let k=0;k<12;k++){ // стропильные концы из-под свеса
    const a=k/12*Math.PI*2+0.1,r0=RB2+0.16;
    const rf=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.026,0.5,5),M.log);
    rf.position.set(Math.cos(a)*(r0-0.12),YB2-0.1,Math.sin(a)*(r0-0.12));
    rf.rotation.set(Math.sin(a)*1.1,0,Math.cos(a)*1.1);g.add(rf);}
  { // рваные пряди соломы по краю крыши (из эталона)
    const frG=new THREE.PlaneGeometry(0.22,0.26);frG.translate(0,-0.11,0);
    for(let k=0;k<11;k++){const a=k/11*Math.PI*2+0.25;
      const fr=new THREE.Mesh(frG,M.strawFr);
      fr.position.set(Math.cos(a)*(RB2+0.08),YB2-0.1,Math.sin(a)*(RB2+0.08));
      fr.rotation.set(rr(-0.2,0),Math.PI/2-a,rr(-0.35,-0.2));g.add(fr);}}
  for(let k=0;k<6;k++){ // сноп
    const a=k/6*Math.PI*2;
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.02,rr(0.5,0.7),5),M.log);
    p.position.set(Math.cos(a)*0.07,A2+0.18,Math.sin(a)*0.07);
    p.rotation.set(Math.cos(a)*0.25,0,-Math.sin(a)*0.25);g.add(p);}
  // дверь+косяки (a=105°)
  const aD=105*Math.PI/180, dx=Math.cos(aD),dz=Math.sin(aD);
  for(const da of[-0.3,0.3]){const j=log(0.96,0.035,0.04);
    j.position.set(Math.cos(aD+da*0.35)*(RAD2+0.02),0.48,Math.sin(aD+da*0.35)*(RAD2+0.02));g.add(j);}
  const lin=log(0.5,0.035,0.035);lin.rotation.z=Math.PI/2;
  const lh=new THREE.Group();lh.add(lin);lh.rotation.y=-aD;lh.position.set(dx*(RAD2+0.02),0.97,dz*(RAD2+0.02));g.add(lh);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(0.36,0.82),M.dark);
  door.position.set(dx*(RAD2-0.04),0.45,dz*(RAD2-0.04));door.rotation.y=-aD+Math.PI/2;g.add(door);
  // входная группа: навес на стойках + рваный край + помост (компакт из эталона hata)
  {const p2=new THREE.Group();p2.rotation.y=-aD;g.add(p2);
   for(const [px,pz,h] of [[RAD2+0.78,-0.5,0.88],[RAD2+0.76,0.48,0.92]]){
     const st=log(h,0.032,0.026);st.position.set(px,h/2,pz);
     st.rotation.z=rr(-0.05,0.05);p2.add(st);}
   for(const [bx,by] of [[RAD2+0.22,1.06],[RAD2+0.72,0.9]]){
     const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.02,1.2,6),M.log);
     bar.rotation.x=Math.PI/2;bar.position.set(bx,by,0);bar.castShadow=true;p2.add(bar);}
   const shedGeo=new THREE.PlaneGeometry(1.15,1.25);
   shedGeo.rotateX(-Math.PI/2);shedGeo.rotateZ(-0.3);
   const shed=new THREE.Mesh(shedGeo,M.straw);
   shed.position.set(RAD2+0.38,1.02,0);shed.castShadow=true;p2.add(shed);
   const frG=new THREE.PlaneGeometry(0.22,0.24);frG.translate(0,-0.1,0);
   for(let i=0;i<5;i++){const fr=new THREE.Mesh(frG,M.strawFr);
     fr.position.set(RAD2+0.92,0.86,-0.5+i*0.25+rr(-0.03,0.03));
     fr.rotation.set(rr(-0.15,0.05),Math.PI/2,rr(-0.32,-0.18));p2.add(fr);}
   for(let i=0;i<3;i++){const pl=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.045,0.2),M.log);
     pl.position.set(RAD2+0.42,0.05+rr(0,0.02),(i-1)*0.22);
     pl.rotation.y=rr(-0.05,0.05);pl.castShadow=pl.receiveShadow=true;p2.add(pl);}
  }
  // камни по кругу
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2+hash(k,3)*0.3;
    const st=new THREE.Mesh(new THREE.DodecahedronGeometry(rr(0.05,0.09),0),M.stone);
    st.position.set(Math.cos(a)*RAD2,0.03,Math.sin(a)*RAD2);st.scale.y=0.6;
    st.rotation.set(R()*3,R()*3,R()*3);g.add(st);}
  g.scale.setScalar(s);return g;
}
// сруб (компактный, с перерубами)
function mkCabin(s=1){
  const g=new THREE.Group();
  const W2=1.15,Dp=0.9,LH=0.13,R2=0.066,RH=0.5;
  for(let r2=0;r2<5;r2++){const y=R2+r2*LH;
    const lx=r2%2?0.06:0.3, lz=r2%2?0.3:0.06;
    for(const sgn of[-1,1]){
      let l=log(W2+lx,R2,R2*rr(0.9,1.05));l.rotation.z=Math.PI/2;
      const h1=new THREE.Group();h1.add(l);h1.position.set(0,y,sgn*Dp/2);g.add(h1);
      l=log(Dp+lz,R2,R2*rr(0.9,1.05));l.rotation.z=Math.PI/2;
      const h2=new THREE.Group();h2.add(l);h2.rotation.y=Math.PI/2;
      h2.position.set(sgn*W2/2,y+LH/2,0);g.add(h2);}}
  const top=R2+5*LH;
  for(let k=0;k<3;k++){const t=(k+1)/4,len=Dp*(1-t*0.85),y=top+(k+0.6)*(RH/3)*0.8;
    for(const sgn of[-1,1]){
      const l=log(len,R2*0.85,R2*0.85);l.rotation.z=Math.PI/2;
      const h=new THREE.Group();h.add(l);h.rotation.y=Math.PI/2;
      h.position.set(sgn*W2/2,y,0);g.add(h);}}
  {const l=log(W2+0.4,0.055,0.06);l.rotation.z=Math.PI/2;
   const h=new THREE.Group();h.add(l);h.position.set(0,top+RH,0);g.add(h);}
  const half=Dp/2+0.16,RL=Math.hypot(half,RH),ang=Math.atan2(RH,half);
  const roofT2=tex(strawCanvas(512,512,false));roofT2.repeat.set(4,2);
  for(const sgn of[-1,1]){
    const rgeo=new THREE.PlaneGeometry(W2+0.4,RL,6,3);
    const P=rgeo.attributes.position;
    for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);
      P.setZ(i,(Math.sin(x*4)*0.5+Math.sin(y*7+x*9)*0.5)*0.03);}
    rgeo.computeVertexNormals();
    const m=new THREE.Mesh(rgeo,new THREE.MeshStandardMaterial({map:roofT2,bumpMap:roofT2,bumpScale:2,roughness:1,side:THREE.DoubleSide}));
    m.rotation.set(-(Math.PI/2-ang)*sgn+(sgn<0?Math.PI:0),0,0);
    m.position.set(0,top+RH/2+0.04,sgn*half/2);m.castShadow=true;g.add(m);
    const roll=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,W2+0.38,8),
      new THREE.MeshStandardMaterial({map:roofT2,roughness:1}));
    roll.rotation.z=Math.PI/2;roll.position.set(0,top+0.03,sgn*(half-0.01));g.add(roll);}
  for(let i=0;i<2;i++){const bx=(i-0.5)*W2*0.8;
    for(const s2 of[-1,1]){
      const p=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.02,0.55,5),M.log);
      p.rotation.x=s2*0.5;p.position.set(bx,top+RH+0.06,s2*0.11);g.add(p);}}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(0.26,0.46),M.dark);
  door.position.set(0.06,0.24,Dp/2+R2+0.01);g.add(door);
  // дверные косяки с перемычкой (из эталона)
  for(const ddx of[-0.16,0.16]){const j=log(0.5,0.018,0.02);
    j.position.set(0.06+ddx,0.25,Dp/2+R2+0.015);g.add(j);}
  {const lin=log(0.4,0.018,0.018);lin.rotation.z=Math.PI/2;
   lin.position.set(0.06,0.51,Dp/2+R2+0.015);g.add(lin);}
  // окно со ставнем (боковая стена)
  const win=new THREE.Mesh(new THREE.PlaneGeometry(0.17,0.15),M.dark);
  win.position.set(W2/2+R2+0.28*0,0.42,0); win.rotation.y=Math.PI/2;
  win.position.x=W2/2+R2+0.01; g.add(win);
  const shut=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.17,0.12),M.log);
  shut.position.set(W2/2+R2+0.02,0.42,0.15);g.add(shut);
  // цоколь-камни по периметру
  for(let k=0;k<8;k++){const t=k/8, a=t*Math.PI*2;
    const st=new THREE.Mesh(new THREE.DodecahedronGeometry(rr(0.04,0.07),0),M.stone);
    st.position.set(Math.cos(a)*(W2/2+0.05),0.035,Math.sin(a)*(Dp/2+0.06));
    st.scale.y=0.6;st.rotation.set(R()*3,R()*3,R()*3);g.add(st);}
  // пряди соломы из-под валика скатов
  {const frG=new THREE.PlaneGeometry(0.16,0.2);frG.translate(0,-0.09,0);
   for(const sgn of[-1,1])for(let k=0;k<4;k++){
     const fr=new THREE.Mesh(frG,M.strawFr);
     fr.position.set((k-1.5)*0.3,top-0.03,sgn*(Dp/2+0.2));
     fr.rotation.set(sgn>0?-0.3:Math.PI+0.3,0,rr(-0.1,0.1));g.add(fr);}}
  g.scale.setScalar(s);return g;
}
// двор: костровище, шкура, поленница, корзина
function mkFire(){ const g=new THREE.Group();
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;
    const s2=new THREE.Mesh(new THREE.DodecahedronGeometry(rr(0.07,0.1),0),M.stone);
    s2.position.set(Math.cos(a)*0.3,0.045,Math.sin(a)*0.3);s2.rotation.set(R()*3,R()*3,R()*3);g.add(s2);}
  const ash=new THREE.Mesh(new THREE.CircleGeometry(0.24,12),new THREE.MeshStandardMaterial({color:0x2e2a26,roughness:1}));
  ash.rotation.x=-Math.PI/2;ash.position.y=0.02;g.add(ash);
  for(let i=0;i<3;i++){const l=log(rr(0.34,0.44),0.026,0.022);l.rotation.z=Math.PI/2;
    const h=new THREE.Group();h.add(l);h.rotation.y=R()*3;h.rotation.x=rr(0.05,0.14);
    h.position.set(rr(-0.05,0.05),0.05,rr(-0.05,0.05));g.add(h);}
  return g; }
function mkHide(){ const g=new THREE.Group();
  for(const dx of[-0.42,0.42]){const p=log(0.85,0.026,0.024);p.position.set(dx,0.42,0);
    p.rotation.z=dx>0?-0.09:0.09;g.add(p);}
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.016,0.92,5),M.log);
  bar.rotation.z=Math.PI/2;bar.position.y=0.74;g.add(bar);
  const hc=cnv(64);const hg=hc.getContext('2d');
  hg.fillStyle='#96754c';hg.beginPath();
  hg.moveTo(10,4);hg.quadraticCurveTo(32,0,54,5);hg.quadraticCurveTo(63,30,52,56);
  hg.quadraticCurveTo(32,63,13,55);hg.quadraticCurveTo(1,29,10,4);hg.fill();
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(77);
  for(let i=0;i<14;i++){hg.fillStyle=`rgba(90,60,30,${0.15+L()*0.3})`;
    hg.beginPath();hg.ellipse(10+L()*44,8+L()*46,2+L()*6,1.5+L()*4,L()*3,0,7);hg.fill();}
  const ht=new THREE.CanvasTexture(hc);ht.colorSpace=THREE.SRGBColorSpace;
  const hide=new THREE.Mesh(new THREE.PlaneGeometry(0.58,0.62),
    new THREE.MeshStandardMaterial({map:ht,transparent:true,alphaTest:0.5,side:THREE.DoubleSide,roughness:1}));
  hide.position.y=0.42;g.add(hide);return g; }
function mkWoodpile(){ const g=new THREE.Group();
  for(let ry=0;ry<3;ry++)for(let i=0;i<5-ry;i++){
    const l=log(rr(0.5,0.6),0.042,0.04);l.rotation.z=Math.PI/2;
    const h=new THREE.Group();h.add(l);
    h.position.set((i-(4-ry)/2)*0.095,0.045+ry*0.078,rr(-0.01,0.01));g.add(h);}
  return g; }
function mkBasket(s=1){
  const pts=[];for(let i=0;i<=6;i++)pts.push(new THREE.Vector2(0.09+0.1*Math.sin(i/6*1.5),i/6*0.2));
  const b=new THREE.Mesh(new THREE.LatheGeometry(pts,10),
    new THREE.MeshStandardMaterial({map:wattleT,roughness:1,side:THREE.DoubleSide}));
  b.scale.setScalar(s);b.castShadow=true;return b; }

// снопики на поле
function mkSheaf(){ const g=new THREE.Group();
  const c=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.55,8),M.straw);
  c.position.y=0.27;c.castShadow=true;g.add(c);
  const tie=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.02,5,10),
    new THREE.MeshStandardMaterial({color:0x6d5327,roughness:1}));
  tie.rotation.x=Math.PI/2;tie.position.y=0.33;g.add(tie);return g; }

// ===== ЗАГОН, ПАШНЯ, ПРИЧАЛ ДЕРЕВНИ (14.10, новый вид в стиле big.html) =====
// Координаты — от центра клетки, высоты — абсолютные по heightAt (группа запекается, как тайл).
const wattleMat=new THREE.MeshStandardMaterial({map:wattleT,roughness:1,side:THREE.DoubleSide});
const woolT=(()=>{ const c=cnv(64);const g=c.getContext('2d');g.fillStyle='#e9e2d2';g.fillRect(0,0,64,64);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(42);
  for(let i=0;i<220;i++){ const v=200+L()*45|0; g.fillStyle=`rgb(${v},${v-8},${v-22})`;
    g.beginPath();g.arc(L()*64,L()*64,1.5+L()*2.5,0,7);g.fill(); }
  return tex(c,1); })();
const plankT=(()=>{ const c=cnv(128);const g=c.getContext('2d');g.fillStyle='#7d5f40';g.fillRect(0,0,128,128);
  const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(7);
  for(let y=0;y<128;y+=2){ g.strokeStyle=`rgba(${50+L()*30|0},${35+L()*20|0},${20+L()*12|0},${0.15+L()*0.3})`;
    g.beginPath();g.moveTo(0,y+L()*2);g.bezierCurveTo(40,y+L()*4-2,90,y+L()*4-2,128,y+L()*2);g.stroke(); }
  return tex(c,1); })();
const plankMat=new THREE.MeshStandardMaterial({map:plankT,roughness:0.95});
const SHEEP_WOOL=[new THREE.MeshStandardMaterial({map:woolT,roughness:1}),
  new THREE.MeshStandardMaterial({map:woolT,color:0xb39a78,roughness:1}),new THREE.MeshStandardMaterial({map:woolT,color:0x5a4a3c,roughness:1})];
const sheepDark=new THREE.MeshStandardMaterial({color:0x2f2620,roughness:0.9});
function mkSheep(){ const g=new THREE.Group();                     // овца ~1 м: руно, тёмная морда и ноги
  const w=SHEEP_WOOL[R()<0.7?0:R()<0.6?1:2];
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.5,10,8),w); body.scale.set(0.36,0.21,0.2); body.position.y=0.25; body.castShadow=true; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),sheepDark); head.scale.set(0.13,0.09,0.08); head.position.set(0.21,0.3,0); head.rotation.z=-0.35; g.add(head);
  for(const ex of[-1,1]){ const ear=new THREE.Mesh(new THREE.SphereGeometry(0.5,5,4),sheepDark); ear.scale.set(0.03,0.015,0.05); ear.position.set(0.18,0.34,ex*0.045); g.add(ear); }
  for(const [lx,lz] of [[0.1,0.055],[0.1,-0.055],[-0.1,0.055],[-0.1,-0.055]]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.014,0.18,5),sheepDark); leg.position.set(lx,0.09,lz); g.add(leg); }
  return g; }
// ---- 15.10: загон — жердевая изгородь (тонкие столбики + 2 жерди, трава видна насквозь), овцы и коровы (вердикт: «плетень не такой, добавь коров»)
const HIDE=(()=>{ const mk=(base,spots,seed)=>{ const c=cnv(128), g=c.getContext('2d'); g.fillStyle=base; g.fillRect(0,0,128,128);
    const L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(seed);
    if(spots)for(let i=0;i<7;i++){ g.fillStyle='#1c1917'; const bx=L()*128,by=L()*128;
      for(let k=0;k<5;k++){ g.beginPath(); g.ellipse(bx+(L()-0.5)*26,by+(L()-0.5)*18,8+L()*14,6+L()*10,L()*3,0,7); g.fill(); } }
    for(let i=0;i<1400;i++){ const x=L()*128,y=L()*128; g.strokeStyle=`rgba(${L()<0.5?'255,255,255':'0,0,0'},${0.04+L()*0.07})`;   // шерсть: короткие штрихи
      g.lineWidth=1; g.beginPath(); g.moveTo(x,y); g.lineTo(x+1+L()*2,y+3+L()*3); g.stroke(); }
    return tex(c,1); };
  return {brown:mk('#7b4b2c',false,11), pied:mk('#ece6da',true,12)}; })();
const COW_HIDE=[new THREE.MeshStandardMaterial({map:HIDE.brown,roughness:0.9}),
  new THREE.MeshStandardMaterial({map:HIDE.brown,color:0xe2b98c,roughness:0.9}),          // палевая
  new THREE.MeshStandardMaterial({map:HIDE.brown,color:0x6a4a3a,roughness:0.9}),          // тёмно-бурая
  new THREE.MeshStandardMaterial({map:HIDE.pied,roughness:0.9})];                          // пёстрая
const hornMat=new THREE.MeshStandardMaterial({color:0xd9ccb0,roughness:0.6}), muzMat=new THREE.MeshStandardMaterial({color:0x3a2a26,roughness:0.7}),
  udderMat=new THREE.MeshStandardMaterial({color:0xd4a08e,roughness:0.8});
function mkCow(){ const g=new THREE.Group(), h=COW_HIDE[Math.floor(R()*COW_HIDE.length)];   // корова ~0.55: крупнее овцы в 1.5 раза, вдоль +x
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.105,0.25,4,12),h); body.rotation.z=Math.PI/2; body.scale.set(1.08,1,0.86);
  body.position.y=0.3; body.castShadow=true; g.add(body);
  const hump=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),h); hump.scale.set(1,0.9,0.85); hump.position.set(0.12,0.33,0); g.add(hump);   // загривок
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.075,0.14,8),h); neck.position.set(0.24,0.33,0); neck.rotation.z=-1.0; g.add(neck);
  const head=new THREE.Mesh(new THREE.CapsuleGeometry(0.045,0.09,3,8),h); head.position.set(0.31,0.29,0); head.rotation.z=-0.5; g.add(head);
  const muz=new THREE.Mesh(new THREE.SphereGeometry(0.043,8,6),muzMat); muz.scale.set(0.8,0.75,1); muz.position.set(0.345,0.225,0); g.add(muz);
  for(const s of[-1,1]){
    const horn=new THREE.Mesh(new THREE.ConeGeometry(0.011,0.07,5),hornMat); horn.position.set(0.29,0.37,s*0.045); horn.rotation.set(s*-1.0,0,0.3); g.add(horn);
    const ear=new THREE.Mesh(new THREE.SphereGeometry(0.03,6,4),h); ear.scale.set(0.5,0.35,1); ear.position.set(0.28,0.335,s*0.065); g.add(ear); }
  for(const [lx,lz] of [[0.15,0.055],[0.15,-0.055],[-0.14,0.055],[-0.14,-0.055]]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.026,0.019,0.22,6),h); leg.position.set(lx,0.11,lz); leg.castShadow=true; g.add(leg);
    const hoof=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.022,0.025,6),muzMat); hoof.position.set(lx,0.012,lz); g.add(hoof); }
  const ud=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,6),udderMat); ud.scale.set(1,0.7,0.9); ud.position.set(-0.07,0.2,0); g.add(ud);
  const tail=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.008,0.22,4),h); tail.position.set(-0.27,0.26,0); tail.rotation.z=-0.12; g.add(tail);
  const tuft=new THREE.Mesh(new THREE.SphereGeometry(0.018,5,4),muzMat); tuft.scale.set(0.8,1.6,0.8); tuft.position.set(-0.283,0.15,0); g.add(tuft);
  return g; }
const railMat=new THREE.MeshStandardMaterial({map:barkT,color:0xb59a7c,roughness:0.95});
function rail(g,a,b,r){ const d=new THREE.Vector3().subVectors(b,a), len=d.length();          // жердь a→b (по склону)
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.15,len,5),railMat); m.position.addVectors(a,b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); m.castShadow=true; g.add(m); }
// 16.10 (Артём: «объединяющие элементы»): варианты на пробу — ?pen=1 общая изгородь двора; ?farm=A|B|C пашня единым полем.
// window.__farmV/__penV перебивают адрес (стенд). Пока Артём не выбрал — без параметров вид прежний.
const QS=(()=>{ try{ return new URLSearchParams(location.search); }catch(e){ return new Map(); } })();
const farmV=()=>(window.__farmV??(QS.get('farm')||'C')).toUpperCase();   // 16.10 Артём: «C, выкладывай»; ?farm=old — прежний вид
const penV=()=>window.__penV??(QS.get('pen')!=='0');   // 16.10 Артём: «ставь по умолчанию»; ?pen=0 — прежние круглые загоны
// ребро клетки к соседу [dx,dz]: середина d/2, полудлина |d|/(2√3) (гекс по вершинам)
const hexEdge=(dx,dz,inset)=>{ const d=Math.hypot(dx,dz), nx=dx/d, nz=dz/d, hl=d/(2*Math.sqrt(3)), mx=dx/2-nx*inset, mz=dz/2-nz*inset;
  return {ax:mx-nz*hl,az:mz+nx*hl,bx:mx+nz*hl,bz:mz-nx*hl,nx,nz,hl,d}; };
function mkPenGroup(c){ const g=new THREE.Group(), cx=c.x, cz=c.z, P=c.pen;   // изгородь только по внешним рёбрам пятна, ворота — одни, к городу
  const wet=(x,z,r)=>heightAt(cx+x,cz+z)<-0.5||(worldRV()>0&&riverD(cx+x,cz+z)<r);   // в воде/русле — ни столбов, ни скота
  for(let e=0;e<P.nb.length;e++){ const [dx,dz,inn]=P.nb[e]; if(inn)continue;
    const E=hexEdge(dx,dz,0.12), len=Math.hypot(E.bx-E.ax,E.bz-E.az), n=Math.max(2,Math.round(len/0.26));
    const pts=[]; for(let i=0;i<=n;i++){ const t=i/n, x=E.ax+(E.bx-E.ax)*t, z=E.az+(E.bz-E.az)*t; pts.push(new THREE.Vector3(x,heightAt(cx+x,cz+z),z)); }
    const gap=e===P.gate?[Math.floor(n/2)-1,Math.floor(n/2)+1]:null;
    for(let i=0;i<pts.length;i++){ const p=pts[i], gp=gap&&(i===gap[0]||i===gap[1]), h=gp?0.44:rr(0.31,0.36); if(wet(p.x,p.z,0.85))continue;
      const st=log(h,gp?0.022:0.015,gp?0.018:0.012); st.position.set(p.x,p.y+h/2-0.04,p.z); st.rotation.set(rr(-0.06,0.06),0,rr(-0.06,0.06)); g.add(st);
      if(i===pts.length-1||(gap&&i>=gap[0]&&i<gap[1]))continue;
      const q=pts[i+1]; if(wet(q.x,q.z,0.85))continue; for(const hy of[0.13,0.26]) rail(g,new THREE.Vector3(p.x,p.y+hy+rr(-0.01,0.01),p.z),new THREE.Vector3(q.x,q.y+hy+rr(-0.01,0.01),q.z),0.0065); } }
  const Rp=HEXR*0.72, put=(o,sc)=>{ for(let t=0;t<12;t++){ const a=R()*Math.PI*2, d=Math.sqrt(R())*Rp, x=Math.cos(a)*d, z=Math.sin(a)*d;
      if(wet(x,z,1.0)||g.children.some(k=>k.userData.ani&&Math.hypot(k.position.x-x,k.position.z-z)<0.3))continue;
      o.scale.setScalar(sc); o.position.set(x,heightAt(cx+x,cz+z)-0.01,z); o.rotation.y=R()*Math.PI*2; o.userData.ani=1; g.add(o); return; } };
  const nc=1+Math.floor(R()*2), ns=2+Math.floor(R()*3);
  for(let i=0;i<nc;i++)put(mkCow(),rr(0.92,1.05));
  for(let i=0;i<ns;i++)put(mkSheep(),rr(0.9,1.05));
  if(R()<0.5){ const a=R()*7, d=Rp*0.6, x=Math.cos(a)*d, z=Math.sin(a)*d;
    const hay=new THREE.Mesh(new THREE.SphereGeometry(0.13,10,7),M.straw); hay.scale.set(1.2,0.75,1); hay.position.set(x,heightAt(cx+x,cz+z)+0.03,z); hay.castShadow=true; g.add(hay); }
  return g; }
function mkPen(c){ if(c.pen.nb&&penV())return mkPenGroup(c);
  const g=new THREE.Group(), cx=c.x, cz=c.z, Rp=HEXR*0.5, N=26;
  const ga=Math.atan2(c.pen.vz-cz,wdx(c.pen.vx,cx));                // ворота — к деревне
  const P=[]; for(let i=0;i<=N;i++){ const a=ga+0.2+i/N*(Math.PI*2-0.4), r=Rp*(1+0.05*Math.sin(a*3+cx));
    const x=Math.cos(a)*r, z=Math.sin(a)*r; P.push(new THREE.Vector3(x,heightAt(cx+x,cz+z),z)); }
  for(let i=0;i<P.length;i++){ const p=P[i], gate=i===0||i===P.length-1, h=gate?0.44:rr(0.31,0.36);   // столбики; у ворот — выше
    const st=log(h,gate?0.022:0.015,gate?0.018:0.012); st.position.set(p.x,p.y+h/2-0.04,p.z); st.rotation.set(rr(-0.06,0.06),0,rr(-0.06,0.06)); g.add(st);
    if(i===P.length-1)break;
    const q=P[i+1];
    for(const hy of[0.13,0.26]) rail(g,new THREE.Vector3(p.x,p.y+hy+rr(-0.01,0.01),p.z),new THREE.Vector3(q.x,q.y+hy+rr(-0.01,0.01),q.z),0.0065); }
  const put=(o,sc)=>{ for(let t=0;t<12;t++){ const a=R()*Math.PI*2, d=Math.sqrt(R())*Rp*0.66, x=Math.cos(a)*d, z=Math.sin(a)*d;
      if(g.children.some(k=>k.userData.ani&&Math.hypot(k.position.x-x,k.position.z-z)<0.3))continue;   // не друг в друге
      o.scale.setScalar(sc); o.position.set(x,heightAt(cx+x,cz+z)-0.01,z); o.rotation.y=R()*Math.PI*2; o.userData.ani=1; g.add(o); return; } };
  const nc=1+Math.floor(R()*3), ns=2+Math.floor(R()*3);              // 1–3 коровы, 2–4 овцы
  for(let i=0;i<nc;i++)put(mkCow(),rr(0.92,1.05));
  for(let i=0;i<ns;i++)put(mkSheep(),rr(0.9,1.05));
  { const a=ga+Math.PI+rr(-0.6,0.6), x=Math.cos(a)*Rp*0.8, z=Math.sin(a)*Rp*0.8;      // копёшка сена у изгороди
    const hay=new THREE.Mesh(new THREE.SphereGeometry(0.13,10,7),M.straw); hay.scale.set(1.2,0.75,1); hay.position.set(x,heightAt(cx+x,cz+z)+0.03,z); hay.castShadow=true; g.add(hay); }
  return g; }

// ---- 15.10: пашня — лоскут из 5 полос по гексу, межи травой между ними (вердикт 14.10: «3 конуса на бурой подложке — не пашня»).
// Полосы: спелая пшеница (щётка колосьев, 2 полосы), свежая вспашка (борозды — рельефом, с тенью), всходы по гребням, стерня с копнами.
// Всё на клетку — 5–7 мешей (живая группа, не запекается); колосья/ростки/снопы слиты в один меш на вид.
const fseed=s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296;
const FT=(()=>{
  const ear=(g,x,y,lean,L,len)=>{ for(let k=0;k<7;k++){ const yy=y-k*len/7, xx=x+lean*k/7;                   // колос: зёрна парами
      for(const s of[-1,1]){ g.fillStyle=`hsl(${35+L()*9},${58+L()*14}%,${40+L()*24}%)`; g.beginPath(); g.ellipse(xx+s*2.1,yy,2.3,1.5,s*0.5,0,7); g.fill(); } }
    g.strokeStyle='rgba(240,222,170,0.55)'; g.lineWidth=0.7; for(let k=0;k<5;k++){ g.beginPath(); g.moveTo(x+lean,y-len); g.lineTo(x+lean+(L()-0.5)*8,y-len-8-L()*8); g.stroke(); } };
  // пучок колосьев сбоку (прозрачный фон) — для щётки пшеницы
  const tuft=(()=>{ const c=cnv(256), g=c.getContext('2d'), L=fseed(5);
    for(let i=0;i<80;i++){ const x0=14+L()*228, top=34+L()*86, lean=(L()-0.5)*30, x1=x0+lean;
      g.strokeStyle=`hsl(${40+L()*8},${42+L()*16}%,${50+L()*18}%)`; g.lineWidth=1.4+L()*0.9;
      g.beginPath(); g.moveTo(x0,256); g.quadraticCurveTo(x0+lean*0.3,(256+top)/2,x1,top+20); g.stroke();
      ear(g,x1,top+20,lean*0.1,L,20); }
    g.globalCompositeOperation='source-atop';
    const gr=g.createLinearGradient(0,120,0,256); gr.addColorStop(0,'rgba(60,44,18,0)'); gr.addColorStop(1,'rgba(52,40,16,0.7)'); g.fillStyle=gr; g.fillRect(0,0,256,256);
    const t=tex(c,1); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; return t; })();
  // пшеница сверху (подложка под щёткой): колосья вперемешку с тенью
  const top=(()=>{ const c=cnv(256), g=c.getContext('2d'), L=fseed(6); g.fillStyle='#7a5e2a'; g.fillRect(0,0,256,256);
    for(let i=0;i<2600;i++){ g.fillStyle=`hsl(${36+L()*10},${52+L()*18}%,${38+L()*30}%)`; g.beginPath();
      g.ellipse(L()*256,L()*256,3.4+L()*1.6,1.3,1.2+(L()-0.5)*1.2,0,7); g.fill(); }
    return tex(c,1); })();
  // стерня: короткие светлые пеньки рядами, тень, сброшенная солома
  const stub=(()=>{ const c=cnv(256), g=c.getContext('2d'), L=fseed(7); g.fillStyle='#8b7650'; g.fillRect(0,0,256,256);
    for(let i=0;i<3000;i++){ g.fillStyle=`hsla(${30+L()*12},${22+L()*14}%,${28+L()*22}%,0.5)`; g.fillRect(L()*256,L()*256,2,2); }
    for(let y=3;y<256;y+=7)for(let x=L()*4;x<256;x+=3+L()*3){ const yy=y+(L()-0.5)*2;
      g.fillStyle='rgba(50,38,20,0.55)'; g.fillRect(x+1,yy+1,1.6,2.4);
      g.fillStyle=`hsl(${44+L()*6},${42+L()*16}%,${68+L()*16}%)`; g.fillRect(x,yy-1.5,1.4,3.2); }
    g.lineWidth=1; for(let i=0;i<160;i++){ const x=L()*256,y=L()*256,a=L()*7,l=6+L()*10; g.strokeStyle=`hsla(46,45%,${70+L()*15}%,0.8)`;
      g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); }
    return tex(c,1); })();
  // росток: 5–7 листьев веером
  const sprout=(()=>{ const c=cnv(128), g=c.getContext('2d'), L=fseed(8);
    for(let i=0;i<9;i++){ const ex=64+(L()-0.5)*104, ey=10+L()*50; g.strokeStyle=`hsl(${88+L()*20},${55+L()*20}%,${42+L()*18}%)`; g.lineWidth=9+L()*5;   // толсто: тонкий лист в мипах уходит под alphaTest
      g.lineCap='round'; g.beginPath(); g.moveTo(64+(L()-0.5)*6,128); g.quadraticCurveTo(64+(ex-64)*0.2,ey+40,ex,ey); g.stroke(); }
    const t=tex(c,1); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; return t; })();
  // сноп: стебли вдоль, колосья сверху, перевясло в поясе
  const sheaf=(()=>{ const c=cnv(128), g=c.getContext('2d'), L=fseed(9); g.fillStyle='#b8934e'; g.fillRect(0,0,128,128);
    for(let i=0;i<500;i++){ const x=L()*128, y=36+L()*92; g.strokeStyle=`hsl(${42+L()*6},${45+L()*15}%,${50+L()*30}%)`; g.lineWidth=1;
      g.beginPath(); g.moveTo(x,y); g.lineTo(x+(L()-0.5)*2,y+10+L()*20); g.stroke(); }
    for(let i=0;i<260;i++){ g.fillStyle=`hsl(${35+L()*9},${55+L()*15}%,${38+L()*24}%)`; g.beginPath(); g.ellipse(L()*128,L()*40,1.8,3.2,0,0,7); g.fill(); }
    g.fillStyle='#6a5128'; g.fillRect(0,70,128,5);
    return tex(c,1); })();
  return {tuft,top,stub,sprout,sheaf}; })();
const FM={
  soil:new THREE.MeshStandardMaterial({map:M.dirt.map,normalMap:M.dirt.normalMap,color:0xf2e2d2,roughness:1}),   // свежая пахота: фото-земля (0x8a6a52 — чернота, 0xd2ad8c — бордо; кадры 15.10)
  soilV:new THREE.MeshStandardMaterial({map:M.dirt.map,normalMap:M.dirt.normalMap,color:0xf2e2d2,vertexColors:true,roughness:1}),   // всходы: зелень по гребням — цветом вершин
  top:new THREE.MeshStandardMaterial({map:FT.top,roughness:0.9}),
  stub:new THREE.MeshStandardMaterial({map:FT.stub,color:0xe8d4a8,roughness:1}),
  wheat:new THREE.MeshStandardMaterial({map:FT.tuft,alphaTest:0.45,vertexColors:true,roughness:0.85}),
  sprout:new THREE.MeshStandardMaterial({map:FT.sprout,alphaTest:0.4,vertexColors:true,roughness:0.9}),
  sheaf:new THREE.MeshStandardMaterial({map:FT.sheaf,roughness:0.95}) };
const sheafGeo=(()=>{ const pts=[[0.001,0],[0.021,0],[0.019,0.03],[0.014,0.055],[0.016,0.07],[0.027,0.094],[0.03,0.108],[0.021,0.12],[0.001,0.126]].map(([r,y])=>new THREE.Vector2(r,y));
  return new THREE.LatheGeometry(pts,8).toNonIndexed(); })();
function arrGeo(A,normals){ const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));
  if(A.C.length)g.setAttribute('color',new THREE.Float32BufferAttribute(A.C,3));
  if(A.I)g.setIndex(A.I); if(normals)g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3)); else g.computeVertexNormals(); return g; }
// пучок: n скрещённых вертикальных квадов, обе стороны отдельными треугольниками (нормаль вверх — масса светится ровно, без чёрной изнанки)
function tuftInto(A,x,y,z,w,h,rot,lx,lz,col,n){
  for(let k=0;k<n;k++){ const a=rot+k*Math.PI/n, dx=Math.cos(a)*w/2, dz=Math.sin(a)*w/2;
    const p=[[x-dx,y,z-dz,0,0],[x+dx,y,z+dz,1,0],[x+dx+lx,y+h,z+dz+lz,1,1],[x-dx+lx,y+h,z-dz+lz,0,1]];
    for(const t of[[0,1,2],[0,2,3],[0,2,1],[0,3,2]])for(const i of t){ const q=p[i]; A.P.push(q[0],q[1],q[2]); A.U.push(q[3],q[4]); A.N.push(0,1,0); A.C.push(col[0],col[1],col[2]); } } }
function mkFarm(c){ const g=new THREE.Group(), cx=c.x, cz=c.z, L=fseed((c.col*7919+c.row*104729+13)>>>0);   // свой сид: вид не зависит от порядка подгрузки
  const F=typeof c.farm==='object'?c.farm:null, V=F?farmV().replace('OLD',''):'';       // 16.10: поле промысла — варианты A (общий угол) / B (сквозные полосы) / C (B + межа)
  const th0=L()*Math.PI, th=V?F.th:th0, ux=Math.cos(th), uz=Math.sin(th);   // u — вдоль полос, v — поперёк
  const RAD=HEXR*0.8, NS=5, GAP=0.11, W=(2*RAD*0.9-GAP*(NS-1))/NS;
  const GL=V==='B'||V==='C', MARG=V==='C'?0.46:0.2;
  const inHex=(lx,lz)=>{ if(!GL)return true; for(const [dx,dz,inn] of F.nb){ const d=Math.hypot(dx,dz); if((lx*dx+lz*dz)/d>d/2-(inn?-0.03:MARG))return false; } return true; };
  const ok=(x,z)=>heightAt(x,z)>-0.56&&!(worldRV()>0&&riverD(x,z)<0.85)&&!TRAILS.near(x,z,0.3)&&inHex(x-cx,z-cz);   // не в воду (гладь −0.62), не в русло (врез до 0.78 от оси), не на тропу; B/C — в пределах гекса
  let GS=null, uc=0, vc=0;                                              // B/C: полосы в координатах всего поля — продолжаются через границу клеток
  if(GL){ uc=F.ox*ux+F.oz*uz; vc=-F.ox*uz+F.oz*ux; GS=[]; const Pt=W+GAP, Rr=HEXR*1.02, KK=['wheat','wheat','plow','sprout','stub'];
    for(let s=Math.floor((vc-Rr)/Pt);s<=Math.ceil((vc+Rr)/Pt);s++){ const H=fseed((((s+5000)*7919)^F.seed)>>>0); H();
      GS.push({v0:s*Pt-vc,u0:-Rr,u1:Rr,k:KK[Math.floor(H()*5)],ph:[H()*7,H()*7,H()*7,H()*7]}); } }
  const W2=(u,v)=>[ux*u-uz*v, uz*u+ux*v];
  const kinds=['wheat','wheat','plow','sprout','stub']; for(let i=kinds.length-1;i>0;i--){ const j=Math.floor(L()*(i+1)); [kinds[i],kinds[j]]=[kinds[j],kinds[i]]; }
  const PER=0.13, ridge=v=>0.024*(0.5+0.5*Math.cos(v/PER*Math.PI*2));   // борозды: гребень/ложбина, шаг 0.13
  // полоса по рельефу: сетка u×v, ячейки с плохой точкой выкидываются
  const drape=(u0,u1,v0,v1,du,dv,rf,uvf,mat,e0,e1,colf)=>{ const nu=Math.max(2,Math.ceil((u1-u0)/du)), nv=Math.max(2,Math.ceil((v1-v0)/dv));
    const A={P:[],U:[],C:[],I:[]}, good=[];
    for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){ const u=u0+(u1-u0)*i/nu, a0=v0+e0(u), v=a0+(v1+e1(u)-a0)*j/nv, [lx,lz]=W2(u,v), wx=cx+lx, wz=cz+lz;
      good.push(ok(wx,wz)); A.P.push(lx,heightAt(wx,wz)+0.028+(rf?rf(v-v0):0),lz); A.U.push(...uvf(u,v,wx,wz)); if(colf)A.C.push(...colf(u,v-v0)); }
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){ const a=i*(nv+1)+j, b=a+nv+1;
      if(good[a]&&good[a+1]&&good[b]&&good[b+1])A.I.push(a,a+1,b, a+1,b+1,b); }   // обход против часовой сверху — лицом к камере
    if(!A.I.length)return; const m=new THREE.Mesh(arrGeo(A),mat); m.receiveShadow=true; g.add(m); };
  const WH={P:[],U:[],N:[],C:[]}, SP={P:[],U:[],N:[],C:[]}, SH=[];
  const dm=new THREE.Object3D();
  for(let s=0;s<(GS?GS.length:NS);s++){ let v0,v1,u0,u1,k,ph;
    if(GS){ ({v0,u0,u1,k,ph}=GS[s]); v1=v0+W; }
    else { v0=-RAD*0.9+s*(W+GAP); v1=v0+W; const vm=(v0+v1)/2, Lh=Math.sqrt(Math.max(0,RAD*RAD-vm*vm));
      u0=-Lh*(0.86+L()*0.14); u1=Lh*(0.86+L()*0.14); if(u1-u0<0.8)continue;
      k=kinds[s]; ph=[L()*7,L()*7,L()*7,L()*7]; }                   // края полосы — не по линейке: плавная волна ±0.05
    const e0=u=>0.032*Math.sin((u+uc)*1.7+ph[0])+0.016*Math.sin((u+uc)*4.3+ph[1]), e1=u=>0.032*Math.sin((u+uc)*1.9+ph[2])+0.016*Math.sin((u+uc)*3.7+ph[3]);
    const inV=(u,v)=>v>v0+e0(u)+0.015&&v<v1+e1(u)-0.015;
    if(k==='plow')drape(u0,u1,v0,v1,0.12,PER/6,ridge,(u,v,wx,wz)=>[wx/8.8,wz/8.8],FM.soil,e0,e1);
    else if(k==='sprout'){ drape(u0,u1,v0,v1,0.12,PER/6,ridge,(u,v,wx,wz)=>[wx/8.8,wz/8.8],FM.soilV,e0,e1,
        (u,dv)=>{ const q=Math.pow(0.5+0.5*Math.cos(dv/PER*Math.PI*2),3)*(0.75+0.25*Math.sin(u*9+dv*3)); return [1-0.72*q,1+0.6*q,1-0.8*q]; });   // гребень зеленеет
      for(let v=v0+0.0001;v<v1;v+=PER)for(let u=u0+0.03;u<u1-0.03;u+=0.03+L()*0.015){ const [lx,lz]=W2(u,v), wx=cx+lx, wz=cz+lz; if(!inV(u,v)||!ok(wx,wz))continue;
        const t=0.85+L()*0.3; tuftInto(SP,lx,heightAt(wx,wz)+0.028+ridge(v-v0)-0.004,lz,0.1,0.065*t,L()*3,0,0,[t*1.1,t*1.2,0.9+L()*0.2],3); } }
    else if(k==='wheat'){ drape(u0,u1,v0,v1,0.14,0.14,null,(u,v)=>[(u+uc)/0.6,(v+vc)/0.6],FM.top,e0,e1);
      const lean=[(L()-0.5)*0.03,(L()-0.5)*0.03];                                            // ветер клонит полосу в одну сторону
      for(let u=u0;u<u1;u+=0.068)for(let v=v0+0.02;v<v1-0.02;v+=0.068){ const uu=u+(L()-0.5)*0.05, vv=v+(L()-0.5)*0.05, [lx,lz]=W2(uu,vv), wx=cx+lx, wz=cz+lz;
        if(!inV(uu,vv)||!ok(wx,wz))continue; const b=1.0+L()*0.16, green=L()<0.05;
        tuftInto(WH,lx,heightAt(wx,wz)+0.02,lz,0.13,(0.1+L()*0.025),L()*3,lean[0]+(L()-0.5)*0.015,lean[1]+(L()-0.5)*0.015,green?[0.82*b,0.95*b,0.62*b]:[b,b*(0.97+L()*0.05),b*(0.9+L()*0.1)],2); } }
    else { drape(u0,u1,v0,v1,0.14,0.14,null,(u,v)=>[(u+uc)/0.5,(v+vc)/0.5],FM.stub,e0,e1);                // стерня + копны рядами
      for(let u=u0+0.25;u<u1-0.2;u+=0.42+L()*0.12)for(const vf of[0.28,0.72]){ const uu=u+(L()-0.5)*0.12, vv=v0+W*vf+(L()-0.5)*0.08, [lx,lz]=W2(uu,vv), wx=cx+lx, wz=cz+lz;
        if(!ok(wx,wz))continue; const y=heightAt(wx,wz)+0.02, n=6+Math.floor(L()*3), a0=L()*7;
        for(let i=0;i<n;i++){ const a=a0+i/n*Math.PI*2, th2=0.28+L()*0.08;   // снопы шалашом: верхушки к центру
          dm.position.set(lx+Math.cos(a)*0.046,y,lz+Math.sin(a)*0.046); dm.quaternion.setFromAxisAngle(new THREE.Vector3(-Math.sin(a),0,Math.cos(a)),th2);
          dm.scale.setScalar(1.25+L()*0.25); dm.updateMatrix(); SH.push(sheafGeo.clone().applyMatrix4(dm.matrix)); }
        dm.position.set(lx,y+0.16,lz); dm.quaternion.identity(); dm.rotation.set(Math.PI,0,0.2); dm.scale.setScalar(1.15); dm.updateMatrix();   // сноп-«шапка» колосьями вниз
        SH.push(sheafGeo.clone().applyMatrix4(dm.matrix)); } } }
  const add=(A,mat)=>{ if(!A.P.length)return; const m=new THREE.Mesh(arrGeo(A,true),mat); m.castShadow=m.receiveShadow=true; g.add(m); };
  if(V==='C'){ for(const [dx,dz,inn] of F.nb){ if(inn)continue;             // межа: полоса травы и кустов по внешнему краю поля
      const E=hexEdge(dx,dz,MARG*0.5); for(let t=0;t<=1;t+=0.045){ const x=E.ax+(E.bx-E.ax)*t+(L()-0.5)*0.1, z=E.az+(E.bz-E.az)*t+(L()-0.5)*0.1, wx=cx+x, wz=cz+z;
        if(heightAt(wx,wz)<-0.56||TRAILS.near(wx,wz,0.3))continue; const bush=L()<0.12, b=0.75+L()*0.3;
        tuftInto(SP,x,heightAt(wx,wz)-0.01,z,bush?0.34:0.16,bush?0.3+L()*0.12:0.1+L()*0.06,L()*3,(L()-0.5)*0.03,(L()-0.5)*0.03,bush?[0.55*b,0.72*b,0.5*b]:[0.85*b,1.0*b,0.75*b],3); } } }
  g.userData.kinds=kinds; add(WH,FM.wheat); add(SP,FM.sprout);
  if(SH.length){ const m=new THREE.Mesh(mergeGeos(SH),FM.sheaf); m.castShadow=m.receiveShadow=true; g.add(m); }
  return g; }
function mkDock(c){ const g=new THREE.Group(), cx=c.x, cz=c.z;        // мостки на сваях + долблёнка: от берега к воде
  const vx=cx+wdx(c.dock.vx,cx), vz=c.dock.vz;                       // деревня на ближнем листе кольца
  let dx=cx-vx, dz=cz-vz; const L=Math.hypot(dx,dz)||1; dx/=L; dz/=L;
  let t0=-1; for(let t=0;t<=1;t+=0.02){ if(heightAt(vx+(cx-vx)*t,vz+(cz-vz)*t)<-0.5){ t0=t; break; } }
  if(t0<0)return null;
  const sx=vx+(cx-vx)*t0-cx, sz=vz+(cz-vz)*t0-cz;                      // берег, от центра клетки
  const yD=Math.max(-0.34,heightAt(cx+sx-dx*0.5,cz+sz-dz*0.5)+0.06);  // настил чуть над берегом
  const a=-Math.atan2(dz,dx), Lk=2.1, W=0.55;
  const deck=new THREE.Group(); deck.position.set(sx-dx*0.5,0,sz-dz*0.5); deck.rotation.y=a; g.add(deck);
  for(let k=0;k*0.15<Lk;k++){ const pl=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.035,W*rr(0.92,1.04)),plankMat);   // доски поперёк
    pl.position.set(0.08+k*0.15,yD+rr(-0.008,0.008),rr(-0.02,0.02)); pl.rotation.y=rr(-0.04,0.04); pl.castShadow=pl.receiveShadow=true; deck.add(pl); }
  for(const sz2 of[-W*0.38,W*0.38]){ const lg=log(Lk,0.04,0.04); lg.rotation.z=Math.PI/2; lg.position.set(Lk/2,yD-0.05,sz2); deck.add(lg); }   // лаги
  for(const px of[0.75,1.45,2.05])for(const pz of[-W*0.42,W*0.42]){     // сваи до дна
    const wx=cx+sx-dx*0.5+Math.cos(-a)*px, wz=cz+sz-dz*0.5+Math.sin(-a)*px;
    const yb=Math.max(-1.6,Math.min(yD-0.2,heightAt(wx,wz))), h=yD+0.1-yb;
    const pile=log(h,0.04,0.035); pile.position.set(px,yb+h/2,pz); deck.add(pile); }
  // долблёнка у конца мостков + весло на настиле
  const hull=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,6),plankMat); hull.scale.set(1.25,0.17,0.24);
  hull.position.set(1.55,-0.6,W*0.62+0.12); hull.rotation.y=0.08; hull.castShadow=true; deck.add(hull);
  const hol=new THREE.Mesh(new THREE.CircleGeometry(0.5,14),M.dark); hol.scale.set(1.05,0.16,1); hol.rotation.x=-Math.PI/2;
  hol.position.set(1.55,-0.565,W*0.62+0.12); hol.rotation.z=-0.08; deck.add(hol);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.9,5),M.log); pad.rotation.z=Math.PI/2; pad.rotation.y=0.5;
  pad.position.set(1.1,yD+0.03,0.05); deck.add(pad);
  const bl=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.03,0.16),plankMat); bl.position.set(1.48,yD+0.025,-0.02); bl.rotation.y=0.5; deck.add(bl);   // лопасть
  const bk=mkBasket(0.7); bk.position.set(0.35,yD+0.02,-0.12); deck.add(bk);                     // корзина-верша
  return g; }

// ================= 15.10: СТУПЕНИ ПОСЕЛЕНИЙ (STAGES старого движка, index.html 3052/5792) =================
// стоянка (1 дом) → деревушка (2: старт игры) → деревня (3 + частокол дугой) → город (4 + общинный длинный дом, амбар,
// гончарная печь, менгир, изгородь кольцом); столица — поверх ступени: дом вождя, амбар, печь, частокол кольцом, стяг цвета державы.
// Ступень и столицу задаёт game.js (c.stg / c.cap / c.capCol → __vilRedraw); до игры — по c.pop. ?vilst=0..3 — все такой ступени, 4 — все столицы.
const stgOfPop=p=>{ const s=Math.pow(Math.max(1,p)/30,1/1.6); return s<1.2?0:s<2.6?1:s<4.4?2:3; };
const VST=new URLSearchParams(location.search).get('vilst');
const daubM=new THREE.MeshStandardMaterial({map:M.dirt.map,normalMap:M.dirt.normalMap,color:0xf3e2c6,roughness:1,side:THREE.DoubleSide});   // обмазка глиной
const roofLH=(()=>{ const t=tex(strawCanvas(512,512,false)); t.repeat.set(5,2);
  return new THREE.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:2.4,roughness:1,side:THREE.DoubleSide}); })();
const clayM=new THREE.MeshStandardMaterial({color:0xa86a42,roughness:0.92});
const ochreM=new THREE.MeshStandardMaterial({color:0xb46a34,roughness:0.85});
// длинный дом (прообраз — дома первых земледельцев; эталон chiefV2 старого): обмазанные стены, крутая соломенная двускатная крыша
function mkLonghouse(s=1,plain=false){ const g=new THREE.Group();
  const L=3.4,W=1.7,wh=0.78,ry=2.05,ov=0.32;
  const wall=new THREE.Mesh(new THREE.BoxGeometry(L,wh,W),daubM); wall.position.y=wh/2; wall.castShadow=wall.receiveShadow=true; g.add(wall);
  const tri=new THREE.Shape(); tri.moveTo(-W/2,0); tri.lineTo(W/2,0); tri.lineTo(0,ry-wh); tri.closePath();
  for(const sx of[1,-1]){ const gb=new THREE.Mesh(new THREE.ShapeGeometry(tri),daubM); gb.rotation.y=sx*Math.PI/2; gb.position.set(sx*(L/2-0.02),wh,0); gb.castShadow=true; g.add(gb); }
  const eY=wh-0.12, eZ=W/2+ov, pitch=Math.atan2(ry-eY,eZ), S=Math.hypot(ry-eY,eZ);
  for(const sd of[1,-1]){ const r=new THREE.Mesh(new THREE.BoxGeometry(L+0.5,0.13,S+0.08),roofLH);
    r.rotation.x=sd*pitch; r.position.set(0,(eY+ry)/2+0.06,sd*eZ/2); r.castShadow=r.receiveShadow=true; g.add(r);
    const frG=new THREE.PlaneGeometry(0.24,0.26); frG.translate(0,-0.1,0);                   // рваная кромка соломы
    for(let k=0;k<13;k++){ const fr=new THREE.Mesh(frG,M.strawFr); fr.position.set(-L/2-0.2+k*(L+0.4)/12+rr(-0.04,0.04),eY+0.02,sd*(eZ+0.02));
      fr.rotation.set(sd*rr(0.15,0.35),0,rr(-0.1,0.1)); g.add(fr); } }
  const ridge=log(L+0.6,0.055,0.05); ridge.rotation.z=Math.PI/2; ridge.position.y=ry+0.08; g.add(ridge);
  for(const x of[-L/2-0.05,L/2+0.05])for(const sd of[1,-1]){ const p=log(0.7,0.026,0.022);   // скрещённые жерди на коньке
    p.position.set(x,ry+0.18,sd*0.1); p.rotation.x=-sd*0.55; g.add(p); }
  for(let i=0;i<=6;i++)for(const sz of[-1,1]){ const p=log(wh+0.1,0.04,0.034); p.position.set(-L/2+i*L/6,(wh+0.1)/2,sz*(W/2+0.02)); g.add(p); }
  const door=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.66),M.dark); door.position.set(0.25,0.33,W/2+0.035); g.add(door);
  if(!plain){
    for(const y of[0.52,0.6]){ const b=new THREE.Mesh(new THREE.BoxGeometry(L*0.92,0.035,0.01),ochreM); b.position.set(0,y,W/2+0.03); g.add(b); }   // роспись охрой
    const jp=[]; for(let i=0;i<=8;i++){ const t=i/8; jp.push(new THREE.Vector2(0.02+Math.sin(t*3.14)*0.13*(1-t*0.25)+(t>0.85?0.03:0),t*0.34)); }
    const jg=new THREE.LatheGeometry(jp,10);
    for(const [x,sc] of[[-0.3,1.2],[0.85,1]]){ const j=new THREE.Mesh(jg,clayM); j.scale.setScalar(sc); j.position.set(x,0,W/2+0.3); j.castShadow=true; g.add(j); }
    const wp=mkWoodpile(); wp.position.set(-1.1,0,W/2+0.35); g.add(wp); }
  g.scale.setScalar(s); return g; }
// амбар на сваях (granaryV2 старого): плетёный короб в 2 яруса, соломенный конус, лесенка
function mkGranary(s=1){ const g=new THREE.Group();
  for(const [ix,iz] of[[1,1],[1,-1],[-1,1],[-1,-1]]){ const l=log(0.8,0.05,0.045); l.position.set(ix*0.32,0.4,iz*0.32); g.add(l); }
  for(const [r0,r1,y] of[[0.42,0.5,0.93],[0.5,0.44,1.2]]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,0.3,14),M.wattle); b.position.y=y; b.castShadow=true; g.add(b); }
  const rf=new THREE.Mesh(new THREE.ConeGeometry(0.68,0.62,16),roofLH); rf.position.y=1.66; rf.castShadow=true; g.add(rf);
  for(const sx of[-0.13,0.13]){ const l=log(1.0,0.024,0.024); l.position.set(sx,0.48,0.62); l.rotation.x=0.55; g.add(l); }
  for(let i=1;i<4;i++){ const l=log(0.3,0.018,0.018); l.rotation.z=Math.PI/2; l.position.set(0,0.17+i*0.2,0.85-i*0.115); g.add(l); }
  g.scale.setScalar(s); return g; }
function mkKiln(s=1){ const g=new THREE.Group();          // гончарная печь: глиняный купол, зев, дымоход
  const d=new THREE.Mesh(new THREE.SphereGeometry(0.34,12,8,0,Math.PI*2,0,1.7),clayM); d.position.y=0.04; d.castShadow=true; g.add(d);
  const m=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.08),M.dark); m.position.set(0,0.13,0.3); g.add(m);
  const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.075,0.22,7),clayM); ch.position.y=0.46; g.add(ch);
  g.scale.setScalar(s); return g; }
function mkMenhir(s=1){ const g=new THREE.Group();        // менгир города со знаками охрой + камни у подножия
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.3,1),M.rock); m.scale.set(1,2.9,0.8); m.position.y=0.62; m.rotation.y=0.4; m.castShadow=true; g.add(m);
  for(const [w,y] of[[0.16,0.86],[0.22,0.66],[0.18,0.47]]){ const b=new THREE.Mesh(new THREE.BoxGeometry(w,0.04,0.03),ochreM); b.position.set(0,y,0.24); g.add(b); }
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, st=new THREE.Mesh(new THREE.DodecahedronGeometry(rr(0.07,0.1),0),M.stone);
    st.scale.y=0.6; st.position.set(Math.cos(a)*0.46,0.04,Math.sin(a)*0.46); st.rotation.set(R()*3,R()*3,R()*3); g.add(st); }
  g.scale.setScalar(s); return g; }
function mkHay(s=1){ const h=new THREE.Mesh(new THREE.SphereGeometry(0.42,12,8,0,Math.PI*2,0,Math.PI/2),roofLH);
  h.scale.set(s,s*1.5,s); h.castShadow=true; return h; }
function mkStag(col,s=1){ const g=new THREE.Group();       // стяг державы: высокий шест + полотнище с волной
  const p=log(2.7,0.05,0.04); p.position.y=1.35; g.add(p);
  const fg=new THREE.PlaneGeometry(1.3,0.78,10,1), P=fg.attributes.position;
  for(let i=0;i<P.count;i++){ const x=P.getX(i)+0.65; P.setZ(i,Math.sin(x*4.2)*0.07*x); }
  fg.computeVertexNormals();
  const f=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({color:new THREE.Color(col),roughness:0.85,side:THREE.DoubleSide}));
  f.position.set(0.68,2.25,0); f.castShadow=true; g.add(f);
  const k=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.16,6),M.ring); k.position.y=2.78; g.add(k);
  g.scale.setScalar(s); return g; }
function mkSettle(cx,cz,c){
  const g=new THREE.Group(), K=0.72;
  let st=c.stg!=null?c.stg:stgOfPop(c.pop||90), cap=c.cap||null, col=c.capCol||'#c23a2a';
  if(VST!=null){ if(+VST>=4)cap=cap||'me'; else st=+VST; }
  const okAt=(x,z)=>heightAt(cx+x,cz+z)>-0.45&&!(worldRV()>0&&riverD(cx+x,cz+z)<0.8);
  const gy=(x,z,r)=>{ let m=heightAt(cx+x,cz+z); for(const [a,b] of[[r,0],[-r,0],[0,r],[0,-r]])m=Math.min(m,heightAt(cx+x+a,cz+z+b)); return m-0.02; };
  const put=(o,x,z,ry=0,r=0.2)=>{ if(!okAt(x,z))return null; o.position.set(x,gy(x,z,r),z); o.rotation.y=ry; g.add(o); return o; };
  const prop=o=>{ o.scale.multiplyScalar(K); return o; };
  const Hu=(s,x,z,ry)=>put(mkHut(s*K),x,z,ry,0.7*s), Ca=(s,x,z,ry)=>put(mkCabin(s*K),x,z,ry,0.45*s);
  // ограда: kind 'stake' — частокол с остриями и стяжкой, 'rail' — столбики и 2 жерди (как загон); a0..a1 — дуга, ворота — разрыв на юге
  const fence=(R,a0,a1,n,kind,gate)=>{ const P=[];
    for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/(n-1), x=Math.cos(a)*R, z=Math.sin(a)*R;
      P.push(okAt(x,z)?new THREE.Vector3(x,heightAt(cx+x,cz+z),z):null); }
    P.forEach((p,i)=>{ if(!p)return; const end=gate&&(i===0||i===n-1);
      if(kind==='stake'){ const h=(end?0.95:rr(0.55,0.75))*K, k=log(h,0.05*K,0.04*K); k.position.set(p.x,p.y+h/2-0.03,p.z); k.rotation.set(rr(-0.05,0.05),0,rr(-0.05,0.05)); g.add(k);
        const tp=new THREE.Mesh(new THREE.ConeGeometry(0.045*K,0.1*K,6),M.ring); tp.position.set(p.x,p.y+h+0.01,p.z); g.add(tp); }
      else { const h=end?0.62:rr(0.42,0.48), k=log(h,end?0.03:0.02,end?0.025:0.016); k.position.set(p.x,p.y+h/2-0.04,p.z); k.rotation.set(rr(-0.05,0.05),0,rr(-0.05,0.05)); g.add(k); }
      const q=P[i+1]; if(i===n-1||!q)return;
      for(const hy of(kind==='stake'?[0.4*K]:[0.17,0.34])) rail(g,new THREE.Vector3(p.x,p.y+hy,p.z),new THREE.Vector3(q.x,q.y+hy,q.z),kind==='stake'?0.012:0.008); });
    if(gate&&P[0]&&P[n-1]&&kind==='stake'){ const a=P[0], b=P[n-1], y=Math.max(a.y,b.y)+0.86*K;   // перекладина ворот
      rail(g,new THREE.Vector3(a.x,y,a.z),new THREE.Vector3(b.x,y,b.z),0.022); } };
  const ring=(R,kind)=>{ const gw=0.42/R*2; fence(R,Math.PI/2+gw/2,Math.PI/2+Math.PI*2-gw/2,Math.round(R*(kind==='stake'?14:7)),kind,true); };
  if(cap){
    put(mkLonghouse(0.72),0,-1.35,0,0.9);                                          // дом вождя
    const slots=[[Hu,0.78,-1.9,0.0,0.3],[Ca,0.85,1.95,-0.05,-0.5],[Ca,0.8,-1.3,1.45,0.6],[Hu,0.72,1.35,1.45,-0.4],[Ca,0.7,-0.8,2.15,0.2],[Ca,0.7,0.85,2.15,-0.2]];
    const n=Math.min(6,st+3);
    for(let i=0;i<n;i++){ const [f,s,x,z,ry]=slots[i]; f(s,x,z,ry); }
    put(mkGranary(0.75*K/0.72),-1.85,-1.5,0.4,0.35); put(mkKiln(0.8),1.85,-1.5,-0.6,0.25);
    put(prop(mkFire()),-0.35,0.45); put(mkStag(col,0.8),0.75,0.35,0.3,0.05);
    ring(2.85,'stake');
  } else if(st>=3){                                                                 // город
    put(mkLonghouse(0.62,true),0,-1.45,0,0.8);                                      // общинный дом
    Hu(0.8,-1.75,-0.1,0.3); Ca(0.85,1.8,-0.2,-0.5); Ca(0.8,-1.35,1.35,0.6); Hu(0.75,1.4,1.3,-0.4);
    put(mkGranary(0.75),-1.75,-1.55,0.4,0.35); put(mkKiln(0.8),1.75,-1.55,-0.6,0.25);
    put(mkMenhir(0.8),0,0.25,0.2,0.2);
    put(prop(mkWoodpile()),-0.75,2.0,0.3); put(mkHay(0.75),2.1,0.45);
    put(prop(mkBasket(1)),0.55,1.85); put(prop(mkBasket(0.8)),-0.3,1.95);
    ring(2.75,'rail');
  } else if(st===2){                                                                // деревня (прежний вид big.html без стяга)
    Hu(1,-0.11,-0.65,-0.15); Ca(1,1.26,-0.07,-0.55); Ca(0.85,-1.33,0.11,0.5);
    put(prop(mkFire()),0.18,0.83); put(prop(mkHide()),1.08,0.76,-0.2); put(prop(mkWoodpile()),-0.9,0.97,1.25);
    put(prop(mkBasket(1)),0.61,1.15); put(prop(mkBasket(0.8)),-0.36,1.26); put(mkHay(0.7),2.05,0.95);
    fence(1.66,202*Math.PI/180,328*Math.PI/180,13,'stake',false);
  } else if(st===1){                                                                // деревушка (старт)
    Hu(1,-0.6,-0.55,-0.15); Ca(0.85,1.15,-0.25,-0.55);
    put(prop(mkFire()),0.2,0.85); put(prop(mkWoodpile()),-1.15,0.95,1.25); put(prop(mkHide()),1.15,0.8,-0.2);
    put(prop(mkBasket(1)),0.75,1.25);
  } else {                                                                          // стоянка
    Hu(0.8,0,-0.35,-0.15);
    put(prop(mkFire()),0.15,1.0); put(prop(mkHide()),-1.0,0.7,0.3); put(prop(mkWoodpile()),1.0,0.75,1.2);
  }
  g.userData.stg=st; g.userData.cap=cap;
  return g; }

// ================= 15.10: ЗДАНИЯ ПРОМЫСЛОВ (IND старого движка, index.html 6895–6975 — там кубики; здесь новый вид) =================
// Ставятся на клетку промысла рядом с городом: стан охотника (лес), делянка (лес), каменоломня (холмы), рыбацкий стан
// (речной берег; на озере/море — готовый причал mkDock). Пашня и скотный двор — готовые mkFarm / mkPen по клеткам поля.
const hideTentT=(()=>{ const c=cnv(256), g=c.getContext('2d'), L=(s=>()=> (s=(s*1103515245+12345)>>>0)/4294967296)(913);
  g.fillStyle='#8a6a48'; g.fillRect(0,0,256,256);
  for(let i=0;i<70;i++){ g.fillStyle=`rgba(${60+L()*50|0},${40+L()*30|0},${20+L()*20|0},${0.12+L()*0.22})`;
    g.beginPath(); g.ellipse(L()*256,L()*256,8+L()*26,5+L()*14,L()*3,0,7); g.fill(); }
  g.strokeStyle='rgba(50,32,16,.55)'; g.lineWidth=2;                                  // швы между шкурами
  for(let i=0;i<7;i++){ const x=i*37+L()*8; g.beginPath(); g.moveTo(x,0); for(let y=0;y<=256;y+=16)g.lineTo(x+Math.sin(y*0.05+i)*5,y); g.stroke(); }
  for(let i=0;i<4;i++){ const y=40+i*55+L()*10; g.beginPath(); g.moveTo(0,y); for(let x=0;x<=256;x+=16)g.lineTo(x,y+Math.sin(x*0.04+i)*4); g.stroke(); }
  return tex(c); })();
const hideTentM=new THREE.MeshStandardMaterial({map:hideTentT,roughness:1,side:THREE.DoubleSide});
const metalM=new THREE.MeshStandardMaterial({color:0x8e959c,roughness:0.45,metalness:0.55});
const meatM=new THREE.MeshStandardMaterial({color:0x7a2f22,roughness:0.8});
const fishM=new THREE.MeshStandardMaterial({color:0xa9b2b0,roughness:0.45,metalness:0.25});
const chipM=new THREE.MeshStandardMaterial({color:0xd9b98a,roughness:1});
const netT=(()=>{ const c=cnv(128), g=c.getContext('2d'); g.clearRect(0,0,128,128); g.strokeStyle='#3b3226'; g.lineWidth=2.2;
  for(let i=0;i<=128;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,128); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(128,i); g.stroke(); }
  const t=tex(c); t.repeat.set(2,1.4); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })();
const netM=new THREE.MeshStandardMaterial({map:netT,transparent:true,alphaTest:0.4,side:THREE.DoubleSide,roughness:1});
function lean(g,len,r,x,z,y0,rx,rz){ const l=log(len,r,r*0.8); l.position.set(x,y0+len/2*Math.cos(Math.hypot(rx,rz)),z); l.rotation.set(rx,0,rz); g.add(l); return l; }
function mkTent(){ const g=new THREE.Group();                        // чум из шкур на жердях
  const cone=new THREE.Mesh(new THREE.ConeGeometry(0.95,1.85,16,1,true,0.35,Math.PI*2-0.7),hideTentM);
  cone.position.y=0.92; cone.castShadow=cone.receiveShadow=true; g.add(cone);
  const inn=new THREE.Mesh(new THREE.ConeGeometry(0.9,1.75,12,1,true),M.dark); inn.position.y=0.86; inn.material=new THREE.MeshBasicMaterial({color:0x140d07,side:THREE.BackSide}); g.add(inn);
  for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+0.2, p=log(2.35,0.028,0.02);              // жерди торчат над верхом
    p.position.set(Math.cos(a)*0.42,1.12,Math.sin(a)*0.42); p.rotation.set(Math.sin(a)*-0.47,0,Math.cos(a)*0.47); g.add(p); }
  const flap=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.95),hideTentM);             // откинутый полог у входа
  flap.position.set(0.62,0.48,0.42); flap.rotation.set(0,0.9,0.3); g.add(flap);
  return g; }
function mkMeatRack(){ const g=new THREE.Group();                     // вешало для мяса
  for(const x of[-0.45,0.45]){ const p=log(1.05,0.03,0.026); p.position.set(x,0.52,0); g.add(p); }
  const bar=log(1.05,0.02,0.02); bar.rotation.z=Math.PI/2; bar.position.y=0.98; g.add(bar);
  for(const x of[-0.24,0.02,0.27]){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.12,rr(0.26,0.36),0.07),meatM); m.position.set(x,0.76,0); m.rotation.y=rr(-0.4,0.4); m.castShadow=true; g.add(m); }
  return g; }
function mkLogStack(){ const g=new THREE.Group();                     // штабель брёвен 3+2+1
  for(let ry=0;ry<3;ry++)for(let i=0;i<3-ry;i++){ const l=log(rr(1.9,2.15),0.15,0.14); l.rotation.z=Math.PI/2;
    const h=new THREE.Group(); h.add(l); h.position.set(rr(-0.06,0.06),0.15+ry*0.26,(i-(2-ry)/2)*0.3); g.add(h); }
  for(const z of[-0.48,0.48]){ const k=log(0.6,0.03,0.025); k.position.set(0.7,0.3,z); g.add(k); const k2=k.clone(); k2.position.x=-0.7; g.add(k2); }   // упоры
  return g; }
function mkStump(axe){ const g=new THREE.Group(); const s=log(0.32,0.17,0.15); s.position.y=0.16; g.add(s);
  if(axe){ const h=log(0.62,0.018,0.016); h.position.set(0.05,0.5,0); h.rotation.z=0.45; g.add(h);
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.12,0.03),metalM); b.position.set(-0.08,0.33,0); b.rotation.z=0.45; g.add(b); }
  return g; }
function mkSawhorse(){ const g=new THREE.Group();                     // козлы с бревном
  for(const x of[-0.5,0.5])for(const s of[-1,1]){ const l=log(0.72,0.022,0.02); l.position.set(x,0.3,s*0.12); l.rotation.x=s*0.42; g.add(l); }
  const lg=log(1.5,0.1,0.09); lg.rotation.z=Math.PI/2; lg.position.y=0.56; g.add(lg);
  return g; }
function mkLeanTo(){ const g=new THREE.Group();                       // шалаш-навес лесорубов: рогатины, конёк, кора
  for(const x of[-0.6,0.6]){ const p=log(0.95,0.035,0.03); p.position.set(x,0.47,0); g.add(p); }
  const rd=log(1.45,0.03,0.03); rd.rotation.z=Math.PI/2; rd.position.y=0.93; g.add(rd);
  const ph=-0.71, nY=-Math.sin(ph), nZ=Math.cos(ph);                     // скат: от конька (z=0) к земле (z≈0.8)
  const roof=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.25),M.log); roof.rotation.x=ph; roof.position.set(0,0.47,0.4); roof.castShadow=true; g.add(roof);
  for(let i=0;i<5;i++){ const p=log(1.3,0.022,0.02); p.rotation.x=ph; p.position.set(-0.6+i*0.3,0.47+nY*0.03,0.4+nZ*0.03); g.add(p); }
  return g; }
function mkCliff(){ const g=new THREE.Group();                        // скальный уступ: распил
  for(const [x,z,s,sy] of[[0,0,1.15,1.0],[-0.85,0.15,0.85,0.8],[0.85,0.1,0.9,0.75],[0.3,-0.4,0.9,1.1]]){
    const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,1),M.rock); m.scale.set(s*1.1,s*sy,s*0.8);
    m.position.set(x,s*sy*0.36,z); m.rotation.set(R()*0.4,R()*3,R()*0.4); m.castShadow=m.receiveShadow=true; g.add(m); }
  const face=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.75,0.08),M.rock); face.position.set(0,0.4,0.62); g.add(face);   // свежий срез
  return g; }
function mkBlock(s=1){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.42*s,0.3*s,0.32*s),M.rock); b.castShadow=b.receiveShadow=true; return b; }
function mkTripod(){ const g=new THREE.Group();                       // тренога-ворот с подвешенным блоком
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2; const l=log(1.75,0.03,0.025); l.position.set(Math.cos(a)*0.32,0.83,Math.sin(a)*0.32);
    l.rotation.set(Math.sin(a)*-0.36,0,Math.cos(a)*0.36); g.add(l); }
  const rope=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.9,4),new THREE.MeshStandardMaterial({color:0x5a4a33,roughness:1})); rope.position.y=1.2; g.add(rope);
  const b=mkBlock(0.8); b.position.y=0.66; b.rotation.y=0.4; g.add(b);
  return g; }
function mkSledge(){ const g=new THREE.Group();                       // волокуша с камнем
  for(const z of[-0.2,0.2]){ const r=log(1.2,0.03,0.03); r.rotation.z=Math.PI/2-0.08; r.position.set(0,0.05,z); g.add(r); }
  for(let i=0;i<4;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.03,0.5),M.log); s.position.set(-0.4+i*0.25,0.09,0); g.add(s); }
  const b=mkBlock(1); b.position.set(-0.05,0.26,0); b.rotation.y=0.1; g.add(b);
  return g; }
function mkFishRack(){ const g=new THREE.Group();                     // вешала с вяленой рыбой
  for(const x of[-0.55,0.55]){ const p=log(1.0,0.028,0.024); p.position.set(x,0.5,0); g.add(p); }
  for(const y of[0.78,0.94]){ const b=log(1.2,0.016,0.016); b.rotation.z=Math.PI/2; b.position.y=y; g.add(b); }
  const fg=new THREE.SphereGeometry(0.1,8,5);
  for(let i=0;i<9;i++){ const f=new THREE.Mesh(fg,fishM); f.scale.set(0.55,1.6,0.22); const y=i%2?0.94:0.78;
    f.position.set(-0.46+i*0.115,y-0.18,rr(-0.02,0.02)); f.rotation.y=rr(-0.3,0.3); f.castShadow=true; g.add(f); }
  return g; }
function mkNet(){ const g=new THREE.Group();                          // сеть сушится на кольях
  for(const x of[-0.6,0.6]){ const p=log(0.95,0.022,0.02); p.position.set(x,0.47,0); g.add(p); }
  const n=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.7,6,3),netM), P=n.geometry.attributes.position;
  for(let i=0;i<P.count;i++){ const x=P.getX(i); P.setY(i,P.getY(i)-0.12*(1-(x/0.6)**2)); P.setZ(i,Math.sin(x*5)*0.03); }
  n.position.y=0.58; g.add(n); return g; }
function mkBoatUp(){ const g=new THREE.Group();                       // долблёнка вверх дном на берегу
  const hull=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,6,0,Math.PI*2,0,Math.PI/2),plankMat); hull.scale.set(1.35,0.34,0.3);
  hull.castShadow=true; g.add(hull);
  const pd=log(0.95,0.014,0.014); pd.rotation.z=Math.PI/2; pd.rotation.y=0.4; pd.position.set(0.1,0.03,0.32); g.add(pd);
  return g; }
// мини-мостки рыбацкого стана на реке (15.10, Артём: «для реки только мини-мостики»): короткий настил на двух парах свай
// от берега к оси русла. Направление — к ближайшей точке оси (уклон riverD), берег — первая точка ниже −0.5 (как у причала).
function riverPier(cx,cz){ if(!(worldRV()>0))return null;
  const d0=riverD(cx,cz); if(d0>HEXR*1.3||d0<0.3)return null;
  const e=0.15, gx=riverD(cx+e,cz)-riverD(cx-e,cz), gz=riverD(cx,cz+e)-riverD(cx,cz-e), gl=Math.hypot(gx,gz)||1, dx=-gx/gl, dz=-gz/gl;
  let t0=-1; for(let t=0;t<=d0+0.3;t+=0.04){ if(heightAt(cx+dx*t,cz+dz*t)<-0.5){ t0=t; break; } }
  if(t0<0.3)return null;
  const Lk=1.0, W=0.42, back=0.35, sx=dx*(t0-back), sz=dz*(t0-back);
  const yD=Math.max(-0.34,heightAt(cx+sx,cz+sz)+0.06), a=-Math.atan2(dz,dx);
  const g=new THREE.Group(), deck=new THREE.Group(); deck.position.set(sx,0,sz); deck.rotation.y=a; g.add(deck);
  for(let k=0;k*0.14<Lk;k++){ const pl=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.03,W*rr(0.9,1.05)),plankMat);
    pl.position.set(0.07+k*0.14,yD+rr(-0.008,0.008),rr(-0.02,0.02)); pl.rotation.y=rr(-0.05,0.05); pl.castShadow=pl.receiveShadow=true; deck.add(pl); }
  for(const z2 of[-W*0.36,W*0.36]){ const lg=log(Lk,0.035,0.035); lg.rotation.z=Math.PI/2; lg.position.set(Lk/2,yD-0.045,z2); deck.add(lg); }   // лаги
  for(const px of[back+0.15,Lk-0.08])for(const pz of[-W*0.4,W*0.4]){                  // сваи до дна
    const wx=cx+sx+Math.cos(-a)*px, wz=cz+sz+Math.sin(-a)*px;
    const yb=Math.max(-1.6,Math.min(yD-0.2,heightAt(wx,wz))), h=yD+0.08-yb;
    const pile=log(h,0.035,0.03); pile.position.set(px,yb+h/2,pz); deck.add(pile); }
  return {g,seg:[sx,sz,sx+dx*Lk,sz+dz*Lk]}; }
function mkIndB(kind,cx,cz){
  const g=new THREE.Group(), K=0.72;
  const okAt=(x,z)=>heightAt(cx+x,cz+z)>-0.45&&!(worldRV()>0&&riverD(cx+x,cz+z)<0.8);
  const gy=(x,z,r)=>{ let m=heightAt(cx+x,cz+z); for(const [a,b] of[[r,0],[-r,0],[0,r],[0,-r]])m=Math.min(m,heightAt(cx+x+a,cz+z+b)); return m-0.02; };
  let blk=null;                                                       // отрезок мостков: предметы стана на него не ставим
  const nearBlk=(x,z)=>{ if(!blk)return 9; const [ax,az,bx,bz]=blk, vx=bx-ax, vz=bz-az; const t=Math.max(0,Math.min(1,((x-ax)*vx+(z-az)*vz)/(vx*vx+vz*vz)));
    return Math.hypot(x-ax-vx*t,z-az-vz*t); };
  const put=(o,x,z,ry=0,r=0.2,s=K)=>{ if(!okAt(x,z)||nearBlk(x,z)<0.45+r*0.6)return null; o.scale.multiplyScalar(s); o.position.set(x,gy(x,z,r),z); o.rotation.y=ry; g.add(o); return o; };
  if(kind==='hunt'){
    put(mkTent(),0,-0.3,0.3,0.6); put(mkFire(),0.95,0.55,0,0.3);
    put(mkHide(),-1.05,0.45,0.5,0.3); put(mkMeatRack(),0.2,-1.45,0.1,0.4); put(mkWoodpile(),1.25,-0.75,1.0);
    for(const [x,z,a] of[[-0.62,-0.62,0.3],[-0.55,-0.75,-0.2]]){ const sp=new THREE.Group(); lean(sp,1.6,0.014,0,0,0,0.12,a); put(sp,x,z,0,0.05); }
  } else if(kind==='lumber'){
    put(mkLogStack(),0,-0.2,0.15,0.9); put(mkStump(true),1.35,0.65,0.4,0.15); put(mkStump(false),-1.25,0.85,0,0.15); put(mkStump(false),1.55,-0.95,0,0.15);
    put(mkSawhorse(),-0.35,1.25,-0.3,0.5); put(mkLeanTo(),-1.45,-1.1,0.6,0.6);
    for(let i=0;i<9;i++){ const c2=new THREE.Mesh(new THREE.BoxGeometry(rr(0.06,0.12),0.015,rr(0.04,0.08)),chipM); put(c2,0.9+rr(-0.35,0.35),0.55+rr(-0.3,0.3),R()*3,0.05,1); }
  } else if(kind==='quarry'){
    put(mkCliff(),0,-1.0,0,0.9); put(mkTripod(),0.95,0.15,0.2,0.4);
    put(mkSledge(),-0.6,0.75,0.5,0.6);
    for(const [x,z,y] of[[0.05,0.5,0],[0.42,0.48,0],[0.22,0.5,0.3]]){ const b=mkBlock(1); const o=put(b,x,z,rr(-0.2,0.2),0.25); if(o)o.position.y+=y*K+0.15*K; }
    for(let i=0;i<6;i++)put(mkRock(rr(0.2,0.35)),-1.2+rr(-0.3,0.3),-0.1+rr(-0.4,0.4),R()*3,0.1,1);
  } else if(kind==='fish'){
    const pr=riverPier(cx,cz); if(pr){ g.add(pr.g); blk=pr.seg; }
    put(mkFishRack(),0,-0.35,0.1,0.6); put(mkNet(),-1.1,0.5,0.7,0.6); put(mkBoatUp(),1.05,0.55,-0.4,0.6)||put(mkBoatUp(),1.0,-1.45,0.3,0.6)||put(mkBoatUp(),-1.2,-0.9,1.2,0.6);   // занято мостками — запасные места
    put(mkFire(),0.2,0.75,0,0.3); put(mkBasket(1.1),-0.45,0.95,0,0.1); put(mkBasket(0.85),-0.2,1.15,0,0.1);
  }
  g.userData.ind=kind; return g; }

return {M,addReeds,cnv,tex,leafT,leafMottleTexB,photoMat,mkTree,mkPine,mkSPine,mkPalm,mkSnag,mkAcacia,mkRock,mkHut,mkCabin,mkFire,mkHide,mkWoodpile,mkBasket,mkSheaf,mkSheep,mkCow,mkPen,mkFarm,mkDock,mkLonghouse,mkGranary,mkKiln,mkMenhir,mkHay,mkStag,mkSettle,mkIndB,mkTent,strawCanvas,log};
}
