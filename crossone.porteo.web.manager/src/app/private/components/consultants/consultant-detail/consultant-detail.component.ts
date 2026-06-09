import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../http/api.service';
import { ConsultantDetail } from 'src/app/shared/models';
import { ConsultantPopupComponent } from '../consultant-popup/consultant-popup.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-consultant-detail',
  standalone: false,
  templateUrl: './consultant-detail.component.html',
  styleUrls: ['./consultant-detail.component.scss'],
})
export class ConsultantDetailComponent implements OnInit {
  consultant?: ConsultantDetail;
  loading = true;

  constructor(
    private route: ActivatedRoute, private api: ApiService, private router: Router,
    private dialog: MatDialog, private toastr: ToastrService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.consultants.get(id).subscribe({
      next: c => { this.consultant = c; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  competences(): string[] {
    return (this.consultant?.competences || '').split(',').map(x => x.trim()).filter(Boolean);
  }

  get occupation(): number {
    if (!this.consultant?.nombreMissions) return 0;
    return Math.round((this.consultant.missionsActives / this.consultant.nombreMissions) * 100);
  }

  initials(): string {
    const c = this.consultant; return c ? ((c.prenom[0] || '') + (c.nom[0] || '')).toUpperCase() : '?';
  }

  edit(): void {
    const ref = this.dialog.open(ConsultantPopupComponent, { panelClass: 'porteo-dialog', width: '640px', maxWidth: '95vw', data: { consultant: this.consultant } });
    ref.afterClosed().subscribe(res => {
      if (res?.dto && this.consultant) this.api.consultants.update(this.consultant.id, res.dto).subscribe(() => { this.toastr.success('Consultant mis à jour.'); this.load(); });
    });
  }

  remove(): void {
    if (!this.consultant) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Supprimer le consultant', message: `Supprimer ${this.consultant.prenom} ${this.consultant.nom} ?`, confirmLabel: 'Supprimer', destructive: true },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok && this.consultant) this.api.consultants.delete(this.consultant.id).subscribe(() => { this.toastr.success('Consultant supprimé.'); this.router.navigate(['/consultants']); });
    });
  }

  back(): void { this.router.navigate(['/consultants']); }
}
