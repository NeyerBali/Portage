import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Absence, Cra, Demande } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class RhApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ---- CRA ----
  crasList(): Observable<Cra[]> { return this.http.get<Cra[]>(`${this.base}cras`); }
  craCreate(dto: any): Observable<Cra> { return this.http.post<Cra>(`${this.base}cras`, dto); }
  craSubmit(id: number): Observable<Cra> { return this.http.post<Cra>(`${this.base}cras/${id}/submit`, {}); }
  craValidate(id: number): Observable<Cra> { return this.http.post<Cra>(`${this.base}cras/${id}/validate`, {}); }
  craRefuse(id: number): Observable<Cra> { return this.http.post<Cra>(`${this.base}cras/${id}/refuse`, {}); }
  craDelete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}cras/${id}`); }

  // ---- Absences ----
  absencesList(): Observable<Absence[]> { return this.http.get<Absence[]>(`${this.base}absences`); }
  absenceCreate(dto: any): Observable<Absence> { return this.http.post<Absence>(`${this.base}absences`, dto); }
  absenceApprove(id: number): Observable<Absence> { return this.http.post<Absence>(`${this.base}absences/${id}/approve`, {}); }
  absenceRefuse(id: number): Observable<Absence> { return this.http.post<Absence>(`${this.base}absences/${id}/refuse`, {}); }
  absenceDelete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}absences/${id}`); }

  // ---- Demandes ----
  demandesList(): Observable<Demande[]> { return this.http.get<Demande[]>(`${this.base}demandes`); }
  demandeCreate(dto: any): Observable<Demande> { return this.http.post<Demande>(`${this.base}demandes`, dto); }
  demandeRepondre(id: number, dto: { statut: string; reponse: string }): Observable<Demande> { return this.http.post<Demande>(`${this.base}demandes/${id}/repondre`, dto); }
  demandeDelete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}demandes/${id}`); }
}
