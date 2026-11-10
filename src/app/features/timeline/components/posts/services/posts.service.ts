import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);
  getAllPosts(page: number, limit: number): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `posts?limit=${limit}&page=${page}`);
  }
  getSinglePost(postId: string): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `posts/${postId}`);
  }
  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(environment.baseUrl + `posts/${postId}`);
  }
  createPost(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + `posts`, data);
  }
  savePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `posts/${postId}/bookmark`, {});
  }
  unSavePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `posts/${postId}/bookmark`, {});
  }
  updatePost(postId: string, data: object): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `posts/${postId}`, data);
  }
  getSaved(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `users/bookmarks`);
  }
  getMyFeed(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `posts/feed?only=following&limit=30`);
  }
  getMyPosts(userId: string): Observable<any> {
    return this.httpClient.get(environment.baseUrl + `users/${userId}/posts`);
  }
  followUsers(userId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `users/${userId}/follow`, {});
  }
  unFollowUsers(userId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `users/${userId}/follow`, {});
  }
  likePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `posts/${postId}/like`, {});
  }
  unLikePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `posts/${postId}/like`, {});
  }
  sharePost(postId: string, data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + `posts/${postId}/share`, data);
  }
}
