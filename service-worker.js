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
// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'affiliate-sync') {
    event.waitUntil(syncAffiliateClicks());
  }
});

async function syncAffiliateClicks() {
  try {
    await fetch('/sync-affiliate-clicks');
  } catch (err) {
    console.error('Sync failed', err);
  }
}

// Periodic Sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'buzz-refresh') {
    event.waitUntil(refreshBuzzContent());
  }
});

async function refreshBuzzContent() {
  try {
    const res = await fetch('/api/latest-buzz');
    const data = await res.json();
    console.log('Buzz refreshed', data);
  } catch (err) {
    console.error('Periodic sync failed', err);
  }
}

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'connect gold (2).png',
    badge: 'badge.png',
    data: { url: data.url }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
