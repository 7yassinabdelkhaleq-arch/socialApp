import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);
  getAllComments(PostId: string, limit: number = 15): Observable<any> {
    return this.httpClient.get(
      environment.baseUrl + `posts/${PostId}/comments?page=1&limit=${limit}`,
    );
  }
  createComment(postId: string, data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + `posts/${postId}/comments`, data);
  }
  deleteComment(postId: string, commintId: string): Observable<any> {
    return this.httpClient.delete(environment.baseUrl + `posts/${postId}/comments/${commintId}`);
  }
  updateCommint(postId: string, data: object, commentId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `posts/${postId}/comments/${commentId}`, data);
  }
  getCommentReplayes(postId: string, commentId: string): Observable<any> {
    return this.httpClient.get(
      environment.baseUrl + `posts/${postId}/comments/${commentId}/replies?page=1&limit=10`,
    );
  }
  creatReply(postId: string, commentId: string, data: object): Observable<any> {
    return this.httpClient.post(
      environment.baseUrl + `posts/${postId}/comments/${commentId}/replies`,
      data,
    );
  }
  commentLike(postId: string, commentId: string): Observable<any> {
    return this.httpClient.put(
      environment.baseUrl + `posts/${postId}/comments/${commentId}/like`,
      {},
    );
  }
}
