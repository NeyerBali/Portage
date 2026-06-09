import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Facture, FactureUpsert } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class FactureApiService {
  private base = `${environment.apiUrl}factures`;
  constructor(private http: HttpClient) {}

  list(): Observable<Facture[]> {
    return this.http.get<Facture[]>(this.base);
  }

  get(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.base}/${id}`);
  }

  create(dto: FactureUpsert): Observable<Facture> {
    return this.http.post<Facture>(this.base, dto);
  }

  update(id: number, dto: FactureUpsert): Observable<Facture> {
    return this.http.put<Facture>(`${this.base}/${id}`, dto);
  }

  markPaid(id: number): Observable<Facture> {
    return this.http.post<Facture>(`${this.base}/${id}/mark-paid`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
