export interface GlobalParameter {
  id: number;
  cle: string;
  libelle: string;
  valeur: string;
  groupe: string;
}

export interface AgencyProfile {
  id: number;
  raisonSociale?: string;
  siret?: string;
  tvaIntra?: string;
  adresse?: string;
  ville?: string;
  email?: string;
  telephone?: string;
  siteWeb?: string;
  iban?: string;
  logo?: string;
  signature?: string;
}

export interface SimulationRequest {
  tjm: number;
  joursParMois: number;
  fraisGestionPct?: number | null;
  chargesSalarialesPct?: number | null;
  chargesPatronalesPct?: number | null;
}

export interface SimulationResult {
  facturable: number;
  fraisGestion: number;
  coutEmployeur: number;
  chargesPatronales: number;
  brut: number;
  chargesSalariales: number;
  net: number;
  fraisGestionPct: number;
  chargesSalarialesPct: number;
  chargesPatronalesPct: number;
}

export interface Payslip {
  id: number;
  consultantId: number;
  consultantNom?: string;
  mois: string;
  joursTravailles: number;
  facturable: number;
  fraisGestion: number;
  brut: number;
  chargesSalariales: number;
  chargesPatronales: number;
  net: number;
  statut: string;
  createdAt: string;
}
