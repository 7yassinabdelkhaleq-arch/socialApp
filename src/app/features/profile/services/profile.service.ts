import { HttpClient } from '@angular/common/http';
import { inject, Injectable, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly httpClient = inject(HttpClient);
  getProfileData(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'users/profile-data');
  }
  getUserPosts(userId: string): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'users/' + userId + '/posts');
  }
  getBookMarks(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'users/bookmarks');
  }
  uploadProfilePhoto(data: object): Observable<any> {
    return this.httpClient.put(environment.baseUrl + 'users/upload-photo', data);
  }
  uploadProfileCover(data: object): Observable<any> {
    return this.httpClient.put(environment.baseUrl + 'users/upload-cover', data);
  }
}
