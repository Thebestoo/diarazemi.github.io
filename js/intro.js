/* ============================================================
   intro.js — Pixel Assembly Intro
   Timeline:
     0 – 2.8s  SCATTER  : glowing pixels drift across the screen
     2.8 – 5.8s CONVERGE : pixels fly into position, spelling the name
     5.8 – 7.8s HOLD     : text pulses, progress bar fills
     7.8 – 8.6s EXPLODE  : particles burst outward, white flash
     8.6 – 10s  REVEAL   : iPhone-style site emergence
   ============================================================ */

;(function () {
  'use strict';

  /* ── Skip for reduced-motion users ──────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.getElementById('hero') && document.getElementById('hero').classList.add('hero-animate');
    return;
  }

  /* ── Config ──────────────────────────────────────────────── */
  var ACCENT   = '#c07245';
  var BG       = '#0a0a0a';
  var mobile   = window.innerWidth < 640;
  var N        = mobile ? 300 : 580;   // particle count

  var DUR = {
    scatter:  2800,
    converge: 3000,
    hold:     2000,
    explode:   800
  };

  /* ── Build overlay ───────────────────────────────────────── */
  var overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<canvas id="intro-canvas"></canvas>' +
    '<button id="intro-skip" aria-label="Skip intro animation">Skip</button>';
  document.body.prepend(overlay);
  document.body.classList.add('js-intro');

  var canvas  = document.getElementById('intro-canvas');
  var ctx     = canvas.getContext('2d');
  var skipBtn = document.getElementById('intro-skip');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Particles ───────────────────────────────────────────── */
  function mkParticle(i) {
    /* Spawn along edges so they drift inward */
    var edge = i % 4;
    var x, y;
    if (edge === 0) { x = Math.random() * canvas.width;  y = -6; }
    else if (edge === 1) { x = canvas.width + 6;  y = Math.random() * canvas.height; }
    else if (edge === 2) { x = Math.random() * canvas.width;  y = canvas.height + 6; }
    else               { x = -6;  y = Math.random() * canvas.height; }

    return {
      x: x, y: y,
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      sz: Math.random() < 0.6 ? 2 : 3,
      a: 0,                           /* current alpha */
      ma: Math.random() * 0.5 + 0.45, /* max alpha */
      delay: Math.random() * 2000,
      born: Date.now(),
      tx: 0, ty: 0,                   /* converge targets */
      evx: 0, evy: 0                  /* explode velocity */
    };
  }

  var pts = [];
  for (var i = 0; i < N; i++) pts.push(mkParticle(i));

  /* ── Text pixel sampling ─────────────────────────────────── */
  function sampleText() {
    var off   = document.createElement('canvas');
    off.width = canvas.width; off.height = canvas.height;
    var oc    = off.getContext('2d');
    var fs    = Math.min(Math.max(canvas.width / 7, 36), mobile ? 54 : 86);
    var lines = mobile ? ['DIAR', 'AZEMI'] : ['DIAR AZEMI'];
    var lh    = fs * 1.18;
    var sy    = canvas.height / 2 - (lines.length - 1) * lh / 2;

    oc.fillStyle    = '#fff';
    oc.font         = '700 ' + fs + 'px Inter, sans-serif';
    oc.textAlign    = 'center';
    oc.textBaseline = 'middle';
    lines.forEach(function (l, idx) { oc.fillText(l, canvas.width / 2, sy + idx * lh); });

    var d   = oc.getImageData(0, 0, canvas.width, canvas.height).data;
    var res = [];
    var gap = mobile ? 5 : 4;
    for (var y = 0; y < canvas.height; y += gap)
      for (var x = 0; x < canvas.width;  x += gap)
        if (d[(y * canvas.width + x) * 4 + 3] > 120)
          res.push({ x: x, y: y });
    return res;
  }

  /* ── Easing helpers ──────────────────────────────────────── */
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  /* ── State machine ───────────────────────────────────────── */
  var phase   = 'scatter';
  var t0      = Date.now();
  var textPts = [];
  var bar     = 0;      /* progress bar 0–1 */
  var raf     = null;
  var dead    = false;

  function startConverge() {
    textPts = sampleText();
    var shuffled = textPts.slice().sort(function () { return Math.random() - 0.5; });
    pts.forEach(function (p, idx) {
      var t = shuffled[idx % shuffled.length];
      p.tx = t.x + (Math.random() - 0.5) * 2;
      p.ty = t.y + (Math.random() - 0.5) * 2;
    });
  }

  function startExplode() {
    var cx = canvas.width / 2, cy = canvas.height / 2;
    pts.forEach(function (p) {
      var angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.9;
      var spd   = Math.random() * 22 + 8;
      p.evx = Math.cos(angle) * spd;
      p.evy = Math.sin(angle) * spd;
    });
  }

  /* ── Draw glow helper (avoids expensive shadowBlur) ─────── */
  function drawPixel(x, y, sz, alpha, glow) {
    x = ~~x; y = ~~y;
    if (glow) {
      ctx.globalAlpha = alpha * 0.25;
      ctx.fillRect(x - 1, y - 1, sz + 2, sz + 2);
    }
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, y, sz, sz);
  }

  /* ── Main loop ───────────────────────────────────────────── */
  function frame() {
    if (dead) return;

    var now = Date.now();
    var el  = now - t0;

    /* Transitions */
    if (phase === 'scatter' && el >= DUR.scatter) {
      phase = 'converge'; t0 = now; el = 0; startConverge();
    } else if (phase === 'converge' && el >= DUR.converge) {
      phase = 'hold';    t0 = now; el = 0;
    } else if (phase === 'hold' && el >= DUR.hold) {
      phase = 'explode'; t0 = now; el = 0; startExplode();
    } else if (phase === 'explode' && el >= DUR.explode) {
      dead = true; reveal(); return;
    }

    /* Clear */
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Particles */
    ctx.fillStyle = ACCENT;
    pts.forEach(function (p) {
      var age = now - (p.born + p.delay);
      if (age < 0) return;

      if (phase === 'scatter') {
        p.a   = Math.min(p.ma, p.a + 0.016);
        p.x  += p.vx; p.y += p.vy;
        /* Wrap */
        if (p.x < -30) p.x = canvas.width  + 30;
        if (p.x > canvas.width  + 30) p.x = -30;
        if (p.y < -30) p.y = canvas.height + 30;
        if (p.y > canvas.height + 30) p.y = -30;
        /* Drift */
        p.vx += (Math.random() - 0.5) * 0.05; p.vx *= 0.985;
        p.vy += (Math.random() - 0.5) * 0.05; p.vy *= 0.985;

      } else if (phase === 'converge') {
        var spd = 0.052 + easeOutExpo(el / DUR.converge) * 0.072;
        p.x += (p.tx - p.x) * spd;
        p.y += (p.ty - p.y) * spd;
        p.a  = Math.min(1, p.a + 0.022);

      } else if (phase === 'hold') {
        p.x += (p.tx - p.x) * 0.2;
        p.y += (p.ty - p.y) * 0.2;
        var pulse = 0.8 + Math.sin(now / 360 + p.delay * 0.001) * 0.2;
        p.a = Math.min(1, p.ma * pulse * 1.15);
        bar = Math.min(1, el / DUR.hold);

      } else if (phase === 'explode') {
        var te = el / DUR.explode;
        p.x += p.evx; p.y += p.evy;
        p.a  = p.ma  * (1 - easeOutExpo(te));
      }

      if (p.a < 0.01) return;
      drawPixel(p.x, p.y, p.sz, p.a, phase === 'hold');
    });

    /* Subtitle text during hold */
    if (phase === 'hold' && bar > 0.18) {
      var subA = Math.min(1, (bar - 0.18) / 0.3) * 0.5;
      var fsSub = Math.max(10, Math.min(13, canvas.width * 0.023));
      var subY  = canvas.height / 2 + (mobile ? 50 : 76);
      ctx.save();
      ctx.globalAlpha    = subA;
      ctx.fillStyle      = '#aaaaaa';
      ctx.font           = '500 ' + fsSub + 'px Inter, sans-serif';
      ctx.textAlign      = 'center';
      ctx.textBaseline   = 'top';
      ctx.letterSpacing  = '0.14em';
      ctx.fillText('SOFTWARE DEVELOPER  ·  PRISHTINA', canvas.width / 2, subY);
      ctx.restore();
    }

    /* Progress bar */
    if (phase === 'hold') {
      var bw  = Math.min(240, canvas.width * 0.24);
      var bx  = (canvas.width - bw) / 2;
      var by  = canvas.height / 2 + (mobile ? 68 : 95);
      ctx.save();
      ctx.fillStyle   = ACCENT;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(bx, by, bw, 1);
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur  = 5;
      ctx.fillRect(bx, by, bw * bar, 1);
      ctx.shadowBlur  = 0;
      ctx.restore();
    }

    /* Flash on explode start */
    if (phase === 'explode') {
      var tf = el / DUR.explode;
      var fa = Math.max(0, 0.28 - tf * 0.45);
      if (fa > 0) {
        ctx.save();
        ctx.globalAlpha = fa;
        ctx.fillStyle   = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }

    raf = requestAnimationFrame(frame);
  }

  /* ── Site reveal (iPhone-style) ──────────────────────────── */
  function reveal() {
    cancelAnimationFrame(raf);

    /* Overlay zooms out + fades */
    overlay.classList.add('intro-exit');

    /* Site content scales in from slightly smaller */
    document.body.classList.add('intro-reveal');

    /* Clean up after transition */
    setTimeout(function () {
      overlay.remove();
      document.body.classList.remove('js-intro', 'intro-reveal');
      document.body.style.overflow = '';

      /* Kick off hero stagger */
      var hero = document.getElementById('hero');
      if (hero) {
        /* Tiny delay so the transition engine registers the change */
        requestAnimationFrame(function () {
          hero.classList.add('hero-animate');
        });
      }
    }, 980);
  }

  /* ── Skip button ─────────────────────────────────────────── */
  setTimeout(function () { skipBtn.classList.add('show'); }, 2600);
  skipBtn.addEventListener('click', function () {
    if (dead) return;
    cancelAnimationFrame(raf);
    dead = true;
    reveal();
  });

  /* ── Lock scroll, start ──────────────────────────────────── */
  document.body.style.overflow = 'hidden';
  raf = requestAnimationFrame(frame);

})();
