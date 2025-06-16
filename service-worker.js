const CACHE_NAME = 'connectgold-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/connect gold (1).png',
  '/gold (2).png'
  // Add other assets you want cached here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
