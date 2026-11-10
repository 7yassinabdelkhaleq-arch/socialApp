import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { PostsService } from '../../posts/services/posts.service';

@Injectable({
  providedIn: 'root',
})
export class SuggestedSecService {
  private readonly httpClient = inject(HttpClient);
  getSuggestedFriends(limit: number = 5): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `users/suggestions?limit=${limit}`);
  }
}
