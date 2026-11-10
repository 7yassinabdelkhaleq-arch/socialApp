import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);
  getAllNotification(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'notifications?=false&page=1&limit=30');
  }
  getUnreadNotification(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'notifications?unread=false&page=1&limit=30');
  }
  getUnreadCount(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'notifications/unread-count');
  }
  markAllAsRead(): Observable<any> {
    return this.httpClient.patch(environment.baseUrl + 'notifications/read-all', {});
  }
  markNotificationAsRead(notifId: string): Observable<any> {
    return this.httpClient.patch(environment.baseUrl + 'notifications/' + notifId + '/read', {});
  }
}
