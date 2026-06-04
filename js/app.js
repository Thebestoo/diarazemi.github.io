/* ================================================================
   COUPLES GALLERY — MAIN APPLICATION
   ================================================================ */

/* ================================================================
   STEP 1 — EDIT YOUR INFO HERE
   ================================================================ */

const CONFIG = {
  partner1:  'Diar',           // ← Your name
  partner2:  'My Love',        // ← Her name (edit this!)
  startDate: '2026-06-03',     // ← Your anniversary (YYYY-MM-DD)
};

/* ================================================================
   STEP 2 — EDIT YOUR PHOTO STORIES HERE
   Put your photos in the /images/ folder named photo1.jpg … photo5.jpg
   Then fill in the date, title, story, and location for each one.
   ================================================================ */

const PHOTOS = [
  {
    id:       'photo1',
    src:      'images/photo1.jpg',
    date:     'November 2024',
    title:    'That night was everything',
    story:    'You decided to make the whole place laugh and I fell for you even more in that moment. There\'s something about the way you can just be yourself — completely free, completely wonderful — that gets me every time. I love you for exactly who you are.',
    location: 'Our night out'
  },
  {
    id:       'photo2',
    src:      'images/photo2.jpg',
    date:     'December 2024',
    title:    'Driving nowhere with you',
    story:    'It doesn\'t matter where we\'re going as long as you\'re in the passenger seat. These late-night drives have become my favourite kind of adventure — just you, me, and the city lights blurring past the windows.',
    location: 'Late-night drives'
  },
  {
    id:       'photo3',
    src:      'images/photo3.jpg',
    date:     'December 2024',
    title:    'That smile says everything',
    story:    'I took this photo because I wanted to remember exactly how you looked at me in this moment. You make everything feel brighter, even the darkest nights. I am so lucky it\'s you.',
    location: 'Our favourite ride'
  },
  {
    id:       'photo4',
    src:      'images/photo4.jpg',
    date:     'December 2024',
    title:    'Our kind of silly',
    story:    'The Peppa Pig era. I genuinely do not know whose idea this was, but it is one of my favourite photos of us. We never take ourselves too seriously — and that\'s exactly what makes us, us.',
    location: 'Same night, same laughs'
  },
  {
    id:       'photo5',
    src:      'images/photo5.jpg',
    date:     'December 2024',
    title:    'Just us',
    story:    'Sometimes I look at you and I can\'t believe I get to call you mine. This tilted selfie somehow captures it perfectly — a little chaotic, totally spontaneous, and full of something real.',
    location: 'Anywhere with you'
  }
];

/* ================================================================
   FLOATING HEARTS PARTICLE SYSTEM
   ================================================================ */

(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  const SYMBOLS = ['♥', '♡', '✦', '✧', '·'];
  let particles = [];
  let rafId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor(randomY = false) { this.spawn(randomY); }

    spawn(randomY) {
      this.x        = Math.random() * canvas.width;
      this.y        = randomY ? Math.random() * canvas.height : canvas.height + 20;
      this.vy       = -(0.25 + Math.random() * 0.55);
      this.vx       = (Math.random() - 0.5) * 0.22;
      this.size     = 8 + Math.random() * 10;
      this.opacity  = 0.12 + Math.random() * 0.22;
      this.angle    = Math.random() * Math.PI * 2;
      this.spin     = (Math.random() - 0.5) * 0.018;
      this.symbol   = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const hue     = 345 + Math.random() * 20;
      const sat     = 55 + Math.random() * 20;
      const lit     = 65 + Math.random() * 15;
      this.color    = `hsl(${hue},${sat}%,${lit}%)`;
    }

    update() {
      this.x     += this.vx;
      this.y     += this.vy;
      this.angle += this.spin;
      if (this.y < -30) this.spawn(false);
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha   = this.opacity;
      ctx.fillStyle     = this.color;
      ctx.font          = `${this.size}px serif`;
      ctx.textAlign     = 'center';
      ctx.textBaseline  = 'middle';
      ctx.fillText(this.symbol, 0, 0);
      ctx.restore();
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    rafId = requestAnimationFrame(tick);
  }

  resize();
  particles = Array.from({ length: 28 }, (_, i) => new Particle(i < 20));
  tick();
  window.addEventListener('resize', resize, { passive: true });
})();

/* ================================================================
   NAV SCROLL BEHAVIOUR
   ================================================================ */

(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ================================================================
   HERO — APPLY CONFIG NAMES
   ================================================================ */

document.getElementById('hero-name1').textContent = CONFIG.partner1;
document.getElementById('hero-name2').textContent = CONFIG.partner2;

/* ================================================================
   LIVE TOGETHER COUNTER — ticks every second, forever
   ================================================================ */

(function initCounter() {
  const start = new Date(CONFIG.startDate);   // midnight on start date

  const elDays  = document.getElementById('cnt-days');
  const elHours = document.getElementById('cnt-hours');
  const elMins  = document.getElementById('cnt-minutes');
  const elSecs  = document.getElementById('cnt-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick(el, value) {
    const next = String(value);
    if (el.textContent === next) return;
    el.textContent = next;
    el.classList.remove('tick');
    void el.offsetWidth;              // force reflow to restart animation
    el.classList.add('tick');
    setTimeout(() => el.classList.remove('tick'), 180);
  }

  function update() {
    const totalMs = Math.max(0, Date.now() - start.getTime());
    const totalSecs = Math.floor(totalMs / 1000);

    const days    = Math.floor(totalSecs / 86400);
    const hours   = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    tick(elDays,  days.toLocaleString());
    tick(elHours, pad(hours));
    tick(elMins,  pad(minutes));
    tick(elSecs,  pad(seconds));
  }

  // First paint after hero animations, then every second
  setTimeout(() => { update(); setInterval(update, 1000); }, 1100);
})();

/* ================================================================
   GALLERY RENDERING
   ================================================================ */

function renderGallery() {
  const grid = document.getElementById('gallery-grid');

  PHOTOS.forEach((photo, idx) => {
    const card = document.createElement('div');
    card.className   = 'photo-card';
    card.tabIndex    = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open photo: ${photo.title}`);
    card.dataset.idx = idx;

    const liked = DB.isLikedByMe(photo.id);
    const likes = DB.getLikeCount(photo.id);

    card.innerHTML = `
      <img class="card-img" src="${photo.src}" alt="${photo.title}" loading="lazy"
           onerror="this.src='data:image/svg+xml,${encodeURIComponent(placeholderSVG(photo.title))}'">
      <div class="card-overlay" aria-hidden="true">
        <div class="card-date">${photo.date}</div>
        <div class="card-bottom">
          <p class="card-story">${photo.story}</p>
          <div class="card-actions">
            <button class="card-btn like-card-btn ${liked ? 'liked' : ''}"
                    data-id="${photo.id}" aria-label="Like">
              ♥ <span class="card-like-num">${likes}</span>
            </button>
            <button class="card-btn open-btn" aria-label="View story">View Story</button>
          </div>
        </div>
      </div>`;

    /* Like from card (without opening lightbox) */
    card.querySelector('.like-card-btn').addEventListener('click', e => {
      e.stopPropagation();
      handleLike(photo.id, e.currentTarget);
    });

    /* Open lightbox */
    const openLb = () => openLightbox(idx);
    card.querySelector('.open-btn').addEventListener('click', e => {
      e.stopPropagation();
      openLb();
    });
    card.addEventListener('click', openLb);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); }
    });

    grid.appendChild(card);
  });
}

/* Inline SVG placeholder when image is missing */
function placeholderSVG(title) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='533' viewBox='0 0 400 533'>
    <rect width='400' height='533' fill='%230e0e1a'/>
    <text x='200' y='240' text-anchor='middle' font-family='serif' font-size='56' fill='%23e8756a'>♥</text>
    <text x='200' y='290' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%23666'>${title}</text>
    <text x='200' y='315' text-anchor='middle' font-family='sans-serif' font-size='11' fill='%23444'>Add image to /images/</text>
  </svg>`;
}

/* ================================================================
   SCROLL-REVEAL ANIMATION (IntersectionObserver)
   ================================================================ */

function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.photo-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    observer.observe(el);
  });
}

/* ================================================================
   LIGHTBOX
   ================================================================ */

let currentIdx = 0;

const lb         = document.getElementById('lightbox');
const lbImg      = document.getElementById('lb-img');
const lbLoader   = document.getElementById('lb-loader');
const lbDate     = document.getElementById('lb-date');
const lbLocation = document.getElementById('lb-location');
const lbTitle    = document.getElementById('lb-title');
const lbStory    = document.getElementById('lb-story');
const lbLikeBtn  = document.getElementById('lb-like');
const lbHeart    = document.getElementById('lb-heart');
const lbCount    = document.getElementById('lb-like-count');
const lbShare    = document.getElementById('lb-share');
const lbDownload = document.getElementById('lb-download');

function openLightbox(idx) {
  currentIdx = idx;
  const photo = PHOTOS[idx];

  /* Meta */
  lbDate.textContent     = photo.date;
  lbLocation.textContent = photo.location ? `📍 ${photo.location}` : '';
  lbTitle.textContent    = photo.title;
  lbStory.textContent    = photo.story;

  /* Image loading */
  lbLoader.classList.remove('hidden');
  lbImg.style.opacity = '0';
  lbImg.onload = () => {
    lbLoader.classList.add('hidden');
    lbImg.style.opacity = '1';
  };
  lbImg.onerror = () => {
    lbLoader.classList.add('hidden');
    lbImg.style.opacity = '1';
  };
  lbImg.src = photo.src;
  lbImg.alt = photo.title;

  /* Likes */
  refreshLikeUI(photo.id);

  /* Comments */
  renderComments(photo.id);

  /* Open */
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}

function closeLightbox() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  const next = (currentIdx + dir + PHOTOS.length) % PHOTOS.length;
  openLightbox(next);
}

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', () => navigateLightbox(-1));
document.getElementById('lb-next').addEventListener('click', () => navigateLightbox(1));

/* Close on backdrop click */
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

/* Keyboard navigation */
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigateLightbox(-1);
  if (e.key === 'ArrowRight')  navigateLightbox(1);
});

/* Touch/swipe support */
let touchStartX = 0;
lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) navigateLightbox(dx < 0 ? 1 : -1);
}, { passive: true });

/* ================================================================
   LIKES
   ================================================================ */

function refreshLikeUI(photoId) {
  const liked = DB.isLikedByMe(photoId);
  const count = DB.getLikeCount(photoId);
  lbLikeBtn.classList.toggle('liked', liked);
  lbCount.textContent = count;

  /* Sync card button */
  const cardBtn = document.querySelector(`.like-card-btn[data-id="${photoId}"]`);
  if (cardBtn) {
    cardBtn.classList.toggle('liked', liked);
    cardBtn.querySelector('.card-like-num').textContent = count;
  }
}

function handleLike(photoId, btnEl) {
  const { count, liked } = DB.toggleLike(photoId);

  /* Card button */
  if (btnEl) {
    btnEl.classList.toggle('liked', liked);
    btnEl.querySelector('.card-like-num').textContent = count;
    btnEl.querySelector(':scope > :first-child') &&
      (btnEl.style.animation = 'none') &&
      requestAnimationFrame(() => (btnEl.style.animation = ''));
  }

  /* Lightbox button (if current photo) */
  if (PHOTOS[currentIdx]?.id === photoId) refreshLikeUI(photoId);

  showToast(liked ? '♥ Liked!' : 'Like removed');
}

lbLikeBtn.addEventListener('click', () => {
  const photo = PHOTOS[currentIdx];
  handleLike(photo.id, null);
  /* Animate lightbox heart */
  lbHeart.style.animation = 'none';
  requestAnimationFrame(() => {
    lbHeart.style.animation = 'likePoP 0.4s var(--ease-spring) forwards';
  });
});

/* ================================================================
   COMMENTS
   ================================================================ */

function renderComments(photoId) {
  const list    = document.getElementById('comments-list');
  const badge   = document.getElementById('comments-badge');
  const comments = DB.getComments(photoId);

  badge.textContent = comments.length;

  if (comments.length === 0) {
    list.innerHTML = '<p class="no-comments">Be the first to leave a comment 💕</p>';
    return;
  }

  list.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-meta">
        <span class="comment-author">${escapeHTML(c.name)}</span>
        <span class="comment-time">${formatTime(c.timestamp)}</span>
      </div>
      <p class="comment-text">${escapeHTML(c.text)}</p>
    </div>`).join('');
}

document.getElementById('comment-submit').addEventListener('click', () => {
  const nameEl = document.getElementById('comment-name');
  const textEl = document.getElementById('comment-text');
  const name   = nameEl.value.trim();
  const text   = textEl.value.trim();

  if (!name) { nameEl.focus(); showToast('Please enter your name'); return; }
  if (!text) { textEl.focus(); showToast('Please write a comment'); return; }

  const photo = PHOTOS[currentIdx];
  DB.addComment(photo.id, name, text);
  renderComments(photo.id);

  textEl.value = '';
  showToast('Comment posted ♥');
});

/* ================================================================
   SHARE
   ================================================================ */

lbShare.addEventListener('click', async () => {
  const photo = PHOTOS[currentIdx];
  const url   = `${location.origin}${location.pathname}#${photo.id}`;
  const data  = { title: photo.title, text: photo.story.slice(0, 80) + '…', url };

  if (navigator.share && navigator.canShare(data)) {
    try { await navigator.share(data); return; } catch { /* cancelled */ }
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!');
  } catch {
    showToast('Copy this link: ' + url);
  }
});

/* ================================================================
   DOWNLOAD
   ================================================================ */

lbDownload.addEventListener('click', async () => {
  const photo    = PHOTOS[currentIdx];
  const filename = `${photo.date} — ${photo.title}.jpg`.replace(/[/\\:*?"<>|]/g, '-');

  try {
    const resp = await fetch(photo.src);
    if (!resp.ok) throw new Error();
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href     = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
    showToast('Photo saved ♥');
  } catch {
    window.open(photo.src, '_blank');
    showToast('Opening photo — save from your browser');
  }
});

/* ================================================================
   TOAST HELPER
   ================================================================ */

let toastTimer;

function showToast(msg, duration = 2600) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ================================================================
   UTILITIES
   ================================================================ */

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60_000);
  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ================================================================
   BOOT
   ================================================================ */

renderGallery();
initScrollReveal();
