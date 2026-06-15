/* ============================================================
   main.js — Diar Azemi Portfolio
   Features: dark-mode toggle · mobile nav · scroll reveal ·
   cursor glow · 3D card tilt · magnetic buttons · counter
   animation · timeline line draw · text scramble ·
   skill-tag wave · active nav tracking
   ============================================================ */

(function () {
  'use strict';

  var html = document.documentElement;
  var THEME_KEY = 'portfolio-theme';


  /* ── THEME ──────────────────────────────────────────────── */

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-label',
      t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    applyTheme(html.getAttribute('data-theme') || 'dark');
    themeBtn.addEventListener('click', function () {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }


  /* ── MOBILE NAV ─────────────────────────────────────────── */

  var burger = document.getElementById('nav-burger');
  var nav    = document.querySelector('.nav');
  var open   = false;

  function openNav() {
    open = true;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close navigation');
    nav.classList.add('nav--open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    open = false;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('nav--open');
    document.body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () { open ? closeNav() : openNav(); });
    nav.querySelectorAll('.nav__links a').forEach(function (l) {
      l.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) closeNav();
    });
  }


  /* ── CURSOR GLOW (dark mode desktop only) ───────────────── */

  var glow = null;

  function initCursorGlow() {
    if (window.innerWidth < 768) return;
    glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    var tx = window.innerWidth  / 2;
    var ty = window.innerHeight / 2;
    var cx = tx, cy = ty;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    /* Smooth lag with lerp */
    (function lerp() {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      if (glow) {
        glow.style.left = cx + 'px';
        glow.style.top  = cy + 'px';
      }
      requestAnimationFrame(lerp);
    })();
  }

  initCursorGlow();


  /* ── SCROLL REVEAL ──────────────────────────────────────── */

  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ── COUNTER ANIMATION ──────────────────────────────────── */

  function animateCount(el) {
    var target   = parseInt(el.dataset.target, 10);
    var duration = 1600;
    var start    = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      /* easeOutExpo */
      var v = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(v * target);
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(function (el) {
      countObs.observe(el);
    });
  }


  /* ── TEXT SCRAMBLE on section titles ────────────────────── */

  var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function scramble(el) {
    var orig = el.textContent;
    var iter = 0;
    var id   = setInterval(function () {
      el.textContent = orig.split('').map(function (ch, i) {
        if (ch === ' ') return ' ';
        if (i < Math.floor(iter)) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      iter += 0.55;
      if (iter > orig.length) { el.textContent = orig; clearInterval(id); }
    }, 28);
  }

  if ('IntersectionObserver' in window) {
    var scrObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          scramble(e.target);
          scrObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-scramble]').forEach(function (el) {
      scrObs.observe(el);
    });
  }


  /* ── TIMELINE LINE DRAW ─────────────────────────────────── */

  if ('IntersectionObserver' in window) {
    var fill = document.getElementById('timeline-fill');
    if (fill) {
      var lineObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            fill.classList.add('animated');
            lineObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      lineObs.observe(document.getElementById('experience') || fill);
    }
  }


  /* ── 3D CARD TILT ───────────────────────────────────────── */

  var MAX_TILT   = 7;   /* degrees */
  var MAX_SHIFT  = 4;   /* px lift on hover */

  function initTilt() {
    document.querySelectorAll('.project-card').forEach(function (card) {
      var rect;

      card.addEventListener('mouseenter', function () {
        rect = card.getBoundingClientRect();
        card.style.transition = 'border-color 0.22s, box-shadow 0.22s';
        card.style.boxShadow  = '0 20px 50px rgba(0,0,0,0.28)';
      });

      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width  - 0.5;  /* -0.5 … 0.5 */
        var y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = [
          'perspective(700px)',
          'rotateX(' + (y * -MAX_TILT) + 'deg)',
          'rotateY(' + (x *  MAX_TILT) + 'deg)',
          'translateZ(' + MAX_SHIFT + 'px)'
        ].join(' ');
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.22s, box-shadow 0.5s';
        card.style.transform  = '';
        card.style.boxShadow  = '';
        rect = null;
      });
    });
  }

  initTilt();


  /* ── MAGNETIC BUTTONS ───────────────────────────────────── */

  function initMagnetic() {
    if (window.innerWidth < 768) return; /* desktop only */

    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var rect;

      btn.addEventListener('mouseenter', function () {
        rect = btn.getBoundingClientRect();
        btn.style.transition = 'transform 0.1s ease, background 0.13s, box-shadow 0.13s';
      });

      btn.addEventListener('mousemove', function (e) {
        if (!rect) rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width  / 2) * 0.28;
        var y = (e.clientY - rect.top  - rect.height / 2) * 0.28;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1), background 0.13s, box-shadow 0.13s';
        btn.style.transform  = '';
        rect = null;
      });
    });
  }

  initMagnetic();


  /* ── PROJECT FILTER ─────────────────────────────────────── */

  var filterBtns   = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;

      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      projectCards.forEach(function (c) {
        var show = f === 'all' || c.dataset.category === f;
        if (show) c.removeAttribute('data-hidden');
        else       c.setAttribute('data-hidden', 'true');
      });

      /* Re-init tilt after filter changes visible cards */
      initTilt();
    });
  });


  /* ── ACTIVE NAV LINK ────────────────────────────────────── */

  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (navLinks.length && 'IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle('nav-active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(function (s) { navObs.observe(s); });
  }


  /* ── HEADER BORDER ON SCROLL ────────────────────────────── */

  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.borderBottomColor =
        window.scrollY > 8 ? 'var(--border)' : 'transparent';
    }, { passive: true });
  }

})();
