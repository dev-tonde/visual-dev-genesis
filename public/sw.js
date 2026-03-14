const OFFLINE_CACHE = 'offline-v1';
const OFFLINE_URLS = ['/offline.html', '/manifest.json', '/favicon.ico', '/og-image.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) => cache.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) =>
            cacheName === OFFLINE_CACHE ? undefined : caches.delete(cacheName)
          )
        )
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || request.mode !== 'navigate') {
    return;
  }

  // Keep runtime behavior simple: use the network when it is available and
  // show a dedicated offline page when navigation fails.
  event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
});
