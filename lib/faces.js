// faces.js — ПОРТРЕТЫ ЛИДЕРОВ, нарисованные кодом (SVG), в стиле игры: плоские силуэты,
// тёмно-синий фон, тонкая золотая линия. Никаких внешних картинок — всё векторное и лёгкое.
//
// Портрет живой: фигура дышит, голова чуть покачивается, глаза моргают. Веки и рот вынесены
// в отдельные группы с классами (.lid, .mouth-*), поэтому позже сюда легко добавятся жесты и
// выражения лица для переговоров: setMood(el,'smile'|'stern'|'neutral').
//
// Использование:
//   import { portrait, setMood, LEADER_ART } from './lib/faces.js';
//   box.appendChild(portrait('peter1', 150));

const C = {
  bg1:'#1b2c44', bg2:'#0e1a2b',
  skin:'#e9c6a3', skinSh:'#cf9f77', skinLine:'#8d6446',
  gold:'#d9a832', goldLt:'#f0cf7a',
  white:'#f2f0ea', ivory:'#e2dcd0',
  hairDark:'#2b2119', hairBrown:'#4a3524', wigWhite:'#dedbd4', wigGrey:'#b9b6ae',
  green:'#2e5a3c', greenLt:'#3d7550',
  red:'#a8322a', redLt:'#c34a3c',
  blue:'#24407a', blueLt:'#3a63b0', paleBlue:'#c3d6ee',
  grey:'#5d6673', greyLt:'#7d8794',
  black:'#1a1c22', shadow:'#00000040',
};

// ── мелкие помощники: строим SVG-строку, а не DOM поэлементно (короче и читаемее) ──
const p  = (d, fill, extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const el = (d, stroke, w=2)    => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ci = (x,y,r,fill,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const ell= (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;

// глаз: белок + зрачок + ВЕКО (отдельная группа .lid — её и анимируем морганием)
function eye(x, y, r=4.6){
  return `<g class="eye">
    ${ell(x, y, r, r*0.78, C.white)}
    ${ci(x, y+0.4, r*0.44, C.black)}
    ${ci(x+r*0.18, y-r*0.2, r*0.16, '#ffffffcc')}
    <rect class="lid" x="${x-r-0.6}" y="${y-r*0.9}" width="${r*2+1.2}" height="${r*1.9}" fill="${C.skin}"/>
  </g>`;
}
// рты трёх настроений — переключаются классом на корне (data-mood)
function mouths(x, y, w){
  return `<g class="mouths">
    <g class="m m-neutral">${el(`M${x-w/2} ${y} Q${x} ${y+2.4} ${x+w/2} ${y}`, C.skinLine, 2)}</g>
    <g class="m m-smile">${el(`M${x-w/2} ${y-1} Q${x} ${y+5.4} ${x+w/2} ${y-1}`, C.skinLine, 2)}</g>
    <g class="m m-stern">${el(`M${x-w/2} ${y+1.4} Q${x} ${y-1.6} ${x+w/2} ${y+1.4}`, C.skinLine, 2)}</g>
  </g>`;
}
// орденская лента через грудь
const sash = (col) => p('M80 192 L102 183 L166 280 L138 280 Z', col, 'opacity="0.95"');   // от плеча к бедру, шею не задевает

// ──────────────────────────── ПЁТР I ────────────────────────────
// Приметы: высокий рост (плечи узкие, шея длинная), короткие тёмные кудри, тонкие усы,
// зелёный преображенский мундир с красными обшлагами, голубая андреевская лента.
function peter1(){
  return `
  ${p('M60 280 Q62 196 104 176 L136 176 Q178 196 180 280 Z', C.green)}
  ${p('M104 176 L120 206 L136 176 L128 170 L112 170 Z', C.ivory)}
  ${p('M60 280 Q61 214 84 188 L96 196 Q76 220 74 280 Z', C.greenLt)}
  ${sash(C.blueLt)}
  ${p('M112 150 L128 150 L130 178 L110 178 Z', C.skin)}
  ${p('M112 150 L128 150 L129 162 L111 162 Z', C.skinSh)}
  ${ell(120, 116, 30, 35, C.skin)}
  ${p('M92 106 Q96 74 120 72 Q144 74 148 106 Q142 86 120 84 Q98 86 92 106 Z', C.hairDark)}
  ${p('M90 104 Q84 118 90 130 Q86 112 94 100 Z', C.hairDark)}
  ${p('M150 104 Q156 118 150 130 Q154 112 146 100 Z', C.hairDark)}
  ${ci(96, 100, 8, C.hairDark)} ${ci(110, 90, 9, C.hairDark)} ${ci(128, 89, 9, C.hairDark)} ${ci(143, 100, 8, C.hairDark)}
  ${el('M100 108 Q108 103 116 108', C.hairDark, 2.4)}
  ${el('M124 108 Q132 103 140 108', C.hairDark, 2.4)}
  ${eye(108, 118)} ${eye(132, 118)}
  ${el('M120 118 L118 132 L124 133', C.skinLine, 2)}
  ${p('M104 142 Q120 136 136 142 Q120 146 104 142 Z', C.hairDark)}
  ${mouths(120, 150, 18)}
  ${el('M108 168 Q120 176 132 168', C.ivory, 3)}
  ${ci(150, 214, 7, C.gold)} ${el('M150 200 L150 208', C.goldLt, 2)}
  `;
}

// ──────────────────────── ЕКАТЕРИНА II ──────────────────────────
// Приметы: высокая пудреная причёска с маленькой короной, придворное платье бледно-голубое
// с золотым шитьём, горностай на плечах, лента через грудь.
function catherine2(){
  return `
  ${p('M54 280 Q58 200 100 180 L140 180 Q182 200 186 280 Z', C.paleBlue)}
  ${p('M100 180 Q120 214 140 180 L140 280 L100 280 Z', C.white)}
  ${p('M96 182 Q120 176 144 182 Q142 196 120 200 Q98 196 96 182 Z', C.ivory)}
  ${[[104,192],[118,196],[132,192],[110,206],[126,206]].map(([x,y])=>ci(x,y,1.9,C.black)).join('')}
  ${sash(C.blueLt)}
  ${el('M96 226 Q120 236 144 226', C.gold, 2)}
  ${el('M92 248 Q120 260 148 248', C.gold, 2)}
  ${p('M110 152 L130 152 L132 180 L108 180 Z', C.skin)}
  ${p('M110 152 L130 152 L131 163 L109 163 Z', C.skinSh)}
  ${ci(120, 176, 3, C.gold)} ${ci(120, 176, 6, 'none', `stroke="${C.gold}" stroke-width="1.2"`)}
  ${ell(120, 118, 28, 33, C.skin)}
  ${p('M90 106 Q88 62 120 58 Q152 62 150 106 Q146 76 120 72 Q94 76 90 106 Z', C.wigWhite)}
  ${ci(100, 74, 13, C.wigWhite)} ${ci(120, 64, 15, C.wigWhite)} ${ci(140, 74, 13, C.wigWhite)}
  ${ci(100, 74, 13, 'none', `stroke="${C.wigGrey}" stroke-width="1"`)}
  ${ci(140, 74, 13, 'none', `stroke="${C.wigGrey}" stroke-width="1"`)}
  ${ell(88, 116, 7, 13, C.wigWhite)} ${ell(152, 116, 7, 13, C.wigWhite)}
  ${p('M108 54 L112 44 L116 52 L120 40 L124 52 L128 44 L132 54 Z', C.gold)}
  ${ci(120, 38, 2.6, C.redLt)}
  ${el('M102 108 Q110 103 118 108', C.wigGrey, 2.2)}
  ${el('M122 108 Q130 103 138 108', C.wigGrey, 2.2)}
  ${eye(109, 118)} ${eye(131, 118)}
  ${el('M120 120 L118 132 L124 133', C.skinLine, 2)}
  ${mouths(120, 144, 15)}
  ${ci(104, 128, 4, C.redLt, 'opacity="0.35"')} ${ci(136, 128, 4, C.redLt, 'opacity="0.35"')}
  ${ci(92, 128, 2.4, C.goldLt)} ${ci(148, 128, 2.4, C.goldLt)}
  `;
}

// ────────────────────────── НАПОЛЕОН I ──────────────────────────
// Приметы: чёрная двууголка «поперёк», серый сюртук поверх зелёного мундира,
// рука за бортом, белые лосины, прядь на лбу.
function napoleon(){
  return `
  ${p('M56 280 Q60 198 102 178 L138 178 Q180 198 184 280 Z', C.grey)}
  ${p('M102 178 Q120 210 138 178 L134 280 L106 280 Z', C.white)}
  ${p('M102 178 L120 208 L112 224 L96 196 Z', C.green)}
  ${p('M138 178 L120 208 L128 224 L144 196 Z', C.green)}
  ${p('M96 196 Q84 210 82 234 Q100 232 112 224 Z', C.greyLt)}
  ${p('M112 224 Q126 228 140 220 Q136 236 118 238 Q108 234 112 224 Z', C.skin)}
  ${p('M110 152 L130 152 L132 180 L108 180 Z', C.skin)}
  ${p('M110 152 L130 152 L131 162 L109 162 Z', C.skinSh)}
  ${p('M100 172 Q120 182 140 172 L140 178 Q120 190 100 178 Z', C.white)}
  ${ell(120, 118, 28, 32, C.skin)}
  ${p('M92 100 Q98 76 120 74 Q142 76 148 100 Q140 88 120 86 Q100 88 92 100 Z', C.hairDark)}
  ${p('M100 92 Q114 84 126 92 Q116 88 108 96 Z', C.hairDark)}
  ${p('M58 92 Q120 44 182 92 Q160 100 120 100 Q80 100 58 92 Z', C.black)}
  ${p('M58 92 Q120 62 182 92 Q120 84 58 92 Z', '#2b2f38')}
  ${p('M112 74 L120 60 L128 74 Z', C.gold)}
  ${ci(120, 88, 4, C.redLt)}
  ${el('M102 110 Q110 105 118 110', C.hairDark, 2.4)}
  ${el('M122 110 Q130 105 138 110', C.hairDark, 2.4)}
  ${eye(109, 120)} ${eye(131, 120)}
  ${el('M120 122 L118 134 L124 135', C.skinLine, 2)}
  ${mouths(120, 146, 16)}
  `;
}

// ───────────────────────── ЛЮДОВИК XIV ──────────────────────────
// Приметы: огромный тёмный парик до плеч, синяя мантия с золотыми лилиями и горностаем,
// кружевное жабо. «Король-Солнце» — золотой венец лучей за головой.
function louis14(){
  const fleur = (x,y,s=1) => `<g transform="translate(${x},${y}) scale(${s})">
      ${p('M0 -7 Q3 -2 0 3 Q-3 -2 0 -7 Z', C.gold)}
      ${p('M-6 -1 Q-2 -3 0 1 Q-2 4 -6 -1 Z', C.gold)}
      ${p('M6 -1 Q2 -3 0 1 Q2 4 6 -1 Z', C.gold)}
      ${p('M-5 4 L5 4 L5 6 L-5 6 Z', C.gold)}</g>`;
  const rays = Array.from({length:16},(_,i)=>{
    const a=(i/16)*Math.PI*2, x1=120+Math.cos(a)*44, y1=112+Math.sin(a)*46,
          x2=120+Math.cos(a)*58, y2=112+Math.sin(a)*60;
    return el(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, C.gold, 2);
  }).join('');
  return `
  <g opacity="0.5">${rays}</g>
  ${p('M48 280 Q54 196 100 176 L140 176 Q186 196 192 280 Z', C.blue)}
  ${p('M100 176 Q120 214 140 176 L142 280 L98 280 Z', C.white)}
  ${p('M98 280 L104 190 Q112 214 120 218 Q128 214 136 190 L142 280 Z', C.ivory)}
  ${[[110,238],[130,238],[120,262]].map(([x,y])=>ci(x,y,2.2,C.black)).join('')}
  ${fleur(72, 214, 1.5)} ${fleur(170, 214, 1.5)} ${fleur(66, 254, 1.5)} ${fleur(176, 254, 1.5)}
  ${p('M108 152 L132 152 L134 178 L106 178 Z', C.skin)}
  ${p('M100 168 Q120 158 140 168 Q136 186 120 190 Q104 186 100 168 Z', C.white)}
  ${el('M108 172 Q120 168 132 172', C.ivory, 1.4)}
  ${el('M106 180 Q120 176 134 180', C.ivory, 1.4)}
  ${ell(120, 116, 27, 32, C.skin)}
  ${p('M86 100 Q88 66 120 62 Q152 66 154 100 L156 150 Q150 120 146 106 Q140 84 120 82 Q100 84 94 106 Q90 120 84 150 Z', C.hairBrown)}
  ${[[92,110],[88,128],[92,146],[148,110],[152,128],[148,146]].map(([x,y])=>ci(x,y,11,C.hairBrown)).join('')}
  ${[[100,80],[120,72],[140,80]].map(([x,y])=>ci(x,y,13,C.hairBrown)).join('')}
  ${[[92,110],[88,128],[148,110],[152,128]].map(([x,y])=>ci(x,y,11,'none',`stroke="#5c422c" stroke-width="1"`)).join('')}
  ${el('M102 106 Q110 101 118 106', '#5c422c', 2.2)}
  ${el('M122 106 Q130 101 138 106', '#5c422c', 2.2)}
  ${eye(109, 117)} ${eye(131, 117)}
  ${el('M120 119 L118 131 L124 132', C.skinLine, 2)}
  ${p('M108 140 Q120 136 132 140 Q120 143 108 140 Z', '#5c422c')}
  ${mouths(120, 148, 15)}
  `;
}

export const LEADER_ART = { peter1, catherine2, napoleon, louis14 };

// ── стили и анимация (вставляются один раз) ──
let styled=false;
function injectStyle(){
  if(styled) return; styled=true;
  const st=document.createElement('style');
  st.textContent=`
  .gp-svg{display:block;border-radius:14px;background:radial-gradient(120% 100% at 50% 8%, ${C.bg1} 0%, ${C.bg2} 100%)}
  .gp-fig{transform-origin:120px 280px; animation:gp-brth 4.4s ease-in-out infinite}
  .gp-svg .lid{transform-box:fill-box; transform-origin:center top; transform:scaleY(0); animation:gp-blink 5.6s infinite}
  /* рот: показываем только нужное настроение */
  .gp-svg .m{display:none}
  .gp-svg[data-mood="neutral"] .m-neutral,
  .gp-svg[data-mood="smile"]   .m-smile,
  .gp-svg[data-mood="stern"]   .m-stern{display:block}
  @keyframes gp-brth{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.012) translateY(-1.6px)}}
  @keyframes gp-blink{0%,92%,100%{transform:scaleY(0)}94%,96%{transform:scaleY(1)}}
  @media (prefers-reduced-motion: reduce){ .gp-fig,.gp-svg .lid{animation:none} }
  `;
  document.head.appendChild(st);
}

// portrait(id, size) → <svg> с живым портретом. head/fig — отдельные группы, чтобы анимация
// головы не таскала за собой плечи.
export function portrait(id, size=150){
  injectStyle();
  const art=(LEADER_ART[id]||LEADER_ART.peter1)();
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 240 280');
  svg.setAttribute('width', size); svg.setAttribute('height', Math.round(size*280/240));
  svg.setAttribute('class','gp-svg'); svg.dataset.mood='neutral'; svg.dataset.leader=id;
  svg.innerHTML=`<g class="gp-fig">${art}</g>`;
  return svg;
}
// задел под переговоры: сменить выражение лица одной строкой
export function setMood(svg, mood){ if(svg) svg.dataset.mood = mood||'neutral'; }
