const CACHE = 'chok-v1';
const ASSETS = ['./', './index.html', './manifest.json', './vendor/hebcal.min.js', './data/index.json', './img/hero.jpg', './img/icon-192.png', './img/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'chok-data').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const isData = url.origin === location.origin && url.pathname.includes('/data/');
  const isSefaria = url.hostname.endsWith('sefaria.org');
  const bucket = isData ? 'chok-data' : CACHE;
  if (isSefaria) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (url.origin === location.origin || url.hostname.includes('gstatic') || url.hostname.includes('googleapis')) { const copy = res.clone(); caches.open(bucket).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
