import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Justificatif } from 'src/app/shared/models';

export interface JustificatifForm {
  missionId: number;
  type: string;
  libelle: string;
  montant?: number | null;
  dateJustificatif: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class JustificatifApiService {
  private base = `${environment.apiUrl}justificatifs`;
  constructor(private http: HttpClient) {}

  list(): Observable<Justificatif[]> {
    return this.http.get<Justificatif[]>(this.base);
  }

  create(form: JustificatifForm, file?: File): Observable<Justificatif> {
    const fd = new FormData();
    fd.append('MissionId', String(form.missionId));
    fd.append('Type', form.type);
    fd.append('Libelle', form.libelle);
    if (form.montant != null && form.montant !== undefined) fd.append('Montant', String(form.montant));
    fd.append('DateJustificatif', form.dateJustificatif);
    if (form.notes) fd.append('Notes', form.notes);
    if (file) fd.append('file', file, file.name);
    return this.http.post<Justificatif>(this.base, fd);
  }

  validate(id: number): Observable<Justificatif> {
    return this.http.post<Justificatif>(`${this.base}/${id}/validate`, {});
  }

  reject(id: number, motif: string): Observable<Justificatif> {
    return this.http.post<Justificatif>(`${this.base}/${id}/reject`, { motif });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/download`, { responseType: 'blob' });
  }
}
