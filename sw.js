/* ══════════════════════════════════════════════════════════════
   CYANIX AI — Service Worker (sw.js)
   Strategy:
     • App shell (HTML/CSS/JS/fonts) → Cache-first, update in background
     • Supabase API calls            → Network-only (never cache)
     • Images / icons               → Cache-first, long TTL
     • Unknown navigation requests  → Serve index.html (SPA fallback)
══════════════════════════════════════════════════════════════ */

const CACHE_NAME    = 'cyanix-ai-v1';
const RUNTIME_CACHE = 'cyanix-runtime-v1';

// Files to pre-cache on install (app shell)
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './JavaScript.js',
  './manifest.json',
  './cyanix_emblem.png',
  // Icons
  '.manifest/icon-192x192.png',
  '.manifest/icon-512x512.png',
];

// Never cache these — always go to network
const NETWORK_ONLY = [
  'supabase.co',          // all Supabase API calls (auth, edge functions)
  'api.groq.com',         // direct Groq (future-proofing)
  'fonts.googleapis.com', // font CSS (needs fresh version checks)
];

// ── Install: pre-cache app shell ─────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        // Don't fail install if some optional assets 404
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
  // Take control immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Non-GET — always network
  if (request.method !== 'GET') return;

  // 2. Network-only origins (Supabase, Groq, etc.)
  if (NETWORK_ONLY.some(origin => url.hostname.includes(origin))) return;

  // 3. Google Fonts stylesheets — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 4. CDN scripts (Supabase JS, etc.) — stale-while-revalidate
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 5. App shell files — cache-first
  if (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css')  ||
    url.pathname.endsWith('.js')   ||
    url.pathname.endsWith('.png')  ||
    url.pathname.endsWith('.jpg')  ||
    url.pathname.endsWith('.svg')  ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/')
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // 6. Navigation requests — serve index.html for SPA routing
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(request))
    );
    return;
  }

  // 7. Everything else — network with runtime cache fallback
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

// ── Cache Strategies ──────────────────────────────────────────

// Cache-first: return cached if exists, else fetch + cache
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkRes = await fetch(request);
    if (networkRes && networkRes.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch {
    // Offline and not cached — return offline fallback if available
    return caches.match('./index.html');
  }
}

// Stale-while-revalidate: return cached immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache     = await caches.open(cacheName);
  const cached    = await cache.match(request);
  const fetchPromise = fetch(request).then(networkRes => {
    if (networkRes && networkRes.status === 200) {
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  }).catch(() => cached); // If network fails, fall through to cached

  return cached || fetchPromise;
}

// ── Push Notifications (future-ready) ────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json().catch(() => ({ title: 'Cyanix AI', body: event.data.text() }));
  event.waitUntil(
    data.then(payload =>
      self.registration.showNotification(payload.title || 'Cyanix AI', {
        body:  payload.body  || '',
        icon:  './icons/manifest/icon-192x192.png',
        badge: './icons/manifest/icon-96x96.png',
        data:  payload.data  || {},
      })
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ── Message handler (for "skip waiting" from UI) ──────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
  }
});
E });
  }
});
