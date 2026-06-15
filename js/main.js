/* ============================================================
   main.js — Diar Azemi Portfolio
   Covers: dark-mode toggle, mobile nav, scroll-reveal,
   project filtering, active-section highlight in nav.
   ============================================================ */

(function () {
  'use strict';

  const html    = document.documentElement;
  const THEME_KEY = 'portfolio-theme';


  /* ── THEME ──────────────────────────────────────────────── */

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // The inline <script> in <head> already set the theme to avoid flash.
  // Here we just wire up the toggle button.
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
    // Set initial aria-label to match current theme
    applyTheme(html.getAttribute('data-theme') || 'dark');
  }


  /* ── MOBILE NAV ─────────────────────────────────────────── */

  var burger  = document.getElementById('nav-burger');
  var nav     = document.querySelector('.nav');
  var isOpen  = false;

  function openNav() {
    isOpen = true;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close navigation');
    nav.classList.add('nav--open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    isOpen = false;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('nav--open');
    document.body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      isOpen ? closeNav() : openNav();
    });

    // Close when any nav link is clicked
    nav.querySelectorAll('.nav__links a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeNav();
    });
  }


  /* ── SCROLL REVEAL ──────────────────────────────────────── */

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Browsers without IntersectionObserver: show everything immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ── PROJECT FILTERING ──────────────────────────────────── */

  var filterBtns   = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;

      // Update button states
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show / hide cards
      projectCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.removeAttribute('data-hidden');
          // Re-trigger reveal animation for newly visible cards
          if (!card.classList.contains('is-visible')) {
            card.classList.add('is-visible');
          }
        } else {
          card.setAttribute('data-hidden', 'true');
        }
      });
    });
  });


  /* ── ACTIVE NAV LINK ON SCROLL ──────────────────────────── */

  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (navLinks.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function (link) {
              var active = link.getAttribute('href') === '#' + id;
              link.classList.toggle('nav-active', active);
            });
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach(function (sec) {
      sectionObserver.observe(sec);
    });
  }


  /* ── HEADER SCROLL SHADOW ───────────────────────────────── */

  var header = document.querySelector('.site-header');
  if (header) {
    var lastScrollY = 0;
    window.addEventListener(
      'scroll',
      function () {
        var y = window.scrollY;
        // Add shadow when scrolled down even a few px
        header.style.boxShadow = y > 4
          ? '0 1px 0 var(--border)'
          : 'none';
        lastScrollY = y;
      },
      { passive: true }
    );
  }

})();
