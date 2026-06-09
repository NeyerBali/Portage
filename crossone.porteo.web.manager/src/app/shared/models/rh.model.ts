export interface Cra {
  id: number;
  missionId: number;
  missionTitre?: string;
  consultantId: number;
  consultantNom?: string;
  mois: string;
  joursTravailles: number;
  joursAbsence: number;
  commentaire?: string;
  statut: string;
  createdAt: string;
}

export interface Absence {
  id: number;
  consultantId: number;
  consultantNom?: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  motif?: string;
  statut: string;
}

export interface Demande {
  id: number;
  consultantId: number;
  consultantNom?: string;
  type: string;
  objet: string;
  montant?: number | null;
  description?: string;
  statut: string;
  reponse?: string;
  createdAt: string;
}

export const CRA_STATUTS: Record<string, string> = { brouillon: 'Brouillon', soumis: 'Soumis', valide: 'Validé', refuse: 'Refusé' };
export const ABSENCE_TYPES = [
  { value: 'conge_paye', label: 'Congé payé' }, { value: 'rtt', label: 'RTT' },
  { value: 'maladie', label: 'Maladie' }, { value: 'sans_solde', label: 'Sans solde' },
];
export const ABSENCE_STATUTS: Record<string, string> = { demande: 'Demandé', approuve: 'Approuvé', refuse: 'Refusé' };
export const DEMANDE_TYPES = [
  { value: 'acompte', label: 'Acompte' }, { value: 'attestation', label: 'Attestation' },
  { value: 'materiel', label: 'Matériel' }, { value: 'autre', label: 'Autre' },
];
export const DEMANDE_STATUTS: Record<string, string> = { ouverte: 'Ouverte', traitee: 'Traitée', refusee: 'Refusée' };

export function rhLabel(map: Record<string, string>, v: string): string { return map[v] ?? v; }
