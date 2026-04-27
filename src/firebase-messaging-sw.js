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

// ─── Vanilla IndexedDB helper (no npm packages available in SW) ───────────────
function saveNotificationToDB(notification) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notifications-db', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications_store')) {
        db.createObjectStore('notifications_store', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('notifications_store', 'readwrite');
      const store = tx.objectStore('notifications_store');
      store.put(notification);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = (e) => { db.close(); reject(e); };
    };

    request.onerror = (e) => reject(e);
  });
}

// Simple UUID generator (crypto.randomUUID not always available in older SWs)
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
// ─────────────────────────────────────────────────────────────────────────────

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Notification';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  const data  = payload.data || {};

  // 1. Show OS notification
  self.registration.showNotification(title, {
    body,
    icon: '/assets/icons/icon-128x128.png',
    data: { url: data['url'] || '/' },
  });

  // 2. Save to IndexedDB so the Angular app can display it
  const record = {
    id:          generateId(),
    title,
    body,
    role:        data['role']        || '',
    type:        data['type']        || '',
    redirectUrl: data['redirectUrl'] || '',
    jsonData:    data['jsonData']    || '',
    date:        Date.now(),
    isRead:      false,
  };

  saveNotificationToDB(record)
    .then(() => console.log('[SW] Notification saved to IndexedDB'))
    .catch((err) => console.error('[SW] Failed to save notification:', err));
});

// ─── Handle notification click: open/focus the app ───────────────────────────
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
