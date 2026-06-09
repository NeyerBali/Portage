import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../http/api.service';
import { Activity } from 'src/app/shared/models';

@Component({
  selector: 'app-journal',
  standalone: false,
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
})
export class JournalComponent implements OnInit {
  activities: Activity[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.alerts.activities().subscribe({
      next: a => { this.activities = a; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  icon(type: string): string {
    return {
      mission_created: '◆', facture_created: '▤', facture_paid: '✓',
      facture_relance: '✉', justif_created: '📎', justif_validated: '✓', justif_rejected: '✕',
    }[type] ?? '•';
  }

  tone(type: string): string {
    if (type.includes('rejected')) return 'error';
    if (type.includes('paid') || type.includes('validated')) return 'success';
    if (type.includes('relance')) return 'warn';
    return 'info';
  }
}
