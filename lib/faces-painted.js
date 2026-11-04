// faces-painted.js — ЖИВОПИСНЫЕ ПОРТРЕТЫ ЛИДЕРОВ.
//
// Замысел: парадный масляный портрет в тёмной галерее, а не иконка и не мультфильм.
// Отличия от плоского стиля, из-за которых тот читался как карикатура:
//   1) объём даётся ГРАДИЕНТАМИ и РАЗМЫТЫМИ тенями (SVG-фильтр feGaussianBlur), а не заливкой;
//   2) свет один, сбоку слева — как лампа в мастерской; правая половина лица уходит в полутень;
//   3) взрослые пропорции: голова ≈ 1/5 бюста, глаза узкие и глубоко посажены, без белых блюдец;
//   4) палитра приглушённая, ни одного чистого цвета; фон — тёмная стена со световым пятном.
//
// Анимация как и раньше: фигура дышит, веки моргают. Настроение через data-mood — задел
// под переговоры: setMood(svg,'smile'|'stern'|'neutral').
//
//   import { portraitPainted, setMood } from './lib/faces-painted.js';
//   box.appendChild(portraitPainted('peter1', 190));

let uid = 0;

const P  = (d, fill, extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const L  = (d, col, w=1.4, extra='') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const E  = (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const dot= (x,y,r,f,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${extra}/>`;

// размытая тень / блик — то, чего не было в плоском стиле
const soft = (body, blurId, opacity=1) => `<g filter="url(#${blurId})" opacity="${opacity}">${body}</g>`;

// ГЛАЗ: узкий, глубоко посаженный. Верхнее веко отбрасывает тень на белок,
// поэтому глаз не «пялится». Веко (.lid) — для моргания.
function eye(x, y, w, skin, shade, ink){
  return `<g class="eye">
    ${P(`M${x-w} ${y} q${w*0.5} ${-w*0.55} ${w*2} 0 q${-w*0.62} ${w*0.46} ${-w*2} 0 Z`, '#d9cdb8')}
    ${P(`M${x-w} ${y} q${w*0.5} ${-w*0.55} ${w*2} 0 q${-w*0.5} ${-w*0.05} ${-w*2} 0 Z`, '#7d6a52', 'opacity="0.55"')}
    ${dot(x+0.4, y-0.2, w*0.36, '#3b2f24')}
    ${dot(x+0.4, y-0.2, w*0.17, '#14100c')}
    ${dot(x-w*0.16, y-w*0.3, w*0.1, '#ffffff', 'opacity="0.85"')}
    ${L(`M${x-w-1.4} ${y-1} q${w*0.55} ${-w*0.72} ${w*2+2.4} -0.6`, ink, 1.5)}
    ${L(`M${x-w*0.8} ${y+2.4} q${w*0.7} ${w*0.24} ${w*1.5} -0.5`, shade, 0.8)}
    <path class="lid" d="M${x-w-1.4} ${y-0.6} q${w} ${w*1.5} ${w*2+2.8} 0 L${x+w+1.4} ${y-4} L${x-w-1.4} ${y-4} Z" fill="${skin}"/>
  </g>`;
}

// Рот — не чёрная дыра, а линия смыкания губ: тонкая тёмная дуга плюс светлая нижняя губа.
// В первом заходе рот был залит тёмным пятном и читался как открытый провал.
function mouths(x, y, w, lip, dark){
  const seam=(d)=>L(d, dark, 1.7, 'opacity="0.85"');
  const lower=(d)=>L(d, lip, 2.6, 'opacity="0.5"');
  return `<g class="mouths">
    <g class="m m-neutral">${seam(`M${x-w/2} ${y} q${w/2} 2.2 ${w} 0`)}${lower(`M${x-w/2+2} ${y+3} q${w/2-2} 1.4 ${w-4} 0`)}</g>
    <g class="m m-smile">${seam(`M${x-w/2} ${y-1} q${w/2} 5.4 ${w} -1`)}${lower(`M${x-w/2+3} ${y+4.2} q${w/2-3} 1.8 ${w-6} 0`)}</g>
    <g class="m m-stern">${seam(`M${x-w/2} ${y+1.4} q${w/2} -2.6 ${w} 0`)}</g>
  </g>`;
}

// ЛИЦО: череп градиентом (свет слева), размытые тени под скулой, у крыла носа и под губой.
function face(hx, hy, rx, ry, ids){
  const {skinG, blur, ink, shade} = ids;
  return `
    ${E(hx, hy, rx, ry, `url(#${skinG})`)}
    ${soft(`${E(hx+rx*0.55, hy+ry*0.06, rx*0.5, ry*0.72, shade)}`, blur, 0.5)}
    ${soft(`${E(hx-rx*0.42, hy+ry*0.34, rx*0.3, ry*0.2, shade)}`, blur, 0.32)}
    ${soft(`${E(hx+rx*0.34, hy+ry*0.36, rx*0.3, ry*0.2, shade)}`, blur, 0.32)}
    ${soft(`${E(hx-rx*0.4, hy-ry*0.3, rx*0.36, ry*0.3, '#ffffff')}`, blur, 0.16)}
    ${soft(`${P(`M${hx-3} ${hy-ry*0.2} q6 ${ry*0.4} 1 ${ry*0.48} q-6 2 -9 -1 Z`, shade)}`, blur, 0.55)}
    ${L(`M${hx+0.5} ${hy-ry*0.2} q-2.6 ${ry*0.3} -2.4 ${ry*0.42} q2 1.6 5.6 0.9`, ink, 1.3, 'opacity="0.55"')}
    ${soft(`${E(hx, hy+ry*0.6, rx*0.22, ry*0.07, shade)}`, blur, 0.22)}`;
}

// БЮСТ: плечи с градиентом ткани и размытой тенью справа
function bust(ids, coatG, cutL, cutR){
  const {blur} = ids;
  return `
    ${P(`M${cutL} 300 Q${cutL+10} 196 88 162 L152 162 Q${cutR-10} 196 ${cutR} 300 Z`, `url(#${coatG})`)}
    ${soft(`${P(`M120 162 Q162 182 ${cutR} 300 L120 300 Z`, '#000000')}`, blur, 0.3)}
    ${soft(`${P(`M${cutL} 300 Q${cutL+12} 200 92 168 L104 178 Q${cutL+26} 214 ${cutL+16} 300 Z`, '#ffffff')}`, blur, 0.09)}`;
}

// ─────────────────────────── ПЁТР I ───────────────────────────
function peter1(ids){
  const {blur, skinG, ink, shade} = ids;
  return `
  ${bust(ids, ids.g_peterCoat, 26, 214)}
  ${P('M88 162 L120 214 L152 162 L142 154 L98 154 Z', '#1d2b22')}
  ${soft(`${L('M88 162 L120 214 L152 162', '#000', 6)}`, blur, 0.35)}
  ${P('M70 178 L96 166 L172 300 L140 300 Z', 'url(#'+ids.g_sash+')')}
  ${soft(`${P('M70 178 L96 166 L100 174 L74 186 Z', '#ffffff')}`, blur, 0.14)}
  ${P('M106 122 L134 122 L136 166 L104 166 Z', `url(#${skinG})`)}
  ${soft(`${P('M120 122 L136 122 L136 166 L120 166 Z', shade)}`, blur, 0.5)}
  ${soft(`${E(120, 132, 20, 9, '#000')}`, blur, 0.45)}
  ${face(120, 102, 26, 32, ids)}
  ${P('M94 88 Q96 60 120 56 Q144 60 146 90 Q138 70 120 68 Q100 70 94 88 Z', 'url(#'+ids.g_hair+')')}
  ${[[98,80,10],[111,67,11],[130,66,11],[143,80,10],[92,95,8],[149,95,8]].map(([cx,cy,r])=>dot(cx,cy,r,'url(#'+ids.g_hair+')')).join('')}
  ${soft(`${E(120, 70, 30, 14, '#ffffff')}`, blur, 0.1)}
  ${L('M101 88 q9 -6 18 -1.5', '#2a2018', 2.2, 'opacity="0.8"')}
  ${L('M123 86 q9 -6 18 1.5', '#2a2018', 2.2, 'opacity="0.8"')}
  ${eye(107, 100, 6.6, '#dcbb95', shade, ink)} ${eye(133, 100, 6.6, '#c9a377', shade, ink)}
  ${P('M105 123 q15 -5.5 30 0 q-15 3.6 -30 0 Z', '#2c2118')}
  ${mouths(120, 133, 16, '#c08a6d', '#5c3427')}
  ${P('M104 158 q16 12 32 0 l0 8 q-16 12 -32 0 Z', '#e8e2d2')}
  ${dot(158, 232, 9, 'url(#'+ids.g_gold+')')}
  ${L('M158 214 l0 9', '#e5c273', 1.6)}
  ${L('M153 232 l10 0 M158 227 l0 10', '#3a2c16', 1.3)}
  `;
}

// ──────────────────────── ЕКАТЕРИНА II ────────────────────────
function catherine2(ids){
  const {blur, skinG, ink, shade} = ids;
  return `
  ${bust(ids, ids.g_cathGown, 20, 220)}
  ${P('M84 164 Q120 154 156 164 Q150 188 120 196 Q90 188 84 164 Z', '#ded7c4')}
  ${soft(`${E(120, 190, 34, 8, '#000')}`, blur, 0.3)}
  ${[[100,176],[118,183],[136,176],[108,190],[128,190]].map(([cx,cy])=>dot(cx,cy,1.8,'#2a2620')).join('')}
  ${P('M70 178 L96 166 L172 300 L140 300 Z', 'url(#'+ids.g_sash+')')}
  ${L('M84 238 q34 14 68 -2', '#c9a24d', 1.4, 'opacity="0.7"')}
  ${L('M78 266 q40 16 80 -2', '#c9a24d', 1.4, 'opacity="0.7"')}
  ${P('M107 124 L133 124 L135 166 L105 166 Z', `url(#${skinG})`)}
  ${soft(`${P('M120 124 L135 124 L135 166 L120 166 Z', shade)}`, blur, 0.45)}
  ${dot(120, 160, 3.2, 'url(#'+ids.g_gold+')')}
  ${face(120, 104, 25, 31, ids)}
  ${P('M93 92 Q91 56 120 50 Q149 56 147 92 Q142 68 120 64 Q98 68 93 92 Z', 'url(#'+ids.g_wig+')')}
  ${[[102,68,13],[120,58,14],[138,68,13]].map(([cx,cy,r])=>dot(cx,cy,r,'url(#'+ids.g_wig+')')).join('')}
  ${E(93, 104, 7.5, 13, 'url(#'+ids.g_wig+')')} ${E(147, 104, 7.5, 13, 'url(#'+ids.g_wig+')')}
  ${soft(`${E(108, 60, 26, 12, '#ffffff')}`, blur, 0.16)}
  ${soft(`${E(146, 96, 12, 22, '#000')}`, blur, 0.22)}
  ${P('M110 46 L113 37 L117 44 L120 34 L123 44 L127 37 L130 46 Z', 'url(#'+ids.g_gold+')')}
  ${L('M104 90 q9 -5 16 -1', '#6d5c44', 1.5, 'opacity="0.75"')}
  ${L('M124 89 q9 -5 16 1', '#6d5c44', 1.5, 'opacity="0.75"')}
  ${eye(108, 102, 6.4, '#dcbb95', shade, ink)} ${eye(132, 102, 6.4, '#c9a377', shade, ink)}
  ${mouths(120, 128, 14, '#a06a55', '#6d3d31')}
  ${soft(`${E(102, 114, 6, 4, '#b8724f')}`, blur, 0.3)}
  ${soft(`${E(138, 114, 6, 4, '#b8724f')}`, blur, 0.3)}
  ${dot(96, 118, 2.4, '#e5c273')} ${dot(144, 118, 2.4, '#e5c273')}
  `;
}

// ───────────────────────── НАПОЛЕОН I ─────────────────────────
function napoleon(ids){
  const {blur, skinG, ink, shade} = ids;
  return `
  ${bust(ids, ids.g_napCoat, 28, 212)}
  ${P('M88 162 L120 210 L108 240 L80 186 Z', '#1e3627')}
  ${P('M152 162 L120 210 L132 240 L160 186 Z', '#16281d')}
  ${soft(`${L('M88 162 L120 210 L152 162', '#000', 6)}`, blur, 0.35)}
  ${P('M80 186 Q60 208 58 250 Q88 244 108 240 Z', 'url(#'+ids.g_napCoat+')')}
  ${soft(`${P('M80 186 Q60 208 58 250 Q88 244 108 240 Z', '#000')}`, blur, 0.18)}
  ${P('M108 240 q22 7 36 -12 q-4 27 -28 30 q-15 -4 -8 -18 Z', `url(#${skinG})`)}
  ${soft(`${E(126, 250, 16, 10, '#000')}`, blur, 0.3)}
  ${P('M107 122 L133 122 L135 166 L105 166 Z', `url(#${skinG})`)}
  ${soft(`${P('M120 122 L135 122 L135 166 L120 166 Z', shade)}`, blur, 0.5)}
  ${P('M98 154 q22 12 44 0 l0 9 q-22 14 -44 0 Z', '#e8e2d2')}
  ${face(120, 104, 25, 30, ids)}
  ${P('M96 88 Q102 66 120 64 Q138 66 144 88 Q136 76 120 74 Q104 76 96 88 Z', 'url(#'+ids.g_hair+')')}
  ${P('M104 80 q13 -8 24 0 q-11 -4 -19 5 Z', 'url(#'+ids.g_hair+')')}
  ${P('M50 78 Q120 26 190 78 Q166 92 120 92 Q74 92 50 78 Z', 'url(#'+ids.g_hat+')')}
  ${soft(`${P('M50 78 Q120 42 190 78 Q120 70 50 78 Z', '#ffffff')}`, blur, 0.12)}
  ${soft(`${E(120, 94, 44, 8, '#000')}`, blur, 0.5)}
  ${P('M113 60 L120 44 L127 60 Z', 'url(#'+ids.g_gold+')')}
  ${dot(120, 74, 3.8, '#8f3a30')}
  ${L('M104 92 q9 -5 16 -1', '#241c16', 1.6, 'opacity="0.8"')}
  ${L('M124 91 q9 -5 16 1', '#241c16', 1.6, 'opacity="0.8"')}
  ${eye(108, 102, 6.4, '#dcbb95', shade, ink)} ${eye(132, 102, 6.4, '#c9a377', shade, ink)}
  ${mouths(120, 130, 15, '#8f5f4a', '#5c3427')}
  `;
}

// ──────────────────────── ЛЮДОВИК XIV ─────────────────────────
function louis14(ids){
  const {blur, skinG, ink, shade} = ids;
  const fleur=(fx,fy,s)=>`<g transform="translate(${fx},${fy}) scale(${s})" opacity="0.85">
    ${P('M0 -7 Q3 -2 0 3 Q-3 -2 0 -7 Z', 'url(#'+ids.g_gold+')')}${P('M-6 -1 Q-2 -3 0 1 Q-2 4 -6 -1 Z', 'url(#'+ids.g_gold+')')}
    ${P('M6 -1 Q2 -3 0 1 Q2 4 6 -1 Z', 'url(#'+ids.g_gold+')')}${P('M-5 4 L5 4 L5 6 L-5 6 Z', 'url(#'+ids.g_gold+')')}</g>`;
  return `
  ${soft(`${E(120, 96, 52, 56, '#f0d79a')}`, blur, 0.13)}
  ${bust(ids, ids.g_louisCoat, 18, 222)}
  ${P('M96 172 L104 300 L136 300 L144 172 Q120 190 96 172 Z', '#e5decc')}
  ${soft(`${P('M120 172 L136 300 L144 172 Z', '#000')}`, blur, 0.22)}
  ${[[112,238],[130,238],[121,266]].map(([cx,cy])=>dot(cx,cy,2.1,'#2a2620')).join('')}
  ${fleur(60,224,1.7)} ${fleur(180,224,1.7)} ${fleur(50,266,1.7)} ${fleur(190,266,1.7)}
  ${P('M105 122 L135 122 L137 162 L103 162 Z', `url(#${skinG})`)}
  ${P('M98 150 q22 -12 44 0 q-6 22 -22 26 q-16 -4 -22 -26 Z', '#e8e2d2')}
  ${soft(`${E(120, 172, 20, 8, '#000')}`, blur, 0.25)}
  ${face(120, 102, 24, 30, ids)}
  ${P('M91 88 Q93 52 120 48 Q147 52 149 88 L155 158 Q142 114 138 94 Q132 72 120 70 Q108 72 102 94 Q98 114 85 158 Z', 'url(#'+ids.g_wig2+')')}
  ${[[93,106,15],[89,132,15],[95,152,13],[147,106,15],[151,132,15],[145,152,13],[103,62,14],[120,54,14],[137,62,14]]
      .map(([cx,cy,r])=>dot(cx,cy,r,'url(#'+ids.g_wig2+')')).join('')}
  ${soft(`${E(100, 58, 26, 12, '#ffffff')}`, blur, 0.14)}
  ${soft(`${E(148, 130, 14, 30, '#000')}`, blur, 0.2)}
  ${L('M104 88 q9 -5 16 -1', '#3b2c1e', 1.5, 'opacity="0.8"')}
  ${L('M124 87 q9 -5 16 1', '#3b2c1e', 1.5, 'opacity="0.8"')}
  ${eye(108, 100, 6.4, '#dcbb95', shade, ink)} ${eye(132, 100, 6.4, '#c9a377', shade, ink)}
  ${P('M108 120 q12 -5 24 0 q-12 4 -24 0 Z', '#3b2c1e')}
  ${mouths(120, 130, 14, '#8f5f4a', '#5c3427')}
  `;
}

export const ART = { peter1, catherine2, napoleon, louis14 };

let styled=false;
function injectStyle(){
  if(styled) return; styled=true;
  const st=document.createElement('style');
  st.textContent=`
  .gpa-svg{display:block;border-radius:14px}
  .gpa-fig{transform-origin:120px 300px; animation:gpa-brth 5s ease-in-out infinite}
  .gpa-svg .lid{transform-box:fill-box; transform-origin:center top; transform:scaleY(0); animation:gpa-blink 6.4s infinite}
  .gpa-svg .m{display:none}
  .gpa-svg[data-mood="neutral"] .m-neutral,
  .gpa-svg[data-mood="smile"]   .m-smile,
  .gpa-svg[data-mood="stern"]   .m-stern{display:block}
  @keyframes gpa-brth{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.007) translateY(-1.1px)}}
  @keyframes gpa-blink{0%,93%,100%{transform:scaleY(0)}95%,97%{transform:scaleY(1)}}
  @media (prefers-reduced-motion: reduce){ .gpa-fig,.gpa-svg .lid{animation:none} }
  `;
  document.head.appendChild(st);
}

// палитра тканей у каждого своя, но все цвета «загрязнены» — чистых нет
const COAT = {
  peter1:    ['#33543c','#16241a'],   // преображенский зелёный
  catherine2:['#9fa9bd','#4e5566'],   // придворное платье, серо-голубое
  napoleon:  ['#565f70','#242a35'],   // серый сюртук
  louis14:   ['#3a5687','#1a2742'],   // королевская синь
};

export function portraitPainted(id, size=190){
  injectStyle();
  const n=++uid, k=s=>`gpa-${s}-${n}`;
  const ids={
    blur:k('blur'), skinG:k('skin'), shade:'#5d3f2a', ink:'#3a2a1e',
    g_hair:k('hair'), g_wig:k('wig'), g_wig2:k('wig2'), g_hat:k('hat'), g_gold:k('gold'),
    g_sash:k('sash'), g_peterCoat:k('c1'), g_cathGown:k('c2'), g_napCoat:k('c3'), g_louisCoat:k('c4'),
  };
  const coat = COAT[id] || COAT.peter1;
  const art=(ART[id]||ART.peter1)(ids);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 240 300');
  svg.setAttribute('width', size); svg.setAttribute('height', Math.round(size*300/240));
  svg.setAttribute('class','gpa-svg'); svg.dataset.mood='neutral'; svg.dataset.leader=id;
  // Один общий фильтр размытия на портрет: им лепятся все мягкие тени и блики.
  const lg=(gid,c1,c2,x1=0,y1=0,x2=1,y2=0)=>
    `<linearGradient id="${gid}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
       <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>`;
  svg.innerHTML=`
    <defs>
      <filter id="${ids.blur}" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4.6"/>
      </filter>
      <radialGradient id="${k('bg')}" cx="38%" cy="26%" r="90%">
        <stop offset="0%" stop-color="#3a4459"/><stop offset="55%" stop-color="#1d2534"/>
        <stop offset="100%" stop-color="#0b1018"/>
      </radialGradient>
      <linearGradient id="${ids.skinG}" x1="0.1" y1="0.1" x2="0.95" y2="0.85">
        <stop offset="0%" stop-color="#eccfab"/><stop offset="52%" stop-color="#d8b28a"/>
        <stop offset="100%" stop-color="#9e7550"/>
      </linearGradient>
      ${lg(ids.g_hair,'#4a3a2c','#1b140e',0.1,0,0.9,0.9)}
      ${lg(ids.g_wig,'#efece4','#9d998e',0.1,0,0.9,0.9)}
      ${lg(ids.g_wig2,'#5c452f','#2a1e14',0.1,0,0.9,0.9)}
      ${lg(ids.g_hat,'#2f3440','#0e1118',0.1,0,0.9,0.9)}
      ${lg(ids.g_gold,'#f3d999','#a37a2c',0.1,0,0.9,0.9)}
      ${lg(ids.g_sash,'#5b7fb8','#20365c',0.1,0,0.9,0.9)}
      ${lg(ids.g_peterCoat, COAT.peter1[0], COAT.peter1[1],0.05,0,0.95,0.8)}
      ${lg(ids.g_cathGown,  COAT.catherine2[0], COAT.catherine2[1],0.05,0,0.95,0.8)}
      ${lg(ids.g_napCoat,   COAT.napoleon[0], COAT.napoleon[1],0.05,0,0.95,0.8)}
      ${lg(ids.g_louisCoat, COAT.louis14[0], COAT.louis14[1],0.05,0,0.95,0.8)}
      <clipPath id="${k('clip')}"><rect x="0" y="0" width="240" height="300" rx="14"/></clipPath>
    </defs>
    <g clip-path="url(#${k('clip')})">
      <rect x="0" y="0" width="240" height="300" fill="url(#${k('bg')})"/>
      <g class="gpa-fig">${art}</g>
    </g>
    <rect x="0.5" y="0.5" width="239" height="299" rx="14" fill="none" stroke="#00000055"/>`;
  return svg;
}
export function setMood(svg, mood){ if(svg) svg.dataset.mood = mood||'neutral'; }
