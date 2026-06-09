export type MissionStatut = 'brouillon' | 'en_cours' | 'terminee' | 'facturee' | 'annulee';

export interface Mission {
  id: number;
  titre: string;
  description?: string;
  statut: MissionStatut;
  dateDebut: string;
  dateFin: string;
  tjm: number;
  jours: number;
  montant: number;
  clientId: number;
  clientNom?: string;
  consultantId: number;
  consultantNom?: string;
  nombreFactures?: number;
}

export interface MissionUpsert {
  titre: string;
  description?: string;
  statut: MissionStatut;
  dateDebut: string;
  dateFin: string;
  tjm: number;
  jours: number;
  clientId: number;
  consultantId: number;
}

export const MISSION_STATUTS: { value: MissionStatut; label: string }[] = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminée' },
  { value: 'facturee', label: 'Facturée' },
  { value: 'annulee', label: 'Annulée' },
];

export function missionStatutLabel(s: string): string {
  return MISSION_STATUTS.find(x => x.value === s)?.label ?? s;
}
