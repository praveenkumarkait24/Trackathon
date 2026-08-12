self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const options = {
        body: payload.body,
        icon: '/logo.png',
        badge: '/logo-badge.png',
        data: {
          url: payload.url || '/'
        },
        actions: [
          { action: 'open', title: 'Open Trackathon' }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(payload.title || 'Trackathon Alert', options)
      );
    } catch (e) {
      // Fallback if data is raw text
      const text = event.data.text();
      const options = {
        body: text,
        icon: '/logo.png',
        badge: '/logo-badge.png'
      };
      event.waitUntil(
        self.registration.showNotification('Trackathon Reminder', options)
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  let targetUrl = '/';
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Redirect open window if it exists
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.navigate(targetUrl).then(c => c.focus());
        }
      }
      // Else open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Simple fetch handler to satisfy PWA installation requirements
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
