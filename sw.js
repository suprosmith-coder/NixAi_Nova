/* ════════════════════════════════════════════════════════════════
   CYANIX AI — Service Worker v11
   GitHub Pages: /NixAi_Nova/

   CRITICAL CHANGES v11:
   ✓ HTML + JS + CSS  → NETWORK-FIRST (never serve stale code)
   ✓ Nuclear cache clear on activate (wipes ALL old cache names)
   ✓ Images / icons   → Cache-first (stable assets)
   ✓ Supabase / Groq  → Bypass entirely (never cache)
   ✓ Offline fallback → Cached index.html when offline
════════════════════════════════════════════════════════════════ */

const VER   = 'cx-v11';
const CACHE = 'cx-v11';                   // single cache name
const BASE  = '/NixAi_Nova';

// Assets to pre-warm on install (stable images only — no JS/CSS/HTML)
const PREWARM = [
  `${BASE}/cyanix_emblem.png`,
  `${BASE}/icons/manifest/icon-192x192.png`,
  `${BASE}/icons/manifest/icon-512x512.png`,
];

// Never intercept these origins
const BYPASS_HOSTS = [
  'supabase.co', 'supabase.in',
  'api.groq.com',
  'playai.com',
];

// ── Install ────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] install', VER);
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PREWARM))
      .catch(e => console.warn('[SW] prewarm failed (non-fatal):', e))
  );
  // Take control immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate: NUCLEAR wipe of ALL old caches ──────────────────
self.addEventListener('activate', event => {
  console.log('[SW] activate', VER);
  event.waitUntil(
    // Delete EVERY cache that isn't the current one
    caches.keys()
      .then(keys => {
        console.log('[SW] existing caches:', keys);
        return Promise.all(
          keys
            .filter(k => k !== CACHE)
            .map(k => { console.log('[SW] WIPING:', k); return caches.delete(k); })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Notify all open tabs that SW updated
        return self.clients.matchAll({ type: 'window' })
          .then(clients => clients.forEach(c =>
            c.postMessage({ type: 'SW_UPDATED', version: VER })
          ));
      })
  );
});

// ── Fetch router ───────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;           // let POST through

  const url = new URL(req.url);

  // 1. Bypass: Supabase, Groq — always network, never cache
  if (BYPASS_HOSTS.some(h => url.hostname.includes(h))) return;

  // 2. Google Fonts CDN — stale-while-revalidate (never blocks render)
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(swr(req)); return;
  }

  const p = url.pathname;

  // 3. HTML, JS, CSS → NETWORK-FIRST
  //    Ensures users always get the latest code.
  //    Falls back to cache ONLY if truly offline.
  if (
    req.mode === 'navigate' ||
    p.endsWith('.html')     ||
    p.endsWith('.js')       ||
    p.endsWith('.css')      ||
    p === `${BASE}/`        ||
    p === `${BASE}`
  ) {
    event.respondWith(networkFirst(req)); return;
  }

  // 4. Images, icons, manifest → cache-first (stable, rarely change)
  if (
    p.endsWith('.png')  || p.endsWith('.jpg') || p.endsWith('.webp') ||
    p.endsWith('.svg')  || p.endsWith('.ico') || p.endsWith('.json') ||
    p.endsWith('.woff') || p.endsWith('.woff2')
  ) {
    event.respondWith(cacheFirst(req)); return;
  }

  // 5. Everything else → network with cache fallback
  event.respondWith(swr(req));
});

// ── Strategies ─────────────────────────────────────────────────

// Network-first: try network, fall back to cache on failure
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.status === 200) {
      cache.put(req, res.clone()); // update cache in background
    }
    return res;
  } catch {
    // Offline — serve from cache
    const cached = await cache.match(req);
    if (cached) return cached;
    // Last resort: serve the app shell
    const shell = await cache.match(`${BASE}/index.html`) ||
                  await cache.match(`${BASE}/`);
    return shell || new Response(
      '<html><body style="font-family:sans-serif;padding:40px;text-align:center">'
      + '<h2>You\'re offline</h2>'
      + '<p>Reconnect to use Cyanix AI.</p>'
      + '<button onclick="location.reload()">Retry</button>'
      + '</body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Cache-first: return cached if exists, else fetch + cache
async function cacheFirst(req) {
  const cache  = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch {
    return cached || new Response('', { status: 404 });
  }
}

// Stale-while-revalidate: return cached, update in background
async function swr(req) {
  const cache  = await caches.open(CACHE);
  const cached = await cache.match(req);
  const net    = fetch(req).then(res => {
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || net;
}

// ── Push Notifications ─────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  let p = { title: 'Cyanix AI', body: '' };
  try { p = event.data.json(); } catch { p.body = event.data.text(); }
  event.waitUntil(
    self.registration.showNotification(p.title || 'Cyanix AI', {
      body:    p.body || '',
      icon:    `${BASE}/icons/manifest/icon-192x192.png`,
      badge:   `${BASE}/icons/manifest/icon-96x96.png`,
      vibrate: [100, 50, 100],
      data:    p.data || {},
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        for (const c of list) {
          if (c.url.includes(BASE) && 'focus' in c) return c.focus();
        }
        return clients.openWindow(`${BASE}/`);
      })
  );
});

// ── Messages ───────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING')  self.skipWaiting();
  if (event.data.type === 'GET_VERSION')   event.ports[0]?.postMessage({ version: VER });
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.ports[0]?.postMessage({ ok: true }));
  }
});
