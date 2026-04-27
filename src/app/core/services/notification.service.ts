import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messaging = inject(Messaging);

  requestPermission() {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(this.messaging, {
          vapidKey:
            'BEIvK5XQunye_7DNy89ps_Ydk9bvtP3iaZ3hIHSNQ5RP3TKSW6T4QoqnDIaRXN7XZfio8RT2QZpcUrd64IsWqHA',
        }).then((token) => {
          console.log('FCM Token:', token);
        });
      }
    });
  }

  listen() {
    onMessage(this.messaging, (payload) => {
      console.log('Foreground message:', payload);

      const title = payload.notification?.title ?? 'Notification';
      const options: NotificationOptions = {
        body: payload.notification?.body,
        data: { url: payload.data?.['url'] ?? '/' },
      };

      if (Notification.permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}
