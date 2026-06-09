import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../http/api.service';
import { ClientDetail, Mission } from 'src/app/shared/models';

@Component({
  selector: 'app-client-detail',
  standalone: false,
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  client?: ClientDetail;
  loading = true;
  filter: 'all' | 'en_cours' | 'facturee' | 'terminee' = 'all';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.clients.get(id).subscribe({
      next: c => { this.client = c; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  get missions(): Mission[] {
    if (!this.client) return [];
    if (this.filter === 'all') return this.client.missions;
    return this.client.missions.filter(m => m.statut === this.filter);
  }

  back(): void { this.router.navigate(['/clients']); }
}
