import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NotificationDB extends DBSchema {
  notifications_store: {
    key: string;
    value: {
      id: string;
      title: string;
      body: string;
      role: string;
      type: string;
      redirectUrl: string;
      jsonData: string;
      date: number;
      isRead: boolean;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationDBService {
  private readonly dbPromise!: Promise<IDBPDatabase<NotificationDB>>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB() {
    return await openDB<NotificationDB>('notifications-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notifications_store')) {
          db.createObjectStore('notifications_store', { keyPath: 'id' });
        }
      },
    });
  }

  async addNotification(notification: any) {
    const db = await this.dbPromise;

    await db.put('notifications_store', {
      ...notification,
      date: Date.now(),
      isRead: false,
    });
  }

  async getAllNotifications() {
    const db = await this.dbPromise;
    return await db.getAll('notifications_store');
  }

  async clearNotifications() {
    const db = await this.dbPromise;
    await db.clear('notifications_store');
  }
}
