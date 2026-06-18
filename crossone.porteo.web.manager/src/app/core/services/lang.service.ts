import { Injectable, signal } from '@angular/core';

export type Lang = 'fr' | 'en';
const KEY = 'porteo-lang';

/** Dictionnaire EN (clé = libellé FR). Clé absente → on garde le FR. */
const EN: Record<string, string> = {
  // Groupes de navigation
  'Général': 'General', 'Activité': 'Activity', 'Facturation': 'Billing',
  'RH & Production': 'HR & Production', 'Administration': 'Administration',
  'Mon activité': 'My activity', 'RH': 'HR', 'Outils': 'Tools',
  // Éléments de navigation
  'Tableau de bord': 'Dashboard', 'Mon tableau de bord': 'My dashboard',
  "Centre d'alerte": 'Alert center', "Centre d'analyse": 'Analytics center', 'Mes alertes': 'My alerts', 'Journal': 'Activity log',
  'Missions': 'Missions', 'Mes missions': 'My missions',
  'Clients': 'Clients', 'Consultants': 'Consultants',
  'Factures': 'Invoices', 'Mes factures': 'My invoices',
  'Justificatifs': 'Documents', 'Mes justificatifs': 'My documents',
  'CRA': 'Timesheets', 'Mes CRA': 'My timesheets',
  'Absences': 'Time off', 'Mes absences': 'My time off',
  'Demandes': 'Requests', 'Mes demandes': 'My requests',
  'Bulletins': 'Payslips', 'Mes bulletins': 'My payslips',
  'Simulateur': 'Simulator', 'Paramètres': 'Settings', 'Mon profil': 'My profile', 'Assistant IA': 'AI Assistant',
  // Barre du haut
  'Administrateur': 'Administrator', 'Consultant': 'Consultant',
  'Rechercher une mission, un client, un consultant…': 'Search a mission, client or consultant…',
  'Déconnexion': 'Sign out',
  // Tableau de bord
  "Chiffre d'affaires": 'Revenue', 'Missions par statut': 'Missions by status',
  'Top 5 clients': 'Top 5 clients', 'Dernières activités': 'Recent activity',
  'Tout voir →': 'View all →', '12 derniers mois': 'Last 12 months',
  'Mon CA cumulé': 'My total revenue', 'Mes missions en cours': 'My active missions',
  'Jours saisis (ce mois)': 'Days logged (this month)', 'Justificatifs en attente': 'Pending documents',
  'Missions actives': 'Active missions', 'Factures impayées': 'Unpaid invoices',
};

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>((localStorage.getItem(KEY) as Lang) || 'fr');

  set(l: Lang): void { localStorage.setItem(KEY, l); this.lang.set(l); }
  toggle(): void { this.set(this.lang() === 'fr' ? 'en' : 'fr'); }

  /** Traduit un libellé FR vers la langue active (FR = identité). */
  t(key: string): string {
    if (!key) return key;
    return this.lang() === 'en' ? (EN[key] ?? key) : key;
  }
}
