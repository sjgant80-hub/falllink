// FallLink service worker · cache-first for offline use
const CACHE = 'falllink-v1';
const ASSETS = ['./', './index.html', './falllink.js', './manifest.webmanifest'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    caches.match(ev.request).then(hit => hit || fetch(ev.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(ev.request, clone)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
