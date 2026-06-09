import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Consultant, ConsultantDetail, ConsultantUpsert } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class ConsultantApiService {
  private base = `${environment.apiUrl}consultants`;
  constructor(private http: HttpClient) {}

  list(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(this.base);
  }

  get(id: number): Observable<ConsultantDetail> {
    return this.http.get<ConsultantDetail>(`${this.base}/${id}`);
  }

  create(dto: ConsultantUpsert): Observable<Consultant> {
    return this.http.post<Consultant>(this.base, dto);
  }

  update(id: number, dto: ConsultantUpsert): Observable<Consultant> {
    return this.http.put<Consultant>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
