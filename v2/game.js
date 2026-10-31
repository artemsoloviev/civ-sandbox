// game.js — ИГРОВОЙ СЛОЙ big.html (14.10, этап Б): перенос интерфейса и правил старого движка (site/index.html).
// Команда Артёма 14.10: «переноси весь интерфейс и ходы и всё из п1» + «выбрать из 2-3 рядом стоящих поселений,
// а ИИ поселится равноудалённо от игрока с учётом скролла по горизонтали». Тексты и стили — дословно из старого;
// отличия от старого помечены «НОВОЕ» с причиной. Карта, тропы, деревни — в big.html; сюда приходят через ctx.
import { mountHUD, epochOf, yearOf, yearsPerTurn, fmtYear } from '../lib/ui.js?v=9';
import { portrait, setMood } from '../lib/faces.js?v=2';

const BUILD='сборка 18.10 (3) (юниты шаг 3: дружина у стен, частокол за 40 древесины, карательный поход, отдых в карточке)';

// ===== наши контурные значки (index.html 3013–3048) — вместо эмодзи =====
const GICONS={
  temple:'<path d="M3 9 12 4l9 5Z"/><path d="M4 9h16"/><path d="M6.5 10v8M10 10v8M14 10v8M17.5 10v8"/><path d="M3.5 20h17"/>',
  people:'<circle cx="8" cy="8" r="3"/><path d="M2.5 20c0-4 2.5-6 5.5-6s5.5 2 5.5 6"/><circle cx="16.6" cy="9" r="2.3"/><path d="M15 15c3 .2 5.5 2 5.5 5.5"/>',
  coins:'<ellipse cx="9" cy="7" rx="6" ry="2.6"/><path d="M3 7v3.6c0 1.4 2.7 2.6 6 2.6"/><ellipse cx="15" cy="14" rx="6" ry="2.6"/><path d="M9 14v3.4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V14"/>',
  flask:'<path d="M9 3h6M10 3v6l-4.6 8.4c-.6 1.1.2 2.6 1.5 2.6h10.2c1.3 0 2.1-1.5 1.5-2.6L14 9V3"/><path d="M7.4 14.5h9.2"/>',
  trend:'<path d="M3 18l6-6 4 4 8-8"/><path d="M16 8h5v5"/>',
  crown:'<path d="M4 19 5.5 9l4.5 5L12 6l2 8 4.5-5L20 19Z"/><path d="M4 19h16"/>',
  fort:'<path d="M4 21V9H6V11H8V9H10V11H12V9H14V11H16V9H18V21Z"/><path d="M9 21v-6h4v6"/>',
  shield:'<path d="M12 3l7 2.6v5.2c0 4.8-3.2 8.3-7 10.2-3.8-1.9-7-5.4-7-10.2V5.6Z"/><path d="M12 6.5v11"/>',
  flag:'<path d="M6 21V4"/><path d="M6 5.2c4-2 8 2 12 0v8c-4 2-8-2-12 0"/>',
  boot:'<path d="M8.6 3v9.2c3.2.3 5.7 2 6.8 4.9l.8 2.4H5.8V3Z"/><path d="M8.6 8.6h4.2"/>',
  calendar:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  // 15.10: значки промыслов, склада и жителей (index.html 3013–3048)
  bow:'<path d="M8 4a9 9 0 0 0 0 16"/><path d="M8 4v16"/><path d="M6 12h12"/><path d="M15 9l3 3-3 3"/>',
  fish:'<path d="M3 12c3-4 9-4 13 0-4 4-10 4-13 0Z"/><path d="M16 12l4-3v6z"/><circle cx="7" cy="11" r=".9"/>',
  pick:'<path d="M12 21V9"/><path d="M4 9q8-5 16 0"/>',
  wheat:'<path d="M12 21V8"/><path d="M12 8 9.5 5.5M12 8l2.5-2.5M12 12 9 9.5M12 12l3-2.5M12 16 9 13.5M12 16l3-2.5"/>',
  cow:'<path d="M3.2 11.2c-.5-.3-.4-1.2.3-1.2.1-1 1.3-1.1 1.7-.2l.3.9h8.4c1.4 0 2.7.8 3.3 2.1l1.3 2.9"/><path d="M4.9 10.7 4.3 9M6.4 10.4 6 8.7"/><path d="M5.5 11.6V16h11.6"/><path d="M7 16v2.2M10 16v2.2M14 16v2.2M17 16.1v2.1"/><path d="M18.5 15.7l1.6-.7"/><circle cx="5.6" cy="12.2" r=".5"/>',
  box:'<path d="M12 3 3 7.5 12 12l9-4.5Z"/><path d="M3 7.5V16l9 4.5V12"/><path d="M21 7.5V16l-9 4.5"/>',
  eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  sprout:'<path d="M12 21V10"/><path d="M12 12.5C12 8.6 9.1 6 4.6 6c0 3.9 2.9 6.5 7.4 6.5Z"/><path d="M12 14.5c0-3.3 2.6-5.6 6.6-5.6 0 3.3-2.6 5.6-6.6 5.6Z"/>',
  urn:'<path d="M6.5 21h11"/><path d="M8.4 21c-1.1-4.2-1-8.3.6-11h6c1.6 2.7 1.7 6.8.6 11"/><path d="M7 10h10"/><path d="M9.4 10c0-2.2 1.1-3.8 2.6-3.8S14.6 7.8 14.6 10"/>',
  wool:'<circle cx="12" cy="12" r="8.5"/><path d="M5.5 8.2c4.4.7 8.2 3.9 9.6 8.6M8.2 4.5c3.4 2 6 5.6 6.9 10M14.6 4.2c1.4 2.4 2.8 4.9 3.3 7.6"/>',
  hide:'<path d="M7.4 3.4 5.2 6.1l2.4 2.2C6 10.3 6 13.9 7.4 16L5.6 19.4l3.2-1.1c2 1.6 4.4 1.6 6.4 0l3.2 1.1L16.6 16c1.4-2.1 1.4-5.7-.2-7.7l2.4-2.2-2.2-2.7-2.9 1.3a6.5 6.5 0 0 0-3.4 0Z"/>',
  timber:'<circle cx="7.5" cy="15.5" r="4"/><circle cx="16.5" cy="15.5" r="4"/><circle cx="12" cy="8.2" r="4"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/><circle cx="12" cy="8.2" r="1"/>',
  rock:'<path d="M4 14.5 8.2 5h7.6L20 14.5 15.5 20h-7Z"/><path d="M8.2 5l2 6.2 5.6-6.2M10.2 11.2 4 14.5M10.2 11.2 12.6 20"/>',
  owl:'<circle cx="12" cy="13.2" r="7.3"/><circle cx="9.4" cy="11.4" r="1.5"/><circle cx="14.6" cy="11.4" r="1.5"/><path d="M10.8 15.8 12 14.5l1.2 1.3"/><path d="M6.4 7.6 5 4.6 8.4 6M17.6 7.6 19 4.6 15.6 6"/>',
  // 16.10: экономика шаг 2 (index.html 3010–3075) — дар, караван, события
  swords:'<path d="M5 4l11.5 11.5M19 4 7.5 15.5"/><path d="M14.6 17.6l2-2M9.4 17.6l-2-2"/><path d="M4.5 20.5l3.4-3.4M19.5 20.5l-3.4-3.4"/>',
  fire:'<path d="M12 21c-3.4 0-5.7-2.3-5.7-5.5 0-2.4 1.5-4.2 2.9-5.8 1.3-1.5 2-3.1 1.7-5.2 3 1.6 4 3.7 3.8 5.7 1-.4 1.7-1.2 1.9-2.3 1 1.4 1.6 3 1.6 4.8 0 5-2.8 8.3-6.2 8.3Z"/>',
  gift:'<rect x="4" y="9.5" width="16" height="10.5" rx="1.5"/><path d="M12 9.5V20M4 13.5h16"/><path d="M12 9.5C8.4 9.5 7.2 7.7 8 6c1.5-1 4 .7 4 3.5Zm0 0c3.6 0 4.8-1.8 4-3.5-1.5-1-4 .7-4 3.5Z"/>',
  scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7"/><path d="M7 4a2.5 2.5 0 0 0 0 5V4Zm0 16a2.5 2.5 0 0 1 0-5v5Z"/><path d="M10 9h6M10 12.5h6M10 16h4"/>',
  caravan:'<path d="M4 18l1-4.6c.4-1.9 1.8-3.2 3.5-3.2.9 0 1.5.4 2.6.4 1.2 0 1.7-1 3.1-1 1.9 0 3.4 1.5 3.7 3.6L19 18"/><path d="M6.2 18v3M16.8 18v3M10 18v3M13.4 18v3"/><path d="M18.4 11.8c1.2-.6 1.9-1.8 2-3.6"/>',
  hands:'<path d="M11 20c-2.4-1.8-3.9-4-4.4-6.6L5.8 9c-.3-1.4 1.5-2 2.1-.8L9.5 12"/><path d="M13 20c2.4-1.8 3.9-4 4.4-6.6L18.2 9c.3-1.4-1.5-2-2.1-.8L14.5 12"/><path d="M12 4v9.5"/>',
  spark:'<path d="M12 3.2v3.6M12 17.2v3.6M3.2 12h3.6M17.2 12h3.6M5.9 5.9l2.5 2.5M15.6 15.6l2.5 2.5M18.1 5.9l-2.5 2.5M8.4 15.6l-2.5 2.5"/>',
  bell:'<path d="M12 3.6c3.2 0 5.4 2.3 5.4 5.8v3.5l1.8 3.3H4.8l1.8-3.3V9.4c0-3.5 2.2-5.8 5.4-5.8Z"/><path d="M10.1 19.4c.3 1.1 1 1.7 1.9 1.7s1.6-.6 1.9-1.7"/>',
  hunger:'<path d="M5 11h14"/><path d="M6.2 11a5.8 5.8 0 0 0 11.6 0"/><path d="M9 21h6M12 17.8V21"/><path d="M8.5 4.5 10 7M15.5 4.5 14 7"/>' };   // пустая миска — голод
function plural(n, one, few, many){ const a=Math.abs(n)%100, b=a%10; if(a>10&&a<20) return many; if(b>1&&b<5) return few; if(b===1) return one; return many; }
const GI=(id,size,color)=>{ const s=size||18; return '<svg class="gi" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="'+(color||'currentColor')+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(GICONS[id]||'')+'</svg>'; };

// ===== демография (index.html 2981–3004, полные таблицы — DEMOGRAPHY.md) =====
const popOf=size=>Math.round(30*Math.pow(size,1.6));
const sizeOfPop=p=>Math.pow(Math.max(1,p)/30,1/1.6);
const fmtPop=p=>p<1000?`${p} чел.`:p<1e6?`${(p/1000).toFixed(1)} тыс.`:`${(p/1e6).toFixed(2)} млн`;
const fmtPlq=p=>p<1000?`${p}`:fmtPop(p);                              // 21.10 Артём: на плашках карты слово «чел.» не писать
const BIRTH_RATE=[4.0,4.0,4.0,3.9,3.8,2.0,1.0];
const DEATH_BASE=[3.96,3.93,3.90,3.60,2.0,1.1,1.0];
const VILLAGE_BIRTH_ADD=0.03, VILLAGE_FLOOR=0.35, CITY_PULL=0.20, MIG_BASE=32;
const CAP_VILLAGE_NEAR=2.8, CAP_VILLAGE_FAR=4.5, CAP_VILLAGE_DIST=25;
const STAGES=['стоянка','деревушка','деревня','город'];
function stageIdxH(lm){ const s=lm.size, up=[1.3,2.75,4.6], dn=[1.1,2.45,4.2]; let si=lm._si;
  if(si<0) si=s<1.2?0:s<2.6?1:s<4.4?2:3;
  else { if(si<3&&s>up[si]) si++; else if(si>0&&s<dn[si-1]) si--; }
  lm._si=si; return si; }

// ===== имена, страны, цвета, правители (index.html 2816–2866, 5843–5892) =====
const CITY_NAMES={
  ru:['Ладога','Новгород','Псков','Изборск','Владимир','Суздаль','Тверь','Москва','Смоленск','Ярославль','Казань','Санкт-Петербург','Екатеринбург','Севастополь'],
  fr:['Лютеция','Массалия','Немаусус','Лугдунум','Реймс','Париж','Орлеан','Руан','Тур','Бордо','Лион','Марсель','Версаль','Гавр'] };
const VILLAGE_NAMES={
  ru:{ root:['Бор','Дубр','Липо','Ель','Клён','Реч','Озёр','Камен','Гор','Луго','Ясен','Сосн','Верб','Ольх','Берёз','Медвеж','Волч','Сокол','Журавл','Тихо','Свет','Красно','Черно',
             'Бело','Ново','Стар','Высо','Крут','Мельн','Рыбач','Солнеч','Мороз','Заречь','Подгор'],
       tail:['ово','ино','овка','поль','ск','град','ье','иха','ынь','цы','аны'] },
  fr:{ root:['Бель','Мон','Сен','Валь','Шам','Рош','Бо','Фон','Буа','Пре','Шат','Виль','Кур','Гран','Об','Клер','Со','Марс','Корб','Тьер','Люз','Нев','Бри','Флёр'],
       tail:['виль','бон','фор','ньи','ак','ан','мон','сак','ель','уа','ер','анж'] } };
const PALETTE=[
  {id:'crimson',name:'Багряный',hex:0xc0392b},{id:'scarlet',name:'Алый',hex:0xe74c3c},
  {id:'orange',name:'Оранжевый',hex:0xe67e22},{id:'amber',name:'Янтарный',hex:0xf0a30a},
  {id:'gold',name:'Золотой',hex:0xf1c40f},{id:'olive',name:'Оливковый',hex:0x7f8c3a},
  {id:'green',name:'Зелёный',hex:0x27ae60},{id:'emerald',name:'Изумруд',hex:0x16a085},
  {id:'turq',name:'Бирюза',hex:0x1abc9c},{id:'cyan',name:'Циан',hex:0x00b0c8},
  {id:'sky',name:'Небесный',hex:0x3498db},{id:'blue',name:'Синий',hex:0x2456a8},
  {id:'indigo',name:'Индиго',hex:0x3f3d9c},{id:'violet',name:'Фиолет',hex:0x8e44ad},
  {id:'purple',name:'Пурпур',hex:0xb13a86},{id:'pink',name:'Розовый',hex:0xe0648c} ];
const COUNTRIES={
  ru:{name:'Россия',gen:'России',flag:'🇷🇺',native:['blue','crimson','gold']},
  fr:{name:'Франция',gen:'Франции',flag:'🇫🇷',native:['sky','scarlet','indigo']} };
const colorById=id=>PALETTE.find(c=>c.id===id)||PALETTE[11];
const cssOf=id=>'#'+colorById(id).hex.toString(16).padStart(6,'0');
function paletteFor(countryId,taken=[]){ const nat=(COUNTRIES[countryId]||{}).native||[];
  const rest=PALETTE.filter(c=>!nat.includes(c.id));
  return [...nat.map(colorById),...rest].filter(c=>!taken.includes(c.id)); }
const LEADERS={
  ru:[{id:'peter1',name:'Пётр I',epi:'Великий',trait:'Флот и верфи',desc:'Дороги и пристани держит крепко: потери в пути −15%.'},
      {id:'catherine2',name:'Екатерина II',epi:'Великая',trait:'Просвещение',desc:'Академии и школы: +2 науки за ход.'}],
  fr:[{id:'napoleon',name:'Наполеон I',epi:'Бонапарт',trait:'Инженеры гвардии',desc:'Мостит дороги на 25% дешевле.'},
      {id:'louis14',name:'Людовик XIV',epi:'Король-Солнце',trait:'Двор и откупа',desc:'Казна прирастает: +2 монеты за ход.'}] };
const leaderById=id=>[].concat(LEADERS.ru,LEADERS.fr).find(l=>l.id===id)||LEADERS.ru[0];

// ===== СТАРТОВЫЕ ПЯТНА (перенос pickStarts, index.html 9575–9605) =====
// Пятно игрока — круг до второй ближайшей соседки, в идеале 3 деревни (минимум 2), не у полярного края; расстояния — через шов.
// НОВОЕ (Артём 14.10, «ИИ равноудалённо с учётом скролла»): пятно ИИ — ближайшее к точке РОВНО НАПРОТИВ по кольцу
// (полкольца по X: путь до него в обе стороны одинаков). В старом — случайная пара из 5 самых далёких.
export function pickStarts(VIL,h){
  const {wdx,WX,dxH,MINZ,MAXZ}=h, HSPF=dxH, RMAX=6*HSPF;   // 30.10 (Артём: «видимая часть в начале слишком большая»): пятно до 6 гексов (было 9)
  const wd=(a,b)=>Math.hypot(wdx(a.c.x,b.c.x),a.c.z-b.c.z);
  const cand=[];
  VIL.forEach((v,i)=>{ const ds=VIL.map((o,j)=>j===i?Infinity:wd(v,o)).sort((a,b)=>a-b);
    if(ds[0]>RMAX)return;
    const r=Math.min(RMAX,(ds[1]<=RMAX?ds[1]:ds[0])+1.0*HSPF);
    const n=1+ds.filter(d=>d<=r).length;
    const edgeOk=v.c.z-r>=MINZ+2*HSPF&&v.c.z+r<=MAXZ-2*HSPF;          // кольцо по X — края нет; полярный край по Z есть
    cand.push({i,x:v.c.x,z:v.c.z,r,n,edgeOk}); });
  let pool=cand.filter(c=>c.edgeOk); if(pool.length<2)pool=cand;
  const p3=pool.filter(c=>c.n>=3); const mePool=p3.length>=2?p3:pool;
  const me=mePool[(Math.random()*mePool.length)|0];
  const opp=me.x+WX/2;
  let ai=null,best=Infinity;
  for(const c of pool){ if(c.i===me.i||wd(VIL[c.i],VIL[me.i])<=me.r+c.r)continue;
    const s=Math.abs(wdx(c.x,opp))+0.25*Math.abs(c.z-me.z)-(c.n>=2?0:-HSPF*2);
    if(s<best){ best=s; ai=c; } }
  const inArea=(a)=>VIL.map((v,j)=>j).filter(j=>wd(VIL[j],VIL[a.i])<=a.r);
  return { me:{...me,area:inArea(me)}, ai:ai?{...ai,area:inArea(ai)}:null, кандидатов:cand.length };
}

export function initGame(ctx){
  const {THREE,scene,camera,controls,renderer,VIL,TRAILS,heightAt,normX,wdx,WX,HEXR,dxH,hexAt,groundHit,riverNear}=ctx;
  const K=HEXR/2.0;
  const wdist=(a,b)=>Math.hypot(wdx(a.x,b.x),a.z-b.z);
  const nearX=(x,ref)=>x+Math.round((ref-x)/WX)*WX;               // ближайший лист кольца
  const $=id=>document.getElementById(id);
  { const gs=document.createElement('style'); gs.textContent='.gi{display:inline-block;vertical-align:middle;flex:0 0 auto}'; document.head.appendChild(gs); }

  // ---------- состояние партии ----------
  const LM=VIL.map(v=>({c:v.c,x:normX(v.c.x),z:v.c.z,y:heightAt(v.c.x,v.c.z),size:sizeOfPop(v.c.pop),size0:sizeOfPop(v.c.pop),
    _si:-1,name:null,capital:false,aiCapital:false}));
  const byKey=new Map(LM.map((l,i)=>[l.c.col+','+l.c.row,i]));
  const setSize=(lm,s)=>{ lm.size=s; lm.c.pop=popOf(s); };          // c.pop читают тропы (поток) и всплывашка
  let PLAYER={name:'Правитель',countryId:'ru',colorId:'blue',leaderId:'peter1'};
  const AI={active:false,countryId:'fr',colorId:'scarlet',leaderId:'napoleon',capIdx:-1,taken:0,gold:80,rel:50,
    war:false,warT:null,peaceT:null,warLoss:0,peaceAskT:null};   // 26.10 ст.3: достаток и отношение 0–100; ст.4: война (warLoss — потерянные им владения за войну)
  let TAKEN_COLORS=[], usedNames=new Set(), usedCities={};
  let turn=0, money=100, sci=0, pickingCapital=false, inGame=false, START=ctx.START, busy=false, autoTurns=false;
  let _prevStatePop=null,_popDelta=0;
  const playerCss=()=>cssOf(PLAYER.colorId), aiCss=()=>cssOf(AI.colorId);
  const aiCap=()=>(AI.active&&LM[AI.capIdx])?LM[AI.capIdx]:null;
  const capOf=()=>LM.find(l=>l.capital);

  function takeCityName(countryId){ const list=CITY_NAMES[countryId]||CITY_NAMES.ru; let i=usedCities[countryId]||0;
    while(i<list.length&&usedNames.has(list[i]))i++; usedCities[countryId]=i+1;
    const n=i<list.length?list[i]:list[0]+'-'+(i-list.length+2); usedNames.add(n); return n; }
  function peekCityName(countryId){ const list=CITY_NAMES[countryId]||CITY_NAMES.ru; let i=usedCities[countryId]||0;   // 17.10: следующее имя — без расхода
    while(i<list.length&&usedNames.has(list[i]))i++; return i<list.length?list[i]:list[0]+'-'+(i-list.length+2); }
  function genName(countryId='ru'){ const V=VILLAGE_NAMES[countryId]||VILLAGE_NAMES.ru;
    for(let k=0;k<40;k++){ const n=V.root[(Math.random()*V.root.length)|0]+V.tail[(Math.random()*V.tail.length)|0];
      if(!usedNames.has(n)){ usedNames.add(n); return n; } }
    return V.root[(Math.random()*V.root.length)|0]+((Math.random()*90+10)|0); }
  function cultureAt(lm){ const cap=capOf(), ac=aiCap();                 // НОВОЕ: расстояние через шов (в старом — по плоскости)
    if(!ac)return PLAYER.countryId; if(!cap)return AI.countryId;
    return wdist(lm,cap)<=wdist(lm,ac)?PLAYER.countryId:AI.countryId; }
  function nameAllSettlements(){ LM.forEach(lm=>{ if(lm.name)return;
    if(lm.capital)lm.name=takeCityName(PLAYER.countryId); else if(lm.aiCapital)lm.name=takeCityName(AI.countryId);
    else lm.name=genName(cultureAt(lm)); }); }
  function capVillageOf(lm){ const cap=capOf(); if(!cap||lm.capital)return CAP_VILLAGE_FAR;
    return Math.min(CAP_VILLAGE_FAR,CAP_VILLAGE_NEAR+(wdist(lm,cap)/K)/CAP_VILLAGE_DIST); }   // расстояние — в единицах старого мира
  const playerPop=()=>{ const cap=capOf(); return cap?popOf(cap.size):0; };
  const statePop=()=>{ let p=playerPop(); LM.forEach(l=>{ if(l.rel==='ours'&&!l.capital)p+=popOf(l.size); }); return p; };   // жители всей державы (вошедшие деревни)

  // ================= ШАПКА, КНОПКА ХОДА (lib/ui.js — общий слой, дословно) =================
  const hud=mountHUD({onEndTurn:()=>endTurn(),onScience:()=>openTree()});
  { const st=document.createElement('style'); st.textContent=`
    #g-toprow{position:fixed;left:12px;right:12px;top:12px;z-index:8;display:flex;align-items:flex-start;gap:12px;pointer-events:none}
    #g-toprow .lft,#g-toprow .rgt{flex:1 1 0;min-width:0}
    #g-toprow .lft{display:flex}
    #g-toprow .g-top{position:static;transform:none;flex:0 0 auto;pointer-events:auto;max-width:46vw}
    #stats{display:flex;gap:9px;align-items:center;flex-wrap:wrap;pointer-events:auto;font-family:system-ui,sans-serif;font-size:13.5px;font-weight:700}
    #stats .s{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:11px;box-shadow:0 2px 10px #0004;color:#fff}
    #stats .s .ic{font-size:15px}
    #stats .sci{background:linear-gradient(#2f7fd0,#1b569e)}
    #stats .money{background:linear-gradient(#e0a92f,#a9781b)}
    #stats .pop{background:linear-gradient(#3f9e52,#256b34)}
    #g-score{position:fixed;left:12px;top:56px;z-index:8;background:linear-gradient(#3b4560ee,#252e46ee);color:#fff;font:700 12.5px system-ui;padding:6px 10px;border-radius:10px;box-shadow:0 2px 10px #0005;cursor:pointer;display:none}
    #g-score .r{display:flex;align-items:center;gap:7px;white-space:nowrap}
    #g-score .r+.r{margin-top:3px}
    #g-score .nm{font-weight:600;opacity:.85;max-width:150px;overflow:hidden;text-overflow:ellipsis}
    #g-score .v{margin-left:auto;padding-left:10px;text-shadow:0 1px 2px #000c}
    #stats .d{opacity:.8;font-weight:500;font-size:11px}
    #hud{position:fixed;right:12px;top:56px;width:236px;max-height:42vh;overflow-y:auto;color:#122;z-index:8;
      background:#ffffffdd;padding:8px 10px;border-radius:11px;font-size:11px;line-height:1.4;box-shadow:0 2px 12px #0004;font-family:system-ui,sans-serif}
    #hud b{font-size:12px;letter-spacing:.2px}
    #hud .lg div{padding:3px 0;border-top:1px solid #0000000f;color:#243}
    #hud .lg div:first-child{color:#111;font-weight:600}
    #hud .lg div.warn{color:#a31f10;font-weight:700}
    #hud .lg div.loc{cursor:pointer} #hud .lg div.loc:hover{text-decoration:underline}
    #hud .lg .gi{margin-right:3px;vertical-align:-2.5px}
    #hud::-webkit-scrollbar{width:7px} #hud::-webkit-scrollbar-thumb{background:#0002;border-radius:4px}
    #panel{position:fixed;left:12px;top:50%;transform:translateY(-50%);background:#ffffffd8;padding:10px 14px;border-radius:11px;z-index:9;
      box-shadow:0 2px 12px #0004;font-size:13px;color:#122;display:none;flex-direction:column;gap:8px;min-width:220px;font-family:system-ui,sans-serif}
    #panel.on{display:flex;left:58px}
    #panel-tg{position:fixed;left:12px;top:50%;transform:translateY(-50%);z-index:14;width:38px;height:38px;line-height:38px;text-align:center;
      font-size:21px;background:#ffffffd8;border-radius:11px;box-shadow:0 2px 12px #0004;cursor:pointer;user-select:none}
    #panel-tg:hover{background:#fff}
    #panel .row{display:flex;align-items:center;gap:8px;justify-content:space-between}
    #g-fps{position:fixed;left:12px;top:126px;z-index:8;background:#0e1520cc;color:#cfe0ec;font:600 11.5px system-ui;padding:3px 8px;border-radius:7px;display:none}`;
    document.head.appendChild(st); }
  const top=document.querySelector('.g-top');
  { const row=document.createElement('div'); row.id='g-toprow';
    row.innerHTML=`<div class="lft"><div id="stats">
      <div class="s sci"><span class="ic">${GI('flask',16,'#fff')}</span><span id="st-sci">0</span><span class="d">+1/ход</span></div>
      <div class="s money"><span class="ic">${GI('coins',16,'#fff')}</span><span id="st-money">100</span><span id="st-money-d" style="font-size:11px;margin-left:5px;opacity:.95"></span></div>
      <div class="s pop"><span class="ic">${GI('people',16,'#fff')}</span><span id="st-pop">—</span><span id="st-pop-d" style="font-size:11px;margin-left:5px;opacity:.95"></span></div>
    </div></div>`;
    document.body.appendChild(row); row.appendChild(top);
    const rg=document.createElement('div'); rg.className='rgt'; row.appendChild(rg); }
  const hudEl=document.createElement('div'); hudEl.id='hud'; hudEl.innerHTML='<b>Журнал</b><div class="lg" id="g-log"></div>'; document.body.appendChild(hudEl);
  const fpsEl=document.createElement('div'); fpsEl.id='g-fps'; document.body.appendChild(fpsEl);
  // 30.10 (Артём): счёт — отдельной плашкой, по строке на державу с подписью; имя соперника — после разведки его столицы
  const scoreEl=document.createElement('div'); scoreEl.id='g-score';
  scoreEl.title='очки мощи держав: жители/10 + 20 за каждое поселение + достаток/10 (клик — карточка соперника)';
  scoreEl.innerHTML='<div class="r"><span class="nm" id="st-sc-wn">наша держава</span><span class="v" id="st-sc-we">0</span></div>'+
    '<div class="r"><span class="nm" id="st-sc-an">неизвестная держава</span><span class="v" id="st-sc-ai">—</span></div>';
  document.body.appendChild(scoreEl);
  function updateStats(){
    $('st-sci').textContent=sci; $('st-money').textContent=money;
    const cap=capOf();
    $('st-pop').textContent=cap?fmtPop(statePop()):'—';               // НОВОЕ: до столицы «—» (в старом до столицы хода не было вовсе)
    $('st-pop').title='жители державы: столица + вошедшие деревни';
    const d=(PLAYER.leaderId==='louis14'?2:0)-1, md=$('st-money-d');
    if(cap){ md.textContent=(d>=0?'+':'')+d+'/ход'; md.style.color=d>=0?'#9fe0a8':'#f2a1a1'; md.title='казна за ход: −1 двор'; } else md.textContent='';
    const pd=$('st-pop-d');
    if(_prevStatePop==null) pd.textContent='';
    else { pd.textContent=(_popDelta>=0?'+':'−')+Math.abs(_popDelta)+'/ход'; pd.style.color=_popDelta>=0?'#9fe0a8':'#f2a1a1';
      pd.title='жители державы за прошлый ход: родилось − умерло + пришло'; }
    document.querySelector('#stats .sci .d').textContent='+'+(1+(PLAYER.leaderId==='catherine2'?2:0))+'/ход';
    // 28.10 СЧЁТ (формула 3 «очки мощи»); 30.10 (Артём): две строки с подписями, виден с начала партии,
    // имя соперника открывается после разведки его столицы, счёт-цифра видна и до знакомства
    { const sc=document.getElementById('g-score'), ac=LM.find(l=>l.aiCapital);
      if(sc){ if(!cap) sc.style.display='none';
        else { sc.style.display='block';
          const ourN=1+LM.reduce((s,l)=>s+(l.rel==='ours'&&!l.capital?1:0),0),
                we=Math.round(statePop()/10+20*ourN+money/10);
          $('st-sc-we').textContent=we; $('st-sc-we').style.color=playerCss();
          $('st-sc-wn').textContent=(COUNTRIES[PLAYER.countryId]||{}).name||'наша держава';
          if(ac){ const aiPop=popOf(ac.size)+LM.reduce((s,l)=>s+(l.aiOwned?popOf(l.size):0),0),
                  ai=Math.round(aiPop/10+20*(1+(AI.taken||0))+(AI.gold||0)/10),
                  met=!window.__fog||!window.__fog.enabled()||window.__fog.at(ac.x,ac.z)>0;
            $('st-sc-ai').textContent=ai; $('st-sc-ai').style.color=aiCss();
            $('st-sc-an').textContent=met?((COUNTRIES[AI.countryId]||{}).name||'соперник'):'неизвестная держава';
            sc.onclick=met?()=>openForeign(LM.indexOf(ac)):null; }
          else { $('st-sc-ai').textContent='—'; $('st-sc-an').textContent='неизвестная держава'; sc.onclick=null; } } } } }

  // ---------- журнал (index.html 9991–10011) ----------
  const glog=window.__glog=(msg,opt)=>{ const l=$('g-log'); if(!l)return;
    const d=document.createElement('div'); let ic='';
    for(const [e,id] of [['🚶','boot'],['⚑','flag'],['🛡','shield'],['⚔','swords'],['🥾','boot'],['🔥','fire'],['👁','eye']]){ if(msg.startsWith(e)){ ic=GI(id,13); msg=msg.slice(e.length).trim(); break; } }
    const safe=msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&lt;(\/?b)&gt;/g,'<$1>');
    d.innerHTML=ic+safe;
    if(opt&&opt.warn)d.classList.add('warn');
    if(opt&&opt.at){ d.classList.add('loc'); d.title='Показать на карте'; const ax=opt.at[0],az=opt.at[1]; d.onclick=()=>flyNear(ax,az); }
    l.insertBefore(d,l.firstChild);
    while(l.childElementCount>80)l.removeChild(l.lastChild); };

  // ---------- панель ⚙ слева (index.html 102–112, 6127–6141) ----------
  // НОВОЕ: «показывать движение», «насыщенность хода», «сколько/показывать людей» не перенесены — человечков нет;
  // «зерно/сброс» — карта одна (кнопка «Выйти в главное меню» начинает партию заново)
  const ptg=document.createElement('div'); ptg.id='panel-tg'; ptg.title='авто-ходы и настройки'; ptg.textContent='⚙'; document.body.appendChild(ptg);
  const panel=document.createElement('div'); panel.id='panel';
  panel.innerHTML=`<div class="row"><label><input id="auto" type="checkbox"> авто-ходы подряд</label></div>
    <div class="row"><label><input id="grid" type="checkbox" checked> сетка гексов</label></div>
    <div class="row"><label><input id="fogtg" type="checkbox"> туман войны</label></div>`;
  document.body.appendChild(panel);
  ptg.onclick=()=>panel.classList.toggle('on');
  $('auto').onchange=e=>{ autoTurns=e.target.checked; if(autoTurns&&!busy)setTimeout(autoNext,300); };
  $('grid').onchange=e=>ctx.setGrid(e.target.checked);
  // 28.10 (Артём): галка показа/скрытия тумана — для удобства тестирования; состояние разведки живёт, гаснет только картинка
  setTimeout(()=>{ const f=$('fogtg'); if(f&&window.__fog){ f.checked=window.__fog.enabled();
    f.onchange=e=>{ window.__fog.setOn(e.target.checked); for(const r of recs)r.sig=null; }; } },0);

  // ================= ПЛАШКИ ПОСЕЛЕНИЙ (updateLabels, index.html 4900–4984) =================
  { const st=document.createElement('style'); st.textContent=`
    #g-labels{position:fixed;inset:0;z-index:7;pointer-events:none;overflow:hidden}
    .g-lab{position:absolute;left:0;top:0;transform:translate(-50%,-100%);white-space:nowrap;display:none;
      background:#12233ae6;color:#ffe9c2;padding:3px 10px;border-radius:10px;
      font:600 12.5px system-ui,sans-serif;box-shadow:0 3px 11px #0006;border:1px solid #ffd98a44;pointer-events:auto;cursor:pointer}
    .g-lab .cr{color:#ffd066;margin-right:4px}
    .g-lab .pop{opacity:.72;font-weight:500;font-size:11px;margin-left:6px}
    .g-lab.cap{padding:6px 14px;font-size:16px;font-weight:700;letter-spacing:.3px;background:#0e1b2ee8}
    .g-lab.cap .cr{font-size:18px}
    .g-lab.cap .pop{font-size:12.5px;opacity:.8;color:#e8eef7}
    .g-lab.sm{padding:2px 8px;font-size:11px;background:#1b202ac2;color:#aab3c0;border-color:#ffffff26}
    .g-lab.sm:hover{background:#232936e0;border-color:#ffffff3d}
    .g-lab.sm b{color:#ccd3dc;font-weight:600}
    .g-lab.sm .vn{color:#9aa3b0;margin-right:6px;font-weight:600}
    /* НОВОЕ (вместо тумана, пока он не перенесён): деревни открытого пятна — золотая рамка, прочие приглушены */
    .g-lab.sm.cand{background:#16243af0;color:#ffe9c2;border-color:#f4cd7e;box-shadow:0 0 0 2px #f4cd7e55,0 3px 11px #0006}
    .g-lab.sm.cand b{color:#ffe9c2}
    .g-lab.sm.dimd{opacity:.45}`;
    document.head.appendChild(st); }
  const labWrap=document.createElement('div'); labWrap.id='g-labels'; document.body.appendChild(labWrap);
  const D0=90*K, D1=125*K, _lp=new THREE.Vector3();
  const recs=LM.map((lm,i)=>{ const el=document.createElement('div'); el.className='g-lab sm'; labWrap.appendChild(el);
    el.onclick=ev=>{ ev.stopPropagation(); const cur=LM[i];
      if(pickingCapital&&!cur.aiCapital){ propose(cur); return; }
      if(!inGame)return;
      if(cur.aiCapital)openForeign(i); else if(cur.capital)openCity(); else openVillage(i); };
    return {el,sig:null,on:false}; });
  const candSet=new Set();
  // 17.10 плашки C: у столицы — кружок свободных рук и рамка цветом еды (зелёная — излишек, красная — нехватка, серая — ровно; голод мигает);
  // у наших деревень — рамка цветом роста; у готовой войти в державу — мигающий флажок
  { const st=document.createElement('style'); st.textContent=`
    .g-lab .fh{display:inline-block;min-width:17px;height:17px;line-height:17px;border-radius:9px;background:#e9dcb8;color:#1d2433;font:800 11px system-ui;text-align:center;margin-left:6px;padding:0 3px;vertical-align:1px}
    .g-lab.hungry{animation:g-hng 1.1s ease-in-out infinite} @keyframes g-hng{50%{box-shadow:0 0 0 3px #e0574ecc,0 3px 14px #0006}}
    .g-lab .rdy{display:inline-block;animation:g-rdy 1.2s ease-in-out infinite} @keyframes g-rdy{50%{transform:scale(1.35);filter:drop-shadow(0 0 4px #ffd98a)}}`;
    document.head.appendChild(st); }
  const FOODC={up:'#7fd18a',dn:'#e0574e',eq:'#9aa4b2'};
  function foodState(c){ if(!c||c._food==null||!c._need)return 'eq'; const d=c._food-c._need; return d>Math.max(1,c._need*0.03)?'up':d< -Math.max(1,c._need*0.03)?'dn':'eq'; }
  function updateLabels(){
    const cp=camera.position;
    for(let i=0;i<LM.length;i++){ const lm=LM[i], rec=recs[i], el=rec.el;
      if(window.__fog&&window.__fog.enabled()&&window.__fog.at(lm.x,lm.z)===0){   // 28.10: в чёрном тумане поселения нет и на плашках (old.html 4936)
        if(rec.on){ el.style.display='none'; rec.on=false; } continue; }
      const isCap=lm.capital||lm.aiCapital;
      { const si=stageIdxH(lm), vk=si+(lm.capital?'m':lm.aiCapital?'a':'');      // 15.10: вид поселения по ступени (big.html mkSettle)
        if(lm.c.vk!==vk){ lm.c.vk=vk; lm.c.stg=si; lm.c.cap=lm.capital?'me':lm.aiCapital?'ai':null; lm.c.capCol=lm.capital?playerCss():lm.aiCapital?aiCss():null;
          if(window.__vilRedraw)window.__vilRedraw(lm.c); } }
      const cand=pickingCapital?(candSet.has(i)?1:2):0;
      const isCourt=lm.capital||(lm.rel==='ours'&&!lm.aiCapital);       // 24.10 «дворы»: руки/еда и у наших деревень
      const cli=isCourt?LM.indexOf(lm):-1;
      const fh=isCourt&&INDUSTRIES?Math.max(0,Math.round(courtPool(lm)-INDUSTRIES.reduce((a,r)=>a+(r.homeLi===cli?r.workers:0),0))):0,
        fs=isCourt?foodState(lm):'', rj=!isCap&&!lm.aiOwned&&lm.rel!=='ours'&&lm.scouted&&lm.will!=null&&readyJoin(lm);
      const gr=lm.rel==='ours'?Math.sign(lm._growLast||0):0;
      const sig=(isCap?'C':'v')+'|'+(lm.name||'')+'|'+popOf(lm.size)+'|'+(lm.aiCapital?1:0)+(lm.capital?1:0)+'|'+cand+'|'+(lm.rel||'')+'|'+fh+fs+(lm._hunger>0?'h':'')+'|'+(rj?1:0)+gr+(lm.scouted?1:0)+'|'+(lm.free?'F'+Math.round(lm._inf||0):'')+(lm.aiOwned?'A':'');
      if(sig!==rec.sig){ rec.sig=sig;
        el.className=isCap?'g-lab cap':('g-lab sm'+(cand===1?' cand':cand===2?' dimd':''));
        if(isCap){ const c=lm.aiCapital?aiCss():playerCss();
          const bc=lm.capital?FOODC[fs]:c;                           // рамка столицы — цвет еды
          el.style.borderColor=bc+'cc'; el.style.boxShadow='0 3px 14px #0006, inset 0 0 0 1px '+bc+'66'; if(lm.capital)el.style.borderWidth='2px';
          el.classList.toggle('hungry',!!(lm.capital&&lm._hunger>0));
          el.title=lm.capital?`свободных рук: ${fh} · еда: ${fs==='up'?'излишек':fs==='dn'?'нехватка':'ровно'}${lm._hunger>0?' · ГОЛОД':''}`:'';
          el.innerHTML=`<span class="cr" style="color:${c}">♔</span><span class="nm" style="color:${c}">${lm.name||''}</span>${lm.capital&&lm._hunger>0?`<span title="ГОЛОД" style="vertical-align:-2px">${GI('hunger',13,'#e0574e')}</span> `:''}<span class="pop">${fmtPlq(popOf(lm.size))}</span>${lm.capital?`<span class="fh" title="свободные руки">${fh}</span>`:''}`;
        } else if(!lm.scouted&&!lm.rel){                                 // 23.10 (Артём): неразведанная — без имени и числа жителей
          el.style.borderColor=''; el.style.boxShadow='';
          el.innerHTML=`<span class="vn" style="opacity:.55">деревня</span><span style="opacity:.45">${GI('eye',11)}</span>`;
        } else { const c=lm.free?'#c9a2ff':(lm.rel==='ours'?playerCss():lm.aiOwned?aiCss():null);   // наша земля — цвет державы; вольный град — лиловый; земля соперника — его цвет; защита/дань/держава — щит/монеты/флажок
          el.style.borderColor=lm.rel==='ours'?(lm._hunger>0?FOODC.dn:gr?(gr>0?FOODC.up:FOODC.dn):c+'99')+'cc':c?c+'99':''; el.style.boxShadow='';   // наш двор: рамка — голод/рост
          el.classList.toggle('hungry',!!(lm.rel==='ours'&&lm._hunger>0));
          el.title=lm.rel==='ours'?`свободных рук: ${fh} · еда: ${fs==='up'?'излишек':fs==='dn'?'нехватка':'ровно'}${lm._hunger>0?' · ГОЛОД':''}`:'';
          const vn=lm.name?`<span class="vn"${c?` style="color:${c}"`:''}>${lm.name}</span>`:'';
          const mark=(lm.free?`<span title="вольный град (${FREE_PROF[lm.free].nm}) · влияние ${Math.round(lm._inf||0)}">${GI(FREE_PROF[lm.free].ic,12,'#c9a2ff')}</span> `:'')+(rj?`<span class="rdy" title="готова войти в державу">${GI('flag',12,'#ffd98a')}</span> `:'')+(lm.rel==='prot'?GI('shield',12,'#9cc4ff')+' ':lm.rel==='trib'?GI('coins',12,'#ffd98a')+' ':lm.rel==='ours'?GI('flag',12,playerCss())+' ':'');
          el.innerHTML=`${mark}${vn}${lm.rel==='ours'&&lm._hunger>0?`<span title="ГОЛОД" style="vertical-align:-2px">${GI('hunger',12,'#e0574e')}</span> `:''}${GI('people',11)} <b>${fmtPlq(popOf(lm.size))}</b>${lm.rel==='ours'?`<span class="fh" title="свободные руки">${fh}</span>`:''}`; } }
      const x=nearX(lm.x,cp.x);
      const d=Math.hypot(cp.x-x,cp.y-lm.y,cp.z-lm.z);
      if(!isCap&&!(cand===1)){ if(d>D1){ if(rec.on){ el.style.display='none'; rec.on=false; } continue; }
        el.style.opacity=d>D0?((1-(d-D0)/(D1-D0))*(cand===2?0.45:1)).toFixed(2):''; }
      else el.style.opacity='';
      _lp.set(x,lm.y+(isCap?2.6:1.9)*K,lm.z).project(camera);
      if(_lp.z>1||Math.abs(_lp.x)>1.15||Math.abs(_lp.y)>1.15){ if(rec.on){ el.style.display='none'; rec.on=false; } continue; }
      if(!rec.on){ el.style.display='block'; rec.on=true; }
      el.style.transform='translate('+((_lp.x*0.5+0.5)*innerWidth).toFixed(1)+'px,'+((-_lp.y*0.5+0.5)*innerHeight).toFixed(1)+'px) translate(-50%,-100%)'; } }
  window.__vilList=()=>LM.map(l=>[l.c.col,l.c.row,popOf(l.size),l.name]);
  window.__vlab=()=>({всего:LM.length,видно:recs.filter(r=>r.on).length,
    px:recs.map((r,i)=>[i,r]).filter(q=>q[1].on).map(([i,r])=>{ const b=r.el.getBoundingClientRect(); return [i,Math.round(b.left+b.width/2),Math.round(b.bottom),r.el.className]; })});

  // всплывашка клетки (initHover в big.html) спрашивает о поселении здесь
  window.__vilTip=c=>{ const i=byKey.get(c.col+','+c.row); if(i===undefined)return null; const lm=LM[i], stage=STAGES[stageIdxH(lm)];
    if(window.__fog&&window.__fog.enabled()&&window.__fog.at(lm.x,lm.z)===0)return null;   // 28.10: в чёрном тумане поселения нет и во всплывашке
    if(!lm.capital&&!lm.aiCapital&&!lm.scouted&&!lm.rel)return {ttl:'Неизвестная деревня',sub:'нужна разведка',rows:[],loc:true};   // 23.10: без имени и жителей
    return {ttl:lm.name||stage,sub:stage+(lm.capital?' · столица':''),rows:[['Население',fmtPop(popOf(lm.size))]],loc:true}; };
  // точки миникарты: столицы — цветом державы
  window.__mmVilCol=c=>{ const i=byKey.get(c.col+','+c.row); if(i===undefined)return null; const lm=LM[i];
    return lm.capital?playerCss():lm.aiCapital?'#c9563e':null; };

  // ================= КАМЕРА: перелёт, клавиши, компас =================
  let camTarget=null;
  function flyTo(x,z){ const T=controls.target; camTarget=new THREE.Vector3(nearX(normX(x),T.x),0,z); }
  window.__flyTo=flyTo;
  // 23.10 Артём: «переместиться к деревне — камера наезжает крупно». Перелёт + плавный наезд до ближнего вида;
  // ручной ввод по холсту обрывает наезд так же, как перелёт (слушатели ниже).
  let flyZ=null;
  function flyNear(x,z){ flyTo(x,z); flyZ=26*K; }
  function flyZoomStep(){ if(flyZ==null||batZ)return; const T=controls.target, off=camera.position.clone().sub(T), L0=off.length();
    if(Math.abs(L0-flyZ)<0.6){ flyZ=null; return; }
    const L=L0+(flyZ-L0)*0.08; camera.position.copy(T).add(off.multiplyScalar(L/L0)); }
  // 21.10 Артём («карта резиновая после отправки отряда к краю экрана»): перелёт камеры тянул цель каждый кадр и боролся
  // с ручным скроллом. Любой ручной ввод по холсту обрывает авто-перелёт и боевой наезд камеры.
  addEventListener('pointerdown',e=>{ if(e.target&&e.target.tagName==='CANVAS'){ camTarget=null; flyZ=null; if(batZ)batZ.user=true; } },true);
  addEventListener('wheel',()=>{ camTarget=null; flyZ=null; if(batZ)batZ.user=true; },{passive:true,capture:true});
  const panKeys={ArrowUp:0,ArrowDown:0,ArrowLeft:0,ArrowRight:0,KeyW:0,KeyA:0,KeyS:0,KeyD:0};
  const _typing=el=>el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA');
  addEventListener('keydown',e=>{ if(e.code in panKeys&&!_typing(e.target)){ panKeys[e.code]=1; e.preventDefault(); } });
  addEventListener('keyup',e=>{ if(e.code in panKeys)panKeys[e.code]=0; });
  const _panReset=()=>{ for(const k in panKeys)panKeys[k]=0; };
  addEventListener('blur',_panReset);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden)_panReset(); });
  const PAN_SPEED=0.5*K, _f=new THREE.Vector3(), _r=new THREE.Vector3(), _m=new THREE.Vector3();
  function applyPan(){ const dx=(panKeys.ArrowRight||panKeys.KeyD)-(panKeys.ArrowLeft||panKeys.KeyA);
    const dz=(panKeys.ArrowDown||panKeys.KeyS)-(panKeys.ArrowUp||panKeys.KeyW); if(!dx&&!dz)return;
    camera.getWorldDirection(_f); _f.y=0; _f.normalize(); _r.crossVectors(_f,camera.up).normalize();
    _m.set(0,0,0).addScaledVector(_f,-dz*PAN_SPEED).addScaledVector(_r,dx*PAN_SPEED); controls.target.add(_m); camTarget=null; }
  // 17.10: КОМПАС УБРАН (карта зафиксирована, камера всегда на север). На его месте — ФИЛЬТРЫ ОТЛАДКИ «найти на карте»:
  // галочка у вида предметов → над каждым стрелка (за экраном — у края, носом в его сторону); клик по стрелке — камера к нему.
  // Виды регистрирует код, где они живут: finderAdd({id,name,icon,col,list:()=>[{x,z,label}]}). Галочки помнит браузер.
  const FINDERS=[], finderOn=new Set((()=>{ try{ return JSON.parse(localStorage.getItem('grad-finders')||'[]'); }catch(e){ return []; } })());
  { const st=document.createElement('style'); st.textContent=`
    #g-find{position:fixed;right:14px;bottom:14px;z-index:9;width:52px;height:52px;border-radius:50%;
      background:#0e1520cc;border:1px solid #ffffff2a;cursor:pointer;user-select:none;color:#f4cd7e;
      display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px #0006}
    #g-find:hover{background:#182334cc} #g-find.on{background:#2a3f5ee6;border-color:#ffd98a88}
    #g-findp{position:fixed;right:14px;bottom:74px;z-index:23;display:none;background:#12233af2;color:#ffe9c2;padding:10px 12px 8px;border-radius:13px;
      font:600 13px system-ui;box-shadow:0 4px 14px #0008;min-width:200px;border:1px solid #ffffff1f;user-select:none}
    #g-findp.on{display:block} #g-findp .h{font-size:11.5px;opacity:.7;margin-bottom:6px;font-weight:700;letter-spacing:.02em}
    #g-findp label{display:flex;align-items:center;gap:8px;padding:5px 2px;cursor:pointer} #g-findp label:hover{color:#fff}
    #g-findp input{width:16px;height:16px;accent-color:#e0a84e;margin:0} #g-findp .n{margin-left:auto;opacity:.7;font-weight:700}
    #g-findp .nx{border:0;border-radius:7px;padding:3px 8px;background:#3f6b8f;color:#fff;font:700 11.5px system-ui;cursor:pointer}
    #g-findl{position:fixed;inset:0;z-index:8;pointer-events:none}
    #g-findl .fa{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 2px 3px #000a)}
    #g-findl .fa:hover{transform:scale(1.25)}`;
    document.head.appendChild(st); }
  GICONS.filter='<path d="M3.5 5h17l-6.5 7.5V19l-4 2v-8.5z"/>';
  const findBtn=document.createElement('div'); findBtn.id='g-find'; findBtn.title='Найти на карте (отладка)'; findBtn.innerHTML=GI('filter',24,'#f4cd7e'); document.body.appendChild(findBtn);
  const findP=document.createElement('div'); findP.id='g-findp'; document.body.appendChild(findP);
  const findL=document.createElement('div'); findL.id='g-findl'; document.body.appendChild(findL);
  for(const el of[findBtn,findP,findL]){ el.addEventListener('pointerdown',e=>e.stopPropagation()); el.addEventListener('pointerup',e=>e.stopPropagation()); }
  const findNext={};                                                  // «следующий»: по кругу по предметам вида
  function finderPanel(){ findP.innerHTML='<div class="h">НАЙТИ НА КАРТЕ · отладка</div>'+FINDERS.map(f=>{ const n=f.list().length;
      return `<label><input type="checkbox" data-f="${f.id}" ${finderOn.has(f.id)?'checked':''}>${GI(f.icon,15,f.col)}${f.name}<span class="n">${n}</span>${n?`<button class="nx" data-g="${f.id}" title="Камера к следующему">→</button>`:''}</label>`; }).join('');
    findP.querySelectorAll('input').forEach(c=>c.onchange=()=>{ if(c.checked)finderOn.add(c.dataset.f); else finderOn.delete(c.dataset.f);
      try{ localStorage.setItem('grad-finders',JSON.stringify([...finderOn])); }catch(e){} });
    findP.querySelectorAll('.nx').forEach(b=>b.onclick=e=>{ e.preventDefault(); const f=FINDERS.find(q=>q.id===b.dataset.g), L=f&&f.list(); if(!L||!L.length)return;
      const k=(findNext[f.id]||0)%L.length; findNext[f.id]=k+1; flyTo(L[k].x,L[k].z); }); }
  findBtn.onclick=()=>{ const on=!findP.classList.contains('on'); findP.classList.toggle('on',on); findBtn.classList.toggle('on',on); if(on)finderPanel(); };
  function finderAdd(f){ FINDERS.push(f); if(findP.classList.contains('on'))finderPanel(); }
  const _fv=new THREE.Vector3(), fPool=[]; let fT=0;
  function finderTick(){ let k=0; const W=innerWidth, H=innerHeight, T=controls.target;
    if(findP.classList.contains('on')&&performance.now()-fT>1000){ fT=performance.now(); for(const f of FINDERS){ const el=findP.querySelector(`input[data-f="${f.id}"]`); const n=el&&el.parentNode.querySelector('.n'); if(n)n.textContent=f.list().length; } }
    for(const f of FINDERS){ if(!finderOn.has(f.id))continue;
      for(const it of f.list()){ const x=nearX(it.x,T.x); _fv.set(x,heightAt(normX(x),it.z)+2.2*K,it.z).project(camera);
        let sx=(_fv.x+1)/2*W, sy=(1-_fv.y)/2*H; const behind=_fv.z>1; if(behind){ sx=W-sx; sy=H-sy; }
        const M=34, top=70, bot=H-80, inside=!behind&&sx>M&&sx<W-M&&sy>top&&sy<bot;
        let ang=Math.PI/2;                                            // на экране — носом вниз, на предмет
        if(!inside){ const cx=W/2, cy=H/2; let dx=sx-cx, dy=sy-cy; if(behind&&Math.abs(dy)<1)dy=H;
          const kx=dx?((dx>0?W-M:M)-cx)/dx:1e9, ky=dy?((dy>0?bot:top)-cy)/dy:1e9, t=Math.min(Math.abs(kx),Math.abs(ky));
          sx=cx+dx*t; sy=cy+dy*t; ang=Math.atan2(dy,dx); }
        let el=fPool[k]; if(!el){ el=fPool[k]=document.createElement('div'); el.className='fa'; findL.appendChild(el);
          el.onclick=()=>{ const d=el._it; if(d)flyTo(d.x,d.z); }; }
        if(el._col!==f.col){ el._col=f.col; el.innerHTML=`<svg viewBox="-15 -15 30 30" width="30" height="30"><path d="M13 0 L-9 -10 L-4 0 L-9 10 Z" fill="${f.col}" stroke="#1a1208" stroke-width="1.6" stroke-linejoin="round"/></svg>`; }
        el._it=it; el.title=it.label||f.name; el.style.display='block'; el.style.left=sx+'px'; el.style.top=sy+'px'; el.firstChild.style.transform=`rotate(${ang}rad)`; k++; } }
    for(;k<fPool.length;k++)fPool[k].style.display='none'; }

  // ================= ВЫБОР СТОЛИЦЫ (initCapital, index.html 6318–6578) =================
  { const st=document.createElement('style'); st.textContent=`
    #g-task{position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:9;
      background:linear-gradient(#2a3f5eF5,#16243aF5);color:#ffe9c2;padding:14px 20px;border-radius:14px;
      box-shadow:0 8px 22px #0007;font-family:system-ui,sans-serif;font-size:14.5px;font-weight:600;line-height:1.45;
      display:none;align-items:center;gap:12px;border:1px solid #ffd98a66;white-space:normal;max-width:540px;text-align:left;opacity:1;transition:opacity .24s ease}
    #g-task.on{display:flex;animation:g-bnr 2.4s ease-in-out infinite}
    #g-task.fading{opacity:0}
    #g-task.nudge{animation:g-shake .5s ease}
    #g-task .g-ico{flex:0 0 auto;width:52px;height:52px;filter:drop-shadow(0 2px 4px #0006)}
    #g-task .g-ico svg{display:block;width:100%;height:100%}
    #g-task .g-txt{flex:0 1 auto;min-width:0;max-width:312px}
    #g-task::after{content:'';position:absolute;left:50%;bottom:-7px;transform:translateX(-50%);border:7px solid transparent;border-top-color:#16243aF5;border-bottom:0}
    @keyframes g-bnr{0%,100%{box-shadow:0 8px 22px #0007}50%{box-shadow:0 8px 26px #ffcf7a66}}
    @keyframes g-shake{0%,100%{transform:translateX(-50%)}15%{transform:translateX(-54%)}35%{transform:translateX(-46%)}55%{transform:translateX(-53%)}75%{transform:translateX(-47%)}}
    @keyframes g-fade{from{opacity:0}to{opacity:1}}
    #g-story{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:#05070cAA;backdrop-filter:blur(3px);font-family:Georgia,'Times New Roman',serif}
    #g-story.on{display:flex;animation:g-fade .5s ease}
    #g-story .scroll{position:relative;max-width:440px;margin:20px;padding:30px 34px 24px;background:linear-gradient(#f3e2b8,#e7cd95);color:#3a2a12;border-radius:14px;
      box-shadow:0 22px 60px #000b, inset 0 0 0 2px #b98b45, inset 0 0 46px #c79a4d55;border:1px solid #7a5a2a;text-align:center}
    #g-story .seal{font-size:40px;line-height:1;margin-bottom:2px;filter:drop-shadow(0 2px 3px #0005)}
    #g-story h3{margin:2px 0 2px;font-size:14px;letter-spacing:2.5px;text-transform:uppercase;color:#7a5a24;font-weight:700}
    #g-story .div{width:84px;height:2px;margin:11px auto 15px;background:linear-gradient(90deg,transparent,#a5772f,transparent)}
    #g-story p{margin:0 0 16px;font-size:16px;line-height:1.62;font-style:italic}
    #g-story b{color:#6b3f12;font-style:normal}
    #g-story button{margin-top:4px;border:0;border-radius:10px;padding:10px 26px;cursor:pointer;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#2a1a06;
      background:linear-gradient(#f0c976,#c8912f);box-shadow:0 4px 12px #0005, inset 0 1px 0 #fff6}
    #g-story button:hover{filter:brightness(1.06)}
    #g-modal{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:#00091066;backdrop-filter:blur(2px);font-family:system-ui,sans-serif}
    #g-modal.on{display:flex}
    #g-modal .card{background:linear-gradient(#20344f,#16243a);color:#eaf1fb;border-radius:16px;padding:22px 24px 18px;box-shadow:0 16px 50px #000a;border:1px solid #ffd98a44;max-width:330px;text-align:center}
    #g-modal .crown{font-size:34px;line-height:1;margin-bottom:6px}
    #g-modal .q{font-size:17px;font-weight:700;letter-spacing:.2px}
    #g-modal .nm{margin-top:7px;font-size:13px;opacity:.8}
    #g-modal .lbl{display:block;margin:15px 0 5px;font-size:12px;opacity:.66;text-align:left}
    #g-modal .inp{width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1px solid #ffd98a55;background:#0d1826;color:#ffe9c2;font-size:15px;font-weight:600;font-family:system-ui;text-align:center;outline:none}
    #g-modal .inp:focus{border-color:#f4cd7e;box-shadow:0 0 0 2px #f4cd7e40}
    #g-modal .btns{display:flex;gap:10px;margin-top:16px;justify-content:center}
    #g-modal button{border:0;border-radius:10px;padding:9px 18px;font-size:14px;font-weight:600;cursor:pointer}
    #g-modal .yes{background:linear-gradient(#f4cd7e,#c98a2f);color:#3a2606}
    #g-modal .no{background:#ffffff1f;color:#dbe6f5}
    #g-modal .yes:hover{filter:brightness(1.06)} #g-modal .no:hover{background:#ffffff33}`;
    document.head.appendChild(st); }
  const banner=document.createElement('div'); banner.id='g-task';
  const modal=document.createElement('div'); modal.id='g-modal';
  modal.innerHTML=`<div class="card"><div class="crown">♔</div>
    <div class="q">Здесь основать столицу, Правитель?</div><div class="nm" id="g-mnm"></div>
    <label class="lbl" for="g-mname">Название столицы</label>
    <input id="g-mname" class="inp" type="text" maxlength="24" autocomplete="off" spellcheck="false">
    <div class="btns"><button class="yes" id="g-myes">Да, основать</button><button class="no" id="g-mno">Нет</button></div></div>`;
  const story=document.createElement('div'); story.id='g-story';
  story.innerHTML=`<div class="scroll"><div class="seal">♔</div><h3 id="g-story-h">Основание столицы</h3>
    <div class="div"></div><p id="g-story-p"></p><button id="g-story-ok">Да будет так!</button></div>`;
  document.body.appendChild(banner); document.body.appendChild(modal); document.body.appendChild(story);
  const ICON_CROWN=`<svg viewBox="0 0 48 48" fill="#ffe1a0"><path d="M7 33 L11 15 L19 25 L24 11 L29 25 L37 15 L41 33 Z"/><rect x="7" y="34.5" width="34" height="7.5" rx="2.6"/><circle cx="11" cy="15" r="2.5"/><circle cx="24" cy="11" r="2.7"/><circle cx="37" cy="15" r="2.5"/></svg>`;
  function setTask(body){ const html=typeof body==='string'?`<div class="g-ico">${ICON_CROWN}</div><div class="g-txt"><div class="g-body">${body}</div></div>`:taskHTML(body);
    if(banner.classList.contains('on')&&banner.innerHTML.trim()){ banner.classList.add('fading');
      setTimeout(()=>{ banner.innerHTML=html; banner.classList.remove('fading'); },240); } else banner.innerHTML=html; }
  function nudge(){ banner.classList.remove('nudge'); void banner.offsetWidth; banner.classList.add('nudge'); setTimeout(()=>banner.classList.remove('nudge'),550); }
  $('g-story-ok').onclick=()=>{ story.classList.remove('on'); updateStats(); onCapitalFounded(); };   // 15.10: осмотр округи (index.html 6432–6435)
  const STAGE_ACC={'стоянка':'стоянку','деревушка':'деревушку','деревня':'деревню','город':'город'};
  function showFoundingStory(lm){ const ctry=COUNTRIES[PLAYER.countryId], stage=STAGES[stageIdxH(lm)], acc=STAGE_ACC[stage]||stage, nm=lm.name||'—';
    $('g-story-p').innerHTML=`После долгих недель пути ты, <b>${PLAYER.name}</b>, во главе своего отряда вступаешь в ${acc} <b>${nm}</b>. Жители выходят навстречу с хлебом да солью и радушно принимают тебя. Здесь, под этим небом, ты решаешь основать столицу нового государства. Вместе с отрядом шёл и Мудрец — он готов взяться за первые тайны мира, стоит тебе сказать слово. Так рождается держава <b>${ctry.name} ${ctry.flag}</b> — да выдержит она испытание временем, а имя твоё войдёт в летописи!`;
    $('g-story-h').textContent=`${nm} — столица ${ctry.gen}`;
    story.classList.add('on'); glog(`Основана столица ${nm} (${ctry.name})`); }
  // золотой маркер над столицей — гем + луч к земле (масштаб ×K под новый гекс)
  const mk=new THREE.Group();
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.72*K),new THREE.MeshStandardMaterial({color:0xf4c542,metalness:0.55,roughness:0.28,emissive:0x6a4700,emissiveIntensity:0.6}));
  mk.add(gem);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.13*K,0.13*K,6*K,10),new THREE.MeshBasicMaterial({color:0xffd766,transparent:true,opacity:0.34,depthWrite:false}));
  beam.position.y=-3.1*K; mk.add(beam); mk.visible=false; scene.add(mk);
  // НОВОЕ (вместо тумана): золотые кольца на земле под деревнями открытого пятна
  const ringG=new THREE.Group(); scene.add(ringG); const ringMat=new THREE.LineBasicMaterial({color:0xf4cd7e,transparent:true,opacity:0.9,depthTest:false});
  function buildRings(){ while(ringG.children.length){ const o=ringG.children.pop(); o.geometry.dispose(); }
    for(const i of candSet){ const lm=LM[i], pts=[];
      for(let k=0;k<=64;k++){ const a=k/64*Math.PI*2, R=HEXR*0.86, x=lm.x+Math.cos(a)*R, z=lm.z+Math.sin(a)*R;
        pts.push(new THREE.Vector3(x-lm.x,Math.max(heightAt(x,z),-0.62)+0.15,z-lm.z)); }
      const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),ringMat); ln.renderOrder=6; ln.userData.lm=lm; ln.frustumCulled=false; ringG.add(ln); } }

  let pend=null;
  function propose(lm){
    if(!candSet.has(LM.indexOf(lm))){                                 // НОВОЕ: слово «туман» → «вне открытой части» (тумана пока нет)
      setTask('Это поселение вне открытой части карты — выбери одно из отмеченных золотом.'); nudge(); return; }
    pend=lm; const stage=STAGES[stageIdxH(lm)];
    $('g-mnm').textContent=`${stage} · ${fmtPop(popOf(lm.size))}`;
    const inp=$('g-mname'); inp.value=''; inp.placeholder=(CITY_NAMES[PLAYER.countryId]||CITY_NAMES.ru)[0];
    modal.classList.add('on'); setTimeout(()=>inp.focus(),30); }
  function confirmCapital(){ if(pend){ const nm=($('g-mname').value||'').trim();
      if(nm){ pend.name=nm; usedNames.add(nm); usedCities[PLAYER.countryId]=1; } else pend.name=takeCityName(PLAYER.countryId);
      setCapital(pend); } pend=null; }
  $('g-myes').onclick=confirmCapital;
  $('g-mno').onclick=()=>{ modal.classList.remove('on'); pend=null; };
  $('g-mname').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); confirmCapital(); } });
  function setCapital(lm){
    LM.forEach(l=>l.capital=false); lm.capital=true; pickingCapital=false; lm.founded=turn; lm._startSize=lm.size;
    // НАГРАДА ЗА ОБОРОННУЮ ПОЗИЦИЮ (22.08-5): холм/излучина/мыс + 30 еды в запас (15.10: запас ям есть — перенесено)
    { const parts=[]; let def=0, rn=0, wn=0;
      if(lm.c.was==='hills'){ def+=0.15; parts.push('холм'); }
      for(const n of ctx.neighbors(lm.c)){ if(n.type==='water')wn++; else if(riverNear(n))rn++; }
      if(rn>=2){ def+=0.10; parts.push('излучина реки'); }
      if(wn>=3){ def+=0.10; parts.push('мыс'); } else if(wn>=1){ def+=0.05; parts.push('берег'); }
      if(def){ lm.defBonus=Math.min(0.3,+def.toFixed(2)); lm._store=(lm._store||0)+30;
        glog(`Место выбрано с умом: ${parts.join(' + ')} — защита +${Math.round(lm.defBonus*100)}% (пригодится в войнах), в амбар засыпано +30 еды`); } }
    aiSpawn(lm); nameAllSettlements();
    banner.classList.remove('on'); modal.classList.remove('on');
    candSet.clear(); buildRings();
    mk.visible=true; flyTo(lm.x,lm.z);
    for(const r of recs)r.sig=null;
    if(window.__fog)window.__fog.recalc();                             // 28.10: туман разведки сразу при основании — стартовое пятно гаснет до «разведано», столица смотрит сама
    showFoundingStory(lm);
    sciAsk0(); }                                                       // 30.10 (Артём, как в циве): первый наказ по наукам обязателен — конец хода ждёт выбора
  // соперник: пятно напротив по кольцу (pickStarts), иначе самая дальняя деревня через шов, не ближе 12 клеток
  function aiSpawn(pc){ AI.active=false; AI.capIdx=-1; AI.taken=0; AI.giftT=null; AI.takeT=null; AI.tgtK=null; AI.hireT=null; aibKill();
    AI.gold=80; AI.rel=50; AI.cGiftT=null; AI.pGiftT=null; AI.cTgtK=null;
    AI.war=false; AI.warT=null; AI.peaceT=null; AI.warLoss=0; AI.peaceAskT=null;
    let best=-1, bd=-1;
    if(START.ai){ const i=START.ai.i; if(LM[i]&&!LM[i].capital){ best=i; bd=wdist(LM[i],pc)/dxH; } }
    if(best<0)LM.forEach((l,i)=>{ if(l.capital)return; const d=wdist(l,pc)/dxH; if(d>bd){ bd=d; best=i; } });
    if(best<0||bd<12)return;
    AI.countryId=PLAYER.countryId==='ru'?'fr':'ru';
    const free=paletteFor(AI.countryId,TAKEN_COLORS); AI.colorId=free.length?free[0].id:'scarlet';
    TAKEN_COLORS=[...TAKEN_COLORS,AI.colorId];
    const ls=LEADERS[AI.countryId]; AI.leaderId=ls[(Math.random()*ls.length)|0].id;
    const lm=LM[best]; lm.aiCapital=true; lm.founded=turn; lm._startSize=lm.size; lm.name=takeCityName(AI.countryId);
    AI.capIdx=best; AI.active=true; nameAllSettlements();
    glog(`${COUNTRIES[AI.countryId].flag} Вдали поднялась держава ${COUNTRIES[AI.countryId].gen} — ${leaderById(AI.leaderId).name} правит из «${lm.name}»`,{at:[lm.x,lm.z]}); }
  // 26.10 СТУПЕНЬ 1 ОЖИВЛЕНИЯ AI (Артём: «AI должен быть полноценным игроком»): соперник собирает земли
  // по ТЕМ ЖЕ правилам, что игрок: дарами роняет волю ближайшей ничейной деревни (−10 раз в 4 хода, как doGift),
  // на лояльности 80 (воля ≤20, как readyJoin) принимает её (aiOwned), не чаще раза в 6 ходов (absorbGap старого).
  // Люд из владений стекается в его столицу (0.5%/год, 70% доходит — «без дорог», как в old.html).
  function aiTurn(idx,yr){ const ac=aiCap(); if(!ac)return;
    let pp=popOf(ac.size); const b0=pp;
    const bya=BIRTH_RATE[idx]/100, dya=DEATH_BASE[idx]/100;
    for(let y=0;y<yr;y++)pp=Math.max(10,pp*(1+bya-dya));
    LM.forEach(v=>{ if(!v.aiOwned)return; let vp=popOf(v.size);                 // приток из владений в столицу соперника: 1% за ХОД (не за год — иначе деревня сохнет за 10 ходов)
      const drift=vp*0.01; vp-=drift; pp+=drift*0.7;
      setSize(v,sizeOfPop(Math.max(10,vp))); });
    setSize(ac,sizeOfPop(pp)); ac._growLast=popOf(ac.size)-b0;
    // 26.10 ступень 3: достаток — монеты и товары одним числом (у игрока дар = 6 товаров, найм = монеты; AI не делим)
    AI.gold=Math.max(0,Math.round(((AI.gold||0)+popOf(ac.size)/20+LM.reduce((s,l)=>s+(l.aiOwned?popOf(l.size)/50:0),0)-1)*10)/10);
    aiArmy(ac);                                                                 // 26.10 ступень 2: дружина соперника — найм, перехват шаек, усмирение владений
    aiCourt(ac);                                                                // 26.10 ступень 3: гонка за вольные грады
    // 26.10 СТУПЕНЬ 4: ВОЙНА. Отношение упало ниже 20 (мы дважды-трижды увели его цели) и есть чем воевать —
    // соперник объявляет войну (шанс 25%/ход, не раньше 15 ходов после прошлого мира). Проигрывая (дружина погибла
    // и на новую нет достатка, либо потерял 2 владения), сам просит мира с данью нам.
    if(!AI.war&&(AI.rel??50)<20&&(AI.peaceT==null||turn-AI.peaceT>=15)&&(AIB||(AI.gold||0)>=60)&&Math.random()<0.25){
      AI.war=true; AI.warT=turn; AI.warLoss=0;
      const L4=leaderById(AI.leaderId), C4=COUNTRIES[AI.countryId];
      glog(`${C4.flag} Держава ${C4.gen} объявила нам ВОЙНУ!`,{warn:1,at:[ac.x,ac.z]});
      evt({icon:'swords',title:'Война!',html:`${L4.name} объявил нашей державе <b>войну</b> — слишком часто мы переходили ему дорогу. Его дружина будет <b>разорять наши дворы</b> (добро — ему, верность двора тает). Наша дружина теперь может <b>бить его дружину</b> и <b>штурмовать его владения</b> — усмирённые станут нашими данниками.<br><br>Мир — в карточке его столицы: ослабленный соперник мирится даром, сильный возьмёт <b>15 товаров</b>. Потеряв дружину и владения, он запросит мир сам — с данью нам.`}); }
    if(AI.war&&((!AIB&&(AI.gold||0)<60)||(AI.warLoss||0)>=2)&&(AI.peaceAskT==null||turn-AI.peaceAskT>=6)){
      AI.peaceAskT=turn;
      const L4=leaderById(AI.leaderId), C4=COUNTRIES[AI.countryId];
      glog(`${C4.flag} ${L4.name} просит мира — война ему не по силам`,{at:[ac.x,ac.z]});
      evt({icon:'scroll',title:'Соперник просит мира',html:`Война разорила державу ${C4.gen}: ${!AIB?'дружина полегла, на новую нет достатка':'он потерял владения'}. ${L4.name} шлёт послов — просит мира и готов заплатить <b>20 монет дани</b>.`,
        buttons:[{t:'Принять мир (+20 монет)',cb:()=>{ AI.war=false; AI.peaceT=turn; AI.rel=Math.max(AI.rel??50,40); money+=20; updateStats();
          glog(`🕊 Мир с державой ${C4.gen} заключён — дань 20 монет получена`); }},{t:'Продолжить войну',cls:'no'}]}); }
    // дипломатия соперника: обхаживает ближайшую к его землям ничейную деревню
    const seats=[ac,...LM.filter(l=>l.aiOwned)];
    let tgt=null,td=1e9;
    LM.forEach(l=>{ if(l.capital||l.aiCapital||l.aiOwned||l.rel||l.free||(l._rebelT!=null&&turn-l._rebelT<10))return;   // 26.10 ст.3: бунтовщика, брошенного нами на 10+ ходов, AI подбирает
      let d=1e9; for(const s of seats){ const dd=wdist(l,s)/K; if(dd<d)d=dd; }
      if(d<30&&d<td){ td=d; tgt=l; } });                                        // 26.10: 18 было мало — на иных раздачах вокруг соперника пусто
    AI.tgtK=tgt?tgt.c.col+','+tgt.c.row:null;                                   // для карточки соперника
    if(!tgt)return;
    ensureWill(tgt);
    if((AI.giftT==null||turn-AI.giftT>=((AI.rel??50)<30?3:4))&&(AI.gold||0)>=6){ AI.giftT=turn; AI.gold-=6; willAdd(tgt,-10,`дары ${COUNTRIES[AI.countryId].gen}`); }   // ст.3: дар стоит 6, обедневший отстаёт; при вражде (rel<30) дарит чаще
    if(tgt.will<=20&&(AI.takeT==null||turn-AI.takeT>=6)){ AI.takeT=turn;
      tgt.aiOwned=true; AI.taken=(AI.taken||0)+1; tgt._rebelT=null; tgt._closed=false;
      if(tgt.scouted)glog(`${COUNTRIES[AI.countryId].flag} «${tgt.name||'Деревня'}» присягнула державе соперника — его земли растут`,{warn:1,at:[tgt.x,tgt.z]});
      drawZones(); for(const r of recs)r.sig=null; } }
  // 26.10 СТУПЕНЬ 3: гонка за вольные грады — соперник шлёт дары ближайшему граду (+10 своего влияния, −4 нашего:
  // «вече смотрит на щедрейшего»), на 90+ пять ходов кряду и державе вдвое людней — град присягает ему. Данника (откуп нам) не берёт.
  function aiCourt(ac){ const seats=[ac,...LM.filter(l=>l.aiOwned)];
    let g=null,gd=1e9;
    LM.forEach(l=>{ if(!l.free)return;
      let d=1e9; for(const s of seats){ const dd=wdist(l,s)/K; if(dd<d)d=dd; }
      if(d<gd){ gd=d; g=l; } });                                       // без лимита радиуса: игрок тоже дарит градам через всю карту (26.10: с лимитом 30 на иных раздачах градов «нет»)
    AI.cTgtK=g?g.c.col+','+g.c.row:null;                               // для карточки соперника
    if(!g)return;
    if((AI.cGiftT==null||turn-AI.cGiftT>=5)&&(AI.gold||0)>=6){ AI.cGiftT=turn; AI.gold-=6;
      g._infAi=Math.min(100,(g._infAi||0)+10);
      if((g._inf||0)>0)g._inf=Math.max(0,Math.round((g._inf-4)*10)/10);
      if(g.scouted)glog(`${COUNTRIES[AI.countryId].flag} Соперник шлёт дары вольному граду «${g.name}» — вече смотрит на щедрейшего`,{at:[g.x,g.z]}); }
    if((g._infAi||0)>=90)g._subAiT=(g._subAiT||0)+1; else g._subAiT=0;
    const aiPop=popOf(ac.size)+LM.reduce((s,l)=>s+(l.aiOwned?popOf(l.size):0),0);
    if(g._subAiT>=5&&!g._ftrib&&aiPop>=popOf(g.size)*2){
      delete g.free; delete g._q; delete g._rent; delete g._inf; delete g._infAi; delete g._subAiT;
      g.aiOwned=true; AI.taken=(AI.taken||0)+1;
      glog(`${COUNTRIES[AI.countryId].flag} Вольный град «${g.name}» присягнул державе соперника!`,{warn:1,at:[g.x,g.z]});
      evt({icon:'crown',title:`«${g.name}» — под рукой соперника`,html:`Вече вольного града «${g.name}» присягнуло державе ${COUNTRIES[AI.countryId].gen}: его дары оказались щедрее, влияние — крепче. Город и его люд теперь — земли соперника. Гонка за оставшиеся грады продолжается — влияние копится дарами и поручениями.`});
      drawZones(); for(const rc of recs)rc.sig=null; } }
  // клик по клетке с поселением: на этапе «выбери столицу» — предложить её; потом — карточка (клик ≠ перетаскивание камеры)
  { const dom=renderer.domElement; let dx0=0,dy0=0;
    dom.addEventListener('pointerdown',e=>{ dx0=e.clientX; dy0=e.clientY; });
    dom.addEventListener('pointerup',e=>{ if(!inGame)return; if(Math.hypot(e.clientX-dx0,e.clientY-dy0)>5)return;
      const p=groundHit(e.clientX,e.clientY); if(!p)return; const c=hexAt(normX(p.x),p.z); if(!c)return;
      if(pickPatchAt(c))return;                                                // 15.10: выбор промысла — клик по угодью
      if(uClick(c))return;                                                     // 16.10: отряды — выбор, приказ, карусель на клетке поселения
      const i=byKey.get(c.col+','+c.row); if(i===undefined)return;
      if(window.__fog&&window.__fog.enabled()&&window.__fog.at(LM[i].x,LM[i].z)===0)return;   // 28.10: скрытое туманом поселение кликом не открывается
      if(pickingCapital){ propose(LM[i]); return; }
      if(LM[i].aiCapital)openForeign(i); else if(LM[i].capital)openCity(); else openVillage(i); }); }   // НОВОЕ (Артём 14.10): карточка и по клику на гексе, не только на плашке

  // ================= КАРТОЧКА ДЕРЕВНИ / ЧУЖОЙ СТОЛИЦЫ (index.html 4986–5125) =================
  { const st=document.createElement('style'); st.textContent=`
    #g-vil{position:fixed;right:18px;bottom:150px;z-index:13;width:262px;padding:15px 17px 14px;display:none;
      font-family:system-ui,sans-serif;color:#eaf1fb;background:linear-gradient(180deg,#16283f 0%,#101d2f 100%);
      border:1px solid #ffffff1f;border-radius:15px;box-shadow:0 12px 34px #0008}
    #g-vil.on{display:block;animation:g-fade .22s ease}
    #g-vil h4{margin:0 0 11px;font-size:15.5px;color:#cfd7e2;padding:0 26px 11px 0;border-bottom:1px solid #ffffff20}
    #g-vil .rr{margin-top:9px;font-size:13px;display:flex;align-items:center;gap:9px}
    #g-vil .rr .k{opacity:.62;flex:1}
    #g-vil .rr .v{font-weight:700}
    #g-vil .plus{color:#7fd18a} #g-vil .minus{color:#e08b8b} #g-vil .out{color:#ffd98a}
    #g-vil .up{border-top:1px solid #ffffff20;padding-top:11px;margin-top:12px}
    #g-vil .cap{margin-top:12px;font-size:11.5px;opacity:.6;line-height:1.45}
    #g-vil .x{position:absolute;right:12px;top:11px;cursor:pointer;opacity:.55;font-size:16px}
    #g-vil .wb{height:8px;border-radius:5px;background:#ffffff1e;overflow:hidden;margin-top:5px}
    #g-vil .wb i{display:block;height:100%;border-radius:5px;transition:width .3s}
    #g-vil .brow{display:flex;gap:7px;margin-top:12px;flex-wrap:wrap}
    #g-vil .brow button{flex:1 1 46%;border:0;border-radius:9px;padding:7px 5px;font-size:11.6px;cursor:pointer;color:#fff;background:#2c4767;display:flex;align-items:center;justify-content:center;gap:5px}
    #g-vil .brow button:hover{filter:brightness(1.18)}
    #g-vil .brow button:disabled{opacity:.38;cursor:default;filter:none}
    #g-vil input[type=range]{width:100%;margin-top:4px;accent-color:#ffd98a}
    #g-vil .x:hover{opacity:1}`;
    document.head.appendChild(st); }
  const vilPanel=document.createElement('div'); vilPanel.id='g-vil'; document.body.appendChild(vilPanel);
  let vilIdx=-1;
  function openVillage(i){ const lm=LM[i]; if(!lm)return; vilIdx=i; renderVillage(); vilPanel.classList.add('on'); }
  function closeVillage(){ vilPanel.classList.remove('on'); vilIdx=-1; }
  function openForeign(i){ const lm=LM[i]; if(!lm||!lm.aiCapital)return;
    const L=leaderById(AI.leaderId), C=COUNTRIES[AI.countryId], c=aiCss();
    vilPanel.innerHTML=`<div class="x">✕</div>
      <h4 style="color:${c}">${C.flag} ${lm.name} <span style="opacity:.5;font-weight:400;font-size:12.5px">— столица ${C.gen}</span></h4>
      <div class="rr">${GI('crown',15)}<span class="k">правитель</span><span class="v" style="color:${c}">${L.name}</span></div>
      <div class="rr">${GI('people',15)}<span class="k">жителей</span><span class="v">${fmtPop(popOf(lm.size))}</span></div>
      <div class="rr">${GI('trend',15)}<span class="k">прирост за ход</span><span class="v ${(lm._growLast||0)>=0?'plus':'minus'}">${(lm._growLast||0)>=0?'+':''}${lm._growLast||0}</span></div>
      <div class="rr up">${GI('fort',15)}<span class="k">присоединено деревень</span><span class="v">${AI.taken}</span></div>
      ${AIB?`<div class="rr">${GI('swords',15)}<span class="k">дружина</span><span class="v">${Math.round(AIB.str)} воинов</span></div>`:''}
      <div class="rr">${GI('coins',15)}<span class="k">достаток</span><span class="v">~${Math.round(AI.gold||0)}</span></div>
      ${(()=>{ const rl=Math.round(AI.rel??50), rn=rl>=70?'дружелюбен':rl>=40?'насторожен':rl>=20?'холоден':'враждебен', rc2=rl>=70?'#7fd18a':rl>=40?'#ffd98a':'#e08b8b';   // 26.10 ст.3: отношение к нам
        return `<div class="rr up"><span class="k">отношение к державе</span><span class="v" style="color:${rc2}">${rl} — ${rn}</span></div><div class="wb"><i style="width:${rl}%;background:${rc2}"></i></div>`; })()}
      ${AI.war?`<div class="rr">${GI('swords',15,'#e08b8b')}<span class="k">война</span><span class="v" style="color:#e08b8b">идёт ${turn-(AI.warT??turn)+1}-й ход</span></div>`:''}
      ${(()=>{ const k=AI.tgtK, ti=k!=null?byKey.get(k):undefined, t=ti!=null?LM[ti]:null;            // 26.10: кого соперник обхаживает сейчас
        return t&&t.scouted?`<div class="rr">${GI('gift',15)}<span class="k">обхаживает дарами</span><span class="v" style="color:${c}">${t.name||'деревню'}</span></div>`:''; })()}
      ${(()=>{ const k=AI.cTgtK, gi2=k!=null?byKey.get(k):undefined, g=gi2!=null?LM[gi2]:null;        // 26.10 ст.3: какой град обхаживает
        return g&&g.scouted?`<div class="rr">${GI('temple',15)}<span class="k">шлёт дары граду</span><span class="v" style="color:${c}">${g.name||'граду'}</span></div>`:''; })()}
      <div class="brow">${AI.war
        ?(()=>{ const weak=!AIB||AIB.str<15||(AI.gold||0)<20;   // 26.10 ст.4: ослабленный мирится даром, сильный — за 15 товаров
          return `<button data-a="aipeace" ${!weak&&goodsTotal()<15?'disabled':''} title="${weak?'соперник ослаблен — мирится даром':'сильному сопернику мир стоит 15 товаров со склада'}">${GI('scroll',13)} Предложить мир${weak?'':' (15 товаров)'}</button>`; })()
        :`<button data-a="aigift" ${goodsTotal()<6||(AI.pGiftT!=null&&turn-AI.pGiftT<4)?'disabled':''} title="−6 товаров со склада: отношение соперника теплеет (+10)">${GI('gift',13)} Поднести дары</button>`}</div>
      <div class="cap">${AI.war
        ?`Идёт война: его дружина разоряет наши дворы (верность дворов тает), наша может бить его дружину и штурмовать его владения — усмирённые станут нашими данниками. Потеряв дружину и владения, он запросит мир сам — с данью нам.`
        :`Соперник живёт по нашим же законам: дарами поднимает лояльность ничейных деревень и принимает их
        под руку, шлёт дары вольным градам (вече смотрит на щедрейшего), держит дружину против шаек, а его достаток
        растёт с его земель. Дары теплят его нрав, увод деревни или града из-под его носа — холодит; упадёт ниже 20 — жди войны.`}</div>`;
    vilPanel.querySelector('.x').onclick=closeVillage;
    const gb=vilPanel.querySelector('[data-a="aigift"]');
    if(gb)gb.onclick=()=>{ if(!takeGoods(6))return; AI.pGiftT=turn; AI.rel=Math.min(100,(AI.rel??50)+10);
      glog(`🎁 Дары отправлены державе ${COUNTRIES[AI.countryId].gen} — отношение теплеет (${Math.round(AI.rel)})`); openForeign(i); };
    const pb=vilPanel.querySelector('[data-a="aipeace"]');             // 26.10 ст.4: мир из карточки
    if(pb)pb.onclick=()=>{ const weak=!AIB||AIB.str<15||(AI.gold||0)<20;
      if(!weak&&!takeGoods(15))return;
      AI.war=false; AI.peaceT=turn; AI.rel=Math.max(AI.rel??50,weak?35:30);
      glog(`🕊 Мир с державой ${COUNTRIES[AI.countryId].gen} заключён${weak?'':' — 15 товаров ушли на откуп'}`);
      evt({icon:'scroll',title:'Мир заключён',html:`Война с державой ${COUNTRIES[AI.countryId].gen} окончена${weak?': ослабленный соперник согласился даром':' — мир куплен за <b>15 товаров</b>'}. Отношение — <b>${Math.round(AI.rel)}</b>. Набеги его дружины на наши дворы прекратятся; новую войну он начнёт не раньше чем через 15 ходов, и только если отношение снова упадёт.`});
      openForeign(i); };
    vilIdx=-1; vilPanel.classList.add('on'); }
  function renderVillage(){ if(vilIdx<0)return; const lm=LM[vilIdx];
    if(lm.aiCapital){ openForeign(vilIdx); return; }
    if(lm.free){ renderFreeCity(lm,vilIdx); return; }                  // 25.10: вольный град — своя карточка
    const b=lm._births||0, d=lm._deaths||0, o=lm._out||0, net=lm._growLast||0, stage=STAGES[stageIdxH(lm)];
    const first=(b||d||o)?'':`<div class="cap">Ход ещё не считался — числа появятся после «Конца хода».</div>`;
    const isCap=lm.capital, va=villageActs(lm);                        // 16.10: воля и действия сбора земель (index.html 5063–5107)
    const unk=!isCap&&!lm.scouted&&!lm.rel;                             // 23.10: неразведанная — имя и жителей не показываем
    vilPanel.innerHTML=`<div class="x">✕</div>
      <h4${isCap?` style="color:${playerCss()}"`:''}>${unk?'Неизвестная деревня':(lm.name||'деревня')} <span style="opacity:.5;font-weight:400;font-size:12.5px">— ${isCap?'столица '+COUNTRIES[PLAYER.countryId].gen:stage}</span></h4>
      ${va.top}
      <div class="rr up">${GI('people',15)}<span class="k">жителей</span><span class="v">${unk?'?':fmtPop(popOf(lm.size))}</span></div>
      <div class="rr up">${GI('trend',15)}<span class="k">родилось за ход</span><span class="v plus">+${b}</span></div>
      <div class="rr">${GI('people',15)}<span class="k">умерло за ход</span><span class="v minus">−${d}</span></div>
      ${isCap?`<div class="rr">${GI('boot',15)}<span class="k">пришло из деревень</span><span class="v out">+${lm._migrants||0}</span></div>`
             :`${lm.rel==='ours'&&lm._in?`<div class="rr">${GI('boot',15)}<span class="k">пришло из округи</span><span class="v out">+${lm._in}</span></div>`:''}
      <div class="rr">${GI('people',15)}<span class="k">ушло в город</span><span class="v out">${o?('−'+o):'0'}</span></div>
      ${o&&lm._outTo?`<div class="cap" style="margin-top:6px">ушли в <b style="color:${playerCss()}">${lm._outTo}</b></div>`:''}`}
      ${!isCap&&lm.rel==='ours'&&lm._need!=null?`<div class="rr up">${GI('wheat',15)}<span class="k">еда: даёт / ест</span><span class="v">${lm._food!=null?lm._food:'—'} / ${lm._need}</span></div>
      ${lm._hunger>0?`<div class="rr">${GI('hunger',15)}<span class="k" style="color:#e0574e">голод — мрут и уходят</span><span class="v minus">−${Math.round(lm._hunger*100)}%</span></div>`
        :lm._attract>0?`<div class="cap" style="margin-top:4px">излишек идёт в закрома державы</div>`:''}`:''}
      <div class="rr up">${GI('trend',15)}<span class="k">итог за ход</span><span class="v ${net>=0?'plus':'minus'}">${net>=0?'+':''}${net}</span></div>
      ${va.acts}${first}`;
    vilPanel.querySelector('.x').onclick=closeVillage; wireVillage(lm,vilIdx); }

  // ================= ОБЗОР ДЕРЖАВЫ (initEmpire, index.html 8108–8262) — клик по плашке года =================
  { const st=document.createElement('style'); st.textContent=`
    #g-emp{position:fixed;inset:0;z-index:24;display:none;align-items:center;justify-content:center;background:#0007;backdrop-filter:blur(2px)}
    #g-emp.on{display:flex}
    #g-emp .win{width:min(940px,94vw);height:min(660px,88vh);background:#132132f2;color:#eaf2ff;border-radius:16px;box-shadow:0 12px 40px #000a;display:flex;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif}
    #g-emp .top{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid #ffffff1a}
    #g-emp .top b{font-size:17px;color:#ffe1a0}
    #g-emp .x{border:0;background:#ffffff1a;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px}
    #g-emp .body{flex:1;overflow:auto;padding:16px 20px;font-size:13px;line-height:1.5}
    #g-emp .sum{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}
    #g-emp .card{background:#1b3050;border:1px solid #ffd98a33;border-radius:11px;padding:9px 13px;min-width:130px}
    #g-emp .card .t{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.6}
    #g-emp .card .v{font-size:16px;font-weight:800;color:#ffe1a0;margin-top:2px}
    #g-emp h4{margin:14px 0 6px;color:#ffe1a0}
    #g-emp table{width:100%;border-collapse:collapse}
    #g-emp th{font-size:11px;text-transform:uppercase;letter-spacing:.5px;opacity:.55;text-align:left;padding:4px 8px}
    #g-emp td{padding:5px 8px;border-top:1px solid #ffffff12}
    #g-emp tr.rw{cursor:pointer} #g-emp tr.rw:hover td{background:#ffffff0d}
    #g-emp .dim{opacity:.6} #g-emp .up2{color:#9fe0a8} #g-emp .dn2{color:#f2a1a1}
    #g-emp .note{margin-top:14px;padding:9px 13px;border:1px dashed #ffd98a44;border-radius:10px;opacity:.7;font-size:12.5px}
    #g-emp .tabs{display:flex;gap:4px;margin:2px 0 0;border-bottom:2px solid #ffffff1a}
    #g-emp .tab{border:0;border-radius:9px 9px 0 0;padding:7px 15px;cursor:pointer;font:700 12.5px system-ui;background:#ffffff10;color:#cfe0f5;opacity:.75}
    #g-emp .tab.on{background:#1b3050;color:#ffe1a0;opacity:1;box-shadow:inset 0 -2px 0 #ffd98a}
    #g-emp .pane{display:none;padding-top:11px} #g-emp .pane.on{display:block}
    #g-emp .trmsg{margin:7px 0;padding:6px 11px;border-radius:8px;background:#ffd98a1c;font-size:12.5px}
    #g-emp .sellb,#g-emp .shb{border:0;border-radius:7px;cursor:pointer;font:700 12px system-ui}
    #g-emp .sellb{padding:3px 9px;margin-right:5px;background:#7a5a24;color:#fff}`;
    document.head.appendChild(st); }
  const emp=document.createElement('div'); emp.id='g-emp';
  emp.innerHTML=`<div class="win"><div class="top"><b>${GI('temple',18,'#ffe1a0')} Обзор державы</b><button class="x">✕</button></div><div class="body"></div></div>`;
  document.body.appendChild(emp);
  const closeEmp=()=>{ emp.classList.remove('on'); if(typeof setBright==='function')setBright(false); };
  emp.querySelector('.x').onclick=closeEmp; emp.addEventListener('click',e=>{ if(e.target===emp)closeEmp(); });
  function renderEmp(){ const cap=capOf(), body=emp.querySelector('.body');
    if(!cap){ const all=LM.filter(l=>!l.aiCapital);
      let hh=`<div class="note">Столицы пока нет. Кликните поселение на карте — игра предложит сделать его стольным градом, и здесь откроется хозяйство державы.</div>`;
      hh+=`<h4>Что известно о мире</h4><div class="dim" style="margin-bottom:6px">поселений в округе: ${all.length} · разведано: ${all.length}</div>`;
      hh+=`<table><tr><th>поселение</th><th>жители</th></tr>${all.map(lm=>{ const u=!lm.capital&&!lm.aiCapital&&!lm.scouted&&!lm.rel;
        return `<tr><td>${u?'неизвестная деревня':(lm.name||STAGES[stageIdxH(lm)])}</td><td>${u?'?':fmtPop(popOf(lm.size))}</td></tr>`; }).join('')}</table>`;
      body.innerHTML=hh; return; }
    const sums=[['жители державы',fmtPop(statePop())],['казна',`${money} · ${(PLAYER.leaderId==='louis14'?1:-1)>=0?'+':''}${PLAYER.leaderId==='louis14'?1:-1}/ход`],['наука',`${sci}`]];
    let h=`<div class="sum">${sums.map(s=>`<div class="card"><div class="t">${s[0]}</div><div class="v">${s[1]}</div></div>`).join('')}</div>`;
    h+=`<div class="tabs">${[['sett','Поселения'],['trade','Торг']].map(([k,t])=>`<button class="tab${empTab===k?' on':''}" data-tab="${k}">${t}</button>`).join('')}</div>`;
    // — ПОСЕЛЕНИЯ (index.html 8141–8182): статус, что даёт державе, воля —
    const relName=lm=>lm.capital?GI('crown',13)+' столица':lm.free?GI(FREE_PROF[lm.free].ic,13,'#c9a2ff')+' вольный град':lm.rel==='ours'?GI('flag',13)+' наша':lm.rel==='trib'?GI('coins',13)+' данник':lm.rel==='prot'?GI('shield',13)+' под защитой':lm.aiCapital?'столица соперника':'независима';
    h+=`<div class="pane${empTab==='sett'?' on':''}" data-p="sett"><table><tr><th>имя</th><th>статус</th><th>жители</th><th>за ход</th><th>что даёт державе</th><th>лояльн.</th></tr>`;
    const rows=[]; LM.forEach((lm,i)=>{ if(lm.aiCapital)return; rows.push({lm,i,grp:lm.capital?0:lm.rel==='ours'?1:2,d:wdist(lm,cap)}); });
    rows.sort((a,b)=>a.grp-b.grp||a.d-b.d);
    rows.forEach(({lm,i})=>{ const g=lm._growLast!=null?Math.round(lm._growLast):null;
      const gives=lm.capital?'сердце державы':lm.rel==='ours'?`+${Math.round(popOf(lm.size)*0.5)} рук`:lm.rel==='trib'?`+${tribOf(lm)} еды/ход`:lm.rel==='prot'?'доверие зреет':'—';
      const unk=!lm.capital&&!lm.aiCapital&&!lm.scouted&&!lm.rel;       // 23.10: неразведанная — без имени/жителей/лояльности
      h+=`<tr class="rw" data-lm="${i}"><td>${unk?'<span style="opacity:.55">неизвестная</span>':(lm.name||'—')}</td><td>${relName(lm)}</td>`+
        `<td>${unk?'?':fmtPop(popOf(lm.size))}</td><td class="${g>0?'up2':g<0?'dn2':'dim'}">${unk?'—':(g==null?'—':(g>0?'+':'')+g)}</td><td>${gives}</td><td>${lm.capital?'—':lm.free?`${Math.round(lm._inf||0)} вл.`:(unk?'?':loyal(lm))}</td></tr>`; });
    h+=`</table></div>`;
    // — ТОРГ (index.html 8197–8224): свой народ, щедрость, путь, караваны, товары —
    { const tg=tradeTo, cs=content, sh=giveShare, hpop=realmPop(), norm=Math.round(hpop/30*10)/10;
      const moodWord=cs>=2?'славит щедрость правителя':cs>=1?'одет':cs>=0.5?'обносился':'ходит в лохмотьях';
      const ownUse={}; { let wantW=hpop/30*sh; for(const k of WEAR){ const t=Math.min(STORE[k]||0,wantW); if(t>0.01){ ownUse[k]=t; wantW-=t; } } }
      h+=`<div class="pane${empTab==='trade'?' on':''}" data-p="trade">
        <div class="dim" style="margin-bottom:6px">нужда: <b>${norm}</b> ед. одежды в ход на ${fmtPop(hpop)} · народ <b>${moodWord}</b> (покрыто ${Math.round(cs*100)}%) · слава <b>${Math.round(fame)}</b></div>
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px;flex-wrap:wrap">
          <span class="dim">отдаём своим:</span>
          ${[1,2,3].map(v=>`<button class="shb" data-v="${v}" style="padding:4px 11px;background:${sh===v?'#7a5a24':'#ffffff1a'};color:${sh===v?'#fff':'#cfe0f5'}">${v}× нормы</button>`).join('')}
          <span class="dim">${sh===1?'ровно по нужде — казна целее':sh===2?'с запасом: переселенцы идут охотнее':'щедро: слава растёт, товара на вывоз мало'}</span>
        </div>
        <div class="dim" style="margin-bottom:4px">путь ведёт к <b>${tg?(tg.lm.name||'соседям'):'— в округе нет чужих поселений'}</b>${tg?` (${Math.round(tg.dist*K/ctx.dxH)} ${plural(Math.round(tg.dist*K/ctx.dxH),'клетка','клетки','клеток')})`:''} · ёмкость каравана: <b>${marketLeft}</b> монет на ход${boomGood&&turn<boomUntil?` · <span class="up2">${boomGood} в цене ×1.5 (ещё ${boomUntil-turn} х.)</span>`:''}</div>`;
      if(caravans.length)h+=`<div class="dim" style="margin-bottom:6px">в пути: ${caravans.map(c=>c.buy?`за ${c.k} → ${c.to}, вернётся через ${Math.max(0,c.arrive-turn)} х. (привезёт ${c.got})`:`${c.n} ${c.k} → ${c.to}, придёт через ${Math.max(0,c.arrive-turn)} х. (+${c.gain})`).join(' · ')}</div>`;
      if(tradeMsg)h+=`<div class="trmsg">${tradeMsg}</div>`;
      h+=`<table><tr><th>товар</th><th>запас</th><th>своим/ход</th><th>цена</th><th>отправить</th><th>купить</th></tr>${
        Object.keys(PRICE).map(k=>{ const hv=haveOf(k), boost=(boomGood===k&&turn<boomUntil), bpx=Math.ceil(10*PRICE[k]*(boost?1.5:1)*1.6);
          return `<tr><td>${k}${boost?' <span class="up2">▲</span>':''}</td><td>${hv}</td><td class="dim">${ownUse[k]?Math.round(ownUse[k]*10)/10:'—'}</td>`+
            `<td>${k==='товары'?'1 = 2 монеты':`${Math.round(1/PRICE[k])} = 1 монета`}${boost?' <span class="up2">×1.5</span>':''}</td>`+
            `<td>${hv>0&&tg?`<button class="sellb" data-s="${k}" data-n="10">10</button><button class="sellb" data-s="${k}" data-n="9999">всё</button>`:`<span class="dim" title="${tg?'нет запаса':'торговать не с кем'}">—</span>`}</td>`+
            `<td>${k!=='товары'&&tg?`<button class="buyb" data-b="${k}" data-n="10" ${money>=bpx?'':'disabled'} title="купить 10 с доставкой: ~${bpx} монет (наценка ×1.6), караван туда и обратно">10 за ${bpx}</button>`:`<span class="dim">—</span>`}</td></tr>`; }).join('')}</table>`;
      h+=`<div class="note">Караван идёт до узла несколько ходов и часть груза теряет в пути — по тропам и трактам потери меньше. Покупка — караван с казной идёт туда и обратно (вдвое дольше), купцы берут наценку ×1.6. Тусклый пунктир пути горит на карте всегда (кнопка-монеты у мини-карты гасит), при открытом Обзоре — ярче; по маршруту ползёт золотой вьюк каравана. «Товары» — всё, что лежит на складе.</div></div>`; }
    body.innerHTML=h;
    body.querySelectorAll('.tab').forEach(b=>{ b.onclick=e=>{ e.stopPropagation(); empTab=b.dataset.tab;
      body.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.tab===empTab));
      body.querySelectorAll('.pane').forEach(x=>x.classList.toggle('on',x.dataset.p===empTab)); }; });
    body.querySelectorAll('.shb').forEach(b=>{ b.onclick=e=>{ e.stopPropagation(); giveShare=Math.max(1,Math.min(3,+b.dataset.v)); renderEmp(); }; });
    body.querySelectorAll('.sellb').forEach(b=>{ b.onclick=e=>{ e.stopPropagation(); caravanSend(b.dataset.s,+b.dataset.n); }; });
    body.querySelectorAll('.buyb').forEach(b=>{ b.onclick=e=>{ e.stopPropagation(); caravanBuy(b.dataset.b,+b.dataset.n); renderEmp(); }; });
    body.querySelectorAll('[data-lm]').forEach(el=>el.onclick=()=>{ const i=+el.dataset.lm; closeEmp(); flyNear(LM[i].x,LM[i].z); if(LM[i].capital)openCity(); else openVillage(i); }); }
  let empTab='sett';
  top.classList.add('clickable'); top.title='Обзор державы: сводка, поселения';
  { const yr=top.querySelector('.yr'); const ic=document.createElement('span'); ic.className='emp-ic'; ic.innerHTML=GI('temple',20,'#ffe1a0'); yr.insertBefore(ic,yr.firstChild); }
  top.onclick=()=>{ renderEmp(); emp.classList.add('on'); setBright(true); };

  // ================= ПРОМЫСЛЫ СТОЛИЦЫ (initSurvey, index.html 6596–7900): осмотр → угодья → закладка → руки/еда/склад =================
  // Перенос 15.10 по описи (DECISIONS 15.10 «экономика», п.1–14), тексты и числа — дословно из старого. Отличия помечены «НОВОЕ».
  // НЕ перенесено: мощение дорог, амбар/науки (гончарство, плуг), торговля/одежда, юниты, дань, аудиенции советников, горное пастбище.
  const CITY_DEATH_PEN=[0.15,0.15,0.15,0.12,0.05,0.02,0.0];
  const GRADE_NAME=['целина','тропа','тракт','брусчатка','шоссе','железная дорога','энергодорога'], GRADE_SPEED=[1,2,4,6,12,24,60];   // НОВОЕ: третий грейд в новом мире зовётся «тракт» (там «грунтовка»); брусчатка+ — мощение за казну
  const RES={ forest:{key:'forest',col:0x1f7a1f}, water:{key:'water',col:0x1587e0}, hills:{key:'hills',col:0xe08a1e},
              meadow:{key:'meadow',col:0x9ede1f}, steppe:{key:'steppe',col:0xd8b23c}, savanna:{key:'savanna',col:0xd98a3c} };
  const RES_RIVER={key:'rwater',col:0x49b7e8}, RES_MRIVER={key:'mwater',col:0x3fc9a0};
  // НОВОЕ: биомы нового мира → угодья старого. Джунгли — лес (охота/делянка); горы, пустыня, тундра, болото — без угодий.
  // 23.10 (Артём, «делай 3+2»): саванна — свой биом БОЛЬШОЙ ОХОТЫ (стада дичи), не дубль степи: только охота, пашни нет и с плугом
  const BIOME_OF={forest:'forest',pines:'forest',jungle:'forest',meadow:'meadow',dry:'steppe',savanna:'savanna',hills:'hills',water:'water'};
  const IND={
    hunt:{name:'Охотничий стан', per:4, tint:'#8fe08f', desc:'Ловчие бьют зверя и птицу — мясо, шкуры, кость. Первый белок и тёплая одежда для растущего племени.'},
    fish:{name:'Причал рыбарей', per:3, tint:'#7ec8ff', desc:'Рыбари ставят сети и верши. Вода кормит ровнее охоты — селение крепнет у берега, не страшась голодной зимы.'},
    lumber:{name:'Лесная делянка', per:3, tint:'#c9a56d', desc:'Лесорубы валят сосну и дуб, вяжут брёвна. Дерево — первый строительный материал: дома, частокол, лодки, топорища.'},
    quarry:{name:'Каменоломня', per:5, tint:'#f2c07a', desc:'Здесь ломают камень и добывают руду. Камень идёт на прочные стены и жернова, а из руды позже родится металл.'},
    farm:{name:'Пашня', per:6, tint:'#e0c85a', desc:'На тучных лугах распахивают первые пашни. Зерно даёт запас на зиму — с него начинается оседлость и рост города.'},
    pasture:{name:'Скотный двор', per:5, tint:'#9fc24a', desc:'Пастухи держат стада — козы, овцы, коровы. Мясо, молоко, шерсть и шкуры, а вол в упряжи тянет соху. Скот кормит и одевает там, где пашня ещё скудна.'} };
  const BIOME_IND={ forest:['hunt','lumber'], water:['fish'], rwater:['fish','hunt'], mwater:['fish','farm'], hills:['quarry'], meadow:['farm','pasture'], steppe:['pasture'], savanna:['hunt'] };
  const biomeInds=key=>{ const a=(BIOME_IND[key]||[key]).slice(); if(key==='steppe'&&sciDone.plow&&!a.includes('farm'))a.push('farm'); return a; };   // плуг: степь распахивается
  const INDMETA={
    hunt:   {res:'еда',   ic:'bow',   amp:1.0, res2:'шкуры',  amp2:0.9},
    fish:   {res:'еда',   ic:'fish',  amp:1.2},
    lumber: {res:'древесина',ic:'timber', amp:2.2},
    quarry: {res:'камень',ic:'pick',  amp:3},
    farm:   {res:'еда',   ic:'wheat', amp:4.0},
    pasture:{res:'еда',   ic:'cow',   amp:0.8, res2:'шерсть', amp2:0.8} };
  const RIVER_FISH_AMP=0.8;
  // 21.10 Артём («город в степи не растёт — неправдоподобно»): степь — лучшее пастбище, не худшее.
  // Было 0.6 (пастух не кормил и свою семью: 0.12 еды/работника при нужде 0.24) → 1.3 еды-amp и 1.3 шерсти.
  // 23.10: саванна — большая охота: еда 1.6 (лес 1.0), шкуры 1.4 (лес 0.9), зверь выбивается вдвое медленнее (стада)
  const ampFor=(ind,bk)=> (ind==='fish'&&(bk==='rwater'||bk==='mwater')) ? RIVER_FISH_AMP : (ind==='pasture'&&bk==='steppe') ? 1.3 : (ind==='hunt'&&bk==='savanna') ? 1.6 : (INDMETA[ind]?INDMETA[ind].amp:3);
  const amp2For=(ind,bk)=> (ind==='pasture'&&bk==='steppe') ? 1.3 : (ind==='hunt'&&bk==='savanna') ? 1.4 : ((INDMETA[ind]&&INDMETA[ind].amp2)||0);
  const OX_PER_CELLS=2, OX_STEP=0.10, OX_MAX=0.40, HUNT_DECAY=0.992, HUNT_DECAY_SAV=0.996;
  const huntK=r=>Math.pow(r.biome==='savanna'?HUNT_DECAY_SAV:HUNT_DECAY, r._age||0);
  const STORE_RES=['шерсть','шкуры','камень','древесина'];
  const RES_IC={'еда':'wheat','шерсть':'wool','шкуры':'hide','камень':'rock','древесина':'timber'};
  const INDUSTRIES=[], STORE={};
  let pickingSurvey=false, pickingIndustry=false, surveyOffer=false, foundPatches=[], selInd=null, curPatch=null, laborShare=null, decreeClosed=false;

  // ---------- клетки мира (CENTERS big.html), соседи через шов, осевые координаты от колонки столицы ----------
  const HX=ctx.hexes, HI=new Map(HX.map((c,i)=>[c.col+','+c.row,i]));
  const nbI=i=>ctx.neighbors(HX[i]).map(n=>HI.get(n.col+','+n.row)).filter(j=>j!==undefined);
  const capHex=()=>{ const c=capOf(); return c?HI.get(c.c.col+','+c.c.row):-1; };
  const QR=new Map(); let qC=0;
  const axial=i=>{ const h=HX[i]; let dc=h.col-qC; dc-=Math.round(dc/ctx.COLS)*ctx.COLS; const col=qC+dc; return {q:col-(h.row-(h.row&1))/2, r:h.row}; };
  const hx=i=>QR.get(i)||(QR.set(i,axial(i)),QR.get(i));
  const hdist=(a,b)=>(Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs(a.q+a.r-b.q-b.r))/2;
  const cityBodyRings=cap=>Math.max(0,Math.min(4,Math.floor((cap.size-3)/3)));
  const capCtrlR=cap=>cityBodyRings(cap)+4;
  // НОВОЕ: плодородие пашни по типу клетки (карты влажности в новом мире нет): луг 0.7, степь 0.5, у реки +0.25
  const fertOf=h=>Math.min(1,(h.type==='meadow'?0.7:(h.type==='dry'||h.type==='savanna')?0.5:0.6)+(ctx.riverDist(h.x,h.z)<HEXR*0.95?0.25:0));

  // ---------- флаги клеток (декор big.html: farm/pen/dock/indB) — исходные хранятся для отката превью и новой партии ----------
  const ORIG=new Map();
  const snap=i=>{ if(!ORIG.has(i)){ const h=HX[i]; ORIG.set(i,{pen:h.pen,farm:h.farm,dock:h.dock,indB:h.indB}); } };
  function restoreCells(cells){ for(const i of cells){ const o=ORIG.get(i); if(!o)continue; Object.assign(HX[i],o); ctx.redrawHex(HX[i]); } }
  // 16.10 (Артём: «клеток по числу людей» + «объединяющие элементы»): пашня/двор занимают ceil(люди/per) клеток —
  // обходом от целевой клетки (связное пятно); у клетки — смещения соседей и флаг «сосед в том же пятне» (изгородь/межа по внешнему краю)
  const FIELDY=ind=>ind==='farm'||ind==='pasture';
  const actN=(ind,n,w)=>FIELDY(ind)?Math.max(1,Math.min(n,Math.ceil((w||0)/IND[ind].per))):n;
  function fieldOrder(p){ const seen=new Set([p.target]), q=[p.target];
    for(let k=0;k<q.length;k++)for(const j of nbI(q[k]))if(p.set.has(j)&&!seen.has(j)){ seen.add(j); q.push(j); }
    for(const c of p.cells)if(!seen.has(c))q.push(c); return q; }
  const nbInfo=(c,act)=>{ const h=HX[c]; return ctx.neighbors(h).map(n=>{ const k=HI.get(n.col+','+n.row); return [wdx(n.x,h.x),n.z-h.z,k!==undefined&&act.has(k)?1:0]; }); };
  function applyInd(ind,p,cap,nAct){ const touched=[], set=c=>{ snap(c); touched.push(c); const h=HX[c]; h.pen=undefined; h.farm=undefined; h.indB=undefined; };
    const tgt=HX[p.target]; let bx=tgt.x, bz=tgt.z, bi=p.target;
    const ord=fieldOrder(p), act=new Set(ord.slice(0,nAct==null?ord.length:nAct));
    const th=((tgt.col*7919+tgt.row*104729)%997)/997*Math.PI, seed=(tgt.col*131+tgt.row*977)>>>0;
    const off=c=>({ox:wdx(HX[c].x,tgt.x),oz:HX[c].z-tgt.z});
    if(ind==='farm') for(const c of p.cells){ set(c); if(act.has(c))HX[c].farm={th,seed,...off(c),nb:nbInfo(c,act)}; }
    else if(ind==='pasture'){ let gc=ord[0],gd=Infinity; for(const c of act){ const d=wdist(HX[c],cap); if(d<gd){ gd=d; gc=c; } }
      for(const c of p.cells){ set(c); if(!act.has(c))continue; const nb=nbInfo(c,act);
        let gate=-1; if(c===gc){ let bd=-Infinity; const vx=wdx(cap.x,HX[c].x), vz=cap.z-HX[c].z;
          nb.forEach(([dx,dz,inn],e)=>{ if(inn)return; const d=(dx*vx+dz*vz)/Math.hypot(dx,dz); if(d>bd){ bd=d; gate=e; } }); }
        HX[c].pen={vx:cap.x,vz:cap.z,nb,gate}; } }
    else if(ind==='fish'&&p.r.key==='water'){   // озеро/море: причал на водной клетке у берега, ближней к городу (мостки от сухой соседки)
      let best=-1,bd=Infinity,land=null;
      for(const c of p.cells){ const ln=nbI(c).map(j=>HX[j]).filter(h=>h.type!=='water'); if(!ln.length)continue;
        const d=wdist(HX[c],cap); if(d<bd){ bd=d; best=c; land=ln.sort((a,b)=>wdist(a,cap)-wdist(b,cap))[0]; } }
      if(best<0)best=p.target;
      set(best); for(const c of p.cells)if(HX[c].dock&&c!==best){ set(c); HX[c].dock=undefined; }
      HX[best].dock={vx:land?land.x:cap.x,vz:land?land.z:cap.z}; bi=best; bx=HX[best].x; bz=HX[best].z; }
    else { set(p.target); HX[p.target].indB=ind; }   // стан охотника / делянка / каменоломня / рыбацкий стан на речном берегу
    for(const c of touched)ctx.redrawHex(HX[c]);
    return {touched,bi,bx,bz,act:act.size}; }
  // люди сменились → число занятых клеток другое → перерисовать пятно (вызывается из recompute)
  function refreshFields(){ const cap=capOf(); if(!cap)return;
    for(const r of INDUSTRIES){ if(!FIELDY(r.ind))continue; const n=actN(r.ind,r.cells.length,r.workers); if(n===r.act)continue;
      restoreCells(r.touched); const ap=applyInd(r.ind,{r:{key:r.biome},cells:r.cells,set:r.set,target:r.target},cap,n); r.touched=ap.touched; r.act=ap.act; } }

  // ---------- контуры угодий, подсветка поля, пунктир дороги: ленты по рёбрам гексов (через шов — от x столицы) ----------
  const svG=new THREE.Group(), hlG=new THREE.Group(), dashG=new THREE.Group(); scene.add(svG); scene.add(hlG); scene.add(dashG);
  let gBase=0;
  const clearG=g=>{ while(g.children.length){ const o=g.children.pop(); if(o.geometry)o.geometry.dispose(); if(o.material)o.material.dispose(); } };
  const yOn=(x,z)=>Math.max(heightAt(x,z),-0.62)+0.16*K;
  function ribbonMesh(cells,col){ const set=new Set(cells), pos=[], W=0.20*K, cap=capOf(), x0=cap?cap.x:0;   // 16.10: лента тоньше в 1.5 раза (было 0.30)
    const rib=(ax,az,bx,bz)=>{ let px=-(bz-az),pz=(bx-ax); const pl=Math.hypot(px,pz)||1; px=px/pl*W; pz=pz/pl*W;
      const a1x=ax+px,a1z=az+pz,a2x=ax-px,a2z=az-pz,b1x=bx+px,b1z=bz+pz,b2x=bx-px,b2z=bz-pz;
      pos.push(a1x,yOn(a1x,a1z),a1z,a2x,yOn(a2x,a2z),a2z,b1x,yOn(b1x,b1z),b1z, a2x,yOn(a2x,a2z),a2z,b2x,yOn(b2x,b2z),b2z,b1x,yOn(b1x,b1z),b1z); };
    for(const j of cells){ const h=HX[j], cx=x0+wdx(h.x,x0);
      for(const k of nbI(j)){ if(set.has(k))continue; const n=HX[k], nx=cx+wdx(n.x,h.x);
        const mx=(cx+nx)/2, mz=(h.z+n.z)/2; let ex=-(n.z-h.z), ez=nx-cx; const el=Math.hypot(ex,ez)||1; ex=ex/el*HEXR/2; ez=ez/el*HEXR/2;   // ребро — серединный перпендикуляр, длина = радиус гекса
        for(let s=0;s<3;s++){ const t0=-1+s*2/3, t1=t0+2/3; rib(mx+ex*t0,mz+ez*t0,mx+ex*t1,mz+ez*t1); } } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.92,depthTest:false,side:THREE.DoubleSide}));
    m.renderOrder=7; m.frustumCulled=false; return m; }
  function dashLine(destI,endXZ,home){ const rt=home?routeFromLm(home):route(); if(!rt)return; const ro=rt(HX[destI]); if(!ro)return; const cap=home||capOf();
    const pts=ro.pts.map(p=>p.slice());
    const sx=cap.x+wdx(pts[0][0],cap.x)-pts[0][0]; if(endXZ)pts.push([pts[pts.length-1][0]+wdx(endXZ[0],pts[pts.length-1][0]),endXZ[1]]);
    const v=[]; for(let k=0;k<pts.length-1;k++){ const [ax,az]=pts[k],[bx,bz]=pts[k+1];
      for(let s=0;s<4;s++){ const t=s/4, x=ax+(bx-ax)*t+sx, z=az+(bz-az)*t; v.push(new THREE.Vector3(x,yOn(x,z)+0.1*K,z)); } }
    const l=pts[pts.length-1]; v.push(new THREE.Vector3(l[0]+sx,yOn(l[0]+sx,l[1])+0.1*K,l[1]));
    const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),new THREE.LineDashedMaterial({color:0xffe1a0,dashSize:0.55*K,gapSize:0.4*K,transparent:true,opacity:0.95,depthTest:false}));
    ln.computeLineDistances(); ln.renderOrder=8; ln.frustumCulled=false; dashG.add(ln); }
  const setBase=()=>{ const cap=capOf(); gBase=cap?cap.x:0; };

  // ---------- путь от «родного двора» (Дейкстра на двор, кэш на ход) → грейд, время, потери ----------
  // 23.10 (Артём): промысел возит добычу не в столицу, а в БЛИЖАЙШЕЕ своё поселение (родной двор r.homeLi)
  const rtMap=new Map();
  function routeFromLm(lm){ if(!lm)return null; const k=turn+'|'+lm.c.col+','+lm.c.row;
    let e=rtMap.get(k); if(e===undefined){ if(rtMap.size>12)rtMap.clear(); e=ctx.routeTree(lm.c); rtMap.set(k,e); } return e; }
  function route(){ return routeFromLm(capOf()); }
  function homeOfI(bi){ const cap=capOf(); if(!cap||bi<0)return -1; let best=-1,bd=Infinity;
    LM.forEach((l,li)=>{ if(!l.capital&&l.rel!=='ours')return; const d=wdist(HX[bi],l); if(d<bd){ bd=d; best=li; } });
    return best; }
  const homeOf=r=>{ const lm=r.homeLi!=null?LM[r.homeLi]:null; return (lm&&(lm.capital||lm.rel==='ours'))?lm:capOf(); };
  function roadInfo(destI,paved,home){ const cap=home||capOf(), rt=routeFromLm(cap), ro=rt&&destI>=0?rt(HX[destI]):null;
    const L=ro?Math.max(1,ro.L):Math.max(1,Math.round(wdist(HX[destI],cap)/ctx.dxH));
    const grade=Math.max(ro?(ro.avg<0.5?0:ro.avg<1.5?1:2):0,paved||0), speed=GRADE_SPEED[grade];   // НОВОЕ: грейд пути = средний по рёбрам (целина 0, тропа 1, тракт 2)
    const T=Math.max(1,Math.ceil(L/speed)), rq=Math.min(1,0.3+grade*0.12);
    return {L,grade,gradeName:GRADE_NAME[grade],speed,T,rq}; }
  function deliv(r){ const hm=homeOf(r), ri=roadInfo(r.bi,r.paved,hm); ri.home=hm;
    let loss=Math.min(0.7,ri.L*0.03*(1-0.6*ri.rq))*sciMods.spoil;   // гончарство: −25% потерь
    if(PLAYER.leaderId==='peter1')loss*=0.85;                    // Пётр I: флот и верфи — в дороге теряем меньше
    if(r.res!=='еда')loss*=0.2;                                 // руда/камень почти не портятся
    const eta=Math.max(0.3,1-loss), ramp=Math.min(1,(r._age||0)/ri.T);
    return Object.assign(ri,{eta,ramp,frac:eta*ramp}); }

  // ---------- руки, выработка, еда (index.html 7207–7274) ----------
  function laborPool(){ const c=capOf(); if(!c)return 0; let p=popOf(c.size)*0.5;
    LM.forEach(l=>{ if(l.rel==='ours'&&!l.capital)p+=popOf(l.size)*0.5; });                  // вошедшие деревни отдают руки державе
    return Math.round(p); }
  const courtPool=lm=>Math.round(popOf(lm.size)*0.5);                  // 24.10 «дворы»: руки двора — половина ЕГО жителей
  function allocCourt(ixs,pool){                                       // раскладка рук одного двора по его промыслам (логика прежнего общего allocWorkers)
    const caps=ixs.map(i=>INDUSTRIES[i].cells.length*IND[INDUSTRIES[i].ind].per);
    let free=pool;
    ixs.forEach((ii,k)=>{ const r=INDUSTRIES[ii]; if(r.lockW!=null){ r.workers=Math.max(0,Math.min(caps[k],Math.min(r.lockW,free))); free-=r.workers; } });
    const fi=[], mi=[];
    ixs.forEach((ii,k)=>{ if(INDUSTRIES[ii].lockW!=null)return; (INDUSTRIES[ii].res==='еда'?fi:mi).push(k); });
    const cf=fi.reduce((s,k)=>s+caps[k],0), cm=mi.reduce((s,k)=>s+caps[k],0);
    let shF=laborShare==null?(cf+cm>0?cf/(cf+cm):0):laborShare;
    if(!fi.length)shF=0; else if(!mi.length)shF=1;
    let wantF=Math.min(cf,Math.round(free*shF));
    let wantM=Math.min(cm,free-wantF);
    wantF=Math.min(cf,wantF+Math.max(0,free-wantF-wantM));
    const spread=(ks,budget)=>{ const c=ks.map(k=>caps[k]); const tot=c.reduce((a,b)=>a+b,0);
      if(tot<=0||budget<=0){ ks.forEach(k=>INDUSTRIES[ixs[k]].workers=0); return; }
      if(budget>=tot){ ks.forEach((k,j)=>INDUSTRIES[ixs[k]].workers=c[j]); return; }
      const exact=c.map(x=>budget*x/tot), base=exact.map(Math.floor);
      let used=base.reduce((a,b)=>a+b,0);
      const order=exact.map((x,j)=>({j,frac:x-base[j]})).sort((a,b)=>b.frac-a.frac);
      for(let q=0;used<budget;q++,used++)base[order[q%order.length].j]++;
      ks.forEach((k,j)=>INDUSTRIES[ixs[k]].workers=Math.min(c[j],base[j])); };
    spread(fi,wantF); spread(mi,wantM); }
  function allocWorkers(){                                             // 24.10 (Артём, «как столица»): у каждого двора СВОИ руки на СВОИХ промыслах
    const cap=capOf(); if(!cap){ INDUSTRIES.forEach(r=>{ r.workers=0; }); return; }
    const capLi=LM.indexOf(cap);
    const groups=new Map();
    INDUSTRIES.forEach((r,i)=>{ const li=(r.homeLi!=null&&r.homeLi>=0&&LM[r.homeLi])?r.homeLi:capLi;
      if(!groups.has(li))groups.set(li,[]); groups.get(li).push(i); });
    INDUSTRIES.forEach(r=>{ r.workers=0; });
    groups.forEach((ixs,li)=>allocCourt(ixs,courtPool(LM[li]||cap))); }
  const SAT=1-Math.exp(-1/0.6);
  function rawYield(r,amp){ const per=IND[r.ind].per, A=r.cells.length*amp, C=Math.max(1,r.cells.length*per*0.6); return A*(1-Math.exp(-r.workers/C))/SAT; }
  function oxBonus(){ let past=0; INDUSTRIES.forEach(r=>{ if(r.ind==='pasture')past+=r.cells.length; }); return Math.min(OX_MAX,Math.floor(past/OX_PER_CELLS)*OX_STEP); }
  function fieldFert(r){ if(r._fert===undefined){ let s=0; for(const ci of r.cells)s+=fertOf(HX[ci]); r._fert=r.cells.length?s/r.cells.length:0.5; } return r._fert; }
  function yieldOf(r){ let y=rawYield(r,r.amp);
    if(r.ind==='farm')y*=(0.6+0.8*fieldFert(r));
    if(r.ind==='farm')y*=(1+oxBonus());
    if(r.ind==='hunt')y*=huntK(r);
    return Math.round(y); }
  function yield2Of(r){ if(!r.amp2)return 0; let y=rawYield(r,r.amp2); if(r.ind==='hunt')y*=huntK(r); return Math.round(y*10)/10; }
  function recompute(){ INDUSTRIES.forEach(r=>{ r.homeLi=homeOfI(r.bi); });   // родной двор СНАЧАЛА: от него зависят руки (деревня вошла — промыслы переподключатся)
    allocWorkers(); INDUSTRIES.forEach(r=>{ const idle=r._conv>0;      // 23.10: перестройка пашня↔выпас — ход без добычи
    r.perTurn=idle?0:yieldOf(r); r.perTurn2=idle?0:yield2Of(r); }); refreshFields(); }
  const needOf=lm=>Math.round(popOf(lm.size)*0.12*(sciDone.pottery?0.85:1));   // нужда двора в еде; варка (гончарство) — той же едой на 15% больше
  function capNeed(){ const c=capOf(); return c?needOf(c):0; }
  function foodDeliveredPerTurn(li){ const cap=capOf(); if(li==null)li=cap?LM.indexOf(cap):-1;   // еда двора li (по умолчанию — столицы)
    let f=0; INDUSTRIES.forEach(r=>{ if(r.res==='еда'&&r.homeLi===li)f+=r.perTurn*deliv(r).frac; }); return Math.round(f); }

  // ---------- плашка советника: значки и кнопки (index.html 6439–6467) ----------
  const ICON={
    sage:`<svg viewBox="0 0 48 48" fill="#ffe1a0"><path d="M9 46 C9 34 16 30 24 30 C32 30 39 34 39 46 Z"/><path d="M24 3 C15 3 12 15 13 24 C13.4 27 16 28 18 26.5 C16.6 19 18.5 11 24 11 C29.5 11 31.4 19 30 26.5 C32 28 34.6 27 35 24 C36 15 33 3 24 3 Z"/><circle cx="24" cy="20.5" r="6"/><path d="M18.5 24 C19 30 21.5 37 24 37 C26.5 37 29 30 29.5 24 C27.6 26.4 26 27 24 27 C22 27 20.4 26.4 18.5 24 Z"/></svg>`,
    point:`<svg viewBox="0 0 24 24" fill="#ffe1a0"><path d="M5 2.5 L5 19 L9.2 14.8 L12.2 21 L14.8 19.8 L11.7 13.7 L17.5 13.7 Z"/></svg>`,
    look:`<svg viewBox="0 0 48 48" fill="#ffe1a0"><path d="M24 12 C34 12 42 19.5 45 24 C42 28.5 34 36 24 36 C14 36 6 28.5 3 24 C6 19.5 14 12 24 12 Z"/><circle cx="24" cy="24" r="7" fill="#16243a"/><circle cx="24" cy="24" r="3.4" fill="#ffe1a0"/></svg>`,
    done:`<svg viewBox="0 0 48 48" fill="#ffe1a0"><path d="M8 27 L13 21.6 L19.5 28.4 L35.2 9.5 L40.5 14 L19.8 38.5 Z"/></svg>` };
  { const st=document.createElement('style'); st.textContent=`
    #g-task .g-act{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-width:0;cursor:pointer}
    #g-task .g-emb{width:46px;height:46px;filter:drop-shadow(0 2px 4px #0006)}
    #g-task .g-emb svg{display:block;width:100%;height:100%}
    #g-task .g-emb-lbl{margin-top:1px;color:#ffe1a0;font-weight:700;font-size:8px;line-height:1.12;letter-spacing:.1px;max-width:74px;opacity:.9}
    #g-task.on .g-act.act-look .g-emb{animation:g-emb-pulse 1.8s ease-in-out infinite}
    #g-task .g-act.act-point .g-emb{animation:g-point 1.4s ease-in-out infinite}
    #g-task .g-act[data-act]{padding:2px 6px;border-radius:10px}
    #g-task .g-act[data-act]:hover{background:#ffffff14}
    @keyframes g-emb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    @keyframes g-point{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}`;
    document.head.appendChild(st); }
  function taskHTML(o){ const icon=o.icon||ICON.sage; let act='';
    if(o.acts) act=o.acts.map(a=>`<div class="g-act act-look" data-act="${a.id}"><div class="g-emb">${ICON[a.icon]||ICON.look}</div><div class="g-emb-lbl">${a.label}</div></div>`).join('');
    else if(o.cta){ const prompt=o.ctaKind==='prompt'; act=`<div class="g-act ${prompt?'act-point':'act-look'}"><div class="g-emb">${prompt?ICON.point:ICON.look}</div><div class="g-emb-lbl">${o.cta}</div></div>`; }
    return `<div class="g-ico">${icon}</div><div class="g-txt"><div class="g-body">${o.body}</div></div>${act}`; }

  // ---------- слой 1: после основания — напоминание; по клику — осмотр округи (index.html 6656–6891) ----------
  function onCapitalFounded(){ uInitScout(); rInit(); clearG(svG); pickingSurvey=true; drawZones(); routesBtn.style.display='flex'; redrawRoute();
    setTask({ body:'Мудрый советник склонился пред тобою: «Дозволь, Правитель, обойти окрестные земли — сочту, где чащи для ловчих, где вода для рыбарей, где камень для зодчих».',
      cta:'осмотреть округу', ctaKind:'button' });
    banner.classList.add('on'); }
  function reveal(){
    if(!pickingSurvey)return;
    clearG(svG);
    const cap=capOf(); if(!cap)return; const ci=capHex(); if(ci<0)return;
    qC=HX[ci].col; QR.clear(); setBase();
    const PATCHMAX=7, SCANR=capCtrlR(cap);
    const fromLm=surveyFromLi!=null?LM[surveyFromLi]:null;             // 23.10: осмотр из деревни — только её 4 кольца
    const ring=new Map(); let fr=[];
    if(fromLm){ const vi=HI.get(fromLm.c.col+','+fromLm.c.row), VR=capCtrlR(fromLm);   // 24.10: округа двора растёт с ним
      if(vi!==undefined){ ring.set(vi,0); fr=[vi];
        for(let d=1;d<=VR;d++){ const nx=[]; for(const i of fr)for(const j of nbI(i)){ if(ring.has(j))continue; ring.set(j,d===0?0:2); nx.push(j); } fr=nx; } } }   // d=2: первое кольцо деревни НЕ резервируем
    else {
      ring.set(ci,0); fr=[ci];
      for(let d=1;d<=SCANR;d++){ const nx=[]; for(const i of fr)for(const j of nbI(i)){ if(ring.has(j))continue; ring.set(j,d); nx.push(j); } fr=nx; }
      for(const l of LM){ if(l.rel!=='ours'||l.capital)continue; const vi=HI.get(l.c.col+','+l.c.row); if(vi===undefined)continue;   // вошедшие деревни: их округа — тоже под промыслы
        const r2=new Set([vi]); let f2=[vi]; const VR2=capCtrlR(l);
        for(let d=1;d<=VR2;d++){ const nx=[]; for(const i of f2)for(const j of nbI(i)){ if(r2.has(j))continue; r2.add(j); nx.push(j); } f2=nx; }
        r2.forEach(i=>{ if(!ring.has(i))ring.set(i,99); }); } }
    const taken=new Set(); INDUSTRIES.forEach(r=>r.cells.forEach(c=>taken.add(c)));
    const distC=i=>hdist(hx(i),hx(ci));
    const typeOf=new Map();
    ring.forEach((d,i)=>{ if(d<=1||taken.has(i))return; const h=HX[i];   // ближний ряд столицы свободен под застройку; занятые угодья пропускаем
      if(h.type==='village')return;
      if(h.type!=='water'&&ctx.riverDist(h.x,h.z)<HEXR*0.35){          // НОВОЕ: русло через середину клетки (как у декора деревень); широкий плёс (≥3 соседей-вода) — дальше
        let ww=0; for(const j of nbI(i))if(HX[j].type==='water')ww++; if(ww<3)return; }
      const bk=BIOME_OF[h.type]; if(!bk)return;
      const bank=h.type!=='water'&&ctx.riverDist(h.x,h.z)<HEXR*0.95;    // НОВОЕ: «берег у русла» — река проходит через клетку или вплотную
      if(bk==='forest'&&bank){ typeOf.set(i,RES_RIVER); return; }
      if(bk==='meadow'&&bank){ typeOf.set(i,RES_MRIVER); return; }
      typeOf.set(i,RES[bk]); });
    const sameNbr=(j,r)=>nbI(j).filter(ni=>{ const nr=typeOf.get(ni); return nr&&nr.key===r.key; });
    const seen=new Set(), patches=[];
    typeOf.forEach((r,i)=>{ if(seen.has(i))return;
      const comp=[], st=[i]; seen.add(i);
      while(st.length){ const j=st.pop(); comp.push(j); sameNbr(j,r).forEach(ni=>{ if(!seen.has(ni)){ seen.add(ni); st.push(ni); } }); }
      const n=comp.length, cells=[...comp];
      const SN=j=>sameNbr(j,r);
      const conn=arr=>{ if(arr.length<=1)return true; const set=new Set(arr),seen2=new Set([arr[0]]),st2=[arr[0]];
        while(st2.length){ const c=st2.pop(); SN(c).forEach(ni=>{ if(set.has(ni)&&!seen2.has(ni)){ seen2.add(ni); st2.push(ni); } }); } return seen2.size===arr.length; };
      const dumb=arr=>{ if(arr.length<4)return false; const set=new Set(arr);
        for(const cut of arr){ const rest=arr.filter(x=>x!==cut); const vis=new Set(),blocks=[];
          for(const s0 of rest){ if(vis.has(s0))continue; const cc=[],q=[s0]; vis.add(s0);
            while(q.length){ const c=q.pop(); cc.push(c); SN(c).forEach(ni=>{ if(set.has(ni)&&ni!==cut&&!vis.has(ni)){ vis.add(ni); q.push(ni); } }); } blocks.push(cc); }
          blocks.sort((a,b)=>b.length-a.length); if(blocks.length>=2&&blocks[1].length>=2)return true; } return false; };
      const splitInto=(k)=>{
        const seeds=[]; { let s=cells[0],bd=-1; cells.forEach(j=>{ const d=distC(j); if(d>bd){ bd=d; s=j; } }); seeds.push(s); }
        while(seeds.length<k){ let s=-1,bd=-1; cells.forEach(j=>{ let md=Infinity; seeds.forEach(sd=>{ const d=hdist(hx(j),hx(sd)); if(d<md)md=d; }); if(md>bd){ bd=md; s=j; } }); seeds.push(s); }
        const owner=new Map(); cells.forEach(j=>{ let bi=0,bd=Infinity; seeds.forEach((sd,si)=>{ const d=hdist(hx(j),hx(sd)); if(d<bd){ bd=d; bi=si; } }); owner.set(j,bi); });
        const pc=si=>cells.filter(j=>owner.get(j)===si);
        const repair=()=>{ for(let pass=0;pass<n+2;pass++){ let dirty=false;
            for(let si=0;si<k;si++){ const mine=pc(si); if(mine.length<=1)continue; const seen3=new Set(),comps=[];
              for(const s0 of mine){ if(seen3.has(s0))continue; const cc=[],st3=[s0]; seen3.add(s0);
                while(st3.length){ const j=st3.pop(); cc.push(j); SN(j).forEach(ni=>{ if(owner.get(ni)===si&&!seen3.has(ni)){ seen3.add(ni); st3.push(ni); } }); } comps.push(cc); }
              if(comps.length<=1)continue; dirty=true; comps.sort((a,b)=>b.length-a.length);
              for(let c=1;c<comps.length;c++){ const orph=comps[c]; let tgt=-1;
                for(const j of orph){ for(const ni of SN(j)){ const o=owner.get(ni); if(o!==si){ tgt=o; break; } } if(tgt>=0)break; }
                if(tgt<0)tgt=si; orph.forEach(j=>owner.set(j,tgt)); } }
            if(!dirty)break; } };
        const stays=(j,oj)=>conn(pc(oj).filter(x=>x!==j));
        repair();
        for(let it=0;it<n*8&&k>1;it++){ const c=cells.reduce((a,j)=>(a[owner.get(j)]++,a),new Array(k).fill(0));
          const order=[...c.keys()].sort((a,b)=>c[a]-c[b]); const big=order[order.length-1];
          if(c[big]-c[order[0]]<=1)break; let moved=false;
          for(const sm of order){ if(c[sm]>=c[big])break;
            for(const j of cells){ const oj=owner.get(j); if(oj===sm||c[oj]<=c[sm]+1)continue;
              if(!SN(j).some(ni=>owner.get(ni)===sm)||!stays(j,oj))continue;
              if(dumb([...pc(sm),j])||dumb(pc(oj).filter(x=>x!==j)))continue;
              owner.set(j,sm); moved=true; break; }
            if(moved)break; }
          if(!moved)break; }
        repair();
        for(let pass=0;pass<3;pass++){ let fixed=false;
          for(let si=0;si<k;si++){ const piece=pc(si); if(!dumb(piece))continue;
            let give=null; const set=new Set(piece);
            for(const cut of piece){ const rest=piece.filter(x=>x!==cut); const vis=new Set(),blocks=[];
              for(const s0 of rest){ if(vis.has(s0))continue; const cc=[],q=[s0]; vis.add(s0);
                while(q.length){ const c2=q.pop(); cc.push(c2); SN(c2).forEach(ni=>{ if(set.has(ni)&&ni!==cut&&!vis.has(ni)){ vis.add(ni); q.push(ni); } }); } blocks.push(cc); }
              blocks.sort((a,b)=>b.length-a.length); if(blocks.length>=2&&blocks[1].length>=2){ give=blocks[blocks.length-1]; break; } }
            if(!give)continue; const gset=new Set(give);
            const tc=new Map(); give.forEach(j=>SN(j).forEach(ni=>{ const o=owner.get(ni); if(o!==si&&!gset.has(ni))tc.set(o,(tc.get(o)||0)+1); }));
            let tgt=-1,bt=0; tc.forEach((v,o)=>{ if(v>bt){ bt=v; tgt=o; } }); if(tgt<0)continue;
            const tAfter=[...pc(tgt),...give]; if(tAfter.length>PATCHMAX||dumb(tAfter)||!conn(tAfter))continue;
            const gAfter=piece.filter(j=>!gset.has(j)); if(gAfter.length&&!conn(gAfter))continue;
            give.forEach(j=>owner.set(j,tgt)); fixed=true; }
          if(!fixed)break; }
        const pieces=Array.from({length:k},()=>[]); owner.forEach((v,j)=>pieces[v].push(j)); return pieces; };
      const greedyFit=()=>{ const un=new Set(cells), out=[];
        while(un.size){ const rem=un.size, target=Math.ceil(rem/Math.max(1,Math.ceil(rem/PATCHMAX)));
          let cq=0,cr=0; un.forEach(j=>{ cq+=hx(j).q; cr+=hx(j).r; }); const ct={q:cq/rem,r:cr/rem};
          let seed=-1,bd=-1; un.forEach(j=>{ const d=hdist(hx(j),ct); if(d>bd){ bd=d; seed=j; } });
          const blob=new Set([seed]); un.delete(seed);
          while(blob.size<target){ const cand=new Set(); blob.forEach(j=>SN(j).forEach(ni=>{ if(un.has(ni))cand.add(ni); }));
            if(!cand.size)break;
            let bq=0,br=0; blob.forEach(j=>{ bq+=hx(j).q; br+=hx(j).r; }); const bc={q:bq/blob.size,r:br/blob.size};
            let bj=-1,bnb=-1,bd2=Infinity;
            cand.forEach(j=>{ const nb=SN(j).filter(ni=>blob.has(ni)).length, d=hdist(hx(j),bc); if(nb>bnb||(nb===bnb&&d<bd2)){ bnb=nb; bd2=d; bj=j; } });
            blob.add(bj); un.delete(bj); }
          out.push([...blob]); }
        return out; };
      const packFit=()=>{ const un=new Set(cells), out=[]; const nbrIn=(j,set)=>SN(j).filter(ni=>set.has(ni));
        while(un.size){ const rem=un.size, target=Math.min(PATCHMAX,Math.ceil(rem/Math.max(1,Math.ceil(rem/PATCHMAX))));
          let seed=-1,bn=99; un.forEach(j=>{ const d=nbrIn(j,un).length; if(d<bn){ bn=d; seed=j; } });
          const blob=new Set([seed]); un.delete(seed);
          while(blob.size<target&&un.size){ const cand=[]; blob.forEach(j=>nbrIn(j,un).forEach(ni=>{ if(!cand.includes(ni))cand.push(ni); }));
            if(!cand.length)break;
            const safe=cand.filter(j=>{ const rest=[...un].filter(x=>x!==j); return !rest.length||conn(rest); });
            let pool=safe.length?safe:cand;
            const nice=pool.filter(j=>!dumb([...blob,j])); if(nice.length)pool=nice;
            let bq=0,br=0; blob.forEach(j=>{ bq+=hx(j).q; br+=hx(j).r; }); const bc={q:bq/blob.size,r:br/blob.size};
            let bj=-1,bnb=-1,bd=Infinity;
            pool.forEach(j=>{ const nb=nbrIn(j,blob).length, d=hdist(hx(j),bc); if(nb>bnb||(nb===bnb&&d<bd)){ bnb=nb; bd=d; bj=j; } });
            blob.add(bj); un.delete(bj); }
          out.push([...blob]); }
        const adjac=(a,b)=>a.some(j=>SN(j).some(ni=>b.includes(ni)));
        for(let merged=true;merged;){ merged=false; out.sort((a,b)=>a.length-b.length);
          outer: for(let i=0;i<out.length;i++)for(let k2=i+1;k2<out.length;k2++){ const sum=out[i].concat(out[k2]);
            if(sum.length<=PATCHMAX&&adjac(out[i],out[k2])&&!dumb(sum)){ out[i]=sum; out.splice(k2,1); merged=true; break outer; } } }
        for(let i=out.length-1;i>=0;i--){ if(out[i].length>=2)continue;
          const cell=out[i][0]; let tgt=-1,best=99;
          out.forEach((f,k2)=>{ if(k2===i||f.length>=PATCHMAX||!f.some(j=>SN(j).includes(cell)))return; const sc=f.length+(dumb([...f,cell])?100:0); if(sc<best){ best=sc; tgt=k2; } });
          if(tgt>=0){ out[tgt].push(cell); out.splice(i,1); } }
        return out; };
      const scoreOf=pl=>{ const real=pl.filter(p=>p.length>=2), sz=real.map(p=>p.length);
        return { real, fields:real.length, lost:pl.reduce((s,p)=>s+(p.length<2?p.length:0),0), dumb:real.filter(p=>dumb(p)).length, spread:sz.length?Math.max(...sz)-Math.min(...sz):0 }; };
      let k=Math.max(1,Math.ceil(n/PATCHMAX)), A=splitInto(k);
      while(k<n&&Math.max(0,...A.map(p=>p.length))>PATCHMAX){ k++; A=splitInto(k); }
      const better=(x,y)=>(x.fields!==y.fields?(x.fields<y.fields):x.lost!==y.lost?(x.lost<y.lost):x.dumb!==y.dumb?(x.dumb<y.dumb):x.spread<=y.spread)?x:y;
      const win=better(better(scoreOf(A),scoreOf(greedyFit())),scoreOf(packFit()));
      win.real.forEach(pc=>patches.push({r,cells:pc})); });
    patches.forEach(p=>svG.add(ribbonMesh(p.cells,p.r.col)));
    const anchor=fromLm||cap, where=fromLm?`вкруг деревни «${fromLm.name||'—'}»`:'вкруг города';
    foundPatches=patches.map(p=>{ const set=new Set(p.cells);
      let target=p.cells[0], bd=Infinity;                                   // целевая клетка = ближняя к родному двору ПО ПРЯМОЙ
      p.cells.forEach(j=>{ const d=wdist(HX[j],anchor); if(d<bd){ bd=d; target=j; } });
      return {r:p.r,cells:p.cells,set,target,cx:HX[target].x,cz:HX[target].z}; });
    glog(`Округа ${fromLm?`«${fromLm.name||''}» `:''}осмотрена: найдено ${patches.length} ${plural(patches.length,'угодье','угодья','угодий')}`);
    if(patches.length===0){
      pickingSurvey=false; pickingIndustry=false;
      setTask({ body:`Советник воротился ни с чем: годных угодий ${where} не высмотрел. Что ж, вершим ход, Правитель.` }); banner.classList.remove('on');
      return; }
    pickingSurvey=false; pickingIndustry=true;
    setTask({ body:`Советник воротился с обходом: высмотрел <b>${patches.length}</b> ${plural(patches.length,'угодье','угодья','угодий')} под промысел ${where}. Укажи, Правитель, за какое взяться${INDUSTRIES.length?' — кликни по угодью':' первым'}.`,
      ...(INDUSTRIES.length?{acts:[{id:'wait',label:'обождёт',icon:'done'}]}:{cta:'кликни по угодью',ctaKind:'prompt'}) }); }   // 25.10 (Артём): «передумал» — кнопка отказа (первый промысел обязателен, без неё)

  // ---------- слой 2: панель выбора промысла, превью, закладка (index.html 7035–7132) ----------
  { const st=document.createElement('style'); st.textContent=`
    #g-ind{position:fixed;right:18px;bottom:150px;z-index:12;width:272px;display:none;
      background:linear-gradient(#20344f,#141f31);color:#eaf1fb;border:1px solid #ffd98a55;border-radius:14px;
      box-shadow:0 14px 40px #000a;font-family:system-ui,sans-serif;padding:16px 17px 15px}
    #g-ind.on{display:block;animation:g-fade .25s ease}
    #g-ind h4{margin:0 0 2px;font-size:16px;color:#ffe1a0;display:flex;align-items:center;gap:8px}
    #g-ind .dot{width:12px;height:12px;border-radius:3px;flex:0 0 auto}
    #g-ind p{margin:8px 0 0;font-size:13px;line-height:1.5;opacity:.94}
    #g-ind .row{margin-top:11px;font-size:12.5px;opacity:.82}
    #g-ind .row b{color:#ffe1a0}
    #g-ind .soon{margin-top:7px;font-size:11.5px;opacity:.6;font-style:italic}
    #g-ind .go{margin-top:13px;width:100%;border:0;border-radius:10px;padding:10px;cursor:pointer;
      font-size:14px;font-weight:800;color:#2a1a06;background:linear-gradient(#f4cd7e,#c98a2f);box-shadow:0 4px 12px #0005}
    #g-ind .go:hover{filter:brightness(1.06)}
    #g-ind .ch{display:flex;gap:7px;margin-top:10px}
    #g-ind .chip{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 6px;border-radius:9px;cursor:pointer;
      border:1px solid #ffffff22;background:#ffffff0f;color:#dfe8f5;font-size:12px;font-weight:700;font-family:system-ui}
    #g-ind .chip:hover{background:#ffffff1c}
    #g-ind .chip.sel{border-color:#ffd98a;background:#ffd98a26;color:#ffe9c2}
    #g-ind .chip .cdot{width:10px;height:10px;border-radius:3px;flex:0 0 auto}`;
    document.head.appendChild(st); }
  const indP=document.createElement('div'); indP.id='g-ind'; document.body.appendChild(indP);
  let prevApplied=null;                                                // клетки превью (откат при отмене/смене выбора)
  function clearPreview(){ if(prevApplied){ restoreCells(prevApplied.touched); prevApplied=null; } clearG(dashG); }
  // 16.10 (Артём: «мягкий запрет»): вместо «свободных рук ≥ трети мест» — пробная раскладка с новым промыслом
  // (тот же allocWorkers: люди делятся между всеми). Нельзя, только если новому не достаётся и трети мест.
  function simHands(p){ const meta=INDMETA[selInd]||{res:'еда'};
    const before=INDUSTRIES.map(r=>r.workers);
    INDUSTRIES.push({ind:selInd,cells:p.cells,res:meta.res,lockW:null,workers:0,homeLi:homeOfI(p.target)}); allocWorkers();
    const nw=INDUSTRIES.pop().workers, after=INDUSTRIES.map(r=>r.workers);
    allocWorkers();
    return {nw,moves:INDUSTRIES.map((r,i)=>({name:r.name,from:before[i],to:after[i]})).filter(m=>m.to<m.from)}; }
  function handsShort(p){ if(INDUSTRIES.length===0)return null;
    const need=Math.ceil(p.cells.length*IND[selInd].per/3), s=simHands(p);
    return s.nw<need?{got:s.nw,need}:null; }
  function openPanel(p){ const inds=biomeInds(p.r.key); const m=IND[selInd]; const people=p.cells.length*m.per;
    const choice=inds.length>1?`<div class="ch">`+inds.map(id=>`<button class="chip${id===selInd?' sel':''}" data-ind="${id}"><span class="cdot" style="background:${IND[id].tint}"></span>${IND[id].name}</button>`).join('')+`</div>`:'';
    const short=handsShort(p), sim=INDUSTRIES.length?simHands(p):null, took=sim?sim.moves.reduce((s,x)=>s+x.from-x.to,0):0;
    const movesTxt=sim&&sim.moves.length?`<div class="row">Свободных рук мало — советник переведёт людей: ${sim.moves.map(x=>`${x.name.toLowerCase()} <b>${x.from} → ${x.to}</b>`).join(', ')}. На новое дело встанут <b>${sim.nw}</b> из ${people}.</div>`:'';
    indP.innerHTML=`<h4><span class="dot" style="background:${m.tint}"></span>${m.name}</h4>
      ${choice}
      <p>${m.desc}</p>
      <div class="row">Угодье: <b>${p.cells.length}</b> ${plural(p.cells.length,'клетка','клетки','клеток')} · займёт <b>~${people}</b> ${plural(people,'человек','человека','человек')}</div>
      ${short?`<div class="row" style="color:#c96a3f">Советник качает головой: даже если снять людей с других дел, на новое встанут лишь <b>${short.got}</b>, а надобно хотя бы <b>${short.need}</b>. Пусть сперва народ прибудет.</div>`
             :movesTxt||`<div class="soon">Доход вызревает — подсчитаем в следующих ходах.</div>`}
      <button class="go" type="button" ${short?'disabled style="opacity:.55;cursor:default"':''}>${!short&&took?`Заложить (снять ${took} ${plural(took,'человека','человек','человек')})`:'Заложить промысел'}</button>`;
    indP.querySelectorAll('.chip').forEach(btn=>btn.onclick=()=>{ selInd=btn.dataset.ind; renderBuilding(); openPanel(p); });
    if(!short)indP.querySelector('.go').onclick=()=>commit(p);
    closeVillage(); closeCity(); closeRes(); indP.classList.add('on'); }
  function closePanel(){ indP.classList.remove('on'); }
  function renderBuilding(){ const p=curPatch, cap=capOf(); if(!p||!cap)return;   // НОВОЕ: превью — сразу настоящий вид: здание + пашня/загон по всем клеткам
    if(prevApplied)restoreCells(prevApplied.touched);
    const nw=INDUSTRIES.length?simHands(p).nw:(h=>h>=0?courtPool(LM[h]):laborPool())(homeOfI(p.target));   // превью — руки СВОЕГО двора
    prevApplied=applyInd(selInd,p,cap,actN(selInd,p.cells.length,nw));
    clearG(dashG); { const hi=homeOfI(prevApplied.bi); dashLine(prevApplied.bi,null,hi>=0?LM[hi]:null); } }
  function preview(p){ clearPreview(); curPatch=p; selInd=biomeInds(p.r.key)[0]; renderBuilding(); openPanel(p); }
  function commit(p){
    if(handsShort(p))return;
    pickingIndustry=false; clearG(svG); closePanel(); clearG(dashG);
    const ap=prevApplied||applyInd(selInd,p,capOf()); prevApplied=null;
    const nm=IND[selInd].name, meta=INDMETA[selInd]||{res:'еда',ic:'wheat',amp:3};
    const rec={ ind:selInd, name:nm, biome:p.r.key, tint:IND[selInd].tint, col:p.r.col, cells:p.cells.slice(), set:new Set(p.cells), target:p.target,
      bi:ap.bi, bx:ap.bx, bz:ap.bz, touched:ap.touched, act:ap.act, res:meta.res, ic:meta.ic, amp:ampFor(selInd,p.r.key), res2:meta.res2||null, amp2:amp2For(selInd,p.r.key),
      workers:0, perTurn:0, total:0, perTurn2:0, total2:0, _age:0, _built:turn };
    INDUSTRIES.push(rec); recompute();
    surveyOffer=true;
    const fem=selInd==='lumber'||selInd==='quarry'||selInd==='farm';   // НОВОЕ: род («Заложен каменоломня» в старом — опечатка рода)
    setTask({ body:`Заложен${fem?'а':''} <b>${nm.toLowerCase()}</b>. Люди взялись за дело — округа оживает. Дозволишь, Правитель, обойти земли ещё раз — вдруг сыщутся и другие угодья?`,
      acts:[{id:'more',label:'осмотреть ещё',icon:'look'},{id:'enough',label:'хватит пока',icon:'done'}] });
    banner.classList.add('on');
    glog(`Заложен промысел: ${nm}`); }
  function holdTurn(){ return (pickingSurvey||pickingIndustry)&&INDUSTRIES.length===0; }   // держим ход только пока не заложен ПЕРВЫЙ промысел
  let surveyFromLi=null;                                               // 23.10: осмотр из карточки деревни — только ЕЁ округа
  function rescan(li){ if(pickingCapital||pickingSurvey||pickingIndustry)return;
    surveyFromLi=(li!=null&&LM[li]&&LM[li].rel==='ours')?li:null;
    closeCity(); closeRes(); surveyOffer=false; pickingSurvey=true; reveal(); banner.classList.add('on'); }
  function cancelPick(){ if(pickingSurvey||pickingIndustry||surveyOffer){
    const repeat=INDUSTRIES.length>0;
    pickingSurvey=false; pickingIndustry=false; surveyOffer=false; clearG(svG); clearPreview(); closePanel(); curPatch=null;
    banner.classList.remove('on');
    if(repeat)glog('Осмотр отложен до другого раза — советник ждёт слова (вкладка «Промыслы»)'); } }
  banner.style.cursor='pointer';
  banner.addEventListener('click',e=>{ const a=e.target.closest('[data-act]');
    if(a&&a.dataset.act==='wait'){ cancelPick(); return; }             // 25.10 (Артём): отказ от выбора угодья — табличка гаснет, подсветка тоже
    if(a){ surveyOffer=false;
      if(a.dataset.act==='more'){ pickingSurvey=true; reveal(); }
      else { banner.classList.remove('on'); glog('Советник обождёт с новым осмотром — позови его со вкладки «Промыслы», когда будет нужда'); }
      return; }
    if(surveyOffer)return;
    reveal(); });
  function pickPatchAt(c){ if(!pickingIndustry)return false; const i=HI.get(c.col+','+c.row); const p=foundPatches.find(q=>q.set.has(i)); if(!p)return false; preview(p); return true; }

  // ---------- ГЛАВНЫЙ ТИК: доставка → рождаемость/смертность → миграция → голод (index.html 7383–7503) ----------
  function econTick(){ processWill();                                   // воля деревень, дань, бунты (index.html 5975: до тика промыслов)
    freeTick();                                                         // 25.10: вольные грады — рента, поручения, просьбы, бонусы побратимства
    marketTick();                                                       // ёмкость каравана, «спрос мира», выбор торгового узла
    recompute();
    INDUSTRIES.forEach(r=>{ r.total+=r.perTurn; r._age=(r._age||0)+1;
      const fr=deliv(r).frac;
      if(r.res2&&r.perTurn2){ STORE[r.res2]=(STORE[r.res2]||0)+r.perTurn2*fr; r.total2=(r.total2||0)+r.perTurn2; }
      if(r.res!=='еда'){ STORE[r.res]=(STORE[r.res]||0)+r.perTurn*fr; } });
    Object.keys(STORE).forEach(k=>STORE[k]=Math.round(STORE[k]*10)/10);
    homeMarket(); caravansTick();                                       // свой народ одевается; караваны в пути
    const cap=capOf(); if(!cap){ refreshPanels(); return; }
    const idx=epochOf(yearOf(turn)).idx, yr=Math.max(1,Math.round(yearsPerTurn(turn)));
    const capLi=LM.indexOf(cap);
    const need=capNeed(); let food=foodDeliveredPerTurn(capLi);
    if(food>need){ const cp=Math.max(1,need*(cap._hasGranary?5:2)); cap._store=Math.min(cp,(cap._store||0)+(food-need)*0.5); }
    else if(food<need&&(cap._store||0)>0){ const eff=cap._hasGranary?1:0.7; const draw=Math.min(cap._store,(need-food)/eff);
      cap._store=Math.round((cap._store-draw)*10)/10; food+=draw*eff; }
    const hunger=need>0?Math.max(0,Math.min(1,(need-food)/need)):0;
    const attract=need>0?Math.max(0,Math.min(1,(food-need)/need)):0;
    cap._food=Math.round(food); cap._need=need; cap._hunger=hunger; cap._attract=attract;
    const short=Math.max(0,need-food);
    cap._foodTurns=short>0.01?(cap._store||0)/short:Infinity;
    { const t=cap._foodTurns; const lvl=t===Infinity?3:(t<1?0:t<2?1:t<3?2:3);
      if(lvl<3&&lvl<(cap._foodWarn==null?3:cap._foodWarn))
        glog(lvl===0?'🌾 Ключник: закрома пусты — голод у порога':`🌾 Ключник доложил: запаса зерна осталось на <b>${Math.floor(t)}</b> ${Math.floor(t)===1?'ход':'хода'}`,{warn:lvl===0});
      cap._foodWarn=lvl; }
    // — 24.10 «ДВОРЫ» (Артём: «всё как в столице»): каждая наша деревня кормится сама (натуральное хозяйство
    //   0.10/чел + свои промыслы), излишек сдаёт в закрома державы, нехватку ей подвозят из закромов; пусто — голод двора —
    const courts=LM.map((l,li)=>({l,li})).filter(o=>o.l.rel==='ours'&&!o.l.capital);
    { const cpStore=Math.max(1,need*(cap._hasGranary?5:2));
      courts.forEach(({l,li})=>{
        const vneed=needOf(l);
        let vf=foodDeliveredPerTurn(li)+Math.round(popOf(l.size)*0.10);
        if(l._razv){ const take=Math.max(0,vf-vneed*0.9);             // 25.10: развёрстка — всё сверх 90% нужды в закрома; подвоза двору нет
          if(take>0)cap._store=Math.min(cpStore,(cap._store||0)+take); vf-=take; }
        else if(vf>vneed){ if(!l._mercy)cap._store=Math.min(cpStore,(cap._store||0)+(vf-vneed)*0.5); }   // 25.10 милость: излишек остаётся двору
        else if(vf<vneed&&(cap._store||0)>0){ const eff=cap._hasGranary?1:0.7; const draw=Math.min(cap._store,(vneed-vf)/eff);
          cap._store=Math.round((cap._store-draw)*10)/10; vf+=draw*eff; }
        l._food=Math.round(vf); l._need=vneed;
        l._hunger=vneed>0?Math.max(0,Math.min(1,(vneed-vf)/vneed)):0;
        l._attract=vneed>0?Math.max(0,Math.min(1,(vf-vneed)/vneed)):0; }); }
    // — миграция: чужие деревни тянутся к БЛИЖАЙШЕМУ нашему двору (столица или наш городок) —
    let migrants=0; const log=[];
    const vby=(BIRTH_RATE[idx]+VILLAGE_BIRTH_ADD)/100, vdy=DEATH_BASE[idx]/100;
    let pull=Math.max(CITY_PULL,attract);
    { const _pool=laborPool(), _used=INDUSTRIES.reduce((n,r)=>n+r.workers,0);
      const idle=_pool>0?(_pool-_used)/_pool:0;
      let workMul=idle<=0.10?1:(idle>=0.30?0:(0.30-idle)/0.20);
      if(food>=need*1.15)workMul=1;
      cap._idleShare=idle; cap._workMul=workMul; pull*=workMul; }
    pull*=moodMul();                                                    // одетый и довольный город манит сильнее (0.9 … 1.4)
    const rt=route();
    const targets=[{l:cap,li:capLi},...courts];                         // наши дворы — куда стекается люд
    const inflow=new Map();                                             // li нашего двора → пришло за ход
    LM.forEach(v=>{ if(v.capital||v.aiCapital||v.aiOwned||v.rel==='ours'||v.free)return;   // чужие и ничейные деревни (вольные грады и земли соперника живут сами)
      const vpop=popOf(v.size); let flow=0,tgt=null;
      if(!decreeClosed){
        v._news=Math.min(1,(v._news||0)+0.34);
        let bd=Infinity; targets.forEach(t=>{ const dd=wdist(v,t.l)/K; if(dd<bd){ bd=dd; tgt=t; } });
        const d=bd;                                                     // в единицах старого мира, через шов
        const ro=rt?rt(v.c):null, g=ro?(ro.avg<0.5?0:ro.avg<1.5?1:2):0;
        const rq=0.40+g*0.12;
        const tpull=(tgt&&tgt.l!==cap)?Math.max(CITY_PULL,tgt.l._attract||0)*(cap._workMul||1)*moodMul():pull;
        flow=MIG_BASE*tpull*v._news*(1/(1+0.035*d))*rq;
        flow=Math.max(0,Math.min(flow,vpop*(1-VILLAGE_FLOOR)));
      } else v._news=0;
      let vp=vpop,vb=0,vd=0;
      for(let y=0;y<yr;y++){ const bb=vp*vby,dd=vp*vdy; vb+=bb; vd+=dd; vp=Math.max(10,vp+bb-dd); }
      vp=Math.max(10,vp-flow);
      setSize(v,Math.min(capVillageOf(v),sizeOfPop(vp)));
      v._births=Math.round(vb); v._deaths=Math.round(vd); v._out=Math.round(flow);
      v._outTo=flow>=0.5?((tgt&&tgt.l!==cap?tgt.l.name:cap.name)||'столица'):null; v._growLast=popOf(v.size)-vpop;
      if(flow>=0.01){ if(tgt&&tgt.l!==cap)inflow.set(tgt.li,(inflow.get(tgt.li)||0)+flow);
        else { migrants+=flow; const nr=Math.round(flow); if(nr>0)log.push({name:v.name||'деревня',n:nr}); } } });
    // — наши дворы: демография как у столицы (голод двора бьёт смертностью) + небольшая текучка в столицу; потолка роста нет —
    courts.forEach(({l,li})=>{
      const vpop=popOf(l.size);
      const d=wdist(l,cap)/K, ro=rt?rt(l.c):null, g=ro?(ro.avg<0.5?0:ro.avg<1.5?1:2):0, rq=0.40+g*0.12;
      let inner=MIG_BASE*0.35*pull*(1/(1+0.035*d))*rq;                  // своих манит слабее: они уже в державе
      inner=Math.max(0,Math.min(inner,vpop*(1-VILLAGE_FLOOR)));
      const hg=l._hunger||0, pen=hg>0?CITY_DEATH_PEN[idx]:0;
      const vdy2=(DEATH_BASE[idx]+pen+hg*3)/100;
      let vp=vpop,vb=0,vd=0;
      for(let y=0;y<yr;y++){ const bb=vp*vby,dd=vp*vdy2; vb+=bb; vd+=dd; vp=Math.max(10,vp+bb-dd); }
      vp=Math.max(10,vp-inner+(inflow.get(li)||0));
      setSize(l,sizeOfPop(vp));                                         // наш городок растёт, пока кормится
      l._births=Math.round(vb); l._deaths=Math.round(vd); l._out=Math.round(inner); l._in=Math.round(inflow.get(li)||0);
      l._outTo=inner>=0.5?(cap.name||'столица'):null; l._growLast=popOf(l.size)-vpop;
      if(inner>=0.01){ migrants+=inner; const nr=Math.round(inner); if(nr>0)log.push({name:l.name||'деревня',n:nr}); } });
    // — демография столицы: сытый город без штрафа «кладбища», голодный — со штрафом и добавкой голода —
    const by=BIRTH_RATE[idx]/100*sciMods.birth;
    const pen=hunger>0?CITY_DEATH_PEN[idx]:0;
    const dy=(DEATH_BASE[idx]+pen+hunger*3)/100*sciMods.death;
    const before=popOf(cap.size); let p=before,births=0,deaths=0;
    for(let y=0;y<yr;y++){ const bb=p*by,dd=p*dy; births+=bb; deaths+=dd; p=Math.max(10,p+bb-dd); }
    p=Math.max(10,p+migrants);
    { const floorPop=before*0.88;                                    // исход вместо мора: смертью не больше 12% за ход, сверх — беженцы в ближние деревни
      if(p<floorPop-0.5){ let leavers=floorPop-p; p=floorPop;
        const near=LM.filter(v=>!v.capital&&!v.aiCapital&&!v.free).map(v=>({v,d:wdist(v,cap)})).sort((a,b)=>a.d-b.d).slice(0,4);
        if(near.length){ const each=leavers/near.length;
          near.forEach(({v})=>{ const vp=popOf(v.size)+each; setSize(v,v.rel==='ours'?sizeOfPop(vp):Math.min(capVillageOf(v),sizeOfPop(vp))); });   // свой двор принимает без потолка
          cap._exodus=Math.round(leavers);
          if(cap._exodus>=3)glog(`🚶 Голод гонит людей: <b>${cap._exodus}</b> душ ушли из города по деревням`,{at:[cap.x,cap.z]});
        } else cap._exodus=0;
      } else cap._exodus=0; }
    setSize(cap,sizeOfPop(p));
    cap._births=Math.round(births); cap._deaths=Math.round(deaths); cap._migrants=Math.round(migrants); cap._growLast=popOf(cap.size)-before;
    if(!cap._migLog)cap._migLog=[];
    log.forEach(e=>cap._migLog.push({name:e.name,n:e.n,turn}));
    cap._migLog=cap._migLog.filter(e=>e.turn>turn-3);
    aiTurn(idx,yr);                                                     // 26.10 ступень 1: соперник собирает земли по тем же правилам
    sciTick(cap,hunger);                                                // §15: опыт наук капает от занятий этого хода
    recompute(); drawZones(); redrawRoute(); refreshPanels(); if(emp.classList.contains('on'))renderEmp(); }

  // ---------- ПАНЕЛИ города и промысла (index.html 7505–7730) ----------
  { const st=document.createElement('style'); st.textContent=`
    #g-res,#g-city{position:fixed;z-index:13;font-family:system-ui,sans-serif;color:#eaf1fb;
      background:linear-gradient(#20344f,#141f31);border:1px solid #ffd98a55;border-radius:16px;box-shadow:0 16px 46px #000b;display:none}
    #g-res.on,#g-city.on{display:block;animation:g-fade .22s ease}
    #g-res{right:18px;bottom:150px;width:272px;padding:15px 17px 14px}
    #g-city{right:18px;top:70px;width:302px;padding:0;overflow:hidden;max-height:calc(100vh - 90px);overflow-y:auto}
    .g-x{position:absolute;top:9px;right:11px;width:25px;height:25px;border:0;border-radius:7px;cursor:pointer;background:#ffffff14;color:#dfe8f5;font-size:14px;line-height:1}
    .g-x:hover{background:#ffffff2a}
    #g-res h4{margin:0 0 11px;font-size:16px;color:#ffe1a0;display:flex;align-items:center;gap:9px;padding:0 26px 11px 0;border-bottom:1px solid #ffffff20}
    #g-res .rr{margin-top:11px;font-size:13px;display:flex;align-items:flex-start;gap:10px;line-height:1.45}
    #g-res .rr .gi{margin-top:1px}
    #g-res .rr.up{border-top:1px solid #ffffff20;padding-top:12px;margin-top:13px}
    #g-res .k{opacity:.6;font-size:11.5px}
    #g-res .big{color:#ffe1a0;font-weight:800;font-size:15px}
    #g-res .note{margin-top:12px;font-size:11px;opacity:.55;font-style:italic;line-height:1.45;border-top:1px solid #ffffff14;padding-top:9px}
    #g-city .hd{background:linear-gradient(#294b74,#1a2c46);padding:15px 17px 13px;position:relative}
    #g-city .nm{font-family:Georgia,serif;font-size:21px;font-weight:800;color:#ffe1a0;display:flex;align-items:center;gap:9px}
    #g-city .tabs{display:flex;background:#0e1727;border-bottom:1px solid #ffffff14}
    #g-city .tab{flex:1;border:0;background:transparent;color:#9fb0c4;font-size:12.5px;font-weight:700;padding:11px 6px;cursor:pointer;font-family:system-ui;border-bottom:2px solid transparent}
    #g-city .tab.sel{color:#ffe1a0;border-bottom-color:#ffd98a}
    #g-city .tab:hover{color:#eaf1fb}
    #g-city .body{padding:15px 17px 17px}
    #g-city .line{display:flex;align-items:center;gap:10px;font-size:13.5px;margin-top:12px}
    #g-city .line:first-child{margin-top:0}
    #g-city .line .k{opacity:.62;font-size:12px}
    #g-city .line .v{margin-left:auto;font-weight:800;color:#ffe1a0}
    #g-city .cap{font-size:11.5px;opacity:.6;margin:0 0 4px;text-transform:uppercase;letter-spacing:.5px}
    #g-city .prom{display:flex;align-items:center;gap:11px;padding:10px 11px;margin-top:8px;border-radius:11px;background:#ffffff0d;border:1px solid #ffffff14;cursor:pointer;transition:background .12s}
    #g-city .prom:hover{background:#ffd98a1e;border-color:#ffd98a66}
    #g-city .prom .pn{font-weight:700;font-size:13px}
    #g-city .prom .ps{font-size:11px;opacity:.72;margin-top:2px}
    #g-city .prom .go{margin-left:auto;color:#ffd98a;font-size:16px}
    #g-city .labdir{margin-top:8px;padding:10px 11px;border-radius:11px;background:#ffffff0d;border:1px solid #ffffff14}
    #g-city .ldt{display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:800;color:#ffe1a0;letter-spacing:.4px;margin-bottom:4px}
    #g-city .ldt span{display:flex;align-items:center;gap:5px}
    #g-city .ldr{display:flex;justify-content:space-between;font-size:11.5px;margin-top:4px}
    #g-city .lrow{display:flex;align-items:center;gap:7px;margin-top:3px}
    #g-city .lrow input[type=range]{flex:1;accent-color:#ffd98a;height:14px;margin:0}
    #g-city .pwa{border:0;background:#ffffff1a;color:#ffd98a;border-radius:7px;font-size:10.5px;padding:2px 7px;cursor:pointer}
    #g-city .pwa:hover{background:#ffffff2e}
    #g-city .pwa.dim{opacity:.65}
    #g-city .empty{font-size:12.5px;opacity:.6;font-style:italic;padding:8px 0;line-height:1.4}
    #g-city .stat{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.72;margin-top:4px;line-height:1.3}
    #g-city .rescan{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:13px;padding:11px;
      border:1px solid #ffd98a66;border-radius:11px;cursor:pointer;font-family:system-ui;font-size:13px;font-weight:700;color:#ffe1a0;background:#ffd98a14}
    #g-city .rescan:hover{background:#ffd98a26;border-color:#ffd98a}`;
    document.head.appendChild(st); }
  const resP=document.createElement('div'); resP.id='g-res'; document.body.appendChild(resP);
  const cityP=document.createElement('div'); cityP.id='g-city'; document.body.appendChild(cityP);
  let curRes=null, cityTab='over', bandN=30;                           // bandN — ползунок людей в новой дружине (вкладка «Войско»)
  const sgn=n=>(n>=0?'+':'')+n;
  const gi=(id,s)=>GI(id,s,'#ffd98a');
  function openRes(r){ curRes=r; cityP.classList.remove('on'); closeVillage(); setBase(); clearG(hlG); hlG.add(ribbonMesh(r.cells,r.col));
    clearG(dashG); { const hm=homeOf(r), ri=roadInfo(r.bi,r.paved,hm); if(ri.grade===0)dashLine(r.bi,null,hm); }   // дорога уже есть — поверх неё пунктир не нужен; путь — от родного двора
    const capc=r.cells.length*IND[r.ind].per;
    const d=deliv(r), delivered=Math.round(r.perTurn*d.frac), np=paveInfo(r);
    // 23.10 (Артём): пашню и выпас можно переделывать друг в друга; 1 ход простоя; пашня — только где позволяет биом (степь — после плуга)
    const convTo=r.ind==='farm'?'pasture':r.ind==='pasture'?'farm':null;
    const convOk=convTo&&biomeInds(r.biome).includes(convTo);
    const convBtn=convTo?(r._conv>0
      ?`<div class="rr"><span class="k" style="opacity:.7">${gi('calendar',14)} перестройка: угодье переналаживают, ещё ${r._conv} х. без добычи</span></div>`
      :`<div class="rr"><button class="conv" type="button" ${convOk?'':'disabled'} style="display:flex;align-items:center;justify-content:center;gap:7px;width:100%;border:1px solid #9fc26b66;background:#9fc26b1a;color:#dfe8d0;font-weight:700;font-size:12px;padding:9px;border-radius:9px;cursor:${convOk?'pointer':'default'};font-family:system-ui;${convOk?'':'opacity:.5'}">${gi(convTo==='farm'?'wheat':'cow',15)} ${convTo==='farm'?'Распахать под пашню':'Отдать под выпас'} (1 ход простоя)${convOk?'':' · распашку даст плуг'}</button></div>`):'';
    const paveBtn=np?`<div class="rr"><button class="pave" type="button" ${np.ok?'':'disabled'} style="display:flex;align-items:center;justify-content:center;gap:7px;width:100%;border:1px solid #ffd98a66;background:#ffd98a1e;color:#ffe9c2;font-weight:700;font-size:12px;padding:9px;border-radius:9px;cursor:${np.ok?'pointer':'default'};font-family:system-ui;${np.ok?'':'opacity:.5'}">${gi('coins',15)} Замостить: ${np.name} (−${np.cost})${np.ok?'':` · с ${EP_FROM[GRADE_MIN_EP[np.grade]]||'будущих эпох'}`}</button></div>`:'';
    resP.innerHTML=`<button class="g-x">✕</button>
      <h4>${gi(r.ic,22)}${r.name}</h4>
      <div class="rr">${gi('people')}<span><span class="big">${r.workers}</span> из <b>${capc}</b> ${plural(capc,'места','мест','мест')} · на <b>${r.cells.length}</b> ${plural(r.cells.length,'клетке','клетках','клетках')}</span></div>
      <div class="rr">${gi(RES_IC[r.res]||r.ic)}<span><span class="k">даёт ${r.res}</span> — <span class="big">${sgn(r.perTurn)}</span> за ход</span></div>
      ${r.res2?`<div class="rr">${gi(RES_IC[r.res2])}<span><span class="k">и ещё ${r.res2}</span> — <span class="big">+${r.perTurn2}</span> за ход <span class="k">(на склад)</span></span></div>`:''}
      ${r.ind==='farm'&&oxBonus()>0?`<div class="rr">${gi('cow')}<span><span class="k">волы с пастбищ</span> — пашут вместо людей: <b>+${Math.round(oxBonus()*100)}%</b> к урожаю</span></div>`:''}
      ${r.ind==='hunt'?`<div class="rr">${gi('bow')}<span><span class="k">зверь выбит</span> — добыча падает на <b>${Math.round((1-huntK(r))*100)}%</b> от начальной</span></div>`:''}
      ${r.ind==='hunt'&&r.biome==='savanna'?`<div class="rr up">${gi('bow')}<span><span class="k">саванна — земля большой охоты</span>: стада дичи не переводятся — добыча богаче, зверь выбивается вдвое медленнее</span></div>`:''}
      <div class="rr">${gi('box')}<span><span class="k">добыто всего</span> — <b>${r.total}</b>${r.res2?` · ${r.res2}: <b>${Math.round(r.total2||0)}</b>`:''}</span></div>
      <div class="rr up">${gi('trend')}<span><span class="k">доставка до ${d.home&&!d.home.capital?`«${d.home.name||'деревни'}»`:'города'}</span><br>путь <b>${d.L}</b> ${plural(d.L,'клетка','клетки','клеток')} · дорога <b>${d.gradeName}</b> · ≈ <b>${d.T}</b> ${plural(d.T,'ход','хода','ходов')}<br>доходит <b>${Math.round(d.eta*100)}%</b>${d.ramp<1?` · дорога ещё налаживается (${Math.round(d.ramp*100)}%)`:''} → доходит <b>${delivered}</b>/ход</span></div>
      ${paveBtn}${convBtn}
      <div class="rr up">${gi('flask')}<span><span class="k">улучшения</span> — ${(sciDone.pottery&&r.res==='еда')?`<b>гончарство</b>: горшки в дороге, потери еды −25%`:`<i>появятся с науками</i>`}</span></div>
      <div class="note">Дальше и по сырой дороге доходит меньше (еда портится сильнее камня). Тропа и тракт накатываются сами; брусчатку и выше мостит правитель за казну — быстрее и меньше потерь.</div>`;
    resP.querySelector('.g-x').onclick=closeRes;
    { const pb=resP.querySelector('.pave'); if(pb&&np&&np.ok)pb.onclick=()=>paveRoad(r); }
    { const cb=resP.querySelector('.conv'); if(cb&&convOk)cb.onclick=()=>{ const to=convTo, m=INDMETA[to];
        r.ind=to; r.name=IND[to].name; r.tint=IND[to].tint; r.ic=m.ic; r.res=m.res; r.res2=m.res2||null;
        r.amp=ampFor(to,r.biome); r.amp2=amp2For(to,r.biome); r._conv=1; r._wet=null;
        glog(`«<b>${r.name}</b>»: угодье переналаживают — ${to==='farm'?'пастухи уступают место пахарям':'пашня отходит под стада'}, 1 ход без добычи`);
        recompute(); openRes(r); if(cityP.classList.contains('on'))renderCity(); }; }
    resP.classList.add('on'); }
  function closeRes(){ resP.classList.remove('on'); curRes=null; clearG(hlG); if(!prevApplied)clearG(dashG); }
  function openCity(){ curRes=null; clearG(hlG); clearG(dashG); resP.classList.remove('on'); closeVillage(); closePanel();
    renderCity(); cityP.classList.add('on'); }
  function closeCity(){ cityP.classList.remove('on'); }
  const CBTN='display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:8px;padding:9px;border-radius:9px;cursor:pointer;font-family:system-ui;font-size:12px;font-weight:700;border:1px solid #ffffff22;background:#ffffff10;color:#dfe8f5';
  function renderCity(){ const cap=capOf(); if(!cap)return;
    const idx=epochOf(yearOf(turn)).idx;
    const have=STORE_RES.filter(k=>(STORE[k]||0)>0);
    const storeRows=have.length?`<div class="cap" style="margin-top:14px">склад</div>`+have.map(k=>`<div class="line">${gi(RES_IC[k])}<span class="k">${k}</span><span class="v">${Math.round(STORE[k])}</span></div>`).join(''):'';
    const food=cap._food!=null?cap._food:foodDeliveredPerTurn(), need=capNeed(), hungry=(need>food);
    const over=`
      <div class="line">${gi('calendar')}<span class="k">основан</span><span class="v">${fmtYear(yearOf(cap.founded||0))}</span></div>
      <div class="line">${gi('people')}<span class="k">население</span><span class="v">${fmtPop(popOf(cap.size))}</span></div>
      <div class="line">${gi('trend')}<span class="k">прирост</span><span class="v">${sgn(cap._growLast||0)} чел./ход</span></div>
      <div class="line">${gi('wheat')}<span class="k">еда доходит / нужно</span><span class="v" style="${hungry?'color:#ff7a7a':''}">${food} / ${need}${hungry?' · голод':''}</span></div>
      ${(cap._hasGranary||cap._store>0)?`<div class="line">${gi('box')}<span class="k">${cap._hasGranary?'амбар (запас еды)':'ямы-хранилища (еда)'}</span><span class="v">${Math.round(cap._store||0)}</span></div>`:''}
      ${tribFood?`<div class="line">${gi('box')}<span class="k">дань с деревень</span><span class="v" style="color:#7ed88a">+${tribFood} еды/ход${cap._hasGranary?'':' · без амбара половина гниёт'}</span></div>`:''}
      ${storeRows}
      <div style="margin-top:14px">
        <button class="cbtn" data-a="decree" style="${CBTN};${decreeClosed?'border-color:#ffd98a66;background:#ffd98a1e;color:#ffe9c2':''}">${decreeClosed?'Снять ограничение приёма':'Указ: ограничить приём жителей'}</button>
      </div>`;
    // — 25.10 (Артём): вкладка «Войско» — всё, что город производит (отряды с ползунком людей, постройки); очередь — позже —
    const idleN0=Math.max(0,laborPool()-INDUSTRIES.reduce((s,r)=>s+r.workers,0));
    const maxBand=Math.min(50,idleN0,Math.max(0,popOf(cap.size)-40));
    const bn=Math.min(Math.max(10,bandN),Math.max(10,maxBand));
    const sc0=UNITS.find(u=>u.kind==='scout'), wbs0=UNITS.filter(u=>u.kind==='band'), ch0=capI();
    const prod=`
      <div class="cap">отряды державы</div>
      ${wbs0.length?wbs0.map(w=>`<div class="line">${gi('swords')}<span class="k">дружина${w.i===ch0?' · у стен':w.broke?' · бредёт домой':' · в походе'}</span><span class="v">${w.str} чел</span></div>`).join(''):''}
      ${sc0?`<div class="line">${gi('eye')}<span class="k">разведчик${sc0.i===ch0?' · дома':' · в походе (−2 мон./ход)'}</span><span class="v"></span></div>`:''}
      ${!wbs0.length&&!sc0?`<div class="line" style="opacity:.55;font-size:11.5px"><span class="k"><i>войска пока нет</i></span></div>`:''}
      <div class="cap" style="margin-top:14px">собрать отряд</div>
      ${sc0?'':`<button class="cbtn" data-a="scout" style="${CBTN}${(cap._store||0)>=5?'':';opacity:.62'}">${gi('eye',14)} Снарядить разведчика (−5 еды)</button>`}
      ${maxBand>=10?`
        <div class="line" style="margin-top:10px">${gi('swords')}<span class="k">дружина — людей в отряд</span><span class="v" id="band-nv">${bn}</span></div>
        <input type="range" id="band-n" min="10" max="${maxBand}" step="5" value="${bn}" style="width:100%;accent-color:#ffd98a">
        <div class="cap" style="margin:2px 0 0;text-transform:none;letter-spacing:0">из свободных людей города (праздных сейчас ${idleN0}) · предел отряда 50 · в походе 1 монета за 10 людей в ход</div>
        <button class="cbtn" data-a="bandn" style="${CBTN}${money>=bn*2?'':';opacity:.62'}">Собрать дружину<br><span style="font-weight:600;font-size:11px;opacity:.78">−<span id="band-c">${bn*2}</span> монет · −<span id="band-p">${bn}</span> жителей</span></button>
        <div class="cap" style="margin:4px 0 0;text-transform:none;letter-spacing:0">собранная дружина выступит со следующего хода</div>`
      :`<div class="line" style="opacity:.55;font-size:11.5px">${gi('swords',13)}<span class="k"><i>на дружину нет свободных людей (праздных ${idleN0}, нужно хотя бы 10) — сними людей с промыслов или дождись роста</i></span></div>`}
      <div class="cap" style="margin-top:14px">постройки</div>
      ${cap._hasGranary?`<div class="line">${gi('box')}<span class="k">амбар</span><span class="v" style="color:#7ed88a">построен</span></div>`
        :(sciDone.granary
          ?(()=>{ const w=Math.floor(STORE['древесина']||0), wOk=w>=40, mOk=money>=40;   // цена 40 монет + 40 древесины; счётчик дерева на кнопке
            return `<button class="cbtn" data-a="granary" style="${CBTN}${(wOk&&mOk)?'':';opacity:.62'}">${gi('box',14)} Построить амбар (−40${mOk?'':' <b style="color:#ff7a7a">монет</b>'} · ${gi('timber',13)} <b style="color:${wOk?'#9fdc9f':'#ff7a7a'}">${w}/40</b>)</button>`; })()
          :`<div class="line" style="opacity:.55;font-size:11.5px">${gi('box',13)}<span class="k"><i>амбар ещё не изобретён — старейшины думают (см. Науки)</i></span></div>`)}
`;
    const b=cap._births||0, dth=cap._deaths||0, mig=cap._migrants||0, net=cap._growLast||0;
    const penNote=CITY_DEATH_PEN[idx]<=0
      ?`<div class="cap" style="margin-top:13px">санитария сняла городской штраф смертности — город растёт сам</div>`
      :(cap._hunger>0
        ?`<div class="cap" style="margin-top:13px">ГОЛОД: теснота и зараза добавляют +${CITY_DEATH_PEN[idx]}%/год к смертности — город-кладбище, люди мрут быстрее, чем рождаются</div>`
        :`<div class="cap" style="margin-top:13px">город сыт: рождается примерно столько же, сколько умирает — растём приходом людей из деревень</div>`);
    const migList=(cap._migLog&&cap._migLog.length)
      ?cap._migLog.slice().reverse().slice(0,8).map(e=>`<div class="stat">${GI('people',11)} +${e.n} из «${e.name}» <span style="opacity:.5">(ход ${e.turn})</span></div>`).join('')
      :`<div class="empty">Пока никто не переселялся. Будет избыток еды — из деревень потянутся люди.</div>`;
    const residents=`
      <div class="line">${gi('people')}<span class="k">население</span><span class="v">${fmtPop(popOf(cap.size))}</span></div>
      <div class="line">${gi('sprout')}<span class="k">рождается за ход</span><span class="v" style="color:#7ed88a">+${b}</span></div>
      <div class="line">${gi('urn')}<span class="k">умирает за ход</span><span class="v" style="color:#ff9a9a">−${dth}</span></div>
      <div class="line">${gi('people')}<span class="k">пришло из деревень</span><span class="v" style="color:#8ac6ff">+${mig}</span></div>
      <div class="line">${gi('trend')}<span class="k">итог прироста</span><span class="v">${sgn(net)} чел./ход</span></div>
      ${penNote}
      <div class="cap" style="margin-top:14px">кто прибыл (последние 3 хода)</div>
      ${migList}
      <div class="line" style="margin-top:14px">${gi('flask')}<span class="k">от науки</span><span class="v" style="opacity:.6;font-weight:600;font-size:11.5px"><i>лечебницы, знахари, роддома — позже</i></span></div>`;
    let list;
    if(!INDUSTRIES.length)list=`<div class="empty">Промыслов пока нет. Отправь советника осмотреть округу и заложи первый.</div>`;
    else {
      const pool=laborPool(), usedW=INDUSTRIES.reduce((s,r)=>s+r.workers,0);
      const fW=INDUSTRIES.filter(r=>r.res==='еда').reduce((s,r)=>s+r.workers,0);
      const fOut=foodDeliveredPerTurn();
      const mOut=INDUSTRIES.filter(r=>r.res!=='еда').reduce((s,r)=>s+r.perTurn,0);
      const capsAll=INDUSTRIES.map(r=>r.cells.length*IND[r.ind].per);
      const shPos=100-(laborShare!=null?Math.round(laborShare*100):(usedW?Math.round(100*fW/usedW):50));
      const idleN=Math.max(0,pool-usedW);
      list=`<div class="cap">рабочие руки: ${usedW} из ${pool} (жителей ${popOf(cap.size)}) · праздных: ${idleN}</div>
      <div class="labdir">
        <div class="ldt"><span>${gi('wheat',16)} ЕДА</span><span>МАТЕРИАЛЫ ${gi('pick',16)}</span></div>
        <div class="lrow"><input type="range" id="lab-share" min="0" max="100" value="${shPos}">
          <button id="lab-auto" class="pwa${laborShare==null?' dim':''}">${laborShare==null?'авто ✓':'авто'}</button></div>
        <div class="ldr"><span><b>${fW}</b> чел → +${fOut}/ход</span>
          <span><b>${usedW-fW}</b> чел → +${Math.round(mOut)}/ход</span></div>
      </div>
      <div class="cap" style="margin-top:10px">промыслов: ${INDUSTRIES.length}</div>`+INDUSTRIES.map((r,i)=>`
      <div class="prom" data-i="${i}">${gi(r.ic,20)}
        <div style="flex:1"><div class="pn">${r.name}</div><div class="ps">${GI('people',12)} <span class="pwn">${r.workers}</span> из ${capsAll[i]} мест · ${sgn(r.perTurn)}/ход · ${GI('box',12)} ${r.total}</div>
          <div class="lrow"><input type="range" class="pw" data-i="${i}" min="0" max="${capsAll[i]}" value="${r.workers}">
            ${r.lockW!=null?`<button class="pwa pwr" data-i="${i}">авто</button>`:''}</div></div>
        <span class="go">➔</span></div>`).join(''); }
    const proms=list+`<button class="rescan">${gi('eye',16)} Отправить советника осмотреть округу</button>`;
    const bodyMap={over,res:residents,prom:proms,prod};
    cityP.innerHTML=`<div class="hd"><button class="g-x">✕</button><div class="nm">${gi('temple',22)} ${cap.name||'Столица'}</div></div>
      <div class="tabs"><button class="tab${cityTab==='over'?' sel':''}" data-t="over">Обзор</button><button class="tab${cityTab==='res'?' sel':''}" data-t="res">Жители</button><button class="tab${cityTab==='prom'?' sel':''}" data-t="prom">Промыслы</button><button class="tab${cityTab==='prod'?' sel':''}" data-t="prod">Войско</button></div>
      <div class="body">${bodyMap[cityTab]||over}</div>`;
    cityP.querySelector('.g-x').onclick=closeCity;
    cityP.querySelectorAll('.tab').forEach(el=>el.onclick=()=>{ cityTab=el.dataset.t; renderCity(); });
    cityP.querySelectorAll('.cbtn').forEach(el=>el.onclick=()=>{ const a=el.dataset.a;
      if(a==='granary'){ const w=Math.floor(STORE['древесина']||0);   // при нехватке кнопка молчит (счётчик на ней красный)
        if(money>=40&&w>=40){ money-=40; STORE['древесина']=Math.round((STORE['древесина']-40)*10)/10; cap._hasGranary=true; updateStats(); glog('Построен амбар — запас еды на голодные ходы'); } }
      else if(a==='scout'){ if(uHire(a))return; }                    // 16.10: найм — отряд сразу выбран, карточка города закрывается
      else if(a==='bandn'){ if(uHire('band',bandN))return; }         // 25.10: дружина с ползунком людей (вкладка «Войско»)
      else if(a==='decree'){ decreeClosed=!decreeClosed; glog(decreeClosed?'Указ: приём новых жителей ограничен':'Ограничение приёма снято'); }
      renderCity(); });
    cityP.querySelectorAll('.prom').forEach(el=>el.onclick=()=>{ const r=INDUSTRIES[+el.dataset.i]; flyTo(r.bx,r.bz); openRes(r); });
    const updLabor=(skipEl)=>{ const usedW=INDUSTRIES.reduce((s,r)=>s+r.workers,0);
      const fW=INDUSTRIES.filter(r=>r.res==='еда').reduce((s,r)=>s+r.workers,0);
      const ld=cityP.querySelector('.labdir .ldr');
      if(ld)ld.innerHTML=`<span><b>${fW}</b> чел → +${foodDeliveredPerTurn()}/ход</span>
        <span><b>${usedW-fW}</b> чел → +${Math.round(INDUSTRIES.filter(r=>r.res!=='еда').reduce((s,r)=>s+r.perTurn,0))}/ход</span>`;
      cityP.querySelectorAll('.pw').forEach(el2=>{ const r2=INDUSTRIES[+el2.dataset.i]; if(!r2)return;
        if(el2!==skipEl)el2.value=r2.workers;
        const pr=el2.closest('.prom'), pn=pr&&pr.querySelector('.pwn'); if(pn)pn.textContent=r2.workers; }); };
    const shEl=cityP.querySelector('#lab-share');
    if(shEl){
      shEl.addEventListener('pointerdown',e=>e.stopPropagation());
      shEl.addEventListener('input',()=>{ laborShare=1-(+shEl.value)/100; allocWorkers(); recompute(); updLabor(shEl); });
      shEl.addEventListener('change',()=>renderCity());
      const ab=cityP.querySelector('#lab-auto');
      if(ab)ab.onclick=e=>{ e.stopPropagation(); laborShare=null; allocWorkers(); recompute(); renderCity(); }; }
    cityP.querySelectorAll('.pw').forEach(el=>{
      el.addEventListener('pointerdown',e=>e.stopPropagation());
      el.addEventListener('click',e=>e.stopPropagation());
      el.addEventListener('input',()=>{ const r=INDUSTRIES[+el.dataset.i]; if(!r)return;
        r.lockW=+el.value; allocWorkers(); recompute();
        if(r.workers<r.lockW){ el.value=r.workers;
          const cap0=cityP.querySelector('.cap');
          if(cap0&&!cap0._flash){ cap0._flash=1; const old=cap0.style.color;
            cap0.textContent='ВСЕ РУКИ ЗАНЯТЫ — снимите людей с другого промысла'; cap0.style.color='#ffb27a';
            setTimeout(()=>{ cap0._flash=0; cap0.style.color=old; renderCity(); },1300); } }
        updLabor(el); });
      el.addEventListener('change',()=>renderCity()); });
    cityP.querySelectorAll('.pwr').forEach(el=>el.onclick=e=>{ e.stopPropagation();
      const r=INDUSTRIES[+el.dataset.i]; if(r)r.lockW=null; allocWorkers(); recompute(); renderCity(); });
    const rb=cityP.querySelector('.rescan'); if(rb)rb.onclick=rescan;
    const bEl=cityP.querySelector('#band-n');                        // 25.10: ползунок людей новой дружины
    if(bEl){ bEl.addEventListener('pointerdown',e=>e.stopPropagation());
      bEl.addEventListener('input',()=>{ bandN=+bEl.value;
        const nv=cityP.querySelector('#band-nv'), c=cityP.querySelector('#band-c'), p=cityP.querySelector('#band-p');
        if(nv)nv.textContent=bandN; if(c)c.textContent=bandN*2; if(p)p.textContent=bandN; }); } }
  function refreshPanels(){ if(cityP.classList.contains('on'))renderCity(); if(curRes&&resP.classList.contains('on'))openRes(curRes); }
  function escEcon(){ if(indP.classList.contains('on')){ closePanel(); clearPreview(); curPatch=null; return true; }
    if(resP.classList.contains('on')){ closeRes(); return true; } if(cityP.classList.contains('on')){ closeCity(); return true; }
    if(pickingIndustry&&INDUSTRIES.length){ cancelPick(); return true; }   // 25.10 (Артём): ESC тоже снимает выбор угодья (кроме обязательного первого)
    return false; }

  // ---------- новая партия / сохранение (index.html 7135–7180) ----------
  function econReset(){ clearG(svG); clearPreview(); clearG(hlG); clearG(dashG); closePanel(); closeRes(); closeCity();
    for(const r of INDUSTRIES)restoreCells(r.touched); INDUSTRIES.length=0;
    Object.keys(STORE).forEach(k=>delete STORE[k]);
    decreeClosed=false; cityTab='over'; laborShare=null; rtMap.clear();
    pickingSurvey=false; pickingIndustry=false; surveyOffer=false; foundPatches=[]; curPatch=null;
    econ2Reset(); routesBtn.style.display='none'; }
  const keyOf=i=>HX[i].col+','+HX[i].row;
  function econSave(){ return { inds:INDUSTRIES.map(r=>({ind:r.ind,biome:r.biome,col:r.col,cells:r.cells.map(keyOf),target:keyOf(r.target),
      _age:r._age,total:r.total,total2:r.total2,_built:r._built,lockW:r.lockW??null,paved:r.paved||0})), store:{...STORE}, decree:decreeClosed, laborShare, ...econ2Save() }; }
  function econLoad(d){ econReset(); if(!d)return; const cap=capOf();
    for(const sv of (d.inds||[])){ const cells=sv.cells.map(k=>HI.get(k)).filter(i=>i!==undefined), target=HI.get(sv.target); if(!cells.length||target===undefined||!cap)continue;
      const p={r:{key:sv.biome,col:sv.col},cells,set:new Set(cells),target}; const ap=applyInd(sv.ind,p,cap), meta=INDMETA[sv.ind];
      INDUSTRIES.push({ ind:sv.ind, name:IND[sv.ind].name, biome:sv.biome, tint:IND[sv.ind].tint, col:sv.col, cells, set:new Set(cells), target,
        bi:ap.bi, bx:ap.bx, bz:ap.bz, touched:ap.touched, act:ap.act, res:meta.res, ic:meta.ic, amp:ampFor(sv.ind,sv.biome), res2:meta.res2||null, amp2:amp2For(sv.ind,sv.biome),
        workers:0, perTurn:0, total:sv.total||0, perTurn2:0, total2:sv.total2||0, _age:sv._age||0, _built:sv._built||0, lockW:sv.lockW??null, paved:sv.paved||0 }); }
    Object.assign(STORE,d.store||{}); decreeClosed=!!d.decree; laborShare=d.laborShare==null?null:d.laborShare;
    econ2Load(d);
    recompute(); if(cap){ drawZones(); redrawRoute(); routesBtn.style.display='flex'; } }
  // ================= ЭКОНОМИКА, ШАГ 2 (16.10, Артём: «делай 4» → «да, делай с границами») =================
  // Перенос index.html: науки 7277–7342 + окно 5990–6050, мощение 7343–7379, торговля/одежда 7907–8106 + вкладка «Торг» 8197–8233,
  // сбор земель (воля, дар, защита, дань, присяга, бунт) 5046–5221, граница державы 3178–3329, окно событий 6403–6431. Тексты и числа — дословно.
  // НЕ перенесено: частокол (опыт — от набегов, набегов/юнитов нет), разведка деревень и «дружина у стен» (юниты), образовательные «?».

  // ---------- окно событий по центру: пергамент + кнопки, очередь (index.html 6403–6431) ----------
  { const st=document.createElement('style'); st.textContent=`
    #g-evt{position:fixed;inset:0;z-index:41;display:none;align-items:center;justify-content:center;background:#00000055}
    #g-evt.on{display:flex;animation:g-fade .35s ease}
    #g-evt .scroll{position:relative;max-width:470px;margin:20px;padding:26px 30px 22px;background:linear-gradient(#f6ecd4,#efe2c2);color:#3c2c14;border-radius:14px;box-shadow:0 12px 40px #000a;text-align:center;font-family:Georgia,serif}
    #g-evt .seal{line-height:1;margin-bottom:2px;filter:drop-shadow(0 2px 3px #0005)}
    #g-evt h3{margin:2px 0;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#7a5a24;font-weight:700}
    #g-evt .div{width:84px;height:2px;margin:10px auto 14px;background:linear-gradient(90deg,transparent,#a5772f,transparent)}
    #g-evt p{margin:0 0 16px;font-size:15.5px;line-height:1.6;text-align:left}
    #g-evt b{color:#6b3f12}
    #g-evt .btns2{display:flex;gap:10px;justify-content:center}
    #g-evt button{border:0;border-radius:10px;padding:10px 24px;cursor:pointer;background:#7a5a24;color:#fff;font:700 14px system-ui}
    #g-evt button.no{background:#8d8578}
    #g-evt button:hover{filter:brightness(1.06)}`;
    document.head.appendChild(st); }
  const evtEl=document.createElement('div'); evtEl.id='g-evt'; document.body.appendChild(evtEl);
  const evtQ=[]; let evtWait=false, batBusy=()=>false;   // batBusy подменяется ниже, когда появляется очередь сечь BQ
  function evtNext(){
    // 30.10 (Артём: «бой не видно из-за окна приветствия»): пока на карте играется сеча — окна ждут её исхода
    if(batBusy()&&evtQ.length){
      if(!evtWait){ evtWait=true;
        const tick=()=>{ if(batBusy()){ setTimeout(tick,400); return; }
          evtWait=false; if(!evtEl.classList.contains('on'))evtNext(); };
        setTimeout(tick,400); }
      return; }
    const o=evtQ.shift(); if(!o){ evtEl.classList.remove('on'); return; }
    const btns=o.buttons||[{t:o.ok||'Понятно'}];
    evtEl.innerHTML=`<div class="scroll"><div class="seal">${GI(o.icon||'owl',44,'#6b4a1c')}</div><h3>${o.title||''}</h3>
      <div class="div"></div><p>${o.html||''}</p><div class="btns2">${btns.map((b,i)=>`<button data-i="${i}" class="${b.cls||''}">${b.t}</button>`).join('')}</div></div>`;
    evtEl.querySelectorAll('button').forEach(b=>b.onclick=()=>{ const f=btns[+b.dataset.i].cb; evtEl.classList.remove('on'); if(f)f(); setTimeout(evtNext,60); });
    setTimeout(()=>evtEl.classList.add('on'),30); }
  const evt=window.__evt=o=>{ evtQ.push(o); if(!evtEl.classList.contains('on'))evtNext(); };

  // ---------- НАУКИ «УЧИМСЯ ДЕЛОМ» (index.html 7276–7341): опыт капает от занятий народа, на пороге — озарение ----------
  // СТИМУЛЫ (утверждено): сытость города ×1.25; праздные руки +2% за человека (до +30%).
  const sciMods={ birth:1, death:1, spoil:1 };
  const SCI={
    granary:{ name:'Хранение зерна', ic:'box', sec:'Хозяйство', thr:30, ask:'Об амбарах и ямах',
      brew:'запасы в ямах; голод учит втрое быстрее',
      bonus:'открывает постройку амбара — запас перестаёт гнить (ямы теряют треть)',
      see:'Государь, радость: старейшины измыслили амбар на сваях — мыши и сырость зерну больше не хозяева.',
      advice:'Вели строить амбар (панель города → Обзор, 40 монет и 40 брёвен): запас перестанет гнить, излишки лягут в закрома.' },
    pottery:{ name:'Гончарное дело', ic:'flask', sec:'Ремесло', thr:45, ask:'О глине и горшках',                // 17.10 (Артём: «к 3-му ходу — слишком быстро»): 14 → 45, множители убраны, источники видны
      brew:'запасы в ямах, извоз еды издалека, промыслы у воды (глина), праздные руки',
      bonus:'варка: та же еда кормит на 15% больше ртов · горшки: −25% потерь еды в пути',
      see:'Государь, глина у огня стала камнем — гончары лепят горшки и котлы, в них булькают первые каши.',
      advice:'Той же едой теперь кормим больше ртов (потребность −15%), а еда с дальних промыслов доезжает целее (потери в пути −25%).' },
    plow:{ name:'Тяжёлый плуг', ic:'wheat', sec:'Хозяйство', thr:40, ask:'О плуге и целине',
      brew:'пахари учатся на мягкой земле; тягловая скотина подсказывает, как резать дёрн',
      bonus:'целина покоряется: в СТЕПНЫХ угодьях появляется выбор «пашня» (был только выпас)',
      see:'Государь, кузнецы оковали лемех железом, а волы тянут — плуг режет степной дёрн, где соха отскакивала.',
      advice:'Проведи новый осмотр земель: степные угодья теперь можно распахивать, не только пасти скот.' },
    // 18.10 (index.html 7295–7301, 7322–7326): озарение от беды — в мирное время опыт не капает, пережитый набег даёт скачок
    palisade:{ name:'Частокол', ic:'fort', sec:'Оборона', thr:16, ask:'Об ограде от лихих людей',
      brew:'пережитый набег учит, как ничто другое',
      bonus:'ограда из брёвен: налётчик теряет 2 хода на грабёж и вдвое реже зарится на такую деревню; и против штурма стоит — за оградой сила дружины ×1.5, а не ×5',
      see:'Государь, беда выучила: мужики валят лес и вкапывают заострённые брёвна кругом дворов — зверю и лихому люду ходу нет.',
      advice:'Вели ставить частокол в своих, данных и подзащитных деревнях (карточка деревни, 40 брёвен): грабёж замедлится — дружина успеет.' },
  };
  const sciExp={}, sciDone={}, sciSrc={};                              // 17.10: sciSrc[id][источник] — сколько очков дал каждый
  // 23.10 (Артём, А2+Б): НАКАЗ МУДРЕЦУ — выбранный раздел учат праздные руки (+4%/чел, потолок +60%),
  // остальным — базовая скорость без прибавки праздных; смена наказа не чаще раза в 5 ходов.
  // ВОПРОС МУДРЕЦА (В): две науки дозрели до половины — событие-развилка, выбранная зреет ×2 до озарения.
  let sciDecree=null, sciDecreeTurn=-99, sciFocus=null, sciAsked=false, sciNeed=false;   // sciNeed — 30.10: выбор науки не сделан, конец хода заперт
  const sciFree=()=>Math.max(0,laborPool()-INDUSTRIES.reduce((s,r)=>s+r.workers,0));
  function sciBoost(sec){ let m=1;
    if(sciDecree==null)m+=Math.min(0.3,sciFree()*0.02);               // без наказа: праздные руки понемногу всем
    else if(sec===sciDecree)m+=Math.min(0.6,sciFree()*0.04);          // наказ: праздные учатся выбранному делу
    const c=capOf(); if(c&&(c._attract||0)>0)m*=1.25;
    return m; }
  function sciTick(cap,hunger){ const F=id=>sciFocus===id?2:1;        // ×2 — наука, выбранная в «вопросе мудреца»
    if(!sciDone.granary){ let g=0; if((cap._store||0)>0)g+=1; if(hunger>0)g+=3;
      if(g){ sciExp.granary=(sciExp.granary||0)+g*sciBoost('Хозяйство')*F('granary'); if(sciExp.granary>=SCI.granary.thr)sciInvent('granary'); } }
    if(!sciDone.pottery){ const src=sciSrc.pottery||(sciSrc.pottery={}), add=(k,v)=>{ if(v>0){ src[k]=(src[k]||0)+v; g+=v; } }; let g=0;
      add('запас еды в ямах',(cap._store||0)>0?1:0);
      add('извоз еды издалека',INDUSTRIES.some(r=>r.res==='еда'&&deliv(r).T>=2)?1:0);
      add('промысел у воды — глина под рукой',INDUSTRIES.some(r=>r.workers>0&&wetInd(r))?1:0);
      const free=sciFree(); add('праздные руки',Math.min(1.5,0.5*Math.floor(free/10)));
      if(g){ sciExp.pottery=(sciExp.pottery||0)+g*(sciDecree==='Ремесло'?sciBoost('Ремесло'):1)*F('pottery'); if(sciExp.pottery>=SCI.pottery.thr)sciInvent('pottery'); } }   // общий sciBoost гончарам не положен (17.10), наказ — положен
    if(!sciDone.plow){ let g=Math.min(3,INDUSTRIES.filter(r=>r.ind==='farm'&&r.workers>0).length);
      if(INDUSTRIES.some(r=>r.ind==='pasture'&&r.workers>0))g+=1;
      if(g){ sciExp.plow=(sciExp.plow||0)+g*sciBoost('Хозяйство')*F('plow'); if(sciExp.plow>=SCI.plow.thr)sciInvent('plow'); } }
    if(!sciDone.palisade){ const ri=window.__raidsInfo, src=sciSrc.palisade||(sciSrc.palisade={}); let g=0;   // «жареный петух»: набег на наших +12, 5 ходов страха после +4/ход
      if(ri){ if(ri.newRaids>0){ g=12*ri.newRaids; src['набеги на наши деревни']=(src['набеги на наши деревни']||0)+g; ri.newRaids=0; }
        else if(ri.lastRaidTurn>=0&&turn-ri.lastRaidTurn<=5){ g=4; src['страх после набега']=(src['страх после набега']||0)+g; } }
      if(g){ sciExp.palisade=(sciExp.palisade||0)+g*(sciDecree==='Оборона'?sciBoost('Оборона'):1)*F('palisade'); if(sciExp.palisade>=SCI.palisade.thr)sciInvent('palisade'); } }
    sageAsk(); }
  // вопрос мудреца: ≥2 незавершённых наук перевалили половину порога — предложить выбор (один раз до ближайшего озарения)
  function sageAsk(){ if(sciAsked||sciFocus!=null)return;
    const ripe=Object.keys(SCI).filter(id=>!sciDone[id]&&(sciExp[id]||0)>=SCI[id].thr*0.5);
    if(ripe.length<2)return; sciAsked=true; sciNeed=true;              // 30.10 (как в циве): выбор обязателен, «пусть зреет само» убрано
    evt({ icon:'owl', title:'Вопрос мудреца',
      html:`Государь, умы зреют в нескольких делах сразу, а сил на всё не хватает. На что направить думы? Выбранное дело пойдёт <b>вдвое быстрее</b>, прочие — своим чередом.`,
      buttons:ripe.slice(0,3).map(id=>({t:SCI[id].ask,cb:()=>{ sciFocus=id; sciNeed=false; glog(`Мудрец направил думы: ${SCI[id].ask.toLowerCase()} — дело пойдёт вдвое быстрее`); }})) }); }
  // 30.10 (Артём, как в циве): первый наказ — куда направить умы; без него конец хода не пускаем
  function sciAsk0(){ if(sciFocus!=null)return; sciNeed=true;
    const ids=Object.keys(SCI).filter(id=>!sciDone[id]);
    evt({ icon:'owl', title:'Куда направить умы',
      html:`Государь, перед первым ходом реши: на что направить думы старейшин? Выбранное дело пойдёт <b>вдвое быстрее</b> прочих — а когда свершится озарение, мудрец спросит снова.`,
      buttons:ids.map(id=>({t:SCI[id].ask,cb:()=>{ sciFocus=id; sciNeed=false; glog(`Мудрец направил думы: ${SCI[id].ask.toLowerCase()} — дело пойдёт вдвое быстрее`); }})) }); }
  function wetInd(r){ if(r._wet==null)r._wet=(r.cells||[]).some(c=>{ const h=HX[c]; return ctx.riverDist(h.x,h.z)<HEXR*1.2||ctx.neighbors(h).some(n=>n.type==='water'); }); return r._wet; }
  const sciSrcTxt=id=>{ const S=sciSrc[id]; if(!S)return ''; const e=Object.entries(S).sort((a,b)=>b[1]-a[1]); return e.map(([k,v])=>`${k} <b>+${Math.round(v*10)/10}</b>`).join(' · '); };
  function sciApply(id){ if(id==='pottery')sciMods.spoil=Math.min(sciMods.spoil,0.75); }
  function sciInvent(id){ if(sciDone[id])return; sciDone[id]=true; sciApply(id);
    if(sciFocus===id)sciFocus=null; sciAsked=false;                   // озарение свершилось — мудрец может спросить снова
    const s=SCI[id];
    glog(`🦉 Открытие: ${s.name}!`);
    const st=sciSrcTxt(id); evt({ icon:'owl', title:'Мудрец: '+s.name, html:`${s.see}<br><br>${s.advice}${st?`<br><br><span style="opacity:.8">Откуда пришло озарение (за ${s.thr} очков): ${st}.</span>`:''}` });   // НОВОЕ: аудиенция Мудреца — окном-пергаментом (аудиенций нет)
    if(treeEl.classList.contains('on'))openTree(); refreshPanels(); }
  // окно «Науки» по клику на колбу (index.html 5990–6050): открытые — карточки, зреющие — загадки с полоской
  { const st=document.createElement('style'); st.textContent=`
    #g-tree{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;background:#0007;backdrop-filter:blur(2px)}
    #g-tree.on{display:flex}
    #g-tree .win{width:min(880px,92vw);height:min(640px,86vh);background:#132132f2;color:#eaf2ff;
      border-radius:16px;box-shadow:0 12px 40px #000a;display:flex;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif}
    #g-tree .top{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #ffffff1a}
    #g-tree .top b{font-size:17px}
    #g-tree .x{border:0;background:#ffffff1a;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px}
    #g-tree .x:hover{background:#ffffff33}
    #g-tree .body{flex:1;overflow:auto;padding:22px;line-height:1.6;font-size:14px}
    #g-tree .body h4{margin:0 0 8px}
    #g-tree .scigrid{display:flex;flex-wrap:wrap;gap:14px;margin-top:6px}
    #g-tree .scicard{width:246px;border-radius:13px;padding:13px 15px;border:1px solid #ffd98a55;
      background:linear-gradient(180deg,#1b3050,#14233a)}
    #g-tree .scicard .nm2{font-weight:800;font-size:14.5px;color:#ffe1a0;display:flex;align-items:center;gap:7px}
    #g-tree .scicard .bon{font-size:12.3px;margin-top:7px;line-height:1.5}
    #g-tree .scicard .st{font-size:10.5px;letter-spacing:.6px;text-transform:uppercase;opacity:.55;margin-top:8px}
    #g-tree .scicard.brew{opacity:.62;border-style:dashed;border-color:#ffffff3a}
    #g-tree .scicard.brew .nm2{color:#cfdcef}
    #g-tree .pbar{height:7px;border-radius:5px;background:#ffffff1c;margin-top:9px;overflow:hidden}
    #g-tree .pbar i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#7ea6d9,#ffd98a)}
    #g-tree .src{font-size:11.3px;opacity:.75;margin-top:7px;line-height:1.45}
    #g-tree .seczone{position:relative;border:2px solid;border-radius:16px;padding:12px 16px 14px;margin:14px 0 0;cursor:pointer;transition:box-shadow .15s}
    #g-tree .seczone:hover{filter:brightness(1.07)}
    #g-tree .seczone .schead{display:flex;align-items:center;gap:9px;font-weight:800;font-size:15px;letter-spacing:.3px}
    #g-tree .seczone .hint{margin-left:auto;font-size:11.5px;font-weight:600;opacity:.6}
    #g-tree .seczone .decreeTag{position:absolute;top:-11px;right:14px;color:#fff;border:1px solid #ffffffaa;border-radius:9px;padding:2px 11px;font:700 11.5px system-ui;box-shadow:0 2px 8px #0007}`;
    document.head.appendChild(st); }
  const treeEl=document.createElement('div'); treeEl.id='g-tree';
  treeEl.innerHTML=`<div class="win"><div class="top"><b>${GI('flask',15,'#ffe1a0')} Науки</b><button class="x">✕</button></div><div class="body"></div></div>`;
  document.body.appendChild(treeEl);
  treeEl.addEventListener('click',e=>{ if(e.target===treeEl)treeEl.classList.remove('on'); });
  treeEl.querySelector('.x').onclick=()=>treeEl.classList.remove('on');
  const sciList=()=>Object.keys(SCI).map(id=>({id,name:SCI[id].name,ic:SCI[id].ic,sec:SCI[id].sec||'Прочее',thr:SCI[id].thr,brew:SCI[id].brew,bonus:SCI[id].bonus,
    exp:Math.round((sciExp[id]||0)*10)/10,done:!!sciDone[id]}));
  // 21.10 Артём: науки — по разделам, как дерево цивилизации; у «загадки» виден раздел — ясно, в какой области зреет
  const SCI_SECS=['Хозяйство','Ремесло','Оборона','Прочее'];
  function openTree(){ const L=sciList(), any=L.some(s=>s.done||s.exp>0);
    let inner;
    if(!any){
      inner=`<h4>Пока пусто</h4><p>Науки в этой игре не выбирают из списка — народ доходит до них ДЕЛОМ:
        промышляйте, храните запасы, возите еду, стройте. Когда какое-то занятие начнёт рождать открытие,
        здесь появится его карточка-загадка с растущей полоской опыта.</p>`;
    } else {
      const free=sciFree(), pct=Math.round(Math.min(0.6,free*0.04)*100);
      inner=`<p style="margin:0 0 4px;opacity:.85">${GI('owl',17,'#ffe1a0')} <b>Наказ мудрецу</b> — щёлкни по рамке направления:
        праздные руки (<b>${free}</b>) станут учиться ему, его науки зреют <b style="color:#cfe6a0">на +${pct}% быстрее</b>,
        остальные — своим чередом. Повторный щелчок снимает наказ; менять можно раз в <b>5 ходов</b>.
        Быстрее думается <b>сытому</b> городу.</p>`;
      const ZCOL={'Хозяйство':'#9fc26b','Ремесло':'#d08a5a','Оборона':'#c06a6a','Прочее':'#8fa3bf'};
      const ZIC={'Хозяйство':'wheat','Ремесло':'urn','Оборона':'fort','Прочее':'flask'};
      for(const sec of SCI_SECS){ const open=L.filter(s=>s.sec===sec&&s.done), brew=L.filter(s=>s.sec===sec&&!s.done&&s.exp>0);
        if(!open.length&&!brew.length)continue;
        const sel=sciDecree===sec, col=ZCOL[sec]||'#8fa3bf';
        inner+=`<div class="seczone" data-sec="${sec}" style="border-color:${col}${sel?'':'55'};${sel?`box-shadow:0 0 0 2px ${col}55, inset 0 0 22px ${col}22;background:${col}12`:''}">`
          +(sel?`<div class="decreeTag" style="background:${col}">⬆ наказ государя</div>`:'')
          +`<div class="schead" style="color:${col}">${GI(ZIC[sec]||'flask',18,col)} ${sec} <span class="hint">${sel?`праздные руки учатся здесь · +${pct}%`:'щёлкни — направить думы сюда'}</span></div><div class="scigrid">`
          +open.map(s=>`<div class="scicard"><div class="nm2">${GI(s.ic,16,'#ffe1a0')} ${s.name}</div><div class="bon"><b>дало:</b> ${s.bonus}</div>${sciSrcTxt(s.id)?`<div class="src"><b>откуда:</b> ${sciSrcTxt(s.id)}</div>`:''}<div class="st">изобретено ✓</div></div>`).join('')
          +brew.map(s=>`<div class="scicard brew"><div class="nm2">${GI('spark',16,'#cfdcef')} Что-то зреет…${sciFocus===s.id?` <span style="color:#ffd98a;font-size:11px;margin-left:auto">${GI('owl',12,'#ffd98a')} ×2</span>`:''}</div>
              <div class="pbar"><i style="width:${Math.min(100,Math.round(s.exp/s.thr*100))}%"></i></div>
              <div class="src">опыт копится: ${s.brew}</div>${sciSrcTxt(s.id)?`<div class="src">уже: ${sciSrcTxt(s.id)}</div>`:''}<div class="st">старейшины думают${sel?` · наказ +${pct}%`:''}${sciFocus===s.id?' · мудрец следит ×2':''}</div></div>`).join('')
          +`</div></div>`; } }
    treeEl.querySelector('.body').innerHTML=inner; treeEl.classList.add('on');
    treeEl.querySelectorAll('.seczone').forEach(z=>z.onclick=()=>{ const s=z.dataset.sec;
      if(turn-sciDecreeTurn<5){ glog(`Мудрец: наказ менять не чаще раза в 5 ходов — подожди ещё ${5-(turn-sciDecreeTurn)} х.`); return; }
      sciDecreeTurn=turn;
      if(sciDecree===s){ sciDecree=null; glog('Наказ снят — думы народа текут свободно'); }
      else { sciDecree=s; glog(`Наказ мудрецу: праздные руки учатся делу — <b>${s}</b>`); }
      openTree(); }); }

  // ---------- МОЩЕНИЕ «по приказу» за казну (index.html 7365–7379): брусчатка и выше — только с нужной эпохи ----------
  const GRADE_MIN_EP=[0,0,1,2,3,4,6];
  const EP_FROM={2:'Средневековья',3:'Нового времени',4:'Индустрии',6:'грядущих веков'};   // НОВОЕ: подпись серой кнопки «с эпохи …» (в старом кнопки до эпохи не было)
  const epIdxNow=()=>epochOf(yearOf(turn)).idx;
  function paveInfo(r){ const ri=roadInfo(r.bi,r.paved,homeOf(r)); const next=Math.max(3,ri.grade+1); if(next>6)return null;
    return { grade:next, name:GRADE_NAME[next], ok:epIdxNow()>=GRADE_MIN_EP[next],
      cost:Math.round(ri.L*7*(next-2)*(PLAYER.leaderId==='napoleon'?0.75:1)) }; }   // Наполеон: инженеры гвардии — мостить дешевле
  function paveRoad(r){ const np=paveInfo(r); if(!np||!np.ok)return;
    if(money<np.cost){ glog(`Не хватает казны на дорогу (нужно ${np.cost})`); return; }
    money-=np.cost; r.paved=np.grade; updateStats();
    glog(`Проложена дорога: ${GRADE_NAME[np.grade]} к «${r.name}» (−${np.cost})`);
    refreshPanels(); }

  // ---------- ТОРГОВЛЯ v2 (index.html 7907–8106): свой народ одевается, караваны, торговые узлы ----------
  const PRICE={ 'еда':1/5, 'древесина':1/4, 'камень':1/3, 'шкуры':1/2, 'шерсть':1/2, 'товары':2 };
  const WEAR=['шкуры','шерсть'];          // что народ носит: одежду шьют из шкур и шерсти
  const NORM_PER=30;                      // 1 единица одежды на 30 человек в ход
  let giveShare=1, content=1, fame=0;     // щедрость 1×…3×; довольство (доля покрытой нужды, 0..3); слава державы
  let marketLeft=8, boomGood=null, boomUntil=0, boomNext=12;
  const marketCap=()=>Math.round((8+epIdxNow()*4)*(freeAlly('trade')?1.5:1));   // 25.10: побратимство с торговым вольным градом — ёмкость ×1.5
  const caravans=[];                      // {k,n,gain,start,arrive,to,lostPct,pts}
  let tradeTo=null, tradeNext=0, tradeMsg='';
  const goodsTotal=()=>Object.values(STORE).reduce((s,v)=>s+v,0);
  function takeGoods(n){ if(goodsTotal()<n)return false;   // списываем с самых больших запасов (index.html 7146)
    let left=n; const ks=Object.keys(STORE).sort((a,b)=>STORE[b]-STORE[a]);
    for(const k of ks){ if(left<=0)break; const t=Math.min(STORE[k],left); STORE[k]=Math.round((STORE[k]-t)*10)/10; left-=t; }
    return true; }
  function haveOf(k){ const cap=capOf(); if(!cap)return 0;
    return k==='еда'?Math.floor(cap._store||0):k==='товары'?Math.floor(goodsTotal()):Math.floor(STORE[k]||0); }
  const realmPop=()=>{ const cap=capOf(); let p=cap?popOf(cap.size):0; LM.forEach(l=>{ if(l.rel==='ours'&&!l.capital)p+=popOf(l.size); }); return p; };
  function homeMarket(){ const cap=capOf(); if(!cap){ content=1; return; }
    const pop=realmPop(), norm=pop/NORM_PER; if(norm<=0){ content=1; return; }
    const want=norm*giveShare; let got=0, paid=0;
    for(const k of WEAR){ if(got>=want-0.01)break; const take=Math.min(STORE[k]||0,want-got);
      if(take>0){ STORE[k]=Math.round((STORE[k]-take)*10)/10; got+=take; paid+=take*PRICE[k]*0.5; } }
    money+=Math.floor(paid);                       // свои платят вполцены мировой
    content=Math.min(3,got/norm);
    if(content>1.05)fame=Math.round((fame+(content-1)*0.6)*10)/10;
    if(content<0.5&&turn%5===0)glog('🧥 Народ обносился: одежды не хватает даже на треть дворов');
    else if(content>=2&&turn%10===0)glog(`🧥 Щедрость правителя славят по всей округе (слава ${Math.round(fame)})`); }
  const moodMul=()=>content>=1?Math.min(1.4,1+(content-1)*0.4):0.9;   // сытый и одетый город манит сильнее
  function tradeNodes(){ const cap=capOf(); if(!cap)return []; const out=[];
    LM.forEach((lm,i)=>{ if(lm.capital||lm.rel==='ours')return;           // внутри державы не торгуем — это свои
      const pop=popOf(lm.size), d=wdist(lm,cap)/K;
      const friend=lm.rel==='trib'||lm.rel==='prot'?1.25:1;
      out.push({i,lm,kind:'town',pop,dist:d,weight:pop*friend/(1+d*0.02)}); });
    return out.sort((a,b)=>b.weight-a.weight); }
  // НОВОЕ: путь каравана — та же Дейкстра по графу троп, что у промыслов (бродов в новом мире нет: вода и горы — стена).
  // Нет пути — длина в клетках по прямой и вес ×0.1, как «недостижимые — в хвост» старого.
  function routeTo(node){ const cap=capOf(); if(!cap||!node)return null;
    const rt=route(), ro=rt?rt(node.lm.c):null;
    if(!ro||!ro.pts||ro.pts.length<2)return { L:Math.max(1,Math.round(wdist(node.lm,cap)/ctx.dxH)), rq:0, pts:null };
    const g=ro.avg<0.5?0:ro.avg<1.5?1:2;
    return { L:Math.max(1,ro.L), rq:g/4, pts:ro.pts }; }
  // 16.10 (Артём: «не к соседней деревне — к богатой, в отдалении»): ближе TRADE_NEAR клеток торговую цель не ищем
  // (это соседи для дани/присоединения); из дальних — самая людная; расстояние штрафует только за TRADE_FAR клеток
  const TRADE_NEAR=10, TRADE_FAR=35;
  function pickTarget(loud){ const ns=tradeNodes(), cap=capOf(); let best=null,bw=-1;
    const cells=n=>cap?wdist(n.lm,cap)/ctx.dxH:0;
    let pool=ns.filter(n=>cells(n)>=TRADE_NEAR); if(!pool.length)pool=ns;
    pool.sort((a,b)=>b.pop-a.pop);
    for(const n of pool.slice(0,6)){ const r=routeTo(n), L=r?r.L:Math.round(cells(n));
      const w=n.pop*(n.lm.rel==='trib'||n.lm.rel==='prot'?1.25:1)/(1+Math.max(0,L-TRADE_FAR)*0.04)*(r&&r.pts?1:0.1);
      if(w>bw){ bw=w; best=n; } }
    best=best||ns[0]||null;
    const changed=(best?best.i:null)!==(tradeTo?tradeTo.i:null);
    tradeTo=best; tradeNext=turn+10+Math.floor(Math.random()*6);
    if(loud&&changed&&best)glog(`🐪 Купцы проложили путь к <b>${best.lm.name||'соседям'}</b> — туда нынче выгоднее всего возить`);
    return tradeTo; }
  const say=t=>{ tradeMsg=t.replace(/\p{Extended_Pictographic}\s*/gu,''); glog(t); if(emp.classList.contains('on'))renderEmp(); };   // в окне — без эмодзи (правило: значки — силуэты GI)
  function caravanSend(k,n){ const cap=capOf(); if(!cap||!PRICE[k])return;
    n=Math.min(n,haveOf(k)); if(n<=0){ say('Грузить нечего'); return; }
    const node=tradeTo||pickTarget(false);
    if(!node){ say('🐪 Купцам некуда идти: в округе нет чужих поселений'); return; }
    const px=PRICE[k]*((boomGood===k&&turn<boomUntil)?1.5:1);
    let gain=Math.floor(n*px);
    if(gain>marketLeft){ gain=marketLeft; n=Math.floor(gain/px); }
    if(gain<=0||n<=0){ say('🐪 Караваны этого хода уже гружёны — рынок пока мал'); return; }
    const r=routeTo(node)||{L:10,rq:0,pts:null};
    const T=Math.max(1,Math.ceil(r.L/(2+r.rq*4)));                 // пешком 2 клетки за ход, по дороге быстрее
    let lost=0.15+r.L*0.004-r.rq*0.10;
    if(node.lm.rel==='trib'||node.lm.rel==='prot')lost-=0.05;      // у своих в гостях не грабят
    lost=Math.max(0.02,Math.min(0.5,lost));
    if(k==='еда')cap._store=Math.max(0,Math.round(((cap._store||0)-n)*10)/10);
    else if(k==='товары'){ if(!takeGoods(n))return; }
    else STORE[k]=Math.max(0,(STORE[k]||0)-n);
    marketLeft-=gain;
    caravans.push({ k, n, gain:Math.max(1,Math.round(gain*(1-lost))), start:turn, arrive:turn+T, to:node.lm.name||'соседям', lostPct:Math.round(lost*100),
      pts:r.pts?r.pts.map(p=>[p[0],p[1]]):null });
    say(`🐪 Караван вышел к <b>${node.lm.name||'соседям'}</b>: ${n} (${k}), путь ${T} х., в дороге теряем ~${Math.round(lost*100)}%`);
    updateStats(); refreshPanels(); redrawRoute(); }
  // 21.10 Артём: покупка с доставкой — караван с казной идёт туда-обратно (2× пути), купеческая наценка ×1.6, потери в пути — с груза
  function caravanBuy(k,n){ const cap=capOf(); if(!cap||!PRICE[k]||k==='товары')return;
    const node=tradeTo||pickTarget(false);
    if(!node){ say('🐪 Купцам не у кого покупать: в округе нет чужих поселений'); return; }
    const px=PRICE[k]*((boomGood===k&&turn<boomUntil)?1.5:1)*1.6;
    let cost=Math.ceil(n*px);
    if(cost>money){ n=Math.floor(money/px); cost=Math.ceil(n*px); }
    if(n<=0||cost<=0){ say('Казна пуста — купить не на что'); return; }
    const r=routeTo(node)||{L:10,rq:0,pts:null};
    const T=Math.max(1,Math.ceil(r.L/(2+r.rq*4)));
    let lost=0.15+r.L*0.004-r.rq*0.10;
    if(node.lm.rel==='trib'||node.lm.rel==='prot')lost-=0.05;
    lost=Math.max(0.02,Math.min(0.5,lost));
    money-=cost;
    caravans.push({ k, n, buy:1, got:Math.max(1,Math.round(n*(1-lost))), gain:0, start:turn, arrive:turn+2*T, to:node.lm.name||'соседям', lostPct:Math.round(lost*100),
      pts:r.pts?r.pts.map(p=>[p[0],p[1]]):null });
    say(`🐪 Караван ушёл к <b>${node.lm.name||'соседям'}</b> за товаром: купим ${n} (${k}) за ${cost} монет, туда и обратно ${2*T} х., в дороге растеряем ~${Math.round(lost*100)}%`);
    updateStats(); refreshPanels(); redrawRoute(); }
  function caravansTick(){ for(let i=caravans.length-1;i>=0;i--){ const c=caravans[i];
      if(turn>=c.arrive){ caravans.splice(i,1);
        if(c.buy){ const cap=capOf();
          if(c.k==='еда'&&cap)cap._store=Math.round(((cap._store||0)+c.got)*10)/10;
          else STORE[c.k]=Math.round(((STORE[c.k]||0)+c.got)*10)/10;
          say(`🐪 Караван вернулся от ${c.to}: привёз ${c.got} (${c.k}), потеряно в пути ${c.lostPct}%`); updateStats(); }
        else { money+=c.gain; say(`🐪 Караван дошёл до ${c.to}: казна +${c.gain} (потеряно в пути ${c.lostPct}%)`); } } } }
  function marketTick(){ marketLeft=marketCap();
    if(turn>=tradeNext)pickTarget(true);
    if(turn>=boomNext){ const ks=Object.keys(PRICE); boomGood=ks[Math.floor(Math.random()*ks.length)];
      boomUntil=turn+8; boomNext=turn+10+Math.floor(Math.random()*7);
      glog(`🐪 Вести с торжищ: <b>${boomGood}</b> в цене у мира (×1.5) — ближайшие 8 ходов`); } }
  // золотой пунктир пути + «вьюк» каравана; кнопка-монеты у мини-карты гасит слой (index.html 8062–8099)
  const tradeG=new THREE.Group(); scene.add(tradeG); let tBase=0, routesOn=true, lineBright=false;
  const caraMat=new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:0.95,depthTest:false});
  // 16.10 (Артём: «почему ломаная, почему пунктиром — что-то красивое полупрозрачное»): ?trl=A — плавная полупрозрачная
  // лента по земле с мягкими краями; ?trl=B — то же + блик бежит к цели. Без параметра — прежний пунктир (до выбора по кадрам).
  const tradeV=()=>{ const v=window.__tradeV??(new URLSearchParams(location.search).get('trl')||'B'); return String(v).toUpperCase(); };   // 16.10: B по умолчанию; ?trl=old — пунктир
  const ribAlpha=(()=>{ const c=document.createElement('canvas'); c.width=4; c.height=64; const g=c.getContext('2d');
    const gr=g.createLinearGradient(0,0,0,64); gr.addColorStop(0,'#000'); gr.addColorStop(0.3,'#aaa'); gr.addColorStop(0.5,'#fff'); gr.addColorStop(0.7,'#aaa'); gr.addColorStop(1,'#000');
    g.fillStyle=gr; g.fillRect(0,0,4,64); const t=new THREE.CanvasTexture(c); return t; })();
  const ribGlow=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=4; const g=c.getContext('2d');
    const gr=g.createLinearGradient(0,0,256,0); gr.addColorStop(0,'#8a7440'); gr.addColorStop(0.72,'#8a7440'); gr.addColorStop(0.9,'#ffffff'); gr.addColorStop(1,'#8a7440');
    g.fillStyle=gr; g.fillRect(0,0,256,4); const t=new THREE.CanvasTexture(c); t.wrapS=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; })();
  function tradeRibbon(pts0){ // сглаживание Чайкина ×3 → шаг ~0.5K → лента шириной 0.9K, альфа поперёк — мягкие края
    let P=pts0.map(p=>[p[0],p[1]]);
    for(let it=0;it<3;it++){ const Q=[P[0]]; for(let k=0;k<P.length-1;k++){ const [ax,az]=P[k],[bx,bz]=P[k+1];
      Q.push([ax*0.75+bx*0.25,az*0.75+bz*0.25],[ax*0.25+bx*0.75,az*0.25+bz*0.75]); } Q.push(P[P.length-1]); P=Q; }
    const S=[P[0]]; let acc=0; for(let k=1;k<P.length;k++){ const [ax,az]=S[S.length-1],[bx,bz]=P[k]; const d=Math.hypot(bx-ax,bz-az); if(d>=0.5*K||k===P.length-1)S.push(P[k]); }
    const Wd=0.45*K, pos=[], uv=[], idx=[]; let L=0;
    for(let k=0;k<S.length;k++){ const a=S[Math.max(0,k-1)], b=S[Math.min(S.length-1,k+1)]; let tx=b[0]-a[0], tz=b[1]-a[1]; const tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
      if(k>0)L+=Math.hypot(S[k][0]-S[k-1][0],S[k][1]-S[k-1][1]);
      for(const sd of[-1,1]){ const x=S[k][0]-tz*Wd*sd, z=S[k][1]+tx*Wd*sd; pos.push(x,yOn(x,z)+0.12*K,z); uv.push(L/(6*K),sd<0?0:1); }
      if(k>0){ const o=(k-1)*2; idx.push(o,o+1,o+2, o+1,o+3,o+2); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
    const B=tradeV()==='B', m=new THREE.MeshBasicMaterial({color:B?0xffffff:0xffd24a,map:B?ribGlow:null,alphaMap:ribAlpha,transparent:true,
      opacity:lineBright?0.75:0.45,depthTest:false,depthWrite:false,side:THREE.DoubleSide});
    const me=new THREE.Mesh(g,m); me.renderOrder=9; me.frustumCulled=false; me.userData.glow=B; return me; }
  function tradeFrame(dt){ if(tradeV()==='B')ribGlow.offset.x-=dt*0.35; }
  function redrawRoute(){ clearG(tradeG); const cap=capOf(); if(!routesOn||!cap)return; tBase=cap.x;
    const node=tradeTo||pickTarget(false);
    const sh=pts=>{ const sx=cap.x+wdx(pts[0][0],cap.x)-pts[0][0]; return pts.map(p=>[p[0]+sx,p[1]]); };
    if(node){ const r=routeTo(node); let pts=r&&r.pts?sh(r.pts):null;
      if(!pts||pts.length<2)pts=[[cap.x,cap.z],[cap.x+wdx(node.lm.x,cap.x),node.lm.z]];   // пути нет — хотя бы прямая нить к цели
      if(tradeV()!=='OLD'){ tradeG.add(tradeRibbon(pts)); }
      else { const v=[]; for(let k=0;k<pts.length-1;k++){ const [ax,az]=pts[k],[bx,bz]=pts[k+1]; const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/(0.8*K)));
        for(let s=0;s<n;s++){ const t=s/n, x=ax+(bx-ax)*t, z=az+(bz-az)*t; v.push(new THREE.Vector3(x,yOn(x,z)+0.3*K,z)); } }
      const l=pts[pts.length-1]; v.push(new THREE.Vector3(l[0],yOn(l[0],l[1])+0.3*K,l[1]));
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),new THREE.LineDashedMaterial({color:0xffd24a,
        dashSize:(lineBright?0.9:0.7)*K,gapSize:(lineBright?0.45:0.55)*K,transparent:true,opacity:lineBright?0.95:0.62,depthTest:false}));
      line.computeLineDistances(); line.renderOrder=9; line.frustumCulled=false; tradeG.add(line); } }
    caravans.forEach(c=>{ if(!c.pts||c.pts.length<2)return; const P=sh(c.pts);
      const f=Math.max(0,Math.min(1,(turn-c.start)/Math.max(1,c.arrive-c.start)));
      const p=P[Math.min(P.length-1,Math.round(f*(P.length-1)))];
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.6*K,0.42*K,0.34*K),caraMat); m.position.set(p[0],yOn(p[0],p[1])+0.6*K,p[1]); m.renderOrder=10;
      const tuk=new THREE.Mesh(new THREE.BoxGeometry(0.3*K,0.22*K,0.38*K),caraMat); tuk.position.y=0.32*K; m.add(tuk); tradeG.add(m); }); }
  const routesBtn=document.createElement('button'); routesBtn.id='g-routes'; routesBtn.innerHTML=GI('coins',18,'#ffd98a'); routesBtn.title='Торговые пути: показать/скрыть';
  routesBtn.style.cssText='position:fixed;left:10px;bottom:190px;z-index:9;width:34px;height:34px;border:0;border-radius:9px;background:#12233acc;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 3px 9px #0006';
  routesBtn.onclick=e=>{ e.stopPropagation(); routesOn=!routesOn; routesBtn.style.opacity=routesOn?'1':'0.45'; redrawRoute(); };
  document.body.appendChild(routesBtn);
  setTimeout(()=>{ const mmc=[...document.querySelectorAll('canvas')].find(c=>c.style.left==='10px'&&c.style.bottom==='10px');   // мини-карта big.html
    if(mmc)routesBtn.style.bottom=(mmc.offsetHeight+10+8)+'px'; },400);
  function setBright(on){ lineBright=!!on; redrawRoute(); }

  // ---------- СБОР ЗЕМЕЛЬ (index.html 5127–5221): воля, дар, защита, дань, присяга, бунт ----------
  // Воля 0..100: чем ниже, тем ближе деревня к державе (≤20 — готова войти). Дальние — упрямее.
  function ensureWill(lm){ if(lm.will==null){ const cap=capOf(), dist=cap?wdist(lm,cap)/K:40;
      const jit=Math.abs(Math.sin(lm.x*12.9898+lm.z*78.233))*18;     // детерминированный «характер» деревни
      lm.will=Math.round(Math.min(92,Math.max(35,36+dist*0.5+jit))); lm._wl=[[turn,100-lm.will,'исходная: чем дальше от столицы — тем ниже']];
      if(lm.tribRate==null)lm.tribRate=10; }
    // 23.10 (Артём, Г): черта характера — детерминированно от координат; меняет реакцию на дружину
    if(!lm.trait)lm.trait=['пугливая','гордая','торговая'][Math.min(2,Math.floor(Math.abs(Math.sin(lm.x*7.13+lm.z*3.71))*3))];
    return lm.will; }
  // 17.10 «ЛОЯЛЬНОСТЬ» (Артём: «воля некрасива»): на экране 100−воля, выше = ближе к державе; движок считает волю по-старому.
  // Каждое изменение пишется в журнал деревни lm._wl [ход, Δлояльности, причина] — клик по полосе в карточке показывает историю.
  const loyal=lm=>100-Math.round(ensureWill(lm));
  const readyJoin=lm=>Math.round(ensureWill(lm))<=20;                  // одно правило и для кнопки, и для присяги (было: кнопка по округлённой, присяга по точной — 20.4 молча отказывала)
  function willAdd(lm,d,why){ const w0=ensureWill(lm); lm.will=Math.max(0,Math.min(100,w0+d)); const real=lm.will-w0; if(Math.abs(real)<1e-6)return;
    const L=lm._wl||(lm._wl=[]), last=L[L.length-1];
    // 21.10: ежеходные капли (дрейф, дань, защита) с той же причиной сливаются в одну строку «ходы N–M» — журнал не забивается
    if(last&&last[2]===why&&turn-last[0]<=1){ if(last[0]!==turn)last[3]=last[3]??last[0]; last[0]=turn; last[1]=Math.round((last[1]-real)*10)/10; }
    else L.push([turn,Math.round(-real*10)/10,why]);
    if(L.length>40)L.splice(0,L.length-40); }
  const willWord=w=>w<=20?'готовы войти в державу':w<=40?'дружелюбны':w<=60?'насторожены':w<=80?'держатся особняком':'враждебны';
  // 18.10 «ДРУЖИНА У СТЕН» (index.html 5140–5143, 8928): наша дружина на клетке деревни или рядом — в переговорах (защита, дань)
  // воля считается на 15 ниже. Сама воля не меняется — только довод в разговоре.
  // 23.10: страх бывает живой (дружина у стен) и памятный (визит дружины, слух о штурме) — память тает к сроку _fearU
  const fearOf=lm=>{ let f=UNITS.some(u=>u.kind==='band'&&wdist(lm,HX[u.i])<=1.35*dxH)?15:0;
    if(lm._fearU&&turn<lm._fearU)f+=lm._fearV||0; return f; };
  const fearAdd=(lm,v,t)=>{ const cur=(lm._fearU&&turn<lm._fearU)?(lm._fearV||0):0;
    lm._fearV=Math.max(cur,v); lm._fearU=Math.max(lm._fearU||0,turn+t); };
  const effWill=lm=>Math.max(0,ensureWill(lm)-fearOf(lm));
  const canProtect=(lm,cap)=>!!cap&&lm.rel!=='prot'&&wdist(lm,cap)/K<=38&&popOf(lm.size)<popOf(cap.size)*0.75;
  const tribOf=lm=>Math.max(1,Math.round(popOf(lm.size)*lm.tribRate/100*0.15));
  function doGift(i){ const lm=LM[i]; if(!lm)return;
    if(!takeGoods(6)){ glog('Для дара нужно 6 товаров на складе'); return; }
    lm._giftTurn=turn; willAdd(lm,-10,'дар');
    glog(`🎁 Дар принят — «${lm.name||'деревня'}» стала дружелюбнее`); renderVillage(); }
  function doProtect(i){ const lm=LM[i], cap=capOf(); if(!lm||!canProtect(lm,cap))return;
    const w0=effWill(lm); lm.rel='prot'; willAdd(lm,Math.min(ensureWill(lm),Math.max(25,w0-30))-ensureWill(lm),'взяли под защиту');
    glog(`🛡 «${lm.name||'Деревня'}» встала под нашу защиту (мы обязаны её оборонять)`);
    evt({ icon:'shield', title:`«${lm.name||'Деревня'}» под защитой`,
      html:`Старейшины приняли покровительство: отныне мы обязаны оборонять деревню, и налётчиков сюда потянет реже. Лояльность выросла до <b>${100-Math.round(lm.will)}</b> и будет расти с каждым ходом — когда дойдёт до 80, деревня будет готова войти в державу.` });
    if(window.__fog)window.__fog.recalc(); renderVillage(); }
  function doTribute(i){ const lm=LM[i]; if(!lm)return; ensureWill(lm);
    if(lm._tribAskT!=null&&turn-lm._tribAskT<5)return;
    const wEff=effWill(lm);
    if(wEff>50&&Math.random()>=Math.max(0,(100-wEff)/50)){
      lm._tribAskT=turn; willAdd(lm,6,'обида: потребовали дань');
      glog(`💢 «${lm.name||'Деревня'}» отказалась платить дань — обида (лояльность −6), просить снова можно через 5 ходов`);
      renderVillage(); return; }
    lm.rel='trib'; lm.tribRate=lm.tribRate||10; if(window.__fog)window.__fog.recalc();
    glog(`💰 «${lm.name||'Деревня'}» согласилась платить дань`);
    evt({ icon:'coins', title:`«${lm.name||'Деревня'}» платит дань`,
      html:`Деревня согласилась отсыпать еду в наш амбар (~<b>+${tribOf(lm)} еды/ход</b>; без амбара половина сгниёт в ямах). Ставку двигай ползунком в её карточке: больше 15% — копится обида и зреет бунт, 10% и меньше — лояльность растёт и деревня привыкает к державе.` });
    renderVillage(); }
  function doAnnex(i){ const lm=LM[i]; if(!lm)return;
    if(!readyJoin(lm)){ const L=loyal(lm); evt({icon:'flag',title:`«${lm.name||'Деревня'}» не готова`,html:`Старейшины медлят: лояльность <b>${L}</b>, для присяги нужно <b>80</b> — не хватает <b>${80-L}</b>. Дары, защита и мягкая дань поднимают её; история — клик по полосе лояльности в карточке.`}); return; }
    lm.rel='ours';
    if(AI.active&&AI.tgtK===lm.c.col+','+lm.c.row){ AI.rel=Math.max(0,(AI.rel??50)-8);   // 26.10 ст.3: увели деревню у соперника из-под носа
      glog(`${COUNTRIES[AI.countryId].flag} Соперник раздосадован: мы увели «${lm.name||'деревню'}» у него из-под носа — отношение холодеет`); }
    glog(`⚑ «${lm.name||'Деревня'}» вошла в державу!`);
    evt({ icon:'flag', title:`«${lm.name||'Деревня'}» — в державе!`,
      html:`Деревня присягнула и живёт теперь своим двором, как столица: половина её жителей (<b>${Math.round(popOf(lm.size)*0.5)}</b> рук) работает на промыслах СВОЕЙ округи, кормится двор сам (излишек сдаёт в закрома державы, нехватку ему подвозят), растёт и тянет к себе окрестный люд — а часть народа понемногу перетекает в столицу. Вели новый <b>осмотр земель</b> — советник разметит угодья её округи; граница державы охватила её земли. Науки и казна — общие.` });
    recompute(); drawZones(); updateStats(); refreshPanels(); renderVillage();
    if(window.__fog)window.__fog.recalc();                             // 28.10: новый двор — новый обзор
    // 17.10: имя после присяги — следующее историческое имя города державы / оставить прежнее / своё
    const old=lm.name||'деревня', nx=peekCityName(PLAYER.countryId), esc=t=>t.replace(/[<>&"]/g,'');
    evt({icon:'flag',title:'Как назовём?',html:`«${old}» теперь наша. Дать ей имя по обычаю державы — <b>${nx}</b>, оставить прежнее или наречь по-своему?<br><br><input id="g-rnm" maxlength="24" placeholder="своё имя" style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:8px;border:1px solid #6b4a1c55;font:600 14px system-ui">`,
      buttons:[{t:`«${nx}»`,cb:()=>{ lm.name=takeCityName(PLAYER.countryId); glog(`⚑ «${old}» наречена «${lm.name}»`); renderVillage(); }},
        {t:`Оставить «${old}»`,cls:'no'},
        {t:'Своё',cb:()=>{ const v=esc(((document.getElementById('g-rnm')||{}).value||'').trim()); if(!v)return; lm.name=v; usedNames.add(v); glog(`⚑ «${old}» наречена «${v}»`); renderVillage(); }}]}); }
  // каждый ход: дрейф воли, сбор дани (в амбар столицы; без амбара половина гниёт), бунты за жадность
  let tribFood=0;
  function processWill(){ const cap=capOf(); if(!cap){ tribFood=0; return; }
    let tf=0;
    LM.forEach(lm=>{ if(lm.capital||lm.aiCapital||lm.aiOwned||lm.free)return; ensureWill(lm);   // 25.10: у вольного града своя шкала — влияние; 26.10: земли соперника живут своим законом
      lm._loyPrev=100-Math.round(lm.will);                             // 21.10: лояльность на начало хода — для стрелки тренда в карточке
      if(lm.rel==='trib'){ tf+=tribOf(lm);
        willAdd(lm,lm.tribRate>15?(lm.tribRate-15)*0.35:(lm.tribRate<=10?-0.6:-0.2),lm.tribRate>15?`дань ${lm.tribRate}% — тяжело`:'привыкают к дани');
        if(lm.will>=80){                                             // бунт за жадность (Игорь и древляне, 945)
          const greedy=lm.tribRate>15;
          const why=greedy?`задушена данью (ставка ${lm.tribRate}%)`:'терпение истощилось';
          lm.rel=null; willAdd(lm,62-lm.will,'бунт'); lm._rebelT=turn;
          glog(`🔥 «${lm.name||'Деревня'}» взбунтовалась — ${why}. Дань потеряна! Соседи насторожились`,{warn:1,at:[lm.x,lm.z]});
          LM.forEach(o=>{ if(o!==lm&&!o.capital&&!o.aiCapital&&wdist(o,lm)/K<20&&o.will!=null)willAdd(o,8,`бунт в «${lm.name||'соседней деревне'}»`); }); }
      } else if(lm.rel==='prot'){ willAdd(lm,-0.8,'под нашей защитой'); }                    // под крылом привыкают к державе
      else if(lm.rel==='ours'){                                       // 25.10 «ВЕРНОСТЬ ДВОРОВ» (Артём): у двора есть отношение к державе, он может бунтовать
        const hg=lm._hunger||0;
        if(hg>0.02)willAdd(lm,Math.min(6,hg*6),'голод двора — держава не кормит');
        else if((lm._attract||0)>0&&lm.will>6)willAdd(lm,-0.4,'сытый год');
        else if(lm.will>30)willAdd(lm,-0.2,'мирная жизнь в державе');
        if(lm._razv)willAdd(lm,2,'развёрстка — выгребают подчистую');
        if(lm._mercy&&lm.will>2)willAdd(lm,-1,'милость: излишек оставлен двору');
        const threat=RAIDS.some(r=>!r.vanish&&wdist(lm,HX[r.i])<10*dxH);
        const guard=UNITS.some(u=>u.kind==='band'&&hd(u.i,lmI(lm))<=2*dxH);
        if(threat&&guard)willAdd(lm,-1.5,'дружина у стен в лихую пору');
        else if(threat&&!guard)willAdd(lm,0.8,'лихие люди рядом — держава не шлёт защиты');
        if(lm.will>80&&Math.random()<(lm.will-80)/40){                // бунт двора: верность ниже 20 → каждый ход бросок
          lm.rel=null; delete lm._razv; delete lm._mercy;
          willAdd(lm,62-lm.will,'бунт двора'); lm._rebelT=turn;
          glog(`🔥 Двор «${lm.name||'деревня'}» отложился от державы — верность иссякла!`,{warn:1,at:[lm.x,lm.z]});
          evt({icon:'fire',title:`«${lm.name||'Двор'}» взбунтовался`,
            html:`Город вышел из державы: еды и рук его больше нет, промыслы его округи перешли к ближайшему нашему двору. Дружина, вошедшая в него, пойдёт на штурм (усмирённый станет данником). Соседи глядят на бунт и смелеют.`});
          LM.forEach(o=>{ if(o!==lm&&!o.capital&&!o.aiCapital&&o.rel!=='ours'&&wdist(o,lm)/K<20&&o.will!=null)willAdd(o,8,`бунт в «${lm.name||'соседнем дворе'}»`); });
          recompute(); drawZones(); } }
      else if(lm.rel!=='ours'&&lm.will>60){ willAdd(lm,-0.1,'страх забывается — лояльность сама ползёт к 40'); }   // дрейф ничейной деревни
      lm.will=Math.max(0,Math.min(100,lm.will));
      if(!lm.rel&&lm.will<=32&&canProtect(lm,cap)&&(lm._begT==null||turn-lm._begT>10)&&Math.random()<0.05){
        lm._begT=turn; glog(`🙏 «${lm.name||'Деревня'}» просится под нашу защиту`); } });
    tf=Math.round(tf); tribFood=tf;
    if(tf>0)cap._store=(cap._store||0)+(cap._hasGranary?tf:Math.round(tf/2)); }   // негде хранить — половина пропадает
  // действия в карточке деревни (index.html 5063–5125); вызывается из renderVillage
  function villageActs(lm){ const cap=capOf(); if(!cap||lm.capital||lm.aiCapital)return {top:'',acts:''};
    if(lm.aiOwned)return {top:`<div class="cap" style="margin:0 0 6px;color:${aiCss()}">${GI('flag',13,aiCss())} земля державы ${COUNTRIES[AI.countryId].gen} — ${AI.war?'идёт война: дружина, подошедшая вплотную, пойдёт на штурм (усмирённая станет нашим данником)':'дары и дань ей не предложить; спор за чужие земли — дело войны'}</div>`,acts:''};   // 26.10: деревня соперника; ст.4 — штурм в войну
    const w=Math.round(ensureWill(lm));
    const wcol=w<=20?'#7fd18a':w<=40?'#a9d17f':w<=60?'#ffd98a':w<=80?'#f0a56a':'#e08b8b';
    const top=(lm.rel==='prot'?`<div class="cap" style="margin:0 0 6px;color:#9cc4ff">${GI('shield',13)} под нашей защитой</div>`
      :lm.rel==='trib'?`<div class="cap" style="margin:0 0 6px;color:#ffd98a">${GI('coins',13)} платит нам дань</div>`
      :lm.rel==='ours'?`<div class="cap" style="margin:0 0 6px;color:${playerCss()}">${GI('flag',13)} земля нашей державы</div>`:'')
      +(lm.rel==='ours'?`<div class="cap" style="margin:0 0 8px">жители трудятся на державу: <b>+${Math.round(popOf(lm.size)*0.5)}</b> рабочих рук · науки и казна — общие</div>
          <div data-a="whist" style="cursor:pointer" title="клик — история верности"><div class="rr"><span class="k">верность державе <span style="opacity:.55">▾</span></span><span class="v" style="color:${wcol}">${100-w}${(()=>{ const tp=lm._loyPrev==null?0:(100-w)-lm._loyPrev;   // 25.10: верность двора = та же шкала воли
          return tp>0.05?` <span title="выросла за ход: +${Math.round(tp*10)/10}" style="color:#7fd18a">▲</span>`:tp<-0.05?` <span title="упала за ход: ${Math.round(tp*10)/10}" style="color:#e08b8b">▼</span>`:` <span title="без перемен за ход" style="opacity:.5">•</span>`; })()}</span></div><div class="wb"><i style="width:${100-w}%;background:${wcol}"></i></div></div>`
          +(lm._whOpen?`<div class="cap" style="margin:4px 0 8px;max-height:150px;overflow:auto;line-height:1.5">${(lm._wl||[]).slice().reverse().map(e=>`<div><span style="opacity:.55">${e[3]!=null&&e[3]!==e[0]?`ходы ${e[3]}–${e[0]}`:`ход ${e[0]}`}</span> · <b style="color:${e[1]>0?'#e08b8b':e[1]<0?'#7fd18a':'#ffe9c2'}">${e[2].startsWith('исходная')?e[1]:(e[1]>0?'+':'')+e[1]}</b> · ${e[2]}</div>`).join('')||'пока без перемен'}</div>`:'')
          +(w>70?`<div class="cap" style="margin:2px 0 6px;color:#e08b8b">${GI('fire',13)} двор на грани бунта — накорми, защити или ослабь поборы</div>`:'')
          +(lm._razv?`<div class="cap" style="margin:2px 0 6px;color:#e0b46a">${GI('wheat',13)} идёт развёрстка — всё сверх прожиточного уходит в закрома</div>`:'')
          +(lm._mercy?`<div class="cap" style="margin:2px 0 6px;color:#9fe0a8">${GI('gift',13)} милость — излишек остаётся двору</div>`:'')
          +`<div class="brow" style="margin:6px 0 8px"><button data-a="svy" title="советник осмотрит земли державы — угодья округи деревни (4 кольца) войдут в список под закладку промыслов">${GI('eye',13)} Осмотреть округу под промыслы</button></div>`
        :`<div class="cap" style="margin:0 0 4px;opacity:.75">нрав: <b>${lm.trait||'—'}</b></div>
          <div data-a="whist" style="cursor:pointer" title="клик — история лояльности"><div class="rr"><span class="k">лояльность — ${willWord(w)} <span style="opacity:.55">▾</span></span><span class="v" style="color:${wcol}">${100-w}${(()=>{ const tp=lm._loyPrev==null?0:(100-w)-lm._loyPrev;   // 21.10: стрелка тренда к прошлому ходу
          return tp>0.05?` <span title="выросла за ход: +${Math.round(tp*10)/10}" style="color:#7fd18a">▲</span>`:tp<-0.05?` <span title="упала за ход: ${Math.round(tp*10)/10}" style="color:#e08b8b">▼</span>`:` <span title="без перемен за ход" style="opacity:.5">•</span>`; })()}</span></div><div class="wb"><i style="width:${100-w}%;background:${wcol}"></i></div></div>`
          +(lm._whOpen?`<div class="cap" style="margin:4px 0 8px;max-height:150px;overflow:auto;line-height:1.5">${(lm._wl||[]).slice().reverse().map(e=>`<div><span style="opacity:.55">${e[3]!=null&&e[3]!==e[0]?`ходы ${e[3]}–${e[0]}`:`ход ${e[0]}`}</span> · <b style="color:${e[1]>0?'#7fd18a':e[1]<0?'#e08b8b':'#ffe9c2'}">${e[2].startsWith('исходная')?e[1]:(e[1]>0?'+':'')+e[1]}</b> · ${e[2]}</div>`).join('')||'пока без перемен'}</div>`:'')
          +(fearOf(lm)?`<div class="cap" style="margin:2px 0 6px;color:#e0b46a">${GI('swords',13)} дружина у стен — деревня сговорчивее (в переговорах лояльность считается ${100-Math.round(effWill(lm))})</div>`:'')
          +(lm._rebelT!=null&&!lm.rel?`<div class="cap" style="margin:2px 0 6px;color:#e08b8b">${GI('fire',13)} взбунтовалась (ход ${lm._rebelT}) — дружина, вошедшая в деревню, пойдёт на штурм; ополчение ≈ ${Math.max(5,Math.round(popOf(lm.size)*0.3))}, дружина бьётся ${lm.palisade?'×1.5 (частокол)':'×5'}</div>`:'')
          +(lm._closed&&!lm.rel&&lm._rebelT==null?`<div class="cap" style="margin:2px 0 6px;color:#e0b46a">${GI('fort',13)} закрыла ворота перед дружиной — вошедшая дружина пойдёт на штурм; ополчение ≈ ${Math.max(5,Math.round(popOf(lm.size)*0.3))}, дружина бьётся ${lm.palisade?'×1.5 (частокол)':'×5'}</div>`:''))
      +(lm.palisade?`<div class="cap" style="margin:0 0 6px;color:#c9a86a">${GI('timber',13)} обнесена частоколом</div>`:'');
    let acts='';
    if(!lm.scouted&&!lm.rel)return {top:`<div class="cap" style="margin:0 0 6px">${GI('eye',13)} <b>не разведана</b> — пошли разведчика (найм в карточке столицы): узнаем нрав, откроются дары, защита и дань</div>`,acts:''};   // 16.10: дипломатия — после разведки, как в старом
    if(lm.rel!=='ours'){
      const giftCd=(lm._giftTurn!=null)&&(turn-lm._giftTurn<4), goods=goodsTotal();
      const tribCd=(lm._tribAskT!=null)&&(turn-lm._tribAskT<5), we=effWill(lm);
      const tribP=we<=50?100:Math.round(Math.max(0,(100-we)/50)*100);
      if(lm.rel==='trib')acts+=`
        <div class="rr up"><span class="k">размер дани</span><span class="v">${lm.tribRate}%</span></div>
        <input type="range" min="5" max="30" step="5" value="${lm.tribRate}" data-a="rate">
        <div class="cap" style="margin-top:2px">≈ +${tribOf(lm)} еды/ход в амбар. Больше 15% — копится обида (лояльность падает), 10% и меньше — лояльность растёт.</div>`;
      acts+=`<div class="brow">
        <button data-a="gift" ${giftCd||goods<6?'disabled':''} title="${giftCd?'дары приелись — подожди пару ходов':goods<6?'нужно 6 товаров на складе':'−6 товаров со склада, лояльность +10'}">${GI('gift',13)} Поднести дар</button>
        ${lm.rel!=='prot'?`<button data-a="prot" ${canProtect(lm,cap)?'':'disabled'} title="деревня должна быть близко и заметно меньше столицы">${GI('shield',13)} Под защиту</button>`:''}
        ${lm.rel!=='trib'?`<button data-a="trib" ${tribCd?'disabled':''} title="${tribCd?('обида после отказа — жди ещё '+(5-(turn-lm._tribAskT))+' х.'):(we<=50?'деревня согласится платить':'могут отказать: шанс согласия ~'+tribP+'%; отказ — обида (лояльность −6) и 5 ходов ожидания')}">${GI('coins',13)} Потребовать дань</button>`:''}
        ${readyJoin(lm)?`<button data-a="annex" style="background:#3f7d4f">${GI('flag',13)} Принять в державу</button>`:''}
      </div>`; }
    else { acts+=`<div class="brow">
        <button data-a="razv" style="${lm._razv?'background:#8f3f2f':''}" title="${lm._razv?'прекратить изъятия':'забирать у двора всю еду сверх прожиточного: закрома наполняются быстрее, но двор живёт впроголодь и верность тает (−2/ход)'}">${GI('wheat',13)} ${lm._razv?'Отменить развёрстку':'Развёрстка'}</button>
        <button data-a="mercy" style="${lm._mercy?'background:#3f7d4f':''}" title="${lm._mercy?'снова брать излишек в закрома':'оставить двору весь излишек: закрома не пополняются, зато верность растёт (+1/ход)'}">${GI('gift',13)} ${lm._mercy?'Отменить милость':'Милость'}</button>
        <button data-a="consc" ${popOf(lm.size)>=150&&money>=20?'':'disabled'} title="${popOf(lm.size)<150?'во дворе мало народу — нужно от 150 жителей':money<20?'нужно 20 монет в казне':'собрать дружину из жителей двора: −20 монет, −30 жителей, верность −10; выступит со следующего хода'}">${GI('swords',13)} Призыв (−20 · 30 чел)</button>
      </div>`; }
    // 18.10 частокол (index.html 5088–5092): своим, данным и подзащитным — после озарения «Частокол»; цена 40 древесины (Артём: «дороже, в 2 раза» — в старом 20)
    if(['prot','trib','ours'].includes(lm.rel||'')&&sciDone.palisade&&!lm.palisade){ const wd=Math.floor(STORE['древесина']||0);
      acts+=`<div class="brow"><button data-a="pal" ${wd>=PAL_WOOD?'':'disabled'} title="${wd>=PAL_WOOD?'обнести деревню оградой из брёвен — налётчику +2 хода на грабёж':'нужно '+PAL_WOOD+' древесины на складе'}">${GI('timber',13)} Поставить частокол (−${PAL_WOOD} · есть ${wd})</button></div>`; }
    return {top,acts}; }
  const PAL_WOOD=40;
  function wireVillage(lm,i){
    vilPanel.querySelectorAll('[data-a]').forEach(el=>{ const a=el.dataset.a;
      if(a==='rate'){ el.addEventListener('pointerdown',e=>e.stopPropagation()); el.oninput=()=>{ lm.tribRate=+el.value; renderVillage(); }; return; }
      if(a==='whist'){ el.onclick=()=>{ lm._whOpen=!lm._whOpen; renderVillage(); }; return; }
      el.onclick=()=>{ const nm=lm.name||'деревня';
        if(a==='gift')doGift(i);
        else if(a==='prot')evt({ icon:'shield', title:`Взять «${nm}» под защиту?`,
          html:`Мы обязуемся оборонять «${nm}» от налётчиков — набег на неё станет ударом и по нашему имени (и подтолкнёт наши науки обороны). Взамен деревня проникнется доверием: лояльность заметно вырастет и с каждым ходом под крылом будет расти дальше — со временем деревня сама попросится в державу.`,
          buttons:[{t:'Взять под защиту',cb:()=>doProtect(i)},{t:'Отмена',cls:'no'}] });
        else if(a==='trib')doTribute(i);
        else if(a==='pal'){ const w=STORE['древесина']||0; if(w<PAL_WOOD)return;
          STORE['древесина']=Math.round((w-PAL_WOOD)*10)/10; lm.palisade=true; updateStats();
          glog(`🪵 «${nm}» обнесена частоколом`); renderVillage(); }
        else if(a==='svy'){ closeVillage(); rescan(i); }                // 23.10: осмотр из карточки деревни — советник обходит только ЕЁ округу
        else if(a==='razv'){ lm._razv=!lm._razv; if(lm._razv)delete lm._mercy;   // 25.10: указы двора
          glog(lm._razv?`🌾 Развёрстка в «${nm}»: всё сверх прожиточного — в закрома державы. Верность будет таять`:`🌾 Развёрстка в «${nm}» отменена`); renderVillage(); }
        else if(a==='mercy'){ lm._mercy=!lm._mercy; if(lm._mercy)delete lm._razv;
          glog(lm._mercy?`🎁 Милость «${nm}»: излишек остаётся двору — верность будет расти`:`🎁 Милость «${nm}» отменена — излишек снова идёт в закрома`); renderVillage(); }
        else if(a==='consc'){ if(money<20||popOf(lm.size)<150)return;
          money-=20; setSize(lm,sizeOfPop(popOf(lm.size)-30)); willAdd(lm,10,'призыв на службу');
          uSpawn('band',lmI(lm),{mp:0});
          glog(`⚔ Призыв в «${nm}»: 30 человек встали под стяг (−20 монет, верность −10). Дружина выступит со следующего хода`);
          recompute(); updateStats(); refreshPanels(); renderVillage(); }
        else if(a==='annex')evt({ icon:'flag', title:`Принять «${nm}» в державу?`,
          html:`«${nm}» готова присягнуть. Её жители вольются в рабочие руки державы, округа откроется под наши промыслы, а граница расцветёт нашим цветом. Науки и казна у державы общие. Дани с неё больше не будет — свои не платят.`,
          buttons:[{t:'Принять',cb:()=>doAnnex(i)},{t:'Отмена',cls:'no'}] }); }; }); }

  // ========== 25.10 ВОЛЬНЫЕ ГРАДЫ (Артём: «города-государства… просить военной помощи и помогать им; награды —
  // деньги на сколько-то ходов, товары или очки влияния»). Присягой не берутся, живут сами; валюта отношений — ВЛИЯНИЕ (0..100):
  // 60+ = побратимы (бонус профиля). Влияние дают дары, поручения и военная помощь; роняют отказы и просроченные обещания. ==========
  const FREE_PROF={
    trade:{nm:'торговый',ic:'coins',give:'платит ренту монетами',bonus:'ёмкость каравана ×1.5',
      reward:lm=>{ lm._rent={per:4,until:turn+10}; return 'город платит ренту: +4 монеты/ход десять ходов'; }},
    craft:{nm:'ремесленный',ic:'pick',give:'шлёт обоз товаров',bonus:'наука +1/ход',
      reward:()=>{ STORE['камень']=(STORE['камень']||0)+10; STORE['древесина']=(STORE['древесина']||0)+10; return 'обоз даров: +10 камня и +10 древесины на склад'; }},
    faith:{nm:'святой',ic:'temple',give:'славит державу',bonus:'слава +0.5/ход',
      reward:()=>{ fame=Math.round((fame+15)*10)/10; return 'молва о добром деле: слава +15'; }},
    war:{nm:'воинский',ic:'swords',give:'чтит силу — растит влияние',bonus:'подмога крепче (40 людей) и дешевле (−10 влияния)',
      reward:lm=>{ lm._inf=Math.min(100,(lm._inf||0)+10); return 'воеводы запомнили: ещё +10 влияния'; }} };
  const FREE_NAMES={trade:['Торжок','Волынь'],craft:['Кузнецк','Гончары'],faith:['Светлояр','Белозерье'],war:['Волчий Острог','Бранный Вал']};
  const freeLvl=lm=>{ const v=lm._inf||0; return v>=60?2:v>=30?1:0; };
  const FREE_LVL_NM=['чужие','знакомцы','побратимы'];
  const freeAlly=p=>LM.some(l=>(l.free===p&&(l._inf||0)>=60)||l._fprof===p);   // 26.10: присягнувший град хранит дух профиля навсегда (_fprof)
  const empPop=()=>{ const c=capOf(); return (c?popOf(c.size):0)+LM.filter(l=>l.rel==='ours'&&!l.capital).reduce((s,l)=>s+popOf(l.size),0); };
  const nearBandsOf=(lm,R)=>UNITS.filter(u=>u.kind==='band'&&!u.anim&&wdist(lm,HX[u.i])<R*dxH);
  function initFreeCities(){
    const bad=new Set([...(START.me.area||[]),...((START.ai&&START.ai.area)||[])]);
    const cands=LM.map((l,li)=>({l,li})).filter(o=>!bad.has(lmI(o.l))&&!o.l.capital&&!o.l.aiCapital
      &&wdist(o.l,START.me)/K>22&&(!START.ai||wdist(o.l,START.ai)/K>18));
    cands.sort((a,b)=>b.l.size0-a.l.size0);
    const profs=['trade','war',Math.random()<0.5?'craft':'faith'], picked=[];
    for(const o of cands){ if(picked.length>=profs.length)break;
      if(picked.some(p=>wdist(p.l,o.l)/K<22))continue; picked.push(o); }
    picked.forEach((o,k)=>{ const p=profs[k], lm=o.l;
      lm.free=p; lm.name=FREE_NAMES[p][rnd(FREE_NAMES[p].length)]; usedNames.add(lm.name);
      setSize(lm,8+rnd(2)); lm.scouted=true; lm._met=true; lm._inf=12+rnd(10); }); }
  function freeDone(lm){ const P=FREE_PROF[lm.free], what=P.reward(lm);
    lm._q=null; lm._qT=turn; lm._inf=Math.min(100,(lm._inf||0)+18);
    glog(`🤝 «${lm.name}» доволен — влияние +18; ${what}`,{at:[lm.x,lm.z]});
    evt({icon:P.ic,title:`«${lm.name}» благодарит`,html:`Слово сдержано, и вольный град платит добром: <b>${what}</b>. Влияние выросло до <b>${Math.round(lm._inf)}</b>${freeLvl(lm)>=2?' — вы <b>побратимы</b>: '+P.bonus:''}.`});
    if(vilPanel.classList.contains('on'))renderVillage(); }
  function freeTick(){ const cap=capOf(); if(!cap)return;
    LM.forEach(lm=>{ if(!lm.free){ if(lm._fprof==='craft')sci+=1; else if(lm._fprof==='faith')fame=Math.round((fame+0.5)*10)/10; return; }   // 26.10: дух присягнувшего града живёт
      if(lm._ftrib){ money+=lm._ftrib; return; }                        // 26.10: данник платит откуп — ни дружбы, ни поручений
      if(lm._inf==null)lm._inf=12+rnd(10);
      if(lm._rent){ if(turn<=lm._rent.until)money+=lm._rent.per; else delete lm._rent; }
      if(lm._inf>20)lm._inf=Math.max(20,Math.round((lm._inf-0.2)*10)/10);
    if((lm._infAi||0)>20)lm._infAi=Math.max(20,Math.round((lm._infAi-0.2)*10)/10);   // 26.10 ст.3: влияние соперника дрейфует так же   // слава тускнеет — к 20 сама
      if(lm._inf>=60){ if(lm.free==='craft')sci+=1; else if(lm.free==='faith')fame=Math.round((fame+0.5)*10)/10; }
      // 26.10 ПРИСЯГА ПО ДОБРОЙ ВОЛЕ: влияние 90+ пять ходов кряду + держава вдвое людней града → вече зовёт под руку
      if(lm._inf>=90)lm._subT=(lm._subT||0)+1; else lm._subT=0;
      if(lm._subT>=5&&(lm._subAsked==null||turn-lm._subAsked>20)&&empPop()>=popOf(lm.size)*2){ lm._subAsked=turn; freeOffer(lm); }
      const q=lm._q;
      if(q){ if(q.k==='nest'&&NESTS[q.ni]&&NESTS[q.ni].dead)freeDone(lm);
        else if(q.k==='guard'){ if(UNITS.some(u=>u.kind==='band'&&wdist(lm,HX[u.i])<2.6*dxH)){ q.prog=(q.prog||0)+1; if(q.prog>=3)freeDone(lm); } }
        else if(q.k==='rescue'){ if(!RAIDS.some(r=>!r.vanish&&wdist(lm,HX[r.i])<8*dxH)){ q.prog=(q.prog||0)+1; if(q.prog>=2)freeDone(lm); } else q.prog=0; }
        if(lm._q&&turn>q.until){ lm._q=null; lm._qT=turn; lm._inf=Math.max(0,lm._inf-6);
          glog(`⏳ «${lm.name}»: слово не сдержано — поручение истекло (влияние −6)`,{warn:1,at:[lm.x,lm.z]}); } }
      if(!lm._q&&lm.scouted){
        if(RAIDS.some(r=>!r.vanish&&wdist(lm,HX[r.i])<8*dxH)&&(lm._askT==null||turn-lm._askT>10)){   // их ПРОСЬБА о военной помощи
          lm._askT=turn; const nm=lm.name, P=FREE_PROF[lm.free];
          evt({icon:'swords',title:`«${nm}» просит подмоги`,html:`Лихие люди разбойничают у стен вольного града «${nm}». Посольство просит выслать дружину: отгоним шайку за <b>8 ходов</b> — город отблагодарит (<b>${P.give}</b>) и влияние вырастет.`,
            buttons:[{t:'Выступим',cb:()=>{ lm._q={k:'rescue',until:turn+8}; glog(`⚔ Обещана подмога «${nm}» — за 8 ходов у града не должно остаться шаек`); }},
              {t:'Не до вас',cls:'no',cb:()=>{ lm._inf=Math.max(0,lm._inf-8); glog(`«${nm}» запомнил отказ (влияние −8)`); }}]}); }
        else if((lm._qT==null||turn-lm._qT>12)&&Math.random()<0.25){ lm._qT=turn;   // обычное ПОРУЧЕНИЕ
          let q=null; let ni=-1,bd=1e9;
          NESTS.forEach((n,k)=>{ if(n.dead)return; const d=wdist(lm,HX[n.i])/K; if(d<18&&d<bd){ bd=d; ni=k; } });
          const roll=Math.random();
          if(ni>=0&&roll<0.45)q={k:'nest',ni,until:turn+15,txt:`сжечь стойбище лихих людей в округе града (${Math.round(bd)} кл.)`};
          else if(roll<0.75){ const res=STORE_RES[rnd(STORE_RES.length)]; q={k:'goods',res,n:15,until:turn+15,txt:`прислать 15 ед. товара: ${res}`}; }
          else q={k:'guard',until:turn+15,txt:'прислать дружину постоять у стен (3 хода кряду)'};
          lm._q=q; glog(`📜 Вольный град «${lm.name}» шлёт поручение: ${q.txt} (срок 15 ходов) — карточка града`,{at:[lm.x,lm.z]}); } } }); }
  // 26.10 ТРИ ДОРОГИ ПОГЛОЩЕНИЯ ГРАДА (Артём: «исторически неверно, если град не может присягнуть/платить дань»):
  // добровольная присяга (влияние 90+ пять ходов, держава ×2 людней — дух профиля навсегда), откуп силой (дружина у стен,
  // влияние в ноль, соседние грады −15), штурм (ополчение 25% жителей, дружины в бою ×5; взятый — наш, но воля 70 и грады −20).
  function freeOffer(lm){ const P=FREE_PROF[lm.free], nm=lm.name;
    evt({icon:'crown',title:`Вече «${nm}» зовёт под руку`,
      html:`Долгая дружба принесла плод: вече вольного града «${nm}» порешило просить твоего покровительства — город готов <b>присягнуть державе по доброй воле</b>. С ним придут <b>${fmtPop(popOf(lm.size))}</b> жителей, а ${P.nm} дух города останется с державой навсегда: <b>${P.bonus}</b>.`,
      buttons:[{t:'Принять под руку',cb:()=>freeJoin(lm)},
        {t:'Пусть живут вольно',cls:'no',cb:()=>glog(`Вече «${lm.name}» выслушало отказ — город остаётся вольным, дружба не тронута`)}]}); }
  function freeJoin(lm){ const p=lm.free, P=FREE_PROF[p], nm=lm.name;
    if(AI.active&&AI.cTgtK===lm.c.col+','+lm.c.row){ AI.rel=Math.max(0,(AI.rel??50)-8);   // 26.10 ст.3: град достался нам, а соперник его обхаживал
      glog(`${COUNTRIES[AI.countryId].flag} Соперник раздосадован: вольный град «${nm}» присягнул нам, а не ему — отношение холодеет`); }
    lm._fprof=p; delete lm.free; delete lm._q; delete lm._rent; delete lm._ftrib; delete lm._subT; delete lm._infAi; delete lm._subAiT;
    ensureWill(lm); lm.rel='ours'; willAdd(lm,20-lm.will,'присяга по доброй воле'); lm._rebelT=null;
    if(p==='war')uSpawn('band',lmI(lm),{mp:0,str:40});
    glog(`⚑ Вольный град «${nm}» присягнул державе по доброй воле!`,{at:[lm.x,lm.z]});
    evt({icon:'crown',title:`«${nm}» — в державе!`,
      html:`Город присягнул без единой стрелы и живёт теперь своим двором. ${P.nm[0].toUpperCase()+P.nm.slice(1)} дух его — с нами навсегда: <b>${P.bonus}</b>.${p==='war'?' Городовой полк (<b>40 ратников</b>) встал под наш стяг у стен.':''} Вели новый <b>осмотр земель</b> — советник разметит угодья его округи.`});
    recompute(); drawZones(); updateStats(); refreshPanels(); if(vilPanel.classList.contains('on'))renderVillage(); }
  function freeDemand(lm){ const nm=lm.name, pop=popOf(lm.size), mil=Math.max(5,Math.round(pop*0.3));
    const bs=nearBandsOf(lm,2.2), s=bs.reduce((a,u)=>a+u.str,0);
    if(!bs.length||s*5<mil*0.6)return;
    const per=Math.max(4,Math.round(pop/120));
    lm._ftrib=per; lm._inf=0; lm._subT=0; delete lm._q; delete lm._rent;
    LM.forEach(o=>{ if(o!==lm&&o.free&&!o._ftrib)o._inf=Math.max(0,(o._inf||0)-15); });
    glog(`⚔ «${nm}» согнулся перед силой — платит откуп ${per} монет/ход; вольные грады запомнили насильника (влияние −15)`,{warn:1,at:[lm.x,lm.z]});
    evt({icon:'coins',title:`«${nm}» платит откуп`,
      html:`Дружина у стен (${s} людей) оказалась доводом весомей всякого посольства: вече откупилось — <b>${per} монет каждый ход</b> в нашу казну. Но дружбе конец: влияние в прахе, поручений и подмоги не будет, а остальные вольные грады глядят на державу косо (<b>влияние −15</b>).`});
    if(vilPanel.classList.contains('on'))renderVillage(); }
  function freePardon(lm){ if(!lm._ftrib)return; delete lm._ftrib; lm._inf=15;
    glog(`🕊 Держава простила откуп «${lm.name}» — город снова волен; добрая молва чуть греет (влияние 15)`,{at:[lm.x,lm.z]});
    if(vilPanel.classList.contains('on'))renderVillage(); }
  function freeStorm(lm){ const nm=lm.name, ti=lmI(lm);
    const bs=nearBandsOf(lm,2.2); if(!bs.length)return;
    const sum=bs.reduce((a,u)=>a+u.str,0), pop=popOf(lm.size), mil=Math.max(5,Math.round(pop*0.25)), eff=sum*5, win=eff>=mil;
    const b=bs.slice().sort((a,c)=>c.str-a.str)[0], sumBefore=sum;
    let loss=Math.round(mil*(win?0.35:0.5)/5);
    for(const u of bs){ if(loss<=0)break; const t=Math.min(u.str-1,loss); u.str-=t; loss-=t; }
    if(win){ delete lm.free; delete lm._q; delete lm._rent; delete lm._ftrib; delete lm._subT; delete lm._infAi; delete lm._subAiT;   // силой — без духа профиля
      ensureWill(lm); lm.rel='ours'; willAdd(lm,70-lm.will,'взят приступом'); lm._rebelT=null;
      setSize(lm,sizeOfPop(Math.max(50,Math.round(pop*0.7))));
      LM.forEach(o=>{ if(o!==lm&&o.free&&!o._ftrib)o._inf=Math.max(0,(o._inf||0)-20); });
      LM.forEach(o=>{ if(o!==lm&&!o.capital&&!o.aiCapital&&!o.free&&o.rel!=='ours'&&wdist(o,lm)/K<20){ ensureWill(o); fearAdd(o,10,5); willAdd(o,3,`молва: вольный град «${nm}» взят на щит`); } });
      glog(`⚔ Вольный град «${nm}» взят приступом — город наш, но треть жителей сгинула, а воля его высока`,{warn:1,at:[lm.x,lm.z]}); }
    else { glog(`⚔ Приступ «${nm}» отбит — городовое ополчение (${mil}) устояло`,{warn:1,at:[lm.x,lm.z]});
      LM.forEach(o=>{ if(o!==lm&&o.free&&!o._ftrib)o._inf=Math.max(0,(o._inf||0)-10); }); }
    bs.forEach(uTag);
    BQ.push({bx:b.x,bz:b.z,rx:lm.x,rz:lm.z,win:win?'a':'b',a:sumBefore,b:mil,hide:[b],done:()=>{
      if(win&&UNITS.includes(b)){ b.i=ti; uPlaceAll(); }
      evt({icon:'swords',title:`Приступ «${nm}»`,html:win
        ?`Дружины у стен (${sumBefore}, в бою как <b>${eff}</b>) одолели городовое ополчение (${mil}). Город <b>взят на щит</b> и входит в державу — но дорогой ценой: <b>треть жителей сгинула или бежала</b>, воля города высока (<b>70</b>) — за ним глаз да глаз, бунт не за горами. Вольные грады запомнили расправу: <b>влияние −20</b>. Духа профиля город под мечом не дарит.`
        :`Городовое ополчение (${mil}) отбило приступ — дружины (${sumBefore}, в бою как ${eff}) отходят с потерями. Вольные грады глядят косо: <b>влияние −10</b>. Для верного приступа нужна сила впятеро меньше ополчения — собери больше дружин у стен.`});
      recompute(); drawZones(); updateStats(); refreshPanels(); if(vilPanel.classList.contains('on'))renderVillage(); }}); }
  function renderFreeCity(lm,i){ const P=FREE_PROF[lm.free], inf=Math.round(lm._inf||0), lvl=freeLvl(lm);
    const icol=inf>=60?'#7fd18a':inf>=30?'#ffd98a':'#9fb0c4';
    const goods=goodsTotal(), giftCd=(lm._giftTurn!=null)&&(turn-lm._giftTurn<4);
    const helpCost=lm.free==='war'?10:20, helpN=lm.free==='war'?40:30, helpCd=(lm._helpT!=null)&&(turn-lm._helpT<10);
    const q=lm._q, pop=popOf(lm.size);
    const bs=nearBandsOf(lm,2.2), bSum=bs.reduce((a,u)=>a+u.str,0);                 // 26.10: дружины у стен — для откупа и приступа
    const milT=Math.max(5,Math.round(pop*0.3)), milS=Math.max(5,Math.round(pop*0.25));
    const canDem=bs.length&&bSum*5>=milT*0.6, canStorm=bs.length>0;
    if(lm._ftrib){                                                                   // 26.10: ДАННИК — откуп без дружбы
      vilPanel.innerHTML=`<div class="x">✕</div>
      <h4 style="color:#c9a2ff">${GI(P.ic,17,'#c9a2ff')} ${lm.name} <span style="opacity:.5;font-weight:400;font-size:12.5px">— вольный град, данник</span></h4>
      <div class="cap" style="margin:0 0 6px">согнут силой: платит откуп в казну, но дружбы не ждёт — ни даров, ни поручений, ни подмоги</div>
      <div class="rr">${GI('people',15)}<span class="k">жителей</span><span class="v">${fmtPop(pop)}</span></div>
      <div class="rr up">${GI('coins',15)}<span class="k">откуп державе</span><span class="v" style="color:#7ed88a">+${lm._ftrib}/ход</span></div>
      <div class="brow" style="margin-top:8px">
        <button data-a="fpar" title="снять откуп — город снова волен, добрая молва (влияние 15)">${GI('gift',13)} Простить дань</button>
        <button data-a="fstorm" ${canStorm?'':'disabled'} title="${canStorm?`ополчение ≈ ${milS}, наша сила у стен ${bSum}×5 = ${bSum*5}`:'нужна дружина в соседней клетке'}">${GI('swords',13)} Взять приступом</button>
      </div>`;
      vilPanel.querySelector('.x').onclick=closeVillage;
      vilPanel.querySelectorAll('[data-a]').forEach(el=>{ el.onclick=()=>{ const a=el.dataset.a;
        if(a==='fpar')freePardon(lm);
        else if(a==='fstorm')evt({icon:'swords',title:`Идти на приступ «${lm.name}»?`,
          html:`Городовое ополчение ≈ <b>${milS}</b>, наших у стен <b>${bSum}</b> (в бою как <b>${bSum*5}</b>). Победа: город наш, но <b>треть жителей сгинет</b>, воля его будет высока, вольные грады запомнят (<b>−20 влияния</b>).`,
          buttons:[{t:'На приступ',cb:()=>freeStorm(lm)},{t:'Отставить',cls:'no'}]}); }; });
      return; }
    vilPanel.innerHTML=`<div class="x">✕</div>
      <h4 style="color:#c9a2ff">${GI(P.ic,17,'#c9a2ff')} ${lm.name} <span style="opacity:.5;font-weight:400;font-size:12.5px">— вольный град, ${P.nm}</span></h4>
      <div class="cap" style="margin:0 0 6px">вольный город-государство. Дорог к державе три: долгая дружба — до присяги по доброй воле (влияние 90+), откуп под мечом, приступ</div>
      <div class="rr">${GI('people',15)}<span class="k">жителей</span><span class="v">${fmtPop(pop)}</span></div>
      <div class="rr up"><span class="k">влияние державы — ${FREE_LVL_NM[lvl]}</span><span class="v" style="color:${icol}">${inf}</span></div>
      <div class="wb"><i style="width:${inf}%;background:${icol}"></i></div>
      ${(lm._infAi||0)>0&&AI.active?`<div class="rr"><span class="k">расположение к сопернику</span><span class="v" style="color:${aiCss()}">${Math.round(lm._infAi)}</span></div>`:''}
      <div class="cap" style="margin:4px 0 8px">${lvl>=2?`<b style="color:#7fd18a">побратимы</b>: ${P.bonus}`:`с 60 влияния — побратимы: ${P.bonus}`}</div>
      ${lm._rent&&turn<=lm._rent.until?`<div class="rr">${GI('coins',15)}<span class="k">платит ренту</span><span class="v" style="color:#7ed88a">+${lm._rent.per}/ход, ещё ${lm._rent.until-turn+1} х.</span></div>`:''}
      ${q?`<div class="rr up">${GI('scroll',15)}<span class="k">поручение</span><span class="v">${q.until-turn} х.</span></div>
        <div class="cap" style="margin:2px 0 6px">${q.txt||'отгони шайки от стен града'}${q.k==='guard'?` · у стен ходов: ${q.prog||0}/3`:q.k==='rescue'?` · округа чиста ходов: ${q.prog||0}/2`:''}</div>
        ${q.k==='goods'?`<div class="brow"><button data-a="fgive" ${(STORE[q.res]||0)>=q.n?'':'disabled'} title="${(STORE[q.res]||0)>=q.n?'отдать с нашего склада':'на складе мало: '+Math.floor(STORE[q.res]||0)+'/'+q.n}">${GI('box',13)} Отдать ${q.n} (${q.res}: есть ${Math.floor(STORE[q.res]||0)})</button></div>`:''}`
      :`<div class="cap" style="margin:2px 0 6px;opacity:.6">поручений сейчас нет — город живёт своим; загляни позже</div>`}
      <div class="brow">
        <button data-a="fgift" ${giftCd||goods<6?'disabled':''} title="${giftCd?'дары приелись — подожди пару ходов':goods<6?'нужно 6 товаров на складе':'−6 товаров со склада, влияние +10'}">${GI('gift',13)} Поднести дар</button>
        <button data-a="fhelp" ${(inf>=60&&!helpCd)?'':'disabled'} title="${inf<60?'нужно влияние 60 (побратимы)':helpCd?'подмога недавно была — жди '+(10-(turn-lm._helpT))+' х.':'город выставит '+helpN+' ратников под наш стяг (−'+helpCost+' влияния); выступят со следующего хода'}">${GI('swords',13)} Призвать подмогу (−${helpCost} вл.)</button>
      </div>
      <div class="cap" style="margin:8px 0 2px;opacity:.6">силой (дружба сгорит):</div>
      <div class="brow">
        <button data-a="fdem" ${canDem?'':'disabled'} title="${canDem?`дружина у стен (${bSum}) убедит вече: откуп ${Math.max(4,Math.round(pop/120))} монет/ход, влияние в ноль, соседние грады −15`:bs.length?`силы мало: у стен ${bSum}×5 = ${bSum*5}, вече согнётся перед ${Math.ceil(milT*0.6)} (нужна дружина ≥ ${Math.ceil(milT*0.6/5)})`:'нужна дружина в соседней клетке града'}">${GI('coins',13)} Потребовать откуп</button>
        <button data-a="fstorm" ${canStorm?'':'disabled'} title="${canStorm?`ополчение ≈ ${milS}, наша сила у стен ${bSum}×5 = ${bSum*5}${bSum*5>=milS?' — хватит':' — НЕ хватит'}`:'нужна дружина в соседней клетке града'}">${GI('swords',13)} Взять приступом</button>
      </div>`;
    vilPanel.querySelector('.x').onclick=closeVillage;
    vilPanel.querySelectorAll('[data-a]').forEach(el=>{ el.onclick=()=>{ const a=el.dataset.a;
      if(a==='fgift'){ if(!takeGoods(6))return; lm._giftTurn=turn; lm._inf=Math.min(100,(lm._inf||0)+10);
        if((lm._infAi||0)>0)lm._infAi=Math.max(0,Math.round((lm._infAi-4)*10)/10);   // 26.10 ст.3: вече смотрит на щедрейшего — наш дар теснит соперника
        glog(`🎁 Дар принят — влияние у «${lm.name}» выросло до ${Math.round(lm._inf)}`); renderVillage(); }
      else if(a==='fhelp'){ if((lm._inf||0)<60||((lm._helpT!=null)&&(turn-lm._helpT<10)))return;
        lm._inf=Math.max(0,lm._inf-helpCost); lm._helpT=turn;
        uSpawn('band',lmI(lm),{mp:0,str:helpN});
        glog(`⚔ «${lm.name}» выставил подмогу: ${helpN} ратников под нашим стягом у стен града (выступят со следующего хода)`,{at:[lm.x,lm.z]});
        renderVillage(); }
      else if(a==='fgive'){ const qq=lm._q; if(!qq||qq.k!=='goods'||(STORE[qq.res]||0)<qq.n)return;
        STORE[qq.res]=Math.round((STORE[qq.res]-qq.n)*10)/10; updateStats(); freeDone(lm); }
      else if(a==='fdem')evt({icon:'coins',title:`Потребовать откуп с «${lm.name}»?`,                 // 26.10: дань силой
        html:`Дружина у стен (<b>${bSum}</b>) — довод весомый: вече откупится <b>${Math.max(4,Math.round(pop/120))} монетами каждый ход</b>. Но дружбе конец: влияние в прах, поручений и подмоги не станет, соседние вольные грады запомнят (<b>−15 влияния</b>).`,
        buttons:[{t:'Потребовать',cb:()=>freeDemand(lm)},{t:'Отставить',cls:'no'}]})
      else if(a==='fstorm')evt({icon:'swords',title:`Идти на приступ «${lm.name}»?`,                   // 26.10: штурм града
        html:`Городовое ополчение ≈ <b>${milS}</b>, наших у стен <b>${bSum}</b> (в бою как <b>${bSum*5}</b>)${bSum*5>=milS?'':' — <b>этого мало</b>'}. Победа: город наш сразу, но <b>треть жителей сгинет</b>, воля его будет высока (бунт не за горами), вольные грады запомнят расправу (<b>−20 влияния</b>), духа профиля под мечом не получить.`,
        buttons:[{t:'На приступ',cb:()=>freeStorm(lm)},{t:'Отставить',cls:'no'}]}); }; }); }

  // ---------- ГРАНИЦА ДЕРЖАВЫ (index.html 3178–3329): узкая лента по краю зоны + градиент, тающий внутрь ----------
  // Зона = кольца тела города + 4 кольца осмотра; вошедшие деревни — по 3 кольца; зона соперника — в его цвете. Гору зона обтекает, вода — внутри.
  const zoneGs=[]; let zoneKey='';
  function drawZones(){ const cap=capOf(), ac=aiCap(), ours=LM.filter(l=>l.rel==='ours'&&!l.capital), aio=LM.filter(l=>l.aiOwned);
    const zk=(cap?`${cap.c.col},${cap.c.row}|${capCtrlR(cap)}|${playerCss()}`:'')+'|o:'+ours.map(l=>l.c.col+','+l.c.row+'/'+capCtrlR(l)).join(',')
      +(ac?`#${ac.c.col},${ac.c.row}|${capCtrlR(ac)}|${aiCss()}`:'')+'|a:'+aio.map(l=>l.c.col+','+l.c.row+'/'+capCtrlR(l)).join(',');
    if(zk===zoneKey)return; zoneKey=zk;
    zoneGs.forEach(z=>{ clearG(z.g); scene.remove(z.g); }); zoneGs.length=0;
    if(cap)zoneOf([{lm:cap,R:capCtrlR(cap)},...ours.map(l=>({lm:l,R:capCtrlR(l)}))],playerCss(),cap.x);   // 24.10: влияние двора растёт с его размером, как у столицы
    if(ac)zoneOf([{lm:ac,R:capCtrlR(ac)},...aio.map(l=>({lm:l,R:capCtrlR(l)}))],aiCss(),ac.x); }          // 26.10: земли соперника — в его зоне
  function zoneOf(centers,col,base){
    const inZ=new Set();
    for(const c of centers){ const s=HI.get(c.lm.c.col+','+c.lm.c.row); if(s===undefined)continue;   // НОВОЕ: кольца — обходом соседей (мир — кольцо по X)
      const seen=new Set([s]); let fr=[s];
      for(let d=1;d<=c.R;d++){ const nx=[]; for(const i of fr)for(const j of nbI(i)){ if(seen.has(j))continue; seen.add(j); nx.push(j); } fr=nx; }
      seen.forEach(i=>{ if(HX[i].type!=='mountain')inZ.add(i); }); }
    // 1) граничные рёбра (сосед вне зоны) + внутренняя нормаль
    const W=0.14*K, FADE=8*W, edges=[];
    inZ.forEach(i=>{ const h=HX[i], cx=base+wdx(h.x,base);
      for(const k of nbI(i)){ if(inZ.has(k))continue; const n=HX[k], nx=cx+wdx(n.x,h.x);
        const mx=(cx+nx)/2, mz=(h.z+n.z)/2; let ex=-(n.z-h.z), ez=nx-cx; const el=Math.hypot(ex,ez)||1; ex=ex/el*HEXR/2; ez=ez/el*HEXR/2;
        let ux=cx-mx, uz=h.z-mz; const ul=Math.hypot(ux,uz)||1; ux/=ul; uz/=ul;
        edges.push({ax:mx-ex,az:mz-ez,bx:mx+ex,bz:mz+ez,nx:ux,nz:uz}); } });
    if(!edges.length)return;
    // 2) сшиваем рёбра в контуры и сглаживаем Чайкиным (3 прохода), нормали — вместе с точками
    const vk=(x,z)=>`${Math.round(x*20)},${Math.round(z*20)}`;
    const norms=new Map(), vpos=new Map(), adj=new Map();
    const addV=(x,z,nx,nz,ei)=>{ const k=vk(x,z); const o=norms.get(k); if(o){ o.nx+=nx; o.nz+=nz; } else { norms.set(k,{nx,nz}); vpos.set(k,[x,z]); }
      if(!adj.has(k))adj.set(k,[]); adj.get(k).push(ei); };
    edges.forEach((e,i)=>{ addV(e.ax,e.az,e.nx,e.nz,i); addV(e.bx,e.bz,e.nx,e.nz,i); });
    const vnorm=k=>{ const s=norms.get(k), l=Math.hypot(s.nx,s.nz)||1; return [s.nx/l,s.nz/l]; };
    const usedE=new Array(edges.length).fill(false), loops=[];
    for(let i=0;i<edges.length;i++){ if(usedE[i])continue; usedE[i]=true;
      const kStart=vk(edges[i].ax,edges[i].az); let cur=vk(edges[i].bx,edges[i].bz), closed=false; const chain=[kStart,cur];
      for(let guard=0;guard<edges.length+2;guard++){ const nxt=(adj.get(cur)||[]).find(j=>!usedE[j]); if(nxt===undefined)break;
        usedE[nxt]=true; const e=edges[nxt], ka=vk(e.ax,e.az), kb=vk(e.bx,e.bz), to=(ka===cur)?kb:ka;
        if(to===kStart){ closed=true; break; } chain.push(to); cur=to; }
      if(chain.length<3)continue;
      loops.push({closed,pts:chain.map(k=>{ const [x,z]=vpos.get(k), [nx,nz]=vnorm(k); return {x,z,nx,nz}; })}); }
    const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,nx:a.nx+(b.nx-a.nx)*t,nz:a.nz+(b.nz-a.nz)*t});
    const chaikin=(P,closed)=>{ const n=P.length, Q=[], lim=closed?n:n-1;
      for(let i=0;i<lim;i++){ const a=P[i], b=P[(i+1)%n]; Q.push(mix(a,b,0.25),mix(a,b,0.75)); }
      if(!closed){ Q.unshift(P[0]); Q.push(P[n-1]); } return Q; };
    loops.forEach(L=>{ for(let it=0;it<3;it++)L.pts=chaikin(L.pts,L.closed); L.pts.forEach(p=>{ const l=Math.hypot(p.nx,p.nz)||1; p.nx/=l; p.nz/=l; }); });
    const g=new THREE.Group(); g.renderOrder=6;
    // 3) полоса-градиент от внутренней кромки ленты: у линии плотно (0.42), к центру — ноль
    const C=new THREE.Color(col).offsetHSL(0,-0.18,-0.06), A0=0.42, gp=[], gc=[];
    const yG=(x,z)=>Math.max(heightAt(x,z),-0.62)+0.175*K, push=(x,z,a)=>{ gp.push(x,yG(x,z),z); gc.push(C.r,C.g,C.b,a); };
    loops.forEach(L=>{ const P=L.pts, n=P.length, lim=L.closed?n:n-1;
      for(let i=0;i<lim;i++){ const a=P[i], b=P[(i+1)%n];
        const aox=a.x+a.nx*W, aoz=a.z+a.nz*W, box=b.x+b.nx*W, boz=b.z+b.nz*W;
        const aix=a.x+a.nx*(W+FADE), aiz=a.z+a.nz*(W+FADE), bix=b.x+b.nx*(W+FADE), biz=b.z+b.nz*(W+FADE);
        push(aox,aoz,A0); push(box,boz,A0); push(bix,biz,0); push(aox,aoz,A0); push(bix,biz,0); push(aix,aiz,0); } });
    if(gp.length){ const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3)); gg.setAttribute('color',new THREE.Float32BufferAttribute(gc,4));
      const m=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
      m.renderOrder=6; m.frustumCulled=false; g.add(m); }
    // 4) тонкая лента — сама линия границы, по той же кривой, поверх градиента (цвет державы, приглушён: −0.18 насыщ., −0.06 ярк., прозрачность 0.5)
    const pos=[], yL=(x,z)=>Math.max(heightAt(x,z),-0.62)+0.20*K, P3=(x,z)=>pos.push(x,yL(x,z),z);
    loops.forEach(L=>{ const P=L.pts, n=P.length, lim=L.closed?n:n-1;
      for(let i=0;i<lim;i++){ const a=P[i], b=P[(i+1)%n];
        const a1x=a.x-a.nx*W, a1z=a.z-a.nz*W, a2x=a.x+a.nx*W, a2z=a.z+a.nz*W, b1x=b.x-b.nx*W, b1z=b.z-b.nz*W, b2x=b.x+b.nx*W, b2z=b.z+b.nz*W;
        P3(a1x,a1z); P3(a2x,a2z); P3(b1x,b1z); P3(a2x,a2z); P3(b2x,b2z); P3(b1x,b1z); } });
    if(pos.length){ const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      const m=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:new THREE.Color(col).offsetHSL(0,-0.18,-0.06),transparent:true,opacity:0.5,depthWrite:false,side:THREE.DoubleSide}));
      m.renderOrder=7; m.frustumCulled=false; g.add(m); }
    scene.add(g); zoneGs.push({g,base}); }

  // ---------- сброс / сохранение шага 2 ----------
  function econ2Reset(){ for(const k of Object.keys(sciExp))delete sciExp[k]; for(const k of Object.keys(sciDone))delete sciDone[k]; for(const k of Object.keys(sciSrc))delete sciSrc[k];
    sciMods.birth=sciMods.death=sciMods.spoil=1; treeEl.classList.remove('on');
    giveShare=1; content=1; fame=0; marketLeft=8; boomGood=null; boomUntil=0; boomNext=12; caravans.length=0; tradeTo=null; tradeNext=0; tradeMsg=''; tribFood=0;
    clearG(tradeG); zoneGs.forEach(z=>{ clearG(z.g); scene.remove(z.g); }); zoneGs.length=0; zoneKey='';
    evtQ.length=0; evtEl.classList.remove('on'); }
  const econ2Save=()=>({ sci:{exp:{...sciExp},done:{...sciDone},mods:{...sciMods},src:JSON.parse(JSON.stringify(sciSrc))},
    trade:{giveShare,fame,caravans:caravans.slice(),tradeNext,to:tradeTo?tradeTo.i:null,routes:routesOn,boomGood,boomUntil,boomNext} });
  function econ2Load(d){ if(!d)return;
    if(d.sci){ Object.assign(sciExp,d.sci.exp||{}); Object.assign(sciDone,d.sci.done||{}); Object.assign(sciMods,d.sci.mods||{}); Object.assign(sciSrc,d.sci.src||{}); }
    const t=d.trade; if(t){ giveShare=t.giveShare||1; fame=t.fame||0; tradeNext=t.tradeNext||0; routesOn=t.routes!=null?!!t.routes:true;
      boomGood=t.boomGood||null; boomUntil=t.boomUntil||0; boomNext=t.boomNext||12;
      caravans.length=0; (t.caravans||[]).forEach(c=>caravans.push(c)); tradeTo=t.to!=null?(tradeNodes().find(n=>n.i===t.to)||null):null; }
    routesBtn.style.opacity=routesOn?'1':'0.45'; }


  // ================= ЮНИТЫ, ШАГ 1 (initUnits старого, index.html 8307–8951): найм, выбор, ход, путь под курсором, разведка =================
  // Перенос 16.10 по описи (DECISIONS 16.10: 12 пунктов + карусель «город ↔ отряд» на клетке поселения). Варвары, бой, лечение — шаг 2.
  // Числа и тексты — старые. НОВОЕ: граф ходьбы — общий с тропами (глубокая река — стена, брод +2 как riverCross старого);
  // фигуры — units.js (люди на шарнирах), масштаб ×US; на дальнем зуме растут вместе с дальностью камеры (unitsZoom старого).
  const UCOST={meadow:1,field:1,village:1,dry:1.1,savanna:1.1,tundra:1.5,hills:2.2,desert:2.5,forest:3,pines:3,jungle:4,snow:4,marsh:5};   // §13: луг 1 … болото 5; джунгли — дороже леса (новый биом)
  const US=3.0;                                                       // фигура 0.6 → 1.8 на карте (хата в деревне ≈ 2): отряд читается, как в Civ
  const UNITS=[]; let uSel=null, uPrevI=-1, uPrevPath=null, uLastTouch=null;   // uLastTouch — 30.10: фокус на последний тронутый юнит после конца хода
  const UG=()=>ctx.unitGraph();
  const capI=()=>{ const c=capOf(); return c?HI.get(c.c.col+','+c.c.row):-1; };
  const lmAtI=i=>{ const k=byKey.get(HX[i].col+','+HX[i].row); return k===undefined?-1:k; };
  function edgeIJ(i,j){ const a=UG().adj[i]; if(!a)return -1; for(const [n,e] of a)if(n===j)return e; return -1; }
  function stepCost(i,j,roads=true){ const g=UG(), e=edgeIJ(i,j); if(e<0)return 1e9;
    let c=UCOST[HX[j].type]??2; const gr=roads?g.grade(e):0;          // варвары дорог не используют (§13)
    if(gr>0)c=Math.min(c,gr>=2?0.35:0.5);                             // дорога ЗАМЕНЯЕТ цену клетки (тропа 0.5 / тракт 0.35), как в старом
    if(g.eFord[e]>0)c+=2;                                             // переправа вброд
    return c; }
  const uD=new Float64Array(HX.length), uP=new Int32Array(HX.length), uDn=new Uint8Array(HX.length);
  function uPath(src,dst,roads=true){ if(src===dst)return [src]; const g=UG(); if(!g.adj[src]||!g.adj[src].length||!g.adj[dst]||!g.adj[dst].length)return null;
    uD.fill(Infinity); uP.fill(-1); uDn.fill(0); uD[src]=0; const h=[src];
    const up=k=>{ while(k>0){ const p=(k-1)>>1; if(uD[h[k]]<uD[h[p]]){ const t=h[k]; h[k]=h[p]; h[p]=t; k=p; } else break; } };
    const down=()=>{ let k=0; for(;;){ const l=2*k+1, r=l+1; let m=k; if(l<h.length&&uD[h[l]]<uD[h[m]])m=l; if(r<h.length&&uD[h[r]]<uD[h[m]])m=r; if(m===k)break; const t=h[k]; h[k]=h[m]; h[m]=t; k=m; } };
    while(h.length){ const v=h[0], last=h.pop(); if(h.length){ h[0]=last; down(); }
      if(uDn[v])continue; uDn[v]=1; if(v===dst)break;
      for(const [n,e] of g.adj[v]){ if(uDn[n])continue; let c=UCOST[HX[n].type]??2; const gr=roads?g.grade(e):0; if(gr>0)c=Math.min(c,gr>=2?0.35:0.5); if(g.eFord[e]>0)c+=2;
        const nd=uD[v]+c; if(nd<uD[n]){ uD[n]=nd; uP[n]=v; h.push(n); up(h.length-1); } } }
    if(!uDn[dst])return null; const p=[dst]; for(let v=dst;v!==src;v=uP[v])p.push(uP[v]); return p.reverse(); }
  function turnsFrom(path,u){ if(!path||path.length<2)return 0;      // 0 = дойдёт ЭТИМ же ходом (вход в клетку — пока очки > 0, как в Civ)
    let t=u.mp>0?0:1, mp=u.mp>0?u.mp:u.mpMax;
    for(let k=1;k<path.length;k++){ const c=stepCost(path[k-1],path[k]); if(c>=1e9)return 99; if(mp<=0){ t++; mp=u.mpMax; } mp-=c; }
    return t; }
  // --- место фигуры на клетке: у поселения — на край клетки и мельче (×0.62); двое и больше — по углам ---
  function uTarget(u){ const c=HX[u.i], mates=UNITS.filter(o=>o.i===u.i); let o=[0,0];
    if(mates.length>1){ if(u.kind==='scout')o=[0.62,0.36]; else { const wi=mates.filter(x=>x.kind==='band').indexOf(u); o=[[-0.5,-0.3],[0.45,-0.42],[0,0.58]][(wi<0?0:wi)%3]; } }
    const setl=lmAtI(u.i)>=0; if(setl)o=[o[0]*0.3+1.31,o[1]*0.3+0.83];
    return {x:c.x+o[0]*K,z:c.z+o[1]*K,setl}; }
  function uTag(u){ if(u.kind!=='band'&&u.kind!=='raid')return;                         // люди отряда = его сила: число на значке над отрядом (18.10: значок рода войск — units.js mkBadge)
    if(u._tagV===u.str)return; u._tagV=u.str; u.g.userData.setStr(u.str); }
  function uSpawn(kind,i,o={}){ const g=ctx.units.mkUnit(kind==='scout'?'scout':'band',{col:playerCss()}); scene.add(g);
    const mpk=kind==='scout'?4:3;                                      // 30.10 (Артём: «слишком много action-поинтов»): разведчик 4, дружина 3 (было 6/6)
    const u={kind,i,path:o.path||[],mpMax:mpk,mp:o.mp??mpk,str:o.str??(kind==='band'?30:0),g,sleep:!!o.sleep,skipT:o.skipT??-1,broke:!!o.broke,anim:null,x:0,z:0,setl:false};
    UNITS.push(u); const p=uTarget(u); u.x=p.x; u.z=p.z; u.setl=p.setl; uTag(u);
    for(const o2 of UNITS)if(o2!==u&&o2.i===i&&!o2.anim){ const q=uTarget(o2); o2.x=q.x; o2.z=q.z; }
    return u; }
  function uKill(u){ scene.remove(u.g); const k=UNITS.indexOf(u); if(k>=0)UNITS.splice(k,1); if(uSel===u)uDesel(); }
  function uPlaceAll(){ for(const u of UNITS)if(!u.anim){ const q=uTarget(u); u.x=q.x; u.z=q.z; u.setl=q.setl; } }
  // --- шаг: идёт СРАЗУ на остаток очков; фигуры шагают по клеткам (0.35 с на клетку) ---
  // 23.10 (Артём): бой — как в Civ. На клетку с живым стойбищем/бунтующей деревней дружина НЕ входит:
  // останавливается в соседней, бой оттуда (анимация между клетками), победа — заняла клетку; бой съедает весь ход (mp=0).
  function hostileAt(i,ai){ const n=NESTS.find(n=>!n.dead&&n.i===i&&turn>=n.sleepUntil); if(n)return{nest:n,i};
    if(!ai&&AI.war&&AIB&&AIB.i===i)return{aib:1,i};                    // 26.10 ст.4: в войну дружина соперника — враг (бой из соседней клетки, как всё у нас)
    const li=lmAtI(i); if(li>=0){ const lm=LM[li];
      if(!ai&&AI.war&&lm.aiOwned)return{ailm:lm,i};                    // 26.10 ст.4: его владение в войну берётся штурмом (усмирённое — наш данник)
      if(!lm.capital&&!lm.aiCapital&&!lm.aiOwned&&!lm.rel&&(lm._rebelT!=null||lm._closed))return{lm,i}; }   // 23.10: закрытая (гордая) деревня тоже берётся штурмом
    return null; }
  function uWalkNow(u){ const raid=u.kind==='raid', pts=[{x:u.x,z:u.z}], trod=[];   // trod — клетки, пройденные этим шагом (транзит считается)
    let foe=null;
    while(u.path.length&&u.mp>0){ const nxt=u.path[0], c=stepCost(u.i,nxt,!raid); if(c>=1e9){ u.path.length=0; break; }
      if(!raid&&u.kind==='band'&&(foe=hostileAt(nxt))){ u.path.length=0; u.mp=0; break; }   // стоп в соседней клетке: дальше — бой
      u.mp-=c; u.i=nxt; u.path.shift(); trod.push(nxt); const q=tgtOf(u), pr=pts[pts.length-1]; pts.push({x:pr.x+wdx(q.x,pr.x),z:q.z}); }
    if(pts.length>1){ u.anim={pts,seg:0,t:0}; u.g.userData.mode('go'); u._animEnd=performance.now()+(pts.length-1)*350+150; }
    if(raid){ if(!u.anim){ const q=rTarget(u); u.x=q.x; u.z=q.z; u.setl=q.setl; } return; }
    uPlaceAll();
    if(window.__fog)window.__fog.recalc();                             // 28.10: отряд прошёл — туман отступил (old.html 8552)
    if(u.kind==='band'){ battles(); nestRaid(u,trod); if(foe)foe.nest?nestAssault(u,foe.nest):foe.aib?aibClash(u):foe.ailm?aiStorm(u,foe.ailm,foe.i):punitive(u,foe.lm,foe.i); }   // 26.10 ст.4: война — сеча с его дружиной, штурм его владений
    if(u.kind==='scout')scoutReveal(u,trod);               // 20.09 старого: сеча сразу при шаге; 25.09: ступила на стойбище — разорение
    if(u.kind==='band')bandReveal(u,trod);                 // 23.10 (Артём): дружина тоже знакомится — но её встречают страхом и недоверием
    if(uSel===u){ uDrawSel(); uCard(); } }
  function uGoHome(u){ const ch=capI(); if(ch<0)return; const p=uPath(u.i,ch); u.path=p?p.slice(1):[]; }
  // --- разведка: дошёл до деревни — открыл её (index.html 8468) ---
  // 17.10 (Артём: «зашёл разведчиком в деревню — ничего не сказали»): встреча — в ЛЮБОЙ деревне, в т.ч. знакомой с начала (округа
  // столицы) и при проходе НАСКВОЗЬ (клетки шага trod), а не только в конце пути. +5 монет — лишь за неразведанную; окно — один раз (_met).
  function scoutReveal(u,trod){ const cells=[...(trod||[]),u.i];
    LM.forEach((lm,li)=>{ if(lm.capital||lm.aiCapital||lm._met)return;
      if(!cells.some(i=>wdist(lm,HX[i])<1.2*dxH))return;
      const fresh=!lm.scouted; lm.scouted=true; lm._met=true;
      if(fresh){ money+=5; updateStats(); }
      glog(fresh?`🥾 Разведчик добрался до «${lm.name||'деревни'}» — обмен вестями принёс +5 монет`:`🥾 Разведчик заглянул в «${lm.name||'деревню'}»`,{at:[lm.x,lm.z]});
      const w=Math.round(ensureWill(lm)), nm=lm.name||'деревня';
      // 21.10 Артём: «реплики одинаковые» — по 3 варианта на каждый нрав, выбирается случайный
      const MOODS= w>80?[`Жители «${nm}» встречают чужака угрюмо: ворота на засов, из-за тына глядят копья. Разговор вышел коротким и колючим.`,
          `В «${nm}» разведчика встретили псами и бранью — едва упросил старика у околицы перемолвиться словом через плетень.`,
          `«${nm}» чужаков не жалует: бабы попрятали детей, мужики встали стеной у ворот. Ушёл, пока цел.`]
        : w>60?[`В «${nm}» разведчика встретили настороженно: хлеба не вынесли, но и не прогнали — расспросили, кто таков и чей будет.`,
          `«${nm}» глядит исподлобья: пустили переночевать в сенях, но глаз с гостя не спускали и лишнего не сказывали.`,
          `В «${nm}» долго выспрашивали, чьих будет и зачем пожаловал. Отвечали скупо, но дорогу дальше показали.`]
        : w>40?[`«${nm}» приняла гостя сдержанно, но по-людски: пустили к костру, расспросили о столице и дорогах.`,
          `В «${nm}» гостю налили ухи и выспросили все вести. Народ степенный: худого не замышляют, но и в друзья не набиваются.`,
          `«${nm}» встретила без песен, но с хлебом: обменялись новостями, старейшина выспрашивал о порядках в державе.`]
        : [`В «${nm}» разведчику обрадовались: усадили за стол, наперебой расспрашивали о державе — здесь о нас наслышаны и настроены дружески.`,
          `«${nm}» встретила как родного: истопили баню, созвали соседей слушать вести из столицы. О державе тут говорят с уважением.`,
          `В «${nm}» гостя водили от двора ко двору: каждому любопытно про столицу. Провожали всей деревней и звали заходить ещё.`];
      const mood=MOODS[rnd(MOODS.length)];
      setTimeout(()=>evt({ icon:'eye', title:fresh?`Разведана «${nm}»`:`Разведчик в «${nm}»`,
        html:`${mood}<br><br>${fresh?'Что узнали':'Как живут'}: жителей <b>${fmtPop(popOf(lm.size))}</b>, нрав — <b>${willWord(w)}</b> (лояльность ${100-w}).${fresh?' Обмен вестями и мелким товаром принёс <b>+5 монет</b>.':''} С деревней можно говорить: дары, защита, дань — открой её карточку кликом.`,
        buttons:[{t:'Показать на карте',cb:()=>flyNear(lm.x,lm.z)},{t:'Понятно',cls:'no'}] }),
        Math.max(0,(u._animEnd||0)-performance.now())+60);
      if(vilIdx===li)renderVillage(); }); }
  // 23.10 (Артём): дружина в деревне = находка, но встреча иная — страх и недоверие вместо торговли вестями.
  // Черта (Г): пугливая — страх сильнее; гордая — ворота на засов (_closed: можно штурмовать) и больше недоверия; торговая — мягче всех.
  function bandReveal(b,trod){ const cells=[...(trod||[]),b.i];
    LM.forEach((lm,li)=>{ if(lm.capital||lm.aiCapital||lm._met||lm.rel==='ours')return;
      if(!cells.some(i=>wdist(lm,HX[i])<1.2*dxH))return;
      lm.scouted=true; lm._met=true;
      const w=Math.round(ensureWill(lm)), tr=lm.trait, nm=lm.name||'деревня';
      const closed=tr==='гордая'&&w>55&&lmAtI(b.i)!==li;              // гордая и непокорная — закрылась (не успеет, если дружина уже в ней)
      if(closed)lm._closed=true;
      const fv=Math.round((8+b.str/4)*(tr==='пугливая'?1.5:tr==='гордая'?0.6:1));
      fearAdd(lm,fv,6);
      willAdd(lm,tr==='гордая'?6:tr==='торговая'?2:4,'вооружённые гости у ворот');
      glog(`⚔ Дружина дошла до «${nm}» — встречали ${closed?'запертыми воротами':'настороженно'}`,{at:[lm.x,lm.z]});
      const TXT= closed?[`Ворота «${nm}» затворили ещё до подхода дружины: гордый народ чужой силе не кланяется. Со стен глядят молча — ни хлеба, ни слова.`,
          `«${nm}» заперлась: тын усилен кольями, у ворот дозор. Старейшина крикнул со стены: «Ступайте своей дорогой — силой нас не возьмёте!»`]
        : tr==='пугливая'?[`В «${nm}» дружину встретили с ужасом: бабы попрятались, мужики вынесли хлеб-соль дрожащими руками. Покорность — от страха, не от любви.`,
          `«${nm}» замерла при виде оружия: ни спора, ни торга — всё вынесли сами, лишь бы ушли скорее. Такой страх помнится долго.`]
        : tr==='торговая'?[`В «${nm}» дружину приняли расчётливо: накормили, расспросили о ценах и дорогах. Торговый люд с сильными не ссорится — но и не доверяет.`,
          `«${nm}» встретила воинов без страха, но с прищуром: старшина сторговал постой за два горшка мёда и проводил до околицы.`]
        : [`В «${nm}» дружину встретили настороженно: ворота не заперли, но копья держали под рукой. Говорили скупо, глядели исподлобья.`,
          `«${nm}» приняла воинов у околицы, в дома не позвала. Старики шепчутся: «пришли с железом — с железом и спрос».`];
      const mood=TXT[rnd(TXT.length)];
      setTimeout(()=>evt({ icon:'swords', title:`Дружина в «${nm}»`,
        html:`${mood}<br><br>Что узнали: жителей <b>${fmtPop(popOf(lm.size))}</b>, нрав — <b>${willWord(w)}</b>, деревня <b>${tr}</b>. Страх перед силой сделал её сговорчивее на время, но недоверие к державе подросло.${closed?'<br><br><b>Деревня закрылась</b> — дружина может взять её штурмом: прикажи войти в деревню.':''}`,
        buttons:[{t:'Показать на карте',cb:()=>flyNear(lm.x,lm.z)},{t:'Понятно',cls:'no'}] }),
        Math.max(0,(b._animEnd||0)-performance.now())+60);
      if(vilIdx===li)renderVillage(); }); }
  function uInitScout(){ const cap=capOf(); if(!cap)return;            // округа столицы (9 клеток) знакома сразу
    LM.forEach(lm=>{ if(!lm.capital&&!lm.aiCapital&&wdist(lm,cap)<9*dxH)lm.scouted=true; }); }
  // --- найм (кнопки в карточке столицы) ---
  function uHire(kind,num){ const cap=capOf(); if(!cap)return false; const ch=capI();
    if(kind==='scout'){ if(UNITS.some(u=>u.kind==='scout'))return false;
      if((cap._store||0)<5){ glog('🥾 Не из чего собрать котомку — нужно 5 еды в запасе'); return false; }
      cap._store=Math.round((cap._store-5)*10)/10; uSelect(uSpawn('scout',ch,{mp:0})); updateStats();   // 30.10 (Артём): как в циве — созданный в этот ход не ходит
      glog('🥾 Разведчик снаряжён (−5 еды). В походе — 2 монеты/ход жалованья. Выступит со следующего хода'); return true; }
    if(kind==='band'){                                                // 25.10 (Артём): ползунок людей; войско — из СВОБОДНЫХ жителей, цена 2 монеты за человека
      const n=Math.max(10,Math.min(50,Math.round(num||30))), cost=n*2;
      if(money<cost){ glog(`⚔ Не хватает казны на дружину (нужно ${cost})`); return false; }
      const p0=popOf(cap.size);
      const idle=Math.max(0,laborPool()-INDUSTRIES.reduce((s,r)=>s+r.workers,0));
      if(n>idle){ glog(`⚔ Свободных людей не хватает (праздных ${idle}, нужно ${n}) — сними людей с промыслов`); return false; }
      if(p0-n<40){ glog('⚔ Город опустеет — в нём должно остаться хотя бы 40 жителей'); return false; }
      money-=cost; setSize(cap,sizeOfPop(p0-n));
      uSelect(uSpawn('band',ch,{mp:0,str:n})); recompute(); updateStats();  // 25.10 (Артём): сборы — выступает со следующего хода
      glog(`⚔ Дружина собрана (−${cost} монет, ${n} человек из города). В походе — 1 монета за 10 людей в ход; выступит со следующего хода`); return true; }
    return false; }
  // --- ход: жалованье в походе, шаг по пути, разведка (tick старого, 8700–8709) ---
  function unitsTick(){ const cap=capOf(); if(!cap)return; const ch=capI();
    for(const u of UNITS.slice()){ const home=u.i===ch, up=u.kind==='scout'?2:Math.ceil(u.str/10);   // дружина — 1 монета за 10 людей
      if(!home){ if(money>=up)money-=up;
        else if(!u.broke){ u.broke=true; uGoHome(u); glog(u.kind==='scout'?'🥾 Казна пуста — разведчик бредёт домой':'⚔ Казна пуста — дружина возвращается'); } }
      else u.broke=false;
      if(u.kind==='band'&&u.str<30&&!u.path.length)u.str=Math.min(30,u.str+restRate(u));   // отдых-лесенка: люди прибывают там, где жильё
      u.mp=u.mpMax; uWalkNow(u); }
    raidsTick();
    for(const u of UNITS)uTag(u); for(const r of RAIDS)uTag(r);
    if(uSel){ uDrawSel(); uCard(); } }
  const uDuties=()=>UNITS.filter(u=>u.mp>0&&!u.path.length&&!u.sleep&&u.skipT!==turn);   // дела хода: отряд ждёт приказа
  // --- выбор: кольцо, пунктир пути, цифра ходов на клетке-цели, карточка отряда ---
  let selG=null;                                                        // 18.10 (Артём): жёлтое кольцо выбора убрано — выбранному отряду включается его кольцо цвета державы (units.js sel)
  const selMark=g=>{ if(selG&&selG!==g)selG.userData.sel(false); selG=g; if(g)g.userData.sel(true); };
  const routeG=new THREE.Group(); scene.add(routeG); let routeBase=0;
  const dotGeo=new THREE.CylinderGeometry(0.12*K,0.12*K,0.05,10);
  const dotMat=new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:0.95,depthWrite:false,depthTest:false});   // сквозь лес и холмы, как в Civ
  function clearRoute(){ while(routeG.children.length)routeG.remove(routeG.children[routeG.children.length-1]); }
  function drawRoute(path){ clearRoute(); if(!path||path.length<2)return;
    const STEP=1.15*K; let px=HX[path[0]].x; routeBase=px;
    for(let k=1;k<path.length;k++){ const a=HX[path[k-1]], b=HX[path[k]], ax=px, bx=px+wdx(b.x,a.x), len=Math.hypot(bx-ax,b.z-a.z), n=Math.max(1,Math.round(len/STEP));
      for(let s=1;s<=n;s++){ const t=s/n, x=ax+(bx-ax)*t, z=a.z+(b.z-a.z)*t;
        const d=new THREE.Mesh(dotGeo,dotMat); d.position.set(x,heightAt(normX(x),z)+0.22*K,z); d.renderOrder=9; routeG.add(d); }
      px=bx; } }
  const bcv=document.createElement('canvas'); bcv.width=bcv.height=256; const btx=new THREE.CanvasTexture(bcv); btx.colorSpace=THREE.SRGBColorSpace;
  const badge=new THREE.Mesh(new THREE.PlaneGeometry(2.7*K,2.7*K),new THREE.MeshBasicMaterial({map:btx,transparent:true,depthWrite:false,depthTest:false}));
  badge.visible=false; badge.renderOrder=10; scene.add(badge); let badgeX=0;
  function badgeAt(i,big,small){ const h=HX[i], c=bcv.getContext('2d'); c.clearRect(0,0,256,256);
    const gr=c.createRadialGradient(128,128,18,128,128,118); gr.addColorStop(0,'rgba(9,20,38,0.80)'); gr.addColorStop(1,'rgba(9,20,38,0)');
    c.fillStyle=gr; c.fillRect(0,0,256,256); c.fillStyle='#ffe9c2'; c.textAlign='center';
    c.font='800 112px system-ui'; c.fillText(big,128,small?138:170); if(small){ c.font='700 38px system-ui'; c.fillText(small,128,192); }
    btx.needsUpdate=true; badgeX=h.x; badge.position.set(h.x,heightAt(h.x,h.z)+0.32*K,h.z); badge.visible=true; }
  const hideBadge=()=>{ badge.visible=false; };
  function uDrawSel(){ if(!uSel){ selMark(null); clearRoute(); return; }
    selMark(uSel.g); drawRoute([uSel.i,...uSel.path]); }
  function uDesel(){ uSel=null; selMark(null); clearRoute(); hideBadge(); uPrevI=-1; uPrevPath=null; uCard(); }
  function uSelect(u){ uSel=u; if(u)uLastTouch=u; uPrevI=-1; uPrevPath=null; uDrawSel(); uCard(); closeCity(); closeVillage(); closeRes(); }
  function uFocus(u){ uSelect(u); flyTo(u.x,u.z); }
  function uNextDuty(){ const d=uDuties().filter(x=>x!==uSel); if(d.length)uFocus(d[0]); else uDesel(); }   // как в Civ: следующий отряд, ждущий приказа; нет — выбор снят
  { const st=document.createElement('style'); st.textContent=`
    #g-unit{position:fixed;right:76px;bottom:12px;z-index:22;display:none;background:#12233af2;color:#ffe9c2;padding:11px 15px;border-radius:13px;
      font:600 13px system-ui;box-shadow:0 4px 14px #0008;min-width:195px;max-width:340px;user-select:none;border:1px solid #ffffff1f}
    #g-unit .ur{margin-top:2px;font-weight:500;color:#dfe8f5} #g-unit b{color:#ffe9c2}
    #g-unit .ub{border:0;border-radius:8px;padding:6px 10px;color:#fff;cursor:pointer;font:700 12px system-ui}
    #g-unit .ub:hover{filter:brightness(1.15)}`; document.head.appendChild(st); }
  const unitCard=document.createElement('div'); unitCard.id='g-unit'; document.body.appendChild(unitCard);   // справа внизу, левее компаса: слева мини-карта, по центру — советник и «Конец хода»
  unitCard.addEventListener('pointerdown',e=>e.stopPropagation()); unitCard.addEventListener('pointerup',e=>e.stopPropagation());
  function uCard(){ if(!uSel){ unitCard.style.display='none'; return; }
    const u=uSel, nm=u.kind==='scout'?'Разведчик':'Дружина', up=u.kind==='scout'?2:Math.ceil(u.str/10), home=u.i===capI();
    const restLbl=u.sleep?'Разбудить':(u.kind==='band'?'Окопаться':'Спать');
    const mate=u.kind==='band'?UNITS.find(o=>o!==u&&o.kind==='band'&&!o.anim&&hd(o.i,u.i)<=1.35*dxH):null;   // 25.10 (Артём): объединение и с СОСЕДНЕЙ клетки
    const dli=(u.kind==='band'&&!u.anim)?lmAtI(u.i):-1, dlm=dli>=0?LM[dli]:null;   // 25.10: роспуск дома — люди назад в город
    const canDis=!!(dlm&&(dlm.capital||dlm.rel==='ours'));
    unitCard.innerHTML=`<div style="display:flex;gap:13px;align-items:flex-start">
      <div style="flex:0 0 auto;padding-top:2px">${GI(u.kind==='scout'?'eye':'swords',48,'#ffe1a0')}</div>
      <div>
        <div style="font-size:16.5px;font-weight:800;color:#ffe1a0;margin-bottom:5px">${nm}${u.sleep?` <span style="font-size:11.5px;opacity:.75">· ${u.kind==='band'?'окопалась':'спит'}</span>`:''}</div>
        ${u.kind==='band'?`<div class="ur">люди: <b>${u.str}</b>${u.str<30&&!u.path.length?` <span style="color:#9fe0a8">отдых +${restRate(u)}/ход</span>`:''}${u.sleep?' <span style="color:#9fe0a8">+25% в обороне</span>':''}</div>`:''}
        <div class="ur">очки хода: <b>${Math.max(0,Math.round(u.mp*10)/10)} / ${u.mpMax}</b></div>
        <div class="ur">содержание: ${home?'дома — бесплатно':up+' мон./ход'+(u.kind==='band'?' (1 за 10 людей)':'')}</div>
        ${u.path.length?`<div class="ur">в пути: ещё ${u.path.length} клет.</div>`:''}
      </div></div>
      <div style="margin-top:9px;display:flex;gap:7px;flex-wrap:wrap">
        <button class="ub" data-u="home" style="background:#3f6b8f">Домой</button>
        <button class="ub" data-u="skip" style="background:#6b4a2f">Пропустить ход</button>
        <button class="ub" data-u="rest" style="background:#4a5a3f">${restLbl}</button>
        ${mate?`<button class="ub" data-u="merge" style="background:#7a4a8f" title="${mate.i===u.i?'отряды на одной клетке сложатся':'соседний отряд перейдёт НА ЭТУ клетку — стрелка покажет'}">${GI('swords',12)} Объединить (${u.str}+${mate.str}${u.str+mate.str>50?' · предел 50':''})${mate.i!==u.i?' → сюда':''}</button>`:''}
        ${canDis?`<button class="ub" data-u="dis" style="background:#5a4a2f" title="вернуть людей к мирной жизни — «${dlm.name||'город'}» примет ${u.str} человек">Распустить (+${u.str} жит.)</button>`:''}
        <button class="ub" data-u="x" style="background:#485262">✕</button></div>
      <div style="opacity:.6;margin-top:6px;font-weight:400;font-size:11.5px">кликни клетку — пойдёт · ESC — снять выбор</div>`;
    unitCard.style.display='block';
    unitCard.querySelector('[data-u=home]').onclick=()=>{ if(!uSel)return; uSel.sleep=false; uGoHome(uSel); uWalkNow(uSel); };
    unitCard.querySelector('[data-u=skip]').onclick=()=>{ if(!uSel)return; uSel.skipT=turn; uNextDuty(); };   // на этот ход — из списка дел; 17.10: фокус — следующему ждущему
    unitCard.querySelector('[data-u=rest]').onclick=()=>{ if(!uSel)return; uSel.sleep=!uSel.sleep; if(uSel.sleep){ uSel.path.length=0; uNextDuty(); return; } uDrawSel(); uCard(); };   // 17.10: окопался/уснул — карточка закрывается, фокус следующему ждущему
    unitCard.querySelector('[data-u=x]').onclick=()=>uDesel();
    const db=unitCard.querySelector('[data-u=dis]');                 // 25.10: роспуск — люди возвращаются жителями
    if(db)db.onclick=()=>{ if(!uSel)return; const li=lmAtI(uSel.i), lm=li>=0?LM[li]:null;
      if(!lm||(!lm.capital&&lm.rel!=='ours'))return;
      setSize(lm,sizeOfPop(popOf(lm.size)+uSel.str));
      glog(`⚔ Дружина распущена — ${uSel.str} человек вернулись в «${lm.name||'город'}» к мирной жизни`);
      uKill(uSel); recompute(); updateStats(); refreshPanels(); };
    const mb=unitCard.querySelector('[data-u=merge]');               // объединение дружин — люди складываются, предел отряда 50
    if(mb)mb.onclick=()=>{ if(!uSel)return; const u=uSel, o=UNITS.find(x=>x!==u&&x.kind==='band'&&!x.anim&&hd(x.i,u.i)<=1.35*dxH); if(!o)return;
      const far=o.i!==u.i;
      if(far){ mergeArrow(o,u);                                      // 25.10 (Артём): стрелка — в КАКУЮ клетку сольются (клетка выбранного); сосед перебегает сам
        const pts=[{x:o.x,z:o.z},{x:o.x+wdx(u.x,o.x),z:u.z}];
        o.i=u.i; o.anim={pts,seg:0,t:0}; o.g.userData.mode('go'); }
      setTimeout(()=>{ if(!UNITS.includes(o)||!UNITS.includes(u))return;
        const tot=u.str+o.str;
        if(tot<=50){ u.str=tot; uKill(o); glog(`⚔ Дружины объединились — ${tot} людей под одним стягом`); }
        else { u.str=50; o.str=tot-50; uTag(o); glog(`⚔ Отряд собран до предела (50 людей); ${tot-50} остались вторым отрядом`); }
        uTag(u); uPlaceAll(); if(uSel===u){ uDrawSel(); uCard(); } },far?480:0); }; }
  function mergeArrow(o,u){                                          // жёлтая стрелка от соседа к клетке слияния, тает через 1.3 с
    const y=Math.max(heightAt(normX(o.x),o.z),heightAt(normX(u.x),u.z))+0.9*K;
    const dx=wdx(u.x,o.x), dz=u.z-o.z, L=Math.max(0.1,Math.hypot(dx,dz));
    const ar=new THREE.ArrowHelper(new THREE.Vector3(dx/L,0,dz/L),new THREE.Vector3(o.x,y,o.z),L,0xffd98a,0.5*K,0.25*K);
    ar.line.material.depthTest=false; ar.cone.material.depthTest=false; ar.renderOrder=9; scene.add(ar);
    setTimeout(()=>scene.remove(ar),1300); }
  // --- путь под курсором ---
  { const dom=renderer.domElement; let pend=null;
    dom.addEventListener('pointermove',e=>{ if(!uSel||busy)return; const first=!pend; pend=[e.clientX,e.clientY];
      if(first)requestAnimationFrame(()=>{ const q=pend; pend=null; if(!q||!uSel)return; uHover(q[0],q[1]); }); }); }
  function uHover(cx,cy){ const p=groundHit(cx,cy); if(!p){ uDrawSel(); hideBadge(); uPrevI=-1; return; }
    const c=hexAt(normX(p.x),p.z), i=c?HI.get(c.col+','+c.row):undefined; if(i===undefined){ uDrawSel(); hideBadge(); uPrevI=-1; return; }
    if(i!==uPrevI){ uPrevI=i; uPrevPath=uPath(uSel.i,i); }
    if(i===uSel.i){ uDrawSel(); hideBadge(); return; }
    if(uPrevPath&&uPrevPath.length>1){ drawRoute(uPrevPath); const t=turnsFrom(uPrevPath,uSel);
      if(t>=99)badgeAt(i,'✕','не пройти'); else if(t===0)badgeAt(i,'✓','сейчас'); else badgeAt(i,String(t),t===1?'ход':t<5?'хода':'ходов'); }
    else { uDrawSel(); badgeAt(i,'✕','не пройти'); } }
  // --- клик: выбрать / приказ / карусель «поселение → отряды → поселение» на клетке поселения (как в Civ) ---
  function uCycleFrom(i){ const us=UNITS.filter(x=>x.i===i), nxt=us[us.indexOf(uSel)+1];
    if(nxt){ uSelect(nxt); return; }
    uDesel(); const li=lmAtI(i);
    if(li>=0){ const lm=LM[li]; if(lm.capital)openCity(); else if(lm.aiCapital)openForeign(li); else openVillage(li); }   // круг замкнулся — снова поселение
    else if(us.length>1)uSelect(us[0]); }
  function uClick(c){ if(busy)return false; const i=HI.get(c.col+','+c.row); if(i===undefined)return false;
    const own=UNITS.filter(u=>u.i===i), li=lmAtI(i), setl=li>=0;
    if(uSel){
      if(i===uSel.i){ uCycleFrom(i); return true; }                   // клик по своей клетке — следующий на ней
      if(own.length&&!setl){ uSelect(own[0]); return true; }          // другой наш отряд в поле — выбрать его
      const p=(uPrevPath&&uPrevI===i)?uPrevPath:uPath(uSel.i,i);
      if(p&&p.length>1){ const u=uSel; u.sleep=false; u.path=p.slice(1);
        glog(u.kind==='scout'?'🥾 Разведчик выступил в путь':'⚔ Дружина выступила');
        uWalkNow(u);
        if(uSel===u&&!u.path.length&&u.mp>0){ uPrevI=-1; uPrevPath=null; hideBadge(); uDrawSel(); uCard(); return true; }   // дошёл, очки остались — остаётся выбранным
        uDesel(); return true; }
      uDesel(); return true; }
    if(!own.length)return false;
    if(!setl){ uSelect(own[0]); return true; }
    const lm=LM[li], open=lm.capital?cityP.classList.contains('on'):(vilPanel.classList.contains('on')&&(vilIdx===li||(lm.aiCapital&&vilIdx<0)));
    if(open){ uSelect(own[0]); return true; }                         // второй клик по поселению — отряд на нём
    return false; }                                                   // первый клик — карточка поселения
  // ================= ЮНИТЫ, ШАГ 2 (index.html 8428–8736): стойбища, шайки, грабёж, сеча, разорение стойбища, отдых =================
  // Перенос 17.10 по описи (currentstatus 17.10 (2)). Числа и тексты — старые. НОВОЕ: сеча — mkBattle из units.js (утверждён в models.html #battle)
  // вместо старой «качалки» двух фишек; стойбище — mkCamp (шатры, костёр, шест с черепом), разорённое — шатры повалены, шест и караульный сняты.
  // Частокол, карательный поход, «дружина у стен» — шаг 3. Тумана нет — шайки и стойбища видны всегда (в старом — в живой видимости).
  const RAIDS=[], NESTS=[]; let nestsInit=false, nestNextNew=0;
  // 17.10 ВЕСТИ СЛУХАМИ (Артём: «тумана нет, но узнавать о набеге в тот же ход нельзя»): весть идёт ~8 клеток за ход от места до столицы;
  // рядом наш отряд (≤3 клетки) или место у самой столицы — сразу. Очередь — данными (переживает сейв).
  const NEWSQ=[];
  function news(x,z,o){ const cap=capOf(); let d=cap?Math.ceil(wdist({x,z},cap)/dxH/8):0;
    if(d&&(wdist({x,z},cap)<=3*dxH||UNITS.some(u=>wdist({x,z},HX[u.i])<=3*dxH)))d=0;
    if(!d){ newsShow(o,false); return; } NEWSQ.push({due:turn+d,o}); }
  function newsShow(o,late){ if(o.log)glog(o.log[0]+(late?' — весть принёс гонец':''),o.log[1]); if(o.evt)evt(late?{...o.evt,html:o.evt.html+'<br><br><span style="opacity:.7">Весть принёс гонец — случилось это несколько дней назад.</span>'}:o.evt); }
  function newsTick(){ for(let k=NEWSQ.length-1;k>=0;k--)if(NEWSQ[k].due<=turn){ const q=NEWSQ.splice(k,1)[0]; newsShow(q.o,true); } }
  window.__raidsInfo={newRaids:0,lastRaidTurn:-1,total:0};             // набеги на наших — в старом двигали науку «частокол» (наук ещё нет)
  const CS=2.2, BS=US*0.8;                                            // стойбище: поляна 1.15×2.2 ≈ 2.5 (вписана в клетку); сеча: строй ±1.5×2.4
  const hd=(a,b)=>wdist(HX[a],HX[b]);
  const lmI=lm=>HI.get(lm.c.col+','+lm.c.row);
  const rnd=n=>Math.floor(Math.random()*n);
  const tgtOf=u=>u.kind==='raid'?rTarget(u):uTarget(u);
  function rTarget(u){ const c=HX[u.i], setl=lmAtI(u.i)>=0, o=setl?[-1.31,-0.83]:[0,0];   // у поселения — на край, с другой стороны от наших
    return {x:c.x+o[0]*K,z:c.z+o[1]*K,setl}; }
  const nestOk=i=>{ const a=UG().adj[i]; return a&&a.length&&(UCOST[HX[i].type]??2)<=2.6&&lmAtI(i)<0; };
  // --- стойбища: одно «у порога» (6–12 клеток от столицы, с путём до неё), до трёх всего — в глуши 10–25 клеток от жилья ---
  function mkNest(i,o={}){ const c=HX[i], g=ctx.units.mkCamp({light:false}), cx=c.x, cz=c.z, y0=heightAt(normX(cx),cz);
    g.scale.setScalar(CS); g.position.set(cx,y0,cz);
    const hy=(lx,lz)=>(heightAt(normX(cx+lx*CS),cz+lz*CS)-y0)/CS;   // земля в осях стойбища
    for(const ch of g.children){ if(ch.geometry&&ch.geometry.type==='CircleGeometry'){ const pp=ch.geometry.attributes.position;   // поляна — по рельефу
        for(let k=0;k<pp.count;k++)pp.setZ(k,hy(pp.getX(k),-pp.getY(k))+0.012); pp.needsUpdate=true; ch.geometry.computeBoundingSphere(); }
      else ch.position.y+=hy(ch.position.x,ch.position.z); }
    scene.add(g); const n={i,g,sleepUntil:o.s??0,nextSpawn:o.ns??(turn+4+rnd(3))};   // первый выход — на 4–6 ходу
    NESTS.push(n); nestLook(n); return n; }
  // 17.10 (Артём: «варваров мало»): стойбищ ≈ 1 на 8 деревень (не меньше 3), два из них «у порога»; новые встают в глуши раз в 12–18 ходов
  const NEST_N=()=>Math.max(3,Math.round(LM.filter(l=>!l.capital&&!l.aiCapital).length/8));
  const liveNests=()=>NESTS.filter(n=>!n.dead);
  function rInit(){ const cap=capOf(); if(nestsInit||!cap)return; nestsInit=true; const ch=capI(), N=HX.length; nestNextNew=turn+12+rnd(7);
    const vils=LM.filter(l=>l!==cap);
    for(let pass=0;pass<2;pass++){ const near=[]; for(let t=0;t<600&&near.length<25;t++){ const i=rnd(N); if(!nestOk(i))continue;
        const d=wdist(HX[i],cap)/dxH; if(d<6||d>12)continue;
        if(vils.some(l=>wdist(l,HX[i])<4*dxH))continue; near.push(i); }
      near.sort(()=>Math.random()-0.5);
      for(const i of near)if(!NESTS.some(n=>hd(n.i,i)<5*dxH)&&uPath(i,ch,false)){ mkNest(i); break; } }      // связность проверена — «запертых» стойбищ не плодим; два «у порога» — не ближе 5 клеток друг к другу
    const tries=[]; for(let t=0;t<400;t++){ const i=rnd(N); if(!nestOk(i))continue;
      let dm=1e9; for(const l of LM){ const d=wdist(l,HX[i]); if(d<dm)dm=d; }
      if(dm>=10*dxH&&dm<=25*dxH)tries.push(i); }
    tries.sort(()=>Math.random()-0.5);
    for(const i of tries){ if(NESTS.length>=NEST_N())break; if(NESTS.some(n=>hd(n.i,i)<8*dxH))continue; mkNest(i); }
    if(!NESTS.length){ let best=-1,bd=0;                                // гарантия: тесная карта — самое глухое место
      for(let t=0;t<600;t++){ const i=rnd(N); if(!nestOk(i))continue; let dm=1e9; for(const l of LM){ const d=wdist(l,HX[i]); if(d<dm)dm=d; }
        if(dm>=6*dxH&&dm>bd){ bd=dm; best=i; } }
      if(best>=0)mkNest(best); } }
  function nestLook(n){ if(!n.dead)n.g.userData.ruin(turn<n.sleepUntil); }
  function nestSpawnNew(){ if(turn<nestNextNew)return; nestNextNew=turn+12+rnd(7);
    if(liveNests().length>=NEST_N()+2)return;
    for(let t=0;t<500;t++){ const i=rnd(HX.length); if(!nestOk(i))continue;
      if(LM.some(l=>wdist(l,HX[i])<6*dxH)||UNITS.some(u=>hd(u.i,i)<8*dxH)||liveNests().some(n=>hd(n.i,i)<8*dxH))continue;
      const n=mkNest(i); n.nextSpawn=turn+3+rnd(3);
      news(HX[i].x,HX[i].z,{log:['👁 Охотники шепчутся: в глуши встало новое стойбище лихих людей',{at:[HX[i].x,HX[i].z]}]}); return; } }
  finderAdd({id:'nest',name:'Стойбища',icon:'fire',col:'#e0703e',list:()=>liveNests().filter(n=>!window.__fog||!window.__fog.enabled()||window.__fog.atHex(n.i)>0).map(n=>({x:HX[n.i].x,z:HX[n.i].z,label:turn<n.sleepUntil?`Стойбище (разорено, ещё ${n.sleepUntil-turn} ход.)`:`Стойбище · следующая шайка — ход ${n.nextSpawn}`}))});   // 28.10: скрытые туманом не выдаём
  // 21.10: всплывашка клетки со стойбищем (initHover в big.html)
  window.__nestTip=c=>{ const idx=HI.get(c.col+','+c.row); if(idx==null)return null;
    if(window.__fog&&window.__fog.enabled()&&window.__fog.atHex(idx)===0)return null;   // 28.10: скрытое туманом стойбище тултип не рассекречивает
    const k=NESTS.findIndex(n=>!n.dead&&n.i===idx); if(k<0)return null; const n=NESTS[k];
    return turn<n.sleepUntil
      ?{ttl:'Стойбище лихих людей',sub:'разорено — пепелище',rows:[['Оживёт','не раньше хода '+n.sleepUntil]]}
      :{ttl:'Стойбище лихих людей',sub:RAIDS.some(r=>!r.vanish&&r.nest===k)?'шайка на промысле':'лихие люди собираются с силами',
        rows:[['Новая шайка','к ходу '+Math.max(n.nextSpawn,turn)],['Сила шайки','14–20']]}; };
  finderAdd({id:'join',name:'Готовы войти',icon:'flag',col:'#ffd98a',list:()=>LM.filter(l=>!l.capital&&!l.aiCapital&&!l.free&&l.rel!=='ours'&&l.scouted&&l.will!=null&&readyJoin(l)).map(l=>({x:l.x,z:l.z,label:`«${l.name||'деревня'}» готова войти в державу`}))});
  finderAdd({id:'raid',name:'Шайки',icon:'swords',col:'#d8443a',list:()=>RAIDS.filter(r=>!r.vanish&&(!window.__fog||!window.__fog.enabled()||window.__fog.atHex(r.i)===2)).map(r=>({x:r.x,z:r.z,label:`Шайка · сила ${r.str}${r.bag?` · добыча ${r.bag}`:''}${LM[r.t]?` · цель «${LM[r.t].name}»`:''}`}))});   // 28.10: шайка видна только в живой видимости
  // 21.10 (Артём): разорение — только ВХОДОМ дружины (стоящая ничего не жжёт); спящее стойбище грабить нельзя 30 ходов
  // («пепелище — брать нечего»); «сжечь дотла» вторым заходом убрано. Разорение: сеча с защитниками (анимация),
  // трофеи, малые потери, молва по окрестным деревням (видна в журнале лояльности).
  function nestRaid(b,trod){ if(!trod||!trod.length)return; const hs=new Set(trod);   // 23.10: транзит — только лог пепелища; живое стойбище непроходимо (остановка боем в uWalkNow)
    NESTS.forEach(n=>{ if(n.dead||!hs.has(n.i)||turn>=n.sleepUntil)return; const h=HX[n.i];
      if(n._ashT===turn)return; n._ashT=turn;
      glog(`Дружина прошла пепелище стойбища — брать нечего (оживёт не раньше хода ${n.sleepUntil})`,{at:[h.x,h.z]}); }); }
  function nestAssault(b,n){ const h=HX[n.i];                         // 23.10: бой с СОСЕДНЕЙ клетки (Civ); победа — дружина занимает стойбище
    n.razeT=turn; n.sleepUntil=turn+30; nestLook(n);
    const def=8+rnd(8), bBefore=b.str, loot=10+rnd(6);                // защитники стойбища; дружина теряет ~15% их числа
    b.str=Math.max(1,b.str-Math.max(1,Math.round(def*0.15))); uTag(b);
    money+=loot; updateStats();
    let bnear=null,bn=1e9; LM.forEach(lm=>{ const d=wdist(lm,h); if(d<bn){ bn=d; bnear=lm; } });   // молва — как после сечи
    LM.forEach(lm=>{ if(lm.capital||lm.aiCapital||lm.aiOwned||lm.rel==='ours')return; ensureWill(lm);
      if(lm===bnear)willAdd(lm,-6,'молва: стойбище налётчиков разорено'); else if(wdist(lm,h)<12*dxH)willAdd(lm,-3,'молва: стойбище налётчиков разорено'); });
    glog(`⚔ Дружина разорила стойбище налётчиков (+${loot} монет) — набеги оттуда стихнут надолго`,{warn:1,at:[h.x,h.z]});
    BQ.push({bx:b.x,bz:b.z,rx:h.x,rz:h.z,win:'a',a:bBefore,b:def,hide:[b],done:()=>{
      if(UNITS.includes(b)){ b.i=n.i; uPlaceAll(); }                  // melee: победитель занимает клетку
      evt({icon:'swords',title:'Стойбище разорено',
        html:`Дружина ворвалась в стойбище и смяла охрану (${def}): шатры повалены, припасы сожжены, тайники вскрыты (<b>+${loot} монет</b>). Наши люди: <b>${bBefore} → ${b.str}</b>. Набегов отсюда не будет ещё <b>30 ходов</b> — потом уцелевшие могут вернуться; грабить пепелище повторно нечего.<br><br>Молва о расправе разошлась по округе — <b>соседние деревни потеплели к державе</b>.`});
      if(b.str<10&&UNITS.includes(b)){ glog('⚔ Дружина потрёпана — отходит в столицу набираться сил'); uGoHome(b); } }}); }
  // --- 18.10 КАРАТЕЛЬНЫЙ ПОХОД (index.html 8555–8586): дружина вошла во ВЗБУНТОВАВШУЮСЯ деревню (_rebelT) — штурм ---
  // Ополчение = 30% жителей (не меньше 5). Дружина — профессионалы: в штурме её сила ×5, против частокола ×1.5 (Артём 20.10).
  // Победа (сила×множитель ≥ ополчение): дружина теряет 35% ополчения/множитель, дань возвращена (прежняя ставка),
  // воля 25, −8% жителей, соседи в 20 клетках притихают (воля −5). Поражение: потери 50% ополчения/множитель, воля бунтовщицы +6.
  function punitive(b,lm,ti){ if(!lm||(lm._rebelT==null&&!lm._closed))return;   // 23.10: штурм с СОСЕДНЕЙ клетки; берётся и ЗАКРЫВШАЯСЯ (гордая) деревня
    if(lm.capital||lm.aiCapital||lm.aiOwned||lm.rel)return;
    const militia=Math.max(5,Math.round(popOf(lm.size)*0.3)), mult=lm.palisade?1.5:5, eff=Math.round(b.str*mult),
      bBefore=b.str, nm=lm.name||'деревня', win=eff>=militia;
    if(win){ b.str=Math.max(1,Math.round(b.str-militia*0.35/mult));
      ensureWill(lm); lm.rel='trib'; lm.tribRate=lm.tribRate||10; willAdd(lm,25-lm.will,'усмирена штурмом'); lm._rebelT=null; lm._closed=false;
      setSize(lm,sizeOfPop(Math.max(10,Math.round(popOf(lm.size)*0.92))));
      // 23.10 (Артём): слух о штурме — соседей давит СТРАХ (сговорчивее на время), но державу за это не любят (лояльность вниз)
      LM.forEach(o=>{ if(o!==lm&&!o.capital&&!o.aiCapital&&!o.aiOwned&&o.rel!=='ours'&&wdist(o,lm)/K<20){ ensureWill(o); fearAdd(o,10,5); willAdd(o,3,`молва: «${nm}» взята штурмом — боятся, но не любят`); } });
      glog(`⚔ «${nm}» усмирена — дань течёт снова (ставка ${lm.tribRate}%); округа притихла от страха, но державу за это не полюбила`,{warn:1,at:[lm.x,lm.z]}); }
    else { b.str=Math.max(1,Math.round(b.str-militia*0.5/mult)); willAdd(lm,6,'отбили штурм');
      glog(`⚔ Штурм «${nm}» отбит — ополчение (${militia}) устояло, дружина отходит`,{warn:1,at:[lm.x,lm.z]}); }
    uTag(b);
    BQ.push({bx:b.x,bz:b.z,rx:lm.x,rz:lm.z,win:win?'a':'b',a:bBefore,b:militia,hide:[b],done:()=>{
      if(win&&UNITS.includes(b)){ b.i=ti; uPlaceAll(); }              // melee: победитель занимает клетку
      evt({icon:'swords',title:`Штурм «${nm}»`,html:win
        ?`Дружина (${bBefore}, в бою как <b>${eff}</b>${lm.palisade?' — частокол уравнял силы, ×1.5 вместо ×5':''}) взяла верх над ополчением (${militia}). Деревня <b>усмирена</b>: дань возвращена (ставка <b>${lm.tribRate}%</b>), лояльность — <b>75</b>: сломлены и покорны; часть жителей разбежалась (−8%). Наши люди: <b>${bBefore} → ${b.str}</b>. Слух пополз по округе: соседи <b>притихли от страха</b> (на время сговорчивее), но державу за расправу <b>не любят</b> (лояльность −3).`
        :`Ополчение (${militia}) отбило штурм — дружина (${bBefore}, в бою как ${eff}${lm.palisade?' — частокол уравнял силы':''}; <b>${bBefore} → ${b.str}</b>) отходит. Деревня осмелела (лояльность −6). Вернись с большей силой или дай дружине пополниться у стен столицы.`});
      if(b.str<10&&UNITS.includes(b)){ glog('⚔ Дружина потрёпана — отходит в столицу набираться сил'); uGoHome(b); } }}); }
  // --- 26.10 СТУПЕНЬ 4: ВОЙНА — наша дружина против дружины соперника и его владений ---
  // Сеча дружин по формулам battles: победитель теряет 40% силы врага, проигравшая дружина гибнет целиком.
  function aibClash(b){ if(!AIB)return; const aB=AIB.str, bB=b.str, ax=AIB.x, az=AIB.z, ai0=AIB.i,
      dug=b.sleep, wstr=Math.round(b.str*(dug?1.25:1)), win=wstr>=aB;
    if(win){ b.str=Math.max(1,Math.round(b.str-aB*0.4*(dug?0.75:1))); const loot=Math.round(aB/3); money+=loot; updateStats(); aibKill(); uTag(b);
      glog(`⚔ Наша дружина разбила дружину соперника — трофеи +${loot} монет`,{warn:1,at:[ax,az]});
      BQ.push({bx:b.x,bz:b.z,rx:ax,rz:az,win:'a',a:wstr,b:aB,hide:[b],done:()=>{
        if(UNITS.includes(b)){ b.i=ai0; uPlaceAll(); }
        evt({icon:'swords',title:'Сеча дружин',html:`Наша дружина (сила ${bB}${dug?', окопалась: +25%':''}) сошлась с дружиной соперника (сила ${aB}) и <b>разбила её</b>. Наши люди: <b>${bB} → ${b.str}</b>, трофеи с побитых — <b>+${loot} монет</b>. Соперник остался без войска — его земли беззащитны.`});
        if(b.str<10&&UNITS.includes(b)){ glog('⚔ Дружина потрёпана — отходит в столицу набираться сил'); uGoHome(b); } }}); }
    else { AIB.str=Math.max(1,Math.round(AIB.str-bB*0.6)); uTag(AIB); const aA=AIB.str; uKill(b);
      glog('⚔ Наша дружина полегла в сече с дружиной соперника',{warn:1,at:[ax,az]});
      BQ.push({bx:b.x,bz:b.z,rx:ax,rz:az,win:'b',a:wstr,b:aB,hide:[AIB],done:()=>
        evt({icon:'swords',title:'Сеча дружин',html:`Дружина соперника (сила ${aB}) одолела нашу (сила ${bB}) — она <b>полегла</b>. Его потери: <b>${aB} → ${aA}</b>. Столице нужна новая дружина (карточка столицы).`})}); } }
  // Штурм его владения = punitive: ополчение 30% жителей, дружина ×5 (частокол ×1.5). Взятое — наш ДАННИК (усмирена, воля 25).
  function aiStorm(b,lm,ti){ if(!AI.war||!lm.aiOwned)return;
    const militia=Math.max(5,Math.round(popOf(lm.size)*0.3)), mult=lm.palisade?1.5:5, eff=Math.round(b.str*mult),
      bBefore=b.str, nm=lm.name||'деревня', win=eff>=militia;
    if(win){ b.str=Math.max(1,Math.round(b.str-militia*0.35/mult));
      lm.aiOwned=undefined; AI.taken=Math.max(0,(AI.taken||0)-1); AI.warLoss=(AI.warLoss||0)+1;
      ensureWill(lm); lm.rel='trib'; lm.tribRate=lm.tribRate||10; willAdd(lm,25-lm.will,'взята у соперника штурмом'); lm._rebelT=null; lm._closed=false;
      setSize(lm,sizeOfPop(Math.max(10,Math.round(popOf(lm.size)*0.92))));
      LM.forEach(o=>{ if(o!==lm&&!o.capital&&!o.aiCapital&&!o.aiOwned&&o.rel!=='ours'&&wdist(o,lm)/K<20){ ensureWill(o); fearAdd(o,10,5); willAdd(o,3,`молва: «${nm}» взята штурмом — боятся, но не любят`); } });
      glog(`⚔ «${nm}» отбита у соперника штурмом — теперь наш данник (ставка ${lm.tribRate}%)`,{warn:1,at:[lm.x,lm.z]});
      drawZones(); for(const rc of recs)rc.sig=null; }
    else { b.str=Math.max(1,Math.round(b.str-militia*0.5/mult));
      glog(`⚔ Штурм «${nm}» отбит — ополчение (${militia}) устояло, дружина отходит`,{warn:1,at:[lm.x,lm.z]}); }
    uTag(b);
    BQ.push({bx:b.x,bz:b.z,rx:lm.x,rz:lm.z,win:win?'a':'b',a:bBefore,b:militia,hide:[b],done:()=>{
      if(win&&UNITS.includes(b)){ b.i=ti; uPlaceAll(); }
      evt({icon:'swords',title:`Штурм «${nm}»`,html:win
        ?`Дружина (${bBefore}, в бою как <b>${eff}</b>${lm.palisade?' — частокол уравнял силы, ×1.5 вместо ×5':''}) смяла ополчение (${militia}) и <b>отбила деревню у соперника</b>. Она усмирена: платит нам дань (ставка <b>${lm.tribRate}%</b>), лояльность — 75; часть жителей разбежалась (−8%). Наши люди: <b>${bBefore} → ${b.str}</b>. Соперник потерял владение — такие потери толкают его к миру.`
        :`Ополчение (${militia}) отбило штурм — дружина (${bBefore}, в бою как ${eff}; <b>${bBefore} → ${b.str}</b>) отходит. Вернись с большей силой или дай ей пополниться у стен столицы.`});
      if(b.str<10&&UNITS.includes(b)){ glog('⚔ Дружина потрёпана — отходит в столицу набираться сил'); uGoHome(b); } }}); }
  // --- шайки ---
  function rSpawn(k,o={}){ const g=ctx.units.mkUnit('raid'); scene.add(g);
    const r={kind:'raid',i:o.i??NESTS[k].i,path:o.p||[],mpMax:3,mp:o.mp??3,str:o.s??(14+rnd(7)),g,nest:k,plunder:o.pl||0,bag:o.b||0,fleeing:!!o.f,seen:!!o.sn,t:o.t??-1,anim:null,x:0,z:0,setl:false};   // 30.10: шайки 5→3 вслед за дружиной (3) — иначе их не перехватить
    RAIDS.push(r); const q=rTarget(r); r.x=q.x; r.z=q.z; r.setl=q.setl; uTag(r); return r; }
  function rKill(r){ scene.remove(r.g); const k=RAIDS.indexOf(r); if(k>=0)RAIDS.splice(k,1); }
  function restRate(u){ const ch=capI(); if(ch>=0&&(u.i===ch||hd(u.i,ch)<=1.35*dxH))return 5;   // глушь +1, разведанная деревня +2, наша/подопечная +3, столица +5
    let best=1; LM.forEach(lm=>{ if(lm.capital||lm.aiCapital||lm.aiOwned)return; if(wdist(lm,HX[u.i])>1.35*dxH)return;
      if(['ours','prot','trib'].includes(lm.rel||''))best=Math.max(best,3); else if(lm.scouted)best=Math.max(best,2); });
    return best; }
  const NAMES8=['востоке','северо-востоке','севере','северо-западе','западе','юго-западе','юге','юго-востоке'];
  function smokeWatch(r,t){ if(r.seen)return; const cap=capOf(); if(!cap)return;   // дозорные: одно событие на шайку
    const near=wdist(HX[r.i],cap)<14*dxH, ours=t&&(t.capital||['prot','trib','ours'].includes(t.rel||''));
    if(!near&&!ours)return; r.seen=true;
    const dx=wdx(HX[r.i].x,cap.x), dz=HX[r.i].z-cap.z; let ang=Math.atan2(-dz,dx); if(ang<0)ang+=2*Math.PI;   // север мира = меньший z
    const side=NAMES8[Math.round(ang/(Math.PI/4))%8];
    news(HX[r.i].x,HX[r.i].z,{log:[`👁 Дозорные заметили дымы на ${side} — лихие люди вышли на промысел`,{at:[HX[r.i].x,HX[r.i].z]}],evt:{icon:'fire',title:'Дымы на горизонте',html:`Дозорные докладывают: на <b>${side}</b> замечены дымы костров — шайка лихих людей вышла на промысел${ours?' и, похоже, метит в наши земли':''}. Без защиты деревни станут добычей: дружина отгоняет и перехватывает, частокол тянет время грабежа.`}}); }
  const raidTargets=()=>LM.filter(l=>!l.capital&&!l.aiCapital);
  function rPick(r){ let best=null,bs=0; const h=HX[r.i];               // «маршрут с жадностью»: жители ÷ расстояние, перевыбор каждый ход
    raidTargets().forEach(lm=>{ const d=wdist(lm,h); if(d>12*dxH)return;
      let s=popOf(lm.size)/(1+d/dxH); if(lm.palisade)s*=0.5; if(lm.free)s*=0.5;   // 25.10: у вольного града стены — но пограбить округу тянет (повод просьб)
      if(UNITS.some(o=>o.kind==='band'&&hd(o.i,lmI(lm))<3*dxH)||(AIB&&hd(AIB.i,lmI(lm))<3*dxH))s*=0.25;   // отпор: дружина (и соперника) близ цели — соблазн вчетверо меньше
      if(s>bs){ bs=s; best=lm; } });
    return best; }
  function plunder(r,lm){ r.plunder++; const need=lm.palisade?4:2;     // частокол: +2 хода на грабёж
    if(r.plunder===1)news(lm.x,lm.z,{log:[`🔥 Налётчики грабят «${lm.name||'деревню'}»!${lm.palisade?' Частокол держит — есть время на подмогу':''}`,{warn:1,at:[lm.x,lm.z]}]});
    if(r.plunder>=need){ r.plunder=0; r.bag++;
      const p0=popOf(lm.size), vp=Math.max(10,p0*0.86); setSize(lm,sizeOfPop(vp));   // −14% жителей за разграбление
      if(lm.will!=null){ willAdd(lm,8,'разграблена налётчиками'); lm._angerRaidT=turn;
        if(lm.rel==='ours'&&!UNITS.some(o=>o.kind==='band'&&hd(o.i,lmI(lm))<=3*dxH))willAdd(lm,7,'держава не защитила свой двор'); }   // 25.10: двор брошен в беде
      news(lm.x,lm.z,{log:[`🔥 «${lm.name||'Деревня'}» разграблена — жители разбежались (−${Math.round(p0-popOf(lm.size))} чел)`,{warn:1,at:[lm.x,lm.z]}]});
      if(['prot','trib','ours'].includes(lm.rel||'')){ const ri=window.__raidsInfo; ri.newRaids++; ri.total++; ri.lastRaidTurn=turn; } } }
  function rGoNest(r){ if(NESTS[r.nest].dead){ r.vanish=true; if(!r.anim)rKill(r); return true; }   // родное стойбище сожжено — шайка рассеялась
    const p=uPath(r.i,NESTS[r.nest].i,false); r.path=p?p.slice(1):[]; r.mp=r.mpMax; uWalkNow(r);
    if(r.i===NESTS[r.nest].i){ r.vanish=true; if(!r.anim)rKill(r); return true; } return false; }
  function raidsTick(){ if(!capOf())return; rInit(); newsTick(); nestSpawnNew();
    battles();                                                          // перехват: дружина настигла — шайка не успевает уйти
    NESTS.forEach((n,k)=>{ if(n.dead)return; nestLook(n); if(turn<n.sleepUntil)return;
      if(UNITS.some(o=>o.kind==='band'&&o.i===n.i)){ n.sleepUntil=turn+30; nestLook(n); glog('⚔ Дружина стоит на стойбище — лихие люди не смеют вернуться',{at:[HX[n.i].x,HX[n.i].z]}); return; }   // стоящая дружина держит место (трофеев нет — 21.10)
      if(turn>=n.nextSpawn&&!RAIDS.some(r=>r.nest===k)){ rSpawn(k); n.nextSpawn=turn+10+rnd(7);
        news(HX[n.i].x,HX[n.i].z,{log:['👁 В глуши зашевелилось стойбище — по деревням пойдёт лихой люд',{at:[HX[n.i].x,HX[n.i].z]}]}); } });
    for(const r of RAIDS.slice()){ if(r.vanish)continue;
      if(UNITS.some(o=>o.kind==='band'&&hd(o.i,r.i)<=3*dxH&&o.str>r.str)||(AIB&&hd(AIB.i,r.i)<=3*dxH&&AIB.str>r.str))r.fleeing=true;
      if(r.fleeing||r.bag>=2){ const h=HX[r.i]; if(rGoNest(r))news(h.x,h.z,{log:[r.bag>=2?'👁 Шайка скрылась в стойбище с добычей — жди новую через десяток ходов':'👁 Потрёпанная шайка сбежала в стойбище']}); continue; }
      let t=rPick(r); if(t)r.t=LM.indexOf(t);
      if(!t){ let bd=1e9; const h=HX[r.i]; raidTargets().forEach(lm=>{ const d=wdist(lm,h); if(d<bd){ bd=d; t=lm; } });   // в «слухе» пусто — направлением к ближайшей
        if(!t){ rGoNest(r); continue; } }
      const th=lmI(t); smokeWatch(r,t);
      if(r.i===th||hd(r.i,th)<=1.2*dxH){ plunder(r,t); continue; }
      const p=uPath(r.i,th,false); r.path=p?p.slice(1):[]; r.mp=r.mpMax; uWalkNow(r);
      if(r.i===th||hd(r.i,th)<=1.2*dxH)plunder(r,t); }
    battles(); }
  // --- сеча: дружина в соседней клетке со шайкой (окопалась — +25%); ближайшая дружина бьётся ---
  const BQ=[]; let BAT=null, batZ=null;                               // batZ: наезд камеры к сече и возврат (21.10)
  batBusy=()=>!!BAT||BQ.length>0;                                     // 30.10: окна-события ждут, пока сеча доиграется (evtNext)
  function battles(){
    for(const r of RAIDS.slice()){ if(r.vanish)continue;
      let b=null,bd=1e9; for(const o of UNITS){ if(o.kind!=='band')continue; const d=hd(o.i,r.i); if(d<=1.2*dxH&&d<bd){ bd=d; b=o; } }
      if(!b)continue;
      const dug=b.sleep, wstr=Math.round(b.str*(dug?1.25:1)), h=HX[r.i];
      let bnear=null,bn=1e9; LM.forEach(lm=>{ const d=wdist(lm,h); if(d<bn){ bn=d; bnear=lm; } });
      const where=bnear&&bnear.name?`у «${bnear.name}»`:'в диких землях';
      const bBefore=b.str, rBefore=r.str;
      const rumor=(d0,d1)=>LM.forEach(lm=>{ if(lm.capital||lm.aiCapital||lm.aiOwned||lm.rel==='ours')return; ensureWill(lm);
        const why=d0<0?'молва: дружина разбила налётчиков':'молва: дружина полегла'; if(lm===bnear)willAdd(lm,d0,why); else if(wdist(lm,h)<12*dxH)willAdd(lm,d1,why); });
      const bx=b.x, bz=b.z, rx=r.x, rz=r.z;
      if(wstr>=r.str){
        b.str=Math.max(1,Math.round(b.str-r.str*0.4*(dug?0.75:1))); rKill(r);
        b.mp=0; b.path.length=0;                                      // 23.10: бой съедает весь ход (Civ)
        rumor(-10,-3);                                                  // молва о сече: видели бой −10, округа −3
        const tl=LM[r.t]; if(tl&&!tl.capital&&!tl.aiOwned&&tl.will!=null&&r.bag===0)willAdd(tl,-5,'дружина спасла от набега');   // спасённая цель — ещё −5
        const loot=Math.round(rBefore/2)+r.bag*5; money+=loot; updateStats();   // трофеи — дружина окупается ремеслом
        glog(`⚔ Дружина разбила налётчиков (сила ${b.str}); трофеи +${loot} монет, молва пошла по округе`,{at:[h.x,h.z]});
        BQ.push({bx,bz,rx,rz,win:'a',a:wstr,b:rBefore,hide:[b],done:()=>{
          evt({icon:'swords',title:`Сеча ${where}`,html:`Дружина${dug?' (окопалась: +25% к обороне)':''} сошлась с налётчиками (сила ${rBefore}) и <b>разбила их</b>. Наши потери: люди <b>${bBefore} → ${b.str}</b> — отдых у жилья вернёт новобранцев. <b>Трофеи: +${loot} монет</b>${r.bag?' (отбитая добыча при них)':''}.<br><br>Молва о сече разошлась по округе — <b>соседние деревни потеплели к державе</b> (лояльность выросла).`});
          if(b.str<10&&UNITS.includes(b)){ glog('⚔ Дружина потрёпана — отходит в столицу набираться сил'); uGoHome(b); } }}); }
      else {
        r.str=Math.max(1,Math.round(r.str-b.str*0.6)); uKill(b);
        rumor(3,3);                                                     // держава слаба — окрестные насторожились
        glog('⚔ Дружина полегла в сече… Налётчики уходят с добычей',{warn:1,at:[h.x,h.z]});
        BQ.push({bx,bz,rx,rz,win:'b',a:wstr,b:rBefore,hide:[r],done:()=>{
          evt({icon:'swords',title:`Сеча ${where}`,html:`Налётчики (сила ${rBefore}) одолели нашу дружину (сила ${bBefore}) — она <b>полегла</b> ${where}. Шайка ушла потрёпанной (сила ${r.str}). По деревням шепчутся, что держава слаба (лояльность окрестных упала). Столице нужна новая дружина (карточка столицы).`}); }}); }
      uTag(r); uTag(b); }
    if(uSel){ uDrawSel(); uCard(); } }
  function battleStart(q){ const cx=q.bx+wdx(q.rx,q.bx)/2, cz=(q.bz+q.rz)/2, dx=wdx(q.rx,q.bx), dz=q.rz-q.bz;
    const ry=(dx*dx+dz*dz>1e-4)?Math.atan2(-dz,dx):0, c=Math.cos(ry), s=Math.sin(ry), y0=heightAt(normX(cx),cz);
    const g=ctx.units.mkBattle({win:q.win,strA:q.a,strB:q.b,col:playerCss(),
      ground:(lx,lz)=>(heightAt(normX(cx+(lx*c+lz*s)*BS),cz+(-lx*s+lz*c)*BS)-y0)/BS});
    g.rotation.y=ry; g.scale.setScalar(BS); g.position.set(cx,y0,cz); scene.add(g);
    for(const u of q.hide)u.g.visible=false;
    flyTo(cx,cz); const d0=camera.position.distanceTo(controls.target);
    batZ={goal:Math.max(d0*0.42,20*K),back:d0,user:false,ret:false};   // наезд к бою; после — возврат на прежнюю высоту
    BAT={q,g,cx}; }
  function batZoomStep(){ if(!batZ||batZ.user){ if(batZ&&batZ.user)batZ=null; return; }
    const goal=BAT?batZ.goal:(batZ.ret?batZ.back:null); if(goal==null){ batZ=null; return; }
    const T=controls.target, off=camera.position.clone().sub(T), L0=off.length();
    if(Math.abs(L0-goal)<0.6){ if(!BAT)batZ=null; return; }
    const L=L0+(goal-L0)*0.08; camera.position.copy(T).add(off.multiplyScalar(L/L0)); }
  function raidsFrame(dt,T,zk){
    for(const r of RAIDS){ const s=US*zk*(r.setl&&!r.anim?0.62:1); r.g.scale.setScalar(s);
      r.g.position.set(nearX(r.x,T.x),heightAt(normX(r.x),r.z),r.z); r.g.userData.upd(dt); }
    for(const n of NESTS){ if(n.dead)continue; n.g.position.x=nearX(HX[n.i].x,T.x); if(Math.abs(n.g.position.x-T.x)<120)n.g.userData.upd(dt); }
    if(!BAT&&BQ.length)battleStart(BQ.shift());
    if(BAT){ const g=BAT.g; g.position.x=nearX(BAT.cx,T.x); g.userData.upd(dt);
      if(g.userData.time()>6.2){ scene.remove(g); for(const u of BAT.q.hide)u.g.visible=true; const d=BAT.q.done; BAT=null; if(batZ)batZ.ret=true; d(); } }
    batZoomStep(); flyZoomStep(); }
  function rReset(){ for(const r of RAIDS)scene.remove(r.g); RAIDS.length=0; for(const n of NESTS)scene.remove(n.g); NESTS.length=0; nestsInit=false; NEWSQ.length=0;
    if(BAT){ scene.remove(BAT.g); BAT=null; } BQ.length=0; }
  const rSave=()=>({nn:nestNextNew,q:NEWSQ.slice(),n:NESTS.map(n=>({i:n.i,s:n.sleepUntil,ns:n.nextSpawn,d:n.dead?1:0})),r:RAIDS.filter(r=>!r.vanish).map(r=>({i:r.i,p:r.path.slice(),mp:r.mp,s:r.str,k:r.nest,pl:r.plunder,b:r.bag,f:r.fleeing,sn:r.seen,t:r.t}))});
  function rLoad(d){ rReset(); if(!d){ if(capOf())rInit(); return; }    // старый сейв без набегов — стойбища ставятся заново
    nestsInit=!!(d.n&&d.n.length); nestNextNew=d.nn??(turn+12); NEWSQ.push(...(d.q||[])); for(const n of d.n||[]){ const q=mkNest(n.i,{s:n.s,ns:n.ns}); if(n.d){ q.dead=true; scene.remove(q.g); } } for(const o of d.r||[])if(NESTS[o.k])rSpawn(o.k,o); }
  // ================= ДРУЖИНА СОПЕРНИКА (26.10, ступень 2 оживления AI) =================
  // Соперник воюет по НАШИМ правилам (формулы battles: победа при силе ≥ шайки, потери 40%/60%), но юнит держится
  // ОТДЕЛЬНО от UNITS — там всё завязано на игрока: жалованье из его казны, трофеи ему, «дом» = его столица.
  // Казны у AI нет (ступень 3) — дружина кормится с его земель: размер фикс. 30, жалованья и трофеев не считает.
  let AIB=null;                                                        // единственная дружина соперника
  function aibSpawn(i,str,mp){ const g=ctx.units.mkUnit('band',{col:aiCss()}); scene.add(g);
    const u={kind:'band',i,path:[],mpMax:3,mp:mp??3,str,g,anim:null,x:0,z:0,setl:false};   // 30.10: паритет с нашей дружиной (3)
    const q=uTarget(u); u.x=q.x; u.z=q.z; u.setl=q.setl; uTag(u); return u; }
  function aibKill(){ if(AIB){ scene.remove(AIB.g); AIB=null; } }
  // ================= ТУМАН ВОЙНЫ — мостики (28.10, перенос old.html 8929–8935) =================
  // Источники видимости: пятно выбора столицы, наши поселения (столица/дворы 5 кл., данники/защита 3 кл.),
  // наши отряды (разведчик 3.5 кл., дружина 2.5). Соперник и шайки глаз НЕ дают. AI играет БЕЗ тумана (всевидящ):
  // его логика ходит по всей карте — туман прячет мир только от игрока (асимметрия записана в DECISIONS).
  window.__fogSees=()=>{ const out=[];
    if(pickingCapital&&START&&START.me)out.push({x:START.me.x,z:START.me.z,r:START.me.r+0.5*dxH});
    LM.forEach(lm=>{ if(lm.aiCapital||lm.aiOwned)return;
      if(lm.capital||lm.rel==='ours')out.push({x:lm.x,z:lm.z,r:5*dxH});
      else if(lm.rel==='trib'||lm.rel==='prot')out.push({x:lm.x,z:lm.z,r:3*dxH}); });
    for(const u of UNITS)out.push({x:HX[u.i].x,z:HX[u.i].z,r:(u.kind==='scout'?3.5:2.5)*dxH});
    return out; };
  // шайки, стойбища и дружина соперника видны только в живой видимости / на разведанной земле
  window.__unitsFogApply=()=>{ const F=window.__fog, on=F&&F.enabled();
    for(const r of RAIDS)if(r.g)r.g.visible=!on||F.atHex(r.i)===2;
    for(const n of NESTS)if(!n.dead&&n.g)n.g.visible=!on||F.atHex(n.i)>0;
    if(AIB&&AIB.g)AIB.g.visible=!on||F.atHex(AIB.i)===2; };
  function aiWalk(u){ const pts=[{x:u.x,z:u.z}];                       // шаги как uWalkNow, но БЕЗ побочек игрока (battles/punitive/bandReveal)
    while(u.path.length&&u.mp>0){ const nxt=u.path[0], c=stepCost(u.i,nxt,false); if(c>=1e9){ u.path.length=0; break; }
      if(hostileAt(nxt,1)){ u.path.length=0; u.mp=0; break; }          // в стойбище и бунтующую деревню не лезет; свои ветки войны (ailm/aib) ему не враги
      u.mp-=c; u.i=nxt; u.path.shift(); const q=uTarget(u), pr=pts[pts.length-1]; pts.push({x:pr.x+wdx(q.x,pr.x),z:q.z}); }
    if(pts.length>1){ u.anim={pts,seg:0,t:0}; u.g.userData.mode('go'); u._animEnd=performance.now()+(pts.length-1)*350+150; }
    else { const q=uTarget(u); u.x=q.x; u.z=q.z; u.setl=q.setl; } }
  function aiBattle(){ if(!AIB)return;                                 // сеча по формулам battles(); без наезда камеры и evt-окна — бой чужой
    for(const r of RAIDS.slice()){ if(r.vanish)continue; if(hd(AIB.i,r.i)>1.2*dxH)continue;
      const h=HX[r.i], rBefore=r.str;
      if(AIB.str>=r.str){ AIB.str=Math.max(1,Math.round(AIB.str-r.str*0.4)); rKill(r); AIB.mp=0; AIB.path.length=0; uTag(AIB);
        AI.gold=(AI.gold||0)+Math.round(rBefore/2)+r.bag*5;            // 26.10 ст.3: трофеи в достаток соперника, как у игрока
        if(r.seen)glog(`⚔ Дружина соперника разбила налётчиков (сила ${rBefore})`,{at:[h.x,h.z]}); }
      else { r.str=Math.max(1,Math.round(r.str-AIB.str*0.6)); uTag(r); aibKill();
        if(r.seen)glog('⚔ Налётчики перебили дружину соперника',{at:[h.x,h.z]}); return; } }
    if(AI.war&&AIB)for(const o of UNITS.slice()){ if(o.kind!=='band')continue; if(hd(AIB.i,o.i)>1.35*dxH)continue;   // 26.10 ст.4: война — его дружина бьёт нашу рядом (1.35 — как радиус грабежа, иначе отряд на дворе вне досягаемости)
      const wstr=Math.round(o.str*(o.sleep?1.25:1)), aB=AIB.str, oB=o.str, ox=o.x, oz=o.z, ax=AIB.x, az=AIB.z;
      if(aB>=wstr){ AIB.str=Math.max(1,Math.round(AIB.str-oB*0.4)); uTag(AIB); AIB.mp=0; AIB.path.length=0; const aA=AIB.str; uKill(o);
        glog('⚔ Дружина соперника одолела нашу — она полегла',{warn:1,at:[ax,az]});
        BQ.push({bx:ox,bz:oz,rx:ax,rz:az,win:'b',a:wstr,b:aB,hide:[AIB],done:()=>
          evt({icon:'swords',title:'Сеча дружин',html:`Дружина соперника (сила ${aB}) напала на нашу (сила ${oB}${o.sleep?', окопалась':''}) и <b>одолела её</b> — наша полегла. Его потери: <b>${aB} → ${aA}</b>. Столице нужна новая дружина (карточка столицы).`})}); return; }
      else { const loot=Math.round(aB/3); o.str=Math.max(1,Math.round(o.str-aB*0.4*(o.sleep?0.75:1))); uTag(o); money+=loot; updateStats(); aibKill();
        glog(`⚔ Наша дружина отразила нападение дружины соперника и разбила её — трофеи +${loot} монет`,{at:[ox,oz]});
        BQ.push({bx:ox,bz:oz,rx:ax,rz:az,win:'a',a:wstr,b:aB,hide:[o],done:()=>
          evt({icon:'swords',title:'Сеча дружин',html:`Дружина соперника (сила ${aB}) напала на нашу (сила ${oB}${o.sleep?' — окопалась: +25% к обороне':''}) и <b>была разбита</b>. Наши люди: <b>${oB} → ${o.str}</b>, трофеи <b>+${loot} монет</b>. Соперник остался без войска.`})}); return; } } }
  function aiArmy(ac){
    for(const v of LM){ if(!v.aiOwned||v.will==null)continue;          // воля владений растёт только от грабежей; перегрелась — бунт, как у двора игрока
      if(v.will>80&&Math.random()<(v.will-80)/40){ v.aiOwned=undefined; AI.taken=Math.max(0,(AI.taken||0)-1); willAdd(v,62-v.will,'отложилась от державы соперника');
        if(v.scouted)glog(`🔥 «${v.name||'Деревня'}» отложилась от державы соперника — он не уберёг её от лиха`,{warn:1,at:[v.x,v.z]});
        drawZones(); for(const rc of recs)rc.sig=null; } }
    if(!AIB){ if(popOf(ac.size)>=80&&(AI.gold||0)>=60&&(AI.hireT==null||turn-AI.hireT>=8)){ AI.hireT=turn; AI.gold-=60;   // найм как у игрока: 30×2 монет и −30 жителей столицы, выступает со след. хода
        setSize(ac,sizeOfPop(Math.max(10,popOf(ac.size)-30))); AIB=aibSpawn(lmI(ac),30,0);
        if(ac.scouted)glog(`${COUNTRIES[AI.countryId].flag} Держава ${COUNTRIES[AI.countryId].gen} собрала дружину — его земли под охраной`,{at:[ac.x,ac.z]}); }
      return; }
    const at=lmAtI(AIB.i), lm0=at>=0?LM[at]:null;
    if(lm0&&(lm0.aiCapital||lm0.aiOwned)&&AIB.str<30){ AIB.str=Math.min(30,AIB.str+3); uTag(AIB); }   // отдых в своих землях, как у игрока в столице
    AIB.mp=AIB.mpMax;
    const seats=[ac,...LM.filter(l=>l.aiOwned)];
    let hot=null,hw=0; for(const v of LM)if(v.aiOwned&&v.will!=null&&v.will>=50&&v.will>hw){ hw=v.will; hot=v; }
    let dst=-1, mode='home', nestT=null, warV=null;
    if(hot){ dst=lmI(hot); mode='calm'; }                              // 1) неспокойное владение — идти наводить порядок
    if(dst<0&&AI.war){ let wv=null,wd=1e9;                             // 26.10 ст.4: 2) война — разорять ближайший к его землям наш двор
      LM.forEach(l=>{ if(l.rel!=='ours'||l.capital||popOf(l.size)<30)return;
        let d=1e9; for(const s of seats){ const dd=wdist(l,s)/K; if(dd<d)d=dd; }
        if(d<wd){ wd=d; wv=l; } });
      if(wv){ dst=lmI(wv); mode='warv'; warV=wv; } }
    if(dst<0){ let br=null,bd=1e9;                                     // 3) шайка ближе 10 клеток от его земель — перехват
      for(const r of RAIDS){ if(r.vanish||AIB.str<r.str*0.8)continue;
        let d=1e9; for(const s of seats){ const dd=wdist(HX[r.i],s)/dxH; if(dd<d)d=dd; }
        if(d<10){ const dm=hd(AIB.i,r.i); if(dm<bd){ bd=dm; br=r; } } }
      if(br){ dst=br.i; mode='hunt'; }
      else { let bn=null,bnd=1e9;                                      // 3) 26.10 ст.3: живое стойбище ближе 8 клеток от его земель — разорить
        NESTS.forEach(n=>{ if(n.dead||turn<n.sleepUntil)return;
          let d=1e9; for(const s of seats){ const dd=wdist(HX[n.i],s)/dxH; if(dd<d)d=dd; }
          if(d<8){ const dm=hd(AIB.i,n.i); if(dm<bnd){ bnd=dm; bn=n; } } });
        if(bn&&AIB.str>=20){ dst=bn.i; mode='nest'; nestT=bn; } else dst=lmI(ac); } }   // 4) иначе — домой, сторожить столицу
    if(mode==='calm'&&AIB.i===dst)willAdd(hot,-15,'дружина соперника наводит порядок');
    else if(dst>=0&&AIB.i!==dst){ const p=uPath(AIB.i,dst,false); AIB.path=p?p.slice(1):[]; aiWalk(AIB); }
    aiBattle();
    if(AIB&&mode==='nest'&&nestT&&!nestT.dead&&turn>=nestT.sleepUntil&&hd(AIB.i,nestT.i)<=1.35*dxH)aiNest(nestT);
    if(AIB&&mode!=='nest'&&AIB.str>=20){ const nn=NESTS.find(n=>!n.dead&&turn>=n.sleepUntil&&hd(AIB.i,n.i)<=1.35*dxH);   // 26.10 ст.4: стойбище на пути (aiWalk перед ним встал) — разорить и идти дальше
      if(nn)aiNest(nn); }
    if(AIB&&mode==='warv'&&warV&&warV.rel==='ours'&&hd(AIB.i,lmI(warV))<=1.35*dxH)aiPillage(warV); }   // 26.10 ст.4: добрался до двора — грабит каждый ход
  function aiNest(n){ const def=8+rnd(8), loot=10+rnd(6);              // 26.10 ст.3: разорение стойбища = nestAssault, но добыча — сопернику и без молвы о НАШЕЙ славе
    n.razeT=turn; n.sleepUntil=turn+30; nestLook(n);
    AIB.str=Math.max(1,AIB.str-Math.max(1,Math.round(def*0.15))); uTag(AIB); AIB.mp=0; AIB.path.length=0;
    AI.gold=(AI.gold||0)+loot;
    glog('⚔ Дружина соперника разорила стойбище налётчиков — набеги оттуда стихнут надолго',{at:[HX[n.i].x,HX[n.i].z]}); }
  function aiPillage(v){ const loot=8+rnd(6); AI.gold=(AI.gold||0)+loot; AIB.mp=0; AIB.path.length=0;   // 26.10 ст.4: грабёж нашего двора — добро ему, верность двора тает (воля растёт → бунт)
    setSize(v,sizeOfPop(Math.max(10,Math.round(popOf(v.size)*0.95))));
    ensureWill(v); willAdd(v,8,'разорение войной — держава не уберегла');
    glog(`🔥 Дружина соперника разоряет «${v.name||'двор'}» — жители страдают, добро утекает врагу`,{warn:1,at:[v.x,v.z]}); }
  // --- кадр: шаг фигур, место у шва, постоянный экранный размер ---
  let uLastT=performance.now();
  function unitsFrame(){ const now=performance.now(), dt=Math.min(0.1,(now-uLastT)/1000); uLastT=now; tradeFrame(dt);
    const T=controls.target, zk=Math.max(1,camera.position.distanceTo(T)/30);
    for(const u of (AIB?[...UNITS,...RAIDS,AIB]:[...UNITS,...RAIDS])){ const a=u.anim;
      if(a){ a.t+=dt/0.35; while(a.t>=1&&a.seg<a.pts.length-2){ a.t-=1; a.seg++; }
        const p0=a.pts[a.seg], p1=a.pts[a.seg+1], k=Math.min(1,a.t);
        u.x=p0.x+(p1.x-p0.x)*k; u.z=p0.z+(p1.z-p0.z)*k;
        const dx=p1.x-p0.x, dz=p1.z-p0.z; if(dx*dx+dz*dz>1e-4){ const want=Math.atan2(dx,dz); let da=want-u.g.rotation.y; da=Math.atan2(Math.sin(da),Math.cos(da)); u.g.rotation.y+=da*Math.min(1,dt*10); }
        if(a.t>=1){ u.anim=null; u.x=normX(u.x); const q=tgtOf(u); u.x=q.x; u.z=q.z; u.setl=q.setl; u.g.userData.mode('idle'); if(u.vanish){ rKill(u); continue; } } }
      if(u.kind==='band'){ const want=!!u.sleep&&!u.anim; if(u.g.userData.dug!==want)u.g.userData.dig(want); }   // 17.10: окопалась — на колено, вал и колья
      const s=US*zk*(u.setl&&!u.anim?0.62:1);
      u.g.scale.setScalar(s); u.g.position.set(nearX(u.x,T.x),heightAt(normX(u.x),u.z),u.z); u.g.userData.upd(dt); }
    raidsFrame(dt,T,zk);
    if(routeG.children.length)routeG.position.x=nearX(routeBase,T.x)-routeBase;
    if(badge.visible){ badge.position.x=nearX(badgeX,T.x);
      const az=Math.atan2(camera.position.x-badge.position.x,camera.position.z-badge.position.z); badge.rotation.set(-Math.PI/2,0,az); } }
  function uReset(){ for(const u of UNITS)scene.remove(u.g); UNITS.length=0; uDesel(); aibKill(); rReset(); }
  const uSave=()=>UNITS.map(u=>({k:u.kind,i:u.i,p:u.path.slice(),mp:u.mp,s:u.str,sl:u.sleep,sk:u.skipT,br:u.broke}));
  function uLoad(arr){ uReset(); if(!arr)return; for(const o of arr)uSpawn(o.k,o.i,{path:o.p,mp:o.mp,str:o.s,sleep:o.sl,skipT:o.sk,broke:o.br}); uPlaceAll(); }
  window.__units2={ hire:(k,n)=>uHire(k,n), list:()=>UNITS.map(u=>({k:u.kind,i:u.i,col:HX[u.i].col,row:HX[u.i].row,x:+u.x.toFixed(1),z:+u.z.toFixed(1),path:u.path.length,mp:u.mp,str:u.str,sleep:u.sleep,anim:!!u.anim})),
    food:n=>{ const c=capOf(); if(c)c._store=n; return n; }, lmCell:li=>LM[li]?[LM[li].c.col,LM[li].c.row,LM[li].x,LM[li].z,!!LM[li].scouted,LM[li].name]:null,
    far:()=>{ const cap=capOf(); return LM.map((l,li)=>({li,d:+(wdist(l,cap)/dxH).toFixed(1),sc:!!l.scouted,cap:!!l.capital||!!l.aiCapital})).filter(v=>!v.cap&&!v.sc).sort((a,b)=>a.d-b.d).slice(0,3); },
    sel:()=>uSel?UNITS.indexOf(uSel):-1, select:n=>{ const u=UNITS[n]; if(u)uFocus(u); return !!u; },
    path:(n,col,row)=>{ const u=UNITS[n], j=HI.get(col+','+row); if(!u||j===undefined)return null; const p=uPath(u.i,j); return p?{len:p.length,turns:turnsFrom(p,u)}:null; },
    clickCell:(col,row)=>{ const c=HX[HI.get(col+','+row)]; return c?uClick(c):null; }, capCell:()=>{ const i=capI(); return i<0?null:[HX[i].col,HX[i].row]; },
    near:(n,r)=>{ const u=UNITS[n]; if(!u)return []; return UG().adj[u.i].map(([j])=>({col:HX[j].col,row:HX[j].row,type:HX[j].type})); },
    duties:()=>uDuties().length, scouted:()=>LM.filter(l=>l.scouted).length,
    nests:()=>NESTS.map(n=>({i:n.i,col:HX[n.i].col,row:HX[n.i].row,x:+HX[n.i].x.toFixed(1),z:+HX[n.i].z.toFixed(1),capD:+(wdist(HX[n.i],capOf())/dxH).toFixed(1),ruined:turn<n.sleepUntil,next:n.nextSpawn})),
    raids:()=>RAIDS.map(r=>({i:r.i,col:HX[r.i].col,row:HX[r.i].row,str:r.str,bag:r.bag,pl:r.plunder,flee:r.fleeing,t:LM[r.t]?LM[r.t].name:null,anim:!!r.anim})),
    raidSpawn:(k,col,row)=>{ const i=col!=null?HI.get(col+','+row):undefined; const r=rSpawn(k||0,i!=null?{i}:{}); return RAIDS.indexOf(r); },
    raidsTick:()=>{ raidsTick(); return RAIDS.length; }, battle:()=>BAT?{t:+BAT.g.userData.time().toFixed(2),...BAT.g.userData.state()}:null, bq:()=>BQ.length,
    bandStr:(n,v)=>{ const u=UNITS[n]; if(u&&v!=null){ u.str=v; uTag(u); } return u?u.str:null; }, money:()=>money, turn:()=>turn,
    rest:n=>{ const u=UNITS[n]; return u?restRate(u):null; },
    // стенд шага 3 (18.10): деревни у столицы, бунт, постановка отряда, лояльность в переговорах, древесина, карточка деревни
    vils:()=>{ const cap=capOf(); return LM.map((l,li)=>({li,d:+(wdist(l,cap)/dxH).toFixed(1),pop:Math.round(popOf(l.size)),col:l.c.col,row:l.c.row})).filter(v=>v.d>0.5&&!LM[v.li].capital&&!LM[v.li].aiCapital).sort((a,b)=>a.d-b.d).slice(0,8); },
    vil:li=>{ const l=LM[li]; return l?{rel:l.rel||null,will:l.will,eff:effWill(l),fear:fearOf(l),rebel:l._rebelT??null,pal:!!l.palisade,pop:Math.round(popOf(l.size))}:null; },
    rebel:li=>{ const l=LM[li]; ensureWill(l); l.rel=null; l.will=62; l._rebelT=turn; return true; },
    place:(n,col,row)=>{ const u=UNITS[n], j=HI.get(col+','+row); if(!u||j===undefined)return false; u.i=j; u.path.length=0; u.mp=u.mpMax; uPlaceAll(); return true; },
    wood:n=>{ STORE['древесина']=n; return n; }, vilOpen:li=>{ openVillage(li); return vilPanel.innerText; }, sciDone:id=>!!sciDone[id],
    card:()=>unitCard.innerText,
    battleFF:sec=>{ if(!BAT)return null; const n=Math.round(sec/0.05); for(let k=0;k<n;k++)BAT.g.userData.upd(0.05); return +BAT.g.userData.time().toFixed(2); },   // стенд: перемотка сечи (SwiftShader ~1 кадр/с)
    sleep:n=>{ const u=UNITS[n]; if(u){ u.sleep=true; u.path.length=0; } return !!u; }, lmPop:li=>LM[li]?Math.round(popOf(LM[li].size)):null,
    hover:(col,row)=>{ const i=HI.get(col+','+row); if(!uSel||i===undefined)return null; uPrevI=i; uPrevPath=uPath(uSel.i,i); if(uPrevPath&&uPrevPath.length>1){ drawRoute(uPrevPath); const t=turnsFrom(uPrevPath,uSel); badgeAt(i,t>=99?'✕':t===0?'✓':String(t),t>=99?'не пройти':t===0?'сейчас':t===1?'ход':t<5?'хода':'ходов'); return {dots:routeG.children.length,t}; } return null; } };

  window.__econ={ survey:()=>{ if(pickingCapital)return -1; if(!pickingSurvey&&!pickingIndustry){ pickingSurvey=true; } reveal(); return foundPatches.length; },
    patches:()=>foundPatches.map(p=>({key:p.r.key,n:p.cells.length,t:keyOf(p.target),x:+HX[p.target].x.toFixed(1),z:+HX[p.target].z.toFixed(1),inds:biomeInds(p.r.key)})),
    look:(k,ind)=>{ const p=foundPatches[k]; if(!p)return null; preview(p); if(ind&&biomeInds(p.r.key).includes(ind)){ selInd=ind; renderBuilding(); openPanel(p); } return indP.innerText; },   // стенд: панель без закладки
    tradeTo:()=>{ const t=tradeTo||pickTarget(false), cap=capOf(); if(!t||!cap)return null; const ns=tradeNodes();
      return {name:t.lm.name,cells:+(wdist(t.lm,cap)/ctx.dxH).toFixed(1),pop:t.pop,x:+t.lm.x.toFixed(1),z:+t.lm.z.toFixed(1),cx:+cap.x.toFixed(1),cz:+cap.z.toFixed(1),
        near:ns.map(n=>[n.lm.name,+(wdist(n.lm,cap)/ctx.dxH).toFixed(1),n.pop]).sort((a,b)=>a[1]-b[1]).slice(0,6)}; },
    routeRedraw:()=>{ redrawRoute(); return tradeG.children.length; },
    redrawFields:()=>{ let n=0; for(const r of INDUSTRIES)for(const c of r.cells){ ctx.redrawHex(HX[c]); n++; } return n; },
    fieldXY:k=>{ const r=INDUSTRIES[k]; if(!r)return null; const a=r.cells.filter(c=>HX[c].farm||HX[c].pen); return {act:r.act,n:r.cells.length,w:r.workers,xy:a.map(c=>[+HX[c].x.toFixed(1),+HX[c].z.toFixed(1)])}; },
    pick:(k,ind)=>{ const p=foundPatches[k]; if(!p)return null; preview(p); if(ind&&biomeInds(p.r.key).includes(ind)){ selInd=ind; renderBuilding(); openPanel(p); } commit(p); return INDUSTRIES.length; },
    state:()=>{ const cap=capOf(); return {промыслов:INDUSTRIES.length,руки:laborPool(),занято:INDUSTRIES.reduce((s,r)=>s+r.workers,0),
      еда:cap?cap._food:null,нужно:capNeed(),ямы:cap?Math.round(cap._store||0):null,голод:cap?+(cap._hunger||0).toFixed(2):null,склад:{...STORE},
      инд:INDUSTRIES.map(r=>({и:r.ind,x:+r.bx.toFixed(1),z:+r.bz.toFixed(1),кл:r.cells.length,люди:r.workers,ход:r.perTurn,т2:r.perTurn2,путь:deliv(r).L,дорога:deliv(r).gradeName,доходит:+deliv(r).frac.toFixed(2)}))}; },
    city:()=>{ openCity(); return true; }, hold:()=>holdTurn(),
    sci:()=>sciList(), invent:id=>{ sciInvent(id); return !!sciDone[id]; }, tree:()=>{ openTree(); return true; },
    granary:()=>{ const c=capOf(); if(c)c._hasGranary=true; return !!c; }, addRes:(k,n)=>{ STORE[k]=(STORE[k]||0)+n; return STORE[k]; },
    money:n=>{ if(n!=null){ money=n; updateStats(); } return money; },
    pave:k=>{ const r=INDUSTRIES[k]; if(!r)return null; const np=paveInfo(r); paveRoad(r); return {np,paved:r.paved||0}; },
    sell:(k,n)=>{ caravanSend(k,n); return {msg:tradeMsg,caravans:caravans.length,left:marketLeft}; },
    trade:()=>({to:tradeTo?tradeTo.lm.name:null,content,fame,share:giveShare,caravans:caravans.slice(),line:tradeG.children.length}),
    emp:tab=>{ empTab=tab||'sett'; renderEmp(); emp.classList.add('on'); setBright(true); return true; },
    city:t=>{ openCity(); if(t){ cityTab=t; renderCity(); } return (document.querySelector('#g-city .body')||{innerHTML:''}).innerHTML.length; },
    vil:i=>{ const lm=LM[i]; if(!lm)return null; ensureWill(lm); return {name:lm.name,will:Math.round(lm.will),loy:100-Math.round(lm.will),rel:lm.rel||null,canProt:canProtect(lm,capOf()),razv:!!lm._razv,mercy:!!lm._mercy,
      pop:Math.round(popOf(lm.size)),food:lm._food??null,need:lm._need??null,hunger:lm._hunger!=null?+lm._hunger.toFixed(2):null,
      inn:lm._in??null,out:lm._out??null,grow:lm._growLast??null,hands:courtPool(lm),busy:INDUSTRIES.reduce((s,r)=>s+(r.homeLi===i?r.workers:0),0)}; },
    villages:()=>LM.map((l,i)=>({i,name:l.name,rel:l.rel||null,will:l.will!=null?Math.round(l.will):null,cap:!!l.capital,ai:!!l.aiCapital,free:l.free||null,d:capOf()?Math.round(wdist(l,capOf())/K):null})),
    freeList:()=>LM.map((l,i)=>({i,l})).filter(o=>o.l.free||o.l._fprof).map(o=>({i:o.i,name:o.l.name,prof:o.l.free||null,inf:Math.round(o.l._inf||0),pop:popOf(o.l.size),q:o.l.q||o.l._q||null,rent:o.l._rent||null,trib:o.l._ftrib??null,fprof:o.l._fprof||null,rel:o.l.rel||null,subT:o.l._subT??0,infAi:Math.round(o.l._infAi||0),subAiT:o.l._subAiT??0})),
    freeSet:(i,v)=>{ const l=LM[i]; if(!l||!l.free)return null; l._inf=v; return l._inf; },
    freeSetAi:(i,v)=>{ const l=LM[i]; if(!l||!l.free)return null; l._infAi=v; return l._infAi; },   // 26.10 ст.3: смоук гонки за грады
    popSet:(i,n)=>{ const l=LM[i]; if(!l)return null; setSize(l,sizeOfPop(n)); return popOf(l.size); },
    storeAdd:(k,n)=>{ STORE[k]=(STORE[k]||0)+n; return STORE[k]; },    // 26.10 ст.3: смоук — товары для даров
    freeBand:(i,str)=>{ const l=LM[i]; if(!l||!l.free)return null; uSpawn('band',lmI(l),{mp:0,str:str||50}); return str||50; },   // 26.10: тестовый мост — дружина у стен града
    freeDemand:i=>{ const l=LM[i]; if(!l||!l.free)return null; freeDemand(l); return l._ftrib??null; },
    freeStorm:i=>{ const l=LM[i]; if(!l||!l.free)return null; freeStorm(l); return l.rel||null; },
    freePardon:i=>{ const l=LM[i]; if(!l||!l.free)return null; freePardon(l); return l._inf; },
    freeJoinNow:i=>{ const l=LM[i]; if(!l||!l.free)return null; freeJoin(l); return l.rel||null; },
    empPop:()=>empPop(),
    aiInfo:()=>{ const ac=aiCap(); if(!ac)return null; const ti=AI.tgtK!=null?byKey.get(AI.tgtK):undefined, t=ti!=null?LM[ti]:null;   // 26.10: смоук ступени 1
      const gi2=AI.cTgtK!=null?byKey.get(AI.cTgtK):undefined, g=gi2!=null?LM[gi2]:null;
      return {cap:ac.name,pop:popOf(ac.size),grow:ac._growLast||0,taken:AI.taken||0,tgt:t?{i:ti,name:t.name,will:t.will!=null?Math.round(t.will):null}:null,
        owned:LM.map((l,i)=>({l,i})).filter(o=>o.l.aiOwned).map(o=>({i:o.i,name:o.l.name,pop:popOf(o.l.size),will:o.l.will!=null?Math.round(o.l.will):null})),
        band:AIB?{i:AIB.i,col:HX[AIB.i].col,row:HX[AIB.i].row,str:Math.round(AIB.str),mp:AIB.mp}:null,
        gold:Math.round((AI.gold||0)*10)/10,rel:Math.round(AI.rel??50),cTgt:g?{i:gi2,name:g.name,infAi:Math.round(g._infAi||0)}:null,
        war:!!AI.war,warT:AI.warT??null,warLoss:AI.warLoss||0,peaceAsk:AI.peaceAskT??null}; },
    aiGold:n=>{ AI.gold=n; return AI.gold; },                          // 26.10 ст.3: смоук — форс достатка
    aiRelSet:n=>{ AI.rel=n; return AI.rel; },
    aibHire:()=>{ const ac=aiCap(); if(!ac)return null; aibKill(); AIB=aibSpawn(lmI(ac),30,6); AI.hireT=turn; return {i:AIB.i,str:AIB.str}; },   // 26.10 смоук: форс-найм дружины соперника
    aibSet:(str)=>{ if(!AIB)return null; if(str<=0){ aibKill(); return 0; } AIB.str=str; uTag(AIB); return AIB.str; },   // 26.10 ст.4 смоук: сила/гибель его дружины
    aiWarSet:v=>{ AI.war=!!v; if(v){ AI.warT=turn; AI.warLoss=0; } else AI.peaceT=turn; return AI.war; },                // 26.10 ст.4 смоук: форс войны/мира
    evtClear:()=>{ evtQ.length=0; evtEl.classList.remove('on'); return true; },                                          // 26.10 ст.4 смоук: сброс очереди событий
    bandAt:(col,row,str)=>{ const i=HI.get(col+','+row); if(i===undefined)return null; const u=uSpawn('band',i,{mp:6,str:str||30}); return UNITS.indexOf(u); },   // 26.10 ст.4 смоук: наш отряд на клетке
    uGo:(n,col,row)=>{ const u=UNITS[n], j=HI.get(col+','+row); if(!u||j===undefined)return null; const p=uPath(u.i,j); if(!p)return null; u.path=p.slice(1); u.mp=u.mpMax; uWalkNow(u); return {i:u.i,left:u.path.length}; },   // 26.10 ст.4 смоук: приказ пути с ходом сразу
    raidAt:(i,str)=>{ if(!NESTS.length)return null; const r=rSpawn(0,{i,s:str||20,sn:1}); return {i:r.i,str:r.str}; },   // 26.10 смоук: шайка на клетке i
    willSet:(i,v)=>{ const l=LM[i]; if(!l)return null; ensureWill(l); l.will=v; return l.will; },
    freeQ:(i,k)=>{ const l=LM[i]; if(!l||!l.free)return null; l._q=k==='goods'?{k:'goods',res:'шкуры',n:1,until:turn+15,txt:'прислать 1 ед.: шкуры (тест)'}:{k:'rescue',until:turn+8}; return l._q; },
    act:(a,i,force)=>{ const lm=LM[i]; if(!lm)return null; if(force!=null)lm.will=force;
      if(a==='gift')doGift(i); else if(a==='prot')doProtect(i); else if(a==='trib')doTribute(i); else if(a==='annex')doAnnex(i); else if(a==='open')openVillage(i);
      else if(a==='razv'){ lm._razv=!lm._razv; if(lm._razv)delete lm._mercy; }
      else if(a==='mercy'){ lm._mercy=!lm._mercy; if(lm._mercy)delete lm._razv; }
      else if(a==='consc'&&money>=20&&popOf(lm.size)>=150){ money-=20; setSize(lm,sizeOfPop(popOf(lm.size)-30)); willAdd(lm,10,'призыв на службу'); uSpawn('band',lmI(lm),{mp:0}); recompute(); }
      setTimeout(()=>{ evtQ.length=0; evtEl.classList.remove('on'); },150); return {rel:lm.rel||null,will:Math.round(lm.will)}; },
    zones:()=>zoneGs.map(z=>({base:+z.base.toFixed(1),meshes:z.g.children.length,verts:z.g.children.reduce((s,m)=>s+m.geometry.attributes.position.count,0)})),
    labor:()=>laborPool(), need:()=>capNeed() };

  // ================= ХОД (endTurn + advanceEconomy, index.html 5973–5979, 6110–6126) =================
  function endTurn(){
    if(busy||!inGame)return;
    if(pickingCapital){ nudge(); return; }                           // есть незакрытое дело → к нему, ход не начинаем
    if(BAT||BQ.length){ hud.setState('идёт сеча — ждём исхода'); return; }   // 21.10: ход стоит, пока сеча не доиграна
    if(evtEl.classList.contains('on')||evtQ.length){ hud.setState('сначала ответь на событие'); return; }   // 30.10 (как в циве): открытое окно держит ход
    if(sciNeed&&sciFocus==null){ sciAsk0(); hud.setState('нужен наказ: куда направить умы'); return; }      // 30.10: выбор науки обязателен
    if(holdTurn()){ nudge(); return; }                               // 15.10: держим ход, пока не заложен первый промысел (pendingTask старого)
    if(!autoTurns){ const du=uDuties(); if(du.length){ uFocus(du[0]); hud.setState('отряд ждёт приказа'); return; } }   // 16.10: дела хода (__unitDuties старого)
    cancelPick();                                                     // повторный осмотр не завершён — отменяем, ход идёт
    busy=true; hud.setBusy(true); hud.setState('мир живёт…');
    setTimeout(()=>{                                                   // кадр на «мир живёт…», потом расчёт
      const t0=performance.now();
      turn++;
      money=Math.max(0,money+(PLAYER.leaderId==='louis14'?2:0)-1);
      sci+=1+(PLAYER.leaderId==='catherine2'?2:0);
      const stg=LM.map(l=>stageIdxH(l));
      econTick(); unitsTick();
      INDUSTRIES.forEach(r=>{ if(r._conv>0)r._conv--; });              // перестройка угодья: простой отработан
      const sp=statePop(); if(_prevStatePop!=null)_popDelta=sp-_prevStatePop; _prevStatePop=sp;
      const t1=performance.now(); const fresh=TRAILS.turn(); window.__trailMs=Math.round(performance.now()-t1); window.__retrail&&window.__retrail(TRAILS.dirty);
      // НОВОЕ (журнал): тропа наезжена до тракта; поселение выросло до новой ступени
      for(const f of fresh){ const a=LM[byKey.get(f.a.col+','+f.a.row)], b=LM[byKey.get(f.b.col+','+f.b.row)];
        const an=a?a.name:null, bn=b?b.name:null;
        glog(an&&bn?`🚶 Тропа <b>${an}</b> — <b>${bn}</b> наезжена до тракта`:`🚶 Тропа наезжена до тракта`,{at:[f.x,f.z]}); }
      LM.forEach((l,i)=>{ const s=stageIdxH(l); if(s>stg[i])glog(`⚑ Поселение <b>${l.name||''}</b> выросло: теперь это ${STAGES[s]}`,{at:[l.x,l.z]}); });
      if(window.__fog)window.__fog.recalc();                           // 28.10: туман после хода (данники/отряды могли дать новые глаза)
      updateStats(); hud.update(turn); hud.setState('ждём приказов');
      if(vilIdx>=0)renderVillage(); if(emp.classList.contains('on'))renderEmp();
      window.__turnMs=Math.round(performance.now()-t0);
      busy=false; hud.setBusy(false);
      // 30.10 (Артём): ход прошёл тихо (ни окон, ни сечь) — камера к последнему тронутому отряду
      if(!autoTurns&&uLastTouch&&UNITS.includes(uLastTouch)&&!batBusy()&&!evtQ.length&&!evtEl.classList.contains('on'))uFocus(uLastTouch);
      if(autoTurns)setTimeout(autoNext,350);
    },60); }
  function autoNext(){ if(autoTurns&&!busy&&inGame&&!pickingCapital&&!BAT&&!BQ.length&&!holdTurn()&&!document.querySelector('#g-story.on,#g-pausepage.on'))endTurn(); }
  window.__endTurn=endTurn;
  window.__turns=n=>{ for(let k=0;k<n;k++){ if(pickingCapital||holdTurn())break;          // стенд: N ходов подряд без ожидания кадров
      cancelPick();
      turn++; money=Math.max(0,money+(PLAYER.leaderId==='louis14'?2:0)-1); sci+=1+(PLAYER.leaderId==='catherine2'?2:0);
      econTick(); unitsTick(); INDUSTRIES.forEach(r=>{ if(r._conv>0)r._conv--; }); TRAILS.turn(); }
    window.__retrail&&window.__retrail(); for(const r of recs)r.sig=null; if(window.__fog)window.__fog.recalc(); updateStats(); hud.update(turn); return turn; };

  // ================= ЗАСТАВКА + СТАРТОВОЕ МЕНЮ (index.html 70–95, 8953–9174) =================
  { const st=document.createElement('style'); st.textContent=`
    #g-menu{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(120% 120% at 50% 0%,#2a4262 0%,#141d2e 58%,#0b1119 100%);font-family:system-ui,sans-serif;color:#eaf1fb}
    #g-menu.off{display:none}
    #g-menu .box{width:min(94vw,560px);text-align:center;padding:8px;max-height:94vh;overflow-y:auto}
    #g-menu .leaders{display:flex;gap:14px;margin-top:6px}
    #g-menu .lead{flex:1;padding:10px 8px 12px;border-radius:14px;cursor:pointer;background:#ffffff0d;border:2px solid #ffffff1f;transition:.12s}
    #g-menu .lead:hover{background:#ffffff17}
    #g-menu .lead.sel{border-color:#f4cd7e;background:#f4cd7e1c;box-shadow:0 0 0 1px #f4cd7e55}
    #g-menu .lead .ln{margin-top:8px;font-size:15px;font-weight:700;color:#ffe9c2}
    #g-menu .lead .le{font-size:11.5px;opacity:.6;margin-top:1px}
    #g-menu .lead .lt{margin-top:7px;font-size:12px;font-weight:600;color:#f4cd7e}
    #g-menu .lead .ld{margin-top:3px;font-size:11px;opacity:.7;line-height:1.35}
    #g-menu .crown{font-size:34px;color:#f4d68a;margin-bottom:2px;filter:drop-shadow(0 2px 8px #f4cd7e55)}
    #g-menu .title{font-family:Georgia,serif;font-size:clamp(18px,4.6vw,28px);font-weight:800;letter-spacing:4px;margin:0;white-space:nowrap;color:#f4d68a;text-shadow:0 3px 18px #000a,0 0 34px #f4cd7e33}
    #g-menu .sub{opacity:.7;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:4px 0 30px}
    #g-menu button.big{display:block;width:100%;margin:10px 0;border:0;border-radius:12px;padding:14px;font-size:17px;font-weight:700;cursor:pointer;font-family:system-ui;
      background:linear-gradient(#f4cd7e,#c8912f);color:#3a2606;box-shadow:0 6px 18px #0006,inset 0 1px 0 #fff8}
    #g-menu button.big.ghost{background:#ffffff14;color:#dbe6f5;box-shadow:none;border:1px solid #ffffff26}
    #g-menu button.big:hover{filter:brightness(1.05)}
    #g-menu .scr2{display:none} #g-menu.setup .scr1{display:none} #g-menu.setup .scr2{display:block}
    #g-menu label.f{display:block;text-align:left;font-size:13px;opacity:.7;margin:14px 4px 6px}
    #g-menu input.nm{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:11px;border:1px solid #ffffff2a;background:#0d1826;color:#ffe9c2;font-size:16px;font-weight:600;text-align:center;outline:none;font-family:system-ui}
    #g-menu input.nm:focus{border-color:#f4cd7e;box-shadow:0 0 0 2px #f4cd7e40}
    #g-menu .ctys{display:flex;gap:12px;margin-top:6px}
    #g-menu .cty{flex:1;padding:16px 8px;border-radius:12px;cursor:pointer;background:#ffffff10;border:2px solid #ffffff1f;transition:.12s}
    #g-menu .cty .fl{font-size:34px;line-height:1} #g-menu .cty .nm2{margin-top:6px;font-size:15px;font-weight:600}
    #g-menu .cty:hover{background:#ffffff1a}
    #g-menu .cty.sel{border-color:#f4cd7e;background:#f4cd7e22;box-shadow:0 0 0 1px #f4cd7e55}
    #g-menu .cty.off2{opacity:.4;cursor:default}
    #g-menu .cols{display:grid;grid-template-columns:repeat(8,1fr);gap:7px;margin-top:6px}
    #g-menu .col{position:relative;padding-top:100%;border-radius:9px;cursor:pointer;border:2px solid #ffffff22;transition:.12s}
    #g-menu .col:hover{transform:translateY(-1px);border-color:#ffffff5c}
    #g-menu .col.sel{border-color:#fff;box-shadow:0 0 0 2px #ffffff55,0 3px 10px #0006}
    #g-menu .col.sel:after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:700;text-shadow:0 1px 3px #0009}
    #g-menu .col.nat:before{content:'';position:absolute;left:50%;top:-5px;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#f4cd7e}
    #g-menu .colname{margin-top:7px;font-size:12.5px;opacity:.75;min-height:16px}
    #g-menu .ver{margin-top:22px;font-size:11.5px;opacity:.42;letter-spacing:.4px}`;
    document.head.appendChild(st); }
  let last=''; try{ last=(localStorage.getItem('grad_player_name')||'').replace(/"/g,'&quot;'); }catch(e){}
  const menu=document.createElement('div'); menu.id='g-menu'; menu.style.display='none';
  menu.innerHTML=`<div class="box">
    <div class="scr1">
      <div class="crown">♔</div><h1 class="title">НОВАЯ ЦИВИЛИЗАЦИЯ</h1><div class="sub">песочница-стратегия</div>
      <button class="big" id="g-m-start">Начать игру</button>
      <button class="big ghost" id="g-m-cfg">Настройки</button>
      <button class="big ghost" id="g-m-exit">Выход</button>
      <div class="ver">${BUILD}</div>
    </div>
    <div class="scr2">
      <div class="crown">♔</div><h1 class="title" style="font-size:38px;letter-spacing:4px">Новая держава</h1>
      <div class="sub" style="margin-bottom:8px">кто поведёт народ сквозь века?</div>
      <label class="f" for="g-m-name">Имя правителя</label>
      <input class="nm" id="g-m-name" maxlength="24" autocomplete="off" spellcheck="false" placeholder="Правитель" value="${last}">
      <label class="f">Страна</label>
      <div class="ctys" id="g-m-ctys">
        <div class="cty sel" data-id="ru"><div class="fl">🇷🇺</div><div class="nm2">Россия</div></div>
        <div class="cty" data-id="fr"><div class="fl">🇫🇷</div><div class="nm2">Франция</div></div>
      </div>
      <label class="f" style="margin-top:14px">Правитель</label>
      <div class="leaders" id="g-m-leaders"></div>
      <label class="f" style="margin-top:14px">Цвет державы <span style="opacity:.55;font-weight:400">— золотой точкой отмечены родные цвета страны</span></label>
      <div class="cols" id="g-m-cols"></div>
      <div class="colname" id="g-m-colname"></div>
      <label class="f" style="margin-top:14px">Карта <span style="opacity:.55;font-weight:400">— в новом движке пока одна</span></label>
      <div class="ctys"><div class="cty sel"><div class="fl">🌍</div><div class="nm2">Маленький мир</div><div style="opacity:.55;font-size:11px;margin-top:2px">112 × 84 клеток · 60 деревень</div></div></div>
      <button class="big" id="g-m-go" style="margin-top:22px">Начать</button>
      <button class="big ghost" id="g-m-back">Назад</button>
    </div></div>`;
  document.body.appendChild(menu);
  let pickId='ru', pickCol=null, pickLeader=null;
  let firstStart=true;
  function drawLeaders(){ const list=LEADERS[pickId]||LEADERS.ru;
    if(!pickLeader||!list.some(l=>l.id===pickLeader))pickLeader=list[0].id;
    const box=$('g-m-leaders'); box.innerHTML='';
    list.forEach(L=>{ const card=document.createElement('div'); card.className='lead'+(L.id===pickLeader?' sel':''); card.dataset.id=L.id;
      card.appendChild(portrait(L.id,150));
      card.insertAdjacentHTML('beforeend',`<div class="ln">${L.name}</div><div class="le">${L.epi}</div><div class="lt">${L.trait}</div><div class="ld">${L.desc}</div>`);
      card.onmouseenter=()=>setMood(card.querySelector('svg'),'smile'); card.onmouseleave=()=>setMood(card.querySelector('svg'),'neutral');
      card.onclick=()=>{ pickLeader=L.id; drawLeaders(); }; box.appendChild(card); }); }
  function drawColors(){ const list=paletteFor(pickId,[]), nat=(COUNTRIES[pickId].native||[]);
    if(!pickCol||!list.some(c=>c.id===pickCol))pickCol=list[0].id;
    $('g-m-cols').innerHTML=list.map(c=>`<div class="col${c.id===pickCol?' sel':''}${nat.includes(c.id)?' nat':''}" data-id="${c.id}" title="${c.name}" style="background:${cssOf(c.id)}"></div>`).join('');
    $('g-m-colname').textContent=colorById(pickCol).name;
    $('g-m-cols').querySelectorAll('.col').forEach(el=>el.onclick=()=>{ pickCol=el.dataset.id; drawColors(); }); }
  $('g-m-start').onclick=()=>{ menu.classList.add('setup'); setTimeout(()=>$('g-m-name').focus(),40); };
  $('g-m-cfg').onclick=()=>openCfg();
  $('g-m-back').onclick=()=>menu.classList.remove('setup');
  $('g-m-ctys').querySelectorAll('.cty').forEach(el=>el.onclick=()=>{ pickId=el.dataset.id;
    $('g-m-ctys').querySelectorAll('.cty').forEach(x=>x.classList.toggle('sel',x===el)); pickCol=null; pickLeader=null; drawColors(); drawLeaders(); });
  drawColors(); drawLeaders();
  $('g-m-exit').onclick=()=>{ try{ window.close(); }catch(e){}
    menu.innerHTML=`<div class="box"><div class="crown">♔</div><h1 class="title" style="font-size:34px;letter-spacing:4px">До встречи!</h1><div class="sub">можно закрыть вкладку</div></div>`; };
  function start(){
    const nm=($('g-m-name').value||'').trim()||'Правитель';
    PLAYER={name:nm,countryId:pickId,colorId:pickCol||'blue',leaderId:pickLeader||LEADERS[pickId][0].id};
    try{ localStorage.setItem('grad_player_name',nm); }catch(e){}
    menu.classList.add('off'); if(document.activeElement)document.activeElement.blur();
    newWorld(firstStart); firstStart=false;                        // первая партия — пятно, вокруг которого уже собран мир
    const L=leaderById(PLAYER.leaderId);
    glog(`${COUNTRIES[pickId].flag} ${nm} — держава ${COUNTRIES[pickId].name} · ${colorById(PLAYER.colorId).name}`);
    glog(`Правит ${L.name} ${L.epi} — ${L.trait.toLowerCase()}`); glog('Игра начата'); }
  $('g-m-go').onclick=start;
  $('g-m-name').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); start(); } });
  window.__startGame=start;
  // новая партия: население и тропы — к стартовым, имена стёрты, пятно игрока выбирается заново (как newWorld старого)
  function newWorld(keepStart){
    turn=0; money=100; sci=0; usedNames=new Set(); usedCities={}; TAKEN_COLORS=[PLAYER.colorId];
    AI.active=false; AI.capIdx=-1; AI.taken=0; AI.giftT=null; AI.takeT=null; AI.tgtK=null; AI.hireT=null; AI.gold=80; AI.rel=50; AI.cGiftT=null; AI.pGiftT=null; AI.cTgtK=null; AI.war=false; AI.warT=null; AI.peaceT=null; AI.warLoss=0; AI.peaceAskT=null; _prevStatePop=null; _popDelta=0;
    LM.forEach(l=>{ setSize(l,l.size0); l._si=-1; l.name=null; l.capital=false; l.aiCapital=false; l._news=0;
      delete l._births; delete l._deaths; delete l._out; delete l._outTo; delete l._growLast; delete l._migrants; delete l._in; delete l.defBonus;
      for(const k of ['_store','_food','_need','_hunger','_attract','_foodTurns','_foodWarn','_migLog','_exodus','_idleShare','_workMul','founded',
        '_hasGranary','rel','will','tribRate','_tribAskT','_giftTurn','_begT','_rebelT','palisade','_angerRaidT','scouted','_met','_wl','_whOpen','_razv','_mercy',
        'free','_inf','_q','_qT','_rent','_helpT','_askT','_ftrib','_fprof','_subT','_subAsked','aiOwned','_infAi','_subAiT'])delete l[k]; }); uReset();
    econReset();
    TRAILS.reset(); window.__retrail&&window.__retrail();
    if(!keepStart){ START=ctx.pickStarts(); }
    initFreeCities();                                                  // 25.10: вольные грады — после выбора стартов, вне их областей
    candSet.clear(); for(const i of START.me.area)candSet.add(i); buildRings();
    pickingCapital=true; inGame=true; mk.visible=false; modal.classList.remove('on'); story.classList.remove('on'); closeVillage(); closeEmp();
    $('g-log').innerHTML='';
    setTask('Выбери столицу — кликни по поселению в открытой части карты: она станет сердцем державы.'); banner.classList.add('on');
    const T=controls.target, ax=START.me.x, az=START.me.z;
    if(Math.hypot(wdx(ax,T.x),az-T.z)>60)ctx.teleport(nearX(ax,T.x),az); else flyTo(ax,az);
    for(const r of recs)r.sig=null;
    if(window.__fogStart)window.__fogStart();                          // 28.10: туман заново — открыто только пятно выбора столицы
    hud.update(turn); hud.setState(''); updateStats(); }

  // ================= НАСТРОЙКИ (initSettings, index.html 9175–9271) =================
  // НОВОЕ: «качество», «густота травы и деревьев», «тон картинки» не перенесены — у big.html своего рендера этих ручек нет (трава убрана вердиктом 02.10)
  { const st=document.createElement('style'); st.textContent=`
    #g-cfg-btn{position:fixed;right:56px;top:12px;z-index:9;width:36px;height:36px;border-radius:50%;background:#ffffffd8;box-shadow:0 2px 12px #0004;border:0;cursor:pointer;font-size:19px;line-height:36px;text-align:center;padding:0;color:#122}
    #g-cfg-btn:hover{background:#fff}
    #g-cfgpage,#g-pausepage{position:fixed;inset:0;z-index:130;display:none;align-items:center;justify-content:center;
      background:radial-gradient(1200px 700px at 50% 38%, #1d2b40 0%, #0d1521 62%, #090f18 100%);color:#eaf1fb;font-family:system-ui,sans-serif}
    #g-pausepage{z-index:131}
    #g-cfgpage.on,#g-pausepage.on{display:flex}
    #g-cfgpage .box,#g-pausepage .box{width:min(430px,92vw);max-height:92vh;overflow:auto;text-align:left;padding:10px 6px}
    #g-cfgpage .crown,#g-pausepage .crown{text-align:center;font-size:34px;color:#f4cd7e;text-shadow:0 2px 18px #f4cd7e55}
    #g-cfgpage h1,#g-pausepage h1{text-align:center;font-size:29px;letter-spacing:5px;margin:8px 0 24px;font-weight:700}
    #g-cfgpage .s,#g-pausepage .s{margin-top:18px;font-size:13.5px;opacity:.88}
    #g-cfgpage .note,#g-pausepage .note{display:block;font-size:11.5px;opacity:.5;margin-top:2px;font-weight:400}
    #g-cfgpage label.chk{display:flex;gap:9px;align-items:center;margin-top:24px;cursor:pointer;font-size:14px}
    #g-cfgpage .back{display:block;width:100%;margin-top:32px;border:1px solid #ffffff2a;background:#ffffff12;color:#eaf1fb;border-radius:11px;padding:12px 0;font-size:15px;cursor:pointer;text-align:center}
    #g-cfgpage .back:hover{background:#ffffff20}
    #g-pause-btn{position:fixed;right:12px;top:12px;z-index:9;width:36px;height:36px;border-radius:50%;background:#ffffffd8;box-shadow:0 2px 12px #0004;border:0;cursor:pointer;font-size:17px;line-height:36px;text-align:center;padding:0;color:#122}
    #g-pause-btn:hover{background:#fff}
    #g-pausepage .qrow{display:flex;gap:8px;margin-top:9px}
    #g-pausepage .qrow button{flex:1;border:1px solid #ffffff2a;background:#ffffff12;color:#eaf1fb;border-radius:9px;padding:9px 0;cursor:pointer;font-size:13.5px}
    #g-pausepage .qrow button:hover{background:#ffffff20}
    #g-pausepage .qrow button:disabled{opacity:.35;cursor:default}
    #g-pausepage .act{display:block;width:100%;margin-top:12px;border:1px solid #ffffff2a;background:#ffffff12;color:#eaf1fb;border-radius:11px;padding:12px 0;font-size:15px;cursor:pointer;text-align:center}
    #g-pausepage .act:hover{background:#ffffff20}
    #g-pausepage .act.main{background:linear-gradient(#f4cd7e,#c98a2f);color:#2a1a06;font-weight:800;border:0}`;
    document.head.appendChild(st); }
  const cfgBtn=document.createElement('button'); cfgBtn.id='g-cfg-btn'; cfgBtn.title='Настройки'; cfgBtn.textContent='⚙'; document.body.appendChild(cfgBtn);
  const cfg=document.createElement('div'); cfg.id='g-cfgpage';
  cfg.innerHTML=`<div class="box"><div class="crown">♔</div><h1>НАСТРОЙКИ</h1>
    <label class="chk"><input type="checkbox" id="g-cfg-fps"> Показывать счётчик FPS</label>
    <button class="back" id="g-cfg-back">Назад</button>
    <div style="text-align:center;margin-top:16px;font-size:11.5px;opacity:.42;letter-spacing:.4px">${BUILD}</div></div>`;
  document.body.appendChild(cfg);
  const lsGet=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  let showFps=lsGet('labPerf')==='1';
  function openCfg(){ $('g-cfg-fps').checked=showFps; cfg.classList.add('on'); }
  $('g-cfg-fps').onchange=e=>{ showFps=e.target.checked; fpsEl.style.display=showFps?'block':'none'; try{ localStorage.setItem('labPerf',showFps?'1':'0'); }catch(e2){} };
  cfgBtn.onclick=()=>{ if(cfg.classList.contains('on'))cfg.classList.remove('on'); else openCfg(); };
  $('g-cfg-back').onclick=()=>cfg.classList.remove('on');
  fpsEl.style.display=showFps?'block':'none';

  // ================= МЕНЮ ПАУЗЫ + СОХРАНЕНИЯ (initPauseMenu, index.html 9272–9346) =================
  const pauseBtn=document.createElement('button'); pauseBtn.id='g-pause-btn'; pauseBtn.title='Меню (Esc)'; pauseBtn.textContent='☰'; document.body.appendChild(pauseBtn);
  const pp=document.createElement('div'); pp.id='g-pausepage';
  pp.innerHTML=`<div class="box"><div class="crown">♔</div><h1>МЕНЮ</h1>
    <button class="act main" id="g-p-resume">Продолжить игру</button>
    <div class="s">Сохранить / загрузить<span class="note">3 слота, живут в этом браузере</span></div>
    <div id="g-p-slots"></div>
    <button class="act" id="g-p-cfg">Настройки</button>
    <button class="act" id="g-p-exit">Выйти в главное меню</button></div>`;
  document.body.appendChild(pp);
  const SKEY=sl=>'grad2_save_'+sl;
  function saveMeta(sl){ try{ const d=JSON.parse(localStorage.getItem(SKEY(sl))||'null'); return d?{turn:d.turn,ts:d.ts,name:(d.PLAYER||{}).name}:null; }catch(e){ return null; } }
  function saveGame(sl){ const d={v:1,ts:Date.now(),turn,money,sci,PLAYER,AI:{...AI},TAKEN_COLORS,usedNames:[...usedNames],usedCities,pickingCapital,
      start:{me:START.me,ai:START.ai},
      lm:LM.map(l=>({k:l.c.col+','+l.c.row,size:l.size,_si:l._si,name:l.name,capital:l.capital,aiCapital:l.aiCapital,_news:l._news||0,
        b:l._births,d:l._deaths,o:l._out,ot:l._outTo,g:l._growLast,m:l._migrants,def:l.defBonus,
        st:l._store,fw:l._foodWarn,ml:l._migLog,fd:l._founded!=null?l._founded:l.founded,
        gr:l._hasGranary||0,sc:l.scouted?1:0,mt:l._met?1:0,wh:l._wl||null,rel:l.rel||null,wl:l.will??null,tr:l.tribRate??null,ta:l._tribAskT??null,gt:l._giftTurn??null,bt:l._begT??null,pl:l.palisade?1:0,rb:l._rebelT??null,rz:l._razv?1:0,mc:l._mercy?1:0,
        fc:l.free||null,inf:l._inf??null,fq:l._q||null,rnt:l._rent||null,hT:l._helpT??null,qT:l._qT??null,aT:l._askT??null,
        ft:l._ftrib??null,fp:l._fprof||null,sT:l._subT??null,sA:l._subAsked??null,ao:l.aiOwned?1:0,ia:l._infAi??null,sB:l._subAiT??null})),
      road:TRAILS.save(), econ:econSave(), units:uSave(), raids:rSave(), aib:AIB?{i:AIB.i,s:Math.round(AIB.str)}:null,
      fog:window.__fog?window.__fog.save():null,                       // 28.10: разведанные гексы (видимость пересчитается сама)
      log:$('g-log').innerHTML };
    try{ localStorage.setItem(SKEY(sl),JSON.stringify(d)); glog('Партия сохранена в слот '+sl); }catch(e){ glog('Не удалось сохранить: '+e.message,{warn:1}); } }
  function loadGame(sl){ let d=null; try{ d=JSON.parse(localStorage.getItem(SKEY(sl))||'null'); }catch(e){} if(!d)return;
    turn=d.turn; money=d.money; sci=d.sci; PLAYER=d.PLAYER;
    AI.war=false; AI.warT=null; AI.peaceT=null; AI.warLoss=0; AI.peaceAskT=null;   // 26.10 ст.4: старый сейв без войны не должен унаследовать войну текущей партии
    Object.assign(AI,d.AI); TAKEN_COLORS=d.TAKEN_COLORS;
    usedNames=new Set(d.usedNames); usedCities=d.usedCities; START=d.start;
    for(const s of d.lm){ const i=byKey.get(s.k); if(i===undefined)continue; const l=LM[i];
      setSize(l,s.size); l._si=s._si; l.name=s.name; l.capital=s.capital; l.aiCapital=s.aiCapital; l._news=s._news;
      l._births=s.b; l._deaths=s.d; l._out=s.o; l._outTo=s.ot; l._growLast=s.g; l._migrants=s.m; l.defBonus=s.def;
      l._store=s.st; l._foodWarn=s.fw; l._migLog=s.ml; l.founded=s.fd;
      l._hasGranary=!!s.gr; l.scouted=!!s.sc; l._met=!!s.mt; l._wl=s.wh||undefined; l.rel=s.rel||undefined; l.will=s.wl??undefined; l.tribRate=s.tr??undefined; l._tribAskT=s.ta??undefined; l._giftTurn=s.gt??undefined; l._begT=s.bt??undefined; l.palisade=!!s.pl; l._rebelT=s.rb??undefined; l._razv=s.rz?true:undefined; l._mercy=s.mc?true:undefined;
      l.free=s.fc||undefined; l._inf=s.inf??undefined; l._q=s.fq||undefined; l._rent=s.rnt||undefined; l._helpT=s.hT??undefined; l._qT=s.qT??undefined; l._askT=s.aT??undefined;
      l._ftrib=s.ft??undefined; l._fprof=s.fp||undefined; l._subT=s.sT??undefined; l._subAsked=s.sA??undefined; l.aiOwned=s.ao?true:undefined; l._infAi=s.ia??undefined; l._subAiT=s.sB??undefined; }
    TRAILS.load(d.road); window.__retrail&&window.__retrail();
    pickingCapital=!!d.pickingCapital; inGame=true; menu.classList.add('off');
    econLoad(d.econ); uLoad(d.units); if(!d.units&&capOf())uInitScout(); rLoad(d.raids);   // 16.10: старый сейв без отрядов — округа столицы разведана
    if(d.aib)AIB=aibSpawn(d.aib.i,d.aib.s);                            // 26.10 ступень 2: дружина соперника (uLoad→uReset уже убрал прежнюю)
    if(window.__fog){ if(d.fog)window.__fog.load(d.fog);
      else if(capOf())window.__fog.exploreAll(); }                     // 28.10: старый сейв без тумана — игрок карту уже видел
    candSet.clear(); if(pickingCapital)for(const i of START.me.area)candSet.add(i); buildRings();
    banner.classList.toggle('on',pickingCapital);
    if(pickingCapital)setTask('Выбери столицу — кликни по поселению в открытой части карты: она станет сердцем державы.');
    const cap=capOf(); mk.visible=!!cap;
    const T=controls.target, f=cap||LM[START.me.i];
    if(Math.hypot(wdx(f.x,T.x),f.z-T.z)>60)ctx.teleport(nearX(f.x,T.x),f.z); else flyTo(f.x,f.z);
    $('g-log').innerHTML=d.log||''; glog('Загружено сохранение: ход '+turn);
    for(const r of recs)r.sig=null; closeVillage(); closeEmp(); pp.classList.remove('on');
    if(capOf()&&!pickingCapital&&!INDUSTRIES.length)onCapitalFounded();   // 15.10: первый промысел не заложен — советник снова зовёт
    _prevStatePop=statePop(); hud.update(turn); hud.setState(pickingCapital?'':'ждём приказов'); updateStats(); }
  function renderSlots(){ const box=$('g-p-slots'); box.innerHTML='';
    for(let sl=1;sl<=3;sl++){ const m=saveMeta(sl);
      const row=document.createElement('div'); row.className='qrow';
      const lab=m?('слот '+sl+' · ход '+m.turn+' · '+new Date(m.ts).toLocaleString('ru',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})):('слот '+sl+' · пусто');
      const bs=document.createElement('button'); bs.textContent='💾 '+lab; bs.disabled=!inGame;
      bs.onclick=()=>{ if(m&&!confirm('Перезаписать «'+lab+'»?'))return; saveGame(sl); renderSlots(); };
      const bl=document.createElement('button'); bl.textContent='Загрузить'; bl.disabled=!m;
      bl.onclick=()=>{ if(!inGame||confirm('Загрузить сохранение? Несохранённый прогресс пропадёт.'))loadGame(sl); };
      row.appendChild(bs); row.appendChild(bl); box.appendChild(row); } }
  const openPause=()=>{ renderSlots(); pp.classList.add('on'); }, closePause=()=>pp.classList.remove('on');
  pauseBtn.onclick=()=>{ if(pp.classList.contains('on'))closePause(); else openPause(); };
  $('g-p-resume').onclick=closePause;
  $('g-p-cfg').onclick=()=>{ closePause(); openCfg(); };
  $('g-p-exit').onclick=()=>{ if(inGame&&!confirm('Выйти в главное меню? Несохранённая партия будет потеряна.'))return;
    closePause(); inGame=false; pickingCapital=false; autoTurns=false; $('auto').checked=false; banner.classList.remove('on');
    menu.classList.remove('off'); menu.classList.remove('setup'); menuContinue(); };
  window.__saveGame=saveGame; window.__loadGame=loadGame;
  // кнопки «Продолжить» в главном меню (index.html 9977–9986), если есть сохранения
  function menuContinue(){ const btn=$('g-m-start'); const old=$('g-m-cont'); if(old)old.remove();
    const wrap=document.createElement('div'); wrap.id='g-m-cont';
    for(let sl=1;sl<=3;sl++){ const m=saveMeta(sl); if(!m)continue;
      const b=document.createElement('button'); b.className='big'; b.style.marginTop='10px';
      b.textContent='Продолжить: '+(m.name||'партия')+' · ход '+m.turn+' (слот '+sl+')';
      b.onclick=()=>{ firstStart=false; loadGame(sl); }; wrap.appendChild(b); }
    if(wrap.children.length)btn.parentNode.insertBefore(wrap,btn.nextSibling); }
  menuContinue();
  addEventListener('keydown',e=>{ if(e.key!=='Escape')return;
    if(modal.classList.contains('on')){ modal.classList.remove('on'); pend=null; return; }
    if(uSel&&!pp.classList.contains('on')){ uDesel(); return; }       // 16.10: ESC при выбранном отряде — снять выбор, меню не открывать
    if(!pp.classList.contains('on')){
      if(escEcon())return;                                               // 15.10: панель промысла / столицы / угодья
      if(cfg.classList.contains('on')){ cfg.classList.remove('on'); return; }
      if(emp.classList.contains('on')){ closeEmp(); return; }
      if(vilPanel.classList.contains('on')){ closeVillage(); return; } }
    if(pp.classList.contains('on'))closePause(); else if(menu.classList.contains('off'))openPause(); });

  // ================= КАДР =================
  let menuShown=false, fpsN=0, fpsT=performance.now();
  function frame(){
    if(!menuShown){ menuShown=true; menu.style.display=''; }
    applyPan();
    if(camTarget){ const T=controls.target; T.x+=(camTarget.x-T.x)*0.09; T.z+=(camTarget.z-T.z)*0.09;
      if(Math.hypot(camTarget.x-T.x,camTarget.z-T.z)<0.05)camTarget=null; }
    const cap=capOf(), T=controls.target, t=performance.now()*0.001;
    if(cap&&mk.visible){ const y0=cap.y+3.4*K; mk.position.set(nearX(cap.x,T.x),y0+Math.sin(t*1.7)*0.22*K,cap.z); gem.rotation.y=t*1.1; }
    if(ringG.children.length){ ringMat.opacity=0.6+0.35*Math.sin(t*3);
      for(const ln of ringG.children){ const lm=ln.userData.lm; ln.position.set(nearX(lm.x,T.x),0,lm.z); } }
    { const dx=nearX(gBase,T.x)-gBase; svG.position.x=dx; hlG.position.x=dx; dashG.position.x=dx;
      tradeG.position.x=nearX(tBase,T.x)-tBase; for(const z of zoneGs)z.g.position.x=nearX(z.base,T.x)-z.base; }   // граница и торговый путь — у шва на ближнем листе
    updateLabels(); finderTick(); unitsFrame();
    if(showFps){ fpsN++; const n=performance.now(); if(n-fpsT>=500){ fpsEl.textContent=Math.round(fpsN*1000/(n-fpsT))+' FPS'; fpsN=0; fpsT=n; } } }
  hud.update(0); updateStats();
  window.__game=()=>({ход:turn,год:yearOf(turn),столица:capOf()?capOf().name:null,ии:aiCap()?aiCap().name:null,казна:money,наука:sci,
    выбор:pickingCapital,кандидаты:[...candSet].map(i=>[LM[i].c.col,LM[i].c.row]),пятно_ии:START.ai?[LM[START.ai.i].c.col,LM[START.ai.i].c.row]:null,
    до_ии_клеток:(capOf()&&aiCap())?+(wdist(capOf(),aiCap())/dxH).toFixed(1):null,полкольца_клеток:+(WX/2/dxH).toFixed(1),
    жители_державы:statePop(),деревни:LM.filter(l=>!l.capital&&!l.aiCapital).map(l=>popOf(l.size)),тропы:TRAILS.statNow()});
  window.__pickCap=i=>{ const lm=LM[i!=null?i:[...candSet][0]]; propose(lm); confirmCapital(); $('g-story-ok').click(); return lm.name; };
  return {frame};
}
