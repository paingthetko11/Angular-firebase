import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Secondtime-Angular-Firebase');

  constructor(private notification: NotificationService) {}

  ngOnInit(): void {
    this.notification.requestPermission();

    this.notification.listen();
  }
}
