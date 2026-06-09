import { Injectable } from '@angular/core';
import { MissionApiService } from './missions/mission-api.service';
import { ClientApiService } from './clients/client-api.service';
import { ConsultantApiService } from './consultants/consultant-api.service';
import { FactureApiService } from './factures/facture-api.service';
import { DashboardApiService } from './dashboard/dashboard-api.service';
import { JustificatifApiService } from './justificatifs/justificatif-api.service';
import { AlertApiService } from './alerts/alert-api.service';

/**
 * Façade d'accès à l'API REST, agrégeant un service par domaine
 * (même pattern que l'ApiService de la référence web.manager).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    public missions: MissionApiService,
    public clients: ClientApiService,
    public consultants: ConsultantApiService,
    public factures: FactureApiService,
    public dashboard: DashboardApiService,
    public justificatifs: JustificatifApiService,
    public alerts: AlertApiService,
  ) {}
}
