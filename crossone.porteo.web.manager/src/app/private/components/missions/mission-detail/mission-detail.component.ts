import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { Client, Consultant, MissionDetail } from 'src/app/shared/models';
import { MissionPopupComponent } from '../mission-popup/mission-popup.component';
import { FacturePopupComponent } from '../../factures/facture-popup/facture-popup.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mission-detail',
  standalone: false,
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
})
export class MissionDetailComponent implements OnInit {
  mission?: MissionDetail;
  loading = true;
  tab: 'infos' | 'factures' | 'timeline' = 'infos';
  private clients: Client[] = [];
  private consultants: Consultant[] = [];

  constructor(
    private route: ActivatedRoute, private router: Router, private api: ApiService,
    public auth: AuthService, private dialog: MatDialog, private toastr: ToastrService,
  ) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }

  ngOnInit(): void {
    this.load();
    if (this.isAdmin) {
      this.api.clients.list().subscribe(c => (this.clients = c));
      this.api.consultants.list().subscribe(c => (this.consultants = c));
    }
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.api.missions.get(id).subscribe({
      next: m => { this.mission = m; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  get billed(): number {
    return (this.mission?.factures ?? []).filter(f => f.statut === 'payee').reduce((s, f) => s + f.montantHT, 0);
  }
  get progress(): number {
    if (!this.mission?.montant) return 0;
    return Math.min(100, Math.round((this.billed / this.mission.montant) * 100));
  }

  get timeline() {
    const m = this.mission!;
    const f0 = m.factures?.[0];
    return [
      { ic: '＋', t: 'Mission créée', d: 'Brouillon initialisé', when: m.dateDebut },
      { ic: '✓', t: 'Mission validée', d: 'Passée « En cours »', when: m.dateDebut },
      { ic: '▤', t: 'Première facture émise', d: f0 ? f0.numero : '—', when: f0 ? f0.dateEmission : null },
      { ic: '◷', t: 'Échéance prévue', d: 'Fin de mission', when: m.dateFin },
    ];
  }

  edit(): void {
    const ref = this.dialog.open(MissionPopupComponent, {
      panelClass: 'porteo-dialog', width: '720px', maxWidth: '95vw',
      data: { mission: this.mission, clients: this.clients, consultants: this.consultants },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.dto && this.mission) this.api.missions.update(this.mission.id, res.dto).subscribe(() => { this.toastr.success('Mission mise à jour.'); this.load(); });
    });
  }

  remove(): void {
    if (!this.mission) return;
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Supprimer la mission', message: `Confirmer la suppression de « ${this.mission.titre} » ?`, confirmLabel: 'Supprimer', destructive: true },
    }).afterClosed().subscribe(ok => {
      if (ok && this.mission) this.api.missions.delete(this.mission.id).subscribe(() => { this.toastr.success('Mission supprimée.'); this.router.navigate(['/missions']); });
    });
  }

  /** Crée une facture directement rattachée à cette mission, puis recharge la fiche. */
  newFacture(): void {
    if (!this.mission) return;
    const ref = this.dialog.open(FacturePopupComponent, {
      panelClass: 'porteo-dialog', width: '640px', maxWidth: '95vw',
      data: { missions: [this.mission], preselectMissionId: this.mission.id },
    });
    ref.afterClosed().subscribe(r => {
      if (r?.dto) this.api.factures.create(r.dto).subscribe(() => { this.toastr.success('Facture créée et rattachée à la mission.'); this.load(); });
    });
  }

  openClient(): void { if (this.isAdmin && this.mission) this.router.navigate(['/clients', this.mission.clientId]); }
  openConsultant(): void { if (this.isAdmin && this.mission) this.router.navigate(['/consultants', this.mission.consultantId]); }
  back(): void { this.router.navigate(['/missions']); }
}
