/**
 * sw.js — Cyanix AI Service Worker  v2.0
 * ----------------------------------------
 * Strategy:
 *   - App shell (HTML/CSS/JS/icons)  → Cache-first, update in background
 *   - API calls (supabase / edge fn) → Network-only (never cache)
 *   - Images / fonts                 → Stale-while-revalidate
 *   - Everything else                → Network-first, fall back to cache
 *
 * On new SW install:
 *   1. Pre-cache the app shell
 *   2. Skip waiting so the new SW activates immediately
 *   3. Claim all clients so pages get the new SW right away
 */

const CACHE_VERSION   = 'cyanix-v2';
const RUNTIME_CACHE   = 'cyanix-runtime-v2';
const OFFLINE_PAGE    = './index.html';

// App shell files to pre-cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  // Icons — android
  './icons/manifest/icon-192x192.png',
  './icons/manifest/icon-512x512.png',
  // Icons — iOS
  './icons/ios/apple-touch-icon-180x180.png',
];

// Patterns that should NEVER be cached (always go to network)
const NEVER_CACHE = [
  /supabase\.co\/functions/,   // all edge function calls
  /supabase\.co\/auth/,        // auth endpoints
  /supabase\.co\/rest/,        // database REST
  /supabase\.co\/realtime/,    // realtime
  /googleapis\.com/,
  /gstatic\.com/,
  /github\.io\/.*\?/,          // versioned asset fetches
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', function(event) {
  console.log('[SW] Installing', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function(cache) {
        return cache.addAll(PRECACHE_URLS.map(function(url) {
          // Use Request with cache:'reload' so we always get fresh copies on install
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(function() {
        console.log('[SW] Pre-cache complete');
        // Activate immediately without waiting for old SW to finish
        return self.skipWaiting();
      })
      .catch(function(err) {
        console.warn('[SW] Pre-cache failed (some files may be missing):', err.message);
        // Still skip waiting even if some precache files failed
        return self.skipWaiting();
      })
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(name) {
              // Delete any old caches that aren't our current ones
              return name !== CACHE_VERSION && name !== RUNTIME_CACHE;
            })
            .map(function(name) {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(function() {
        // Take control of all open pages immediately
        return self.clients.claim();
      })
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url     = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Never cache — go straight to network
  if (NEVER_CACHE.some(function(pattern) { return pattern.test(request.url); })) {
    return; // let the browser handle it normally
  }

  // Navigate requests (HTML pages) — network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          // Cache a fresh copy of the page
          if (response.ok) {
            var clone = response.clone();
            caches.open(RUNTIME_CACHE).then(function(cache) { cache.put(request, clone); });
          }
          return response;
        })
        .catch(function() {
          // Offline — serve cached index.html
          return caches.match(OFFLINE_PAGE).then(function(cached) {
            return cached || new Response('<h1>Cyanix AI</h1><p>You are offline.</p>', {
              headers: { 'Content-Type': 'text/html' },
            });
          });
        })
    );
    return;
  }

  // App shell files (JS, CSS, manifest) — cache-first, update in background
  if (isAppShell(url)) {
    event.respondWith(
      caches.match(request).then(function(cached) {
        var networkFetch = fetch(request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_VERSION).then(function(cache) { cache.put(request, clone); });
          }
          return response;
        });
        // Serve cached version immediately, update in background
        return cached || networkFetch;
      })
    );
    return;
  }

  // Images and fonts — stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(function(cache) {
        return cache.match(request).then(function(cached) {
          var networkFetch = fetch(request).then(function(response) {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(function() { return cached; });
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Default — network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(RUNTIME_CACHE).then(function(cache) { cache.put(request, clone); });
        }
        return response;
      })
      .catch(function() {
        return caches.match(request);
      })
  );
});

// ── Message handler (from app: skip-waiting trigger) ─────────────────────────
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function isAppShell(url) {
  var path = url.pathname;
  return (
    path.endsWith('.js')   ||
    path.endsWith('.css')  ||
    path.endsWith('manifest.json') ||
    path === '/'           ||
    path.endsWith('/index.html')
  );
}

function isStaticAsset(url) {
  var path = url.pathname;
  return (
    /\.(png|jpg|jpeg|webp|svg|ico|gif|avif|woff2?|ttf|eot)$/.test(path)
  );
}
