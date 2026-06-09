import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlertCategory, Activity, SearchResult } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class AlertApiService {
  constructor(private http: HttpClient) {}

  alerts(): Observable<AlertCategory[]> {
    return this.http.get<AlertCategory[]>(`${environment.apiUrl}alerts`);
  }

  activities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${environment.apiUrl}activities`);
  }

  search(q: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${environment.apiUrl}search`, { params: { q } });
  }
}
