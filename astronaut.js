(function () {
  'use strict';

  // ── Messages per section ──────────────────────────────────────────────────
  const MSGS = {
    hero: [
      "Houston, we have a rockstar! 🚀",
      "Warning: this dev may cause excessive app quality ⚠️",
      "I've orbited 1000 portfolios. This one has actual gravity 🌍",
    ],
    about: [
      "5 languages?! I only speak beep boop 🤖",
      "Ariel University produced a GEM. Hire him! 🎓",
      "His code compiles first try. I've witnessed it 👀",
    ],
    skills: [
      "C++, Java, Python AND JavaScript?! Show-off! 😂",
      "TCP/UDP + OS internals = future CTO material 🏆",
      "These skill bars look better than my orbital calculations 📊",
    ],
    projects: [
      "He built Monopoly TWICE. In different languages. Respect. 🎩",
      "Reactor/Proactor from scratch?! This guy means business 💼",
      "The mortar game is the most fun I've had since launch day 🎮",
    ],
    contact: [
      "HIRE THIS HUMAN. I said what I said. 📣",
      "Don't hire him and I'm filing a complaint with NASA 🚨",
      "One click. One hire. You won't regret it. 👇",
    ],
  };

  // ── Inject CSS ────────────────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* ── Scene ── */
    #astro-scene {
      position: fixed;
      right: 24px;
      bottom: 110px;
      z-index: 1000;
      pointer-events: none;
      user-select: none;
    }

    /* ── Wrapper (makes hover area) ── */
    #astro-wrapper {
      position: relative;
      width: 76px;
      pointer-events: auto;
    }

    /* ── Astronaut SVG ── */
    #astro-svg {
      width: 76px;
      filter: drop-shadow(0 6px 18px rgba(108,99,255,0.45));
      animation: astroFloat 3.4s ease-in-out infinite;
      transition: transform 0.7s cubic-bezier(0.34,1.56,0.64,1);
      cursor: pointer;
    }
    #astro-wrapper:hover #astro-svg {
      transform: translateX(130px) rotate(18deg) !important;
      animation-play-state: paused !important;
    }

    /* ── Arms ── */
    #arm-left  { transform-box: fill-box; transform-origin: 50% 0%; animation: armL 2.6s ease-in-out infinite; }
    #arm-right { transform-box: fill-box; transform-origin: 50% 0%; animation: armR 2.6s ease-in-out infinite; animation-delay: .35s; }

    /* ── Keyframes ── */
    @keyframes astroFloat {
      0%,100% { transform: translateY(0)   rotate(0deg); }
      33%      { transform: translateY(-13px) rotate(-3deg); }
      66%      { transform: translateY(-6px)  rotate(2deg); }
    }
    @keyframes astroPanic {
      0%,100% { transform: translateY(0) rotate(0deg); }
      10%  { transform: translateY(-6px)  rotate(-12deg); }
      20%  { transform: translateY(-10px) rotate(12deg); }
      30%  { transform: translateY(-3px)  rotate(-9deg); }
      40%  { transform: translateY(-12px) rotate(7deg); }
      50%  { transform: translateY(-4px)  rotate(-7deg); }
      60%  { transform: translateY(-9px)  rotate(10deg); }
      70%  { transform: translateY(-2px)  rotate(-5deg); }
      80%  { transform: translateY(-11px) rotate(6deg); }
      90%  { transform: translateY(-5px)  rotate(-3deg); }
    }
    @keyframes armL {
      0%,100% { transform: rotate(15deg); }
      50%      { transform: rotate(38deg); }
    }
    @keyframes armR {
      0%,100% { transform: rotate(-15deg); }
      50%      { transform: rotate(-38deg); }
    }
    @keyframes antBlink {
      0%,88%,100% { opacity:1; }
      44%          { opacity:.05; }
    }

    /* ── Speech bubble ── */
    #speech-bubble {
      position: absolute;
      right: 88px;
      bottom: 28px;
      background: #fff;
      color: #1a1a2e;
      border: 2.5px solid #c7c7d9;
      border-radius: 16px;
      padding: 10px 14px;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      max-width: 210px;
      min-width: 120px;
      line-height: 1.5;
      box-shadow: 0 6px 20px rgba(0,0,0,.18);
      opacity: 0;
      transform: scale(.8) translateX(8px);
      transition: opacity .3s ease, transform .3s ease;
      pointer-events: none;
      white-space: normal;
    }
    #speech-bubble.show {
      opacity: 1;
      transform: scale(1) translateX(0);
    }
    /* Bubble tail pointing right */
    #speech-bubble::after {
      content: '';
      position: absolute;
      right: -11px; bottom: 22px;
      border-left: 11px solid #fff;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
    }
    #speech-bubble::before {
      content: '';
      position: absolute;
      right: -14px; bottom: 20px;
      border-left: 14px solid #c7c7d9;
      border-top: 9px solid transparent;
      border-bottom: 9px solid transparent;
    }

    /* ── Alien ship ── */
    #alien-ship {
      position: fixed;
      z-index: 999;
      pointer-events: auto;
      opacity: 0;
      transition: opacity .4s;
    }
    #alien-ship.show { opacity: 1; }
    #ship-inner {
      width: 130px;
      filter: drop-shadow(0 0 14px rgba(0,255,180,.6));
      animation: shipBob 2.2s ease-in-out infinite;
      cursor: none;
    }
    @keyframes shipBob {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-9px); }
    }
    @keyframes shipHit {
      0%   { transform: rotate(0deg) scale(1)   translateX(0); opacity:1; }
      30%  { transform: rotate(200deg) scale(1.35) translateX(40px); opacity:.9; }
      60%  { transform: rotate(400deg) scale(.6)  translateX(180px); opacity:.5; }
      100% { transform: rotate(600deg) scale(0)  translateX(400px); opacity:0; }
    }
    .ship-light { animation: litBlink 1.1s ease-in-out infinite alternate; }
    @keyframes litBlink { from{opacity:.35} to{opacity:1} }

    /* ── Tractor beam ── */
    #tractor-beam {
      position: fixed;
      z-index: 998;
      pointer-events: none;
      opacity: 0;
      transition: opacity .4s;
    }
    #tractor-beam.show { opacity: 1; }
    #tractor-beam svg { animation: beamPulse .55s ease-in-out infinite alternate; }
    @keyframes beamPulse { from{opacity:.3} to{opacity:.75} }

    /* ── Help banner ── */
    #ship-help {
      position: fixed;
      top: 76px; left: 50%;
      transform: translateX(-50%);
      background: rgba(5,5,15,.88);
      color: #00ffcc;
      border: 1.5px solid #00ffcc;
      border-radius: 12px;
      padding: 9px 22px;
      font-family: 'Inter', sans-serif;
      font-size: 13px; font-weight: 700;
      z-index: 1001;
      opacity: 0;
      transition: opacity .4s;
      pointer-events: none;
      text-align: center;
      white-space: nowrap;
    }
    #ship-help.show { opacity: 1; }

    /* ── Custom racket cursor ── */
    body.racket-mode,
    body.racket-mode * { cursor: none !important; }
    #custom-cursor {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%,-50%);
      display: none;
    }
    body.racket-mode #custom-cursor { display: block; }
    #custom-cursor.swing { animation: racketSwing .28s ease-out; }
    @keyframes racketSwing {
      0%   { transform: translate(-50%,-50%) rotate(0deg); }
      40%  { transform: translate(-50%,-50%) rotate(-55deg) scale(1.15); }
      100% { transform: translate(-50%,-50%) rotate(22deg); }
    }

    /* ── Hit FX ── */
    .hit-fx {
      position: fixed;
      pointer-events: none;
      z-index: 1002;
      font-size: 2.2rem;
      line-height: 1;
      animation: hitPop .65s ease-out forwards;
    }
    @keyframes hitPop {
      0%   { transform: scale(0) rotate(-25deg); opacity:1; }
      45%  { transform: scale(1.6) rotate(12deg); opacity:1; }
      100% { transform: scale(.9) translateY(-50px); opacity:0; }
    }

    @media (max-width: 600px) {
      #astro-scene { right: 8px; bottom: 70px; }
      #astro-svg { width: 54px; }
      #speech-bubble { font-size: 11px; max-width: 160px; right: 64px; }
      #ship-inner { width: 90px; }
    }
  `;
  document.head.appendChild(styleEl);

  // ── Astronaut SVG markup ──────────────────────────────────────────────────
  const ASTRO_SVG = `
  <svg id="astro-svg" viewBox="0 0 100 155" xmlns="http://www.w3.org/2000/svg">
    <!-- Left arm -->
    <g id="arm-left">
      <ellipse cx="20" cy="96" rx="9" ry="19" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
      <circle cx="20" cy="113" r="7.5" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    </g>
    <!-- Right arm -->
    <g id="arm-right">
      <ellipse cx="80" cy="96" rx="9" ry="19" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
      <circle cx="80" cy="113" r="7.5" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    </g>
    <!-- Body -->
    <ellipse cx="50" cy="103" rx="27" ry="33" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <!-- Chest panel -->
    <rect x="37" y="90" width="26" height="18" rx="4" fill="#c5cae9" stroke="#9fa8da" stroke-width="1"/>
    <circle cx="50" cy="96" r="4.5" fill="#7986cb"/>
    <rect x="39" y="103" width="22" height="3" rx="1.5" fill="#9fa8da"/>
    <!-- Left leg -->
    <ellipse cx="40" cy="132" rx="9" ry="14" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <!-- Right leg -->
    <ellipse cx="60" cy="132" rx="9" ry="14" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <!-- Boots -->
    <ellipse cx="40" cy="146" rx="12" ry="6.5" fill="#5c6bc0"/>
    <ellipse cx="60" cy="146" rx="12" ry="6.5" fill="#5c6bc0"/>
    <!-- Boot shine -->
    <ellipse cx="36" cy="143" rx="4" ry="2" fill="rgba(255,255,255,0.25)"/>
    <ellipse cx="56" cy="143" rx="4" ry="2" fill="rgba(255,255,255,0.25)"/>
    <!-- Helmet -->
    <circle cx="50" cy="44" r="31" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <!-- Visor -->
    <ellipse cx="50" cy="44" rx="21" ry="19" fill="#29b6f6" opacity="0.88"/>
    <!-- Visor reflections -->
    <ellipse cx="43" cy="37" rx="7.5" ry="5" fill="white" opacity="0.38" transform="rotate(-22 43 37)"/>
    <ellipse cx="56" cy="34" rx="3" ry="2" fill="white" opacity="0.28"/>
    <!-- Face (subtle) -->
    <circle cx="44" cy="45" r="2.8" fill="#0d47a1" opacity="0.55"/>
    <circle cx="56" cy="45" r="2.8" fill="#0d47a1" opacity="0.55"/>
    <path d="M44 52 Q50 57 56 52" stroke="#0d47a1" stroke-width="1.5" fill="none" opacity="0.45"/>
    <!-- Helmet collar ring -->
    <ellipse cx="50" cy="71" rx="27" ry="6.5" fill="#c5cae9" stroke="#9fa8da" stroke-width="1.5"/>
    <!-- Antenna -->
    <line x1="50" y1="13" x2="50" y2="2" stroke="#9fa8da" stroke-width="2.2"/>
    <circle id="ant-light" cx="50" cy="1" r="4" fill="#f44336"
            style="animation: antBlink 1.6s ease-in-out infinite;"/>
    <!-- Flag patch -->
    <rect x="66" y="80" width="12" height="8" rx="1.5" fill="#1565c0"/>
    <rect x="66" y="80" width="12" height="3" rx="1" fill="#c62828"/>
    <line x1="66" y1="80" x2="66" y2="88" stroke="#9fa8da" stroke-width="1"/>
  </svg>`;

  // ── Spaceship SVG markup ──────────────────────────────────────────────────
  const SHIP_SVG = `
  <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
    <!-- Glow aura -->
    <ellipse cx="70" cy="62" rx="62" ry="14" fill="rgba(0,255,180,0.1)"/>
    <!-- Main disc body -->
    <ellipse cx="70" cy="56" rx="62" ry="18" fill="#455a64" stroke="#37474f" stroke-width="1.5"/>
    <!-- Upper body -->
    <ellipse cx="70" cy="46" rx="44" ry="24" fill="#546e7a" stroke="#455a64" stroke-width="1.5"/>
    <!-- Dome -->
    <ellipse cx="70" cy="32" rx="28" ry="22" fill="#78909c" stroke="#546e7a" stroke-width="1.5"/>
    <!-- Dome glass -->
    <ellipse cx="70" cy="30" rx="21" ry="16" fill="#80deea" opacity="0.78"/>
    <!-- Dome shine -->
    <ellipse cx="62" cy="23" rx="7" ry="4" fill="white" opacity="0.28" transform="rotate(-18 62 23)"/>
    <!-- Alien in dome -->
    <circle cx="70" cy="29" r="10" fill="#a5d6a7" opacity="0.92"/>
    <circle cx="65.5" cy="27" r="2.5" fill="#1b5e20"/>
    <circle cx="74.5" cy="27" r="2.5" fill="#1b5e20"/>
    <path d="M65 33 Q70 37 75 33" stroke="#1b5e20" stroke-width="1.4" fill="none"/>
    <!-- Lights (blinking) -->
    <circle cx="16"  cy="58" r="5.5" fill="#ffeb3b" class="ship-light"/>
    <circle cx="38"  cy="66" r="5.5" fill="#ef5350" class="ship-light" style="animation-delay:.25s"/>
    <circle cx="60"  cy="69" r="5.5" fill="#66bb6a" class="ship-light" style="animation-delay:.1s"/>
    <circle cx="80"  cy="69" r="5.5" fill="#ffeb3b" class="ship-light" style="animation-delay:.4s"/>
    <circle cx="102" cy="66" r="5.5" fill="#ef5350" class="ship-light" style="animation-delay:.18s"/>
    <circle cx="124" cy="58" r="5.5" fill="#66bb6a" class="ship-light" style="animation-delay:.35s"/>
    <!-- Bottom rim -->
    <ellipse cx="70" cy="68" rx="54" ry="7" fill="#37474f" opacity="0.55"/>
  </svg>`;

  // ── Tennis racket cursor SVG ──────────────────────────────────────────────
  const RACKET_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    <!-- Head outline -->
    <ellipse cx="24" cy="19" rx="15" ry="18" fill="none" stroke="#7B3F00" stroke-width="3"/>
    <!-- Strings horizontal -->
    <line x1="10" y1="10" x2="38" y2="10" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="9"  y1="17" x2="39" y2="17" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="9"  y1="24" x2="39" y2="24" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="10" y1="31" x2="38" y2="31" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <!-- Strings vertical -->
    <line x1="16" y1="2"  x2="16" y2="36" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="24" y1="1"  x2="24" y2="37" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="32" y1="2"  x2="32" y2="36" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <!-- Handle -->
    <rect x="21.5" y="36" width="5" height="14" rx="2.5" fill="#7B3F00"/>
    <rect x="20"   y="41" width="8" height="3"  rx="1.5" fill="#5a2d0c"/>
    <rect x="19"   y="46" width="10" height="2" rx="1"   fill="#4a2208"/>
  </svg>`;

  // ── Build DOM ─────────────────────────────────────────────────────────────
  // Scene
  const scene = document.createElement('div');
  scene.id = 'astro-scene';
  scene.innerHTML = `
    <div id="astro-wrapper">
      <div id="speech-bubble"></div>
      ${ASTRO_SVG}
    </div>`;
  document.body.appendChild(scene);

  // Ship
  const shipEl = document.createElement('div');
  shipEl.id = 'alien-ship';
  shipEl.innerHTML = `<div id="ship-inner">${SHIP_SVG}</div>`;
  document.body.appendChild(shipEl);

  // Tractor beam (SVG polygon, positioned dynamically)
  const beamEl = document.createElement('div');
  beamEl.id = 'tractor-beam';
  beamEl.innerHTML = `<svg id="beam-svg" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="beamGrad" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="rgba(0,255,200,0.7)"/>
      <stop offset="100%" stop-color="rgba(0,255,200,0)"/>
    </linearGradient></defs>
    <polygon id="beam-poly" fill="url(#beamGrad)"/>
  </svg>`;
  document.body.appendChild(beamEl);

  // Help banner
  const helpEl = document.createElement('div');
  helpEl.id = 'ship-help';
  helpEl.innerHTML = '🎾 Aliens are abducting your astronaut! &nbsp;<strong>Hit the spaceship to save him!</strong>';
  document.body.appendChild(helpEl);

  // Custom cursor
  const cursorEl = document.createElement('div');
  cursorEl.id = 'custom-cursor';
  cursorEl.innerHTML = RACKET_SVG;
  document.body.appendChild(cursorEl);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bubble      = document.getElementById('speech-bubble');
  const astroWrapper = document.getElementById('astro-wrapper');
  const astroSvg    = document.getElementById('astro-svg');
  const beamSvg     = document.getElementById('beam-svg');
  const beamPoly    = document.getElementById('beam-poly');

  // ── State ─────────────────────────────────────────────────────────────────
  let bubbleTimer  = null;
  let shipActive   = false;
  let shipKillTimer = null;
  let currentSection = 'hero';

  // ── Speech bubble ─────────────────────────────────────────────────────────
  function showBubble(text, ms = 4500) {
    if (bubbleTimer) clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.add('show');
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  // ── Section detection (IntersectionObserver) ──────────────────────────────
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= 0.4) {
        const id = e.target.id;
        if (id !== currentSection && MSGS[id]) {
          currentSection = id;
          const list = MSGS[id];
          setTimeout(() => showBubble(list[Math.floor(Math.random() * list.length)]), 700);
        }
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

  // ── Hover drift message ───────────────────────────────────────────────────
  astroWrapper.addEventListener('mouseenter', () => {
    if (!shipActive) showBubble('Hey! Personal space! 😅', 2200);
  });

  // ── Custom cursor tracking ────────────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top  = e.clientY + 'px';
  });

  // ── Tractor beam positioning ──────────────────────────────────────────────
  function updateBeam() {
    const astroRect = astroWrapper.getBoundingClientRect();
    const shipRect  = shipEl.getBoundingClientRect();

    const aX = astroRect.left + astroRect.width  / 2;
    const aY = astroRect.top;
    const sX = shipRect.left  + shipRect.width   / 2;
    const sY = shipRect.bottom;

    const minX = Math.min(aX, sX) - 40;
    const minY = Math.min(aY, sY) - 5;
    const w    = Math.abs(aX - sX) + 80;
    const h    = Math.abs(aY - sY) + 10;

    beamEl.style.left = minX + 'px';
    beamEl.style.top  = minY + 'px';
    beamSvg.setAttribute('width',  w);
    beamSvg.setAttribute('height', h);

    const lax = aX - minX, lay = aY - minY;
    const lsx = sX - minX, lsy = sY - minY;
    const spread = 36;
    beamPoly.setAttribute('points',
      `${lsx-spread},${lsy} ${lsx+spread},${lsy} ${lax+16},${lay} ${lax-16},${lay}`);
  }

  // ── Alien ship mini-game ──────────────────────────────────────────────────
  function spawnShip() {
    if (shipActive) return;
    shipActive = true;

    const astroRect = astroWrapper.getBoundingClientRect();
    const shipW = 140;
    const targetLeft = Math.max(20, astroRect.left - shipW - 20);
    const targetTop  = Math.max(60, astroRect.top  - 120);

    // Start off-screen right
    shipEl.style.transition = 'none';
    shipEl.style.left   = (window.innerWidth + 20) + 'px';
    shipEl.style.top    = targetTop + 'px';
    shipEl.style.opacity = '0';
    shipEl.classList.add('show');

    // Fly in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      shipEl.style.transition = 'left 1.6s cubic-bezier(.25,.46,.45,.94)';
      shipEl.style.left = targetLeft + 'px';
    }));

    // Beam + panic after fly-in
    setTimeout(() => {
      beamEl.classList.add('show');
      updateBeam();
      astroSvg.style.animation = 'astroPanic .45s ease-in-out infinite';
    }, 1700);

    // Racket cursor + help banner
    setTimeout(() => {
      document.body.classList.add('racket-mode');
      helpEl.classList.add('show');
      showBubble('HELP ME!!! 😱 Hit that ship! PLEASE!', 9000);
    }, 1900);

    // Auto-escape after 13 s if not hit
    shipKillTimer = setTimeout(() => {
      if (shipActive) dismissShip(false);
    }, 13000);
  }

  function dismissShip(wasHit) {
    if (!shipActive) return;
    shipActive = false;
    clearTimeout(shipKillTimer);

    beamEl.classList.remove('show');
    helpEl.classList.remove('show');
    document.body.classList.remove('racket-mode');

    if (wasHit) {
      const inner = document.getElementById('ship-inner');
      inner.style.animation = 'shipHit .85s ease-in forwards';
      setTimeout(() => {
        shipEl.classList.remove('show');
        inner.style.animation = '';
        astroSvg.style.animation = 'astroFloat 3.4s ease-in-out infinite';
        showBubble('YOU SAVED ME! 🎉 You\'re a hero! (Hire this person btw) 👇', 5500);
        scheduleNextShip();
      }, 850);
    } else {
      shipEl.style.transition = 'left 1s ease-in, opacity .6s .4s';
      shipEl.style.left    = (window.innerWidth + 200) + 'px';
      shipEl.style.opacity = '0';
      setTimeout(() => {
        shipEl.classList.remove('show');
        shipEl.style.opacity = '';
        shipEl.style.transition = 'none';
        astroSvg.style.animation = 'astroFloat 3.4s ease-in-out infinite';
        showBubble('They\'ll be back... they always come back 😰', 3500);
        scheduleNextShip();
      }, 1100);
    }
  }

  function scheduleNextShip() {
    // 40–90 seconds
    setTimeout(spawnShip, 40000 + Math.random() * 50000);
  }

  // ── Click on ship = whack it ───────────────────────────────────────────────
  shipEl.addEventListener('click', e => {
    if (!shipActive) return;

    // Cursor swing
    cursorEl.classList.remove('swing');
    void cursorEl.offsetWidth; // reflow
    cursorEl.classList.add('swing');
    setTimeout(() => cursorEl.classList.remove('swing'), 300);

    // Hit sparkle
    const fx = document.createElement('div');
    fx.className = 'hit-fx';
    fx.textContent = ['💥', '⚡💥', '🎾💥', '🔥', '💫'][Math.floor(Math.random() * 5)];
    fx.style.left = e.clientX + 'px';
    fx.style.top  = e.clientY + 'px';
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 700);

    dismissShip(true);
  });

  // Update beam on scroll / resize
  window.addEventListener('scroll', () => { if (shipActive) updateBeam(); }, { passive: true });
  window.addEventListener('resize', () => { if (shipActive) updateBeam(); });

  // ── First greeting + first ship ───────────────────────────────────────────
  setTimeout(() => showBubble("👋 Hi! I'm EL's space buddy — keep scrolling!", 4500), 2800);
  scheduleNextShip();

})();
