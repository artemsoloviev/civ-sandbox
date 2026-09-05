// faces-engraved.js — ПОРТРЕТЫ ЛИДЕРОВ В СТИЛЕ ГРАВЮРЫ / ЧЕКАНКИ НА МЕДАЛИ.
//
// Замысел: не мультфильм, а оттиск на монете. Тёмно-синее поле, золотая линия по контуру,
// объём даётся ШТРИХОВКОЙ (косые линии в тени), а не плоской заливкой. Пропорции взрослые:
// голова примерно пятая часть бюста, глаза узкие, без белых «блюдец». Ткань не обесцвечена —
// у каждого свой приглушённый цвет мундира, иначе бюсты сливаются в тёмное пятно.
//
// Анимация: фигура дышит, веки моргают (веко — дуга цветом лица, читается как прищур).
// Настроение переключается через data-mood (neutral / smile / stern) — задел под переговоры.
//
//   import { portraitEngraved, setMood } from './lib/faces-engraved.js';
//   box.appendChild(portraitEngraved('peter1', 190));

const C = {
  bg0:'#16233a', bg1:'#0a1220',
  ink:'#0d1626',
  face:'#c9a882', faceSh:'#a8825e',
  gold:'#c9a24d', goldLt:'#efd699', goldDim:'#8a6f34',
  eye:'#e7dcc4', lace:'#ded7c6',
};

let uid = 0;                              // у каждого портрета свои id узоров — иначе склеятся

const P = (d, fill, extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const L = (d, w=1.2, col=C.gold, extra='') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const E = (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const dot=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
const ring=(x,y,r,c,w=0.8)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`;

const HATCH = (id, dens) => `
  <pattern id="${id}" width="${dens}" height="${dens}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <line x1="0" y1="0" x2="0" y2="${dens}" stroke="${C.gold}" stroke-width="0.55" opacity="0.42"/>
  </pattern>`;
const XHATCH = (id, dens) => `
  <pattern id="${id}" width="${dens}" height="${dens}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <line x1="0" y1="0" x2="0" y2="${dens}" stroke="${C.gold}" stroke-width="0.5" opacity="0.4"/>
    <line x1="0" y1="0" x2="${dens}" y2="0" stroke="${C.gold}" stroke-width="0.5" opacity="0.26"/>
  </pattern>`;

// ГЛАЗ гравюрой: узкий миндаль, линия века, зрачок точкой. Белка почти не видно.
function eye(x, y, w=7.2, flip=false){
  const s = flip ? -1 : 1;
  return `<g class="eye">
    ${P(`M${x-w} ${y} q${w*0.55} ${-w*0.6} ${w*2} 0 q${-w*0.72} ${w*0.48} ${-w*2} 0 Z`, C.eye)}
    ${dot(x+s*0.8, y-0.6, 2.4, C.ink)}
    ${dot(x+s*0.8+0.7, y-1.4, 0.8, '#ffffff')}
    ${L(`M${x-w-1} ${y-1.4} q${w*0.6} ${-w*0.76} ${w*2+2} -0.4`, 1.3, C.goldDim)}
    ${L(`M${x-w*0.7} ${y+2.2} q${w*0.7} ${w*0.26} ${w*1.4} -0.4`, 0.75, C.goldDim)}
    <path class="lid" d="M${x-w-1} ${y-1} q${w} ${w*1.5} ${w*2+2} 0 L${x+w+1} ${y-3} L${x-w-1} ${y-3} Z" fill="${C.face}"/>
  </g>`;
}

function mouths(x, y, w){
  const line=(d)=>L(d, 1.5, '#6b4a2c');
  return `<g class="mouths">
    <g class="m m-neutral">${line(`M${x-w/2} ${y} q${w/2} 1.8 ${w} 0`)}${L(`M${x-w/2+1} ${y+2.6} q${w/2-1} 1.2 ${w-2} 0`,0.7,C.goldDim)}</g>
    <g class="m m-smile">${line(`M${x-w/2} ${y-1} q${w/2} 5.6 ${w} -1`)}${L(`M${x-w/2+2} ${y+3.6} q${w/2-2} 1.6 ${w-4} 0`,0.7,C.goldDim)}</g>
    <g class="m m-stern">${line(`M${x-w/2} ${y+1.6} q${w/2} -2.6 ${w} 0`)}</g>
  </g>`;
}

// череп, скула, нос профилем, тень справа штриховкой
function faceBase(hx, hy, rx, ry, hatchId){
  return `
    ${E(hx, hy, rx, ry, C.face)}
    ${P(`M${hx+rx*0.16} ${hy-ry} a${rx} ${ry} 0 0 1 0 ${ry*2} q${rx*0.55} ${-ry} 0 ${-ry*2} Z`, C.faceSh, 'opacity="0.5"')}
    ${P(`M${hx+rx*0.2} ${hy-ry*0.95} a${rx*0.95} ${ry*0.98} 0 0 1 0 ${ry*1.92} q${rx*0.5} ${-ry*0.96} 0 ${-ry*1.92} Z`, `url(#${hatchId})`, 'opacity="0.45"')}
    ${E(hx, hy, rx, ry, 'none', `stroke="${C.gold}" stroke-width="1.1" opacity="0.7"`)}
    ${L(`M${hx} ${hy-ry*0.16} l-2.2 ${ry*0.42} l5.4 1.2`, 1.3, '#8a6640')}
    ${L(`M${hx-rx*0.56} ${hy+ry*0.34} q${rx*0.2} ${ry*0.12} ${rx*0.34} 0`, 0.7, C.goldDim)}
    ${L(`M${hx+rx*0.22} ${hy+ry*0.36} q${rx*0.2} ${ry*0.1} ${rx*0.34} -0.4`, 0.7, C.goldDim)}`;
}

// плечи + грудь: общая болванка бюста, цвет ткани у каждого свой
function bust(coat, shade, h, x, cutL, cutR){
  return `
  ${P(`M${cutL} 300 Q${cutL+8} 192 88 158 L152 158 Q${cutR-8} 192 ${cutR} 300 Z`, coat)}
  ${P(`M120 158 Q160 176 ${cutR} 300 L120 300 Z`, shade)}
  ${P(`M120 158 Q160 176 ${cutR} 300 L120 300 Z`, `url(#${h})`, 'opacity="0.5"')}
  ${L(`M${cutL} 300 Q${cutL+8} 192 88 158`, 1.2)} ${L(`M${cutR} 300 Q${cutR-8} 192 152 158`, 1.2)}`;
}
// орденская лента через плечо
function sash(col, h){
  return `
  ${P('M70 176 L96 164 L170 300 L138 300 Z', col)}
  ${P('M70 176 L96 164 L170 300 L138 300 Z', `url(#${h})`, 'opacity="0.45"')}
  ${L('M70 176 L96 164 L170 300', 1.1)} ${L('M70 176 L138 300', 1.1)}`;
}

// ─────────────────────────── ПЁТР I ───────────────────────────
function peter1(h, x){
  return `
  ${bust('#25412f', '#182d21', h, x, 28, 212)}
  ${P('M88 158 L120 206 L152 158 L142 150 L98 150 Z', C.ink)}
  ${L('M88 158 L120 206 L152 158', 1.2)}
  ${L('M104 184 L112 300 M136 184 L128 300', 0.8, C.goldDim)}
  ${sash('#2c4a6e', x)}
  ${P('M107 124 L133 124 L135 162 L105 162 Z', C.face)}
  ${P('M123 124 L133 124 L135 162 L125 162 Z', C.faceSh, 'opacity="0.5"')}
  ${faceBase(120, 104, 25, 31, h)}
  ${P('M95 90 Q97 64 120 60 Q145 64 147 92 Q140 74 120 72 Q100 74 95 90 Z', C.ink)}
  ${[[99,82,9],[112,70,10],[130,69,10],[143,82,9],[93,96,7],[148,96,7]].map(([cx,cy,r])=>dot(cx,cy,r,C.ink)).join('')}
  ${L('M100 78 q10 -9 22 -8', 1, C.goldDim)} ${L('M126 70 q12 2 18 12', 1, C.goldDim)}
  ${L('M102 90 q9 -5 17 -1', 1.4, '#3a2c20')} ${L('M124 89 q9 -5 17 1', 1.4, '#3a2c20')}
  ${eye(107, 102)} ${eye(133, 102, 7.2, true)}
  ${P('M104 126 q16 -6 32 0 q-16 5 -32 0 Z', C.ink)}
  ${L('M104 126 q16 -6 32 0', 0.8, C.goldDim)}
  ${mouths(120, 134, 17)}
  ${L('M104 154 q16 11 32 0', 2.2, C.lace)}
  ${dot(156, 234, 8.5, C.gold)}
  ${L('M156 216 l0 9', 1.4, C.goldLt)}
  ${L('M151 234 l10 0 M156 229 l0 10', 1.2, C.ink)}
  `;
}

// ──────────────────────── ЕКАТЕРИНА II ────────────────────────
function catherine2(h, x){
  return `
  ${bust('#93a1b8', '#5f6d86', h, x, 22, 218)}
  ${P('M84 160 Q120 150 156 160 Q150 184 120 192 Q90 184 84 160 Z', C.lace)}
  ${[[98,172],[116,180],[136,172],[106,186],[128,186]].map(([cx,cy])=>dot(cx,cy,1.8,C.ink)).join('')}
  ${L('M84 160 Q120 150 156 160', 1)}
  ${sash('#2c4a6e', x)}
  ${L('M84 236 q34 14 68 -2', 1.1, C.goldLt)} ${L('M78 264 q40 16 80 -2', 1.1, C.goldLt)}
  ${P('M108 126 L132 126 L134 162 L106 162 Z', C.face)}
  ${P('M122 126 L132 126 L134 162 L124 162 Z', C.faceSh, 'opacity="0.45"')}
  ${dot(120, 158, 3, C.gold)}
  ${faceBase(120, 106, 24, 30, h)}
  ${P('M94 94 Q92 58 120 52 Q148 58 146 94 Q142 70 120 66 Q98 70 94 94 Z', '#cfc9bd')}
  ${[[103,70,12],[120,60,13],[137,70,12]].map(([cx,cy,r])=>dot(cx,cy,r,'#cfc9bd')).join('')}
  ${ring(103,70,12,C.goldDim)} ${ring(137,70,12,C.goldDim)}
  ${E(94, 106, 7, 12, '#cfc9bd')} ${E(146, 106, 7, 12, '#bcb6a8')}
  ${E(94, 106, 7, 12, 'none', `stroke="${C.goldDim}" stroke-width="0.7"`)}
  ${E(146, 106, 7, 12, 'none', `stroke="${C.goldDim}" stroke-width="0.7"`)}
  ${P('M110 48 L113 39 L117 46 L120 36 L123 46 L127 39 L130 48 Z', C.gold)}
  ${L('M110 48 L130 48', 1, C.goldLt)}
  ${L('M104 92 q9 -5 16 -1', 1.2, '#7a6b52')} ${L('M124 91 q9 -5 16 1', 1.2, '#7a6b52')}
  ${eye(108, 104, 7, false)} ${eye(132, 104, 7, true)}
  ${mouths(120, 130, 14)}
  ${E(102, 116, 5, 3.4, '#b8724f', 'opacity="0.2"')} ${E(138, 116, 5, 3.4, '#b8724f', 'opacity="0.2"')}
  ${dot(97,120,2.2,C.goldLt)} ${dot(143,120,2.2,C.goldLt)}
  `;
}

// ───────────────────────── НАПОЛЕОН I ─────────────────────────
function napoleon(h, x){
  return `
  ${bust('#3c4657', '#252d3c', h, x, 30, 210)}
  ${P('M88 158 L120 206 L108 236 L80 182 Z', '#1d3a2b')}
  ${P('M152 158 L120 206 L132 236 L160 182 Z', '#1d3a2b')}
  ${L('M88 158 L120 206 L152 158', 1.2)}
  ${P('M80 182 Q60 204 58 246 Q88 240 108 236 Z', '#4a5568')}
  ${P('M80 182 Q60 204 58 246 Q88 240 108 236 Z', `url(#${x})`, 'opacity="0.5"')}
  ${L('M80 182 Q60 204 58 246', 1.1)}
  ${P('M108 236 q22 7 36 -12 q-4 27 -28 29 q-15 -4 -8 -17 Z', C.face)}
  ${L('M108 236 q22 7 36 -12', 1, C.goldDim)}
  ${P('M108 126 L132 126 L134 162 L106 162 Z', C.face)}
  ${P('M122 126 L132 126 L134 162 L124 162 Z', C.faceSh, 'opacity="0.5"')}
  ${P('M98 152 q22 12 44 0 l0 8 q-22 14 -44 0 Z', C.lace)}
  ${faceBase(120, 106, 24, 29, h)}
  ${P('M96 90 Q102 68 120 66 Q138 68 144 90 Q136 78 120 76 Q104 78 96 90 Z', C.ink)}
  ${P('M104 82 q13 -8 24 0 q-11 -4 -19 5 Z', C.ink)}
  ${P('M50 80 Q120 28 190 80 Q166 94 120 94 Q74 94 50 80 Z', C.ink)}
  ${P('M50 80 Q120 48 190 80 Q120 74 50 80 Z', '#1c2740')}
  ${L('M50 80 Q120 28 190 80 Q120 96 50 80 Z', 1.2)}
  ${P('M113 62 L120 46 L127 62 Z', C.gold)}
  ${dot(120, 76, 3.6, C.gold)}
  ${L('M104 94 q9 -5 16 -1', 1.3, '#2f2620')} ${L('M124 93 q9 -5 16 1', 1.3, '#2f2620')}
  ${eye(108, 105, 7, false)} ${eye(132, 105, 7, true)}
  ${mouths(120, 132, 15)}
  `;
}

// ──────────────────────── ЛЮДОВИК XIV ─────────────────────────
function louis14(h, x){
  const fleur=(fx,fy,s)=>`<g transform="translate(${fx},${fy}) scale(${s})">
    ${P('M0 -7 Q3 -2 0 3 Q-3 -2 0 -7 Z', C.gold)}${P('M-6 -1 Q-2 -3 0 1 Q-2 4 -6 -1 Z', C.gold)}
    ${P('M6 -1 Q2 -3 0 1 Q2 4 6 -1 Z', C.gold)}${P('M-5 4 L5 4 L5 6 L-5 6 Z', C.gold)}</g>`;
  const rays=Array.from({length:18},(_,i)=>{ const a=(i/18)*Math.PI*2;
    const x1=(120+Math.cos(a)*46).toFixed(1), y1=(100+Math.sin(a)*50).toFixed(1);
    const x2=(120+Math.cos(a)*62).toFixed(1), y2=(100+Math.sin(a)*68).toFixed(1);
    return L(`M${x1} ${y1} L${x2} ${y2}`, 1.4, C.gold); }).join('');
  return `
  <g opacity="0.4">${rays}</g>
  ${bust('#2a4577', '#1a2c4d', h, x, 20, 220)}
  ${P('M96 170 L104 300 L136 300 L144 170 Q120 188 96 170 Z', C.lace)}
  ${P('M96 170 L104 300 L136 300 L144 170 Q120 188 96 170 Z', `url(#${x})`, 'opacity="0.3"')}
  ${[[112,240],[130,240],[121,268]].map(([cx,cy])=>dot(cx,cy,2,C.ink)).join('')}
  ${fleur(60,224,1.6)} ${fleur(180,224,1.6)} ${fleur(50,266,1.6)} ${fleur(190,266,1.6)}
  ${P('M106 126 L134 126 L136 160 L104 160 Z', C.face)}
  ${P('M98 150 q22 -12 44 0 q-6 20 -22 24 q-16 -4 -22 -24 Z', C.lace)}
  ${L('M106 154 q14 -5 28 0', 0.8, C.goldDim)} ${L('M104 162 q16 -5 32 0', 0.8, C.goldDim)}
  ${faceBase(120, 104, 23, 29, h)}
  ${P('M92 90 Q94 56 120 52 Q146 56 148 90 L154 158 Q142 116 138 96 Q132 74 120 72 Q108 74 102 96 Q98 116 86 158 Z', '#3a2b1f')}
  ${[[94,108,15],[90,132,15],[96,152,13],[146,108,15],[150,132,15],[144,152,13],[104,66,14],[120,58,14],[136,66,14]]
      .map(([cx,cy,r])=>dot(cx,cy,r,'#3a2b1f')).join('')}
  ${[[94,108,15],[90,132,15],[96,152,13],[146,108,15],[150,132,15],[144,152,13]].map(([cx,cy,r])=>ring(cx,cy,r,C.goldDim,0.7)).join('')}
  ${L('M104 90 q9 -5 16 -1', 1.2, '#4a3728')} ${L('M124 89 q9 -5 16 1', 1.2, '#4a3728')}
  ${eye(108, 102, 7, false)} ${eye(132, 102, 7, true)}
  ${P('M108 122 q12 -5 24 0 q-12 4 -24 0 Z', '#4a3728')}
  ${mouths(120, 132, 14)}
  `;
}

export const ART = { peter1, catherine2, napoleon, louis14 };

let styled=false;
function injectStyle(){
  if(styled) return; styled=true;
  const st=document.createElement('style');
  st.textContent=`
  .ge-svg{display:block;border-radius:14px}
  .ge-fig{transform-origin:120px 300px; animation:ge-brth 4.8s ease-in-out infinite}
  .ge-svg .lid{transform-box:fill-box; transform-origin:center top; transform:scaleY(0); animation:ge-blink 6.2s infinite}
  .ge-svg .m{display:none}
  .ge-svg[data-mood="neutral"] .m-neutral,
  .ge-svg[data-mood="smile"]   .m-smile,
  .ge-svg[data-mood="stern"]   .m-stern{display:block}
  @keyframes ge-brth{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.008) translateY(-1.2px)}}
  @keyframes ge-blink{0%,93%,100%{transform:scaleY(0)}95%,97%{transform:scaleY(1)}}
  @media (prefers-reduced-motion: reduce){ .ge-fig,.ge-svg .lid{animation:none} }
  `;
  document.head.appendChild(st);
}

export function portraitEngraved(id, size=190){
  injectStyle();
  const n = ++uid;
  const hatchId=`ge-h${n}`, xhatchId=`ge-x${n}`, vigId=`ge-v${n}`, clipId=`ge-c${n}`;
  const art=(ART[id]||ART.peter1)(hatchId, xhatchId);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 240 300');
  svg.setAttribute('width', size); svg.setAttribute('height', Math.round(size*300/240));
  svg.setAttribute('class','ge-svg'); svg.dataset.mood='neutral'; svg.dataset.leader=id;
  svg.innerHTML=`
    <defs>
      ${HATCH(hatchId, 3.4)}
      ${XHATCH(xhatchId, 4.2)}
      <radialGradient id="${vigId}" cx="50%" cy="32%" r="80%">
        <stop offset="0%" stop-color="${C.bg0}"/><stop offset="100%" stop-color="${C.bg1}"/>
      </radialGradient>
      <clipPath id="${clipId}"><rect x="0" y="0" width="240" height="300" rx="14"/></clipPath>
    </defs>
    <g clip-path="url(#${clipId})">
      <rect x="0" y="0" width="240" height="300" fill="url(#${vigId})"/>
      <g class="ge-fig">${art}</g>
    </g>
    <rect x="2" y="2" width="236" height="296" rx="13" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity="0.8"/>
    <rect x="7" y="7" width="226" height="286" rx="9"  fill="none" stroke="${C.gold}" stroke-width="0.7" opacity="0.45"/>`;
  return svg;
}
export function setMood(svg, mood){ if(svg) svg.dataset.mood = mood||'neutral'; }
