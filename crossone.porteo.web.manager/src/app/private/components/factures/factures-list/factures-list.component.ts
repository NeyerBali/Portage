import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { Facture, FACTURE_STATUTS } from 'src/app/shared/models';
import { FacturePopupComponent } from '../facture-popup/facture-popup.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { downloadCsv } from 'src/app/shared/utils/csv';

@Component({
  selector: 'app-factures-list',
  standalone: false,
  templateUrl: './factures-list.component.html',
  styleUrls: ['./factures-list.component.scss'],
})
export class FacturesListComponent implements OnInit {
  factures: Facture[] = [];
  loading = true;
  search = '';
  statutFilter: string | null = null;
  statuts = FACTURE_STATUTS;

  constructor(
    private api: ApiService, public auth: AuthService,
    private dialog: MatDialog, private toastr: ToastrService, private router: Router,
  ) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }

  open(f: Facture): void { this.router.navigate(['/factures', f.id]); }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.factures.list().subscribe({
      next: f => { this.factures = f; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  isOverdue(f: Facture): boolean {
    return f.statut === 'emise' && new Date(f.dateEcheance) < new Date();
  }

  get filtered(): Facture[] {
    return this.factures.filter(f => {
      const s = this.search.trim().toLowerCase();
      const matchSearch = !s || f.numero.toLowerCase().includes(s) || (f.clientNom || '').toLowerCase().includes(s) || (f.missionTitre || '').toLowerCase().includes(s);
      const matchStatut = !this.statutFilter || f.statut === this.statutFilter;
      return matchSearch && matchStatut;
    });
  }

  get encaisse(): number { return this.factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montantTTC, 0); }
  get emis(): number { return this.factures.filter(f => f.statut === 'emise').reduce((s, f) => s + f.montantTTC, 0); }
  get retard(): number { return this.factures.filter(f => this.isOverdue(f)).reduce((s, f) => s + f.montantTTC, 0); }

  create(): void {
    this.api.missions.list({ pageSize: 200 }).subscribe(res => {
      const ref = this.dialog.open(FacturePopupComponent, { panelClass: 'porteo-dialog', width: '640px', maxWidth: '95vw', data: { missions: res.items } });
      ref.afterClosed().subscribe(r => {
        if (r?.dto) this.api.factures.create(r.dto).subscribe(() => { this.toastr.success('Facture créée.'); this.load(); });
      });
    });
  }

  markPaid(f: Facture): void {
    this.api.factures.markPaid(f.id).subscribe(() => { this.toastr.success(`Facture ${f.numero} marquée payée.`); this.load(); });
  }

  relance(f: Facture): void {
    this.api.factures.relance(f.id).subscribe(res => { this.toastr.success(res.message, 'Relance envoyée'); });
  }

  downloadPdf(f: Facture): void {
    this.api.factures.downloadPdf(f.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${f.numero || 'facture'}.pdf`; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error('Téléchargement du PDF impossible.', 'Erreur'),
    });
  }

  exportCsv(): void {
    downloadCsv('factures-porteo.csv', this.filtered, [
      { key: 'numero', label: 'Numéro' }, { key: 'missionTitre', label: 'Mission' }, { key: 'clientNom', label: 'Client' },
      { key: 'dateEmission', label: 'Émise le' }, { key: 'dateEcheance', label: 'Échéance' },
      { key: 'statut', label: 'Statut' }, { key: 'montantHT', label: 'Montant HT' }, { key: 'montantTTC', label: 'Montant TTC' },
    ]);
    this.toastr.success('Export CSV généré.');
  }

  remove(f: Facture): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Supprimer la facture', message: `Supprimer la facture ${f.numero} ?`, confirmLabel: 'Supprimer', destructive: true },
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.api.factures.delete(f.id).subscribe(() => { this.toastr.success('Facture supprimée.'); this.load(); }); });
  }
}
