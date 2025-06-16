if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('sw.js').then(async reg => {
    console.log('✅ Service Worker registered');

    // Background Sync
    if ('sync' in reg) {
      await reg.sync.register('affiliate-sync');
    }

    // Periodic Sync
    if ('periodicSync' in reg) {
      const permission = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (permission.state === 'granted') {
        await reg.periodicSync.register('buzz-refresh', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
      }
    }

    // Push Notification
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: '<YOUR_VAPID_PUBLIC_KEY>'
      });

      await fetch('/save-subscription', {
        method: 'POST',
        body: JSON.stringify(sub),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  });
}
