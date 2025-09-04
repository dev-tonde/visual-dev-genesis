// Service Worker for caching and performance optimization
const CACHE_NAME = 'tonderai-portfolio-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/assets/hero-bg.jpg',
  '/assets/programmer-hero-bg.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});