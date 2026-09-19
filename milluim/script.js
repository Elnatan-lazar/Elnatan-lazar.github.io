/* ============================================================
   "המילואים נגמרים עוד:" — ספירה לאחור, שעון חול עם לבבות
   ואנימציות פיקסל־ארט של שנינו.
   ============================================================ */

/* ------------------------------------------------------------
   ⚙️  הגדרות — זה כל מה שצריך לשנות
   ------------------------------------------------------------ */
const CONFIG = {
  // תאריך ושעת השחרור: (שנה, חודש־1, יום, שעה, דקה)
  // כרגע: יום חמישי, 24.09.2026 בשעה 15:30 (שעון מקומי של המכשיר)
  endDate:   new Date(2026, 8, 24, 15, 30, 0),

  // מתי המילואים התחילו — קובע כמה חול יש בשעון בהתחלה.
  // ברירת מחדל: שבוע לפני הסיום. אפשר לשים תאריך אמיתי:
  // startDate: new Date(2026, 8, 10, 8, 0, 0),
  startDate: null,
};

const END   = CONFIG.endDate.getTime();
const START = (CONFIG.startDate ? CONFIG.startDate.getTime() : END - 7 * 24 * 3600 * 1000);

const HE_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const pad2 = n => String(Math.max(0, n)).padStart(2, '0');
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const rnd = (a, b) => a + Math.random() * (b - a);

/* ============================================================
   1) ספירה לאחור
   ============================================================ */
const el = {
  d: document.getElementById('cdDays'),
  h: document.getElementById('cdHours'),
  m: document.getElementById('cdMins'),
  s: document.getElementById('cdSecs'),
  title: document.getElementById('mainTitle'),
  target: document.getElementById('targetLine'),
  heartCount: document.getElementById('heartCount'),
  overlay: document.getElementById('doneOverlay'),
};

let finished = false;

function setNum(node, val) {
  const txt = pad2(val);
  if (node.textContent !== txt) {
    node.textContent = txt;
    node.classList.remove('tick');
    void node.offsetWidth;
    node.classList.add('tick');
  }
}

function remainingMs() { return END - Date.now(); }

function updateCountdown() {
  let ms = remainingMs();
  if (ms <= 0) {
    ms = 0;
    if (!finished) {
      finished = true;
      el.title.textContent = 'המילואים נגמרו!';
      el.overlay.hidden = false;
      try { goToScene(4); } catch (e) { /* עדיין נטען */ }
    }
  }
  const total = Math.floor(ms / 1000);
  setNum(el.d, Math.floor(total / 86400));
  setNum(el.h, Math.floor(total / 3600) % 24);
  setNum(el.m, Math.floor(total / 60) % 60);
  setNum(el.s, total % 60);
}

(function writeTargetLine() {
  const d = CONFIG.endDate;
  el.target.textContent =
    `היעד: יום ${HE_DAYS[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} בשעה ` +
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
})();

updateCountdown();
setInterval(updateCountdown, 250);

document.getElementById('doneClose').addEventListener('click', () => { el.overlay.hidden = true; });

/* לבבות רקע צפים */
(function bgHearts() {
  const box = document.getElementById('bgHearts');
  for (let i = 0; i < 10; i++) {
    const h = document.createElement('i');
    h.textContent = '❤';
    h.style.left = rnd(2, 96).toFixed(1) + '%';
    h.style.fontSize = rnd(14, 34).toFixed(0) + 'px';
    h.style.animationDuration = rnd(16, 34).toFixed(1) + 's';
    h.style.animationDelay = (-rnd(0, 30)).toFixed(1) + 's';
    box.appendChild(h);
  }
})();

/* ============================================================
   2) שעון החול — כל גרגר שנוחת הופך ללב
   ============================================================ */
const HG = (function () {
  const cv = document.getElementById('hourglass');
  const ctx = cv.getContext('2d');
  const SC = 6, W = 56, H = 100, CX = 28;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(SC, 0, 0, SC, 0, 0);

  const p = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  // גבולות הזכוכית
  const TOP_Y0 = 8, TOP_Y1 = 46, NECK_Y1 = 52, BOT_Y1 = 92, HW_MAX = 21, HW_MIN = 2;
  function halfWidth(y) {
    if (y < TOP_Y0) return HW_MAX;
    if (y <= TOP_Y1) return HW_MAX - (y - TOP_Y0) * (HW_MAX - HW_MIN) / (TOP_Y1 - TOP_Y0);
    if (y <= NECK_Y1) return HW_MIN;
    if (y <= BOT_Y1) return HW_MIN + (y - NECK_Y1) * (HW_MAX - HW_MIN) / (BOT_Y1 - NECK_Y1);
    return HW_MAX;
  }

  // ערימת הלבבות בתא התחתון: 14 עמודות ברוחב 3, שורות בגובה 3
  const COLS = 14, CELL = 3, COL_X0 = CX - 21, ROW_Y0 = 89;
  const heights = new Array(COLS).fill(0);
  const hearts = [];            // {x,y,tone,pop}
  const grains = [];            // {x,y,vy}
  const ghosts = [];            // לבבות שנספגים כשהערימה מלאה
  const TONES = ['#ff3b5c', '#ff5c78', '#e3213f', '#ff7a93'];

  const cellX = c => COL_X0 + c * CELL;
  const cellY = r => ROW_Y0 - r * CELL;
  function cellOk(c, r) {
    const y = cellY(r);
    if (y < NECK_Y1 + 1) return false;
    const hw = halfWidth(y);
    return cellX(c) >= CX - hw && cellX(c) + CELL <= CX + hw;
  }
  const capacity = (() => { let n = 0; for (let c = 0; c < COLS; c++) for (let r = 0; r < 14; r++) if (cellOk(c, r)) n++; return n; })();

  function place(c) {
    // מחליקים לצד הנמוך יותר, כמו חול אמיתי
    for (let i = 0; i < 4; i++) {
      const l = c - 1, r = c + 1;
      const hl = l >= 0 && cellOk(l, heights[l]) ? heights[l] : 99;
      const hr = r < COLS && cellOk(r, heights[r]) ? heights[r] : 99;
      const here = cellOk(c, heights[c]) ? heights[c] : 99;
      if (hl < here - 0 && hl <= hr) c = l;
      else if (hr < here) c = r;
      else break;
    }
    if (cellOk(c, heights[c])) return c;
    let best = -1, bh = 99;
    for (let i = 0; i < COLS; i++) if (cellOk(i, heights[i]) && heights[i] < bh) { bh = heights[i]; best = i; }
    return best;
  }

  function addHeart(col, animate) {
    const c = place(col);
    if (c < 0) return false;
    const r = heights[c]++;
    hearts.push({ x: cellX(c), y: cellY(r), tone: TONES[(Math.random() * TONES.length) | 0], pop: animate ? 0 : 1 });
    return true;
  }

  // מילוי ראשוני לפי כמה מהמילואים כבר עברו
  function progress() { return clamp((Date.now() - START) / (END - START), 0, 1); }
  (function prefill() {
    const n = Math.round(progress() * capacity);
    for (let i = 0; i < n; i++) addHeart(((Math.random() * COLS) | 0), false);
  })();

  function heart3(x, y, tone, scale) {
    if (scale < 0.45) { p(x + 1, y + 1, 1, 1, tone); return; }
    p(x, y, 1, 1, tone); p(x + 2, y, 1, 1, tone);
    p(x, y + 1, 3, 1, tone); p(x + 1, y + 2, 1, 1, tone);
  }

  let spawnT = 0;
  function update(dt) {
    const f = 1 - progress();                       // כמה חול נשאר למעלה
    spawnT += dt;
    if (spawnT > 0.7) {
      spawnT = 0;
      if (f > 0.001 || hearts.length < capacity) grains.push({ x: CX - 1 + (Math.random() < .5 ? 0 : 1), y: 45, vy: 26 });
    }
    for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      g.vy += 48 * dt;
      g.y += g.vy * dt;
      const col = clamp(Math.round((g.x - COL_X0) / CELL), 0, COLS - 1);
      const landY = cellY(heights[col]) - 1;
      if (g.y >= Math.min(landY, BOT_Y1 - 2)) {
        grains.splice(i, 1);
        if (hearts.length < capacity) addHeart(col, true);
        else ghosts.push({ x: CX - 1, y: BOT_Y1 - 4, life: 1 });
      }
    }
    for (let i = ghosts.length - 1; i >= 0; i--) { ghosts[i].life -= dt * 1.4; ghosts[i].y -= dt * 3; if (ghosts[i].life <= 0) ghosts.splice(i, 1); }
    for (const h of hearts) if (h.pop < 1) h.pop = Math.min(1, h.pop + dt * 5);
    el.heartCount.textContent = hearts.length;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const wood = '#8a5a2b', wood2 = '#6b4321', wood3 = '#a97544';

    // מסגרת עץ
    p(1, 0, 54, 6, wood); p(1, 0, 54, 2, wood3); p(1, 4, 54, 2, wood2);
    p(1, 94, 54, 6, wood); p(1, 94, 54, 2, wood3); p(1, 98, 54, 2, wood2);
    p(2, 6, 4, 88, wood); p(2, 6, 1, 88, wood3); p(5, 6, 1, 88, wood2);
    p(50, 6, 4, 88, wood); p(50, 6, 1, 88, wood3); p(53, 6, 1, 88, wood2);

    // זכוכית
    for (let y = TOP_Y0 - 1; y <= BOT_Y1 + 1; y++) {
      const hw = Math.round(halfWidth(y));
      p(CX - hw, y, hw * 2, 1, (y + CX) % 7 === 0 ? '#2b3f57' : '#26364b');
      p(CX - hw - 1, y, 1, 1, '#9fd6e8'); p(CX + hw, y, 1, 1, '#7ab6cc');
    }

    // חול עליון
    const f = 1 - clamp((Date.now() - START) / (END - START), 0, 1);
    const ys = Math.round(TOP_Y0 + (TOP_Y1 - TOP_Y0) * (1 - f));
    for (let y = ys; y <= TOP_Y1; y++) {
      const hw = Math.round(halfWidth(y)) - 1;
      if (hw <= 0) continue;
      for (let x = CX - hw; x < CX + hw; x++) {
        p(x, y, 1, 1, (x + y) % 5 === 0 ? '#d1a55f' : ((x * 3 + y) % 7 === 0 ? '#f2d79b' : '#e8c17a'));
      }
      if (y === ys) p(CX - hw, y, hw * 2, 1, '#f7e3bb');
    }
    if (f > 0.001) { p(CX - 1, TOP_Y1, 2, 6, '#e8c17a'); p(CX - 1, NECK_Y1 - 1, 2, 2, '#d1a55f'); }

    // גרגרים נופלים
    for (const g of grains) p(g.x, g.y, 1, 2, '#f2d79b');

    // לבבות
    for (const h of hearts) heart3(h.x, h.y, h.tone, h.pop);
    for (const g of ghosts) { ctx.globalAlpha = clamp(g.life, 0, 1); heart3(g.x, g.y, '#ff7a93', 1); ctx.globalAlpha = 1; }

    // ניצוץ עדין על הזכוכית
    p(CX - 14, 14, 1, 8, 'rgba(255,255,255,.35)');
    p(CX - 12, 13, 1, 4, 'rgba(255,255,255,.22)');
  }

  return { update, draw };
})();

/* ============================================================
   3) פיקסל־ארט: הדמויות שלנו
   ============================================================ */
const cvS = document.getElementById('scene');
const sx2 = cvS.getContext('2d');
const SW = 160, SH = 90, SSC = 5, GY = 76;   // GY = קו הקרקע
sx2.imageSmoothingEnabled = false;
sx2.setTransform(SSC, 0, 0, SSC, 0, 0);

const q = (x, y, w, h, c) => {
  sx2.fillStyle = c;
  sx2.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
};

const PAL = {
  m: { skin:'#d89a68', sh:'#b97f52', hair:'#46291a', hair2:'#63402a', beard:'#3c2413', shorts:'#20243a', shoe:'#2b2b2b', eye:'#2b1d16', mouth:'#93433f' },
  f: { skin:'#f2c69c', sh:'#d9a67c', hair:'#e0bd62', hair2:'#f4dd9e', band:'#3fa9d6', shorts:'#2f2440', shoe:'#3a2a3a', eye:'#3a2a20', mouth:'#bd5a68' },
};
const SH_R = '#d8262c', SH_K = '#171717', SH_W = '#f0f0f0';

/* חולצת פלמנגו — פסים אדום־שחור */
function torso(x, b, lean) {
  const rows = [SH_K, SH_K, SH_R, SH_R, SH_K, SH_K, SH_R, SH_R];
  for (let i = 0; i < 8; i++) q(x - 4 + lean, b - 19 + i, 8, 1, rows[i]);
  q(x - 1 + lean, b - 16, 2, 2, SH_W);            // סמל קטן על החזה
}

/* איבר אלכסוני (יד/רגל) שנמתח מנקודה לנקודה בסגנון פיקסלים */
function limb(x0, y0, x1, y1, c, w) {
  w = w || 2;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) { const k = i / n; q(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, w, w, c); }
}

function arm(x, b, side, state, c, lean) {
  const ax = (side < 0 ? x - 6 : x + 4) + lean;
  if (state === 'up')       { q(ax, b - 28, 2, 10, c.skin); q(ax, b - 29, 2, 1, c.sh); }
  else if (state === 'out') { q(side < 0 ? x - 10 + lean : x + 4 + lean, b - 18, 6, 2, c.skin); }
  else if (state === 'mid') { q(ax, b - 19, 2, 5, c.skin); q(side < 0 ? x - 9 + lean : x + 4 + lean, b - 15, 5, 2, c.skin); }
  else if (state === 'hug') { q(side < 0 ? x - 6 + lean : x + 2 + lean, b - 15, 5, 2, c.skin); q(ax, b - 19, 2, 4, c.skin); }
  else                      { q(ax, b - 19, 2, 8, c.skin); }
}

function legs(x, b, c, mode) {
  if (mode === 1) {                       // צעד — רגליים פשוקות
    q(x - 5, b - 7, 2, 5, c.skin); q(x + 3, b - 7, 2, 5, c.skin);
    q(x - 6, b - 2, 3, 2, c.shoe); q(x + 3, b - 2, 3, 2, c.shoe);
  } else if (mode === 2) {                // קפיצה — רגליים מכופפות
    q(x - 4, b - 7, 2, 4, c.skin); q(x + 2, b - 7, 2, 4, c.skin);
    q(x - 6, b - 3, 3, 2, c.shoe); q(x + 3, b - 3, 3, 2, c.shoe);
  } else {
    q(x - 3, b - 7, 2, 5, c.skin); q(x + 1, b - 7, 2, 5, c.skin);
    q(x - 4, b - 2, 3, 2, c.shoe); q(x + 1, b - 2, 3, 2, c.shoe);
  }
}

function headM(x, b, mood, lean) {
  const c = PAL.m, X = x + lean;
  q(X - 4, b - 28, 8, 8, c.skin);                       // פנים
  q(X - 5, b - 31, 10, 4, c.hair);                      // תלתלים
  q(X - 6, b - 30, 1, 4, c.hair); q(X + 5, b - 30, 1, 4, c.hair);
  q(X - 4, b - 32, 3, 1, c.hair2); q(X, b - 32, 2, 1, c.hair2); q(X + 3, b - 32, 1, 1, c.hair);
  q(X - 6, b - 28, 2, 3, c.hair); q(X + 4, b - 28, 2, 3, c.hair);
  q(X - 3, b - 26, 1, 1, c.eye); q(X + 2, b - 26, 1, 1, c.eye);
  q(X - 5, b - 25, 1, 5, c.beard); q(X + 4, b - 25, 1, 5, c.beard);   // זקן
  q(X - 3, b - 24, 6, 1, c.beard);
  q(X - 4, b - 22, 8, 2, c.beard);
  q(X - 2, b - 23, 4, 1, c.mouth);
  if (mood !== 'calm') q(X - 1, b - 23, 2, 1, '#ffffff');
  q(X - 1, b - 20, 2, 1, c.sh);                          // צוואר
}

function hairBackF(x, b, lean) {      // נמשך לפני הידיים — כדי שהן לא ייעלמו מאחוריו
  const c = PAL.f, X = x + lean;
  q(X - 6, b - 29, 2, 16, c.hair); q(X + 4, b - 29, 2, 16, c.hair);
}
function headF(x, b, mood, lean) {
  const c = PAL.f, X = x + lean;
  q(X - 4, b - 28, 8, 8, c.skin);
  q(X - 6, b - 32, 12, 4, c.hair);
  q(X - 3, b - 33, 5, 1, c.hair2);
  q(X - 5, b - 29, 10, 2, c.band); q(X + 5, b - 28, 2, 2, c.band);    // מטפחת
  q(X - 3, b - 26, 1, 1, c.eye); q(X + 2, b - 26, 1, 1, c.eye);
  q(X - 4, b - 24, 1, 1, '#f2a0ad'); q(X + 3, b - 24, 1, 1, '#f2a0ad');
  q(X - 2, b - 23, 4, 1, c.mouth);
  if (mood !== 'calm') q(X - 1, b - 23, 2, 1, '#ffffff');
  q(X - 1, b - 20, 2, 1, c.sh);
}

/* דמות עומדת / יושבת */
function person(o) {
  const who = o.who, c = PAL[who], x = o.x, b = o.base;
  const lean = o.lean || 0, mood = o.mood || 'big';
  if (who === 'f') hairBackF(x, b, lean);
  if (o.armLTo) limb(x - 5 + lean, b - 18, o.armLTo[0], o.armLTo[1], c.skin, 2);
  else arm(x, b, -1, o.armL || 'down', c, lean);
  if (o.armRTo) limb(x + 4 + lean, b - 18, o.armRTo[0], o.armRTo[1], c.skin, 2);
  else arm(x, b, +1, o.armR || 'down', c, lean);
  if (o.pose === 'sit') {
    const sw = o.legSwing || 0;
    q(x - 4, b - 11, 8, 4, c.shorts);                 // ירכיים על המושב
    q(x - 3 + sw, b - 7, 2, 6, c.skin); q(x + 1 + sw, b - 7, 2, 6, c.skin);
    q(x - 4 + sw, b - 1, 3, 2, c.shoe); q(x + 1 + sw, b - 1, 3, 2, c.shoe);
  } else {
    legs(x, b, c, o.leg || 0);
    q(x - 4, b - 11, 8, 4, c.shorts);
  }
  torso(x, b, lean);
  if (who === 'm') headM(x, b, mood, lean); else headF(x, b, mood, lean);
}

/* דמות שוכבת על הגב (סצנת הכוכבים) — הראש משמאל, הגוף מימין */
function lying(o) {
  const who = o.who, c = PAL[who], x = o.x, b = o.base;
  // שיער מאחורי הראש
  if (who === 'f') { q(x - 13, b - 7, 9, 6, c.hair); q(x - 6, b - 11, 11, 3, c.hair); q(x - 11, b - 9, 6, 2, c.hair2); }
  else { q(x - 7, b - 11, 11, 3, c.hair); q(x - 8, b - 9, 2, 7, c.hair); q(x - 5, b - 12, 4, 1, c.hair2); }
  // גוף בפסים
  for (let i = 0; i < 6; i++) q(x + 4 + i * 2, b - 8, 2, 8, (i % 2 === 0) ? SH_K : SH_R);
  q(x + 8, b - 6, 2, 2, SH_W);
  // מכנסיים, רגליים ונעליים
  q(x + 16, b - 8, 7, 8, c.shorts);
  q(x + 23, b - 8, 8, 3, c.skin); q(x + 23, b - 4, 8, 3, c.sh);
  q(x + 30, b - 9, 3, 3, c.shoe); q(x + 30, b - 4, 3, 3, c.shoe);
  // ראש (פרופיל, מביט למעלה)
  q(x - 4, b - 9, 8, 9, c.skin);
  if (who === 'm') { q(x - 5, b - 7, 1, 6, c.beard); q(x - 4, b - 3, 6, 3, c.beard); q(x - 6, b - 9, 3, 3, c.hair); }
  else { q(x - 5, b - 10, 10, 2, c.band); q(x + 3, b - 3, 1, 1, '#f2a0ad'); }
  q(x - 1, b - 7, 1, 1, c.eye); q(x + 2, b - 7, 1, 1, c.eye);   // מביטים למעלה
  q(x, b - 5, 2, 1, c.mouth);
  // יד — מצביעה לשמיים או מונחת
  if (o.point) { limb(x + 6, b - 9, x + 13, b - 23, c.skin, 2); q(x + 13, b - 25, 1, 2, c.skin); }
  else q(x + 6, b - 10, 7, 2, c.skin);
}

/* ============================================================
   4) חלקיקים, רקעים ושאר עזרים
   ============================================================ */
function heartS(x, y, c) { q(x, y, 1, 1, c); q(x + 2, y, 1, 1, c); q(x, y + 1, 3, 1, c); q(x + 1, y + 2, 1, 1, c); }

let PARTS = [];
const HEART_COLORS = ['#ff3b5c', '#ff6b8a', '#e3213f', '#ff9ab0'];
const CONF_COLORS = ['#ffd166', '#ff4d7e', '#6ee7f2', '#b388ff', '#8bf08b', '#ffffff'];
function spawn(o) { PARTS.push(Object.assign({ x: 0, y: 0, vx: 0, vy: -8, g: 0, life: 1, decay: .5, type: 'heart', c: '#ff3b5c', s: 2 }, o)); }
function stepParts(dt) {
  for (let i = PARTS.length - 1; i >= 0; i--) {
    const a = PARTS[i];
    a.vy += a.g * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.life -= a.decay * dt;
    if (a.life <= 0 || a.y > 94 || a.x < -6 || a.x > 166) PARTS.splice(i, 1);
  }
}
function drawParts() {
  for (const a of PARTS) {
    sx2.globalAlpha = clamp(a.life, 0, 1);
    if (a.type === 'heart') heartS(a.x, a.y, a.c); else q(a.x, a.y, a.s, a.s, a.c);
  }
  sx2.globalAlpha = 1;
}

let seed = 20260924;
function sr() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
const GRASS   = Array.from({ length: 46 }, () => ({ x: sr() * 160, y: GY + 1 + sr() * 12, c: sr() < .5 ? '#3d8a38' : '#69ba59' }));
const FLOWERS = Array.from({ length: 16 }, () => ({ x: 4 + sr() * 152, y: GY + 2 + sr() * 10, c: ['#ffd166', '#ff7aa2', '#ffffff', '#c77dff'][(sr() * 4) | 0] }));
const STARS   = Array.from({ length: 70 }, () => ({ x: sr() * 160, y: sr() * 58, ph: sr() * 6.3, b: sr() }));

function band(cols, y0, y1) { const h = (y1 - y0) / cols.length; cols.forEach((c, i) => q(0, y0 + i * h, 160, h + 1, c)); }
function skyDay()   { band(['#4fb0e8', '#6cc2ef', '#8ad2f3', '#a9e0f6', '#c8ecfa', '#e6f6fd'], 0, GY); }
function skySunset(){ band(['#3b2a6b', '#6b3a80', '#a44a80', '#d96a72', '#f5a06a', '#ffd7a0'], 0, GY); }
function skyNight() { band(['#080b28', '#0d1338', '#131c4c', '#1a2560', '#243070', '#2e3a80'], 0, GY); }

function grassDay() {
  q(0, GY, 160, 14, '#4f9b45'); q(0, GY, 160, 2, '#69ba59');
  for (const g of GRASS) q(g.x, g.y, 1, 2, g.c);
}

function hills(c1, c2) {
  for (let x = 0; x < 160; x++) {
    const h1 = 8 + Math.sin(x * 0.06) * 5 + Math.sin(x * 0.021) * 4;
    q(x, GY - h1, 1, h1, c1);
    const h2 = 5 + Math.sin(x * 0.045 + 2) * 3;
    q(x, GY - h2, 1, h2, c2);
  }
}
function cloud(x, y, s, c) {
  x = ((x % 200) + 200) % 200 - 20;
  q(x, y, 10 * s, 3, c); q(x + 3, y - 3, 7 * s, 3, c); q(x - 3, y + 2, 14 * s, 3, c);
}
function sun(x, y) {
  q(x - 5, y - 2, 11, 5, '#ffe38a'); q(x - 2, y - 5, 5, 11, '#ffe38a');
  q(x - 4, y - 4, 9, 9, '#ffe38a'); q(x - 3, y - 3, 6, 6, '#fff6c9');
}
function moon(x, y) {
  q(x - 4, y - 2, 9, 5, '#f2f0d8'); q(x - 2, y - 4, 5, 9, '#f2f0d8'); q(x - 3, y - 3, 7, 7, '#f2f0d8');
  q(x - 1, y - 2, 2, 2, '#dcd8b8'); q(x + 1, y + 1, 2, 2, '#dcd8b8');
}
function tree(x) {
  q(x, GY - 24, 6, 24, '#6b4226'); q(x, GY - 24, 2, 24, '#7d5030');
  const blobs = [[-12, -40, 30, 10], [-9, -46, 24, 8], [-14, -33, 34, 8], [-4, -50, 12, 6]];
  for (const [dx, dy, w, h] of blobs) q(x + dx, GY + dy, w, h, '#2f7d3a');
  for (const [dx, dy, w] of [[-10, -45, 20], [-12, -38, 26], [-3, -49, 9]]) q(x + dx, GY + dy, w, 3, '#41a04b');
}

/* ============================================================
   5) חמש הסצנות
   ============================================================ */

/* --- 1. נדנדה בפארק --- */
function sceneSwing(t) {
  skyDay(); sun(24, 15);
  cloud(40 + t * 3, 14, 1, '#ffffff'); cloud(110 + t * 2, 24, 1, '#eef9ff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  for (const f of FLOWERS) q(f.x, f.y, 2, 2, f.c);
  tree(128);
  q(94, 28, 36, 3, '#6b4226'); q(94, 28, 36, 1, '#7d5030');   // ענף

  const ang = 0.42 * Math.sin(t * 1.7), L = 24, PX0 = 104, PY0 = 31;
  const sxp = PX0 + Math.sin(ang) * L, syp = PY0 + Math.cos(ang) * L;
  limb(PX0 - 7, PY0, sxp - 7, syp, '#c8a06a', 1);              // חבלים
  limb(PX0 + 6, PY0, sxp + 6, syp, '#c8a06a', 1);
  q(sxp - 8, syp, 16, 2, '#8a5a2b'); q(sxp - 8, syp, 16, 1, '#a97544');   // מושב
  const push = Math.max(0, -Math.sin(t * 1.7));
  const hx = 78 + push * 5;
  person({ who: 'f', x: sxp, base: syp + 11, pose: 'sit', legSwing: Math.round(ang * 6),
           armL: 'down', armR: 'down', mood: 'big', lean: Math.round(ang * 2) });
  q(sxp - 8, syp + 2, 16, 1, '#6b4321');                        // שפת המושב מלפנים
  person({ who: 'm', x: hx, base: GY, armL: 'down', armRTo: [sxp - 9, syp - 2], mood: 'big' });

  if (Math.random() < 0.06) spawn({ x: sxp + rnd(-6, 6), y: syp - 34, vy: -9, vx: rnd(-3, 3), decay: .45, c: HEART_COLORS[(Math.random() * 4) | 0] });
}

/* --- 2. משחק תופסת --- */
function sceneChase(t) {
  skyDay(); sun(136, 16);
  cloud(20 + t * 4, 12, 1, '#ffffff'); cloud(90 + t * 3, 22, 1, '#eef9ff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  for (const f of FLOWERS) q(f.x, f.y, 2, 2, f.c);
  tree(18);

  const w = 1.15, A = 44;
  const fx = 80 + A * Math.sin(t * w), mx = 80 + A * Math.sin(t * w + 0.85);
  const dir = Math.cos(t * w) > 0 ? 1 : -1;
  const step = (Math.floor(t * 9) % 2) ? 1 : 0;
  const bob = step ? -1 : 0;
  const swing = (x, b, s) => ({                       // ידיים מתנופפות בריצה
    armLTo: [x - 8 + (s ? 3 : -2), b - (s ? 24 : 14)],
    armRTo: [x + 7 + (s ? -2 : 3), b - (s ? 14 : 24)],
  });

  q(mx - 5, GY + 1, 10, 2, '#3d8a38'); q(fx - 5, GY + 1, 10, 2, '#3d8a38');   // צללים
  person(Object.assign({ who: 'm', x: mx, base: GY + bob, leg: step ? 1 : 0, mood: 'big', lean: dir }, swing(mx, GY + bob, step)));
  person(Object.assign({ who: 'f', x: fx, base: GY - bob, leg: step ? 0 : 1, mood: 'big', lean: dir }, swing(fx, GY - bob, 1 - step)));
  if (Math.random() < 0.3) spawn({ x: mx - dir * 5, y: GY - 1, vy: rnd(-5, -2), vx: -dir * rnd(3, 7), decay: 1.6, type: 'sq', s: 1, c: '#cdbf9a' });
  if (Math.random() < 0.3) spawn({ x: fx - dir * 5, y: GY - 1, vy: rnd(-5, -2), vx: -dir * rnd(3, 7), decay: 1.6, type: 'sq', s: 1, c: '#cdbf9a' });

  if (Math.random() < 0.22) spawn({ x: fx + rnd(-5, 5), y: GY - 36, vy: rnd(-12, -7), vx: rnd(-4, 4), decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  if (Math.random() < 0.22) spawn({ x: mx + rnd(-5, 5), y: GY - 36, vy: rnd(-12, -7), vx: rnd(-4, 4), decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  // "חחח" — ניצוצות צחוק
  if (Math.random() < 0.10) spawn({ x: (Math.random() < .5 ? mx : fx) + rnd(-8, 8), y: GY - 40, vy: -6, vx: rnd(-2, 2), decay: .9, type: 'sq', s: 1, c: '#fff6c9' });
}

/* --- 3. שתייה אחת, שני קשים --- */
function sceneDrink(t) {
  skySunset();
  cloud(30 + t * 2, 16, 1, '#ffc9a0'); cloud(112 + t * 1.5, 26, 1, '#ffb894');
  hills('#5b3a6b', '#6d4a77');
  q(0, GY, 160, 14, '#3f6b42'); q(0, GY, 160, 2, '#54864f');
  for (const g of GRASS) q(g.x, g.y, 1, 2, '#4a7a48');
  tree(14);

  // ספסל
  q(52, 57, 3, 19, '#6b4226'); q(105, 57, 3, 19, '#6b4226');
  q(50, 57, 60, 3, '#8a5a2b'); q(50, 61, 60, 2, '#7d5030');
  q(48, 64, 64, 3, '#a97544'); q(48, 66, 64, 1, '#6b4321');
  q(56, 67, 3, 9, '#6b4226'); q(101, 67, 3, 9, '#6b4226');

  const sip = (Math.sin(t * 1.3) > .82) ? 1 : 0;
  person({ who: 'm', x: 68, base: 75, pose: 'sit', armR: 'out', armL: 'down', mood: sip ? 'calm' : 'big', lean: sip ? 1 : 0 });
  person({ who: 'f', x: 92, base: 75, pose: 'sit', armL: 'out', armR: 'down', mood: sip ? 'calm' : 'big', lean: sip ? -1 : 0 });

  // הכוס המשותפת
  const lvl = 2 + Math.round(2 + 2 * Math.sin(t * 1.3));
  q(77, 54, 7, 10, '#f4f4f4'); q(77, 54, 7, 2, '#e0e0e0');
  q(78, 56 + lvl, 5, 8 - lvl, '#ff8c42'); q(77, 62, 7, 2, '#d8262c');
  // קשים
  q(78, 50, 1, 5, '#ff4d7e'); q(70, 50, 8, 1, '#ff4d7e'); q(70, 51, 1, 2, '#ff4d7e');
  q(82, 50, 1, 5, '#6ee7f2'); q(83, 50, 8, 1, '#6ee7f2'); q(90, 51, 1, 2, '#6ee7f2');

  if (Math.random() < 0.08) spawn({ x: 80 + rnd(-4, 4), y: 48, vy: -8, vx: rnd(-3, 3), decay: .45, c: HEART_COLORS[(Math.random() * 4) | 0] });
}

/* --- 4. סופרים כוכבים --- */
let shootT = 0, shoot = null;
function sceneStars(t, dt) {
  skyNight();
  for (const s of STARS) {
    const tw = 0.55 + 0.45 * Math.sin(t * 2 + s.ph);
    sx2.globalAlpha = tw;
    q(s.x, s.y, s.b > .85 ? 2 : 1, s.b > .85 ? 2 : 1, s.b > .5 ? '#ffffff' : '#cfe0ff');
    sx2.globalAlpha = 1;
  }
  moon(132, 16);
  cloud(20 + t * 2.5, 22, 1, 'rgba(120,140,220,.45)'); cloud(96 + t * 1.6, 12, 1, 'rgba(120,140,220,.35)');

  shootT -= dt;
  if (!shoot && shootT <= 0) { shoot = { x: rnd(20, 120), y: rnd(6, 26), life: 1 }; shootT = rnd(4, 8); }
  if (shoot) {
    shoot.x += 60 * dt; shoot.y += 26 * dt; shoot.life -= dt * .9;
    for (let i = 0; i < 6; i++) { sx2.globalAlpha = clamp(shoot.life - i * .12, 0, 1); q(shoot.x - i * 2, shoot.y - i, 2, 1, '#fff6c9'); }
    sx2.globalAlpha = 1;
    if (shoot.life <= 0) shoot = null;
  }

  // דשא כהה + שמיכת פיקניק
  q(0, GY - 14, 160, 30, '#16332a'); q(0, GY - 14, 160, 2, '#1f4636');
  for (let i = 0; i < 20; i++) for (let j = 0; j < 5; j++)
    q(20 + i * 6, 60 + j * 6, 6, 6, ((i + j) % 2 === 0) ? '#c9455c' : '#f2e3c8');
  q(20, 60, 120, 1, '#ffd7dd');
  // פנס קטן על השמיכה
  q(126, 50, 2, 4, '#8a5a2b'); q(122, 53, 10, 2, '#8a5a2b');
  q(123, 55, 8, 9, '#ffe38a'); q(124, 56, 6, 7, '#fff6c9'); q(122, 64, 10, 2, '#8a5a2b');
  sx2.globalAlpha = .18 + .06 * Math.sin(t * 3); q(118, 50, 18, 20, '#ffe38a'); sx2.globalAlpha = 1;

  lying({ who: 'f', x: 58, base: 73, point: true });    // היא מצביעה על כוכב
  lying({ who: 'm', x: 62, base: 86, point: false });

  if (Math.random() < 0.04) spawn({ x: 60 + rnd(-8, 20), y: 62, vy: -7, vx: rnd(-2, 2), decay: .4, c: HEART_COLORS[(Math.random() * 4) | 0] });
}

/* --- 5. חגיגת ניצחון --- */
function sceneParty(t) {
  skyDay(); sun(20, 14);
  cloud(60 + t * 3, 16, 1, '#ffffff'); cloud(130 + t * 2, 26, 1, '#eef9ff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  for (const f of FLOWERS) q(f.x, f.y, 2, 2, f.c);

  const j = Math.abs(Math.sin(t * 2.7)) * 9;
  const air = j > 3;
  const bm = GY - j, HX = 80, HY = bm - 33;
  q(65, GY + 2, 10, 2, '#3d8a38'); q(86, GY + 2, 10, 2, '#3d8a38');            // צללים
  person({ who: 'm', x: 70, base: bm, leg: air ? 2 : 0, armRTo: [HX - 3, HY], armL: 'out', mood: 'big' });
  person({ who: 'f', x: 91, base: bm, leg: air ? 2 : 0, armLTo: [HX + 2, HY], armR: 'out', mood: 'big' });

  if (j > 7.5) {   // הכיף מתנגשות
    const b = HY - 2;
    q(78, b, 5, 2, '#fff6c9'); q(79, b - 3, 3, 3, '#ffd166'); q(75, b - 2, 2, 2, '#ffd166'); q(83, b - 2, 2, 2, '#ffd166');
    q(73, b + 2, 2, 2, '#ffffff'); q(85, b + 2, 2, 2, '#ffffff');
  }
  if (Math.random() < 0.55) spawn({ x: rnd(10, 150), y: -3, vy: rnd(9, 18), vx: rnd(-4, 4), g: 6, decay: .28, type: 'sq', s: 2, c: CONF_COLORS[(Math.random() * 6) | 0] });
  if (Math.random() < 0.35) spawn({ x: rnd(20, 140), y: -3, vy: rnd(7, 13), vx: rnd(-3, 3), g: 4, decay: .28, c: HEART_COLORS[(Math.random() * 4) | 0] });
}

/* ============================================================
   6) מנוע הסצנות
   ============================================================ */
const SCENES = [
  { title: 'נדנדה בפארק',        dur: 9,  fn: sceneSwing },
  { title: 'משחק תופסת',         dur: 8,  fn: sceneChase },
  { title: 'שתייה אחת, שני קשים', dur: 9,  fn: sceneDrink },
  { title: 'סופרים כוכבים',      dur: 10, fn: sceneStars },
  { title: 'חגיגת ניצחון!',       dur: 8,  fn: sceneParty },
];
const FADE = 0.45;
let sceneIdx = 0, sceneT = 0;

const dotsBox = document.getElementById('sceneDots');
SCENES.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', s.title);
  b.addEventListener('click', () => goToScene(i));
  dotsBox.appendChild(b);
});

function goToScene(i) {
  sceneIdx = ((i % SCENES.length) + SCENES.length) % SCENES.length;
  sceneT = 0; PARTS = []; shoot = null; shootT = rnd(1, 4);
  document.getElementById('sceneTitle').textContent = SCENES[sceneIdx].title;
  [...dotsBox.children].forEach((d, k) => d.setAttribute('aria-selected', k === sceneIdx ? 'true' : 'false'));
}
cvS.addEventListener('click', () => goToScene(sceneIdx + 1));
goToScene(finished ? 4 : 0);   // אם כבר השתחררנו — ישר לסצנת החגיגה

function sceneStep(dt) {
  const s = SCENES[sceneIdx];
  sceneT += dt;
  if (sceneT > s.dur && !finished) { goToScene(sceneIdx + 1); return sceneStep(0); }
  sx2.clearRect(0, 0, SW, SH);
  SCENES[sceneIdx].fn(sceneT, dt);
  stepParts(dt); drawParts();
  // מעבר רך בין סצנות
  let a = 0;
  if (sceneT < FADE) a = 1 - sceneT / FADE;
  else if (!finished && sceneT > s.dur - FADE) a = (sceneT - (s.dur - FADE)) / FADE;
  if (a > 0.01) { sx2.fillStyle = `rgba(13,6,24,${clamp(a, 0, 1)})`; sx2.fillRect(0, 0, SW, SH); }
}

/* ============================================================
   7) לולאת האנימציה הראשית
   ============================================================ */
let lastTs = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTs) / 1000);
  lastTs = now;
  HG.update(dt); HG.draw();
  sceneStep(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
