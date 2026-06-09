import { Mission } from './mission.model';

export interface Consultant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite: string;
  tjm: number;
  ville: string;
  competences?: string;
  statut: 'active' | 'paused';
  nombreMissions: number;
  missionsActives: number;
  caCumule: number;
}

export interface ConsultantDetail extends Consultant {
  missions: Mission[];
}

export interface ConsultantUpsert {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite: string;
  tjm: number;
  ville: string;
  competences?: string;
  statut: string;
}
