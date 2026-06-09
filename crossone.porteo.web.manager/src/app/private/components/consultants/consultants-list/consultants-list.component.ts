import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../http/api.service';
import { Consultant } from 'src/app/shared/models';
import { ConsultantPopupComponent } from '../consultant-popup/consultant-popup.component';

@Component({
  selector: 'app-consultants-list',
  standalone: false,
  templateUrl: './consultants-list.component.html',
  styleUrls: ['./consultants-list.component.scss'],
})
export class ConsultantsListComponent implements OnInit {
  consultants: Consultant[] = [];
  loading = true;
  search = '';

  constructor(private api: ApiService, private router: Router, private dialog: MatDialog, private toastr: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.consultants.list().subscribe({
      next: c => { this.consultants = c; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  get filtered(): Consultant[] {
    const s = this.search.trim().toLowerCase();
    if (!s) return this.consultants;
    return this.consultants.filter(c =>
      `${c.prenom} ${c.nom}`.toLowerCase().includes(s) || c.specialite.toLowerCase().includes(s) || c.ville.toLowerCase().includes(s));
  }

  competences(c: Consultant): string[] {
    return (c.competences || '').split(',').map(x => x.trim()).filter(Boolean);
  }

  initials(c: Consultant): string { return ((c.prenom[0] || '') + (c.nom[0] || '')).toUpperCase(); }

  open(c: Consultant): void { this.router.navigate(['/consultants', c.id]); }

  create(): void {
    const ref = this.dialog.open(ConsultantPopupComponent, { panelClass: 'porteo-dialog', width: '640px', maxWidth: '95vw', data: { consultant: null } });
    ref.afterClosed().subscribe(res => {
      if (res?.dto) this.api.consultants.create(res.dto).subscribe(() => { this.toastr.success('Consultant créé.'); this.load(); });
    });
  }
}
