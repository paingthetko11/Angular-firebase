importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDPRhtA8dcjMdT6yFZx0i62d5PGDONZBRY',
  authDomain: 'angular-firebase-93df0.firebaseapp.com',
  projectId: 'angular-firebase-93df0',
  storageBucket: 'angular-firebase-93df0.firebasestorage.app',
  messagingSenderId: '29552555542',
  appId: '1:29552555542:web:afed88f23b367fdd816737',
  measurementId: 'G-G149DH9NTL',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/assets/icons/icon-128x128.png',
    data: {
      url: payload.data?.url || '/',
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
