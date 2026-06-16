import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../http/api.service';
import { Activite, Kpi, TopClient } from 'src/app/shared/models';
import { missionStatutLabel } from 'src/app/shared/models';
import { DonutSegment } from 'src/app/shared/components/charts/donut-chart.component';
import { AreaPoint } from 'src/app/shared/components/charts/area-chart.component';
import { BarItem } from 'src/app/shared/components/charts/bar-list.component';

const STATUT_COLORS: Record<string, string> = {
  brouillon: '#64748B', en_cours: '#2D7FF9', terminee: '#15A66A', facturee: '#8B5CF6', annulee: '#B0443A',
};

@Component({
  selector: 'app-dashboard-index',
  standalone: false,
  templateUrl: './dashboard-index.component.html',
  styleUrls: ['./dashboard-index.component.scss'],
})
export class DashboardIndexComponent implements OnInit {
  loading = true;
  skeletons = [0, 1, 2, 3];
  kpis: Kpi[] = [];
  donut: DonutSegment[] = [];
  area: AreaPoint[] = [];
  topClients: BarItem[] = [];
  activites: Activite[] = [];

  constructor(public auth: AuthService, private api: ApiService) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get greeting(): string {
    const h = new Date().getHours();
    const m = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
    return `${m}, ${this.auth.fullName.split(' ')[0] || ''}`;
  }

  ngOnInit(): void {
    this.api.dashboard.get().subscribe({
      next: (d: any) => {
        this.kpis = d.kpis ?? [];
        this.donut = (d.missionsParStatut ?? []).map((s: any) => ({
          label: missionStatutLabel(s.statut), value: s.nombre, color: STATUT_COLORS[s.statut] ?? '#64748B',
        }));
        this.area = (d.caParMois ?? []).map((c: any) => ({ label: c.libelle, value: c.montant }));
        this.topClients = (d.topClients ?? []).map((t: TopClient) => ({ label: t.raisonSociale, value: t.ca }));
        this.activites = d.dernieresActivites ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  kpiIcon(cle: string): string {
    return { ca: '€', missions: '◆', consultants: '◉', impayees: '▤' }[cle] ?? '◧';
  }

  /** Détail affiché dans la tooltip au survol d'un KPI. */
  kpiTip(k: Kpi): string {
    const val = `${Math.round(k.valeur).toLocaleString('fr-FR')}${k.format === 'currency' ? ' €' : ''}`;
    const desc: Record<string, string> = {
      ca: "Chiffre d'affaires facturé cumulé.",
      missions: 'Missions actuellement actives.',
      consultants: "Consultants rattachés à l'agence.",
      impayees: 'Factures émises non encore réglées.',
    };
    const lines = [`${k.libelle} : ${val}`];
    if (k.deltaLabel) lines.push(`${k.deltaDir === 'down' ? '↓' : '↑'} ${k.deltaLabel} vs mois précédent`);
    if (desc[k.cle]) lines.push(desc[k.cle]);
    return lines.join('\n');
  }

  sparkColor(tone?: string): string {
    return {
      brand: 'var(--emerald-700)', info: 'var(--info-600)',
      warn: 'var(--warning-600)', error: 'var(--error-600)',
    }[tone ?? 'brand'] ?? 'var(--primary)';
  }
}
