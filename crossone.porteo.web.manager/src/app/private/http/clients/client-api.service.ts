import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Client, ClientDetail, ClientUpsert } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private base = `${environment.apiUrl}clients`;
  constructor(private http: HttpClient) {}

  list(): Observable<Client[]> {
    return this.http.get<Client[]>(this.base);
  }

  /** Fiche client avec ses missions (relation 1‑N). */
  get(id: number): Observable<ClientDetail> {
    return this.http.get<ClientDetail>(`${this.base}/${id}`);
  }

  create(dto: ClientUpsert): Observable<Client> {
    return this.http.post<Client>(this.base, dto);
  }

  update(id: number, dto: ClientUpsert): Observable<Client> {
    return this.http.put<Client>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
