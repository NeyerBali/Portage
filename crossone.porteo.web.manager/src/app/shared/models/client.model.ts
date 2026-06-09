import { Mission } from './mission.model';

export interface Client {
  id: number;
  raisonSociale: string;
  siret?: string;
  secteur: string;
  contact: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville: string;
  nombreMissions: number;
  missionsActives: number;
  caCumule: number;
  encoursImpaye: number;
}

export interface ClientDetail extends Client {
  missions: Mission[];
}

export interface ClientUpsert {
  raisonSociale: string;
  siret?: string;
  secteur: string;
  contact: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville: string;
}
