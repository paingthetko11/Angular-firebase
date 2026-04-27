import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './core/services/notification.service';
import { NotificationDBService } from './core/services/notification.db';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  notifications: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private db: NotificationDBService,
  ) {}

  async ngOnInit() {
    await this.notificationService.requestPermission();

    this.notificationService.listen();

    // Load notifications from IndexedDB, sorted newest first
    from(this.db.getAllNotifications()).subscribe((res: any[]) => {
      this.notifications = res.sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      console.log(this.notifications);
    });
  }

  trackById(n: any) {
    return n.id;
  }

  getTimeAgo(timestamp: any): string {
    const now = new Date().getTime();
    const past = new Date(timestamp).getTime();
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

    return `${Math.floor(diff / 86400)} days ago`;
  }
}
