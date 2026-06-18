import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../http/api.service';
import { Consultant, Facture, Mission } from 'src/app/shared/models';

interface SimResult { mean: number; p10: number; p50: number; p90: number; min: number; max: number; hist: number[]; bins: number; width: number; }

@Component({
  selector: 'app-analyse',
  standalone: false,
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.scss'],
})
export class AnalyseComponent implements OnInit, OnDestroy {
  // ── 1) Chargement PARALLÈLE (forkJoin) ───────────────────────────────────
  loading = true;
  loadMs = 0;
  missions: Mission[] = [];
  factures: Facture[] = [];
  consultants: Consultant[] = [];

  // ── 2) Filtres RÉACTIFS (combineLatest) ──────────────────────────────────
  search$ = new BehaviorSubject<string>('');
  statut$ = new BehaviorSubject<string | null>(null);
  private factures$ = new BehaviorSubject<Facture[]>([]);
  filtered$!: Observable<Facture[]>;
  statuts = ['brouillon', 'emise', 'payee', 'annulee'];

  // ── 3) Web Worker (Monte-Carlo) ──────────────────────────────────────────
  runs = 20000;
  running = false;
  progress = 0;
  result?: SimResult;
  private worker?: Worker;

  constructor(private api: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.filtered$ = combineLatest([this.factures$, this.search$, this.statut$]).pipe(
      map(([list, q, st]) => {
        const s = q.trim().toLowerCase();
        return list.filter(f =>
          (!st || f.statut === st) &&
          (!s || f.numero.toLowerCase().includes(s) || (f.clientNom || '').toLowerCase().includes(s) || (f.missionTitre || '').toLowerCase().includes(s)));
      }),
    );

    // forkJoin : 3 appels API lancés EN PARALLÈLE, résolus ensemble.
    const t0 = performance.now();
    this.loading = true;
    forkJoin({
      missions: this.api.missions.list({ pageSize: 500 }),
      factures: this.api.factures.list(),
      consultants: this.api.consultants.list(),
    }).subscribe({
      next: ({ missions, factures, consultants }) => {
        this.missions = missions.items ?? [];
        this.factures = factures;
        this.consultants = consultants;
        this.factures$.next(this.factures);
        this.loadMs = Math.round(performance.now() - t0);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  ngOnDestroy(): void { this.worker?.terminate(); }

  get impayes(): Facture[] { return this.factures.filter(f => f.statut === 'emise'); }
  get totalImpaye(): number { return this.impayes.reduce((s, f) => s + f.montantTTC, 0); }
  get caEncaisse(): number { return this.factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montantTTC, 0); }
  get missionsActives(): number { return this.missions.filter(m => m.statut === 'en_cours').length; }

  onSearch(v: string): void { this.search$.next(v); }
  onStatut(v: string | null): void { this.statut$.next(v); }

  // Lance la simulation sur un THREAD séparé → l'UI reste fluide.
  runSimulation(): void {
    const impayes = this.impayes;
    if (!impayes.length) { this.toastr.info('Aucune facture impayée à simuler.', 'Analyse'); return; }
    const today = Date.now();
    const invoices = impayes.map(f => {
      const daysOverdue = Math.max(0, Math.floor((today - new Date(f.dateEcheance).getTime()) / 864e5));
      const prob = Math.min(0.95, Math.max(0.2, 0.95 - daysOverdue * 0.012)); // plus c'est en retard, moins ça paie
      return { montant: f.montantTTC, prob };
    });

    this.running = true; this.progress = 0; this.result = undefined;
    this.worker?.terminate();
    this.worker = new Worker(new URL('./montecarlo.worker', import.meta.url));
    this.worker.onmessage = ({ data }) => {
      if (data.type === 'progress') this.progress = data.value;
      else if (data.type === 'done') { this.result = data.result; this.running = false; this.worker?.terminate(); }
    };
    this.worker.postMessage({ invoices, runs: this.runs });
  }

  histPct(v: number): number {
    const max = Math.max(1, ...(this.result?.hist ?? [1]));
    return Math.round((v / max) * 100);
  }
  binLabel(i: number): string {
    if (!this.result) return '';
    const start = this.result.min + i * this.result.width;
    return Math.round(start / 1000) + 'k';
  }
}
