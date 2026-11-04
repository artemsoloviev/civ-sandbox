// head3d.js — ЛЕПКА ПОРТРЕТА ЛИДЕРА ОБЪЁМОМ (2026-07-10, прототип)
// ------------------------------------------------------------------------------------------------
// Курс пользователя: портреты трёхмерные, изготовленные собственноручно, умеют мотать головой,
// улыбаться и хмуриться. Урок пяти прошлых провалов: мультяшность рождается НЕ из плоскости, а из
// того, что глаз рисуют кружком, а рот дугой. Поэтому здесь НИЧЕГО не рисуется:
//   • череп — сдавленное яйцо, на него наращиваются валики (надбровья, скулы, челюсть, губы);
//   • глазница — вдавлена, глаз — шар в ней, веки — отдельные лоскуты сферы;
//   • рот — щель между двумя губными объёмами;
//   • мимика — сдвиг вершин по маскам, без перерисовки.
// Всё считается формулами: сфера → смещение каждой вершины суммой «капель» (гауссовых бугров/ямок).
// ------------------------------------------------------------------------------------------------
// Оси: x — вправо, y — вверх, z — ВПЕРЁД (лицо смотрит в +z). Голова ~2.0 ед. высотой.

// Гауссова капля: 1 в центре, плавно тает к нулю. d — расстояние, s — «радиус мягкости».
const G = (d, s) => Math.exp(-(d * d) / (2 * s * s));
// Капля с разными радиусами по осям — так валик может быть длинным и узким (надбровье, губа).
const G3 = (dx, dy, dz, sx, sy, sz) => Math.exp(-(dx * dx / (2 * sx * sx) + dy * dy / (2 * sy * sy) + dz * dz / (2 * sz * sz)));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// ================================================================================================
// ЧЕРЕП И ЛИЦО. Возвращает функцию (x,y,z) → [x,y,z] — куда уехала вершина базовой сферы.
// expr: {smile 0..1, grim 0..1} — мимика меняет ГЕОМЕТРИЮ (валики губ, щёк, надбровий).
// ================================================================================================
function sculpt(p, expr) {
  const smile = expr.smile || 0, grim = expr.grim || 0;
  let [x, y, z] = p;

  // --- 0. Базовая пропорция: голова уже, чем высока; затылок глубже лица.
  x *= 0.745; y *= 0.955; z *= 0.815;

  // --- 1. Сужение книзу: скулы широкие, челюсть уже, подбородок узкий (у Петра лицо вытянутое).
  if (y < 0.05) {
    const t = (0.05 - y) / 1.05;                       // 0 у скул → 1 у подбородка
    const k = 1 - 0.42 * Math.pow(t, 1.35);
    x *= k;
    z *= 1 - 0.20 * Math.pow(t, 1.7);                  // подбородок не «лопата», а клин
  }
  // --- 2. Сужение кверху: лоб высокий, но темя не шире скул; затылок вытянут назад.
  if (y > 0.30) { const t = (y - 0.30) / 0.70; x *= 1 - 0.16 * t * t; }
  if (z < -0.15) z *= 1.09;                            // затылок глубже — иначе голова «мячик»
  if (z > 0.25 && y > 0.42) z *= 0.955;                // лобная кость чуть уплощена

  // --- 3. Височные впадины: без них череп читается шаром.
  const dTemp = G3(Math.abs(x) - 0.60, y - 0.34, z - 0.24, 0.16, 0.20, 0.26);
  x -= Math.sign(x) * 0.055 * dTemp;

  // --- 4. Надбровные дуги — валик поперёк лба. Внутренние концы у переносицы, наружные тают.
  //        При угрюмости валик наползает вперёд и вниз (нависшее надбровье), при улыбке отпускает.
  const browY = 0.215 - 0.045 * grim + 0.012 * smile;
  const brow = G3(Math.abs(x) - 0.245, y - browY, z - 0.68, 0.21, 0.075, 0.30);
  z += (0.055 + 0.030 * grim) * brow;
  y -= 0.020 * grim * brow;
  // Переносица между дугами — небольшая перемычка, иначе дуги висят в воздухе.
  z += 0.030 * G3(x, y - 0.16, z - 0.72, 0.075, 0.10, 0.26);

  // --- 5. Глазницы: вдавливаем сферу внутрь, глаз потом сядет ШАРОМ в эту ямку.
  const orb = G3(Math.abs(x) - 0.255, y - 0.055, z - 0.70, 0.185, 0.085, 0.30);   // ЭЛЛИПС, не круг
  z -= 0.150 * orb;      // глубокая ямка: шар глаза сидит в ней, а разрез задают веки
  // Нижнее веко/подглазничный валик — тонкая горизонтальная припухлость.
  z += 0.022 * G3(Math.abs(x) - 0.255, y + 0.075, z - 0.66, 0.16, 0.045, 0.26);

  // --- 6. Скулы: главный объём лица. Растут ВБОК и ВПЕРЁД, при улыбке подбираются вверх.
  const cheekY = -0.03 + 0.055 * smile;
  const zyg = G3(Math.abs(x) - 0.480, y - cheekY, z - 0.44, 0.185, 0.155, 0.34);
  x += Math.sign(x) * 0.055 * zyg;
  z += 0.030 * zyg;

  // --- 7. Нос. Спинка — узкий длинный валик; кончик — капля; крылья — два бугра по бокам.
  const bridge = G3(x, y + 0.030, z - 0.74, 0.055, 0.185, 0.34);   // спинка
  z += 0.125 * bridge;
  const tip = G3(x, y + 0.175, z - 0.80, 0.070, 0.060, 0.30);      // кончик, чуть опущен
  z += 0.140 * tip; y -= 0.028 * tip;
  const wing = G3(Math.abs(x) - 0.105, y + 0.185, z - 0.74, 0.055, 0.055, 0.26);
  z += 0.055 * wing; x += Math.sign(x) * 0.030 * wing;
  // Ямка под носом (фильтр) — короткая вертикальная бороздка.
  z -= 0.030 * G3(x, y + 0.255, z - 0.78, 0.035, 0.045, 0.24);

  // --- 8. Губы: ДВА объёма, между ними щель. Углы рта ездят от мимики.
  const mouthY = -0.345;
  const lift = 0.055 * smile - 0.045 * grim;           // куда тянутся углы рта
  const corner = G3(Math.abs(x) - 0.145, y - mouthY, z - 0.66, 0.075, 0.085, 0.28);
  y += lift * corner;                                   // угол вверх (улыбка) / вниз (угрюмость)
  z -= 0.020 * grim * corner;
  const upper = G3(x, y - (mouthY + 0.045), z - 0.70, 0.145, 0.038, 0.26);
  const lower = G3(x, y - (mouthY - 0.055), z - 0.70, 0.135, 0.045, 0.26);
  z += 0.045 * upper + 0.050 * lower;
  z -= 0.038 * G3(x, y - mouthY, z - 0.72, 0.155, 0.016, 0.24);    // сама щель между губами
  // Носогубные складки — от крыльев носа к углам рта; при улыбке резче.
  z -= (0.022 + 0.020 * smile) * G3(Math.abs(x) - 0.195, y + 0.265, z - 0.62, 0.055, 0.13, 0.26);
  // Щёчный объём при улыбке (мышца подтягивает мясо вверх).
  z += 0.030 * smile * G3(Math.abs(x) - 0.300, y + 0.170, z - 0.58, 0.15, 0.13, 0.30);

  // --- 9. Подбородок и челюсть.
  z += 0.055 * G3(x, y + 0.610, z - 0.60, 0.115, 0.115, 0.30);     // подбородочный бугор
  z -= 0.022 * G3(x, y + 0.470, z - 0.66, 0.10, 0.055, 0.26);      // складка над ним
  const jaw = G3(Math.abs(x) - 0.430, y + 0.330, z - 0.10, 0.13, 0.15, 0.30);
  x += Math.sign(x) * 0.030 * jaw;                                 // угол нижней челюсти

  // --- 10. Лёгкая живая асимметрия: идеально симметричное лицо читается как маска.
  z += 0.006 * Math.sin(y * 5.1) * clamp(x * 2.4, -1, 1);

  return [x, y, z];
}

// ================================================================================================
// ПОСАДКА ДЕТАЛЕЙ НА КОЖУ.
// Урок второго прогона: детали (брови, усы, глаза) сажались в координатах «на глазок» и уезжали
// ВНУТРЬ черепа — на рендере их просто не было. Правильно: sculpt() от единичного вектора даёт
// ТОЧКУ ПОВЕРХНОСТИ. Строим таблицу таких точек и сажаем каждую деталь на найденную кожу.
// ================================================================================================
function surfaceTable(expr) {
  const T = [];
  for (let i = 0; i <= 240; i++) for (let j = 0; j <= 160; j++) {
    const th = i / 240 * Math.PI * 2, ph = j / 160 * Math.PI;
    const d = [Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th)];
    if (d[2] < 0.02) continue;                       // держим только переднюю половину — лицо
    T.push({ d, p: sculpt(d, expr) });
  }
  return T;
}
// Ближайшая к (x,y) точка кожи + внешняя нормаль в ней (по двум касательным).
function faceAt(T, expr, tx, ty) {
  let best = null, bd = 1e9;
  for (const t of T) { const dd = (t.p[0] - tx) ** 2 + (t.p[1] - ty) ** 2; if (dd < bd) { bd = dd; best = t; } }
  const d = best.d, e = 0.004;
  const rot = (v, ax, a) => {                        // повернуть направление на малый угол
    const c = Math.cos(a), s = Math.sin(a);
    return ax === 'x' ? [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
                      : [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
  };
  const p0 = best.p, p1 = sculpt(rot(d, 'x', e), expr), p2 = sculpt(rot(d, 'y', e), expr);
  const u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
  let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const nl = Math.hypot(n[0], n[1], n[2]) || 1; n = n.map(c => c / nl);
  if (n[2] < 0) n = n.map(c => -c);                  // нормаль наружу, к зрителю
  return { p: p0, n };
}
// Точка «в d единицах над кожей» в месте (x,y).
const onSkin = (T, expr, x, y, d = 0) => { const f = faceAt(T, expr, x, y); return [f.p[0] + f.n[0] * d, f.p[1] + f.n[1] * d, f.p[2] + f.n[2] * d]; };

// ================================================================================================
// Готовые куски
// ================================================================================================
function skin(THREE, c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.86, metalness: 0.0 }); }

function headMesh(THREE, expr, mats) {
  const g = new THREE.SphereGeometry(1, 160, 120);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const q = sculpt([pos.getX(i), pos.getY(i), pos.getZ(i)], expr);
    pos.setXYZ(i, q[0], q[1], q[2]);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mats.skin);
}

// Глаз: белок-шар в глазнице + радужка + зрачок + блик. Веко — лоскут сферы поверх.
// Шар топим в кожу на 62% радиуса: наружу выходит только та шапочка, что видна у живого глаза.
function eye(THREE, side, expr, mats, T) {
  const grp = new THREE.Group();
  const R = 0.118;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 32), mats.sclera);
  grp.add(ball);
  const iris = new THREE.Mesh(new THREE.SphereGeometry(R * 0.99, 40, 32, 0, Math.PI * 2, 0, 0.72), mats.iris);   // радужка крупная: маленькая читается как мультяшная точка
  iris.rotation.x = Math.PI / 2 - 0.12; grp.add(iris);   // взгляд чуть вниз, а не в потолок
  const pup = new THREE.Mesh(new THREE.SphereGeometry(R * 1.005, 32, 24, 0, Math.PI * 2, 0, 0.34), mats.pupil);
  pup.rotation.x = Math.PI / 2 - 0.12; grp.add(pup);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(R * 0.13, 12, 10), mats.glint);
  gl.position.set(-0.030 * side, 0.038, R * 0.95); grp.add(gl);

  // Веки: колпачки чуть большего радиуса. Верхнее опущено при угрюмости, поднято при улыбке слабо.
  const lidGeom = (r, len) => new THREE.SphereGeometry(r, 40, 24, 0, Math.PI * 2, 0, len);
  const up = new THREE.Mesh(lidGeom(R * 1.06, 1.35), mats.skin);
  const drop = 0.34 * (expr.grim || 0) + 0.60 * (expr.blink || 0) + 0.26 * (expr.smile || 0);
  up.rotation.x = -0.18 + drop;   // 0 = веко пополам; в покое чуть прикрыто, как у живого                       // 0 = веко поднято, растёт → закрывается
  grp.add(up);
  const lo = new THREE.Mesh(lidGeom(R * 1.06, 1.15), mats.skin);
  lo.rotation.x = Math.PI + 0.40 - 0.12 * (expr.smile || 0) - 0.30 * (expr.blink || 0);
  grp.add(lo);

  const c = onSkin(T, expr, 0.255 * side, 0.055, -R * 0.34);   // шар почти целиком в глазнице
  grp.position.set(c[0], c[1], c[2]);
  grp.rotation.y = -0.10 * side;                       // глаза чуть расходятся, как на черепе
  return grp;
}

// Бровь: волосяной валик по дуге над глазницей. Точки берём С КОЖИ (иначе валик тонет в черепе).
function brow(THREE, side, expr, mats, T) {
  const grim = expr.grim || 0, smile = expr.smile || 0;
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;                                  // 0 — у переносицы, 1 — к виску
    const x = (0.085 + 0.255 * t) * side;
    const y = 0.245 + 0.050 * Math.sin(t * 2.1) - 0.070 * t * t
            - 0.080 * grim * (1 - t)                   // угрюмость: внутренний конец вниз
            + 0.030 * smile * t;                       // улыбка: наружный чуть вверх
    const q = onSkin(T, expr, x, y, 0.022 + 0.012 * grim);
    pts.push(new THREE.Vector3(q[0], q[1], q[2]));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, 40, 0.042, 10, false);
  const p = g.attributes.position;                     // сплющиваем: бровь прижата к кости, не «колбаса»
  for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * 0.62 + 0.38 * pts[0].y * 0);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mats.hair);
}

// Усы Петра: тонкие, от-под носа в стороны, кончики подкручены вверх. Тоже сажаем на кожу:
// под носом она выступает вперёд (z≈0.90) — усы, положенные «на глазок», уезжали внутрь лица.
function moustache(THREE, side, expr, mats, T) {
  const pts = [], rad = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = (0.025 + 0.315 * t) * side;
    const y = -0.250 - 0.075 * Math.sin(t * 1.9) + 0.170 * Math.pow(t, 3.2);   // провис, потом кончик вверх
    const q = onSkin(T, expr, x, y, 0.030);
    pts.push(new THREE.Vector3(q[0], q[1], q[2]));
    rad.push(0.052 * (1 - 0.62 * t * t) + 0.006);      // к кончику тоньше
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, 56, 1, 12, false);
  const p = g.attributes.position, N = 56 + 1;
  for (let i = 0; i < p.count; i++) {                   // радиус трубки меняем вручную: к концам сходит на нет
    const seg = Math.floor(i / 13), t = clamp(seg / (N - 1), 0, 1);
    const k = rad[Math.min(rad.length - 1, Math.round(t * (rad.length - 1)))];
    const cx = curve.getPoint(t);
    p.setXYZ(i, cx.x + (p.getX(i) - cx.x) * k, cx.y + (p.getY(i) - cx.y) * k * 0.80, cx.z + (p.getZ(i) - cx.z) * k);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mats.hair);
}

// Волосы: шапка + пряди до плеч (у Петра тёмные, волнистые).
// ВАЖНО (урок первого прогона): шапку надо ОБРЕЗАТЬ по линии волос, иначе она накрывает лицо.
// Обрезаем не удалением треугольников, а уводом «лицевых» вершин внутрь черепа — там их не видно.
function hairline(x, y, z) {                       // 1 = здесь растут волосы, 0 = голая кожа лица
  if (z < 0.05) return 1;                          // затылок
  // Край волос НЕ прямой: живая линия слегка гуляет по лбу (иначе виден «шлем» с ровной кромкой).
  const wave = 0.030 * Math.cos(x * 3.1);          // одна пологая волна, без частой ряби
  const yTop = 0.565 + wave;                       // высокий лоб Петра
  if (y > yTop) return 1;
  if (Math.abs(x) > 0.575 + 0.05 * Math.sin(y * 6.0) && y > -0.05) return 1;   // виски, бакенбарды
  return 0;                                        // лоб, глаза, нос, щёки, подбородок
}
function hair(THREE, mats) {
  const grp = new THREE.Group();
  const cap = new THREE.SphereGeometry(1.045, 256, 192);   // мелкая сетка — край волос без «лесенки»
  const pos = cap.attributes.position;
  const isHair = [];
  for (let i = 0; i < pos.count; i++) {
    const q = sculpt([pos.getX(i), pos.getY(i), pos.getZ(i)], {});
    const w = 0.055 + 0.024 * Math.sin(q[0] * 11) * Math.sin(q[1] * 9);   // волнистость
    const n = Math.hypot(q[0], q[1], q[2]) || 1;
    const k = 1 + w / n;
    const X = q[0] * k, Y = q[1] * k + 0.03, Z = q[2] * k;
    pos.setXYZ(i, X, Y, Z);
    isHair.push(hairline(X, Y, Z));
  }
  // Треугольники, целиком лежащие на голой коже, ВЫБРАСЫВАЕМ. Так у шевелюры настоящий обрез
  // по линии волос, а не «лесенка» из спрятанных вершин.
  const idx = cap.index.array, keep = [];
  for (let i = 0; i < idx.length; i += 3) {
    if (isHair[idx[i]] || isHair[idx[i + 1]] || isHair[idx[i + 2]]) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  cap.setIndex(keep);
  cap.computeVertexNormals();
  grp.add(new THREE.Mesh(cap, new THREE.MeshStandardMaterial({ color: mats.hair.color, roughness: 0.72, side: THREE.DoubleSide })));

  // Пряди: от висков вокруг затылка. Спереди прядей нет — там лицо.
  for (let k = 0; k < 30; k++) {
    const a = -Math.PI * 0.82 + (k / 29) * Math.PI * 1.64;      // от левого виска через затылок к правому
    const sx = Math.sin(a), sz = Math.cos(a);
    if (sz > 0.12) continue;                                     // не залезать на лицо
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const drop = 0.10 - 1.55 * t;                              // от виска вниз к плечу
      const flare = 1.00 + 0.13 * Math.sin(t * 3.4 + k) + 0.14 * t * t;
      pts.push(new THREE.Vector3(sx * 0.74 * flare, drop + 0.42 * (1 - t) * (1 - t), sz * 0.86 * flare * (1 - 0.14 * t)));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, 30, 1, 9, false);
    const pp = g.attributes.position, R0 = 0.095 + 0.02 * Math.sin(k * 2.3);
    for (let i = 0; i < pp.count; i++) {                 // локон толстый у корня, сходит на нет к концу
      const t = clamp(Math.floor(i / 10) / 30, 0, 1);
      const r = R0 * (1 - 0.72 * t * t);
      const c = curve.getPoint(t);
      pp.setXYZ(i, c.x + (pp.getX(i) - c.x) * r, c.y + (pp.getY(i) - c.y) * r, c.z + (pp.getZ(i) - c.z) * r);
    }
    g.computeVertexNormals();
    grp.add(new THREE.Mesh(g, mats.hair));
  }
  // Валик у линии роста волос: прячет обрез шапки и даёт объём у корней.
  const roll = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, x = -0.62 + 1.24 * t;
    const y = 0.565 + 0.030 * Math.cos(x * 3.1) + 0.02;
    const q = sculpt([x, y, Math.sqrt(Math.max(0.02, 1 - x * x - y * y))], {});
    roll.push(new THREE.Vector3(q[0], q[1] + 0.02, q[2] + 0.02));
  }
  const rg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(roll), 60, 0.075, 10, false);
  grp.add(new THREE.Mesh(rg, mats.hair));
  return grp;
}

function ear(THREE, side, mats) {
  const g = new THREE.SphereGeometry(0.115, 28, 22);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    p.setXYZ(i, x * 0.30, y * 1.35, z * 0.85 - 0.05 * G(Math.hypot(x, y), 0.5));   // раковина-ямка
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mats.skin);
  m.position.set(0.575 * side, 0.02, 0.05);
  m.rotation.z = -0.12 * side; m.rotation.y = 0.25 * side;
  return m;
}

// Шея и плечи в камзоле — чтобы это был портрет, а не голова в пустоте.
function bust(THREE, mats) {
  const grp = new THREE.Group();
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.38, 0.80, 40), mats.skin);
  neck.position.set(0, -1.20, -0.02); grp.add(neck);

  const sh = new THREE.SphereGeometry(1, 64, 48);
  const p = sh.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i) * 1.20, y = p.getY(i) * 0.62, z = p.getZ(i) * 0.74;
    if (y > 0) y *= 0.55;                                  // покатые плечи
    p.setXYZ(i, x, y, z);
  }
  sh.computeVertexNormals();
  const shoulders = new THREE.Mesh(sh, mats.coat);
  shoulders.position.set(0, -2.12, 0); grp.add(shoulders);

  // воротник-жабо (белый), закрывает стык шеи и камзола
  const jab = new THREE.Mesh(new THREE.SphereGeometry(0.30, 32, 24), mats.linen);
  jab.scale.set(0.85, 1.15, 0.55); jab.position.set(0, -1.60, 0.30); grp.add(jab);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.085, 16, 40), mats.coat);
  collar.rotation.x = Math.PI / 2; collar.position.set(0, -1.53, 0); grp.add(collar);
  return grp;
}

// ================================================================================================
// СБОРКА
// ================================================================================================
export function buildPortrait(THREE, opts = {}) {
  const expr = { smile: 0, grim: 0, blink: 0, ...(opts.expr || {}) };
  const mats = {
    skin: skin(THREE, opts.skinColor || 0xd8a882),
    hair: new THREE.MeshStandardMaterial({ color: opts.hairColor || 0x3a2418, roughness: 0.72 }),
    sclera: new THREE.MeshStandardMaterial({ color: 0xf2ece4, roughness: 0.35 }),
    iris: new THREE.MeshStandardMaterial({ color: opts.eyeColor || 0x4a3520, roughness: 0.30 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x100c08, roughness: 0.25 }),
    glint: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    lash: new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.6 }),
    coat: new THREE.MeshStandardMaterial({ color: opts.coatColor || 0x24402f, roughness: 0.85 }),
    linen: new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: 0.9 }),
  };

  const T = surfaceTable(expr);                    // таблица кожи: на неё сажаем глаза, брови, усы
  const head = new THREE.Group();
  head.add(headMesh(THREE, expr, mats));
  head.add(eye(THREE, -1, expr, mats, T), eye(THREE, 1, expr, mats, T));
  head.add(brow(THREE, -1, expr, mats, T), brow(THREE, 1, expr, mats, T));
  head.add(moustache(THREE, -1, expr, mats, T), moustache(THREE, 1, expr, mats, T));
  head.add(ear(THREE, -1, mats), ear(THREE, 1, mats));
  head.add(hair(THREE, mats));

  const root = new THREE.Group();
  root.add(head);
  root.add(bust(THREE, mats));
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  return {
    root, head, mats,
    // мотать головой: yaw — вправо-влево, pitch — вверх-вниз (радианы)
    setPose(yaw, pitch, roll = 0) { head.rotation.set(pitch, yaw, roll); },
  };
}

export { sculpt };
