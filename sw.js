const CACHE = 'nailpa-v1';
const PRECACHE = [
  './',
  './index.html',
  './quiz.html',
  './flashcards.html',
  './phrases.html',
  './practical.html',
  './exam-day.html',
  './progress.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg',
  './huong-dan-hoc-part1.html',
  './huong-dan-hoc-part2.html',
  './huong-dan-hoc-part3.html',
  './de-thi-thu-1.html',
  './de-thi-thu-2.html',
  './the-ghi-nho-part1.html',
  './the-ghi-nho-part2.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      PRECACHE.map(url => c.add(url).catch(() => null))
    ))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Network-first for HTML (freshness) with cache fallback (offline).
// Cache-first for everything else (static assets).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML = req.destination === 'document' ||
                 req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }))
    );
  }
});
