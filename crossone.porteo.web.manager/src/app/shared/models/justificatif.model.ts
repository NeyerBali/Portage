export type JustificatifStatut = 'en_attente' | 'valide' | 'refuse';

export interface Justificatif {
  id: number;
  libelle: string;
  type: string;
  montant?: number | null;
  dateJustificatif: string;
  notes?: string;
  statut: JustificatifStatut;
  motifRefus?: string;
  dateTraitement?: string | null;
  fileName?: string;
  hasFile: boolean;
  createdAt: string;
  missionId: number;
  missionTitre?: string;
  consultantId: number;
  consultantNom?: string;
  clientNom?: string;
}

export const JUSTIF_TYPES: { value: string; label: string }[] = [
  { value: 'frais', label: 'Note de frais' },
  { value: 'cra', label: 'CRA (compte-rendu)' },
  { value: 'document', label: 'Document' },
  { value: 'autre', label: 'Autre' },
];

export const JUSTIF_STATUTS: { value: JustificatifStatut; label: string }[] = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validé' },
  { value: 'refuse', label: 'Refusé' },
];

export function justifTypeLabel(v: string): string { return JUSTIF_TYPES.find(t => t.value === v)?.label ?? v; }
export function justifStatutLabel(v: string): string { return JUSTIF_STATUTS.find(t => t.value === v)?.label ?? v; }
