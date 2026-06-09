export interface Kpi {
  cle: string;
  libelle: string;
  valeur: number;
  delta: number;
  format: 'number' | 'currency';
}

export interface CaMois {
  mois: string;
  libelle: string;
  montant: number;
}

export interface StatutCount {
  statut: string;
  nombre: number;
  montant: number;
}

export interface TopClient {
  clientId: number;
  raisonSociale: string;
  ca: number;
  nombreMissions: number;
}

export interface Activite {
  type: string;
  titre: string;
  description: string;
  date: string;
}

export interface Dashboard {
  kpis: Kpi[];
  caParMois: CaMois[];
  missionsParStatut: StatutCount[];
  topClients: TopClient[];
  dernieresActivites: Activite[];
}

export interface ConsultantDashboard {
  kpis: Kpi[];
  caParMois: CaMois[];
  missionsParStatut: StatutCount[];
}
