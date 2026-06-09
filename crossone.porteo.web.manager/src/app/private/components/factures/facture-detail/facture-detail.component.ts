import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { Facture } from 'src/app/shared/models';

@Component({
  selector: 'app-facture-detail',
  standalone: false,
  templateUrl: './facture-detail.component.html',
  styleUrls: ['./facture-detail.component.scss'],
})
export class FactureDetailComponent implements OnInit {
  facture?: Facture;
  loading = true;

  constructor(
    private route: ActivatedRoute, private router: Router, private api: ApiService,
    public auth: AuthService, private toastr: ToastrService,
  ) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get isOverdue(): boolean {
    return !!this.facture && this.facture.statut === 'emise' && new Date(this.facture.dateEcheance) < new Date();
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.api.factures.get(id).subscribe({
      next: f => { this.facture = f; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  markPaid(): void {
    if (!this.facture) return;
    this.api.factures.markPaid(this.facture.id).subscribe(f => { this.facture = f; this.toastr.success('Facture marquée payée.'); });
  }

  pdf(): void { this.toastr.info('Génération PDF non disponible dans cette démonstration.', 'PDF'); }
  openMission(): void { if (this.facture) this.router.navigate(['/missions', this.facture.missionId]); }
  openClient(): void { if (this.isAdmin && this.facture?.clientId) this.router.navigate(['/clients', this.facture.clientId]); }
  back(): void { this.router.navigate(['/factures']); }
}
