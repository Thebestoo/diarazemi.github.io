/* ================================================================
   DATABASE MODULE — localStorage (works offline, per-browser)
   ----------------------------------------------------------------
   WANT CROSS-DEVICE / REAL-TIME DATA? Upgrade to Firebase:
   1. Go to https://console.firebase.google.com/ → create a project
   2. Add a web app → copy the config object
   3. Enable "Realtime Database" (start in test mode)
   4. Replace the values in FIREBASE_CONFIG below
   5. Uncomment the Firebase block and delete the localStorage block
   ================================================================ */

/* -- Firebase upgrade block (uncomment to activate) --

import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, get, set, push, increment }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  databaseURL:       'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID'
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const rtdb = getDatabase(firebaseApp);

// Firebase DB would replace the DB object below with async Firebase calls.
// Contact the project owner or open an issue for the Firebase version.
*/

/* ================================================================
   LOCAL-STORAGE IMPLEMENTATION (default)
   ================================================================ */

const _LIKES_KEY    = 'cg_likes';
const _MY_KEY       = 'cg_my_likes';
const _COMMENTS_KEY = 'cg_comments';

function _load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || {}; }
  catch { return {}; }
}

function _save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

/* Public DB API — consumed by app.js */
const DB = {

  /* ---- LIKES ---- */

  getLikeCount(photoId) {
    return (_load(_LIKES_KEY)[photoId] || 0);
  },

  isLikedByMe(photoId) {
    const mine = _load(_MY_KEY);
    return !!mine[photoId];
  },

  toggleLike(photoId) {
    const counts = _load(_LIKES_KEY);
    const mine   = _load(_MY_KEY);

    const wasLiked  = !!mine[photoId];
    mine[photoId]   = !wasLiked;
    counts[photoId] = Math.max(0, (counts[photoId] || 0) + (wasLiked ? -1 : 1));

    _save(_LIKES_KEY, counts);
    _save(_MY_KEY, mine);

    return { count: counts[photoId], liked: !wasLiked };
  },

  /* ---- COMMENTS ---- */

  getComments(photoId) {
    return (_load(_COMMENTS_KEY)[photoId] || []);
  },

  addComment(photoId, name, text) {
    const all = _load(_COMMENTS_KEY);
    if (!all[photoId]) all[photoId] = [];

    const comment = {
      id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name:      name.trim().slice(0, 40),
      text:      text.trim().slice(0, 300),
      timestamp: Date.now()
    };

    all[photoId].unshift(comment);
    _save(_COMMENTS_KEY, all);
    return comment;
  }
};
