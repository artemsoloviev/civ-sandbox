// kit.js — общий набор «строителей из примитивов» для grad.
// Всё рисуется кодом (конусы/коробки/цилиндры), без скачанных моделей.
// Используется и витриной (procedural3d.html), и картой (world.html), и будущей игрой.
import * as THREE from 'three';

// ---------------- материалы (палитра) ----------------
export const M = {
  hide:  new THREE.MeshStandardMaterial({color:0xbd8c5c, roughness:0.95, flatShading:true}),
  pole:  new THREE.MeshStandardMaterial({color:0x5c4224, roughness:1}),
  fire:  new THREE.MeshStandardMaterial({color:0xff7a1a, emissive:0xff5a00, emissiveIntensity:1.6}),
  wall:  new THREE.MeshStandardMaterial({color:0xe7d6b0, roughness:0.9, flatShading:true}),
  wallD: new THREE.MeshStandardMaterial({color:0xd8c199, roughness:0.9, flatShading:true}),
  roof:  new THREE.MeshStandardMaterial({color:0xbd4a30, roughness:0.85, flatShading:true}),
  wood:  new THREE.MeshStandardMaterial({color:0x6b4a2f, roughness:1}),
  stone: new THREE.MeshStandardMaterial({color:0xcdbf9a, roughness:0.9, flatShading:true}),
  flag:  new THREE.MeshStandardMaterial({color:0xcc3a30, roughness:0.7, side:THREE.DoubleSide}),
  dark:  new THREE.MeshStandardMaterial({color:0x5e6d79, roughness:0.8, metalness:0.2}),
  block: new THREE.MeshStandardMaterial({color:0xd3dae1, roughness:0.55, metalness:0.15, flatShading:true}),
  concrete: new THREE.MeshStandardMaterial({color:0xbfc6cc, roughness:0.85, flatShading:true}),
  winLit:  new THREE.MeshStandardMaterial({color:0x201a06, emissive:0xffcf6b, emissiveIntensity:1.4}),
  winDark: new THREE.MeshStandardMaterial({color:0x2b3f57, roughness:0.2, metalness:0.6}),
  glass: new THREE.MeshStandardMaterial({color:0x9ec6e6, roughness:0.15, metalness:0.6, emissive:0x24445e, emissiveIntensity:0.35}),
  futA:  new THREE.MeshStandardMaterial({color:0x2f3960, roughness:0.35, metalness:0.5, flatShading:true}),
  futB:  new THREE.MeshStandardMaterial({color:0x232b4d, roughness:0.35, metalness:0.5, flatShading:true}),
  neonC: new THREE.MeshStandardMaterial({color:0x0a0a0a, emissive:0x41ecff, emissiveIntensity:2.4}),
  neonM: new THREE.MeshStandardMaterial({color:0x0a0a0a, emissive:0xff5cd8, emissiveIntensity:2.4}),
  trunk: new THREE.MeshStandardMaterial({color:0x6f4a2a, roughness:1}),
  leafP: new THREE.MeshStandardMaterial({color:0x2f6b3a, roughness:1, flatShading:true}),
  leafO: new THREE.MeshStandardMaterial({color:0x4c8f3f, roughness:1, flatShading:true}),
  leafA: new THREE.MeshStandardMaterial({color:0xc8862f, roughness:1, flatShading:true}),
  rock:  new THREE.MeshStandardMaterial({color:0x8a8f96, roughness:1, flatShading:true}),
  snow:  new THREE.MeshStandardMaterial({color:0xeef2f6, roughness:0.7, flatShading:true}),
  water: new THREE.MeshStandardMaterial({color:0x3f86c4, roughness:0.2, metalness:0.3, transparent:true, opacity:0.9}),
  padG:  new THREE.MeshStandardMaterial({color:0xa9c47f, roughness:1}),
  padT:  new THREE.MeshStandardMaterial({color:0xcdb98a, roughness:1}),
  padF:  new THREE.MeshStandardMaterial({color:0x2b3d5e, roughness:0.8, metalness:0.2}),
  // дороги разных эпох
  roadDirt:   new THREE.MeshStandardMaterial({color:0xbf9d6a, roughness:1}),
  roadStone:  new THREE.MeshStandardMaterial({color:0x9a9188, roughness:0.95, flatShading:true}),
  roadAsph:   new THREE.MeshStandardMaterial({color:0x40454c, roughness:0.9}),
  roadNeon:   new THREE.MeshStandardMaterial({color:0x0a1420, emissive:0x27d3ff, emissiveIntensity:1.6}),
  roadBorder: new THREE.MeshStandardMaterial({color:0x2d2a26, roughness:1}),
  roadLine:   new THREE.MeshStandardMaterial({color:0x1a1a0a, emissive:0xffd23a, emissiveIntensity:0.9}),
  rockLo: new THREE.MeshStandardMaterial({color:0x6f6a63, roughness:1, flatShading:true}),
  daub:   new THREE.MeshStandardMaterial({color:0xd8c48f, roughness:0.95, flatShading:true}),  // глиняно-плетёная обмазка стены
  daubD:  new THREE.MeshStandardMaterial({color:0xc2a86e, roughness:0.95, flatShading:true}),
  thatch: new THREE.MeshStandardMaterial({color:0xc7a24a, roughness:1, flatShading:true}),      // соломенная кровля
  // --- добавлено 2026-07-09 под виды поселений по эпохам (деревня / город / столица) ---
  mud:    new THREE.MeshStandardMaterial({color:0xcaa878, roughness:1, flatShading:true}),      // сырцовый кирпич (бронза, Междуречье)
  mudD:   new THREE.MeshStandardMaterial({color:0xb08f60, roughness:1, flatShading:true}),
  marble: new THREE.MeshStandardMaterial({color:0xeee7d6, roughness:0.75, flatShading:true}),   // мрамор/извёстка (античность)
  tile:   new THREE.MeshStandardMaterial({color:0xb1502f, roughness:0.85, flatShading:true}),   // терракотовая черепица
  brick:  new THREE.MeshStandardMaterial({color:0x8d4a3a, roughness:0.95, flatShading:true}),   // кирпич (индустрия)
  soot:   new THREE.MeshStandardMaterial({color:0x4a423d, roughness:1, flatShading:true}),      // закопчённая труба
  gold:   new THREE.MeshStandardMaterial({color:0xd9a441, roughness:0.4, metalness:0.6}),       // купола, навершия
  slate:  new THREE.MeshStandardMaterial({color:0x4f5a68, roughness:0.85, flatShading:true}),   // шифер/свинец кровли
};

// Флаг державы: цвет задаётся игроком при выборе страны (см. PALETTE в index.html).
// Кэшируем материал по цвету — иначе на каждое поселение новый материал и лишние вызовы отрисовки.
const _flagMats=new Map();
export function flagMat(color=0xcc3a30){
  if(!_flagMats.has(color)) _flagMats.set(color, new THREE.MeshStandardMaterial({color, roughness:0.7, side:THREE.DoubleSide}));
  return _flagMats.get(color);
}

function mesh(geo,mat){ const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; return m; }

// небольшой детерминированный «шум» по индексу — чтобы окна не мигали при каждом кадре
function lit(i){ return ((i*2654435761)>>> 0) % 5 < 2; }   // ~40% окон горит

// ---------------- поселения ----------------
export function tent(s=1){
  const g=new THREE.Group();
  const c=mesh(new THREE.ConeGeometry(1.05*s,1.9*s,7), M.hide); c.position.y=0.95*s; g.add(c);
  for(const dir of [-1,1]){
    const p=mesh(new THREE.CylinderGeometry(0.04,0.04,0.8*s,5), M.pole);
    p.position.set(dir*0.15*s,1.9*s,0); p.rotation.z=dir*0.5; g.add(p);
  }
  const door=mesh(new THREE.ConeGeometry(0.3*s,0.7*s,4), M.pole); door.position.set(0,0.35*s,0.75*s); door.rotation.y=Math.PI/4; g.add(door);
  return g;
}
export function fire(){
  const g=new THREE.Group();
  const f=mesh(new THREE.ConeGeometry(0.35,0.9,6), M.fire); f.position.y=0.45; g.add(f);
  // ТОЧЕЧНЫЙ СВЕТ УБРАН (2026-08-18, диагностика v3 на Mac M4): ~40 очагов-PointLight на большой
  // карте заставляли КАЖДЫЙ материал считать блики от каждого огня на каждом пикселе — 7 fps.
  // Пламя остаётся (меш), оранжевая подсветка земли днём под солнцем всё равно не читалась.
  for(let i=0;i<3;i++){ const log=mesh(new THREE.CylinderGeometry(0.06,0.06,0.7,5),M.pole);
    log.rotation.z=Math.PI/2; log.rotation.y=i*1.0; log.position.y=0.08; g.add(log); }
  return g;
}
// круглая глинобитная хижина неолита (плетень+обмазка, соломенная кровля)
export function hut(s=1){
  const g=new THREE.Group();
  const w=mesh(new THREE.CylinderGeometry(0.78*s,0.85*s,0.85*s,10), M.daub); w.position.y=0.425*s; g.add(w);
  const r=mesh(new THREE.ConeGeometry(0.98*s,0.72*s,10), M.thatch); r.position.y=0.85*s+0.36*s; g.add(r);
  const door=mesh(new THREE.BoxGeometry(0.32*s,0.5*s,0.05), M.wood); door.position.set(0,0.27*s,0.82*s); g.add(door);
  return g;
}
// зерновая яма/амбар на сваях — плетёная корзина на столбах, соломенная крышка
export function granary(s=1){
  const g=new THREE.Group();
  for(const [ix,iz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){
    const leg=mesh(new THREE.CylinderGeometry(0.035*s,0.045*s,0.5*s,5), M.pole);
    leg.position.set(ix*0.28*s,0.25*s,iz*0.28*s); g.add(leg);
  }
  const basket=mesh(new THREE.CylinderGeometry(0.4*s,0.44*s,0.4*s,10), M.daubD); basket.position.y=0.7*s; g.add(basket);
  const lid=mesh(new THREE.ConeGeometry(0.48*s,0.32*s,10), M.thatch); lid.position.y=0.9*s+0.16*s; g.add(lid);
  return g;
}
// частокол — короткий ряд заострённых кольев (для обороны крупного неолитического посёлка)
export function palisade(n=5, s=1){
  const g=new THREE.Group();
  for(let i=0;i<n;i++){
    const x=(i-(n-1)/2)*0.24*s;
    const h=0.85*s+((i*37)%5)*0.03*s;
    const pole=mesh(new THREE.CylinderGeometry(0.045*s,0.06*s,h,5), M.wood); pole.position.set(x,h/2,0); g.add(pole);
    const tip=mesh(new THREE.ConeGeometry(0.07*s,0.18*s,5), M.wood); tip.position.set(x,h+0.09*s,0); g.add(tip);
  }
  return g;
}
export function house(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(1.7*s,1.15*s,1.35*s), M.wall); b.position.y=0.575*s; g.add(b);
  const r=mesh(new THREE.ConeGeometry(1.35*s,0.95*s,4), M.roof);
  r.rotation.y=Math.PI/4; r.position.y=1.15*s+0.47*s; g.add(r);
  const d=mesh(new THREE.BoxGeometry(0.4*s,0.6*s,0.06), M.wood); d.position.set(0,0.3*s,0.69*s); g.add(d);
  // окна — по два на переднюю и боковые грани
  const wgeo=new THREE.BoxGeometry(0.28*s,0.3*s,0.05);
  let k=0;
  for(const [ax,face] of [['z',1],['x',1],['x',-1]]){
    for(const off of [-0.45*s,0.45*s]){
      const w=mesh(wgeo, lit(k++)?M.winLit:M.winDark);
      if(ax==='z') w.position.set(off,0.62*s,0.69*s);
      else w.position.set(face*0.86*s,0.62*s,off);
      g.add(w);
    }
  }
  return g;
}
export function tower(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(1.5*s,2.8*s,1.5*s), M.stone); b.position.y=1.4*s; g.add(b);
  for(let ix=-1;ix<=1;ix+=2) for(let iz=-1;iz<=1;iz+=2){
    const cr=mesh(new THREE.BoxGeometry(0.45*s,0.5*s,0.45*s), M.stone);
    cr.position.set(ix*0.5*s,2.9*s,iz*0.5*s); g.add(cr);
  }
  const pole=mesh(new THREE.CylinderGeometry(0.05,0.05,1.4*s,5), M.wood); pole.position.y=3.6*s; g.add(pole);
  const flag=mesh(new THREE.BoxGeometry(0.9*s,0.5*s,0.04), M.flag); flag.position.set(0.45*s,3.9*s,0); g.add(flag);
  const d=mesh(new THREE.BoxGeometry(0.5*s,0.85*s,0.06), M.wood); d.position.set(0,0.42*s,0.76*s); g.add(d);
  // узкие бойницы-окна
  const wgeo=new THREE.BoxGeometry(0.16*s,0.4*s,0.05);
  let k=3;
  for(const y of [1.1*s,1.9*s]) for(const off of [-0.35*s,0.35*s]){
    const w=mesh(wgeo, lit(k++)?M.winLit:M.winDark); w.position.set(off,y,0.76*s); g.add(w);
  }
  return g;
}
export function block(h=2, s=1, {antenna=false}={}){
  const g=new THREE.Group();
  const w=1.6*s, d=1.6*s;
  const b=mesh(new THREE.BoxGeometry(w,h,d), M.block); b.position.y=h/2; g.add(b);
  // сетка окон на всех четырёх гранях
  const rows=Math.max(2,Math.floor(h/0.62)), cols=3, ww=0.24*s, wh=0.32;
  const wgeo=new THREE.BoxGeometry(ww,wh,0.05);
  const wgeoZ=new THREE.BoxGeometry(0.05,wh,ww);
  let k=0;
  for(const [ax,face] of [['z',1],['z',-1],['x',1],['x',-1]]){
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const off=(c-(cols-1)/2)*(w*0.6/(cols-1||1));
      const y=0.45+r*((h-0.6)/(rows-1||1));
      const win=mesh(ax==='z'?wgeo:wgeoZ, lit(k++)?M.winLit:M.winDark);
      if(ax==='z') win.position.set(off,y,face*(d/2+0.01));
      else win.position.set(face*(w/2+0.01),y,off);
      g.add(win);
    }
  }
  if(antenna){ const a=mesh(new THREE.CylinderGeometry(0.03,0.03,1.2*s,5),M.dark); a.position.y=h+0.6*s; g.add(a);
    const tip=mesh(new THREE.SphereGeometry(0.09,8,8),M.neonC); tip.position.y=h+1.2*s; g.add(tip); }
  return g;
}
export function ftower(h=4, s=1, alt=false){
  const g=new THREE.Group();
  const body=mesh(new THREE.CylinderGeometry(0.55*s,0.95*s,h,6), alt?M.futB:M.futA); body.position.y=h/2; g.add(body);
  const neon=alt?M.neonM:M.neonC;
  for(let kk=0;kk<3;kk++){ const a=kk/3*Math.PI*2;
    const rib=mesh(new THREE.BoxGeometry(0.05,h*0.86,0.05), neon);
    rib.position.set(Math.cos(a)*0.7*s, h/2, Math.sin(a)*0.7*s); g.add(rib);
  }
  // светящиеся окошки-ряды
  const rows=Math.max(3,Math.floor(h/0.8));
  for(let r=0;r<rows;r++){ const y=0.5+r*((h-0.8)/(rows-1)); const rad=(0.9-0.4*(y/h))*s;
    for(let a=0;a<6;a++){ const ang=a/6*Math.PI*2+0.3;
      const w=mesh(new THREE.BoxGeometry(0.12*s,0.16,0.04), neon);
      w.position.set(Math.cos(ang)*rad, y, Math.sin(ang)*rad); w.lookAt(0,y,0); g.add(w);
    }
  }
  const cap=mesh(new THREE.SphereGeometry(0.16,10,10), neon); cap.position.y=h+0.05; g.add(cap);
  return g;
}
export function dome(s=1){
  const g=new THREE.Group();
  const d=mesh(new THREE.SphereGeometry(1.3*s,18,12,0,Math.PI*2,0,Math.PI/2), M.futA); g.add(d);
  const ring=mesh(new THREE.TorusGeometry(1.31*s,0.05,8,32), M.neonC);
  ring.rotation.x=Math.PI/2; ring.position.y=0.5*s; g.add(ring);
  return g;
}
// ======== здания эпох: деревня → город → столица (добавлено 2026-07-09) ========
// Правило вида: ДЕРЕВНЯ — просто дома; ГОРОД — дома + ограда + общественное здание;
// СТОЛИЦА — то же + ДОМИНАНТА эпохи + флаг в цвете державы.

// флагшток с полотнищем цвета державы — метка «это моё» на столице
export function banner(s=1, color=0xcc3a30){
  const g=new THREE.Group();
  const p=mesh(new THREE.CylinderGeometry(0.045*s,0.055*s,2.6*s,6), M.wood); p.position.y=1.3*s; g.add(p);
  const f=mesh(new THREE.BoxGeometry(1.0*s,0.6*s,0.03), flagMat(color)); f.position.set(0.5*s,2.25*s,0); g.add(f);
  const top=mesh(new THREE.ConeGeometry(0.08*s,0.2*s,6), M.gold); top.position.y=2.7*s; g.add(top);
  return g;
}
// МЕДНЫЙ ВЕК: дом вождя — круглый, крупнее хижины, на земляной насыпи; рядом тотем
export function chiefHut(s=1){
  const g=new THREE.Group();
  const mound=mesh(new THREE.CylinderGeometry(1.5*s,1.7*s,0.3*s,12), M.roadDirt); mound.position.y=0.15*s; g.add(mound);
  const w=mesh(new THREE.CylinderGeometry(1.0*s,1.1*s,1.05*s,12), M.daub); w.position.y=0.3*s+0.52*s; g.add(w);
  const r=mesh(new THREE.ConeGeometry(1.28*s,0.95*s,12), M.thatch); r.position.y=1.35*s+0.48*s; g.add(r);
  const d=mesh(new THREE.BoxGeometry(0.4*s,0.6*s,0.05), M.wood); d.position.set(0,0.62*s,1.07*s); g.add(d);
  return g;
}
export function totem(s=1){
  const g=new THREE.Group();
  const p=mesh(new THREE.CylinderGeometry(0.12*s,0.15*s,1.9*s,7), M.wood); p.position.y=0.95*s; g.add(p);
  for(let i=0;i<3;i++){ const ring=mesh(new THREE.TorusGeometry(0.2*s,0.05*s,6,10), i%2?M.daubD:M.fire);
    ring.rotation.x=Math.PI/2; ring.position.y=(0.6+i*0.45)*s; g.add(ring); }
  const top=mesh(new THREE.ConeGeometry(0.22*s,0.35*s,7), M.daub); top.position.y=2.05*s; g.add(top);
  return g;
}
// плетень — низкая ограда города медного века (кольцом ставится в cluster)
export function wattle(n=6, s=1){
  const g=new THREE.Group();
  for(let i=0;i<n;i++){ const x=(i-(n-1)/2)*0.26*s;
    const p=mesh(new THREE.CylinderGeometry(0.03*s,0.04*s,0.62*s,5), M.wood); p.position.set(x,0.31*s,0); g.add(p); }
  for(const y of [0.22*s,0.46*s]){ const rod=mesh(new THREE.BoxGeometry(n*0.26*s,0.04*s,0.05*s), M.daubD); rod.position.y=y; g.add(rod); }
  return g;
}
// БРОНЗА: прямоугольный сырцовый дом с ПЛОСКОЙ крышей (Междуречье)
export function mudhouse(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(1.5*s,1.1*s,1.25*s), M.mud); b.position.y=0.55*s; g.add(b);
  const par=mesh(new THREE.BoxGeometry(1.6*s,0.14*s,1.35*s), M.mudD); par.position.y=1.14*s; g.add(par);  // парапет крыши
  const d=mesh(new THREE.BoxGeometry(0.34*s,0.6*s,0.05), M.wood); d.position.set(0,0.3*s,0.64*s); g.add(d);
  return g;
}
// БРОНЗА, доминанта: ЗИККУРАТ — три сужающиеся ступени + лестница + святилище
export function ziggurat(s=1){
  const g=new THREE.Group();
  const tiers=[[2.6,0.7,0],[1.9,0.6,0.7],[1.25,0.5,1.3]];
  tiers.forEach(([w,h,y])=>{ const b=mesh(new THREE.BoxGeometry(w*s,h*s,w*s*0.8), M.mud); b.position.y=(y+h/2)*s; g.add(b); });
  const shrine=mesh(new THREE.BoxGeometry(0.7*s,0.5*s,0.6*s), M.mudD); shrine.position.y=2.05*s; g.add(shrine);
  const horn=mesh(new THREE.ConeGeometry(0.1*s,0.28*s,6), M.gold); horn.position.y=2.42*s; g.add(horn);
  for(let i=0;i<6;i++){ const st=mesh(new THREE.BoxGeometry(0.5*s,0.09*s,0.16*s), M.mudD);
    st.position.set(0,(0.1+i*0.16)*s,(1.05+i*0.09)*s); g.add(st); }                  // лестница по фасаду
  return g;
}
// АНТИЧНОСТЬ: дом с двускатной черепичной кровлей и извёсткой
export function antHouse(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(1.6*s,1.0*s,1.3*s), M.marble); b.position.y=0.5*s; g.add(b);
  const r=mesh(new THREE.ConeGeometry(1.28*s,0.62*s,4), M.tile); r.rotation.y=Math.PI/4; r.position.y=1.31*s; g.add(r);
  const d=mesh(new THREE.BoxGeometry(0.36*s,0.58*s,0.05), M.wood); d.position.set(0,0.29*s,0.66*s); g.add(d);
  return g;
}
// АНТИЧНОСТЬ, доминанта: ХРАМ с колоннадой — стилобат, 6 колонн, антаблемент, фронтон
export function temple(s=1){
  const g=new THREE.Group();
  for(let i=0;i<3;i++){ const st=mesh(new THREE.BoxGeometry((3.0-i*0.2)*s,0.16*s,(2.0-i*0.16)*s), M.marble);
    st.position.y=(0.08+i*0.16)*s; g.add(st); }
  const colG=new THREE.CylinderGeometry(0.1*s,0.12*s,1.3*s,10);
  for(let i=0;i<6;i++){ const x=(i-2.5)*0.46*s;
    for(const z of [-0.72*s,0.72*s]){ const c=mesh(colG,M.marble); c.position.set(x,1.15*s,z); g.add(c); } }
  const arch=mesh(new THREE.BoxGeometry(2.9*s,0.2*s,1.9*s), M.marble); arch.position.y=1.9*s; g.add(arch);
  const ped=mesh(new THREE.ConeGeometry(1.6*s,0.5*s,4), M.tile); ped.rotation.y=Math.PI/4; ped.position.y=2.25*s;
  ped.scale.set(1,1,0.62); g.add(ped);                                                // фронтон-двускатка
  return g;
}
// каменная стена-секция (город античности и позже)
export function stoneWall(n=6, s=1){
  const g=new THREE.Group();
  const w=mesh(new THREE.BoxGeometry(n*0.26*s,0.75*s,0.22*s), M.stone); w.position.y=0.375*s; g.add(w);
  for(let i=0;i<n;i+=2){ const cr=mesh(new THREE.BoxGeometry(0.16*s,0.16*s,0.24*s), M.stone);
    cr.position.set((i-(n-1)/2)*0.26*s,0.83*s,0); g.add(cr); }                        // зубцы
  return g;
}
// АНТИЧНОСТЬ/город: портик — короткая колоннада (общественное здание)
export function portico(s=1){
  const g=new THREE.Group();
  const base=mesh(new THREE.BoxGeometry(1.8*s,0.16*s,1.0*s), M.marble); base.position.y=0.08*s; g.add(base);
  const colG=new THREE.CylinderGeometry(0.08*s,0.1*s,1.0*s,8);
  for(let i=0;i<4;i++){ const c=mesh(colG,M.marble); c.position.set((i-1.5)*0.45*s,0.66*s,0.35*s); g.add(c); }
  const top=mesh(new THREE.BoxGeometry(1.8*s,0.14*s,1.0*s), M.tile); top.position.y=1.23*s; g.add(top);
  return g;
}
// СРЕДНЕВЕКОВЬЕ, доминанта: СОБОР — неф, два шпиля, розетка
export function cathedral(s=1){
  const g=new THREE.Group();
  const nave=mesh(new THREE.BoxGeometry(1.4*s,1.7*s,2.8*s), M.stone); nave.position.y=0.85*s; g.add(nave);
  const roof=mesh(new THREE.ConeGeometry(1.0*s,0.8*s,4), M.slate); roof.rotation.y=Math.PI/4;
  roof.position.y=2.05*s; roof.scale.set(1,1,2.0); g.add(roof);
  for(const x of [-0.5*s,0.5*s]){
    const t=mesh(new THREE.BoxGeometry(0.5*s,2.6*s,0.5*s), M.stone); t.position.set(x,1.3*s,-1.25*s); g.add(t);
    const sp=mesh(new THREE.ConeGeometry(0.34*s,1.0*s,6), M.slate); sp.position.set(x,3.1*s,-1.25*s); g.add(sp);
    const cr=mesh(new THREE.BoxGeometry(0.05*s,0.3*s,0.05), M.gold); cr.position.set(x,3.75*s,-1.25*s); g.add(cr);
  }
  const rose=mesh(new THREE.CylinderGeometry(0.28*s,0.28*s,0.06,12), M.winLit);
  rose.rotation.x=Math.PI/2; rose.position.set(0,1.5*s,-1.52*s); g.add(rose);
  return g;
}
export function chapel(s=1){                       // город средневековья: часовня
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(0.9*s,1.0*s,1.5*s), M.stone); b.position.y=0.5*s; g.add(b);
  const r=mesh(new THREE.ConeGeometry(0.72*s,0.5*s,4), M.slate); r.rotation.y=Math.PI/4; r.position.y=1.25*s; r.scale.set(1,1,1.7); g.add(r);
  const t=mesh(new THREE.BoxGeometry(0.34*s,1.6*s,0.34*s), M.stone); t.position.set(0,0.8*s,-0.85*s); g.add(t);
  const sp=mesh(new THREE.ConeGeometry(0.24*s,0.6*s,6), M.slate); sp.position.set(0,1.9*s,-0.85*s); g.add(sp);
  return g;
}
// НОВОЕ ВРЕМЯ: каменный дом (мансарда), ратуша, дворец со шпилем
export function stoneHouse(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(1.5*s,1.5*s,1.3*s), M.wallD); b.position.y=0.75*s; g.add(b);
  const r=mesh(new THREE.ConeGeometry(1.15*s,0.8*s,4), M.slate); r.rotation.y=Math.PI/4; r.position.y=1.9*s; g.add(r);
  const wgeo=new THREE.BoxGeometry(0.24*s,0.34*s,0.05); let k=0;
  for(const y of [0.55*s,1.1*s]) for(const off of [-0.4*s,0.4*s]){
    const w=mesh(wgeo, lit(k++)?M.winLit:M.winDark); w.position.set(off,y,0.66*s); g.add(w); }
  return g;
}
export function townhall(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(2.0*s,1.4*s,1.3*s), M.stone); b.position.y=0.7*s; g.add(b);
  const r=mesh(new THREE.BoxGeometry(2.1*s,0.14*s,1.4*s), M.slate); r.position.y=1.47*s; g.add(r);
  const t=mesh(new THREE.BoxGeometry(0.5*s,1.5*s,0.5*s), M.stone); t.position.y=1.5*s; g.add(t);
  const cl=mesh(new THREE.CylinderGeometry(0.18*s,0.18*s,0.06,12), M.gold); cl.rotation.x=Math.PI/2; cl.position.set(0,2.0*s,0.27*s); g.add(cl);
  const sp=mesh(new THREE.ConeGeometry(0.3*s,0.7*s,6), M.slate); sp.position.y=2.6*s; g.add(sp);
  return g;
}
export function palace(s=1){                       // доминанта Нового времени: дворец со шпилем и куполом
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(3.2*s,1.5*s,1.5*s), M.wall); b.position.y=0.75*s; g.add(b);
  const cor=mesh(new THREE.BoxGeometry(3.3*s,0.16*s,1.6*s), M.stone); cor.position.y=1.56*s; g.add(cor);
  const cen=mesh(new THREE.BoxGeometry(1.2*s,1.0*s,1.2*s), M.wall); cen.position.y=2.05*s; g.add(cen);
  const dm=mesh(new THREE.SphereGeometry(0.62*s,14,10,0,Math.PI*2,0,Math.PI/2), M.gold); dm.position.y=2.55*s; g.add(dm);
  const sp=mesh(new THREE.ConeGeometry(0.1*s,0.9*s,6), M.gold); sp.position.y=3.35*s; g.add(sp);
  const colG=new THREE.CylinderGeometry(0.08*s,0.09*s,1.1*s,8);
  for(let i=0;i<5;i++){ const c=mesh(colG,M.marble); c.position.set((i-2)*0.5*s,0.7*s,0.78*s); g.add(c); }
  const wgeo=new THREE.BoxGeometry(0.2*s,0.36*s,0.05); let k=7;
  for(const off of [-1.3*s,-0.9*s,0.9*s,1.3*s]){ const w=mesh(wgeo, lit(k++)?M.winLit:M.winDark); w.position.set(off,0.75*s,0.77*s); g.add(w); }
  return g;
}
export function bastion(s=1){                      // город Нового времени: угловой бастион вместо частокола
  const g=new THREE.Group();
  const b=mesh(new THREE.CylinderGeometry(0.75*s,0.95*s,0.8*s,5), M.stone); b.position.y=0.4*s; g.add(b);
  const top=mesh(new THREE.CylinderGeometry(0.85*s,0.85*s,0.1*s,5), M.roadDirt); top.position.y=0.85*s; g.add(top);
  return g;
}
// ИНДУСТРИЯ: кирпичный дом, фабричная труба, вокзал с часовой башней
export function brickHouse(s=1){
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(1.4*s,1.6*s,1.2*s), M.brick); b.position.y=0.8*s; g.add(b);
  const r=mesh(new THREE.BoxGeometry(1.5*s,0.12*s,1.3*s), M.slate); r.position.y=1.66*s; g.add(r);
  const ch=mesh(new THREE.BoxGeometry(0.18*s,0.4*s,0.18*s), M.brick); ch.position.set(0.45*s,1.85*s,0); g.add(ch);
  const wgeo=new THREE.BoxGeometry(0.22*s,0.3*s,0.05); let k=2;
  for(const y of [0.5*s,1.15*s]) for(const off of [-0.35*s,0.35*s]){
    const w=mesh(wgeo, lit(k++)?M.winLit:M.winDark); w.position.set(off,y,0.61*s); g.add(w); }
  return g;
}
export function chimney(s=1){
  const g=new THREE.Group();
  const base=mesh(new THREE.BoxGeometry(0.9*s,0.5*s,0.9*s), M.brick); base.position.y=0.25*s; g.add(base);
  const st=mesh(new THREE.CylinderGeometry(0.16*s,0.26*s,2.6*s,10), M.brick); st.position.y=1.8*s; g.add(st);
  const cap=mesh(new THREE.CylinderGeometry(0.2*s,0.18*s,0.16*s,10), M.soot); cap.position.y=3.15*s; g.add(cap);
  return g;
}
export function station(s=1){                      // доминанта Индустрии: вокзал с часовой башней
  const g=new THREE.Group();
  const b=mesh(new THREE.BoxGeometry(3.0*s,1.4*s,1.4*s), M.brick); b.position.y=0.7*s; g.add(b);
  const roof=mesh(new THREE.CylinderGeometry(0.75*s,0.75*s,3.0*s,12,1,false,0,Math.PI), M.dark);
  roof.rotation.z=Math.PI/2; roof.position.y=1.4*s; g.add(roof);                     // дебаркадер-полуцилиндр
  const t=mesh(new THREE.BoxGeometry(0.7*s,2.6*s,0.7*s), M.brick); t.position.set(-1.5*s,1.3*s,0); g.add(t);
  const cl=mesh(new THREE.CylinderGeometry(0.24*s,0.24*s,0.08,14), M.winLit);
  cl.rotation.x=Math.PI/2; cl.position.set(-1.5*s,2.3*s,0.38*s); g.add(cl);
  const cap=mesh(new THREE.ConeGeometry(0.5*s,0.5*s,4), M.slate); cap.rotation.y=Math.PI/4; cap.position.set(-1.5*s,2.85*s,0); g.add(cap);
  return g;
}
// БУДУЩЕЕ: шпиль с парящим кольцом (доминанта)
export function spireRing(s=1){
  const g=new THREE.Group();
  const sp=mesh(new THREE.CylinderGeometry(0.12*s,0.5*s,5.2*s,8), M.futA); sp.position.y=2.6*s; g.add(sp);
  const ring=mesh(new THREE.TorusGeometry(1.15*s,0.07*s,8,28), M.neonC); ring.rotation.x=Math.PI/2; ring.position.y=3.6*s; g.add(ring);
  const ring2=mesh(new THREE.TorusGeometry(0.8*s,0.05*s,8,24), M.neonM); ring2.rotation.x=Math.PI/2; ring2.position.y=4.5*s; g.add(ring2);
  const tip=mesh(new THREE.ConeGeometry(0.14*s,0.5*s,7), M.neonC); tip.position.y=5.45*s; g.add(tip);
  return g;
}

export function pad(kind){
  const disc=mesh(new THREE.CylinderGeometry(3.2,3.4,0.3,40), kind==='f'?M.padF:M.padG);
  disc.position.y=0.15;
  const inner=mesh(new THREE.CylinderGeometry(2.3,2.3,0.34,36), kind==='f'?M.futB:M.padT);
  inner.position.y=0.02; disc.add(inner);
  const grp=new THREE.Group(); grp.add(disc); return grp;
}
function at(parent,obj,x,z){ obj.position.x+=x; obj.position.z+=z; parent.add(obj); return obj; }

// Как выглядит поселение эпохи: рядовой дом, общественное здание (город+), доминанта (столица), ограда.
// Добавлено 2026-07-09: раньше эпох было пять и различие шло только по числу домиков.
const ARCH={
  prehistoric:{ house:s=>tent(s),       civic:null,          crown:null,                fence:null,                  hearth:true  },
  neolithic:  { house:s=>hut(s),        civic:s=>granary(s), crown:s=>chiefHut(s*0.9),  fence:(n,s)=>palisade(n,s),  hearth:true  },
  copper:     { house:s=>hut(s),        civic:s=>granary(s), crown:s=>chiefHut(s*0.9),  fence:(n,s)=>wattle(n,s),    hearth:true  },
  bronze:     { house:s=>mudhouse(s),   civic:s=>granary(s), crown:s=>ziggurat(s*0.85), fence:(n,s)=>stoneWall(n,s), hearth:false },
  antique:    { house:s=>antHouse(s),   civic:s=>portico(s), crown:s=>temple(s*0.8),    fence:(n,s)=>stoneWall(n,s), hearth:false },
  medieval:   { house:s=>house(s),      civic:s=>chapel(s),  crown:s=>cathedral(s*0.8), fence:(n,s)=>palisade(n,s),  hearth:false },
  renaissance:{ house:s=>stoneHouse(s), civic:s=>townhall(s),crown:s=>palace(s*0.8),    fence:(n,s)=>bastion(s),     hearth:false },
  industrial: { house:s=>brickHouse(s), civic:s=>chimney(s), crown:s=>station(s*0.85),  fence:null,                  hearth:false },
  modern:     { house:s=>block(2,s),    civic:s=>block(3.4,s,{antenna:true}), crown:s=>block(6.5,s,{antenna:true}), fence:null, hearth:false },
  future:     { house:s=>ftower(3.2,s), civic:s=>dome(s*0.55), crown:s=>spireRing(s*0.9), fence:null,                hearth:false },
};
// кластер поселения. epoch — ключ ARCH; sz 1..4 — сколько домов.
// kind: 'village' (просто дома) | 'city' (+ ограда и общественное здание) | 'capital' (+ доминанта и флаг державы).
// color — цвет флага столицы. onPad=true — на площадке (витрина); иначе голая группа для карты.
export function cluster(epoch, sz, {onPad=true, kind='village', color=0xcc3a30}={}){
  const A=ARCH[epoch]||ARCH.medieval;
  const g = onPad ? pad(epoch==='future'?'f':'g') : new THREE.Group();
  const P=(o,x,z)=>at(g,o,x,z);
  const isCity=kind==='city', isCap=kind==='capital';
  // дома по кольцу вокруг центра; у города и столицы середина занята — жильё отодвигаем наружу
  const n=Math.min(6, sz + (isCap?2:isCity?1:0));
  const R=(isCap||isCity)?2.1:1.35;
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2 + 0.4;
    const s=0.72+((i*37)%4)*0.06;
    const h=A.house(s); h.rotation.y=-a+Math.PI;
    P(h, Math.cos(a)*R*(1+((i*13)%3)*0.06), Math.sin(a)*R*0.82);
  }
  if(A.hearth && !isCap) P(fire(), isCity?1.5:0.9, isCity?1.5:1.0);       // очаг — только у мелких поселений
  if(isCity||isCap){
    if(A.civic) P(A.civic(isCap?0.8:0.9), isCap?-2.2:0, isCap?1.6:1.5);   // общественное здание
    if(A.fence){                                                          // ограда: три секции по фронту
      for(const [x,z,rot] of [[-1.9,-1.7,0.55],[0,-2.35,0],[1.9,-1.7,-0.55]]){
        const f=A.fence(6, 1); f.rotation.y=rot; P(f,x,z);
      }
    }
  }
  if(isCap){
    P(A.crown(1), 0, -0.25);                                              // ДОМИНАНТА эпохи в центре
    if(epoch==='copper'||epoch==='neolithic'||epoch==='prehistoric') P(totem(0.9), 1.7, 1.5);
    P(banner(1, color), -1.55, -1.25);                                    // флаг в цвете державы
  }
  return g;
}

// ---------------- природа ----------------
export function pine(s=1){
  const g=new THREE.Group();
  const t=mesh(new THREE.CylinderGeometry(0.09*s,0.12*s,0.6*s,6),M.trunk); t.position.y=0.3*s; g.add(t);
  for(let i=0;i<3;i++){ const c=mesh(new THREE.ConeGeometry((0.7-i*0.18)*s,(0.9)*s,7),M.leafP);
    c.position.y=(0.7+i*0.55)*s; g.add(c); }
  return g;
}
export function oak(s=1, autumn=false){
  const g=new THREE.Group();
  const t=mesh(new THREE.CylinderGeometry(0.1*s,0.13*s,0.7*s,6),M.trunk); t.position.y=0.35*s; g.add(t);
  const crown=mesh(new THREE.IcosahedronGeometry(0.7*s,0), autumn?M.leafA:M.leafO); crown.position.y=1.2*s; g.add(crown);
  const c2=mesh(new THREE.IcosahedronGeometry(0.5*s,0), autumn?M.leafA:M.leafO); c2.position.set(0.35*s,1.0*s,0.1*s); g.add(c2);
  return g;
}
export function rock(s=1){
  const r=mesh(new THREE.IcosahedronGeometry(0.6*s,0),M.rock); r.rotation.set(Math.random(),Math.random(),Math.random());
  r.position.y=0.3*s; return r;
}
// скалистый пик: конус с «рваными» вершинами + снег покраской по высоте
const _cSnow=new THREE.Color(0xeef2f6), _cRockHi=new THREE.Color(0x9aa0a6), _cRockLo=new THREE.Color(0x6f6a63);
function peak(s, h, seed){
  const geo=new THREE.ConeGeometry(1.9*s, h, 7, 5);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i), y=p.getY(i), z=p.getZ(i);
    const rn=(n)=>{ const v=Math.sin((i+seed)*n)*43758.5453; return v-Math.floor(v); };
    const bottom = y < (-h/2+0.05);                 // нижнее кольцо не дёргаем (стоит на земле)
    const j = bottom?0:1;
    p.setX(i, x*(1+(rn(12.9)-0.5)*0.55*j));
    p.setZ(i, z*(1+(rn(78.2)-0.5)*0.55*j));
    p.setY(i, y+(rn(4.7)-0.5)*0.9*s*j);
  }
  geo.translate(0, h/2, 0);                          // основание на y=0
  geo.computeVertexNormals();
  const col=[];
  for(let i=0;i<p.count;i++){ const t=THREE.MathUtils.clamp(p.getY(i)/h,0,1);
    const c = t>0.6 ? _cSnow.clone() : _cRockLo.clone().lerp(_cRockHi, t/0.6);
    col.push(c.r,c.g,c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({vertexColors:true, flatShading:true, roughness:1}));
  m.castShadow=true; m.receiveShadow=true; return m;
}
export function mountain(s=1){
  const g=new THREE.Group();
  g.add(peak(s, 6.2*s, 3));
  const p2=peak(s*0.7, 4.4*s, 47); p2.position.set(2.1*s,0,0.8*s); g.add(p2);   // отрог рядом → массив, не одинокий конус
  return g;
}

// низкополигональная птичка — ПЕРВОНАЧАЛЬНЫЙ вариант (возврат 2026-08-17 по вердикту:
// «чайки» 15.08 стали хуже): тёмный силуэт-«ласточка», крыло — один треугольник, без клюва
// и хвоста. Издалека читается птицей лучше детализированной модели. Шарниры прежние:
// userData.wingL/wingR, крутить pivot.rotation.z снаружи для взмаха. Курс полёта = +z.
const _birdMat=new THREE.MeshStandardMaterial({color:0x2e2b28, roughness:0.9, flatShading:true, side:THREE.DoubleSide});
function birdWing(dir,s){
  const v=new Float32Array([0,0,0,  dir*0.30*s,0,0.06*s,  dir*0.26*s,0,-0.10*s]);
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(v,3));
  geo.computeVertexNormals();
  return geo;
}
export function bird(s=1){
  const g=new THREE.Group();
  const body=mesh(new THREE.IcosahedronGeometry(0.06*s,0), _birdMat);
  body.scale.set(1,0.6,1.9); g.add(body);
  for(const dir of [-1,1]){
    const piv=new THREE.Group(); piv.position.set(dir*0.02*s,0.01*s,0);
    piv.add(mesh(birdWing(dir,s), _birdMat));
    g.add(piv);
    g.userData[dir<0?'wingL':'wingR']=piv;
  }
  return g;
}

// плоская лента (река/дорога), идёт по точкам, повторяя рельеф. pts: [[x,y,z],...]
export function flatStrip(pts, halfW, mat, lift=0.06){
  const v=[], n=pts.length, idx=[];
  for(let i=0;i<n;i++){
    const a=pts[i], p=pts[Math.min(i+1,n-1)], q=pts[Math.max(i-1,0)];
    let dx=p[0]-q[0], dz=p[2]-q[2]; const L=Math.hypot(dx,dz)||1; dx/=L; dz/=L;
    const px=-dz*halfW, pz=dx*halfW;
    v.push(a[0]+px, a[1]+lift, a[2]+pz,  a[0]-px, a[1]+lift, a[2]-pz);
  }
  for(let i=0;i<n-1;i++){ const o=i*2; idx.push(o,o+1,o+2, o+1,o+3,o+2); }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v,3));
  g.setIndex(idx); g.computeVertexNormals();
  const mm = mat.clone(); mm.side = THREE.DoubleSide;   // лента может «смотреть» вниз — рисуем с обеих сторон
  const m=new THREE.Mesh(g,mm); m.receiveShadow=true; return m;
}

// ---------------- надписи (UI-спрайты, всегда лицом к камере) ----------------
export function label(text,{size=40,color='#123'}={}){
  const cv=document.createElement('canvas'); cv.width=512; cv.height=128;
  const x=cv.getContext('2d'); x.font=`bold ${size*1.7}px system-ui,sans-serif`;
  x.fillStyle=color; x.textAlign='center'; x.textBaseline='middle'; x.fillText(text,256,64);
  const t=new THREE.CanvasTexture(cv); t.anisotropy=4;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,depthTest:false}));
  sp.scale.set(7,1.75,1); return sp;
}
