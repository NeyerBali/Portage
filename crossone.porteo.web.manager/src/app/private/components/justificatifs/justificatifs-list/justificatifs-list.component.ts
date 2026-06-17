import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { Justificatif, JUSTIF_STATUTS, justifTypeLabel } from 'src/app/shared/models';
import { JustificatifPopupComponent } from '../justificatif-popup/justificatif-popup.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { DocumentViewerComponent } from 'src/app/shared/components/document-viewer/document-viewer.component';

@Component({
  selector: 'app-justificatifs-list',
  standalone: false,
  templateUrl: './justificatifs-list.component.html',
  styleUrls: ['./justificatifs-list.component.scss'],
})
export class JustificatifsListComponent implements OnInit {
  justificatifs: Justificatif[] = [];
  loading = true;
  statutFilter: string | null = null;
  statuts = JUSTIF_STATUTS;
  typeLabel = justifTypeLabel;

  constructor(
    private api: ApiService, public auth: AuthService,
    private dialog: MatDialog, private toastr: ToastrService,
  ) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.justificatifs.list().subscribe({
      next: j => { this.justificatifs = j; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  get filtered(): Justificatif[] {
    return this.statutFilter ? this.justificatifs.filter(j => j.statut === this.statutFilter) : this.justificatifs;
  }

  get pendingCount(): number { return this.justificatifs.filter(j => j.statut === 'en_attente').length; }

  add(): void {
    this.api.missions.list({ pageSize: 200 }).subscribe(res => {
      const ref = this.dialog.open(JustificatifPopupComponent, {
        panelClass: 'porteo-dialog', width: '880px', maxWidth: '96vw',
        data: { missions: res.items, justificatifs: this.justificatifs },
      });
      ref.afterClosed().subscribe(r => {
        if (r?.form) {
          this.api.justificatifs.create(r.form, r.file).subscribe({
            next: () => { this.toastr.success('Justificatif déposé.'); this.load(); },
          });
        }
      });
    });
  }

  validate(j: Justificatif): void {
    this.api.justificatifs.validate(j.id).subscribe(() => { this.toastr.success(`« ${j.libelle} » validé.`); this.load(); });
  }

  reject(j: Justificatif): void {
    const motif = window.prompt('Motif du refus (optionnel) :', '');
    if (motif === null) return;
    this.api.justificatifs.reject(j.id, motif).subscribe(() => { this.toastr.success(`« ${j.libelle} » refusé.`); this.load(); });
  }

  remove(j: Justificatif): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Supprimer le justificatif', message: `Supprimer « ${j.libelle} » ?`, confirmLabel: 'Supprimer', destructive: true },
    }).afterClosed().subscribe(ok => {
      if (ok) this.api.justificatifs.delete(j.id).subscribe(() => { this.toastr.success('Justificatif supprimé.'); this.load(); });
    });
  }

  download(j: Justificatif): void {
    this.api.justificatifs.download(j.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = j.fileName || `justificatif-${j.id}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /** Aperçu de la pièce jointe dans la visionneuse (image zoomable / PDF intégré). */
  view(j: Justificatif): void {
    if (!j.hasFile) { this.toastr.info('Aucune pièce jointe à afficher.', 'Justificatif'); return; }
    this.api.justificatifs.download(j.id).subscribe({
      next: blob => this.dialog.open(DocumentViewerComponent, {
        panelClass: 'porteo-dialog', maxWidth: '96vw',
        data: { blob, fileName: j.fileName || `justificatif-${j.id}`, contentType: blob.type },
      }),
      error: () => this.toastr.error('Impossible de charger le document.', 'Erreur'),
    });
  }
}
