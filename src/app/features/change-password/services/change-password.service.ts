import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ChangePasswordService {
  private readonly httpClient = inject(HttpClient);
  changePassword(data: object): Observable<any> {
    return this.httpClient.patch(environment.baseUrl + 'users/change-password', data);
  }
}
