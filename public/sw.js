// Equilibrium Food — Service Worker
// Handles Web Push events and notification clicks.

self.addEventListener('push', (event) => {
  let data = {
    title: 'Equilibrium Food',
    body: 'Your order status has been updated.',
    url: '/orders',
  };

  if (event.data) {
    try {
      Object.assign(data, event.data.json());
    } catch {
      // ignore malformed payload
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'order-update',
      renotify: true,
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/orders';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing tab if possible, otherwise open new one
        const existing = windowClients.find(
          (c) => c.url.startsWith(self.location.origin) && 'focus' in c
        );
        if (existing) {
          return existing.focus().then((w) => w.navigate(targetUrl));
        }
        return clients.openWindow(targetUrl);
      })
  );
});
