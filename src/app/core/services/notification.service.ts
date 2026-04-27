import { inject, Injectable, NgZone } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { NotificationDBService } from './notification.db';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messaging = inject(Messaging);
  private readonly zone = inject(NgZone);
  private readonly db = inject(NotificationDBService);

  requestPermission() {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(this.messaging, {
          vapidKey:
            'BEIvK5XQunye_7DNy89ps_Ydk9bvtP3iaZ3hIHSNQ5RP3TKSW6T4QoqnDIaRXN7XZfio8RT2QZpcUrd64IsWqHA',
        })
          .then((token) => console.log('✅ FCM Token:', token))
          .catch((err) => console.error('❌ Error getting FCM token:', err));
      }
    });
  }

  listen() {
    onMessage(this.messaging, (payload) => {
      this.zone.run(async () => {
        console.log('📨 Foreground message received', payload);

        const title = payload.notification?.title || 'FCM';
        const body = payload.notification?.body || '';
        const data = payload.data || {};

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/assets/icons/icon-192x192.png' });
        }

        // Persist to IndexedDB
        try {
          await this.db.addNotification({
            id: crypto.randomUUID(),
            title,
            body,
            role: data['role'] ?? '',
            type: data['type'] ?? '',
            redirectUrl: data['redirectUrl'] ?? '',
            jsonData: data['jsonData'] ?? '',
          });
        } catch (err) {
          console.error('❌ Error saving notification to IndexedDB:', err);
        }
      });
    });
  }
}
