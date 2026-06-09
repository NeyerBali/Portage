import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../http/api.service';
import { AlertCategory } from 'src/app/shared/models';

@Component({
  selector: 'app-alertes',
  standalone: false,
  templateUrl: './alertes.component.html',
  styleUrls: ['./alertes.component.scss'],
})
export class AlertesComponent implements OnInit {
  categories: AlertCategory[] = [];
  loading = true;
  toneFilter: 'all' | 'danger' | 'warn' | 'info' = 'all';
  expanded: Record<string, boolean> = {};

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.alerts.alerts().subscribe({
      next: c => {
        this.categories = c;
        c.forEach((cat, i) => (this.expanded[cat.cle] = i < 2)); // ouvre les 2 premières
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get visible(): AlertCategory[] {
    return this.toneFilter === 'all' ? this.categories : this.categories.filter(c => c.tone === this.toneFilter);
  }
  get totalCount(): number { return this.categories.reduce((s, c) => s + c.count, 0); }

  icon(c: AlertCategory): string {
    return { invoice: '▤', wallet: '€', briefcase: '◆', file: '📎' }[c.icon] ?? '⚠';
  }

  toggle(cle: string): void { this.expanded[cle] = !this.expanded[cle]; }
  go(route?: string): void { if (route) this.router.navigateByUrl(route); }
}
