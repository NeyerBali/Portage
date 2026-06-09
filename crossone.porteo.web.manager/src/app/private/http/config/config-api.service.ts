import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AgencyProfile, GlobalParameter, Payslip, SimulationRequest, SimulationResult } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class ConfigApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  parameters(): Observable<GlobalParameter[]> { return this.http.get<GlobalParameter[]>(`${this.base}config/parameters`); }
  updateParameter(cle: string, valeur: string): Observable<GlobalParameter> { return this.http.put<GlobalParameter>(`${this.base}config/parameters/${cle}`, { valeur }); }
  agency(): Observable<AgencyProfile> { return this.http.get<AgencyProfile>(`${this.base}config/agency`); }
  updateAgency(dto: AgencyProfile): Observable<AgencyProfile> { return this.http.put<AgencyProfile>(`${this.base}config/agency`, dto); }
  simulate(req: SimulationRequest): Observable<SimulationResult> { return this.http.post<SimulationResult>(`${this.base}config/simulate`, req); }

  // ---- Bulletins de paie ----
  payslips(): Observable<Payslip[]> { return this.http.get<Payslip[]>(`${this.base}payslips`); }
  generatePayslip(consultantId: number, mois: string): Observable<Payslip> { return this.http.post<Payslip>(`${this.base}payslips/generate`, { consultantId, mois }); }
  deletePayslip(id: number): Observable<void> { return this.http.delete<void>(`${this.base}payslips/${id}`); }
}
