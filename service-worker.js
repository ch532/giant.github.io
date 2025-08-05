self.addEventListener('install', (event) => {
  console.log('✅ Service worker installed');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-ads') {
    event.waitUntil(handleAdRefresh());
  }
});

async function handleAdRefresh() {
  // Fetch or update ad data silently in the background
  const response = await fetch('/api/refresh-ads');
  const result = await response.json();
  console.log('🔁 Ads refreshed:', result);
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Connect Gold";
  const options = {
    body: data.body || "You have a new message!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: data.url || "/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url;
  event.waitUntil(clients.openWindow(url));
});
