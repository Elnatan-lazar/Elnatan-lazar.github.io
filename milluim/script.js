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
  const ghosts = [];            // לבבות שעפים למעלה כשהשעון מתאפס
  let total = 0;                // כמה לבבות נאספו בסך הכול (לא מתאפס)
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
    total++;
    return true;
  }

  /* כשהשעון מתמלא בלבבות — כולם עפים למעלה והערימה מתחילה מחדש */
  function resetPile() {
    for (const h of hearts) ghosts.push({ x: h.x, y: h.y, vy: -(5 + Math.random() * 12), life: 1 + Math.random() * .8, tone: h.tone });
    hearts.length = 0;
    heights.fill(0);
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
      grains.push({ x: CX - 1 + (Math.random() < .5 ? 0 : 1), y: 45, vy: 26 });
    }
    for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      g.vy += 48 * dt;
      g.y += g.vy * dt;
      const col = clamp(Math.round((g.x - COL_X0) / CELL), 0, COLS - 1);
      const landY = cellY(heights[col]) - 1;
      if (g.y >= Math.min(landY, BOT_Y1 - 2)) {
        grains.splice(i, 1);
        addHeart(col, true);
        if (hearts.length >= capacity) resetPile();     // התמלא — מתחילים סיבוב חדש
      }
    }
    for (let i = ghosts.length - 1; i >= 0; i--) {
      const g = ghosts[i];
      g.life -= dt * 1.1; g.y += (g.vy || -3) * dt; g.x += Math.sin(g.y * .4) * dt * 4;
      if (g.life <= 0) ghosts.splice(i, 1);
    }
    for (const h of hearts) if (h.pop < 1) h.pop = Math.min(1, h.pop + dt * 5);
    el.heartCount.textContent = total;
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
    for (const g of ghosts) { ctx.globalAlpha = clamp(g.life, 0, 1); heart3(g.x, g.y, g.tone || '#ff7a93', 1); ctx.globalAlpha = 1; }

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
  f: { skin:'#f7cfa6', sh:'#e0ad81', hair:'#a8763f', hair2:'#c9974f', hair3:'#e6c176', band:'#3fa9d6',
       shorts:'#2f2440', shoe:'#3a2a3a', eye:'#4a3018', lash:'#39230c', mouth:'#d2687a' },
};
const SH_R = '#d8262c', SH_K = '#171717', SH_W = '#f0f0f0';

/* חולצת פלמנגו — פסים אדום־שחור */
function torso(x, b, lean, belly) {
  const rows = [SH_K, SH_K, SH_R, SH_R, SH_K, SH_K, SH_R, SH_R];
  for (let i = 0; i < 8; i++) {
    const w = belly ? [0, 0, 0, 1, 2, 2, 2, 1][i] : 0;     // בטן הריון
    q(x - 4 - w + lean, b - 19 + i, 8 + w * 2, 1, rows[i]);
  }
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
  q(X - 3, b - 27, 2, 1, c.hair); q(X + 2, b - 27, 2, 1, c.hair);    // גבות
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
  q(X - 7, b - 29, 3, 18, c.hair); q(X + 4, b - 29, 3, 18, c.hair);    // קווצות ארוכות
  q(X - 8, b - 24, 1, 9, c.hair);  q(X + 7, b - 22, 1, 9, c.hair);     // גלים בקצוות
  q(X - 7, b - 22, 1, 6, c.hair2); q(X + 6, b - 20, 1, 6, c.hair2);    // הדגשות בהירות
  q(X - 6, b - 14, 3, 3, c.hair2); q(X + 4, b - 13, 3, 3, c.hair2);
  q(X - 7, b - 12, 3, 2, c.hair3); q(X + 4, b - 11, 3, 2, c.hair3);    // קצוות מוזהבים
}
function headF(x, b, mood, lean) {
  const c = PAL.f, X = x + lean;
  q(X - 4, b - 28, 8, 8, c.skin);                                      // פנים
  q(X - 6, b - 32, 12, 4, c.hair);                                     // שיער עליון
  q(X - 6, b - 29, 2, 4, c.hair); q(X + 4, b - 29, 2, 4, c.hair);      // מסגור הפנים
  q(X - 5, b - 33, 5, 1, c.hair2); q(X + 1, b - 33, 4, 1, c.hair3);
  q(X - 1, b - 32, 2, 2, c.hair2);                                     // פסוקת
  q(X - 3, b - 27, 2, 1, c.hair); q(X + 2, b - 27, 2, 1, c.hair);      // גבות
  q(X - 4, b - 26, 1, 1, c.lash); q(X + 3, b - 26, 1, 1, c.lash);      // ריסים
  q(X - 3, b - 26, 1, 1, c.eye);  q(X + 2, b - 26, 1, 1, c.eye);       // עיניים
  q(X - 5, b - 24, 1, 2, '#f4f4f4'); q(X + 4, b - 24, 1, 2, '#f4f4f4'); // עגילים
  q(X - 4, b - 24, 1, 1, '#f4a7b4'); q(X + 3, b - 24, 1, 1, '#f4a7b4'); // סומק
  q(X, b - 24, 1, 1, '#fff6d8');                                       // נזם באף
  q(X - 2, b - 23, 4, 1, c.mouth);
  if (mood !== 'calm') q(X - 1, b - 23, 2, 1, '#ffffff');
  q(X - 1, b - 20, 2, 1, c.sh);                                        // צוואר
  q(X - 3, b - 19, 6, 1, '#2e6b6b'); q(X, b - 18, 1, 1, '#8fe0e0');    // שרשרת
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
  torso(x, b, lean, o.belly);
  if (who === 'm') headM(x, b, mood, lean); else headF(x, b, mood, lean);
}

/* דמות שוכבת על הגב (סצנת הכוכבים) — הראש משמאל, הגוף מימין */
function lying(o) {
  const who = o.who, c = PAL[who], x = o.x, b = o.base;
  // שיער מאחורי הראש
  if (who === 'f') { q(x - 13, b - 7, 9, 6, c.hair); q(x - 6, b - 11, 11, 3, c.hair); q(x - 11, b - 9, 6, 2, c.hair2); q(x - 12, b - 4, 7, 2, c.hair3); }
  else { q(x - 7, b - 11, 11, 3, c.hair); q(x - 8, b - 9, 2, 7, c.hair); q(x - 5, b - 12, 4, 1, c.hair2); }
  // גוף בפסים
  for (let i = 0; i < 6; i++) q(x + 4 + i * 2, b - 8, 2, 8, (i % 2 === 0) ? SH_K : SH_R);
  q(x + 8, b - 6, 2, 2, SH_W);
  if (o.belly) { q(x + 9, b - 11, 8, 4, SH_R); q(x + 10, b - 12, 6, 1, SH_R); }
  // מכנסיים, רגליים ונעליים
  q(x + 16, b - 8, 7, 8, c.shorts);
  q(x + 23, b - 8, 8, 3, c.skin); q(x + 23, b - 4, 8, 3, c.sh);
  q(x + 30, b - 9, 3, 3, c.shoe); q(x + 30, b - 4, 3, 3, c.shoe);
  // ראש (פרופיל, מביט למעלה)
  q(x - 4, b - 9, 8, 9, c.skin);
  if (who === 'm') { q(x - 5, b - 7, 1, 6, c.beard); q(x - 4, b - 3, 6, 3, c.beard); q(x - 6, b - 9, 3, 3, c.hair); }
  else { q(x - 5, b - 10, 10, 2, c.hair2); q(x - 2, b - 11, 5, 1, c.hair3); q(x + 3, b - 3, 1, 1, '#f2a0ad'); }
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
  const hx = 71 + push * 5;
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


/* --- 6. ספגטי לשניים --- */
function sceneSpaghetti(t) {
  room('#52203c', '#451a32', '#3a2430');
  q(18, 26, 18, 14, '#8a5a2b'); q(20, 28, 14, 10, '#c94f6d'); q(24, 31, 6, 4, '#ffd8e8');
  q(118, 24, 20, 16, '#8a5a2b'); q(120, 26, 16, 12, '#f2d79b'); q(124, 30, 8, 4, '#c94f6d');
  chairP(58, 64, 1); chairP(102, 64, -1);
  person({ who: 'm', x: 58, base: 75, pose: 'sit', armR: 'out', armL: 'down', mood: 'calm' });
  person({ who: 'f', x: 102, base: 75, pose: 'sit', armL: 'out', armR: 'down', mood: 'calm' });
  for (let i = 0; i <= 22; i++) {                       // אטרייה אחת משותפת
    const k = i / 22, xx = 61 + k * 38, yy = 52 + Math.sin(k * Math.PI) * 7 + Math.sin(t * 3 + k * 7) * .8;
    q(xx, yy, 2, 1, '#f2d79b');
  }
  tableP(80, 60, 52);
  q(71, 55, 18, 5, '#ffffff'); q(72, 53, 16, 3, '#f2d79b'); q(76, 52, 8, 2, '#d8262c');
  q(62, 52, 2, 8, '#fff6d8'); q(62, 49, 2, 3, '#ff9d2e');
  if (Math.random() < .06) spawn({ x: 80 + rnd(-8, 8), y: 46, vy: -7, decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 4, 54, 40, '🍝❤️'); sayAt(t, 4.4, 7.8, 108, 40, '😙💕');
}

/* --- 7. מאמצים כלב --- */
function sceneDog(t) {
  skyDay(); sun(132, 16); cloud(24 + t * 3, 14, 1, '#ffffff'); cloud(96 + t * 2, 24, 1, '#eef9ff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  for (const f of FLOWERS) q(f.x, f.y, 2, 2, f.c);
  const dx = 80 + Math.sin(t * 2.1) * 13, hop = Math.abs(Math.sin(t * 4.2)) * 5;
  person({ who: 'm', x: 56, base: GY, armRTo: [dx - 8, GY - 12], armL: 'down' });
  person({ who: 'f', x: 106, base: GY, armLTo: [dx + 8, GY - 14], armR: 'down' });
  dogP(dx, GY - hop, t, Math.cos(t * 2.1) < 0);
  if (Math.random() < .12) spawn({ x: dx + rnd(-6, 6), y: GY - 20, vy: -8, vx: rnd(-3, 3), decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 4, 52, GY - 38, '🐶🥹'); sayAt(t, 4.4, 7.8, 110, GY - 38, '🏠🐾');
}

/* --- 8. ערב קולנוע --- */
function sceneCinema(t) {
  q(0, 0, 160, 90, '#100a1c');
  const mv = ['#2f4f9a', '#6a3f9a', '#1f6a7a', '#8a3f6a'][Math.floor(t / 2) % 4];
  q(12, 5, 136, 42, '#2a2238'); q(15, 8, 130, 36, mv);
  q(15, 8, 130, 8, 'rgba(255,255,255,.12)'); q(15, 38, 130, 6, 'rgba(0,0,0,.22)');
  heartPix(70, 16, 4, 'rgba(255,255,255,.85)');
  q(30, 24, 10, 20, 'rgba(0,0,0,.35)'); q(28, 20, 14, 6, 'rgba(0,0,0,.35)');
  q(120, 24, 10, 20, 'rgba(0,0,0,.35)'); q(118, 20, 14, 6, 'rgba(0,0,0,.35)');
  q(0, 47, 160, 43, '#140d22');
  sx2.globalAlpha = .1; q(16, 47, 128, 26, '#9fc8ff'); sx2.globalAlpha = 1;
  person({ who: 'm', x: 62, base: 75, pose: 'sit', armR: 'out', armL: 'down', mood: 'calm' });
  person({ who: 'f', x: 94, base: 75, pose: 'sit', armL: 'out', armR: 'down', mood: 'calm' });
  popcornP(78, 56);
  q(0, 68, 160, 12, '#2e2340'); q(0, 68, 160, 1, '#3e3050');
  q(0, 82, 160, 8, '#241a33');
  sayAt(t, 1.2, 4, 58, 40, '🍿😂'); sayAt(t, 4.4, 7.8, 98, 40, '🤫❤️');
}

/* --- 9. פיצה מול הטלוויזיה --- */
function scenePizza(t) {
  room('#2b2340', '#231c36', '#3b2b30');
  tvP(30, 26, ['#3a6fb0', '#b05a7a', '#4aa07a'][Math.floor(t * 1.5) % 3]);
  sx2.globalAlpha = .1; q(48, 22, 58, 50, '#9fc8ff'); sx2.globalAlpha = 1;
  couchP(98, 54);
  person({ who: 'm', x: 84, base: 75, pose: 'sit', armR: 'out', armL: 'down', mood: 'calm' });
  person({ who: 'f', x: 110, base: 75, pose: 'sit', armL: 'out', armR: 'down', mood: 'calm' });
  q(92, 57, 14, 4, '#c8a05a'); q(93, 55, 12, 3, '#e05a2a'); q(95, 54, 2, 2, '#c22222'); q(100, 54, 2, 2, '#c22222');
  sayAt(t, 1.2, 4, 80, 38, '🍕😋'); sayAt(t, 4.4, 7.8, 114, 38, '📺🥰');
}

/* --- 10. ריקוד במטבח --- */
function sceneDance(t) {
  room('#ecdfc8', '#dccdb0', '#8a6a4a');
  q(4, 38, 44, 8, '#b98a5a'); q(4, 46, 44, 5, '#a87a4a');
  q(122, 34, 26, 42, '#dfe4e8'); q(124, 36, 22, 18, '#ccd2d6'); q(133, 55, 2, 7, '#8a8a8a');
  q(8, 28, 14, 3, '#c94f6d'); q(13, 22, 4, 6, '#3f9a5a'); q(12, 20, 6, 3, '#4fb85f');
  const st = Math.floor(t * 4) % 2;
  person({ who: 'm', x: 66, base: GY, leg: st ? 1 : 2, armL: st ? 'up' : 'out', armR: st ? 'out' : 'up', mood: 'big', lean: st ? 1 : -1 });
  person({ who: 'f', x: 98, base: GY, leg: st ? 2 : 1, armL: st ? 'out' : 'up', armR: st ? 'up' : 'out', mood: 'big', lean: st ? -1 : 1 });
  if (Math.random() < .25) spawn({ x: rnd(58, 104), y: rnd(40, 52), vy: -7, vx: rnd(-4, 4), decay: .6, type: 'sq', s: 2, c: ['#ffd166', '#ff7aa2', '#8bf08b'][(Math.random() * 3) | 0] });
  sayAt(t, 1.2, 4, 62, 34, '🎶💃'); sayAt(t, 4.4, 7.8, 102, 34, '🕺❤️');
}

/* --- 11. ארוחת בוקר במיטה --- */
function sceneBreakfast(t) {
  room('#3c2c54', '#33254c', '#4c3652');
  q(100, 18, 24, 16, '#8a5a2b'); q(102, 20, 20, 12, '#ffd8e8'); q(108, 24, 8, 5, '#c94f6d');
  bedP(102, 58, 62);
  lying({ who: 'f', x: 84, base: 71 });
  q(100, 62, 32, 9, '#b8425e'); q(100, 62, 32, 1, '#d4607c');
  person({ who: 'm', x: 34, base: GY, armR: 'out', armL: 'out', mood: 'big' });
  q(40, 56, 17, 3, '#a97544'); q(42, 51, 5, 5, '#ffffff'); q(43, 50, 3, 1, '#c8a05a'); q(49, 52, 6, 4, '#e8b45a');
  if (Math.random() < .08) spawn({ x: 44, y: 49, vy: -6, vx: rnd(-1, 1), decay: 1.2, type: 'sq', s: 1, c: '#ffffff' });
  sayAt(t, 1.2, 4, 32, 36, '☕🥐'); sayAt(t, 4.4, 7.8, 92, 44, '🥰');
}

/* --- 12. שקיעה על החוף --- */
function sceneBeach(t) {
  band(['#2b2a6b', '#5b3a80', '#a44a80', '#e0705f', '#ffa05a', '#ffd9a0'], 0, 48);
  discP(79, 44, 9, '#fff0a8'); discP(79, 44, 6, '#fffbe0');
  q(0, 48, 160, 16, '#2a6a8a'); q(0, 48, 160, 2, '#3f8aa8');
  q(72, 48, 6, 16, 'rgba(255,240,168,.45)');
  for (let i = 0; i < 14; i++) q(((i * 19 + Math.sin(t + i) * 5) % 170 + 170) % 170 - 5, 50 + (i % 5) * 3, 7, 1, 'rgba(255,255,255,.45)');
  q(0, 62, 160, 4, '#f2e3c8'); q(0, 64, 160, 26, '#e6d3a6');
  q(138, 18, 4, 46, '#6b4226');
  for (let i = 0; i < 4; i++) { q(126 + i * 5, 16 + (i % 2) * 3, 14, 3, '#2f7d3a'); q(128 + i * 4, 13 + (i % 2) * 2, 10, 2, '#41a04b'); }
  seagull(24, 14); seagull(42, 20); seagull(108, 11);
  person({ who: 'm', x: 62, base: 78, armRTo: [78, 61], armL: 'down' });
  person({ who: 'f', x: 96, base: 78, armLTo: [80, 61], armR: 'down' });
  if (Math.random() < .07) spawn({ x: 79 + rnd(-4, 4), y: 56, vy: -7, decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 4, 56, 42, '🌅🥰'); sayAt(t, 4.4, 7.8, 102, 42, '🌊👣');
}

/* --- 13. מטרייה אחת בגשם --- */
function sceneRain(t) {
  band(['#3a4156', '#454d66', '#525c7a', '#5f6b8e', '#6d7aa2', '#7b8ab4'], 0, GY);
  hills('#3a5648', '#465f4e');
  q(0, GY, 160, 14, '#4a5a4a'); q(0, GY, 160, 2, '#5a6a56');
  for (let i = 0; i < 70; i++) { const xx = (i * 37 + t * 70) % 172 - 6, yy = (i * 29 + t * 240) % 92; q(xx, yy, 1, 4, 'rgba(190,215,255,.6)'); }
  q(18, GY + 7, 16, 2, '#6d7a86'); q(116, GY + 10, 20, 2, '#6d7a86');
  person({ who: 'm', x: 72, base: GY, armR: 'up', armL: 'down' });
  person({ who: 'f', x: 90, base: GY, armL: 'hug', armR: 'down' });
  umbrellaP(80, 26, '#d8262c');
  sayAt(t, 1.2, 4, 34, 48, '☔😘'); sayAt(t, 4.4, 7.8, 126, 48, '❤️🌧️');
}

/* --- 14. מדורה וקמפינג --- */
function sceneCamp(t) {
  skyNight();
  for (const s of STARS) { sx2.globalAlpha = .45 + .45 * Math.sin(t * 2 + s.ph); q(s.x, s.y, 1, 1, '#cfe0ff'); }
  sx2.globalAlpha = 1; moon(22, 13);
  q(0, GY - 8, 160, 30, '#16332a'); q(0, GY - 8, 160, 2, '#1f4636');
  for (let i = 0; i <= 18; i++) { q(126 - i, GY - 4 - i * 1.25, 1, i * 1.25 + 4, '#c94f6d'); q(126 + i, GY - 4 - i * 1.25, 1, i * 1.25 + 4, '#a63a54'); }
  q(124, GY - 14, 5, 14, '#5a2030');
  q(30, 68, 28, 4, '#6b4226'); q(94, 68, 28, 4, '#6b4226');
  person({ who: 'm', x: 43, base: 79, pose: 'sit', armRTo: [56, 58], armL: 'down', mood: 'calm' });
  person({ who: 'f', x: 107, base: 79, pose: 'sit', armLTo: [94, 58], armR: 'down', mood: 'calm' });
  limb(56, 58, 68, 63, '#6b4226', 1); limb(94, 58, 82, 63, '#6b4226', 1);   // מקלות
  q(67, 61, 4, 4, '#fff6e0'); q(80, 61, 4, 4, '#f2d79b');                   // מרשמלו
  fireP(75, 76, t);
  if (Math.random() < .3) spawn({ x: 74 + rnd(-3, 3), y: 62, vy: rnd(-10, -5), vx: rnd(-2, 2), decay: 1.1, type: 'sq', s: 1, c: ['#ff9d2e', '#ffd166'][(Math.random() * 2) | 0] });
  sayAt(t, 1.2, 4, 34, 44, '🔥🍫'); sayAt(t, 4.4, 7.8, 118, 44, '🌰😋');
}

/* --- 15. מי מנצח במשחק? --- */
function sceneGame(t) {
  room('#241d38', '#1d1730', '#3b2b30');
  tvP(30, 26, ['#2a4a8a', '#8a2a4a'][Math.floor(t * 3) % 2]);
  q(22, 33, 8, 6, '#ffd166'); q(34, 36, 6, 5, '#8bf08b');
  sx2.globalAlpha = .1; q(48, 22, 58, 50, '#9fc8ff'); sx2.globalAlpha = 1;
  couchP(98, 54);
  const sh = (Math.floor(t * 6) % 2);
  person({ who: 'm', x: 84, base: 75, pose: 'sit', armR: 'out', armL: 'out', mood: 'calm', lean: sh ? 1 : 0 });
  person({ who: 'f', x: 110, base: 75, pose: 'sit', armL: 'out', armR: 'out', mood: 'big', lean: sh ? -1 : 0 });
  q(75, 57, 8, 3, '#2a2a3a'); q(101, 57, 8, 3, '#2a2a3a');
  if (t > 4.6) { q(107, 36, 7, 4, '#ffd166'); q(106, 35, 9, 1, '#ffd166'); q(109, 33, 1, 2, '#fff6c9'); }
  sayAt(t, 1.2, 4.2, 80, 38, '🎮😤'); sayAt(t, 4.6, 7.8, 114, 38, '🏆😎');
}

/* --- 16. סלפי --- */
function sceneSelfie(t) {
  skyDay(); sun(136, 14); cloud(30 + t * 3, 16, 1, '#ffffff'); cloud(100 + t * 2, 26, 1, '#eef9ff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  for (const f of FLOWERS) q(f.x, f.y, 2, 2, f.c);
  tree(22);
  person({ who: 'm', x: 78, base: GY, armLTo: [58, 44], armR: 'hug' });
  person({ who: 'f', x: 94, base: GY, armL: 'hug', armR: 'down', lean: -1 });
  q(53, 39, 8, 12, '#2a2a3a'); q(54, 40, 6, 10, '#9fdcf0'); q(55, 42, 3, 2, '#ffffff');
  if ((t % 3) < .12) { sx2.globalAlpha = .5; q(0, 0, 160, 90, '#ffffff'); sx2.globalAlpha = 1; }
  sayAt(t, 1.2, 4.2, 74, 34, '📸😁'); sayAt(t, 4.6, 7.8, 108, 34, '❤️🥰');
}

/* --- 17. אופניים ביחד --- */
function sceneBike(t) {
  skyDay(); sun(24, 14); cloud(60 + t * 4, 14, 1, '#ffffff'); cloud(120 + t * 3, 24, 1, '#eef9ff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  const bx = 80 + Math.sin(t * .7) * 24, d = Math.cos(t * .7) >= 0 ? 1 : -1;
  wheelP(bx - 18, 69, 7, t * d); wheelP(bx + 18, 69, 7, t * d);
  limb(bx - 18, 69, bx - 4, 58, '#d8262c', 2); limb(bx + 18, 69, bx + 4, 58, '#d8262c', 2);
  q(bx - 20, 57, 40, 2, '#d8262c');
  person({ who: 'm', x: bx - 12, base: 69, pose: 'sit', armR: 'out', armL: 'out', mood: 'big' });
  person({ who: 'f', x: bx + 12, base: 69, pose: 'sit', armL: 'out', armR: 'out', mood: 'big' });
  for (let i = 0; i < 4; i++) q(bx - d * (30 + i * 7), 48 + i * 4, 6, 1, 'rgba(255,255,255,.55)');
  sayAt(t, 1.2, 4.2, bx - 20, 30, '🚲😄'); sayAt(t, 4.6, 7.8, bx + 20, 30, '💨❤️');
}

/* --- 18. מבשלים (וקצת קמח) --- */
function sceneCook(t) {
  room('#ecdfc8', '#dccdb0', '#8a6a4a');
  q(0, 36, 34, 8, '#b98a5a'); q(0, 44, 34, 6, '#a87a4a');
  q(126, 36, 34, 8, '#b98a5a'); q(126, 44, 34, 6, '#a87a4a');
  const st = Math.floor(t * 5) % 2;
  person({ who: 'm', x: 62, base: GY, armR: 'out', armL: st ? 'up' : 'mid', mood: 'big' });
  person({ who: 'f', x: 98, base: GY, armL: 'out', armR: st ? 'mid' : 'up', mood: 'big' });
  q(0, 64, 160, 4, '#d8cbb0'); q(0, 64, 160, 1, '#eae0cc'); q(0, 68, 160, 8, '#a87a4a');
  for (let i = 12; i < 160; i += 26) q(i, 70, 3, 1, '#6b4226');
  q(72, 59, 16, 5, '#e8eef0'); q(73, 58, 14, 2, '#f6f6f6');
  q(52, 60, 6, 4, '#d8262c'); q(104, 59, 7, 5, '#3f9a5a'); q(106, 57, 3, 2, '#2f7d3a');
  if (Math.random() < .45) spawn({ x: rnd(64, 96), y: rnd(44, 54), vy: rnd(-10, -3), vx: rnd(-8, 8), g: 5, decay: .8, type: 'sq', s: 2, c: '#ffffff' });
  sayAt(t, 1.2, 4.2, 56, 34, '🥘😅'); sayAt(t, 4.6, 7.8, 104, 34, '🤍💥');
}

/* --- 19. לילה טוב --- */
function sceneNight2(t) {
  q(0, 0, 160, 90, '#161028');
  q(108, 12, 36, 30, '#241c42'); q(110, 14, 32, 26, '#2e2a58');
  q(126, 18, 8, 8, '#f2f0d8'); q(114, 30, 2, 2, '#cfe0ff'); q(136, 28, 2, 2, '#cfe0ff');
  q(12, 42, 14, 4, '#8a5a2b'); q(16, 36, 6, 6, '#ffd166');
  sx2.globalAlpha = .12; q(2, 28, 34, 32, '#ffd166'); sx2.globalAlpha = 1;
  q(22, 52, 96, 5, '#6b4226'); q(22, 57, 96, 7, '#efe6f2');
  q(32, 54, 18, 7, '#ffffff'); q(58, 54, 18, 7, '#ffffff');
  headM(41, 82, 'calm', 0); headF(67, 82, 'big', 0);
  q(20, 64, 100, 15, '#7a2a4a'); q(20, 64, 100, 1, '#963a5e'); q(20, 70, 100, 1, '#6a2440');
  q(20, 79, 100, 4, '#5a1e38');
  if (Math.random() < .25) spawn({ x: rnd(38, 74), y: 48, vy: -7, vx: rnd(-2, 2), decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 4.4, 32, 40, '🍆🍑😏'); sayAt(t, 4.8, 8, 84, 40, '😏🔥');
}

/* --- 20. יש שני פסים! --- */
function scenePregTest(t) {
  room('#cfe6ea', '#bcd8de', '#9fb8be');
  q(14, 28, 30, 22, '#eef6f8'); q(16, 30, 26, 18, '#bcd8de');
  q(16, 56, 26, 8, '#ffffff'); q(27, 64, 4, 8, '#dfe8ea');
  q(120, 26, 26, 32, '#e8f0f2'); q(122, 28, 22, 28, '#d0e0e4');
  const sh = t > 3.6 ? (Math.floor(t * 8) % 2) : 0;
  person({ who: 'm', x: 64, base: GY, armR: 'out', armL: 'down', mood: 'big', lean: sh });
  person({ who: 'f', x: 96, base: GY, armL: 'out', armR: 'down', mood: 'big', lean: -sh });
  q(78, 54, 5, 13, '#ffffff'); q(79, 57, 3, 2, '#ff4d7e'); q(79, 61, 3, 2, '#ff4d7e');
  if (t > 3.6 && Math.random() < .5) spawn({ x: 80 + rnd(-10, 10), y: 50, vy: rnd(-12, -6), vx: rnd(-5, 5), decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 3.4, 58, 36, '😳❓'); sayAt(t, 3.8, 8, 100, 36, '🤰❤️');
}

/* --- 21. אולטרסאונד --- */
function sceneScan(t) {
  room('#dbe8f0', '#c9d8e4', '#8a9aa4');
  q(104, 22, 44, 34, '#2a3a4a'); q(107, 25, 38, 26, '#12202c');
  for (let i = 0; i < 12; i++) q(112 + i, 38 - i * .5, 2, 10 + i * .6, 'rgba(160,210,240,.18)');
  q(120, 32, 9, 9, '#9fd0e8'); q(127, 37, 7, 8, '#9fd0e8'); q(122, 35, 1, 1, '#12202c'); q(131, 44, 4, 3, '#9fd0e8');
  const bt = 3 + Math.sin(t * 5) * .8;
  heartS(138, 28, '#ff4d7e'); q(138, 26, bt, 1, 'rgba(255,77,126,.35)');
  q(36, 60, 74, 5, '#eef4f6'); q(38, 65, 4, 11, '#8a9aa4'); q(102, 65, 4, 11, '#8a9aa4');
  lying({ who: 'f', x: 52, base: 60, belly: true });
  person({ who: 'm', x: 24, base: GY, armRTo: [42, 56], armL: 'down', mood: 'calm' });
  if (Math.random() < .08) spawn({ x: rnd(50, 90), y: 48, vy: -6, decay: .5, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 4.4, 24, 36, '👶💓'); sayAt(t, 4.8, 8, 72, 40, '🥹❤️');
}

/* --- 22. חשקים של הריון --- */
function sceneCraving(t) {
  room('#241d38', '#1d1730', '#3b2b30');
  q(12, 28, 30, 48, '#dfe4e8'); q(14, 30, 26, 22, '#f2f6f8');
  sx2.globalAlpha = .22; q(42, 28, 28, 48, '#ffe38a'); sx2.globalAlpha = 1;
  q(16, 34, 10, 4, '#8bf08b'); q(28, 36, 8, 4, '#ff7aa2'); q(18, 42, 12, 5, '#9fdcf0');
  person({ who: 'f', x: 80, base: GY, belly: true, armR: 'out', armL: 'out', mood: 'big' });
  q(88, 55, 3, 8, '#3f9a5a'); q(69, 54, 6, 5, '#fff0d8'); q(70, 59, 4, 4, '#e8b45a');
  person({ who: 'm', x: 120, base: GY, armL: 'up', armR: 'down', mood: 'calm' });
  sayAt(t, 1.2, 4.4, 76, 34, '🥒🍦🤤'); sayAt(t, 4.8, 8, 126, 34, '😴😅');
}

/* --- 23. הבעיטה הראשונה --- */
function sceneKick(t) {
  room('#2b2340', '#231c36', '#3b2b30');
  q(16, 22, 26, 18, '#8a5a2b'); q(18, 24, 22, 14, '#ffd8e8'); q(24, 28, 10, 6, '#c94f6d');
  couchP(88, 62);
  person({ who: 'f', x: 100, base: 75, pose: 'sit', belly: true, mood: 'big' });
  person({ who: 'm', x: 72, base: 75, pose: 'sit', armRTo: [92, 61], armL: 'down', mood: 'big', lean: 1 });
  const kick = (t % 3) < .55;
  if (kick) { q(95, 57, 3, 4, '#fff0d8'); q(94, 56, 1, 1, '#fff0d8'); q(97, 56, 1, 1, '#fff0d8'); }
  if (kick && Math.random() < .4) spawn({ x: 96 + rnd(-4, 4), y: 52, vy: -8, decay: .6, c: HEART_COLORS[(Math.random() * 4) | 0] });
  sayAt(t, 1.2, 4.4, 66, 38, '👣😳'); sayAt(t, 4.8, 8, 108, 38, '🥹❤️');
}

/* --- 24. צובעים את חדר התינוק --- */
function sceneNursery(t) {
  room('#e4ecf4', '#d4dce8', '#a87a4a');
  q(0, 0, 76, GY, '#bfe4f2');
  for (let i = 0; i < 6; i++) q(4 + i * 12, 12 + (i % 2) * 8, 6, 4, '#ffffff');
  cribP(114, 46);
  const roll = 34 + Math.sin(t * 2.4) * 12;
  person({ who: 'm', x: 58, base: GY, armLTo: [76, roll], armR: 'down', mood: 'big' });
  q(74, roll - 2, 9, 5, '#c8ccd0'); q(76, roll - 1, 7, 3, '#bfe4f2');
  person({ who: 'f', x: 92, base: GY, armRTo: [104, 42], mood: 'big' });
  q(101, 38, 9, 8, '#c98a42'); q(103, 35, 5, 3, '#c98a42'); q(103, 40, 1, 1, '#2b1d16'); q(107, 40, 1, 1, '#2b1d16');
  q(22, 68, 11, 8, '#c8ccd0'); q(23, 67, 9, 2, '#bfe4f2');
  if (Math.random() < .12) spawn({ x: rnd(20, 76), y: rnd(30, 60), vy: rnd(-4, 2), vx: rnd(-3, 3), g: 6, decay: 1.1, type: 'sq', s: 1, c: '#bfe4f2' });
  sayAt(t, 1.2, 4.4, 46, 34, '🎨🐻'); sayAt(t, 4.8, 8, 98, 34, '👶🏠');
}

/* --- 25. חגיגת גילוי המין --- */
function sceneReveal(t) {
  skyDay(); sun(22, 14); cloud(70 + t * 3, 14, 1, '#ffffff');
  hills('#2f7d3a', '#3f9346'); grassDay();
  for (const f of FLOWERS) q(f.x, f.y, 2, 2, f.c);
  balloonP(20, 22 + Math.sin(t * 1.6) * 3, '#ff7aa2'); balloonP(34, 16 + Math.sin(t * 1.9 + 1) * 3, '#9fd0f0');
  balloonP(126, 18 + Math.sin(t * 1.7 + 2) * 3, '#ff7aa2'); balloonP(140, 24 + Math.sin(t * 2 + .5) * 3, '#9fd0f0');
  q(74, 64, 14, 12, '#f2e3c8'); q(74, 62, 14, 3, '#c94f6d'); q(80, 62, 2, 14, '#c94f6d');
  const pop = t > 2.4;
  if (pop && Math.random() < .9) spawn({ x: 81 + rnd(-3, 3), y: 60, vy: rnd(-26, -12), vx: rnd(-9, 9), g: 14, decay: .35, type: 'sq', s: 2, c: (Math.random() < .5 ? '#ff7aa2' : '#9fd0f0') });
  const j = pop ? Math.abs(Math.sin(t * 3)) * 6 : 0;
  person({ who: 'm', x: 50, base: GY - j, leg: j > 2 ? 2 : 0, armL: 'up', armR: 'up', mood: 'big' });
  person({ who: 'f', x: 112, base: GY - j, belly: true, leg: j > 2 ? 2 : 0, armL: 'up', armR: 'up', mood: 'big' });
  sayAt(t, 1, 2.4, 46, GY - 42, '🎁❓'); sayAt(t, 2.8, 8, 46, GY - 42, '🎉😍'); sayAt(t, 2.8, 8, 116, GY - 42, '💙💗');
}

/* ============================================================
   5א) בועות דיבור באימוג'י + אביזרים לסצנות
   ============================================================ */
const EMOJI_FONT = '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji","Twemoji Mozilla",sans-serif';

function say(x, y, txt, size) {
  size = size || 9;
  sx2.font = size + 'px ' + EMOJI_FONT;
  sx2.textAlign = 'center'; sx2.textBaseline = 'middle';
  const w = Math.round(sx2.measureText(txt).width) + 7, h = size + 6;
  const bx = clamp(Math.round(x - w / 2), 2, SW - w - 2), by = Math.round(y - h);
  q(bx, by, w, h, '#fffaf0');
  q(bx + 1, by - 1, w - 2, 1, '#fffaf0'); q(bx + 1, by + h, w - 2, 1, '#fffaf0');
  q(bx - 1, by + 1, 1, h - 2, '#fffaf0'); q(bx + w, by + 1, 1, h - 2, '#fffaf0');
  q(bx + (w >> 1) - 1, by + h + 1, 3, 1, '#fffaf0'); q(bx + (w >> 1), by + h + 2, 2, 1, '#fffaf0');
  sx2.fillStyle = '#20122e';
  sx2.fillText(txt, bx + w / 2, by + h / 2 + 0.5);
}
/* מציג בועה רק בחלון זמן מסוים בתוך הסצנה */
function sayAt(t, t0, t1, x, y, txt, size) { if (t >= t0 && t < t1) say(x, y, txt, size); }

function room(wall, wall2, floor) {
  q(0, 0, 160, GY, wall);
  for (let y = 4; y < GY; y += 9) q(0, y, 160, 1, wall2);
  q(0, GY - 3, 160, 3, wall2);
  q(0, GY, 160, 90 - GY, floor);
  for (let x = 0; x < 160; x += 12) q(x, GY, 1, 14, 'rgba(0,0,0,.14)');
}
function tableP(cx, top, w) {
  q(cx - w / 2, top, w, 3, '#a97544'); q(cx - w / 2, top + 3, w, 2, '#6b4321');
  q(cx - w / 2 + 3, top + 5, 3, GY - top - 5, '#6b4226');
  q(cx + w / 2 - 6, top + 5, 3, GY - top - 5, '#6b4226');
}
function chairP(x, seat, d) {
  q(x - 7, seat, 14, 3, '#7d5030');
  q(d > 0 ? x + 5 : x - 7, seat - 13, 2, 13, '#6b4226');
  q(x - 6, seat + 3, 2, GY - seat - 3, '#6b4226'); q(x + 4, seat + 3, 2, GY - seat - 3, '#6b4226');
}
function couchP(cx, w) {
  q(cx - w / 2, 54, w, 12, '#6e3f63'); q(cx - w / 2, 64, w, 6, '#8f5a7e');
  q(cx - w / 2 - 4, 58, 5, 12, '#7a4b6b'); q(cx + w / 2 - 1, 58, 5, 12, '#7a4b6b');
  q(cx - w / 2, 70, 3, 5, '#4a2f42'); q(cx + w / 2 - 3, 70, 3, 5, '#4a2f42');
}
function tvP(cx, top, screen) {
  q(cx - 16, top, 32, 22, '#15151f'); q(cx - 13, top + 3, 26, 16, screen);
  q(cx - 3, top + 22, 6, 4, '#15151f'); q(cx - 9, top + 26, 18, 2, '#15151f');
}
function bedP(cx, w, top) {
  q(cx - w / 2 - 3, top - 12, 3, 24, '#6b4226');
  q(cx - w / 2, top, w, 10, '#efe6f2');
  q(cx - w / 2 + 9, top, w - 9, 10, '#c94f6d');
  q(cx - w / 2 + 1, top - 4, 9, 5, '#ffffff');
  q(cx - w / 2, top + 10, w, 3, '#6b4226');
}
function dogP(x, y, t, flip) {
  const B = '#c98a42', D = '#8a5a2b', f = flip ? -1 : 1;
  q(x - 5, y - 7, 11, 5, B);
  q(x + f * 4 - 2, y - 11, 5, 5, B);
  q(x + f * 6 - 1, y - 9, 2, 2, D);
  q(x + f * 5, y - 10, 1, 1, '#2b1d16');
  q(x + f * 2, y - 13, 2, 3, D); q(x + f * 5, y - 13, 2, 3, D);
  q(x - f * 6, y - 10 + (Math.sin(t * 10) > 0 ? -2 : 0), 2, 4, B);
  q(x - 4, y - 2, 2, 2, D); q(x + 2, y - 2, 2, 2, D);
  q(x + f * 3, y - 7, 5, 1, '#d8262c');
}
function popcornP(x, y) {
  q(x - 5, y, 10, 10, '#f4f4f4');
  for (let i = 0; i < 10; i += 4) q(x - 5 + i, y, 2, 10, '#e34b4b');
  q(x - 5, y - 2, 10, 3, '#f7e3a1'); q(x - 3, y - 4, 3, 3, '#fff6c9'); q(x + 1, y - 4, 3, 3, '#f7e3a1');
}
function umbrellaP(cx, top, c) {
  q(cx - 19, top + 4, 38, 3, c); q(cx - 14, top + 1, 28, 3, c); q(cx - 6, top - 1, 12, 3, c);
  q(cx - 19, top + 7, 4, 2, c); q(cx + 15, top + 7, 4, 2, c);
  q(cx - 1, top - 3, 2, 3, '#f2d79b');
  q(cx - 1, top + 4, 2, 16, '#6b4226'); q(cx - 4, top + 19, 4, 2, '#6b4226');
}
function fireP(x, y, t) {
  q(x - 10, y, 20, 3, '#6b4226'); q(x - 8, y - 2, 16, 2, '#7d5030');
  const f = (Math.floor(t * 9) % 2);
  q(x - 6, y - 10 - f, 12, 8, '#ff6a1a'); q(x - 4, y - 15 - f, 8, 6, '#ffb03a');
  q(x - 2, y - 18 - f, 4, 4, '#fff0a8'); q(x - 1, y - 20 - f, 2, 2, '#fffbe0');
  sx2.globalAlpha = .12; discP(x, y - 8, 16, '#ff9d2e'); sx2.globalAlpha = 1;
}
function wheelP(x, y, r, t) {
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; q(x + Math.cos(a) * r - 1, y + Math.sin(a) * r - 1, 2, 2, '#23232b'); }
  for (let i = 0; i < 4; i++) { const a = t * 5 + i * 1.571; limb(x, y, x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2), '#9a9aa6', 1); }
}
function balloonP(x, y, c) {
  discP(x, y + 4, 4, c); q(x - 1, y + 8, 2, 2, c); q(x - 1, y + 10, 1, 8, 'rgba(255,255,255,.75)');
  q(x - 2, y + 2, 1, 2, 'rgba(255,255,255,.55)');
}
function cribP(x, y) {
  q(x, y, 30, 3, '#f2e3c8'); q(x, y + 14, 30, 3, '#f2e3c8');
  for (let i = 0; i <= 5; i++) q(x + i * 6, y, 2, 15, '#f2e3c8');
  q(x + 2, y + 9, 26, 6, '#ffd8e8');
}
const HEART_PAT = ['.#.#.', '#####', '#####', '.###.', '..#..'];
function heartPix(x, y, s, c) {
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++)
    if (HEART_PAT[r][k] === '#') q(x + k * s, y + r * s, s, s, c);
}
function discP(x, y, r, c) {
  for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); q(x - w, y + dy, w * 2 + 1, 1, c); }
}
function seagull(x, y) { q(x, y, 2, 1, '#ffffff'); q(x + 2, y - 1, 2, 1, '#ffffff'); q(x + 4, y, 2, 1, '#ffffff'); }

/* ============================================================
   6) מנוע הסצנות
   ============================================================ */
const SCENES = [
  { title: 'נדנדה בפארק',          fn: sceneSwing },
  { title: 'משחק תופסת',           fn: sceneChase },
  { title: 'שתייה אחת, שני קשים',  fn: sceneDrink },
  { title: 'סופרים כוכבים',        fn: sceneStars,  dur: 10 },
  { title: 'חגיגת ניצחון!',        fn: sceneParty },
  { title: 'ספגטי לשניים',         fn: sceneSpaghetti },
  { title: 'מאמצים כלב',           fn: sceneDog },
  { title: 'ערב קולנוע',           fn: sceneCinema },
  { title: 'פיצה מול הטלוויזיה',   fn: scenePizza },
  { title: 'ריקוד במטבח',          fn: sceneDance },
  { title: 'ארוחת בוקר במיטה',     fn: sceneBreakfast },
  { title: 'שקיעה על החוף',        fn: sceneBeach },
  { title: 'מטרייה אחת בגשם',      fn: sceneRain },
  { title: 'מדורה וקמפינג',        fn: sceneCamp },
  { title: 'מי מנצח במשחק?',       fn: sceneGame },
  { title: 'סלפי',                 fn: sceneSelfie },
  { title: 'אופניים ביחד',         fn: sceneBike },
  { title: 'מבשלים (וקצת קמח)',    fn: sceneCook },
  { title: 'לילה טוב',             fn: sceneNight2 },
  { title: 'יש שני פסים!',         fn: scenePregTest },
  { title: 'אולטרסאונד',           fn: sceneScan },
  { title: 'חשקים של הריון',       fn: sceneCraving },
  { title: 'הבעיטה הראשונה',       fn: sceneKick },
  { title: 'צובעים את חדר התינוק', fn: sceneNursery },
  { title: 'חגיגת גילוי המין',     fn: sceneReveal },
];
SCENES.forEach(s => { if (!s.dur) s.dur = 8.5; });

const FADE = 0.45;
let sceneIdx = 0, sceneT = 0;

document.getElementById('sceneTotal').textContent = SCENES.length;
document.getElementById('prevScene').addEventListener('click', () => goToScene(sceneIdx - 1));
document.getElementById('nextScene').addEventListener('click', () => goToScene(sceneIdx + 1));

function goToScene(i) {
  sceneIdx = ((i % SCENES.length) + SCENES.length) % SCENES.length;
  sceneT = 0; PARTS = []; shoot = null; shootT = rnd(1, 4);
  document.getElementById('sceneTitle').textContent = SCENES[sceneIdx].title;
  document.getElementById('sceneNum').textContent = sceneIdx + 1;
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
