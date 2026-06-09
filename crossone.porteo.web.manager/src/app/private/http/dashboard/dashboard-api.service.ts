import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Dashboard, ConsultantDashboard } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private base = `${environment.apiUrl}dashboard`;
  constructor(private http: HttpClient) {}

  /** Renvoie le dashboard adapté au rôle (admin = global, consultant = ses données). */
  get(): Observable<Dashboard | ConsultantDashboard> {
    return this.http.get<Dashboard | ConsultantDashboard>(this.base);
  }
}
