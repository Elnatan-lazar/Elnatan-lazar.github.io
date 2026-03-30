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
    /* Scene: fixed right side, top:0, JS controls vertical via transform */
    #astro-scene {
      position: fixed;
      right: 30px;
      top: 0;
      z-index: 1000;
      pointer-events: none;
      overflow: visible;
    }

    #astro-wrapper {
      position: relative;
      width: 80px;
      pointer-events: auto;
      overflow: visible;
    }

    /* Slow 360 spin wrapper */
    #astro-rotate-wrap {
      animation: astroSpin 14s linear infinite;
      overflow: visible;
    }
    @keyframes astroSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* Bob in place (small local float) */
    #astro-svg {
      width: 80px;
      display: block;
      filter: drop-shadow(0 6px 18px rgba(108,99,255,.5));
      animation: astroBob 3.2s ease-in-out infinite;
      overflow: visible;
    }
    @keyframes astroBob {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-10px); }
    }

    /* Arm waves */
    #arm-left  { transform-box: fill-box; transform-origin: 50% 0%;
                 animation: armL 2.6s ease-in-out infinite; }
    #arm-right { transform-box: fill-box; transform-origin: 50% 0%;
                 animation: armR 2.6s ease-in-out infinite; animation-delay:.35s; }
    @keyframes armL { 0%,100%{transform:rotate(15deg)} 50%{transform:rotate(38deg)} }
    @keyframes armR { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(-38deg)} }
    @keyframes antBlink { 0%,88%,100%{opacity:1} 44%{opacity:.05} }

    /* Panic mode (ship attack) */
    @keyframes astroPanic {
      0%,100%{transform:translateY(0) rotate(0deg)}
      10%{transform:translateY(-7px) rotate(-14deg)}
      20%{transform:translateY(-11px) rotate(14deg)}
      30%{transform:translateY(-3px) rotate(-10deg)}
      40%{transform:translateY(-13px) rotate(8deg)}
      50%{transform:translateY(-5px) rotate(-8deg)}
      60%{transform:translateY(-10px) rotate(11deg)}
      70%{transform:translateY(-2px) rotate(-6deg)}
      80%{transform:translateY(-12px) rotate(7deg)}
      90%{transform:translateY(-4px) rotate(-3deg)}
    }

    /* Speech bubble — to the LEFT of astronaut */
    #speech-bubble {
      position: absolute;
      right: 92px;
      top: 0px;
      background: #fff;
      color: #1a1a2e;
      border: 2.5px solid #c7c7d9;
      border-radius: 16px;
      padding: 10px 14px;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      max-width: 210px;
      min-width: 130px;
      line-height: 1.5;
      box-shadow: 0 6px 20px rgba(0,0,0,.18);
      opacity: 0;
      transform: scale(.82) translateX(8px);
      transition: opacity .3s, transform .3s;
      pointer-events: none;
      white-space: normal;
    }
    #speech-bubble.show { opacity:1; transform:scale(1) translateX(0); }
    /* Bubble tail → right */
    #speech-bubble::after {
      content:''; position:absolute;
      right:-11px; top:18px;
      border-left:11px solid #fff;
      border-top:7px solid transparent;
      border-bottom:7px solid transparent;
    }
    #speech-bubble::before {
      content:''; position:absolute;
      right:-14px; top:16px;
      border-left:14px solid #c7c7d9;
      border-top:9px solid transparent;
      border-bottom:9px solid transparent;
    }

    /* Alien ship */
    #alien-ship { position:fixed; z-index:999; pointer-events:auto; opacity:0; transition:opacity .4s; }
    #alien-ship.show { opacity:1; }
    #ship-inner {
      width:130px;
      filter: drop-shadow(0 0 14px rgba(0,255,180,.6));
      animation: shipBob 2.2s ease-in-out infinite;
      cursor: none;
    }
    @keyframes shipBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
    @keyframes shipHit {
      0%  {transform:rotate(0deg)   scale(1)    translateX(0);   opacity:1}
      30% {transform:rotate(200deg) scale(1.35) translateX(40px);opacity:.9}
      60% {transform:rotate(400deg) scale(.6)   translateX(180px);opacity:.5}
      100%{transform:rotate(600deg) scale(0)    translateX(400px);opacity:0}
    }
    .ship-light { animation:litBlink 1.1s ease-in-out infinite alternate; }
    @keyframes litBlink { from{opacity:.35} to{opacity:1} }

    /* Tractor beam */
    #tractor-beam { position:fixed; z-index:998; pointer-events:none; opacity:0; transition:opacity .4s; }
    #tractor-beam.show { opacity:1; }
    #tractor-beam svg { animation:beamPulse .55s ease-in-out infinite alternate; }
    @keyframes beamPulse { from{opacity:.3} to{opacity:.8} }

    /* Help banner */
    #ship-help {
      position:fixed; top:76px; left:50%; transform:translateX(-50%);
      background:rgba(5,5,15,.9); color:#00ffcc;
      border:1.5px solid #00ffcc; border-radius:12px;
      padding:9px 22px; font-family:'Inter',sans-serif;
      font-size:13px; font-weight:700; z-index:1001;
      opacity:0; transition:opacity .4s; pointer-events:none;
      text-align:center; white-space:nowrap;
    }
    #ship-help.show { opacity:1; }

    /* Tennis racket cursor */
    body.racket-mode, body.racket-mode * { cursor:none !important; }
    #custom-cursor {
      position:fixed; pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%); display:none;
    }
    body.racket-mode #custom-cursor { display:block; }
    #custom-cursor.swing { animation:racketSwing .28s ease-out; }
    @keyframes racketSwing {
      0%  {transform:translate(-50%,-50%) rotate(0deg)}
      40% {transform:translate(-50%,-50%) rotate(-55deg) scale(1.15)}
      100%{transform:translate(-50%,-50%) rotate(22deg)}
    }

    /* Hit FX */
    .hit-fx {
      position:fixed; pointer-events:none; z-index:1002;
      font-size:2.2rem; line-height:1;
      animation:hitPop .65s ease-out forwards;
    }
    @keyframes hitPop {
      0%  {transform:scale(0) rotate(-25deg);opacity:1}
      45% {transform:scale(1.6) rotate(12deg);opacity:1}
      100%{transform:scale(.9) translateY(-50px);opacity:0}
    }

    @media(max-width:600px){
      #astro-scene{right:8px}
      #astro-svg{width:58px}
      #speech-bubble{font-size:11px;max-width:160px;right:68px}
      #ship-inner{width:90px}
    }
  `;
  document.head.appendChild(styleEl);

  // ── SVG templates ─────────────────────────────────────────────────────────
  const ASTRO_SVG = `
  <svg id="astro-svg" viewBox="0 0 100 155" xmlns="http://www.w3.org/2000/svg">
    <g id="arm-left">
      <ellipse cx="20" cy="96" rx="9" ry="19" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
      <circle cx="20" cy="113" r="7.5" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    </g>
    <g id="arm-right">
      <ellipse cx="80" cy="96" rx="9" ry="19" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
      <circle cx="80" cy="113" r="7.5" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    </g>
    <ellipse cx="50" cy="103" rx="27" ry="33" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <rect x="37" y="90" width="26" height="18" rx="4" fill="#c5cae9" stroke="#9fa8da" stroke-width="1"/>
    <circle cx="50" cy="96" r="4.5" fill="#7986cb"/>
    <rect x="39" y="103" width="22" height="3" rx="1.5" fill="#9fa8da"/>
    <ellipse cx="40" cy="132" rx="9" ry="14" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <ellipse cx="60" cy="132" rx="9" ry="14" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <ellipse cx="40" cy="146" rx="12" ry="6.5" fill="#5c6bc0"/>
    <ellipse cx="60" cy="146" rx="12" ry="6.5" fill="#5c6bc0"/>
    <ellipse cx="36" cy="143" rx="4" ry="2" fill="rgba(255,255,255,0.25)"/>
    <ellipse cx="56" cy="143" rx="4" ry="2" fill="rgba(255,255,255,0.25)"/>
    <circle cx="50" cy="44" r="31" fill="#e8eaf6" stroke="#9fa8da" stroke-width="1.5"/>
    <ellipse cx="50" cy="44" rx="21" ry="19" fill="#29b6f6" opacity="0.88"/>
    <ellipse cx="43" cy="37" rx="7.5" ry="5" fill="white" opacity="0.38" transform="rotate(-22 43 37)"/>
    <ellipse cx="56" cy="34" rx="3" ry="2" fill="white" opacity="0.28"/>
    <circle cx="44" cy="45" r="2.8" fill="#0d47a1" opacity="0.55"/>
    <circle cx="56" cy="45" r="2.8" fill="#0d47a1" opacity="0.55"/>
    <path d="M44 52 Q50 57 56 52" stroke="#0d47a1" stroke-width="1.5" fill="none" opacity="0.45"/>
    <ellipse cx="50" cy="71" rx="27" ry="6.5" fill="#c5cae9" stroke="#9fa8da" stroke-width="1.5"/>
    <line x1="50" y1="13" x2="50" y2="2" stroke="#9fa8da" stroke-width="2.2"/>
    <circle id="ant-light" cx="50" cy="1" r="4" fill="#f44336"
            style="animation:antBlink 1.6s ease-in-out infinite;"/>
    <rect x="66" y="80" width="12" height="8" rx="1.5" fill="#1565c0"/>
    <rect x="66" y="80" width="12" height="3" rx="1" fill="#c62828"/>
    <line x1="66" y1="80" x2="66" y2="88" stroke="#9fa8da" stroke-width="1"/>
  </svg>`;

  const SHIP_SVG = `
  <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="70" cy="62" rx="62" ry="14" fill="rgba(0,255,180,0.1)"/>
    <ellipse cx="70" cy="56" rx="62" ry="18" fill="#455a64" stroke="#37474f" stroke-width="1.5"/>
    <ellipse cx="70" cy="46" rx="44" ry="24" fill="#546e7a" stroke="#455a64" stroke-width="1.5"/>
    <ellipse cx="70" cy="32" rx="28" ry="22" fill="#78909c" stroke="#546e7a" stroke-width="1.5"/>
    <ellipse cx="70" cy="30" rx="21" ry="16" fill="#80deea" opacity="0.78"/>
    <ellipse cx="62" cy="23" rx="7" ry="4" fill="white" opacity="0.28" transform="rotate(-18 62 23)"/>
    <circle cx="70" cy="29" r="10" fill="#a5d6a7" opacity="0.92"/>
    <circle cx="65.5" cy="27" r="2.5" fill="#1b5e20"/>
    <circle cx="74.5" cy="27" r="2.5" fill="#1b5e20"/>
    <path d="M65 33 Q70 37 75 33" stroke="#1b5e20" stroke-width="1.4" fill="none"/>
    <circle cx="16"  cy="58" r="5.5" fill="#ffeb3b" class="ship-light"/>
    <circle cx="38"  cy="66" r="5.5" fill="#ef5350" class="ship-light" style="animation-delay:.25s"/>
    <circle cx="60"  cy="69" r="5.5" fill="#66bb6a" class="ship-light" style="animation-delay:.1s"/>
    <circle cx="80"  cy="69" r="5.5" fill="#ffeb3b" class="ship-light" style="animation-delay:.4s"/>
    <circle cx="102" cy="66" r="5.5" fill="#ef5350" class="ship-light" style="animation-delay:.18s"/>
    <circle cx="124" cy="58" r="5.5" fill="#66bb6a" class="ship-light" style="animation-delay:.35s"/>
    <ellipse cx="70" cy="68" rx="54" ry="7" fill="#37474f" opacity="0.55"/>
  </svg>`;

  const RACKET_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    <ellipse cx="24" cy="19" rx="15" ry="18" fill="none" stroke="#7B3F00" stroke-width="3"/>
    <line x1="10" y1="10" x2="38" y2="10" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="9"  y1="17" x2="39" y2="17" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="9"  y1="24" x2="39" y2="24" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="10" y1="31" x2="38" y2="31" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="16" y1="2"  x2="16" y2="36" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="24" y1="1"  x2="24" y2="37" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <line x1="32" y1="2"  x2="32" y2="36" stroke="#f0f0f0" stroke-width="1.3" opacity=".85"/>
    <rect x="21.5" y="36" width="5" height="14" rx="2.5" fill="#7B3F00"/>
    <rect x="20"   y="41" width="8" height="3"  rx="1.5" fill="#5a2d0c"/>
    <rect x="19"   y="46" width="10" height="2" rx="1"   fill="#4a2208"/>
  </svg>`;

  // ── Build DOM ─────────────────────────────────────────────────────────────
  const scene = document.createElement('div');
  scene.id = 'astro-scene';
  scene.innerHTML = `
    <div id="astro-wrapper">
      <div id="speech-bubble"></div>
      <div id="astro-rotate-wrap">${ASTRO_SVG}</div>
    </div>`;
  document.body.appendChild(scene);

  const shipEl = document.createElement('div');
  shipEl.id = 'alien-ship';
  shipEl.innerHTML = `<div id="ship-inner">${SHIP_SVG}</div>`;
  document.body.appendChild(shipEl);

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

  const helpEl = document.createElement('div');
  helpEl.id = 'ship-help';
  helpEl.innerHTML = '🎾 Aliens are abducting your astronaut! &nbsp;<strong>Hit the spaceship to save him!</strong>';
  document.body.appendChild(helpEl);

  const cursorEl = document.createElement('div');
  cursorEl.id = 'custom-cursor';
  cursorEl.innerHTML = RACKET_SVG;
  document.body.appendChild(cursorEl);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bubble      = document.getElementById('speech-bubble');
  const astroWrapper = document.getElementById('astro-wrapper');
  const astroSvg    = document.getElementById('astro-svg');
  const rotateWrap  = document.getElementById('astro-rotate-wrap');
  const beamSvg     = document.getElementById('beam-svg');
  const beamPoly    = document.getElementById('beam-poly');

  // ── State ─────────────────────────────────────────────────────────────────
  let bubbleTimer   = null;
  let shipActive    = false;
  let shipKillTimer = null;
  let currentSection = 'hero';

  // Animation state
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let fleeX  = 0;
  let fleeY  = 0;
  // Start astronaut near bottom
  let baseY  = window.innerHeight - 180;

  // ── Speech bubble ─────────────────────────────────────────────────────────
  function showBubble(text, ms = 4500) {
    if (bubbleTimer) clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.add('show');
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  // ── Section detection ─────────────────────────────────────────────────────
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

  // ── Mouse tracking ────────────────────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (shipActive) {
      cursorEl.style.left = e.clientX + 'px';
      cursorEl.style.top  = e.clientY + 'px';
    }
  });

  // ── Main animation loop ───────────────────────────────────────────────────
  // Slow vertical travel across the full viewport height (sine wave, ~30s cycle)
  const TRAVEL_PERIOD = 30000; // ms for one full up-down-up cycle
  const MARGIN_TOP    = 70;
  const MARGIN_BOTTOM = 160;

  function rafLoop(timestamp) {
    const vh = window.innerHeight;
    const minY = MARGIN_TOP;
    const maxY = vh - MARGIN_BOTTOM;

    // Smooth sine oscillation top ↔ bottom
    const t = (timestamp % TRAVEL_PERIOD) / TRAVEL_PERIOD;
    baseY = minY + (maxY - minY) * (0.5 - 0.5 * Math.cos(2 * Math.PI * t));

    // Flee from cursor
    // Approximate astronaut center on screen
    const astroRight  = window.innerWidth - 30; // scene right:30px
    const astroCenterX = astroRight - 40;       // center of 80px element
    const astroCenterY = baseY + fleeY + 75;    // vertical center approx

    const dx   = astroCenterX - mouseX;
    const dy   = astroCenterY - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const FLEE_R = 150;

    if (dist < FLEE_R && dist > 1) {
      const strength = (1 - dist / FLEE_R) * 6;
      fleeX += (dx / dist) * strength;
      fleeY += (dy / dist) * strength;
    }

    // Decay flee back to 0
    fleeX *= 0.93;
    fleeY *= 0.93;

    // Clamp: only allow fleeing LEFT (toward page center), not further right off-screen
    fleeX = Math.max(-260, Math.min(20, fleeX));
    fleeY = Math.max(-180, Math.min(180, fleeY));

    // Apply combined transform: flee offset + vertical travel
    scene.style.transform = `translate(${fleeX}px, ${baseY + fleeY}px)`;

    // Keep beam updated if ship active
    if (shipActive) updateBeam();

    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  // ── Tractor beam ──────────────────────────────────────────────────────────
  function updateBeam() {
    const astroRect = astroWrapper.getBoundingClientRect();
    const shipRect  = shipEl.getBoundingClientRect();
    if (!shipRect.width) return;

    const aX = astroRect.left + astroRect.width  / 2;
    const aY = astroRect.top;
    const sX = shipRect.left  + shipRect.width   / 2;
    const sY = shipRect.bottom;

    const minX = Math.min(aX, sX) - 40;
    const minY = Math.min(aY, sY) - 5;
    const w    = Math.abs(aX - sX) + 80;
    const h    = Math.abs(aY - sY) + 15;

    beamEl.style.left = minX + 'px';
    beamEl.style.top  = minY + 'px';
    beamSvg.setAttribute('width',  w);
    beamSvg.setAttribute('height', h);

    const lsx = sX - minX, lsy = sY - minY;
    const lax = aX - minX, lay = aY - minY;
    const spread = 32;
    beamPoly.setAttribute('points',
      `${lsx-spread},${lsy} ${lsx+spread},${lsy} ${lax+14},${lay} ${lax-14},${lay}`);
  }

  // ── Alien ship mini-game ──────────────────────────────────────────────────
  function spawnShip() {
    if (shipActive) return;
    shipActive = true;

    const astroRect = astroWrapper.getBoundingClientRect();
    const targetLeft = Math.max(20, astroRect.left - 160);
    const targetTop  = Math.max(60, astroRect.top  - 110);

    shipEl.style.transition = 'none';
    shipEl.style.left = (window.innerWidth + 30) + 'px';
    shipEl.style.top  = targetTop + 'px';
    shipEl.style.opacity = '';   // clear any leftover inline opacity
    shipEl.classList.add('show'); // CSS handles opacity:1

    requestAnimationFrame(() => requestAnimationFrame(() => {
      shipEl.style.transition = 'left 1.6s cubic-bezier(.25,.46,.45,.94)';
      shipEl.style.left = targetLeft + 'px';
    }));

    setTimeout(() => {
      beamEl.classList.add('show');
      updateBeam();
      astroSvg.style.animation = 'astroPanic .45s ease-in-out infinite';
      rotateWrap.style.animationPlayState = 'paused';
    }, 1700);

    setTimeout(() => {
      document.body.classList.add('racket-mode');
      helpEl.classList.add('show');
      showBubble('HELP ME!!! 😱 Hit that ship! PLEASE!', 10000);
    }, 1900);

    shipKillTimer = setTimeout(() => { if (shipActive) dismissShip(false); }, 13000);
  }

  function dismissShip(wasHit) {
    if (!shipActive) return;
    shipActive = false;
    clearTimeout(shipKillTimer);

    beamEl.classList.remove('show');
    helpEl.classList.remove('show');
    document.body.classList.remove('racket-mode');
    rotateWrap.style.animationPlayState = 'running';

    if (wasHit) {
      const inner = document.getElementById('ship-inner');
      inner.style.animation = 'shipHit .85s ease-in forwards';
      setTimeout(() => {
        shipEl.classList.remove('show');
        inner.style.animation = '';
        astroSvg.style.animation = 'astroBob 3.2s ease-in-out infinite';
        showBubble('YOU SAVED ME! 🎉 You\'re a hero! (Hire this person btw) 👇', 5500);
        scheduleNextShip();
      }, 850);
    } else {
      shipEl.style.transition = 'left 1s ease-in';
      shipEl.style.left = (window.innerWidth + 200) + 'px';
      setTimeout(() => shipEl.classList.remove('show'), 400); // fade out via CSS
      setTimeout(() => {
        shipEl.style.transition = 'none';
        astroSvg.style.animation = 'astroBob 3.2s ease-in-out infinite';
        showBubble('They\'ll be back... they always come back 😰', 3500);
        scheduleNextShip();
      }, 1100);
    }
  }

  function scheduleNextShip() {
    setTimeout(spawnShip, 45000 + Math.random() * 45000);
  }

  // ── Click ship → whack ────────────────────────────────────────────────────
  shipEl.addEventListener('click', e => {
    if (!shipActive) return;

    cursorEl.classList.remove('swing');
    void cursorEl.offsetWidth;
    cursorEl.classList.add('swing');
    setTimeout(() => cursorEl.classList.remove('swing'), 300);

    const fx = document.createElement('div');
    fx.className = 'hit-fx';
    fx.textContent = ['💥','⚡💥','🎾💥','🔥','💫'][Math.floor(Math.random() * 5)];
    fx.style.left = e.clientX + 'px';
    fx.style.top  = e.clientY + 'px';
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 700);

    dismissShip(true);
  });

  // ── First greeting + schedule ship ───────────────────────────────────────
  setTimeout(() => showBubble("👋 Hi! I'm EL's space buddy — keep scrolling!", 4500), 2800);
  scheduleNextShip();

})();
