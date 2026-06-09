export type FactureStatut = 'brouillon' | 'emise' | 'payee';

export interface Facture {
  id: number;
  numero: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  statut: FactureStatut;
  dateEmission: string;
  dateEcheance: string;
  missionId: number;
  missionTitre?: string;
  clientId?: number;
  clientNom?: string;
}

export interface FactureUpsert {
  missionId: number;
  montantHT: number;
  tauxTva: number;
  dateEmission: string;
  dateEcheance: string;
  statut: FactureStatut;
}

export const FACTURE_STATUTS: { value: FactureStatut; label: string }[] = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'emise', label: 'Émise' },
  { value: 'payee', label: 'Payée' },
];

export function factureStatutLabel(s: string): string {
  return FACTURE_STATUTS.find(x => x.value === s)?.label ?? s;
}
