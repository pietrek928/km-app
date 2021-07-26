import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KMService {
  constructor(private http: HttpClient) {}

  get endpoint() {
    return environment.api_endpoint;
  }

  get query_api() {
    return !environment.mock_api;
  }

  login(username: string, password: string): Observable<any> {
    if (this.query_api) {
      return this.http.post(`${this.endpoint}/login`, {
        username: username,
        password: password,
      });
    } else {
      return of('OK');
    }
  }

  logout(): Observable<any> {
    if (this.query_api) {
      return this.http.post(`${this.endpoint}/logout`, {});
    } else {
      return of('OK');
    }
  }

  get_username(): Observable<any> {
    if (this.query_api) {
      return this.http.post(`${this.endpoint}/username`, {});
    } else {
      return of('grzegorz');
    }
  }

  save(data: any): Observable<any> {
    if (this.query_api) {
      return this.http.post(`${this.endpoint}/save_position`, data);
    } else {
      return of('OK');
    }
  }
}
