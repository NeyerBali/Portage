import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Mission, MissionQueryParams, MissionUpsert, PagedResult } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class MissionApiService {
  private base = `${environment.apiUrl}missions`;
  constructor(private http: HttpClient) {}

  list(q: MissionQueryParams = {}): Observable<PagedResult<Mission>> {
    let params = new HttpParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<PagedResult<Mission>>(this.base, { params });
  }

  get(id: number): Observable<Mission> {
    return this.http.get<Mission>(`${this.base}/${id}`);
  }

  create(dto: MissionUpsert): Observable<Mission> {
    return this.http.post<Mission>(this.base, dto);
  }

  update(id: number, dto: MissionUpsert): Observable<Mission> {
    return this.http.put<Mission>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
