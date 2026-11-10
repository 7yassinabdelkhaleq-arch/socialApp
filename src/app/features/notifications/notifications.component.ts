import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { Notification } from './models/notification.interface';
import { ShortTimeAgoPipe } from '../../shared/pipes/short-time-ago-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [ShortTimeAgoPipe, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  allNotifications = signal<Notification[]>([]);
  activeTab = signal<'all' | 'unread'>('all');
  unreadCount = signal<number | null>(null);
  ngOnInit(): void {
    this.getAllNotification();
    this.getUnreadCount();
  }
  getAllNotification(): void {
    this.allNotifications.set([]);
    this.notificationsService.getAllNotification().subscribe({
      next: (res) => {
        console.log(res.data.notifications);
        this.allNotifications.set(res.data.notifications);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: (res) => {
        console.log(res);
        if (this.activeTab() === 'unread') {
          this.getUnReadNotification();
        } else if (this.activeTab() === 'all') {
          this.getAllNotification();
        }
        this.getUnreadCount();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe({
      next: (res) => {
        console.log(res);
        this.unreadCount.set(res.data.unreadCount);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  markNotificationAsRead(id: string): void {
    this.notificationsService.markNotificationAsRead(id).subscribe({
      next: (res) => {
        console.log(res);
        if (this.activeTab() === 'unread') {
          this.getUnReadNotification();
        } else if (this.activeTab() === 'all') {
          this.getAllNotification();
        }
        this.getUnreadCount();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getUnReadNotification(): void {
    this.allNotifications.set([]);
    this.notificationsService.getUnreadNotification().subscribe({
      next: (res) => {
        console.log(res.data.notifications);
        this.allNotifications.set(res.data.notifications);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
