import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../http/api.service';
import { Client } from 'src/app/shared/models';
import { ClientPopupComponent } from '../client-popup/client-popup.component';

@Component({
  selector: 'app-clients-list',
  standalone: false,
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit {
  clients: Client[] = [];
  loading = true;
  search = '';

  constructor(private api: ApiService, private router: Router, private dialog: MatDialog, private toastr: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.clients.list().subscribe({
      next: c => { this.clients = c; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  get filtered(): Client[] {
    const s = this.search.trim().toLowerCase();
    if (!s) return this.clients;
    return this.clients.filter(c =>
      c.raisonSociale.toLowerCase().includes(s) || c.secteur.toLowerCase().includes(s) || c.ville.toLowerCase().includes(s));
  }

  open(c: Client): void { this.router.navigate(['/clients', c.id]); }

  create(): void {
    const ref = this.dialog.open(ClientPopupComponent, { panelClass: 'porteo-dialog', width: '620px', maxWidth: '95vw', data: { client: null } });
    ref.afterClosed().subscribe(res => {
      if (res?.dto) this.api.clients.create(res.dto).subscribe(() => { this.toastr.success('Client créé.'); this.load(); });
    });
  }
}
