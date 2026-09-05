// ui.js — общая UI-оболочка для всех прототипов grad (уговор DECISIONS 2026-07-02).
// Год крупно в шапке по центру (рядом ход и эпоха), круглая кнопка «Конец хода» снизу.
// Не рисуем UI заново в каждом файле — подключаем этот слой.

// ---- время: год из номера хода (старт 5000 до н.э.) ----
// Решено 2026-07-09 с пользователем. ЧИСЛО ХОДОВ на эпоху задаём вручную — по ПЛОТНОСТИ СОБЫТИЙ,
// а не по длине эпохи в годах: чем ближе к нам, тем гуще события, тем больше ходов эпохе положено.
// Лет за ход считается САМО: (годы эпохи) / (ходы эпохи) — поэтому границы эпох совпадают с
// историческими датами ровно, без накопления округлений.
// Медный век — 40 лет/ход (как было в начале старой шкалы), Современность — ровно 1 год/ход.
// Старая кривая была сломана: после 260-го хода шла по 1 году, и игра НИКОГДА не доходила до
// Средневековья (за 500 ходов дотягивала лишь до 420 г. до н.э.).
const ERAS=[                                          // [название, годС, годПо, ходов]
  ['Медный век',    -5000, -3300, 43],                // 39.5 лет/ход — ход 25 = 4000 до н.э. (прежняя точка старта)
  ['Бронзовый век', -3300, -1200, 60],                // 35.0
  ['Античность',    -1200,   500, 68],                // 25.0
  ['Средневековье',   500,  1500, 67],                // 14.9
  ['Новое время',    1500,  1800, 50],                // 6.0
  ['Индустрия',      1800,  1970, 57],                // 3.0
  ['Современность',  1970,  2040, 70],                // 1.0 — год за ход
  ['Будущее',        2040,  2110, 70],                // 1.0
];
export const TOTAL_TURNS=ERAS.reduce((s,e)=>s+e[3],0);   // 485 ходов партия
export function yearsPerTurn(turn){
  let t=turn;
  for(const [,a,b,n] of ERAS){ if(t<n) return (b-a)/n; t-=n; }
  return 1;                                            // за пределами партии — год за ход
}
export function yearOf(turn){
  let y=-5000; for(let t=0;t<turn;t++) y+=yearsPerTurn(t); return y;
}
export function fmtYear(y){
  y=Math.round(y);
  return y<0 ? `${-y} до н.э.` : `${y} н.э.`;
}
// эпоха по году → {name, idx}. idx 0..6 — строка в таблицах демографии/дорог (см. DEMOGRAPHY.md).
// «Каменный век» и «Неолит» убраны (2026-07-09): игра стартует в 5000 до н.э., это уже медный век.
// Медный и Бронзовый век делят одну строку демографии (idx 0 = древность).
const EPOCHS=[
  {y:-Infinity, name:'Медный век',    idx:0},
  {y:-3300,     name:'Бронзовый век', idx:0},
  {y:-1200,     name:'Античность',    idx:1},
  {y:500,       name:'Средневековье', idx:2},
  {y:1500,      name:'Новое время',   idx:3},
  {y:1800,      name:'Индустрия',     idx:4},
  {y:1970,      name:'Современность', idx:5},
  {y:2040,      name:'Будущее',       idx:6},
];
export function epochOf(y){
  let e=EPOCHS[0]; for(const it of EPOCHS){ if(y>=it.y) e=it; } return e;
}

// ---- монтаж оболочки в DOM ----
export function mountHUD({onEndTurn, onScience}={}){
  const css=`
  .g-top{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:8;text-align:center;
    background:#12233aee;color:#fff;padding:8px 26px;border-radius:14px;box-shadow:0 3px 14px #0006;
    font-family:system-ui,sans-serif;line-height:1.15}
  .g-top .yr{font-size:24px;font-weight:700;letter-spacing:.3px}
  .g-top .sub{font-size:12.5px;opacity:.82;margin-top:2px}
  .g-top .sub b{opacity:1}
  .g-end{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:8;border:0;
    background:none;padding:0;cursor:pointer;filter:drop-shadow(0 7px 16px #0007);
    transition:transform .1s ease, filter .15s}
  .g-end::before{content:'';position:absolute;left:50%;top:50%;width:140px;height:126px;
    transform:translate(-50%,-50%);clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);
    background:#f2c877;z-index:-1;opacity:.28;animation:g-pulse 2.6s ease-in-out infinite}
  @keyframes g-pulse{0%,100%{opacity:.22;transform:translate(-50%,-50%) scale(1)}
    50%{opacity:.5;transform:translate(-50%,-50%) scale(1.07)}}
  .g-end .face{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
    width:124px;height:112px;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);
    background:linear-gradient(158deg,#f4cd7e 0%,#d59a3c 52%,#a96b1f 100%);color:#fff4dc;
    font-family:system-ui,sans-serif;font-weight:700;font-size:13.5px;line-height:1.06;text-align:center;
    box-shadow:inset 0 3px 5px #ffffff77, inset 0 -8px 12px #0000003a, inset 0 0 0 2px #ffffff2a}
  .g-end .arr{font-size:27px;line-height:1;margin-bottom:1px;filter:drop-shadow(0 1px 1px #0005)}
  .g-end:hover{transform:translateX(-50%) scale(1.045);filter:drop-shadow(0 10px 22px #0008) brightness(1.05)}
  .g-end:active{transform:translateX(-50%) scale(.955)}
  .g-end:disabled{cursor:default;filter:grayscale(.55) brightness(.82)}
  .g-end:disabled::before{display:none}
  .g-end:disabled .face{background:linear-gradient(158deg,#c3c3c3,#8f8f8f)}
  /* синяя шестиугольная кнопка-колба «наука» — как «Конец хода», но вдвое меньше и синяя, слева от неё */
  .g-flask{position:fixed;left:calc(50% - 137px);bottom:10px;z-index:8;border:0;background:none;padding:0;
    cursor:pointer;filter:drop-shadow(0 5px 12px #0006);transition:transform .1s ease, filter .15s}
  .g-flask .face{display:flex;align-items:center;justify-content:center;width:62px;height:56px;
    clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);
    background:linear-gradient(158deg,#6db8f0 0%,#2f7fd0 52%,#1b569e 100%);
    box-shadow:inset 0 2px 4px #ffffff66, inset 0 -6px 10px #00000038, inset 0 0 0 2px #ffffff2a}
  .g-flask svg{display:block}
  .g-flask:hover{transform:scale(1.06);filter:drop-shadow(0 8px 16px #0008) brightness(1.06)}
  .g-flask:active{transform:scale(.94)}
  .g-flask .bang{position:absolute;top:-3px;right:0;width:19px;height:19px;border-radius:50%;
    background:#e23b3b;color:#fff;font-size:13px;font-weight:800;line-height:1;
    display:none;align-items:center;justify-content:center;box-shadow:0 1px 4px #0007}
  .g-flask.need .bang{display:flex;animation:g-pulse 1.6s ease-in-out infinite}
  `;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  const top=document.createElement('div'); top.className='g-top';
  top.innerHTML=`<div class="yr" id="g-yr">—</div>
    <div class="sub">Ход <b id="g-turn">0</b> · <span id="g-epoch">—</span><span id="g-state" style="opacity:.7"></span></div>`;
  document.body.appendChild(top);

  const btn=document.createElement('button'); btn.className='g-end'; btn.id='g-end';
  btn.innerHTML=`<span class="face"><span class="arr">▶</span>Конец<br>хода</span>`;
  btn.onclick=()=>onEndTurn&&onEndTurn();
  document.body.appendChild(btn);

  // синяя кнопка-колба «наука» слева от «Конец хода»; белая контурная колба; красный «!» когда нужен выбор
  const flaskSVG=`<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M9.5 3h5M10.5 3v6l-4.4 8a1.9 1.9 0 0 0 1.7 2.9h8.4a1.9 1.9 0 0 0 1.7-2.9L13.5 9V3"/><path d="M7.7 15h8.6"/></svg>`;
  const sci=document.createElement('button'); sci.className='g-flask'; sci.id='g-flask';
  sci.title='Науки'; sci.innerHTML=`<span class="face">${flaskSVG}</span><span class="bang">!</span>`;
  sci.onclick=()=>onScience&&onScience();
  document.body.appendChild(sci);

  const $=id=>document.getElementById(id);
  return {
    setScienceNeed(b){ sci.classList.toggle('need', !!b); },   // показать/скрыть красный «!» на колбе
    update(turn){
      const y=yearOf(turn), e=epochOf(y);
      $('g-yr').textContent=fmtYear(y);
      $('g-turn').textContent=turn;
      $('g-epoch').textContent=e.name;
      return e;   // вернём эпоху — игре нужен idx для перекоса «обхода»
    },
    setState(txt){ $('g-state').textContent = txt?` — ${txt}`:''; },
    setBusy(b){ $('g-end').disabled=b; },
  };
}
