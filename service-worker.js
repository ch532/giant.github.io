const CACHE_NAME = 'connectgold-cache-v2.0.0';
const urlsToCache = [
  // DO NOT CACHE '/' or 'index.html' to avoid outdated homepage
  '/manifest.json',
  '/connect gold (1).png',
  '/gold (2).png'
];

// Install Event
self.addEventListener('install', event => {
  console.log('Service worker installed.');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate Event
self.addEventListener('activate', event => {
  console.log('Service worker activated.');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Unified Fetch Listener
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Don't cache index.html or navigation
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    return; // Skip caching, fetch live
  }

  // Serve cached assets if available
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

// Share Target Handling (POST to /share-target.html)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === '/share-target.html' && event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const title = formData.get('title') || '';
        const text = formData.get('text') || '';
        const sharedUrl = formData.get('url') || '';

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head><title>Shared Content Received</title></head>
          <body>
            <h1>Content Shared to Connect Gold</h1>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Text:</strong> ${text}</p>
            <p><strong>URL:</strong> <a href="${sharedUrl}" target="_blank">${sharedUrl}</a></p>
          </body>
          </html>
        `;

        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        });
      })()
    );
  }
});
