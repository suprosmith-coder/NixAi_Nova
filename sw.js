/* ================================================================
   CYANIX AI -- Service Worker v13
   GitHub Pages: /NixAi_Nova/

   FIXED v13:
   v Removed optional catch binding (catch{} -> catch(e){})
   v Removed optional chaining (?.) -> explicit null checks
   v All modern syntax replaced with widely-supported equivalents
   v HTML + JS + CSS  -> NETWORK-FIRST (never serve stale code)
   v Nuclear cache clear on activate
   v Images / icons   -> Cache-first
   v Supabase / Groq  -> Bypass (never cache)
   v Offline fallback -> Cached index.html
================================================================ */

var VER   = 'cx-v16';
var CACHE = 'cx-v16';
var BASE  = '/NixAi_Nova';

var PREWARM = [
  BASE + '/cyanix_emblem.png',
  BASE + '/icons/manifest/icon-192x192.png',
  BASE + '/icons/manifest/icon-512x512.png',
];

var BYPASS_HOSTS = [
  'supabase.co', 'supabase.in',
  'api.groq.com',
  'playai.com',
];

/*    Install                                                 */
self.addEventListener('install', function(event) {
  console.log('[SW] install', VER);
  event.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(PREWARM); })
      .catch(function(e) { console.warn('[SW] prewarm failed (non-fatal):', e); })
  );
  self.skipWaiting();
});

/*    Activate: wipe all old caches                          */
self.addEventListener('activate', function(event) {
  console.log('[SW] activate', VER);
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        console.log('[SW] existing caches:', keys);
        return Promise.all(
          keys
            .filter(function(k) { return k !== CACHE; })
            .map(function(k) {
              console.log('[SW] WIPING:', k);
              return caches.delete(k);
            })
        );
      })
      .then(function() { return self.clients.claim(); })
      .then(function() {
        return self.clients.matchAll({ type: 'window' })
          .then(function(clients) {
            clients.forEach(function(c) {
              c.postMessage({ type: 'SW_UPDATED', version: VER });
            });
          });
      })
  );
});

/*    Fetch router                                            */
self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // Bypass Supabase, Groq -- never cache API calls
  for (var i = 0; i < BYPASS_HOSTS.length; i++) {
    if (url.hostname.indexOf(BYPASS_HOSTS[i]) !== -1) return;
  }

  // Google Fonts / jsDelivr CDN -- stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(swr(req));
    return;
  }

  var p = url.pathname;

  // HTML, JS, CSS -> network-first (always fresh code)
  if (req.mode === 'navigate' ||
      p.endsWith('.html') ||
      p.endsWith('.js')   ||
      p.endsWith('.css')  ||
      p === BASE + '/'    ||
      p === BASE) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Images, icons, manifest -> cache-first (stable)
  if (p.endsWith('.png')   || p.endsWith('.jpg')   || p.endsWith('.webp') ||
      p.endsWith('.svg')   || p.endsWith('.ico')   || p.endsWith('.json') ||
      p.endsWith('.woff')  || p.endsWith('.woff2')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Everything else -> network with cache fallback
  event.respondWith(swr(req));
});

/*    Strategies                                              */

function networkFirst(req) {
  return caches.open(CACHE).then(function(cache) {
    return fetch(req).then(function(res) {
      if (res && res.status === 200) {
        cache.put(req, res.clone());
      }
      return res;
    }).catch(function(err) {
      return cache.match(req).then(function(cached) {
        if (cached) return cached;
        return cache.match(BASE + '/index.html').then(function(shell) {
          if (shell) return shell;
          return cache.match(BASE + '/').then(function(root) {
            if (root) return root;
            return new Response(
              '<html><body style="font-family:sans-serif;padding:40px;text-align:center">' +
              '<h2>You\'re offline</h2>' +
              '<p>Reconnect to use Cyanix AI.</p>' +
              '<button onclick="location.reload()">Retry</button>' +
              '</body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        });
      });
    });
  });
}

function cacheFirst(req) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(req).then(function(cached) {
      if (cached) return cached;
      return fetch(req).then(function(res) {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(function() {
        return new Response('', { status: 404 });
      });
    });
  });
}

function swr(req) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(req).then(function(cached) {
      var netPromise = fetch(req).then(function(res) {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(function() {
        return cached;
      });
      return cached || netPromise;
    });
  });
}

/*    Push Notifications                                      */
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var p = { title: 'Cyanix AI', body: '' };
  try { p = event.data.json(); } catch(e) { p.body = event.data.text(); }
  event.waitUntil(
    self.registration.showNotification(p.title || 'Cyanix AI', {
      body:    p.body || '',
      icon:    BASE + '/icons/manifest/icon-192x192.png',
      badge:   BASE + '/icons/manifest/icon-96x96.png',
      vibrate: [100, 50, 100],
      data:    p.data || {},
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(list) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].url.indexOf(BASE) !== -1 && list[i].focus) {
            return list[i].focus();
          }
        }
        return clients.openWindow(BASE + '/');
      })
  );
});

/*    Messages                                                */
self.addEventListener('message', function(event) {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: VER });
    }
  }
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ ok: true });
      }
    });
  }
});
